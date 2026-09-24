# ENDERLOOM NORTHPOINT
## Universal Mod Matrix + Zero-Loss + Zero-Lag Implementation Handoff

**Project:** Enderloom  
**System name:** Northpoint  
**Directive:** Implement this. Do not turn it into a roadmap, research project, architecture-only milestone, mock UI, or pile of TODOs.

Northpoint is the rule set Enderloom must apply whenever it **creates, converts/ports, or repairs a Minecraft mod**.

The finished behavior is simple:

> **Keep everything the mod is supposed to do, recover legitimate content that other version branches left behind, make the requested target work first, then fan it across every valid version/loader cell, and aggressively remove avoidable client/server cost until Enderloom can show no measurable regression under equivalent workload.**

The literal engineering target is **0 introduced client lag and 0 introduced server lag**. That is a target, not permission to fake a number. A release is Northpoint-green only when equivalent before/after testing is equal or better within repeat-run noise, or any truly irreducible cost is explicitly reported instead of hidden.

---

# 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG

This handoff is both the specification **and** the live implementation ledger. Do not create a second planning document that drifts away from it.

## 0.1 Progress rules

Use the checkboxes below as the canonical progress view.

- `[ ]` = not complete. It may be pending, active, or blocked.
- `[x]` = complete **only when the stated Done condition is satisfied and evidence is written into the task.**
- For the one task currently being worked, add `**State:** IN PROGRESS` under it.
- For a blocked task, leave it unchecked and add `**State:** BLOCKED — <exact reason>` plus the exact next action that would unblock it.
- Replace every `**Evidence:** TODO` with concrete file paths, test names/results, run IDs, hashes, screenshots/log paths, or artifact names before checking the task.
- A scaffold, mock, placeholder, dead button, compile-only success, TODO comment, or untested code path does **not** satisfy a checkbox.
- Do not check a parent task while any required child behavior is still missing.
- Do not mark work complete because a different version/loader happens to pass. The requested primary target must pass first, and every claimed matrix cell must carry its own evidence.
- Keep the detailed rules in Sections 1–15 intact. This board is the execution index; those sections are the acceptance contract.
- Do not ask the user to re-decide engineering details already resolved by this file or discoverable from the repository/runtime. Choose the safest complete implementation and keep moving unless a genuinely user-only choice blocks correctness.
- Once an NP task has enough evidence to identify the safe edit set, implement it immediately; do not substitute another plan, issue list, architecture memo, or research loop for the work.

### Progress snapshot — keep these counts current

```text
CORE IMPLEMENTATION: 0 / 16
RUNTIME + PERFORMANCE PROOF: 0 / 4
RELEASE / HANDOFF: 0 / 3
CURRENT TASK: NP-00
CURRENT BLOCKER: none
LAST VERIFIED CHANGE: none
EXACT NEXT ACTION: NP-00 — map the real Create / Convert / Repair entry points and native/process boundaries, then begin NP-01 immediately.
```

Do not spend a work session only updating these counters. A progress update is valid only after code, tests, runtime evidence, or a durable checkpoint changed.

---

## 0.2 CORE IMPLEMENTATION — KNOCK THESE OUT IN ORDER

### [ ] NP-00 — Freeze the real Enderloom baseline and implementation boundaries

**Implement / inspect once:**
- [ ] Locate the actual Create, Convert/Port, and Repair entry points.
- [ ] Locate renderer -> IPC/main -> native-service/process boundaries.
- [ ] Identify existing settings persistence, job/progress plumbing, Java/Gradle/process launch, artifact output, logging, cancellation, and runtime-launch code that Northpoint must reuse instead of duplicating.
- [ ] Identify the exact module(s) that will own Northpoint so this does not become another giant `main.js` feature blob.

**Done when:** the implementation locations are known well enough that NP-01 can start without another architecture/repository sweep.

**Evidence:** TODO

---

### [ ] NP-01 — Create the Northpoint service/module and canonical state model

**Implement:**
- [ ] Add a dedicated Northpoint backend/service module.
- [ ] Add typed state/schema for source fingerprint, inventory, parity ledger, feature lineage, compatibility ledger, performance baseline/result, matrix registry/lock/state, per-cell evidence, and release report.
- [ ] Create `.enderloom/northpoint/` persistence with safe atomic writes and schema/version handling.
- [ ] Make resume load existing valid state instead of recomputing unchanged stages.

**Done when:** a real project can create/reload Northpoint state and the renderer can read a truthful summarized job state through the existing privilege boundary.

**Evidence:** TODO

**Depends on:** NP-00

---

### [ ] NP-02 — Put Create, Convert, and Repair behind one Northpoint operation contract

**Implement:**
- [ ] Define one operation interface with operation-specific inputs, not three disconnected pipelines.
- [ ] Preserve the distinctions that matter: new-mod baseline for Create, full lineage for Convert, exact identity/narrow mutation discipline for Repair.
- [ ] Route all three toward the same parity, runtime, performance, artifact, and matrix certification machinery.

**Done when:** all three operation types can start a real Northpoint job and reach the same shared gate engine without fake adapters or duplicated policy logic.

**Evidence:** TODO

**Depends on:** NP-01

---

### [ ] NP-03 — Implement exact intake, hashing, identity detection, and full source/content inventory

**Implement:**
- [ ] Hash the exact source/JAR before mutation.
- [ ] Detect Minecraft/loader/Java/build/mappings/mod metadata from source or artifact authority, not filename guesses.
- [ ] Detect dependencies, optional integrations, signatures, public compatibility surfaces, registries/resources, data/worldgen, UI/rendering, networking, config/save state, mixins/transformers, datagen and side-specific code.
- [ ] Generate `source-fingerprint.json`, `source-inventory.json`, and the initial `parity-ledger.json`.
- [ ] Make unaccounted meaningful content a hard release blocker.

**Done when:** a fixture/source tree and a JAR both produce deterministic inventories, and deliberately deleting an inventoried surface causes the parity gate to fail.

**Evidence:** TODO

**Depends on:** NP-01

---

### [ ] NP-04 — Implement Complete-Lineage conversion: strongest legitimate union, not one branch

**Implement:**
- [ ] Resolve legitimate upstream release/tag/branch/artifact lineage for a conversion.
- [ ] Track introduced/present/missing/last-known-good/newest implementation/status/removal evidence/dependencies/save identity/chosen implementation per feature family.
- [ ] Bring forward newer legitimate additions and fixes.
- [ ] Restore older unique content that vanished only because later ports were incomplete.
- [ ] Require actual evidence before treating a feature as intentionally removed.
- [ ] Handle target-missing vanilla dependencies with explicit compatibility/backport closure instead of deleting/stubbing features.

**Done when:** a regression fixture with different legitimate features in old and new branches produces the expected union, and an intentionally removed/broken feature is excluded only when the fixture contains evidence for that decision.

**Evidence:** TODO

**Depends on:** NP-03

---

### [ ] NP-05 — Implement the primary-target-first executor

**Implement:**
- [ ] Accept the requested Minecraft + loader target.
- [ ] Resolve the exact Java, Gradle, mappings, loader/API/dependency set for that target.
- [ ] Build/repair/create the requested target **before** any secondary matrix cell is allowed to start.
- [ ] Persist exact stage state so failure/restart resumes from the last valid gate.
- [ ] Hard-block fan-out until the primary target is certified or explicitly `runtime/performance-unverified` under the rules below.

**Done when:** a test proves no secondary cell can launch while the primary target is incomplete/failed, and a successful target produces a runnable artifact plus gate state.

**Evidence:** TODO

**Depends on:** NP-02, NP-03; Convert also depends on NP-04

---

### [ ] NP-06 — Implement the zero-loss correctness and compatibility gate engine

**Implement all applicable gates from Sections 7 and 9:**
- [ ] source/parity accounting;
- [ ] mod/registry/save/config/network identity checks;
- [ ] exact API owner/class/member/descriptor checks instead of trusting dependency ranges;
- [ ] optional integration present/absent lanes;
- [ ] Mixin target + PREPARE/APPLY proof;
- [ ] bytecode/JAR integrity + entry diff + class/frame verification for artifact repairs;
- [ ] data/worldgen namespace/asset integrity;
- [ ] packaged production-linkage gate when userdev/mapped development can hide failures;
- [ ] no world/player/config deletion to hide a code defect.

**Done when:** purpose-built negative fixtures for binary drift, optional-linkage failure, mixin failure, accidental content loss, and unsafe artifact mutation are rejected for the right reason; valid fixtures pass.

**Evidence:** TODO

**Depends on:** NP-03, NP-05

---

### [ ] NP-07 — Implement the Northpoint zero-lag profiler + performance challenge gate

**Implement:**
- [ ] Record an equivalent-workload baseline before changing/porting/repairing an existing runnable mod when feasible.
- [ ] Capture the applicable client and/or server metrics from Section 8.
- [ ] Attribute mod-owned hotspots and challenge repeated scanning, polling, stable reflection/linkage rediscovery, avoidable steady-state allocation, redundant serialization/sync, lifecycle leaks, duplicate listeners, and unsafe caches.
- [ ] Preserve full visuals/content/quantity/simulation/settings while optimizing.
- [ ] Persist raw evidence references and a truthful status: `PASSED_IMPROVED`, `PASSED_NO_MEASURABLE_REGRESSION`, `FAILED_REGRESSION`, `RUNTIME_UNVERIFIED`, or genuinely `NOT_APPLICABLE`.

**Done when:** one real/representative client fixture and one server/common fixture demonstrate repeatable baseline-vs-candidate comparison, a deliberately regressed implementation fails, and an unchanged/equal implementation does not fail merely because of normal run noise.

**Evidence:** TODO

**Depends on:** NP-05, NP-06

---

### [ ] NP-08 — Implement one data-driven Minecraft x loader support registry

**Implement:**
- [ ] One backend registry owns support state, Java, Gradle, loader/API, mapping strategy, adapters, runtime lane and blocked reason.
- [ ] UI and planner consume that registry; do not maintain separate hard-coded version lists.
- [ ] Seed current 26.3 Fabric/NeoForge knowledge but revalidate mutable official versions before starting a fresh conversion/build.
- [ ] Model `stable`, `experimental`, `blocked`, and `unsupported` distinctly.

**Done when:** adding/editing a support cell in one registry changes planner + UI behavior consistently, and blocked cells report an exact prerequisite reason without attempting a fake build.

**Evidence:** TODO

**Depends on:** NP-01

---

### [ ] NP-09 — Implement the Stonecutter-like shared-source overlay generator

**Implement:**
- [ ] Canonical `common/` source plus loader overlays, Minecraft-version overlays, and rare exact-cell overlays.
- [ ] Deterministically generate disposable per-cell workspaces.
- [ ] Keep shared assets/data authoritative; do not clone full projects per version.
- [ ] Put loader-specific bootstrap/events/registry/network logic in loader adapters and version-specific API/data differences in version adapters.

**Done when:** at least two loaders and two Minecraft versions can be generated from one shared project, and a shared source edit appears in every affected generated workspace without copy-paste branches.

**Evidence:** TODO

**Depends on:** NP-08

---

### [ ] NP-10 — Implement fan-out policy, remembered preferences, and headless behavior

**Implement exactly:**
- [ ] `ask`
- [ ] `target-only`
- [ ] `all-supported-project`
- [ ] `all-supported-global`
- [ ] precedence: current-run > project > global > ask;
- [ ] compact post-primary prompt with exclusions;
- [ ] deterministic headless fallback that never waits on UI.

**Done when:** automated tests prove precedence, persistence across restart, project override, one-time run override, exclusion handling, and noninteractive behavior.

**Evidence:** TODO

**Depends on:** NP-05, NP-08

---

### [ ] NP-11 — Implement fingerprints, cache reuse, resumability, and failed-only retry

**Implement:**
- [ ] Per-cell fingerprint over shared source, overlays, lineage selection, dependency/toolchain lock, config, and relevant Northpoint rule/adapter version.
- [ ] Reuse green unchanged cells.
- [ ] Invalidate only the loader/version/cell families actually affected by an input change.
- [ ] Reuse Java/Gradle/loader/mapping/dependency caches.
- [ ] Persist coherent cell state after each success/failure.
- [ ] `Retry failed` touches failed/stale cells only.
- [ ] Never overwrite a known-good artifact before replacement certification.

**Done when:** an interrupted fan-out resumes, unchanged rerun does no unnecessary work, loader-only/version-only edits invalidate the correct subset, and failed-only retry leaves green hashes unchanged.

**Evidence:** TODO

**Depends on:** NP-05, NP-08, NP-09

---

### [ ] NP-12 — Implement isolated secondary-cell orchestration after primary certification

**Implement:**
- [ ] Secondary cells may run concurrently only after primary certification.
- [ ] Isolate workspace/log/evidence/output per cell.
- [ ] Bound Java/Gradle concurrency against CPU/RAM.
- [ ] Cancel only processes owned by that matrix job.
- [ ] A secondary failure/cancel must never invalidate the certified primary artifact.
- [ ] Run the same parity, correctness, runtime and performance gates per claimed cell; do not assume a passing sibling proves this cell.

**Done when:** a multi-cell test has simultaneous secondary work, one deliberate secondary failure, one cancellation, and still preserves the certified primary + unaffected passed cells.

**Evidence:** TODO

**Depends on:** NP-06, NP-07, NP-10, NP-11

---

### [ ] NP-13 — Implement deterministic artifacts, hashes, evidence bundle, and truthful release reports

**Implement:**
- [ ] Deterministic output layout/names from Section 12.
- [ ] SHA-256 + size for every shipped artifact.
- [ ] Per-cell source lineage, toolchain, parity, compatibility, runtime, performance, exclusions, differences, failure/blocked reasons and evidence locations.
- [ ] Generate reports from final files/evidence, not optimistic in-memory job state.

**Done when:** deleting/tampering with a final artifact or evidence file makes report verification fail, and a clean run regenerates a report matching actual disk hashes and statuses.

**Evidence:** TODO

**Depends on:** NP-12

---

### [ ] NP-14 — Implement the Northpoint UI as a truthful control surface

**Implement:**
- [ ] Target selection -> primary certification -> ask/automatic fan-out -> results.
- [ ] Matrix rows = Minecraft versions; columns = loaders.
- [ ] Show only backend-derived support/build/parity/runtime/performance state.
- [ ] Provide `Build all supported`, `Build selected`, `Build failed only`, `Stop secondary builds`, `Open logs`, `Open artifacts`, `Copy report`.
- [ ] Show project summary badges for CONTENT/PARITY, RUNTIME, PERFORMANCE and MATRIX.
- [ ] No dead buttons, fake progress, hard-coded success, or renderer-owned privileged work.

**Done when:** every visible action is exercised against real backend state and an injected backend failure appears truthfully in the UI instead of a green/success fallback.

**Evidence:** TODO

**Depends on:** NP-08, NP-10, NP-12, NP-13

---

### [ ] NP-15 — Wire the complete engine through real Create + Convert + Repair workflows

**Implement:**
- [ ] Replace any temporary single-operation integration with the final shared engine.
- [ ] Confirm Create uses Northpoint quality/performance gates.
- [ ] Confirm Convert adds Complete-Lineage and matrix behavior.
- [ ] Confirm Repair preserves original ecosystem identity and uses narrow repair/artifact discipline while still receiving Northpoint performance proof.

**Done when:** three end-to-end fixtures/jobs—one Create, one Convert with cross-version lineage, and one Repair with a real compatibility defect—reach final Northpoint state through the same backend engine.

**Evidence:** TODO

**Depends on:** NP-02 through NP-14

---

## 0.3 RUNTIME + PERFORMANCE PROOF — THESE ARE NOT OPTIONAL CEREMONY

### [ ] NP-16 — Prove real dedicated-server paths

Run the strongest required dedicated-server/integrated-server cases for registry, data, worldgen, networking, entity/block-entity, persistence and server/common performance behavior. Require real readiness, exercise the changed feature, inspect fresh logs, and restart when persistence matters.

**Done when:** required server/common flows are proven for the final candidate, with exact run/log evidence and no task-related fatal/warning being ignored.

**Evidence:** TODO

---

### [ ] NP-17 — Prove real native-client paths

Run actual native client cases for rendering/models/textures/animation/UI/input/sound/client integrations and synced visuals. Exercise the feature, inspect non-obvious states/frames, fresh logs and loaded artifact identity.

**Done when:** the final candidate is visibly/functionally present in the real client and the loaded artifact/hash is the one being released.

**Evidence:** TODO

---

### [ ] NP-18 — Prove Northpoint performance on final integrated candidates

Repeat the equivalent-workload client/server measurements on final packaged candidates, not merely intermediate dev builds. Confirm no performance win came from reduced settings/content/fidelity/simulation and confirm cache/index cleanup across unload/reload/restart.

**Done when:** every applicable final primary/claimed cell has a truthful final performance status and supporting raw evidence.

**Evidence:** TODO

---

### [ ] NP-19 — Run one adversarial regression/challenge pass

Try to falsify the result once:
- [ ] content/lineage omission;
- [ ] optional dependency absent;
- [ ] dependency/API drift;
- [ ] Mixin/production linkage;
- [ ] world restart/persistence;
- [ ] stale cache/resume;
- [ ] one failed matrix cell;
- [ ] lifecycle/cache leak;
- [ ] performance regression under equivalent workload;
- [ ] UI reporting mismatch.

**Done when:** discovered defects are repaired and retested, or the challenge pass finds no unresolved release-blocking contradiction.

**Evidence:** TODO

**Depends on:** NP-15 through NP-18

---

## 0.4 RELEASE / HANDOFF — FINISH THE PRODUCT, NOT JUST THE FEATURE

### [ ] NP-20 — Run Enderloom regression + real Electron end-to-end acceptance

Run the affected targeted tests plus broad convergence/release QA. Launch the actual Electron app and exercise Create / Convert / Repair -> primary target -> matrix -> results/artifacts. Confirm existing launcher/catalog behavior remains green.

**Done when:** the exact final source state passes the relevant suites and the real UI workflow reaches final results without mocks.

**Evidence:** TODO

---

### [ ] NP-21 — Produce and verify the fresh runnable Enderloom package

Build/package the final Enderloom app after implementation. Verify the package contains/loads the Northpoint implementation just tested; record build identity/hash/size and preserve the runnable artifact.

**Done when:** there is a fresh usable package from the exact verified source, not an older build sitting next to new source.

**Evidence:** TODO

---

### [ ] NP-22 — Final acceptance audit + durable checkpoint

- [ ] Reconcile every checkbox in this command center, Section 14 QA, and Section 15 Definition of Done.
- [ ] No unchecked release-blocking item may be hand-waved away.
- [ ] Update progress counts, current blocker, last verified change, and exact next action.
- [ ] Persist the coherent final source/artifacts/reports/evidence to the project’s required durable locations.
- [ ] Record final hashes/commit/checkpoint identities.

**Done when:** another agent can resume from this file alone and immediately know what is complete, what evidence proves it, whether any blocker remains, and the exact next action.

**Evidence:** TODO

**Depends on:** all applicable NP tasks

---


# 1. NORTHPOINT HARD INVARIANTS

Every mod Enderloom touches must pass these rules.

## 1.1 Zero-loss correctness

- Preserve all intended gameplay, visuals, models, textures, animations, particles, sounds, UI, items, blocks, entities, dimensions, structures, worldgen, recipes, loot, tags, advancements, networking, configs, integrations, save behavior and user-visible options.
- Never make a build pass by silently removing a feature, reducing content, substituting an empty implementation, disabling a mixin, stripping data, or deleting world/player data.
- Preserve mod identity unless conversion genuinely requires a metadata change:
  - mod ID
  - namespaces / registry IDs
  - serialized IDs
  - public API descriptors where compatibility matters
  - network/protocol IDs where compatible
  - config keys
  - save/NBT/component/capability keys
  - integration identities
- For a **repair**, keep the original advertised mod version and loader identity unless the repair truly requires migration. A patched filename may identify the repair; do not lie to dependent mods by casually changing the internal identity.
- For a **port/conversion**, preserve the ecosystem identity and content IDs wherever technically possible so worlds, addons and integrations continue recognizing the mod.

## 1.2 Zero-lag target

- Northpoint performance target: **no measurable client or server regression under equivalent workload**.
- A new feature is not automatically exempt because “of course more content costs performance.” Engineer the implementation so idle content is nearly free and active content pays only the work it truly needs.
- Any new hot path introduced by Enderloom must be challenged before release.
- Prefer event-driven state, sparse indexes, stable caches and bounded work over repeated discovery/polling.
- Never manufacture a win by lowering fidelity or workload.

## 1.3 Complete-lineage conversion

For **conversions/ports**, the input JAR/source branch is not automatically the complete mod.

Enderloom must examine the mod's legitimate upstream version history and build a **feature/content lineage** so the converted result contains the strongest legitimate union of the mod's content.

Do not omit something merely because:

- the author did not get around to porting it to a newer branch;
- an older branch has content missing from a newer branch;
- a newer branch added something absent from the user's starting version;
- a loader branch lags another loader branch;
- porting it is inconvenient.

That missing work is exactly what Enderloom is for.

Only exclude a historical/newer feature when evidence shows it was intentionally removed or superseded for a real reason such as:

- corruption/data-loss risk;
- exploit/security problem;
- unrecoverable design defect;
- replacement by a clearly intended successor;
- explicit author decision to remove the feature rather than simply failing to port it.

**Absence is not evidence of intentional removal.**

AoA-style giant mods are the model: do not ship a convenient subset just because one historical branch has fewer dimensions/mobs/items/systems. Inventory the lineage and port the full legitimate feature set.

## 1.4 Target first

The user's requested Minecraft + loader target is always completed first.

Do not fan out 20 builds while the primary target is broken.

A primary target becomes eligible for matrix fan-out only after:

1. source/content accounting passes;
2. build/static gates pass;
3. strongest applicable runtime gate passes;
4. Northpoint performance gate passes or is truthfully marked runtime-unverified because the environment cannot execute it.

---

# 2. ONE TOUCH PIPELINE FOR CREATE / CONVERT / REPAIR

Do not maintain three unrelated quality systems. Use one Northpoint pipeline with operation-specific steps.

```text
INTAKE
  -> IDENTITY + HASH
  -> FEATURE/CONTENT INVENTORY
  -> VERSION LINEAGE (conversion only)
  -> TARGET PLAN
  -> IMPLEMENT / REPAIR
  -> ZERO-LOSS PARITY GATE
  -> STATIC / LINKAGE / PACKAGE GATE
  -> REAL RUNTIME GATE
  -> NORTHPOINT PERFORMANCE GATE
  -> PRIMARY TARGET CERTIFIED
  -> OPTIONAL/AUTOMATIC VERSION MATRIX FAN-OUT
  -> SAME GATES PER CELL
  -> HASHED ARTIFACTS + REPORT
```

Persist enough state that an interrupted run resumes from the last verified gate instead of rediscovering everything.

Required project evidence directory:

```text
.enderloom/northpoint/
  source-fingerprint.json
  source-inventory.json
  feature-lineage.json          # conversions; empty/not-applicable for new mods
  parity-ledger.json
  compatibility-ledger.json
  performance-baseline.json
  performance-result.json
  matrix.json
  matrix-lock.json
  matrix-state.json
  release-report.json
```

Generated state must be machine-readable. The UI should be a view of this state, not a second source of truth.

---

# 3. INTAKE: KNOW EXACTLY WHAT YOU ARE TOUCHING

Before changing an existing mod/JAR/source tree:

- SHA-256 the exact input.
- Detect Minecraft version, loader, loader version, Java class level, mappings/build system and mod metadata from the artifact/source itself. Never trust only the filename.
- Record dependencies and optional integrations.
- Detect signed archives before mutation.
- Inventory code + content surfaces:
  - registries
  - blocks/items/entities/effects/enchantments
  - dimensions/biomes/worldgen/structures/features
  - recipes/loot/tags/advancements
  - menus/screens/keybinds/input
  - renderers/models/textures/animations/shaders
  - particles/sounds
  - networking/protocol payloads
  - configs
  - capabilities/components/attachments/save state
  - mixins/access transformers/access wideners
  - datagen
  - commands
  - integrations/compat modules
  - optional dependencies
  - side-specific code
- Establish public compatibility surfaces before edits:
  - public/protected class hierarchy where relevant
  - method/field descriptors
  - mod metadata
  - mixin configs/entrypoints
  - registry/resource IDs
- For JAR repairs, preserve the original artifact untouched and generate a new candidate.

The inventory becomes the **parity ledger**. Every meaningful source item/content surface must finish as one of:

```text
PRESERVED
PORTED
REPAIRED
REPLACED-BY-EQUIVALENT
INTENTIONALLY-REMOVED-WITH-EVIDENCE
BLOCKED-WITH-EXACT-REASON
```

`UNKNOWN`, `FORGOT`, `NOT PORTED`, or `TODO` cannot ship.

---

# 4. COMPLETE-LINEAGE RULE — CONVERT THE MOD, NOT ONE RANDOM BRANCH

For conversions, resolve the strongest available official/upstream lineage before implementation. Do this once and reuse it for every matrix cell.

## 4.1 Build a feature-lineage ledger

Inspect available upstream releases/tags/branches/source/artifacts around the mod's history and record each meaningful feature/content family as:

```text
featureId
introducedIn
presentIn[]
missingIn[]
lastKnownGood
current/newestImplementation
status = active | historical-active | superseded | intentionally-removed | broken-upstream | unknown
removalReason/evidence
requiredDependencies
save/registryIdentity
chosenNorthpointImplementation
```

## 4.2 Inclusion policy

Use this order:

1. **Everything in the user's source version remains.**
2. **Newer legitimate additions/fixes are brought forward/back** when they are part of the mod's intended evolution and can be implemented safely.
3. **Older unique content is retained** when it disappeared only because later branches were incomplete/lazy ports.
4. If an old implementation was intentionally replaced, keep the successor behavior and only retain unique non-conflicting content.
5. If a feature was removed for a confirmed crash/corruption/exploit, do not blindly resurrect the broken implementation. Either repair it safely and prove it, or record the evidence-backed exclusion.
6. If two legitimate implementations are mutually exclusive, prefer the newest intended semantics and preserve older unique capability behind a compatible implementation/config only when doing so does not fracture saves/network behavior.

Never treat `not present in newest branch` as proof the author wanted it gone.

## 4.3 Cross-version vanilla dependencies

If a retained feature depends on vanilla functionality missing from the target version:

- do not stub/delete it;
- model the full dependency closure;
- implement a target-native compatibility/backport layer when realistic;
- keep provider-present/provider-absent behavior explicit;
- preserve save/registry identities where safe;
- certify the core mod independently so a compatibility provider cannot hide an incomplete base port.

A compatibility layer must not silently hijack another installed provider or duplicate the same vanilla feature.

---

# 5. TARGET-FIRST UNIVERSAL VERSION / LOADER MATRIX

After the primary target is certified, Northpoint handles fan-out according to the stored preference.

## 5.1 User modes

```text
ask                       # default interactive behavior
target-only               # stop after requested target
all-supported-project     # always fan out for this project
all-supported-global      # always fan out for future projects unless overridden
```

Precedence:

```text
explicit current-run choice
> project preference
> global preference
> default = ask
```

When mode is `ask`, the post-target prompt is compact:

- `Keep target only`
- `Build all supported versions`
- `Always for this project`
- `Always for every project`

Before fan-out show the exact additional cells and allow quick uncheck/exclude.

Headless/CLI must never wait for UI input:

```text
explicit CLI choice
> project preference
> global preference
> target-only
```

Suggested CLI/API surface:

```text
--target-mc 26.3
--target-loader neoforge
--matrix ask|target-only|all
--remember none|project|global
--versions 1.20.1,1.21.1,26.3
--loaders forge,neoforge,fabric
--exclude 1.20.1-fabric
--retry-failed
```

## 5.2 Data-driven support cells

One registry drives UI + planner + build system. Each cell records:

```text
minecraftVersion
loader
supportState = stable | experimental | blocked | unsupported
javaVersion
gradleVersion
loaderVersion
mappingStrategy
apiDependencies
requiredAdapters
runtimeTestLane
blockedReason
```

Definitions:

- **blocked** = prerequisite known missing before build.
- **failed** = cell was valid enough to attempt but failed a gate.
- **unsupported** = Enderloom does not claim that combination.
- **experimental** = resolvable but not yet at stable confidence.

Every blocked cell has the exact reason. Never turn a missing dependency into silent content loss.

## 5.3 Current 26.3 seed lane

Use the established 26.3 baseline as a reproducibility seed, while revalidating current official loader metadata before new work:

- Java 25 baseline.
- Fabric 26.3: Loom 1.17 generation, Gradle 9.6.0 seed, Fabric Loader 0.19.5 seed.
- NeoForge 26.3: ModDevGradle 2.0.147 seed, Gradle 9.2.1 seed, NeoForge 26.3.0.1-beta seed.

Do not hard-code these forever. The matrix resolver owns freshness; the lock file owns reproducibility for a specific build.

---

# 6. STONECUTTER-LIKE PROJECT MODEL WITHOUT COPY-PASTE FORKS

Use one canonical source tree with narrow overlays.

```text
project/
  common/
  loaders/
    fabric/
    neoforge/
    forge/
  versions/
    1.20.1/
    1.21.1/
    26.3/
  cells/                     # only truly unique mc+loader exceptions
    1.20.1-forge/
    26.3-neoforge/
  .enderloom/
    northpoint/
  build-matrix/              # disposable generated workspaces
  dist/
```

Merge order:

```text
common
-> loader overlay
-> Minecraft-version overlay
-> rare exact-cell overlay
-> generated workspace
```

Rules:

- Shared code/assets are authoritative.
- Generated workspaces are disposable/reproducible and gitignored.
- Do not clone the whole source tree per version.
- Loader-specific bootstrapping/events/registries/networking stay in loader adapters.
- Version-specific data/API differences stay in version adapters.
- Exact-cell overrides exist only when both loader + Minecraft version genuinely require them.
- Unchanged assets/data stay shared.
- Pack/resource/datagen schema changes may use version overlays.
- Do not require Stonecutter itself if Enderloom's own planner can support more loader/version combinations cleanly.

---

# 7. MIGRATION / REPAIR CORRECTNESS GATES — EMBED THE LESSONS

These are hard rules learned from real failures. Encode them as checks where possible.

## 7.1 Diagnose earliest cause, not loudest warning

- Use execution order and exception ownership.
- A later crash caused by a failed lifecycle is secondary until proven otherwise.
- Do not blame rendering/performance mods merely because warnings appear early.
- Do not delete world/player/config data before the initiating code/dependency defect is fixed.

## 7.2 Declared compatibility is not binary compatibility

A permissive dependency range is not proof.

For API drift prove:

```text
expected owner + class + method/field + descriptor
versus
actual installed owner + class + method/field + descriptor
```

Repair/port the real symbolic mismatch.

## 7.3 Optional dependencies must truly be optional

Do not hard-link optional dependency classes in signatures/descriptors/static initialization if the dependency may be absent.

For each optional integration prove both lanes:

- provider present -> integration works;
- provider absent -> base mod loads and behaves safely.

Use loader-safe indirection/conditional registration/reflection/method-handle resolution as appropriate. Do not make absent optional mods crash class linkage before the guard runs.

## 7.4 Mixin/transformer gates

For every changed mixin:

- verify target owner/member/descriptor/injection point;
- verify annotation retention/classfile representation when generating/patching mixins;
- verify competing transformers/priority if relevant;
- test actual Mixin PREPARE/APPLY in the real loader, not only compilation;
- never blanket-disable the mixin unless its behavior has been proven unnecessary and parity remains exact.

A development compile is not proof a packaged mixin will load.

## 7.5 Bytecode/JAR patch discipline

When repairing an artifact directly:

- keep original + candidate hashes;
- ZIP/JAR integrity test;
- compare entry sets;
- prove only intended entries changed;
- preserve untouched metadata/ZIP entry metadata when practical;
- verify class major versions;
- verify public descriptor surface for changed upstream classes;
- run JVM/class verification across changed classes, preferably the whole artifact for risky patches;
- if control flow changed, verify valid frames/StackMapTable; `COMPUTE_MAXS` alone is not enough;
- preserve archive signatures or use a non-mutating companion/sidecar when signatures make direct mutation unsafe.

## 7.6 Data/worldgen correctness

- Namespace defects are not permission to replace missing structures/templates with empty files.
- First determine whether the missing asset truly exists in another namespace/version/upstream artifact.
- Patch the narrow reference/namespace when that is the actual defect.
- Preserve unrelated world data.
- Work on save copies for destructive data repair.

## 7.7 Production-linkage gate

Mapped/userdev success is not enough for risky namespace/reflection/mixin/invokedynamic/production-remap changes.

For affected work, run the packaged production artifact through the real loader/JVM path. The artifact that passed in development must be proven to be the artifact that actually launched.

---

# 8. NORTHPOINT ZERO-LAG PERFORMANCE GATE

This gate applies to **every created, converted and repaired mod**. It is not an optional polish pass.

## 8.1 The acceptance rule

Under equivalent workload, the Northpoint candidate must be:

- functionally/visually identical or better;
- content-identical or richer under the Complete-Lineage Rule;
- **equal or better in measured client/server performance within repeat-run noise**.

If a measurable regression remains, the cell is not `Northpoint Passed`.

If runtime profiling is impossible in the current environment, report `performance-unverified`; do not convert missing proof into a green badge.

## 8.2 Equivalent workload means equivalent workload

Before/after profiling must hold constant where applicable:

- same world/seed/location/camera route;
- same save state;
- same entity/block-entity counts;
- same dimensions/chunks;
- same render/simulation distance;
- same resolution/window mode;
- same shaders/resource packs;
- same graphics/particles/entity settings;
- same JVM/Java and memory flags when comparing the implementation;
- same loader/modpack except candidate mod;
- same commands/test script/workload duration;
- same server player/bot load for server tests.

Never call these “performance improvements”:

- lower render distance;
- fewer entities/mobs/items/features;
- fewer particles/animations;
- lower animation/render/tick cadence;
- disabled simulation/AI/physics;
- reduced worldgen/content;
- hidden textures/models;
- removed integrations;
- relaxed correctness;
- deleting expensive features.

## 8.3 Metrics

Capture the strongest applicable set.

**Client**

- frame-time median + p95 + p99;
- FPS plus 1% low where available;
- render-thread/client-thread profiler share;
- mod-owned inclusive/self hotspots;
- allocation rate / GC pressure;
- memory retained after world unload/reload when caches were touched;
- stutter during the actual mod feature path.

**Dedicated/integrated server**

- MSPT median + p95 + p99;
- TPS stability;
- mod-owned Spark/profiler inclusive/self cost;
- allocation/GC pressure;
- chunk/worldgen/entity/block-entity cost where relevant;
- packet volume/frequency when networking changed;
- persistence/restart path.

Run enough repeats to distinguish a real delta from noise. Store raw result references + summary in `performance-result.json`.

## 8.4 Optimization rules learned from real mod repairs

Apply these automatically during the challenge pass where semantics permit.

### Eliminate broad repeated discovery

Bad:

```text
render callback -> scan loaded chunks -> scan block entities -> find 3 targets
client tick -> scan every animation layer twice
server tick -> rediscover stable objects/types/metadata
```

Prefer:

- lifecycle-driven sparse indexes;
- register on load/add;
- unregister on remove/unload;
- query only indexed candidates;
- exact invalidation when membership-affecting state changes.

Do not keep strong static references that retain worlds/entities after unload. Use correct lifecycle ownership / weak world identity where necessary.

### Cache classloader-stable metadata/linkage

Never repeatedly perform stable discovery in frame/tick loops when it can be resolved once:

- `Class.forName`
- `getMethod/getField`
- constant identifier construction
- stable integration capability detection
- method/field lookup

Cache safe classloader-stable metadata and, where appropriate, `MethodHandle`/`VarHandle` links. Do **not** cache mutable world/player/item/entity instances just to avoid lookup cost.

### Kill avoidable per-frame/per-tick allocation

Challenge:

- new `HashMap`/lists/sets every frame;
- iterator allocation over stable fixed handler lists;
- temporary wrapper objects;
- repeated serialization buffers;
- fallback capability objects that are almost never used.

Use fixed/reusable structures only when their lifetime and clearing semantics are proven safe. Do not replace allocations with leaks.

### Replace polling with write/lifecycle events

If derived state can be updated when its inputs change, do not recompute it every tick.

Examples:

- cooldown/display state -> update on source writes;
- target membership -> block/entity lifecycle hooks;
- compatibility state -> initialize/invalidate on loader/config changes;
- GUI/open condition -> consolidate redundant global tick listeners when semantics are identical.

### Coalesce redundant sync/serialization

If many writes in one logical burst trigger full capability/NBT/network serialization:

- queue/coalesce to one safe sync at the correct server boundary;
- preserve final state and ordering guarantees;
- never network-sync internal scheduler/bookkeeping fields that clients do not need;
- keep public sync APIs compatible if addons call them.

### Preserve real simulation

Do not optimize by throttling genuine animation state machines, gameplay ticks, equipment reconciliation, AI, physics or render cadence when those are intended behavior.

Optimize the bookkeeping around the simulation first.

### Never “async” unsafe Minecraft state

Do not move live world/entity/render mutation off-thread just to make a profiler look better. Use asynchronous work only for data that is safe to prepare off-thread, then cross back to the owning thread for Minecraft state.

## 8.5 Performance leak/lifecycle gate

Any cache/index introduced by Northpoint must prove:

- correct invalidation;
- world/server transition cleanup;
- no stale membership;
- no strong-reference lifetime extension;
- no cross-world contamination;
- no unbounded growth;
- no duplicate listener registration after reload/restart.

## 8.6 Northpoint performance status

Use explicit states:

```text
PASSED_IMPROVED
PASSED_NO_MEASURABLE_REGRESSION
FAILED_REGRESSION
RUNTIME_UNVERIFIED
NOT_APPLICABLE   # only when truly no executable/runtime surface changed
```

Do not use a vague `optimized=true` flag.

---

# 9. RUNTIME / PARITY GATES PER MOD AND PER MATRIX CELL

Compilation is intermediate evidence.

Choose the strongest applicable gates:

## Static/package

- build succeeds with exact target Java/loader;
- migration/compatibility guard clean;
- JAR integrity clean;
- no accidental duplicate classes/resources;
- expected mod ID/version/loader metadata verified from produced artifact;
- full parity ledger accounted;
- feature lineage ledger accounted on conversions;
- public descriptor/identity diff acceptable;
- mixin configs/targets structurally valid;
- dependency closure resolved;
- no old forbidden namespace/API symbols left for the target;
- packaged artifact hash recorded.

## Dedicated server

Required for common/server/registry/world/network/data/save changes.

- real server reaches readiness;
- changed feature exercised;
- fresh log inspected;
- no hidden fallback feature loss;
- stop/restart if persistence matters.

## Native client

Required for render/model/texture/animation/UI/input/sound/client integrations.

- actual client reaches usable world/menu state;
- changed feature exercised;
- models/textures/animations are visibly present;
- no disappearing/floating/clipping/bind-pose accumulation;
- fresh log inspected.

## Client + integrated server

Prefer for synced gameplay, player state, commands, entity state, Curios/components/capabilities, datapacks and client rendering driven by server state.

## Optional integration matrix

For any touched optional integration:

- dependency absent lane;
- dependency present lane;
- compatibility behavior proves intended semantics in both.

## Restart/persistence

Required when configs/world/player/save/network identity changed.

A cell cannot be `Passed` when its strongest required runtime gate was skipped. Use a truthful `Built - runtime unverified` state.

---

# 10. BUILD ORCHESTRATOR — FAST, RESUMABLE, NO REDOING GOOD WORK

Primary target runs first. Only after it is certified may secondary cells run concurrently.

Per-cell fingerprint includes:

- common source hash;
- loader overlay hash;
- version overlay hash;
- exact-cell overlay hash;
- feature-lineage selection hash;
- resolved dependency/toolchain lock;
- build configuration;
- relevant Northpoint adapter/rule version.

Behavior:

- Skip a green cell when fingerprint + required evidence are unchanged.
- Rebuild only cells invalidated by changed inputs.
- Loader-only edit invalidates only that loader family where possible.
- Version-only edit invalidates only affected version family.
- Cache Gradle/Java/loader/mappings/dependencies across cells.
- Never redownload identical toolchains per target.
- Persist each cell state immediately after coherent success/failure.
- `Retry failed` touches only failed/stale cells.
- Never overwrite a known-good artifact until its replacement passes.
- Each cell gets isolated workspace + log + evidence folder.
- Bound Gradle/JVM parallelism to available CPU/RAM instead of launching everything blindly.
- Cancel kills only processes owned by that matrix job.
- Secondary cancellation never invalidates the already-certified primary target.

Cell states:

```text
pending
blocked
building
built
testing
performance-testing
passed
built-runtime-unverified
failed
cancelled
stale
```

---

# 11. UI / QOL — SIMPLE ON TOP, POWERFUL UNDERNEATH

Do not build a giant wizard.

Primary flow:

```text
Choose target
-> Build + certify target
-> Ask/automatic matrix fan-out
-> Results
```

Rows = Minecraft versions. Columns = loaders.

Cells show:

```text
✓ Northpoint Passed
✓ Passed / Performance Unverified
• Ready
↻ Building
! Failed
× Blocked
— Unsupported
E Experimental
```

Cell detail:

- Minecraft + loader versions;
- Java/toolchain;
- build state;
- parity state;
- feature-lineage state;
- performance state;
- artifact/hash;
- last runtime test;
- failure/blocked reason;
- `Build`, `Retry`, `Open log`, `Open artifact`.

Project summary should show four hard badges, not a meaningless score:

```text
CONTENT/PARITY: PASS | FAIL
RUNTIME: PASS | UNVERIFIED | FAIL
PERFORMANCE: IMPROVED | NO REGRESSION | UNVERIFIED | FAIL
MATRIX: X/Y PASSED, Z BLOCKED
```

Required actions:

- `Build all supported`
- `Build selected`
- `Build failed only`
- `Stop secondary builds`
- `Open artifacts`
- `Copy report`

Northpoint correctness/performance gates are release policy, not a checkbox users accidentally disable.

---

# 12. ARTIFACT + REPORT CONTRACT

Deterministic output naming:

```text
dist/<mod-version>/
  mc-26.3/neoforge/<modid>-<mod-version>+mc26.3-neoforge.jar
  mc-26.3/fabric/<modid>-<mod-version>+mc26.3-fabric.jar
  mc-1.21.1/neoforge/<modid>-<mod-version>+mc1.21.1-neoforge.jar
  release-matrix.json
  northpoint-report.json
  SHA256SUMS.txt
```

Never ship names like `final.jar`, `fixed2.jar`, `working.jar` as the authoritative release identity.

`northpoint-report.json` / `release-matrix.json` must contain per cell:

- source artifact/hash + source lineage;
- Minecraft version;
- loader/version;
- Java/toolchain;
- mod version/ID;
- artifact filename/hash/size;
- build fingerprint;
- support state;
- parity result;
- feature-lineage result;
- intentionally excluded features + evidence;
- dependency resolution;
- static/package gate result;
- dedicated-server/client/integrated-server/restart results;
- optional integration present/absent results where applicable;
- performance baseline + candidate summary;
- performance status;
- known differences;
- blocked/failure reason;
- exact log/evidence locations.

The report must be generated from actual final files/evidence, not optimistic job state.

---

# 13. ENDERLOOM IMPLEMENTATION PLACEMENT

Current Enderloom is Electron/Node with a React/TypeScript launcher frontend and a Rust-backed native launcher/service. Keep privileged work out of renderer components.

## Renderer / launcher frontend

Owns:

- target selection;
- matrix display;
- ask/remember preferences;
- progress/result views;
- exclusion selection;
- report/artifact actions.

Likely homes:

```text
launcher/src/lib/          Northpoint/matrix types + client helpers
launcher/src/components/   matrix prompt/status/details
launcher/src/store.ts      global/project preferences + observable job state
launcher/src/views/        create/convert/repair workflow integration
```

## Main/native service

Owns:

- source/JAR intake;
- hashing/inventory;
- version lineage resolution;
- matrix planning;
- toolchain/dependency resolution;
- project generation/adapters;
- filesystem changes;
- Gradle/Java process execution;
- cancellation;
- runtime QA launching;
- profiler evidence collection;
- state persistence;
- artifact hashing/report generation.

Do not dump Northpoint into the already-large `main.js`. Create a dedicated service/module and leave `main.js` mostly as IPC/orchestration wiring.

Reuse the native service for process/download/runtime duties it already owns. Do not create competing managers in renderer JavaScript.

---

# 14. QA CHECKLIST — AUTOMATE THESE

## Matrix/QOL

- [ ] Primary 26.3 NeoForge target builds before any secondary target.
- [ ] `ask` waits until primary certification.
- [ ] `Build all supported` fans out exact valid cells.
- [ ] project always-all persists.
- [ ] global always-all persists across projects.
- [ ] project override beats global.
- [ ] target failure prevents fan-out.
- [ ] headless mode never waits for prompt.
- [ ] interrupted fan-out resumes.
- [ ] failed-only retry leaves green cells untouched.
- [ ] secondary failure/cancel preserves primary artifact.
- [ ] unchanged second run reuses passed cells.
- [ ] common/loader/version edits invalidate only correct cells.

## Zero-loss / lineage

- [ ] 100% source inventory accounted.
- [ ] converted mod has a feature-lineage ledger.
- [ ] newer legitimate feature absent from source version is brought into the converted target or has an evidence-backed exclusion.
- [ ] older unique content lost only by incomplete/lazy upstream port is retained.
- [ ] intentionally removed broken/exploit/corrupt feature is not blindly resurrected.
- [ ] no feature is omitted merely because dependency/loader migration is inconvenient.
- [ ] registry/save/config/network identities are preserved where technically possible.
- [ ] missing vanilla dependency is adapted/backported or explicitly blocked, never stubbed away.

## Repair/migration hardening

- [ ] declared dependency range is never treated as binary compatibility proof.
- [ ] optional integration passes provider-present and provider-absent lanes.
- [ ] changed mixins pass real loader PREPARE/APPLY.
- [ ] risky packaged artifact passes production linkage, not just userdev.
- [ ] JAR repairs have exact original/candidate hashes and entry diff.
- [ ] class/frame verification passes after bytecode changes.
- [ ] no world/player data was deleted to hide a code defect.
- [ ] no empty placeholder asset was invented to hide an unresolved data defect.

## Performance

- [ ] equivalent before/after workload recorded.
- [ ] client frame-time/FPS evidence captured when client behavior exists.
- [ ] server MSPT/Spark evidence captured when server/common behavior exists.
- [ ] mod-owned new hotspots challenged.
- [ ] no broad loaded-world/chunk/block-entity scan remains in frame/tick paths when lifecycle indexing is possible.
- [ ] no stable reflection/class/identifier rediscovery remains in steady frame/tick paths when cacheable.
- [ ] avoidable per-frame/per-tick allocations are removed.
- [ ] redundant full-state network sync/serialization is coalesced where semantics allow.
- [ ] derived state uses change/lifecycle events instead of polling where possible.
- [ ] cache/index lifecycle proves unload/reload cleanup and no leaks.
- [ ] performance gain did not reduce content/fidelity/simulation/cadence/settings.
- [ ] Northpoint status is improved/no-measurable-regression, or truthfully unverified/fail.

## Runtime/release

- [ ] dedicated server used when required.
- [ ] native client used when required.
- [ ] integrated-server path used when required.
- [ ] restart/persistence used when required.
- [ ] final report matches actual artifacts on disk.
- [ ] deterministic SHA-256 generated for every artifact.
- [ ] existing Enderloom launcher/catalog functionality remains green.
- [ ] actual Electron app exercises create/convert/repair -> primary target -> matrix flow end-to-end.
- [ ] fresh runnable Enderloom build/package produced after implementation.

---

# 15. DEFINITION OF DONE

Do not call Northpoint implemented until all are true:

- [ ] Create, Convert and Repair enter the same Northpoint quality pipeline.
- [ ] Requested target is always completed/certified first.
- [ ] Ask / target-only / project-all / global-all behavior works.
- [ ] One data-driven Minecraft x loader registry controls support.
- [ ] Shared source + loader/version/exact-cell overlays replace copy-paste project forks.
- [ ] Dependency/toolchain availability is resolved per cell.
- [ ] Every touched mod has a complete parity ledger.
- [ ] Every conversion has a complete feature-lineage ledger and maximum legitimate content union.
- [ ] “Author did not bother porting it” is never accepted as an exclusion reason.
- [ ] Intentional removals require actual evidence/reason.
- [ ] Binary/API/optional-dependency/mixin/production-linkage gates exist.
- [ ] Builds never pass by deleting features, world data or fidelity.
- [ ] Northpoint zero-lag gate runs against equivalent workload for applicable client/server surfaces.
- [ ] Repeated scans/polling/reflection/allocation/sync waste is challenged on every mod touched.
- [ ] Performance improvements preserve full visuals/content/quality/quantity/simulation.
- [ ] Build state is persistent/resumable and fingerprints prevent needless rebuilds.
- [ ] Failed-only retry works.
- [ ] Deterministic artifacts + hashes + truthful Northpoint report are produced.
- [ ] UI reflects backend truth; no fake green statuses.
- [ ] Real native Enderloom flow is exercised end-to-end.
- [ ] Fresh usable Enderloom package is produced.

---

# 16. EXECUTE IN THIS ORDER — NO MILESTONE THEATER

This is the short execution mirror of the Command Center above. **Check these here only when the matching NP task has its Evidence field completed.**

- [ ] **NP-00** Inspect and freeze the existing Create / Convert / Repair entry points and process/native boundaries once.
- [ ] **NP-01** Add the Northpoint module, canonical data model, and persisted/resumable state.
- [ ] **NP-02** Route Create / Convert / Repair through one Northpoint operation contract.
- [ ] **NP-03** Add exact input identity/hash, source inventory, and parity ledger; fail unaccounted content.
- [ ] **NP-04** Add Complete-Lineage conversion and prove old/new legitimate content union plus evidence-backed intentional removal.
- [ ] **NP-05** Wire **primary-target-first** through a real operation and prohibit premature fan-out.
- [ ] **NP-06** Add zero-loss correctness, API/binary, optional dependency, Mixin, artifact, data and production-linkage gates.
- [ ] **NP-07** Add Northpoint baseline/profiler/performance challenge and deliberate-regression proof.
- [ ] **NP-08** Add the single data-driven Minecraft x loader support registry.
- [ ] **NP-09** Add shared-source + loader/version/exact-cell overlays and deterministic generated workspaces.
- [ ] **NP-10** Add matrix fan-out modes and remembered project/global preferences, including headless behavior.
- [ ] **NP-11** Add fingerprints, cache reuse, resumability, targeted invalidation and failed-only retry.
- [ ] **NP-12** Add isolated concurrent secondary-cell orchestration with per-cell gates/evidence.
- [ ] **NP-13** Add deterministic artifacts, hashes, evidence bundles, and truthful reports.
- [ ] **NP-14** Add the real backend-driven UI matrix/status/actions.
- [ ] **NP-15** Finish integration across real Create + Convert + Repair flows.
- [ ] **NP-16** Prove final dedicated-server/integrated-server paths where applicable.
- [ ] **NP-17** Prove final native-client paths where applicable.
- [ ] **NP-18** Re-run Northpoint performance proof on final packaged candidates.
- [ ] **NP-19** Run the adversarial regression/challenge pass and repair anything it exposes.
- [ ] **NP-20** Run Enderloom convergence QA and the real Electron end-to-end workflow.
- [ ] **NP-21** Produce and verify the fresh runnable Enderloom package from the tested source.
- [ ] **NP-22** Reconcile all checklists, persist the final checkpoint/evidence, and leave an exact next action if anything remains.

## Original compact execution order — preserved verbatim

The expanded NP checklist above is authoritative for progress tracking. The original compact order is retained here verbatim so this revision loses none of the previous handoff wording or intent.

1. Inspect the existing create/convert/repair entry points and process/native boundaries once.
2. Add the Northpoint data model + persisted state.
3. Wire **primary-target-first** through one real operation immediately.
4. Add source inventory + parity ledger and make that operation fail on unaccounted content.
5. Add the Complete-Lineage resolver for conversions and prove it with a fixture where older/newer branches contain different legitimate features.
6. Add the Northpoint performance baseline/result model and one real performance challenge fixture.
7. Add matrix planning/fan-out + remembered project/global preference.
8. Add caching/fingerprints/resume/failed-only retry.
9. Wire Create + Convert + Repair to the same engine.
10. Add the UI matrix/status badges.
11. Run targeted QA while implementing; do not rerun the entire suite after every edit.
12. At convergence run the broad Enderloom integration/release QA, launch the real app, execute the real workflow, and package the result.

**Do not stop at “framework created.” Do not stop at “one example compiles.” Do not return a plan instead of implementation. Get the primary path working, prove it, then finish the matrix and gates until the Definition of Done is actually satisfied.**
