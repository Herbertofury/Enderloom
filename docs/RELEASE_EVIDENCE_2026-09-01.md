# Enderloom verified checkpoint — 2026-09-01

This checkpoint covers the source build in `C:\Users\Owner\Desktop\Enderloom`. It is a verified developer build, not a claim that a signed installer has been published.

## Delivered in this checkpoint

- Added provider-aware Catalog export to XLSX, CSV, JSON, HTML and PDF. The XLSX contains a second `Media Links` sheet so every discovered gallery, author and source URL remains individually clickable.
- Added Google Sheets, Docs and Drive-PDF source intake from the current Enderloom browser page. Private sources return an explicit sign-in-required state and never substitute invented data.
- Tested the private JetSetCraft master sheet in the user's signed-in Chrome session without exporting cookies, passwords or OAuth tokens. The authenticated XLSX was attached as a watched local source while the canonical Google source remains registered for in-app refresh.
- Corrected multi-sheet XLSX ingestion to prefer `Master Rankings`/`Master Index`, preserve canonical master rows, merge category/scour provenance, ignore repeated internal headers and recognize research-atlas field names.
- Added real content version switching, searchable compatible/incompatible versions, changelog display, pre-change snapshot creation, exact-version install and persistent per-project version freeze/unfreeze.
- Added Modrinth-style content row actions: Show file, Copy link, Freeze version, enable/disable and safe removal.

## Authenticated JetSetCraft acceptance

- Workbook: `JetSetCraft - Ultimate Mod, Mechanics & Asset Research Atlas - Master Sheet`
- Google worksheets observed/exported: `21`
- Source worksheet rows reported by Excel: `17,464` across all sheets
- Canonical imported projects: `448/448`
- Ranked: `448/448`; scored: `448/448`; primary links: `448/448`
- Reconciled provider links: `131` GitHub, `111` Modrinth and `53` CurseForge
- Reconciled collections: `19`
- Canonical worksheet selected: `01 Master Rankings`
- Authenticated XLSX SHA-256: `B5CF3E760FEEB0ECDA2DE90C046F57C9CC5076A8F7389B70A4AEBCCB1C25AB01`

The workbook is stored in Enderloom's per-user catalog-source directory, not committed to the public repository. Chrome authentication remained inside Chrome; Enderloom did not read or copy Chrome cookies, passwords or session databases.

## Acceptance results

- Launcher frontend production build (`tsc` + Vite): passed.
- Rust launcher service build: passed.
- Rust `cargo check --all-targets`: passed.
- Electron↔Rust command coverage: `210/210`, zero missing.
- Full Catalog/shell release gate: all `46` suites passed.
- Catalog ingestion gate: all `36` checks passed, including multi-sheet research-atlas fidelity and private-Google sign-in behavior.
- Catalog export gate: XLSX, CSV, JSON, HTML and Electron-rendered PDF passed; enriched media links preserved.
- Native launcher integration: passed provider install/update, exact-version replacement, persistent version freeze, snapshot/rollback, repair, worlds, data packs, servers, logs, diagnostics, process recovery and safe reset.
- External launchers: Modrinth `12` detected (`6` importable) and CurseForge `26` detected (`26` importable), with source bytes unchanged and zero mandatory profile copying.
- Electron UI acceptance: Cards/Table/Gallery, wide layout, Catalog↔Mod Manager handoff, provider favicons, five export formats and detach/reattach workspace all passed.
- Live Modrinth regression: `epicfight_touhoulittlemaid` rendered and cycled three real gallery/post images plus project and author media.

## Built artifact SHA-256

```text
DB3818799070335A9E3AD19352868AD7AFB97ADEA48E213119BC6F5E100BD6C0  native/target/debug/enderloom-service.exe
B22A103422CC9F45EF113F9B6758D4722C7CDB9D586C9B0F5715595B93172A12  launcher/dist/index.html
32A230151B3A2BCD5A77EEC96F975FA1AC82F477D02F25DB34FC4D7451ADAD5C  launcher/dist/assets/index-BTPd3uqH.css
D57306BCEC193B50198F88D059762D3AD6743AFAB145839431BC4989C2BDACC9  launcher/dist/assets/index-CUERjx8n.js
A4D5742BE2EC14F83906AFCC5B00549BF12F1069283E310130F7E3A55137C6C0  main.js
A9AA84AFDB174D7559292AC32D4C30115EDAB6477AFE54B41802153EB1F3A312  catalog/app.js
5479D7E41EA753D2E7004E54A848A852C27940DB4723AE7723B8EEAC5C9EA893  catalog/enhance.js
98636948B8EC7468BC8E34BC75778A2D4AF0C59CD5DC05540524F4DD9D88F5DE  src/catalog-export.js
26253797A3F51EA7ED36FFE15F8C8331E4595296AECB676C078AE51D9E0CE94A  src/catalog-store.js
DDB15CD017E67B0418BF8BCE77ED1F698A185B6832211D2B6FE9A75BAA04642C  src/ingest.js
7ECAFA7DF32D9095AA646E04D72A2614FC255B6F96B335DF50CF9CA40CD3F1E3  launcher/src/components/content/ContentVersionModal.tsx
ECE4EC0DC8A27949DFDA94E8AB65CF05B0ACCAD79E90367BA5A189F76651F4D3  package-lock.json
8AABA2FEFEB0FFDC895473ADC5DD12E179D659032E31C071C6A11B637AC500D0  package.json
```

## Launch

Double-click `START_ENDERLOOM.cmd`, or run `npm start` from the project root.
