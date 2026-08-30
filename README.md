# Enderloom 2.9.5

Enderloom combines the protected **Minecraft Catalog Companion** research browser with a real Rust-backed Minecraft launcher and mod manager in one Electron/Chromium application. Catalog, Source, Browser, Full and Split research flows remain first-class; the top-level Mod Manager adds real instances, accounts, Java/loaders, downloads, content, worlds, servers, backups, repair, logs and diagnostics without opening a second app.

## Run Enderloom now

On this Windows workspace, double-click `START_ENDERLOOM.cmd`. It uses the already-built launcher and native service, starts the integrated application, and only builds a missing prerequisite when necessary. From a terminal, use `npm start`.

The launcher discovers CurseForge and Modrinth profiles in place. Connecting a profile does not copy it; changes from the external launcher are reconciled safely, junction-backed duplicates are identified by physical path, and Clone remains an explicit operation. See `docs/LAUNCHER_PARITY_MATRIX.md` and `docs/RELEASE_EVIDENCE_2026-08-30.md` for the code-audited release contract and acceptance evidence.

## Built-in test catalogs

- **Minecraft Mob Variety** - 293 entries and 19 collections. All 293 projects are live-media capable through their exact off-site project homes.
- **Minecraft Mob Girl & Female Mob Vault** - 312 ranked entries plus the current master Sheet and its Doc/PDF reference layers. All 312 entries are live-media capable through exact off-site project/creator homes; it intentionally has no fabricated score field.

Use the toolbar catalog picker to switch immediately. Favorites, notes, filters, source health, and refresh targets are catalog-scoped.






## 2.9.5 CurseForge gallery terminal-state repair

- Fixes the persistent Bok's Banging Butterflies failure exposed by the native Windows 2.9.4 test instead of treating the earlier fixture as proof.
- Mirrors CurseForge's current live tab order: `Description -> Comments -> Files -> Gallery (N) -> Relations -> Issues`. On an exact `/gallery` route those labels are navigation, not content boundaries, so they can no longer cut the owned gallery region before its attachment cards.
- Adds a complete exact-gallery SSR lane through the same persistent Chromium session used by the catalog. The app no longer depends on hidden DOM hydration as the only way to recover all gallery items.
- Adds an independent Node full-HTML exact-gallery fallback and keeps the existing Chromium DOM rescue, giving visible CurseForge cards three independent role-safe recovery paths.
- Fixes the renderer cache short-circuit that treated a cached project icon + creator avatar as a complete media result. A missing gallery now still primes live discovery unless an explicit terminal `galleryAbsent` exists.
- Bumps live-media cache to v14 so 2.9.4 icon/author-only results cannot pin upgraded cards in the blank state.
- Native Electron self-test now reproduces the live Description/Files-before-Gallery and Relations-before-images topology and requires all eleven Bok-shaped attachments through both DOM and full-HTML Chromium paths with zero promo leakage.
- No hard-coded Bok media is used by production code; the exact eleven URLs exist only in regression/self-test fixtures.

## 2.9.4 exact CurseForge gallery DOM rescue

- Fixes the remaining real Windows failure where CurseForge's project Gallery tab could be present and contain media while bounded HTTP/stream probes still returned no gallery.
- Adds an exact same-project `/gallery` Chromium rescue for visible and near-visible CurseForge cards using the app's persistent live browser session. The rescue waits only for authoritative ForgeCDN/CurseCDN attachment anchors to stabilize; it does not wait for remote image decoding.
- Accepts direct attachment anchors on the exact gallery route even when the nested `<img>` is still a lazy placeholder and the anchor itself has no helpful CSS class.
- Allows the exact same-project CurseForge Gallery navigation link through the DOM media-page resolver even when CurseForge places that tab inside `<nav>`. Generic navigation remains excluded.
- Deep discovery synthesizes the exact same-project Gallery route as a fallback even if the canonical page's DOM does not expose a usable gallery link.
- Keeps promo/contest/ad/sponsor media outside the owned gallery boundary and preserves source-scoped empty-gallery fallback to canonical Description media.
- Bumps live-media cache to v13 so prior blank CurseForge results are rediscovered.
- Native Electron self-test now includes an 11-item lazy-placeholder CurseForge gallery fixture with a pre-H1 promotional attachment and requires all 11 project attachments with zero promo leakage.

## 2.9.3 CurseForge production gallery recovery + scoped fallback

- Recovers modern CurseForge gallery media when the authoritative full ForgeCDN/CurseCDN attachment is exposed by the wrapping link while the nested image is still a lazy placeholder.
- Starts extraction at the first project-owned Gallery marker after the exact H1 instead of the last repeated `/gallery` link.
- Treats an empty CurseForge `/gallery` as `sourceGalleryAbsent`, not a project-wide terminal negative, so canonical Description/post media still runs (the DivineRPG failure mode).
- Recovers image-bearing GitHub/GitLab links inside the exact project Description and canonicalizes blob links to their raw media targets after identity/ownership checks.
- Any real project-owned gallery result clears an older global or source-scoped negative instead of leaving the card stuck on stale "no gallery" state.
- The renderer now reports `Gallery tab empty — checking project post…` while that canonical fallback is in flight.
- Expands the progressive CurseForge first-media gate for direct attachment links without allowing global promotions, avatars, ads, or sponsor media to cross the project identity boundary.
- Bumps the live discovery cache to v12 so stale empty/negative gallery results cannot mask newly recoverable media.
- Includes a production-shaped 11-image Bok's Banging Butterflies regression fixture using the live attachment topology.

## 2.8.0 universal creator avatars + post-media adapters

- Extends creator-avatar ownership beyond CurseForge. Planet Minecraft now binds the exact `/member/<creator>/` link and its adjacent/member avatar on the project page when available, then independently enriches the exact creator profile in parallel when the avatar is not already exposed. The same creator request single-flights across cards and is keyed by creator identity rather than project title.
- Moves cross-site creator/profile knowledge into a 23-provider site-adapter registry covering CurseForge, Modrinth, GitHub, GitLab, Hangar, SpigotMC, Bukkit, BuiltByBit, Nexus Mods, ModDB, Polymart, Planet Minecraft, MCPEDL, ModBay, AFDIAN, Patreon, Minecraft Marketplace, BOOTH, Fourthwall, Ko-fi, itch.io, Gumroad and alltheysm. Provider pages only yield an author avatar when it is bound to a recognized creator/profile identity; project/gallery art cannot be re-used as the avatar.
- Adds exact Planet Minecraft author/card handling for the live layout where the project embed links the project image and the separate creator link points to a member profile. Commenter avatars, update-log content and `More ... by` sibling submissions are cut out of the project gallery region instead of being treated as project media.
- Adds first-class AFDIAN/post media extraction. `vm-pic` / `img-pre` post images are accepted as project-owned media, transformed/watermarked thumbnail URLs remain previews, and the original CDN URL is retained for full-resolution hover/lightbox. Direct `<video>` / `<source>` media and GIFs are preserved as typed gallery entries with poster art.
- Adds common post-media adapters for linked full-resolution images, `srcset`/lazy images, role-safe styled background images, Schema.org/JSON-LD `image`, `screenshot`, `VideoObject` and `associatedMedia`, plus structured `author`/`creator` avatars. This benefits storefronts, creator posts and non-Minecraft catalogs without weakening role isolation.
- The browser DOM fallback now recognizes creator-profile URL patterns across the wider provider universe, includes GIF/full-image anchors and semantic background media, and keeps creator discovery on a separate microtask/transport lane after the project/gallery candidate has already been delivered. Gallery/icon paint therefore never waits for a profile page.
- Live-media cache schema advances to **v10** so earlier role mappings are rediscovered with the provider-adapter model. No project, source, provider, gallery or result cap is introduced.

## 2.7.0 instant media ownership + role quarantine

- Fixes the remaining cross-role contamination path. Project icon, creator avatar and gallery media are now separate semantic lanes all the way through provider parsing, cache sanitization, main-process merging and renderer merging. The same URL cannot survive in multiple roles; ambiguous collisions are quarantined instead of being painted.
- Hardens CurseForge against global promotions, tier frames and “More from” siblings. A project image must be bound to the exact project H1/project entry, a creator avatar must be bound to the exact member/profile identity, and gallery media must come from the exact project gallery/description region. A definitive “This mod has no gallery items available” is delivered as a real negative state instead of an endless spinner.
- Adds the creator-project index fast lane: one exact CurseForge author Projects page can provide the exact creator avatar plus each exact project logo, and duplicate cards sharing that author single-flight the physical author-page request. ForgeCDN 256 px project-logo previews are used for first paint while the full original URL is retained for source/open behavior.
- Removes two artificial renderer startup floors. Live prime now begins on the next microtask rather than a 90 ms timer, and live network discovery starts in parallel with the all-catalog persistent-cache IPC batch instead of waiting for that entire batch to finish. Cache work is preserved and can still win the paint race.
- Raises the real media-prime execution frontier to up to 3x logical CPUs (bounded at 128 concurrent jobs) and prewarms eight Chromium media views. The native transport stress gate now runs 192 simultaneous real localhost HTTP streams and requires all 192 to be concurrently active at the server.
- Adds `instant-frontier-qa.js`, a real localhost streaming benchmark with the same 90 ms cache-hydration workload on both sides. The release requires the overlapped path to eliminate the barrier without dropping the cache work.
- Keeps all 23 provider families, full uncapped gallery enrichment, full-resolution originals, persistent Chromium session/cache, Rust wreq/Impit transports, uBlock Origin and the integrated auto-updating TWP translator. No project/source/gallery cap or generated replacement imagery is introduced.

## 2.6.0 identity-safe media + real parallel parsing + integrated TWP translator

- Fixes the obvious wrong-image failure shown on CurseForge cards: streamed `/gallery` discovery no longer trusts the first ForgeCDN-looking URL on a page. The fast path now requires the exact project H1, enters only the project-owned gallery region, rejects promotion/campaign/ad artwork, and preserves the actual project image/icon/gallery relationship. Live-media cache schema advances to **v8**, invalidating polluted 2.5 identities instead of repainting them.
- Adds a prewarmed **worker_threads provider-parser pool** for large full-page enrichment. The first-image prefix remains on the main hot path, while expensive full HTML parsing fans out over multiple CPU cores. The release benchmark uses 32 ~405 KiB provider fixtures and requires a material multi-core throughput win rather than a scheduler reorder.
- Adds **parallel Chromium image predecode** for visible/near-visible source images, raises same-session preview-byte warm depth, and expands the cold-start DOM hedge pool to six preconstructed `WebContentsView`s. This performs more useful decode/construction/network work concurrently; no records, providers, sources, projects, or gallery images are suppressed to create the speedup.
- Fully integrates the current **TWP - Translate Web Pages** architecture into protected Electron browser tabs: whole-page translation, selected-text translation, Original/Translated toggling, dynamic-page MutationObserver translation, per-site auto-translate, target-language selection, translation caching and in-flight request coalescing. Bing, Google, Yandex and DeepL service protocols are supported.
- Adds a uBlock-style **TWP upstream updater**. Every six hours it checks the official `FilipePS/Traduzir-paginas-web` GitHub release, downloads the tagged upstream source archive, verifies project identity/version/MPL-2.0 plus required translation-core files, stores a hash-addressed upstream snapshot in user data, and hot-reloads only strict allow-listed service endpoint recipes. Upstream extension JavaScript is never blindly executed inside the privileged Electron main process.
- Keeps the existing persistent Chromium session, real browser tabs, uBlock network filtering, 23-provider media universe, native Rust transports, uncapped galleries, full-resolution lightbox/hover media, and source-grounded-only image policy.

## 2.5.0 universal provider fast lane + measured bandwidth-tail suppression

- Promotes the live-media pipeline from a CurseForge-heavy optimizer to a **23-family provider capability registry** covering CurseForge, Modrinth, GitHub, GitLab, Hangar, SpigotMC, Bukkit, BuiltByBit, Nexus Mods, ModDB, Polymart, Planet Minecraft, MCPEDL, ModBay, AFDIAN, Patreon, Minecraft Marketplace, BOOTH, Fourthwall, Ko-fi, itch.io, Gumroad, and alltheysm. Unknown exact project pages still retain the identity-checked generic OG/JSON-LD/Chromium fallback.
- Adds exact child resolution for Patreon creator pages/posts, AFDIAN creator products, Minecraft Marketplace PDPs, Ko-fi shop items, itch.io creator pages, and Gumroad product pages. Collection/profile hero art is never silently borrowed as project media.
- Adds **tiny public metadata seed lanes** where the provider ecosystem exposes them: Spigot exact resources can use Spiget's public resource icon metadata, Hangar exact projects use the public Hangar project API/avatar, and GitLab exact projects can use the public project avatar field. These seeds only accelerate the first real icon; the canonical project page still performs full, uncapped live gallery enrichment.
- Adds first-class identity/media rules for Hangar, SpigotMC, Bukkit, Nexus Mods, ModDB, GitLab, Polymart, and BuiltByBit. BuiltByBit is deliberately **browser-navigation-only** without an official authenticated API token: the app will use the real persistent Chromium page rather than inventing a scraper bypass.
- Removes the old quick-source score window: **every canonical provider source home is admitted to first-image prime**. Provider scoring may order metadata, but it no longer excludes Patreon/AFDIAN/PMC/Bedrock/other homes from the live race.
- Adds a provider-adaptive transport policy based on real socket measurements instead of assuming every abort saves bandwidth. The audit found that pooled wreq and impit can return a logical first-media abort while continuing to drain the network body for connection reuse. 2.5 therefore stops spraying those native transports across every provider page: wreq remains a real complementary CurseForge keeper, and impit HTTP/3 remains a visible-card specialty hedge.
- Makes redundant Node streams physically terminate after the first complete trusted media URL and makes provider collection streams stop after the exact-child prefix. Chromium uses the same bounded body-reader cancellation path in the production Electron session. One complete response remains for uncapped enrichment, so this is bandwidth elimination rather than gallery truncation.
- Expands startup connection hints to the real media origins used by ForgeCDN, Modrinth, GitHub/GitLab, Hangar, SpigotMC, Bukkit, Nexus Mods, ModDB, Polymart, BuiltByBit, PMC, MCPEDL, ModBay, AFDIAN, Patreon, Minecraft/Microsoft Marketplace media, BOOTH, Fourthwall, Ko-fi and itch. Discovered image origins are still added dynamically.
- Adds provider-universe and current-catalog coverage gates. The built-in catalogs currently contain **605 records and 759 source URLs across 10 provider families**, all classified by the first-class registry; the registry itself has **23 first-class provider families**.
- Adds `hedged-bandwidth-qa.js`, a real TCP-stream benchmark. Its release fixture compares the former three-complete-response behavior with the new keeper + physical-probe policy over a deliberately slow 1 MiB tail and requires a large byte reduction without regressing first-media readiness. The same test explicitly audits wreq/impit cancellation behavior so a future change cannot accidentally reintroduce hidden native tail drains.
- Patreon/AFDIAN/login-sensitive discovery stays credential-safe: the persistent Chromium partition is the complete-response authority. The app does not export cookies into catalog data, and public native/Node paths do not bypass paid/private access.
- No gallery cap, project cap, source cap, synthetic image substitution, viewport record culling, or downgrade of full-original hover/lightbox media was introduced.

## 2.4.0 same-session paint acceleration + fourth native transport

- Fixes a hidden cross-session performance bug: the catalog renderer now uses the same persistent Chromium session partition as live discovery. Provider preconnect, DNS/TLS/H2/H3 state, cookies, and HTTP cache warming therefore benefit the actual card <img> requests instead of being stranded in a different Chromium session.
- Starts the real preview-byte request before IPC paint for visible and near-visible cards. The provider-discovered preview is consumed through Electron session.fetch on the shared partition, allowing the renderer image request to coalesce with or hit the warmed Chromium HTTP cache. Full-original hover/lightbox URLs remain unchanged.
- Adds a fourth independent network implementation using the official Apify impit 0.14.4 native Rust binding. The shipped client uses Chrome 151 impersonation; HTTP/3 is enabled, with a QUIC-only exact CurseForge /gallery hedge for immediately visible cards while all existing Node, Chromium, and wreq paths remain available.
- Exact CurseForge gallery streams can now seed the first real ForgeCDN image directly from the completed streamed URL before the full HTML parser runs. wreq, Chromium, and impit gallery lanes all use this safe exact-project shortcut; background full HTML continues for the uncapped gallery.
- Replaces growing-response rescans with rolling chunk scanners in Node, Chromium, and wreq. This removes repeated cumulative regex work and repeated Rust Buffer.concat allocations from the hot streaming path. Media readiness can now fire from 128 bytes once a complete trusted URL is present.
- Adds real native impit streaming QA and a 144-socket multi-transport stress gate. The Linux QA binding and Windows release binding are the upstream GitHub Actions artifacts, verified against GitHub's published artifact SHA-256 digests.
- Starts provider/CDN connection establishment from the persisted live-media metadata cache before Catalog IPC and DOM upgrade work begins. Every cached record remains represented; only duplicate origins are coalesced into connection hints.
- Caches each project's primary media DOM slot and last computed screen priority so gallery/icon/author updates stop repeating selector scans and forced layout reads on the first-image path.
- No gallery cap, project cap, synthetic media, viewport record culling, or downgrade of full-resolution hover/lightbox behavior was introduced.

## 2.3.0 streamed-media latency removal

- Replaces the last arbitrary byte-threshold wait in first-image discovery with a **content-sensitive media gate**. Node, Chromium, and native Rust now resolve a dedicated `media` phase the moment the streamed HTML contains a complete trusted provider image URL instead of waiting for a 448-768 KiB prefix or EOF. The same physical request still continues to full HTML for uncapped gallery enrichment.
- Fixes the native Rust head bug found by real socket testing: the 2.2 Rust lane waited for its byte threshold on small streamed pages even after `</head>` arrived. 2.3 detects `</head>` while chunks are still arriving, matching the fast Node/Chromium head behavior.
- Adds an exact **CurseForge `/gallery` SSR race**. Native Rust starts the project-owned gallery route in parallel with the canonical page; visible/near-visible cards also race Chromium against that gallery route. The canonical page is still retained and full enrichment is never capped.
- Teaches the CurseForge parser to trust the bounded project-owned SSR gallery strip before Description and to preserve the provider's small ForgeCDN thumbnail as the card preview while upgrading the hover/lightbox URL to the full original attachment.
- Makes the offscreen Chromium DOM path a real hedge: visible cards start it at 0 ms, near-viewport cards at 45 ms, and farther cards at 120 ms. Four `WebContentsView` instances are prewarmed during boot so visible cards do not pay view construction on the first request.
- Widens the native Rust transport to a 192-connection pool with 48 idle connections per host, increases Chromium preconnect sockets on WAF-sensitive providers, and immediately preconnects the discovered image CDN before the media IPC payload reaches the renderer.
- Removes the renderer's 12 ms prime timer; the initial global media batch is now admitted on the next microtask. No project record, source, image, or gallery result cap was added.
- Adds executable `progressive-media-qa.js` and `media-stress-qa.js`. The release gate now measures real streamed localhost HTTP sockets through the actual Node and vendored Rust transports, verifies parseable CurseForge SSR media arrives before a deliberately slow response tail, and stress-races 128 simultaneous real HTTP streams without serializing the first-media frontier.

## 2.2.0 true parallel native live-media transport

- Replaces the remaining WAF-sensitive single-transport bottleneck with **three real simultaneous network engines** per exact provider page: pooled Node core HTTP, Electron `session.fetch()` on Chromium's native network service, and a **vendored wreq-js 3.2.0 Rust/BoringSSL N-API binding**. All three start at t=0; none waits for another transport to time out.
- The Rust lane is shipped, not theoretical. Official x86_64 Windows and Linux GNU native bindings from the upstream wreq-js v3.2.0 GitHub Actions build are vendored with their MIT license. The app selects the newest native Chrome profile available (currently Chrome 149), holds a persistent cookie session, and reuses a 96-connection transport pool with up to 24 idle connections per host.
- Rust responses are streamed with `readBodyChunk`: provider `<head>` and early-body prefixes can paint a real off-site image before the tail of the document finishes. The same one physical response continues in the background for the full uncapped gallery, so first paint is no longer coupled to full-page completion.
- Adds Chromium `session.preconnect()` origin warmup and direct `session.fetch()` SSR acquisition. If all compact transports are still silent after 180 ms, a pooled offscreen Chromium page launches concurrently and extracts on `dom-ready` without waiting for fonts, analytics, ads, or the full `load` event.
- Removes alternate-source startup staggering: canonical sources and all available network engines enter the race in the same turn. Existing single-flight/cache identity guarantees remain, so duplicate consumers share provider responses instead of multiplying physical requests.
- Adds executable `rust-native-qa.js`. Its delayed local streaming fixture verifies the real Rust native module loads, three concurrent consumers collapse to one physical request, an OG image is visible from the early stream before the delayed document tail, and the full body still completes without truncation.
- No image/gallery cap, no synthetic media, no viewport record culling, and no replacement of full-original hover/lightbox URLs were introduced.

## 2.1.0 frontier-first live image scheduler

- Fixes the remaining catalog-wide first-paint stall at the scheduler boundary. Prime requests are now sorted in the renderer, admitted to the main-process queue as one atomic batch, and only then dispatched. A visible card registered late can no longer sit behind the first worker-count worth of registration-order cards.
- Adds provider-aware source ordering without discarding anything: deterministic GitHub repository previews and Modrinth bulk/API hits lead, exact project homes follow, and collection/auxiliary routes enrich afterward. Every exact source remains available to the uncapped deep/gallery pass.
- Keeps progressive single-request head/prefix/full parsing, context-aware cache v7, single-flight raw-document reuse, DNS reuse, Modrinth bulk hydration, protected Chromium deep fallback, and full-original hover/lightbox behavior.
- Tightens image-byte scheduling after discovery: visible images retain `fetchPriority=high`; near-frontier discovered images start eagerly; farthest rows stay low/lazy so Chromium's priority signal remains useful instead of turning every image into a high-priority request storm.
- Adds `frontier-priority-qa.js` to release QA. It gates provider-aware source ordering, full-batch admission-before-pump, renderer priority sorting, near/far image loading policy, and the no-gallery-cap invariant.
- The implementation follows current priority-queue, browser Priority Hints, and Node keep-alive pooling guidance while remaining dependency-free in the packaged runtime.

## 2.0.12 provider-native bulk prime hardening

- Extends the 2.0.11 progressive first-image frontier with Modrinth's official bulk `GET /projects?ids=[…]` endpoint. Every unique Modrinth project in the catalog is primed together in encoded-URL-size transport chunks, preserving all projects, icons, and gallery entries while removing per-card project API round trips.
- Keeps author/team enrichment off the first-image critical path; rich creator data and full gallery enrichment still continue afterward with no result or gallery truncation.
- Adds release QA that feeds 400 synthetic Modrinth project slugs through the bulk chunker and proves every project is preserved in order across transport chunks.

## 2.0.11 ultra-fast live-media frontier

- Fixes the largest warm-start media bug: persistent discovery cache is now keyed by **source URL + exact project identity**, so multiple catalog entries that share a Planet Minecraft collection, creator page, or other index URL no longer evict one another. In the two built-in catalogs, 148 rows participate in duplicated/index-style project URLs, including 42 Mob Girl rows on one PMC collection.
- Replaces hundreds of per-card cache IPC calls with one batched catalog hydrate, then launches an all-project **priority first-image frontier**. Visible/near-visible cards are reprioritized immediately; no project, source, gallery, or result count is capped.
- Adds Spider/Crawlee-style **single-flight raw provider requests** and a short-lived 64 MiB byte-budgeted document cache. Dozens of project identities that share one provider index reuse the same physical response while preserving independent identity parsing and persistent project-scoped results.
- Adds a three-gate progressive HTTP path: trusted project `<head>` media can paint as soon as `</head>` arrives, provider collection/index child links can resolve from an early body prefix, and the same physical response continues into full uncapped provider/gallery parsing. Slow alternate sources merge progressively instead of holding the first good image behind `Promise.all`.
- Adds TTL DNS reuse with in-flight coalescing, Happy-Eyeballs address selection, wider keep-alive socket pools, early CDN DNS/preconnect hints, viewport-aware `fetchPriority`, and live provider thumbnail URLs where a provider exposes a smaller derivative. Hover/lightbox still opens the original full live image.
- Deep Chromium discovery now uses a reusable protected media-view pool and yields to missing first-image HTTP/API work. Rich gallery/author enrichment remains uncapped and automatically continues after the fast image frontier or on hover/detail/lightbox.
- GitHub projects can paint from the deterministic live repository OpenGraph endpoint and owner avatar without waiting for a full github.com document; Modrinth's first-image path no longer waits on optional team/author enrichment.
- Modrinth now primes through its official bulk `GET /projects?ids=[…]` API: all Modrinth projects in the current catalog are transport-chunked by URL size and hydrated together, while every project gallery/icon remains intact and rich author/team enrichment continues afterward.
- Deterministic media-performance QA proves 32 concurrent identical consumers collapse to one GET; early head and collection-prefix readiness beat delayed full bodies while sharing the same request; cache v7, batched IPC, quick-before-deep scheduling, progressive painting, and no-gallery-cap invariants are release-gated.

## 2.0.10 verified ad blocking + native Windows window ergonomics

- Fixed the false-positive adblock state exposed by Planet Minecraft: `uBO … on` previously meant only that Electron accepted the extension package. 2.0.10 adds an authoritative native `session.webRequest` blocker compiled from the bundled official uBlock Origin filter assets plus EasyList/EasyPrivacy. The current bundled set produces about **118k parsed network rules** and blocks common Google/DoubleClick/AppNexus ad traffic before it reaches live browser tabs.
- The official uBlock Origin 1.74.0 extension remains loaded for its normal extension/content-script state. Companion's native network layer is the verified fallback/authority because Electron's main-process webRequest layer has deterministic control of the persistent browser session. The status bar now says **verified** only when the network engine itself is running; extension load alone is shown as `loaded / not filtering`.
- Filter lists refresh conditionally every six hours using ETag/Last-Modified and fall back to the bundled official lists offline. The existing official `gorhill/uBlock` package updater remains, so both the extension package and live network lists stay current.
- Restored normal frameless-Windows movement behavior without sacrificing the custom chrome: empty titlebar/tab-strip space is a native drag region, while actual tabs, New Tab/Reopen, and window buttons are explicit no-drag controls. Windows `WS_THICKFRAME` move/resize/snap behavior is explicitly retained.
- The protected bottom status surface gets the same QoL treatment: non-interactive status space can be used as a convenient grab region, collapse/reveal remains clickable, and native window edges/corners remain reserved for standard resize behavior.

## 2.0.9 provider-identity media + uBlock Origin + hit-safe zoom

- Replaces generic non-CurseForge image harvesting with provider-aware project identity. Planet Minecraft collection URLs are now treated as indexes: the catalog title is matched against child project links, the exact child project is fetched, and only that project page can supply gallery/icon media. Collection neighbors, `More like this`, recommendations, comments, avatars, ads, and site chrome are rejected.
- Adds scoped exact-project extraction for MCPEDL, ModBay, Fourthwall product pages, BOOTH, AFDIAN, and GitHub/other identity-checked sources. Known provider pages can become authoritative so the generic Chromium crawler does not contaminate a good provider result.
- Fixes a latent media bug where a missing social-image meta value could resolve to the page URL itself and be treated as an image. Live-media discovery cache is bumped to v6 so older ambiguous Planet Minecraft/non-CurseForge results are ignored and rediscovered with the new identity policy.
- Integrates the official **uBlock Origin 1.74.0 Chromium MV2** bundle into the persistent live-browser session. A compatibility layer fills Electron APIs uBO expects without replacing Electron's native `webRequest`/storage/runtime support. uBO keeps its normal filter-asset updater, while the app checks official `gorhill/uBlock` GitHub releases every six hours and stages newer Chromium packages for the next restart. The bottom status bar exposes the active uBO version and the More menu has an explicit update check.
- Keeps hover magnification and the gallery lightbox exactly in place while fixing the click blocker: the transparent full-image zoom layer no longer receives pointer events, explicit Favorite/Compare/action controls stay above it, and background image clicks are delegated to zoom only when the click did not originate from an interactive control.
- Preserves 2.0.8 native modal isolation, ByteString-safe Node transport, protected top/bottom chrome, browser input focus, native draggable 18px split rail, uncapped live galleries, and real off-site provider/CDN image URLs.

## 2.0.8 ByteString elimination + native modal isolation

- Eliminates the remaining Electron `session.fetch`/Undici crash path. Authenticated Google Sheet/Doc/Drive refresh now reads the existing cookies from `persist:minecraft-catalog-live` and performs the HTTP transfer with pooled Node `http`/`https`, so third-party **response headers** never pass through Electron's Fetch `Headers` ByteString conversion. Login/session continuity is preserved because the browser cookie jar remains authoritative.
- Adds a malformed-response-header regression that reproduces the exact U+2014 / `8212` failure class and verifies both public media and authenticated Google-source transport survive it.
- Applies the approved blur fix at the source: site permissions now use Electron native message boxes, Catalog Center runs in its own child `BrowserWindow`, and clear-live-data confirmation is native. The protected top chrome has a hard 430px utility cap and can no longer expand to full-window size.
- Removes the top-shell HTML `<dialog>` surfaces and their blurred backdrop. A safety CSS rule keeps any future dialog backdrop blur-free. Permission choices remain Block / Allow once / Allow this session, and focus is restored to the requesting site after the native prompt closes.
- Preserves the 2.0.7 native 18px split rail and accelerated cached-first/live-only media pipeline without adding gallery caps, fabricated media, static screenshots, or embedded image payloads.

## 2.0.7 transport + native split + live-media acceleration

- Introduced pooled Node `http`/`https` for public project/media discovery and the protected native splitter. 2.0.8 extends that ByteString-safe transport to authenticated Google-source refresh as well.
- Replaced the obscured DOM splitter with a dedicated protected native splitter `WebContentsView`, preserving the 18px hit lane while making the full divider draggable above both native panes. Drag uses stable screen coordinates; double-click resets 50/50; right-click/Enter swaps; arrows/Home/End resize; ratio persists.
- Live preview discovery remains real off-site HTTP(S) media only. Cached URLs paint first, visible/near-visible cards get priority, public HTTP uses keep-alive pooled sockets, alternate project sources resolve in parallel, and deep Chromium crawling is deferred to stale/rich refresh or user interaction. Gallery/source-image counts are not truncated by the old 24-image cap.

## Hot-drop catalogs + live source refresh

Catalog Center accepts **XLSX/XLSM, CSV, TSV, JSON, DOCX, PDF, Markdown/TXT, HTML, and ZIP catalog bundles**.

- Drop supported files anywhere on the desktop app or use **Catalogs, sources & sync -> Import local files**.
- Smart ingest treats structured data as the row authority and keeps companion Docs/PDFs as narrative/fixed-reference layers. A Sheet + Doc + PDF dropped together becomes one catalog.
- Local tracked files are watched every ~1.6 seconds and semantic/hash compared; meaningful changes refresh the catalog automatically.
- Private Google Sheets, Docs, and Drive PDFs can be tracked directly. The app uses its persistent Chromium browser session as the cookie authority: sign into Google in an in-app tab once, then private tracked sources refresh through pooled Node HTTP using the matching Chromium cookies, without publishing them or embedding credentials.
- Google sources are checked shortly after launch and approximately every two minutes. `Cache-Control: no-cache`, conditional metadata, and semantic hashes make unchanged checks a no-op.
- Use **Refresh active sources** or **Refresh all catalogs** at any time. **Open catalog data folder** exposes the local normalized snapshots/registry for backup or inspection.
- Source Center reports `current`, `pending`, `sign-in-required`, or `error` rather than presenting an untouched snapshot as synchronized.

### Source authority

Structured sources (Sheet/XLSX/CSV/TSV/JSON/catalog bundle) own sortable rows. Docs and PDFs add narrative/reference context and provenance. A PDF never silently replaces a newer structured master.

## 2.0.6 browser-input + bottom-edge + media-latency repair

- Fixed the real text-field regression from 2.0.4: the chrome guard was relaying out the active remote `WebContentsView` when it gained focus, and the old layout path hid/re-showed that view. A page input could receive your click and then immediately lose DOM focus. Attached active views are now resized in place and **never hidden/re-shown during focus/layout guards**.
- Remote focus and the root-shell blur event now use paint-only guards. They no longer invoke the full native-view layout routine. The dedicated topmost chrome view stays intact without stealing focus from Twitch/Google/CurseForge login/search fields.
- Site permission prompts now remember the requesting `webContents` and explicitly restore focus to that page after Block / Allow once / Allow this session. Catalog Center and browser-data dialogs also hand focus back to the active content after closing.
- Normal browser pages now extend to the actual bottom edge instead of reserving the old 28 px BrowserWindow status strip. The status strip is kept only for the full Catalog view, removing the dark/blurred-looking band seen under websites.
- Live media is still **actual off-site HTTP(S) media only**, but startup is substantially lighter: per-project cache reads are deduplicated, visible/near-visible cards are prioritized with `IntersectionObserver`, quick provider/HTML metadata uses up to 10 lightweight jobs, and expensive offscreen Chromium gallery/profile discovery is limited to 2 deep jobs and prioritized for hover/detail/lightbox use.
- Discovery metadata stays cached for 24 hours while the image URLs themselves remain live provider/CDN URLs. Cached cards paint immediately; deep refresh remains available from the gallery and broken URLs still trigger a live re-resolution.

## 2.0.4 native control-plane isolation

- Replaced the vulnerable BrowserWindow-only toolbar with a second, dedicated `WebContentsView` that renders the same titlebar/tab strip/address bar as a **topmost native sibling surface**.
- Every live website/catalog content view is now explicitly stacked underneath that control surface. Creating a tab cannot overtake the toolbar even if Windows gives the remote Chromium child surface a stale full-window hit region.
- The top control view starts at exactly 94 px and expands only when Find, Downloads, More, permission prompts, confirmation prompts, or Catalog Center need additional UI.
- Remote site bounds, 1.2 → 2.x browser-session continuity, the 18 px split lane, and all 2.0.1+ live off-site gallery/author-media behavior are preserved.
- The older repaint/background-throttling guards remain as defense in depth, but UI availability no longer depends on the BrowserWindow renderer winning composition against a website child view.

## 2.0.3 native browser chrome compositor fix

- Fixed the separate new-tab failure where a newly focused remote `WebContentsView` could leave the BrowserWindow shell renderer blank/unpainted on Windows even though the remote page itself was correctly clipped below the 94 px chrome boundary.
- The shell renderer now keeps background throttling disabled and explicitly invalidates/repaints after native-view focus/navigation handoffs, without stealing focus from the web page.
- New remote views are born hidden inside the safe content region, sized to their final bounds **before** attachment, and only then revealed. This prevents a transient full-window native child/hit-test surface during tab creation.
- Tab switching no longer removes and re-adds every native view. Views remain attached and are visibility-switched, avoiding native z-order/input-region churn while preserving the 18 px split lane and existing tab/session behavior.
- The 2.0.1 live off-site media contract and the 2.0.2 non-blurring drag indicator are unchanged.

## 2.0.2 direct-navigation drag-overlay fix

- Fixed the actual top-control failure: the catalog file-drop overlay could remain visible when a drag crossed from the shell renderer into a native `WebContentsView`, because Chromium can consume the matching `dragleave`/`drop`.
- The drop indicator is no longer a full-window blurred layer. It is a compact, non-blurring status-bar pill that cannot cover the titlebar, tabs, address bar, or browser controls.
- Drag state now has a 450 ms watchdog and is force-cleared on direct address navigation, shell state/navigation updates, renderer blur, drag end, page show, visibility loss, pointer input, and Escape. Direct URL entry and catalog-opened project tabs therefore share a clean browser-chrome state.
- Restored the original pre-2.0.1 translucent titlebar/toolbar appearance and removed the unrelated opaque/non-blurred chrome override and BrowserWindow material override.

## 2.0.1 live off-site media fix

- Catalog galleries, project icons, and author avatars are **live off-site media only**. The app caches discovery metadata and source URLs for speed, but displayed image URLs continue to point to the real mod/provider/creator site or its CDN.
- Embedded/base64/static gallery payloads and page-screenshot fallbacks are not used. Modrinth uses its live project/team API where possible; other providers are resolved through the persistent internal Chromium session, including gallery/media subpages and creator profiles.
- Every media slot supports source refresh. Gallery images, project icons, and creator avatars support full hover zoom; project galleries also open in a thumbnail lightbox with previous/next navigation and direct source/image actions.
- Exact alternate provider homes are tried when a primary page cannot expose enough media. Failed image URLs are discarded and refreshed instead of being permanently cached as blank cards.

## 1.2 -> 2.0 zero-loss upgrade

2.0 keeps the universal **Minecraft Catalog Companion** app identity and the existing `persist:minecraft-catalog-live` Chromium partition, preserving normal site/Google session continuity. On first launch it detects the 1.2 `catalog-workspace` registry and migrates custom catalogs, source definitions, active catalog state, and legacy `mob-girls` identity into the 2.0 registry. Legacy Mob Variety/Mob Girl project IDs are translated by canonical project identity so saved favorites/notes/recent state survive the normalized 2.0 IDs. Old state is not deleted.

## Real research browser

Live CurseForge, Modrinth, GitHub, MCPEDL, ModBay, creator pages, and other exact provider homes open in sandboxed Chromium `WebContentsView` tabs. Remote pages receive no Node.js or privileged app APIs.

Every live tab keeps **Open in your browser** and **Copy URL** visible. Project details keep sibling in-app/external actions. Target-blank links become controlled app tabs.

The **Research Split** keeps catalog + live project page together. Its native draggable hit lane is 18 px wide, while the visual rail remains thin. Drag it anywhere, use arrow keys for fine adjustment, double-click for 50/50, right-click/Enter to swap sides, and the chosen width persists.

## Browser/catalog QoL

- Back / forward / reload-stop / address search
- New, close, and reopen browser tabs
- Persistent live-site cookies and sessions
- Find in page and zoom
- Visible download state
- Site permissions: **Block**, **Allow once**, and a real **Allow this session** remembered by origin + permission until app exit or live-site data is cleared
- Session/tab/split restore
- Live off-site gallery discovery, creator-avatar discovery, full hover zoom, thumbnails, and lightbox
- Multiple exact project/provider homes rather than collapsing every project to one URL
- Search, numeric queries when fields really exist, filters, sortable card/table/gallery views, favorites, notes, compare, recent items, and CSV export

## Keyboard shortcuts

- `Ctrl+L` address/search
- `Ctrl+T` new browser tab
- `Ctrl+W` close live tab
- `Ctrl+Shift+T` reopen closed tab
- `Ctrl+Shift+C` return to Catalog
- `Ctrl+Shift+O` Catalog Center
- `Ctrl+F` find in page
- `Ctrl+\` Research Split
- `Alt+Left` / `Alt+Right` browser history
- `Ctrl++` / `Ctrl+-` / `Ctrl+0` zoom
- `/` or `Ctrl+K` inside a catalog focuses catalog search

## Source and QA commands

The packaged Windows build contains Electron and does not require npm. For the source tree, point `ELECTRON_PATH` to an Electron 44 executable if Electron is not installed under `node_modules/electron/dist`.

```bash
npm start
npm run catalog-qa
npm run shell-contract
npm run electron-self-test
npm run provider-media-qa
npm run provider-universe-qa
npm run provider-api-fastlane-qa
npm run adblock-qa
npm run gallery-hit-qa
npm run release-qa
npm run portable
```

`catalog-qa` ships its own tiny XLSX/DOCX/PDF/ZIP fixtures and covers ingest, local hot refresh, grouped Sheet+Doc+PDF ingest, Google-session refresh/no-op hashing, 1.2 registry migration, two built-in catalogs, and Refresh All. `shell-contract` audits visible controls, splitter/session continuity, drag/drop, and main-process commands. `electron-self-test` additionally requires a runnable Electron 44 host and exercises the real shell/browser path.

For one-shot normalization outside the GUI:

```bash
node scripts/ingest-catalog.js --input Master.xlsx --input Guide.docx --input Guide.pdf --output catalog.json --name "My Catalog"
```

## Security and privacy

- Remote tabs: `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`, `webSecurity: true`.
- Google auth remains in the dedicated persistent Chromium session. Tokens/cookies are never copied into catalog JSON, Drive artifacts, or source packages.
- Only `http:` / `https:` live navigation is accepted by the browser workspace.
- No image generation is used. No catalog image bytes are embedded. Displayed project/gallery/creator images remain live `http:` / `https:` URLs from the real source site or its CDN; only discovery metadata is cached locally.


## 2.0.6 native bottom status bar
The bottom status bar is now a dedicated protected native WebContentsView, matching the protected top browser chrome. It is expanded by default, can collapse to a 10 px reveal rail from its own chevron, the More menu, or Ctrl+Shift+B, and persists across restarts. Every catalog/browser/split content view reserves the status bar height so newly created site tabs cannot blur or steal its input surface.
