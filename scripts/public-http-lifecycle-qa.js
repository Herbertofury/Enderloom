'use strict';
const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
const { test } = require('node:test');
const transport = require('../src/public-http');

async function fixture(t, handler) {
  transport.clearSharedCache();
  const server = http.createServer(handler);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => {
    transport.clearSharedCache();
    server.closeAllConnections();
    return new Promise(resolve => server.close(resolve));
  });
  return `http://127.0.0.1:${server.address().port}`;
}

test('equivalent header spellings coalesce without losing any complete response', async t => {
  let hits = 0;
  const payload = '<html>' + 'owned complete content '.repeat(5000) + '</html>';
  const url = await fixture(t, (_req, res) => { hits++; setTimeout(() => res.end(payload), 15); });
  const rows = await Promise.all(Array.from({ length: 32 }, (_, i) => transport.requestTextShared(url, {
    headers: i % 2 ? { 'x-project': 'fixture', Accept: 'text/html' } : { accept: 'text/html', 'X-Project': 'fixture' }
  })));
  assert.equal(hits, 1);
  for (const row of rows) assert.equal(row.text, payload);
  assert.equal((await transport.requestTextShared(url, { headers: { Accept: 'text/html', 'X-Project': 'fixture' } })).text, payload);
  assert.equal(hits, 1);
});

test('authorization and representation headers isolate both concurrent and cached observations', async t => {
  let hits = 0;
  const url = await fixture(t, (req, res) => {
    hits++;
    setTimeout(() => res.end(`${req.headers.authorization}|${req.headers['accept-language']}`), 10);
  });
  const scopes = [{ Authorization: 'Bearer fixture-a', 'Accept-Language': 'en' }, { Authorization: 'Bearer fixture-b', 'Accept-Language': 'es' }];
  const rows = await Promise.all(scopes.map(headers => transport.requestTextShared(url, { headers })));
  assert.deepEqual(rows.map(r => r.text), ['Bearer fixture-a|en', 'Bearer fixture-b|es']);
  for (let i = 0; i < scopes.length; i++) assert.equal((await transport.requestTextShared(url, { headers: scopes[i] })).text, rows[i].text);
  assert.equal(hits, 2);
});

test('different transport deadlines do not borrow an incompatible pending request', async t => {
  let hits = 0;
  const url = await fixture(t, (_req, res) => { hits++; setTimeout(() => res.end('complete'), 700); });
  const results = await Promise.allSettled([
    transport.requestTextShared(url, { timeoutMs: 500 }),
    transport.requestTextShared(url, { timeoutMs: 1800 })
  ]);
  assert.equal(results[0].status, 'rejected');
  assert.equal(results[1].status, 'fulfilled');
  assert.equal(results[1].value.text, 'complete');
  assert.equal(hits, 2);
});

test('redirect policies and progressive zero-redirect requests stay distinct', async t => {
  const url = await fixture(t, (req, res) => {
    if (req.url === '/start') { res.writeHead(302, { location: '/final' }); res.end('redirect'); }
    else res.end('destination');
  });
  const [stopped, followed] = await Promise.all([
    transport.requestTextShared(url + '/start', { redirects: 0 }),
    transport.requestTextShared(url + '/start', { redirects: 2 })
  ]);
  assert.equal(stopped.status, 302);
  assert.equal(followed.text, 'destination');
  assert.equal((await transport.requestProgressiveTextShared(url + '/start', { redirects: 0 }).full).status, 302);
});

test('head byte limits and progressive media contracts have independent identities', async t => {
  const url = await fixture(t, (_req, res) => {
    res.write('x'.repeat(70 * 1024));
    setTimeout(() => res.end('y'.repeat(70 * 1024)), 20);
  });
  const [small, large] = await Promise.all([
    transport.requestHeadTextShared(url, { maxBytes: 64 * 1024 }),
    transport.requestHeadTextShared(url, { maxBytes: 128 * 1024 })
  ]);
  assert(large.bytesRead > small.bytesRead);
  const base = { cacheTtlMs: 0, mediaMinBytes: 128, mediaMaxBytes: 64 * 1024 };
  const x = transport.requestProgressiveTextShared(url, { ...base, mediaPattern: /x/ });
  const y = transport.requestProgressiveTextShared(url, { ...base, mediaPattern: /y/ });
  assert.notEqual(x, y);
  assert.equal((await x.media).mediaMarker, true);
  assert.equal((await y.media).mediaMarker, false);
  await Promise.all([x.full, y.full]);
});

test('full and matching head readers reuse one progressive request, but dynamic sessions do not', async t => {
  let hits = 0;
  const url = await fixture(t, (req, res) => {
    hits++;
    res.write('<head><title>' + (req.headers.cookie || 'public') + '</title></head>');
    setTimeout(() => res.end('<body>complete</body>'), 25);
  });
  const flow = transport.requestProgressiveTextShared(url, { timeoutMs: 2000, headMaxBytes: 64 * 1024 });
  assert.equal(transport.sharedStats().inflight, 1);
  const [head, full, session] = await Promise.all([
    transport.requestHeadTextShared(url, { timeoutMs: 2000, maxBytes: 64 * 1024 }),
    transport.requestTextShared(url, { timeoutMs: 2000 }),
    transport.requestTextShared(url, { timeoutMs: 2000, headersForUrl: async () => ({ Cookie: 'private-fixture' }) })
  ]);
  assert(head.text.includes('public'));
  assert(full.text.endsWith('<body>complete</body>'));
  assert(session.text.includes('private-fixture'));
  assert.equal(hits, 2);
  assert.equal(full.text, (await flow.full).text);
  assert.equal(transport.sharedStats().inflight, 0);
});

test('fractional stage budgets retain existing prefix rounding and the complete body', async t => {
  const body = 'x'.repeat(96 * 1024);
  const url = await fixture(t, (_req, res) => res.end(body));
  const flow = transport.requestProgressiveTextShared(url, {
    headMaxBytes: 64 * 1024 + 0.5, mediaMaxBytes: 32 * 1024 + 0.5,
    prefixMaxBytes: 64 * 1024 + 0.75, mediaMinBytes: 128
  });
  const [head, media, prefix, full] = await Promise.all([flow.head, flow.media, flow.prefix, flow.full]);
  assert.equal(head.text.length, 64 * 1024);
  assert.equal(media.text.length, 32 * 1024);
  assert.equal(prefix.text.length, 64 * 1024);
  assert.equal(full.text, body);
});

test('cache clearing does not strand existing DNS waiters or attach them to a newer lookup', async t => {
  const dns = require('node:dns');
  const nativeLookup = dns.lookup;
  const lookups = [];
  const base = await fixture(t, (_req, res) => res.end('complete'));
  dns.lookup = (_host, _options, callback) => lookups.push(callback);
  t.after(() => { dns.lookup = nativeLookup; });
  const url = base.replace('127.0.0.1', 'cache-lifecycle.invalid');
  const old = transport.requestTextShared(url);
  while (lookups.length < 1) await new Promise(resolve => setImmediate(resolve));
  transport.clearSharedCache();
  const fresh = transport.requestTextShared(url);
  while (lookups.length < 2) await new Promise(resolve => setImmediate(resolve));
  lookups[0](null, [{ address: '127.0.0.1', family: 4 }]);
  assert.equal((await old).text, 'complete');
  lookups[1](null, [{ address: '127.0.0.1', family: 4 }]);
  assert.equal((await fresh).text, 'complete');
  assert.equal(transport.sharedStats().dnsEntries, 1);
});

test('a superseded request cannot overwrite a newer forced refresh', async t => {
  const pending = [];
  const url = await fixture(t, (_req, res) => pending.push(res));
  const old = transport.requestTextShared(url);
  while (pending.length < 1) await new Promise(resolve => setImmediate(resolve));
  const fresh = transport.requestTextShared(url, { force: true });
  while (pending.length < 2) await new Promise(resolve => setImmediate(resolve));
  pending[1].end('new');
  assert.equal((await fresh).text, 'new');
  pending[0].end('old');
  assert.equal((await old).text, 'old');
  assert.equal((await transport.requestTextShared(url)).text, 'new');
});

test('clearing cache retires old fills and preserves a newly started progressive flow', async t => {
  const pending = [];
  const url = await fixture(t, (_req, res) => pending.push(res));
  const old = transport.requestProgressiveTextShared(url);
  while (pending.length < 1) await new Promise(resolve => setImmediate(resolve));
  transport.clearSharedCache();
  const fresh = transport.requestProgressiveTextShared(url);
  while (pending.length < 2) await new Promise(resolve => setImmediate(resolve));
  pending[0].end('old');
  await old.full;
  assert.equal(transport.requestProgressiveTextShared(url), fresh);
  pending[1].end('new');
  await fresh.full;
  assert.equal((await transport.requestTextShared(url)).text, 'new');
});
