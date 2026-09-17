# ENDERLOOM NORTHPOINT
## Make Enderloom Just Work

**This is an implementation contract, not a planning document.**

The goal is simple: when the user asks Enderloom to **create, convert/port, repair, optimize, hand off, take back, build, or release a Minecraft mod**, Enderloom should do the work correctly, preserve the mod, make it as fast as realistically possible, recover from ordinary failures by itself, and return a usable result without making the user babysit internal engineering steps.

Northpoint is **not a module, mode, service, database, tab, daemon, second orchestrator, or separate workflow**. It is simply the quality and behavior Enderloom applies everywhere it touches a mod.

Do not build `NorthpointService`, `NorthpointStore`, `NorthpointDatabase`, a `.enderloom/northpoint/` silo, a Northpoint process manager, or a second event/job system. Put each capability into the existing Enderloom owner that already handles projects, jobs, builds, runtime launches, files, evidence, AI integration, settings, and UI.

---

# 1. THE PRODUCT EXPERIENCE

The user should be able to do this:

1. Pick or drop in a mod/project.
2. Click **Create**, **Convert**, **Repair**, **Optimize**, **Hand Off**, or **Take Back**.
3. Give the actual goal once.
4. Let Enderloom handle the rest.
5. Receive a working artifact, source, report, and any requested version/loader builds.

Enderloom should remember sane choices and should not repeatedly ask questions it can answer from the project, prior settings, existing metadata, dependency information, source history, connected accounts, or a safe default.

Internal validation is required, but **do not turn internal checks into ceremony**. The user does not need to approve every dependency, retry, compiler fix, mapping fix, cache invalidation, runtime launch, profiler run, or recovered AI handoff.

The normal UI should communicate only useful state such as:

- Working
- Testing
- Fixing an issue
- Building additional versions
- Waiting for a genuinely external action
- Complete
- Complete with a specific limitation

Technical evidence can be available in an expandable details/log area, but it must not dominate the workflow.

## 1.1 No babysitting rule

Enderloom must automatically handle normal engineering decisions and recoverable failures.

Do **not** stop for the user because:

- a build failed;
- a dependency moved;
- a mapping changed;
- a Mixin target changed;
- a generated workspace is stale;
- a cache is bad;
- one loader/version cell failed;
- a returned AI patch does not compile;
- an AI response forgot a file;
- a runtime test exposed a crash;
- performance regressed;
- a tool process exited unexpectedly;
- an optional integration is absent;
- a first implementation approach was wrong.

Those are Enderloom's problems to diagnose and fix.

Ask the user only when a **real user-only or irreversible choice** exists, such as missing rights/source that cannot be obtained, destructive migration with meaningful alternatives, a credential/account action that requires the user, or two genuinely different product outcomes where Enderloom cannot infer intent safely.

## 1.2 No sitting on blockers

A blocker is not permission to idle.

When something fails:

1. Capture the exact failure and preserve the current good state.
2. Identify the earliest causal problem, not the loudest secondary error.
3. Apply the safest likely fix.
4. Re-run the smallest decisive test.
5. If the same route fails again without new information, change strategy.
6. Continue independent work while any external process/account/provider is unavailable.
7. Resume the blocked path automatically when its dependency becomes available.

Never spend hours polling an unchanged state, repeatedly rediscovering the same repo/files, or narrating a blocker instead of progressing other work.

If all realistic recovery routes are exhausted, preserve the best verified result and report **one precise remaining limitation** with the exact failed operation and evidence. Do not abandon the entire job because one secondary target is blocked.

---

# 2. ONE CANONICAL ENDERLOOM WORKFLOW

Create, Convert, Repair, Optimize, AI Hand Off, AI Take Back, matrix builds, and release are different entry points into the **same canonical Enderloom project/job/evidence system**.

Do not make separate copies of project truth for different features.

A job should naturally carry:

- source/input identity and hashes;
- operation goal;
- Minecraft version and loader targets;
- Java/toolchain requirements;
- dependencies and optional integrations;
- source/content inventory;
- feature/version lineage when converting;
- compatibility findings;
- mutations already attempted;
- last known-good artifact;
- runtime/test results;
- performance baseline/result;
- AI handoff/thread/run identity when applicable;
- output artifacts and hashes;
- exact resumable next action.

Persist this through the existing Enderloom project/job state, not a Northpoint-specific database.

If Enderloom restarts, the job resumes from the last verified point instead of starting discovery again.

---

# 3. PRESERVE THE MOD — DO NOT "FIX" BY DELETING IT

Every Enderloom operation must preserve the mod's intended identity, content, behavior, visuals, and save compatibility as far as technically possible.

Preserve, where applicable:

- mod ID and namespaces;
- registry/serialized IDs;
- items, blocks, entities, dimensions, structures and worldgen;
- recipes, loot, tags and advancements;
- models, textures, UVs, animations, particles, sounds and UI;
- AI, physics and simulation behavior;
- configs and save keys;
- networking/protocol behavior;
- public APIs and integration identities;
- supported optional integrations;
- world/player data;
- advertised loader/mod identity unless changing it is actually required by the requested port.

Never make a job pass by silently:

- removing features;
- reducing entity counts;
- reducing render/simulation distance;
- lowering animation/particle/physics cadence;
- disabling AI;
- replacing real content with placeholders;
- blanking structures/templates/assets;
- disabling Mixins wholesale;
- deleting world/player data;
- removing integrations;
- stripping models/textures/effects;
- changing public IDs without a migration;
- declaring an older/incomplete branch to be the full mod.

Every meaningful source/content surface must end accounted for as one of:

- preserved;
- ported;
- repaired;
- replaced by an equivalent or intended successor;
- intentionally removed with real evidence;
- genuinely blocked with an exact reason.

Unexplained loss is a bug.

---

# 4. CONVERT THE WHOLE MOD, NOT JUST WHATEVER ONE BRANCH HAPPENS TO CONTAIN

When converting/porting a mod, Enderloom must build a feature/content lineage across relevant upstream versions instead of assuming the supplied branch is complete.

The converted result should contain the strongest legitimate union of the mod's intended content.

That means:

- keep everything legitimate from the supplied source;
- bring forward newer legitimate features/fixes when applicable;
- retain older unique features that disappeared only because later ports were incomplete;
- prefer intended replacements when a feature was genuinely superseded;
- do not resurrect content that was intentionally removed for corruption, security, exploits, data loss, or a documented design replacement unless it can be safely repaired and the intended behavior is clear;
- preserve unique non-conflicting capability from older/newer branches;
- backport/bridge missing vanilla or loader functionality when realistic rather than deleting dependent mod content.

"The author never ported it" is **not** evidence that the feature should disappear.

For large mods such as AoA-style projects, this lineage behavior is mandatory. Enderloom should behave like a preservation-aware porting engineer, not a text replacer.

---

# 5. PRIMARY TARGET FIRST, THEN THE VERSION/LOADER MATRIX

The user's requested Minecraft version + loader is the primary target.

Enderloom must get that target working first. Once it is verified, it can fan out to the remaining supported matrix automatically according to the user's remembered preference.

Simple preference choices:

- This target only
- All supported targets for this project
- Always build all supported targets for this project
- Always build all supported targets globally

Do not ask again after a preference is remembered unless the user changes it or the requested action would materially expand scope in a surprising way.

## 5.1 Stonecutter-style implementation

Use one canonical source base with shared code plus small loader/version/cell-specific overlays. Generated workspaces are disposable outputs, not independent source-of-truth repos.

Conceptually:

```text
project/
  common/
  loaders/
    fabric/
    neoforge/
    forge/
  versions/
    1.20.1/
    1.21.1/
    26.3/
  cells/
    1.20.1-forge/
    26.3-neoforge/
  generated-workspaces/
  dist/
```

Merge order should stay predictable:

`common -> loader overlay -> version overlay -> rare exact-cell overlay`

Do not clone the whole codebase for every Minecraft version.

## 5.2 Matrix behavior

Each matrix cell knows its required:

- Minecraft version;
- loader and loader version;
- Java version;
- Gradle/build plugin generation;
- mappings;
- dependency versions;
- compatibility adapters;
- runtime lane;
- current support state.

Supported cell states should be practical, not theatrical:

- Ready
- Building
- Testing
- Passed
- Passed, runtime verification unavailable
- Failed
- Blocked by an external requirement
- Unsupported

A failing secondary cell does not destroy already-passing cells. Retry only the failed/stale cells after a relevant change.

Cache toolchains/dependencies and fingerprint inputs so unchanged green cells are reused.

---

# 6. REPAIR INTELLIGENCE ENDERLOOM MUST APPLY AUTOMATICALLY

The following are engineering lessons Enderloom should use internally whenever relevant. They are **not extra steps for the user**.

## 6.1 Diagnose the first real cause

Do not chase the final crash if an earlier linkage/Mixin/data failure caused it.

Secondary shutdown/lifecycle failures stay secondary until the earliest causal error is fixed.

## 6.2 Dependency ranges do not prove binary compatibility

For compatibility failures, compare what the mod expects against what the installed dependency actually provides:

- owner class;
- member name;
- method/field descriptor;
- static/instance shape;
- inheritance/interface relationships;
- loader/mapping context.

A declared version range is only metadata.

## 6.3 Optional dependencies must actually be optional

A guard such as `isModLoaded()` is not enough if the JVM must resolve an optional class from a field/method descriptor or static initializer before the guard runs.

Use safe indirection/reflection/bridges where necessary and verify both:

- provider installed;
- provider absent.

## 6.4 Mixins must be proven in the real loader

Compilation alone does not prove a Mixin works.

Verify relevant:

- target class;
- member descriptor;
- injection point;
- remap behavior;
- annotation/classfile representation;
- competing transformers/Mixins;
- real PREPARE/APPLY behavior in the packaged environment.

Do not fix a Mixin crash by disabling broad unrelated behavior.

## 6.5 Bytecode/JAR repair discipline

For binary repairs:

- fingerprint the original;
- preserve the original artifact;
- change the narrowest necessary classes/resources;
- validate ZIP/JAR structure;
- compare entry diffs;
- verify classfile level and descriptors;
- verify frames/StackMapTable when control flow changes;
- preserve public signatures when possible;
- run the packaged artifact, not only mapped/userdev output.

## 6.6 Data/worldgen problems

Do not replace missing templates/structures/data with empty files to make the log quiet.

Resolve the real namespace/resource/upstream defect. Preserve saves before any destructive migration.

---

# 7. PERFORMANCE: EVERY MOD ENDERLOOM TOUCHES SHOULD COME OUT AS FAST AS POSSIBLE WITHOUT LOSING ANYTHING

The target is **no introduced client or server lag** under equivalent workload, and meaningful improvement whenever the existing implementation has avoidable overhead.

This is an engineering target, not permission to fake benchmarks by reducing workload or content.

Enderloom should automatically challenge hot paths while creating, converting, repairing, or optimizing a mod.

## 7.1 Compare equivalent workloads

Keep relevant variables equivalent between baseline and candidate:

- same world/seed/location;
- same camera/test path;
- same entities/block entities/chunks;
- same render/simulation distance;
- same resolution/graphics/resource packs/shaders;
- same Java/JVM/memory configuration;
- same loader/modpack except the candidate;
- same commands/test duration/server load.

Measure enough repetitions to separate a real regression from normal run-to-run noise.

## 7.2 Client metrics where applicable

- frame-time median/p95/p99;
- FPS and low-percentile behavior;
- render/client-thread profiler share;
- mod inclusive/self hotspots;
- allocations and GC;
- retained memory after unload/reload;
- stutter on feature activation.

## 7.3 Server metrics where applicable

- MSPT median/p95/p99;
- TPS stability;
- profiler inclusive/self hotspots;
- allocations and GC;
- chunk/worldgen/entity/block-entity cost;
- packet frequency/volume;
- persistence/restart behavior.

## 7.4 Common automatic optimizations

Challenge and improve patterns such as:

- repeated world-wide/per-frame discovery scans;
- repeated reflection/class lookup;
- repeated layer/model/animation searches;
- avoidable per-tick/per-frame allocations;
- full-state network sync triggered by tiny state changes;
- polling values that can be maintained from write/lifecycle events;
- redundant GUI/player tick wrappers;
- eagerly allocated fallback capability/data objects;
- caches that have no invalidation or leak worlds/entities.

Prefer:

- lifecycle-driven sparse indexes;
- stable classloader caches;
- `MethodHandle`/`VarHandle` or equivalent fast resolved access where appropriate;
- fixed/reused structures when lifecycle-safe;
- event/write-driven derived state;
- coalesced network/state sync;
- exact invalidation and unload cleanup.

Never move unsafe live Minecraft state to another thread merely to call it "async".

Never improve benchmarks by lowering visual/gameplay fidelity.

If equivalent testing shows a measurable regression, Enderloom should diagnose and optimize it automatically before accepting the result. If runtime profiling is genuinely impossible in the current environment, return a usable artifact but label performance/runtime verification accurately instead of blocking unrelated work.

---

# 8. VERIFY REAL MODS, BUT KEEP THE VERIFICATION INVISIBLE TO THE USER

A successful compile is not completion.

Enderloom should automatically choose the strongest applicable proof:

- static/package validation;
- dedicated server;
- native client;
- integrated client/server;
- optional integration present/absent;
- restart/save persistence;
- production packaged artifact.

Use the cheapest decisive test during iteration, then broader real runtime proof at convergence.

Do not rerun the entire world after every edit.

If the environment cannot run the strongest applicable runtime lane, do not pretend it passed. Continue everything that can be completed, preserve the artifact, and report that specific verification as unavailable rather than stalling the whole job.

---

# 9. OPENAI / CODEX / CHATGPT INTEGRATION: HAND OFF AND TAKE BACK WITHOUT LOSING THE JOB

Enderloom already has OpenAI AI Operator/Codex handoff specifications. **Reuse and finish that work. Do not build a second AI system.**

If existing pieces are specification-only, implement them. If pieces already work, extend them. Do not stop to write another architecture document.

The user experience should be simple:

- Connect OpenAI
- Hand Off to Codex / ChatGPT / supported OpenAI worker
- Continue current AI job
- Take Back
- View result

Everything else should be automatic.

## 9.1 Authentication

Use currently supported OpenAI account/authentication methods for the chosen lane.

Keep provider auth concerns separated correctly:

- supported Codex/ChatGPT account sign-in where available;
- explicit OpenAI API authentication for API/Agents usage;
- persistent authenticated Chromium session for browser ChatGPT workflows when the user chooses that route;
- OAuth/PKCE/scoped authorization for protected remote MCP/plugin integrations where applicable.

Do not pretend one authentication method silently replaces another.

Do not copy provider secrets into renderer-persisted state, project files, prompts, logs, screenshots, evidence bundles, handoff packages, or Git.

Store secrets only through appropriate OS/native/provider-owned secure storage.

Once connected, normal jobs should reuse the account/session until it actually expires or is revoked. Do not make the user reconnect for each handoff.

## 9.2 Hand Off

`Hand Off` should package the **current canonical Enderloom job automatically**.

Do not make the user rewrite the project history into a prompt.

Include what the remote worker needs, such as:

- job/project identity;
- actual objective;
- source files or repository/file references as appropriate;
- input hashes;
- Minecraft/loader/Java targets;
- dependencies;
- source/content inventory;
- feature lineage for conversions;
- known defect/evidence for repairs;
- last verified good state;
- performance baseline when relevant;
- failed/no-repeat approaches;
- requested output contract;
- exact next action.

The receiving worker should be able to continue the job without asking the user to re-explain it.

Keep one canonical AI thread/run lineage for that handoff. Retries and corrections should continue the same context unless there is a real reason to fork.

## 9.3 Take Back

`Take Back` should retrieve the returned work and reconcile it into the same Enderloom job.

Returned files are staged safely first so a broken remote result cannot overwrite the current known-good project.

Automatically:

1. tie returned files to the originating job/thread/run;
2. hash and inventory them;
3. diff them against the handed-out/source state;
4. detect missing/unexpected files and destructive loss;
5. merge/adopt safe source changes into a candidate workspace;
6. build/test/run/profile the candidate as applicable;
7. repair ordinary failures automatically;
8. accept the returned result only after it becomes a valid candidate;
9. keep the previous known-good state recoverable.

The user should not need to manually move archives between folders or remember which AI conversation produced which patch.

## 9.4 If the AI gives Enderloom a bad result

Do not simply dump an error on the user.

Enderloom should generate a precise failure packet containing the relevant compiler/runtime/test/performance evidence and send it back to the **same AI job/thread** for correction when that lane supports continuation.

Then Take Back the correction and test again.

Repeat with changed evidence/strategy while meaningful progress is occurring. Do not loop the exact same failed prompt forever.

Only surface a blocking AI limitation after Enderloom has exhausted realistic local repair and same-thread correction routes.

## 9.5 ChatGPT/Codex can operate Enderloom too

Where the existing MCP/plugin integration is enabled, expose scoped canonical Enderloom operations rather than a special AI-only implementation.

Useful operations include:

- inspect current project/job;
- inspect mod/source inventory;
- start/resume Create/Convert/Repair/Optimize;
- request a build/test/runtime run;
- read structured failure evidence;
- return a patch/source/archive/artifact;
- request Take Back/reconciliation;
- query matrix state/artifacts;
- request packaging/release.

Provider permissions/auth must remain scoped and secure, but once authorized the remote worker should be able to complete the actual job rather than merely chat about it.

---

# 10. FILES, ARTIFACTS, RESUME, AND ROLLBACK

Enderloom should always preserve a recoverable known-good state while working.

For each completed target, produce deterministic usable outputs such as:

```text
dist/
  <mod-version>/
    <minecraft-version>-<loader>/
      <artifact>.jar
  release-matrix.json
  enderloom-report.json
  SHA256SUMS.txt
```

Reports should contain enough structured information to reproduce and debug a result without becoming user-facing bureaucracy:

- input/source hash;
- target version/loader/Java/toolchain;
- artifact hash and size;
- dependencies;
- important compatibility repairs;
- content/lineage exceptions;
- runtime result;
- performance result;
- known remaining limitations;
- evidence/log locations.

Enderloom should never overwrite the last known-good artifact/source with an unverified candidate.

If the app crashes or restarts, resume the active job from persisted canonical state.

---

# 11. IMPLEMENT THIS INSIDE THE EXISTING ENDERLOOM ARCHITECTURE

Current Enderloom is Electron/Node with a React/TypeScript launcher frontend and a Rust-backed native launcher/service. Keep privileged operations out of renderer components.

Reuse existing owners for:

- project/job state;
- settings/preferences;
- Java/Gradle/toolchains;
- downloads/dependencies;
- filesystem operations;
- process launch/cancellation;
- native Minecraft runtime;
- build/test/profiling;
- hashing/artifacts;
- browser sessions;
- OpenAI/Codex integration;
- credential storage;
- handoff/take-back;
- evidence/logging.

Small responsibility-specific helpers are good. A second Enderloom inside Enderloom is not.

Do not dump everything into `main.js`. Extend or extract responsibility-specific existing services and keep `main.js` primarily IPC/wiring.

Renderer responsibilities are presentation and user intent:

- operation selection;
- target/version/loader preference;
- progress/result state;
- matrix summary;
- OpenAI connection status;
- Hand Off / Continue / Take Back;
- expandable details/logs;
- cancel/retry actions where useful.

Renderer code must not directly run Gradle/Java/Codex, perform token exchanges, mutate privileged files, or store secrets.

---

# 12. IMPLEMENTATION ORDER — BUILD THE PRODUCT, DO NOT WRITE MORE PLANS

Use this as the implementation order. Do not create another 30-task meta-plan before touching code.

## Pass 1 — Make the existing canonical job truly resumable

Wire the minimum additional fields needed for input identity, inventory/lineage, target matrix, compatibility evidence, runtime/performance result, artifacts, and AI thread/run state into the existing project/job model.

Prove an interrupted real job resumes without rediscovering everything.

## Pass 2 — Make Create / Convert / Repair / Optimize use one execution engine

Remove disconnected feature-island paths where necessary.

The same backend job should drive builds, compatibility repair, runtime tests, performance checks, artifacts, and progress regardless of which operation started it.

## Pass 3 — Make one primary target work end-to-end

Take a real fixture/project through:

`intake -> build/change -> automatic repair -> runtime -> performance -> artifact`

Do not expand the matrix until this path actually works.

## Pass 4 — Add full conversion lineage and preservation

Prove a conversion fixture where different upstream versions each contain unique legitimate content and the resulting target preserves the correct union.

## Pass 5 — Add efficient matrix fan-out

Reuse shared source, overlays, cached toolchains, fingerprints, isolated generated workspaces, failed-cell retry, remembered preferences, and bounded concurrency.

## Pass 6 — Finish OpenAI integration

Reuse `ENDERLOOM_OPENAI_AI_OPERATOR_SPEC.md` and existing Codex handoff work.

Get this real flow working:

`current mod job -> Hand Off -> remote AI works -> Take Back -> local reconcile -> build/test -> accept`

Then deliberately return a broken candidate and prove:

`bad return -> local failure -> same-thread correction -> Take Back -> local pass`

## Pass 7 — Polish the user experience

The normal workflow should require as few decisions as possible.

Remove redundant prompts, dead buttons, duplicate progress systems, fake status, manual file shuffling, repeated authentication, and user-facing internal terminology that adds no value.

## Pass 8 — Real convergence QA and package

Run the broad relevant Enderloom tests once the implementation converges, launch the real Electron app, exercise Create/Convert/Repair/Optimize, one matrix fan-out, OpenAI Hand Off/Take Back, restart/resume, and produce the fresh runnable package.

Do not stop at "framework created," "spec implemented," or "one example compiles."

---

# 13. FIRST-CLASS LAUNCHER COMPLETENESS — MAKE ENDERLOOM FEEL FINISHED

This is part of the same implementation push. Do **not** create a second roadmap, quality-mode subsystem, or separate launcher rewrite.

Enderloom already has a strong accepted base: real instances, external CurseForge/Modrinth profile discovery, explicit cloning, groups/tags/favorites, multiple library/content layouts, Microsoft accounts, real Minecraft launching, Java/loaders, provider discovery, exact-version switching and update locks, modpack import/export/upgrade, worlds, servers, snapshots, repair, logs/diagnostics, Catalog integration, and real Electron/browser/native wiring.

Build on those owners. Do not reimplement accepted features merely to rename them.

The missing product layer is the common-sense behavior that makes a launcher feel **complete, polished, calm, fast, recoverable, and trustworthy**. Current Modrinth/CurseForge behavior should be treated as a floor when it makes sense, not a ceiling.

The user should be able to use Enderloom every day without thinking about which files, caches, provider APIs, loaders, dependencies, logs, launch arguments, or backup folders are involved.

## 13.1 One-click Safe Update / Update All

Make updating an instance feel safer than CurseForge or Modrinth.

Support:

- **Update all** compatible managed content in an instance;
- update selected content;
- update all eligible instances/groups when explicitly requested;
- exact compatible version resolution by Minecraft version + loader + dependency graph, never "absolute newest" when it is incompatible;
- per-project freeze/ignore-update state already supported by Enderloom;
- stable/beta/alpha or equivalent release-channel preference when provider metadata supports it;
- changelog/version review without forcing the user to leave the app;
- dependency additions/removals/changes shown in the update plan;
- local/manual/unlinked content preserved unless the user explicitly chooses otherwise;
- provider identity and hash/provenance retained across updates;
- external-launcher profiles reconciled without silently taking ownership of launcher-owned files.

Every multi-file update should be transactional:

`plan -> pre-change snapshot -> stage -> verify -> commit`

If an update fails partway through, restore the previous verified state automatically rather than leaving a half-updated profile.

When a newly updated profile immediately fails its launch/smoke checks and the failure correlates with that update, Enderloom should be able to roll back the changed content set and retain the evidence for diagnosis.

Do not overwrite user config blindly during modpack upgrades. Use preservation rules and, where practical, three-way merge for text configs/overrides so pack updates and user customization can coexist. Surface only real merge conflicts.

## 13.2 Instance history, undo, and exact state diffs

Every instance should have a useful chronological history, not just scattered logs.

Record meaningful events such as:

- content installed/removed/updated/downgraded/enabled/disabled;
- version freeze/unfreeze;
- Minecraft/loader/Java changes;
- modpack upgrade/link/unlink;
- config/override merge events;
- world snapshot/restore/import/delete;
- repair actions;
- launch attempts, duration, exit code and crash association;
- automatic Safe Update/Fix All repairs;
- AI-assisted changes when OpenAI integration is used.

For each change set retain enough information to answer:

- what changed;
- why it changed;
- where it came from;
- what depended on it;
- whether a snapshot exists;
- whether the change can be undone;
- what happened on the next launch.

Add **Compare states** / **Compare snapshots** for practical diffs of content versions, loader/game version, configs and important metadata.

Undo should use the existing snapshot/rollback machinery rather than inventing a second backup system.

## 13.3 Crash-aware Fix All

A failed launch should become a repair workflow automatically.

When Minecraft exits abnormally or produces a crash report/fatal loader error:

1. associate the failure with the exact instance and recent change set;
2. collect the decisive log/crash evidence;
3. find the earliest causal failure;
4. classify common dependency/Mixin/loader/Java/config/mod-ID/corruption problems;
5. apply safe deterministic repairs automatically when confidence is high;
6. re-run the smallest useful verification;
7. preserve or restore the last known-good state if a repair makes things worse;
8. offer one clear **Fix All** action when user intent is required to start a broader repair.

Common automatic repairs should include, when supported by real evidence:

- missing required dependency resolution;
- wrong Minecraft/loader build replacement;
- duplicate mod-ID/JAR cleanup through quarantine, never blind deletion;
- corrupted managed download re-fetch by provider hash/identity;
- invalid Java selection correction;
- stale generated/cache state cleanup;
- known optional-dependency/linkage repair path;
- rollback of the immediately preceding broken managed update;
- safe config restoration from the last working snapshot when the config is proven causal.

Do not make AI a requirement for basic repair. Local deterministic repair is first-class. OpenAI/Codex can be the escalation lane when the failure actually requires source/code reasoning.

## 13.4 Dependency and conflict intelligence

Turn the content list into a dependency-aware manager instead of a folder viewer.

Detect and explain:

- missing required dependencies;
- dependency version conflicts;
- wrong loader;
- wrong Minecraft version;
- client-only/server-only environment mismatches when metadata/code evidence supports it;
- duplicate files and duplicate mod IDs;
- multiple versions of the same project;
- provider/manual copies representing the same underlying project;
- corrupted or changed managed files;
- orphaned dependencies no longer required by anything;
- frozen content blocking a requested update;
- modpack-provided content versus user-added overrides;
- disabled content that is still required by enabled content.

For every dependency expose **Why is this installed?** and **Required by** chains.

Before destructive removal, show what enabled content depends on the target and offer the safe action instead of letting the user discover breakage at launch.

Make bulk operations real across selected content and instance groups:

- enable/disable;
- update;
- freeze/unfreeze;
- remove;
- move/copy where meaningful;
- export selection;
- inspect conflicts.

The backend resolver remains authoritative. UI badges must never claim compatibility the resolver has not proven.

## 13.5 Mod behavior, side, vanilla-impact, and Forever World intelligence

Make **what a mod actually does** a first-class piece of Enderloom data instead of forcing the user to infer it from descriptions, comments, or trial-and-error.

This is not a separate scanner app and it is not a decorative badge system. It is part of normal Discover, installed-content, update, remove, repair, world-protection, and profile-management behavior.

The user should be able to answer, at a glance or with one filter:

- Is this mod client-only, server-only, or required on both sides?
- Can I use it on a client connecting to vanilla servers?
- Can I install it only on my server without forcing clients to install it?
- Does it touch vanilla biomes, vanilla mobs, vanilla blocks/items, vanilla recipes/loot/tags, vanilla rendering/resources, or vanilla game logic?
- Is it truly additive, or does it alter/rewrite existing vanilla behavior?
- Does it add worldgen, structures, biomes, dimensions, blocks, entities, saved-data attachments, or other persistent world state?
- Is it safe for a long-term/forever world?
- If I remove it later, will the world merely lose optional behavior, leave persistent mod content behind, or risk refusing to load?
- Did a new mod version become more invasive than the version I already use?

### The key truth Enderloom must preserve

**Vanilla-untouched and safe-to-remove are different facts.**

Examples:

- A client-side HUD mod can be both vanilla-untouched and genuinely safe to remove.
- A mod can be perfectly additive and never replace a vanilla biome, yet still add blocks, entities, structures or dimensions into the save. That is **not** automatically safe to remove later.
- A datapack-style mod may register no custom blocks at all but still change vanilla loot, recipes, tags, mob spawns or worldgen.
- A resource-only client mod may replace vanilla textures/models without touching the save at all.
- A mod can advertise client/server support incorrectly or incompletely; provider metadata alone is not proof.

Never collapse those into one green checkmark.

### 13.5.1 Built-in classification dimensions

For every exact artifact/version, Enderloom should derive and cache a structured behavior profile.

#### Runtime side

Classify into the most accurate state supported by evidence:

- `CLIENT_ONLY`
- `SERVER_ONLY`
- `BOTH_REQUIRED`
- `SERVER_REQUIRED_CLIENT_OPTIONAL`
- `CLIENT_REQUIRED_SERVER_OPTIONAL`
- `DATA_ONLY_OR_SERVER_CONTENT`
- `UNKNOWN`

The simple UI can render these as **Client**, **Server**, **Both**, or **Optional on one side**. The exact state remains available in the detail/evidence view.

Never call something client-only merely because it contains client classes. Never call something server-only merely because its provider description says so.

#### Vanilla impact

Track independent flags rather than one vague "changes vanilla" boolean:

- `VANILLA_UNTOUCHED_STRICT`
- `ADDITIVE_NEW_CONTENT`
- `VANILLA_LOGIC_HOOKS`
- `VANILLA_BLOCK_ITEM_BEHAVIOR`
- `VANILLA_MOB_AI_OR_BEHAVIOR`
- `VANILLA_MOB_SPAWNS_OR_DROPS`
- `VANILLA_BIOME_CONTENT`
- `VANILLA_WORLDGEN`
- `VANILLA_STRUCTURES`
- `VANILLA_DIMENSION_RULES`
- `VANILLA_RECIPES`
- `VANILLA_LOOT`
- `VANILLA_TAGS`
- `VANILLA_TRADES`
- `VANILLA_ADVANCEMENTS`
- `VANILLA_RESOURCES_TEXTURES_MODELS_SOUNDS`
- `VANILLA_UI_RENDERING`
- `VANILLA_NETWORK_OR_PROTOCOL_BEHAVIOR`
- `MIXIN_COREMOD_OR_BYTECODE_TARGETS_VANILLA`

A mod may have several of these at once.

#### Added-content / save footprint

Track what can become persistent:

- custom blocks/items;
- custom entity types/block entities;
- custom biomes;
- placed/configured features;
- structures/structure sets;
- dimensions/dimension types/level stems;
- chunk generators/noise settings/density functions;
- custom recipes/loot/tags/advancements;
- world `SavedData` or equivalent persistent manager data;
- Forge/NeoForge capabilities/attachments/data components that persist;
- player inventory/curio/accessory/component data;
- chunk NBT or per-chunk attachments;
- custom POI, scheduled ticks or persistent entity references;
- scoreboard/team/objective or command-created persistent state;
- config-only state outside the world;
- no known persistent world state.

Do not use "additive" as shorthand for "no save footprint".

### 13.5.2 User-facing world-safety states

Keep the top-level status simple and useful.

Use these user-facing classifications:

#### **Forever World Safe**

High-confidence evidence says the mod does not create persistent world/save dependencies and does not alter vanilla/worldgen state in a way that makes later removal unsafe.

Typical examples are client visual/UI/QOL mods with no persistent world data.

This status must be conservative. **Unknown does not become safe.**

#### **Vanilla Untouched — Persistent**

The mod does not rewrite vanilla behavior/content, but it can place/register/save its own content in the world.

Examples: additive structures, blocks, entities, biomes or dimensions.

This is useful for the user's "do not mess with vanilla" preference, but it is **not** a promise that uninstalling the mod later leaves the save unaffected.

#### **Changes Vanilla**

The mod modifies existing vanilla data, behavior, spawns, biomes, worldgen, mobs, loot, recipes, tags, structures, resources or logic.

Show the exact affected categories rather than a generic scary badge.

#### **World-Critical / Removal Risk**

Evidence shows removal can leave required registries, dimensions, persistent entities/blocks/data, player references or other save-critical state behind.

Enderloom should protect the world automatically before update/remove operations and explain the concrete reason.

#### **Unknown / Needs Evidence**

Enderloom could not prove the relevant behavior yet.

Do not hide uncertainty behind a confident icon. Continue background analysis and upgrade the classification when stronger evidence becomes available.

### 13.5.3 First-class filters everywhere they matter

Add the same behavior filters to **Discover**, provider search, Catalog-to-manager install flows, installed content, bulk operations, update planning, and profile comparison.

Useful one-click chips/toggles include:

- Client only
- Server only
- Both sides
- Works with vanilla server
- Works with vanilla client
- Forever World Safe
- Vanilla Untouched
- Additive only
- No persistent world data
- Safe to remove
- Adds worldgen
- Adds structures
- Adds biomes
- Adds dimensions
- Adds mobs/entities
- Changes vanilla biomes
- Changes vanilla creatures/mob behavior
- Changes vanilla spawns/drops
- Changes vanilla worldgen
- Changes vanilla blocks/items
- Changes vanilla recipes/loot/tags
- Changes vanilla visuals/resources only
- Uses vanilla-targeting Mixins/coremods/bytecode
- World-critical / removal risk
- Unknown classification

Filters combine naturally. The important personal use case should be trivial:

`Forever World Safe + Vanilla Untouched`

or, when the user is okay with additive persistent content:

`Vanilla Untouched + Additive only`

Support text search/query tokens for power users without requiring them, for example:

- `side:client`
- `side:server`
- `world:safe`
- `world:persistent`
- `vanilla:untouched`
- `impact:biomes`
- `impact:vanilla-mobs`
- `impact:worldgen`
- `removal:safe`

Persist filter preference per instance/profile where it makes sense.

### 13.5.4 A real "Forever World" profile preference

Allow an instance to be marked **Forever World**.

This should change useful defaults, not create a different launcher mode.

For a Forever World instance:

- Discover/search should prioritize **Forever World Safe** and **Vanilla Untouched** results;
- risky worldgen/dimension/registry-changing updates should automatically enter the existing Forever World Guard path;
- install plans should summarize persistent-world impact before commit;
- update plans should highlight when the target version becomes *more invasive* than the installed version;
- removal should run a save-aware removal audit before calling anything safe;
- snapshots should happen automatically for meaningful world-risk operations;
- unknown/risky mods remain installable when the user wants them, but Enderloom should clearly state the concrete risk once rather than nag repeatedly;
- existing external CurseForge/Modrinth profiles remain ownership-safe.

Do not secretly hide half the catalog. Prefer/sort/filter intelligently, with an obvious way to show all results.

### 13.5.5 Evidence engine — classify without executing untrusted JARs

Classification must be evidence-driven and hash/version specific.

Use the strongest available evidence in layers:

1. provider project/version metadata as a hint;
2. loader metadata and manifest declarations;
3. JAR/resource static analysis;
4. Mixin/access-widener/access-transformer/coremod analysis;
5. data/resource pack analysis;
6. source analysis when trusted source is available;
7. isolated runtime observation when it materially resolves ambiguity;
8. actual save/world audit for instance-specific uninstall safety.

Do not execute arbitrary mod classes merely to classify them.

Cache the result by at least:

`artifact SHA-256 + Minecraft version + loader + loader version where relevant`

A changed JAR invalidates the old classification automatically.

#### Loader/metadata evidence

Use real loader conventions where available, including for example:

- Fabric/Quilt environment and entrypoint declarations;
- client/server/common entrypoint classes;
- Forge/NeoForge metadata and sided declarations where meaningful;
- client-only Mixin configuration sections;
- dedicated-server incompatibility declarations;
- dependency side requirements;
- known provider environment metadata, treated as supporting rather than sole evidence.

#### Class/static evidence

Targeted class/constant-pool/bytecode inspection can detect signals such as:

- `net.minecraft.client` linkage;
- dedicated-server-only hooks;
- `Dist.CLIENT` / environment guards;
- registry creation and custom namespace IDs;
- persistent saved-data/capability/attachment APIs;
- biome/worldgen registration APIs;
- spawn and entity hooks;
- network channels/protocol handlers;
- vanilla class Mixin targets;
- transformers/coremods/ASM hooks;
- access wideners/access transformers targeting vanilla owners.

Do not infer a final side from one symbol. Combine evidence and understand guarded/optional linkage.

#### Data/resource evidence

Inspect JAR entries without loading the code.

Strong signals include:

- `data/<modid>/worldgen/**`;
- `data/<modid>/dimension/**` and dimension types;
- configured/placed features;
- biome modifiers;
- structure/structure-set definitions;
- density/noise/chunk-generator data;
- entity/biome/spawn-related tags;
- `data/minecraft/**` overrides;
- vanilla tag edits, especially `replace: true`;
- vanilla recipes/loot table overrides;
- `assets/minecraft/**` resource replacement;
- datapack/resourcepack metadata;
- generated data describing registries or dimensions.

For Forge/NeoForge/Fabric ecosystems also recognize common worldgen/biome extension APIs rather than relying only on file paths.

### 13.5.6 Explain "Why?" without clutter

Every simple badge should have a concise evidence explanation available on hover/detail, for example:

- **Client only** — Fabric declares client environment; all entrypoints are client; no common/server entrypoint found.
- **Vanilla Untouched** — no `data/minecraft` overrides, no vanilla Mixin targets, no vanilla biome/entity mutation evidence; registers only namespace `examplemod:*`.
- **Changes vanilla mobs** — Mixin targets `Zombie`, plus spawn/goal hooks for vanilla entity types.
- **Adds worldgen** — placed features + biome modifier detected.
- **Removal risk** — installed world contains 842 block-state palette references and 19 block entities from namespace `examplemod`.

The simple list view should not display confidence percentages everywhere. Put confidence/evidence details behind **Why? / Behavior details**.

### 13.5.7 Version-to-version behavior diffs

Behavior can change between releases of the same project.

During update planning, compare the installed artifact classification with the candidate version.

Call out meaningful changes such as:

- client-only -> both sides required;
- no world footprint -> adds worldgen;
- vanilla untouched -> begins modifying vanilla biomes;
- no persistent data -> begins storing world/player attachments;
- no vanilla Mixins -> adds vanilla-targeting Mixins;
- previously safe to remove -> removal risk introduced.

For Forever World profiles, a material safety downgrade automatically triggers snapshot + stronger verification. It should not silently ride inside "Update All".

### 13.5.8 Save-aware "Safe to remove now" audit

A generic mod classification is not enough to prove uninstall safety for a world that has actually used the mod.

For installed content, Enderloom should be able to perform a **Removal Audit** against selected worlds/saves.

Inspect, as applicable and without mutating the save:

- `level.dat` and registry/dimension references;
- region/chunk block-state palettes;
- block entities;
- persistent entities and entity IDs;
- scheduled ticks;
- POI data;
- structure starts/references and structure data;
- world `data/` SavedData;
- datapack state;
- player inventories/end-chest/equipment/components/capabilities/attachments;
- advancements/stats or other namespaced persistent references where relevant;
- custom dimensions and player position/dimension references;
- namespaced config/state files that the mod requires for load consistency.

The audit should produce a plain result such as:

- **Safe to remove from this instance** — no persistent references found in selected worlds and the mod has no known vanilla/world-critical runtime hooks.
- **Removal will delete/lose mod content but world should remain loadable** — enumerate what was found.
- **Do not remove without migration** — dimension/registry/save-critical references found.
- **Unknown** — evidence incomplete; snapshot first.

Never scan/modify the user's only copy destructively. A deeper migration/cleanup operation must work through snapshot/quarantine/rollback and verify a copied/staged save before replacing anything.

### 13.5.9 Install/remove/update UX should use this automatically

Do not make the user manually open a safety scanner before every action.

Examples of expected behavior:

- Installing a client-only cosmetic mod into a Forever World profile: just install it; no scary ceremony.
- Installing a mod that adds structures but does not edit vanilla: show **Vanilla Untouched — Adds structures — Persistent world content** in the plan; snapshot policy follows the profile's remembered preference.
- Removing a mod with no persistent references: perform the removal normally and record the audit in History.
- Removing a mod whose blocks/entities exist in the world: snapshot automatically, show one concise impact summary, and use migration/cleanup only if supported and requested.
- Updating a mod whose new version starts altering vanilla biomes: Safe Update should flag the behavior regression before commit, especially on Forever World instances.
- Connecting to a server: Enderloom can tell whether the selected client-only mods may remain while identifying content that the server actually requires.
- Building a server pack from an instance: exclude proven client-only mods by default while preserving explicit overrides and showing why each exclusion is safe.

### 13.5.10 Classification must improve over time without becoming a babysitting task

Classification is an internal knowledge layer that should get stronger as Enderloom sees more evidence.

- Provider metadata can seed it immediately.
- Local static analysis upgrades it after download/install.
- Trusted source analysis can refine it.
- Runtime observations can refine it further.
- A world audit can produce instance-specific uninstall safety.
- User corrections are allowed as an advanced override/reporting path, but the normal workflow must not depend on manual tagging.

If the user overrides a classification, retain the exact artifact hash and show that the value is user-overridden in the detail view so it is not confused with machine proof.

### 13.5.11 Performance and scale

This feature must not make Discover or startup feel slower.

- use fast manifest/JAR central-directory/resource scans first;
- perform deeper class/source analysis in background worker/native lanes;
- cache by artifact hash;
- single-flight identical artifacts shared by multiple instances;
- reuse provider/source evidence across duplicates while retaining exact hash identity;
- virtualize large result lists;
- never block initial app usability on deep classification of an entire library;
- prioritize visible/current-instance items first;
- persist completed classifications so restart does not repeat work.

### 13.5.12 Security and false-safe policy

Mod JARs are untrusted input.

- parse archives defensively;
- never execute code just to classify it;
- bound archive expansion and parser resource use;
- reject traversal/path tricks;
- treat malformed bytecode/resources as unknown, not safe;
- do not expose secrets to source/provider analyzers;
- do not claim **Forever World Safe** when decisive evidence is missing.

The false-positive policy is asymmetric: a false "risky" classification is annoying; a false "safe to remove" classification can destroy a world. Bias the final safety label accordingly while keeping the explanation precise enough that the user can make an informed exception.

## 13.6 Activity/download manager

Enderloom already has activity/task concepts. Finish them into a persistent first-class operation center.

Every install/update/import/export/repair/download/server setup/pack upgrade should expose:

- operation type;
- owning instance/server/project;
- current stage;
- bytes completed/total where knowable;
- item count completed/total;
- meaningful current file/project;
- retry state;
- final result and concise error if failed.

Support where technically possible:

- pause/resume for resumable downloads;
- cancel without corrupting destination state;
- retry only failed operations/items;
- persisted queue/recovery across app restart;
- configurable concurrency;
- optional bandwidth cap;
- de-duplicated identical downloads across simultaneous jobs;
- HTTP range/resume with hash verification where providers allow it.

Never let an operation disappear because the user navigated to another page.

## 13.7 Play/Home experience and OS integration

Make launching the game the easiest thing in Enderloom.

The main Play/Home surface should combine:

- recent instances;
- favorites/pinned instances;
- groups/tags;
- last played;
- total playtime;
- current install/update/health state;
- one-click Play;
- quick actions without opening a full settings page.

Add native OS conveniences:

- create/remove desktop shortcut per instance;
- Start menu/app shortcut integration where appropriate;
- `enderloom://` deep links for supported internal destinations/actions;
- file associations/open-with handling for Enderloom-supported pack formats such as MRPack/packwiz/recognized CurseForge exports;
- drag/drop packs, mods, resource packs, shaders, worlds and supported archives onto a valid target with a preview before mutation.

Do not associate generic file types so broadly that Enderloom hijacks unrelated files.

## 13.8 Cross-instance settings sync

Implement local-first cross-instance sync comparable to modern Modrinth, but with stronger visibility and rollback.

Allow users to choose sync categories such as:

- `options.txt` / game options;
- multiplayer server list;
- resource packs plus enabled state/order;
- command history;
- creative hotbars;
- other clearly compatible user preferences that can be safely versioned.

Requirements:

- opt-in by category;
- per-instance override/desync;
- bi-directional propagation;
- change detection instead of constant blind copies;
- automatic backup before replacing a destination copy;
- explicit conflict handling when two instances changed the same state independently;
- version/format-aware adaptation where Minecraft formats differ;
- no world/save syncing hidden inside settings sync.

This should work locally without requiring an Enderloom cloud account. Remote synchronization can later use a user-selected supported storage/provider, but local sync must remain useful by itself.

## 13.9 Screenshots and media library

Add a first-class screenshot experience:

- global screenshots page across instances;
- per-instance screenshots tab;
- fast thumbnail grid that remains smooth with thousands of images;
- full viewer;
- reveal/open/copy/delete;
- basic non-destructive rotate/crop/export when practical;
- metadata for instance and capture time;
- search/filter/sort by instance/date;
- multi-select bulk export/delete;
- safe handling of files added/removed outside Enderloom.

Do not preload thousands of full-resolution images into the renderer.

## 13.10 Worlds workspace, World Detail, and Forever World Guard

Enderloom already has a working **Worlds** tab inside each instance through the existing `WorldsPanel`. Keep that implementation and its native world APIs as the canonical base; do **not** build a second disconnected world manager.

Upgrade it into a first-class **Worlds workspace**:

- keep the per-instance Worlds tab for context;
- add a top-level **Worlds** navigation destination that aggregates worlds across every connected/local instance;
- reuse the same world records, import/delete/snapshot/reveal operations and native ownership underneath both surfaces;
- show instance ownership clearly on the global surface;
- search, filter and sort across world name, instance, Minecraft version, loader/profile, last played, size, status and Forever World state;
- detect worlds added, renamed, moved or removed outside Enderloom without making the user manually refresh metadata;
- never duplicate or move a real save merely because it appears in the global view.

### 13.10.1 World cards should open a real World Detail view

A world card is a doorway, not the end of the workflow. Clicking the card should open a seamless **World Detail** view inside Enderloom using the existing navigation/back-stack behavior.

The header should make the world understandable at a glance:

- world icon;
- world name and folder name;
- owning instance/profile;
- Minecraft version + data version;
- loader/profile context where relevant;
- game mode, difficulty and Hardcore state;
- last played;
- total size;
- status/metadata health;
- **Forever World** state;
- concise safety summary such as `Healthy · Protected · 3 snapshots · 2 persistent-content mods`;
- primary actions such as **Play**, **Snapshot**, **Open folder**, **Export**, and a compact More menu.

Do not dump twenty equally loud buttons into the header. Put the common actions first and deeper/rare actions in context menus or the relevant detail section.

When supported by the target Minecraft version/runtime, **Play this world** should use the correct native quick-play/singleplayer launch path. Where a version cannot safely support direct world selection, open/launch the owning instance normally and preserve the world as the selected/focused target instead of faking support.

### 13.10.2 World Overview

The default detail surface should answer the common questions without requiring any technical knowledge:

- world created/first-seen date where determinable;
- last played;
- total play time where reliable data exists;
- world size and per-dimension size;
- seed where safely readable from the save;
- spawn coordinates;
- world border center/size;
- day/time and weather;
- game mode, difficulty, Hardcore, commands/cheats state;
- Minecraft/data version and migration state;
- enabled data packs;
- known dimensions;
- player count / known player data files;
- region/chunk count estimates;
- backup/snapshot status;
- world health warnings;
- current content-risk summary from the mod behavior classifier.

Use human-readable cards/rows first. Technical source fields remain available in deeper views.

### 13.10.3 Make **Forever World** a world-level property

The user must be able to mark an individual save **Forever World**, even when other worlds in the same instance are disposable/test worlds.

This is a persisted Enderloom policy attached to the world identity, not a separate launcher mode.

When enabled:

- automatically establish a baseline fingerprint + content manifest for the world;
- identify the exact mod/profile state associated with the baseline;
- automatically snapshot before changes that may affect the save;
- raise the verification level for Minecraft-version migrations;
- run removal/update risk against the actual world when world-persistent content is implicated;
- warn before launching the world when required save-critical content disappeared since its last known-good state;
- track changes in vanilla-impact/world-impact classifications between installed versions;
- preserve known-good rollback state before a risky mutation;
- never silently prune or rewrite world data merely to make a removed mod stop erroring;
- prefer low-impact/Vanilla Untouched/Forever World Safe suggestions in relevant Discover flows without hiding other mods;
- expose a calm status such as **Protected**, **Attention needed**, **Migration pending**, or **Last verified state changed** rather than screaming warnings for routine harmless changes.

A world-level Forever World flag takes precedence for that save. An instance-level Forever World preference remains useful as the default for new worlds and profile-wide recommendations.

### 13.10.4 World Safety & Mod Footprint

Add a **Safety & Mods** section that connects the world directly to the mod-behavior intelligence from section 13.5.

Show:

- exact currently installed mod/profile state;
- mods classified as world-persistent;
- mods that add dimensions;
- mods that add biomes/worldgen/structures;
- mods that add persistent blocks/block entities/entities;
- mods that modify vanilla biomes/worldgen/creatures/spawns/loot/recipes/tags/trades;
- mods carrying player capabilities/components/attachments or SavedData;
- mods proven client-only / no-save-impact;
- unknown/unclassified items;
- content that was present in an earlier known-good state but is now missing;
- content newly introduced since the last snapshot/baseline.

For each mod, allow **Why?** / **What does this affect?** to open the same evidence-backed behavior details used elsewhere in Enderloom.

Do not infer that a mod is safe to remove merely because it is absent from generated chunks or because no obvious custom blocks were found. Use the complete removal-audit rules from section 13.5.

### 13.10.5 Save-aware Removal Audit from the world itself

From World Detail the user should be able to ask **Can I remove this mod from this world?** without leaving the world page.

Enderloom should combine:

- artifact behavior classification;
- current installed dependencies;
- world baseline/history;
- actual save evidence;
- player data;
- per-dimension data;
- region/chunk palettes;
- entities/block entities;
- SavedData/components/capabilities where inspectable;
- data packs/worldgen references;
- previous snapshots if available.

Return a simple outcome first:

- **Safe to remove from this world**;
- **Safe after cleanup/migration**;
- **Will remove/lose mod-owned content**;
- **World-critical — keep installed**;
- **Unknown — not enough evidence**.

Then show the evidence underneath. Never convert uncertainty into a green badge.

### 13.10.6 Dimensions and world structure

Add a **Dimensions** view with one row/card per known dimension, including vanilla and modded dimensions.

Where determinable, show:

- dimension identifier;
- provider/mod ownership;
- region/chunk count;
- disk size;
- last modified/activity signal;
- worldgen/generator type;
- known structures/POI/entity-region presence;
- whether the dimension is referenced by a currently missing mod;
- whether its provider changed since the baseline.

A missing provider for a persistent modded dimension should be treated as a serious Forever World issue before launch/update, not discovered only after the user enters the world.

### 13.10.7 Data Packs, worldgen, and vanilla-impact visibility

World Detail should expose the save's actual data-pack state, not merely the instance's available ZIP files.

Show:

- enabled packs and ordering;
- disabled/available packs when determinable;
- built-in/mod-provided packs where attribution can be established;
- pack format/version compatibility;
- worldgen/registry implications;
- stale/missing pack references;
- vanilla namespace overrides from active packs;
- pack changes since the selected snapshot/baseline.

This should integrate with the same **Vanilla Untouched** evidence model used for mods.

### 13.10.8 Players, advancements, statistics, and inventories

Add a respectful **Players** area when player data exists.

For each known player, where the save actually provides the information, show:

- name when resolvable locally/cached, otherwise UUID;
- last known dimension/position;
- game mode where stored;
- health/XP/level where stored;
- spawn point where stored;
- advancement progress summary;
- statistics summary;
- inventory/ender-chest item overview;
- mod-owned item IDs or data references that would become invalid if content is removed.

This is primarily a read/diagnostic surface. Do not expose destructive raw-player edits casually. Any future edit/repair action must snapshot first and use schema-aware operations rather than blind NBT mutation.

### 13.10.9 World Data Explorer / NBT without needing an external tool

Add an **Advanced Data** view for users who want the actual save details.

Requirements:

- read-only structured NBT/tree browsing by default;
- clear source file (`level.dat`, `playerdata/...`, `data/...`, etc.);
- search keys/values/identifiers;
- type-aware rendering for compounds/lists/numbers/strings/arrays;
- lazy-load large branches instead of materializing the whole save into React state;
- copy selected paths/values;
- export a selected subtree to a reviewable JSON/text representation;
- compare the same field/tree against a snapshot or previous known-good state;
- label recovered/damaged metadata truthfully;
- never execute mod classes to interpret the save.

If Enderloom later supports NBT editing, it must be a separate explicit advanced action with automatic snapshot, schema/range validation, atomic write and rollback. Raw editing is not required merely to satisfy the viewer.

### 13.10.10 Snapshots, timeline, and state history

World Detail should have a **History** timeline combining meaningful world events:

- Enderloom snapshots;
- imports/restores;
- Minecraft version changes;
- loader/profile changes that affect the world;
- mod installs/removals/updates with save-impact relevance;
- data-pack changes;
- Forever World enabled/disabled;
- migration checkpoints;
- detected world metadata recovery/damage;
- successful launches after a risky change;
- rollbacks.

Each snapshot/history point should show what changed relative to the current world or adjacent checkpoint.

Support **Compare** before Restore so the user can see:

- profile/content differences;
- mod behavior/safety differences;
- data-pack differences;
- version/data-version differences;
- world size/dimension differences;
- known missing provider IDs;
- relevant world-health changes.

Restores continue using the existing safe snapshot system; do not create a second backup implementation for Worlds.

### 13.10.11 Health, corruption, and recovery

Expand the existing `normal / recovered / damaged` metadata handling into a useful **World Health** summary.

Check what can be checked safely without loading arbitrary mod code, including:

- `level.dat` readability + backup fallback;
- required save directories/files;
- obvious truncated/corrupt NBT;
- region header/sector sanity when performing a deep scan;
- missing dimension/provider evidence;
- stale/missing data packs;
- unsupported data-version downgrade attempts;
- suspicious zero-byte/core save files;
- missing content relative to the last known-good manifest;
- disk-space risk before snapshot/migration.

Offer **Repair / Fix All** only for repairs Enderloom can perform safely and reversibly. Snapshot before any mutation. If recovery would necessarily lose data, state exactly what will be lost before applying it.

### 13.10.12 Storage and cleanup

World Detail should make disk usage understandable:

- total world size;
- size by dimension;
- region/entity/POI/data/player/stat/advancement categories;
- snapshot storage attributable to the world;
- optional cache/index size;
- largest files/regions when useful.

Do not offer dangerous "clean unused chunks" or delete-dimension buttons merely because they would save space. Cleanup must understand Minecraft save semantics and protect Forever Worlds by default.

### 13.10.13 Migration Readiness

Before a significant Minecraft-version, loader, or modpack migration, the world page should produce a **Migration Readiness** summary:

- current version/data version;
- proposed target;
- required Java/loader implications inherited from the profile;
- removed/missing world-critical mods;
- mod IDs or namespaces that disappear/change;
- dimensions/providers at risk;
- worldgen/biome registry changes;
- active data-pack compatibility;
- backup free-space requirement;
- latest verified rollback point;
- exact items Enderloom could not prove safe.

For Forever Worlds, a large migration always gets a durable pre-migration snapshot/checkpoint. Never overwrite the only known-good copy.

### 13.10.14 Performance and world diagnostics

Where useful, connect World Detail to the existing Performance Clinic / Spark workflow:

- world size/chunk counts are context, not automatic blame;
- surface unusually heavy entity/block-entity/chunk/worldgen evidence when actual profiler data exists;
- associate Spark/profile evidence with the world + profile state that produced it;
- compare before/after evidence across a mod/update change;
- do not label a mod/world "slow" from static guesses alone.

### 13.10.15 UX and performance requirements

The Worlds experience must stay fast even with very large saves and many instances.

- world list opens from cached/lightweight metadata immediately;
- expensive chunk/entity/registry scans run only when their result is needed or stale;
- index/cache results by world identity + decisive file/fingerprint inputs;
- invalidate narrowly when relevant world files change;
- display progressive results without blocking navigation;
- cancelling/leaving a deep scan must not corrupt the world or leave a fake completed result;
- never read entire multi-gigabyte region sets into renderer memory;
- parse heavy save data in native/background worker ownership, not the React render thread;
- virtualize long tables such as thousands of snapshots/files/players/regions where necessary;
- all sections deep-link cleanly and preserve Back behavior;
- opening a world from global search, a warning, a snapshot, or an instance should land on the same canonical World Detail route.

The goal is that a normal user sees a beautiful, simple world page, while an advanced user can drill all the way down to save internals without leaving Enderloom.

### 13.10.16 Existing world actions still matter

Preserve and polish existing capabilities already present in `WorldsPanel` / native APIs:

- import world folder/ZIP with pre-inspection;
- list/read world metadata;
- recover metadata when possible;
- reveal world folder;
- delete with game-running protection;
- search/filter;
- snapshots/restore through the existing snapshot system.

Also finish previously noted world-management gaps:

- rename;
- icon/thumbnail management;
- copy/duplicate;
- export/backup bundle;
- clear local-world vs server-world distinction.

Do not regress these while adding the global/detail experience.

## 13.11 Share instances without making users manually zip folders

Keep existing pack export, but add a friendlier **Share Instance** workflow.

A share payload should be deterministic and reviewable, containing references/hashes for managed content plus only the configuration/override files the user selected to share.

Support:

- shareable Enderloom bundle/file;
- preview before import;
- exact missing/external/manual content disclosure;
- delta/update bundle between two shared states so the whole profile does not need to be resent every time;
- recipient review before applying updates;
- local additions layered on top without silently disappearing;
- provenance and hash checks before install.

If an official third-party service exposes a supported authenticated collaboration API, integrate it through that real contract. Do not fake CurseForge/Modrinth proprietary cloud/share services.

Enderloom-native sharing must still be excellent even without a proprietary hosted backend.

## 13.12 Universal search, command palette, and settings search

Add a fast `Ctrl+K` / command-palette style surface that can find and act on:

- instances;
- installed content;
- Discover projects;
- worlds;
- servers;
- screenshots;
- settings;
- logs/diagnostics;
- common commands/actions.

Settings search should deep-link to and focus the exact setting, not merely open the Settings page.

Preserve normal mouse navigation; this is an accelerator, not the only way to use the app.

Search should remain responsive with large libraries and should use indexed/cached data rather than rescanning disk on every keystroke.

## 13.13 Signed self-update with automatic rollback

The current parity matrix correctly refuses to pretend the inherited Tauri updater works. Finish a real Enderloom updater.

Implement a genuine Electron-compatible update path using Enderloom's actual release channel:

- check for signed/authorized Enderloom releases;
- show release notes/version;
- download in the activity manager;
- verify expected release identity, hash and signature/code-signing evidence where available;
- back up/migrate app database/state before applying;
- stage update rather than mutating the running install in place;
- restart into the new version;
- detect failed startup/migration and recover the previous usable app version/state;
- retain a manual-update fallback.

Support stable and optional prerelease channels if release publishing supports them.

Never execute an unverified downloaded installer merely because a version number is newer.

## 13.14 Storage intelligence and de-duplication

Add a Storage page that explains where disk space went:

- instances;
- worlds;
- snapshots;
- mods/content;
- Minecraft assets/libraries;
- Java runtimes;
- download caches;
- logs;
- screenshots;
- app/browser caches.

Support safe cleanup with a preview of exactly what will be removed.

Implement a content-addressed shared blob/cache layer for **identical managed immutable downloads** where it safely reduces duplicate storage across Enderloom-owned instances.

Use hashes as identity and safe hardlink/reflink/copy-on-write techniques only when filesystem semantics make them safe. Never let editing/deleting one instance mutate another instance unexpectedly.

Do not rewrite or hardlink through externally owned CurseForge/Modrinth profile roots unless the operation is explicitly safe and ownership rules allow it.

Detect and reclaim orphaned staged downloads/caches after interrupted jobs without touching valid user content.

## 13.15 Better onboarding and migration

A polished first run should explain itself by doing useful work.

Provide a short onboarding checklist that can be skipped/dismissed and never becomes nagware:

- sign into Minecraft when needed;
- discover/install Java automatically;
- detect existing launcher libraries;
- connect/import an existing profile;
- create/install a first instance;
- optionally connect provider/OpenAI features.

Expand migration support beyond the currently accepted CurseForge/Modrinth in-place discovery when practical. Detect popular launchers such as Prism/MultiMC derivatives, ATLauncher and GDLauncher using explicit adapters rather than generic folder guessing.

Prefer connecting/reusing in place when safe and supported; copying remains an explicit user choice.

Keep provenance so a migrated profile can still explain where each piece of content came from.

## 13.16 Accounts, skins, and capes polish

Finish the remaining account presentation gap:

- reliable fast switching among multiple Microsoft/Minecraft accounts;
- clear active-account state;
- proactive re-authentication when a token can no longer be refreshed;
- account-specific skin library;
- accurate interactive 3D skin preview;
- cape preview/selection where official account APIs actually permit it;
- no credential/token leakage into renderer logs or project files.

A sign-in failure should say what action is required rather than presenting a generic launch failure.

## 13.17 Offline and flaky-network behavior

Enderloom should remain useful when provider APIs are slow or temporarily unavailable.

Support:

- launching already-installed instances using legitimately cached authentication/entitlement state when the Minecraft account flow permits it;
- cached library/instance/content metadata;
- cached project details/changelogs where fresh data is not required;
- clear stale/offline indicators;
- resumable downloads;
- retry/backoff with a changed strategy rather than request spam;
- queued refresh/update checks that resume when connectivity returns.

Never bypass authentication/entitlement requirements merely to call something "offline mode."

## 13.18 UI performance budgets and large-library behavior

Treat responsiveness as a release feature.

The app should stay smooth with:

- thousands of installed content rows;
- hundreds of instances;
- large logs;
- thousands of screenshots;
- many worlds/snapshots;
- several concurrent downloads/tasks.

Use virtualization, incremental indexing, lazy loading and worker/native processing where they actually help.

Heavy views such as image galleries, 3D skin preview, huge logs and editors should load only when needed.

Do not make startup wait for every provider refresh, screenshot scan, gallery decode, server probe or update check before the user can interact with the Play/Library surface.

Persist enough indexed state to paint useful UI quickly, then reconcile in the background.

## 13.19 Security and untrusted-content handling

Treat imported/downloaded packs and returned AI artifacts as untrusted input until validated.

Keep and expand protections for:

- path traversal and archive escape;
- symlink/junction hazards;
- ZIP bombs/unreasonable extraction expansion;
- corrupted archives/JARs;
- provider/hash mismatch;
- unexpected executable/script payloads in imports;
- unsafe file overwrite outside the intended instance root;
- secrets in exported support bundles;
- renderer-to-main privilege boundaries.

Show provenance for manual/unverified files without pretending a provider reviewed them.

Do not silently execute pack-supplied scripts/installers simply because they were inside an archive.

## 13.20 Enderloom features that should beat both major launchers

These should become signature quality-of-life advantages rather than hidden engineering internals.

### Safe Update

One action that snapshots, resolves, updates, validates and automatically rolls back a broken managed update.

### Fix All

One action after a failed launch that uses exact local evidence, recent change history and existing repair intelligence to repair as much as possible without destructive guessing.

### Forever World Guard

Automatic world/profile protection around risky worldgen/registry/dimension/game-version changes.

### Compare Profiles / Compare States

A human-readable diff of two instances or snapshots: game/loader, mods and exact versions, configs, resource packs/shaders/data packs, important JVM settings and known world-risk differences.

### Performance Clinic

Make performance analysis a first-class Enderloom workflow rather than a forum ritual.

Where applicable:

- detect or offer a compatible Spark installation/profile path;
- capture/import Spark client/server evidence;
- associate hotspots with installed content;
- compare before/after captures;
- detect obvious render/tick/allocation/network offenders;
- recommend only changes supported by evidence;
- apply safe changes through the same snapshot/rollback system;
- never "optimize" by silently lowering render distance, simulation distance, graphics, particles, entity counts or mod functionality.

### Provider-agnostic content identity

Use the Catalog/provider research layer to recognize when CurseForge, Modrinth, GitHub or manual files represent the same project/version and avoid duplicates while retaining source provenance.

### Local mod engineering handoff

No mainstream launcher combines daily launcher management with Enderloom's Create/Convert/Repair/Optimize + OpenAI/Codex round trip. Make that integration feel like a natural **Repair source / Port this / Optimize this** extension of the same instance/content UI rather than a developer-only separate tool.

## 13.21 Consistent interaction rules

Apply these across the whole app instead of polishing only one screen:

- right-click/context actions on meaningful cards/rows/groups;
- consistent multi-select behavior;
- drag/drop only where the target action is obvious and reversible;
- useful empty states with a real next action;
- skeleton/progress state rather than blank panels;
- errors persist long enough to read and remain accessible in Activity/History;
- destructive actions state exactly what will be deleted versus disconnected;
- undo/snackbar for immediately reversible actions where appropriate;
- back/forward navigation restores the prior list/search/filter position;
- tooltips are delayed and do not flicker/reopen aggressively;
- keyboard focus is visible and logical;
- modal focus trapping works;
- screen-reader labels for icon-only controls;
- color contrast does not rely only on hue;
- respect reduced-motion preference;
- UI scaling works without clipping at common Windows scaling levels.

## 13.22 Coordinated parallel implementation — do the work together, not one tiny feature at a time

Codex should treat this entire document as **one product convergence push**.

Parallelize independent work when file ownership/dependencies allow it instead of serializing everything behind one lane.

Useful concurrent ownership lanes are:

- **Platform/reliability:** updater, task persistence, download manager, storage, restart recovery, OS integration;
- **Content intelligence:** Safe Update, Update All, resolver/conflicts, dependency graph, side/vanilla/world-safety classification, removal audits, change history/undo;
- **Daily UX:** Play/Home, command palette/settings search, onboarding, screenshots, accessibility/polish;
- **Instances/worlds:** sync, world polish, Forever World Guard, sharing/migration;
- **Diagnostics/performance:** crash-aware Fix All, integrity repair, Performance Clinic/Spark integration;
- **AI/mod engineering:** existing Northpoint + OpenAI Hand Off/Take Back integration;
- **Verification/release:** real Electron E2E, stress/regression, packaging and signed update path.

Do not let every lane edit giant `main.js` or the same React root simultaneously. Extract/reuse responsibility-specific owners so parallel work has clean boundaries.

Parallel work still shares one canonical schema/job/history model and one accepted product behavior. Do not merge six competing task systems, notification systems, databases, backup formats or settings stores.

A lane that hits an external blocker keeps its state, moves to another independent acceptance item, and resumes later. It does not stall the other lanes.

## 13.23 Convergence tests are internal, not user ceremony

Before calling this launcher-completeness push complete, exercise real scenarios including:

- Update All with compatible dependency changes;
- interrupted multi-file update followed by restart/resume or rollback;
- a newly broken update automatically restored to known-good;
- duplicate mod ID / wrong-loader / missing-dependency conflict detection;
- bulk enable/disable/freeze/update on a large instance;
- hundreds/thousands of content rows without UI lockup;
- settings sync conflict and per-instance override;
- thousands of screenshots without renderer memory explosion;
- risky worldgen/dimension removal causing a protective snapshot;
- client-only/server-only/both classification fixtures across Fabric/Quilt/Forge/NeoForge;
- Vanilla Untouched versus Changes Vanilla fixtures covering `data/minecraft`, vanilla Mixins, biome modifiers, spawn changes and resource-only overrides;
- additive world-persistent mod correctly *not* labeled Forever World Safe;
- exact version update whose behavior changes from vanilla-untouched to vanilla-biome-changing being caught before Safe Update commits;
- save-aware removal audit finding namespaced block/entity/player/dimension references in a real fixture world;
- clean world removal audit proving a no-save-footprint client mod safe to remove;
- state compare/history undo;
- crash-aware Fix All using a real failure fixture;
- Spark/performance evidence import and before/after comparison;
- storage cleanup/dedup without cross-instance mutation;
- app update staging with a deliberately failed new-version startup and rollback;
- offline/provider-outage behavior while existing instances remain usable where legitimately possible;
- shortcut/deep-link/file-association actions opening the exact intended target;
- restart during active work preserving the operation rather than orphaning it;
- external CurseForge/Modrinth profiles remaining byte-safe unless an explicit supported mutation was requested.

These checks happen behind the product. The user should experience the result as **Enderloom just working**.


## 13.24 Common-sense finishing layer — eliminate the remaining “why does the user have to do this manually?” gaps

These are not separate products or novelty features. They are the last layer of ordinary launcher behavior that should make Enderloom feel dependable enough that the user stops thinking about the launcher itself.

### 13.24.1 Last Known Good + “What changed since it worked?”

Track the exact state associated with successful launches instead of treating every launch as unrelated.

For each instance keep a lightweight **Last Known Good** fingerprint covering, as applicable:

- Minecraft and loader version;
- exact enabled mod/content hashes and versions;
- Java runtime and relevant JVM/memory settings;
- important config fingerprints;
- enabled resource packs/shaders/datapacks and order;
- relevant game options;
- world selected/loaded when known;
- the successful launch/process identity and timestamp.

After a failed launch, crash, or severe regression, Enderloom should immediately answer:

- **What changed since the last successful launch?**
- which mods were added, removed, updated or toggled;
- which configs changed;
- whether Java/JVM/memory/loader/game-version changed;
- whether pack/datapack order changed;
- whether the active world or world-critical content changed.

Offer a safe one-click **Restore last working state** when the recorded delta is reversible. Snapshot before rollback when needed. Do not guess that the most recent change is guilty unless evidence supports it; show the delta and use it as repair input.

New or changed content can be marked subtly until the instance completes a successful launch so the user can instantly see what is still unproven.

### 13.24.2 Safe Test — disposable staging copies without making the user clone things manually

For risky updates, removals, Minecraft/loader migrations, repair experiments, config changes, or Forever World work, Enderloom should be able to create an **ephemeral test copy** automatically.

Requirements:

- preserve the real instance/world untouched;
- use copy-on-write, hardlinks, immutable shared cache objects, reflinks or normal copying only where each strategy is safe for the filesystem/content involved;
- never hardlink mutable world/config files in a way that lets the test mutate the source;
- launch and test the staged state using the real runtime;
- compare launch result, logs, dependency state, world-open result and performance evidence when applicable;
- promote only the exact proven delta back to the real instance transactionally;
- discard failed test copies cleanly;
- keep enough evidence to explain what was tested.

A Forever World should strongly prefer this lane for high-risk version/mod/worldgen changes when feasible, but the user should not have to understand or manage the staging directory.

### 13.24.3 Automatic crash culprit bisection

When a reproducible failure appears mod-related and the cause is not already obvious, Enderloom should be able to isolate the culprit automatically instead of telling the user to disable fifty mods one at a time.

Use an ephemeral test copy and dependency-aware bisection:

1. start from the recent-change/suspect set;
2. preserve required libraries/dependency closures and loader-critical content;
3. disable/test groups intelligently;
4. narrow the failing set until one artifact or the smallest practical interaction set remains;
5. validate the result with another confirming run when feasible;
6. restore/leave the real instance unchanged;
7. feed the discovered culprit/conflict directly into Fix All / Repair / Hand Off as appropriate.

Do not permanently rename/delete/toggle files in the user’s real instance during bisection.

### 13.24.4 Game Settings & Keybind Center

Cross-instance sync is not enough. Enderloom should also provide a first-class editor for Minecraft settings and controls.

Support, version permitting:

- searchable `options.txt` values;
- recognizable keybind/action names;
- modded keybindings and the mod/project that owns them when provenance can be resolved;
- conflict detection when multiple actions use the same key/chord;
- filters by key, action, category and owning mod;
- per-instance edit versus synced/default value;
- reset one setting/keybind to inherited/default state;
- preserve unknown/modded options instead of rewriting the file destructively;
- validate/coerce values only when the exact target version format is understood;
- diff settings against another instance, snapshot or Last Known Good state.

A user should be able to answer **“what mod owns this keybind?”** and **“what is conflicting with Mouse 4?”** directly in Enderloom.

### 13.24.5 Config Center — searchable configs with history instead of opening random files in Notepad

Add a unified Config Center over the real instance/world config files.

Cover common formats such as TOML, JSON/JSON5 where safely parseable, YAML, properties and plain text, plus world-scoped `serverconfig`/equivalent locations where applicable.

Capabilities:

- group config files by owning mod/project when resolvable;
- search filenames, keys and values across the instance;
- syntax validation before committing edits;
- schema-aware controls when trustworthy metadata/schema exists;
- raw editor fallback instead of inventing fake forms;
- show changed-from-default/previous state when that evidence exists;
- diff against Last Known Good, snapshot or another instance;
- restore one key/file from a known-good version;
- keep automatic pre-edit backup/history;
- reuse the existing three-way merge logic for modpack/config upgrades;
- show which configs are world-scoped versus global/client/common;
- surface configs related to a selected installed mod directly from its content page.

For Forever Worlds, warn when a config change materially alters worldgen/registry/dimension behavior and route it through the same snapshot/staging protection instead of treating all configs as harmless text.

### 13.24.6 Verified Backup Vault

Snapshots are only useful if the backup actually exists and can be read later.

Allow user-selected backup destinations including:

- another local drive/folder;
- removable/external storage;
- network/NAS paths when the OS exposes them normally;
- user-managed cloud-synced folders such as OneDrive/Dropbox without pretending Enderloom owns those cloud APIs.

Requirements:

- world-only or full-instance backup targets;
- retention rules by count/age/space;
- incremental/deduplicated storage where safe;
- manifest + hash verification after backup;
- verify archives/files can be reopened/listed;
- preview exactly what a restore will replace;
- restore into a temporary location or validate the manifest before replacing live data when practical;
- show last verified backup age/status on Forever World and instance surfaces;
- automatically create/verify a local recovery point before dangerous operations even when no external destination is configured.

Do not claim “backed up” merely because a copy command returned success.

### 13.24.7 Move / Relocate without breaking the instance

Add a proper **Move** action for instances, worlds, snapshot storage and Enderloom-owned caches.

The flow should:

1. calculate required space before starting;
2. block/queue until the relevant game/write task is stopped;
3. copy to the destination;
4. hash/verify important content and metadata;
5. atomically switch Enderloom’s canonical path only after verification;
6. preserve/recover the source until the destination is proven usable;
7. optionally remove the old copy only after success;
8. resume safely after interruption instead of leaving a half-moved instance.

For externally owned CurseForge/Modrinth/Prism/etc. profiles, clearly distinguish **reconnect**, **clone/copy**, and an actual move that the external launcher also understands. Never silently move another launcher’s library behind its back.

### 13.24.8 Live external-change reconciliation and concurrent-launcher safety

Enderloom already supports external libraries, so stale cached state and two launchers writing the same profile are unacceptable.

Implement efficient debounced filesystem observation for relevant directories/files so Enderloom notices:

- mods manually added/removed/replaced;
- configs edited externally;
- worlds created/renamed/deleted;
- screenshots/datapacks/resource packs changed outside the app;
- another launcher changing a connected external profile.

Reconcile only affected paths instead of rescanning the whole library.

During destructive/multi-file Enderloom operations use an ownership/transaction lock for Enderloom-managed state. When another process/launcher is actively mutating the same connected profile, defer or warn before a conflicting write instead of racing it.

A stale UI should never tell the user a file/version still exists when it changed on disk minutes ago.

### 13.24.9 Preflight health checks before expensive or destructive work

Before launch/update/snapshot/migration/move/import, cheaply verify the conditions that commonly cause dumb half-failures:

- enough free disk space, including temporary/staging overhead;
- destination path is online/writable;
- expected Java exists and is executable;
- required Minecraft assets/libraries are present or recoverable;
- no known duplicate mod IDs/wrong-loader artifacts are about to launch;
- files that must be replaced are not unexpectedly locked;
- Windows path-length/invalid-name hazards where relevant;
- external/cloud-placeholder files needed for the operation are actually locally available;
- enough space remains for rollback/snapshot if the operation promises rollback.

Fix automatically when safe. Do not turn harmless advisory findings into blockers.

### 13.24.10 Manual JAR/drop intelligence — never blindly copy a mystery file into `mods`

When the user drags in or imports a manual JAR, inspect it before mutation.

Show or resolve automatically:

- mod ID/name/version;
- Minecraft/loader compatibility;
- dependency requirements;
- whether it is client/server/both;
- vanilla/world-impact classification where available;
- whether the same project/version already exists under another provider/file name;
- whether it is older/newer than the installed copy;
- whether it should be treated as a replacement/update instead of a second duplicate;
- embedded JAR/native/executable/security-relevant contents;
- provider/source match and provenance when a trusted match can be established.

Wrong-loader/wrong-version/duplicate-ID files should not be blindly copied and left to crash later. Route legitimate replacements through Safe Update/history/snapshot behavior.

### 13.24.11 Resource-pack/shader order and override visibility

Treat resource packs and shaders as managed state rather than just ZIP files.

Support:

- enable/disable and explicit load order;
- drag reorder with keyboard-accessible alternatives;
- compatible-version visibility;
- current selected shader where detectable;
- diff/order history through snapshots/settings sync;
- explain obvious namespace/path overrides between enabled resource packs without loading every texture into memory;
- show when a modpack owns a pack versus one the user added;
- preserve ordering through updates and cross-instance sync.

### 13.24.12 Optional Windows integration that actually helps

Add OS integration only where it reduces clicks:

- optional system tray while Enderloom is running;
- taskbar progress for real installs/downloads/updates;
- jump-list/quick actions for recent/favorite instances where supported;
- native notifications backed by persistent Activity entries, not ephemeral toast-only state;
- quick launch of favorite instances/worlds from supported shortcuts/deep links.

Do not force minimize-to-tray, keep hidden background processes alive unnecessarily, or make OS integration required for core functionality.

### 13.24.13 Enderloom settings/metadata disaster recovery

The user should be able to reinstall Enderloom without losing the organization layer they built around Minecraft.

Provide an export/import or recoverable backup for Enderloom-owned non-secret state such as:

- connected instance/library mappings;
- groups/tags/favorites/pins/notes;
- UI/preferences and sync policies;
- provider project links/provenance;
- Forever World flags/baselines where portable;
- task/history metadata needed for recovery;
- snapshot/backup catalog metadata.

Secrets, OAuth tokens, Microsoft credentials and provider API keys must never be dumped into a plaintext settings backup.

On first run after reinstall, detecting known libraries plus importing this metadata should restore the organizational state rather than making the user rebuild it manually.

### 13.24.14 Smart Java/memory defaults without magic garbage JVM flags

Enderloom already manages Java and memory; finish the user experience around it.

Offer an **Auto** memory mode that chooses a conservative allocation from total RAM, instance/content footprint and observed behavior while avoiding harmful over-allocation. Show the chosen value and let the user override it.

For Java/runtime selection:

- show exactly which Java is being used and why;
- validate architecture/version against the target Minecraft/loader;
- offer **Test Java** / repair when the runtime is broken;
- keep per-instance override with a clear path back to Auto;
- do not inject internet-cargo-cult JVM flag packs as “optimization”.

### 13.24.15 Network/proxy and download diagnostics

Downloads should fail with useful evidence, not “network error”.

Add:

- optional system/manual proxy settings where the networking stack supports them;
- DNS/TLS/HTTP/provider diagnostics for a failed endpoint;
- retry/resume using the same persisted Activity job;
- mirror/CDN fallback only when the provider contract actually offers an alternate source;
- existing bandwidth/concurrency controls integrated into the same settings surface;
- final hash/size verification regardless of download source.

Keep existing installed instances launchable during provider outages wherever entitlement/cached runtime state legitimately permits it.

---

# 14. DEFINITION OF DONE — USER-LEVEL OUTCOMES

Enderloom is done with this work when all of these are true in the actual app:

- [ ] The user can Create a mod and Enderloom carries it through build/runtime/performance/artifact without babysitting.
- [ ] The user can Convert a mod and legitimate content from relevant older/newer branches is preserved instead of silently lost.
- [ ] The user can Repair a broken mod and Enderloom diagnoses/fixes/retests instead of merely describing the failure.
- [ ] The user can Optimize a mod without losing behavior, visuals, simulation, content, or compatibility.
- [ ] A build/runtime/performance failure causes automatic diagnosis and a changed retry strategy rather than an idle blocker.
- [ ] The requested primary target finishes before secondary matrix fan-out.
- [ ] Remembered matrix preferences work without repeated prompts.
- [ ] Secondary matrix failures do not destroy good artifacts and can be retried independently.
- [ ] Optional dependencies work both installed and absent where they are advertised as optional.
- [ ] Mixin/bytecode/data fixes are proven in the packaged runtime, not only by compilation.
- [ ] Performance comparison uses equivalent workloads and cannot pass by reducing fidelity/workload.
- [ ] The app preserves the last known-good source/artifact throughout work.
- [ ] Restarting Enderloom resumes a job from its last verified state.
- [ ] The user can connect a supported OpenAI/Codex/ChatGPT lane without storing secrets in project state.
- [ ] The user can click Hand Off without manually rewriting project context.
- [ ] The remote worker receives enough context/files/evidence to continue the exact mod job.
- [ ] The user can click Take Back without manually moving or identifying returned files.
- [ ] Returned AI work is reconciled into the same canonical job and cannot silently overwrite the known-good project.
- [ ] A bad AI return is automatically diagnosed and can be sent back to the same AI thread for correction.
- [ ] The corrected AI return can be Taken Back, locally verified, and accepted end-to-end.
- [ ] ChatGPT/Codex can use scoped canonical Enderloom operations through the supported MCP/plugin integration where enabled.
- [ ] No separate Northpoint subsystem exists; Northpoint is simply the default quality/behavior of Enderloom.
- [ ] The real Electron app exercises these flows with real backend/native wiring rather than mocked success states.
- [ ] A fresh runnable Enderloom package is produced after implementation.
- [ ] Update All resolves only compatible releases, snapshots first, applies transactionally, and can restore the prior known-good state when the update breaks.
- [ ] Instance History records content/config/loader/world/repair/launch changes with usable state diffs and rollback where supported.
- [ ] A failed launch can enter crash-aware Fix All and repair deterministic dependency/loader/Java/corruption/update failures without requiring AI.
- [ ] Dependency intelligence explains missing/conflicting/orphaned/duplicate content plus Why installed?/Required by relationships.
- [ ] Every exact mod artifact can carry evidence-backed Client/Server/Both behavior classification with Unknown used when proof is insufficient.
- [ ] Discover and installed-content views can filter by Forever World Safe, Vanilla Untouched, persistent world impact, worldgen/biomes/dimensions/mobs, vanilla changes and removal risk without manual tagging.
- [ ] Vanilla Untouched and Forever World Safe remain separate concepts; additive mods that persist blocks/entities/worldgen are never mislabeled safe-to-remove merely because they do not edit vanilla.
- [ ] A Forever World instance preference automatically prioritizes low-impact mods, snapshots risky operations, and flags updates that become more invasive without hiding the rest of the catalog.
- [ ] Installed-mod removal can run a read-only save-aware audit and explain whether the specific world is safe to remove from, will lose mod content, needs migration, or remains unknown.
- [ ] Side/world/vanilla classifications are cached by exact artifact hash, explainable through concrete evidence, conservative on uncertainty, and computed without executing untrusted mod code.
- [ ] The Activity Center persists real multi-stage operations across navigation and restart and supports safe cancel/retry plus resumable pause/resume where technically possible.
- [ ] Play/Home exposes recent/favorite/grouped instances, playtime/last played, health/update state and one-click launch without unnecessary navigation.
- [ ] Desktop shortcuts, supported pack file associations/deep links and drag/drop open the exact intended Enderloom target safely.
- [ ] Cross-instance settings sync works by selected category with backup, conflict handling and per-instance override/desync.
- [ ] Global/per-instance screenshot management remains responsive with thousands of images.
- [ ] Forever World Guard protects world/save-critical changes with snapshots and truthful risk handling.
- [ ] Worlds is available both per-instance and as a top-level cross-instance workspace without duplicating save ownership or backend logic.
- [ ] Clicking a world opens the canonical World Detail route with overview, safety/mod footprint, dimensions, datapacks, players, advanced data, history, health, storage and migration-readiness sections as applicable.
- [ ] An individual save can be marked Forever World independently of its instance, persists across restart, establishes a baseline/content manifest, and raises protection for risky updates/removals/migrations.
- [ ] World Detail can show evidence-backed persistent-mod impact and run the same save-aware Removal Audit without forcing the user back through the installed-mods screen.
- [ ] World Detail exposes readable save metadata plus a lazy read-only NBT/data explorer with search, subtree export and snapshot comparison without loading multi-gigabyte saves into renderer memory.
- [ ] World History combines snapshots, restores, version/profile/content/datapack changes and meaningful health events with usable comparisons before restore.
- [ ] Deep world scanning is cached/incremental/cancellable and never blocks the lightweight world list or mutates the save merely to inspect it.
- [ ] Share Instance produces a reviewable deterministic bundle/delta without depending on a fake proprietary cloud service.
- [ ] Ctrl+K universal search/command palette and settings search deep-link to real destinations/actions.
- [ ] Enderloom has a real verified Electron self-update path with state backup and rollback instead of the deliberately disabled inherited Tauri updater.
- [ ] Storage management explains usage, cleans only previewed safe targets, and de-duplicates identical Enderloom-owned immutable content without cross-instance corruption.
- [ ] Onboarding can detect useful existing launcher/account/Java state and guide first use without recurring nag screens.
- [ ] Account presentation includes polished multi-account switching plus real 3D skin/cape behavior where official APIs permit it.
- [ ] Existing instances remain useful during provider/network outages wherever legitimate cached auth/content permits, without bypassing entitlement.
- [ ] Large libraries/logs/screenshots/tasks remain responsive and do not block initial app usability on unrelated background reconciliation.
- [ ] Imported packs, downloaded content and AI returns remain inside hardened archive/path/hash/provenance/security boundaries.
- [ ] Compare Profiles/States, Safe Update, Fix All, Forever World Guard and Performance Clinic are polished first-class Enderloom advantages.
- [ ] Last Known Good records a successful instance state and a failed launch can show the exact meaningful delta since it last worked, with safe restoration where reversible.
- [ ] Risky updates/removals/migrations can run in an automatic disposable Safe Test copy and only promote a proven delta back to the real instance/world.
- [ ] Automatic dependency-aware crash bisection can isolate a mod/conflict in a temporary copy without permanently toggling the user’s real instance.
- [ ] Game Settings & Keybind Center can search/edit supported options, identify owning mods, detect conflicts, preserve unknown keys and integrate with sync/inheritance.
- [ ] Config Center can search, diff, validate, back up and restore mod/world configs with schema-aware editing only where trustworthy metadata exists.
- [ ] Backup Vault supports user-selected destinations, retention and real post-write verification; Forever World can show whether a recent verified recovery point actually exists.
- [ ] Instances/worlds/snapshot storage can be moved between drives with space preflight, verification, interruption recovery and no premature deletion of the source.
- [ ] External file changes and connected-launcher mutations reconcile into Enderloom promptly without whole-library rescans or stale UI, and conflicting writes are not raced blindly.
- [ ] Launch/update/migration/move/import preflight catches material space/path/Java/file-lock/availability hazards before a half-finished destructive operation.
- [ ] Manual JAR/drop intake identifies compatibility, dependencies, duplicates, provenance and behavior before installation and routes replacements through Safe Update instead of blindly copying files.
- [ ] Resource-pack/shader management preserves enabled state/order and exposes meaningful override/order information without forcing the user to edit text files manually.
- [ ] Enderloom-owned settings/organization metadata has a recoverable export/import path that explicitly excludes credentials/tokens/secrets.
- [ ] Auto Java/memory chooses sane visible defaults with per-instance override and never relies on cargo-cult JVM flag bundles.

---

# FINAL IMPLEMENTATION LAW

**Use common sense and finish the job.**

Northpoint is not a reason to add bureaucracy. It is the reason Enderloom should reliably produce high-quality mods without the user having to supervise every engineering decision.

Keep correctness, zero-loss behavior, real runtime proof, performance quality, matrix support, and secure OpenAI round trips — but implement them as automatic product behavior.

When an ordinary technical problem appears, **fix it and keep going**.

When one route stalls, **change strategy and keep going**.

When an external dependency is unavailable, **continue everything else and resume it later**.

When AI returns something broken, **repair it locally or send the evidence back to the same AI job and keep going**.

When the app already has a capable service/system, **extend it instead of inventing another one**.

The user should experience Enderloom as a smart, persistent Minecraft engineering tool that gets the work done — not as a checklist that constantly asks permission to do its own job.
