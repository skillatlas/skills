#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { Command } from "commander";
import {
  MANAGED_INDEX_URL,
  MANAGED_SKILL_REPO,
  runAutoUpdateCommand,
  runManagedInstall,
  runManagedUpdate,
  runSchedulerCommand,
} from "./managed-installs.js";

const SEARCH_API_BASE = process.env.SKILLS_API_URL || "https://skills.sh";
const require = createRequire(import.meta.url);
const packageJson = require("../package.json") as { version: string };
let DEBUG_MODE = false;

type SearchApiSkill = {
  id: string;
  name: string;
  installs?: number;
  skillId?: string;
  source?: string;
};

type SearchApiResponse = {
  skills?: SearchApiSkill[];
};

type ReviewSource = {
  owner: string;
  repo: string;
  skill: string;
};

type RepoSource = {
  owner: string;
  repo: string;
};

type FindOptions = {
  includeDuplicates: boolean;
  keywords: string[];
};

type GlobalOptions = {
  args: string[];
  debug: boolean;
};

type ReviewOptions = {
  source: ReviewSource;
  requestedPath?: string;
};

type RepoContext = {
  tempDir: string;
  repoDir: string;
  files: string[];
};

type SkillMdMatch = {
  skillDir: string;
  skillMdText: string;
  skillMdBytes: Buffer;
};

type RawSkillResolution = SkillMdMatch & {
  ref: string;
};

type RawSkillMdCacheEntry = {
  fetchedAt: number;
  hash: string | null;
};

const RAW_HOT_PATH_REF = "main";
const FIND_DEDUPE_CONCURRENCY = 4;
const RAW_SKILL_MD_CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const RAW_SKILL_MD_CACHE_PATH = path.join(homedir(), ".cache", "skillatlas", "raw-skill-md-cache.json");

function resolveSkillsCliPath(): string {
  const skillsPackageJsonPath = require.resolve("skills/package.json");
  return path.join(path.dirname(skillsPackageJsonPath), "bin", "cli.mjs");
}

async function runSkills(args: string[], options: { quiet?: boolean } = {}): Promise<void> {
  const skillsCliPath = resolveSkillsCliPath();
  const quiet = options.quiet ?? false;

  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [skillsCliPath, ...args], {
      stdio: quiet ? ["ignore", "pipe", "pipe"] : "inherit",
      env: process.env,
    });
    let stdout = "";
    let stderr = "";

    if (quiet) {
      child.stdout?.on("data", (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr?.on("data", (chunk) => {
        stderr += chunk.toString();
      });
    }

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`skills exited with signal ${signal}`));
        return;
      }

      if ((code ?? 1) !== 0) {
        const output = stderr.trim() || stdout.trim();
        if (quiet && output) {
          console.error(output);
        }

        reject(new Error(output || `skills exited with status ${code ?? 1}`));
        return;
      }

      process.exitCode = 0;
      resolve();
    });
  });
}

function parseGlobalOptions(args: string[]): GlobalOptions {
  const strippedArgs: string[] = [];
  let debug = false;

  for (const arg of args) {
    if (arg === "--debug") {
      debug = true;
      continue;
    }

    strippedArgs.push(arg);
  }

  return {
    args: strippedArgs,
    debug,
  };
}

function debugLog(message: string): void {
  if (!DEBUG_MODE) {
    return;
  }

  console.error(`[debug] ${message}`);
}

function parseFindArgs(args: string[]): FindOptions {
  const keywords: string[] = [];
  let includeDuplicates = false;

  for (const arg of args) {
    if (arg === "--include-duplicates") {
      includeDuplicates = true;
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    keywords.push(arg);
  }

  if (includeDuplicates && keywords.length === 0) {
    throw new Error("--include-duplicates can only be used with keyword search");
  }

  return {
    includeDuplicates,
    keywords,
  };
}

function formatInstallCount(installs?: number): string {
  if (typeof installs !== "number" || installs < 0) {
    return "0 installs";
  }

  const formatted = new Intl.NumberFormat("en-US").format(installs);
  return `${formatted} install${installs === 1 ? "" : "s"}`;
}

async function searchSkills(query: string): Promise<SearchApiSkill[]> {
  const params = new URLSearchParams({
    q: query,
    limit: "10",
  });
  const url = `${SEARCH_API_BASE}/api/search?${params.toString()}`;
  debugLog(`search api ${url}`);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Search failed with status ${response.status}`);
  }

  const data = (await response.json()) as SearchApiResponse;
  return Array.isArray(data.skills) ? data.skills : [];
}

function parseReviewSource(input: string): ReviewSource {
  const match = input.match(/^([^/]+)\/([^/@]+)@(.+)$/);

  if (!match) {
    throw new Error("Expected review target in the form owner/repo@skill");
  }

  return {
    owner: match[1],
    repo: match[2],
    skill: match[3],
  };
}

function parseOwnerRepo(input: string): RepoSource {
  const match = input.match(/^([^/]+)\/([^/]+)$/);

  if (!match) {
    throw new Error(`Expected owner/repo, received: ${input}`);
  }

  return {
    owner: match[1],
    repo: match[2],
  };
}

function parseReviewArgs(args: string[]): ReviewOptions {
  let target: string | undefined;
  let requestedPath: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--path") {
      const value = args[index + 1];

      if (!value) {
        throw new Error("Expected a value after --path");
      }

      requestedPath = value;
      index += 1;
      continue;
    }

    if (arg.startsWith("--path=")) {
      requestedPath = arg.slice("--path=".length);
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    if (target) {
      throw new Error("Expected a single review target in the form owner/repo@skill");
    }

    target = arg;
  }

  if (!target) {
    throw new Error("Missing review target. Expected owner/repo@skill");
  }

  return {
    source: parseReviewSource(target),
    requestedPath: requestedPath ? sanitizeRelativeSkillPath(requestedPath) : undefined,
  };
}

function sanitizeRelativeSkillPath(input: string): string {
  const normalized = input.replace(/\\/g, "/");
  const safePath = path.posix.normalize(normalized);

  if (!safePath || safePath === "." || path.posix.isAbsolute(safePath) || safePath.startsWith("../") || safePath.includes("/../")) {
    throw new Error(`Invalid skill file path: ${input}`);
  }

  return safePath.replace(/^\.\/+/, "");
}

function normalizeSkillName(input: string): string {
  return input.trim().toLowerCase().replace(/[\s_]+/g, "-");
}

function extractSkillNameFromSkillMd(content: string): string | null {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  if (!frontmatterMatch) {
    return null;
  }

  const nameMatch = frontmatterMatch[1].match(/^name:\s*(.+)$/m);
  if (!nameMatch) {
    return null;
  }

  return nameMatch[1].trim().replace(/^['"]|['"]$/g, "");
}

async function cloneRepo(owner: string, repo: string): Promise<RepoContext> {
  const tempDir = await mkdtemp(path.join(tmpdir(), "skillatlas-"));
  const repoDir = path.join(tempDir, repo);
  const cloneUrl = `https://github.com/${owner}/${repo}.git`;
  debugLog(`partial clone ${cloneUrl} -> ${repoDir}`);

  try {
    runGit(
      [
        "clone",
        "--depth",
        "1",
        "--filter=blob:none",
        "--no-checkout",
        "--quiet",
        cloneUrl,
        repoDir,
      ],
      `git clone failed for ${cloneUrl}`
    );
    const files = listRepoFiles(repoDir);
    debugLog(`partial clone complete ${cloneUrl}`);

    return {
      tempDir,
      repoDir,
      files,
    };
  } catch (error) {
    await rm(tempDir, { recursive: true, force: true });
    throw error;
  }
}

function runGit(args: string[], fallbackMessage: string): string {
  const result = spawnSync("git", args, {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    const errorOutput = result.stderr.trim() || result.stdout.trim() || fallbackMessage;
    throw new Error(errorOutput);
  }

  return result.stdout;
}

function runGitBytes(args: string[], fallbackMessage: string): Buffer {
  const result = spawnSync("git", args);

  if (result.status !== 0) {
    const stderr = result.stderr ? result.stderr.toString("utf8").trim() : "";
    const stdout = result.stdout ? result.stdout.toString("utf8").trim() : "";
    const errorOutput = stderr || stdout || fallbackMessage;
    throw new Error(errorOutput);
  }

  return result.stdout;
}

function listRepoFiles(repoDir: string): string[] {
  const output = runGit(
    ["-C", repoDir, "ls-tree", "-r", "--name-only", "HEAD"],
    `Could not list repo files for ${repoDir}`
  );

  return output
    .split(/\r?\n/)
    .map((file) => file.trim())
    .filter((file) => file.length > 0)
    .sort((left, right) => left.localeCompare(right));
}

async function cleanupRepoContext(repoContext: RepoContext): Promise<void> {
  debugLog(`cleanup ${repoContext.tempDir}`);
  await rm(repoContext.tempDir, { recursive: true, force: true });
}

function readRepoFileBytes(repoContext: RepoContext, relativePath: string): Buffer {
  return runGitBytes(
    ["-C", repoContext.repoDir, "show", `HEAD:${relativePath}`],
    `Could not read ${relativePath} from ${repoContext.repoDir}`
  );
}

function buildRawGitHubUrl(owner: string, repo: string, ref: string, relativePath: string): string {
  const encodedPath = relativePath.split("/").map((segment) => encodeURIComponent(segment)).join("/");
  return `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(ref)}/${encodedPath}`;
}

async function fetchRawGitHubBytes(owner: string, repo: string, ref: string, relativePath: string): Promise<Buffer> {
  const url = buildRawGitHubUrl(owner, repo, ref, relativePath);
  debugLog(`raw probe ${url}`);
  const response = await fetch(url);

  if (!response.ok) {
    debugLog(`raw miss ${url} (${response.status})`);
    throw new Error(`Raw GitHub request failed with status ${response.status}`);
  }

  debugLog(`raw hit ${url}`);
  const data = await response.arrayBuffer();
  return Buffer.from(data);
}

async function fetchRawGitHubText(owner: string, repo: string, ref: string, relativePath: string): Promise<string> {
  const content = await fetchRawGitHubBytes(owner, repo, ref, relativePath);
  return content.toString("utf8");
}

async function loadRawSkillMdCache(): Promise<Map<string, RawSkillMdCacheEntry>> {
  try {
    const content = await readFile(RAW_SKILL_MD_CACHE_PATH, "utf8");
    const parsed = JSON.parse(content) as Record<string, RawSkillMdCacheEntry>;
    const now = Date.now();
    const cache = new Map<string, RawSkillMdCacheEntry>();

    for (const [key, entry] of Object.entries(parsed)) {
      if (
        !entry ||
        typeof entry.fetchedAt !== "number" ||
        (typeof entry.hash !== "string" && entry.hash !== null)
      ) {
        continue;
      }

      if (now - entry.fetchedAt > RAW_SKILL_MD_CACHE_TTL_MS) {
        continue;
      }

      cache.set(key, entry);
    }

    return cache;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    debugLog(`raw cache load miss ${message}`);
    return new Map<string, RawSkillMdCacheEntry>();
  }
}

async function persistRawSkillMdCache(cache: Map<string, RawSkillMdCacheEntry>): Promise<void> {
  const serialized = JSON.stringify(Object.fromEntries(cache), null, 2);

  try {
    await mkdir(path.dirname(RAW_SKILL_MD_CACHE_PATH), { recursive: true });
    await writeFile(RAW_SKILL_MD_CACHE_PATH, serialized, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    debugLog(`raw cache write failed ${message}`);
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      if (currentIndex >= items.length) {
        return;
      }

      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  const workerCount = Math.max(1, Math.min(concurrency, items.length));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

async function getOrCloneRepoContext(
  repoContexts: Map<string, Promise<RepoContext>>,
  owner: string,
  repo: string
): Promise<RepoContext> {
  const repoKey = `${owner}/${repo}`;
  const existingRepoContext = repoContexts.get(repoKey);

  if (existingRepoContext) {
    debugLog(`dedupe clone cache hit ${repoKey}`);
    return existingRepoContext;
  }

  debugLog(`dedupe clone cache miss ${repoKey}`);
  const repoContextPromise = cloneRepo(owner, repo);
  repoContexts.set(repoKey, repoContextPromise);

  try {
    return await repoContextPromise;
  } catch (error) {
    repoContexts.delete(repoKey);
    throw error;
  }
}

async function getCachedOrFetchRawSkillMdHash(
  cache: Map<string, RawSkillMdCacheEntry>,
  repoContexts: Map<string, Promise<RepoContext>>,
  owner: string,
  repo: string,
  skillName: string
): Promise<string | null> {
  const cacheKey = `${owner}/${repo}@${skillName}`;
  const cachedEntry = cache.get(cacheKey);

  if (cachedEntry) {
    debugLog(`raw cache hit ${cacheKey}`);
    return cachedEntry.hash;
  }

  debugLog(`raw cache miss ${cacheKey}`);

  try {
    const skillMdBytes = await fetchRawGitHubBytes(owner, repo, RAW_HOT_PATH_REF, path.posix.join("skills", skillName, "SKILL.md"));
    const skillMdText = skillMdBytes.toString("utf8");
    assertSkillNameMatches(skillMdText, skillName, path.posix.join("skills", skillName, "SKILL.md"));
    const hash = createHash("sha256").update(skillMdBytes).digest("hex");
    cache.set(cacheKey, {
      fetchedAt: Date.now(),
      hash,
    });
    return hash;
  } catch {
    debugLog(`dedupe raw miss for ${cacheKey}, resolving via clone`);
  }

  try {
    const repoContext = await getOrCloneRepoContext(repoContexts, owner, repo);
    const skillMatch = findSkillMdMatchInRepoContext(repoContext, skillName);
    const hash = createHash("sha256").update(skillMatch.skillMdBytes).digest("hex");
    cache.set(cacheKey, {
      fetchedAt: Date.now(),
      hash,
    });
    return hash;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    debugLog(`dedupe clone miss for ${cacheKey}: ${message}`);
    cache.set(cacheKey, {
      fetchedAt: Date.now(),
      hash: null,
    });
    return null;
  }
}

function assertSkillNameMatches(content: string, skillName: string, skillMdPath: string): void {
  const parsedName = extractSkillNameFromSkillMd(content);

  if (!parsedName) {
    throw new Error(`Missing frontmatter name in ${skillMdPath}`);
  }

  if (normalizeSkillName(parsedName) !== normalizeSkillName(skillName)) {
    throw new Error(`Frontmatter name mismatch in ${skillMdPath}: expected ${skillName}, found ${parsedName}`);
  }
}

function getCandidateSkillDirectories(files: string[], skillName: string): string[] {
  const skillMdEntries = files.filter((file) => file === "SKILL.md" || file.endsWith("/SKILL.md"));

  const exactMatches = skillMdEntries.filter((entry) => path.posix.basename(path.posix.dirname(entry)) === skillName);
  if (exactMatches.length === 1) {
    return [path.posix.dirname(exactMatches[0])];
  }

  if (exactMatches.length > 1) {
    return exactMatches.map((entry) => path.posix.dirname(entry));
  }

  const normalizedName = normalizeSkillName(skillName);
  const normalizedMatches = skillMdEntries.filter(
    (entry) => normalizeSkillName(path.posix.basename(path.posix.dirname(entry))) === normalizedName
  );

  if (normalizedMatches.length === 1) {
    return [path.posix.dirname(normalizedMatches[0])];
  }

  if (normalizedMatches.length > 1) {
    return normalizedMatches.map((entry) => path.posix.dirname(entry));
  }

  return [];
}

function findSkillMdMatchInRepoContext(repoContext: RepoContext, skillName: string): SkillMdMatch {
  const candidateSkillDirs = getCandidateSkillDirectories(repoContext.files, skillName);

  if (candidateSkillDirs.length === 0) {
    throw new Error(`Could not find skill directory for ${skillName}`);
  }

  const matchingCandidates: SkillMdMatch[] = [];

  for (const skillDir of candidateSkillDirs) {
    const skillMdRelativePath = path.posix.join(skillDir, "SKILL.md");
    const skillMdBytes = readRepoFileBytes(repoContext, skillMdRelativePath);
    const skillMdText = skillMdBytes.toString("utf8");

    try {
      assertSkillNameMatches(skillMdText, skillName, skillMdRelativePath);
      matchingCandidates.push({
        skillDir,
        skillMdText,
        skillMdBytes,
      });
    } catch {
      continue;
    }
  }

  if (matchingCandidates.length === 1) {
    return matchingCandidates[0];
  }

  if (matchingCandidates.length > 1) {
    const matches = matchingCandidates.map((candidate) => candidate.skillDir).join(", ");
    throw new Error(`Multiple skill directories matched ${skillName}: ${matches}`);
  }

  if (candidateSkillDirs.length === 1) {
    throw new Error(`Frontmatter name mismatch in ${path.posix.join(candidateSkillDirs[0], "SKILL.md")}: expected ${skillName}`);
  }

  throw new Error(`Multiple skill directories matched ${skillName}: ${candidateSkillDirs.join(", ")}`);
}

function listSkillFiles(files: string[], skillDir: string): string[] {
  if (skillDir === ".") {
    return [...files];
  }

  const prefix = `${skillDir}/`;

  return files
    .filter((file) => file.startsWith(prefix))
    .map((file) => path.posix.relative(skillDir, file))
    .filter((relativePath) => relativePath.length > 0)
    .sort((left, right) => left.localeCompare(right));
}

async function tryResolveSkillFromRaw(owner: string, repo: string, skillName: string): Promise<RawSkillResolution | null> {
  const skillDir = `skills/${skillName}`;
  const relativePath = path.posix.join(skillDir, "SKILL.md");

  try {
    const skillMdBytes = await fetchRawGitHubBytes(owner, repo, RAW_HOT_PATH_REF, relativePath);
    const skillMdText = skillMdBytes.toString("utf8");
    assertSkillNameMatches(skillMdText, skillName, relativePath);

    return {
      ref: RAW_HOT_PATH_REF,
      skillDir,
      skillMdText,
      skillMdBytes,
    };
  } catch {
    debugLog(`raw hot path failed for ${owner}/${repo}@${skillName}, falling back to clone`);
    return null;
  }
}

function getSkillDirectoryName(skill: SearchApiSkill): string {
  if (skill.skillId) {
    return skill.skillId;
  }

  const segments = skill.id.split("/");
  const lastSegment = segments.at(-1);

  if (!lastSegment) {
    throw new Error(`Malformed skill id: ${skill.id}`);
  }

  return lastSegment;
}

function getSkillSource(skill: SearchApiSkill): string {
  if (skill.source) {
    return skill.source;
  }

  const segments = skill.id.split("/");
  if (segments.length < 3) {
    throw new Error(`Malformed skill id: ${skill.id}`);
  }

  return `${segments[0]}/${segments[1]}`;
}

async function dedupeSkillsBySkillMd(results: SearchApiSkill[]): Promise<SearchApiSkill[]> {
  const cache = await loadRawSkillMdCache();
  const repoContexts = new Map<string, Promise<RepoContext>>();

  try {
    const hashes = await mapWithConcurrency(results, FIND_DEDUPE_CONCURRENCY, async (skill) => {
      try {
        const source = getSkillSource(skill);
        const { owner, repo } = parseOwnerRepo(source);
        return await getCachedOrFetchRawSkillMdHash(cache, repoContexts, owner, repo, getSkillDirectoryName(skill));
      } catch {
        return null;
      }
    });

    const seenHashes = new Set<string>();
    const uniqueSkills: SearchApiSkill[] = [];

    for (const [index, skill] of results.entries()) {
      const hash = hashes[index];

      if (!hash) {
        uniqueSkills.push(skill);
        continue;
      }

      if (seenHashes.has(hash)) {
        continue;
      }

      seenHashes.add(hash);
      uniqueSkills.push(skill);
    }

    return uniqueSkills;
  } finally {
    await persistRawSkillMdCache(cache);
    const repoContextResults = await Promise.allSettled(repoContexts.values());

    await Promise.all(
      repoContextResults.flatMap((result) => result.status === "fulfilled" ? [cleanupRepoContext(result.value)] : [])
    );
  }
}

async function runReview(args: string[]): Promise<void> {
  const { source, requestedPath } = parseReviewArgs(args);
  const { owner, repo, skill } = source;

  if (requestedPath) {
    const rawRequestedPath = path.posix.join(`skills/${skill}`, requestedPath);

    try {
      debugLog(`review --path direct raw attempt for ${owner}/${repo}@${skill}`);
      const content = await fetchRawGitHubText(owner, repo, RAW_HOT_PATH_REF, rawRequestedPath);
      debugLog(`review --path served from direct raw for ${owner}/${repo}@${skill}`);
      process.stdout.write(content);

      if (!content.endsWith("\n")) {
        process.stdout.write("\n");
      }

      return;
    } catch {
      debugLog(`review --path direct raw failed for ${owner}/${repo}@${skill}, falling back to clone`);
    }
  }

  const rawResolution = await tryResolveSkillFromRaw(owner, repo, skill);

  debugLog(`review clone fallback for ${owner}/${repo}@${skill}`);
  const repoContext = await cloneRepo(owner, repo);

  try {
    const resolvedSkillMatch = rawResolution ?? findSkillMdMatchInRepoContext(repoContext, skill);
    const skillDir = resolvedSkillMatch.skillDir;
    const files = listSkillFiles(repoContext.files, skillDir);

    if (!files.includes("SKILL.md")) {
      throw new Error(`Missing SKILL.md in ${skillDir}`);
    }

    if (requestedPath) {
      if (!files.includes(requestedPath)) {
        throw new Error(`File not found in skill: ${requestedPath}`);
      }

      const content = readRepoFileBytes(repoContext, path.posix.join(skillDir, requestedPath)).toString("utf8");
      process.stdout.write(content);

      if (!content.endsWith("\n")) {
        process.stdout.write("\n");
      }

      return;
    }

    const skillMdContent = resolvedSkillMatch.skillMdText;
    const additionalFiles = files.filter((file) => file !== "SKILL.md");

    console.log("# SKILL.md");
    console.log();
    process.stdout.write(skillMdContent);

    if (!skillMdContent.endsWith("\n")) {
      process.stdout.write("\n");
    }

    console.log();
    console.log("---");
    console.log();
    console.log("# Additional skill files");
    console.log();

    if (additionalFiles.length === 0) {
      console.log("No additional skill files.");
      return;
    }

    console.log(`To fetch the file content for review, use npx skillatlas review ${owner}/${repo}@${skill} --path <path>`);
    console.log();

    for (const file of additionalFiles) {
      console.log(`- ${file}`);
    }
  } finally {
    await cleanupRepoContext(repoContext);
  }
}

async function runFind(keywords: string[]): Promise<void> {
  const { includeDuplicates, keywords: parsedKeywords } = parseFindArgs(keywords);
  const query = parsedKeywords.join(" ").trim();

  if (!query) {
    await runSkills(["find"]);
    return;
  }

  const results = await searchSkills(query);
  const visibleResults = includeDuplicates ? results : await dedupeSkillsBySkillMd(results);

  if (visibleResults.length === 0) {
    console.log(`No skills found for "${query}"`);
    return;
  }

  console.log("Review with npx skillatlas review owner/repo@skill");
  console.log("Install with npx skillatlas add <owner/repo@skill>");
  console.log();

  for (const skill of visibleResults.slice(0, 6)) {
    const source = getSkillSource(skill);
    console.log(`${source}@${skill.name}`);
    console.log(`  - ${formatInstallCount(skill.installs)}`);
    console.log();
  }
}

function createProgram(): Command {
  const program = new Command();

  program
    .name("skillatlas")
    .description("Skill Atlas CLI wrapper for the skills ecosystem")
    .option("--debug", "Print debug output for raw probes and clone fallbacks")
    .version(packageJson.version);

  program
    .command("install")
    .description(`Install every skill from ${MANAGED_SKILL_REPO} and track it for Skill Atlas updates`)
    .option("--auto-update", "Enable auto-update for this install")
    .option("--project", "Install into the current project instead of globally")
    .option("-a, --agent <agents...>", "Install to specific agents")
    .addHelpText(
      "after",
      "\nIf --agent is omitted, Skill Atlas auto-detects supported agents.\nInstalls are always symlink-based."
    );

  program
    .command("find [keywords...]")
    .description("Search for skills by keyword, or pass through to interactive search with no keywords")
    .option("--include-duplicates", "Include duplicate SKILL.md results in keyword search output")
    .option("--debug", "Print debug output for raw probes and clone fallbacks")
    .addHelpText(
      "after",
      "\n`skillatlas find` is passed through to `skills find` for the interactive prompt.\n`skillatlas find <keywords...>` uses the skills.sh search API, dedupes exact SKILL.md matches by default, and prints Skill Atlas-specific output."
    );

  program
    .command("review <source>")
    .description("Review a skill's SKILL.md and additional files, or fetch a specific file with --path")
    .option("--path <path>", "Fetch a specific file inside the skill directory")
    .option("--debug", "Print debug output for raw probes and clone fallbacks")
    .addHelpText(
      "after",
      "\nExamples:\n  skillatlas review owner/repo@skill\n  skillatlas review owner/repo@skill --path references/example.md"
    );

  program
    .command("update")
    .description(`Update tracked Skill Atlas installs using ${MANAGED_INDEX_URL}`)
    .option("--dry-run", "Print planned updates without applying them")
    .option("--project", "Update only the tracked install for the current project")
    .option("--quiet", "Suppress normal output")
    .option("--scheduled", "Run in scheduled mode")
    .addHelpText(
      "after",
      "\nOnly tracked installs created with `skillatlas install` are updated."
    );

  program
    .command("auto-update <action>")
    .description("Enable, disable, or inspect auto-update state for tracked installs")
    .option("--project", "Target only the tracked install for the current project")
    .addHelpText(
      "after",
      "\nActions: enable, disable, status"
    );

  program
    .command("scheduler <action>")
    .description("Install, remove, or inspect the per-user scheduled auto-update job")
    .addHelpText(
      "after",
      "\nActions: install, remove, status"
    );

  program.addHelpText(
    "after",
    "\n`install`, `find`, `review`, `update`, `auto-update`, and `scheduler` are handled by Skill Atlas.\nAny other command is passed through directly to the `skills` CLI."
  );

  return program;
}

async function main(): Promise<void> {
  const globalOptions = parseGlobalOptions(process.argv.slice(2));
  const args = globalOptions.args;
  const firstArg = args[0];
  const program = createProgram();
  DEBUG_MODE = globalOptions.debug;

  if (!firstArg || firstArg === "-h" || firstArg === "--help" || firstArg === "help" || firstArg === "-V" || firstArg === "--version") {
    await program.parseAsync(process.argv);
    return;
  }

  if (firstArg === "install") {
    if (args.includes("-h") || args.includes("--help")) {
      await program.parseAsync(process.argv);
      return;
    }

    await runManagedInstall(args.slice(1), runSkills);
    return;
  }

  if (firstArg === "find") {
    if (args.includes("-h") || args.includes("--help")) {
      await program.parseAsync(process.argv);
      return;
    }

    await runFind(args.slice(1));
    return;
  }

  if (firstArg === "review") {
    if (args.includes("-h") || args.includes("--help")) {
      await program.parseAsync(process.argv);
      return;
    }

    await runReview(args.slice(1));
    return;
  }

  if (firstArg === "update") {
    if (args.includes("-h") || args.includes("--help")) {
      await program.parseAsync(process.argv);
      return;
    }

    await runManagedUpdate(args.slice(1), runSkills);
    return;
  }

  if (firstArg === "auto-update") {
    if (args.includes("-h") || args.includes("--help")) {
      await program.parseAsync(process.argv);
      return;
    }

    await runAutoUpdateCommand(args.slice(1));
    return;
  }

  if (firstArg === "scheduler") {
    if (args.includes("-h") || args.includes("--help")) {
      await program.parseAsync(process.argv);
      return;
    }

    await runSchedulerCommand(args.slice(1));
    return;
  }

  await runSkills(args);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
