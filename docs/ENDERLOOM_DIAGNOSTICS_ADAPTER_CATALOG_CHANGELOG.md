# Diagnostics Adapter Catalog Changelog

## 2026-09-07

Initial living catalog established.

Added explicit adapter coverage for:
- spark
- Observable classic
- maintained Observable descendants
- Crash Assistant
- JFR / jcmd
- async-profiler
- Enderloom Probe / Black Box
- TaskManager-style client profilers
- Chunk Loading Profiler
- MixinTrace
- ModernFix diagnostic/watchdog evidence
- Neruina ticking-failure isolation
- external JVM/heap viewers
- legacy/server report importers

This file is only a compact continuity marker. The canonical requirements live in `ENDERLOOM_DIAGNOSTICS_ADAPTERS_PROGRESS_UX_SPEC.md` and `ENDERLOOM_DIAGNOSTICS_ADAPTER_CATALOG.md`.
