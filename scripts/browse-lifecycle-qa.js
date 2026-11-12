'use strict';
// Execute the actual Browse effect bodies with deferred provider responses and a
// controlled timer. No browser, credentials, network or duplicate implementation.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../launcher/src/views/DiscoverView.tsx'), 'utf8');
function extract(marker, dependencies) {
  const start = source.indexOf('  useEffect(() => {\n' + marker);
  assert.notEqual(start, -1, 'effect anchor exists');
  const end = source.indexOf('  }, [' + dependencies + ']);', start);
  assert.notEqual(end, -1, 'effect dependencies include availability');
  return source.slice(start + '  useEffect(() => {'.length, end);
}
const searchBody = extract('    if (provider === "curseforge" && !hasCfKey)', 'provider, kind, query, sort, filters, offset, hasCfKey, signature');
const taxonomyBody = extract('    let live = true;\n    setTaxonomy(null);', 'provider, kind, hasCfKey');
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
function fixture(body = searchBody) {
  const calls = [], writes = [], requests = [], timers = new Map();
  let timerId = 0;
  const context = {
    provider: 'modrinth', kind: 'mods', hasCfKey: true,
    query: '', sort: 'relevance', filters: {}, offset: 0, signature: 'current',
    PAGE_SIZE: 40, browse: { signature: '', page: null }, browsePageCache: new Map(),
    requestRef: { current: 0 }, debounceRef: {}, lastIssuedQueryRef: { current: '' },
    clearTimeout: id => timers.delete(id),
    setTimeout: fn => { timers.set(++timerId, fn); return timerId; },
    api: {
      searchContent: (...args) => { calls.push(args); const d = deferred(); requests.push(d); return d.promise; },
      getFilterTaxonomy: (...args) => { calls.push(args); const d = deferred(); requests.push(d); return d.promise; },
    },
  };
  for (const name of ['setPage', 'setSearching', 'setError', 'setBrowse', 'setTaxonomy', 'rememberBrowsePage']) {
    context[name] = (...args) => writes.push([name, ...args]);
  }
  vm.createContext(context);
  return {
    context, calls, writes, requests, timers,
    run: () => vm.runInContext('(() => {' + body + '\n})()', context),
    fire: () => { const [id, fn] = timers.entries().next().value; timers.delete(id); return fn(); },
  };
}
(async () => {
  for (const outcome of ['resolve', 'reject']) {
    for (const transition of ['unmount', 'access removed', 'new query']) {
      const f = fixture();
      const cleanup = f.run();
      const done = f.fire();
      cleanup();
      if (transition === 'access removed') {
        f.context.provider = 'curseforge'; f.context.hasCfKey = false; f.run();
      } else if (transition === 'new query') {
        f.context.query = 'new'; f.context.signature = 'new'; f.run();
      }
      const before = f.writes.length;
      f.requests[0][outcome](outcome === 'resolve' ? { offset: 0, limit: 40, total: 80, hits: [] } : Error('old failure'));
      await done;
      assert.equal(f.writes.length, before, transition + ': stale ' + outcome + ' cannot mutate store, cache, errors or loading');
      assert.equal(f.calls.length, 1, transition + ': stale result cannot prefetch');
    }
  }
  const canceled = fixture(); const stop = canceled.run(); stop();
  assert.equal(canceled.timers.size, 0, 'unmount cancels queued debounce');
  const current = fixture(); current.run(); const done = current.fire();
  current.requests[0].resolve({ offset: 0, limit: 40, total: 80, hits: ['current'] }); await done;
  assert.equal(current.calls.length, 2, 'live search still prefetches next page');
  assert.ok(current.writes.some(([name, value]) => name === 'setBrowse' && value.page.hits[0] === 'current'));
  assert.ok(current.writes.some(([name, value]) => name === 'setSearching' && value === false));
  const failure = fixture(); failure.run(); const failed = failure.fire();
  failure.requests[0].reject(Error('live failure')); await failed;
  assert.ok(failure.writes.some(([name, value]) => name === 'setError' && value.includes('live failure')));
  const tax = fixture(taxonomyBody); tax.context.provider = 'curseforge'; tax.context.hasCfKey = false;
  const unavailableCleanup = tax.run(); assert.equal(tax.calls.length, 0);
  unavailableCleanup(); tax.context.hasCfKey = true; const taxCleanup = tax.run();
  assert.equal(tax.calls.length, 1, 'availability transition loads taxonomy without changing provider/kind');
  taxCleanup(); const before = tax.writes.length; tax.requests[0].resolve({ categories: ['old'] });
  await Promise.resolve(); await Promise.resolve();
  assert.equal(tax.writes.length, before, 'stale taxonomy cannot update');
  console.log('Browse lifecycle: 6 stale success/failure transitions, debounce cancellation, live result/prefetch/error, availability and stale taxonomy PASS');
})().catch(error => { console.error(error); process.exitCode = 1; });
