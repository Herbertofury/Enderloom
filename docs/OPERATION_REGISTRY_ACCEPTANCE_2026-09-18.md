# PA-030 operation identity, domain and classification

Implementation: `d9250870cb3735117a2c2a5c5fb673baf2a6d81a`.

All 265 registered operations now declare one canonical domain in `native/src/capabilities.json`. Rust deserializes domain and read/write/destructive classification into closed enums. Registry loading rejects duplicate/invalid identities and any plan route whose declared classification permits mutation.

The shared service can filter `get_capabilities` by domain/classification. The CLI exposes identical filters through `capabilities --domain ... --classification ...`, and `operation describe ID` returns one canonical descriptor. Discovery requires no data-root access, authentication or running service. Existing IDs, invocation routes and authorization behavior are preserved.

`operation-registry-qa.js` passed: all 28 domains, all three classifications, combined filters, exact source/CLI/service parity, offline describe, invalid values and no discovery data access. `cli-parity-qa.js`, the existing 30-check CLI suite, 115-check domain suite, and native snapshot transaction regressions passed. The installed Electron app loaded the new snapshot descriptors from the current native worker.

Next: PA-031 input/output contracts and permission/approval declarations. Full schema coverage and MCP/AI exposure are not claimed by PA-030.
