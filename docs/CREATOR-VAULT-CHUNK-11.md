# Creator Vault — AsianHalfSquat Chunk 11

Status: verified green  
Branch: `feature/creator-vault-asianhalfsquat-chunk-11`  
Pinned QA/data commit: `0c2a9e88cc7eccd552ba477d5c13981ce87ab2bd`  
GitHub Actions proof: `33960760399`

## Source batch

AsianHalfSquat's official YouTube RSS feed supplied three non-overlapping creator-authored records beyond the preserved 16-video legacy import:

- `suH-0zIiLU4` — 2026-08-28 — **Top 10 Minecraft Mods (26.2) - 2026** — 10 chapter recommendations.
- `VW9z8XZaOqU` — 2026-01-16 — **Minecraft Like You've Never Seen It Before** — 13 creator-listed project mentions with no per-project chapter timestamps in the original description.
- `_zcMnVEWhfQ` — 2026-01-09 — **Unique Minecraft Mods You Should Try Today - 2026** — 9 chapter recommendations.

The official RSS also resolves `rjb_PMTAHwA` (2026-02-07) as the previously truncated legacy video, completing the exclusion set. The channel-history target is advanced from the stale 349 count to **350 videos** because the RSS exposes the newer 2026-08-28 upload.

## Verified contract

- AsianHalfSquat: **19 / 350 videos**, **248 recommendation mentions**, **248 / 248 linked mentions**, **192 canonical projects** represented by those mentions.
- Whole Vault: **28 source videos / 507 mentions -> 435 canonical projects**.
- **433** canonical projects linked.
- **721** exact direct destinations.
- **250** multi-provider canonical projects.
- Exactly **2 unresolved** canonical projects: `Better Book Recipe` and `Plank and Junk`.

The 32 fresh source mentions merge as exactly **10 existing canonical identities + 22 genuinely new canonical projects**, with zero name-vs-provider-URL conflicts.

## Provider rules retained

All 32 chunk-11 mentions have verified direct project homes. Existing cards for Distant Horizons, Tectonic, FPS Overlay, and Presence Footsteps gain their creator-linked Modrinth homes. Multi-provider/source examples include Fancy World Animations, William Wythers' Overhauled Overworld, and Do a Barrel Roll.

Grassier Grass, Ji AFK Cinematic, and Vanilla SkyGrid intentionally remain Modrinth-only because no second trustworthy project home was established. The older CurseForge/GitHub `Skygrid` project was challenge-checked and rejected as a false merge for `Vanilla SkyGrid`.

Provider enrichment is sharded as:

- `provider-closure-11a-asianhalfsquat.json`
- `provider-closure-11b-asianhalfsquat.json`
- `provider-closure-11c-asianhalfsquat.json`

## Timestamp truth

The August 28 and January 9 records preserve creator-authored timestamps/deep links. The January 16 description has no per-project timestamps, so those 13 rows deliberately normalize to `timestampSeconds=null` and the base video URL. The dedicated missing-timestamp regression test prevents fabricated `0:00` links.

## Zero-loss acceptance

`scripts/creator-vault-qa-episode5.js` and `catalog/creator-vault/research/creators.episode5-baseline.json` freeze the exact Episode 5 acceptance state. The chunk-11 wrapper hides only its four production shards, proves Episode 5 byte-for-byte (which itself proves Episode 3), restores current state, then enforces the new AsianHalfSquat contract.

GitHub Actions run `33960760399` passed:

- Missing timestamp regression QA.
- Episode 3 preserved baseline: `431 -> 372; 370 linked / 586 destinations / 192 multi-provider / 2 unresolved`.
- Episode 5 preserved baseline: `475 -> 413; 411 linked / 665 destinations / 227 multi-provider / 2 unresolved`.
- AsianHalfSquat chunk 11: `507 -> 435; 433 linked / 721 destinations / 250 multi-provider / 2 unresolved`; AHS `248/248` linked across 192 canonical projects.
- Catalog regression QA.
- Portable catalog render.

## Exact next action

Continue AsianHalfSquat backward from the January 9, 2026 RSS boundary without rescanning any of the 19 already indexed video IDs. Enumerate the next missing late-2025 channel-history slice, canonicalize every new source mention against the current 435-project registry, attach every independently verified destination through small append-only shards, run nested baseline + current QA, checkpoint exact totals, and continue toward the 350-video target before returning to the protected TikTok creator ledger.
