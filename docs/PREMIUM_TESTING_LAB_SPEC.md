# Enderloom Premium Testing Lab

Status: **Accepted premium roadmap feature**  
Added: **2026-09-05**  
Canonical project: `Herbertofury/Enderloom`

## Product goal

Add a first-class top-level **Testing** workspace to Enderloom that makes Minecraft mod performance testing fast, reproducible, understandable, and directly actionable.

The Testing workspace must let a user answer, with evidence:

- Is this mod causing startup slowdown, FPS drops, frame-time spikes, TPS/MSPT problems, memory pressure, GC pauses, disk/network churn, or server lag?
- How much does the pack change **with vs. without** this mod under the same scenario?
- Is the problem caused by this mod alone, a dependency, or an interaction with another mod?
- What changed after updating, adding, removing, configuring, or patching a mod?
- What exact evidence should be sent to ChatGPT or another AI assistant for diagnosis or a possible performance patch?

This is a **Premium** feature because the value is not merely showing raw profiler output. Premium owns the automated test orchestration, safe sandboxes, dependency-aware A/B runs, repeated measurements, per-mod history, comparison UI, attribution, launch acceleration, and AI-ready evidence packaging.

## Core promises

1. **One-click test one mod.** Select a mod and choose `Test Impact`. Enderloom produces a controlled baseline and a matching run with the target changed, then reports the delta on the mod itself.
2. **Test the whole pack.** A dependency-aware adaptive sweep isolates likely performance offenders without blindly doing one full boot per JAR when a faster statistically valid route exists.
3. **Direct with/without evidence.** Any mod labeled with a measured performance cost must have direct paired evidence. Inferred candidates are shown as `Suspected` until a direct confirmation run exists.
4. **Never touch the live instance.** All automated testing runs in a disposable or recoverable test sandbox. User worlds, configs, saves, screenshots, launcher metadata, and external CurseForge/Modrinth instances are not mutated.
5. **Preserve user-edited configs.** The normal test uses the user's current configs. Optional `Fresh Config` and `Default Config` comparisons are explicit separate scenarios and never overwrite the live config.
6. **No fake precision.** Every score carries run count, environment fingerprint, test scenario, variance/confidence, and whether a metric is measured, estimated, or inferred.
7. **Fast by architecture, not by skipping work.** Reuse immutable game assets, Java installs, loader artifacts, dependency resolution, authentication state, precomputed fingerprints, and profiler/tool caches. Avoid re-copying unchanged data and re-running unchanged baselines.
8. **Why? everywhere.** Any warning, score, recommendation, or test option exposes a concise `Why?` explanation describing what was measured, what it means, and what tradeoff a change would have.

## Testing workspace

Top-level navigation label: **Testing**  
Premium badge: visible but not obnoxious.  
Primary landing view: **Performance Lab**.

### Primary actions

- **Quick Scan** — out-of-game static analysis of one mod or all mods. No Minecraft launch required.
- **Test One Mod** — direct paired A/B impact test.
- **Test All Mods** — adaptive dependency-aware pack sweep followed by direct confirmation of candidates.
- **Startup Test** — focuses on JVM/bootstrap/loader/mod initialization and title-screen readiness.
- **Client FPS Test** — real client run with deterministic benchmark scenario and frame telemetry.
- **Server TPS Test** — isolated dedicated-server or integrated-server scenario for TPS/MSPT/tick cost.
- **Lag Spike Hunt** — captures only slow frames/ticks plus profiler/JFR context around spikes.
- **Memory Test** — heap growth, allocations, GC pressure, retained classes, and leak-oriented soak run.
- **Compare Runs** — compare any two prior test sessions, mod versions, configs, or pack revisions.
- **Regression Test** — re-run a saved benchmark after a mod update or Enderloom-applied patch.

## Fast test pipeline

### 1. Preflight and fingerprint

Create a deterministic fingerprint from:

- Minecraft version
- loader + loader version
- Java runtime + JVM args
- complete enabled mod SHA-256 set
- config hashes
- shader/resource-pack state
- render/simulation/view distance
- selected benchmark world/snapshot hash
- test scenario version
- CPU/GPU/OS identity and power mode

If the fingerprint and scenario have not changed, reuse valid baseline evidence instead of relaunching only for ceremony.

### 2. Dependency-aware test sandbox

Create a test instance that reuses immutable content wherever safe:

- shared Java runtime
- shared Minecraft assets/libraries
- shared loader installation
- hard-linked or equivalent immutable mod JAR materialization when the filesystem supports it
- copied/staged writable configs and test-world state
- isolated logs, crash reports, Spark/JFR output, options, saves, screenshots, and generated caches

Fallback to normal copies when linking is unavailable or unsafe.

The sandbox must always be restorable/deletable as one transaction.

### 3. Dependency graph

Before disabling a target, build a dependency graph from:

- Forge/NeoForge `mods.toml`
- Fabric/Quilt `fabric.mod.json` / Quilt metadata
- Modrinth/CurseForge dependency metadata when available
- known bundled/Jar-in-Jar dependencies
- observed runtime missing-dependency errors

A mod may be tested with required libraries preserved. A library should not be blamed merely because disabling it also prevents dependent gameplay mods from loading.

### 4. Adaptive full-pack sweep

`Test All Mods` must not naively require `N + 1` full launches by default.

Use this order:

1. static risk scan and startup metadata
2. dependency-cluster construction
3. one current-pack baseline
4. hierarchical/binary cohort tests to locate expensive regions
5. direct A/B confirmation of likely offenders
6. pair/interactions tests where one mod becomes expensive only with another mod
7. optional exhaustive per-mod confirmation when the user explicitly requests it

Final UI labels:

- **Measured** — direct paired A/B evidence exists
- **Interaction** — performance cost appears only in a tested combination
- **Suspected** — cohort/static/runtime attribution points to the mod but direct confirmation is pending
- **No measurable impact** — paired result is within test noise/confidence bounds
- **Not testable in isolation** — dependency/runtime contract prevents a meaningful solo comparison

## Launch acceleration for testing

A different enabled-mod set requires a new Minecraft JVM; Enderloom must not pretend it can hot-unload normal mods from a running game. Instead, make each required restart as cheap as possible.

### Fast Launch Engine

- pre-resolve Java, loader, classpath, assets, natives, auth, launch arguments, and dependency plans
- reuse already-installed immutable libraries and game assets
- retain warm filesystem and download caches
- keep a prebuilt benchmark sandbox rather than cloning the full profile for every run
- materialize only the changed enabled-mod set
- avoid launcher UI work that is irrelevant to the benchmark
- launch directly into the benchmark scenario through the Enderloom test probe when supported
- auto-exit after the required capture window
- reuse valid baselines by fingerprint
- run server-only tests through `nogui` dedicated-server paths whenever the mod side metadata makes that valid
- never report a speed gain obtained by omitting required initialization or benchmark work

## Instrumentation stack

Enderloom should use multiple complementary evidence sources instead of depending on one profiler.

### A. Enderloom native process telemetry

Always available from the launcher/native layer:

- process start -> first JVM output -> loader milestones -> title ready -> world ready timing
- process CPU and child-thread usage
- working set / committed memory
- disk read/write rates
- network throughput
- process exit/crash/hang state
- OS-level GPU process utilization where supported

### B. Java Flight Recorder (JFR)

Preferred built-in low-friction JVM profiler because it can start at launch without installing a Minecraft mod.

Capture selected events for:

- CPU samples / execution samples
- thread park/sleep/locks
- GC pauses and heap summaries
- allocation pressure
- class loading
- file/socket I/O
- exceptions
- compiler/JIT activity

Enderloom parses `.jfr` into its own normalized result schema and retains the original recording for deep analysis.

### C. Spark adapter

When compatible, Enderloom may temporarily add Spark to the test sandbox or use an already-installed compatible Spark build.

Use local-file capture by default so testing does not require public uploads. Support client and server profiling, tick monitoring, health, allocation profiling, and slow-tick capture where the installed Spark version supports them.

Spark evidence is imported into Enderloom's own result model; the original Spark artifact remains available.

### D. Observable adapter

Observable is valuable for block-entity/entity/scheduled-tick hotspots and in-world spatial diagnosis. Treat it as an optional deep-world adapter, especially when the problem is `where in the world is the lag coming from?` rather than only `which package owns this stack?`.

Do not make Observable a mandatory dependency for basic testing because compatibility differs by Minecraft/loader version.

### E. Enderloom Probe mod

Build a tiny loader-specific **Enderloom Probe** for Fabric/Quilt/Forge/NeoForge benchmark automation. Its only job is deterministic test control and high-quality telemetry, not gameplay.

Responsibilities:

- emit lifecycle markers
- enter a benchmark world automatically when explicitly requested
- wait for warm-up conditions
- replay deterministic camera/movement/test scripts
- capture frame time/FPS percentiles
- capture integrated-server tick timings
- place test markers around scenarios
- trigger profiler start/stop actions through supported integrations
- write machine-readable results
- close the game after the test

The Probe must be test-sandbox-only by default and must not remain silently installed in the user's live pack.

## Out-of-game Quick Scan

Quick Scan should feel like `magic` but stay honest about what can and cannot be known before runtime.

### Static JAR/bytecode analysis

Without launching Minecraft, inspect:

- mod metadata, side declarations, dependencies, embedded libraries
- JAR size, class count, resource count, texture/model/audio footprint
- mixin configs and injection targets
- access transformers/access wideners/coremod/plugin declarations
- event subscriber density
- tick/render/network/worldgen-related method references
- whole-world/entity scans and broad collection iteration patterns
- obvious synchronous file/network I/O in tick/render paths
- excessive reflection/classpath scanning patterns
- scheduled tasks and repeated timers
- class transformers
- resource reload listeners
- chunk/worldgen hooks
- entity/block-entity tick registrations
- render hooks and post-processing/shader integrations
- registry volume and generated datapack/resource footprint

Output a **Static Risk Report** with reasons, not a fake FPS/TPS number.

Example findings:

- `High tick-risk: injects into LivingEntity.tick and references level-wide entity queries.`
- `Startup-risk: 2,400 classes + 14 Mixin configs + broad classpath scan.`
- `Render-risk: hooks LevelRenderer and allocates collections in a per-frame path.`
- `Low static concern: mostly data/resources; no recurring tick/render hooks detected.`

### Headless/runtime-without-client options

For server-capable mods, Enderloom can run a temporary dedicated server with `nogui`, fixed world state, JFR/Spark capture, and automatic shutdown. This is a real runtime test but avoids the graphical client.

For client-only rendering/FPS/GPU behavior, a real client render is required. Enderloom must state that clearly rather than fabricating an out-of-game estimate.

## Deterministic scenarios

Built-in scenarios should be versioned so results remain comparable.

### Startup

- cold JVM launch
- loader/bootstrap
- mod construction/init/setup
- registry/resource stages
- title-screen ready
- optional world-load ready

### Client idle

- fixed benchmark world snapshot
- fixed camera position
- fixed render/simulation distance
- shaders/resource packs preserved as part of scenario fingerprint
- warm-up period before measurement

### Client traversal

- deterministic camera/player path
- fixed chunk set already pregenerated where the test is intended to measure runtime rather than worldgen
- separate `Worldgen Traversal` scenario when generation cost itself is the target

### Server idle and stress

- fixed world snapshot
- fixed entity/block-entity fixture
- fixed random tick/simulation settings
- explicit warm-up
- optional controlled redstone/entity/chunk-loader fixtures

### Soak

Longer test for memory growth, periodic spikes, GC pressure, scheduler buildup, and leaks.

## Metrics shown per mod

Never collapse everything into one unexplained score.

### Startup

- launch delta
- mod-loader stage delta
- title-ready delta
- world-ready delta
- class-load delta

### Client rendering

- average FPS
- median frame time
- 1% low / 0.1% low FPS
- p95 / p99 / worst frame time
- stutter count over configurable thresholds
- render-thread CPU samples
- total process GPU time/utilization when available
- GPU frame time when Probe/platform support makes it measurable

### Server / integrated server

- TPS
- median/p95/p99/max MSPT
- slow-tick count
- server-thread CPU attribution
- entity/block-entity/scheduled tick hotspots
- chunk/worldgen contribution

### Memory

- heap used after warm-up
- retained heap trend
- allocation rate
- GC count/pause time
- top owned class families
- optional heap-summary/deep dump artifacts

### System

- process CPU
- disk I/O
- network I/O
- thread/lock contention
- JVM/JIT state

## Statistical comparison

A/B comparison must control noise.

- same scenario fingerprint
- warm-up before capture
- alternate A/B order when practical to reduce thermal/cache bias
- repeat noisy tests automatically
- report median + spread, not only one run
- flag thermal throttling, background load, power-mode changes, shader compilation, worldgen, antivirus scanning, or cache invalidation when detected
- show `Low confidence` rather than overstate a tiny delta

A mod should not be called a regression when the observed difference is inside the measured noise floor.

## Per-mod Performance panel

Every installed mod detail page gains a **Performance** section.

Header card:

- current status badge
- latest tested version/hash
- `Measured / Suspected / Interaction / No measurable impact / Untested`
- latest overall summary in plain language
- confidence
- last tested date + environment

### Side-by-side A/B cards

`With mod` vs `Without mod`:

- startup
- FPS + lows
- frame-time p95/p99
- TPS/MSPT
- memory/allocations
- GC
- CPU/GPU/system load

Show absolute values **and delta**.

### Drill-down

- timeline overlay
- profiler flame/call tree
- JFR event summary
- Spark source attribution
- Observable world hotspots when captured
- logs tied to exact run
- config diff used by the scenario
- interaction graph
- prior versions / historical trend

### Actions

- `Test Again`
- `Test Without`
- `Test With Current Config`
- `Test With Fresh Config`
- `Compare Version...`
- `Compare Config...`
- `Run Deep Profile`
- `Open Raw Evidence`
- `Why?`
- `Analyze with AI`

## Whole-pack dashboard

The Testing tab should provide:

- top startup offenders
- top server-thread offenders
- top render/frame offenders
- highest allocation/GC contributors
- highest static-risk mods not yet runtime-tested
- interaction/conflict graph
- recently regressed mods
- untested changed mods
- test queue and completed runs
- `Before vs After` pack scorecard for any two revisions

Filters:

- loader
- side: client/server/both
- measured vs suspected
- startup/render/tick/memory/worldgen/network/disk
- severity
- version changed
- test confidence

## AI Diagnostic Bundle

`Analyze with AI` produces a standardized `.enderloom-diagnostic.zip` plus a readable Markdown summary.

### Default bundle

- selected target mod JAR when the user chooses to include it
- exact mod SHA-256 and provider/version metadata
- dependency list and relevant dependent mods
- complete enabled mod manifest with hashes
- `latest.log`, relevant `debug.log`, crash reports
- Enderloom benchmark JSON
- A/B summary
- Spark local profile artifacts when available
- JFR recording and normalized JFR summary
- Observable export/artifacts when available
- relevant target-mod config files
- config diff between A/B scenarios
- Java/Minecraft/loader/JVM settings
- hardware/OS summary
- precise reproduction steps and benchmark scenario
- static risk report

### Privacy and safety

Before export/send:

- redact auth tokens, cookies, API keys, session IDs, known credential patterns, and launcher secrets
- offer username/path/IP/server-address redaction
- show exactly what files will be included
- never upload externally without a user action
- preserve original local artifacts separately from redacted share copies

### Provider handoff

Provide a provider-neutral `Analyze with AI` chooser:

- ChatGPT
- Claude
- Gemini
- Copilot / GitHub-oriented analysis where appropriate
- custom provider/export folder

Minimum guaranteed workflow:

1. build the bundle
2. copy a high-quality analysis prompt
3. open the selected provider
4. reveal/select the bundle for attachment

Optional direct provider APIs may be supported only when the user explicitly configures that provider. Enderloom must never claim an upload succeeded without a real provider/UI/API acknowledgement.

The copied prompt should ask the AI to identify exact hot code paths, distinguish causation from correlation, propose performance fixes that preserve content/gameplay, and state what additional evidence is needed.

## Automatic regression tracking

When a user adds, removes, updates, patches, or reconfigures a mod, Enderloom should show whether existing benchmark evidence became stale.

Examples:

- `Mod updated: prior 2.3.1 result retained for history; 2.4.0 untested.`
- `Config changed: runtime result may no longer represent current behavior.`
- `Shader changed: FPS comparisons from the old shader profile are not directly comparable.`

Premium may offer `Re-test changed mods` as a queue, but testing remains user-started unless the user explicitly enables an automation policy.

## Ecosystem research and ideas to absorb

### spark — `lucko/spark`

Strong ideas:

- low-overhead CPU sampling
- client/server support
- health/TPS/MSPT/GC/memory tooling
- slow-tick filtering
- allocation profiles
- source/mod-oriented profiler views
- local save support instead of mandatory upload

Enderloom improvement: automate capture, tie evidence to exact pack/mod fingerprints, compare A/B runs, and make the result live directly on each mod card.

### Observable — `tasgon/observable`

Strong ideas:

- spatial `lag goggles` style diagnosis
- entity/block-entity/scheduled-tick attribution
- in-world hotspots

Enderloom improvement: make it one evidence adapter inside a broader repeatable benchmark instead of requiring users to interpret it manually.

### Task Manager — `Wueffi/TaskManager`

Strong ideas:

- per-mod CPU views
- estimated per-mod GPU attribution
- startup timing
- memory views
- timelines
- world/system panels
- polished exported sessions

Enderloom improvement: cross-loader orchestration, direct with/without validation, safe external-launcher instance handling, historical regression tracking, and provider-neutral AI bundles.

### Modpack Debugger Kit — `WendellCraft/ModpackDebuggerKit`

Strong ideas:

- automated binary search
- dependency awareness
- snapshotting/new-mod detection
- Modrinth dependency synchronization

Enderloom improvement: use binary/cohort isolation as only the first stage, then confirm actual performance impact with controlled paired benchmarks and profiler evidence.

### MC Benchmark — `Krutoy242/mc-benchmark`

Strong idea: parse logs into startup/load-time reports.

Enderloom improvement: measure startup directly, correlate log stages with JFR/loader events, and compare revisions rather than only rendering a one-off report.

### MoreProfiling — `SettingDust/MoreProfiling`

Strong idea: use Java Flight Recorder around Minecraft startup/runtime.

Enderloom improvement: launcher-owned JFR requires no permanent gameplay mod, works as a normalized evidence lane, and can be combined with Spark/Probe telemetry.

### spark-analyzer — `imSirr/spark-analyzer`

Strong ideas:

- plain-language bottleneck verdicts
- before/after comparison
- profile quality gates
- source attribution
- `Copy for AI`

Important boundary: its repository states a PolyForm Noncommercial license. Do not copy its implementation into a commercial Premium feature. Reimplement Enderloom's own analyzer from first principles using public profiler formats/APIs and independently designed rules.

## Licensing/integration boundary

Use external tools through normal installation/integration/export protocols or independently implemented adapters. Do not casually copy code into Enderloom.

Known repository licenses at time of design:

- spark: GPL-3.0; spark API submodule: MIT
- Observable: MPL-2.0
- spark-analyzer: PolyForm Noncommercial 1.0.0

Before bundling or redistributing any third-party profiler build, confirm its current license and distribution terms. Prefer downloading a user-selected compatible official release into the test sandbox or using an already-installed copy when licensing/version support is unclear.

## Data model

Each test session must persist:

```text
session_id
created_at
instance_id
pack_fingerprint
scenario_id + scenario_version
hardware_fingerprint
minecraft_version
loader + version
java + jvm_args
target_mods[]
control_mod_set_hash
variant_mod_set_hash
config_hashes
run_order
warmup_duration
capture_duration
profiler_versions
raw_artifact_paths
normalized_metrics
noise/confidence
findings[]
interaction_edges[]
redaction_state
```

Each mod aggregates immutable historical test references by mod SHA-256, not merely filename.

## Premium/free boundary

Recommended product split:

### Free

- read existing logs/diagnostics
- show whether Spark/JFR artifacts exist
- manual import of a profiler result
- basic out-of-game metadata scan
- open raw diagnostic files

### Premium

- automated Testing workspace
- single-mod paired A/B testing
- full-pack adaptive sweep
- deterministic Probe scenarios
- Fast Launch Engine test sandbox
- automatic JFR/Spark capture/import
- history and regression tracking
- interaction tests
- polished per-mod Performance panels
- AI Diagnostic Bundles and provider handoff
- comparison dashboards and saved benchmark suites

Do not cripple ordinary mod management to force Premium. Premium sells saved time, automation, evidence quality, and analysis.

## Implementation phases

### Phase 1 — foundation

- normalized test-session schema
- test sandbox + safe cleanup
- pack/mod/config/environment fingerprinting
- Quick Scan static analyzer
- JFR launch/capture/parser
- manual benchmark session + history

### Phase 2 — direct A/B

- target mod dependency graph
- enable/disable sandbox materialization
- baseline reuse
- paired runner
- startup + dedicated-server scenarios
- per-mod Performance panel

### Phase 3 — client benchmark Probe

- loader-specific Probe builds
- deterministic benchmark world/path
- FPS/frame-time telemetry
- integrated-server metrics
- automatic start/warmup/capture/exit

### Phase 4 — profiler adapters

- Spark compatibility resolver, temporary install, local-file capture, parser
- Observable optional deep-world integration
- imported profiler viewer links/raw evidence

### Phase 5 — whole-pack intelligence

- adaptive cohort/binary sweep
- direct candidate confirmation
- interaction testing
- regression dashboard
- confidence/noise engine

### Phase 6 — AI handoff

- redacted diagnostic bundle
- provider chooser
- high-quality generated prompt
- open/reveal/attach-assisted workflow
- optional user-configured provider API adapters

## Release acceptance

The feature is not accepted until all of these are true:

- live profile is never mutated by an automated test
- failed/cancelled runs restore/clean the sandbox
- required dependency closure is preserved in target tests
- a measured per-mod verdict can be traced to raw evidence
- direct A/B comparisons show exact scenario and environment fingerprints
- changed mod/config/hardware/Java/loader state invalidates only the evidence that truly became stale
- baseline caching never crosses incompatible fingerprints
- startup tests capture real loader/game work
- client FPS tests use a real rendered client and never claim headless FPS accuracy
- server-only tests can run without a graphical client when valid
- at least one built-in test catches a deliberate tick regression
- at least one catches a deliberate render/frame regression
- at least one catches startup inflation
- at least one catches allocation/GC regression
- AI bundles redact secrets and enumerate contents before external handoff
- every visible button performs a real operation or reports a truthful unsupported state
- results persist across Enderloom restart
- mod version history remains comparable by SHA-256
- one final challenge/regression pass verifies that profiler overhead itself is not being mistaken for target-mod cost

## Challenge-pass notes

Primary sources of misleading data that Enderloom must actively detect or control:

- JIT warm-up differences
- shader compilation
- first-time model/texture bake
- world generation mixed into normal traversal tests
- Distant Horizons or similar background generation
- antivirus scanning new/changed JARs
- Windows power/thermal state
- other CPU/GPU-heavy applications
- garbage collection timing randomness
- filesystem cold/warm cache effects
- server entity count drift
- random ticks/weather/time differences
- mods whose behavior activates only after long play or special content
- performance interactions where disabling one mod changes another mod's code path

The UI should explain these as test-quality factors, not hide them.

## Product identity

The premium surface should feel like **Enderloom Performance Lab**, not a pile of profiler buttons. The user asks a simple question — `What is slowing my pack down?` — and Enderloom chooses the fastest valid evidence route, preserves the user's pack, shows the direct before/after result, keeps history on the affected mod, and packages everything needed for the next fix.