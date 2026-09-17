'use strict';
const assert = require('assert/strict'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const { spawnSync } = require('child_process');
const { LauncherService } = require('../src/launcher-service');
(async () => {
  const rootDir = path.resolve(__dirname, '..'), out = path.join(rootDir, 'output/curseforge');
  const installed = JSON.parse(fs.readFileSync(path.join(out, 'install-live.json'), 'utf8'));
  const dataDir = path.resolve(installed.isolatedRoot);
  assert(dataDir.startsWith(out + path.sep) && path.basename(dataDir).startsWith('install-acceptance-'), 'Only the owned install fixture may be edited');
  let service = new LauncherService({ rootDir, dataDir });
  const query = { provider: 'curseforge', projectId: '328085' };
  let original, target;
  const checks = [];
  try {
    const instance = (await service.request('list_instances')).find(row => row.id === installed.instanceId);
    target = path.resolve(instance.dir, 'mods', installed.files[0].fileName);
    assert(target.startsWith(dataDir + path.sep)); original = fs.readFileSync(target);
    const start = await service.request('verify_project_artifacts', query);
    const valid = start.observations.find(row => row.current);
    assert.equal(valid.artifact.sha256, installed.files[0].sha256); assert.equal(valid.source_match, 'verified'); checks.push('installed bytes match the provider release');
    const again = await service.request('verify_project_artifacts', query); assert.equal(again.observations.length, start.observations.length); checks.push('unchanged verification is idempotent');
    fs.appendFileSync(target, '\nEnderloom isolated mutation acceptance\n');
    const changed = await service.request('verify_project_artifacts', query), current = changed.observations.find(row => row.current);
    assert.equal(current.source_match, 'modified'); assert.notEqual(current.artifact.sha256, valid.artifact.sha256); assert.equal(current.previous_sha256, valid.artifact.sha256);
    assert(changed.observations.some(row => !row.current && row.artifact.sha256 === valid.artifact.sha256)); checks.push('same filename with changed bytes creates distinct artifact and preserves prior fingerprint');
    fs.writeFileSync(target, original);
    const restored = await service.request('verify_project_artifacts', query), last = restored.observations.find(row => row.current);
    assert.equal(last.artifact.sha256, valid.artifact.sha256); assert.equal(last.source_match, 'verified'); assert.equal(last.previous_sha256, current.artifact.sha256); checks.push('restored original reuses immutable artifact identity');
    assert.equal((await service.request('get_project_artifact_graph', { ...query, projectId: '328086' })).project, null); checks.push('different provider project cannot borrow this identity');
    await service.close();
    const binary = path.join(rootDir, 'native/target/debug/enderloom.exe');
    const result = spawnSync(binary, ['--data-dir', dataDir, 'operation', 'run', 'get_project_artifact_graph', '--json'], { input: JSON.stringify(query), encoding: 'utf8', windowsHide: true, timeout: 30000 });
    assert.equal(result.status, 0, result.stderr); const persisted = JSON.parse(result.stdout).result;
    assert.equal(persisted.observations.length, restored.observations.length); checks.push('CLI reads the same persisted graph after native service closes');
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex'), installed.files[0].sha256);
    fs.writeFileSync(path.join(out, 'artifact-graph.json'), JSON.stringify({ passed: true, checks, graph: persisted }, null, 2));
    console.log(JSON.stringify({ passed: true, checks, observations: persisted.observations.length }, null, 2));
  } finally { if (original && target) fs.writeFileSync(target, original); await service.close(); }
})().catch(error => { console.error(error.stack); process.exitCode = 1; });
