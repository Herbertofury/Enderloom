# Enderloom — Next-Generation App + Conversion Stack Full Implementation Contract

**Status:** EXECUTE NOW / IMPLEMENTATION-READY  
**Date:** 2026-09-26  
**Research basis:** `ENDERLOOM_NEXT_GEN_TECH_STACK_CHALLENGERS.md`, current Enderloom/Minecraft Dev Kit evidence, and consolidated upstream verification  
**Repository:** `Herbertofury/Enderloom`  
**Primary objective:** implement the researched conversion stack and the remaining highest-value app-wide performance improvements as one production Enderloom architecture: native/Rust hot paths where they materially win, a best-fit frontend chosen by measured results rather than language purity, semantic JVM migration tooling, instant browse/search, resilient downloads/dependency resolution, sandboxed extensions, exact artifact/runtime proof, and reusable learned fixes.

---

## Objective

Implement the complete next-generation Enderloom application and Minecraft conversion stack now. The finished product must convert real mods across Minecraft versions and loaders using a deterministic, resumable, evidence-backed pipeline that understands mapping eras, loader semantics, source and bytecode structure, metadata, dependencies, Mixins/access rules, data/resources/datagen, build systems, and real client/server runtime behavior.

This is **not** another research task and **not** a planning-only task. Research from the challenger/scout documents is accepted input. Implementation begins immediately from the existing repository and current Northpoint/Minecraft Dev Kit behavior.

The end state is a production engine that gets better after every difficult conversion without accumulating unverified regex patches or one-off manual surgery.

---

## Context: existing repository truth to preserve and migrate

The repository already contains meaningful conversion work. Do not restart it or replace it with a greenfield demo.

Known existing implementation/reference state includes:

- `docs/northpoint/ENDERLOOM_CONVERSION_ENGINE_CONTRACT.json`
  - source authority;
  - UMIR/parity inventory;
  - mapping lineage;
  - semantic plan;
  - dependency lock;
  - target generation;
  - Mixin/access/reflection/content/registration gates;
  - packaged-linkage validation;
  - runtime proof;
  - SHA-256 receipts;
  - resumable cell states.
- `docs/northpoint/ENDERLOOM_APEX_CONVERSION_V6_CHECKPOINT.md`
  - resumable job runner already proven on fixture cells;
  - unchanged-resume reuse already proven;
  - source-change invalidation already proven;
  - semantic migration/linkage/access tests already proven;
  - exact next historical action was to wire the real resumable worker into the product.
- `docs/northpoint/minecraft-version-profiles.json`
  - explicit Java/mapping-model/loader profiles already exist;
  - 1.20.1 Java 17, 1.21.1 Java 21, 26.3 Java 25 are represented;
  - 26.x is already recognized as `official-unobfuscated`.
- `tools/minecraft-dev-kit/scripts/`
  - source intake;
  - mapping lineage/bridge;
  - semantic planner;
  - content/registration inventory and parity;
  - Mixin/access/reflection resolvers;
  - packaged-linkage auditing;
  - resumable Northpoint runner;
  - target 26.3 conversion logic;
  - runtime and graduation fixtures.
- Legacy product wiring exists in `.js` Northpoint files. Treat it as real behavior to preserve and as a migration/reference baseline. Retain JS/TS where it remains the strongest fit; replace it only when a measured native/JVM implementation improves performance, correctness, resilience, maintainability or security without feature loss.
- The repository already has a native Rust/Tauri core under `native/` with CLI, commands, state, storage, downloads, loaders, Java, launch, server, snapshots, tasks, update and runtime capabilities.

The existing toolkit is valuable evidence. Preserve its proven behavior and fixtures while replacing weak implementation techniques. Move performance-sensitive or reliability-critical work out of JavaScript only when the replacement is demonstrably better; do not rewrite working JS/TS solely for language purity.

---

## Constraints — non-negotiable

1. **Technology choice is evidence-driven, not language-driven.**
   - JavaScript/TypeScript/React are allowed wherever they remain the best combination of responsiveness, product quality, iteration speed and maintainability.
   - Do **not** rewrite working JS/TS merely to claim a native stack. A migration must beat the current path on a production-shaped workload or materially improve correctness, resilience, security or maintainability without regressing user-visible behavior.
   - Push CPU-heavy, I/O-heavy, latency-sensitive, memory-sensitive, high-concurrency or integrity-critical work into Rust/native/JVM layers when profiling shows a meaningful advantage.
   - Keep the frontend thin: presentation and interaction may live in React/TypeScript or another proven UI layer, while canonical domain actions/state remain behind typed service contracts. Avoid duplicating the same business rule independently in UI and native code.
   - Third-party/web content JavaScript remains isolated from trusted application authority.

2. **Production ownership is workload-first with a strong native core.**
   - Rust should own the native hot paths where it is strongest: durable jobs/state, hashing, CAS/cache integration, process control, sandbox control, filesystem work, high-throughput concurrency, runtime launch/proof, receipts, indexing/search backends and integrity-sensitive operations.
   - The authored UI may remain React/TypeScript/Vite under Tauri if it meets the latency, memory, accessibility and maintainability gates. Rust-authored UI frameworks are challengers, not mandatory destinations.
   - UI surfaces call the same typed domain actions used by CLI/automation rather than reimplementing domain truth.
   - JVM tooling owns operations where Java/Kotlin compiler/type-system integration materially improves correctness: OpenRewrite/JDT/Spoon, Mapping-IO/Tiny Remapper, Gradle Tooling API, Maven Resolver, modern classfile/decompiler tooling and loader-native Java integrations.
   - Python Dev Kit code may remain as a verified migration oracle/fixture source until a replacement capability has equal or stronger proof. Do not create two independent authoritative engines for the same operation.

3. **No content-loss success.**
   - Silent removal of classes, registrations, items, blocks, entities, recipes, loot, tags, worldgen, resources, data, configs, networking, Mixins, access rules, datagen or metadata is forbidden.
   - If a concept cannot yet be converted safely, keep the conversion incomplete and report the exact unresolved semantic item.

4. **Compilation is not completion.**
   - Final artifacts must pass packaged-linkage and target-loader runtime gates.
   - Client/server/integrated-server/restart-persistence proof is required where applicable.

5. **No brittle source rewriting as authority.**
   - Regex/text replacement is allowed only for syntax-independent, provably uniform substitutions guarded by positive and negative fixtures.
   - Type/member/overload/inheritance/descriptor-sensitive changes must use semantic/symbol evidence.

6. **Era-aware conversion is mandatory.**
   - Pre-26.1 mapped/obfuscated workflows and 26.1+ unobfuscated workflows are separate pipeline modes.
   - Do not remap an already-unobfuscated 26.x target just because an old remapper exists.

7. **One canonical model per concept.**
   - One version/loader graph.
   - One learned-rule store.
   - One manifest/dependency/access IR family.
   - One job/session state owner.
   - One evidence/receipt model.
   - Compatibility tools feed evidence into these models; they do not become parallel truth stores.

8. **Failures improve the engine.**
   - Every nontrivial generalized fix must become a reusable rule plus positive fixture, negative control and runtime/build regression evidence.
   - Manual source surgery on a target fixture remains an engine defect until generalized or explicitly proven project-specific.

9. **Performance and completeness improve together.**
   - Incremental/resumable execution, cache hits, bounded parallelism and fast indexing are required.
   - Never claim speed by skipping validation or reducing conversion scope.

10. **Untrusted projects are hostile until proven otherwise.**
    - Imported Gradle/Maven/build logic can execute arbitrary code.
    - Do not run unknown project build scripts unrestricted on the host by default.
    - Sandboxing and dependency/provenance controls are part of the production conversion engine, not optional future hardening.

---

## Done when

This contract is complete only when all accepted gates below are satisfied and the production Enderloom path can:

1. intake a real source mod or authorized compiled artifact;
2. fingerprint and preserve immutable source authority;
3. detect loader, Minecraft version, language mix, mapping era and runtime requirements;
4. normalize mappings/symbols without destroying provenance;
5. build a typed project IR;
6. plan semantic migrations from verified knowledge;
7. apply Java/Kotlin/metadata/access/data/resource changes through the correct engines;
8. generate a target-native Gradle workspace;
9. resolve dependencies reproducibly;
10. compile and classify remaining failures;
11. validate exact packaged linkage and archive semantics;
12. launch the exact built artifact on applicable target runtimes;
13. compare content/data/resource behavior against source expectations;
14. produce a signed/hashable conversion receipt and resumable checkpoint;
15. replay the same conversion clean-room without hand edits;
16. run the active AoA conversion through the normal production path;
17. converge conversion execution onto the single best production path after parity/performance proof, retiring redundant JS/native/Python authority rather than removing a language by policy;
18. retain every reusable fix as permanent regression-protected knowledge;
19. run the Enderloom UI on the frontend architecture that wins the production-shaped bakeoff; React/TypeScript may remain when it meets or beats alternatives, with canonical domain truth kept behind typed service boundaries;
20. provide instant, complete Browse/search/filter behavior over large catalogs without reducing provider/result coverage;
21. reconcile the same project across providers using stable identity evidence rather than names alone;
22. resolve/install/update mod dependencies through one canonical solver with useful conflict explanations;
23. resume long downloads/install/conversion/index jobs safely after process/app restart;
24. enforce least-privilege Tauri CSP/capabilities and isolated browser/WebView trust boundaries;
25. verify signed updater artifacts, interruption recovery and downgrade/rollback policy;
26. prove caches/CAS/archive/filesystem/network/media accelerations preserve exact results;
27. sandbox adopted extension/provider adapters behind explicit capabilities and versioned contracts;
28. produce redacted diagnostics/crash evidence with stable operation IDs;
29. pass Rust/JVM/vendored supply-chain and SBOM/provenance gates;
30. install/package/launch the whole app from a clean environment and exercise the T283 production workflow.
31. diagnose and repair representative broken mod source/projects, packaged JARs and modpack/instance failures through one production repair path with rollback and runtime proof;
32. create a representative mod through the normal Enderloom authoring path from scaffold -> content/code/data -> build -> automated tests -> native runtime -> package;
33. finish AoA through the production conversion path **before** broad app modernization work begins, except for infrastructure strictly required to make conversion/repair/authoring/AoA work;
34. promote every generalized AoA fix into shared conversion/repair/authoring knowledge and regression fixtures before continuing into the rest of the app roadmap.

---

# Execution contract

- Read this document once, then execute from the earliest unchecked task whose dependencies are satisfied.
- Do not repeat broad ecosystem research unless a named implementation gap, upstream invalidation, or measured regression makes it necessary. New useful findings are folded directly into the relevant implementation requirement rather than tracked as separate research passes.
- Work in bounded internal execution windows of one coherent subsection or roughly 6–12 ready leaf tasks; checkpoint code and inline proof, then continue automatically.
- Reuse existing proven Northpoint/Dev Kit fixtures instead of rediscovering behavior.
- After two materially unchanged failures, change strategy or fix the missing capability. Do not loop the same failure.
- A blocked task stays unchecked with `BLOCKED:` and `NEXT:` notes. Continue independent work.
- A later change that invalidates previous proof reopens the affected task/gate.
- Prefer depth-first vertical proof: shared model -> one real conversion cell -> packaged JAR -> native runtime -> then broaden the matrix.
- Do not stop after writing new architecture or scaffolding. Cross the implementation boundary and exercise production paths.

---

# Architecture decision — production end state

```text
ENDERLOOM UI / CLI / agent surface (best-fit frontend)
            |
            v
NATIVE DOMAIN + RUNTIME CORE (Rust where it materially wins)
  - typed commands/channels + operation IDs
  - catalog/search/cross-provider identity
  - dependency solver + install/update actions
  - durable task graph / resumability
  - provider/network/download policy
  - cache/CAS + file/archive/media services
  - Tauri security/capabilities/updater
  - sandbox + extension host
  - conversion session/job state
  - source authority + hashes
  - artifact/progress/event model
  - Minecraft runtime launch/proof
  - diagnostics / receipts / provenance
            |
            +----------------------+
            |                      |
            v                      v
JVM SEMANTIC WORKER          RUST/NATIVE IO & ARTIFACT LANE
  - OpenRewrite             - file/archive inventory
  - Eclipse JDT             - hashing/CAS
  - Spoon/GumTree           - fast copy/diff
  - RefactoringMiner        - process/sandbox control
  - Mapping-IO              - local index/invalidation
  - Tiny Remapper           - archive integrity
  - ART/SrgUtils            - runtime staging
  - Gradle Tooling API
  - Maven Resolver
  - JDK Class-File API
  - ASM comparator
  - Vineflower/CFR
            |
            v
CANONICAL IR + KNOWLEDGE
  - VersionGraph
  - ProjectIR / BuildIR
  - ModManifestIR
  - EmbeddedDependencyIR
  - AccessMutationIR
  - MixinIR
  - Content/Resource IR
  - SemanticRule store
  - Evidence / provenance
            |
            v
TARGET WORKSPACE + BUILD
  - Fabric Loom / NeoForge ModDevGradle / ForgeGradle
  - optional Stonecutter/Stonecraft rendering
  - locked/verified dependencies
  - Configuration Cache when supported
            |
            v
PACKAGE AUDIT -> NATIVE RUNTIME PROOF -> CONVERSION RECEIPT -> LEARNED FIX
```

**Language is not the acceptance criterion for this data path.** The authoritative path must be singular, fast, resumable and evidence-backed. Retain JS/TS components only where they are the best fit and do not duplicate canonical state/business rules; move hot or integrity-critical stages to Rust/JVM when measured evidence supports it.

---

# G040 — Repository preflight and authority freeze

- [ ] **G040 · GATE** — The implementation has an authoritative baseline, existing paths are classified by ownership/performance, and the first optimized vertical slice can be developed without creating a third competing engine.

### T134 — Resolve authoritative worktree and dirty-state boundaries

- [ ] **T134** — Confirm the active Enderloom worktree/branch, current revision, uncommitted changes and the exact Minecraft Dev Kit source used by production.

Record once in the implementation checkpoint:

- repo root;
- branch/commit;
- native build/test commands;
- JVM worker build command once created;
- Minecraft Dev Kit path/revision;
- Java 17/21/25 availability;
- Gradle versions actually resolved by accepted targets;
- current AoA fixture/source identity.

Do not repeatedly rediscover these until a write or external version refresh invalidates them.

### T135 — Classify Northpoint JS by authority and hot-path value

- [ ] **T135** — Inventory the existing Northpoint JS execution path and classify each responsibility as **retain**, **thin adapter**, **move to Rust/JVM**, or **retire after parity** based on measured performance, correctness, resilience and maintenance value.

Required:

- inventory public conversion commands/events/session fields exposed by existing JS;
- capture current QA behavior as parity fixtures;
- forbid duplicate independent state/business-rule ownership across JS and native/JVM layers;
- allow new JS/TS work only when it is genuinely the best-fit layer and does not recreate a native hot path;
- maintain a convergence checklist so superseded code is retired after its replacement proves better.

### T136 — Snapshot existing Dev Kit evidence

- [ ] **T136** — Record exact hashes/revisions of the current mapping, semantic, linkage, runtime and target-26.3 scripts that are used as migration oracles.

At minimum preserve evidence from:

- `northpoint_job_runner.py`;
- `northpoint_production_driver.py`;
- `northpoint_source_intake.py`;
- `mapping_lineage.py` / `mapping_bridge.py`;
- `port_semantic_planner.py`;
- `mixin_target_resolver.py` / `mixin_surface_audit.py`;
- `access_rule_resolver.py`;
- `reflection_surface_resolver.py`;
- `packaged_linkage_audit.py`;
- content/registration parity scripts;
- target 26.3 converter and its selftests.

### T137 — Establish baseline fixture results

- [ ] **T137** — Run only the decisive existing Northpoint/Dev Kit QA needed to establish baseline behavior before migration.

Baseline must include:

- resumable job reuse;
- primary-cell fanout lock;
- semantic migration failure detection;
- packaged-linkage failure detection;
- native client/server runtime proof;
- source-change invalidation.

Persist concise results and hashes; do not paste giant logs into this spec.

---

# G041 — Native Rust conversion service replaces JS orchestration

- [ ] **G041 · GATE** — Product conversion orchestration is owned by the native Rust service/CLI/command layer with equal or stronger behavior than the legacy JS path.

### T138 — Define native conversion domain types

- [ ] **T138** — Implement Rust types/schemas for:

- `ConversionSession`;
- `ConversionCell`;
- `CellState`;
- `ConversionPlan`;
- `SourceAuthority`;
- `InputFingerprint`;
- `ArtifactIdentity`;
- `EvidenceRef`;
- `RuntimeProof`;
- `ConversionReceipt`;
- `FailureClass`;
- `Blocker`;
- version/loader/language/era identity.

The existing Northpoint contract is the compatibility baseline; improve type safety without dropping fields or semantics.

### T139 — Implement durable native session state

- [ ] **T139** — Persist sessions atomically in the native state/storage layer.

Requirements:

- atomic writes;
- schema versioning/migration;
- crash-safe resume;
- stale fingerprint invalidation;
- immutable artifact SHA-256 identity;
- no state transition that can silently turn failed/runtime-unverified into passed.

### T140 — Implement native conversion commands

- [ ] **T140** — Expose the conversion lifecycle through native CLI/command APIs, not JS:

- capabilities;
- inspect source;
- resolve/refresh target version;
- plan;
- create/get/list session;
- execute/resume/cancel;
- inspect cell/evidence;
- runtime-verify;
- export receipt.

Add stable machine-readable output/status codes for agent/Codex automation.

### T141 — Port primary-target-first scheduling

- [ ] **T141** — Preserve primary-target-first semantics in Rust:

- secondary fanout remains locked until primary passes all required gates;
- fanout can execute independent cells concurrently after unlock;
- failed primary never unlocks secondaries;
- runtime-unverified is not passed;
- cancelled/stale cells resume correctly.

### T142 — Implement native progress/event stream

- [ ] **T142** — Emit stable structured events for stage, cell, task, progress, cache reuse, blocker, runtime and receipt changes.

No fake percentage. Prefer stage/unit counts and known work totals.

### T143 — Native parity challenge against legacy JS

- [ ] **T143** — Run the same session fixtures through legacy JS and native Rust and reconcile all meaningful behavior.

Native must be equal or stronger for:

- state transitions;
- input invalidation;
- resume/reuse;
- error reporting;
- runtime promotion;
- artifact identity;
- fanout locking;
- progress/event truthfulness.

Only after parity is proven may the JS conversion command path be disconnected.

---

# G042 — Canonical conversion IR family

- [ ] **G042 · GATE** — Enderloom owns typed, loss-aware intermediate representations so no tool-specific format becomes canonical product state.

### T144 — Implement `ProjectIR`

- [ ] **T144** — Build a canonical project model covering:

- languages/source sets;
- Gradle/Maven structure;
- loader/version declarations;
- Java/toolchain requirements;
- repositories/dependencies;
- resources/data/datagen;
- generated sources;
- metadata files;
- Mixins;
- access mutations;
- nested dependencies;
- test/run configurations;
- arbitrary preserved unknown fields/files with provenance.

### T145 — Implement `ModManifestIR`

- [ ] **T145** — Losslessly normalize Fabric, Forge, NeoForge and supported Quilt metadata.

Preserve:

- IDs/aliases/provides;
- version/name/license/authors;
- entrypoints/main classes;
- required/optional/incompatible dependencies and ranges;
- environment/sidedness;
- Mixins;
- AW/Class Tweaker/AT declarations;
- language adapters;
- nested/Jar-in-Jar metadata;
- ordering/transformer/services concepts;
- unknown custom metadata.

### T146 — Implement `EmbeddedDependencyIR`

- [ ] **T146** — Normalize nested JAR/JarJar semantics without pretending loaders resolve them identically.

Track artifact identity, path, declared/preferred/range versions, optionality, transitivity, visibility, Maven coordinates, checksum and provenance.

### T147 — Implement `AccessMutationIR`

- [ ] **T147** — Represent:

- visibility widening;
- final removal/change;
- transitive access;
- interface injection;
- namespace;
- exact owner/member/descriptor;
- development-only vs runtime-required behavior.

Do not flatten interface injection into an AT when runtime behavior still needs Mixin/coremod logic.

### T148 — Implement `MixinIR`

- [ ] **T148** — Parse and preserve exact Mixin semantics:

- target owner;
- injector type;
- method/member selector;
- JVM descriptor;
- ordinal;
- slice;
- locals/capture;
- remap flag;
- required/expect/allow;
- MixinExtras constructs;
- refmap/config metadata.

### T149 — Implement `ContentIR` / parity manifest

- [ ] **T149** — Produce a source-side capability/content manifest covering the registrations/resources/data categories required by T073/T103/T108 in the research companion.

This becomes the expected behavior inventory used by target/runtime proof.

### T150 — IR round-trip tests

- [ ] **T150** — Prove source-format parse -> IR -> same-format emission retains semantics and preserves unknown fields where representable.

Unrepresentable concepts must become explicit compatibility notes/blockers, never silent deletion.

---

# G043 — Version, loader and mapping-era graph

- [ ] **G043 · GATE** — Every conversion uses a version/loader/era graph that chooses the correct mapping and migration pipeline.

### T151 — Implement `VersionGraph`

- [ ] **T151** — Represent version nodes and migration edges with:

- Minecraft version;
- Java version;
- loader + loader version;
- mapping era;
- naming namespaces;
- pack/data/resource changes;
- API migration facts;
- toolchain versions;
- provenance/hash/date;
- fixture status.

### T152 — Encode pre-26.1 vs 26.1+ pipeline split

- [ ] **T152** — Enforce explicit modes:

`mapped/obfuscated <= 1.21.11` and `official-unobfuscated >= 26.1`.

A 1.21.11 -> 26.1 crossing is a named transition, not a generic adjacent bump.

### T153 — Ingest official migration corpora

- [ ] **T153** — Convert current Fabric/NeoForge/Minecraft migration material into provenance-bearing machine-readable edges rather than regex snippets.

At implementation time refresh exact current upstream revisions before ingest.

### T154 — Mapping namespace graph

- [ ] **T154** — Support simultaneous identities such as:

`official <-> intermediary <-> yarn/parchment <-> srg/tsrg <-> mod-source`.

Do not flatten into one name too early.

### T155 — Mapping engine bakeoff and composition

- [ ] **T155** — Use the strongest components by task:

- Mapping-IO: mapping format normalization;
- Tiny Remapper: compiled JAR remapping oracle/path;
- SrgUtils/AutoRenamingTool: Forge/NeoForge mapping operations;
- Srg2Source/Mercury/Lorenz: source-remap comparators where useful;
- Ravel: Kotlin/Mixin/AW mapping oracle;
- Intermediary Matcher/Stitch methodology: cross-version identity evidence;
- Parchment: pre-26.1 semantic enrichment only where useful.

No requirement to force one library to own every mapping operation.

### T313 — Differential source/JAR remap proof stack

- [ ] **T313** — Make remapping a proven multi-oracle operation instead of trusting one implementation. On representative Java, Kotlin, Mixin, MixinExtras, Access Widener/Class Tweaker and compiled-JAR fixtures, compare Enderloom against:

- Fabric Loom `migrateMappings` / related migration tasks as the Fabric-native oracle;
- **Ravel** for PSI-aware Java/Kotlin/Mixin/Class Tweaker source remapping;
- **NeoForged AutoRenamingTool (ART)** for Forge/NeoForge JAR remap/rename behavior;
- **ModForge** for artifact-backed EXACT/CANDIDATE/UNRESOLVED symbol evidence;
- Tiny Remapper / Mapping-IO / SrgUtils for the lower-level mapping operations they already own.

Adopt useful algorithms or direct integrations only after AoA + isolated fixtures confirm owner/name/descriptor correctness and no silent ambiguity. Preserve an evidence chain for every auto-applied rename; an oracle disagreement lowers confidence instead of becoming a coin flip.

### T314 — Legacy mapping/reconstruction subgraph

- [ ] **T314** — If Enderloom claims broad historical Minecraft support, add an explicit legacy mapping lane rather than stretching modern Yarn/Mojmap assumptions backwards. Evaluate/integrate the useful parts of the **Ornithe** toolchain:

- Feather for CC0 named mappings from very old Minecraft through 1.14.4;
- Calamus as stable intermediate mapping lineage;
- nests for historical inner-class reconstruction;
- Sparrow/Raven signature + exception metadata for generics/throws fidelity;
- Ploceus/Keratin-style legacy build/deobfuscation workflows as target-generation references.

The version graph must identify exactly when this lane applies. Legacy enrichment can never override stronger exact mappings for newer versions.

---

# G044 — Permissioned MC Mod Porter integration and learned-rule store

- [ ] **G044 · GATE** — Useful MC Mod Porter implementation/knowledge is integrated into one Enderloom rule store with provenance and differential proof.

### T156 — Snapshot authorized MC Mod Porter source

- [ ] **T156** — Record the exact upstream commit/release and the user's direct permission context before code/data ingestion.

Inventory:

- auto-porter;
- Minecraft migration KB;
- loader/version KB;
- method/class/signature patterns;
- templates;
- verification/troubleshooting logic.

### T157 — Build canonical `SemanticRule` schema

- [ ] **T157** — Every migration rule stores:

- source/target MC ranges;
- source/target loader ranges;
- language scope;
- structural trigger;
- semantic intent;
- required symbol evidence;
- transformation implementation;
- negative guards;
- version ordering/dependencies;
- provenance/license/permission;
- confidence;
- compile proof;
- runtime proof;
- validated fixtures;
- invalidation conditions.

### T158 — Import MC Mod Porter knowledge

- [ ] **T158** — Convert useful MC Mod Porter facts/rules into the canonical store.

Do not maintain a second independent migration truth database.

### T159 — Differential harness

- [ ] **T159** — For representative projects run:

1. current Enderloom baseline;
2. MC Mod Porter baseline;
3. composed Enderloom candidate.

Measure transformed files, remaining compile errors, false positives, missed changes, metadata correctness, runtime success, manual interventions and wall-clock time.

### T160 — Adjacent-hop composition engine

- [ ] **T160** — Compose verified version edges without forcing unnecessary intermediate disk/build cycles.

Preserve ordering for non-commutative changes and run intermediate semantic validation only when a downstream rule depends on intermediate state.

### T161 — Convert failures into permanent knowledge

- [ ] **T161** — Any nontrivial fix discovered during implementation/AoA becomes a generalized rule or an explicitly project-specific exception with exact evidence.

No anonymous one-off patch files.

---

# G045 — JVM semantic worker

- [ ] **G045 · GATE** — Java/Kotlin source migration uses a compiler/type-aware worker with deterministic structured IPC and no dependency on an IDE UI.

### T162 — Create the dedicated JVM worker

- [ ] **T162** — Create one headless JVM tool/service invoked by Rust through versioned JSON/CBOR/protobuf-like structured messages.

It must support:

- project/source indexing;
- mapping normalization/remap operations;
- semantic query;
- rule planning;
- source transformation;
- API delta analysis;
- bytecode analysis;
- Gradle build-model extraction;
- dependency resolution queries;
- deterministic diagnostics.

No user-facing daemon is required; Rust owns lifecycle.

### T163 — OpenRewrite primary recipe engine

- [ ] **T163** — Implement Minecraft-specific OpenRewrite recipes for structurally safe source migrations.

Initial families:

- import/package relocation;
- type/member rename/move;
- constructor/method signature changes;
- field/accessor migration;
- registration/event lifecycle changes;
- identifier/resource-key changes;
- NBT/component/codec migrations where source-local;
- networking declaration changes;
- annotation/entrypoint changes;
- build DSL changes where parser support is strong.

Promote a recipe only with positive and negative fixtures.

### T164 — JDT semantic/compiler oracle

- [ ] **T164** — Use Eclipse JDT/compiler services for:

- exact binding;
- overload resolution;
- inheritance/interface resolution;
- generics;
- unresolved members/types;
- diagnostics;
- references;
- compiler-grade target classpath validation.

### T165 — Spoon/GumTree/RefactoringMiner mining lane

- [ ] **T165** — Use these tools to mine/generalize transformations from verified before/after ports.

They discover candidate rules; they do not blindly replay edit scripts.

### T166 — Kotlin-first semantic support

- [ ] **T166** — Support Kotlin through current OpenRewrite Kotlin plus Ravel/Kotlin Analysis API as independent semantic oracles where necessary.

Fixtures must include extension functions, object/companion code, Fabric Language Kotlin, Gradle Kotlin DSL and supported Mixin patterns.

### T167 — Remove regex authority from the target converter

- [ ] **T167** — Audit current target-26.3 regex/string rewrites.

Classify each as:

- safe uniform textual normalization -> retain with guards;
- mapping-driven -> move to mapping engine;
- symbol/type-sensitive -> replace with semantic recipe;
- behavioral -> replace with intent-level rule/runtime fixture;
- project-specific -> explicit assisted migration.

The new semantic worker becomes authoritative for the latter three classes.

---

# G046 — Bytecode, decompilation and compiled-artifact reconstruction

- [ ] **G046 · GATE** — Source-unavailable/compiled inputs are reconstructed with explicit fidelity/provenance and independent disagreement detection.

### T168 — JDK 25 Class-File API bakeoff

- [ ] **T168** — Evaluate the JDK 25 Class-File API as the primary standard-classfile parsing/rewriting interface for the Java-25 lane.

Compare against ASM on:

- class/member/descriptor inventory;
- annotations;
- module/record/sealed/nest metadata;
- constant pool;
- signatures;
- method handles/indy;
- transformed class validity;
- performance.

Use ASM where it is stronger or required by ecosystem libraries; do not force replacement for fashion.

### T169 — Kotlin metadata preservation

- [ ] **T169** — Detect Kotlin classes and preserve/rewrite Kotlin metadata consistently with class/member changes.

Do not ship bytecode that links at JVM level but has stale Kotlin reflection/compiler metadata.

### T170 — Vineflower primary + independent decompiler

- [ ] **T170** — Use Vineflower as the leading source reconstruction lane and retain CFR or another independent oracle for disagreement detection.

Never label decompiled source as original-source fidelity.

### T171 — Codebook + Unpick normalization bakeoff

- [ ] **T171** — Compare PaperMC Codebook/Unpick with the current remap/decompile lane for legacy/constant-heavy artifacts.

Promote only where semantic reconstruction measurably improves without false substitutions.

### T172 — Packaged archive semantics

- [ ] **T172** — Make archive handling aware of:

- signed JARs/signature files;
- Multi-Release JAR paths;
- `META-INF/services`;
- module metadata;
- nested JARs;
- manifests;
- duplicates/order-sensitive resources;
- classpath attributes;
- loader metadata;
- refmaps/mixin configs.

If rewriting invalidates an existing signature, report it explicitly; never silently ship a broken signature. Re-sign only with user-authorized signing material/workflow.

### T173 — Compiled-only lane stays separate from source-first lane

- [ ] **T173** — Byte Buddy/ASM/Recaf/SootUp remain conditional tools for compiled-only, instrumentation or hard analysis cases.

Do not patch bytecode merely because source transformation is harder when maintainable source exists.

### T315 — Binary/API compatibility differential gate

- [ ] **T315** — Add **NeoForged JarCompatibilityChecker** beside Revapi/japicmp as an independent compiled-JAR API/binary delta oracle. Compare outputs across Minecraft/loader/API version pairs and normalize differences into Enderloom's API-delta graph.

JCC is especially useful for private/all-member binary changes and current Java classfile support; Revapi/japicmp remain complementary for their richer source/API models. No single compatibility checker is complete enough to be the sole authority.

### T316 — Deterministic patch/reconstruction architecture corpus

- [ ] **T316** — Reintroduce and study **PaperMC Mâché + paperweight** and current **NeoForge InstallerTools** as architecture references for deterministic artifact reconstruction and patch application. Extract useful patterns for:

- reproducible decompile/remap/patch/recompile stages;
- cacheable intermediates and exact input hashes;
- patch failure diagnostics rather than fuzzy continuation;
- class/resource JAR splitting and deterministic ZIP injection;
- binary patch provenance;
- machine-readable problems/warnings.

These are references/selective backends, not a requirement to convert Enderloom into a Paper or NeoForge installer clone.

---

# G047 — Loader capability translation knowledge

- [ ] **G047 · GATE** — Loader conversion translates semantic intent instead of API spelling.

### T174 — Build `LoaderCapabilityGraph`

- [ ] **T174** — Model at least:

- lifecycle/entrypoints;
- event systems;
- registries/deferred registration;
- configuration;
- networking;
- capabilities/components/attachments;
- tags/common conventions;
- client/render hooks;
- commands;
- datagen;
- access mutation;
- enum/interface extension;
- Mixins/transforms;
- nested dependencies.

Each edge records source representation -> canonical intent -> target representation -> required shim/runtime behavior -> proof.

### T175 — Mine bidirectional compatibility corpora

- [ ] **T175** — Ingest generalized evidence from:

- Sinytra Connector/Adapter;
- Launchpad;
- Forgified Fabric API/Loader;
- MixinTransmogrifier;
- MixinExtras;
- Porting Lib;
- Kilt/Twill;
- historical Patchwork transformations;
- Forge Config API Port.

Do not make converted mods depend on a compatibility layer when a clean native target implementation is available and verifiable.

### T176 — Mixin/access semantic conversion

- [ ] **T176** — Convert Mixins/AW/Class Tweaker/AT/interface injection with exact owner/member/descriptor semantics and target-runtime proof.

No selector is considered safe based on a name-only match.

### T317 — Bidirectional loader-semantic corpus expansion

- [ ] **T317** — Expand `LoaderCapabilityGraph` from concrete compatibility implementations, not documentation alone:

- **Sinytra Launchpad** for predictable Fabric-convention -> NeoForge metadata/entrypoint/registration/dependency/Class Tweaker semantics;
- **ConnectorExtras** for real two-way third-party API bridges such as energy/platform integrations;
- **Kilt/Twill** and **Porting-Lib** for Forge/NeoForge -> Fabric inverse correspondences;
- historical Patchwork transformation families only as archived regression evidence;
- Forge Config API Port and other focused bridges where they establish an exact semantic correspondence.

For every mined correspondence store direction, version bounds, fidelity caveats, required runtime shim, and a target-native replacement path. Compatibility-layer behavior is evidence, not permission to force converted mods to depend on that layer.

### T318 — Access/Class Tweaker/Mixin format authority

- [ ] **T318** — Parse and validate loader access/mutation formats against the loader's current formal implementation/specification rather than ad-hoc text handling. Include current **NeoForged AccessTransformers** and Fabric **Class Tweaker** semantics (including transitive access, interface injection and enum extension where supported), and version-aware **MixinExtras** selectors/expressions.

Ravel's lack of MixinExtras Expression remapping is an explicit coverage gap Enderloom must close itself or with another proven oracle. Exact owner/member/JVM descriptor plus target-runtime PREPARE/APPLY remains mandatory.

---

# G048 — Build-model extraction, target workspace generation and dependencies

- [ ] **G048 · GATE** — Enderloom emits target-native, reproducible, fast Gradle projects from a canonical model rather than copying fragile source build scripts wholesale.

### T177 — Gradle Tooling API build-model lane

- [ ] **T177** — Use the Gradle Tooling API or the strongest supported structured model path to inspect projects without regex-parsing build files as the primary authority.

Extract where available:

- projects/source sets;
- dependencies/configurations;
- tasks;
- Java toolchains;
- Gradle/plugin versions;
- run/datagen/test configuration;
- generated source/resource paths.

Fallback parsing is allowed only when the model cannot expose required information and must preserve unknown build logic for review.

### T178 — Maven Resolver integration

- [ ] **T178** — Use Apache Maven Resolver for explicit repository/artifact/dependency queries needed outside Gradle's own build execution.

Do not create a second conflicting dependency graph. The canonical resolved lock records the source and selected version for each artifact.

### T179 — Dependency locking and verification

- [ ] **T179** — Generated Gradle projects use dependency locking and verification/checksum controls where supported.

Record repositories, coordinates, selected versions, hashes and provenance in the conversion receipt.

### T180 — Generate loader-native project variants

- [ ] **T180** — Generate correct target projects for supported Fabric/NeoForge/Forge targets using current loader-native Gradle tooling.

Rules:

- Fabric Loom for Fabric;
- ModDevGradle/current NeoForge tooling for NeoForge where appropriate;
- ForgeGradle/current compatible route for Forge targets;
- Unimined may be used as a broad/legacy fixture generator or alternate supported target route;
- do not replace loader-owned Gradle behavior with a generic Java build tool unless full parity is proven.

### T181 — Multi-loader/multi-version output strategy

- [ ] **T181** — Support canonical shared-source workspace generation.

Bake off:

- raw Stonecutter + loader-native Gradle;
- Stonecraft abstraction where licensing/feature coverage permits;
- Architectury common-source patterns;
- current `jaredlll08/MultiLoader-Template` as a maintained 26.3 comparator;
- OpenShock/TheMightyArchitectury production matrix patterns.

If an abstraction cannot represent a target, fall back to generated raw loader-native configuration rather than dropping the target.

### T182 — Configuration Cache and equivalent-work performance

- [ ] **T182** — Generated modern projects must pass Gradle Configuration Cache for normal supported tasks where loader/plugin versions permit it.

Measure cold/warm configuration and build times without skipping validation.

---

# G049 — Untrusted build sandbox and supply-chain boundary

- [ ] **G049 · GATE** — Enderloom can inspect/build third-party mod projects without silently granting arbitrary host access and can account for imported/vendored code provenance.

### T183 — Default-deny build sandbox

- [ ] **T183** — Run untrusted Gradle/Maven/custom project code inside a constrained sandbox by default.

Windows target:

- process/job lifecycle control;
- AppContainer or equivalent capability boundary where practical;
- isolated working directories;
- explicit filesystem allowlist;
- explicit network policy;
- CPU/memory/time quotas;
- no ambient credential/token access;
- no unrestricted access to unrelated Minecraft instances/user files.

Provide equivalent supported isolation on other platforms where Enderloom ships.

If a project requires broader capabilities, surface the exact request and reason. Do not silently disable the sandbox.

### T184 — Separate analysis from code execution

- [ ] **T184** — Source/archive/metadata analysis should not execute project build scripts.

Only the build stage may execute target build logic, and only after source authority/provenance and sandbox setup exist.

### T185 — SBOM/license/provenance scan for vendored integrations

- [ ] **T185** — For code actually copied/vendored/embedded into Enderloom, use a reproducible license/provenance inventory.

ORT/ScanCode or equivalent may be used as tooling; they do not replace the user-granted MC Mod Porter permission record.

Track:

- source URL;
- commit/release;
- license;
- permission record where applicable;
- modified files;
- attribution/notice obligations;
- distribution constraints.

### T186 — Dependency security and cache trust

- [ ] **T186** — Treat artifact caches as content-addressed and verify cached downloads before reuse.

A matching filename/version without matching hash/provenance is not a trusted hit.

---

# G050 — Data, resources, datagen and persistent-data migration

- [ ] **G050 · GATE** — Java-clean conversions cannot silently lose Minecraft data/resource behavior.

### T187 — Versioned Minecraft data corpus

- [ ] **T187** — Ingest/use `misode/mcmeta` as a versioned generated-data diff corpus and `PrismarineJS/minecraft-data` as a second oracle.

For load-bearing facts, reproduce/verify against official game JARs/data generation when practical.

### T188 — Data/resource version edges

- [ ] **T188** — Add pack-format, registry, command-tree, model/render definition, worldgen/data-pack path and data-component capability changes to `VersionGraph`.

JSON parsing successfully is not proof of semantic compatibility.

### T189 — DFU/Codec/DataComponent-aware planning

- [ ] **T189** — Detect persistent-data migrations that may require:

- DataFixerUpper/schema work;
- Codec/StreamCodec changes;
- NBT -> Data Component migration;
- dynamic registry serialization changes;
- saved-data compatibility fixtures.

### T190 — Datagen equivalence

- [ ] **T190** — When source datagen exists, run source and target datagen where practical and compare normalized outputs.

Fail on unexplained loss of recipes/tags/loot/advancements/models/blockstates/lang/registry data or other generated outputs.

### T191 — Static resource preservation

- [ ] **T191** — Include user-authored static resources/data in the same parity inventory as generated content.

No “datagen passed” shortcut may hide static resource loss.

### T319 — First-class versioned data/resource delta graph

- [ ] **T319** — Elevate **misode/mcmeta** from a reference corpus to a structured cached input for `DataResourceDeltaGraph`: registries, generated data/assets, commands, item components, block states, sounds, atlases and published version diffs. Re-derive load-bearing facts from official game JAR/data generators before promoting them to conversion rules.

Use **PrismarineJS/minecraft-data** as a secondary/legacy cross-check where it adds coverage; it never overrides newer official or independently regenerated truth.

### T320 — Real DataFixerUpper/schema evidence lane

- [ ] **T320** — When persistent Minecraft data crosses schema generations, inspect the actual target/source **DataFixerUpper** schemas/fixes and target codecs instead of treating DFU as a generic concept. Build fixtures for saved data, entities/block entities, chunks/world data and other affected persistent formats when a mod owns or embeds versioned data.

Do not blindly run vanilla DFU over arbitrary mod-owned NBT. Use its schema/fix graph as evidence and execute only transformations whose ownership/type contract is known.

---

# G051 — Compile, diagnose, generalized repair loop

- [ ] **G051 · GATE** — Compiler/build failures are classified by shared cause and repaired through reusable transformations rather than ad-hoc edits.

### T192 — Structured compiler diagnostics

- [ ] **T192** — Normalize javac/Kotlin/Gradle/loader diagnostics into stable failure classes with file/symbol/descriptor/rule context.

### T193 — Shared-cause repair planner

- [ ] **T193** — Group repeated errors by migration cause before editing.

Examples:

- one removed API causing 80 call-site errors -> one semantic rule;
- one stale mapping namespace causing many Mixin errors -> mapping correction;
- one missing target dependency causing class-not-found flood -> dependency fix.

### T194 — Ambiguity stops unsafe auto-apply

- [ ] **T194** — When JDT/OpenRewrite/mapping/API-delta oracles disagree materially, lower confidence and enter deeper analysis instead of guessing.

Record the unresolved candidates/evidence.

### T195 — Human-assisted migration remains structured

- [ ] **T195** — For genuinely project-specific logic that cannot be safely automated, emit an assisted migration item containing exact source context, target API evidence, expected behavior, unresolved choice and required proof.

Do not emit a generic “manual fix needed.”

### T196 — Learned-fix promotion gate

- [ ] **T196** — Promote a repair to global reuse only after:

- at least one positive source fixture;
- negative controls;
- target compile;
- applicable runtime proof;
- provenance/version bounds;
- no regression on previously protected fixtures.

### T321 — Crash/failure intelligence corpus

- [ ] **T321** — Mine **Crash Assistant** as a high-value repair-signature and diagnostic-method corpus, independently verifying every promoted rule. At minimum add reusable detection/fixtures for:

- missing/duplicate classes and packages;
- nested-JAR ownership/provider ambiguity;
- duplicate modules/packages and JPMS failures;
- Mixin/config/transform ownership;
- missing/incompatible dependencies;
- Java/runtime/GPU/native mismatch;
- watchdog/deadlock and common startup failures.

Use **MixinTrace**-style provenance to enrich stack frames with the contributing Mixin config/class/mod when deterministically recoverable from packaged metadata/bytecode. Small pattern-only crash analyzers may serve as independent differential fixtures but never become repair authority.

### T322 — Source transformation prefilter without semantic downgrade

- [ ] **T322** — Evaluate **ast-grep** as a fast parallel tree-sitter structural search/rewrite *prefilter* for large Java/Kotlin/code/config corpora. Use it to locate candidate transformation sites and mine recurring patterns before handing exact semantic decisions to JDT/OpenRewrite/compiler/mapping oracles.

Never promote an ast-grep textual/structural match to an auto-fix when symbol/type/runtime semantics are required.

---

# G052 — Packaged artifact audit

- [ ] **G052 · GATE** — The exact output JAR is structurally and link-time valid before runtime promotion.

### T197 — Port/strengthen packaged-linkage audit

- [ ] **T197** — Preserve and strengthen existing gates for:

- owner/name/descriptor;
- constructor owner;
- static/instance mismatch;
- class/interface mismatch;
- constant-pool reference kind;
- member/class access;
- final field writes;
- final superclass;
- method-handle kind;
- multi-release entries;
- nested JARs;
- metadata/entrypoints;
- service loader resources.

### T198 — Mixin/refmap package audit

- [ ] **T198** — Verify Mixin configs/refmaps and exact target descriptors in the packaged artifact, not only source annotations.

### T199 — Archive inventory diff

- [ ] **T199** — Compare expected source/target archive inventory and explain every removed/added/relocated entry category.

Expected version-driven changes are allowlisted with evidence; unexplained disappearance fails the gate.

### T323 — Packaged provenance and ownership graph

- [ ] **T323** — Build a class/resource/provider ownership graph across the outer JAR, Jar-in-Jar/nested dependencies, Multi-Release entries and dependency classpath. Use it during linkage and repair to answer exactly which artifact supplies a class/resource/service and to detect duplicate/split-package/shadowing conflicts before runtime.

Where a JAR carries signatures, preserve signature state as evidence and invalidate/re-sign only through an explicit authorized release path.

---

# G053 — Real target runtime proof

- [ ] **G053 · GATE** — The exact SHA-256 candidate artifact is exercised in the strongest applicable native runtime path.

### T200 — Use Enderloom native launcher/server path as primary runtime verifier

- [ ] **T200** — Move the current native runtime-proof capability into the Rust conversion service and make it authoritative for production verification.

It must stage the exact candidate artifact and record:

- target Minecraft/loader/Java;
- exact artifact hash;
- launch/run identity;
- ready markers;
- fatal errors;
- cleanup result;
- evidence file locations.

### T201 — Dedicated server proof

- [ ] **T201** — For server-capable mods, start a real target dedicated server, detect loader/mod initialization success and fatal errors, then stop/clean it deterministically.

### T202 — Client proof

- [ ] **T202** — Launch a real target client through the QA-safe native launch path and prove resource reload/mod initialization plus affected behavior markers where possible.

No production user session/account side effects should be required for deterministic CI fixtures when offline/test auth modes are available.

### T203 — GameTest / loader-native tests

- [ ] **T203** — Run Fabric/Forge/NeoForge supported GameTest/JUnit/native test paths where the converted project supplies or Enderloom generates meaningful tests.

Require a minimum expected discovered-test count to prevent a zero-test false pass.

### T204 — Runtime content census

- [ ] **T204** — At runtime collect the applicable source-vs-target capability census:

- loaded mod IDs/versions;
- registered content counts/IDs;
- tags;
- commands;
- networking registrations;
- configs;
- data/resource packs;
- representative worldgen;
- event callbacks;
- client/server boundaries.

### T205 — Restart/persistence proof

- [ ] **T205** — When the mod persists config/world/saved data, perform restart/reload tests using representative fixture state.

A first-launch success does not prove persistence compatibility.

### T206 — HeadlessMC/MC-Runtime-Test remains comparator/CI aid

- [ ] **T206** — Use HeadlessMC/MC-Runtime-Test where it improves automated coverage or portability, but do not create a second contradictory runtime truth path.

The production Enderloom native verifier owns final artifact promotion.

### T324 — Production-server CI matrix before final native promotion

- [ ] **T324** — Add **mc-server-test** as a CI breadth layer for real production-style Fabric/Forge/NeoForge/vanilla server startup across supported versions, including scripted command/assertion interactions. It complements loader-native GameTest and MC-Runtime-Test; Enderloom's own native verifier remains final promotion authority for the exact artifact.

### T325 — Minecraft/JVM performance proof lane

- [ ] **T325** — For AoA and other performance-sensitive converted/repaired/created mods, capture repeatable **spark** profiles/health metrics and use **async-profiler** or JFR/JMC headless analysis when deeper CPU/allocation/lock/native evidence is needed. Performance changes pass only when equivalent gameplay/content/runtime coverage is preserved.

---

# G054 — Resumability, caching and performance

- [ ] **G054 · GATE** — The full engine is faster through incremental architecture while returning the same complete result.

### T207 — Stage-level fingerprints

- [ ] **T207** — Fingerprint source, mappings, rules, target toolchain, dependencies, IR, generated workspace, artifact and runtime proof separately so a small change invalidates only dependent stages.

### T208 — Content-addressed artifact/cache store

- [ ] **T208** — Reuse immutable downloaded/generated artifacts by hash with provenance and corruption checks.

### T209 — Single-flight external/tool work

- [ ] **T209** — Deduplicate concurrent requests for the same mappings, Minecraft artifacts, loader metadata, dependency artifacts and generated target universe.

### T210 — Bounded parallel fanout

- [ ] **T210** — Parallelize independent secondary cells only after the primary gate unlocks and resource limits are known.

Avoid oversubscribing Gradle/JVM/Rust worker pools against one machine.

### T211 — Fast local invalidation/indexing

- [ ] **T211** — Preserve the earlier MFT+USN Windows indexing plan for large local project/instance catalogs, with safe filesystem-walk fallback.

Everything IPC may be an optional accelerator, never canonical state.

### T212 — Equivalent-work benchmark suite

- [ ] **T212** — Measure:

- intake/index latency;
- first semantic plan latency;
- cold conversion;
- warm unchanged resume;
- one-file source change;
- one-rule change;
- one-loader-cell change;
- target fanout throughput;
- runtime verification time;
- peak memory/CPU where material.

Performance promotion requires identical accepted outputs/proof coverage.

### T326 — Build/iteration performance harness

- [ ] **T326** — Use **Gradle Profiler** to prove Gradle/configuration-cache/task-graph changes on representative generated workspaces, and bake off current **sccache** for Rust/JVM-adjacent compilation workloads it can actually cache. Record cold/warm build/configuration times and cache hit/miss reasons.

Build-speed work is developer/agent QoL, not a substitute for app/runtime performance, and may not weaken reproducibility or validation.

---

# G055 — Output workspace strategy and developer QoL

- [ ] **G055 · GATE** — Converted projects are maintainable developer projects, not disposable generated blobs.

### T213 — Clean generated source organization

- [ ] **T213** — Separate:

- original preserved source snapshot;
- generated/converted source;
- Enderloom metadata/receipts;
- loader/version-specific source;
- shared source;
- generated data/resources;
- build outputs.

Do not mix temporary intermediate files into source authority.

### T214 — One-source multi-version when appropriate

- [ ] **T214** — Prefer shared-source Stonecutter/Architectury-style output when it materially reduces duplication without making the project harder to understand or debug.

### T215 — Conversion explanation/report

- [ ] **T215** — Emit a concise machine + human-readable report containing:

- what changed;
- which rules applied;
- which upstream evidence informed them;
- what remained version-specific;
- dependencies added/removed;
- data/resource differences;
- tests/runtime gates passed;
- unresolved assisted items;
- final hashes.

### T216 — Deterministic clean-room replay command

- [ ] **T216** — The final workspace/receipt provides one reproducible Enderloom command/session identity that replays conversion from immutable source without hand edits.

---

# G075 — Capability-first execution entrypoint

- [ ] **G075 · GATE** — Before AoA is used as the real graduation project, Enderloom/Minecraft Dev Kit can **convert, repair, and make mods** through production-grade shared primitives rather than three disconnected toolchains. Conversion foundation G040-G055, repair G076, authoring G077, and the required verification commands in T230-T232 must be ready before AoA graduation starts.

### T284 — One shared Minecraft project capability contract

- [ ] **T284** — Define one typed capability/domain contract used by `convert`, `repair`, and `create` workflows. Reuse the canonical VersionGraph, ProjectIR/BuildIR, manifest/dependency/access/Mixin/content IRs, toolchain resolver, artifact model, runtime proof, evidence/provenance, learned-rule store, and durable task/session primitives.

Do not fork separate rules for conversion vs repair vs authoring when the underlying Minecraft fact is the same.

### T285 — Automatic toolchain and environment closure

- [ ] **T285** — Make the capability layer provision or resolve the correct JDK, Gradle/loader toolchain, mappings, runtime assets and required helper tools for the selected Minecraft/loader/version pair. Prefer verified cached assets; fetch/checksum missing tools automatically when allowed; surface a precise blocker only when the environment truly cannot be provisioned.

### T286 — Immutable source/workspace authority for all three workflows

- [ ] **T286** — Every convert/repair/create session records immutable source/workspace identity, hashes, dependency/toolchain state, target intent, previous attempts, generated artifacts and evidence. Mutations happen in generated/working copies with transactional promotion; original user source is never silently overwritten.

### T287 — One developer/agent command surface

- [ ] **T287** — Expose predictable typed actions for at least:

- `doctor` / capability report;
- `convert`;
- `repair`;
- `create` / scaffold;
- `verify`;
- `resume`;
- `package`;
- optional authorized `publish`.

GUI/CLI/agent entrypoints call the same domain actions and receive the same structured operation IDs, progress, blockers and receipts.

### T288 — Capability readiness matrix

- [ ] **T288** — Add one machine-readable capability matrix showing supported Minecraft versions, loaders, Java versions, source/compiled support, conversion/repair/authoring/test/runtime capabilities and exact degraded/unsupported reasons. The matrix is generated from real adapters/toolchains/tests, not hand-written marketing flags.

---

# G076 — Repair capability is production-ready before AoA

- [ ] **G076 · GATE** — Enderloom can diagnose, repair and re-verify broken Minecraft mod projects/artifacts/instances without feature removal, random trial-and-error or unsafe in-place mutation; every reusable repair becomes shared knowledge.

### T289 — Canonical `RepairPlan` / failure taxonomy

- [ ] **T289** — Implement structured repair findings that preserve causal evidence and classify at least:

- toolchain/Gradle/JDK/environment;
- mapping/API/descriptor drift;
- loader/metadata/dependency incompatibility;
- Mixin/access/reflection/invokedynamic failures;
- compile/linkage/package/Jar-in-Jar failures;
- registry/content/datagen/data/resource failures;
- config/save/data migration failures;
- client/server/network/render/resource runtime failures;
- modpack/instance dependency and duplicate-mod failures.

A repair plan points to the earliest causal owner and the exact verification gate that must pass afterward.

### T290 — Source/project repair engine

- [ ] **T290** — Repair broken source projects using the same semantic/mapping/build infrastructure as conversion: Gradle model extraction, dependency closure, loader-native project fixes, semantic Java/Kotlin changes, Mixin/access resolution, metadata/data/resource/datagen repair and compiler-guided iteration.

Do not solve a broken build by deleting accepted content, tests or integrations.

### T291 — Packaged JAR/artifact repair lane

- [ ] **T291** — Diagnose packaged JARs for owner/name/descriptor linkage, metadata/entrypoints, nested JARs, services, Multi-Release layout, signatures, access, Kotlin metadata and classfile problems. Prefer source-aware rebuild when source exists; bytecode surgery is a bounded fallback and must retain provenance plus independent runtime proof.

### T292 — Modpack/instance dependency repair

- [ ] **T292** — Detect and repair missing/recursive dependencies, incompatible versions/loaders, duplicates, provider aliases, stale superseded JARs, optional/recommended conflicts and client/server placement problems through Enderloom's canonical solver/identity layer.

Use **packwiz** and **Ferium/libium** as behavior/format/comparator corpora where useful, but do not inherit known shallow/heuristic dependency limitations as Enderloom's authority. Preserve/import/export compatible metadata when it improves user workflows.

### T293 — Runtime diagnosis -> targeted repair

- [ ] **T293** — Convert real launch/build logs and runtime events into structured signatures for common Minecraft failure families (NoClassDefFoundError/ClassNotFound, Mixin PREPARE/APPLY, registry freeze/duplicate, access violations, missing resources/data, config parse, dependency mismatch, network protocol, renderer/shader/model failures, native/JVM crashes). Map signatures to evidence-backed repair actions and verify the actual failing workflow afterward.

### T294 — Transactional repair, rollback and resume

- [ ] **T294** — Repairs are staged in a clone/workspace, diffed, hash-bound and promoted atomically. Preserve a restore point and previous runnable artifact/instance before risky mutation; interruption or failed validation must be resumable without leaving a half-repaired instance.

### T295 — Every nontrivial repair becomes reusable knowledge

- [ ] **T295** — After a repair is proven, store signature, applicable version/loader bounds, cause, failed approaches, successful transformation/action, positive fixture, negative fixture, verification and invalidation conditions in the same learned-rule/incident system used by conversion.

### T327 — World/NBT repair capability

- [ ] **T327** — Make world/save repair an explicit optional repair module rather than an accidental side effect. Bake off **simdnbt** vs fastnbt for NBT parse/write hot paths and use a robust region-file implementation such as **mca** for `.mca` access. Mine **Minecraft Region Fixer** and **MCA Selector** only as behavioral/reference corpora for corruption detection, safe chunk/region selection, backup/export/delete semantics and recovery fixtures.

Never delete/regenerate corrupt world data as an implicit "fix". Preserve backups, exact affected coordinates/regions and user-visible recovery choices; prove repaired worlds reopen in the applicable runtime.

### T328 — Modpack/package-manager repair comparators

- [ ] **T328** — Add **Pakku** and current **AutoModpack** behavior to the modpack/instance repair comparator set alongside packwiz/Ferium. Mine safe dependency-aware removal, bulk updates, lock/diff semantics, managed-file ownership, config migration with backups and update synchronization.

Also turn known Prism/other-launcher dependency/provider mistakes (cross-provider identity mismatch, prerelease selection, dependency false negatives) into negative solver fixtures so Enderloom does not repeat them.

### T296 — Repair graduation suite

- [ ] **T296** — Maintain broken fixtures covering project build, dependency, Mixin/access, package/linkage, data/resource and runtime failure classes plus at least one real-world production-shaped repair. Graduation requires diagnosis -> repair -> rebuild -> exact packaged artifact -> strongest applicable runtime gate, with no manual source surgery hidden outside the recorded repair action.

---

# G077 — Mod-making / authoring capability is production-ready before AoA

- [ ] **G077 · GATE** — Enderloom can create and evolve real mods end-to-end with current loader-native build systems, schema-aware content tools, multi-version options, automated tests, native runtime verification and packaging; authoring reuses the same knowledge/runtime stack that conversion and repair use.

### T297 — Authoring project/scaffold model

- [ ] **T297** — Implement authoring on the canonical ProjectIR/BuildIR instead of a separate template-only system. Create correct loader-native Fabric/NeoForge/Forge projects from current templates/tooling, with explicit mod identity, Java/toolchain, mappings, dependencies, source sets, resources, datagen, run configs and test source sets.

### T298 — Current loader-native build generators

- [ ] **T298** — Generate from or continuously validate against current **Fabric Loom**, **NeoForge ModDevGradle/NeoGradle** and **ForgeGradle** practices. Avoid frozen copied templates that silently age. Generated projects must build/run independently of Enderloom after export.

### T299 — Multi-version authoring strategy bakeoff

- [ ] **T299** — Choose output strategy by project/version envelope rather than forcing one preprocessor:

- Stonecutter for clear versioned source overlays where it fits;
- Unimined for broad/legacy loader matrices and fixture generation;
- **Essential Gradle Toolkit / Essential Loom** as a serious legacy + multi-version reference/challenger;
- **ReplayMod preprocessor** and **Manifold preprocessor** as conditional-compilation techniques where they materially simplify one-source support;
- loader-native separated projects when shared-source abstraction would reduce clarity or correctness.

Promote techniques only after maintainability/build/runtime proof on representative versions.

### T300 — Schema-aware JSON/NBT/CODEC/data authoring

- [ ] **T300** — Integrate version-aware schema validation/completion for Minecraft JSON/NBT/CODEC-backed data using **SpyglassMC/vanilla-mcdoc** plus **misode/mcmeta**/official generated reports as complementary sources. Validate registry IDs, pack formats, item components, commands, tags, loot, recipes, worldgen, advancements, structures and other supported data before runtime.

Unknown/custom modded schemas stay explicit and extensible; do not reject valid custom data solely because vanilla schemas do not know it.

### T301 — Minecraft-specific inspections and generators

- [ ] **T301** — Study and selectively reproduce useful **MinecraftDev** and **Railroad IDE** capabilities inside Enderloom's authoring experience: project scaffolding, metadata/resource helpers, Mixin awareness, loader-specific inspections, registry/config/network/datagen helpers and JSON generators. Reuse algorithms/patterns only where licensing permits; otherwise implement behavior from documented/observed requirements.

This is not a requirement to embed or recreate an entire IDE. Enderloom should provide the high-value Minecraft-specific intelligence around the user's editor/workflow.

### T302 — First-class asset/model/animation/content creation modules

- [ ] **T302** — Wire the already-developed Minecraft Dev Kit capabilities (model/animation/reference reconstruction, Blockbench-compatible/source-aware asset flows, premium mob/entity workflows, server-asset conversion, textures/VFX/SFX where applicable) into the same authoring project/session model with provenance and native runtime proof.

### T303 — Loader-native automated testing

- [ ] **T303** — Generate/use the strongest applicable automated tests:

- ordinary JUnit for pure code;
- **Fabric Loader JUnit** for Fabric code requiring loader/runtime transformation;
- Fabric/Minecraft GameTest;
- **NeoForge Test Framework/GameTest** for NeoForge;
- **MC-Runtime-Test/HeadlessMC** as CI/runtime breadth where useful;
- Enderloom's native launcher/server runtime as final promotion authority.

Created mods should begin with runnable test scaffolding rather than adding verification only after bugs appear.

### T304 — Packaging and authorized publishing adapters

- [ ] **T304** — Make packaging/release metadata deterministic and optionally generate/wire modern publishing automation. Bake off **modmuss50/mod-publish-plugin**, **Kira-NT/mc-publish**, and provider-native tools such as Modrinth Minotaur as adapters/reference implementations.

Publishing is opt-in, uses user-authorized tokens from secure secret storage, supports dry-run/release preview, and never publishes merely because a build succeeded.

### T305 — Authoring graduation project

- [ ] **T305** — Create a production-shaped Enderloom-authored fixture/mod from a clean workspace that exercises representative common/client/server behavior, registrations, config, networking/sync, data/resources/datagen, at least one Mixin/access case when appropriate, automated tests, package audit and native client/server runtime. Preserve the exact generated source so future changes can prove backward authoring compatibility.

### T306 — Conversion/repair/authoring share learned intelligence

- [ ] **T306** — A rule/fact learned while converting or repairing must immediately become available to authoring validation/generation when applicable, and authoring failures must improve conversion/repair. Do not maintain separate version tables, loader capability tables, schema truth or semantic rename catalogs.

### T329 — Authoring/remap IDE-oracle differential suite

- [ ] **T329** — Maintain a non-production differential suite against current IDE/dev tooling where it provides unique evidence: Ravel, MinecraftDev/Railroad inspections/generators, Fabric Loom migration tasks and mcsrc-style exact target generation. The Enderloom authoring UI/CLI remains editor-agnostic; IDE tools are oracles/UX inspiration, not mandatory runtime dependencies.

### T330 — External Minecraft-analysis tool differential lane

- [ ] **T330** — Evaluate **minecraft-modding-mcp**, **CreeperHost modlens-mcp** and similar maintained analysis toolchains only as independent oracles/fixture generators for mappings, source/JAR search, Mixin/AW/AT validation and version diffs. Import a capability only after Enderloom/Dev Kit independently verifies its result on real fixtures.

Do not add an MCP server as a second canonical implementation when the same capability belongs in Enderloom's typed domain layer. Small/new/AI-generated tools require stronger verification, not automatic exclusion or automatic trust.

### T307 — Authoring capability receipt

- [ ] **T307** — Emit a machine/human-readable graduation receipt containing project/toolchain versions, generated file manifest, dependency lock, tests, package hash, runtime evidence, supported target matrix and any intentionally unsupported capability.

---

# G056 — AoA is the primary real convergence fixture

- [ ] **G056 · GATE** — Advent of Ascension runs end-to-end through the production engine with no silent content loss and no manual source surgery hidden outside learned rules. **This is the mandatory first real production graduation after conversion/repair/authoring capability readiness; broad app-modernization gates G064+ remain locked until G056 and G078 are green except for infrastructure strictly required to complete/prove AoA.**

### T217 — Restore the exact active AoA source/checkpoint

- [ ] **T217** — Use the current authoritative AoA project/checkpoint and preserve its original project identity/name as already accepted.

Do not create a new “Savior” fork name in user-visible output if the accepted requirement is to retain the original mod name.

### T218 — Source/content baseline

- [ ] **T218** — Produce immutable source hash plus content/registration/resource/data inventories before mutation.

### T219 — Run AoA through production pipeline

- [ ] **T219** — Execute the native -> JVM semantic -> target build -> package audit -> native runtime pipeline without bypassing production code.

### T220 — Every AoA failure improves shared tooling

- [ ] **T220** — Classify every failure:

- shared mapping/version issue;
- loader capability gap;
- semantic recipe gap;
- dependency/build issue;
- Mixin/access/reflection issue;
- data/resource/datagen issue;
- runtime behavior issue;
- truly AoA-specific logic.

Fix the shared layer first where appropriate and add regression coverage before continuing.

### T221 — AoA clean-room replay

- [ ] **T221** — Delete generated target state and repeat the complete conversion from immutable source using only normal Enderloom commands/rules/caches.

No manual source surgery is allowed during this graduation replay.

### T222 — AoA parity/runtime receipt

- [ ] **T222** — Produce the final AoA conversion receipt with:

- source hash;
- rule-set hash;
- target versions/loaders;
- dependency lock;
- generated workspace manifest;
- packaged artifact hashes;
- content/data/resource parity report;
- client/server runtime evidence;
- unresolved items (must be zero for accepted target cells before completion).

---

# G078 — Promote AoA learning before broader app work

- [ ] **G078 · GATE** — AoA is not merely a finished port; every generalized lesson it exposes has been promoted back into conversion, repair and authoring capabilities, reverified, and made available to the rest of Enderloom before broad app modernization begins.

### T308 — Generalize every AoA fix before moving on

- [ ] **T308** — Review the AoA failure/fix ledger and promote every non-project-specific mapping, semantic, loader, dependency, build, Mixin/access, data/resource, runtime or performance fix into the canonical rule/capability store with version bounds, fixtures and proof.

### T309 — Re-run repair and authoring graduation with AoA-derived knowledge

- [ ] **T309** — Rerun the affected G076/G077 fixtures after AoA-derived rule changes. Prove new generalized behavior does not overfit AoA or regress existing repair/authoring output.

### T310 — Promote useful AoA performance discoveries

- [ ] **T310** — Record conversion/build/runtime hot paths exposed by AoA's real scale. Improve caches, invalidation, parallelism, artifact reuse, compiler/build orchestration or data indexing where measurement supports it, then preserve equivalent results and rerun the affected AoA stage.

### T311 — Freeze the AoA knowledge/receipt lineage

- [ ] **T311** — Bind the final AoA source hash, rule-store hash, toolchain/dependency locks, generated workspace, exact packaged artifacts, runtime receipts and generalized learned-rule IDs into a durable receipt/checkpoint that can reproduce the result clean-room.

### T312 — Unlock broader app implementation only after capability/AoA convergence

- [ ] **T312** — Mark the broader app gates G064+ ready only when G075/G076/G077, G056 and T308-T311 are green. From this point onward, app-wide performance/search/download/UI/provider work must reuse the proven capability/task/evidence infrastructure and may use AoA workloads as realistic performance/regression fixtures.

---

# G057 — Adversarial regression matrix

- [ ] **G057 · GATE** — AoA success is not overfit; isolated fixtures prove the shared engine across difficult categories.

### T223 — Maintain adversarial fixtures

- [ ] **T223** — Include fixtures for:

- Yarn/pre-26 -> 26.1+ official crossing;
- Kotlin Fabric mod;
- MixinExtras-heavy mod;
- AW/Class Tweaker + interface injection;
- Forge/NeoForge event/config/capability semantics;
- nested JAR/JarJar negotiation;
- client-only/server-only split;
- datagen-heavy project;
- saved-data/Data Component migration;
- multi-loader Stonecutter project;
- signed JAR detection;
- Multi-Release/service-loader archive;
- compiled-only authorized recovery.

### T224 — Real production multi-version comparators

- [ ] **T224** — Use maintained projects such as OpenShock Integrations.Minecraft and TheMightyArchitectury as structure/runtime-matrix comparators where licensing allows fixture use.

### T225 — Negative controls

- [ ] **T225** — Every generalized semantic rule family must have fixtures that look similar but must **not** be transformed.

This is mandatory protection against over-broad auto-porting.

### T331 — Fuzz/property/adversarial parser suite

- [ ] **T331** — Fuzz and property-test untrusted/high-variance inputs: ZIP/JAR central directories, nested JARs, manifests, loader metadata, mappings, AT/AW/Class Tweaker, Mixin config/refmaps, NBT/region files, provider JSON/HTML normalization and persisted job/session state. Use cargo-fuzz/Bolero/proptest-style tooling or stronger current equivalents where they fit the implementation language.

Every discovered crash, hang, excessive allocation or parser differential becomes a minimized permanent regression fixture. Fuzz success never replaces semantic/runtime proof.

### T332 — Loader dependency-resolution parity fixtures

- [ ] **T332** — Cross-check Enderloom solver decisions against the target loader's own dependency semantics on representative graphs, including Fabric Loader's SAT4J-backed resolution behavior and FML/NeoForge constraints. Differences must be intentional and documented; Enderloom may produce a better explanation/solution but must not install a graph the target loader will reject.

---

# G058 — Duplicate authority retirement and execution convergence

- [ ] **G058 · GATE** — The conversion product has one canonical execution/state authority per operation, with redundant legacy/native/JVM paths retired after measured parity; no language is removed solely for purity.

### T226 — Route conversion hot paths through the strongest service boundary

- [ ] **T226** — Route user-facing conversion commands/progress/state through the canonical typed service path after G041 parity. Prefer the native Rust service for durable/high-throughput/hot-path work, but preserve a JS/TS adapter where it remains the best UI integration layer and does not own duplicate domain truth.

### T227 — Retire redundant JS conversion authority where superseded

- [ ] **T227** — Delete or reduce legacy JS conversion ownership only after the replacement path proves equal or better behavior, performance and recovery. Keep useful JS/TS presentation/adaptation code when it is not the canonical conversion state/business-rule owner.

No operation may have two independent authoritative engines.

### T228 — Retire superseded Python production logic selectively

- [ ] **T228** — Once a Python Dev Kit capability is replaced by Rust/JVM with equal or stronger fixtures, remove it from the production execution graph.

Keep useful reference/selftest fixtures where they still provide independent regression value.

### T229 — One engine assertion

- [ ] **T229** — Add a QA check that fails if product conversion can route through two independent production engines for the same operation.

---

# G059 — Final promotion matrix for researched technologies

- [ ] **G059 · GATE** — Every researched candidate has an explicit production role, comparator role or rejection/defer state.

| Candidate / family | Final implementation role |
|---|---|
| Rust native core | **PRODUCTION OWNER** for orchestration/state/runtime/process/files/cache/progress/receipts |
| OpenRewrite | **PRIMARY semantic recipe engine** |
| Eclipse JDT | **PRIMARY compiler/symbol oracle** |
| Spoon + GumTree-Spoon | **rule mining / structural transformation comparator** |
| RefactoringMiner | **API/refactoring evolution evidence** |
| Mapping-IO | **mapping format normalization** |
| Tiny Remapper | **compiled remap lane/oracle** |
| SrgUtils + NeoForged AutoRenamingTool | **Forge/NeoForge mapping lane** |
| Srg2Source / Mercury / Lorenz | **source-remap comparators / selective reuse** |
| Ravel | **Kotlin/Mixin/AW mapping oracle / algorithm source** |
| Parchment | **pre-26.1 optional semantic enrichment** |
| MC Mod Porter | **permissioned code + migration-KB integration candidate** |
| Sinytra Connector/Adapter | **top-priority compatibility pattern corpus** |
| Launchpad / FFAPI / Forgified Loader | **Fabric->NeoForge semantic correspondence evidence** |
| Kilt/Twill | **Forge->Fabric inverse correspondence evidence** |
| Patchwork | **historical transformation corpus only** |
| Porting Lib | **semantic bridge corpus** |
| Forge Config API Port | **configuration semantic corpus** |
| MixinTransmogrifier / MixinExtras | **Mixin compatibility corpus** |
| NeoFormRuntime | **authoritative NeoForge target-universe component/reference** |
| Fabric Loom | **Fabric target build/test path** |
| ModDevGradle / NeoGradle | **NeoForge target build/test path** |
| ForgeGradle | **Forge target build path** |
| Unimined | **legacy/broad matrix fixture generator / alternate supported route** |
| Essential Gradle Toolkit / Essential Loom | **legacy + multi-version build challenger/reference** |
| ReplayMod preprocessor / Manifold preprocessor | **conditional one-source multi-version techniques** |
| Stonecutter | **primary one-tree multi-version output technique** |
| Stonecraft | **conditional output abstraction bakeoff** |
| Architectury / MultiLoader-Template | **common-source output comparators/patterns** |
| Forgix | **conditional merged-artifact output only with strict archive/runtime gates** |
| Revapi + japicmp | **API delta independent oracles** |
| JDK 25 Class-File API | **modern classfile primary-candidate for Java-25 lane** |
| ASM | **classfile authority/comparator and ecosystem fallback** |
| Vineflower | **primary decompiler** |
| CFR | **independent decompiler oracle** |
| Codebook + Unpick | **compiled normalization/constant-recovery bakeoff** |
| Byte Buddy | **conditional bytecode transformation** |
| Recaf | **investigation/QA comparator** |
| SootUp | **conditional hard-case call/data-flow analysis** |
| Gradle Tooling API | **structured build-model extraction** |
| Maven Resolver | **explicit artifact/dependency resolution helper** |
| Gradle locking + dependency verification | **generated-project reproducibility/security gate** |
| misode/mcmeta | **versioned data/resource diff corpus, independently verified where load-bearing** |
| Spyglass / vanilla-mcdoc | **version-aware JSON/NBT/CODEC schema validation and authoring intelligence** |
| MinecraftDev / Railroad IDE | **authoring/inspection/generator behavior corpora; selective reuse only** |
| minecraft-data | **secondary cross-version data oracle** |
| DataFixerUpper concepts | **persistent-data migration architecture** |
| Fabric Loader JUnit / Fabric GameTest / NeoForge Test Framework | **loader-native automated test layers** |
| HeadlessMC / MC-Runtime-Test | **CI/runtime comparator; not final promotion authority** |
| Enderloom native launcher/server | **final runtime promotion authority** |
| MFT + USN | **Windows high-performance local invalidation/indexing** |
| Everything IPC | **optional accelerator only** |
| SQLite/CAS | **canonical control/immutable storage baseline unless a measured specialized store wins** |
| redb/Fjall | **specialized conditional KV only** |
| packwiz / Ferium | **modpack/repair/import-export comparators; never canonical solver authority** |
| mod-publish-plugin / mc-publish / Minotaur | **optional secure release/publishing adapters** |
| ORT / ScanCode | **vendored-code license/provenance support** |
| ModForge | **high-priority mapping/migration differential oracle; integration candidate only after independent AoA/fixture proof** |
| Fabric Loom migration tasks | **Fabric-native source/Mixin/AW migration oracle** |
| NeoForged JarCompatibilityChecker | **compiled API/binary delta oracle beside Revapi/japicmp** |
| Paper Mâché / paperweight | **deterministic reconstruction/patch/build architecture corpus; conditional backend** |
| NeoForge InstallerTools | **JAR split/patch/inject/problems architecture corpus; selective reuse only** |
| Ornithe Feather/Calamus/nests/signatures/Ploceus | **legacy mapping/reconstruction/build lane where target versions require it** |
| Sinytra Launchpad / ConnectorExtras | **high-value Fabric->NeoForge metadata/lifecycle/API bridge corpus** |
| Crash Assistant / MixinTrace | **repair-signature + ownership/provenance corpus; independently verified rules only** |
| mc-server-test | **production-server CI breadth before final Enderloom runtime promotion** |
| spark / async-profiler / JFR-JMC | **Minecraft/JVM performance evidence lane** |
| ast-grep | **fast structural prefilter/rule-mining aid, never semantic authority** |
| Pakku / AutoModpack | **modpack dependency/update/managed-file UX and repair comparators** |
| minecraft-modding-mcp / modlens-mcp / similar analyzers | **secondary differential oracles/fixture generators only** |
| simdnbt / fastnbt / mca | **world/NBT repair bakeoff; conditional production module** |
| Minecraft Region Fixer / MCA Selector | **world-repair behavioral fixtures/reference only** |
| Gradle Profiler | **build-performance proof harness** |
| AppContainer / OS sandbox | **untrusted build execution boundary** |

A candidate does not enter production merely because it appears in this table. Its relevant bakeoff/acceptance task must pass.

---

# G060 — Exact execution order

- [ ] **G060 · GATE** — Implementation proceeds through dependency order without another planning-only cycle.

Execute in this order unless a direct dependency discovered in code requires a small local reorder:

1. **T134–T137** — freeze/recover current truth and baseline proof.
2. **T138–T143** — native Rust session/job/command path and JS parity.
3. **T144–T150** — canonical IR family.
4. **T151–T155** — version/mapping-era graph and mapping engines.
5. **T156–T161** — MC Mod Porter + learned rule store.
6. **T162–T167** — JVM semantic worker and replacement of regex authority.
7. **T168–T173** — classfile/decompiler/compiled artifact lane.
8. **T174–T176** — bidirectional loader capability graph.
9. **T177–T182** — build model, dependencies, target generation, multi-version output.
10. **T183–T186** — sandbox and supply-chain boundary before arbitrary real projects are executed.
11. **T187–T191** — data/resource/datagen/persistent-data migration.
12. **T192–T196** — generalized compile/repair loop.
13. **T197–T199** — packaged artifact audit.
14. **T200–T206** — real runtime proof.
15. **T207–T212** — incremental performance and cache hardening.
16. **T213–T216** — maintainable output/replay/reporting.
17. **T217–T222** — AoA production convergence.
18. **T223–T225** — adversarial/generalization challenge.
19. **T226–T229** — retire JS/duplicate engine paths.
20. **G059 + final gates** — reconcile technology dispositions and completion evidence.

**First vertical slice:** do not wait for all infrastructure before proving value. As soon as G041 + the minimum IR/version/rule/JVM worker pieces exist, convert one existing Northpoint fixture through the **native Rust -> JVM semantic worker -> generated target -> package audit -> native runtime** path. Harden that slice, then expand.

---

# G061 — Required test and proof commands/surfaces

- [ ] **G061 · GATE** — The repository has one predictable verification entrypoint for this conversion engine.

### T230 — Add native conversion QA command group

- [ ] **T230** — Provide a single developer/CI command that runs the conversion engine's deterministic unit/integration suite and reports machine-readable stage results.

It must include or invoke:

- Rust domain/state/session tests;
- JVM semantic worker tests;
- IR round-trip fixtures;
- mapping/version-edge tests;
- MC Mod Porter differential fixtures;
- Mixin/access/linkage fixtures;
- data/resource/datagen fixtures;
- package/archive integrity fixtures;
- resumability/cache invalidation;
- sandbox policy tests.

### T231 — Add runtime graduation command

- [ ] **T231** — Provide one slower explicit graduation command for real target builds/runtime proof.

It should run the smallest production-shaped matrix that proves:

- at least one Fabric mapped-era target;
- at least one Forge/NeoForge target;
- at least one 26.x unobfuscated target;
- applicable client/server runtime;
- packaged exact artifact hashes.

### T232 — Add AoA graduation command

- [ ] **T232** — Provide one command/session recipe to run the complete AoA convergence and clean-room replay without manual edits.

---

# G062 — Final challenge pass before completion

- [ ] **G062 · GATE** — A material regression/gap challenge has been performed after the implementation is otherwise green.

### T233 — Whole-spec acceptance rescan

- [ ] **T233** — Reconcile every T134–T232 and every parent gate.

Find and repair:

- unchecked or invalidated work;
- old JS still owning conversion logic;
- tests calling mocks instead of production wiring;
- compiled-but-runtime-broken targets;
- dropped content/resources;
- stale rules outside declared version bounds;
- mapping-era misrouting;
- unsafe build execution;
- archive/signature/MR/service damage;
- Kotlin metadata damage;
- cache reuse with stale inputs;
- false-positive semantic rules;
- performance wins caused by skipped work.

### T234 — Freshness refresh only where it matters

- [ ] **T234** — Refresh exact versions/licenses/current status of technologies actually selected for production before final lockfile/vendor decisions.

Do **not** restart broad ecosystem research. Search again only if a selected tool has become unsuitable or a concrete capability remains uncovered.

### T235 — Clean-room installation/replay

- [ ] **T235** — From a clean environment/cache state, rebuild Enderloom conversion components and replay the graduation fixtures with only documented/bootstrap dependencies.

### T236 — Artifact/provenance checkpoint

- [ ] **T236** — Checkpoint the completed implementation with:

- source commit;
- dependency locks;
- vendor/provenance manifest;
- fixture hashes;
- final benchmark results;
- runtime receipts;
- AoA receipt;
- known rejected/deferred candidates and why.

---

# G063 — CONVERSION STACK CONVERGENCE GATE

- [ ] **G063 · GATE** — Enderloom's next-generation conversion stack is fully implemented through one canonical production architecture; Rust owns the native hot paths and durable/integrity-sensitive orchestration where it wins, the JVM semantic worker owns type-aware Java/Kotlin transformation, retained JS/TS is limited to best-fit presentation/adaptation rather than duplicate conversion authority, mapping eras are handled correctly, MC Mod Porter knowledge is integrated under recorded permission/provenance, manifests/dependencies/access/Mixins/data/resources are represented losslessly, builds are target-native/reproducible/sandboxed, packaged artifacts pass exact linkage/archive checks, the exact SHA-256 artifacts pass applicable real client/server/runtime/persistence gates, AoA completes through the normal production path and clean-room replay with no manual source surgery or silent content loss, reusable failures are captured as regression-protected rules, and equivalent-work performance improves without reduced results.

---

# G064 — Frontend architecture and UI-performance convergence

- [ ] **G064 · GATE** — Enderloom uses the frontend architecture that delivers the best measured combination of responsiveness, memory use, browser integration, accessibility, maintainability and delivery speed; React/TypeScript may remain when it wins or ties the challengers, while heavy/domain-critical work stays behind typed native/JVM service boundaries.

### T237 — Benchmark the current React/TypeScript frontend against Rust UI challengers

- [ ] **T237** — Use the current **Tauri + React 19 + TypeScript + Vite** frontend as the baseline and compare it against **Tauri + Leptos** and **Dioxus Desktop** only on a production-shaped Enderloom vertical slice: Browse/search results, filters, project details, a download action, progress, settings persistence and one embedded-browser handoff.

Evaluation must include:

- first meaningful paint;
- input/filter latency on a large catalog;
- list virtualization;
- memory and CPU at idle and while scrolling;
- Rust/native API ergonomics;
- Tauri plugin/capability integration;
- WebView/browser-tab coexistence;
- accessibility/keyboard/focus behavior;
- build size and incremental compile time;
- Windows/Linux behavior;
- migration complexity from existing UI semantics.

**Default preference:** keep the existing React/TypeScript frontend unless a challenger produces a material equivalent-work improvement after ordinary frontend optimization (virtualization, render-boundary cleanup, batching, memoization, channel/IPC tuning, lazy enrichment). Promote Leptos, Dioxus, Slint or GPUI only when measured gains justify the migration cost and all product/browser/accessibility behavior is preserved.

### T238 — Freeze a typed frontend/domain contract

- [ ] **T238** — Define typed commands, responses, operation IDs, progress events and cancellation semantics shared by the selected frontend, Rust/native services, CLI and agent/control surfaces.

Rules:

- UI code never reaches SQLite/files/providers directly;
- UI controls call canonical domain actions;
- long-running actions return stable operation IDs;
- progress is machine-readable and resumable;
- stale responses cannot overwrite newer user intent;
- user-visible success follows committed domain state, not optimistic UI-only state.

### T239 — Use Tauri channels for high-throughput streams

- [ ] **T239** — Replace chatty high-volume JSON event patterns with typed/batched **Tauri channels** or equivalent streaming primitives for search result pages, download/install progress, log tails and conversion/runtime telemetry.

Measure message throughput, main-thread/UI latency and serialization overhead before/after. Keep ordinary low-frequency events simple.

### T240 — Prove one complete vertical slice before any broad frontend migration

- [ ] **T240** — Implement Browse -> search/filter -> project details -> install/download -> visible progress -> completed instance state through the selected frontend plus canonical native/domain path.

Do not begin a framework-wide rewrite until this slice proves that the rewrite is actually needed and beneficial in a real packaged build.

### T241 — Keep, optimize or migrate the frontend based on evidence

- [ ] **T241** — After T240, choose the smallest architecture change that achieves the performance/product targets:
  - retain and optimize React/TypeScript if it meets the gates;
  - migrate only demonstrated bottleneck surfaces if a hybrid approach is best; or
  - perform a broader Rust-UI migration only if the bakeoff proves material equivalent-work gains that justify it.

Preserve all accepted functionality, keyboard/focus behavior, drag/drop, context actions, browser navigation, downloads UI, settings and state persistence. Do not move logic between languages merely to satisfy an aesthetic stack preference.

### T333 — Current frontend toolchain bakeoff before framework rewrite

- [ ] **T333** — Before considering a broad UI framework migration, benchmark upgrading the existing frontend to current production baselines: **Vite 8.1/Rolldown**, current `@vitejs/plugin-react`/Oxc path, **React 19.3**, **TypeScript 6**, and the current high-performance **TanStack Virtual** release. Resolve deprecations/fallout forward and measure packaged startup, dev cold start, HMR, build time, Browse interaction latency, memory and frame stability.

Evaluate **React Compiler 1.0** only through its supported integration and keep it only when real Enderloom render workloads improve without behavior regressions. If upgraded TanStack Virtual still fails dynamic-card/100k-dataset gates, then compare alternatives such as Virtua.

### T334 — Typed Tauri IPC binding bakeoff

- [ ] **T334** — Bake off **tauri-specta** vs **Tyzen** (or a stronger maintained equivalent) for generated typed commands/events/channels shared between Rust and TS. Promote one only if it removes hand-maintained schema drift without adding fragile build/runtime coupling. Tauri bindgen/WIT remains research inspiration until its production maturity is sufficient.

---

# G065 — Tauri security, updater and native desktop QoL hardening

- [ ] **G065 · GATE** — The native shell follows least-privilege Tauri security, signed/recoverable updates, truthful single-instance/deep-link behavior and restart-persistent desktop state without reducing browser/app capability.

### T242 — Replace `csp: null` with a restrictive tested CSP

- [ ] **T242** — Audit every app-controlled WebView origin/resource need and replace the current `app.security.csp: null` with the narrowest Content Security Policy that preserves required functionality.

Include negative tests proving unapproved script/network/navigation sources are blocked. Keep third-party browsing in explicitly isolated browser WebViews rather than weakening the main app CSP globally.

### T243 — Apply least-privilege Tauri capabilities per window/WebView

- [ ] **T243** — Define explicit capability/permission scopes for the main shell, browser surfaces, dialogs, filesystem paths, updater, opener, clipboard and any future extension host.

No window receives a broad permission solely because another window needs it.

### T244 — Move to the official single-instance + deep-link + window-state path where it is stronger

- [ ] **T244** — Bake off/migrate to current official Tauri plugins for **single-instance**, **deep-link** and **window-state** behavior where they supersede current custom/community handling.

Required behavior:

- second launch focuses/activates the existing window and forwards valid intent;
- `enderloom://` or registered supported links can open the exact project/instance/action;
- invalid/deceptive links are rejected;
- size/position/maximized state survives restart and handles removed monitors safely.

### T245 — Add useful native notifications and global shortcuts only for real workflows

- [ ] **T245** — Add native notifications for completed/failed long operations (downloads, installs, conversions, updates) and optional global shortcuts only when they reduce real friction. Deduplicate notifications and make them configurable.

### T246 — Harden updater artifact generation, rollback and key handling

- [ ] **T246** — Audit the complete updater path, including the current `createUpdaterArtifacts: false` configuration, CI/release artifact generation, signature verification, platform packages, update manifests, failed-update recovery and key rotation/recovery procedure.

The updater must prove:

- exact signed artifact identity;
- downgrade/rollback policy;
- interrupted update recovery;
- no unsigned fallback;
- old known-good build retention or deterministic reinstall path.

Baking a **TUF-style metadata layer** around public release/update metadata is allowed only if the operational complexity yields measurable/meaningful rollback/freeze/mix-and-match protection beyond the mandatory Tauri signature layer.

### T335 — Packaged desktop end-to-end automation

- [ ] **T335** — Add official/current **WebdriverIO Tauri service / Tauri WebDriver** end-to-end coverage for the packaged desktop shell on supported CI platforms. Exercise real Browse/install/download/settings/update-recovery surfaces through the production IPC boundary; retain fast browser-mode tests for frontend-only cases but never let mocked IPC stand in for final packaged-app proof.

---

# G066 — Native catalog search, browse and cross-provider identity

- [ ] **G066 · GATE** — Browse/search/filter/sort are effectively instant on large catalogs while operating on the full logical result set and correctly reconciling the same project across providers.

### T247 — Build a native Tantivy catalog index for large searchable corpora

- [ ] **T247** — Implement/bake off **Tantivy** as the primary large-catalog full-text index for project names, aliases, authors, descriptions, tags, loader/version support and normalized provider metadata.

Requirements:

- incremental indexing;
- atomic generation/snapshot publication;
- deterministic schema migration/rebuild;
- cancellation of stale queries;
- no UI-thread indexing;
- query explanations/diagnostics sufficient for debugging false matches.

For smaller local/history tables, SQLite FTS5 remains acceptable; do not maintain two authorities for the same corpus.

### T248 — Layer Nucleo fuzzy matching over exact/full-text candidates

- [ ] **T248** — Use **nucleo-matcher** for typo-tolerant/fuzzy ranking and command-palette/local-name matching where fuzzy semantics improve discovery.

Do not let fuzzy score override exact provider IDs, exact slug matches or explicit filters.

### T249 — Use Roaring bitmaps for hot filter-set intersections when benchmarks justify them

- [ ] **T249** — Encode high-cardinality filter membership (loader, MC version, category, provider, installed/update state, compatibility flags) as **Roaring bitmaps** when it materially improves multi-filter intersections over SQL/Tantivy-only evaluation.

Preserve identical result counts/order semantics.

### T250 — Make cross-provider identity a first-class graph

- [ ] **T250** — Reconcile CurseForge, Modrinth, GitHub and other supported sources using stable IDs, canonical URLs, artifact hashes, repository identity, authorship and explicit aliases—not display names alone.

Every UI surface should know when one project has multiple provider homes and offer the appropriate source/version without creating duplicates.

### T251 — Define browse/search latency and completeness gates

- [ ] **T251** — Benchmark cold and warm:

- app-to-first-useful Browse results;
- keystroke-to-visible filtered results;
- full result completion;
- filter/sort changes;
- project-detail open;
- 1k/10k/100k record datasets where representative.

A faster result that searches fewer records or delays required providers fails this gate.

### T336 — SQLite FTS5 trigram vs Tantivy scope boundary

- [ ] **T336** — Benchmark **SQLite FTS5 trigram** for smaller/local substring search and identity lookup workloads before creating a second full-text authority. Keep Tantivy for large ranked/full-text corpora only where it materially outperforms SQLite while returning equivalent logical results. Persist one canonical project/provider identity model regardless of index backend.

---

# G067 — Dependency solving and durable task execution

- [ ] **G067 · GATE** — Installs/updates/conversions resolve dependency constraints correctly, explain conflicts usefully and survive app/process interruption without duplicate or corrupt work.

### T252 — Implement one Minecraft-specific solver abstraction and bake off Resolvo vs PubGrub

- [ ] **T252** — Model required/optional/recommended/incompatible dependencies, loader/MC/platform constraints, version ranges, provided/aliased capabilities, embedded libraries and user pins in one canonical solver input.

Bake off **Resolvo** vs **PubGrub** on real modpack/install conflict corpora. Promote the engine that provides the best combination of correctness, solution quality, useful conflict explanations and performance. Do not maintain parallel solver truth.

### T253 — Automatic dependency install/update must use the same solver

- [ ] **T253** — Browse install, instance repair, mod update and conversion dependency resolution all call the same solver/domain layer. Missing/outdated/incompatible dependencies should be detected before launch and remediated automatically when a valid source is available.

### T254 — Persist long-running jobs with exact resumable checkpoints

- [ ] **T254** — Audit the existing native task system against a durable queue model such as **Effectum**: persisted state, leases/ownership, retries/backoff, idempotency keys, checkpoints, restart recovery, cancellation, priorities and terminal receipts.

Reuse/upgrade the existing task layer if it meets or exceeds those semantics. Integrate Effectum only if it materially reduces custom complexity without sacrificing control.

### T255 — Prevent duplicate/racing mutations

- [ ] **T255** — Add operation deduplication/single-flight and resource-scoped mutation locks so two UI/agent/background actions cannot concurrently install/update/delete the same instance/mod/artifact.

### T337 — Durable queue bakeoff: existing task engine vs Effectum vs apalis-sqlite

- [ ] **T337** — Extend T254's durable-job comparison to include **apalis-sqlite**. Compare crash recovery, heartbeats/orphan reclamation, retries/backoff, priorities, delayed jobs, pipeline/DAG composition, cancellation semantics, idempotency, observability and SQLite contention under real download/install/convert workloads. Choose one canonical job engine or strengthen the existing one; never ship parallel queue authorities.

---

# G068 — Cache, CAS, archive and filesystem acceleration

- [ ] **G068 · GATE** — Hot-path caches and file operations measurably reduce latency/IO while canonical state, artifact identity and complete results remain unchanged.

### T256 — Use BLAKE3 for internal fingerprints; retain SHA-256 for external receipts

- [ ] **T256** — Benchmark **BLAKE3** for internal source-tree/cache/CAS/invalidation fingerprints where cryptographic interoperability with external systems is not required.

Published/download integrity and release/conversion receipts continue to use required upstream hashes and SHA-256. Never silently substitute BLAKE3 where a provider/protocol specifies another digest.

### T257 — Bake off rawzip for JAR/ZIP inventory hot paths

- [ ] **T257** — Compare **rawzip** against the current `zip` crate for central-directory scans, metadata extraction, nested-JAR discovery and large mod-folder inventory.

Acceptance includes malformed archives, Zip64, data descriptors, filename encodings, duplicate entries, nested JARs, signed JARs and multi-release JARs. Promote only with identical inventory/correctness plus a material performance win.

### T258 — Add role-specific in-memory caches instead of one generic cache

- [ ] **T258** — Bake off **QuickCache** vs **Moka** for bounded result/metadata/media lookup caching. Use TTL/weight/admission policies appropriate to each data type, expose hit/miss/eviction telemetry and prevent stale provider results from becoming canonical state.

### T259 — Use SCC/Papaya/ArcSwap only for measured shared-state roles

- [ ] **T259** — Where profiling shows lock contention or read-heavy snapshot pressure:

- evaluate **SCC** or **Papaya** for hot concurrent maps;
- use **ArcSwap** for atomic publication of immutable read-mostly configuration/index generations.

Do not introduce multiple concurrency libraries without a measured owner/use case.

### T260 — Keep Foyer conditional on a real hybrid-cache need

- [ ] **T260** — Evaluate **Foyer** only if the measured workload needs a coordinated memory+disk cache larger/more sophisticated than SQLite/CAS + bounded memory caches. Its adoption requires cross-platform durability/operability proof; otherwise reject it explicitly.

### T261 — Implement clone/link/copy strategy with safe fallbacks

- [ ] **T261** — For immutable artifacts and instance creation, attempt in order only where safe/supported:

1. verified reflink/block clone;
2. hardlink for immutable CAS objects where mutation isolation is guaranteed;
3. ordinary copy.

Never hardlink mutable instance files. Verify final size/hash identity.

### T262 — MFT/USN on Windows; `notify` as cross-platform watcher/fallback

- [ ] **T262** — Implement the previously researched NTFS MFT+USN fast path for large local Minecraft trees and use **notify** or platform-native watching as the cross-platform/fallback invalidation lane.

Handle journal resets, rename pairs, missed events and unsupported filesystems by reconciling against a complete scan rather than silently losing files.

### T263 — Keep FastCDC conditional on measured chunk/delta value

- [ ] **T263** — Evaluate **FastCDC** only for workloads that benefit from content-defined chunking (large pack snapshots, backup/delta transfer, dedupe). Do not add chunk-level complexity to ordinary small mod JAR handling without evidence.

### T338 — Archive decompression and cross-platform scan bakeoffs

- [ ] **T338** — Pair the `rawzip` structural parser bakeoff with **libdeflater** for full-buffer DEFLATE entry workloads where sizes are known, measuring real mod/JAR corpora against the current flate2 path. Promote only if end-to-end parse+decompress throughput/memory wins materially while preserving exact bytes/errors.

On non-NTFS or cold full scans, compare a parallel walker such as **jwalk** against the standard walk. Windows MFT/USN remains the preferred incremental fast path when valid.

---

# G069 — Network, download and media pipeline

- [ ] **G069 · GATE** — Provider/network/media work remains fast and resilient under slow, flaky, rate-limited and offline conditions without duplicated bandwidth or reduced content quality.

### T264 — Unify transport policy above reqwest/wreq/impit rather than replacing proven transports

- [ ] **T264** — Preserve the strongest existing transports and add one shared policy layer for:

- request identity/single-flight;
- provider concurrency limits;
- retry budgets with jitter and Retry-After respect;
- circuit breaker/provider health;
- conditional requests/ETags/Last-Modified;
- stale-while-revalidate for non-authoritative display metadata;
- mirror/provider hedging only when duplicated bandwidth is bounded;
- cancellation and priority;
- structured timings/errors.

No provider-specific retry loop may bypass the shared policy.

### T265 — Make downloads resumable and integrity-first

- [ ] **T265** — Support ranged resume/partial files where providers permit it, durable progress/checkpoints, atomic promotion after hash verification, corruption retry from a clean boundary and cleanup of abandoned partials.

### T266 — Bake off BITS for large Windows background transfers only

- [ ] **T266** — Evaluate Windows **BITS** as an optional backend for large, low-priority assets/update downloads that should survive app restart/reboot. Keep ordinary interactive metadata/small mod requests on the native HTTP stack.

### T267 — Do not replace DNS unless profiling proves DNS is a bottleneck

- [ ] **T267** — Keep the OS resolver by default. Evaluate **Hickory DNS**/DoH/DoQ only if measured provider latency/failure evidence points to resolver behavior and the privacy/enterprise-network implications are acceptable.

### T268 — Move thumbnail/media processing off the UI thread

- [ ] **T268** — Build a native media pipeline that decodes once, generates canonical sized thumbnails, caches by content/source identity and uses a SIMD resize bakeoff such as **fast_image_resize** when it materially improves equivalent-quality throughput.

The UI should receive display-ready assets/placeholders progressively rather than repeatedly decoding/resizing full originals.

### T339 — Platform TLS verification and enterprise-network correctness

- [ ] **T339** — Evaluate **rustls-platform-verifier** or the strongest maintained equivalent so provider/download traffic can honor OS certificate constraints, enterprise roots and revocation behavior where appropriate without loading an entire CA set into every process. Prove Windows/macOS/Linux behavior, proxy/enterprise compatibility and security semantics before replacing the current verifier path.

---

# G070 — Sandboxed extension/provider adapter platform

- [ ] **G070 · GATE** — Provider/site adapters and optional extensions can evolve independently without granting arbitrary native-code access or creating another private state architecture.

### T269 — Prototype a Wasmtime Component Model/WIT extension boundary

- [ ] **T269** — Define a versioned **WIT** capability contract for provider/site adapter operations such as search, project metadata, versions/files, dependencies, media, links and health diagnostics.

Host owns:

- network transport;
- auth/token access;
- filesystem access;
- cache/storage;
- logging;
- rate limits;
- timeouts/resource budgets;
- permissions.

Guest components receive only explicit capabilities.

### T270 — Bake off Extism as a convenience host, not as a second architecture

- [ ] **T270** — Evaluate **Extism** if it materially simplifies packaging/versioning/cross-language plugins while preserving the same WIT/capability/security model. Otherwise use Wasmtime directly.

### T271 — Signed extension manifests, compatibility and rollback

- [ ] **T271** — Every extension declares ID/version/ABI version/capabilities/providers/provenance/hash/signature. Host validates before load, supports safe disable/rollback and never auto-grants new permissions during update.

### T272 — Turn provider breakages into adapter regression fixtures

- [ ] **T272** — Capture sanitized provider responses/DOM/network contracts where lawful and convert every real breakage into an adapter-level deterministic fixture so fixes improve the platform instead of becoming one-off patches.

---

# G071 — Observability, crash recovery, profiling and supply-chain safety

- [ ] **G071 · GATE** — Production failures are diagnosable without guesswork, crashes preserve safe evidence, performance optimization is profile-driven and the Rust/JVM/vendored dependency chain has enforceable policy.

### T273 — Structured tracing with ETW on Windows

- [ ] **T273** — Standardize stable operation/stage IDs across search, download, install, launch, update and conversion. Feed Rust `tracing` into rotating local logs and **ETW** on Windows (via a proven tracing/ETW bridge) with equivalent platform logging elsewhere.

Never log secrets/tokens. Add one-click diagnostic export with redaction.

### T274 — Add external crash/minidump capture with privacy controls

- [ ] **T274** — Implement an out-of-process crash helper or equivalent robust mechanism that can capture Windows minidumps/native crash metadata for release builds without relying on the crashed process to finish cleanup.

Diagnostic bundle includes build ID, OS/GPU/runtime metadata, recent redacted logs and operation IDs. Upload is opt-in unless the product already has an explicit telemetry consent policy.

### T275 — Make performance work profiler-driven

- [ ] **T275** — Maintain repeatable macrobenchmarks and use **samply**, platform profilers and flamegraphs to identify actual bottlenecks before adopting specialized caches/parsers/runtime changes.

### T276 — Bake off PGO only against representative real workloads

- [ ] **T276** — Evaluate `cargo-pgo`/LLVM PGO for the release core after architecture/hot paths stabilize. Train on representative startup/search/browse/download/archive/launch/conversion workloads and promote only if equivalent-work wall-clock/CPU performance materially improves without pathological regressions on untrained paths.

### T277 — Enforce Rust dependency policy with cargo-deny/audit/vet

- [ ] **T277** — Add CI gates for:

- advisories/vulnerabilities;
- licenses;
- duplicate/banned crates;
- allowed registries/git sources;
- dependency provenance;
- explicit review of `build.rs`/proc-macro/native-code supply-chain risk.

Use **cargo-deny**, **cargo-audit** and **cargo-vet** (or demonstrably stronger current equivalents) as complementary controls rather than assuming one tool covers all three concerns.

### T278 — Produce a release SBOM/provenance manifest

- [ ] **T278** — Generate an SBOM/provenance record covering Rust crates, JVM libraries, bundled runtimes, vendored tools, extensions and directly integrated permitted upstream code. Include versions/hashes/licenses/source locations and the final artifact identity.

### T340 — Concrete crash monitor + async diagnostics

- [ ] **T340** — Bake off **minidumper** as the out-of-process Rust crash monitor for T274, preserving a tiny stable IPC/evidence contract and keeping sensitive state redacted. Add **tokio-console** only to development/diagnostic builds for async task/queue/lock stall analysis; it must not become always-on production overhead.

### T341 — Rust test-speed, coverage and mutation gates

- [ ] **T341** — Upgrade Rust verification throughput and quality with **cargo-nextest** for parallel/isolation-friendly test execution and **cargo-llvm-cov** for coverage reporting/thresholds. Use **cargo-mutants** selectively on critical solver/state/archive/security logic to detect weak tests rather than requiring mutation testing on every UI/helper crate.

These gates supplement real workflow/runtime proof; never game coverage/mutation scores with meaningless tests.

### T342 — Rust public API/dependency hygiene

- [ ] **T342** — Add **cargo-semver-checks** where Enderloom exposes stable Rust/plugin/SDK APIs, and use **cargo-machete** (plus `cargo metadata` verification) to remove genuinely unused dependencies. Use cargo-bloat or equivalent only to explain release-size/codegen hotspots, not as a mandate to remove useful capability.

### T343 — Release/SBOM/license tooling convergence

- [ ] **T343** — Bake off **Syft** as a cross-language/archive SBOM aggregator and **cargo-about** for Rust license notices. Evaluate **cargo-dist + cargo-auditable/cargo-cyclonedx** where they simplify reproducible native release provenance without fighting Tauri packaging. Existing ORT/ScanCode and cargo-deny/audit/vet remain complementary policy/provenance controls.

### T344 — Updater trust defense-in-depth is threat-model gated

- [ ] **T344** — Evaluate **TUF (`tough`)** and Sigstore verification only if Enderloom's update/distribution threat model benefits from rollback/freeze/delegation or keyless provenance beyond Tauri's mandatory signature verification. Do not introduce a second fragile updater control plane merely because the tooling exists.

### T345 — Developer build acceleration without changing product semantics

- [ ] **T345** — Bake off current **sccache** client-side/multilevel modes for Rust compilation and platform-appropriate fast linkers such as **Wild** where supported. Promote developer/CI acceleration only if builds remain reproducible/debuggable and platform fallbacks stay boring. This is iteration-speed work, not evidence of faster Enderloom runtime behavior.

---

# G072 — App-wide candidate convergence challenge

- [ ] **G072 · GATE** — Every app-wide candidate in this contract is either implemented with equivalent-work evidence or explicitly rejected after a production-shaped bakeoff; no research candidate enters production just because it is newer or benchmark-friendly.

### T279 — Candidate promotion matrix

- [ ] **T279** — Use this disposition unless new measured evidence changes it:

| Candidate | Role | Starting disposition |
|---|---|---|
| Current Tauri + React 19 + TypeScript + Vite | production frontend baseline | **KEEP UNLESS A CHALLENGER PROVES MATERIAL BENEFIT** |
| Tauri + Leptos | Rust-authored UI challenger | **BAKEOFF / CONDITIONAL** |
| Dioxus Desktop | alternate Rust UI challenger | **BAKEOFF / CONDITIONAL** |
| Slint / GPUI | native UI alternatives | **REFERENCE / CONDITIONAL** |
| Tauri CSP + capabilities | shell security | **IMPLEMENT NOW** |
| Tauri channels | high-volume IPC | **IMPLEMENT NOW WHERE HOT** |
| official single-instance/deep-link/window-state | desktop QoL | **BAKEOFF / LIKELY PROMOTE** |
| Tantivy | large full-text index | **BAKEOFF / LIKELY PROMOTE** |
| Nucleo | fuzzy ranking | **BAKEOFF / LIKELY PROMOTE** |
| Roaring | filter intersections | **CONDITIONAL ON BENCHMARK** |
| Resolvo / PubGrub | dependency solver | **BAKEOFF NOW; CHOOSE ONE** |
| QuickCache / Moka | memory cache | **BAKEOFF; CHOOSE BY ROLE** |
| SCC / Papaya / ArcSwap | concurrent shared state | **PROFILE-GATED** |
| Foyer | hybrid cache | **DEFER UNLESS MEASURED NEED** |
| BLAKE3 internal fingerprints | cache/CAS identity | **BAKEOFF / LIKELY PROMOTE** |
| rawzip | JAR/ZIP inventory | **BAKEOFF NOW** |
| FastCDC | chunk dedupe/deltas | **CONDITIONAL** |
| Wasmtime Component Model | sandboxed extension host | **PROTOTYPE / LIKELY PROMOTE** |
| Extism | plugin-host convenience | **BAKEOFF** |
| Effectum | durable job queue | **REFERENCE / BAKEOFF AGAINST EXISTING TASKS** |
| BITS | Windows background transfers | **OPTIONAL** |
| fast_image_resize | thumbnail hot path | **BAKEOFF** |
| tracing -> ETW | Windows diagnostics | **IMPLEMENT/BAKEOFF NOW** |
| minidump helper | native crash evidence | **IMPLEMENT WITH PRIVACY GATE** |
| cargo-pgo | release optimization | **PROFILE-GATED** |
| cargo-deny/audit/vet | Rust supply chain | **IMPLEMENT NOW** |
| TUF metadata | updater defense-in-depth | **CONDITIONAL OPERATIONAL BAKEOFF** |
| Spyglass / vanilla-mcdoc | schema-aware Minecraft data validation | **IMPLEMENT AS AUTHORING/REPAIR INTELLIGENCE** |
| MinecraftDev / Railroad | authoring UX/inspection corpora | **REFERENCE / SELECTIVE ADOPTION** |
| Essential Gradle Toolkit / Essential Loom | legacy multi-version build lane | **BAKEOFF / CONDITIONAL** |
| ReplayMod / Manifold preprocessors | one-source conditional compilation | **BAKEOFF / CONDITIONAL** |
| packwiz / Ferium | modpack repair/import-export comparators | **REFERENCE / SELECTIVE ADOPTION** |
| Vite 8.1 / current React plugin | frontend build/toolchain | **UPGRADE BAKEOFF FIRST** |
| React 19.3 / React Compiler 1.0 | existing frontend optimization | **UPGRADE/MEASURE BEFORE REWRITE** |
| TypeScript 6 | frontend/tooling baseline | **UPGRADE WITH DEPRECATION/CORRECTNESS GATE** |
| current TanStack Virtual | large-list baseline | **UPGRADE/MEASURE FIRST; VIRTUA ONLY IF NEEDED** |
| tauri-specta / Tyzen | typed Rust<->TS IPC generation | **BAKEOFF; CHOOSE AT MOST ONE** |
| WebdriverIO Tauri service | packaged desktop E2E | **IMPLEMENT FOR CRITICAL FLOWS** |
| apalis-sqlite | durable job queue challenger | **BAKEOFF VS EFFECTUM/EXISTING ENGINE** |
| SQLite FTS5 trigram | small/local substring index | **BAKEOFF BEFORE ADDITIONAL INDEX AUTHORITY** |
| libdeflater | JAR full-buffer DEFLATE hot path | **PROFILE-GATED BAKEOFF WITH RAWZIP** |
| jwalk | cross-platform full filesystem scan | **CONDITIONAL FALLBACK BAKEOFF** |
| rustls-platform-verifier | TLS/platform trust integration | **BAKEOFF / LIKELY PROMOTE IF ENTERPRISE-CORRECT** |
| minidumper | external Rust crash monitor | **BAKEOFF / LIKELY PROMOTE** |
| tokio-console | async runtime diagnostics | **DEV/DIAGNOSTIC ONLY** |
| cargo-nextest / cargo-llvm-cov | Rust test speed + coverage | **IMPLEMENT WHERE COMPATIBLE** |
| cargo-mutants | critical logic mutation testing | **SELECTIVE QUALITY GATE** |
| cargo-semver-checks / cargo-machete | API/dependency hygiene | **IMPLEMENT WHERE APPLICABLE** |
| Syft / cargo-about / cargo-dist | SBOM/license/release tooling | **BAKEOFF / SELECTIVE PROMOTION** |
| TUF tough / Sigstore | updater/artifact trust defense | **THREAT-MODEL CONDITIONAL** |
| sccache / fast linker | developer/CI build acceleration | **BAKEOFF; NOT RUNTIME PERFORMANCE CLAIM** |
| mod-publish-plugin / mc-publish | release automation | **OPTIONAL AUTHORIZED ADAPTER** |


### T280 — Negative integration challenge

- [ ] **T280** — Before promoting app-wide changes, prove they do not introduce:

- a second canonical database/index authority;
- duplicate dependency-solvers;
- stale caches overriding provider truth;
- unbounded memory/index growth;
- WebView permission broadening;
- UI feature/accessibility loss;
- duplicate bandwidth from hedging;
- unsafe hardlink/reflink mutation aliasing;
- extension permission escalation;
- crash-report secret leakage;
- updater downgrade/unsigned paths;
- performance wins caused by smaller result sets or skipped validation.

### T281 — Final research frontier freeze

- [ ] **T281** — Stop broad technology searching once this handoff is accepted and implementation begins. Resume ecosystem research only when implementation exposes a named missing capability, a selected project becomes unsuitable/deprecated, a new Minecraft/loader/platform generation invalidates an assumption or a measured comparator beats the current baseline materially.

---

# G073 — Combined implementation order

- [ ] **G073 · GATE** — Execute the full contract depth-first without turning this new app-wide work into a second disconnected roadmap.

### T282 — Required dependency-aware execution order

- [ ] **T282** — Execute in this order, parallelizing only independent work after shared contracts settle:

1. **T134-T137 / G040** — resolve the authoritative repository, Dev Kit, AoA source/checkpoint, toolchains and preservation baseline.
2. **T138-T216 / G041-G055** — make the conversion engine production-ready first: canonical orchestration, IR, mapping eras, MC Mod Porter/learned rules, JVM semantic worker, compiled-artifact lane, loader translation, build/dependency generation, sandboxing, data/resources, repair loop, package/runtime proof, caching and deterministic replay.
3. **T284-T288 / G075** — converge the shared convert/repair/create capability contract, automatic toolchain closure, immutable workspace/evidence model and common command surface.
4. **T289-T296 / G076** — finish production repair capability and its graduation fixtures.
5. **T297-T307 / G077** — finish production mod-making/authoring capability and its graduation project, including schema-aware content tools and loader-native tests.
6. **T230-T232 / G061 prerequisites** — ensure deterministic conversion QA, runtime graduation and AoA graduation commands exist before the real AoA run.
7. **T217-T222 / G056** — finish Advent of Ascension completely through the normal production conversion path and clean-room replay. Do not move broad app modernization ahead of this milestone.
8. **T308-T312 / G078** — promote AoA-derived knowledge/performance fixes back into conversion, repair and authoring; rerun affected capability graduation and unlock broader app work.
9. **T223-T229 + T233-T236 / G057-G063** — adversarially prove the capability stack is generalized, retire redundant authority only after parity, run clean-room/provenance convergence and close the conversion-stack gate.
10. **T237-T281 / G064-G072** — execute the rest of the app modernization using the now-proven AoA-scale task/evidence/rule infrastructure: frontend/IPC/security, search/identity, solver/tasks, cache/filesystem/network/media, extension platform, diagnostics, crash evidence and supply chain.
11. **T283 + G074** — whole-app clean-room convergence and final completion.

**Execution lock:** steps 10-11 do not become the main workstream before steps 1-9 have converged. Small app/core changes required to make conversion/repair/authoring/AoA work are allowed and should be implemented immediately, but unrelated Browse/UI/performance modernization must not displace AoA-first completion.

---

# G074 — FINAL APP + CONVERSION COMPLETION GATE

### T283 — Whole-app clean-room challenge

- [ ] **T283** — From a clean supported machine/environment, install/build/package the current Enderloom candidate and exercise, using production wiring:

- first launch and persisted window/settings state;
- login/account reuse where configured;
- Browse/search/filter/project-detail flow;
- cross-provider identity on known shared projects;
- mod install with automatic dependency resolution;
- interrupted/resumed download;
- instance launch;
- restart and task recovery;
- updater check using signed metadata/artifacts;
- one provider/extension failure and recovery path;
- conversion vertical slice;
- conversion repair graduation path;
- mod-making/authoring graduation project;
- AoA graduation/receipt path;
- diagnostic bundle generation;
- benchmark corpus proving no result-count/content/fidelity regression.

- [ ] **G074 · FINAL COMPLETION GATE** — Every accepted task and parent gate in this document is complete with observed proof; Enderloom uses the best-performing/most-reliable architecture for each workload rather than enforcing a language purge; retained JS/TS/React is demonstrably not a hot-path or integrity bottleneck and does not duplicate canonical domain truth; Rust/native/JVM layers own the workloads where they materially win; Tauri/WebView permissions are least-privilege; Browse/search and filters are fast over the complete logical dataset; cross-provider identity converges; installs/updates use one correct dependency solver; long jobs/downloads resume safely; caches/CAS/archive/filesystem/network/media accelerations preserve exact results; extensions/providers execute behind a capability-bounded sandbox where adopted; diagnostics/crash/supply-chain/update paths are production-safe; conversion, repair and mod-making/authoring capabilities are production-ready through shared primitives; AoA was completed before broad modernization and all generalized AoA lessons were promoted/reverified across those capabilities; the full semantic conversion stack and AoA clean-room graduation pass; exact final artifacts are hashed and packaged; no blocker is relabeled success; and no performance, security or migration improvement was achieved by silently dropping user-visible capability, content, fidelity, compatibility or validation.

---

# Canonical evidence / upstream references from the completed research

Refresh exact commits/releases when integrating; these links are implementation evidence, not authority over this execution contract.

## App-wide native architecture and performance

- Tauri Rust frontend templates — https://v2.tauri.app/start/create-project/
- Tauri security/CSP — https://v2.tauri.app/security/csp/
- Tauri capabilities — https://v2.tauri.app/security/capabilities/
- Tauri channels/inter-process communication — https://v2.tauri.app/develop/calling-frontend/
- Tauri updater — https://v2.tauri.app/plugin/updater/
- Tauri plugins — https://v2.tauri.app/plugin/
- Leptos — https://github.com/leptos-rs/leptos
- Dioxus — https://github.com/DioxusLabs/dioxus
- Tantivy — https://github.com/quickwit-oss/tantivy
- Nucleo — https://github.com/helix-editor/nucleo
- RoaringBitmap Rust — https://github.com/RoaringBitmap/roaring-rs
- Resolvo — https://github.com/prefix-dev/resolvo
- PubGrub — https://github.com/pubgrub-rs/pubgrub
- QuickCache — https://github.com/arthurprs/quick-cache
- Moka — https://github.com/moka-rs/moka
- SCC — https://github.com/wvwwvwwv/scalable-concurrent-containers
- Papaya — https://github.com/ibraheemdev/papaya
- ArcSwap — https://github.com/vorner/arc-swap
- Foyer — https://github.com/foyer-rs/foyer
- BLAKE3 — https://github.com/BLAKE3-team/BLAKE3
- rawzip — https://github.com/nickbabcock/rawzip
- FastCDC — https://github.com/nlfiedler/fastcdc-rs
- notify — https://github.com/notify-rs/notify
- Wasmtime — https://github.com/bytecodealliance/wasmtime
- Extism — https://github.com/extism/extism
- Effectum — https://github.com/0x676e67/effectum
- Hickory DNS — https://github.com/hickory-dns/hickory-dns
- fast_image_resize — https://github.com/Cykooz/fast_image_resize
- tracing-etw — https://github.com/microsoft/tracing-etw
- rust_win_etw — https://github.com/microsoft/rust_win_etw
- minidump-writer — https://github.com/rust-minidump/minidump-writer
- samply — https://github.com/mstange/samply
- cargo-pgo — https://github.com/Kobzol/cargo-pgo
- cargo-deny — https://github.com/EmbarkStudios/cargo-deny
- cargo-audit — https://github.com/rustsec/rustsec/tree/main/cargo-audit
- cargo-vet — https://github.com/mozilla/cargo-vet
- The Update Framework — https://theupdateframework.io/

## Semantic/source/API intelligence

- OpenRewrite — https://github.com/openrewrite/rewrite
- Spoon — https://github.com/INRIA/spoon
- GumTree-Spoon — https://github.com/SpoonLabs/gumtree-spoon-ast-diff
- RefactoringMiner — https://github.com/tsantalis/RefactoringMiner
- Eclipse JDT LS — https://github.com/eclipse-jdtls/eclipse.jdt.ls
- Revapi — https://github.com/revapi/revapi
- japicmp — https://github.com/siom79/japicmp

## Mappings / remap / compiled normalization

- Fabric Mapping-IO — https://github.com/FabricMC/mapping-io
- Tiny Remapper — https://github.com/FabricMC/tiny-remapper
- Fabric Intermediary — https://github.com/FabricMC/intermediary
- Enigma — https://github.com/FabricMC/Enigma
- Stitch — https://github.com/FabricMC/stitch
- MinecraftForge Srg2Source — https://github.com/MinecraftForge/Srg2Source
- MinecraftForge SrgUtils — https://github.com/MinecraftForge/SrgUtils
- NeoForged AutoRenamingTool — https://github.com/neoforged/AutoRenamingTool
- Cadix Mercury — https://github.com/CadixDev/Mercury
- Cadix Lorenz — https://github.com/CadixDev/Lorenz
- Ravel — https://github.com/badasintended/ravel
- Parchment — https://github.com/ParchmentMC/Parchment
- PaperMC Codebook — https://github.com/PaperMC/codebook
- PaperMC Unpick definitions — https://github.com/PaperMC/unpick-definitions
- Vineflower — https://github.com/Vineflower/vineflower
- Recaf — https://github.com/Col-E/Recaf
- Byte Buddy — https://github.com/raphw/byte-buddy
- SootUp — https://github.com/soot-oss/SootUp

## Porting / loader compatibility

- reqsery MC Mod Porter — https://github.com/reqsery/mc-mod-porter
- Sinytra Connector — https://github.com/Sinytra/Connector
- Sinytra Adapter — https://github.com/Sinytra/Adapter
- Sinytra Launchpad — https://github.com/Sinytra/Launchpad
- Forgified Fabric API — https://github.com/Sinytra/ForgifiedFabricAPI
- Forgified Fabric Loader — https://github.com/Sinytra/ForgifiedFabricLoader
- MixinTransmogrifier — https://github.com/Sinytra/MixinTransmogrifier
- MixinExtras — https://github.com/LlamaLad7/MixinExtras
- Porting Lib — https://github.com/Fabricators-of-Create/Porting-Lib
- Kilt — https://github.com/KiltMC/Kilt
- Patchwork Patcher — https://github.com/PatchworkMC/patchwork-patcher
- Patchwork API — https://github.com/PatchworkMC/patchwork-api
- Forge Config API Port — https://github.com/Fuzss/forge-config-api-port

## Target/build/workspace

- NeoFormRuntime — https://github.com/neoforged/NeoFormRuntime
- ModDevGradle — https://github.com/neoforged/ModDevGradle
- Architectury Loom — https://github.com/architectury/architectury-loom
- Unimined — https://github.com/unimined/unimined
- Stonecutter — https://stonecutter.kikugie.dev/
- Stonecraft — https://github.com/meza/Stonecraft
- OpenShock Integrations.Minecraft — https://github.com/OpenShock/Integrations.Minecraft
- TheMightyArchitectury — https://github.com/TimStewartJ/TheMightyArchitectury
- MultiLoader-Template — https://github.com/jaredlll08/MultiLoader-Template
- Forgix — https://github.com/PacifistMC/Forgix
- Gradle Configuration Cache — https://docs.gradle.org/current/userguide/configuration_cache.html
- Apache Maven Resolver — https://github.com/apache/maven-resolver

## Runtime/data

- HeadlessMC — https://github.com/headlesshq/headlessmc
- MC-Runtime-Test — https://github.com/headlesshq/mc-runtime-test
- MinecraftDev — https://github.com/minecraft-dev/MinecraftDev
- misode/mcmeta — https://github.com/misode/mcmeta
- PrismarineJS minecraft-data — https://github.com/PrismarineJS/minecraft-data
- Mojang DataFixerUpper — https://github.com/Mojang/DataFixerUpper

## Repair / authoring / multi-version capability references

- Essential Gradle Toolkit — https://github.com/SparkUniverse/essential-gradle-toolkit
- Essential Loom (legacy Forge-capable Architectury Loom fork) — https://github.com/SparkUniverse/architectury-loom
- ReplayMod Java/Kotlin preprocessor — https://github.com/ReplayMod/preprocessor
- Manifold Java Preprocessor — https://github.com/manifold-systems/manifold/tree/master/manifold-deps-parent/manifold-preprocessor
- Minecraft Development IntelliJ plugin — https://github.com/minecraft-dev/MinecraftDev
- Railroad IDE — https://github.com/Railroad-Team/Railroad
- Spyglass — https://github.com/SpyglassMC/Spyglass
- vanilla-mcdoc — https://github.com/SpyglassMC/vanilla-mcdoc
- Fabric automatic testing / Fabric Loader JUnit + GameTest — https://github.com/FabricMC/fabric-docs/blob/main/versions/26.1.2/develop/automatic-testing.md
- NeoForge Test Framework — https://github.com/neoforged/NeoForge/blob/26.3.x/docs/TESTFRAMEWORK.md
- packwiz — https://github.com/packwiz/packwiz
- Ferium — https://github.com/gorilla-devs/ferium
- Mod Publish Plugin — https://github.com/modmuss50/mod-publish-plugin
- mc-publish — https://github.com/Kira-NT/mc-publish
- Modrinth Minotaur — https://github.com/modrinth/minotaur

## Supply-chain / provenance

- OSS Review Toolkit — https://github.com/oss-review-toolkit/ort
- ScanCode Toolkit — https://github.com/aboutcode-org/scancode-toolkit

---

## Additional implementation/reference authorities

- ModForge — https://github.com/champmk/modforge
- NeoForged JarCompatibilityChecker — https://github.com/neoforged/JarCompatibilityChecker
- NeoForged InstallerTools — https://github.com/neoforged/InstallerTools
- NeoForged AccessTransformers — https://github.com/neoforged/AccessTransformers
- PaperMC Mâché — https://github.com/PaperMC/mache
- PaperMC paperweight — https://github.com/PaperMC/paperweight
- Ravel — https://github.com/badasintended/ravel
- Sinytra Launchpad — https://github.com/Sinytra/Launchpad
- Sinytra ConnectorExtras — https://github.com/Sinytra/ConnectorExtras
- Porting Lib — https://github.com/Fabricators-of-Create/Porting-Lib
- Ornithe Feather — https://github.com/OrnitheMC/feather
- Ornithe Calamus — https://github.com/OrnitheMC/calamus
- Ornithe Ploceus — https://github.com/OrnitheMC/ploceus
- Crash Assistant — https://github.com/KostromDan/Crash-Assistant
- MixinTrace — https://github.com/comp500/mixintrace
- MC-Server-Test — https://github.com/headlesshq/mc-server-test
- spark — https://github.com/lucko/spark
- async-profiler — https://github.com/async-profiler/async-profiler
- ast-grep — https://github.com/ast-grep/ast-grep
- Pakku — https://github.com/juraj-hrivnak/Pakku
- simdnbt — https://github.com/azalea-rs/simdnbt
- Minecraft Region Fixer — https://github.com/Fenixin/Minecraft-Region-Fixer
- MCA Selector — https://github.com/Querz/mcaselector
- Gradle Profiler — https://github.com/gradle/gradle-profiler
- apalis-sqlite — https://github.com/apalis-dev/apalis-sqlite
- cargo-nextest — https://github.com/nextest-rs/nextest
- cargo-llvm-cov — https://github.com/taiki-e/cargo-llvm-cov
- cargo-mutants — https://github.com/sourcefrog/cargo-mutants
- cargo-semver-checks — https://github.com/obi1kenobi/cargo-semver-checks
- cargo-machete — https://github.com/bnjbvr/cargo-machete
- rustls-platform-verifier — https://github.com/rustls/rustls-platform-verifier
- libdeflater — https://github.com/ebiggers/libdeflate
- sccache — https://github.com/mozilla/sccache
- Wild linker — https://github.com/wild-linker/wild

---

# Exact first action for the implementing agent

**Start with T134-T137 and recover the exact current AoA/Dev Kit authority. Then make the Minecraft capability stack ready before touching unrelated app modernization: execute every task in G041-G055, G075, G076 and G077 (including newly accepted oracle/repair/legacy/runtime tasks and T230-T232) so conversion/repair/authoring and their graduation commands are real production paths. Immediately run G056 and finish AoA completely; every failure must improve the shared engine and become regression knowledge. Complete G078 so AoA-derived fixes are promoted back into conversion, repair and mod-making and reverified. Only then proceed through the broader app gates G064-G072 using those proven primitives and AoA-scale lessons. Keep React/TypeScript/JS wherever it remains the best measured fit; move work to Rust/JVM/native only where it materially improves speed, responsiveness, correctness, resilience, security or maintainability without feature loss. Follow T282 exactly and do not return to planning-only work.**
