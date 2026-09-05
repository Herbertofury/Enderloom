# Enderloom Creator Vault Wiki

Status: active development  
Chunk: legacy creator native import, chunk 4  
Strategy: full-history-first, incremental-after  
Data contract: evidence-first; never fabricate provider URLs, chapters, timestamps, or creator recommendations.

## What Creator Vault is

Creator Vault is Enderloom's creator-recommendation layer. It tracks Minecraft creators across YouTube and TikTok, records the exact source videos/posts and evidence available for each recommendation, and exposes the catalog directly inside Enderloom's existing UI. The addon remains additive and fail-soft through `src/catalog-renderer.js`; launcher internals and active mod JAR locations are not changed by this work.

## Chunk 4 checkpoint

Repository: `Herbertofury/Enderloom`  
Branch: `feature/creator-vault-kreksu-chunk-4`

Current native totals:

- 14 creators retained in the canonical ledger
- 2 creators with native recommendation data: Kreksu + AsianHalfSquat
- 19 source videos
- 246 recommendation mentions
- 31 verified direct project homes
- 1 pinned legacy catalog import
- 5 recurring Kreksu setup/resource packs

### AsianHalfSquat native import

A newer reconciled Minecraft Mod Vault snapshot superseded the older 11-video / 93-recommendation checkpoint. Creator Vault now imports the newer snapshot natively:

- 16 exact source videos
- 216 evidence-backed recommendation mentions
- 349-video verified channel-history target retained
- 1 independently verified creator-owned project home
- 215 recommendation mentions deliberately remain without a provider URL rather than receiving guessed links
- canonical Drive source file ID: `1tHH5-Ucfo9RaeH3hfnwtUa0431h6EOsh`
- original Drive snapshot SHA-256: `6e49a5154e1a757df75c4ab7371f91632250b551f9e1e3b00781db035b43a9e1`
- full compact snapshot SHA-256: `4e45e92fed3171175fcf50b37d9dcfd91b88217582fe9a924f405397eea649e8`

The repo snapshot is stored as six deterministic JSON shards under one logical import. This makes changes reviewable without changing the logical provenance contract. Each shard has its own pinned SHA-256 and expected video/recommendation counts in `catalog/creator-vault/imports.json`.

The one verified AsianHalfSquat project is:

- `Satisfaction Guaranteed`
- project type: modpack
- provider: CurseForge
- project ID: `1490741`
- exact home: `https://www.curseforge.com/minecraft/modpacks/satisfaction-guaranteed`
- evidence: creator-controlled video description points viewers to the modpack and the provider record identifies AsianHalfSquat as owner

The importer normalizes the legacy lowercase `curseforge` provider label to canonical `CurseForge` without manufacturing any missing provider identity.

### Kreksu remains intact

Chunk 3's Kreksu provider closure remains unchanged:

- 3 source-verified videos
- 30 source-backed recommendations
- 30/30 independently verified Modrinth/CurseForge project homes
- 5 recurring setup/resource packs tracked separately
- one discovered animation-mod video remains queued because its full original chapter list still has not passed the source-verification gate

A materially different recovery pass was attempted for the queued animation video in chunk 4. It still did not yield the original full chapter list, so Creator Vault did not ingest partial mirror summaries or guess chapter names.

## Native import architecture

Chunk 4 adds a scalable offline import layer:

- `catalog/creator-vault/imports.json` is the logical import registry.
- `catalog/creator-vault/sources/*.json` holds deterministic offline source shards.
- `src/creator-vault.js` loads native recommendations plus registered imports, merges them through collision-safe platform-prefixed video IDs, and fails soft with diagnostics.
- import paths are constrained to the Creator Vault directory so a malformed registry entry cannot traverse outside the catalog root.
- imported videos receive visible `legacy-catalog` provenance.
- provider labels are normalized only from an explicit provider value or a real verified provider URL.
- missing provider homes remain empty and continue to use the UI's `Find in Enderloom` fallback.
- stats now expose indexed creators, verified homes, and imported-catalog count.

The import mechanism supports a single file or a deterministic shard list, preserving compatibility with future legacy creator bundles.

## Creator Vault user experience

The native Creator Vault panel continues to provide creator cards and pinning, platform/creator filters, recommendation search, source/evidence badges, video-grouped cards, exact timestamp links when source timestamps exist, provider/project-type badges, direct verified provider actions, `Find in Enderloom` fallback, per-video verified-home counts, verified-home KPI, copy-all names, and separately tracked recurring setup packs.

AsianHalfSquat's imported videos and recommendations flow through the same native UI automatically; no separate legacy browser is required.

## Creator coverage ledger

| Creator | Platform | Role | Current state | Goal / next evidence gate |
| --- | --- | --- | --- | --- |
| AsianHalfSquat (`@AsianHalfSquat`) | YouTube | protected core | **Native import active: 16 exact videos / 216 recommendation mentions / 1 verified home; target 349 videos** | Continue the same reconciled lineage toward full history; verify provider homes individually instead of guessing |
| EnderVerse (`@EnderVerseMC`) | YouTube | protected core | Protected legacy creator; exact native bundle not yet recovered | Recover the actual legacy records from the old source archives and import through the same pinned mechanism |
| Kreksu (`@KreksuMinecraft`) | YouTube | curated core | **3 verified videos / 30 recommendations / 30 verified homes** | Continue bounded source-verifiable history; queued animation video requires original full chapters |
| Kizamiringo (`@kizamiringo`) | TikTok | protected core | Legacy pipeline; live gate pending | Full-history enumeration + real text-only extraction parity |
| Katsumi (`@its_katsumi`) | TikTok | curated core | Legacy ready; link refresh pending | Refresh public link-hub child destinations, then ingest posts |
| SpeedyChunks (`@speedychunks`) | TikTok | curated core | Queued from legacy source ledger | Import legacy evidence, then full-history scan |
| NoxusMinecraft (`@noxusminecraft`) | TikTok | required | Queued from legacy source ledger | Import legacy evidence, then full-history scan |
| UnyxYT (`@unyxyt`) | TikTok | required | Queued from legacy source ledger | Import legacy evidence, then full-history scan |
| CurseForge (`@curseforge`) | TikTok | curated core | Queued from legacy source ledger | Import legacy evidence while keeping creator identity distinct from provider identity |
| HendyVideos (`@hendyvideos`) | TikTok | curated core | Queued from legacy source ledger | Import legacy evidence, then full-history scan |
| Knarfy (`@itsknarfy`) | TikTok | recommended discovery source | Tracked | Promote only evidence-backed Minecraft recommendations |
| The Breakdown (`@thebreakdownxyz`) | TikTok | recommended discovery source | Tracked | Promote only evidence-backed Minecraft recommendations |
| The Crimson Gaming (`@thecrimsongaming`) | TikTok | recommended discovery source | Tracked | Promote only evidence-backed Minecraft recommendations |
| laveOrc (`@ygz207`) | TikTok | recommended discovery source | Tracked | Promote only evidence-backed Minecraft recommendations |

## Kreksu indexed videos

### 2026-04-05 - These Underrated Minecraft Mods are Actually Insane!

Source: `https://www.youtube.com/watch?v=Hg1_20vRrZM`

Apocalyptic Bosses; Chris's Additions; Envelope; Cascades; Curiosities!; Starcatcher; [BUB] Gender; Simply Bows; Shutter Up!; ShellBound for AirShip. All ten have exact verified project homes. Cascades remains truthfully typed as a data pack while creator-stated loader evidence is preserved separately.

### 2026-04-09 - HIDDEN GEM Minecraft Mods That Are Actually INSANE!

Source: `https://www.youtube.com/watch?v=iTsP0Xsdcv8`

Legionary; Draconic Spells; Threateningly Mobs; Wings Of Fire!; ByteBuddies; Better Fishtanks; Feastful; ReCased; Bountiful Fares; Even Better Nether. All ten have exact verified project homes.

### 2026-05-07 - These New Underrated Minecraft Mods are Actually Insane!

Source: `https://www.youtube.com/watch?v=fgu7ssEVzAA`

Craftics - Grid Based Tactical RPG; Gateway to Doom; Boundless & Endless; Iden's Decor; Nimbu's: Pocket Dimensions; Better Horse/Mount Steering; Keybind Atlas; Lazy Tools; Happy Ghast Inventory; Jaki Versatile Structures: Sails & Sea. All ten have exact verified project homes. Better Horse/Mount Steering keeps Kreksu's chapter wording while resolving through the creator-listed Better Mount Steering alias.

## AsianHalfSquat imported videos

The reconciled offline snapshot contributes these 16 exact source records, including two currently known videos whose public snapshot contained no resolved recommendation identity:

1. `_h-2powUiRs` — An Amazing Minecraft Mod That Makes Grass Look Like This — 2026-07-15 — 0 resolved recommendations
2. `Y8HmNvkfbTo` — Top 10 Minecraft Mods (26.1.2) - June 2026 — 2026-06-25 — 0 resolved recommendations
3. `QWfiGE0lTLk` — One of The Most Unique Minecraft Shaders I’ve Seen — 2026-05-21 — 11
4. `0AqzzgZZUfo` — Top 10 Minecraft Mods (26.1.2) - 2026 — 2026-05-02 — 15
5. `irE4tcDtUIg` — The Most Realistic Minecraft Terrain Generator I’ve Ever Seen — 2026-04-20 — 18
6. `ayvwcfV34OA` — The Most Impressive Minecraft Physics Mods — 2026-04-10 — 18
7. `F8KhlI-W7WM` — Making Minecraft As Satisfying As Possible With Mods 3.0 — 2026-04-01 — 1
8. `yypjdKNxRk4` — Top 10 Minecraft Mods (1.21.11) - 2026 — 2026-03-24 — 12
9. `1MLnVFc9CDg` — Awesome New Minecraft Mods You Should Try Today — 2026-03-17 — 12
10. `6OcWD3Xn8Jo` — Minecraft Mod Combinations That Work Perfectly Together #9 — 2026-03-12 — 28
11. `BIw9cJRraNs` — Hardware Accelerated Ray Tracing in Minecraft With the RTX 5090 — 2026-03-03 — 13
12. `rjb_PMTAHwA` — Minecraft Mods You Have Probably Never Heard Of - 2026 — 2026-02-07 — 11
13. `4su6oCiJpCY` — 10 Unique Minecraft Resource Packs You Have Probably Never Heard Of — 2025-10-07 — 15
14. `Z50_ryPNNAc` — Top 10 Minecraft Mods — 2024-02-23 — 11
15. `KqS27JcbrCQ` — Making Minecraft As Satisfying As Possible With Mods 2.0 — 2023-05-06 — 20
16. `WFtQadz_bgM` — Making Minecraft As Satisfying As Possible With Mods — 2022-10-21 — 31

These sum to 216 recommendation mentions. The snapshot contains 155 mod mentions, 34 shader mentions, 23 resource-pack mentions, 3 data-pack mentions, and 1 modpack mention.

## Evidence and provider rules

Creator evidence and provider identity remain separate gates:

1. Recommendation identity must come from creator/source evidence already captured in the source lineage.
2. A direct Modrinth/CurseForge/project URL is attached only after that provider identity is independently known.
3. Legacy imports preserve their source kinds and add `legacy-catalog`; they do not upgrade a recommendation's provider confidence merely because the project name looks familiar.
4. Missing provider URLs stay missing.
5. The UI can search and hand unresolved names back to Enderloom without manufacturing an external project home.

## Files added/changed in chunk 4

- `catalog/creator-vault/imports.json`
- `catalog/creator-vault/sources/asianhalfsquat.creator-catalog.part-01.json`
- `catalog/creator-vault/sources/asianhalfsquat.creator-catalog.part-02.json`
- `catalog/creator-vault/sources/asianhalfsquat.creator-catalog.part-03.json`
- `catalog/creator-vault/sources/asianhalfsquat.creator-catalog.part-04.json`
- `catalog/creator-vault/sources/asianhalfsquat.creator-catalog.part-05.json`
- `catalog/creator-vault/sources/asianhalfsquat.creator-catalog.part-06.json`
- `src/creator-vault.js`
- `catalog/creator-vault/creators.json`
- `scripts/creator-vault-qa.js`
- this wiki

Existing Kreksu recommendation data and Creator Vault UI/CSS remain unchanged in chunk 4.

## Acceptance gate through chunk 4

Focused QA now requires:

- exactly 14 creator identities, all unique;
- 2 indexed creators;
- 19 videos and 246 recommendation mentions total;
- 31 verified project homes total;
- 1 imported legacy catalog;
- all chunk-3 Kreksu 30/30 URL/provenance/timestamp contracts remain intact;
- AsianHalfSquat coverage pins target 349 / imported 16 / recommendations 216 / Drive source identity;
- all six AsianHalfSquat shards match their exact SHA-256 values and expected video/recommendation counts;
- all 16 imported video IDs are platform-namespaced and include `legacy-catalog` provenance;
- all 216 imported recommendation mentions retain name/evidence and `catalog` provenance;
- exactly 1 AsianHalfSquat recommendation has a provider URL and exactly 215 do not;
- Satisfaction Guaranteed remains a CurseForge modpack with project ID 1490741 and its exact provider home;
- renderer embeds both creator identities, imported AsianHalfSquat recommendations, the verified modpack home, existing Kreksu homes, and the unresolved `Find in Enderloom` path.

Observed locally in this chunk:

- PASS — `src/creator-vault.js` syntax gate.
- PASS — focused Creator Vault QA: **14 creators / 2 indexed creators / 19 videos / 246 recommendations / 31 verified homes / 1 imported catalog / 5 setup packs**.
- PASS — fresh portable Creator Vault preview built from the updated harness: `creator-vault-chunk4-preview.html`, 124,833 bytes.
- No browser visual-runtime pass is claimed in this chunk.
- Full repository checkout/CI is still not claimed here because this runtime cannot resolve `github.com`, and API-authored workflow commits do not recursively trigger Actions. The committed workflow remains the broader gate for the next normal checkout/push/manual dispatch.

## Exact next action

1. Recover EnderVerse's actual legacy creator records from the existing old Minecraft Mod Vault source archives and import them through the same pinned offline mechanism; do not synthesize a replacement catalog.
2. Then continue AsianHalfSquat toward the 349-video target and/or resume a new bounded Kreksu source-verifiable history batch without reopening the failed animation-chapter search family unless new source evidence appears.
3. Continue the protected TikTok ledger after the YouTube legacy import boundary, preserving existing live gates.
4. On the next normal project checkout/push, run the committed Creator Vault workflow and record the run/job identity.

No active mod JAR moves are part of Creator Vault work.
