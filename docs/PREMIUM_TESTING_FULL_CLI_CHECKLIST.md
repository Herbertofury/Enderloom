# Enderloom Premium Testing — Full CLI + Minecraft Automation Checklist

Status: **Accepted product contract / Codex implementation checklist**  
Updated: **2026-09-06**  
Canonical repository: `Herbertofury/Enderloom`  
Parent specification: [`docs/PREMIUM_TESTING_LAB_SPEC.md`](./PREMIUM_TESTING_LAB_SPEC.md)  
Master tracker: [GitHub issue #1](https://github.com/Herbertofury/Enderloom/issues/1)

## North-star requirement

**Everything meaningful Enderloom can do through the UI must also be scriptable through a real CLI unless the operation is purely presentational.**

The CLI is not an afterthought, UI macro layer, DOM automation shim, or duplicate implementation. The GUI, Electron IPC/service transport, CLI, tests, and future automation integrations must converge on the same domain operations and the same validation/safety rules.

For Performance Lab specifically, a user, CI runner, Codex agent, or another local tool must be able to install/prepare Minecraft, create an isolated test sandbox, launch a real client or server, wait for deterministic lifecycle states, control the test runtime, capture profiler evidence, assert outcomes, compare A/B runs, export artifacts, and terminate/clean up **without clicking the GUI**.

---

# 1. Current Enderloom baseline — preserve, expand, do not restart

## Existing CLI foundation

- [x] `native/src/cli.rs` already uses `clap`.
- [x] Existing CLI supports `-l/--launch <INSTANCE>`.
- [x] Existing CLI supports `-L/--list`.
- [x] Existing instance selectors support names / unique ID prefixes.
- [x] Existing launch-from-CLI path waits for the game when the startup CLI invocation owns the process.
- [x] `clap = 4.6.6` already exists in `native/Cargo.toml`.
- [ ] Preserve backward compatibility for existing `--launch` and `--list` behavior while introducing subcommands.
- [ ] Stop ignoring unknown CLI arguments once the new command tree is enabled. Unknown CLI input must fail clearly with a non-zero exit code unless it is intentionally passed through after `--`.

## Existing service/domain foundation

- [x] `native/src/bin/enderloom-service.rs` already provides a headless Rust service executable.
- [x] `native/src/service.rs` already implements protocol-versioned JSON command dispatch.
- [x] The service already exposes a large launcher/mod-management command surface.
- [x] `scripts/launcher-command-coverage-qa.js` already audits frontend IPC against service/Electron implementations and currently expects the full launcher API surface (190+ frontend commands).
- [ ] Reuse this service/core architecture for CLI parity instead of reimplementing launcher behavior in argument handlers.
- [ ] Create one machine-readable capability/command registry that can drive service dispatch, CLI mapping, parity QA, generated help/docs, and future agent integration.

## Architecture rule

- [ ] **GUI path:** React/Electron -> typed API -> shared domain/service operation.
- [ ] **CLI path:** Clap -> typed CLI request -> same shared domain/service operation.
- [ ] **Service path:** JSON protocol -> typed request -> same shared domain/service operation.
- [ ] No business logic should exist only inside React event handlers, Electron glue, or Clap argument handlers.
- [ ] CLI execution must not require a visible WebView/window.
- [ ] Purely headless CLI commands must not initialize rendering/UI infrastructure just to read or mutate launcher data.
- [ ] Where an operation currently exists only as Electron glue, move its domain portion behind a reusable Rust/service boundary and leave only true OS/UI glue in Electron.

---

# 2. CLI executable contract

## Invocation

Preferred UX:

```text
enderloom                     # launch normal GUI
enderloom <subcommand> ...    # CLI mode; no visible GUI
enderloom gui                 # explicitly open GUI
```

If packaging constraints make the installed GUI binary and CLI binary require separate filenames, keep `enderloom` as the user-facing shell command and use a stable internal helper name such as `enderloom-service`; do not force users to understand transport binaries.

## Global flags

- [ ] `--help`
- [ ] `--version`
- [ ] `--data-dir <PATH>`
- [ ] `--json` — one complete JSON result on stdout.
- [ ] `--jsonl` — structured progress/events and final result as JSON Lines.
- [ ] `--quiet`
- [ ] `--verbose` / `-v`, repeatable where useful.
- [ ] `--no-color`
- [ ] `--non-interactive`
- [ ] `--yes` for explicitly approved destructive operations.
- [ ] `--timeout <DURATION>` where the command can wait.
- [ ] `--trace-id <ID>` or generated run correlation ID surfaced in result metadata.
- [ ] `--output <PATH>` for result/artifact manifests when applicable.
- [ ] `--dry-run` / `--plan` for destructive or high-impact mutations where a meaningful plan exists.

## Output discipline

- [ ] Human-readable normal output goes to stdout.
- [ ] Machine-readable `--json` output contains **only** the result envelope on stdout.
- [ ] Logs, warnings, and progress go to stderr when `--json` is active.
- [ ] `--jsonl` uses a versioned event envelope.
- [ ] Never mix ANSI progress bars into machine-readable output.
- [ ] Every machine result includes `schema_version`, `command`, `ok`, `trace_id`, and useful stable identifiers.
- [ ] Long-running commands emit stage/progress events without making callers parse prose.
- [ ] Do not print secrets, Microsoft tokens, CurseForge keys, cookies, passwords, or launcher credentials.

## Stable exit-code families

Exact numeric values may be finalized during implementation, but once released they are API:

- [ ] success / test passed
- [ ] invalid CLI usage
- [ ] preflight/environment failure
- [ ] dependency/compatibility impossibility
- [ ] Minecraft install/launch failure
- [ ] timeout
- [ ] test/assertion failure
- [ ] profiler/instrumentation failure
- [ ] regression threshold exceeded
- [ ] user cancellation
- [ ] partial result with preserved artifacts when a later optional stage fails

## Automation ergonomics

- [ ] PowerShell completion.
- [ ] Bash completion.
- [ ] Zsh completion.
- [ ] Fish completion.
- [ ] `enderloom completion <shell>` command.
- [ ] `enderloom capabilities --json` machine-readable command map.
- [ ] `enderloom schema` or equivalent command that emits supported command/result schema versions.
- [ ] Environment-variable equivalents only for stable global configuration; explicit CLI flags override environment values.
- [ ] Credentials use Windows Credential Manager/keyring, stdin, or environment variables as appropriate; avoid secrets in command arguments/process lists.

---

# 3. Full launcher CLI parity checklist

Every row below must either receive a CLI route or be placed in an explicit `UI_ONLY_EXCEPTIONS` registry with a reason proving it is purely presentational.

## App / settings / environment

- [ ] `enderloom app info`
- [ ] `enderloom app doctor`
- [ ] `enderloom app paths`
- [ ] `enderloom app network test [URL]`
- [ ] `enderloom settings get`
- [ ] `enderloom settings set ...`
- [ ] `enderloom java list`
- [ ] `enderloom java install <VERSION>`
- [ ] `enderloom launch preview ...`
- [ ] `enderloom storage scan`
- [ ] `enderloom storage reclaim ...`
- [ ] `enderloom update check`
- [ ] Safe launcher reset/recovery commands with explicit confirmation/plan.

## Accounts / identity / appearance

- [ ] `enderloom auth login` using device-code flow without needing the GUI.
- [ ] `enderloom auth list`
- [ ] `enderloom auth use <ACCOUNT>`
- [ ] `enderloom auth remove <ACCOUNT>`
- [ ] `enderloom skin list/add/apply/reset/delete/rename`
- [ ] `enderloom cape list/apply/reset` where current account APIs allow it.

## Instances / organization

- [ ] `enderloom instance list`
- [ ] `enderloom instance show <INSTANCE>`
- [ ] `enderloom instance create`
- [ ] `enderloom instance edit`
- [ ] `enderloom instance duplicate`
- [ ] `enderloom instance delete`
- [ ] `enderloom instance repair`
- [ ] `enderloom instance note`
- [ ] `enderloom instance favorite`
- [ ] `enderloom instance group ...`
- [ ] `enderloom instance tag ...`
- [ ] `enderloom instance banner/logo ...`
- [ ] `enderloom instance reconcile`
- [ ] Stable exact IDs are always available even when user-friendly name/prefix selectors are accepted.

## Versions / loaders

- [ ] `enderloom version list`
- [ ] `enderloom loader list`
- [ ] `enderloom loader versions <LOADER> <MC_VERSION>`
- [ ] Forge, NeoForge, Fabric, Quilt behavior matches GUI resolver behavior.

## Content: mods / resource packs / shaders / data packs / other managed content

- [ ] `enderloom content search`
- [ ] `enderloom content show`
- [ ] `enderloom content versions`
- [ ] `enderloom content changelog`
- [ ] `enderloom content plan-install`
- [ ] `enderloom content install`
- [ ] `enderloom content update`
- [ ] `enderloom content freeze/unfreeze`
- [ ] `enderloom content enable/disable`
- [ ] `enderloom content dependents`
- [ ] `enderloom content plan-remove`
- [ ] `enderloom content remove`
- [ ] `enderloom content add-file`
- [ ] `enderloom mod ...` convenience alias for `content --kind mods`.
- [ ] CurseForge manual-download handoffs return a structured actionable state instead of pretending the download succeeded.
- [ ] Exact version/provider IDs and hashes remain available in JSON output.

## Modpacks / interchange

- [ ] `enderloom pack inspect`
- [ ] `enderloom pack import`
- [ ] `enderloom pack import-packwiz`
- [ ] `enderloom pack export`
- [ ] `enderloom pack link/unlink`
- [ ] `enderloom pack check-update`
- [ ] `enderloom pack plan-update`
- [ ] `enderloom pack update`
- [ ] MRPack, CurseForge ZIP, and packwiz parity with GUI.

## Worlds / data packs

- [ ] `enderloom world list`
- [ ] `enderloom world inspect`
- [ ] `enderloom world import`
- [ ] `enderloom world delete`
- [ ] `enderloom datapack list/add/install/update/enable/disable/remove`

## Snapshots / backups / recovery

- [ ] `enderloom snapshot list`
- [ ] `enderloom snapshot create`
- [ ] `enderloom snapshot rename`
- [ ] `enderloom snapshot restore`
- [ ] `enderloom snapshot delete`
- [ ] Restore/destructive paths use the same rollback rules as GUI.

## Launcher migration / external instances

- [ ] `enderloom migrate detect`
- [ ] `enderloom migrate scan`
- [ ] `enderloom migrate import`
- [ ] `enderloom migrate connect-in-place`
- [ ] `enderloom migrate reconcile`
- [ ] Preserve physical-path/junction safety.

## Game launch / processes / logs / captures

- [ ] `enderloom launch <INSTANCE>`
- [ ] `enderloom launch <INSTANCE> --wait`
- [ ] `enderloom launch <INSTANCE> --detach`
- [ ] `enderloom process list`
- [ ] `enderloom process stop <RUN>`
- [ ] `enderloom process logs <RUN> --follow`
- [ ] `enderloom logs list/search/show/redact/delete`
- [ ] `enderloom screenshot list/delete/path`
- [ ] Clipboard-only GUI actions may have a CLI equivalent that prints/exports the validated file path rather than requiring clipboard APIs.

## Servers

- [ ] `enderloom server list/show/create/import/install/delete`
- [ ] `enderloom server software list`
- [ ] `enderloom server eula accept`
- [ ] `enderloom server start/stop/restart/kill`
- [ ] `enderloom server command`
- [ ] `enderloom server console --follow`
- [ ] `enderloom server properties get/set`
- [ ] `enderloom server player list/add/remove`
- [ ] `enderloom server whitelist on/off`
- [ ] `enderloom server content list/install/update/enable/disable/remove`
- [ ] `enderloom server files list/read/write/mkdir/move/delete/upload`
- [ ] `enderloom server disk-usage`
- [ ] `enderloom server pack install/update`
- [ ] All unsafe file paths remain constrained by current server filesystem guards.

## Tasks / cancellation

- [ ] `enderloom task list`
- [ ] `enderloom task show`
- [ ] `enderloom task cancel`
- [ ] `enderloom task clear-finished`
- [ ] Long CLI operations surface task IDs immediately in JSONL/event mode.

## Catalog / research workspace

Catalog is currently partly outside the native launcher command surface, but the user's **full CLI everywhere** requirement applies to meaningful catalog data operations too.

- [ ] `enderloom catalog list`
- [ ] `enderloom catalog search`
- [ ] `enderloom catalog show`
- [ ] `enderloom catalog favorite`
- [ ] `enderloom catalog note`
- [ ] `enderloom catalog import`
- [ ] `enderloom catalog export`
- [ ] `enderloom catalog refresh`
- [ ] `enderloom catalog install` bridges to the same instance/install planner used by GUI.
- [ ] Source URL enumeration available as structured data.
- [ ] Browser tab placement, split-pane layout, hover state, theme and other visual-only shell behavior may be explicitly UI-only.
- [ ] Do **not** implement catalog CLI by driving the Chromium UI; move/reuse catalog domain functions behind an addressable service/module.

---

# 4. CLI parity enforcement — make missing coverage impossible to ignore

## Capability registry

- [ ] Introduce a stable descriptor for each domain operation, including:
  - canonical operation ID
  - read/write/destructive classification
  - service command
  - CLI route
  - GUI/API route
  - required permissions/state
  - machine output schema version
  - whether it supports plan/dry-run
  - whether it supports cancellation/progress
  - explicit UI-only exception reason when applicable
- [ ] `enderloom capabilities --json` emits this registry or a safe public projection.

## Automated QA

- [ ] Extend `scripts/launcher-command-coverage-qa.js` or add `scripts/cli-parity-qa.js`.
- [ ] Parse the existing launcher API/service command surface.
- [ ] Fail CI when a new meaningful GUI/service domain operation has no CLI mapping and no approved visual-only exception.
- [ ] Fail CI when two CLI commands map to divergent duplicated domain implementations.
- [ ] Verify existing legacy `--launch` and `--list` behavior remains accepted.
- [ ] Add `npm run cli-parity-qa`.
- [ ] Include CLI parity in `release-qa` / release acceptance.

---

# 5. Minecraft runtime control plane (`enderloom mc`)

Performance Lab needs a Minecraft-specific CLI that can do more than merely spawn `javaw.exe`.

## Runtime modes

Every test result must record the mode because the mode changes what conclusions are valid.

- [ ] `rendered` — normal real client rendering. Required for trustworthy FPS, frame-time and GPU measurements.
- [ ] `virtual-display` — real client on a virtual framebuffer/hidden test display. Useful for CI/client logic; do not claim physical GPU/FPS equivalence.
- [ ] `headless` — rendering stubbed/skipped. Useful for client bootstrap, logic, compatibility and GameTest-style checks; invalid for render performance conclusions.
- [ ] `server` — dedicated `nogui` server runtime.
- [ ] `protocol-bot` — lightweight Minecraft protocol client for server connectivity/load behavior only; never a substitute for a modded rendered client.

## Core commands

- [ ] `enderloom mc install --instance <ID>`
- [ ] `enderloom mc launch --instance <ID> --mode <MODE>`
- [ ] `enderloom mc attach --run <ID>`
- [ ] `enderloom mc wait --run <ID> --state <STATE>`
- [ ] `enderloom mc wait --run <ID> --log-regex <REGEX>`
- [ ] `enderloom mc exit --run <ID>`
- [ ] `enderloom mc kill --run <ID>`
- [ ] `enderloom mc status --run <ID> --json`

Lifecycle states should include at minimum:

- [ ] JVM-started
- [ ] loader-started
- [ ] mods-initialized
- [ ] title-ready
- [ ] world-open
- [ ] player-ready
- [ ] chunks-ready / benchmark-region-ready
- [ ] server-ready
- [ ] profiler-ready
- [ ] scenario-complete
- [ ] exited

## In-game command/control through Enderloom Probe

Create a small loader-specific test-only **Enderloom Probe** inspired by the control capabilities demonstrated by HeadlessMc/HMC-Specifics, but implement Enderloom's own protocol and code.

- [ ] `enderloom mc command --run <ID> '/time set day'`
- [ ] `enderloom mc chat --run <ID> <TEXT>`
- [ ] `enderloom mc gui dump --run <ID>`
- [ ] `enderloom mc gui click --run <ID> ...`
- [ ] `enderloom mc gui assert --run <ID> ...`
- [ ] `enderloom mc input key --run <ID> ...`
- [ ] `enderloom mc input mouse --run <ID> ...`
- [ ] `enderloom mc look --run <ID> --yaw ... --pitch ...`
- [ ] `enderloom mc move --run <ID> ...`
- [ ] `enderloom mc interact --run <ID> ...`
- [ ] `enderloom mc screenshot --run <ID> --out <PATH>` captures actual runtime output only.
- [ ] `enderloom mc telemetry --run <ID>`
- [ ] Probe communication is authenticated/local-scoped enough that unrelated local processes cannot silently control a user's normal session.
- [ ] Probe is injected into isolated test sandboxes by default and never silently remains in the live profile.

## GameTest

- [ ] `enderloom mc gametest list`
- [ ] `enderloom mc gametest run --all`
- [ ] `enderloom mc gametest run --namespace <NS>`
- [ ] Capture per-test pass/fail/duration/error into structured result JSON.
- [ ] Support modern built-in GameTest where practical.
- [ ] Provide Probe-based fallback assertions for versions/loaders where GameTest registration is missing or unreliable.

## Server console / RCON-like control

- [ ] Use existing supervised server stdin/console where available.
- [ ] Optional RCON adapter may be added for external servers, but local managed servers should not require RCON just to be testable.
- [ ] `enderloom mc server-command` may alias the existing `enderloom server command` behavior for scenario scripts.

---

# 6. Test Scenario DSL — one format for GUI, CLI, CI and Codex

Create a versioned YAML/JSON scenario format. The GUI may build/edit scenarios visually, but the file is the canonical portable automation contract.

Example shape:

```yaml
schema: enderloom.test/v1
name: client-traversal-baseline
runtime: rendered
instance: <instance-id>
world:
  snapshot: benchmark-world-v1
settings:
  render_distance: 12
  simulation_distance: 8
warmup: 30s
steps:
  - wait: { state: world-open, timeout: 120s }
  - wait: { state: chunks-ready, timeout: 90s }
  - profiler.start: { providers: [jfr, spark] }
  - route.play: { route: village-loop-v1 }
  - measure: { duration: 60s }
  - profiler.stop: {}
  - assert: { metric: frame_time_p99_ms, lt: 50 }
  - exit: {}
```

Checklist:

- [ ] `enderloom test scenario list`
- [ ] `enderloom test scenario show <ID>`
- [ ] `enderloom test scenario validate <FILE>`
- [ ] `enderloom test scenario run <FILE|ID>`
- [ ] `enderloom test scenario copy <ID>`
- [ ] `enderloom test scenario export <ID>`
- [ ] Schema is versioned and migrations are explicit.
- [ ] Unknown fields fail clearly in strict mode.
- [ ] Scenario execution is deterministic where Minecraft allows it.
- [ ] Every step has explicit timeout/cancellation behavior.
- [ ] Assertions return machine-readable failure reason and observed value.
- [ ] Scenario supports environment preconditions and skip reasons.
- [ ] Scenario supports client, integrated-server, dedicated-server and protocol-bot stages.
- [ ] No arbitrary shell execution inside a scenario by default.
- [ ] Any optional external-command hook requires explicit user opt-in and is shown in the scenario review/plan.

---

# 7. Performance Lab CLI

## Quick/static analysis

- [ ] `enderloom test quick-scan --jar <PATH>`
- [ ] `enderloom test quick-scan --instance <ID> --mod <SELECTOR>`
- [ ] `enderloom test quick-scan --instance <ID> --all`
- [ ] Output static risk findings, metadata, dependency graph clues and evidence paths.
- [ ] Never output invented FPS/TPS numbers from static analysis.

## Baselines

- [ ] `enderloom test baseline create --instance <ID> --scenario <ID>`
- [ ] `enderloom test baseline list`
- [ ] `enderloom test baseline show <ID>`
- [ ] `enderloom test baseline invalidate <ID>` where explicitly requested.
- [ ] Fingerprint compatibility decides reuse automatically.

## Direct tests

- [ ] `enderloom test startup --instance <ID>`
- [ ] `enderloom test client-fps --instance <ID> --scenario <ID>`
- [ ] `enderloom test server-tps --instance <ID> --scenario <ID>`
- [ ] `enderloom test memory --instance <ID> --scenario <ID>`
- [ ] `enderloom test lag-spikes --instance <ID> --scenario <ID>`
- [ ] `enderloom test mod-impact --instance <ID> --mod <SELECTOR> --scenario <ID>`
- [ ] `enderloom test interactions --instance <ID> --mods ...`

## Whole-pack test

- [ ] `enderloom test all --instance <ID> --scenario <ID>`
- [ ] Default is adaptive dependency-aware cohort isolation + direct confirmation.
- [ ] `--exhaustive` explicitly requests direct per-mod confirmation even when expensive.
- [ ] `--resume <SESSION>` resumes from durable completed sub-runs rather than starting over.
- [ ] `--max-runs` can bound exploratory mode, but never silently converts a requested exhaustive run into sampling.
- [ ] `--fail-fast` optional for CI; interactive/full analysis defaults to preserve useful completed evidence.

## Results / comparisons

- [ ] `enderloom test result list`
- [ ] `enderloom test result show <RUN>`
- [ ] `enderloom test compare <A> <B>`
- [ ] `enderloom test regression --baseline <A> --candidate <B>`
- [ ] `enderloom test history --mod <HASH|SELECTOR>`
- [ ] `enderloom test artifacts <RUN>`
- [ ] `enderloom test export <RUN> --format json|md|zip`
- [ ] Result JSON exposes raw metrics, deltas, confidence/noise, verdict classification and artifact paths.

## Cancellation / recovery

- [ ] `enderloom test cancel <SESSION>`
- [ ] `enderloom test resume <SESSION>`
- [ ] Cancellation stops owned Minecraft/profiler processes, preserves completed evidence and cleans only disposable state.
- [ ] Crash recovery discovers interrupted test sandboxes and offers resume/cleanup instead of deleting evidence blindly.

---

# 8. Profiler CLI adapters

## JFR

- [ ] `enderloom profile jfr start ...`
- [ ] `enderloom profile jfr stop ...`
- [ ] `enderloom profile jfr summarize <FILE>`
- [ ] JFR can be injected from JVM launch flags for startup profiling.
- [ ] Original `.jfr` is retained; normalized summary is separate.

## Spark

- [ ] `enderloom profile spark ensure --instance <TEST_SANDBOX>` resolves a compatible official build.
- [ ] `enderloom profile spark start/stop`
- [ ] Prefer local artifacts; public upload is never required for Performance Lab.
- [ ] Import Spark data into Enderloom's normalized session model.

## Observable

- [ ] `enderloom profile observable ensure`
- [ ] `enderloom profile observable scan`
- [ ] Optional deep-world spatial adapter only where loader/version support is valid.

## Native/system telemetry

- [ ] `enderloom profile process ...`
- [ ] CPU, memory, disk, network and supported GPU process telemetry stream into the same timeline.

---

# 9. Protocol-bot / synthetic-player test lane

This lane is useful for **server load, networking, command workflows and player-count behavior**. It must never be labeled as a rendered mod-client benchmark.

- [ ] `enderloom bot spawn --count N --server HOST:PORT --scenario <ID>`
- [ ] `enderloom bot list`
- [ ] `enderloom bot command`
- [ ] `enderloom bot stop`
- [ ] Deterministic connection ramp rate.
- [ ] Optional scripted chat/movement/inventory actions where the protocol adapter supports them.
- [ ] Record connection failures, latency, server tick effect and per-bot scenario completion.
- [ ] Keep this adapter optional and separable from core Enderloom binaries if dependency/licensing footprint is undesirable.

Potential implementation approaches to evaluate:

- a small Enderloom-native protocol test client;
- an external Mineflayer adapter for rich scripted bots;
- Minecraft Console Client adapter for console/protocol smoke flows.

Never copy external implementations without license review.

---

# 10. GitHub projects to learn from — current research

These are **research references**, not code to blindly import.

## HeadlessMc — `headlesshq/headlessmc`

Repository: https://github.com/headlesshq/headlessmc

Observed strengths worth absorbing:

- command-line launcher for Minecraft Java;
- manages clients, servers and mods;
- launches the client headlessly;
- HMC-Specifics can send chat/commands, dump GUI state and click menus;
- built-in JSON command-test framework;
- CI/runtime-test focus;
- server install/run commands;
- dummy assets and headless optimizations;
- explicit distinction between headless approaches;
- active v3 rewrite noted in the project README, moving toward Picocli.

Enderloom direction:

- implement our own first-class Rust/Clap control plane on top of Enderloom's existing service/core;
- copy the **capability ideas**, not implementation;
- preserve a real rendered mode because Performance Lab must measure FPS/GPU when requested.

## MC-Runtime-Test — `headlesshq/mc-runtime-test`

Repository: https://github.com/headlesshq/mc-runtime-test

Observed strengths:

- runs Minecraft clients in CI;
- builds on HeadlessMc;
- virtual framebuffer support;
- lightweight helper mod joins a single-player world, waits for chunks, then quits;
- supports Minecraft GameTest workflows;
- supports Forge/Fabric/NeoForge across a broad version range;
- caches `.minecraft` to accelerate repeated CI runs.

Enderloom direction:

- Enderloom Probe owns deterministic warm-up/world-entry/test-exit behavior;
- benchmark sandbox caches immutable assets/libraries and valid fingerprints;
- GameTest becomes one scenario step, not the whole system.

## PortableMC — `theorzr/portablemc`

Repository: https://github.com/theorzr/portablemc

Observed strengths:

- Rust command-line launcher/library;
- one-command install + launch;
- Forge, NeoForge, Fabric, Quilt and older loader support;
- Microsoft and offline account flows;
- version browsing;
- machine-readable output mode;
- parallel downloads;
- Java discovery/fallback.

Enderloom direction:

- match or exceed its CLI ergonomics and machine-output discipline while retaining Enderloom's richer instance/modpack/server/testing state.

## Prism Launcher — `PrismLauncher/PrismLauncher`

Repository: https://github.com/PrismLauncher/PrismLauncher

Observed CLI launch options in current source include:

- `--launch <instance>`
- `--server <address>` with launch
- `--world <world>` with launch
- `--profile <account>` with launch

Enderloom direction:

- preserve the convenient direct-launch pattern, but expose the complete Enderloom domain surface rather than only launch selectors.

## Minecraft Console Client — `MCCTeam/Minecraft-Console-Client`

Repository: https://github.com/MCCTeam/Minecraft-Console-Client

Observed strengths:

- lightweight cross-platform terminal/TUI Minecraft Java protocol client;
- connects to servers without opening the graphical game;
- sends commands and receives text;
- automation/bot-oriented workflows.

Important boundary:

- useful for server connectivity/protocol smoke/load scenarios;
- **not** valid for testing the rendering, mixins, class loading or client performance of the user's actual modded Minecraft runtime.

## Mineflayer — `PrismarineJS/mineflayer`

Repository: https://github.com/PrismarineJS/mineflayer

Observed strength:

- mature programmable Minecraft bot API with tick-aware scripting and a wide plugin ecosystem.

Enderloom direction:

- optional adapter/reference for synthetic-player server load scenarios;
- never substitute a Mineflayer bot for a real modded client benchmark.

## Ferium — `gorilla-devs/ferium`

Repository: https://github.com/gorilla-devs/ferium

Observed strengths:

- fast CLI mod manager;
- Modrinth + CurseForge + GitHub Releases;
- profiles;
- one-command compatible upgrades;
- scan/import behavior;
- no-GUI build option for servers.

Enderloom direction:

- make `enderloom content/mod` equally automation-friendly while preserving Enderloom's dependency plans, rollback, provider provenance and external-instance safety.

## packwiz — `packwiz/packwiz`

Repository: https://github.com/packwiz/packwiz

Observed strengths:

- Git-friendly command-line modpack workflow;
- CurseForge/Modrinth import/export;
- client/server-side content metadata;
- portable metadata instead of opaque launcher-only state.

Enderloom direction:

- expose pack import/export and test scenario state as source-control-friendly files.

## mcman — `deniz-blue/mcman`

Repository: https://github.com/deniz-blue/mcman

Observed strengths:

- Minecraft server manager CLI;
- Git-friendly server definition;
- config/world/network management;
- multiple content sources;
- CI test flow (`mcman run --test`).

Enderloom direction:

- expose Enderloom's already-rich managed server surface through CLI and make server performance scenarios CI-addressable.

---

# 11. Fast Launch Engine CLI integration

- [ ] `enderloom test prepare` pre-resolves Java/loader/game assets/natives/auth/dependencies.
- [ ] `enderloom test sandbox create` materializes only mutable test state.
- [ ] `enderloom test sandbox show`
- [ ] `enderloom test sandbox clean`
- [ ] `enderloom test sandbox recover`
- [ ] Reuse immutable assets/libraries safely rather than full-copying profiles per run.
- [ ] Reuse a baseline only when fingerprint compatibility is proven.
- [ ] `--cold` test mode intentionally invalidates selected caches when measuring cold startup.
- [ ] `--warm` test mode preserves documented caches.
- [ ] Result explicitly records cold/warm cache policy.
- [ ] Headless/dummy-asset acceleration is allowed only for tests whose conclusions remain valid under that mode.

---

# 12. AI / Codex-ready diagnostic CLI

- [ ] `enderloom diagnostic bundle --run <ID>`
- [ ] `enderloom diagnostic inspect <ZIP>`
- [ ] `enderloom diagnostic redact <RUN|ZIP>`
- [ ] `enderloom ai prompt --run <ID>`
- [ ] `enderloom ai bundle --run <ID>`
- [ ] `enderloom ai open --provider chatgpt|claude|gemini|copilot`
- [ ] Never claim an external upload occurred without provider acknowledgement.
- [ ] User can choose whether the target mod JAR is included.
- [ ] Bundle manifest lists every included/redacted/omitted file and hash.
- [ ] Generated prompt includes exact test mode so AI cannot mistake headless evidence for rendered-client evidence.

---

# 13. Security and safety requirements

- [ ] Never pass auth tokens/passwords on the command line when a safer channel exists.
- [ ] Redact sensitive values from process args, logs and machine output.
- [ ] `--json` must be safe to archive/share by default except clearly labeled raw diagnostic commands.
- [ ] Destructive commands require explicit target identity and confirmation policy.
- [ ] `--yes` never broadens path permissions or bypasses root/path guards.
- [ ] CLI server file operations use the same traversal/symlink protections as GUI.
- [ ] Test sandboxes are isolated from real saves/configs.
- [ ] Probe control channel is scoped to Enderloom-owned test runs.
- [ ] External scenario hooks never execute arbitrary downloaded commands automatically.
- [ ] Provider integrations preserve existing credential-storage rules.

---

# 14. CLI test matrix

## Parser/contract

- [ ] help for every command and subcommand
- [ ] stable legacy flags
- [ ] invalid command returns non-zero
- [ ] missing required args returns non-zero
- [ ] unknown args rejected except explicit passthrough after `--`
- [ ] selectors reject ambiguity
- [ ] JSON stdout remains valid while warnings occur on stderr
- [ ] JSONL progress schema validation
- [ ] shell completion generation

## Real launcher behavior

- [ ] list instances
- [ ] create/edit/duplicate/delete disposable fixture instance
- [ ] install game/loader fixture
- [ ] install/toggle/remove test content
- [ ] snapshot/restore
- [ ] launch + wait + logs + clean exit
- [ ] managed server install/start/command/stop
- [ ] pack import/export fixture
- [ ] external instance remains untouched when only connected/scanned

## Minecraft test control

- [ ] Probe handshake
- [ ] title-ready detection
- [ ] world-open detection
- [ ] chunks-ready detection
- [ ] in-game command
- [ ] GUI dump/assert on at least one supported client version
- [ ] GameTest run
- [ ] deterministic route playback
- [ ] automatic profiler start/stop
- [ ] automatic clean exit
- [ ] timeout/cancel kills only owned test processes

## Performance proof

- [ ] deliberate startup regression detected
- [ ] deliberate server tick regression detected
- [ ] deliberate rendered-client frame regression detected in `rendered` mode
- [ ] deliberate allocation/GC regression detected
- [ ] same frame regression is **not** falsely claimed from `headless` mode
- [ ] profiler overhead challenge pass
- [ ] noisy A/B run repeats automatically until configured confidence/rule is met

## Parity gate

- [ ] every meaningful launcher API/service operation has CLI route or reviewed UI-only exception
- [ ] adding a new service/API command without parity fails CI
- [ ] release QA runs CLI parity gate

---

# 15. Implementation order for Codex

Do not attempt to build the entire Performance Lab before the CLI foundation is trustworthy.

## Phase CLI-0 — shared command foundation

- [ ] Preserve exact current `main` behavior and existing `--launch` / `--list` compatibility.
- [ ] Inventory the existing `launcher/src/lib/api.ts` + `native/src/service.rs` command surface using the already-existing coverage QA instead of manually rediscovering commands.
- [ ] Introduce a typed/shared command registry or equivalent single source of truth.
- [ ] Refactor service dispatch to use the shared operations without changing protocol behavior.
- [ ] Add CLI command/result envelope types.
- [ ] Add headless state/bootstrap path that does not create a visible GUI.
- [ ] Add global `--json`, `--jsonl`, `--quiet`, `--no-color` behavior.
- [ ] Add `capabilities` and parity QA.
- [ ] Targeted tests + integration build.
- [ ] Checkpoint before expanding breadth.

## Phase CLI-1 — launcher domain parity

- [ ] instances
- [ ] settings/java/accounts
- [ ] content/mods
- [ ] packs
- [ ] worlds/datapacks
- [ ] snapshots/repair
- [ ] launch/process/logs
- [ ] migration
- [ ] servers
- [ ] storage/diagnostics
- [ ] skins
- [ ] catalog domain operations
- [ ] parity QA reaches zero unexplained domain gaps.

## Phase CLI-2 — test-session foundation

- [ ] normalized test-session schema
- [ ] fingerprinting
- [ ] sandbox create/recover/clean
- [ ] JFR startup test
- [ ] CLI result/history commands

## Phase CLI-3 — Minecraft Probe/control plane

- [ ] loader-specific Probe
- [ ] local control protocol
- [ ] lifecycle markers
- [ ] command/chat/GUI/assert/input/route control
- [ ] rendered vs headless vs virtual-display truth labels
- [ ] GameTest adapter

## Phase CLI-4 — direct A/B and Fast Launch Engine

- [ ] direct mod-impact CLI
- [ ] reusable compatible baseline
- [ ] dependency-safe variant materialization
- [ ] repeated/noise-aware comparisons
- [ ] automatic cleanup/recovery

## Phase CLI-5 — profiler adapters + whole-pack intelligence

- [ ] Spark
- [ ] Observable
- [ ] adaptive whole-pack sweep
- [ ] interaction tests
- [ ] synthetic player/protocol-bot lane

## Phase CLI-6 — AI bundle + polish

- [ ] diagnostic bundle CLI
- [ ] provider-neutral prompt/open workflow
- [ ] shell completion
- [ ] generated CLI docs/examples
- [ ] CI examples
- [ ] full release challenge pass

---

# 16. Exact first Codex implementation slice

Codex should start here, not by creating UI mockups:

1. Read `docs/PREMIUM_TESTING_LAB_SPEC.md` and this checklist.
2. Inspect `native/src/cli.rs`, `native/src/service.rs`, `native/src/bin/enderloom-service.rs`, `native/src/lib.rs`, `native/Cargo.toml`, `launcher/src/lib/api.ts`, and `scripts/launcher-command-coverage-qa.js`.
3. Preserve current command protocol and existing launch/list behavior.
4. Build the shared CLI/domain command registry + machine output envelope.
5. Implement a no-visible-GUI CLI bootstrap.
6. Ship first useful subcommands:
   - `enderloom capabilities --json`
   - `enderloom instance list --json`
   - `enderloom instance show <selector> --json`
   - `enderloom launch <selector> --wait|--detach`
   - `enderloom process list --json`
   - `enderloom logs ...`
7. Add `scripts/cli-parity-qa.js` and wire it into `package.json`.
8. Prove the actual installed/built CLI path uses the new code, not a stale executable.
9. Run targeted Rust/Node checks, `build:integration`, launcher integration QA, CLI parity QA, and one real CLI launch workflow where environment access permits.
10. Checkpoint source before starting the Performance Lab schema/JFR work.

Do not call this full CLI parity after the first slice. The first slice establishes architecture and proof; Phase CLI-1 closes the remaining domain surface.

---

# 17. Definition of done

The **full CLI everywhere** requirement is satisfied only when:

- [ ] A normal user can perform all meaningful launcher/mod/server/testing operations without opening the GUI.
- [ ] GUI and CLI use the same domain logic and safety rules.
- [ ] Performance Lab can be run entirely from CLI/CI.
- [ ] Minecraft can be launched and deterministically controlled for supported test scenarios from CLI.
- [ ] Real rendered-client benchmarks remain distinct from headless/virtual/protocol tests.
- [ ] Every output needed by an AI/Codex workflow has a stable machine-readable form.
- [ ] CLI parity is automatically enforced in CI.
- [ ] Help/completions/examples make the CLI discoverable without reading source.
- [ ] Cancellation, timeouts and crash recovery preserve evidence and clean only owned test state.
- [ ] No live external CurseForge/Modrinth profile is mutated by automated testing.
- [ ] The release challenge pass confirms the CLI is not merely a second implementation that has drifted from GUI behavior.
