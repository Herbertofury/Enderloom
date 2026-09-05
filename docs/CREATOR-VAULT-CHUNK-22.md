# Creator Vault — AsianHalfSquat Chunk 22

## Durable checkpoint

- Repository: `Herbertofury/Enderloom`
- Branch: `feature/creator-vault-asianhalfsquat-chunk-22`
- Base checkpoint: `3f21ebaa03af03b1ad43177aad311084d523a149` (sealed chunk 21)
- Pinned green acceptance commit: `979ad5d03d9114a1be36aae82bc621a32949484b`
- Durable repository checkpoint: this checkpoint-document commit at branch HEAD after publication
- Canonical probe run: `33987922205`
- Provider collision run: `33988083217`
- Post-merge diagnostic run: `33988170781`
- First hard-QA challenge run: `33988276735` (correctly failed on a brittle alias-array assertion only; production data was not changed)
- Final green acceptance run: `33988366675`

## Source boundary

Chunk 22 continues strictly backward from the sealed 2024-10-26 boundary and does not rescan the 39 previously indexed AsianHalfSquat videos.

One video is intentionally sufficient for this bounded chunk because it contains 31 creator-named Minecraft recommendations:

- 2024-10-05 — `xXaGrrwmLUg` — **10 Easy Ways You Can Make Minecraft Look Amazing**

The creator description supplies ten visual-style section timestamps. Every named project inherits only its creator-authored section timestamp; no finer timestamp is invented.

- 1:36 — Cursed Minecraft: NoCubes; Foliage & Trees Realistic 3D HD NoCube; Kappa Shader; Optifine
- 2:30 — Beautiful Oceans: Physics Mod Pro; Pegasus Shader
- 3:06 — No Light Black and White: No Light - No Color; RyoamicLights
- 3:46 — Interactive Utility Blocks: ImmersiveMC; Visual Overhaul; Easy Anvils; Easy Magic
- 4:33 — Enhanced Foliage: Os' Colorful Grasses; O's Colorful Leaves; Grass+; dronko's alternative Bushy Leaves; Fancy Crops
- 5:25 — VHS: RetroVision; CameraOverhaul
- 5:51 — Texture Detail: Complementary Shaders; Bare Bones
- 6:28 — Incredible End Visuals: Bliss Shaders; Nullscape; AmbientSounds
- 7:18 — Animated Creatures: Fresh Animations; Fresh Animations Extensions; Fresh Skeleton Physics; Fresh Moves
- 8:08 — Little Planet: Circumnavigate; BSL Shaders; Astrocraft

Excluded source evidence:

- Opera GX — sponsor-excluded, never a Minecraft project card
- Music credits — non-project evidence

## Canonical split

The research-only probe ran against the untouched chunk-21 state of **750 mentions / 554 canonical projects**.

- 31 fresh source mentions
- 12 direct existing-name hits
- 19 source-name-miss candidates

Direct existing hits included NoCubes, OptiFine, Physics Mod, RyoamicLights, Easy Anvils, dronko's alternative Bushy Leaves, CameraOverhaul, Complementary Shaders, Bliss Shaders, AmbientSounds, Fresh Animations, and BSL Shaders.

Provider-aware production merging adds **18 net-new canonical projects**, not 19. `Os' Colorful Grasses` was a name-only miss but rejoins the existing canonical `os-colorful-grasses` / **O's Colorful Grasses** card once the verified project identity is applied.

All 31 fresh mentions are distinct canonical identities inside the source video and all 31 resolve to at least one verified direct home.

## Provider closure

Pre-production collision QA proved:

- 21 canonical overlays
- 43 candidate direct destinations
- 0 cross-project URL collisions

Production provider closure is intentionally split into two bounded shards:

- `catalog/creator-vault/project-sources/provider-closure-22a-asianhalfsquat.json`
- `catalog/creator-vault/project-sources/provider-closure-22b-asianhalfsquat.json`

Important identity decisions:

- **Foliage & Trees Realistic 3D HD NoCube** is historical wording for the same lineage now titled **VRRW Overworld - Foliage and Trees**; exact Modrinth + CurseForge homes are used.
- **Kappa Shader** uses exact Modrinth + CurseForge shader homes.
- **Pegasus Shader** resolves to **Pegasus Shaders**; source-era provider history proves lineage.
- **No Light - No Color** resolves to **No Light — No Color!** and remains Modrinth-only in this bounded pass.
- **ImmersiveMC**, **Visual Overhaul**, **Easy Magic**, **Nullscape**, **Fresh Moves**, and **Circumnavigate** include verified source repositories where proven.
- **O's Colorful Leaves** remains the exact Java Modrinth resource pack; the unrelated Bedrock `os-leaves` pack is explicitly excluded.
- **Grass+** remains Modrinth-only where no second exact Java home was proven.
- **Fresh Animations Extensions** resolves to provider title **Fresh Animations: Extensions**.
- **Fresh Moves** remains distinct from Trailer Player Animations / Fresh Player Animations.
- **Astrocraft** resolves to **Astrocraft: Realistic Night Skies**; unrelated AstroCraft modpacks and Astrocraft: Lite are excluded.
- Existing **Physics Mod** gains `haubna/PhysicsMod` source.
- Existing **Easy Anvils** gains `Fuzss/easy-anvils` source.
- Settled provider families such as Complementary Shaders and Fresh Animations were not reopened without need.

## Exact observed totals

The post-merge diagnostic run measured the live runtime state; these values are observed rather than inferred:

- 49 source videos total
- 781 recommendation mentions
- 572 canonical projects
- 570 canonical projects with verified direct homes
- 1,063 exact direct destinations
- 387 multi-provider canonical projects
- 2 unresolved canonical projects: **Better Book Recipe**, **Plank and Junk**
- `nativeRecommendationSources = 18`

AsianHalfSquat coverage:

- 40 / 350 source videos indexed
- 522 recommendation mentions preserved
- 522 / 522 indexed mentions linked
- 346 distinct linked AHS canonical projects

## Zero-loss QA

Chunk 21 is frozen byte-for-byte as:

- `scripts/creator-vault-qa-chunk21.js`
- `catalog/creator-vault/research/creators.chunk21-baseline.json`

Chunk 22 QA temporarily hides only its three production files, swaps only the creator ledger to the frozen chunk-21 baseline, runs the exact chunk-21 wrapper recursively, restores current state in `finally`, then enforces the chunk-22 contract.

The final contract locks:

- aggregate 781 / 572 / 570 / 1063 / 387 / 2 totals
- AHS 40 / 350 and 522 / 522 across 346 canonical projects
- all 31 source-label → canonical-ID mappings
- all ten creator section timestamps and exact YouTube deep links
- provider families and exact source enrichments
- Colorful Grasses provider-aware dedupe
- historical foliage lineage
- Fresh Moves separation
- Astrocraft anti-modpack guard
- Bedrock Colorful Leaves exclusion
- Opera GX sponsor exclusion
- the same two historical unresolved project exceptions

The first hard-QA challenge run intentionally caught one assertion implementation defect: runtime normalization does not guarantee punctuation-equivalent source spellings remain literally stored in `project.aliases`. The QA was corrected to assert the stronger source-label → canonical-ID/title/provider truth. No source shard, canonical identity, provider URL, or production data changed as part of that fix.

## Real QA proof

Final GitHub Actions run `33988366675` completed successfully on acceptance commit `979ad5d03d9114a1be36aae82bc621a32949484b`.

PASS — provider collision gate: 21 overlays / 43 destinations / 0 collisions.

PASS — missing-timestamp regression QA.

PASS — recursive Creator Vault QA through every frozen checkpoint and chunk 22.

Final success line:

`Creator Vault AsianHalfSquat chunk 22 QA passed: 781 mentions -> 572 canonical projects; 570 linked / 1063 destinations / 387 multi-provider / 2 unresolved. AHS linked mentions=522/522 across 346 canonical projects; all 31 creator-section timestamps/deep links, alias dedupe, sponsor exclusion, anti-false-merge rules, and bounded provider enrichments are locked.`

PASS — catalog regression QA.

PASS — portable catalog rendering.

## Exact next action

Create `feature/creator-vault-asianhalfsquat-chunk-23` from the durable chunk-22 checkpoint commit. Continue strictly older than **2024-10-05** and exclude all **40 already indexed AsianHalfSquat video IDs**. Resolve only the next small older upload slice (chronology research already indicates the next upload is around 2024-10-02), recover creator-authored recommendation evidence, canonicalize every named mention against the frozen **572-project / 781-mention** registry before provider research, preserve ambiguous links as source-level evidence rather than guessed cards, add only independently verified direct homes through bounded append-only overlays, run the same collision + recursive QA + catalog + portable gates, checkpoint GitHub + the canonical Drive wiki, and stop again at a clean chunk boundary.
