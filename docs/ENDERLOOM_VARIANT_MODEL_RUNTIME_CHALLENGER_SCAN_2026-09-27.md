# Enderloom — Variant Foundry / High-Fidelity Model Challenger Scan — 2026-09-27

**Status:** Current research input to implementation; challengers are candidates until exact-version, license, quality and runtime gates pass.  
**Canonical implementation contracts:** `ENDERLOOM_UNIVERSAL_BIOME_MODEL_VARIATOR_SPEC.md`, `ENDERLOOM_HIGH_FIDELITY_JAVA_MODEL_RUNTIME_SPEC.md`

## Result

The fresh 2026 sweep found several materially useful projects that were missing from the first pass. Enderloom should not build weaker substitutes first. It should place these behind typed adapters/oracles, compare them on the same fixtures, and promote only the strongest compatible path.

## P0 — integrate/study first

### Concept/reference -> animate-ready asset

- **VAST-AI-Research/AniGen** — single image -> coherent mesh + skeleton + skinning in one animate-ready pipeline. This is the strongest new direct challenger for concept-art blockout/rig hypotheses. Source is MIT, but its repository documents third-party components with additional restrictions, so Enderloom must license-gate the exact dependency path rather than treating the whole stack as unrestricted.
  - https://github.com/VAST-AI-Research/AniGen
- **VAST-AI-Research/SkinTokens / TokenRig** — successor to UniRig; mesh -> unified skeleton hierarchy + skin weights. Prefer it as the current auto-rig challenger while retaining UniRig and RigAnything as differential oracles.
  - https://github.com/VAST-AI-Research/SkinTokens
- **Isabella98Liu/RigAnything** — template-free mesh rigging; useful differential rig oracle for unusual mobs, quadrupeds and non-humanoid assets.
  - https://github.com/Isabella98Liu/RigAnything
- **Microsoft TRELLIS.2** — current high-fidelity image-to-3D candidate with PBR attributes, opacity and difficult topology support. It supersedes the first-pass TRELLIS-only comparison lane; keep both only where the older pipeline still wins an exact fixture.
  - https://github.com/microsoft/TRELLIS.2
- **VAST-AI-Research/TripoSG** — high-fidelity image-to-3D challenger with controllable face limits and a scribble+prompt route useful for concept correction.
  - https://github.com/VAST-AI-Research/TripoSG

### Part decomposition / Minecraftization

- **Tencent-Hunyuan/Hunyuan3D-Part** — P3-SAM part segmentation plus X-Part shape decomposition. Use as a semantic-part proposal stage before deciding Minecraft bones/groups, not as final truth.
  - https://github.com/Tencent-Hunyuan/Hunyuan3D-Part
- **wgsxm/PartCrafter** — image -> structured multi-part mesh generation; useful when a concept should become separable horns, petals, armor plates, limbs or props.
  - https://github.com/wgsxm/PartCrafter
- **buaacyw/MeshAnythingV2** — dense/scan mesh -> artist-created low-face mesh candidate. Compare against deterministic remesh/simplification rather than trusting generated topology blindly.
  - https://github.com/buaacyw/MeshAnythingV2
- **MopicMP/gltf-to-minecraft** — extremely relevant Blockbench bridge: glTF/Sketchfab -> Minecraft cubes, GeckoLib/Bedrock/Generic/Java outputs, animation transfer, texture atlasing and CPM export. Integrate or adapt its conversion ideas before inventing another glTF-to-cuboid pipeline.
  - https://github.com/MopicMP/gltf-to-minecraft

### Java/server runtime semantics

- **toxicity188/BetterModel** — current Bedrock-style Java model engine benchmark with Blockbench cubes/meshes/nulls/locators, Molang, IK, player models/custom armor, syncing and performance-oriented packet rendering. Its mesh/IK/Molang architecture is a major challenger for Enderloom's high-fidelity IR/runtime decisions.
  - https://github.com/toxicity188/BetterModel
- **tomalbrc/blockbench-import-library** — imports `.bbmodel`/`.ajmodel`, supports animations/Molang/effect keyframes/variants/locators, virtual Item Displays, asynchronous transforms, culling boxes and many vanilla entity behaviors. Use as an adapter/fixture/reference for efficient server-model compatibility.
  - https://github.com/tomalbrc/blockbench-import-library
- **Animated-Java/animated-java** — rich Java display-entity animation semantics: variants, easing, tweening, locators, cameras and Molang. Its AGPL licensing means Enderloom must not silently vendor source into an incompatible distribution; use an adapter, subprocess/export boundary or behavioral oracle unless the chosen distribution intentionally complies.
  - https://github.com/Animated-Java/animated-java
- **toxicity188/java-mesh**, **DynamicUV**, **ArmorModel**, and **Ocelot5836/molang-compiler** — BetterModel's component ecosystem is worth evaluating independently for mesh rendering, dynamic UV/player skin handling, armor and compiled Molang.
  - https://github.com/toxicity188/java-mesh
  - https://github.com/toxicity188/DynamicUV
  - https://github.com/toxicity188/ArmorModel
  - https://github.com/Ocelot5836/molang-compiler

## P1 — performance and rendering architecture

- **Engine-Room/Flywheel** — study GPU instancing and shader/interface architecture for large crowds and repeated model parts.
  - https://github.com/Engine-Room/Flywheel
- **FoundryMC/Veil** — advanced Java rendering utilities/easing/shader capabilities; compare as an optional rendering layer rather than making it mandatory.
  - https://github.com/FoundryMC/Veil
- **zeux/meshoptimizer** — deterministic mesh cache/fetch/overdraw optimization, simplification and LOD tooling; strong candidate for preprocessing imported/generated meshes.
  - https://github.com/zeux/meshoptimizer
- **jpcy/xatlas** — deterministic UV charting/unwrapping/packing candidate for mesh-assisted assets and generated texture transfer.
  - https://github.com/jpcy/xatlas
- **wjakob/instant-meshes** — remeshing challenger for topology cleanup.
  - https://github.com/wjakob/instant-meshes
- **RaphiMC/ImmediatelyFast**, **tr7zw/EntityCulling**, **FxMorin/MoreCulling** — treat as compatibility/performance fixtures so Enderloom's model runtime cooperates with current fast render/culling stacks rather than fighting them.
  - https://github.com/RaphiMC/ImmediatelyFast
  - https://github.com/tr7zw/EntityCulling
  - https://github.com/FxMorin/MoreCulling

## P1 — secondary motion / physics

- **VRM SpringBone 1.0** — adopt/translate its proven spring-bone concepts (Verlet-style simulation, stiffness/drag/gravity, sphere/capsule colliders) into Enderloom's typed `SecondaryMotionGraph` where they fit. This gives us a portable, documented hair/clothing/tail baseline instead of inventing every rule.
  - https://github.com/vrm-c/vrm-specification
  - https://github.com/vrm-c/UniVRM
- **xloveee/jiggle-physics** — useful 2026 open reference for weight-painted soft regions + seeded damped spring bones. Candidate for optional mesh-weight secondary deformation.
  - https://github.com/xloveee/jiggle-physics
- **naelstrof/JigglePhysics** — useful mature implementation reference for drag, air drag, gravity, angular limits, collision and performant chain updates.
  - https://github.com/naelstrof/JigglePhysics

Enderloom should keep its Minecraft runtime implementation native and deterministic; these are physics semantics/reference implementations, not a requirement to embed Unity/Godot code.

## P1 — effects / materials / authoring QoL

- **Low-Drag-MC/Photon** — excellent VFX/editor benchmark: timeline, force fields, mesh particles, post effects and GPU instancing. Current repository licensing is non-commercial, so source reuse is rights-gated; study behavior and integrate only under compatible permission.
  - https://github.com/Low-Drag-MC/Photon
- **LodestarMC/Lodestone** — compare rendering/VFX utilities for Java effects.
  - https://github.com/LodestarMC/Lodestone
- **Blockbench official plugin registry** — Enderloom should explicitly reuse/integrate/mirror useful current authoring capabilities instead of rebuilding weaker versions:
  - Animated Java;
  - GeckoLib Models & Animations;
  - AzureLib Animator;
  - Figura Model Format;
  - CEM Template Loader + EMF Animation Addon;
  - PBR Tools;
  - MTools;
  - Bone View;
  - Root Motion Extractor;
  - Bakery;
  - Animated Platforms;
  - Easing Peasy;
  - Optimize concealed faces;
  - Plaster UV bleed repair;
  - Reference Models;
  - VoxelShape generators;
  - Easy Model Entities;
  - glTF to Minecraft.
  - https://github.com/JannisX11/blockbench-plugins

## Architecture decisions from this sweep

1. **Make glTF a first-class interchange lane.** Concept-generation and auto-rig challengers commonly emit GLB/glTF. Enderloom should preserve rig, skin, material and provenance through a typed glTF intake before Minecraftization.
2. **Separate shape, part decomposition, rigging and Minecraftization.** Do not let one generative model become an all-or-nothing dependency. AniGen can propose all three, but Hunyuan3D-Part, SkinTokens/RigAnything and glTF-to-Minecraft provide independent challenge lanes.
3. **Add IK to the high-fidelity animation IR.** BetterModel proves this is useful in the Minecraft model ecosystem; Enderloom should support authored/solved IK constraints and bake only when the target backend requires it.
4. **Support mesh-assisted Java without abandoning cuboid-native output.** Preserve mesh primitives where the selected renderer can actually handle them; otherwise use measured cuboid/plane fitting with an explicit approximation report.
5. **Adopt a portable spring-bone semantics layer.** VRM SpringBone concepts + Enderloom extensions for water/wind/material phenotype are a better baseline than bespoke one-off vine code.
6. **Optimize offline before spending frame time.** Atlas/UV generation, mesh simplification, cache/fetch ordering, expression compilation and immutable shared data should be preprocessing steps whenever possible.
7. **Crowd performance needs GPU/renderer challengers.** Benchmark Flywheel-style instancing and optional custom GPU skinning/matrix upload against normal GeckoLib/native paths; promote only when compatibility and actual frame-time improve.
8. **License is part of the adapter contract.** AGPL/non-commercial/research-only components stay isolated or reference-only unless the chosen Enderloom distribution and user authorization make direct integration lawful.
9. **Blockbench plugin parity is a QoL floor.** Enderloom Studio should import/export or expose equivalent/better workflows for the useful plugin features above while keeping one canonical Enderloom model/animation truth.
10. **Every candidate becomes a regression fixture.** The Bloom & Boom creature family should benchmark concept -> shape -> parts -> rig -> Minecraft model -> secondary motion -> native runtime -> crowd performance so future challengers can be compared without subjective replacement.

## Required benchmark matrix

For each candidate route record:

- exact commit/version/license and model-weight license;
- input/output formats;
- geometry and texture fidelity;
- skeleton hierarchy quality;
- skinning quality;
- animation/event preservation;
- Minecraft editability;
- conversion approximation loss;
- preprocessing time/VRAM;
- runtime CPU/GPU/frame-time cost;
- target-loader/render-stack compatibility;
- whether it improves Bloom & Boom versus the current promoted route.

Nothing is promoted because a README says it is better. Enderloom promotes a challenger only after the same fixtures prove it.
