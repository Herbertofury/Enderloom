# Config loading and artwork checkpoint

Config now shares inventory and in-flight validation between views, keeps warm rows visible during refresh, opens individual files without waiting for a full scan, and windows large lists without truncating their searchable inventory. Grouped and ungrouped views both support keyboard navigation to the last file. Pending validation is distinguished from a clean health result. The header is smaller so actual settings appear sooner.

Native scans reuse directory-entry metadata, resolve installed mod versions once without extracting artwork, and reuse syntax/ZIP CRC results only after a fresh SHA-256 matches the cached bytes. Same-size/same-timestamp edits invalidate validation. Originals, mutation hash guards, symlink/junction rejection, custom install folders and disabled-file reconciliation remain intact. Unchanged scans do not rewrite provenance.

## Measured results

- Real Dream profile: all **3,201 workbench entries / 3,150 Config files** retained. Inventory improved from **4,526 ms to 1,832 ms**; repeat full validation improved from **49,529 ms to 5,864 ms**. Zero syntax/file errors in both measurements; compatibility warnings remain visible.
- Real Dream grouped view: 354 groups and 3,150 files represented as 3,504 logical rows. The virtualized view mounted 10 rows near the viewport. Measured tab return under concurrent work was **1,601 ms**, versus **3,914 ms** before windowing; no empty loading screen.
- Isolated 3,502-file native fixture: **397 ms inventory**, **1,674 ms warm verification**, and **1.9 ms individual config read during the full scan**. All byte-change, repair, archive corruption, custom-root toggle, deletion and restart checks passed.
- Isolated real Electron 3,512-row view: **234 ms return**, final file searchable/editable, grouped/flat windowing and End/Home keyboard navigation verified.

## Verification

- Frontend and native service builds passed.
- `scripts/workbench-qa.js`: 41 native checks passed.
- `scripts/workbench-speed-qa.js`: fresh-hash cache, concurrent read, same-size/time corruption, ZIP CRC, repair, custom-folder toggles, deletion, restart and read-only inventory passed.
- `scripts/workbench-cache-qa.js`: request sharing, mutation ordering, profile/scope isolation and failure recovery passed.
- `scripts/config-loading-ui-qa.js`, `scripts/config-scaling-ui-qa.js`, `scripts/config-icons-ui-qa.js`, `scripts/workbench-ui-qa.js`: real Electron editing, ownership, grouping, large-list navigation, presets, addon install/replacement and original restoration passed without renderer errors.
- `scripts/release-qa.js`: 53 suites passed before the presentation-only windowing/header changes; affected Electron suites were then rerun.
- Artwork/table checkpoint `a34584d`: transparent provider artwork has no generated initials/gradient behind it; failed images still fall back. Home/Discover have actual synchronized tables, keyboard navigation and independent Play/Favorite actions. Home, library table and icon Electron checks passed.

This completes the reported Config loading fix, not the entire master checklist. Cold validation still performs real work; measured timings vary by storage and profile. The next hard dependency remains Phase A canonical identity/evidence integration.
