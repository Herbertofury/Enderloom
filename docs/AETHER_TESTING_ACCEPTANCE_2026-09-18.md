# Aether gameplay and report acceptance

The actual CLI acceptance run `4b66f05f-143b-4608-b026-4bcc23db175e` completed on Minecraft 1.21.1 / NeoForge 21.1.250 / Aether 1.5.10 / Spark 1.10.124. The rendered client visited both dimensions, verified Gravitite Sword damage against a Phyg, traversed Aether terrain and returned to the Overworld. Five real screenshots, logs, frame telemetry and a local Spark capture were preserved. Recording was off. The copied instance was removed and the full source-directory fingerprint was unchanged.

The preceding attempt failed because the command adapter became ready before the world loaded. Requested-world tests now wait for a fresh post-launch player observation with a dimension, finite position and no menu. Cancellation and process ownership remain checked throughout the same startup deadline. This successful run waited another 9.1 seconds after adapter readiness; its scenario passed all assertions. Title-screen tests retain their existing behavior.

Measured Aether client observations: mean reported FPS 116.88 across 69 observations; 8,196 measured frame intervals; p95 10.83 ms; p99 14.09 ms; one interval over 50 ms, none over 250 ms. Spark captured 103.013 seconds, approximately 20 TPS and p95 MSPT 5.37 ms. Aether exclusive sample shares were 0.11293% of server-thread samples and 0.55685% of render-thread samples. Shares include sampled waiting and are not CPU utilization or causal FPS cost. This is one scenario, not complete mod compatibility certification or a paired removal experiment.

Testing Lab now displays all attributed mods, with other threads expandable, world-readiness evidence, analysis failures and evidence limitations. Delayed report responses cannot replace another selection. Refresh discovers CLI-created reports. Native history no longer silently drops reports after 200 entries. Compact controls wrap without hiding actions.

Verification:

- `scripts/aether-live-qa.js --live-account`: real Minecraft assertions, input isolation, source preservation, screenshots, loaded versions, frame pacing, Spark, cleanup and recording-off checks passed.
- `scripts/testing-cli-qa.js`: 206 retained reports, current/legacy/compressed Spark, malformed data rejection, idempotent analysis and artifact isolation passed.
- `scripts/testing-ui-qa.js`: real Electron held-response race, instance isolation, external refresh, all mod shares, recording default, compact layout and zero renderer errors passed.
- Native service/CLI and frontend builds passed. All **63** release QA suites passed (`output/release-qa-aether.json`).
- The running branded Enderloom app displays the real completed report. Screenshot: `output/playwright/aether-testing-lab-current.png`.

The full local report with exact runtime versions, measurement tables, log warnings, assertions and all five screenshots is `output/aether-acceptance/AETHER_REPORT_2026-09-18.md`. Raw report: `output/aether-acceptance/release-report.json`. Canonical artifacts remain in the launcher's `testing-reports/4b66f05f-143b-4608-b026-4bcc23db175e` directory.

The log includes a missing annotation-class warning and a server-falling-behind warning during world startup; neither establishes Aether as their cause. `/fill` returned no changed blocks, so no block-placement success is claimed. Optional recording and newer Minecraft adapters were not validated by this run. The broad Testing phase remains open. Next hard dependency remains PA-003, followed by PA-004.
