# Enderloom — Minecraft Workflow Parity Master Specification

**Status:** Mandatory product/implementation contract  
**Updated:** 2026-09-07  
**Repository:** `Herbertofury/Enderloom`  
**Branch:** `main`

This document locks a simple product law:

> **If we have been able to use ChatGPT + Minecraft Dev Kit to do a serious Minecraft job, Enderloom must ultimately be able to perform that job itself through its GUI/CLI/MCP/AI operation layer, with equal or stronger verification.**

This is not limited to launching/mod management. It includes lawful asset acquisition, reverse reconstruction from authorized server/client assets, Bedrock -> Java conversion, Java ports/backports, JAR repair, performance optimization, crash/freeze/world repair, model/texture/animation reconstruction, ecosystem compatibility, automated testing, runtime proof and release packaging.

No feature island is allowed to stop at “extract files,” “generate a datapack,” “compile once,” or “looks close.” A requested **fully functioning mod** means a native target mod whose applicable visual, gameplay, persistence, networking, compatibility and performance contracts have been proven in real Minecraft.

---

# 1. Canonical Workflow-Parity Law

Every supported Minecraft job compiles into a normal Enderloom job + acceptance contract and uses the shared canonical graph.

Required properties:

- exact input provenance and hashes;
- target Minecraft version / loader / Java runtime;
- source rights / acquisition path;
- complete content inventory;
- semantic coverage ledger;
- dependency closure;
- ecosystem compatibility profile;
- build/package lineage;
- strongest applicable dedicated-server/native-client/integrated-server proof;
- persistence/restart proof when stateful;
- performance/visual parity when applicable;
- rollback/install transaction;
- evidence-backed final report;
- reusable Evidence Brain observations.

GUI, CLI, MCP and AI call the same operation/task/evidence implementation.

---

# 2. Authorized Minecraft Asset Acquisition

Enderloom must be able to acquire and stage the same lawful inputs we commonly work with manually.

## 2.1 Sources

Support controlled intake from:

- files/folders/archives supplied by the user;
- local launcher instances;
- Modrinth project/version downloads;
- CurseForge project/version downloads through supported provider access;
- GitHub source/releases;
- Maven/loader dependency repositories;
- official Minecraft client/server/version assets required for the selected runtime;
- Bedrock `.mcpack`, `.mcaddon`, behavior-pack and resource-pack sources;
- Java resource packs/datapacks/shader packs;
- mod JARs with or without source;
- worlds/saves/server packs;
- logs/crash reports/JFR/spark/Observable/diagnostic bundles;
- authorized server-delivered client resource packs;
- author-supplied server plugin/model/config/source bundles;
- user-authorized screenshots/GIFs/videos/models/reference media.

## 2.2 Server-session capture

For workflows like **Spellbrook**, Enderloom should support an authorized capture session in which the user has legitimate server access and permission to use the assets.

Capture may include what the client legitimately receives or what the user/author supplies:

- server resource pack bytes;
- pack SHA/hash and server identity;
- locally cached assets legitimately delivered to the client;
- screenshots/video/reference captures;
- visible entity/model states;
- interactions, animations, sounds and particles;
- visible UI/dialogue/quest flows;
- user-triggered commands and observable responses;
- runtime logs/client state that the user can legitimately inspect;
- author-supplied `.bbmodel`/`.ajmodel`, ModelEngine, MythicMobs, custom-content configs and source packs.

A captured client resource pack alone is **visual evidence**, not proof of hidden server gameplay semantics.

## 2.3 Rights boundary

Never bypass:

- DRM;
- encryption;
- obfuscation intended as access control;
- paywalls;
- Marketplace entitlement;
- protected pack delivery;
- server authorization;
- proprietary plugin licensing.

When hidden server-only semantics are not available, Enderloom may reconstruct from authorized observable behavior/reference evidence, but it must label inferred/unknown behavior instead of claiming exact recovery.

---

# 3. Spellbrook-Class Server -> Fully Native Mod Conversion

A server conversion is not “turn resource pack into a mod.”

The target is a **server-independent native Java mod** that reconstructs the full experience for the authorized content supplied/observed.

## 3.1 Intake inventory

Inventory every supplied/observed layer:

- resource packs;
- datapacks;
- plugin JAR descriptors and config folders;
- Blockbench / Animated Java projects;
- ModelEngine/BetterModel/FreeMinecraftModels-style assets;
- MythicMobs/MythicCrucible semantics;
- ItemsAdder/Oraxen/Nexo/Nova/custom-content definitions;
- MMOItems/MMOCore/equipment systems;
- ExecutableItems/ExecutableBlocks action graphs;
- quests/NPC/dialogue systems;
- skill/magic/RPG systems;
- HUD/scoreboard/font/glyph/UI assets;
- vehicles/pets/mounts;
- furniture/custom blocks/items;
- structures/world content;
- particles/sounds/music;
- commands/scripts/functions;
- localization;
- permissions/economy/context-only plugins needed to explain behavior.

Every unknown supplied plugin/config remains an explicit coverage item.

## 3.2 Recover independent semantic layers

### Visual layer

Recover:

- geometry/hierarchy;
- pivots/origins;
- UVs/textures/material/emissive layers;
- item/block/entity display transforms;
- model variants/skins;
- animations, interpolation, easing, loops;
- animated textures;
- particles/sounds;
- fonts/glyphs/HUD assets.

### Model-runtime layer

Recover:

- hitboxes/multipart hitboxes;
- seat/mount bones;
- held-item bones;
- locators;
- leash/nameplate attachment points;
- model states;
- animation-controller states;
- keyframe gameplay events;
- per-player synchronized visual state;
- root-motion semantics when proven.

### Gameplay layer

Recover or faithfully reimplement:

- AI goals/targeting;
- triggers/conditions;
- skills/attacks/projectiles;
- damage/status effects/cooldowns;
- drops/loot;
- recipes;
- items/tools/weapons/armor;
- custom blocks/furniture;
- ownership/taming/follow/stay;
- pets/mounts;
- inventories;
- GUIs/menus;
- NPCs/dialogue;
- quests/progression;
- shops/economy behavior where content-critical;
- structures/spawns/worldgen;
- persistence;
- multiplayer/server-client synchronization.

## 3.3 Native target rule

If the user asks for a mod, Enderloom must produce a real target-loader mod.

Do not stop at:

- generated resource pack only;
- datapack wrapper;
- KubeJS script pack pretending to be native parity;
- dependency on the original Paper server/plugin stack;
- visual-only reconstruction when gameplay was requested.

Scripts/datapacks may be generated as implementation details or optional pack integration layers, but the requested native mod remains the canonical product.

## 3.4 Runtime proof

Require applicable:

- dedicated-server launch;
- native client launch;
- integrated-server gameplay;
- multiplayer sync;
- persistence/restart;
- deterministic visual QA;
- interaction/AI/quest/item/block scenarios;
- performance comparison;
- no unresolved required asset references.

---

# 4. Bedrock Add-On -> Full Java Mod Conversion

Enderloom must natively support the type of conversion where a complete Bedrock add-on is transformed into a high-quality Java mod rather than a partial data-pack imitation.

## 4.1 Full Bedrock inventory

Parse and retain coverage for:

- `manifest.json` identity/dependencies/modules;
- behavior packs;
- resource packs;
- Script API JavaScript/TypeScript;
- Molang;
- entities/components/component groups;
- AI goals;
- entity events/actions/triggers;
- entity properties;
- spawn rules;
- geometry;
- animations;
- animation controllers;
- render controllers;
- attachables;
- items/components;
- blocks/components/permutations;
- recipes;
- loot tables;
- trade tables;
- particles;
- sounds/sound definitions;
- textures/texture atlases/texture sets;
- UI where supplied;
- fonts/localization;
- structures;
- features/feature rules;
- biomes/worldgen;
- dimensions when supplied/supported;
- commands/functions;
- pack experiments/min-engine-version semantics;
- subpacks;
- any unknown files.

**No Unknown Files** remains mandatory.

## 4.2 Semantic conversion

Bedrock constructs map into a versioned intermediate semantic model before Java implementation.

Examples:

- Bedrock entity components/goals -> Java entity goals/state machine/events;
- component groups/events -> native state transitions;
- Molang queries -> Java-side/client-side predicates/calculations;
- animation controllers -> target animation state machines;
- render controllers -> target model/material/state selection;
- Bedrock item/block components -> native registered content and capabilities;
- loot/recipes/trades -> Java data/code as appropriate;
- Script API behavior -> native server/client Java logic, not embedded JavaScript unless explicitly designed as a scripting integration;
- structures/worldgen -> target-version data/worldgen APIs;
- UI -> native screen/menu when Java gameplay needs it.

Any semantic gap is explicit in the coverage ledger.

## 4.3 Loader/version targets

Support conversion to target-specific native projects such as:

- Forge;
- NeoForge;
- Fabric;
- Quilt where applicable.

A conversion may also produce a multiloader workspace when requested.

## 4.4 Bedrock parity proof

Where source behavior can be run, generate paired scenarios for source and target and compare:

- inventory/state;
- movement/AI;
- attacks;
- cooldowns;
- loot;
- recipes;
- blocks/items;
- animation states;
- visuals;
- sounds/particles;
- persistence;
- multiplayer behavior.

When Bedrock behavior cannot be run in the current environment, preserve the exact missing proof instead of claiming parity.

---

# 5. Ecosystem-Aware Compatibility — “Best Fit” Integration

A converted or newly created mod should integrate with the dominant ecosystem appropriate to its content and target platform.

Enderloom must not blindly inject every compatibility library. It first classifies the mod’s semantics, then activates relevant versioned **Compatibility Contracts**.

Examples:

- backpack/storage mod -> Sophisticated Backpacks / Sophisticated Core / Curios / recipe-viewer / automation/container contracts;
- wearable/accessory content -> Curios / Trinkets / Accessories-family contract for the target loader/version;
- machinery/kinetics -> Create / Registrate / Ponder / Flywheel and standard capability contracts where relevant;
- RPG loot/equipment -> Apotheosis/Apothic Curios-style category/affix/socket compatibility where relevant;
- food/cooking -> Farmer’s Delight ecosystem when semantic overlap exists;
- guidebook/progression -> Patchouli integration when appropriate;
- recipes -> JEI/EMI/REI integration appropriate to target loader;
- information overlays -> Jade/WTHIT-style display providers where meaningful;
- scripts/pack authoring -> KubeJS/CraftTweaker integration while keeping native mod logic canonical;
- animated content -> GeckoLib/AzureLib/native renderer according to target and source;
- machines/storage -> Forge/NeoForge item/fluid/energy capability contracts plus optional AE2/Refined Storage/Create automation when meaningful;
- worldgen -> biome/worldgen ecosystem compatibility when target pack requires it;
- rendering -> Embeddium/Sodium/Oculus/Iris/Create/Flywheel/Distant-Horizons-related compatibility tests where the target stack uses them.

The concrete contract catalog lives in `docs/ENDERLOOM_ECOSYSTEM_COMPATIBILITY_CONTRACT_CATALOG.md`.

## 5.1 Compatibility is behavioral

“Compatible” means tested behavior, not merely “both mods load.”

Example backpack/equipment acceptance can include:

- equip/unequip;
- Curios slot visibility;
- save/reload persistence;
- nested inventory safety;
- item-handler insertion/extraction;
- automation;
- pickup/loot behavior;
- death/drop handling;
- upgrade behavior;
- recipe transfer;
- NBT/component preservation;
- shift-click/quick-move;
- server/client sync;
- multiplayer;
- sorting/filtering interactions;
- no dupes/item loss.

## 5.2 Version-specific source truth

Adapters/contracts resolve exact target versions from current source/provider metadata.

Do not assume that the newest API version supports an older Minecraft target. For example, 1.20.1 integration must use the actual 1.20.1-compatible API/runtime branch/artifacts.

## 5.3 License-aware integration

Referencing or depending on a mod API is distinct from copying its source.

Enderloom must track:

- API/dependency license;
- source reuse permission;
- distribution permission;
- whether compatibility can be implemented via public API/events/data/IMC;
- whether source inspection may only be used as behavioral reference.

---

# 6. Java Mod Port / Backport / Loader Conversion

Support recurring work such as bringing newer mods/features to Forge 1.20.1 or moving between Forge/NeoForge/Fabric.

Required workflow:

1. source/JAR intake + hash;
2. exact source lineage/version;
3. mapping/API/loader inventory;
4. vanilla-feature dependency closure;
5. mod-owned content inventory;
6. source-native base port first;
7. loader-specific event/network/registry/render/data conversion;
8. Mixin/access-transformer/access-widener translation;
9. config/save/data migration;
10. integration contracts;
11. build/remap/production-linkage proof;
12. dedicated-server/native-client/integrated-server tests;
13. persistence and old-world tests when needed;
14. content parity report.

Never delete/stub a missing target-version feature just to compile.

---

# 7. JAR Repair / Source Recovery / Binary-Only Work

Enderloom must support the kind of “fix this JAR” jobs we repeatedly perform.

Capabilities:

- metadata/dependency inventory;
- decompile/remap to inspect implementation;
- source symbol ownership;
- Mixin/ASM/reflection/invokedynamic analysis;
- recover build assumptions;
- patch through the narrowest safe method;
- preserve original JAR untouched;
- repackage/remap;
- production JVM linkage validation;
- native client/server runtime proof;
- binary diff/provenance;
- rollback.

Where licensing/source rights prohibit redistribution, Enderloom must respect that boundary.

---

# 8. Performance Optimization Without Regression

Support the full recurring workflow:

`profile -> source ownership -> patch -> build -> identical scenario -> before/after -> quality parity -> release`

This includes:

- spark;
- Observable and descendants;
- Crash Assistant diagnostics;
- JFR/jcmd/async-profiler;
- Black Box;
- render/frame-time/GPU evidence;
- heap/allocation;
- startup profiling;
- chunk/worldgen profiling;
- network/IO when relevant;
- automated mod bisect/minimal reproducer.

Hard rules:

- no hidden caps;
- no content deletion;
- no lower render distance/quality as a secret “optimization”;
- no unsafe off-thread world/render mutation;
- no FPS claim without rendered-client measurement;
- measurement pass separate from attribution profiler overhead;
- visual/content/config/network/persistence parity must remain satisfied.

---

# 9. Crash / Freeze / Deadlock / World Repair

Enderloom must cover recurring repair chats such as:

- game crash;
- server lock/freeze;
- mobs stop attacking/ticking;
- teleport/dimension lock;
- startup hang;
- native JVM crash;
- broken config;
- Mixin conflict;
- world will not recreate/open;
- missing dimension/registry metadata;
- broken save/level metadata;
- bad entity/block entity/ticking data;
- seed recovery;
- mod update breaking an old world.

Workflow can combine:

- Crash Assistant/raw logs;
- thread dumps;
- JFR;
- lock graph;
- spark;
- Observable;
- ModernFix diagnostics;
- Neruina-style recovery isolation;
- world/NBT inspection;
- registry diff;
- mod/config delta;
- bisect;
- sandbox repair copy;
- restart/reopen proof.

Never use the user’s only live world as destructive test scratch space.

---

# 10. Model / Texture / Animation / Reference Reconstruction

Support the complete recurring MCModels/Blockbench/reference workflow.

Inputs:

- `.bbmodel` / `.ajmodel`;
- Java/Bedrock model formats;
- images;
- multi-view images;
- GIF;
- video;
- sprite sheets;
- server-delivered model/resource assets;
- authorized marketplace-style source/reference media.

Capabilities:

- camera solve;
- silhouette/depth reconstruction;
- cuboid/mesh reconstruction;
- texture back-projection;
- UV authoring;
- rigging/pivots;
- animation fitting;
- animation retargeting;
- secondary motion;
- animated textures;
- VFX/SFX hooks;
- hitboxes/seats/locators;
- renderer target selection;
- deterministic visual compare;
- actual Minecraft client capture;
- grounding/clipping/culling/state-sync validation.

Unseen geometry remains explicitly inferred.

---

# 11. World / Modpack / Content Operations

The parity contract also covers recurring non-code Minecraft jobs:

- inspect/manage/update modpacks;
- dependency closure;
- add/remove impact analysis;
- “why is this installed?” graph;
- config migration;
- Hotkey migration/conflict resolution;
- world snapshot/repair/trim/pregen;
- chunk/NBT inspection;
- seed/dimension metadata recovery;
- pack/version migration;
- progression/softlock checks;
- mod/content catalogs and current provider/source research;
- texture/resource-pack compatibility discovery;
- source/download verification;
- release/update planning;
- performance culprit discovery across a full pack.

---

# 12. Automated Compatibility Contract Generation

When a converted/new mod has no existing compatibility contract, Enderloom should be able to generate one from:

- the mod’s public API/data model;
- target ecosystem documentation/source;
- observed behavior;
- existing adapters;
- author-defined requirements.

Generated contract includes:

- fixtures/dependencies;
- setup;
- scenario steps;
- expected state transitions;
- server/client requirements;
- persistence checks;
- negative/error cases;
- performance/visual gates where appropriate.

AI may draft the contract, but Enderloom runtime evidence decides pass/fail.

---

# 13. Automatic Compatibility Matrix Selection

For every project, derive a `CompatibilityProfile` from detected semantics.

Example classifications:

- `inventory_container`;
- `wearable_accessory`;
- `machine_automation`;
- `kinetic_machine`;
- `energy_machine`;
- `fluid_machine`;
- `rpg_equipment`;
- `food_cooking`;
- `mob_entity`;
- `pet_mount`;
- `worldgen_structure`;
- `dimension_portal`;
- `spell_magic`;
- `quest_progression`;
- `guidebook`;
- `visual_model_animation`;
- `server_custom_content`;
- `bedrock_addon`;
- `client_render`;
- `performance_patch`.

The profile determines which ecosystem contracts are applicable, optional or irrelevant.

---

# 14. Test Matrix for “Full Functioning Mod”

A release may require a matrix across:

## Base

- clean target loader;
- required dependencies only;
- dedicated server;
- client/integrated server;
- restart/reload;
- multiplayer when relevant.

## Ecosystem

- selected compatibility dependencies individually;
- selected high-value combinations;
- current user modpack when available;
- absent-optional-provider lane;
- provider-present lane;
- update/migration lane when applicable.

## Content

- every registered content family;
- every animation/state family;
- every important recipe/loot/trade;
- inventory/equipment/persistence;
- worldgen/dimension/portal;
- quests/progression;
- config toggles;
- visual QA.

## Performance

- startup;
- steady-state TPS/MSPT;
- rendered client frame-time where applicable;
- memory/allocation where relevant;
- stress scenario.

---

# 15. First-Class Enderloom Objects Required

Wave A architecture must leave typed extension paths for:

- `AcquisitionSource`;
- `AcquisitionReceipt`;
- `RightsDeclaration`;
- `ServerCaptureSession`;
- `ServerContentInventory`;
- `ServerPluginIdentity`;
- `ServerSemanticArtifact`;
- `ConversionProject`;
- `ConversionInput`;
- `SemanticCoverageItem`;
- `ConversionMapping`;
- `UnknownSemantic`;
- `BedrockPack`;
- `BedrockModule`;
- `BedrockSemanticNode`;
- `JavaTargetProject`;
- `CompatibilityProfile`;
- `CompatibilityContract`;
- `CompatibilityScenario`;
- `CompatibilityResult`;
- `EcosystemAdapter`;
- `ProviderVersionConstraint`;
- `PortProject`;
- `BinaryPatchProject`;
- `ParityLedger`;
- `ReleaseAcceptance`.

These link to the already-required Project/Artifact/FileHash/Task/Evidence/Test/Performance/AI/Studio/Brain objects.

No conversion-specific shadow database.

---

# 16. CLI / Headless Parity

Examples:

```text
enderloom acquire server-capture --instance Spellbrook --authorized
enderloom convert server ./Spellbrook-Asset-Capture.zip --target forge:1.20.1 --full
enderloom convert bedrock ./Backpacks-2.0.2.mcaddon --target forge:1.20.1 --compat auto
enderloom compat detect ./project
enderloom compat run ./project --profile auto --full
enderloom port ./mod --target forge:1.20.1 --quality max
enderloom repair ./mod.jar --incident latest --full
enderloom perf compare ./candidate.jar --against baseline --scenario auto
enderloom release verify ./project --all-required-gates
```

Every command maps to the same service operation as GUI/AI.

---

# 17. AI Operator Parity

Natural-language requests such as these must compile into the same workflows:

- “Turn this authorized server pack into a fully functioning mod.”
- “Join/capture this server I have permission to use and reconstruct the content as a native mod.”
- “Convert this Bedrock addon to Forge 1.20.1 and make it work perfectly with Sophisticated Backpacks and Curios.”
- “Port this mod to 1.20.1 with no content loss.”
- “Find what is killing FPS and fix the mod without lowering quality.”
- “Use this GIF to reconstruct the mob/model/animation exactly.”
- “Fix this world so it opens and preserve everything possible.”

The AI can research/plan/implement, but Enderloom’s tools and runtime gates remain authoritative.

---

# 18. Research Snapshot / Current Ecosystem Evidence

Version-specific compatibility must always be refreshed when it is load-bearing.

Current reference examples used for this 2026-09-07 contract include:

- Sophisticated Backpacks / Sophisticated Core current project/source and 1.20.1 artifacts:
  - https://github.com/P3pp3rF1y/SophisticatedBackpacks
  - https://github.com/P3pp3rF1y/SophisticatedCore
- Curios API:
  - https://github.com/TheIllusiveC4/Curios
- Create developer dependency guidance / Ponder:
  - https://github.com/Creators-of-Create/wiki
  - https://github.com/Creators-of-Create/Ponder
- Apotheosis-compatible Curios bridge and category compatibility patterns:
  - https://www.curseforge.com/minecraft/mc-mods/apothic-curios
- Patchouli:
  - https://github.com/VazkiiMods/Patchouli
- Farmer’s Delight:
  - https://www.curseforge.com/minecraft/mc-mods/farmers-delight
- Bedrock Creator reference covers behavior/resource packs, Script APIs, Molang, entity/block/item components, animations/controllers, particles and related schemas:
  - https://learn.microsoft.com/minecraft/creator/reference/
  - https://learn.microsoft.com/minecraft/creator/

These are examples, not a closed list.

---

# 19. Definition of Done

Enderloom reaches Minecraft workflow parity only when it can take a representative set of our real recurring jobs and complete them end-to-end:

1. **Spellbrook-class authorized server capture -> native mod** with visual/model-runtime/gameplay semantics accounted for.
2. **Bedrock Backpacks-class addon -> Java mod** with full semantic inventory and ecosystem compatibility such as Sophisticated Backpacks/Curios where appropriate.
3. **Java mod backport/loader port** with no silent content deletion and production-runtime proof.
4. **Broken JAR repair** with source attribution/build/native runtime test.
5. **Performance regression repair** with clean measurement, profiler attribution and before/after parity.
6. **Crash/freeze/world repair** with evidence and restart/persistence proof.
7. **Reference model/animation reconstruction** with deterministic + native visual QA.
8. **Whole modpack integration** with dependency/config/hotkey/world/progression compatibility.

The product should not require the user to manually stitch together fifteen specialist tools after Enderloom starts the job. Enderloom owns the workflow from intake to verified release.
