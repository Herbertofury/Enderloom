# Enderloom — Unified Studio, Config/Hotkey Control, Full CLI, Premium Knowledge & Evidence Brain

**Status:** Mandatory product/implementation contract  
**Updated:** 2026-09-07  
**Repository:** `Herbertofury/Enderloom`  
**Branch:** `main`  
**Parents:** `docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md`, `docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md`, `docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md`  

This specification records the user’s decisions from the third challenge pass and converts them into concrete Enderloom architecture. It does **not** restart Wave A. It sharpens what later systems must look like and what Wave A must leave room for.

## Locked decisions

- **One creation workspace, not endless Studio tabs.** Enderloom gets one first-class **Studio** that behaves more like Unreal Engine / Unity: a composable workspace with contextual tools rather than separate “Model Studio / Particle Studio / Quest Studio / Wiki Studio / Data Studio” top-level products.
- The pack **Progression / Softlock Simulator** is included inside this unified Studio, primarily in pack/project context.
- **All meaningful config-management upgrades are accepted.** Config intelligence must be available wherever configs matter rather than buried in one isolated editor.
- **Hotkeys is a first-class top-level tab.** It is a pack/user-management workflow, not an authoring tool.
- **Friend Hosting / Shared-World hosting from the third-pass proposal is explicitly not added.** Do not build Enderloom-owned P2P/tunnel/LAN-to-internet hosting from that proposal. Existing generic project collaboration concepts from older plans are not permission to sneak this feature back in.
- **Voice/Social compatibility center from the third-pass proposal is explicitly not added.**
- **Black Box Incident Recorder is accepted** and belongs primarily in Performance / Testing.
- **Minecraft Data / Function Debugger is accepted and expanded**; it should bridge code/data/scripts/runtime evidence.
- **The complete model/reference-reconstruction direction is accepted:** Blockbench-quality authoring/interchange, MCModels-style reconstruction goals, authorized image/GIF/video/model reference reconstruction, animation/texture/rig work, conversion and native visual QA all live inside the one Studio.
- **Premium gorgeous Wiki / Documentation generation is accepted.**
- **Performance / Testing + full Minecraft CLI control is accepted and should be expanded aggressively.** Enderloom should benchmark the strongest existing CLIs and become a broader control plane rather than copying any single one.
- **Premium whole-modpack version/loader migration is accepted.**
- **“Why is this installed?” intelligence is accepted and integrated into the generated Wiki/knowledge system.**
- **Evidence-backed self-improvement is strongly accepted.** Enderloom should improve from successful/failed work like Repair Brain while preventing poisoned, stale or overgeneralized learning.
- The third-pass **Content Replacement Assistant** proposal was not approved in this decision set; do not treat it as newly accepted here.

---

# 1. One Unified Minecraft Studio — Unreal/Unity-style product law

## 1.1 Top-level UX law

There is one top-level **Studio** entry for Minecraft creation/development work.

Do **not** create top-level tabs named:

- Model Studio
- Texture Studio
- Animation Studio
- Particle Studio
- UI Studio
- Quest Studio
- Wiki Studio
- Datapack Studio
- Worldgen Studio
- Script Studio
- Bedrock Studio
- Java Mod Studio
- Plugin Studio

Those are tool capabilities inside one composable Studio.

The user should be able to open a mod, pack, asset, worldgen definition, quest, script, UI, model, Bedrock add-on or Java source and have the workspace reconfigure around the selected object without navigating through a forest of product sections.

## 1.2 Core workspace shell

The Studio should support dockable/rearrangeable panes similar in spirit to professional game engines:

- **Project / Content Browser** — all source, generated resources, models, textures, sounds, scripts, data, quests, docs and test fixtures.
- **Outliner / Hierarchy** — current model/entity/UI/structure/worldgen/project hierarchy.
- **Inspector / Details** — context-sensitive properties for the current object.
- **Main Viewport / Editor** — 3D view, 2D texture, graph, code, JSON/data form, wiki preview or runtime preview based on selection.
- **Timeline / Dope Sheet / Curves** when animation is selected.
- **Node / Procedure Graph** when gameplay logic or progression graph is selected.
- **Code Editor** for Java/Kotlin/JS/TS/Molang/mcfunction/JSON/TOML/YAML/etc.
- **Console / Runtime Log**.
- **Problems / Validation**.
- **Task / Build / Test panel**.
- **Source Control / Diff panel**.
- **Integrated Browser / Docs panel** using Enderloom’s existing Chromium surface.
- **Evidence panel** showing exact runtime/build/visual proof tied to the selected project object.

Panels should open contextually and remain user-customizable. Workspaces/layouts can be saved per project or activity without turning each layout into a new product tab.

## 1.3 Context and command system

- Global command palette.
- Right-click actions everywhere.
- Search for any project object, registry ID, source symbol, asset, test, config, hotkey or evidence object.
- “Open related” graph navigation: owning mod, source, model, texture, recipe, quest, config, test, wiki page, runtime incident, performance result.
- Drag/drop between compatible surfaces.
- Multi-select bulk edit.
- Undo/redo through transactional operations where technically possible.
- “Copy as CLI” on every command-backed operation.
- “Show operation/evidence” for actions triggered by GUI, CLI, AI or automation.

## 1.4 Project types are contexts, not separate apps

The Studio must open and understand:

- Java Forge / NeoForge / Fabric / Quilt mods;
- Bukkit/Paper/Purpur/Folia/Velocity projects when applicable;
- Bedrock behavior/resource packs and script projects;
- modpacks;
- datapacks/resource packs/shader packs;
- server/plugin packs;
- Blockbench/model projects;
- worldgen/data projects;
- quest/guidebook/documentation projects;
- conversion/port projects;
- authorized source-reconstruction projects.

Each context activates only the tools that make sense.

## 1.5 Professional “it just works” quality

- Progressive disclosure: simple properties first, expert controls available without hiding capability.
- No generated-code prison: visual authoring emits normal target-native source/data that is inspectable and editable.
- Round-trip protection for manual code regions.
- Version/loader target shown persistently.
- Missing dependency/API/version incompatibility shown immediately.
- Build/test status always visible.
- Hot reload/reload where safe; fast restart where structural changes require it.
- Automatic safe snapshots before destructive generation/refactor/conversion.
- Never mutate the user’s live world as Studio scratch space.

---

# 2. Progression / Softlock Intelligence inside Studio

This is **not** another top-level “Progression Studio.” It is a Studio tool activated for pack/project/quest/data contexts.

Build a progression graph from:

- recipes and recipe removals;
- tags;
- machine processing chains;
- loot;
- mob drops;
- trades;
- structures;
- dimensions/portals;
- advancements;
- quest tasks/rewards;
- stages/gates;
- commands/functions;
- KubeJS/CraftTweaker/custom scripts;
- configuration-controlled content;
- worldgen availability;
- required equipment/attributes/skills where inferable;
- scripted events and custom integrations.

Required analysis:

- impossible objectives;
- cyclic dependencies;
- self-locking machine chains;
- inaccessible dimensions;
- unobtainable ingredients;
- quest references to removed/renamed content;
- rewards required earlier in their own prerequisite chain;
- mutually exclusive gates;
- required item only obtainable after its consuming gate;
- broken tags/empty ingredient sets;
- removed mod leaves dangling progression links;
- server/client/config differences that invalidate the intended route.

Required output:

- interactive dependency graph;
- shortest/alternative progression paths;
- first blocking node and exact reason;
- source/config/quest/script links;
- suggested fixes with dry-run diff;
- generated deterministic test scenarios for critical progression milestones;
- wiki integration showing “How to obtain / Requires / Unlocks / Used by”.

The solver must distinguish **proven unreachable**, **likely unreachable**, and **unknown because semantics are opaque**.

---

# 3. Configuration Intelligence — make Enderloom absurdly good at configs

Config management is a cross-app capability, not an isolated editor.

## 3.1 Canonical config identity

Track a `ConfigDocument` / `ConfigKey` model with:

- owning project/mod/plugin;
- physical path;
- logical config type;
- client/common/server/world/default scope;
- format/schema;
- upstream default by mod version;
- current user value;
- previous user value;
- incoming upstream default;
- source/provenance;
- restart/reload requirement when known;
- related runtime/performance evidence;
- comments/order/formatting preservation metadata.

Recognize at minimum:

- TOML;
- JSON / JSON5 / JSONC;
- YAML;
- properties;
- INI;
- HOCON where encountered;
- SNBT/NBT-backed configuration where applicable;
- Forge/NeoForge client/common/server config conventions;
- Fabric/Quilt mod-specific config locations;
- `defaultconfigs/`;
- per-world `serverconfig/`;
- KubeJS/CraftTweaker/Paxi and pack-level overrides;
- plugin/proxy configs.

## 3.2 Three-way semantic config migration

On mod/plugin update compare:

1. previous upstream default;
2. user’s current customized config;
3. new upstream default.

Then:

- preserve user changes;
- adopt new upstream keys safely;
- identify deleted keys;
- identify renamed/moved keys where evidence supports mapping;
- detect type/range/enum changes;
- preserve comments and stable formatting where possible;
- flag ambiguous migrations;
- create exact pre-migration snapshot;
- validate resulting config;
- boot/test when config affects runtime behavior;
- show human-readable “what Enderloom preserved / what upstream changed / what needs review”.

## 3.3 Config discovery and association

For every mod/project detail page:

- show every known config/default/world/server file associated with it;
- show generated files and when they appeared;
- detect orphaned configs after uninstall and offer **archive/keep/remove** with provenance instead of silently deleting;
- search across all configs by key/value/comment;
- answer “which configs mention spawn rate / render distance / cache / X?”;
- resolve registry IDs referenced by config back to owning content;
- link config values to crash/performance/compatibility evidence.

## 3.4 Profiles and overlays

- named config profiles;
- per-instance overrides;
- server vs client profile separation;
- development/testing profile overlays;
- compare profiles;
- portable export/import;
- transactional apply/rollback;
- no secret leakage in exported profiles.

## 3.5 Config + Performance Lab integration

- run A/B scenario with config key/value change;
- attach measured FPS/TPS/memory/startup/frame-time effect to the exact key/value pair;
- recommend config changes only when evidence supports them;
- preserve content/quality by default rather than silently lowering settings;
- allow user to ask “what is the cost of this setting?” and see measured or clearly labeled inferred evidence.

## 3.6 Config repair

- schema/type validation;
- malformed-file recovery from last good/default;
- key-level reset instead of whole-file reset;
- preserve unknown custom keys unless proven invalid;
- detect configs truncated by crashes/hard kills;
- recover from backups/snapshots;
- AI may explain/suggest but Enderloom owns diff, validation, test and rollback.

---

# 4. Hotkeys — dedicated top-level tab

A repository search did not find an explicit canonical Hotkey/keybind contract in the currently indexed default-branch content, so this requirement is now made explicit regardless of whether it existed in an earlier chat.

**Hotkeys is a first-class top-level Enderloom tab.**

## 4.1 Inventory

Enumerate and normalize:

- vanilla keybindings;
- normal Forge/NeoForge/Fabric/Quilt key mappings;
- custom mod key systems where discoverable;
- mouse buttons;
- modifier/chord bindings;
- controller/gamepad bindings where the installed input stack supports them;
- context-sensitive bindings where the mod exposes context.

Show:

- action;
- owning mod/project;
- category;
- current binding;
- default binding;
- conflicts;
- active/inactive/stale status;
- source config/file/key ID;
- version history.

## 4.2 Conflict intelligence

- exact conflict matrix;
- duplicate chord detection;
- context-aware conflict detection when two keys only conflict in the same state/screen;
- hidden custom-binding conflict detection through runtime Probe when static files are insufficient;
- sort by severity/frequency/importance where evidence exists;
- never invent usage frequency from no data.

## 4.3 Fast fixing

- click action then press desired key/chord;
- drag/drop reassignment where useful;
- one-click “Resolve conflicts” plan with preview;
- preserve important/default user choices;
- avoid rebinding common movement/inventory keys unless user approves;
- undo/rollback;
- fix only selected conflicts;
- automatically find unused sensible keys;
- accessibility-aware recommendations.

## 4.4 Profiles

- named Hotkey profiles;
- per-instance profile;
- building / combat / exploration / dev-testing examples as user-created templates;
- import/export;
- copy between instances;
- compare profiles;
- update migration if a mod renames/removes/adds bindings;
- archive stale bindings rather than losing history.

## 4.5 Integration

- mod detail shows its Hotkeys;
- generated Premium Wiki includes controls;
- update planner warns about changed/new/conflicting keys;
- First-Launch UX tests verify important actions remain reachable;
- Studio can open the Hotkeys tab filtered to the selected mod;
- CLI has full hotkey inventory/profile/diff/apply commands.

---

# 5. Black Box Incident Recorder — Performance / Testing

The Performance / Testing tab gains a continuously available **Black Box** recorder for reproducible debugging.

## 5.1 Rolling capture

Keep a bounded rolling ring buffer of timestamped evidence, configurable by cost:

- Enderloom task/scenario actions;
- Probe/player/test-bot actions;
- Minecraft log lines;
- crash/watchdog output;
- server/client thread states;
- sampled thread stacks;
- TPS/MSPT;
- FPS/frame time;
- memory/heap/allocation/GC;
- JFR markers/events when enabled;
- render-thread and GPU telemetry where available;
- chunk load/generation/save events where observable;
- current world/dimension/position;
- entity/block-entity counts;
- network rates/packet evidence where allowed;
- config changes;
- modset/config/world/test fingerprints;
- lifecycle events such as join, respawn, teleport, dimension transfer, world save, resource reload.

## 5.2 Triggers

Allow:

- manual **Mark Incident / Save Previous N Seconds**;
- crash;
- watchdog/stall threshold;
- TPS/MSPT threshold;
- frame hitch threshold;
- sustained memory growth;
- OOM precursor;
- deadlock detection;
- failed GameTest/scenario;
- connection timeout/disconnect storm;
- native client disappearance/process exit.

Capture a configurable post-trigger tail as well when the process remains alive.

## 5.3 Causal incident timeline

Generate one correlated timeline with links into exact evidence:

`action -> lifecycle event -> mod callback/Mixin/source when known -> thread/lock state -> chunk/network/render/GC effect -> symptom -> watchdog/crash`

Never claim causality merely from timestamp proximity; label observations, correlations and proven ownership separately.

## 5.4 Incident reuse

- compare healthy vs broken incident;
- generate minimal reproducer candidate;
- feed automated mod bisect;
- generate GameTest/scenario from repeatable actions;
- bundle for autonomous AI repair;
- attach incident to culprit mod/project detail;
- preserve exact candidate hashes and environment fingerprint.

---

# 6. Minecraft Data / Function Debugger — expanded

This is a Studio + Performance/Testing capability, not another top-level product.

## 6.1 Java datapack / command execution

Support:

- `.mcfunction` syntax/semantic diagnostics;
- Brigadier-aware command completion/tree inspection;
- function call graph;
- scheduled function graph;
- tag (`load`, `tick`, custom) membership;
- execution counts;
- command timing;
- per-function timing;
- recursion/runaway execution detection;
- command failure reason and source line;
- generated-vs-authored source mapping;
- permission/side/context checks;
- registry/resource-location resolution;
- dead/unreachable function detection;
- function/test coverage.

## 6.2 Watches and state diff

In controlled test/runtime instrumentation lanes:

- scoreboard objectives/players;
- command storage;
- entity NBT/components/tags;
- block entity state;
- inventory/item components;
- advancements;
- predicates;
- loot results;
- scheduled ticks/functions;
- selected registry values;
- KubeJS/CraftTweaker script-owned state when adapters expose it.

Allow pre-action snapshot -> execute -> post-action semantic diff.

## 6.3 Breakpoint-like debugging

Minecraft does not natively offer arbitrary debugger semantics for all datapack commands, so Enderloom should provide truthful **instrumented test debugging** where feasible:

- conditional tracepoints;
- pause between generated/instrumented command steps in a controlled QA world;
- step/continue through a test harness;
- stop when watched state changes;
- stop on command failure;
- stop on function-entry/function-exit;
- no claim that an unmodified production server has true source-code breakpoints when it does not.

## 6.4 Command-block network debugging

- map command block chain/network;
- trigger source;
- execution order;
- conditional state;
- success count/output;
- timing;
- redstone/clock activation where observable;
- highlight loops and unexpectedly hot command regions.

## 6.5 Data content debugger

Trace why a data-driven behavior did or did not happen:

- recipe matching;
- loot-table selection;
- predicate result tree;
- advancement criterion;
- item modifier;
- tag membership;
- structure/worldgen reference resolution;
- damage/enchantment/component data where supported by version;
- show exact source JSON/data path.

## 6.6 Script bridges

- KubeJS;
- CraftTweaker;
- Bedrock TypeScript/JavaScript via official supported debugging/profiling paths;
- generated pack logic from Studio.

Normalize trace/performance/state evidence so scripts can participate in the same incident, progression and repair graphs.

## 6.7 Deterministic regression generation

From a successful or failed trace:

- freeze initial fixture state;
- record inputs/actions;
- define expected state/output;
- emit Forge/NeoForge/Fabric GameTest or Bedrock GameTest where semantics fit;
- otherwise emit Enderloom Probe scenario;
- preserve the original trace as evidence.

---

# 7. Model / Texture / Animation / Reference Reconstruction inside the one Studio

This section absorbs the model work the Minecraft Dev Kit has been doing rather than creating a separate application.

## 7.1 Formats and interoperability

- Blockbench `.bbmodel` round-trip;
- Java entity/block/item models;
- Bedrock geometry/animations/controllers;
- GeckoLib/AzureLib-style animated assets;
- glTF/GLB;
- OBJ;
- DAE;
- FBX import/export only where the chosen implementation/licensing path is legitimate;
- ModelEngine/Mythic-style authorized source-pack conversion paths;
- server/custom-item/furniture model ecosystems through explicit adapters;
- texture atlases and native resource-pack assets.

## 7.2 Reference Reconstruction

For user-authorized images, multi-view images, GIFs, videos or model references:

- preserve/hash source reference;
- solve/reference camera when possible;
- silhouette/depth fitting;
- cuboid/mesh reconstruction;
- visible-surface texture back-projection;
- UV reconstruction/packing;
- pivot/joint inference;
- rig creation;
- GIF/video pose and motion fitting;
- animation curve reconstruction;
- secondary motion such as tails/hair/accessories where observable or explicitly authored;
- hidden/unseen geometry marked inferred rather than falsely “recovered exactly”;
- confidence/coverage report.

## 7.3 Authoring quality

- 3D viewport;
- orthographic/perspective cameras;
- snapping/grid/pivot tools;
- UV editor;
- paint/texture editor;
- layers/masks/selection tools;
- animation timeline/dope sheet/curve editor;
- rig/bone hierarchy;
- animation state/event editing;
- locator/hitbox/seat/special-bone metadata;
- particle/sound/gameplay event hooks;
- reusable rigs/retargeting where compatible;
- scale/coordinate-system conversion;
- texture/material channel handling;
- optimization analysis without silently destroying visual fidelity.

## 7.4 Native visual QA

- deterministic QA world/camera/time/weather;
- fixed multi-view captures;
- non-obvious animation-frame capture;
- actual Minecraft client evidence;
- silhouette/pose/texture comparison;
- grounding/clipping/culling checks;
- transform accumulation detection;
- missing texture/atlas warning detection;
- side-by-side source-reference / deterministic renderer / actual-client comparison;
- no synthetic image substitution for proof.

---

# 8. Premium Gorgeous Wiki / Documentation System

**Premium feature.**

Enderloom should be able to generate a polished, searchable, versioned Minecraft knowledge site/manual from the canonical project graph.

## 8.1 Sources

Build pages from:

- installed mods/projects;
- registry/content inventory;
- recipes/uses;
- loot/spawn/trades;
- dimensions/biomes/structures;
- progression/softlock graph;
- quests/advancements;
- guidebooks;
- Hotkeys;
- config keys and safe user-facing explanations;
- performance requirements/results where appropriate;
- compatibility notes;
- server commands;
- changelogs;
- source/provider/author links;
- verified runtime captures;
- model/asset previews;
- user notes.

## 8.2 Page quality

Pages can include:

- gorgeous responsive themes;
- global search;
- breadcrumbs/backlinks;
- relationship graph;
- recipe trees;
- “How to obtain”;
- “Used by / Requires / Unlocks”;
- “Which mod adds this?”;
- 3D model viewer when source format permits safe rendering;
- actual runtime screenshots/video evidence where available;
- tabs/sections within a page where helpful without turning Enderloom itself into tab clutter;
- spoiler/progression gating;
- exact Minecraft/modpack version banner;
- offline availability.

## 8.3 “Why is this mod installed?” integration

Every project/mod wiki page should include an evidence-backed **Why is this here?** card:

- explicitly selected by user/pack author;
- direct dependency of X;
- transitive library/API dependency;
- referenced by quest/progression;
- referenced by KubeJS/CraftTweaker/datapack/resource pack;
- required by another integration/compat module;
- server-only/client-only utility;
- performance/diagnostic role;
- world contains registered content from it;
- manually added with no known dependency reason.

Also provide **Can I remove it?** analysis using dependency/content/config/script/quest/world evidence. A confident removal recommendation requires a dry-run impact analysis and, for important packs, isolated boot/runtime validation. Never infer safe removal from dependency metadata alone.

## 8.4 Export targets

- Enderloom built-in knowledge view;
- static HTML site;
- Markdown tree;
- GitHub wiki/docs-compatible output;
- Patchouli-style in-game guide output where representable;
- printable/export formats can be added through existing artifact pipelines.

## 8.5 Auto-maintenance

- versioned wiki snapshots;
- incremental regeneration only for stale pages;
- show what changed after pack update;
- broken-link/unknown-content validation;
- completeness report;
- preserve user-authored prose/notes through regeneration;
- provenance for generated facts.

---

# 9. Performance / Testing becomes the Minecraft Control Plane

The Performance / Testing tab remains a first-class top-level surface. It should combine profiling, runtime automation, CLI control, incidents, scenarios, comparison, bisect, optimization and repair evidence.

## 9.1 Current CLI/tool capability benchmark

Enderloom should benchmark and exceed these **capability families**, without blindly copying code or UI and with license review before reuse:

- **PortableMC** — one-command install/launch across Mojang versions and multiple loaders, including Forge/NeoForge/Fabric/Quilt/LegacyFabric/Babric.
- **Prism Launcher CLI** — launch existing instance and optionally join server/world/profile; current public discussions still show gaps around full CLI instance creation/update automation.
- **Ferium** — fast multi-source mod/modpack profiles and upgrades from Modrinth, CurseForge and GitHub Releases.
- **packwiz** — reproducible Git-friendly modpack metadata, add/remove/update/refresh/export/serve workflows.
- **mcman** — declarative server/network configuration, multi-source content acquisition, Git/Docker support, hot reload and CI test runs.
- **mrpack-install** — Modrinth server/modpack deployment.
- **Mojang Minecraft Creator Tools CLI (`mct`)** — Bedrock project create/add/validate/deploy/serve/render/package workflows and MCP integration.
- **HeadlessMC + MC-Runtime-Test** — client launch and real Minecraft runtime testing/CI with GameTest integration.
- **Minecraft Console Client** — scriptable protocol client, command automation and bot workflows without rendering a normal game client.
- **RCON CLIs / rich RCON terminals** — remote command execution, interactive history/completion and server-console automation.
- **MCA Selector CLI** — world select/export/import/delete/NBT-change/cache/image operations.
- **Chunky commands** — resumable pregeneration/selection/trim workflows.
- **spark commands** — profiler start/open/stop and platform-specific profiling control.
- **NBT CLIs** — raw NBT inspection/edit primitives.
- **vanilla/loader GameTest and Gradle run tasks** — deterministic target-runtime test invocation.

Primary capability references researched 2026-09-07:

- https://github.com/theorzr/portablemc
- https://github.com/PrismLauncher/PrismLauncher
- https://github.com/gorilla-devs/ferium
- https://github.com/packwiz/packwiz
- https://github.com/deniz-blue/mcman
- https://github.com/nothub/mrpack-install
- https://learn.microsoft.com/en-us/minecraft/creator/documents/mctoolsoverview?view=minecraft-bedrock-stable
- https://github.com/headlesshq/headlessmc
- https://github.com/marketplace/actions/mc-runtime-test
- https://github.com/MCCTeam/Minecraft-Console-Client
- https://github.com/itzg/rcon-cli
- https://github.com/Querz/mcaselector/wiki/CLI-Mode
- https://github.com/pop4959/Chunky/wiki/Commands
- https://github.com/lucko/spark-docs/blob/master/docs/commands.mdx

## 9.2 Enderloom CLI product law

**Anything meaningful the GUI can do through shared domain logic should be commandable without the GUI. Anything the CLI does should appear in the GUI task/evidence history.**

No separate “CLI implementation” that duplicates business logic.

## 9.3 CLI modes

- human-readable terminal output;
- optional rich TUI/interactive shell;
- stable JSON output;
- JSONL streaming event mode;
- quiet/noninteractive CI mode;
- `--dry-run`;
- `--explain` / “why will this happen?”;
- `--wait` / `--follow`;
- bounded `--timeout` that does not confuse orchestrator timeout with Minecraft hang;
- explicit `--snapshot` / `--rollback` controls for destructive operations;
- structured exit codes;
- stdin/stdout composition;
- shell completion for PowerShell, Bash, zsh and fish;
- Windows-first usability without weakening cross-platform behavior.

## 9.4 CLI command families

At minimum design shared commands for:

### Core / identity

- `enderloom project ...`
- `enderloom instance ...`
- `enderloom content ...`
- `enderloom provider ...`
- `enderloom evidence ...`
- `enderloom task ...`

### Mods / packs

- `enderloom mod search|add|remove|update|why|inspect|diff|test|repair|port`
- `enderloom pack import|export|lock|diff|update|test|migrate|publish`
- dependency solve and provenance queries;
- multi-source provider resolution.

### Configs

- `enderloom config list|find|show|diff|merge|migrate|validate|profile|apply|rollback|test`

### Hotkeys

- `enderloom hotkey list|conflicts|profile|diff|bind|unbind|resolve|apply|export|import`

### Launch/runtime

- `enderloom launch ...`
- `enderloom runtime list|attach|status|stop|restart|logs`
- join server/world/test fixture where supported;
- account/session selection through secure existing account subsystem.

### Console / commands / RCON

- `enderloom console attach|send|follow`
- `enderloom command run|script|history|complete`
- `enderloom rcon ...`
- never print stored secrets by default.

### Testing / GameTest / scenarios

- `enderloom test run|suite|compare|bisect|minimize|soak`
- `enderloom gametest run|list|generate`
- `enderloom scenario run|record|replay|generate`
- real client / integrated server / dedicated server / protocol-bot modes clearly labeled.

### Performance

- `enderloom perf capture|compare|attribute|history`
- `enderloom profile spark|jfr|heap|render|startup|network`
- `enderloom incident record|mark|save|show|compare|bundle`

### World / NBT / pregeneration

- `enderloom world inspect|copy|snapshot|diff|repair|convert|prune|restore`
- `enderloom chunk select|export|import|delete|retrogen`
- `enderloom nbt show|find|diff|set|remove`
- `enderloom pregen plan|start|pause|resume|cancel|status|trim`
- destructive commands always plan/snapshot/confirm according to policy.

### Studio / development

- `enderloom dev build|test|client|server|package|remap`
- `enderloom studio validate|generate|convert|render-proof`
- `enderloom model inspect|convert|qa`
- `enderloom data validate|trace|test`
- `enderloom bedrock create|validate|deploy|test|package`

### Conversion / migration

- `enderloom convert ...`
- `enderloom port ...`
- `enderloom migrate pack ...`

### Repair / AI

- `enderloom repair create|bundle|submit|adopt|build|test|retry|install|rollback|status`

### Knowledge / Wiki

- `enderloom wiki build|validate|diff|export|serve`
- `enderloom why <mod-or-content>`

### Security

- `enderloom security scan|diff|sbom|provenance|quarantine`

### Brain

- `enderloom brain evidence|candidate|promote|challenge|contradictions|rollback|export`

## 9.5 Command recording and GUI parity

- Every GUI action can expose **Copy as CLI** when commandable.
- CLI command/task appears immediately in Enderloom’s task history.
- Any long command returns stable task ID and can be resumed/observed.
- Same dry-run plan object is used by GUI and CLI.
- Same rollback object is used by GUI and CLI.
- Same evidence IDs are referenced by both.

## 9.6 Declarative workflow runner

Support reproducible automation files that compose normal typed operations, for example:

`clone instance -> update selected mods -> migrate configs -> launch server -> wait ready -> run GameTests -> launch client -> run scenario -> capture performance -> compare baseline -> generate report`

Requirements:

- versioned schema;
- explicit dependencies;
- retry policy only on transient classes;
- resumable steps;
- artifact/evidence IDs between steps;
- secrets referenced securely, never embedded by default;
- dry-run graph;
- CI templates;
- no arbitrary hidden success scripting.

## 9.7 Why Enderloom should be better than the current tools

Enderloom’s advantage is **integration**:

- PortableMC-like launch knows the exact mod/config/world evidence graph.
- Ferium/packwiz-like updates automatically invalidate/re-run affected tests.
- mcman-like server changes feed the same config/provenance system.
- HeadlessMC-like testing can escalate to native rendered-client proof when necessary.
- MCC/protocol-bot runs are marked as protocol-only evidence, never visual proof.
- MCA-style world operations are transactional and tied to snapshots/rollback.
- Chunky-like pregeneration records measured performance/storage evidence.
- spark/JFR/heap/render/incident captures attach directly to culprit projects and Repair Jobs.
- Creator Tools-like Bedrock validation/deployment feeds the same Studio/CLI/test history.

---

# 10. First-Launch / Update UX Testing inside Performance / Testing

Accepted because it strengthens testing and CLI automation.

Automate controlled first-use/update scenarios such as:

- fresh instance install;
- first launch;
- world creation;
- open inventory;
- open important mod screens;
- open quest/guidebook;
- verify Hotkeys/conflicts;
- resource-pack selection/reload;
- shader/render-stack smoke where configured;
- join dedicated server;
- reconnect;
- restart;
- pack update;
- reopen copied existing world after update;
- open critical container/machine/UI flows;
- verify localization/font scaling when applicable.

Detect:

- dead/overlapping buttons;
- inaccessible controls;
- missing textures/fonts;
- UI only-crashes;
- broken default Hotkeys;
- first-run prompts blocking automation;
- config generated only after first launch;
- missing required resource packs;
- old-world migration failures;
- regressions in startup/performance.

Use actual client interaction/capture where GUI behavior is the subject; protocol/headless substitutes cannot prove rendered UI.

---

# 11. Premium Whole-Modpack Migration Engine

**Premium feature.**

The unit of migration is the **entire playable pack**, not a bag of independently replaced JARs.

Example target:

`Forge 1.20.1 pack -> NeoForge 1.21.x pack`

## 11.1 Migration inventory

Track and migrate/resolve:

- every mod/library;
- loader/API changes;
- compatible upstream version;
- authorized source port where upstream target is missing and user requests/has rights;
- configs and schema changes;
- Hotkeys;
- KubeJS/CraftTweaker/scripts;
- datapacks;
- resource packs;
- shaders;
- quests;
- guidebooks;
- Premium Wiki;
- recipes/tags/loot/worldgen overrides;
- server configs/plugins where pack includes them;
- worlds/save registries/data fix requirements;
- player data/inventories;
- content IDs renamed/removed/replaced;
- compatibility/integration mods.

## 11.2 Migration plan

For every source component mark:

- direct compatible update;
- loader-native replacement;
- source port required;
- semantic conversion required;
- removed because genuinely obsolete and equivalent behavior now exists elsewhere **only with explicit evidence/user plan**;
- blocker;
- unknown.

No silent deletion.

## 11.3 Config / key / knowledge migration

- three-way config migration;
- Hotkey mapping migration;
- quest/content ID remapping;
- wiki regeneration;
- “why installed?” graph recalculation;
- update world/content ownership backlinks.

## 11.4 World migration

Always operate on a copy/snapshot first.

- open migrated world in target stack;
- missing registry/content scan;
- data-version upgrade evidence;
- chunk/entity/block-entity errors;
- dimension/portal checks;
- player inventory/equipment checks;
- critical structure/worldgen checks;
- save/restart/reopen proof.

## 11.5 Acceptance

A migration report must show:

- exact source and target fingerprints;
- coverage percentage by semantic inventory, not merely JAR count;
- unresolved gaps;
- runtime client/server proof;
- progression/softlock result;
- config migration result;
- Hotkey conflicts;
- performance before/after where comparable;
- old-world result;
- rollback/source archive.

---

# 12. “Why is this installed?” as a first-class graph question

This is integrated with the Premium Wiki but available throughout Enderloom.

For a mod/library/plugin/resource/data component answer with concrete edges:

- direct user/author choice;
- required dependency chain;
- optional integration actively used by another installed project;
- script/quest/datapack/resource reference;
- config reference;
- world registry/content footprint;
- server/client role;
- performance/compatibility purpose;
- tool/developer/test-only role;
- unknown/manual artifact.

**Can I remove it?** must perform an impact plan:

1. dependency graph;
2. script/data/quest/wiki references;
3. config references;
4. world-content impact;
5. compatibility/test contracts;
6. optional isolated removal boot/runtime scenario for important packs;
7. exact rollback plan.

Wiki pages should display these edges in human-friendly prose and graphs.

---

# 13. Evidence Brain — self-improvement without poisoning itself

Enderloom should learn aggressively from its own verified work, but **AI output, random logs, community text and one-off coincidences never become global truth automatically.**

Use one evidence-backed learning substrate with domain facets (Repair, Performance, Config, Compatibility, Conversion, Model/Asset, World, CLI/Testing) rather than unrelated “brains” that can contradict each other silently.

## 13.1 Learned unit

A learned fact/rule stores:

- proposition;
- domain;
- exact scope;
- project/mod/plugin identifiers;
- artifact hashes;
- Minecraft version;
- loader/version;
- Java/runtime;
- OS/hardware/render stack when material;
- config fingerprint or relevant keys;
- source/evidence IDs;
- observed result;
- confidence;
- counterexamples;
- creation/promotion time;
- staleness/invalidation dependencies;
- rule version;
- author: deterministic system / user / AI candidate / imported research;
- rollback/supersession link.

## 13.2 Promotion ladder

Learning moves through explicit states:

1. **Observation** — something happened once.
2. **Hypothesis** — plausible causal/useful pattern.
3. **Candidate rule** — has supporting evidence and a defined scope.
4. **Verified scoped rule** — deterministic reproduction or sufficiently strong repeated proof in that scope.
5. **Generalized rule** — survives challenge fixtures across multiple independent scopes and has no material counterexample.

AI can suggest stages 2-3. **AI alone cannot promote to verified/generalized truth.**

## 13.3 Anti-poisoning rules

- Treat text inside logs, source comments, READMEs, websites, configs and model metadata as **data**, not instructions to the brain.
- Never let prompt-injection-like text alter safety/policy/learning rules.
- Do not generalize from one mod/version when a scoped rule is sufficient.
- Strongly key findings to hashes/versions so a new artifact invalidates old assumptions.
- Record negative results and rejected fixes.
- Detect contradictions rather than picking the newest statement blindly.
- Maintain trusted-source tiers for external research.
- Community anecdotes remain hypotheses unless reproduced.
- Imported AI/web advice is never evidence of runtime success by itself.
- Secrets/auth tokens are redacted before any durable learning.
- User correction immediately supersedes the affected interpretation while preserving audit history.

## 13.4 Challenge before generalization

Before promoting broadly:

- rerun targeted fixture;
- test relevant alternative version/loader/config when generalization claims it;
- use hold-out/golden fixtures;
- check for regression/false positive;
- search contradiction ledger;
- require stronger proof for destructive/security-related rules.

## 13.5 Shadow mode for new heuristics

New heuristics first run in **shadow mode**:

- produce recommendation/prediction;
- do not automatically mutate user state;
- compare prediction to actual outcome;
- collect false positives/negatives;
- only enable auto-action after acceptance criteria are met.

## 13.6 Brain rollback and audit

- inspect “why does Enderloom believe this?”;
- see exact evidence;
- see rule lineage;
- downgrade/promote/supersede;
- disable rule;
- rollback a bad promotion;
- export/import evidence bundles without merging as truth automatically;
- version brain schema/rules;
- deterministic self-tests.

## 13.7 Repair Brain continuity

Repair Brain knowledge should become one facet of this system:

- known failure fingerprints;
- known successful repair lineage;
- rejected approaches;
- exact applicability scope;
- first causal owner;
- repair acceptance evidence;
- no-repeat history;
- stronger next diagnostic route after repeated no-progress attempts.

The same principles extend to config fixes, performance optimizations, port mappings, model reconstruction corrections and world repairs.

---

# 14. Wave A architecture consequences

Wave A is still the exact next implementation action. It must **not** attempt to build all features in this document immediately, but it must avoid architecture choices that make them separate databases later.

Add/ensure typed/extensible entities or equivalent domain contracts for:

- `StudioProject` / `StudioDocument` / `StudioSelection`;
- `ConfigDocument` / `ConfigKey` / `ConfigMigration` / `ConfigProfile`;
- `HotkeyBinding` / `HotkeyProfile` / `HotkeyConflict`;
- `IncidentRecording` / `IncidentMarker` / `IncidentTimelineEvent`;
- `DataTrace` / `FunctionInvocation` / `WatchValue`;
- `ProgressionNode` / `ProgressionEdge` / `SoftlockFinding`;
- `KnowledgePage` / `KnowledgeEdge` / `KnowledgeBuild`;
- `PackMigrationPlan` / `MigrationComponent` / `MigrationFinding`;
- `LearnedObservation` / `LearnedRule` / `RuleEvidence` / `RuleContradiction` / `RulePromotion`;
- CLI operation schemas must be generated from or map directly to the same operation/capability registry used by GUI/service.

Avoid opaque JSON dumping as the only model. Unknown/future extensions may have raw payloads, but core identity/evidence/staleness relationships must stay typed and queryable.

---

# 15. Definition of done for this spec

This product direction is respected only if:

- users do not need to learn ten separate “Studio” products;
- opening related content keeps context and cross-links intact;
- config upgrades preserve user intent and upstream evolution;
- Hotkeys is a real dedicated top-level workflow;
- Black Box can turn “it froze” into a timestamped evidence timeline;
- Data/Function Debugger can explain state transitions and generate regression scenarios;
- model/reference reconstruction reaches Minecraft-native runtime proof;
- Premium Wiki looks and behaves like a real polished knowledge product, not generated README spam;
- whole-pack migration is measured by semantic/playability coverage, not file count;
- every meaningful operation can be driven through a robust CLI when technically possible;
- CLI/GUI share domain logic and task/evidence history;
- Evidence Brain learns from verified outcomes while remaining inspectable, scoped, challenge-tested and reversible;
- excluded Friend Hosting and Voice/Social proposals are not reintroduced through scope creep.
