# Enderloom release evidence — 2026-08-31

This checkpoint describes the locally runnable source build in `C:\Users\Owner\Desktop\Enderloom`. It is not a claim that a signed installer has been published.

## Code-level references

- Installed CurseForge Windows `1.317.0-37682`: Electron ASAR inspected read-only, including its real My Modpacks view state, Tiles/Table/List render paths, tile-size state, grouped/flat organization, navigation and native-agent boundary. No proprietary source or credentials were copied.
- Installed Modrinth App `0.19.1`: executable version matched to official tag `v0.19.1`, commit `5d47594302b8b9eb66348f3d76e4894e35542aa3`; its Rust instance/content/install/recovery/account/skin/world/server APIs and Vue library organizer were inspected read-only.
- CurseForge API contract: Enderloom uses the official `https://api.curseforge.com/v1` endpoints and `x-api-key` authentication. It does not extract or reuse CurseForge's private embedded credentials.
- CurseForge native handoff: the installed app's registered Windows protocol command and packaged handler were inspected read-only. Enderloom now detects the real registration and uses the supported `curseforge://install?addonId=...` route after resolving the public Project ID; if the site withholds that ID it opens the installed client and retains the canonical project in Enderloom instead of showing the misleading download-the-app page.
- Modrinth source contract: formal project gallery media, raw originals, description/post images and `/team/{id}/members` author avatars are merged without a result cap. The live `epicfight_touhoulittlemaid` API check returned one formal gallery image, two post images and the project owner's CDN avatar.

## Acceptance results

- Launcher frontend production build: passed (`tsc` and Vite).
- Rust service build/check: passed without warnings.
- Rust unit-test target builds but this host exits the test executable before the harness with Windows `STATUS_ENTRYPOINT_NOT_FOUND`; this known host-loader limitation is not represented as a pass.
- Electron↔Rust command coverage: passed, `209/209` frontend commands implemented; `0` missing.
- Native launcher integration QA: passed, including real provider planning/install, cancellation rollback, downloads, instances, groups/favorites/tags, worlds/data packs, servers, snapshots/repair, logs/diagnostics, process supervision and recoverable reset.
- External libraries: passed with Modrinth `12` detected/`6` importable and CurseForge `26` detected/`26` importable. Connected profiles used `0` copied profile bytes, preserved source fingerprints, reconciled launcher changes, deduplicated junctions, survived restart and supported explicit verified Clone.
- Mod Manager UI: native Playwright/Electron passed My Modpacks navigation, 32-instance Tiles/Table/List modes, Groups/Flat, search, sort, filters, persistent tile sizing, compact instance details and 460-file content layouts. Custom local art decoded at its real `2369x2841` dimensions through the launcher partition's guarded asset protocol.
- CurseForge connection: native Playwright/Electron passed the selectable CurseForge provider and inline secure key setup surface. Validation uses the real taxonomy endpoint before enabling browse/install; storage is delegated to Windows Credential Manager.
- Catalog provider links: native Playwright/Electron audited the first 40 visible cards with zero duplicate top-level CurseForge/Modrinth/GitHub homes. All additional distinct sources remained in More menus.
- Catalog live media: `28/30` initially sampled card galleries had decoded provider/CDN images after the bounded wait; the remaining cards continued the uncapped asynchronous discovery pipeline. There were zero Catalog console errors and zero request failures during the audit.
- Exact Modrinth card regression: native Playwright/Electron searched for `EpicFight: TouhouLittleMaid` through the visible Catalog input from a cold profile, preserved its authoritative `epicfight_touhoulittlemaid` project URL even though the imported `authorUrl` initially pointed to that same project home, decoded the real project banner/icon/owner avatar, retained all `3` formal-gallery plus description/post images, and advanced the visible card from image `1` to image `2`. Replacement card DOM created by provider-link enrichment now immediately rehydrates retained live-media state, and background enrichment no longer disables navigation for an already-loaded gallery.
- Catalog layout/compositor acceptance: native Playwright/Electron rendered all `312` Mob Girl entries in Cards, Table and Gallery. Gallery used a five-column CSS Grid, had zero overflowing tiles, no surviving hover surface, a compact `36.48px` heading and a `1500px` shell inside a `1520px` viewport. The legacy multi-column/backdrop-filter surface that produced the cyan/purple Windows compositor corruption is no longer active.
- Workspace window acceptance: the existing live Mod Manager `WebContentsView` detached into a resizable/maximizable native window, preserved the same renderer/state, and reattached to the main shell without spawning a second launcher app. Drag reorder, pull-out, named groups, right-click actions and main/detached fullscreen routes have static and native gates.
- Full Catalog and shell release gate: passed all `44` bundled regression suites, plus the separate live-network native Modrinth card acceptance above.
- Combined Electron self-test: passed with Electron `44.0.0`, Chromium `152.0.7977.54`, three browser tabs and zero failures.
- Native Electron UI acceptance: passed Cards/Table/Gallery layout and detached/reattached Mod Manager behavior.

## Built artifact SHA-256

```text
444B12E31BE60F1C521E101821B0AEFCA5387957944E34019EC678C329AA1ABF  native/target/debug/enderloom-service.exe
EF33D7A0DB7F086DA83CF700C7146370C3F32D21F38064A88076E48DA7D6AAB7  launcher/dist/index.html
0A157634D542CEE67F893A9871B13A4BA20849548554E42464240CDEF9BB895C  launcher/dist/assets/index-C57zyLxP.js
E4BEE70C3D9EB658237C195DB33107E122BDD777051078BB091D6ADE84FA991A  launcher/dist/assets/index-D2B7Sndv.css
A0C45981FD68AA06B256E91C567BB9F9D58697984BD45777E93E4D21F65E2ADA  main.js
3982732D63F62A91D728A1DCB8D727467B02FFAE206667A8B0E6BAAB7D26785D  catalog/app.js
908BF59D04BAB231175206B411D04E4E69BE608914674E6F4A556E1DBC558208  catalog/enhance.js
B12643B2E2AEBDBE1A0695BCB8211F166875FD30CB1B7DAB11702D1C3CB187BE  catalog/modern.css
088EE88D06F342B620FFEE4C30B3B9CAD03F55D66C3B20E045407986823F1D1C  src/modrinth-batch.js
9E3A6F17F606A31F37F11520BCB36FAA02B01C8AFF9C334CCECF08905CA22F70  src/provider-launcher-handoff.js
3BD6C0609FD36A84A58604693FDDF84466EABB5D8F5CAD261B3DE7C0ECC7EEC6  package-lock.json
0882C1D27FFC04B4D0F566A5D91DCB5A9BB5E26EA1D059FF1D3D7C1320E4A2B7  package.json
93D8BF0A6383C48FCA9E75858EEDC41545E822D90A23AB7777D12E07B50F40A9  scripts/modrinth-card-live-qa.js
A866B032EEE7016B41787CCCC6C09CD11E7C6B090B775C8F47405B252209A6D9  scripts/modrinth-project-media-qa.js
```

## Launch

Double-click `START_ENDERLOOM.cmd`, or run `npm start` from the project root. CurseForge browse/install is available after selecting CurseForge in Browse and validating a supported API key. The checked build is a developer/source build; updater installation remains manual until a signed Electron installer and update manifest exist.
