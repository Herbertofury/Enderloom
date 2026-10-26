# Marketplace, Studio comparison and Bedrock conversion roadmap

**Planned / not implemented by this change. Recorded October 4, 2026.**

[Home](https://github.com/Herbertofury/Enderloom/wiki/Home) / [Implementation checklist](https://github.com/Herbertofury/Enderloom/wiki/Checklist) / [Studio](https://github.com/Herbertofury/Enderloom/wiki/Studio) / [Conversion](https://github.com/Herbertofury/Enderloom/wiki/Conversion)

Build the complete requested experience: browse the Bedrock Marketplace inside
Enderloom, choose official Minecraft handoff or an integrated authorized-content
download route, compare complete projects side by side, and bring **Actions & Stuff
1.11.1** across to Java as the demanding first Bedrock fixture. Develop both
conversion directions through the same reusable Studio pipeline. Full feature
parity is the acceptance target; the roadmap sets no arbitrary asset or mod limit.

The separate AoA implementation continues. This documentation was prepared in an
isolated checkout of `Herbertofury/Enderloom` main at
`67a7881377ad4680936729efdf4b64f6abc5f931`. The active tree, its dirty changes,
running jobs and supplied archives were read only. No conversion, third-party
tool execution, asset publication, merge or app deployment occurred.

## Implementation contract and progress

Retain the [main stack contract](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_NEXT_GEN_TECH_STACK_FULL_IMPLEMENTATION.md),
[version graph contract](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_UNIVERSAL_VERSION_GRAPH_ENGINE_FULL_IMPLEMENTATION.md),
[ecosystem directive](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_CONVERSION_ECOSYSTEM_INTEGRATION_DIRECTIVE_2026-09-23.md)
and all earned AoA/Studio evidence. Extend the canonical project, job, dependency,
provenance and runtime services; reuse the real Electron browser session and
project-owned Blockbench integration at the eventual implementation checkpoint.
This request supplements existing obligations.

`docs/knowledge/requirements.json` remains the sole progress owner. The identifiers
below identify requirement slices, not a second certification ledger. All slices
are **planned**. Their existing outcome owners appear in the tables; existing
statuses stay unchanged. Evidence must explicitly name the slice and target cell
before its parent outcome can pass. Prior successful Bedrock conversions are
valuable reference fixtures when available; their absence does not block planning
or reduce the requested scope.

| Priority | Slice | Deliverable | Dependency | Existing outcome owner |
| --- | --- | --- | --- | --- |
| P0 | B01 | Immutable input/provenance index and safe third-party layout | None | PORT-01, SHIP-01 |
| P0 | B02 | Marketplace inside Browse, retaining the complete official site | B01; existing browser surface | LIB-01, UX-06 |
| P0 | B03 | Official **Open in Minecraft Bedrock** purchase/download handoff | B02 | LIB-01, PLAY-05 |
| P0 | B04 | Review PackDL/McTools adapters and authorized operation contract | B01; source/API/license review | DEP-04, SHIP-01 |
| P1 | B05 | Complete integrated **Download with Enderloom** route | B03, B04, B06 | LIB-01, DEP-06 |
| P1 | B06 | Upstream tracking, explicit update review and rollback | B01, B04 | DEP-04, SHIP-01 |
| P1 | S01 | Two complete inputs, semantic inventory and dependency diff | B01; canonical Studio graph | PORT-02, MAKE-05 |
| P1 | S02 | Synchronized visual/model/texture/animation/audio comparison | S01 | MAKE-07, MAKE-08 |
| P1 | C01 | Version-specific, bidirectional conversion capability matrix | B01, S01; version graph | PORT-03, PORT-13 |
| P1 | C02 | Full Actions & Stuff fixture census and source runtime baseline | B01, B04, C01 | PORT-01, TEST-03 |
| P2 | C03 | Bedrock -> Java full Actions & Stuff parity through ordinary Studio | C02, S02; required target adapters | PORT-13, MAKE-08 |
| P2 | C04 | Java -> Bedrock, round-trip and independent behavior fixtures | C01, C03 | PORT-13, TEST-06 |
| P2 | Q01 | Packaged UX, accessibility, performance and failure acceptance | B05, S02, C03, C04 | TEST-03, SHIP-04 |

## Marketplace and the two download choices

**B02 acceptance.** Add Marketplace beside CurseForge/Modrinth in Browse and load
the full [official Marketplace](https://www.minecraft.net/en-us/marketplace) in the
current native browser surface. Preserve normal search, available filters,
sorting, categories, creator links, product details/media, account session,
back/forward, page errors and scrolling. Titles and verified creators are
keyboard-accessible links to their complete pages. Keep one explicit new-tab
action at the far right; ordinary source switching opens no extra tab. Test
switching away/back, details/back, detached/split windows, resize, overlays and
restart with provider selections, query, results and scroll intact.

Exercise the actual provider's pagination/load-more behavior across the complete
saved result context: changing sort/filter/search while requests are pending,
duplicate items, stale page responses, terminal pages, transient errors, retry,
rate limiting and interrupted navigation. Preserve every result; do not cap the
catalogue or infer completion from the first page. If a permitted structured
catalogue adapter is added, bind cursor/query/locale/sort/filter generations,
deduplicate by verified product ID and retain page-boundary receipts. Website
browsing remains a complete route while that API contract is validated.

Test keyboard-only operation, named controls, focus restoration, screen-reader
results/loading/error announcements, high contrast, reduced motion and zoom on
Enderloom's surrounding controls. Record any upstream website accessibility
defect independently rather than claiming that Enderloom fixed the remote site.

**B03 acceptance.** Show **Open in Minecraft Bedrock** on an exact product. Use its
official product action or a validated, allowlisted product-ID handoff. Purchase,
entitlement and download stay in the official Minecraft flow. Verify app present /
missing, already running / closed, signed in / out, owned / not owned, free /
paid, invalid ID, wrong account and user cancellation. A launched protocol handler
is not proof of purchase or installation. Preserve the official web page as the
recovery route and never guess a product from its title. No purchase is part of
these tests. Microsoft's [deep-link documentation](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/deep-links?view=minecraft-bedrock-stable)
warns that handlers can change and may fail silently; verify actual behavior on
each claimed Bedrock release.

**B04/B05 acceptance.** Keep **Download with Enderloom** as the second intended
choice, backed by full PackDL/McTools integration for entitled/user-authorized
content and permitted formats. The user reports permission from all involved
parties; retain that as planning context without requiring proof for this
roadmap. Public documentation does not assert a partnership or expand grants to
redistribution of other parties' assets.

Inventory the actual library/CLI boundaries, authenticated services, local
entitlements, formats, dependency notices and build profiles before selecting
adapters. PackDL includes PlayFab, entitlement, download and archive-processing
surfaces; McTools includes local archive processing. Source availability alone is
not a stable provider API or an entitlement check. Determine which supported
provider/account flow proves the exact product authorization. The discovery view
must not mark a product owned because a content identifier or download URL exists.

Use a scoped process/library adapter behind shared jobs, with bounded resources,
progress, cancellation, isolated staging, safe archive paths and destination
review. Keep credentials in the existing secure account path and redact errors,
receipts and logs. Do not adopt public key-sharing services or access-control,
payment or entitlement bypass routes. After normal authorized import, compare
every retained member and dependency against the source census. Prove duplicate
install, stale entitlement, account switching, missing tools, malformed/nested
archives, interrupted downloads, path collisions, disk exhaustion, restart and
rollback. Cancellation and failure must preserve original input bytes.

No public source grant was found in the supplied PackDL archive. McTools contains
a BSD-3-Clause-style license and bundled dependency notices. These are concrete
distribution-review tasks, not a reason to remove the requested adapters. Resolve
the intended distribution terms and provider contract before publishing bundled
tools; integration work and local authorized fixture planning stay in scope.

## Updates and organized inputs

**B01/B06 acceptance.** Track the exact [PackDL releases](https://git.silica.codes/BedrockReverse/PackDL/releases)
and [McTools releases](https://git.silica.codes/BedrockReverse/McTools/releases)
independently. On October 4 the same host's release API returned `v1.6` and `v12`.
Implement configurable update checks and a manual refresh; a discovered version is
an update candidate. Show release notes, source commit, artifact hash, dependency /
license / permissions changes and affected fixture results for explicit review.
Pin the accepted toolset per job; never silently replace a running job's tools.

Record component, version/tag, full upstream commit, source/release URL, retrieved
time, original filename/size, SHA-256, license/notices and authorization scope in
an allowlisted manifest. A locally measured hash identifies bytes; it does not
authenticate their publisher. Verify upstream signatures and signed checksum
manifests when available, including signer identity and trusted-key provenance.
The observed release asset lists contain no detached signature/checksum file;
record authenticity as unverified rather than inventing verification. Unsigned
candidates require explicit review. Avoid credentials, content keys and private
permission documents in this index.

Stage reviewed updates beside the current immutable version; test on owned
fixtures, atomically switch a version pointer, keep the last known good toolset,
and test rollback including metadata/dependency state. Cover changed/replaced
tags, older releases, prereleases, offline reads, broken pagination, unavailable
upstream, mismatched checksum, invalid signature, incompatible runtime and a
crash at each switch boundary. Metadata checking must not execute a new binary.

Proposed layout **after AoA reaches a safe implementation checkpoint**:

```text
third_party/
  INDEX.md
  manifests/                     # readable component/version/license/hash index
  upstream/packdl/v1.6/<sha256>/   # immutable original archive + source receipt
  upstream/mctools/v12/<sha256>/   # immutable original archive + notices
  notices/<component>/<version>/
local-fixtures/actions-and-stuff/<input-sha256>/  # excluded from Git and packages
workspaces/<project-id>/<revision>/              # derived editable work
generated/conversions/<job-id>/<target-cell>/    # separate target outputs
evidence/<job-id>/                               # private; public summaries reviewed
```

Configure exclusions before importing fixtures; inspect packaging rules as well
as Git ignores. Keep a source-to-derived hash map and test that neither fixtures
nor content keys enter commits, application packages, CI artifacts or public
screenshots. Do not move, rename or delete the current originals for this task.

## Studio: compare complete projects side by side

**S01 acceptance.** Drop/select two whole projects or revisions, identify exact
edition/version/loader/pack/dependencies and retain them as independently owned,
immutable inputs. Show added/removed/renamed/changed/equal/unknown content, a
searchable tree, counts, filters, breadcrumbs and linked references. Match stable
IDs and hashes with user-reviewed rename candidates; similar filenames alone
must not merge identities. Distinguish byte differences from normalized semantic
differences, preserve order where order changes behavior, and keep unknown fields.

Compare manifests, required/optional/nested dependencies, resources, source,
behavior components, events, recipes/loot/tags, models/bones/UVs, textures/materials,
animations/controllers/Molang, render controllers, particles, audio events and
actual audio. Show dependency impact and dangling references. An unread or
unsupported member remains visible with its exact reason; it never becomes
"equal" or disappears. Prove complete counts on both actual Actions & Stuff
archives plus an independently authorized Java behavior fixture.

**S02 acceptance.** Provide synchronized camera/lighting/pose and animation time,
independent navigation when unlocked, split/wipe/overlay views, model/bone/UV
highlighting, texture pixel/alpha/material differences, controller-state traces,
timeline/keyframe differences, and synchronized audio audition with waveform /
duration / event mapping. Make viewport settings and asset selection persistent.
Keep text/semantic alternatives to color-only visual differences and expose
keyboard shortcuts, focus and screen-reader summaries.

Link each difference to source, target, dependency and transform rule. Offer a
reviewable patch/merge preview with undo and reversible export, resolving both
inputs' concurrent edits before applying it. Test theme/zoom, large complete
libraries, missing/corrupt assets, non-ASCII names, cancellation, clean restart,
read-only sources and private/public report export. Measure cold/warm indexing,
time to first usable diff, interaction latency and memory against the same full
baseline/candidate workload; keep quality and counts intact.

## Bidirectional conversion and Actions & Stuff acceptance

Read the [conversion matrix and full fixture plan](https://github.com/Herbertofury/Enderloom/blob/docs/marketplace-studio-bedrock-roadmap-2026-10-04/docs/BEDROCK_JAVA_CONVERSION_FIDELITY_AND_ACTIONS_STUFF_2026-10-04.md)
and [safe source inventory](https://github.com/Herbertofury/Enderloom/blob/docs/marketplace-studio-bedrock-roadmap-2026-10-04/docs/BEDROCK_THIRD_PARTY_INVENTORY_2026-10-04.md).

**C01-C04 acceptance.** Preserve every source feature as a tracked requirement.
For each edition/version/loader cell, report direct translation, generated runtime
adapter, native reimplementation, or unresolved work with source evidence and a
concrete next action. Carry unresolved content in the project instead of silently
dropping it. An unresolved feature keeps full parity open; it does not set a
permanent limit on the product. Do not promise universal lossless conversion.

Use Actions & Stuff as the full-fidelity target, including all subpacks, skins,
first/third-person presentation, models, animations, particles, textures,
materials, sound and interactions actually found after import. Derive acceptance
from the complete source census, not a small handpicked model. Compare original
Bedrock and generated Java in controlled native runtimes, then Java -> Bedrock
and both round-trip directions. Existing successful conversion examples can
strengthen this matrix as differential references.

Bedrock behavior/animation queries and Java loader code execute in different
runtimes. Where there is no equivalent target primitive, implement an equivalent
target-native runtime component and prove its observable behavior; renaming files
or copying a JAR into a pack is insufficient. The matrix names the needed work
without treating untested paths as impossible. Actions & Stuff's supplied
manifests declare resources and skins, not a behavior/script module; use a second
authorized behavior fixture to test that part of the universal pipeline.

**Q01 completion gate.** Prove the ordinary packaged GUI/CLI journeys, correct
dependency provisioning, full content counts, native screenshots and animation /
audio traces, behavior tests, cold/warm performance, reversible exports and
crash/restart/rollback. Bind proof to source hashes, converter/tool revisions,
target game/loader versions, output hashes and commands. A beautiful preview,
build success or round-trip byte similarity does not establish native feature
parity. No slice in this roadmap is implemented or runtime-certified by this PR.

## Next safe execution sequence

Continue AoA in its current working tree. This roadmap and source review can be
reviewed now. At its safe checkpoint, reconcile the latest source/earned proof,
start B01-B04, then implement the version-pinned adapters/update transaction and
Studio census/diff. Establish the full Actions & Stuff baseline before target
generation; repair each discrepancy in the shared pipeline and replay from the
original input. Finish with bidirectional native-runtime and packaged acceptance.
No separate mass issue list or duplicate implementation ledger is required.


## Universal Minecraft A/B Studio — October 5 extension

The [complete A/B Studio contract](https://github.com/Herbertofury/Enderloom/blob/main/docs/ENDERLOOM_UNIVERSAL_MINECRAFT_AB_STUDIO.md) and [A/B Studio feature guide](https://github.com/Herbertofury/Enderloom/wiki/Universal-Minecraft-AB-Studio) extend this roadmap with two playable native clients, inventory drag-and-drop with complete dependencies, honest immediate preview versus certified destination, durable batch transfers and restart recovery, selective semantic/asset comparison, and exhaustive Actions & Stuff 1.11.1 gameplay parity. All new work is planned. Manual refresh and explicit tested update adoption apply; no background watchdog or scheduled polling is requested. Preserve every earlier source and fidelity requirement.
