# Ecosystem / projects to improve from

[Home](Home.md) / [Checklist](Checklist.md) / [Architecture](Architecture.md) / [Ecosystem](Ecosystem.md) / [Source map](Source-Map.md)

> Integrate useful capability, not every dependency. Every selected tool needs exact provenance and proof.

## Integration priorities

| Project | Role | Integration requirement |
| :--- | :--- | :--- |
| [reqsery/mc-mod-porter](https://github.com/reqsery/mc-mod-porter) | Source integration | Full separate user permission; ingest useful corpus, harden rewrites, retain notices and exact provenance. |
| [champmk/modforge](https://github.com/champmk/modforge) | Mapping truth | Descriptor-qualified/JAR-verified resolver and differential fixtures; not semantic parity by itself. |
| [Bownlux/Retromod](https://github.com/Bownlux/Retromod) | JAR transformations | Pair-specific managed backend; preserve nested inputs and truthfully separate modified JAR from native port. |
| [Sinytra/Adapter](https://github.com/Sinytra/Adapter) | Mixin adaptation | Focused dynamic Mixin repair corpus and tested adapters; prove injection semantics. |
| [stonecutter-versioning/stonecutter](https://github.com/stonecutter-versioning/stonecutter) | Build matrix | Real shared multi-version workspaces beneath the canonical semantic project. |
| [isXander/modstitch](https://github.com/isXander/modstitch) | Build matrix | Unified modern loader workspace conventions, capability-probed per target. |
| [isXander/modstitch-toolkit](https://github.com/isXander/modstitch-toolkit) | Build matrix | Access, metadata, repositories and source-set conventions, not hand-written duplicates. |
| [FabricMC/mapping-io](https://github.com/FabricMC/mapping-io) | Mapping | Mapping format/tree/visitor primitives and differential parser coverage. |
| [FabricMC/tiny-remapper](https://github.com/FabricMC/tiny-remapper) | Mapping | Bytecode remapping with exact classpath and mapping provenance. |
| [neoforged/AutoRenamingTool](https://github.com/neoforged/AutoRenamingTool) | Mapping | Forge-family inheritance/remap pipeline; compare overlap with canonical resolver. |
| [neoforged/NeoFormRuntime](https://github.com/neoforged/NeoFormRuntime) | Build/source | Official artifact/classpath/source execution and immutable cache. |
| [neoforged/JavaSourceTransformer](https://github.com/neoforged/JavaSourceTransformer) | Source | Headless structured Java transformations; avoid global text replacement. |
| [Vineflower/vineflower](https://github.com/Vineflower/vineflower) | Source recovery | Primary authorized decompilation with bytecode/source/runtime reconciliation. |
| [leibnitz27/cfr](https://github.com/leibnitz27/cfr) | Source recovery | Differential recovery when source reconstruction is ambiguous. |
| [badasintended/ravel](https://github.com/badasintended/ravel) | Source | Java/Kotlin/Mixin/access mapping route; automate, not a manual IDE handoff. |
| [unimined/Unimined](https://github.com/unimined/Unimined) | Historical builds | Wide historical backend; preserve exact supported target constraints. |
| [unimined/JvmDowngrader](https://github.com/unimined/JvmDowngrader) | Backport | Classfile/API compatibility where source semantics are valid; native linkage still required. |
| [GTNewHorizons/RetroFuturaGradle](https://github.com/GTNewHorizons/RetroFuturaGradle) | Historical builds | Purpose-built historical Forge workspace support. |
| [GeyserMC/PackConverter](https://github.com/GeyserMC/PackConverter) | Resources | Resource converter, not complete gameplay translation; harden missing paths. |
| [GeyserMC/Rainbow](https://github.com/GeyserMC/Rainbow) | Resources | Runtime/resource custom-content extraction; reconcile full census, not observed inventory alone. |
| [Bedrock-OSS/regolith](https://github.com/Bedrock-OSS/regolith) | Bedrock build | Owned filter/build pipeline; isolate executable filters. |
| [bridge-core/dash-compiler](https://github.com/bridge-core/dash-compiler) | Bedrock build | Embedded/headless compiler, not an unrelated editor fork. |
| [mcbeet/beet](https://github.com/mcbeet/beet) | Packs/commands | Current Beet/Mecha source pipeline and command validation. |
| [SpyglassMC/Spyglass](https://github.com/SpyglassMC/Spyglass) | Diagnostics | Structured data-pack language diagnostics linked to real runtime tests. |
| [JannisX11/blockbench](https://github.com/JannisX11/blockbench) | Visual codecs | Model/UV/animation round-trip reference and real assets. |
| [VAST-AI-Research/AniGen](https://github.com/VAST-AI-Research/AniGen) | Concept -> rig | Single-image animate-ready mesh/skeleton/skinning challenger; exact third-party/model licenses remain gated. |
| [VAST-AI-Research/SkinTokens](https://github.com/VAST-AI-Research/SkinTokens) | Auto-rigging | Current TokenRig skeleton + skin-weight challenger and UniRig successor; benchmark on Minecraft creature fixtures. |
| [Isabella98Liu/RigAnything](https://github.com/Isabella98Liu/RigAnything) | Auto-rigging | Independent template-free skeleton/skinning oracle for unusual assets. |
| [microsoft/TRELLIS.2](https://github.com/microsoft/TRELLIS.2) | 3D generation | Current high-fidelity image-to-3D/PBR challenger; Minecraftization remains a separate measured stage. |
| [VAST-AI-Research/TripoSG](https://github.com/VAST-AI-Research/TripoSG) | 3D generation | High-fidelity image/scribble-to-3D challenger with face-budget control. |
| [Tencent-Hunyuan/Hunyuan3D-Part](https://github.com/Tencent-Hunyuan/Hunyuan3D-Part) | Part decomposition | Semantic part segmentation/decomposition proposal stage before editable Minecraft hierarchy. |
| [wgsxm/PartCrafter](https://github.com/wgsxm/PartCrafter) | Part generation | Structured multi-part generation challenger for separable creature/prop components. |
| [buaacyw/MeshAnythingV2](https://github.com/buaacyw/MeshAnythingV2) | Retopology | Artist-like low-face topology challenger; compare against deterministic remesh/simplification. |
| [MopicMP/gltf-to-minecraft](https://github.com/MopicMP/gltf-to-minecraft) | Minecraftization | glTF/GLB -> Minecraft cubes/GeckoLib/Bedrock/CPM bridge with animation and atlas handling. |
| [toxicity188/BetterModel](https://github.com/toxicity188/BetterModel) | Model runtime | Bedrock-style Java model benchmark for meshes, Molang, IK, locators, player/armor and synchronization. |
| [tomalbrc/blockbench-import-library](https://github.com/tomalbrc/blockbench-import-library) | Model runtime | bbmodel/ajmodel + Molang/effects/variants/locators and efficient virtual-display compatibility reference. |
| [Animated-Java/animated-java](https://github.com/Animated-Java/animated-java) | Animation tooling | Rich Java Blockbench animation semantics; AGPL means adapter/oracle unless distribution deliberately complies. |
| [Engine-Room/Flywheel](https://github.com/Engine-Room/Flywheel) | Rendering performance | GPU instancing/shader architecture challenger for high-detail crowds. |
| [FoundryMC/Veil](https://github.com/FoundryMC/Veil) | Advanced rendering | Optional advanced rendering/tooling challenger; verify exact target compatibility. |
| [zeux/meshoptimizer](https://github.com/zeux/meshoptimizer) | Mesh performance | Offline mesh cache/fetch/overdraw/simplification/LOD preprocessing candidate. |
| [jpcy/xatlas](https://github.com/jpcy/xatlas) | UV tooling | Deterministic UV chart/unwrap/atlas candidate for mesh-assisted assets. |
| [vrm-c/vrm-specification](https://github.com/vrm-c/vrm-specification) | Secondary motion | SpringBone semantics baseline for hair/vines/tails/cloth plus Enderloom extensions. |
| [xloveee/jiggle-physics](https://github.com/xloveee/jiggle-physics) | Secondary motion | Weight-painted soft-region + damped spring reference for optional mesh deformation. |
| [Low-Drag-MC/Photon](https://github.com/Low-Drag-MC/Photon) | VFX reference | Powerful VFX/editor benchmark; current non-commercial licensing makes source reuse rights-gated. |
| [team-abnormals/blueprint](https://github.com/team-abnormals/blueprint) | Animation runtime | Endimator is a lightweight native animation lane/oracle for simpler Java entities. |
| [FoundationGames/JsonEM](https://github.com/FoundationGames/JsonEM) | Model introspection | JSON entity model dump/load reference for live model inventory and resource-defined fixtures. |
| [Gamepiaynmo/CustomPlayerModel](https://github.com/Gamepiaynmo/CustomPlayerModel) | Model physics | Independent Java JSON model/scripting/particle/physics runtime for players and other entities. |
| [mchorse/bbs-mod](https://github.com/mchorse/bbs-mod) | Animation studio reference | Archived Minecraft animation studio; mine behavior/fixtures, do not adopt as current runtime dependency. |
| [BBS-Engine/bbs](https://github.com/BBS-Engine/bbs) | Animation studio | Active Java voxel animation-studio architecture for timeline/camera/model-preview ideas. |
| [FiguraMC/figura-core](https://github.com/FiguraMC/figura-core) | Avatar architecture | Minecraft-independent Figura core is a portability/reference lane for Enderloom model runtime. |
| [FiguraMC/figura-client](https://github.com/FiguraMC/figura-client) | Avatar architecture | Thin Minecraft/version integration reference for portable model/avatar logic. |
| [FiguraMC/figura-molang](https://github.com/FiguraMC/figura-molang) | Expressions | Current Figura Molang-like expression module is a differential parser/evaluator reference. |
| [AlexModGuy/Citadel](https://github.com/AlexModGuy/Citadel) | Legacy animation reference | Mature hierarchical/default-pose model utilities; reference/fixture rather than preferred modern backend. |
| [Seed3D/Puppeteer](https://github.com/Seed3D/Puppeteer) | Rig + motion | Automatic rigging plus video-guided animation challenger; map generated motion into canonical gameplay-safe animation contracts. |
| [jasongzy/Make-It-Animatable](https://github.com/jasongzy/Make-It-Animatable) | Auto-rigging | MIT MIA v2 challenger for joints, weights and pose generation on mesh inputs. |
| [vlongle/articulate-anything](https://github.com/vlongle/articulate-anything) | Articulation | Joint/link/axis inference challenger for props, machinery and nonstandard articulated assets. |
| [Anytop2025/Anytop](https://github.com/Anytop2025/Anytop) | Motion generation | Arbitrary-topology motion generation/inpainting after a valid canonical rig exists. |
| [Patbox/polymer](https://github.com/Patbox/polymer) | Server-side export | Virtual-entity/resource-pack compatibility backend; optional export, not native-client runtime authority. |
| [MehVahdJukaar/polytone](https://github.com/MehVahdJukaar/polytone) | Biome phenotype | Colormap/biome-effect/resource-pack compatibility reference for modded-biome atmosphere. |
| [SuperMartijn642/Fusion](https://github.com/SuperMartijn642/Fusion) | Resource models | Additional texture/model-type compatibility lane for generated blocks/items/environments. |
| [IrisShaders/Iris](https://github.com/IrisShaders/Iris) | PBR/shaders | Shader compatibility and performance lane; preserve rich materials with vanilla fallback. |
| [minecraft-library/vanilla-reference-harness](https://github.com/minecraft-library/vanilla-reference-harness) | Visual QA | Deterministic real-client reference-render pattern for byte/image-diff regression fixtures. |
| [jasonjgardner/blockbench-mcp-plugin](https://github.com/jasonjgardner/blockbench-mcp-plugin) | Blockbench automation | Live + headless bbmodel edit/validate/convert/render architecture; GPL source reuse must remain license-compatible. |
| [sosadly/blockbench-mcp](https://github.com/sosadly/blockbench-mcp) | Blockbench automation | MIT modeling/texture/rig/animation toolset with procedural detail and measurable reference/rig/animation QA gates. |
| [velthoric/Velthoric](https://github.com/velthoric/Velthoric) | Optional physics | Minecraft Jolt integration challenger for real soft-body/rope/joint workloads; not the default cosmetic motion path. |
| [stephengold/jolt-jni](https://github.com/stephengold/jolt-jni) | Optional physics | MIT low-level JVM Jolt/V-HACD bindings for capability-selected native physics. |
| [unnamed/mocha](https://github.com/unnamed/mocha) | Molang | Parser/evaluator/compiler comparisons with state/timing/thread correctness. |
| [HiveGamesOSS/Chunker](https://github.com/HiveGamesOSS/Chunker) | Worlds | Staged exact-pair world translation, full field reconciliation and rollback. |
| [kbinani/je2be-core](https://github.com/kbinani/je2be-core) | Worlds | Alternative/differential world backend; never a mod-code translator. |
| [Amulet-Team/PyMCTranslate](https://github.com/Amulet-Team/PyMCTranslate) | Rights constrained | Current-source reuse requires applicable grant; Reqsery permission does not apply. |
| [PatchworkMC/patchwork-patcher](https://github.com/PatchworkMC/patchwork-patcher) | Historical reference | Archived ideas/fixtures, not primary production dependency. |
| [meza/Stonecraft](https://github.com/meza/Stonecraft) | Reference/licensing | Study useful conventions; exact license/distribution decision before source merge. |
| [lucko/spark](https://github.com/lucko/spark) | Performance | Real runtime profiling adapter; control measurement overhead. |

## Integration rules

A library, managed CLI, vendored source, differential oracle or fixture-only role is chosen by demonstrated capability and rights. A registry entry is not a completed required integration. Select one primary backend per job and escalate only affected work to alternatives; do not run every engine unnecessarily.

Keep MC Mod Porter's separate user grant and attribution. Do not transfer it to EpikBoxxy's PortKit, PyMCTranslate, commercial assets or model weights. Distinguish anchapin/portkit from the unrelated AutoPort listing. Follow maintainer-declared moves such as Mecha and Fabric Class Tweaker. Preserve restricted candidates without ingesting their code and use lawful alternatives.

**Freshness:** these are source-derived integration candidates, not a new assertion of the latest release or current compatibility. At implementation, resolve exact source/version/license, run real fixtures and keep the evidence. No compatible badge can be inherited from another mod or target.

## Additional source-linked projects

- [0x676e67/effectum](https://github.com/0x676e67/effectum) - [specific cited locations](Reference-Index.md#0x676e67-effectum).
- [aboutcode-org/scancode-toolkit](https://github.com/aboutcode-org/scancode-toolkit) - [specific cited locations](Reference-Index.md#aboutcode-org-scancode-toolkit).
- [actions/attest](https://github.com/actions/attest) - [specific cited locations](Reference-Index.md#actions-attest).
- [anchapin/portkit](https://github.com/anchapin/portkit) - [specific cited locations](Reference-Index.md#anchapin-portkit).
- [apache/maven-resolver](https://github.com/apache/maven-resolver) - [specific cited locations](Reference-Index.md#apache-maven-resolver).
- [apalis-dev/apalis-sqlite](https://github.com/apalis-dev/apalis-sqlite) - [specific cited locations](Reference-Index.md#apalis-dev-apalis-sqlite).
- [architectury/architectury-api](https://github.com/architectury/architectury-api) - [specific cited locations](Reference-Index.md#architectury-architectury-api).
- [architectury/architectury-loom](https://github.com/architectury/architectury-loom) - [specific cited locations](Reference-Index.md#architectury-architectury-loom).
- [architectury/architectury-transformer](https://github.com/architectury/architectury-transformer) - [specific cited locations](Reference-Index.md#architectury-architectury-transformer).
- [arthurprs/quick-cache](https://github.com/arthurprs/quick-cache) - [specific cited locations](Reference-Index.md#arthurprs-quick-cache).
- [ast-grep/ast-grep](https://github.com/ast-grep/ast-grep) - [specific cited locations](Reference-Index.md#ast-grep-ast-grep).
- [async-profiler/async-profiler](https://github.com/async-profiler/async-profiler) - [specific cited locations](Reference-Index.md#async-profiler-async-profiler).
- [ATLauncher/ATLauncher](https://github.com/ATLauncher/ATLauncher) - [specific cited locations](Reference-Index.md#atlauncher-atlauncher).
- [azalea-rs/simdnbt](https://github.com/azalea-rs/simdnbt) - [specific cited locations](Reference-Index.md#azalea-rs-simdnbt).
- [AzureDoom/AzureLib](https://github.com/AzureDoom/AzureLib) - [specific cited locations](Reference-Index.md#azuredoom-azurelib).
- [Bawnorton/MixinSquared](https://github.com/Bawnorton/MixinSquared) - [specific cited locations](Reference-Index.md#bawnorton-mixinsquared).
- [bernie-g/geckolib](https://github.com/bernie-g/geckolib) - [specific cited locations](Reference-Index.md#bernie-g-geckolib).
- [BLAKE3-team/BLAKE3](https://github.com/BLAKE3-team/BLAKE3) - [specific cited locations](Reference-Index.md#blake3-team-blake3).
- [bnjbvr/cargo-machete](https://github.com/bnjbvr/cargo-machete) - [specific cited locations](Reference-Index.md#bnjbvr-cargo-machete).
- [booky10/StackDeobfuscator](https://github.com/booky10/StackDeobfuscator) - [specific cited locations](Reference-Index.md#booky10-stackdeobfuscator).
- [bridge-core/deno-dash-compiler](https://github.com/bridge-core/deno-dash-compiler) - [specific cited locations](Reference-Index.md#bridge-core-deno-dash-compiler).
- [BrilliantTeam/Minecraft-ResourcePack-Migrator](https://github.com/BrilliantTeam/Minecraft-ResourcePack-Migrator) - [specific cited locations](Reference-Index.md#brilliantteam-minecraft-resourcepack-migrator).
- [bytecodealliance/wasmtime](https://github.com/bytecodealliance/wasmtime) - [specific cited locations](Reference-Index.md#bytecodealliance-wasmtime).
- [CadixDev/Lorenz](https://github.com/CadixDev/Lorenz) - [specific cited locations](Reference-Index.md#cadixdev-lorenz).
- [CadixDev/Mercury](https://github.com/CadixDev/Mercury) - [specific cited locations](Reference-Index.md#cadixdev-mercury).
- [CadixDev/MercuryMixin](https://github.com/CadixDev/MercuryMixin) - [specific cited locations](Reference-Index.md#cadixdev-mercurymixin).
- [cberner/redb](https://github.com/cberner/redb) - [specific cited locations](Reference-Index.md#cberner-redb).
- [CheetahStimulate/creeper-overhaul-mc-mod](https://github.com/CheetahStimulate/creeper-overhaul-mc-mod) - [specific cited locations](Reference-Index.md#cheetahstimulate-creeper-overhaul-mc-mod).
- [classgraph/classgraph](https://github.com/classgraph/classgraph) - [specific cited locations](Reference-Index.md#classgraph-classgraph).
- [CleanroomMC/Cleanroom](https://github.com/CleanroomMC/Cleanroom) - [specific cited locations](Reference-Index.md#cleanroommc-cleanroom).
- [CleanroomMC/MixinBooter](https://github.com/CleanroomMC/MixinBooter) - [specific cited locations](Reference-Index.md#cleanroommc-mixinbooter).
- [CleanroomMC/Scalar](https://github.com/CleanroomMC/Scalar) - [specific cited locations](Reference-Index.md#cleanroommc-scalar).
- [CloudburstMC/NBT](https://github.com/CloudburstMC/NBT) - [specific cited locations](Reference-Index.md#cloudburstmc-nbt).
- [Col-E/Recaf](https://github.com/Col-E/Recaf) - [specific cited locations](Reference-Index.md#col-e-recaf).
- [comp500/mixintrace](https://github.com/comp500/mixintrace) - [specific cited locations](Reference-Index.md#comp500-mixintrace).
- [ComunidadAylas/PackSquash](https://github.com/ComunidadAylas/PackSquash) - [specific cited locations](Reference-Index.md#comunidadaylas-packsquash).
- [Creators-of-Create/Ponder](https://github.com/Creators-of-Create/Ponder) - [specific cited locations](Reference-Index.md#creators-of-create-ponder).
- [Creators-of-Create/wiki](https://github.com/Creators-of-Create/wiki) - [specific cited locations](Reference-Index.md#creators-of-create-wiki).
- [CycloneDX/cyclonedx-gradle-plugin](https://github.com/CycloneDX/cyclonedx-gradle-plugin) - [specific cited locations](Reference-Index.md#cyclonedx-cyclonedx-gradle-plugin).
- [Cykooz/fast_image_resize](https://github.com/Cykooz/fast_image_resize) - [specific cited locations](Reference-Index.md#cykooz-fast-image-resize).
- [deniz-blue/mcman](https://github.com/deniz-blue/mcman) - [specific cited locations](Reference-Index.md#deniz-blue-mcman).
- [DepthAnything/Depth-Anything-V2](https://github.com/DepthAnything/Depth-Anything-V2) - [specific cited locations](Reference-Index.md#depthanything-depth-anything-v2).
- [DioxusLabs/dioxus](https://github.com/DioxusLabs/dioxus) - [specific cited locations](Reference-Index.md#dioxuslabs-dioxus).
- [divvun/bidiff](https://github.com/divvun/bidiff) - [specific cited locations](Reference-Index.md#divvun-bidiff).
- [ebiggers/libdeflate](https://github.com/ebiggers/libdeflate) - [specific cited locations](Reference-Index.md#ebiggers-libdeflate).
- [eclipse-jdtls/eclipse.jdt.ls](https://github.com/eclipse-jdtls/eclipse.jdt.ls) - [specific cited locations](Reference-Index.md#eclipse-jdtls-eclipse-jdt-ls).
- [EmanuelNorsk/turnleaf](https://github.com/EmanuelNorsk/turnleaf) - [specific cited locations](Reference-Index.md#emanuelnorsk-turnleaf).
- [EmbarkStudios/cargo-deny](https://github.com/EmbarkStudios/cargo-deny) - [specific cited locations](Reference-Index.md#embarkstudios-cargo-deny).
- [embeddedt/ModernFix](https://github.com/embeddedt/ModernFix) - [specific cited locations](Reference-Index.md#embeddedt-modernfix).
- [extism/extism](https://github.com/extism/extism) - [specific cited locations](Reference-Index.md#extism-extism).
- [Fabricators-of-Create/Porting-Lib](https://github.com/Fabricators-of-Create/Porting-Lib) - [specific cited locations](Reference-Index.md#fabricators-of-create-porting-lib).
- [FabricMC/class-tweaker](https://github.com/FabricMC/class-tweaker) - [specific cited locations](Reference-Index.md#fabricmc-class-tweaker).
- [FabricMC/Enigma](https://github.com/FabricMC/Enigma) - [specific cited locations](Reference-Index.md#fabricmc-enigma).
- [FabricMC/fabric-docs](https://github.com/FabricMC/fabric-docs) - [specific cited locations](Reference-Index.md#fabricmc-fabric-docs).
- [FabricMC/fabric-tooling](https://github.com/FabricMC/fabric-tooling) - [specific cited locations](Reference-Index.md#fabricmc-fabric-tooling).
- [FabricMC/intermediary](https://github.com/FabricMC/intermediary) - [specific cited locations](Reference-Index.md#fabricmc-intermediary).
- [FabricMC/Matcher](https://github.com/FabricMC/Matcher) - [specific cited locations](Reference-Index.md#fabricmc-matcher).
- [FabricMC/MercuryMixin](https://github.com/FabricMC/MercuryMixin) - [specific cited locations](Reference-Index.md#fabricmc-mercurymixin).
- [FabricMC/stitch](https://github.com/FabricMC/stitch) - [specific cited locations](Reference-Index.md#fabricmc-stitch).
- [FabricMC/unpick](https://github.com/FabricMC/unpick) - [specific cited locations](Reference-Index.md#fabricmc-unpick).
- [facebookresearch/sam2](https://github.com/facebookresearch/sam2) - [specific cited locations](Reference-Index.md#facebookresearch-sam2).
- [Fenixin/Minecraft-Region-Fixer](https://github.com/Fenixin/Minecraft-Region-Fixer) - [specific cited locations](Reference-Index.md#fenixin-minecraft-region-fixer).
- [FiguraMC/Figura](https://github.com/FiguraMC/Figura) - [specific cited locations](Reference-Index.md#figuramc-figura).
- [fjall-rs/fjall](https://github.com/fjall-rs/fjall) - [specific cited locations](Reference-Index.md#fjall-rs-fjall).
- [foyer-rs/foyer](https://github.com/foyer-rs/foyer) - [specific cited locations](Reference-Index.md#foyer-rs-foyer).
- [Fuzss/forge-config-api-port](https://github.com/Fuzss/forge-config-api-port) - [specific cited locations](Reference-Index.md#fuzss-forge-config-api-port).
- [FxMorin/MoreCulling](https://github.com/FxMorin/MoreCulling) - [specific cited locations](Reference-Index.md#fxmorin-moreculling).
- [Goldorion/Fabric-Generator-MCreator](https://github.com/Goldorion/Fabric-Generator-MCreator) - [specific cited locations](Reference-Index.md#goldorion-fabric-generator-mcreator).
- [google/osv-scanner](https://github.com/google/osv-scanner) - [specific cited locations](Reference-Index.md#google-osv-scanner).
- [gorilla-devs/ferium](https://github.com/gorilla-devs/ferium) - [specific cited locations](Reference-Index.md#gorilla-devs-ferium).
- [gorilla-devs/GDLauncher-Carbon](https://github.com/gorilla-devs/GDLauncher-Carbon) - [specific cited locations](Reference-Index.md#gorilla-devs-gdlauncher-carbon).
- [gradle/gradle-profiler](https://github.com/gradle/gradle-profiler) - [specific cited locations](Reference-Index.md#gradle-gradle-profiler).
- [GTNewHorizons/RetroFuturaBootstrap](https://github.com/GTNewHorizons/RetroFuturaBootstrap) - [specific cited locations](Reference-Index.md#gtnewhorizons-retrofuturabootstrap).
- [headlesshq/headlessmc](https://github.com/headlesshq/headlessmc) - [specific cited locations](Reference-Index.md#headlesshq-headlessmc).
- [headlesshq/mc-runtime-test](https://github.com/headlesshq/mc-runtime-test) - [specific cited locations](Reference-Index.md#headlesshq-mc-runtime-test).
- [headlesshq/mc-runtime-test-mod](https://github.com/headlesshq/mc-runtime-test-mod) - [specific cited locations](Reference-Index.md#headlesshq-mc-runtime-test-mod).
- [headlesshq/mc-server-test](https://github.com/headlesshq/mc-server-test) - [specific cited locations](Reference-Index.md#headlesshq-mc-server-test).
- [helix-editor/nucleo](https://github.com/helix-editor/nucleo) - [specific cited locations](Reference-Index.md#helix-editor-nucleo).
- [Hexeption/MCP-Reborn](https://github.com/Hexeption/MCP-Reborn) - [specific cited locations](Reference-Index.md#hexeption-mcp-reborn).
- [hickory-dns/hickory-dns](https://github.com/hickory-dns/hickory-dns) - [specific cited locations](Reference-Index.md#hickory-dns-hickory-dns).
- [HMCL-dev/HMCL](https://github.com/HMCL-dev/HMCL) - [specific cited locations](Reference-Index.md#hmcl-dev-hmcl).
- [ibraheemdev/papaya](https://github.com/ibraheemdev/papaya) - [specific cited locations](Reference-Index.md#ibraheemdev-papaya).
- [in-toto/attestation](https://github.com/in-toto/attestation) - [specific cited locations](Reference-Index.md#in-toto-attestation).
- [INRIA/spoon](https://github.com/INRIA/spoon) - [specific cited locations](Reference-Index.md#inria-spoon).
- [IrisShaders/docs](https://github.com/IrisShaders/docs) - [specific cited locations](Reference-Index.md#irisshaders-docs).
- [itzg/mc-image-helper](https://github.com/itzg/mc-image-helper) - [specific cited locations](Reference-Index.md#itzg-mc-image-helper).
- [itzg/rcon-cli](https://github.com/itzg/rcon-cli) - [specific cited locations](Reference-Index.md#itzg-rcon-cli).
- [JakobDev/minecraft-launcher-lib](https://github.com/JakobDev/minecraft-launcher-lib) - [specific cited locations](Reference-Index.md#jakobdev-minecraft-launcher-lib).
- [JannisX11/blockbench-plugins](https://github.com/JannisX11/blockbench-plugins) - [specific cited locations](Reference-Index.md#jannisx11-blockbench-plugins).
- [jaredlll08/MultiLoader-Template](https://github.com/jaredlll08/MultiLoader-Template) - [specific cited locations](Reference-Index.md#jaredlll08-multiloader-template).
- [jarettr/intermed](https://github.com/jarettr/intermed) - [specific cited locations](Reference-Index.md#jarettr-intermed).
- [juraj-hrivnak/Pakku](https://github.com/juraj-hrivnak/Pakku) - [specific cited locations](Reference-Index.md#juraj-hrivnak-pakku).
- [KiltMC/Kilt](https://github.com/KiltMC/Kilt) - [specific cited locations](Reference-Index.md#kiltmc-kilt).
- [KiltMC/KnitLoader](https://github.com/KiltMC/KnitLoader) - [specific cited locations](Reference-Index.md#kiltmc-knitloader).
- [Kira-NT/mc-publish](https://github.com/Kira-NT/mc-publish) - [specific cited locations](Reference-Index.md#kira-nt-mc-publish).
- [KnechtUnrecht/IHP](https://github.com/KnechtUnrecht/IHP) - [specific cited locations](Reference-Index.md#knechtunrecht-ihp).
- [Kobzol/cargo-pgo](https://github.com/Kobzol/cargo-pgo) - [specific cited locations](Reference-Index.md#kobzol-cargo-pgo).
- [KosmX/minecraftPlayerAnimator](https://github.com/KosmX/minecraftPlayerAnimator) - [specific cited locations](Reference-Index.md#kosmx-minecraftplayeranimator).
- [KostromDan/Crash-Assistant](https://github.com/KostromDan/Crash-Assistant) - [specific cited locations](Reference-Index.md#kostromdan-crash-assistant).
- [Kotori316/SLP](https://github.com/Kotori316/SLP) - [specific cited locations](Reference-Index.md#kotori316-slp).
- [Legacy-Fabric/Legacy-Intermediaries](https://github.com/Legacy-Fabric/Legacy-Intermediaries) - [specific cited locations](Reference-Index.md#legacy-fabric-legacy-intermediaries).
- [leptos-rs/leptos](https://github.com/leptos-rs/leptos) - [specific cited locations](Reference-Index.md#leptos-rs-leptos).
- [LlamaLad7/MixinExtras](https://github.com/LlamaLad7/MixinExtras) - [specific cited locations](Reference-Index.md#llamalad7-mixinextras).
- [LodestarMC/Lodestone](https://github.com/LodestarMC/Lodestone) - [specific cited locations](Reference-Index.md#lodestarmc-lodestone).
- [lucko/spark-docs](https://github.com/lucko/spark-docs) - [specific cited locations](Reference-Index.md#lucko-spark-docs).
- [manifold-systems/manifold](https://github.com/manifold-systems/manifold) - [specific cited locations](Reference-Index.md#manifold-systems-manifold).
- [mcbeet/mecha](https://github.com/mcbeet/mecha) - [specific cited locations](Reference-Index.md#mcbeet-mecha).
- [MCCTeam/Minecraft-Console-Client](https://github.com/MCCTeam/Minecraft-Console-Client) - [specific cited locations](Reference-Index.md#mccteam-minecraft-console-client).
- [McModLauncher/bootstraplauncher](https://github.com/McModLauncher/bootstraplauncher) - [specific cited locations](Reference-Index.md#mcmodlauncher-bootstraplauncher).
- [McModLauncher/modlauncher](https://github.com/McModLauncher/modlauncher) - [specific cited locations](Reference-Index.md#mcmodlauncher-modlauncher).
- [McModLauncher/securejarhandler](https://github.com/McModLauncher/securejarhandler) - [specific cited locations](Reference-Index.md#mcmodlauncher-securejarhandler).
- [MCPHackers/RetroDebugInjector](https://github.com/MCPHackers/RetroDebugInjector) - [specific cited locations](Reference-Index.md#mcphackers-retrodebuginjector).
- [MCreator/MCreator](https://github.com/MCreator/MCreator) - [specific cited locations](Reference-Index.md#mcreator-mcreator).
- [md-5/SpecialSource](https://github.com/md-5/SpecialSource) - [specific cited locations](Reference-Index.md#md-5-specialsource).
- [meza/Stonecraft-template](https://github.com/meza/Stonecraft-template) - [specific cited locations](Reference-Index.md#meza-stonecraft-template).
- [Microck/jarspect](https://github.com/Microck/jarspect) - [specific cited locations](Reference-Index.md#microck-jarspect).
- [microsoft/minecraft-gametests](https://github.com/microsoft/minecraft-gametests) - [specific cited locations](Reference-Index.md#microsoft-minecraft-gametests).
- [microsoft/minecraft-scripting-samples](https://github.com/microsoft/minecraft-scripting-samples) - [specific cited locations](Reference-Index.md#microsoft-minecraft-scripting-samples).
- [microsoft/rust_win_etw](https://github.com/microsoft/rust_win_etw) - [specific cited locations](Reference-Index.md#microsoft-rust-win-etw).
- [microsoft/tracing-etw](https://github.com/microsoft/tracing-etw) - [specific cited locations](Reference-Index.md#microsoft-tracing-etw).
- [microsoft/TRELLIS](https://github.com/microsoft/TRELLIS) - [specific cited locations](Reference-Index.md#microsoft-trellis).
- [MilkdromedaStudios/Octo-Loader](https://github.com/MilkdromedaStudios/Octo-Loader) - [specific cited locations](Reference-Index.md#milkdromedastudios-octo-loader).
- [minecraft-dev/MinecraftDev](https://github.com/minecraft-dev/MinecraftDev) - [specific cited locations](Reference-Index.md#minecraft-dev-minecraftdev).
- [MinecraftForge/BinaryPatcher](https://github.com/MinecraftForge/BinaryPatcher) - [specific cited locations](Reference-Index.md#minecraftforge-binarypatcher).
- [MinecraftForge/ForgeFlower](https://github.com/MinecraftForge/ForgeFlower) - [specific cited locations](Reference-Index.md#minecraftforge-forgeflower).
- [MinecraftForge/MCPConfig](https://github.com/MinecraftForge/MCPConfig) - [specific cited locations](Reference-Index.md#minecraftforge-mcpconfig).
- [MinecraftForge/renamer](https://github.com/MinecraftForge/renamer) - [specific cited locations](Reference-Index.md#minecraftforge-renamer).
- [MinecraftForge/Srg2Source](https://github.com/MinecraftForge/Srg2Source) - [specific cited locations](Reference-Index.md#minecraftforge-srg2source).
- [MinecraftForge/SrgUtils](https://github.com/MinecraftForge/SrgUtils) - [specific cited locations](Reference-Index.md#minecraftforge-srgutils).
- [misode/mcmeta](https://github.com/misode/mcmeta) - [specific cited locations](Reference-Index.md#misode-mcmeta).
- [misode/misode.github.io](https://github.com/misode/misode.github.io) - [specific cited locations](Reference-Index.md#misode-misode-github-io).
- [misode/technical-changes](https://github.com/misode/technical-changes) - [specific cited locations](Reference-Index.md#misode-technical-changes).
- [ModificationStation/StationAPI](https://github.com/ModificationStation/StationAPI) - [specific cited locations](Reference-Index.md#modificationstation-stationapi).
- [modmuss50/mod-publish-plugin](https://github.com/modmuss50/mod-publish-plugin) - [specific cited locations](Reference-Index.md#modmuss50-mod-publish-plugin).
- [modrinth/daedalus](https://github.com/modrinth/daedalus) - [specific cited locations](Reference-Index.md#modrinth-daedalus).
- [modrinth/minotaur](https://github.com/modrinth/minotaur) - [specific cited locations](Reference-Index.md#modrinth-minotaur).
- [Mojang/bedrock-protocol-docs](https://github.com/Mojang/bedrock-protocol-docs) - [specific cited locations](Reference-Index.md#mojang-bedrock-protocol-docs).
- [Mojang/bedrock-samples](https://github.com/Mojang/bedrock-samples) - [specific cited locations](Reference-Index.md#mojang-bedrock-samples).
- [Mojang/DataFixerUpper](https://github.com/Mojang/DataFixerUpper) - [specific cited locations](Reference-Index.md#mojang-datafixerupper).
- [moka-rs/moka](https://github.com/moka-rs/moka) - [specific cited locations](Reference-Index.md#moka-rs-moka).
- [mozilla/cargo-vet](https://github.com/mozilla/cargo-vet) - [specific cited locations](Reference-Index.md#mozilla-cargo-vet).
- [mozilla/sccache](https://github.com/mozilla/sccache) - [specific cited locations](Reference-Index.md#mozilla-sccache).
- [mstange/samply](https://github.com/mstange/samply) - [specific cited locations](Reference-Index.md#mstange-samply).
- [naelstrof/JigglePhysics](https://github.com/naelstrof/JigglePhysics) - [specific cited locations](Reference-Index.md#naelstrof-jigglephysics).
- [neoforged/AccessTransformers](https://github.com/neoforged/AccessTransformers) - [specific cited locations](Reference-Index.md#neoforged-accesstransformers).
- [neoforged/FancyModLoader](https://github.com/neoforged/FancyModLoader) - [specific cited locations](Reference-Index.md#neoforged-fancymodloader).
- [neoforged/InstallerTools](https://github.com/neoforged/InstallerTools) - [specific cited locations](Reference-Index.md#neoforged-installertools).
- [neoforged/JarCompatibilityChecker](https://github.com/neoforged/JarCompatibilityChecker) - [specific cited locations](Reference-Index.md#neoforged-jarcompatibilitychecker).
- [neoforged/ModDevGradle](https://github.com/neoforged/ModDevGradle) - [specific cited locations](Reference-Index.md#neoforged-moddevgradle).
- [neoforged/NeoForge](https://github.com/neoforged/NeoForge) - [specific cited locations](Reference-Index.md#neoforged-neoforge).
- [neoforged/NeoForm](https://github.com/neoforged/NeoForm) - [specific cited locations](Reference-Index.md#neoforged-neoform).
- [nextest-rs/nextest](https://github.com/nextest-rs/nextest) - [specific cited locations](Reference-Index.md#nextest-rs-nextest).
- [nickbabcock/rawzip](https://github.com/nickbabcock/rawzip) - [specific cited locations](Reference-Index.md#nickbabcock-rawzip).
- [nlfiedler/fastcdc-rs](https://github.com/nlfiedler/fastcdc-rs) - [specific cited locations](Reference-Index.md#nlfiedler-fastcdc-rs).
- [nothub/mrpack-install](https://github.com/nothub/mrpack-install) - [specific cited locations](Reference-Index.md#nothub-mrpack-install).
- [notify-rs/notify](https://github.com/notify-rs/notify) - [specific cited locations](Reference-Index.md#notify-rs-notify).
- [obi1kenobi/cargo-semver-checks](https://github.com/obi1kenobi/cargo-semver-checks) - [specific cited locations](Reference-Index.md#obi1kenobi-cargo-semver-checks).
- [Ocelot5836/molang-compiler](https://github.com/Ocelot5836/molang-compiler) - [specific cited locations](Reference-Index.md#ocelot5836-molang-compiler).
- [oliveryasuna/modkit](https://github.com/oliveryasuna/modkit) - [specific cited locations](Reference-Index.md#oliveryasuna-modkit).
- [openjdk/sigtest](https://github.com/openjdk/sigtest) - [specific cited locations](Reference-Index.md#openjdk-sigtest).
- [openrewrite/rewrite](https://github.com/openrewrite/rewrite) - [specific cited locations](Reference-Index.md#openrewrite-rewrite).
- [OpenShock/Integrations.Minecraft](https://github.com/OpenShock/Integrations.Minecraft) - [specific cited locations](Reference-Index.md#openshock-integrations-minecraft).
- [openSUSE/libsolv](https://github.com/openSUSE/libsolv) - [specific cited locations](Reference-Index.md#opensuse-libsolv).
- [OrnitheMC/calamus](https://github.com/OrnitheMC/calamus) - [specific cited locations](Reference-Index.md#ornithemc-calamus).
- [OrnitheMC/feather](https://github.com/OrnitheMC/feather) - [specific cited locations](Reference-Index.md#ornithemc-feather).
- [OrnitheMC/ploceus](https://github.com/OrnitheMC/ploceus) - [specific cited locations](Reference-Index.md#ornithemc-ploceus).
- [oss-review-toolkit/ort](https://github.com/oss-review-toolkit/ort) - [specific cited locations](Reference-Index.md#oss-review-toolkit-ort).
- [P3pp3rF1y/SophisticatedBackpacks](https://github.com/P3pp3rF1y/SophisticatedBackpacks) - [specific cited locations](Reference-Index.md#p3pp3rf1y-sophisticatedbackpacks).
- [P3pp3rF1y/SophisticatedCore](https://github.com/P3pp3rF1y/SophisticatedCore) - [specific cited locations](Reference-Index.md#p3pp3rf1y-sophisticatedcore).
- [PacifistMC/Forgix](https://github.com/PacifistMC/Forgix) - [specific cited locations](Reference-Index.md#pacifistmc-forgix).
- [packwiz/packwiz](https://github.com/packwiz/packwiz) - [specific cited locations](Reference-Index.md#packwiz-packwiz).
- [PaperMC/codebook](https://github.com/PaperMC/codebook) - [specific cited locations](Reference-Index.md#papermc-codebook).
- [PaperMC/mache](https://github.com/PaperMC/mache) - [specific cited locations](Reference-Index.md#papermc-mache).
- [PaperMC/Paper](https://github.com/PaperMC/Paper) - [specific cited locations](Reference-Index.md#papermc-paper).
- [PaperMC/paperweight](https://github.com/PaperMC/paperweight) - [specific cited locations](Reference-Index.md#papermc-paperweight).
- [PaperMC/ParchmentMappings](https://github.com/PaperMC/ParchmentMappings) - [specific cited locations](Reference-Index.md#papermc-parchmentmappings).
- [PaperMC/unpick-definitions](https://github.com/PaperMC/unpick-definitions) - [specific cited locations](Reference-Index.md#papermc-unpick-definitions).
- [ParchmentMC/Parchment](https://github.com/ParchmentMC/Parchment) - [specific cited locations](Reference-Index.md#parchmentmc-parchment).
- [PatchworkMC/patchwork-api](https://github.com/PatchworkMC/patchwork-api) - [specific cited locations](Reference-Index.md#patchworkmc-patchwork-api).
- [pop4959/Chunky](https://github.com/pop4959/Chunky) - [specific cited locations](Reference-Index.md#pop4959-chunky).
- [prefix-dev/resolvo](https://github.com/prefix-dev/resolvo) - [specific cited locations](Reference-Index.md#prefix-dev-resolvo).
- [PrismarineJS/bedrock-protocol](https://github.com/PrismarineJS/bedrock-protocol) - [specific cited locations](Reference-Index.md#prismarinejs-bedrock-protocol).
- [PrismarineJS/minecraft-data](https://github.com/PrismarineJS/minecraft-data) - [specific cited locations](Reference-Index.md#prismarinejs-minecraft-data).
- [PrismarineJS/mineflayer](https://github.com/PrismarineJS/mineflayer) - [specific cited locations](Reference-Index.md#prismarinejs-mineflayer).
- [PrismarineJS/node-minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol) - [specific cited locations](Reference-Index.md#prismarinejs-node-minecraft-protocol).
- [PrismLauncher/meta](https://github.com/PrismLauncher/meta) - [specific cited locations](Reference-Index.md#prismlauncher-meta).
- [PrismLauncher/meta-launcher](https://github.com/PrismLauncher/meta-launcher) - [specific cited locations](Reference-Index.md#prismlauncher-meta-launcher).
- [PrismLauncher/PrismLauncher](https://github.com/PrismLauncher/PrismLauncher) - [specific cited locations](Reference-Index.md#prismlauncher-prismlauncher).
- [pubgrub-rs/pubgrub](https://github.com/pubgrub-rs/pubgrub) - [specific cited locations](Reference-Index.md#pubgrub-rs-pubgrub).
- [Querz/mcaselector](https://github.com/Querz/mcaselector) - [specific cited locations](Reference-Index.md#querz-mcaselector).
- [quickwit-oss/tantivy](https://github.com/quickwit-oss/tantivy) - [specific cited locations](Reference-Index.md#quickwit-oss-tantivy).
- [QuiltMC/quilt-loader](https://github.com/QuiltMC/quilt-loader) - [specific cited locations](Reference-Index.md#quiltmc-quilt-loader).
- [QuiltMC/quilt-loom](https://github.com/QuiltMC/quilt-loom) - [specific cited locations](Reference-Index.md#quiltmc-quilt-loom).
- [QuiltMC/quilt-mappings](https://github.com/QuiltMC/quilt-mappings) - [specific cited locations](Reference-Index.md#quiltmc-quilt-mappings).
- [Railroad-Team/Railroad](https://github.com/Railroad-Team/Railroad) - [specific cited locations](Reference-Index.md#railroad-team-railroad).
- [RaphiMC/ImmediatelyFast](https://github.com/RaphiMC/ImmediatelyFast) - [specific cited locations](Reference-Index.md#raphimc-immediatelyfast).
- [raphw/byte-buddy](https://github.com/raphw/byte-buddy) - [specific cited locations](Reference-Index.md#raphw-byte-buddy).
- [RelativityMC/neo-loom](https://github.com/RelativityMC/neo-loom) - [specific cited locations](Reference-Index.md#relativitymc-neo-loom).
- [ReplayMod/preprocessor](https://github.com/ReplayMod/preprocessor) - [specific cited locations](Reference-Index.md#replaymod-preprocessor).
- [revapi/revapi](https://github.com/revapi/revapi) - [specific cited locations](Reference-Index.md#revapi-revapi).
- [RoaringBitmap/roaring-rs](https://github.com/RoaringBitmap/roaring-rs) - [specific cited locations](Reference-Index.md#roaringbitmap-roaring-rs).
- [rust-minidump/minidump-writer](https://github.com/rust-minidump/minidump-writer) - [specific cited locations](Reference-Index.md#rust-minidump-minidump-writer).
- [rustls/rustls-platform-verifier](https://github.com/rustls/rustls-platform-verifier) - [specific cited locations](Reference-Index.md#rustls-rustls-platform-verifier).
- [rustsec/rustsec](https://github.com/rustsec/rustsec) - [specific cited locations](Reference-Index.md#rustsec-rustsec).
- [sfPlayer1/Matcher](https://github.com/sfPlayer1/Matcher) - [specific cited locations](Reference-Index.md#sfplayer1-matcher).
- [Sinytra/Connector](https://github.com/Sinytra/Connector) - [specific cited locations](Reference-Index.md#sinytra-connector).
- [Sinytra/ConnectorExtras](https://github.com/Sinytra/ConnectorExtras) - [specific cited locations](Reference-Index.md#sinytra-connectorextras).
- [Sinytra/ForgifiedFabricAPI](https://github.com/Sinytra/ForgifiedFabricAPI) - [specific cited locations](Reference-Index.md#sinytra-forgifiedfabricapi).
- [Sinytra/ForgifiedFabricLoader](https://github.com/Sinytra/ForgifiedFabricLoader) - [specific cited locations](Reference-Index.md#sinytra-forgifiedfabricloader).
- [Sinytra/Launchpad](https://github.com/Sinytra/Launchpad) - [specific cited locations](Reference-Index.md#sinytra-launchpad).
- [Sinytra/MercuryMixin](https://github.com/Sinytra/MercuryMixin) - [specific cited locations](Reference-Index.md#sinytra-mercurymixin).
- [Sinytra/MixinTransmogrifier](https://github.com/Sinytra/MixinTransmogrifier) - [specific cited locations](Reference-Index.md#sinytra-mixintransmogrifier).
- [siom79/japicmp](https://github.com/siom79/japicmp) - [specific cited locations](Reference-Index.md#siom79-japicmp).
- [soot-oss/SootUp](https://github.com/soot-oss/SootUp) - [specific cited locations](Reference-Index.md#soot-oss-sootup).
- [sourcefrog/cargo-mutants](https://github.com/sourcefrog/cargo-mutants) - [specific cited locations](Reference-Index.md#sourcefrog-cargo-mutants).
- [SparkUniverse/architectury-loom](https://github.com/SparkUniverse/architectury-loom) - [specific cited locations](Reference-Index.md#sparkuniverse-architectury-loom).
- [SparkUniverse/essential-gradle-toolkit](https://github.com/SparkUniverse/essential-gradle-toolkit) - [specific cited locations](Reference-Index.md#sparkuniverse-essential-gradle-toolkit).
- [SpongePowered/MercuryMixin](https://github.com/SpongePowered/MercuryMixin) - [specific cited locations](Reference-Index.md#spongepowered-mercurymixin).
- [SpongePowered/Mixin](https://github.com/SpongePowered/Mixin) - [specific cited locations](Reference-Index.md#spongepowered-mixin).
- [SpoonLabs/gumtree-spoon-ast-diff](https://github.com/SpoonLabs/gumtree-spoon-ast-diff) - [specific cited locations](Reference-Index.md#spoonlabs-gumtree-spoon-ast-diff).
- [SpyglassMC/vanilla-mcdoc](https://github.com/SpyglassMC/vanilla-mcdoc) - [specific cited locations](Reference-Index.md#spyglassmc-vanilla-mcdoc).
- [taiki-e/cargo-llvm-cov](https://github.com/taiki-e/cargo-llvm-cov) - [specific cited locations](Reference-Index.md#taiki-e-cargo-llvm-cov).
- [Tencent-Hunyuan/Hunyuan3D-2.1](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1) - [specific cited locations](Reference-Index.md#tencent-hunyuan-hunyuan3d-2-1).
- [TencentARC/InstantMesh](https://github.com/TencentARC/InstantMesh) - [specific cited locations](Reference-Index.md#tencentarc-instantmesh).
- [TheIllusiveC4/Curios](https://github.com/TheIllusiveC4/Curios) - [specific cited locations](Reference-Index.md#theillusivec4-curios).
- [theorzr/portablemc](https://github.com/theorzr/portablemc) - [specific cited locations](Reference-Index.md#theorzr-portablemc).
- [TimStewartJ/TheMightyArchitectury](https://github.com/TimStewartJ/TheMightyArchitectury) - [specific cited locations](Reference-Index.md#timstewartj-themightyarchitectury).
- [tom5454/CustomPlayerModels](https://github.com/tom5454/CustomPlayerModels) - [specific cited locations](Reference-Index.md#tom5454-customplayermodels).
- [toxicity188/ArmorModel](https://github.com/toxicity188/ArmorModel) - [specific cited locations](Reference-Index.md#toxicity188-armormodel).
- [toxicity188/DynamicUV](https://github.com/toxicity188/DynamicUV) - [specific cited locations](Reference-Index.md#toxicity188-dynamicuv).
- [toxicity188/java-mesh](https://github.com/toxicity188/java-mesh) - [specific cited locations](Reference-Index.md#toxicity188-java-mesh).
- [tr7zw/EntityCulling](https://github.com/tr7zw/EntityCulling) - [specific cited locations](Reference-Index.md#tr7zw-entityculling).
- [Traben-0/Entity_Model_Features](https://github.com/Traben-0/Entity_Model_Features) - [specific cited locations](Reference-Index.md#traben-0-entity-model-features).
- [Traben-0/Entity_Texture_Features](https://github.com/Traben-0/Entity_Texture_Features) - [specific cited locations](Reference-Index.md#traben-0-entity-texture-features).
- [trigram-mrp/fractureiser](https://github.com/trigram-mrp/fractureiser) - [specific cited locations](Reference-Index.md#trigram-mrp-fractureiser).
- [tsantalis/RefactoringMiner](https://github.com/tsantalis/RefactoringMiner) - [specific cited locations](Reference-Index.md#tsantalis-refactoringminer).
- [tyler-builds/fx](https://github.com/tyler-builds/fx) - [specific cited locations](Reference-Index.md#tyler-builds-fx).
- [unimined/unimined](https://github.com/unimined/unimined) - [specific cited locations](Reference-Index.md#unimined-unimined).
- [unnamed/hephaestus-engine](https://github.com/unnamed/hephaestus-engine) - [specific cited locations](Reference-Index.md#unnamed-hephaestus-engine).
- [VAST-AI-Research/TripoSR](https://github.com/VAST-AI-Research/TripoSR) - [specific cited locations](Reference-Index.md#vast-ai-research-triposr).
- [VAST-AI-Research/UniRig](https://github.com/VAST-AI-Research/UniRig) - [specific cited locations](Reference-Index.md#vast-ai-research-unirig).
- [VazkiiMods/Patchouli](https://github.com/VazkiiMods/Patchouli) - [specific cited locations](Reference-Index.md#vazkiimods-patchouli).
- [vberlier/pytest-minecraft](https://github.com/vberlier/pytest-minecraft) - [specific cited locations](Reference-Index.md#vberlier-pytest-minecraft).
- [ViaVersion/Mappings](https://github.com/ViaVersion/Mappings) - [specific cited locations](Reference-Index.md#viaversion-mappings).
- [vorner/arc-swap](https://github.com/vorner/arc-swap) - [specific cited locations](Reference-Index.md#vorner-arc-swap).
- [Voxelum/x-minecraft-launcher](https://github.com/Voxelum/x-minecraft-launcher) - [specific cited locations](Reference-Index.md#voxelum-x-minecraft-launcher).
- [vrm-c/UniVRM](https://github.com/vrm-c/UniVRM) - [specific cited locations](Reference-Index.md#vrm-c-univrm).
- [wangfu91/usn-journal-rs](https://github.com/wangfu91/usn-journal-rs) - [specific cited locations](Reference-Index.md#wangfu91-usn-journal-rs).
- [wild-linker/wild](https://github.com/wild-linker/wild) - [specific cited locations](Reference-Index.md#wild-linker-wild).
- [wjakob/instant-meshes](https://github.com/wjakob/instant-meshes) - [specific cited locations](Reference-Index.md#wjakob-instant-meshes).
- [wvwwvwwv/scalable-concurrent-containers](https://github.com/wvwwvwwv/scalable-concurrent-containers) - [specific cited locations](Reference-Index.md#wvwwvwwv-scalable-concurrent-containers).
- [YoshiKuro-Modding/MinecraftJavatoBedrockPorter](https://github.com/YoshiKuro-Modding/MinecraftJavatoBedrockPorter) - [specific cited locations](Reference-Index.md#yoshikuro-modding-minecraftjavatobedrockporter).
- [ZerixNetwork/Bridger](https://github.com/ZerixNetwork/Bridger) - [specific cited locations](Reference-Index.md#zerixnetwork-bridger).

**[All original reference links](Reference-Index.md)** / **[Conversion requirements](Conversion.md)** / **[Adaptive mod contracts](Knowledge-and-Compatibility.md)**
