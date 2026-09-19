# PA-021 transaction model acceptance

Implementation: `4461e4d1490789e13a6fd4c262e87a6d3f1f1574` on `codex/config-addons-workbench`.

The typed transaction model lives in the existing canonical library (`native/src/db/transactions.rs`), with snapshot restore as its first fully integrated owner. It records exact source/target hashes and paths, reviewed changes, the pre-change snapshot, task/run identity, owned staging/backup areas, state transitions, cleanup and errors. The existing filesystem journal owns recovery; there is no second job database.

`plan_restore_instance_snapshot`, `restore_instance_snapshot` and `get_transactions` use the same native implementation from Electron and CLI. `operation run restore_instance_snapshot --plan` is read-only. The app disables restore until the plan is ready, lists all changed paths with pagination, rejects changed inputs, and exposes durable restore history. Files are hashed again before activation. Safety snapshots have no count cap and remain until explicitly deleted.

Verification:

- `snapshot-transaction-qa.js`: exact plans, CLI parity, stale input refusal, commit/safety receipts, corrupt-archive rollback, actual worker termination during staging, activation recovery, verified roll-forward and rollback, changed-target preservation, independent recovery despite another blocker, committed cleanup preserving later file/settings edits, unknown temporary directory preservation, restart and uncapped safety history.
- `snapshot-transaction-ui-qa.js`: real Electron/native review, loading gate, stale review refusal, successful restore/history, missing manifest and retry, 104-change pagination, narrow-window fit, cancel preservation and zero renderer exceptions.
- Existing `cli-parity-qa.js`, `cli-qa.js` (30 checks), `cli-domain-qa.js` (115 checks), `task-model-qa.js`, `task-resume-qa.js`, and `cli-task-ownership-qa.js` passed.
- Frontend TypeScript/Vite build and both native binaries built successfully. Native unit tests are not counted as executed: this host's unit executable has the previously recorded entry-point loading problem.
- Runtime evidence: `output/snapshot-transaction-qa.json`, `output/snapshot-transaction-ui-qa.json`, and `output/playwright/snapshot-restore-{review,history,narrow}.png`.

Native service SHA256: `494820807a0d75e527f667c221a6ed1185ba539b1a92520e6d172afaf6d548d5`.
CLI SHA256: `9b2be5689e3a070ad438c7333345b7a66a2f874fabc155c31769ad213fb92117`.

Scope: acceptance covers the shared model and snapshot restore integration. It does not assert that every other mutation already uses this model, that external profiles on another volume have been verified, or that conflicting external writes can be automatically discarded. Ambiguous recovery retains the files and records a blocker. The exact next master item is PA-030, canonical operation identity/domain/classification.

The private AoA Savior checkpoint and Dev Kit downloads remain dependent on the pending Google sign-in. Public donor intake is already retained; no new AoA conversion acceptance is claimed here.
