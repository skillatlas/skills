---
name: instant-web-publishing-with-pigeonscale
description: Publish local directories to the web with the Pigeonscale CLI, including first publish, bootstrap with human approval, signed-in redeploys, site-local pigeonscale.jsonc config, and domain management. Use when an agent needs to put a folder online, redeploy a site, sync site config, or manage Pigeonscale site domains.
license: MIT
metadata:
  author: Pigeonscale
  version: "0.1.0"
  homepage: https://pigeonscale.com/
---

# Publish a folder

Use the cloud provider for sites. Run the CLI as `pigeonscale ...`. If it is not installed globally, use `npx -y pigeonscale ...`.

## Local session and approval state

Keep these paths in mind:

- Session state lives in `~/.config/pigeonscale/session.json`.
- Pending approvals live in `~/.config/pigeonscale/pending-approvals.json`.
- Inspect pending approvals with `pigeonscale approvals status`.

Token storage uses `cross-keychain`:

- When a native credential backend exists, `session.json` stores metadata only and the actual access and refresh tokens live in the OS keychain under service `pigeonscale.session`.
- When no native backend exists, the CLI stores both tokens in `session.json` with `0600` permissions.

## First publish

When signed out, bootstrap a new site with a human email and site name:

```bash
pigeonscale sites publish ./dist \
  --human owner@example.com \
  --name "Marketing demo"
```

If already signed in, omit `--human`:

```bash
pigeonscale sites publish ./dist --name "Marketing demo"
```

## Approval behavior

Signed-out bootstrap has two important branches:

- Immediate path: bootstrap returns session tokens and the command can publish live in one run.
- Approval path: bootstrap returns `approval_required`, a local `pendingToken`, and usually a temporary `publishToken`.

When the approval path includes a `publishToken`, the CLI still uploads blobs and finalizes the deployment in the same run. That command can exit successfully with deployment status `pending_approval`. In that case the upload is already done and the human approval activates the pending deployment server-side; do not re-upload just to finish.

If output says `Approval required` and the command has not already produced a successful `pending_approval` result, let the human approve it and rerun the same `sites publish` command so the CLI can exchange the stored pending token.

The CLI writes `pigeonscale.jsonc` as soon as bootstrap returns a site id so the site is not orphaned locally.

For existing sites, prefer `--site-id` or a local `pigeonscale.jsonc` file instead of guessing site identity.

## Repeat deploys

After the first successful publish, let the site-local config pin the target site:

```bash
pigeonscale sites publish ./dist
```

Or target explicitly:

```bash
pigeonscale sites publish ./dist --site-id ps_site_123
```

If local `pigeonscale.jsonc` is stale, sync it:

```bash
pigeonscale sites config sync ./dist --site-id ps_site_123
```

If local config disagrees with remote site settings, use `--sync-config` only when the mismatch is purely stale local config. Do not bulldoze real remote settings with conflicting flags or env vars.

## Safety defaults

Default publish filtering skips `.env*`, `*.vars`, `.gitignore` and `.pigeonscaleignore` matches, and runs a local secret scan. Keep those defaults.

Use `--skip-filter` only when the user explicitly asks to bypass filtering and understands the risk.

Hostname changes during publish require `--yes`.

## Domains

Use the domains subcommands after the site exists:

```bash
pigeonscale sites domains list --site-id ps_site_123
pigeonscale sites domains add --site-id ps_site_123 example.com
pigeonscale sites domains verify example.com
```

## Approval edge cases

- If output says `Approval still pending`, wait and rerun only if the current command did not already finish with `status: "pending_approval"`.
- If output says `Approval denied`, stop and request a new approval instead of retrying blindly.
- If output says `Approval token invalid/expired`, rerun the publish command to mint a fresh approval.
- Signed-in site updates that need `site:manage` can also trigger `PUBLISH_SITE` approval for hostname or metadata changes.

## Constraints

- Do not use `--provider resend`; sites require cloud.
- Do not pass `--human` if already signed in under a different human.
- When `--slug` is set, also pass `--tld`.
- Hostname changes during publish require `--yes`.
- Prefer rerunning the same publish command after approval instead of changing flags mid-flow.
