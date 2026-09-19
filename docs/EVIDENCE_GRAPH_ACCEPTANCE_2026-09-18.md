# Evidence graph acceptance

PA-010 now has a typed `EvidenceArtifact` in the existing canonical library: kind, versioned producer, immutable target/snapshot, run identity, observed/recorded times, retained source, normalized-record reference and hash, provenance, confidence class, scope, and comparison/contradiction/support/supersession links. Domain records remain the normalized truth; the graph does not duplicate them into another database.

Studio inventories, imported Spark/log reports and Testing Lab native analysis use this owner. Spark bytes are retained exactly; logs retain redacted analysis input. Verification hashes both retained source and normalized record, records an integrity receipt, and reports missing/changed inputs without rewriting historical evidence. Older reports migrate without inventing source bytes, producer versions or execution IDs. Reanalysis of the same test input preserves its identity and timestamp.

`EvidenceDetails` exposes source provenance, verification and explained relationships in Studio, Spark reports and Testing Lab. GUI/service/CLI use the same four evidence operations. This is evidence infrastructure, not proof of AoA conversion, per-mod causal frame loss, or semantic parity. Dependency freshness is the next PA-011 item.

Verification:

- Native service/CLI and frontend builds pass; command parity passes.
- `evidence-graph-qa.js`: exact profile retention, source hash rejection, redacted logs, tampering of raw and normalized records, legacy migration, immutable relationships, conversion task/snapshot identity, native Testing Lab context, idempotent reanalysis, CLI and restart persistence.
- `evidence-ui-qa.js`: real Electron import, verification, saved comparison and tampering warning; zero renderer errors. `studio-ui-qa.js` verifies package source integrity through the UI.
- All **76** release suites pass: `output/release-qa-evidence.json`.
- Installed Enderloom reanalyzed actual Aether run `cfbe854f-5b91-4e1b-97d1-dc332c28614d`: Minecraft 1.21.1 / NeoForge 21.1.250 / rendered client. Both retained log and Spark profile analyzed with no errors; Spark source and normalized hashes verified through the UI.
- Actual 107.366667-second Aether recording loaded, played and sought to 75 seconds; decoded timeline hover frame displayed at 59 seconds. Screenshot: `output/playwright/aether-installed-playback.png`.

AoA acquisition remains separately blocked: the known Dev Kit link redirected to Google's sign-in page in Enderloom. That page is open for the user; no Chrome credential extraction occurred. The AoA/Dev Kit ZIP files have not been acquired.
