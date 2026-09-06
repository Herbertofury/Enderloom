# Enderloom command interface

The first CLI foundation is implemented. Full typed launcher parity and Performance Lab remain tracked in [the continuation checklist](CONTINUATION_CHECKLIST.md).

## Run the built command

From this checkout on Windows:

```powershell
npm run build:integration
.\enderloom.cmd capabilities --json
.\enderloom.cmd instance list --json
.\enderloom.cmd instance show "My instance" --json
.\enderloom.cmd launch "My instance" --wait --jsonl
.\enderloom.cmd launch "My instance" --detach --json
.\enderloom.cmd process list --json
.\enderloom.cmd process logs RUN_ID --follow --jsonl
.\enderloom.cmd logs list "My instance" --json
.\enderloom.cmd logs show "My instance" latest.log --json
```

`enderloom.cmd` without arguments opens the existing desktop app. `node scripts/enderloom-cli.js` is the equivalent development wrapper on other platforms. The wrapper chooses a packaged native helper when present, otherwise the newest built debug/release helper. `ENDERLOOM_CLI_PATH` explicitly selects an artifact. Installer integration and cross-platform package acceptance are still pending.

The native console helper (`native/target/debug/enderloom.exe` on Windows) executes commands without an Electron window. It uses the same data root, database, filesystem policy, process ownership checks and domain dispatcher as the GUI. `--data-dir ABSOLUTE_PATH` or `ENDERLOOM_DATA_DIR` selects an isolated root. Capability/schema discovery never opens user data.

If another GUI or CLI already owns that root, the command authenticates to its local service. Both interfaces see the same tasks and processes. A root lease prevents two independent runtimes from opening the same launcher state. The local endpoint token is internal and is never part of a command result.

## Selectors and output

Selectors accept a complete instance ID, an unambiguous prefix of at least eight ID characters (hyphens optional), or an unambiguous name. Ambiguity fails before launch. Existing `--list/-L` and `--launch/-l` remain supported; legacy list takes precedence when both are present. Unknown arguments fail explicitly.

`--json` produces one final envelope. `--jsonl` produces event envelopes followed by a final result. Each carries `schema_version`, `command`, `ok`, `trace_id` and `core_version`; the final envelope contains `result` or `error`. Failed game exits preserve the observed run in `result` alongside the error. Logs redact credential fields/patterns while retaining usable IDs and paths. Human diagnostics use stderr. `--quiet`, `--no-color`, `--trace-id`, `--output FILE`, `--timeout 30s` and `-v` are recognized global options.

The initial implemented exit families are success (0), usage (2), preflight/domain failure (3), observed unsuccessful game exit (5), timeout (6) and cancellation (10). The schema reserves additional domain-specific families for subsequent phases. A waiting launch stops only its own run when interrupted; a log-follow timeout leaves an existing run alone. Detached runs remain managed and recoverable. Ctrl+C handling is implemented; a Windows interactive signal acceptance test remains pending.

`process logs` exposes the existing native rolling log buffer (6,000 lines), and `logs show` uses the existing searchable file reader (20,000 matches). Full persistent-log paging/streaming is a CLI-1 requirement, not a claim made by these initial commands.

## Registered domain bridge

The complete current service inventory is discoverable with `capabilities`. Until all typed routes are implemented, reviewed service operations can be invoked using a JSON object:

```powershell
'{"name":"CLI sandbox","versionId":"1.20.1","loader":null,"loaderVersion":null}' |
  .\enderloom.cmd operation run create_instance --json
.\enderloom.cmd operation run scan_instance_workbench --input instance.json --json
```

Use a file or piped stdin; a terminal stdin is rejected with an actionable message. Destructive bridge operations require `--yes`. `--plan` invokes only a declared native plan and refuses unsupported plans without performing the requested mutation. UI file/folder opening is an explicit visual exception. Offline reset refuses to apply while another service owns the root.

This bridge is not full typed CLI parity. Background-returning operations need owned-task waiting/cancellation and durable completion semantics before their CLI-1 acceptance can be checked off. Prefer the GUI for those workflows until that work is complete.

## Verification

- `npm run cli-qa`: strict parser, selectors, stdout envelopes/redaction, legacy behavior, actual artifact hash, result files and destructive guard.
- `npm run cli-shared-service-qa`: both ownership directions, task cancellation, authenticated endpoint and recovered process log follow.
- `node scripts/cli-launch-qa.js --live-account`: explicit real-account acceptance; creates/removes a disposable vanilla instance, validates actual client initialization, detach, timeout ownership and an intentionally failing JVM exit. It checks existing profiles/global settings remain unchanged and saves redacted evidence under `output/playwright/cli-live-launch`.
- `npm run cli-parity-qa`: registry drift and deliberate missing-operation/route/shared-domain challenges; part of `release-qa`.

New commands generated by `node scripts/cli-registry-generate.js` start unreviewed and fail parity until their classification, routes and exceptions have been reviewed. A generic route does not close the typed CLI-1 checklist.
