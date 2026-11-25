# Provider acquisition reliability

## Request identity and refresh ownership

The public Node HTTP transport now coalesces requests only when their effective headers, timeout, redirect policy and requested representation match. Head requests include their byte budget; progressive requests include each stage budget and media predicate. Equivalent header casing and ordering still share work. Keys hash the full identity rather than expose authorization values or URL parameters.

Dynamic `headersForUrl` callbacks retain their independent request path. A full or matching head reader can still reuse a progressive request when its transport contract matches. A completed earlier request cannot overwrite a newer forced refresh or refill a cache that was cleared during its request. DNS callbacks retain their original waiters when a clear occurs; they cannot consume the replacement lookup's waiters.

Explicit `redirects: 0` now means the same thing for progressive transport as for ordinary and head requests. A progressive flow counts as one active physical flight, even when full and head readers share its promises.

These changes preserve the existing transport and parser API. They do not introduce a new crawler dependency, remove provider routes, change the stage budgets, or cap complete responses and galleries.

## Parser lifecycle

Closing the worker pool rejects both active and queued work and is idempotent. An unexpected native worker exit rejects its active job, replaces the failed worker and continues queued work. A structured-clone failure rejects its own job without occupying a worker forever. Invalid worker counts fail immediately. Replies are bound to the active job ID so an unrelated message cannot settle another job.

## Verified resource improvement

Each progressive snapshot now asks `Buffer.concat` to copy only its existing requested prefix, instead of first copying all bytes accumulated so far and then taking a view. The complete response still copies and returns the entire body.

On the real loopback HTTP fixture in `scripts/benchmark-progressive-copy.js`, the complete response was **2,097,152 bytes**. Total transport `Buffer.concat` allocation/copy bytes fell from **2,367,310** to **2,260,992**, saving **106,318 bytes** for that transfer. Head, media, prefix and full text hashes and completeness fields were identical. This is a measured allocation/copy reduction for that fixture, not an end-to-end speed or application memory claim. Raw measurements are in [the copy benchmark](benchmarks/provider-progressive-copy-20261125.json).

A queue-cursor experiment was rejected. Two interleaved six-run comparisons of all 24,000 real parser jobs produced identical full output digests but inconsistent timing trends on the shared host. The second comparison was coordinated with other agents to avoid their heavy work, but external host load was not controlled. The final implementation retains the original queue consumption strategy; no speedup is claimed from that experiment. Both raw batches remain in [the rejected experiment record](benchmarks/provider-queue-experiment-20261125.json).

## Regression evidence

Baseline: `e23eaea97d46348144d1706736c157282abfd44a`.

The new lifecycle suite executes real loopback HTTP sockets and real Node worker threads. The DNS-clear test controls DNS callback timing while retaining the real HTTP request. The unchanged baseline fails eight of the initial nine HTTP cases, including one stranded DNS timeout; its worker close, clone-failure and unexpected-exit cases also remain unresolved until the test timeout. The corrected implementation passes all **14** lifecycle cases, including a challenge regression that preserves fractional stage-budget rounding.

```sh
npm run provider-lifecycle-qa
node scripts/media-performance-qa.js
node scripts/media-transport-qa.js
node scripts/provider-media-qa.js
node scripts/curseforge-author-fanout-qa.js
node scripts/media-identity-gate-qa.js
node scripts/parser-pool-qa.js
node scripts/catalog-provider-domain-qa.js
node scripts/benchmark-progressive-copy.js
```

These existing suites passed on Linux with Node 24.22.3. They preserve 32 concurrent readers sharing one request, 12 distinct creator-page project icons sharing one page, complete provider/media extraction, identity-bound progressive stages and all 204 provider-domain checks. The existing provider-domain CI matrix now runs the new lifecycle suite on Windows, Linux and macOS with Node 22 and 24; a workflow definition is not evidence that a hosted run has passed.

The source change is reviewable independently of open source-watch, Browse, Catalog-media and governance migration PRs. It does not establish live authenticated-provider, packaged Windows Electron, launcher or Minecraft acceptance. No installed user profile or session was changed. Source rollback is the inverse of this branch's transport and worker changes; no persistent data migration is involved.

## Reference contracts

- [Node worker thread events and termination](https://nodejs.org/api/worker_threads.html)
- [Node HTTP request options and headers](https://nodejs.org/api/http.html)
- [Node Buffer.concat length semantics](https://nodejs.org/api/buffer.html#static-method-bufferconcatlist-totallength)
- [Existing shared provider alignment](SHARED_PROVIDER_ALIGNMENT.md)

The implementation extends the existing pooled transport and provider parser pool. It carries forward the project's complete-result and non-interruptive execution contracts; it does not treat a successful fixture as a release certificate.

## Required optimizer assessment

The official verified binaries shrink-anything 0.1.1, fast-anything 0.8.8 and rust-anything 4.1.0 were assessed on an isolated source worktree. All six doctor, scan, analyze and profile commands completed successfully. The shrink scan covered `src/` and cannot prove external or renderer-facing exports unused, so no deletions were promoted. The HTTP lifecycle profile found no eligible CPU hotspot large enough to justify a bridge; rust-anything attributed about 1.84% of its profiled run to repository code, primarily asynchronous transport. Its source-readiness labels do not establish runtime parity or a performance benefit. No language port was promoted. The accepted buffer-copy change is supported by the separate complete-output benchmark above.
