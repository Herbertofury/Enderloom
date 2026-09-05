# Creator Vault — AsianHalfSquat Chunk 17 Checkpoint

Checkpoint date: 2026-09-05

Repository: `Herbertofury/Enderloom`
Branch: `feature/creator-vault-asianhalfsquat-chunk-17`
Pinned QA/data commit: `52d2da242384ee6c3c55840a40b32da102630572`
Provider-collision proof run: `33980243362`
Post-merge stats run: `33980407069`
Final GitHub Actions proof run: `33980536388`

## Source batch

Chunk 17 continues backward through AsianHalfSquat history with exactly two non-overlapping creator-authored uploads older than the 2025-05-06 boundary:

- 2025-04-27 — `kxfhfZ0lMEA` — **Turning Minecraft Into The Ultimate Cinematic Experience** — 26 explicitly named Minecraft project mentions. Creator section timestamps are preserved only where supplied; Sodium and Iris remain untimestamped/base-URL mentions.
- 2025-04-09 — `hLPMBnmi324` — **The Best Minecraft Terrain Generation Mods Available Today** — 12 terrain recommendations under three creator-timestamped sections plus 7 explicitly listed supporting projects with no per-project timestamps.

`Aspect Ratio` at 0:16 in the cinematic video is preserved as `non-project-setting` related evidence and is explicitly excluded from canonical project counts.

## Canonicalization

45 fresh source mentions were probed against the chunk-16 507-project registry as **29 direct existing hits + 16 name misses**. Two miss labels are alias-only existing identities — `William Wyther's Overhauled Overworld` → `william-wythers-overhauled-overworld`, and `Larion` → `larion-world-generation` — with William appearing twice. The live merge therefore advances from 507 to **520 canonical projects**, adding exactly **13 net-new canonical project families**.

New families:

- Countered's Terrain Slabs
- dronko's alternative Bushy Leaves
- Cubic Leaves
- Unobtrusive Weather
- Falling Leaves
- Particle Interactions
- Blooming Biosphere
- Nature's Spirit
- Biomes O' Plenty
- Regions Unexplored
- Oh The Biomes We've Gone
- Sildur's Enhanced Default Shaders
- SimplyWalk

## Provider closure

The explicit pre-production collision gate proved **18 canonical overlays / 33 candidate direct destinations / zero URL collisions** against the chunk-16 registry.

Provider enrichment is split into:

- `provider-closure-17a-asianhalfsquat.json`
- `provider-closure-17b-asianhalfsquat.json`
- `provider-closure-17c-asianhalfsquat.json`

Important identity rules preserved:

- William Wyther's wording and Larion remain aliases of their existing canonical cards, never duplicates.
- Unobtrusive Weather remains Modrinth-only after the targeted pass; `Unobstructive Weather` is retained only as an alternate source spelling.
- Falling Leaves preserves the verified Modrinth Fabric original, CurseForge Forge/NeoForge port, and original GitHub source on one feature card.
- Biomes O' Plenty and Oh The Biomes We've Gone expose Modrinth + CurseForge + verified source repositories.
- MakeUp - Ultra Fast, Terra, and SPBR enrich existing cards with newly verified direct homes/source links instead of creating duplicates.
- No generic provider search pages, inferred slugs, or community forks are used.

## Current verified vault totals

- **40** source videos total
- **674** recommendation mentions
- 674 mentions → **520 canonical projects**
- **518** canonical projects with verified direct homes
- **930** exact direct destinations
- **337** multi-provider canonical projects
- Exactly **2** unresolved canonical projects: Better Book Recipe and Plank and Junk
- `nativeRecommendationSources = 13`

## AsianHalfSquat coverage

- **31 / 350** source videos indexed
- **415** recommendation mentions preserved
- **415 / 415** indexed AsianHalfSquat mentions have at least one verified direct project home
- Those mentions represent **289** AsianHalfSquat canonical projects

## Zero-loss QA architecture

`scripts/creator-vault-qa-chunk16.js` and `catalog/creator-vault/research/creators.chunk16-baseline.json` freeze chunk 16 exactly. Chunk 17 hides only its production source/provider files, swaps only the chunk-16 creator ledger, runs the frozen chunk-16 wrapper unchanged (which recursively proves every older checkpoint), restores current state in `finally`, then enforces the chunk-17 contract.

Chunk 17 hard-locks aggregate totals, AHS coverage, grouped/null timestamp truth, canonical alias merges, provider families, anti-false-merge rules, and exactly one Aspect Ratio `non-project-setting` record.

## Real QA proof

GitHub Actions run `33980536388` completed successfully on `52d2da242384ee6c3c55840a40b32da102630572`.

PASS — Missing timestamp regression QA.
PASS — Full nested Creator Vault QA through chunk 17.
PASS — Catalog regression QA.
PASS — Render portable catalogs.

## Exact next action

Create `feature/creator-vault-asianhalfsquat-chunk-18` from the durable chunk-17 checkpoint commit. Continue backward from **2025-04-09** without rescanning any of the 31 already indexed AsianHalfSquat video IDs. Recover a small older source slice using creator-authored evidence, canonicalize against the **520-project** registry before provider research, add only independently verified direct project homes in bounded append-only shards, run the same nested QA stack, persist the exact repo + Drive checkpoint, and continue toward the 350-video target.