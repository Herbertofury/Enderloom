# Enderloom — Astra Master Execution Checklist

**Status:** CANONICAL MASTER EXECUTION CHECKLIST / SINGLE ENTRYPOINT  
**Updated:** 2026-09-07  
**Repository:** `Herbertofury/Enderloom`  
**Branch:** `main`  
**Target operator:** Astra / Codex / ChatGPT / capable implementation agent  
**Execution model:** one continuous, resumable implementation campaign

---

# 0. ASTRA RUN CONTRACT

This is the **single execution-order authority** for the complete Enderloom project.

Detailed child specs remain engineering references, but Astra should never ask the user to restate a decision already captured here or in a linked child spec.

## 0.1 Mission

Build Enderloom into one integrated Minecraft launcher, content manager, research browser, testing/performance lab, repair system, developer Studio, conversion/porting workbench, asset/model pipeline, world/server toolkit, compatibility lab, AI operator, Premium knowledge surface, and evidence-backed project brain.

North-star:

> **If a capable human using Enderloom + ChatGPT + Minecraft Dev Kit can legitimately perform a Minecraft workflow, Enderloom should ultimately expose that workflow through the same canonical GUI/service/CLI/MCP/AI operation graph and prove success with equal or stronger evidence.**

## 0.2 No-repeat document law

Every requirement in this master has **one canonical home**.

- [ ] Do not restate the same feature in later phases.
- [ ] Later phases reference the owning requirement/phase instead of copying its bullet list.
- [ ] Golden challenges reference phase exit gates rather than repeating implementation requirements.
- [ ] Final release gates contain only cross-cutting release criteria not already owned by a phase.
- [ ] If a new requirement overlaps an existing one, expand the existing canonical item instead of adding a duplicate.
- [ ] Child specs may contain deeper implementation detail, but this master remains the unique execution map.

## 0.3 Continuous-run behavior

- [ ] Start at the first incomplete hard dependency and continue automatically.
- [ ] Implement instead of stopping after planning/scaffolding.
- [ ] Treat compilation as intermediate evidence when runtime behavior changed.
- [ ] Never ask “what next?” when this checklist answers it.
- [ ] Preserve resolved identity, acceptance state, hashes, run IDs, blockers, failed routes, and exact next action through compaction/tool/agent transitions.
- [ ] Update this checklist only when material acceptance state changes.
- [ ] Checkpoint coherent progress, then continue; a checkpoint is not a finish line.
- [ ] Before long gates, preserve a recoverable source/candidate checkpoint.
- [ ] After two no-progress waves on one route, change strategy.
- [ ] Retry only with new information or a materially different route.
- [ ] If one branch is externally blocked, record the blocker precisely and continue every independent reachable branch.
- [ ] Never reduce scope, fidelity, safety, compatibility, content, or verification simply to finish faster.

## 0.4 Evidence ledger

For each material requirement maintain:

`requirement ID -> implementation location -> verification action -> observed evidence`

Each completed phase records:

- [ ] exact Git commit;
- [ ] changed subsystems;
- [ ] build/package identity;
- [ ] targeted tests;
- [ ] strongest applicable runtime proof;
- [ ] unresolved blockers/known limitations;
- [ ] exact next incomplete requirement.

---

# 1. NON-NEGOTIABLE PRODUCT LAWS

## 1.1 Canonical truth

- [ ] **ARCH-001 No feature islands:** every domain uses one canonical project/evidence/task graph.
- [ ] **ARCH-002 No shadow databases:** Performance, AI, Studio, Wiki, conversions, diagnostics, security, and migration do not maintain competing truth stores.
- [ ] **ARCH-003 No duplicated operation logic:** GUI, service, CLI, MCP, and AI call the same canonical domain operations.
- [ ] **ARCH-004 Immutable identity:** important immutable artifacts use content hashes, not filename/display name alone.
- [ ] **ARCH-005 Explainability:** automated verdicts/recommendations expose evidence-backed **Why?** explanations.

## 1.2 Truthful behavior

- [ ] **TRUTH-001 No fake success:** no UI/provider/AI/job may self-declare success without acceptance evidence.
- [ ] **TRUTH-002 No fake progress:** percentage derives from known work/gates; unknown-duration work is indeterminate.
- [ ] **TRUTH-003 No fake metrics:** static analysis cannot manufacture runtime FPS/TPS/MSPT/GPU/per-mod attribution.
- [ ] **TRUTH-004 Evidence class:** facts distinguish measured, sampled, estimated, inferred, externally reported, and reproduction-confirmed evidence.
- [ ] **TRUTH-005 Runtime mode:** rendered, virtual-display, headless, server, and protocol-bot evidence are never conflated.

## 1.3 Preservation and safety

- [ ] **SAFE-001 Preserve originals:** user worlds, configs, external launcher profiles, source bundles, and original JARs remain untouched unless an explicit transaction commits a user-approved mutation.
- [ ] **SAFE-002 Isolated testing:** repair/performance/conversion experiments do not destructively test the mutable live profile/save.
- [ ] **SAFE-003 Transactional mutation:** destructive operations support plan/review, staged writes, rollback/recovery, and owned cleanup where technically possible.
- [ ] **SAFE-004 No quality deletion:** performance work cannot secretly remove content, cap behavior, lower quality, or change gameplay to obtain better numbers.
- [ ] **SAFE-005 Concurrency correctness:** “move it async” is never accepted without thread-ownership and behavioral correctness proof.
- [ ] **SAFE-006 No unknown-file blindness:** imports/conversions/AI bundles account for every source file or explicitly classify it.
- [ ] **SAFE-007 No access-control bypass:** never bypass DRM, encryption, paywalls, entitlement, CAPTCHA, server authorization, protected delivery, or license controls.
- [ ] **SAFE-008 No synthetic replacement media:** missing provider/project media is never silently replaced with generated content.
- [ ] **SAFE-009 Secrets:** auth tokens/cookies/API keys/session secrets never enter ordinary logs, CLI arguments, public evidence, or project memory.

## 1.4 Locked product decisions

Accepted:

- [ ] **DEC-001** One top-level professional **Studio** with contextual/dockable creation and development tools.
- [ ] **DEC-002** Dedicated first-class top-level **Hotkeys** tab.
- [ ] **DEC-003** Progression/softlock intelligence.
- [ ] **DEC-004** Full config intelligence/migration/profiles/rollback.
- [ ] **DEC-005** Black Box incident recorder.
- [ ] **DEC-006** Minecraft Data/Function debugger.
- [ ] **DEC-007** Full model/texture/animation/MCModels/reference-reconstruction workflow.
- [ ] **DEC-008** Premium gorgeous project/modpack Wiki.
- [ ] **DEC-009** Premium automated Performance/Testing Control Plane.
- [ ] **DEC-010** Premium whole-modpack migration.
- [ ] **DEC-011** “Why is this installed?” reasoning integrated with project detail/Wiki.
- [ ] **DEC-012** Evidence-backed self-improving Brain with anti-poisoning/promotion gates.
- [ ] **DEC-013** Full OpenAI/ChatGPT/Codex operator over canonical operations.
- [ ] **DEC-014** Diagnostics adapter registry plus truthful polished progress UX.
- [ ] **DEC-015** Full Minecraft workflow parity: native mod creation, ports/backports, JAR repair, optimization, server->mod, Bedrock->Java, world repair, reference/concept->mod, compatibility, testing, and release.
- [ ] **DEC-016 Premium Steam-like mod trailer autoplay:** real trailers can automatically preview in Catalog/mod-detail browsing for Premium users under the media rules in Phase D.

Rejected/not approved:

- [ ] **DEC-R01** No Enderloom-owned Friend Hosting/P2P/reverse-tunnel shared-world feature.
- [ ] **DEC-R02** No Voice/Social compatibility center.
- [ ] **DEC-R03** Do not promote Content Replacement Assistant unless the user explicitly approves it later.
- [ ] **DEC-R04** Do not impersonate proprietary launcher/cloud/share-code services.
- [ ] **DEC-R05** Do not silently install diagnostics into a user’s live pack.
- [ ] **DEC-R06** Do not create hidden recurring testing/watchdog/monitoring jobs unless the user explicitly enables them.

---

# 2. CANONICAL ENGINEERING REFERENCES

Use these only when the active requirement needs deeper detail:

- `docs/ENDERLOOM_MASTER_REQUIREMENTS.md`
- `docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md`
- `docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md`
- `docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md`
- `docs/ENDERLOOM_UNIFIED_STUDIO_CONFIG_HOTKEY_CLI_BRAIN_SPEC.md`
- `docs/ENDERLOOM_OPENAI_AI_OPERATOR_SPEC.md`
- `docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md`
- `docs/PREMIUM_TESTING_LAB_SPEC.md`
- `docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md`
- `docs/CODEX_HANDOFF_PREMIUM_TESTING_CLI.md`
- `docs/CODEX_HANDOFF_ULTIMATE_MINECRAFT_WORKBENCH.md`
- `docs/ENDERLOOM_DIAGNOSTICS_ADAPTERS_PROGRESS_UX_SPEC.md`
- `docs/ENDERLOOM_DIAGNOSTICS_ADAPTER_CATALOG.md`
- `docs/ENDERLOOM_DIAGNOSTICS_ADAPTER_CATALOG_CHANGELOG.md`
- `docs/ENDERLOOM_DIAGNOSTICS_HANDOFF_ADDENDUM.md`
- `docs/ENDERLOOM_MINECRAFT_WORKFLOW_PARITY_MASTER_SPEC.md`
- `docs/ENDERLOOM_ECOSYSTEM_COMPATIBILITY_CONTRACT_CATALOG.md`
- `docs/ENDERLOOM_CONCEPT_ART_TO_NATIVE_MOD_SPEC.md`
- `docs/ENDERLOOM_CONCEPT_ART_HANDOFF_ADDENDUM.md`
- GitHub issue #1 — Performance Lab tracker
- GitHub issue #3 — Ultimate Minecraft Workbench tracker

Rules:

- [ ] **REF-001** This file controls execution order.
- [ ] **REF-002** Child specs may tighten implementation/acceptance but cannot silently weaken newer accepted requirements.
- [ ] **REF-003** Version-sensitive APIs/ecosystems are revalidated just-in-time from current primary sources.

---

# 3. PHASE 0 — PRESERVE AND BASELINE THE EXISTING PRODUCT

## 3.1 Canonical project state

- [ ] **P0-001** Resolve exact repository/worktree/branch/remote and applicable project-memory/AGENTS governance.
- [ ] **P0-002** Record HEAD, build toolchain, CI/release identity, and unrelated concurrent changes that must be preserved.

## 3.2 Existing behavior that must survive all later work

Verify, do not reinvent, the established product surface:

- [ ] **P0-010 Catalog/research:** browse/search/filter/favorites/notes, exact provider/project identity, source links, role-correct project/creator/gallery/video media, broad provider adapters, install bridge, import/export research data.
- [ ] **P0-011 Browser:** real persistent Chromium sessions/tabs, login-sensitive sites through the user’s session, safe translation, Full/Split research layouts.
- [ ] **P0-012 External launcher integration:** CurseForge/Modrinth discovery, connect-in-place, physical-path/junction identity, explicit clone/copy, safe disconnect/reconciliation.
- [ ] **P0-013 Instance/launcher:** Vanilla/Fabric/Quilt/Forge/NeoForge creation, MRPack/CurseForge ZIP/packwiz import, groups/tags/favorites, Microsoft auth/entitlement, Java/JVM configuration, real launch/process/log supervision.
- [ ] **P0-014 Content lifecycle:** mods/resource packs/shaders/datapacks install/enable/disable/remove/update/exact-version/freeze/dependency planning/provenance.
- [ ] **P0-015 Pack/world/server:** pack interchange, world list/import/safe-delete/snapshot, managed/external servers, server software/config/players/whitelist/files/content/console/process control.
- [ ] **P0-016 Recovery/diagnostics:** snapshots/restore/quarantine/interrupted-operation recovery, logs/search/redaction, network/system/storage diagnostics.

## 3.3 Baseline gate

- [ ] **P0-020** Run existing release/native-integration/Electron/Catalog QA suites.
- [ ] **P0-021** Prove external launcher/profile roots are preserved through QA.
- [ ] **P0-022** Record pre-existing failures separately from regressions introduced later.

**PHASE 0 EXIT:** exact baseline established once and reusable until invalidated.

---

# 4. PHASE A — INTEGRATION SPINE

This is the first implementation priority and the hard dependency for later phases.

## 4.1 Canonical identity graph

Implement typed identities/links for:

- [ ] **PA-001** `Project`, `Release`, `Artifact`, `FileHash`.
- [ ] **PA-002** provider/source aliases and provider project/version identities.
- [ ] **PA-003** instance/world/server/config/dependency links.
- [ ] **PA-004** source/code symbols, provenance, rights/license metadata where applicable.
- [ ] **PA-005** same-name/different-content lineage with SHA-256-first immutable artifact identity.

## 4.2 Evidence graph

- [ ] **PA-010** `EvidenceArtifact` with kind, producer/adapter version, target, run identity, timestamps, raw artifact link, normalized representation, provenance, confidence class, comparison/contradiction links.
- [ ] **PA-011** dependency-aware freshness/staleness invalidation with explicit stale reason.

## 4.3 Durable tasks and transactions

- [ ] **PA-020 Task model:** durable task ID, parent/child graph, operation, target, stage/state, attempt history, exact process/run IDs, produced evidence, blocker, cleanup ownership, cancellation, resume/recovery, checkpoint identity.
- [ ] **PA-021 Transaction model:** plan/dry-run, staged writes, pre-change snapshot where relevant, owned temp area, commit/rollback, interrupted recovery, audit receipt.

## 4.4 Canonical operation registry

Every meaningful operation declares exactly once:

- [ ] **PA-030** stable operation ID/domain/read-write-destructive classification.
- [ ] **PA-031** input/output schema version, permission/approval requirements.
- [ ] **PA-032** cancellation/progress/plan support and emitted evidence.
- [ ] **PA-033** GUI/service/CLI/MCP routes plus AI exposure eligibility.
- [ ] **PA-034** rollback semantics and explicit purely-visual exception when a machine route is inappropriate.

## 4.5 Universal project/mod detail

One canonical detail projection exposes links to:

- [ ] **PA-040** identity/version/hash/provider/source/install locations.
- [ ] **PA-041** dependencies/dependents/configs/update lineage.
- [ ] **PA-042** performance/crash/repair/source-symbol/Mixin/mapping evidence.
- [ ] **PA-043** compatibility/Wiki/Why-installed/security/license/AI/conversion/port/task history.

## 4.6 Typed extension families

The data model must support these families without opaque catch-all JSON or future shadow stores:

- [ ] **PA-050 Testing/diagnostics:** measurement/attribution runs, diagnostic adapters/sessions/raw artifacts/normalized profiles/stacks/tick-world-chunk hotspots/crash-memory-render-thread findings/correlations/instrumentation overhead/stall/thread/JFR/heap/frame/concurrency/bisect/minimal-reproducer/scenario/startup/world-recovery/performance-acceptance objects.
- [ ] **PA-051 Progress:** job/stage/unit/event/finding/evidence-link/explanation/estimate/quality-gate objects.
- [ ] **PA-052 Studio/config/hotkeys/data/progression/wiki:** project/document/selection/editor context; config docs/keys/migrations/profiles; bindings/conflicts/profiles; incident timeline; traces/invocations/watches; progression graph; knowledge graph/build; pack migration objects.
- [ ] **PA-053 AI:** job/acceptance/provider/model/thread/agent/tool invocation/approval/context/failure packet/gate/result/model policy/usage/eval objects.
- [ ] **PA-054 Conversion:** acquisition/rights/server capture/server content/plugin identity/semantic artifact/conversion inputs/coverage/mappings/unknown semantics/Bedrock semantic nodes/Java targets/compatibility profiles/contracts/results/ecosystem adapters/version constraints/port/binary patch/parity/release objects.
- [ ] **PA-055 Concept/reference:** reference roles/landmarks/observations/inference/design dossier/art direction/asset plan/geometry/texture/rig/animation/gameplay/fidelity/native visual/failure/acceptance objects.
- [ ] **PA-056 Audit ecosystem:** security/SBOM/license/capabilities; mapping/Mixin symbols; plugin/proxy/protocol captures; Bedrock creator/editor/script profiles; visual-logic graphs; schematic/blueprint/assets/registry content; collaboration change sets; remote targets; world deltas; hardware/JVM/render; localization/accessibility; permissions/policy; Evidence-Brain observations/rules/contradictions/promotions.

## 4.7 Migration

- [ ] **PA-060** Migrate existing Enderloom data into canonical identities without user-data loss or duplicate truth.
- [ ] **PA-061** Version migrations and recovery/rollback; tests prove aliases do not create duplicated objects.

**PHASE A EXIT:** graph + evidence + tasks + transactions + operation registry persist/migrate and operate on real existing Enderloom data.

---

# 5. PHASE B — FIRST REAL CANONICAL VERTICAL

- [ ] **PB-001** Select one real installed mod from a connected instance.
- [ ] **PB-002** Resolve one canonical project/release/artifact/hash/provider object plus instance/dependency/config links.
- [ ] **PB-003** Project the same canonical object into Mod Manager, Catalog, service/CLI, and Testing.
- [ ] **PB-004** Attach real evidence; mutate one dependency/config/source state and prove only dependent evidence becomes stale.
- [ ] **PB-005** Restart Enderloom and prove persistence with zero per-surface duplicate truth.

**PHASE B EXIT:** one real mod traverses all primary surfaces through one canonical object.

---

# 6. PHASE C — UNIVERSAL MACHINE SURFACES + PROGRESS

## 6.1 CLI/service parity

- [ ] **PC-001** Preserve legacy `-l/--launch` and `-L/--list` behavior.
- [ ] **PC-002** Normal GUI bootstrap plus no-visible-GUI subcommand mode.
- [ ] **PC-003** machine options: JSON/JSONL, quiet/verbose/no-color, non-interactive/yes, timeout, trace ID, output, plan/dry-run, stable exit codes, stdout/stderr discipline, schema/version discovery, shell completions.
- [ ] **PC-004** `enderloom capabilities --json` generated from the operation registry.
- [ ] **PC-005** service protocol uses versioned envelopes, task IDs, progress, cancellation/resume, and preservation-aware errors.
- [ ] **PC-006** CI fails meaningful GUI/service operations lacking CLI mapping or an approved visual-only exception.

CLI parity covers the canonical operations for app/settings/Java/accounts/skins/instances/organization/loaders/content/packs/worlds/snapshots/repair/migration/launch/process/logs/servers/tasks/storage/diagnostics/catalog/config/Hotkeys/Wiki/Studio/Testing/profilers/NBT/pregen/ports/conversions/AI/security/Evidence Brain.

## 6.2 Minecraft control plane

- [ ] **PC-010** install/launch/attach/wait/status/clean-exit/identity-checked-kill.
- [ ] **PC-011** command/chat, GUI dump-click-assert, input/look/move/interact when supported by the active runtime/Probe.
- [ ] **PC-012** screenshot/capture/telemetry and GameTest list/run/filter.

## 6.3 MCP

- [ ] **PC-020** Enderloom MCP server exposes the same operation registry without bypassing approvals/transactions.
- [ ] **PC-021** typed schemas are discoverable; long jobs return durable task identity; outputs link canonical artifacts/evidence.

## 6.4 Shared progress engine

Each progress event includes job/task/parent/stage/state/completed-total/weight/action summary/machine code/evidence/timestamps/blocker/attempt/denominator-change and real historical ETA source when available.

UX requirements:

- [ ] **PC-030** Simple/Detailed/Expert density modes over the same event stream.
- [ ] **PC-031** current action + reason, live stage timeline, findings rail, before/after cards and truthful mini diagnostic graphs/previews.
- [ ] **PC-032** pause/cancel/details/background ownership where supported.
- [ ] **PC-033** “Why this tool/stage/relaunch/percentage?” uses real task/evidence state.
- [ ] **PC-034** no time-fill progress and no 100% until required quality gates pass.

**PHASE C EXIT:** at least one real operation works through GUI + service + CLI + MCP while emitting one durable progress/evidence stream.

---

# 7. PHASE D — CORE PRODUCT HARDENING + PREMIUM MOD MEDIA

## 7.1 Core QOL/performance

- [ ] **PD-001** fast startup/progressive paint, large-pack scalability, parallel provider work, single-flight duplicate work, delta/fingerprint-based refresh instead of hidden rescans.
- [ ] **PD-002** polished skin/cape presentation, richer world presentation, useful group-wide content operations, keyboard/context/bulk workflows.
- [ ] **PD-003** Testing+Browser and Testing+Mod Manager split/drill-down flows.
- [ ] **PD-004** add/remove/update/enable/disable/config actions expose dependency/dependent/config/world-risk/evidence-staleness/snapshot/reclaim impact with Why explanation.
- [ ] **PD-005** self-update remains manual until a signed verified updater satisfies Phase O security gates.

## 7.2 Premium Steam-like autoplay trailers for mods

**Premium scope boundary:** manually opening/playing a legitimate provider trailer may remain a normal media action. The **automatic Steam-like trailer preview experience is Premium**.

- [ ] **PD-010 Media identity:** trailer/video assets carry exact project/provider/source provenance and never borrow unrelated creator/sibling/promotional video.
- [ ] **PD-011 Supported sources:** use real project-author/provider/user-supplied trailers or videos that Enderloom is legitimately allowed to display/stream; no synthetic replacement trailer when none exists.
- [ ] **PD-012 Catalog autoplay:** Premium users can enable Steam-like muted trailer preview on stable hover/focus/dwell over a mod card; only one card autoplay session is active at once.
- [ ] **PD-013 Detail autoplay:** Premium mod-detail pages can automatically transition the hero media area from poster/gallery to the highest-priority legitimate trailer according to user preference.
- [ ] **PD-014 Playback lifecycle:** pause/stop when card leaves viewport, focus moves away, tab/app backgrounds, user scrolls away, or another trailer takes ownership.
- [ ] **PD-015 Audio:** autoplay starts muted; audio requires explicit user action. Remember mute/volume preference only when appropriate and never surprise-play audio.
- [ ] **PD-016 User controls:** global Premium autoplay toggle plus per-context preference (Catalog hover, detail hero) and reduced-data/network-sensitive behavior.
- [ ] **PD-017 Accessibility:** honor reduced-motion/autoplay preference, keyboard focus behavior, screen-reader semantics, captions/subtitles when the source exposes them, and a visible play/pause control.
- [ ] **PD-018 Bandwidth/performance:** preload poster/metadata first; defer video bytes until likely playback; bound concurrent buffering; cancel abandoned requests; do not make large catalogs download dozens of videos simultaneously.
- [ ] **PD-019 Caching/rights:** cache/stream only as provider terms and source permissions allow; otherwise use legitimate embedded/remote playback without exporting cookies or bypassing access controls.
- [ ] **PD-020 Fallback:** if no valid trailer exists, remain on real screenshots/gallery art. Never generate a fake trailer, mislabeled slideshow, or unrelated video.
- [ ] **PD-021 Testing:** verify hover/focus ownership, pause/resume, muted autoplay, network cancellation, reduced-motion/data modes, provider login state, card virtualization, and no playback leak after navigation.

**PHASE D EXIT:** existing product stays responsive/preserved and Premium trailer autoplay behaves like a polished media system rather than embedded-video spam.

---

# 8. PHASE E — PREMIUM PERFORMANCE / TESTING CONTROL PLANE

## 8.1 User flows

- [ ] **PE-001** Quick Scan, Test One Mod, Test All Mods, Startup, Client FPS, Server TPS, Lag Spike, Memory, Compare Runs, Regression, Interaction testing, Performance Patch Acceptance.

## 8.2 Static Quick Scan

Inspect loader metadata/environment, dependency structure, embedded libraries, JAR/class/resource footprint, Mixins/injection targets, AT/AW/coremods/transformers, event/tick/render/network/worldgen hooks, synchronous I/O risk, reflection/classpath scans, scheduled tasks, reload listeners, entity/block-entity tick registration, shader/postprocessing hooks, data/registry footprint, and source ownership clues.

- [ ] **PE-010** Static output is risk/suspicion/dependency evidence only.

## 8.3 Deterministic sandbox/fingerprint

Fingerprint MC/loader/Java/JVM/mod hashes/config hashes/shader/resource-pack/render-simulation settings/benchmark world/scenario/CPU/GPU/OS/power/cache policy.

- [ ] **PE-020** tests isolate writable state and never destructively benchmark the live profile.
- [ ] **PE-021** immutable assets are reused safely; baseline reuse requires compatible fingerprint; cancellation cleans only Enderloom-owned test state.

## 8.4 Scenario engine

- [ ] **PE-030** built-in Startup, Client Idle, Client Traversal, Worldgen Traversal, Server Idle, Server Stress, Soak, and applicable multiplayer/chaos scenarios.
- [ ] **PE-031** versioned scenario DSL supports runtime mode, target, world snapshot, settings, warmup, waits/assertions, profiler boundaries, input/movement/interactions, measurement windows, metrics, timeouts, cancellation/cleanup; arbitrary shell is opt-in only.

## 8.5 Runtime and metrics

- [ ] **PE-040** runtime modes: rendered / virtual-display / headless / server / protocol-bot with TRUTH-005 enforcement.
- [ ] **PE-041 Startup:** process/loader/title/world-ready/class-loading measurements.
- [ ] **PE-042 Client:** FPS, median frame time, 1%/0.1% lows, p95/p99/worst, stutter, render-thread CPU, supported GPU/process metrics with confidence labeling.
- [ ] **PE-043 Server:** TPS, median/p95/p99/max MSPT, slow ticks, server-thread attribution, entity/block-entity/scheduled-tick and chunk/worldgen cost.
- [ ] **PE-044 Memory/system:** heap trend, allocation, GC, class families, CPU, disk/network I/O, thread/lock contention, JVM/JIT state.

## 8.6 A/B, whole-pack isolation, confidence

- [ ] **PE-050** single-mod paired same-scenario comparison honors dependency closure and repeats noisy measurements.
- [ ] **PE-051** whole-pack analysis uses static risk + dependency clusters + hierarchical/binary cohort isolation + direct candidate confirmation + interaction tests; `--exhaustive` is genuinely exhaustive.
- [ ] **PE-052** noise engine accounts for warmup, order, spread/noise floor, thermal/background load, power mode, shader compile, worldgen/JIT/GC/cache/entity drift and reports low confidence instead of false culprit certainty.

## 8.7 Results surface

- [ ] **PE-060** per-mod performance projection: latest tested hash/environment, A/B cards, timeline/call tree, normalized profiler evidence, config/dependency/interaction context, history/raw evidence and real actions for retest/without/fresh-config/version/deep-profile/Why/AI.
- [ ] **PE-061** whole-pack dashboard: startup/tick/render/allocation offenders, risky untested mods, interactions, regressions, changed/untested state, queue/history and before/after scorecard.

**PHASE E EXIT:** deliberate startup/tick/render/allocation regressions are correctly detected and unchanged/noisy cases are not falsely blamed.

---

# 9. PHASE F — DIAGNOSTICS, BLACK BOX, REPAIR, BISECT

## 9.1 Diagnostics adapter registry

Each adapter records exact upstream identity/version, supported MC/loaders/platform/runtime side, requirements, commands/APIs/files/URLs, evidence types, instrumentation overhead, behavior-changing risk, permissions/network/upload behavior, parser version, limitations, license/provenance/trust.

- [ ] **PF-001 Core adapters:** Enderloom Probe/Black Box, spark, Observable, Crash Assistant import, JFR, jcmd thread/heap/histogram, async-profiler where supported, OS/process counters.
- [ ] **PF-002 Specialized adapters:** TaskManager-style client profiling, Chunk Loading Profiler/stage profilers, MixinTrace, ModernFix diagnostics/watchdog, Neruina recovery-isolation, GC logs, JMC/VisualVM/MAT-compatible analysis, YourKit when legitimately available, Bukkit/Spigot/Paper/Purpur timings/watchdog, proxy/loader/launcher/native fatal-report imports.
- [ ] **PF-003 Measurement/attribution law:** low-instrumentation authoritative measurement first; targeted profiler attribution second; record overhead and challenge suspicious profiler-induced regressions.
- [ ] **PF-004 Analyzer selection:** evidence-driven recipes choose the minimum useful tool sequence for FPS, TPS, freeze, crash/Mixin, ticking crash, memory, startup, and chunk/worldgen/teleport stall.

## 9.2 Black Box

- [ ] **PF-010** bounded rolling incident timeline can capture relevant logs, performance/lifecycle/thread/JFR/render/network/world/chunk/teleport/save/user-action/config/version events.
- [ ] **PF-011** manual/crash/freeze/severe-spike/scenario-failure triggers; healthy-vs-broken comparison; direct incident->evidence->owner/source->repair links.

## 9.3 Repair specialties

- [ ] **PF-020 Crash/JAR incident:** normalize raw crash/hs_err/Mixin evidence, distinguish environment/native cause, identify owner, build minimal repro, patch, and create regression scenario.
- [ ] **PF-021 Freeze/lock:** repeated thread dumps/JFR lock graph/thread classes/chunk-I/O-ticket-task/save/entity-pathfinding/teleport/network/GC-vs-stall evidence; foreground orchestrator timeout is not a hang verdict.
- [ ] **PF-022 Memory:** baseline/trend/histogram/allocation stack/JFR/targeted heap dominator/restart comparison with owner attribution.
- [ ] **PF-023 Concurrency:** prove thread ownership, race safety, mutation correctness, stress/repetition and before/after behavioral parity for async optimization.
- [ ] **PF-024 Bisect:** dependency-aware cohort reduction preserves required providers/libraries, reproduces the exact issue, emits minimal candidate set and portable reproducer manifest/sandbox.

**PHASE F EXIT:** at least one real incident traverses capture -> normalized evidence -> owner -> repair -> regression proof.

---

# 10. PHASE G — CONFIG, HOTKEYS, DATA, PROGRESSION, WIKI

## 10.1 Config intelligence

- [ ] **PG-001** discover ownership; parse canonical values and comments/order where supported; detect renamed/type/range/enum changes.
- [ ] **PG-002** three-way semantic migration, profiles/overlays/inheritance, orphan handling, diff/history, rollback.
- [ ] **PG-003** config A/B performance evidence and dependency-aware evidence invalidation; AI suggestions must cite schema/source/evidence.

## 10.2 Dedicated Hotkeys tab

- [ ] **PG-010** inventory vanilla/mod/custom bindings with owner/default/current values where discoverable.
- [ ] **PG-011** contextual conflicts, rapid rebind/fix, profiles/import/export/migration, first-launch QA, CLI parity, mod-detail/Wiki backlinks.

## 10.3 Data/Function debugger

- [ ] **PG-020** `.mcfunction` call graph/timing/coverage, scoreboard/storage/NBT watches/state diffs/controlled tracepoints.
- [ ] **PG-021** command-block, predicate, recipe, loot, advancement and script bridge tracing with regression-scenario generation.

## 10.4 Progression/softlock intelligence

- [ ] **PG-030** graph recipes/loot/trades/dimensions/quests/scripts/config/worldgen/required content.
- [ ] **PG-031** detect unreachable/circular/missing-provider/impossible-objective/update-broken/worldgen-prerequisite issues and generate regression scenarios.

## 10.5 Premium Wiki / knowledge

- [ ] **PG-040** searchable offline-capable versioned knowledge for mods/items/blocks/entities/recipes/controls/configs/progression/models/runtime captures/performance/crash/compatibility/worldgen/migrations/security/provenance.
- [ ] **PG-041** “Why is this installed?” exposes dependency/progression/pack-author reasoning path.
- [ ] **PG-042** history/changelog/provider/source links and optional Patchouli export; generated knowledge remains traceable to canonical evidence.

---

# 11. PHASE H — UNIFIED STUDIO + IDE + AUTHORING

## 11.1 Studio shell

- [ ] **PH-001** one top-level Studio with Project/Content Browser, Outliner, Inspector, contextual viewport/editor, timeline/dope sheet/curves, node/procedure graph, code/data editors, console, Problems, Task/Build/Test, source-control/diff, Chromium docs/browser and Evidence panes.
- [ ] **PH-002** command palette, contextual actions, graph backlinks, Copy as CLI, undo/redo, saved layouts, progressive disclosure.

## 11.2 Project contexts

- [ ] **PH-010** Java mods; Bukkit/Paper/Velocity plugins; Bedrock behavior/resource/script packs; modpacks; datapacks/resource packs/shaders; server/plugin packs; Blockbench/model projects; worldgen/data; quests/docs; ports/conversions; authorized server and reference reconstruction.
- [ ] **PH-011** generated source/assets remain editable with source lineage and no silent regeneration overwrite.

## 11.3 IDE / mapping / bytecode / legacy

- [ ] **PH-020** language intelligence, diagnostics, tasks, terminal, Git, source/dependency navigation and runtime evidence links.
- [ ] **PH-021** Mojmap/Yarn/Intermediary/Parchment/SRG/MCP namespace work; Mixin/AT/AW/reflection/ASM/invokedynamic inspection; production remap/linkage proof.
- [ ] **PH-022** legacy Minecraft/ForgeGradle/loader/mapping/resource/data/Bedrock-schema archaeology without deleting unsupported semantics just to compile.

## 11.4 Visual/data/world authoring

- [ ] **PH-030** visual gameplay/procedure and AI behavior graphs; command/data/worldgen generation at Misode/MCStacker-grade schema awareness.
- [ ] **PH-031** schematic/blueprint/world-edit workflows inspired by Axiom/WorldEdit/Litematica capabilities where appropriate.
- [ ] **PH-032** particle/audio/UI/HUD/font/material/PBR/Vibrant-Visuals-aware authoring.
- [ ] **PH-033** runtime registry/recipe/content explorer with owner/source backlinks and museum/QA generation.
- [ ] **PH-034** Java<->Bedrock resource-pack conversion and replay/capture/showcase based on actual runtime evidence.

---

# 12. PHASE I — NATIVE JAVA MOD CREATION, PORTS, BINARY REPAIR

## 12.1 Native mod creation

- [ ] **PI-001** scaffold/build complete target projects with registries, data generation, networking, configs, content, recipes/loot/tags, worldgen, UI, sounds/particles, models/animation, compatibility and scenario tests.
- [ ] **PI-002** package/remap and prove strongest applicable dedicated-server/client/integrated-server/persistence behavior.

## 12.2 Version/loader porting

- [ ] **PI-010** exact source lineage, target MC/loader/Java, API/mapping inventory, vanilla-feature dependency closure, complete mod-owned content inventory.
- [ ] **PI-011** base native port first; registry/event/network/render/data/Mixin/AT/AW/config/save migration; no silent stubs/deletion.
- [ ] **PI-012** optional future-vanilla parity layer is explicit/default-off until opted in and certified separately.

## 12.3 Binary/JAR repair

- [ ] **PI-020** preserve original; inspect metadata/dependencies and decompile/remap when lawful; attribute source/Mixin/ASM/reflection issues.
- [ ] **PI-021** narrow patch, rebuild/repackage/remap, production JVM linkage, binary provenance/diff, runtime proof, rollback and license-aware redistribution.

---

# 13. PHASE J — AUTHORIZED SERVER / SPELLBROOK-CLASS -> NATIVE MOD

## 13.1 Lawful intake and ecosystem inventory

- [ ] **PJ-001** accept user-supplied archives, legitimately delivered resource packs, screenshots/video/runtime observations, author-supplied models and plugin/custom-content configs without bypassing protected access.
- [ ] **PJ-002** inventory plugin/extension descriptors without executing untrusted JARs; resolve families/aliases/dependencies/config/source/resource packs; triage unknown plugins explicitly.

## 13.2 Semantic recovery

- [ ] **PJ-010 Visual layer:** geometry/hierarchy/pivots/UV/textures/emissives/variants/transforms/animations/particles/sounds/fonts/HUD.
- [ ] **PJ-011 Model-runtime layer:** hitboxes/seats/held-item bones/locators/nameplate-leash anchors/controller states/per-player sync/root motion when proven.
- [ ] **PJ-012 Gameplay layer:** AI/targeting/triggers/skills/projectiles/damage/effects/cooldowns/drops/recipes/items/armor/blocks/furniture/pets/inventories/GUIs/NPCs/dialogue/quests/content-critical economy/structures/spawns/worldgen/persistence/network sync.

## 13.3 Native target and acceptance

- [ ] **PJ-020** requested mod output is a real target-loader Java mod; resource pack/datapack/script wrappers cannot substitute for requested native semantics.
- [ ] **PJ-021** semantic coverage/unknowns/rights/dependency closure plus deterministic visual, dedicated-server, native-client, multiplayer/integrated, persistence, gameplay-scenario and performance proof.

**PHASE J GOLDEN TARGET:** authorized Spellbrook-class source/capture -> server-independent native mod.

---

# 14. PHASE K — BEDROCK -> JAVA + BEDROCK DEVELOPER CENTER

## 14.1 Complete Bedrock inventory

- [ ] **PK-001** account for manifest/modules/dependencies, behavior/resource packs, Script API JS/TS, Molang, entity components/groups/events/properties/goals/spawn rules, geometry, animations/controllers/render controllers/attachables, items, blocks/permutations, recipes, loot/trades, particles, sounds, textures/atlases/texture sets, UI/fonts/localization, structures, features/rules, biomes/worldgen/dimensions, commands/functions, experiments/min-engine-version, subpacks; unknown-file target = 0.

## 14.2 Semantic conversion

- [ ] **PK-010** map Bedrock components/state/events/Molang/animation/render/item/block/loot/recipe/trade/script/worldgen/UI semantics into versioned IR then target-native Java logic; every unmapped semantic is explicit.
- [ ] **PK-011** target Forge/NeoForge/Fabric/Quilt where applicable, including optional multiloader workspaces.
- [ ] **PK-012** when source can run, paired source-target scenarios compare gameplay/state/visual/audio/persistence/multiplayer semantics.

## 14.3 Bedrock Developer Center

- [ ] **PK-020** project creation/deployment for Retail/Preview, JS/TS development, Content Log, Script Debugger/Profiler, diagnostics, Bedrock Editor and Editor Extensions with canonical evidence normalization.

**PHASE K GOLDEN TARGET:** Bedrock backpack-class addon -> native Java mod with applicable Phase M ecosystem contracts.

---

# 15. PHASE L — CONCEPT ART / MCMODELS / REFERENCE -> NATIVE MOD

## 15.1 Reference intake and authority

- [ ] **PL-001** support authorized single/multi-view art, turnarounds, orthographic/model sheets, sketches/paintovers, item/weapon/armor, blocks/furniture/machines, environment/structure, UI/HUD, VFX, sprite/texture sheets, GIF/video, supplied models/Blockbench and server-delivered reference assets.
- [ ] **PL-002** source remains immutable/hash-addressed; classify observed/constrained/inferred/authored/user-approved details; unseen geometry stays inferred; conflicting references remain explicit; separate shape/texture/motion/gameplay/style authority.

## 15.2 Design + native assets

- [ ] **PL-010** durable design dossier captures content class, silhouette/proportions/landmarks, palette/materials/texture regions, scale/moving parts, rig/pivots, motion, must-preserve traits, gameplay interpretation, ambiguity and compatibility intent.
- [ ] **PL-011** author editable geometry/UV/textures/materials/emissives/variants/rig/animation/secondary motion/animated textures/VFX/SFX/hitboxes/seats/locators with the least-lossy appropriate renderer/runtime.
- [ ] **PL-012** concept-implied gameplay becomes canonical only after explicit approval/contract.

## 15.3 Fidelity acceptance

- [ ] **PL-020** compare silhouette/proportions/landmarks/palette/material/value/texture placement/pose/joints/animation timing/scale/grounding/clipping/culling/hitbox alignment/non-obvious frames/bind-pose reset using deterministic renders plus actual Minecraft.
- [ ] **PL-021** no single opaque similarity score can mask a failed fidelity dimension.

**PHASE L EXIT:** editable native assets + approved gameplay + applicable compatibility + packaged Minecraft runtime proof.

---

# 16. PHASE M — ADAPTIVE ECOSYSTEM COMPATIBILITY

Compatibility means behavioral contracts, not “both mods launch.”

## 16.1 Semantic profile

- [ ] **PM-001** classify applicable semantics: inventory/container, wearable/accessory, machine/automation/kinetic/energy/fluid, RPG equipment, food/farming/cooking, entity/pet/mount, worldgen/structure/dimension/portal, magic, quests/progression, guidebook, model/animation, server custom content, Bedrock addon, client rendering, performance patch.

## 16.2 Living contract catalog

Resolve exact target-version APIs and exercise relevant contracts only:

- [ ] **PM-010 Storage/equipment:** Sophisticated Backpacks/Core/Storage, Curios, Trinkets/Accessories-family.
- [ ] **PM-011 Recipe/info:** JEI, EMI, REI, Jade/WTHIT-style overlays.
- [ ] **PM-012 Engineering:** Create, Registrate/Ponder/Flywheel where appropriate; loader-standard item/fluid/energy APIs; AE2, Refined Storage, Mekanism/transport when meaningful.
- [ ] **PM-013 RPG/content:** Apotheosis/Apothic-Curios-style affix/category/socket paths, Farmer’s Delight, Patchouli, FTB Quests where meaningful.
- [ ] **PM-014 Scripting/render:** KubeJS, CraftTweaker, GeckoLib, AzureLib, native/direct model runtimes.
- [ ] **PM-015 Render stack:** Embeddium/Sodium, Oculus/Iris, Distant Horizons, Create/Flywheel and pack-specific culling/render stacks when target pack actually uses them.

## 16.3 Behavioral tests

- [ ] **PM-020 Container/accessory:** equip, quick-move, nested safety, handler insertion/extraction, automation, filters/sorting, death/drop, state preservation, save/reload, multiplayer, no dupes/loss.
- [ ] **PM-021 Machinery:** processing, sided automation, speed/stress/rotation where relevant, contraptions, render, chunk persistence, multiplayer, Ponder when supplied.
- [ ] **PM-022 RPG:** categories/attributes/affixes/sockets/accessory combination/persistence/provider-present-absent lanes.
- [ ] **PM-023** when a contract is missing, Enderloom/AI may draft one from current public API/docs/source/observed behavior, but runtime evidence decides pass/fail.

---

# 17. PHASE N — WHOLE-PACK MIGRATION, WORLD, SERVER, NETWORK

## 17.1 Premium whole-pack migration

- [ ] **PN-001** migrate mods/loaders/dependencies/configs/Hotkeys/scripts/quests/datapacks/resource packs/shaders/worlds/worldgen registries/compatibility/performance baselines/server relationships.
- [ ] **PN-002** feasibility/provider-version map, removed/renamed dependency analysis, semantic config/script migration, world/registry risk, progression/softlock, isolated target instance, runtime/old-world/performance comparison, explicit unresolved gaps and rollback.

## 17.2 World tooling

- [ ] **PN-010** snapshot/version deltas/selective restore/NBT safe-copy editing/seed recovery/dimension-registry repair/recreate-open doctor/broken entity-BE isolation/trim/pregen/retrogen/seed-worldgen ownership/performance.

## 17.3 Server/proxy/protocol

- [ ] **PN-020** Bukkit/Spigot/Paper/Purpur/Folia/Velocity/Bungee legacy contexts, plugin packs, RCON/console/players/whitelist/server performance; Folia validation must be region-thread truthful.
- [ ] **PN-021** Geyser/Floodgate, ViaVersion-family, lawful packet inspection, compatibility/latency/disconnect/network-chaos scenarios and protocol-bot load testing.
- [ ] **PN-022** legitimate SSH/SFTP/provider API remote ops use explicit permissions and the same transaction/audit model; DEC-R01 remains enforced.

---

# 18. PHASE O — SECURITY, SUPPLY CHAIN, UPDATE POLICY

- [ ] **PO-001** artifact hash/signature/provider/source provenance/license/dependency-SBOM/capability-change diff/quarantine/path-safety model.
- [ ] **PO-002** source reuse, binary redistribution, Marketplace/premium asset, API/dependency and generated-release permission gates.
- [ ] **PO-003** risky/destructive/external operations use explicit approvals and never leak secrets.
- [ ] **PO-004** signed/verified update metadata, canary/staged update, pre-update snapshot, compatibility/performance smoke and automatic rollback on required-gate failure.

---

# 19. PHASE P — AI OPERATOR + EVIDENCE BRAIN

## 19.1 Provider/operator lanes

- [ ] **PP-001** OpenAI Responses/tool calling, Agents SDK where appropriate, embedded Codex SDK/app-server/noninteractive lane, authenticated in-app ChatGPT browser lane, Enderloom MCP, optional local providers behind the same acceptance rules.
- [ ] **PP-002** no provider lane bypasses login/quota/CAPTCHA/paywall/entitlement/access controls.

## 19.2 Natural-language jobs and orchestration

- [ ] **PP-010** compile requests into `AiMinecraftJob + AcceptanceContract` for native mod creation, reference/concept work, server conversion, Bedrock conversion, Java ports, repairs, optimization, pack migration, world repair, assets, compatibility and testing.
- [ ] **PP-011** specialist roles cover architecture/API, Java, Bedrock, visual assets, mappings/Mixin, tests, performance, compatibility, world/save, security/release, Wiki/docs.
- [ ] **PP-012** Maximum Quality / Balanced / Fast Iteration policies affect iteration strategy, never final acceptance quality.
- [ ] **PP-013** loop: contract -> source/reference -> implementation -> cheap decisive check -> causal failure evidence -> patch -> invalidated gates -> strongest runtime proof -> challenge -> package/install/release; after two no-progress candidates change strategy/evidence/repro/model.

## 19.3 AI quarantine

- [ ] **PP-020** returned files are hashed/inventoried/unknown-file checked/provenance checked/built/tested/compared before install; installed target is smoke-tested and rolled back on failure. AI cannot close its own acceptance contract.

## 19.4 Evidence Brain

- [ ] **PP-030** promotion path: observation -> hypothesis -> candidate -> verified -> generalized.
- [ ] **PP-031** evidence/version/hash/environment scope, contradictions and negative results are retained; user correction outranks stale inference.
- [ ] **PP-032** AI/web/community text cannot self-promote; candidate rules use shadow/challenge validation with rollback/demotion/staleness review.

---

# 20. PHASE Q — ACCESSIBILITY, LOCALIZATION, ANALYTICS, UX FINISH

- [ ] **PQ-001 UX:** coherent visual hierarchy, dense expert data without debug-dump feel, search/sort/filter/bulk/context/drag-drop/keyboard workflows, remembered preferences, one-click common paths, accurate tooltips, preservation-aware errors, no modal spam/mystery state.
- [ ] **PQ-002 Accessibility:** keyboard navigation, screen readers, reduced motion, no color-only semantics, contrast, scalable layout/text, accessible progress/findings/media controls.
- [ ] **PQ-003 Localization:** Enderloom localization framework plus project bundle inspection, missing/unused keys, migration/version diffs and Wiki awareness.
- [ ] **PQ-004 Analytics/changelog:** user-respecting analytics if implemented, issue/changelog/source-change linkage, no fabricated popularity/quality scores.

---

# 21. GOLDEN CHALLENGE MATRIX

These are **integration proofs**, not duplicate requirement lists. Each challenge passes only when the referenced phase exit gates and requirement IDs are satisfied by one real scenario.

- [ ] **GX-01 Canonical installed mod:** Phase B exit.
- [ ] **GX-02 Performance culprit -> repair:** PE + PF + PI runtime acceptance on one real regression.
- [ ] **GX-03 Freeze/teleport/server lock:** PF-010..024 on a reproducible lock/stall case.
- [ ] **GX-04 Broken JAR:** PI-020..021 plus applicable runtime proof.
- [ ] **GX-05 Java port/backport:** PI-010..012 plus Phase M applicable compatibility contracts.
- [ ] **GX-06 Spellbrook-class authorized server -> native mod:** Phase J exit.
- [ ] **GX-07 Bedrock backpack-class addon -> Forge 1.20.1:** Phase K exit plus PM-010/011 and any other semantically applicable contracts.
- [ ] **GX-08 Concept/reference -> complete mod:** Phase L exit.
- [ ] **GX-09 Whole-pack migration:** PN-001..002 plus applicable world/compatibility/runtime gates.
- [ ] **GX-10 World recovery:** PN-010 on a broken copied world with reopen/restart proof.
- [ ] **GX-11 Config + Hotkey migration:** PG-001..011 across a real version/update change.
- [ ] **GX-12 Autonomous AI repair:** PP-010..020 on a real failure where Enderloom, not AI, closes acceptance.
- [ ] **GX-13 Server/proxy/plugin scenario:** PN-020..022 with CLI/service evidence and truthful runtime semantics.
- [ ] **GX-14 Secure update:** PO-001..004 with canary/smoke/rollback.
- [ ] **GX-15 Premium trailer browsing:** PD-010..021 across a catalog containing cards with valid trailers, missing trailers, login-sensitive media, reduced-motion mode and rapid navigation.

---

# 22. FINAL CROSS-CUTTING RELEASE GATE

Do not restate phase-owned functionality here. Final release requires:

- [ ] **REL-001** every applicable phase exit gate green or explicitly blocked by a documented external constraint.
- [ ] **REL-002** every Golden Challenge applicable to the release green.
- [ ] **REL-003** format/lint/type/unit/integration/migration/schema/parity tests green.
- [ ] **REL-004** fresh final runnable build/package created after the last implementation mutation.
- [ ] **REL-005** source and artifact hashes/sizes/build commands recorded.
- [ ] **REL-006** actual built product exercised; strongest applicable Minecraft runtime evidence retained.
- [ ] **REL-007** existing-product regression suite remains green and connected external launcher data remains preserved.
- [ ] **REL-008** one independent challenge pass looks for false success, stale evidence, hidden quality loss, unsafe cleanup, dead UI and scope regressions.
- [ ] **REL-009** exact known limitations/skipped gates are visible; nothing material is silently waived.
- [ ] **REL-010** GitHub state and connected Google Drive checkpoint/artifacts are persisted and read-back verified.
- [ ] **REL-011** this master’s acceptance boxes/evidence references reflect the actual final state.

---

# 23. WHOLE-PRODUCT DEFINITION OF DONE

Enderloom is complete for this master only when:

- [ ] **DONE-001** all applicable requirements in this file are accepted with evidence;
- [ ] **DONE-002** all applicable Golden Challenges pass;
- [ ] **DONE-003** REL-001..011 pass;
- [ ] **DONE-004** rejected scope DEC-R01..R06 remains absent;
- [ ] **DONE-005** no new duplicate requirement/feature island/shadow truth store was introduced during implementation.

---

# 24. ASTRA FINAL INSTRUCTION

> **Continue Enderloom from the exact current repository state. Treat `docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md` as the canonical execution-order authority. Preserve all already-working behavior and accepted decisions. Start at the first incomplete hard dependency, implement rather than merely plan, verify each coherent slice with the strongest applicable evidence, mark only evidence-backed acceptance, checkpoint to GitHub and Drive, and continue automatically. Each requirement has one canonical home: reference IDs instead of duplicating requirements elsewhere. Do not stop because a phase is large, do not ask what comes next when the checklist answers it, do not silently reduce scope or quality, and do not call the project complete until the Golden Challenge Matrix and final release gate pass. If an external blocker is genuinely unavoidable, record the exact blocker/evidence and continue every independent reachable item before ending.**

This is the one-run Enderloom contract.
