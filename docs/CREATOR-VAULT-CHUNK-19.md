# Creator Vault — AsianHalfSquat Chunk 19

Checkpoint date: 2026-09-05

Repository: `Herbertofury/Enderloom`

Branch: `feature/creator-vault-asianhalfsquat-chunk-19`

Pinned QA/data commit: `19d38a98d7b700449d21f2045ce1c2241a2a3c61`

Canonical-probe run: `33983746132`

Provider-collision proof run: `33983868033`

Post-merge stats proof run: `33983978076`

Final GitHub Actions proof run: `33984059298`

## Source batch

Chunk 19 continues backward from the already-indexed 2025-02-03 boundary without rescanning any of the 33 prior AsianHalfSquat IDs and adds exactly the next two verified uploads:

- 2025-01-17 — `OKEqrNvouOc` — **This Minecraft Mod Is Incredibly Cursed (And Good!)** — 6 creator-linked Minecraft projects: Curvy Pipes, Pretty Pipes, Flatter Entities, NoCubes, Complementary Shaders, and Shoulder Surfing Reloaded. The indexed creator description supplies no per-project chapter timestamps, so all six preserve `timestampSeconds=null`, use the base video URL, and never fabricate `t=0s`.
- 2024-12-30 — `H1d_6_OIQzc` — **Minecraft Mod Combinations That Work Perfectly Together #8** — exactly 25 creator-named Minecraft project mentions across ten recommendation combinations. Every project inherits its creator-supplied combination timestamp.

The 5:50 War Thunder chapter is explicitly preserved as `sponsor-excluded` related evidence. It is not a Minecraft project recommendation and never becomes a canonical project card.

## Canonical dedupe contract

The research probe against the untouched chunk-18 registry measured exactly **31 fresh mentions = 14 existing identities + 17 name-new candidates**.

Existing identities reused rather than duplicated:

- Complementary Shaders
- Shoulder Surfing Reloaded
- Blooming Biosphere
- Countered's Terrain Slabs
- Physics Mod Pro -> Physics Mod
- Explosive Enhancement
- Particle Rain
- Shrimple
- First-Person Model -> First-person Model
- Via Romana
- Immersive Aircraft
- Dynamic Surroundings
- Subtle Effects
- Physics Mod

New candidate families promoted after provider verification:

- Curvy Pipes
- Pretty Pipes
- Flatter Entities
- NoCubes
- Eureka! Ships! for Valkyrien Skies
- Valkyrien Pirates
- Perception
- Smooth Particles
- Sounds
- A Good Place
- Fog
- Toni's Immersive Lanterns
- Countered's Settlement Roads
- AmpXtreme
- Glide Away!
- Particular
- Artillery Support

The 31 fresh mentions resolve to 30 distinct fresh canonical identities because `Physics Mod Pro` and `Physics Mod` intentionally share the existing `physics-mod` project.

## Provider closure and anti-false-merge rules

Pre-production provider-collision QA proved **18 canonical overlays / 49 candidate direct destinations / zero URL collisions** against the untouched chunk-18 registry. The 18 overlays are the 17 name-new candidates plus one reused underlinked card, Shrimple.

Provider production data lives in `provider-closure-19a-asianhalfsquat.json`.

- Curvy Pipes and Artillery Support expose the independently verified Modrinth + CurseForge homes; no unverified source button is invented.
- Pretty Pipes, Flatter Entities, NoCubes, Eureka, Valkyrien Pirates, Perception, Smooth Particles, Sounds, A Good Place, Fog, Toni's Immersive Lanterns, Countered's Settlement Roads, and Glide Away expose Modrinth + CurseForge + verified GitHub source.
- AmpXtreme remains the verified canonical Modrinth data-pack project only; no speculative alternate provider is added.
- Particular is pinned to Chailotl's original Fabric project on Modrinth plus `Chailotl/particular` source. Particular Reforged and unrelated same-name CurseForge pages are explicitly excluded.
- Shrimple enriches its existing CurseForge shader card with the verified same-project Modrinth home and `Null-MC/Shrimple` source repository.

## Current verified Vault totals

- 44 source videos total.
- 720 recommendation mentions.
- 720 mentions -> exactly 544 canonical projects.
- 542 canonical projects have verified direct homes.
- 996 exact direct destinations are exposed.
- 361 canonical projects are multi-provider.
- Exactly 2 unresolved canonical projects remain: **Better Book Recipe** and **Plank and Junk**.
- `nativeRecommendationSources = 15`.

## AsianHalfSquat coverage

- 35 / 350 source videos indexed.
- 461 recommendation mentions preserved.
- 461 / 461 indexed AsianHalfSquat mentions have at least one verified direct project home.
- Those mentions represent 316 AsianHalfSquat canonical projects.

The six original Drive-derived shards and all older bounded history checkpoints remain unchanged.

## Zero-loss QA architecture

`scripts/creator-vault-qa-chunk18.js` plus `catalog/creator-vault/research/creators.chunk18-baseline.json` freeze chunk 18 byte-for-byte. Chunk 19 hides only its source/provider production files, swaps only the chunk-18 creator ledger, runs the frozen chunk-18 wrapper unchanged (recursively proving every older checkpoint), restores current state in `finally`, then enforces the chunk-19 contract.

The hard gate locks aggregate totals, AHS coverage, all 31 canonical mappings, the six January null-timestamp/base-link rules, all 25 December section timestamps/deep links, the War Thunder sponsor exclusion, provider families, Physics Mod alias reuse, Particular identity isolation, and Shrimple provider enrichment.

## Real QA proof

- PASS — Canonical-probe run `33983746132`: untouched 689 / 527 baseline; 31 source mentions = 14 existing + 17 name-new candidates.
- PASS — Provider-collision run `33983868033`: 18 candidate overlays / 49 destinations / 0 collisions.
- PASS — Post-merge stats run `33983978076`: exact 720 -> 544; 542 linked / 996 destinations / 361 multi-provider / 2 unresolved; AHS 461/461 across 316 canonical projects.
- PASS — Final run `33984059298` on `19d38a98d7b700449d21f2045ce1c2241a2a3c61`: provider collision gate, missing-timestamp regression, full recursive Creator Vault QA through chunk 19, catalog regression QA, and portable catalog rendering all passed.

## Exact next action

Create `feature/creator-vault-asianhalfsquat-chunk-20` from this chunk's durable repository checkpoint. Continue backward from **2024-12-30** without rescanning any of the 35 indexed AsianHalfSquat IDs. Enumerate only a small older source slice, recover creator-authored recommendation evidence, canonicalize every mention against the **544-project** registry before provider research, add only independently verified direct homes through bounded append-only overlays, run the same nested QA stack, checkpoint GitHub + the canonical Drive wiki, and continue toward the 350-video target.
