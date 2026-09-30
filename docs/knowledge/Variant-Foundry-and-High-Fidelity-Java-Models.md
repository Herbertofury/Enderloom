# Variant Foundry & High-Fidelity Java Models

Enderloom's **Variant Foundry** turns one approved Minecraft asset or concept into a coherent family of biome- and dimension-aware variants, while the **High-Fidelity Java Model Runtime** preserves the kind of detail and motion commonly associated with Bedrock entities, CPM/Figura avatars, or premium server-model systems.

This page is intended for Enderloom's built-in Wiki/Documentation system and GitHub-wiki/docs-compatible export.

## What it does

Use one source — concept art, Blockbench project, existing entity model, item, armor, block, plant, weapon, Bedrock model, or authorized server-model asset — and generate editable Minecraft-native variants for:

- every vanilla biome supported by the target version;
- all biomes in a selected dimension;
- all biomes discovered in an installed modpack;
- custom/private datapack or mod biomes Enderloom has never seen before;
- curated popular dimensions such as Aether, Twilight Forest, Bumblezone, Deeper and Darker/Otherside, Blue Skies, Undergarden, Eternal Starlight, Tropicraft, Dimensional Doors, Ad Astra worlds and Voidscape;
- official upcoming/experimental content when trustworthy registry/assets exist.

Unknown biome does **not** mean unsupported. Enderloom discovers its registry, blocks, flora, colors, ambient effects and other evidence, then builds a new `BiomeDNA` profile.

## Bloom & Boom example

Bloom & Boom is the flagship fixture.

The same Creeper family can keep its recognizable face, body, horns and animation identity while receiving biome-specific:

- flower and leaf families;
- vines/tendrils;
- moss/fungi;
- snow/ice/crystal growths;
- shells/coral/kelp;
- stone/terracotta/mineral plating;
- Nether/End/warped materials;
- emissive accents;
- particles;
- secondary-motion behavior.

A swamp Creeper's vines can hang and sway softly. A Frozen Peaks variant can carry stiffer, heavier ice/crystal chains. A Warm Ocean form can use flowing coral fronds with water drag. A Warped Forest variant can have elastic fungal tendrils.

## High-detail Java model runtime

Enderloom is not limited to vanilla rigid cuboids.

Supported high-fidelity intent includes:

- deep bone hierarchies;
- cubes plus planes/cards for leaves, hair, vines, cloth, petals and fins;
- compatible low-poly mesh surfaces;
- per-face UVs;
- emissive/translucent/cutout material layers;
- locators and sockets;
- hitboxes and seats;
- alternate geometry states;
- animation clips/controllers;
- sound, particle and custom animation events;
- first/third-person player model support where applicable.

Enderloom chooses the least-lossy target backend for the actual Minecraft version:

- native Java model/baked model;
- GeckoLib;
- AzureLib;
- CPM/player route;
- Figura/avatar interoperability;
- Enderloom High-Fidelity Skeletal Renderer;
- EMF/ETF/CEM compatibility where representable;
- server/resource-pack export where requested.

## Living detail / secondary motion

Detailed parts can use Enderloom's **Secondary Motion Graph**.

Typical uses:

- vines;
- leaves and flower stems;
- hair/fur tufts;
- tails and ears;
- antennae;
- hanging crystals/charms;
- cloth strips/capes/scarves;
- feathers/fins;
- fungal tendrils.

Physics presets include vine, hair, leaf, tail, cloth, antenna, heavy charm and crystal chain.

Artists can tune:

- stiffness;
- damping;
- gravity;
- wind response;
- movement inertia;
- collision proxy radius;
- angle limits;
- follow lag;
- simulation rate;
- LOD behavior.

The motion is normally cosmetic and client-side. Enderloom does **not** network every bone or create a server entity/armor stand for every visual part.

## Performance promise

The goal is **full visual detail without a perceptible performance tax**, not the false claim that computation is literally free.

Enderloom uses:

- shared geometry/material/animation data;
- pose caching;
- dirty-bone updates;
- sleeping motion chains;
- frustum culling;
- projected-size-aware animation/physics LOD;
- render interpolation;
- texture atlasing;
- render-layer minimization;
- precompiled expression/controller graphs;
- safe off-thread preprocessing;
- optional GPU acceleration when it measurably helps.

Near-field approved reference views stay full fidelity. LOD is allowed only where the removed work is visually indistinguishable at that distance.

## Bedrock-like behavior on Java

Authorized Bedrock assets can be translated into Java while preserving:

- `.geo.json` hierarchy;
- animations;
- animation controllers;
- Molang expressions;
- locators;
- particle/sound events;
- material/texture intent.

Dynamic expressions should remain dynamic when possible rather than being flattened into huge baked keyframe files.

## CPM / Figura-class player models

For players/avatars, Enderloom can target or interoperate with CPM/Figura-class capabilities:

- custom body proportions;
- extra bones;
- gestures/emotes;
- custom armor/equipment anchors;
- held-item transforms;
- first/third-person behavior;
- hair/tail/ear/clothing secondary motion;
- multiplayer-safe identity/fallbacks.

Relevant open projects:

- [Customizable Player Models](https://github.com/tom5454/CustomPlayerModels)
- [Figura](https://github.com/FiguraMC/Figura)
- [GeckoLib](https://github.com/bernie-g/geckolib)
- [AzureLib](https://github.com/AzureDoom/AzureLib)
- [Player Animator](https://github.com/KosmX/minecraftPlayerAnimator)
- [Blockbench](https://github.com/JannisX11/blockbench)

Enderloom also benchmarks the documented capabilities of Model Engine, MythicMobs and ItemsAdder-class systems for model states, bone behavior, seats, hitboxes, scriptable keyframes and animation events, while respecting their licenses and using native Java equivalents when source reuse is not authorized.

## Variant controls

Useful Studio actions include:

- Generate one;
- Generate N candidates;
- Generate every biome;
- Generate every biome in this dimension;
- Generate every biome in this installed modpack;
- Generate only missing variants;
- Regenerate this region only;
- Keep geometry, reroll texture;
- Keep face/horns, reroll growths;
- Make more like this;
- Make this growth feel alive;
- Optimize without changing appearance;
- Convert Bedrock/server model to native Java.

Identity-critical regions can be locked so rerolls never destroy the approved face, silhouette, horns, rig or UV regions.

## Wiki model pages

A generated entity/model page should show:

- interactive 3D model;
- turntable plus front/side/back views;
- biome variant gallery;
- palette/material/motif breakdown;
- rig hierarchy;
- animation state graph;
- motion-physics chains;
- hitboxes/seats/locators;
- renderer/backend;
- compatibility targets;
- performance benchmark summary;
- runtime screenshots/video;
- provenance and source lineage;
- exact Minecraft/mod version.

For Bloom & Boom this becomes a **Biome Variant Atlas**: pick a biome and see the variant model, growths, motion phenotype, spawn behavior and native runtime evidence.

## Technical specifications

Canonical implementation contracts:

- [Universal Biome & Model Variator](../ENDERLOOM_UNIVERSAL_BIOME_MODEL_VARIATOR_SPEC.md)
- [High-Fidelity Java Model Runtime & Secondary Motion](../ENDERLOOM_HIGH_FIDELITY_JAVA_MODEL_RUNTIME_SPEC.md)
- [Concept Art -> Native Minecraft Mod](../ENDERLOOM_CONCEPT_ART_TO_NATIVE_MOD_SPEC.md)
- [Unified Studio / Wiki / CLI / Evidence Brain](../ENDERLOOM_UNIFIED_STUDIO_CONFIG_HOTKEY_CLI_BRAIN_SPEC.md)


## 2026 ecosystem sweep — what Enderloom will reuse or challenge

A second fresh sweep found several projects that materially strengthen the Variant Foundry instead of forcing us to invent every layer ourselves.

### Concept -> 3D -> rig

- **AniGen** can produce a mesh, skeleton and skinning together from one image.
- **SkinTokens / TokenRig** is the current successor to UniRig for unified skeleton + skin-weight generation; **RigAnything** stays as an independent rigging challenger.
- **TRELLIS.2** and **TripoSG** are strong high-fidelity image-to-3D candidates.
- **Hunyuan3D-Part** and **PartCrafter** provide part-aware decomposition/generation useful for separating horns, flowers, plates, limbs and props before Minecraftization.
- **MeshAnythingV2** is a candidate for turning dense generated meshes into cleaner artist-like low-face meshes.

### Minecraft authoring/runtime

- **glTF to Minecraft** is now a major conversion candidate because it already converts GLB/glTF into Minecraft-friendly cubes, carries animations, atlases textures and can output GeckoLib/Bedrock/CPM targets.
- **BetterModel** is a major runtime/semantics benchmark: Blockbench cubes + meshes + locators/nulls, Molang, IK, player models, custom armor and efficient synchronization.
- **blockbench-import-library** is valuable for `.bbmodel`/`.ajmodel` loading, Molang/effect keyframes, variants, locators, virtual Item Displays, async transforms, vanilla hitboxes/riding/leashes and culling.
- **Animated Java** remains a rich Java animation/export compatibility target for variants, locators, easing/tweening and Molang.

### Physics and performance

- **VRM SpringBone** gives Enderloom a documented baseline for hair/tail/clothing/vine spring chains and capsule/sphere collisions instead of inventing every rule from scratch.
- **jiggle-physics** adds a useful weight-painted soft-region model for optional mesh deformation.
- **Flywheel** is a GPU-instancing architecture challenger for crowds/repeated detail.
- **meshoptimizer** and **xatlas** are candidates for offline mesh/LOD/UV optimization.
- **ImmediatelyFast**, **EntityCulling** and **MoreCulling** become compatibility/performance fixtures.

### Authoring QoL from the Blockbench ecosystem

The official Blockbench plugin catalog also surfaced workflows Enderloom Studio should interoperate with or beat: GeckoLib Models & Animations, AzureLib Animator, Figura format, CEM + EMF animation tools, PBR Tools, mesh tools, Bone View, Root Motion Extractor, Bakery, Easing Peasy, reference models, concealed-face optimization, UV-bleed repair, VoxelShape generators and glTF-to-Minecraft.

The full integration/rights/benchmark matrix lives in [the challenger scan](../ENDERLOOM_VARIANT_MODEL_RUNTIME_CHALLENGER_SCAN_2026-09-27.md).

The rule remains simple: **the best proven route wins each stage.** Newer projects are challengers, not automatic replacements; Enderloom compares fidelity, editability, Minecraft compatibility and measured performance on the same Bloom & Boom fixtures.


### More Java-native references from the second pass

The sweep also found useful mature Java-side references beyond the headline AI/model generators:

- **Cobblemon** is especially valuable because it already runs Bedrock-style entity models and flexible animation semantics on Java at real mod scale.
- **Blueprint / Endimator** gives us a lighter native animation comparison lane.
- **JsonEM** is useful for dumping/introspecting registered models and data-driven JSON model fixtures.
- **CustomPlayerModel** provides another open Java model runtime with scripting, particles and physics, including non-player entities.
- **BBS / BBS Engine** contributes strong timeline, camera and model-preview/editor ideas for Enderloom Studio.
- Figura's newer **figura-core / figura-client / figura-molang** split is a useful architecture reference for keeping model/avatar logic portable while loader/version integration stays thin.

These are now tracked in the full challenger scan with rights boundaries; Cobblemon's MPL runtime source and separately non-commercial art repository are deliberately treated as different things.


### Third sweep: motion, biome atmosphere, materials and QA

The newest pass added several pieces that make this feel more like the “it just works” model workshop we want:

- **Puppeteer** can be challenged for automatic rigging **and video-guided motion**.
- **Make-It-Animatable v2** is another fast mesh -> joints/weights/pose route.
- **Articulate Anything** is useful for mechanical/articulated props and creatures where Enderloom needs to infer links, joint axes and movement from text/image/video.
- **AnyTop** is a motion-synthesis/retargeting candidate after the rig is already valid.
- **Polymer** gives us an optional server-side/virtual-entity/resource-pack export lane, including current 26.3 work, without making that packet/display architecture the native client runtime.
- **Polytone** means biome variants can also carry atmosphere: colormaps, biome effects, sounds, particles and other resource-pack phenotype.
- **Fusion** adds a richer block/item texture-model compatibility lane.
- **Iris + LabPBR** gives us a real PBR target for normal/height, smoothness/metalness and emissive data while Enderloom keeps a correct vanilla fallback.
- **vanilla-reference-harness** gives us an excellent deterministic QA pattern: render the exact entity/item in the real client at locked views/states and diff the output automatically.

That means a Bloom & Boom biome variant is no longer just “different model + texture.” Its family record can include **geometry phenotype + motion phenotype + atmosphere phenotype + material phenotype + deterministic native visual proof**.

The full candidate/rights/benchmark details remain in [the challenger scan](../ENDERLOOM_VARIANT_MODEL_RUNTIME_CHALLENGER_SCAN_2026-09-27.md).


### Fourth sweep: turn Blockbench into a real Enderloom backend

This pass found something especially useful for the actual “it just works” workflow: **Blockbench itself can become an automatable live + headless backend**.

Two current projects are strong references:

- **Blockbench MCP by Jason Gardner** — live Blockbench control plus a separate headless mode that can edit, validate, convert and render `.bbmodel` files without opening the editor.
- **Blockbench MCP by sosadly** — broad model/texture/rig/animation operations plus quality gates such as silhouette/reference matching, rig checks, measured animation analysis, orientation checks and multi-view screenshots.

Enderloom should take the best of both behind one internal **Blockbench Automation** adapter. That means:

- “Generate every biome” can run hundreds of variants headlessly;
- only interesting/failing variants need to open in the live editor;
- the same model can be measured, rendered, compared against concept art, rig-checked, animation-checked and exported without manual repetition;
- artist review remains available whenever the user wants it;
- all edits still land in the same canonical Enderloom model/variant history.

The IK layer is also upgraded in the contract: preserve two-bone/FABRIK/spline/aim-style constraints, pole guidance and IK/FK blending as editable rig data, baking only for backends that cannot represent live IK.

For rare assets that need real rope/cloth/soft-body or physical collision, Enderloom can challenge an optional **Jolt/Velthoric** backend. Bloom & Boom vines, petals, hair and leaves still use the much cheaper Secondary Motion Graph by default.


### Fifth sweep: close the boring-but-essential gaps

The latest capability pass adds the pieces that usually get forgotten between a beautiful AI mesh and an actually shippable Minecraft mob:

- a **Minecraft Texture Compiler** so 2K/4K generated materials become intentional pixel art instead of blurry downscales;
- a content-addressed **ModelBundle compiler** so variants share geometry/material/animation data and only store meaningful deltas;
- a **VRAM-aware provider job scheduler** with cancellation, local/remote workers and resume-from-stage behavior;
- deterministic **glTF validation/normalization** before Minecraftization;
- richer **TerraBlender/Biolith/Lithostitched/Terra** biome discovery evidence;
- explicit modern render-stack compatibility gates.

Useful new challengers include MyMeshy, OpenX Clay, AssetForge, MVPaint, SyncMVD, Paint3D, TEXGen, StableMaterials, glTF Transform and glTF Validator.

The complete required-capability inventory is now machine-checkable through the [Variant Foundry Capability Closure](Variant-Foundry-Capability-Closure.md) page and its canonical JSON matrix.
