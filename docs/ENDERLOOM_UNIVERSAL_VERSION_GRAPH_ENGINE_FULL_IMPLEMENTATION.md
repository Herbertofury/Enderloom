# Enderloom Universal Version Graph Engine - Full Implementation Contract

**Status:** EXECUTE NOW / IMPLEMENTATION-READY  
**Date:** 2026-09-30  
**Repository:** `Herbertofury/Enderloom`  
**Companion contract:** `docs/ENDERLOOM_NEXT_GEN_TECH_STACK_FULL_IMPLEMENTATION.md`  
**Scope owner:** Create + Convert + Repair + Port multi-version/multi-loader behavior  
**Important distinction:** this is a Stonecutter-like product architecture, not a requirement to make Stonecutter itself the canonical engine.

---

## Objective

Implement one Enderloom-owned version-family engine so a Minecraft mod is treated as one semantic project that can be created, converted, repaired, ported, built, tested, and maintained across many Minecraft versions and loaders without forking into unrelated projects.

The engine must preserve the strongest proven behavior of Enderloom's current multiversion worker while generalizing it beyond a Stonecutter-specific workspace. A common change should flow to every compatible target. A loader-specific change should flow to that loader family. A version-specific exception should remain isolated to the exact affected version family. A target-only failure must not invalidate intact sibling cells. Adding a target must not rebuild or rewrite unchanged targets. Restarting the app or agent must resume from verified content-addressed state.

Enderloom owns the canonical version graph, semantic project model, transform rules, provenance, dependency/toolchain profiles, incremental invalidation graph, evidence, receipts, and repair learning. Stonecutter, Stonecraft, loader-native Gradle plugins, remappers, semantic refactoring tools, decompilers, compatibility bridges, and other tools are adapters, specialists, challengers, or differential oracles behind that canonical model.

This contract must be executable directly by Codex or another coding agent. Do not reduce it to a planning document.

---

## Context - current repository truth to preserve

The current repository already proves important multiversion behavior. Do not restart from a greenfield design and do not discard the existing worker before replacement parity is demonstrated.

Verified current baseline at the time this contract was written:

- `docs/ENDERLOOM_NEXT_GEN_TECH_STACK_FULL_IMPLEMENTATION.md`
  - current blob: `13c377d40aef750d116976590c937eafb14fd671`
  - current latest known document commit: `89b15168af342824911c5919cb8b25da6e30a5a7`
- `tools/minecraft-dev-kit/scripts/devkit_multiversion.py`
  - current blob: `1cb3c9b3a8b53231bf82e35272558b829010b542`
  - currently pins real Stonecutter `0.9.8` and outer Gradle `9.6.0`
- `tools/minecraft-dev-kit/scripts/devkit_multiversion_selftest.py`
  - current blob: `5dd11baaaf1be15cebde11e629fa0a53ea5b6ed2`
- `.github/workflows/devkit-stonecutter-ci.yml`
  - current blob: `bec401e177171b59a7f23be19a39694467302cd1`
- `docs/northpoint/minecraft-version-profiles.json`
  - current blob: `c203c9ba30882d3971da4fbeb9a640440e3481e0`
- `docs/northpoint/ENDERLOOM_CONVERSION_ENGINE_CONTRACT.json`
  - current blob: `df3b17b48ab6f0532ac6408716d5f1c077df33b3`

The current multiversion worker already demonstrates behavior that is now a preservation floor:

- source variants are factored into common source plus exact target overlays;
- real Stonecutter preprocessing can drive native target builds;
- each target retains its own native Gradle/plugin/dependency/mapping setup;
- common edits propagate to sibling targets;
- target-specific failures remain isolated;
- unchanged targets are reused rather than rebuilt;
- adding a target preserves existing shared edits and prior proofs;
- user-edited generated coordinator files are not silently overwritten;
- source input is immutable;
- secret-bearing files are rejected from portable export;
- path traversal, case collisions, and unsafe workspace paths are rejected;
- produced packages include evidence and checksums;
- CI exercises real multiversion behavior on Windows and Linux;
- the Aoba lane already proves that normal conversion can export a reusable multiversion project and later run a real target through native Minecraft verification.

The job is to turn that proven seed into the normal Enderloom architecture for every Create / Convert / Repair / Port workflow.

---

## Non-negotiable constraints

1. **Enderloom owns the model.**
   - Stonecutter is not the source of truth.
   - A Gradle plugin, mapping format, decompiler, source transformer, or compatibility bridge must never become canonical project state.
   - Every external tool feeds or consumes Enderloom's typed models and evidence.

2. **One semantic project, many target cells.**
   - Do not create unrelated per-version repositories as the normal workflow.
   - A target cell is a projection of one semantic project plus explicit scoped adapters/overrides.
   - Generated target source is output, not the master source of truth.

3. **Fix at the highest safe ownership layer.**
   - Shared bug -> fix shared semantic/common layer.
   - Loader-family bug -> fix loader adapter.
   - Version-family bug -> fix version adapter.
   - Exact cell bug -> cell override only when truly irreducible.
   - Project-specific semantic bug -> project rule/override with provenance.
   - Never copy the same fix into many cells when a higher owner can express it once.

4. **No content-loss success.**
   - A build is not allowed to pass by dropping registrations, resources, recipes, data, entities, worldgen, networking, Mixins, access rules, configs, metadata, Kotlin metadata, nested JARs, datagen, or behavior.
   - Unknown/unresolved stays explicit and keeps the affected cell incomplete.

5. **Native target builds remain native.**
   - Fabric Loom, NeoForge ModDevGradle, ForgeGradle, Quilt-native tooling, or another target-native build path remains authoritative for that target's actual build/runtime behavior.
   - Do not invent one universal dependency/plugin version across incompatible target cells.

6. **No cumulative port drift.**
   - Do not port 1.20.1 -> 1.21.1 -> 26.3 by repeatedly mutating generated source until semantics drift.
   - Use the canonical semantic project and version graph as the stable base.
   - Neighboring proven cells may provide evidence, diffs, donor behavior, or a migration path, but every target projection remains traceable to canonical semantic intent.

7. **Performance and completeness are simultaneous requirements.**
   - Incremental work must be materially faster than rebuilding everything.
   - Speed cannot come from skipping validation, reducing target coverage, weakening proof, or silently ignoring difficult content.

8. **Every named tool receives an explicit disposition.**
   - Integrate useful behavior as one of: `native adapter`, `embedded/ported algorithm`, `differential oracle`, `imported knowledge/rule source`, or `reference-only with written reason`.
   - Do not silently omit a previously accepted useful tool just because another tool overlaps it.
   - Do not create redundant runtime dependencies when a small stable algorithm can be safely ported behind Enderloom's own contract.

9. **Repair must improve future ports.**
   - A generalized repair becomes a version/loader/semantic rule plus fixtures and proof.
   - Manual one-off surgery remains a defect until proven irreducibly project-specific.

10. **Real runtime proof beats build proof.**
    - Compilation, remap success, generated source, and archive validity are intermediate evidence.
    - Applicable client/server/integrated-server/restart behavior must use the exact packaged artifact.

---

## Done when

This contract is complete only when the production Enderloom path can do all of the following through the same canonical engine:

1. Create a new mod as one semantic project and emit/build multiple configured version/loader cells.
2. Convert an existing single-version source project into the canonical project and add multiple cells without maintaining unrelated forks.
3. Import an existing multiversion project, including Stonecutter-style layouts where present, without flattening away legitimate target differences.
4. Repair a defect once at the highest valid ownership layer and propagate the fix to exactly the affected cells.
5. Add a new target version/loader as a graph operation rather than a rewrite/restart.
6. Reuse unchanged analysis/build/runtime evidence after restart.
7. Explain why every target differs from the common semantic project.
8. Prove that target projections preserve all source-owned files/content unless an explicit evidence-backed transformation changes them.
9. Build each target using its real target-native toolchain and dependency graph.
10. Validate mapping, symbols, metadata, Mixins/access rules, content parity, packaged linkage, runtime behavior, and persistence as applicable.
11. Promote generalized successful fixes into reusable version/loader migration knowledge.
12. Keep Stonecutter optional: a project can use a Stonecutter export/backend without Enderloom depending on Stonecutter as canonical state.
13. Migrate the existing `devkit_multiversion.py` behavior into the new production path with no regression before legacy authority is retired.
14. Pass clean-room replay on representative Create, Convert, Repair, and Port fixtures with no hand edits to generated target output.
15. Demonstrate the same architecture on the active AoA conversion rather than creating an AoA-only bypass.

---

# Architecture target

```text
ENDERLOOM UI / CLI / AGENT
        |
        v
UNIVERSAL VERSION FAMILY SERVICE
  - VersionGraph
  - SemanticProject
  - TargetCell / CellFamily
  - ChangeOwnership
  - TransformPlan
  - ProjectionPlan
  - IncrementalTaskGraph
  - Evidence / Provenance / Receipts
        |
        +----------------------------+
        |                            |
        v                            v
JVM SEMANTIC WORKER             RUST/NATIVE ORCHESTRATION
  - OpenRewrite                 - durable jobs / resume
  - JDT / Spoon                 - hashing / CAS
  - K2 Analysis API             - file/archive staging
  - Mapping-IO                  - task invalidation
  - Ravel / ART                 - process control
  - Tiny Remapper               - target sandboxing
  - JST                         - runtime launch/proof
  - Gradle Tooling API          - evidence/receipts
        |
        v
CANONICAL SEMANTIC + VERSION GRAPH
  common semantic/source layer
  loader-family adapters
  version-family adapters
  exact cell overlays
  mapping/API delta edges
  dependency/toolchain profiles
        |
        v
TARGET PROJECTION ENGINE
  Enderloom native projection
  optional Stonecutter/Stonecraft export/backend
  existing multiversion import/export adapters
        |
        v
TARGET-NATIVE WORKSPACES
  Fabric Loom | NeoForge ModDevGradle | ForgeGradle | Quilt native
        |
        v
STATIC GATES -> BUILD/DATAGEN -> PACKAGE LINKAGE -> NATIVE RUNTIME -> RECEIPT
```

The canonical representation must survive switching projection backends. Exporting a Stonecutter workspace, a plain native Gradle workspace, or another multiversion format must not change the underlying Enderloom semantic project.

---

# Tool and method integration map

The implementing agent must verify current compatible versions before pinning new dependencies. The roles below are architectural intent, not permission to trust every tool blindly.

| Tool / method | Enderloom role | Required disposition |
| --- | --- | --- |
| Current `devkit_multiversion.py` + real Stonecutter 0.9.8 workflow | Proven baseline for common-source factoring, conditional generation, native build isolation, resume, add-target, packaging | Preserve behavior; migrate authority into Universal Version Family Service; retain compatibility/export adapter |
| Stonecutter | Multiversion source rendering/export and proven design reference | Optional backend/reference, never canonical state owner |
| Stonecraft and other current multiversion challengers already accepted by Enderloom research | Alternative rendering/build ideas where measurably stronger | Differential challenger or optional backend after parity proof |
| MC Mod Porter (authorized source) | Historical migration knowledge and useful implementation patterns | Import useful facts/rules/algorithms into canonical `SemanticRule` store with provenance and regression proof |
| ModForge | Exact/candidate/unresolved symbol evidence | Differential symbol oracle feeding mapping/API graph |
| Fabric Loom migration tasks | Fabric-native mapping/migration truth | Native Fabric oracle; compare with Enderloom results |
| Ravel | PSI-aware Java/Kotlin/Mixin/Class Tweaker remapping | Specialist differential oracle/adapter where more exact |
| NeoForged AutoRenamingTool / SrgUtils | Forge/NeoForge JAR/name remapping | Specialist remap backend/oracle |
| Mapping-IO | Mapping format normalization | Low-level canonical mapping adapter |
| Tiny Remapper | Compiled JAR remapping | Low-level remap backend/oracle |
| Ornithe mapping/tooling family | Historical/legacy mapping eras | Explicit legacy graph lane, never universal dependency |
| Parchment | Parameter/Javadoc semantic enrichment | Enrichment evidence only where version-appropriate |
| OpenRewrite | Structured Java/Kotlin semantic migration recipes | Primary source transform engine for supported transformations |
| Eclipse JDT | Java type/compiler semantic evidence | Compiler/type oracle and difficult transform support |
| Spoon / GumTree / RefactoringMiner | Structural AST/diff/change evidence | Differential/reference engines feeding semantic migration and API-change learning |
| Kotlin K2 Analysis API | Kotlin symbol/type semantics | Narrow pinned adapter; fallback to explicit compiler diagnostics, never silent weakening |
| NeoForge JavaSourceTransformer | Parchment/AT/interface injection/Unpick and related NeoForge source transforms | Specialist backend/oracle behind canonical IR |
| JDK Class-File API + ASM | Bytecode/class structure and exact owner/name/descriptor evidence | Canonical compiled-artifact analysis lane with differential checks |
| Vineflower / CFR | Decompilation and reconstruction evidence | Multiple decompiler oracles; disagreement remains explicit |
| PaperMC Codebook / Unpick | Legacy/constant-heavy reconstruction | Specialist oracle/backend where it improves exactness |
| NeoForge JarCompatibilityChecker / Revapi / japicmp / OpenJDK SigTest | API/binary delta evidence | Normalize into one API delta graph; preserve disagreement |
| Mache / paperweight / InstallerTools / MCPConfig / MergeTool / BinaryPatcher / DiffPatch | Deterministic artifact reconstruction and exact patch lineage patterns | Reuse/port useful algorithms/formats; do not clone entire ecosystems unnecessarily |
| ClassGraph / Jandex | Fast classpath/module/resource/annotation inventory | Bake off against native/JDK index; choose or combine by measured result |
| RetroDebugInjector | Legacy compiled-artifact debug/reconstruction cases | Legacy-only differential oracle or ported algorithm |
| Sinytra Launchpad | Fabric-convention -> NeoForge semantic correspondences | Loader migration corpus/oracle |
| ConnectorExtras | Real two-way platform/API bridge correspondences | Loader migration evidence and optional compatibility adapters |
| Kilt/Twill / Porting Lib | Forge/NeoForge -> Fabric inverse correspondences | Loader migration corpus/oracle |
| Forge Config API Port and focused bridges | Exact subsystem correspondence | Narrow loader adapter/reference where semantics match |
| AccessTransformers / Class Tweaker / Access Widener / interface injection / MixinExtras | Loader mutation semantics | Parse to canonical typed IR, emit target-native form, prove runtime target application |
| Gradle Tooling API / Maven Resolver | Build model and dependency graph | Canonical project/dependency evidence; do not scrape Gradle console text when structured models exist |
| Fabric Loom / NeoForge ModDevGradle / ForgeGradle / Quilt tooling | Target-native builds | Each target cell retains its real native build owner |
| Rust native core / task graph / CAS | Fast durable orchestration | Own resume, incremental invalidation, cache, process control, receipts, target execution |

Every row above must end implementation with a recorded disposition and proof or an explicit evidence-backed reason it is not suitable for production use.

---

# Execution contract

- Read this document once, then resume from the earliest unchecked task whose prerequisites are satisfied.
- Do not restart ecosystem research unless a named implementation gap or stale upstream fact requires it.
- Work in bounded windows of roughly 6-12 ready leaf tasks or one coherent section.
- Check tasks only after observed proof.
- A blocked task remains unchecked with `BLOCKED:` and `NEXT:` notes.
- After two materially unchanged failed attempts, change strategy or repair the missing capability.
- Preserve current verified multiversion behavior until the replacement path proves equal or stronger.
- Do not retire `devkit_multiversion.py`, Stonecutter CI, or existing Northpoint evidence before parity and migration gates pass.
- A successful target build never permits silently weakening another target.
- The first implementation slice must be a real end-to-end target family, not architecture-only scaffolding.

---

# GATE - Canonical repository baseline and migration boundary

- [ ] **T001** · Resolve the authoritative Enderloom worktree/branch/revision, dirty-state boundaries, actual build/test/package commands, Java toolchains, Gradle/toolchain caches, and current AoA source/checkpoint identity.
- [ ] **T002** · Hash and record the exact current files listed in the Context section; if any hash has changed, inspect the delta and update this contract's baseline notes before implementation.
- [ ] **T003** · Run the cheapest decisive existing multiversion structural selftest and the real Stonecutter/native build path available in the environment; preserve concise proof rather than giant logs.
- [ ] **T004** · Record baseline behavior for: common edit propagation, no-rebuild resume, target-only failure isolation, recovery, add-target preservation, source immutability, path safety, secret rejection, package checksums, and native runtime verification where already supported.
- [ ] **T005** · Measure baseline planning/materialization/build-cache behavior on at least one multi-cell fixture so later performance work is compared against equivalent work rather than intuition.
- [ ] **T006** · Map current ownership among Python Dev Kit, Northpoint JS, Rust/native core, JVM tooling, and target-native Gradle builds. Do not create a third independent authority.

---

# GATE - Canonical VersionGraph and target-cell identity

- [ ] **T007** · Implement one canonical `VersionGraph` model representing Minecraft version, edition/platform where applicable, loader, Java runtime, mapping era/model, loader/plugin/toolchain versions, dependency capabilities, and runtime proof requirements.
- [ ] **T008** · Represent each configured output as a stable `TargetCell` identity. Cell identity must include every field that can change generated source, dependencies, packaging, or runtime behavior; do not key cells by display name alone.
- [ ] **T009** · Model `CellFamily` relationships for shared Minecraft-version, loader-family, mapping-era, language/toolchain, and project-specific capabilities so a change can target the narrowest correct family.
- [ ] **T010** · Model migration edges as provenance-bearing graph edges with source range, target range, loader direction, mapping/API delta, confidence, prerequisites, rule set, evidence, and invalidation conditions.
- [ ] **T011** · Distinguish direct semantic edges from evidence-only correspondences. Protocol mappings, bridge mods, or decompiler similarities may provide evidence without proving equivalent mod API semantics.
- [ ] **T012** · Support dynamic version-profile refresh while keeping a reproducible frozen profile in each active job/receipt. New upstream data may create a newer profile; it must not mutate an in-progress verified job invisibly.
- [ ] **T013** · Make 26.1+ unobfuscated/official targets a distinct graph mode so old remap steps are not applied merely because they exist.
- [ ] **T014** · Add explicit legacy mapping-era lanes rather than stretching current Mojmap/Yarn assumptions into historical MCP/SRG-era versions.

---

# GATE - One SemanticProject for Create, Convert, Repair, and Port

- [ ] **T015** · Implement a canonical `SemanticProject`/Project IR that is shared by Create, Convert, Repair, and Port rather than maintaining four private project models.
- [ ] **T016** · Include source authority hashes, language/source sets, registrations/content identities, metadata, dependencies, embedded JARs, Mixins, access mutations, resources/data/datagen, configs, networking, save schemas, build intent, runtime intent, and provenance.
- [ ] **T017** · Define layered ownership: `common semantic/source`, `loader-family adapter`, `version-family adapter`, `project-specific semantic rule`, `exact target-cell override`, and `generated projection`.
- [ ] **T018** · Ensure every target-visible difference can answer: what changed, which ownership layer caused it, why the difference exists, which rule/evidence justified it, and which cells inherit it.
- [ ] **T019** · Preserve unknown/unmodeled fields and source files whenever representable. Ambiguity must not become deletion.
- [ ] **T020** · Store `SemanticRule` separately from generated source. A rule must include applicability, intent, matcher/evidence, transformation, negative guards, provenance, confidence, tests, and invalidation conditions.
- [ ] **T021** · Permit a source-first representation for maintainable user-authored code, but keep semantic identities/provenance strong enough that generated source cannot become untraceable hand-edited truth.

---

# GATE - Generalized shared-source factoring and projection engine

- [ ] **T022** · Refactor the proven behavior in `devkit_multiversion.py` into backend-neutral factoring/projection contracts before replacing its production authority.
- [ ] **T023** · Preserve exact accounting: every imported source-owned file must map to common/shared representation, a scoped override, target-native build input, or an explicit unresolved item. No input member may silently disappear.
- [ ] **T024** · Generalize current source factoring so identical spans/files become shared and divergent behavior is represented at the narrowest safe ownership layer.
- [ ] **T025** · Never auto-merge program semantics with regex/text heuristics when comments, text blocks, parser ambiguity, Kotlin constructs, nested preprocessors, generated code, or semantic structure make the merge unsafe. Fall back to exact overlays or AST/semantic transforms.
- [ ] **T026** · Add typed projection planning for Java, Kotlin, resources, metadata, data packs, datagen inputs, access rules, Mixins, nested JARs, services/modules, and loader-specific build files.
- [ ] **T027** · Keep target-native Gradle/plugin/dependency configuration isolated per target. Common project intent may be shared; incompatible build internals may not be guessed into one file.
- [ ] **T028** · Implement an Enderloom-native projection backend that can materialize a target without Stonecutter.
- [ ] **T029** · Keep a Stonecutter export/backend that can render compatible version families when useful, but make export round-trip from canonical Enderloom state rather than importing Stonecutter directives as authority.
- [ ] **T030** · Add import support for existing Stonecutter/multiversion layouts so Enderloom can recover common source, target differences, native target configs, and provenance without destructive flattening.
- [ ] **T031** · Treat other accepted multiversion tools/templates as import/export/challenger adapters where they add real value; normalize their structure into the same canonical layers.
- [ ] **T032** · When a target is materialized twice from unchanged canonical state and frozen toolchain inputs, require deterministic authored projection hashes and classify unavoidable nondeterministic build outputs separately.

---

# GATE - Incremental task graph, change ownership, and zero-waste rebuilds

- [ ] **T033** · Implement a content-addressed `IncrementalTaskGraph` whose nodes cover semantic analysis, mappings, transforms, projection, dependency resolution, build/datagen, package audit, runtime staging, runtime proof, and receipt creation.
- [ ] **T034** · Compute invalidation from actual input hashes, tool/rule/profile versions, graph dependencies, and ownership scope rather than timestamps alone.
- [ ] **T035** · Classify each edit as common, loader-family, version-family, project-rule, exact-cell, toolchain/profile, or evidence-only change and invalidate exactly the dependent cells/stages.
- [ ] **T036** · A target-only source/override edit must not rebuild unchanged sibling cells.
- [ ] **T037** · Adding a new target cell must build/analyze the new cell and only shared nodes whose output truly changes; intact existing target artifacts and proof remain reusable.
- [ ] **T038** · A common edit must propagate to every cell whose rendered projection changes, but cells whose projection is byte-identical after the edit may reuse downstream proof where the proof inputs are unchanged.
- [ ] **T039** · Restarting Enderloom must reconstruct the job from durable state and reuse intact verified nodes by hash without rerunning unchanged work.
- [ ] **T040** · Preserve the last known-good artifact/proof per cell while a new candidate is building or failing.
- [ ] **T041** · Expose a machine-readable explanation for every invalidation/rebuild: `what changed -> which node invalidated -> which cells affected -> why`.
- [ ] **T042** · Add regression tests that fail if a future refactor turns a target-only edit into a full-matrix rebuild.

---

# GATE - Mapping lineage and exact symbol graph

- [ ] **T043** · Promote existing `mapping_lineage.py`, `mapping_bridge.py`, mapping plans, symbol indexes, and version profiles into one canonical mapping/symbol graph used by every workflow.
- [ ] **T044** · Normalize official/Mojmap, intermediary, Yarn, Parchment, SRG/TSRG/MCP-era, loader-specific, and mod-source names with owner + descriptor + signature + provenance; never reduce identity to a bare name.
- [ ] **T045** · Use Mapping-IO as a format normalization layer where suitable, not as the only truth source.
- [ ] **T046** · Differentially compare Tiny Remapper, Fabric Loom migration behavior, Ravel, AutoRenamingTool/SrgUtils, ModForge evidence, and Enderloom's own resolver on representative fixtures.
- [ ] **T047** · For Kotlin/Mixins/Class Tweaker/Access Widener/AT cases, require tools that understand the relevant syntax/semantics; do not declare parity from Java-only remapping.
- [ ] **T048** · Add an explicit legacy mapping route using useful Ornithe/legacy mapping methods when the target graph enters those eras.
- [ ] **T049** · Use Parchment as semantic enrichment, never as permission to overwrite stronger exact identity evidence.
- [ ] **T050** · Persist mapping disagreements as explicit evidence requiring resolution or a conservative unresolved state; do not choose whichever tool returns a value first.
- [ ] **T051** · Require packaged owner/name/descriptor linkage proof after remapping because source-level symbol success is not enough.

---

# GATE - Semantic migration rule engine

- [ ] **T052** · Make OpenRewrite the primary structured recipe engine for transformations it models safely, with typed findings/result exports rather than log scraping.
- [ ] **T053** · Add JDT compiler/type evidence for overloads, inheritance, generics, ambiguous owners, method resolution, and transformations that require compiler-level semantics.
- [ ] **T054** · Use Spoon/GumTree/RefactoringMiner where their structural or historical change models add evidence; normalize findings into Enderloom's API-delta/rule model instead of adding parallel truth stores.
- [ ] **T055** · Add Kotlin-first semantic support through OpenRewrite Kotlin, Ravel, K2 Analysis API, and compiler diagnostics as appropriate. Pin exact supported compiler/tool versions and fail explicitly when semantic analysis is unavailable.
- [ ] **T056** · Integrate NeoForge JavaSourceTransformer as a specialist backend/oracle for the source-transform domains it owns well, while keeping output/provenance in Enderloom's canonical rule/evidence model.
- [ ] **T057** · Snapshot the authorized MC Mod Porter source and import its useful migration facts, transforms, version knowledge, and algorithms into `SemanticRule` entries with provenance.
- [ ] **T058** · For each imported MC Mod Porter rule, compare: original Enderloom behavior, MC Mod Porter behavior, and composed Enderloom behavior. Promote only after positive fixtures, negative controls, and target build/runtime evidence appropriate to the rule.
- [ ] **T059** · Implement rule composition with explicit ordering and conflict detection. Non-commutative transforms must not be reordered by optimization.
- [ ] **T060** · Add rule minimization/generalization: when the same fix appears in multiple cells, attempt to raise it to the narrowest common family layer and prove that unrelated cells are unaffected.
- [ ] **T061** · Keep project-specific rules separate from globally reusable rules until cross-project evidence supports promotion.
- [ ] **T062** · Store every generalized repair as a reusable rule plus regression fixture so the same failure class is not rediscovered from scratch.

---

# GATE - Loader semantic adapters instead of API spelling replacement

- [ ] **T063** · Model loader concepts as semantic capabilities: entrypoints, events, registries, lifecycle, networking, data generation, config, capabilities/components, attachments, rendering hooks, commands, packets, services, access mutation, loader metadata, dependency semantics, nested JAR behavior, and environment/side declarations.
- [ ] **T064** · Build Fabric, Forge, NeoForge, and supported Quilt adapters that map semantic intent to target-native APIs rather than performing string substitution.
- [ ] **T065** · Use Sinytra Launchpad as a correspondence/oracle for Fabric-convention -> NeoForge cases where it has proven semantics.
- [ ] **T066** · Use Kilt/Twill/Porting Lib and focused bridges as inverse/alternate correspondence evidence for Forge/NeoForge -> Fabric cases.
- [ ] **T067** · Use ConnectorExtras and other real two-way bridges to learn exact subsystem correspondences, not to claim full-loader equivalence.
- [ ] **T068** · Use focused ports such as Forge Config API Port only for the subsystem semantics they actually prove.
- [ ] **T069** · Parse Access Transformers, Access Wideners, Class Tweaker, interface injection, enum extension where supported, and MixinExtras selectors/expressions into typed IR and emit target-native equivalents only when semantics are preserved.
- [ ] **T070** · Make Quilt an explicit loader target with its own metadata/dependency/entrypoint/compatibility semantics rather than treating it as a Fabric alias.
- [ ] **T071** · Require runtime PREPARE/APPLY or equivalent evidence for Mixins/access changes; build success does not prove transformer correctness.

---

# GATE - Compiled-artifact and reconstruction lane

- [ ] **T072** · Support authorized JAR-only or partial-source intake without pretending decompiled source is original source authority.
- [ ] **T073** · Use the JDK Class-File API and ASM as exact structural/linkage evidence for owners, members, descriptors, handles, invokedynamic, access, signatures, annotations, modules, services, Kotlin metadata relationships, and nested artifacts.
- [ ] **T074** · Compare Vineflower and CFR decompilation for difficult artifacts; preserve disagreement and original bytecode evidence rather than trusting one decompiler.
- [ ] **T075** · Evaluate PaperMC Codebook/Unpick for legacy/constant-heavy cases and promote only behavior that measurably improves reconstruction correctness.
- [ ] **T076** · Normalize JarCompatibilityChecker, Revapi, japicmp, and SigTest results into one API/binary-delta graph with explicit source/version/tool provenance.
- [ ] **T077** · Reuse useful deterministic reconstruction ideas/formats from Mache, paperweight, InstallerTools, MCPConfig, MergeTool, BinaryPatcher, and DiffPatch without creating another incompatible proprietary patch format.
- [ ] **T078** · Add ClassGraph/Jandex or the strongest measured alternative as a fast classpath/module/resource/annotation inventory lane using the actual Gradle-resolved classpath and without executing untrusted mod code.
- [ ] **T079** · Use RetroDebugInjector or ported proven algorithms only for relevant legacy cells; never impose a legacy tool as a universal dependency.
- [ ] **T080** · After reconstruction/remap, require exact packaged-linkage gates and target runtime proof before the cell can pass.

---

# GATE - Create flow uses the same version-family engine

- [ ] **T081** · New Mod / Create must begin with a `SemanticProject` plus selected target family, not a single version that later gets copied into forks.
- [ ] **T082** · The creation UI/CLI must let the user choose one primary target and additional version/loader cells while keeping one common project.
- [ ] **T083** · Generate content/code/data at the common semantic layer whenever the requested behavior is portable.
- [ ] **T084** · Place loader/version-specific code only in the narrowest adapter/override layer and show that scope clearly to the user.
- [ ] **T085** · New features added later to an existing created mod must propagate through the same ownership/invalidation system without recreating targets from scratch.
- [ ] **T086** · Provide a per-feature compatibility explanation when one semantic feature cannot be represented on a target; do not silently omit it.
- [ ] **T087** · Package source in a form that can be reopened by Enderloom with the canonical graph/provenance intact, plus optional exports for Stonecutter or plain target-native workspaces.

---

# GATE - Convert flow factors existing projects into one maintainable family

- [ ] **T088** · Single-version source conversion must intake immutable source authority, build SemanticProject/IR, create the original target cell, then add requested target cells through graph transforms.
- [ ] **T089** · Existing multi-version source conversion must identify common source, loader/version branches, build configuration, preprocessors, overlays, and target-native differences before mutation.
- [ ] **T090** · When multiple existing versions of the same mod are supplied, use them as differential evidence to recover common semantics and version-specific deltas rather than selecting one and discarding the rest.
- [ ] **T091** · Do not chain-mutate generated target source across ports. Each target must project from canonical semantic state plus scoped adapters/rules.
- [ ] **T092** · Preserve exact donor/original lineage for assets, data, code, and behavior recovered from older/newer authorized versions.
- [ ] **T093** · Conversion output must include the maintainable canonical project, every target artifact, target receipts, unresolved items, and enough provenance for a clean-room replay.

---

# GATE - Repair flow fixes the right layer and teaches the engine

- [ ] **T094** · Repair intake must identify whether the defect belongs to common project semantics, one loader family, one version family, one exact cell, dependency/toolchain resolution, mappings, generated output, packaging, or runtime behavior.
- [ ] **T095** · Compare sibling cells and known-good historical cells to localize regressions without assuming the newest or oldest cell is automatically correct.
- [ ] **T096** · Apply repairs to the highest safe ownership layer and automatically reproject/retest only affected cells.
- [ ] **T097** · If a cell-specific workaround duplicates a fix already present elsewhere, attempt generalization before accepting the override.
- [ ] **T098** · Preserve last known-good cell artifacts and source checkpoints so a failed repair cannot destroy an intact family.
- [ ] **T099** · Convert every generalized repair into `SemanticRule`/adapter logic plus positive, negative, and regression fixtures.
- [ ] **T100** · If a repair is irreducibly project-specific, record why it cannot safely generalize and keep it scoped to that project/cell family.
- [ ] **T101** · Repair completion requires the exact affected target artifact to pass the applicable runtime gate, not merely compile.

---

# GATE - Port flow is adding graph cells, not cloning projects

- [ ] **T102** · `Port to version/loader` must be modeled as `add target cell(s)` to the existing SemanticProject.
- [ ] **T103** · Compute candidate migration routes using mapping era, API delta, loader semantics, proven neighboring cells, and rule confidence. Prefer the route with the strongest evidence and least semantic uncertainty, not merely the numerically closest version.
- [ ] **T104** · Use multi-hop graph edges to plan understanding, but materialize the final target from canonical semantic state so intermediate generated-source drift does not accumulate.
- [ ] **T105** · Reuse a proven neighboring cell as a differential oracle/donor when valuable while retaining canonical provenance.
- [ ] **T106** · Adding a target must preserve all existing user edits, common changes, cell overrides, artifacts, and proofs; create a recoverable checkpoint before structural migration.
- [ ] **T107** · If the new target exposes a missing general capability, improve the shared engine/adapter and resume the same port rather than creating a permanent one-off fork.
- [ ] **T108** · A newly added target is `unverified` until its real native build and required runtime gates pass. Merely generating the target is never compatibility proof.

---

# GATE - Native build, dependency, and toolchain ownership per cell

- [ ] **T109** · Preserve per-cell Java runtime, Gradle, loader plugin, mappings, repositories, dependency coordinates/ranges, datagen requirements, access/mixin tooling, and packaging rules as explicit frozen inputs.
- [ ] **T110** · Use Gradle Tooling API and structured loader/build metadata where possible rather than parsing free-form console output as primary truth.
- [ ] **T111** · Use Maven Resolver or equivalent structured dependency resolution evidence and preserve exact artifacts/checksums/provenance.
- [ ] **T112** · Keep Fabric Loom, NeoForge ModDevGradle, ForgeGradle, and Quilt-native build semantics first-class. Do not force one plugin model onto every loader.
- [ ] **T113** · Support offline/verified cache reuse when exact required artifacts exist; never report a cache/toolchain as available when hashes are missing or wrong.
- [ ] **T114** · Run untrusted imported build logic inside the accepted sandbox/least-privilege path before it receives host authority.
- [ ] **T115** · Preserve native target wrappers/configuration when importing an existing port and migrate them only after an evidence-backed replacement is stronger.
- [ ] **T116** · Produce one target receipt containing frozen profile, source authority, rule set, tool versions, dependency lock, projection hash, artifact hash, static gates, runtime evidence, and unresolved warnings.

---

# GATE - Product UI, CLI, and agent surfaces use one canonical service

- [ ] **T117** · Wire Create, Convert, Repair, and Port UI actions to the same Universal Version Family Service; no surface may maintain a private copy of version/loader logic.
- [ ] **T118** · Provide a family view that shows common project state, configured cells, proof state, stale state, failures, target-specific overrides, and what a new common edit will affect.
- [ ] **T119** · Provide `Add target`, `Remove target`, `Rebase/refresh target profile`, `Build affected`, `Verify affected`, `Explain differences`, `Promote fix`, and `Export` actions with real backend wiring.
- [ ] **T120** · Removing a target must not delete common/project data still used elsewhere and must be reversible through checkpoint/history where practical.
- [ ] **T121** · Add machine-readable CLI/agent operations with stable operation IDs and JSON results for plan, add-target, project, build, verify, repair, explain, export, and status/resume.
- [ ] **T122** · Progress must report real stage/cell state from the canonical job graph; no fake percentages or UI-only success.
- [ ] **T123** · When a target is blocked, show the exact unresolved semantic/dependency/toolchain/runtime reason while allowing independent cells to continue.

---

# GATE - Migration from current Stonecutter-specific worker without regression

- [ ] **T124** · Wrap the current `devkit_multiversion.py` behavior behind a compatibility adapter first; do not rewrite and delete simultaneously.
- [ ] **T125** · Build parity fixtures that compare old-worker and new-engine projections for current structural and real Stonecutter selftest cases.
- [ ] **T126** · Require byte/file inventory parity for every source-owned input projection before promoting the new backend.
- [ ] **T127** · Reproduce current common-edit propagation, target-failure isolation, recovery, no-rebuild resume, add-target preservation, source immutability, credential rejection, path safety, and packaging checksums through the new engine.
- [ ] **T128** · Re-run the existing Aoba multiversion workflow through the new service and verify the exact target JAR in native Minecraft/restart where the current CI already proves that lane.
- [ ] **T129** · Keep existing CI green while adding new backend-neutral CI. Only retire Stonecutter-specific CI coverage after equivalent or stronger tests exist elsewhere; Stonecutter export compatibility may keep its own focused test.
- [ ] **T130** · After parity, move canonical orchestration/state into the production Rust/native service and semantic operations into the canonical JVM worker as specified by the main implementation contract. Python remains a migration oracle/fixture path only where still useful.
- [ ] **T131** · Remove duplicate authority only after repository search and runtime proof show production no longer depends on it. Preserve compatibility tools/fixtures that still catch regressions.

---

# GATE - Acceptance matrix and real workflow proof

- [ ] **T132** · Create fixture: one small mod created through Enderloom, then built across at least two Minecraft versions and two loader families supported by the current environment.
- [ ] **T133** · Common edit fixture: change one shared behavior and prove all affected cells update while unrelated cached stages remain reused.
- [ ] **T134** · Loader-family edit fixture: change a loader-specific semantic adapter and prove only that loader family invalidates.
- [ ] **T135** · Version-family edit fixture: change a version-specific adapter and prove only that version family invalidates.
- [ ] **T136** · Exact-cell edit fixture: change one cell override and prove no sibling rebuild/regression.
- [ ] **T137** · Add-target fixture: add a new configured cell and prove existing intact cells keep artifact hashes/attempt counts/evidence when their inputs did not change.
- [ ] **T138** · Failure isolation fixture: introduce invalid source into one cell, prove that cell fails, sibling proof remains intact, then repair and resume only the affected cell.
- [ ] **T139** · Restart fixture: interrupt after a coherent checkpoint and prove the same job resumes without rebuilding unchanged nodes.
- [ ] **T140** · Mapping disagreement fixture: make two mapping/oracle sources disagree and prove Enderloom reports unresolved evidence rather than choosing silently.
- [ ] **T141** · Semantic rule fixture: import or author one reusable migration rule and prove positive matches, negative controls, version bounds, and exact target result.
- [ ] **T142** · Mixin/access fixture: migrate exact owner/member/descriptor access/transform behavior and prove target runtime application.
- [ ] **T143** · Compiled-artifact fixture: intake an authorized JAR, reconstruct/port with provenance, package, and pass linkage/runtime gates without claiming decompiled text is original authority.
- [ ] **T144** · Existing multiversion import fixture: import the current Stonecutter-style project and export/reproject without losing user changes or target-native build configuration.
- [ ] **T145** · AoA fixture: exercise the same Universal Version Family Service on the active AoA project; any discovered general capability gap must be fixed in the shared engine and then retried.
- [ ] **T146** · Clean-room fixture: delete generated target workspaces/caches that are allowed to be rebuilt, then reproduce selected target artifacts from canonical project + frozen dependencies/rules without manual target edits.

---

# GATE - Performance and no-loss challenge pass

- [ ] **T147** · Compare new engine against the current multiversion baseline on equivalent projects and prove a material improvement or at minimum no regression in planning/materialization overhead while preserving full output/evidence.
- [ ] **T148** · Prove unchanged reruns do not rebuild unchanged cells and do not re-run semantic/mapping work whose exact inputs are still valid.
- [ ] **T149** · Prove target-only changes remain target-only through the entire pipeline, including downstream build/runtime scheduling.
- [ ] **T150** · Prove adding a target does not rebuild existing unchanged cells.
- [ ] **T151** · Verify parallel execution is bounded by real independence and resource limits; do not run conflicting Gradle/runtime cells merely to maximize concurrency.
- [ ] **T152** · Inspect memory/disk amplification for large version families. Shared immutable data should deduplicate safely, but one cell must never mutate another through unsafe links.
- [ ] **T153** · Run one adversarial challenge pass for content loss, stale async overwrite, graph-cycle/path bugs, conflicting rules, invalid cache reuse, mapping-era mistakes, loader-semantic false equivalence, secret leakage, target-path collision, and generated-source hand edits.
- [ ] **T154** · Fix every significant finding, rerun only invalidated gates, and preserve concise proof.

---

# GATE - Documentation, migration UX, and durable receipts

- [ ] **T155** · Document the mental model in plain language: one mod, shared core, version/loader adapters, exact target exceptions, native builds, and repair promotion.
- [ ] **T156** · Add an `Explain this difference` view/CLI output that traces any generated target hunk/file back to common source + adapter/rule/override + evidence.
- [ ] **T157** · Add a migration path for existing Enderloom Stonecutter workspaces into the canonical engine without requiring users to recreate projects.
- [ ] **T158** · Add export paths for source bundle, target-native workspace, optional Stonecutter-compatible workspace, artifacts, checksums, and evidence receipts.
- [ ] **T159** · Record final architecture/tool dispositions so future agents know which external tools are active backends, oracles, imported rule sources, or retired references.
- [ ] **T160** · Update the main Enderloom implementation/knowledge hub to point at this contract as the dedicated multi-version Create/Convert/Repair/Port execution specification without duplicating the entire text.

---

# CONVERGENCE LOOP — prove the engine against the whole contract

- [ ] **G001 · GATE** — Run the full convergence loop after implementation: rescan every unchecked, blocked, stale, or invalidated task; compare the production Create / Convert / Repair / Port workflows against this contract; inspect real generated diffs and receipts; rerun only gates invalidated by later changes; repair every missing/partial/contradictory behavior in the shared engine; and repeat until no accepted requirement is missing, no production path bypasses the canonical SemanticProject + VersionGraph, no performance gain comes from reduced work, and no target is marked verified without its required evidence.
- [ ] **T161** · Search production code and generated artifacts for duplicate or bypass version/loader state owners, hidden cumulative port chains, direct target-workspace hand edits, stale Stonecutter-specific authority, and UI/CLI paths that skip the canonical service; eliminate or explicitly quarantine each finding.
- [ ] **T162** · Reconcile tool/method coverage against the integration map: every accepted tool or technique must end as an active backend, differential oracle, imported knowledge source, compatibility/export adapter, or evidence-backed rejected/superseded entry. Unknown/disappeared tools stay unresolved until traced.
- [ ] **T163** · Reconcile expected/discovered/preserved/converted/repaired/ported/unresolved content counts for representative fixtures and AoA; zero-loss claims require explicit count/evidence closure rather than a green build.
- [ ] **T164** · Run the final performance-equivalence challenge on identical workloads and preserve output hashes/semantic inventories/evidence. Any speedup caused by skipping content, validation, providers, mappings, runtime proof, or supported targets fails convergence.
- [ ] **T165** · Perform a final clean-room/restart challenge from the canonical project state, frozen target profiles, dependencies, rule store, and caches allowed by policy; prove resumability and deterministic regeneration without manual generated-target surgery.

---

# FINAL COMPLETION GATE

- [ ] **G002 · FINAL COMPLETION GATE** - Do not call this complete until every accepted gate above is satisfied; the production app uses one canonical SemanticProject + VersionGraph across Create, Convert, Repair, and Port; the old multiversion behavior is preserved or improved; Stonecutter is optional rather than canonical; useful previously accepted tools/methods have explicit integrated dispositions; incremental rebuild/resume behavior is proven; source/content parity and exact packaged linkage are proven; applicable native runtime/restart gates pass on exact artifacts; AoA uses the same normal engine; no unresolved accepted blocker is hidden; and a clean-room replay reproduces representative multi-version outputs without manual generated-target surgery.
