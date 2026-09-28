# Enderloom — Variant Foundry Capability Closure

**Status:** Canonical completeness contract for the Universal Biome & Model Variator / High-Fidelity Java Model Runtime  
**Updated:** 2026-09-27  
**Purpose:** Make sure Enderloom has every capability required to turn concept art or an existing Minecraft asset into beautiful, editable, biome-aware, animated, performant Java content without depending on one fragile model/provider/editor/runtime.

## 1. Definition of complete

Variant Foundry is only capability-complete when one canonical project can travel through this whole chain without manual source surgery:

```text
reference/concept/existing asset
 -> reference authority + SubjectDNA
 -> geometry proposal(s)
 -> semantic parts + editable hierarchy
 -> Minecraftization / topology cleanup
 -> UV + material + pixel-art texture compilation
 -> rig + animation + IK + secondary motion
 -> BiomeDNA / DimensionDNA discovery
 -> seeded variant family planning
 -> target-runtime compilation
 -> native Minecraft execution
 -> deterministic visual/performance/compatibility proof
 -> packaged source + provenance + Wiki Variant Atlas
```

A provider may be missing or fail. The workflow still succeeds by switching adapters while preserving the same canonical project state.

## 2. Canonical capability stack

| ID | Capability | Required behavior | Primary challengers / references |
|---|---|---|---|
| VF-INTAKE-01 | Reference intake | Images, turntables, GIF/video, `.bbmodel`, GLB/glTF, OBJ/FBX, Bedrock geo/animation, Java model assets, authorized server-model assets | Existing Enderloom reference pipeline, Blockbench |
| VF-DNA-01 | Subject identity | Preserve face, silhouette, proportions, horns/limbs/anchors, material identity, rig/animation/gameplay locks | SubjectDNA + VariantIdentityAnchor |
| VF-SHAPE-01 | Concept -> 3D | Multiple candidate shapes with deterministic seed/provenance; no provider lock-in | TRELLIS.2, Hi3DGen, Hunyuan3D, TripoSG, AniGen |
| VF-PARTS-01 | Semantic parts | Propose separable limbs/horns/petals/plates/props without overriding reference truth | Hunyuan3D-Part, PartCrafter |
| VF-RETOPO-01 | Topology cleanup | Deterministic cleanup, simplification, retopo, normals, non-manifold/degenerate repair | Blender/QuadriFlow, MeshAnythingV2, meshoptimizer, OpenX Clay, MyMeshy |
| VF-GLTF-01 | Interchange IR | Preserve nodes, bones, weights, animations, PBR materials, textures, scale and provenance through GLB/glTF | glTF Transform, glTF Validator, Assimp fallback |
| VF-MCIZE-01 | Minecraftization | Convert scaffold meshes into editable Minecraft cubes/planes/allowed mesh primitives with explicit approximation report | glTF-to-Minecraft, Blockbench, Enderloom fitting |
| VF-UV-01 | UV authoring | Stable unwrap/atlas, rotated/flipped/per-face UV retention, overlap/seam audit | xatlas, Blockbench, Blender |
| VF-TEX-01 | Multi-view texturing | Seam-safe, view-consistent albedo/texture synthesis from concept/prompt | Hunyuan3D-Paint, MVPaint, SyncMVD, Paint3D, TEXGen |
| VF-MAT-01 | Material synthesis | Preserve/generate base color, normal/height, roughness/smoothness, metalness, AO, emissive, opacity | TRELLIS.2, Hunyuan3D 2.1, StableMaterials, Iris/LabPBR |
| VF-PIXEL-01 | Minecraft texture compiler | Convert high-res working materials into deliberate Minecraft pixel art without naive blur/downsample | Enderloom TextureStyleProfile + Blockbench/PBR tooling |
| VF-RIG-01 | Auto rig | Skeleton + skin weights as proposals, with differential challengers and artist locks | SkinTokens/TokenRig, RigAnything, Make-It-Animatable, Puppeteer |
| VF-IK-01 | IK | Preserve targets, poles, constraints, chain length, aim/spline/FABRIK/two-bone semantics and IK/FK blend until export | Blockbench evolution, BetterModel semantics |
| VF-ANIM-01 | Animation | Authored, retargeted, procedural and video-guided clips mapped to named gameplay states | Blockbench, GeckoLib/AzureLib, Puppeteer, AnyTop, BBS |
| VF-EVENT-01 | Animation events | Preserve sound/particle/custom/event markers, loop/delay/blend/override/easing/Molang semantics | GeckoLib, Bedrock controllers, BetterModel, Animated Java |
| VF-MOTION-01 | Secondary motion | Cheap deterministic vines/hair/leaves/tails/cloth/crystals with material/environment phenotype | VRM SpringBone semantics + Enderloom extensions |
| VF-PHYSICS-01 | Heavy physics escape hatch | Optional soft-body/rope/rigid collision only when truly needed and benchmarked | Jolt JNI, Velthoric |
| VF-BIOME-01 | Dynamic biome discovery | Discover unknown vanilla/modded/datapack biomes/dimensions from actual installed instance; never hardcode-only | Registry probe + JAR/datapack scan |
| VF-WORLDGEN-01 | Worldgen adapters | Understand major placement/config systems so custom biomes get richer profiles | TerraBlender 26.3, Biolith, Lithostitched, Terra, Fabric/NeoForge biome APIs |
| VF-BIOMEDNA-01 | Biome/Dimension DNA | Climate, palette, blocks, flora, structures, ambient effects, sound, lighting, hazards, material/motion cues | Canonical BiomeDNA / DimensionDNA |
| VF-CATALOG-01 | Curated accelerators | Versioned vanilla + popular biome/dimension packs + official upcoming/experimental channel | Aether, Twilight Forest, Blue Skies, Undergarden, Bumblezone, Deeper and Darker, Eternal Starlight, Tropicraft, Dimensional Doors, Ad Astra, Voidscape, biome-heavy packs |
| VF-VARIANT-01 | Variant planner | Texture/surface/geometry/rig-aware/full phenotype; region locks; deterministic seeds; only-missing/reroll-region operations | VariantPlan / VariantFamily |
| VF-ATMOS-01 | Atmosphere phenotype | Optional grass/foliage/water/fog/sky/particle/sound/resource-pack context | Polytone compatibility lane |
| VF-BUNDLE-01 | Runtime asset compiler | Compile canonical model family to target-specific immutable bundles with hashes, shared data, variant deltas and fallbacks | Enderloom ModelBundle compiler |
| VF-HOT-01 | Dev hot reload | Content-addressed cache + dependency invalidation + safe dev reload; never block render/game thread on disk/network | Enderloom compiler/cache |
| VF-RENDER-01 | Runtime backend | Least-lossy backend per target: native, GeckoLib, AzureLib, player/avatar, EMF/ETF/CEM, Enderloom skeletal renderer | Backend capability report |
| VF-SERVER-01 | Server-compatible export | Optional resource-pack/virtual-entity route without making server-display hacks the native client architecture | Polymer, blockbench-import-library, BetterModel semantics |
| VF-NET-01 | Multiplayer/state | Persist/sync small variant/state IDs; clients derive cosmetic pose/physics locally; graceful unknown-version fallback | Enderloom runtime binding |
| VF-BLOCKBENCH-01 | Live + headless authoring | Same canonical operations in interactive Blockbench and headless batch generation/validation | Jason Gardner Blockbench MCP, sosadly Blockbench MCP |
| VF-GPU-01 | Provider scheduler | Capability discovery, VRAM budget, local/remote workers, cancellation, queueing, stage unloading, reproducible job receipts | MyMeshy, OpenX Clay, AssetForge patterns |
| VF-QA-EDITOR-01 | Deterministic editor QA | Locked multiview renders, silhouette/landmarks, texture/UV/rig/loop measurements | Blockbench automation quality gates |
| VF-QA-NATIVE-01 | Native Minecraft QA | Exact candidate loaded; fixed world/camera/time/weather; state captures; logs; reload/persistence | Minecraft Dev Kit native visual QA |
| VF-VISREG-01 | Visual regression | Machine-diffable fixed-view/state reference images plus human-review escape hatch | vanilla-reference-harness pattern |
| VF-PERF-01 | Performance | Near-field fidelity preserved while culling/LOD/cache/sleep/batching reduce invisible work | Spark, Flywheel ideas, ImmediatelyFast/EntityCulling/MoreCulling compatibility |
| VF-RENDERCOMPAT-01 | Render-mod compatibility | Test vanilla + major modern render/culling/shader stacks and fall back without visual corruption | Sodium/Embeddium, Iris/Oculus, ImmediatelyFast, EntityCulling, MoreCulling |
| VF-PROV-01 | Provenance/rights | Every generated/converted artifact records source hashes, provider/model/weights/license, seed, params and derivation | Evidence graph |
| VF-WIKI-01 | Variant Atlas | Interactive model, variants, rig/animations/motion, biome DNA, backend, proof, compatibility/performance summary | Native Enderloom Wiki |
| VF-RECOVERY-01 | Failure recovery | Provider/tool/backend failure resumes from last valid stage, never restarts whole asset or hides missing work | Durable task/evidence system |

## 3. Minecraft Texture Compiler

High-resolution AI texture output is **working material**, not final Minecraft art.

Add a typed `TextureStyleProfile` containing at least:

- target texture dimensions and per-part texel density;
- nearest-neighbor/pixel-grid rules;
- palette anchors and allowed hue/value ramps;
- per-region palette locks;
- optional ordered/noise dithering policy;
- alpha threshold and translucent-region rules;
- transparent-edge color dilation to prevent dark fringes;
- UV island padding / mip-safe bleed;
- normal/height/PBR channel policy;
- emissive mask policy;
- biome material substitutions;
- detail scale limits so distant/small icons remain readable;
- reference palette/style exemplars from the current mod.

The compiler should provide at least:

```text
preserve-reference
vanilla-faithful
faithful-32x
faithful-64x
mod-native-style
custom-style-profile
```

No generated texture is accepted merely because a photorealistic 2K texture looks impressive in a DCC viewer.

## 4. Asset compiler and cache

Create a canonical `ModelBundle` compiler.

A compiled bundle contains:

- canonical source asset hash;
- target Minecraft/loader/backend identity;
- geometry and shared immutable buffers;
- texture/material pages;
- skeleton and bind pose;
- compiled animation/controller/expression data;
- secondary-motion graph;
- LOD/culling bounds;
- variant delta tables;
- biome/runtime selector bindings;
- backend fallbacks;
- provenance/rights manifest.

Rules:

- identical geometry/material/controller data is shared across variants;
- variants store deltas where that is cheaper than clones;
- expensive preprocessing occurs before runtime;
- content-addressed outputs are reused until an input dependency changes;
- development hot reload recompiles only invalidated nodes;
- release bundles are immutable and reproducible;
- disk/network/provider access never occurs on render/game ticks.

## 5. Provider execution plane

Generation is a job system, not a blocking button handler.

Required behavior:

- local GPU worker, optional remote GPU worker, and CPU-only deterministic stages;
- per-provider capability and model/weight/license metadata;
- configurable VRAM budget;
- only compatible heavy models resident together;
- unload/offload between stages when useful;
- progress, logs, cancellation and retry-from-stage;
- exact seed + input/output hashes;
- no mock/placeholder output may be promoted as real;
- provider failure selects a different challenger without losing prior valid stages.

Patterns worth adopting rather than rebuilding weaker versions:

- **MyMeshy** — local-first adapters, UV/PBR/export/MCP and VRAM-aware execution;
- **OpenX Clay** — provider registry, game-ready postprocess, LOD/collision/retopo/bake/rig tools and remote/self-hosted GPU contract;
- **AssetForge** — independent 13-stage pipeline, pure core separated from Blender shell, backend resolver/provenance and testable stage contracts.

These are challengers/pattern sources. Enderloom's canonical project graph remains authoritative.

## 6. Worldgen and custom-biome completeness

Dynamic registry discovery remains the source of truth. Add optional enrichment adapters for:

- TerraBlender, including current 26.3 lineage;
- Biolith placement/sub-biome/surface-rule data;
- Lithostitched data-driven worldgen compatibility;
- Terra config packs / nonstandard world generators;
- Fabric biome modification APIs;
- Forge/NeoForge biome modifiers/tags;
- BCLib-style BetterEnd/BetterNether lineage when detected.

The profile engine must also understand biome-heavy packs/datapacks even when they add no dimension. Curated profiles are quality accelerators for known ecosystems; they never replace runtime discovery.

An unknown private biome should still go:

```text
registry + tags + climate + colors + placed/configured features + blocks + assets + ambient data
 -> BiomeDNA
 -> confidence report
 -> variant candidate
```

## 7. Render compatibility matrix

Every promoted Java backend gets a compatibility fixture matrix across the relevant target:

- vanilla renderer;
- Sodium/Embeddium family as applicable;
- Iris/Oculus family as applicable;
- ImmediatelyFast;
- EntityCulling;
- MoreCulling;
- EMF/ETF/CEM when co-installed;
- resource-pack reload;
- shader on/off;
- emissive/translucent/cutout paths;
- first/third person where applicable.

A compatibility issue triggers an adapter/fallback or causal fix, never automatic feature removal.

## 8. Benchmark/promotion matrix

Every swappable candidate is scored by separate evidence dimensions, never one opaque “best” score:

- source/reference fidelity;
- silhouette/proportion fidelity;
- texture/material fidelity;
- Minecraft editability;
- rig quality;
- animation/event preservation;
- biome relevance;
- novelty versus sibling variants;
- preprocessing wall time;
- peak VRAM;
- runtime game-thread cost;
- runtime render-thread cost;
- GPU frame time;
- memory/allocation behavior;
- draw calls/vertices/bones/physics chains;
- compatibility;
- reproducibility;
- license/distribution fit.

Promote a candidate only when it materially improves at least one intended dimension without an unacceptable protected regression.

## 9. Required end-to-end Golden Fixture

**Bloom & Boom Variant Family**

Input:
- one approved concept;
- one editable base model once available;
- male/female family identity;
- horns and face locked;
- vines/flowers/crystals eligible for biome mutation.

Run:

```text
concept/reference
 -> candidate geometry challenge
 -> editable Minecraft model
 -> Minecraft Texture Compiler
 -> rig + named animation states
 -> secondary motion
 -> discover installed biomes
 -> generate representative vanilla + modded family
 -> headless Blockbench QA
 -> native Java compile
 -> actual Minecraft capture
 -> crowd/performance/renderer-compat matrix
 -> Wiki Variant Atlas
```

Acceptance includes at least one unknown synthetic/custom biome so the system proves it is not a hardcoded preset generator.

## 10. No-regression invariants

- Canonical editable source always survives provider/backend changes.
- High-resolution scaffolds never become an excuse for non-editable final Minecraft assets.
- Pixel-art/style quality is deliberate, not a downsample afterthought.
- Unknown biome is characterized, not rejected.
- Gameplay state and animation events remain authoritative over generated motion.
- Near-field approved detail is not removed for performance.
- Server-display compatibility is an export path, not the native Java architecture.
- Rich material channels are preserved even when a target backend needs a simpler fallback.
- Every optional AI stage has a deterministic/manual/alternate-provider escape route.
- The Wiki and capability matrix are generated from the same canonical project/evidence state.
