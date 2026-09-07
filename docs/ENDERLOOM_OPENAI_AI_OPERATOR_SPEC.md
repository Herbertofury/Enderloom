# Enderloom — Full OpenAI / ChatGPT / Codex AI Operator Specification

**Status:** Mandatory product/implementation contract  
**Updated:** 2026-09-07  
**Repository:** `Herbertofury/Enderloom`  
**Branch:** `main`  
**Parents:** `docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md`, `docs/ENDERLOOM_UNIFIED_STUDIO_CONFIG_HOTKEY_CLI_BRAIN_SPEC.md`, `docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md`

Enderloom should not merely “integrate ChatGPT.” It should expose its entire Minecraft capability graph to OpenAI/ChatGPT/Codex so an AI operator can create, convert, port, repair, optimize, reconstruct, test, profile, document and release Minecraft projects through the **same trusted Enderloom operations used by the GUI and CLI**.

The target experience is:

> “Make this into a premium Forge 1.20.1 mod from these references, keep every feature, make the models/animations beautiful, support Sophisticated Backpacks/Curios, optimize it, test it, and give me the finished release.”
>
> Enderloom turns that into a durable acceptance contract, gathers source/reference evidence, assigns AI specialists, creates/edits source and assets, builds, runs the cheapest decisive tests first, escalates automatically to real Minecraft server/client/visual/performance proof, repairs failures with fresh evidence, and stops only at a verified artifact or a real blocker.

**Quality law:** speed comes from orchestration, caching, parallelism and selective gates — never from skipping the strongest applicable proof or deleting capability to make a build pass.

---

# 1. AI Capability-Parity Law

Any Enderloom operation that can safely be automated should be represented once in the canonical operation/capability registry and be callable through:

- GUI;
- Enderloom CLI;
- Enderloom workflow runner;
- Enderloom MCP server;
- OpenAI Responses / Agents integration;
- embedded/local Codex integration;
- in-app ChatGPT browser workflow when that lane is selected.

Do not build special hidden AI-only implementations that bypass normal transactions/evidence/testing.

Every AI call that changes state must create normal Enderloom objects:

- task/job ID;
- actor/provider/model identity;
- exact operation arguments;
- source/input hashes;
- output artifact hashes;
- approval/policy state;
- build/test evidence;
- acceptance ledger updates;
- rollback lineage;
- Evidence Brain candidate observations.

AI cannot self-declare success. Only Enderloom acceptance evidence can close a requirement.

---

# 2. Supported OpenAI Integration Lanes

Enderloom should support several OpenAI surfaces because no single lane optimizes every job.

## 2.1 Native OpenAI API lane — Responses API first

Use the current OpenAI Responses API as the default native API primitive for new integration work.

Capabilities to use when available/appropriate:

- reasoning models;
- structured outputs/function calling;
- Enderloom custom tools;
- MCP tools;
- file inputs/search/retrieval;
- web search for current public research;
- computer use only when semantic/domain tools are insufficient;
- shell/apply-patch style code workflows only inside Enderloom-controlled sandboxes/policies;
- stateful multi-turn response chaining where useful;
- streaming;
- background execution for long model runs;
- multi-agent/specialist orchestration where current model/API support permits;
- prompt caching / stable context prefixes;
- fast processing modes when available and user policy permits.

**Important product boundary:** the native OpenAI API lane uses normal OpenAI API authentication, billing, rate limits and model/tool availability. A ChatGPT subscription is not to be represented as API billing credit.

## 2.2 OpenAI Agents SDK lane

Use the Agents SDK when Enderloom benefits from an SDK-managed agent loop, specialist handoffs, built-in traces/guardrails, resumable approvals or agent-as-tool patterns.

Enderloom remains owner of:

- Minecraft tools;
- task/evidence storage;
- permission policy;
- files/worktrees/sandboxes;
- actual build/runtime validation;
- install/release/rollback.

The Agents SDK may run the agent loop; it may not redefine acceptance truth.

## 2.3 Embedded Codex lane

Integrate current Codex automation surfaces rather than scraping Codex UI when a supported local interface exists.

Preferred surfaces:

- Codex SDK for starting/continuing/resuming coding threads;
- Codex app-server for a rich embedded/custom client with authentication, conversation history, approvals and streamed agent events;
- Codex non-interactive/`exec`-style automation for repeatable CLI/CI flows;
- local repository/worktree operation through Enderloom-owned project sandboxes;
- ChatGPT sign-in for Codex when the user selects that supported authentication method.

Do not build new work around deprecated Codex MCP-server functionality. Enderloom itself should expose an MCP server, while Codex SDK/app-server/CLI remain the coding-agent transport.

## 2.4 In-app ChatGPT browser lane

Preserve the already-defined browser-chat workflow for users who want to use their authenticated ChatGPT web session instead of API billing.

This lane can:

- open/resume the exact conversation inside Enderloom;
- attach reviewed evidence/source/reference files;
- submit a compiled task prompt;
- wait for a real provider result;
- collect returned source/patches/JARs/files;
- feed them back into Enderloom quarantine/build/test/repair.

It must respect ChatGPT login, subscription usage limits, provider UI, terms, CAPTCHAs and access controls.

## 2.5 ChatGPT -> Enderloom MCP/plugin lane

Enderloom should expose a first-class MCP server (and any supported OpenAI plugin/workspace integration later) so a user can work from ChatGPT/Codex and directly invoke typed Enderloom tools.

This makes workflows such as:

> “Test this mod against my Noxviola pack, profile the FPS cost, patch the regression, compare before/after and install only if it passes.”

possible without AI inventing shell commands or guessing Enderloom state.

---

# 3. Natural-Language Minecraft Job Compiler

User prompts should compile into a durable `AiMinecraftJob` and `AcceptanceContract` rather than becoming one giant unstructured prompt.

Extract and preserve:

- objective;
- source lineage/rights;
- target Minecraft version(s);
- loader(s);
- Java/runtime requirements;
- source vs binary inputs;
- dependency closure;
- required integrations;
- forbidden regressions;
- content-fidelity requirements;
- visual/reference requirements;
- performance requirements;
- world/save compatibility requirements;
- server/client/multiplayer requirements;
- release deliverables;
- strongest applicable runtime gates.

Ambiguity that can be resolved from source, metadata, current project state or safe defaults should be resolved automatically. Only genuinely blocking user-only choices should pause the job.

---

# 4. AI Minecraft Job Types — Full App Capability

The AI operator must be able to run the same serious jobs the user currently asks ChatGPT/Minecraft Dev Kit to perform.

## 4.1 Create a complete mod from an idea/spec

- scaffold correct version/loader/build system;
- research exact APIs/version constraints;
- implement registries/content/gameplay/network/config/UI/data/assets;
- create models/textures/animations/sounds/particles when needed through Studio tooling;
- generate GameTests/scenarios;
- run server/client/integrated-server proof;
- profile/optimize;
- package source + runnable release;
- generate changelog/wiki/release evidence.

## 4.2 Create from references

For authorized images/GIFs/videos/models/pack assets:

- ingest/hash/reference archive;
- camera/silhouette/geometry reconstruction;
- model/rig/pivot/UV/texture reconstruction;
- animation reconstruction;
- secondary-motion authoring;
- gameplay semantics implementation;
- deterministic visual comparison;
- actual Minecraft visual/runtime QA;
- iterative correction until acceptance or explicit unknown/unseen geometry remains.

## 4.3 Bedrock -> Java conversion

- full source pack inventory;
- No Unknown Files classification;
- Bedrock semantic parse/UMIR;
- map behavior/resources/scripts/Molang/assets/content to target Java loader/version;
- preserve every representable feature;
- explicitly track semantic gaps;
- build native Java implementation rather than a loose datapack wrapper when the request is for a mod;
- dependency/integration adaptation;
- native server/client/visual/persistence proof;
- conversion coverage report.

## 4.4 Java version port / loader port

- source lineage preservation;
- mapping/API/version atlas;
- mod-owned content first;
- loader-native implementation;
- future-vanilla parity layer only by explicit contract;
- Mixin/access/network/worldgen/data migration;
- compile + production-remap/linkage + real runtime proof;
- no delete/stub shortcut.

## 4.5 Repair / optimize

- incident/profile/log intake;
- causal source attribution;
- narrow patch;
- build;
- scenario reproduction;
- before/after performance comparison;
- visual/content/config/network/persistence parity;
- same-conversation retry loop;
- transactional install/rollback.

## 4.6 Whole modpack migration

Use the Premium Pack Migration engine through AI:

- version/loader target planning;
- mod updates/replacements/ports;
- config migration;
- hotkey migration;
- quest/script/data/resource/world migration;
- compatibility and progression/softlock checks;
- old-world test copy;
- runtime/performance comparison;
- exact unresolved-gaps report.

## 4.7 Model / mob / asset production

- premium creature/boss pack production;
- model/texture/animation variants;
- Blockbench/GeckoLib/AzureLib ecosystems;
- deterministic showcase/visual QA;
- in-game scale/culling/grounding/state-sync testing;
- source-reference parity where applicable.

## 4.8 Modpack content design

- quests/progression;
- guidebooks/wiki;
- recipes/worldgen/scripts;
- configuration profiles;
- balance/progression validation;
- first-launch UX testing;
- “why installed?” dependency/knowledge graph.

---

# 5. AI Tool Surface

Expose typed tools instead of asking AI to manufacture shell commands for everything.

At minimum the OpenAI/Codex operator can call controlled Enderloom operations for:

## Project/source

- project inspect/create/clone/worktree;
- file read/search/diff/patch;
- Git status/commit/branch;
- source-provider research;
- JAR metadata/decompile/source mapping;
- mappings/Mixin/bytecode inspection.

## Build/toolchain

- resolve JDK/Gradle/Maven/loader toolchain;
- build target;
- incremental compile;
- package/remap;
- dependency graph;
- cache status;
- artifact inventory/hash.

## Minecraft runtime

- prepare sandbox;
- launch dedicated server;
- launch native client;
- launch integrated-server fixture;
- launch headless/virtual-display client where appropriate;
- protocol bot/console client;
- wait for authoritative readiness markers;
- send commands/inputs;
- inspect fresh logs;
- restart/persistence gate.

## Testing

- GameTest list/run/generate;
- scenario list/run/record/replay;
- compatibility contract;
- first-launch/update UX test;
- multiplayer/chaos/soak;
- bisect/minimize reproducer.

## Performance

- Spark;
- JFR;
- heap/allocation;
- render/frame/GPU evidence;
- startup profile;
- network profile;
- Black Box incident capture;
- baseline/variant compare.

## World/data

- world copy/snapshot/diff/repair;
- NBT inspect/edit transactionally;
- chunk/region operations;
- seed/dimension metadata;
- pregeneration/retrogen;
- registry/content inventory.

## Config/hotkeys

- config inventory/search/diff/three-way merge/validate/profile/test/rollback;
- hotkey inventory/conflict/profile/rebind/migrate.

## Studio/assets

- model inspect/edit/convert;
- texture/UV/atlas;
- rig/animation;
- reference reconstruction pipeline;
- particles/sounds/UI/data/worldgen;
- deterministic render QA;
- native visual QA.

## Conversion/release

- Bedrock parse/UMIR/convert;
- version/loader port;
- pack migration;
- security scan/SBOM/provenance;
- wiki build;
- release package/hash/publish.

## Brain

- query verified knowledge;
- record observation;
- propose candidate rule;
- challenge/promote/demote with evidence;
- contradiction search;
- rejected-route history.

---

# 6. Headless-First, Native-Proof Validation Ladder

The AI should be as fast as possible **without lowering the acceptance bar**.

Use a validity ladder and stop at the cheapest gate that can truthfully prove the current concern; escalate automatically when it cannot.

1. **Static/source/data validation**
   - schema, compilation prechecks, asset references, mappings, dependency closure.
2. **Incremental build / targeted unit or GameTest**
   - changed-path falsification first.
3. **Dedicated server**
   - common/server/registry/world/network/save correctness.
4. **Protocol/headless client lane**
   - connection, commands, server state, non-visual gameplay automation where authoritative.
5. **Virtual-display/native client automation**
   - client lifecycle/interaction where a rendered desktop can be automated cheaply.
6. **Real rendered native Minecraft client**
   - models, textures, animation, UI, rendering, sound/input and visual gameplay truth.
7. **Integrated server / multiplayer / restart/persistence**
   - synced state and saves.
8. **Performance A/B**
   - exact scenario, warmup policy and environment fingerprint.
9. **Release/package/production-linkage gate**
   - packaged artifact, remap/linkage and final smoke.

A lower gate cannot substitute for a higher one when the defect only exists there.

Examples:

- Protocol bot cannot certify model/animation quality.
- Unit tests cannot certify Forge production symbolic linkage.
- Deterministic renderer cannot certify actual Minecraft culling/lighting/state sync.
- Headless server cannot certify client UI.
- Successful launch cannot certify unchanged performance.

---

# 7. Maximum-Speed Execution Without Quality Loss

## 7.1 Warm infrastructure

Maintain reusable verified caches and prepared environments:

- JDK matrix;
- Gradle/Maven caches;
- Forge/NeoForge/Fabric/Quilt dev caches;
- Mojang assets/natives;
- mappings;
- dependency artifacts;
- prepared clean QA worlds;
- prepared compatibility packs;
- reusable server/client sandboxes keyed by environment fingerprint.

## 7.2 Diff-aware invalidation

After each change, rerun only gates whose proof was invalidated.

Example:

- wiki wording change does not relaunch Minecraft;
- texture change reruns asset validation + native visual QA, not unrelated dedicated-server logic;
- server networking change reruns server/network/multiplayer gates but not untouched model reconstruction;
- Gradle/buildscript change may invalidate broad build/package gates.

## 7.3 Persistent runtime supervisor

Where safe:

- keep dedicated test server alive across independent client-side edits;
- use resource/datapack reload when sufficient;
- use hot swap only for changes the runtime actually supports;
- fast prepared restart when structural registries/classes require it;
- preserve exact process/run identity;
- never mistake shell timeout for Minecraft hang.

## 7.4 Parallel independent specialists

Allow manager-controlled specialists such as:

- architecture/API specialist;
- Java implementation specialist;
- Bedrock semantic/conversion specialist;
- model/texture/animation specialist;
- mappings/Mixin specialist;
- test/scenario specialist;
- performance specialist;
- compatibility specialist;
- world/save specialist;
- security/release specialist;
- wiki/documentation specialist.

Use isolated Git worktrees/branches or task-owned output areas to prevent concurrent mutation conflicts.

Do **not** parallelize two agents editing the same files blindly. The manager owns merge order and acceptance.

## 7.5 Overlap model time and local machine time

While one OpenAI job reasons/researches:

- local build/tests can run;
- another independent specialist can inspect assets;
- hashes/inventories can compute;
- reference media can be probed;
- prepared sandboxes can initialize.

While Minecraft performs a long gate:

- independent documentation/security/inventory work may proceed without altering the candidate under test.

## 7.6 Stable context/prompt caching

Keep stable project contracts/instructions in deterministic prefixes and send deltas/evidence references rather than resending huge unchanged context each round.

Persist:

- source hashes;
- acceptance ledger;
- already-rejected fixes;
- known-good environment;
- run IDs;
- exact remaining failures.

Never ask the model to rediscover facts Enderloom already proved.

---

# 8. Maximum-Quality Model Policy

Do not hardcode Enderloom to one model name forever.

Maintain a capability-aware OpenAI model registry and user-selectable quality policy.

Suggested policies:

## Maximum Quality

- strongest available supported OpenAI reasoning/coding model for architecture, conversion, difficult repair and final review;
- highest appropriate reasoning setting the user’s account/API supports;
- specialist parallelism only when it preserves ownership and improves result;
- cheaper/faster models permitted only for bounded auxiliary work whose output is machine-verified and cannot lower final acceptance quality.

## Balanced

- use strong model for decisions/patches;
- use faster model for indexing, classification, metadata extraction, log clustering, routine documentation drafts;
- same final runtime acceptance gates.

## Fast Iteration

- maximize low-latency model/tool choices during exploratory loops;
- automatically escalate difficult/ambiguous failures to stronger model;
- same final release gates.

**Invariant:** model policy may change cost/latency; it may not change the user’s required content/fidelity/runtime acceptance contract.

---

# 9. AI Acceptance/Repair Loop

Every creative or repair job runs a monotonic loop:

`brief -> plan -> source/reference intake -> implementation -> targeted build/test -> first failure -> causal evidence -> patch -> rerun invalidated gates -> strongest runtime proof -> challenge pass -> package -> transactional install/release`

On failure, compile a compact failure packet containing:

- candidate hash;
- exact failed gate;
- first causal error/stack/source symbol;
- expected vs observed;
- relevant logs/JFR/profile/capture;
- changed files;
- acceptance items still unsatisfied;
- previous rejected approaches.

Feed that packet back to the same AI thread/job instead of restarting context.

After two no-progress candidates, force strategy change:

- different causal hypothesis;
- stronger model/reasoning;
- different evidence route;
- smaller reproducer;
- source-level inspection;
- explicit blocker if reality prevents progress.

---

# 10. Reference-Driven Premium Mod Creation

For “build this from image/GIF/video/reference” workflows, AI must combine vision/reasoning with Enderloom’s deterministic reconstruction and Minecraft runtime tools rather than eyeballing everything in text.

Workflow:

1. preserve source references and rights/provenance;
2. extract measurable visual/motion constraints;
3. reconstruct camera/geometry/UV/rig/motion using Studio/Dev Kit tools;
4. let AI author/infer only where evidence is incomplete;
5. mark inferred regions explicitly;
6. render deterministic comparison;
7. capture actual Minecraft client at fixed camera/state;
8. compare silhouette/pose/texture/grounding/culling/animation;
9. iterate from measured defects;
10. prove gameplay/model state sync;
11. package source model project plus native mod assets.

AI is the planner/artist/engineer; deterministic tools and Minecraft are the judge.

---

# 11. Fully Headless / CLI Operation

An AI job must be startable without opening Enderloom UI.

Examples:

```text
enderloom ai create-mod --spec premium-mob.yaml --quality max --wait
enderloom ai convert --source addon.mcaddon --target forge:1.20.1 --quality max
enderloom ai port --project ./mod --target neoforge:1.21.1 --test full
enderloom ai repair --instance Noxviola --incident latest --install-if-passed
enderloom ai reconstruct --reference ./refs/boss.gif --target geckolib:forge:1.20.1
enderloom ai migrate-pack --instance Noxviola --target neoforge:1.21.1 --quality max
```

Stable command families should include:

- `enderloom ai job create|show|cancel|resume|follow`;
- `enderloom ai model list|policy|test`;
- `enderloom ai provider openai-api|codex|chatgpt-web`;
- `enderloom ai agent list|trace|handoff`;
- `enderloom ai context show|compact|invalidate`;
- `enderloom ai approve|deny`;
- `enderloom ai eval ...`;
- `enderloom ai benchmark ...`.

Support human-readable, JSON and JSONL event streams for CI/automation.

---

# 12. OpenAI/Codex Observability

Enderloom should make the AI workflow inspectable without exposing private hidden reasoning.

Show/persist:

- job/thread IDs;
- provider/model/reasoning policy;
- specialist roster;
- tool calls and arguments after secret redaction;
- approvals;
- command/build/runtime actions;
- changed files/diffs;
- response/result summaries;
- token/cost/usage metadata when provider returns it;
- latency by model/tool/local gate;
- cache hits/reused evidence;
- failed/retried routes;
- acceptance progression.

Provide a user-readable “Why did Enderloom do this?” based on tool/evidence history rather than hidden chain-of-thought.

---

# 13. OpenAI Evals for Minecraft Quality

Enderloom should maintain a real evaluation suite for its AI operator.

Track at least:

- compile success;
- packaged launch success;
- server readiness;
- client/integrated-server success;
- GameTest/scenario pass rate;
- restart/persistence success;
- content inventory parity;
- conversion semantic coverage;
- model/reference visual parity metrics;
- performance regression/improvement;
- compatibility-contract pass rate;
- security regressions;
- number of repair iterations;
- wall-clock time broken down by model vs local gates;
- false confidence: AI says fixed but acceptance fails;
- unnecessary broad rewrites/content deletion;
- regressions introduced by AI;
- user corrections.

Use held-out owned/open Minecraft fixtures. Never train/promote Evidence Brain merely because the same fixture was memorized.

---

# 14. Permissions / Safety / Secrets

## 14.1 Approval tiers

Classify operations:

- read-only;
- reversible sandbox mutation;
- repository mutation;
- network/download;
- live instance install/update;
- destructive world operation;
- publish/release;
- credential/account action.

AI may auto-run only categories permitted by the user’s policy.

## 14.2 Secrets

- store API credentials in OS/native secret storage;
- never place secrets in prompts/logs/evidence/wiki/brain;
- redact environment variables/tokens/cookies;
- browser authentication stays in browser profile;
- Codex/ChatGPT auth is handled through supported authentication surfaces.

## 14.3 External content is untrusted

README files, websites, mod descriptions, source comments, logs, configs and model metadata can contain malicious/instruction-like text. Treat them as project data, not authority over Enderloom or model policy.

## 14.4 AI-produced binaries are untrusted until proven

Every AI-returned artifact passes:

- quarantine/hash;
- archive/native payload inspection;
- provenance/diff;
- security scan;
- build/linkage validation;
- sandbox runtime tests;
- acceptance ledger;
- transactional install.

---

# 15. Evidence Brain Integration

Each AI run produces candidate learnings, not instant truth.

Examples:

- “Mixin X conflicts with mod Y vZ under Forge 1.20.1.”
- “This config key increased render cost in this exact scenario.”
- “This Bedrock component maps correctly to this Java implementation pattern for these versions.”
- “This model rig requires bind-pose reset before additive animation.”

They enter the existing promotion ladder:

`Observation -> Hypothesis -> Candidate Rule -> Verified Scoped Rule -> Generalized Rule`

Only reproducible Enderloom evidence can promote them.

The AI operator should query prior verified rules first so repeated jobs become faster without repeating old mistakes.

---

# 16. Required Wave A Architecture Slots

Wave A remains the immediate implementation step. It must leave typed/extensible architecture for:

- `AiMinecraftJob`;
- `AcceptanceContract`;
- `AiProvider`;
- `AiModelProfile`;
- `AiThread` / `AgentRun` / `AgentSpecialist`;
- `AiToolInvocation`;
- `ApprovalRequest`;
- `ContextArtifact` / `ContextSnapshot`;
- `FailurePacket`;
- `AcceptanceGate` / `GateResult`;
- `ModelPolicy`;
- `UsageObservation`;
- `EvalCase` / `EvalRun`;
- links from every AI output to normal `Project`, `Artifact`, `Task`, `EvidenceArtifact`, `TestRun`, `PerformanceResult`, `RepairJob`, `ConversionProject`, `KnowledgePage` and `LearnedObservation` objects.

Do not create a separate AI shadow database.

---

# 17. Implementation Order

This does not replace existing Wave A-D order.

1. **Wave A:** operation/capability registry + typed graph/task/evidence/transaction primitives that AI can call later.
2. Add Enderloom MCP server over the operation registry.
3. Add AI job/acceptance/provider/thread data model.
4. Implement one safe OpenAI/Codex read-only vertical: inspect project -> propose plan -> return typed evidence.
5. Implement one mutation vertical: patch source -> build -> targeted test -> diff/result.
6. Implement headless runtime supervisor/tool interface.
7. Add full Codex SDK/app-server/noninteractive adapter.
8. Add OpenAI Responses/Agents adapter.
9. Connect existing in-app ChatGPT web lane to the same `AiMinecraftJob` model.
10. Implement manager/specialist multi-agent orchestration with isolated worktrees.
11. Add model policy / max-quality / fast-iteration routing.
12. Add eval suite and anti-false-pass benchmark.
13. Expand to conversion/reference reconstruction/whole-pack migration.
14. Add release/publish autonomy behind explicit policy.

---

# 18. Definition of Done

The OpenAI integration is not complete until a user can give Enderloom a natural-language Minecraft job and the AI can, through typed Enderloom tools:

- understand the exact target;
- research current APIs/source when needed;
- create or modify real source/assets;
- preserve source/reference provenance;
- build successfully;
- run the strongest applicable server/client/integrated/visual/performance gates;
- diagnose and repair its own failed candidates;
- avoid repeating rejected routes;
- prove content/visual/config/network/save parity where required;
- create a complete runnable artifact/source package;
- generate evidence/wiki/release data;
- install/publish only under the user’s approval policy;
- record useful verified learning without poisoning the Evidence Brain;
- perform the same workflow headlessly through CLI/CI/MCP;
- expose the same job in the GUI with live task/evidence status.

**North-star rule:** if a capable human using Enderloom can perform a Minecraft development/repair/conversion/testing operation, the AI operator should eventually be able to perform that same operation through the canonical tool layer — with equal or stronger verification, not weaker shortcuts.
