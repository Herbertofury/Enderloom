# Enderloom — Ultimate Minecraft Workbench / Codex Master Backlog

**Status:** Canonical expansion backlog / Codex implementation contract  
**Updated:** 2026-09-07  
**Repository:** `Herbertofury/Enderloom`  
**Primary branch:** `main`  
**Parent contract:** `docs/ENDERLOOM_MASTER_REQUIREMENTS.md`  
**Existing Performance Lab tracker:** GitHub issue #1  
**Autonomous repair child spec:** `docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md`

This backlog is the north-star expansion of Enderloom from an excellent launcher/catalog/mod manager into the **one absurdly capable Minecraft desktop workbench** a player, pack author, tester, server owner, world maintainer, mod developer, asset artist, conversion engineer, or researcher can live in.

It deliberately absorbs the strongest lessons from the Minecraft Dev Kit work: real runtime proof, zero-content-loss ports, dependency closure, source reconstruction, model/texture/animation fidelity, world safety, profiler evidence, fast iteration, release-grade QA, and ruthless integration between every subsystem.

The product target is not “many tabs.” The target is **one shared Minecraft graph where every relevant fact and action is available everywhere it matters**.

---

# 0. North-star product promise

Enderloom should eventually make these workflows feel normal:

- [ ] See any installed Java mod, Bedrock add-on, resource pack, shader, data pack, world, server, model, texture, animation, or pack as a first-class project inside Enderloom.
- [ ] Right-click a mod and instantly see its exact source/provider homes, source repository, issues, files, configs, dependencies, changelog, media, videos, author, performance history, compatibility, repair history, world impact, installed copies, versions, loaders, hashes, and actions.
- [ ] Hover a project and get a Steam-like live preview from authoritative media/video without leaving the app.
- [ ] Open the real CurseForge/Modrinth/Planet Minecraft/AFDIAN/MCPEDL/ModBay/Minecraft Marketplace/GitHub/GitLab/etc. page inside Enderloom’s real persistent browser.
- [ ] Import an authorized Bedrock add-on and convert it into a real Java mod for a selected Minecraft version/loader with a semantic coverage report, real builds, real runtime tests, and no silent content deletion.
- [ ] Port a Java mod between Minecraft versions and loaders from one canonical multiversion project, using Stonecutter-style source variants and Enderloom’s own semantic/version atlas.
- [ ] Diagnose a crash, lag spike, server lockup, FPS regression, memory problem, Mixin conflict, bad worldgen interaction, or broken model and move directly into a repair workflow.
- [ ] Say **Fix with AI** and let Enderloom use its integrated authenticated browser to run the full handoff -> returned artifact -> build -> sandbox test -> failure feedback -> retry -> transactional install loop.
- [ ] Inspect and edit Minecraft worlds with the best ideas from Amulet, MCA Selector and NBTExplorer in one safer, richer workflow.
- [ ] Reconstruct or author Minecraft models, textures and animations using first-class Blockbench-compatible project workflows, then prove them in the actual Minecraft client.
- [ ] Turn one mod into a release matrix across versions/loaders, test every target, package it, and retain exact provenance.
- [ ] Build, test, repair, profile, compare, port, package and install without stitching together six unrelated applications.

---

# 1. The Integration Law — absolutely non-negotiable

> **No feature islands. No shadow databases. No duplicated truth.**

Every applicable subsystem must integrate with every other applicable subsystem through shared domain entities and evidence.

Examples:

- [ ] Performance test results appear on the mod row/card, mod detail page, Favorites, update planner, compatibility planner, repair workflow and pack dashboard.
- [ ] A mod update automatically knows which performance baselines, compatibility tests, config analyses and world-impact evidence become stale.
- [ ] A conversion result knows its source project, target project, source/target hashes, semantic mapping, unresolved gaps, build/test evidence and install targets.
- [ ] A world hotspot can link back to the mod/entity/block/entity type responsible for it.
- [ ] A crash culprit can open the exact mod, offending class/Mixin/config, source repository and `Fix with AI` workflow.
- [ ] A model/animation QA failure appears on the same project/mod asset graph and can be opened in the asset editor/reconstruction workflow.
- [ ] A returned AI patch is visible as source history, repair history, performance delta, compatibility delta and install provenance.
- [ ] Config changes invalidate only evidence whose fingerprints actually depend on those configs.
- [ ] Source/provider research is immediately actionable: install, port, compare, favorite, test, inspect source, open issues, or add to a pack.
- [ ] The browser can open any relevant project/task/evidence beside the native Enderloom surface in Split view.
- [ ] CLI/CI operates on the same domain objects and task engine as the GUI.

Add automated **integration coverage QA**:

- [ ] Every new domain entity declares which existing views/actions consume it.
- [ ] Every new evidence type declares where it should surface.
- [ ] Every new mutation declares which derived evidence becomes stale.
- [ ] CI fails if a meaningful new operation has no shared-domain/CLI mapping without an approved reason.

---

# 2. Canonical Minecraft Knowledge Graph

Build one persistent graph rather than loose tables.

First-class entities:

- [ ] Project
- [ ] ProjectSource
- [ ] Creator/Organization
- [ ] Release/Version
- [ ] Artifact
- [ ] FileHash
- [ ] MinecraftVersion
- [ ] Loader
- [ ] JavaRuntime
- [ ] Instance
- [ ] Modpack
- [ ] Server
- [ ] World
- [ ] Dimension
- [ ] Chunk/Region
- [ ] ConfigFile
- [ ] Dependency
- [ ] CompatibilityEdge
- [ ] ConflictEdge
- [ ] SourceRepository
- [ ] Commit/Tag/Branch
- [ ] Patch
- [ ] ConversionProject
- [ ] SemanticMapping
- [ ] Asset
- [ ] Model
- [ ] Texture
- [ ] Animation
- [ ] Sound
- [ ] Recipe/Tag/LootTable/Structure/etc.
- [ ] TestScenario
- [ ] TestRun
- [ ] PerformanceResult
- [ ] Crash/DiagnosticFinding
- [ ] RepairJob
- [ ] RepairCandidate
- [ ] EvidenceArtifact
- [ ] WorldImpactFinding
- [ ] UserNote/Favorite/Tag/Collection

Identity rules:

- [ ] Artifacts use SHA-256 as primary byte identity.
- [ ] Provider IDs/slugs remain aliases, never substitutes for byte identity.
- [ ] Installed paths are locations, not identities.
- [ ] Physical path identity resolves junction/symlink duplicates.
- [ ] Source commits/tags are preserved for build provenance.
- [ ] Bedrock UUIDs map into the same graph without pretending they are Java project IDs.
- [ ] Derived/conversion artifacts retain lineage back to source bytes.

---

# 3. Durable Task Engine

Every long workflow uses one persisted task framework.

- [ ] Cancellable.
- [ ] Resumable after Enderloom restart.
- [ ] Exact progress phase.
- [ ] Exact owned processes/PIDs.
- [ ] Exact temporary workspace.
- [ ] Exact input/output hashes.
- [ ] Checkpoint after meaningful stages.
- [ ] User-action-required state.
- [ ] Provider/network/backpressure state.
- [ ] No repeated identical retries.
- [ ] Clean recovery after crash/power loss.
- [ ] Preserve completed evidence.
- [ ] Cleanup only Enderloom-owned temporary state.

Use it for:

- downloads;
- installs/updates;
- modpack imports;
- builds;
- conversions;
- ports;
- model conversions;
- world operations;
- backups/restores;
- profiling;
- Performance Lab runs;
- AI repair loops;
- publishing/exporting.

---

# 4. Universal Project / Mod Detail Surface

Every project gets one gorgeous truth surface.

Header:

- [ ] icon;
- [ ] name;
- [ ] author/team;
- [ ] canonical provider identities;
- [ ] installed state;
- [ ] selected instance context;
- [ ] version/loader/Minecraft version;
- [ ] hash;
- [ ] update state;
- [ ] favorite/pin/freeze state;
- [ ] measured performance badge;
- [ ] compatibility badge;
- [ ] repair/patch badge;
- [ ] conversion lineage badge;
- [ ] source availability/license badge;
- [ ] last tested environment/date/confidence.

Tabs/sections:

- [ ] Overview
- [ ] Media
- [ ] Videos
- [ ] Sources
- [ ] Versions
- [ ] Dependencies
- [ ] Compatibility
- [ ] Performance
- [ ] Configs & Files
- [ ] Logs & Crashes
- [ ] World Impact
- [ ] Source Code
- [ ] Patches & Repairs
- [ ] Conversion/Porting
- [ ] Assets
- [ ] Notes/Collections
- [ ] Raw metadata/evidence

Actions:

- [ ] Install
- [ ] Install exact version
- [ ] Install to multiple instances
- [ ] Update
- [ ] Downgrade
- [ ] Freeze
- [ ] Enable/disable
- [ ] Remove with impact plan
- [ ] Test
- [ ] Quick Scan
- [ ] Deep Profile
- [ ] Fix with AI
- [ ] Optimize with AI
- [ ] Build compatibility patch
- [ ] Port to version
- [ ] Port to loader
- [ ] Convert Bedrock/Java where applicable
- [ ] Open source
- [ ] Open configs
- [ ] Open containing folder
- [ ] Compare versions
- [ ] Compare configs
- [ ] Compare performance
- [ ] Export diagnostic bundle
- [ ] Restore original/rollback

---

# 5. Right-click / Power Context Menu — obsessive QOL

Right-click should be one of Enderloom’s superpowers.

## 5.1 `Open / Sources` submenu

Show only verified/project-bound destinations, but preserve all known links:

- [ ] CurseForge
- [ ] Modrinth
- [ ] GitHub
- [ ] GitLab
- [ ] Planet Minecraft
- [ ] MCPEDL
- [ ] ModBay
- [ ] Minecraft Marketplace
- [ ] AFDIAN
- [ ] Patreon
- [ ] Hangar
- [ ] SpigotMC
- [ ] Bukkit
- [ ] BuiltByBit
- [ ] Polymart
- [ ] ModDB
- [ ] Nexus Mods
- [ ] Ko-fi
- [ ] itch.io
- [ ] BOOTH
- [ ] Gumroad
- [ ] creator homepage
- [ ] documentation
- [ ] issue tracker
- [ ] wiki
- [ ] Discord/community link when truly project-owned

Every menu item can:

- open in embedded Browser;
- open in Split view;
- open in system browser;
- copy link.

## 5.2 `Preview` submenu

- [ ] Hover card plays project-author video/GIF where available.
- [ ] Prefer official creator video.
- [ ] Then provider-hosted trailer/media.
- [ ] Then a reliable well-known tester/reviewer.
- [ ] If no dedicated video exists, find a reputable mod-roundup video containing the mod and seek directly to the relevant timestamp.
- [ ] Store evidence for title/channel/timestamp/project match.
- [ ] Never silently use unrelated clickbait footage.
- [ ] Muted-on-hover by default with remembered preference.
- [ ] Fullscreen/lightbox available.
- [ ] Original page one click away.

## 5.3 `Performance` submenu

- [ ] Quick Scan
- [ ] Test startup impact
- [ ] Test client FPS/frame-time
- [ ] Test server TPS/MSPT
- [ ] Test memory/GC
- [ ] Hunt lag spike
- [ ] Test without this mod
- [ ] Test current vs previous version
- [ ] Compare configs
- [ ] Open latest Spark/JFR/Observable evidence
- [ ] Open historical graph
- [ ] Optimize with AI

## 5.4 `Files & Configs` submenu

- [ ] Show every file associated with the mod.
- [ ] Config files.
- [ ] Server configs.
- [ ] Default configs.
- [ ] KubeJS/CraftTweaker/Paxi/data overrides referencing the mod.
- [ ] Datapacks/resources generated by the mod.
- [ ] Logs containing the mod ID.
- [ ] Crash reports involving the mod.
- [ ] World saved data namespaces.
- [ ] Mod JAR embedded libraries.
- [ ] Mixin configs.
- [ ] Access transformers/wideners.
- [ ] Generated runtime files.
- [ ] Open/edit/diff/backup/reset safely.

## 5.5 `Developer` submenu

- [ ] Open/decompile JAR
- [ ] Open matching source tag/commit
- [ ] Create patch workspace
- [ ] Rebuild
- [ ] Run tests
- [ ] Launch dev client/server
- [ ] Generate source archive
- [ ] Port version
- [ ] Port loader
- [ ] Open models/textures/animations
- [ ] Create compatibility project
- [ ] Open in external IDE/Blockbench when desired

---

# 6. Research / Catalog / Embedded Browser 2.0

Preserve the strong existing source/media browser and push it much further.

- [ ] One search can query installed content, catalogs and supported live providers.
- [ ] Result deduplication by canonical identity rather than title text.
- [ ] Provider-specific filters.
- [ ] Minecraft version/loader filters.
- [ ] Java/Bedrock filter.
- [ ] Project type filter.
- [ ] Free/paid/source-available/licensed filter where known.
- [ ] Compatibility-with-selected-instance filter.
- [ ] Already-installed/favorite/tested/known-good filter.
- [ ] Measured performance filter.
- [ ] Development activity/release freshness.
- [ ] Source repository health.
- [ ] Show alternatives/related projects.
- [ ] Compare projects side-by-side.
- [ ] Install directly from research.
- [ ] Save research collection as modpack candidate set.

Browser features:

- [ ] Persistent authenticated sessions.
- [ ] Real Chromium tabs.
- [ ] Split view with any Enderloom workspace.
- [ ] Download interception/adoption into relevant workflows.
- [ ] Per-site translation.
- [ ] Ad filtering.
- [ ] Navigation history/bookmarks tied to projects.
- [ ] `Send page to current project sources` action.
- [ ] `Use downloaded file as candidate` action.
- [ ] Task-aware tabs: repair/port/conversion/research jobs remember their browser context.

---

# 7. Bedrock Studio — first-class Bedrock support

Enderloom must understand Bedrock content as deeply as Java content.

Supported intake:

- [ ] `.mcpack`
- [ ] `.mcaddon`
- [ ] `.mcworld`
- [ ] behavior-pack folders
- [ ] resource-pack folders
- [ ] skin packs
- [ ] world templates when legally accessible
- [ ] local development packs
- [ ] authorized Marketplace/creator-provided source exports

Parse and model:

- [ ] `manifest.json` v2 and evolving v3 schemas.
- [ ] modules/dependencies/capabilities/settings/subpacks.
- [ ] behavior packs.
- [ ] resource packs.
- [ ] Script API modules.
- [ ] entities/components/component groups/events.
- [ ] spawn rules.
- [ ] items.
- [ ] blocks.
- [ ] recipes.
- [ ] loot tables.
- [ ] trade tables.
- [ ] functions.
- [ ] structures.
- [ ] features/feature rules/worldgen.
- [ ] animation controllers.
- [ ] animations.
- [ ] geometry.
- [ ] render controllers.
- [ ] materials.
- [ ] particles.
- [ ] attachables.
- [ ] fog.
- [ ] sounds/music/sound definitions.
- [ ] textures/atlases/terrain/item texture maps.
- [ ] languages/localization.
- [ ] UI definitions where present.
- [ ] Molang expressions.
- [ ] JavaScript/TypeScript Script API code.
- [ ] GameTest-related content.

UX:

- [ ] Show behavior/resource-pack linkage visually.
- [ ] Dependency graph.
- [ ] Resource-to-behavior crosslinks.
- [ ] Preview entities/models/textures/animations.
- [ ] Inspect component semantics without reading raw JSON.
- [ ] Search every identifier/reference.
- [ ] Jump-to-definition/reference.
- [ ] Detect missing/broken references.
- [ ] Validate pack structure against target Bedrock version.
- [ ] Repack/export with deterministic manifest handling.

---

# 8. Minecraft Marketplace integration

Example golden research fixture: the user-supplied Minecraft Marketplace `Backpacks and Jetpacks Add-On` PDP.

- [ ] Open Marketplace PDPs directly inside Enderloom Browser.
- [ ] Extract only normal page metadata/media that the user can legitimately access.
- [ ] Show creator/title/description/media/trailer/ratings/price/store metadata when available.
- [ ] Link Marketplace project to local imported source/add-on if identity can be established.
- [ ] Keep purchased/user-authorized local pack imports separate from public page metadata.
- [ ] Never bypass DRM, encryption, paywalls, entitlement checks or access controls.
- [ ] Conversion requires user-authorized accessible source bytes/assets.
- [ ] If source bytes are protected/unavailable, Enderloom may still catalog/research the project but must say conversion source is unavailable.
- [ ] Preserve author/license/attribution metadata in any lawful conversion workspace.

---

# 9. Universal Minecraft Intermediate Representation (UMIR)

Do not write Bedrock->Forge, Bedrock->Fabric, Forge->Fabric, 1.20.1->1.21.1 as dozens of isolated converters.

Build a typed semantic IR.

Represent:

- [ ] namespaces/identifiers;
- [ ] registry objects;
- [ ] items/blocks/entities;
- [ ] attributes/stats;
- [ ] inventories/containers/capabilities/components;
- [ ] interactions/use actions;
- [ ] AI goals/behaviors/sensors;
- [ ] components/events/state machines;
- [ ] recipes/tags/loot/trades;
- [ ] worldgen/features/structures/biomes/dimensions;
- [ ] networking/sync;
- [ ] commands;
- [ ] data persistence;
- [ ] rendering layers/materials/models/textures;
- [ ] animations/controllers/state transitions;
- [ ] particles/sounds;
- [ ] UI/screens/widgets;
- [ ] scripts/events/timers;
- [ ] configuration;
- [ ] dependencies/integration hooks;
- [ ] side/client/server semantics;
- [ ] version-introduced/version-removed metadata.

Every conversion records:

- source semantic node;
- target semantic node;
- translation strategy;
- fidelity status;
- confidence;
- source evidence;
- target implementation location;
- test proving parity;
- unresolved gap.

---

# 10. Bedrock -> Java Conversion Engine

Goal: turn an authorized Bedrock add-on into a real native Java mod, not a datapack-in-a-JAR approximation.

Target loaders:

- [ ] Forge
- [ ] NeoForge
- [ ] Fabric
- [ ] Quilt where meaningful

Target Minecraft versions:

- [ ] architecture accepts a version target rather than hardcoding one release;
- [ ] version adapters come from the shared Vanilla/Loader Feature Atlas;
- [ ] supported-target matrix grows continuously;
- [ ] missing semantics become explicit gaps, never silent deletion.

Conversion stages:

1. [ ] Source preservation + hashes + rights/provenance.
2. [ ] Bedrock structure/parser validation.
3. [ ] Semantic inventory.
4. [ ] Resource/behavior linkage.
5. [ ] UMIR translation.
6. [ ] Target project scaffold.
7. [ ] Registry implementation.
8. [ ] Gameplay implementation.
9. [ ] Asset conversion.
10. [ ] Animation/model runtime selection.
11. [ ] Persistence/data migration.
12. [ ] Script API translation/reimplementation.
13. [ ] Dependency integration.
14. [ ] Build.
15. [ ] Content inventory parity audit.
16. [ ] Dedicated server proof where applicable.
17. [ ] Native client/integrated-server proof.
18. [ ] Visual QA.
19. [ ] Performance sanity.
20. [ ] Package/install.

Translation examples:

- [ ] Bedrock item components -> native Java item behavior/components/hooks.
- [ ] Bedrock entity components/events -> Java entity AI/state/event logic.
- [ ] Bedrock dynamic properties -> appropriate Java saved data/capabilities/components.
- [ ] Bedrock inventory/container behavior -> Java menus/container APIs.
- [ ] Bedrock Script API -> explicit Java event/listener/tick/network implementations.
- [ ] Molang -> target-side expression/state logic or animation framework mapping.
- [ ] Geometry/animation controllers -> Java model + GeckoLib/AzureLib/native adapter selected by fidelity needs.
- [ ] Bedrock blocks/items/entities -> target registries with data-generation where appropriate.
- [ ] Spawn rules/worldgen -> target biome modifiers/datapack/native APIs.

Never pass a conversion because it compiles. Require semantic and runtime parity evidence.

---

# 11. Java Version Porting Engine

Turn our repeated backport/forward-port work into a product feature.

- [ ] Import source repository or reconstruct source when lawful/necessary.
- [ ] Identify exact current Minecraft version/loader.
- [ ] Select target version(s).
- [ ] Select target loader(s).
- [ ] Build cross-version dependency closure.
- [ ] Map vanilla identifiers/APIs across versions.
- [ ] Map loader APIs/events/registries/networking/config APIs.
- [ ] Map mappings namespace changes.
- [ ] Map Java runtime requirements.
- [ ] Map asset/data-pack schema changes.
- [ ] Map recipes/tags/loot/worldgen/NBT/data components.
- [ ] Map rendering/model pipeline changes.
- [ ] Map networking/protocol changes.
- [ ] Map capabilities/components/attachments.
- [ ] Detect future-vanilla dependencies.
- [ ] Build target-native mod-owned base first.
- [ ] Add explicit optional future-vanilla parity layer where needed.
- [ ] Never delete/stub target-missing functionality to make a port compile.

Output:

- target branch/project;
- compatibility report;
- changed API map;
- unresolved semantic gaps;
- built JARs;
- runtime evidence;
- exact content parity inventory;
- migration notes.

---

# 12. Stonecutter-style Multi-Version Workspace

Stonecutter demonstrates a useful model: one project can expose version-specific variants from a shared codebase. Enderloom should make this approachable and safer.

- [ ] Detect/import Stonecutter projects.
- [ ] Create Enderloom multiversion projects.
- [ ] Shared source + explicit version conditionals/variants.
- [ ] UI version matrix.
- [ ] Diff code across targets.
- [ ] Build one target.
- [ ] Build all targets.
- [ ] Run tests per target.
- [ ] Run native client/server per target.
- [ ] Show which lines/resources diverge by target.
- [ ] Visual merge/conflict assistant.
- [ ] Generate/update version conditionals from semantic port mappings.
- [ ] Per-version dependency declarations.
- [ ] Per-loader dependency declarations.
- [ ] Shared resources with version-specific overrides.
- [ ] Cross-target content inventory comparison.
- [ ] Release matrix packaging.
- [ ] CI matrix generation.
- [ ] Never leave the repository committed in an accidental wrong active version state.

Do not require Stonecutter itself forever; build a generic Enderloom multiversion domain model that can interoperate with it.

---

# 13. Cross-loader Porting

- [ ] Forge <-> NeoForge
- [ ] Forge <-> Fabric
- [ ] Fabric <-> NeoForge
- [ ] Quilt <-> Fabric where viable

Build typed abstraction/adaptation libraries only where they reduce duplication without lowering native quality.

Map:

- registries;
- lifecycle/events;
- networking;
- configs;
- capabilities/components;
- data generation;
- rendering hooks;
- keybindings/input;
- attachments;
- worldgen;
- commands;
- access transformers/wideners/Mixins;
- loader metadata;
- optional dependencies.

Every loader target must remain a first-class native build, not runtime loader emulation.

---

# 14. Source Workbench / JAR Lab

For any installed mod:

- [ ] Inspect JAR manifest/metadata.
- [ ] Browse classes/resources.
- [ ] Detect mappings namespace.
- [ ] Decompile to readable source workspace.
- [ ] Find likely upstream repository/tag/commit.
- [ ] Compare decompiled bytecode/source to upstream builds.
- [ ] Extract embedded libraries.
- [ ] Inspect Mixins and targets.
- [ ] Inspect AT/AW/coremod/plugin metadata.
- [ ] Search string/class/member references.
- [ ] Show client/server side usage.
- [ ] Show registry content inventory.
- [ ] Create patch project.
- [ ] Build patched JAR.
- [ ] Compare original vs patched artifact.
- [ ] Verify content/assets/classes not accidentally lost.
- [ ] Attach patch provenance to Mod Manager.

Safety:

- respect licenses/permissions;
- label reconstructed source honestly;
- never claim decompiled code is original author source;
- no obfuscation/protection bypass beyond lawful normal inspection.

---

# 15. Compatibility Lab

Make “does this work with everything?” measurable.

- [ ] Dependency graph.
- [ ] Optional integration detection.
- [ ] Mixin target overlap graph.
- [ ] Event/hook overlap.
- [ ] Registry collision detection.
- [ ] Recipe/tag conflicts.
- [ ] Worldgen conflicts.
- [ ] Resource conflicts.
- [ ] Shader/render-pipeline conflicts.
- [ ] Capability/component conflicts.
- [ ] Networking channel conflicts.
- [ ] Config/keybind conflicts.
- [ ] Known issue tracker matching.
- [ ] Pairwise test automation.
- [ ] Curated integration suites for major ecosystem mods.
- [ ] “Works with Sophisticated Backpacks” style functional contract tests rather than only boot tests.
- [ ] Curios/Trinkets/accessory integration tests.
- [ ] Apotheosis and other deep gameplay integration scenarios where relevant.
- [ ] Create compatibility patch workspace.
- [ ] Patch is tracked as a first-class derivative artifact.

Compatibility verdicts must identify what was actually tested.

---

# 16. Premium Performance Lab — evidence everywhere

Preserve issue #1 and existing detailed specs. Expand integration.

- [ ] Quick Scan static analysis.
- [ ] One-mod A/B.
- [ ] Adaptive all-mod isolation.
- [ ] Startup profiling.
- [ ] Client FPS/frame time.
- [ ] 1%/0.1% lows.
- [ ] stutter/long-frame counts.
- [ ] render thread/client main thread.
- [ ] TPS/MSPT/slow ticks.
- [ ] server-thread attribution.
- [ ] worldgen/chunk impact.
- [ ] entity/block-entity/scheduled-tick hotspots.
- [ ] heap/allocation/GC.
- [ ] disk/network.
- [ ] JFR.
- [ ] Spark.
- [ ] Observable.
- [ ] native process telemetry.
- [ ] confidence/noise engine.
- [ ] thermal/background-load detection.
- [ ] interaction graph.
- [ ] regression history.

Integration requirements:

- [ ] Mod list shows compact latest measured impact badges.
- [ ] Hover opens mini performance summary.
- [ ] Universal mod page has full Performance tab.
- [ ] Update planner shows whether update needs retesting.
- [ ] Config editor shows whether changes invalidate performance evidence.
- [ ] World Studio can show mod-attributed chunk/entity hotspots.
- [ ] Repair loop can consume profiler evidence automatically.
- [ ] Conversion/port pipeline runs performance sanity after parity.
- [ ] Favorites can show known-good/known-bad measured state.
- [ ] Pack dashboard ranks current offenders.
- [ ] No runtime number is shown as measured from static analysis only.

---

# 17. Enderloom Probe / Runtime Automation

Build loader/version-specific test-only control planes.

- [ ] lifecycle markers;
- [ ] title ready;
- [ ] world ready;
- [ ] chunk-ready;
- [ ] deterministic seed/world snapshot;
- [ ] command injection;
- [ ] GUI dump/assert/click;
- [ ] input/key/mouse;
- [ ] camera/look;
- [ ] scripted movement;
- [ ] interaction;
- [ ] inventory assertions;
- [ ] entity/block assertions;
- [ ] screenshot capture;
- [ ] telemetry stream;
- [ ] profiler boundaries;
- [ ] GameTest integration;
- [ ] clean auto-exit.

Modes remain truthful:

- rendered;
- virtual display;
- headless;
- dedicated server;
- protocol bot.

Never use headless mode to claim real render/FPS results.

---

# 18. Autonomous AI Repair Loop

**Canonical detailed spec:** `docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md`.

The simple UX:

`Right-click mod -> Fix with AI -> Enderloom handles the rest.`

Core requirements:

- [ ] Default browser-chat lane uses Enderloom’s integrated persistent authenticated browser; no separate API key is required for this lane.
- [ ] ChatGPT web chat is the default provider workflow when selected, with Codex/other supported providers available.
- [ ] Never claim browser chat bypasses normal provider plan quotas/rate limits.
- [ ] Gather exact source/JAR/log/config/performance/dependency evidence.
- [ ] Let the user review what is sent.
- [ ] Submit inside Enderloom Browser.
- [ ] Persist conversation/task identity.
- [ ] Observe provider completion/user-action/rate-limit state.
- [ ] Collect returned JAR/ZIP/source/patch.
- [ ] Quarantine and hash.
- [ ] Build.
- [ ] Sandbox test.
- [ ] If failed, generate exact failure packet.
- [ ] Return the failure to the same conversation.
- [ ] Repeat while materially progressing.
- [ ] Install only after applicable gates pass.
- [ ] Post-install smoke the real connected instance.
- [ ] Roll back automatically on failure.
- [ ] Surface full repair history on the mod.

The AI can propose fixes. **Enderloom alone decides acceptance from real evidence.**

---

# 19. World Studio — beat standalone world tools through integration

Inspiration baseline: Amulet’s cross-edition world conversion/editing, MCA Selector’s chunk/region selection/filtering/deletion/export, and NBTExplorer’s raw NBT access. Enderloom should combine those capabilities with mod awareness, backups, diagnostics and test evidence.

## 19.1 World browser

- [ ] Java worlds.
- [ ] Bedrock worlds where supported.
- [ ] World metadata.
- [ ] version/data version.
- [ ] dimensions.
- [ ] seed.
- [ ] difficulty/gamerules.
- [ ] datapacks.
- [ ] modded registries.
- [ ] disk usage.
- [ ] player data.
- [ ] advancements/stats.
- [ ] POI/entities/block entities.
- [ ] structures/maps/saved data.
- [ ] backups/snapshots.

## 19.2 Interactive map

- [ ] zoom/pan world map.
- [ ] dimension switch.
- [ ] chunk boundaries.
- [ ] region boundaries.
- [ ] generated-age/version overlays.
- [ ] inhabited time.
- [ ] last update.
- [ ] entity/block-entity density.
- [ ] disk size.
- [ ] biome overlay.
- [ ] structure overlay.
- [ ] worldgen/mod attribution where inferable.
- [ ] performance hotspot overlay.
- [ ] corruption/error overlay.

## 19.3 Selection/filter engine

Select chunks by:

- coordinates/polygon/rectangle/radius;
- inhabited time;
- timestamp;
- status;
- biome;
- structures;
- block/entity presence;
- mod namespace;
- data version;
- size;
- generated version;
- distance from player/spawn/waypoints;
- never-visited heuristics;
- performance hotspot evidence.

Actions:

- [ ] export;
- [ ] copy;
- [ ] move;
- [ ] merge;
- [ ] delete/prune;
- [ ] regenerate;
- [ ] retrogen planning;
- [ ] reset selected dimension chunks;
- [ ] edit NBT;
- [ ] bulk transform;
- [ ] change biome;
- [ ] remove entities/block entities;
- [ ] fix known corruption patterns.

Every destructive operation creates a verified rollback snapshot by default.

## 19.4 World pruning / forever-world QOL

- [ ] One-click `Prune safely for new worldgen` wizard.
- [ ] Keep spawn/base/claimed/waypoint/player-visited zones.
- [ ] Preview reclaimed disk space.
- [ ] Preview chunk count.
- [ ] Protect dimensions independently.
- [ ] Detect worldgen mods added/removed.
- [ ] Show areas eligible for regeneration.
- [ ] Preserve structures/claims from supported mods when metadata is available.
- [ ] Transactional rewrite.
- [ ] Validate region files after operation.
- [ ] Open world copy in sandbox before replacing live save when operation is high risk.

## 19.5 NBT Studio

- [ ] Tree editor.
- [ ] Typed values.
- [ ] Hex/raw view.
- [ ] Search all tags.
- [ ] Find references/UUIDs.
- [ ] Diff two NBT trees.
- [ ] Schema-aware friendly names.
- [ ] Mod namespace hints.
- [ ] Bulk NBT transforms.
- [ ] Undo/redo.
- [ ] Validation before save.

---

# 20. World Conversion / Migration

- [ ] Java -> Bedrock where technically representable.
- [ ] Bedrock -> Java where technically representable.
- [ ] Cross-version Java world upgrades/downgrades with explicit loss analysis.
- [ ] Modded registry migration planning.
- [ ] Dimension mapping.
- [ ] Block/item/entity mapping tables.
- [ ] Unsupported content quarantine/report.
- [ ] Player/inventory/container migration.
- [ ] Structure/POI/saved data migration where possible.
- [ ] Chunk/data version transforms.
- [ ] Validate converted copy in target runtime.
- [ ] Never overwrite original by default.

---

# 21. World Repair / Forensics

- [ ] Detect malformed region chunks.
- [ ] Broken `level.dat` recovery candidates.
- [ ] Missing/duplicate UUIDs.
- [ ] Bad entity/block-entity NBT.
- [ ] Registry/remap failures.
- [ ] Removed-mod saved data.
- [ ] Stuck ticking entities/block entities.
- [ ] Runaway scheduled ticks.
- [ ] Broken datapack/worldgen references.
- [ ] Chunk load exceptions.
- [ ] World recreation/seed recovery helpers.
- [ ] Compare against backup.
- [ ] Salvage unaffected chunks.
- [ ] Build minimal reproduction world subset for debugging.
- [ ] Link culprit mod directly to mod detail/repair workflow.

---

# 22. Model / Texture / Animation Studio

Enderloom should make Blockbench-quality workflows feel integrated with the mod rather than external.

## 22.1 Blockbench interoperability

- [ ] Open/import/export `.bbmodel`.
- [ ] Launch selected asset in installed Blockbench.
- [ ] Optional embedded/integrated Blockbench-compatible editing surface where licensing/architecture permits.
- [ ] Plugin bridge for round-trip updates.
- [ ] Watch model file and refresh Enderloom preview/runtime workspace.
- [ ] Preserve project metadata, pivots, UVs, textures, animations.

Blockbench’s dedicated Java/Bedrock formats and plugin system are useful interoperability targets; do not blindly copy GPL code into incompatible proprietary components.

## 22.2 Native model formats

- [ ] Java baked/block/item models.
- [ ] Java entity model source representations.
- [ ] Bedrock geometry JSON.
- [ ] GeckoLib.
- [ ] AzureLib.
- [ ] CEM/OptiFine-style routes when legally/technically appropriate.
- [ ] ModelEngine/Mythic-style authorized server assets via conversion adapters.
- [ ] Custom armor/cosmetic/accessory models.
- [ ] Block/entity/item/furniture models.

## 22.3 Rigging

- [ ] bone hierarchy editor;
- [ ] pivots/origins;
- [ ] mirroring;
- [ ] constraints/IK helpers;
- [ ] attachment locators;
- [ ] hitbox/interaction locators;
- [ ] seats/mount points;
- [ ] item hand points;
- [ ] custom special bones;
- [ ] bind-pose validation;
- [ ] detect transform accumulation hazards.

## 22.4 Texturing

- [ ] pixel editor;
- [ ] UV editor;
- [ ] box UV/per-face UV;
- [ ] texture atlas layout;
- [ ] layers;
- [ ] palette tools;
- [ ] symmetry;
- [ ] emissive maps;
- [ ] normal/PBR-related maps where target pipeline supports them;
- [ ] animated textures;
- [ ] texture resolution conversion;
- [ ] seam/bleed detection;
- [ ] missing-pixel/transparent-island inspection;
- [ ] native Minecraft texture preview lighting.

## 22.5 Animation

- [ ] timeline/dope sheet;
- [ ] keyframes/interpolation;
- [ ] loop/hold/one-shot;
- [ ] state machine/controller graph;
- [ ] Bedrock animation-controller import;
- [ ] GeckoLib animation export;
- [ ] retargeting between rigs;
- [ ] animation blending;
- [ ] additive animation safety;
- [ ] root motion analysis;
- [ ] procedural look/head tracking;
- [ ] idle/walk/run/attack/hurt/death/sit/sleep/fly/swim presets;
- [ ] tail/ear/wing secondary-motion helpers;
- [ ] frame-by-frame parity viewer.

---

# 23. Reference Reconstruction Lab

Turn our Minecraft Dev Kit reference reconstruction work into product capability.

Input:

- [ ] user-authorized image;
- [ ] multiple views;
- [ ] GIF;
- [ ] video;
- [ ] existing model preview;
- [ ] Marketplace/MCModels public reference media for study when licensing permits reconstruction/use.

Pipeline:

- [ ] Preserve/hash references.
- [ ] Camera estimation.
- [ ] Silhouette measurements.
- [ ] Cuboid/mesh blockout.
- [ ] Pivot inference.
- [ ] UV/material inference.
- [ ] Texture back-projection/reference sampling where permitted.
- [ ] Rig proposal.
- [ ] Animation pose fitting from GIF/video.
- [ ] Coverage/confidence map for observed vs inferred surfaces.
- [ ] Side-by-side deterministic render comparison.
- [ ] Pixel/silhouette error metrics.
- [ ] Human adjustment loop.
- [ ] Native Minecraft runtime proof.

Never claim unseen surfaces were recovered exactly. Distinguish observed, inferred and artist-authored regions.

---

# 24. Visual QA Showcase

For every visual mod/asset conversion:

- [ ] deterministic QA world;
- [ ] fixed camera/lighting/weather/time;
- [ ] front/side/back/3/4 views;
- [ ] animation key poses;
- [ ] GIF/video comparison;
- [ ] texture/material checks;
- [ ] grounding/floating checks;
- [ ] clipping/intersection checks;
- [ ] culling/LOD checks;
- [ ] actual Minecraft window capture;
- [ ] state/entity count assertions;
- [ ] fresh log warnings.

Store visual evidence on the project/asset page and conversion/repair run.

---

# 25. Resource Pack / Data Pack Studio

- [ ] Resource pack browser.
- [ ] Data pack browser.
- [ ] Live namespace/tree view.
- [ ] Texture/model override graph.
- [ ] Font/sound/particle/shader assets.
- [ ] Recipes/tags/loot/functions/predicates/advancements.
- [ ] Worldgen JSON.
- [ ] Pack format/version migration.
- [ ] Conflict detection across installed packs.
- [ ] Load-order visualization.
- [ ] Merge/override preview.
- [ ] Generate compatibility pack.
- [ ] Live reload into controlled test client where safe.
- [ ] Link overrides back to owning mod/project.

---

# 26. Shader / Render Pipeline Manager

- [ ] Shader-pack discovery/install/update.
- [ ] Compatibility with Embeddium/Sodium/Iris/Oculus/etc. by target version.
- [ ] Per-instance profiles.
- [ ] Fast enable/disable test.
- [ ] Shader compilation/warmup awareness in performance tests.
- [ ] Screenshot/visual regression fixtures.
- [ ] Mod render-pipeline conflict detection.
- [ ] Show shader impact separately from mod impact.
- [ ] Keep shader state in performance fingerprints.

---

# 27. Config Intelligence

For each mod:

- [ ] Discover every associated config.
- [ ] Parse TOML/JSON/JSON5/YAML/properties/CFG and common custom formats.
- [ ] Friendly schema view when comments/defaults expose semantics.
- [ ] Raw editor always available.
- [ ] Search settings.
- [ ] Compare current/default/previous profile.
- [ ] Track provenance/user edits.
- [ ] Reset one setting/file/all with preview.
- [ ] Config profiles.
- [ ] Per-instance overrides.
- [ ] Share/export profile.
- [ ] Detect invalid values.
- [ ] Detect duplicate/conflicting settings across mods.
- [ ] Link setting changes to relevant performance/compatibility evidence.
- [ ] `Test this config change` action.
- [ ] Performance suggestions require real evidence/known semantics and a Why explanation.

---

# 28. Modpack Workbench

Beyond install/export:

- [ ] Visual dependency graph.
- [ ] Content categories.
- [ ] Client/server side split.
- [ ] Required/optional/recommended matrix.
- [ ] Lockfile/content-addressed manifest.
- [ ] packwiz interoperability.
- [ ] MRPack interoperability.
- [ ] CurseForge pack import/export where permitted.
- [ ] Reproducible build/export.
- [ ] Server pack generation.
- [ ] Changelog between pack versions.
- [ ] Delta update plan.
- [ ] Known-good baseline snapshot.
- [ ] Mod update waves with rollback.
- [ ] Compatibility test queue.
- [ ] Performance regression gate before publishing pack update.
- [ ] World migration impact report before major pack change.
- [ ] `Why is this mod here?` dependency/recommendation provenance.

---

# 29. Dependency / Update Solver

Use exact version metadata from providers such as Modrinth and CurseForge where available, plus JAR metadata and user constraints.

- [ ] Solve Minecraft version.
- [ ] Loader/version.
- [ ] Java version.
- [ ] required dependencies.
- [ ] optional dependencies.
- [ ] incompatibilities.
- [ ] embedded libraries.
- [ ] frozen versions.
- [ ] user pins.
- [ ] known compatibility patches.
- [ ] pack-level constraints.
- [ ] mod-side client/server requirements.

Planner should show:

- what changes;
- why;
- which tests become stale;
- likely world/save impact;
- configs affected;
- storage reclaimed;
- rollback plan.

---

# 30. Server Studio

Build on current server manager.

- [ ] Local servers.
- [ ] Imported/external servers.
- [ ] Loader/server software install/update.
- [ ] Console.
- [ ] players/whitelist/ops/bans.
- [ ] properties.
- [ ] server content parity with client pack.
- [ ] sync plan without blindly overwriting server-specific configs.
- [ ] scheduled backups.
- [ ] world pruning/maintenance.
- [ ] profiling.
- [ ] Spark/JFR server capture.
- [ ] synthetic protocol-bot load testing.
- [ ] crash/lockup diagnosis.
- [ ] `Fix server culprit with AI`.
- [ ] staged update/canary test server.
- [ ] rollback.
- [ ] remote server adapters only through real supported protocols/credentials.

---

# 31. Launch Doctor / Fast Launch Engine

- [ ] Measure every launch stage.
- [ ] Detect slow Java discovery.
- [ ] Slow loader resolution.
- [ ] Slow mod scanning.
- [ ] Slow class loading.
- [ ] Slow Mixin application.
- [ ] Slow resource reload.
- [ ] Slow data generation/pack reload.
- [ ] Slow world open.
- [ ] Cache immutable assets/libraries safely.
- [ ] Pre-resolve arguments/classpaths/natives.
- [ ] Reuse prepared test sandboxes.
- [ ] Compare cold/warm launch.
- [ ] Detect antivirus/indexing interference where inferable.
- [ ] Never skip required initialization and call it equivalent.

---

# 32. Crash / Log / Incident Intelligence

- [ ] Parse latest/debug/crash/launcher/native JVM logs.
- [ ] Group repeated causes.
- [ ] Map class/mod ID to project.
- [ ] Mixin conflict analysis.
- [ ] Missing dependency analysis.
- [ ] Wrong loader/version/Java analysis.
- [ ] world/registry/datafix analysis.
- [ ] native crash/hs_err analysis.
- [ ] GPU/render failure analysis.
- [ ] thread deadlock/stall clues.
- [ ] server lockup clues.
- [ ] provide evidence-based culprit confidence.
- [ ] one click opens implicated mod/source/config.
- [ ] one click starts safe repair loop.

---

# 33. File / Storage Intelligence

- [ ] Content-addressed download/cache storage.
- [ ] Deduplicate identical JARs/assets safely.
- [ ] Show storage by instance/mod/world/log/cache/snapshot.
- [ ] Reclaim previews.
- [ ] Never remove shared bytes without reference-count safety.
- [ ] Track mod-generated files.
- [ ] Track obsolete old versions.
- [ ] Keep rollback candidates per policy.
- [ ] Detect giant logs/crash loops.
- [ ] World region/chunk storage heatmaps.
- [ ] Optional safe compression/archive of old evidence/snapshots.

---

# 34. Release / Publishing Workbench

For user-owned/authorized projects:

- [ ] build all targets;
- [ ] version/changelog helper;
- [ ] source archive;
- [ ] checksums;
- [ ] SBOM/dependency manifest where useful;
- [ ] license/notice audit;
- [ ] release notes from actual diffs/tests;
- [ ] GitHub release prep;
- [ ] Modrinth release prep/API where authorized;
- [ ] CurseForge publishing only through supported authorized API/browser flow;
- [ ] multi-version asset matrix;
- [ ] attach QA evidence internally;
- [ ] never publish without explicit user action.

---

# 35. CLI / API / CI parity

Everything meaningful must be scriptable unless purely presentational.

Domains:

- instances;
- mods/content;
- browser/project research metadata;
- Bedrock inspection;
- conversions;
- ports;
- builds;
- tests;
- performance;
- repairs;
- worlds;
- NBT;
- backups;
- servers;
- models/assets;
- pack operations;
- diagnostics;
- publishing prep.

Requirements:

- [ ] stable operation IDs;
- [ ] JSON/JSONL;
- [ ] schemas/version discovery;
- [ ] dry-run/plan;
- [ ] progress events;
- [ ] cancellation;
- [ ] stable exit code families;
- [ ] no secrets in output/process args;
- [ ] generated shell completion;
- [ ] parity CI gate.

---

# 36. Extension / Adapter SDK

Minecraft changes constantly. Enderloom must not require core rewrites for every site/loader/schema.

Adapter families:

- [ ] provider adapter;
- [ ] browser provider adapter;
- [ ] loader adapter;
- [ ] Minecraft version adapter;
- [ ] Bedrock schema adapter;
- [ ] conversion semantic adapter;
- [ ] model/animation runtime adapter;
- [ ] world format adapter;
- [ ] profiler adapter;
- [ ] server adapter;
- [ ] AI repair provider adapter.

SDK requirements:

- capability declarations;
- version bounds;
- typed inputs/outputs;
- sandbox/security model;
- diagnostics;
- test fixtures;
- compatibility contract;
- migration/versioning.

---

# 37. Enderloom itself must be absurdly fast

- [ ] Renderer never does blocking filesystem/network work.
- [ ] Rust/native domain service owns heavy local work.
- [ ] Worker pools for CPU parsing/decompilation/indexing.
- [ ] Incremental filesystem watcher instead of rescans.
- [ ] Content hashes avoid repeated analysis.
- [ ] Single-flight provider/network requests.
- [ ] Virtualized huge tables/grids without hiding data.
- [ ] Streaming results.
- [ ] Prioritize visible/interactive work.
- [ ] Background enrichment does not block first useful paint.
- [ ] Bounded caches with transparent reclaim.
- [ ] Reuse persistent Chromium connections/cache/session.
- [ ] Avoid huge monolithic renderer state copies.
- [ ] Database indexes for project/hash/instance/evidence lookups.
- [ ] Benchmark 1k/5k/10k-content synthetic instances and huge catalogs.
- [ ] Benchmark world scans on very large saves.
- [ ] Benchmark source indexing on large mods.
- [ ] Performance regression gate for Enderloom releases.

---

# 38. Micro-QOL saturation pass

Every completed feature receives a deliberate QOL challenge.

Global:

- [ ] undo where meaningful;
- [ ] redo where meaningful;
- [ ] keyboard shortcuts;
- [ ] command palette;
- [ ] context menus;
- [ ] multi-select;
- [ ] drag/drop;
- [ ] copy ID/hash/path/link;
- [ ] open folder;
- [ ] reveal in browser;
- [ ] search/filter/sort;
- [ ] saved filters/views;
- [ ] recent items;
- [ ] favorites/pins;
- [ ] breadcrumbs;
- [ ] Split view;
- [ ] back/forward history;
- [ ] per-workspace remembered layout;
- [ ] tooltips with real semantics;
- [ ] `Why?` for decisions;
- [ ] progress/cancel/resume;
- [ ] error -> next useful action;
- [ ] no modal spam;
- [ ] no mystery background jobs;
- [ ] one-click common path with advanced drill-down;
- [ ] compare-before-apply for destructive/complex changes.

Specific delight:

- [ ] Hover mod -> preview media/video + current version/performance/compatibility.
- [ ] Ctrl/Shift multi-select and bulk install/test/update.
- [ ] Middle-click project opens background Browser tab.
- [ ] Drag a JAR onto instance to install/inspect.
- [ ] Drag an `.mcaddon` to begin Bedrock inspection/conversion.
- [ ] Drag a world to import/inspect.
- [ ] Drag a `.bbmodel` onto a mod to attach asset workspace.
- [ ] Drag returned AI download onto active repair job.
- [ ] `Copy for AI` produces exact compact evidence prompt.
- [ ] `Test what changed` automatically selects invalidated gates.
- [ ] `Revert last modpack change` uses recorded transaction.
- [ ] `Find what added this` for files/configs/recipes/resources.
- [ ] `Find mod that owns this block/entity/item` from IDs/NBT/logs.

---

# 39. Safety / preservation rules

- [ ] Live user instances are never automated-test sandboxes.
- [ ] Live worlds are never destructive-operation scratch space.
- [ ] Snapshot before dangerous world/content mutations.
- [ ] Atomic/staged replacement.
- [ ] Rollback records.
- [ ] Hash verification.
- [ ] Junction/symlink traversal safety.
- [ ] Zip-slip/archive traversal safety.
- [ ] No secret leakage.
- [ ] No fake provider success.
- [ ] No browser credential extraction.
- [ ] No paywall/DRM/access-control bypass.
- [ ] No automatic publishing.
- [ ] No AI-returned binary installed before validation.
- [ ] No content deletion to fake successful ports/performance.
- [ ] No unsupported performance claims.
- [ ] Preserve source attribution/licenses/notices.

---

# 40. Ecosystem capability benchmarks

Enderloom should regularly benchmark itself against the strongest relevant tools and absorb ideas lawfully rather than becoming a shallow clone.

Reference categories:

- Prism Launcher — instance/launcher management.
- packwiz — git-friendly reproducible pack metadata/distribution.
- Stonecutter — multiversion source organization.
- Blockbench — Minecraft model/texture/animation authoring and plugin ecosystem.
- Amulet — cross-version/edition world editing/conversion.
- MCA Selector — chunk/region selection, filters, deletion/export/editing.
- NBTExplorer — broad raw NBT inspection/editing.
- spark — Minecraft profiling.
- Observable — spatial world/entity/tick diagnostics.
- HeadlessMC / runtime-test style projects — Minecraft automation/CI inspiration.
- Modrinth/CurseForge — provider metadata/version/dependency ecosystems.

Rules:

- [ ] Track capability matrix, not marketing claims.
- [ ] License-review every code-integration candidate.
- [ ] Independently reimplement concepts when licenses/commercial terms require it.
- [ ] Enderloom wins through integration, evidence, automation, safety and QOL rather than copying UI.

---

# 41. Verification contract

Every meaningful implementation slice must prove itself.

Static:

- [ ] format/lint/type checks;
- [ ] unit tests;
- [ ] property tests for parsers/converters where useful;
- [ ] fuzz archive/NBT/manifest parsers;
- [ ] DB migration tests;
- [ ] security/path traversal tests.

Integration:

- [ ] real service/domain call;
- [ ] real filesystem transaction;
- [ ] provider fixture/live-safe check where applicable;
- [ ] browser adapter fixture;
- [ ] CLI parity.

Minecraft:

- [ ] build artifact fresh-code proof;
- [ ] dedicated server when affected;
- [ ] native client/integrated server when affected;
- [ ] deterministic scenario;
- [ ] restart/persistence when affected;
- [ ] fresh logs.

Conversion/port:

- [ ] source content inventory;
- [ ] target content inventory;
- [ ] semantic coverage report;
- [ ] unresolved gap report;
- [ ] runtime behavior checks;
- [ ] visual checks;
- [ ] compatibility checks;
- [ ] performance sanity.

World:

- [ ] operate on copy/snapshot;
- [ ] integrity validation;
- [ ] target runtime open test when meaningful;
- [ ] rollback proof.

---

# 42. Golden acceptance fixtures

Maintain small, legal/owned/open fixtures that deliberately exercise the hardest paths.

- [ ] Java Forge mod with registries/config/network/render/server logic.
- [ ] Fabric equivalent.
- [ ] NeoForge equivalent.
- [ ] multiversion Stonecutter-style project.
- [ ] Bedrock add-on with items/blocks/entities/recipes/loot/spawn/models/animations/scripts.
- [ ] Bedrock add-on with behavior/resource dependency pair.
- [ ] broken Mixin mod.
- [ ] dedicated-server client-class crash mod.
- [ ] deliberate render-thread performance offender.
- [ ] deliberate server tick offender.
- [ ] allocation offender.
- [ ] mod interaction offender.
- [ ] world with corrupt chunk/entity fixture.
- [ ] huge synthetic world for prune/index benchmarks.
- [ ] model/animation fixture with known ground/clipping/transform faults.
- [ ] AI repair loop broken->fixed fixture.

The user-provided Marketplace PDP can remain a **research/browser identity fixture**; use owned/open source bytes for automated conversion tests unless explicit authorized source is supplied.

---

# 43. Implementation program — Codex waves

Do not attempt one giant rewrite. Implement vertical slices that immediately become shared infrastructure.

## Wave A — Integration Spine

- [ ] Canonical graph entities/IDs.
- [ ] Evidence/staleness model.
- [ ] Durable task engine.
- [ ] Transaction/rollback primitives.
- [ ] Shared capability registry/CLI parity foundation already required by the master contract.
- [ ] Universal project detail data model.

Acceptance: an installed mod has one canonical detail object consumed by Mod Manager, Catalog, CLI and Testing placeholder/data path without duplicate truth.

## Wave B — Universal Mod Surface + Context Power

- [ ] Right-click source submenus.
- [ ] configs/files association.
- [ ] source repository identity.
- [ ] media/video preview model.
- [ ] performance badge projection.
- [ ] repair/port/conversion actions.

Acceptance: right-click one real installed mod and exercise every action that is advertised.

## Wave C — Performance Lab foundation

Continue issue #1 exact plan rather than restarting it:

- CLI-0;
- test schema/history;
- fingerprint;
- sandbox;
- Quick Scan;
- JFR;
- direct A/B;
- Probe;
- profiler adapters.

Acceptance: measured results appear directly back on the real mod surface.

## Wave D — Autonomous Repair Loop

Follow `AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md`:

- RepairJob model;
- evidence bundle;
- candidate quarantine;
- build/test integration;
- browser provider adapter;
- ChatGPT web adapter;
- retry packet;
- transactional install/rollback.

Acceptance: broken fixture completes real closed-loop repair and post-install verification.

## Wave E — Bedrock Studio Parser

- pack import;
- manifest/dependency graph;
- full content inventory;
- resource/behavior links;
- model/animation preview;
- script inventory;
- validation.

Acceptance: comprehensive open Bedrock fixture is parsed with zero unknown files/references except explicitly unsupported documented categories.

## Wave F — UMIR + First Bedrock->Java vertical conversion

Choose one rich owned fixture and implement complete conversion to one target (for example Forge 1.20.1) before generalizing.

Acceptance: content inventory + gameplay + assets + server/client runtime prove the conversion.

## Wave G — Version/Loader Port Engine

- vanilla feature atlas;
- loader adapter interfaces;
- target scaffold;
- semantic API translation;
- Stonecutter/multiversion workspace.

Acceptance: one nontrivial mod builds/tests across at least several target versions/loaders from one project lineage.

## Wave H — World Studio core

- world index;
- map/regions;
- filters;
- safe prune/export;
- NBT editor;
- snapshots/transaction.

Acceptance: large-world select/prune workflow beats manual external-tool handoff while preserving rollback.

## Wave I — Asset Studio + Reference Reconstruction

- `.bbmodel` round trip;
- geometry/UV/texture/animation views;
- rig validation;
- deterministic renderer;
- native Minecraft visual QA.

Acceptance: known reference fixture passes multi-view/multi-frame parity and runtime checks.

## Wave J — Cross-system intelligence

- world hotspots -> mods;
- performance -> repair;
- update -> stale evidence;
- conversion -> repair loop;
- config -> test invalidation;
- compatibility -> patch workflow;
- pack publish -> regression gate.

Acceptance: integration QA can demonstrate these chains end-to-end.

## Wave K — Ecosystem parity/challenge pass

Audit Enderloom against the external capability matrix and fill material gaps.

Acceptance: no major standalone Minecraft workflow category remains materially better solely because Enderloom omitted the functionality; any intentional exclusions have explicit technical/legal rationale.

---

# 44. Exact Codex handoff rules

Codex should receive this document together with:

- `docs/ENDERLOOM_MASTER_REQUIREMENTS.md`
- `docs/PREMIUM_TESTING_LAB_SPEC.md`
- `docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md`
- `docs/CODEX_HANDOFF_PREMIUM_TESTING_CLI.md`
- `docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md`
- current release evidence

Rules:

- [ ] Do not restart solved research.
- [ ] Preserve existing accepted Catalog/Browser/Launcher behavior.
- [ ] Preserve issue #1’s exact Performance Lab continuity.
- [ ] Do not build disconnected mockup tabs.
- [ ] Implement shared domain infrastructure first.
- [ ] Cross into real implementation once target/edit set is known.
- [ ] Targeted tests during iteration; broad tests at convergence.
- [ ] Fresh runnable build after implementation changes.
- [ ] Exercise actual built Enderloom, not only unit tests.
- [ ] Checkpoint coherent source progress.
- [ ] Update acceptance checkboxes only from evidence.
- [ ] Do not weaken requirements to make progress look green.

---

# 45. Definition of done — ultimate Enderloom

Enderloom reaches this north-star only when:

- [ ] Java and Bedrock content are both first-class inspectable project types.
- [ ] Provider/browser/research, install state, source, performance, configs, compatibility, worlds, assets, conversion and repair share one graph.
- [ ] Bedrock conversion produces real native Java mods with explicit semantic coverage and runtime proof.
- [ ] Java mods can be ported across supported versions/loaders through a reproducible multiversion workflow.
- [ ] Performance evidence is visible directly on mods and everywhere it changes decisions.
- [ ] ChatGPT/Codex browser repair can run closed-loop inside Enderloom without a separate API key for the default web-chat lane, while respecting provider limits.
- [ ] Failed AI candidates never touch the live instance.
- [ ] World editing/pruning/NBT/repair/conversion are safe, visual, reversible and mod-aware.
- [ ] Model/texture/animation workflows support professional Minecraft asset production and reference parity QA.
- [ ] Every destructive action has a plan, preview and rollback path.
- [ ] Every recommendation can explain why.
- [ ] Every measured claim links to raw evidence.
- [ ] Every meaningful operation is shared between GUI and CLI/CI or has a justified visual-only exception.
- [ ] Enderloom remains fast on huge packs/catalogs/worlds.
- [ ] No dead buttons, fake integrations, fake progress, fake success or silent content loss.
- [ ] The final user experience feels simpler than the collection of tools it replaces despite being dramatically more capable.

---

# 46. Final product philosophy

The app should feel almost unfairly capable, but never magical in the dishonest sense.

The magic comes from **integration**:

- the browser knows the project;
- the project knows the installed artifact;
- the artifact knows its source/hash;
- the source knows its versions/loaders;
- testing knows the exact artifact/config/world;
- performance knows the culprit;
- repair knows the evidence;
- the AI conversation knows the failed gate;
- the returned candidate goes back through the same test engine;
- the world knows which mod owns its content;
- the asset knows which runtime build renders it;
- conversion knows every semantic gap;
- release knows exactly what was proven.

That is how Enderloom becomes better than “another launcher,” “another world editor,” “another mod manager,” “another profiler,” or “another converter.” It becomes the **Minecraft workbench that connects all of those jobs into one continuous, evidence-driven workflow.**
