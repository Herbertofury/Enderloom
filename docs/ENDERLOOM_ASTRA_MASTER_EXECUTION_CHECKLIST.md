# Enderloom — Astra Master Execution Checklist

**Status:** CANONICAL MASTER EXECUTION CHECKLIST / SINGLE ENTRYPOINT  
**Updated:** 2026-09-07  
**Repository:** `Herbertofury/Enderloom`  
**Branch:** `main`  
**Target operator:** Astra / Codex / ChatGPT / capable implementation agent  
**Execution model:** one continuous, resumable implementation campaign

---

# 0. READ THIS FIRST — ASTRA RUN CONTRACT

This file is the **single execution entrypoint for the complete Enderloom vision**.

Earlier Enderloom requirements, backlog, gap-audit, testing, diagnostics, AI, conversion, Studio, compatibility, and concept-art documents remain engineering references, but Astra should not need the user to restate decisions or choose what comes next. This checklist defines the execution order and acceptance boundary.

## 0.1 Mission

Build Enderloom into the one integrated Minecraft launcher, mod/content manager, research browser, testing/performance lab, repair system, developer Studio, conversion/porting workbench, asset/model pipeline, world/server toolkit, compatibility lab, AI operator and evidence-backed project brain that can perform the serious Minecraft workflows we have repeatedly done through ChatGPT + Minecraft Dev Kit.

The north-star law is:

> **If a capable human using Enderloom/ChatGPT/Minecraft Dev Kit can legitimately perform a Minecraft workflow, Enderloom should eventually expose that workflow through the same canonical GUI/service/CLI/MCP/AI operation graph and prove success with equal or stronger evidence.**

## 0.2 “One run” means continuous, not reckless

Astra should begin at the first incomplete required item and continue automatically through the ordered phases.

- [ ] Do not stop after planning.
- [ ] Do not stop after scaffolding.
- [ ] Do not stop after a successful compile when runtime proof is applicable.
- [ ] Do not ask the user what to do next when this checklist already answers it.
- [ ] Do not restart completed research or architecture discovery after context compaction, skill changes, connector changes, or checkpoints.
- [ ] Update this file’s checkboxes / evidence notes as material acceptance changes.
- [ ] Persist coherent checkpoints, then continue; a checkpoint is not a finish line.
- [ ] Before a long gate, preserve a recoverable source checkpoint and exact candidate identity.
- [ ] After two no-progress waves on the same route, change strategy instead of repeating the same attempt.
- [ ] Retry only with new information or a materially different route.
- [ ] If an external/auth/rights blocker prevents one branch, record it precisely and continue independent work where safe.
- [ ] Never weaken scope, tests, quality, content, compatibility, safety, or fidelity to make the run finish faster.

## 0.3 Live execution ledger

For each meaningful requirement maintain:

`requirement -> implementation location -> verification action -> observed evidence`

For every phase record at least:

- exact Git commit;
- changed subsystem(s);
- build/package identity;
- targeted tests;
- strongest runtime proof performed;
- unresolved blocker(s);
- exact next unchecked item.

## 0.4 Hard product laws

- [ ] **No feature islands.** All domains connect to one canonical project/evidence/task graph.
- [ ] **No shadow databases.** No Performance DB, AI DB, Studio DB, conversion DB, Wiki DB, or diagnostics DB duplicating canonical truth.
- [ ] **No duplicated operation logic.** GUI, service, CLI, MCP and AI call the same domain operations.
- [ ] **No fake progress.** Percentages derive from known work/gates; unknown duration is indeterminate.
- [ ] **No fake success.** AI, UI, CLI or a provider cannot self-declare a job passed.
- [ ] **No fake metrics.** Static analysis cannot invent FPS/TPS/GPU/per-mod numbers.
- [ ] **No live-profile destructive testing.** Performance/repair/conversion experiments use isolated copies/sandboxes where applicable.
- [ ] **No content or quality deletion to manufacture optimization.**
- [ ] **No unsafe “async magic.”** Off-thread changes require thread-safety/correctness proof.
- [ ] **No unknown-file blindness.** Imports/conversions/AI archives must account for every source file or explicitly classify it as provenance-only/unsupported/unknown.
- [ ] **No provider/rights bypass.** Never bypass DRM, paywalls, encryption, entitlements, protected pack delivery, CAPTCHA, licensing or access control.
- [ ] **No synthetic replacement media.** Missing project media is not silently replaced by generated imagery.
- [ ] Synthetic image generation, if Enderloom ever supports it, is explicit per-job opt-in and never proof of native asset fidelity.
- [ ] User data, worlds, configs, external launcher profiles and original source bundles remain preservation-first.
- [ ] Destructive operations are transactional, previewable and rollback-capable where technically possible.
- [ ] Every automated recommendation can explain **Why?** using real evidence.
- [ ] Every visible control performs a real operation or is truthfully shown unavailable.
- [ ] Long work is cancellable and resumable where technically meaningful.
- [ ] Material saved project checkpoints are mirrored to GitHub and connected Google Drive and read-back verified.

## 0.5 Explicit product decisions that must not drift

### Accepted

- [ ] One professional top-level **Studio** with contextual/dockable creation/development panes.
- [ ] Dedicated top-level **Hotkeys** tab.
- [ ] Progression/softlock intelligence inside Studio/project intelligence.
- [ ] Full config intelligence/migration/profiles/rollback.
- [ ] Black Box incident recorder.
- [ ] Minecraft Data / Function debugger.
- [ ] Full model/texture/animation/MCModels/reference-reconstruction toolset.
- [ ] Premium gorgeous project/modpack Wiki.
- [ ] Performance/Testing Control Plane with deep CLI automation.
- [ ] Premium whole-modpack migration.
- [ ] “Why is this installed?” graph integrated with Wiki/project detail.
- [ ] Evidence-backed self-improving Brain with anti-poisoning/promotion gates.
- [ ] Full OpenAI / ChatGPT / Codex operator layer using canonical operations.
- [ ] Diagnostics adapter registry plus gorgeous truthful progress UX.
- [ ] Full Minecraft workflow parity: Java mod creation, porting, JAR repair, optimization, server->mod conversion, Bedrock->Java conversion, world repair, model/reference work, concept-art->mod, testing and release.

### Explicitly rejected / not approved

- [ ] **Do not add Enderloom-owned Friend Hosting / P2P / reverse-tunnel shared-world hosting.**
- [ ] **Do not add Voice/Social compatibility center.**
- [ ] Do not promote a Content Replacement Assistant as accepted scope unless the user explicitly approves it later.
- [ ] Do not clone/impersonate proprietary launcher/cloud/share-code services.
- [ ] Do not install diagnostics into a user’s live pack silently.
- [ ] Do not create hidden recurring performance/watchdog jobs unless the user explicitly enables monitoring.

---

# 1. CANONICAL REPOSITORY / REFERENCE SET

Astra starts here and follows this checklist. When detailed implementation semantics are needed, use these child contracts rather than asking the user to repeat requirements:

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

- [ ] This Astra checklist controls **execution order**.
- [ ] Child specs can add stricter/detail requirements; do not ignore them.
- [ ] A stale older requirement cannot silently weaken a newer accepted contract.
- [ ] Version-sensitive ecosystem/API claims are revalidated just-in-time from current primary sources before implementation/release.

---

# 2. PHASE 0 — PRESERVE AND PROVE THE EXISTING PRODUCT

Do not rewrite working Enderloom foundations merely because later systems are ambitious.

## 2.1 Establish exact canonical state

- [ ] Resolve repository/worktree/branch/remote.
- [ ] Read applicable `AGENTS.md` and repository-owned project memory/status/handoff files if present.
- [ ] Record exact HEAD SHA.
- [ ] Record current build identity/toolchain.
- [ ] Record current CI/release baseline.
- [ ] Confirm no unrelated user/concurrent changes will be overwritten.

## 2.2 Smoke existing accepted launcher/catalog behavior

Preserve already-established functionality, including:

- [ ] Catalog browse/search/filter/favorites/notes.
- [ ] Exact provider/project identity and source links.
- [ ] Real provider media roles and persistent browser sessions.
- [ ] Real Chromium Browser workspace.
- [ ] Full / Split layouts and browser+app workflows.
- [ ] CurseForge/Modrinth/GitHub and broad provider research adapters.
- [ ] Install bridge from research to instances.
- [ ] External CurseForge profile discovery/connect-in-place.
- [ ] External Modrinth profile discovery/connect-in-place.
- [ ] Physical-path/junction duplicate handling.
- [ ] Explicit clone/copy distinct from connect.
- [ ] Vanilla/Fabric/Quilt/Forge/NeoForge instance creation.
- [ ] MRPack/CurseForge ZIP/packwiz import paths.
- [ ] Groups/tags/favorites/search/sort/filter/bulk selection.
- [ ] Microsoft account/auth/entitlement handling without secret leakage.
- [ ] Java discovery/install/JVM configuration.
- [ ] Real Minecraft launch/process supervision/logs/kill/restart adoption.
- [ ] Mod/resource-pack/shader/datapack lifecycle.
- [ ] Exact-version selection/freeze/update/remove/dependency planning.
- [ ] Pack interchange/provider provenance.
- [ ] World list/import/delete/snapshot safety.
- [ ] Managed/external server setup, console, process control, content and filesystem operations.
- [ ] Snapshot/restore/quarantine/recovery flows.
- [ ] Logs/diagnostics/storage/network/system visibility.

## 2.3 Existing-core regression gate

- [ ] Run existing release/native integration/Electron/Catalog QA suites.
- [ ] Prove external launcher profile roots are byte/fingerprint preserved by QA.
- [ ] Record known pre-existing failures separately from new regressions.
- [ ] Do not proceed with a foundation rewrite if existing behavior is already green and compatible with the Wave A extension approach.

**PHASE 0 EXIT:** exact baseline + no-regression boundary recorded once.

---

# 3. PHASE A — INTEGRATION SPINE (START REAL IMPLEMENTATION HERE)

This is the hard dependency for the rest of the product.

## 3.1 Canonical identities

Implement typed canonical identity for at least:

- [ ] `Project`
- [ ] `Release`
- [ ] `Artifact`
- [ ] `FileHash`
- [ ] provider/source aliases
- [ ] provider project/version identities
- [ ] instance links
- [ ] world links
- [ ] server links
- [ ] config links
- [ ] dependency edges
- [ ] source/code symbols where applicable
- [ ] artifact provenance/rights/license metadata

Rules:

- [ ] SHA-256-first identity for immutable mod/JAR/file evidence.
- [ ] Do not key important state solely by filename/display name.
- [ ] Preserve same-name/different-content lineage.
- [ ] Preserve aliases without duplicating canonical objects.

## 3.2 Canonical evidence model

Implement:

- [ ] `EvidenceArtifact`
- [ ] source/provenance identity
- [ ] evidence kind
- [ ] producer/tool/adapter version
- [ ] target object(s)
- [ ] timestamp/run identity
- [ ] freshness dependencies
- [ ] staleness reason
- [ ] confidence class
- [ ] raw artifact link
- [ ] normalized evidence representation
- [ ] contradiction links
- [ ] before/after/comparison links

Confidence language must distinguish at least:

- [ ] measured
- [ ] sampled
- [ ] estimated
- [ ] inferred
- [ ] externally reported
- [ ] confirmed by reproduction

## 3.3 Durable task engine

Implement durable resumable tasks with:

- [ ] task ID
- [ ] parent/child graph
- [ ] operation ID
- [ ] target project/artifacts
- [ ] current stage
- [ ] state
- [ ] attempts/retries
- [ ] cancellation
- [ ] resume/recovery
- [ ] exact process/run IDs
- [ ] produced evidence
- [ ] blockers
- [ ] cleanup ownership
- [ ] checkpoint metadata

## 3.4 Transaction / rollback primitive

- [ ] plan/dry-run representation
- [ ] staged writes
- [ ] pre-change snapshot where relevant
- [ ] owned temp workspace
- [ ] commit step
- [ ] rollback step
- [ ] interrupted-operation recovery
- [ ] external/live-root preservation
- [ ] audit receipt

## 3.5 Shared operation/capability registry

Every meaningful operation declares:

- [ ] stable operation ID
- [ ] domain
- [ ] read/write/destructive classification
- [ ] inputs/output schema version
- [ ] permissions/approval requirements
- [ ] cancellation support
- [ ] progress support
- [ ] plan/dry-run support
- [ ] GUI route
- [ ] service route
- [ ] CLI route
- [ ] MCP route
- [ ] AI-tool exposure eligibility
- [ ] evidence emitted
- [ ] rollback behavior
- [ ] purely visual exception reason if no CLI/service route exists

CI must eventually fail when a meaningful new domain operation bypasses this registry.

## 3.6 Universal project/mod detail object

One canonical detail surface should be able to show/link:

- [ ] identity/version/hash/provider/source
- [ ] installed locations/instances
- [ ] dependency/dependent graph
- [ ] configs
- [ ] update history
- [ ] performance history
- [ ] crash/repair findings
- [ ] source symbols/Mixins/mappings when known
- [ ] compatibility contracts/results
- [ ] Wiki/knowledge
- [ ] “Why is this installed?” path
- [ ] security/provenance/license information
- [ ] AI/conversion/port lineage
- [ ] associated tasks/evidence

## 3.7 Typed extension coverage — no future architecture rewrite

Wave A must have first-class extension paths for all accepted later domains, including:

### Testing / diagnostics
- [ ] `MeasurementRun`
- [ ] `AttributionRun`
- [ ] `DiagnosticsAdapter`
- [ ] `DiagnosticsCapability`
- [ ] `DiagnosticsToolInstallation`
- [ ] `DiagnosticsSession`
- [ ] `DiagnosticsRawArtifact`
- [ ] `NormalizedProfile`
- [ ] `SampledStack`
- [ ] `TickHotspot`
- [ ] `WorldHotspot`
- [ ] `ChunkStageObservation`
- [ ] `CrashFinding`
- [ ] `MemoryFinding`
- [ ] `RenderFinding`
- [ ] `ThreadFinding`
- [ ] `CorrelationEdge`
- [ ] `InstrumentationOverheadClass`
- [ ] `EvidenceConfidence`
- [ ] `StallIncident`
- [ ] `ThreadSnapshot`
- [ ] `JfrRecording`
- [ ] `MemorySnapshot`
- [ ] `HeapObservation`
- [ ] `FrameTimingRun`
- [ ] `RenderObservation`
- [ ] `ConcurrencyFinding`
- [ ] `BisectRun`
- [ ] `CandidateModSet`
- [ ] `MinimalReproducer`
- [ ] `ScenarioDefinition`
- [ ] `ScenarioBackend`
- [ ] `ScenarioRun`
- [ ] `StartupProfile`
- [ ] `WorldRecoveryFinding`
- [ ] `PerformancePatchAcceptanceLedger`

### Progress
- [ ] `JobProgress`
- [ ] `ProgressStage`
- [ ] `ProgressUnit`
- [ ] `ProgressEvent`
- [ ] `ProgressFinding`
- [ ] `ProgressEvidenceLink`
- [ ] `ProgressExplanation`
- [ ] `ProgressEstimate`
- [ ] `ProgressQualityGate`

### Studio/config/hotkeys/data/progression/wiki
- [ ] Studio project/document/selection/editor-context types
- [ ] config document/key/migration/profile types
- [ ] Hotkey binding/profile/conflict types
- [ ] incident recording/marker/timeline-event types
- [ ] function invocation/data trace/watch types
- [ ] progression node/edge/softlock-finding types
- [ ] knowledge page/edge/build types
- [ ] pack migration plan/component/finding types

### AI
- [ ] `AiMinecraftJob`
- [ ] `AcceptanceContract`
- [ ] `AiProvider`
- [ ] `AiModelProfile`
- [ ] `AiThread`
- [ ] `AgentRun`
- [ ] `AgentSpecialist`
- [ ] `AiToolInvocation`
- [ ] `ApprovalRequest`
- [ ] `ContextArtifact`
- [ ] `ContextSnapshot`
- [ ] `FailurePacket`
- [ ] `AcceptanceGate`
- [ ] `GateResult`
- [ ] `ModelPolicy`
- [ ] `UsageObservation`
- [ ] `EvalCase`
- [ ] `EvalRun`

### Conversion / workflow parity
- [ ] `AcquisitionSource`
- [ ] `AcquisitionReceipt`
- [ ] `RightsDeclaration`
- [ ] `ServerCaptureSession`
- [ ] `ServerContentInventory`
- [ ] `ServerPluginIdentity`
- [ ] `ServerSemanticArtifact`
- [ ] `ConversionProject`
- [ ] `ConversionInput`
- [ ] `SemanticCoverageItem`
- [ ] `ConversionMapping`
- [ ] `UnknownSemantic`
- [ ] `BedrockPack`
- [ ] `BedrockModule`
- [ ] `BedrockSemanticNode`
- [ ] `JavaTargetProject`
- [ ] `CompatibilityProfile`
- [ ] `CompatibilityContract`
- [ ] `CompatibilityScenario`
- [ ] `CompatibilityResult`
- [ ] `EcosystemAdapter`
- [ ] `ProviderVersionConstraint`
- [ ] `PortProject`
- [ ] `BinaryPatchProject`
- [ ] `ParityLedger`
- [ ] `ReleaseAcceptance`

### Concept/reference
- [ ] `ConceptReference`
- [ ] `ReferenceRole`
- [ ] `ReferenceLandmark`
- [ ] `ReferenceObservation`
- [ ] `InferenceRecord`
- [ ] `ConceptDesignDossier`
- [ ] `ArtDirectionProfile`
- [ ] `ConceptAssetPlan`
- [ ] `GeometryCandidate`
- [ ] `TextureRegion`
- [ ] `RigPlan`
- [ ] `AnimationPlan`
- [ ] `GameplayDesignContract`
- [ ] `ConceptCompatibilityIntent`
- [ ] `ConceptFidelityMetric`
- [ ] `ConceptFidelityReport`
- [ ] `VisualResidualFinding`
- [ ] `NativeVisualScenario`
- [ ] `NativeVisualResult`
- [ ] `ConceptFailurePacket`
- [ ] `ConceptAcceptanceLedger`

### Audit/gap families
- [ ] security/artifact capabilities/SBOM/license/provenance types
- [ ] mapping/Mixin/source symbol types
- [ ] plugin/proxy/protocol/network capture types
- [ ] Bedrock creator/script-profile/editor-extension types
- [ ] visual gameplay graph/procedure types
- [ ] schematic/blueprint types
- [ ] asset family/registry-content types
- [ ] collaboration/change-set types
- [ ] remote target types
- [ ] world snapshot delta types
- [ ] hardware/JVM/render profile types
- [ ] localization/accessibility types
- [ ] permission/policy findings
- [ ] learned observation/rule/evidence/contradiction/promotion types

## 3.8 Migration

- [ ] Migrate existing Enderloom data safely into canonical identities.
- [ ] Preserve existing user data and external profile references.
- [ ] Provide migration versioning and rollback/recovery.
- [ ] Add tests proving no duplicate truth is introduced.

**PHASE A HARD EXIT GATE:** canonical graph + evidence + tasks + transaction + operation registry compile, persist, migrate and are exercised by real existing Enderloom data.

---

# 4. PHASE B — FIRST REAL VERTICAL ACCEPTANCE

Before expanding broad UI, prove the architecture with one real installed mod.

- [ ] Select one real installed mod from an Enderloom-connected instance.
- [ ] Resolve its exact canonical project/release/artifact/hash/provider identity.
- [ ] Resolve instance/dependency/config links.
- [ ] Create one canonical mod-detail/evidence object.
- [ ] Consume that same object in **Mod Manager**.
- [ ] Consume it in **Catalog/research**.
- [ ] Consume it through **service/CLI**.
- [ ] Consume it in **Testing**.
- [ ] Attach at least one real evidence artifact.
- [ ] Change a dependency/config/source state and prove only appropriate evidence becomes stale.
- [ ] Prove no duplicate per-surface copy of the mod exists.
- [ ] Restart Enderloom and prove persistence.

**PHASE B EXIT:** one real mod flows through Mod Manager + Catalog + CLI/service + Testing using one truth.

---

# 5. PHASE C — UNIVERSAL CLI / SERVICE / MCP / PROGRESS SPINE

## 5.1 CLI foundation

Preserve existing:

- [ ] `-l/--launch <INSTANCE>`
- [ ] `-L/--list`

Add/verify:

- [ ] `enderloom` GUI bootstrap
- [ ] `enderloom gui`
- [ ] no-visible-GUI subcommand mode
- [ ] `--json`
- [ ] `--jsonl`
- [ ] `--quiet`
- [ ] `--verbose`
- [ ] `--no-color`
- [ ] `--non-interactive`
- [ ] `--yes`
- [ ] `--timeout`
- [ ] `--trace-id`
- [ ] `--output`
- [ ] `--dry-run/--plan`
- [ ] stable exit-code families
- [ ] stdout/stderr discipline
- [ ] schema/version discovery
- [ ] `enderloom capabilities --json`
- [ ] PowerShell/Bash/Zsh/Fish completions

## 5.2 Domain CLI parity

CLI coverage must include meaningful operations for:

- [ ] app/info/doctor/paths/network
- [ ] settings
- [ ] Java
- [ ] auth/accounts
- [ ] skins/capes
- [ ] instances
- [ ] groups/tags/favorites
- [ ] versions/loaders
- [ ] mods/resource packs/shaders/datapacks
- [ ] pack interchange
- [ ] worlds
- [ ] snapshots/backups/repair
- [ ] migrations/reconciliation
- [ ] launch/process/logs/captures
- [ ] servers
- [ ] tasks/cancellation/resume
- [ ] storage/diagnostics
- [ ] catalog/search/import/export/install bridge
- [ ] config
- [ ] Hotkeys
- [ ] Wiki/knowledge
- [ ] Studio/build/test operations
- [ ] Testing/Performance Lab
- [ ] profiler/diagnostic adapters
- [ ] world/NBT/pregen
- [ ] ports/conversions
- [ ] AI jobs
- [ ] security/provenance
- [ ] Evidence Brain operations where user-safe

## 5.3 Minecraft control-plane CLI

Provide shared runtime operations for at least:

- [ ] install
- [ ] launch
- [ ] attach
- [ ] wait
- [ ] status
- [ ] command
- [ ] chat
- [ ] GUI dump/click/assert where supported by Probe/runtime
- [ ] key/mouse/input control
- [ ] look/camera control
- [ ] movement/routes
- [ ] interaction
- [ ] screenshot/capture
- [ ] telemetry
- [ ] clean exit
- [ ] identity-checked kill
- [ ] GameTest list/run/filter

## 5.4 Service protocol

- [ ] GUI and CLI use the same typed operations.
- [ ] versioned request/response envelopes
- [ ] task IDs for long operations
- [ ] progress stream
- [ ] cancellation
- [ ] resumable operation status
- [ ] errors include preservation/rollback state and next action

## 5.5 MCP

- [ ] Enderloom exposes an MCP server over the canonical operation registry.
- [ ] MCP cannot bypass approvals/permissions/transactions.
- [ ] Stable typed schemas are discoverable.
- [ ] Long jobs return task identity rather than blocking opaque calls.
- [ ] MCP results link canonical artifacts/evidence.

## 5.6 Progress engine

One shared hierarchical progress system supports all long jobs.

Each event should include:

- [ ] job/task/parent IDs
- [ ] stage
- [ ] state
- [ ] completed/total known work
- [ ] weight
- [ ] human-readable exact action
- [ ] machine code
- [ ] evidence links
- [ ] timestamps/durations
- [ ] blocker
- [ ] retry/attempt
- [ ] denominator changes and explanation
- [ ] historical ETA source where real

UX:

- [ ] Simple / Detailed / Expert density modes
- [ ] exact current action + why
- [ ] live stage timeline
- [ ] findings rail
- [ ] before/after cards
- [ ] mini sparklines/diagnostic previews where truthful
- [ ] pause/cancel/open-details where supported
- [ ] background task ownership
- [ ] “Why this tool/stage/relaunch/percentage?” explanation
- [ ] no fake 92->99 time-fill progress
- [ ] no 100% until mandatory quality gates pass

**PHASE C EXIT:** one operation is callable through GUI + service + CLI + MCP and emits the same durable progress/evidence stream.

---

# 6. PHASE D — CORE PRODUCT HARDENING / QOL

Preserve existing core and finish remaining polish/parity gaps.

## 6.1 Launcher / manager

- [ ] fast startup/progressive paint
- [ ] large-pack scalability
- [ ] parallel provider work
- [ ] single-flight duplicate work
- [ ] no repeated rescans when fingerprints/deltas suffice
- [ ] polished 3D skin/cape preview
- [ ] full process CLI parity
- [ ] richer world rename/icon presentation
- [ ] group-wide content QOL where useful

## 6.2 Research/browser

- [ ] broad provider identity remains exact
- [ ] real persistent Chromium tabs
- [ ] login-sensitive sites use user session legitimately
- [ ] translation remains safe/allow-listed
- [ ] Testing+Browser split workflows
- [ ] Testing+Mod Manager culprit drill-down

## 6.3 Content impact intelligence

For add/remove/update/enable/disable/config-change operations show:

- [ ] dependencies affected
- [ ] dependents
- [ ] config impact
- [ ] world/save risk
- [ ] performance evidence invalidation
- [ ] snapshots recommended
- [ ] reclaimable storage
- [ ] explanation/Why

## 6.4 Update/distribution

- [ ] signed/verified self-update path before one-click update claim
- [ ] safe manual install fallback
- [ ] no corruption of user data/external launcher libraries
- [ ] staged/canary update lane later integrates security evidence

---

# 7. PHASE E — PREMIUM TESTING / PERFORMANCE CONTROL PLANE

Primary question:

> **What is slowing this pack down, why, and can Enderloom prove the repair improved it without regression?**

## 7.1 Core flows

- [ ] Quick Scan
- [ ] Test One Mod
- [ ] Test All Mods
- [ ] Startup Test
- [ ] Client FPS Test
- [ ] Server TPS Test
- [ ] Lag Spike Hunt
- [ ] Memory Test
- [ ] Compare Runs
- [ ] Regression Test
- [ ] interaction/combination testing
- [ ] performance patch acceptance workflow

## 7.2 Static Quick Scan

Inspect without launching Minecraft:

- [ ] loader metadata/environment
- [ ] dependencies/optional dependencies
- [ ] embedded libraries/Jar-in-Jar
- [ ] JAR size/class count/resource footprint
- [ ] Mixin configs/injection targets
- [ ] AT/AW/coremods/transformers
- [ ] event subscriber density
- [ ] tick/render/network/worldgen references
- [ ] broad world/entity scans
- [ ] synchronous I/O risk
- [ ] reflection/classpath scanning
- [ ] timers/tasks
- [ ] resource reload listeners
- [ ] chunk/worldgen hooks
- [ ] entity/block-entity ticking
- [ ] shaders/post processing
- [ ] data/registry/resource footprint
- [ ] source ownership clues

Outputs only risk/suspicion/dependency findings — never invented runtime metrics.

## 7.3 Deterministic sandbox/fingerprint

Fingerprint at minimum:

- [ ] Minecraft version
- [ ] loader/version
- [ ] Java/JVM args
- [ ] enabled mod hashes
- [ ] config hashes
- [ ] shader/resource-pack state
- [ ] render/simulation distances
- [ ] benchmark world hash
- [ ] scenario version
- [ ] CPU/GPU/OS
- [ ] power mode where observable
- [ ] cache policy

Rules:

- [ ] never benchmark mutable live profile directly
- [ ] reuse immutable assets safely
- [ ] isolate writable config/world/log/profile outputs
- [ ] cancellation cleans only owned state
- [ ] baseline reuse requires compatible fingerprint

## 7.4 Scenario engine

Built-in scenario families:

- [ ] Startup
- [ ] Client idle
- [ ] Client traversal
- [ ] Worldgen traversal
- [ ] Server idle
- [ ] Server stress
- [ ] Soak
- [ ] multiplayer/chaos scenarios where appropriate

Scenario DSL supports:

- [ ] runtime mode
- [ ] target instance/server
- [ ] world snapshot
- [ ] settings
- [ ] warmup
- [ ] waits/assertions
- [ ] profiler boundaries
- [ ] movement/input/interactions
- [ ] measurement windows
- [ ] metric assertions
- [ ] timeouts
- [ ] cancellation
- [ ] cleanup
- [ ] schema version/migration
- [ ] no arbitrary shell by default

## 7.5 Runtime truth modes

- [ ] `rendered`
- [ ] `virtual-display`
- [ ] `headless`
- [ ] `server`
- [ ] `protocol-bot`

Hard boundaries:

- [ ] FPS/frame-time/GPU conclusions require actual rendered path.
- [ ] headless/virtual display/protocol bot cannot be mislabeled physical rendered-client proof.
- [ ] dedicated server evidence cannot prove client rendering.

## 7.6 Metrics

### Startup
- [ ] process/loader/title/world ready deltas
- [ ] class loading

### Client
- [ ] average FPS
- [ ] median frame time
- [ ] 1% low / 0.1% low
- [ ] p95/p99/worst frame time
- [ ] stutter counts
- [ ] render-thread CPU
- [ ] supported GPU/process metrics labeled correctly

### Server
- [ ] TPS
- [ ] median/p95/p99/max MSPT
- [ ] slow ticks
- [ ] server-thread CPU attribution
- [ ] entity/block-entity/scheduled-tick hotspots
- [ ] chunk/worldgen contribution

### Memory
- [ ] heap after warmup
- [ ] retained trend
- [ ] allocation rate
- [ ] GC count/pause
- [ ] top classes/allocation families

### System
- [ ] CPU
- [ ] disk I/O
- [ ] network I/O
- [ ] thread/lock contention
- [ ] JVM/JIT state

## 7.7 A/B and Test-All algorithm

Single-mod:

- [ ] compatible baseline
- [ ] dependency closure
- [ ] with candidate
- [ ] safe comparison variant
- [ ] paired same scenario
- [ ] repeat if noisy
- [ ] normalized delta/confidence
- [ ] raw evidence retained

Whole pack:

- [ ] static risk
- [ ] dependency clusters
- [ ] current-pack baseline
- [ ] hierarchical/binary cohort isolation
- [ ] direct candidate confirmation
- [ ] interaction tests where required
- [ ] `--exhaustive` truly exhaustive when requested

## 7.8 Noise/confidence

- [ ] warmup
- [ ] paired fingerprints
- [ ] alternate A/B order where useful
- [ ] repeat noisy tests
- [ ] median/spread
- [ ] thermal/background load flags
- [ ] power/shader/worldgen/JIT/GC/cache/entity drift flags
- [ ] noise floor
- [ ] low-confidence verdict instead of overclaiming

## 7.9 Per-mod Performance page / dashboard

- [ ] latest tested hash/version
- [ ] summary/confidence/environment
- [ ] A/B cards
- [ ] timeline overlay
- [ ] call/flame tree
- [ ] JFR
- [ ] spark
- [ ] Observable
- [ ] native telemetry
- [ ] configs/diffs
- [ ] dependency/interaction graph
- [ ] history/trends
- [ ] raw evidence
- [ ] Test Again / Test Without / Fresh Config / Compare Version / Deep Profile / Why / Analyze with AI

Whole-pack:

- [ ] startup offenders
- [ ] tick offenders
- [ ] render offenders
- [ ] allocation offenders
- [ ] static-risk untested
- [ ] interactions
- [ ] regressions
- [ ] changed/untested
- [ ] queue/history
- [ ] Before vs After

**PHASE E EXIT:** deliberate startup, server-tick, rendered-frame and allocation regressions are detected correctly; unchanged/noisy cases are not falsely blamed.

---

# 8. PHASE F — DIAGNOSTICS ADAPTER REGISTRY + BLACK BOX

## 8.1 Adapter registry

Each adapter declares:

- [ ] ID/version/upstream identity
- [ ] MC/loader/platform compatibility
- [ ] client/server/proxy applicability
- [ ] install/runtime requirements
- [ ] commands/APIs/files/URLs
- [ ] evidence types
- [ ] instrumentation overhead
- [ ] whether it changes runtime behavior
- [ ] permissions/network/upload behavior
- [ ] local/external viewer
- [ ] parser version
- [ ] limitations
- [ ] license/provenance/trust

## 8.2 First-class adapter coverage

Tier A/core:

- [ ] Enderloom Probe / Black Box
- [ ] spark
- [ ] Observable
- [ ] Crash Assistant import/analysis
- [ ] JFR
- [ ] `jcmd` thread/heap/class histogram
- [ ] async-profiler where supported
- [ ] OS/process counters

High-value specialized:

- [ ] TaskManager-style client profiler import/adapter
- [ ] Chunk Loading Profiler/stage profiler
- [ ] MixinTrace
- [ ] ModernFix diagnostics/watchdog evidence
- [ ] Neruina recovery/testing isolation
- [ ] GC logs
- [ ] JMC/VisualVM/MAT-compatible external analysis paths
- [ ] YourKit import/view integration when legitimately available
- [ ] Bukkit/Spigot/Paper/Purpur timings/watchdog/log import
- [ ] proxy/loader/launcher/native JVM fatal-report import

## 8.3 Measurement vs attribution — mandatory

- [ ] authoritative low-instrumentation **measurement pass** first
- [ ] targeted **attribution pass** second
- [ ] never run every profiler simultaneously and call it the benchmark
- [ ] record profiler overhead class
- [ ] rerun representative low-overhead comparison when profiler overhead could explain the regression

## 8.4 Analyzer selection brain

Implement evidence-driven recipes for:

- [ ] TPS/MSPT
- [ ] FPS/frame time
- [ ] freeze/lock
- [ ] crash/Mixin
- [ ] ticking entity/block crash
- [ ] memory leak/allocation
- [ ] startup
- [ ] chunk/worldgen/teleport stall

## 8.5 Black Box

Bounded rolling incident recorder can capture applicable:

- [ ] client/server logs
- [ ] perf counters
- [ ] lifecycle markers
- [ ] thread snapshots/JFR markers
- [ ] render/frame observations
- [ ] network events
- [ ] world/chunk/teleport/save events
- [ ] user/actions/config/version changes

Triggers:

- [ ] manual
- [ ] crash
- [ ] detected freeze/stall
- [ ] severe frame/tick spike
- [ ] test scenario failure

It must support healthy-vs-broken comparison and direct incident -> evidence -> owner/source -> repair workflow.

---

# 9. PHASE G — REPAIR / FREEZE / MEMORY / CONCURRENCY / BISECT

## 9.1 Crash repair

- [ ] raw logs/crash reports/hs_err
- [ ] Crash Assistant normalized findings
- [ ] MixinTrace when available
- [ ] owning mod/source/config/Mixin attribution
- [ ] environment/native driver distinction
- [ ] minimal reproducer
- [ ] patch candidate
- [ ] regression scenario
- [ ] real runtime proof

## 9.2 Freeze/deadlock/lockup

- [ ] repeated JVM thread dumps
- [ ] JFR lock/park evidence
- [ ] lock graph
- [ ] thread classification
- [ ] chunk I/O/ticket/task backlog
- [ ] save stall
- [ ] entity ticking/pathfinding
- [ ] teleport/dimension timeline
- [ ] network wait
- [ ] GC-vs-stall distinction
- [ ] owner mod/plugin/class/Mixin
- [ ] healthy-vs-locked compare

A foreground command timeout is not proof Minecraft hung.

## 9.3 Memory

- [ ] baseline
- [ ] heap trend
- [ ] class histogram
- [ ] allocation stack/JFR
- [ ] heap dump/dominator only when needed
- [ ] restart/persistence comparison
- [ ] owning mod/source attribution

## 9.4 Concurrency correctness

For async/off-thread optimization:

- [ ] identify thread ownership contract
- [ ] prove mutable game/render/world state safety
- [ ] detect unsafe collection access/races
- [ ] stress/repetition test
- [ ] deterministic failure capture
- [ ] compare behavior/content/state before/after

## 9.5 Automated bisection/minimal reproducer

- [ ] dependency-aware mod graph
- [ ] cohort/binary reduction
- [ ] preserve required libraries/providers
- [ ] reproduce exact failure automatically
- [ ] output minimal candidate set
- [ ] create portable reproducer manifest/sandbox
- [ ] feed result back to repair/testing/AI

---

# 10. PHASE H — CONFIG INTELLIGENCE + HOTKEYS + DATA DEBUGGER + PROGRESSION

## 10.1 Config Intelligence

- [ ] discover config ownership
- [ ] parse canonical values + comments/order where format allows
- [ ] detect renamed keys
- [ ] type/range/enum changes
- [ ] three-way semantic migration
- [ ] profiles/overlays
- [ ] per-instance/global inheritance where safe
- [ ] orphan handling
- [ ] config diff/history
- [ ] rollback
- [ ] config A/B performance testing
- [ ] evidence invalidation only for dependent tests
- [ ] AI repair suggestions grounded in schema/source/evidence

## 10.2 Dedicated Hotkeys tab

- [ ] inventory vanilla/mod/custom bindings where discoverable
- [ ] owner/default/current binding
- [ ] contextual conflict detection
- [ ] fast rebind
- [ ] conflict fix suggestions
- [ ] profiles
- [ ] import/export
- [ ] migration across mod/version changes
- [ ] first-launch QA
- [ ] CLI parity
- [ ] links from mod detail/Wiki

## 10.3 Minecraft Data / Function Debugger

- [ ] `.mcfunction` call graph
- [ ] timing
- [ ] coverage
- [ ] scoreboard watches
- [ ] storage/NBT watches
- [ ] state diffs
- [ ] controlled tracepoints
- [ ] command-block network inspection
- [ ] predicate tracing
- [ ] recipe tracing
- [ ] loot tracing
- [ ] advancement tracing
- [ ] KubeJS/CraftTweaker/script bridges
- [ ] regression scenario generation

## 10.4 Progression / softlock intelligence

Graph at least:

- [ ] recipes
- [ ] loot
- [ ] trades
- [ ] dimensions/portals
- [ ] quests
- [ ] scripts
- [ ] configs
- [ ] worldgen
- [ ] required items/blocks/entities

Detect:

- [ ] unreachable content
- [ ] circular gates
- [ ] missing provider/dependency
- [ ] impossible quest objectives
- [ ] progression broken by update/config
- [ ] world-seed/worldgen prerequisite issues

Generate regression scenarios from discovered gates.

---

# 11. PHASE I — PREMIUM WIKI / KNOWLEDGE / “WHY INSTALLED?”

- [ ] searchable/offline-capable project/modpack Wiki
- [ ] versioned pages
- [ ] source/provider links
- [ ] mod/item/block/entity/recipe pages
- [ ] controls/hotkeys
- [ ] configs
- [ ] progression
- [ ] models/animations/runtime captures
- [ ] performance evidence summaries
- [ ] crash/repair known issues
- [ ] compatibility state
- [ ] worldgen/dimensions/structures
- [ ] migration notes
- [ ] provenance/license/security
- [ ] “Why is this installed?” dependency/progression/pack-author reasoning path
- [ ] history/changelog links
- [ ] Patchouli export/integration where semantically useful, not mandatory dependency
- [ ] generated knowledge remains traceable to canonical evidence/source

---

# 12. PHASE J — UNIFIED STUDIO

One top-level **Studio**, never endless top-level creation tabs.

## 12.1 Shell/panes

- [ ] Project/Content Browser
- [ ] Outliner/Hierarchy
- [ ] Inspector/Details
- [ ] Viewport/contextual editor
- [ ] Timeline/dope sheet/curves
- [ ] Node/Procedure graph
- [ ] code editor
- [ ] data editors
- [ ] console
- [ ] Problems
- [ ] Task/Build/Test
- [ ] source control/diff
- [ ] Chromium browser/docs
- [ ] Evidence pane
- [ ] command palette
- [ ] contextual right-click operations
- [ ] graph navigation/backlinks
- [ ] Copy as CLI
- [ ] undo/redo
- [ ] saved layouts
- [ ] progressive disclosure

## 12.2 Project contexts

Same workspace supports:

- [ ] Java mods
- [ ] Bukkit/Paper/Velocity plugins
- [ ] Bedrock behavior/resource/script packs
- [ ] modpacks
- [ ] datapacks/resource packs/shaders
- [ ] server/plugin packs
- [ ] Blockbench/model projects
- [ ] worldgen/data
- [ ] quests/docs
- [ ] ports/conversions
- [ ] authorized server reconstruction
- [ ] concept-art/reference reconstruction

## 12.3 No generated-code prison

- [ ] user can inspect/edit generated source/assets
- [ ] changes remain round-trippable where supported
- [ ] generation retains source lineage
- [ ] regeneration does not silently overwrite user edits

---

# 13. PHASE K — DEVELOPER IDE / MAPPINGS / BYTECODE / LEGACY

## 13.1 IDE

- [ ] language intelligence
- [ ] diagnostics/problems
- [ ] tasks/builds/tests
- [ ] terminal
- [ ] Git/source control
- [ ] source navigation
- [ ] dependency docs/source browsing
- [ ] runtime logs/evidence links

## 13.2 Mapping/remap/Mixin/bytecode lab

Support applicable:

- [ ] Mojmap
- [ ] Yarn
- [ ] Intermediary
- [ ] Parchment
- [ ] SRG
- [ ] MCP
- [ ] named/official/production namespace conversion
- [ ] Mixin targets/injections
- [ ] Access Transformers
- [ ] Access Wideners
- [ ] reflection
- [ ] ASM/bytecode
- [ ] invokedynamic/symbolic linkage
- [ ] production remap/linkage proof

## 13.3 Legacy archaeology

- [ ] older Java Minecraft versions
- [ ] ForgeGradle generations
- [ ] legacy loaders
- [ ] old mapping systems
- [ ] old resource/data formats
- [ ] old Bedrock schemas
- [ ] conversion plans preserve semantics instead of deleting unsupported identifiers

---

# 14. PHASE L — FULL JAVA MOD DEVELOPMENT / PORT / JAR REPAIR

## 14.1 Native mod creation

Enderloom/AI should be capable of creating complete mods from requirements:

- [ ] project scaffold
- [ ] registries
- [ ] data generation
- [ ] networking
- [ ] configs
- [ ] items/blocks/entities
- [ ] recipes/loot/tags
- [ ] worldgen
- [ ] UI/menus
- [ ] sounds/particles
- [ ] models/textures/animation
- [ ] compatibility contracts
- [ ] GameTest/scenarios
- [ ] build/remap/package
- [ ] runtime proof

## 14.2 Java version/loader porting

- [ ] exact source lineage/hash
- [ ] target MC/loader/Java
- [ ] API/mapping inventory
- [ ] vanilla-feature dependency closure
- [ ] mod-owned content inventory
- [ ] source-native base port first
- [ ] registry/event/network/render/data migration
- [ ] Mixin/AT/AW translation
- [ ] config/save/data migration
- [ ] compatibility contracts
- [ ] build/remap/production linkage
- [ ] dedicated-server/client/integrated-server
- [ ] persistence/old-world where applicable
- [ ] no silent content deletion/stubbing
- [ ] optional future-vanilla parity layer remains explicit/default-off until opted in

## 14.3 Binary/JAR repair

- [ ] preserve original JAR
- [ ] metadata/dependencies
- [ ] decompile/remap for inspection when lawful
- [ ] source-symbol/Mixin/ASM/reflection ownership
- [ ] recover build assumptions
- [ ] narrow safe patch
- [ ] rebuild/repackage/remap
- [ ] production JVM linkage
- [ ] native runtime proof
- [ ] binary diff/provenance
- [ ] rollback
- [ ] respect redistribution/license boundaries

---

# 15. PHASE M — AUTHORIZED SERVER / SPELLBROOK-CLASS -> NATIVE MOD

A server conversion is **not** “put the resource pack in a JAR.”

## 15.1 Lawful acquisition/capture

Support controlled intake of:

- [ ] user-supplied archives/folders
- [ ] legitimately client-delivered server resource packs
- [ ] screenshots/video/reference captures
- [ ] runtime logs/observable states
- [ ] author-supplied `.bbmodel` / `.ajmodel`
- [ ] ModelEngine/BetterModel/FreeMinecraftModels assets
- [ ] MythicMobs/MythicCrucible configs
- [ ] ItemsAdder/Oraxen/Nexo/Nova/custom-content configs
- [ ] MMOItems/MMOCore/etc.
- [ ] quest/NPC/dialogue systems
- [ ] pet/vehicle/furniture/weapon/HUD/script/world content

Never bypass protected server/pack/plugin access.

## 15.2 Server ecosystem inventory

- [ ] plugin/extension descriptor inventory without executing untrusted JARs
- [ ] alias/family registry matching
- [ ] dependency graph
- [ ] config/source inventory
- [ ] resource-pack resolver
- [ ] unknown plugin triage
- [ ] every unknown remains explicit
- [ ] semantic adapters promoted when generic family parsing is insufficient

## 15.3 Recover three independent layers

### Visual
- [ ] geometry/hierarchy/pivots/UV/textures
- [ ] emissive/animated textures
- [ ] variants/skins
- [ ] transforms
- [ ] animation curves/easing/events
- [ ] particles/sounds/fonts/HUD

### Model runtime
- [ ] hitboxes/multipart
- [ ] seats/mount bones
- [ ] held-item bones
- [ ] locators
- [ ] leash/nameplate anchors
- [ ] model/controller states
- [ ] synchronized per-player state
- [ ] root motion only when proven

### Gameplay
- [ ] AI/goals/targeting
- [ ] triggers/conditions
- [ ] skills/attacks/projectiles
- [ ] damage/effects/cooldowns
- [ ] drops/loot/recipes
- [ ] items/armor/cosmetics
- [ ] blocks/furniture
- [ ] pets/ownership/follow/stay
- [ ] inventories/GUIs
- [ ] NPC/dialogue/quests
- [ ] shops/economy where content-critical
- [ ] structures/spawns/worldgen
- [ ] persistence
- [ ] multiplayer synchronization

## 15.4 Native target

If requested as a mod:

- [ ] produce real target-loader Java mod
- [ ] do not leave dependency on original Paper plugin stack unless explicitly part of desired architecture
- [ ] datapacks/scripts may assist but cannot substitute for requested native semantics
- [ ] visual-only reconstruction cannot pass when gameplay parity was requested

## 15.5 Server-conversion acceptance

- [ ] source/provenance/rights ledger
- [ ] semantic coverage ledger
- [ ] unknowns clearly marked
- [ ] dependency closure
- [ ] deterministic visual comparison
- [ ] dedicated server
- [ ] native client
- [ ] integrated/multiplayer behavior
- [ ] persistence/restart
- [ ] interaction/AI/quest/item/block scenarios
- [ ] performance
- [ ] zero unresolved required asset references

**Golden example:** authorized Spellbrook capture/source -> server-independent native mod with visual + model-runtime + gameplay layers accounted for.

---

# 16. PHASE N — BEDROCK ADD-ON -> FULL JAVA MOD + BEDROCK DEV CENTER

## 16.1 Full Bedrock inventory

Account for:

- [ ] manifest/modules/dependencies
- [ ] behavior packs
- [ ] resource packs
- [ ] Script API JS/TS
- [ ] Molang
- [ ] entities/components/component groups/events/properties/goals
- [ ] spawn rules
- [ ] geometry
- [ ] animations
- [ ] animation controllers
- [ ] render controllers
- [ ] attachables
- [ ] items/components
- [ ] blocks/components/permutations
- [ ] recipes
- [ ] loot/trades
- [ ] particles
- [ ] sounds
- [ ] textures/atlases/texture sets
- [ ] UI/fonts/localization
- [ ] structures
- [ ] features/feature rules
- [ ] biomes/worldgen/dimensions
- [ ] commands/functions
- [ ] experiments/min-engine-version
- [ ] subpacks
- [ ] unknown files = 0 target

## 16.2 Semantic IR -> Java

- [ ] Bedrock component/state/event semantics become target-native Java logic
- [ ] Molang becomes target predicates/calculations
- [ ] animation/render controllers become appropriate Java animation/render state
- [ ] items/blocks become native registered content
- [ ] loot/recipes/trades become target data/code
- [ ] Script API behavior becomes native Java behavior when full-mod conversion is requested
- [ ] structures/worldgen map to target APIs
- [ ] Java UI/menu implemented when source semantics require it
- [ ] every unmapped semantic remains explicit

## 16.3 Targets

- [ ] Forge
- [ ] NeoForge
- [ ] Fabric
- [ ] Quilt where applicable
- [ ] optional multiloader workspace

## 16.4 Source-vs-target parity

Where source can be executed, paired scenarios compare:

- [ ] inventory/state
- [ ] movement/AI
- [ ] attacks/cooldowns
- [ ] loot/recipes/trades
- [ ] blocks/items
- [ ] animation states
- [ ] visuals
- [ ] sounds/particles
- [ ] persistence
- [ ] multiplayer

## 16.5 Bedrock Developer Center

- [ ] project creation/deployment
- [ ] Retail/Preview target handling
- [ ] TypeScript/JavaScript development
- [ ] Content Log
- [ ] Script Debugger
- [ ] Script Profiler
- [ ] Diagnostics/Debug Utilities
- [ ] Bedrock Editor projects
- [ ] Editor Extensions
- [ ] evidence normalized into same graph

**Golden example:** Bedrock Backpacks-class addon -> Forge 1.20.1 native mod with full semantic inventory + strong compatibility with Sophisticated Backpacks/Curios/recipe viewers/automation where applicable.

---

# 17. PHASE O — CONCEPT ART / MCModels / REFERENCE -> NATIVE MOD

## 17.1 Reference intake

Support authorized:

- [ ] single image
- [ ] turnaround/front/side/rear sheets
- [ ] orthographic/model sheets
- [ ] rough sketches/paintovers
- [ ] item/weapon/armor sheets
- [ ] block/furniture/machine concepts
- [ ] environment/biome/structure concepts
- [ ] UI/HUD concepts
- [ ] spell/VFX concepts
- [ ] sprite/texture sheets
- [ ] GIF
- [ ] video
- [ ] multi-view sets
- [ ] supplied models/Blockbench projects
- [ ] server-delivered reference assets

Original source remains immutable/hash-addressed.

## 17.2 Reference authority / inference

- [ ] classify observations as observed/constrained/inferred/authored/user-approved
- [ ] unseen geometry remains inferred
- [ ] multi-reference authority can differ for shape/texture/motion/gameplay/style
- [ ] conflicting references produce explicit conflict, not silent averaging
- [ ] concept visuals may suggest mechanics but do not silently canonize gameplay

## 17.3 Design dossier

Generate durable `ConceptDesignDossier` covering:

- [ ] subject/content class
- [ ] silhouette/proportions
- [ ] landmarks
- [ ] palette/materials
- [ ] texture regions
- [ ] scale
- [ ] moving parts
- [ ] rig/pivots
- [ ] animation opportunities
- [ ] gameplay interpretation
- [ ] must-preserve traits
- [ ] ambiguities
- [ ] compatibility intent

## 17.4 Native asset authoring

- [ ] camera solve where needed
- [ ] silhouette/depth reconstruction
- [ ] geometry/cuboids/mesh
- [ ] UVs
- [ ] texture back-projection/authoring
- [ ] materials/emissives
- [ ] variants
- [ ] rig/pivots
- [ ] animation fitting/retargeting
- [ ] secondary motion
- [ ] animated textures
- [ ] VFX/SFX hooks
- [ ] hitboxes/seats/locators
- [ ] appropriate native/GeckoLib/AzureLib/direct model runtime selection

Editable native source remains available; no generation prison.

## 17.5 Concept -> gameplay

When approved, implement:

- [ ] entity AI/combat/interactions
- [ ] items/tools/armor
- [ ] blocks/furniture/machines
- [ ] spells/abilities
- [ ] drops/recipes/loot
- [ ] progression/world placement
- [ ] config
- [ ] multiplayer/persistence
- [ ] semantic compatibility profile

## 17.6 Fidelity QA

Compare concept/reference against deterministic renders and actual Minecraft:

- [ ] silhouette
- [ ] proportions/landmarks
- [ ] palette/material/value
- [ ] texture placement
- [ ] pose/joints
- [ ] animation timing
- [ ] scale
- [ ] grounding
- [ ] clipping
- [ ] culling bounds
- [ ] hitbox/model alignment
- [ ] non-obvious frames
- [ ] bind-pose reset/no transform accumulation

One opaque “similarity %” cannot hide failed dimensions.

**PHASE O EXIT:** packaged mod loads in Minecraft and satisfies approved visual/gameplay/compatibility evidence, not just a pretty preview.

---

# 18. PHASE P — ADAPTIVE ECOSYSTEM COMPATIBILITY ENGINE

Compatibility is a tested behavioral contract, not “both mods launched.”

## 18.1 Automatic semantic profile

Classify content into applicable families such as:

- [ ] inventory/container
- [ ] wearable/accessory
- [ ] machine/automation
- [ ] kinetic machine
- [ ] energy/fluid
- [ ] RPG equipment
- [ ] food/cooking/farming
- [ ] mob/entity
- [ ] pet/mount
- [ ] worldgen/structure
- [ ] dimension/portal
- [ ] spell/magic
- [ ] quest/progression
- [ ] guidebook
- [ ] model/animation
- [ ] server custom content
- [ ] Bedrock addon
- [ ] client rendering
- [ ] performance patch

## 18.2 Contract catalog

Version/loader appropriate adapters/tests for relevant ecosystems include:

- [ ] Sophisticated Backpacks
- [ ] Sophisticated Core
- [ ] Sophisticated Storage
- [ ] Curios
- [ ] Trinkets/Accessories-family as target-appropriate
- [ ] JEI
- [ ] EMI
- [ ] REI
- [ ] Create
- [ ] Registrate/Ponder/Flywheel where applicable
- [ ] Apotheosis / target-version affix/category/socket integration
- [ ] Apothic Curios-style combined accessory/affix behavior
- [ ] Farmer’s Delight
- [ ] Patchouli
- [ ] Jade/WTHIT-style overlays
- [ ] KubeJS
- [ ] CraftTweaker
- [ ] GeckoLib
- [ ] AzureLib
- [ ] native/direct `.bbmodel` runtimes when appropriate
- [ ] target energy/fluid/item capability APIs
- [ ] Applied Energistics 2
- [ ] Refined Storage
- [ ] Mekanism/transport integrations when relevant
- [ ] FTB Quests/progression integrations where relevant
- [ ] Embeddium/Sodium
- [ ] Oculus/Iris
- [ ] Distant Horizons
- [ ] Create/Flywheel rendering
- [ ] pack-specific culling/render stacks where relevant

Do not force irrelevant ecosystems or turn optional integrations into mandatory dependencies without source/design reason.

## 18.3 Behavioral acceptance examples

Backpack/container:

- [ ] equip/unequip
- [ ] Curios slot visibility
- [ ] quick-move/shift-click
- [ ] nested inventory safety
- [ ] item-handler insert/extract
- [ ] automation
- [ ] filters/sorting
- [ ] death/drop
- [ ] component/NBT preservation
- [ ] save/reload
- [ ] multiplayer
- [ ] no dupes/item loss

Create machine:

- [ ] processing recipes
- [ ] insertion/extraction
- [ ] speed/stress/rotation
- [ ] belts/funnels/deployers where supported
- [ ] contraption assemble/disassemble where supported
- [ ] rendering
- [ ] chunk unload/reload
- [ ] multiplayer
- [ ] Ponder scene if supplied

RPG/accessory:

- [ ] category classification
- [ ] attributes
- [ ] affix generation where valid
- [ ] sockets/gems
- [ ] Curios combination
- [ ] persistence
- [ ] provider absent/present lanes

## 18.4 Auto-generated contracts

When missing, Enderloom/AI can draft a new contract from:

- [ ] public API/data model
- [ ] current docs/source
- [ ] observed behavior
- [ ] existing adapters
- [ ] author requirements

But runtime evidence decides pass/fail.

---

# 19. PHASE Q — WHOLE-MODPACK MIGRATION / “FOREVER WORLD” SAFETY

Premium migration can move a pack across MC versions/loaders while accounting for:

- [ ] mods
- [ ] loaders
- [ ] dependencies
- [ ] configs
- [ ] Hotkeys
- [ ] scripts
- [ ] quests
- [ ] datapacks
- [ ] resource packs/shaders
- [ ] worlds
- [ ] worldgen/data registries
- [ ] compatibility contracts
- [ ] performance baselines
- [ ] server config/plugin relationships where relevant

Workflow:

- [ ] inventory current pack
- [ ] target feasibility
- [ ] provider/source version map
- [ ] removed/renamed/replaced dependencies
- [ ] config semantic migration
- [ ] script/API migration
- [ ] world/registry risk report
- [ ] progression/softlock analysis
- [ ] isolated migrated instance
- [ ] startup/server/client scenarios
- [ ] world open/restart
- [ ] multiplayer if relevant
- [ ] performance compare
- [ ] unresolved gaps explicit
- [ ] rollback/source preserved

---

# 20. PHASE R — WORLD / SERVER / NETWORK / PROTOCOL / REMOTE OPERATIONS

## 20.1 World tooling

- [ ] snapshot/version deltas
- [ ] selective restore
- [ ] NBT inspection/edit on safe copies
- [ ] seed recovery
- [ ] dimension/registry metadata recovery
- [ ] recreate/open doctor
- [ ] broken entity/block-entity isolation
- [ ] trim
- [ ] pregeneration
- [ ] retrogen intelligence
- [ ] seed/worldgen analysis
- [ ] structure/biome/feature ownership
- [ ] worldgen performance

## 20.2 Server/proxy ecosystem

- [ ] Bukkit
- [ ] Spigot
- [ ] Paper
- [ ] Purpur
- [ ] Folia with truthful region-threading validation
- [ ] Velocity
- [ ] Bungee where legacy context requires
- [ ] server/plugin pack management
- [ ] RCON
- [ ] console
- [ ] players/whitelist
- [ ] server performance/testing

## 20.3 Crossplay/protocol

- [ ] Geyser/Floodgate context
- [ ] ViaVersion-family context
- [ ] packet capture/inspection where lawful
- [ ] protocol compatibility tests
- [ ] network chaos/latency/disconnect scenarios
- [ ] protocol-bot synthetic player load lane

## 20.4 Legitimate remote operations

- [ ] SSH/SFTP/provider API only when actually configured/supported
- [ ] explicit credentials/permissions
- [ ] no fake cloud integrations
- [ ] remote destructive actions use the same plan/transaction/audit model

Remember: no Enderloom Friend Hosting/P2P/reverse-tunnel feature.

---

# 21. PHASE S — VISUAL GAMEPLAY / SCHEMATICS / DATA / ASSET AUTHORING

Inside Studio, implement professional authoring for:

- [ ] visual gameplay/procedure graphs
- [ ] AI behavior graphs
- [ ] command generation
- [ ] data pack generation
- [ ] worldgen generation
- [ ] Misode/MCStacker-grade schema-assisted workflows
- [ ] schematic/blueprint workflows
- [ ] Axiom/WorldEdit/Litematica-style editing concepts where appropriate
- [ ] particle authoring
- [ ] audio/SFX authoring
- [ ] UI/HUD/font authoring
- [ ] material/PBR/Vibrant-Visuals-aware paths where applicable
- [ ] runtime registry/recipe/content explorer
- [ ] owning-mod/source backlinks
- [ ] museum/QA world generation from content registry
- [ ] Java<->Bedrock resource-pack conversion
- [ ] replay/capture/showcase from actual runtime evidence

---

# 22. PHASE T — SECURITY / SUPPLY CHAIN / PERMISSIONS / RELEASE POLICY

## 22.1 Artifact security

- [ ] hash/signature identity
- [ ] provider/source provenance
- [ ] license
- [ ] dependency/SBOM
- [ ] capability/change diff across updates
- [ ] suspicious archive/path behavior
- [ ] quarantine
- [ ] user approval for risky/destructive/external operations
- [ ] no secrets in logs/artifacts/CLI args

## 22.2 Permission/redistribution gates

- [ ] source reuse permission
- [ ] binary redistribution permission
- [ ] marketplace/premium asset restrictions
- [ ] API/dependency license
- [ ] generated release contents audited
- [ ] AI bundles respect source/user choices

## 22.3 Update canary/staging

- [ ] signed/verified release metadata
- [ ] staged rollout/canary lane
- [ ] pre-update snapshot
- [ ] compatibility/performance regression checks
- [ ] automatic rollback when update breaks required smoke gates

---

# 23. PHASE U — FULL OPENAI / CHATGPT / CODEX AI OPERATOR

North star:

> Anything safely automatable through Enderloom’s normal tools should be callable by AI through the same canonical operation/task/evidence layer.

## 23.1 Provider lanes

- [ ] OpenAI Responses API / supported tool calling
- [ ] OpenAI Agents SDK where appropriate
- [ ] embedded Codex SDK/app-server/noninteractive CLI-style lane
- [ ] in-app authenticated ChatGPT browser lane
- [ ] Enderloom MCP server for external ChatGPT/Codex/agents
- [ ] optional local-AI providers behind the same acceptance gates

No provider lane bypasses quotas, login, CAPTCHA, paywalls or entitlement.

## 23.2 Natural-language job compiler

Compile requests into `AiMinecraftJob` + `AcceptanceContract` for:

- [ ] create mod
- [ ] concept/reference -> mod/model/content
- [ ] authorized server -> mod
- [ ] Bedrock -> Java
- [ ] Java version/loader port
- [ ] repair JAR/project
- [ ] optimize mod/pack
- [ ] whole-pack migration
- [ ] world repair
- [ ] model/texture/animation
- [ ] compatibility work
- [ ] test/performance investigations

## 23.3 Specialist orchestration

Supported roles can include:

- [ ] architecture/API
- [ ] Java
- [ ] Bedrock/conversion
- [ ] model/texture/animation
- [ ] mappings/Mixin
- [ ] test/scenario
- [ ] performance
- [ ] compatibility
- [ ] world/save
- [ ] security/release
- [ ] Wiki/docs

## 23.4 Model policies

- [ ] Maximum Quality
- [ ] Balanced
- [ ] Fast Iteration
- [ ] escalation after failure/stall

Final acceptance/fidelity does not get weaker under a faster model policy.

## 23.5 AI acceptance loop

- [ ] brief
- [ ] acceptance contract
- [ ] source/reference intake
- [ ] implementation
- [ ] cheap targeted check
- [ ] first causal failure evidence
- [ ] patch
- [ ] rerun invalidated gates only
- [ ] strongest runtime proof
- [ ] independent challenge pass
- [ ] package/install/release

After two no-progress candidates:

- [ ] change strategy
- [ ] stronger reasoning/model if available
- [ ] different evidence route
- [ ] smaller reproducer
- [ ] source inspection
- [ ] explicit blocker if genuinely external

## 23.6 AI output quarantine

AI-returned files are untrusted until Enderloom:

- [ ] hashes them
- [ ] inventories them
- [ ] checks unknown files
- [ ] checks provenance/permissions
- [ ] builds them
- [ ] tests them
- [ ] compares them to acceptance contract
- [ ] installs only after pass
- [ ] smoke-tests installed target
- [ ] rolls back on failure

AI cannot self-declare completion.

---

# 24. PHASE V — EVIDENCE BRAIN / SELF-IMPROVEMENT

Build a promotion pipeline:

`observation -> hypothesis -> candidate -> verified -> generalized`

- [ ] every learned item has source/evidence
- [ ] scope by versions/loaders/hashes/environment
- [ ] contradictions retained
- [ ] negative results retained
- [ ] user correction outranks stale inference
- [ ] community/AI/web text cannot self-promote to verified truth
- [ ] shadow mode for candidate rules
- [ ] challenge fixtures before promotion
- [ ] rollback/demotion
- [ ] periodic stale/review flags
- [ ] learned evidence can improve diagnostics/compatibility/repair/ports without bypassing fresh proof

---

# 25. PHASE W — ACCESSIBILITY / LOCALIZATION / ANALYTICS / UX POLISH

## 25.1 UX bar

- [ ] beautiful/consistent hierarchy
- [ ] dense expert information without debug-dump feel
- [ ] search everywhere useful
- [ ] sort/filter on large datasets
- [ ] bulk actions
- [ ] context menus
- [ ] drag/drop where genuinely faster
- [ ] keyboard-friendly
- [ ] remembered layout/preferences
- [ ] one-click common paths
- [ ] advanced detail discoverable
- [ ] destructive previews
- [ ] Why explanations
- [ ] accurate tooltips
- [ ] errors explain failure + preserved state + next action
- [ ] cancellable/resumable long work
- [ ] no modal spam
- [ ] no mystery background state

## 25.2 Accessibility

- [ ] keyboard navigation
- [ ] screen-reader semantics
- [ ] reduced motion
- [ ] no color-only meaning
- [ ] contrast
- [ ] scalable text/layout
- [ ] accessible progress/findings states

## 25.3 Localization

- [ ] Enderloom UI localization framework
- [ ] project localization bundle inspection
- [ ] missing/unused key detection
- [ ] migration/version diff
- [ ] Wiki localization awareness

## 25.4 Analytics/changelog intelligence

- [ ] local/user-respecting analytics if implemented
- [ ] issue/changelog/source-change linkage
- [ ] no fabricated popularity/quality scores
- [ ] recommendation explanations remain evidence-backed

---

# 26. PHASE X — END-TO-END GOLDEN CHALLENGE SUITE

The product is not done until representative real workflows pass.

## Golden 1 — canonical installed-mod vertical

- [ ] one real installed mod -> one canonical detail/evidence object -> Mod Manager + Catalog + CLI/service + Testing
- [ ] no duplicated truth

## Golden 2 — performance culprit + repair

- [ ] deliberately/known laggy candidate
- [ ] clean baseline
- [ ] measured regression
- [ ] spark/JFR/Observable/etc attribution as selected
- [ ] source owner
- [ ] repair
- [ ] before/after same scenario
- [ ] content/config/visual/network/persistence parity
- [ ] install + smoke + rollback proof

## Golden 3 — freeze/teleport/server lock

- [ ] Black Box + thread dumps/JFR
- [ ] owner/mod/class
- [ ] patch/config repair
- [ ] repeated healthy scenario
- [ ] no false “shell timeout = hang” conclusion

## Golden 4 — crash / broken JAR

- [ ] crash evidence
- [ ] Mixin/source attribution
- [ ] repair/rebuild/remap
- [ ] production linkage
- [ ] real runtime

## Golden 5 — Java port/backport

- [ ] real source mod
- [ ] target older/newer MC or loader
- [ ] complete content inventory
- [ ] no stubs/deletions
- [ ] production runtime
- [ ] compatibility

## Golden 6 — Spellbrook-class authorized server -> mod

- [ ] lawful captured/supplied server assets
- [ ] plugin/config/model/resource inventory
- [ ] unknown plugin handling
- [ ] visual layer
- [ ] model-runtime layer
- [ ] gameplay layer
- [ ] native mod
- [ ] client/server/multiplayer/persistence/performance

## Golden 7 — Bedrock backpack addon -> Forge 1.20.1

- [ ] full behavior/resource/Script/Molang inventory
- [ ] no unknown files
- [ ] native Java implementation
- [ ] Sophisticated Backpacks/Sophisticated Core compatibility where requested
- [ ] Curios wearable compatibility
- [ ] recipe viewer
- [ ] automation/item-handler
- [ ] Create interaction when semantically applicable/requested
- [ ] RPG integrations only when applicable
- [ ] persistence/multiplayer

## Golden 8 — concept art -> full mod

- [ ] reference lineage
- [ ] dossier
- [ ] model/texture/rig/animation
- [ ] approved gameplay
- [ ] compatibility profile
- [ ] deterministic fidelity report
- [ ] actual Minecraft visual/runtime QA
- [ ] packaged release

## Golden 9 — whole-pack migration

- [ ] version/loader migration
- [ ] configs/hotkeys/scripts/quests/data/worlds
- [ ] progression/softlock
- [ ] runtime + old world
- [ ] compatibility/performance

## Golden 10 — world recovery

- [ ] broken world copy
- [ ] seed/dimension/registry/NBT diagnosis
- [ ] safe repair
- [ ] world opens/restarts
- [ ] preserved source

## Golden 11 — config/hotkey migration

- [ ] version update changes keys/bindings
- [ ] semantic migration
- [ ] conflict resolution
- [ ] restart persistence

## Golden 12 — AI autonomous repair

- [ ] AI receives normalized evidence
- [ ] returns candidate
- [ ] candidate quarantined/hashed
- [ ] Enderloom builds/tests
- [ ] failure packet loops back if needed
- [ ] Enderloom, not AI, closes acceptance

## Golden 13 — server/proxy/plugin scenario

- [ ] managed Paper/Purpur/Folia/Velocity path as applicable
- [ ] plugin/config evidence
- [ ] CLI/server console
- [ ] performance/diagnostic capture
- [ ] truthful threading/protocol semantics

## Golden 14 — release/update/security

- [ ] artifact provenance/SBOM/license
- [ ] signed/verified update metadata
- [ ] canary/staged update
- [ ] regression smoke
- [ ] rollback

---

# 27. FINAL RELEASE / ACCEPTANCE GATES

## 27.1 Static/build

- [ ] format/lint/type checks
- [ ] unit tests
- [ ] integration tests
- [ ] migration tests
- [ ] CLI parser/schema tests
- [ ] operation-registry parity tests
- [ ] build/package
- [ ] source/artifact hashes

## 27.2 Existing-product regression

- [ ] launcher/API coverage QA
- [ ] native integration acceptance
- [ ] Electron/self tests
- [ ] Catalog suite
- [ ] external launcher preservation

## 27.3 CLI/service/MCP

- [ ] fresh built CLI actually exercised
- [ ] instance list/show
- [ ] launch/wait/log/exit
- [ ] managed server smoke
- [ ] JSON/JSONL schemas
- [ ] cancellation/resume
- [ ] MCP operation parity sample

## 27.4 Minecraft runtime

- [ ] dedicated server reaches authoritative ready state for applicable common/server changes
- [ ] native rendered client for rendering/model/animation/UI/FPS work
- [ ] integrated server for synchronized gameplay
- [ ] multiplayer when semantics require it
- [ ] restart/persistence for saved state/config/world
- [ ] packaged production/remap linkage where userdev can hide issues

## 27.5 Testing challenge

- [ ] deliberate startup regression detected
- [ ] deliberate tick regression detected
- [ ] deliberate rendered-frame regression detected in rendered mode
- [ ] deliberate allocation regression detected
- [ ] headless mode does not falsely claim rendered-frame proof
- [ ] profiler-overhead challenge
- [ ] noise-floor challenge
- [ ] cancellation cleans owned test state only
- [ ] crash recovery preserves completed evidence
- [ ] live external profile unchanged

## 27.6 Visual QA

- [ ] deterministic QA world/camera/time/weather
- [ ] actual Minecraft capture
- [ ] non-obvious frames
- [ ] missing textures/atlas warnings fail relevant gate
- [ ] no disappearing/floating/clipping
- [ ] no transform accumulation
- [ ] hitbox/model grounding/state sync proven

## 27.7 AI/privacy/security

- [ ] no secrets in output/logs
- [ ] AI bundles list included files
- [ ] redacted share copy separate from original
- [ ] no external upload without user action
- [ ] no unsupported provider-success claim
- [ ] rights/license/provenance complete

## 27.8 Persistence/publication

- [ ] final runnable build created after last implementation change
- [ ] exact build command/result recorded
- [ ] artifact hash/size recorded
- [ ] GitHub checkpoint/release state verified
- [ ] Google Drive material checkpoint/artifacts verified by readback
- [ ] this checklist updated with final acceptance state
- [ ] exact known limitations listed; no hidden skipped gates

---

# 28. DEFINITION OF DONE — WHOLE ENDERLOOM

Enderloom is at the intended target only when all applicable statements are true:

- [ ] Catalog, Browser, Launcher/Mod Manager, Testing, Hotkeys and Studio feel like one coherent product.
- [ ] Existing external CurseForge/Modrinth profiles work in place without forced duplication.
- [ ] Every meaningful domain operation is exposed through canonical operations and CLI/service/MCP/AI where applicable.
- [ ] No feature owns an isolated duplicate truth store.
- [ ] Long operations are truthful, cancellable, observable and resumable where applicable.
- [ ] Performance testing is deterministic, evidence-backed, dependency-aware and interaction-aware.
- [ ] Diagnostics adapters are selected intelligently rather than all piled into one benchmark.
- [ ] Crash/freeze/memory/render/concurrency failures flow directly to owner/source/repair/test.
- [ ] Config/Hotkeys/Data/Progression/Wiki all connect to the same project graph.
- [ ] Studio can author real Java/Bedrock/plugin/data/model/world/content projects without trapping generated output.
- [ ] Enderloom can create a complete native mod from requirements.
- [ ] Enderloom can port/backport/repair real Java mods/JARs with runtime proof.
- [ ] Enderloom can lawfully turn authorized server content such as Spellbrook-style systems into complete native mods when sufficient source/observable semantics exist.
- [ ] Enderloom can convert Bedrock add-ons into target-native Java mods with complete semantic coverage.
- [ ] Enderloom can turn concept/reference art into editable native assets + gameplay + verified Minecraft release.
- [ ] Ecosystem compatibility is behaviorally tested for the best relevant mods/APIs, not merely load-tested.
- [ ] Whole-pack migration covers configs, Hotkeys, scripts, quests, data, worlds and compatibility.
- [ ] World/server/protocol/security/release workflows are preservation-first and evidence-backed.
- [ ] AI can invoke the same tools a human can, but cannot bypass permissions or self-declare success.
- [ ] Evidence Brain can improve future work without poisoning verified truth.
- [ ] No Friend Hosting/P2P/reverse-tunnel feature was reintroduced.
- [ ] No Voice/Social compatibility center was reintroduced.
- [ ] No silent synthetic-image substitution became part of native asset workflows.
- [ ] The final build is actually exercised, not merely compiled.
- [ ] The complete coherent project state is durable in GitHub + Google Drive.

---

# 29. ASTRA FINAL BEHAVIORAL INSTRUCTION

When this file is handed to Astra, the instruction is:

> **Continue Enderloom from the exact current repository state. Treat `docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md` as the canonical execution checklist. Preserve all already-working behavior and all accepted decisions. Start at the first incomplete hard dependency, implement rather than merely plan, verify each coherent slice with the strongest applicable evidence, update the checklist with real acceptance state, checkpoint to GitHub and Drive, and continue automatically through the next phase. Do not stop because one phase is large, do not ask what to do next when the checklist answers it, do not silently reduce scope, and do not call the project complete until the final golden challenge/release gates pass. If an external blocker is genuinely unavoidable, record the exact blocker/evidence and continue every independent reachable item before ending.**

This is the one-run Enderloom contract.
