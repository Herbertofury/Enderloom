# ENDERLOOM NEXT-GEN TECH STACK CHALLENGERS — FOURTH DEEP-SCOUR DELTA

**Updated:** 2026-09-26 — fourth gap-directed deep scour + final hidden-infrastructure challenge pass  
**Purpose:** additive continuation of `ENDERLOOM_NEXTGEN_TECH_STACK_SCOUT.md`  
**Canonical prior scout:** Google Drive file ID `1AnnEPnW3GpgPvmAy8F0F8buH8AUkV9V0`  
**Scope rule:** do not delete, weaken, or reopen already-proven Enderloom work. This file adds only newly surfaced challengers, stronger implementation references, and gap-directed bakeoffs.

> The exact prior file name `ENDERLOOM_NEXT_GEN_TECH_STACK_CHALLENGERS.md` was not discoverable in the connected Drive folder. The latest canonical tech-stack artifact found there is `ENDERLOOM_NEXTGEN_TECH_STACK_SCOUT.md`. This continuation therefore starts at the next stable IDs after that scout (`T041+`, `G013+`) and preserves its candidate matrix instead of recreating it.

---

## Executive delta — genuinely important finds from the second scour

The original scout already covered the broad Rust/app-performance stack. This pass deliberately targeted what was still under-covered: **automatic Minecraft source migration, loader translation, mapping/remapping, semantic API-delta inference, version-matrix builds, compiled-bytecode repair, and low-level Windows indexing**.

### Highest-value additions

1. **OpenRewrite** — production-grade recipe engine for repeatable Java/Kotlin/Groovy source migrations. Enderloom should prototype a Minecraft-specific recipe layer instead of keeping migrations as ad-hoc string edits.
2. **Spoon + GumTree-Spoon + RefactoringMiner** — source/AST-delta mining lane for discovering recurring Minecraft/loader API transformations from known before/after ports.
3. **Eclipse JDT Language Server/JDT** — compiler-grade semantic validation, diagnostics, symbol resolution, references, quick fixes and refactorings as an oracle around generated transformations.
4. **MinecraftForge Srg2Source + renamer + SrgUtils** — mature Forge-native source remapping/refactoring machinery; directly relevant to source-level symbol migration and mapping-format interoperability.
5. **Fabric Mapping-IO + Tiny Remapper + Intermediary/Matcher/Stitch + Enigma** — canonical cross-version identity/remapping reference lane, especially for mapping graph normalization and class/member continuity across versions.
6. **NeoFormRuntime** — current NeoForge artifact graph that deobfuscates, merges, patches and recompiles Minecraft; an authoritative reference for reconstructing a target-version development universe.
7. **Sinytra Connector + Adapter + Launchpad + MixinTransmogrifier + Forgified Fabric API** — probably the richest live compatibility corpus for Fabric -> NeoForge. Connector's Adapter is especially important: common incompatibility patterns are recognized and dynamically transformed rather than hard-coded per mod, with regression tests.
8. **Porting Lib** — explicit Forge-to-Fabric porting utilities and a useful API-semantic bridge corpus.
9. **Unimined** — broad loader/version build support, including legacy loaders. Use as a fixture generator and coverage reference for Enderloom's universal version/loader matrix.
10. **Stonecutter + loom-back-compat patterns** — real projects are already maintaining one tree across 1.20.x, 1.21.x and 26.x, multiple Java versions and Fabric/NeoForge using conditional source sections and token replacement. Enderloom should generate this structure when it is the cleanest preserved-source result rather than cloning whole source trees.
11. **Forgix** — useful one-JAR multi-loader/multi-version packaging reference, but bake off carefully: 2026 reports include class-name/package handling issues on 26.x snapshots.
12. **Revapi + japicmp** — fast API-delta classification. Revapi gives richer source/binary/semantic API-surface analysis; japicmp is a fast JAR-vs-JAR binary/source compatibility lane.
13. **Vineflower** — modern multithreaded decompiler and the direct continuation of Quiltflower; use as the leading decompilation oracle, with CFR/other decompilers retained for disagreement detection.
14. **Mercury + Lorenz** — source remapping/transformation with mapping-aware source rewriting and access-transformer support. Useful comparative lane even if Enderloom's main engine is OpenRewrite/JDT/Spoon.
15. **Byte Buddy / ASM / Recaf** — compiled-bytecode recovery and instrumentation toolbox for cases where source is unavailable or must be repaired after compilation; keep separate from source-first migration.
16. **Direct NTFS MFT + USN Journal indexing** — the prior scout already wanted MFT/USN; this pass found real Rust implementation patterns such as `tyler-builds/fx`. Treat these as reference implementations for instant local mod discovery/invalidation, not as blindly vendored dependencies.

---

# G013 — Semantic migration engine: replace brittle textual porting with learned, typed recipes

- [ ] **G013 · GATE** — Enderloom owns a semantic source-migration pipeline that can learn transformations from known ports, apply them repeatably, validate them against the real target classpath, and fall back without losing source fidelity.

### T041 — Bake off OpenRewrite as the primary recipe execution layer

- [ ] **T041** — Prototype Enderloom Minecraft recipes on **OpenRewrite**.

Why:

- designed for repeatable automated source refactoring;
- Java/Kotlin/Groovy-aware parsers and recipes;
- recipes can be composed and tested;
- suited to turning verified port fixes into reusable migration knowledge.

Initial Enderloom recipe families:

- package/import relocation;
- method/constructor signature migration;
- field -> accessor and accessor -> field changes;
- registration API migration;
- event bus/listener migration;
- resource identifier/resource-key changes;
- NBT API shape migrations;
- networking payload/channel migrations;
- loader metadata and entrypoint migration;
- annotation/loader API replacement;
- access widener/transformer changes;
- Java language/toolchain upgrades.

Hard rule: a recipe is not promoted from one successful mod. Require a positive fixture corpus plus negative controls proving unrelated code is untouched.

### T042 — Use Spoon + GumTree-Spoon as a Java transformation-mining lane

- [ ] **T042** — A/B **Spoon** and **GumTree-Spoon AST Diff** for mining structured edit scripts from verified before/after ports.

Use them to infer candidate transforms from:

- upstream mod ports across Minecraft versions;
- Fabric <-> NeoForge sibling implementations;
- old/new Minecraft decompiled API snapshots;
- Enderloom's own previously verified manual repairs.

Do not blindly replay AST edits. Normalize repeated edits into parameterized Enderloom migration rules and validate them against compiler/symbol evidence.

### T043 — Add RefactoringMiner as a higher-level refactoring recognizer

- [ ] **T043** — Detect moved/renamed/extracted/merged APIs and cross-file refactorings so Enderloom distinguishes structural refactoring from arbitrary changed code.

Expected output into Enderloom's version-delta graph:

`old symbol -> relation -> new symbol | confidence | evidence | version range | source provenance`

### T044 — Make JDT the semantic/compiler oracle around generated changes

- [ ] **T044** — Integrate **Eclipse JDT/JDT LS** or its underlying compiler/model services as an oracle for:

- symbol binding;
- overload selection;
- unresolved members/types;
- references/implementations;
- diagnostics;
- quick-fix/refactoring hints;
- Gradle/Maven project classpath understanding.

Enderloom may use another AST for transformations, but generated edits must survive compiler-grade semantic validation.

---

# G014 — Minecraft-native source/remapping pipeline challengers

- [ ] **G014 · GATE** — Enderloom understands the strongest existing Minecraft source/mapping tools and composes their proven ideas instead of rebuilding inferior remappers.

### T045 — Forge source migration lane: Srg2Source + renamer + SrgUtils

- [ ] **T045** — Build a fixture around **MinecraftForge/Srg2Source**, **MinecraftForge/renamer**, and **MinecraftForge/SrgUtils**.

Important capabilities:

- source-level class/method/field/parameter/variable symbol renaming;
- mapping-aware extraction/apply flow;
- current Forge `renamer` supports mapping formats through SrgUtils, including ProGuard, TSRG, Tiny v1/v2+, XSRG;
- `renamer` can call Srg2Source for source-file renaming.

Enderloom goal: use these as correctness/reference or directly reuse compatible components where license and architecture make sense. Do not replace richer semantic migration with simple symbol substitution.

### T046 — Fabric identity lane: Mapping-IO + Tiny Remapper + Intermediary/Matcher/Stitch

- [ ] **T046** — Make **Mapping-IO** the leading candidate for mapping-format normalization and bake off **Tiny Remapper** as the compiled-JAR remapping oracle.

Also ingest the **Fabric Intermediary** methodology:

- Matcher identifies correspondences between two game JARs;
- Stitch updates/generates intermediary mapping chains;
- intermediary names deliberately remain stable across game versions/mapping changes.

Enderloom should be able to represent multiple naming namespaces at once rather than flattening too early:

`official <-> intermediary <-> yarn/parchment/mojmap <-> srg/tsrg <-> mod-source symbol`

### T047 — Enigma becomes a mapping/deobfuscation comparator, not the whole conversion engine

- [ ] **T047** — Retain **FabricMC/Enigma** for interactive/CLI deobfuscation, mapping inspection and source reconstruction evidence.

Do not ask Enigma to solve loader/API migrations it was not built to solve.

### T048 — Mercury + Lorenz comparative source-remapping lane

- [ ] **T048** — Evaluate **CadixDev/Mercury + Lorenz** against Enderloom's recipe pipeline for mapping-aware source rewrites and access-transformer updates.

Promote individual capabilities if they are safer/more precise than home-grown equivalents.

---

# G015 — Loader/API translation corpus: learn from runtime compatibility systems

- [ ] **G015 · GATE** — Enderloom converts source using a reusable loader-compatibility knowledge graph, not a pile of mod-specific patches.

### T049 — Mine Sinytra Connector's Adapter architecture

- [ ] **T049** — Treat **Sinytra Connector** as a first-class compatibility research corpus.

Connector demonstrates a key design Enderloom should copy conceptually:

1. identify a common incompatible pattern;
2. match structurally instead of by one mod/class name;
3. apply a dynamic transformer/patch;
4. regression-test the transformer;
5. keep mod-specific exceptions only where a general rule is impossible.

Its documented Adapter evolution explicitly moved many hard-coded mixin patches into dynamic pattern-driven transformers and added tests to prevent regressions.

Enderloom source-port analogue:

`runtime compatibility pattern -> semantic source recipe -> target loader implementation -> compile/runtime fixture`

### T050 — Ingest Connector transformer-plugin concepts and Mixin patch families

- [ ] **T050** — Catalog Connector's transformer API and patch categories as candidate source conversion rules:

- injection-point changes;
- changed method parameters;
- target member/method changes;
- registry timing/bridging;
- loader-patched vanilla differences;
- interoperability bridges.

Every runtime workaround that has a clean source equivalent should become a source migration candidate.

### T051 — Study Launchpad as the metadata/entrypoint conversion baseline

- [ ] **T051** — Compare Enderloom's loader conversion with **Sinytra Launchpad**.

Launchpad already handles developer-facing translation around Fabric-style conventions on NeoForge, including project metadata/entrypoint/access-widener/nested-jar concerns. Enderloom must at least match this friction reduction when producing a real native port.

### T052 — Use Forgified Fabric API and Porting Lib as semantic bridge corpora

- [ ] **T052** — Index API correspondences from:

- **Sinytra/ForgifiedFabricAPI** — Fabric API behavior implemented on NeoForge;
- **Fabricators-of-Create/Porting-Lib** — utilities explicitly aimed at porting Forge-style functionality to Fabric.

These are evidence sources for "what concept corresponds to what"; do not automatically make converted mods depend on compatibility layers when a clean native target implementation is possible.

### T053 — Add MixinTransmogrifier and MixinExtras compatibility knowledge

- [ ] **T053** — Include **Sinytra/MixinTransmogrifier** and **MixinExtras** in the mixin compatibility corpus.

Use cases:

- recognize Fabric-Mixin-specific assumptions;
- detect version-specific injector semantics;
- migrate supported patterns to the correct target form;
- preserve behavior rather than merely making the class compile.

---

# G016 — Target-environment reconstruction and build matrix

- [ ] **G016 · GATE** — Enderloom can deterministically reconstruct the exact target Minecraft/loader toolchain before attempting semantic repair.

### T054 — NeoFormRuntime is an authoritative NeoForge target-universe builder

- [ ] **T054** — Integrate or invoke **NeoFormRuntime (NFRT)** where appropriate for NeoForge target artifacts.

NFRT builds an execution graph that can deobfuscate, merge, patch and recompile Minecraft/NeoForge artifacts and expose resulting game/source jars. Enderloom should not maintain a weaker independent recreation of this graph when NFRT can provide authoritative inputs.

### T055 — ModDevGradle becomes a target-generation/reference lane

- [ ] **T055** — Use **ModDevGradle** project fixtures for current NeoForge and legacy Forge dev environments, including configuration-cache behavior and access-transformer handling.

Do not force a converted project to use ModDevGradle if another supported build structure is better for its target, but Enderloom must be able to generate/test it correctly.

### T056 — Unimined is the broad loader/version coverage challenger

- [ ] **T056** — Build a compatibility fixture matrix with **Unimined** covering modern and legacy loader families.

Use it primarily as:

- loader/version coverage reference;
- clean-room test fixture generator;
- evidence for unusual legacy targets;
- alternate build route when Loom/ForgeGradle/ModDevGradle cannot represent a requested target cleanly.

Do not make Enderloom dependent on one external build plugin for its internal semantic model.

### T057 — Stonecutter source-layout generation is a first-class output strategy

- [ ] **T057** — Add a generator for **Stonecutter-style one-tree multi-version/multi-loader projects**.

Observed 2026 projects demonstrate:

- one shared source tree across many versions;
- Fabric + NeoForge targets;
- version-conditional code blocks;
- token replacements for systematic API renames;
- separate Java toolchains for 1.20.x/1.21.x/26.x;
- loom-back-compat bridging the pre-26 obfuscated and 26.x unobfuscated eras.

Rules:

- use token replacement only for uniform, semantics-preserving substitutions;
- use semantic recipes for actual API behavior changes;
- keep conditional blocks small and localized;
- never duplicate full source trees solely because versions differ.

### T058 — Forgix packaging is a bakeoff, not an automatic default

- [ ] **T058** — Test **Forgix** for optional single-JAR loader/version packaging.

Positive evidence:

- production-oriented multi-loader merge;
- explicit multiversion merge support;
- generic custom-loader merge path.

Caution:

- 2026 issue reports show snapshot behavior that could rename/alter class entries incorrectly on 26.x configurations.

Acceptance requires byte-for-byte inventory, loader startup, resources/service metadata, mixin metadata, signatures, nested jars and class-path isolation tests on every merged target.

---

# G017 — API-delta and compiled-code intelligence

- [ ] **G017 · GATE** — Every version jump gets a structured API-delta report before guessing migration rules.

### T059 — Revapi as the rich API compatibility classifier

- [ ] **T059** — Run **Revapi** across target API snapshots and important loader/library versions.

Capture:

- source compatibility;
- binary compatibility;
- semantic compatibility categories;
- leaked dependency/API surface;
- annotations and configurable filters.

Feed this into recipe selection and confidence scoring.

### T060 — japicmp as the fast JAR-diff lane

- [ ] **T060** — Add **japicmp** for very fast two-JAR API comparison and use it as an independent oracle against Revapi.

Disagreement between Revapi/japicmp/JDT should lower auto-apply confidence and trigger a deeper analysis lane.

### T061 — Vineflower becomes the leading decompiler oracle

- [ ] **T061** — Standardize on **Vineflower** as the first decompiler for source reconstruction and Minecraft API inspection.

Keep at least one independent fallback (for example CFR) so decompiler disagreement is detectable. Never silently treat decompiled source as original source fidelity.

### T062 — Byte Buddy / ASM / Recaf for compiled-only repair paths

- [ ] **T062** — Keep a separate bytecode lane for source-unavailable or post-compile compatibility work.

- **ASM** — lowest-level classfile authority;
- **Byte Buddy** — higher-level class transformation/instrumentation;
- **Recaf** — excellent investigation/repair comparator and multi-decompiler environment.

Do not let bytecode patches replace maintainable source fixes when source exists.

### T063 — SootUp is conditional deep static analysis

- [ ] **T063** — Keep **SootUp** as a conditional call-graph/dataflow lane for difficult migrations where local AST/symbol analysis cannot prove behavior.

Trigger only for genuinely hard cases; do not add its cost to normal conversions.

---

# G018 — Windows instant-indexing implementation challengers

- [ ] **G018 · GATE** — Enderloom's local mod/project discovery and invalidation can become effectively instant on Windows without correctness loss.

### T064 — Implement a production MFT + USN prototype

- [ ] **T064** — Build the prior scout's MFT/USN goal as a real prototype rather than leaving it conceptual.

Architecture:

1. initial NTFS MFT enumeration creates the file identity/path index;
2. USN Journal cursor persists per volume;
3. subsequent scans consume only journal deltas;
4. rename pairs, deletes, hardlinks and volume/journal reset are reconciled safely;
5. fall back to ordinary filesystem walking on unsupported filesystems/permissions;
6. no correctness claim until the fallback and reset cases pass.

### T065 — Study `tyler-builds/fx` as an implementation pattern

- [ ] **T065** — Inspect the Rust/Windows MFT + USN architecture in **fx** for useful techniques such as compact persistent path/name indexing and journal tailing.

Use as a pattern/comparator, not a dependency decision by popularity.

### T066 — Keep `usn-journal-rs` conditional and reject unfinished wrappers

- [ ] **T066** — Test `usn-journal-rs` only if its API/maturity beats direct Windows bindings for Enderloom.

Reject unfinished projects such as wrappers that explicitly do not yet implement their advertised backends. Missing maturity is not permission to abandon MFT/USN; use native Win32/NTFS APIs directly if necessary.

---

# G019 — Storage challengers: narrow, measured roles only

- [ ] **G019 · GATE** — New embedded stores may win specialized hot paths but cannot silently replace SQLite/CAS authority.

### T067 — Refresh redb and Fjall against 2026 state

- [ ] **T067** — Re-benchmark current **redb** and **Fjall** only for specialized stores such as:

- ephemeral/rebuildable index shards;
- huge key/value metadata not benefiting from SQL;
- append/update-heavy local caches;
- secondary lookup accelerators.

Preserve:

- SQLite as canonical relational/control state unless a full durability/migration/operability bakeoff proves otherwise;
- CAS as canonical immutable object identity;
- one ownership model per datum.

Do not promote a database from its own benchmark claims.

---

# G020 — Research coverage reconciliation: GitHub + Codeberg + GitLab + registries

- [ ] **G020 · GATE** — Search limitations are recorded as unresolved coverage constraints, never converted into "nothing exists."

### T068 — Codeberg/sourcehut handling

- [ ] **T068** — Direct Codeberg and SourceHut crawling is blocked by the current web research harness. Continue discovery through:

- canonical project docs that link to Codeberg;
- Maven/Gradle Plugin Portal/crates.io/docs.rs/package metadata;
- GitHub mirrors only as discovery hints;
- downstream real projects whose build files point at the canonical Codeberg project;
- release/changelog references.

Meaningful Codeberg-origin technology confirmed indirectly in this research family includes **SCC** and **KikuGie loom-back-compat** references used by real 26.x Stonecutter projects.

### T069 — GitLab/source-host diversity

- [ ] **T069** — Keep GitLab/other forge searches as a recurring gap-directed lane, but do not pad the matrix with abandoned forks merely to increase host diversity. A candidate enters the main matrix only when it contributes a materially distinct, maintained technique or corpus.

---

# G021 — Second-pass promotion matrix

- [ ] **G021 · GATE** — The newly discovered stack is dispositioned by Enderloom value and verification cost.

| Candidate | Enderloom role | Disposition | Why |
|---|---|---|---|
| OpenRewrite | repeatable semantic source recipes | **BAKEOFF / INTEGRATE NOW** | strongest ready-made recipe architecture for learned port fixes |
| Spoon | Java AST analysis/transformation | **BAKEOFF NOW** | rich typed source model; good companion to learned rules |
| GumTree-Spoon | Java AST edit scripts | **BAKEOFF NOW** | mine before/after port transformations |
| RefactoringMiner | higher-level refactoring detection | **BAKEOFF NOW** | recognizes structural API evolution beyond textual diffs |
| Eclipse JDT/JDT LS | compiler/symbol/refactor oracle | **INTEGRATE ORACLE NOW** | real target-classpath semantics and diagnostics |
| Forge Srg2Source | Minecraft source symbol remapping | **BAKEOFF NOW** | directly built for source-level Minecraft/porting refactors |
| Forge renamer + SrgUtils | mapping-format/source/JAR renaming | **BAKEOFF NOW** | current Forge-native remapping path |
| Mapping-IO | mapping normalization | **BAKEOFF / LIKELY PROMOTE** | multi-format, ecosystem-native mapping layer |
| Tiny Remapper | JAR remapping | **BAKEOFF / ORACLE** | fast compiled-artifact remapper; retain edge-case tests |
| Intermediary + Matcher + Stitch | cross-version identity graph | **INTEGRATE CONCEPT/PATTERNS** | proven stable naming/match-chain methodology |
| Enigma | deobfuscation/mapping UI+CLI | **STUDY / ORACLE** | useful evidence tool, not source-port engine |
| Mercury + Lorenz | source remap/access-transformer rewrite | **BAKEOFF** | mapping-aware source transformation comparator |
| Sinytra Connector Adapter | general compatibility transformation patterns | **TOP-PRIORITY STUDY + PORT RULE CORPUS** | exact anti-one-off architecture Enderloom needs |
| Sinytra Launchpad | Fabric-style -> NeoForge dev translation | **STUDY / MATCH OR EXCEED** | concrete metadata/entrypoint/access-widener baseline |
| Forgified Fabric API | Fabric semantics on NeoForge | **CORPUS / SEMANTIC ORACLE** | API correspondence evidence |
| Porting Lib | Forge-style semantics on Fabric | **CORPUS / SEMANTIC ORACLE** | explicit porting utility set |
| MixinTransmogrifier | Fabric Mixin -> Forge compatibility | **STUDY / RULE CORPUS** | mixin compatibility transformations |
| MixinExtras | cross-loader mixin semantics | **STUDY / RULE CORPUS** | modern injector compatibility knowledge |
| NeoFormRuntime | NeoForge target artifact graph | **INTEGRATE WHERE APPLICABLE** | authoritative deobfuscate/merge/patch/recompile pipeline |
| ModDevGradle | NeoForge/legacy Forge build fixtures | **INTEGRATE FIXTURE SUPPORT** | current official dev plugin, config-cache aware |
| Unimined | broad loader/version build matrix | **BAKEOFF / FIXTURE GENERATOR** | unusually broad modern+legacy coverage |
| Stonecutter | one-tree multi-version source layout | **INTEGRATE OUTPUT STRATEGY** | demonstrated across 1.20 -> 26.x and loaders |
| loom-back-compat | obfuscated <26 vs unobfuscated 26.x bridge | **STUDY / FIXTURE SUPPORT** | reduces duplicated build scripts across naming-era boundary |
| Forgix | merged multi-loader/version artifact | **CONDITIONAL BAKEOFF** | useful QoL, but needs strict class/resource integrity gates |
| Revapi | API compatibility classification | **INTEGRATE ORACLE NOW** | rich source/binary/semantic API analysis |
| japicmp | fast JAR API diff | **INTEGRATE SECOND ORACLE** | cheap independent API-delta signal |
| Vineflower | source reconstruction | **LIKELY PRIMARY DECOMPILER** | modern, multithreaded, quality-focused |
| Byte Buddy | bytecode transformation | **CONDITIONAL** | compiled-only compatibility/agent paths |
| Recaf | bytecode investigation/repair | **STUDY / QA TOOL** | rich decompiler/compiler/assembler comparator |
| SootUp | call graph/dataflow | **CONDITIONAL HARD-CASE** | powerful but too expensive for default lane |
| MFT + USN direct | Windows instant file index | **IMPLEMENT PROTOTYPE NOW** | avoids full tree rescans while preserving completeness |
| fx patterns | Rust MFT/USN implementation reference | **STUDY** | real persistent-index/journal-tail architecture |
| redb / Fjall | specialized embedded KV | **CONDITIONAL** | only if profiled hot paths beat SQLite/CAS with durability proof |

---

## T070 — Enderloom conversion architecture after this scour

- [ ] **T070** — Implement the conversion stack as cooperating stages rather than one giant heuristic transformer:

```text
SOURCE / JAR / MODPACK INPUT
        |
        v
[identity + provenance + license/permission]
        |
        v
[target universe reconstruction]
  - Minecraft version
  - loader + loader version
  - Java version
  - mappings/namespaces
  - authoritative target APIs
        |
        v
[version/API delta graph]
  - Mapping-IO / mappings
  - Intermediary Matcher/Stitch evidence
  - Revapi + japicmp
  - JDT symbol model
  - RefactoringMiner/GumTree evidence
        |
        v
[semantic migration planner]
  - reusable compatibility knowledge graph
  - Sinytra/Porting-Lib/FFAPI-derived concepts
  - confidence + ambiguity tracking
        |
        v
[source transformation]
  - OpenRewrite recipes
  - Spoon/JDT fallback transforms
  - Srg2Source/Mercury mapping-aware operations
        |
        v
[loader/build adaptation]
  - metadata/entrypoints/AW/AT
  - Loom / ModDevGradle / ForgeGradle / Unimined
  - optional Stonecutter project generation
        |
        v
[compile + repair loop]
  - compiler/JDT diagnostics
  - recipe selection/refinement
  - bytecode/decompiler evidence only when needed
        |
        v
[runtime fixture]
  - client/server launch
  - dependency/loader matrix
  - content/fidelity checks
        |
        v
[verified reusable knowledge]
  - successful generalized fix becomes recipe + regression fixtures
```

No stage may erase information merely because the next tool cannot represent it. Preserve provenance and unresolved ambiguity through the pipeline.

---

## T071 — Mandatory learned-port knowledge base

- [ ] **T071** — Every nontrivial verified conversion fix must be reusable.

Record:

- source MC/loader/API range;
- target MC/loader/API range;
- triggering structural pattern;
- symbol/mapping evidence;
- semantic intent;
- transformation recipe;
- negative guards;
- compiler proof;
- runtime proof;
- mods/fixtures validated;
- invalidation conditions;
- provenance/license of any upstream-derived logic.

This turns AoA and every later converted mod into training/evidence for the deterministic converter without requiring an ML black box to guess silently.

---

## T072 — Cross-project mining corpus

- [ ] **T072** — Build a lawful/reference corpus of real open-source ports and multi-loader siblings to mine generalized transformations.

Priority classes:

- same mod across consecutive MC versions;
- same mod Fabric + NeoForge/Forge sibling modules;
- ports that recently crossed 1.21.x -> 26.x;
- mods using Stonecutter across the naming-era transition;
- Sinytra compatibility patches with known affected mods;
- Forge/NeoForge migration examples;
- Fabric API/FFAPI and Porting-Lib counterpart behavior.

The corpus feeds rule discovery. It is not permission to copy incompatible-license source into Enderloom or user mods.

---

## T073 — Challenge gate: never confuse compilation with a successful port

- [ ] **T073** — A converted mod is not complete because it compiles.

Require, where applicable:

- mod metadata loads under the target loader;
- dependency graph resolves automatically;
- registries/content counts match expected source behavior;
- recipes/loot/tags/datagen/resources survive;
- networking works client/server;
- mixins apply to intended targets;
- configs persist/migrate;
- rendering works;
- worldgen/datafix/versioned data are preserved;
- server-only/client-only boundaries work;
- no source content was silently dropped;
- runtime launch and representative gameplay path pass;
- generated build is reproducible from the normal Enderloom pipeline without hand-editing.

Any manual source surgery required to finish a fixture is a converter defect or missing recipe until generalized or explicitly proven irreducibly project-specific.

---

# Evidence ledger — second deep scour

Version-sensitive facts must be rechecked at implementation time. Upstream self-benchmarks are discovery evidence, not promotion proof.

## Semantic source migration / API intelligence

- OpenRewrite: https://github.com/openrewrite/rewrite
- Spoon: https://github.com/INRIA/spoon
- GumTree-Spoon AST Diff: https://github.com/SpoonLabs/gumtree-spoon-ast-diff
- RefactoringMiner: https://github.com/tsantalis/RefactoringMiner
- Eclipse JDT Language Server: https://github.com/eclipse-jdtls/eclipse.jdt.ls
- Revapi: https://github.com/revapi/revapi
- japicmp: https://github.com/siom79/japicmp
- SootUp: https://github.com/soot-oss/SootUp

## Minecraft remapping / mappings / reconstruction

- MinecraftForge Srg2Source: https://github.com/MinecraftForge/Srg2Source
- MinecraftForge renamer: https://github.com/MinecraftForge/renamer
- MinecraftForge SrgUtils: https://github.com/MinecraftForge/SrgUtils
- MinecraftForge BinaryPatcher: https://github.com/MinecraftForge/BinaryPatcher
- Fabric Mapping-IO: https://github.com/FabricMC/mapping-io
- Fabric Tiny Remapper: https://github.com/FabricMC/tiny-remapper
- Fabric Intermediary: https://github.com/FabricMC/intermediary
- Fabric Enigma: https://github.com/FabricMC/Enigma
- Fabric Stitch: https://github.com/FabricMC/stitch
- Matcher: https://github.com/sfPlayer1/Matcher
- Cadix Mercury: https://github.com/CadixDev/Mercury
- Cadix Lorenz: https://github.com/CadixDev/Lorenz
- Vineflower: https://github.com/Vineflower/vineflower
- ForgeFlower historical comparator: https://github.com/MinecraftForge/ForgeFlower

## Loader/version compatibility and build tooling

- Sinytra Connector: https://github.com/Sinytra/Connector
- Sinytra MixinTransmogrifier: https://github.com/Sinytra/MixinTransmogrifier
- Sinytra Launchpad: https://github.com/Sinytra/Launchpad
- Sinytra Forgified Fabric API: https://github.com/Sinytra/ForgifiedFabricAPI
- Sinytra Connector Extras: https://github.com/Sinytra/ConnectorExtras
- Porting Lib: https://github.com/Fabricators-of-Create/Porting-Lib
- MixinExtras: https://github.com/LlamaLad7/MixinExtras
- NeoFormRuntime: https://github.com/neoforged/NeoFormRuntime
- ModDevGradle: https://github.com/neoforged/ModDevGradle
- Architectury Loom: https://github.com/architectury/architectury-loom
- Unimined: https://github.com/unimined/unimined
- Forgix: https://github.com/PacifistMC/Forgix
- Stonecutter docs: https://stonecutter.kikugie.dev/
- Stonecutter real-world 26.x/multi-loader example: https://github.com/OpenShock/Integrations.Minecraft
- loom-back-compat canonical link observed in current projects: https://codeberg.org/KikuGie/loom-back-compat

## Bytecode / compiled-code lane

- Byte Buddy: https://github.com/raphw/byte-buddy
- Recaf: https://github.com/Col-E/Recaf
- ASM: https://gitlab.ow2.org/asm/asm

## Windows indexing references

- Windows USN change journal docs: https://learn.microsoft.com/windows/win32/fileio/change-journals
- `fx` Rust MFT/USN implementation reference: https://github.com/tyler-builds/fx
- `usn-journal-rs`: https://github.com/wangfu91/usn-journal-rs

## Specialized storage challengers

- redb: https://github.com/cberner/redb
- Fjall: https://github.com/fjall-rs/fjall

---

# What this pass changes in priority

The original tech-stack scout was strongest on **runtime/app infrastructure**. This second scour shows Enderloom's biggest remaining leverage is not another cache or UI framework. It is a **semantic Minecraft migration platform** that combines:

1. authoritative mappings and target reconstruction;
2. structural API/refactoring diffs;
3. reusable typed source recipes;
4. loader compatibility knowledge mined from mature compatibility layers;
5. compile/runtime feedback that turns every successful repair into a regression-protected reusable rule.

That should become the center of the converter roadmap. Performance work still follows the original scout, but the conversion engine should stop treating ports as a sequence of isolated compiler errors.

---

# G022 — Final second-pass completion gate

- [ ] **T074** — Reconcile this delta against `ENDERLOOM_NEXTGEN_TECH_STACK_SCOUT.md`; deduplicate any item Codex has already implemented since the scout was written and retain the stronger implementation/proof requirement.
- [ ] **T075** — For every **BAKEOFF NOW / INTEGRATE NOW** candidate above, create at least one production-shaped Enderloom fixture before promotion.
- [ ] **T076** — Run a real representative mod conversion through the composed T070 pipeline and record where each stage removes manual work or still fails.
- [ ] **T077** — Convert every nontrivial failure discovered by T076 into a reusable recipe/compatibility rule plus negative and runtime regression fixtures.
- [ ] **T078** — Re-run one final gap-directed search only across uncovered categories, not the already-reconciled whole internet. A search miss is `unresolved`, not proof of absence.
- [ ] **G022 · FINAL GATE** — This challenger delta is merged without deleting prior guarantees; new candidates are promoted only with equivalent-work correctness/runtime evidence; Codeberg/SourceHut crawler limitations remain disclosed; and the next Enderloom conversion can execute from these tasks without another planning-only pass.


---

# THIRD DEEP-SCOUR DELTA — 2026-09-26

This section is an **additive continuation** of G013-G022 / T041-T078. It does not invalidate or renumber earlier tasks. The third pass deliberately searched the remaining high-risk gaps rather than repeating the same Rust/cache/UI ecosystem sweep.

## Coverage ledger for this pass

| Coverage dimension | Third-pass status | Material result |
|---|---|---|
| Mapping/remap era transition | CLOSED WITH NEW WORK | 26.1+ must use a separate unobfuscated-era pipeline; Ravel and current Loom migration paths added |
| Existing Minecraft porter ingestion | CLOSED WITH NEW WORK | reqsery `mc-mod-porter` is now a full-integration candidate under the user's stated permission, not merely a reference |
| Fabric -> NeoForge compatibility | RECONCILED | Existing Sinytra/Adapter work retained and strengthened |
| Forge/NeoForge -> Fabric compatibility | CLOSED WITH NEW WORK | Kilt/Twill + historical Patchwork add the inverse transformation corpus |
| Loader metadata / nested deps | CLOSED WITH NEW WORK | typed loader-metadata IR + nested dependency IR required |
| Access widening / class tweaking / interface injection | CLOSED WITH NEW WORK | Class Tweakers, AT/AW conversion and non-equivalent interface-injection semantics added |
| Kotlin migration | CLOSED WITH NEW WORK | Ravel + current OpenRewrite Kotlin + Kotlin Analysis API fallback lane |
| Runtime validation | CLOSED WITH NEW WORK | HeadlessMC / MC-Runtime-Test + loader-native test layers |
| Minecraft data/resource migration | CLOSED WITH NEW WORK | `misode/mcmeta`, `minecraft-data`, DFU/Codec/DataComponent and datagen-diff lanes |
| Gradle/build iteration | CLOSED WITH STRONGER REQUIREMENT | configuration-cache compatibility becomes a generated-project acceptance gate |
| Windows file discovery | CLOSED WITH OPTIONAL CHALLENGER | Everything IPC may accelerate discovery, but never becomes canonical state |
| Modpack manifest/reference implementations | CLOSED WITH COMPARATOR WORK | packwiz/XMCL/ATLauncher patterns retained as focused comparators only |
| GitHub | COVERED | primary source repos/docs inspected |
| GitLab | COVERED WHERE MATERIAL | ASM and other canonical non-GitHub sources remain in the evidence ledger |
| Codeberg | PARTIAL BY HARNESS | direct crawler blocked; package/docs/mirror evidence remains the accepted alternate discovery route |
| SourceHut | PARTIAL BY HARNESS | direct crawler blocked; no material third-pass candidate surfaced through alternate search |

**Convergence rule:** another broad sweep is not justified unless a new loader/version/tool family appears or implementation exposes a concrete missing capability. Future research should be triggered by an unresolved acceptance gap, not curiosity-only repetition.

## Execution / resume contract for the enlarged spec

- Resume from the earliest unchecked or invalidated task whose dependencies are satisfied; do **not** restart the scout or re-run settled research without a real invalidator.
- Execute one coherent subsection or roughly **6-12 ready leaf tasks per internal execution window**, then update inline state/proof and continue automatically. This is context management, not permission to stop early.
- For an actual blocker, keep the item unchecked and record it inline as `BLOCKED: <exact cause>; NEXT: <exact recovery action>`. Continue independent work while that recovery is pending.
- After **two materially unchanged failed attempts**, change strategy: repair the missing capability/environment/abstraction or use a materially different supported route. Never loop the same failure.
- During implementation, use the cheapest decisive **targeted changed-path test** after each coherent mutation. Run broader build/runtime/regression suites at parent gates and the final completion gate, or after a later mutation invalidates earlier proof.
- A passing compiler/build is intermediate evidence only. Runtime/data/resource equivalence requirements in T073 and G027-G028 remain mandatory.

---

# G023 — Mapping-era architecture: pre-26.1 and 26.1+ are different pipelines

- [ ] **G023 · GATE** — Enderloom classifies every source/target pair by Minecraft naming era and chooses the correct transformation pipeline instead of assuming every version requires deobfuscation/remapping.

### T079 — Add explicit mapping-era state to the conversion graph

- [ ] **T079** — Model at least these eras in the canonical version graph:

`OBFUSCATED / MAPPED <= 1.21.11`

- runtime/dev namespaces may include obfuscated, official/Mojang, Intermediary, Yarn, Parchment, SRG/TSRG and loader-specific derivatives;
- remapping is a first-class transformation;
- source and compiled-JAR namespaces must be detected, never guessed.

`UNOBFUSCATED / OFFICIAL >= 26.1`

- Minecraft ships unobfuscated Java names;
- Java 25 is the baseline at the 26.1 transition;
- Fabric's 26.1+ Loom path no longer remaps Minecraft/mods;
- Fabric `remapJar`/`modImplementation`-style assumptions must not be carried forward blindly;
- loader/API migration remains necessary even though obfuscation remapping disappears.

Every conversion plan must record:

`source era -> source namespace -> normalization namespace -> target era -> target namespace`

Do not send an unobfuscated 26.x project through the old remap stack merely because that stack exists.

### T080 — Make 1.21.11 -> 26.1 a named crossing, not a normal adjacent bump

- [ ] **T080** — Implement a dedicated transition pipeline for the obfuscated-to-unobfuscated boundary.

Preferred order for Yarn-era Fabric source:

1. remain on the **source Minecraft version**;
2. migrate source from Yarn to Mojang/official naming while the old mappings still exist;
3. resolve Mixin, MixinExtras, class-tweaker/access-widener and Kotlin mapping fallout;
4. then move the project to 26.1+;
5. apply the independent Fabric API / loader / vanilla API changes;
6. rebuild under Java 25;
7. run full compile + runtime equivalence gates.

Fabric's own documentation explicitly warns that mapping migration is not a substitute for Fabric API renames. Enderloom must represent those as separate edges.

### T081 — Ingest official/current migration corpora as version-step evidence

- [ ] **T081** — Turn the current Fabric and NeoForge migration material into machine-readable version-step edges with provenance.

At minimum ingest:

- Fabric 1.21.11 -> 26.1 mapping-migration docs;
- Fabric 26.1 API rename table and IntelliJ migration-map artifact;
- Fabric 26.1/26.2 porting notes;
- NeoForge migration primers through `1.21.11 -> 26.1`, `26.1.x -> 26.2`, and `26.2 -> 26.3`;
- official Minecraft technical changes where they affect Java version, pack format, registries, data components or runtime behavior.

Store each fact as:

`source_version | target_version | subsystem | old_shape | new_shape | loader_scope | source_url | source_hash/revision | confidence | verified_fixture`

Do not flatten prose into untraceable regex replacements.

### T082 — Add Ravel as the mapping-migration oracle for complex Java/Kotlin projects

- [ ] **T082** — Use **Ravel** as an implementation/reference oracle for source remapping that Loom alone does not cover well.

Ravel currently supports:

- Java;
- Kotlin;
- Java Mixins and MixinExtras;
- Class Tweakers / Access Wideners;
- chained mapping inputs through Mapping-IO;
- PSI-based resolution in IntelliJ.

Enderloom should not require IntelliJ to perform an automated conversion. Instead:

- mine Ravel's MIT-licensed implementation where useful;
- build equivalent headless fixtures;
- use Ravel on a representative corpus as an external oracle during development;
- preserve `TODO(Ravel)`-style unresolved mappings as explicit unresolved transformations rather than silently emitting wrong names.

### T083 — Keep Parchment as a legacy semantic-enrichment lane only

- [ ] **T083** — For pre-26.1 official/Mojang mappings, use Parchment data when it materially resolves parameter-name/Javadoc ambiguity.

Rules:

- Parchment supplements Mojang mappings; it is not the canonical symbol identity layer;
- preserve exact Parchment version/provenance used by a rule;
- do not require Parchment for 26.1+ where unobfuscated Minecraft already exposes readable parameter/local names;
- historical conversions must remain reproducible even if current Parchment development winds down.

### T084 — Add NeoForged AutoRenamingTool as the modern compiled-JAR remap comparator

- [ ] **T084** — Evaluate **NeoForged AutoRenamingTool (ART)** as the current successor to ForgeAutoRenamingTool/FART for compiled-JAR renaming and auxiliary transforms.

Useful properties:

- mappings through SrgUtils-supported formats;
- multiple mapping files/merge order;
- reverse mapping;
- library classpath for inheritance analysis;
- threaded operation;
- extensible built-in transformations.

A/B it against Enderloom's Tiny Remapper/SrgUtils/bytecode path. Promote individual capabilities, not redundant remap engines for their own sake.

---

# G024 — Full MC Mod Porter ingestion under the user's stated permission

- [ ] **G024 · GATE** — Enderloom has ingested the useful code, data model and verified migration knowledge from `reqsery/mc-mod-porter` without creating a second competing source of truth or losing provenance.

### T085 — Treat MC Mod Porter as a full-integration candidate, not a link list

- [ ] **T085** — Snapshot the exact upstream commit/release of **reqsery/mc-mod-porter** and perform a complete component inventory before integration.

Current high-value areas include:

- `auto-porter/` GUI/CLI port engine;
- `knowledge-base/minecraft/` adjacent-version migration facts;
- `knowledge-base/loaders/` Fabric/NeoForge version tables;
- `patterns/method-renames.md`;
- `patterns/class-moves.md`;
- `patterns/signatures.md`;
- Java/toolchain requirements;
- templates;
- build verification and remaining-error reporting;
- troubleshooting knowledge and accuracy policy.

Because the user has stated direct permission to fully ingest/use this project, Enderloom should compare and integrate the actual useful implementation rather than artificially reimplementing everything from scratch. Preserve the exact permission/provenance record alongside upstream license metadata.

### T086 — Merge its knowledge base into Enderloom's provenance-bearing rule store

- [ ] **T086** — Import verified facts into the canonical T071 learned-port knowledge base.

Do **not** maintain two independent sets of migration truth.

Each imported entry gains:

- upstream source file/path;
- upstream commit/release;
- original cited primary source;
- supported source/target versions;
- loader scope;
- language scope;
- transformation category;
- confidence;
- Enderloom fixture status;
- whether Enderloom has superseded/generalized it.

If an upstream rule conflicts with newer official evidence or an Enderloom runtime fixture, mark the discrepancy and resolve it; do not silently pick one.

### T087 — Differentially test MC Mod Porter against Enderloom

- [ ] **T087** — Run the same representative source projects through:

1. current Enderloom conversion;
2. MC Mod Porter 1.2.x-beta lineage;
3. the composed Enderloom + imported-rule candidate.

Measure:

- successfully transformed files;
- compile errors remaining;
- false-positive edits;
- missed API changes;
- metadata accuracy;
- target loader correctness;
- runtime success;
- manual interventions required;
- wall-clock conversion/build time.

Promote the strongest implementation per transformation family. The combined engine must be no worse than either input on protected fixtures.

### T088 — Preserve adjacent-hop migration semantics while allowing proven direct jumps

- [ ] **T088** — Represent MC Mod Porter's adjacent-version model as graph edges, not a hardcoded requirement to rewrite the entire project once per hop.

Rules:

- compose verified adjacent transforms when a direct source->target recipe is absent;
- collapse compatible rename/move steps when composition is proven equivalent;
- preserve ordering for non-commutative structural migrations;
- run intermediate semantic checks where a later rule depends on an earlier API state;
- allow a direct jump only when direct fixtures prove it preserves the same final behavior.

This keeps the safety of stepwise migration without forcing unnecessary disk/build churn.

### T089 — Turn MC Mod Porter's documented manual gaps into Enderloom acceptance work

- [ ] **T089** — Treat upstream statements such as "logic changes remain manual" or currently manual 26.2 rendering/registration/datagen/networking/mixin/worldgen changes as an **uncovered capability list**, not an Enderloom completion boundary.

For every such gap:

1. find authoritative source/target evidence;
2. classify whether the change can be deterministic;
3. implement a semantic recipe when possible;
4. add negative controls;
5. compile;
6. runtime-test;
7. retain genuinely project-specific cases as explicit assisted migrations with exact context.

### T090 — Record license/permission boundaries mechanically

- [ ] **T090** — Attach provenance to imported files/rules and preserve the user's stated direct permission separately from upstream's public `MIT + Commons Clause` license metadata.

Do not infer rights beyond the permission actually granted. If Enderloom later redistributes upstream-derived code outside that grant's known scope, require a recorded license/permission review rather than silently assuming the public license alone permits every distribution model.

---

# G025 — Bidirectional loader compatibility corpus: Connector is only half the picture

- [ ] **G025 · GATE** — Enderloom learns loader differences from both Fabric->NeoForge and Forge/NeoForge->Fabric compatibility implementations, then expresses those differences as loader-neutral transformation families.

### T091 — Mine Kilt + Twill as the inverse of Connector

- [ ] **T091** — Add **Kilt** and **Twill** to the active compatibility corpus.

Kilt is especially valuable because it attacks the inverse problem from Connector:

- recreates FML behavior on Fabric Loader;
- bridges Forge APIs toward Fabric-native behavior;
- remaps Forge/SRG mod artifacts toward Fabric's historical Intermediary environment;
- applies dedicated fixers/injects for incompatible assumptions.

Use it to discover transformation families that a source porter needs even when Enderloom does **not** ship Kilt as a runtime dependency.

Kilt remains experimental. Treat working compatibility code as evidence, not as automatic proof of universal correctness.

### T092 — Preserve Patchwork as an archived transformation corpus, never a runtime dependency

- [ ] **T092** — Mine historical **Patchwork Patcher/API** transformations that still generalize:

- Forge `mods.toml` -> Fabric metadata;
- `@OnlyIn` -> environment/sidedness equivalents;
- `@ObjectHolder` handling;
- event subscriber/listener transformation;
- Forge event registration concepts;
- SRG -> official -> Intermediary remap staging;
- modular API-reimplementation boundaries.

Patchwork is archived and version-limited. Do not revive it as a production dependency. Extract only transformations that are revalidated against current loaders.

### T093 — Build bidirectional transformation families rather than loader-pair spaghetti

- [ ] **T093** — Generalize Connector/Adapter, Kilt, FFAPI, Porting Lib and historical Patchwork evidence into a shared model:

`capability -> source loader representation -> canonical semantic intent -> target loader representation -> required runtime shim? -> verification`

Initial families:

- lifecycle/entrypoints;
- event registration;
- registries/deferred registration;
- configuration;
- networking;
- capabilities/components/attachments;
- tags and common conventions;
- rendering/client hooks;
- commands;
- datagen;
- access modification;
- enum/interface extension;
- mixin/injection expectations.

The converter should translate **intent**, not merely loader API spelling.

### T094 — Use FFAPI/Forgified Loader/API compatibility checks as correspondence evidence

- [ ] **T094** — Where Sinytra's Forgified Fabric API / Forgified Fabric Loader and related compatibility tests compare or expose Fabric public APIs in NeoForge environments, ingest those mappings as additional evidence for loader-neutral capability correspondence.

Cross-check against Porting Lib and real sibling-mod implementations. Do not treat API-name equality as behavioral equivalence without runtime fixtures.

---

# G026 — Typed loader metadata IR and bytecode-access IR

- [ ] **G026 · GATE** — Loader metadata, access changes, nested dependencies and entrypoint semantics round-trip through typed intermediate representations instead of fragile template replacement.

### T095 — Build one lossless `ModManifestIR`

- [ ] **T095** — Parse source metadata into a canonical IR and emit the target loader's metadata from that IR.

Minimum typed fields:

- mod ID / aliases / `provides`;
- version;
- human metadata and license;
- entrypoints / main classes;
- loader and Minecraft constraints;
- required/optional/incompatible dependencies;
- version ranges;
- client/server/both environment constraints;
- mixin configuration files;
- access/Class-Tweaker declarations;
- language adapters;
- nested/embedded libraries;
- ordering constraints when the loader supports them;
- services/transformers where applicable;
- arbitrary unknown/custom metadata retained with provenance.

Initial formats:

- Fabric `fabric.mod.json`;
- NeoForge `META-INF/neoforge.mods.toml`;
- Forge `META-INF/mods.toml` and relevant historical forms;
- Quilt `quilt.mod.json` where Enderloom supports Quilt-era source projects.

### T096 — Give nested dependencies their own `EmbeddedDependencyIR`

- [ ] **T096** — Translate Fabric nested JARs and NeoForge Jar-in-Jar deliberately.

Preserve:

- artifact identity;
- embedded path;
- declared/preferred version;
- supported version range;
- optionality;
- transitive behavior;
- loader visibility;
- original Maven/source coordinates where known;
- checksum/provenance.

Do not assume Fabric's nested-mod resolution and NeoForge's JarJar version negotiation are identical. Emit target semantics explicitly and add conflict/version-selection fixtures.

### T097 — Build `AccessMutationIR` for AW/Class Tweaker/AT/interface injection

- [ ] **T097** — Normalize access and development-time type changes separately from runtime behavior.

Represent at least:

- widen class/member accessibility;
- remove/change final constraints where supported;
- transitive access changes;
- interface injection;
- namespace used by the source file;
- target class/member descriptor;
- whether the change exists only for development source visibility or must also occur at runtime.

Use current **Architectury Loom 1.17** AW->AT conversion APIs and **Neo Loom** as concrete implementation references across obfuscated and unobfuscated eras.

Critical rule: **interface injection is not always a simple AW->AT translation**. Fabric Class Tweakers can declare injected interfaces; NeoForge ModDevGradle's interface-injection data is development-time and still requires runtime Mixin/Coremod behavior. Enderloom must emit both sides when needed and test actual runtime type behavior.

### T098 — Require lossless metadata round-trip fixtures

- [ ] **T098** — For every supported source metadata format:

1. parse -> IR;
2. IR -> same source format;
3. canonicalize formatting only;
4. assert all known fields preserve value/semantics;
5. assert unknown/custom fields survive unless the target format genuinely cannot represent them;
6. emit a user-visible compatibility note for any unrepresentable target concept.

A successful target launch does not excuse silently discarded metadata.

### T099 — Make metadata and source transformations share one dependency/sidedness model

- [ ] **T099** — Source rewrites, generated Gradle dependencies and emitted mod metadata must resolve from the same canonical dependency and environment model.

Reject split-brain outcomes such as:

- build depends on a library but target metadata forgets it;
- metadata marks a dependency optional while generated source imports it unconditionally;
- client-only classes are emitted into common/server initialization;
- nested library is bundled but also declared as an external hard requirement.

---

# G027 — Runtime proof lane: converted mods must actually boot and exercise behavior

- [ ] **G027 · GATE** — Enderloom automatically proves more than compilation by launching representative target-loader clients/servers and running loader-native tests wherever feasible.

### T100 — Add HeadlessMC / MC-Runtime-Test as a CI/runtime challenger

- [ ] **T100** — Integrate or reproduce the useful architecture from **HeadlessMC + MC-Runtime-Test** for automated client runtime proof.

Target capabilities:

- install exact Minecraft + loader + Java matrix;
- stage the freshly built converted JAR;
- launch client headlessly/Xvfb where supported;
- detect early loader/mixin/crash failures;
- run Minecraft GameTests;
- return deterministic process exit status;
- cache game/runtime inputs without reusing stale converted artifacts.

Guardrail: MC-Runtime-Test documents cases where Forge/NeoForge GameTest discovery needs extra setup. Require a **minimum expected test count** so "zero tests discovered" cannot become a false pass.

### T101 — Use loader-native testing layers before custom smoke scripts

- [ ] **T101** — Prefer the target loader's supported harness when available:

- Fabric Loader JUnit for unit-level Minecraft-aware tests;
- Fabric/Minecraft GameTest for real game behavior;
- Forge/NeoForge GameTest server paths;
- NeoForge/FancyModLoader production-client style tests for loader behavior;
- Enderloom's own target-specific smoke harness only where upstream tooling lacks coverage.

Tests generated during conversion should call production code, not a shadow implementation invented solely to pass CI.

### T102 — Add explicit Mixin/refmap/transformation proof

- [ ] **T102** — A Mixin-heavy mod does not pass because the Java compiler accepted annotations.

Verify:

- mixin config discovery;
- refmap generation/remapping where relevant;
- target class/method/descriptor existence;
- expected injector application count;
- required/optional injection semantics;
- MixinExtras compatibility/version requirements;
- post-transform bytecode validity on risky fixtures;
- no unintended extra targets.

Use **MinecraftDev** inspections/navigation rules and Sponge Mixin debug/audit capabilities as development oracles. Preserve known-good/known-bad fixtures for every recurring failure class.

### T103 — Add runtime content census/equivalence checks

- [ ] **T103** — Generate a small Enderloom runtime probe for converted fixtures that records, as applicable:

- mod loaded IDs/versions;
- registered blocks/items/entities/menus/recipes/etc.;
- tags and key membership;
- commands;
- network payload registration;
- configs loaded/defaulted;
- resource/data pack presence;
- representative worldgen or registry entries;
- known event callbacks fired;
- client/server environment boundaries.

Compare the target result against the source fixture's expected capability/content manifest, allowing only explicitly version-driven differences.

### T104 — Make Java/toolchain selection part of runtime identity

- [ ] **T104** — The conversion graph owns the required Java runtime/toolchain per Minecraft target and proves the generated build under that runtime.

At minimum preserve historical lanes needed by accepted Enderloom scope and current transitions such as Java 17, Java 21 and Java 25. Do not let the machine's default `java` silently choose a different runtime.

---

# G028 — Data/resource migration intelligence, not just Java migration

- [ ] **G028 · GATE** — Enderloom can detect and validate version-sensitive Minecraft data/resource changes so a Java-clean conversion does not silently lose gameplay content.

### T105 — Use `misode/mcmeta` as the primary versioned generated-data diff corpus

- [ ] **T105** — Ingest **misode/mcmeta** as a highly useful secondary corpus of version-controlled Minecraft generated data/assets from 1.14 onward.

High-value branches/data include:

- version summaries;
- registries;
- block state properties/defaults;
- item components;
- command trees;
- sounds;
- vanilla `data/` snapshots;
- vanilla `assets/` snapshots;
- prebuilt `diff` history.

Use the per-version tags/commits to build machine-readable version deltas for resources and data packs.

Trust model:

- `mcmeta` is not Mojang-authoritative;
- for load-bearing conversions, Enderloom CI should be able to reproduce the relevant report/data from official Minecraft JARs/data generators and compare hashes/normalized content;
- divergence becomes an investigation, not silent truth selection.

### T106 — Use `minecraft-data` as a second cross-version oracle

- [ ] **T106** — Add **PrismarineJS/minecraft-data** as a complementary evidence source for structured cross-version facts such as:

- blocks/items/entities;
- recipes;
- protocol data/versions;
- commands;
- particles/sounds;
- legacy 1.12 -> post-flattening IDs;
- feature availability.

Do not make a Java mod conversion depend on its Node ecosystem at runtime. Consume snapshots/generated data during tooling/fixture preparation and reconcile against official/generated Minecraft data where relevant.

### T107 — Add DFU/Codec/DataComponent-aware migration classification

- [ ] **T107** — Detect version transitions that alter persistent data representation rather than only Java API names.

Use Mojang **DataFixerUpper** concepts and current Codec/DataComponent APIs to classify:

- NBT -> Data Component transitions;
- schema-versioned saved data;
- codecs and stream codecs;
- dynamic registry serialization;
- component IDs/defaults;
- user/mod data that requires a DataFix or explicit migration path.

DFU is an architectural/data-migration oracle, not a magic source-code converter. If a mod owns saved data, generate regression worlds/data blobs and prove old data still loads after conversion.

### T108 — Run source and target datagen and compare normalized outputs

- [ ] **T108** — Where the mod has datagen:

1. run source datagen in a preserved source fixture when practical;
2. run target datagen from the converted project;
3. normalize ordering/known version-only formatting;
4. compare recipes, tags, loot, advancements, models, blockstates, languages, registry data and other generated outputs;
5. classify target-expected changes versus lost content;
6. fail conversion on unexplained disappearance.

User-authored static data/resources must be included in the same coverage manifest, not ignored because they were not generated.

### T109 — Track pack-format and registry capability changes in the version graph

- [ ] **T109** — Record data-pack/resource-pack format changes and structural capability changes as first-class version edges.

Examples include:

- new/removed data component formats;
- renamed/moved registries;
- datagen report shape changes;
- resource/model/render definition changes;
- command tree changes;
- worldgen/data-pack path changes.

Do not infer compatibility merely because JSON still parses.

---

# G029 — Kotlin and semantic-rewrite hardening

- [ ] **G029 · GATE** — Kotlin mods receive a first-class semantic migration path and Enderloom does not accidentally depend on stale/archived language tooling.

### T110 — Use the current OpenRewrite Kotlin implementation, not the archived standalone repo

- [ ] **T110** — Update T041's implementation note: the old standalone `openrewrite/rewrite-kotlin` repository was archived in 2026 because current Kotlin support lives in the main **OpenRewrite `rewrite`** repository/module.

The current Kotlin LST shares Java `J.*` semantic nodes for common constructs, making cross-language Minecraft recipes plausible.

Add Kotlin fixtures for:

- imports/package moves;
- method/constructor changes;
- extension functions;
- object/companion usage;
- Fabric Language Kotlin projects;
- Mixin classes written in Kotlin where supported by the loader/tooling;
- Gradle Kotlin DSL changes.

### T111 — Keep Ravel and Kotlin Analysis API as independent semantic oracles

- [ ] **T111** — When OpenRewrite Kotlin cannot confidently resolve a migration, compare against:

- Ravel/IntelliJ PSI behavior for mapping-driven source rewrites;
- JetBrains Kotlin Analysis API for reference targets, types, scopes and diagnostics.

Do not force every Kotlin project through a heavyweight IDE process. Use these as algorithmic/semantic references and test oracles; select the lightest headless implementation that preserves correctness.

### T112 — Add a hard OpenRewrite license/distribution fence

- [ ] **T112** — Separate:

- Apache-2.0 OpenRewrite framework/parsers/base recipes that Enderloom may depend on under their license;
- source-available/proprietary recipe modules that require additional review;
- Enderloom's own Minecraft-specific recipes.

Also verify artifact availability for offline/end-user builds. Enderloom must not suddenly require a Moderne/Code Genome account at runtime to perform a user's local conversion. Pin approved artifacts, cache/mirror them when permitted, and include an SBOM/provenance entry.

### T113 — Keep lightweight structural tools as prefilters, not authorities

- [ ] **T113** — JavaParser / ast-grep / similar tools may be used for fast indexing, candidate-rule discovery or cheap prefiltering if benchmarks justify them.

They do **not** replace type-aware OpenRewrite/JDT/Spoon compilation evidence for transformations whose correctness depends on overload resolution, inheritance, generics, symbols or loader semantics.

---

# G030 — Generated build systems must be fast, cache-safe and target-native

- [ ] **G030 · GATE** — Enderloom emits target-loader builds that use modern Gradle performance features without sacrificing loader correctness or reproducibility.

### T114 — Make Gradle Configuration Cache compatibility an acceptance gate

- [ ] **T114** — Generated modern projects should enable and pass Gradle Configuration Cache for normal developer tasks whenever the target loader/plugin versions support it.

Why this belongs in the converter:

- current Gradle 9 treats Configuration Cache as the preferred execution mode;
- ModDevGradle explicitly supports it;
- generated scripts are under Enderloom's control, so incompatible custom build logic should be fixed at generation time.

Track separately:

- first configuration/build;
- warm configuration-cache task start;
- compile/test/build time;
- cache hit/miss reason;
- correctness of produced artifacts.

Do not claim speed by skipping validation tasks.

### T115 — Keep Gradle as the canonical generated build for loader ecosystems

- [ ] **T115** — Do not replace target Fabric/NeoForge/Forge Gradle tooling with Mill/Coursier/custom dependency assembly merely because a generic Java build can be faster.

Loader plugins own critical setup/remapping/run/datagen/test behavior. Improve the Gradle path first through:

- Configuration Cache;
- Build Cache;
- correct incremental task inputs/outputs;
- isolated generated modules;
- dependency locking/verification;
- local artifact reuse;
- bounded parallelism.

Alternative build tools remain research-only unless they can reproduce the complete loader workflow with no loss.

### T116 — Emit reproducible conversion/build receipts

- [ ] **T116** — Every converted project/release fixture records:

- source project hash/checkpoint;
- Enderloom version/commit;
- migration rule-set hash;
- source/target MC + loader versions;
- Java/Gradle/plugin versions;
- resolved dependency lock/provenance;
- generated file manifest;
- final artifact SHA-256;
- runtime test identity/results.

Two clean conversions from the same inputs should either produce equivalent artifacts or a documented nondeterministic field that is normalized for comparison.

---

# G031 — Optional accelerator/comparator integrations that do not own truth

- [ ] **G031 · GATE** — Useful external accelerators can improve Enderloom when present without becoming required correctness dependencies.

### T117 — Optional Everything IPC fast path on Windows

- [ ] **T117** — Benchmark **Everything IPC** as an opportunistic accelerator for discovering existing Minecraft instances/mod files on Windows.

Strong current Rust options include `everything-ipc` and safe/high-level SDK wrappers.

Rules:

- only use when Everything is installed/running and the user permits local indexing use;
- never make it required;
- never use its live index as Enderloom's canonical state;
- verify discovered paths through normal filesystem identity/hash checks;
- retain the direct MFT+USN implementation as the self-contained high-performance path;
- measure cold/warm discovery and change-detection workloads before promotion.

### T118 — Keep packwiz as a modpack manifest/import-export reference

- [ ] **T118** — Study **packwiz** for its Git-friendly TOML metadata, CurseForge/Modrinth import/export, optional/client/server mod semantics and update metadata.

Promote data-model/provider patterns that improve Enderloom's pack handling; do not replace Enderloom's GUI/domain engine with packwiz or create a duplicate pack database.

### T119 — Add focused launcher comparators without reopening the launcher architecture

- [ ] **T119** — Add **X Minecraft Launcher** and **ATLauncher** to the continuing comparator notebook only for distinct implementation patterns not already covered by Modrinth/GD/Prism/Ferium.

Examples worth measuring/studying:

- XMCL hard/symbolic-link resource reuse and launcher-core package split;
- provider/import-export compliance behavior;
- ATLauncher GraphQL schema/codegen workflow and testable working-directory isolation.

Do not restart shell/framework selection because another launcher exists.

---

# G032 — Search/source coverage honesty and research stop condition

- [ ] **G032 · GATE** — The scout can claim broad coverage without pretending crawler blocks are proof of absence.

### T120 — Preserve Codeberg/SourceHut as unresolved-by-direct-crawler, not empty ecosystems

- [ ] **T120** — The current research harness is blocked by `robots.txt` for direct Codeberg and SourceHut crawling.

Continue accepted alternate routes when a concrete gap requires them:

- crates.io / docs.rs repository metadata;
- Maven/Gradle/plugin metadata;
- project websites/docs that link the canonical forge;
- search-engine result metadata;
- Git mirrors as **discovery hints only**;
- release/package registries;
- user-provided canonical links.

Do not use a third-party mirror's content as authority when the canonical source can be reached another legitimate way.

### T121 — Expand only when a named capability gap remains

- [ ] **T121** — After this pass, new ecosystem research is triggered by one of:

- a conversion failure with no existing rule family;
- a newly supported Minecraft/loader generation;
- an upstream tool deprecation/replacement;
- a measured performance loss against a comparator;
- a new user-approved codebase that materially overlaps Enderloom;
- a license/security issue invalidating a current choice.

Do not repeat broad "best GitHub projects" searches when the coverage matrix is unchanged.

### T122 — Require primary-source freshness at promotion time

- [ ] **T122** — Before integrating a candidate from this file, refresh its exact release/commit, maintenance status, license and relevant upstream API state.

A September 2026 scout is evidence for selection, not permission to assume those exact versions forever.

---

# G033 — Third-pass promotion matrix

- [ ] **G033 · GATE** — Newly found candidates have explicit dispositions and cannot drift into production merely because they sound useful.

| Candidate / pattern | Disposition after third pass | Why |
|---|---|---|
| Era-aware mapped vs unobfuscated pipeline | **INTEGRATE NOW** | Required for correct 1.21.11 <-> 26.x behavior |
| Fabric 26.1 API migration map + NeoForge primers | **INGEST NOW** | High-quality version-step migration evidence |
| Ravel | **BAKEOFF / ORACLE NOW** | Kotlin + Mixin + AW/Class Tweaker mapping migration coverage |
| Parchment | **LEGACY CONDITIONAL** | Valuable pre-26.1 semantic enrichment; unnecessary as primary 26.1+ mapping layer |
| NeoForged AutoRenamingTool | **BAKEOFF NOW** | Current Forge/NeoForge JAR renamer/remap successor |
| reqsery MC Mod Porter | **FULL-INTEGRATION BAKEOFF NOW** | Direct overlap, structured KB/patterns/porter, user-stated permission |
| Kilt/Twill | **MINE NOW / RUNTIME DEFERRED** | Best active inverse bridge corpus; experimental as user runtime dependency |
| Patchwork Patcher/API | **HISTORICAL CORPUS ONLY** | Excellent explicit transforms; archived/version-limited |
| `ModManifestIR` + `EmbeddedDependencyIR` | **IMPLEMENT NOW** | Prevents metadata/dependency semantic loss |
| `AccessMutationIR` | **IMPLEMENT NOW** | Unifies AW/Class Tweaker/AT while preserving interface-injection differences |
| HeadlessMC + MC-Runtime-Test pattern | **BAKEOFF NOW** | Real cross-loader client CI proof beyond compilation |
| Fabric Loader JUnit/GameTest + FML/NeoForge tests | **INTEGRATE TARGET-NATIVE** | Highest-confidence target-runtime testing |
| MinecraftDev static inspections | **MINE/ORACLE** | Rich Minecraft-specific Mixin/AW/AT validation logic |
| misode/mcmeta | **INGEST + REPRODUCE** | Excellent versioned data/resource diff corpus; verify load-bearing facts from official JARs |
| PrismarineJS minecraft-data | **SECOND ORACLE** | Broad structured version data, especially legacy/protocol |
| DataFixerUpper concepts | **INTEGRATE WHERE DATA PERSISTS** | Correct model for schema/data migration, not source rewrite |
| Current OpenRewrite Kotlin | **BAKEOFF NOW** | Headless semantic Kotlin path in current main project |
| Kotlin Analysis API | **CONDITIONAL ORACLE** | Strong semantic fallback; integration weight must be justified |
| Gradle Configuration Cache | **GENERATED-PROJECT GATE** | Measurable iteration win with current loader support |
| Everything IPC | **OPTIONAL CONDITIONAL** | Potential instant Windows discovery without owning state |
| packwiz | **COMPARATOR / IMPORT-EXPORT REFERENCE** | Strong pack metadata model, not a replacement engine |
| XMCL / ATLauncher | **FOCUSED COMPARATORS** | Useful isolated patterns; no shell-architecture reset |
| JavaParser / ast-grep | **PREFILTER ONLY** | Fast/light but not stronger than semantic compiler-aware lane for authoritative rewrites |
| Mill/Coursier as generated Minecraft build | **DEFER / REJECT PRIMARY** | Would bypass loader-owned Gradle behavior without proven full parity |

---

# G034 — Composed next-generation conversion pipeline v3

**G034 convergence section:** Enderloom executes one coherent pipeline using the strongest pieces from the original scout plus the second and third scours, with no duplicate engines fighting over canonical state.

### T123 — Implement the composed pipeline in this order

- [ ] **T123** — The target Enderloom conversion flow is:

1. **Immutable source checkpoint**
   - hash source tree;
   - identify VCS/dirty state;
   - preserve source untouched;
   - inventory source/build/resources.

2. **Detect version, loader, language and era**
   - Minecraft version;
   - Forge/NeoForge/Fabric/Quilt/etc.;
   - Java/Kotlin/Groovy mix;
   - mapped vs unobfuscated era;
   - namespace/mapping family;
   - Java/toolchain requirement.

3. **Parse canonical project IRs**
   - manifest/dependencies;
   - embedded JARs;
   - access mutations;
   - mixins;
   - Gradle/build model;
   - resources/data/datagen;
   - registries/content expectations.

4. **Construct authoritative target universe**
   - official target Minecraft artifacts;
   - target loader/plugin toolchain;
   - target Java;
   - mappings only where the era needs them;
   - dependency graph;
   - API snapshots/deltas.

5. **Normalize source symbols and mappings**
   - Mapping-IO/Tiny Remapper/SrgUtils/ART/Ravel-derived logic as applicable;
   - cross the 1.21.11 -> 26.1 boundary explicitly;
   - do not remap already-unobfuscated targets.

6. **Apply deterministic semantic migration recipes**
   - Enderloom rules;
   - imported/verified MC Mod Porter knowledge;
   - OpenRewrite/JDT/Spoon transformations;
   - loader-neutral capability transforms;
   - metadata/access IR emission.

7. **Resolve Mixin/bytecode access behavior**
   - Mixin targets/refmaps;
   - MixinExtras;
   - class tweakers/access wideners/access transformers;
   - interface injection/runtime implementation;
   - compiled-bytecode lane only when needed.

8. **Migrate data/resources/datagen**
   - mcmeta/official version deltas;
   - pack format/registries;
   - Data Components/Codecs/DFU where applicable;
   - static resources and generated resources.

9. **Generate target-native fast build**
   - correct Gradle loader plugin;
   - exact Java toolchain;
   - dependency locks/provenance;
   - configuration-cache-compatible normal workflow where supported.

10. **Compile -> diagnose -> generalized repair loop**
    - classify errors by rule family;
    - repair shared cause;
    - never blind string-replace compiler messages;
    - every nontrivial reusable fix becomes a rule + regression fixture.

11. **Run target runtime proof**
    - server/client as applicable;
    - HeadlessMC/MC-Runtime-Test or target-native harness;
    - GameTests/unit tests;
    - Mixin transform validation;
    - content/runtime census.

12. **Data/resource equivalence pass**
    - datagen diff;
    - registry/content counts;
    - pack/resource presence;
    - saved-data compatibility fixtures where relevant.

13. **Package + receipt**
    - final JAR(s);
    - source project;
    - SHA-256;
    - conversion receipt;
    - unresolved project-specific items, if any, remain explicit and active rather than hidden.

14. **Learn**
    - successful repairs -> provenance-bearing reusable rules;
    - failures -> negative fixtures;
    - new version edges -> KB update;
    - performance improvements -> benchmark baseline.

### T124 — Run AoA as the primary convergence fixture

- [ ] **T124** — Apply pipeline v3 to the active **Advent of Ascension (AoA)** conversion fixture instead of validating only tiny demo mods.

AoA should exercise:

- large source tree;
- real registries/content volume;
- complex loader/API usage;
- resources/datagen;
- networking/client/server behavior;
- enough API surface to expose rule-order and false-positive defects.

Preserve the existing AoA acceptance state and name; do not restart or rename the project merely because the pipeline changed.

### T125 — Add a deliberately adversarial fixture matrix beside AoA

- [ ] **T125** — Keep smaller fixtures that isolate failure classes AoA may not expose cleanly:

- Fabric Yarn -> 26.1 official mapping crossing;
- Kotlin Fabric mod;
- MixinExtras-heavy mod;
- Access Widener/Class Tweaker + interface injection;
- Forge/NeoForge event/config/capability patterns;
- nested JAR/JarJar dependency negotiation;
- client-only/server-only split;
- datagen-heavy project;
- saved-data/Data Component migration;
- multi-loader Stonecutter project;
- compiled-only recovery fixture where rights permit.

A broad real mod plus isolated adversarial fixtures are both required.

### T126 — Enforce no-regression promotion across all three scout waves

- [ ] **T126** — A new tool or rule is promoted only when it either:

- increases automatic conversion coverage without reducing correctness; or
- materially improves equivalent-work performance while preserving complete results; or
- provides stronger proof/diagnostics with acceptable overhead.

For every promotion compare against the previously proven baseline. Newer or more fashionable technology is not sufficient.

### T127 — Third-pass completeness challenge

- [ ] **T127** — Before closing this research wave, reconcile every coverage dimension at the top of this section and verify that remaining unknowns are one of:

- crawler/provider limitation already documented;
- implementation-time version refresh;
- target-specific future work that has no current path;
- deliberately rejected weaker/duplicate candidate.

Do not claim "the internet has nothing else." Claim only that the planned relevant coverage dimensions are addressed and this gap-directed pass stopped surfacing material superior candidates.

### T128 — Canonical handoff / exact next action

- [ ] **T128** — Merge this third-pass delta into Enderloom execution without another planning-only cycle.

**Exact next implementation order:**

1. T079-T081 era-aware conversion graph + official migration-corpus ingestion;
2. T085-T090 MC Mod Porter full-integration/differential harness;
3. T095-T099 typed loader metadata/access/dependency IR;
4. T105-T109 data/resource migration corpus;
5. T100-T104 real runtime proof harness;
6. T110-T116 Kotlin/licensing/build hardening;
7. T123 composed pipeline;
8. T124 AoA end-to-end convergence;
9. T125 adversarial matrix;
10. T126-T127 promotion/completeness challenge.

- [ ] **G034 · GATE** — T079-T128 and G023-G033 are complete or truthfully dispositioned; the active AoA conversion passes the composed pipeline without content loss; runtime/data/resource proof accompanies compile success; user-granted upstream integration is provenance-safe; and further broad research is deferred until a concrete invalidator or uncovered capability appears.

---

# Evidence ledger — third deep scour

These links are discovery/provenance inputs, not automatic implementation authority. Refresh exact versions/commits at integration time.

## Mapping-era transition / migration

- Fabric 26.1 announcement: https://www.fabricmc.net/2026/03/14/261.html
- Fabric mapping migration docs: https://docs.fabricmc.net/develop/porting/mappings/
- Fabric 26.1 API migration guide: https://github.com/FabricMC/fabric-docs/blob/main/versions/26.1.2/develop/porting/fabric-api.md
- Ravel: https://github.com/badasintended/ravel
- NeoForge primers index: https://docs.neoforged.net/primer/docs/
- NeoForge 1.21.11 -> 26.1 primer: https://docs.neoforged.net/primer/docs/26.1/
- NeoForge 26.2 -> 26.3 primer: https://docs.neoforged.net/primer/docs/26.3/
- Parchment: https://github.com/ParchmentMC/Parchment
- NeoForged AutoRenamingTool: https://github.com/neoforged/AutoRenamingTool
- MCPConfig historical mappings: https://github.com/MinecraftForge/MCPConfig

## Direct porter ingestion

- MC Mod Porter: https://github.com/reqsery/mc-mod-porter
- MC Mod Porter contributing/accuracy policy: https://github.com/reqsery/mc-mod-porter/blob/main/docs/CONTRIBUTING.md
- MC Mod Porter AI guide: https://github.com/reqsery/mc-mod-porter/blob/main/AI_GUIDE.md

## Bidirectional loader compatibility

- Kilt: https://github.com/KiltMC/Kilt
- KiltMC organization / Twill: https://github.com/KiltMC
- Patchwork Patcher (archived): https://github.com/PatchworkMC/patchwork-patcher
- Patchwork API (archived): https://github.com/PatchworkMC/patchwork-api
- Sinytra Adapter: https://github.com/Sinytra/Adapter
- Sinytra Connector: https://github.com/Sinytra/Connector
- Forgified Fabric Loader: https://github.com/Sinytra/ForgifiedFabricLoader
- Architectury Loom: https://github.com/architectury/architectury-loom
- Neo Loom: https://github.com/RelativityMC/neo-loom

## Loader metadata / access behavior

- Fabric loader metadata docs: https://docs.fabricmc.net/develop/loader/fabric-mod-json
- Fabric Class Tweakers: https://docs.fabricmc.net/develop/class-tweakers/
- Fabric interface injection: https://docs.fabricmc.net/develop/class-tweakers/interface-injection
- NeoForge Jar-in-Jar: https://docs.neoforged.net/toolchain/docs/dependencies/jarinjar/
- NeoForge Access Transformers (versioned docs): https://docs.neoforged.net/docs/1.21.1/advanced/accesstransformers/
- ModDevGradle: https://github.com/neoforged/ModDevGradle
- Quilt Loader: https://github.com/QuiltMC/quilt-loader

## Runtime/test proof

- HeadlessMC: https://github.com/headlesshq/headlessmc
- MC-Runtime-Test: https://github.com/headlesshq/mc-runtime-test
- Fabric automated testing: https://docs.fabricmc.net/develop/automatic-testing
- Fancy Mod Loader: https://github.com/neoforged/FancyModLoader
- Sponge Mixin: https://github.com/SpongePowered/Mixin
- Minecraft Development IntelliJ plugin: https://github.com/minecraft-dev/MinecraftDev
- MixinExtras: https://github.com/LlamaLad7/MixinExtras

## Data/resource/version intelligence

- misode/mcmeta: https://github.com/misode/mcmeta
- PrismarineJS minecraft-data: https://github.com/PrismarineJS/minecraft-data
- Mojang DataFixerUpper: https://github.com/Mojang/DataFixerUpper
- Fabric data generation: https://docs.fabricmc.net/develop/data-generation/setup
- Fabric codecs: https://docs.fabricmc.net/develop/serialization/codecs
- Fabric data components: https://docs.fabricmc.net/develop/items/custom-data-components
- NeoForge codecs: https://docs.neoforged.net/docs/datastorage/codecs/
- NeoForge data components: https://docs.neoforged.net/docs/items/datacomponents/

## Kotlin / semantic tooling

- OpenRewrite main repository: https://github.com/openrewrite/rewrite
- OpenRewrite Kotlin authoring docs: https://docs.openrewrite.org/authoring-recipes/writing-kotlin-recipes
- OpenRewrite recipe/license index: https://docs.openrewrite.org/reference/all-recipes
- Kotlin Analysis API: https://kotlin.github.io/analysis-api/

## Build/performance

- Gradle Configuration Cache: https://docs.gradle.org/current/userguide/configuration_cache.html
- Gradle performance best practices: https://docs.gradle.org/current/userguide/best_practices_performance.html
- ModDevGradle docs: https://docs.neoforged.net/toolchain/docs/plugins/mdg/

## Optional accelerators / comparators

- everything-ipc crate: https://crates.io/crates/everything-ipc
- Everything SDK: https://www.voidtools.com/support/everything/sdk/
- packwiz: https://github.com/packwiz/packwiz
- X Minecraft Launcher: https://github.com/Voxelum/x-minecraft-launcher
- ATLauncher: https://github.com/ATLauncher/ATLauncher

---

# Third-pass closeout note

The third scour materially changes the **shape** of the Enderloom roadmap more than it changes the list of libraries. The strongest resulting architecture is now clear:

**version/loader/era graph + permissioned MC Mod Porter corpus + semantic recipe engine + bidirectional loader-capability knowledge + typed manifest/access/dependency IR + versioned Minecraft data truth + target-native runtime proof + permanent learned-rule regression memory.**

That stack is substantially harder to fool with "it compiles" success and gives Enderloom a path to become better after every difficult real mod conversion without trading away content, fidelity, supported versions, loader breadth, or performance.


---


# Final hidden-infrastructure challenge pass — material additions only

This pass deliberately targeted implementation infrastructure that a normal "Minecraft mod porter" search misses: **compiled-JAR normalization, constant recovery, patch/decompile toolchains, generated multi-version workspace scaffolds, real packaged-artifact matrices, and subsystem-specific cross-loader compatibility corpora**. It did not reopen already-settled candidates.

## G036 — Compiled-JAR normalization: recover more semantic source before migration

- [ ] **G036 · GATE** — When source must be reconstructed from compiled Minecraft/mod artifacts, Enderloom can recover mapping names, parameters and recognizable constants with better semantic fidelity than a plain decompile/remap pass, while preserving an independent oracle and exact provenance.

### T129 — Bake off PaperMC Codebook + Unpick against the current normalization lane

- [ ] **T129** — Add **PaperMC Codebook + PaperMC Unpick definitions** as a serious compiled-artifact normalization challenger.

Why it earned inclusion:

- Codebook centralizes PaperMC's JAR remapping pipeline around Mojang mappings and AutoRenamingTool-style remapping;
- it supports an explicit input JAR/classpath or resolving the requested Minecraft version;
- it can consume parameter mappings;
- it can run **Unpick** when supplied definitions + constants, recovering named constants instead of leaving opaque magic literals in reconstructed code;
- PaperMC continues maintaining `unpick-definitions` for current Minecraft even though its Parchment mappings fork is no longer required for 26.1+ unobfuscated Minecraft.

Enderloom bakeoff corpus:

1. legacy obfuscated Minecraft/mod inputs;
2. pre-26.1 Mojmap/Parchment-enhanced targets;
3. enum/flag/constant-heavy APIs where decompilers otherwise emit numeric literals;
4. switch-heavy and bitmask-heavy code;
5. compiler-generated bridges/synthetic members;
6. classpath-dependent generic signatures;
7. the same input through Vineflower + current remapper, Codebook/Unpick, and at least one independent decompiler/remapper oracle.

Measure:

- source semantic readability;
- stable symbol/constant recovery;
- compile success against the real target classpath;
- structural diff noise;
- false constant substitutions;
- mapping provenance;
- end-to-end conversion success on difficult fixtures.

Promotion rule: use Codebook/Unpick where it produces a measurably stronger reconstruction. Do **not** make Paper's server-specific assumptions authoritative for arbitrary mod code, and keep its LGPL boundary/provenance explicit.

Canonical references:

- https://github.com/PaperMC/codebook
- https://github.com/PaperMC/unpick-definitions
- https://github.com/PaperMC/ParchmentMappings

### T130 — Mine paperweight + mache for reconstruction/patch architecture, not as a mod-conversion replacement

- [ ] **T130** — Study **PaperMC paperweight** and **mache** as production comparators for repeatable Minecraft source reconstruction, patch application, cacheability and recompilable source state.

Useful lessons to extract:

- clean separation between upstream artifact acquisition, decompile/remap/patch stages and downstream user development;
- deterministic intermediate artifacts and cache keys;
- patch failure reporting that points at the earliest broken transformation;
- recompilable decompiled-source state rather than opaque one-way output;
- upstream-version refresh without throwing away downstream patch history.

Do not force Paper's server-fork workflow onto normal mods. Mine reusable pipeline mechanics only.

Canonical references:

- https://github.com/PaperMC/paperweight
- https://github.com/PaperMC/mache
- https://github.com/PaperMC/Paper

---

## G037 — Generated multi-version workspace: compare hand-built Stonecutter wiring with a maintained abstraction

- [ ] **G037 · GATE** — Enderloom can generate a maintainable one-source multi-loader/multi-version workspace without unnecessary copied build logic, while retaining an escape hatch to raw Stonecutter/loader-native configuration when an abstraction cannot express a target.

### T131 — Bake off Stonecraft as an output-generator challenger; use real 26.x production matrices as fixtures

- [ ] **T131** — Compare Enderloom's generated raw **Stonecutter + loader build scripts** against **Stonecraft** as a maintained configuration abstraction.

Why it earned inclusion:

- Stonecraft explicitly wires Stonecutter + Architectury for multi-version/multi-loader workspaces;
- the project includes an end-to-end test mod and maintained template;
- current 2026 releases track Loom/Gradle/pack-format changes and have added NeoForge datagen/unit-test facilities and access-widening support;
- it can remove a large amount of duplicated Gradle boilerplate when its abstraction matches the target.

Use **OpenShock Integrations.Minecraft** and **TheMightyArchitectury** as production-shaped comparator fixtures:

- OpenShock maintains one tree across 1.20.x, 1.21.x and 26.x for Fabric + NeoForge with Java 17/21/25 targets;
- TheMightyArchitectury maintains one Stonecutter tree across 14 Minecraft versions / 27 shipping JAR targets and executes client, dedicated-server, JUnit and packaged-production-JAR runtime matrices.

Hard requirements:

- Enderloom owns a canonical generated workspace IR; Stonecraft/raw Gradle are render targets, not the source of truth;
- generated builds preserve loader-native capabilities, datagen, test tasks, publication metadata and the 26.1+ no-remap era;
- if Stonecraft cannot represent an accepted target, fall back to a generated raw Stonecutter + Fabric Loom/ModDevGradle/Forge configuration without dropping that target;
- measure configuration time, incremental build time, generated boilerplate, debugging clarity and matrix correctness;
- because Stonecraft is AGPL-3.0, perform the license/distribution decision before embedding or copying its implementation. Architecture/templates may be evaluated separately from code reuse.

Canonical references:

- https://github.com/meza/Stonecraft
- https://github.com/meza/Stonecraft-template
- https://github.com/OpenShock/Integrations.Minecraft
- https://github.com/TimStewartJ/TheMightyArchitectury

---

## G038 — Subsystem bridge corpora: learn semantic equivalence from proven cross-loader ports

- [ ] **G038 · GATE** — Enderloom augments general loader mappings with subsystem-specific proven compatibility corpora when they reveal semantics that cannot be inferred safely from symbol names alone.

### T132 — Mine Forge Config API Port as a configuration-semantics bridge corpus

- [ ] **T132** — Use **Forge Config API Port** as a high-value corpus for configuration-system equivalence across Fabric, Forge and NeoForge.

Why:

- it explicitly provides Forge/NeoForge-style configuration systems to other modding ecosystems;
- current branches publish Fabric, Forge and NeoForge variants across both 1.21.x and 26.x generations;
- config migration is behavioral, not merely symbol renaming: spec definition, loading lifecycle, sync, validation, file location, reload and client/server scope can diverge by loader/version.

Extract into the existing loader-capability model rather than creating a permanent dependency:

- concept -> loader/version implementation correspondence;
- lifecycle/event timing;
- common vs client vs server config semantics;
- serialization/validation behavior;
- sync/reload semantics;
- failure modes and incompatible assumptions.

When Enderloom converts a config subsystem, compare behavior and emitted files in runtime fixtures, not just compile success.

Canonical reference:

- https://github.com/Fuzss/forge-config-api-port

---

## G039 — Fourth-pass convergence / research frontier freeze

- [ ] **G039 · GATE** — The hidden-infrastructure challenge pass is reconciled into the candidate matrix, no newly found candidate silently replaces a stronger proven path without A/B evidence, and broad ecosystem searching stops until an actual invalidator or uncovered capability appears.

### T133 — Freeze the research frontier after reconciling the final material additions

- [ ] **T133** — Reconcile this fourth pass as follows:

| Candidate / corpus | Enderloom role | Disposition |
|---|---|---|
| PaperMC Codebook + Unpick | semantic JAR normalization / constant recovery | **BAKEOFF NOW** for source-reconstruction inputs |
| paperweight + mache | deterministic reconstruction/patch architecture | **MINE PATTERNS / COMPARATOR** |
| Stonecraft | generated Stonecutter + Architectury workspace abstraction | **BAKEOFF WHEN GENERATING MULTI-VERSION OUTPUT** |
| OpenShock Integrations.Minecraft | 1.20.x -> 26.x Fabric/NeoForge matrix reference | **REGRESSION/STRUCTURE FIXTURE** |
| TheMightyArchitectury | 14-version / 27-artifact packaged-runtime matrix | **HIGH-VALUE RUNTIME/MATRIX FIXTURE** |
| Forge Config API Port | cross-loader configuration semantic corpus | **INGEST CAPABILITY KNOWLEDGE** |
| direct Codeberg/SourceHut crawling | additional forge discovery route | **UNRESOLVED BY CURRENT CRAWLER ROBOTS; use registries/mirrors/canonical links, never call empty** |

Challenge-pass conclusion:

- no newly surfaced whole-stack converter is stronger than the composed Enderloom direction already defined here;
- the material misses were **specialized infrastructure layers**, now captured above;
- further broad searches should resume only when one of these invalidators occurs: a new Minecraft/loader era, new mapping regime, a failed real conversion exposing an uncovered capability, a materially stronger upstream project/release, or evidence that a promoted component is no longer maintained/correct;
- every such future discovery receives the next unused stable IDs and is evaluated against the then-current proven baseline rather than reopening this document from scratch.

### Fourth-pass evidence additions

- PaperMC Codebook: https://github.com/PaperMC/codebook
- PaperMC Unpick definitions: https://github.com/PaperMC/unpick-definitions
- PaperMC paperweight: https://github.com/PaperMC/paperweight
- PaperMC mache: https://github.com/PaperMC/mache
- Stonecraft: https://github.com/meza/Stonecraft
- Stonecraft template: https://github.com/meza/Stonecraft-template
- OpenShock Integrations.Minecraft: https://github.com/OpenShock/Integrations.Minecraft
- TheMightyArchitectury: https://github.com/TimStewartJ/TheMightyArchitectury
- Forge Config API Port: https://github.com/Fuzss/forge-config-api-port

**Fourth-pass exact implementation insertion:** evaluate T129 during T079-T084 target reconstruction/mapping work; feed T132 into T093-T099 loader-capability/metadata IR work; evaluate T131 when emitting the first one-source multi-version workspace; use TheMightyArchitectury's packaged-artifact test shape as an additional standard for T100-T104/T125; then run T133 once those comparisons have real evidence.

# Whole-document completion gate

- [ ] **G035 · FINAL COMPLETION GATE** — All accepted work in this companion (`T041-T133`, `G013-G034`, `G036-G039`) is complete or truthfully dispositioned with no blocker relabeled as success; every promoted candidate has equivalent-work evidence; the era-aware converter, MC Mod Porter integration, manifest/access/data IRs, runtime proof, compiled-JAR normalization bakeoff, multi-version output generation and AoA convergence are exercised through production paths; performance gains preserve complete results; all material artifacts/provenance are checkpointed; and no requirement from the prior scout or this continuation was silently removed.
