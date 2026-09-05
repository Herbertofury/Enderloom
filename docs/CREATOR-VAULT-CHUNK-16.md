# Creator Vault — AsianHalfSquat Chunk 16 Checkpoint

Checkpoint date: 2026-09-05

Repository: `Herbertofury/Enderloom`
Branch: `feature/creator-vault-asianhalfsquat-chunk-16`
Pinned QA/data commit: `073a9778a69169df1b2567c07721318686bf39a8`
Provider-collision proof run: `33979555413`
Post-merge stats run: `33979660064`
Final GitHub Actions proof run: `33979795451`

## Source batch

Chunk 16 continues backward through AsianHalfSquat history with the next two non-overlapping uploads older than the 2025-07-18 boundary. Independent chronology shows no June 2025 upload between the previous boundary and this batch.

- 2025-05-17 — `HtuPWLLol-k` — **Top 10 Minecraft Mods (1.20.1) - 2025** — exactly 10 creator-authored recommendation chapters with timestamps and creator-stated loader labels.
- 2025-05-06 — `GvZCVqJtse0` — **This Mod Makes Minecraft Nearly Unrecognizable...** — 1 featured Conquest Reforged Modpack plus 7 explicitly listed supporting mods; the creator description supplies no per-project chapter timestamps, so all eight preserve `timestampSeconds=null` and the base video URL.

The May 6 description also names six RedRangerBuilds maps — Miremouth, Ager Aureus, Elderglen, Silverbough Forest, Willowmarsh, and Evervale — behind one creator-linked member page. They are preserved as `related-content-not-canonicalized` source evidence and are not inflated into six guessed project cards.

## Canonicalization

18 fresh source mentions were first resolved against the 497-project chunk-15 registry as **7 existing identities + 11 name-new candidates**. After provider/alias-aware merging, the live vault advances from 497 to **507** canonical projects, so the batch contributes **10 net-new canonical projects**.

Existing identities reused directly by the name probe:

- YUNG's Cave Biomes
- AmbientSounds
- Auto HUD
- Camera Utils
- First-person Model
- Leawind's Third Person
- Passable Foliage

Name-new candidate families resolved without same-name guessing:

- Mine Cells
- Scout
- Gliders
- Stamina
- Archer's Paradox
- Alex's Caves
- Tetra
- Speed Building
- Ribbits
- Conquest Reforged Modpack
- Camera Overhaul

## Provider closure

The explicit pre-production collision gate proved **13 canonical overlays / 33 candidate direct destinations / zero URL collisions** against the chunk-15 registry.

Provider enrichment is split into:

- `provider-closure-16a-asianhalfsquat.json`
- `provider-closure-16b-asianhalfsquat.json`

Guardrails preserved:

- Gliders is pinned to the Jeryn99 project; the distinct project named Gliding is excluded.
- Stamina is pinned to Insane96's Forge/NeoForge project and source repository; unrelated same-name stamina mods are excluded.
- Alex's Caves is pinned to the original project/source family; Continued, rad fork, and unofficial ports are excluded.
- Speed Building resolves to the verified CurseForge project **Speed Building - Scaffolding behavior**; no second unverified home is invented.
- Conquest Reforged Modpack remains one canonical family with official Fabric/Forge Modrinth and CurseForge pack homes; community forks are excluded.
- Camera Overhaul is Mirsario's current unified project plus source; the older separately published commissioned Forge port is excluded.
- First-person Model and YUNG's Cave Biomes enrich existing cards with their missing verified destinations rather than creating duplicates.

## Current verified vault totals

- **38** source videos total
- **629** recommendation mentions
- 629 mentions → **507 canonical projects**
- **505** canonical projects with verified direct homes
- **897** exact direct destinations
- **322** multi-provider canonical projects
- Exactly **2** unresolved canonical projects: Better Book Recipe and Plank and Junk
- `nativeRecommendationSources = 12`

## AsianHalfSquat coverage

- **29 / 350** source videos indexed
- **370** recommendation mentions preserved
- **370 / 370** indexed AsianHalfSquat mentions have at least one verified direct project home
- Those mentions represent **273** AsianHalfSquat canonical projects

## Zero-loss QA architecture

`scripts/creator-vault-qa-chunk15.js` and `catalog/creator-vault/research/creators.chunk15-baseline.json` freeze chunk 15 exactly. Chunk 16 hides only its production source/provider files, swaps only the chunk-15 creator ledger, runs the frozen chunk-15 wrapper unchanged (which recursively proves chunks 14, 13, 12, 11, Episode 5, and Episode 3), restores current state in `finally`, then enforces the chunk-16 contract.

Chunk 16 hard-locks:

- aggregate `629 / 507 / 505 / 897 / 322 / 2` totals;
- AHS `29/350`, `370/370` linked mentions, and `273` canonical projects;
- all 18 source-name → canonical-project mappings;
- May 17 timestamps and creator-stated loader labels;
- May 6 null-timestamp/base-URL behavior with no fabricated `t=0s` links;
- provider families and anti-false-merge guards;
- exactly one RedRangerBuilds related-evidence record containing the six named maps.

## Real QA proof

GitHub Actions run `33979795451` completed successfully on `073a9778a69169df1b2567c07721318686bf39a8`.

PASS — Missing timestamp regression QA.
PASS — Full nested Creator Vault QA through chunk 16.
PASS — Catalog regression QA.
PASS — Render portable catalogs.

## Exact next action

Create `feature/creator-vault-asianhalfsquat-chunk-17` from this checkpoint. Continue backward from **2025-05-06** without rescanning any of the 29 already indexed AsianHalfSquat video IDs. Enumerate a small older source slice, recover only creator-authored recommendation evidence, canonicalize against the **507-project** registry before provider research, add only independently verified direct project homes in bounded append-only shards, run the same nested QA stack, checkpoint exact counts to this repo and the canonical Drive wiki, then continue toward the 350-video target.