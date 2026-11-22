'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');
const { test } = require('node:test');
const { LauncherService } = require('../src/launcher-service');

async function waitFor(file) {
  for (let i = 0; i < 150; i++) {
    if (fs.existsSync(file)) return;
    await delay(20);
  }
  throw new Error('Fixture marker was not reached: ' + path.basename(file));
}

async function withFixture(t, run) {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'enderloom-reset-owner-'));
  const fixture = path.join(root, 'backend');
  const dataDir = path.join(root, 'portable', 'launcher');
  const at = (name) => path.join(dataDir, name);
  await fsp.writeFile(fixture, `#!${process.execPath}
const fs = require('node:fs');
const path = require('node:path');
const args = process.argv.slice(2);
const data = args[args.indexOf('--data-dir') + 1];
const at = file => path.join(data, file);
if (args.includes('--apply-reset')) {
  if (fs.existsSync(at('ignore-term'))) process.on('SIGTERM', () => fs.writeFileSync(at('term-seen'), 'held'));
  fs.writeFileSync(at('reset-active'), 'owned offline reset');
  const wait = setInterval(() => {
    if (!fs.existsSync(at('release-reset'))) return;
    clearInterval(wait);
    fs.unlinkSync(at('reset-active'));
    if (fs.readFileSync(at('release-reset'), 'utf8') === 'fail') {
      console.error('synthetic reset failure');
      process.exitCode = 1;
      return;
    }
    const recovery = at('reset-recovery/fixture');
    fs.mkdirSync(recovery, { recursive: true });
    fs.renameSync(at('portable-sentinel'), path.join(recovery, 'portable-sentinel'));
    process.stdout.write(JSON.stringify({ recovery_dir: recovery, moved: ['portable-sentinel'] }));
  }, 10);
} else {
  fs.appendFileSync(at('service-spawns'), 'service\\n');
  if (fs.existsSync(at('reset-active'))) fs.writeFileSync(at('overlap'), 'two backend processes');
  const emit = value => process.stdout.write(JSON.stringify({ protocol: 1, ...value })+'\\n');
  emit({event: 'service:ready', payload: {version: 'fixture', pid: process.pid}});
  require('node:readline').createInterface({input: process.stdin}).on('line', line => {
    const msg = JSON.parse(line);
    emit({id: msg.id, ok: true, result: fs.existsSync(at('reset-active')) ? 'overlap' : 'ordinary request'});
  });
}
`, { mode: 0o700 });
  const service = new LauncherService({ rootDir: root, dataDir });
  service.executable = () => fixture;
  t.after(async () => {
    await fsp.mkdir(dataDir, { recursive: true });
    await fsp.writeFile(at('release-reset'), 'ok');
    await service.close().catch(() => {});
    // Wait for cleanup even on a failing baseline where close does not own the reset.
    for (let i = 0; i < 150 && fs.existsSync(at('reset-active')); i++) await delay(20);
    await fsp.rm(root, { recursive: true, force: true });
  });
  assert.equal(await service.request('get_app_info'), 'ordinary request');
  await fsp.writeFile(at('portable-sentinel'), 'preserve exact portable bytes');
  await run(service, at);
}

test('offline reset excludes alternate launcher starts and waits for the reset child before close', { skip: process.platform === 'win32', timeout: 12000 }, async (t) => {
  await withFixture(t, async (service, at) => {
    const reset = service.applyReset();
    reset.catch(() => {});
    await waitFor(at('reset-active'));
    const racing = Promise.all([
      assert.rejects(service.start(), /offline reset is in progress/i),
      assert.rejects(service.request('get_project_details'), /offline reset is in progress/i),
    ]);
    try {
      await racing;
      await assert.rejects(service.applyReset(), /offline reset is in progress/i);
      let closed = false;
      const closing = service.close().then(() => { closed = true; });
      await delay(40);
      assert.equal(closed, false);
      assert.equal(await fsp.readFile(at('service-spawns'), 'utf8'), 'service\n');
      assert.equal(fs.existsSync(at('overlap')), false);
      await fsp.writeFile(at('release-reset'), 'ok');
      const report = await reset;
      await closing;
      assert.equal(await fsp.readFile(path.join(report.recovery_dir, 'portable-sentinel'), 'utf8'), 'preserve exact portable bytes');
      assert.equal(await service.request('get_app_info'), 'ordinary request');
      assert.equal(await fsp.readFile(at('service-spawns'), 'utf8'), 'service\nservice\n');
    } finally {
      await fsp.writeFile(at('release-reset'), 'ok');
      await reset.catch(() => {});
    }
  });
});

test('a failed offline reset releases bridge ownership after child close and preserves the portable sentinel', { skip: process.platform === 'win32', timeout: 12000 }, async (t) => {
  await withFixture(t, async (service, at) => {
    const reset = service.applyReset(true);
    const rejected = assert.rejects(reset, /synthetic reset failure/);
    await waitFor(at('reset-active'));
    await fsp.writeFile(at('release-reset'), 'fail');
    await rejected;
    assert.equal(await service.request('get_app_info'), 'ordinary request');
    assert.equal(await fsp.readFile(at('portable-sentinel'), 'utf8'), 'preserve exact portable bytes');
  });
});

test('an offline reset timeout does not free the portable root while its child still runs', { skip: process.platform === 'win32', timeout: 12000 }, async (t) => {
  // Shorten only the existing 30-second timer so this is a fast real-child test.
  const original = globalThis.setTimeout;
  t.mock.method(globalThis, 'setTimeout', (callback, ms, ...args) => original(callback, ms === 30000 ? 500 : ms, ...args));
  await withFixture(t, async (service, at) => {
    await fsp.writeFile(at('ignore-term'), 'owned blocked fixture');
    const reset = service.applyReset();
    const rejected = assert.rejects(reset, /offline reset timed out/);
    await waitFor(at('reset-active'));
    await rejected;
    await waitFor(at('term-seen'));
    assert.equal(fs.existsSync(at('reset-active')), true);
    await assert.rejects(service.start(), /offline reset is in progress/i);
    let closed = false;
    const closing = service.close().then(() => { closed = true; });
    await delay(40);
    assert.equal(closed, false);
    await fsp.writeFile(at('release-reset'), 'ok');
    await closing;
    assert.equal(await fsp.readFile(at('reset-recovery/fixture/portable-sentinel'), 'utf8'), 'preserve exact portable bytes');
    assert.equal(await service.request('get_app_info'), 'ordinary request');
  });
});
