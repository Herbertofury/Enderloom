# Enderloom — Performance + Favorites Focused Checklist

**Scope:** Only the Enderloom features discussed around the **Favorites** tab, the **Performance / Testing** tab, and the directly related QOL, CLI, automation, diagnostics, and AI handoff.

**Do not treat this as the full Enderloom master plan.**

---

# 1. Shared tab principles

- [ ] Favorites and Performance are first-class Enderloom tabs/workspaces, not buried dialogs.
- [ ] Both tabs use real persisted data, never synthetic placeholder state.
- [ ] No dead buttons.
- [ ] No fake progress or fake success.
- [ ] No artificial caps on favorite items, test history, profiler evidence, or mod results just to make the UI faster.
- [ ] Optimize real work instead: caching, batching, concurrency, fingerprints, delta updates, and lazy rendering where safe.
- [ ] Long operations expose progress, cancellation, recovery, and useful logs.
- [ ] User-triggered operations stay user-triggered by default; no hidden watchdog constantly retesting or repatching things.
- [ ] Add a clear **Why?** affordance anywhere Enderloom makes a recommendation, warning, compatibility judgment, performance verdict, or cleanup suggestion.
- [ ] Add accurate hover tooltips for controls/settings when Enderloom can explain their actual effect.
- [ ] Preserve user-edited files/configs and live launcher profiles.
- [ ] Destructive actions clearly preview what will change.
- [ ] Errors explain what failed, what was preserved, and the next useful action.

---

# 2. Favorites tab — first-class saved workspace

## 2.1 Core behavior

- [ ] Add/retain a dedicated **Favorites** tab.
- [ ] Any supported mod/project/item can be favorited/unfavorited instantly.
- [ ] Favorite state persists across restarts.
- [ ] Favorite state updates immediately everywhere in Enderloom.
- [ ] No duplicate favorites for the same canonical project/version identity unless intentionally saved as distinct variants.
- [ ] Preserve canonical provider/source identity for every favorite.
- [ ] Keep favorite data independent of whether the mod is currently installed.
- [ ] Removing a mod from an instance must not automatically remove it from Favorites.
- [ ] Unfavoriting never uninstalls or removes content.

## 2.2 Organization

- [ ] Search Favorites.
- [ ] Sort Favorites.
- [ ] Filter Favorites.
- [ ] Tag Favorites.
- [ ] Create reusable favorite collections/groups.
- [ ] Rename collections/groups.
- [ ] Reorder collections/groups.
- [ ] Drag/drop favorites between collections/groups.
- [ ] Allow one favorite to belong to multiple tags/collections when useful.
- [ ] Pin especially important favorites.
- [ ] Add optional notes to favorites.
- [ ] Bulk-select favorites.
- [ ] Bulk tag/move/remove-from-favorites.
- [ ] Preserve collection order and layout across restart.
- [ ] Provide Tiles / List / Table views if the existing Enderloom view system can be reused cleanly.

## 2.3 Favorite cards/rows

Each favorite should show useful at-a-glance data without becoming cluttered:

- [ ] project/mod name;
- [ ] icon/media when real source media exists;
- [ ] provider/source;
- [ ] author/creator where known;
- [ ] latest compatible version for the selected/linked instance context;
- [ ] currently installed version where applicable;
- [ ] update available state;
- [ ] loader compatibility;
- [ ] Minecraft version compatibility;
- [ ] installed/not-installed state;
- [ ] frozen/pinned version state where relevant;
- [ ] latest Performance verdict/badge when test evidence exists;
- [ ] latest tested mod SHA-256/version when performance data exists;
- [ ] stale/needs-retest badge when the mod changed since the last valid performance result.

## 2.4 Quick actions from Favorites

- [ ] Open project details.
- [ ] Open real source/provider page.
- [ ] Install to one instance.
- [ ] Install to multiple instances.
- [ ] Choose exact version.
- [ ] Update installed copy.
- [ ] Open installed mod in Mod Manager.
- [ ] Open config/related files when installed.
- [ ] Run Quick Scan.
- [ ] Run Performance Test.
- [ ] Compare tested versions.
- [ ] View Performance history.
- [ ] Add/edit note.
- [ ] Move/tag/pin/unfavorite.

## 2.5 Favorites ↔ Performance integration

- [ ] Favorite a known-good optimization mod and keep its performance history attached.
- [ ] Favorite a suspected laggy mod directly from Performance results.
- [ ] Add **Test Favorites** action to queue selected favorites that are installed/testable.
- [ ] Add **Show Favorites Only** filter in Performance results.
- [ ] Add **Favorite culprit** / **Favorite known-good** quick actions from a result.
- [ ] Favorite cards can show measured startup/FPS/TPS/memory impact summaries when valid evidence exists.
- [ ] Never show a measured performance badge when only static analysis exists.
- [ ] When a favorite version changes, retain old history but mark the new version untested/stale.

---

# 3. Performance / Testing tab — Premium Performance Lab

## 3.1 Workspace identity

- [ ] Top-level tab/workspace: **Performance** or **Testing**.
- [ ] Primary product name inside the tab: **Performance Lab**.
- [ ] Premium feature positioning should be based on automation, repeatability, confidence, history, and evidence — not crippling ordinary launcher functionality.
- [ ] Primary question answered by the workspace:
  - **What is slowing my pack down, and how do we prove it?**

## 3.2 Landing dashboard

Show a beautiful, readable summary of the pack:

- [ ] overall current test status;
- [ ] latest baseline;
- [ ] last test date;
- [ ] active instance/modpack fingerprint;
- [ ] top startup offenders;
- [ ] top client/render offenders;
- [ ] top server-thread/TPS offenders;
- [ ] top memory/allocation/GC offenders;
- [ ] highest static-risk untested mods;
- [ ] interaction/conflict suspects;
- [ ] recently regressed mods;
- [ ] changed mods that need retesting;
- [ ] favorite mods with performance status;
- [ ] queued/running tests;
- [ ] recent completed tests;
- [ ] Before vs After comparison card.

## 3.3 Core test buttons/flows

- [ ] **Quick Scan** — out-of-game static analysis, no Minecraft launch.
- [ ] **Test One Mod** — direct paired A/B test.
- [ ] **Test All Mods** — adaptive whole-pack isolation + direct confirmation.
- [ ] **Startup Test**.
- [ ] **Client FPS Test**.
- [ ] **Server TPS Test**.
- [ ] **Lag Spike Hunt**.
- [ ] **Memory Test**.
- [ ] **Compare Runs**.
- [ ] **Regression Test**.
- [ ] **Re-test Changed Mods**.
- [ ] **Test Selected Favorites**.

---

# 4. Performance verdicts — no fake precision

Allowed result/verdict classes:

- [ ] **Measured**
- [ ] **Interaction**
- [ ] **Suspected**
- [ ] **No measurable impact**
- [ ] **Not testable in isolation**
- [ ] **Untested**

Rules:

- [ ] **Measured** requires direct traceable runtime evidence.
- [ ] Static analysis alone never becomes a Measured verdict.
- [ ] If dependencies make isolation invalid, say **Not testable in isolation**.
- [ ] If the effect appears only in combinations, say **Interaction**.
- [ ] If evidence is noisy, lower confidence instead of overclaiming.
- [ ] Do not call a mod the culprit because its dependency closure disappears with it.
- [ ] Every measured verdict links to exact runs, scenario, hashes, profiler artifacts, and confidence/noise information.

---

# 5. Metrics to capture

## 5.1 Startup

- [ ] total launch time;
- [ ] JVM start -> loader start;
- [ ] loader initialization time;
- [ ] mod initialization time;
- [ ] title-screen-ready time;
- [ ] world-ready time;
- [ ] class loading contribution where measurable;
- [ ] startup CPU;
- [ ] startup allocation/GC;
- [ ] startup I/O;
- [ ] paired delta with/without target mod.

## 5.2 Client FPS / frame-time

- [ ] average FPS;
- [ ] median FPS/frame time;
- [ ] 1% low FPS;
- [ ] 0.1% low FPS;
- [ ] p95 frame time;
- [ ] p99 frame time;
- [ ] worst-frame time;
- [ ] stutter count;
- [ ] long-frame count;
- [ ] render-thread CPU;
- [ ] client main-thread CPU;
- [ ] GPU process utilization where the OS exposes trustworthy data;
- [ ] GPU frame time only when a valid rendered-client measurement path exists;
- [ ] distinguish shader compilation/warmup from steady-state measurement.

## 5.3 Server/TPS/MSPT

- [ ] TPS;
- [ ] median MSPT;
- [ ] p95 MSPT;
- [ ] p99 MSPT;
- [ ] max MSPT;
- [ ] slow-tick count;
- [ ] server-thread CPU;
- [ ] tick phase attribution where available;
- [ ] entity hotspots;
- [ ] block-entity hotspots;
- [ ] scheduled-tick hotspots;
- [ ] chunk/worldgen impact;
- [ ] network contribution where relevant.

## 5.4 Memory / GC

- [ ] heap after warmup;
- [ ] retained heap trend;
- [ ] allocation rate;
- [ ] GC count;
- [ ] GC pause time;
- [ ] top allocation families/classes;
- [ ] leak-like growth during soak tests;
- [ ] paired delta with/without target mod.

## 5.5 System/process

- [ ] process CPU;
- [ ] thread CPU where supported;
- [ ] disk I/O;
- [ ] network I/O;
- [ ] thread/lock contention;
- [ ] JVM/JIT state;
- [ ] process memory;
- [ ] environmental flags such as thermal/background-load noise when detectable.

---

# 6. Quick Scan — out-of-game static mod analysis

Quick Scan must be fast and must **not pretend static analysis equals measured runtime performance**.

Inspect where useful:

- [ ] mod metadata;
- [ ] dependencies;
- [ ] side/environment declarations;
- [ ] embedded libraries/Jar-in-Jar;
- [ ] JAR size;
- [ ] class count;
- [ ] resource/texture/model/audio footprint;
- [ ] Mixin configs;
- [ ] injection targets;
- [ ] access transformers/wideners;
- [ ] coremods/transformers/plugins;
- [ ] tick/event registrations;
- [ ] render hooks;
- [ ] networking hooks;
- [ ] worldgen hooks;
- [ ] entity/block-entity ticking hooks;
- [ ] broad world/entity scans;
- [ ] synchronous file/network I/O in likely hot paths;
- [ ] reflection/classpath scans;
- [ ] scheduled tasks/timers;
- [ ] resource reload listeners;
- [ ] shader/post-processing hooks;
- [ ] registry/datapack/resource footprint.

Output examples:

- [ ] high startup risk;
- [ ] high tick risk;
- [ ] render risk;
- [ ] allocation concern;
- [ ] worldgen concern;
- [ ] networking concern;
- [ ] low static concern;
- [ ] dependency/side concern;
- [ ] needs runtime confirmation.

Never output fake FPS/TPS/MSPT numbers from Quick Scan.

---

# 7. Safe test sandbox

- [ ] Never run destructive A/B mutation against the user's live instance.
- [ ] Create isolated Enderloom-owned test sandboxes.
- [ ] Reuse immutable Minecraft assets/libraries/Java/loader installs safely.
- [ ] Isolate writable configs, worlds, logs, profiler output, and temp test mods.
- [ ] Preserve user-edited configs.
- [ ] Allow explicit **Current Config** vs **Fresh Config** test modes inside the sandbox.
- [ ] Failed/cancelled test cleans only Enderloom-owned temp state.
- [ ] Preserve completed evidence even if a later run crashes.
- [ ] Never silently leave test-only profiler/Probe mods inside the live profile.

## Fingerprint each run

- [ ] Minecraft version;
- [ ] loader + loader version;
- [ ] Java runtime;
- [ ] JVM args;
- [ ] enabled mod SHA-256 set;
- [ ] config hashes;
- [ ] shader state;
- [ ] resource-pack state;
- [ ] render distance;
- [ ] simulation distance;
- [ ] benchmark-world hash;
- [ ] scenario version;
- [ ] CPU;
- [ ] GPU;
- [ ] OS;
- [ ] relevant power mode;
- [ ] cache policy;
- [ ] runtime mode.

---

# 8. Test One Mod — direct A/B proof

For a selected mod:

- [ ] resolve dependencies/dependents;
- [ ] determine whether isolation is valid;
- [ ] create/reuse compatible baseline;
- [ ] create sandbox variant A;
- [ ] create comparison variant B;
- [ ] run same deterministic scenario;
- [ ] repeat if noise is too high;
- [ ] compare metrics;
- [ ] calculate delta;
- [ ] classify verdict;
- [ ] calculate confidence/noise status;
- [ ] store raw evidence;
- [ ] attach result to that exact mod SHA-256/version;
- [ ] make result visible from Favorites and the mod details view.

---

# 9. Test All Mods — adaptive whole-pack isolation

Do not default to one full Minecraft launch per mod when a smarter dependency-aware strategy can reduce launches.

Default plan:

- [ ] static Quick Scan first;
- [ ] build dependency graph;
- [ ] cluster inseparable dependencies;
- [ ] establish current-pack baseline;
- [ ] run cohort/binary isolation tests;
- [ ] narrow candidate region;
- [ ] direct A/B confirm likely offenders;
- [ ] run pair/interaction tests when evidence suggests interactions;
- [ ] mark untestable clusters truthfully;
- [ ] preserve a resumable test queue;
- [ ] retain completed results if the batch stops.

Optional:

- [ ] explicit **Exhaustive** mode for direct per-mod confirmation.
- [ ] `--exhaustive` must actually mean exhaustive.

---

# 10. Deterministic benchmark scenarios

Built-in scenario families:

- [ ] Startup;
- [ ] Client idle;
- [ ] Client traversal;
- [ ] Worldgen traversal;
- [ ] Server idle;
- [ ] Server stress;
- [ ] Memory/GC soak.

Determinism controls:

- [ ] fixed benchmark world/snapshot;
- [ ] fixed player spawn/start;
- [ ] fixed camera position;
- [ ] versioned movement route;
- [ ] fixed settings;
- [ ] fixed warmup;
- [ ] fixed measurement window;
- [ ] explicit completion condition;
- [ ] explicit timeout;
- [ ] scenario fingerprint stored with the result.

---

# 11. Enderloom Probe — test-only Minecraft control mod

Build loader-specific, test-only Probe variants as needed.

Capabilities:

- [ ] JVM/loader/mod-init lifecycle markers;
- [ ] title-ready marker;
- [ ] world-open marker;
- [ ] player-ready marker;
- [ ] chunks/benchmark-region-ready marker;
- [ ] deterministic benchmark-world entry;
- [ ] command/chat injection;
- [ ] GUI state dump where feasible;
- [ ] GUI click/assert where feasible;
- [ ] keyboard/mouse/input control;
- [ ] camera/look control;
- [ ] scripted movement/routes;
- [ ] interaction steps;
- [ ] profiler boundary markers;
- [ ] FPS/frame-time telemetry;
- [ ] integrated-server telemetry;
- [ ] GameTest list/run support where appropriate;
- [ ] actual runtime screenshot capture;
- [ ] scenario-complete marker;
- [ ] clean automatic exit.

Security/safety:

- [ ] Probe control channel is local/scoped to the Enderloom-owned test run.
- [ ] Probe never becomes a permanent hidden live-profile mod.

---

# 12. Truthful runtime modes

## Rendered

- [ ] Real rendered client.
- [ ] Required for trustworthy FPS/frame-time/render/GPU conclusions.

## Virtual-display

- [ ] Real client under virtual/hidden display where supported.
- [ ] Valid for CI/client behavior/world joining/GameTest.
- [ ] Do not claim physical GPU/FPS equivalence.

## Headless

- [ ] Useful for bootstrap, compatibility, client logic, and selected GameTest workflows.
- [ ] Never claim real FPS/GPU impact from headless mode.

## Server

- [ ] Dedicated `nogui` server mode for server-only tests.

## Protocol bot

- [ ] Optional synthetic-player load/network lane.
- [ ] Never substitute for real modded-client rendering evidence.

---

# 13. Profiler integration

## JFR

- [ ] Start JFR at JVM launch when startup profiling is requested.
- [ ] CPU samples.
- [ ] allocation events.
- [ ] GC events.
- [ ] locks/parks/sleeps.
- [ ] class loading.
- [ ] I/O.
- [ ] exceptions.
- [ ] JIT/compiler activity.
- [ ] retain raw `.jfr`.
- [ ] create normalized Enderloom summary.

## Spark

- [ ] Detect compatible existing Spark in the sandbox/instance.
- [ ] Temporarily inject compatible Spark into test sandbox when needed.
- [ ] Client/server capture where supported.
- [ ] Tick/health/allocation/slow-tick evidence where supported.
- [ ] Prefer local Spark artifacts.
- [ ] Never require a public Spark upload.
- [ ] Normalize Spark evidence into Enderloom results.

## Observable

- [ ] Optional deep-world profiler lane.
- [ ] Check loader/version compatibility first.
- [ ] Capture spatial entity/block-entity/scheduled-tick hotspots where supported.
- [ ] Never make Observable mandatory for ordinary Performance Lab success.

## Profiler-overhead validation

- [ ] Test that the profiler itself is not causing the apparent regression.
- [ ] Re-run representative samples with a lower-overhead path if needed.

---

# 14. Fast Launch Engine for testing

- [ ] Reuse validated Java selection.
- [ ] Reuse Minecraft assets/libraries.
- [ ] Reuse loader install/resolution.
- [ ] Reuse auth/launch prerequisites safely.
- [ ] Keep benchmark sandbox prepared.
- [ ] Materialize only changed mod state when safe.
- [ ] Skip irrelevant Enderloom UI work for CLI/automated tests.
- [ ] Launch directly into test flow when Probe supports it.
- [ ] Auto-warmup.
- [ ] Auto-capture.
- [ ] Auto-exit.
- [ ] Reuse compatible baselines by fingerprint.
- [ ] Support explicit cold-cache and warm-cache tests.
- [ ] Record cache mode in results.
- [ ] Never fake speed by skipping required Minecraft initialization.

---

# 15. Per-mod Performance page

Header:

- [ ] current verdict badge;
- [ ] latest tested version;
- [ ] exact SHA-256;
- [ ] confidence;
- [ ] latest scenario/environment;
- [ ] last test time;
- [ ] stale/valid state.

A/B summary cards:

- [ ] absolute metric values;
- [ ] delta;
- [ ] run count;
- [ ] scenario;
- [ ] confidence/noise;
- [ ] raw evidence link.

Drill-down:

- [ ] timeline overlay;
- [ ] flame/call tree where available;
- [ ] JFR summary;
- [ ] Spark attribution;
- [ ] Observable hotspots;
- [ ] native process telemetry;
- [ ] logs tied to run;
- [ ] config diff;
- [ ] dependency graph;
- [ ] interaction graph;
- [ ] historical trend.

Actions:

- [ ] Test Again;
- [ ] Test Without;
- [ ] Test With Current Config;
- [ ] Test With Fresh Config;
- [ ] Compare Version…;
- [ ] Compare Config…;
- [ ] Run Deep Profile;
- [ ] Open Raw Evidence;
- [ ] Why?;
- [ ] Favorite / Unfavorite;
- [ ] Analyze with AI.

---

# 16. Performance history and staleness

Store results against mod **SHA-256** + test/environment fingerprint.

- [ ] Version change retains old history but current version becomes untested.
- [ ] Config change can mark relevant result stale.
- [ ] Shader change invalidates direct FPS comparability where applicable.
- [ ] Resource-pack/render-setting change invalidates affected render baseline.
- [ ] Java/JVM change invalidates incompatible baseline.
- [ ] Loader/version change invalidates incompatible baseline.
- [ ] Scenario definition change retains old evidence but does not merge it into the new baseline.
- [ ] Dependency graph change invalidates affected A/B comparisons.
- [ ] Favorites reflect stale/current test state immediately.
- [ ] **Re-test Changed Mods** is user-triggered, not a mandatory watchdog.

---

# 17. Noise/confidence engine

- [ ] Warmup runs.
- [ ] Paired fingerprints.
- [ ] Repeat noisy tests automatically within the user-requested run.
- [ ] Alternate A/B order when useful.
- [ ] Use median + spread, not one lucky sample.
- [ ] Flag thermal throttling when detectable.
- [ ] Flag background CPU/GPU load when detectable.
- [ ] Flag power-mode changes.
- [ ] Flag shader compilation/warmup effects.
- [ ] Flag worldgen drift.
- [ ] Flag JIT/GC phase effects.
- [ ] Flag entity-count drift.
- [ ] Flag cache-policy differences.
- [ ] Output **Low confidence** instead of overclaiming.
- [ ] Do not declare a regression when the difference is within measured noise.

---

# 18. Favorites + Performance QOL

- [ ] Performance badges on favorite cards.
- [ ] Favorite directly from a culprit list.
- [ ] Test selected favorites.
- [ ] Filter Performance results to Favorites.
- [ ] Filter Favorites by performance status:
  - Measured offender;
  - Suspected;
  - Interaction;
  - No measurable impact;
  - Untested;
  - Stale.
- [ ] Sort Favorites by measured impact.
- [ ] Sort Favorites by last test date.
- [ ] Sort Favorites by update availability.
- [ ] Bulk queue favorites for Quick Scan.
- [ ] Bulk queue favorites for runtime tests.
- [ ] One-click compare favorite old/new version performance.
- [ ] Keep notes alongside performance history so the user can record why a mod is being watched.
- [ ] Show **Why?** for every performance badge/culprit recommendation.

---

# 19. CLI/automation — only for Favorites + Performance scope

Do not build a separate second implementation; GUI and CLI should call the same domain logic.

## Favorites CLI

- [ ] `enderloom favorites list`
- [ ] `enderloom favorites add <project>`
- [ ] `enderloom favorites remove <project>`
- [ ] `enderloom favorites show <project>`
- [ ] `enderloom favorites tag ...`
- [ ] `enderloom favorites collection ...`
- [ ] `enderloom favorites note ...`
- [ ] filters/sort in machine-readable output;
- [ ] stable IDs/provider identity in output.

## Performance/Test CLI

- [ ] `enderloom test quick-scan`
- [ ] `enderloom test startup`
- [ ] `enderloom test client-fps`
- [ ] `enderloom test server-tps`
- [ ] `enderloom test memory`
- [ ] `enderloom test lag-spikes`
- [ ] `enderloom test mod-impact`
- [ ] `enderloom test interactions`
- [ ] `enderloom test all`
- [ ] `enderloom test favorites`
- [ ] `enderloom test baseline ...`
- [ ] `enderloom test history ...`
- [ ] `enderloom test compare ...`
- [ ] `enderloom test regression ...`
- [ ] `enderloom test result ...`
- [ ] `enderloom test artifacts ...`
- [ ] `enderloom test export ...`
- [ ] `enderloom test cancel ...`
- [ ] `enderloom test resume ...`
- [ ] `enderloom test scenario ...`

## Machine output

- [ ] `--json` clean result envelope.
- [ ] `--jsonl` structured progress/events.
- [ ] Logs/warnings go to stderr in machine mode.
- [ ] Stable schema version.
- [ ] Stable trace/test IDs.
- [ ] Stable exit-code families.
- [ ] No secrets in argv or structured output.

---

# 20. Scenario DSL for Performance tests

- [ ] One versioned YAML/JSON scenario format shared by GUI, CLI, CI, and AI/Codex workflows.
- [ ] Runtime mode.
- [ ] Target instance.
- [ ] Benchmark world/snapshot.
- [ ] Settings.
- [ ] Warmup.
- [ ] Wait conditions.
- [ ] Lifecycle assertions.
- [ ] Profiler start/stop.
- [ ] Route/input steps.
- [ ] Measurement windows.
- [ ] Metric assertions.
- [ ] Timeout.
- [ ] Cancellation.
- [ ] Clean exit.
- [ ] No arbitrary shell execution by default.
- [ ] Explicit opt-in for external hooks.

---

# 21. AI analysis handoff

Create an Enderloom diagnostic package suitable for ChatGPT or another user-selected AI.

- [ ] Build `.enderloom-diagnostic.zip`.
- [ ] Include a readable Markdown summary.
- [ ] Include selected target mod JAR only when user chooses.
- [ ] Include exact mod SHA-256/provider/version.
- [ ] Include enabled mod manifest + hashes.
- [ ] Include dependency graph.
- [ ] Include logs/crash/debug files relevant to the test.
- [ ] Include benchmark JSON.
- [ ] Include paired A/B summary.
- [ ] Include Spark local profile(s) where available.
- [ ] Include JFR + normalized summary where available.
- [ ] Include Observable artifacts where available.
- [ ] Include relevant config/config diff.
- [ ] Include Java/Minecraft/loader/JVM settings.
- [ ] Include hardware/OS summary.
- [ ] Include scenario/reproduction steps.
- [ ] Include Static Risk Report.
- [ ] Include artifact manifest.

Privacy/security:

- [ ] redact auth tokens;
- [ ] redact cookies;
- [ ] redact API keys;
- [ ] redact session IDs;
- [ ] redact known credential patterns;
- [ ] offer path/username/IP/server-address redaction;
- [ ] list every included file before external handoff;
- [ ] never upload automatically;
- [ ] keep unredacted local evidence separate from redacted share copy.

Workflow:

- [ ] Build bundle.
- [ ] Generate analysis prompt.
- [ ] Copy/open provider.
- [ ] Reveal/select bundle for attachment.
- [ ] Never claim the attachment/upload succeeded unless it actually did.

---

# 22. Performance research/reference ideas already discussed

Use as capability inspiration and interoperability references; review licenses before integrating code.

- [ ] Spark — CPU/memory/health profiling.
- [ ] Observable — deep world/entity/block-entity/scheduled-tick diagnostics.
- [ ] HeadlessMc — Minecraft CLI/headless/CI control ideas.
- [ ] mc-runtime-test — client CI, Xvfb, helper-mod world entry/chunk wait/exit, GameTest.
- [ ] PortableMC — CLI launcher/machine-readable output ideas.
- [ ] Minecraft Console Client — protocol/console server smoke lane.
- [ ] Mineflayer — optional synthetic-player load lane.
- [ ] Ferium — automation-friendly mod CLI precedent.
- [ ] packwiz — CLI/source-control-friendly pack workflow precedent.
- [ ] mcman — server test/CI workflow precedent.

Do not blindly copy external implementations or incompatible-license code into the Premium feature.

---

# 23. Acceptance tests

## Favorites

- [ ] Favorite survives restart.
- [ ] Unfavorite does not uninstall anything.
- [ ] Collections/tags/notes survive restart.
- [ ] Bulk operations affect only selected favorites.
- [ ] Favorite provider/project identity remains correct after updates.
- [ ] Installed/uninstalled state refreshes correctly.
- [ ] Performance badge links to the exact valid result.
- [ ] Stale performance result is visibly marked stale after version/config/environment change.
- [ ] Test Selected Favorites queues the correct installed/testable mods.

## Performance

- [ ] Deliberate startup regression is detected.
- [ ] Deliberate server tick regression is detected.
- [ ] Deliberate rendered-client frame regression is detected in rendered mode.
- [ ] Same frame regression is **not** falsely claimed from headless mode.
- [ ] Deliberate allocation/GC regression is detected.
- [ ] Dependency closure does not falsely blame a library.
- [ ] Interaction-only regression becomes Interaction, not Measured single-mod culprit.
- [ ] Noisy test lowers confidence/repeats instead of overclaiming.
- [ ] Profiler-overhead challenge passes.
- [ ] Cancellation kills only Enderloom-owned test processes.
- [ ] Live user instance/config/world is unchanged after test.
- [ ] Test history survives restart.
- [ ] Exact mod SHA-256 and scenario/environment fingerprint are retained.
- [ ] AI bundle redaction and manifest are verified.

## CLI

- [ ] Favorites CLI and GUI produce the same persisted state.
- [ ] Performance CLI and GUI use the same test engine.
- [ ] JSON stdout contains no prose/log noise.
- [ ] JSONL progress is structurally valid.
- [ ] Cancel/resume works.
- [ ] CLI can complete a real Quick Scan.
- [ ] CLI can complete a real rendered/client test when the environment supports it.
- [ ] CLI can complete a real dedicated-server test.

---

# 24. Implementation order

## Phase 1 — Favorites polish

- [ ] Dedicated Favorites workspace cleanup.
- [ ] Persistent canonical favorite model.
- [ ] Collections/tags/pinning/notes.
- [ ] Search/sort/filter/views.
- [ ] Quick actions.
- [ ] Performance badge integration hooks.

## Phase 2 — Performance foundation

- [ ] Test-session schema.
- [ ] Run/result history.
- [ ] Fingerprinting.
- [ ] Safe sandbox.
- [ ] Quick Scan.
- [ ] JFR startup test.

## Phase 3 — Direct mod impact

- [ ] Dependency closure.
- [ ] Baseline reuse.
- [ ] A/B runner.
- [ ] Startup test.
- [ ] Dedicated-server test.
- [ ] Per-mod Performance page.
- [ ] Favorites badges/actions.

## Phase 4 — Minecraft Probe + rendered testing

- [ ] Probe.
- [ ] Lifecycle markers.
- [ ] Deterministic benchmark world/route.
- [ ] FPS/frame-time telemetry.
- [ ] Input/GUI control where feasible.
- [ ] GameTest support.
- [ ] Auto warmup/capture/exit.

## Phase 5 — Deep profilers + whole-pack intelligence

- [ ] Spark adapter.
- [ ] Observable adapter.
- [ ] Adaptive Test All.
- [ ] Interaction tests.
- [ ] Confidence/noise engine.
- [ ] Regression dashboard.
- [ ] Test Favorites workflow.

## Phase 6 — CLI + AI handoff polish

- [ ] Favorites CLI.
- [ ] Performance/Test CLI.
- [ ] Scenario DSL.
- [ ] JSON/JSONL schemas.
- [ ] Diagnostic bundle.
- [ ] AI provider handoff.
- [ ] Full acceptance pass.

---

# 25. Focused definition of done

This focused feature set is done only when:

- [ ] Favorites is a polished, persistent, searchable, organizable workspace.
- [ ] Favorite items can be acted on immediately without hunting through other tabs.
- [ ] Favorites and Performance share accurate current state.
- [ ] Performance Lab can Quick Scan, test one mod, and test whole packs safely.
- [ ] Performance Lab produces real startup/FPS/TPS/MSPT/memory evidence without fake precision.
- [ ] Headless vs rendered conclusions are truthfully separated.
- [ ] A/B tests are dependency-aware and interaction-aware.
- [ ] Test sandboxes never damage the live instance.
- [ ] Per-mod performance history persists by exact mod SHA-256 + environment/scenario fingerprint.
- [ ] Favorites show current/stale performance status accurately.
- [ ] Selected favorites can be queued for testing.
- [ ] CLI can operate Favorites and Performance/Test workflows using the same domain logic.
- [ ] Results can be bundled safely for AI analysis with explicit user-controlled attachment/upload.
- [ ] Why/tooltips explain recommendations and test verdicts.
- [ ] No hidden watchdog is required for updates/retests.
- [ ] No caps, disabled content, or fake shortcuts are used to manufacture speed.
- [ ] No dead buttons or fake success states remain.

---

# Exact next implementation slice

1. Finalize/polish the persisted **Favorites** model and Favorites tab organization/quick-action surface.
2. Add the shared performance-result hook so favorite cards can show `Untested / Stale / Measured / Suspected / Interaction / No measurable impact` truthfully.
3. Implement Performance foundation: test-session schema -> fingerprinting -> isolated sandbox -> Quick Scan -> JFR Startup Test.
4. Add direct A/B single-mod testing and store results by SHA-256.
5. Wire **Test Selected Favorites** to the same test queue.
6. Then continue Probe/rendered FPS testing, Spark/Observable, adaptive Test All, CLI, and AI handoff.
