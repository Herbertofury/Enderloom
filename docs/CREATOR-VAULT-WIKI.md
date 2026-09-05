# Enderloom Creator Vault Wiki

Status: active development  
Chunk: Kreksu ingestion / provider closure, chunk 3  
Strategy: full-history-first, incremental-after  
Data contract: evidence-first; never invent a CurseForge/Modrinth/provider URL.

## What Creator Vault is

Creator Vault is Enderloom's creator-recommendation layer. It tracks Minecraft creators across YouTube and TikTok, records the exact videos/posts where they recommend projects, keeps timestamps and evidence attached, and exposes those recommendations directly inside Enderloom's catalog UI.

The addon remains additive and fail-soft through `src/catalog-renderer.js`; launcher internals and active mod JAR locations are not changed by this work.

## Current Kreksu checkpoint

Repository: `Herbertofury/Enderloom`  
Branch: `feature/creator-vault-kreksu-chunk-3`

- 3 source-verified Kreksu videos
- 30 source-backed main recommendations
- **30/30 independently verified direct provider homes**
- 5 recurring setup/resource packs tracked separately
- 1 discovered animation-mod video still queued until its full chapter list is source-verifiable

Every currently indexed recommendation now opens its exact Modrinth or CurseForge project home. The fallback `Find in Enderloom` behavior remains in the UI for future records that do not yet have a verified provider home.

## Creator Vault user experience

The native Creator Vault panel provides:

- creator cards with platform, role, coverage state, and pinned favorites;
- YouTube/TikTok and per-creator filtering;
- recommendation search across creator, mod, loader, provider, project type, title, and evidence;
- video-grouped recommendation cards;
- exact timestamp links to the creator's recommendation moment;
- direct provider-specific actions only when the project home is independently verified;
- `Find in Enderloom` fallback for unresolved future records;
- visible Modrinth / CurseForge provider badges and Mod / Data Pack project-type badges;
- verified-project-home KPI and per-video verified-home counts;
- one-click copy of every mod name from a video;
- recurring creator setup/resource packs separated from the main recommendation list;
- source/evidence badges so creator discovery never becomes anonymous catalog data.

## Creator coverage ledger

| Creator | Platform | Role | Current state | Goal / next evidence gate |
| --- | --- | --- | --- | --- |
| AsianHalfSquat (`@AsianHalfSquat`) | YouTube | protected core | Legacy catalog ready; previous checkpoint has 11 exact videos / 93 evidence-backed recommendations; expected channel history recorded as 349 videos | Import the legacy Creator Vault bundle into native Enderloom, then resume history coverage |
| EnderVerse (`@EnderVerseMC`) | YouTube | protected core | Legacy catalog ready | Import legacy creator bundle and retain provider/showcase cross-links |
| Kreksu (`@KreksuMinecraft`) | YouTube | curated core | **Active ingestion: 3 verified videos / 30 recommendations / 30 verified project homes through chunk 3** | Continue channel history in bounded source-verifiable batches; ingest queued animation video only after full chapters are recovered |
| Kizamiringo (`@kizamiringo`) | TikTok | protected core | Legacy pipeline; live gate pending | Full-history enumeration + real text-only extraction parity |
| Katsumi (`@its_katsumi`) | TikTok | curated core | Legacy ready; link refresh pending | Refresh public link-hub child destinations, then ingest posts |
| SpeedyChunks (`@speedychunks`) | TikTok | curated core | Queued from legacy source ledger | Import legacy evidence, then full-history scan |
| NoxusMinecraft (`@noxusminecraft`) | TikTok | required | Queued from legacy source ledger | Import legacy evidence, then full-history scan |
| UnyxYT (`@unyxyt`) | TikTok | required | Queued from legacy source ledger | Import legacy evidence, then full-history scan |
| CurseForge (`@curseforge`) | TikTok | curated core | Queued from legacy source ledger | Import legacy evidence and keep creator identity distinct from provider identity |
| HendyVideos (`@hendyvideos`) | TikTok | curated core | Queued from legacy source ledger | Import legacy evidence, then full-history scan |
| Knarfy (`@itsknarfy`) | TikTok | recommended discovery source | Tracked | Promote only evidence-backed Minecraft recommendations |
| The Breakdown (`@thebreakdownxyz`) | TikTok | recommended discovery source | Tracked | Promote only evidence-backed Minecraft recommendations |
| The Crimson Gaming (`@thecrimsongaming`) | TikTok | recommended discovery source | Tracked | Promote only evidence-backed Minecraft recommendations |
| laveOrc (`@ygz207`) | TikTok | recommended discovery source | Tracked | Promote only evidence-backed Minecraft recommendations |

## Kreksu indexed videos

### 2026-04-05 - These Underrated Minecraft Mods are Actually Insane!

Source: https://www.youtube.com/watch?v=Hg1_20vRrZM

| Time | Recommendation | Loader | Verified project home |
| --- | --- | --- | --- |
| 00:08 | Apocalyptic Bosses | Forge / NeoForge | https://www.curseforge.com/minecraft/mc-mods/apocalypticbosses |
| 00:56 | Chris's Additions | Fabric | https://modrinth.com/mod/chris_s_additions |
| 01:48 | Envelope | Fabric / NeoForge | https://modrinth.com/mod/envelope |
| 02:55 | Cascades | Fabric / Forge / NeoForge | https://modrinth.com/datapack/hybrid-beta |
| 03:42 | Curiosities! | NeoForge | https://modrinth.com/mod/curiosities-syndicate |
| 04:16 | Starcatcher | Forge / NeoForge | https://modrinth.com/mod/starcatcher |
| 04:55 | [BUB] Gender | Forge | https://modrinth.com/mod/genderbub |
| 05:24 | Simply Bows | Fabric / NeoForge | https://modrinth.com/mod/simply-bows |
| 06:06 | Shutter Up! | Fabric / Forge / NeoForge | https://modrinth.com/mod/shutter-up |
| 06:23 | ShellBound for AirShip | Fabric / Forge / NeoForge | https://modrinth.com/mod/shellbound-for-airship |

Cascades intentionally remains `projectType=datapack`: its canonical Modrinth project is the Cascades world-generation data pack/mod project while Kreksu's creator-stated loader list remains preserved separately.

### 2026-04-09 - HIDDEN GEM Minecraft Mods That Are Actually INSANE!

Source: https://www.youtube.com/watch?v=iTsP0Xsdcv8

| Time | Recommendation | Loader | Verified project home |
| --- | --- | --- | --- |
| 00:07 | Legionary | Forge | https://www.curseforge.com/minecraft/mc-mods/legionary |
| 01:09 | Draconic Spells | Forge | https://www.curseforge.com/minecraft/mc-mods/draconicspells |
| 01:59 | Threateningly Mobs | Forge | https://www.curseforge.com/minecraft/mc-mods/threateningly-mobs |
| 02:58 | Wings Of Fire! | Forge / NeoForge | https://www.curseforge.com/minecraft/mc-mods/the-wings-of-fire |
| 03:43 | ByteBuddies | Forge / NeoForge | https://www.curseforge.com/minecraft/mc-mods/bytebuddies |
| 04:48 | Better Fishtanks | Forge / NeoForge | https://www.curseforge.com/minecraft/mc-mods/better-fishtanks |
| 05:51 | Feastful | Forge | https://www.curseforge.com/minecraft/mc-mods/feastful |
| 06:37 | ReCased | Forge | https://www.curseforge.com/minecraft/mc-mods/recased |
| 07:36 | Bountiful Fares | Fabric / NeoForge | https://modrinth.com/mod/bountiful-fares |
| 08:27 | Even Better Nether | Forge / NeoForge | https://www.curseforge.com/minecraft/mc-mods/even-better-nether |

### 2026-05-07 - These New Underrated Minecraft Mods are Actually Insane!

Source: https://www.youtube.com/watch?v=fgu7ssEVzAA

| Time | Recommendation | Loader | Verified project home |
| --- | --- | --- | --- |
| 00:06 | Craftics - Grid Based Tactical RPG | Fabric | https://www.curseforge.com/minecraft/mc-mods/craftics |
| 02:08 | Gateway to Doom | Fabric / NeoForge | https://modrinth.com/mod/gateway-to-doom |
| 02:54 | Boundless & Endless | Forge | https://www.curseforge.com/minecraft/mc-mods/boundless-endless |
| 03:44 | Iden's Decor | NeoForge | https://modrinth.com/mod/idens-decor |
| 04:30 | Nimbu's: Pocket Dimensions | Fabric | https://modrinth.com/mod/nimbus-pocket-dimensions |
| 05:32 | Better Horse/Mount Steering | Forge | https://www.curseforge.com/minecraft/mc-mods/better-mount-steering |
| 06:10 | Keybind Atlas | Forge / NeoForge | https://modrinth.com/mod/keybind-atlas |
| 06:50 | Lazy Tools | NeoForge | https://www.curseforge.com/minecraft/mc-mods/lazy-tools |
| 08:10 | Happy Ghast Inventory | Fabric / Forge / NeoForge | https://www.curseforge.com/minecraft/mc-mods/happy-ghast-inventory |
| 08:42 | Jaki Versatile Structures: Sails & Sea | Fabric / Forge | https://www.curseforge.com/minecraft/mc-mods/jaki-versatile-structures-sails-sea |

`Better Horse/Mount Steering` keeps Kreksu's chapter wording while the exact provider identity is verified through the creator-listed `Better Mount Steering` alias.

## Evidence and provider rule

Creator recommendation evidence and provider identity are two separate gates:

1. A recommendation enters the source dataset only from source-verifiable creator evidence such as the original YouTube description/chapter list.
2. A direct project URL is attached only after the matching Modrinth/CurseForge project identity is independently verified.
3. Provider provenance is stored as `provider-project` on every verified record.
4. The UI may infer/open provider-specific actions, but it does not manufacture project URLs.

All 30 currently indexed Kreksu recommendation records satisfy both gates.

## Recurring setup/resource packs

Kreksu lists these as extra animation texture packs used in every indexed video, so Creator Vault stores them separately from each video's main recommendations:

- Detailed Animations
- Fresh Animations
- Fresh Animations: Player Extension
- Joyful Motion
- Silly Moves

All five reference all three indexed Kreksu source videos.

## Queued discovery

`TOP +10 Best Animation Mods in Minecraft! [+1.20.1, +1.21.1 | Forge / Fabric / NeoForge]` remains discovered but un-ingested because its complete chapter list has not yet been recovered from a reliable source. No chapter names are guessed from partial mirrors or summaries.

## Data and implementation files

- `catalog/creator-vault/creators.json` - canonical creator identity and coverage ledger
- `catalog/creator-vault/recommendations.json` - creator videos, timestamps, provider homes, evidence provenance, and recurring setup packs
- `src/creator-vault.js` - fail-soft loader and normalization
- `catalog/creator-vault/creator-vault.js` - native Enderloom UI addon
- `catalog/creator-vault/creator-vault.css` - responsive Creator Vault presentation including provider/project-type visual states
- `scripts/creator-vault-qa.js` - focused acceptance/provenance/provider truth-table gate
- `.github/workflows/creator-vault-qa.yml` - branch QA runner for checkout + Creator Vault + catalog regression + portable render

## Acceptance gate through chunk 3

`npm run creator-vault-qa` now requires:

- all 14 creator identities are present and unique;
- Kreksu remains registered under `youtube:kreksuminecraft`;
- exactly 3 indexed Kreksu videos and 30 main recommendations are loaded;
- every video retains direct YouTube-description/chapter provenance;
- all timestamps are numeric, strictly ordered, and deep-link to the exact video moment;
- all 30 recommendation records carry `provider-project` provenance;
- all 30 exact provider URLs match the explicit truth table in QA;
- provider identity is either Modrinth or CurseForge for all 30;
- Cascades remains typed as `datapack`;
- provider URLs for all three source videos are embedded by the real catalog renderer;
- UI/CSS embedding and the future unresolved-provider `Find in Enderloom` path remain intact.

## Verification state

Observed in the current chunk:

- PASS - `creator-vault.js` syntax gate with Node.
- PASS - updated recommendations data gate: **3 videos / 30 recommendations / 30 verified homes** and provider provenance on every record.
- PASS - focused Creator Vault QA in the local Enderloom harness: **14 creators / 3 videos / 30 recommendations / 30 verified provider homes / 5 setup packs**.
- PASS - fresh portable Creator Vault preview rendered from the updated harness (`creator-vault-chunk3-preview.html`, 48,469 bytes).
- The broader repository checkout/CI gate is still not claimed in this chat because the current container cannot resolve `github.com`, and API-authored GitHub workflow commits do not recursively trigger Actions. The committed workflow remains the durable broad gate for the next normal checkout/push/manual dispatch.

## Exact next chunk

1. Continue Kreksu's channel-wide history scan in another bounded batch using original YouTube descriptions/chapters when source-verifiable.
2. Recover the queued animation video's complete chapter list before ingesting it.
3. Import the existing AsianHalfSquat and EnderVerse legacy Creator Vault records into the same native schema without rescanning already-known creator identity/state.
4. Then progress through the protected TikTok creator ledger while preserving the full-history-first / incremental-after contract and existing live acceptance gates.
5. On the next normal project checkout/push, run the committed Creator Vault workflow and record its run/job identity.

No active mod JAR moves are part of Creator Vault work.
