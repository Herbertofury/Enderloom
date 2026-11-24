'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert/strict');
const { NorthpointService } = require('../src/northpoint-service');

const TOOLKIT = process.env.ENDERLOOM_MINECRAFT_DEV_KIT || path.join(__dirname, '..', 'tools', 'minecraft-dev-kit');
const HAS_TOOLKIT = !!(TOOLKIT && fs.existsSync(path.join(TOOLKIT, 'scripts', 'northpoint_graduation.py')));
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-northpoint-qa-'));
const dataDir = path.join(root, 'data');

(async () => {
  const provisionCalls = [];
  const managedService = new NorthpointService({
    rootDir: root,
    dataDir: path.join(root, 'managed-data'),
    toolkitRoot: HAS_TOOLKIT ? TOOLKIT : null,
    nativeRequest: async (command, args) => {
      provisionCalls.push({ command, args });
      if (command !== 'install_java_jdk') throw new Error(`unexpected native command ${command}`);
      return { path: `/managed/jdk-${args.major}/bin/java`, major: args.major };
    },
  });
  const provisioned = await managedService.provisionJava([
    { id: 'mc-1.21.1-fabric', java: 21 },
    { id: 'mc-26.3-fabric', java: 25 },
    { id: 'mc-26.3-neoforge', java: 25 },
  ]);
  assert.deepEqual(provisionCalls.map((row) => row.args.major), [21, 25]);
  assert.equal(provisioned[0].java_path, '/managed/jdk-21/bin/java');
  assert.equal(provisioned[1].java_path, '/managed/jdk-25/bin/java');
  assert.equal(provisioned[2].java_path, '/managed/jdk-25/bin/java');

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

  // Exercise both public Studio routes after all in-memory profiles have gone away.
  const retryObservations = [];
  for (const test of [
    { lane: 'exact', version: '1.19.2', command: 'conversion_resolve_version', args: { minecraft: '1.19.2' },
      loaderUrl: 'https://meta.fabricmc.net/v2/versions/loader/1.19.2', otherUrl: 'https://meta.quiltmc.org/v3/versions/loader/1.19.2',
      initialVersion: '0.14.25', otherLoader: 'quilt', otherUpdated: '0.19.1' },
    { lane: 'latest', version: '26.4', command: 'conversion_refresh_profiles', args: {},
      loaderUrl: 'https://meta.fabricmc.net/v2/versions/loader/26.4', otherUrl: 'https://maven.neoforged.net/releases/net/neoforged/neoforge/maven-metadata.xml',
      initialVersion: '0.20.0', otherLoader: 'neoforge', otherUpdated: '26.4.0.3' },
  ]) {
    const laneDir = path.join(root, `retry-${test.lane}`);
    const bodies = new Map(metadataBodies);
    const calls = [];
    const reopen = () => new NorthpointService({ rootDir: root, dataDir: laneDir, metadataFetch: async (url) => {
      calls.push(url);
      const value = bodies.get(url);
      if (value instanceof Error) throw value;
      if (!value) throw new Error(`unexpected metadata URL ${url}`);
      return value;
    } });
    const initial = await reopen().request(test.command, { ...test.args, force: true });
    const lastGood = initial.profile.loaders.fabric;
    assert.equal(lastGood.loader_version, test.initialVersion);
    assert.equal(lastGood.metadata_state, undefined);
    assert.deepEqual(initial.errors, []);
    const cachePath = test.lane === 'exact' ? reopen().versionMetadataCachePath(test.version) : reopen().metadataCachePath();
    const expired = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    expired.fetched_at_ms -= 24 * 60 * 60 * 1000;
    fs.writeFileSync(cachePath, JSON.stringify(expired));
    bodies.set(test.loaderUrl, new Error('fixture fabric transport unavailable'));
    bodies.set(test.otherUrl, test.lane === 'exact'
      ? { json: [{ loader: { version: test.otherUpdated } }] }
      : { text: `<metadata><versioning><versions><version>${test.otherUpdated}</version></versions></versioning></metadata>` });
    calls.length = 0;
    const partial = await reopen().request(test.command, test.args);
    assert.ok(calls.includes(test.loaderUrl), 'expiration still checks the live provider');
    assert.equal(partial.minecraft, test.version);
    assert.equal(partial.profile.minecraft, test.version);
    assert.deepEqual(partial.errors, [{ loader: 'fabric', error: 'fixture fabric transport unavailable' }]);
    assert.equal(partial.profile.loaders[test.otherLoader].loader_version, test.otherUpdated);
    calls.length = 0;
    const cachedPartial = await reopen().request(test.command, test.args);
    assert.deepEqual(calls, []);
    assert.deepEqual(cachedPartial.profile, partial.profile);
    assert.deepEqual(cachedPartial.errors, partial.errors);
    retryObservations.push({
      lane: test.lane,
      actual: partial.profile.loaders.fabric ?? null,
      expected: { ...lastGood, metadata_state: 'stale-unverified' },
    });
    bodies.set(test.loaderUrl, { json: [] });
    const absent = await reopen().request(test.command, { ...test.args, force: true });
    assert.deepEqual(absent.errors, []);
    assert.equal(absent.profile.loaders.fabric, undefined);
    bodies.set(test.loaderUrl, new Error('fixture fabric transport unavailable again'));
    const afterAbsence = await reopen().request(test.command, { ...test.args, force: true });
    assert.equal(afterAbsence.profile.loaders.fabric, undefined, 'an authoritative empty provider reply stays empty');
    const restoredVersion = `${test.initialVersion}-recovered`;
    bodies.set(test.loaderUrl, { json: [{ loader: { version: restoredVersion, stable: true } }] });
    const recovered = await reopen().request(test.command, { ...test.args, force: true });
    assert.deepEqual(recovered.errors, []);
    assert.equal(recovered.profile.loaders.fabric.loader_version, restoredVersion);
    assert.equal(recovered.profile.loaders.fabric.metadata_state, undefined);
  }
  assert.deepEqual(retryObservations.map(({ lane, actual }) => ({ lane, actual })),
    retryObservations.map(({ lane, expected }) => ({ lane, actual: expected })),
    'both Studio routes keep the exact previously verified loader on a partial refresh after reopening');

  // A latest alias move is not an exact game-version match, even when every other field is suitable.
  const movedDir = path.join(root, 'retry-latest');
  const movedBodies = new Map(metadataBodies);
  movedBodies.set(manifestUrl, { json: { latest: { release: '1.19.2' }, versions: [{ id: '1.19.2', url: legacyVersionUrl }] } });
  movedBodies.set('https://meta.fabricmc.net/v2/versions/loader/1.19.2', new Error('fixture fabric network unavailable'));
  const moved = new NorthpointService({ rootDir: root, dataDir: movedDir, metadataFetch: async (url) => {
    const value = movedBodies.get(url);
    if (value instanceof Error) throw value;
    if (!value) throw new Error(`unexpected metadata URL ${url}`);
    return value;
  } });
  const aliasMoved = await moved.request('conversion_refresh_profiles', { force: true });
  assert.equal(aliasMoved.profile.minecraft, '1.19.2');
  assert.equal(aliasMoved.profile.loaders.fabric, undefined);
  assert.equal(aliasMoved.profile.loaders.forge.loader_version, '43.4.0');

  // A persisted negative observation supersedes a bundled registry hint after restart.
  const knownVersion = '1.20.1';
  const knownUrl = 'https://fixture.invalid/1.20.1.json';
  const knownLoaderUrl = 'https://meta.fabricmc.net/v2/versions/loader/1.20.1';
  const knownBodies = new Map(metadataBodies);
  knownBodies.set(manifestUrl, { json: { versions: [{ id: knownVersion, url: knownUrl }] } });
  knownBodies.set(knownUrl, { json: { javaVersion: { majorVersion: 17 } } });
  knownBodies.set(knownLoaderUrl, new Error('fixture unknown for known loader'));
  knownBodies.set('https://meta.quiltmc.org/v3/versions/loader/1.20.1', { json: [] });
  const openKnown = () => new NorthpointService({ rootDir: root, dataDir: path.join(root, 'known-cache'), metadataFetch: async (url) => {
    const value = knownBodies.get(url);
    if (value instanceof Error) throw value;
    if (!value) throw new Error(`unexpected metadata URL ${url}`);
    return value;
  } });
  const resolveKnown = (force = true) => openKnown().request('conversion_resolve_version', { minecraft: knownVersion, force });
  const seed = await resolveKnown();
  assert.equal(seed.profile.loaders.fabric.metadata_state, 'stale-unverified');
  assert.equal(seed.profile.loaders.fabric.resolver, 'fabric-cli');
  knownBodies.set(knownLoaderUrl, { json: [] });
  const knownAbsent = await resolveKnown();
  assert.equal(knownAbsent.profile.loaders.fabric, undefined);
  knownBodies.set(knownLoaderUrl, new Error('fixture unknown after known absence'));
  const stillAbsent = await resolveKnown();
  assert.equal(stillAbsent.profile.loaders.fabric, undefined);
  const knownCache = openKnown().versionMetadataCachePath(knownVersion);
  const mismatched = JSON.parse(fs.readFileSync(knownCache, 'utf8'));
  // Even with the requested response identity, a mismatched nested owner must not hydrate.
  mismatched.resolved.profile = refreshed.profile;
  fs.writeFileSync(knownCache, JSON.stringify(mismatched));
  const mismatchIgnored = await resolveKnown(false);
  assert.equal(mismatchIgnored.source, 'live-version-metadata');
  assert.equal(mismatchIgnored.profile.minecraft, knownVersion);
  assert.equal(mismatchIgnored.profile.loaders.fabric.loader_version, undefined);
  assert.equal(mismatchIgnored.profile.loaders.fabric.resolver, 'fabric-cli');

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
    metadata_retry_lanes: retryObservations.map(({ lane }) => lane),
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