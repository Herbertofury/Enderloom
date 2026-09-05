# Creator Vault — AsianHalfSquat Chunk 15 Checkpoint

Checkpoint date: 2026-09-05

Repository: `Herbertofury/Enderloom`
Branch: `feature/creator-vault-asianhalfsquat-chunk-15`
Pinned QA/data commit: `de3a279928e2fb9793abe5bcceba02cbaa65fac9`
GitHub Actions proof run: `33979096995`

## Source batch

Chunk 15 continues backward through AsianHalfSquat history with two non-overlapping creator-authored videos:

- 2025-07-25 — `GtPvX62bO30` — **This New Minecraft Terrain Generation Mod Is One of the Best Yet** — 17 explicitly named project mentions. The creator description provides no per-project chapter timestamps, so every mention preserves `timestampSeconds=null` and the base video URL.
- 2025-07-18 — `l9VYc8La5mg` — **Top 10 Minecraft Mods (1.21) - July 2025** — exactly 10 creator-authored chapter recommendations with timestamps and creator-stated loader labels.

One additional generic **Minecraft Datapack Map** link in the July 25 description remains source-level `identity-pending` evidence because the indexed public source does not expose a trustworthy project name. It is not promoted into a fake canonical project card.

## Canonicalization

27 fresh source mentions resolve as exactly **14 existing canonical identities + 13 new canonical projects**.

New canonical projects:

- Still Life
- Lithosphere
- Better Days
- Passable Foliage
- Towns & Towers
- Vanilla Mashup (PBR)
- Arsenal (RPG Series)
- Hopo Better Mineshaft
- yyz's backpack
- Storage Racks
- Underlay
- Particle Effects
- Automobility

Existing cards are reused for Ambient Sounds, Auto HUD, Better Third Person, Camera Utils, Euphoria Patches, Distant Horizons, Not Enough Animations, Bliss Shaders, Complementary Shaders, Fresh Animations, Fresh Player Animations / Trailer Player Animations, Cool Rain, Keep Some Inventory, and the repeated Euphoria Patches mention.

## Provider closure

The pre-production collision gate proved **16 candidate canonical overlays / 28 verified direct destinations / zero URL collisions** against the chunk-14 registry.

Provider enrichment is split into:

- `provider-closure-15a-asianhalfsquat.json`
- `provider-closure-15b-asianhalfsquat.json`

Important identity rules preserved:

- Still Life and Lithosphere remain Modrinth-only after the challenge pass.
- Passable Foliage keeps unified Modrinth plus separate CurseForge Forge/NeoForge and Fabric/Quilt homes.
- Vanilla Mashup is pinned to the real `vanilla-mashup-pbr` project.
- yyz's backpack remains Modrinth-only; Storage Racks remains CurseForge-only.
- Auto HUD, Not Enough Animations, and Fresh Animations enrich existing cards rather than creating duplicates.

A staged stats run exposed malformed closing brackets in both compact provider shards before acceptance. The files were repaired without changing any project/provider decision, then the same stats gate proved the intended provider state.

## Current verified vault totals

- 36 source videos total
- 611 recommendation mentions
- 611 mentions → **497 canonical projects**
- **495** canonical projects with verified direct homes
- **866** exact direct destinations
- **312** multi-provider canonical projects
- Exactly **2** unresolved canonical projects: Better Book Recipe and Plank and Junk
- `nativeRecommendationSources = 11`

## AsianHalfSquat coverage

- **27 / 350** source videos indexed
- **352** recommendation mentions preserved
- **352 / 352** indexed AsianHalfSquat mentions have at least one verified direct project home
- Those mentions represent **262** AsianHalfSquat canonical projects

## Zero-loss QA architecture

`scripts/creator-vault-qa-chunk14.js` and `catalog/creator-vault/research/creators.chunk14-baseline.json` freeze chunk 14 exactly. Chunk 15 hides only its production source/provider files, swaps only the chunk-14 creator ledger, runs the chunk-14 wrapper unchanged (which recursively proves chunks 13, 12, 11, Episode 5, and Episode 3), restores current state in `finally`, then enforces the chunk-15 contract.

Chunk 15 additionally hard-locks:

- the 611 / 497 / 495 / 866 / 312 / 2 aggregate contract;
- AHS 27/350 and 352/352 linked mentions across 262 canonical projects;
- all 27 source-name → canonical-project mappings;
- all verified provider homes and loader-specific provider families;
- July Top 10 timestamps and creator-stated loader labels;
- no fabricated 0:00 links for the untimestamped terrain feature;
- exactly one source-level `Minecraft Datapack Map` identity-pending link.

## Real QA proof

GitHub Actions run `33979096995` completed successfully on `de3a279928e2fb9793abe5bcceba02cbaa65fac9`.

PASS — Missing timestamp regression QA.
PASS — Full nested Creator Vault QA through chunk 15.
PASS — Catalog regression QA.
PASS — Render portable catalogs.

## Exact next action

Create `feature/creator-vault-asianhalfsquat-chunk-16` from this checkpoint. Continue backward from **2025-07-18** without rescanning any of the 27 already indexed AsianHalfSquat video IDs. Enumerate a small older source slice first, recover only creator-authored recommendation evidence, canonicalize against the **497-project** registry before provider research, add only independently verified direct project homes in bounded append-only shards, run the same nested QA stack, checkpoint exact counts to this repo and the canonical Drive wiki, then continue toward the 350-video target.