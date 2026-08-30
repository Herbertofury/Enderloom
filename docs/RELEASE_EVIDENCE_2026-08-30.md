# Enderloom release evidence — 2026-08-30

This checkpoint describes the locally runnable source build in `C:\Users\Owner\Desktop\Enderloom`. It is not a claim that a signed installer has been published.

## Acceptance results

- Launcher frontend production build: passed (`tsc` and Vite).
- Rust service build/check: passed without warnings.
- Rust library test target compilation: passed. Runtime Rust unit executables are not claimed because this host currently exits them before test execution with Windows `STATUS_ENTRYPOINT_NOT_FOUND`.
- Electron↔Rust command coverage: passed, `209/209` frontend commands implemented; `0` missing.
- Native launcher integration QA: passed, including accounts/settings boundaries, downloads, dependencies, content, pack updates/rollback, instances, favorites/tags/groups, worlds/data packs, servers, backups/snapshots/repair, logs/diagnostics, process supervision and recoverable reset.
- Real library scan: Modrinth `12` detected and CurseForge `26` detected; both source fingerprints unchanged.
- Combined Electron self-test: passed with Electron `44.0.0`, Chromium `152.0.7977.54`, three browser tabs and zero failures.
- Catalog release QA: passed all `41` regression suites.

## Built artifact SHA-256

```text
8E5AAB003CCE5A40262EC03206F9623FA75EBF2A77298FAC17FE090ED8F91F84  native/target/debug/enderloom-service.exe
B8B9520B324B94B43F8294BA4C8D4B7C042250AE8A9E32901723F0EF9D4887EE  launcher/dist/index.html
5EF7DCE498F89F8133CDCE1188E3CE71C19F93C1BC57CF1E3E4A9618DA11CC46  launcher/dist/assets/index-BG2NaQIm.js
90223B974A166F611393A37C4EB6A17E54F126EC6D9A35E56B0FD5D7ACFDCF78  launcher/dist/assets/index-EEqFTsZW.css
B813453A95D9FD4B1410EDCCD52984E49187694197801D3EA3D0EF19980BDB92  main.js
5797A71C8D019C86FF42A7328F55127A975BA3E7676ABEEC07CC7A0B5A47CB22  package-lock.json
```

## Launch

Double-click `START_ENDERLOOM.cmd`, or run `npm start` from the project root. The checked build is a developer/source build; the updater truthfully remains manual until a signed Electron installer and update manifest exist.
