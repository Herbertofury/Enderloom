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

The current typed routes also include:

```powershell
.\enderloom.cmd app info
.\enderloom.cmd app paths --json
.\enderloom.cmd app doctor --json
.\enderloom.cmd app network test
.\enderloom.cmd settings get max_memory_mb --json
'{"max_memory_mb":4096}' | .\enderloom.cmd settings set --plan --json
.\enderloom.cmd java list --json
.\enderloom.cmd java status "My instance" --json
.\enderloom.cmd java install 17 --instance "My instance" --jsonl
.\enderloom.cmd auth list --json
.\enderloom.cmd auth use ACCOUNT_ID
.\enderloom.cmd instance create "New instance" --version 1.20.1
'{"name":"Renamed","maxMemoryMb":2048}' | .\enderloom.cmd instance edit INSTANCE_ID --json
.\enderloom.cmd instance note INSTANCE_ID "Keep these configs"
.\enderloom.cmd instance install INSTANCE_ID --jsonl
.\enderloom.cmd instance duplicate INSTANCE_ID --jsonl
.\enderloom.cmd instance repair INSTANCE_ID --jsonl
.\enderloom.cmd instance favorite INSTANCE_ID
.\enderloom.cmd instance group --help
.\enderloom.cmd instance tag --help
.\enderloom.cmd task list --json
.\enderloom.cmd task show TASK_ID --json
.\enderloom.cmd task cancel TASK_ID --json
.\enderloom.cmd version list --installed --json
.\enderloom.cmd loader versions fabric 1.20.1 --json
```

Settings JSON uses the snake_case fields returned by `settings get`; instance edit accepts `name`, `versionId`, `minMemoryMb`, `maxMemoryMb`, `javaPath`, `loader`, `loaderVersion`, `jvmArgs`, `jvmArgsMode`, `envVars` and `envVarsMode`. Omitted fields are retained. Unknown fields and wrong JSON types fail. Settings `--plan` validates and returns the proposed before/after without saving. Sensitive values belong in a file or stdin, and are redacted from plan/result output.

Group and tag commands include list/create/rename/delete/assign/unassign/reorder; groups additionally support `order-instances`. IDs come from the list command. A group/tag deletion, account removal, instance deletion or finished-task clearing requires `--yes`. Unsupported plans fail explicitly. `instance favorite` controls instance organization; the separately requested project Favorites workspace is still pending.

`app doctor` returns actual app/system/Java/interrupted-operation observations. It does not claim to diagnose or repair a game automatically. Device-code login, project/content/server/Catalog command breadth and complete domain plans remain in CLI-1.

The complete current service inventory is discoverable with `capabilities`. Until all typed routes are implemented, reviewed service operations can be invoked using a JSON object:

```powershell
'{"name":"CLI sandbox","versionId":"1.20.1","loader":null,"loaderVersion":null}' |
  .\enderloom.cmd operation run create_instance --json
.\enderloom.cmd operation run scan_instance_workbench --input instance.json --json
```

Use a file or piped stdin; a terminal stdin is rejected with an actionable message. Destructive bridge operations require `--yes`. `--plan` invokes only a declared native plan and refuses unsupported plans without performing the requested mutation. UI file/folder opening is an explicit visual exception. Offline reset refuses to apply while another service owns the root.

This bridge is not full typed CLI parity. Native tasks started during a CLI request carry a distinct `request_scope`. The CLI waits for those registered tasks before reporting success, including background modpack imports, and cancellation waits for their native terminal state/rollback. Tasks started by unrelated GUI requests are excluded. If cleanup cannot settle within its grace period, the result explicitly asks for attention.

Operations that create work outside the task registry (including device-code authentication), work scheduled after the originating scope has ended, cancellation during preparation before task registration, and service lifetime when other clients still own active work need further CLI-1 acceptance. They are not covered by the registered-task ownership guarantee. Full durable task history remains pending.

## Verification

- `npm run cli-qa`: strict parser, selectors, stdout envelopes/redaction, legacy behavior, actual artifact hash, result files and destructive guard.
- `npm run cli-shared-service-qa`: both ownership directions, task cancellation, authenticated endpoint and recovered process log follow.
- `npm run cli-domain-qa`: typed-route help discovery, persisted instance/group/tag changes, partial-edit preservation, invalid-input refusal, settings plan/redaction and unchanged unrelated settings.
- `npm run cli-task-ownership-qa`: local/remote timeout rollback, unrelated GUI task preservation, complete duplication, background import waiting and cancellation with no ghost instance.
- `node scripts/cli-launch-qa.js --live-account`: explicit real-account acceptance; creates/removes a disposable vanilla instance, validates actual client initialization, detach, timeout ownership and an intentionally failing JVM exit. It checks existing profiles/global settings remain unchanged and saves redacted evidence under `output/playwright/cli-live-launch`.
- `npm run cli-parity-qa`: registry drift and deliberate missing-operation/route/shared-domain challenges; part of `release-qa`.

New commands generated by `node scripts/cli-registry-generate.js` start unreviewed and fail parity until their classification, routes and exceptions have been reviewed. A generic route does not close the typed CLI-1 checklist.
