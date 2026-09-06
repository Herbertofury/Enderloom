# Codex Handoff — Enderloom Premium Testing + Full CLI

Generated: **2026-09-06**  
Repository: `Herbertofury/Enderloom`  
Branch: `main`  
Restored head at handoff start: `4425398ec90604de1cd3f764be16c3fd44649595`

## Mission

Continue Enderloom directly from the existing repository state. Do **not** restart design or replace settled architecture.

The product now has two linked premium contracts:

1. [`docs/PREMIUM_TESTING_LAB_SPEC.md`](./PREMIUM_TESTING_LAB_SPEC.md) — Performance Lab behavior, A/B testing, profiling, Fast Launch Engine, per-mod results, regression tracking, AI bundles.
2. [`docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md`](./PREMIUM_TESTING_FULL_CLI_CHECKLIST.md) — full CLI parity, Minecraft runtime control, scenario DSL, CI/Codex automation, parity enforcement.

The user requirement is stronger than `add some commands`: **meaningful Enderloom functionality must be CLI-addressable, and the complete Performance Lab must be operable from CLI/CI without GUI clicking.**

## Non-negotiable product decisions

- GUI and CLI must converge on the same domain operations and safety rules.
- Do not build a second launcher inside `cli.rs`.
- Do not implement CLI by scripting/clicking the React/Electron UI.
- Preserve existing `enderloom --launch <instance>` and `enderloom --list` compatibility.
- Unknown arguments in the future command tree should fail clearly unless explicitly passed through after `--`; current silent-ignore behavior is legacy compatibility to retire deliberately.
- Headless test modes are valid for bootstrap/logic/CI but **must not** be used to claim rendered-client FPS/GPU performance.
- Performance Lab automated tests never mutate the live Enderloom/CurseForge/Modrinth instance.
- Static JAR scan produces risk evidence, never fabricated runtime metrics.
- A mod receives a `Measured` verdict only after direct paired evidence.
- Keep evidence and history keyed by exact hashes/fingerprints.
- Long testing operations must support cancellation/recovery and preserve completed evidence.
- Do not silently upload profiler/diagnostic data to third-party services.
- External project code is research/reference only unless license review and an explicit integration design justify otherwise.

## Existing architecture already resolved

Do not rediscover these facts unless the files changed after the handoff head.

### CLI

`native/src/cli.rs`

- already uses `clap`;
- supports `--launch/-l` and `--list/-L`;
- resolves user-friendly instance selectors;
- CLI-owned launch waits for the game process and exits with it.

### Rust dependencies

`native/Cargo.toml`

- already includes `clap = { version = "4.6.6", features = ["derive"] }`;
- already has Tokio, serde/serde_json, rusqlite, hashing, sysinfo and the other required launcher foundation.

### Headless service

`native/src/bin/enderloom-service.rs`

- already exists as a non-GUI native binary;
- runs the Enderloom service protocol and reset/supervision paths.

`native/src/service.rs`

- already has a protocol-versioned JSON request format;
- already dispatches a large portion of the launcher domain surface;
- already reuses command/core functions instead of a separate external launcher implementation.

### GUI/API surface

`native/src/lib.rs`

- registers the large Tauri command surface for instances, content, packs, worlds, migration, launch/processes, logs, storage, servers, skins and more.

### Existing parity QA

`scripts/launcher-command-coverage-qa.js`

- parses `launcher/src/lib/api.ts`;
- parses `native/src/service.rs`;
- compares GUI API operations against service/Electron implementations;
- currently requires a broad launcher surface (`frontend.length >= 190`).

Use this as the seed for CLI parity enforcement. Do not manually maintain a disconnected command inventory if it can be derived/generated.

## GitHub research already completed

Do not repeat the broad search before coding. Recheck a reference only if a load-bearing fact/license/version matters to an implementation decision.

### `headlesshq/headlessmc`

Useful precedent:

- command-line Minecraft Java launcher;
- client/server/mod management;
- headless client launch;
- HMC-specific companion mods can send messages/commands, inspect GUI state and click menus;
- built-in JSON command tests;
- CI/runtime focus;
- server management;
- dummy assets and rendering-skipping/headless optimization ideas.

Design lesson: Enderloom should have a real Minecraft control plane + Probe, but must keep rendered mode for performance truth.

### `headlesshq/mc-runtime-test`

Useful precedent:

- runs Minecraft client in CI;
- virtual framebuffer support;
- helper mod enters a world, waits for chunks, exits;
- GameTest support;
- Forge/Fabric/NeoForge coverage;
- `.minecraft` caching.

Design lesson: deterministic world-entry/chunk-ready/exit should be first-class scenario steps.

### `theorzr/portablemc`

Useful precedent:

- Rust CLI/library launcher;
- one-command install+launch;
- Forge/NeoForge/Fabric/Quilt support;
- Microsoft auth/offline modes;
- machine-readable output;
- parallel download and Java discovery.

Design lesson: Enderloom machine-output UX should be equally automation-friendly.

### `PrismLauncher/PrismLauncher`

Current source exposes direct launch CLI options such as instance, server, world and profile selectors.

Design lesson: keep convenient direct-launch UX while expanding far beyond it.

### `MCCTeam/Minecraft-Console-Client`

Useful as a protocol/TUI server client for connection, chat/command and synthetic-player workflows.

Boundary: not a substitute for actual modded Minecraft runtime/render testing.

### `PrismarineJS/mineflayer`

Useful reference/optional adapter for programmable synthetic-player server tests.

Boundary: protocol bot results are not rendered-client/mod-loader results.

### `gorilla-devs/ferium`

Useful precedent for fast, profile-oriented CLI mod management across Modrinth/CurseForge/GitHub.

### `packwiz/packwiz`

Useful precedent for source-control-friendly Minecraft pack definitions and CLI import/export workflows.

### `deniz-blue/mcman`

Useful precedent for Git-friendly Minecraft server management and CI tests.

## Exact next action

Start **Phase CLI-0** from the checklist. Do not begin with UI work or profiler adapters.

### First implementation slice

1. Inspect only the files required to implement the slice:
   - `native/src/cli.rs`
   - `native/src/service.rs`
   - `native/src/bin/enderloom-service.rs`
   - `native/src/lib.rs`
   - `native/Cargo.toml`
   - `launcher/src/lib/api.ts`
   - `scripts/launcher-command-coverage-qa.js`
   - existing relevant CLI/launcher tests if present.
2. Preserve legacy CLI behavior.
3. Introduce a shared command/capability registry or equivalent single source of truth that can map:
   - canonical operation ID;
   - service command;
   - CLI route;
   - GUI/API route;
   - read/write/destructive class;
   - plan/cancellation/progress support;
   - machine schema version;
   - explicit visual-only exception when valid.
4. Add a true CLI/headless bootstrap that does not create/show the normal GUI merely to execute a command.
5. Add stable machine output envelopes for `--json` and event output for `--jsonl`.
6. Implement the first useful new subcommands through shared domain functions:
   - `enderloom capabilities --json`
   - `enderloom instance list --json`
   - `enderloom instance show <selector> --json`
   - `enderloom launch <selector> --wait`
   - `enderloom launch <selector> --detach`
   - `enderloom process list --json`
   - initial log read/follow commands where the existing domain path makes this coherent.
7. Add `scripts/cli-parity-qa.js` (or evolve the current coverage gate cleanly) and wire an npm script.
8. The parity test must fail when a meaningful domain operation gains GUI/service exposure with no CLI route and no reviewed visual-only exception.
9. Add parser/machine-output tests including invalid/ambiguous selectors and JSON stdout cleanliness.
10. Run changed-path tests, then `npm run build:integration`, the launcher integration gate, existing command coverage QA, and CLI parity QA.
11. Exercise a real built CLI command path; prove the new binary/code path is actually loaded.
12. Checkpoint source after this coherent architecture slice before broadening command coverage.

## Do not overclaim after CLI-0

CLI-0 is architecture + initial proof. It is **not** full CLI parity.

Next phase is CLI-1, closing the meaningful existing Enderloom domain surface:

- settings/app/java/accounts;
- instances/organization;
- loaders/versions;
- content/mods;
- packs;
- worlds/datapacks;
- snapshots/repair;
- migration/external instances;
- game processes/logs/captures;
- complete managed server operations;
- tasks/storage/diagnostics;
- skins/capes;
- catalog data operations moved behind a non-UI domain boundary.

Only after this shared CLI substrate is solid should Performance Lab phases build test-session schema, fingerprints, sandbox, JFR startup test, Probe runtime automation, A/B engine, Spark/Observable, whole-pack isolation and AI bundles.

## Minecraft CLI control target

The future `enderloom mc` control plane must support distinct modes:

- `rendered` — real rendering; valid for FPS/frame/GPU testing;
- `virtual-display` — CI client logic/render compatibility, not physical GPU equivalence;
- `headless` — bootstrap/game logic/CI only, invalid for frame-performance conclusions;
- `server` — dedicated server;
- `protocol-bot` — server networking/load behavior only.

Enderloom Probe should eventually expose lifecycle markers and deterministic control for title/world/chunk readiness, commands/chat, GUI inspection/click/assert, input/route playback, telemetry, profiler boundaries and clean exit.

The scenario DSL in the checklist is the portable contract shared by GUI, CLI, CI and Codex. Do not design four separate test engines.

## Verification expectations

For each implementation wave maintain:

`requirement -> implementation location -> verification action -> observed result`

Rules:

- a passing compile is not user-visible proof;
- CLI JSON must be parsed by tests, not eyeballed;
- prove commands use the current built artifact rather than stale executables;
- destructive fixture tests use disposable project/test data only;
- do not mutate real external CurseForge/Modrinth libraries during QA;
- direct game/client tests may use authorized current account state when needed;
- cancellation must terminate only Enderloom-owned test processes;
- one final challenge pass must test that CLI and GUI cannot drift onto separate implementations.

## Done state for this handoff

The Codex handoff is complete when Codex has consumed both specs and crossed into implementation of Phase CLI-0. The overall user request is not complete until the full checklist's Definition of Done is satisfied.
