'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const { spawnSync } = require('child_process');
const { LauncherService, PROTOCOL_VERSION } = require('../src/launcher-service');

const rootDir = path.resolve(__dirname, '..');
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-launcher-qa-'));
const dataDir = path.join(temporaryRoot, 'data');
const syntheticCurseForgeRoot = path.join(temporaryRoot, 'synthetic-curseforge');
let syntheticProfile = path.join(syntheticCurseForgeRoot, 'Instances', 'synthetic-profile');
fs.mkdirSync(path.join(syntheticProfile, 'mods'), { recursive: true });
fs.mkdirSync(path.join(syntheticProfile, 'resourcepacks'), { recursive: true });
fs.writeFileSync(path.join(syntheticProfile, 'mods', 'fixture.jar'), 'synthetic mod content');
fs.writeFileSync(path.join(syntheticProfile, 'resourcepacks', 'fixture.zip'), 'synthetic pack content');
fs.writeFileSync(path.join(syntheticProfile, 'minecraftinstance.json'), JSON.stringify({
  guid: 'synthetic-profile-guid',
  name: 'Synthetic in-place profile',
  gameVersion: '1.20.1',
  baseModLoader: { name: 'fabric-loader-0.16.14' },
  installedModpack: { projectId: 1234, fileId: 5678 },
  lastPlayed: 1700000000000,
}));
const serviceEnvironment = {
  ENDERLOOM_QA_MODE: '1',
  ENDERLOOM_QA_NODE: process.execPath,
  ENDERLOOM_QA_PROCESS_SCRIPT: path.join(rootDir, 'scripts', 'launcher-process-probe.js'),
};
let service = new LauncherService({
  rootDir,
  dataDir,
  resourcesDir: rootDir,
  env: serviceEnvironment,
});
const serviceEvents = [];
service.on('event', (message) => serviceEvents.push(message));

function hashFile(file) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return null;
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function externalInputs(source) {
  const files = [];
  if (source.kind === 'modrinth') {
    for (const name of ['app.db', 'app.db-wal']) {
      const file = path.join(source.root, name);
      if (fs.existsSync(file)) files.push(file);
    }
  } else if (source.kind === 'curseforge') {
    const instances = path.join(source.root, 'Instances');
    if (fs.existsSync(instances)) {
      for (const entry of fs.readdirSync(instances, { withFileTypes: true })) {
        const manifest = path.join(instances, entry.name, 'minecraftinstance.json');
        if (fs.existsSync(manifest)) files.push(manifest);
      }
    }
  }
  return files.sort((left, right) => left.localeCompare(right));
}

function fingerprint(source) {
  const records = externalInputs(source).map((file) => {
    const stat = fs.statSync(file);
    return {
      relative: path.relative(source.root, file).replaceAll('\\', '/'),
      size: stat.size,
      sha256: hashFile(file),
    };
  });
  return crypto.createHash('sha256').update(JSON.stringify(records)).digest('hex');
}

function treeFingerprint(root) {
  const records = [];
  const pending = [root];
  while (pending.length) {
    const dir = pending.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const target = path.join(dir, entry.name);
      const relative = path.relative(root, target).replaceAll('\\', '/');
      if (entry.isSymbolicLink()) {
        records.push({ relative, link: fs.readlinkSync(target) });
      } else if (entry.isDirectory()) {
        pending.push(target);
      } else if (entry.isFile()) {
        records.push({ relative, size: fs.statSync(target).size, sha256: hashFile(target) });
      }
    }
  }
  records.sort((left, right) => left.relative.localeCompare(right.relative));
  return crypto.createHash('sha256').update(JSON.stringify(records)).digest('hex');
}

function writeSyntheticWorld(root, name) {
  const utf8 = Buffer.from(name, 'utf8');
  const tagName = Buffer.from('LevelName', 'utf8');
  const levelName = Buffer.concat([
    Buffer.from([8, 0, tagName.length]),
    tagName,
    Buffer.from([0, utf8.length]),
    utf8,
  ]);
  const dataName = Buffer.from('Data', 'utf8');
  const nbt = Buffer.concat([
    Buffer.from([10, 0, 0]),
    Buffer.from([10, 0, dataName.length]),
    dataName,
    levelName,
    Buffer.from([0, 0]),
  ]);
  fs.mkdirSync(root, { recursive: true });
  fs.writeFileSync(path.join(root, 'level.dat'), zlib.gzipSync(nbt));
  fs.writeFileSync(path.join(root, 'session.lock'), 'controlled world fixture');
}

function attachServiceEvents() {
  service.on('event', (message) => serviceEvents.push(message));
}

async function waitForExit() {
  if (!service.child) return;
  await Promise.race([
    new Promise((resolve) => service.once('exit', resolve)),
    new Promise((resolve) => setTimeout(resolve, 3500)),
  ]);
}

function runOfflineReset(executable, root, deep = false) {
  const result = spawnSync(
    executable,
    ['--apply-reset', '--data-dir', root, ...(deep ? ['--deep'] : [])],
    { cwd: rootDir, encoding: 'utf8', windowsHide: true },
  );
  assert.equal(
    result.status,
    0,
    `offline reset failed: ${String(result.stderr || result.stdout).trim()}`,
  );
  return JSON.parse(String(result.stdout).trim());
}

(async () => {
  const ready = await service.start();
  assert.equal(ready.state, 'ready');
  assert.equal(PROTOCOL_VERSION, 1);

  const appInfo = await service.request('get_app_info');
  assert(appInfo && typeof appInfo === 'object', 'Rust core did not return app information');
  const locations = await service.request('get_data_locations');
  assert(Array.isArray(locations) && locations.length === 9, 'Rust core did not return all data locations');
  const systemStats = await service.request('get_system_stats');
  assert(Number(systemStats?.total_memory_mb) > 0, 'Rust core did not return system statistics');
  const instances = await service.request('list_instances');
  assert(Array.isArray(instances), 'Rust core did not return an instance list');
  assert.equal(instances.length, 0, 'isolated launcher QA did not start with an empty database');

  const resetPlan = await service.request('prepare_reset', { deep: false });
  assert.equal(resetPlan?.recoverable, true, 'reset planning did not promise a recovery set');
  assert(
    resetPlan.targets.includes('basalt.db'),
    'reset planning did not identify the compatibility database without touching it',
  );

  const updateInfo = await service.request('check_for_updates', {
    currentVersion: '2.9.5',
    packaged: false,
  }, { timeoutMs: 60000 });
  assert.equal(updateInfo.current, '2.9.5', 'Electron version was not used for update comparison');
  assert.equal(updateInfo.install_source?.id, 'electron-source');
  assert.equal(updateInfo.install_source?.policy, 'manual');
  assert(/Enderloom/i.test(updateInfo.install_source?.update_hint || ''));
  const updateStatus = await service.request('get_app_update_status');
  assert.equal(updateStatus.info?.current, '2.9.5', 'update coordinator did not record the check');
  assert(
    serviceEvents.some((message) => message.event === 'app:update-status'),
    'update status did not cross the Electron IPC event boundary',
  );
  if (updateInfo.latest) {
    const dismissed = await service.request('dismiss_app_update', { version: updateInfo.latest });
    assert.equal(dismissed.dismissed, true, 'update dismissal was not persisted');
  } else {
    await assert.rejects(
      service.request('dismiss_app_update', { version: 'not-a-current-release' }),
      /no longer current/i,
    );
  }
  await assert.rejects(
    service.request('download_app_update'),
    /check for updates|pull|download|release|source build/i,
    'Electron IPC unexpectedly entered the inherited Tauri download path',
  );
  await assert.rejects(
    service.request('install_app_update'),
    /No verified Electron update is ready/i,
    'Electron IPC unexpectedly entered the inherited Tauri installer path',
  );

  const resetExecutable = service.executable();
  assert(resetExecutable && fs.existsSync(resetExecutable), 'offline reset executable is unavailable');
  const shallowResetRoot = path.join(temporaryRoot, 'offline-reset-shallow');
  fs.mkdirSync(path.join(shallowResetRoot, 'instances', 'one'), { recursive: true });
  fs.mkdirSync(path.join(shallowResetRoot, 'versions', 'v1'), { recursive: true });
  fs.writeFileSync(path.join(shallowResetRoot, 'basalt.db'), 'controlled reset database');
  fs.writeFileSync(path.join(shallowResetRoot, 'keep.txt'), 'must remain');
  const shallowReset = runOfflineReset(resetExecutable, shallowResetRoot, false);
  assert(!fs.existsSync(path.join(shallowResetRoot, 'instances')), 'shallow reset left instances live');
  assert(!fs.existsSync(path.join(shallowResetRoot, 'basalt.db')), 'shallow reset left its database live');
  assert(fs.existsSync(path.join(shallowResetRoot, 'versions', 'v1')), 'shallow reset moved game files');
  assert(fs.existsSync(path.join(shallowResetRoot, 'keep.txt')), 'reset moved an unrelated file');
  assert(fs.existsSync(path.join(shallowReset.recovery_dir, 'instances', 'one')));
  assert(fs.existsSync(path.join(shallowReset.recovery_dir, 'basalt.db')));
  assert(fs.existsSync(path.join(shallowReset.recovery_dir, 'manifest.json')));
  assert(fs.existsSync(path.join(shallowResetRoot, 'last-reset.json')));

  const deepResetRoot = path.join(temporaryRoot, 'offline-reset-deep');
  fs.mkdirSync(path.join(deepResetRoot, 'versions', 'v1'), { recursive: true });
  fs.mkdirSync(path.join(deepResetRoot, 'runtimes', 'java'), { recursive: true });
  fs.writeFileSync(path.join(deepResetRoot, 'keep.txt'), 'must remain');
  const deepReset = runOfflineReset(resetExecutable, deepResetRoot, true);
  assert(fs.existsSync(path.join(deepReset.recovery_dir, 'versions', 'v1')));
  assert(fs.existsSync(path.join(deepReset.recovery_dir, 'runtimes', 'java')));
  assert(fs.existsSync(path.join(deepResetRoot, 'keep.txt')), 'deep reset moved an unrelated file');

  const unsafeReset = spawnSync(
    resetExecutable,
    ['--apply-reset', '--data-dir', '.'],
    { cwd: rootDir, encoding: 'utf8', windowsHide: true },
  );
  assert.notEqual(unsafeReset.status, 0, 'offline reset accepted a relative broad root');
  assert(/absolute path/i.test(String(unsafeReset.stderr)), 'unsafe reset rejection was not explicit');

  await assert.rejects(
    service.request('create_instance', { name: '   ', versionId: '1.20.1', loader: null, loaderVersion: null }),
    /name cannot be empty/i,
  );
  await assert.rejects(
    service.request('create_instance', { name: 'Invalid loader QA', versionId: '1.20.1', loader: 'fabric', loaderVersion: null }),
    /loader version is required/i,
  );
  const created = await service.request('create_instance', {
    name: 'Enderloom isolated QA',
    versionId: '1.20.1',
    loader: null,
    loaderVersion: null,
  });
  assert(created?.id && created.name === 'Enderloom isolated QA', 'Rust core did not create the isolated instance');
  assert(
    path.resolve(created.dir).startsWith(path.resolve(dataDir) + path.sep),
    'isolated instance escaped the temporary launcher data root',
  );
  assert(fs.statSync(created.dir).isDirectory(), 'Rust core did not create the instance directory');
  const createdList = await service.request('list_instances');
  assert.equal(createdList.length, 1, 'created instance was not persisted in the isolated database');
  const launchCommand = await service.request('get_instance_launch_command', { instanceId: created.id });
  assert(/\s-l\s/.test(launchCommand), 'Rust core did not produce a launcher command for the instance');

  const emptyOrganization = await service.request('get_instance_organization');
  for (const field of ['groups', 'placements', 'favorites', 'tags', 'taggings']) {
    assert(Array.isArray(emptyOrganization[field]), `instance organization omitted ${field}`);
  }
  const organizerGroup = await service.request('create_instance_group', { name: 'QA modpacks' });
  const organizerTag = await service.request('create_instance_tag', { name: 'Exploration' });
  const temporaryTag = await service.request('create_instance_tag', { name: 'Temporary tag' });
  await service.request('reorder_instance_tags', { tagIds: [temporaryTag.id, organizerTag.id] });
  const renamedTag = await service.request('rename_instance_tag', {
    tagId: organizerTag.id,
    name: 'Exploration packs',
  });
  assert.equal(renamedTag.name, 'Exploration packs', 'tag rename did not return durable state');
  await service.request('delete_instance_tag', { tagId: temporaryTag.id });
  await service.request('move_instance_to_group', { instanceId: created.id, groupId: organizerGroup.id });
  await service.request('set_instance_favorite', { instanceId: created.id, favorite: true });
  await service.request('set_instance_tag', {
    instanceId: created.id,
    tagId: organizerTag.id,
    enabled: true,
  });
  const organized = await service.request('get_instance_organization');
  assert(organized.favorites.includes(created.id), 'favorite did not persist in SQLite');
  assert(
    organized.taggings.some((entry) => entry.instance_id === created.id && entry.tag_id === organizerTag.id),
    'instance tag membership did not persist in SQLite',
  );
  assert(!organized.tags.some((entry) => entry.id === temporaryTag.id), 'deleted tag remained visible');

  const versions = await service.request('list_versions', { includeSnapshots: false });
  assert(versions.length > 10 && versions.every((entry) => entry.type === 'release'), 'release version discovery failed');
  const fabricVersions = await service.request('list_loader_versions', {
    loader: 'fabric',
    gameVersion: '1.20.1',
  });
  assert(fabricVersions.length > 0, 'Fabric loader discovery failed');
  const javaStatus = await service.request('get_java_status', { instanceId: created.id });
  assert(Number(javaStatus?.required_major) >= 8, 'Java requirement discovery failed');

  const gameInstallPromise = service.request(
    'install_instance',
    { instanceId: created.id },
    { timeoutMs: 120000 },
  );
  let gameInstallTask = null;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    gameInstallTask = serviceEvents
      .filter(
        (message) =>
          message.event === 'task:update' &&
          message.payload?.kind === 'game_install' &&
          message.payload?.instance_id === created.id,
      )
      .map((message) => message.payload)
      .find((task) => task.state === 'running');
    if (gameInstallTask) break;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  assert(gameInstallTask?.id, 'game installation did not publish a cancellable IPC task');
  assert.equal(
    await service.request('cancel_task', { taskId: gameInstallTask.id }),
    true,
    'game installation task could not be cancelled',
  );
  await assert.rejects(gameInstallPromise, /cancel/i);
  assert(
    serviceEvents.some(
      (message) =>
        message.event === 'task:update' &&
        message.payload?.id === gameInstallTask.id &&
        message.payload?.state === 'cancelled',
    ),
    'cancelled game installation did not publish its terminal task state',
  );
  assert.equal(
    (await service.request('list_installed_versions')).includes(created.version_id),
    false,
    'cancelled game installation was incorrectly reported as complete',
  );

  const duplicateFixture = path.join(created.dir, 'enderloom-duplicate-fixture.txt');
  fs.writeFileSync(duplicateFixture, 'duplicate contract bytes');
  const duplicateSourceFingerprint = treeFingerprint(created.dir);
  const duplicated = await service.request(
    'duplicate_instance',
    { instanceId: created.id },
    { timeoutMs: 120000 },
  );
  assert(duplicated?.id && duplicated.id !== created.id, 'duplicate did not create a new instance identity');
  assert(
    path.resolve(duplicated.dir).startsWith(path.resolve(dataDir) + path.sep),
    'duplicate escaped the managed Enderloom data root',
  );
  assert.equal(
    hashFile(path.join(duplicated.dir, path.basename(duplicateFixture))),
    hashFile(duplicateFixture),
    'duplicate did not preserve source file bytes',
  );
  assert.equal(
    treeFingerprint(created.dir),
    duplicateSourceFingerprint,
    'duplicate modified its source instance',
  );
  assert(
    serviceEvents.some(
      (message) =>
        message.event === 'task:update' &&
        message.payload?.kind === 'instance_duplicate' &&
        message.payload?.instance_id === created.id &&
        message.payload?.state === 'succeeded',
    ),
    'duplicate did not publish a succeeded task',
  );
  const duplicatedOrganization = await service.request('get_instance_organization');
  assert(duplicatedOrganization.favorites.includes(duplicated.id), 'duplicate did not inherit favorite state');
  assert(
    duplicatedOrganization.taggings.some(
      (entry) => entry.instance_id === duplicated.id && entry.tag_id === organizerTag.id,
    ),
    'duplicate did not inherit tag memberships',
  );
  assert(
    duplicatedOrganization.placements.some(
      (entry) => entry.instance_id === duplicated.id && entry.group_id === organizerGroup.id,
    ),
    'duplicate did not inherit group placement',
  );

  const repairPromise = service.request(
    'repair_instance',
    { instanceId: created.id },
    { timeoutMs: 120000 },
  );
  let repairTask = null;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    repairTask = serviceEvents
      .filter(
        (message) =>
          message.event === 'task:update' &&
          message.payload?.kind === 'instance_repair' &&
          message.payload?.instance_id === created.id,
      )
      .map((message) => message.payload)
      .find((task) => task.state === 'running');
    if (repairTask) break;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  assert(repairTask?.id, 'repair did not publish a cancellable IPC task');
  assert.equal(await service.request('cancel_task', { taskId: repairTask.id }), true);
  await assert.rejects(repairPromise, /cancel/i);
  assert(
    serviceEvents.some(
      (message) =>
        message.event === 'task:update' &&
        message.payload?.id === repairTask.id &&
        message.payload?.state === 'cancelled',
    ),
    'repair cancellation did not publish its terminal task state',
  );

  const snapshot = await service.request('create_instance_snapshot', {
    instanceId: created.id,
    name: 'Enderloom QA recovery point',
    excluded: [],
  });
  assert(snapshot?.id && snapshot.file_count >= 1, 'snapshot did not capture the controlled instance');
  assert(
    (await service.request('list_instance_snapshots', { instanceId: created.id })).some(
      (entry) => entry.id === snapshot.id,
    ),
    'created snapshot was not listed',
  );
  const renamedSnapshot = await service.request('rename_instance_snapshot', {
    instanceId: created.id,
    snapshotId: snapshot.id,
    name: 'Enderloom QA renamed recovery point',
  });
  assert.equal(renamedSnapshot.name, 'Enderloom QA renamed recovery point');
  assert(
    Number(await service.request('instance_snapshot_usage', { instanceId: created.id })) > 0,
    'snapshot storage usage was not reported',
  );
  fs.writeFileSync(duplicateFixture, 'mutated after snapshot');
  const restoredSnapshot = await service.request(
    'restore_instance_snapshot',
    { instanceId: created.id, snapshotId: snapshot.id },
    { timeoutMs: 120000 },
  );
  assert.equal(restoredSnapshot.id, snapshot.id, 'snapshot restore returned the wrong identity');
  assert.equal(
    fs.readFileSync(duplicateFixture, 'utf8'),
    'duplicate contract bytes',
    'snapshot restore did not recover the original instance bytes',
  );
  assert(
    serviceEvents.some(
      (message) =>
        message.event === 'task:update' &&
        message.payload?.kind === 'snapshot_restore' &&
        message.payload?.instance_id === created.id &&
        message.payload?.state === 'succeeded',
    ),
    'snapshot restore did not publish a succeeded task',
  );
  await service.request('delete_instance_snapshot', {
    instanceId: created.id,
    snapshotId: snapshot.id,
  });
  assert(
    !(await service.request('list_instance_snapshots', { instanceId: created.id })).some(
      (entry) => entry.id === snapshot.id,
    ),
    'deleted snapshot remained listed',
  );

  const managedDeleteSourceFingerprint = treeFingerprint(created.dir);
  await service.request('delete_instance', { instanceId: duplicated.id });
  assert.equal(fs.existsSync(duplicated.dir), false, 'managed duplicate folder survived deletion');
  assert(
    !(await service.request('list_instances')).some((instance) => instance.id === duplicated.id),
    'deleted managed duplicate remained in the database',
  );
  assert.equal(
    treeFingerprint(created.dir),
    managedDeleteSourceFingerprint,
    'deleting a duplicate changed its source instance',
  );
  assert(
    !fs
      .readdirSync(path.join(dataDir, 'instances'))
      .some((name) => /^\.delete-(?:pending|committed)-/.test(name)),
    'managed deletion left an unexpected quarantine after successful cleanup',
  );

  const bannerSource = path.join(temporaryRoot, 'enderloom-banner.png');
  fs.writeFileSync(
    bannerSource,
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64',
    ),
  );
  const banner = await service.request('add_banner_to_library', { sourcePath: bannerSource });
  assert(banner?.id && banner.kind === 'image', 'banner library did not import the controlled image');
  assert(
    (await service.request('list_banner_library')).some((entry) => entry.id === banner.id),
    'imported banner was not listed',
  );
  const appliedBanner = await service.request('apply_banner', {
    instanceId: created.id,
    bannerId: banner.id,
  });
  assert.equal(appliedBanner.local, true, 'instance banner did not resolve as local media');
  assert(fs.existsSync(appliedBanner.image_url), 'instance banner file is unavailable');
  const resolvedMedia = await service.request('get_instance_media', { instanceId: created.id });
  assert.equal(resolvedMedia?.image_url, appliedBanner.image_url, 'instance media cache lost the banner');
  const appliedLogo = await service.request('apply_logo', {
    instanceId: created.id,
    bannerId: banner.id,
  });
  assert(fs.existsSync(appliedLogo), 'banner image was not applied as an instance logo');
  await service.request('clear_instance_logo', { instanceId: created.id });
  assert.equal(fs.existsSync(appliedLogo), false, 'instance logo was not cleared');
  const directLogo = await service.request('set_instance_logo', {
    instanceId: created.id,
    sourcePath: bannerSource,
  });
  assert(fs.existsSync(directLogo), 'direct instance logo import failed');
  await service.request('clear_instance_logo', { instanceId: created.id });
  await service.request('clear_instance_banner', { instanceId: created.id });
  await service.request('delete_banner', { bannerId: banner.id });
  assert(
    !(await service.request('list_banner_library')).some((entry) => entry.id === banner.id),
    'deleted banner remained in the media library',
  );
  const backfilled = await service.request('backfill_pack_logos');
  assert(Array.isArray(backfilled), 'pack-logo backfill did not return the instance list');

  const worldSource = path.join(temporaryRoot, 'synthetic-world-source');
  writeSyntheticWorld(worldSource, 'Enderloom QA World');
  const worldInspection = await service.request('inspect_world_source', {
    sourcePath: worldSource,
  });
  assert.equal(worldInspection.candidates.length, 1, 'world source inspection missed the fixture');
  assert.equal(worldInspection.candidates[0].status, 'ok', 'valid world fixture was marked damaged');
  assert.equal(
    await service.request('import_worlds', {
      instanceId: created.id,
      sourcePath: worldSource,
      candidateIds: [worldInspection.candidates[0].id],
    }),
    1,
    'world import did not copy the selected world',
  );
  assert(
    serviceEvents.some(
      (message) =>
        message.event === 'task:update' &&
        message.payload?.kind === 'world_import' &&
        message.payload?.instance_id === created.id &&
        message.payload?.state === 'succeeded',
    ),
    'world import did not publish a succeeded task',
  );
  const importedWorlds = await service.request('list_instance_worlds', {
    instanceId: created.id,
  });
  const importedWorld = importedWorlds.find((world) => world.name === 'Enderloom QA World');
  assert(importedWorld?.folder_name, 'imported world was not listed');
  const datapackSource = path.join(temporaryRoot, 'enderloom-datapack.zip');
  fs.writeFileSync(datapackSource, 'controlled datapack fixture');
  assert.equal(
    await service.request('add_datapacks', {
      instanceId: created.id,
      world: importedWorld.folder_name,
      sources: [datapackSource],
    }),
    1,
    'manual datapack add failed',
  );
  let worldPacks = await service.request('list_instance_datapacks', { instanceId: created.id });
  assert(
    worldPacks.some(
      (group) =>
        group.world === importedWorld.folder_name &&
        group.packs.some((pack) => pack.file_name === path.basename(datapackSource) && pack.enabled),
    ),
    'added datapack was not listed as enabled',
  );
  assert.equal(
    await service.request('toggle_datapack', {
      instanceId: created.id,
      world: importedWorld.folder_name,
      fileName: path.basename(datapackSource),
    }),
    false,
    'datapack toggle did not disable the file',
  );
  await service.request('delete_datapack', {
    instanceId: created.id,
    world: importedWorld.folder_name,
    fileName: path.basename(datapackSource),
  });
  worldPacks = await service.request('list_instance_datapacks', { instanceId: created.id });
  assert(
    !worldPacks.some((group) => group.packs.some((pack) => pack.file_name === path.basename(datapackSource))),
    'deleted datapack remained listed',
  );
  await service.request('delete_instance_world', {
    instanceId: created.id,
    folderName: importedWorld.folder_name,
  });
  assert(
    !(await service.request('list_instance_worlds', { instanceId: created.id })).some(
      (world) => world.folder_name === importedWorld.folder_name,
    ),
    'deleted world remained listed',
  );

  const instanceLogsDir = path.join(created.dir, 'logs');
  fs.mkdirSync(instanceLogsDir, { recursive: true });
  const fakeSecret = 'enderloom-qa-token-never-real';
  const latestLog = [
    '[12:00:00] [main/INFO]: Enderloom controlled log fixture',
    '[12:00:01] [main/ERROR]: java.lang.OutOfMemoryError: Java heap space',
    `Authorization: Bearer ${fakeSecret}`,
    'Path C:\\Users\\EnderloomQAPrivate\\AppData\\Roaming\\Minecraft',
    'Player 12345678-1234-1234-1234-123456789abc',
  ].join('\n');
  fs.writeFileSync(path.join(instanceLogsDir, 'latest.log'), latestLog);
  fs.writeFileSync(
    path.join(instanceLogsDir, 'historical.log.gz'),
    zlib.gzipSync('[11:59:59] [main/WARN]: controlled compressed warning'),
  );
  const instanceLogs = await service.request('list_instance_logs', { instanceId: created.id });
  assert(
    instanceLogs.some((entry) => entry.name === 'latest.log' && !entry.compressed && !entry.crash),
    'plain instance log was not listed',
  );
  assert(
    instanceLogs.some((entry) => entry.name === 'historical.log.gz' && entry.compressed),
    'compressed instance log was not listed',
  );
  const logSearch = await service.request('search_instance_log', {
    instanceId: created.id,
    name: 'latest.log',
    crash: false,
    query: 'heap space',
    minLevel: 'error',
    limit: 50,
  });
  assert.equal(logSearch.matched_lines, 1, 'instance log search did not find the controlled error');
  assert.equal(logSearch.hits[0].level, 'error', 'instance log severity classification failed');
  const compressedSearch = await service.request('search_instance_log', {
    instanceId: created.id,
    name: 'historical.log.gz',
    crash: false,
    query: 'compressed warning',
    minLevel: 'warn',
    limit: 50,
  });
  assert.equal(compressedSearch.matched_lines, 1, 'gzip instance log search failed');
  const diagnoses = await service.request('diagnose_instance', {
    instanceId: created.id,
    name: 'latest.log',
    crash: false,
  });
  assert(
    diagnoses.some((diagnosis) => diagnosis.id === 'out-of-memory'),
    'instance diagnosis did not identify the controlled memory failure',
  );
  const redactedLog = await service.request('redact_instance_log', {
    instanceId: created.id,
    name: 'latest.log',
    crash: false,
  });
  assert(!redactedLog.includes(fakeSecret), 'instance log redaction exposed a token-shaped fixture');
  assert(!redactedLog.includes('EnderloomQAPrivate'), 'instance log redaction exposed a home-folder name');
  assert(redactedLog.includes('C:\\Users\\user'), 'instance log redaction did not preserve safe path context');
  assert(redactedLog.includes('[redacted]'), 'instance log redaction did not mark removed values');
  const redactedText = await service.request('redact_text', {
    text: `access_token=${fakeSecret}`,
  });
  assert(!redactedText.includes(fakeSecret), 'free-form log redaction exposed a token-shaped fixture');
  await assert.rejects(
    service.request('search_instance_log', {
      instanceId: created.id,
      name: '..\\latest.log',
      crash: false,
      query: '',
      minLevel: null,
      limit: 50,
    }),
    /not a log file/i,
  );
  const configuredDebug = await service.request('set_log_level', { level: 'debug' });
  assert.equal(configuredDebug.level, 'debug', 'service log level did not change at runtime');
  await service.request('frontend_log', {
    level: 'debug',
    scope: 'launcher-integration-qa',
    message: 'controlled frontend record',
    data: null,
  });
  let launcherRecords = [];
  for (let attempt = 0; attempt < 20; attempt += 1) {
    launcherRecords = await service.request('get_log_records', { limit: 200 });
    if (launcherRecords.some((record) => record.message === 'controlled frontend record')) break;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert(
    launcherRecords.some(
      (record) => record.source === 'frontend' && record.message === 'controlled frontend record',
    ),
    'Electron frontend records did not enter the Rust launcher log buffer',
  );
  await service.request('clear_log_records');
  assert(
    !(await service.request('get_log_records', { limit: 200 })).some(
      (record) => record.message === 'controlled frontend record',
    ),
    'launcher log buffer did not clear',
  );
  await service.request('set_log_level', { level: 'info' });
  await service.request('delete_instance_log', {
    instanceId: created.id,
    name: 'latest.log',
    crash: false,
  });
  await service.request('delete_instance_log', {
    instanceId: created.id,
    name: 'historical.log.gz',
    crash: false,
  });
  assert.equal(
    (await service.request('list_instance_logs', { instanceId: created.id })).length,
    0,
    'controlled instance logs remained after deletion',
  );

  const screenshotsDir = path.join(created.dir, 'screenshots');
  fs.mkdirSync(screenshotsDir, { recursive: true });
  const screenshotName = 'enderloom-controlled.png';
  const screenshotPath = path.join(screenshotsDir, screenshotName);
  fs.copyFileSync(bannerSource, screenshotPath);
  let screenshots = await service.request('list_screenshots', { instanceId: created.id });
  assert(
    screenshots.some((shot) => shot.name === screenshotName && shot.path === screenshotPath),
    'controlled screenshot was not listed',
  );
  const thumbnails = await service.request('ensure_thumbnails', {
    instanceId: created.id,
    names: [screenshotName],
  });
  const thumbnail = thumbnails.find((entry) => entry.name === screenshotName);
  assert(thumbnail?.path && fs.existsSync(thumbnail.path), 'screenshot thumbnail was not generated');
  screenshots = await service.request('list_screenshots', { instanceId: created.id });
  assert.equal(
    screenshots.find((shot) => shot.name === screenshotName)?.thumbnail,
    thumbnail.path,
    'generated screenshot thumbnail was not resolved on refresh',
  );
  assert.equal(
    await service.request('copy_screenshot', { instanceId: created.id, name: screenshotName }),
    screenshotPath,
    'Rust core did not validate the screenshot path for Electron clipboard copy',
  );
  await assert.rejects(
    service.request('copy_screenshot', { instanceId: created.id, name: '..\\enderloom-controlled.png' }),
    /not a screenshot/i,
  );
  assert.equal(
    await service.request('delete_screenshots', { instanceId: created.id, names: [screenshotName] }),
    1,
    'controlled screenshot was not deleted',
  );
  assert(!fs.existsSync(screenshotPath), 'deleted screenshot remained on disk');
  assert(!fs.existsSync(thumbnail.path), 'deleted screenshot left its cached thumbnail behind');

  let liveLocations = await service.request('get_data_locations');
  const cacheLocation = liveLocations.find((location) => location.slot === 'cache');
  assert(cacheLocation?.path, 'cache data location was not reported');
  const reclaimFixture = path.join(cacheLocation.path, 'modpacks', 'controlled-reclaim.bin');
  fs.mkdirSync(path.dirname(reclaimFixture), { recursive: true });
  fs.writeFileSync(reclaimFixture, Buffer.alloc(8192, 0x45));
  const storageReport = await service.request('scan_storage', { force: true });
  assert(
    storageReport.reclaimable.some(
      (entry) => entry.id === 'cache-modpacks' && Number(entry.bytes) >= 8192,
    ),
    'storage scan did not identify the controlled reclaimable cache',
  );
  assert(
    serviceEvents.some(
      (message) =>
        message.event === 'task:update' &&
        message.payload?.kind === 'storage_scan' &&
        message.payload?.state === 'succeeded',
    ),
    'storage scan did not publish a succeeded task',
  );
  const reclaimed = await service.request('reclaim_storage', { targets: ['cache-modpacks'] });
  assert(reclaimed.cleared.includes('cache-modpacks'), 'storage reclaim did not confirm the cache target');
  assert(Number(reclaimed.freed_bytes) >= 8192, 'storage reclaim underreported controlled bytes');
  assert(!fs.existsSync(reclaimFixture), 'storage reclaim left the controlled cache file behind');
  await assert.rejects(
    service.request('reclaim_storage', { targets: [] }),
    /nothing was selected/i,
  );

  const relocatedCache = path.join(temporaryRoot, 'relocated-cache');
  const locationCandidate = await service.request('inspect_data_location', {
    slot: 'cache',
    path: relocatedCache,
  });
  assert(locationCandidate.usable && !locationCandidate.occupied, 'valid data location was rejected');
  const relativeCandidate = await service.request('inspect_data_location', {
    slot: 'cache',
    path: 'relative-cache-path',
  });
  assert(!relativeCandidate.usable && /full path/i.test(relativeCandidate.problem), 'relative data path was accepted');
  const locationMarkerName = 'controlled-location-move.bin';
  fs.writeFileSync(path.join(cacheLocation.path, locationMarkerName), 'move contract bytes');
  await service.request('set_data_location', {
    slot: 'cache',
    path: relocatedCache,
    moveExisting: true,
  });
  liveLocations = await service.request('get_data_locations');
  assert.equal(
    path.resolve(liveLocations.find((location) => location.slot === 'cache')?.path || ''),
    path.resolve(relocatedCache),
    'custom cache location was not adopted',
  );
  assert(
    fs.existsSync(path.join(relocatedCache, locationMarkerName)),
    'data-location move did not preserve the controlled marker',
  );
  assert(
    serviceEvents.some(
      (message) =>
        message.event === 'task:update' &&
        message.payload?.kind === 'data_move' &&
        message.payload?.state === 'succeeded',
    ),
    'data-location move did not publish a succeeded task',
  );
  await service.request('set_data_location', {
    slot: 'cache',
    path: null,
    moveExisting: true,
  });
  liveLocations = await service.request('get_data_locations');
  const restoredCacheLocation = liveLocations.find((location) => location.slot === 'cache');
  assert.equal(path.resolve(restoredCacheLocation.path), path.resolve(cacheLocation.default_path));
  assert.equal(restoredCacheLocation.custom, false, 'cache location did not return to its default');
  assert(
    fs.existsSync(path.join(restoredCacheLocation.path, locationMarkerName)),
    'returning to the default data location lost the controlled marker',
  );

  assert.equal(
    await service.request('pack_export_name', { name: 'Enderloom: QA / Pack', format: 'mrpack' }),
    'Enderloom- QA - Pack.mrpack',
    'pack export name was not sanitized predictably',
  );
  const packExportPath = path.join(temporaryRoot, 'controlled-export.mrpack');
  fs.writeFileSync(packExportPath, 'prior export bytes must be replaceable');
  const packExport = await service.request('export_instance_pack', {
    instanceId: created.id,
    format: 'mrpack',
    path: packExportPath,
  }, { timeoutMs: 120000 });
  assert.equal(packExport.path, packExportPath, 'pack export returned the wrong destination');
  assert(fs.statSync(packExportPath).size > 100, 'pack export did not replace the prior destination');
  assert(
    !fs.readdirSync(temporaryRoot).some((name) => /^\.enderloom-export-/.test(name)),
    'successful pack export left staging or recovery files behind',
  );
  const packPreview = await service.request('inspect_pack_file', { path: packExportPath });
  assert.equal(packPreview.format, 'mrpack', 'exported Modrinth pack was not recognized');
  assert.equal(packPreview.game_version, created.version_id, 'pack preview lost the Minecraft version');
  assert(packPreview.importable, 'controlled exported pack was marked unimportable');
  await assert.rejects(
    service.request('inspect_packwiz_url', { url: 'file:///not-allowed/pack.toml' }),
    /http or https/i,
  );
  const importedPack = await service.request('import_pack_file', {
    path: packExportPath,
    name: 'Enderloom controlled import cancellation',
  }, { timeoutMs: 120000 });
  assert(importedPack?.id && fs.existsSync(importedPack.dir), 'pack import did not stage an instance');
  let packImportTask = (await service.request('list_tasks')).find(
    (task) => task.instance_id === importedPack.id && task.kind === 'modpack_install',
  );
  assert(packImportTask?.id, 'pack import did not publish its task before background work');
  assert.equal(
    await service.request('cancel_task', { taskId: packImportTask.id }),
    true,
    'pack import task could not be cancelled',
  );
  for (let attempt = 0; attempt < 80; attempt += 1) {
    packImportTask = (await service.request('list_tasks')).find((task) => task.id === packImportTask.id);
    if (packImportTask?.state === 'cancelled') break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.equal(packImportTask?.state, 'cancelled', 'cancelled pack import had no terminal task state');
  assert(
    !(await service.request('list_instances')).some((instance) => instance.id === importedPack.id),
    'cancelled pack import left a ghost instance in the database',
  );
  assert(!fs.existsSync(importedPack.dir), 'cancelled pack import left a partial instance folder');

  const modpackProjectId = 'fabulously-optimized';
  const modpackVersions = (await service.request('list_project_versions', {
    provider: 'modrinth',
    projectId: modpackProjectId,
    kind: 'modpacks',
    gameVersion: '',
    loader: null,
  })).filter((version) => version.files?.some((file) => file.url));
  assert(modpackVersions.length >= 2, 'real Modrinth pack did not expose two downloadable versions');
  const sortedModpackVersions = [...modpackVersions].sort((left, right) => left.date.localeCompare(right.date));
  const baselinePackVersion = sortedModpackVersions[sortedModpackVersions.length - 2];
  const targetPackVersion = sortedModpackVersions[sortedModpackVersions.length - 1];
  const packCommandBase = {
    provider: 'modrinth',
    projectId: modpackProjectId,
    manualDownloads: [],
    downloadsDir: temporaryRoot,
  };
  const modpackInstallPlan = await service.request('plan_modpack_install', {
    ...packCommandBase,
    versionId: baselinePackVersion.id,
  }, { timeoutMs: 120000 });
  assert.deepEqual(modpackInstallPlan.manual_downloads, [],
    'downloadable Modrinth pack incorrectly requested manual files');

  const linkedPackInstance = await service.request('link_modpack', {
    instanceId: created.id,
    provider: 'modrinth',
    projectId: modpackProjectId,
    versionId: baselinePackVersion.id,
    downloadsDir: temporaryRoot,
  }, { timeoutMs: 120000 });
  assert.equal(linkedPackInstance.pack_project_id, modpackProjectId, 'modpack link lost its project identity');
  assert.equal(linkedPackInstance.pack_version_id, baselinePackVersion.id, 'modpack link lost its version identity');
  assert(fs.existsSync(path.join(created.dir, '.basalt', 'pack-state.json')),
    'modpack link did not persist its upgrade baseline');
  const linkedInstanceBeforeUpgrade = treeFingerprint(created.dir);
  const modpackUpgradePlan = await service.request('plan_modpack_upgrade', {
    instanceId: created.id,
    targetVersionId: targetPackVersion.id,
    manualDownloads: [],
    downloadsDir: temporaryRoot,
  }, { timeoutMs: 120000 });
  assert.equal(modpackUpgradePlan.update.target_version_id, targetPackVersion.id,
    'modpack upgrade plan selected the wrong target');
  assert(modpackUpgradePlan.changes && Array.isArray(modpackUpgradePlan.changes.added),
    'modpack upgrade plan did not calculate file changes');

  const upgradeResultPromise = service.request('upgrade_modpack', {
    instanceId: created.id,
    targetVersionId: targetPackVersion.id,
    manualDownloads: [],
    snapshotFirst: false,
    downloadsDir: temporaryRoot,
  }, { timeoutMs: 120000 }).then(
    (result) => ({ ok: true, result }),
    (error) => ({ ok: false, error }),
  );
  let modpackUpgradeTask = null;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    modpackUpgradeTask = (await service.request('list_tasks')).find(
      (task) => task.instance_id === created.id && task.kind === 'modpack_upgrade' && task.state === 'running',
    );
    if (modpackUpgradeTask?.id) break;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  assert(modpackUpgradeTask?.id, 'modpack upgrade did not publish its cancellable task');
  assert.equal(await service.request('cancel_task', { taskId: modpackUpgradeTask.id }), true,
    'modpack upgrade task could not be cancelled');
  const upgradeResult = await upgradeResultPromise;
  assert.equal(upgradeResult.ok, false, 'cancelled modpack upgrade incorrectly succeeded');
  assert.match(String(upgradeResult.error?.message || ''), /cancel/i);
  const afterCancelledUpgrade = (await service.request('list_instances')).find((entry) => entry.id === created.id);
  assert.equal(afterCancelledUpgrade.pack_version_id, baselinePackVersion.id,
    'cancelled modpack upgrade changed the installed pack version');
  assert.equal(treeFingerprint(created.dir), linkedInstanceBeforeUpgrade,
    'cancelled modpack upgrade changed controlled instance bytes');
  assert(
    !fs.readdirSync(path.dirname(created.dir)).some((name) =>
      name.startsWith(`.upgrade-${created.id}-`) || name.startsWith(`.upgrade-backup-${created.id}-`)),
    'cancelled modpack upgrade left staging or backup folders',
  );

  const installResultPromise = service.request('install_modpack', {
    ...packCommandBase,
    versionId: targetPackVersion.id,
  }, { timeoutMs: 120000 }).then(
    (result) => ({ ok: true, result }),
    (error) => ({ ok: false, error }),
  );
  let modpackInstallTask = null;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    modpackInstallTask = (await service.request('list_tasks')).find(
      (task) => task.project_id === modpackProjectId && task.kind === 'modpack_install' && task.state === 'running',
    );
    if (modpackInstallTask?.id) break;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  assert(modpackInstallTask?.id, 'modpack install did not publish its cancellable task');
  assert.equal(await service.request('cancel_task', { taskId: modpackInstallTask.id }), true,
    'modpack install task could not be cancelled');
  const installResult = await installResultPromise;
  assert.equal(installResult.ok, false, 'cancelled modpack install incorrectly succeeded');
  assert.match(String(installResult.error?.message || ''), /cancel/i);
  assert(
    !(await service.request('list_instances')).some(
      (instance) => instance.id !== created.id && instance.pack_project_id === modpackProjectId,
    ),
    'cancelled modpack install left a ghost instance',
  );
  const unlinkedPackInstance = await service.request('unlink_modpack', { instanceId: created.id });
  assert.equal(unlinkedPackInstance.pack_provider, null, 'modpack unlink left provider metadata');
  assert.equal(unlinkedPackInstance.pack_project_id, null, 'modpack unlink left project metadata');
  assert.equal(unlinkedPackInstance.pack_version_id, null, 'modpack unlink left version metadata');

  await assert.rejects(
    service.request('create_server', {
      name: 'EULA rejection contract',
      flavor: 'fabric',
      versionId: '1.20.1',
      flavorVersion: fabricVersions[0],
      acceptEula: false,
    }),
    /eula.*accepted/i,
  );
  const managedServer = await service.request('create_server', {
    name: 'Enderloom controlled Fabric server',
    flavor: 'fabric',
    versionId: '1.20.1',
    flavorVersion: fabricVersions[0],
    acceptEula: true,
  });
  assert(managedServer?.id && managedServer.managed, 'managed server was not created');
  assert(fs.existsSync(path.join(managedServer.dir, 'eula.txt')), 'accepted EULA was not persisted');
  assert(
    (await service.request('list_servers')).some((server) => server.id === managedServer.id),
    'managed server was not listed',
  );
  const updatedManagedServer = await service.request('update_server_settings', {
    serverId: managedServer.id,
    name: 'Enderloom controlled Fabric server updated',
    versionId: managedServer.version_id,
    flavorVersion: managedServer.flavor_version,
    minMemoryMb: 1024,
    maxMemoryMb: 2048,
    javaPath: null,
    jvmArgs: '-Denderloom.qa=true',
    jvmArgsMode: 'append',
    stopTimeoutSecs: 18,
    notes: 'Controlled server settings acceptance fixture',
  });
  assert.equal(updatedManagedServer.name, 'Enderloom controlled Fabric server updated');
  assert.equal(updatedManagedServer.min_memory_mb, 1024);
  assert.equal(updatedManagedServer.max_memory_mb, 2048);
  assert.equal(updatedManagedServer.stop_timeout_secs, 18);
  assert.equal(updatedManagedServer.notes, 'Controlled server settings acceptance fixture');
  const configuredProperties = await service.request('set_server_properties', {
    serverId: managedServer.id,
    changes: [
      { key: 'server-port', value: '25571' },
      { key: 'motd', value: 'Enderloom controlled server' },
      { key: 'max-players', value: '12' },
    ],
    removed: [],
  });
  assert(
    configuredProperties.some((property) => property.key === 'server-port' && property.value === '25571'),
    'server properties were not written',
  );
  await service.request('set_server_whitelist', { serverId: managedServer.id, enabled: true });
  const refreshedProperties = await service.request('get_server_properties', {
    serverId: managedServer.id,
  });
  assert(
    refreshedProperties.some((property) => property.key === 'white-list' && property.value === 'true'),
    'server whitelist setting was not persisted',
  );
  assert(
    Number(await service.request('get_server_disk_usage', { serverId: managedServer.id })) > 0,
    'server disk usage was not measured',
  );
  const serverRootFiles = await service.request('list_server_files', {
    serverId: managedServer.id,
    path: '',
  });
  assert(serverRootFiles.some((entry) => entry.name === 'server.properties'), 'server file browser missed properties');
  const serverPropertiesText = await service.request('read_server_file', {
    serverId: managedServer.id,
    path: 'server.properties',
  });
  assert(serverPropertiesText.text.includes('server-port=25571'), 'server text reader lost properties');
  assert(
    (await service.request('check_server_file', { path: 'broken.json', text: '{not-json' }))?.message,
    'server editor accepted invalid JSON',
  );
  assert.equal(
    await service.request('write_server_file', {
      serverId: managedServer.id,
      path: 'whitelist.json',
      text: JSON.stringify([{ uuid: '12345678-1234-1234-1234-123456789abc', name: 'EnderloomQA' }]),
    }),
    null,
    'valid player-list JSON was rejected',
  );
  const whitelistPlayers = await service.request('list_server_players', {
    serverId: managedServer.id,
    list: 'whitelist',
  });
  assert(whitelistPlayers.some((player) => player.name === 'EnderloomQA'), 'server player list was not parsed');
  await service.request('remove_server_player', {
    serverId: managedServer.id,
    list: 'whitelist',
    name: 'EnderloomQA',
  });
  assert(
    !(await service.request('list_server_players', {
      serverId: managedServer.id,
      list: 'whitelist',
    })).some((player) => player.name === 'EnderloomQA'),
    'offline server player removal was not persisted',
  );
  const createdServerFolder = await service.request('create_server_folder', {
    serverId: managedServer.id,
    path: '',
    name: 'controlled-config',
  });
  assert.equal(createdServerFolder, 'controlled-config');
  const serverUploadSource = path.join(temporaryRoot, 'controlled-server-note.txt');
  fs.writeFileSync(serverUploadSource, 'Enderloom server file contract');
  assert.equal(
    await service.request('upload_server_files', {
      serverId: managedServer.id,
      path: createdServerFolder,
      sources: [serverUploadSource],
    }),
    1,
    'server file upload failed',
  );
  const renamedServerFile = await service.request('rename_server_entry', {
    serverId: managedServer.id,
    path: `${createdServerFolder}/${path.basename(serverUploadSource)}`,
    name: 'renamed-note.txt',
  });
  assert.equal(renamedServerFile, 'controlled-config/renamed-note.txt');
  assert.equal(
    (await service.request('read_server_file', {
      serverId: managedServer.id,
      path: renamedServerFile,
    })).text,
    'Enderloom server file contract',
  );
  await assert.rejects(
    service.request('read_server_file', { serverId: managedServer.id, path: '../outside.txt' }),
    /outside this server folder/i,
  );
  await service.request('delete_server_entry', { serverId: managedServer.id, path: renamedServerFile });
  await service.request('delete_server_entry', { serverId: managedServer.id, path: createdServerFolder });

  const looseServerMod = path.join(temporaryRoot, 'controlled-server-mod.jar');
  fs.writeFileSync(looseServerMod, 'controlled server mod bytes');
  assert.equal(
    await service.request('add_server_content', {
      serverId: managedServer.id,
      sources: [looseServerMod],
    }),
    1,
    'server content add failed',
  );
  assert(
    (await service.request('list_server_content', { serverId: managedServer.id, reconcile: false }))
      .some((item) => item.file_name === path.basename(looseServerMod) && item.enabled),
    'server content organizer did not list the controlled mod',
  );
  assert.equal(
    await service.request('toggle_server_content', {
      serverId: managedServer.id,
      fileName: path.basename(looseServerMod),
    }),
    false,
    'server content toggle did not disable the controlled mod',
  );
  await service.request('toggle_server_content', {
    serverId: managedServer.id,
    fileName: path.basename(looseServerMod),
  });
  const serverRemovalPlan = await service.request('plan_server_content_removal', {
    serverId: managedServer.id,
    fileName: path.basename(looseServerMod),
  });
  assert(
    Array.isArray(serverRemovalPlan.dependents) && Array.isArray(serverRemovalPlan.orphans),
    'server content removal plan was malformed',
  );
  await service.request('delete_server_content', {
    serverId: managedServer.id,
    fileName: path.basename(looseServerMod),
  });
  assert.equal(
    await service.request('get_server_script_memory', { serverId: managedServer.id }),
    null,
    'server without a launch script reported script memory',
  );
  await assert.rejects(
    service.request('apply_server_script_memory', { serverId: managedServer.id }),
    /does not have a modpack compatibility script/i,
  );
  assert.equal(
    (await service.request('check_server_pack_update', { serverId: managedServer.id })),
    null,
    'unlinked server reported a modpack update',
  );
  assert.deepEqual(await service.request('get_server_console', { serverId: managedServer.id }), []);
  assert.deepEqual(await service.request('list_running_servers'), []);
  await assert.rejects(
    service.request('get_server_launch_command', { serverId: managedServer.id }),
    /install|launch/i,
  );
  const serverRescan = await service.request('rescan_server', { serverId: managedServer.id });
  assert.equal(serverRescan.launch_ready, false, 'uninstalled server was incorrectly marked launch-ready');

  const externalServerDir = path.join(temporaryRoot, 'external-server');
  fs.mkdirSync(externalServerDir, { recursive: true });
  fs.writeFileSync(path.join(externalServerDir, 'eula.txt'), 'eula=true\n');
  fs.writeFileSync(path.join(externalServerDir, 'server.properties'), 'server-port=25572\nmotd=External QA\n');
  const externalServerBefore = treeFingerprint(externalServerDir);
  const externalServerInspection = await service.request('inspect_server_folder', {
    path: externalServerDir,
  });
  assert(externalServerInspection.eula_accepted, 'external server inspection missed its EULA');
  const importedServer = await service.request('import_server', {
    path: externalServerDir,
    name: 'Enderloom external server',
    flavor: 'fabric',
    versionId: '1.20.1',
    flavorVersion: fabricVersions[0],
    acceptEula: true,
  });
  assert.equal(importedServer.managed, false, 'external server was incorrectly claimed as managed');
  assert.equal(
    path.resolve(importedServer.dir).replace(/^\\\\\?\\/, '').toLowerCase(),
    path.resolve(externalServerDir).replace(/^\\\\\?\\/, '').toLowerCase(),
  );
  assert.equal(treeFingerprint(externalServerDir), externalServerBefore, 'server import changed external files');

  const nativeServerDir = path.join(temporaryRoot, 'controlled-native-server');
  fs.mkdirSync(nativeServerDir, { recursive: true });
  const controlledInteractiveProgram = path.join(
    process.env.SystemRoot || 'C:\\Windows',
    'System32',
    'WindowsPowerShell',
    'v1.0',
    'powershell.exe',
  );
  assert(fs.existsSync(controlledInteractiveProgram), 'controlled Windows interactive process is unavailable');
  fs.copyFileSync(controlledInteractiveProgram, path.join(nativeServerDir, 'pumpkin.exe'));
  fs.writeFileSync(
    path.join(nativeServerDir, 'pumpkin.toml'),
    '[networking.java]\naddress = "127.0.0.1:25579"\n',
  );
  fs.writeFileSync(path.join(nativeServerDir, 'eula.txt'), 'eula=true\n');
  const nativeServerBefore = treeFingerprint(nativeServerDir);
  const nativeServer = await service.request('import_server', {
    path: nativeServerDir,
    name: 'Enderloom controlled native process server',
    flavor: 'pumpkin',
    versionId: '1.20.1',
    flavorVersion: 'qa-native',
    acceptEula: true,
  });
  assert.equal(nativeServer.launch_jar, 'pumpkin.exe', 'native server executable was not detected');
  await service.request('update_server_settings', {
    serverId: nativeServer.id,
    name: nativeServer.name,
    versionId: nativeServer.version_id,
    flavorVersion: nativeServer.flavor_version,
    minMemoryMb: null,
    maxMemoryMb: null,
    javaPath: null,
    jvmArgs: null,
    jvmArgsMode: null,
    stopTimeoutSecs: 5,
    notes: 'Controlled native server process fixture',
  });
  const firstServerRun = await service.request('start_server', { serverId: nativeServer.id });
  assert(firstServerRun?.running_id && firstServerRun.state === 'running', 'native server did not start');
  await service.request('send_server_command', {
    serverId: nativeServer.id,
    line: 'Write-Output enderloom-server-ipc',
  });
  let nativeServerConsole = [];
  for (let attempt = 0; attempt < 50; attempt += 1) {
    nativeServerConsole = await service.request('get_server_console', { serverId: nativeServer.id });
    if (nativeServerConsole.some((line) => /enderloom-server-ipc/i.test(line.line))) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert(
    nativeServerConsole.some((line) => /enderloom-server-ipc/i.test(line.line)),
    'native server console did not stream through IPC',
  );
  const restartedServerRun = await service.request(
    'restart_server',
    { serverId: nativeServer.id },
    { timeoutMs: 30000 },
  );
  assert.equal(restartedServerRun.state, 'running', 'native server did not restart');
  assert.notEqual(restartedServerRun.running_id, firstServerRun.running_id,
    'server restart reused a stale process identity');

  const serverInstallResultPromise = service.request(
    'install_server',
    { serverId: managedServer.id },
    { timeoutMs: 120000 },
  ).then(
    (result) => ({ ok: true, result }),
    (error) => ({ ok: false, error }),
  );
  let serverInstallTask = null;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    serverInstallTask = (await service.request('list_tasks')).find(
      (task) => task.server_id === managedServer.id && task.kind === 'server_install',
    );
    if (serverInstallTask?.id) break;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  assert(serverInstallTask?.id, 'server install did not publish its cancellable task');
  assert.equal(
    await service.request('cancel_task', { taskId: serverInstallTask.id }),
    true,
    'server install task could not be cancelled',
  );
  const serverInstallResult = await serverInstallResultPromise;
  assert.equal(serverInstallResult.ok, false, 'cancelled server install incorrectly succeeded');
  assert.match(String(serverInstallResult.error?.message || ''), /cancel/i);
  for (let attempt = 0; attempt < 80; attempt += 1) {
    serverInstallTask = (await service.request('list_tasks')).find((task) => task.id === serverInstallTask.id);
    if (serverInstallTask?.state === 'cancelled') break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.equal(serverInstallTask?.state, 'cancelled', 'cancelled server install had no terminal task state');
  const cancelledInstallServer = (await service.request('list_servers'))
    .find((server) => server.id === managedServer.id);
  assert(cancelledInstallServer && cancelledInstallServer.installed_at === null,
    'cancelled server install published installed metadata');

  await assert.rejects(
    service.request('delete_server', { serverId: importedServer.id, deleteFiles: true }),
    /does not own this folder/i,
  );
  assert.equal(treeFingerprint(externalServerDir), externalServerBefore,
    'rejected external server deletion changed its files');
  await service.request('delete_server', { serverId: importedServer.id, deleteFiles: false });
  assert(fs.existsSync(externalServerDir), 'disconnecting an external server deleted its folder');
  assert.equal(treeFingerprint(externalServerDir), externalServerBefore,
    'disconnecting an external server changed its files');
  assert(
    !(await service.request('list_servers')).some((server) => server.id === importedServer.id),
    'disconnected external server remained in the database',
  );

  await service.request('delete_server', { serverId: managedServer.id, deleteFiles: true });
  assert(!fs.existsSync(managedServer.dir), 'managed server deletion left its live folder behind');
  assert(
    !(await service.request('list_servers')).some((server) => server.id === managedServer.id),
    'deleted managed server remained in the database',
  );
  assert(
    !fs.readdirSync(path.dirname(managedServer.dir)).some((name) => /^\.delete-server-(?:pending|committed)-/.test(name)),
    'managed server deletion left a quarantine folder behind',
  );

  const serverPackSourceBefore = hashFile(packExportPath);
  await assert.rejects(
    service.request('install_server_zip', {
      name: 'Unsafe server pack name rejection',
      url: null,
      localPath: packExportPath,
      fileName: '../unsafe-server-pack.zip',
      sha1: null,
      size: null,
      gameVersion: created.version_id,
      provider: '',
      projectId: '',
      packVersionId: '',
    }),
    /file name is not safe/i,
  );
  assert(
    !fs.readdirSync(path.dirname(managedServer.dir)).some((name) => /^\.server-pack-pending-/.test(name)),
    'rejected server pack left a staging folder behind',
  );
  const installedZipServer = await service.request('install_server_zip', {
    name: 'Enderloom controlled local ZIP server',
    url: null,
    localPath: packExportPath,
    fileName: path.basename(packExportPath),
    sha1: null,
    size: fs.statSync(packExportPath).size,
    gameVersion: created.version_id,
    provider: '',
    projectId: '',
    packVersionId: '',
  }, { timeoutMs: 120000 });
  assert(installedZipServer?.managed && fs.existsSync(installedZipServer.dir),
    'local server ZIP was not installed into a managed server');
  assert.equal(installedZipServer.version_id, created.version_id,
    'local server ZIP lost its selected Minecraft version');
  assert.equal(installedZipServer.import_source, 'zip', 'local server ZIP provenance was not recorded');
  assert(fs.existsSync(path.join(installedZipServer.dir, 'eula.txt')),
    'local server ZIP did not persist explicit EULA acceptance');
  assert.equal(hashFile(packExportPath), serverPackSourceBefore,
    'local server ZIP installation changed its source archive');
  assert(
    serviceEvents.some(
      (message) => message.event === 'task:update' &&
        message.payload?.kind === 'server_install' &&
        message.payload?.state === 'succeeded' &&
        message.payload?.title === 'Enderloom controlled local ZIP server',
    ),
    'local server ZIP did not publish a succeeded install task',
  );
  await service.request('delete_server', { serverId: installedZipServer.id, deleteFiles: true });
  assert(!fs.existsSync(installedZipServer.dir), 'local server ZIP cleanup left its managed folder');
  assert(
    !fs.readdirSync(path.dirname(managedServer.dir)).some((name) => /^\.server-pack-pending-/.test(name)),
    'local server ZIP install left a staging folder behind',
  );

  const about = await service.request('get_about_links');
  assert.equal(about.repository, 'https://github.com/Herbertofury/Enderloom');
  const inspected = await service.request('inspect_paths', { paths: [created.dir] });
  assert.deepEqual(inspected, [{ path: created.dir, directory: true, usable: true }]);

  const modded = await service.request('create_instance', {
    name: 'Enderloom provider-install QA',
    versionId: '1.20.1',
    loader: 'fabric',
    loaderVersion: fabricVersions[0],
  });
  const sodiumVersions = await service.request('list_project_versions', {
    provider: 'modrinth',
    projectId: 'sodium',
    kind: 'mods',
    gameVersion: '1.20.1',
    loader: 'fabric',
  });
  assert(sodiumVersions.length >= 2, 'Sodium did not expose enough versions for update QA');
  const olderSodiumVersion = sodiumVersions[sodiumVersions.length - 1];
  const installArgs = {
    provider: 'modrinth',
    projectId: 'sodium',
    instanceId: modded.id,
    kind: 'mods',
    gameVersion: '1.20.1',
    loader: 'fabric',
    versionId: olderSodiumVersion.id,
    withDependencies: true,
  };
  const installPlan = await service.request('plan_content_install', installArgs, { timeoutMs: 120000 });
  assert(installPlan?.primary?.file_name?.endsWith('.jar'), 'Modrinth dependency planning did not resolve Sodium');
  const installedContent = await service.request('install_content', installArgs, { timeoutMs: 240000 });
  assert(installedContent.some((item) => item.file_name.endsWith('.jar')), 'planned Modrinth content was not installed');
  const listedContent = await service.request('list_instance_content', {
    instanceId: modded.id,
    kind: 'mods',
    reconcile: false,
  });
  assert(
    listedContent.some((item) => item.source?.project_id === installPlan.primary.project_id),
    'installed provider metadata was not persisted with the managed file',
  );
  const installTaskEvents = serviceEvents
    .filter((message) => message.event === 'task:update' && message.payload?.instance_id === modded.id)
    .map((message) => message.payload);
  assert(installTaskEvents.some((task) => task.state === 'running'), 'IPC did not emit a running install task');
  assert(installTaskEvents.some((task) => task.state === 'succeeded'), 'IPC did not emit a succeeded install task');
  const contentUpdates = await service.request('check_content_updates', {
    instanceId: modded.id,
    force: true,
  }, { timeoutMs: 120000 });
  const sodiumUpdate = contentUpdates.find(
    (update) => update.kind === 'mods' && update.file_name === installPlan.primary.file_name,
  );
  assert(sodiumUpdate?.latest_version_id, 'older controlled Sodium install did not produce an update');
  assert.equal(
    await service.request('plan_content_update', {
      instanceId: modded.id,
      kind: 'mods',
      fileName: installPlan.primary.file_name,
    }),
    null,
    'downloadable Modrinth update was incorrectly marked as a manual download',
  );
  const updatedContentName = await service.request('apply_content_update', {
    instanceId: modded.id,
    kind: 'mods',
    fileName: installPlan.primary.file_name,
    manualDownloads: [],
    downloadsDir: temporaryRoot,
  }, { timeoutMs: 240000 });
  assert(
    fs.existsSync(path.join(modded.dir, 'mods', updatedContentName)),
    'content update did not publish the updated mod file',
  );
  if (updatedContentName !== installPlan.primary.file_name) {
    assert(
      !fs.existsSync(path.join(modded.dir, 'mods', installPlan.primary.file_name)),
      'content update left the superseded mod file installed',
    );
  }
  const contentAfterUpdate = await service.request('list_instance_content', {
    instanceId: modded.id,
    kind: 'mods',
    reconcile: false,
  });
  assert(
    contentAfterUpdate.some(
      (item) =>
        item.file_name === updatedContentName &&
        item.source?.version_id === sodiumUpdate.latest_version_id,
    ),
    'updated provider metadata was not committed with the new file',
  );

  const syntheticBeforeConnect = treeFingerprint(syntheticCurseForgeRoot);
  const syntheticScan = await service.request('scan_launcher', {
    kind: 'curseforge',
    root: syntheticCurseForgeRoot,
  });
  assert.equal(syntheticScan.candidates.length, 1, 'synthetic CurseForge profile was not discovered');
  assert.equal(syntheticScan.candidates[0].importable, true, 'synthetic profile was not connectable');
  const connected = await service.request('connect_instances_in_place', {
    kind: 'curseforge',
    root: syntheticCurseForgeRoot,
    ids: [syntheticScan.candidates[0].id],
  });
  assert.equal(connected.connected.length, 1, 'synthetic profile was not connected in place');
  assert.equal(connected.failed.length, 0, 'synthetic in-place connection reported a failure');
  assert.equal(
    treeFingerprint(syntheticCurseForgeRoot),
    syntheticBeforeConnect,
    'connecting in place changed the external profile',
  );
  const connectedId = connected.connected[0];
  let connectedInstance = (await service.request('list_instances')).find((entry) => entry.id === connectedId);
  assert.equal(path.resolve(connectedInstance?.dir || ''), path.resolve(syntheticProfile));
  assert.equal(connectedInstance?.external, true, 'connected instance was not identified as external');
  assert.equal(connectedInstance?.available, true, 'connected profile was not reported as available');
  const localName = 'Enderloom local profile alias';
  const localNotes = 'Local Enderloom notes must survive launcher reconciliation.';
  connectedInstance = await service.request('update_instance', {
    instanceId: connectedId,
    name: localName,
    minMemoryMb: null,
    maxMemoryMb: null,
    javaPath: null,
    loader: connectedInstance.loader,
    loaderVersion: connectedInstance.loader_version,
    versionId: connectedInstance.version_id,
    jvmArgs: null,
    jvmArgsMode: null,
    envVars: null,
    envVarsMode: null,
  });
  await service.request('set_instance_notes', { instanceId: connectedId, notes: localNotes });
  const localGroup = await service.request('create_instance_group', { name: 'Connected profiles' });
  await service.request('move_instance_to_group', { instanceId: connectedId, groupId: localGroup.id });
  const connectedMods = await service.request('list_instance_content', {
    instanceId: connectedId,
    kind: 'mods',
    reconcile: false,
  });
  assert(connectedMods.some((entry) => entry.file_name === 'fixture.jar'), 'connected profile content was not listed in place');

  const looseMod = path.join(temporaryRoot, 'added-in-place.jar');
  fs.writeFileSync(looseMod, 'added through Enderloom IPC');
  await service.request('add_instance_content', {
    instanceId: connectedId,
    kind: 'mods',
    sources: [looseMod],
  });
  assert(
    fs.existsSync(path.join(syntheticProfile, 'mods', path.basename(looseMod))),
    'content management did not write through to the connected profile',
  );

  const updatedManifest = path.join(syntheticProfile, 'minecraftinstance.json');
  const updatedMetadata = JSON.parse(fs.readFileSync(updatedManifest, 'utf8'));
  updatedMetadata.gameVersion = '1.20.2';
  updatedMetadata.baseModLoader = { name: 'fabric-loader-0.16.15' };
  fs.writeFileSync(updatedManifest, JSON.stringify(updatedMetadata));
  const movedProfile = path.join(syntheticCurseForgeRoot, 'Instances', 'synthetic-profile-moved');
  fs.renameSync(syntheticProfile, movedProfile);
  syntheticProfile = movedProfile;

  const reconciliation = await service.request('reconcile_external_instances');
  assert.equal(reconciliation.checked, 1, 'external reconciliation did not inspect the connection');
  assert.equal(reconciliation.refreshed, 1, 'external launcher changes were not refreshed');
  assert.equal(reconciliation.unavailable.length, 0, 'moved profile was incorrectly marked unavailable');
  assert.equal(reconciliation.conflicts.length, 0, 'moved profile caused a reconciliation conflict');
  const reconciliationChange = reconciliation.changes.find((entry) => entry.instance_id === connectedId);
  assert(reconciliationChange?.fields.includes('version'), 'version change was not reported');
  assert(reconciliationChange?.fields.includes('loader'), 'loader change was not reported');
  assert(reconciliationChange?.fields.includes('location'), 'profile move was not reported');
  connectedInstance = (await service.request('list_instances')).find((entry) => entry.id === connectedId);
  assert.equal(connectedInstance?.version_id, '1.20.2', 'external Minecraft version was not reconciled');
  assert.equal(path.resolve(connectedInstance?.dir || ''), path.resolve(syntheticProfile));
  assert.equal(connectedInstance?.name, localName, 'reconciliation overwrote the Enderloom-local name');
  assert.equal(connectedInstance?.notes, localNotes, 'reconciliation overwrote Enderloom-local notes');
  const reconciledOrganization = await service.request('get_instance_organization');
  assert(
    reconciledOrganization.placements.some(
      (placement) => placement.instance_id === connectedId && placement.group_id === localGroup.id,
    ),
    'reconciliation removed the Enderloom-local group placement',
  );
  const reconciledMods = await service.request('list_instance_content', {
    instanceId: connectedId,
    kind: 'mods',
    reconcile: false,
  });
  assert(
    reconciledMods.some((entry) => entry.file_name === path.basename(looseMod)),
    'moved profile lost capability-scoped content access after reconciliation',
  );

  const connectedRescan = await service.request('scan_launcher', {
    kind: 'curseforge',
    root: syntheticCurseForgeRoot,
  });
  assert.equal(connectedRescan.candidates[0].imported, true, 'connected profile was not recognized on rescan');
  assert.equal(connectedRescan.candidates[0].importable, false, 'connected profile could be connected twice');

  const aliasRoot = path.join(temporaryRoot, 'synthetic-curseforge-alias');
  const aliasProfile = path.join(aliasRoot, 'Instances', 'synthetic-linked');
  fs.mkdirSync(path.dirname(aliasProfile), { recursive: true });
  fs.symlinkSync(syntheticProfile, aliasProfile, process.platform === 'win32' ? 'junction' : 'dir');
  const aliasScan = await service.request('scan_launcher', { kind: 'curseforge', root: aliasRoot });
  assert.equal(aliasScan.candidates.length, 1, 'junction-backed profile was not scanned');
  assert.equal(aliasScan.candidates[0].imported, true, 'physical-path deduplication missed the launcher junction');
  assert(
    aliasScan.candidates[0].warnings.some((warning) => /already connected in place/i.test(warning)),
    'junction deduplication did not explain why the profile was unavailable',
  );
  const duplicateConnect = await service.request('connect_instances_in_place', {
    kind: 'curseforge',
    root: aliasRoot,
    ids: [aliasScan.candidates[0].id],
  });
  assert.equal(duplicateConnect.connected.length, 0, 'the same physical profile was connected twice');
  assert.equal(duplicateConnect.failed.length, 1, 'duplicate physical connection was not rejected');

  const syntheticBeforeClone = treeFingerprint(syntheticCurseForgeRoot);
  const cloned = await service.request('migrate_instances', {
    kind: 'curseforge',
    root: syntheticCurseForgeRoot,
    ids: [syntheticScan.candidates[0].id],
  }, { timeoutMs: 120000 });
  assert.equal(cloned.imported.length, 1, 'explicit CurseForge Clone did not create an instance');
  assert.equal(cloned.failed.length, 0, 'explicit CurseForge Clone reported a failure');
  const clonedInstance = (await service.request('list_instances')).find((entry) => entry.id === cloned.imported[0]);
  assert(
    path.resolve(clonedInstance?.dir || '').startsWith(path.resolve(dataDir) + path.sep),
    'Clone did not create an independent managed instance',
  );
  assert.notEqual(path.resolve(clonedInstance.dir), path.resolve(syntheticProfile));
  assert.equal(
    treeFingerprint(syntheticCurseForgeRoot),
    syntheticBeforeClone,
    'Clone modified the source launcher profile',
  );
  const cloneTaskEvents = serviceEvents
    .filter((message) => message.event === 'task:update' && message.payload?.kind === 'instance_import')
    .map((message) => message.payload);
  assert(cloneTaskEvents.some((task) => task.state === 'running'), 'Clone did not emit a running task');
  assert(cloneTaskEvents.some((task) => task.state === 'succeeded'), 'Clone did not emit a succeeded task');

  const supervisedRunningId = await service.request('qa_process_contract', {
    instanceId: created.id,
  });
  let supervisedLogs = [];
  for (let attempt = 0; attempt < 40; attempt += 1) {
    supervisedLogs = await service.request('get_logs', { runningId: supervisedRunningId });
    if (
      supervisedLogs.some((line) => line.stream === 'stdout' && /enderloom-ipc-stdout/.test(line.line)) &&
      supervisedLogs.some((line) => line.stream === 'stderr' && /enderloom-ipc-stderr/.test(line.line))
    ) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert(
    supervisedLogs.some((line) => line.stream === 'stdout' && /enderloom-ipc-stdout/.test(line.line)),
    'supervised process stdout was not available over IPC',
  );
  assert(
    supervisedLogs.some((line) => line.stream === 'stderr' && /enderloom-ipc-stderr/.test(line.line)),
    'supervised process stderr was not available over IPC',
  );
  assert(
    (await service.request('list_running')).some(
      (running) => running.running_id === supervisedRunningId && running.state === 'running',
    ),
    'supervised process was not listed as running',
  );

  await service.close();
  await waitForExit();
  service = new LauncherService({
    rootDir,
    dataDir,
    resourcesDir: rootDir,
    env: serviceEnvironment,
  });
  attachServiceEvents();
  await service.start();
  const restartedOrganization = await service.request('get_instance_organization');
  assert(restartedOrganization.favorites.includes(created.id), 'favorite was lost after service restart');
  assert(
    restartedOrganization.taggings.some(
      (entry) => entry.instance_id === created.id && entry.tag_id === organizerTag.id,
    ),
    'tag membership was lost after service restart',
  );
  assert(
    (await service.request('list_running')).some(
      (running) => running.running_id === supervisedRunningId && running.state === 'running',
    ),
    'native service restart did not recover the verified child process',
  );
  let recoveredServerRun = null;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    recoveredServerRun = (await service.request('list_running_servers'))
      .find((running) => running.running_id === restartedServerRun.running_id);
    if (recoveredServerRun?.state === 'running') break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.equal(recoveredServerRun?.state, 'running',
    'native service restart did not recover the supervised server process');
  await service.request('stop_server', { serverId: nativeServer.id }, { timeoutMs: 30000 });
  let nativeServerFinal = null;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    nativeServerFinal = (await service.request('list_running_servers'))
      .find((running) => running.running_id === restartedServerRun.running_id);
    if (nativeServerFinal && nativeServerFinal.state !== 'running' && nativeServerFinal.state !== 'stopping') break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert(nativeServerFinal && !['running', 'stopping'].includes(nativeServerFinal.state),
    'recovered server process did not stop safely');
  await service.request('delete_server', { serverId: nativeServer.id, deleteFiles: false });
  assert.equal(
    treeFingerprint(nativeServerDir),
    nativeServerBefore,
    `server supervision or disconnect changed the external native fixture: ${fs.readdirSync(nativeServerDir).sort().join(', ')}`,
  );
  await service.request('kill_instance', { runningId: supervisedRunningId });
  let supervisedFinal = null;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    supervisedFinal = (await service.request('list_running')).find(
      (running) => running.running_id === supervisedRunningId,
    );
    if (supervisedFinal && supervisedFinal.state !== 'running') break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert(supervisedFinal && supervisedFinal.state !== 'running', 'recovered process did not stop safely');
  await service.request('close_running', { runningId: supervisedRunningId });
  assert(
    !(await service.request('list_running')).some((running) => running.running_id === supervisedRunningId),
    'closed process remained in the running registry',
  );
  connectedInstance = (await service.request('list_instances')).find((entry) => entry.id === connectedId);
  assert.equal(
    path.resolve(connectedInstance?.dir || ''),
    path.resolve(syntheticProfile),
    'in-place profile mapping did not survive a native service restart',
  );
  const restartedMods = await service.request('list_instance_content', {
    instanceId: connectedId,
    kind: 'mods',
    reconcile: false,
  });
  assert(
    restartedMods.some((entry) => entry.file_name === path.basename(looseMod)),
    'restarted service did not retain capability-scoped access to the connected profile',
  );
  const syntheticBeforeDisconnect = treeFingerprint(syntheticCurseForgeRoot);
  await service.request('disconnect_external_instance', { instanceId: connectedId });
  assert.equal(
    treeFingerprint(syntheticCurseForgeRoot),
    syntheticBeforeDisconnect,
    'disconnecting changed the external launcher profile',
  );
  assert(
    !(await service.request('list_instances')).some((entry) => entry.id === connectedId),
    'disconnected instance remained in Enderloom',
  );

  const detected = await service.request('detect_launchers');
  assert(Array.isArray(detected), 'launcher detection did not return a list');
  const sources = detected.filter((source) => ['modrinth', 'curseforge'].includes(source.kind));
  assert(sources.some((source) => source.kind === 'modrinth'), 'installed Modrinth library was not detected');
  assert(sources.some((source) => source.kind === 'curseforge'), 'installed CurseForge library was not detected');

  const summaries = [];
  for (const source of sources) {
    const before = fingerprint(source);
    const scan = await service.request('scan_launcher', { kind: source.kind, root: source.root });
    const serializedBytes = Buffer.byteLength(JSON.stringify(scan), 'utf8');
    assert(serializedBytes < 8 * 1024 * 1024, `${source.kind} scan crossed the IPC response limit`);
    assert(Array.isArray(scan.candidates), `${source.kind} scan has no candidate list`);
    const inlineMediaBytes = scan.candidates.reduce(
      (total, candidate) => total + Buffer.byteLength(candidate.icon_data_url || '', 'utf8'),
      0,
    );
    assert(inlineMediaBytes <= 2 * 1024 * 1024, `${source.kind} scan media was not bounded`);
    assert(
      scan.candidates.every((candidate) => Buffer.byteLength(candidate.icon_data_url || '', 'utf8') <= 256 * 1024),
      `${source.kind} scan retained an oversized inline icon`,
    );
    const after = fingerprint(source);
    assert.equal(after, before, `${source.kind} source inputs changed during a read-only scan`);
    summaries.push({
      kind: source.kind,
      detected: Number(source.instance_count) || 0,
      scanned: scan.candidates.length,
      importable: scan.candidates.filter((candidate) => candidate.importable).length,
      unavailable: scan.candidates.filter((candidate) => !candidate.importable).length,
      inlineMediaBytes,
      responseBytes: serializedBytes,
      sourceInputsUnchanged: true,
    });
  }

  console.log(JSON.stringify({
    passed: true,
    protocol: PROTOCOL_VERSION,
    coreVersion: ready.version,
    dataLocations: locations.length,
    systemStats: true,
    updaterAndReset: {
      electronVersionCompared: true,
      enderloomRepositoryPolicy: 'manual',
      tauriDownloadAndInstallRefused: true,
      recoverableResetPlannedWithoutMutation: true,
      shallowResetQuarantinedExactTargets: true,
      deepResetQuarantinedGameCaches: true,
      unrelatedFilesPreserved: true,
      broadRootRejected: true,
    },
    isolatedInstanceCreated: true,
    discoveredReleaseVersions: versions.length,
    discoveredFabricVersions: fabricVersions.length,
    requiredJavaMajor: javaStatus.required_major,
    gameInstallTask: {
      started: true,
      cancellationHonored: true,
      terminalEvent: 'cancelled',
      incompleteVersionNotPublished: true,
    },
    recoverySafeguards: {
      duplicateBytesVerified: true,
      duplicateSourceUnchanged: true,
      repairTaskCancellationHonored: true,
      snapshotCreateRenameRestoreDelete: true,
      preRestoreSafetySnapshot: true,
      managedDeleteQuarantineCommitted: true,
      managedDeleteSourceUnchanged: true,
    },
    mediaLibrary: {
      bannerImportApplyClearDelete: true,
      logoApplyAndDirectImport: true,
      mediaCacheResolved: true,
    },
    worldsAndDatapacks: {
      inspectedAndImported: true,
      importTaskSucceeded: true,
      datapackAddToggleDelete: true,
      worldDelete: true,
    },
    loggingAndDiagnostics: {
      plainAndGzipLogs: true,
      searchAndSeverity: true,
      outOfMemoryDiagnosis: true,
      redactionAndTraversalGuard: true,
      runtimeLevelAndFrontendBuffer: true,
      controlledDeletion: true,
      externalShareNotInvoked: true,
    },
    screenshots: {
      listAndThumbnail: true,
      clipboardPathValidatedByRust: true,
      traversalGuard: true,
      screenshotAndCacheDeletion: true,
    },
    storageAndLocations: {
      scanTaskAndReclaim: true,
      invalidPathRejected: true,
      moveOutAndBackWithoutLoss: true,
      moveTaskSucceeded: true,
    },
    packWorkflows: {
      safeAtomicExportReplacement: true,
      exportedPackInspected: true,
      unsafePackwizUrlRejected: true,
      importTaskCancellationRolledBack: true,
      realProviderPlanAndBaselineLink: true,
      upgradeChangesCalculated: true,
      upgradeCancellationRolledBack: true,
      installCancellationRemovedGhostInstance: true,
      unlinkClearedProviderIdentity: true,
    },
    serverWorkspace: {
      managedCreateAndEula: true,
      settingsAndOfflinePlayerRemoval: true,
      propertiesWhitelistAndPlayers: true,
      safeFileBrowserAndEditor: true,
      contentAddToggleRemove: true,
      runningConsoleAndRescan: true,
      externalImportInPlaceUnchanged: true,
      installTaskCancellation: true,
      externalDisconnectPreservedFiles: true,
      transactionalManagedDeletion: true,
      startConsoleRestartAndStop: true,
      recoveredAfterServiceRestart: true,
      supervisedExternalFilesUnchanged: true,
      localZipAtomicInstallAndCleanup: true,
      unsafeZipNameRejectedWithoutStaging: true,
    },
    providerInstall: {
      provider: 'modrinth',
      plannedFiles: 1 + (installPlan.dependencies?.length || 0),
      installedFiles: installedContent.length,
      listedFiles: listedContent.length,
      taskEvents: installTaskEvents.length,
      olderVersionUpdatedInPlace: true,
      updateMetadataCommitted: true,
    },
    processSupervision: {
      started: true,
      stdoutAndStderrStreamed: true,
      recoveredAfterServiceRestart: true,
      identityCheckedKill: true,
      closedFromRegistry: true,
    },
    instanceOrganizer: {
      groupsPersistent: true,
      favoritesPersistent: true,
      tagsPersistentAndSearchable: true,
      tagCrudAndReorder: true,
      duplicateInheritance: true,
      restartPersistence: true,
    },
    enderloomInstances: 3,
    externalInstanceContract: {
      connectedInPlace: true,
      profileBytesCopied: 0,
      writeThroughVerified: true,
      launcherChangesReconciled: true,
      movedProfileReattached: true,
      localOrganizationPreserved: true,
      junctionDeduplicated: true,
      restartPersistent: true,
      disconnectLeavesProfileUntouched: true,
      explicitCloneVerified: true,
      sourceUnchangedByConnectAndClone: true,
    },
    scans: summaries,
  }, null, 2));
})().catch((error) => {
  console.error(error?.stack || error);
  process.exitCode = 1;
}).finally(async () => {
  try {
    const runningServers = await service.request('list_running_servers');
    for (const running of runningServers) {
      if (!['running', 'stopping'].includes(running.state)) continue;
      await service.request('force_stop_server', { serverId: running.server_id });
    }
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const remaining = (await service.request('list_running_servers'))
        .some((running) => ['running', 'stopping'].includes(running.state));
      if (!remaining) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  } catch {
    // The service may already be unavailable; the temp-root guard below still prevents broad cleanup.
  }
  try {
    const runningGames = await service.request('list_running');
    for (const running of runningGames) {
      if (running.state !== 'running') continue;
      await service.request('kill_instance', { runningId: running.running_id });
    }
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const remaining = (await service.request('list_running'))
        .some((running) => running.state === 'running');
      if (!remaining) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  } catch {
    // The isolated process probe may already be gone.
  }
  await service.close();
  await waitForExit();
  const resolved = path.resolve(temporaryRoot);
  if (resolved.startsWith(path.resolve(os.tmpdir()) + path.sep) && path.basename(resolved).startsWith('enderloom-launcher-qa-')) {
    fs.rmSync(resolved, { recursive: true, force: true });
  }
});
