# Automatic Creator Ingestion — Acceptance Scope

The Creator Vault automatic-ingestion feature is considered ready only when the feature branch passes all of the following on the final hardened tree:

- creator-authored recommendation parsing and timestamp fidelity
- YouTube regular-video + Shorts discovery; full-history scans also include Streams
- TikTok creator/video discovery and caption parsing fallback
- runtime overlay merge without mutating bundled Creator Vault history
- canonical reuse + bounded project-provider resolution
- ambiguity review queue instead of invented identities
- one-shot launch incremental sync (not a recurring watchdog)
- manual incremental sync, full-history sync, add-creator, review, and settings UI
- Electron preload/IPC integration
- rendered-catalog live refresh/reopen behavior
- recursive existing Creator Vault QA
- catalog regression QA
- portable catalog rendering

The ready-to-merge PR workflow is gated on these checks rather than on manual creator-by-creator catalog maintenance.
