# OpenClaw integration with PigeonScale

Use `@pigeonscale/openclaw` when an OpenClaw agent should monitor a real PigeonScale mailbox and keep replying inside the same email thread.

## Install

```bash
pnpm add @pigeonscale/openclaw openclaw
```

If you are installing through the OpenClaw plugin manager, use:

```bash
openclaw plugins install @pigeonscale/openclaw
```

## Required mailbox setup

Create and verify a cloud mailbox first:

```bash
pigeonscale providers use cloud
pigeonscale auth login --human owner@example.com
pigeonscale mail accounts create --handle henry --from-name "Henry the Agent"
```

The plugin expects the `pigeonscale` CLI to be available and authenticated for cloud access on the same machine.

## OpenClaw config

Add a `channels.pigeonscale` block to your OpenClaw config:

```json5
{
  channels: {
    pigeonscale: {
      defaultAccountId: "henry42@pigeoninbox.com",
      accounts: {
        "henry42@pigeoninbox.com": {
          enabled: true,
          provider: "cloud",
          cliPath: "pigeonscale"
        }
      }
    }
  }
}
```

Fields:

- `defaultAccountId`: default mailbox to use for outbound replies when the route does not pick a more specific account.
- `accounts.<id>.enabled`: turn mailbox monitoring on or off.
- `accounts.<id>.provider`: keep this as `cloud` for the watch runtime.
- `accounts.<id>.cliPath`: optional override if `pigeonscale` is not on `PATH`.

## Runtime behavior

The plugin:

- starts `pigeonscale mail watch --format jsonl` for each enabled mailbox
- fetches full thread context with `pigeonscale mail thread show <threadId>`
- maps each `threadId` to a stable OpenClaw session key
- sends the AI reply with `pigeonscale mail thread reply <threadId>`

## Constraints

- The long-lived watch runtime is cloud-only.
- The underlying `mail thread reply` CLI command also supports resend, but the OpenClaw watcher intentionally does not supervise resend inboxes.
- If no inbound message exists in the thread yet, `mail thread reply` will fail because there is no reply parent to anchor to.
