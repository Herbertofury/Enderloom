# ENDERLOOM NORTHPOINT — Canonical Handoff Pointer

> **Northpoint is how Enderloom thinks; it is not a dedicated module, service, tab, daemon, database, store, orchestrator, event bus, or `.enderloom/northpoint/` silo.**

The complete human-readable implementation handoff is intentionally kept as one canonical Markdown artifact on Google Drive because the connected GitHub transport used for this checkpoint could not upload the 81,782-byte Markdown file as one mounted-file write without lossy/chunked handling.

## Canonical readable handoff

- Drive: https://drive.google.com/file/d/1ceIp60vSyspF7zGHC9UXW9hyluDahoWk/view
- File: `ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md`
- Size: `81,782` bytes
- SHA-256: `85b7b7a575b5e8aac4f5460873d11b193ff01a2230c8dc99158ea2070219f710`
- Lines: `1,718`

The repo also carries a **lossless exact mirror** of that Markdown as gzip+base64 payload parts under `docs/northpoint-v4-payload/`.

Reconstruct it with:

```bash
cat docs/northpoint-v4-payload/part-*.b64 \
  | base64 -d \
  | gzip -dc \
  > /tmp/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md

sha256sum /tmp/ENDERLOOM_NORTHPOINT_UNIVERSAL_VERSION_MATRIX_HANDOFF.md
```

The SHA-256 must be exactly:

```text
85b7b7a575b5e8aac4f5460873d11b193ff01a2230c8dc99158ea2070219f710
```

## Implementation contract snapshot

The complete handoff is the authority. This pointer exists only to stop stale/contradictory repo instructions from being treated as current. In particular:

- Northpoint is baked into canonical Enderloom Create / Convert / Repair / Optimize / matrix / release / AI handoff flows.
- Do **not** create `NorthpointService`, `NorthpointStore`, `NorthpointDatabase`, a second job system, a parallel state machine, or a separate Northpoint workspace.
- Existing `docs/ENDERLOOM_OPENAI_AI_OPERATOR_SPEC.md` and Codex handoff contracts are the AI integration spine; extend them in place.
- OpenAI round-trip support must cover supported Codex account auth, explicit API-key/native API boundaries, resumable handoff, same-thread continuation, deterministic handoff manifests, returned-file quarantine, provenance/hash/diff checks, local Northpoint acceptance gates, retry back into the same AI thread, and MCP/plugin OAuth for protected remote tools.
- Provider-reported “done” never equals locally accepted. Returned source/JARs remain untrusted until Enderloom verifies them.
- The implementation board contains 32 parent tasks, including 9 OpenAI handoff/take-back tasks, plus 71 QA checks and 29 final Definition-of-Done checks.

Do not replace the detailed handoff with another roadmap. Start at `NP-00`, write evidence into the existing checklist, and implement through the canonical Enderloom graph/services.
