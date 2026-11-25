'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const http = require('node:http');
const { once } = require('node:events');
const { createHash } = require('node:crypto');
const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const transport = require(path.join(root, 'src/public-http.js'));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

(async () => {
  const body = Buffer.alloc(2 * 1024 * 1024, 'x');
  const server = http.createServer((_req, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.write(body.subarray(0, 100 * 1024));
    setTimeout(() => res.end(body.subarray(100 * 1024)), 20);
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const originalConcat = Buffer.concat;
  const copies = [];
  Buffer.concat = function(chunks, totalLength) {
    const buffer = originalConcat.call(Buffer, chunks, totalLength);
    // Count real allocations in the production transport only. Stack inspection
    // is measurement instrumentation, and is never included in timing claims.
    if (new Error().stack.replace(/\\/g, '/').includes('src/public-http.js')) copies.push({ inputBytes: chunks.reduce((n, b) => n + b.length, 0), allocatedBytes: buffer.length });
    return buffer;
  };
  try {
    const flow = transport.requestProgressiveTextShared(`http://127.0.0.1:${server.address().port}/complete`, {
      cacheTtlMs: 0, headMaxBytes: 64 * 1024, mediaMaxBytes: 32 * 1024,
      mediaMinBytes: 128, prefixMaxBytes: 64 * 1024
    });
    const names = ['head', 'media', 'prefix', 'full'];
    const rows = await Promise.all(names.map(name => flow[name]));
    assert.equal(rows[3].text, body.toString());
    assert.equal(rows[3].complete, true);
    assert.equal(copies.length, 4, 'Expected three staged snapshots and one complete-body copy');
    const outputs = Object.fromEntries(rows.map((row, i) => [names[i], {
      sha256: sha256(row.text), textBytes: Buffer.byteLength(row.text), bytesRead: row.bytesRead,
      complete: row.complete, truncated: row.truncated, mediaMarker: row.mediaMarker
    }]));
    console.log(JSON.stringify({ bodyBytes: body.length, fullBodySha256: sha256(body), outputs, copies,
      allocatedCopyBytes: copies.reduce((n, item) => n + item.allocatedBytes, 0) }));
  } finally {
    Buffer.concat = originalConcat;
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
