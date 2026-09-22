'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert/strict');
const { NorthpointService } = require('../src/northpoint-service');

const TOOLKIT = process.env.ENDERLOOM_MINECRAFT_DEV_KIT || null;
const HAS_TOOLKIT = !!(TOOLKIT && fs.existsSync(path.join(TOOLKIT, 'scripts', 'northpoint_simple_mod_selftest.py')));
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-northpoint-qa-'));
const dataDir = path.join(root, 'data');

(async () => {
  const service = new NorthpointService({ rootDir: root, dataDir, toolkitRoot: HAS_TOOLKIT ? TOOLKIT : null });
  const caps = await service.request('conversion_capabilities');
  assert.equal(caps.toolkit.available, HAS_TOOLKIT);
  assert.equal(caps.toolkit.simple_mod_selftest, HAS_TOOLKIT);
  assert.equal(caps.execution_available, HAS_TOOLKIT);
  assert.equal(caps.latest_release, '26.3');
  assert.equal(caps.no_fake_execution, true);
  assert.ok(caps.scheduler.max_secondary_cells >= 1);

  const plan = await service.request('conversion_plan', {
    targetMc: 'latest', targetLoader: 'fabric', matrix: 'all', includeExperimental: true,
  });
  assert.equal(plan.primary.minecraft, '26.3');
  assert.equal(plan.primary.loader, 'fabric');
  assert.equal(plan.cells[0].id, plan.primary.id);
  assert.equal(plan.fanout_gate, 'primary-passed');
  assert.ok(plan.secondary.some((cell) => cell.id === 'mc-1.20.1-forge'));
  assert.ok(plan.secondary.some((cell) => cell.id === 'mc-1.21.1-neoforge'));

  const session = await service.request('conversion_create_session', {
    source: { kind: 'fixture', name: 'hello-mod' },
    targetMc: '1.21.1', targetLoader: 'fabric', matrix: 'all', includeExperimental: false,
  });
  assert.equal(session.phase, 'planned');
  assert.equal(session.fanout_unlocked, false);
  const secondary = session.plan.secondary[0].id;
  await assert.rejects(
    () => Promise.resolve(service.request('conversion_start_cell', { sessionId: session.id, cellId: secondary })),
    /locked until the primary target passes/,
  );

  const primary = session.plan.primary.id;
  await service.request('conversion_record_fingerprint', {
    sessionId: session.id, cellId: primary,
    inputs: { common: 'a', loader: 'b', version: 'c', cell: 'd', toolchain: 'e', dependencies: 'f', config: 'g', adapters: ['x'] },
  });
  await service.request('conversion_start_cell', { sessionId: session.id, cellId: primary });
  const passed = await service.request('conversion_finish_cell', {
    sessionId: session.id, cellId: primary,
    result: { state: 'passed', artifact: { sha256: 'deadbeef', file: 'hello.jar' }, evidence: ['static', 'runtime'] },
  });
  assert.equal(passed.fanout_unlocked, true);
  assert.equal(passed.cells[primary].state, 'passed');

  const startedSecondary = await service.request('conversion_start_cell', { sessionId: session.id, cellId: secondary });
  assert.equal(startedSecondary.cells[secondary].state, 'building');
  await service.request('conversion_finish_cell', {
    sessionId: session.id, cellId: secondary, result: { state: 'passed', artifact: { sha256: 'cafe' } },
  });

  const reloaded = new NorthpointService({ rootDir: root, dataDir, toolkitRoot: HAS_TOOLKIT ? TOOLKIT : null });
  const restored = await reloaded.request('conversion_get_session', { sessionId: session.id });
  assert.equal(restored.fanout_unlocked, true);
  assert.equal(restored.cells[secondary].state, 'passed');

  const before = restored.cells[primary].fingerprint;
  const invalidated = await reloaded.request('conversion_record_fingerprint', {
    sessionId: session.id, cellId: primary,
    inputs: { common: 'changed', loader: 'b', version: 'c', cell: 'd', toolchain: 'e', dependencies: 'f', config: 'g', adapters: ['x'] },
  });
  assert.notEqual(invalidated.fingerprint, before);
  assert.equal(invalidated.state, 'stale');

  let worker = null;
  if (HAS_TOOLKIT) {
    worker = await reloaded.request('conversion_self_test');
    assert.equal(worker.ok, true);
    assert.match(worker.marker, /PASS/);
  } else {
    await assert.rejects(
      () => reloaded.request('conversion_self_test'),
      /worker is not installed\/configured/,
    );
  }

  const report = {
    status: 'PASS',
    latest: plan.latest_resolution,
    primary: plan.primary,
    secondary_count: plan.secondary.length,
    scheduler: caps.scheduler,
    restored_session: { id: restored.id, fanout_unlocked: restored.fanout_unlocked },
    invalidation: invalidated,
    worker_integration: HAS_TOOLKIT,
    worker_marker: worker?.marker || null,
  };
  console.log(JSON.stringify(report, null, 2));
})().catch((error) => {
  console.error(error?.stack || error);
  process.exitCode = 1;
});