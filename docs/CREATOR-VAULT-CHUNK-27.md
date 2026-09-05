# Creator Vault - AsianHalfSquat History Chunk 27

Status: final hard-acceptance checkpoint
Date: 2026-09-05
Repository: `Herbertofury/Enderloom`
Branch: `feature/creator-vault-asianhalfsquat-chunk-27`
Base durable chunk-26 checkpoint: `c5d6c64829b3273fc9f8fb0713fc28995c94af1e`
Frozen chunk-26 rollback checkpoint: `765a8e6fbc482cb671bbf6050d97bc7ed2a8398f`
Production promotion commit: `1f1d813c16f27ff9a39941c3df1c0e6eab9b84d9`
Final acceptance commit: `d8616229527162700994708fada783fc1aa14817`
Pre-production provider collision run: `33998094176`
Post-merge diagnostic run: `33998227785`
Final hard-acceptance run: `33998380559`
Pre-Drive repo checkpoint: `e52174bb7949b3ec9723359bff51f6b9f570173a`
Canonical Drive wiki: `https://docs.google.com/document/d/1PW9sebwH5UYZ1YAW8-NfV00Zto6-yMQcutVT2-6mLrk/edit`
Drive wiki revision: `ANLCKQmKidlKpnTFQPbqMVYzHIRxWiRyIekp-G8VtaQDarySHZ9GLSyQP7mIUxBk26a7ODpXiQMw5G2mdb-B_DeNo9J9Cu8iH3D7ft4u-RU`
Drive read-back verified marker: `Final hard-acceptance run: 33998380559`

## Scope and chronology

Chunk 27 continues directly from the corrected chunk-26 checkpoint and resolves the one chronology blocker that chunk 26 deliberately left unguessed.

The previously truncated 2024-09-06 analytics row is now exact:

- Video ID: `4QMpIDcPaJI`
- Title: `The Best Minecraft Mods That Completely Enhance Combat`
- Published date: `2024-09-06`
- Raw analytics timestamp: `2024-09-06 22:00:09`
- Frozen analytics fingerprint: 243130 views / 10811 likes / 391 comments
- Video: `https://www.youtube.com/watch?v=4QMpIDcPaJI`

The raw analytics row exposes the exact watch ID and full title while matching the chunk-26 fingerprint. The creator-authored indexed YouTube description independently supplies the Minecraft project list and section timestamps. The formerly `source-identity-pending` September 6 slot is therefore resolved without inference.

Research source: `catalog/creator-vault/research/asianhalfsquat.chunk27-source.json`
Production source: `catalog/creator-vault/recommendation-sources/asianhalfsquat.history-batch27.json`

## Exact creator sections

The creator description contains exactly nineteen Minecraft project mentions. Each project inherits only the timestamp of its creator-authored section; no finer per-project timestamp is invented.

### Melee Mods - 1:53 / 113s

1. Old Combat Mod
2. Sword Parry
3. Better Combat
4. Simply Swords
5. Immersive Combat
6. Mo' Bends
7. Epic Fight

### Ranged Weapons - 4:27 / 267s

8. Guns Without Roses
9. MrCrayfish's Gun Mod
10. ModularWarfare - Guns and More
11. ModularMovements
12. Timeless and Classics Zero
13. Body Camera Shader
14. Blockfront

### Magic - 7:38 / 458s

15. Electroblob's Wizardry
16. Wizards (RPG Series)
17. Arcanus Continuum
18. Iron's Spells 'n Spellbooks
19. Mahau Tsukai

Excluded source evidence remains explicit:

- War Thunder - sponsor/download call, not a Minecraft project recommendation.
- Ovani Sound - music attribution only.

## Canonicalization

The untouched chunk-26 runtime is exactly 814 recommendation mentions / 585 canonical projects.

Canonical probe run `33997945606` measured four direct existing identities and fifteen source-name-new candidates.

Existing identities:

- Better Combat -> `better-combat`
- Simply Swords -> `simply-swords`
- Epic Fight -> `epic-fight`
- Body Camera Shader -> `body-camera-shader`

Final new canonical families:

- Old Combat Mod -> `old-combat-mod`
- Sword Parry -> `sword-parry`
- Immersive Combat -> `immersive-combat`
- Mo' Bends -> `mo-bends`
- Guns Without Roses -> `guns-without-roses`
- MrCrayfish's Gun Mod -> `mrcrayfishs-gun-mod`
- ModularWarfare - Guns and More -> `modularwarfare`
- ModularMovements -> `modularmovements`
- Timeless and Classics Zero -> `timeless-and-classics-zero`
- Blockfront -> `blockfront`
- Electroblob's Wizardry -> `electroblobs-wizardry`
- Wizards (RPG Series) -> `wizards`
- Arcanus Continuum -> `arcanus`
- Iron's Spells 'n Spellbooks -> `irons-spells-n-spellbooks`
- Mahau Tsukai -> `mahou-tsukai`

Final canonicalization is therefore 15 new / 4 reuse.

## Identity and anti-false-merge locks

- Creator spelling `Mahau Tsukai` is retained as source evidence but resolves only to `mahou-tsukai` / Mahou Tsukai. No `mahau-tsukai` duplicate is permitted.
- `Arcanus Continuum` is retained as a historical/source alias of current `arcanus` / Arcanus. No `arcanus-continuum` duplicate is permitted.
- `Sword Parry` is pinned to Xires87/Fryc's established project and excludes the unrelated newer 2026 Zellior same-name project.
- `Immersive Combat` is pinned to the established 1.12 Better Combat successor and excludes the unrelated 2026 NeoForge project.
- Timeless and Classics Zero is pinned to the original TaCZ lineage and excludes Plus/community forks.
- MrCrayfish's Gun Mod is pinned to the original MrCrayfish lineage and excludes unofficial ports.
- BlockFront uses verified Modrinth, CurseForge, and official-site homes; no inferred source repository is attached.
- Legacy Mo' Bends and Electroblob's Wizardry use author-linked CurseForge/upstream homes rather than reposts or ports.

## Provider closure

Provider candidate research is frozen in `catalog/creator-vault/research/asianhalfsquat.chunk27-provider-candidates.json`.

Pre-production run `33998094176` proves exactly:

- candidate/enrichment cards: 16
- candidate direct destinations: 40
- zero-provider cards: 0
- cross-project collisions among incoming Chunk 27 URLs: 0
- full recursive chunk-26 baseline green with production untouched
- timestamp regression green
- catalog QA green
- portable rendering green

The sixteen cards are the fifteen new families plus bounded Simply Swords enrichment. Better Combat, Epic Fight, and Body Camera Shader were already sufficiently linked and were not reopened.

Production provider closure: `catalog/creator-vault/project-sources/provider-closure-27a-asianhalfsquat.json`

## Observed post-merge runtime

Diagnostic run `33998227785` measures the real merged state rather than inferring totals:

- creators: 14
- indexed creators: 3
- source videos: 54
- recommendation mentions: **833**
- canonical projects: **600**
- linked canonical projects: **598**
- unresolved canonical projects: **2**
- multi-provider projects: **416**
- exact direct provider destinations: **1139**
- native recommendation sources: 23
- setup packs: 5

Unresolved remains exactly:

1. Better Book Recipe
2. Plank and Junk

AsianHalfSquat actual production state:

- **45 / 350 videos indexed**
- **574 recommendation mentions**
- **574 / 574 mentions linked**
- **378 canonical AHS projects**
- **378 linked canonical AHS projects**

## Zero-loss QA architecture

Chunk 26 is frozen byte-for-byte before Chunk 27 acceptance:

- rollback/checkpoint commit: `765a8e6fbc482cb671bbf6050d97bc7ed2a8398f`
- frozen QA: `scripts/creator-vault-qa-chunk26.js`
- frozen creator ledger: `catalog/creator-vault/research/creators.chunk26-baseline.json`

The permanent Chunk 27 wrapper hides only the Chunk 27 production source/provider files, swaps only the exact frozen Chunk 26 creator ledger, executes the frozen Chunk 26 wrapper recursively, restores current state in `finally`, then enforces Chunk 27.

Permanent Chunk 27 acceptance locks:

- exact September 6 source identity and analytics fingerprint
- all 19 creator source labels
- only the three legal creator section timestamps: 113 / 267 / 458 seconds
- exact YouTube deep links for every mention
- 15-new / 4-reuse canonicalization
- all alias and anti-false-merge decisions
- 16-card / 40-destination provider closure
- ownership of only the 40 incoming Chunk 27 URLs, avoiding false failures from unrelated historical registry aliases
- sponsor/music exclusions
- 833 / 600 / 598 / 1139 / 416 / 2 global runtime
- AHS 45 / 350, 574 / 574, 378 canonical identities
- rendered Creator Vault output
- complete recursive Chunk 26 and older acceptance

The first final-contract run `33998305413` exposed one QA-only overreach: a new global provider-URL uniqueness assertion tripped on a pre-existing William Wythers historical alias pair unrelated to Chunk 27. No production data changed. Commit `d8616229527162700994708fada783fc1aa14817` scopes the check correctly to the forty incoming Chunk 27 URLs. Replacement hard-acceptance run `33998380559` is fully green across timestamp QA, recursive Creator Vault QA, catalog regression, and portable rendering.

## Drive persistence

The canonical Creator Vault Drive wiki was appended under revision guard from the exact chunk-26 revision and then read back successfully. The persisted Chunk 27 marker is `Final hard-acceptance run: 33998380559` and the resulting revision is `ANLCKQmKidlKpnTFQPbqMVYzHIRxWiRyIekp-G8VtaQDarySHZ9GLSyQP7mIUxBk26a7ODpXiQMw5G2mdb-B_DeNo9J9Cu8iH3D7ft4u-RU`.

## Next bounded action

Chunk 28 starts strictly older than 2024-09-04, excludes all 45 already indexed AsianHalfSquat video IDs, and first resolves the next ordinary creator upload from first-party/independently corroborated source evidence before any provider research or production mutation.
