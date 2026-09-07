# Enderloom — Unified Diagnostics Adapters & Live Progress UX

**Status:** Mandatory product/implementation contract  
**Updated:** 2026-09-07  
**Repository:** `Herbertofury/Enderloom`  
**Branch:** `main`  
**Parents:** `docs/PREMIUM_TESTING_LAB_SPEC.md`, `docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md`, `docs/ENDERLOOM_OPENAI_AI_OPERATOR_SPEC.md`, `docs/ENDERLOOM_UNIFIED_STUDIO_CONFIG_HOTKEY_CLI_BRAIN_SPEC.md`

Enderloom Performance / Testing / Repair / Conversion / AI jobs must integrate the strongest applicable Minecraft diagnostics tools instead of forcing users to run each tool manually. Enderloom normalizes all results into the same evidence graph, correlates findings, and presents a polished live job timeline that explains exactly what is happening.

The living concrete adapter list is maintained in `docs/ENDERLOOM_DIAGNOSTICS_ADAPTER_CATALOG.md`; this specification defines the architecture and UX contract.

The product target is:

> “Test this mod.”
>
> Enderloom creates an isolated test copy, selects the right profilers/analyzers for the target loader/version/symptom, establishes a minimally instrumented baseline, runs targeted attribution passes, captures crashes/stalls/render/tick/world/memory/network evidence, correlates tool findings to owning mods/source/configs, repairs or reports the first causal issue, and shows every stage through an understandable progress experience.

**No fake progress. No fake precision. No profiler-overhead benchmark contamination.**

---

# 1. Diagnostics Adapter Registry

Create a first-class `DiagnosticsAdapterRegistry` backed by the same typed capability system used by GUI/CLI/AI.

Every adapter declares:

- adapter ID/version;
- upstream tool/project identity;
- supported Minecraft versions;
- supported loaders/platforms;
- client/server/proxy applicability;
- install/runtime requirements;
- commands/API/files/URLs it can drive or ingest;
- evidence types produced;
- instrumentation overhead class;
- whether it modifies runtime behavior;
- permissions/network/upload behavior;
- local-only vs external-viewer behavior;
- parser/importer version;
- known limitations;
- trust/provenance/license metadata.

Enderloom must be able to:

- detect an analyzer already installed;
- detect compatible analyzer versions;
- offer or automatically inject test-only analyzer dependencies into an isolated clone/sandbox according to user policy;
- never silently add diagnostics mods to the user’s live pack;
- use external/JVM profilers without modifying the modpack when possible;
- run the analyzer through commands/API/UI automation only when needed;
- import existing reports/profile URLs/files supplied by the user;
- preserve the original raw report plus normalized evidence;
- remove temporary testing-only tooling from disposable clones automatically.

Adapters are versioned and replaceable so newer profiling tools can be added without changing the canonical Performance data model.

---

# 2. Current High-Value Minecraft Diagnostic Integrations

This list is a required starting set, not a permanent closed list. See `docs/ENDERLOOM_DIAGNOSTICS_ADAPTER_CATALOG.md` for the maintained catalog.

## 2.1 spark

Current spark remains one of the primary Minecraft profiling integrations and supports clients, servers and proxies across major loaders/platforms.

Enderloom adapter capabilities should cover, where supported by the active spark version/platform:

- CPU sampling profiler;
- all-thread and thread-specific profiling;
- TPS/MSPT/tick health;
- profiler start/stop/status;
- heap summary;
- heap dump workflow;
- GC/memory observations;
- class/object count evidence;
- health reports/tick monitors where exposed;
- generated profile URL/file ingestion;
- flame/call tree parsing or source URL preservation;
- mappings/deobfuscation context;
- exact profile settings/duration/thread scope.

Normalize spark samples to:

- owning mod/JAR/project when resolvable;
- source symbol/Mixin when resolvable;
- thread;
- sample share;
- call path;
- scenario/time window;
- profile engine and sampling settings.

Never treat sampling percentage as exact CPU time without qualification.

## 2.2 Observable (classic)

For compatible Forge/Fabric environments, ingest/drive Observable’s entity/block-entity/tile/chunk tick profiling and spatial hotspot evidence.

Normalize:

- entity type;
- block entity type;
- position/chunk/dimension;
- aggregate tick cost/rate;
- owning mod;
- visual heat-map hotspot;
- scenario window.

The adapter must understand that Observable is principally a tick/world hotspot tool, not a full replacement for CPU, render, heap or crash profiling.

## 2.3 Observable Remake / descendants

Keep a distinct adapter capability profile for modern Observable remakes/ports when their data model differs from classic Observable.

Support when available:

- entity/block-entity tick timings;
- chunk-related hotspots;
- scheduled block/fluid tick evidence;
- execution traces/stack sampler;
- heat-map/overlay evidence;
- local JSON/profile export;
- uploaded profile URLs;
- optional integration-specific evidence such as automation/grid systems.

Do not assume a remake’s compatibility matches the classic project; select strictly by loader/version.

## 2.4 Crash Assistant

Crash Assistant is a first-class crash/log intake adapter.

Enderloom should ingest or interoperate with its strengths rather than duplicating UI unnecessarily:

- `latest.log`, debug logs, launcher logs, crash reports;
- JVM `hs_err_pid*.log` fatal-error reports;
- mod list information;
- recognized crash-reason findings;
- corrupted/malformed config findings;
- missing/broken Mixin configuration clues;
- mod/provider search findings;
- Connector-loaded Fabric mod notes where present;
- integrated-GPU/dedicated-GPU warnings where present;
- Crash Assistant’s generated reports/messages/log bundles;
- auto-fix suggestions as **untrusted candidate actions** that Enderloom independently validates.

Enderloom’s crash correlation should add:

- first causal stack owner;
- mod/source/Mixin mapping;
- before-crash Black Box timeline;
- last config/update/modset change;
- matching prior Evidence Brain incidents;
- minimal reproducer/bisect candidate.

Never auto-run a Crash Assistant fix directly on the live instance without Enderloom transaction/validation policy.

## 2.5 Task Manager-style client profiler

Where compatible, support modern client profilers such as Task Manager that expose per-mod/render/world/system telemetry.

Potential normalized evidence when the adapter/tool exposes it:

- sampled per-mod CPU attribution;
- render-thread attribution;
- GPU timer/query observations;
- clearly labeled **estimated** per-mod GPU attribution;
- per-mod/shared JVM memory estimates;
- startup timing;
- frame-time/FPS percentiles and spikes;
- MSPT overview;
- network throughput/categories;
- disk throughput;
- hot chunks;
- entities/block entities;
- thread waits/locks;
- system sensors/runtime health;
- session exports.

Any estimated GPU or shared-memory attribution must remain labeled estimated in Enderloom UI/AI prompts/reports.

## 2.6 Chunk Loading Profiler and equivalent stage profilers

For compatible versions, support chunk generation/loading stage profilers capable of attributing time to phases such as:

- initialization;
- biome;
- terrain/noise;
- surface;
- carvers;
- decoration/features/structures;
- spawn;
- finalization.

Normalize stage -> generator/feature/structure/mod -> chunk/region -> duration/cost -> scenario.

Use this for:

- worldgen regression tests;
- teleport/dimension-stall diagnosis;
- pregeneration tuning;
- mod/worldgen comparison;
- source symbol/feature attribution.

## 2.7 JVM / native profilers

Treat these as core adapters even though they are not Minecraft mods:

- Java Flight Recorder (JFR);
- `jcmd` thread/class/GC/heap operations;
- async-profiler where supported;
- JVM thread dumps;
- HPROF heap dumps;
- class histograms;
- GC logs;
- OS process CPU/memory/I/O counters.

Optional integrations may include external viewers/analyzers such as VisualVM, JDK Mission Control or compatible heap-analysis tools, but Enderloom must retain enough local raw evidence to avoid depending on one viewer.

## 2.8 Crash/runtime diagnostic enrichers

Enderloom should also understand diagnostic helpers whose main value is not a continuous profiler:

- **MixinTrace** on compatible Fabric/Quilt stacks for mapping stack-trace classes to applied mixins/configs;
- **ModernFix diagnostics/watchdog evidence** where present, including rare freeze/deadlock diagnostic markers and the exact active ModernFix option fingerprint;
- **Neruina** in recovery/test clones when useful to isolate ticking entity/block/item failures without permanently masking the final bug.

These tools provide evidence/context. Their presence is never proof that they are the culprit, and suppression/recovery behavior cannot substitute for fixing and retesting the underlying failure.

## 2.9 Built-in Enderloom probes

Enderloom itself should provide low-overhead probes for gaps third-party tools do not cover cleanly:

- deterministic frame-time capture;
- startup milestone timing;
- modset/config/world fingerprint;
- test action timestamps;
- Black Box rolling timeline;
- authoritative game state assertions;
- entity/block-entity counts;
- chunk/load/save milestones where observable;
- resource/model reload milestones;
- native client window/process/frame evidence;
- scenario input/output state.

The built-in probe does not pretend to replace deeper profilers. It anchors and correlates them.

---

# 3. Analyzer Selection Brain

Given a job/symptom, Enderloom automatically chooses the smallest useful analyzer set.

Examples:

## “Server TPS dropped”

Preferred sequence:

1. baseline TPS/MSPT + scenario fingerprint;
2. spark sampling;
3. Observable/world hotspot pass if entity/block-entity/chunk suspicion exists;
4. JFR/thread/lock evidence if stacks imply blocking/contention;
5. chunk stage profiler if generation/loading is implicated;
6. bisect/minimal reproducer if ownership remains unclear.

## “FPS dropped”

Preferred sequence:

1. deterministic frame-time/FPS baseline with minimal instrumentation;
2. render/client profiler adapter where compatible;
3. spark client profile / thread sampling;
4. GPU/driver/system telemetry;
5. native visual scenario comparison;
6. source/render-stack attribution.

## “Minecraft froze”

Preferred sequence:

1. Black Box pre-trigger evidence;
2. repeated thread dumps/JFR;
3. lock/deadlock graph;
4. ModernFix watchdog/deadlock clues if present;
5. spark/JFR/async-profiler stack attribution when useful;
6. chunk/teleport/world/save evidence;
7. causal source/mod/Mixin mapping.

## “It crashed”

Preferred sequence:

1. Crash Assistant/raw crash/log/hs_err intake;
2. MixinTrace metadata where compatible/present;
3. Black Box preceding timeline;
4. source/mod/Mixin/config correlation;
5. environment/driver/native crash classification;
6. minimal reproducer / compatibility contract;
7. repair candidate + exact regression test.

## “Ticking entity/block/item crashed the world”

Preferred sequence:

1. raw crash + Crash Assistant;
2. optional Neruina recovery clone to identify namespace/type/location and preserve inspectability;
3. Observable if repeatable tick cost/hotspot exists;
4. source/mod/config correlation;
5. copied-world regression test without relying on suppression in the passing final candidate.

## “This mod uses too much RAM”

Preferred sequence:

1. clean baseline heap after warmup;
2. controlled scenario;
3. spark heap summary / class counts;
4. JFR allocation profile;
5. class histogram;
6. heap dump/dominator workflow only when needed;
7. ownership mapping and restart/repeat proof.

---

# 4. Measurement Pass vs Attribution Pass

This is a hard performance-testing law.

## 4.1 Measurement pass

Use the least intrusive authoritative instrumentation possible.

Measure:

- FPS/frame times/percentiles;
- TPS/MSPT;
- startup time;
- memory high-water / stabilized heap as applicable;
- worldgen/pregen duration;
- network/IO when part of the acceptance contract.

Record exact:

- machine/hardware;
- OS/JVM;
- loader/modset/config/world hashes;
- render/shader/resource stack;
- warmup;
- camera/path/scenario;
- background process policy;
- run count;
- analyzer/probe overhead class.

## 4.2 Attribution pass

Then use spark/Observable/JFR/client profilers/chunk profilers/etc. to explain the measured regression or hotspot.

Instrumented results are not silently substituted for the measurement run.

## 4.3 Cross-tool correlation

Examples:

- frame spike timestamp -> Black Box event -> render-thread sample -> owning mod -> source method;
- MSPT spike -> Observable hot block entity -> spark call stack -> source symbol;
- teleport stall -> chunk stage profiler decoration spike -> structure/feature owner -> mod;
- memory growth -> class histogram -> allocation stack -> owning mod;
- crash -> Crash Assistant known issue -> MixinTrace/stack ownership -> actual causal mod/source -> last changed config/update.

Correlations must preserve confidence level:

- measured;
- sampled;
- estimated;
- inferred;
- externally reported;
- confirmed by reproduction.

---

# 5. Adapter Auto-Install / Test Clone Policy

When a useful analyzer is missing:

- check loader/Minecraft compatibility;
- verify project identity/source/license/provider;
- download only through allowed provider/source paths;
- hash and security-scan artifact;
- install only into a disposable or dedicated Enderloom testing clone unless user explicitly requests live installation;
- capture dependency requirements;
- run the intended profile;
- preserve raw output and normalized evidence;
- remove/discard temporary clone after evidence is safely persisted.

For an analyzer with meaningful overhead or compatibility risk, prefer an external JVM/native profiling lane first where adequate.

---

# 6. Unified Evidence Model

Add typed objects or equivalent domain contracts:

- `DiagnosticsAdapter`;
- `DiagnosticsCapability`;
- `DiagnosticsToolInstallation`;
- `DiagnosticsSession`;
- `DiagnosticsRawArtifact`;
- `NormalizedProfile`;
- `SampledStack`;
- `TickHotspot`;
- `WorldHotspot`;
- `ChunkStageObservation`;
- `CrashFinding`;
- `MemoryFinding`;
- `RenderFinding`;
- `ThreadFinding`;
- `CorrelationEdge`;
- `MeasurementRun`;
- `AttributionRun`;
- `InstrumentationOverheadClass`;
- `EvidenceConfidence`.

All link back to normal project/mod/source/config/world/test/job objects.

---

# 7. Gorgeous Live Progress UX — every long job explains itself

Performance tests, repairs, mod creation, conversions, ports, pack migrations, AI jobs, world repairs and release builds must use one shared hierarchical job-progress system.

## 7.1 Main job header

Show at a glance:

- job title: e.g. **Converting Backpacks 2.0.2 -> Forge 1.20.1**;
- current overall state;
- quality policy;
- target version/loader;
- current candidate/build hash short ID;
- elapsed time;
- exact current stage;
- pause/cancel/open-details controls where supported;
- safe “run in background” behavior inside Enderloom’s task engine.

## 7.2 Honest progress bars

Use hierarchical progress, not a fake timer-based percentage.

Example:

`Overall 63%`

- Intake & inventory ✅
- Semantic conversion ✅
- Java implementation ✅
- Build ✅
- Dedicated server tests ✅
- Native client QA **running 3/7 scenarios**
- Performance comparison ○
- Package & release ○

Rules:

- percent is derived from known weighted work units/gates;
- newly discovered required work may expand the denominator, with an explanation;
- unknown-duration steps use an indeterminate bar plus concrete sub-events;
- never creep from 92% to 99% based on elapsed time;
- never show 100% until all mandatory acceptance gates pass.

## 7.3 Current-action card

Always show a plain-English statement such as:

**Testing entity rendering in real Minecraft**  
`Scenario 3/7 — Sprint animation, east camera`  
“Checking that the model remains grounded, textures load, and animation transforms do not accumulate.”

Or:

**Profiling server tick cost with spark**  
`30 second attribution capture`  
“TPS fell below baseline during the mob-wave scenario. This profile is identifying which mod/method owns the extra server-thread time.”

## 7.4 Detail levels

Provide three density modes without separate screens:

- **Simple** — current step + overall progress + important findings;
- **Detailed** — pipeline tree, tools, evidence, test scenarios, current reasoning/explanation;
- **Expert** — commands, raw logs, stack samples, artifact IDs, timings, task DAG, exact gate definitions.

Remember user preference per workflow.

## 7.5 Live stage timeline

Each completed/active event displays:

- timestamp/duration;
- icon/state;
- action;
- tool/adapter used;
- short result;
- evidence link;
- expandable details.

Examples:

- `✓ Dependency closure — 42 mods / 0 unresolved`
- `✓ Baseline server boot — ready in 18.4 s`
- `✓ Measurement run — 49.8 MSPT p95`
- `● spark attribution — sampling Server thread`
- `○ Observable hotspot pass — queued if tick ownership remains spatial`
- `○ Patch candidate — waiting on profiler evidence`

## 7.6 Explain “Why?”

Every nontrivial step has a **Why this?** affordance.

Examples:

- “Why are you launching Minecraft again?”
- “Why are you using Observable?”
- “Why did the percentage go backward?”
- “Why is this mod marked suspected instead of culprit?”

Answer from the actual acceptance/evidence graph, not generic canned text.

## 7.7 Findings rail

Surface discoveries immediately without interrupting the run:

- likely culprit;
- confirmed culprit;
- failed gate;
- recovered transient issue;
- missing dependency;
- performance regression;
- visual defect;
- config incompatibility;
- world/save risk;
- security/provenance concern.

A finding has:

- confidence;
- affected object;
- evidence source(s);
- whether it blocks release;
- current automated response.

## 7.8 Repair iteration view

For automated repair:

`Candidate 1 — failed: server deadlock`  
`Candidate 2 — failed: fixed stall, introduced save regression`  
`Candidate 3 — active: targeted lock-order patch`

Show:

- what changed;
- why previous candidate failed;
- what new evidence changed the strategy;
- gates retained from prior candidate;
- gates invalidated and rerunning.

Do not spam the user with internal chain-of-thought; expose concise evidence-backed action summaries.

## 7.9 Mod creation / conversion progress

Use content-aware counters:

- items converted `42/42`;
- blocks `18/18`;
- entities `7/9`;
- models `31/31`;
- animations `14/20`;
- recipes `55/55`;
- sounds `23/23`;
- scripts/components mapped `118/123`;
- compatibility contracts `3/5`;
- test scenarios `12/18`;
- unknown source files `0`.

This makes “63%” meaningful.

## 7.10 Performance testing progress

Example visual flow:

`Preparing isolated clone`  
`Warming JVM/world`  
`Baseline measurement 1/3`  
`Baseline measurement 2/3`  
`Baseline measurement 3/3`  
`Detected 22% MSPT regression`  
`spark attribution capture`  
`Observable entity/block-entity hotspot scan`  
`JFR allocation/lock check`  
`Attributing source`  
`Repair candidate`  
`Retest`  
`Before/after report`

## 7.11 Visual polish

- smooth but non-deceptive animation;
- stage icons/state transitions;
- compact sparklines for FPS/MSPT/memory where appropriate;
- before/after delta cards;
- mini flame/hotspot thumbnails where data permits;
- mod icon/source badge on culprit/finding cards;
- clear success/warning/failure hierarchy;
- celebrate final verified success subtly without covering evidence;
- accessible reduced-motion mode;
- keyboard navigation and screen-reader labels;
- no information conveyed by color alone.

---

# 8. Task Graph / Progress API

Every long operation emits structured progress events from the domain layer, not guessed UI strings.

Suggested model:

- `JobProgress`;
- `ProgressStage`;
- `ProgressUnit`;
- `ProgressEvent`;
- `ProgressFinding`;
- `ProgressEvidenceLink`;
- `ProgressExplanation`;
- `ProgressEstimate`;
- `ProgressQualityGate`.

Each event includes:

- job/task ID;
- parent/child task;
- stage ID;
- state;
- completed/total units when known;
- weight when defined;
- human summary;
- machine code;
- evidence IDs;
- start/update/end timestamps;
- blocker/retry state;
- whether denominator changed;
- optional historical-duration estimate source.

GUI, CLI JSON/JSONL, MCP and AI all consume this exact stream.

---

# 9. CLI / Headless Progress

The same jobs must remain beautiful/useful without GUI.

Interactive terminal:

- dynamic progress bars;
- nested stage display;
- current finding;
- optional sparkline/summary where terminal supports it;
- `--verbose` expert stream.

Noninteractive/CI:

- stable JSONL events;
- no ANSI noise by default;
- stable stage IDs;
- machine-readable evidence/artifact references;
- deterministic final result object.

Examples:

```text
enderloom test mod ./foo.jar --full --progress detailed
enderloom perf compare baseline candidate --adapters auto
enderloom repair incident latest --progress jsonl
enderloom ai convert addon.mcaddon --target forge:1.20.1 --quality max --follow
```

---

# 10. AI Integration

The OpenAI/Codex operator receives normalized diagnostics rather than giant unfiltered logs whenever possible.

A repair/performance failure packet should include:

- exact symptom/gate;
- measurement delta;
- selected analyzer rationale;
- spark/Observable/JFR/Crash Assistant/etc. normalized findings;
- raw artifact links/IDs;
- first causal owner/source symbol where known;
- confidence and conflicting evidence;
- candidate history;
- current acceptance blockers.

AI may request a deeper adapter/tool pass when uncertainty remains.

AI job progress is rendered through the same hierarchical progress system:

- researching API/source;
- inventorying content;
- editing source;
- generating assets;
- building;
- profiling;
- testing;
- repairing;
- retesting;
- packaging;
- generating Wiki/release.

---

# 11. Evidence Brain Integration

Store adapter/tool conclusions as observations with their exact source/provenance.

Examples:

- spark sampling found `modx.SomeTicker` in 38% of Server-thread samples;
- Observable measured block entity X as spatial hotspot at chunk Y;
- Task Manager estimated renderer Z as top GPU contributor;
- Crash Assistant flagged config file A as malformed;
- JFR showed allocation hotspot in class B.

Do not merge those into one “truth” blindly.

A verified rule requires the existing promotion/challenge process and should record which evidence classes supported it.

---

# 12. Research Snapshot — 2026-09-07

Current public project evidence used to define the starting adapter set:

- Crash Assistant — current project supports broad modern Minecraft/loader coverage and analyzes game/launcher/crash/hs_err/config/Mixin/dependency/environment cases.
  - https://www.curseforge.com/minecraft/mc-mods/crash-assistant
  - https://modrinth.com/mod/crash-assistant
- spark — current project is a client/server/proxy performance profiler with sampling and performance/memory inspection capabilities.
  - https://github.com/lucko/spark
  - https://modrinth.com/mod/spark
- Observable classic — entity/block-entity tick profiling and spatial hotspot visualization for compatible Forge/Fabric versions including Forge 1.20.1.
  - https://www.curseforge.com/minecraft/mc-mods/observable
- Task Manager — current Fabric client profiler exposes sampled CPU, estimated GPU attribution, render/startup/memory/timeline/network/disk/world/thread/system/session evidence for its supported versions.
  - https://modrinth.com/mod/taskmanager
- Chunk Loading Profiler — 1.20.1/1.21 profiler for chunk loading/generation stages.
  - https://www.curseforge.com/minecraft/mc-mods/chunk-loading-profiler
- MixinTrace — compatible Fabric/Quilt crash-report enrichment that lists mixins/configurations for stack-trace classes.
  - https://modrinth.com/mod/mixintrace
- ModernFix — includes additional debug tooling for some rare crash/freeze cases in addition to its performance/bugfix role; active version/options are diagnostic context.
  - https://modrinth.com/mod/modernfix
  - https://github.com/embeddedt/ModernFix
- Neruina — current Forge/Fabric/NeoForge utility that can suspend ticking entity/block/item failures to preserve inspectability/recovery context.
  - https://modrinth.com/mod/neruina

Adapters must revalidate compatibility/version before installation because these tools evolve independently.

---

# 13. Wave A Consequences

Wave A remains the immediate implementation action. It should leave extension points for:

- diagnostics adapter capabilities;
- raw + normalized evidence;
- measurement vs attribution runs;
- evidence confidence/provenance;
- hierarchical task graph;
- progress stage/unit/event/finding/explanation stream;
- GUI/CLI/MCP/AI consumers of the same task progress source.

Do not delay Wave A by implementing every analyzer now, but do not choose a task/evidence schema that forces profiler-specific shadow databases later.

---

# 14. Definition of Done

This direction is complete only when:

- Enderloom can detect/select/run/import appropriate popular diagnostic tools through adapters;
- third-party profiler evidence is preserved raw and normalized into canonical objects;
- measurement numbers are separated from instrumented attribution data;
- analyzer overhead/estimation limits are visible;
- missing analyzers can be safely test-injected into isolated clones under policy;
- crash/performance/world/memory/render/stall evidence cross-links to owning mods/source/config/world objects;
- AI can request and consume the same diagnostics headlessly;
- every long job exposes honest hierarchical progress in GUI and CLI;
- creation/conversion jobs use content-aware completion counters;
- repair/testing jobs show exact gates, candidates, findings and retained/rerun evidence;
- users can understand **what Enderloom is doing and why** without reading raw logs unless they choose Expert detail;
- no progress bar reaches 100% before the acceptance contract is actually satisfied.
