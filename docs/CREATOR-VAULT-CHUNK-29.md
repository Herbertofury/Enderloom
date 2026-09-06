# Creator Vault — AsianHalfSquat Chunk 29

Status: **hard-accepted and zero-loss sealed**  
Date: 2026-09-06 UTC  
Branch: `feature/creator-vault-asianhalfsquat-chunk-29`  
Chunk 28 starting checkpoint: `4764acb12243a9dbf753f3aef1925d828480a8a0`  
Chunk 29 hard-acceptance commit: `d7663c761f186de2bd5e5b3d40aef3c60542fc7b`  
Hard-acceptance run: `34003531791`

## Accepted scope

Chunk 29 intentionally contains exactly two AsianHalfSquat uploads and stops before the unresolved 2024-05-28 short-form chronology slot.

1. **2024-06-10** — `gBMEwunuEUI` — *The Best Minecraft Graphics Mod Is Available Now* — 15 source mentions.
2. **2024-05-31** — `6LG88eiovYM` — *How to Turn Minecraft into an Overly Realistic Survival Game* — 28 source mentions.

Accepted batch totals:

- 2 videos
- 43 creator-authored source mentions
- 42 batch canonical projects
- 43 / 43 linked mentions
- 17 genuinely new global canonical identities
- 17 provider-closure cards
- 28 direct provider destinations
- 0 providerless new cards
- 0 incoming provider URL collisions

## Source semantics

### 2024-06-10 — `gBMEwunuEUI`

The creator description lists 15 Minecraft projects but does not publish per-project timestamps. Production therefore intentionally omits timestamp fields for all 15 so runtime preserves `null` timestamps and base-video links rather than manufacturing deep links.

Projects: Distant Horizons, Sodium, Iris, Indium, C2ME, Noisium, Embeddium, Oculus, Tectonic, Terralith, Lithosphere, Bliss, Photon, BSL, Complementary Reimagined.

`Timelapse` is music attribution only and is excluded from recommendation counts.

### 2024-05-31 — `6LG88eiovYM`

All 28 creator-authored timestamps are retained exactly. Runtime seconds are locked to:

`18, 33, 50, 67, 93, 113, 130, 160, 171, 180, 198, 213, 225, 243, 268, 275, 285, 298, 306, 319, 340, 350, 373, 386, 394, 406, 431, 457`

Projects: Time Control, Stack Size Edit, Real Camera, Better Combat, Camera Overhaul, Auto HUD, No Tree Punching, HT's TreeChop, Panda's Falling Trees, Unnecessary Overhaul, Body Health System, Spoiled, Dehydration, Thin Air, True Darkness, Torch Burnout, Neutral Animals, Mobs Attempt Parkour, Boids, Nyf's Spiders, You Thief: Remastered Edition, Danger Close, Fire arrows ignite fire, Realistic Fire Spread, EnvironmentZ, Bliss Shaders, Coven, Physics Mod Pro.

Excluded source evidence remains excluded:

- `A few Ideas` — non-project section
- `Fabric` — loader/setup evidence
- `Your Suggestions - Unicorn Heads` — music attribution

## Canonicalization result

The research-only canonical probe was run against the untouched Chunk 28 baseline of **934 mentions / 650 canonical projects**.

Measured split:

- 26 existing matched mentions
- 17 unmatched labels
- 17 unique unmatched identities
- June 10: 14 reused + 1 new (`Noisium`)
- May 31: 12 reused + 16 new

Important reuse locks include:

- Distant Horizons → `distant-horizons`
- C2ME → `c2me`
- Bliss / Bliss Shaders → `bliss-shaders`
- Camera Overhaul → `cameraoverhaul`
- Physics Mod Pro → `physics-mod`

## Provider and lineage locks

Pre-production collision run `34003322460` proved:

- baseline: 934 mentions / 650 canonical projects
- 17 candidate entries
- 17 measured-new IDs
- 28 direct destinations
- no existing candidate IDs
- zero providerless candidates
- zero URL collisions

Identity locks:

- **Body Health System** → SrGnis's archived original Modrinth/GitHub lineage. Later `Body Health System FORKED` and unrelated 2026 NeoForge `Body Health` are excluded.
- **Boids** → Tomate0613's original Modrinth project. The later multiloader reforge/rewrite is excluded.
- **True Darkness** → GrondagTheBarbarian's original lineage.
- **Torch Burnout** → thepeebrain's Fabric project.
- **Realistic Fire Spread** → historical MoriyaShiine project lineage.
- Generic mirrors, reuploads, inferred forks, and unrelated same-name projects are excluded.

## Rollback proof

Before promotion, the exact accepted Chunk 28 state was frozen byte-for-byte:

- rollback commit: `d126cf92b27c54bea06d22c90b3584a8132acba2`
- frozen Chunk 28 QA blob: `454eee289a0e450cee148fd92fdf395f18dc10fd`
- frozen Chunk 28 creator ledger blob: `d71b374f4ef727fb7aa04246e36e3a4b9de0ddea`

The Chunk 29 diagnostic and permanent QA both hide the Chunk 29 production source/provider files, restore the exact Chunk 28 creator ledger, and recursively run the exact frozen Chunk 28 QA before validating Chunk 29.

## Production and diagnostic chain

Production promotion commit: `30e40e821c480de1b4e3100c469d889a9609aa3f`

Diagnostic run: `34003455627`

The diagnostic step itself passed. The overall temporary run then failed exactly as expected because the still-current main QA hard-coded Chunk 28 totals; that QA was subsequently replaced by the permanent Chunk 29 acceptance contract.

Authoritative observed merged runtime from the green diagnostic:

- creators: 14
- indexed creators: 3
- videos: 59
- recommendations: **977**
- canonical projects: **667**
- linked canonical projects: **665**
- provider destinations: **1,231**
- multi-provider projects: **437**
- unresolved projects: **2**
- verified homes: 665
- native recommendation sources: 25
- setup packs: 5

Unresolved remains exactly:

1. `Better Book Recipe`
2. `Plank and Junk`

AsianHalfSquat after Chunk 29:

- **50 / 350 videos**
- **718 / 718 linked mentions**
- **457 canonical projects**
- **457 linked canonical projects**

## Hard acceptance

Hard-acceptance commit: `d7663c761f186de2bd5e5b3d40aef3c60542fc7b`

Hard-acceptance run: **`34003531791`** — fully green:

- Missing timestamp regression QA — success
- Focused Creator Vault recursive Chunk 29 QA — success
- Catalog regression QA — success
- Portable catalog rendering — success

The permanent QA locks:

- exact global runtime `977 / 667 / 665 / 1231 / 437 / 2`
- exact unresolved set
- AHS `50`, `718/718`, `457`
- both Chunk 29 video IDs/titles/dates/counts
- 43 mentions / 42 batch canonical projects
- all 15 June null timestamps/base links
- all 28 May creator timestamp seconds
- 17 new identities / 17 closure cards / 28 destinations
- zero provider URL ownership collisions
- original-lineage/fork exclusions
- source exclusions
- recursive exact Chunk 28 acceptance

## Google Drive zero-loss closeout

Canonical wiki:

`https://docs.google.com/document/d/1PW9sebwH5UYZ1YAW8-NfV00Zto6-yMQcutVT2-6mLrk/edit`

Fresh pre-write revision:

`ANLCKQlk_jIZiTMxqLowkBBsk-yEg7CQyckv9zgJIkuynzsjYBfDQ5SVNbTKjbvZir4bWjZz2xWzIG9sBMyALYRh0NTBIU9Kg5NHkuIrnFA`

Revision-guarded Chunk 29 append revision:

`ANLCKQlT4iRQ04kD-Ruh7HORJ7Jg2Mytsh4ogM80v_1YRfP6ywEz-vhdRXzRb0bniF369r-p_d1Mk9TBsWck-fBJpDJSGHYe525ypAazcco`

Read-back proof:

- tab: `t.0`
- marker: `Final hard-acceptance run: 34003531791`
- range: startIndex `135471`, endIndex `135509`
- current read-back revision exactly equals the append revision above

The first append attempt at terminal index `135251` was rejected by Google Docs because insertions must occur before the segment's terminal end index. It made no mutation. The identical revision-guarded append at index `135250` then succeeded.

## Exact next action — Chunk 30

Do not reopen Chunk 29 unless direct contradictory evidence or a regression appears.

1. Start from the final Chunk 29 durable checkpoint.
2. Resolve the **2024-05-28 short-form AsianHalfSquat upload** first: exact video identity, creator-authored project/list semantics, and whether it contributes recommendation records.
3. Do **not** skip past that chronology slot or guess an identity.
4. Continue strictly older only after that slot is resolved.
5. Keep the next batch to **1–5 videos**.
6. Stage research-only evidence before production.
7. Canonicalize against the exact frozen **977 mentions / 667 projects** baseline.
8. Bound provider research only to real new/underlinked identities.
9. Run the pre-production collision gate.
10. Freeze the exact Chunk 29 QA + creator ledger before promotion.
11. Promote, diagnose observed runtime, update the creator ledger, hard-accept recursively, append Drive with revision guard/read-back, and seal docs-only.
