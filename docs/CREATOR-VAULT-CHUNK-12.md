# Creator Vault — AsianHalfSquat Chunk 12

Status: verified green  
Branch: `feature/creator-vault-asianhalfsquat-chunk-12`  
Pinned QA/data commit: `bfe347de788cbe01c909f3eee8b3be28683f6574`  
GitHub Actions proof: `33961262935`

## Source batch

Chunk 12 continues AsianHalfSquat backward through the late-2025 channel history without rescanning any of the 19 previously indexed IDs. Official uploads-playlist enumeration fixed the chronology; per-video `yt-dlp` metadata hit YouTube's anti-bot wall and was not retried unchanged. Exact titles, dates, chapter labels, timestamps, and creator-stated loader labels for the active pair were instead preserved from YouTube's indexed public description surface.

- `6lZny5TJBV4` — 2025-10-18 — **Top 10 Minecraft Mods (1.21.10) - 2025** — 10 exact chapter recommendations.
- `Z-k0lZfl5vI` — 2025-09-29 — **Unique Minecraft Mods You Should Try Today** — 9 exact chapter recommendations.

The next two already-enumerated videos are intentionally queued for chunk 13 rather than mixed into this checkpoint:

- `8fwC4CzRDmE` — 2025-09-24 — **Minecraft Mod Combinations That Work Perfectly Together #8**.
- `o9V0iP7rik4` — 2025-09-04 — **Top 10 Minecraft Mods (1.20.1) - September 2025**.

## Canonical dedupe contract

The 19 fresh source mentions canonicalize as exactly **4 existing + 15 new** projects.

Existing cards reused:

- Arcane Lanterns -> `arcane-lanterns`
- Stellarity -> `stellarity`
- ProtoManly's Weather -> `protomanly-s-weather`
- Falling Sand -> `falling-sand`

New canonical identities:

- Kobolds
- Inferno
- Classic Pipes
- MVS - Moog's Voyager Structures
- Call Your Horse
- Tetris MC
- CliffTree
- Solar Apocalypse
- Wandrous
- Clavis
- Sound Physics Perfected
- 2D Minecraft
- Outer Wilds Gravity Tech
- Velthoric
- BetterWeather (Beta 1.7.3)

## Provider closure

The provider challenge pass produced **15 candidate projects / 36 verified direct destinations / zero URL collisions** against the pre-chunk-12 registry.

Provider enrichment is sharded as:

- `provider-closure-12a-asianhalfsquat.json`
- `provider-closure-12b-asianhalfsquat.json`
- `provider-closure-12c-asianhalfsquat.json`

Notable provider rules retained:

- Kobolds, Inferno, Classic Pipes, Call Your Horse, Solar Apocalypse, Wandrous, and Velthoric expose Modrinth + CurseForge + verified source repositories.
- CliffTree remains one canonical card with unified Modrinth plus separate CurseForge datapack and mod listings.
- 2D Minecraft and Outer Wilds Gravity Tech intentionally remain Modrinth-only after the alternate-home challenge pass.
- MVS Integrated is a separate companion project and is not merged onto the base MVS card.
- BetterWeather is explicitly pinned to the pre-2025 Beta 1.7.3 project (`modrinth.com/mod/betterweather` + `paulevsGitch/BetterWeather`). 2026 same-name projects such as BetterWeatherBios79 / Better Weather: Reborn are excluded.

## Current verified contract

- Whole Vault: **30 source videos / 526 recommendation mentions -> 450 canonical projects**.
- **448** canonical projects linked.
- **757** exact direct destinations.
- **263** multi-provider canonical projects.
- Exactly **2 unresolved** canonical projects: `Better Book Recipe` and `Plank and Junk`.
- `nativeRecommendationSources = 8`.

AsianHalfSquat specifically:

- **21 / 350 videos** indexed.
- **267 recommendation mentions** preserved.
- **267 / 267 mentions** have at least one verified direct project home.
- Those mentions represent **209 AsianHalfSquat canonical projects**.

## Zero-loss QA architecture

Chunk 11 is frozen byte-for-byte as `scripts/creator-vault-qa-chunk11.js` with `catalog/creator-vault/research/creators.chunk11-baseline.json`. The chunk-12 wrapper temporarily hides only the four chunk-12 production shards and swaps in the chunk-11 creator ledger, runs the complete chunk-11 suite unchanged (which itself proves Episode 5 and Episode 3), restores current state in `finally`, then enforces the chunk-12/current-state contract.

## Real QA proof

GitHub Actions run `33961262935` passed on `bfe347de788cbe01c909f3eee8b3be28683f6574`:

- PASS — Missing timestamp regression QA.
- PASS — Episode 3 preserved baseline.
- PASS — Episode 5 preserved baseline.
- PASS — AsianHalfSquat chunk 11 preserved baseline: `507 -> 435; 433 linked / 721 destinations / 250 multi-provider / 2 unresolved`.
- PASS — AsianHalfSquat chunk 12: `526 -> 450; 448 linked / 757 destinations / 263 multi-provider / 2 unresolved`; AHS `267/267` linked across 209 canonical projects.
- PASS — Catalog regression QA.
- PASS — Portable catalog render.

## Exact next action

Start `feature/creator-vault-asianhalfsquat-chunk-13` from this checkpoint. Ingest only `8fwC4CzRDmE` (2025-09-24, Mod Combinations #8) and `o9V0iP7rik4` (2025-09-04, Top 10 1.20.1 September 2025). Recover their exact creator-authored recommendation lists without retrying the rejected per-video `yt-dlp` path, canonicalize against the current 450-project registry before creating any new IDs, attach every independently verified provider home through bounded append-only shards, prove the entire nested baseline stack plus current totals, checkpoint, then continue backward through the 350-video AsianHalfSquat target.
