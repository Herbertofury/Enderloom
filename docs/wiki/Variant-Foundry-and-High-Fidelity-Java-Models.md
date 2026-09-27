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
