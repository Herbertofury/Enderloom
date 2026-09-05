# Creator Vault — AsianHalfSquat Chunk 23

## Durable checkpoint

- Repository: `Herbertofury/Enderloom`
- Branch: `feature/creator-vault-asianhalfsquat-chunk-23`
- Base checkpoint: `0d572683eec745617cbaa23b07d851531b467962` (sealed chunk 22)
- Pinned green acceptance commit: `ad55f9e191256da1e595925c2ce446eeb12215f8`
- Durable repository checkpoint: this checkpoint-document commit at branch HEAD after publication
- Canonical research run: `33988701551`
- Pre-production provider collision run: `33988782988`
- Post-merge diagnostic run: `33988878058`
- Final green acceptance run: `33988957726`

## Source boundary

Chunk 23 continues strictly backward from the sealed 2024-10-05 boundary and does not rescan the 40 previously indexed AsianHalfSquat videos.

One immediate older upload is intentionally sufficient for this bounded chunk:

- 2024-10-02 — `KaiDjB1w_OY` — **The Most Overkill Minecraft Terrain Generation Mod Available**

AsianHalfSquat's indexed original description names exactly eight Minecraft projects:

1. JJThunder To The Max
2. Distant Horizons
3. Big Globe
4. Terralith
5. Tectonic
6. Chunky
7. StepUpAgain
8. Bliss Shaders

The description supplies no per-project chapter timestamps. All eight production mentions intentionally omit `timestampSeconds`, resolve to runtime `null`, use the base YouTube URL, and never fabricate `t=0s`.

Excluded source evidence:

- Music - Limitless — non-project music attribution only

## Canonical split

The research-only probe ran against the untouched chunk-22 state of **781 mentions / 572 canonical projects**.

- 8 fresh source mentions
- 7 direct existing canonical hits
- 1 source-name-new candidate

Existing cards reused:

- JJThunder To The Max -> `jjthunder-to-the-max`
- Distant Horizons -> `distant-horizons`
- Big Globe -> `big-globe`
- Terralith -> `terralith`
- Tectonic -> `tectonic`
- Chunky -> `chunky`
- Bliss Shaders -> `bliss-shaders`

The sole new canonical family is:

- StepUpAgain -> `stepupagain`

Production therefore advances 572 -> 573 canonical projects. All eight fresh source mentions remain distinct canonical identities inside this video and all eight resolve to at least one verified direct project home.

## Provider closure

The bounded provider challenge pass intentionally touched only two canonical cards:

- new `stepupagain`
- reused but underlinked `chunky`

Pre-production collision QA proved:

- 2 canonical overlays
- 5 candidate direct destinations
- 0 cross-project URL collisions

Production provider closure:

- `catalog/creator-vault/project-sources/provider-closure-23a-asianhalfsquat.json`

StepUpAgain:

- Modrinth: `https://modrinth.com/mod/stepupagain`
- GitHub source: `https://github.com/derrod/StepUp`
- The later separate StepUpAgain2 project/fork is explicitly excluded and never merged.

Chunky keeps its existing Modrinth home and gains the direct homes documented by the project itself:

- Modrinth: `https://modrinth.com/plugin/chunky`
- CurseForge Fabric: `https://www.curseforge.com/minecraft/mc-mods/chunky-pregenerator`
- CurseForge Forge/NeoForge: `https://www.curseforge.com/minecraft/mc-mods/chunky-pregenerator-forge`
- GitHub source: `https://github.com/pop4959/Chunky`

JJThunder To The Max, Distant Horizons, Big Globe, Terralith, Tectonic, and Bliss Shaders were already sufficiently linked and were deliberately not reopened.

## Exact observed totals

The post-merge diagnostic measured the runtime state; these values are observed rather than inferred:

- 50 source videos total
- 789 recommendation mentions
- 573 canonical projects
- 571 canonical projects with verified direct homes
- 1,068 exact direct destinations
- 389 multi-provider canonical projects
- 2 unresolved canonical projects: **Better Book Recipe**, **Plank and Junk**
- `nativeRecommendationSources = 19`

AsianHalfSquat coverage:

- 41 / 350 source videos indexed
- 530 recommendation mentions preserved
- 530 / 530 indexed mentions linked
- 347 distinct linked AHS canonical projects

## Zero-loss QA

Chunk 22 is frozen byte-for-byte as:

- `scripts/creator-vault-qa-chunk22.js`
- `catalog/creator-vault/research/creators.chunk22-baseline.json`

Chunk 23 QA temporarily hides only its two production files, swaps only the creator ledger to the exact chunk-22 baseline, runs the frozen chunk-22 wrapper unchanged (which recursively proves every older checkpoint), restores current state in `finally`, then enforces the chunk-23 contract.

The permanent chunk-23 gate locks:

- aggregate 789 / 573 / 571 / 1068 / 389 / 2 totals
- AHS 41 / 350 and 530 / 530 across 347 canonical projects
- all eight source-label -> canonical-ID mappings
- all eight null-timestamp/base-link rules
- no fabricated `t=0s`
- StepUpAgain provider family and exact URLs
- StepUpAgain vs StepUpAgain2 identity isolation
- Chunky unified canonical identity with loader-specific CurseForge destinations
- Chunky GitHub source enrichment
- exactly one non-project music evidence record
- the same two historical unresolved project exceptions

## Real QA proof

Final GitHub Actions run `33988957726` completed successfully on acceptance commit `ad55f9e191256da1e595925c2ce446eeb12215f8`.

PASS — provider collision gate: 2 overlays / 5 destinations / 0 collisions.

PASS — missing-timestamp regression QA.

PASS — recursive Creator Vault QA through every frozen checkpoint and chunk 23.

Final success line:

`Creator Vault AsianHalfSquat chunk 23 QA passed: 789 mentions -> 573 canonical projects; 571 linked / 1068 destinations / 389 multi-provider / 2 unresolved. AHS linked mentions=530/530 across 347 canonical projects; all 8 null timestamps/base links, StepUpAgain identity isolation, Chunky loader-specific provider enrichment, and recursive chunk-22 baseline are locked.`

PASS — catalog regression QA.

PASS — portable catalog rendering.

## Exact next action

Create `feature/creator-vault-asianhalfsquat-chunk-24` from the durable chunk-23 checkpoint commit. Continue strictly older than **2024-10-02** and exclude all **41 already indexed AsianHalfSquat video IDs**. Chronology research indicates the next ordinary upload is around **2024-09-26**, but freshly verify its exact ID/title and distinguish it from any same-day livestream before ingestion. Recover only creator-authored recommendation evidence, canonicalize every named mention against the frozen **573-project / 789-mention** registry before provider research, preserve ambiguous links as source-level evidence rather than guessed cards, add only independently verified direct homes through bounded append-only overlays, run the same collision + recursive QA + catalog + portable gates, checkpoint GitHub + the canonical Drive wiki, and stop again at a clean chunk boundary.
