# Config source discovery acceptance

Config remains a local-first view. Native scans use cached ownership only. The separate background queue checks three installed mods concurrently, follows only their provider's `View source` GitHub link, and verifies a matching production manifest and installed manifest family before attributing registrations. Manual corrections always win. Unverified source versions cannot displace a different installed-mod name match.

Evidence records contain exact relative config path, config/server scope, immutable source commit, source line/link, repository, reference, and version confidence. Exact release tags are attempted before HEAD; HEAD evidence remains a suggestion. Supported reads include explicit Forge/NeoForge registrations, documented default registration filenames, Fabric/Forge config-directory literal resolutions, and literal Gradle identity/version properties. Comments, quoted examples, tests, sibling modules, unsafe paths and dynamic filename expressions are excluded. This is not a universal static analyzer: unsupported config libraries, computed paths, non-GitHub sources, multi-mod modules and registrations outside config/entry classes remain unresolved rather than guessed.

HTTP/source results use the existing database cache, conditional requests, negative caching and request deduplication. GitHub rate-limit headers pause scheduling and schedule a retry while the view is open. Leaving the view cancels queued work and fences UI updates; the at-most-three active native lookups finish or time out and may populate cache. Recursive-tree truncation triggers explicit subtree traversal. Existing evidence survives transient refresh failure.

Verified on 2026-09-18:

- Native fixtures: exact paths/scopes, production identity, sibling/comment/example rejection, simultaneous request deduplication, restart cache, manual corrections, confidence and provider-binding invalidation.
- Queue: all 137 mods processed with three active requests; abort fences callbacks; throttling stops scheduling; isolated failures do not truncate the inventory.
- Real Electron: background source enrichment, source evidence link, grouped and flat views, manual/automatic switching and navigation pass without renderer errors. `output/playwright/config-source-evidence.png`.
- Live provider/GitHub: downloaded and SHA-1 verified `aether-1.21.1-1.5.10-neoforge.jar`, project `YhmgMVyu`, Minecraft 1.21.1 / NeoForge. Four registrations found in 2,250 ms; cached lookup 37 ms. Source commit `e07d30e16fbd0f09cc067b39594035e395dcf996` was HEAD, correctly marked version-unverified. This was source inspection, not a Minecraft playthrough. `output/config-sources-live-qa.json`.
- Actual Dream profile: 3,150 configs available after 3.76 s including navigation, health validation completes, zero renderer exceptions. GitHub's external allowance was reached and shown without blocking configs.
- 3,512-row Electron regression: 234 ms warm return; search, deep-file editing, grouping/flat view and keyboard navigation pass.
- Independent-profile regression: 3,000-file scan does not block another profile's 27 ms scan or preset writes; same-profile mutation stays serialized.
- 58 release suites passed; frontend and native service/CLI builds passed. Existing Rust unit-test host-loader limitation remains; native acceptance uses the actual service executable.

Sources: [GitHub trees](https://docs.github.com/en/rest/git/trees), [NeoForge config registration and default filenames](https://docs.neoforged.net/docs/1.21.1/misc/config/), [Gradle manifest properties](https://docs.neoforged.net/docs/1.21.10/gettingstarted/modfiles/).

Advances PA-003/PA-004; neither broad requirement is marked complete. Next: world/dependency relationships, then the remaining integration-spine requirements and Northpoint execution work.
