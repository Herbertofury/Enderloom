# Enderloom — GET DONE NOW: Core UX / QoL Repair Queue

**Status:** ACTIVE / IMMEDIATE EXECUTION QUEUE  
**Created:** 2026-09-24  
**Repository:** `Herbertofury/Enderloom`  
**Priority:** finish this queue as a coherent repair pass before treating ordinary launcher/mod-manager UX as polished.

## Objective

Fix the currently visible rough edges and missing common-sense behavior in Enderloom so everyday browsing, downloads, updates, favorites, instance launching, file actions, guided installs, logs, and navigation feel at least as immediate and dependable as CurseForge/Modrinth while preserving Enderloom's stronger provenance, rollback, dependency, and recovery guarantees.

This is a **get-done-now execution list**, not a future ideas backlog. Continue from the earliest ready unchecked item, implement through the real production paths, run targeted regression proof, and keep going automatically.

## Context

The current desktop UI/screenshots show the exact repair targets behind this queue: browser downloads are exposed as a separate manual link/SHA panel instead of normal in-page browser downloads; update/version discovery can sit loading too long; Update All can hit a filename-collision error instead of replacing the installed mod; favorites can duplicate the same project across providers; the MCreator candidate surface consumes permanent vertical space; the instance hero/header is oversized; provider-linked artwork is not consistently reused; and expected desktop actions such as Logs, reveal-in-folder, direct favorite-to-instance install, and F5 refresh are incomplete or awkward.

This queue is intentionally bounded to those accepted UX/QoL repairs and the shared architecture needed to make them reliable. It does not authorize removing working features or weakening Enderloom's existing provenance, dependency, rollback, recovery, or compatibility guarantees.

**Addon correction:** provider-backed addons/customizations must behave like first-class online projects, not like a loose-file junk drawer. When Enderloom can identify a real CurseForge/Modrinth/etc. project and release file, the Addons surface must retain that online identity, use that provider release for install/update, and present the same polished project-page/card UX as the Mods surface. Local/private addon files remain supported, but must be explicitly shown as local/unlinked rather than being given a fake provider identity.

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

## G008 — Whole queue convergence and runtime proof

- [ ] **G008 · GATE** — Whole queue convergence and runtime proof

### T020 — Visual/performance regression pass

- [ ] **T020** · Visual/performance regression pass

Prove that provider fetches, download animations, card enrichment, update progress, logs tailing, artwork loading, and browser downloads do not freeze the main window or trigger unnecessary full-instance rescans.

### T021 — State/restart regression pass

- [ ] **T021** · State/restart regression pass

Restart the app and verify favorites, provider merge state, default launcher, install target, browser extensions/profile, update state, artwork overrides, logs preferences, filters, and layout survive as intended.

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
12. upgrade/migration from a prior packaged Enderloom profile.

Record exact build/commit and observed evidence. No item in accepted scope closes on a mock handler, static markup, compile-only proof, or a test that bypasses production wiring.

## Done when

This document is complete only when every leaf task and gate is checked with real implementation + applicable runtime/regression evidence, no accepted blocker remains open, the packaged app preserves existing user data/functionality, and the update/download/install paths are both **faster/responsive** and **more reliable** without deleting validation or content.

**Resume rule:** continue from the earliest unchecked or invalidated ready task; do not regenerate this plan or move these items into a separate shadow backlog.

- [ ] **G009 · FINAL COMPLETION GATE** — All T001-T024 and G001-G008 are complete with applicable packaged-runtime/regression/performance evidence; no accepted blocker remains open; no working data/capability was removed; no placeholder/no-op UI remains; update/download/install behavior is measurably fast without doing less work; and the delivered build preserves user profile, favorites, instances, provider identity, worlds, configs, browser state, and rollback/recovery behavior across restart and upgrade.
