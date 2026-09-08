# Enderloom — Adaptive Minecraft Ecosystem Compatibility Contract Catalog

**Status:** Mandatory living capability catalog  
**Updated:** 2026-09-07  
**Repository:** `Herbertofury/Enderloom`  
**Parent:** `docs/ENDERLOOM_MINECRAFT_WORKFLOW_PARITY_MASTER_SPEC.md`

This catalog defines high-value compatibility contracts Enderloom should select **based on the semantics of the mod being created/converted/ported**, not by installing every popular mod indiscriminately.

The catalog is intentionally living. Exact APIs, dependency coordinates and supported Minecraft/loader versions must be resolved from current project sources before implementation/testing.

---

# 1. Contract Rules

Every compatibility contract declares:

- ecosystem ID;
- supported target versions/loaders;
- semantic trigger(s);
- required/optional dependencies;
- source/API/docs identity;
- integration mechanism;
- scenario fixtures;
- positive cases;
- negative cases;
- persistence cases;
- multiplayer cases;
- performance/visual gates when relevant;
- evidence required to call the integration passed.

A contract result is one of:

- `required_passed`;
- `required_failed`;
- `optional_passed`;
- `optional_failed`;
- `not_applicable`;
- `not_available_for_target`;
- `blocked_by_rights_or_missing_source`.

Do not call “game launched with both mods” full compatibility.

---

# 2. Inventory / Backpack / Storage Contracts

## 2.1 Sophisticated Backpacks + Sophisticated Core

Semantic trigger:

- backpack;
- portable inventory;
- upgradeable storage;
- storage tool/item;
- pickup/filter/refill/deposit behavior;
- nested inventory interactions.

Test where applicable:

- item can coexist with Sophisticated Backpacks;
- player inventory/backpack interactions;
- shift-click/quick-move;
- insertion/extraction through standard handlers;
- item identity/NBT/components survive moving through backpack;
- stack limits;
- nested-container safeguards;
- pickup magnet/filter interactions when relevant;
- automation behavior;
- death/drop/keep-inventory behavior;
- sorting interactions;
- upgrade/filter compatibility where public APIs/semantics permit;
- recipe-viewer integration;
- multiplayer sync;
- save/reload.

If the converted source itself is a backpack mod, Enderloom should decide between:

1. independent native backpack implementation with compatibility adapters;
2. native content implemented as an extension/addon to the Sophisticated ecosystem when that best preserves semantics and licensing allows it;
3. hybrid bridge where independent gameplay remains canonical but Sophisticated-compatible inventory/equipment APIs are exposed.

Never copy substantial Sophisticated source merely because it is public to inspect. Respect the current project license.

Current source identities:
- https://github.com/P3pp3rF1y/SophisticatedBackpacks
- https://github.com/P3pp3rF1y/SophisticatedCore

## 2.2 Sophisticated Storage

Semantic trigger:

- placeable storage;
- storage upgrades;
- chest/barrel-like custom storage;
- portable <-> placed storage relationship.

Test:

- item transfer;
- standard item handlers;
- automation;
- filter/sort semantics where relevant;
- content identity persistence;
- chunk unload/reload;
- multiplayer interactions.

## 2.3 Generic inventory/container contract

Always apply to custom inventories regardless of optional ecosystem mods:

- standard item handler capability/API for target loader;
- shift-click correctness;
- insertion/extraction sidedness;
- no dupes/item loss;
- close/reopen state;
- death/logout/reconnect;
- chunk unload/reload for block/entity inventories;
- invalid item rejection;
- slot restrictions;
- automation stress.

---

# 3. Wearable / Accessory Contracts

## 3.1 Curios

Primary Forge/NeoForge accessory contract where applicable.

Semantic trigger:

- rings;
- necklaces;
- belts;
- charms;
- backpacks worn in equipment slots;
- spell foci;
- accessory equipment;
- custom wearable slots.

Test:

- slot registration/exposure;
- equip/unequip;
- attribute application/removal;
- tick behavior;
- render behavior;
- death/drop rules;
- save/reload;
- multiplayer synchronization;
- slot conflicts;
- compatibility with native armor/inventory screens;
- optional GUI/keybinding behavior.

Source:
- https://github.com/TheIllusiveC4/Curios

## 3.2 Trinkets / Accessories-family targets

For Fabric/modern loader targets, choose the active ecosystem appropriate to the exact Minecraft/loader version.

Do not hardcode Curios concepts onto a loader where another accessory API is canonical.

Normalize Enderloom’s own semantic accessory model so one source can map to multiple target APIs.

---

# 4. Recipe Viewer / Transfer Contracts

## 4.1 JEI

Semantic trigger:

- recipes;
- machines;
- crafting processes;
- custom ingredients;
- catalysts;
- transfer handlers.

Test:

- recipes indexed;
- custom recipe category renders correctly;
- ingredient subtypes/NBT/components are not conflated;
- catalysts/workstations visible;
- recipe transfer works when supported;
- hidden/disabled content does not appear incorrectly;
- server/client presence rules are correct.

## 4.2 EMI

Test analogous indexing/recipe behavior plus EMI-specific recipe tree/fill integration where supported.

## 4.3 REI

Use on target versions/loaders where REI is the selected ecosystem.

Enderloom should expose one internal recipe-view semantic contract with JEI/EMI/REI adapters rather than three unrelated implementations.

---

# 5. Create Ecosystem Contract

Semantic trigger:

- machinery;
- rotational/kinetic systems;
- processing recipes;
- moving contraptions;
- belts/deployers/mechanical arms;
- stress/speed behavior;
- Create-themed engineering content.

Potential integration layers depend on target version:

- Create public APIs/events;
- Registrate patterns when appropriate;
- Ponder scenes/tutorials;
- Flywheel/render integration where applicable;
- Create recipe types;
- kinetic block entities;
- stress/rotation semantics;
- belts/funnels/deployers;
- fluid/item transport;
- contraption behavior;
- wrench/tool interactions;
- schematics/placement where appropriate.

Test:

- recipe processing;
- automation insertion/extraction;
- rotation direction/speed/stress;
- chunk unload/reload;
- contraption assembly/disassembly if supported;
- rendering with target Create/Flywheel version;
- multiplayer state;
- Ponder scene correctness if supplied;
- no hidden client-only dependency on optional Create modules.

Current 1.20.1 developer guidance is version-specific and uses Create/Ponder/Flywheel/Registrate artifacts; refresh before each implementation:
- https://github.com/Creators-of-Create/wiki
- https://github.com/Creators-of-Create/Ponder

---

# 6. RPG Loot / Affix / Socket Contracts

## 6.1 Apotheosis

Semantic trigger:

- weapons/armor/tools;
- rarity;
- affixes;
- gems/sockets;
- boss loot;
- RPG equipment progression.

Test based on exact target version:

- item receives correct loot category;
- affixes can be generated where semantically valid;
- attributes remain correct;
- sockets/gems work where applicable;
- tool/weapon category is not misclassified;
- custom attribute logic does not recurse/crash;
- loot generation does not produce invalid category errors;
- item serialization survives save/reload;
- optional provider absent lane still works.

Version-specific integration mechanism can differ (e.g. older IMC/category patterns vs newer data-driven approaches). Resolve from current source/API.

## 6.2 Apothic Curios-style bridge

When equipment is both accessory-based and affix-capable, test the combined Curios + Apotheosis path.

Reference project:
- https://www.curseforge.com/minecraft/mc-mods/apothic-curios

---

# 7. Food / Farming / Cooking Contracts

## 7.1 Farmer’s Delight

Semantic trigger:

- food;
- cooking;
- crops;
- knives/cutting;
- cooking pot/skillet-style processing;
- meals/feasts.

Potential compatibility:

- ingredient tags;
- cutting/cooking recipes;
- food effects;
- knives/tools;
- composting;
- Create/Farmer’s Delight processing overlap if installed;
- JEI/EMI recipe display.

Current project remains active on 1.20.1 and 1.21.1 as of this catalog snapshot:
- https://www.curseforge.com/minecraft/mc-mods/farmers-delight

---

# 8. Guidebook / Documentation Contracts

## 8.1 Patchouli

Semantic trigger:

- in-game guidebook;
- lore/quest manual;
- progression documentation;
- multiblock explanations.

Test:

- book opens;
- categories/entries resolve;
- advancement/progression gating;
- recipe links;
- localization;
- images/models where supported;
- optional absence behavior if Patchouli is optional.

Enderloom Premium Wiki remains canonical project knowledge; Patchouli export is an optional in-game representation where useful.

Source:
- https://github.com/VazkiiMods/Patchouli

---

# 9. Tooltip / Information Overlay Contracts

Semantic trigger:

- custom blocks/entities/machines with useful inspection data.

Targets can include:

- Jade;
- WTHIT;
- other target-version overlay APIs.

Test:

- owner/name;
- state/progress;
- inventory/fluid/energy summary when appropriate;
- server-authoritative values;
- no secret/internal data leakage;
- client/server sync.

---

# 10. Scripting / Modpack Logic Contracts

## 10.1 KubeJS

Semantic trigger:

- pack scripting;
- custom events;
- recipes;
- scripted progression/integration.

Enderloom can expose native mod events/types to KubeJS when useful.

Test:

- startup/server/client scripts;
- event hooks;
- recipe mutation;
- custom registry references;
- reload/restart semantics;
- script error reporting.

Native conversion rule:

A Bedrock/server conversion requested as a full mod does **not** become a KubeJS implementation merely because scripting is easier. KubeJS is an integration layer, not a substitute for requested native semantics.

## 10.2 CraftTweaker

Similar contract for target packs that use CraftTweaker.

---

# 11. Animation / Model Runtime Contracts

Semantic trigger:

- animated entities/items/blocks/armor;
- server-model conversion;
- Bedrock animation controllers;
- reference reconstruction.

Targets may include:

- native Minecraft rendering/animation;
- GeckoLib;
- AzureLib;
- direct `.bbmodel` runtimes where target support is proven;
- player-animation APIs;
- EMF/CEM lanes for CEM-origin assets.

Contract tests:

- model load;
- texture/atlas integrity;
- animation state transitions;
- interpolation;
- bind-pose reset/no transform accumulation;
- grounding;
- culling bounds;
- hitbox/model alignment;
- seats/locators;
- state sync;
- native client capture.

---

# 12. Energy / Fluid / Automation Contracts

Semantic trigger:

- powered machines;
- batteries;
- generators;
- fluid tanks;
- item/fluid/energy transport.

Base contract:

- target loader’s canonical energy/fluid/item interfaces;
- sided capability exposure;
- simulation vs execution semantics;
- rate limits;
- save/reload;
- chunk unload;
- multiplayer.

Optional ecosystem contracts when meaningful:

- Create pipes/automation;
- Applied Energistics 2;
- Refined Storage;
- Mekanism;
- Pipez/other transport systems as pack-specific fixtures.

Do not make optional network/storage mods hard dependencies unless required by the source design.

---

# 13. Quest / Progression Contracts

Semantic trigger:

- quests;
- stages;
- unlocks;
- achievements/advancements;
- NPC/story progression.

Targets can include:

- native advancements;
- FTB Quests integration;
- Patchouli knowledge gating;
- pack scripting layers;
- Enderloom’s own Progression/Softlock graph.

Test:

- prerequisite graph;
- impossible objectives;
- rewards;
- repeatability;
- removed/renamed content references;
- multiplayer/team behavior;
- save/reload;
- migration after updates.

---

# 14. Worldgen / Structure / Dimension Contracts

Semantic trigger:

- custom biomes;
- structures;
- ores/features;
- dimensions;
- portals.

Base test:

- registry/data validity;
- new-world generation;
- seed determinism where applicable;
- structure placement;
- locate commands;
- portal travel;
- restart;
- server/client sync;
- existing-world upgrade behavior;
- performance.

Pack-specific compatibility can test popular biome/worldgen stacks only when actually present/targeted.

---

# 15. Client Rendering / Performance Stack Contracts

Semantic trigger:

- custom renderers;
- particles;
- shaders;
- heavy entity/block rendering;
- custom models.

Target-pack-dependent fixtures can include:

- Embeddium;
- Sodium;
- Oculus;
- Iris;
- Create/Flywheel;
- Distant Horizons;
- Entity Culling / ImmediatelyFast-style stacks where relevant.

Test:

- startup;
- resource reload;
- model/texture rendering;
- culling;
- shader path;
- chunk rebuild behavior;
- deterministic frame-time comparison;
- no OpenGL/off-thread violations.

Compatibility must not be “fixed” by globally disabling another mod’s feature unless the user explicitly accepts that tradeoff.

---

# 16. Major Compatibility Meta-Contract

For a premium conversion or major new mod, Enderloom should produce a visible compatibility matrix such as:

| Contract | Applicability | Result | Evidence |
|---|---|---|---|
| Base Forge 1.20.1 | Required | Passed | Server + client + restart |
| Curios | Required | Passed | Equip/save/multiplayer scenarios |
| Sophisticated Backpacks | Required | Passed | Transfer/nested inventory/automation |
| JEI | Required | Passed | Recipe index + transfer |
| EMI | Optional | Passed | Recipe fill |
| Create | Applicable | Passed | Automation + Ponder |
| Apotheosis | Applicable | Passed | Category/affix/socket |
| Patchouli | Optional | Passed | Guidebook export |
| Embeddium/Oculus | Target-pack | Passed | Native render QA |

This matrix is generated from the canonical test/evidence graph and links to exact runs.

---

# 17. Adaptive Selection Examples

## Bedrock “Backpacks 2.0.2”-class conversion

Likely profile:

- inventory/container — required;
- Curios — required if wearable backpack semantics exist;
- Sophisticated Backpacks/Sophisticated Core — required compatibility target when requested;
- JEI — required recipes;
- EMI — optional/target-pack;
- automation/item handler — required;
- Apotheosis — only if equipment/RPG affixes are semantically relevant;
- Create — test automation/container interaction if installed or requested, but do not force Create-specific gameplay into a backpack mod without reason;
- config/hotkeys — required if source exposes settings/controls;
- persistence/multiplayer — required.

## Spellbrook-class server conversion

Likely profile is derived from the actual captured inventory, not assumed ahead of time:

- animated model runtime;
- custom items/blocks/furniture;
- spells/magic;
- NPC/quests;
- custom UI/HUD;
- Curios/accessories if equipment semantics exist;
- recipe viewer;
- Patchouli/Wiki export;
- multiplayer synchronization;
- performance/render stack;
- source-specific plugin semantic adapters.

## Machine mod conversion

Likely profile:

- item/fluid/energy capability;
- JEI/EMI/REI;
- Create if kinetic/processing semantics overlap;
- Jade/WTHIT;
- KubeJS/CraftTweaker;
- AE2/Refined Storage automation if relevant;
- performance/chunk persistence.

---

# 18. Current Version-Specific Research Notes — 2026-09-07

These facts are snapshots, not permanent assumptions:

- Sophisticated Backpacks has active 1.20.1 artifacts and current source; exact integration must honor its current license/API surface.
- Curios provides a developer API and 1.20.x documentation/source.
- Create’s current developer docs explicitly maintain separate target guidance; its Forge 1.20.1 path has specific Create/Ponder/Flywheel/Registrate versions and is no longer the primary feature-development target, so Enderloom must pin exact compatible artifacts rather than use newest versions blindly.
- Apotheosis 1.20.1 compatibility can require explicit loot-category/Curios handling; public compatibility bridges demonstrate these version-specific gaps.
- Patchouli remains a current data-driven guidebook option with a 1.20.1 Forge line.
- Farmer’s Delight remains active on 1.20.1 and 1.21.1.

Refresh all target-version facts before building a release.

---

# 19. Definition of Done

The compatibility system is working when Enderloom can:

1. inspect a new/converted mod and classify its semantics;
2. select relevant ecosystem contracts automatically;
3. resolve exact compatible dependency versions for target MC/loader;
4. implement adapters through public/legitimate APIs and data paths;
5. launch isolated fixtures;
6. execute behavioral scenarios;
7. capture evidence;
8. identify integration-specific failures;
9. route failures into repair/AI loops;
10. rerun only invalidated contracts;
11. report a transparent compatibility matrix;
12. keep optional ecosystem support optional unless source requirements make it mandatory.

**Compatibility is a tested behavior contract, not a mod-list checkbox.**
