---
name: codebase-quick-map
description: If .dev/QUICK-MAP.md exists at the project root, read it first whenever you need to understand the codebase structure or locate functionality. Load the codebase-quick-map skill ONLY when EITHER (.dev/QUICK-MAP.md exists AND you make non-trivial changes to the codebase) OR when you are asked to generate a codebase quick map.
license: MIT
metadata:
  author: Skill Atlas
  version: "0.1.0"
  homepage: https://skillatlas.sh/
---

# Codebase Quick Map

Build and maintain a concise architectural map of a codebase in a single file: `.dev/QUICK-MAP.md`.

The map is a working reference, not exhaustive documentation. It focuses on how functionality maps to files and how modules connect to each other. **Conciseness is critical** — the file should be as short as possible while remaining useful. Every line must earn its place. Prefer terse annotations over full sentences. Omit anything a developer could infer from file names or standard conventions.

## Two modes

### Mode A — Generate

Triggered when the user asks to create, generate, or refresh the map.

### Mode B — Maintain

Triggered automatically when `.dev/QUICK-MAP.md` already exists and you are making changes to the codebase. After completing code changes, update the map to reflect what changed.

---

## Mode A: Generate the map

### 1) Explore the codebase methodically

Do not skim. Build understanding layer by layer:

**Layer 1 — Shape**

- Read the top-level directory listing
- Identify the package manager, framework, and language from config files (`package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`, `Gemfile`, etc.)
- Check for monorepo structure (workspaces, `packages/`, `apps/`)

**Layer 2 — Entry points**

- Find the main entry points: `main.*`, `index.*`, `app.*`, server startup, CLI entry, route definitions
- Trace the startup path: what gets initialized, in what order

**Layer 3 — Module boundaries**

- Map each top-level directory and major subdirectory to its purpose
- Identify which modules are internal libraries vs. application code vs. configuration vs. tooling
- Look for barrel files, re-exports, and public API surfaces

**Layer 4 — Connections**

- Trace imports and dependencies between modules
- Identify the data flow: where data enters the system, how it transforms, where it exits
- Find shared types, models, and interfaces that connect modules
- Map middleware chains, plugin systems, event buses, or message queues

**Layer 5 — Patterns**

- Identify architectural patterns: MVC, layered architecture, hexagonal, microservices, monolith, event-driven, etc.
- Note design patterns in active use: repository pattern, factory, observer, strategy, dependency injection, etc.
- Find conventions: naming, file organization, error handling approach, testing strategy

Use parallel exploration where possible. Read multiple files simultaneously when investigating independent parts of the codebase.

### 2) Write QUICK-MAP.md

Keep this file **as short as possible**. Use terse bullet points and table rows, not paragraphs. Omit sections that do not apply. Omit sections that would only contain obvious or conventional information.

The file combines structure and architecture into a single reference. Use the template below, dropping any section that doesn't apply or would only state the obvious:

```markdown
# Quick Map

> One-sentence summary of what this system does.

## Overview

[1-3 sentences: purpose, users, architecture style. No filler.]

## Directory layout

project-root/
├── src/
│ ├── modules/
│ │ ├── auth/ # [Only annotate if non-obvious]
│ │ └── billing/
│ ├── shared/ # [Terse annotation]
│ └── index.ts # Entry point
├── tests/
└── config/

Go 2-3 levels deep for important directories. Skip standard directories whose purpose is obvious. Annotations are short fragments, not sentences.

## Key modules

| Module | Purpose  | Key files | Depends on |
| ------ | -------- | --------- | ---------- |
| [name] | [1-line] | [files]   | [modules]  |

Only list modules that are non-obvious or have important connections. Skip standard/conventional directories.

## Data flow

[Arrow diagram or 1-2 sentences. Only include if the flow is non-trivial.]

## Core patterns

- **[Pattern]**: [Where/how — one line]

Only include patterns that aren't obvious from the framework choice.

## Cross-cutting concerns

Only document concerns handled in a non-obvious way. Skip if the codebase uses standard framework conventions.

## External integrations

| Integration | Purpose | Where         |
| ----------- | ------- | ------------- |
| [Service]   | [Why]   | [File/module] |

Only include if the project has external integrations.

## File conventions

Only include if the project uses non-standard naming conventions.

| Pattern           | Meaning       |
| ----------------- | ------------- |
| `*.controller.ts` | HTTP handlers |
```

### 3) Create the file

- Create the `.dev/` directory if it does not exist
- Write `.dev/QUICK-MAP.md`
- **Target 50-150 lines.** Most codebases can be mapped well under 120 lines. Only exceed 150 lines for genuinely large or complex projects — and even then, cap at 250 lines. If the file is getting long, cut the least useful sections rather than keeping everything.
- After writing, re-read the file and remove any line that a competent developer could infer without it. If in doubt, cut it.

### 4) Summarize to the user

After generating, give a brief summary of what you found: the architecture style, number of modules mapped, and any notable patterns or connections worth highlighting.

---

## Mode B: Maintain the map

### When to activate

After making code changes, check whether `.dev/QUICK-MAP.md` exists. If it does, evaluate whether your changes affect the map:

**Update the map when:**

- A new module, directory, or significant file was added
- A module was renamed, moved, or deleted
- The dependency graph between modules changed (new imports, removed connections)
- A new external integration was added
- Entry points or routing changed
- Architectural patterns shifted (e.g., introduced a new middleware layer)

**Do not update the map when:**

- Changes are within a single file and do not affect module boundaries or connections
- Bug fixes that do not change architecture or structure
- Content-only changes (copy, config values, test data)
- Formatting, linting, or refactoring that preserves the same structure

Update only affected sections. Do not rewrite the entire file. Match the terseness of existing entries. If an update makes the file longer, trim elsewhere to compensate. Do not add speculative content or change unrelated sections.
