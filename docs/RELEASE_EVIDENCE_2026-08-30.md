# Enderloom release evidence — 2026-08-30

This checkpoint describes the locally runnable source build in `C:\Users\Owner\Desktop\Enderloom`. It is not a claim that a signed installer has been published.

## Acceptance results

- Launcher frontend production build: passed (`tsc` and Vite).
- Rust service build/check: passed without warnings.
- Rust library test target compilation: passed. Runtime Rust unit executables are not claimed because this host currently exits them before test execution with Windows `STATUS_ENTRYPOINT_NOT_FOUND`.
- Electron↔Rust command coverage: passed, `209/209` frontend commands implemented; `0` missing.
- Native launcher integration QA: passed, including accounts/settings boundaries, downloads, dependencies, content, pack updates/rollback, instances, favorites/tags/groups, worlds/data packs, servers, backups/snapshots/repair, logs/diagnostics, process supervision and recoverable reset.
- Real library scan: Modrinth `12` detected and CurseForge `26` detected; both source fingerprints unchanged.
- Catalog install bridge: passed with exact Modrinth/CurseForge project parsing, a real multi-instance compatibility picker, explicit version selection, dependency/conflict planning and provider-launcher handoffs.
- Automatic external-library connection: passed; available Modrinth and CurseForge profiles become normal in-place instances without copying, while broken/unavailable profiles remain untouched.
- Native Mod Manager/Web split workspace: passed with resize, swap, reset, dynamic workspace labels and protected full-height WebContentsView panes.
- Combined Electron self-test: passed with Electron `44.0.0`, Chromium `152.0.7977.54`, three browser tabs and zero failures; it asserted the visible Catalog install picker and Mod Manager/Web split, not only their IPC events.
- Catalog release QA: passed all `41` regression suites.

## Built artifact SHA-256

```text
8E5AAB003CCE5A40262EC03206F9623FA75EBF2A77298FAC17FE090ED8F91F84  native/target/debug/enderloom-service.exe
1121B0DA374316503741A342379B5765CEEBFB1127D328B2B928D586A31C6F46  launcher/dist/index.html
FC415A6A4586F5097E92D80AA14FBC9DA184334173DD99A766E0EA87D959C60D  launcher/dist/assets/index-BzgxuPRH.js
DC938CFE7BB181A78C59E2AF80899A2D988F66D338AAA27797A835316393F182  launcher/dist/assets/index-Br-mhh5k.css
98A5ED48970B453D09495F69828EF2DA4711410DD0E02BBF48729E6BDB8E4402  main.js
574D35983C7471698B1BBAD02D83C02BD7A19CF436139550F1A0D98D8076612E  launcher/src/components/CatalogInstallModal.tsx
5797A71C8D019C86FF42A7328F55127A975BA3E7676ABEEC07CC7A0B5A47CB22  package-lock.json
```

## Launch

Double-click `START_ENDERLOOM.cmd`, or run `npm start` from the project root. The checked build is a developer/source build; the updater truthfully remains manual until a signed Electron installer and update manifest exist.
