# Automatic Creator Ingestion — Runtime Architecture

Enderloom boots the Creator Vault ingestion runtime directly from the Electron main process. The catalog renderer also registers the same idempotent runtime, so Creator Vault IPC and launch sync remain available regardless of which catalog view opens first.

The runtime uses a persistent Enderloom browser partition for creator-page discovery when plain public HTTP is insufficient. YouTube incremental discovery covers regular uploads and Shorts; explicit full-history scans also sweep Streams. TikTok uses creator-page scrolling plus hydration/oEmbed fallbacks. Other creator pages can use the generic browser-backed adapter.

Creator-authored recommendation sections, timestamps, and direct project links are parsed into a persistent runtime overlay. Existing canonical projects are reused before new identities are created, and provider resolution is bounded to direct creator links plus high-confidence project discovery. Ambiguous source/provider results stay visible in the review queue instead of being silently guessed.

Runtime writes are atomic and occur throughout ingestion so completed work survives interruption. Bundled Creator Vault history remains immutable. The merged runtime catalog is refreshed into active rendered catalogs after sync.

Automatic launch behavior is a one-shot incremental check with a cooldown, not a recurring watchdog. Full-history crawling remains an explicit Creator Vault action.
