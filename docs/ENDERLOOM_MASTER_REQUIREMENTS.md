# Enderloom — Master Product Requirements, Roadmap, and Codex Build Contract

**Status:** Canonical master requirements / implementation checklist  
**Updated:** 2026-09-06  
**Canonical repository:** `Herbertofury/Enderloom`  
**Primary branch:** `main`  
**Product identity:** Enderloom  

This document consolidates the Enderloom product vision, already-accepted launcher/catalog behavior, Premium Performance Lab, full CLI requirement, Minecraft test automation, AI/Codex handoff, safety rules, QOL expectations, and release acceptance into one durable contract.

It is intentionally written so Codex or another implementation agent can continue the project without rediscovering prior decisions.

Detailed child specs remain useful engineering references, but **this file is the master product contract**. When a child spec conflicts with this file, preserve the stricter safety/quality requirement and update the stale child spec rather than silently weakening this contract.

---

# 1. North-star product

Enderloom should be the **one application a serious Minecraft modded player, pack author, tester, server owner, researcher, or mod developer can live in**.

It combines:

- a real Minecraft launcher;
- real mod/content management;
- CurseForge and Modrinth integration;
- a research/catalog browser with real source pages and media;
- real Chromium browser tabs;
- instance, world, server, account, Java, loader, backup, repair, log, and diagnostic tooling;
- Premium automated performance testing;
- a first-class CLI/CI/automation surface;
- AI/Codex-ready diagnostic handoff;
- preservation-first external launcher integration;
- fast, polished, obvious, low-friction QOL.

The user should not have to jump between CurseForge, Modrinth App, Prism, a browser, Spark, Observable, a profiler analyzer, a server manager, a pack exporter, random shell scripts, and ChatGPT just to understand and maintain one modpack.

The experience should feel like:

> **“It just works, but I can drill all the way down when I want to.”**

---

# 2. Product principles — non-negotiable

## 2.1 Real functionality, not theater

- [ ] Every visible control must perform a real operation.
- [ ] No dead buttons.
- [ ] No fake progress.
- [ ] No hard-coded success screens.
- [ ] No “supported” label for an untested or stubbed path.
- [ ] Unsupported proprietary/cloud features must say they are unavailable instead of imitating them.
- [ ] Do not create synthetic launcher/library records merely to make the UI appear integrated.
- [ ] Do not fake mod performance measurements.
- [ ] Do not claim a provider upload/send completed unless the provider actually acknowledged it.

## 2.2 Preserve user data and external launcher ownership

- [ ] Never mutate a live CurseForge or Modrinth profile during automated QA or Performance Lab testing.
- [ ] External profiles are connected **in place** by default.
- [ ] Copy/Clone is explicit.
- [ ] Disconnecting an external profile never deletes the profile files.
- [ ] Treat symlinks/junctions by physical identity.
- [ ] Never recurse-delete through an unresolved symlink/junction.
- [ ] Destructive workflows use staged writes, rollback/quarantine, and pre-change snapshots where appropriate.
- [ ] User-edited configs are preserved.
- [ ] Failed/cancelled work cleans only Enderloom-owned temporary state.

## 2.3 No artificial caps or quality loss

- [ ] Do not cap projects, sources, galleries, mods, benchmark evidence, or provider results just to make the app feel fast.
- [ ] Optimize actual work: batching, caching, concurrency, streaming, incremental rendering, reuse, and smart orchestration.
- [ ] Keep full-resolution media available where source providers expose it.
- [ ] No generated/synthetic replacement images for missing project media.
- [ ] Do not reduce Minecraft content, quality, compatibility, or correctness to manufacture performance gains.

## 2.4 Explainability

Where Enderloom makes a recommendation, warning, score, compatibility decision, performance verdict, config suggestion, or destructive plan:

- [ ] provide a **Why?** action or equivalent explanation;
- [ ] show evidence/source when available;
- [ ] distinguish measured fact from inference;
- [ ] make consequences obvious before applying a change;
- [ ] use helpful hover/tooltips for settings whose effects can be determined accurately.

## 2.5 Fast by architecture, not shortcuts

- [ ] Parallelize independent work.
- [ ] Single-flight duplicate requests.
- [ ] Reuse immutable Minecraft assets/libraries/Java/loader installs where safe.
- [ ] Cache provider metadata and valid benchmark baselines by deterministic fingerprints.
- [ ] Never skip required Minecraft initialization and then call the result equivalent.
- [ ] Do not hide slow work behind fake spinners if a more direct architecture is available.

## 2.6 User-controlled automation

- [ ] Ordinary mod update/patch/test workflows are user-triggered by default.
- [ ] No hidden watchdog repeatedly patching or testing mods.
- [ ] No recurring monitoring/polling unless the user explicitly enables it.
- [ ] Background work must have visible ownership, cancellation, status, and logs.

---

# 3. Top-level Enderloom workspaces

Enderloom is one integrated application, not a bundle of disconnected tools.

Required first-class workspaces/modes:

- [x] **Catalog** — research/library view.
- [x] **Source** — source-focused research.
- [x] **Browser** — real Chromium browser tabs.
- [x] **Full** — focused single-pane work.
- [x] **Split** — resizable side-by-side app/browser or app/app research workflows.
- [x] **Mod Manager / Launcher** — instances, mods, worlds, servers, accounts, Java, etc.
- [ ] **Testing** — Premium Performance Lab.

The shell should make it easy to move between research and action:

- research a mod -> install it;
- inspect installed mod -> reopen its Catalog/provider research;
- view a performance offender -> open its details/config/log evidence;
- open provider page beside the instance/mod list;
- compare versions without leaving Enderloom.

---

# 4. Catalog + research browser

## 4.1 Core research behavior

- [x] Browse large curated catalogs.
- [x] Search and filter.
- [x] Favorites.
- [x] Notes.
- [x] Catalog-scoped state.
- [x] Exact project/source links.
- [x] Live project media.
- [x] Creator/avatar identity.
- [x] Full gallery/lightbox behavior where real media exists.
- [x] Real source/provider browser pages.
- [x] Persistent browser sessions/cookies.
- [x] Source health / refresh behavior.

## 4.2 Provider universe

Enderloom's research/media architecture must remain broad and provider-aware rather than CurseForge-only.

First-class provider families already established include:

- CurseForge
- Modrinth
- GitHub
- GitLab
- Hangar
- SpigotMC
- Bukkit
- BuiltByBit
- Nexus Mods
- ModDB
- Polymart
- Planet Minecraft
- MCPEDL
- ModBay
- AFDIAN
- Patreon
- Minecraft Marketplace
- BOOTH
- Fourthwall
- Ko-fi
- itch.io
- Gumroad
- alltheysm

Requirements:

- [x] Exact-project identity boundaries.
- [x] Separate semantic roles for project icon, creator avatar, gallery media, post media, video/poster media.
- [x] Never substitute a creator avatar for project art or vice versa.
- [x] Quarantine ambiguous media-role collisions.
- [x] Reject global promotions, ads, campaign art, unrelated sibling submissions, commenter avatars, etc.
- [x] Use provider-specific adapters when justified.
- [x] Preserve generic identity-checked fallback for unknown exact project pages.
- [x] Login-sensitive/private providers use the real persistent Chromium session rather than exporting cookies or bypassing access controls.

## 4.3 Browser capability

- [x] Real Chromium tabs, not scraped/static approximations.
- [x] Persistent session.
- [x] Real site login where the user signs in.
- [x] Ad/network filtering with verified rules.
- [x] Integrated web-page translation.
- [x] Original/Translated toggle.
- [x] Selected-text translation.
- [x] Dynamic-page translation.
- [x] Per-site auto-translate.
- [x] Multiple translation provider recipes where implemented safely.
- [x] Upstream translation recipe updates must be allow-listed and must not blindly execute third-party privileged JavaScript.

## 4.4 Catalog-to-manager bridge

- [x] Primary Enderloom Install action on supported projects.
- [x] Compact CurseForge/Modrinth launcher handoffs where appropriate.
- [x] Multi-instance install picker.
- [x] Show game-version and loader compatibility.
- [x] Show already-installed state.
- [x] Multi-select target instances.
- [x] Exact-version planning.
- [x] Dependency/conflict review.
- [x] Installed content can reopen focused research.
- [x] Preserve all distinct source links even when only a few are shown prominently.

## 4.5 Catalog document interchange

- [x] Import/export XLSX.
- [x] Import/export CSV.
- [x] Import/export JSON.
- [x] Import/export HTML.
- [x] Import/export PDF-oriented research layers where supported.
- [x] Preserve research fields.
- [x] Preserve enriched/clickable source/media links.
- [x] Register current signed-in Google Sheets/Docs/Drive PDF sources through the live browser session where supported.
- [x] Private sources surface sign-in-required instead of fabricating data.
- [ ] Direct Google Doc/Sheet mutation only when implemented through a real supported connector/contract; do not fake it.

---

# 5. Launcher / Mod Manager

## 5.1 External launcher discovery and in-place connection

- [x] Discover usable CurseForge profiles.
- [x] Discover usable Modrinth profiles.
- [x] Connect in place with zero mandatory copying.
- [x] Preserve local alias/notes/organization.
- [x] Reconcile moves, version changes, loader changes, and content changes safely.
- [x] Detect junction-backed duplicates by physical path.
- [x] Disconnect without deleting external files.
- [x] Invalid/unavailable external instances remain untouched.
- [x] Explicit clone/copy remains separate from connect.
- [x] Clone/copy verifies bytes and preserves source.

## 5.2 Instance creation/import

- [x] Create vanilla instances.
- [x] Create loader instances.
- [x] Import MRPack.
- [x] Import CurseForge ZIP.
- [x] Import packwiz.
- [x] Cancellation removes incomplete created state.
- [x] Exact instance IDs remain available internally and via automation even when UI uses names.

## 5.3 Organization and library UX

- [x] Groups.
- [x] Reorder groups.
- [x] Drag/drop instances.
- [x] Safe group deletion to Ungrouped.
- [x] Favorites.
- [x] Reusable multi-tag memberships.
- [x] Rename/reorder/delete tags.
- [x] Search.
- [x] Filters/chips.
- [x] Context actions.
- [x] Clone inherits organization where intended.
- [x] Restart persistence.

Views:

- [x] Tiles.
- [x] Table.
- [x] List.
- [x] Groups / Flat organization.
- [x] Persistent tile size.
- [x] Search/sort/filter.
- [x] Bulk selection.
- [x] Drag/drop.
- [ ] Group-wide content operations can be expanded further as a future QOL enhancement.

## 5.4 Accounts / authentication

- [x] Microsoft device login.
- [x] Secure credential storage.
- [x] Active account selection.
- [x] Account removal.
- [x] Entitlement/token handling for launch.
- [x] Never store auth secrets in ordinary settings databases/logs.
- [ ] Full 3D skin/cape preview should reach polished parity without regressing secure auth.

## 5.5 Skins / capes / appearance

- [x] Skin import/library.
- [x] Apply saved skin.
- [x] Delete/rename/reset flows where supported.
- [ ] Improve 3D skin/cape preview and appearance management until it feels native/premium.

## 5.6 Java / game versions / loaders

- [x] Java discovery.
- [x] Java installation.
- [x] Memory/JVM configuration.
- [x] Environment-variable launch tools.
- [x] Fabric.
- [x] Quilt.
- [x] Forge.
- [x] NeoForge.
- [x] Real version discovery.
- [x] Loader-version resolution.
- [x] Preview launch arguments.
- [ ] Continue optimizing Java/loader pre-resolution for Fast Launch Engine reuse.

## 5.7 Real launch/process supervision

- [x] Real Minecraft process launch.
- [x] Supervised processes.
- [x] Running-process list.
- [x] Live logs.
- [x] Identity-checked kill.
- [x] Restart recovery/adoption where possible.
- [x] Launch command generation.
- [ ] Full CLI parity for all process operations.

---

# 6. Content management

“Content” covers at minimum:

- mods;
- resource packs;
- shaders;
- data packs;
- modpack-managed auxiliary content.

## 6.1 Provider-backed discovery/install

- [x] Modrinth search/details/versions.
- [x] CurseForge search/details/versions.
- [x] Provider identity/provenance.
- [x] Dependency resolution.
- [x] Download planning.
- [x] Install planning.
- [x] Conflict/dependency review.
- [x] Managed and manual content coexist.
- [x] Browser handoff for CurseForge files whose authors disable third-party downloads.
- [x] Verify handed-off downloads by name/hash/size before adopting.

## 6.2 Content lifecycle

- [x] Add/install.
- [x] Enable/disable.
- [x] Delete/remove.
- [x] Reconcile filesystem state.
- [x] Check updates.
- [x] Plan updates.
- [x] Apply updates.
- [x] Dependency-aware removal planning.
- [x] Show dependents.
- [x] Rollback/pre-change snapshot where appropriate.
- [x] Persistent provenance.

## 6.3 Exact version control

- [x] Searchable compatible version picker.
- [x] Show incompatible versions clearly rather than hiding reality.
- [x] Changelog inspection.
- [x] Exact-version replacement.
- [x] Freeze/unfreeze project version.
- [x] Frozen projects excluded from automatic resolver updates until explicitly unfrozen.
- [x] Retain old version history where useful.

## 6.4 Change-impact intelligence

Every add/remove/update/enable/disable/config-change path should increasingly answer:

- What dependencies change?
- What configs are affected?
- What saves/worlds may be affected?
- What other mods depend on this?
- What benchmark/performance evidence becomes stale?
- What snapshots should be taken first?
- What could be safely reclaimed from disk?
- Why is Enderloom recommending the action?

This intelligence should power both ordinary management and Premium Testing.

---

# 7. Modpacks / pack interchange

- [x] Install MRPack.
- [x] Import/export MRPack where supported.
- [x] Import CurseForge ZIP.
- [x] Import packwiz.
- [x] Export pack formats supported by Enderloom.
- [x] Provider link/unlink.
- [x] Check for modpack upgrade.
- [x] Plan upgrade.
- [x] Apply upgrade.
- [x] Cancellation rollback.
- [x] Preserve source/provenance.
- [ ] Do not clone/fake CurseForge proprietary share-code service.
- [ ] Keep formats source-control/CLI friendly.

---

# 8. Worlds + data packs

- [x] List/inspect worlds.
- [x] Import worlds.
- [x] Delete worlds safely.
- [x] World snapshots/backups.
- [x] Data-pack add/install/update/enable/disable/remove.
- [x] World-related destructive workflows use snapshots/transactional safety.
- [ ] Rich world rename/icon presentation can continue toward full Modrinth-level polish.
- [ ] Performance Lab benchmark worlds use immutable/versioned snapshots and never the user's live save by default.

---

# 9. Servers

Enderloom should be a complete local/external Minecraft server manager, not merely a launcher button.

- [x] Managed servers.
- [x] External/imported servers.
- [x] Install server software.
- [x] EULA handling.
- [x] Server properties.
- [x] Players.
- [x] Whitelist.
- [x] Safe server filesystem browser/editor.
- [x] Server content management.
- [x] Console.
- [x] Start/stop/restart/force-stop.
- [x] Process supervision.
- [x] Server import.
- [x] Transactional deletion.
- [x] Server disk usage.
- [x] Server pack install/update.
- [x] Server content dependency plans.
- [ ] Do not impersonate proprietary hosted/cloud/sync services.
- [ ] Expose the full server surface through CLI.
- [ ] Performance Lab dedicated-server scenarios use the existing managed server/process architecture where possible.

---

# 10. Snapshots, backups, repair, recovery

- [x] Create snapshot.
- [x] Rename snapshot.
- [x] Restore snapshot.
- [x] Delete snapshot.
- [x] Automatic pre-restore snapshot.
- [x] Transactional quarantine.
- [x] Cancellable repair.
- [x] Recover interrupted destructive operations.
- [x] Recoverable launcher reset.
- [x] Preserve external launcher roots.
- [ ] Test sandboxes use the same preservation mindset but remain isolated from normal backup history.

---

# 11. Logs, diagnostics, storage, system visibility

## Logs

- [x] Plain logs.
- [x] Gzip logs.
- [x] Search.
- [x] Severity filtering.
- [x] OOM diagnosis.
- [x] Redaction.
- [x] Path traversal guards.
- [x] Runtime log levels.
- [x] Controlled deletion.
- [x] External log upload never happens silently.

## Diagnostics

- [x] Instance diagnostics.
- [x] Network test.
- [x] App/system information.
- [x] System resource stats.
- [x] Data-location inspection.
- [ ] Performance Lab should normalize JFR/Spark/Observable/native telemetry into the same evidence model.

## Storage

- [x] Storage scan.
- [x] Reclaim workflow.
- [x] Multiple data roots/locations.
- [x] Missing external data root produces a clear error instead of destructive fallback.
- [ ] Removal/update impact UI should show storage that will become reclaimable without automatically deleting it.

---

# 12. Split research + browser integration

- [x] Resizable split.
- [x] Swap/reset split.
- [x] Catalog + Browser pairing.
- [x] Mod Manager + Browser pairing.
- [x] Full-height WebContentsView panes.
- [x] Shell/status labels reflect active workspace.
- [ ] Testing + Browser pairing for profiler docs, mod source, issue trackers, AI/provider pages.
- [ ] Testing + Mod Manager pairing for live culprit drill-down.

---

# 13. Premium Testing workspace — Performance Lab

Top-level nav label: **Testing**  
Primary workspace name: **Performance Lab**

Primary question:

> **What is slowing my pack down, and how do we prove it?**

Premium value is automated orchestration, safe sandboxes, dependency-aware A/B proof, repeatability, history, confidence/noise analysis, fast relaunch, interaction testing, polished evidence, and AI handoff — not merely exposing raw profiler buttons.

## 13.1 Core flows

- [ ] **Quick Scan** — static/out-of-game analysis, no Minecraft launch required.
- [ ] **Test One Mod** — direct paired A/B impact test.
- [ ] **Test All Mods** — adaptive whole-pack isolation then direct confirmation.
- [ ] **Startup Test**.
- [ ] **Client FPS Test**.
- [ ] **Server TPS Test**.
- [ ] **Lag Spike Hunt**.
- [ ] **Memory Test**.
- [ ] **Compare Runs**.
- [ ] **Regression Test**.

## 13.2 Verdict language

Allowed verdict classes:

- **Measured**
- **Interaction**
- **Suspected**
- **No measurable impact**
- **Not testable in isolation**
- **Untested**

Rules:

- [ ] “Measured” requires direct traceable paired evidence.
- [ ] Static analysis alone can only produce risk/suspicion findings.
- [ ] If dependency closure prevents isolated removal, say so.
- [ ] If the effect appears only in combinations, label it Interaction.
- [ ] Never convert noise into a culprit label.

## 13.3 Per-mod metrics

### Startup

- launch delta
- loader-stage delta
- title-ready delta
- world-ready delta
- class-load delta

### Client/render

- average FPS
- median frame time
- 1% low FPS
- 0.1% low FPS
- p95/p99/worst frame time
- stutter counts
- render-thread CPU
- process GPU utilization where supported
- GPU frame time where a valid rendered probe/platform supports it

### Server

- TPS
- median/p95/p99/max MSPT
- slow-tick count
- server-thread CPU attribution
- entity/block-entity/scheduled-tick hotspots
- chunk/worldgen contribution

### Memory

- heap after warmup
- retained trend
- allocation rate
- GC count
- GC pause
- top allocation/class families

### System

- process CPU
- disk I/O
- network I/O
- thread/lock contention
- JVM/JIT state

Every mod result is keyed primarily by **SHA-256**, not filename.

## 13.4 Whole-pack dashboard

- [ ] top startup offenders
- [ ] top server-thread offenders
- [ ] top frame/render offenders
- [ ] highest allocation/GC contributors
- [ ] highest static-risk untested mods
- [ ] interaction/conflict graph
- [ ] recently regressed mods
- [ ] untested changed mods
- [ ] test queue/history
- [ ] Before vs After scorecard

Filters:

- loader
- client/server/both
- measured/suspected
- startup/render/tick/memory/worldgen/network/disk
- severity
- version changed
- confidence

---

# 14. Out-of-game Quick Scan / static analysis

Quick Scan inspects one mod or a whole instance **without launching Minecraft**.

Inspect:

- [ ] `mods.toml`, `fabric.mod.json`, Quilt/NeoForge metadata.
- [ ] loader side/environment.
- [ ] required/optional dependencies.
- [ ] embedded libraries / Jar-in-Jar.
- [ ] JAR size.
- [ ] class count.
- [ ] resource/texture/model/audio footprint.
- [ ] Mixin configs.
- [ ] injection targets.
- [ ] access transformers/wideners.
- [ ] coremods/plugins/transformers.
- [ ] event subscriber density.
- [ ] tick references.
- [ ] render references.
- [ ] networking references.
- [ ] worldgen references.
- [ ] level/world/entity scans.
- [ ] broad collection iteration.
- [ ] synchronous file/network I/O in likely tick/render paths.
- [ ] reflection/classpath scans.
- [ ] timers/scheduled tasks.
- [ ] resource reload listeners.
- [ ] chunk/worldgen hooks.
- [ ] entity/block-entity ticking registration.
- [ ] post-processing/shader hooks.
- [ ] registry/datapack/resource footprint.

Output **Static Risk Report**, for example:

- high tick risk;
- startup risk;
- render risk;
- allocation concern;
- low static concern;
- dependency/side incompatibility;
- needs runtime confirmation.

Never manufacture FPS/TPS numbers from static analysis.

---

# 15. Dependency-aware A/B testing

## 15.1 Single-mod impact

For a selected mod:

1. establish compatible baseline;
2. build isolated sandbox;
3. run scenario with mod/dependency closure;
4. build safe comparison variant;
5. run paired comparison;
6. repeat if noisy;
7. normalize metrics;
8. determine verdict/confidence;
9. retain raw evidence;
10. attach result to the mod's Performance page.

## 15.2 Test All Mods

Do **not** naively run one full launch per mod by default.

Default adaptive strategy:

1. static risk scan;
2. build dependency graph/clusters;
3. current-pack baseline;
4. hierarchical/binary cohort tests to locate expensive regions;
5. direct A/B confirmation of candidates;
6. pair/interaction tests where evidence demands it;
7. optional exhaustive per-mod confirmation when explicitly requested.

`--exhaustive` means exhaustive; never silently downgrade it to sampling.

---

# 16. Test sandbox + deterministic fingerprinting

Automated tests never run against the user's mutable live profile directly.

Fingerprint at minimum:

- Minecraft version
- loader + loader version
- Java runtime
- JVM arguments
- enabled mod SHA-256 set
- config hashes
- shader state
- resource-pack state
- render/simulation distances
- benchmark-world hash
- scenario version
- CPU
- GPU
- OS
- relevant power mode
- cache policy

Rules:

- [ ] Baseline reuse only when fingerprint/scenario compatibility is proven.
- [ ] Reuse immutable Java/game assets/libraries/loader installs.
- [ ] Hard-link/equivalent immutable mod JARs when safe/supported.
- [ ] Writable configs/worlds/logs/profiler outputs are isolated.
- [ ] Cancellation/failed runs clean owned temporary state.
- [ ] Preserve completed evidence during recovery.
- [ ] Never blame a library merely because dependents fail when the library is removed.

---

# 17. Deterministic benchmark scenarios

Minimum built-in scenario families:

- [ ] Startup
- [ ] Client idle
- [ ] Client traversal
- [ ] Separate worldgen traversal
- [ ] Server idle
- [ ] Server stress
- [ ] Soak

Determinism controls:

- fixed benchmark world/snapshot;
- fixed player/camera start;
- versioned scripted route;
- fixed settings;
- fixed warm-up;
- controlled measurement window;
- explicit termination condition.

---

# 18. Profiler/instrumentation stack

## 18.1 Enderloom native telemetry

- [ ] process start
- [ ] JVM output
- [ ] loader milestones
- [ ] title ready
- [ ] world ready
- [ ] CPU/threads
- [ ] memory
- [ ] disk/network
- [ ] supported GPU process metrics
- [ ] process exit/crash/hang

## 18.2 Java Flight Recorder

JFR is a first-party Java profiling lane.

- [ ] start at JVM launch for startup profiling;
- [ ] CPU samples;
- [ ] locks/park/sleep;
- [ ] GC;
- [ ] allocation;
- [ ] class loading;
- [ ] I/O;
- [ ] exceptions;
- [ ] JIT;
- [ ] retain raw `.jfr`;
- [ ] generate normalized Enderloom summary.

## 18.3 Spark adapter

- [ ] detect already-installed compatible Spark;
- [ ] temporarily inject compatible Spark only into test sandbox when needed;
- [ ] client/server profiling where supported;
- [ ] tick monitor/health/allocation/slow-tick data where supported;
- [ ] prefer local artifacts;
- [ ] public Spark upload is never mandatory;
- [ ] normalize into Enderloom result model.

## 18.4 Observable adapter

- [ ] optional;
- [ ] version/loader compatibility checked;
- [ ] spatial entity/block-entity/scheduled-tick hotspot evidence;
- [ ] never required for ordinary Testing success.

## 18.5 Profiler-overhead challenge

- [ ] Validate that profiler overhead itself is not being blamed on the target mod.
- [ ] Re-run representative comparisons with a lower-overhead lane when necessary.

---

# 19. Fast Launch Engine

Goal: make repeated valid Minecraft testing as fast as realistically possible **without pretending hot-unload works where it does not**.

- [ ] Pre-resolve Java.
- [ ] Pre-resolve loader/version.
- [ ] Pre-resolve classpath/assets/natives/auth/launch args.
- [ ] Keep reusable immutable libraries/assets warm.
- [ ] Keep a prepared benchmark sandbox.
- [ ] Materialize only changed enabled-mod state where possible.
- [ ] Avoid irrelevant launcher UI work during CLI/automated runs.
- [ ] Launch directly into benchmark flow via Enderloom Probe where possible.
- [ ] Auto-exit after capture.
- [ ] Reuse compatible baselines.
- [ ] Use dedicated-server `nogui` when the test is genuinely server-only.
- [ ] Support explicit cold-cache vs warm-cache modes and record which was used.
- [ ] Never claim a speedup by skipping required initialization that changes the meaning of the test.

---

# 20. Enderloom Probe — Minecraft test control plane

Build small loader-specific **test-only** Probe mods for supported loaders/versions.

Purpose:

- deterministic lifecycle markers;
- controlled benchmark world entry;
- warm-up;
- route playback;
- frame/integrated-server telemetry;
- profiler boundaries;
- in-game commands;
- GameTest support;
- clean auto-exit;
- test automation without GUI clicking.

Required capabilities as technically valid:

- [ ] title-ready marker
- [ ] world-open marker
- [ ] player-ready marker
- [ ] chunk/benchmark-region-ready marker
- [ ] command/chat injection
- [ ] GUI state dump
- [ ] GUI click/assert
- [ ] key/mouse/input control
- [ ] look/camera control
- [ ] scripted movement/route
- [ ] interaction steps
- [ ] screenshot of actual runtime
- [ ] telemetry stream
- [ ] profiler start/stop markers
- [ ] scenario-complete marker
- [ ] clean exit

Security:

- [ ] scoped to Enderloom-owned test runs;
- [ ] local control channel protected from unrelated processes as practical;
- [ ] never silently installed permanently into live profile.

---

# 21. Truthful runtime modes

Every test records its runtime mode because conclusions differ.

## `rendered`

Real rendered client. Required for trustworthy:

- FPS;
- frame-time;
- stutter;
- render-thread impact;
- GPU-related conclusions.

## `virtual-display`

Real client under Xvfb/hidden/virtual display.

Useful for:

- CI client boot;
- UI/game logic;
- world joining;
- GameTest;
- deterministic client workflows.

Do not claim physical GPU/FPS equivalence.

## `headless`

Rendering stubbed/skipped.

Useful for:

- bootstrap compatibility;
- client logic;
- runtime error detection;
- GameTest-like flows.

Never use it to claim real render performance.

## `server`

Dedicated `nogui` server.

## `protocol-bot`

Synthetic lightweight protocol client.

Useful for:

- connection/load testing;
- networking;
- server player-count behavior;
- scripted protocol actions.

Never substitute it for the user's actual modded rendered client.

---

# 22. Scenario DSL — one engine for GUI, CLI, CI, Codex

Create versioned YAML/JSON scenario files.

Canonical shape should support:

- runtime mode;
- target instance/server;
- world snapshot;
- settings;
- warm-up;
- waits;
- lifecycle assertions;
- profiler start/stop;
- route playback;
- input/action steps;
- measurement windows;
- metric assertions;
- exit/cleanup.

Requirements:

- [ ] versioned schema;
- [ ] schema migration rules;
- [ ] strict validation mode;
- [ ] explicit timeout per step;
- [ ] explicit cancellation behavior;
- [ ] deterministic skip reason when preconditions are not met;
- [ ] no arbitrary shell execution by default;
- [ ] external-command hooks require explicit user opt-in and appear in plan/review.

---

# 23. Full CLI everywhere

**Everything meaningful Enderloom can do through the GUI must also be scriptable through a real CLI unless it is purely presentational.**

The CLI is not a UI macro layer and not a second implementation.

Shared architecture:

- GUI -> typed API -> shared Rust/domain operation
- CLI -> Clap -> same shared Rust/domain operation
- service JSON protocol -> same shared Rust/domain operation

Existing compatibility to preserve:

- [x] `-l/--launch <INSTANCE>`
- [x] `-L/--list`

Preferred user experience:

```text
enderloom                     # normal GUI
enderloom gui                 # explicit GUI
enderloom <subcommand> ...    # no-visible-GUI CLI mode
```

## 23.1 Global automation contract

- [ ] `--json`
- [ ] `--jsonl`
- [ ] `--quiet`
- [ ] `--verbose`
- [ ] `--no-color`
- [ ] `--non-interactive`
- [ ] `--yes`
- [ ] `--timeout`
- [ ] `--trace-id`
- [ ] `--output`
- [ ] `--dry-run/--plan` where meaningful
- [ ] stable exit-code families
- [ ] stdout/stderr discipline
- [ ] no secrets in machine output/process args
- [ ] PowerShell completion
- [ ] Bash completion
- [ ] Zsh completion
- [ ] Fish completion
- [ ] `enderloom capabilities --json`
- [ ] machine-readable schema/version discovery

## 23.2 CLI parity domains

CLI must cover meaningful operations for:

- [ ] app/info/doctor/paths/network
- [ ] settings
- [ ] Java
- [ ] auth/accounts
- [ ] skins/capes
- [ ] instances
- [ ] groups/tags/favorites/organization
- [ ] versions/loaders
- [ ] content/mods/resource packs/shaders/data packs
- [ ] modpacks/pack interchange
- [ ] worlds
- [ ] snapshots/backups/repair
- [ ] migration/external-instance reconciliation
- [ ] launch/processes/logs/captures
- [ ] servers
- [ ] tasks/cancellation
- [ ] storage/diagnostics
- [ ] catalog data/search/import/export/install bridge
- [ ] Testing/Performance Lab
- [ ] profiler adapters
- [ ] diagnostic/AI bundles

Purely visual shell state may be an explicit reviewed UI-only exception.

## 23.3 CLI parity CI gate

- [ ] Maintain one capability/command registry or equivalent source of truth.
- [ ] Record canonical operation ID.
- [ ] GUI/API route.
- [ ] service route.
- [ ] CLI route.
- [ ] read/write/destructive classification.
- [ ] cancellation/progress support.
- [ ] output schema version.
- [ ] plan/dry-run support.
- [ ] explicit visual-only exception reason if applicable.
- [ ] CI fails if a meaningful new GUI/service operation has no CLI mapping or approved exception.

---

# 24. Minecraft CLI (`enderloom mc`) + testing CLI

Minimum command families:

## Runtime

- `enderloom mc install`
- `enderloom mc launch`
- `enderloom mc attach`
- `enderloom mc wait`
- `enderloom mc status`
- `enderloom mc command`
- `enderloom mc chat`
- `enderloom mc gui dump`
- `enderloom mc gui click`
- `enderloom mc gui assert`
- `enderloom mc input ...`
- `enderloom mc look ...`
- `enderloom mc move ...`
- `enderloom mc interact ...`
- `enderloom mc screenshot ...`
- `enderloom mc telemetry ...`
- `enderloom mc exit`
- `enderloom mc kill`

## GameTest

- `enderloom mc gametest list`
- `enderloom mc gametest run --all`
- namespace/filter support
- structured pass/fail/duration/error output

## Performance Lab

- `enderloom test quick-scan`
- `enderloom test prepare`
- `enderloom test sandbox ...`
- `enderloom test baseline ...`
- `enderloom test startup`
- `enderloom test client-fps`
- `enderloom test server-tps`
- `enderloom test memory`
- `enderloom test lag-spikes`
- `enderloom test mod-impact`
- `enderloom test interactions`
- `enderloom test all`
- `enderloom test result ...`
- `enderloom test history ...`
- `enderloom test compare`
- `enderloom test regression`
- `enderloom test artifacts`
- `enderloom test export`
- `enderloom test cancel`
- `enderloom test resume`
- `enderloom test scenario ...`

## Profilers

- `enderloom profile jfr ...`
- `enderloom profile spark ...`
- `enderloom profile observable ...`
- native process telemetry commands

---

# 25. Synthetic player / protocol-bot lane

Optional server/load testing lane.

Potential implementations/adapters to evaluate:

- Enderloom-native protocol client;
- Mineflayer adapter;
- Minecraft Console Client adapter.

Required truth boundary:

- [ ] clearly label protocol-bot results;
- [ ] do not use bots to claim real modded-client FPS/render/mixin/classloading impact;
- [ ] deterministic connection ramp;
- [ ] scripted movement/chat/inventory where adapter supports it;
- [ ] record connection failures/latency/server tick impact.

---

# 26. Noise/confidence engine

Performance testing must handle real-world noise.

- [ ] warm-up runs;
- [ ] paired scenario fingerprints;
- [ ] alternate A/B order when useful;
- [ ] automatically repeat noisy tests;
- [ ] median + spread;
- [ ] confidence/noise classification;
- [ ] detect/flag thermal throttling;
- [ ] detect/flag background load;
- [ ] power-mode changes;
- [ ] shader compilation;
- [ ] worldgen drift;
- [ ] antivirus/indexer disturbance where inferable;
- [ ] JIT/GC phase effects;
- [ ] entity-count drift;
- [ ] cache invalidation differences;
- [ ] “Low confidence” instead of overclaiming;
- [ ] no regression verdict when difference is inside measured noise floor.

---

# 27. Per-mod Performance page

Every installed mod should eventually have a persistent performance/data view.

Header:

- status badge;
- latest tested version/hash;
- latest summary;
- confidence;
- last test date/environment.

A/B cards:

- absolute values;
- delta;
- run count;
- scenario;
- confidence.

Drill-down:

- [ ] timeline overlay
- [ ] flame/call tree
- [ ] JFR summary
- [ ] Spark attribution
- [ ] Observable hotspots
- [ ] native telemetry
- [ ] logs tied to run
- [ ] config diff
- [ ] dependency/interaction graph
- [ ] historical trend
- [ ] raw evidence links

Actions:

- Test Again
- Test Without
- Test With Current Config
- Test With Fresh Config
- Compare Version…
- Compare Config…
- Run Deep Profile
- Open Raw Evidence
- Why?
- Analyze with AI

No action should be visible unless it is real or explicitly shown as unavailable with a truthful reason.

---

# 28. Performance staleness / regression tracking

When modpack state changes, Enderloom should invalidate only evidence that is actually stale.

Examples:

- mod version changed -> old result retained for history, current version becomes untested;
- config changed -> runtime result marked potentially stale;
- shader changed -> old FPS comparison no longer directly comparable;
- scenario definition changed -> old evidence retained but not mixed into current baseline;
- Java/JVM changed -> fingerprint incompatibility;
- dependency graph changed -> affected A/B baselines invalidated.

- [ ] `Re-test changed mods` user-triggered queue.
- [ ] No mandatory background watchdog.

---

# 29. AI diagnostic handoff

The goal is one-click preparation of a high-quality debugging/performance package for ChatGPT, Claude, Gemini, Copilot, or another user-selected AI/tool.

Create `.enderloom-diagnostic.zip` plus readable Markdown summary.

Bundle may include, with user review:

- target mod JAR if the user chooses to include it;
- exact mod SHA-256/provider/version;
- complete enabled mod manifest + hashes;
- dependencies;
- latest/debug/crash logs;
- benchmark JSON;
- paired A/B summary;
- Spark local profile(s);
- JFR recording + normalized summary;
- Observable artifacts;
- relevant configs/config diff;
- Java/Minecraft/loader/JVM settings;
- hardware/OS summary;
- scenario/reproduction steps;
- Static Risk Report;
- artifact manifest.

Privacy/security:

- [ ] redact auth tokens;
- [ ] redact cookies;
- [ ] redact API keys;
- [ ] redact session IDs;
- [ ] redact known credential patterns;
- [ ] offer username/path/IP/server-address redaction;
- [ ] list every included file before external handoff;
- [ ] never upload without explicit user action;
- [ ] keep original local evidence separate from redacted share copy.

Provider flow minimum:

1. build bundle;
2. generate/copy diagnostic prompt;
3. open selected provider;
4. reveal/select bundle for attachment;
5. never claim attachment/upload succeeded unless it really did.

Direct provider APIs are optional and only used when the user explicitly configures them.

---

# 30. Premium boundary

Do not cripple the ordinary launcher/mod manager to manufacture Premium value.

## Recommended free/base capabilities

- launcher/mod manager fundamentals;
- logs/diagnostics;
- basic static metadata inspection;
- detect/import profiler artifacts;
- manual profiler evidence viewing;
- ordinary dependency planning;
- ordinary update/remove safety;
- raw diagnostic export.

## Premium Performance Lab capabilities

- automated Testing workspace;
- single-mod paired A/B;
- adaptive whole-pack sweep;
- deterministic Probe scenarios;
- Fast Launch Engine benchmark sandbox;
- automatic JFR/Spark capture/import;
- rich per-mod performance history;
- regression tracking;
- interaction testing;
- advanced confidence/noise engine;
- AI-ready diagnostic bundles/provider handoff;
- saved benchmark comparisons;
- deep testing orchestration.

Premium sells **time saved, automation, reproducibility, confidence, history, and evidence**.

---

# 31. Current external research references

Use these as capability inspiration and interoperability references, not as permission to copy incompatible code.

## Performance/profiling

- `lucko/spark` — Minecraft CPU/memory/health profiling.
- `tasgon/observable` — deep world/entity/block-entity/scheduled-tick diagnostics.
- `Wueffi/TaskManager` — per-mod CPU, estimated GPU, memory, startup, frame/network/disk timeline ideas.
- `WendellCraft/ModpackDebuggerKit` — dependency-aware binary search/debugging ideas.
- `Krutoy242/mc-benchmark` — startup-log benchmarking precedent.
- `SettingDust/MoreProfiling` — JFR-oriented Minecraft profiling precedent.
- `imSirr/spark-analyzer` — profile-quality, comparison, culprit-analysis, Copy-for-AI UX precedent. **Do not copy noncommercial logic into Premium.**

## CLI / Minecraft automation

- `headlesshq/headlessmc` — CLI launcher, headless client/server/mod control, companion-mod GUI/chat/command control, JSON tests.
- `headlesshq/mc-runtime-test` — Minecraft client CI, Xvfb, helper mod world entry/chunk wait/exit, GameTest, caching.
- `theorzr/portablemc` — Rust CLI/library, install+launch, loaders, auth, machine-readable output, Java discovery.
- `PrismLauncher/PrismLauncher` — direct CLI launch/server/world/profile selectors.
- `MCCTeam/Minecraft-Console-Client` — lightweight protocol/console client.
- `PrismarineJS/mineflayer` — rich programmable bot ecosystem.
- `gorilla-devs/ferium` — automation-friendly CLI mod management.
- `packwiz/packwiz` — Git-friendly CLI pack metadata/import/export.
- `deniz-blue/mcman` — server management and CI test workflows.

License review is mandatory before integrating code. Reimplement concepts independently when licenses/commercial terms require it.

---

# 32. Update/distribution safety

- [x] Enderloom can check its own repository for updates.
- [ ] Do not present an incompatible inherited updater as working.
- [ ] Signed/verified update path is required before one-click install is claimed.
- [ ] Manual install is acceptable until a safe verified updater exists.
- [ ] Update must not corrupt existing user data/connected launcher libraries.

---

# 33. Performance requirements for Enderloom itself

Enderloom is performance-sensitive software and should not become another bottleneck.

- [ ] Fast startup.
- [ ] Progressive/instant UI paint where possible.
- [ ] Parallel provider work.
- [ ] Streaming parsing for large provider pages.
- [ ] Persistent HTTP/browser cache reuse.
- [ ] Single-flight duplicate provider/project requests.
- [ ] Worker pool for expensive parsing where beneficial.
- [ ] Avoid renderer-blocking synchronous filesystem/network work.
- [ ] Avoid unbounded synthetic model copies/duplicate library records.
- [ ] Large modpacks/catalogs remain usable.
- [ ] No hidden repeated rescans when a delta/fingerprint can answer the question.
- [ ] Performance Lab itself must measure profiler overhead and avoid causing meaningful persistent lag outside test sessions.

---

# 34. UI/UX / “it just works” QOL bar

Enderloom should feel premium even before Premium features.

- [ ] Beautiful, consistent layouts.
- [ ] Clear hierarchy.
- [ ] Dense expert information without looking like a debug dump.
- [ ] Search everywhere it materially helps.
- [ ] Sort/filter everywhere data sets get large.
- [ ] Multi-select/bulk actions where useful.
- [ ] Context menus for obvious power actions.
- [ ] Drag/drop where it is genuinely faster.
- [ ] Keyboard-friendly flows.
- [ ] Remember layout/filter/sort preferences appropriately.
- [ ] One-click path for common operations; advanced controls remain discoverable.
- [ ] Every expensive/destructive action previews what will happen.
- [ ] “Why?” explanations for automated decisions.
- [ ] Tooltips explain config/test options accurately.
- [ ] Errors state what failed, why, what was preserved, and the next useful action.
- [ ] Cancellable long work.
- [ ] Resume recoverable long testing operations.
- [ ] No modal spam.
- [ ] No mystery background state.

---

# 35. Release/QA contract

Passing compilation is not enough.

## Existing release gates to preserve

- [x] launcher/API command coverage QA;
- [x] native integration acceptance;
- [x] Electron self-test;
- [x] Catalog release suite;
- [x] external launcher libraries fingerprinted/preserved during QA.

## Add for CLI/Testing

- [ ] CLI parser tests.
- [ ] JSON/JSONL schema tests.
- [ ] CLI parity QA.
- [ ] actual built CLI fresh-code proof.
- [ ] instance list/show through CLI.
- [ ] real launch/wait/log/exit path.
- [ ] managed server CLI smoke.
- [ ] Probe handshake.
- [ ] lifecycle marker tests.
- [ ] deterministic scenario run.
- [ ] deliberate startup regression detected.
- [ ] deliberate server tick regression detected.
- [ ] deliberate rendered-client frame regression detected in rendered mode.
- [ ] deliberate allocation/GC regression detected.
- [ ] same frame regression is **not** falsely claimed in headless mode.
- [ ] profiler-overhead challenge pass.
- [ ] cancellation cleans only owned test processes/state.
- [ ] crash recovery preserves completed evidence.
- [ ] live external instance unchanged before/after Performance Lab test.
- [ ] restart/persistence verification for test history.
- [ ] AI bundle redaction/manifests verified before external handoff.

---

# 36. Codex / implementation workflow

Codex must treat this as an implementation project, not a planning exercise.

Rules:

- preserve current canonical repository state;
- do not restart solved research;
- do not discard existing accepted launcher/catalog behavior;
- implement in coherent slices;
- run targeted checks while iterating;
- run broad release checks at convergence;
- create a fresh usable build when implementation changes;
- verify the actual runtime uses the new build;
- checkpoint meaningful progress to GitHub and the Enderloom Drive folder;
- update this master checklist when acceptance state changes materially.

---

# 37. Implementation roadmap

## Phase CLI-0 — shared CLI foundation

- [ ] Preserve existing `--launch/-l` and `--list/-L` behavior.
- [ ] Inventory existing API/service commands using current coverage tooling.
- [ ] Introduce shared capability/command registry or equivalent.
- [ ] Add no-visible-GUI CLI bootstrap.
- [ ] Add versioned JSON/JSONL envelopes.
- [ ] Add capabilities/schema discovery.
- [ ] Implement first real subcommands:
  - instance list/show;
  - launch wait/detach;
  - process list;
  - coherent log commands.
- [ ] Add `cli-parity-qa`.
- [ ] Wire CLI parity into release QA.
- [ ] Fresh build + real CLI proof.

## Phase CLI-1 — existing Enderloom domain parity

- [ ] app/settings/java/accounts
- [ ] instances/organization
- [ ] content/mods
- [ ] packs
- [ ] worlds/data packs
- [ ] snapshots/repair
- [ ] launch/process/logs
- [ ] migration
- [ ] servers
- [ ] tasks
- [ ] storage/diagnostics
- [ ] skins
- [ ] catalog data operations
- [ ] zero unexplained domain gaps

## Phase Testing-1 — foundation

- [ ] normalized test-session schema
- [ ] persistent history
- [ ] fingerprints
- [ ] safe test sandbox
- [ ] Quick Scan static analyzer
- [ ] JFR startup capture/parser

## Phase Testing-2 — direct A/B

- [ ] dependency graph/closure
- [ ] baseline reuse
- [ ] with/without variant runner
- [ ] startup scenario
- [ ] dedicated-server scenario
- [ ] per-mod Performance page

## Phase Testing-3 — Enderloom Probe

- [ ] loader-specific Probe
- [ ] lifecycle markers
- [ ] deterministic benchmark world/route
- [ ] FPS/frame-time telemetry
- [ ] integrated-server timing
- [ ] command/input/GUI control
- [ ] GameTest adapter
- [ ] automatic warmup/capture/exit

## Phase Testing-4 — profiler adapters

- [ ] Spark
- [ ] Observable optional lane
- [ ] richer native telemetry normalization

## Phase Testing-5 — whole-pack intelligence

- [ ] adaptive cohort/binary isolation
- [ ] direct culprit confirmation
- [ ] interaction tests
- [ ] regression dashboard
- [ ] confidence/noise engine
- [ ] optional protocol-bot load lane

## Phase Testing-6 — AI handoff + polish

- [ ] redacted diagnostic bundle
- [ ] provider-neutral prompt/open workflow
- [ ] saved comparisons
- [ ] CLI completions/examples
- [ ] CI examples
- [ ] complete release challenge pass

---

# 38. Exact next implementation action

Do **not** begin by making Testing UI mockups.

Start from the existing Enderloom Rust/service architecture:

1. read this master file;
2. read `docs/PREMIUM_TESTING_LAB_SPEC.md`;
3. read `docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md`;
4. inspect `native/src/cli.rs`;
5. inspect `native/src/service.rs`;
6. inspect `native/src/bin/enderloom-service.rs`;
7. inspect `native/src/lib.rs`;
8. inspect `native/Cargo.toml`;
9. inspect `launcher/src/lib/api.ts`;
10. inspect `scripts/launcher-command-coverage-qa.js`;
11. preserve existing command protocol and launch/list behavior;
12. implement CLI-0 shared command/capability registry + no-visible-GUI bootstrap + JSON/JSONL;
13. implement first instance/launch/process/log CLI commands;
14. add and run CLI parity QA;
15. prove the actual built CLI path is fresh;
16. checkpoint source/build before broad CLI-1 expansion.

---

# 39. Definition of done — whole Enderloom vision

Enderloom reaches the intended product state only when all applicable statements are true:

- [ ] Catalog, Mod Manager, Browser, Split, and Testing are one coherent app.
- [ ] External CurseForge/Modrinth profiles can be used in place without forced copying.
- [ ] Ordinary mod/content lifecycle is safe, dependency-aware, version-aware, and reversible.
- [ ] Worlds, servers, snapshots, repair, logs, diagnostics, storage, accounts, Java, loaders, and process supervision are fully real.
- [ ] Research/provider pages retain real source identity/media and persistent browsing.
- [ ] Every meaningful domain operation is CLI-addressable or has a reviewed purely visual exception.
- [ ] GUI and CLI share domain logic.
- [ ] CLI/CI can run Performance Lab end-to-end.
- [ ] Minecraft client/server test runtimes can be deterministically controlled for supported scenarios.
- [ ] Rendered/headless/virtual-display/server/protocol-bot evidence is truthfully separated.
- [ ] Static scans never invent runtime metrics.
- [ ] Measured mod verdicts are traceable to exact paired evidence.
- [ ] Whole-pack analysis is dependency-aware and interaction-aware.
- [ ] Performance evidence persists by mod SHA-256 and environment/scenario fingerprint.
- [ ] Fast Launch Engine reuses safe immutable work without invalidating tests.
- [ ] AI bundles are useful, inspectable, redacted, and never uploaded silently.
- [ ] No live user profile/save/config is damaged by testing.
- [ ] No artificial project/mod/gallery/source/content caps are used to fake performance.
- [ ] No dead UI or fake-success states remain.
- [ ] CLI parity and real runtime workflows are part of release QA.
- [ ] A fresh runnable build is produced and exercised after implementation changes.
- [ ] Material project state is checkpointed to GitHub and Google Drive.

---

# 40. Canonical detailed references

These remain deeper engineering references subordinate to this master contract:

- `README.md`
- `docs/LAUNCHER_PARITY_MATRIX.md`
- `docs/PREMIUM_TESTING_LAB_SPEC.md`
- `docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md`
- `docs/CODEX_HANDOFF_PREMIUM_TESTING_CLI.md`
- release-evidence documents under `docs/`

Master tracker for Performance Lab implementation:

- `https://github.com/Herbertofury/Enderloom/issues/1`

---

# 41. Final implementation philosophy

Do not turn Enderloom into a pile of tabs that each approximate another tool.

The winning version is one shared system where:

- Catalog knows what is installed;
- Mod Manager knows what was researched;
- updates know what configs/dependencies/evidence they affect;
- Testing knows the exact mod hashes/configs/environment;
- logs know which run generated them;
- performance results live on the mod itself;
- CLI can do what the GUI can do;
- CI can reproduce what the user can do;
- AI receives the exact evidence instead of a vague description;
- every destructive action is reversible or clearly bounded;
- every recommendation can explain **why**;
- and the whole thing remains fast enough that using Enderloom is easier than manually stitching together six other applications.

That is the Enderloom target.
