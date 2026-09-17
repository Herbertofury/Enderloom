# Daily-use candidate checkpoint — 2026-09-17

This is a source checkpoint, not completion of the Astra master checklist.

Implemented: Home instance cards open from their full surface with independent Play and keyboard navigation; shared compact layout controls; Favorites collections; faster grouped Config with real mod icons, flat view, ownership corrections, bulk expand/collapse, JSON5 validation and uncapped config reads; exact CurseForge fingerprint matching; compact movable/closable project trailers and optional cursor-adjacent previews; persistent browser downloads; visible manager download panel; branded local Windows installation; scoped Google storage permission; native artifact identity and the previously developed testing/performance workbench.

Version discovery uses live official feeds. The Minecraft picker refreshes when reopened, periodically while visible, on returning to it, and through Refresh. Loader failures are distinguished from absent compatible builds. Electron now runs the native app-release checker automatically, respecting its preference and persisted last-check time with retry backoff. Existing instances remain pinned to their chosen game and content versions.

## Runtime evidence

- `scripts/home-ui-qa.js`: real Electron card title/list/keyboard navigation, independent Play/account action, current Minecraft 26.3/Fabric selection and refresh, compact viewport, zero renderer errors. Screenshots in local `output/playwright/`.
- `scripts/version-feeds-live-qa.js --install`: Minecraft 26.3 installed into an isolated directory; official manifest required Java 25; Fabric 0.19.5 and NeoForge 26.3.0.3-beta discovered; verified manifest remained available with an unavailable proxy. This proves installation and metadata, not a rendered 26.3 playthrough.
- `scripts/workbench-qa.js`: 41 native checks, including 3 MiB config validation, commented JSON, Forge manifest version resolution, dependency identity, baseline preservation, updates, rollback, and shared Config/Addons state.
- `scripts/config-icons-ui-qa.js`: grouped/flat views, expand/collapse, persistent corrections, genuine icon loading and broken-icon fallback, zero renderer errors.
- `scripts/creative-qa.js`: 29 native assertions, including exact-hash Favorites lookup without a whole-profile scan, disabled-file tracking, and rejection of changed bytes at the same path.
- `scripts/creative-ui-qa.js`: Favorites, collections, persistence, layouts, generator evidence/corrections and failed-start cleanup.
- `scripts/artifact-graph-qa.js`: provider-bound immutable artifacts, idempotent observations, changed/restored content and persisted CLI identity.
- `scripts/browser-download-ui-qa.js`: actual Electron download, pause/resume, final bytes, collision preservation and persistent history.
- `scripts/curseforge-live-qa.js`: official API search, Create project identity, 11 compatible versions, 52 categories, real project icons.
- Dream's 3,201 Config records appeared in 3.9 seconds; full verification took 29.9 seconds, with zero syntax/file errors and TaCZ 1.1.8-hotfix correctly resolved. Further owner-version checks use current enabled JAR metadata rather than treating a missing indexed version as a change.
- `scripts/run.js --self-test`: passed browser/catalog/launcher/split acceptance on Electron 44 / Chromium 152.
- `scripts/release-qa.js`: 52 regression suites passed. Frontend and service/CLI builds passed.
- `scripts/launcher-integration-qa.js`: full rerun passed, including source preservation for detected Modrinth and CurseForge libraries, process lifecycle, imports, recovery and native operations.

## Remaining work

- Enderloom's automatic release **checks** work; automatic binary installation still requires the signed Electron release/manifest distribution contract. The current Windows installation links to this workspace.
- Taskbar pin was not confirmed: the Windows Explorer surface disappeared during attempted UI control. Desktop and Start menu shortcuts exist with the Enderloom icon.
- External-launcher Play choices, instance settings synchronization, and complete table parity on Home/Discover remain pending.
- Aether's rendered scenario still needs its world-ready race fixed and its complete acceptance rerun. Existing test/report code is preserved in this candidate; no completed playthrough is claimed.
- The broad integration test observed a changing live Modrinth database during one scan. Both the focused and complete reruns passed source-preservation checks; retain that assertion in subsequent runs.
- The master graph/evidence/operation-registry requirements remain incomplete. Continue from the master after the immediate daily-use fixes; do not mark entire phases complete from these checks.
