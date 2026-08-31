# Enderloom release evidence — 2026-08-31

This checkpoint describes the locally runnable source build in `C:\Users\Owner\Desktop\Enderloom`. It is not a claim that a signed installer has been published.

## Code-level references

- Installed CurseForge Windows `1.317.0-37682`: Electron ASAR inspected read-only, including its real My Modpacks view state, Tiles/Table/List render paths, tile-size state, grouped/flat organization, navigation and native-agent boundary. No proprietary source or credentials were copied.
- Installed Modrinth App `0.19.1`: executable version matched to official tag `v0.19.1`, commit `5d47594302b8b9eb66348f3d76e4894e35542aa3`; its Rust instance/content/install/recovery/account/skin/world/server APIs and Vue library organizer were inspected read-only.
- CurseForge API contract: Enderloom uses the official `https://api.curseforge.com/v1` endpoints and `x-api-key` authentication. It does not extract or reuse CurseForge's private embedded credentials.

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
- Full Catalog release gate: passed all `41` regression suites.
- Combined Electron self-test: passed with Electron `44.0.0`, Chromium `152.0.7977.54`, three browser tabs and zero failures.

## Built artifact SHA-256

```text
8E5AAB003CCE5A40262EC03206F9623FA75EBF2A77298FAC17FE090ED8F91F84  native/target/debug/enderloom-service.exe
4F09BB1F83B60CE8E48FDBA1756CE4ADA4CA8D7FB8E533459A568B2C53B97B5A  launcher/dist/index.html
B006E790653E4F1A6DE4CA8DBEF3655641E9203FA831468F6191E8D47CC3B6B9  launcher/dist/assets/index-6EZnwfnJ.js
B2A73014ACD930C98EE89F2EDA633202116BB32178F9DC3D614A71152A8CF313  launcher/dist/assets/index-BhkghpOD.css
00D0856D2C6754680254222ABB1ED3FDAC119CD55EB1A2318FC8B218366A14EB  main.js
EE37CE6734B6658CEC0224CF6C3BB6A37AD52E4CDBB566A7A250AF97E5E60A1F  catalog/app.js
8139A79494F5E9C27194B725F164E1C1CE2C18E184147BCCB6112941353C0BB6  launcher/src/views/InstancesView.tsx
D94A34DFA783A01D5EA155E81596B0F7D2F95FC12D14B74315E321EE43181E11  launcher/src/views/InstanceView.tsx
C2A18F0144A96D044D3985244531BBA0FE407DAAAC5096DE13A21723C4CFE6C8  launcher/src/views/DiscoverView.tsx
3BD6C0609FD36A84A58604693FDDF84466EABB5D8F5CAD261B3DE7C0ECC7EEC6  package-lock.json
```

## Launch

Double-click `START_ENDERLOOM.cmd`, or run `npm start` from the project root. CurseForge browse/install is available after selecting CurseForge in Browse and validating a supported API key. The checked build is a developer/source build; updater installation remains manual until a signed Electron installer and update manifest exist.
