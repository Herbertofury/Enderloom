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
5. `docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md`
6. `docs/PREMIUM_TESTING_LAB_SPEC.md`
7. `docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md`
8. `docs/CODEX_HANDOFF_PREMIUM_TESTING_CLI.md`
9. GitHub issue #1 — existing Performance Lab continuity
10. GitHub issue #3 — Ultimate Minecraft Workbench expansion tracker

## Non-negotiable product law

**No feature islands. No shadow databases. No duplicated truth.**

Every relevant feature must consume and update the same canonical Minecraft project/evidence graph. Performance results must surface directly on mods/Favorites/update planning/repair. Crashes must link to exact culprit mod/source/config. World hotspots must link to owning mod content when known. Config/version changes invalidate only dependent evidence. Conversion and port failures can enter the same repair/testing loop. Returned AI artifacts update repair/source/performance/compatibility provenance rather than living in a separate subsystem.

The audit domains are governed by the same law. Security findings, mapping symbols, Mixin injections, Bedrock script profiles, visual-logic graphs, schematics, particles/audio/UI assets, registry entries, protocol captures, collaboration change sets, world snapshot deltas, hardware profiles, localization bundles, permission findings, stall incidents, render observations, bisect runs, GameTest scenarios and world-recovery evidence must all plug into the same typed graph/evidence/task model rather than spawning isolated stores.

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
- Misode/MCStacker-grade command/data/worldgen generator studio.
- Axiom/WorldEdit/Litematica-grade 3D build, schematic and blueprint workflows.
- Dedicated particle/audio/UI/font/material studios, including modern PBR/Vibrant Visuals-aware paths where applicable.
- Runtime Registry/Recipe/Content Explorer with owning-mod/source backlinks and museum/QA generation.
- Full plugin/proxy ecosystem: Bukkit/Spigot/Paper/Purpur/Folia/Velocity and truthful Folia-threading validation.
- Geyser/Floodgate, ViaVersion-family and packet/protocol/network-chaos testing.
- Collaboration/shared-instance/team-pack workflows and portable/offline project interchange.
- Enderloom MCP server plus optional local-AI provider adapters, always behind normal safety/build/runtime gates.
- Legacy archaeology for old Minecraft versions/loaders/build systems/mappings and old Bedrock schemas.
- Hot-reload/fast-dev loop with truthful restart boundaries.
- Multiplayer/chaos/soak scenarios.
- Worldgen/seed/pregeneration/retrogen intelligence.
- Incremental world snapshot version control and selective restore.
- Dedicated Java<->Bedrock resource-pack conversion.
- Replay/capture/showcase studio based on actual runtime evidence.
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
- shared operation/capability registry suitable for GUI + service + CLI;
- migration tests and compatibility with existing Enderloom data;
- **extensible typed entity/evidence model that can represent the mandatory audit domains without collapsing them into opaque JSON or requiring another architecture rewrite.**

At minimum, Wave A must leave first-class typed extension paths for security/artifact capabilities; source/mapping/Mixin symbols; plugins/proxies/protocols; Bedrock creator projects/script profiles/editor extensions; visual logic graphs/gameplay elements; schematics/blueprints; particle/audio/UI/font/material assets; runtime registry content; collaboration changes; remote targets; protocol captures; world snapshot deltas; hardware profiles; localization and permission findings; stall/thread/JFR/memory/render evidence; concurrency findings; bisect/minimal-reproducer objects; scenario definitions/runs; compatibility contracts; script projects; startup profiles; world-recovery findings; and performance-patch acceptance ledgers.

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
- direct incident/performance/bisect/scenario entry points.

### Wave C — Performance Lab continuity

Resume issue #1 exactly from its current implementation contract. Do not redo its research. Performance results must write into the shared graph and immediately appear on the normal mod surface.

Later adapters may add Bedrock Script Profiler evidence, network/protocol evidence, hardware-profile normalization, freeze/JFR evidence, heap evidence, render/GPU evidence and boot-time evidence, but none of that should delay the current issue #1 critical path.

### Wave D — Autonomous Repair Loop

Follow `docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md`. Implement the full real vertical slice before provider proliferation:

`RepairJob -> evidence bundle -> in-app ChatGPT web adapter -> returned candidate -> security/quarantine scan -> build -> sandbox runtime gate -> failure packet -> same conversation retry -> passing candidate -> transactional install -> actual-instance smoke -> rollback proof`

MCP/local-model lanes are later provider interfaces; they must not weaken or postpone the real in-browser ChatGPT acceptance slice.

### Wave E onward

Continue the waves in `docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md`, expanded by both mandatory audit supplements:

- Bedrock Studio + full Creator/developer/debugger/editor tooling;
- UMIR and first rich Bedrock->Java conversion;
- Java version/loader port engine, mappings lab and Stonecutter-style multiversion workspace;
- Developer IDE + visual gameplay authoring;
- command/data/worldgen generator studio;
- World Studio + 3D building/schematics/blueprints + snapshot version control + recovery doctor;
- model/texture/animation plus particle/audio/UI/font/material studios;
- reference reconstruction and native visual QA;
- plugins/proxies/crossplay/protocol/network tooling;
- freeze/heap/render/concurrency/bisect/GameTest/startup profiling verticals;
- collaboration/MCP/local-AI/legacy-version tooling;
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
- Every recommendation must expose `Why?` / evidence.
- Every import/conversion must classify every source file or report it as unknown/unsupported.
- Never call an async/off-thread optimization successful until thread-safety and persistence gates pass.
- Never call an FPS optimization successful until visual/content parity and identical-scenario comparison pass.
- Every material checkpoint must preserve exact repo/branch/commit and next action.

## Quality target

The finished product should be easier to use than the collection of launchers, profilers, world editors, NBT tools, model tools, creator IDEs, Bedrock editors, pack tools, security scanners, server panels, protocol tools, debuggers, mapping tools, GameTest harnesses, browsers and ad-hoc scripts it replaces, while being more capable because all of those workflows share identity, evidence, testing, repair and rollback.

Start Wave A now. Do not stop at planning or mockups.
