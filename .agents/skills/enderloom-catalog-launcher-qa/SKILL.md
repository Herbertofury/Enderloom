---
name: enderloom-catalog-launcher-qa
description: Repair and verify Enderloom catalog/media and Rust-launcher integration while preserving research modes, provider ownership, durable state and honest native acceptance boundaries.
---

# Enderloom catalogue and launcher QA

Read AGENTS.md and the relevant docs/knowledge/ acceptance pages before changing code. package.json supplies the current script entrypoints; the large README includes historical releases, not proof every workflow is qualified today.

## Trace the complete affected flow

Identify whether the defect belongs to catalog storage, provider discovery/extraction, Electron presentation/session transport, launcher frontend, or native service. Check active PRs and reuse their checkpoints rather than independently modifying their paths. Catalog, Source, Browser, Full and Split modes remain protected; the launcher is integrated into the same app, not permission to replace the catalog.

Favorites, notes, filters, source health and refresh targets are catalog-scoped. For profile discovery, preserve in-place external-launcher connections and physical-path identity; cloning must remain explicit. Keep unrelated providers and studio capabilities optional through clear interfaces rather than coupling them to a favorite ecosystem.

## Reproduce provider completeness precisely

Record exact project route, provider, source revision, access state and media roles. Check galleries against the source-owned region, including lazy attachment anchors and navigation before images. Do not count advertisements, promo media or creator avatars as project gallery items. An empty gallery route is not necessarily a project-wide terminal negative: preserve the distinction between sourceGalleryAbsent, galleryAbsent, transient failure and access challenge.

Exercise cache invalidation and last-good retention across refresh, failed transport, session loss, cancellation and retry. Verify that an icon+avatar cache cannot suppress missing-gallery discovery. Compare source extraction with actual card rendering; player-ready is separate from user-started playback. Never copy private session data or paywalled fixtures into public evidence.

## Select real regression suites

Inspect package.json and the current workflows to determine prerequisites and the full affected gate. Useful existing entrypoints include:
- npm run catalog-qa, catalog-layout-qa and catalog-export-qa for protected research paths;
- npm run provider-media-qa, site-adapter-registry-qa and catalog-provider-coverage-qa for provider contracts;
- npm run curseforge-gallery-anchor-qa, curseforge-scoped-negative-qa and curseforge-gallery-dom-rescue-qa for gallery ownership/completeness;
- npm run parallel-race-qa, media-performance-qa and media-stress-qa for bounded concurrency and equivalent media workloads;
- npm run launcher-integration-qa and launcher-command-coverage-qa for frontend/native seams;
- npm run electron-self-test and electron-ui-acceptance-qa for actual Electron paths.

Read a script before invoking it: live provider/network/native suites may need authorized sessions or installed prerequisites. Do not replace a failing native check with a fixture and call it the same test. Use build:launcher and build:launcher-service for their separate outputs; verify the app loads those exact artifacts, not an older binary.

## Preserve the user's complete result

For optimization compare retained cards, complete metadata/media and durable writes as well as latency, scrolling/input response and memory. Do not get a faster result by dropping output, deferring unfinished work past the stopwatch or warming a cache without equivalent baseline treatment. Keep raw failed samples and baseline identity.

Record implementation, local checks, exact remote commit/CI, served or packaged asset identity and native acceptance separately. Dev Kit or simulated game evidence cannot close an actual game/client acceptance gate. Keep historical and not-run results explicit and preserve the next actionable blocker rather than declaring whole-product completion.
