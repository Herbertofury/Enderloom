# Enderloom — Minecraft Workflow Parity Handoff Addendum

**Status:** Mandatory continuation contract  
**Updated:** 2026-09-07

Any Codex/agent continuing Enderloom must treat these two documents as mandatory product contracts:

1. `docs/ENDERLOOM_MINECRAFT_WORKFLOW_PARITY_MASTER_SPEC.md`
2. `docs/ENDERLOOM_ECOSYSTEM_COMPATIBILITY_CONTRACT_CATALOG.md`

They supplement the existing Unified Studio, AI Operator, Diagnostics/Progress, Performance Lab, Repair, conversion and Wave A contracts.

## Locked product law

If ChatGPT + Minecraft Dev Kit can perform a serious Minecraft workflow for the user, Enderloom must ultimately be able to perform the same job through the canonical GUI/CLI/MCP/AI operation layer with equal or stronger verification.

This explicitly includes:

- authorized server/client asset capture and staging;
- Spellbrook-class authorized server -> standalone native mod conversion;
- full server custom-content semantic reconstruction, not resource-pack-only conversion;
- Bedrock `.mcpack` / `.mcaddon` -> native Java mod conversion;
- Java version ports/backports and loader conversions;
- binary/JAR repair with decompile/remap/source ownership where lawful;
- performance diagnosis and optimization without quality/content regression;
- crash/freeze/deadlock/world/save repair;
- MCModels/Blockbench/image/GIF/video/reference model/texture/animation reconstruction;
- whole-modpack migration and compatibility;
- config/hotkey/world/NBT/progression/wiki/release operations;
- automated runtime tests and release proof.

## Spellbrook-class acceptance

A server conversion is not complete when only the client resource pack was copied.

Enderloom must inventory/recover three independent layers:

1. visual assets — geometry, textures, animations, states, particles, sounds, fonts/HUD;
2. model-runtime semantics — hitboxes, seats, locators, state machines, keyframe events, synchronized states;
3. gameplay semantics — AI, skills, triggers, projectiles, drops, items, blocks, furniture, inventories, NPC/dialogue/quests, world content, persistence and networking.

The richest authorized source wins: authoring `.bbmodel`/`.ajmodel` + plugin configs/source packs > generated resource pack > runtime observable evidence > client-delivered resource pack alone.

Never bypass DRM, paywalls, protected pack delivery, server authorization or proprietary plugin licensing. Missing hidden server semantics remain explicit unknown/inferred items until sourced or reconstructed from authorized observable behavior.

## Bedrock conversion acceptance

A full mod conversion must inventory behavior/resource packs, Script API, Molang, components/groups/events, entities, items, blocks/permutations, recipes, loot/trades, geometry, animations/controllers/render controllers, particles, sounds, UI/fonts/localization, structures/worldgen/functions and unknown files.

Translate into a versioned semantic model, then into native Forge/NeoForge/Fabric/Quilt logic as requested. Do not stop at a datapack/KubeJS wrapper when the requested product is a native mod.

## Ecosystem-aware compatibility

Compatibility is selected from detected semantics rather than blindly installing every popular mod.

Examples:

- backpack/storage -> Sophisticated Backpacks/Sophisticated Core, Curios if wearable, recipe viewers, generic inventory/automation contracts;
- accessories -> Curios/Trinkets/Accessories-family target appropriate to loader/version;
- machines/kinetics -> Create/Registrate/Ponder/Flywheel + standard item/fluid/energy interfaces where relevant;
- RPG equipment -> Apotheosis/Apothic Curios-style affix/category/socket paths where relevant;
- food/cooking -> Farmer’s Delight integration where applicable;
- guidebooks -> Patchouli export/integration where useful;
- recipes -> JEI/EMI/REI adapters appropriate to target;
- tooltips -> Jade/WTHIT-style providers where meaningful;
- scripted pack integration -> KubeJS/CraftTweaker adapters while native logic remains canonical;
- machine/storage automation -> optional AE2/Refined Storage/Create/etc. fixtures when semantically relevant;
- render-heavy content -> target-pack compatibility with Embeddium/Sodium/Oculus/Iris/Create/Flywheel/Distant Horizons and other relevant render stacks.

A contract passes only after behavioral scenarios; co-loading is insufficient.

## Version-specific contract rule

Resolve exact target-version APIs/dependencies from current source/provider metadata before implementation. Never use the newest library artifacts blindly for an older target such as Forge 1.20.1.

Fresh research on 2026-09-07 confirms this matters: Sophisticated Backpacks continues publishing 1.20.1 builds, while Create’s own 1.20.1 developer page pins exact Create/Ponder/Flywheel/Registrate versions and warns that 1.20.1 is no longer its feature-development target.

## Wave A architecture consequences

Wave A must leave typed extension paths for:

- `AcquisitionSource`, `AcquisitionReceipt`, `RightsDeclaration`;
- `ServerCaptureSession`, `ServerContentInventory`, `ServerPluginIdentity`, `ServerSemanticArtifact`;
- `ConversionProject`, `ConversionInput`, `SemanticCoverageItem`, `ConversionMapping`, `UnknownSemantic`;
- `BedrockPack`, `BedrockModule`, `BedrockSemanticNode`, `JavaTargetProject`;
- `CompatibilityProfile`, `CompatibilityContract`, `CompatibilityScenario`, `CompatibilityResult`, `EcosystemAdapter`, `ProviderVersionConstraint`;
- `PortProject`, `BinaryPatchProject`, `ParityLedger`, `ReleaseAcceptance`.

All link into existing Project/Artifact/FileHash/Task/Evidence/Test/Performance/AI/Studio/Brain objects. No conversion-specific or compatibility-specific shadow database.

## Representative end-to-end acceptance fixtures

Eventually maintain owned/authorized fixtures proving at least:

1. Spellbrook-class server asset/source bundle -> standalone native mod;
2. Bedrock Backpacks-class addon -> Java mod + Sophisticated Backpacks/Curios compatibility;
3. Java mod newer-version -> Forge 1.20.1 backport with content parity;
4. Forge/NeoForge/Fabric loader conversion;
5. broken binary JAR -> repaired build + runtime proof;
6. performance regression -> profiler attribution -> patch -> before/after no-regression proof;
7. crash/freeze/world failure -> repaired restart/persistence proof;
8. image/GIF/model reference -> native model/animation + visual/runtime proof.

## Exact implementation order remains unchanged

Do not jump ahead into a giant conversion UI.

Continue **Wave A — Integration Spine** first and ensure its typed operation/task/evidence architecture can represent all acquisition/conversion/compatibility/parity objects above. Then later feature waves can implement these workflows without another core rewrite.
