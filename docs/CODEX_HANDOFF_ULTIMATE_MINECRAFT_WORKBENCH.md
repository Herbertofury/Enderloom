# Codex Handoff — Enderloom Ultimate Minecraft Workbench

**Date:** 2026-09-07  
**Repository:** `Herbertofury/Enderloom`  
**Branch:** `main`

## Objective

Continue Enderloom as the one integrated Minecraft workbench. Do not restart research, replace accepted launcher/catalog/browser behavior, or build disconnected mockup tabs.

The current product contracts are:

1. `docs/ENDERLOOM_MASTER_REQUIREMENTS.md`
2. `docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md`
3. `docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md` — **mandatory exhaustive ecosystem challenge-pass addendum**
4. `docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md` — **mandatory challenge pass from recurring real Minecraft Dev Kit jobs**
5. `docs/ENDERLOOM_UNIFIED_STUDIO_CONFIG_HOTKEY_CLI_BRAIN_SPEC.md` — **mandatory third-pass product architecture: one Studio, config intelligence, Hotkeys, Black Box, Data Debugger, full CLI, Premium Wiki/migration and evidence-backed self-improvement**
6. `docs/ENDERLOOM_OPENAI_AI_OPERATOR_SPEC.md` — **mandatory full OpenAI/ChatGPT/Codex AI execution layer with GUI/CLI/headless/MCP capability parity and Minecraft-native acceptance**
7. `docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md`
8. `docs/PREMIUM_TESTING_LAB_SPEC.md`
9. `docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md`
10. `docs/CODEX_HANDOFF_PREMIUM_TESTING_CLI.md`
11. GitHub issue #1 — existing Performance Lab continuity
12. GitHub issue #3 — Ultimate Minecraft Workbench expansion tracker

## Non-negotiable product law

**No feature islands. No shadow databases. No duplicated truth.**

Every relevant feature must consume and update the same canonical Minecraft project/evidence graph. Performance results must surface directly on mods/Favorites/update planning/repair. Crashes must link to exact culprit mod/source/config. World hotspots must link to owning mod content when known. Config/version changes invalidate only dependent evidence. Conversion and port failures can enter the same repair/testing loop. Returned AI artifacts update repair/source/performance/compatibility provenance rather than living in a separate subsystem.

The audit domains are governed by the same law. Security findings, mapping symbols, Mixin injections, Bedrock script profiles, visual-logic graphs, schematics, particles/audio/UI assets, registry entries, protocol captures, collaboration change sets, world snapshot deltas, hardware profiles, localization bundles, permission findings, stall incidents, render observations, bisect runs, GameTest scenarios, config migrations, Hotkey conflicts, Black Box incident timelines, progression graphs, wiki knowledge edges, pack migrations, learned evidence rules, AI jobs, AI provider/model/thread state, AI tool invocations, approvals, failure packets and eval runs must all plug into the same typed graph/evidence/task model rather than spawning isolated stores.

## Unified Studio UI law

**Do not build endless top-level creation tabs.** Enderloom gets one top-level **Studio**, closer in spirit to Unreal Engine / Unity: a composable workspace with a Project/Content Browser, Outliner/Hierarchy, Inspector/Details, main contextual editor/viewport, code/data/node editors, animation timeline/curves, console, problems, build/test, source control, integrated browser/docs and evidence panes.

Modeling, texturing, animation, authorized image/GIF/video reference reconstruction, particles, audio, UI/HUD, quests/progression, datapacks, worldgen, Java/Bedrock/plugin development, visual gameplay authoring, wiki authoring and related creation capabilities are contextual Studio tools — **not separate top-level “Studios.”**

Project types are contexts, not different apps. Opening a model, quest, script, source symbol, recipe, worldgen definition, Bedrock pack or Java mod should reconfigure the same workspace around that selection and preserve navigation/provenance.

### Explicit top-level exception: Hotkeys

**Hotkeys is a dedicated first-class Enderloom tab.** It must inventory vanilla/mod/custom key systems where discoverable, expose ownership/default/current bindings, detect contextual conflicts, support fast rebinding/conflict resolution/profiles/migration/import/export, and integrate with mod detail, updates, first-launch QA, wiki controls and CLI.

### Explicitly rejected third-pass proposals

Do **not** add the proposed Enderloom-owned Friend Hosting / P2P/reverse-tunnel shared-world feature.  
Do **not** add the proposed Voice/Social compatibility center.  
Do not reintroduce either through scope creep.

## Full OpenAI / ChatGPT / Codex AI-operator law

`docs/ENDERLOOM_OPENAI_AI_OPERATOR_SPEC.md` is a mandatory core architecture contract, not a future “AI button.”

**North-star:** anything a capable human can do through Enderloom’s canonical tools should eventually be callable by an AI operator through the same operation/task/evidence layer with equal or stronger verification.

The AI operator must support three synchronized OpenAI lanes:

1. **Native OpenAI API lane** — Responses API / Agents SDK, typed Enderloom tools, MCP, files/retrieval/web/tool calling/background/multi-agent capabilities where currently supported. This lane uses normal OpenAI API authentication, billing and rate limits.
2. **Embedded Codex lane** — supported Codex SDK/app-server/noninteractive CLI-style automation for coding-agent control, local repositories/worktrees, streamed events/approvals and resumable coding workflows.
3. **In-app ChatGPT browser lane** — reuse the user’s authenticated ChatGPT web session when selected, respecting normal subscription quotas/UI/access controls, and feed returned artifacts into the same Enderloom quarantine/build/test loop.

Enderloom itself should expose an MCP server over the canonical operation registry so ChatGPT/Codex/external agents can safely invoke real Enderloom capabilities rather than inventing shell commands or guessing project state.

AI capability parity applies to:

- complete Java mod creation from specs/ideas;
- authorized image/GIF/video/model-reference reconstruction into Minecraft-native models/textures/animations/gameplay;
- Bedrock -> Java conversion;
- Minecraft-version and loader ports;
- repair/optimization;
- whole-modpack migration;
- models/mobs/assets;
- quests/progression/data/scripts/worldgen;
- config/hotkey management;
- world/NBT operations on safe copies;
- Performance/Testing/Black Box/GameTest/scenario/bisect/profile workflows;
- Premium Wiki/knowledge/release packaging;
- security/provenance/SBOM checks.

**AI cannot self-declare success.** Enderloom’s acceptance ledger and strongest applicable Minecraft runtime evidence remain authoritative.

### Speed-without-sacrifice law

“Fast” means:

- warm JDK/Gradle/loader/assets/mapping caches;
- prepared sandboxes/QA worlds;
- diff-aware test invalidation;
- cheap decisive static/GameTest/server gates first;
- persistent safe runtime supervisors/reload where real;
- headless/protocol lanes when those are authoritative;
- isolated parallel specialists/worktrees;
- overlapping model time with local build/test work;
- stable cached project context and evidence deltas;
- resuming the same AI thread after failure rather than restarting.

It **never** means replacing required native client, integrated-server, visual, persistence, multiplayer, performance or packaged-production proof with a weaker shortcut.

## In-app browser rule

Enderloom's existing persistent Chromium browser is an execution surface, not an escape hatch.

For the default browser-chat repair lane, Enderloom should be able to:

1. open/resume the real provider conversation inside Enderloom;
2. use the user's existing authenticated browser session;
3. prepare and visibly review the exact outbound evidence packet;
4. submit the prompt and attachments;
5. persist conversation/task identity;
6. detect completion, user-action-required, provider UI failure, or quota/rate-limit state;
7. adopt only returned files tied to the active repair job;
8. quarantine/hash/inspect them;
9. build them;
10. test them in an isolated Minecraft sandbox;
11. generate precise failure evidence for any failed gate;
12. send the failure back to the same conversation;
13. repeat while materially progressing;
14. install only after Enderloom's own acceptance gates pass;
15. post-install smoke the actual connected instance and rollback automatically on failure.

The default web-chat lane should not require a separate API key, but it must respect the provider's normal login, plan limits, quotas, rate limits, UI, terms, CAPTCHAs, paywalls, DRM, and access controls. Never bypass them.

## Bedrock / Marketplace rule

Treat Bedrock as a first-class content ecosystem. Parse behavior/resource packs, manifest v2/v3, Script API, Molang, entities, components, items, blocks, recipes, loot, spawn rules, worldgen, geometry, textures, animation controllers, animations, render controllers, particles, sounds, localization, structures and references into the shared semantic model.

Marketplace pages may be researched and viewed in the integrated browser. Conversion requires user-authorized accessible source bytes. Never bypass DRM, encryption, paywalls, entitlement checks or protected delivery to obtain Marketplace content.

Bedrock development support must also cover the actual Creator development loop: project creation/deployment, Retail/Preview target versions, TypeScript/JavaScript debugging, Content Log, Script Debugger, Script Profiler, Diagnostics/Debug Utilities, Bedrock Editor projects and Editor Extensions, with their evidence normalized into the same Enderloom project/test/performance graph.

## Gap-audit domains — mandatory coverage

`docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md` adds capability families that were materially under-specified in the first backlog. Codex must preserve architecture slots and acceptance paths for all of them:

- Security & Supply-Chain Center, capability-diff updates, SBOM/license/provenance and quarantine.
- Full Bedrock Developer Center: Script Debugger/Profiler, Creator Tools-style deployment, Content Log, Bedrock Editor/Editor Extensions.
- Enderloom Developer IDE with language intelligence, tasks, terminal and Git.
- Mapping/Remap/Mixin/Bytecode Lab spanning Mojmap/Yarn/Intermediary/Parchment/SRG/MCP and production remap/linkage proof.
- Visual Gameplay Authoring / native procedure and AI-behavior graphs.
- Misode/MCStacker-grade command/data/worldgen generation.
- Axiom/WorldEdit/Litematica-grade 3D build, schematic and blueprint workflows.
- Particle/audio/UI/font/material authoring, including modern PBR/Vibrant Visuals-aware paths where applicable.
- Runtime Registry/Recipe/Content Explorer with owning-mod/source backlinks and museum/QA generation.
- Full plugin/proxy ecosystem: Bukkit/Spigot/Paper/Purpur/Folia/Velocity and truthful Folia-threading validation.
- Geyser/Floodgate, ViaVersion-family and packet/protocol/network-chaos testing.
- Collaboration/shared-instance/team-pack workflows and portable/offline project interchange, excluding the separately rejected Friend Hosting/P2P proposal.
- Enderloom MCP server plus optional local-AI provider adapters, always behind normal safety/build/runtime gates.
- Legacy archaeology for old Minecraft versions/loaders/build systems/mappings and old Bedrock schemas.
- Hot-reload/fast-dev loop with truthful restart boundaries.
- Multiplayer/chaos/soak scenarios.
- Worldgen/seed/pregeneration/retrogen intelligence.
- Incremental world snapshot version control and selective restore.
- Dedicated Java<->Bedrock resource-pack conversion.
- Replay/capture/showcase tooling based on actual runtime evidence.
- Hardware/JVM/render advisor using measured local evidence.
- Accessibility/localization tooling for Enderloom and projects.
- Analytics/issue/changelog intelligence without fabricated scores.
- Pack/release permission and redistribution policy gates.
- “No Unknown Files” invariant for imports/conversions/AI archives.
- Canary/staged update engine.
- Real remote-server adapters such as SSH/SFTP/provider APIs only when legitimately supported.

`docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md` additionally makes recurring real-world debugging/optimization work explicit instead of leaving it implied:

- freeze/lock/deadlock forensics with thread dumps, JFR, lock ownership and teleport/chunk-stall evidence;
- heap/allocation/memory-leak analysis;
- render-thread/GPU/frame-time/client profiling and render-stack awareness;
- concurrency-correctness checks for async/off-thread optimization work;
- dependency-aware automated mod bisection and delta-debugging into a minimal reproducer;
- unified Forge/NeoForge/Fabric/Bedrock GameTest/scenario compilation plus Probe fallbacks;
- reusable deep compatibility contracts such as Curios/Trinkets, Sophisticated Backpacks-style and Apotheosis-style interaction suites;
- KubeJS/CraftTweaker/datapack/scripted-modpack logic understanding and migration;
- startup/boot-time attribution;
- world recreation/seed/dimension-metadata recovery;
- strict performance-patch acceptance proving quality/content/config/network/persistence parity;
- direct `incident -> source symbol -> patch -> build -> sandbox -> profile compare -> install/rollback` flow.

## Third-pass accepted expansion — mandatory coverage

`docs/ENDERLOOM_UNIFIED_STUDIO_CONFIG_HOTKEY_CLI_BRAIN_SPEC.md` locks the following product requirements:

- **Unified Studio:** professional context-sensitive creation environment, not endless top-level tool tabs.
- **Progression / Softlock Intelligence:** recipe/loot/trade/dimension/quest/script/config/worldgen dependency graph with unreachable/circular-gate detection and scenario generation.
- **Configuration Intelligence:** canonical config ownership, three-way semantic migration, comment/order preservation, renamed/type/range/enum change detection, profiles/overlays, orphan handling, config A/B performance evidence, repair and rollback.
- **Hotkeys tab:** complete binding inventory, contextual conflict detection, fast fix, profiles, migration and CLI parity.
- **Black Box Incident Recorder:** bounded rolling client/server/perf/thread/JFR/render/network/world/action timeline with manual and automatic triggers, healthy-vs-broken comparison, bisect/scenario/repair integration.
- **Minecraft Data / Function Debugger:** `.mcfunction` call graphs/timing/coverage, scoreboard/storage/NBT watches, state diffs, controlled tracepoints, command-block networks, predicate/recipe/loot/advancement tracing, script bridges and regression generation.
- **Model / Texture / Animation / Reference Reconstruction:** all previously requested MCModels/Blockbench-style work, authorized image/GIF/video reconstruction, rigging/UV/animation/interchange, and actual Minecraft visual QA inside the one Studio.
- **Premium Wiki:** gorgeous searchable, versioned, offline-capable documentation derived from the real graph, including recipes, progression, controls, models/runtime captures, provider/source links and “Why is this installed?” reasoning.
- **Performance / Testing Control Plane:** aggressive CLI parity and automation across launcher/mod/pack/config/hotkey/runtime/console/RCON/GameTest/scenarios/perf/world/NBT/pregen/dev/conversion/repair/wiki/security/brain operations.
- **Premium Whole-Pack Migration:** version/loader migration of mods, configs, hotkeys, scripts, quests, data/resources, worlds and compatibility with semantic coverage + real runtime proof.
- **Evidence Brain:** Repair-Brain-style self-improvement with explicit observation→hypothesis→candidate→verified→generalized promotion, hash/version scope, contradictions, negative results, shadow mode, challenge fixtures and rollback. AI/web/community text never self-promotes to verified truth.

### Current CLI benchmark direction

Enderloom should exceed the useful capability families currently represented by PortableMC, Prism Launcher CLI, Ferium, packwiz, mcman, mrpack-install, Mojang Minecraft Creator Tools CLI (`mct`), HeadlessMC/MC-Runtime-Test, Minecraft Console Client, RCON CLIs, MCA Selector CLI, Chunky commands, spark commands, NBT CLIs and vanilla/loader GameTest tooling.

The goal is **not** to clone them. The goal is one Minecraft control plane where GUI/CLI/automation all call the same typed operation registry, long operations have resumable task IDs, destructive actions have shared dry-run/snapshot/rollback semantics, and all outputs become normal Enderloom evidence.

## Exact implementation order

### Wave A — Integration Spine — START HERE

Implement the shared infrastructure required by every later feature:

- canonical `Project` / `Release` / `Artifact` / `FileHash` identities;
- provider/source aliases;
- instance/world/config/dependency links;
- `EvidenceArtifact` and evidence provenance;
- explicit staleness/invalidation dependencies;
- durable resumable task model;
- transactional mutation + rollback primitive;
- universal project/mod detail domain object;
- shared operation/capability registry suitable for GUI + service + CLI + MCP + AI;
- migration tests and compatibility with existing Enderloom data;
- **extensible typed entity/evidence model that can represent the mandatory audit domains without collapsing them into opaque JSON or requiring another architecture rewrite.**

At minimum, Wave A must leave first-class typed extension paths for security/artifact capabilities; source/mapping/Mixin symbols; plugins/proxies/protocols; Bedrock creator projects/script profiles/editor extensions; visual logic/gameplay; schematics/blueprints; asset families; runtime registry content; collaboration changes; remote targets; protocol captures; world snapshot deltas; hardware profiles; localization and permission findings; stall/thread/JFR/memory/render evidence; concurrency findings; bisect/minimal-reproducer objects; scenario definitions/runs; compatibility contracts; script projects; startup profiles; world-recovery findings; performance-patch ledgers; Studio projects/documents/selections; config documents/keys/migrations/profiles; Hotkey bindings/profiles/conflicts; incident recordings/markers/timeline events; data traces/function invocations/watches; progression nodes/edges/softlock findings; knowledge pages/edges/builds; pack migration plans/components/findings; learned observations/rules/evidence/contradictions/promotions; `AiMinecraftJob`; `AcceptanceContract`; `AiProvider`; `AiModelProfile`; `AiThread`; `AgentRun`; `AgentSpecialist`; `AiToolInvocation`; `ApprovalRequest`; `ContextArtifact`; `ContextSnapshot`; `FailurePacket`; `AcceptanceGate`; `GateResult`; `ModelPolicy`; `UsageObservation`; `EvalCase`; `EvalRun`.

CLI/MCP/AI operation schemas must map directly to the same operation/capability registry used by GUI/service. Do not create separate business logic for any execution surface.

**First vertical acceptance target:** pick one real installed mod and prove one canonical detail/evidence object is consumed by Mod Manager, Catalog, CLI/service and Testing without duplicate truth.

Do not build broad new UI before this works.

### Wave B — Universal Mod Surface

Then implement the high-value integrated right-click/detail actions:

- verified source/provider submenu;
- configs/files association;
- source repository identity;
- media/video preview model;
- performance badge projection;
- repair/optimize/port/convert actions;
- direct Split/Browser navigation;
- security/provenance summary;
- registry/content ownership links;
- developer/mappings/Mixin affordances;
- direct incident/performance/bisect/scenario entry points;
- “Why is this installed?” evidence;
- Hotkeys and config links;
- AI action entry points that create normal `AiMinecraftJob` objects rather than hidden chat state.

### Wave C — Performance Lab continuity

Resume issue #1 exactly from its current implementation contract. Do not redo its research. Performance results must write into the shared graph and immediately appear on the normal mod surface.

Later adapters may add Bedrock Script Profiler evidence, network/protocol evidence, hardware-profile normalization, freeze/JFR evidence, heap evidence, render/GPU evidence, boot-time evidence and Black Box capture, but none of that should delay the current issue #1 critical path.

CLI/Testing expansion should continue through the same domain/capability registry rather than a second CLI architecture. The AI operator must call these same testing/profiling operations instead of maintaining its own weaker testing path.

### Wave D — Autonomous Repair Loop

Follow `docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md`. Implement the full real vertical slice before broad AI provider proliferation:

`RepairJob/AiMinecraftJob -> evidence bundle -> in-app ChatGPT web adapter -> returned candidate -> security/quarantine scan -> build -> sandbox runtime gate -> failure packet -> same conversation retry -> passing candidate -> transactional install -> actual-instance smoke -> rollback proof`

This browser-chat lane becomes one provider transport of the broader `AiMinecraftJob` model. MCP/OpenAI API/Codex SDK-app-server lanes are later provider interfaces; they must not weaken or postpone the real browser vertical acceptance.

Repair outcomes, rejected approaches and exact acceptance evidence feed the scoped Evidence Brain only through the promotion/anti-poisoning rules.

### Wave E onward

Continue the waves in `docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md`, expanded by all mandatory audit supplements:

- one unified Studio shell and contextual creation/development tooling;
- full OpenAI/ChatGPT/Codex AI operator over GUI/CLI/headless/MCP capability parity;
- Bedrock Creator/developer/debugger/editor capabilities inside Studio;
- UMIR and first rich Bedrock->Java conversion;
- Java version/loader port engine, mappings lab and Stonecutter-style multiversion workspace;
- Developer IDE + visual gameplay authoring inside Studio;
- command/data/worldgen generation + Data/Function Debugger inside Studio;
- World tools + 3D building/schematics/blueprints + snapshot version control + recovery doctor;
- model/texture/animation/reference reconstruction plus particle/audio/UI/font/material tools inside Studio;
- dedicated Hotkeys tab;
- Progression/Softlock Intelligence;
- Premium Wiki + Why-is-this-installed graph;
- plugins/proxies/crossplay/protocol/network tooling (excluding rejected Voice/Social center);
- freeze/heap/render/concurrency/bisect/GameTest/startup profiling + Black Box incident recording;
- full CLI/declarative workflow control plane;
- collaboration/MCP/local-AI/legacy-version tooling (excluding rejected Friend Hosting/P2P feature);
- Premium whole-pack migration;
- Evidence Brain/self-improvement;
- OpenAI/Codex eval suite, model-policy routing, specialist orchestration and anti-false-pass benchmarks;
- canary/security/policy/release hardening;
- cross-system intelligence;
- ecosystem parity challenge pass.

## Implementation discipline

- Preserve existing accepted functionality.
- Reuse current Rust/service/browser architecture rather than creating parallel systems.
- Once canonical target + safe edit are known, implement rather than continuing read-only research.
- Use targeted tests during iteration and broad gates at convergence.
- Build a fresh runnable Enderloom artifact after implementation changes.
- Exercise the actual built app/CLI path, not only unit tests.
- For Minecraft behavior, use the strongest applicable native runtime proof.
- Never use the user's live instance/world as automated-test scratch space.
- Never silently delete content to make conversions/ports compile.
- Never call static-risk findings measured performance.
- Never install an AI-returned binary before security/quarantine/validation gates.
- AI cannot self-declare acceptance; only Enderloom gate evidence closes requirements.
- Every recommendation must expose `Why?` / evidence.
- Every import/conversion must classify every source file or report it as unknown/unsupported.
- Never call an async/off-thread optimization successful until thread-safety and persistence gates pass.
- Never call an FPS optimization successful until visual/content parity and identical-scenario comparison pass.
- Generated Studio source/data stays inspectable and editable; visual authoring must not create a black-box prison.
- Config migration must preserve user intent and upstream evolution through explicit three-way semantics.
- Evidence Brain cannot promote AI/web/community text to verified truth without real evidence/challenge.
- Never lower the final quality/acceptance contract merely because a headless or faster route exists.
- Every material checkpoint must preserve exact repo/branch/commit and next action.

## Quality target

The finished product should be easier to use than the collection of launchers, profilers, world editors, NBT tools, model tools, creator IDEs, Bedrock editors, pack tools, security scanners, server panels, protocol tools, debuggers, mapping tools, GameTest harnesses, CLI managers, wiki generators, config migrators, browsers, coding agents and ad-hoc scripts it replaces, while being more capable because all of those workflows share identity, evidence, testing, repair, rollback, AI operation and self-improving verified knowledge.

Start Wave A now. Do not stop at planning or mockups.
