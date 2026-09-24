# Enderloom Northpoint — Apex Universal Mod Conversion Engine Handoff

**Status:** implementation contract / continuation handoff  
**Date:** 2026-09-22  
**Project:** Enderloom  
**Subsystem:** Northpoint universal version/loader matrix + conversion intelligence  
**Primary proving ground:** AoA Savior  
**Minecraft Dev Kit baseline:** Minecraft 26.3 Port Toolkit v4 / Apex Conversion Lane

---

## 0. Resume contract — do not restart this project

Continue the existing Enderloom/Northpoint implementation. Do **not** replace this with a design-only response, restart discovery that has already been completed, fork the mod once per version, manually hand-fix AoA outside the normal Enderloom flow, or weaken acceptance to make a build green.

The next implementation goal is to make Enderloom the control plane for the hardened Minecraft Dev Kit conversion stack so that a conversion job can:

1. ingest the strongest available authorized source/JAR/assets;
2. recover exact historical mapping and loader/version lineage;
3. build a complete semantic/content/runtime inventory once;
4. choose and complete the requested primary target first;
5. resolve symbols and semantic API changes against the **real target runtime**;
6. build, package, run, diagnose, repair, and retest automatically;
7. prove zero unexplained content/registration loss;
8. fan the verified semantic master out through every valid requested version/loader cell;
9. resume safely after interruption without redoing green work;
10. produce deterministic artifacts, hashes, evidence, and a conversion receipt;
11. improve Enderloom itself whenever the AoA Savior graduation exposes a reusable weakness.

**Implementation crossing:** once the current Enderloom repo and Create/Convert execution path are resolved, make the smallest coherent backend mutation, run targeted tests, checkpoint, and continue. Do not spend repeated waves re-documenting this handoff.

---

# 1. Non-negotiable product invariants

These are release requirements, not preferences.

### 1.1 Zero content loss

Never obtain apparent conversion success by deleting, disabling, commenting out, stubbing, or silently omitting content or behavior the source intended.

When a target differs:

- adapt the behavior;
- implement a target-native equivalent;
- create an internal compatibility layer;
- backport/forward-port the missing supporting behavior when realistic; or
- mark that exact matrix cell **Blocked** with a specific reason.

A green compile obtained by doing less than the source is a failed conversion.

### 1.2 No fake functionality

If Enderloom renders a control that looks actionable, it must be connected to real state and real backend behavior. No dead buttons, hardcoded success, fake progress, placeholder artifact paths, mock “verified” states, or UI-only cancellation.

### 1.3 Target first, matrix second

The requested primary target is serialized and completed first. Secondary version/loader work must not delay delivery of the requested artifact.

```text
Choose target
  -> convert target
  -> exact static proof
  -> build/package
  -> strongest required runtime proof
  -> freeze verified primary artifact
  -> then optional Northpoint matrix fan-out
```

If the primary target fails, secondary fan-out does not begin.

### 1.4 Build is evidence, not completion

`gradlew build`, TypeScript compilation, remapping, or a successful JAR task is never enough by itself. Enderloom must choose the strongest applicable runtime lane and keep `Built - runtime unverified` distinct from `Passed`.

### 1.5 Repair the causal owner

On failure, classify the **earliest causal defect**, fix that owner, run the smallest decisive retest, checkpoint, and continue. Do not chase cascaded errors or remove features to silence them.

### 1.6 One canonical semantic project

Do not create a full copied repository per Minecraft version or loader.

Use:

```text
common semantic source/assets
  -> loader adapter
  -> Minecraft-version adapter
  -> rare exact cell adapter
  -> generated disposable workspace
  -> verified artifact
```

The shared semantic master remains authoritative.

### 1.7 Maximum throughput without quality caps

Use all safe available parallelism after the primary target passes, but never oversubscribe Gradle/native runtimes so badly that throughput regresses. Parallelism is bounded by observed CPU, RAM, process cost, loader/toolchain locks, and cache contention—not an arbitrary tiny fixed cap.

### 1.8 Reproducible and resumable

Every material phase writes durable state. An interrupted job resumes from the last valid fingerprinted checkpoint instead of rescanning/rebuilding everything.

---

# 2. Enderloom owns orchestration; Minecraft Dev Kit owns conversion proof

Do **not** duplicate hardened conversion logic in renderer components or scatter alternate implementations across Electron main, Rust, and TypeScript.

Enderloom should expose one stable conversion service that consumes/produces JSON contracts and invokes the Minecraft Dev Kit engines as versioned workers where appropriate.

For Minecraft 26.3, the current hardened Dev Kit v4 surfaces are:

```text
scripts/port_intake.py
scripts/mapping_lineage.py
scripts/prewarm_mc_26_3_mappings.py
scripts/mapping_bridge.py
scripts/port_semantic_planner.py
scripts/content_identity_inventory.py
scripts/registration_identity_inventory.py
scripts/mixin_surface_audit.py
scripts/classfile_symbol_index.py
scripts/mixin_target_resolver.py
scripts/access_rule_resolver.py
scripts/reflection_surface_resolver.py
scripts/api_reference_migration.py
scripts/port_guard.py
scripts/port_failure_triage.py
scripts/packaged_linkage_audit.py
scripts/content_parity_audit.py
scripts/registration_parity_audit.py
scripts/port_26_3_pipeline.py
scripts/port_26_3_selftest.py
```

Enderloom may call equivalent in-process/native implementations later, but the behavioral contract and regression fixtures must remain equivalent or stronger.

---

# 3. Universal Conversion IR — inspect once, reuse everywhere

Every Create/Convert job must produce one canonical **Conversion IR** before repetitive target work begins.

Recommended project state:

```text
.enderloom/
  conversion/
    source-identity.json
    source-authority.json
    inventory.json
    content-identities.json
    registration-identities.json
    mapping-lineage.json
    mixin-access-reflection-surfaces.json
    dependency-graph.json
    semantic-plan.json
    adapter-plan.json
    acceptance-ledger.json
    primary-state.json
    evidence/
      target-indexes/
      mapping-indexes/
      guards/
      package-linkage/
      runtime/
    cells/
      <mc>-<loader>.json
  matrix.json
  matrix-lock.json
  matrix-state.json
```

The Conversion IR must preserve at least:

- source hash, size, authority and provenance;
- source Minecraft version/range and loader(s);
- Java/Gradle/mapping namespace(s);
- mod ID/version and metadata;
- packages/classes and compiled classes where available;
- blocks/items/entities/effects/enchantments/menus/screens/commands;
- registries/content IDs and dynamic/data registries;
- configs;
- networking packets/payloads/channels;
- capabilities/components/attachments/data components;
- saved state, codecs, serialization and migration hooks;
- mixins, injectors, `@At` targets, MixinExtras, shadows/accessors/invokers/overwrites;
- access wideners/class tweakers/access transformers;
- reflection/MethodHandle/member-name strings;
- recipes/loot/tags/advancements;
- worldgen/biomes/dimensions/structures/features;
- models/textures/animations/sounds/particles/shaders/localization;
- datagen and generated resources;
- optional integrations and compatibility hooks;
- dependency artifacts and version/loader availability;
- client/common/server ownership;
- known source behaviors that require native runtime proof.

Do not rescan the original source independently for every matrix cell. The IR is the shared semantic authority; target-specific passes consume it.

---

# 4. Source authority and conversion lanes

Enderloom must choose the strongest legitimate authority available rather than assuming every input looks the same.

## 4.1 Java source -> Java target

Preferred lane. Preserve source history, build metadata, mapping declarations, generated resources, tests, access files, and existing compatibility abstractions.

## 4.2 Compiled JAR/classes -> Java target

For authorized inputs when source is absent or incomplete:

- preserve the original binary hash;
- inventory metadata/resources/classes without executing them;
- recover the exact historical namespace from evidence, never from a guess;
- decompile/reconstruct only where permitted and useful;
- scan compiled Minecraft API references directly;
- translate owners/names/**descriptors** through the historical mapping lineage;
- compare the resulting references to exact target runtime symbols;
- keep unresolved semantic gaps explicit.

Do not bypass encryption, access controls, licensing restrictions, paywalls, or pack protection.

## 4.3 Cross-version same-loader

Prefer target-native APIs and data formats. Preserve behavior while isolating version differences in version adapters.

## 4.4 Cross-loader

Keep gameplay/content semantics shared. Loader adapters own registration/bootstrap/events/network/config/render hooks and packaging metadata.

## 4.5 Bedrock add-on -> Java mod

Use a semantic conversion IR rather than a file-extension copier. Recover behavior packs, resource packs, entities, components, animations/controllers, Molang, loot, recipes, structures, dimensions, script/game-test behavior and UI where supported; translate each layer to native Java-side behavior with explicit parity accounting.

## 4.6 Authorized server/plugin/resource-pack -> native mod

Compose the Minecraft Dev Kit server-asset conversion lane. Recover visual, model-runtime, and gameplay semantics independently; resolve plugin ecosystem dependencies and cross-links; choose the least-lossy target renderer/runtime rather than forcing one library.

## 4.7 Future version targets

Do not encode “26.3 rules” as universal assumptions. Each target profile declares capabilities, mapping model, Java/toolchain, loader metadata, APIs, data formats, runtime lanes, and known migrations. The conversion engine asks the target profile what is true.

---

# 5. Mapping lineage is a graph, not find/replace

For every source-target pair, persist exact namespace lineage.

Supported historical evidence can include:

- Mojang official/ProGuard mappings;
- Yarn named;
- Fabric Intermediary;
- SRG/TSRG;
- MCP named snapshots/stables when proven by source build metadata;
- unobfuscated official 26.x names.

For each translated member preserve the tuple:

```text
source owner
source member name
source JVM descriptor
source namespace
mapping bridge/path
resolved target owner
resolved target member name
resolved target JVM descriptor
confidence/evidence
```

Object types **inside JVM descriptors** must be mapped too. Never accept a method merely because its simple name looks right.

### 26.3 rule

Minecraft Java 26.3 is the official/unobfuscated endpoint. Historical Yarn/Intermediary/SRG/MCP names are migration evidence; they are not a reason to add an invented target Yarn layer.

---

# 6. Semantic migration engine — answer “what replaces this?”

A top-level converter cannot stop at `symbol not found`.

For an obsolete API/member/hook, Enderloom must determine:

1. what source behavior the code was implementing;
2. whether the symbol was renamed, moved, inherited elsewhere, signature-changed, loader-owned, data-driven, or removed;
3. which target subsystem now owns that behavior;
4. whether a target-native replacement exists;
5. whether a reusable compatibility adapter already exists;
6. what exact runtime proof validates the replacement.

The migration plan must classify each task, for example:

```text
exact-rename
owner-move
signature-change
loader-api-replacement
vanillaized-api
code-to-data migration
data-schema migration
registry/bootstrap migration
network migration
config migration
capability/component migration
worldgen migration
render/input migration
semantic-removal-needs-adapter
missing-prerequisite-blocks-cell
```

Every reusable solution should become a versioned **Adapter Catalog** entry instead of being rediscovered for the next project.

Adapter entries should record:

```text
source version range / loader / API signature
semantic intent
target version range / loader
required dependencies
transformation recipe or implementation module
static tests
runtime lane
known limitations
proven project fixtures
last validation version/date
```

Never auto-apply a “similar-looking” adapter without satisfying its source/target predicates.

---

# 7. Exact target oracle — prove the runtime that will actually load

The exact target symbol index is not disposable debug output. It is release evidence.

For Minecraft 26.3:

```text
python scripts/classfile_symbol_index.py index <target-runtime> \
  --include-refs \
  --runtime-java 25 \
  --out <target-index.json>
```

The v4 index contract includes:

- exact source SHA-256 identity;
- Java runtime used for Multi-Release selection;
- class major/access flags;
- superclass/interfaces;
- fields/methods + exact descriptors;
- selected Multi-Release class variant;
- recognized nested JARs;
- duplicate-owner evidence;
- parse failures;
- class/member references when requested;
- actual bytecode field/method instruction references;
- LambdaMetafactory/invokedynamic linkage.

Strict 26.3 release must reject:

- stale pre-v4 index schema;
- target index generated for a runtime other than Java 25;
- target index without source SHA-256 identity;
- target index containing class/nested archive parse failures.

Enderloom caches exact indexes by source hash + runtime Java, never just by filename.

---

# 8. Mixin, access and reflection gates

## 8.1 Mixins

Resolve retained target surfaces against the exact target index before native launch:

- target class owner;
- exact selector member and descriptor;
- `@At(target=...)` member references;
- `@Shadow`;
- `@Accessor`;
- `@Invoker`;
- `@Overwrite`;
- `@Inject`, `@Redirect`, `@ModifyArg`, `@ModifyArgs`, `@ModifyVariable`, `@ModifyConstant`;
- modern MixinExtras surfaces including `@ModifyExpressionValue`, `@ModifyReceiver`, `@ModifyReturnValue`, `@WrapOperation`, `@WrapMethod`, `@WrapWithCondition`.

Descriptorless overloaded selectors are blockers, not guesses. A structurally resolved selector still requires real Mixin PREPARE/APPLY and behavior proof.

## 8.2 Access rules

Access wideners/class tweakers/ATs mutate a declaration. Therefore Enderloom must require the member to be declared on the named owner.

This is **not valid proof**:

```text
Target.value exists through TargetBase
therefore an access rule naming Target.value is okay
```

It must retarget to the real declaring owner or block.

## 8.3 Reflection / MethodHandles

Exact-audit common literal forms against the target index:

- `Class.forName`;
- `getDeclaredMethod` / `getMethod`;
- `getDeclaredField` / `getField`;
- `findVirtual` / `findStatic` / `findSpecial`;
- getter/setter MethodHandles;
- Forge `ObfuscationReflectionHelper.findField/findMethod`.

Computed names and dynamic reflection are not silently passed. Keep them as explicit runtime acceptance debt.

---

# 9. Packaged JVM linkage — validate what ships, not what compiled

Before native runtime, inspect the **final packaged candidate**.

Enderloom must prove:

- Minecraft/dependency owners exist in the supplied runtime indexes;
- member owner/name/exact descriptor resolves through the real hierarchy;
- descriptor object types exist;
- actual JVM opcode matches target static/instance mode;
- `invokeinterface`/`invokevirtual` matches interface/class ownership;
- LambdaMetafactory SAM owner/name/descriptor resolves;
- invokedynamic implementation handles resolve;
- classfile major is valid for target Java;
- candidate does not shade/copy runtime-owned Minecraft classes to manufacture success;
- Java Multi-Release candidate selection matches the target runtime;
- recognized nested JARs are indexed without execution.

Package declarations are executable linkage too. Verify:

- Fabric entrypoint classes;
- referenced Fabric access widener;
- referenced Mixin config files;
- Mixin classes and plugins;
- manifest `MixinConfigs`;
- referenced nested JARs;
- `META-INF/services/*` provider classes.

Do not promote a cell to `Passed` from this gate alone. It is the final cheap structural gate before the real runtime.

---

# 10. Zero-loss parity ledgers

Every conversion keeps multiple independent parity ledgers because assets alone cannot prove code registrations, and code registrations cannot prove data/resources.

At minimum:

### Content identity parity

Track semantic IDs across legitimate path/schema changes for:

- recipes;
- loot tables;
- tags;
- advancements;
- structures;
- worldgen/dynamic registry data;
- models/textures/sounds/lang/particles/etc.;
- other mod-owned namespaced resources.

### Code registration parity

Track high-confidence code registrations for:

- blocks;
- items;
- entity types;
- effects;
- enchantments;
- menus;
- sounds;
- particles;
- custom registries;
- other registry-owned content.

### Behavior parity

Track source behavior contracts that cannot be proven from IDs alone:

- AI goals/brain/activity;
- combat effects;
- interaction/use behavior;
- menus/screens;
- networking;
- commands;
- worldgen behavior;
- save/config migrations;
- optional integrations;
- animation/render state;
- side-specific behavior.

A missing identity or behavior is either repaired, explicitly superseded by a proven equivalent, deliberately excluded by an approved project rule, or blocks release. It is never silently ignored.

---

# 11. Autonomous causal repair loop

Every conversion job uses the same monotonic loop:

```text
inspect once
  -> plan one coherent semantic batch
  -> mutate
  -> cheapest decisive changed-path check
  -> build/datagen if needed
  -> classify earliest causal failure
  -> repair causal owner
  -> narrow retest
  -> checkpoint
  -> continue
```

Failure classifiers should distinguish at least:

- Java/Kotlin compile missing symbol;
- signature/descriptor mismatch;
- wrong owner/inheritance;
- mapping namespace residue;
- dependency missing/wrong artifact;
- registry/bootstrap migration;
- data/resource schema migration;
- Mixin target/selector/PREPARE/APPLY/injection failure;
- access rule target failure;
- reflection/MethodHandle failure;
- static/instance linkage mismatch;
- interface/class linkage mismatch;
- invokedynamic/SAM failure;
- package metadata/entrypoint/service failure;
- runtime side/client/server classloading;
- missing resource/model/sound;
- networking/protocol mismatch;
- serialization/save/config failure;
- behavior/parity regression;
- loader/toolchain/cache/environment failure.

After two unchanged failure observations, change strategy. Never loop the same command with the same state.

When a fix is generic, promote it into Enderloom's adapter/diagnostic catalog and add a regression fixture before continuing.

---

# 12. Testing engine — headless first, native when it matters

Enderloom should make high-confidence conversion QA fast enough to run automatically.

## Lane 0 — deterministic static/IR tests

- source/IR integrity;
- mapping bridge;
- semantic task closure;
- exact Mixin/access/reflection resolution;
- content/registration parity;
- target-index identity/runtime selection;
- package linkage;
- metadata/service references.

## Lane 1 — build/datagen

Exact target toolchain and dependencies, with isolated logs and reproducible locks.

## Lane 2 — dedicated server

Required for affected common/server/registry/data/world/network behavior. Require actual readiness and exercise changed behavior, not merely process start.

## Lane 3 — native client

Required for renderer/models/textures/animations/sound/input/screens/client lifecycle and retained client Mixins.

## Lane 4 — client + integrated server

Preferred for synced gameplay/entity state, commands, datapacks, menus, gameplay conversions and features that cross logical sides.

## Lane 5 — restart/persistence

Required for config/save/state/registry migration behavior.

## Lane 6 — production/package namespace proof

When mapped dev/userdev can hide defects, launch the exact packaged artifact through the real production-style path.

Headless/API/CLI runners are the default where they are authoritative. Escalate to native visual/client evidence only when the acceptance surface actually requires it.

---

# 13. Northpoint matrix — target first, then every valid requested cell

Preserve the existing Northpoint contract.

User modes:

```text
ask                         # default interactive behavior
target-only
all-supported-project
all-supported-global
```

Precedence:

```text
explicit current-run choice
> project preference
> global preference
> default ask
```

Headless mode must never hang awaiting UI input. If no explicit/project/global policy exists, headless defaults to target-only.

“All supported” means every **valid** cell after current loader/toolchain/dependency/capability resolution, not every Cartesian-product fantasy.

Each cell stores:

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

Cell lifecycle:

```text
pending
blocked
building
built
testing
passed
failed
cancelled
stale
```

Primary success is the fan-out gate.

---

# 14. Matrix project layout

Keep one canonical project and disposable generated workspaces.

```text
project/
  common/
  loaders/
    fabric/
    neoforge/
    forge/
    quilt/                       # only for matrix cells actually supported
  versions/
    <mc-version>/
  cells/
    <mc-version>-<loader>/       # rare exact exceptions only
  adapters/
    project/                     # project-specific semantic adapters
  .enderloom/
    conversion/
    matrix.json
    matrix-lock.json
    matrix-state.json
  build-matrix/                  # generated/disposable/gitignored
  dist/                          # verified artifacts only
```

Resolution order:

```text
common
  -> loader overlay
  -> Minecraft-version overlay
  -> exact-cell overlay
  -> generated workspace
```

No full-project copy fork unless there is a proven technical reason and the exception is documented.

---

# 15. Fingerprints, cache reuse and invalidation

Every cell gets a content-addressed fingerprint from:

- shared semantic source hash;
- loader overlay hash;
- version overlay hash;
- exact-cell overlay hash;
- adapter catalog versions actually consumed;
- resolved dependencies;
- mapping indexes;
- exact toolchain lock;
- relevant build configuration;
- runtime test contract version.

Rules:

- unchanged passed cell -> reuse;
- common source edit -> invalidate every dependent cell;
- Fabric-only adapter edit -> invalidate Fabric cells only;
- one exact-cell edit -> invalidate that cell only;
- toolchain/dependency/mapping lock change -> invalidate affected cells;
- runtime-test contract change -> keep build artifact cache but invalidate the affected proof state.

Cache globally by content identity when safe:

- JDKs;
- Gradle distributions;
- loader artifacts;
- mappings;
- Maven dependencies;
- Minecraft assets/natives;
- exact target symbol indexes;
- generated immutable intermediate data.

Never redownload identical inputs per matrix cell.

---

# 16. Parallel build scheduler

The primary target remains serialized through verification. After that, secondary cells can execute concurrently.

Scheduler requirements:

- discover CPU/RAM once per run;
- estimate Gradle/native lane memory cost;
- maximize useful concurrency without swapping/thrashing;
- share immutable caches safely;
- isolate mutable Gradle/project work directories;
- avoid simultaneous jobs that fight over the same non-concurrent tool/cache lock;
- persist each state transition immediately;
- cancellation terminates only processes owned by the selected conversion job/cells;
- stopping secondaries never invalidates the verified primary artifact;
- failed-only retry schedules only failed/stale cells.

Do not use a permanent low thread/process cap just to appear safe. Adapt concurrency from real resource pressure and workload type.

---

# 17. Enderloom service architecture

Current Enderloom architecture is Electron/Node + React/TypeScript launcher UI + Rust-backed native launcher/service. Keep authority boundaries clean.

## Renderer / React

Owns only:

- target selection;
- version-matrix display;
- user preferences/prompt;
- progress/evidence presentation;
- logs/actions/results;
- user exclusions/overrides.

It must **not** execute arbitrary Gradle/JDK processes or mutate project files directly.

Suggested organization:

```text
launcher/src/lib/conversion/
  types.ts
  client.ts
  selectors.ts
  report.ts
launcher/src/components/conversion/
  TargetSelector.tsx
  MatrixPrompt.tsx
  MatrixGrid.tsx
  ConversionProgress.tsx
  EvidenceDrawer.tsx
launcher/src/views/
  CreateMod...
  ConvertMod...
```

## Electron main / native service

Owns:

- source inspection;
- file mutation;
- mapping/toolchain/dependency resolution;
- Conversion IR persistence;
- adapter planning/application;
- generated workspaces;
- build/datagen execution;
- process ownership/cancellation;
- hashing/fingerprints;
- class indexes;
- static gates;
- runtime launch/QA;
- artifact packaging;
- matrix state persistence.

Do not dump the implementation into an already-large `main.js`. Add a dedicated conversion/Northpoint service and keep main as typed IPC/orchestration wiring.

Use the Rust native service for process/download/runtime responsibilities it already owns; do not create a competing renderer-side process manager.

---

# 18. Backend API / IPC contract

Names may follow existing Enderloom conventions, but behavior should map cleanly to:

```text
conversion.inspect(source)
conversion.plan(sessionId, target, options)
conversion.startPrimary(sessionId)
conversion.startMatrix(sessionId, selection)
conversion.retryFailed(sessionId)
conversion.retryCells(sessionId, cells)
conversion.cancelCell(sessionId, cellId)
conversion.cancelSecondary(sessionId)
conversion.getState(sessionId)
conversion.getEvidence(sessionId, evidenceId)
conversion.openArtifact(sessionId, cellId)
conversion.copyReport(sessionId)
```

Events should be typed deltas, for example:

```text
conversion:stateDelta
conversion:cellDelta
conversion:logChunk
conversion:evidenceReady
conversion:primaryVerified
conversion:matrixComplete
```

Never make the UI infer success from process exit alone. Backend state must derive from completed acceptance gates.

---

# 19. CLI / automation contract

The GUI and headless paths must call the same conversion service.

Suggested semantics:

```text
enderloom convert <source> \
  --target-mc 26.3 \
  --target-loader neoforge \
  --matrix ask|target-only|all \
  --remember none|project|global \
  --versions 1.20.1,1.21.1,26.3 \
  --loaders forge,neoforge,fabric \
  --exclude 1.20.1-fabric \
  --retry-failed \
  --strict
```

For automation, unresolved interactive `ask` must deterministically become target-only unless an explicit noninteractive policy says otherwise.

Exit codes/result JSON must distinguish:

- primary conversion failure;
- primary built but runtime unverified;
- primary passed with secondary failures;
- all requested valid cells passed;
- cells blocked before build;
- cancellation.

---

# 20. Artifact contract

Use deterministic output names.

```text
dist/<mod-version>/
  mc-26.3/neoforge/<modid>-<mod-version>+mc26.3-neoforge.jar
  mc-26.3/fabric/<modid>-<mod-version>+mc26.3-fabric.jar
  mc-1.21.1/neoforge/<modid>-<mod-version>+mc1.21.1-neoforge.jar
  conversion-receipt.json
  release-matrix.json
  SHA256SUMS.txt
```

Never ship ambiguous names such as `mod-final.jar`, `working.jar`, or `fixed2.jar`.

Each artifact is immutable once marked verified. A replacement is written separately, verified, then atomically promoted.

---

# 21. Apex conversion receipt

Every completed job emits a machine-readable and human-readable receipt.

At minimum:

```text
source identity + hash
source authority/provenance
source Minecraft/loader/mapping lineage
Conversion IR version/hash
adapter catalog versions used
primary target
matrix policy + selected cells
per-cell toolchain/dependency lock
per-cell fingerprint
mapping evidence
semantic migration task closure
Mixin/access/reflection exact resolution
content parity result
registration parity result
build result
packaged linkage result
runtime lane + evidence
restart/persistence result if required
artifact path/name/size/SHA-256
known intentional differences
blocked reason or earliest causal failure
```

A report must never say `Passed` if the strongest required runtime lane was skipped.

---

# 22. User experience — powerful underneath, simple on top

The primary flow stays:

```text
Choose source
  -> Choose target
  -> Convert + verify target
  -> optional Build all supported
  -> Results
```

After a primary success in `ask` mode show one compact prompt:

- `Keep target only`
- `Build all supported versions`
- `Always do this for this project`
- `Always do this for every project`

Show the exact additional cell count and allow quick exclusion before fan-out.

Matrix cells visibly show:

```text
✓ Passed
• Ready
↻ Building
! Failed
× Blocked
— Unsupported
E Experimental
```

Cell detail exposes real backend evidence:

- Minecraft/loader versions;
- Java/toolchain;
- dependency state;
- adapter set;
- last build/test;
- artifact/hash;
- blocked/failure reason;
- `Build`, `Retry`, `Open log`, `Open artifact` when actually available.

---

# 23. AoA Savior — Enderloom graduation, not a one-off manual port

AoA Savior is the final proving workload because it exercises historical source archaeology, huge content parity, loader/version API evolution, worldgen/data, entities, assets, compatibility and long-lived behavior.

The purpose is **not** merely to finish AoA once. The purpose is to improve Enderloom until Enderloom can finish AoA through its normal conversion workflow.

## 23.1 Source authority

Use the strongest legitimate AoA historical lineage available, including the official historical branches spanning approximately Minecraft 1.7.10 through 1.21 and the supplied AoA3 3.6.11 plus Nevermine/AoA2 archaeology sources where applicable.

Build the strongest legitimate semantic union from historical lineage instead of accepting content removed by an incomplete later port as proof that it never existed.

## 23.2 First successful master conversion

Finish the current AoA Savior semantic conversion to the preserved primary target first. This successful target becomes the behavioral/content reference for fan-out, not a reason to discard historical evidence.

Enderloom should automatically choose the next coherent conversion batch from dependency and parity graphs rather than requiring a person to manually select mob families or feature groups.

## 23.3 Clean-room graduation replay

After the first full success:

1. preserve a checkpoint from the unfinished Savior state **before** Enderloom-specific manual fixes;
2. start a clean-room replay from that checkpoint;
3. let the improved Enderloom inspect, plan, mutate, build, diagnose, repair, test and checkpoint through normal product actions;
4. do not manually edit source between normal Enderloom steps to rescue it;
5. when it fails because of a reusable converter weakness, fix Enderloom/Dev Kit, add a regression fixture, then resume/replay from the appropriate checkpoint;
6. repeat until Enderloom can complete the project without human source surgery.

This is the graduation criterion for autonomy.

## 23.4 Universal matrix graduation

Once the semantic AoA master is verified, fan it through **all configured valid supported cells**, including modern targets such as 1.21.1 and 26.3, historical/regression cells supported by Enderloom, and future cells added to the support registry.

Do not blindly promise impossible loader/version combinations. Resolve each cell first; exact missing prerequisites become `Blocked` with a reason.

For every built cell require:

- zero unexplained content identity loss;
- zero unexplained code-registration loss;
- required behavior parity contracts;
- exact symbol/linkage gates;
- correct loader/version adapter behavior;
- strongest applicable runtime lane;
- deterministic artifact/hash/report.

## 23.5 AoA graduation is successful only when

- Enderloom can perform the clean-room replay through normal workflows;
- failures improve the reusable engine rather than being patched around ad hoc;
- the primary target is fully verified;
- every valid requested matrix cell is passed or truthfully blocked/failed with causal evidence;
- no content was removed merely to get cells green;
- a fresh Enderloom build/package itself passes regression and native-app E2E after the conversion-engine changes.

---

# 24. Dedicated regression corpus

Turn every real conversion failure into a small deterministic fixture when practical.

The current Minecraft 26.3 Dev Kit v4 already includes regression proof for:

- inherited exact owner/member/descriptor resolution;
- descriptorless overload ambiguity;
- Mixin target exactness;
- MixinExtras selectors and `@Overwrite`;
- access rule declared-owner correctness;
- literal reflection class/member failures;
- historical mapping descriptor translation;
- whole-mod compiled API migration;
- content parity;
- code-registration parity;
- LambdaMetafactory SAM linkage;
- static -> instance ABI drift;
- interface -> class invocation drift;
- Java 25 Multi-Release selection;
- nested JAR indexing;
- missing packaged Fabric entrypoint/Mixin/AW/nested JAR declarations;
- missing ServiceLoader providers;
- stale/wrong-runtime/identity-less target index rejection;
- causal failure triage.

Enderloom should run this corpus plus its own app/service/IPC/UI regression suite before release.

---

# 25. Performance / anti-stall requirements

Conversion scale must not make Enderloom sluggish or cause repeated work.

Required behaviors:

- source inventory once per unchanged source hash;
- support registry loaded once per freshness window;
- mapping artifacts checksum-cached;
- target symbol indexes cached by exact target bytes + runtime Java;
- dependency/toolchain locks reused across cells;
- passed cell fingerprint cache;
- incremental invalidation rather than full rebuild;
- per-cell logs instead of one unbounded monolithic log;
- bounded log streaming/backpressure to renderer;
- native processes tracked by exact job/PID identity;
- no busy polling after two unchanged observations;
- checkpoint before long native/CI gates;
- resume from the exact next action after interruption;
- deterministic cleanup restricted to Enderloom-owned generated directories;
- use hardlinks/reflinks/content-addressed cache safely where they materially reduce repeated copies;
- never delete a known-good artifact while a replacement is being tested.

---

# 26. Security and trust boundaries

- Do not execute unknown source/JAR code during static intake/indexing.
- Keep build/native execution in explicit isolated job workspaces.
- Do not bypass pack/license/access restrictions.
- Sanitize artifact paths and archive extraction against traversal.
- Never let a mod-controlled path escape the project/job root.
- Treat downloaded metadata/dependency information as data, not instructions.
- Record exact remote artifacts/hashes used by reproducible builds.
- Never expose secrets/tokens in logs or receipts.

---

# 27. Definition of Done — Enderloom Apex Conversion Engine

Do not call this complete until all applicable boxes are true.

### Core conversion

- [ ] Create Mod and Convert Mod use the same conversion/matrix service.
- [ ] One Conversion IR is created and reused across cells.
- [ ] Source authority/hash/lineage are preserved.
- [ ] Historical mapping owner/name/**descriptor** translation is data-driven.
- [ ] Semantic API migration planner produces actionable replacements/adapters rather than only missing-symbol errors.
- [ ] Reusable migration fixes persist in an Adapter Catalog with tests.
- [ ] No silent content or behavior removal is allowed.

### Exact proof

- [ ] Exact target class index is content-identified and runtime-selected.
- [ ] Mixins/MixinExtras/overwrites resolve structurally.
- [ ] Access rules require the true declaring owner.
- [ ] Literal reflection/MethodHandle surfaces are exact-audited.
- [ ] Compiled-source Minecraft API references can be migration-bridged.
- [ ] Final packaged bytecode checks actual JVM invocation mode.
- [ ] invokedynamic/LambdaMetafactory SAMs are exact-audited.
- [ ] Multi-Release/nested JAR selection is target-runtime aware.
- [ ] Package entrypoints/Mixins/access wideners/nested JARs/services are checked.
- [ ] Content and code-registration parity are independently proven.

### Northpoint matrix

- [ ] Requested primary target builds and verifies before secondary cells.
- [ ] `ask`, `target-only`, project-all and global-all behavior works.
- [ ] Headless flow never waits for UI input.
- [ ] Matrix support comes from one data-driven registry.
- [ ] Shared + loader + version + exact-cell overlay model is used.
- [ ] Per-cell dependencies/toolchains are resolved before build.
- [ ] Unsupported/blocked/failed remain distinct.
- [ ] Fingerprints skip unchanged passed cells.
- [ ] Invalidations affect only dependent cells.
- [ ] Interrupted runs resume.
- [ ] Failed-only retry does not rebuild green cells.
- [ ] Secondary failure cannot destroy the primary artifact.
- [ ] Secondary cells use safe adaptive parallelism.

### Runtime and artifacts

- [ ] Strongest required runtime lane is selected automatically.
- [ ] `Built - runtime unverified` cannot become `Passed`.
- [ ] Server/client/integrated/restart evidence is persisted when applicable.
- [ ] Artifacts use deterministic names and SHA-256.
- [ ] Conversion receipt exactly matches artifacts/evidence on disk.
- [ ] UI status comes from backend evidence, not guessed process state.

### App quality

- [ ] No fake/dead conversion controls exist.
- [ ] Existing launcher/catalog behavior is not regressed.
- [ ] Renderer performs no privileged build/file execution directly.
- [ ] A fresh usable Enderloom build/package is produced.
- [ ] Real native Electron Create/Convert -> primary -> matrix -> results workflow is exercised end-to-end.

### Graduation

- [ ] AoA Savior completes once with full zero-loss evidence.
- [ ] Enderloom then completes the preserved unfinished Savior checkpoint in a clean-room replay without manual source surgery.
- [ ] Reusable failures discovered during replay become engine fixes + regression fixtures.
- [ ] Verified AoA semantic master fans out to all requested valid supported version/loader cells.
- [ ] Final AoA matrix report and artifacts are reproducible and truthful.

---

# 28. Exact next implementation action

Resume inside the canonical Enderloom repository at the existing Create/Convert backend boundary.

1. Identify the current source-inspection/build job model and Northpoint matrix service from the previous checkpoint; do not rescan unrelated launcher/catalog code.
2. Add one `ConversionSession`/IR persistence model and a backend adapter around the Minecraft Dev Kit JSON workers.
3. Wire the hardened exact-target sequence into the **primary target** conversion path first:

```text
intake
-> mapping lineage
-> semantic plan
-> target index
-> exact Mixin/access/reflection proof
-> source parity ledgers
-> build/datagen
-> failure triage/repair loop
-> final package linkage
-> strongest runtime lane
-> verified primary artifact
```

4. Add a deterministic integration fixture that intentionally fails staticness/interface/reflection/access-owner linkage and proves Enderloom surfaces the causal blocker rather than generic build failure.
5. Once the primary path is green, connect Northpoint fan-out to the same session/IR and cell fingerprint model.
6. Run the Enderloom app regression suite and native Electron E2E.
7. Begin/continue AoA Savior through this path. Any generic failure becomes an Enderloom/Dev Kit improvement plus regression fixture before proceeding.

**Do not stop at the handoff. Implement until the real workflow works.**
