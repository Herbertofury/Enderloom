# Premium trailer acceptance · DEC-016 / PD-010–021

Execution authority: [Astra master](ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md), Phase D. Implementation checkpoint: see the commit introducing this document and the subsequent acceptance checkpoint in Git history.

## Implementation and evidence

| Requirements | Canonical implementation | Verification |
|---|---|---|
| PD-010, PD-011 | `src/trailer-discovery.js`: exact provider identity, immutable Modrinth ID, project-linked embeds, project-linked author channels and accepted team profiles, provider video files, vetted dedicated reviews, bounded roundup chapters | `node scripts/trailer-discovery-qa.js`; live Create and The Aether discovery |
| PD-012, PD-013 | `catalog/trailers.js`, `ProjectTrailer.tsx`: shared Catalog card/detail and launcher-detail controller, stable dwell, one main-process playback owner | `node scripts/trailer-ui-qa.js`; production launcher Create detail |
| PD-014, PD-015 | Main-process ownership; iframe/video disposal, muted initial playback, explicit pause/resume, navigation/scroll/visibility/background cleanup | Real Electron YouTube video state: playing, muted, advancing time; pause/resume verified on actual video |
| PD-016, PD-017 | Global/context preferences, reduced motion, data saver/slow connection, keyboard focus, native/provider controls and available captions | Runtime preference, reduced-motion and data-saver gates; manual play stays available |
| PD-018, PD-019 | Two discovery jobs, 24 bounded metadata requests/job, abort propagation, single-flight, positive/negative cache, provider streaming only, existing persistent Electron sessions | Cancellation releases network request/slot; cached calls issue zero requests; no card-gallery video preloads |
| PD-020 | Real provider screenshots remain below disposable player; no replacement/generated media | Missing/rejected/restricted source fallback and persisted gallery-only correction |
| PD-021 | Shared production IPC/preload/renderer exercised by Electron harness | Hover loss, transient hover, pause/resume, scroll, motion/data preferences, renderer card replacement, restricted embed, detail close, wrong-mod correction |

## Real source results

- Create: Modrinth project `LNytGWDc`, project page links **This is Create. (2022)**, YouTube `rR8W-f9YhYA`, Simi Cats. Project-bound tier 1.
- The Aether: Modrinth project `YhmgMVyu`, project page links `@DevAether`; resolved channel `UCzynznDiVtxzx-gTM8y02ew` supplies **The Aether - Release Trailer**, video `jKu3fAZSaPw`. Verified-channel tier 2. Two other title/sibling candidates were rejected.
- The independent-review adapter currently vets AsianHalfSquat, channel `UC0E_vIe1e1lVeojYOgVg_5Q`, verified against its public channel. Popularity alone never establishes project identity. A dedicated video needs an exact project backlink; roundups additionally require an exact-title chapter and a known end boundary.

Local runtime evidence: `output/trailers/Create.json`, `The-Aether.json`, `runtime.json`, `catalog-live-trailer.png`, `why-this-trailer.png`, `launcher-live-trailer.png`. These are local acceptance artifacts, not shipped replacement media. Production Electron 44 / Chromium 152 actually played the Create trailer muted, with advancing video time, in both Catalog and the launcher detail hero.

## Honest boundaries

- Enderloom currently exposes Premium through the existing **preview** policy. `createTrailerService` accepts a trusted entitlement callback, and tests prove renderer preferences cannot grant autoplay when that callback denies it. Paid-account verification is not implemented or represented as a verified purchase.
- Public source restrictions, removed/private videos, missing embed permission, or unavailable exact identity result in an explicit failure/fallback. No CAPTCHA, account, cookie, or delivery-control bypass is attempted. Restricted-embed fallback is exercised with a controlled provider error, not a claim of testing a real restricted account.
- Source match confidence is a heuristic, labelled as such. User corrections remain separately labelled and can be reset. Provider terms govern embedded playback; no video file is cached or exported by discovery.
- A missing trustworthy video is a valid gallery-only result. Discovery is bounded and conservative, not a guarantee that every video on the internet has been searched.
- Live playback acceptance covers YouTube. Vimeo and direct-file adapters have implementation coverage; their live-provider acceptance remains separately tracked until exercised. Do not infer verified live playback for those providers from the YouTube test.

## Primary API references checked

- https://developers.google.com/youtube/player_parameters
- https://developers.google.com/youtube/iframe_api_reference
- https://developers.google.com/youtube/terms/required-minimum-functionality
- https://github.com/vimeo/player.js
- https://docs.modrinth.com/api/operations/getproject/

YouTube gets the actual installed app identifier `com.herbertofury.enderloom` as its desktop Referer. Players retain provider controls/branding, exceed the 200×200 minimum, and require more than half their surface to be visible before autoplay. App controls are outside the player bounds.

## September 8 performance and CurseForge acceptance

- Native CurseForge provider operations now supply the exact authenticated project description and immutable project ID to discovery. Returned slug, ID and website must agree; sibling results are rejected. Credentials remain in the native vault.
- Measured uncached metadata discovery: Create/Modrinth 224 ms (2 requests), The Aether/verified author 2444 ms (7 requests), Create/CurseForge 364 ms (1 media request plus cached native provider operations). Warm cache: 0.06–0.08 ms, zero network requests. These are discovery timings, not promises about provider video startup.
- Autoplay begins after 350 ms stable Catalog dwell / 450 ms detail dwell. At most two visible projects warm metadata; player bytes remain deferred. Backgrounding/removal cancels pending warmups as well as active playback.
- `node scripts/trailer-discovery-qa.js`: 25 passing checks. `node scripts/trailer-ui-qa.js`: actual Electron YouTube playback, muted, advancing to 6.835 seconds; lifecycle/control/correction checks passed. Production CurseForge Create hero advanced to 3.786 seconds, muted and playing.
- `node scripts/curseforge-live-qa.js`: 20 search hits with icons, exact Create identity/description, 11 compatible 1.21.1 NeoForge releases, 52 categories. Create has no provider gallery entries; no screenshots are invented.
- `node scripts/curseforge-install-live-qa.js`: real Create 6.0.10 / file 7963363 downloaded and installed through native operations in an isolated instance. 19,123,767 bytes; SHA-1 `0e97e49837bed766e6f28a4c95b04885d6acc353` matches provider metadata; SHA-256 `ef87fe5709f1ba1f5b8bb20a2925b5afb4669e178fd6d8bf10c167759eefe37a`. This verifies installation, not Minecraft runtime behavior.
- Production Discover loads CurseForge without a key prompt. The user-authorized installed-app credential was validated with the official API and imported directly into the OS-backed credential store, without printing it or storing it in source. Other deployments can provide `ENDERLOOM_CURSEFORGE_API_KEY` at runtime or the existing packaged credential.
- `npm run build:launcher` and native service/CLI compilation passed. Raw additional proof: `output/curseforge/live-api.json`, `install-live.json`, `ui.json`, `discover-live.png`, `detail-trailer-live.png`, `output/trailers/timing.json`.
