'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const threads = require('node:worker_threads');
const NativeWorker = threads.Worker;
const workers = [];
// Record real native workers so an unexpected exit can be exercised without
// changing the production pool's API or substituting a simulated worker.
threads.Worker = class extends NativeWorker {
  constructor(...args) { super(...args); workers.push(this); }
};
const { createProviderParserPool } = require('../src/provider-parser-pool');
threads.Worker = NativeWorker;
const input = { html: '<html><head><title>Fixture</title></head><body>Complete</body></html>', url: 'https://example.com/project', context: {} };

test('close settles active and queued work and remains idempotent', { timeout: 3000 }, async () => {
  const pool = createProviderParserPool({ workers: 1 });
  const pending = [pool.parse(input), pool.parse(input), pool.parse(input)];
  const outcomes = Promise.allSettled(pending);
  await pool.close();
  for (const result of await outcomes) assert.equal(result.status, 'rejected');
  assert.equal(pool.stats().busy, 0);
  await pool.close();
  await assert.rejects(pool.parse(input), /closed/i);
});

test('uncloneable input rejects its own job and the worker still processes later jobs', { timeout: 3000 }, async () => {
  const pool = createProviderParserPool({ workers: 1 });
  try {
    await assert.rejects(pool.parse({ ...input, context: { invalid: () => {} } }));
    assert.equal(typeof await pool.parse(input), 'object');
  } finally { await pool.close(); }
});

test('unexpected native worker exit rejects its active job and replaces the worker for queued work', { timeout: 3000 }, async () => {
  const pool = createProviderParserPool({ workers: 1 });
  try {
    const worker = workers.at(-1);
    const active = pool.parse(input);
    const checkActive = assert.rejects(active, /exit|stop|terminat/i);
    const queued = pool.parse(input);
    await worker.terminate();
    await checkActive;
    assert.equal(typeof await queued, 'object');
    assert.equal(pool.stats().workers, 1);
    assert.equal(pool.stats().busy, 0);
  } finally { await pool.close(); }
});

test('invalid worker counts fail immediately instead of creating a permanently stuck queue', () => {
  for (const workers of [0, -1, NaN, Infinity, 1.5]) assert.throws(() => createProviderParserPool({ workers }), /worker/i);
});
