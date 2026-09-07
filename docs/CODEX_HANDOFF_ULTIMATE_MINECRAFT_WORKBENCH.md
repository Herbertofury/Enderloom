# Codex Handoff — Enderloom Ultimate Minecraft Workbench

**Date:** 2026-09-07  
**Repository:** `Herbertofury/Enderloom`  
**Branch:** `main`

## Objective

Continue Enderloom as the one integrated Minecraft workbench. Do not restart research, replace accepted launcher/catalog/browser behavior, or build disconnected mockup tabs.

The current product contracts are:

1. `docs/ENDERLOOM_MASTER_REQUIREMENTS.md`
2. `docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md`
3. `docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md`
4. `docs/PREMIUM_TESTING_LAB_SPEC.md`
5. `docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md`
6. `docs/CODEX_HANDOFF_PREMIUM_TESTING_CLI.md`
7. GitHub issue #1 — existing Performance Lab continuity
8. GitHub issue #3 — Ultimate Minecraft Workbench expansion tracker

## Non-negotiable product law

**No feature islands. No shadow databases. No duplicated truth.**

Every relevant feature must consume and update the same canonical Minecraft project/evidence graph. Performance results must surface directly on mods/Favorites/update planning/repair. Crashes must link to exact culprit mod/source/config. World hotspots must link to owning mod content when known. Config/version changes invalidate only dependent evidence. Conversion and port failures can enter the same repair/testing loop. Returned AI artifacts update repair/source/performance/compatibility provenance rather than living in a separate subsystem.

## In-app browser rule

Enderloom's existing persistent Chromium browser is an execution surface, not an escape hatch.

For the default browser-chat repair lane, Enderloom should be able to:

1. open/resume the real provider conversation inside Enderloom;
2. use the user's existing authenticated browser session;
3. prepare and visibly review the exact outbound evidence packet;
4. submit the prompt and attachments;
5. persist conversation/task identity;
6. detect completion, user-action-required, provider UI failure, or quota/rate-limit state;
7. adopt only returned files tied to the active repair job;
8. quarantine/hash/inspect them;
9. build them;
10. test them in an isolated Minecraft sandbox;
11. generate precise failure evidence for any failed gate;
12. send the failure back to the same conversation;
13. repeat while materially progressing;
14. install only after Enderloom's own acceptance gates pass;
15. post-install smoke the actual connected instance and rollback automatically on failure.

The default web-chat lane should not require a separate API key, but it must respect the provider's normal login, plan limits, quotas, rate limits, UI, terms, CAPTCHAs, paywalls, DRM, and access controls. Never bypass them.

## Bedrock / Marketplace rule

Treat Bedrock as a first-class content ecosystem. Parse behavior/resource packs, manifest v2/v3, Script API, Molang, entities, components, items, blocks, recipes, loot, spawn rules, worldgen, geometry, textures, animation controllers, animations, render controllers, particles, sounds, localization, structures and references into the shared semantic model.

Marketplace pages may be researched and viewed in the integrated browser. Conversion requires user-authorized accessible source bytes. Never bypass DRM, encryption, paywalls, entitlement checks or protected delivery to obtain Marketplace content.

## Exact implementation order

### Wave A — Integration Spine — START HERE

Implement the shared infrastructure required by every later feature:

- canonical `Project` / `Release` / `Artifact` / `FileHash` identities;
- provider/source aliases;
- instance/world/config/dependency links;
- `EvidenceArtifact` and evidence provenance;
- explicit staleness/invalidation dependencies;
- durable resumable task model;
- transactional mutation + rollback primitive;
- universal project/mod detail domain object;
- shared operation/capability registry suitable for GUI + service + CLI;
- migration tests and compatibility with existing Enderloom data.

**First vertical acceptance target:** pick one real installed mod and prove one canonical detail/evidence object is consumed by Mod Manager, Catalog, CLI/service and Testing without duplicate truth.

Do not build broad new UI before this works.

### Wave B — Universal Mod Surface

Then implement the high-value integrated right-click/detail actions:

- verified source/provider submenu;
- configs/files association;
- source repository identity;
- media/video preview model;
- performance badge projection;
- repair/optimize/port/convert actions;
- direct Split/Browser navigation.

### Wave C — Performance Lab continuity

Resume issue #1 exactly from its current implementation contract. Do not redo its research. Performance results must write into the shared graph and immediately appear on the normal mod surface.

### Wave D — Autonomous Repair Loop

Follow `docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md`. Implement the full real vertical slice before provider proliferation:

`RepairJob -> evidence bundle -> in-app ChatGPT web adapter -> returned candidate -> quarantine -> build -> sandbox runtime gate -> failure packet -> same conversation retry -> passing candidate -> transactional install -> actual-instance smoke -> rollback proof`

### Wave E onward

Continue the waves in `docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md`:

- Bedrock Studio parser;
- UMIR and first rich Bedrock->Java conversion;
- Java version/loader port engine and Stonecutter-style multiversion workspace;
- World Studio;
- model/texture/animation and Blockbench interoperability;
- reference reconstruction and native visual QA;
- cross-system intelligence;
- ecosystem parity challenge pass.

## Implementation discipline

- Preserve existing accepted functionality.
- Reuse current Rust/service/browser architecture rather than creating parallel systems.
- Once canonical target + safe edit are known, implement rather than continuing read-only research.
- Use targeted tests during iteration and broad gates at convergence.
- Build a fresh runnable Enderloom artifact after implementation changes.
- Exercise the actual built app/CLI path, not only unit tests.
- For Minecraft behavior, use the strongest applicable native runtime proof.
- Never use the user's live instance/world as automated-test scratch space.
- Never silently delete content to make conversions/ports compile.
- Never call static-risk findings measured performance.
- Never install an AI-returned binary before validation.
- Every recommendation must expose `Why?` / evidence.
- Every material checkpoint must preserve exact repo/branch/commit and next action.

## Quality target

The finished product should be easier to use than the collection of launchers, profilers, world editors, NBT tools, model tools, pack tools, browsers and ad-hoc scripts it replaces, while being more capable because all of those workflows share identity, evidence, testing, repair and rollback.

Start Wave A now. Do not stop at planning or mockups.
