# Enderloom — Autonomous AI Repair Loop / In-App Browser Orchestration Spec

**Status:** Canonical child specification for AI-assisted repair and conversion workflows  
**Updated:** 2026-09-07  
**Repository:** `Herbertofury/Enderloom`  
**Parent contract:** `docs/ENDERLOOM_MASTER_REQUIREMENTS.md`  

This specification turns Enderloom's existing AI diagnostic-handoff idea into a complete, closed-loop repair system. The target experience is deliberately simple:

> Right-click a broken or problematic mod -> **Fix with AI** -> Enderloom prepares the exact evidence, uses the user's already-authenticated integrated browser to hand the job to the selected ChatGPT/Codex-compatible workflow, waits for the returned source/patch/JAR, tests it in a disposable Minecraft sandbox, sends failures back with fresh evidence, repeats until acceptance passes or a real blocker is reached, and only then offers a clean transactional install into the user's instance.

The web assistant proposes and returns work. **Enderloom remains the authority for files, hashes, builds, Minecraft runtime tests, acceptance, rollback, and installation.**

---

# 1. Product laws

- [ ] This is an Enderloom workflow, not an "open browser and good luck" button.
- [ ] The real integrated Chromium browser is a first-class execution surface.
- [ ] The user may stay inside Enderloom for the entire repair loop.
- [ ] The user's authenticated provider session is used in place; Enderloom does not export cookies or scrape credentials into its database.
- [ ] Chat/web mode is the default provider lane when the user wants to avoid API-token/API-billing usage; Enderloom must never claim this bypasses a provider's subscription limits, quotas, rate limits, or terms.
- [ ] Codex/API/provider-specific lanes are optional alternatives, not required for the base browser-chat workflow.
- [ ] No CAPTCHA, paywall, DRM, rate-limit, quota, or access-control bypass.
- [ ] Every outbound prompt and every file attachment is visible in the repair job record.
- [ ] Every returned artifact is treated as untrusted until verified.
- [ ] Never install an AI-returned artifact directly into a live instance before sandbox validation.
- [ ] No fake "fixed" state. A repair is green only when its applicable acceptance gates pass.
- [ ] Never mutate the user's source mod/JAR/config in place without an explicit reversible patch/install transaction.
- [ ] Preserve every failed candidate and its evidence long enough for reproducibility, then offer cleanup.
- [ ] The user can cancel at any stage. Cancellation kills only Enderloom-owned jobs/processes and preserves the live instance.
- [ ] Looping is bounded by real progress, not an arbitrary low retry count: repeat while new evidence/candidates materially advance the job; stop on provider/user action required, a hard rights/source blocker, or repeated no-progress failure.

---

# 2. One repair job, one durable state machine

Implement a persisted `RepairJob` domain object, resumable after Enderloom restart.

Minimum states:

- [ ] `created`
- [ ] `intake`
- [ ] `rights_and_source_check`
- [ ] `diagnosing`
- [ ] `bundle_ready`
- [ ] `provider_opening`
- [ ] `provider_auth_required`
- [ ] `provider_composer_ready`
- [ ] `submitting`
- [ ] `provider_working`
- [ ] `provider_waiting_for_user`
- [ ] `provider_complete`
- [ ] `artifact_collecting`
- [ ] `artifact_validating`
- [ ] `building`
- [ ] `sandbox_preparing`
- [ ] `testing`
- [ ] `test_failed`
- [ ] `failure_packet_ready`
- [ ] `retry_submitting`
- [ ] `candidate_passed`
- [ ] `install_plan_ready`
- [ ] `installing`
- [ ] `post_install_verifying`
- [ ] `complete`
- [ ] `blocked`
- [ ] `cancelled`
- [ ] `failed`

Persist for every transition:

- job ID;
- target instance ID;
- target mod SHA-256 and provider identity;
- original artifact path + hash;
- source/project/repository identities when known;
- provider adapter and conversation/task URL;
- conversation/thread identity where safely obtainable;
- exact prompt revision;
- outbound attachment manifest + hashes;
- received artifact manifest + hashes;
- build commands/results;
- sandbox fingerprint;
- test run IDs;
- latest acceptance ledger;
- last meaningful progress marker;
- blocker;
- exact next action.

---

# 3. Provider Adapter architecture

Create a provider-neutral browser automation contract instead of hardcoding ChatGPT behavior throughout the app.

Suggested interface capabilities:

- [ ] `canHandle(url)`
- [ ] `openWorkspace()`
- [ ] `detectSignedInState()`
- [ ] `detectComposer()`
- [ ] `createNewConversation()`
- [ ] `resumeConversation(identity)`
- [ ] `setPrompt(text)`
- [ ] `attachFiles(paths)`
- [ ] `inspectAttachmentState()`
- [ ] `submit()`
- [ ] `detectRunState()`
- [ ] `detectNeedsUserAction()`
- [ ] `detectRateLimitOrQuotaState()`
- [ ] `collectVisibleResponse()`
- [ ] `collectReturnedFiles()`
- [ ] `collectDownloadLinks()`
- [ ] `collectCodeArtifacts()`
- [ ] `recordConversationIdentity()`
- [ ] `cancelProviderWork()` when the provider actually exposes a supported cancellation action
- [ ] `explainUnsupportedState()`

First adapters:

- [ ] ChatGPT web chat through Enderloom's persistent Chromium session.
- [ ] Codex workflow reachable through the user's authenticated supported UI.
- [ ] Generic assisted web-chat adapter for user-selected providers where safe DOM semantics can be detected.

Architecture rules:

- [ ] Prefer accessibility roles, labels, stable semantic anchors, URL state, and application-observable events over brittle generated CSS class names.
- [ ] Maintain adapter version fingerprints and provider regression fixtures.
- [ ] If provider UI changes and confidence is low, pause with a clear "provider UI changed" state rather than clicking blindly.
- [ ] Browser automation must not run privileged Node APIs in arbitrary page JavaScript.
- [ ] File selection is performed through Enderloom-controlled paths and explicit attachment manifests.
- [ ] Never read passwords, auth cookies, unrelated chats, unrelated page content, or private data outside the active repair workflow.
- [ ] A provider page remains visible/openable so the user can inspect or take over manually at any time.

---

# 4. ChatGPT-web-first flow

Default workflow when selected:

1. [ ] Open ChatGPT in an Enderloom Browser tab using the existing persistent signed-in session.
2. [ ] Detect authenticated/unauthenticated state truthfully.
3. [ ] If sign-in is needed, foreground the tab and wait for the user to sign in; do not attempt credential automation.
4. [ ] Create or resume the repair conversation associated with the `RepairJob`.
5. [ ] Insert the generated repair prompt.
6. [ ] Attach the reviewed diagnostic/source bundle using the real file picker path.
7. [ ] Verify the UI shows the intended attachments before sending.
8. [ ] Submit once.
9. [ ] Observe provider state without busy-looping.
10. [ ] Detect completion, user-action-required, quota/rate-limit, error, or conversation interruption.
11. [ ] Collect returned downloadable artifacts and/or source patches.
12. [ ] Verify downloaded bytes and associate them with the exact provider message/run.
13. [ ] Return control to Enderloom's native repair pipeline.

If the assistant only provides code/diffs in-message:

- [ ] Preserve the full response as evidence.
- [ ] Extract patch/code blocks only when their target paths are unambiguous.
- [ ] Require a patch preview before applying.
- [ ] Apply into a repair workspace, never directly into the live mod/instance.
- [ ] Build from that repair workspace and continue normal acceptance.

If the assistant returns a JAR/ZIP:

- [ ] Record filename, byte length, SHA-256, MIME/signature information and source message.
- [ ] Inspect archive structure before execution.
- [ ] Reject obviously unrelated/wrong-version/wrong-loader artifacts early with a machine-generated failure packet.

---

# 5. Intake: "Hey, fix this"

Entry points:

- [ ] Mod Manager right-click -> `Fix / Improve with AI...`
- [ ] Crash report -> `Repair culprit with AI...`
- [ ] Performance result -> `Optimize culprit with AI...`
- [ ] Compatibility conflict -> `Build compatibility fix with AI...`
- [ ] Conversion result -> `Repair conversion with AI...`
- [ ] World-load failure linked to a mod -> `Repair mod/world compatibility...`
- [ ] File/JAR drag-and-drop -> `Diagnose & Repair...`
- [ ] CLI -> `enderloom repair ...`

Repair modes:

- [ ] crash/boot failure;
- [ ] server lockup/TPS;
- [ ] FPS/render-thread regression;
- [ ] memory/allocation/GC issue;
- [ ] version port failure;
- [ ] loader port failure;
- [ ] dependency compatibility;
- [ ] mixin conflict;
- [ ] data/resource/model/texture/animation failure;
- [ ] dedicated-server incompatibility;
- [ ] world migration/datafix failure;
- [ ] content-loss regression;
- [ ] user freeform instruction.

The dialog should infer the obvious context automatically and still let the user add a one-line instruction such as "fix this without removing features".

---

# 6. Automatic evidence bundle

Build the smallest complete evidence packet, not a random dump.

Include as applicable:

- [ ] target JAR/source archive with SHA-256;
- [ ] decompiled/readable source representation when lawful/appropriate and needed;
- [ ] upstream source repository/commit if known;
- [ ] exact Minecraft version;
- [ ] loader + loader version;
- [ ] Java runtime;
- [ ] full enabled-mod manifest with hashes;
- [ ] dependency closure;
- [ ] mod metadata (`mods.toml`, `neoforge.mods.toml`, `fabric.mod.json`, Quilt metadata, etc.);
- [ ] mixin configs + injection targets;
- [ ] access transformers/wideners;
- [ ] config files relevant to the failure;
- [ ] latest/debug/crash logs;
- [ ] crash report;
- [ ] launcher/process stderr;
- [ ] Spark/JFR/Observable/native telemetry when applicable;
- [ ] performance A/B evidence when the request is optimization-related;
- [ ] exact reproduction scenario DSL;
- [ ] screenshots/runtime captures only when they materially establish a visual failure;
- [ ] world snapshot/subset only when required and explicitly reviewed;
- [ ] source-provider links;
- [ ] prior repair attempts and why they failed;
- [ ] acceptance requirements generated from the user's instruction.

Redaction:

- [ ] tokens;
- [ ] cookies;
- [ ] session secrets;
- [ ] API keys;
- [ ] Microsoft auth material;
- [ ] private server addresses when the user enables redaction;
- [ ] usernames/local paths when the user enables redaction;
- [ ] unrelated personal files/log lines.

The UI must show exactly what is being handed to the provider.

---

# 7. Prompt compiler

Generate a provider-ready prompt that is precise enough to avoid wasted repair rounds.

Required prompt fields:

- target identity and hash;
- source lineage and rights statement if relevant;
- exact version/loader/runtime;
- observed failure;
- deterministic reproduction steps;
- strongest evidence summary;
- suspected root causes only if identified as hypotheses;
- non-negotiable behavior/content constraints;
- compatibility requirements;
- target artifact expected back;
- required build/test commands if known;
- "do not merely explain — return the patched source/build artifact" requirement when supported;
- iteration number and previous failure evidence on retries.

For optimization:

- [ ] explicitly forbid feature/content/visual-quality deletion as a shortcut unless the user asked for it;
- [ ] require before/after proof;
- [ ] require thread-safety and Minecraft threading invariants;
- [ ] require target-loader/runtime compatibility;
- [ ] require no fake async/GPU claims without a technically valid implementation.

For ports/conversions:

- [ ] include source and target semantic manifests;
- [ ] list unresolved translation gaps;
- [ ] require preservation of all supported source behavior;
- [ ] require version/loader-specific adapters rather than stubs/deletions;
- [ ] require content inventory parity report.

---

# 8. Returned artifact quarantine

Every returned artifact lands in an Enderloom-owned quarantine/workspace first.

- [ ] Assign candidate ID.
- [ ] Hash every file.
- [ ] Unpack archives safely with traversal/symlink protections.
- [ ] Detect executable/native payloads.
- [ ] Inspect Gradle/Maven scripts before build.
- [ ] Flag unexpected network/download/build steps.
- [ ] Preserve license/provenance files.
- [ ] Compare source tree against the prior candidate/original.
- [ ] Generate human-readable diff summary.
- [ ] Detect removed registries/assets/content.
- [ ] Detect suspicious broad deletion/stubbing.
- [ ] Detect version/loader drift.
- [ ] Detect accidental bundled secrets.
- [ ] Never execute arbitrary returned scripts outside the controlled build sandbox without an explicit supported plan.

---

# 9. Build engine integration

Use Enderloom/Minecraft Dev Kit style deterministic tooling.

- [ ] Detect Gradle/Maven/build system.
- [ ] Reuse the correct installed/cached JDK.
- [ ] Reuse verified Gradle/loader caches.
- [ ] Respect project wrapper versions.
- [ ] Resolve mappings/loaders deterministically.
- [ ] Capture build stdout/stderr and exact exit code.
- [ ] Hash final artifacts.
- [ ] Verify expected mod metadata/version/loader in the built JAR.
- [ ] Verify required dependencies.
- [ ] Refuse a candidate that "builds" but produces the wrong mod or empty artifact.
- [ ] Keep source + built artifact linked in provenance.

If build fails:

- [ ] identify earliest causal compiler/build error;
- [ ] create a compact failure packet;
- [ ] attach relevant source/build files;
- [ ] send it back to the same AI conversation by default;
- [ ] continue the same job/thread rather than starting over.

---

# 10. Sandbox test engine

Never test the candidate in the live profile first.

Sandbox construction:

- [ ] clone/materialize the minimum compatible instance state;
- [ ] preserve exact enabled dependency closure;
- [ ] hard-link/copy immutable assets safely;
- [ ] isolate writable config/world/log/output state;
- [ ] inject candidate artifact only in sandbox;
- [ ] fingerprint all test inputs.

Applicable gates:

- [ ] static archive/metadata validation;
- [ ] compile/build;
- [ ] packaged production-linkage check where mapped-dev may hide linkage errors;
- [ ] dedicated-server boot to authoritative readiness when server/common code changed;
- [ ] native client boot when client/render/model/UI/input code changed;
- [ ] integrated-server test for synced gameplay;
- [ ] deterministic reproduction scenario;
- [ ] restart/persistence test for save/config/state changes;
- [ ] performance A/B when the goal is optimization;
- [ ] content inventory parity;
- [ ] model/texture/animation QA when visuals changed;
- [ ] fresh log scan for task-related warnings/errors;
- [ ] compatibility smoke with required companion mods.

A "fixed" crash that only removes the broken content is a failure unless removal was explicitly allowed.

---

# 11. Automatic failure feedback loop

When a candidate fails, Enderloom must produce a better next prompt automatically.

Failure packet contains:

- [ ] candidate ID/hash;
- [ ] exact failed gate;
- [ ] first causal error;
- [ ] relevant log excerpt/artifact;
- [ ] runtime mode;
- [ ] reproduction scenario;
- [ ] expected vs observed behavior;
- [ ] changed-file diff from the previous candidate;
- [ ] acceptance items still unsatisfied;
- [ ] evidence proving prior assumptions wrong;
- [ ] explicit instruction to repair the candidate, not restart from the original unless necessary.

Loop:

`AI candidate -> quarantine -> build -> targeted runtime test -> failure packet -> same conversation -> new candidate -> ...`

Rules:

- [ ] Do not resend the entire unchanged bundle every round if a smaller delta packet is sufficient.
- [ ] Reuse conversation/task identity.
- [ ] Reuse unchanged source/evidence hashes.
- [ ] Track rejected routes so the provider is told not to repeat them.
- [ ] If two consecutive candidates make no material progress, change repair strategy or expose a blocker instead of infinite looping.
- [ ] If provider quota/rate limit is reached, persist the exact state and allow resume later; never attempt bypass.
- [ ] If the provider asks a question that Enderloom can answer from evidence, answer it automatically from the job state.
- [ ] If the provider asks for a genuinely user-only choice, foreground a single clear user decision.

---

# 12. Acceptance ledger

Every repair job owns a live ledger:

`requirement -> evidence -> gate -> status -> artifact/run`

Examples:

- Mod launches on Forge 1.20.1 -> native client -> pass/fail.
- Dedicated server reaches readiness -> server log marker -> pass/fail.
- No missing registry content -> registry inventory diff -> pass/fail.
- Grass visual remains identical -> deterministic visual/model asset comparison + native runtime -> pass/fail.
- Render-thread cost reduced -> paired rendered A/B -> pass/fail/confidence.
- Curios compatibility preserved -> integration scenario -> pass/fail.
- Existing world loads without corruption -> copied world restart test -> pass/fail.

The AI cannot mark a ledger item complete. Only Enderloom evidence can.

---

# 13. Clean install transaction

After all required gates pass:

- [ ] Show candidate summary, hash, source, tests and improvements.
- [ ] Create pre-install snapshot/rollback point.
- [ ] Preserve original JAR with provenance.
- [ ] Replace/install by atomic staged move where possible.
- [ ] Preserve filename expectations only when necessary; identity is hash/provider based.
- [ ] Update Mod Manager provenance: `patched-by-enderloom`, source commit, AI repair job ID, candidate hash.
- [ ] Invalidate stale performance/compatibility evidence only where fingerprints changed.
- [ ] Re-run a short post-install smoke against the actual connected instance without destructive world changes.
- [ ] On post-install failure, rollback automatically and return to repair state.
- [ ] Surface `Undo Repair` / `Restore Original` prominently.

---

# 14. Mod page integration

The repair loop is not a separate island. The universal mod/project page must show:

- current repair status;
- original vs patched version/hash;
- latest repair job;
- why it was repaired;
- build/test evidence;
- performance before/after;
- compatibility before/after;
- returned source/patch;
- conversation/task link;
- rollback action;
- retest action;
- "Continue repair with AI" action;
- source repository/provider pages;
- related config files;
- crash/log evidence;
- world impact/staleness notices.

Right-click menu:

- [ ] Fix with AI
- [ ] Optimize with AI
- [ ] Build Compatibility Patch
- [ ] Port to Version...
- [ ] Port to Loader...
- [ ] Open Repair History
- [ ] View Patch/Diff
- [ ] Test Patched Version
- [ ] Restore Original

Performance results should link straight into this page and this page should link back to exact performance runs.

---

# 15. Conversion engine integration

The same repair loop must be usable by Bedrock->Java and version/loader conversion workflows.

- [ ] Conversion engine emits a structured gap report rather than silently dropping unsupported semantics.
- [ ] Gap report can be sent to AI with source IR, generated target project and failing parity tests.
- [ ] AI-returned conversion fixes re-enter the normal build/test/parity loop.
- [ ] Each iteration updates semantic coverage percentages only from actual inventory/runtime evidence.
- [ ] Final converted mod is installable only after target-version/loader gates pass.
- [ ] Preserve source asset/content inventory and mapping provenance.
- [ ] Marketplace/protected content requires user-authorized legally accessible source bytes; Enderloom must never bypass encryption/DRM/paywalls to obtain them.

---

# 16. Performance Lab integration

When a mod is flagged by Performance Lab:

- [ ] `Optimize with AI` pre-populates the exact measured culprit evidence.
- [ ] Prompt contains representative Spark/JFR/native attribution and A/B metrics.
- [ ] Candidate runs the same scenario against the same compatible fingerprint.
- [ ] Enderloom computes before/after deltas.
- [ ] Regression gates check startup, TPS/MSPT, frame time, memory and correctness as applicable.
- [ ] Improved performance without functional parity does not pass.
- [ ] Functional parity without meaningful measured improvement is reported truthfully, not marketed as optimized.
- [ ] Accepted metrics appear immediately on Mod Manager card, universal mod page, Favorites, Testing dashboard and comparison history.

---

# 17. Source/repository workflow

When upstream source exists:

- [ ] Prefer exact upstream commit/tag matching the installed artifact.
- [ ] Clone/materialize a repair worktree.
- [ ] Record upstream remote and license.
- [ ] Keep Enderloom patch branch separate.
- [ ] Generate patch files and source archive.
- [ ] Optionally prepare a clean upstream PR, but never publish without explicit user action.
- [ ] Make local patched JAR usable independently of publishing.

When source does not exist but lawful modification is allowed:

- [ ] decompile only as necessary;
- [ ] preserve original bytecode/JAR;
- [ ] reconstruct a buildable project when feasible;
- [ ] clearly label reconstructed/inferred source;
- [ ] never claim it is the author's original source.

---

# 18. UI: repair job center

Add a polished `Repairs` view or task drawer, but keep actions embedded in normal mod/test pages.

Each job card:

- target mod/icon;
- instance;
- repair mode;
- current state;
- provider;
- current iteration;
- latest gate;
- progress/evidence summary;
- browser conversation preview/open button;
- candidate diff;
- cancel/pause/resume;
- user-action-needed badge;
- install/rollback when applicable.

Timeline:

`Original -> Diagnosis -> AI #1 -> Build fail -> AI #2 -> Server pass -> Client fail -> AI #3 -> All gates pass -> Installed -> Post-install pass`

Make failures useful rather than red: show the exact next action and what was preserved.

---

# 19. Micro-QOL requirements

- [ ] One-click `Fix this crash` from crash dialog.
- [ ] One-click `Fix culprit` from Spark/JFR result.
- [ ] Auto-select the exact implicated mod when evidence confidence is high.
- [ ] Remember preferred provider per workflow type.
- [ ] Reuse an existing repair conversation for the same job.
- [ ] `Open conversation beside tests` split view.
- [ ] Drag returned file from Browser into repair job if auto-detection misses it.
- [ ] Detect downloads in the active provider tab and ask `Use this as repair candidate?` when identity matches.
- [ ] Show artifact hash on hover/copy.
- [ ] Diff viewer defaults to meaningful changed source, not generated/build noise.
- [ ] Collapse unchanged evidence on retry prompts.
- [ ] Copy exact failure packet.
- [ ] `Explain why candidate failed` action powered by local evidence even without AI.
- [ ] `Retest only failed gate` where dependencies allow.
- [ ] `Run full release gates` before install.
- [ ] Keep prior green candidate available if a later experimental candidate regresses.
- [ ] Support `Try another provider` while preserving the same evidence job.
- [ ] Support manual user patch insertion into the same pipeline.
- [ ] Never hide where a patched JAR came from.

---

# 20. CLI/API parity

All repair operations must be domain operations usable by GUI and automation.

Target commands:

- [ ] `enderloom repair create`
- [ ] `enderloom repair diagnose`
- [ ] `enderloom repair bundle`
- [ ] `enderloom repair provider list`
- [ ] `enderloom repair provider open`
- [ ] `enderloom repair submit`
- [ ] `enderloom repair status`
- [ ] `enderloom repair candidate import`
- [ ] `enderloom repair build`
- [ ] `enderloom repair test`
- [ ] `enderloom repair retry-packet`
- [ ] `enderloom repair install`
- [ ] `enderloom repair rollback`
- [ ] `enderloom repair resume`
- [ ] `enderloom repair cancel`
- [ ] `enderloom repair export`

Browser-specific provider automation may require the GUI/browser process, but the repair state machine, build/test/install logic and evidence model must remain shared native domain logic.

---

# 21. Security and trust boundaries

- [ ] Treat AI/provider output as untrusted input.
- [ ] Archive extraction traversal protection.
- [ ] Symlink/junction protection.
- [ ] Build sandbox/working directory isolation.
- [ ] No arbitrary writes outside the repair workspace except explicit transactional install.
- [ ] No secrets in provider prompts unless the user explicitly includes them after warning.
- [ ] No secrets in logs/JSON exports.
- [ ] Provider browser has normal user permissions, not direct unrestricted filesystem access.
- [ ] Enderloom mediates file attachments/download adoption.
- [ ] Returned binaries are never silently executed.
- [ ] Surface native libraries/coremods/agents prominently before testing/install.
- [ ] Preserve licenses/notices.
- [ ] Rights/provenance gate for third-party source and Marketplace content.

---

# 22. QA fixtures

Build deliberate test fixtures that force the loop to prove itself:

- [ ] Java compile error fixed on second candidate.
- [ ] Wrong Minecraft version candidate rejected.
- [ ] Wrong loader candidate rejected.
- [ ] Candidate compiles but crashes dedicated server.
- [ ] Candidate passes server but fails native client renderer.
- [ ] Candidate removes a registry entry and is rejected by content parity.
- [ ] Candidate improves FPS but breaks behavior and is rejected.
- [ ] Candidate fixes behavior but regresses FPS and is flagged.
- [ ] Provider returns ZIP instead of JAR/source.
- [ ] Provider returns only a code block.
- [ ] Provider returns multiple candidate files.
- [ ] Provider tab is signed out.
- [ ] Provider rate-limits/quota-blocks.
- [ ] Provider UI selector changes.
- [ ] User manually takes over conversation then returns control.
- [ ] Enderloom restarts while provider is working.
- [ ] Enderloom restarts during sandbox test.
- [ ] User cancels during build.
- [ ] User cancels during native Minecraft run.
- [ ] Failed live post-install smoke rolls back.
- [ ] Conversation/download belongs to another job and must not be adopted.

---

# 23. Definition of done

This feature is complete only when:

- [ ] A user can right-click a real installed mod and say `Fix with AI`.
- [ ] Enderloom automatically gathers the exact relevant evidence.
- [ ] The user can review the outbound packet.
- [ ] Enderloom uses its integrated authenticated browser to submit the job to a supported web-chat provider.
- [ ] It can persist/resume the exact conversation/job.
- [ ] It can detect and collect a returned artifact without confusing unrelated downloads.
- [ ] The artifact is quarantined, hashed, inspected and built.
- [ ] It is tested in an isolated Minecraft sandbox using the strongest applicable runtime gates.
- [ ] On failure, Enderloom creates a precise new failure packet and submits it back to the same conversation.
- [ ] The loop can survive multiple repair iterations and Enderloom restarts.
- [ ] No failed/unverified artifact is installed into the live instance.
- [ ] A passing candidate installs transactionally with rollback.
- [ ] Post-install verification proves the actual connected instance uses the new artifact.
- [ ] Repair provenance/evidence appears directly on the mod's normal page and Performance history.
- [ ] The user can restore the original in one action.
- [ ] Browser automation respects authentication, quota/rate-limit and access boundaries.
- [ ] No API key or separate paid API is required for the default in-browser chat lane.
- [ ] Enderloom never promises that browser chat itself is quota-free or outside the provider's normal plan limits.

---

# 24. Exact implementation order for Codex

Do not start with a fake Repairs UI.

1. [ ] Define `RepairJob`, `RepairCandidate`, `RepairEvidence`, `RepairAcceptanceItem`, `ProviderConversationIdentity` and persistent DB migrations.
2. [ ] Reuse existing diagnostic bundle/redaction primitives and extend them into deterministic repair manifests.
3. [ ] Build candidate quarantine + hash/archive inspection.
4. [ ] Build repair workspace + build-result normalization.
5. [ ] Connect candidate validation to existing/new Performance Lab sandbox/runtime infrastructure rather than inventing a second test launcher.
6. [ ] Implement failure-packet compiler and acceptance ledger.
7. [ ] Add provider-neutral browser adapter interface.
8. [ ] Implement ChatGPT web adapter using the existing persistent Browser session and robust semantic state detection.
9. [ ] Implement returned-download adoption tied to job/conversation identity.
10. [ ] Wire one complete end-to-end fixture: broken test mod -> browser handoff -> candidate import -> build -> deterministic sandbox gate -> failed gate -> retry packet -> passing candidate.
11. [ ] Implement transactional install + rollback + actual-instance post-install smoke.
12. [ ] Surface repair state on the existing universal mod/content details model.
13. [ ] Add right-click actions and Repairs task view.
14. [ ] Add CLI/API parity.
15. [ ] Add provider regression fixtures, restart recovery and challenge tests.
16. [ ] Only after the full real loop works, add additional provider adapters and richer QOL.

---

# 25. Integration law

This spec inherits the broader Enderloom rule:

> **No feature island.**

A repair candidate's identity, source, performance data, compatibility evidence, configs, world impact, provider links, test history, conversion lineage and install state are one shared project/mod graph. The Repair Loop must consume and update that graph; it must not create a parallel shadow database that the rest of Enderloom cannot see.
