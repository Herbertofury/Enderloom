# Enderloom — Exhaustive Gap Audit Addendum — 2026-09-07

**Status:** Mandatory expansion supplement / Codex contract  
**Repository:** `Herbertofury/Enderloom`  
**Branch:** `main`  
**Parent expansion:** `docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md`  
**Autonomous repair:** `docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md`  

This document exists because an independent challenge pass against the current Enderloom backlog and the strongest current Minecraft creation, launcher, world-editing, profiling, server, conversion, security and collaboration ecosystems found material capability families that were not explicit enough in the original expansion backlog.

**These are not optional “maybe later” ideas.** They are requirements to consider in the same shared Enderloom domain/evidence architecture. Where a capability is technically, legally or platform-limited, Enderloom must model that limit truthfully rather than omit the whole domain.

The existing Integration Law still dominates everything:

> **No feature islands. No shadow databases. No duplicated truth.**

Every capability below must consume and update the same canonical project/artifact/config/world/test/evidence graph wherever applicable.

---

# 1. Gap-audit methodology

The audit compared the current Enderloom contracts against current capability families represented by:

- Microsoft/Mojang Bedrock Developer Tools, Creator Tools, Script Debugger, Script Profiler, Diagnostics, Debug Utilities, Bedrock Editor and Editor Extensions;
- Blockbench and Minecraft-focused model/texture/animation workflows;
- MCreator and bridge.-style visual mod/add-on authoring;
- Axiom, WorldEdit, Litematica, Amulet, MCA Selector and NBT-oriented world/build tooling;
- Misode/MCStacker-style command, datapack, resource-pack and worldgen generators;
- Fabric Loom, NeoForge ModDevGradle, mappings and production-remap workflows;
- Sinytra Connector-style cross-loader compatibility and automated compatibility testing;
- Paper/Folia/Velocity, Geyser/Floodgate, ViaVersion and packet/protocol tooling;
- Modrinth shared-instance collaboration and mature launcher workflows;
- Minecraft mod malware/static-analysis concepts and provider malware scanning;
- the Minecraft Dev Kit’s strongest native-runtime, conversion, model/animation and release-proof requirements.

Research was refreshed on 2026-09-07. External projects are capability references, not blanket permission to copy code; license review remains mandatory.

---

# 2. Security & Supply-Chain Center — missing critical layer

Enderloom manages executable third-party content and AI-returned binaries. Security cannot be a warning dialog bolted on later.

## 2.1 Local static artifact scanner

For mods, plugins, loaders, launch agents, native libraries and AI repair candidates:

- [ ] SHA-256 and content identity before any execution.
- [ ] Archive structure and path-traversal validation.
- [ ] Manifest/metadata validation.
- [ ] Detect executable/native payloads (`.dll`, `.so`, `.dylib`, bundled executables, agents).
- [ ] Detect process execution / shell / Runtime / ProcessBuilder capability.
- [ ] Detect filesystem read/write/delete capability families.
- [ ] Detect broad home/profile/browser/session/Discord/token path access patterns.
- [ ] Detect network/client/server/socket/HTTP capability families.
- [ ] Detect dynamic class loading, reflection, Unsafe, instrumentation and agent attachment.
- [ ] Detect native loading/JNI/JNA.
- [ ] Detect persistence/autostart/task-scheduler/registry-style behavior where applicable.
- [ ] Detect clipboard/screen/input-hook capability where present.
- [ ] Detect suspicious string reconstruction/packing/obfuscation patterns.
- [ ] Detect embedded scripts/macros/binaries.
- [ ] Explain findings by exact class/method/resource rather than a black-box “AI says malware”.

## 2.2 Threat intelligence and provenance

- [ ] Optional known-malicious hash/signature feeds with source + freshness timestamp.
- [ ] Provider malware-scan state when the provider exposes a trustworthy result.
- [ ] Project/provider identity verification.
- [ ] Download URL/final-origin verification.
- [ ] Release hash comparison where publisher publishes hashes.
- [ ] Signed artifact/signature verification when the ecosystem supports it.
- [ ] Source-release-to-binary reproducibility check where feasible.
- [ ] Compare artifact byte identity across CurseForge/Modrinth/GitHub mirrors.
- [ ] Quarantine provider/project identity mismatches.

## 2.3 Update capability diff

Before updating a mod/plugin:

- [ ] Compare old/new bytecode capability surface.
- [ ] Highlight newly introduced native code.
- [ ] Highlight newly introduced network endpoints/domains.
- [ ] Highlight newly introduced filesystem/process/reflection/agent access.
- [ ] Highlight dramatic obfuscation/packing changes.
- [ ] Highlight bundled-library changes.
- [ ] Show “What new capability did this update gain?” beside normal changelog.

## 2.4 Dependency/SBOM/license risk

- [ ] Generate embedded dependency/SBOM inventory.
- [ ] Detect duplicate/conflicting library versions across a pack.
- [ ] CVE advisory lookup where trustworthy data exists.
- [ ] License/redistribution policy inventory.
- [ ] Flag incompatible pack redistribution permissions before export/publish.
- [ ] Preserve notices/licenses when patching/converting.

## 2.5 Sandbox policy

- [ ] Security-risk artifacts run only in Enderloom-owned test sandboxes until trusted.
- [ ] AI-returned artifacts always enter this lane.
- [ ] Never claim “safe” from static analysis alone; use explainable risk levels and provenance.
- [ ] Security results appear on mod detail, install/update planner, AI repair job and pack export.

---

# 3. Bedrock Developer Center — full creator/debugger parity

The original Bedrock Studio covered content parsing and conversion but not enough of the official development loop.

## 3.1 Creator project management

- [ ] Create Bedrock add-on project from templates.
- [ ] Import existing behavior/resource packs.
- [ ] Multi-pack workspace.
- [ ] Exact Retail/Preview target version.
- [ ] Exact `@minecraft/server`, `@minecraft/server-ui`, editor/debug package versions.
- [ ] Experiments/feature flags manifest management.
- [ ] Validate dependency UUID/version relationships.
- [ ] Deterministic package `.mcaddon` / `.mcpack` / `.mcworld`.
- [ ] Deploy to development behavior/resource pack directories.
- [ ] Local Bedrock Dedicated Server test deployment.
- [ ] Test-world creation/reset/snapshot.
- [ ] Version-aware schema validation.
- [ ] “No unknown files” pack audit.

## 3.2 Bedrock Script IDE/debugger

- [ ] TypeScript/JavaScript project support.
- [ ] Mojang API typings/intellisense.
- [ ] Breakpoints.
- [ ] Step in/over/out.
- [ ] Call stack.
- [ ] Variables/watch expressions.
- [ ] Exception/break-on-error controls.
- [ ] Runtime attach to supported Bedrock dev/debug session.
- [ ] Content Log streaming/filtering.
- [ ] Source-map-aware debugging.
- [ ] `/script debugger` workflow where supported.

## 3.3 Script performance / diagnostics

- [ ] Start/stop Script Profiler.
- [ ] Import/inspect `.cpuprofile` output.
- [ ] Timeline/flame/call-tree view.
- [ ] Identify expensive callbacks/ticks/scripts.
- [ ] Diagnostics capture.
- [ ] Runtime/plugin statistics when supported.
- [ ] Debug Utilities visualization (lines/boxes/spheres/etc.) where supported.
- [ ] Performance results join the same Enderloom Performance evidence model.

## 3.4 Bedrock Editor integration

- [ ] Create/open Editor projects.
- [ ] Recognize Editor-mode BDS/project layout.
- [ ] Surface Selection/Brush/Extrude/Farm/Fill/Biome/Terrain/Summon-style tool concepts.
- [ ] Block Inspector.
- [ ] Entity Inspector.
- [ ] Structures panel.
- [ ] Workbench/task integration.
- [ ] Editor Extension project creation.
- [ ] Editor Extension debugging/test deployment.
- [ ] Editor extension capability/version matrix.
- [ ] Round-trip world edits without losing pack metadata.

## 3.5 Creator Tools interoperability

- [ ] Interoperate with official Creator Tools CLI/project conventions where useful.
- [ ] Project validation/analytics import.
- [ ] Model/block/mob/item render output import/export.
- [ ] Test-world/server deployment handoff.
- [ ] Package output adoption.
- [ ] Do not duplicate official tool behavior blindly where invoking/interop is more robust.

---

# 4. Enderloom Developer IDE — actual coding workbench

Source Workbench/JAR Lab is not enough. Enderloom needs a real developer surface for the code it generates, ports and repairs.

## 4.1 Editors/languages

- [ ] Java.
- [ ] Kotlin.
- [ ] Groovy/Kotlin Gradle scripts.
- [ ] TypeScript/JavaScript.
- [ ] JSON/JSON5/JSONC.
- [ ] TOML/YAML/properties.
- [ ] Molang.
- [ ] `.mcfunction`.
- [ ] SNBT/NBT-friendly textual views.
- [ ] GLSL/shader text where applicable.

## 4.2 Language intelligence

- [ ] LSP/compiler-backed diagnostics.
- [ ] Completion.
- [ ] Hover/type docs.
- [ ] Go to definition.
- [ ] Find references.
- [ ] Rename/refactor.
- [ ] Symbol outline.
- [ ] Workspace/global search.
- [ ] Code actions/quick fixes.
- [ ] Problems panel.
- [ ] Javadoc/source attachment.
- [ ] Minecraft registry/resource-location completion from active target.
- [ ] Dependency symbol navigation.

## 4.3 Build/task/terminal

- [ ] Integrated Gradle/Maven task graph.
- [ ] Exact JDK selection.
- [ ] Gradle wrapper/task run.
- [ ] Test filtering.
- [ ] Dev client/server run configs.
- [ ] Production-remap/package run configs.
- [ ] Integrated terminal with visible working directory/environment.
- [ ] Task cancellation and logs.
- [ ] Generated code/resource diff after task.

## 4.4 Git/source control

- [ ] Git status/diff/stage/commit.
- [ ] Branch/worktree support.
- [ ] Merge/rebase/conflict UI.
- [ ] GitHub issue/PR navigation.
- [ ] Create patch from selected changes.
- [ ] Apply/revert selected hunks safely.
- [ ] Compare current mod source to upstream release/tag.
- [ ] Repair/port/conversion branches linked to provenance graph.

---

# 5. Mapping / Remap / Mixin / Bytecode Lab

“Any version” and cross-loader development require mappings to be a first-class product domain.

## 5.1 Mapping atlas

- [ ] Mojang/Mojmap mappings.
- [ ] Yarn.
- [ ] Intermediary.
- [ ] Parchment.
- [ ] NeoForm/NeoForge naming where applicable.
- [ ] SRG/TSRG/official obfuscated names.
- [ ] MCP legacy mappings.
- [ ] Loader/game-version-aware crosswalk.
- [ ] Class/method/field signature search.
- [ ] Compare member names across versions.
- [ ] Copy symbol in selected namespace.
- [ ] Historical mapping provenance/version.

## 5.2 Remap pipeline

- [ ] Deobfuscate/remap JARs for inspection.
- [ ] Remap source references where safe.
- [ ] Reobfuscate/package production artifacts.
- [ ] Remap access wideners/transformers/Mixins/refmaps.
- [ ] Detect namespace mismatches.
- [ ] Production-linkage gate after mapped-dev success.

## 5.3 Mixin visualizer

- [ ] List every Mixin by owning mod.
- [ ] Target class/method graph.
- [ ] Injection type/at/ordinal/slice/locals.
- [ ] Priority/order.
- [ ] Competing injections on same target.
- [ ] Overwrite conflicts.
- [ ] Redirect/ModifyArg/ModifyVariable interactions.
- [ ] Failed/zero-target injection evidence from logs.
- [ ] Jump to mod/source/class.
- [ ] Compare Mixin surfaces between mod versions.
- [ ] Feed conflict evidence to Compatibility Lab and AI repair.

## 5.4 Transformers/access tooling

- [ ] Forge coremods/transformers.
- [ ] Access Transformers.
- [ ] Fabric Access Wideners.
- [ ] class tweakers/agents where present.
- [ ] bytecode before/after view where possible.
- [ ] never execute transformers merely to inspect metadata unless isolated and required.

---

# 6. Visual Gameplay Authoring / Logic Graph Studio

Enderloom should not only repair and convert mods; it should let users author serious native Minecraft gameplay without forcing every operation into raw source code.

The quality target is MCreator-like accessibility **without** black-box generated-code lock-in.

## 6.1 Native mod elements

Visual authoring templates for:

- [ ] blocks;
- [ ] items;
- [ ] tools/weapons;
- [ ] armor;
- [ ] fluids;
- [ ] plants/crops;
- [ ] entities/mobs;
- [ ] projectiles;
- [ ] particles;
- [ ] sounds/music;
- [ ] effects;
- [ ] attributes;
- [ ] enchantments;
- [ ] recipes;
- [ ] loot tables;
- [ ] tags;
- [ ] advancements;
- [ ] villager professions/trades;
- [ ] commands;
- [ ] gamerules;
- [ ] keybindings;
- [ ] dimensions/biomes/worldgen;
- [ ] structures;
- [ ] paintings/banner/decorative content;
- [ ] menus/screens/HUD overlays;
- [ ] containers/machines;
- [ ] energy/capability/component systems;
- [ ] accessories/Curios/Trinkets-style slots;
- [ ] mounts/vehicles;
- [ ] bosses/minibosses.

## 6.2 Procedure/event graph

- [ ] Visual nodes for lifecycle/events/conditions/actions.
- [ ] Typed ports.
- [ ] Variables/local/global/player/world/entity persistence.
- [ ] Loops/functions/subgraphs.
- [ ] Server/client side semantics shown explicitly.
- [ ] Network sync nodes where needed.
- [ ] Compile-time validation.
- [ ] Generated source is always visible and editable.
- [ ] Round-trip model preserves manual code regions.
- [ ] Explain generated API usage.
- [ ] Version/loader adapters choose native API equivalents.

## 6.3 AI/behavior authoring

- [ ] Goal/brain behavior graph.
- [ ] Target selectors.
- [ ] Sensors/memories.
- [ ] State machines.
- [ ] Combat attacks/telegraphs/cooldowns.
- [ ] Navigation/movement modes.
- [ ] Summons/phases/enrage.
- [ ] Loot/reward conditions.
- [ ] Animation/sound/particle event hooks.
- [ ] Multiplayer/server-authoritative validation.

## 6.4 Dungeon/structure gameplay authoring

- [ ] Modular structure pieces.
- [ ] Room connection graph.
- [ ] Pools/weights/conditions.
- [ ] Loot zones.
- [ ] Traps.
- [ ] Spawners.
- [ ] Miniboss/boss rooms.
- [ ] Keys/locks/progression gates.
- [ ] Environment triggers.
- [ ] Preview placement in deterministic QA world.

---

# 7. Command / Data / Worldgen Generator Studio

Enderloom should absorb the best Misode/MCStacker-style workflows into version-aware native project editing.

## 7.1 Command builder

- [ ] Version-aware command AST.
- [ ] Syntax highlighting/validation/completion.
- [ ] Selectors and selector predicates.
- [ ] NBT/SNBT editor.
- [ ] Modern item/data components.
- [ ] `/give`, `/summon`, `/execute`, `/data`, `/item`, `/attribute`, `/particle`, `/playsound`, `/title`, `/tellraw`, etc.
- [ ] Generate command from selected in-game entity/block/item where Probe supports it.
- [ ] Preview command effects in isolated QA world.

## 7.2 Datapack/resource generators

- [ ] recipes;
- [ ] loot tables;
- [ ] predicates;
- [ ] advancements;
- [ ] tags;
- [ ] functions;
- [ ] item modifiers;
- [ ] damage types;
- [ ] enchantment definitions/effects;
- [ ] chat types;
- [ ] trim materials/patterns;
- [ ] wolf/painting/instrument/jukebox/etc. registries as versions evolve;
- [ ] model/item definitions;
- [ ] atlas/font/sound metadata;
- [ ] every supported data/resource schema generated from a versioned schema registry rather than hardcoded forms.

## 7.3 Worldgen lab

- [ ] noise settings;
- [ ] density functions;
- [ ] configured/placed features;
- [ ] carvers;
- [ ] biomes;
- [ ] dimensions/dimension types;
- [ ] structures;
- [ ] structure sets;
- [ ] template pools;
- [ ] processors;
- [ ] flat/custom worlds;
- [ ] live graph/preview where technically meaningful;
- [ ] schema migration/diff across versions;
- [ ] modded registry-schema extension support.

## 7.4 Specialized utilities

- [ ] Sound browser/mixer.
- [ ] Display entity transform preview/editor.
- [ ] Template/structure placer.
- [ ] Worldgen performance-report inspector.
- [ ] JSON compact/pretty/schema explanation.
- [ ] “Convert this generator to target version” with exact diff/gap report.

---

# 8. 3D Build / Schematic / Blueprint Studio

World Studio needs a creative building layer, not only chunk administration.

## 8.1 Live 3D editing

Axiom/WorldEdit-grade concepts inside an Enderloom-owned editor/test context:

- [ ] Selection box/freehand/polygon/radius tools.
- [ ] Move/copy/clone/rotate/mirror/scale where valid.
- [ ] Fill/replace.
- [ ] Masks/filters.
- [ ] Brush system.
- [ ] Painter.
- [ ] Noise.
- [ ] Biome painting.
- [ ] Terrain sculpt.
- [ ] Raise/lower/elevation.
- [ ] Flatten/slope/smooth.
- [ ] Melt/weld.
- [ ] Distort/roughen/shatter.
- [ ] Extrude.
- [ ] Rock/blob generation.
- [ ] No-update placement mode with explicit warning.
- [ ] Trigger/update/tick selected region.
- [ ] Fix/recalculate lighting/data where safe.
- [ ] Undo/redo history backed by world transactions.

## 8.2 Schematic formats

- [ ] Litematica `.litematic`.
- [ ] Sponge `.schem`.
- [ ] legacy `.schematic`.
- [ ] vanilla structure NBT.
- [ ] Bedrock `.mcstructure` where feasible.
- [ ] WorldEdit clipboard formats where documented/authorized.
- [ ] cross-version/edition block translation report.

## 8.3 Litematica-style construction assistance

- [ ] Holographic placement preview in real client.
- [ ] Material list.
- [ ] Missing/extra/wrong-block verifier.
- [ ] Layer/slice modes.
- [ ] Placement transforms.
- [ ] Block-state comparison.
- [ ] Ignore/normalize categories where user chooses.
- [ ] Construction progress.
- [ ] Link required modded blocks to owning mod and install dependency.

## 8.4 Blueprint library

- [ ] Tags/collections/search/thumbnails.
- [ ] Source/author/license provenance.
- [ ] Used-in-world backlinks.
- [ ] Version compatibility.
- [ ] share/export package with required mods/materials.

---

# 9. Particle / Audio / UI / Font / Material Studio

These asset domains were too implicit in the original model/texture/animation section.

## 9.1 Particle editor

- [ ] Snowstorm-style live 3D Bedrock particle preview.
- [ ] Java particle authoring/runtime adapters.
- [ ] emitter shape/rate/lifetime.
- [ ] curves/gradients/colors/UV animation.
- [ ] collision/physics where target supports it.
- [ ] Molang editing/completion/evaluation.
- [ ] event hookups.
- [ ] performance budget/particle-count warning.
- [ ] native runtime capture.

## 9.2 Audio studio

- [ ] Sound event registry browser.
- [ ] Waveform preview.
- [ ] Loop/cue metadata.
- [ ] Positional/spatial preview.
- [ ] Attenuation/distance settings where available.
- [ ] Subtitle/localization linkage.
- [ ] Music/event configuration.
- [ ] Missing/orphan sound detection.
- [ ] Compare Java/Bedrock sound mappings in conversion.

## 9.3 UI/HUD/forms

- [ ] Java screen/menu designer.
- [ ] HUD/overlay designer.
- [ ] Bedrock forms/UI definitions where supported.
- [ ] Inventory/container slot layout.
- [ ] Buttons/text/scroll/lists/tooltips.
- [ ] keyboard/controller navigation.
- [ ] scaling/resolution QA.
- [ ] localization preview.
- [ ] accessibility labels/contrast.
- [ ] native client interaction test via Probe.

## 9.4 Fonts/glyphs

- [ ] bitmap/TTF/provider configuration.
- [ ] glyph map preview.
- [ ] missing-codepoint detection.
- [ ] Unicode/localization coverage.
- [ ] font conflict analysis across resource packs.

## 9.5 Modern material pipelines

- [ ] Bedrock Vibrant Visuals/PBR-related material handling where supported.
- [ ] Java emissive/PBR/shader-resource conventions where applicable.
- [ ] normal/emissive/metallic/roughness-style maps by target pipeline.
- [ ] material compatibility matrix.
- [ ] do not claim ray-traced/physical equivalence where target pipeline differs.

---

# 10. Registry / Recipe / Content Explorer

Enderloom should be able to answer “what is this, who owns it, and where does it come from?” for an actual running instance.

- [ ] Enumerate every registered item/block/entity/fluid/effect/enchantment/biome/dimension/structure/etc.
- [ ] Registry IDs and owning mod.
- [ ] Item tags/block tags/entity tags.
- [ ] Recipes and uses.
- [ ] Loot sources.
- [ ] Mob spawn sources/biomes/rules.
- [ ] Trades.
- [ ] Advancements.
- [ ] Commands/keybindings.
- [ ] Resource/model/texture association.
- [ ] Config knobs associated with content where known.
- [ ] “Who owns this?” from ID, log line, NBT, world selection, recipe or screenshot-assisted selected runtime object.
- [ ] Compare registry/content inventory across mod versions.
- [ ] Compare source Bedrock pack vs converted Java target inventory.
- [ ] Generate a museum/QA world that lays out/spawns every testable content type.
- [ ] Content inventory becomes a release/port/conversion regression gate.

---

# 11. Full Plugin / Proxy / Server Ecosystem

The original Server Studio focused Minecraft server operation, but not enough on plugin development/management and modern proxy ecosystems.

## 11.1 Platforms

- [ ] Bukkit/Spigot.
- [ ] Paper.
- [ ] Purpur.
- [ ] Folia.
- [ ] Sponge where applicable.
- [ ] Velocity.
- [ ] BungeeCord/Waterfall legacy support where applicable.

## 11.2 Plugin manager/developer workbench

- [ ] Discover/install/update plugins.
- [ ] Source/project/provider identity.
- [ ] `plugin.yml` / `paper-plugin.yml` / Velocity metadata inspection.
- [ ] Dependencies/soft dependencies.
- [ ] Commands/permissions.
- [ ] Event-listener inventory.
- [ ] Config/editor.
- [ ] Native test server.
- [ ] JAR/source patch workbench.
- [ ] Version/API porting.
- [ ] Authorized plugin->native-mod conversion where semantics allow.
- [ ] Native-mod->plugin compatibility helper when user explicitly targets plugin ecosystem.

## 11.3 Folia/threading correctness

- [ ] Detect global-main-thread assumptions.
- [ ] Region/entity/global scheduler usage.
- [ ] Unsafe cross-region entity/world access heuristics.
- [ ] Folia compatibility test lane.
- [ ] Do not mark Paper compatibility as Folia compatibility automatically.

## 11.4 Proxy topology

- [ ] Visual network of proxy/backends.
- [ ] Player forwarding/security mode.
- [ ] Plugin-message channels.
- [ ] Backend compatibility.
- [ ] Multi-server config deployment with per-server overrides.
- [ ] Rolling/canary restart plan.

---

# 12. Protocol / Network / Crossplay Lab

## 12.1 Geyser/Floodgate

- [ ] Install/configure supported Geyser deployment modes.
- [ ] Floodgate identity/linking configuration.
- [ ] Bedrock->Java compatibility status.
- [ ] Bedrock skins/forms/API awareness.
- [ ] Java+Bedrock dual-client acceptance test.
- [ ] Resource-pack delivery diagnostics.
- [ ] Never conflate protocol translation with complete gameplay/mod parity.

## 12.2 ViaVersion family

- [ ] ViaVersion/ViaBackwards/ViaRewind topology/version matrix.
- [ ] Client/server/proxy placement guidance.
- [ ] Protocol-version compatibility test.
- [ ] Warn where modded protocol/content makes version translation insufficient.

## 12.3 Packet inspector

- [ ] PacketEvents/ProtocolLib-style packet event inspection concepts.
- [ ] Direction/channel/type.
- [ ] Packet size/rate.
- [ ] Timeline.
- [ ] Per-mod/plugin attribution when inferable.
- [ ] Custom plugin/channel payload decoding adapters.
- [ ] Capture/replay only in controlled tests and only after secret/session redaction.
- [ ] Network hotspot integration with Performance Lab.

## 12.4 Network chaos test

- [ ] Add latency/jitter/loss in a controlled test environment.
- [ ] Disconnect/reconnect.
- [ ] Join/leave storms.
- [ ] Chunk-travel bandwidth scenario.
- [ ] Dimension transfer.
- [ ] death/respawn.
- [ ] server restart/reconnect.
- [ ] multiple protocol-bot clients.
- [ ] real-client lane when gameplay/render behavior matters.

---

# 13. Collaboration / Shared Instances / Team Pack Authoring

Modern launcher collaboration now warrants a first-class Enderloom collaboration model.

## 13.1 Shared instances

- [ ] Invite/share mechanism using a supported Enderloom account/service only if one actually exists; otherwise use Git/Drive/provider-neutral exports rather than fake cloud sync.
- [ ] Share content/config changes.
- [ ] Recipient sees diff before accepting.
- [ ] Identify who/what introduced each change.
- [ ] External/manual files clearly labeled.
- [ ] Never sync auth tokens/secrets.
- [ ] Worlds excluded by default unless explicitly selected.
- [ ] Resolve divergent edits.
- [ ] Rollback shared update.

## 13.2 Team modpack projects

- [ ] Roles/permissions when backend supports them.
- [ ] comments/notes/todos.
- [ ] review queue.
- [ ] proposed mod/config/update changes.
- [ ] performance/compatibility test status attached to proposal.
- [ ] release candidate lock/freeze.
- [ ] shared reproducible manifest.

## 13.3 Portable/offline workflows

- [ ] Fully offline instance launch after required assets/auth rules permit.
- [ ] Portable Enderloom data-root option.
- [ ] Export/import complete project metadata.
- [ ] Air-gapped pack bundle with verified hashes when licenses allow redistribution.

---

# 14. AI / MCP / Local-Model Integration

Browser-chat repair is essential, but Enderloom should also expose structured machine interfaces.

## 14.1 Enderloom MCP server

Expose safe typed tools for Codex/ChatGPT Desktop/IDE/local assistants:

- [ ] list/show project;
- [ ] inspect mod metadata/source/config;
- [ ] create repair job;
- [ ] get evidence bundle manifest;
- [ ] import repair candidate;
- [ ] build/test candidate;
- [ ] inspect failed gates;
- [ ] start conversion/port;
- [ ] query performance evidence;
- [ ] inspect world metadata/hotspots on copies;
- [ ] inspect assets/models;
- [ ] request dry-run install/update plans.

Rules:

- [ ] MCP never bypasses normal Enderloom permissions/safety/transactions.
- [ ] Destructive operations require explicit policy/approval boundary.
- [ ] Provider AI cannot self-declare acceptance.
- [ ] All actions create normal Enderloom task/evidence records.

## 14.2 Local AI lane

- [ ] Optional local-provider adapters (for example OpenAI-compatible local endpoints, Ollama/LM Studio-style providers when user configures them).
- [ ] Use local models for code triage, log grouping, metadata extraction, translation assistance where appropriate.
- [ ] Keep local model output behind the same build/runtime acceptance gates.
- [ ] Never claim a local model can replace real Minecraft testing.

## 14.3 Context optimizer

- [ ] Build smallest sufficient evidence packet.
- [ ] Reuse hashes and unchanged evidence between repair rounds.
- [ ] Source-range extraction instead of dumping entire repos when possible.
- [ ] Token/attachment budget preview.
- [ ] Preserve full local evidence even when external prompt is compact.

---

# 15. Legacy Archaeology / Truly Broad Version Support

“Convert/port to any version” requires explicit historical architecture rather than assuming modern Gradle/registries.

## 15.1 Java runtime matrix

- [ ] Java 6/7-era support only where historical target requires it and runtime can be obtained legally/safely.
- [ ] Java 8.
- [ ] Java 16/17.
- [ ] Java 21.
- [ ] Java 25+ as modern versions require.
- [ ] per-version JVM flags/runtime discovery.
- [ ] never launch ancient untrusted content with overly privileged defaults.

## 15.2 Historical loaders/build systems

- [ ] Old Forge/ForgeGradle generations.
- [ ] FML-era layouts.
- [ ] LaunchWrapper.
- [ ] Coremods/ASM transformers.
- [ ] MCP/SRG mappings.
- [ ] LiteLoader where relevant.
- [ ] old Fabric/Quilt toolchain generations.
- [ ] reconstruct buildable source project from archival metadata when lawful/possible.

## 15.3 Historical game semantics

- [ ] numeric block/item IDs and metadata before flattening.
- [ ] old registry/event systems.
- [ ] old recipe/resource/model schemas.
- [ ] pre-modern networking.
- [ ] old NBT/save/data-version transitions.
- [ ] old texture atlases/resource packs.
- [ ] conversion atlas documents semantic discontinuities rather than only renamed APIs.

## 15.4 Bedrock historical support

- [ ] manifest v1/legacy layouts.
- [ ] old scripting API formats where relevant.
- [ ] versioned Bedrock schema evolution.
- [ ] Preview/Retail differences.
- [ ] old Windows/UWP development-folder discovery only when user points Enderloom at legitimate local content.

---

# 16. Hot Reload / Fast Dev Loop

- [ ] Java resource reload.
- [ ] Java datapack reload.
- [ ] Bedrock `/reload` where valid.
- [ ] shader/resource live reload where supported.
- [ ] JVM method-body hotswap only where technically valid.
- [ ] detect when structural class/registry change requires full restart.
- [ ] fast prepared relaunch for those cases.
- [ ] never market arbitrary mod hot-unload/reload as safe if loader/game architecture does not support it.
- [ ] retain current player/world test position across controlled relaunch when safe through test fixtures rather than mutating user save.

---

# 17. Multiplayer / Chaos / Soak Test Matrix

The existing Probe/performance test plan needs broader behavioral failure modes.

- [ ] one real client;
- [ ] multiple real clients where hardware permits;
- [ ] protocol bots for server-scale load where truth boundary is clear;
- [ ] login/logout loop;
- [ ] reconnect after timeout;
- [ ] dimension travel;
- [ ] teleport/extreme chunk travel;
- [ ] death/respawn;
- [ ] mount/dismount;
- [ ] inventory/menu spam;
- [ ] entity spawn/despawn stress;
- [ ] block update/redstone stress;
- [ ] save/restart/rejoin;
- [ ] server crash/recovery fixture;
- [ ] long soak with memory/GC/thread monitoring;
- [ ] modpack update + existing-world migration test;
- [ ] config reload/restart behavior.

---

# 18. Worldgen / Seed / Pregeneration Intelligence

- [ ] Seed display/copy from world metadata.
- [ ] Version-aware vanilla biome/structure prediction where algorithm/data support it.
- [ ] Clearly separate modded worldgen where prediction is not authoritative.
- [ ] Compare worldgen output between mod sets/versions.
- [ ] “What changed in worldgen?” diff after pack update.
- [ ] Chunk pregeneration planner.
- [ ] Estimated storage/time based on measured local throughput.
- [ ] Dimension-specific pregeneration.
- [ ] Server-safe rate/CPU controls.
- [ ] pause/resume pregeneration.
- [ ] post-pregen integrity/performance report.
- [ ] Retrogen eligibility map.
- [ ] “Where should I travel to see newly added content?” generated-vs-unexplored heatmap.

---

# 19. World Snapshot Version Control

Backups are not enough for serious forever-world maintenance.

- [ ] Incremental/deduplicated snapshots.
- [ ] Named branches/tags/checkpoints.
- [ ] Chunk/region-level change index.
- [ ] Player/entity/block-entity change summary.
- [ ] Compare working world to snapshot.
- [ ] Restore selected chunks/regions/files instead of whole world.
- [ ] World transaction journal.
- [ ] “What did this modpack update change in the world?” comparison.
- [ ] Snapshot provenance tied to instance/modset/config fingerprint.
- [ ] Storage reclaim policy with protected important snapshots.

---

# 20. Cross-Edition Resource-Pack Conversion

Bedrock->Java mod conversion is not the same as robust Java<->Bedrock resource-pack conversion.

- [ ] texture path/name translation;
- [ ] block/item model translation;
- [ ] Bedrock geometry vs Java model mapping;
- [ ] sounds;
- [ ] particles;
- [ ] fonts;
- [ ] animation metadata;
- [ ] emissive/PBR/material metadata;
- [ ] Java CIT/custom item model/data-component conventions;
- [ ] CEM/EMF/ETF-style compatibility where target ecosystem supports it;
- [ ] OptiFine-specific feature gap report;
- [ ] pack metadata/icon/language conversion;
- [ ] exact unsupported-feature report;
- [ ] visual QA in both source and target runtimes where feasible.

---

# 21. Replay / Capture / Showcase Studio

The existing preview requirement should distinguish third-party promotional media from Enderloom’s own reproducible evidence.

- [ ] Author/provider trailer lane.
- [ ] Third-party review/timestamp lane.
- [ ] Enderloom native QA capture lane.
- [ ] deterministic scripted camera path.
- [ ] before/after split or synchronized compare.
- [ ] model/animation sequence capture.
- [ ] performance overlay optional.
- [ ] exact build/hash/scenario stamped into capture metadata.
- [ ] capture actual Minecraft window for proof.
- [ ] export GIF/MP4/PNG evidence using native capture pipeline.
- [ ] no synthetic imagery substitution for project QA.

---

# 22. Hardware / JVM / Render Advisor

Turn performance evidence into safe machine-specific guidance.

- [ ] CPU/GPU/RAM/VRAM/OS/driver inventory.
- [ ] Java runtime recommendation by Minecraft/loader.
- [ ] Heap sizing based on measured instance behavior, not generic folklore.
- [ ] GC/JVM argument audit.
- [ ] Detect harmful/obsolete flags.
- [ ] GPU/driver/render backend status.
- [ ] shader/VRAM pressure.
- [ ] CPU/GPU bottleneck classification from measured evidence.
- [ ] thermal/power-mode/background-load warnings.
- [ ] disk/storage bottleneck clues.
- [ ] portable hardware profile to compare test results while warning when hardware differs.
- [ ] quality/performance Pareto presets are optional suggestions; never delete content/cap gameplay to manufacture a score.

---

# 23. Accessibility & Localization — both Enderloom and projects

## 23.1 Enderloom accessibility

- [ ] Complete keyboard navigation.
- [ ] Screen-reader semantics/accessible names.
- [ ] focus visibility/order.
- [ ] high contrast.
- [ ] colorblind-safe status signaling (never color-only).
- [ ] reduced-motion mode.
- [ ] scalable text/UI density.
- [ ] controller-friendly paths where useful.
- [ ] localization framework for Enderloom itself.

## 23.2 Project localization studio

- [ ] language key browser.
- [ ] missing/unused key detection.
- [ ] fallback language view.
- [ ] placeholder/format specifier validation.
- [ ] compare language coverage.
- [ ] Bedrock/Java localization mapping during conversion.
- [ ] preview UI/text with selected locale.

---

# 24. Analytics / Issue / Changelog Intelligence

- [ ] Provider release/download/follower metadata only where real APIs/pages expose it.
- [ ] Release cadence/activity.
- [ ] Changelog semantic diff.
- [ ] GitHub/GitLab issue tracker links.
- [ ] Match stack traces/error strings against known project issues when confidence is explainable.
- [ ] “Fixed in version X?” suggestion backed by actual changelog/commit/issue evidence.
- [ ] Pack-local crash frequency/grouping.
- [ ] Performance regression frequency.
- [ ] Never fabricate popularity/quality/safety scores from incomplete provider data.

---

# 25. Pack/Release Permission & Policy Gate

Before exporting/sharing a modpack or derivative build:

- [ ] Inventory every redistributed artifact.
- [ ] Record source/provider/license/permission where known.
- [ ] Detect projects that require link-only/provider download rather than redistribution.
- [ ] Generate manifest-based downloads for nonredistributable content instead of bundling it.
- [ ] Flag private/unpublished/local content.
- [ ] Flag patched/derivative binaries and their provenance.
- [ ] Security scan results attached internally.
- [ ] SBOM/checksum manifest.
- [ ] Signing support where Enderloom has a real configured signing identity.
- [ ] Never auto-accept licenses/terms for users.

---

# 26. “No Unknown Files” Import Invariant

Every import/conversion/reconstruction workflow must classify every source file.

Applies to:

- Java mod JAR;
- Bedrock pack/add-on;
- modpack ZIP/MRPack/packwiz;
- world;
- resource/data pack;
- shader pack;
- plugin/server pack;
- model project;
- AI-returned archive.

For each source file:

- [ ] classified/consumed;
- [ ] preserved unchanged;
- [ ] deliberately ignored with reason;
- [ ] unsupported/unknown and surfaced as a gap.

A conversion cannot claim full fidelity while silently ignoring unknown files.

---

# 27. Canary / Staged Update Engine

Before applying risky pack/mod/server changes:

- [ ] Clone/materialize isolated candidate state.
- [ ] Apply proposed updates.
- [ ] Resolve dependencies.
- [ ] Run static compatibility/security scan.
- [ ] Boot client/server as applicable.
- [ ] Open copied representative world.
- [ ] Run targeted regression scenarios.
- [ ] Compare startup/performance/crashes.
- [ ] Generate update impact report.
- [ ] Only then offer live apply.
- [ ] One-click rollback if live smoke fails.

This should be available for a single mod, dependency cluster, full modpack, server stack or Enderloom-generated patch.

---

# 28. Remote Server Operations — real adapters only

Where users manage remote servers:

- [ ] SSH/SFTP adapter.
- [ ] Pterodactyl adapter when user supplies authorized credentials/API access.
- [ ] Crafty Controller or similar only through supported APIs when available.
- [ ] remote log tail.
- [ ] upload/download/sync plan.
- [ ] service/process restart.
- [ ] backup/snapshot before update.
- [ ] remote disk/memory/CPU metrics where protocol exposes them.
- [ ] stage on local test server before remote deploy.
- [ ] never fake hosted-cloud capability when no provider API is available.

---

# 29. Ecosystem Challenge Matrix — expanded benchmark set

The existing external benchmark list must add these capability families to the recurring challenge pass:

- [ ] Mojang/Microsoft Bedrock Developer Tools.
- [ ] Minecraft Creator Tools (`mctools.dev` / Creator Tools CLI concepts).
- [ ] Bedrock Editor + Editor Extensions.
- [ ] Snowstorm particle editor.
- [ ] bridge. Bedrock authoring workflows.
- [ ] MCreator visual authoring.
- [ ] Axiom.
- [ ] WorldEdit.
- [ ] Litematica.
- [ ] Misode generators.
- [ ] MCStacker command-generation workflows.
- [ ] Fabric Loom.
- [ ] NeoForge ModDevGradle.
- [ ] Sinytra Connector compatibility/test concepts.
- [ ] Paper/Folia.
- [ ] Velocity.
- [ ] Geyser/Floodgate.
- [ ] ViaVersion family.
- [ ] PacketEvents/ProtocolLib-style protocol inspection.
- [ ] Modrinth shared-instance collaboration.
- [ ] modern mod/plugin static security scanners.

The challenge matrix tracks **capabilities and integration quality**, not copycat UI parity.

---

# 30. Architecture additions required in Wave A

Do not postpone all of this until later. Wave A must make the canonical graph extensible enough that these later domains do not force another rewrite.

Add/ensure first-class entity categories or extensible typed nodes for:

- [ ] `SecurityFinding` / `ArtifactCapability` / `ThreatIntelObservation`.
- [ ] `CodeProject` / `SourceSymbol` / `MappingSymbol` / `MixinInjection`.
- [ ] `PluginProject` / `ProxyNode` / `ProtocolEndpoint`.
- [ ] `BedrockCreatorProject` / `EditorExtension` / `ScriptProfile`.
- [ ] `VisualLogicGraph` / `GameplayElement`.
- [ ] `Blueprint` / `Schematic` / `BuildSelection`.
- [ ] `ParticleAsset` / `SoundAsset` / `UiAsset` / `FontAsset` / `MaterialAsset`.
- [ ] `RegistryEntry` / `RecipeEdge` / `LootSource` / `SpawnSource`.
- [ ] `CollaborationChangeSet` / `ReviewDecision`.
- [ ] `RemoteServerTarget`.
- [ ] `ProtocolCapture` / `NetworkScenario`.
- [ ] `WorldSnapshotDelta` / `WorldTransaction`.
- [ ] `HardwareProfile`.
- [ ] `LocalizationBundle`.
- [ ] `PermissionPolicyFinding`.

Graph design must permit unknown/future entity types through versioned extensions without collapsing everything into untyped JSON blobs.

---

# 31. Cross-integration requirements for these newly added domains

Examples that become mandatory:

- [ ] Security findings appear in install/update, mod detail, AI repair and pack export.
- [ ] New mod version capability diff can trigger canary testing.
- [ ] Mixin conflict graph links directly to source symbols and repair actions.
- [ ] Mappings atlas feeds porting, decompiler, Mixin editor and code completion.
- [ ] Bedrock Script Profiler results feed Performance Lab.
- [ ] Bedrock debugger/log errors link to exact script/source line.
- [ ] Gameplay visual graphs generate/edit normal project source and run through normal tests.
- [ ] Worldgen generators feed the same conversion/version atlas as hand-written data.
- [ ] Schematic material list can resolve owning mods and install missing dependencies.
- [ ] World selected block/entity can open its registry/project page.
- [ ] Packet/network hotspots appear on mod/plugin/project performance surfaces when attribution is known.
- [ ] Geyser crossplay tests become server compatibility evidence.
- [ ] Shared-instance changes show which performance/security/compatibility evidence becomes stale.
- [ ] MCP/AI actions create ordinary Enderloom tasks and evidence rather than special hidden state.
- [ ] Legacy source reconstruction feeds the same port engine as modern source.
- [ ] Hot reload/relaunch uses the same runtime supervisor/Probe and truthfully records mode.
- [ ] World snapshot deltas integrate with update/repair rollback.
- [ ] Localization status appears on release readiness.
- [ ] Permission/licensing findings gate pack export without blocking ordinary local use unnecessarily.

---

# 32. New golden fixtures required

Add owned/open fixtures for:

- [ ] malicious-looking but benign capability examples to test false positives.
- [ ] known-dangerous synthetic fixture with process/network/filesystem/native-load patterns.
- [ ] JAR update with newly introduced capability to test capability diff.
- [ ] Mixin conflict pair.
- [ ] Mojmap/Yarn/Parchment remap fixture.
- [ ] legacy 1.7.10/1.12.2-style source/build fixture.
- [ ] Bedrock TypeScript script with debugger/profiler workload.
- [ ] Bedrock Editor Extension sample.
- [ ] MCreator-like visual logic project compiled to native target source.
- [ ] rich worldgen/data generator fixture.
- [ ] multi-format schematic conversion fixture.
- [ ] particle/audio/UI/font asset fixture.
- [ ] Paper plugin.
- [ ] Folia-sensitive plugin.
- [ ] Velocity proxy plugin.
- [ ] Geyser/Floodgate crossplay test server.
- [ ] ViaVersion protocol-version test matrix.
- [ ] packet-heavy plugin/mod network regression fixture.
- [ ] shared-instance divergent change fixture.
- [ ] world snapshot selective-restore fixture.
- [ ] Java<->Bedrock resource-pack conversion fixture.
- [ ] localization coverage/placeholder failure fixture.
- [ ] pack export with mixed redistribution permissions.

---

# 33. Updated implementation waves after the original backlog

The original Wave A-D order remains correct and must **not** be restarted. This audit expands later work and adds architecture awareness now.

## Wave A — Integration Spine

Keep current exact next action, but include extensibility for the entity/evidence categories in section 30.

## Wave B — Universal Mod Surface

Add Security, Registry/Content and Developer/Mixin source affordances to the same mod surface.

## Wave C — Performance Lab continuity

Add network/protocol, Bedrock Script Profiler and hardware-profile evidence adapters over time without delaying the existing issue #1 critical path.

## Wave D — Autonomous Repair Loop

Security-scan every returned candidate; expose MCP/local-model adapters later without weakening the in-browser ChatGPT vertical acceptance.

## Wave E+ — Existing Bedrock/Conversion/Port/World/Asset waves

Extend them with:

- Bedrock developer/debugger/editor tooling;
- Mapping/Mixin IDE;
- visual gameplay authoring;
- generators/worldgen;
- creative build/schematic tooling;
- particle/audio/UI/font/material studios;
- plugin/proxy/crossplay/protocol support;
- collaboration/MCP/local AI;
- legacy archaeology;
- snapshot/version-control/canary/remote-server layers.

Do not serialize all these domains unnecessarily. Once the Integration Spine is stable, independent vertical slices can be developed in parallel as long as they share the same canonical contracts.

---

# 34. Definition of done for the gap audit

This addendum is considered satisfied only when every applicable capability family is either:

1. implemented and verified;
2. represented by a tracked concrete implementation plan with a safe architecture slot and acceptance gate; or
3. explicitly excluded with a technical/legal/platform reason recorded in the capability matrix.

It is **not** acceptable to omit a domain because “another tool already does it.” Enderloom may interoperate with another tool where that is the best engineering choice, but the workflow still needs to feel continuous inside Enderloom and its state/evidence must return to the shared project graph.

The final challenge question is:

> **Can a serious Minecraft player, modpack author, Java/Bedrock creator, server/plugin developer, world builder, asset artist, tester, performance engineer and repair/port developer stay in Enderloom for essentially the whole job — and when Enderloom delegates to an external runtime/tool/site, does the result flow back into the same project with provenance, evidence, undo and next actions?**

If the answer is materially “no” for a common Minecraft workflow, the challenge pass is not finished.
