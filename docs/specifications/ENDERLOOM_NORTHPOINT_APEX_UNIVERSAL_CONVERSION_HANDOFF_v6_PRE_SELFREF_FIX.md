# Enderloom Northpoint — Apex Universal Mod Conversion Engine Handoff

**Status:** implementation contract / continuation handoff  
**Date:** 2026-09-23  
**Project:** Enderloom  
**Subsystem:** Northpoint universal version/loader matrix + conversion intelligence  
**Primary proving ground:** Advent of Ascension (AoA) — exact original mod identity preserved from authoritative source metadata  
**Minecraft Dev Kit baseline:** Minecraft 26.3 Port Toolkit v5 / Apex Conversion Lane

---

# CODEX EXECUTION LOCK — sole mission for this handoff

This file is the **single execution contract** for the next Codex run. Resume the existing `ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md` lineage exactly where the repository and checkpoints currently left off, preserve all already-valid work, and execute this mission to completion:

> **Fully finish and build Advent of Ascension (AoA) end-to-end with zero content loss, while treating every failure, slowdown, repeated manual step, or source-surgery workaround as a mandatory reusable Enderloom/Minecraft Dev Kit improvement plus regression fixture, until AoA clean-room converts, builds, launches, runs, verifies, and packages flawlessly through the normal Enderloom toolchain without manual source surgery.**

This is an implementation task, not a planning task. Do not replace execution with another roadmap, summary, speculative redesign, reduced MVP, or new handoff. Do not stop after making this document prettier. The first useful action after resolving the current canonical repo/checkpoint is to continue the earliest unfinished implementation step that advances the accepted AoA conversion.

## Identity lock — the finished mod keeps the original AoA identity

The produced mod is **not a rebrand, fork-brand, rescue-brand, or conversion-brand**. Preserve the original mod's authoritative identity exactly wherever that identity is runtime- or user-visible. Resolve the exact values from the strongest source metadata/lineage available and carry them through the target build.

Mandatory identity preservation includes, as applicable:

- original `modId` / namespace and registry namespace;
- original display name from authoritative source metadata;
- original package/resource/data namespaces unless a target-native compatibility requirement proves a narrowly scoped adapter is necessary;
- original registry IDs, save/data identifiers, config ownership, network identifiers, advancement/recipe/tag/resource namespaces, and world compatibility identifiers;
- original version lineage semantics, with target/version qualifiers added only where the ecosystem requires them and without changing the mod's identity;
- deterministic artifact names derived from the original mod identity and version, never from an internal conversion codename;
- in-game Mods screen, logs, receipts, release labels, metadata, generated configs, crash reports, and user-facing UI must identify the mod as the original mod, not as a renamed derivative.

Internal historical checkpoint labels may remain only where needed to locate old state, but they must never leak into the final mod, runtime metadata, package namespace, artifact name, or user-facing output. New work should refer to the proving workload as **Advent of Ascension (AoA)**.

If historical branches disagree on identity metadata, do not guess. Use the selected authoritative source lineage plus compatibility evidence to determine the correct identity for the preserved target, record the evidence in the conversion receipt, and keep serialization/registry compatibility intact.

## Execute-only scope discipline

Codex must work this contract and the existing accepted Enderloom/AoA state only. It may make any implementation, tooling, test, fixture, performance, build-system, or architecture change required to complete the contract, but must not divert into unrelated features or cosmetic refactors that do not advance a gate below.

Execution rules:

1. Reuse the current repository, branch/worktree, checkpoints, known-good caches, prior test evidence, and existing AoA partial conversion. Do not restart solved discovery.
2. Resolve only the minimum delta needed to know the exact next unfinished action, then mutate -> targeted test -> checkpoint.
3. Never ask the user to manually perform source edits, dependency hunting, Gradle surgery, mapping repair, registry cleanup, content triage, or repetitive recovery that Enderloom/Dev Kit can learn to do itself.
4. A temporary manual edit may be used only as a diagnostic experiment to isolate root cause. It is **not** accepted work. Convert the diagnosis into a reusable engine/toolchain fix, add a regression fixture, restore/replay from the clean pre-edit state, and prove the normal workflow succeeds.
5. Do not mark a task complete because compilation succeeds. The relevant real runtime and content/registration evidence must pass.
6. Do not remove, disable, blacklist, stub, omit, downgrade, or rename content to make progress appear green.
7. Do not stop on a blocker that can be solved by repairing the environment, dependency resolver, mapping layer, converter, build lane, runtime harness, cache, or toolchain. Change strategy and continue.
8. Preserve every verified improvement in the normal Enderloom/Minecraft Dev Kit path so the next mod benefits automatically.

## Failure + slowdown -> reusable capability ratchet

Every nontrivial failure, slowdown, or manual workaround encountered while finishing AoA must produce reusable engineering value before the affected gate may close. For each incident:

1. fingerprint the failing input/state and preserve the exact causal evidence;
2. identify the earliest causal owner rather than patching cascaded symptoms;
3. implement the fix in the **shared Enderloom/Minecraft Dev Kit capability layer** whenever the cause is reusable;
4. add a deterministic regression fixture that would fail before the fix and pass after it;
5. integrate that fixture into the appropriate normal test/self-test/conversion corpus;
6. if performance is involved, measure equivalent work before/after and require a real improvement with identical content/fidelity/results;
7. invalidate only the affected checkpoint/cells, not unrelated green work;
8. replay the previously failing normal workflow from a clean checkpoint;
9. record the verified recovery recipe/adapter so recurrence is automatic or dramatically cheaper;
10. continue the original AoA conversion immediately after the shared fix is proven.

A repeated manual workaround is evidence that the product/toolchain is missing a capability. The completion condition is not "the workaround worked"; it is "the normal toolchain learned to do it correctly and the regression corpus prevents recurrence."

## Clean-room autonomy gate

AoA graduation requires a clean-room replay from the preserved pre-manual-fix checkpoint or another equivalently clean authoritative source state. The accepted replay must run through ordinary Enderloom Create/Convert/service/CLI actions and must:

- inspect and inventory the real source;
- resolve mappings, dependencies, toolchains, and adapters;
- preserve full content and registrations;
- generate/mutate target source and resources;
- build/datagen/package;
- diagnose and recover from expected conversion classes through the shared engine;
- pass static exactness gates;
- launch the strongest applicable real Minecraft runtime;
- verify representative content/behavior plus required parity ledgers;
- produce the correctly named original-identity artifact, hashes, logs, evidence, and receipt;
- require **zero manual source surgery** between normal product actions.

If the clean-room replay still requires a human source edit, the graduation gate remains open and the missing capability must be implemented in Enderloom/Dev Kit.

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
11. improve Enderloom itself whenever the Advent of Ascension (AoA) graduation exposes a reusable weakness.

**Implementation crossing:** once the current Enderloom repo and Create/Convert execution path are resolved, make the smallest coherent backend mutation, run targeted tests, checkpoint, and continue. Do not spend repeated waves re-documenting this handoff.

**Machine-readable companion:** `ENDERLOOM_CONVERSION_ENGINE_CONTRACT.json` mirrors the mandatory stage/gate ordering so UI, CLI, service and CI can consume one canonical contract instead of re-encoding acceptance rules independently.

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

For Minecraft 26.3, the current hardened Dev Kit v5 surfaces are:

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

## 6.1 Vanilla feature dependency closure

When a mod references a vanilla feature absent in an older target, never stub/delete the identifier or quietly remove the dependent content. Record the exact cross-version dependency closure, finish and certify the mod-owned base first, then offer an explicit compatibility/backport provider when realistic. Keep optional future-vanilla parity default OFF until selected and prove provider-present/provider-absent/fallback/removal behavior separately. An optional backport may never hide an incomplete base conversion.

## 6.2 Dependency substitute intelligence

For every exact matrix cell, resolve dependency coordinates, compatible version, loader availability, Minecraft range, Java/runtime constraints and transitive requirements. If the exact dependency is unavailable, search in this order: renamed/restructured artifact from the same project, official loader-native sibling, semantically equivalent API with proven required behavior, internal compatibility adapter/backport, or a truthful **Blocked** cell. Never substitute a dependency merely because its name sounds similar.

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

The v5 index contract includes:

- exact source SHA-256 identity;
- Java runtime used for Multi-Release selection;
- class major/access flags;
- superclass/interfaces;
- Java nest-host metadata used for private-access legality;
- fields/methods + exact descriptors;
- selected Multi-Release class variant;
- recognized nested JARs;
- duplicate-owner evidence;
- parse failures;
- class/member references when requested;
- actual bytecode field/method instruction references;
- LambdaMetafactory/invokedynamic linkage;
- constructor resolution that is exact to the named owner and never inherited.

Strict 26.3 release must reject:

- stale pre-v4 index schema or any later schema missing the current exact-linkage fields;
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

For final packaged proof, Enderloom must also model the **effect** of the shipped access rule instead of only proving that the target exists. Valid packaged rules can intentionally change legality:

- accessible/public/protected widening can satisfy access proof;
- mutable / `-f` field rules can satisfy a final-field write that would otherwise fail;
- extendable / final-removal class rules can satisfy subclass proof.

The exact bytes packaged in the final JAR must be re-resolved. A source-tree AT/AW/ClassTweaker that was valid earlier does not excuse a stale or broken rule shipped in the artifact.

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
- constructors resolve on the exact named owner and are never inherited;
- descriptor object types exist;
- actual JVM opcode matches target static/instance mode;
- `invokeinterface`/`invokevirtual` and constant-pool Methodref/InterfaceMethodref kind match interface/class ownership;
- LambdaMetafactory SAM owner/name/descriptor resolves;
- invokedynamic implementation **method-handle reference kind** matches the target static/instance/interface mode;
- class and member access remain legal after public/private/protected/package drift, including Java nest-host private access where indexed;
- writes to fields that became `final` are legal or a packaged access rule removes `final`;
- candidate classes do not extend runtime classes that became `final` unless a packaged rule legitimately makes them extendable;
- candidate superclass/interface declarations did not drift class <-> interface;
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
- `META-INF/services/*` provider classes;
- the exact packaged AT/AW/ClassTweaker declarations themselves, resolved against the combined target/dependency/candidate symbol universe.

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

# 23. Advent of Ascension (AoA) — Enderloom graduation, not a one-off manual port

Advent of Ascension (AoA) is the final proving workload because it exercises historical source archaeology, huge content parity, loader/version API evolution, worldgen/data, entities, assets, compatibility and long-lived behavior.

The purpose is **not** merely to finish AoA once. The purpose is to improve Enderloom until Enderloom can finish AoA through its normal conversion workflow.

## 23.0 Original-identity preservation gate

AoA must ship as the original mod identity recovered from authoritative source metadata. The conversion may modernize implementation, loader wiring, mappings, build logic, APIs, data schemas, compatibility adapters, and packaging mechanics, but it must not invent a new user-facing mod identity.

Before the first verified artifact is promoted, automatically compare source vs packaged identity for at least:

- mod ID / namespace;
- display name;
- version lineage;
- registry/resource/data namespaces;
- config/save ownership identifiers;
- entrypoint metadata;
- artifact basename policy;
- any loader-specific metadata that can accidentally expose an internal conversion codename.

Any unexplained identity drift is a blocking parity failure.

## 23.1 Source authority

Use the strongest legitimate AoA historical lineage available, including the official historical branches spanning approximately Minecraft 1.7.10 through 1.21 and the supplied AoA3 3.6.11 plus Nevermine/AoA2 archaeology sources where applicable.

Build the strongest legitimate semantic union from historical lineage instead of accepting content removed by an incomplete later port as proof that it never existed.

## 23.2 First successful master conversion

Finish the current Advent of Ascension (AoA) semantic conversion to the preserved primary target first. This successful target becomes the behavioral/content reference for fan-out, not a reason to discard historical evidence.

Enderloom should automatically choose the next coherent conversion batch from dependency and parity graphs rather than requiring a person to manually select mob families or feature groups.

## 23.3 Clean-room graduation replay

After the first full success:

1. preserve a checkpoint from the unfinished AoA state **before** Enderloom-specific manual fixes;
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

The current Minecraft 26.3 Dev Kit v5 already includes regression proof for:

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
- constructor removed from the exact owner while the superclass still has the descriptor;
- public -> private access drift that would become `IllegalAccessError`;
- valid packaged AT widening that repairs that access;
- stale/broken access rule shipped in the final artifact;
- field becoming final and illegal external write detection;
- mutable ClassTweaker/AT final removal;
- superclass becoming final and illegal subclass detection;
- extendable ClassTweaker/AT final removal;
- Lambda/MethodHandle implementation static -> instance drift;
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

- [ ] **T001** · Create Mod and Convert Mod use the same conversion/matrix service.
- [ ] **T002** · One Conversion IR is created and reused across cells.
- [ ] **T003** · Source authority/hash/lineage are preserved.
- [ ] **T004** · Historical mapping owner/name/**descriptor** translation is data-driven.
- [ ] **T005** · Semantic API migration planner produces actionable replacements/adapters rather than only missing-symbol errors.
- [ ] **T006** · Reusable migration fixes persist in an Adapter Catalog with tests.
- [ ] **T007** · No silent content or behavior removal is allowed.

### Exact proof

- [ ] **T008** · Exact target class index is content-identified and runtime-selected.
- [ ] **T009** · Mixins/MixinExtras/overwrites resolve structurally.
- [ ] **T010** · Access rules require the true declaring owner.
- [ ] **T011** · Literal reflection/MethodHandle surfaces are exact-audited.
- [ ] **T012** · Compiled-source Minecraft API references can be migration-bridged.
- [ ] **T013** · Final packaged bytecode checks actual JVM invocation mode and constant-pool kind.
- [ ] **T014** · Constructors are owner-exact and never accepted through inheritance.
- [ ] **T015** · Packaged access legality is checked after applying exact shipped AT/AW/ClassTweaker effects.
- [ ] **T016** · Final-field writes and final-superclass inheritance are validated.
- [ ] **T017** · Class/interface hierarchy drift is validated.
- [ ] **T018** · invokedynamic/LambdaMetafactory SAMs and implementation MethodHandle kinds are exact-audited.
- [ ] **T019** · Multi-Release/nested JAR selection is target-runtime aware.
- [ ] **T020** · Package entrypoints/Mixins/access wideners/nested JARs/services are checked.
- [ ] **T021** · Content and code-registration parity are independently proven.

### Northpoint matrix

- [ ] **T022** · Requested primary target builds and verifies before secondary cells.
- [ ] **T023** · `ask`, `target-only`, project-all and global-all behavior works.
- [ ] **T024** · Headless flow never waits for UI input.
- [ ] **T025** · Matrix support comes from one data-driven registry.
- [ ] **T026** · Shared + loader + version + exact-cell overlay model is used.
- [ ] **T027** · Per-cell dependencies/toolchains are resolved before build.
- [ ] **T028** · Unsupported/blocked/failed remain distinct.
- [ ] **T029** · Fingerprints skip unchanged passed cells.
- [ ] **T030** · Invalidations affect only dependent cells.
- [ ] **T031** · Interrupted runs resume.
- [ ] **T032** · Failed-only retry does not rebuild green cells.
- [ ] **T033** · Secondary failure cannot destroy the primary artifact.
- [ ] **T034** · Secondary cells use safe adaptive parallelism.

### Runtime and artifacts

- [ ] **T035** · Strongest required runtime lane is selected automatically.
- [ ] **T036** · `Built - runtime unverified` cannot become `Passed`.
- [ ] **T037** · Server/client/integrated/restart evidence is persisted when applicable.
- [ ] **T038** · Artifacts use deterministic names and SHA-256.
- [ ] **T039** · Conversion receipt exactly matches artifacts/evidence on disk.
- [ ] **T040** · UI status comes from backend evidence, not guessed process state.

### App quality

- [ ] **T041** · No fake/dead conversion controls exist.
- [ ] **T042** · Existing launcher/catalog behavior is not regressed.
- [ ] **T043** · Renderer performs no privileged build/file execution directly.
- [ ] **T044** · A fresh usable Enderloom build/package is produced.
- [ ] **T045** · Real native Electron Create/Convert -> primary -> matrix -> results workflow is exercised end-to-end.

### Graduation

- [ ] **T046** · Advent of Ascension (AoA) completes once with full zero-loss evidence and exact original mod identity.
- [ ] **T047** · Enderloom then completes the preserved unfinished AoA checkpoint in a clean-room replay without manual source surgery.
- [ ] **T048** · Reusable failures discovered during replay become engine fixes + regression fixtures.
- [ ] **T049** · Verified AoA semantic master fans out to all requested valid supported version/loader cells.
- [ ] **T050** · Final AoA matrix report and artifacts are reproducible and truthful.

---

# 28. Exact next implementation action

Resume inside the canonical Enderloom repository at the existing Create/Convert backend boundary. **Do not create a replacement plan before executing.** Use the current repository/checkpoint as the delta watermark and continue the first unfinished dependency-satisfied action.

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
-> final v5 package linkage (constructor/access/finality/hierarchy/method-handle included)
-> strongest runtime lane
-> verified primary artifact
```

4. Add a deterministic integration fixture that intentionally fails staticness/interface/reflection/access-owner/constructor/finality linkage and proves Enderloom surfaces the causal blocker rather than generic build failure.
5. Once the primary path is green, connect Northpoint fan-out to the same session/IR and cell fingerprint model.
6. Run the Enderloom app regression suite and native Electron E2E.
7. Begin/continue Advent of Ascension (AoA) through this path. Any generic failure, slowdown, or manual workaround becomes an Enderloom/Dev Kit improvement plus regression fixture before proceeding.
8. Before promoting the first artifact, prove source-vs-package identity parity and verify the final mod exposes the original authoritative name/IDs with no internal conversion codename leakage.
9. After the first full success, replay from the preserved clean checkpoint and require the **normal Enderloom toolchain** to reproduce the verified result with zero manual source surgery. Keep iterating shared engine fixes + regression fixtures until it does.
10. Package the final verified AoA artifact, source/evidence/receipts, and fresh Enderloom build only after the clean-room replay and runtime gates pass.

**Do not stop at the handoff. Implement until the real workflow works.**

---

# 29. Final Codex completion gate

- [ ] **G001 · FINAL COMPLETION GATE** — Every applicable `T001`-`T050` item is proven; Advent of Ascension (AoA) retains the exact authoritative original mod identity; the primary target clean-room converts/builds/packages; the strongest applicable real Minecraft runtime loads and verifies the fresh artifact; zero unexplained content/registration loss remains; every reusable failure/slowdown/manual workaround encountered in this execution became an Enderloom/Minecraft Dev Kit improvement plus regression fixture; the clean replay requires zero manual source surgery; artifacts/receipts/hashes match; and no accepted blocker remains unresolved.

Until `G001` is true, continue implementation from the earliest dependency-satisfied open item. Do not return a completion claim, substitute a plan, or reduce scope.
