# Discovery, favorites and content - detailed source acceptance

[Home](Home.md) / [Checklist](Checklist.md) / [Architecture](Architecture.md) / [Ecosystem](Ecosystem.md) / [Source map](Source-Map.md)

> Exact source requirements, independently checkable through the same ledger. Source checkmarks are historical claims, not current certification.

**[Detail progress commands](Working-Agreement.md#detailed-source-progress)** / **[All-source acceptance index](Detailed-Acceptance.md)**

<a id="lib-01-details"></a>
## LIB-01 - Broad source-aware discovery

[Outcome](Checklist.md#lib-01) / 86 source-derived details.

<details>
<summary>README.md / Enderloom 2.9.5 / 2.8.0 universal creator avatars + post-media adapters (1)</summary>

<a id="d-587120a79458adfbd02c"></a>
- [ ] **D-587120a79458adfbd02c** - - Extends creator-avatar ownership beyond CurseForge. Planet Minecraft now binds the exact /member/&lt;creator&gt;/ link and its adjacent/member avatar on the project page when ava...
  - **State:** unverified. **Kind:** documented behavior to preserve.
  - **Full requirement:** - Extends creator-avatar ownership beyond CurseForge. Planet Minecraft now binds the exact /member/&lt;creator&gt;/ link and its adjacent/member avatar on the project page when available, then independently enriches the exact creator profile in parallel when the avatar is not already exposed. The same creator request single-flights across cards and is keyed by creator identity rather than project title. - Moves cross-site creator/profile knowledge into a 23-provider site-adapter registry covering CurseForge, Modrinth, GitHub, GitLab, Hangar, SpigotMC, Bukkit, BuiltByBit, Nexus Mods, ModDB, Polymart, Planet Minecraft, MCPEDL, ModBay, AFDIAN, Patreon, Minecraft Marketplace, BOOTH, Fourthwall, Ko-fi, itch.io, Gumroad and alltheysm. Provider pages only yield an author avatar when it is bound to a recognized creator/profile identity; project/gallery art cannot be re-used as the avatar. - Adds exact Planet Minecraft author/card handling for the live layout where the project embed links the project image and the separate creator link points to a member profile. Commenter avatars, update-log content and More ... by sibling submissions are cut out of the project gallery region instead of being treated as project media. - Adds first-class AFDIAN/post media extraction. vm-pic / img-pre post images are accepted as project-owned media, transformed/watermarked thumbnail URLs remain previews, and the original CDN URL is retained for full-resolution hover/lightbox. Direct &lt;video&gt; / &lt;source&gt; media and GIFs are preserved as typed gallery entries with poster art. - Adds common post-media adapters for linked full-resolution images, srcset/lazy images, role-safe styled background images, Schema.org/JSON-LD image, screenshot, VideoObject and associatedMedia, plus structured author/creator avatars. This benefits storefronts, creator posts and non-Minecraft catalogs without weakening role isolation. - The browser DOM fallback now recognizes creator-profile URL patterns across the wider provider universe, includes GIF/full-image anchors and semantic background media, and keeps creator discovery on a separate microtask/transport lane after the project/gallery candidate has already been delivered. Gallery/icon paint therefore never waits for a profile page. - Live-media cache schema advances to v10 so earlier role mappings are rediscovered with the provider-adapter model. No project, source, provider, gallery or result cap is introduced.
  - **Binding context:** Enderloom 2.9.5 / 2.8.0 universal creator avatars + post-media adapters
  - **Original specification:** [README.md : 69-75](https://github.com/Herbertofury/Enderloom/blob/main/README.md#L69-L75)

</details>

<details>
<summary>README.md / Enderloom 2.9.5 / 2.6.0 identity-safe media + real parallel parsing + integrated TWP translator (1)</summary>

<a id="d-f26b82b63850a981687b"></a>
- [ ] **D-f26b82b63850a981687b** - - Fixes the obvious wrong-image failure shown on CurseForge cards: streamed /gallery discovery no longer trusts the first ForgeCDN-looking URL on a page. The fast path now requires...
  - **State:** unverified. **Kind:** documented behavior to preserve.
  - **Full requirement:** - Fixes the obvious wrong-image failure shown on CurseForge cards: streamed /gallery discovery no longer trusts the first ForgeCDN-looking URL on a page. The fast path now requires the exact project H1, enters only the project-owned gallery region, rejects promotion/campaign/ad artwork, and preserves the actual project image/icon/gallery relationship. Live-media cache schema advances to v8, invalidating polluted 2.5 identities instead of repainting them. - Adds a prewarmed worker_threads provider-parser pool for large full-page enrichment. The first-image prefix remains on the main hot path, while expensive full HTML parsing fans out over multiple CPU cores. The release benchmark uses 32 ~405 KiB provider fixtures and requires a material multi-core throughput win rather than a scheduler reorder. - Adds parallel Chromium image predecode for visible/near-visible source images, raises same-session preview-byte warm depth, and expands the cold-start DOM hedge pool to six preconstructed WebContentsViews. This performs more useful decode/construction/network work concurrently; no records, providers, sources, projects, or gallery images are suppressed to create the speedup. - Fully integrates the current TWP - Translate Web Pages architecture into protected Electron browser tabs: whole-page translation, selected-text translation, Original/Translated toggling, dynamic-page MutationObserver translation, per-site auto-translate, target-language selection, translation caching and in-flight request coalescing. Bing, Google, Yandex and DeepL service protocols are supported. - Adds a uBlock-style TWP upstream updater. Every six hours it checks the official FilipePS/Traduzir-paginas-web GitHub release, downloads the tagged upstream source archive, verifies project identity/version/MPL-2.0 plus required translation-core files, stores a hash-addressed upstream snapshot in user data, and hot-reloads only strict allow-listed service endpoint recipes. Upstream extension JavaScript is never blindly executed inside the privileged Electron main process. - Keeps the existing persistent Chromium session, real browser tabs, uBlock network filtering, 23-provider media universe, native Rust transports, uncapped galleries, full-resolution lightbox/hover media, and source-grounded-only image policy.
  - **Binding context:** Enderloom 2.9.5 / 2.6.0 identity-safe media + real parallel parsing + integrated TWP translator
  - **Original specification:** [README.md : 89-94](https://github.com/Herbertofury/Enderloom/blob/main/README.md#L89-L94)

</details>

<details>
<summary>README.md / Enderloom 2.9.5 / Hot-drop catalogs + live source refresh (1)</summary>

<a id="d-cf160be110ef5f198989"></a>
- [ ] **D-cf160be110ef5f198989** - - Drop supported files anywhere on the desktop app or use Catalogs, sources &amp; sync -&gt; Import local files. - Smart ingest treats structured data as the row authority and keep...
  - **State:** unverified. **Kind:** documented behavior to preserve.
  - **Full requirement:** - Drop supported files anywhere on the desktop app or use Catalogs, sources &amp; sync -&gt; Import local files. - Smart ingest treats structured data as the row authority and keeps companion Docs/PDFs as narrative/fixed-reference layers. A Sheet + Doc + PDF dropped together becomes one catalog. - Local tracked files are watched every ~1.6 seconds and semantic/hash compared; meaningful changes refresh the catalog automatically. - Private Google Sheets, Docs, and Drive PDFs can be tracked directly. The app uses its persistent Chromium browser session as the cookie authority: sign into Google in an in-app tab once, then private tracked sources refresh through pooled Node HTTP using the matching Chromium cookies, without publishing them or embedding credentials. - Google sources are checked shortly after launch and approximately every two minutes. Cache-Control: no-cache, conditional metadata, and semantic hashes make unchanged checks a no-op. - Use Refresh active sources or Refresh all catalogs at any time. Open catalog data folder exposes the local normalized snapshots/registry for backup or inspection. - Source Center reports current, pending, sign-in-required, or error rather than presenting an untouched snapshot as synchronized.
  - **Binding context:** Enderloom 2.9.5 / Hot-drop catalogs + live source refresh
  - **Original specification:** [README.md : 206-212](https://github.com/Herbertofury/Enderloom/blob/main/README.md#L206-L212)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 19. Micro-QOL requirements (1)</summary>

<a id="d-1f462dfd1387baba7fd1"></a>
- [ ] **D-1f462dfd1387baba7fd1** - Run full release gates before install.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. Micro-QOL requirements
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 572-572](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L572-L572)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 2. CANONICAL ENGINEERING REFERENCES (1)</summary>

<a id="d-b94ea0f812c1f07f84b6"></a>
- [ ] **D-b94ea0f812c1f07f84b6** - Version-sensitive APIs/ecosystems are revalidated just-in-time from current primary sources.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CANONICAL ENGINEERING REFERENCES
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: REF-003 : 162-162](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L162-L162)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 3. PHASE 0 — PRESERVE AND BASELINE THE EXISTING PRODUCT / 3.2 Existing behavior that must survive all later work (1)</summary>

<a id="d-164c10d0b7394e4140c5"></a>
- [ ] **D-164c10d0b7394e4140c5** - External launcher integration: CurseForge/Modrinth discovery, connect-in-place, physical-path/junction identity, explicit clone/copy, safe disconnect/reconciliation.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. PHASE 0 — PRESERVE AND BASELINE THE EXISTING PRODUCT / 3.2 Existing behavior that must survive all later work
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: P0-012 : 179-179](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L179-L179)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 4. PHASE A — INTEGRATION SPINE / 4.5 Universal project/mod detail (1)</summary>

<a id="d-35dbd082483a9ac7fd74"></a>
- [ ] **D-35dbd082483a9ac7fd74** - identity/version/hash/provider/source/install locations.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. PHASE A — INTEGRATION SPINE / 4.5 Universal project/mod detail
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PA-040 : 233-233](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L233-L233)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 6. PHASE C — UNIVERSAL MACHINE SURFACES + PROGRESS / 6.1 CLI/service parity (1)</summary>

<a id="d-ce0e24c275a1542768bd"></a>
- [ ] **D-ce0e24c275a1542768bd** - machine options: JSON/JSONL, quiet/verbose/no-color, non-interactive/yes, timeout, trace ID, output, plan/dry-run, stable exit codes, stdout/stderr discipline, schema/version disco...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** machine options: JSON/JSONL, quiet/verbose/no-color, non-interactive/yes, timeout, trace ID, output, plan/dry-run, stable exit codes, stdout/stderr discipline, schema/version discovery, shell completions.
  - **Binding context:** 6. PHASE C — UNIVERSAL MACHINE SURFACES + PROGRESS / 6.1 CLI/service parity
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PC-003 : 277-277](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L277-L277)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 2. Security &amp; Supply-Chain Center — missing critical layer / 2.1 Local static artifact scanner (1)</summary>

<a id="d-081834ba59340525ee57"></a>
- [ ] **D-081834ba59340525ee57** - Detect broad home/profile/browser/session/Discord/token path access patterns.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Security &amp; Supply-Chain Center — missing critical layer / 2.1 Local static artifact scanner
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 55-55](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L55-L55)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 15. Legacy Archaeology / Truly Broad Version Support / 15.4 Bedrock historical support (1)</summary>

<a id="d-04750a5d1430d5302e84"></a>
- [ ] **D-04750a5d1430d5302e84** - old Windows/UWP development-folder discovery only when user points Enderloom at legitimate local content.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Legacy Archaeology / Truly Broad Version Support / 15.4 Bedrock historical support
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 787-787](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L787-L787)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 25. Pack/Release Permission &amp; Policy Gate (1)</summary>

<a id="d-d6ed79500bd6c53df16d"></a>
- [ ] **D-d6ed79500bd6c53df16d** - Record source/provider/license/permission where known.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 25. Pack/Release Permission &amp; Policy Gate
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 967-967](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L967-L967)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G001 — Updates behave like a first-class launcher / T002 — Make update discovery and Update All feel instant (1)</summary>

<a id="d-96e3a0cfbabfd0c3e840"></a>
- [ ] **D-96e3a0cfbabfd0c3e840** - · Make update discovery and Update All feel instant
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G001 — Updates behave like a first-class launcher / T002 — Make update discovery and Update All feel instant
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md :: T002 : 65-65](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L65-L65)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G005 — Favorites/catalog identity and quick actions are clean / T012 — Merge duplicate favorites across CurseForge/Modrinth/other providers (1)</summary>

<a id="d-828742cb69bccebbcad6"></a>
- [ ] **D-828742cb69bccebbcad6** - A logical mod/project appearing on multiple providers must show as one canonical favorite card with provider badges/source options, matching the rest of Enderloom&#x27;s cross-prov...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** A logical mod/project appearing on multiple providers must show as one canonical favorite card with provider badges/source options, matching the rest of Enderloom&#x27;s cross-provider identity behavior.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G005 — Favorites/catalog identity and quick actions are clean / T012 — Merge duplicate favorites across CurseForge/Modrinth/other providers
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md : 241-241](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L241-L241)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 4. Catalog + research browser / 4.1 Core research behavior (2)</summary>

<a id="d-0cafc4fc4d4c19e94ca2"></a>
- [ ] **D-0cafc4fc4d4c19e94ca2** - Exact project/source links.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.1 Core research behavior
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 138-138](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L138-L138)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-484306048f65a7aa2d22"></a>
- [ ] **D-484306048f65a7aa2d22** - Source health / refresh behavior.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.1 Core research behavior
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 144-144](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L144-L144)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 4. Catalog + research browser / 4.2 Provider universe (8)</summary>

<a id="d-e5240a891601b8ce27d1"></a>
- [ ] **D-e5240a891601b8ce27d1** - Enderloom&#x27;s research/media architecture must remain broad and provider-aware rather than CurseForge-only.
  - **State:** unverified. **Kind:** provider contract.
  - **Binding context:** 4. Catalog + research browser / 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 148-148](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L148-L148)

<a id="d-dc8eea616e508365b1da"></a>
- [ ] **D-dc8eea616e508365b1da** - First-class provider families already established include:
  - **State:** unverified. **Kind:** provider contract.
  - **Binding context:** 4. Catalog + research browser / 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 150-150](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L150-L150)

<a id="d-d6816cd3dbff7393a341"></a>
- [ ] **D-d6816cd3dbff7393a341** - - CurseForge - Modrinth - GitHub - GitLab - Hangar - SpigotMC - Bukkit - BuiltByBit - Nexus Mods - ModDB - Polymart - Planet Minecraft - MCPEDL - ModBay - AFDIAN - Patreon - Minecr...
  - **State:** unverified. **Kind:** provider contract.
  - **Full requirement:** - CurseForge - Modrinth - GitHub - GitLab - Hangar - SpigotMC - Bukkit - BuiltByBit - Nexus Mods - ModDB - Polymart - Planet Minecraft - MCPEDL - ModBay - AFDIAN - Patreon - Minecraft Marketplace - BOOTH - Fourthwall - Ko-fi - itch.io - Gumroad - alltheysm
  - **Binding context:** 4. Catalog + research browser / 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 152-174](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L152-L174)

<a id="d-671ff1f45f2cac47e856"></a>
- [ ] **D-671ff1f45f2cac47e856** - Requirements:
  - **State:** unverified. **Kind:** provider contract.
  - **Binding context:** 4. Catalog + research browser / 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 176-176](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L176-L176)

<a id="d-9b8bf0e9f75d84be27db"></a>
- [ ] **D-9b8bf0e9f75d84be27db** - Exact-project identity boundaries.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 178-178](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L178-L178)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-b386d8eb92accd4883c9"></a>
- [ ] **D-b386d8eb92accd4883c9** - Use provider-specific adapters when justified.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 183-183](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L183-L183)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-3f7cd31a445428e89111"></a>
- [ ] **D-3f7cd31a445428e89111** - Preserve generic identity-checked fallback for unknown exact project pages.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 184-184](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L184-L184)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-8e670265e0b8c69f845f"></a>
- [ ] **D-8e670265e0b8c69f845f** - Login-sensitive/private providers use the real persistent Chromium session rather than exporting cookies or bypassing access controls.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 185-185](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L185-L185)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 5. Launcher / Mod Manager / 5.1 External launcher discovery and in-place connection (3)</summary>

<a id="d-12e1b68d5106cddc1975"></a>
- [ ] **D-12e1b68d5106cddc1975** - Discover usable Modrinth profiles.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Launcher / Mod Manager / 5.1 External launcher discovery and in-place connection
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 234-234](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L234-L234)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-8f5b59b09fc00e810868"></a>
- [ ] **D-8f5b59b09fc00e810868** - Invalid/unavailable external instances remain untouched.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Launcher / Mod Manager / 5.1 External launcher discovery and in-place connection
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 240-240](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L240-L240)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-d051d746d152cb0b6de9"></a>
- [ ] **D-d051d746d152cb0b6de9** - Explicit clone/copy remains separate from connect.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Launcher / Mod Manager / 5.1 External launcher discovery and in-place connection
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 241-241](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L241-L241)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 6. Content management / 6.1 Provider-backed discovery/install (4)</summary>

<a id="d-a5153adfe3326b109212"></a>
- [ ] **D-a5153adfe3326b109212** - Dependency resolution.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.1 Provider-backed discovery/install
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 341-341](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L341-L341)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-50910873e11347cb8f1b"></a>
- [ ] **D-50910873e11347cb8f1b** - Download planning.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.1 Provider-backed discovery/install
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 342-342](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L342-L342)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-13e62d8efb614b4a7f42"></a>
- [ ] **D-13e62d8efb614b4a7f42** - Install planning.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.1 Provider-backed discovery/install
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 343-343](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L343-L343)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-64ab9c8dc80c18aa9fc2"></a>
- [ ] **D-64ab9c8dc80c18aa9fc2** - Conflict/dependency review.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.1 Provider-backed discovery/install
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 344-344](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L344-L344)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 23. Full CLI everywhere / 23.1 Global automation contract (1)</summary>

<a id="d-4396ee2a9ebb8ea0c89c"></a>
- [ ] **D-4396ee2a9ebb8ea0c89c** - machine-readable schema/version discovery
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.1 Global automation contract
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1028-1028](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1028-L1028)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 37. Implementation roadmap / Phase CLI-0 — shared CLI foundation (1)</summary>

<a id="d-6691dc1ba2ac1807773b"></a>
- [ ] **D-6691dc1ba2ac1807773b** - Add capabilities/schema discovery.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase CLI-0 — shared CLI foundation
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1487-1487](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1487-L1487)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 13. FIRST-CLASS LAUNCHER COMPLETENESS — MAKE ENDERLOOM FEEL FINISHED / 13.5 Mod behavior, side, vanilla-impact, and Forever World intelligence / 13.5.10 Classification must improve over time without becoming a babysitting task (1)</summary>

<a id="d-f76d1b71cc7c008537d7"></a>
- [ ] **D-f76d1b71cc7c008537d7** - - Provider metadata can seed it immediately. - Local static analysis upgrades it after download/install. - Trusted source analysis can refine it. - Runtime observations can refine ...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - Provider metadata can seed it immediately. - Local static analysis upgrades it after download/install. - Trusted source analysis can refine it. - Runtime observations can refine it further. - A world audit can produce instance-specific uninstall safety. - User corrections are allowed as an advanced override/reporting path, but the normal workflow must not depend on manual tagging.
  - **Binding context:** 13. FIRST-CLASS LAUNCHER COMPLETENESS — MAKE ENDERLOOM FEEL FINISHED / 13.5 Mod behavior, side, vanilla-impact, and Forever World intelligence / 13.5.10 Classification must improve over time without becoming a babysitting task
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 1178-1183](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L1178-L1183) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 1178-1183](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L1178-L1183)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 2. Favorites tab — first-class saved workspace / 2.1 Core behavior (1)</summary>

<a id="d-c5560901cf7526069d98"></a>
- [ ] **D-c5560901cf7526069d98** - Preserve canonical provider/source identity for every favorite.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.1 Core behavior
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 36-36](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L36-L36)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 2. Favorites tab — first-class saved workspace / 2.3 Favorite cards/rows (2)</summary>

<a id="d-b72a02a317c748570a2d"></a>
- [ ] **D-b72a02a317c748570a2d** - icon/media when real source media exists;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.3 Favorite cards/rows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 64-64](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L64-L64)

<a id="d-a028f49e2ef4d266add0"></a>
- [ ] **D-a028f49e2ef4d266add0** - provider/source;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.3 Favorite cards/rows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 65-65](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L65-L65)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 2. Favorites tab — first-class saved workspace / 2.4 Quick actions from Favorites (1)</summary>

<a id="d-9461ca1520a8f53a4c54"></a>
- [ ] **D-9461ca1520a8f53a4c54** - Open real source/provider page.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.4 Quick actions from Favorites
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 81-81](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L81-L81)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 2. Canonical Minecraft Knowledge Graph (1)</summary>

<a id="d-11be4bf8a89afff47cb8"></a>
- [ ] **D-11be4bf8a89afff47cb8** - UserNote/Favorite/Tag/Collection
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Canonical Minecraft Knowledge Graph
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 111-111](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L111-L111)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 4. Universal Project / Mod Detail Surface (1)</summary>

<a id="d-233b677ab0c7b490f270"></a>
- [ ] **D-233b677ab0c7b490f270** - Sources
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Universal Project / Mod Detail Surface
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 189-189](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L189-L189)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu (22)</summary>

<a id="d-f409dda86f91d6c89f0f"></a>
- [ ] **D-f409dda86f91d6c89f0f** - Modrinth
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 243-243](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L243-L243)

<a id="d-70d218a9378c0e22d992"></a>
- [ ] **D-70d218a9378c0e22d992** - GitHub
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 244-244](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L244-L244)

<a id="d-18986b6ce10f8a933dc0"></a>
- [ ] **D-18986b6ce10f8a933dc0** - GitLab
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 245-245](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L245-L245)

<a id="d-b7a21168bb48a17b28d0"></a>
- [ ] **D-b7a21168bb48a17b28d0** - Planet Minecraft
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 246-246](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L246-L246)

<a id="d-7f3631df0823878580e6"></a>
- [ ] **D-7f3631df0823878580e6** - MCPEDL
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 247-247](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L247-L247)

<a id="d-aabc4e29ca24d43844d5"></a>
- [ ] **D-aabc4e29ca24d43844d5** - ModBay
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 248-248](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L248-L248)

<a id="d-b36a20684a7e5d318e29"></a>
- [ ] **D-b36a20684a7e5d318e29** - Minecraft Marketplace
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 249-249](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L249-L249)

<a id="d-1b24f933c97a09e1867a"></a>
- [ ] **D-1b24f933c97a09e1867a** - AFDIAN
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 250-250](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L250-L250)

<a id="d-2f60e527ffac593eb514"></a>
- [ ] **D-2f60e527ffac593eb514** - Patreon
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 251-251](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L251-L251)

<a id="d-4180a4912b8e45741f5c"></a>
- [ ] **D-4180a4912b8e45741f5c** - Hangar
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 252-252](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L252-L252)

<a id="d-e3b31399e3981bbd8140"></a>
- [ ] **D-e3b31399e3981bbd8140** - SpigotMC
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 253-253](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L253-L253)

<a id="d-7cdc1dba1ff7ba1bb1d9"></a>
- [ ] **D-7cdc1dba1ff7ba1bb1d9** - Bukkit
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 254-254](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L254-L254)

<a id="d-1754e268daf299f8c5e2"></a>
- [ ] **D-1754e268daf299f8c5e2** - BuiltByBit
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 255-255](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L255-L255)

<a id="d-293204cc0582f0667154"></a>
- [ ] **D-293204cc0582f0667154** - Polymart
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 256-256](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L256-L256)

<a id="d-2e4b6e8518ff1c95171f"></a>
- [ ] **D-2e4b6e8518ff1c95171f** - ModDB
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 257-257](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L257-L257)

<a id="d-ca749f50f07ec3e8ae48"></a>
- [ ] **D-ca749f50f07ec3e8ae48** - Ko-fi
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 259-259](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L259-L259)

<a id="d-d14d799f8610700637f6"></a>
- [ ] **D-d14d799f8610700637f6** - itch.io
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 260-260](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L260-L260)

<a id="d-57ace513f68c40840bd1"></a>
- [ ] **D-57ace513f68c40840bd1** - BOOTH
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 261-261](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L261-L261)

<a id="d-23d370eb94ccd3df60bd"></a>
- [ ] **D-23d370eb94ccd3df60bd** - Gumroad
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 262-262](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L262-L262)

<a id="d-5cd6f8d9abdece9cb5c5"></a>
- [ ] **D-5cd6f8d9abdece9cb5c5** - creator homepage
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 263-263](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L263-L263)

<a id="d-440eef1f123de5797e70"></a>
- [ ] **D-440eef1f123de5797e70** - issue tracker
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 265-265](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L265-L265)

<a id="d-ee4a19fe10ef63011675"></a>
- [ ] **D-ee4a19fe10ef63011675** - Discord/community link when truly project-owned
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 267-267](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L267-L267)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 26. Shader / Render Pipeline Manager (1)</summary>

<a id="d-851b1443cb7ea0314664"></a>
- [ ] **D-851b1443cb7ea0314664** - Shader-pack discovery/install/update.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 26. Shader / Render Pipeline Manager
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1118-1118](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1118-L1118)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 35. CLI / API / CI parity (1)</summary>

<a id="d-0383d0871fa4d1120f3f"></a>
- [ ] **D-0383d0871fa4d1120f3f** - schemas/version discovery;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 35. CLI / API / CI parity
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1336-1336](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1336-L1336)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 4.2 Provider universe (23)</summary>

<a id="site-curseforge"></a>
- [ ] **SITE-curseforge** - CurseForge: preserve the provider family and prove the applicable exact-project, media-role, session and fallback contract in Master Requirements section 4.2.
  - **State:** unverified. **Kind:** named provider coverage.
  - **Binding context:** 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 152-152](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L152-L152)

<a id="site-modrinth"></a>
- [ ] **SITE-modrinth** - Modrinth: preserve the provider family and prove the applicable exact-project, media-role, session and fallback contract in Master Requirements section 4.2.
  - **State:** unverified. **Kind:** named provider coverage.
  - **Binding context:** 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 153-153](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L153-L153)

<a id="site-github"></a>
- [ ] **SITE-github** - GitHub: preserve the provider family and prove the applicable exact-project, media-role, session and fallback contract in Master Requirements section 4.2.
  - **State:** unverified. **Kind:** named provider coverage.
  - **Binding context:** 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 154-154](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L154-L154)

<a id="site-gitlab"></a>
- [ ] **SITE-gitlab** - GitLab: preserve the provider family and prove the applicable exact-project, media-role, session and fallback contract in Master Requirements section 4.2.
  - **State:** unverified. **Kind:** named provider coverage.
  - **Binding context:** 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 155-155](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L155-L155)

<a id="site-hangar"></a>
- [ ] **SITE-hangar** - Hangar: preserve the provider family and prove the applicable exact-project, media-role, session and fallback contract in Master Requirements section 4.2.
  - **State:** unverified. **Kind:** named provider coverage.
  - **Binding context:** 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 156-156](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L156-L156)

<a id="site-spigotmc"></a>
- [ ] **SITE-spigotmc** - SpigotMC: preserve the provider family and prove the applicable exact-project, media-role, session and fallback contract in Master Requirements section 4.2.
  - **State:** unverified. **Kind:** named provider coverage.
  - **Binding context:** 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 157-157](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L157-L157)

<a id="site-bukkit"></a>
- [ ] **SITE-bukkit** - Bukkit: preserve the provider family and prove the applicable exact-project, media-role, session and fallback contract in Master Requirements section 4.2.
  - **State:** unverified. **Kind:** named provider coverage.
  - **Binding context:** 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 158-158](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L158-L158)

<a id="site-builtbybit"></a>
- [ ] **SITE-builtbybit** - BuiltByBit: preserve the provider family and prove the applicable exact-project, media-role, session and fallback contract in Master Requirements section 4.2.
  - **State:** unverified. **Kind:** named provider coverage.
  - **Binding context:** 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 159-159](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L159-L159)

<a id="site-nexus-mods"></a>
- [ ] **SITE-nexus-mods** - Nexus Mods: preserve the provider family and prove the applicable exact-project, media-role, session and fallback contract in Master Requirements section 4.2.
  - **State:** unverified. **Kind:** named provider coverage.
  - **Binding context:** 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 160-160](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L160-L160)

<a id="site-moddb"></a>
- [ ] **SITE-moddb** - ModDB: preserve the provider family and prove the applicable exact-project, media-role, session and fallback contract in Master Requirements section 4.2.
  - **State:** unverified. **Kind:** named provider coverage.
  - **Binding context:** 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 161-161](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L161-L161)

<a id="site-polymart"></a>
- [ ] **SITE-polymart** - Polymart: preserve the provider family and prove the applicable exact-project, media-role, session and fallback contract in Master Requirements section 4.2.
  - **State:** unverified. **Kind:** named provider coverage.
  - **Binding context:** 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 162-162](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L162-L162)

<a id="site-planet-minecraft"></a>
- [ ] **SITE-planet-minecraft** - Planet Minecraft: preserve the provider family and prove the applicable exact-project, media-role, session and fallback contract in Master Requirements section 4.2.
  - **State:** unverified. **Kind:** named provider coverage.
  - **Binding context:** 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 163-163](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L163-L163)

<a id="site-mcpedl"></a>
- [ ] **SITE-mcpedl** - MCPEDL: preserve the provider family and prove the applicable exact-project, media-role, session and fallback contract in Master Requirements section 4.2.
  - **State:** unverified. **Kind:** named provider coverage.
  - **Binding context:** 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 164-164](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L164-L164)

<a id="site-modbay"></a>
- [ ] **SITE-modbay** - ModBay: preserve the provider family and prove the applicable exact-project, media-role, session and fallback contract in Master Requirements section 4.2.
  - **State:** unverified. **Kind:** named provider coverage.
  - **Binding context:** 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 165-165](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L165-L165)

<a id="site-afdian"></a>
- [ ] **SITE-afdian** - AFDIAN: preserve the provider family and prove the applicable exact-project, media-role, session and fallback contract in Master Requirements section 4.2.
  - **State:** unverified. **Kind:** named provider coverage.
  - **Binding context:** 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 166-166](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L166-L166)

<a id="site-patreon"></a>
- [ ] **SITE-patreon** - Patreon: preserve the provider family and prove the applicable exact-project, media-role, session and fallback contract in Master Requirements section 4.2.
  - **State:** unverified. **Kind:** named provider coverage.
  - **Binding context:** 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 167-167](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L167-L167)

<a id="site-minecraft-marketplace"></a>
- [ ] **SITE-minecraft-marketplace** - Minecraft Marketplace: preserve the provider family and prove the applicable exact-project, media-role, session and fallback contract in Master Requirements section 4.2.
  - **State:** unverified. **Kind:** named provider coverage.
  - **Binding context:** 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 168-168](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L168-L168)

<a id="site-booth"></a>
- [ ] **SITE-booth** - BOOTH: preserve the provider family and prove the applicable exact-project, media-role, session and fallback contract in Master Requirements section 4.2.
  - **State:** unverified. **Kind:** named provider coverage.
  - **Binding context:** 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 169-169](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L169-L169)

<a id="site-fourthwall"></a>
- [ ] **SITE-fourthwall** - Fourthwall: preserve the provider family and prove the applicable exact-project, media-role, session and fallback contract in Master Requirements section 4.2.
  - **State:** unverified. **Kind:** named provider coverage.
  - **Binding context:** 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 170-170](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L170-L170)

<a id="site-ko-fi"></a>
- [ ] **SITE-ko-fi** - Ko-fi: preserve the provider family and prove the applicable exact-project, media-role, session and fallback contract in Master Requirements section 4.2.
  - **State:** unverified. **Kind:** named provider coverage.
  - **Binding context:** 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 171-171](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L171-L171)

<a id="site-itch-io"></a>
- [ ] **SITE-itch-io** - itch.io: preserve the provider family and prove the applicable exact-project, media-role, session and fallback contract in Master Requirements section 4.2.
  - **State:** unverified. **Kind:** named provider coverage.
  - **Binding context:** 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 172-172](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L172-L172)

<a id="site-gumroad"></a>
- [ ] **SITE-gumroad** - Gumroad: preserve the provider family and prove the applicable exact-project, media-role, session and fallback contract in Master Requirements section 4.2.
  - **State:** unverified. **Kind:** named provider coverage.
  - **Binding context:** 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 173-173](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L173-L173)

<a id="site-alltheysm"></a>
- [ ] **SITE-alltheysm** - alltheysm: preserve the provider family and prove the applicable exact-project, media-role, session and fallback contract in Master Requirements section 4.2.
  - **State:** unverified. **Kind:** named provider coverage.
  - **Binding context:** 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 174-174](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L174-L174)

</details>

<a id="lib-02-details"></a>
## LIB-02 - Correct premium media and trailers

[Outcome](Checklist.md#lib-02) / 67 source-derived details.

<details>
<summary>README.md / Enderloom 2.9.5 / 2.9.5 CurseForge gallery terminal-state repair (1)</summary>

<a id="d-9bb70e2ecbd4c7cf5dab"></a>
- [ ] **D-9bb70e2ecbd4c7cf5dab** - - Fixes the persistent Bok&#x27;s Banging Butterflies failure exposed by the native Windows 2.9.4 test instead of treating the earlier fixture as proof. - Mirrors CurseForge&#x27;s...
  - **State:** unverified. **Kind:** documented behavior to preserve.
  - **Full requirement:** - Fixes the persistent Bok&#x27;s Banging Butterflies failure exposed by the native Windows 2.9.4 test instead of treating the earlier fixture as proof. - Mirrors CurseForge&#x27;s current live tab order: Description -&gt; Comments -&gt; Files -&gt; Gallery (N) -&gt; Relations -&gt; Issues. On an exact /gallery route those labels are navigation, not content boundaries, so they can no longer cut the owned gallery region before its attachment cards. - Adds a complete exact-gallery SSR lane through the same persistent Chromium session used by the catalog. The app no longer depends on hidden DOM hydration as the only way to recover all gallery items. - Adds an independent Node full-HTML exact-gallery fallback and keeps the existing Chromium DOM rescue, giving visible CurseForge cards three independent role-safe recovery paths. - Fixes the renderer cache short-circuit that treated a cached project icon + creator avatar as a complete media result. A missing gallery now still primes live discovery unless an explicit terminal galleryAbsent exists. - Bumps live-media cache to v14 so 2.9.4 icon/author-only results cannot pin upgraded cards in the blank state. - Native Electron self-test now reproduces the live Description/Files-before-Gallery and Relations-before-images topology and requires all eleven Bok-shaped attachments through both DOM and full-HTML Chromium paths with zero promo leakage. - No hard-coded Bok media is used by production code; the exact eleven URLs exist only in regression/self-test fixtures.
  - **Binding context:** Enderloom 2.9.5 / 2.9.5 CurseForge gallery terminal-state repair
  - **Original specification:** [README.md : 35-42](https://github.com/Herbertofury/Enderloom/blob/main/README.md#L35-L42)

</details>

<details>
<summary>README.md / Enderloom 2.9.5 / 2.9.4 exact CurseForge gallery DOM rescue (1)</summary>

<a id="d-dbca50c3311f9022716a"></a>
- [ ] **D-dbca50c3311f9022716a** - - Fixes the remaining real Windows failure where CurseForge&#x27;s project Gallery tab could be present and contain media while bounded HTTP/stream probes still returned no gallery...
  - **State:** unverified. **Kind:** documented behavior to preserve.
  - **Full requirement:** - Fixes the remaining real Windows failure where CurseForge&#x27;s project Gallery tab could be present and contain media while bounded HTTP/stream probes still returned no gallery. - Adds an exact same-project /gallery Chromium rescue for visible and near-visible CurseForge cards using the app&#x27;s persistent live browser session. The rescue waits only for authoritative ForgeCDN/CurseCDN attachment anchors to stabilize; it does not wait for remote image decoding. - Accepts direct attachment anchors on the exact gallery route even when the nested &lt;img&gt; is still a lazy placeholder and the anchor itself has no helpful CSS class. - Allows the exact same-project CurseForge Gallery navigation link through the DOM media-page resolver even when CurseForge places that tab inside &lt;nav&gt;. Generic navigation remains excluded. - Deep discovery synthesizes the exact same-project Gallery route as a fallback even if the canonical page&#x27;s DOM does not expose a usable gallery link. - Keeps promo/contest/ad/sponsor media outside the owned gallery boundary and preserves source-scoped empty-gallery fallback to canonical Description media. - Bumps live-media cache to v13 so prior blank CurseForge results are rediscovered. - Native Electron self-test now includes an 11-item lazy-placeholder CurseForge gallery fixture with a pre-H1 promotional attachment and requires all 11 project attachments with zero promo leakage.
  - **Binding context:** Enderloom 2.9.5 / 2.9.4 exact CurseForge gallery DOM rescue
  - **Original specification:** [README.md : 46-53](https://github.com/Herbertofury/Enderloom/blob/main/README.md#L46-L53)

</details>

<details>
<summary>README.md / Enderloom 2.9.5 / 2.9.3 CurseForge production gallery recovery + scoped fallback (1)</summary>

<a id="d-bde9ee239133fffe5f74"></a>
- [ ] **D-bde9ee239133fffe5f74** - - Recovers modern CurseForge gallery media when the authoritative full ForgeCDN/CurseCDN attachment is exposed by the wrapping link while the nested image is still a lazy placehold...
  - **State:** unverified. **Kind:** documented behavior to preserve.
  - **Full requirement:** - Recovers modern CurseForge gallery media when the authoritative full ForgeCDN/CurseCDN attachment is exposed by the wrapping link while the nested image is still a lazy placeholder. - Starts extraction at the first project-owned Gallery marker after the exact H1 instead of the last repeated /gallery link. - Treats an empty CurseForge /gallery as sourceGalleryAbsent, not a project-wide terminal negative, so canonical Description/post media still runs (the DivineRPG failure mode). - Recovers image-bearing GitHub/GitLab links inside the exact project Description and canonicalizes blob links to their raw media targets after identity/ownership checks. - Any real project-owned gallery result clears an older global or source-scoped negative instead of leaving the card stuck on stale &quot;no gallery&quot; state. - The renderer now reports Gallery tab empty — checking project post… while that canonical fallback is in flight. - Expands the progressive CurseForge first-media gate for direct attachment links without allowing global promotions, avatars, ads, or sponsor media to cross the project identity boundary. - Bumps the live discovery cache to v12 so stale empty/negative gallery results cannot mask newly recoverable media. - Includes a production-shaped 11-image Bok&#x27;s Banging Butterflies regression fixture using the live attachment topology.
  - **Binding context:** Enderloom 2.9.5 / 2.9.3 CurseForge production gallery recovery + scoped fallback
  - **Original specification:** [README.md : 57-65](https://github.com/Herbertofury/Enderloom/blob/main/README.md#L57-L65)

</details>

<details>
<summary>README.md / Enderloom 2.9.5 / 2.7.0 instant media ownership + role quarantine (1)</summary>

<a id="d-29b4af91f88c01bc09a7"></a>
- [ ] **D-29b4af91f88c01bc09a7** - - Fixes the remaining cross-role contamination path. Project icon, creator avatar and gallery media are now separate semantic lanes all the way through provider parsing, cache sani...
  - **State:** unverified. **Kind:** documented behavior to preserve.
  - **Full requirement:** - Fixes the remaining cross-role contamination path. Project icon, creator avatar and gallery media are now separate semantic lanes all the way through provider parsing, cache sanitization, main-process merging and renderer merging. The same URL cannot survive in multiple roles; ambiguous collisions are quarantined instead of being painted. - Hardens CurseForge against global promotions, tier frames and “More from” siblings. A project image must be bound to the exact project H1/project entry, a creator avatar must be bound to the exact member/profile identity, and gallery media must come from the exact project gallery/description region. A definitive “This mod has no gallery items available” is delivered as a real negative state instead of an endless spinner. - Adds the creator-project index fast lane: one exact CurseForge author Projects page can provide the exact creator avatar plus each exact project logo, and duplicate cards sharing that author single-flight the physical author-page request. ForgeCDN 256 px project-logo previews are used for first paint while the full original URL is retained for source/open behavior. - Removes two artificial renderer startup floors. Live prime now begins on the next microtask rather than a 90 ms timer, and live network discovery starts in parallel with the all-catalog persistent-cache IPC batch instead of waiting for that entire batch to finish. Cache work is preserved and can still win the paint race. - Raises the real media-prime execution frontier to up to 3x logical CPUs (bounded at 128 concurrent jobs) and prewarms eight Chromium media views. The native transport stress gate now runs 192 simultaneous real localhost HTTP streams and requires all 192 to be concurrently active at the server. - Adds instant-frontier-qa.js, a real localhost streaming benchmark with the same 90 ms cache-hydration workload on both sides. The release requires the overlapped path to eliminate the barrier without dropping the cache work. - Keeps all 23 provider families, full uncapped gallery enrichment, full-resolution originals, persistent Chromium session/cache, Rust wreq/Impit transports, uBlock Origin and the integrated auto-updating TWP translator. No project/source/gallery cap or generated replacement imagery is introduced.
  - **Binding context:** Enderloom 2.9.5 / 2.7.0 instant media ownership + role quarantine
  - **Original specification:** [README.md : 79-85](https://github.com/Herbertofury/Enderloom/blob/main/README.md#L79-L85)

</details>

<details>
<summary>README.md / Enderloom 2.9.5 / 2.5.0 universal provider fast lane + measured bandwidth-tail suppression (1)</summary>

<a id="d-562c93c0d756e68a2411"></a>
- [ ] **D-562c93c0d756e68a2411** - - Promotes the live-media pipeline from a CurseForge-heavy optimizer to a 23-family provider capability registry covering CurseForge, Modrinth, GitHub, GitLab, Hangar, SpigotMC, Bu...
  - **State:** unverified. **Kind:** documented behavior to preserve.
  - **Full requirement:** - Promotes the live-media pipeline from a CurseForge-heavy optimizer to a 23-family provider capability registry covering CurseForge, Modrinth, GitHub, GitLab, Hangar, SpigotMC, Bukkit, BuiltByBit, Nexus Mods, ModDB, Polymart, Planet Minecraft, MCPEDL, ModBay, AFDIAN, Patreon, Minecraft Marketplace, BOOTH, Fourthwall, Ko-fi, itch.io, Gumroad, and alltheysm. Unknown exact project pages still retain the identity-checked generic OG/JSON-LD/Chromium fallback. - Adds exact child resolution for Patreon creator pages/posts, AFDIAN creator products, Minecraft Marketplace PDPs, Ko-fi shop items, itch.io creator pages, and Gumroad product pages. Collection/profile hero art is never silently borrowed as project media. - Adds tiny public metadata seed lanes where the provider ecosystem exposes them: Spigot exact resources can use Spiget&#x27;s public resource icon metadata, Hangar exact projects use the public Hangar project API/avatar, and GitLab exact projects can use the public project avatar field. These seeds only accelerate the first real icon; the canonical project page still performs full, uncapped live gallery enrichment. - Adds first-class identity/media rules for Hangar, SpigotMC, Bukkit, Nexus Mods, ModDB, GitLab, Polymart, and BuiltByBit. BuiltByBit is deliberately browser-navigation-only without an official authenticated API token: the app will use the real persistent Chromium page rather than inventing a scraper bypass. - Removes the old quick-source score window: every canonical provider source home is admitted to first-image prime. Provider scoring may order metadata, but it no longer excludes Patreon/AFDIAN/PMC/Bedrock/other homes from the live race. - Adds a provider-adaptive transport policy based on real socket measurements instead of assuming every abort saves bandwidth. The audit found that pooled wreq and impit can return a logical first-media abort while continuing to drain the network body for connection reuse. 2.5 therefore stops spraying those native transports across every provider page: wreq remains a real complementary CurseForge keeper, and impit HTTP/3 remains a visible-card specialty hedge. - Makes redundant Node streams physically terminate after the first complete trusted media URL and makes provider collection streams stop after the exact-child prefix. Chromium uses the same bounded body-reader cancellation path in the production Electron session. One complete response remains for uncapped enrichment, so this is bandwidth elimination rather than gallery truncation. - Expands startup connection hints to the real media origins used by ForgeCDN, Modrinth, GitHub/GitLab, Hangar, SpigotMC, Bukkit, Nexus Mods, ModDB, Polymart, BuiltByBit, PMC, MCPEDL, ModBay, AFDIAN, Patreon, Minecraft/Microsoft Marketplace media, BOOTH, Fourthwall, Ko-fi and itch. Discovered image origins are still added dynamically. - Adds provider-universe and current-catalog coverage gates. The built-in catalogs currently contain 605 records and 759 source URLs across 10 provider families, all classified by the first-class registry; the registry itself has 23 first-class provider families. - Adds hedged-bandwidth-qa.js, a real TCP-stream benchmark. Its release fixture compares the former three-complete-response behavior with the new keeper + physical-probe policy over a deliberately slow 1 MiB tail and requires a large byte reduction without regressing first-media readiness. The same test explicitly audits wreq/impit cancellation behavior so a future change cannot accidentally reintroduce hidden native tail drains. - Patreon/AFDIAN/login-sensitive discovery stays credential-safe: the persistent Chromium partition is the complete-response authority. The app does not export cookies into catalog data, and public native/Node paths do not bypass paid/private access. - No gallery cap, project cap, source cap, synthetic image substitution, viewport record culling, or downgrade of full-original hover/lightbox media was introduced.
  - **Binding context:** Enderloom 2.9.5 / 2.5.0 universal provider fast lane + measured bandwidth-tail suppression
  - **Original specification:** [README.md : 98-109](https://github.com/Herbertofury/Enderloom/blob/main/README.md#L98-L109)

</details>

<details>
<summary>README.md / Enderloom 2.9.5 / 2.4.0 same-session paint acceleration + fourth native transport (1)</summary>

<a id="d-03c1b12e2bb61921f44c"></a>
- [ ] **D-03c1b12e2bb61921f44c** - - Fixes a hidden cross-session performance bug: the catalog renderer now uses the same persistent Chromium session partition as live discovery. Provider preconnect, DNS/TLS/H2/H3 s...
  - **State:** unverified. **Kind:** documented behavior to preserve.
  - **Full requirement:** - Fixes a hidden cross-session performance bug: the catalog renderer now uses the same persistent Chromium session partition as live discovery. Provider preconnect, DNS/TLS/H2/H3 state, cookies, and HTTP cache warming therefore benefit the actual card &lt;img&gt; requests instead of being stranded in a different Chromium session. - Starts the real preview-byte request before IPC paint for visible and near-visible cards. The provider-discovered preview is consumed through Electron session.fetch on the shared partition, allowing the renderer image request to coalesce with or hit the warmed Chromium HTTP cache. Full-original hover/lightbox URLs remain unchanged. - Adds a fourth independent network implementation using the official Apify impit 0.14.4 native Rust binding. The shipped client uses Chrome 151 impersonation; HTTP/3 is enabled, with a QUIC-only exact CurseForge /gallery hedge for immediately visible cards while all existing Node, Chromium, and wreq paths remain available. - Exact CurseForge gallery streams can now seed the first real ForgeCDN image directly from the completed streamed URL before the full HTML parser runs. wreq, Chromium, and impit gallery lanes all use this safe exact-project shortcut; background full HTML continues for the uncapped gallery. - Replaces growing-response rescans with rolling chunk scanners in Node, Chromium, and wreq. This removes repeated cumulative regex work and repeated Rust Buffer.concat allocations from the hot streaming path. Media readiness can now fire from 128 bytes once a complete trusted URL is present. - Adds real native impit streaming QA and a 144-socket multi-transport stress gate. The Linux QA binding and Windows release binding are the upstream GitHub Actions artifacts, verified against GitHub&#x27;s published artifact SHA-256 digests. - Starts provider/CDN connection establishment from the persisted live-media metadata cache before Catalog IPC and DOM upgrade work begins. Every cached record remains represented; only duplicate origins are coalesced into connection hints. - Caches each project&#x27;s primary media DOM slot and last computed screen priority so gallery/icon/author updates stop repeating selector scans and forced layout reads on the first-image path. - No gallery cap, project cap, synthetic media, viewport record culling, or downgrade of full-resolution hover/lightbox behavior was introduced.
  - **Binding context:** Enderloom 2.9.5 / 2.4.0 same-session paint acceleration + fourth native transport
  - **Original specification:** [README.md : 113-121](https://github.com/Herbertofury/Enderloom/blob/main/README.md#L113-L121)

</details>

<details>
<summary>README.md / Enderloom 2.9.5 / 2.3.0 streamed-media latency removal (1)</summary>

<a id="d-a8e9e06a8d58e46f4bf0"></a>
- [ ] **D-a8e9e06a8d58e46f4bf0** - - Replaces the last arbitrary byte-threshold wait in first-image discovery with a content-sensitive media gate. Node, Chromium, and native Rust now resolve a dedicated media phase ...
  - **State:** unverified. **Kind:** documented behavior to preserve.
  - **Full requirement:** - Replaces the last arbitrary byte-threshold wait in first-image discovery with a content-sensitive media gate. Node, Chromium, and native Rust now resolve a dedicated media phase the moment the streamed HTML contains a complete trusted provider image URL instead of waiting for a 448-768 KiB prefix or EOF. The same physical request still continues to full HTML for uncapped gallery enrichment. - Fixes the native Rust head bug found by real socket testing: the 2.2 Rust lane waited for its byte threshold on small streamed pages even after &lt;/head&gt; arrived. 2.3 detects &lt;/head&gt; while chunks are still arriving, matching the fast Node/Chromium head behavior. - Adds an exact CurseForge /gallery SSR race. Native Rust starts the project-owned gallery route in parallel with the canonical page; visible/near-visible cards also race Chromium against that gallery route. The canonical page is still retained and full enrichment is never capped. - Teaches the CurseForge parser to trust the bounded project-owned SSR gallery strip before Description and to preserve the provider&#x27;s small ForgeCDN thumbnail as the card preview while upgrading the hover/lightbox URL to the full original attachment. - Makes the offscreen Chromium DOM path a real hedge: visible cards start it at 0 ms, near-viewport cards at 45 ms, and farther cards at 120 ms. Four WebContentsView instances are prewarmed during boot so visible cards do not pay view construction on the first request. - Widens the native Rust transport to a 192-connection pool with 48 idle connections per host, increases Chromium preconnect sockets on WAF-sensitive providers, and immediately preconnects the discovered image CDN before the media IPC payload reaches the renderer. - Removes the renderer&#x27;s 12 ms prime timer; the initial global media batch is now admitted on the next microtask. No project record, source, image, or gallery result cap was added. - Adds executable progressive-media-qa.js and media-stress-qa.js. The release gate now measures real streamed localhost HTTP sockets through the actual Node and vendored Rust transports, verifies parseable CurseForge SSR media arrives before a deliberately slow response tail, and stress-races 128 simultaneous real HTTP streams without serializing the first-media frontier.
  - **Binding context:** Enderloom 2.9.5 / 2.3.0 streamed-media latency removal
  - **Original specification:** [README.md : 125-132](https://github.com/Herbertofury/Enderloom/blob/main/README.md#L125-L132)

</details>

<details>
<summary>README.md / Enderloom 2.9.5 / 2.2.0 true parallel native live-media transport (1)</summary>

<a id="d-20bec01ef39065303791"></a>
- [ ] **D-20bec01ef39065303791** - - Replaces the remaining WAF-sensitive single-transport bottleneck with three real simultaneous network engines per exact provider page: pooled Node core HTTP, Electron session.fet...
  - **State:** unverified. **Kind:** documented behavior to preserve.
  - **Full requirement:** - Replaces the remaining WAF-sensitive single-transport bottleneck with three real simultaneous network engines per exact provider page: pooled Node core HTTP, Electron session.fetch() on Chromium&#x27;s native network service, and a vendored wreq-js 3.2.0 Rust/BoringSSL N-API binding. All three start at t=0; none waits for another transport to time out. - The Rust lane is shipped, not theoretical. Official x86_64 Windows and Linux GNU native bindings from the upstream wreq-js v3.2.0 GitHub Actions build are vendored with their MIT license. The app selects the newest native Chrome profile available (currently Chrome 149), holds a persistent cookie session, and reuses a 96-connection transport pool with up to 24 idle connections per host. - Rust responses are streamed with readBodyChunk: provider &lt;head&gt; and early-body prefixes can paint a real off-site image before the tail of the document finishes. The same one physical response continues in the background for the full uncapped gallery, so first paint is no longer coupled to full-page completion. - Adds Chromium session.preconnect() origin warmup and direct session.fetch() SSR acquisition. If all compact transports are still silent after 180 ms, a pooled offscreen Chromium page launches concurrently and extracts on dom-ready without waiting for fonts, analytics, ads, or the full load event. - Removes alternate-source startup staggering: canonical sources and all available network engines enter the race in the same turn. Existing single-flight/cache identity guarantees remain, so duplicate consumers share provider responses instead of multiplying physical requests. - Adds executable rust-native-qa.js. Its delayed local streaming fixture verifies the real Rust native module loads, three concurrent consumers collapse to one physical request, an OG image is visible from the early stream before the delayed document tail, and the full body still completes without truncation. - No image/gallery cap, no synthetic media, no viewport record culling, and no replacement of full-original hover/lightbox URLs were introduced.
  - **Binding context:** Enderloom 2.9.5 / 2.2.0 true parallel native live-media transport
  - **Original specification:** [README.md : 136-142](https://github.com/Herbertofury/Enderloom/blob/main/README.md#L136-L142)

</details>

<details>
<summary>README.md / Enderloom 2.9.5 / 2.1.0 frontier-first live image scheduler (1)</summary>

<a id="d-3b306e7e0c82babf834b"></a>
- [ ] **D-3b306e7e0c82babf834b** - - Fixes the remaining catalog-wide first-paint stall at the scheduler boundary. Prime requests are now sorted in the renderer, admitted to the main-process queue as one atomic batc...
  - **State:** unverified. **Kind:** documented behavior to preserve.
  - **Full requirement:** - Fixes the remaining catalog-wide first-paint stall at the scheduler boundary. Prime requests are now sorted in the renderer, admitted to the main-process queue as one atomic batch, and only then dispatched. A visible card registered late can no longer sit behind the first worker-count worth of registration-order cards. - Adds provider-aware source ordering without discarding anything: deterministic GitHub repository previews and Modrinth bulk/API hits lead, exact project homes follow, and collection/auxiliary routes enrich afterward. Every exact source remains available to the uncapped deep/gallery pass. - Keeps progressive single-request head/prefix/full parsing, context-aware cache v7, single-flight raw-document reuse, DNS reuse, Modrinth bulk hydration, protected Chromium deep fallback, and full-original hover/lightbox behavior. - Tightens image-byte scheduling after discovery: visible images retain fetchPriority=high; near-frontier discovered images start eagerly; farthest rows stay low/lazy so Chromium&#x27;s priority signal remains useful instead of turning every image into a high-priority request storm. - Adds frontier-priority-qa.js to release QA. It gates provider-aware source ordering, full-batch admission-before-pump, renderer priority sorting, near/far image loading policy, and the no-gallery-cap invariant. - The implementation follows current priority-queue, browser Priority Hints, and Node keep-alive pooling guidance while remaining dependency-free in the packaged runtime.
  - **Binding context:** Enderloom 2.9.5 / 2.1.0 frontier-first live image scheduler
  - **Original specification:** [README.md : 146-151](https://github.com/Herbertofury/Enderloom/blob/main/README.md#L146-L151)

</details>

<details>
<summary>README.md / Enderloom 2.9.5 / 2.0.12 provider-native bulk prime hardening (1)</summary>

<a id="d-68e7a159c33a4e1482cb"></a>
- [ ] **D-68e7a159c33a4e1482cb** - - Extends the 2.0.11 progressive first-image frontier with Modrinth&#x27;s official bulk GET /projects?ids=[…] endpoint. Every unique Modrinth project in the catalog is primed toge...
  - **State:** unverified. **Kind:** documented behavior to preserve.
  - **Full requirement:** - Extends the 2.0.11 progressive first-image frontier with Modrinth&#x27;s official bulk GET /projects?ids=[…] endpoint. Every unique Modrinth project in the catalog is primed together in encoded-URL-size transport chunks, preserving all projects, icons, and gallery entries while removing per-card project API round trips. - Keeps author/team enrichment off the first-image critical path; rich creator data and full gallery enrichment still continue afterward with no result or gallery truncation. - Adds release QA that feeds 400 synthetic Modrinth project slugs through the bulk chunker and proves every project is preserved in order across transport chunks.
  - **Binding context:** Enderloom 2.9.5 / 2.0.12 provider-native bulk prime hardening
  - **Original specification:** [README.md : 155-157](https://github.com/Herbertofury/Enderloom/blob/main/README.md#L155-L157)

</details>

<details>
<summary>README.md / Enderloom 2.9.5 / 2.0.11 ultra-fast live-media frontier (1)</summary>

<a id="d-b997a8b23ebc9c8d3366"></a>
- [ ] **D-b997a8b23ebc9c8d3366** - - Fixes the largest warm-start media bug: persistent discovery cache is now keyed by source URL + exact project identity, so multiple catalog entries that share a Planet Minecraft ...
  - **State:** unverified. **Kind:** documented behavior to preserve.
  - **Full requirement:** - Fixes the largest warm-start media bug: persistent discovery cache is now keyed by source URL + exact project identity, so multiple catalog entries that share a Planet Minecraft collection, creator page, or other index URL no longer evict one another. In the two built-in catalogs, 148 rows participate in duplicated/index-style project URLs, including 42 Mob Girl rows on one PMC collection. - Replaces hundreds of per-card cache IPC calls with one batched catalog hydrate, then launches an all-project priority first-image frontier. Visible/near-visible cards are reprioritized immediately; no project, source, gallery, or result count is capped. - Adds Spider/Crawlee-style single-flight raw provider requests and a short-lived 64 MiB byte-budgeted document cache. Dozens of project identities that share one provider index reuse the same physical response while preserving independent identity parsing and persistent project-scoped results. - Adds a three-gate progressive HTTP path: trusted project &lt;head&gt; media can paint as soon as &lt;/head&gt; arrives, provider collection/index child links can resolve from an early body prefix, and the same physical response continues into full uncapped provider/gallery parsing. Slow alternate sources merge progressively instead of holding the first good image behind Promise.all. - Adds TTL DNS reuse with in-flight coalescing, Happy-Eyeballs address selection, wider keep-alive socket pools, early CDN DNS/preconnect hints, viewport-aware fetchPriority, and live provider thumbnail URLs where a provider exposes a smaller derivative. Hover/lightbox still opens the original full live image. - Deep Chromium discovery now uses a reusable protected media-view pool and yields to missing first-image HTTP/API work. Rich gallery/author enrichment remains uncapped and automatically continues after the fast image frontier or on hover/detail/lightbox. - GitHub projects can paint from the deterministic live repository OpenGraph endpoint and owner avatar without waiting for a full github.com document; Modrinth&#x27;s first-image path no longer waits on optional team/author enrichment. - Modrinth now primes through its official bulk GET /projects?ids=[…] API: all Modrinth projects in the current catalog are transport-chunked by URL size and hydrated together, while every project gallery/icon remains intact and rich author/team enrichment continues afterward. - Deterministic media-performance QA proves 32 concurrent identical consumers collapse to one GET; early head and collection-prefix readiness beat delayed full bodies while sharing the same request; cache v7, batched IPC, quick-before-deep scheduling, progressive painting, and no-gallery-cap invariants are release-gated.
  - **Binding context:** Enderloom 2.9.5 / 2.0.11 ultra-fast live-media frontier
  - **Original specification:** [README.md : 161-169](https://github.com/Herbertofury/Enderloom/blob/main/README.md#L161-L169)

</details>

<details>
<summary>README.md / Enderloom 2.9.5 / 2.0.9 provider-identity media + uBlock Origin + hit-safe zoom (1)</summary>

<a id="d-15dcd57fac958b8d055a"></a>
- [ ] **D-15dcd57fac958b8d055a** - - Replaces generic non-CurseForge image harvesting with provider-aware project identity. Planet Minecraft collection URLs are now treated as indexes: the catalog title is matched a...
  - **State:** unverified. **Kind:** documented behavior to preserve.
  - **Full requirement:** - Replaces generic non-CurseForge image harvesting with provider-aware project identity. Planet Minecraft collection URLs are now treated as indexes: the catalog title is matched against child project links, the exact child project is fetched, and only that project page can supply gallery/icon media. Collection neighbors, More like this, recommendations, comments, avatars, ads, and site chrome are rejected. - Adds scoped exact-project extraction for MCPEDL, ModBay, Fourthwall product pages, BOOTH, AFDIAN, and GitHub/other identity-checked sources. Known provider pages can become authoritative so the generic Chromium crawler does not contaminate a good provider result. - Fixes a latent media bug where a missing social-image meta value could resolve to the page URL itself and be treated as an image. Live-media discovery cache is bumped to v6 so older ambiguous Planet Minecraft/non-CurseForge results are ignored and rediscovered with the new identity policy. - Integrates the official uBlock Origin 1.74.0 Chromium MV2 bundle into the persistent live-browser session. A compatibility layer fills Electron APIs uBO expects without replacing Electron&#x27;s native webRequest/storage/runtime support. uBO keeps its normal filter-asset updater, while the app checks official gorhill/uBlock GitHub releases every six hours and stages newer Chromium packages for the next restart. The bottom status bar exposes the active uBO version and the More menu has an explicit update check. - Keeps hover magnification and the gallery lightbox exactly in place while fixing the click blocker: the transparent full-image zoom layer no longer receives pointer events, explicit Favorite/Compare/action controls stay above it, and background image clicks are delegated to zoom only when the click did not originate from an interactive control. - Preserves 2.0.8 native modal isolation, ByteString-safe Node transport, protected top/bottom chrome, browser input focus, native draggable 18px split rail, uncapped live galleries, and real off-site provider/CDN image URLs.
  - **Binding context:** Enderloom 2.9.5 / 2.0.9 provider-identity media + uBlock Origin + hit-safe zoom
  - **Original specification:** [README.md : 181-186](https://github.com/Herbertofury/Enderloom/blob/main/README.md#L181-L186)

</details>

<details>
<summary>README.md / Enderloom 2.9.5 / 2.0.8 ByteString elimination + native modal isolation (1)</summary>

<a id="d-1d11b7eaec22c8684b45"></a>
- [ ] **D-1d11b7eaec22c8684b45** - - Eliminates the remaining Electron session.fetch/Undici crash path. Authenticated Google Sheet/Doc/Drive refresh now reads the existing cookies from persist:minecraft-catalog-live...
  - **State:** unverified. **Kind:** documented behavior to preserve.
  - **Full requirement:** - Eliminates the remaining Electron session.fetch/Undici crash path. Authenticated Google Sheet/Doc/Drive refresh now reads the existing cookies from persist:minecraft-catalog-live and performs the HTTP transfer with pooled Node http/https, so third-party response headers never pass through Electron&#x27;s Fetch Headers ByteString conversion. Login/session continuity is preserved because the browser cookie jar remains authoritative. - Adds a malformed-response-header regression that reproduces the exact U+2014 / 8212 failure class and verifies both public media and authenticated Google-source transport survive it. - Applies the approved blur fix at the source: site permissions now use Electron native message boxes, Catalog Center runs in its own child BrowserWindow, and clear-live-data confirmation is native. The protected top chrome has a hard 430px utility cap and can no longer expand to full-window size. - Removes the top-shell HTML &lt;dialog&gt; surfaces and their blurred backdrop. A safety CSS rule keeps any future dialog backdrop blur-free. Permission choices remain Block / Allow once / Allow this session, and focus is restored to the requesting site after the native prompt closes. - Preserves the 2.0.7 native 18px split rail and accelerated cached-first/live-only media pipeline without adding gallery caps, fabricated media, static screenshots, or embedded image payloads.
  - **Binding context:** Enderloom 2.9.5 / 2.0.8 ByteString elimination + native modal isolation
  - **Original specification:** [README.md : 190-194](https://github.com/Herbertofury/Enderloom/blob/main/README.md#L190-L194)

</details>

<details>
<summary>README.md / Enderloom 2.9.5 / 2.0.7 transport + native split + live-media acceleration (1)</summary>

<a id="d-1c3ae7db7e3ae69fed7a"></a>
- [ ] **D-1c3ae7db7e3ae69fed7a** - - Introduced pooled Node http/https for public project/media discovery and the protected native splitter. 2.0.8 extends that ByteString-safe transport to authenticated Google-sourc...
  - **State:** unverified. **Kind:** documented behavior to preserve.
  - **Full requirement:** - Introduced pooled Node http/https for public project/media discovery and the protected native splitter. 2.0.8 extends that ByteString-safe transport to authenticated Google-source refresh as well. - Replaced the obscured DOM splitter with a dedicated protected native splitter WebContentsView, preserving the 18px hit lane while making the full divider draggable above both native panes. Drag uses stable screen coordinates; double-click resets 50/50; right-click/Enter swaps; arrows/Home/End resize; ratio persists. - Live preview discovery remains real off-site HTTP(S) media only. Cached URLs paint first, visible/near-visible cards get priority, public HTTP uses keep-alive pooled sockets, alternate project sources resolve in parallel, and deep Chromium crawling is deferred to stale/rich refresh or user interaction. Gallery/source-image counts are not truncated by the old 24-image cap.
  - **Binding context:** Enderloom 2.9.5 / 2.0.7 transport + native split + live-media acceleration
  - **Original specification:** [README.md : 198-200](https://github.com/Herbertofury/Enderloom/blob/main/README.md#L198-L200)

</details>

<details>
<summary>README.md / Enderloom 2.9.5 / 2.0.6 browser-input + bottom-edge + media-latency repair (1)</summary>

<a id="d-4b4902e06e43fd49490e"></a>
- [ ] **D-4b4902e06e43fd49490e** - - Fixed the real text-field regression from 2.0.4: the chrome guard was relaying out the active remote WebContentsView when it gained focus, and the old layout path hid/re-showed t...
  - **State:** unverified. **Kind:** documented behavior to preserve.
  - **Full requirement:** - Fixed the real text-field regression from 2.0.4: the chrome guard was relaying out the active remote WebContentsView when it gained focus, and the old layout path hid/re-showed that view. A page input could receive your click and then immediately lose DOM focus. Attached active views are now resized in place and never hidden/re-shown during focus/layout guards. - Remote focus and the root-shell blur event now use paint-only guards. They no longer invoke the full native-view layout routine. The dedicated topmost chrome view stays intact without stealing focus from Twitch/Google/CurseForge login/search fields. - Site permission prompts now remember the requesting webContents and explicitly restore focus to that page after Block / Allow once / Allow this session. Catalog Center and browser-data dialogs also hand focus back to the active content after closing. - Normal browser pages now extend to the actual bottom edge instead of reserving the old 28 px BrowserWindow status strip. The status strip is kept only for the full Catalog view, removing the dark/blurred-looking band seen under websites. - Live media is still actual off-site HTTP(S) media only, but startup is substantially lighter: per-project cache reads are deduplicated, visible/near-visible cards are prioritized with IntersectionObserver, quick provider/HTML metadata uses up to 10 lightweight jobs, and expensive offscreen Chromium gallery/profile discovery is limited to 2 deep jobs and prioritized for hover/detail/lightbox use. - Discovery metadata stays cached for 24 hours while the image URLs themselves remain live provider/CDN URLs. Cached cards paint immediately; deep refresh remains available from the gallery and broken URLs still trigger a live re-resolution.
  - **Binding context:** Enderloom 2.9.5 / 2.0.6 browser-input + bottom-edge + media-latency repair
  - **Original specification:** [README.md : 220-225](https://github.com/Herbertofury/Enderloom/blob/main/README.md#L220-L225)

</details>

<details>
<summary>README.md / Enderloom 2.9.5 / 2.0.4 native control-plane isolation (1)</summary>

<a id="d-4f0461d943164873eb20"></a>
- [ ] **D-4f0461d943164873eb20** - - Replaced the vulnerable BrowserWindow-only toolbar with a second, dedicated WebContentsView that renders the same titlebar/tab strip/address bar as a topmost native sibling surfa...
  - **State:** unverified. **Kind:** documented behavior to preserve.
  - **Full requirement:** - Replaced the vulnerable BrowserWindow-only toolbar with a second, dedicated WebContentsView that renders the same titlebar/tab strip/address bar as a topmost native sibling surface. - Every live website/catalog content view is now explicitly stacked underneath that control surface. Creating a tab cannot overtake the toolbar even if Windows gives the remote Chromium child surface a stale full-window hit region. - The top control view starts at exactly 94 px and expands only when Find, Downloads, More, permission prompts, confirmation prompts, or Catalog Center need additional UI. - Remote site bounds, 1.2 → 2.x browser-session continuity, the 18 px split lane, and all 2.0.1+ live off-site gallery/author-media behavior are preserved. - The older repaint/background-throttling guards remain as defense in depth, but UI availability no longer depends on the BrowserWindow renderer winning composition against a website child view.
  - **Binding context:** Enderloom 2.9.5 / 2.0.4 native control-plane isolation
  - **Original specification:** [README.md : 229-233](https://github.com/Herbertofury/Enderloom/blob/main/README.md#L229-L233)

</details>

<details>
<summary>README.md / Enderloom 2.9.5 / 2.0.3 native browser chrome compositor fix (1)</summary>

<a id="d-bacf34756004177acd3a"></a>
- [ ] **D-bacf34756004177acd3a** - - Fixed the separate new-tab failure where a newly focused remote WebContentsView could leave the BrowserWindow shell renderer blank/unpainted on Windows even though the remote pag...
  - **State:** unverified. **Kind:** documented behavior to preserve.
  - **Full requirement:** - Fixed the separate new-tab failure where a newly focused remote WebContentsView could leave the BrowserWindow shell renderer blank/unpainted on Windows even though the remote page itself was correctly clipped below the 94 px chrome boundary. - The shell renderer now keeps background throttling disabled and explicitly invalidates/repaints after native-view focus/navigation handoffs, without stealing focus from the web page. - New remote views are born hidden inside the safe content region, sized to their final bounds before attachment, and only then revealed. This prevents a transient full-window native child/hit-test surface during tab creation. - Tab switching no longer removes and re-adds every native view. Views remain attached and are visibility-switched, avoiding native z-order/input-region churn while preserving the 18 px split lane and existing tab/session behavior. - The 2.0.1 live off-site media contract and the 2.0.2 non-blurring drag indicator are unchanged.
  - **Binding context:** Enderloom 2.9.5 / 2.0.3 native browser chrome compositor fix
  - **Original specification:** [README.md : 237-241](https://github.com/Herbertofury/Enderloom/blob/main/README.md#L237-L241)

</details>

<details>
<summary>README.md / Enderloom 2.9.5 / 2.0.1 live off-site media fix (1)</summary>

<a id="d-6f47e5e3b9a1e6cc12da"></a>
- [ ] **D-6f47e5e3b9a1e6cc12da** - - Catalog galleries, project icons, and author avatars are live off-site media only. The app caches discovery metadata and source URLs for speed, but displayed image URLs continue ...
  - **State:** unverified. **Kind:** documented behavior to preserve.
  - **Full requirement:** - Catalog galleries, project icons, and author avatars are live off-site media only. The app caches discovery metadata and source URLs for speed, but displayed image URLs continue to point to the real mod/provider/creator site or its CDN. - Embedded/base64/static gallery payloads and page-screenshot fallbacks are not used. Modrinth uses its live project/team API where possible; other providers are resolved through the persistent internal Chromium session, including gallery/media subpages and creator profiles. - Every media slot supports source refresh. Gallery images, project icons, and creator avatars support full hover zoom; project galleries also open in a thumbnail lightbox with previous/next navigation and direct source/image actions. - Exact alternate provider homes are tried when a primary page cannot expose enough media. Failed image URLs are discarded and refreshed instead of being permanently cached as blank cards.
  - **Binding context:** Enderloom 2.9.5 / 2.0.1 live off-site media fix
  - **Original specification:** [README.md : 252-255](https://github.com/Herbertofury/Enderloom/blob/main/README.md#L252-L255)

</details>

<details>
<summary>README.md / Enderloom 2.9.5 / Browser/catalog QoL (1)</summary>

<a id="d-ea91201c424db30996c7"></a>
- [ ] **D-ea91201c424db30996c7** - - Back / forward / reload-stop / address search - New, close, and reopen browser tabs - Persistent live-site cookies and sessions - Find in page and zoom - Visible download state -...
  - **State:** unverified. **Kind:** documented behavior to preserve.
  - **Full requirement:** - Back / forward / reload-stop / address search - New, close, and reopen browser tabs - Persistent live-site cookies and sessions - Find in page and zoom - Visible download state - Site permissions: Block, Allow once, and a real Allow this session remembered by origin + permission until app exit or live-site data is cleared - Session/tab/split restore - Live off-site gallery discovery, creator-avatar discovery, full hover zoom, thumbnails, and lightbox - Multiple exact project/provider homes rather than collapsing every project to one URL - Search, numeric queries when fields really exist, filters, sortable card/table/gallery views, favorites, notes, compare, recent items, and CSV export
  - **Binding context:** Enderloom 2.9.5 / Browser/catalog QoL
  - **Original specification:** [README.md : 271-280](https://github.com/Herbertofury/Enderloom/blob/main/README.md#L271-L280)

</details>

<details>
<summary>README.md / Enderloom 2.9.5 / Security and privacy (1)</summary>

<a id="d-02d519e46c9af37648f8"></a>
- [ ] **D-02d519e46c9af37648f8** - - Remote tabs: nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true. - Google auth remains in the dedicated persistent Chromium session. Tokens/cookies ...
  - **State:** unverified. **Kind:** documented behavior to preserve.
  - **Full requirement:** - Remote tabs: nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true. - Google auth remains in the dedicated persistent Chromium session. Tokens/cookies are never copied into catalog JSON, Drive artifacts, or source packages. - Only http: / https: live navigation is accepted by the browser workspace. - No image generation is used. No catalog image bytes are embedded. Displayed project/gallery/creator images remain live http: / https: URLs from the real source site or its CDN; only discovery metadata is cached locally.
  - **Binding context:** Enderloom 2.9.5 / Security and privacy
  - **Original specification:** [README.md : 324-327](https://github.com/Herbertofury/Enderloom/blob/main/README.md#L324-L327)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 2. One repair job, one durable state machine (1)</summary>

<a id="d-5c5d9c855e27a565afd6"></a>
- [ ] **D-5c5d9c855e27a565afd6** - post_install_verifying
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. One repair job, one durable state machine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 65-65](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L65-L65)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 13. Clean install transaction (1)</summary>

<a id="d-bb532eae86c4d36214ec"></a>
- [ ] **D-bb532eae86c4d36214ec** - On post-install failure, rollback automatically and return to repair state.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Clean install transaction
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 435-435](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L435-L435)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 22. QA fixtures (1)</summary>

<a id="d-d704fa1937d8a8e8479e"></a>
- [ ] **D-d704fa1937d8a8e8479e** - Failed live post-install smoke rolls back.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 22. QA fixtures
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 648-648](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L648-L648)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 1. NON-NEGOTIABLE PRODUCT LAWS / 1.3 Preservation and safety (1)</summary>

<a id="d-dab2f8671a98c8f50a4f"></a>
- [ ] **D-dab2f8671a98c8f50a4f** - No synthetic replacement media: missing provider/project media is never silently replaced with generated content.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. NON-NEGOTIABLE PRODUCT LAWS / 1.3 Preservation and safety
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: SAFE-008 : 97-97](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L97-L97)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 1. NON-NEGOTIABLE PRODUCT LAWS / 1.4 Locked product decisions (1)</summary>

<a id="d-895b6776066946db7400"></a>
- [ ] **D-895b6776066946db7400** - Premium Steam-like mod trailer autoplay: real trailers can automatically preview in Catalog/mod-detail browsing for Premium users under the media rules in Phase D.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. NON-NEGOTIABLE PRODUCT LAWS / 1.4 Locked product decisions
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: DEC-016 : 119-119](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L119-L119)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 3. PHASE 0 — PRESERVE AND BASELINE THE EXISTING PRODUCT / 3.2 Existing behavior that must survive all later work (1)</summary>

<a id="d-15b0eaa64f201a9dd29c"></a>
- [ ] **D-15b0eaa64f201a9dd29c** - Catalog/research: browse/search/filter/favorites/notes, exact provider/project identity, source links, role-correct project/creator/gallery/video media, broad provider adapters, in...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** Catalog/research: browse/search/filter/favorites/notes, exact provider/project identity, source links, role-correct project/creator/gallery/video media, broad provider adapters, install bridge, import/export research data.
  - **Binding context:** 3. PHASE 0 — PRESERVE AND BASELINE THE EXISTING PRODUCT / 3.2 Existing behavior that must survive all later work
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: P0-010 : 177-177](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L177-L177)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 7. PHASE D — CORE PRODUCT HARDENING + PREMIUM MOD MEDIA / 7.1 Core QOL/performance (2)</summary>

<a id="d-4a2d361e5ce757b9c87d"></a>
- [ ] **D-4a2d361e5ce757b9c87d** - fast startup/progressive paint, large-pack scalability, parallel provider work, single-flight duplicate work, delta/fingerprint-based refresh instead of hidden rescans.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. PHASE D — CORE PRODUCT HARDENING + PREMIUM MOD MEDIA / 7.1 Core QOL/performance
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PD-001 : 315-315](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L315-L315)

<a id="d-7d3238a2688a1c240791"></a>
- [ ] **D-7d3238a2688a1c240791** - Testing+Browser and Testing+Mod Manager split/drill-down flows.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. PHASE D — CORE PRODUCT HARDENING + PREMIUM MOD MEDIA / 7.1 Core QOL/performance
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PD-003 : 317-317](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L317-L317)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 7. PHASE D — CORE PRODUCT HARDENING + PREMIUM MOD MEDIA / 7.2 Premium Steam-like autoplay trailers for mods (12)</summary>

<a id="d-c8f17613313ec8f2c3c6"></a>
- [ ] **D-c8f17613313ec8f2c3c6** - Media identity: trailer/video assets carry exact project/provider/source provenance and never borrow unrelated creator/sibling/promotional video.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. PHASE D — CORE PRODUCT HARDENING + PREMIUM MOD MEDIA / 7.2 Premium Steam-like autoplay trailers for mods
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PD-010 : 325-325](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L325-L325)

<a id="d-6f03e494c345d2d6d370"></a>
- [ ] **D-6f03e494c345d2d6d370** - Supported sources: use real project-author/provider/user-supplied trailers or videos that Enderloom is legitimately allowed to display/stream; no synthetic replacement trailer when...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** Supported sources: use real project-author/provider/user-supplied trailers or videos that Enderloom is legitimately allowed to display/stream; no synthetic replacement trailer when none exists.
  - **Binding context:** 7. PHASE D — CORE PRODUCT HARDENING + PREMIUM MOD MEDIA / 7.2 Premium Steam-like autoplay trailers for mods
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PD-011 : 326-326](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L326-L326)

<a id="d-15985491384fd7ab3c30"></a>
- [ ] **D-15985491384fd7ab3c30** - Catalog autoplay: Premium users can enable Steam-like muted trailer preview on stable hover/focus/dwell over a mod card; only one card autoplay session is active at once.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. PHASE D — CORE PRODUCT HARDENING + PREMIUM MOD MEDIA / 7.2 Premium Steam-like autoplay trailers for mods
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PD-012 : 327-327](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L327-L327)

<a id="d-bbe8d23311ea75898de1"></a>
- [ ] **D-bbe8d23311ea75898de1** - Detail autoplay: Premium mod-detail pages can automatically transition the hero media area from poster/gallery to the highest-priority legitimate trailer according to user preferen...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** Detail autoplay: Premium mod-detail pages can automatically transition the hero media area from poster/gallery to the highest-priority legitimate trailer according to user preference.
  - **Binding context:** 7. PHASE D — CORE PRODUCT HARDENING + PREMIUM MOD MEDIA / 7.2 Premium Steam-like autoplay trailers for mods
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PD-013 : 328-328](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L328-L328)

<a id="d-48ffa514cbe00227428b"></a>
- [ ] **D-48ffa514cbe00227428b** - Playback lifecycle: pause/stop when card leaves viewport, focus moves away, tab/app backgrounds, user scrolls away, or another trailer takes ownership.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. PHASE D — CORE PRODUCT HARDENING + PREMIUM MOD MEDIA / 7.2 Premium Steam-like autoplay trailers for mods
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PD-014 : 329-329](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L329-L329)

<a id="d-f4a0b024c4fa41b6414d"></a>
- [ ] **D-f4a0b024c4fa41b6414d** - Audio: autoplay starts muted; audio requires explicit user action. Remember mute/volume preference only when appropriate and never surprise-play audio.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. PHASE D — CORE PRODUCT HARDENING + PREMIUM MOD MEDIA / 7.2 Premium Steam-like autoplay trailers for mods
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PD-015 : 330-330](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L330-L330)

<a id="d-2b6a0f503c2032ab4a28"></a>
- [ ] **D-2b6a0f503c2032ab4a28** - User controls: global Premium autoplay toggle plus per-context preference (Catalog hover, detail hero) and reduced-data/network-sensitive behavior.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. PHASE D — CORE PRODUCT HARDENING + PREMIUM MOD MEDIA / 7.2 Premium Steam-like autoplay trailers for mods
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PD-016 : 331-331](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L331-L331)

<a id="d-7b186958937e18626ea4"></a>
- [ ] **D-7b186958937e18626ea4** - Accessibility: honor reduced-motion/autoplay preference, keyboard focus behavior, screen-reader semantics, captions/subtitles when the source exposes them, and a visible play/pause...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** Accessibility: honor reduced-motion/autoplay preference, keyboard focus behavior, screen-reader semantics, captions/subtitles when the source exposes them, and a visible play/pause control.
  - **Binding context:** 7. PHASE D — CORE PRODUCT HARDENING + PREMIUM MOD MEDIA / 7.2 Premium Steam-like autoplay trailers for mods
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PD-017 : 332-332](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L332-L332)

<a id="d-f2af60e82fc6696f4024"></a>
- [ ] **D-f2af60e82fc6696f4024** - Bandwidth/performance: preload poster/metadata first; defer video bytes until likely playback; bound concurrent buffering; cancel abandoned requests; do not make large catalogs dow...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** Bandwidth/performance: preload poster/metadata first; defer video bytes until likely playback; bound concurrent buffering; cancel abandoned requests; do not make large catalogs download dozens of videos simultaneously.
  - **Binding context:** 7. PHASE D — CORE PRODUCT HARDENING + PREMIUM MOD MEDIA / 7.2 Premium Steam-like autoplay trailers for mods
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PD-018 : 333-333](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L333-L333)

<a id="d-d02dbf4c5c2c6a77488c"></a>
- [ ] **D-d02dbf4c5c2c6a77488c** - Caching/rights: cache/stream only as provider terms and source permissions allow; otherwise use legitimate embedded/remote playback without exporting cookies or bypassing access co...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** Caching/rights: cache/stream only as provider terms and source permissions allow; otherwise use legitimate embedded/remote playback without exporting cookies or bypassing access controls.
  - **Binding context:** 7. PHASE D — CORE PRODUCT HARDENING + PREMIUM MOD MEDIA / 7.2 Premium Steam-like autoplay trailers for mods
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PD-019 : 334-334](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L334-L334)

<a id="d-1a3a5f1cf9e35409e8f7"></a>
- [ ] **D-1a3a5f1cf9e35409e8f7** - Fallback: if no valid trailer exists, remain on real screenshots/gallery art. Never generate a fake trailer, mislabeled slideshow, or unrelated video.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. PHASE D — CORE PRODUCT HARDENING + PREMIUM MOD MEDIA / 7.2 Premium Steam-like autoplay trailers for mods
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PD-020 : 335-335](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L335-L335)

<a id="d-9a96a2ff9e1680082680"></a>
- [ ] **D-9a96a2ff9e1680082680** - Testing: verify hover/focus ownership, pause/resume, muted autoplay, network cancellation, reduced-motion/data modes, provider login state, card virtualization, and no playback lea...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** Testing: verify hover/focus ownership, pause/resume, muted autoplay, network cancellation, reduced-motion/data modes, provider login state, card virtualization, and no playback leak after navigation.
  - **Binding context:** 7. PHASE D — CORE PRODUCT HARDENING + PREMIUM MOD MEDIA / 7.2 Premium Steam-like autoplay trailers for mods
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PD-021 : 336-336](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L336-L336)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 21. GOLDEN CHALLENGE MATRIX (1)</summary>

<a id="d-382fae60240d768781c8"></a>
- [ ] **D-382fae60240d768781c8** - Premium trailer browsing: PD-010..021 across a catalog containing cards with valid trailers, missing trailers, login-sensitive media, reduced-motion mode and rapid navigation.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 21. GOLDEN CHALLENGE MATRIX
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: GX-15 : 669-669](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L669-L669)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 21. Replay / Capture / Showcase Studio (1)</summary>

<a id="d-5041eab2bdf04fd2d238"></a>
- [ ] **D-5041eab2bdf04fd2d238** - Author/provider trailer lane.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 21. Replay / Capture / Showcase Studio
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 889-889](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L889-L889)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G005 — Favorites/catalog identity and quick actions are clean / T013 — MCreator candidates become a compact filter, not a permanent banner (1)</summary>

<a id="d-5f4b6103d634c5209a0a"></a>
- [ ] **D-5f4b6103d634c5209a0a** - · MCreator candidates become a compact filter, not a permanent banner
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G005 — Favorites/catalog identity and quick actions are clean / T013 — MCreator candidates become a compact filter, not a permanent banner
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md :: T013 : 250-250](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L250-L250)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G006 — Files, logs, addons, and guided installs act like desktop software / T016 — One universal guided-install engine (1)</summary>

<a id="d-fe6ffb89fb22ca0a6ec8"></a>
- [ ] **D-fe6ffb89fb22ca0a6ec8** - · One universal guided-install engine
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G006 — Files, logs, addons, and guided installs act like desktop software / T016 — One universal guided-install engine
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md :: T016 : 292-292](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L292-L292)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G006 — Files, logs, addons, and guided installs act like desktop software / T024 — Addons must use the normal Mods-tab card/detail UI system (1)</summary>

<a id="d-46a610af7c5eee2ad050"></a>
- [ ] **D-46a610af7c5eee2ad050** - - Same card/tile/list visual system as Mods: real project icon/artwork, title, concise installed/version state, provider badges, favorite state, update state, compact actions, and ...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - Same card/tile/list visual system as Mods: real project icon/artwork, title, concise installed/version state, provider badges, favorite state, update state, compact actions, and the same context-menu quality. - Same search/sort/filter/view-toggle behavior and large-dataset virtualization semantics as Mods. - Opening a provider-backed addon shows the same project-detail experience as a normal mod page: hero/icon, description, gallery/media when available, provider/source links, files/versions, changelog/release information, dependencies/relations, compatibility, install/update/change-version actions, favorite, provenance, and relevant “Why?” evidence. - Keep type-specific information (for example TaCZ gunpack, destination, host-mod requirement, config bundle, datapack, shader) as compact metadata/badges/installation details inside the common project UI rather than replacing the page with an unrelated guided-install layout. - Local/private content appears in the same cards/details with a clear Local / Unlinked badge and a provider-research/link action. It must not be pushed into a different ugly collection UI. - The Addons count represents logical addon projects/content records, not every JSON/file found under an instance. - Provider project pages, favorite state, updates, file/version picker, context menus, download progress, and install-to-instance chooser should feel and behave consistently across Mods and Addons. - Reuse the same responsive spacing, compact headers, card density, keyboard/focus behavior, and navigation history as the Mods tab. - No permanent full-width “guided install” cards or giant collection counters should consume the primary browsing area. Guidance appears only contextually when an install actually needs a typed destination/decision.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G006 — Files, logs, addons, and guided installs act like desktop software / T024 — Addons must use the normal Mods-tab card/detail UI system
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md : 368-376](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L368-L376)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 2. Product principles — non-negotiable / 2.2 Preserve user data and external launcher ownership (1)</summary>

<a id="d-8319de08c150b3b834f2"></a>
- [ ] **D-8319de08c150b3b834f2** - Never mutate a live CurseForge or Modrinth profile during automated QA or Performance Lab testing.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Product principles — non-negotiable / 2.2 Preserve user data and external launcher ownership
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 59-59](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L59-L59)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 4. Catalog + research browser / 4.1 Core research behavior (2)</summary>

<a id="d-a3cacbf142488305213e"></a>
- [ ] **D-a3cacbf142488305213e** - Live project media.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.1 Core research behavior
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 139-139](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L139-L139)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-25161050c49701dc900b"></a>
- [ ] **D-25161050c49701dc900b** - Full gallery/lightbox behavior where real media exists.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.1 Core research behavior
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 141-141](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L141-L141)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 4. Catalog + research browser / 4.2 Provider universe (4)</summary>

<a id="d-55e95ab2775e6b66d301"></a>
- [ ] **D-55e95ab2775e6b66d301** - Separate semantic roles for project icon, creator avatar, gallery media, post media, video/poster media.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 179-179](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L179-L179)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-572fb3aa48c723d5002e"></a>
- [ ] **D-572fb3aa48c723d5002e** - Never substitute a creator avatar for project art or vice versa.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 180-180](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L180-L180)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-7118ec35e90ac551ae9e"></a>
- [ ] **D-7118ec35e90ac551ae9e** - Quarantine ambiguous media-role collisions.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 181-181](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L181-L181)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-3372fee16ff9aeca5549"></a>
- [ ] **D-3372fee16ff9aeca5549** - Reject global promotions, ads, campaign art, unrelated sibling submissions, commenter avatars, etc.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.2 Provider universe
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 182-182](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L182-L182)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 39. Definition of done — whole Enderloom vision (2)</summary>

<a id="d-5f0602183670e382566d"></a>
- [ ] **D-5f0602183670e382566d** - Research/provider pages retain real source identity/media and persistent browsing.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 39. Definition of done — whole Enderloom vision
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1602-1602](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1602-L1602)

<a id="d-6a971359a5e5b217d2b6"></a>
- [ ] **D-6a971359a5e5b217d2b6** - No artificial project/mod/gallery/source/content caps are used to fake performance.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 39. Definition of done — whole Enderloom vision
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1615-1615](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1615-L1615)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 13. FIRST-CLASS LAUNCHER COMPLETENESS — MAKE ENDERLOOM FEEL FINISHED / 13.9 Screenshots and media library (1)</summary>

<a id="d-43356f95d8108aaf6a38"></a>
- [ ] **D-43356f95d8108aaf6a38** - Do not preload thousands of full-resolution images into the renderer.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 13. FIRST-CLASS LAUNCHER COMPLETENESS — MAKE ENDERLOOM FEEL FINISHED / 13.9 Screenshots and media library
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 1309-1309](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L1309-L1309) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 1309-1309](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L1309-L1309)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 13. FIRST-CLASS LAUNCHER COMPLETENESS — MAKE ENDERLOOM FEEL FINISHED / 13.14 Storage intelligence and de-duplication (1)</summary>

<a id="d-c2b25811d6f552e74b23"></a>
- [ ] **D-c2b25811d6f552e74b23** - Do not rewrite or hardlink through externally owned CurseForge/Modrinth profile roots unless the operation is explicitly safe and ownership rules allow it.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 13. FIRST-CLASS LAUNCHER COMPLETENESS — MAKE ENDERLOOM FEEL FINISHED / 13.14 Storage intelligence and de-duplication
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 1727-1727](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L1727-L1727) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 1727-1727](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L1727-L1727)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 13. FIRST-CLASS LAUNCHER COMPLETENESS — MAKE ENDERLOOM FEEL FINISHED / 13.18 UI performance budgets and large-library behavior (1)</summary>

<a id="d-83933449d8cd4d6cae42"></a>
- [ ] **D-83933449d8cd4d6cae42** - Do not make startup wait for every provider refresh, screenshot scan, gallery decode, server probe or update check before the user can interact with the Play/Library surface.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 13. FIRST-CLASS LAUNCHER COMPLETENESS — MAKE ENDERLOOM FEEL FINISHED / 13.18 UI performance budgets and large-library behavior
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 1797-1797](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L1797-L1797) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 1797-1797](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L1797-L1797)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 3. Performance / Testing tab — Premium Performance Lab / 3.2 Landing dashboard (1)</summary>

<a id="d-6b729f33eeaa84b8f9f9"></a>
- [ ] **D-6b729f33eeaa84b8f9f9** - favorite mods with performance status;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.2 Landing dashboard
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 134-134](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L134-L134)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 19. CLI/automation — only for Favorites + Performance scope (1)</summary>

<a id="d-bd46b177a56086b78800"></a>
- [ ] **D-bd46b177a56086b78800** - Do not build a separate second implementation; GUI and CLI should call the same domain logic.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 643-643](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L643-L643)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 23. Acceptance tests / Favorites (1)</summary>

<a id="d-9fc7e0659ac0f5bb2d16"></a>
- [ ] **D-9fc7e0659ac0f5bb2d16** - Favorite provider/project identity remains correct after updates.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Acceptance tests / Favorites
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 786-786](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L786-L786)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 0. North-star product promise (1)</summary>

<a id="d-3e39075405b7894517a5"></a>
- [ ] **D-3e39075405b7894517a5** - Hover a project and get a Steam-like live preview from authoritative media/video without leaving the app.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. North-star product promise
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 25-25](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L25-L25)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 4. Universal Project / Mod Detail Surface (1)</summary>

<a id="d-5bf6bc453a211a6616e7"></a>
- [ ] **D-5bf6bc453a211a6616e7** - Media
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Universal Project / Mod Detail Surface
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 187-187](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L187-L187)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 5. Right-click / Power Context Menu — obsessive QOL / 5.2 `Preview` submenu (1)</summary>

<a id="d-199820136820218edc53"></a>
- [ ] **D-199820136820218edc53** - Then provider-hosted trailer/media.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.2 `Preview` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 280-280](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L280-L280)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 8. Minecraft Marketplace integration (2)</summary>

<a id="d-94eea599b2d684d9c584"></a>
- [ ] **D-94eea599b2d684d9c584** - Extract only normal page metadata/media that the user can legitimately access.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. Minecraft Marketplace integration
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 443-443](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L443-L443)

<a id="d-d680e1e04fc90bc60761"></a>
- [ ] **D-d680e1e04fc90bc60761** - Show creator/title/description/media/trailer/ratings/price/store metadata when available.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. Minecraft Marketplace integration
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 444-444](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L444-L444)

</details>

<details>
<summary>PREMIUM_TESTING_LAB_SPEC.md / Enderloom Premium Testing Lab / Challenge-pass notes (1)</summary>

<a id="d-3711827dd352a40328e0"></a>
- [ ] **D-3711827dd352a40328e0** - Primary sources of misleading data that Enderloom must actively detect or control:
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** Enderloom Premium Testing Lab / Challenge-pass notes
  - **Original specification:** [PREMIUM_TESTING_LAB_SPEC.md : 711-711](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_LAB_SPEC.md#L711-L711)

</details>

<details>
<summary>RELEASE_EVIDENCE_2026-09-01.md / Enderloom verified checkpoint — 2026-09-01 / Delivered in this checkpoint (1)</summary>

<a id="d-60fe62edd100aab9bf94"></a>
- [ ] **D-60fe62edd100aab9bf94** - - Added provider-aware Catalog export to XLSX, CSV, JSON, HTML and PDF. The XLSX contains a second Media Links sheet so every discovered gallery, author and source URL remains indi...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - Added provider-aware Catalog export to XLSX, CSV, JSON, HTML and PDF. The XLSX contains a second Media Links sheet so every discovered gallery, author and source URL remains individually clickable. - Added Google Sheets, Docs and Drive-PDF source intake from the current Enderloom browser page. Private sources return an explicit sign-in-required state and never substitute invented data. - Tested the private JetSetCraft master sheet in the user&#x27;s signed-in Chrome session without exporting cookies, passwords or OAuth tokens. The authenticated XLSX was attached as a watched local source while the canonical Google source remains registered for in-app refresh. - Corrected multi-sheet XLSX ingestion to prefer Master Rankings/Master Index, preserve canonical master rows, merge category/scour provenance, ignore repeated internal headers and recognize research-atlas field names. - Added real content version switching, searchable compatible/incompatible versions, changelog display, pre-change snapshot creation, exact-version install and persistent per-project version freeze/unfreeze. - Added Modrinth-style content row actions: Show file, Copy link, Freeze version, enable/disable and safe removal.
  - **Binding context:** Enderloom verified checkpoint — 2026-09-01 / Delivered in this checkpoint
  - **Original specification:** [RELEASE_EVIDENCE_2026-09-01.md : 7-12](https://github.com/Herbertofury/Enderloom/blob/main/docs/RELEASE_EVIDENCE_2026-09-01.md#L7-L12)

</details>

<a id="lib-03-details"></a>
## LIB-03 - Real embedded browser

[Outcome](Checklist.md#lib-03) / 75 source-derived details.

<details>
<summary>README.md / Enderloom 2.9.5 / 2.0.10 verified ad blocking + native Windows window ergonomics (1)</summary>

<a id="d-4cae1fb825d54c14f545"></a>
- [ ] **D-4cae1fb825d54c14f545** - - Fixed the false-positive adblock state exposed by Planet Minecraft: uBO … on previously meant only that Electron accepted the extension package. 2.0.10 adds an authoritative nati...
  - **State:** unverified. **Kind:** documented behavior to preserve.
  - **Full requirement:** - Fixed the false-positive adblock state exposed by Planet Minecraft: uBO … on previously meant only that Electron accepted the extension package. 2.0.10 adds an authoritative native session.webRequest blocker compiled from the bundled official uBlock Origin filter assets plus EasyList/EasyPrivacy. The current bundled set produces about 118k parsed network rules and blocks common Google/DoubleClick/AppNexus ad traffic before it reaches live browser tabs. - The official uBlock Origin 1.74.0 extension remains loaded for its normal extension/content-script state. Companion&#x27;s native network layer is the verified fallback/authority because Electron&#x27;s main-process webRequest layer has deterministic control of the persistent browser session. The status bar now says verified only when the network engine itself is running; extension load alone is shown as loaded / not filtering. - Filter lists refresh conditionally every six hours using ETag/Last-Modified and fall back to the bundled official lists offline. The existing official gorhill/uBlock package updater remains, so both the extension package and live network lists stay current. - Restored normal frameless-Windows movement behavior without sacrificing the custom chrome: empty titlebar/tab-strip space is a native drag region, while actual tabs, New Tab/Reopen, and window buttons are explicit no-drag controls. Windows WS_THICKFRAME move/resize/snap behavior is explicitly retained. - The protected bottom status surface gets the same QoL treatment: non-interactive status space can be used as a convenient grab region, collapse/reveal remains clickable, and native window edges/corners remain reserved for standard resize behavior.
  - **Binding context:** Enderloom 2.9.5 / 2.0.10 verified ad blocking + native Windows window ergonomics
  - **Original specification:** [README.md : 173-177](https://github.com/Herbertofury/Enderloom/blob/main/README.md#L173-L177)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 1. Product laws (1)</summary>

<a id="d-5a55e6e63b6447dcba2c"></a>
- [ ] **D-5a55e6e63b6447dcba2c** - The real integrated Chromium browser is a first-class execution surface.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. Product laws
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 19-19](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L19-L19)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 3. Provider Adapter architecture (1)</summary>

<a id="d-2e7f86235ced1f3664be"></a>
- [ ] **D-2e7f86235ced1f3664be** - Browser automation must not run privileged Node APIs in arbitrary page JavaScript.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 131-131](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L131-L131)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 23. Definition of done (1)</summary>

<a id="d-b5f70a0347fdda8634ed"></a>
- [ ] **D-b5f70a0347fdda8634ed** - No API key or separate paid API is required for the default in-browser chat lane.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Definition of done
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 673-673](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L673-L673)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 3. PHASE 0 — PRESERVE AND BASELINE THE EXISTING PRODUCT / 3.2 Existing behavior that must survive all later work (1)</summary>

<a id="d-bbf1021c4fae7ddd0e7e"></a>
- [ ] **D-bbf1021c4fae7ddd0e7e** - Browser: real persistent Chromium sessions/tabs, login-sensitive sites through the user’s session, safe translation, Full/Split research layouts.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. PHASE 0 — PRESERVE AND BASELINE THE EXISTING PRODUCT / 3.2 Existing behavior that must survive all later work
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: P0-011 : 178-178](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L178-L178)

</details>

<details>
<summary>ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md / 8. Scripted Modpack Logic Studio (2)</summary>

<a id="d-9a303b8fff5c09e92976"></a>
- [ ] **D-9a303b8fff5c09e92976** - KubeJS project browser/editor;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. Scripted Modpack Logic Studio
  - **Original specification:** [ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md : 220-220](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md#L220-L220)

<a id="d-c02109a541b38370ed6d"></a>
- [ ] **D-c02109a541b38370ed6d** - CraftTweaker/ZenScript project browser/editor;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. Scripted Modpack Logic Studio
  - **Original specification:** [ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md : 221-221](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md#L221-L221)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 7. Command / Data / Worldgen Generator Studio / 7.4 Specialized utilities (1)</summary>

<a id="d-ab441400db53092acc25"></a>
- [ ] **D-ab441400db53092acc25** - Sound browser/mixer.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Command / Data / Worldgen Generator Studio / 7.4 Specialized utilities
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 423-423](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L423-L423)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 28. Remote Server Operations — real adapters only (1)</summary>

<a id="d-15370d03ace9962e3183"></a>
- [ ] **D-15370d03ace9962e3183** - never fake hosted-cloud capability when no provider API is available.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 28. Remote Server Operations — real adapters only
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 1039-1039](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L1039-L1039)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G002 — Browser/download experience behaves like a normal modern browser (1)</summary>

<a id="d-9b695daaa5b1f9d3716b"></a>
- [ ] **D-9b695daaa5b1f9d3716b** - GATE — Browser/download experience behaves like a normal modern browser
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G002 — Browser/download experience behaves like a normal modern browser
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md :: G002 : 91-91](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L91-L91)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G002 — Browser/download experience behaves like a normal modern browser / T004 — Chrome-normal downloads in the embedded browser (2)</summary>

<a id="d-ba6de9e3bdbf6b2c889d"></a>
- [ ] **D-ba6de9e3bdbf6b2c889d** - · Chrome-normal downloads in the embedded browser
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G002 — Browser/download experience behaves like a normal modern browser / T004 — Chrome-normal downloads in the embedded browser
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md :: T004 : 95-95](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L95-L95)

<a id="d-879211ae4a7be28ff70d"></a>
- [ ] **D-879211ae4a7be28ff70d** - The existing paste-a-file-link / optional SHA utility may remain as an advanced direct-download tool, but it must not be the normal browser download workflow.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G002 — Browser/download experience behaves like a normal modern browser / T004 — Chrome-normal downloads in the embedded browser
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md : 117-117](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L117-L117)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G002 — Browser/download experience behaves like a normal modern browser / T005 — Browser extensions (1)</summary>

<a id="d-3ca8ca9454eb71ed9e8f"></a>
- [ ] **D-3ca8ca9454eb71ed9e8f** - · Browser extensions
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G002 — Browser/download experience behaves like a normal modern browser / T005 — Browser extensions
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md :: T005 : 121-121](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L121-L121)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 3. Top-level Enderloom workspaces (2)</summary>

<a id="d-afb050b3bb42c5bbdc64"></a>
- [ ] **D-afb050b3bb42c5bbdc64** - Browser — real Chromium browser tabs.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Top-level Enderloom workspaces
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 113-113](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L113-L113)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-69229290e9c1db450741"></a>
- [ ] **D-69229290e9c1db450741** - Split — resizable side-by-side app/browser or app/app research workflows.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Top-level Enderloom workspaces
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 115-115](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L115-L115)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 4. Catalog + research browser / 4.1 Core research behavior (5)</summary>

<a id="d-82eaf1d38c06ea68ac68"></a>
- [ ] **D-82eaf1d38c06ea68ac68** - Browse large curated catalogs.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.1 Core research behavior
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 133-133](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L133-L133)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-0e55ac1daf5713ec43bb"></a>
- [ ] **D-0e55ac1daf5713ec43bb** - Notes.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.1 Core research behavior
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 136-136](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L136-L136)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-eb5c33b9215f3a7cd569"></a>
- [ ] **D-eb5c33b9215f3a7cd569** - Creator/avatar identity.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.1 Core research behavior
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 140-140](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L140-L140)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-7c5a220d9f8078de411c"></a>
- [ ] **D-7c5a220d9f8078de411c** - Real source/provider browser pages.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.1 Core research behavior
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 142-142](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L142-L142)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-a14bfb68367c1da15a79"></a>
- [ ] **D-a14bfb68367c1da15a79** - Persistent browser sessions/cookies.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.1 Core research behavior
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 143-143](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L143-L143)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 4. Catalog + research browser / 4.3 Browser capability (11)</summary>

<a id="d-4af0575a7cec18c03a0c"></a>
- [ ] **D-4af0575a7cec18c03a0c** - Real Chromium tabs, not scraped/static approximations.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.3 Browser capability
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 189-189](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L189-L189)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-dd6854c0310687fdb06f"></a>
- [ ] **D-dd6854c0310687fdb06f** - Persistent session.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.3 Browser capability
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 190-190](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L190-L190)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-28d732153926e131f9fe"></a>
- [ ] **D-28d732153926e131f9fe** - Real site login where the user signs in.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.3 Browser capability
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 191-191](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L191-L191)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-60526536314a63a50d2d"></a>
- [ ] **D-60526536314a63a50d2d** - Ad/network filtering with verified rules.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.3 Browser capability
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 192-192](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L192-L192)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-52edc053c83c88caf7ea"></a>
- [ ] **D-52edc053c83c88caf7ea** - Integrated web-page translation.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.3 Browser capability
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 193-193](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L193-L193)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-f4d6f02552adb5164e95"></a>
- [ ] **D-f4d6f02552adb5164e95** - Original/Translated toggle.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.3 Browser capability
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 194-194](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L194-L194)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-0128d6e0c904d87a5d96"></a>
- [ ] **D-0128d6e0c904d87a5d96** - Selected-text translation.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.3 Browser capability
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 195-195](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L195-L195)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-6a0e7249611b99cbf5bf"></a>
- [ ] **D-6a0e7249611b99cbf5bf** - Dynamic-page translation.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.3 Browser capability
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 196-196](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L196-L196)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-bd5bf5cbf1ea1c5ee986"></a>
- [ ] **D-bd5bf5cbf1ea1c5ee986** - Per-site auto-translate.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.3 Browser capability
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 197-197](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L197-L197)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-a282f22f7e82d4ec57a4"></a>
- [ ] **D-a282f22f7e82d4ec57a4** - Multiple translation provider recipes where implemented safely.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.3 Browser capability
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 198-198](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L198-L198)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-5354afd1ec126a321045"></a>
- [ ] **D-5354afd1ec126a321045** - Upstream translation recipe updates must be allow-listed and must not blindly execute third-party privileged JavaScript.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.3 Browser capability
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 199-199](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L199-L199)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 4. Catalog + research browser / 4.5 Catalog document interchange (2)</summary>

<a id="d-1c51856bd1d12c254d28"></a>
- [ ] **D-1c51856bd1d12c254d28** - Register current signed-in Google Sheets/Docs/Drive PDF sources through the live browser session where supported.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.5 Catalog document interchange
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 223-223](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L223-L223)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-3e2e826e3a29ae26e9ee"></a>
- [ ] **D-3e2e826e3a29ae26e9ee** - Direct Google Doc/Sheet mutation only when implemented through a real supported connector/contract; do not fake it.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.5 Catalog document interchange
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 225-225](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L225-L225)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 12. Split research + browser integration (6)</summary>

<a id="d-49d51bdd91fbb2912a63"></a>
- [ ] **D-49d51bdd91fbb2912a63** - Resizable split.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 12. Split research + browser integration
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 500-500](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L500-L500)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-b4f911b80f7c2b4b8cfa"></a>
- [ ] **D-b4f911b80f7c2b4b8cfa** - Swap/reset split.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 12. Split research + browser integration
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 501-501](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L501-L501)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-ba7e6d1eecd30e7c8da2"></a>
- [ ] **D-ba7e6d1eecd30e7c8da2** - Catalog + Browser pairing.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 12. Split research + browser integration
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 502-502](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L502-L502)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-94a6adc3278edfab54b9"></a>
- [ ] **D-94a6adc3278edfab54b9** - Mod Manager + Browser pairing.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 12. Split research + browser integration
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 503-503](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L503-L503)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-ef07bcd6640d59b918e0"></a>
- [ ] **D-ef07bcd6640d59b918e0** - Full-height WebContentsView panes.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 12. Split research + browser integration
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 504-504](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L504-L504)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-148dc0ece63a2e391d35"></a>
- [ ] **D-148dc0ece63a2e391d35** - Testing + Browser pairing for profiler docs, mod source, issue trackers, AI/provider pages.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 12. Split research + browser integration
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 506-506](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L506-L506)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 39. Definition of done — whole Enderloom vision (2)</summary>

<a id="d-6f7d2471c7a4200231c9"></a>
- [ ] **D-6f7d2471c7a4200231c9** - Catalog, Mod Manager, Browser, Split, and Testing are one coherent app.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 39. Definition of done — whole Enderloom vision
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1598-1598](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1598-L1598)

<a id="d-e1d51110a4aaeaa029e4"></a>
- [ ] **D-e1d51110a4aaeaa029e4** - External CurseForge/Modrinth profiles can be used in place without forced copying.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 39. Definition of done — whole Enderloom vision
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1599-1599](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1599-L1599)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 13. FIRST-CLASS LAUNCHER COMPLETENESS — MAKE ENDERLOOM FEEL FINISHED / 13.11 Share instances without making users manually zip folders (1)</summary>

<a id="d-add29e223f21afb43360"></a>
- [ ] **D-add29e223f21afb43360** - If an official third-party service exposes a supported authenticated collaboration API, integrate it through that real contract. Do not fake CurseForge/Modrinth proprietary cloud/s...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** If an official third-party service exposes a supported authenticated collaboration API, integrate it through that real contract. Do not fake CurseForge/Modrinth proprietary cloud/share services.
  - **Binding context:** 13. FIRST-CLASS LAUNCHER COMPLETENESS — MAKE ENDERLOOM FEEL FINISHED / 13.11 Share instances without making users manually zip folders
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 1662-1662](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L1662-L1662) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 1662-1662](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L1662-L1662)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 25. Focused definition of done (1)</summary>

<a id="d-4fd798d806e2721c2b47"></a>
- [ ] **D-4fd798d806e2721c2b47** - Favorite items can be acted on immediately without hunting through other tabs.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 25. Focused definition of done
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 889-889](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L889-L889)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 0. North-star product promise (1)</summary>

<a id="d-d4bd5609d82b6ac6f4cc"></a>
- [ ] **D-d4bd5609d82b6ac6f4cc** - Open the real CurseForge/Modrinth/Planet Minecraft/AFDIAN/MCPEDL/ModBay/Minecraft Marketplace/GitHub/GitLab/etc. page inside Enderloom’s real persistent browser.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. North-star product promise
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 26-26](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L26-L26)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 1. The Integration Law — absolutely non-negotiable (1)</summary>

<a id="d-ecb3e5f00d500c5be798"></a>
- [ ] **D-ecb3e5f00d500c5be798** - The browser can open any relevant project/task/evidence beside the native Enderloom surface in Split view.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. The Integration Law — absolutely non-negotiable
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 55-55](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L55-L55)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 6. Research / Catalog / Embedded Browser 2.0 (19)</summary>

<a id="d-5447443f7e896a5dd747"></a>
- [ ] **D-5447443f7e896a5dd747** - Result deduplication by canonical identity rather than title text.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Research / Catalog / Embedded Browser 2.0
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 343-343](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L343-L343)

<a id="d-4fd4901647b76aac0f07"></a>
- [ ] **D-4fd4901647b76aac0f07** - Provider-specific filters.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Research / Catalog / Embedded Browser 2.0
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 344-344](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L344-L344)

<a id="d-50b5e91da389f46585f9"></a>
- [ ] **D-50b5e91da389f46585f9** - Minecraft version/loader filters.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Research / Catalog / Embedded Browser 2.0
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 345-345](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L345-L345)

<a id="d-ccecb55757e24241153c"></a>
- [ ] **D-ccecb55757e24241153c** - Project type filter.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Research / Catalog / Embedded Browser 2.0
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 347-347](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L347-L347)

<a id="d-9ff589d8d1f7b86466b3"></a>
- [ ] **D-9ff589d8d1f7b86466b3** - Free/paid/source-available/licensed filter where known.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Research / Catalog / Embedded Browser 2.0
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 348-348](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L348-L348)

<a id="d-fb860aa685f147094edc"></a>
- [ ] **D-fb860aa685f147094edc** - Already-installed/favorite/tested/known-good filter.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Research / Catalog / Embedded Browser 2.0
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 350-350](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L350-L350)

<a id="d-6720579efbca309ced9e"></a>
- [ ] **D-6720579efbca309ced9e** - Measured performance filter.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Research / Catalog / Embedded Browser 2.0
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 351-351](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L351-L351)

<a id="d-5297428880559615e52f"></a>
- [ ] **D-5297428880559615e52f** - Development activity/release freshness.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Research / Catalog / Embedded Browser 2.0
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 352-352](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L352-L352)

<a id="d-d5d28f8267155c4e8123"></a>
- [ ] **D-d5d28f8267155c4e8123** - Source repository health.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Research / Catalog / Embedded Browser 2.0
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 353-353](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L353-L353)

<a id="d-0c0dcd5363c5c53df810"></a>
- [ ] **D-0c0dcd5363c5c53df810** - Show alternatives/related projects.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Research / Catalog / Embedded Browser 2.0
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 354-354](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L354-L354)

<a id="d-54d12dd2a3faf0cc7e3c"></a>
- [ ] **D-54d12dd2a3faf0cc7e3c** - Compare projects side-by-side.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Research / Catalog / Embedded Browser 2.0
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 355-355](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L355-L355)

<a id="d-f28ddcff6a5339a6b950"></a>
- [ ] **D-f28ddcff6a5339a6b950** - Persistent authenticated sessions.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Research / Catalog / Embedded Browser 2.0
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 361-361](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L361-L361)

<a id="d-b0aa0b922d00bc22612c"></a>
- [ ] **D-b0aa0b922d00bc22612c** - Real Chromium tabs.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Research / Catalog / Embedded Browser 2.0
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 362-362](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L362-L362)

<a id="d-fd5c970e1177f222feca"></a>
- [ ] **D-fd5c970e1177f222feca** - Split view with any Enderloom workspace.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Research / Catalog / Embedded Browser 2.0
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 363-363](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L363-L363)

<a id="d-57a827f78cdff902fe62"></a>
- [ ] **D-57a827f78cdff902fe62** - Download interception/adoption into relevant workflows.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Research / Catalog / Embedded Browser 2.0
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 364-364](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L364-L364)

<a id="d-4c8dd3557c86ba7c910d"></a>
- [ ] **D-4c8dd3557c86ba7c910d** - Per-site translation.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Research / Catalog / Embedded Browser 2.0
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 365-365](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L365-L365)

<a id="d-c3cc122b07b914152fc6"></a>
- [ ] **D-c3cc122b07b914152fc6** - Ad filtering.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Research / Catalog / Embedded Browser 2.0
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 366-366](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L366-L366)

<a id="d-d2fd41c40532127f8453"></a>
- [ ] **D-d2fd41c40532127f8453** - Use downloaded file as candidate action.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Research / Catalog / Embedded Browser 2.0
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 369-369](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L369-L369)

<a id="d-c023a090490cd5da13f1"></a>
- [ ] **D-c023a090490cd5da13f1** - Task-aware tabs: repair/port/conversion/research jobs remember their browser context.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Research / Catalog / Embedded Browser 2.0
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 370-370](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L370-L370)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 8. Minecraft Marketplace integration (1)</summary>

<a id="d-1ab8b39ddd365db0fe8e"></a>
- [ ] **D-1ab8b39ddd365db0fe8e** - Open Marketplace PDPs directly inside Enderloom Browser.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. Minecraft Marketplace integration
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 442-442](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L442-L442)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 18. Autonomous AI Repair Loop (3)</summary>

<a id="d-b8b04e36a1dc75f79106"></a>
- [ ] **D-b8b04e36a1dc75f79106** - Default browser-chat lane uses Enderloom’s integrated persistent authenticated browser; no separate API key is required for this lane.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 18. Autonomous AI Repair Loop
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 798-798](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L798-L798)

<a id="d-ab1c1d45a7b7a5ce9789"></a>
- [ ] **D-ab1c1d45a7b7a5ce9789** - Submit inside Enderloom Browser.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 18. Autonomous AI Repair Loop
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 803-803](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L803-L803)

<a id="d-49fad7895cdb29e2b257"></a>
- [ ] **D-49fad7895cdb29e2b257** - Post-install smoke the real connected instance.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 18. Autonomous AI Repair Loop
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 814-814](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L814-L814)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 34. Release / Publishing Workbench (1)</summary>

<a id="d-68220716e0bf8e4bf9e8"></a>
- [ ] **D-68220716e0bf8e4bf9e8** - CurseForge publishing only through supported authorized API/browser flow;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 34. Release / Publishing Workbench
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1300-1300](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1300-L1300)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 38. Micro-QOL saturation pass (2)</summary>

<a id="d-3f43c4f05ba3ab75a8da"></a>
- [ ] **D-3f43c4f05ba3ab75a8da** - reveal in browser;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 38. Micro-QOL saturation pass
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1416-1416](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1416-L1416)

<a id="d-8c8d8fbb333cf5c18f3e"></a>
- [ ] **D-8c8d8fbb333cf5c18f3e** - Middle-click project opens background Browser tab.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 38. Micro-QOL saturation pass
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1438-1438](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1438-L1438)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 39. Safety / preservation rules (1)</summary>

<a id="d-b0c2dae5acf1c44d8edc"></a>
- [ ] **D-b0c2dae5acf1c44d8edc** - No browser credential extraction.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 39. Safety / preservation rules
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1464-1464](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1464-L1464)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 41. Verification contract (1)</summary>

<a id="d-aa453453e1e8749ceda2"></a>
- [ ] **D-aa453453e1e8749ceda2** - browser adapter fixture;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 41. Verification contract
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1519-1519](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1519-L1519)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 44. Exact Codex handoff rules (1)</summary>

<a id="d-af21bd9d20bdf2e5e067"></a>
- [ ] **D-af21bd9d20bdf2e5e067** - Preserve existing accepted Catalog/Browser/Launcher behavior.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 44. Exact Codex handoff rules
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1716-1716](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1716-L1716)

</details>

<details>
<summary>LAUNCHER_PARITY_MATRIX.md / Enderloom launcher parity contract / Non-negotiable release gates (1)</summary>

<a id="d-c72add851e82f18eb446"></a>
- [ ] **D-c72add851e82f18eb446** - - Never mutate either real launcher library during QA; fingerprint before and after scans. - Never copy an external profile unless the user explicitly chooses Clone/Copy. - Treat j...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - Never mutate either real launcher library during QA; fingerprint before and after scans. - Never copy an external profile unless the user explicitly chooses Clone/Copy. - Treat junctions and symlinks by physical identity; never recurse-delete through an unresolved link. - Use staged writes, rollback/quarantine and pre-restore snapshots for destructive workflows. - Preserve Catalog, Source, Browser, Full and Split modes, persistent sessions/cookies, WebContentsView tabs, translator, verified ad blocking, media/galleries, identity safety, favorites and notes. - Expose only real IPC capabilities. Unsupported proprietary/cloud workflows must say they are unavailable rather than render fake controls. - Require the command coverage gate, native integration acceptance, combined Electron self-test and full Catalog release suite before a release checkpoint.
  - **Binding context:** Enderloom launcher parity contract / Non-negotiable release gates
  - **Original specification:** [LAUNCHER_PARITY_MATRIX.md : 48-54](https://github.com/Herbertofury/Enderloom/blob/main/docs/LAUNCHER_PARITY_MATRIX.md#L48-L54)

</details>

<a id="lib-04-details"></a>
## LIB-04 - Catalog-to-instance bridge

[Outcome](Checklist.md#lib-04) / 61 source-derived details.

<details>
<summary>README.md / Enderloom 2.9.5 / Keyboard shortcuts (1)</summary>

<a id="d-42510676ef155a1b1b3a"></a>
- [ ] **D-42510676ef155a1b1b3a** - - Ctrl+L address/search - Ctrl+T new browser tab - Ctrl+W close live tab - Ctrl+Shift+T reopen closed tab - Ctrl+Shift+C return to Catalog - Ctrl+Shift+O Catalog Center - Ctrl+F fi...
  - **State:** unverified. **Kind:** documented behavior to preserve.
  - **Full requirement:** - Ctrl+L address/search - Ctrl+T new browser tab - Ctrl+W close live tab - Ctrl+Shift+T reopen closed tab - Ctrl+Shift+C return to Catalog - Ctrl+Shift+O Catalog Center - Ctrl+F find in page - Ctrl+\ Research Split - Alt+Left / Alt+Right browser history - Ctrl++ / Ctrl+- / Ctrl+0 zoom - / or Ctrl+K inside a catalog focuses catalog search
  - **Binding context:** Enderloom 2.9.5 / Keyboard shortcuts
  - **Original specification:** [README.md : 284-294](https://github.com/Herbertofury/Enderloom/blob/main/README.md#L284-L294)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 2. One repair job, one durable state machine (1)</summary>

<a id="d-ef41cc147729eda6ecc1"></a>
- [ ] **D-ef41cc147729eda6ecc1** - install_plan_ready
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. One repair job, one durable state machine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 63-63](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L63-L63)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 11. Automatic failure feedback loop (1)</summary>

<a id="d-bcdc95afb74f19a42a23"></a>
- [ ] **D-bcdc95afb74f19a42a23** - Track rejected routes so the provider is told not to repeat them.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Automatic failure feedback loop
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 395-395](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L395-L395)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 13. Clean install transaction (3)</summary>

<a id="d-f67f102b0887ad4cdbe2"></a>
- [ ] **D-f67f102b0887ad4cdbe2** - Create pre-install snapshot/rollback point.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Clean install transaction
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 428-428](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L428-L428)

<a id="d-741703a44abd7fe746ff"></a>
- [ ] **D-741703a44abd7fe746ff** - Replace/install by atomic staged move where possible.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Clean install transaction
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 430-430](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L430-L430)

<a id="d-246cefaa35feadeb1450"></a>
- [ ] **D-246cefaa35feadeb1450** - Re-run a short post-install smoke against the actual connected instance without destructive world changes.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Clean install transaction
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 434-434](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L434-L434)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 23. Definition of done (1)</summary>

<a id="d-a6226e8f9a77aff9d381"></a>
- [ ] **D-a6226e8f9a77aff9d381** - Post-install verification proves the actual connected instance uses the new artifact.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Definition of done
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 669-669](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L669-L669)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 3. PHASE 0 — PRESERVE AND BASELINE THE EXISTING PRODUCT / 3.3 Baseline gate (1)</summary>

<a id="d-b33edd1adc440cdd7e82"></a>
- [ ] **D-b33edd1adc440cdd7e82** - Run existing release/native-integration/Electron/Catalog QA suites.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. PHASE 0 — PRESERVE AND BASELINE THE EXISTING PRODUCT / 3.3 Baseline gate
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: P0-020 : 187-187](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L187-L187)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 3. Bedrock Developer Center — full creator/debugger parity / 3.1 Creator project management (1)</summary>

<a id="d-7be2f8d8e5ee0c2536a2"></a>
- [ ] **D-7be2f8d8e5ee0c2536a2** - Deploy to development behavior/resource pack directories.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Bedrock Developer Center — full creator/debugger parity / 3.1 Creator project management
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 121-121](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L121-L121)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 18. Worldgen / Seed / Pregeneration Intelligence (1)</summary>

<a id="d-807a3bf296e8916149b3"></a>
- [ ] **D-807a3bf296e8916149b3** - “Where should I travel to see newly added content?” generated-vs-unexplored heatmap.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 18. Worldgen / Seed / Pregeneration Intelligence
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 843-843](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L843-L843)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 29. Ecosystem Challenge Matrix — expanded benchmark set (1)</summary>

<a id="d-dca304901c26206a8ef7"></a>
- [ ] **D-dca304901c26206a8ef7** - Modrinth shared-instance collaboration.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 29. Ecosystem Challenge Matrix — expanded benchmark set
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 1066-1066](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L1066-L1066)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G004 — Instance launching and presentation are polished / T007 — Launch any connected instance in place through Internal, CurseForge, or Modrinth (1)</summary>

<a id="d-82970c36d9d29bb71dab"></a>
- [ ] **D-82970c36d9d29bb71dab** - · Launch any connected instance in place through Internal, CurseForge, or Modrinth
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G004 — Instance launching and presentation are polished / T007 — Launch any connected instance in place through Internal, CurseForge, or Modrinth
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md :: T007 : 170-170](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L170-L170)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G005 — Favorites/catalog identity and quick actions are clean / T011 — Compact + button on favorite/mod cards for direct install (2)</summary>

<a id="d-2d4be3d3c1ec88a992fb"></a>
- [ ] **D-2d4be3d3c1ec88a992fb** - · Compact + button on favorite/mod cards for direct install
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G005 — Favorites/catalog identity and quick actions are clean / T011 — Compact + button on favorite/mod cards for direct install
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md :: T011 : 228-228](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L228-L228)

<a id="d-fb761242b98aaaf5ba55"></a>
- [ ] **D-fb761242b98aaaf5ba55** - - If the most recent/default compatible instance is unambiguous, allow one-click install. - Otherwise open a tiny searchable instance picker. - Reuse the normal dependency, compati...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - If the most recent/default compatible instance is unambiguous, allow one-click install. - Otherwise open a tiny searchable instance picker. - Reuse the normal dependency, compatibility, snapshot/risk, staged install, and verification transaction. - Never bypass the canonical install operation for speed.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G005 — Favorites/catalog identity and quick actions are clean / T011 — Compact + button on favorite/mod cards for direct install
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md : 232-235](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L232-L235)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 3. Top-level Enderloom workspaces (1)</summary>

<a id="d-042035c0019ecba2fa3b"></a>
- [ ] **D-042035c0019ecba2fa3b** - Catalog — research/library view.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Top-level Enderloom workspaces
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 111-111](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L111-L111)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 4. Catalog + research browser / 4.1 Core research behavior (1)</summary>

<a id="d-bff5dabdec8b9c5f3310"></a>
- [ ] **D-bff5dabdec8b9c5f3310** - Catalog-scoped state.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.1 Core research behavior
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 137-137](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L137-L137)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 4. Catalog + research browser / 4.4 Catalog-to-manager bridge (10)</summary>

<a id="d-1f7537124ef54de2130f"></a>
- [ ] **D-1f7537124ef54de2130f** - Primary Enderloom Install action on supported projects.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.4 Catalog-to-manager bridge
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 203-203](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L203-L203)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-d2747412e4f28827cf00"></a>
- [ ] **D-d2747412e4f28827cf00** - Compact CurseForge/Modrinth launcher handoffs where appropriate.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.4 Catalog-to-manager bridge
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 204-204](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L204-L204)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-51aea1c7d65d4b29878c"></a>
- [ ] **D-51aea1c7d65d4b29878c** - Multi-instance install picker.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.4 Catalog-to-manager bridge
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 205-205](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L205-L205)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-1680a7c0ce63ca0c44e6"></a>
- [ ] **D-1680a7c0ce63ca0c44e6** - Show game-version and loader compatibility.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.4 Catalog-to-manager bridge
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 206-206](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L206-L206)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-e22a00483f34e1411cc9"></a>
- [ ] **D-e22a00483f34e1411cc9** - Show already-installed state.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.4 Catalog-to-manager bridge
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 207-207](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L207-L207)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-06d712bafdf25e80b1e3"></a>
- [ ] **D-06d712bafdf25e80b1e3** - Multi-select target instances.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.4 Catalog-to-manager bridge
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 208-208](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L208-L208)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-92a31b25c36f0b7156c8"></a>
- [ ] **D-92a31b25c36f0b7156c8** - Exact-version planning.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.4 Catalog-to-manager bridge
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 209-209](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L209-L209)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-305635a9c4ac1f8de8f6"></a>
- [ ] **D-305635a9c4ac1f8de8f6** - Dependency/conflict review.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.4 Catalog-to-manager bridge
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 210-210](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L210-L210)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-1c63f724ad0419b72d44"></a>
- [ ] **D-1c63f724ad0419b72d44** - Installed content can reopen focused research.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.4 Catalog-to-manager bridge
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 211-211](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L211-L211)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-f203f76de2f7f0faad7d"></a>
- [ ] **D-f203f76de2f7f0faad7d** - Preserve all distinct source links even when only a few are shown prominently.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.4 Catalog-to-manager bridge
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 212-212](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L212-L212)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 23. Full CLI everywhere / 23.2 CLI parity domains (1)</summary>

<a id="d-111799258c3bf9c27c7c"></a>
- [ ] **D-111799258c3bf9c27c7c** - catalog data/search/import/export/install bridge
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.2 CLI parity domains
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1051-1051](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1051-L1051)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 32. Update/distribution safety (1)</summary>

<a id="d-8cdb878cad0605e9dab1"></a>
- [ ] **D-8cdb878cad0605e9dab1** - Signed/verified update path is required before one-click install is claimed.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 32. Update/distribution safety
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1370-1370](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1370-L1370)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 37. Implementation roadmap / Phase CLI-1 — existing Enderloom domain parity (1)</summary>

<a id="d-0a27f5cdf257f4d3cacb"></a>
- [ ] **D-0a27f5cdf257f4d3cacb** - catalog data operations
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase CLI-1 — existing Enderloom domain parity
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1511-1511](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1511-L1511)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 13. FIRST-CLASS LAUNCHER COMPLETENESS — MAKE ENDERLOOM FEEL FINISHED / 13.5 Mod behavior, side, vanilla-impact, and Forever World intelligence / 13.5.4 A real &quot;Forever World&quot; profile preference (1)</summary>

<a id="d-d2339a3cd11986fdab3e"></a>
- [ ] **D-d2339a3cd11986fdab3e** - Do not secretly hide half the catalog. Prefer/sort/filter intelligently, with an obvious way to show all results.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 13. FIRST-CLASS LAUNCHER COMPLETENESS — MAKE ENDERLOOM FEEL FINISHED / 13.5 Mod behavior, side, vanilla-impact, and Forever World intelligence / 13.5.4 A real &quot;Forever World&quot; profile preference
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 1023-1023](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L1023-L1023) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 1023-1023](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L1023-L1023)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 14. DEFINITION OF DONE — USER-LEVEL OUTCOMES (1)</summary>

<a id="d-52016c54511740eaf321"></a>
- [ ] **D-52016c54511740eaf321** - A Forever World instance preference automatically prioritizes low-impact mods, snapshots risky operations, and flags updates that become more invasive without hiding the rest of th...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** A Forever World instance preference automatically prioritizes low-impact mods, snapshots risky operations, and flags updates that become more invasive without hiding the rest of the catalog.
  - **Binding context:** 14. DEFINITION OF DONE — USER-LEVEL OUTCOMES
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 2252-2252](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L2252-L2252) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 2252-2252](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L2252-L2252)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 1. Shared tab principles (1)</summary>

<a id="d-6c8ab0303d833980b624"></a>
- [ ] **D-6c8ab0303d833980b624** - No artificial caps on favorite items, test history, profiler evidence, or mod results just to make the UI faster.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. Shared tab principles
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 15-15](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L15-L15)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 2. Favorites tab — first-class saved workspace / 2.4 Quick actions from Favorites (2)</summary>

<a id="d-25a688fdc90830a01001"></a>
- [ ] **D-25a688fdc90830a01001** - Install to one instance.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.4 Quick actions from Favorites
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 82-82](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L82-L82)

<a id="d-903c1866becfda4e7624"></a>
- [ ] **D-903c1866becfda4e7624** - Install to multiple instances.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.4 Quick actions from Favorites
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 83-83](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L83-L83)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 19. CLI/automation — only for Favorites + Performance scope / Machine output (1)</summary>

<a id="d-c8b15badbd2f2105e56e"></a>
- [ ] **D-c8b15badbd2f2105e56e** - Logs/warnings go to stderr in machine mode.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Machine output
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 684-684](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L684-L684)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 23. Acceptance tests / Favorites (1)</summary>

<a id="d-044a7d5f7686758191d8"></a>
- [ ] **D-044a7d5f7686758191d8** - Performance badge links to the exact valid result.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Acceptance tests / Favorites
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 788-788](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L788-L788)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 25. Focused definition of done (1)</summary>

<a id="d-6044902695db2c944d96"></a>
- [ ] **D-6044902695db2c944d96** - No caps, disabled content, or fake shortcuts are used to manufacture speed.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 25. Focused definition of done
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 903-903](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L903-L903)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 4. Universal Project / Mod Detail Surface (2)</summary>

<a id="d-71a539c082cace2e6fd5"></a>
- [ ] **D-71a539c082cace2e6fd5** - Install
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Universal Project / Mod Detail Surface
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 206-206](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L206-L206)

<a id="d-3b58c5a52762b876f613"></a>
- [ ] **D-3b58c5a52762b876f613** - Install to multiple instances
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Universal Project / Mod Detail Surface
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 208-208](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L208-L208)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 6. Research / Catalog / Embedded Browser 2.0 (3)</summary>

<a id="d-27935b4b1c197ff11d39"></a>
- [ ] **D-27935b4b1c197ff11d39** - Compatibility-with-selected-instance filter.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Research / Catalog / Embedded Browser 2.0
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 349-349](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L349-L349)

<a id="d-173c471e674d28df309e"></a>
- [ ] **D-173c471e674d28df309e** - Navigation history/bookmarks tied to projects.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Research / Catalog / Embedded Browser 2.0
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 367-367](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L367-L367)

<a id="d-20e6bfb29480b3e75d68"></a>
- [ ] **D-20e6bfb29480b3e75d68** - Send page to current project sources action.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Research / Catalog / Embedded Browser 2.0
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 368-368](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L368-L368)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 18. Autonomous AI Repair Loop (1)</summary>

<a id="d-8ca327bdec2e319f0a9e"></a>
- [ ] **D-8ca327bdec2e319f0a9e** - Install only after applicable gates pass.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 18. Autonomous AI Repair Loop
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 813-813](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L813-L813)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 2. CLI executable contract / Stable exit-code families (1)</summary>

<a id="d-02bdb9286feb5d203d9a"></a>
- [ ] **D-02bdb9286feb5d203d9a** - Minecraft install/launch failure
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. CLI executable contract / Stable exit-code families
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 103-103](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L103-L103)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 3. Full launcher CLI parity checklist / Instances / organization (1)</summary>

<a id="d-0156c8e6e25942278ece"></a>
- [ ] **D-0156c8e6e25942278ece** - enderloom instance favorite
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Instances / organization
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 164-164](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L164-L164)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 3. Full launcher CLI parity checklist / Catalog / research workspace (9)</summary>

<a id="d-0a79c4b04349fab2988a"></a>
- [ ] **D-0a79c4b04349fab2988a** - enderloom catalog list
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Catalog / research workspace
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 276-276](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L276-L276)

<a id="d-768e0b3d10c33f6e7a25"></a>
- [ ] **D-768e0b3d10c33f6e7a25** - enderloom catalog search
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Catalog / research workspace
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 277-277](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L277-L277)

<a id="d-4339ccc4806f15df537a"></a>
- [ ] **D-4339ccc4806f15df537a** - enderloom catalog show
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Catalog / research workspace
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 278-278](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L278-L278)

<a id="d-7bfac817253a4b7a24ab"></a>
- [ ] **D-7bfac817253a4b7a24ab** - enderloom catalog favorite
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Catalog / research workspace
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 279-279](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L279-L279)

<a id="d-8bd6f4e98159da667263"></a>
- [ ] **D-8bd6f4e98159da667263** - enderloom catalog note
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Catalog / research workspace
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 280-280](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L280-L280)

<a id="d-37eaed0d72d24eb91c4c"></a>
- [ ] **D-37eaed0d72d24eb91c4c** - enderloom catalog import
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Catalog / research workspace
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 281-281](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L281-L281)

<a id="d-f01ec2c9cc2e675392a1"></a>
- [ ] **D-f01ec2c9cc2e675392a1** - enderloom catalog export
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Catalog / research workspace
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 282-282](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L282-L282)

<a id="d-be05dcb834a0526e58af"></a>
- [ ] **D-be05dcb834a0526e58af** - enderloom catalog refresh
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Catalog / research workspace
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 283-283](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L283-L283)

<a id="d-58a5e8bb0a19b433408a"></a>
- [ ] **D-58a5e8bb0a19b433408a** - enderloom catalog install bridges to the same instance/install planner used by GUI.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Catalog / research workspace
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 284-284](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L284-L284)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 5. Minecraft runtime control plane (`enderloom mc`) / Core commands (1)</summary>

<a id="d-76535b965c7ae10c77a7"></a>
- [ ] **D-76535b965c7ae10c77a7** - enderloom mc install --instance &lt;ID&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Minecraft runtime control plane (`enderloom mc`) / Core commands
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 336-336](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L336-L336)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 15. Implementation order for Codex / Phase CLI-1 — launcher domain parity (1)</summary>

<a id="d-f88867daa0c5288e1f64"></a>
- [ ] **D-f88867daa0c5288e1f64** - catalog domain operations
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-1 — launcher domain parity
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 847-847](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L847-L847)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md / 27. Definition of Done — Enderloom Apex Conversion Engine / Core conversion (1)</summary>

<a id="d-c8b773f6d16712c87f35"></a>
- [ ] **D-c8b773f6d16712c87f35** - Reusable migration fixes persist in an Adapter Catalog with tests.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 27. Definition of Done — Enderloom Apex Conversion Engine / Core conversion
  - **Original specification:** [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md : 1124-1124](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md#L1124-L1124) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md : 1159-1159](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md#L1159-L1159)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md / 27. Definition of Done — Enderloom Apex Conversion Engine / Core conversion (1)</summary>

<a id="d-fb3ee7a3e6967ff79f7d"></a>
- [ ] **D-fb3ee7a3e6967ff79f7d** - · Reusable migration fixes persist in an Adapter Catalog with tests.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 27. Definition of Done — Enderloom Apex Conversion Engine / Core conversion
  - **Original specification:** [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md :: T006 : 1252-1252](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md#L1252-L1252) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md :: T006 : 1252-1252](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md#L1252-L1252)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v1_ARCHIVED.md / 7. DEPENDENCY + API ADAPTATION — NO SILENT CONTENT LOSS (1)</summary>

<a id="d-9928f6ac6fce8d84ac51"></a>
- [ ] **D-9928f6ac6fce8d84ac51** - If migration logic becomes reusable, add it to Enderloom&#x27;s shared adapter catalog. Do not solve the same API break from scratch for every project.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 7. DEPENDENCY + API ADAPTATION — NO SILENT CONTENT LOSS
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v1_ARCHIVED.md : 313-313](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v1_ARCHIVED.md#L313-L313)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v1_ARCHIVED.md / 10. VERIFICATION — THIS FEATURE IS NOT DONE AT &quot;COMPILES&quot; (1)</summary>

<a id="d-0b79d8c1d56056d0ae78"></a>
- [ ] **D-0b79d8c1d56056d0ae78** - Existing Enderloom launcher/catalog behavior is not regressed.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. VERIFICATION — THIS FEATURE IS NOT DONE AT &quot;COMPILES&quot;
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v1_ARCHIVED.md : 416-416](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v1_ARCHIVED.md#L416-L416)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md / 14. QA CHECKLIST — AUTOMATE THESE / Runtime/release (1)</summary>

<a id="d-3de0baf8c17239b49374"></a>
- [ ] **D-3de0baf8c17239b49374** - existing Enderloom launcher/catalog functionality remains green.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. QA CHECKLIST — AUTOMATE THESE / Runtime/release
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md : 955-955](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md#L955-L955) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 1359-1359](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L1359-L1359)

</details>

<a id="lib-05-details"></a>
## LIB-05 - Dedicated Favorites workspace

[Outcome](Checklist.md#lib-05) / 140 source-derived details.

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 16. Performance Lab integration (1)</summary>

<a id="d-25ae41817380f6e48b42"></a>
- [ ] **D-25ae41817380f6e48b42** - Accepted metrics appear immediately on Mod Manager card, universal mod page, Favorites, Testing dashboard and comparison history.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 16. Performance Lab integration
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 502-502](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L502-L502)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 3. PHASE 0 — PRESERVE AND BASELINE THE EXISTING PRODUCT / 3.2 Existing behavior that must survive all later work (1)</summary>

<a id="d-35cdf190a65ecd62f93b"></a>
- [ ] **D-35cdf190a65ecd62f93b** - Instance/launcher: Vanilla/Fabric/Quilt/Forge/NeoForge creation, MRPack/CurseForge ZIP/packwiz import, groups/tags/favorites, Microsoft auth/entitlement, Java/JVM configuration, re...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** Instance/launcher: Vanilla/Fabric/Quilt/Forge/NeoForge creation, MRPack/CurseForge ZIP/packwiz import, groups/tags/favorites, Microsoft auth/entitlement, Java/JVM configuration, real launch/process/log supervision.
  - **Binding context:** 3. PHASE 0 — PRESERVE AND BASELINE THE EXISTING PRODUCT / 3.2 Existing behavior that must survive all later work
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: P0-013 : 180-180](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L180-L180)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 3. Bedrock Developer Center — full creator/debugger parity / 3.1 Creator project management (1)</summary>

<a id="d-03702cae3b4a505a728e"></a>
- [ ] **D-03702cae3b4a505a728e** - Multi-pack workspace.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Bedrock Developer Center — full creator/debugger parity / 3.1 Creator project management
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 115-115](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L115-L115)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G005 — Favorites/catalog identity and quick actions are clean (1)</summary>

<a id="d-6d0a3b519b37fdee9721"></a>
- [ ] **D-6d0a3b519b37fdee9721** - GATE — Favorites/catalog identity and quick actions are clean
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G005 — Favorites/catalog identity and quick actions are clean
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md :: G005 : 224-224](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L224-L224)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G005 — Favorites/catalog identity and quick actions are clean / T012 — Merge duplicate favorites across CurseForge/Modrinth/other providers (1)</summary>

<a id="d-91e986e1ce19afc60c63"></a>
- [ ] **D-91e986e1ce19afc60c63** - · Merge duplicate favorites across CurseForge/Modrinth/other providers
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G005 — Favorites/catalog identity and quick actions are clean / T012 — Merge duplicate favorites across CurseForge/Modrinth/other providers
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md :: T012 : 239-239](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L239-L239)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 4. Catalog + research browser / 4.1 Core research behavior (1)</summary>

<a id="d-6156650ae063ef8a6ebf"></a>
- [ ] **D-6156650ae063ef8a6ebf** - Favorites.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.1 Core research behavior
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 135-135](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L135-L135)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 5. Launcher / Mod Manager / 5.3 Organization and library UX (1)</summary>

<a id="d-1a5cf2b43f31dee72f08"></a>
- [ ] **D-1a5cf2b43f31dee72f08** - Favorites.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Launcher / Mod Manager / 5.3 Organization and library UX
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 260-260](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L260-L260)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 12. Split research + browser integration (1)</summary>

<a id="d-6c1d3c13a3e060490170"></a>
- [ ] **D-6c1d3c13a3e060490170** - Shell/status labels reflect active workspace.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 12. Split research + browser integration
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 505-505](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L505-L505)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 23. Full CLI everywhere / 23.2 CLI parity domains (1)</summary>

<a id="d-da6efc55965698f6713f"></a>
- [ ] **D-da6efc55965698f6713f** - groups/tags/favorites/organization
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.2 CLI parity domains
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1040-1040](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1040-L1040)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / Enderloom — Performance + Favorites Focused Checklist (1)</summary>

<a id="d-47cf5f3ba760cb42854b"></a>
- [ ] **D-47cf5f3ba760cb42854b** - Do not treat this as the full Enderloom master plan.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** Enderloom — Performance + Favorites Focused Checklist
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 5-5](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L5-L5)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 1. Shared tab principles (1)</summary>

<a id="d-44a74c36d104fcf9ac53"></a>
- [ ] **D-44a74c36d104fcf9ac53** - Favorites and Performance are first-class Enderloom tabs/workspaces, not buried dialogs.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. Shared tab principles
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 11-11](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L11-L11)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 2. Favorites tab — first-class saved workspace / 2.1 Core behavior (8)</summary>

<a id="d-852d3d9f2425c5fecfb5"></a>
- [ ] **D-852d3d9f2425c5fecfb5** - Add/retain a dedicated Favorites tab.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.1 Core behavior
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 31-31](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L31-L31)

<a id="d-d54c500ba48d33eacd11"></a>
- [ ] **D-d54c500ba48d33eacd11** - Any supported mod/project/item can be favorited/unfavorited instantly.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.1 Core behavior
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 32-32](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L32-L32)

<a id="d-bac143fc68545b735bef"></a>
- [ ] **D-bac143fc68545b735bef** - Favorite state persists across restarts.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.1 Core behavior
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 33-33](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L33-L33)

<a id="d-fcf2ad7a82f6ea4d24c4"></a>
- [ ] **D-fcf2ad7a82f6ea4d24c4** - Favorite state updates immediately everywhere in Enderloom.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.1 Core behavior
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 34-34](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L34-L34)

<a id="d-2221ac17cacc8da40c24"></a>
- [ ] **D-2221ac17cacc8da40c24** - No duplicate favorites for the same canonical project/version identity unless intentionally saved as distinct variants.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.1 Core behavior
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 35-35](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L35-L35)

<a id="d-89f4ad3f5929875a9146"></a>
- [ ] **D-89f4ad3f5929875a9146** - Keep favorite data independent of whether the mod is currently installed.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.1 Core behavior
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 37-37](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L37-L37)

<a id="d-1a54b177efa793b37944"></a>
- [ ] **D-1a54b177efa793b37944** - Removing a mod from an instance must not automatically remove it from Favorites.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.1 Core behavior
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 38-38](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L38-L38)

<a id="d-420d008c7bb2cc457bd6"></a>
- [ ] **D-420d008c7bb2cc457bd6** - Unfavoriting never uninstalls or removes content.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.1 Core behavior
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 39-39](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L39-L39)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 2. Favorites tab — first-class saved workspace / 2.2 Organization (15)</summary>

<a id="d-6a603726aac1e36a3325"></a>
- [ ] **D-6a603726aac1e36a3325** - Search Favorites.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.2 Organization
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 43-43](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L43-L43)

<a id="d-4042392c97e75e6074af"></a>
- [ ] **D-4042392c97e75e6074af** - Sort Favorites.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.2 Organization
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 44-44](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L44-L44)

<a id="d-54bcf8e5e6a8b42e436f"></a>
- [ ] **D-54bcf8e5e6a8b42e436f** - Filter Favorites.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.2 Organization
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 45-45](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L45-L45)

<a id="d-40fd8204b9dcd0a6b220"></a>
- [ ] **D-40fd8204b9dcd0a6b220** - Tag Favorites.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.2 Organization
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 46-46](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L46-L46)

<a id="d-e6a24f91fef4286057ae"></a>
- [ ] **D-e6a24f91fef4286057ae** - Create reusable favorite collections/groups.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.2 Organization
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 47-47](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L47-L47)

<a id="d-0fb20bdf360f5a98b4dc"></a>
- [ ] **D-0fb20bdf360f5a98b4dc** - Rename collections/groups.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.2 Organization
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 48-48](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L48-L48)

<a id="d-7d8abf135a4f7d478dae"></a>
- [ ] **D-7d8abf135a4f7d478dae** - Reorder collections/groups.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.2 Organization
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 49-49](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L49-L49)

<a id="d-18342417d805ce36a0b0"></a>
- [ ] **D-18342417d805ce36a0b0** - Drag/drop favorites between collections/groups.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.2 Organization
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 50-50](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L50-L50)

<a id="d-024c9049c91cc2e87ab4"></a>
- [ ] **D-024c9049c91cc2e87ab4** - Allow one favorite to belong to multiple tags/collections when useful.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.2 Organization
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 51-51](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L51-L51)

<a id="d-b56ce38876ffdee0ea8c"></a>
- [ ] **D-b56ce38876ffdee0ea8c** - Pin especially important favorites.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.2 Organization
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 52-52](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L52-L52)

<a id="d-91612251f0ba8a22a1c6"></a>
- [ ] **D-91612251f0ba8a22a1c6** - Add optional notes to favorites.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.2 Organization
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 53-53](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L53-L53)

<a id="d-5b7792291d767efeaefc"></a>
- [ ] **D-5b7792291d767efeaefc** - Bulk-select favorites.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.2 Organization
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 54-54](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L54-L54)

<a id="d-b04c159489e232e7f9b9"></a>
- [ ] **D-b04c159489e232e7f9b9** - Bulk tag/move/remove-from-favorites.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.2 Organization
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 55-55](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L55-L55)

<a id="d-3c4e41b43bc4f3aa023a"></a>
- [ ] **D-3c4e41b43bc4f3aa023a** - Preserve collection order and layout across restart.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.2 Organization
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 56-56](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L56-L56)

<a id="d-29b018374f10541b2c34"></a>
- [ ] **D-29b018374f10541b2c34** - Provide Tiles / List / Table views if the existing Enderloom view system can be reused cleanly.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.2 Organization
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 57-57](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L57-L57)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 2. Favorites tab — first-class saved workspace / 2.3 Favorite cards/rows (12)</summary>

<a id="d-67ba0242b1ef395b6bce"></a>
- [ ] **D-67ba0242b1ef395b6bce** - project/mod name;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.3 Favorite cards/rows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 63-63](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L63-L63)

<a id="d-b08870b8d0d774f5dfe2"></a>
- [ ] **D-b08870b8d0d774f5dfe2** - author/creator where known;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.3 Favorite cards/rows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 66-66](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L66-L66)

<a id="d-16c0e6ba323c8adc7b2b"></a>
- [ ] **D-16c0e6ba323c8adc7b2b** - latest compatible version for the selected/linked instance context;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.3 Favorite cards/rows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 67-67](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L67-L67)

<a id="d-ef07e225d9fe0f073776"></a>
- [ ] **D-ef07e225d9fe0f073776** - currently installed version where applicable;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.3 Favorite cards/rows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 68-68](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L68-L68)

<a id="d-1880a70615ad97a43fcf"></a>
- [ ] **D-1880a70615ad97a43fcf** - update available state;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.3 Favorite cards/rows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 69-69](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L69-L69)

<a id="d-2fdda0766ae4746d2cf3"></a>
- [ ] **D-2fdda0766ae4746d2cf3** - loader compatibility;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.3 Favorite cards/rows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 70-70](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L70-L70)

<a id="d-beafc5a7523aec34f4f2"></a>
- [ ] **D-beafc5a7523aec34f4f2** - Minecraft version compatibility;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.3 Favorite cards/rows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 71-71](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L71-L71)

<a id="d-f9c91ab3d37c76c0f5de"></a>
- [ ] **D-f9c91ab3d37c76c0f5de** - installed/not-installed state;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.3 Favorite cards/rows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 72-72](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L72-L72)

<a id="d-4d069c3e22ed2b6ad741"></a>
- [ ] **D-4d069c3e22ed2b6ad741** - frozen/pinned version state where relevant;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.3 Favorite cards/rows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 73-73](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L73-L73)

<a id="d-0e944bed9205003042b5"></a>
- [ ] **D-0e944bed9205003042b5** - latest Performance verdict/badge when test evidence exists;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.3 Favorite cards/rows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 74-74](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L74-L74)

<a id="d-3ea5b670cfd34bf0fb68"></a>
- [ ] **D-3ea5b670cfd34bf0fb68** - latest tested mod SHA-256/version when performance data exists;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.3 Favorite cards/rows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 75-75](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L75-L75)

<a id="d-386f818210b0a89234f1"></a>
- [ ] **D-386f818210b0a89234f1** - stale/needs-retest badge when the mod changed since the last valid performance result.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.3 Favorite cards/rows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 76-76](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L76-L76)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 2. Favorites tab — first-class saved workspace / 2.4 Quick actions from Favorites (11)</summary>

<a id="d-35ed42bfca1773a3322f"></a>
- [ ] **D-35ed42bfca1773a3322f** - Open project details.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.4 Quick actions from Favorites
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 80-80](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L80-L80)

<a id="d-8a15b032567942aab138"></a>
- [ ] **D-8a15b032567942aab138** - Choose exact version.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.4 Quick actions from Favorites
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 84-84](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L84-L84)

<a id="d-87f322742585d9fc53b6"></a>
- [ ] **D-87f322742585d9fc53b6** - Update installed copy.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.4 Quick actions from Favorites
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 85-85](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L85-L85)

<a id="d-5d33c835e94ea4c1cc2d"></a>
- [ ] **D-5d33c835e94ea4c1cc2d** - Open installed mod in Mod Manager.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.4 Quick actions from Favorites
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 86-86](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L86-L86)

<a id="d-332f15eaa158237d3673"></a>
- [ ] **D-332f15eaa158237d3673** - Open config/related files when installed.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.4 Quick actions from Favorites
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 87-87](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L87-L87)

<a id="d-f0d1c2cb2f8923ada4f1"></a>
- [ ] **D-f0d1c2cb2f8923ada4f1** - Run Quick Scan.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.4 Quick actions from Favorites
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 88-88](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L88-L88)

<a id="d-951696098dd77647823e"></a>
- [ ] **D-951696098dd77647823e** - Run Performance Test.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.4 Quick actions from Favorites
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 89-89](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L89-L89)

<a id="d-9b3ac02082c9fb1ba120"></a>
- [ ] **D-9b3ac02082c9fb1ba120** - Compare tested versions.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.4 Quick actions from Favorites
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 90-90](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L90-L90)

<a id="d-1ad81b4e5f9ee6315861"></a>
- [ ] **D-1ad81b4e5f9ee6315861** - View Performance history.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.4 Quick actions from Favorites
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 91-91](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L91-L91)

<a id="d-43a88babc08931215630"></a>
- [ ] **D-43a88babc08931215630** - Add/edit note.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.4 Quick actions from Favorites
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 92-92](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L92-L92)

<a id="d-71a9ff50530be259ca69"></a>
- [ ] **D-71a9ff50530be259ca69** - Move/tag/pin/unfavorite.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.4 Quick actions from Favorites
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 93-93](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L93-L93)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 2. Favorites tab — first-class saved workspace / 2.5 Favorites ↔ Performance integration (8)</summary>

<a id="d-5b34427ebb7ba309c8e4"></a>
- [ ] **D-5b34427ebb7ba309c8e4** - Favorite a known-good optimization mod and keep its performance history attached.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.5 Favorites ↔ Performance integration
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 97-97](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L97-L97)

<a id="d-f857c8c5d90308e464dd"></a>
- [ ] **D-f857c8c5d90308e464dd** - Favorite a suspected laggy mod directly from Performance results.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.5 Favorites ↔ Performance integration
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 98-98](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L98-L98)

<a id="d-49a0de7b4a5e1c59efaf"></a>
- [ ] **D-49a0de7b4a5e1c59efaf** - Add Test Favorites action to queue selected favorites that are installed/testable.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.5 Favorites ↔ Performance integration
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 99-99](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L99-L99)

<a id="d-5b667c0569b24a10d440"></a>
- [ ] **D-5b667c0569b24a10d440** - Add Show Favorites Only filter in Performance results.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.5 Favorites ↔ Performance integration
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 100-100](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L100-L100)

<a id="d-00ff4565dac28d68ef65"></a>
- [ ] **D-00ff4565dac28d68ef65** - Add Favorite culprit / Favorite known-good quick actions from a result.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.5 Favorites ↔ Performance integration
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 101-101](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L101-L101)

<a id="d-d6b59dbf353c23194700"></a>
- [ ] **D-d6b59dbf353c23194700** - Favorite cards can show measured startup/FPS/TPS/memory impact summaries when valid evidence exists.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.5 Favorites ↔ Performance integration
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 102-102](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L102-L102)

<a id="d-c20db52f179e1d98897e"></a>
- [ ] **D-c20db52f179e1d98897e** - Never show a measured performance badge when only static analysis exists.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.5 Favorites ↔ Performance integration
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 103-103](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L103-L103)

<a id="d-ec0865636a853972682d"></a>
- [ ] **D-ec0865636a853972682d** - When a favorite version changes, retain old history but mark the new version untested/stale.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Favorites tab — first-class saved workspace / 2.5 Favorites ↔ Performance integration
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 104-104](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L104-L104)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 3. Performance / Testing tab — Premium Performance Lab / 3.3 Core test buttons/flows (1)</summary>

<a id="d-1454df5831d152f404a5"></a>
- [ ] **D-1454df5831d152f404a5** - Test Selected Favorites.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.3 Core test buttons/flows
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 152-152](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L152-L152)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 8. Test One Mod — direct A/B proof (1)</summary>

<a id="d-a11265e4c62c76f69d0d"></a>
- [ ] **D-a11265e4c62c76f69d0d** - make result visible from Favorites and the mod details view.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. Test One Mod — direct A/B proof
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 350-350](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L350-L350)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 15. Per-mod Performance page (1)</summary>

<a id="d-3c65ccc3b71e3132efe0"></a>
- [ ] **D-3c65ccc3b71e3132efe0** - Favorite / Unfavorite;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Per-mod Performance page
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 575-575](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L575-L575)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 16. Performance history and staleness (1)</summary>

<a id="d-2e01bec55438e3a46db7"></a>
- [ ] **D-2e01bec55438e3a46db7** - Favorites reflect stale/current test state immediately.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 16. Performance history and staleness
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 592-592](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L592-L592)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 18. Favorites + Performance QOL (13)</summary>

<a id="d-6f1f9045daa993f521a0"></a>
- [ ] **D-6f1f9045daa993f521a0** - Performance badges on favorite cards.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 18. Favorites + Performance QOL
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 619-619](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L619-L619)

<a id="d-de373ffe1762e35ee48b"></a>
- [ ] **D-de373ffe1762e35ee48b** - Favorite directly from a culprit list.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 18. Favorites + Performance QOL
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 620-620](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L620-L620)

<a id="d-8e1fe10608b129e45413"></a>
- [ ] **D-8e1fe10608b129e45413** - Test selected favorites.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 18. Favorites + Performance QOL
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 621-621](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L621-L621)

<a id="d-809e1d66c85435f363ba"></a>
- [ ] **D-809e1d66c85435f363ba** - Filter Performance results to Favorites.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 18. Favorites + Performance QOL
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 622-622](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L622-L622)

<a id="d-12bfd00df7a05b16f7ab"></a>
- [ ] **D-12bfd00df7a05b16f7ab** - Filter Favorites by performance status: - Measured offender; - Suspected; - Interaction; - No measurable impact; - Untested; - Stale.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 18. Favorites + Performance QOL
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 623-629](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L623-L629)

<a id="d-e2ec5b4cf02169895d30"></a>
- [ ] **D-e2ec5b4cf02169895d30** - Sort Favorites by measured impact.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 18. Favorites + Performance QOL
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 630-630](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L630-L630)

<a id="d-8cee04022a98a40a5b98"></a>
- [ ] **D-8cee04022a98a40a5b98** - Sort Favorites by last test date.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 18. Favorites + Performance QOL
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 631-631](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L631-L631)

<a id="d-39e70f0fa6de832d2924"></a>
- [ ] **D-39e70f0fa6de832d2924** - Sort Favorites by update availability.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 18. Favorites + Performance QOL
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 632-632](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L632-L632)

<a id="d-f7399fa0e3cf55441c50"></a>
- [ ] **D-f7399fa0e3cf55441c50** - Bulk queue favorites for Quick Scan.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 18. Favorites + Performance QOL
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 633-633](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L633-L633)

<a id="d-12d25356160ed26ada91"></a>
- [ ] **D-12d25356160ed26ada91** - Bulk queue favorites for runtime tests.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 18. Favorites + Performance QOL
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 634-634](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L634-L634)

<a id="d-62fb1c5297fc25235dd0"></a>
- [ ] **D-62fb1c5297fc25235dd0** - One-click compare favorite old/new version performance.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 18. Favorites + Performance QOL
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 635-635](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L635-L635)

<a id="d-908990047e8626b1b4ae"></a>
- [ ] **D-908990047e8626b1b4ae** - Keep notes alongside performance history so the user can record why a mod is being watched.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 18. Favorites + Performance QOL
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 636-636](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L636-L636)

<a id="d-e6d9ba1a74c94356a9ec"></a>
- [ ] **D-e6d9ba1a74c94356a9ec** - Show Why? for every performance badge/culprit recommendation.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 18. Favorites + Performance QOL
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 637-637](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L637-L637)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 19. CLI/automation — only for Favorites + Performance scope / Favorites CLI (8)</summary>

<a id="d-593bffb05207dc040cab"></a>
- [ ] **D-593bffb05207dc040cab** - enderloom favorites list
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Favorites CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 647-647](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L647-L647)

<a id="d-f76f73a34ddb79bc23ac"></a>
- [ ] **D-f76f73a34ddb79bc23ac** - enderloom favorites add &lt;project&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Favorites CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 648-648](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L648-L648)

<a id="d-44a951d458ae648ebe38"></a>
- [ ] **D-44a951d458ae648ebe38** - enderloom favorites remove &lt;project&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Favorites CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 649-649](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L649-L649)

<a id="d-3018a468170c3ec4d040"></a>
- [ ] **D-3018a468170c3ec4d040** - enderloom favorites show &lt;project&gt;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Favorites CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 650-650](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L650-L650)

<a id="d-557755c9111df2e34125"></a>
- [ ] **D-557755c9111df2e34125** - enderloom favorites tag ...
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Favorites CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 651-651](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L651-L651)

<a id="d-9a9ca7eaca2cb712be8c"></a>
- [ ] **D-9a9ca7eaca2cb712be8c** - enderloom favorites collection ...
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Favorites CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 652-652](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L652-L652)

<a id="d-cb1d34bbfa17a9eef209"></a>
- [ ] **D-cb1d34bbfa17a9eef209** - enderloom favorites note ...
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Favorites CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 653-653](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L653-L653)

<a id="d-2646df3b63ca05688147"></a>
- [ ] **D-2646df3b63ca05688147** - filters/sort in machine-readable output;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Favorites CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 654-654](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L654-L654)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 19. CLI/automation — only for Favorites + Performance scope / Performance/Test CLI (20)</summary>

<a id="d-01d9a7db3a7c16900e1c"></a>
- [ ] **D-01d9a7db3a7c16900e1c** - enderloom test quick-scan
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Performance/Test CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 659-659](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L659-L659)

<a id="d-64ec24ceebf3225665f8"></a>
- [ ] **D-64ec24ceebf3225665f8** - enderloom test startup
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Performance/Test CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 660-660](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L660-L660)

<a id="d-d8d4fc014e87c52f4f6a"></a>
- [ ] **D-d8d4fc014e87c52f4f6a** - enderloom test client-fps
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Performance/Test CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 661-661](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L661-L661)

<a id="d-3d6061973a19aca72e66"></a>
- [ ] **D-3d6061973a19aca72e66** - enderloom test server-tps
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Performance/Test CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 662-662](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L662-L662)

<a id="d-9f33709a97b56a468ec4"></a>
- [ ] **D-9f33709a97b56a468ec4** - enderloom test memory
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Performance/Test CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 663-663](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L663-L663)

<a id="d-96c8f65b219de67aef4a"></a>
- [ ] **D-96c8f65b219de67aef4a** - enderloom test lag-spikes
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Performance/Test CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 664-664](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L664-L664)

<a id="d-bceed649d93d70a3ca99"></a>
- [ ] **D-bceed649d93d70a3ca99** - enderloom test mod-impact
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Performance/Test CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 665-665](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L665-L665)

<a id="d-a41b230f143acd69f743"></a>
- [ ] **D-a41b230f143acd69f743** - enderloom test interactions
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Performance/Test CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 666-666](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L666-L666)

<a id="d-984b6fc9dd6f5464beb0"></a>
- [ ] **D-984b6fc9dd6f5464beb0** - enderloom test all
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Performance/Test CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 667-667](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L667-L667)

<a id="d-a01e8dc4b51317a02e8e"></a>
- [ ] **D-a01e8dc4b51317a02e8e** - enderloom test favorites
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Performance/Test CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 668-668](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L668-L668)

<a id="d-501d06894131e308472b"></a>
- [ ] **D-501d06894131e308472b** - enderloom test baseline ...
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Performance/Test CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 669-669](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L669-L669)

<a id="d-326b669073c8ee6adc2c"></a>
- [ ] **D-326b669073c8ee6adc2c** - enderloom test history ...
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Performance/Test CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 670-670](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L670-L670)

<a id="d-065ec4e4d89cffdcbb02"></a>
- [ ] **D-065ec4e4d89cffdcbb02** - enderloom test compare ...
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Performance/Test CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 671-671](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L671-L671)

<a id="d-c51bf498ca6c1694210c"></a>
- [ ] **D-c51bf498ca6c1694210c** - enderloom test regression ...
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Performance/Test CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 672-672](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L672-L672)

<a id="d-071ed1bc89454d05e3ad"></a>
- [ ] **D-071ed1bc89454d05e3ad** - enderloom test result ...
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Performance/Test CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 673-673](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L673-L673)

<a id="d-366694e260d0fde3e94d"></a>
- [ ] **D-366694e260d0fde3e94d** - enderloom test artifacts ...
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Performance/Test CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 674-674](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L674-L674)

<a id="d-01f2f26b14647186d3bd"></a>
- [ ] **D-01f2f26b14647186d3bd** - enderloom test export ...
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Performance/Test CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 675-675](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L675-L675)

<a id="d-c277da381b1ba7443671"></a>
- [ ] **D-c277da381b1ba7443671** - enderloom test cancel ...
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Performance/Test CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 676-676](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L676-L676)

<a id="d-4f9aadcf9787f3b9f9d2"></a>
- [ ] **D-4f9aadcf9787f3b9f9d2** - enderloom test resume ...
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Performance/Test CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 677-677](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L677-L677)

<a id="d-896379529fdcceacb143"></a>
- [ ] **D-896379529fdcceacb143** - enderloom test scenario ...
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Performance/Test CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 678-678](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L678-L678)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 19. CLI/automation — only for Favorites + Performance scope / Machine output (6)</summary>

<a id="d-874ab32a971a6f52f0aa"></a>
- [ ] **D-874ab32a971a6f52f0aa** - --json clean result envelope.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Machine output
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 682-682](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L682-L682)

<a id="d-80020eb82ae79fcae74f"></a>
- [ ] **D-80020eb82ae79fcae74f** - --jsonl structured progress/events.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Machine output
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 683-683](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L683-L683)

<a id="d-94dc7a0a589ed61f358c"></a>
- [ ] **D-94dc7a0a589ed61f358c** - Stable schema version.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Machine output
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 685-685](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L685-L685)

<a id="d-4b52959b6d9634110152"></a>
- [ ] **D-4b52959b6d9634110152** - Stable trace/test IDs.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Machine output
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 686-686](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L686-L686)

<a id="d-55d70706a8a3502b9205"></a>
- [ ] **D-55d70706a8a3502b9205** - Stable exit-code families.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Machine output
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 687-687](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L687-L687)

<a id="d-a3744896ba6371cfe066"></a>
- [ ] **D-a3744896ba6371cfe066** - No secrets in argv or structured output.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Machine output
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 688-688](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L688-L688)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 23. Acceptance tests / Favorites (7)</summary>

<a id="d-30a3d1ac3a43cef61c10"></a>
- [ ] **D-30a3d1ac3a43cef61c10** - Favorite survives restart.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Acceptance tests / Favorites
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 782-782](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L782-L782)

<a id="d-7337c883722325e307f2"></a>
- [ ] **D-7337c883722325e307f2** - Unfavorite does not uninstall anything.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Acceptance tests / Favorites
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 783-783](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L783-L783)

<a id="d-631263cfe07b8e4d3114"></a>
- [ ] **D-631263cfe07b8e4d3114** - Collections/tags/notes survive restart.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Acceptance tests / Favorites
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 784-784](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L784-L784)

<a id="d-75051e2b6858eb3959f2"></a>
- [ ] **D-75051e2b6858eb3959f2** - Bulk operations affect only selected favorites.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Acceptance tests / Favorites
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 785-785](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L785-L785)

<a id="d-c03f12ec98b7a88ec95c"></a>
- [ ] **D-c03f12ec98b7a88ec95c** - Installed/uninstalled state refreshes correctly.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Acceptance tests / Favorites
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 787-787](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L787-L787)

<a id="d-8bc597a7296bb6a8ef1c"></a>
- [ ] **D-8bc597a7296bb6a8ef1c** - Stale performance result is visibly marked stale after version/config/environment change.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Acceptance tests / Favorites
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 789-789](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L789-L789)

<a id="d-6d5e85e20baa73fd3646"></a>
- [ ] **D-6d5e85e20baa73fd3646** - Test Selected Favorites queues the correct installed/testable mods.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Acceptance tests / Favorites
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 790-790](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L790-L790)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 23. Acceptance tests / CLI (1)</summary>

<a id="d-356d28341297fd5382bc"></a>
- [ ] **D-356d28341297fd5382bc** - Favorites CLI and GUI produce the same persisted state.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Acceptance tests / CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 811-811](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L811-L811)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 24. Implementation order / Phase 1 — Favorites polish (6)</summary>

<a id="d-b9a50edd31d464639b4b"></a>
- [ ] **D-b9a50edd31d464639b4b** - Dedicated Favorites workspace cleanup.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 1 — Favorites polish
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 826-826](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L826-L826)

<a id="d-552cc53e618a3d61fe75"></a>
- [ ] **D-552cc53e618a3d61fe75** - Persistent canonical favorite model.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 1 — Favorites polish
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 827-827](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L827-L827)

<a id="d-d87541abd505c9d8a881"></a>
- [ ] **D-d87541abd505c9d8a881** - Collections/tags/pinning/notes.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 1 — Favorites polish
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 828-828](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L828-L828)

<a id="d-d18dc6bbc5aa4011f992"></a>
- [ ] **D-d18dc6bbc5aa4011f992** - Search/sort/filter/views.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 1 — Favorites polish
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 829-829](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L829-L829)

<a id="d-492999b1fd92b2a12698"></a>
- [ ] **D-492999b1fd92b2a12698** - Quick actions.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 1 — Favorites polish
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 830-830](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L830-L830)

<a id="d-1b2d677fe7a563fa6624"></a>
- [ ] **D-1b2d677fe7a563fa6624** - Performance badge integration hooks.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 1 — Favorites polish
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 831-831](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L831-L831)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 24. Implementation order / Phase 3 — Direct mod impact (1)</summary>

<a id="d-2f092fb9a6d404d9d7ba"></a>
- [ ] **D-2f092fb9a6d404d9d7ba** - Favorites badges/actions.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 3 — Direct mod impact
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 850-850](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L850-L850)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 24. Implementation order / Phase 5 — Deep profilers + whole-pack intelligence (1)</summary>

<a id="d-a80f0dc543ca48d44c2e"></a>
- [ ] **D-a80f0dc543ca48d44c2e** - Test Favorites workflow.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 5 — Deep profilers + whole-pack intelligence
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 870-870](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L870-L870)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 24. Implementation order / Phase 6 — CLI + AI handoff polish (1)</summary>

<a id="d-be1176a2448a90fded78"></a>
- [ ] **D-be1176a2448a90fded78** - Favorites CLI.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 6 — CLI + AI handoff polish
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 874-874](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L874-L874)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 25. Focused definition of done (5)</summary>

<a id="d-8dce7ab5085de34a29ab"></a>
- [ ] **D-8dce7ab5085de34a29ab** - Favorites is a polished, persistent, searchable, organizable workspace.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 25. Focused definition of done
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 888-888](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L888-L888)

<a id="d-e23efe66a577f160e91b"></a>
- [ ] **D-e23efe66a577f160e91b** - Favorites and Performance share accurate current state.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 25. Focused definition of done
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 890-890](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L890-L890)

<a id="d-b661baa65908cfd2c4bb"></a>
- [ ] **D-b661baa65908cfd2c4bb** - Favorites show current/stale performance status accurately.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 25. Focused definition of done
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 897-897](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L897-L897)

<a id="d-c43e4cd17aba9319138b"></a>
- [ ] **D-c43e4cd17aba9319138b** - Selected favorites can be queued for testing.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 25. Focused definition of done
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 898-898](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L898-L898)

<a id="d-34c9e4e4ea89a3915761"></a>
- [ ] **D-34c9e4e4ea89a3915761** - CLI can operate Favorites and Performance/Test workflows using the same domain logic.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 25. Focused definition of done
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 899-899](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L899-L899)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 16. Premium Performance Lab — evidence everywhere (1)</summary>

<a id="d-615b8f044f8f07523807"></a>
- [ ] **D-615b8f044f8f07523807** - Favorites can show known-good/known-bad measured state.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 16. Premium Performance Lab — evidence everywhere
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 747-747](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L747-L747)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 38. Micro-QOL saturation pass (1)</summary>

<a id="d-cb975f1724663d7699ce"></a>
- [ ] **D-cb975f1724663d7699ce** - favorites/pins;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 38. Micro-QOL saturation pass
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1420-1420](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1420-L1420)

</details>

<a id="lib-06-details"></a>
## LIB-06 - Content lifecycle and provenance

[Outcome](Checklist.md#lib-06) / 91 source-derived details.

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 3. Provider Adapter architecture (1)</summary>

<a id="d-c610c2da8e8079f98889"></a>
- [ ] **D-c610c2da8e8079f98889** - Never read passwords, auth cookies, unrelated chats, unrelated page content, or private data outside the active repair workflow.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 133-133](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L133-L133)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 5. Intake: &quot;Hey, fix this&quot; (1)</summary>

<a id="d-7eb33378e2a27f00d8d9"></a>
- [ ] **D-7eb33378e2a27f00d8d9** - content-loss regression;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Intake: &quot;Hey, fix this&quot;
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 198-198](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L198-L198)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 7. Prompt compiler (1)</summary>

<a id="d-b4f4fd0f0ab6f68a6365"></a>
- [ ] **D-b4f4fd0f0ab6f68a6365** - require content inventory parity report.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Prompt compiler
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 284-284](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L284-L284)

</details>

<details>
<summary>CODEX_HANDOFF_ULTIMATE_MINECRAFT_WORKBENCH.md / Codex Handoff — Enderloom Ultimate Minecraft Workbench / Non-negotiable product law (1)</summary>

<a id="d-984854a44f3ac3096f24"></a>
- [ ] **D-984854a44f3ac3096f24** - Every relevant feature must consume and update the same canonical Minecraft project/evidence graph. Performance results must surface directly on mods/Favorites/update planning/repa...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** Every relevant feature must consume and update the same canonical Minecraft project/evidence graph. Performance results must surface directly on mods/Favorites/update planning/repair. Crashes must link to exact culprit mod/source/config. World hotspots must link to owning mod content when known. Config/version changes invalidate only dependent evidence. Conversion and port failures can enter the same repair/testing loop. Returned AI artifacts update repair/source/performance/compatibility provenance rather than living in a separate subsystem.
  - **Binding context:** Codex Handoff — Enderloom Ultimate Minecraft Workbench / Non-negotiable product law
  - **Original specification:** [CODEX_HANDOFF_ULTIMATE_MINECRAFT_WORKBENCH.md : 30-30](https://github.com/Herbertofury/Enderloom/blob/main/docs/CODEX_HANDOFF_ULTIMATE_MINECRAFT_WORKBENCH.md#L30-L30)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 1. NON-NEGOTIABLE PRODUCT LAWS / 1.4 Locked product decisions (1)</summary>

<a id="d-36296ae54522eceb41db"></a>
- [ ] **D-36296ae54522eceb41db** - DEC-R03 Do not promote Content Replacement Assistant unless the user explicitly approves it later.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. NON-NEGOTIABLE PRODUCT LAWS / 1.4 Locked product decisions
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md : 125-125](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L125-L125)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 3. PHASE 0 — PRESERVE AND BASELINE THE EXISTING PRODUCT / 3.2 Existing behavior that must survive all later work (1)</summary>

<a id="d-2b924ae28a21c1112d97"></a>
- [ ] **D-2b924ae28a21c1112d97** - Content lifecycle: mods/resource packs/shaders/datapacks install/enable/disable/remove/update/exact-version/freeze/dependency planning/provenance.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. PHASE 0 — PRESERVE AND BASELINE THE EXISTING PRODUCT / 3.2 Existing behavior that must survive all later work
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: P0-014 : 181-181](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L181-L181)

</details>

<details>
<summary>ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md / 5A. Second-sweep integration expansion - revision 2 / 5A.6 Required corrections and anti-false-positive rules (1)</summary>

<a id="d-d54ff77910b385356f90"></a>
- [ ] **D-d54ff77910b385356f90** - Resource limits versus content loss. Archive depth, parser memory, process time, retry limits and concurrency controls are safety/operational boundaries. Reaching one produces a re...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** Resource limits versus content loss. Archive depth, parser memory, process time, retry limits and concurrency controls are safety/operational boundaries. Reaching one produces a resumable failure with exact unprocessed inputs. It must not silently truncate the result, replace missing files, or mark a reduced census complete.
  - **Binding context:** 5A. Second-sweep integration expansion - revision 2 / 5A.6 Required corrections and anti-false-positive rules / 5A. Specialized engines and integration tasks / 5A.6 Required corrections and anti-false-positive rules
  - **Original specification:** [ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md : 641-641](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md#L641-L641) / [ENDERLOOM_STUDIO_EXECUTION.md : 803-803](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L803-L803)

</details>

<details>
<summary>ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md / 11. Performance Patch Acceptance Contract (1)</summary>

<a id="d-03df01071608f8fdc7ad"></a>
- [ ] **D-03df01071608f8fdc7ad** - feature/content inventory parity;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Performance Patch Acceptance Contract
  - **Original specification:** [ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md : 279-279](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_DEVKIT_WORKFLOW_GAP_PASS.md#L279-L279)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 2. Security &amp; Supply-Chain Center — missing critical layer / 2.2 Threat intelligence and provenance (1)</summary>

<a id="d-612087e252757de79f84"></a>
- [ ] **D-612087e252757de79f84** - Compare artifact byte identity across CurseForge/Modrinth/GitHub mirrors.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Security &amp; Supply-Chain Center — missing critical layer / 2.2 Threat intelligence and provenance
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 74-74](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L74-L74)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 10. Registry / Recipe / Content Explorer (5)</summary>

<a id="d-75b8cd0ae80a6f76957b"></a>
- [ ] **D-75b8cd0ae80a6f76957b** - Loot sources.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Registry / Recipe / Content Explorer
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 559-559](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L559-L559)

<a id="d-f68971288adac8913cef"></a>
- [ ] **D-f68971288adac8913cef** - Mob spawn sources/biomes/rules.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Registry / Recipe / Content Explorer
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 560-560](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L560-L560)

<a id="d-15148e95224a6c91d179"></a>
- [ ] **D-15148e95224a6c91d179** - Config knobs associated with content where known.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Registry / Recipe / Content Explorer
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 565-565](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L565-L565)

<a id="d-9ed63f692cdaf43848c2"></a>
- [ ] **D-9ed63f692cdaf43848c2** - Generate a museum/QA world that lays out/spawns every testable content type.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Registry / Recipe / Content Explorer
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 569-569](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L569-L569)

<a id="d-afdad431ad6985cebe89"></a>
- [ ] **D-afdad431ad6985cebe89** - Content inventory becomes a release/port/conversion regression gate.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 10. Registry / Recipe / Content Explorer
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 570-570](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L570-L570)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 13. Collaboration / Shared Instances / Team Pack Authoring / 13.1 Shared instances (1)</summary>

<a id="d-cef989026ea9a163f46c"></a>
- [ ] **D-cef989026ea9a163f46c** - Share content/config changes.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Collaboration / Shared Instances / Team Pack Authoring / 13.1 Shared instances
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 673-673](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L673-L673)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 25. Pack/Release Permission &amp; Policy Gate (3)</summary>

<a id="d-5855dea0da549b7b9cf6"></a>
- [ ] **D-5855dea0da549b7b9cf6** - Generate manifest-based downloads for nonredistributable content instead of bundling it.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 25. Pack/Release Permission &amp; Policy Gate
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 969-969](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L969-L969)

<a id="d-2897ae4c6a5ee433f011"></a>
- [ ] **D-2897ae4c6a5ee433f011** - Flag private/unpublished/local content.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 25. Pack/Release Permission &amp; Policy Gate
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 970-970](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L970-L970)

<a id="d-79d25e53df45e5ef35cb"></a>
- [ ] **D-79d25e53df45e5ef35cb** - Flag patched/derivative binaries and their provenance.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 25. Pack/Release Permission &amp; Policy Gate
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 971-971](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L971-L971)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / Context (1)</summary>

<a id="d-fda0dd6a0481e5bf2b41"></a>
- [ ] **D-fda0dd6a0481e5bf2b41** - Addon correction: provider-backed addons/customizations must behave like first-class online projects, not like a loose-file junk drawer. When Enderloom can identify a real CurseFor...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** Addon correction: provider-backed addons/customizations must behave like first-class online projects, not like a loose-file junk drawer. When Enderloom can identify a real CurseForge/Modrinth/etc. project and release file, the Addons surface must retain that online identity, use that provider release for install/update, and present the same polished project-page/card UX as the Mods surface. Local/private addon files remain supported, but must be explicitly shown as local/unlinked rather than being given a fake provider identity.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / Context
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md : 20-20](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L20-L20)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G002 — Browser/download experience behaves like a normal modern browser / T005 — Browser extensions (1)</summary>

<a id="d-9bf9db19f1b7f5cd3c9a"></a>
- [ ] **D-9bf9db19f1b7f5cd3c9a** - - install/import supported extensions; - enable/disable; - remove; - inspect permissions/source; - show compatibility/update state; - persist across Enderloom restart and app upgra...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - install/import supported extensions; - enable/disable; - remove; - inspect permissions/source; - show compatibility/update state; - persist across Enderloom restart and app upgrades; - keep extension/profile data outside replaceable packaged application binaries; - never silently copy browser secrets from unrelated profiles.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G002 — Browser/download experience behaves like a normal modern browser / T005 — Browser extensions
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md : 125-132](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L125-L132)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G006 — Files, logs, addons, and guided installs act like desktop software / T016 — One universal guided-install engine (1)</summary>

<a id="d-fa323829a78509c34d04"></a>
- [ ] **D-fa323829a78509c34d04** - Replace narrow/siloed guided-install cards with one canonical flow for recognized installable Minecraft content. Provider-backed content must enter this same flow from its online p...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** Replace narrow/siloed guided-install cards with one canonical flow for recognized installable Minecraft content. Provider-backed content must enter this same flow from its online project/file page exactly like a normal mod install; “guided install” is a typed installation behavior, not a separate collection or alternate UI.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G006 — Files, logs, addons, and guided installs act like desktop software / T016 — One universal guided-install engine
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md : 294-294](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L294-L294)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G006 — Files, logs, addons, and guided installs act like desktop software / T023 — Provider-backed addon discovery, identity, download, update, and dependency lifecycle (2)</summary>

<a id="d-f410a832a8bd6cc25ff1"></a>
- [ ] **D-f410a832a8bd6cc25ff1** - - Use the shared provider adapters and canonical project identity graph already used by mods. Do not build a second addon-only provider database. - Resolve provider identity using ...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - Use the shared provider adapters and canonical project identity graph already used by mods. Do not build a second addon-only provider database. - Resolve provider identity using strongest available evidence: provider project/file IDs, provider API metadata, canonical project URL, file fingerprint/hash, exact release metadata, upstream/source links, dependency/relations data, and known content-family manifests. Filename/display-name matching alone is insufficient. - If an existing local addon is not yet linked, research supported providers for candidate project/files in the background. Auto-link only when the evidence is strong enough to avoid cross-project collisions; otherwise surface a compact Link project / Research provider action with candidate evidence. - Once linked, retain provider/project/file IDs so subsequent refreshes do not have to rediscover identity from scratch. - Provider-backed addon cards/details must expose the normal lifecycle: provider/source links, files/versions, compatible releases, dependencies/relations, changelog/release notes where available, favorite, update, freeze/pin, remove, reinstall/change-version, provenance, and Open provider research. - Installation must use the selected real provider release/download, not a scraped arbitrary attachment. Validate redirects, expected filename/size/hash when available, compatibility, and dependency closure through the normal download/install transaction. - Typed addon installers determine the correct destination without pretending the artifact is a mod JAR. For a recognized family such as TaCZ gunpacks, use the version/family adapter to install the provider-downloaded ZIP into the correct TaCZ content location for that target, preserving any required archive form. - Online project descriptions/instructions may inform a typed adapter and evidence, but raw prose must never be blindly executed as filesystem commands. - Detect required/strongly recommended host mods/libraries from provider relations plus validated project metadata/known family rules, and feed missing requirements into the same dependency planner used for normal mods. - Update checks compare the installed provider file identity against compatible online provider releases. Updating replaces the prior addon artifact transactionally and preserves the logical project identity, just like T001 requires for mods. - If a provider project disappears or is temporarily unreachable, preserve the installed addon, cached metadata, provider identity, and last-known release state; do not demote it into a random local file. - Cross-provider duplicates of the same addon project collapse under one canonical project with source badges/options using the same identity rules as T012. - Do not count arbitrary files inside config/, datapack folders, or addon working directories as separate “addons” merely because they are JSON/ZIP files.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G006 — Files, logs, addons, and guided installs act like desktop software / T023 — Provider-backed addon discovery, identity, download, update, and dependency lifecycle
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md : 344-356](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L344-L356)

<a id="d-3ab5412335f99b120a28"></a>
- [ ] **D-3ab5412335f99b120a28** - Required real regression fixture: https://www.curseforge.com/minecraft/customization/tacz-helldivers-escalation-of-freedom (CurseForge project ID 1091118) must resolve as one provi...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** Required real regression fixture: https://www.curseforge.com/minecraft/customization/tacz-helldivers-escalation-of-freedom (CurseForge project ID 1091118) must resolve as one provider-backed customization/addon project, preserve its CurseForge project/file identity, show its compatible releases/files and relations, download a selected compatible provider file through the normal pipeline, and install it through the TaCZ-appropriate typed destination instead of mods/. The fixture must remain provider-linked after restart and must update from a later compatible provider file without becoming an anonymous ZIP.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G006 — Files, logs, addons, and guided installs act like desktop software / T023 — Provider-backed addon discovery, identity, download, update, and dependency lifecycle
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md : 358-358](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L358-L358)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G006 — Files, logs, addons, and guided installs act like desktop software / T024 — Addons must use the normal Mods-tab card/detail UI system (1)</summary>

<a id="d-4ca958e4b0ca6d184a89"></a>
- [ ] **D-4ca958e4b0ca6d184a89** - UI acceptance fixture: the TaCZ Helldivers CurseForge customization above must look and behave like a normal provider-backed project in Enderloom, differing from a mod page only wh...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** UI acceptance fixture: the TaCZ Helldivers CurseForge customization above must look and behave like a normal provider-backed project in Enderloom, differing from a mod page only where its content type/install semantics genuinely differ.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G006 — Files, logs, addons, and guided installs act like desktop software / T024 — Addons must use the normal Mods-tab card/detail UI system
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md : 378-378](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L378-L378)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 5. Launcher / Mod Manager / 5.1 External launcher discovery and in-place connection (3)</summary>

<a id="d-07e190c1711bf3aaea75"></a>
- [ ] **D-07e190c1711bf3aaea75** - Connect in place with zero mandatory copying.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Launcher / Mod Manager / 5.1 External launcher discovery and in-place connection
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 235-235](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L235-L235)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-7864cf2a5a927116875c"></a>
- [ ] **D-7864cf2a5a927116875c** - Reconcile moves, version changes, loader changes, and content changes safely.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Launcher / Mod Manager / 5.1 External launcher discovery and in-place connection
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 237-237](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L237-L237)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-158ae41c66687b0b4dc1"></a>
- [ ] **D-158ae41c66687b0b4dc1** - Detect junction-backed duplicates by physical path.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Launcher / Mod Manager / 5.1 External launcher discovery and in-place connection
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 238-238](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L238-L238)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 6. Content management / 6.1 Provider-backed discovery/install (2)</summary>

<a id="d-3d12d54f547f5442e747"></a>
- [ ] **D-3d12d54f547f5442e747** - Provider identity/provenance.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.1 Provider-backed discovery/install
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 340-340](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L340-L340)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-c2fcea5cca02a711d7f1"></a>
- [ ] **D-c2fcea5cca02a711d7f1** - Managed and manual content coexist.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.1 Provider-backed discovery/install
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 345-345](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L345-L345)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 6. Content management / 6.2 Content lifecycle (10)</summary>

<a id="d-d0938cd8d2b67378bd9c"></a>
- [ ] **D-d0938cd8d2b67378bd9c** - Add/install.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.2 Content lifecycle
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 351-351](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L351-L351)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-51de22a01b7b644a6d79"></a>
- [ ] **D-51de22a01b7b644a6d79** - Enable/disable.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.2 Content lifecycle
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 352-352](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L352-L352)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-8f8921578635941ffa1e"></a>
- [ ] **D-8f8921578635941ffa1e** - Delete/remove.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.2 Content lifecycle
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 353-353](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L353-L353)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-55af8666d4e632585c3a"></a>
- [ ] **D-55af8666d4e632585c3a** - Reconcile filesystem state.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.2 Content lifecycle
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 354-354](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L354-L354)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-06493cae03cc973eab23"></a>
- [ ] **D-06493cae03cc973eab23** - Check updates.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.2 Content lifecycle
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 355-355](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L355-L355)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-30e2f7c8273b1223f8c8"></a>
- [ ] **D-30e2f7c8273b1223f8c8** - Plan updates.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.2 Content lifecycle
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 356-356](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L356-L356)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-3a55edc50ec401177d92"></a>
- [ ] **D-3a55edc50ec401177d92** - Apply updates.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.2 Content lifecycle
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 357-357](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L357-L357)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-188d2f124964d5f40c4e"></a>
- [ ] **D-188d2f124964d5f40c4e** - Show dependents.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.2 Content lifecycle
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 359-359](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L359-L359)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-3419ad1ec715fe984c46"></a>
- [ ] **D-3419ad1ec715fe984c46** - Rollback/pre-change snapshot where appropriate.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.2 Content lifecycle
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 360-360](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L360-L360)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-777c92cad580069c2553"></a>
- [ ] **D-777c92cad580069c2553** - Persistent provenance.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.2 Content lifecycle
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 361-361](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L361-L361)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 6. Content management / 6.3 Exact version control (1)</summary>

<a id="d-79c9a4a7dc884b31fe3d"></a>
- [ ] **D-79c9a4a7dc884b31fe3d** - Changelog inspection.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.3 Exact version control
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 367-367](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L367-L367)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 8. Worlds + data packs (1)</summary>

<a id="d-e87e092650e40321acef"></a>
- [ ] **D-e87e092650e40321acef** - Data-pack add/install/update/enable/disable/remove.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. Worlds + data packs
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 414-414](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L414-L414)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 23. Full CLI everywhere / 23.2 CLI parity domains (1)</summary>

<a id="d-eb82ea9b037afb653d90"></a>
- [ ] **D-eb82ea9b037afb653d90** - content/mods/resource packs/shaders/data packs
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.2 CLI parity domains
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1042-1042](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1042-L1042)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 37. Implementation roadmap / Phase CLI-1 — existing Enderloom domain parity (1)</summary>

<a id="d-a3c23a5316eb0d2a07d7"></a>
- [ ] **D-a3c23a5316eb0d2a07d7** - content/mods
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Implementation roadmap / Phase CLI-1 — existing Enderloom domain parity
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1501-1501](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1501-L1501)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 13. FIRST-CLASS LAUNCHER COMPLETENESS — MAKE ENDERLOOM FEEL FINISHED / 13.5 Mod behavior, side, vanilla-impact, and Forever World intelligence / 13.5.1 Built-in classification dimensions / Added-content / save footprint (1)</summary>

<a id="d-ed8b881e39e9cf254122"></a>
- [ ] **D-ed8b881e39e9cf254122** - Do not use &quot;additive&quot; as shorthand for &quot;no save footprint&quot;.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 13. FIRST-CLASS LAUNCHER COMPLETENESS — MAKE ENDERLOOM FEEL FINISHED / 13.5 Mod behavior, side, vanilla-impact, and Forever World intelligence / 13.5.1 Built-in classification dimensions / Added-content / save footprint
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 910-910](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L910-L910) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 910-910](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L910-L910)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 14. DEFINITION OF DONE — USER-LEVEL OUTCOMES (6)</summary>

<a id="d-cc53b7b886fd3f19c94d"></a>
- [ ] **D-cc53b7b886fd3f19c94d** - Discover and installed-content views can filter by Forever World Safe, Vanilla Untouched, persistent world impact, worldgen/biomes/dimensions/mobs, vanilla changes and removal risk...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** Discover and installed-content views can filter by Forever World Safe, Vanilla Untouched, persistent world impact, worldgen/biomes/dimensions/mobs, vanilla changes and removal risk without manual tagging.
  - **Binding context:** 14. DEFINITION OF DONE — USER-LEVEL OUTCOMES
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 2250-2250](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L2250-L2250) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 2250-2250](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L2250-L2250)

<a id="d-89df2b7fe2036dad80c5"></a>
- [ ] **D-89df2b7fe2036dad80c5** - Play/Home exposes recent/favorite/grouped instances, playtime/last played, health/update state and one-click launch without unnecessary navigation.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. DEFINITION OF DONE — USER-LEVEL OUTCOMES
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 2256-2256](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L2256-L2256) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 2256-2256](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L2256-L2256)

<a id="d-121713967d578ee61593"></a>
- [ ] **D-121713967d578ee61593** - An individual save can be marked Forever World independently of its instance, persists across restart, establishes a baseline/content manifest, and raises protection for risky upda...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** An individual save can be marked Forever World independently of its instance, persists across restart, establishes a baseline/content manifest, and raises protection for risky updates/removals/migrations.
  - **Binding context:** 14. DEFINITION OF DONE — USER-LEVEL OUTCOMES
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 2263-2263](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L2263-L2263) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 2263-2263](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L2263-L2263)

<a id="d-038c2ac3b91de8ccbfe0"></a>
- [ ] **D-038c2ac3b91de8ccbfe0** - World History combines snapshots, restores, version/profile/content/datapack changes and meaningful health events with usable comparisons before restore.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. DEFINITION OF DONE — USER-LEVEL OUTCOMES
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 2266-2266](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L2266-L2266) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 2266-2266](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L2266-L2266)

<a id="d-196ccd622cf17c342904"></a>
- [ ] **D-196ccd622cf17c342904** - Storage management explains usage, cleans only previewed safe targets, and de-duplicates identical Enderloom-owned immutable content without cross-instance corruption.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. DEFINITION OF DONE — USER-LEVEL OUTCOMES
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 2271-2271](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L2271-L2271) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 2271-2271](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L2271-L2271)

<a id="d-4001d9b823b527ea6b56"></a>
- [ ] **D-4001d9b823b527ea6b56** - Existing instances remain useful during provider/network outages wherever legitimate cached auth/content permits, without bypassing entitlement.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. DEFINITION OF DONE — USER-LEVEL OUTCOMES
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 2274-2274](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L2274-L2274) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 2274-2274](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L2274-L2274)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.5 Build the missing Bedrock headless runner in full / Bedrock BDS manager responsibilities (1)</summary>

<a id="d-c7549807a8d4e679a6d0"></a>
- [ ] **D-c7549807a8d4e679a6d0** - - acquire/cache the official selected BDS build through the supported official route; - record exact Bedrock version/build/channel and binary hash; - maintain stable and preview ca...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - acquire/cache the official selected BDS build through the supported official route; - record exact Bedrock version/build/channel and binary hash; - maintain stable and preview caches separately; - create isolated per-run working directories from immutable cached templates; - select a free port pair automatically; - set a unique QA level name; - configure deterministic seed/difficulty/game mode/tick/view settings as the test requires; - enable content logging; - install/mount the exact Behavior Pack/Resource Pack/script dependencies; - enable only the experiments actually required by the candidate/test; - launch BDS without a GUI; - parse startup/readiness/failure markers; - send console commands through stdin where appropriate; - stop only the exact process it launched; - preserve stdout/stderr/content logs/crash evidence; - clean disposable state only after evidence has been sealed.
  - **Binding context:** 17. FAST HEADLESS QA ENGINE — CLI/API TESTING FOR JAVA + BEDROCK / 17.5 Build the missing Bedrock headless runner in full / Bedrock BDS manager responsibilities
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4198-4213](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4198-L4213) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 4198-4213](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L4198-L4213)

</details>

<details>
<summary>ENDERLOOM_STUDIO_EXECUTION.md / 0. Codex launch contract - implement, verify, finish / 0.7 Build a beautiful, approachable Enderloom Studio / Primary workflow: Repair / Fix Issues (1)</summary>

<a id="d-699917acfa81278d0a3d"></a>
- [ ] **D-699917acfa81278d0a3d** - Present concise issues with Fix, Fix Issues, View Changes and, after a change, Undo. Clicking repair performs the real diagnosis -&gt; snapshot -&gt; stage fix -&gt; build/load -&g...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** Present concise issues with Fix, Fix Issues, View Changes and, after a change, Undo. Clicking repair performs the real diagnosis -&gt; snapshot -&gt; stage fix -&gt; build/load -&gt; relevant runtime checks -&gt; promote transaction. Install ordinary missing requirements automatically. Never define repair as removing content, disabling all Mixins, deleting a world/config, suppressing an error or only asking another AI for advice. Destructive or intent-changing actions require an explicit scoped choice; safe routine fixes do not demand repeated confirmation. Unsupported failure classes enter genuine recovery/adaptation work with a useful next action, not a dead error card.
  - **Binding context:** 0. Codex launch contract - implement, verify, finish / 0.7 Build a beautiful, approachable Enderloom Studio / Primary workflow: Repair / Fix Issues
  - **Original specification:** [ENDERLOOM_STUDIO_EXECUTION.md : 178-178](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_STUDIO_EXECUTION.md#L178-L178)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu (1)</summary>

<a id="d-1ce6b360ad9df35ba302"></a>
- [ ] **D-1ce6b360ad9df35ba302** - Nexus Mods
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 258-258](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L258-L258)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 6. Research / Catalog / Embedded Browser 2.0 (1)</summary>

<a id="d-293a083d56876dc26abc"></a>
- [ ] **D-293a083d56876dc26abc** - One search can query installed content, catalogs and supported live providers.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Research / Catalog / Embedded Browser 2.0
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 342-342](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L342-L342)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 12. Stonecutter-style Multi-Version Workspace (1)</summary>

<a id="d-df405ba2170f761e7a14"></a>
- [ ] **D-df405ba2170f761e7a14** - Cross-target content inventory comparison.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 12. Stonecutter-style Multi-Version Workspace
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 611-611](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L611-L611)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 28. Modpack Workbench (2)</summary>

<a id="d-6c1c04b41cb1aef3211c"></a>
- [ ] **D-6c1c04b41cb1aef3211c** - Content categories.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 28. Modpack Workbench
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1158-1158](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1158-L1158)

<a id="d-55ba0da18a89c74e6772"></a>
- [ ] **D-55ba0da18a89c74e6772** - Lockfile/content-addressed manifest.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 28. Modpack Workbench
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1161-1161](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1161-L1161)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 30. Server Studio (1)</summary>

<a id="d-d1596e69fca335d62e03"></a>
- [ ] **D-d1596e69fca335d62e03** - server content parity with client pack.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 30. Server Studio
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1217-1217](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1217-L1217)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 37. Enderloom itself must be absurdly fast (1)</summary>

<a id="d-15ecf21a930f0d340907"></a>
- [ ] **D-15ecf21a930f0d340907** - Content hashes avoid repeated analysis.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Enderloom itself must be absurdly fast
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1384-1384](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1384-L1384)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 39. Safety / preservation rules (1)</summary>

<a id="d-f40238bfb81fed1d00a0"></a>
- [ ] **D-f40238bfb81fed1d00a0** - Snapshot before dangerous world/content mutations.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 39. Safety / preservation rules
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1456-1456](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1456-L1456)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 41. Verification contract (1)</summary>

<a id="d-97503a464cd317dd793a"></a>
- [ ] **D-97503a464cd317dd793a** - target content inventory;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 41. Verification contract
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1534-1534](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1534-L1534)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 45. Definition of done — ultimate Enderloom (1)</summary>

<a id="d-dc0fe7fe11293b0c5332"></a>
- [ ] **D-dc0fe7fe11293b0c5332** - No dead buttons, fake integrations, fake progress, fake success or silent content loss.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 45. Definition of done — ultimate Enderloom
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1748-1748](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1748-L1748)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 3. Full launcher CLI parity checklist / Content: mods / resource packs / shaders / data packs / other managed content (16)</summary>

<a id="d-598eb7a433fcb8664204"></a>
- [ ] **D-598eb7a433fcb8664204** - enderloom content search
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Content: mods / resource packs / shaders / data packs / other managed content
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 180-180](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L180-L180)

<a id="d-f8c9ab4ce94deb41a30d"></a>
- [ ] **D-f8c9ab4ce94deb41a30d** - enderloom content show
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Content: mods / resource packs / shaders / data packs / other managed content
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 181-181](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L181-L181)

<a id="d-5267aac6c14af515b9dc"></a>
- [ ] **D-5267aac6c14af515b9dc** - enderloom content versions
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Content: mods / resource packs / shaders / data packs / other managed content
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 182-182](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L182-L182)

<a id="d-6b1bc6d93a75c03a58c2"></a>
- [ ] **D-6b1bc6d93a75c03a58c2** - enderloom content changelog
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Content: mods / resource packs / shaders / data packs / other managed content
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 183-183](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L183-L183)

<a id="d-bdb8bff3f5125bd6e89c"></a>
- [ ] **D-bdb8bff3f5125bd6e89c** - enderloom content plan-install
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Content: mods / resource packs / shaders / data packs / other managed content
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 184-184](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L184-L184)

<a id="d-176f094035cdc9ce655e"></a>
- [ ] **D-176f094035cdc9ce655e** - enderloom content install
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Content: mods / resource packs / shaders / data packs / other managed content
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 185-185](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L185-L185)

<a id="d-a51c03173e6c6b17c905"></a>
- [ ] **D-a51c03173e6c6b17c905** - enderloom content update
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Content: mods / resource packs / shaders / data packs / other managed content
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 186-186](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L186-L186)

<a id="d-08e5aadeb4c9a9c00bb0"></a>
- [ ] **D-08e5aadeb4c9a9c00bb0** - enderloom content freeze/unfreeze
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Content: mods / resource packs / shaders / data packs / other managed content
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 187-187](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L187-L187)

<a id="d-ce3a6deebba140607fd3"></a>
- [ ] **D-ce3a6deebba140607fd3** - enderloom content enable/disable
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Content: mods / resource packs / shaders / data packs / other managed content
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 188-188](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L188-L188)

<a id="d-9a7a0d3884af7a5f3911"></a>
- [ ] **D-9a7a0d3884af7a5f3911** - enderloom content dependents
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Content: mods / resource packs / shaders / data packs / other managed content
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 189-189](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L189-L189)

<a id="d-be2145346d74acd7cb07"></a>
- [ ] **D-be2145346d74acd7cb07** - enderloom content plan-remove
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Content: mods / resource packs / shaders / data packs / other managed content
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 190-190](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L190-L190)

<a id="d-b6581496ced6a7f1b484"></a>
- [ ] **D-b6581496ced6a7f1b484** - enderloom content remove
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Content: mods / resource packs / shaders / data packs / other managed content
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 191-191](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L191-L191)

<a id="d-30ebc049ec8e3b51230e"></a>
- [ ] **D-30ebc049ec8e3b51230e** - enderloom content add-file
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Content: mods / resource packs / shaders / data packs / other managed content
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 192-192](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L192-L192)

<a id="d-cf9ed9c02b0bb951846d"></a>
- [ ] **D-cf9ed9c02b0bb951846d** - enderloom mod ... convenience alias for content --kind mods.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Content: mods / resource packs / shaders / data packs / other managed content
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 193-193](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L193-L193)

<a id="d-1cde1724f8d1f02245e6"></a>
- [ ] **D-1cde1724f8d1f02245e6** - CurseForge manual-download handoffs return a structured actionable state instead of pretending the download succeeded.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Content: mods / resource packs / shaders / data packs / other managed content
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 194-194](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L194-L194)

<a id="d-0be75b928d3c33f9f008"></a>
- [ ] **D-0be75b928d3c33f9f008** - Exact version/provider IDs and hashes remain available in JSON output.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Content: mods / resource packs / shaders / data packs / other managed content
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 195-195](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L195-L195)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 3. Full launcher CLI parity checklist / Worlds / data packs (1)</summary>

<a id="d-33a3ddb045f7466d3f1f"></a>
- [ ] **D-33a3ddb045f7466d3f1f** - enderloom datapack list/add/install/update/enable/disable/remove
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Worlds / data packs
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 215-215](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L215-L215)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 3. Full launcher CLI parity checklist / Servers (1)</summary>

<a id="d-3e7a833f6710c5169390"></a>
- [ ] **D-3e7a833f6710c5169390** - enderloom server content list/install/update/enable/disable/remove
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Servers
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 258-258](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L258-L258)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 15. Implementation order for Codex / Phase CLI-1 — launcher domain parity (1)</summary>

<a id="d-0a1a3d48a9b699cdb8ff"></a>
- [ ] **D-0a1a3d48a9b699cdb8ff** - content/mods
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-1 — launcher domain parity
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 838-838](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L838-L838)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md / 27. Definition of Done — Enderloom Apex Conversion Engine / Core conversion (1)</summary>

<a id="d-ba67ffaf10a559fb0f63"></a>
- [ ] **D-ba67ffaf10a559fb0f63** - No silent content or behavior removal is allowed.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 27. Definition of Done — Enderloom Apex Conversion Engine / Core conversion
  - **Original specification:** [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md : 1125-1125](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md#L1125-L1125) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md : 1160-1160](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md#L1160-L1160)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md / 27. Definition of Done — Enderloom Apex Conversion Engine / Core conversion / Exact proof (1)</summary>

<a id="d-7957cce124985e143e44"></a>
- [ ] **D-7957cce124985e143e44** - Content and code-registration parity are independently proven.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 27. Definition of Done — Enderloom Apex Conversion Engine / Core conversion / Exact proof
  - **Original specification:** [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md : 1138-1138](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF.md#L1138-L1138) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md : 1177-1177](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md#L1177-L1177)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md / 6. Semantic migration engine — answer “what replaces this?” / 6.1 Vanilla feature dependency closure (1)</summary>

<a id="d-de3bff9ebfba2f02ad2b"></a>
- [ ] **D-de3bff9ebfba2f02ad2b** - When a mod references a vanilla feature absent in an older target, never stub/delete the identifier or quietly remove the dependent content. Record the exact cross-version dependen...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** When a mod references a vanilla feature absent in an older target, never stub/delete the identifier or quietly remove the dependent content. Record the exact cross-version dependency closure, finish and certify the mod-owned base first, then offer an explicit compatibility/backport provider when realistic. Keep optional future-vanilla parity default OFF until selected and prove provider-present/provider-absent/fallback/removal behavior separately. An optional backport may never hide an incomplete base conversion.
  - **Binding context:** 6. Semantic migration engine — answer “what replaces this?” / 6.1 Vanilla feature dependency closure
  - **Original specification:** [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md : 341-341](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v5.md#L341-L341) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md : 417-417](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md#L417-L417) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md : 417-417](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md#L417-L417)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md / 27. Definition of Done — Enderloom Apex Conversion Engine / Core conversion (1)</summary>

<a id="d-7f8753d0b8ad3ffdec82"></a>
- [ ] **D-7f8753d0b8ad3ffdec82** - · No silent content or behavior removal is allowed.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 27. Definition of Done — Enderloom Apex Conversion Engine / Core conversion
  - **Original specification:** [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md :: T007 : 1253-1253](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md#L1253-L1253) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md :: T007 : 1253-1253](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md#L1253-L1253)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md / 27. Definition of Done — Enderloom Apex Conversion Engine / Core conversion / Exact proof (1)</summary>

<a id="d-aa8f752efc3b65d71775"></a>
- [ ] **D-aa8f752efc3b65d71775** - · Content and code-registration parity are independently proven.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 27. Definition of Done — Enderloom Apex Conversion Engine / Core conversion / Exact proof
  - **Original specification:** [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md :: T021 : 1270-1270](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6.md#L1270-L1270) / [ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md :: T021 : 1270-1270](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_APEX_UNIVERSAL_CONVERSION_HANDOFF_v6_PRE_SELFREF_FIX.md#L1270-L1270)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md / 1. NORTHPOINT HARD INVARIANTS / 1.2 Zero-lag target (1)</summary>

<a id="d-05971d94a9d7179f384b"></a>
- [ ] **D-05971d94a9d7179f384b** - - Northpoint performance target: no measurable client or server regression under equivalent workload. - A new feature is not automatically exempt because “of course more content co...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - Northpoint performance target: no measurable client or server regression under equivalent workload. - A new feature is not automatically exempt because “of course more content costs performance.” Engineer the implementation so idle content is nearly free and active content pays only the work it truly needs. - Any new hot path introduced by Enderloom must be challenged before release. - Prefer event-driven state, sparse indexes, stable caches and bounded work over repeated discovery/polling. - Never manufacture a win by lowering fidelity or workload.
  - **Binding context:** 1. NORTHPOINT HARD INVARIANTS / 1.2 Zero-lag target
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md : 40-44](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md#L40-L44) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 444-448](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L444-L448)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md / 14. QA CHECKLIST — AUTOMATE THESE / Zero-loss / lineage (1)</summary>

<a id="d-dd0bf170a62fbb02d123"></a>
- [ ] **D-dd0bf170a62fbb02d123** - older unique content lost only by incomplete/lazy upstream port is retained.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. QA CHECKLIST — AUTOMATE THESE / Zero-loss / lineage
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md : 915-915](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md#L915-L915) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 1319-1319](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L1319-L1319)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md / 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.2 CORE IMPLEMENTATION — KNOCK THESE OUT IN ORDER / [ ] NP-03 — Implement exact intake, hashing, identity detection, and full source/content inventory (1)</summary>

<a id="d-1c05be3329833b8ae090"></a>
- [ ] **D-1c05be3329833b8ae090** - Make unaccounted meaningful content a hard release blocker.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.2 CORE IMPLEMENTATION — KNOCK THESE OUT IN ORDER / [ ] NP-03 — Implement exact intake, hashing, identity detection, and full source/content inventory
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 108-108](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L108-L108)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md / 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.2 CORE IMPLEMENTATION — KNOCK THESE OUT IN ORDER / [ ] NP-04 — Implement Complete-Lineage conversion: strongest legitimate union, not one branch (1)</summary>

<a id="d-2e020f48af030ae9c59c"></a>
- [ ] **D-2e020f48af030ae9c59c** - Restore older unique content that vanished only because later ports were incomplete.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 0. LIVE IMPLEMENTATION COMMAND CENTER — USE THIS AS THE WORK LOG / 0.2 CORE IMPLEMENTATION — KNOCK THESE OUT IN ORDER / [ ] NP-04 — Implement Complete-Lineage conversion: strongest legitimate union, not one branch
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 124-124](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L124-L124)

</details>

<details>
<summary>Enderloom Ultimate Minecraft Workbench — Codex Handoff Checkpoint — 2026-09-07.txt /  (1)</summary>

<a id="d-64a75edabe291d4ef0a7"></a>
- [ ] **D-64a75edabe291d4ef0a7** - NON-NEGOTIABLE INTEGRATION LAW No feature islands, shadow databases, or duplicated truth. Every relevant subsystem shares one canonical Minecraft knowledge/evidence graph. Performa...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** NON-NEGOTIABLE INTEGRATION LAW No feature islands, shadow databases, or duplicated truth. Every relevant subsystem shares one canonical Minecraft knowledge/evidence graph. Performance results must appear directly on mods, Favorites, update planning and repair. Crashes must open the exact culprit mod/source/config. World hotspots should link back to owning mods/entities/blocks. Config and version changes invalidate only evidence that actually depends on them. Conversion failures can enter the same repair/test loop. Returned AI candidates update source history, repair history, compatibility and performance provenance.
  - **Binding context:** 
  - **Original specification:** [Enderloom Ultimate Minecraft Workbench — Codex Handoff Checkpoint — 2026-09-07.txt : 24-25](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/Enderloom%20Ultimate%20Minecraft%20Workbench%20%E2%80%94%20Codex%20Handoff%20Checkpoint%20%E2%80%94%202026-09-07.txt#L24-L25)

</details>

<a id="lib-07-details"></a>
## LIB-07 - Exact versions, freeze and upgrades

[Outcome](Checklist.md#lib-07) / 15 source-derived details.

<details>
<summary>ENDERLOOM_ECOSYSTEM_COMPATIBILITY_CONTRACT_CATALOG.md / Enderloom — Adaptive Minecraft Ecosystem Compatibility Contract Catalog (1)</summary>

<a id="d-c7dffb5ccc617ab133bf"></a>
- [ ] **D-c7dffb5ccc617ab133bf** - The catalog is intentionally living. Exact APIs, dependency coordinates and supported Minecraft/loader versions must be resolved from current project sources before implementation/...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** The catalog is intentionally living. Exact APIs, dependency coordinates and supported Minecraft/loader versions must be resolved from current project sources before implementation/testing.
  - **Binding context:** Enderloom — Adaptive Minecraft Ecosystem Compatibility Contract Catalog
  - **Original specification:** [ENDERLOOM_ECOSYSTEM_COMPATIBILITY_CONTRACT_CATALOG.md : 10-10](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ECOSYSTEM_COMPATIBILITY_CONTRACT_CATALOG.md#L10-L10)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 2. Security &amp; Supply-Chain Center — missing critical layer / 2.4 Dependency/SBOM/license risk (1)</summary>

<a id="d-683c9cb759b568191b06"></a>
- [ ] **D-683c9cb759b568191b06** - Detect duplicate/conflicting library versions across a pack.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Security &amp; Supply-Chain Center — missing critical layer / 2.4 Dependency/SBOM/license risk
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 92-92](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L92-L92)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G001 — Updates behave like a first-class launcher / T001 — Fix “File already exists” update failures — replace the installed mod transactionally (1)</summary>

<a id="d-d611149dfcf75dd4e6ca"></a>
- [ ] **D-d611149dfcf75dd4e6ca** - 1. Resolve the installed logical project + provider/file identity and the selected replacement artifact. 2. Download the candidate to Enderloom-owned staging/temp storage, never di...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** 1. Resolve the installed logical project + provider/file identity and the selected replacement artifact. 2. Download the candidate to Enderloom-owned staging/temp storage, never directly over the live JAR. 3. Validate expected provider identity, compatibility, size/hash when available, and dependency plan. 4. Snapshot/retain the previous installed artifact long enough for rollback. 5. Commit the update atomically: - if the new artifact has the same filename, replace the old file atomically; - if it has a different filename, install the verified new artifact and remove/retire the superseded old artifact as one transaction; - never reject a legitimate update merely because the destination/current filename exists. 6. Preserve enabled/disabled state, provider association, notes, favorites, freeze/pin state, config/world data, and canonical project identity unless the requested update explicitly changes an allowed field. 7. If the exact target artifact is already installed, report Already up to date / no change instead of failure. 8. A same-name filesystem collision belonging to a *different* canonical project is a real conflict: stop only that item, explain the identity conflict, and do not overwrite unrelated content. 9. Roll back cleanly on validation/commit failure so the prior working mod remains installed. 10. Bulk Update must continue independent updates after one item fails and provide a final per-item result instead of collapsing the whole batch.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G001 — Updates behave like a first-class launcher / T001 — Fix “File already exists” update failures — replace the installed mod transactionally
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md : 47-59](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L47-L59)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 6. Content management / 6.1 Provider-backed discovery/install (2)</summary>

<a id="d-00c9dfa53e33b2a41a62"></a>
- [ ] **D-00c9dfa53e33b2a41a62** - Modrinth search/details/versions.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.1 Provider-backed discovery/install
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 338-338](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L338-L338)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-14d714d4a6536f933238"></a>
- [ ] **D-14d714d4a6536f933238** - CurseForge search/details/versions.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.1 Provider-backed discovery/install
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 339-339](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L339-L339)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 6. Content management / 6.3 Exact version control (5)</summary>

<a id="d-8e9047fcd631ba10b986"></a>
- [ ] **D-8e9047fcd631ba10b986** - Searchable compatible version picker.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.3 Exact version control
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 365-365](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L365-L365)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-f86f43b1d1df71c38e0c"></a>
- [ ] **D-f86f43b1d1df71c38e0c** - Show incompatible versions clearly rather than hiding reality.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.3 Exact version control
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 366-366](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L366-L366)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-a20fada0345d19846283"></a>
- [ ] **D-a20fada0345d19846283** - Exact-version replacement.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.3 Exact version control
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 368-368](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L368-L368)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-7990b807e6746c3a104d"></a>
- [ ] **D-7990b807e6746c3a104d** - Frozen projects excluded from automatic resolver updates until explicitly unfrozen.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.3 Exact version control
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 370-370](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L370-L370)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-919f7de1c44f50a91492"></a>
- [ ] **D-919f7de1c44f50a91492** - Retain old version history where useful.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.3 Exact version control
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 371-371](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L371-L371)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 13. FIRST-CLASS LAUNCHER COMPLETENESS — MAKE ENDERLOOM FEEL FINISHED / 13.1 One-click Safe Update / Update All (1)</summary>

<a id="d-4ef35b1e74ac6e91adce"></a>
- [ ] **D-4ef35b1e74ac6e91adce** - Do not overwrite user config blindly during modpack upgrades. Use preservation rules and, where practical, three-way merge for text configs/overrides so pack updates and user custo...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** Do not overwrite user config blindly during modpack upgrades. Use preservation rules and, where practical, three-way merge for text configs/overrides so pack updates and user customization can coexist. Surface only real merge conflicts.
  - **Binding context:** 13. FIRST-CLASS LAUNCHER COMPLETENESS — MAKE ENDERLOOM FEEL FINISHED / 13.1 One-click Safe Update / Update All
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 713-713](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L713-L713) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 713-713](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L713-L713)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 0. North-star product promise (1)</summary>

<a id="d-8d1f1cc7d22515945b5d"></a>
- [ ] **D-8d1f1cc7d22515945b5d** - Right-click a mod and instantly see its exact source/provider homes, source repository, issues, files, configs, dependencies, changelog, media, videos, author, performance history,...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** Right-click a mod and instantly see its exact source/provider homes, source repository, issues, files, configs, dependencies, changelog, media, videos, author, performance history, compatibility, repair history, world impact, installed copies, versions, loaders, hashes, and actions.
  - **Binding context:** 0. North-star product promise
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 24-24](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L24-L24)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 4. Universal Project / Mod Detail Surface (2)</summary>

<a id="d-2977c4f86b70574957f5"></a>
- [ ] **D-2977c4f86b70574957f5** - favorite/pin/freeze state;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Universal Project / Mod Detail Surface
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 176-176](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L176-L176)

<a id="d-c3422400ba11dae4dd39"></a>
- [ ] **D-c3422400ba11dae4dd39** - Install exact version
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Universal Project / Mod Detail Surface
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 207-207](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L207-L207)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 28. Modpack Workbench (1)</summary>

<a id="d-b7088dcad5da4c90eaa3"></a>
- [ ] **D-b7088dcad5da4c90eaa3** - Changelog between pack versions.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 28. Modpack Workbench
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1167-1167](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1167-L1167)

</details>

<a id="lib-08-details"></a>
## LIB-08 - Provider downloads and account recovery

[Outcome](Checklist.md#lib-08) / 79 source-derived details.

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 1. Product laws (4)</summary>

<a id="d-257c13cc4f0bfe0667a6"></a>
- [ ] **D-257c13cc4f0bfe0667a6** - This is an Enderloom workflow, not an &quot;open browser and good luck&quot; button.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. Product laws
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 18-18](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L18-L18)

<a id="d-9386a57bfed692eeda8f"></a>
- [ ] **D-9386a57bfed692eeda8f** - The user&#x27;s authenticated provider session is used in place; Enderloom does not export cookies or scrape credentials into its database.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. Product laws
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 21-21](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L21-L21)

<a id="d-bbaa6c9274689309f694"></a>
- [ ] **D-bbaa6c9274689309f694** - Chat/web mode is the default provider lane when the user wants to avoid API-token/API-billing usage; Enderloom must never claim this bypasses a provider&#x27;s subscription limits,...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** Chat/web mode is the default provider lane when the user wants to avoid API-token/API-billing usage; Enderloom must never claim this bypasses a provider&#x27;s subscription limits, quotas, rate limits, or terms.
  - **Binding context:** 1. Product laws
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 22-22](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L22-L22)

<a id="d-60ef39392bd056351fa8"></a>
- [ ] **D-60ef39392bd056351fa8** - Codex/API/provider-specific lanes are optional alternatives, not required for the base browser-chat workflow.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. Product laws
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 23-23](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L23-L23)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 2. One repair job, one durable state machine (6)</summary>

<a id="d-4fe39cec5661d9599b9e"></a>
- [ ] **D-4fe39cec5661d9599b9e** - provider_opening
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. One repair job, one durable state machine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 47-47](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L47-L47)

<a id="d-4f80eb7df48c7ebe7931"></a>
- [ ] **D-4f80eb7df48c7ebe7931** - provider_auth_required
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. One repair job, one durable state machine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 48-48](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L48-L48)

<a id="d-c743c5ec9b33d5ab22c6"></a>
- [ ] **D-c743c5ec9b33d5ab22c6** - provider_composer_ready
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. One repair job, one durable state machine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 49-49](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L49-L49)

<a id="d-6780bf2c19a807d6fc8b"></a>
- [ ] **D-6780bf2c19a807d6fc8b** - provider_working
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. One repair job, one durable state machine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 51-51](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L51-L51)

<a id="d-68a1f193429f3e7d9bd5"></a>
- [ ] **D-68a1f193429f3e7d9bd5** - provider_waiting_for_user
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. One repair job, one durable state machine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 52-52](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L52-L52)

<a id="d-24fc5cc2ceb113d239fa"></a>
- [ ] **D-24fc5cc2ceb113d239fa** - provider_complete
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. One repair job, one durable state machine
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 53-53](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L53-L53)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 3. Provider Adapter architecture (24)</summary>

<a id="d-0d30fd0c0128d468df9f"></a>
- [ ] **D-0d30fd0c0128d468df9f** - canHandle(url)
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 99-99](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L99-L99)

<a id="d-22ce49f4a487c3ebab42"></a>
- [ ] **D-22ce49f4a487c3ebab42** - openWorkspace()
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 100-100](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L100-L100)

<a id="d-3a1c06d924358ffe5568"></a>
- [ ] **D-3a1c06d924358ffe5568** - detectSignedInState()
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 101-101](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L101-L101)

<a id="d-7e2b6e1a08f63f056c51"></a>
- [ ] **D-7e2b6e1a08f63f056c51** - detectComposer()
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 102-102](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L102-L102)

<a id="d-ab55ed4e16428ec7a0ba"></a>
- [ ] **D-ab55ed4e16428ec7a0ba** - createNewConversation()
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 103-103](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L103-L103)

<a id="d-04240018138b0dfc82fe"></a>
- [ ] **D-04240018138b0dfc82fe** - setPrompt(text)
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 105-105](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L105-L105)

<a id="d-117a7968c36172e454e3"></a>
- [ ] **D-117a7968c36172e454e3** - attachFiles(paths)
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 106-106](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L106-L106)

<a id="d-178318ed9dee939a32ed"></a>
- [ ] **D-178318ed9dee939a32ed** - inspectAttachmentState()
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 107-107](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L107-L107)

<a id="d-278c3e059efb33eefe8e"></a>
- [ ] **D-278c3e059efb33eefe8e** - submit()
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 108-108](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L108-L108)

<a id="d-1286444e0f86e7bf45fd"></a>
- [ ] **D-1286444e0f86e7bf45fd** - detectRunState()
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 109-109](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L109-L109)

<a id="d-e9a31a34ca90331ce587"></a>
- [ ] **D-e9a31a34ca90331ce587** - detectNeedsUserAction()
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 110-110](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L110-L110)

<a id="d-6e812da24f40d470bf9d"></a>
- [ ] **D-6e812da24f40d470bf9d** - detectRateLimitOrQuotaState()
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 111-111](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L111-L111)

<a id="d-e459bf29e1238168e9a3"></a>
- [ ] **D-e459bf29e1238168e9a3** - collectVisibleResponse()
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 112-112](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L112-L112)

<a id="d-9c1c6661ca9386c69ea8"></a>
- [ ] **D-9c1c6661ca9386c69ea8** - collectReturnedFiles()
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 113-113](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L113-L113)

<a id="d-499e0b625b05405f6963"></a>
- [ ] **D-499e0b625b05405f6963** - collectDownloadLinks()
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 114-114](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L114-L114)

<a id="d-6da930ba5c4f286a341b"></a>
- [ ] **D-6da930ba5c4f286a341b** - collectCodeArtifacts()
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 115-115](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L115-L115)

<a id="d-ada0e036888466b75ce8"></a>
- [ ] **D-ada0e036888466b75ce8** - recordConversationIdentity()
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 116-116](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L116-L116)

<a id="d-1031feb5efb34f366110"></a>
- [ ] **D-1031feb5efb34f366110** - cancelProviderWork() when the provider actually exposes a supported cancellation action
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 117-117](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L117-L117)

<a id="d-b5bb62457e0789f81b1f"></a>
- [ ] **D-b5bb62457e0789f81b1f** - explainUnsupportedState()
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 118-118](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L118-L118)

<a id="d-d2e83f51220456b5e7e3"></a>
- [ ] **D-d2e83f51220456b5e7e3** - Generic assisted web-chat adapter for user-selected providers where safe DOM semantics can be detected.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 124-124](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L124-L124)

<a id="d-dbd241a04f044bf6cb8b"></a>
- [ ] **D-dbd241a04f044bf6cb8b** - Maintain adapter version fingerprints and provider regression fixtures.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 129-129](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L129-L129)

<a id="d-a771b98dba8b5d70960e"></a>
- [ ] **D-a771b98dba8b5d70960e** - If provider UI changes and confidence is low, pause with a clear &quot;provider UI changed&quot; state rather than clicking blindly.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 130-130](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L130-L130)

<a id="d-680cef4fa8a6c2f4f84a"></a>
- [ ] **D-680cef4fa8a6c2f4f84a** - File selection is performed through Enderloom-controlled paths and explicit attachment manifests.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 132-132](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L132-L132)

<a id="d-85731ab74d0e3cb6713b"></a>
- [ ] **D-85731ab74d0e3cb6713b** - A provider page remains visible/openable so the user can inspect or take over manually at any time.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Provider Adapter architecture
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 134-134](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L134-L134)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 11. Automatic failure feedback loop (2)</summary>

<a id="d-6743c5ec9197dec4dec2"></a>
- [ ] **D-6743c5ec9197dec4dec2** - If provider quota/rate limit is reached, persist the exact state and allow resume later; never attempt bypass.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Automatic failure feedback loop
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 397-397](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L397-L397)

<a id="d-7e387b12c2fbfb2cd486"></a>
- [ ] **D-7e387b12c2fbfb2cd486** - If the provider asks for a genuinely user-only choice, foreground a single clear user decision.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 11. Automatic failure feedback loop
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 399-399](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L399-L399)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 19. Micro-QOL requirements (1)</summary>

<a id="d-8c94f6271e921302e69f"></a>
- [ ] **D-8c94f6271e921302e69f** - Remember preferred provider per workflow type.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. Micro-QOL requirements
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 561-561](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L561-L561)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 20. CLI/API parity (1)</summary>

<a id="d-c07fc60c12e6ed9f6c8b"></a>
- [ ] **D-c07fc60c12e6ed9f6c8b** - Browser-specific provider automation may require the GUI/browser process, but the repair state machine, build/test/install logic and evidence model must remain shared native domain...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** Browser-specific provider automation may require the GUI/browser process, but the repair state machine, build/test/install logic and evidence model must remain shared native domain logic.
  - **Binding context:** 20. CLI/API parity
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 603-603](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L603-L603)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 21. Security and trust boundaries (2)</summary>

<a id="d-a4755e7b6b4a39eed4df"></a>
- [ ] **D-a4755e7b6b4a39eed4df** - No secrets in provider prompts unless the user explicitly includes them after warning.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 21. Security and trust boundaries
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 614-614](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L614-L614)

<a id="d-0386c80d12e87384852a"></a>
- [ ] **D-0386c80d12e87384852a** - Provider browser has normal user permissions, not direct unrestricted filesystem access.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 21. Security and trust boundaries
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 616-616](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L616-L616)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 22. QA fixtures (5)</summary>

<a id="d-0171fa1c93b8f44e6e6f"></a>
- [ ] **D-0171fa1c93b8f44e6e6f** - Provider returns only a code block.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 22. QA fixtures
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 638-638](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L638-L638)

<a id="d-ee270882b7e833a9ae8a"></a>
- [ ] **D-ee270882b7e833a9ae8a** - Provider returns multiple candidate files.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 22. QA fixtures
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 639-639](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L639-L639)

<a id="d-4b29b60b59aed18b8920"></a>
- [ ] **D-4b29b60b59aed18b8920** - Provider tab is signed out.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 22. QA fixtures
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 640-640](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L640-L640)

<a id="d-cc5e05a6fbe706848661"></a>
- [ ] **D-cc5e05a6fbe706848661** - Provider rate-limits/quota-blocks.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 22. QA fixtures
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 641-641](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L641-L641)

<a id="d-27640282db9b0f6416c8"></a>
- [ ] **D-27640282db9b0f6416c8** - Enderloom restarts while provider is working.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 22. QA fixtures
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 644-644](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L644-L644)

</details>

<details>
<summary>AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md / 23. Definition of done (3)</summary>

<a id="d-e606bf4f76b55e73af79"></a>
- [ ] **D-e606bf4f76b55e73af79** - Enderloom uses its integrated authenticated browser to submit the job to a supported web-chat provider.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Definition of done
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 660-660](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L660-L660)

<a id="d-8488e664e1660f38561d"></a>
- [ ] **D-8488e664e1660f38561d** - Browser automation respects authentication, quota/rate-limit and access boundaries.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Definition of done
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 672-672](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L672-L672)

<a id="d-3d25beb84e644f5f8c0f"></a>
- [ ] **D-3d25beb84e644f5f8c0f** - Enderloom never promises that browser chat itself is quota-free or outside the provider&#x27;s normal plan limits.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Definition of done
  - **Original specification:** [AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md : 674-674](https://github.com/Herbertofury/Enderloom/blob/main/docs/AI_AUTONOMOUS_REPAIR_LOOP_SPEC.md#L674-L674)

</details>

<details>
<summary>CODEX_HANDOFF_ULTIMATE_MINECRAFT_WORKBENCH.md / Codex Handoff — Enderloom Ultimate Minecraft Workbench / In-app browser rule (1)</summary>

<a id="d-581d6d86a985bd13f2d5"></a>
- [ ] **D-581d6d86a985bd13f2d5** - The default web-chat lane should not require a separate API key, but it must respect the provider&#x27;s normal login, plan limits, quotas, rate limits, UI, terms, CAPTCHAs, paywal...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** The default web-chat lane should not require a separate API key, but it must respect the provider&#x27;s normal login, plan limits, quotas, rate limits, UI, terms, CAPTCHAs, paywalls, DRM, and access controls. Never bypass them.
  - **Binding context:** Codex Handoff — Enderloom Ultimate Minecraft Workbench / In-app browser rule
  - **Original specification:** [CODEX_HANDOFF_ULTIMATE_MINECRAFT_WORKBENCH.md : 123-123](https://github.com/Herbertofury/Enderloom/blob/main/docs/CODEX_HANDOFF_ULTIMATE_MINECRAFT_WORKBENCH.md#L123-L123)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 13. Collaboration / Shared Instances / Team Pack Authoring / 13.1 Shared instances (1)</summary>

<a id="d-c4da5ce24c20dc36c5c8"></a>
- [ ] **D-c4da5ce24c20dc36c5c8** - Invite/share mechanism using a supported Enderloom account/service only if one actually exists; otherwise use Git/Drive/provider-neutral exports rather than fake cloud sync.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Collaboration / Shared Instances / Team Pack Authoring / 13.1 Shared instances
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 672-672](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L672-L672)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 25. Pack/Release Permission &amp; Policy Gate (1)</summary>

<a id="d-074f2809e257afdacbe8"></a>
- [ ] **D-074f2809e257afdacbe8** - Detect projects that require link-only/provider download rather than redistribution.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 25. Pack/Release Permission &amp; Policy Gate
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 968-968](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L968-L968)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / Constraints and preservation (1)</summary>

<a id="d-a8002636795247c0f0c4"></a>
- [ ] **D-a8002636795247c0f0c4** - - Preserve existing instance files, worlds, configs, favorites, notes, provider bindings, artwork choices, browser state, and working functionality. - Do not gain speed by skipping...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - Preserve existing instance files, worlds, configs, favorites, notes, provider bindings, artwork choices, browser state, and working functionality. - Do not gain speed by skipping dependency closure, provenance, hash verification, rollback, recovery, compatibility checks, or result coverage. - GUI actions must use the canonical service/domain operation rather than private UI-only logic. - No placeholder or decorative controls: every button, tab, menu item, hotkey, launcher choice, and download/update action in this scope must work end-to-end through real production domain logic and persistence. - Provider/project identity must use stable IDs/provenance/hashes where available, not display-name guessing. - Repeated real failures become regression fixtures. - A build alone is not proof. Exercise the changed desktop workflow in the packaged/current app when practical. - If a later change breaks a completed item, reopen that item and its parent gate.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / Constraints and preservation
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md : 24-31](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L24-L31)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G001 — Updates behave like a first-class launcher / T002 — Make update discovery and Update All feel instant (1)</summary>

<a id="d-1ad36f5e2a19e2d49988"></a>
- [ ] **D-1ad36f5e2a19e2d49988** - - Render cached last-verified compatible releases immediately, then stale-while-revalidate providers in parallel. - Eliminate serial provider waterfalls, duplicate identical fetche...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - Render cached last-verified compatible releases immediately, then stale-while-revalidate providers in parallel. - Eliminate serial provider waterfalls, duplicate identical fetches, hidden full rescans, and modal-blocking metadata work. - Use conditional/delta metadata requests, single-flight request coalescing, bounded provider concurrency, content-addressed download cache reuse, and dependency-plan reuse. - Pipeline independent Update All downloads/verification instead of waiting for each full update to finish serially. - Navigation/cancel must abort abandoned provider/download work without corrupting the batch. - Measure cold and warm: first useful update list, full refresh time, click-to-download-start, aggregate throughput, UI responsiveness, and apply/commit latency. - Benchmark the same instance on the same machine/network against installed CurseForge and Modrinth clients. Enderloom must not be slower than either client on comparable median user-visible update latency, and this task remains open until the key update path is measurably faster than both where the comparison is technically equivalent, while preserving Enderloom&#x27;s stronger checks and complete results. If either client is faster, profile the bottleneck and change architecture rather than weakening validation.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G001 — Updates behave like a first-class launcher / T002 — Make update discovery and Update All feel instant
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md : 67-73](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L67-L73)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G004 — Instance launching and presentation are polished / T008 — Carry over real provider instance artwork (2)</summary>

<a id="d-dcb11b862c8ddde8f9d7"></a>
- [ ] **D-dcb11b862c8ddde8f9d7** - · Carry over real provider instance artwork
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G004 — Instance launching and presentation are polished / T008 — Carry over real provider instance artwork
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md :: T008 : 184-184](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L184-L184)

<a id="d-4b8d3ab2145a4d6d816f"></a>
- [ ] **D-4b8d3ab2145a4d6d816f** - - Preserve user-selected artwork overrides. - Refresh provider artwork without erasing an override. - Never synthesize replacement artwork.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G004 — Instance launching and presentation are polished / T008 — Carry over real provider instance artwork
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md : 188-190](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L188-L190)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G005 — Favorites/catalog identity and quick actions are clean / T012 — Merge duplicate favorites across CurseForge/Modrinth/other providers (1)</summary>

<a id="d-735e9271c70eaf45b75c"></a>
- [ ] **D-735e9271c70eaf45b75c** - - Merge using stable provider/project identity, upstream links, hashes, metadata/evidence, and explicit mappings. - Do not merge unrelated same-name projects. - Preserve each provi...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - Merge using stable provider/project identity, upstream links, hashes, metadata/evidence, and explicit mappings. - Do not merge unrelated same-name projects. - Preserve each provider&#x27;s project URL, release availability, and source preference. - Discovering another source for an already-favorited project must not create a duplicate favorite.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G005 — Favorites/catalog identity and quick actions are clean / T012 — Merge duplicate favorites across CurseForge/Modrinth/other providers
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md : 243-246](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L243-L246)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G008 — Whole queue convergence and runtime proof / T020 — Visual/performance regression pass (1)</summary>

<a id="d-5fbe18965719a347078b"></a>
- [ ] **D-5fbe18965719a347078b** - Prove that provider fetches, download animations, card enrichment, update progress, logs tailing, artwork loading, and browser downloads do not freeze the main window or trigger un...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** Prove that provider fetches, download animations, card enrichment, update progress, logs tailing, artwork loading, and browser downloads do not freeze the main window or trigger unnecessary full-instance rescans.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / G008 — Whole queue convergence and runtime proof / T020 — Visual/performance regression pass
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md : 423-423](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L423-L423)

</details>

<details>
<summary>ENDERLOOM_GET_DONE_NOW_QOL.md / Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / Done when (1)</summary>

<a id="d-79e5369ee8518b6b23db"></a>
- [ ] **D-79e5369ee8518b6b23db** - FINAL COMPLETION GATE — All T001-T024 and G001-G008 are complete with applicable packaged-runtime/regression/performance evidence; no accepted blocker remains open; no working data...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** FINAL COMPLETION GATE — All T001-T024 and G001-G008 are complete with applicable packaged-runtime/regression/performance evidence; no accepted blocker remains open; no working data/capability was removed; no placeholder/no-op UI remains; update/download/install behavior is measurably fast without doing less work; and the delivered build preserves user profile, favorites, instances, provider identity, worlds, configs, browser state, and rollback/recovery behavior across restart and upgrade.
  - **Binding context:** Enderloom — GET DONE NOW: Core UX / QoL Repair Queue / Done when
  - **Original specification:** [ENDERLOOM_GET_DONE_NOW_QOL.md :: G009 : 458-458](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GET_DONE_NOW_QOL.md#L458-L458)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 2. Product principles — non-negotiable / 2.1 Real functionality, not theater (1)</summary>

<a id="d-dd73e17217cfd0592e2f"></a>
- [ ] **D-dd73e17217cfd0592e2f** - Do not claim a provider upload/send completed unless the provider actually acknowledged it.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Product principles — non-negotiable / 2.1 Real functionality, not theater
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 55-55](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L55-L55)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 2. Product principles — non-negotiable / 2.3 No artificial caps or quality loss (1)</summary>

<a id="d-c163ace046e54fd5c4d9"></a>
- [ ] **D-c163ace046e54fd5c4d9** - Do not cap projects, sources, galleries, mods, benchmark evidence, or provider results just to make the app feel fast.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Product principles — non-negotiable / 2.3 No artificial caps or quality loss
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 71-71](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L71-L71)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 5. Launcher / Mod Manager / 5.1 External launcher discovery and in-place connection (1)</summary>

<a id="d-785d45e739077aa19fb7"></a>
- [ ] **D-785d45e739077aa19fb7** - Disconnect without deleting external files.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Launcher / Mod Manager / 5.1 External launcher discovery and in-place connection
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 239-239](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L239-L239)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 6. Content management / 6.1 Provider-backed discovery/install (2)</summary>

<a id="d-09f516083b9e1fcf5717"></a>
- [ ] **D-09f516083b9e1fcf5717** - Browser handoff for CurseForge files whose authors disable third-party downloads.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.1 Provider-backed discovery/install
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 346-346](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L346-L346)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-67ca06a8a189b5a2514b"></a>
- [ ] **D-67ca06a8a189b5a2514b** - Verify handed-off downloads by name/hash/size before adopting.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Content management / 6.1 Provider-backed discovery/install
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 347-347](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L347-L347)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 32. Update/distribution safety (1)</summary>

<a id="d-fb52066c42de1278f679"></a>
- [ ] **D-fb52066c42de1278f679** - Manual install is acceptable until a safe verified updater exists.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 32. Update/distribution safety
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1371-1371](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1371-L1371)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 33. Performance requirements for Enderloom itself (3)</summary>

<a id="d-d9dddf73dc8c0b6432ab"></a>
- [ ] **D-d9dddf73dc8c0b6432ab** - Parallel provider work.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 33. Performance requirements for Enderloom itself
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1382-1382](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1382-L1382)

<a id="d-feb968e29c95b41323cd"></a>
- [ ] **D-feb968e29c95b41323cd** - Streaming parsing for large provider pages.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 33. Performance requirements for Enderloom itself
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1383-1383](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1383-L1383)

<a id="d-a72fba3476cb411b1037"></a>
- [ ] **D-a72fba3476cb411b1037** - Single-flight duplicate provider/project requests.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 33. Performance requirements for Enderloom itself
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1385-1385](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1385-L1385)

</details>

<details>
<summary>ENDERLOOM_MINECRAFT_WORKFLOW_PARITY_MASTER_SPEC.md / 2. Authorized Minecraft Asset Acquisition / 2.1 Sources (1)</summary>

<a id="d-55d1ed9176015687079c"></a>
- [ ] **D-55d1ed9176015687079c** - - files/folders/archives supplied by the user; - local launcher instances; - Modrinth project/version downloads; - CurseForge project/version downloads through supported provider a...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** - files/folders/archives supplied by the user; - local launcher instances; - Modrinth project/version downloads; - CurseForge project/version downloads through supported provider access; - GitHub source/releases; - Maven/loader dependency repositories; - official Minecraft client/server/version assets required for the selected runtime; - Bedrock .mcpack, .mcaddon, behavior-pack and resource-pack sources; - Java resource packs/datapacks/shader packs; - mod JARs with or without source; - worlds/saves/server packs; - logs/crash reports/JFR/spark/Observable/diagnostic bundles; - authorized server-delivered client resource packs; - author-supplied server plugin/model/config/source bundles; - user-authorized screenshots/GIFs/videos/models/reference media.
  - **Binding context:** 2. Authorized Minecraft Asset Acquisition / 2.1 Sources
  - **Original specification:** [ENDERLOOM_MINECRAFT_WORKFLOW_PARITY_MASTER_SPEC.md : 51-65](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MINECRAFT_WORKFLOW_PARITY_MASTER_SPEC.md#L51-L65)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 19. CLI/automation — only for Favorites + Performance scope / Favorites CLI (1)</summary>

<a id="d-2576b6a0e0f2ebf5c0c6"></a>
- [ ] **D-2576b6a0e0f2ebf5c0c6** - stable IDs/provider identity in output.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 19. CLI/automation — only for Favorites + Performance scope / Favorites CLI
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 655-655](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L655-L655)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 3. Durable Task Engine (1)</summary>

<a id="d-2937fb28568b3aa88843"></a>
- [ ] **D-2937fb28568b3aa88843** - Provider/network/backpressure state.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Durable Task Engine
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 137-137](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L137-L137)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 4. Universal Project / Mod Detail Surface (1)</summary>

<a id="d-3ac61d87f146c437bec3"></a>
- [ ] **D-3ac61d87f146c437bec3** - canonical provider identities;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Universal Project / Mod Detail Surface
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 170-170](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L170-L170)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 18. Autonomous AI Repair Loop (1)</summary>

<a id="d-6e2a02f9887ad43d9a9d"></a>
- [ ] **D-6e2a02f9887ad43d9a9d** - Never claim browser chat bypasses normal provider plan quotas/rate limits.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 18. Autonomous AI Repair Loop
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 800-800](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L800-L800)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 36. Extension / Adapter SDK (2)</summary>

<a id="d-eb90d7432f238c0e0a64"></a>
- [ ] **D-eb90d7432f238c0e0a64** - provider adapter;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 36. Extension / Adapter SDK
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1353-1353](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1353-L1353)

<a id="d-6359e8777d952d1066d8"></a>
- [ ] **D-6359e8777d952d1066d8** - browser provider adapter;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 36. Extension / Adapter SDK
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1354-1354](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1354-L1354)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 37. Enderloom itself must be absurdly fast (1)</summary>

<a id="d-169ad83d378f6e3130d1"></a>
- [ ] **D-169ad83d378f6e3130d1** - Single-flight provider/network requests.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 37. Enderloom itself must be absurdly fast
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1385-1385](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1385-L1385)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 39. Safety / preservation rules (1)</summary>

<a id="d-5a3247898e8939c363a4"></a>
- [ ] **D-5a3247898e8939c363a4** - No fake provider success.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 39. Safety / preservation rules
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1463-1463](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1463-L1463)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 41. Verification contract (1)</summary>

<a id="d-320212d4eba4ef49c220"></a>
- [ ] **D-320212d4eba4ef49c220** - provider fixture/live-safe check where applicable;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 41. Verification contract
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1518-1518](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1518-L1518)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 13. Security and safety requirements (1)</summary>

<a id="d-6dcd0702b0c9be190557"></a>
- [ ] **D-6dcd0702b0c9be190557** - Provider integrations preserve existing credential-storage rules.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Security and safety requirements
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 755-755](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L755-L755)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md / 14. QA CHECKLIST — AUTOMATE THESE / Repair/migration hardening (1)</summary>

<a id="d-4218544ad5cf52c37efb"></a>
- [ ] **D-4218544ad5cf52c37efb** - optional integration passes provider-present and provider-absent lanes.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. QA CHECKLIST — AUTOMATE THESE / Repair/migration hardening
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md : 924-924](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v2_ARCHIVED.md#L924-L924) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md : 1328-1328](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF_v3_ARCHIVED.md#L1328-L1328)

</details>

<a id="lib-09-details"></a>
## LIB-09 - Pack and research interchange

[Outcome](Checklist.md#lib-09) / 82 source-derived details.

<details>
<summary>CODEX_HANDOFF_ULTIMATE_MINECRAFT_WORKBENCH.md / Codex Handoff — Enderloom Ultimate Minecraft Workbench / Objective (1)</summary>

<a id="d-664cba7f0d631c4e4ee5"></a>
- [ ] **D-664cba7f0d631c4e4ee5** - Continue Enderloom as the one integrated Minecraft workbench. Do not restart research, replace accepted launcher/catalog/browser behavior, or build disconnected mockup tabs.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** Codex Handoff — Enderloom Ultimate Minecraft Workbench / Objective
  - **Original specification:** [CODEX_HANDOFF_ULTIMATE_MINECRAFT_WORKBENCH.md : 9-9](https://github.com/Herbertofury/Enderloom/blob/main/docs/CODEX_HANDOFF_ULTIMATE_MINECRAFT_WORKBENCH.md#L9-L9)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 1. NON-NEGOTIABLE PRODUCT LAWS / 1.4 Locked product decisions (1)</summary>

<a id="d-a1a2b4ecd3ba5a52d58a"></a>
- [ ] **D-a1a2b4ecd3ba5a52d58a** - DEC-R05 Do not silently install diagnostics into a user’s live pack.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. NON-NEGOTIABLE PRODUCT LAWS / 1.4 Locked product decisions
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md : 127-127](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L127-L127)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 3. PHASE 0 — PRESERVE AND BASELINE THE EXISTING PRODUCT / 3.2 Existing behavior that must survive all later work (1)</summary>

<a id="d-281a06de2ec82200c0c3"></a>
- [ ] **D-281a06de2ec82200c0c3** - Pack/world/server: pack interchange, world list/import/safe-delete/snapshot, managed/external servers, server software/config/players/whitelist/files/content/console/process contro...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** Pack/world/server: pack interchange, world list/import/safe-delete/snapshot, managed/external servers, server software/config/players/whitelist/files/content/console/process control.
  - **Binding context:** 3. PHASE 0 — PRESERVE AND BASELINE THE EXISTING PRODUCT / 3.2 Existing behavior that must survive all later work
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: P0-015 : 182-182](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L182-L182)

</details>

<details>
<summary>ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md / 8. PHASE E — PREMIUM PERFORMANCE / TESTING CONTROL PLANE / 8.6 A/B, whole-pack isolation, confidence (1)</summary>

<a id="d-7746a89ff0c0ced0902c"></a>
- [ ] **D-7746a89ff0c0ced0902c** - whole-pack analysis uses static risk + dependency clusters + hierarchical/binary cohort isolation + direct candidate confirmation + interaction tests; --exhaustive is genuinely exh...
  - **State:** unverified. **Kind:** source task.
  - **Full requirement:** whole-pack analysis uses static risk + dependency clusters + hierarchical/binary cohort isolation + direct candidate confirmation + interaction tests; --exhaustive is genuinely exhaustive.
  - **Binding context:** 8. PHASE E — PREMIUM PERFORMANCE / TESTING CONTROL PLANE / 8.6 A/B, whole-pack isolation, confidence
  - **Original specification:** [ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md :: PE-051 : 377-377](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md#L377-L377)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 2. Security &amp; Supply-Chain Center — missing critical layer / 2.4 Dependency/SBOM/license risk (1)</summary>

<a id="d-125c3254959f9c820175"></a>
- [ ] **D-125c3254959f9c820175** - Flag incompatible pack redistribution permissions before export/publish.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Security &amp; Supply-Chain Center — missing critical layer / 2.4 Dependency/SBOM/license risk
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 95-95](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L95-L95)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 2. Security &amp; Supply-Chain Center — missing critical layer / 2.5 Sandbox policy (1)</summary>

<a id="d-41a1f6969856fb6870d8"></a>
- [ ] **D-41a1f6969856fb6870d8** - Security results appear on mod detail, install/update planner, AI repair job and pack export.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 2. Security &amp; Supply-Chain Center — missing critical layer / 2.5 Sandbox policy
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 103-103](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L103-L103)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 3. Bedrock Developer Center — full creator/debugger parity / 3.1 Creator project management (1)</summary>

<a id="d-82553f23f0dd0ddc2299"></a>
- [ ] **D-82553f23f0dd0ddc2299** - “No unknown files” pack audit.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Bedrock Developer Center — full creator/debugger parity / 3.1 Creator project management
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 125-125](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L125-L125)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 3. Bedrock Developer Center — full creator/debugger parity / 3.4 Bedrock Editor integration (1)</summary>

<a id="d-c6fc12926a8edc1a2858"></a>
- [ ] **D-c6fc12926a8edc1a2858** - Round-trip world edits without losing pack metadata.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Bedrock Developer Center — full creator/debugger parity / 3.4 Bedrock Editor integration
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 164-164](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L164-L164)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 13. Collaboration / Shared Instances / Team Pack Authoring / 13.3 Portable/offline workflows (1)</summary>

<a id="d-8e17dae16fdc57a9b54a"></a>
- [ ] **D-8e17dae16fdc57a9b54a** - Air-gapped pack bundle with verified hashes when licenses allow redistribution.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 13. Collaboration / Shared Instances / Team Pack Authoring / 13.3 Portable/offline workflows
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 697-697](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L697-L697)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 18. Worldgen / Seed / Pregeneration Intelligence (1)</summary>

<a id="d-163686d6334e7a458fb5"></a>
- [ ] **D-163686d6334e7a458fb5** - “What changed in worldgen?” diff after pack update.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 18. Worldgen / Seed / Pregeneration Intelligence
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 835-835](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L835-L835)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 25. Pack/Release Permission &amp; Policy Gate (3)</summary>

<a id="d-64450e5f2cf6d0a32a10"></a>
- [ ] **D-64450e5f2cf6d0a32a10** - Inventory every redistributed artifact.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 25. Pack/Release Permission &amp; Policy Gate
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 966-966](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L966-L966)

<a id="d-2e893b49f0e1f24aad67"></a>
- [ ] **D-2e893b49f0e1f24aad67** - SBOM/checksum manifest.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 25. Pack/Release Permission &amp; Policy Gate
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 973-973](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L973-L973)

<a id="d-85449285f941a7674741"></a>
- [ ] **D-85449285f941a7674741** - Never auto-accept licenses/terms for users.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 25. Pack/Release Permission &amp; Policy Gate
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 975-975](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L975-L975)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 31. Cross-integration requirements for these newly added domains (2)</summary>

<a id="d-50358066563bfd5b5238"></a>
- [ ] **D-50358066563bfd5b5238** - Security findings appear in install/update, mod detail, AI repair and pack export.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 31. Cross-integration requirements for these newly added domains
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 1103-1103](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L1103-L1103)

<a id="d-0394f29dccce545b31f3"></a>
- [ ] **D-0394f29dccce545b31f3** - Permission/licensing findings gate pack export without blocking ordinary local use unnecessarily.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 31. Cross-integration requirements for these newly added domains
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 1121-1121](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L1121-L1121)

</details>

<details>
<summary>ENDERLOOM_GAP_AUDIT_2026-09-07.md / 32. New golden fixtures required (1)</summary>

<a id="d-4b67e3974f8a6696ce21"></a>
- [ ] **D-4b67e3974f8a6696ce21** - pack export with mixed redistribution permissions.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 32. New golden fixtures required
  - **Original specification:** [ENDERLOOM_GAP_AUDIT_2026-09-07.md : 1151-1151](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_GAP_AUDIT_2026-09-07.md#L1151-L1151)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 4. Catalog + research browser / 4.1 Core research behavior (1)</summary>

<a id="d-03088a77cdbf88fb7e4f"></a>
- [ ] **D-03088a77cdbf88fb7e4f** - Search and filter.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.1 Core research behavior
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 134-134](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L134-L134)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 4. Catalog + research browser / 4.5 Catalog document interchange (8)</summary>

<a id="d-8b11af515dd6ffb4f27e"></a>
- [ ] **D-8b11af515dd6ffb4f27e** - Import/export XLSX.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.5 Catalog document interchange
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 216-216](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L216-L216)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-89bb7e3aee31da417baa"></a>
- [ ] **D-89bb7e3aee31da417baa** - Import/export CSV.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.5 Catalog document interchange
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 217-217](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L217-L217)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-681606148cf2ab33a68f"></a>
- [ ] **D-681606148cf2ab33a68f** - Import/export JSON.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.5 Catalog document interchange
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 218-218](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L218-L218)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-a4b5e66a2731b43d2370"></a>
- [ ] **D-a4b5e66a2731b43d2370** - Import/export HTML.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.5 Catalog document interchange
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 219-219](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L219-L219)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-1d6c31b21917bdd00395"></a>
- [ ] **D-1d6c31b21917bdd00395** - Import/export PDF-oriented research layers where supported.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.5 Catalog document interchange
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 220-220](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L220-L220)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-4f9dead83f6ed1370def"></a>
- [ ] **D-4f9dead83f6ed1370def** - Preserve research fields.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.5 Catalog document interchange
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 221-221](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L221-L221)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-b638d506a4946e621fc8"></a>
- [ ] **D-b638d506a4946e621fc8** - Preserve enriched/clickable source/media links.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.5 Catalog document interchange
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 222-222](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L222-L222)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-29f2c9ff0b55aca7434e"></a>
- [ ] **D-29f2c9ff0b55aca7434e** - Private sources surface sign-in-required instead of fabricating data.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 4. Catalog + research browser / 4.5 Catalog document interchange
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 224-224](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L224-L224)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 5. Launcher / Mod Manager / 5.1 External launcher discovery and in-place connection (1)</summary>

<a id="d-9a3bf8522b5afb27bb38"></a>
- [ ] **D-9a3bf8522b5afb27bb38** - Discover usable CurseForge profiles.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Launcher / Mod Manager / 5.1 External launcher discovery and in-place connection
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 233-233](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L233-L233)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 7. Modpacks / pack interchange (13)</summary>

<a id="d-6ebc31fe8aa294bb19dc"></a>
- [ ] **D-6ebc31fe8aa294bb19dc** - Install MRPack.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Modpacks / pack interchange
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 392-392](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L392-L392)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-81b7396b0d06eacafac1"></a>
- [ ] **D-81b7396b0d06eacafac1** - Import/export MRPack where supported.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Modpacks / pack interchange
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 393-393](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L393-L393)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-a1a2a230034685de5061"></a>
- [ ] **D-a1a2a230034685de5061** - Import CurseForge ZIP.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Modpacks / pack interchange
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 394-394](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L394-L394)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-a1dffcf0ce5b8ca2667c"></a>
- [ ] **D-a1dffcf0ce5b8ca2667c** - Import packwiz.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Modpacks / pack interchange
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 395-395](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L395-L395)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-a55e89d27fdd136fc445"></a>
- [ ] **D-a55e89d27fdd136fc445** - Export pack formats supported by Enderloom.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Modpacks / pack interchange
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 396-396](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L396-L396)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-06caa74789ebba4fea6a"></a>
- [ ] **D-06caa74789ebba4fea6a** - Provider link/unlink.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Modpacks / pack interchange
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 397-397](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L397-L397)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-718b69732e505198db4d"></a>
- [ ] **D-718b69732e505198db4d** - Check for modpack upgrade.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Modpacks / pack interchange
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 398-398](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L398-L398)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-a86f5ce88aa0f977306d"></a>
- [ ] **D-a86f5ce88aa0f977306d** - Plan upgrade.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Modpacks / pack interchange
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 399-399](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L399-L399)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-128d510eecbd51e248dc"></a>
- [ ] **D-128d510eecbd51e248dc** - Apply upgrade.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Modpacks / pack interchange
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 400-400](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L400-L400)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-fc5dc92e231a161c43c4"></a>
- [ ] **D-fc5dc92e231a161c43c4** - Cancellation rollback.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Modpacks / pack interchange
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 401-401](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L401-L401)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-be4d81b2d3c972218d21"></a>
- [ ] **D-be4d81b2d3c972218d21** - Preserve source/provenance.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Modpacks / pack interchange
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 402-402](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L402-L402)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

<a id="d-ffa51cc8ee32347fa21f"></a>
- [ ] **D-ffa51cc8ee32347fa21f** - Do not clone/fake CurseForge proprietary share-code service.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Modpacks / pack interchange
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 403-403](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L403-L403)

<a id="d-ff06e5ee3a30bf20f4eb"></a>
- [ ] **D-ff06e5ee3a30bf20f4eb** - Keep formats source-control/CLI friendly.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Modpacks / pack interchange
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 404-404](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L404-L404)

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 9. Servers (1)</summary>

<a id="d-61e20815d1862449df92"></a>
- [ ] **D-61e20815d1862449df92** - Server pack install/update.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 9. Servers
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 440-440](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L440-L440)
  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.

</details>

<details>
<summary>ENDERLOOM_MASTER_REQUIREMENTS.md / 23. Full CLI everywhere / 23.2 CLI parity domains (1)</summary>

<a id="d-b46dde2919b05b26a734"></a>
- [ ] **D-b46dde2919b05b26a734** - modpacks/pack interchange
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 23. Full CLI everywhere / 23.2 CLI parity domains
  - **Original specification:** [ENDERLOOM_MASTER_REQUIREMENTS.md : 1043-1043](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_MASTER_REQUIREMENTS.md#L1043-L1043)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 13. FIRST-CLASS LAUNCHER COMPLETENESS — MAKE ENDERLOOM FEEL FINISHED / 13.19 Security and untrusted-content handling (1)</summary>

<a id="d-b81243a6362af9140554"></a>
- [ ] **D-b81243a6362af9140554** - Do not silently execute pack-supplied scripts/installers simply because they were inside an archive.
  - **State:** unverified. **Kind:** binding source prose.
  - **Binding context:** 13. FIRST-CLASS LAUNCHER COMPLETENESS — MAKE ENDERLOOM FEEL FINISHED / 13.19 Security and untrusted-content handling
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 1819-1819](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L1819-L1819) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 1819-1819](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L1819-L1819)

</details>

<details>
<summary>ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md / 14. DEFINITION OF DONE — USER-LEVEL OUTCOMES (1)</summary>

<a id="d-454bc1ff7f3e2d8b9e70"></a>
- [ ] **D-454bc1ff7f3e2d8b9e70** - Resource-pack/shader management preserves enabled state/order and exposes meaningful override/order information without forcing the user to edit text files manually.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 14. DEFINITION OF DONE — USER-LEVEL OUTCOMES
  - **Original specification:** [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 2288-2288](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L2288-L2288) / [ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md : 2288-2288](https://github.com/Herbertofury/Enderloom/blob/main/docs/specifications/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md#L2288-L2288)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 3. Performance / Testing tab — Premium Performance Lab / 3.1 Workspace identity (1)</summary>

<a id="d-ce51fc6eb38e5cefb5b7"></a>
- [ ] **D-ce51fc6eb38e5cefb5b7** - Primary question answered by the workspace: - What is slowing my pack down, and how do we prove it?
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Performance / Testing tab — Premium Performance Lab / 3.1 Workspace identity
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 115-116](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L115-L116)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 9. Test All Mods — adaptive whole-pack isolation (1)</summary>

<a id="d-0a51bf514c08fcb16e52"></a>
- [ ] **D-0a51bf514c08fcb16e52** - establish current-pack baseline;
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 9. Test All Mods — adaptive whole-pack isolation
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 363-363](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L363-L363)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 16. Performance history and staleness (1)</summary>

<a id="d-77387d5b313195186520"></a>
- [ ] **D-77387d5b313195186520** - Resource-pack/render-setting change invalidates affected render baseline.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 16. Performance history and staleness
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 587-587](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L587-L587)

</details>

<details>
<summary>ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md / 24. Implementation order / Phase 5 — Deep profilers + whole-pack intelligence (4)</summary>

<a id="d-93255ee88581a35d6786"></a>
- [ ] **D-93255ee88581a35d6786** - Observable adapter.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 5 — Deep profilers + whole-pack intelligence
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 865-865](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L865-L865)

<a id="d-e9463278b93257d6b0dd"></a>
- [ ] **D-e9463278b93257d6b0dd** - Interaction tests.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 5 — Deep profilers + whole-pack intelligence
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 867-867](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L867-L867)

<a id="d-b9278d52241ee9605793"></a>
- [ ] **D-b9278d52241ee9605793** - Confidence/noise engine.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 5 — Deep profilers + whole-pack intelligence
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 868-868](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L868-L868)

<a id="d-c11e173adf9ec26fa845"></a>
- [ ] **D-c11e173adf9ec26fa845** - Regression dashboard.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 24. Implementation order / Phase 5 — Deep profilers + whole-pack intelligence
  - **Original specification:** [ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md : 869-869](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_PERFORMANCE_FAVORITES_CHECKLIST.md#L869-L869)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 1. The Integration Law — absolutely non-negotiable (2)</summary>

<a id="d-e3f1137fa514b10b9ac0"></a>
- [ ] **D-e3f1137fa514b10b9ac0** - Performance test results appear on the mod row/card, mod detail page, Favorites, update planner, compatibility planner, repair workflow and pack dashboard.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. The Integration Law — absolutely non-negotiable
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 46-46](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L46-L46)

<a id="d-661f7e34eea85f110e7f"></a>
- [ ] **D-661f7e34eea85f110e7f** - Source/provider research is immediately actionable: install, port, compare, favorite, test, inspect source, open issues, or add to a pack.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 1. The Integration Law — absolutely non-negotiable
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 54-54](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L54-L54)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu (1)</summary>

<a id="d-1f8b2e37b457cc7a8f10"></a>
- [ ] **D-1f8b2e37b457cc7a8f10** - CurseForge
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 5. Right-click / Power Context Menu — obsessive QOL / 5.1 `Open / Sources` submenu
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 242-242](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L242-L242)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 6. Research / Catalog / Embedded Browser 2.0 (2)</summary>

<a id="d-28f2d8ae1efa4867921f"></a>
- [ ] **D-28f2d8ae1efa4867921f** - Install directly from research.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Research / Catalog / Embedded Browser 2.0
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 356-356](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L356-L356)

<a id="d-faec501ced687303a917"></a>
- [ ] **D-faec501ced687303a917** - Save research collection as modpack candidate set.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 6. Research / Catalog / Embedded Browser 2.0
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 357-357](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L357-L357)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 7. Bedrock Studio — first-class Bedrock support (3)</summary>

<a id="d-76a673940f60daa426b1"></a>
- [ ] **D-76a673940f60daa426b1** - behavior-pack folders
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Bedrock Studio — first-class Bedrock support
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 383-383](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L383-L383)

<a id="d-195ff22bf3dd87ad3c09"></a>
- [ ] **D-195ff22bf3dd87ad3c09** - resource-pack folders
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Bedrock Studio — first-class Bedrock support
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 384-384](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L384-L384)

<a id="d-26f6b1afb374a46e738c"></a>
- [ ] **D-26f6b1afb374a46e738c** - Show behavior/resource-pack linkage visually.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 7. Bedrock Studio — first-class Bedrock support
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 425-425](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L425-L425)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 8. Minecraft Marketplace integration (1)</summary>

<a id="d-eb1eff655d1549c7d36b"></a>
- [ ] **D-eb1eff655d1549c7d36b** - Keep purchased/user-authorized local pack imports separate from public page metadata.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 8. Minecraft Marketplace integration
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 446-446](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L446-L446)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 16. Premium Performance Lab — evidence everywhere (1)</summary>

<a id="d-43be4b9cc882c483b819"></a>
- [ ] **D-43be4b9cc882c483b819** - Pack dashboard ranks current offenders.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 16. Premium Performance Lab — evidence everywhere
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 748-748](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L748-L748)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 25. Resource Pack / Data Pack Studio (4)</summary>

<a id="d-dcded41130b561f3831b"></a>
- [ ] **D-dcded41130b561f3831b** - Resource pack browser.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 25. Resource Pack / Data Pack Studio
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1099-1099](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1099-L1099)

<a id="d-181a22a8842aa0a0f71e"></a>
- [ ] **D-181a22a8842aa0a0f71e** - Data pack browser.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 25. Resource Pack / Data Pack Studio
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1100-1100](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1100-L1100)

<a id="d-c576fb8661399640016f"></a>
- [ ] **D-c576fb8661399640016f** - Pack format/version migration.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 25. Resource Pack / Data Pack Studio
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1106-1106](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1106-L1106)

<a id="d-1c70b3fe9547031ec98f"></a>
- [ ] **D-1c70b3fe9547031ec98f** - Generate compatibility pack.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 25. Resource Pack / Data Pack Studio
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1110-1110](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1110-L1110)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 28. Modpack Workbench (2)</summary>

<a id="d-5b204d1a35fbf324de3a"></a>
- [ ] **D-5b204d1a35fbf324de3a** - CurseForge pack import/export where permitted.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 28. Modpack Workbench
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1164-1164](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1164-L1164)

<a id="d-677f0ee88b4fd7c6807f"></a>
- [ ] **D-677f0ee88b4fd7c6807f** - Server pack generation.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 28. Modpack Workbench
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1166-1166](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1166-L1166)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 29. Dependency / Update Solver (1)</summary>

<a id="d-f8eec61cf3972dce6b25"></a>
- [ ] **D-f8eec61cf3972dce6b25** - pack-level constraints.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 29. Dependency / Update Solver
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1192-1192](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1192-L1192)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 31. Launch Doctor / Fast Launch Engine (1)</summary>

<a id="d-df5e3378191ad623ed03"></a>
- [ ] **D-df5e3378191ad623ed03** - Slow data generation/pack reload.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 31. Launch Doctor / Fast Launch Engine
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1241-1241](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1241-L1241)

</details>

<details>
<summary>ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md / 45. Definition of done — ultimate Enderloom (1)</summary>

<a id="d-cd9aaf6d66a208c1ee2e"></a>
- [ ] **D-cd9aaf6d66a208c1ee2e** - Provider/browser/research, install state, source, performance, configs, compatibility, worlds, assets, conversion and repair share one graph.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 45. Definition of done — ultimate Enderloom
  - **Original specification:** [ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md : 1735-1735](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_ULTIMATE_CODEX_MASTER_BACKLOG.md#L1735-L1735)

</details>

<details>
<summary>LAUNCHER_PARITY_MATRIX.md / Enderloom launcher parity contract / Current release surface (1)</summary>

<a id="d-cda109778f7cdbf11810"></a>
- [ ] **D-cda109778f7cdbf11810** - | Capability | CurseForge | Modrinth | Enderloom status and contract | | --- | --- | --- | --- | | Primary navigation / game rail | Game rail, My Modpacks, Discover, Browse, Server...
  - **State:** unverified. **Kind:** binding source prose.
  - **Full requirement:** | Capability | CurseForge | Modrinth | Enderloom status and contract | | --- | --- | --- | --- | | Primary navigation / game rail | Game rail, My Modpacks, Discover, Browse, Servers, skins | Library, Discover, shared/server/world surfaces | Accepted. Premium Electron shell remains primary; Catalog and Mod Manager are top-level workspaces, never separate apps. | | Create and import | Create profile, ZIP/code imports | Create, MRPack and launcher imports | Accepted. Create vanilla/loader instances; import MRPack, CurseForge ZIP and packwiz; cancellation removes incomplete state. | | In-place external libraries | CurseForge profiles | Modrinth profiles | Accepted. Automatically detect/connect usable profiles in place with zero mandatory copying; preserve local alias, notes and organization; reconcile moves/version/loader changes; physical-path junction deduplication; disconnect preserves files; invalid or unavailable profiles remain untouched. | | Explicit clone/copy | Clone Modpack As | Duplicate/copy workflows | Accepted. Clone is explicit, byte-verified and source-preserving; group, favorite and tag organization is inherited. | | Groups | Create/edit/delete/reorder; enable/disable group actions | Persistent instance groups/memberships | Accepted. Persistent custom groups, reorder, drag/drop, safe deletion to Ungrouped. Group-wide content toggles remain a later enhancement. | | Favorites and tags | Favorites and organizer categories | Groups/content sets and organizer state | Accepted. Persistent favorites plus normalized reusable multi-tag memberships; filter/search/chips, context actions, drag-to-tag, rename/reorder/delete, clone inheritance and restart persistence. | | Views, search and menus | Tiles/table/list, grouped/flat, tile sizing, sorting, filtering and context actions | Persistent grouped library, sorting/filtering, drag organizer and card views | Accepted. My Modpacks now has real Tiles/Table/List renderers, Groups/Flat organization, persistent tile sizing, search, sort, favorite/group/tag filters, drag/drop, bulk selection and full context actions. Instance content has the same three real layouts, tile sizing, search, enabled/disabled/update/unlinked filters and sorting. | | Accounts and skins | Minecraft login and skins library | Microsoft auth, skins/capes/account state | Implemented. Microsoft device login, secure credential storage, active accounts, skin import/library/apply/delete. Partial: full 3D skin/cape preview parity is not claimed. | | Minecraft launch | Mojang/CF launcher choices, Java/memory | Native launch/process/JRE management | Accepted. Microsoft entitlements/tokens, Java discovery/install, loader resolution, JVM/env tools, supervised processes, live logs, identity-checked kill and restart recovery. | | Loaders and game versions | Forge/Fabric/NeoForge selection | Fabric/Quilt/Forge/NeoForge | Accepted. Real version discovery and loader resolution for Fabric, Quilt, Forge and NeoForge. | | Discover/providers | CurseForge catalog | Modrinth catalog | Accepted. Real Modrinth and CurseForge search/details/version planning, dependency resolution, downloads and provider identity. CurseForge uses the official api.curseforge.com/v1 surface with an inline validate-and-connect flow; the API key is held by Windows Credential Manager, never the settings database. Files whose authors disable third-party downloads use an explicit browser handoff followed by name/hash/size verification. Catalog provider research opens alongside manager workflows. | | Mods, resource packs, shaders, data packs | Browse/install/update/toggle/remove | Browse/install/update/toggle/remove | Accepted. Managed and manual content, dependency plans, toggles, deletion, reconciliation, updates, world data packs, provenance and rollback. | | Exact versions and update locks | Version choice and update controls | Switch version, changelogs and freeze version | Accepted. Searchable compatible/incompatible version picker, changelog inspection, pre-change snapshot, exact-version replacement, persistent freeze/unfreeze and backend-enforced update suppression. Frozen projects are rejected by the resolver until explicitly unfrozen. | | Modpacks and updates | Create/import/export/share/scan | MRPack/import/export/update | Accepted for ZIP/MRPack/packwiz install, export, provider link, upgrade plan/apply/unlink and cancellation rollback. Partial: CurseForge proprietary share-code service is not cloned or faked. | | Worlds | World browsing/backup/content | First-class world status, rename, icon, backup/delete | Accepted for world inspection/import/delete, snapshots and data packs. Partial: rich world icon/rename presentation remains below Modrinth&#x27;s complete surface. | | Servers | My Servers, browse, host/import/share/manage/restore | Instance servers and synced servers | Accepted for managed/external servers, install, EULA, properties, players/whitelist, safe files/editor, content, console, start/stop/restart, supervision, imports and transactional deletion. Partial: hosted/synced proprietary cloud services are not impersonated. | | Backups/snapshots/repair | Profile repair, backup deletion, logs ZIP | Backups/quarantine/repair state | Accepted. Snapshots create/rename/restore/delete; automatic pre-restore snapshot; transactional quarantine; cancellable repair; recoverable application reset. | | Logs and diagnostics | Profile/app logs and support ZIP | Process/log/diagnostic views | Accepted. Plain/gzip logs, search/severity, OOM diagnosis, redaction, traversal guards, runtime levels and controlled deletion. External upload is never invoked silently. | | External change safety | Launcher-owned state | Synced options/quarantine/content locks | Accepted for metadata reconciliation and root/path safety. Partial: Modrinth shared-instance invitations, cloud sync, synced options and remote content-set collaboration are future integrations requiring their real service contracts. | | Catalog-to-manager bridge | External web discovery | Provider project discovery | Accepted. Catalog cards/details expose a primary Enderloom install action plus compact Modrinth/CurseForge launcher handoffs. Source buttons show at most one CurseForge, one Modrinth and one GitHub home; every other distinct source is retained in a compact uncapped More menu. Modrinth and CurseForge project pages open a real searchable multi-instance picker with game-version/loader compatibility, already-installed state, multi-select, exact-version planning and dependency/conflict review. Installed content can reopen focused Catalog/provider research. | | Catalog document interchange | Web links and pack manifests | Provider collections and export | Accepted locally. XLSX/CSV/JSON/HTML/PDF import/export preserves research fields and emits clickable enriched media links. Google Sheets/Docs/Drive PDFs can be registered from the current browser page and refreshed through Enderloom&#x27;s own signed-in session; private sources surface sign-in-required instead of fake data. Direct mutation of a native Google Doc/Sheet is not claimed. | | Mod Manager/Web split research | Side-by-side web/install flows | Project pages alongside library | Accepted. The native resizable/swap/reset split can pair either Catalog or Mod Manager with a live browser tab, keeps both WebContentsView panes full-height and updates shell/status labels to the active workspace. | | Updates and distribution | Signed desktop updater | Signed Tauri updater | Safe/Partial. Electron checks the Enderloom repository but reports manual installation. Inherited Tauri download/install is explicitly refused; no unsigned or incompatible updater is presented as working. |
  - **Binding context:** Enderloom launcher parity contract / Current release surface
  - **Original specification:** [LAUNCHER_PARITY_MATRIX.md : 20-44](https://github.com/Herbertofury/Enderloom/blob/main/docs/LAUNCHER_PARITY_MATRIX.md#L20-L44)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 3. Full launcher CLI parity checklist / Modpacks / interchange (9)</summary>

<a id="d-15b07cb1a902442c0406"></a>
- [ ] **D-15b07cb1a902442c0406** - enderloom pack inspect
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Modpacks / interchange
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 199-199](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L199-L199)

<a id="d-024d69baabd5d7ea9289"></a>
- [ ] **D-024d69baabd5d7ea9289** - enderloom pack import
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Modpacks / interchange
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 200-200](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L200-L200)

<a id="d-514c491fd2939fa85f16"></a>
- [ ] **D-514c491fd2939fa85f16** - enderloom pack import-packwiz
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Modpacks / interchange
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 201-201](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L201-L201)

<a id="d-99b49ea80c32326a6a42"></a>
- [ ] **D-99b49ea80c32326a6a42** - enderloom pack export
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Modpacks / interchange
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 202-202](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L202-L202)

<a id="d-53a8dbf5c7ff23107400"></a>
- [ ] **D-53a8dbf5c7ff23107400** - enderloom pack link/unlink
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Modpacks / interchange
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 203-203](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L203-L203)

<a id="d-50d537b2ad49e6eacd06"></a>
- [ ] **D-50d537b2ad49e6eacd06** - enderloom pack check-update
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Modpacks / interchange
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 204-204](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L204-L204)

<a id="d-a2be8072b139ef8b7a2f"></a>
- [ ] **D-a2be8072b139ef8b7a2f** - enderloom pack plan-update
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Modpacks / interchange
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 205-205](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L205-L205)

<a id="d-701a2241075b6e24bb96"></a>
- [ ] **D-701a2241075b6e24bb96** - enderloom pack update
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Modpacks / interchange
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 206-206](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L206-L206)

<a id="d-2ff9bde19163bf43322e"></a>
- [ ] **D-2ff9bde19163bf43322e** - MRPack, CurseForge ZIP, and packwiz parity with GUI.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Modpacks / interchange
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 207-207](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L207-L207)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 3. Full launcher CLI parity checklist / Servers (1)</summary>

<a id="d-3e432a8f11af83206d19"></a>
- [ ] **D-3e432a8f11af83206d19** - enderloom server pack install/update
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 3. Full launcher CLI parity checklist / Servers
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 261-261](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L261-L261)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 15. Implementation order for Codex / Phase CLI-5 — profiler adapters + whole-pack intelligence (1)</summary>

<a id="d-6f23c706ad3249fec017"></a>
- [ ] **D-6f23c706ad3249fec017** - adaptive whole-pack sweep
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 15. Implementation order for Codex / Phase CLI-5 — profiler adapters + whole-pack intelligence
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 879-879](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L879-L879)

</details>

<details>
<summary>PREMIUM_TESTING_FULL_CLI_CHECKLIST.md / 17. Definition of done (1)</summary>

<a id="d-7629e518f55d6cadc828"></a>
- [ ] **D-7629e518f55d6cadc828** - No live external CurseForge/Modrinth profile is mutated by automated testing.
  - **State:** unverified. **Kind:** source task.
  - **Binding context:** 17. Definition of done
  - **Original specification:** [PREMIUM_TESTING_FULL_CLI_CHECKLIST.md : 932-932](https://github.com/Herbertofury/Enderloom/blob/main/docs/PREMIUM_TESTING_FULL_CLI_CHECKLIST.md#L932-L932)

</details>

