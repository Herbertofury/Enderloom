# Enderloom — Minecraft Dev Kit Workflow Challenge Pass

**Status:** Mandatory user-workflow supplement  
**Updated:** 2026-09-07  
**Repository:** `Herbertofury/Enderloom`  
**Parent docs:** `docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md`, `docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md`

This challenge pass focuses specifically on recurring real Minecraft Dev Kit work patterns that Enderloom must absorb explicitly rather than leaving them implied by broad labels such as “Performance Lab” or “Testing”.

---

# 1. Freeze / Lock / Deadlock Forensics

Recurring failure mode: Minecraft appears alive but simulation stalls, mobs stop acting, teleports/world transitions lock, the server thread wedges, or one subsystem waits forever.

Enderloom must support:

- [ ] automatic stall watchdog with configurable threshold;
- [ ] capture repeated JVM thread dumps without killing the process;
- [ ] Java Flight Recorder capture/dump when runtime supports it;
- [ ] deadlock detection and monitor/lock ownership graph;
- [ ] main/server thread stack classification;
- [ ] render-thread stall classification;
- [ ] worker/ForkJoin/executor starvation classification;
- [ ] chunk I/O/generation ticket/task backlog evidence;
- [ ] region/chunk save stall evidence;
- [ ] entity ticking/AI pathfinding hotspots;
- [ ] teleport/dimension-transfer phase timeline;
- [ ] network-thread/backend wait evidence;
- [ ] GC pause vs true code stall distinction;
- [ ] watchdog/crash report correlation;
- [ ] exact owning mod/plugin/class/Mixin attribution where defensible;
- [ ] timeline showing when TPS/simulation stopped vs process remained responsive;
- [ ] one-click “bundle this lockup for AI repair” with thread/JFR/log/config/modset hashes;
- [ ] compare healthy vs locked run;
- [ ] never call a foreground command timeout proof that Minecraft itself hung.

Freeze evidence must appear on culprit mod/project detail and feed the same repair loop.

---

# 2. Heap / Memory-Leak Lab

- [ ] live heap usage by generation/pool;
- [ ] allocation-rate profiling;
- [ ] class histogram snapshots;
- [ ] heap dump capture when user opts in and storage permits;
- [ ] retained-size / dominator analysis through a supported analyzer path;
- [ ] compare before/after scenario;
- [ ] detect monotonically growing object families;
- [ ] correlate object/class ownership to mod namespace/JAR when possible;
- [ ] texture/image/native/direct-buffer pressure tracking where measurable;
- [ ] Netty/direct-memory pressure;
- [ ] classloader leak suspicion across dev hot-reloads/relaunches;
- [ ] GC pause/time/cause comparison;
- [ ] memory evidence attached to mod/version/config fingerprints;
- [ ] automatic redaction of sensitive strings before external AI handoff.

---

# 3. Render / GPU / Client Frame-Time Lab

Recurring goal: identify the exact mod/render feature stealing FPS or render-thread time without deleting visual quality.

Enderloom must distinguish CPU render-thread, GPU, chunk rebuild, entity/block-entity, UI and simulation causes.

## 3.1 Frame-time evidence

- [ ] frame-time distribution, not only average FPS;
- [ ] 1%/0.1% lows;
- [ ] render-thread CPU time;
- [ ] game/server-thread CPU time in integrated server;
- [ ] chunk build/rebuild queue timing;
- [ ] entity render timing/volume;
- [ ] block-entity render timing/volume;
- [ ] particle timing/count;
- [ ] GUI/HUD render cost;
- [ ] shader compile/stutter events where observable;
- [ ] texture upload/atlas rebuild events where observable;
- [ ] Distant Horizons/render-distance style workload tagging where adapters exist;
- [ ] before/after deterministic camera-path comparisons.

## 3.2 GPU/render-backend awareness

- [ ] GPU utilization, VRAM, clocks, frame pacing where OS/API permits;
- [ ] OpenGL renderer/version/driver information;
- [ ] Sodium/Embeddium/Iris/Oculus-style render-stack identity;
- [ ] Vulkan-based renderer compatibility identity where used;
- [ ] shader-pack identity and settings fingerprint;
- [ ] resource-pack/model-renderer identity;
- [ ] native graphics-debugger interop may be offered when legally/technically supported, but must not be required for ordinary profiling;
- [ ] never invent per-mod GPU attribution when the graphics API cannot support it—show confidence and causal evidence instead.

## 3.3 Render optimization workbench

- [ ] link hot render class/method to owning mod and source;
- [ ] inspect allocation/churn on render path;
- [ ] inspect redundant state/resource rebuilds;
- [ ] identify work safe to cache/batch/off-thread vs work that must remain on render thread;
- [ ] enforce Minecraft/OpenGL thread-safety boundaries;
- [ ] test optimizations with identical visual scene and native capture;
- [ ] visual parity is an acceptance gate when performance patches change rendering.

---

# 4. Concurrency Correctness Lab

Performance work frequently attempts async/off-thread execution. Enderloom must help avoid “faster but corrupt/unsafe” patches.

- [ ] identify executors/thread pools created by each mod;
- [ ] track hot tasks by executor/thread name;
- [ ] detect unbounded executor/task-queue patterns;
- [ ] detect blocking waits/futures on main/render/server threads;
- [ ] detect obvious synchronized-lock contention;
- [ ] detect world/entity/registry/render API access from suspicious worker threads using version-aware rules;
- [ ] chunk/world mutation threading checks;
- [ ] render/OpenGL call threading checks;
- [ ] networking callback -> game-thread handoff checks;
- [ ] server/client side ownership checks;
- [ ] race-sensitive stress scenarios with repeated runs;
- [ ] save/restart integrity gate after async world/data changes;
- [ ] never recommend “move it async” without proving target API/thread semantics permit it.

---

# 5. Automated Mod Bisect / Minimal Reproducer

A major recurring task is “find the mod causing this”. Enderloom should make that almost automatic.

## 5.1 Mod-set bisection

- [ ] snapshot the exact starting instance;
- [ ] dependency-aware binary search over enabled mods;
- [ ] keep mandatory loader/API/dependency closure intact;
- [ ] user-defined symptom detector: crash, lock, FPS drop, TPS drop, log signature, missing content, UI issue, test failure;
- [ ] restart/relaunch each candidate automatically in isolated clone;
- [ ] record each tested mod-set hash;
- [ ] stop when culprit or interacting minimal set is identified;
- [ ] support pair/intersection failures where one-mod bisection is insufficient;
- [ ] never mutate the live instance while bisecting.

## 5.2 Delta-debugging/minimization

- [ ] minimize mod subset;
- [ ] minimize config changes;
- [ ] minimize datapack/resource-pack set;
- [ ] minimize world/region/chunk fixture where safe;
- [ ] minimize reproduction steps/scenario;
- [ ] preserve exact original evidence and the minimized fixture separately.

## 5.3 Reproducer package

Generate a reviewable bundle containing:

- [ ] exact mod/version/hash set;
- [ ] exact configs needed;
- [ ] target world subset or generated test fixture when needed;
- [ ] scenario steps;
- [ ] expected vs observed;
- [ ] logs/thread dumps/profiles;
- [ ] license-aware handling of third-party files;
- [ ] provider links for files that cannot be redistributed.

This bundle becomes ideal input for the autonomous repair loop.

---

# 6. Unified GameTest / Scenario Compiler

Forge and NeoForge expose GameTest server workflows, and modern Fabric supports both server and client game tests. Enderloom should treat those as one high-level scenario system instead of loader-specific islands.

- [ ] author scenario once in Enderloom's typed scenario model;
- [ ] compile to Forge GameTest where supported;
- [ ] compile to NeoForge GameTest where supported;
- [ ] compile to Fabric server/client game-test harnesses where supported;
- [ ] Bedrock GameTest/Script API adapter where applicable;
- [ ] native Probe fallback when framework cannot express the scenario;
- [ ] structure/template fixture management;
- [ ] setup/teardown;
- [ ] time/weather/gamerules;
- [ ] assertions on blocks/entities/inventories/data/components;
- [ ] timeouts;
- [ ] repeated/flaky-run mode;
- [ ] parameterized version/loader/dependency matrix;
- [ ] headless game-test-server lane when valid;
- [ ] real client lane for rendering/UI/input/client state;
- [ ] generate test source into mod project when requested;
- [ ] ingest existing project GameTests into Enderloom scenario catalog.

Scenario results must write to the same `TestRun` / evidence model used by Performance Lab, Compatibility Lab, conversion, repair and release readiness.

---

# 7. Compatibility Contract Templates

Enderloom should make deep compatibility testing reusable rather than reinventing it for each mod.

Provide editable templates for:

- [ ] Curios/Trinkets slot equip/unequip/persistence/death/clone/sync;
- [ ] Sophisticated Backpacks-style upgrade/filter/inventory/automation/open/use/persistence interactions;
- [ ] Apotheosis-style affix/gem/loot/attribute/recipe/enchantment interactions;
- [ ] inventory sorting/profile mods;
- [ ] recipe viewers;
- [ ] Create-style contraption/moving-block integration;
- [ ] claims/protection mods;
- [ ] shader/render stack;
- [ ] biome/worldgen stack;
- [ ] permissions/economy/chat plugin stacks;
- [ ] server/proxy/crossplay stacks.

Each contract contains setup, actions, assertions, persistence/restart checks and required dependencies. Projects can add custom contracts and share them with provenance.

---

# 8. Scripted Modpack Logic Studio

Many packs implement gameplay outside compiled Java mods. Enderloom should understand and migrate these layers too.

- [ ] KubeJS project browser/editor;
- [ ] CraftTweaker/ZenScript project browser/editor;
- [ ] datapack functions/tags/recipes/loot/worldgen;
- [ ] Paxi/open-loader-style distributed data/resource-pack contents;
- [ ] loader config scripts where present;
- [ ] startup/server/client script side classification;
- [ ] dependency/reference graph from scripts to mods/registries/tags/recipes;
- [ ] script error/log navigation;
- [ ] script performance hotspots where measurable;
- [ ] version/API migration assistant;
- [ ] authorized script/datapack -> native mod conversion option with semantic inventory and parity tests;
- [ ] native mod -> scripted prototype export only when user asks, never as a fidelity downgrade disguised as a port.

---

# 9. Startup / Boot-Time Profiler

- [ ] launcher/bootstrap time;
- [ ] loader discovery time;
- [ ] per-mod construction/init/setup phase timing where instrumentation permits;
- [ ] registry/datagen/config load timing;
- [ ] resource reload/model bake/atlas timing;
- [ ] datapack reload timing;
- [ ] world load/join timing;
- [ ] first-frame/first-playable milestone;
- [ ] dedicated server ready milestone;
- [ ] compare cold vs warm cache;
- [ ] identify I/O/network resolution stalls vs CPU work;
- [ ] dependency-resolution/download time excluded from game boot metrics unless explicitly measuring launcher setup;
- [ ] boot regression badge on changed mod/version.

---

# 10. World Recovery / Recreation Doctor

Recurring world problems include inability to recreate a world, missing/invalid dimension settings, damaged metadata, needing the exact seed, or recovering enough metadata to clone settings safely.

- [ ] extract/copy seed from level metadata where present;
- [ ] inspect `level.dat` / `level.dat_old` and relevant metadata;
- [ ] data version and generator settings;
- [ ] dimension registry/settings inventory;
- [ ] datapack/mod dependency identity needed to interpret world settings;
- [ ] detect missing/corrupt worldgen/dimension references;
- [ ] compare against backup metadata;
- [ ] reconstruct a minimal safe world-creation settings set when evidence permits;
- [ ] clone/recreate into a new test world without modifying original;
- [ ] preserve portals/dimension semantics where required;
- [ ] clear report when exact recreation is impossible because required modded generator code/data is missing;
- [ ] one-click backup before any repair;
- [ ] restart/load validation after metadata repair.

---

# 11. Performance Patch Acceptance Contract

When Enderloom or AI optimizes a mod, “higher FPS” is not enough.

Every performance patch should automatically build an acceptance ledger for:

- [ ] feature/content inventory parity;
- [ ] config parity/defaults;
- [ ] visuals/models/textures/animations;
- [ ] sound/particles;
- [ ] networking/sync;
- [ ] persistence/restart;
- [ ] dedicated server behavior;
- [ ] client/integrated behavior;
- [ ] dependent-mod compatibility;
- [ ] target scenario correctness;
- [ ] performance before/after under identical fixture;
- [ ] no new warnings/errors;
- [ ] no unsafe thread-boundary violations;
- [ ] no hidden caps/reduced simulation distance/entity count/quality unless explicitly user-approved as a separate optional mode.

A patch is not “optimized” if it achieves the metric by silently removing work the mod is supposed to perform.

---

# 12. Render/Server Incident -> Source Patch Loop

Add a direct single-flow action from every profiler/incident finding:

`finding -> owning artifact -> exact hot/stalled source symbol -> source/decompile workspace -> patch branch -> build -> isolated scenario -> profile compare -> acceptance ledger -> transactional install -> rollback`

The user should never need to manually copy a class name from Spark/JFR/thread dump into a separate tab to begin repair.

---

# 13. Architecture implications

Wave A must leave typed/extensible places for at least:

- [ ] `StallIncident`;
- [ ] `ThreadSnapshot`;
- [ ] `JfrRecording` / generic profile artifact;
- [ ] `MemorySnapshot` / `HeapObservation`;
- [ ] `FrameTimingRun` / `RenderObservation`;
- [ ] `ConcurrencyFinding`;
- [ ] `BisectRun` / `CandidateModSet`;
- [ ] `MinimalReproducer`;
- [ ] `ScenarioDefinition` / `ScenarioBackend` / `ScenarioRun`;
- [ ] `CompatibilityContract`;
- [ ] `ScriptProject` / `ScriptReference`;
- [ ] `StartupProfile`;
- [ ] `WorldRecoveryFinding`;
- [ ] `PerformancePatchAcceptanceLedger`.

These should join existing `EvidenceArtifact`, artifact/hash, task and staleness relationships.

---

# 14. Definition of done

These recurring Dev Kit workflows are considered absorbed only when a user can start with a real symptom—“the server froze”, “this mod ate 60 FPS”, “something in the pack broke”, “this async patch might corrupt things”, “this world cannot be recreated”, “prove this port works with backpacks/Curios”, “why did startup get slower”—and Enderloom can drive the evidence -> culprit -> source -> patch -> test -> compare -> install/rollback loop without manual glue between disconnected tools.
