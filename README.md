# Skill Atlas CLI

CLI for discovering, reviewing, and installing curated AI agent skills.

## Install

```bash
npm install -g skillatlas
```

Or run it without installing:

```bash
npx skillatlas --help
```

## Commands

```bash
skillatlas install
skillatlas find
skillatlas find security review
skillatlas review owner/repo@skill
skillatlas review owner/repo@skill --path references/example.md
```

`install`, `find`, and `review` are implemented by Skill Atlas. Any other command is passed through to the upstream `skills` CLI.

## Development

```bash
npm install
npm run build
node dist/cli.js --help
```

This repository is synced from the private Skill Atlas workspace via `git subtree split` from `packages/cli`.
