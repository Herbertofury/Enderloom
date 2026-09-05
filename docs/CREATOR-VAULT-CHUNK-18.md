# Creator Vault — AsianHalfSquat Chunk 18

Checkpoint date: 2026-09-05

Repository: `Herbertofury/Enderloom`

Branch: `feature/creator-vault-asianhalfsquat-chunk-18`

Pinned QA/data commit: `d991f9d21ca57694006fb88a83b35ad67727f659`

Provider-collision proof run: `33983174960`

Post-merge stats proof run: `33983260972`

Final GitHub Actions proof run: `33983363901`

## Source batch

Chunk 18 continues backward through AsianHalfSquat history from the already-indexed 2025-04-09 boundary and adds exactly the next two non-overlapping source videos:

- 2025-03-22 — `cjD9jYsfNj8` — **Top 10 Minecraft Mods (1.21.4) - 2025** — 10 creator-authored chapter recommendations with exact timestamps and creator-stated loader labels.
- 2025-02-03 — `OMnbxkBp_0c` — **This Minecraft Terrain Generation Mod Is Infinitely Customizable...** — TerraMath plus four explicitly listed supporting projects. The creator description provides no per-project chapter timestamps, so all five preserve `timestampSeconds=null` and use the base video URL.

The TerraMath description also supplies eleven terrain-generation formulas as configuration examples. They remain related `configuration-not-projects` evidence and never become fabricated project cards.

## Canonical dedupe contract

15 fresh source mentions resolve as exactly 8 existing identities + 7 new canonical projects against the chunk-17 registry.

Existing identities reused rather than duplicated:

- Hold My Items
- Omnidirectional Movement
- Particle Interactions
- Flowing Fluids
- Complementary Shaders
- Distant Horizons
- Fresh Player Animations -> Trailer Player Animations
- Leawind's Third Person

New canonical identities:

- Origen
- Resourcify
- Shared Inventory
- Butchery
- Fishing Overhaul
- Hearty Meals
- TerraMath

## Provider closure and anti-false-merge rules

The pre-production provider-collision gate proved **8 canonical overlays / 18 verified direct destinations / zero URL collisions** against the untouched chunk-17 registry.

Provider production data lives in `provider-closure-18a-asianhalfsquat.json`.

- Origen is modeled as its actual **Terra configuration pack**, with the official `Rearth/Origen` GitHub project/release home. Terra's Modrinth dependency page is not mislabeled as an Origen provider.
- Resourcify exposes Modrinth + CurseForge + verified GitHub source.
- Shared Inventory is pinned to the creator-linked `sharedinv` Fabric project on Modrinth plus its source repository; unrelated newer same-name CurseForge projects are excluded.
- Butchery exposes Modrinth + CurseForge.
- Fishing Overhaul, Hearty Meals, and TerraMath expose Modrinth + CurseForge + verified GitHub source.
- Flowing Fluids enriches its existing canonical card with the creator-linked Modrinth home alongside CurseForge.

## Current verified Vault totals

- 42 source videos total.
- 689 recommendation mentions.
- 689 mentions -> exactly 527 canonical projects.
- 525 canonical projects have verified direct homes.
- 948 exact direct destinations are exposed.
- 344 canonical projects are multi-provider.
- Exactly 2 unresolved canonical projects remain: **Better Book Recipe** and **Plank and Junk**.
- `nativeRecommendationSources = 14`.

## AsianHalfSquat coverage

- 33 / 350 source videos indexed.
- 430 recommendation mentions preserved.
- 430 / 430 indexed AsianHalfSquat mentions have at least one verified direct project home.
- Those mentions represent 296 AsianHalfSquat canonical projects.

The six original Drive-derived shards and all older bounded history checkpoints remain unchanged.

## Zero-loss QA architecture

`scripts/creator-vault-qa-chunk17.js` plus `catalog/creator-vault/research/creators.chunk17-baseline.json` freeze chunk 17 byte-for-byte. Chunk 18 hides only its source/provider production files, swaps only the chunk-17 creator ledger, runs the frozen chunk-17 wrapper unchanged (recursively proving every older checkpoint), restores current state in `finally`, then enforces the chunk-18 contract.

The chunk-18 gate hard-locks aggregate totals, AHS coverage, all 15 canonical mappings, March timestamps/deep links and creator-stated loader labels, February null-timestamp/base-link behavior, provider families, Origen-vs-Terra separation, Shared Inventory anti-false-merge behavior, and TerraMath configuration-only evidence.

## Real QA proof

Provider collision run `33983174960` passed with `candidateProjects=8`, `destinations=18`, and `collisions=[]`.

Post-merge stats run `33983260972` passed and measured the exact 689 / 527 / 525 / 948 / 344 / 2 aggregate state plus AHS 430/430 across 296 canonical projects.

Final run `33983363901` is the hard acceptance run for commit `d991f9d21ca57694006fb88a83b35ad67727f659`, covering missing-timestamp regression, the complete nested Creator Vault QA stack, catalog regression QA, and portable catalog rendering.

## Exact next action

Create `feature/creator-vault-asianhalfsquat-chunk-19` from the durable chunk-18 checkpoint. Continue backward from **2025-02-03** without rescanning any of the 33 indexed AsianHalfSquat IDs. Enumerate a small older source slice, recover only creator-authored recommendation evidence, canonicalize against the 527-project registry before provider research, add only independently verified direct homes through bounded append-only overlays, run the same nested QA stack, checkpoint GitHub + the canonical Drive wiki, and continue toward the 350-video target.
