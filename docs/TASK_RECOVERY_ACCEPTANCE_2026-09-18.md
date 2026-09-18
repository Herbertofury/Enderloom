# Task recovery acceptance — 2026-09-18

The existing native task owner now persists task history in the canonical SQLite database (schema 24). There is no second job service. Startup identifies interrupted attempts; completed history has no automatic 50-task cutoff. Explicit clearing persists across restart and retains interrupted work. Corrupt or unfamiliar history records are retained and isolated from readable records.

Mod inspections persist their instance and history option as a typed checkpoint. GUI Resume and `task resume <id>` use the same service operation and task ID. Resuming reuses existing inspections by exact artifact hash and remeasures changed bytes. Attempt fences and monotonically increasing revisions reject delayed updates; clearing history cannot be undone by a delayed progress write. Unexpected task-handle exits settle as failures instead of leaving orphan running rows. The activity panel retains instance context, displays interrupted work, and offers Resume only for supported checkpoints.

Verified with production native service/CLI binaries and the real Electron renderer:

- `node scripts/task-resume-qa.js`: kill the service during a 300-mod inspection after 20 completed inspections, change an already inspected file, restart, resume through the CLI, verify the same task ID/attempt 2 and all 300 results. Existing evidence remains unchanged and the modified file gets a fresh SHA-256. 61 completed tasks survive restart; explicit clear is durable; one unreadable row does not hide the others and is preserved.
- `node scripts/task-resume-ui-qa.js`: real service interruption/restart, visible instance context, preserved checkpoint after Clear finished, native Resume button, successful completion, delayed old progress rejection, and absence of feature-tier labels in Config/Performance/Favorites. Screenshot: `output/playwright/task-resume.png`.
- `node scripts/cli-task-ownership-qa.js`: cancellation and timeout wait for rollback; unrelated GUI jobs remain intact; no ghost import.
- `node scripts/graph-regression-qa.js`: existing identity graph migration and artifact isolation pass at schema 24.
- Frontend and native service/CLI builds pass. CLI capability coverage includes `resume_task` / `task resume`.

This advances master PA-020 and Northpoint Pass 1; neither is fully accepted yet. Safe replay currently covers mod inspections. Other operations retain their history and interrupted status but are not blindly replayed. Parent/child engineering jobs, full attempt evidence, source/build matrices and AI handoff continuation still require implementation. Existing install recovery journals remain in use. Rust unit tests are not claimed as executed: the host's test binary has the previously documented Windows loader failure.
