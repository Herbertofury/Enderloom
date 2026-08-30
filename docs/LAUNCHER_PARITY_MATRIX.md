# Enderloom launcher parity contract

Updated: 2026-08-30

This is a code-level release contract, not a screenshot checklist. Enderloom was compared with the actually installed launchers and with the exact public Modrinth source corresponding to the installed build. Proprietary CurseForge code and Modrinth source were inspected read-only and were not copied into this repository.

## Audited references

| Reference | Exact evidence |
| --- | --- |
| CurseForge Windows | Installed version `1.317.0-37682`; valid signed backup executable SHA-256 `A4CFC3C0B69728282081F97F28EB03AB1F932185D1DC54827AC423FCB7E31D6F`; original ASAR SHA-256 `9D35CAAF9DBBBA759C62C725A9F97EA16DBD4620D942BBB58104413E71F113ED` |
| Modrinth App | Installed version `0.19.1`, valid Rinth, Inc. signature; official tag `v0.19.1`, commit `5d47594302b8b9eb66348f3d76e4894e35542aa3` |
| Modrinth profile database | Opened read-only/immutable for schema inspection only; 42 organizer/instance/content/server/world/process/account/settings tables observed; no credentials or row data exported |
| Enderloom basis | Minecraft Catalog Companion `2.9.5` plus the authorized `MegalithOfficial/basalt-launcher` Rust and React/TypeScript systems, adapted to Electron IPC |

## Current release surface

Status meanings: **Accepted** is implemented and exercised by automated native or Electron QA; **Implemented** is real code with build/type coverage; **Partial** is usable but does not yet match every remote-service workflow.

| Capability | CurseForge | Modrinth | Enderloom status and contract |
| --- | --- | --- | --- |
| Primary navigation / game rail | Game rail, My Modpacks, Discover, Browse, Servers, skins | Library, Discover, shared/server/world surfaces | **Accepted.** Premium Electron shell remains primary; Catalog and Mod Manager are top-level workspaces, never separate apps. |
| Create and import | Create profile, ZIP/code imports | Create, MRPack and launcher imports | **Accepted.** Create vanilla/loader instances; import MRPack, CurseForge ZIP and packwiz; cancellation removes incomplete state. |
| In-place external libraries | CurseForge profiles | Modrinth profiles | **Accepted.** Automatically detect/connect usable profiles in place with zero mandatory copying; preserve local alias, notes and organization; reconcile moves/version/loader changes; physical-path junction deduplication; disconnect preserves files; invalid or unavailable profiles remain untouched. |
| Explicit clone/copy | Clone Modpack As | Duplicate/copy workflows | **Accepted.** Clone is explicit, byte-verified and source-preserving; group, favorite and tag organization is inherited. |
| Groups | Create/edit/delete/reorder; enable/disable group actions | Persistent instance groups/memberships | **Accepted.** Persistent custom groups, reorder, drag/drop, safe deletion to Ungrouped. Group-wide content toggles remain a later enhancement. |
| Favorites and tags | Favorites and organizer categories | Groups/content sets and organizer state | **Accepted.** Persistent favorites plus normalized reusable multi-tag memberships; filter/search/chips, context actions, drag-to-tag, rename/reorder/delete, clone inheritance and restart persistence. |
| Views, search and menus | Grid/list customization, spotlight/context actions | Grid/list/library search and actions | **Accepted.** Grid/list, sorting, search including tag names, bulk selection, context menus, launch/edit/folder/clone/move/tag/favorite/delete. |
| Accounts and skins | Minecraft login and skins library | Microsoft auth, skins/capes/account state | **Implemented.** Microsoft device login, secure credential storage, active accounts, skin import/library/apply/delete. **Partial:** full 3D skin/cape preview parity is not claimed. |
| Minecraft launch | Mojang/CF launcher choices, Java/memory | Native launch/process/JRE management | **Accepted.** Microsoft entitlements/tokens, Java discovery/install, loader resolution, JVM/env tools, supervised processes, live logs, identity-checked kill and restart recovery. |
| Loaders and game versions | Forge/Fabric/NeoForge selection | Fabric/Quilt/Forge/NeoForge | **Accepted.** Real version discovery and loader resolution for Fabric, Quilt, Forge and NeoForge. |
| Discover/providers | CurseForge catalog | Modrinth catalog | **Accepted.** Real Modrinth and CurseForge search/details/version planning, dependency resolution, downloads and provider identity. Catalog provider research opens alongside manager workflows. |
| Mods, resource packs, shaders, data packs | Browse/install/update/toggle/remove | Browse/install/update/toggle/remove | **Accepted.** Managed and manual content, dependency plans, toggles, deletion, reconciliation, updates, world data packs, provenance and rollback. |
| Modpacks and updates | Create/import/export/share/scan | MRPack/import/export/update | **Accepted** for ZIP/MRPack/packwiz install, export, provider link, upgrade plan/apply/unlink and cancellation rollback. **Partial:** CurseForge proprietary share-code service is not cloned or faked. |
| Worlds | World browsing/backup/content | First-class world status, rename, icon, backup/delete | **Accepted** for world inspection/import/delete, snapshots and data packs. **Partial:** rich world icon/rename presentation remains below Modrinth's complete surface. |
| Servers | My Servers, browse, host/import/share/manage/restore | Instance servers and synced servers | **Accepted** for managed/external servers, install, EULA, properties, players/whitelist, safe files/editor, content, console, start/stop/restart, supervision, imports and transactional deletion. **Partial:** hosted/synced proprietary cloud services are not impersonated. |
| Backups/snapshots/repair | Profile repair, backup deletion, logs ZIP | Backups/quarantine/repair state | **Accepted.** Snapshots create/rename/restore/delete; automatic pre-restore snapshot; transactional quarantine; cancellable repair; recoverable application reset. |
| Logs and diagnostics | Profile/app logs and support ZIP | Process/log/diagnostic views | **Accepted.** Plain/gzip logs, search/severity, OOM diagnosis, redaction, traversal guards, runtime levels and controlled deletion. External upload is never invoked silently. |
| External change safety | Launcher-owned state | Synced options/quarantine/content locks | **Accepted** for metadata reconciliation and root/path safety. **Partial:** Modrinth shared-instance invitations, cloud sync, synced options and remote content-set collaboration are future integrations requiring their real service contracts. |
| Catalog-to-manager bridge | External web discovery | Provider project discovery | **Accepted.** Catalog cards/details expose a primary Enderloom install action plus compact Modrinth/CurseForge launcher handoffs. Modrinth and CurseForge project pages open a real searchable multi-instance picker with game-version/loader compatibility, already-installed state, multi-select, exact-version planning and dependency/conflict review. Installed content can reopen focused Catalog/provider research. |
| Mod Manager/Web split research | Side-by-side web/install flows | Project pages alongside library | **Accepted.** The native resizable/swap/reset split can pair either Catalog or Mod Manager with a live browser tab, keeps both WebContentsView panes full-height and updates shell/status labels to the active workspace. |
| Updates and distribution | Signed desktop updater | Signed Tauri updater | **Safe/Partial.** Electron checks the Enderloom repository but reports manual installation. Inherited Tauri download/install is explicitly refused; no unsigned or incompatible updater is presented as working. |

## Non-negotiable release gates

- Never mutate either real launcher library during QA; fingerprint before and after scans.
- Never copy an external profile unless the user explicitly chooses Clone/Copy.
- Treat junctions and symlinks by physical identity; never recurse-delete through an unresolved link.
- Use staged writes, rollback/quarantine and pre-restore snapshots for destructive workflows.
- Preserve Catalog, Source, Browser, Full and Split modes, persistent sessions/cookies, WebContentsView tabs, translator, verified ad blocking, media/galleries, identity safety, favorites and notes.
- Expose only real IPC capabilities. Unsupported proprietary/cloud workflows must say they are unavailable rather than render fake controls.
- Require the command coverage gate, native integration acceptance, combined Electron self-test and full Catalog release suite before a release checkpoint.
