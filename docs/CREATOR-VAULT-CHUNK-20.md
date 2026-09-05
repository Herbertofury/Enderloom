# Creator Vault — AsianHalfSquat Chunk 20

Checkpoint date: 2026-09-05

Repository: `Herbertofury/Enderloom`

Branch: `feature/creator-vault-asianhalfsquat-chunk-20`

Pinned QA/data commit: `5a5168cab123cd3dc9fedfcf9f1cbcb9bc44fad9`

Canonical-probe run: `33984229497`

Provider-collision proof run: `33984371966`

Post-merge stats proof run: `33984435636`

Final GitHub Actions proof run: `33984561773`

## Source batch

Chunk 20 continues backward from the already-indexed 2024-12-30 boundary without rescanning any of the 35 prior AsianHalfSquat IDs and adds exactly the next two verified uploads:

- 2024-12-22 — `eJy6KJj8_m0` — **Top 10 Minecraft Mods (1.21) - December 2024** — exactly 10 creator-named projects. Creator-stated Minecraft version labels are preserved: Catenary 1.21.4; Underground Bunkers 1.21.1; Physics Toys 1.21.4; Perception 1.21.1; Oh The Biomes We've Gone 1.21.1; Flow 1.21.1; Countered's Terrain Slabs 1.21.3; Random Mob Sizes 1.21.4; Epic Terrain 1.21.3; Auroras 1.21.3.
- 2024-12-17 — `W_Q6Vg-HtMM` — **The Most Extreme Minecraft Terrain Generation Mod Available** — 9 creator-linked projects: featured AmpXtreme plus Big Globe, Bliss Shader, Complementary Shaders, Distant Horizons, Do a Barrel Roll, Iris, JJThunder To The Max, and Natures Spirit.

Neither indexed creator description exposes per-project chapter timestamps. All 19 chunk-20 mentions therefore preserve `timestampSeconds=null`, use their base video URL, and never fabricate `t=0s`.

## Canonical dedupe contract

The research probe against the untouched chunk-19 registry measured exactly **19 fresh mentions = 10 existing identities + 9 source-name-new candidates**.

Existing identities reused:

- Physics Toys
- Perception
- Oh The Biomes We've Gone
- Countered's Terrain Slabs
- AmpXtreme
- Complementary Shaders
- Distant Horizons
- Do a Barrel Roll
- Iris
- JJThunder To The Max

Source-name-new candidates:

- Catenary
- Underground Bunkers
- Flow
- Random Mob Sizes
- Epic Terrain
- Auroras
- Big Globe
- Bliss Shader
- Natures Spirit

Runtime canonicalization correctly collapses `Bliss Shader -> Bliss Shaders` and `Natures Spirit -> Nature's Spirit`; this is why the live Vault grows from 544 to 551 projects rather than naively to 553. All 19 fresh mentions resolve to 19 canonical identities in the chunk itself.

## Provider closure and anti-false-merge rules

Pre-production provider-collision QA proved **12 canonical overlays / 23 candidate direct destinations / zero cross-project URL collisions** against the untouched chunk-19 registry. Runtime merge adds 18 net destinations because five candidate URLs were already present on reused cards.

Provider production data lives in `provider-closure-20a-asianhalfsquat.json`.

- Catenary exposes verified Modrinth + GitHub source.
- Underground Bunkers exposes verified Modrinth + CurseForge.
- Flow, Random Mob Sizes, Epic Terrain, and Big Globe expose verified Modrinth + GitHub source.
- Auroras exposes verified Modrinth + CurseForge.
- Bliss Shader canonicalizes to Bliss Shaders and exposes exact Modrinth + CurseForge + `X0nk/Bliss-Shader` source.
- Natures Spirit canonicalizes to Nature's Spirit and exposes exact Modrinth + CurseForge + `Team-Hibiscus/NaturesSpirit` source.
- Physics Toys gains verified `Patbox/PhysicsToys` source alongside its existing Modrinth home.
- Iris gains verified `IrisShaders/Iris` source alongside existing CurseForge + Modrinth homes.
- Distant Horizons gains its real upstream `https://gitlab.com/distant-horizons-team/distant-horizons` as an Official source. GitHub forks are explicitly excluded as upstream.
- AmpXtreme, Complementary Shaders, and JJThunder To The Max remain unchanged because this bounded pass did not prove an additional trustworthy direct home.

## Current verified Vault totals

- 46 source videos total.
- 739 recommendation mentions.
- 739 mentions -> exactly 551 canonical projects.
- 549 canonical projects have verified direct homes.
- 1,014 exact direct destinations are exposed.
- 369 canonical projects are multi-provider.
- Exactly 2 unresolved canonical projects remain: **Better Book Recipe** and **Plank and Junk**.
- `nativeRecommendationSources = 16`.

## AsianHalfSquat coverage

- 37 / 350 source videos indexed.
- 480 recommendation mentions preserved.
- 480 / 480 indexed AsianHalfSquat mentions have at least one verified direct project home.
- Those mentions represent 323 AsianHalfSquat canonical projects.

The six original Drive-derived shards and all older bounded history checkpoints remain unchanged.

## Zero-loss QA architecture

`scripts/creator-vault-qa-chunk19.js` plus `catalog/creator-vault/research/creators.chunk19-baseline.json` freeze chunk 19 byte-for-byte. Chunk 20 hides only its source/provider production files, swaps only the chunk-19 creator ledger, runs the frozen chunk-19 wrapper unchanged (recursively proving every older checkpoint), restores current state in `finally`, then enforces the chunk-20 contract.

The hard gate locks aggregate totals, AHS coverage, all 19 canonical mappings, all 19 null-timestamp/base-link rules, creator-stated version labels for the December Top 10, provider families, Nature's Spirit/Bliss alias dedupe, the Distant Horizons GitLab-upstream rule, and the bounded no-change contract for AmpXtreme/Complementary/JJThunder.

## Real QA proof

- PASS — Canonical-probe run `33984229497`: untouched 720 / 544 baseline; 19 source mentions = 10 existing + 9 source-name-new candidates.
- PASS — Provider-collision run `33984371966`: 12 candidate overlays / 23 destinations / 0 collisions, with the complete chunk-19 regression stack still green.
- PASS — Post-merge stats run `33984435636`: exact 739 -> 551; 549 linked / 1,014 destinations / 369 multi-provider / 2 unresolved; AHS 480/480 across 323 canonical projects; all 19 fresh mentions linked and null-timestamped.
- PASS — Final run `33984561773` on `5a5168cab123cd3dc9fedfcf9f1cbcb9bc44fad9`: provider collision gate, missing-timestamp regression, full recursive Creator Vault QA through chunk 20, catalog regression QA, and portable catalog rendering all passed.

## Exact next action

Create `feature/creator-vault-asianhalfsquat-chunk-21` from this chunk's durable repository checkpoint. Continue backward from **2024-12-17** without rescanning any of the 37 indexed AsianHalfSquat IDs. Enumerate only a small older source slice, recover creator-authored recommendation evidence, canonicalize every mention against the **551-project** registry before provider research, add only independently verified direct homes through bounded append-only overlays, run the same nested QA stack, checkpoint GitHub + the canonical Drive wiki, and continue toward the 350-video target.
