# Enderloom — GET DONE NOW: Core UX / QoL Repair Queue

**Status:** ACTIVE / IMMEDIATE EXECUTION QUEUE  
**Created:** 2026-09-24  
**Repository:** `Herbertofury/Enderloom`  
**Updated:** 2026-09-26  
**Priority:** **ARCHITECTURE PRIORITY -1 is the Rust-native `enderloom-core`; ABSOLUTE PRIORITY ZERO remains whole-app speed/responsiveness AND useful amount/coverage superiority.** Enderloom must move filesystem/indexing, provider/data, hashing, archive parsing, dependency solving, download/install, cache/database, image-processing, scheduling, and other heavy/native-capable hot paths out of JavaScript and into the Rust core by default. JavaScript/Electron remains the presentation/browser/native-shell adapter unless an apples-to-apples benchmark proves a specific JS implementation is faster **and** equally or more correct, complete, fresh, reliable, and crash-safe. On every technically equivalent workflow Enderloom must still be **strictly faster than both** installed CurseForge and Modrinth while exposing strictly more useful non-duplicate content/capability with no quality, quantity, fidelity, integrity, freshness, or feature loss.

## Objective

Fix the currently visible rough edges and missing common-sense behavior in Enderloom so everyday browsing, downloads, updates, favorites, instance launching, file actions, guided installs, logs, and navigation are **strictly faster and richer than both CurseForge and Modrinth** wherever technically comparable, while preserving or improving Enderloom's stronger provenance, rollback, dependency, recovery, correctness, and coverage guarantees.

This is a **get-done-now execution list**, not a future ideas backlog. Continue from the earliest ready unchecked item, implement through the real production paths, run targeted regression proof, and keep going automatically.

## G012 — PRIORITY -1: Rust-native `enderloom-core` owns the performance-critical architecture

- [ ] **G012 · ARCHITECTURE GATE** — `enderloom-core` is the canonical production owner for performance-critical filesystem/indexing, database/cache, provider/data, hashing/fingerprinting, archive inspection, dependency/compatibility solving, transfer/install pipelines, background scheduling, and native media work; Electron/JavaScript is reduced to UI/browser/native-shell orchestration except where measured production evidence proves a JS implementation is genuinely superior with no protected regression.

This gate executes **before and underneath G010**. It is not a rewrite-for-rewrite's-sake. Migrate a hot path only through a real vertical slice, preserve accepted behavior/data, compare equivalent results, and keep the faster implementation only when runtime evidence proves it. If profiling exposes another material shared hot path not explicitly listed here, use common-sense product/engineering agency to add it to the nearest appropriate task with the next unused stable ID and fix it before closing G012.

### Rust-first ownership law

The default ownership rule is:

- **Rust/native core:** filesystem discovery/change tracking, local indexing, database access, search indexes, cache management, provider transport/normalization, identity/fingerprint/hash work, ZIP/JAR inspection, dependency graphs/solving, compatibility analysis, bulk operation planning, download/install/update pipelines, transaction/rollback state, artifact storage, image decode/resize/thumbnail generation, priority/background scheduling, and performance instrumentation.
- **Electron main:** window/process lifecycle, WebContents/session/browser APIs, native dialogs/menus/permissions, and thin validated IPC adapters only.
- **Renderer JavaScript:** presentation, user interaction, local view state, accessibility, and lightweight formatting only.
- Browser-native work that must occur through Electron/Chromium remains a thin JS/native-shell adapter; expensive follow-up processing belongs in `enderloom-core`.
- A JS hot-path implementation may remain only after a reproducible benchmark on the real workload proves it beats the Rust/native alternative on latency/throughput **without increasing CPU/RAM/disk/network cost unacceptably and without reducing correctness, result coverage, freshness, crash safety, validation, or maintainability**.
- Never keep duplicate Rust and JS production engines indefinitely. After migration/proof, one canonical owner remains and all GUI/CLI/automation surfaces route through it.

### T056 — Build and production-wire `enderloom-core`

- [ ] **T056** · Establish the Rust-native core as the shared canonical backend and move one real end-to-end hot path through it before widening migration

Required:

- Resolve the existing Enderloom process/module boundaries once; do not invent parallel services if a suitable native bridge already exists.
- Choose and benchmark the narrowest production-grade bridge appropriate to the current Electron architecture (for example N-API/native module versus a supervised local sidecar) on startup overhead, IPC throughput, crash isolation, packaging/update complexity, and debugging.
- Expose typed versioned commands/events, stable operation IDs, cancellation, progress, structured errors, and compact delta responses.
- One end-to-end vertical slice must exercise: renderer action -> thin Electron adapter -> Rust domain operation -> persisted state/files/provider work -> progress/event -> visible UI result -> restart persistence.
- Core crash/failure must fail the affected operation truthfully and keep the Electron shell recoverable; never let a native panic corrupt live state or masquerade as success.
- Package/sign/distribute the Rust component as part of the normal Enderloom build, not as a developer-only optional binary.
- Record exact Rust toolchain/native binary hash/API schema in packaged-runtime evidence.

### T057 — Remove heavy JavaScript work unless JS is proven superior

- [ ] **T057** · Profile and migrate CPU/I/O/data hot paths out of Electron/Node/renderer; retain JS only where benchmark evidence proves it better without protected regressions

Audit and migrate, where currently present:

- recursive instance/mod filesystem scans;
- stat/hash/fingerprint loops;
- JAR/ZIP parsing;
- dependency/compatibility solving;
- provider response normalization/reconciliation;
- large JSON transforms;
- database/index/search work;
- download verification/install/update preparation;
- image decoding/resizing/thumbnail work;
- bulk operation planning;
- large sort/filter canonicalization;
- repeated IPC marshaling of giant object graphs.

Rules:

- No renderer path may synchronously perform filesystem, hashing, archive, DB, network, dependency-solver, or large transform work.
- No "migration" is accepted if it merely moves the same blocking algorithm from renderer to Electron main.
- For every moved hot path capture old JS vs Rust/native cold/warm timing, CPU, memory, I/O, result counts and correctness.
- If JS genuinely wins on a narrow operation, preserve the benchmark fixture and keep it there; "Rust is always faster" is not an assumption.
- JS/Rust parity failures are correctness bugs. Do not switch ownership until outputs reconcile or the intended new behavior is explicitly proven better.

### T058 — WizTree/Everything-style MFT + USN incremental filesystem engine with safe fallback

- [ ] **T058** · Make initial Windows NTFS discovery fast from filesystem metadata and subsequent instance refreshes change-driven so unchanged files are not rescanned/rehashed/reparsed

Windows/NTFS fast path:

- Build a narrowly privileged helper/service only if required for volume/MFT/USN access; **never elevate the whole Enderloom Electron app**.
- Initial registered-root discovery may use NTFS MFT enumeration to construct path/file identity quickly instead of recursive per-entry directory walking.
- Persist volume identity, file/reference identity, path mapping, size, timestamps, relevant USN/journal position, and Enderloom index generation.
- After the initial trusted snapshot, consume the NTFS USN Change Journal to identify exactly which relevant files/directories changed since the stored checkpoint.
- Opening Mods/Instance views uses the last verified index immediately; delta reconciliation runs in the background and patches only changed records.

Safety/correctness:

- MFT/USN data is an **acceleration signal**, not proof of artifact contents or provider identity.
- Detect journal ID change/reset, journal wrap/truncation, missing range, volume replacement, root move, file-ID reuse ambiguity, helper failure, and unsupported filesystem. Any such condition invalidates only the affected scope and triggers a bounded authoritative rescan rather than trusting incomplete deltas.
- Directory rename/move handling must keep file-reference -> current-path mapping coherent.
- Never interpret a watcher/provider failure as "file deleted" without authoritative filesystem confirmation.
- Non-NTFS, removable, network, cloud-backed, or unsupported filesystems use a safe persistent snapshot + OS watcher/change notification + bounded parallel reconciliation fallback.
- Full rescans happen only when evidence says the persisted index cannot be trusted, and should be scoped to the affected instance/root/volume rather than every Enderloom instance.
- A forced "Verify/Rescan" remains available for troubleshooting but ordinary navigation must not depend on it.

Required proof:

- unchanged 1,000+ mod instance reopen performs effectively zero JAR reads/hashes/parses;
- add/remove/rename/update a handful of files and prove only affected records are reprocessed;
- simulate USN journal discontinuity and prove safe targeted recovery;
- compare cold initial scan and warm change-detection against prior Enderloom and installed launchers.

### T059 — SQLite WAL canonical state store + FTS/search/sort indexes

- [ ] **T059** · Use SQLite WAL as the durable canonical metadata/index store with indexed hot queries, FTS search, batched writes, migrations, and integrity protection

Required architecture:

- Use SQLite WAL mode for the production local metadata/index database where platform/storage semantics support it.
- Use one coordinated write queue/transaction owner rather than allowing worker pools to fight over many tiny writes.
- Batch coherent mutations into transactions; readers must remain available while background indexing/provider refreshes write.
- Add real indexes for measured query/sort/filter paths: canonical project/provider/file IDs, instance/path/file identity, game version, loader, content type, installed/update/favorite/pin/enabled state, dates/sizes, and other proven hot predicates.
- Use FTS5/prefix/trigram capabilities where appropriate for instant local name/author/alias/substring discovery, but reconcile fuzzy matches against canonical provider identity before any mutation.
- Common sorts/filters should be database/index-backed instead of repeatedly sorting giant JS object arrays.
- Avoid full-table/full-JSON rewrites for small deltas.
- Control WAL checkpointing so a user click is not randomly forced to perform a giant checkpoint; checkpoint/compact during appropriate idle/maintenance windows with bounded impact.

Integrity:

- Version every schema migration; migrate atomically with rollback/backup path.
- Enable/verify relational constraints appropriate to the schema.
- On suspicious shutdown/migration/storage errors, perform cheap integrity checks first and escalate to full integrity verification when warranted.
- Never delete the only good database because one cache table is corrupt; distinguish rebuildable caches/indexes from durable user state.
- If rebuildable indexes are invalid, reconstruct them from authoritative durable state/files/providers while preserving user data.
- Do not weaken SQLite durability/synchronous settings merely to win a benchmark; any tuning must pass crash/power-loss simulation appropriate to the protected data class.

### T060 — Global content-addressed artifact store with corruption-safe reuse

- [ ] **T060** · Download/verify immutable artifacts once and safely reuse them across installs/instances without coupling mutable user data

Store by strong content identity with provider provenance and expected hashes/size where available:

- mod JARs;
- provider pack/addon archives;
- Minecraft libraries/assets;
- verified Java/runtime artifacts where Enderloom manages them;
- resource packs/shaders/datapacks and other immutable provider artifacts;
- provider/media assets when useful.

Rules:

- New network bytes enter staging, are streamed through required hashes, validated, and only then atomically promoted into the content-addressed store.
- Never trust filename, URL, or cache key alone as content identity.
- Exact validated cache hit means zero re-download and zero duplicate hash work where persisted verification evidence remains trustworthy.
- Reference tracking/garbage collection must never evict an object still referenced by an instance, active transaction, rollback snapshot, or quarantine entry.
- Mutable worlds/configs/saves/screenshots/user-edited files are never hardlinked/shared as immutable CAS objects.
- Prefer safe copy-on-write/reflink/clone mechanisms when the filesystem supports them. Hardlink immutable artifacts only when Enderloom can guarantee that no instance/tool path will mutate the linked bytes in place; otherwise materialize a normal copy.
- Detect external tampering of a materialized immutable artifact before relying on cached identity for update/Doctor decisions.
- Cache cleanup is transactional and recoverable; a cleanup crash cannot strand referenced artifacts as missing.
- Cross-instance dedupe is a speed/storage optimization only; instances remain independently usable/removable.

### T061 — One-pass multi-hash/fingerprint streaming + selective JAR/ZIP parsing

- [ ] **T061** · Read artifact bytes the minimum number of times while preserving every provider-required hash/fingerprint and exact metadata result

Required:

- During a necessary artifact read, compute internal BLAKE3/content identity plus all provider/security hashes/fingerprints required by current adapters in one streaming pass when algorithms permit.
- Persist verified hash/fingerprint results keyed to trustworthy file/content identity so unchanged files do not get re-read.
- Do not replace provider-required algorithms with BLAKE3; BLAKE3 is an internal fast identity/cache primitive in addition to required provider hashes.
- For ZIP/JAR identification, read the central directory and only the metadata entries required for classification/manifest/dependency work (`fabric.mod.json`, Quilt/Forge/NeoForge metadata, manifests, pack metadata, relevant known schemas, etc.) instead of inflating the entire archive.
- Fall back to deeper/full archive inspection when classification, security, corruption detection, a content adapter, or a specific accepted feature truly requires it.
- Archive parser must reject malformed/path-traversal/zip-bomb-style hostile structures safely and never extract arbitrary content merely to inspect metadata.
- Cache parsed metadata by verified immutable content identity, not filename.
- Benchmark buffered, memory-mapped, and streaming I/O on representative tiny/mixed/large artifact sets and choose adaptively; never assume mmap is universally faster.

### T062 — Tokio async I/O + Rayon CPU work-stealing + foreground-priority scheduler

- [ ] **T062** · Separate I/O concurrency from CPU parallelism and keep user-blocking work ahead of maintenance without starving correctness

Use distinct bounded execution lanes:

- **Tokio/async I/O:** provider HTTP, downloads, filesystem async tasks where appropriate, waiting, reconnect/retry.
- **Rayon/bounded CPU workers:** hashes/fingerprints, archive parsing/decompression, dependency graph work, canonicalization, heavy local search transforms, native image work.
- **Serialized/coordinated commit lane:** database/file transaction commits that must be ordered/atomic.

Priority model:

1. P0 user-blocking: clicked project/install/update/launch/search action;
2. P1 visible: current viewport/cards, active operation progress, visible artwork;
3. P2 predictive prefetch: hover/focus/likely next navigation and scroll-ahead preparation;
4. P3 maintenance: cleanup, deep cache verification, non-visible enrichment, compaction.

Rules:

- Work stealing/bounded queues prevent one slow item from pinning an entire static partition.
- Background work yields/deprioritizes when P0/P1 arrives.
- Enforce per-provider and global concurrency budgets with rate-limit/backpressure awareness.
- Auto-tune disk concurrency conservatively by observed storage behavior; more threads are not automatically faster.
- Avoid unbounded task spawning, thread-per-request, and duplicate in-flight work.
- Cancellation/generation ownership prevents abandoned A -> B -> A work from committing stale results.
- Record queue wait, execution time and cancellation to expose scheduler-induced latency regressions.

### T063 — Freshness-safe provider/query cache: instant without false, stale, or bad-link results

- [ ] **T063** · Make cached Browse/search/project data instant while preserving authoritative freshness, provenance, canonical URLs, and uncertainty

Every cached provider/query record must retain enough provenance to reason about freshness:

- provider + canonical project/file/release IDs;
- canonical URL/source identity;
- fetched/verified time;
- TTL/freshness policy by data class;
- ETag/Last-Modified/provider revision when available;
- compatibility/query context;
- source/result status and last authoritative error.

Rules:

- Last-verified data may render instantly while revalidation runs, but the UI/service must never represent stale cached data as newly verified/current when freshness materially matters.
- Install/update/change-version/Dependency Doctor commits revalidate the selected release/file identity, compatibility, dependency plan, expected hash/size, and current signed/download URL when required before mutation.
- Signed/expiring CDN URLs are never stored as canonical project links; reacquire them through the provider adapter.
- Canonical external links must derive from verified provider/API/upstream identity and safe schemes/hosts, not transient scraped redirects or display-name guesses.
- Treat provider timeout, auth failure, rate limit, parser failure, offline state, or search transport failure as **unresolved/degraded**, never as authoritative "no project/no result".
- Negative-cache only real authoritative misses with short evidence-based TTL/invalidation and exact provider/query context; provider recovery or identity evidence invalidates them immediately.
- Query caches reconcile terminal pagination and canonical dedupe; cached partial pages cannot masquerade as full search coverage.
- When fresh data differs, patch the current canonical record/result set without blanking the view or silently preserving outdated links/files.
- Preserve a visible/inspectable "last verified" state when stale data could affect a user's decision.
- Cache/schema corruption invalidates only the affected rebuildable entries and triggers authoritative re-fetch/rebuild; it must not poison durable user state.

### T064 — Incremental dependency/compatibility graph

- [ ] **T064** · Persist and update the dependency/compatibility graph incrementally so one changed mod does not force a complete instance solve

Required:

- Key graph nodes/edges to canonical project/provider/file/content identity and target Minecraft/loader/side context.
- Persist required/optional/incompatible/breaks/provides/recommends/host-framework relationships with provenance/evidence.
- On add/remove/update/enable/disable/provider-metadata change, invalidate only the affected connected graph plus anything whose constraints depend on it.
- Reuse unchanged solved subgraphs across Browse install previews, Update All, T052 Dependency Doctor, T053 bulk operations, and startup health.
- Detect cycles, conflicting version ranges, unresolved identities and provider disagreements explicitly; never manufacture a satisfying answer.
- A provider metadata refresh can expand invalidation when dependency evidence actually changed.
- Compare incremental result to periodic/full-solve oracle fixtures so speed never creates a stale or false compatibility answer.

### T065 — Pipelined transfer -> hash -> inspect -> dependency -> verify -> atomic commit

- [ ] **T065** · Remove serial install/update/download waterfalls while preserving the exact final verification and rollback gate

Required:

- Start network transfer immediately once request/destination/auth are valid.
- Stream bytes to staging while computing required hashes/fingerprints; where safe, begin archive metadata inspection as soon as sufficient validated structure is available.
- Plan independent dependency/provider branches concurrently.
- While artifact A verifies/commits, artifact B may download/verify when transactions are independent.
- Reuse exact validated CAS artifacts/dependency plans/provider metadata instead of repeating work.
- No artifact reaches a live instance until all required identity, hash, compatibility, dependency and transaction prerequisites for that commit are satisfied.
- Partial/temp files are never exposed as successful artifacts.
- Cancellation and failure cleanly release staged resources or preserve resumable state.
- Commit is atomic and rollback-capable; same-filename replacement follows T001 rather than in-place overwrite.
- Progress reports real pipeline stages/bytes/work and never fabricates "done" while deferred blocking verification remains.

### T066 — Native image/media pipeline with demand-driven sizes

- [ ] **T066** · Keep provider artwork/media from blocking Browse by processing/caching only the size actually needed through a native demand-driven pipeline

Required:

- Use a native high-performance image pipeline (for example libvips/sharp-backed/native-equivalent after benchmark) rather than renderer-side full-resolution decode/resize loops.
- Cache content-hash/URL-validated size variants appropriate to card/icon/detail/gallery use.
- Decode/shrink-on-load where supported; never decode a huge hero/gallery image merely to paint a tiny card.
- Visible/next-visible media has P1/P2 priority; below-fold gallery enrichment cannot delay text/actions.
- Preserve full media coverage and original source/provenance. Optimization may defer decode until needed but may never omit media from the logical project.
- Corrupt/unsupported media yields a localized placeholder/error while project text/actions remain usable.
- Cache invalidates when verified source identity changes; a stale image cannot overwrite a newer asset after late completion.

### T067 — Zero-blank large-list rendering; virtualization only if literally unnoticeable

- [ ] **T067** · Keep huge Mods/Browse lists smooth without blank cards, pop-in, missing rows, scroll jumps, or delayed logical results; use virtualization only after it passes a zero-visibility-defect gate

Policy:

- **Do not introduce or keep virtualization merely because it benchmarks lower DOM count.** It must be visually and behaviorally invisible.
- Prefer indexed data + fast incremental rendering/browser-native containment techniques where they meet performance without windowing defects.
- If windowing/virtualization is used, it must render **severely ahead of scroll** with velocity-adaptive overscan/prefetch. Maintain enough ready rows/cards ahead and behind that abusive wheel/touchpad/PageDown/scrollbar-drag/Home/End navigation never reveals empty placeholders caused by the windowing engine.
- Data for the ahead-of-scroll window must be prepared before DOM promotion; do not show blank/skeleton cards for records already known locally.
- Overscan expands proactively with measured scroll velocity and renderer load; if the system cannot maintain the lead, degrade to a safer larger/non-virtualized window rather than showing holes.
- Focus, Shift-range selection, Ctrl+A logical selection, context menus, screen readers, scroll restoration, anchored item position, variable-height content, image loading and keyboard navigation must remain correct across recycled rows.
- Search/filter/sort/count/bulk semantics always cover the complete logical dataset, never only mounted DOM rows.
- Add runtime instrumentation for "viewport requested but row/card not ready"; **the acceptance value is zero** in release fixtures.
- Required torture fixture: 10,000 logical results, rapid trackpad/wheel fling, scrollbar thumb drag, repeated Home/End/PageDown, fast filter changes and image-heavy cards on the supported Windows target. Capture video/frame telemetry and prove no blank gap/pop-in/scroll jump/missing result/focus loss.
- If that gate cannot be met consistently, disable virtualization for the affected surface and optimize the underlying data/render architecture instead.

### T068 — Compact delta IPC and single-flight cross-process state

- [ ] **T068** · Stop moving giant duplicate object graphs between Rust/Electron/renderer and push only coherent snapshots/deltas needed by the current UI

Required:

- Use stable IDs + compact typed deltas for changed records instead of retransmitting entire 10,000-item catalogs on each small update.
- Batch high-frequency progress/index/provider events to an appropriate frame/latency budget without hiding state transitions.
- Use transferable/binary buffers where profiling proves materially better for large payloads, with versioned schema and bounds validation.
- Single-flight equivalent core requests so multiple cards/views do not independently trigger the same provider/DB/hash operation.
- Maintain monotonic generation/revision IDs; renderer rejects stale deltas from superseded queries/navigation.
- Provide a full snapshot/recovery route when a revision gap is detected; never apply an incomplete delta chain as authoritative state.
- Benchmark serialization/deserialization + IPC queue time separately from core work.

### T069 — Crash consistency, cache correctness, and zero-corruption performance gate

- [ ] **T069** · Prove every new fast path is crash-safe, freshness-safe, corruption-detecting, and able to rebuild derived state without losing user data

Cross-cutting rules:

- File mutations use staging/temp -> validate -> durable/atomic replace/rename semantics appropriate to Windows/filesystem; never overwrite live JARs/configs in place as a performance shortcut.
- Use per-instance/per-artifact operation locks or transaction ownership so concurrent update/install/Doctor/bulk operations cannot race the same live artifact.
- Persist operation intent/state before destructive commit where needed for recovery; startup reconciles interrupted operations deterministically.
- Distinguish **durable user state** from **rebuildable derived/cache state**. Derived corruption can be discarded/rebuilt; durable favorites/notes/settings/provider bindings/history/quarantine/rollback/user choices cannot.
- Cache entries/artifact metadata include schema/version/content identity so incompatible/stale bytes cannot be misinterpreted after upgrade.
- Detect impossible DB/file/CAS identity mismatches and stop the affected mutation before damage.
- Run crash injection at each important pipeline boundary: during download, hash, DB write, CAS promotion, live-file swap, rollback snapshot, migration, WAL/checkpoint, index update and quarantine move.
- After restart, prove the instance is either at the verified prior state or verified new state—never half-installed while reported successful.
- Performance benchmarks run with all integrity/freshness/rollback protections enabled. Disabling them invalidates the benchmark.
- Any performance optimization that causes a false search result, stale "latest" claim, broken/outdated link, provider mis-merge, missing logical result, lost user data, silent corruption, unrecoverable partial operation, or weaker verification is automatically rejected and the responsible task reopened.

**G012 closes only when T056-T069 are production-wired, packaged-runtime proven, and the migrated hot paths preserve or improve the complete G010/G011 result/quality contract.**

---

## G010 — ABSOLUTE PRIORITY ZERO: make the entire app feel instant, with zero loss

- [ ] **G010 · ABSOLUTE PRIORITY GATE** — On every technically equivalent benchmarked workflow, Enderloom is **measurably faster than BOTH** installed CurseForge **and** Modrinth, not tied with either; and across the complete comparable discovery/management experience Enderloom exposes **strictly more useful non-duplicate projects/sources/releases/metadata/dependency intelligence/media/context/actions/capability than BOTH**, while being no worse than either in correctness, fidelity, compatibility, validation, provenance, rollback safety, or supported behavior.

This gate is **above every other tranche in this document**. Performance is not a later polish pass. Almost every ordinary Enderloom workflow must be treated as a performance-critical product path: first launch/onboarding, account sign-in/reconnect, application launch, restoring the prior workspace, creating/importing/cloning instances, opening Browse, showing unified cross-provider Browse results, changing providers/categories, searching/filtering/sorting, opening project pages, opening Mods/Addons, discovering installed content, running dependency diagnosis, checking updates, updating one mod or many mods, beginning a download, sustaining download throughput, installing content, resolving dependencies, bulk mod operations, native context menus/keyboard actions, opening provider/browser tabs, switching views, returning/back-forward, favorites, artwork/media enrichment, file actions, logs, and restart/resume.

The target is not merely "fewer spinners." The target is **lower real latency and higher throughput for equivalent-or-better work**.

### Non-negotiable zero-loss performance law

A performance/coverage change is accepted only when **all three** are true:

1. **Speed superiority:** the targeted technically equivalent hot path is measurably faster than **both** CurseForge and Modrinth; a tie with either comparator is not completion.
2. **Amount/coverage superiority:** Enderloom's complete comparable result/capability set is strictly larger and more useful than **both** clients, measured with deduplicated canonical projects/sources, compatible files/releases, metadata fields, dependency/relations intelligence, media/changelogs, provenance/context, and available actions — never by padding duplicates or irrelevant records.
3. **Zero regression:** no protected dimension becomes worse: projects, files, versions, provider matches, metadata, dependencies, relations, screenshots/media, validation steps, hashes, provenance, compatibility checks, rollback guarantees, supported content types, UI capability, correctness, persistence, or recovery.

The following are **not optimizations** and must fail review:

- hiding work that still blocks later;
- returning fewer results;
- silently truncating provider pagination;
- reducing metadata/detail quality;
- skipping dependency closure;
- skipping compatibility/hash/provenance validation;
- disabling provider/source reconciliation;
- replacing exact provider identity with weaker name guessing;
- reducing media/gallery coverage;
- dropping history, rollback, recovery, or persistence;
- delaying necessary work until the user hits another stall;
- removing features, controls, loaders, providers, content types, or supported workflows;
- making cold paths worse to make a hand-picked warm demo look fast.

### Authorized CurseForge + Modrinth desktop reference access

For this Enderloom work, **the user states that they have full authorization to inspect, unpack where necessary, trace, benchmark, analyze, extract, adapt, and integrate implementation/code/assets from the locally installed CurseForge and Modrinth desktop applications for the purpose of making Enderloom behave correctly and perform strictly better than both in speed and useful amount/coverage.**

Treat those locally installed clients as first-class authorized reference implementations:

- Record the exact installed client versions/builds and hashes before analysis so findings are reproducible.
- Analyze **read-only copies** whenever practical; do not mutate the user's working CurseForge/Modrinth installations merely to study them.
- Inspect their actual startup flow, cache/index strategy, request scheduling, provider search/detail loading, project identity handling, download/update pipelines, list virtualization, IPC boundaries, persistence, browser/webview reuse, concurrency, and error/retry behavior.
- Use runtime tracing/profiling as well as code inspection. Do not guess why they are faster when the local implementation can be measured.
- Under the stated authorization, reuse/adapt exact implementation ideas or code/assets where useful; integrate them cleanly into Enderloom's canonical architecture rather than bolting on isolated duplicate engines.
- Preserve any required provenance/notices and do not copy unrelated credentials, tokens, cookies, private account data, or other user secrets.
- If CurseForge and Modrinth use different strong techniques, combine the best compatible ideas instead of choosing one client wholesale.
- When Enderloom can safely do better, do better; the comparators are a floor/reference, not a ceiling.

### T047 — Establish real comparator baselines and profile every major Enderloom latency path

- [ ] **T047** · Capture reproducible, apples-to-apples CurseForge / Modrinth / Enderloom performance evidence before and during optimization

Use the **same computer, network, Minecraft instance/content set, provider query, and comparable user workflow** wherever technically possible. Run enough repeated cold/warm trials to distinguish a real gain from noise.

Measure at minimum:

- process start -> first visible window;
- process start -> usable/interactive shell;
- prior workspace/session restoration;
- Mods/Addons view -> first useful installed-content rows/cards;
- Mods/Addons -> complete logical dataset available to search/filter/sort;
- Browse click -> first useful results;
- Browse click -> full requested result set/provider reconciliation;
- provider/category/search change -> useful results;
- project-card click -> useful project details;
- back/forward/reopen project;
- update check -> first useful update state and full update scan;
- Update click -> transfer actually starts;
- Update click -> verified/committed replacement;
- download click -> network transfer starts;
- sustained download throughput and CPU cost;
- install click -> dependency plan visible;
- install click -> verified committed install;
- tab/provider/browser open and switch latency;
- first artwork/media render and later enrichment;
- idle CPU, active CPU, memory, disk I/O, network requests, main-thread/event-loop stalls, renderer frame responsiveness, and IPC volume on those workflows.

For network-backed paths, report **Enderloom-local overhead separately from provider/network latency** so slow providers do not hide slow Enderloom code and fast providers do not hide architectural waste.

Persist a compact benchmark matrix with exact build/commit, comparator versions, test dataset, cold/warm status, counts returned, and timings. Reuse the same fixtures after each major performance change.

### T048 — Remove whole-app latency at the shared architectural causes

- [ ] **T048** · Make launch, Browse, Mods, updates, downloads, installs, and navigation fast through shared architecture instead of isolated cosmetic patches

Profile first, then fix the earliest causal owner. Apply these techniques wherever evidence shows they fit:

**Startup / launch**
- Keep the true startup critical path minimal: create/render the usable shell first, then schedule non-blocking enrichment.
- Do not synchronously rescan every instance, mod, provider, artwork file, cache, log, or browser state before showing a usable window.
- Persist validated indexes/snapshots so restart can restore known-good state immediately and then reconcile deltas.
- Use filesystem change tracking / dirtiness / mtimes / hashes intelligently so unchanged directories are not repeatedly rescanned.
- Parallelize genuinely independent startup work with bounded concurrency.
- Lazy-load heavy code/routes only when that does not move an unavoidable stall to the first click; prefetch high-probability routes after shell readiness.
- Remove synchronous disk, JSON, hashing, SQLite, child-process, network, and IPC work from Electron main/renderer hot loops.

**Browse / provider/project opening**
- Render last-verified cached results immediately and stale-while-revalidate in the background.
- Search supported providers in parallel with bounded concurrency and single-flight identical requests.
- Persist normalized project/provider identity so the same CurseForge/Modrinth/GitHub project is not rediscovered/reconciled from scratch on every navigation.
- Prefetch likely project details/media on user intent (hover/focus/viewport proximity) when cheap and cancel stale work.
- Stream useful results progressively without changing the final complete result set.
- Use conditional requests/ETags/delta refresh where providers support them.
- Keep browser/provider WebContents/session/view objects warm/reusable where safe instead of rebuilding expensive state on every open.
- Prevent stale A -> B -> A responses from overwriting newer navigation intent.

**Mods / Addons / local instance content**
- Maintain an incremental persistent local content index keyed by stable path/file identity, provider IDs, fingerprints/hashes, and relevant manifest metadata.
- Reconcile only changed files/directories instead of full rescans for every view open.
- Virtualize large lists/grids without changing logical search/sort/filter/select-all semantics.
- Batch filesystem/stat/hash/database work and move CPU-heavy work off the UI thread.
- Cache parsed manifests/fingerprints by file identity + size/mtime/hash validity.
- Share canonical provider/project metadata with Browse/Favorites/Updates instead of refetching equivalent data in separate UI silos.

**Updates**
- Reuse known installed project identity, compatible-release metadata, dependency plans, and content-addressed artifacts.
- Run provider checks in parallel with request coalescing, rate-limit awareness, and stale-while-revalidate UI.
- Pipeline independent download/verify/commit stages where safe; do not serialize unrelated mod updates.
- Start useful visible progress immediately.
- Preserve T001 transactional replacement, rollback, freeze/pin behavior, identity safety, and validation in full.

**Downloads / installs**
- Start the actual transfer as soon as the destination/authorization/request is valid; UI animation/enrichment must never delay bytes.
- Reuse one shared transfer service/event stream for browser/provider/install/update downloads.
- Avoid duplicate download, hash, metadata, and dependency work when the exact artifact/plan is already valid in cache.
- Use streaming I/O, appropriate buffers, bounded concurrent transfers, resumable/range support, and atomic finalization.
- Keep hashing/verification off the renderer and pipeline verification without weakening the final commit gate.
- Preserve exact content, hash/provenance checks, dependencies, rollback, history, and resumability.

**Renderer / IPC / persistence**
- Remove chatty per-row/per-card IPC waterfalls; batch or push coherent state changes.
- Prefer event-driven updates over polling.
- Index actual database query patterns; eliminate repeated full-table/full-JSON rewrites when incremental updates are safe.
- Avoid parsing/serializing giant state blobs for tiny changes.
- Memoize derived view models only with correct invalidation.
- Keep expensive image/media work asynchronous and cache decoded/processed variants where appropriate.
- Prevent background work from starving the foreground interaction queue.

**Performance UX rule**
- Every direct user gesture should acknowledge/respond within roughly one frame to 100 ms when local state can answer it.
- Cached/local useful content should normally appear within roughly 100-250 ms.
- Remote freshness may continue asynchronously, but the user must immediately see valid known state plus truthful refresh status.
- Do not fake instant behavior with empty shells when valid cached/known content exists.

T048 does not close because one screen is fast. It closes only after the shared causes behind the broad slow-app behavior are repaired and the detailed existing tasks (including T002, T004, T025, T027, T045, and T046 where applicable) still pass their own contracts.

### T049 — Prove Enderloom strictly beats BOTH CurseForge and Modrinth in speed and useful amount without regression

- [ ] **T049** · Run the final equivalent-work performance + completeness certification

For every comparable major workflow, benchmark Enderloom against both installed clients. **Enderloom must beat each comparator individually**; the faster comparator is therefore the minimum speed target, and the richer comparator is the minimum amount/coverage target.

Acceptance:

- Enderloom must be **measurably faster than both clients** on comparable median user-visible latency after separating external network/provider time where appropriate; equality with either client leaves the task open.
- Enderloom must also beat both on p95/p99 responsiveness where the workflow is technically comparable, so a fast median cannot hide severe stalls.
- Result counts and coverage must be reconciled: expected/discovered/returned/accepted/rejected/unresolved, plus canonical deduplication so duplicate padding cannot fake superiority.
- Search, Browse, provider reconciliation, update discovery, dependency plans, downloads, installs, and local content views must expose **strictly more useful aggregate information/capability than each comparator** while preserving at least the full pre-optimization Enderloom result set.
- No individual protected dimension may regress below either comparator when that dimension is technically comparable; superiority must come from real extra coverage/intelligence/capability, not noise.
- Existing stronger Enderloom guarantees must remain intact.
- Test both warm and cold state, restart, large instances/catalogs, one degraded provider, offline cache behavior, rapid navigation/cancellation, simultaneous downloads/updates, and a provider/account reconnect case.
- If CurseForge **or** Modrinth is still faster **or tied** on an equivalent path, profile the difference and continue improving architecture. Do **not** close G010 by documenting the loss or accepting parity.
- If Enderloom becomes faster by dropping work, metadata, results, validation, or fidelity, reopen the responsible task and reject the optimization.

**G010 closes only when T047, T048, T049, T050 and every existing performance-sensitive task they touch are runtime-proven on the packaged/current desktop build.**

### T050 — Permanent superiority ratchet: never regress below the proven better-than-both baseline

- [ ] **T050** · Make strict speed + useful-amount superiority a permanent release/CI acceptance condition, not a one-time benchmark

Once T049 establishes a proven benchmark/coverage baseline, preserve it as a versioned machine-readable acceptance artifact tied to exact Enderloom build/commit, comparator versions/builds, datasets, hardware/network context, result counts, and timing distributions.

Required behavior:

- Every performance-sensitive change must run the cheapest decisive affected-path benchmark + coverage-equivalence check before merge/release; broader comparator certification runs at release gates and after material architecture/provider changes.
- A change that is slower than the current proven Enderloom baseline, returns less useful deduplicated coverage/capability, or reintroduces a protected regression **fails** even if it still beats an older comparator build.
- Never replace a stronger Enderloom baseline with a weaker one merely because a benchmark is noisy or a new implementation is convenient. Improvements ratchet forward.
- Track median, p95/p99, first-useful-result, full-completion, throughput, CPU/memory/disk/network, and logical result/metadata/dependency/media/action coverage where relevant.
- Use stable fixtures plus representative large/cold/warm/degraded-provider cases. Preserve exact expected/discovered/returned/accepted/rejected/unresolved counts and canonical deduplication.
- When installed CurseForge or Modrinth updates materially, capture the new exact build/hash, rerun the comparable benchmark matrix, and raise Enderloom's target if either comparator improved. Comparator progress can only raise the bar, never lower Enderloom's existing proven baseline.
- If an external provider/network event makes a comparator run non-equivalent, mark that sample invalid and rerun under comparable conditions; do not use bad external conditions to manufacture a win.
- Keep an explicit history of benchmark/coverage regressions and the fix that restored superiority so the same regression class becomes a reusable test/fixture.
- Final packaged releases must carry a concise superiority receipt proving which comparator builds and workflows were beaten and which non-comparable/proprietary workflows were excluded with reasons.
- No release may claim this queue complete while T050 detects a regression, tie, stale comparator baseline, reduced result/capability coverage, or unverified affected hot path.

---

### Immediate execution priority override

The **G010 / T047-T049 whole-app performance program is the absolute highest priority**. Within that program, the embedded-browser/download/Browse repair remains the first tactical tranche because it is among the most disruptive everyday UX problems.

Execute in this priority order, without waiting for unrelated queue items:

1. **T056 + T057** — establish production `enderloom-core` and make Rust/native ownership the default for heavy hot paths;
2. **T058** — replace repeat recursive scans with MFT/USN change-driven indexing plus safe authoritative fallbacks;
3. **T059** — move canonical metadata/search/index state to SQLite WAL + measured indexes/FTS with integrity-safe migrations;
4. **T060 + T061** — add corruption-safe CAS reuse, one-pass hashing/fingerprints, and selective JAR/ZIP parsing;
5. **T062 + T068** — add Tokio/Rayon priority scheduling plus compact delta/single-flight IPC;
6. **T063** — make every cache/search/link path freshness-safe so instant never means false/stale/bad-link;
7. **T064** — make dependency/compatibility solving incremental and shared across install/update/Doctor/bulk flows;
8. **T065** — pipeline transfer/hash/inspect/dependency/verify/commit without weakening the atomic final gate;
9. **T066** — move media decode/resize/cache work to the native demand-driven pipeline;
10. **T067** — prove zero-blank large-list rendering; virtualization stays disabled anywhere it is perceptible or can miss visible rows;
11. **T069** — crash-inject and prove every fast path cannot corrupt or manufacture freshness/success;
12. **T047** — capture apples-to-apples Enderloom / CurseForge / Modrinth baselines and profile the remaining real hot paths;
13. **T048** — repair any remaining shared launch/Browse/Mods/update/download/install/IPC/storage latency;
14. **T051** — make unified discovery return a faster, larger, deduplicated, richer union than either launcher;
15. **T054** — make first-run, account, create/import/clone flows faster than both launchers with full fidelity;
16. **T026** — move Enderloom onto the latest production-stable Electron baseline;
17. **T004** — finish the canonical Chromium download pipeline;
18. **T025** — ship the Chrome-style toolbar Downloads button + automatic pop-out bubble;
19. **T027** — make download persistence/resume/save behavior survive real use and restart;
20. **T045** — eliminate Browse/project-opening latency through cache-first/prefetch/parallel architecture with zero result loss;
21. **T046** — reconcile the same logical project across Modrinth/CurseForge instead of treating provider listings as unrelated projects;
22. **T002 + T001** — make update discovery/application fast while preserving transactional correctness;
23. **T052** — ship the user-confirmed Instance Dependency Doctor;
24. **T053** — ship Bulk Mod Manager + Undo/Quarantine;
25. **T055** — ship native Mod/Instance context menus + keyboard bulk actions;
26. **T049** — run the strict faster-and-richer-than-both certification;
27. **T050** — lock that win in as a permanent release/CI ratchet so future work cannot regress it;
28. then continue the remaining browser modernization tasks in G002 before returning to the ordinary earliest-ready queue order.

This priority override changes execution order only; it does not remove or weaken any other accepted task. **When any later task touches a performance-critical path, G010 remains active and that task must preserve or improve the measured baseline rather than reintroducing latency.**

## Context

The current desktop UI/screenshots show the exact repair targets behind this queue: browser downloads are exposed as a separate manual link/SHA panel instead of normal in-page browser downloads; update/version discovery can sit loading too long; Update All can hit a filename-collision error instead of replacing the installed mod; favorites can duplicate the same project across providers; the MCreator candidate surface consumes permanent vertical space; the instance hero/header is oversized; provider-linked artwork is not consistently reused; and expected desktop actions such as Logs, reveal-in-folder, direct favorite-to-instance install, and F5 refresh are incomplete or awkward.

This queue is intentionally bounded to those accepted UX/QoL repairs and the shared architecture needed to make them reliable. It does not authorize removing working features or weakening Enderloom's existing provenance, dependency, rollback, recovery, or compatibility guarantees.

**Electron/browser correction:** the current manifest declares `electron: ^44.0.0`. As of **2026-09-24**, the newest production-stable Electron release is **44.4.4** (Chromium 152.0.7977.130, Node 24.21.0, V8 15.2.124.28); Electron 45 is still pre-stable on this date. T026 must re-check the official stable channel immediately before implementation and use the newest stable release available then, never an alpha/beta/RC merely because it has a larger version number.

**Addon correction:** provider-backed addons/customizations must behave like first-class online projects, not like a loose-file junk drawer. When Enderloom can identify a real CurseForge/Modrinth/etc. project and release file, the Addons surface must retain that online identity, use that provider release for install/update, and present the same polished project-page/card UX as the Mods surface. Local/private addon files remain supported, but must be explicitly shown as local/unlinked rather than being given a fake provider identity.

**GitHub Browse correction:** when a canonical project has a verified GitHub/upstream repository, GitHub must be a first-class in-app provider surface beside Modrinth and CurseForge. Selecting the GitHub source must render that exact repository/page directly inside Enderloom Browse rather than behaving as a hyperlink-only escape hatch, while still allowing the user to promote the provider view into a normal Enderloom browser tab through an unobtrusive control or drag-to-tab-strip gesture.

## Constraints and preservation

- Preserve existing instance files, worlds, configs, favorites, notes, provider bindings, artwork choices, browser state, and working functionality.
- Do not gain speed by skipping dependency closure, provenance, hash verification, rollback, recovery, compatibility checks, or result coverage.
- GUI actions must use the canonical service/domain operation rather than private UI-only logic.
- **No placeholder or decorative controls:** every button, tab, menu item, hotkey, launcher choice, and download/update action in this scope must work end-to-end through real production domain logic and persistence.
- Provider/project identity must use stable IDs/provenance/hashes where available, not display-name guessing.
- Repeated real failures become regression fixtures.
- A build alone is not proof. Exercise the changed desktop workflow in the packaged/current app when practical.
- If a later change breaks a completed item, reopen that item and its parent gate.

---

## G001 — Updates behave like a first-class launcher

- [ ] **G001 · GATE** — Updates behave like a first-class launcher

### T001 — Fix “File already exists” update failures — replace the installed mod transactionally

- [ ] **T001** · Fix “File already exists” update failures — replace the installed mod transactionally

**Observed failure:** Update All can fail individual mods with errors such as **“File already exists”** instead of updating them.

Implement update semantics like a proper mod manager:

1. Resolve the installed logical project + provider/file identity and the selected replacement artifact.
2. Download the candidate to Enderloom-owned staging/temp storage, never directly over the live JAR.
3. Validate expected provider identity, compatibility, size/hash when available, and dependency plan.
4. Snapshot/retain the previous installed artifact long enough for rollback.
5. Commit the update atomically:
   - if the new artifact has the **same filename**, replace the old file atomically;
   - if it has a **different filename**, install the verified new artifact and remove/retire the superseded old artifact as one transaction;
   - never reject a legitimate update merely because the destination/current filename exists.
6. Preserve enabled/disabled state, provider association, notes, favorites, freeze/pin state, config/world data, and canonical project identity unless the requested update explicitly changes an allowed field.
7. If the exact target artifact is already installed, report **Already up to date / no change** instead of failure.
8. A same-name filesystem collision belonging to a *different* canonical project is a real conflict: stop only that item, explain the identity conflict, and do not overwrite unrelated content.
9. Roll back cleanly on validation/commit failure so the prior working mod remains installed.
10. Bulk Update must continue independent updates after one item fails and provide a final per-item result instead of collapsing the whole batch.

**Regression fixtures:** same-filename replacement, versioned-filename replacement, already-current artifact, disabled mod update, pinned/frozen mod behavior, duplicate-provider identity, unrelated same-name collision, interrupted commit, failed validation rollback, Update All with one isolated failure.

### T002 — Make update discovery and Update All feel instant

- [ ] **T002** · Make update discovery and Update All feel instant

- Render cached last-verified compatible releases immediately, then stale-while-revalidate providers in parallel.
- Eliminate serial provider waterfalls, duplicate identical fetches, hidden full rescans, and modal-blocking metadata work.
- Use conditional/delta metadata requests, single-flight request coalescing, bounded provider concurrency, content-addressed download cache reuse, and dependency-plan reuse.
- Pipeline independent Update All downloads/verification instead of waiting for each full update to finish serially.
- Navigation/cancel must abort abandoned provider/download work without corrupting the batch.
- Measure cold and warm: first useful update list, full refresh time, click-to-download-start, aggregate throughput, UI responsiveness, and apply/commit latency.
- Benchmark the same instance on the same machine/network against installed CurseForge and Modrinth clients. **Enderloom must not be slower than either client on comparable median user-visible update latency, and this task remains open until the key update path is measurably faster than both where the comparison is technically equivalent**, while preserving Enderloom's stronger checks and complete results. If either client is faster, profile the bottleneck and change architecture rather than weakening validation.

### T003 — Add the authorized CurseForge-style download-start animation

- [ ] **T003** · Add the authorized CurseForge-style download-start animation

Integrate the **exact authorized CurseForge download-start animation implementation/assets/code** where available under the user's stated permission grant; do not substitute a rough lookalike when the authorized source is available.

- Preserve required copyright/attribution/provenance.
- Use it consistently for mod installs/updates and other appropriate content downloads.
- Start the transfer immediately; animation must never gate or delay network I/O.
- Keep animation/compositing off blocking main-thread work and honor reduced-motion settings.
- Fall back gracefully if the visual asset cannot load; the download still starts.

---

## G002 — Browser/download experience behaves like a normal modern browser

- [ ] **G002 · GATE** — Browser/download experience behaves like a normal modern browser

### T004 — Chrome-normal downloads in the embedded browser

- [ ] **T004** · Chrome-normal downloads in the embedded browser

Replace the separate/manual-feeling download behavior with a first-class Chromium download pipeline.

Required behavior:

- ordinary click-to-download from a webpage;
- authenticated/session-aware downloads using the current browser profile;
- redirects and provider-generated/expiring URLs;
- Content-Disposition filename handling;
- collision-safe filenames;
- visible state/progress/speed/size;
- pause/resume when supported;
- cancel/retry;
- interrupted download recovery;
- persistent recent download history with a browser-toolbar entry and a proper Downloads surface;
- **Ctrl+J** opens Downloads from browser context;
- configurable default download directory plus an optional ask-where-to-save behavior, both persisted;
- open file, **show in folder**, copy source link, and clear-history actions;
- safe temp/partial file + atomic finalize;
- provider/source provenance and expected hash/size verification when known.

The existing paste-a-file-link / optional SHA utility may remain as an advanced direct-download tool, but it must not be the normal browser download workflow.

**Canonical backend requirement:** webpage downloads, direct URL downloads, CurseForge/Modrinth/provider file transfers, addon downloads, and install/update transfers must converge on one shared download-state/service model where their semantics overlap. Browser-originated transfers must preserve the Chromium session/cookies/referrer/initiator origin; provider install/update transfers additionally retain project/file IDs, dependency/install transaction identity, and rollback state. Do not maintain competing download histories/progress engines that disagree about the same transfer.

### T005 — Browser extensions

- [ ] **T005** · Browser extensions

Add a real persistent extension manager for Enderloom's Chromium profile:

- install/import supported extensions;
- enable/disable;
- remove;
- inspect permissions/source;
- show compatibility/update state;
- persist across Enderloom restart and app upgrades;
- keep extension/profile data outside replaceable packaged application binaries;
- never silently copy browser secrets from unrelated profiles.


### T025 — Chrome-style toolbar Downloads button and automatic pop-out bubble — HIGHEST UX PRIORITY

- [ ] **T025** · Ship a real Chrome-style Downloads toolbar control and non-modal pop-out

The current behavior where downloads do not surface from a normal browser-style toolbar control is unacceptable. Implement a polished Downloads button directly in the embedded-browser toolbar, backed by the real T004 download model.

Required behavior:

- The Downloads button is always in a predictable browser-toolbar location, compact when idle, and becomes active immediately when a download begins.
- Starting a normal webpage download automatically opens a **non-modal pop-out bubble anchored under the Downloads button**, without navigating away from the current page and without opening a separate window.
- The bubble shows the newest/relevant downloads first with favicon/file icon where appropriate, filename, source/origin, progress, received/total bytes, speed, ETA when meaningful, and clear state.
- In-progress rows expose **Pause/Resume**, **Cancel**, and contextual retry/restart behavior.
- Completed rows expose **Open**, **Show in Folder**, and useful secondary actions such as Copy Link / Copy Source when safe.
- Failed/interrupted rows remain visible with a useful reason and **Retry/Resume** action instead of disappearing.
- Multiple simultaneous transfers are represented coherently; the toolbar icon/ring/badge summarizes aggregate activity without spawning multiple pop-outs.
- Clicking outside dismisses the bubble **without canceling or pausing downloads**.
- Clicking the Downloads button reopens the bubble instantly with current/recent state.
- The bubble remains correct across tab switches, browser navigation, opening Catalog/Mod Manager and returning, and provider installs that also use the shared download model.
- **Ctrl+J** opens the full Downloads surface/history while the toolbar bubble remains the fast everyday control.
- New downloads may briefly auto-open the bubble; completed downloads may optionally produce a restrained completion affordance, but no modal spam.
- The UI honors reduced motion and does not delay transfer start while animating.
- The bubble must not poll repeatedly for progress if T004 can push download events; use the canonical event stream.
- The bubble must be keyboard accessible: focus enters predictably, rows/actions are reachable, Escape closes it, focus returns to the Downloads button, and screen-reader names expose meaningful state.

**Hard acceptance path:** click a normal download link on a real webpage -> transfer begins -> Downloads button activates in the same browser toolbar -> bubble opens under it immediately -> live progress updates -> pause/resume/cancel work -> completion exposes Open and Show in Folder -> click elsewhere closes only the bubble -> click the button reopens it instantly -> Ctrl+J opens full Downloads -> browser navigation and tab switching do not lose the transfer/history.

### T026 — Upgrade Enderloom to the latest production-stable Electron

- [ ] **T026** · Upgrade and pin/test the newest stable Electron baseline before the browser modernization lands

Current manifest observation: `package.json` declares `electron: ^44.0.0`.

Implementation contract:

- Immediately before implementation, verify the official Electron stable channel and select the **newest stable production release**, not alpha/beta/RC/nightly.
- As of 2026-09-24 the verified target is **Electron 44.4.4**. If a newer stable exists when this task executes, use that newer stable after the same compatibility gates.
- Update the package manifest + lockfile coherently; avoid a stale loose range that leaves the tested binary ambiguous.
- Record the exact Electron/Chromium/Node/V8 runtime versions in the build evidence.
- Exercise Enderloom's existing Electron self-test, UI acceptance, native chrome, browser/provider login, download, extension, titlebar, media, split-view, launcher integration, and release/package paths after the upgrade.
- Fix migration fallout forward rather than downgrading simply to avoid repairs.
- Validate the new download-origin/session APIs used by T004/T025, including initiator origin/frame data when available.
- Verify Windows startup, hidden/ready-to-show behavior, DevTools, save dialogs, draggable regions/custom title bar, browser tabs, and GPU rendering on the packaged build.
- Preserve all existing persistent profile data and browser sessions through the Electron upgrade.

### T027 — Persistent/resumable Downloads and Chrome-normal save behavior

- [ ] **T027** · Make interrupted downloads, save locations, and history behave like a real browser

- Persist download history and terminal state outside replaceable application binaries.
- Preserve enough legitimate metadata for interrupted/cancelled downloads to resume after restart when the server/session supports it; use Electron's supported interrupted-download/resume mechanisms rather than inventing a fake completed state.
- If a signed/expiring provider URL cannot resume after restart, reacquire it through the provider adapter while preserving the logical transfer/install transaction.
- Keep partial files explicitly marked and never expose them as a successful final artifact.
- Support a configurable default Downloads folder plus **Ask where to save each file**.
- Respect Content-Disposition and MIME metadata, sanitize filenames, handle same-name collisions predictably, write to partial/temp state, and atomically finalize.
- Persist recent history independently from whether the user clears finished file rows from the pop-out.
- A browser reload/tab close must not silently cancel unrelated active downloads.
- A full app shutdown should either preserve resumable state or clearly mark a transfer as interrupted/retryable on next launch.

### T028 — Proper browser tabs and new-window behavior

- [ ] **T028** · Make links, target=_blank, middle-click, Ctrl+click, and window.open behave like a polished tabbed browser

- Route ordinary foreground/background tab dispositions into Enderloom browser tabs.
- Preserve referrer/post/form semantics where Electron exposes them; do not break legitimate login/payment/provider flows by naïvely rewriting every popup as a GET.
- Allow an explicit **Open in New Window** path for pages that genuinely benefit from a separate window.
- Middle-click / Ctrl+click opens a background tab; normal target=_blank opens the expected foreground tab unless the site semantics require otherwise.
- Prevent remote content from choosing privileged BrowserWindow/webPreferences.
- Keep per-tab back/forward history, title, favicon, loading state, URL, zoom, mute/audible state, and current browser session identity.
- Opening provider/project links from Catalog/Mod Manager should reuse this same tab system instead of a second browser implementation.

### T045 — Make Browse/project opening effectively instant without reducing work

- [ ] **T045** · Eliminate Browse/open-project latency through better architecture, never by doing less work

**Observed failure:** opening **Browse**, switching Browse categories/providers, opening project cards/details, and other Browse-originated navigation can sit visibly loading for seconds. This is a release-blocking interaction-performance defect. The user-visible shell and already-known project data should appear effectively immediately; fresh remote enrichment must not hold navigation hostage.

**Zero-loss performance contract:** preserve the exact same or better project coverage, provider reconciliation, compatibility/dependency checks, artwork/media, descriptions, versions/files, favorites, installed state, provenance, update intelligence, security checks, and provider identity. Do **not** make Browse faster by removing providers, skipping metadata, lowering result counts, disabling validation, rendering less content permanently, hiding slow failures, or postponing required correctness forever. Speed must come from architecture and scheduling.

#### Research basis to copy/improve, not cargo-cult

- **Modrinth's current open-source app/frontend is the inspectable reference implementation.** It uses a persistent app cache with typed cache entries, provider/project/search/version caches, and different expiries; its app frontend uses cached project/search/version helpers and parallel loading; its web discovery page warms project caches for visible results and begins project/detail prefetch after a short hover dwell before the click.
- Verified Modrinth patterns worth adopting/improving:
  - persistent cache for project/project-v3/version/search metadata rather than fetching from scratch on every open;
  - separate TTL/invalidation by data class instead of one global freshness rule;
  - batching helpers such as project/version-many rather than N serial calls;
  - parallel independent metadata fetches;
  - stale-while-revalidate behavior for browse/search data;
  - visible-card cache warming and intent prefetch before navigation;
  - avoid carrying/rendering fields that the current surface cannot use until needed.
- **CurseForge desktop internals are not assumed to be open source.** Treat its installed/current client as a black-box UX/performance benchmark: measure the same cold/warm Browse -> project workflows and beat its median user-visible latency without claiming undocumented internal implementation details.
- Re-check current Modrinth/CurseForge behavior immediately before implementation so stale research does not become the architecture.

#### Required architecture

1. **Instant shell + cache-first navigation**
   - Route changes and project-card clicks commit immediately; never wait for provider network requests before showing the destination shell.
   - Hydrate the new view synchronously from the canonical local cache/database when any prior-known project/search/provider data exists.
   - Keep the previous usable Browse result set visible during compatible filter/provider refresh instead of blanking the screen into a spinner.
   - Use skeletons only for fields genuinely unknown locally; never replace already-known data with skeletons while revalidating.

2. **Persistent normalized Browse cache**
   - Add/repair a durable normalized cache keyed by canonical project/provider IDs and immutable release/file IDs, not display names.
   - Cache separately: browse/search result summaries, project core metadata, provider mappings, descriptions, media manifests, compatibility facets, release/version summaries, dependency relations, installed/favorite state projections, and artwork metadata.
   - Give each data class an evidence-based TTL/invalidation policy. Immutable/hash-addressed metadata can be retained aggressively; mutable project/search data refreshes more often.
   - Persist cache outside replaceable app binaries and retain valid cache across normal Enderloom upgrades.
   - Use schema/version migrations instead of deleting the entire cache on every app update.

3. **Stale-while-revalidate, with precise invalidation**
   - Serve last-verified local data immediately when safe, then refresh in the background.
   - Revalidate only data whose TTL, ETag/Last-Modified/provider revision, dependency, target instance, loader/game-version context, or user action makes it stale.
   - Do not full-rescan every instance or every provider when opening one project.
   - When fresh data arrives, patch only changed fields/rows instead of rebuilding the whole Browse view.
   - Show a subtle stale/revalidating indicator only when meaningful; do not block interaction.

4. **Intent-driven prefetch**
   - Warm the next likely project before click from **hover/focus**, keyboard selection, visible-card ranking, recently used/favorite projects, and provider-source hover.
   - Use a short dwell/intent threshold so simply moving the pointer across a grid does not DDOS providers.
   - Prefetch the minimum high-value project bundle first: canonical project identity, summary/core metadata, current compatible release summary, provider mappings, icon/artwork, and installed/favorite projection.
   - Once bandwidth/CPU are idle, opportunistically prefetch secondary detail such as gallery/media, changelog preview, dependency graph, and alternate provider pages.
   - Cancel/deprioritize speculative work when intent changes. User-initiated navigation always outranks background prefetch.

5. **Request graph, batching, single-flight, and bounded concurrency**
   - Replace serial provider waterfalls with a dependency-aware request DAG.
   - Batch provider endpoints where supported (project-many/version-many/hash-many) and batch local DB reads.
   - Coalesce identical in-flight requests so multiple cards/detail panes never fetch the same entity independently.
   - Run independent providers/metadata branches concurrently with per-provider concurrency/rate limits.
   - Maintain per-provider circuit/degraded state so one slow provider does not stall already-available data from the others.
   - Reuse resolved dependency/compatibility/provider identity work instead of recomputing it on every view transition.

6. **Keep expensive work off the renderer/UI thread**
   - Network parsing, archive/hash work, compatibility resolution, provider reconciliation, large JSON transforms, image decoding/resizing, and DB work must not block Electron's renderer event loop.
   - Move CPU-heavy canonicalization/indexing to worker/native/main-process services as appropriate.
   - Avoid synchronous filesystem calls and giant IPC payloads in navigation hot paths.
   - Pass compact normalized records/deltas across IPC rather than full duplicated provider payloads.
   - Profile long tasks, layout/reflow, image decode, GC, IPC serialization, DB locks, and provider waterfalls; fix the measured owners rather than guessing.

7. **Fast image/icon/media path**
   - Cache project icons/artwork by stable URL/hash with decoded-size variants appropriate to card/detail use.
   - Paint a locally cached icon immediately and swap only when a verified newer asset arrives.
   - Lazy-load below-fold gallery/media, but never omit it from the project; it must appear as the user reaches it.
   - Avoid decoding full-resolution hero/gallery assets merely to draw tiny cards.
   - Do not let broken/slow media delay text/project controls.

8. **Browse search/filter/sort must be local-first where semantics allow**
   - Debounce only remote query issuance, not keystroke/UI feedback.
   - Filter/sort already-loaded logical results immediately in local state.
   - Cache query+facet pages with canonical query keys and reuse them on back/forward.
   - Preserve scroll position, selected card, filters, sort, provider/source choice, and current instance context.
   - Under virtualization/pagination, counts/search/filter/bulk semantics must still represent the promised logical dataset, not only rendered rows.

9. **Pre-open from likely navigation origins**
   - Favorites, My Modpacks, recent projects, update lists, Addons, provider-source chips, and instance content should all be able to hand Browse a canonical project seed so the destination can paint immediately.
   - Never throw away data already present on the source card just to refetch the same title/icon/summary after navigation.
   - Back/forward should restore the previous view from memory/cache immediately and then revalidate only if needed.

10. **No global loading lock**
    - Replace giant page-level loading booleans with field/section-level readiness.
    - Primary actions that are already safe from cached/canonical state remain usable while secondary enrichment runs.
    - A slow GitHub/CurseForge/Modrinth secondary source cannot block the rest of the project page.
    - A failed optional enrichment branch shows its own retry/error state while preserving the usable page.

11. **Instrumentation and evidence**
    - Add trace spans/metrics for: click -> route commit, click -> first meaningful paint, click -> cached project shell, click -> primary actions usable, click -> all above-fold data settled, click -> full enrichment settled.
    - Attribute time to local DB, cache miss, each provider, IPC, parsing, compatibility, reconciliation, image decode, render/layout, and background prefetch.
    - Record cold cache, warm cache, offline cache, degraded-one-provider, and 250/1,000/10,000-result Browse cases.
    - Keep instrumentation cheap in production and detailed enough to regress-test performance.

#### Hard performance acceptance

Use the **same machine, network, instance context, project set, and equivalent result coverage** for comparisons. Do not benchmark an artificially simplified Enderloom workload.

- **Warm Browse/category reopen:** destination shell + cached results should be perceptually instant; target **<=100 ms median click-to-meaningful-paint** and **<=150 ms p95** where data is already cached locally.
- **Warm project detail open from a visible card:** target **<=100 ms median** to cached core content/usable controls and **<=200 ms p95**, with background revalidation not blocking input.
- **Cold project open:** route/shell must still paint immediately; first useful provider-backed content should beat the current baseline materially and must be measurably faster than **both** comparable CurseForge and Modrinth client medians for the same project/result scope.
- **Back/forward restoration:** target **<=50 ms median** to restore prior cached Browse/project state.
- **UI thread:** no navigation-triggered long task >50 ms without a documented platform exception; eliminate repeated long tasks from normal Browse opens.
- **Zero-loss equivalence:** cached/optimized result counts, provider badges, compatible release selection, dependency closure, provenance, descriptions/media, and user-visible project actions must reconcile to the unoptimized authoritative result after background refresh.
- If these targets expose a platform/provider lower bound that cannot be met for uncached remote completion, keep the instant cached shell requirement and profile/optimize until no Enderloom-owned serial/network/IPC/render work unnecessarily extends the critical path. Do not weaken the target merely because the first implementation misses it.

#### Required regression fixtures

- warm Browse -> project -> back -> same project;
- cold Browse -> project with empty local cache;
- cached project while fully offline;
- one provider delayed by 3-5 s while another responds immediately;
- provider timeout/error with usable cached data;
- project with Modrinth + CurseForge + GitHub sources;
- project with large description/gallery/version history;
- 250 / 1,000 / 10,000 logical browse results with virtualization;
- rapid hover across many cards proving bounded prefetch/cancellation;
- rapid click A -> B -> A proving stale responses cannot overwrite current intent;
- repeated opening of the same card proving single-flight/cache reuse;
- restart proving persistent cache still gives immediate warm open;
- provider metadata change proving stale data updates without full-page blanking;
- exact same workflows timed against current CurseForge and Modrinth clients on the same machine/network.

**Hard acceptance path:** launch packaged Enderloom -> open Browse -> click among several visible projects rapidly -> every destination shell/known content appears immediately -> no full-page spinner or renderer stall -> back/forward restores instantly -> disconnect network and reopen a previously visited project successfully from cache -> reconnect and observe background revalidation patch changed data only -> throttle one provider and verify the other provider/cached page stays usable -> compare cold/warm timings and complete result coverage against CurseForge/Modrinth -> keep profiling/repairing until Enderloom is measurably faster than both clients on equivalent user-visible Browse/project latency **and** exposes more useful aggregate coverage/capability with no content/correctness regression.

### T046 — Reconcile the same logical project across Modrinth and CurseForge

- [ ] **T046** · Canonical cross-provider project identity must discover and join alternate provider pages without false duplication

**Observed failure:** a project opened from one provider can fail to expose its real listing on the other provider. The concrete regression is **Punchy!**: CurseForge presents **“Punchy! - First person animations”** while Modrinth presents **“Punchy!”**. Enderloom must recognize those as the same logical project when the identity evidence supports it rather than requiring display titles to be byte-for-byte identical.

Required behavior:

- Resolve alternate Modrinth/CurseForge listings asynchronously after the current project shell is already usable; mirror discovery must never block navigation.
- Use stable provider IDs/provenance first when already known. When a direct provider binding is not yet known, use a conservative identity pipeline that can tolerate provider title/subtitle drift and verifies independent evidence such as matching author/owner identity, source/upstream identity, hashes/release overlap, or another strong canonical signal.
- Never join projects merely because names are vaguely similar. Ambiguous candidates remain separate/unresolved until stronger evidence exists.
- Search fallback must handle provider naming differences (for example a long CurseForge subtitle versus a shorter Modrinth title) rather than concluding the alternate page does not exist after one exact-title miss.
- Cache confirmed provider mappings and single-flight repeated resolution so hover/prefetch/project rendering do not duplicate the same network work.
- Once reconciled, show compact provider chips/rows for every confirmed source and switching provider keeps the same logical project context/target instance.
- Provider switching must reuse the same cache-first project path from T045; the alternate provider should seed immediately from the matched search summary while its full details revalidate.
- Preserve provider-specific descriptions, downloads, versions/files, galleries, categories, licenses, and URLs. Canonical identity joins the project; it does not flatten or discard provider-specific data.
- Add a permanent regression fixture for **CurseForge `Punchy! - First person animations` by `DevPunchyMan` <-> Modrinth `Punchy!` by `DevPunchyMan`** so this exact failure cannot return.
- Failure to access one provider is `unresolved-active`, not proof that no mirror exists; keep the working provider page fully usable and retry only through a materially different/fresh route.

**Hard acceptance path:** open Punchy from CurseForge -> Enderloom paints the CurseForge page immediately -> Modrinth is discovered as the same project without user search -> click Modrinth -> its cached summary paints immediately and full Modrinth details enrich in place -> switch back to CurseForge -> no refetch waterfall/full-page spinner -> repeat from Modrinth first -> both directions resolve to the same logical project -> verify a deliberately similar-name/different-author control does **not** merge.
### T044 — Make GitHub a first-class embedded Browse provider surface with tear-off/new-tab promotion

- [ ] **T044** · GitHub opens directly inside Browse like Modrinth/CurseForge, with compact promotion into a normal Enderloom tab

**Observed gap:** the project source row can expose **GitHub** beside Modrinth/CurseForge, but GitHub must not stop at a hyperlink that ejects the user from the integrated browsing flow.

Required behavior:

- When the canonical project identity has a verified GitHub/upstream repository, selecting the **GitHub** provider/source tab loads the exact canonical repository/page **inside the current Browse project surface**, just as the in-app Modrinth/CurseForge provider views do.
- Keep the normal Enderloom project shell and compact source row available while GitHub is active so the user can switch among **Modrinth / CurseForge / GitHub** without losing project identity or returning through a separate workflow.
- Render GitHub through Enderloom's real browser/WebContentsView tab infrastructure rather than an iframe or scraped imitation. GitHub CSP/X-Frame restrictions must therefore not degrade the feature into a dead placeholder.
- Preserve the exact current GitHub URL, navigation history, favicon/title/loading state, back/forward state, zoom, authentication/session profile, and download initiator context supported by the shared browser model.
- Add one compact, unobtrusive **Open in New Tab** icon/button in the provider-view chrome/source-row area when a provider page is active. It must have a tooltip/accessibility name, remain out of the content's way, and promote the **current exact page** into a normal top-level Enderloom browser tab.
- Support direct tear-off/promotion by dragging the provider source tab/chip upward onto the main/top browser tab strip. Crossing the real tab-strip drop target promotes that provider view into a normal Enderloom tab; cancelling or dropping elsewhere leaves the current page exactly where it was.
- Drag promotion must have a sensible movement threshold and visible drop affordance so ordinary clicks do not accidentally create tabs. Keyboard/mouse users must always have the explicit **Open in New Tab** control as the non-drag equivalent.
- Reuse **T028** for tab creation/disposition, **T029** for restore/reopen behavior, **T031** for context-menu equivalents, and the canonical browser session/profile. Do not build a GitHub-only tab/window implementation.
- Generalize the promotion action to provider source tabs where technically applicable so Modrinth/CurseForge/GitHub behave consistently, while the missing first-class GitHub embedding is the required regression target.
- A promoted provider page must remain a real Enderloom browser tab: reorderable/closable like other tabs, eligible for Ctrl+Shift+T/session restore, and capable of opening its own links/downloads through the normal browser/download systems.
- Remote GitHub content remains untrusted. Never expose Node/Electron privileged APIs or Enderloom mutation operations to the page; use the same isolation, navigation, permission, external-protocol, and hostile-page protections required elsewhere in G002/T043.
- Provider-page downloads route through **T004/T025/T027** instead of bypassing Enderloom's download history, provenance, save, resume, and verification behavior.
- If the verified GitHub repository is temporarily unavailable, show the normal in-pane browser error/retry state while preserving the canonical source binding. Do not silently demote the project to an unlinked record or replace the requested in-app view with a generic external-browser redirect.
- Do not display a fake/guessed GitHub tab. The source appears as first-class only when canonical identity/upstream evidence resolves the repository with sufficient confidence.

**Hard acceptance path:** open a project in **Browse** with Modrinth/CurseForge/GitHub sources -> click **GitHub** -> the exact GitHub repository renders in the existing Browse content area -> navigate to a deeper GitHub page -> use the compact **Open in New Tab** control -> a normal Enderloom tab opens on that exact page/session -> return and repeat by dragging the GitHub source tab/chip onto the top tab strip -> promotion succeeds without losing navigation/project state -> close/reopen through Ctrl+Shift+T -> downloads/back/forward continue through the shared browser model.

### T029 — Recently closed tabs and session/crash restore

- [ ] **T029** · Add Ctrl+Shift+T, recently closed tabs, and durable browser-session restore

- Track recently closed browser tabs/windows with enough safe navigation state to reopen them.
- **Ctrl+Shift+T** restores the most recently closed tab and continues backward through the recent stack.
- On normal restart, restore the prior browser workspace according to a user setting.
- After a crash/forced close, offer automatic safe recovery of the prior browser session without losing Enderloom's non-browser workspace.
- Restore the active tab, tab order, pinned/important state if implemented, and navigation URL/history where practical.
- Do not restore one-time sensitive POST bodies, file upload selections, or secrets blindly.

### T030 — Real browser History

- [ ] **T030** · Add searchable browser history with Ctrl+H and sane privacy controls

- Record normal navigations with URL, title, timestamp, favicon/origin metadata where appropriate.
- **Ctrl+H** opens a proper History surface.
- Search/filter history, open a result in the current/new tab, remove individual entries, and clear by time range/all history.
- Deduplicate noisy same-document/hash changes where appropriate without losing meaningful visits.
- Respect private/ephemeral browsing contexts if Enderloom adds them; do not leak them into durable history.
- Clearing history must not erase unrelated favorites, provider identities, downloads, or authenticated cookies unless the user explicitly selects those data classes.

### T031 — Chrome-quality context menus

- [ ] **T031** · Add contextual browser menus instead of generic app-only right-click behavior

Where relevant expose: Back, Forward, Reload, Stop, Open Link in New Tab, Open Link in New Window, Copy Link, Save Link As, Open Image in New Tab, Copy Image, Save Image As, text Copy/Cut/Paste/Select All, spelling suggestions, and optional Inspect for developer mode.

- Use Electron/Chromium context metadata rather than DOM text guessing.
- Disable impossible actions instead of hiding state misleadingly.
- Route Save Link/Image through the canonical T004 download manager.
- Keep dangerous external-protocol handling behind the security policy in T043.

### T032 — Find-in-page and complete browser hotkey parity

- [ ] **T032** · Implement real find-in-page plus normal browser navigation shortcuts

At minimum support where appropriate:

- **Ctrl+F** find in page;
- **Enter/F3** next result and **Shift+Enter/Shift+F3** previous;
- Escape closes find;
- **Ctrl+L** focus/select omnibox;
- **Ctrl+T** new tab;
- **Ctrl+W** close tab;
- **Ctrl+Shift+T** reopen closed tab;
- **Ctrl+Tab / Ctrl+Shift+Tab** tab cycling;
- **Ctrl++ / Ctrl+- / Ctrl+0** zoom;
- **F5 / Ctrl+R** reload;
- **Alt+Left / Alt+Right** back/forward;
- **F11** fullscreen;
- **Ctrl+J** Downloads;
- **Ctrl+H** History.

Integrate with Enderloom's canonical Hotkeys system so conflicts are visible/remappable instead of being silently hardcoded.

### T033 — Omnibox/location bar polish

- [ ] **T033** · Make the address/search bar behave like a real browser omnibox

- Correctly distinguish URLs, hostnames, searches, pasted text, local/internal Enderloom routes, and supported custom/provider URLs.
- Support paste-and-go/paste-and-search.
- Show clean current URL and page security/origin context without spoofable site-controlled chrome.
- Autocomplete from safe local history, open tabs, favorites/bookmarks/provider projects, and explicit search suggestions where configured.
- Keyboard Up/Down selects candidates; Enter navigates; Escape restores current URL.
- Copy URL should copy a clean canonical URL, not transient internal wrapper routes where avoidable.
- Preserve exact logged-in/provider session behavior when navigating.

### T034 — Chrome-like site-permission bubble and per-origin permission state

- [ ] **T034** · Own camera/microphone/notification/clipboard/etc. permissions with contextual prompts

- Never rely on permissive Chromium defaults for remote content.
- Show a compact contextual permission bubble tied to the requesting origin and current tab.
- Support Allow once / Allow while using / Remember Allow or Block where the underlying capability safely permits.
- Expose per-origin permission state and a way to reset it.
- Handle camera, microphone, notifications, clipboard, display/media capture, MIDI/serial/USB/Bluetooth/file-system access and other Electron-exposed permission families according to actual support.
- A background/inactive tab cannot spoof a foreground permission prompt.
- Permission state survives restart only where explicitly remembered.

### T035 — Tab/renderer/GPU child-process crash recovery

- [ ] **T035** · Recover the affected browser surface instead of destabilizing Enderloom

- Detect renderer gone/unresponsive/load-failed/GPU or relevant child-process failures.
- Replace only the affected tab/view with a clear recoverable error state and **Reload** action where possible.
- Preserve tab URL/history/title and unaffected tabs.
- Avoid infinite reload loops; repeated crashes surface diagnostics/evidence.
- Repeated provider/browser crashes become regression fixtures.
- Enderloom's launcher/mod-manager core must remain usable even if an external webpage crashes.

### T036 — Migrate embedded browsing to WebContentsView/current Electron primitives

- [ ] **T036** · Use WebContentsView for embedded remote browsing wherever legacy BrowserView/webview architecture remains

- Inspect the actual current browser embedding implementation once.
- If it already uses `WebContentsView`, verify it and close this as proven rather than rewriting it.
- If it uses deprecated `BrowserView` or the discouraged `<webview>` path for the main browser surface, migrate to `WebContentsView` while preserving session, navigation, tabs, split layout, sizing, focus, keyboard, media, downloads, auth and DevTools behavior.
- Centralize view lifecycle/ownership so hidden/dead views cannot retain stale privileged references.
- Do not perform this migration as a visual rewrite; preserve current accepted Enderloom shell UX while modernizing the browser substrate.

### T037 — Native window-state persistence

- [ ] **T037** · Persist/restore window bounds and display state with current Electron-supported behavior

- Preserve main-window size, position, maximized/fullscreen state, and sensible multi-monitor placement across restart.
- Clamp stale/off-screen bounds after monitor topology/DPI changes.
- Avoid writing resize state on every pixel event; persist coherent settled state.
- Keep window-state persistence separate from tab/browser history so clearing one does not erase the other.
- Prefer current Electron-native capabilities where they satisfy the behavior rather than maintaining fragile duplicate code.

### T038 — Durable browser profile plus honest extension compatibility/lifecycle

- [ ] **T038** · Make the persistent Chromium profile and extensions survive Enderloom upgrades correctly

- Keep cookies, local/session storage where applicable, cache policy, permissions, history, downloads, extension state and relevant browser preferences in the durable Enderloom profile, not packaged app files.
- Preserve authenticated provider sessions across Enderloom upgrades unless the provider invalidates them.
- Electron extensions must use persistent sessions.
- Restore enabled unpacked extensions on every boot through the current Electron extension API; do not assume Electron remembers them automatically.
- Show extension compatibility as **Compatible / Partial / Unsupported API** based on Electron's actual supported API surface and observed load warnings.
- Do not claim Chrome Web Store/full Chrome-extension parity that Electron does not provide.
- Do not silently copy secrets/cookies/extensions from another browser profile.

### T039 — Native-feeling load, navigation, offline, certificate, and error states

- [ ] **T039** · Make navigation state obvious without modal spam

- Show favicon/loading spinner or equivalent compact activity indication while navigating.
- Toolbar Reload becomes Stop while actively loading, then returns to Reload.
- Back/Forward enabled state reflects the active tab's real navigation history.
- Provide clear inline error pages for offline/DNS/TLS/certificate/connection/load failures with Retry and diagnostics/context actions.
- Certificate/security errors must not be silently bypassed.
- Restore normal content without layout jumps when navigation succeeds.
- Authentication redirects/popups must remain attached to the originating browser context.

### T040 — Picture-in-picture, media controls, mute/audible state

- [ ] **T040** · Add browser-grade media behavior where Chromium/Electron supports it

- Expose per-tab audible/muted state and quick mute/unmute.
- Support picture-in-picture/native media behavior where available without reimplementing site players.
- Honor site/user autoplay policy and never surprise-play audio.
- Preserve media state appropriately across tab switching.
- Do not allow background media to steal global shortcuts or spawn uncontrolled windows.

### T041 — Browser/download/import drag-and-drop polish

- [ ] **T041** · Make drag/drop routes predictable and useful

- Drag URLs/text into the omnibox/tab strip where appropriate.
- Drag completed downloaded files out from the Downloads bubble/full Downloads surface using supported OS drag behavior.
- Dropping supported Minecraft mods/addons/datapacks/resource packs/shaders/config bundles/worlds onto Enderloom routes into the universal importer/typed installer rather than blindly opening/executing them.
- Reject dangerous/unrecognized drops safely while preserving the original file.
- Provide keyboard alternatives for drag-only actions.

### T042 — Windows-native download/browser integration

- [ ] **T042** · Integrate meaningful download/browser state with Windows

- Reflect active aggregate download progress through the Windows taskbar progress indicator where appropriate.
- On download completion, optionally show a restrained native notification when enabled; do not notify for invisible provider metadata requests.
- Notification click opens/reveals the relevant download/project safely.
- **Show in Folder** uses Explorer reveal/select, not file execution.
- Save/Open dialogs use native Windows behavior and preserve the requesting tab/download context.
- Verify high-DPI/multi-monitor positioning for the Downloads bubble and permission/context pop-outs.

### T043 — Browser security hardening while adding Chrome-like capability

- [ ] **T043** · Preserve strong Electron security boundaries for every browser feature above

- Keep remote pages sandboxed with Node integration disabled and context isolation enabled.
- Expose only narrow validated preload/contextBridge operations.
- Validate IPC senders/origins for privileged actions.
- Own permission requests explicitly (T034).
- Route `window.open` / target=_blank through the tab/window policy (T028) and deny unexpected privileged creation.
- Never pass arbitrary remote URLs straight to `shell.openExternal`; allowlist safe protocols/origins/actions.
- Prevent remote content from choosing privileged webPreferences, preload paths, file URLs or internal Enderloom routes.
- Keep navigation/protocol handlers path-safe and origin-aware.
- Preserve secure storage for tokens/cookies/provider credentials.
- Add negative regression fixtures proving a hostile webpage cannot invoke filesystem/install/launcher/provider privileged operations through the browser shell.

**Explicit exclusions requested by the user:** do **not** add browser tab memory-suspension/management work and do **not** add a browser task-manager feature as part of this queue.


---

## G003 — User/profile state survives updates and restarts

- [ ] **G003 · GATE** — User/profile state survives updates and restarts

### T006 — Stop Enderloom upgrades from losing the user's profile

- [ ] **T006** · Stop Enderloom upgrades from losing the user's profile

Separate durable user/profile data from replaceable app files and add atomic schema migration + rollback backup.

At minimum preserve:

- favorites and cross-provider merged identity;
- notes/tags/collections;
- provider bindings and connected-in-place instances;
- instance artwork/user overrides;
- browser profile + extensions;
- settings;
- UI preferences/layout;
- recent/default launch target;
- recent/default install instance;
- freeze/pin/update preferences;
- logs/history metadata that is intentionally durable.

Regression-test a real prior packaged build -> current packaged build migration, including crash/interruption during migration and rollback/retry.

---

## G004 — Instance launching and presentation are polished

- [ ] **G004 · GATE** — Instance launching and presentation are polished

### T007 — Launch any connected instance in place through Internal, CurseForge, or Modrinth

- [ ] **T007** · Launch any connected instance in place through Internal, CurseForge, or Modrinth

Every compatible connected instance exposes a compact launcher chooser:

- **Internal**
- **CurseForge app**
- **Modrinth app**

Use canonical physical path + provider profile identifiers, supported launcher handoff/deep-link behavior, or a transparent in-place registration/link/junction when a launcher requires one. Do **not** copy, move, clone, duplicate, reshuffle, or temporarily rewrite the instance merely to launch it.

Remember the per-instance preferred launcher. Exhaust the supported no-copy/no-move integration routes before declaring an external launcher unavailable; if a provider client itself still prevents launching that physical profile, record the exact provider limitation and keep Internal available without changing the instance's files.

### T008 — Carry over real provider instance artwork

- [ ] **T008** · Carry over real provider instance artwork

When a connected CurseForge or Modrinth profile has real saved/project artwork, import/cache and display that exact art with provider/source provenance.

- Preserve user-selected artwork overrides.
- Refresh provider artwork without erasing an override.
- Never synthesize replacement artwork.

### T009 — Compact the oversized instance hero/header

- [ ] **T009** · Compact the oversized instance hero/header

Keep the attractive artwork, but bound the responsive hero height so it never consumes most of the useful viewport.

- Keep instance identity/status + primary actions visible.
- Leave useful tabs/content above the fold on common desktop heights.
- Collapse further on short-height windows.
- Avoid layout jumps while artwork loads.

### T010 — Redesign the top bar to be denser, sleeker, and more coherent

- [ ] **T010** · Redesign the top bar to be denser, sleeker, and more coherent

Reduce redundant chrome, borders, spacing, and competing controls.

Unify Catalog / Mod Manager / instance / embedded-browser context while preserving fast access to:

- back/forward;
- refresh;
- current instance/context;
- split/browser actions;
- primary contextual action;
- account/provider state when relevant.

Do not turn the header into a second content panel.

---

## G005 — Favorites/catalog identity and quick actions are clean

- [ ] **G005 · GATE** — Favorites/catalog identity and quick actions are clean

### T011 — Compact + button on favorite/mod cards for direct install

- [ ] **T011** · Compact + button on favorite/mod cards for direct install

Add a small polished **+** action on favorite/catalog cards.

- If the most recent/default compatible instance is unambiguous, allow one-click install.
- Otherwise open a tiny searchable instance picker.
- Reuse the normal dependency, compatibility, snapshot/risk, staged install, and verification transaction.
- Never bypass the canonical install operation for speed.

### T012 — Merge duplicate favorites across CurseForge/Modrinth/other providers

- [ ] **T012** · Merge duplicate favorites across CurseForge/Modrinth/other providers

A logical mod/project appearing on multiple providers must show as **one canonical favorite card** with provider badges/source options, matching the rest of Enderloom's cross-provider identity behavior.

- Merge using stable provider/project identity, upstream links, hashes, metadata/evidence, and explicit mappings.
- Do not merge unrelated same-name projects.
- Preserve each provider's project URL, release availability, and source preference.
- Discovering another source for an already-favorited project must not create a duplicate favorite.

### T013 — MCreator candidates become a compact filter, not a permanent banner

- [ ] **T013** · MCreator candidates become a compact filter, not a permanent banner

Remove the full-width MCreator candidate strip from the normal Mod Manager layout.

- Expose MCreator detection as a compact filter/chip/badge.
- Only render candidate-specific details when the filter is active or matching records exist.
- Zero candidates should consume effectively zero vertical space.
- Keep the evidence explaining why a mod is considered a candidate inside the filtered/detail view.

---

## G006 — Files, logs, addons, and guided installs act like desktop software

- [ ] **G006 · GATE** — Files, logs, addons, and guided installs act like desktop software

### T014 — Add a first-class Logs tab

- [ ] **T014** · Add a first-class Logs tab

Add a compact instance **Logs** tab covering applicable:

- latest.log;
- debug.log;
- launcher/native logs;
- crash reports;
- Enderloom operation logs;
- server logs.

Include follow/tail, search, severity/source filters, copy/export, open containing folder, and direct evidence/diagnostic backlinks. Missing optional logs should be an empty state, not an error.

### T015 — Fix “Show file” — reveal and select, do not open/execute

- [ ] **T015** · Fix “Show file” — reveal and select, do not open/execute

**Show file** must open the OS file manager at the containing folder and select/highlight the exact file.

Keep **Open** as a separate explicit action where opening the file is appropriate.

Test Windows Explorer behavior at minimum, including paths with spaces/unicode and files in connected external launcher profiles.

### T016 — One universal guided-install engine

- [ ] **T016** · One universal guided-install engine

Replace narrow/siloed guided-install cards with one canonical flow for recognized installable Minecraft content. **Provider-backed content must enter this same flow from its online project/file page exactly like a normal mod install; “guided install” is a typed installation behavior, not a separate collection or alternate UI.**

Recognized content includes, as applicable:

- mods;
- addons;
- datapacks;
- resource packs;
- shaders;
- configs/config bundles;
- worlds;
- scripts;
- server/plugin content;
- other already-supported typed content.

Flow:

`detect -> classify -> choose target instance -> preview destination/dependencies/compatibility -> stage -> commit -> verify -> rollback on failure`

Use the same canonical operation graph as normal installs; no private installer islands.

### T017 — Stop classifying random JSON/ZIP files as addons

- [ ] **T017** · Stop classifying random JSON/ZIP files as addons

Do not treat extension alone as proof of an installable content type.

Inspect archive/root structure and authoritative manifests/metadata, e.g. loader metadata, pack metadata, known addon/config schemas, required asset/layout markers, and existing provider classification.

- Unknown/generic `.json` or `.zip` stays a generic download/import candidate.
- It must not pollute the Addons collection.
- Every positive classification should retain evidence explaining *why* the file is that content type.
- When the file corresponds to a real online project/release, classification must preserve/link that canonical provider project + exact provider file identity instead of reducing it to a filesystem-only addon.
- Ambiguous files stay unresolved/generic rather than being forced into the wrong category.
- A private/local addon with no provider record remains supported as **Local / Unlinked**; never fabricate a provider match just to make the UI look complete.

Regression fixtures must include real recognized addon/datapack/config ZIPs plus unrelated JSON, source ZIPs, documentation ZIPs, arbitrary archives, and nested/malformed archives.

### T023 — Provider-backed addon discovery, identity, download, update, and dependency lifecycle

- [ ] **T023** · Make addons/customizations resolve to real online projects and release files just like mods

Treat CurseForge **Customization** projects, Modrinth content types, and other supported provider-hosted addon families as first-class catalog projects rather than anonymous ZIP/JSON files.

Required canonical flow:

`local/provider candidate -> identify project -> identify exact provider file/release -> normalize compatibility/dependencies -> choose target instance -> download through normal provider pipeline -> typed destination install -> verify -> retain provider provenance -> update/favorite/freeze/remove through the same lifecycle`

Implementation requirements:

- Use the shared provider adapters and canonical project identity graph already used by mods. Do not build a second addon-only provider database.
- Resolve provider identity using strongest available evidence: provider project/file IDs, provider API metadata, canonical project URL, file fingerprint/hash, exact release metadata, upstream/source links, dependency/relations data, and known content-family manifests. Filename/display-name matching alone is insufficient.
- If an existing local addon is not yet linked, research supported providers for candidate project/files in the background. Auto-link only when the evidence is strong enough to avoid cross-project collisions; otherwise surface a compact **Link project / Research provider** action with candidate evidence.
- Once linked, retain provider/project/file IDs so subsequent refreshes do not have to rediscover identity from scratch.
- Provider-backed addon cards/details must expose the normal lifecycle: provider/source links, files/versions, compatible releases, dependencies/relations, changelog/release notes where available, favorite, update, freeze/pin, remove, reinstall/change-version, provenance, and **Open provider research**.
- Installation must use the selected real provider release/download, not a scraped arbitrary attachment. Validate redirects, expected filename/size/hash when available, compatibility, and dependency closure through the normal download/install transaction.
- Typed addon installers determine the correct destination **without pretending the artifact is a mod JAR**. For a recognized family such as TaCZ gunpacks, use the version/family adapter to install the provider-downloaded ZIP into the correct TaCZ content location for that target, preserving any required archive form.
- Online project descriptions/instructions may inform a typed adapter and evidence, but raw prose must never be blindly executed as filesystem commands.
- Detect required/strongly recommended host mods/libraries from provider relations plus validated project metadata/known family rules, and feed missing requirements into the same dependency planner used for normal mods.
- Update checks compare the installed provider file identity against compatible online provider releases. Updating replaces the prior addon artifact transactionally and preserves the logical project identity, just like T001 requires for mods.
- If a provider project disappears or is temporarily unreachable, preserve the installed addon, cached metadata, provider identity, and last-known release state; do not demote it into a random local file.
- Cross-provider duplicates of the same addon project collapse under one canonical project with source badges/options using the same identity rules as T012.
- Do not count arbitrary files inside `config/`, datapack folders, or addon working directories as separate “addons” merely because they are JSON/ZIP files.

**Required real regression fixture:** `https://www.curseforge.com/minecraft/customization/tacz-helldivers-escalation-of-freedom` (CurseForge project ID **1091118**) must resolve as one provider-backed customization/addon project, preserve its CurseForge project/file identity, show its compatible releases/files and relations, download a selected compatible provider file through the normal pipeline, and install it through the TaCZ-appropriate typed destination instead of `mods/`. The fixture must remain provider-linked after restart and must update from a later compatible provider file without becoming an anonymous ZIP.

### T024 — Addons must use the normal Mods-tab card/detail UI system

- [ ] **T024** · Replace the current addon collection/“guided install” presentation with Mods-tab-quality project browsing

The **Addons** tab is a content-type view over the same canonical project/catalog system as **Mods**. Reuse the normal Mods UI components and interaction language rather than maintaining a visually separate loose-file dashboard.

Required behavior:

- Same card/tile/list visual system as Mods: real project icon/artwork, title, concise installed/version state, provider badges, favorite state, update state, compact actions, and the same context-menu quality.
- Same search/sort/filter/view-toggle behavior and large-dataset virtualization semantics as Mods.
- Opening a provider-backed addon shows the same project-detail experience as a normal mod page: hero/icon, description, gallery/media when available, provider/source links, files/versions, changelog/release information, dependencies/relations, compatibility, install/update/change-version actions, favorite, provenance, and relevant “Why?” evidence.
- Keep type-specific information (for example **TaCZ gunpack**, destination, host-mod requirement, config bundle, datapack, shader) as compact metadata/badges/installation details inside the common project UI rather than replacing the page with an unrelated guided-install layout.
- Local/private content appears in the same cards/details with a clear **Local / Unlinked** badge and a provider-research/link action. It must not be pushed into a different ugly collection UI.
- The Addons count represents logical addon projects/content records, not every JSON/file found under an instance.
- Provider project pages, favorite state, updates, file/version picker, context menus, download progress, and install-to-instance chooser should feel and behave consistently across Mods and Addons.
- Reuse the same responsive spacing, compact headers, card density, keyboard/focus behavior, and navigation history as the Mods tab.
- No permanent full-width “guided install” cards or giant collection counters should consume the primary browsing area. Guidance appears only contextually when an install actually needs a typed destination/decision.

**UI acceptance fixture:** the TaCZ Helldivers CurseForge customization above must look and behave like a normal provider-backed project in Enderloom, differing from a mod page only where its content type/install semantics genuinely differ.

---

## G007 — Navigation and common desktop hotkeys feel native

- [ ] **G007 · GATE** — Navigation and common desktop hotkeys feel native

### T018 — F5 / Ctrl+R refresh everywhere it makes sense

- [ ] **T018** · F5 / Ctrl+R refresh everywhere it makes sense

- **F5** refreshes the current Enderloom view or embedded browser page.
- **Ctrl+R** behaves equivalently.
- Browser context performs normal page reload.
- Native Enderloom views refresh canonical data, not the entire application process.
- Preserve selection, filter, sort, scroll, and stable UI state when possible.
- Refresh must not repeat destructive actions, installs, updates, or form submissions.

### T019 — Add/verify standard navigation hotkeys

- [ ] **T019** · Add/verify standard navigation hotkeys

Where applicable, support platform-standard:

- back / forward;
- focus search;
- close tab;
- reopen closed tab;
- new tab;
- refresh;
- escape/cancel.

Route conflicts through the canonical Hotkeys system instead of hardcoding competing shortcuts.

---

## G011 — Discovery, repair, bulk management, and first-run workflows are better than both launchers

- [ ] **G011 · GATE** — Unified discovery, dependency repair, bulk mod management, first-run/account/create/import/clone flows, and native Mod/Instance actions are all production-wired, user-controlled, runtime-proven, and satisfy G010's strict faster-and-richer-than-both contract where technically comparable.

### T051 — Unified Discovery Supremacy

- [ ] **T051** · Make Enderloom discovery the fast canonical union of CurseForge + Modrinth + GitHub/upstream + every other supported provider, with more useful unique results than either launcher

Enderloom discovery must not behave like one provider search wearing a different skin. Build one canonical discovery layer that searches every enabled/supported source in parallel, reconciles the same logical project into one result, preserves source-specific detail, and returns a **larger useful deduplicated project/capability set than CurseForge or Modrinth individually** while still appearing faster.

Required behavior:

- Query supported CurseForge, Modrinth, verified GitHub/upstream, and other enabled provider adapters concurrently with per-provider rate limits, cancellation, circuit/degraded state, and single-flight coalescing.
- Search exact names, normalized aliases, subtitles, slugs, author/owner, provider IDs, known upstream/source identity, categories/tags, loader, game version, content type, and reasonable typo/fuzzy variants.
- A project present on multiple providers renders as **one canonical result** with compact source badges/options; provider duplicates never inflate the result count used to claim superiority.
- Preserve provider-specific files/releases, descriptions, galleries, changelogs, license/category metadata, dependencies/relations, download availability, update intelligence, and canonical URLs behind the merged project.
- Rank relevance intelligently across the canonical union without secretly favoring one provider. Explicit user sort/filter choices remain authoritative.
- Search/filter/sort/count/select-all semantics operate on the full logical dataset, not only the first page or rendered rows.
- Exhaust provider pagination/continuation until the requested discovery scope is terminal; reconcile expected/discovered/accepted/rejected/unresolved counts before claiming complete coverage.
- Return last-verified cached canonical results immediately, stream fresh provider additions/changes in place, and never blank the entire result set while one provider refreshes.
- Slow/offline/auth-expired providers cannot hide already-known or other-provider results; show truthful per-source degraded/reconnect state and continue.
- Persist confirmed cross-provider identity so repeat searches never rediscover obvious mappings from scratch.
- Prefetch high-value visible/hovered result details through the same T045 cache/intent architecture.
- Support direct provider/source switching without losing the unified result's project identity, search context, target instance, filter state, or scroll position.
- Keep discovery extensible: adding another provider adapter must automatically participate in canonical search/identity/coverage accounting instead of needing a separate UI silo.
- Measure **first useful result**, **full canonical result set**, unique useful project count, provider-source count, metadata richness, and interaction latency against both installed clients on the same queries/machine/network. A tie in speed or a smaller/equivalent useful aggregate result/capability set leaves T051 open.
- "More results" means more **relevant canonical projects/sources/releases/intelligence**, never duplicates, mirrors counted twice, irrelevant noise, broken results, or unsupported artifacts.

**Required regression fixtures:** exact-title project, subtitle drift, alias/rename, same-name different-author negative control, project on CurseForge+Modrinth+GitHub, project on only one provider, typo query, author query, provider outage, expired auth, 250/1,000/10,000 logical results, terminal pagination, and the existing Punchy! cross-provider fixture.

**Hard acceptance path:** enter one query -> cached canonical results appear immediately -> CurseForge/Modrinth/GitHub/other supported sources enrich in parallel -> duplicates collapse into one project with source badges -> typo/alias/author variations still resolve correctly -> slow provider does not block others -> filters/sort operate over the full logical set -> compare against both launchers and prove Enderloom is faster **and** exposes more useful deduplicated discovery coverage/capability.

### T052 — Instance Dependency Doctor with explicit Yes / No user control

- [ ] **T052** · Add an intelligent Instance Dependency Doctor that finds and explains problems automatically but never mutates the instance without an explicit Yes / No decision

The Doctor should make dependency repair feel automatic **without taking control away from the user**.

Detect at minimum:

- missing required dependencies/libraries;
- required dependency present but disabled;
- incompatible dependency version/range;
- wrong Minecraft version;
- wrong loader/platform;
- client-only/server-only side mismatch where metadata supports it;
- duplicate/superseded JARs or provider files for the same logical project;
- stale old-version artifacts left beside the current replacement;
- orphaned libraries no longer required by any installed project;
- dependency cycles/conflicting version constraints;
- missing host mods/frameworks for recognized addons/customizations;
- broken/unresolved provider identity that prevents reliable dependency/update decisions;
- dependency/provider metadata disagreements that require user review rather than guesswork.

User-control contract:

- Diagnosis may run automatically/cached in the background when cheap, but **no repair/install/update/downgrade/enable/disable/quarantine/remove action commits silently**.
- When a repair plan is ready, always show a compact decision surface with **Yes**, **No**, and **Review Details**.
- **Yes** applies the currently previewed recommended plan transactionally.
- **No** leaves the instance unchanged and dismisses/snoozes that proposal without nagging.
- **Review Details** shows every proposed change, reason/evidence, old -> new version/file/provider, dependency relationship, risk, and lets the user include/exclude individual items before returning to the same **Yes / No** decision.
- For grouped repairs, one Yes may approve the entire visible reviewed plan; independent failures do not silently expand the user's approval into additional changes.
- Never hide a destructive/downgrade/remove/quarantine operation inside a generic "Fix" button. The exact effect must be visible before Yes.
- Remember harmless UI preferences, but **do not remove the user's ability to choose Yes or No at the commit point** for a newly proposed mutation plan.
- If the app can prove no filesystem/provider mutation is required, it may resolve a purely diagnostic false-positive state without asking.

Repair engine:

- Reuse canonical provider identity, T001 transactional update semantics, T016 installer, T023 addon lifecycle, dependency planner, content-addressed download cache, snapshots, and rollback.
- Stage/download/verify all required artifacts before removing working live artifacts when possible.
- Quarantine replaced/removed suspect artifacts through T053 rather than permanently deleting them by default.
- Preserve configs, worlds, saves, screenshots, resource data, user notes, favorites, pins/freeze state, and unrelated content.
- Ambiguous fixes remain **Needs review / unresolved-active**; never invent a provider match or dependency version to make the screen green.
- Explain why each issue was detected and why the recommended fix satisfies the dependency graph.
- After commit, rescan only the affected graph/files, verify the problem is actually gone, and offer **Undo** when rollback is valid.
- Run quickly from persisted identity/index state; do not full-rescan/re-hash the entire instance on every Doctor open.

**Hard acceptance path:** open an instance with missing + wrong-version + duplicate + ambiguous dependency fixtures -> Doctor immediately shows known issues -> inspect recommended repair -> choose **No** and prove nothing changes -> reopen -> Review Details -> exclude one item -> choose **Yes** -> staged verified repair commits -> removed/replaced files are recoverable through quarantine/undo -> affected graph rechecks cleanly -> ambiguous item remains explicitly unresolved rather than guessed.

### T053 — Bulk Mod Manager + Undo / Quarantine

- [ ] **T053** · Add fast dependency-aware bulk actions across the full logical mod dataset with durable Undo and safe Quarantine

Required selection behavior:

- Ctrl+click toggle, Shift+click range, keyboard range/selection, **Ctrl+A selects the full filtered logical dataset**, not merely currently rendered rows.
- Selection survives virtualization and ordinary non-destructive sorting/filtering changes where identity remains valid.
- Show a compact selected-count/action bar without covering useful content.

Bulk actions must include where applicable:

- enable / disable;
- update;
- change version;
- reinstall / repair;
- pin/freeze / unpin;
- favorite / unfavorite;
- run Dependency Doctor on selection;
- reveal/show files;
- copy useful project/provider/file information;
- quarantine;
- remove/uninstall;
- restore from quarantine;
- retry failed operation items.

Safety / QoL:

- Bulk operations route through the same canonical domain services as single-item actions; no private shortcut logic.
- Before dependency-affecting or destructive bulk mutations, show exactly what will change, impacted dependents, required additions/replacements/removals, and a clear **Yes / No** confirmation.
- Allow per-item exclusion from the preview before Yes.
- Quarantine is the default safety route for removed/replaced suspect mod artifacts: move/retain them in Enderloom-managed recoverable storage with original path, project/file identity, reason, timestamp, and operation ID.
- Permanent deletion is a separate explicit action, never the hidden meaning of Quarantine.
- Preserve configs/worlds/saves and unrelated user data unless the user explicitly selects an operation that includes them.
- Maintain a durable operation history with **Undo** when the prior state can be restored safely; restart must not erase valid undo/quarantine metadata.
- Undo restores the exact prior enabled/disabled artifact/version/path/provider identity where possible and revalidates dependencies afterward.
- Partial failure is per-item: successful independent items remain truthful, failed items retain the old state or rollback, and the final result clearly lists each outcome.
- Cancel stops not-yet-committed independent work safely; it never leaves half-renamed live JARs presented as success.
- Large selections must remain responsive through virtualization, batched domain operations, bounded concurrency, and incremental affected-graph verification.

**Hard acceptance path:** select a filtered 500+ logical-mod fixture with Ctrl+A -> exclude several items -> preview disable/update/quarantine mix -> inspect dependent impact -> choose No and prove zero mutation -> repeat and choose Yes -> progress remains responsive -> one injected failure rolls back only its item -> quarantine/history persists across restart -> Undo restores the selected prior state and dependency verification passes.

### T054 — First-run / account / create / import / clone performance supremacy

- [ ] **T054** · Make first-run, account connection, instance creation, import, and clone flows strictly faster and more capable than both launchers without losing fidelity

First-run/onboarding:

- First launch must reach a usable shell quickly; optional discovery/account/provider enrichment cannot block the entire app.
- Detect likely existing Minecraft/CurseForge/Modrinth/Enderloom instance roots efficiently from known configured locations and bounded discovery, then present candidates for user approval instead of silently importing everything.
- Let the user **Import/Link**, **Skip**, or review detected candidates; skipping onboarding never blocks later setup.
- Do not perform expensive full recursive scans of unrelated disks at startup.

Accounts:

- Reuse legitimate existing authorized sessions where supported.
- Account connect/reconnect uses the provider's supported OAuth/device/browser flow and returns to the interrupted Enderloom action automatically.
- Never store raw account passwords or bypass MFA/CAPTCHA/security challenges.
- Show truthful connected/reconnect-required/offline state without making unrelated local instance management unavailable.
- Keep account UI responsive while remote profile/entitlement data enriches.

Create instance:

- Creating a basic instance should render the editable instance shell immediately and pipeline metadata/runtime/assets/libraries in dependency order.
- Reuse verified shared JRE/Minecraft libraries/assets/content-addressed artifacts rather than redownloading identical bytes.
- Dependency/runtime preparation stays off the renderer and shows truthful granular progress.
- Cancel/retry/resume must not leave fake complete profiles.

Import:

- Support existing accepted import sources/formats through one canonical import transaction.
- Analyze manifest/pack metadata once, reuse provider resolution/download cache, parallelize independent transfers, preserve exact requested files/configs/overrides, and verify the final instance.
- Existing local CurseForge/Modrinth profiles imported/linked in place must not be copied merely for convenience when a safe connected-in-place mode applies.
- Archive/provider imports that do require a new physical instance use staging + atomic finalize/rollback.

Clone:

- Offer a clear clone dialog for destination/name and inclusion choices where applicable.
- Preserve the original instance untouched.
- Mutable user data such as worlds/configs must never become unsafe shared hardlinks between original and clone.
- Immutable verified artifacts may reuse content-addressed storage/copy-on-write/reflink/hardlink techniques only when the platform/filesystem semantics are safe and Enderloom prevents one instance mutation from corrupting another.
- The clone must be independently usable and removable after completion.

Strict performance proof:

- Benchmark first launch -> usable shell, account action -> usable authenticated state, create -> usable instance, import -> usable verified instance, and clone -> independently usable clone against both installed clients on equivalent fixtures.
- Enderloom must be measurably faster than **both** on technically comparable median and p95 paths while preserving more useful setup/import intelligence and the full intended instance contents.
- Record bytes downloaded vs reused, files/projects preserved, dependency/provider resolution counts, CPU/disk/network cost, and cold/warm behavior.
- A "fast" result that omits overrides/configs/mods/dependencies or defers an unavoidable blocking copy/download to first launch is a regression, not a win.

**Hard acceptance path:** clean-profile first run -> shell usable promptly -> detect existing provider instances -> choose Skip and prove nothing imported -> rerun discovery and approve one link/import -> connect/reconnect supported account -> create a fresh instance -> import a representative provider/archive pack -> clone an existing instance -> verify original and clone independence/content fidelity -> benchmark all equivalent flows against both launchers and prove strict speed superiority.

### T055 — Native Mod / Instance context menus and keyboard bulk actions

- [ ] **T055** · Add instant native right-click / keyboard action surfaces for Mods and Instances, backed by the same canonical operations as visible buttons and bulk actions

Mod/project context menu should expose contextually valid actions such as:

- Open project/details;
- switch/open provider source;
- install to instance / change version;
- update;
- enable / disable;
- pin/freeze / unpin;
- favorite / unfavorite;
- reinstall / repair;
- run Dependency Doctor;
- reveal/show file;
- copy canonical project URL/provider URL/file name/hash/version where available;
- quarantine / restore;
- remove/uninstall;
- view dependencies/dependents;
- open logs/evidence relevant to the selected mod when available.

Instance context menu should expose contextually valid actions such as:

- Launch using remembered/default launcher;
- launcher chooser;
- open instance;
- open folder;
- Logs;
- Settings;
- Browse/Add Content;
- check updates;
- run Dependency Doctor;
- clone;
- export where already supported;
- backup/snapshot where already supported;
- reveal provider/source identity;
- rename when supported;
- remove/trash through the normal protected instance lifecycle.

Keyboard / accessibility / bulk behavior:

- **Shift+F10** and the keyboard Menu key open the same context menu for the focused item.
- Arrow keys navigate; Enter activates; Escape closes; focus returns correctly.
- Ctrl/Shift selection semantics match T053; context actions apply to the complete selected logical set when the action is bulk-capable.
- Bulk-capable context actions use the same preview/Yes/No/Undo/Quarantine safeguards as T053.
- Disabled/impossible actions remain truthful and explain why when useful; never expose clickable no-op menu items.
- Menu content comes from current canonical state and should open perceptually instantly from cached/local data; remote enrichment may patch secondary items but cannot block the menu.
- Context menus, toolbar buttons, card actions, hotkeys, and automation must all call the same canonical domain operation and therefore produce identical validation, persistence, progress, rollback, and result semantics.
- Hotkey conflicts route through Enderloom's canonical Hotkeys system.

**Hard acceptance path:** right-click and Shift+F10 the same mod -> identical actions/state -> multi-select logical rows and invoke a bulk-capable action from context menu -> preview -> choose No and prove zero mutation -> repeat Yes -> operation uses T053 history/quarantine/undo -> right-click an instance -> launch/folder/logs/Doctor/clone actions route to real workflows -> restart and verify action/state consistency.

---

## G008 — Whole queue convergence and runtime proof

- [ ] **G008 · GATE** — Whole queue convergence and runtime proof

### T020 — Visual/performance regression pass

- [ ] **T020** · Visual/performance regression pass

Prove that `enderloom-core`, MFT/USN delta indexing, SQLite WAL/indexing, CAS/hash/archive pipelines, native schedulers, freshness-safe caches, incremental dependency graphs, pipelined transfers, media processing, zero-blank list rendering, delta IPC, provider fetches, unified discovery, Dependency Doctor scans/repair previews, bulk operations, first-run/import/clone work, native context menus, download animations, card enrichment, update progress, logs tailing, artwork loading, and browser downloads do not freeze the main window, corrupt state, present stale/false authority, or trigger unnecessary full-instance rescans.

### T021 — State/restart regression pass

- [ ] **T021** · State/restart regression pass

Restart the app and verify favorites, provider merge state, discovery cache/mappings, default launcher, install target, browser extensions/profile, update state, Dependency Doctor evidence/snooze state, quarantine/undo history, bulk-selection-safe persisted state, artwork overrides, logs preferences, filters, account/provider connection state, and layout survive as intended.

### T022 — Packaged-app workflow proof

- [ ] **T022** · Packaged-app workflow proof

Exercise the real desktop build through at least:

1. cross-provider favorite -> **+** install;
2. provider instance artwork import;
3. Update All where one installed mod is replaced despite identical destination filename;
4. browser-authenticated download;
5. CurseForge TaCZ Helldivers customization -> canonical addon project -> normal Mods-style project page -> compatible provider file selection/download -> typed TaCZ install -> provider-linked update lifecycle;
6. Addons tab containing provider-backed + Local/Unlinked content without duplicate provider projects or junk JSON/ZIP records;
7. universal guided install with both accepted and rejected generic ZIP/JSON fixtures;
8. Show file -> Explorer reveal/select;
9. external launch via CurseForge and Modrinth where compatible;
10. F5 in browser and native Mod Manager;
11. Logs tab search/tail;
12. upgrade/migration from a prior packaged Enderloom profile;
13. packaged app reports the exact newest stable Electron runtime selected by T026 and passes its browser/native regression suite;
14. normal webpage download -> automatic toolbar Downloads bubble -> live progress -> pause/resume/cancel -> completion -> Show in Folder -> bubble dismiss/reopen -> Ctrl+J full Downloads -> restart/history recovery;
15. target=_blank / middle-click / Ctrl+click -> correct foreground/background Enderloom tabs with no unsafe child-window privilege;
16. Ctrl+Shift+T + normal restart/crash restore + Ctrl+H History;
17. right-click context menu, Ctrl+F find, Ctrl+L omnibox, zoom/tab/fullscreen shortcuts;
18. per-origin permission request -> compact permission bubble -> remember/reset behavior;
19. forced renderer/tab load failure -> recover only the affected tab with Reload while the rest of Enderloom remains usable;
20. WebContentsView/current embedding verification or migration proof;
21. persisted window state across restart and monitor/DPI change;
22. persistent browser profile + extension reload/compatibility labeling across Enderloom upgrade;
23. offline/certificate/load-state UI, media mute/PiP behavior, browser/download drag/drop, Windows taskbar progress/notification/reveal integration;
24. hostile-page browser-security regression fixture proving no privileged Enderloom action is reachable through untrusted remote content.
25. verified GitHub project source -> GitHub renders directly inside the Browse provider pane -> navigate deeper -> compact Open in New Tab preserves the exact URL/session -> drag the GitHub provider tab/chip onto the top tab strip also promotes it -> promoted tab behaves like a normal restorable Enderloom browser tab while the original project/source state remains intact.
26. instrumented Browse performance fixture: warm/cold Browse + project opens, back/forward, offline cache, one throttled provider, rapid A -> B -> A navigation, large result set, and restart cache persistence; compare equivalent full-result workflows against current CurseForge and Modrinth clients and prove latency gains without provider/result/metadata/dependency/fidelity loss.
27. unified discovery query -> multi-provider parallel results -> canonical dedupe -> typo/alias/author resolution -> degraded provider -> terminal pagination -> prove more useful unique coverage and faster latency than both clients.
28. Dependency Doctor -> detect missing/wrong/duplicate/ambiguous issues -> choose **No** and verify no mutation -> review/exclude -> choose **Yes** -> transactional repair -> quarantine/undo -> affected graph verifies clean.
29. Bulk Mod Manager -> Ctrl+A full filtered logical set -> preview -> No -> zero mutation -> Yes -> bounded concurrent operation with injected partial failure -> restart -> quarantine/history -> Undo restore.
30. clean-profile first run -> detect existing provider instances -> Skip -> approve one import/link -> account connect/reconnect -> create -> import -> clone -> verify full fidelity/independence -> benchmark each comparable flow against both clients.
31. Mod/Instance right-click + Shift+F10 -> real context actions -> multi-select bulk context action -> Yes/No safeguards -> launch/folder/logs/Doctor/clone paths -> restart consistency.
32. packaged `enderloom-core` vertical slice -> prove renderer/main stay responsive -> kill/restart native core during a non-destructive operation -> truthful recovery -> verify binary/schema/version evidence.
33. 1,000+ mod NTFS instance -> warm reopen performs zero unnecessary JAR reads -> change 3 files -> only 3 affected records process -> simulate USN reset/wrap -> targeted authoritative recovery.
34. SQLite WAL/index/search fixture -> concurrent reader/background writer -> instant indexed sort/search -> migration interruption -> rollback/recovery -> integrity verification -> no durable user-state loss.
35. CAS/hash/JAR fixture -> duplicate artifact install across instances -> one verified network object -> safe materialization -> one-pass hashes/fingerprints -> selective metadata parse -> tamper one materialization -> detect/reverify without poisoning other instances.
36. scheduler/pipeline fixture -> P0 user click preempts P2/P3 work -> provider concurrency limits respected -> downloads/hash/inspect/verify overlap -> stale cancelled generation cannot commit.
37. freshness/link fixture -> cached search paints instantly -> provider data changes -> revalidation patches it -> outage/auth/rate-limit never becomes false 'not found' -> expired signed URL is reacquired -> canonical project link remains valid.
38. incremental dependency fixture -> update one graph node -> only affected connected graph recalculates -> result reconciles with full-solve oracle -> ambiguous/conflicting constraints remain unresolved rather than guessed.
39. image/media fixture -> card uses right-sized native cached image -> huge gallery image never blocks text/actions -> stale late image cannot overwrite newer source.
40. 10,000-result rendering torture -> rapid wheel/trackpad/scrollbar/Home/End/PageDown + filters + images -> zero viewport-not-ready events, blank cards, pop-in gaps, scroll jumps, focus loss, or missing logical results; disable virtualization if the gate fails.
41. crash-injection matrix across DB/WAL/CAS/download/hash/live swap/migration/quarantine -> restart always yields verified old or verified new state, never half-success/corruption.

Record exact build/commit and observed evidence. No item in accepted scope closes on a mock handler, static markup, compile-only proof, or a test that bypasses production wiring.

## Done when

This document is complete only when **G012, G010, and G011 are closed** and every leaf task and gate is checked with real implementation + applicable runtime/regression evidence, no accepted blocker remains open, the packaged app preserves existing user data/functionality, the embedded browser feels like a coherent modern Chromium browser rather than an Electron wrapper, and the update/download/install paths are both **faster/responsive** and **more reliable** without deleting validation or content. The Chrome-style Downloads button/pop-out in T025 is a release-blocking acceptance item for this queue. GitHub must likewise function as the first-class embedded Browse provider surface defined by T044 rather than a hyperlink-only source. Browse/project opening must also satisfy T045's cache-first/intent-prefetch/parallel-loading performance gates with complete result equivalence; a spinner-free shell achieved by omitting work is not completion.

**Resume rule:** continue from the earliest unchecked or invalidated ready task; do not regenerate this plan or move these items into a separate shadow backlog.

- [ ] **G009 · FINAL COMPLETION GATE** — All T001-T069, G001-G008, G010, G011, and G012 are complete with applicable packaged-runtime/regression/performance evidence; no accepted blocker remains open; no working data/capability was removed; no placeholder/no-op UI remains; update/download/install behavior is measurably faster than both comparator clients and the complete app exposes more useful non-duplicate coverage/capability than both without doing less work; and the delivered build preserves user profile, favorites, instances, provider identity, worlds, configs, browser state, and rollback/recovery behavior across restart and upgrade.
