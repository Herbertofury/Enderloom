# Enderloom continuation — CLI, Favorites and Performance Lab

Accepted continuation: 2026-09-06. Preserve the completed Config/Addons/mod-lineage work at `6a54f72` and the user's unrelated working changes. Continue the existing architecture; completion of one wave is not completion of this goal.

## Source requirements

- [Config, Addons and mod lineage](CONFIG_ADDONS_WORKBENCH.md): completed original feature and acceptance evidence.
- [User-supplied CLI handoff](CODEX_HANDOFF_PREMIUM_TESTING_CLI.md): imported verbatim from Downloads.
- [User-supplied Favorites/Performance checklist](ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md): imported verbatim; every unchecked requirement remains in scope.
- [Full CLI contract](PREMIUM_TESTING_FULL_CLI_CHECKLIST.md) and [Performance Lab specification](PREMIUM_TESTING_LAB_SPEC.md): recovered from the handoff's exact repository commit `4425398ec90604de1cd3f764be16c3fd44649595`; no checkout reset or merge was performed.

The documents give different starting orders. Use the CLI handoff's explicit CLI-0 foundation first, then close the existing domain surface and implement Favorites before Performance Lab. Favorites and Performance use the same CLI/domain foundation. Optional adapter features remain optional as specified; all explicit acceptance criteria remain required.

## Continuous execution ledger

For each item: implement, demonstrate the built command or real UI behavior, immediately record requirement → implementation → verification → observed result, and checkpoint coherent progress. Record blockers beside the affected item. Do not restart completed waves or mark future requirements complete from compile-only evidence.

- [x] **0. Incorporate source contracts and inspect the existing foundation.** Proof: read both supplied files and both exact-commit references; inspected Clap legacy handling, native service dispatch/bootstrap, binary entry points, dependencies, frontend API and the existing command-coverage gate. Current base is `6a54f72`, not the historical handoff checkout.
- [x] **CLI-0a. Shared capability registry and parity enforcement.** `native/src/capabilities.{json,rs}`, `scripts/lib/command-surface.js`, `scripts/cli-parity-qa.js` → built discovery and deliberate missing-operation/route/shared-domain challenges → pass; 217 reviewed descriptors, 214 actual service operations, 213 GUI calls, two visual-only exceptions. A nested `running` match value is correctly excluded.
- [x] **CLI-0b. Real headless command entry and output.** `native/src/{cli_headless,control_ipc,service}.rs`, console binary and desktop adapter → `cli-qa` (29 checks), bidirectional `cli-shared-service-qa` → pass. Real root lease, authenticated local sharing, same task registry/cancellation, strict parser, legacy selectors/list, JSON/JSONL, stable IDs and credential redaction. No normal GUI needed by native command invocation.
- [x] **CLI-0c. First useful commands.** Capabilities, instance list/show, launch wait/detach, process list and initial log read/follow → built-process tests plus `node scripts/cli-launch-qa.js --live-account` → pass on actual Minecraft 1.20.1. Client initialization observed; detached run survived command exit and log timeout; waiting launch timeout stopped only its own run; deliberately invalid JVM option produced exit family 5 with real exit evidence. Existing profiles and global settings compared unchanged, disposable instance removed. Artifact SHA-256 `f9a712e8ec75d001a5853a941c466d9d5205f1f9bc707d277a9b09678d11d80c`; evidence `output/playwright/cli-live-launch/report.json` and redacted JSONL. This is launch acceptance, not a performance benchmark.
- [x] **CLI-0d. Gates and checkpoint.** `build:integration`, launcher integration (repeated after the immediate-exit fix), command coverage, CLI parity, 29 built CLI checks, shared-owner acceptance and actual Minecraft launch acceptance → pass. Existing workbench native checks (37), production Electron workbench UI (zero renderer errors), combined Electron self-test and release QA (50 suites) → pass. Checkpoint: shared CLI foundation and imported continuation contracts; unrelated user changes excluded. Remaining coverage limitations are recorded below and in `docs/CLI.md`.
- [ ] **CLI-1. Full existing domain parity.** Every category and operation in the full CLI contract, including Catalog's data boundary; typed discoverable routes and no unexplained gaps. A generic operation transport alone does not complete this wave.
- [ ] **Favorites.** Complete sections 1–2, relevant QOL/CLI and Favorites acceptance requirements of the focused checklist: canonical persistence, organization, views, real actions, shared current-state and performance hooks.
- [ ] **Performance foundation.** Sessions/history, exact fingerprints, isolated recoverable sandboxes, static Quick Scan, real JFR startup evidence and shared GUI/CLI operations.
- [ ] **Direct impact.** Dependency-aware paired startup/server A/B, baseline reuse, confidence/noise, per-mod evidence and Favorites integration.
- [ ] **Probe and rendered testing.** Loader-specific test-only control, deterministic scenarios, lifecycle/GUI/input/route/GameTest, real rendered FPS/frame telemetry, accurate runtime-mode limits.
- [ ] **Deep profiling and whole-pack testing.** Spark/optional Observable, adaptive cohort isolation, direct confirmation, interactions, regression history and profiler-overhead challenge.
- [ ] **Automation and AI handoff.** Full scenario DSL, cancel/resume/recovery, CLI/CI/completions/docs, local diagnostic bundle and verified redaction/manifest; explicit user-directed external handoff.
- [ ] **Final acceptance.** Every source checklist's definition of done, deliberate startup/tick/render/allocation regressions, unchanged live profiles, persistent evidence, UI/CLI parity and release challenge pass.

## Current verification constraints

- Native Rust unit-test harness previously failed before execution on this Windows host with `STATUS_ENTRYPOINT_NOT_FOUND`. CLI-0 must obtain executable proof with built-process acceptance; do not call this a unit-test pass.
- CLI-1 still needs typed domain routes, background-operation ownership/completion, full persisted-log paging, remaining exit classifications, packaging/completions and interactive Windows signal acceptance. The initial rolling buffer/file-search limits are explicitly documented in [CLI.md](CLI.md).
- Successful authenticated CurseForge update lookup was not proven during Config/Addons work; its explicit failure state and live Modrinth identity/rollback were proven.
- Full Performance Lab runtime/regression requirements are unimplemented and unverified at this continuation's start. No rendered-client metrics or measured verdicts may be inferred from static scans or headless fixtures.
