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
    targetMc: 'latest', targetLoader: 'fabric', matrix: 'all', includeExperimental: true, refreshLatest: false,
  });
  assert.equal(plan.primary.minecraft, '26.3');
  assert.equal(plan.primary.loader, 'fabric');
  assert.equal(plan.cells[0].id, plan.primary.id);
  assert.equal(plan.fanout_gate, 'primary-passed');
  assert.ok(plan.secondary.some((cell) => cell.id === 'mc-1.20.1-forge'));
  assert.ok(plan.secondary.some((cell) => cell.id === 'mc-1.21.1-neoforge'));

  const dynamicDataDir = path.join(root, 'dynamic-data');
  const manifestUrl = 'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json';
  const versionUrl = 'https://fixture.invalid/26.4.json';
  const legacyVersionUrl = 'https://fixture.invalid/1.19.2.json';
  const metadataBodies = new Map([
    [manifestUrl, { json: { latest: { release: '26.4' }, versions: [{ id: '26.4', url: versionUrl }, { id: '1.19.2', url: legacyVersionUrl }] } }],
    [versionUrl, { json: { javaVersion: { majorVersion: 25 } } }],
    [legacyVersionUrl, { json: { javaVersion: { majorVersion: 17 } } }],
    ['https://meta.fabricmc.net/v2/versions/loader/26.4', { json: [{ loader: { version: '0.20.0', stable: true } }] }],
    ['https://meta.fabricmc.net/v2/versions/loader/1.19.2', { json: [{ loader: { version: '0.14.25', stable: true } }] }],
    ['https://meta.quiltmc.org/v3/versions/loader/26.4', { json: [] }],
    ['https://meta.quiltmc.org/v3/versions/loader/1.19.2', { json: [{ loader: { version: '0.18.1' } }] }],
    ['https://maven.neoforged.net/releases/net/neoforged/neoforge/maven-metadata.xml', { text: '<metadata><versioning><versions><version>26.4.0.1-beta</version><version>26.4.0.2</version></versions></versioning></metadata>' }],
    ['https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json', { json: { promos: { '1.19.2-recommended': '43.4.0' } } }],
  ]);
  const metadataFetch = async (url) => {
    if (!metadataBodies.has(url)) throw new Error(`unexpected metadata URL ${url}`);
    return metadataBodies.get(url);
  };
  const dynamic = new NorthpointService({ rootDir: root, dataDir: dynamicDataDir, metadataFetch });
  const refreshed = await dynamic.request('conversion_refresh_profiles', { force: true });
  assert.equal(refreshed.minecraft, '26.4');
  assert.equal(refreshed.java, 25);
  assert.equal(refreshed.source, 'live-metadata');
  assert.equal(refreshed.profile.loaders.fabric.loader_version, '0.20.0');
  assert.equal(refreshed.profile.loaders.neoforge.loader_version, '26.4.0.2');
  assert.equal(refreshed.profile.loaders.forge, undefined);
  assert.equal(refreshed.profile.loaders.quilt, undefined);
  const dynamicPlan = await dynamic.request('conversion_plan', {
    targetMc: 'latest', targetLoader: 'neoforge', matrix: 'target-only', refreshLatest: false,
  });
  assert.equal(dynamicPlan.primary.minecraft, '26.4');
  assert.equal(dynamicPlan.primary.profile.loader_version, '26.4.0.2');
  assert.equal(dynamicPlan.latest_resolution.source, 'live-metadata');

  const legacyResolved = await dynamic.request('conversion_resolve_version', { minecraft: '1.19.2', force: true });
  assert.equal(legacyResolved.minecraft, '1.19.2');
  assert.equal(legacyResolved.java, 17);
  assert.equal(legacyResolved.source, 'live-version-metadata');
  assert.equal(legacyResolved.profile.mapping_model, 'official-mapped');
  assert.equal(legacyResolved.profile.loaders.fabric.loader_version, '0.14.25');
  assert.equal(legacyResolved.profile.loaders.quilt.loader_version, '0.18.1');
  assert.equal(legacyResolved.profile.loaders.forge.loader_version, '43.4.0');
  const legacyPlan = await dynamic.request('conversion_plan', {
    targetMc: '1.19.2', targetLoader: 'forge', matrix: 'target-only', resolveVersion: false,
  });
  assert.equal(legacyPlan.primary.minecraft, '1.19.2');
  assert.equal(legacyPlan.primary.profile.loader_version, '43.4.0');

  const offlineDynamic = new NorthpointService({
    rootDir: root,
    dataDir: dynamicDataDir,
    metadataFetch: async () => { throw new Error('offline fixture'); },
  });
  const stale = await offlineDynamic.request('conversion_refresh_profiles', { force: true });
  assert.equal(stale.minecraft, '26.4');
  assert.equal(stale.source, 'stale-metadata-cache');
  assert.equal(stale.fresh, false);

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
    dynamic_latest: { resolved: dynamicPlan.primary.minecraft, source: dynamicPlan.latest_resolution.source, stale_fallback: stale.source },
    arbitrary_version: { minecraft: legacyPlan.primary.minecraft, loader: legacyPlan.primary.loader, java: legacyResolved.java },
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