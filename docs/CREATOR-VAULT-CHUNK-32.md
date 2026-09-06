# Creator Vault - AsianHalfSquat Chunk 32

Status: hard-accepted

Date: 2026-09-06 UTC

Repository: `Herbertofury/Enderloom`

Branch: `feature/creator-vault-asianhalfsquat-chunk-32`

Hard acceptance commit: `b30144aacae50d3cfe04a86de02f18eeb370f4e1`

Final hard-acceptance run: `34006747853`

## Source truth

- `2024-02-23` - `youtube:Z50_ryPNNAc` - **Top 10 Minecraft Mods (1.20) - 2024**.
- Exactly ten creator-listed entries under the creator's `MODS` heading, in creator source order:
  1. Infinity Cave - `0:22`
  2. Dynamic Surroundings - `0:52`
  3. Chunk By Chunk - `1:21`
  4. Multi Mine - `1:48`
  5. Thin Air - `2:09`
  6. Horse Combat Controls - `2:50`
  7. Grappling Hook Mod - `2:22`
  8. Atmospheric Phenomena - `3:52`
  9. BetterEnd - `4:13`
  10. Exposure - `4:38`
- The creator really places Horse Combat Controls `2:50` before Grappling Hook Mod `2:22`; source order and literal timestamps are preserved instead of being silently sorted.
- `Complementary Reimagined` appears only after the creator's `5:04` Outro under a separate `SHADERS` block. It is preserved as ancillary excluded evidence, not inferred as an eleventh Top-10 mod recommendation.
- Minecraft Forge / Fabric setup and `Minecraft Volume Beta - Aria Math` music attribution remain excluded non-project evidence.

## Native-over-legacy reconciliation

Chunk 32 is a corrective source replacement, not a new-video append.

The loader builds native recommendation videos first, appends imported legacy videos second, and deduplicates by video ID with the first record winning. The sealed Chunk 31 baseline therefore exposed the legacy `youtube:Z50_ryPNNAc` record only while the Chunk 32 native source was hidden; restoring the native record correctly replaces that imported copy.

The hard diagnostic proved:

- sealed Chunk 31 baseline: `996` recommendations / `672` canonical projects
- overlapping legacy video: `11` recommendation mentions
- exact extra legacy entry: **Complementary Reimagined**
- the legacy copy incorrectly carried that shader at Exposure's `4:38` timestamp despite the creator placing it after the `5:04` Outro in `SHADERS`
- native creator-authored replacement: exactly `10` MODS recommendations
- recommendation delta: `-1`
- resulting runtime: `995` recommendations
- global video count stays `61`
- AHS recommendation-bearing video count stays `52`
- native source wins with no legacy `importId` / `importSourceSystem` metadata

This removes one inflated legacy recommendation without deleting any creator-listed mod content.

## Canonical and provider result

The runtime canonical probe resolves all ten native source mentions to existing project identities:

- Infinity Cave -> `infinity-cave`
- Dynamic Surroundings -> `dynamic-surroundings`
- Chunk By Chunk -> `chunk-by-chunk`
- Multi Mine -> `multi-mine`
- Thin Air -> `thin-air`
- Horse Combat Controls -> `horse-combat-controls`
- Grappling Hook Mod -> `grappling-hook-mod`
- Atmospheric Phenomena -> `atmospheric-phenomena`
- BetterEnd -> `betterend`
- Exposure -> `exposure`

Final Chunk 32 canonical result:

- `10/10` reuse
- `0` new canonical families
- `0` redundant provider-closure cards
- `0` cross-canonical provider URL collisions

Five identities received bounded upstream research because a base-file-only spot check initially missed overlay-loaded cards: Infinity Cave, Multi Mine, Thin Air, Horse Combat Controls, and Grappling Hook Mod. The runtime loader and semantic/provider checks proved all five existing canonical IDs are correct. Their 17 researched upstream destinations remain research evidence only; production provider counts are intentionally unchanged.

For Grappling Hook Mod, the creator supplied Yyon's original Forge lineage plus the Restitched Fabric/Quilt port under one creator recommendation. The vault preserves one creator recommendation / one canonical family rather than inflating the source count.

## Runtime after Chunk 32

- Global: `995 mentions -> 672 canonical projects`
- `670 linked / 1241 provider destinations / 441 multi-provider / 2 unresolved`
- Unresolved exactly **Better Book Recipe** and **Plank and Junk**
- AsianHalfSquat: `52/350` recommendation-bearing videos
- AsianHalfSquat: `736/736` linked mentions
- AsianHalfSquat: `462` canonical project identities
- Effective AHS contribution after reconciliation: `15` surviving legacy-only videos / `205` mentions + history batches 11-32 with `37` native videos / `531` mentions

## Verification

GitHub Actions run `34006747853` completed successfully on `b30144aacae50d3cfe04a86de02f18eeb370f4e1`.

PASS:

- Chunk 32 native-over-legacy reconciliation diagnostic
- recursive exact Chunk 31 rollback acceptance with Chunk 32 hidden
- missing timestamp regression QA
- permanent focused Creator Vault recursive QA
- catalog regression QA
- portable catalog rendering

## Exact next action - Chunk 33

Continue strictly older than `2024-02-23` and exclude all 52 accepted recommendation-bearing AsianHalfSquat video IDs. Resolve the next actual ordinary upload from source chronology before creating any recommendation record. Freeze only creator-authored project semantics research-first; if the next source is already present in the reconciled legacy catalog, compare the legacy record against the first-party source before assuming the global or AHS mention count should increase. Canonicalize against this sealed `995 / 672` runtime, use provider research only for genuine runtime gaps, then run the same collision/reconciliation, recursive QA, timestamp, catalog, and portable gates before the next GitHub + Drive seal.
