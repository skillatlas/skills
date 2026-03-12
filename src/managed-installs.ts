import { spawnSync } from "node:child_process";
import { appendFile, mkdir, open, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { homedir, platform } from "node:os";
import envPaths from "env-paths";

export const MANAGED_SKILL_REPO = "skillatlas/skills";
export const MANAGED_INDEX_URL = "https://skillatlas.sh/.well-known/skills/index.json";

type Scope = {
  type: "global" | "project";
  projectRoot?: string;
};

type AgentSelection = {
  mode: "auto" | "explicit";
  selected: string[];
};

type InstalledSkillRecord = {
  version: string;
  files: string[];
};

type RegistryInstall = {
  id: string;
  source: {
    repo: string;
    feed: string;
  };
  scope: Scope;
  agents: AgentSelection;
  selection: {
    mode: "all";
    skills: [];
  };
  autoUpdate: {
    enabled: boolean;
  };
  installed: {
    skills: Record<string, InstalledSkillRecord>;
    lastCheckedAt?: string;
    lastUpdatedAt?: string;
  };
};

type RegistryFile = {
  version: 1;
  installs: RegistryInstall[];
};

type FeedSkill = {
  name: string;
  version: string;
  description: string;
  files: string[];
};

type FeedIndex = {
  version: number;
  skills: FeedSkill[];
};

type ParsedInstallOptions = {
  autoUpdate: boolean;
  scope: Scope;
  agents: AgentSelection;
};

type ParsedUpdateOptions = {
  scope?: Scope;
  dryRun: boolean;
  quiet: boolean;
  scheduled: boolean;
};

type SchedulerAction = "install" | "remove" | "status";

type SchedulerStatus = {
  installed: boolean;
  detail: string;
};

type RunSkills = (args: string[], options?: { quiet?: boolean }) => Promise<void>;

const REGISTRY_VERSION = 1;
const SCHEDULER_NAME = "skillatlas-auto-update";
const SCHEDULED_LOCK_MAX_AGE_MS = 1000 * 60 * 60 * 24;
const AUTO_DETECTED_AGENTS = [
  { id: "claude-code", marker: path.join(homedir(), ".claude") },
  { id: "openclaw", marker: path.join(homedir(), ".openclaw") },
] as const;
const APP_PATHS = envPaths("skillatlas", { suffix: "" });
const REGISTRY_PATH = path.join(APP_PATHS.data, "registry.v1.json");
const SETTINGS_PATH = path.join(APP_PATHS.config, "settings.json");
const INDEX_CACHE_PATH = path.join(APP_PATHS.cache, "index-cache.json");
const LOG_PATH = path.join(APP_PATHS.log, "auto-update.log");
const SCHEDULED_LOCK_PATH = path.join(APP_PATHS.cache, "scheduled-update.lock");

function createEmptyRegistry(): RegistryFile {
  return {
    version: REGISTRY_VERSION,
    installs: [],
  };
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureParentDir(targetPath: string): Promise<void> {
  await mkdir(path.dirname(targetPath), { recursive: true });
}

async function readRegistry(): Promise<RegistryFile> {
  try {
    const content = await readFile(REGISTRY_PATH, "utf8");
    const parsed = JSON.parse(content) as RegistryFile;

    if (parsed.version !== REGISTRY_VERSION || !Array.isArray(parsed.installs)) {
      return createEmptyRegistry();
    }

    return parsed;
  } catch {
    return createEmptyRegistry();
  }
}

async function writeRegistry(registry: RegistryFile): Promise<void> {
  const sortedInstalls = [...registry.installs].sort((left, right) => {
    if (left.scope.type !== right.scope.type) {
      return left.scope.type.localeCompare(right.scope.type);
    }

    return (left.scope.projectRoot ?? "").localeCompare(right.scope.projectRoot ?? "");
  });

  await ensureParentDir(REGISTRY_PATH);
  await writeFile(
    REGISTRY_PATH,
    `${JSON.stringify({ version: REGISTRY_VERSION, installs: sortedInstalls }, null, 2)}\n`,
    "utf8"
  );
}

function sameScope(left: Scope, right: Scope): boolean {
  if (left.type !== right.type) {
    return false;
  }

  if (left.type === "project" && right.type === "project") {
    return left.projectRoot === right.projectRoot;
  }

  return true;
}

function validateFeedSkill(entry: unknown): entry is FeedSkill {
  if (!entry || typeof entry !== "object") {
    return false;
  }

  const skill = entry as Record<string, unknown>;

  if (typeof skill.name !== "string" || skill.name.trim().length === 0) {
    return false;
  }

  if (typeof skill.version !== "string" || skill.version.trim().length === 0) {
    return false;
  }

  if (typeof skill.description !== "string" || skill.description.trim().length === 0) {
    return false;
  }

  if (!Array.isArray(skill.files) || skill.files.length === 0) {
    return false;
  }

  return skill.files.every((file) => typeof file === "string" && file.length > 0 && !file.includes("..")) &&
    skill.files.includes("SKILL.md");
}

async function fetchIndex(): Promise<FeedIndex> {
  const response = await fetch(MANAGED_INDEX_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${MANAGED_INDEX_URL}: ${response.status}`);
  }

  const parsed = (await response.json()) as FeedIndex;

  if (typeof parsed.version !== "number" || !Array.isArray(parsed.skills)) {
    throw new Error(`Invalid index format from ${MANAGED_INDEX_URL}`);
  }

  for (const skill of parsed.skills) {
    if (!validateFeedSkill(skill)) {
      throw new Error(`Invalid skill entry in ${MANAGED_INDEX_URL}`);
    }
  }

  await ensureParentDir(INDEX_CACHE_PATH);
  await writeFile(INDEX_CACHE_PATH, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
  return parsed;
}

function mergeInstalledSkills(
  currentSkills: Record<string, InstalledSkillRecord>,
  index: FeedIndex,
  includeNewSkills: boolean
): Record<string, InstalledSkillRecord> {
  const remoteByName = new Map(index.skills.map((skill) => [skill.name, skill] as const));
  const nextSkills = new Map<string, InstalledSkillRecord>();

  for (const skillName of Object.keys(currentSkills).sort((left, right) => left.localeCompare(right))) {
    const remoteSkill = remoteByName.get(skillName);

    nextSkills.set(
      skillName,
      remoteSkill
        ? {
            version: remoteSkill.version,
            files: [...remoteSkill.files].sort((leftFile, rightFile) => leftFile.localeCompare(rightFile)),
          }
        : currentSkills[skillName]
    );
  }

  if (includeNewSkills) {
    for (const remoteSkill of [...index.skills].sort((left, right) => left.name.localeCompare(right.name))) {
      if (nextSkills.has(remoteSkill.name)) {
        continue;
      }

      nextSkills.set(remoteSkill.name, {
        version: remoteSkill.version,
        files: [...remoteSkill.files].sort((leftFile, rightFile) => leftFile.localeCompare(rightFile)),
      });
    }
  }

  return Object.fromEntries(nextSkills);
}

function parseAgentValues(args: string[], startIndex: number): { values: string[]; nextIndex: number } {
  const values: string[] = [];
  let index = startIndex;

  while (index < args.length && !args[index].startsWith("-")) {
    values.push(args[index]);
    index += 1;
  }

  if (values.length === 0) {
    throw new Error("Expected one or more values after --agent");
  }

  return {
    values,
    nextIndex: index - 1,
  };
}

async function detectAgents(): Promise<string[]> {
  const selected: string[] = [];

  for (const candidate of AUTO_DETECTED_AGENTS) {
    if (await pathExists(candidate.marker)) {
      selected.push(candidate.id);
    }
  }

  return selected;
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)];
}

function buildProjectScope(): Scope {
  return {
    type: "project",
    projectRoot: process.cwd(),
  };
}

function parseInstallOptions(args: string[]): ParsedInstallOptions {
  let autoUpdate = false;
  let scope: Scope = { type: "global" };
  let explicitAgents: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--auto-update") {
      autoUpdate = true;
      continue;
    }

    if (arg === "--project") {
      scope = buildProjectScope();
      continue;
    }

    if (arg === "-a" || arg === "--agent") {
      const { values, nextIndex } = parseAgentValues(args, index + 1);
      explicitAgents.push(...values);
      index = nextIndex;
      continue;
    }

    if (arg.startsWith("--agent=")) {
      explicitAgents.push(arg.slice("--agent=".length));
      continue;
    }

    throw new Error(`Unknown install option: ${arg}`);
  }

  if (explicitAgents.length > 0) {
    return {
      autoUpdate,
      scope,
      agents: {
        mode: "explicit",
        selected: uniqueStrings(explicitAgents),
      },
    };
  }

  return {
    autoUpdate,
    scope,
    agents: {
      mode: "auto",
      selected: [],
    },
  };
}

function parseUpdateOptions(args: string[]): ParsedUpdateOptions {
  let scope: Scope | undefined;
  let dryRun = false;
  let quiet = false;
  let scheduled = false;

  for (const arg of args) {
    if (arg === "--project") {
      scope = buildProjectScope();
      continue;
    }

    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (arg === "--quiet") {
      quiet = true;
      continue;
    }

    if (arg === "--scheduled") {
      scheduled = true;
      quiet = true;
      continue;
    }

    throw new Error(`Unknown update option: ${arg}`);
  }

  return {
    scope,
    dryRun,
    quiet,
    scheduled,
  };
}

function buildInstallArgs(scope: Scope, agents: string[], trackedSkills?: string[]): string[] {
  return [
    "add",
    MANAGED_SKILL_REPO,
    "-y",
    ...(scope.type === "global" ? ["-g"] : []),
    ...(trackedSkills && trackedSkills.length > 0 ? ["--skill", ...trackedSkills] : ["--all"]),
    ...agents.flatMap((agent) => ["--agent", agent]),
  ];
}

function formatScope(scope: Scope): string {
  return scope.type === "global" ? "global" : `project:${scope.projectRoot}`;
}

async function ensureSelectedAgents(selection: AgentSelection): Promise<AgentSelection> {
  if (selection.mode === "explicit") {
    if (selection.selected.length === 0) {
      throw new Error("At least one agent must be specified with --agent");
    }

    return {
      mode: "explicit",
      selected: uniqueStrings(selection.selected),
    };
  }

  const detected = await detectAgents();

  if (detected.length === 0) {
    throw new Error("No supported agents detected. Use --agent to select agents explicitly.");
  }

  return {
    mode: "auto",
    selected: detected,
  };
}

function createInstallEntry(scope: Scope, agents: AgentSelection, autoUpdate: boolean, index: FeedIndex): RegistryInstall {
  const timestamp = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    source: {
      repo: MANAGED_SKILL_REPO,
      feed: MANAGED_INDEX_URL,
    },
    scope,
    agents,
    selection: {
      mode: "all",
      skills: [],
    },
    autoUpdate: {
      enabled: autoUpdate,
    },
      installed: {
      skills: mergeInstalledSkills({}, index, true),
      lastCheckedAt: timestamp,
      lastUpdatedAt: timestamp,
    },
  };
}

function diffInstall(entry: RegistryInstall, index: FeedIndex): { updates: string[]; additions: string[] } {
  const currentSkills = entry.installed.skills;
  const updates: string[] = [];
  const additions: string[] = [];

  for (const remoteSkill of index.skills) {
    const installedSkill = currentSkills[remoteSkill.name];

    if (installedSkill) {
      if (installedSkill.version !== remoteSkill.version) {
        updates.push(remoteSkill.name);
      }
      continue;
    }

    if (entry.autoUpdate.enabled) {
      additions.push(remoteSkill.name);
    }
  }

  return {
    updates,
    additions,
  };
}

function replaceInstallEntry(registry: RegistryFile, nextEntry: RegistryInstall): RegistryFile {
  const installs = registry.installs.filter((entry) => !sameScope(entry.scope, nextEntry.scope));
  installs.push(nextEntry);
  return {
    version: REGISTRY_VERSION,
    installs,
  };
}

function updateInstallTimestamps(entry: RegistryInstall, index: FeedIndex, didUpdate: boolean): RegistryInstall {
  const now = new Date().toISOString();

  return {
    ...entry,
    installed: {
      skills: mergeInstalledSkills(entry.installed.skills, index, entry.autoUpdate.enabled),
      lastCheckedAt: now,
      lastUpdatedAt: didUpdate ? now : entry.installed.lastUpdatedAt ?? now,
    },
  };
}

async function appendSchedulerLog(message: string): Promise<void> {
  const timestamp = new Date().toISOString();
  await ensureParentDir(LOG_PATH);
  await appendFile(LOG_PATH, `[${timestamp}] ${message}\n`, "utf8");
}

async function acquireScheduledLock(): Promise<boolean> {
  try {
    await ensureParentDir(SCHEDULED_LOCK_PATH);
    const file = await open(SCHEDULED_LOCK_PATH, "wx");
    await file.writeFile(JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() }));
    await file.close();
    return true;
  } catch {
    try {
      const lockStat = await stat(SCHEDULED_LOCK_PATH);
      if (Date.now() - lockStat.mtimeMs > SCHEDULED_LOCK_MAX_AGE_MS) {
        await rm(SCHEDULED_LOCK_PATH, { force: true });
        return await acquireScheduledLock();
      }
    } catch {
      return false;
    }

    return false;
  }
}

async function releaseScheduledLock(): Promise<void> {
  await rm(SCHEDULED_LOCK_PATH, { force: true });
}

async function maybeWaitForScheduledJitter(scheduled: boolean): Promise<void> {
  if (!scheduled || process.env.SKILLATLAS_NO_RANDOM_DELAY === "1") {
    return;
  }

  const delayMs = Math.floor(Math.random() * 5 * 60 * 1000);
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

function getScopeEntries(registry: RegistryFile, scope?: Scope): RegistryInstall[] {
  if (!scope) {
    return registry.installs;
  }

  return registry.installs.filter((entry) => sameScope(entry.scope, scope));
}

function describeChanges(entry: RegistryInstall, updates: string[], additions: string[]): string {
  const parts: string[] = [];

  if (updates.length > 0) {
    parts.push(`${updates.length} update${updates.length === 1 ? "" : "s"}`);
  }

  if (additions.length > 0) {
    parts.push(`${additions.length} new skill${additions.length === 1 ? "" : "s"}`);
  }

  return `${formatScope(entry.scope)} (${parts.join(", ") || "no changes"})`;
}

function runSystemCommand(command: string, args: string[], failureMessage: string): string {
  const result = spawnSync(command, args, { encoding: "utf8" });

  if (result.status !== 0) {
    const message = result.stderr.trim() || result.stdout.trim() || failureMessage;
    throw new Error(message);
  }

  return result.stdout.trim();
}

function getSchedulerCommand(): string {
  return "npx skillatlas update --quiet --scheduled";
}

async function installMacScheduler(): Promise<void> {
  const plistPath = path.join(homedir(), "Library", "LaunchAgents", "sh.skillatlas.auto-update.plist");
  const logPath = LOG_PATH.replace(/&/g, "&amp;");
  const command = getSchedulerCommand().replace(/&/g, "&amp;");
  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>sh.skillatlas.auto-update</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/zsh</string>
    <string>-lc</string>
    <string>${command}</string>
  </array>
  <key>StartInterval</key>
  <integer>43200</integer>
  <key>StandardOutPath</key>
  <string>${logPath}</string>
  <key>StandardErrorPath</key>
  <string>${logPath}</string>
</dict>
</plist>
`;

  await ensureParentDir(plistPath);
  await writeFile(plistPath, plist, "utf8");
  spawnSync("launchctl", ["unload", plistPath], { stdio: "ignore" });
  runSystemCommand("launchctl", ["load", plistPath], "Failed to load LaunchAgent");
}

async function removeMacScheduler(): Promise<void> {
  const plistPath = path.join(homedir(), "Library", "LaunchAgents", "sh.skillatlas.auto-update.plist");
  spawnSync("launchctl", ["unload", plistPath], { stdio: "ignore" });
  await rm(plistPath, { force: true });
}

async function getMacSchedulerStatus(): Promise<SchedulerStatus> {
  const plistPath = path.join(homedir(), "Library", "LaunchAgents", "sh.skillatlas.auto-update.plist");
  const installed = await pathExists(plistPath);
  return {
    installed,
    detail: plistPath,
  };
}

async function installLinuxScheduler(): Promise<void> {
  const userSystemdDir = path.join(homedir(), ".config", "systemd", "user");
  const servicePath = path.join(userSystemdDir, `${SCHEDULER_NAME}.service`);
  const timerPath = path.join(userSystemdDir, `${SCHEDULER_NAME}.timer`);
  const service = `[Unit]
Description=Skill Atlas scheduled auto-update

[Service]
Type=oneshot
ExecStart=/bin/sh -lc '${getSchedulerCommand()}'
`;
  const timer = `[Unit]
Description=Run Skill Atlas auto-update every 12 hours

[Timer]
OnBootSec=5m
OnUnitActiveSec=12h
RandomizedDelaySec=5m
Unit=${SCHEDULER_NAME}.service

[Install]
WantedBy=timers.target
`;

  await mkdir(userSystemdDir, { recursive: true });
  await writeFile(servicePath, service, "utf8");
  await writeFile(timerPath, timer, "utf8");
  runSystemCommand("systemctl", ["--user", "daemon-reload"], "Failed to reload systemd user services");
  runSystemCommand("systemctl", ["--user", "enable", "--now", `${SCHEDULER_NAME}.timer`], "Failed to enable timer");
}

async function removeLinuxScheduler(): Promise<void> {
  const userSystemdDir = path.join(homedir(), ".config", "systemd", "user");
  const servicePath = path.join(userSystemdDir, `${SCHEDULER_NAME}.service`);
  const timerPath = path.join(userSystemdDir, `${SCHEDULER_NAME}.timer`);

  spawnSync("systemctl", ["--user", "disable", "--now", `${SCHEDULER_NAME}.timer`], { stdio: "ignore" });
  await rm(servicePath, { force: true });
  await rm(timerPath, { force: true });
  runSystemCommand("systemctl", ["--user", "daemon-reload"], "Failed to reload systemd user services");
}

async function getLinuxSchedulerStatus(): Promise<SchedulerStatus> {
  const timerPath = path.join(homedir(), ".config", "systemd", "user", `${SCHEDULER_NAME}.timer`);
  const installed = await pathExists(timerPath);
  return {
    installed,
    detail: timerPath,
  };
}

async function installWindowsScheduler(): Promise<void> {
  runSystemCommand(
    "schtasks",
    [
      "/Create",
      "/F",
      "/TN",
      SCHEDULER_NAME,
      "/SC",
      "HOURLY",
      "/MO",
      "12",
      "/TR",
      `cmd /c ${getSchedulerCommand()}`,
    ],
    "Failed to create Windows scheduled task"
  );
}

async function removeWindowsScheduler(): Promise<void> {
  spawnSync("schtasks", ["/Delete", "/F", "/TN", SCHEDULER_NAME], { stdio: "ignore" });
}

async function getWindowsSchedulerStatus(): Promise<SchedulerStatus> {
  const result = spawnSync("schtasks", ["/Query", "/TN", SCHEDULER_NAME], { encoding: "utf8" });
  return {
    installed: result.status === 0,
    detail: SCHEDULER_NAME,
  };
}

async function getSchedulerStatus(): Promise<SchedulerStatus> {
  switch (platform()) {
    case "darwin":
      return getMacSchedulerStatus();
    case "linux":
      return getLinuxSchedulerStatus();
    case "win32":
      return getWindowsSchedulerStatus();
    default:
      throw new Error(`Scheduler is not supported on ${platform()}`);
  }
}

export async function runManagedInstall(args: string[], runSkills: RunSkills): Promise<void> {
  const parsed = parseInstallOptions(args);
  const agents = await ensureSelectedAgents(parsed.agents);
  const index = await fetchIndex();
  const installArgs = buildInstallArgs(parsed.scope, agents.selected);

  await runSkills(installArgs);

  const registry = await readRegistry();
  const nextEntry = createInstallEntry(parsed.scope, agents, parsed.autoUpdate, index);
  await writeRegistry(replaceInstallEntry(registry, nextEntry));
  await ensureParentDir(SETTINGS_PATH);
  await writeFile(SETTINGS_PATH, `${JSON.stringify({ sourceRepo: MANAGED_SKILL_REPO }, null, 2)}\n`, "utf8");

  console.log(`Tracked Skill Atlas install for ${formatScope(parsed.scope)} (${agents.selected.join(", ")})`);
}

export async function runManagedUpdate(args: string[], runSkills: RunSkills): Promise<void> {
  const options = parseUpdateOptions(args);

  if (options.scheduled) {
    await maybeWaitForScheduledJitter(true);
    const acquired = await acquireScheduledLock();

    if (!acquired) {
      return;
    }

    try {
      await runManagedUpdateInner(options, runSkills);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await appendSchedulerLog(message);
      throw error;
    } finally {
      await releaseScheduledLock();
    }

    return;
  }

  await runManagedUpdateInner(options, runSkills);
}

async function runManagedUpdateInner(options: ParsedUpdateOptions, runSkills: RunSkills): Promise<void> {
  const registry = await readRegistry();
  const entries = getScopeEntries(registry, options.scope);

  if (entries.length === 0) {
    if (!options.quiet) {
      console.log("No tracked Skill Atlas installs.");
    }
    return;
  }

  const index = await fetchIndex();
  const nextRegistry: RegistryFile = {
    version: REGISTRY_VERSION,
    installs: [...registry.installs],
  };

  const changes = entries.map((entry) => ({
    entry,
    diff: diffInstall(entry, index),
  }));

  const actionable = changes.filter(({ diff }) => diff.updates.length > 0 || diff.additions.length > 0);

  if (options.dryRun) {
    for (const { entry, diff } of changes) {
      console.log(describeChanges(entry, diff.updates, diff.additions));
      if (diff.updates.length > 0) {
        console.log(`  updates: ${diff.updates.join(", ")}`);
      }
      if (diff.additions.length > 0) {
        console.log(`  additions: ${diff.additions.join(", ")}`);
      }
    }
    return;
  }

  if (actionable.length === 0) {
    const refreshedInstalls = nextRegistry.installs.map((entry) => {
      if (!entries.some((candidate) => candidate.id === entry.id)) {
        return entry;
      }

      return updateInstallTimestamps(entry, index, false);
    });

    await writeRegistry({ version: REGISTRY_VERSION, installs: refreshedInstalls });

    if (!options.quiet) {
      console.log("All tracked Skill Atlas installs are up to date.");
    }
    return;
  }

  for (const { entry } of actionable) {
    const installArgs = buildInstallArgs(
      entry.scope,
      entry.agents.selected,
      entry.autoUpdate.enabled ? undefined : Object.keys(entry.installed.skills).sort((left, right) => left.localeCompare(right))
    );
    await runSkills(installArgs, { quiet: options.quiet });
    const updatedEntry = updateInstallTimestamps(entry, index, true);
    nextRegistry.installs = replaceInstallEntry(nextRegistry, updatedEntry).installs;

    if (!options.quiet) {
      console.log(`Updated ${formatScope(entry.scope)}.`);
    }
  }

  for (const entry of changes.filter(({ diff }) => diff.updates.length === 0 && diff.additions.length === 0).map(({ entry }) => entry)) {
    nextRegistry.installs = replaceInstallEntry(nextRegistry, updateInstallTimestamps(entry, index, false)).installs;
  }

  await writeRegistry(nextRegistry);
}

export async function runAutoUpdateCommand(args: string[]): Promise<void> {
  const action = args[0];
  const optionArgs = args.slice(1);
  let scope: Scope | undefined;

  for (const arg of optionArgs) {
    if (arg === "--project") {
      scope = buildProjectScope();
      continue;
    }

    throw new Error(`Unknown auto-update option: ${arg}`);
  }

  const registry = await readRegistry();

  if (action === "status") {
    const schedulerStatus = await getSchedulerStatus().catch(() => ({ installed: false, detail: "unsupported" }));

    if (registry.installs.length === 0) {
      console.log("No tracked Skill Atlas installs.");
    } else {
      for (const entry of getScopeEntries(registry, scope)) {
        console.log(`${formatScope(entry.scope)}: ${entry.autoUpdate.enabled ? "enabled" : "disabled"}`);
        console.log(`  agents: ${entry.agents.selected.join(", ")}`);
        console.log(`  tracked skills: ${Object.keys(entry.installed.skills).length}`);
        console.log(`  last checked: ${entry.installed.lastCheckedAt ?? "never"}`);
        console.log(`  last updated: ${entry.installed.lastUpdatedAt ?? "never"}`);
      }
    }

    console.log(`scheduler: ${schedulerStatus.installed ? "installed" : "not installed"} (${schedulerStatus.detail})`);
    return;
  }

  if (action !== "enable" && action !== "disable") {
    throw new Error("Expected auto-update subcommand: enable, disable, or status");
  }

  const matchingEntries = getScopeEntries(registry, scope);

  if (matchingEntries.length === 0) {
    throw new Error("No tracked Skill Atlas install matches that scope.");
  }

  const enabled = action === "enable";
  const updatedRegistry: RegistryFile = {
    version: REGISTRY_VERSION,
    installs: registry.installs.map((entry) =>
      matchingEntries.some((candidate) => candidate.id === entry.id)
        ? { ...entry, autoUpdate: { enabled } }
        : entry
    ),
  };

  await writeRegistry(updatedRegistry);
  console.log(`${enabled ? "Enabled" : "Disabled"} auto-update for ${matchingEntries.map((entry) => formatScope(entry.scope)).join(", ")}`);
}

export async function runSchedulerCommand(args: string[]): Promise<void> {
  const action = args[0] as SchedulerAction | undefined;

  if (!action || !["install", "remove", "status"].includes(action)) {
    throw new Error("Expected scheduler subcommand: install, remove, or status");
  }

  if (action === "status") {
    const status = await getSchedulerStatus();
    console.log(`${status.installed ? "installed" : "not installed"}: ${status.detail}`);
    return;
  }

  switch (platform()) {
    case "darwin":
      if (action === "install") {
        await installMacScheduler();
      } else {
        await removeMacScheduler();
      }
      break;
    case "linux":
      if (action === "install") {
        await installLinuxScheduler();
      } else {
        await removeLinuxScheduler();
      }
      break;
    case "win32":
      if (action === "install") {
        await installWindowsScheduler();
      } else {
        await removeWindowsScheduler();
      }
      break;
    default:
      throw new Error(`Scheduler is not supported on ${platform()}`);
  }

  console.log(`${action === "install" ? "Installed" : "Removed"} scheduler.`);
}
