# Browser, ad filtering and translation

[Home](Home.md) / [Checklist](Checklist.md) / [Architecture](Architecture.md) / [Ecosystem](Ecosystem.md) / [Source map](Source-Map.md)

> Preserve real Chromium behavior, verified network filtering and safe translation without weakening project-media identity.

**[Canonical outcome LIB-03](Checklist.md#lib-03)** / **[Every browser requirement](Acceptance-LIB.md#lib-03-details)**

Real persistent tabs and sessions, user-performed login, source/full/split layouts, verified ad/network rules, integrated translation, Original/Translated switching, selected text, dynamic pages and per-site preferences remain explicit requirements. Upstream translation recipes must be allow-listed rather than executing arbitrary privileged code. Login-sensitive providers use the legitimate user session; do not export credentials or bypass access controls.

**An ad blocker is not a gallery filter.** Preserve and test both the network/DOM filtering path and the exact-project media extraction path.

- [D-4cae1fb825d54c14f545](Acceptance-LIB.md#d-4cae1fb825d54c14f545) - - Fixed the false-positive adblock state exposed by Planet Minecraft: uBO … on previously meant only that Electron accepted the extension package. 2.0.10 adds an authorit...
- [D-5a55e6e63b6447dcba2c](Acceptance-LIB.md#d-5a55e6e63b6447dcba2c) - The real integrated Chromium browser is a first-class execution surface.
- [D-2e7f86235ced1f3664be](Acceptance-LIB.md#d-2e7f86235ced1f3664be) - Browser automation must not run privileged Node APIs in arbitrary page JavaScript.
- [D-b5f70a0347fdda8634ed](Acceptance-LIB.md#d-b5f70a0347fdda8634ed) - No API key or separate paid API is required for the default in-browser chat lane.
- [D-bbf1021c4fae7ddd0e7e](Acceptance-LIB.md#d-bbf1021c4fae7ddd0e7e) - Browser: real persistent Chromium sessions/tabs, login-sensitive sites through the user’s session, safe translation, Full/Split research layouts. [P0-011]
- [D-9a303b8fff5c09e92976](Acceptance-LIB.md#d-9a303b8fff5c09e92976) - KubeJS project browser/editor;
- [D-c02109a541b38370ed6d](Acceptance-LIB.md#d-c02109a541b38370ed6d) - CraftTweaker/ZenScript project browser/editor;
- [D-ab441400db53092acc25](Acceptance-LIB.md#d-ab441400db53092acc25) - Sound browser/mixer.
- [D-15370d03ace9962e3183](Acceptance-LIB.md#d-15370d03ace9962e3183) - never fake hosted-cloud capability when no provider API is available.
- [D-9b695daaa5b1f9d3716b](Acceptance-LIB.md#d-9b695daaa5b1f9d3716b) - GATE — Browser/download experience behaves like a normal modern browser [G002]
- [D-ba6de9e3bdbf6b2c889d](Acceptance-LIB.md#d-ba6de9e3bdbf6b2c889d) - · Chrome-normal downloads in the embedded browser [T004]
- [D-879211ae4a7be28ff70d](Acceptance-LIB.md#d-879211ae4a7be28ff70d) - The existing paste-a-file-link / optional SHA utility may remain as an advanced direct-download tool, but it must not be the normal browser download workflow.
- [D-3ca8ca9454eb71ed9e8f](Acceptance-LIB.md#d-3ca8ca9454eb71ed9e8f) - · Browser extensions [T005]
- [D-c1b8a296542828aae260](Acceptance-LIB.md#d-c1b8a296542828aae260) - · Upgrade and pin/test the newest stable Electron baseline before the browser modernization lands [T026]
- [D-d6ff45a777131478beaa](Acceptance-LIB.md#d-d6ff45a777131478beaa) - Observed failure: a project opened from one provider can fail to expose its real listing on the other provider. The concrete regression is Punchy!: CurseForge presents “P...
- [D-99f676cb2b242d5c2fd3](Acceptance-LIB.md#d-99f676cb2b242d5c2fd3) - · GitHub opens directly inside Browse like Modrinth/CurseForge, with compact promotion into a normal Enderloom tab [T044]
- [D-2e01c06469aa6e78f992](Acceptance-LIB.md#d-2e01c06469aa6e78f992) - Required behavior:
- [D-455bc90b83252f329ac4](Acceptance-LIB.md#d-455bc90b83252f329ac4) - · Add Ctrl+Shift+T, recently closed tabs, and durable browser-session restore [T029]
- [D-cd3ed0be4280e5b7b77f](Acceptance-LIB.md#d-cd3ed0be4280e5b7b77f) - · Add searchable browser history with Ctrl+H and sane privacy controls [T030]
- [D-8b36bc443b9b7233c693](Acceptance-LIB.md#d-8b36bc443b9b7233c693) - · Add contextual browser menus instead of generic app-only right-click behavior [T031]
- [D-44d79e64eb503b0e2202](Acceptance-LIB.md#d-44d79e64eb503b0e2202) - · Make the address/search bar behave like a real browser omnibox [T033]
- [D-b19d16308edf64f12554](Acceptance-LIB.md#d-b19d16308edf64f12554) - · Recover the affected browser surface instead of destabilizing Enderloom [T035]
- [D-4dfbc961bc5cd66d3b24](Acceptance-LIB.md#d-4dfbc961bc5cd66d3b24) - · Integrate meaningful download/browser state with Windows [T042]
- [D-0b2215b3e32ee41c05cb](Acceptance-LIB.md#d-0b2215b3e32ee41c05cb) - This document is complete only when G010 is closed and every leaf task and gate is checked with real implementation + applicable runtime/regression evidence, no accepted ...
- [D-afb050b3bb42c5bbdc64](Acceptance-LIB.md#d-afb050b3bb42c5bbdc64) - Browser — real Chromium browser tabs.
- [D-69229290e9c1db450741](Acceptance-LIB.md#d-69229290e9c1db450741) - Split — resizable side-by-side app/browser or app/app research workflows.
- [D-82eaf1d38c06ea68ac68](Acceptance-LIB.md#d-82eaf1d38c06ea68ac68) - Browse large curated catalogs.
- [D-0e55ac1daf5713ec43bb](Acceptance-LIB.md#d-0e55ac1daf5713ec43bb) - Notes.
- [D-eb5c33b9215f3a7cd569](Acceptance-LIB.md#d-eb5c33b9215f3a7cd569) - Creator/avatar identity.
- [D-7c5a220d9f8078de411c](Acceptance-LIB.md#d-7c5a220d9f8078de411c) - Real source/provider browser pages.
- [D-a14bfb68367c1da15a79](Acceptance-LIB.md#d-a14bfb68367c1da15a79) - Persistent browser sessions/cookies.
- [D-4af0575a7cec18c03a0c](Acceptance-LIB.md#d-4af0575a7cec18c03a0c) - Real Chromium tabs, not scraped/static approximations.
- [D-dd6854c0310687fdb06f](Acceptance-LIB.md#d-dd6854c0310687fdb06f) - Persistent session.
- [D-28d732153926e131f9fe](Acceptance-LIB.md#d-28d732153926e131f9fe) - Real site login where the user signs in.
- [D-60526536314a63a50d2d](Acceptance-LIB.md#d-60526536314a63a50d2d) - Ad/network filtering with verified rules.
- [D-52edc053c83c88caf7ea](Acceptance-LIB.md#d-52edc053c83c88caf7ea) - Integrated web-page translation.
- [D-f4d6f02552adb5164e95](Acceptance-LIB.md#d-f4d6f02552adb5164e95) - Original/Translated toggle.
- [D-0128d6e0c904d87a5d96](Acceptance-LIB.md#d-0128d6e0c904d87a5d96) - Selected-text translation.
- [D-6a0e7249611b99cbf5bf](Acceptance-LIB.md#d-6a0e7249611b99cbf5bf) - Dynamic-page translation.
- [D-bd5bf5cbf1ea1c5ee986](Acceptance-LIB.md#d-bd5bf5cbf1ea1c5ee986) - Per-site auto-translate.
- [D-a282f22f7e82d4ec57a4](Acceptance-LIB.md#d-a282f22f7e82d4ec57a4) - Multiple translation provider recipes where implemented safely.
- [D-5354afd1ec126a321045](Acceptance-LIB.md#d-5354afd1ec126a321045) - Upstream translation recipe updates must be allow-listed and must not blindly execute third-party privileged JavaScript.
- [D-1c51856bd1d12c254d28](Acceptance-LIB.md#d-1c51856bd1d12c254d28) - Register current signed-in Google Sheets/Docs/Drive PDF sources through the live browser session where supported.
- [D-3e2e826e3a29ae26e9ee](Acceptance-LIB.md#d-3e2e826e3a29ae26e9ee) - Direct Google Doc/Sheet mutation only when implemented through a real supported connector/contract; do not fake it.
- [D-49d51bdd91fbb2912a63](Acceptance-LIB.md#d-49d51bdd91fbb2912a63) - Resizable split.
- [D-b4f911b80f7c2b4b8cfa](Acceptance-LIB.md#d-b4f911b80f7c2b4b8cfa) - Swap/reset split.
- [D-ba7e6d1eecd30e7c8da2](Acceptance-LIB.md#d-ba7e6d1eecd30e7c8da2) - Catalog + Browser pairing.
- [D-94a6adc3278edfab54b9](Acceptance-LIB.md#d-94a6adc3278edfab54b9) - Mod Manager + Browser pairing.
- [D-ef07bcd6640d59b918e0](Acceptance-LIB.md#d-ef07bcd6640d59b918e0) - Full-height WebContentsView panes.
- [D-148dc0ece63a2e391d35](Acceptance-LIB.md#d-148dc0ece63a2e391d35) - Testing + Browser pairing for profiler docs, mod source, issue trackers, AI/provider pages.
- [D-6f7d2471c7a4200231c9](Acceptance-LIB.md#d-6f7d2471c7a4200231c9) - Catalog, Mod Manager, Browser, Split, and Testing are one coherent app.
- [D-e1d51110a4aaeaa029e4](Acceptance-LIB.md#d-e1d51110a4aaeaa029e4) - External CurseForge/Modrinth profiles can be used in place without forced copying.
- [D-add29e223f21afb43360](Acceptance-LIB.md#d-add29e223f21afb43360) - If an official third-party service exposes a supported authenticated collaboration API, integrate it through that real contract. Do not fake CurseForge/Modrinth proprieta...
- [D-4fd798d806e2721c2b47](Acceptance-LIB.md#d-4fd798d806e2721c2b47) - Favorite items can be acted on immediately without hunting through other tabs.
- [D-d4bd5609d82b6ac6f4cc](Acceptance-LIB.md#d-d4bd5609d82b6ac6f4cc) - Open the real CurseForge/Modrinth/Planet Minecraft/AFDIAN/MCPEDL/ModBay/Minecraft Marketplace/GitHub/GitLab/etc. page inside Enderloom’s real persistent browser.
- [D-ecb3e5f00d500c5be798](Acceptance-LIB.md#d-ecb3e5f00d500c5be798) - The browser can open any relevant project/task/evidence beside the native Enderloom surface in Split view.
- [D-5447443f7e896a5dd747](Acceptance-LIB.md#d-5447443f7e896a5dd747) - Result deduplication by canonical identity rather than title text.
- [D-4fd4901647b76aac0f07](Acceptance-LIB.md#d-4fd4901647b76aac0f07) - Provider-specific filters.
- [D-50b5e91da389f46585f9](Acceptance-LIB.md#d-50b5e91da389f46585f9) - Minecraft version/loader filters.
- [D-ccecb55757e24241153c](Acceptance-LIB.md#d-ccecb55757e24241153c) - Project type filter.
- [D-9ff589d8d1f7b86466b3](Acceptance-LIB.md#d-9ff589d8d1f7b86466b3) - Free/paid/source-available/licensed filter where known.
- [D-fb860aa685f147094edc](Acceptance-LIB.md#d-fb860aa685f147094edc) - Already-installed/favorite/tested/known-good filter.
- [D-6720579efbca309ced9e](Acceptance-LIB.md#d-6720579efbca309ced9e) - Measured performance filter.
- [D-5297428880559615e52f](Acceptance-LIB.md#d-5297428880559615e52f) - Development activity/release freshness.
- [D-d5d28f8267155c4e8123](Acceptance-LIB.md#d-d5d28f8267155c4e8123) - Source repository health.
- [D-0c0dcd5363c5c53df810](Acceptance-LIB.md#d-0c0dcd5363c5c53df810) - Show alternatives/related projects.
- [D-54d12dd2a3faf0cc7e3c](Acceptance-LIB.md#d-54d12dd2a3faf0cc7e3c) - Compare projects side-by-side.
- [D-f28ddcff6a5339a6b950](Acceptance-LIB.md#d-f28ddcff6a5339a6b950) - Persistent authenticated sessions.
- [D-b0aa0b922d00bc22612c](Acceptance-LIB.md#d-b0aa0b922d00bc22612c) - Real Chromium tabs.
- [D-fd5c970e1177f222feca](Acceptance-LIB.md#d-fd5c970e1177f222feca) - Split view with any Enderloom workspace.
- [D-57a827f78cdff902fe62](Acceptance-LIB.md#d-57a827f78cdff902fe62) - Download interception/adoption into relevant workflows.
- [D-4c8dd3557c86ba7c910d](Acceptance-LIB.md#d-4c8dd3557c86ba7c910d) - Per-site translation.
- [D-c3cc122b07b914152fc6](Acceptance-LIB.md#d-c3cc122b07b914152fc6) - Ad filtering.
- [D-d2fd41c40532127f8453](Acceptance-LIB.md#d-d2fd41c40532127f8453) - Use downloaded file as candidate action.
- [D-c023a090490cd5da13f1](Acceptance-LIB.md#d-c023a090490cd5da13f1) - Task-aware tabs: repair/port/conversion/research jobs remember their browser context.
- [D-1ab8b39ddd365db0fe8e](Acceptance-LIB.md#d-1ab8b39ddd365db0fe8e) - Open Marketplace PDPs directly inside Enderloom Browser.
- [D-b8b04e36a1dc75f79106](Acceptance-LIB.md#d-b8b04e36a1dc75f79106) - Default browser-chat lane uses Enderloom’s integrated persistent authenticated browser; no separate API key is required for this lane.
- [D-ab1c1d45a7b7a5ce9789](Acceptance-LIB.md#d-ab1c1d45a7b7a5ce9789) - Submit inside Enderloom Browser.
- [D-49fad7895cdb29e2b257](Acceptance-LIB.md#d-49fad7895cdb29e2b257) - Post-install smoke the real connected instance.
- [D-68220716e0bf8e4bf9e8](Acceptance-LIB.md#d-68220716e0bf8e4bf9e8) - CurseForge publishing only through supported authorized API/browser flow;
- [D-3f43c4f05ba3ab75a8da](Acceptance-LIB.md#d-3f43c4f05ba3ab75a8da) - reveal in browser;
- [D-8c8d8fbb333cf5c18f3e](Acceptance-LIB.md#d-8c8d8fbb333cf5c18f3e) - Middle-click project opens background Browser tab.
- [D-b0c2dae5acf1c44d8edc](Acceptance-LIB.md#d-b0c2dae5acf1c44d8edc) - No browser credential extraction.
- [D-aa453453e1e8749ceda2](Acceptance-LIB.md#d-aa453453e1e8749ceda2) - browser adapter fixture;
- [D-af21bd9d20bdf2e5e067](Acceptance-LIB.md#d-af21bd9d20bdf2e5e067) - Preserve existing accepted Catalog/Browser/Launcher behavior.
- [D-c72add851e82f18eb446](Acceptance-LIB.md#d-c72add851e82f18eb446) - - Never mutate either real launcher library during QA; fingerprint before and after scans. - Never copy an external profile unless the user explicitly chooses Clone/Copy....
