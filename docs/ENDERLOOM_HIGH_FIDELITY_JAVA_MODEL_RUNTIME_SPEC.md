# Enderloom — High-Fidelity Java Model Runtime & Secondary Motion Specification

**Status:** Mandatory product / implementation contract  
**Repository:** `Herbertofury/Enderloom`  
**Branch:** `main`  
**Applies to:** Enderloom Studio, Minecraft Dev Kit, Variant Foundry, Bloom & Boom, concept-art reconstruction, premium mob production, server-asset conversion  
**Extends:** `ENDERLOOM_CONCEPT_ART_TO_NATIVE_MOD_SPEC.md`, `ENDERLOOM_UNIVERSAL_BIOME_MODEL_VARIATOR_SPEC.md`

## 1. Goal

Enderloom must make highly detailed Bedrock/server-model/CPM/Figura-class visual fidelity a normal **native Java mod** capability, not something reserved for Bedrock Add-Ons or server-side model plugins.

The target experience is:

> **Blockbench / concept / Bedrock / CPM / server-model source -> one editable high-fidelity rig -> native Java renderer + animation controller + efficient secondary motion -> real Minecraft proof.**

Bloom & Boom is the first flagship fixture: biome variants may carry layered flowers, vines, leaves, hanging growths, hair-like fronds, horn decorations, crystals, fungi, petals, cloth-like pieces and other secondary parts that move naturally with the creature rather than being rigid decorations.

This system is general and must also work for bosses, animals, NPCs, player/avatar models, armor, held items, furniture, animated props and other compatible content.

## 2. Compatibility and inspiration lanes

Enderloom should study and interoperate with the strongest established ecosystems without locking the project to any single runtime:

- **Customizable Player Models (CPM)** — import/export/compatibility lane for detailed player/avatar models and animation semantics.
  - https://github.com/tom5454/CustomPlayerModels
- **Figura** — reference/compatibility lane for rich Blockbench avatars, scripting-driven animation and secondary-motion ideas.
  - https://github.com/FiguraMC/Figura
- **GeckoLib** — first-class animated Java entity renderer option with Molang-style expressions, controllers and keyframe events.
  - https://github.com/bernie-g/geckolib
- **AzureLib** — alternate animated renderer/runtime lane where it is a better target for the selected version/mod.
  - https://github.com/AzureDoom/AzureLib
- **Player Animator** — player-animation interoperability lane.
  - https://github.com/KosmX/minecraftPlayerAnimator
- **Blockbench** — canonical editable model/texture/animation authoring interchange.
  - https://github.com/JannisX11/blockbench
- **Model Engine / MythicMobs / ItemsAdder-class server models** — semantic and visual benchmark for bones, hitboxes, seats, state animation, scriptable keyframes and complex resource-pack models. Reuse only where licensing/authorization permits; otherwise implement native Java equivalents from documented behavior and user-owned source assets.
- **Minecraft Bedrock geometry + animation controllers + Molang** — semantic compatibility target for deep bone hierarchies, stateful animation controllers, locators, particles/sounds and data-driven animation.

No closed-source or restricted plugin implementation may be copied without authorization. Enderloom can translate **user-owned assets/config semantics** into native Java behavior.

## 3. Native Java high-fidelity renderer

Add a renderer lane that is not limited to vanilla `ModelPart` cuboids.

The canonical high-fidelity intermediate representation must preserve:

- arbitrary-depth bone hierarchy;
- pivots and bind transforms;
- cubes and cuboid faces;
- thin planes/cards for leaves, fins, petals, cloth and hair;
- optional low-poly triangle/quad mesh surfaces where the selected runtime supports them;
- per-face UVs, rotated/flipped UVs and texture pages;
- layered materials;
- emissive layers;
- translucent/cutout layers;
- normal/specular/PBR metadata when the active shader/runtime supports it;
- locators/socket points;
- hitbox/seat/attachment metadata;
- visibility groups;
- alternate geometry states;
- animation clips and controller/state metadata;
- sound/particle/custom keyframe events.

The Java runtime must choose the least-lossy backend per target:

1. native `ModelPart` / baked model;
2. GeckoLib;
3. AzureLib;
4. CPM/player route;
5. Figura/avatar interoperability route;
6. Enderloom High-Fidelity Skeletal Renderer;
7. resource-pack/server-model compatibility output;
8. CEM/EMF/ETF compatibility output where representable.

Renderer choice is evidence-driven and version-specific, not hardcoded globally.

## 4. Bedrock parity translation

Enderloom should be able to ingest authorized Bedrock model content and preserve useful semantics into Java:

- `.geo.json` bone hierarchy;
- animations;
- animation controllers;
- Molang expressions/queries;
- render-controller intent;
- locators;
- particle/sound animation events;
- material/texture sets;
- attachable/item/armor model intent;
- query/state mappings.

The Java runtime should expose a **Bedrock-like animation expression layer** over safe Java-side query values. When GeckoLib/AzureLib Molang support is sufficient, map into it; otherwise evaluate through Enderloom's typed expression IR.

Do not translate by flattening every state into baked keyframes if a dynamic expression can be preserved accurately.

## 5. Secondary Motion / “living detail” physics

Add a deterministic visual-only **Secondary Motion Graph** for parts such as:

- vines;
- leaves and flower stems;
- long petals;
- hair/fur tufts;
- tails;
- ears;
- antennae;
- tendrils;
- hanging crystals/charms;
- cloth strips;
- capes/scarves;
- chains;
- feathers;
- fins;
- mushroom/fungal stalks;
- Bloom & Boom horn growths.

### 5.1 Simulation model

Support chains and constrained groups using inexpensive spring-damper / Verlet / position-based dynamics primitives:

- angular spring;
- positional spring;
- length constraint;
- cone/hinge angular constraint;
- damping;
- gravity;
- entity acceleration/inertia;
- wind;
- water buoyancy/drag;
- optional collision capsules/spheres;
- root-motion inheritance;
- per-part stiffness/mass/drag limits.

Secondary motion is a **render/visual system**, not gameplay authority. The server sends normal entity state; clients derive most cosmetic motion locally from that state. Do not network every physics bone.

### 5.2 Artist controls

Blockbench/Studio should expose:

- mark bone/chain as secondary motion;
- preset: vine, hair, leaf, tail, cloth, antenna, heavy charm, crystal chain;
- stiffness;
- damping;
- gravity;
- wind response;
- inertia;
- collision radius;
- angle limits;
- follow lag;
- simulation rate;
- sleep threshold;
- LOD policy;
- preview wind/entity-motion controls.

Presets become editable data, not baked code.

### 5.3 Determinism and replay

Record simulation parameters and variant seed. Native QA fixtures must be able to replay a deterministic motion path for screenshot/video comparison.

## 6. Performance contract — detail without a visible performance tax

“Zero performance cost” is treated as a **user-visible performance invariant**, not a false claim that computation is literally free.

Enderloom must target **no perceptible FPS/frame-time/TPS regression at the configured normal crowd density and view distance** relative to an equivalent ordinary animated mob scene. If a candidate misses the budget, optimize the runtime architecture before reducing approved near-field detail.

Required techniques:

- one logical entity, not one server entity/armor stand per visual bone;
- client-only cosmetic secondary motion where possible;
- pose cache and dirty-bone updates;
- skip evaluation for unchanged/offscreen/sleeping chains;
- frustum culling and correct tight culling bounds;
- animation/physics LOD based on projected screen size and distance;
- subpixel-safe geometry LOD only when visually indistinguishable;
- reduced physics update frequency for distant entities with render interpolation;
- frozen/sleeping secondary motion when stable;
- shared immutable geometry/material/animation data across instances;
- texture atlasing;
- batching/render-layer minimization;
- avoid per-frame object allocation;
- precompiled expression/controller graphs;
- active-animation-only evaluation;
- optional GPU matrix/skinning or compute path when the chosen renderer/backend proves it is faster and compatible;
- bounded collision checks against simplified proxy shapes;
- async/off-thread preprocessing only for work that is safe outside the render/game thread;
- no blocking disk/network work on render/game ticks.

### 6.1 LOD quality rule

LOD may remove work only when the removed detail is below the target visual observability threshold at that camera distance. It must not become “faster by visibly making the model worse.”

Near-field approved reference views always use the full-fidelity model and required secondary motion.

### 6.2 Stress proof

Every renderer/backend requires a benchmark fixture with:

- 1 entity;
- normal encounter group;
- stress crowd;
- idle;
- locomotion;
- attack/state transitions;
- full secondary motion;
- offscreen culling;
- mixed biome variants.

Measure CPU game-thread time, CPU render-thread time, GPU frame time when available, allocations/GC, draw calls, rendered vertices, active bones, active physics chains and memory.

A backend is promoted only when quality and performance both pass.

## 7. High-detail variant generation

The Variant Foundry may alter high-fidelity secondary structures while preserving the source SubjectDNA.

Examples for Bloom & Boom:

- swamp -> hanging moss/vines with soft inertia;
- jungle -> broad leaves, flower tassels and swinging vines;
- frozen peaks -> icicle/crystal chains with heavier, stiffer motion;
- warm ocean -> coral fins/fronds with water drag;
- warped forest -> fungal tendrils with slow elastic motion;
- soul sand valley -> spectral strips/flames driven by procedural curves rather than rigid geometry;
- Aether -> light petal/feather growths with buoyant movement.

Variant plans must specify both:
- **appearance mutation**, and
- **motion phenotype**.

Two biome variants should not share identical physics parameters when their material language clearly implies different motion.

## 8. Player/avatar lane

For player models, Enderloom should support a CPM/Figura-class workflow:

- import/edit/export custom player model assets where licensing/format permits;
- custom body proportions and extra bones;
- armor/equipment anchors;
- gestures/emotes;
- first-person compatibility;
- third-person compatibility;
- Elytra/cape/armor state integration;
- held-item transforms;
- player animation interoperability;
- secondary hair/tail/ear/clothing physics;
- multiplayer-safe model identity and graceful fallback.

This lane must remain optional for mods that do not need custom player avatars.

## 9. Server-model -> native Java upgrade

When importing authorized Model Engine / ItemsAdder / MythicMobs / Nexo/Oraxen-like content, Enderloom should prefer translating to a native Java representation rather than preserving expensive server-display hacks when a client mod is allowed.

Preserve independently:

- visual geometry;
- bone hierarchy;
- animation states;
- animation blend/override/loop semantics;
- scriptable keyframe events;
- seats/mount points;
- hitboxes;
- attachment/equipment points;
- sounds/particles;
- gameplay triggers;
- persistence/state.

A visually correct import that loses gameplay or animation semantics is incomplete.

## 10. Typed architecture

Add or extend typed objects:

- `HighFidelityModel`
- `RenderBackendProfile`
- `ModelPrimitive`
- `ModelMaterialLayer`
- `ModelLocator`
- `BonePhysicsProfile`
- `SecondaryMotionGraph`
- `SecondaryMotionNode`
- `SecondaryMotionConstraint`
- `MotionPhenotype`
- `AnimationExpression`
- `AnimationControllerGraph`
- `AnimationEventMarker`
- `RenderLODProfile`
- `PhysicsLODProfile`
- `ModelPerformanceBudget`
- `ModelPerformanceResult`
- `RuntimeModelCapabilityReport`

These attach to the existing canonical Project / Artifact / Evidence / Concept / Variant / Runtime QA graph. No new shadow database.

## 11. Studio UX

Add to the existing Studio/Variant Foundry:

- **Model Detail** inspector;
- **Secondary Motion** graph/inspector;
- physics chain gizmos;
- constraint cones/limits;
- wind/velocity preview;
- material/layer inspector;
- render backend selector with compatibility explanation;
- LOD preview scrubber;
- performance budget overlay;
- active-bone/physics heatmap;
- one-click “Make this growth feel alive” with editable generated settings;
- one-click “Optimize without changing appearance”;
- one-click “Convert Bedrock/server model to native Java”;
- side-by-side deterministic Blockbench/Studio vs actual Minecraft capture.

## 12. Wiki / documentation requirements

Every generated model/entity wiki page should be able to show:

- interactive 3D model viewer;
- front/side/back/turntable;
- biome variants gallery;
- active renderer/backend;
- rig hierarchy;
- animation list and state graph;
- secondary-motion chains and presets;
- material/emissive layers;
- hitboxes/seats/locators;
- performance tier / benchmark summary;
- compatibility targets: Bedrock, CPM, Figura, GeckoLib, AzureLib, EMF/ETF/CEM, server-model import;
- provenance and source model links;
- exact Minecraft/mod version;
- runtime screenshots/video evidence.

For Bloom & Boom, the wiki should have a **Biome Variant Atlas** where selecting a biome shows the model, palette, motifs, motion phenotype, spawn rules and runtime proof.

## 13. CLI / automation

Target operations:

```text
enderloom model inspect <asset>
enderloom model convert <asset> --to native-java
enderloom model convert <asset> --to geckolib
enderloom model convert <asset> --to azurelib
enderloom model convert <asset> --to cpm
enderloom model secondary-motion auto <asset>
enderloom model secondary-motion tune <asset> --preset vine
enderloom model optimize <asset> --preserve-appearance
enderloom model benchmark <asset> --crowd 1,16,64
enderloom model verify <asset> --native
enderloom variant family <asset> --all-biomes --motion-phenotype auto
```

GUI, CLI, MCP and AI operator call the same canonical operation registry.

## 14. Challenger/integration policy

Before substantial invention, re-check current challengers and integrate materially superior compatible ideas.

Current required comparison set:

- Customizable Player Models;
- Figura;
- GeckoLib;
- AzureLib;
- Player Animator;
- Blockbench;
- Model Engine 4 documented behavior;
- ItemsAdder entity documented behavior;
- Bedrock entity geometry/animation/controller/Molang behavior;
- current efficient Java rendering/animation approaches.

A challenger is not promoted merely because it is newer. Compare actual fidelity, editability, compatibility and measured runtime cost.

## 15. Acceptance fixtures

### HF-01 Bloom & Boom vine physics
A flower/vine-heavy Bloom & Boom variant must:
- preserve approved base identity;
- render full detail in native Java;
- show convincing vine/flower secondary motion while idle, walking, turning and attacking;
- remain grounded and correctly culled;
- preserve explosion/charged states;
- pass configured performance budget.

### HF-02 Bedrock parity
Import an authorized Bedrock creature with:
- nested bones;
- animation controller;
- Molang-driven transform;
- locator;
- particle/sound event;
and prove equivalent Java runtime behavior.

### HF-03 Server-model parity
Convert an authorized server-model creature into native Java, preserving:
- visual geometry;
- animation states;
- hitbox/seat metadata;
- event timing;
- gameplay hooks.

### HF-04 Player/avatar
Load a CPM/Figura-class player/avatar fixture with:
- extra bones;
- custom animations;
- held-item/armor state;
- secondary hair/tail physics;
- first/third-person QA.

### HF-05 Crowd performance
Run the same high-detail model at representative crowd sizes and prove:
- no task-related TPS regression;
- no unacceptable frame-time regression;
- no per-bone server entity explosion;
- culling/LOD/sleep paths activate as designed;
- near-field fidelity remains unchanged.

## 16. Non-negotiable invariants

- Highly detailed Java models are a first-class capability, not a special-case hack.
- Approved model detail is never silently flattened to vanilla cuboids just to make conversion easy.
- Physics/secondary motion must not become server-authoritative per-bone spam.
- No one-armor-stand-per-bone architecture for native mod runtime.
- Performance and detail are simultaneous acceptance requirements.
- No “optimization” that visibly reduces the approved near-field model.
- Preserve editable source and provenance.
- Preserve animation/keyframe event semantics.
- Preserve gameplay separately from visuals.
- Runtime proof beats editor preview.
- Existing concept/variant systems are extended, not duplicated.


## 17. Fresh 2026 challenger sweep and promoted architecture candidates

The detailed 2026-09-27 sweep is canonicalized in:

- `docs/ENDERLOOM_VARIANT_MODEL_RUNTIME_CHALLENGER_SCAN_2026-09-27.md`

The runtime/authoring plan must now explicitly challenge itself against:

- **AniGen** for direct concept image -> animate-ready mesh/skeleton/skinning;
- **SkinTokens / TokenRig** as the current successor challenger to UniRig for skeleton + skin weights, with **RigAnything** retained as an independent rig oracle;
- **TRELLIS.2** and **TripoSG** for high-fidelity image-to-3D shape/material hypotheses;
- **Hunyuan3D-Part** and **PartCrafter** for semantic part decomposition/generation;
- **MeshAnythingV2** plus deterministic remeshers for artist-like low-face topology;
- **glTF to Minecraft** as a first-class GLB/glTF -> Blockbench/Minecraft conversion challenger;
- **BetterModel** and **blockbench-import-library** for Java/server model semantics, Molang, meshes, IK, locators and efficient packet/display behavior;
- **Flywheel-style GPU instancing**, **meshoptimizer**, **xatlas** and current culling stacks for performance;
- **VRM SpringBone** plus Enderloom material/environment extensions as the baseline secondary-motion semantics.

### 17.1 New hard requirements from the sweep

- **glTF/GLB becomes a first-class typed interchange format.** Preserve nodes/bones, skin weights, animations, materials/PBR attributes, texture provenance and units before Minecraft-specific reduction.
- **IK becomes part of the animation IR.** Preserve IK targets/chains/constraints when a backend supports them; otherwise bake with explicit loss evidence.
- **Part segmentation is an evidence source, not truth.** Generated semantic parts must reconcile against SubjectDNA, source landmarks and editable Blockbench hierarchy.
- **Mesh-assisted output gets an approximation ledger.** If the target backend requires cuboids/planes, report exactly which mesh regions were approximated and how much silhouette/texture fidelity changed.
- **Secondary motion uses portable spring-bone semantics.** Support rest pose, stiffness, drag/damping, gravity, inertia, angle limits and sphere/capsule collision, then extend with Bloom & Boom wind/water/material phenotypes.
- **Offline preprocessing is preferred over per-frame waste.** UV packing, atlas generation, mesh optimization/LOD candidates, expression compilation and immutable pose/controller data are built/cached ahead of runtime when safe.
- **License/model-weight checks are machine-readable gates.** A source-code license does not automatically cover bundled third-party code or model weights.

### 17.2 Blockbench parity floor

Enderloom Studio should interoperate with or equal the useful current Blockbench plugin workflows surfaced by the sweep: Animated Java, GeckoLib/AzureLib exporters, Figura format, CEM/EMF animation, PBR Tools, mesh tools, Bone View, Root Motion Extractor, Bakery, animation easing/platform helpers, concealed-face optimization, UV-bleed repair, reference-model loading, VoxelShape generation and glTF-to-Minecraft conversion.

This is a **reuse-before-rebuild** requirement: prefer a lawful adapter/import/export or extracted proven algorithm over inventing a weaker duplicate.


### 17.3 Mature Java differential fixtures

The second sweep adds mandatory comparison/fixture coverage for:

- **Cobblemon's Bedrock-style model/animation runtime on Java** as a mature real-world geometry/pose/animation-state reference;
- **Blueprint Endimator** as a lighter native animation lane;
- **JsonEM** for data-driven model introspection/dump and resource-defined model fixtures;
- **CustomPlayerModel** for an independent Java scripting/particle/physics model runtime reference;
- **BBS/BBS Engine** for Studio timeline/camera/model-authoring ideas;
- **Figura's current split core/client/Molang architecture** as a portability reference.

Use source only under the exact project's license. Cobblemon code and Cobblemon art are different rights surfaces; the model assets must not be treated as generally reusable just because the runtime source is open.


### 17.4 Motion-generation, server-export, material and QA challengers

The third sweep adds the following required comparison lanes:

- **Puppeteer** and **Make-It-Animatable v2** for alternative skeleton/skin/pose generation;
- **Articulate Anything** for articulated props/mechanical assemblies and joint-axis inference;
- **AnyTop** for topology-agnostic motion generation/inpainting after a valid rig exists;
- **Polymer** for optional server-side/virtual-entity/resource-pack export, especially current 26.3 targets;
- **Polytone** for biome atmosphere/colormap/effect phenotype compatibility;
- **Fusion** for richer block/item texture/model resource-pack outputs;
- **Iris/LabPBR** for capability-negotiated PBR materials with mandatory vanilla fallback;
- **vanilla-reference-harness-style deterministic native captures** for model/item/entity visual regression.

New invariants:

- Generated motion is never allowed to redefine gameplay authority. It maps onto named animation/state contracts and must preserve event/hitbox timing.
- `BiomeDNA` may include atmosphere/material fields in addition to geometry motifs: colormap, fog/sky/water hints, particle/sound phenotype and optional PBR material intent.
- `HighFidelityModel` preserves rich material channels even when the active backend cannot display all of them; exporters choose the richest compatible path and emit an explicit fallback.
- Model backend acceptance requires deterministic locked-view/state reference captures suitable for automatic image diffs in addition to live runtime inspection.
- Server-side virtual/display backends are export compatibility routes, not automatic replacements for the native client renderer.
