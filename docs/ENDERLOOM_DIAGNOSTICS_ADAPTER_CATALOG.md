# Enderloom — Living Minecraft Diagnostics Adapter Catalog

**Status:** Mandatory living capability catalog  
**Updated:** 2026-09-07  
**Repository:** `Herbertofury/Enderloom`  
**Parent:** `docs/ENDERLOOM_DIAGNOSTICS_ADAPTERS_PROGRESS_UX_SPEC.md`

This is the compatibility/catalog layer for Enderloom diagnostics adapters. It is intentionally **not closed**: new high-value tools should be added through the adapter registry without changing Enderloom’s canonical evidence/task model.

## Product law

- Prefer the best available supported tool for the exact symptom/version/loader.
- Never require one profiler to do work it was not designed for.
- Preserve raw tool output + normalized Enderloom evidence.
- Revalidate compatibility before test-injecting anything.
- Test-only mods go into isolated clones/sandboxes by default.
- Measurement passes stay minimally instrumented; heavy tooling is primarily attribution evidence.
- Keep exact evidence confidence: measured / sampled / estimated / inferred / externally reported / reproduced.

---

# Tier A — first-class adapters

## spark

Use for:
- CPU sampling;
- client/server/proxy profiling;
- thread/call-stack hotspots;
- tick health/TPS/MSPT context;
- heap/class/object observations;
- memory/GC diagnostics where exposed;
- profile URL/file ingestion.

Enderloom adds:
- mod/JAR/source/Mixin ownership;
- scenario/time-window correlation;
- Black Box links;
- before/after compare;
- exact sampling-settings provenance.

Project:
- https://modrinth.com/mod/spark
- https://github.com/lucko/spark

## Observable classic

Use for:
- entity/block-entity/tile ticking cost;
- spatial hotspot visualization;
- world/chunk location of expensive ticking content.

Enderloom adds:
- owning mod/source/config links;
- scenario correlation;
- cross-check against spark/JFR.

Project:
- https://www.curseforge.com/minecraft/mc-mods/observable

## Observable Remake / maintained descendants

Use when loader/version requires a newer implementation and capabilities are actually supported.

Potential capabilities:
- entity/block-entity timings;
- chunk/world hotspots;
- scheduled block/fluid tick analysis;
- stack/trace sampling;
- local/exported profile data;
- visual overlays.

Compatibility must be selected per specific implementation/version.

## Crash Assistant

Use for:
- crash report + latest/debug/launcher log intake;
- `hs_err_pid` JVM fatal crashes;
- known crash-reason analysis;
- Mixin/dependency/config clues;
- GPU/driver/environment clues;
- package/class/dependency search findings;
- its generated report/log bundle;
- auto-fix ideas as untrusted candidate actions.

Enderloom adds:
- first causal stack owner;
- source/Mixin mapping;
- last mod/config/update delta;
- Black Box pre-crash timeline;
- bisect/minimal reproducer;
- sandbox validation before any proposed fix.

Project:
- https://modrinth.com/mod/crash-assistant
- https://www.curseforge.com/minecraft/mc-mods/crash-assistant

## Java Flight Recorder / jcmd

Use for:
- allocation hot paths;
- thread scheduling/contention;
- monitor/lock observations;
- CPU/event timelines;
- GC activity;
- class histograms;
- thread dumps;
- heap operations.

Treat JDK-native tooling as a core adapter family, not an afterthought.

## async-profiler

Use when platform/runtime permits for:
- low-overhead CPU profiling;
- wall-clock profiling;
- allocation profiling;
- lock profiling;
- native/JVM stack visibility.

Normalize frames into Minecraft/mod/source ownership where possible.

## Enderloom built-in Probe + Black Box

Use always as the correlation anchor:
- deterministic scenario timestamps;
- FPS/frame-time;
- TPS/MSPT;
- startup milestones;
- world/dimension/position;
- action markers;
- entity/block-entity counts;
- modset/config/world hashes;
- client/server process lifecycle;
- native visual/runtime evidence.

---

# Tier B — high-value specialized adapters

## Task Manager-style client profiler

Current modern client tools such as TaskManager can expose:
- sampled per-mod CPU;
- render CPU/GPU timings;
- estimated per-mod GPU share;
- startup time;
- memory estimates;
- frame/FPS timeline and percentiles;
- network/disk throughput;
- hot chunks/block entities;
- thread waits/locks;
- system telemetry;
- session export.

Enderloom must retain labels such as **estimated GPU attribution** instead of presenting those values as hard truth.

Project example:
- https://modrinth.com/mod/taskmanager

## Chunk Loading Profiler

Use for chunk loading/generation stages such as:
- initialization;
- biome;
- terrain;
- surface;
- carvers;
- decoration/features/structures;
- spawn;
- finalization.

Use for:
- teleport/dimension stalls;
- slow world generation;
- pregen regression;
- expensive feature/structure attribution.

Project:
- https://www.curseforge.com/minecraft/mc-mods/chunk-loading-profiler

## MixinTrace

Use on compatible Fabric/Quilt environments to enrich crash reports with the mixins/configurations attached to stack-trace classes.

Enderloom normalizes:
- target class;
- mixin class;
- mixin config;
- owning mod;
- whether that mixin appears on the causal stack path;
- conflict candidates/counterevidence.

Project:
- https://modrinth.com/mod/mixintrace

## ModernFix diagnostics/watchdog integration

ModernFix is primarily a bugfix/performance mod, but current builds include additional diagnostic tooling for rare crashes/freezes and watchdog/deadlock-related scenarios.

Enderloom should ingest:
- ModernFix watchdog/deadlock findings;
- ModernFix-specific diagnostic log markers;
- active ModernFix mixin/option fingerprint;
- crash-analysis clues involving ModernFix options;
- relevant config delta before/after reproductions.

Enderloom must not treat “ModernFix present” as the cause; it is evidence/context.

Project:
- https://modrinth.com/mod/modernfix
- https://github.com/embeddedt/ModernFix

## Neruina — ticking failure isolation

Neruina can prevent ticking entity/block/item errors from immediately bricking a world by suspending problematic tickers and exposing actions/report information.

Use in **recovery/test clones** when useful to:
- identify the exact ticking entity/block/item namespace/type/location;
- preserve a failing world long enough to inspect it;
- capture the triggering exception;
- compare resume/retrigger behavior;
- create a minimal fixture.

Do not use Neruina suppression as proof a bug is fixed. The final candidate must run without relying on the failure being masked unless that dependency is explicitly part of the intended pack.

Project:
- https://modrinth.com/mod/neruina

---

# Tier C — external/JVM analysis integrations

Support import/launch hooks where useful for:

- JDK Mission Control;
- VisualVM;
- Eclipse MAT-compatible heap dumps;
- YourKit/other commercial profilers when the user already has legitimate access;
- OS process/performance counters;
- GPU telemetry providers where available;
- driver crash information;
- JVM GC logs.

Enderloom should remain capable without requiring a commercial viewer.

---

# Tier D — legacy/server ecosystem importers

Provide read/import adapters for useful historical or server-platform diagnostics when encountered:

- Bukkit/Spigot/Paper/Purpur timing reports;
- server console/watchdog reports;
- proxy logs/profiles;
- loader crash reports;
- Forge/NeoForge/Fabric/Quilt diagnostics;
- launcher-specific logs;
- JVM fatal-error reports.

Where a platform now recommends spark instead of its legacy profiler, Enderloom can still ingest old reports for existing servers while preferring the newer route for new captures.

---

# Auto-selection examples

## FPS / stutter

1. Enderloom minimal frame-time measurement.
2. Compatible client profiler/TaskManager-style session if available.
3. spark client sampling.
4. JFR/async-profiler if JVM-side ownership remains unclear.
5. GPU/system telemetry.
6. native visual/render-stack validation.

## TPS / MSPT

1. Enderloom baseline.
2. spark server sampling.
3. Observable if spatial/entity/block-entity ticking is implicated.
4. chunk-stage profiler if chunk generation/loading is implicated.
5. JFR/async-profiler/thread analysis for locks/CPU/allocation.
6. bisect/minimal reproducer.

## Freeze/deadlock

1. Black Box.
2. repeated thread dumps.
3. JFR lock/thread timeline.
4. ModernFix watchdog/deadlock clues if present.
5. spark/async-profiler where useful.
6. chunk/save/network/teleport causal timeline.

## Crash

1. Crash Assistant + raw logs.
2. MixinTrace metadata where compatible/present.
3. ModernFix/loader/JVM diagnostic clues.
4. Black Box pre-crash evidence.
5. causal source/Mixin/config/dependency map.
6. exact regression fixture.

## Ticking world crash

1. raw exception + Crash Assistant.
2. optional Neruina recovery clone to isolate namespace/type/location.
3. Observable if tick cost/hotspot exists before failure.
4. source/mod/config mapping.
5. copied-world regression test without masking the final bug.

---

# Adapter discovery and future-proofing

Enderloom periodically updates a signed/versioned adapter metadata catalog containing:

- project/provider IDs;
- version/loader compatibility;
- capabilities;
- commands/output locations;
- parser version;
- known incompatibilities;
- instrumentation cost;
- license/provenance.

Adding a new profiler/analyzer should normally require:

1. adapter metadata;
2. runner/importer;
3. parser/normalizer;
4. fixture report(s);
5. evidence-confidence mapping;
6. compatibility tests;
7. UI labels/explanations;
8. AI tool schema exposure through the canonical registry.

It must **not** require a new Performance database, new AI-only parser or separate progress system.
