# Conversion intake and authenticated downloads — 2026-09-18

Implemented in the existing task, project graph, library, browser session and download owners.

- Studio imports JAR/ZIP/MCPACK/MCADDON packages, records the primary target/checkpoint, preserves original bytes under SHA-256, indexes every entry, and compares normalized resource paths with explicit byte-identity scope. Unclassified paths and ambiguity remain visible. This is intake/correspondence, not a completed semantic converter.
- CLI exposes the same five intake/read/compare operations through `operation run`. Interrupted intake resumes the same durable task, reusing previously measured input inventories while rechecking source bytes.
- Downloads accepts HTTPS file links, including Drive file links. Chromium applies cookies from Enderloom's existing persistent browser session; no credential headers are constructed or exported. Redirect destinations are checked. HTML/sign-in responses and SHA-256 mismatches cannot become completed packages. Optional expected SHA-256, collision-safe destinations, three concurrent transfers with an uncapped queue, cancellation, encrypted retry requests, restart recovery, and source-page recovery are included. Retry restarts the transfer; it does not claim byte-range resume.
- Headless entry: run Electron with `scripts/authenticated-download-cli.cjs --request=<absolute JSON file>`. JSON fields: `url`, optional `filename`, optional `sha256`. It uses the same Enderloom profile and download owner. Close the app first; the single-owner lock prevents concurrent profile owners. Credentials are not output in receipts. It does not import Chrome's protected credentials.

Verified:

- Native service + CLI builds and frontend build.
- `conversion-intake-qa.js`: 10,009 entries; tail pagination; unchanged originals; expected-hash rejection; normalized wrapper paths; ambiguous correspondences; immutable prior snapshots; changed-input invalidation; actual worker termination and same-job CLI resume; restart persistence.
- `studio-ui-qa.js`: real Electron file chooser/form, inspection, pagination/search, comparison/filter, hash rejection, persisted project, and project-switch isolation. Visual evidence: `output/playwright/studio-comparison.png`.
- `authenticated-download-qa.js`: protected link persistence, hash and HTML rejection, retry after restart, collision protection, bounded simultaneous transfers without a queue count cap.
- `authenticated-download-runtime-qa.js`: isolated real Chromium session, HttpOnly cookie, validated redirects, sign-in recovery, exact bytes, zero windows during transfer. Only the fixture's exact self-signed certificate is trusted in its isolated test session.
- `authenticated-download-ui-qa.js`: real app Downloads form, source-page recovery, sign-in, retry, expected hash, server filename. `browser-download-ui-qa.js`: existing native downloads still pause/resume, preserve collisions, and survive history reload.
- CLI parity and launcher command coverage pass.

## AoA source status

GitHub `Herbertofury/ProjectDump/projects/aoa-savior/CHECKPOINT-40.md` is an older server-only checkpoint. The signed-in Chrome Drive view exposes the newer CP40/Batch34 visual-final ZIP and V7 reports, plus later CP44/entity continuation bundles. Do not silently substitute the older GitHub checkpoint or call CP40 the latest promoted head without comparing later receipts.

Downloaded locally: `CHECKPOINT-40-BATCH34-VISUAL-FINAL.md`, reporting Forge 47.4.23 / Minecraft 1.20.1 / Java 17 and donor hashes. Its prior runtime results remain externally reported evidence.

Blocker: the actual headless Dev Kit Drive download returned sign-in-required using Enderloom's session. Chrome can view the files, but the requested ZIP downloads have not appeared locally. No Chrome-to-Enderloom credential transfer was performed. The Dev Kit/CP40 source packages and donor hashes still need authenticated acquisition before actual source continuation. The primary AoA conversion, toolkit integration, full semantic census, and cross-version matrix are **not complete**.

Later checkpoint: both original donor packages were recovered from official public CurseForge/GitHub sources and exactly matched the handoff hashes. They and the pinned modern reference are now saved in Studio; see `docs/AOA_DONOR_INTAKE_2026-09-18.md`. The private Savior checkpoint and Dev Kit remain blocked by Enderloom's Google sign-in.
