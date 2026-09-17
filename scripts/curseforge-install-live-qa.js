'use strict';
const assert = require('assert/strict'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const { LauncherService } = require('../src/launcher-service');
(async () => {
  const rootDir = path.resolve(__dirname, '..'), out = path.join(rootDir, 'output/curseforge');
  fs.mkdirSync(out, { recursive: true });
  const dataDir = fs.mkdtempSync(path.join(out, 'install-acceptance-'));
  const service = new LauncherService({ rootDir, dataDir });
  try {
    const instance = await service.request('create_instance', { name: 'CurseForge isolated install acceptance', versionId: '1.21.1', loader: 'neoforge', loaderVersion: '21.1.250' });
    assert(path.resolve(instance.dir).startsWith(dataDir + path.sep));
    const args = { provider: 'curseforge', projectId: '328085', kind: 'mods', instanceId: instance.id, gameVersion: '1.21.1', loader: 'neoforge', withDependencies: true };
    const plan = await service.request('plan_content_install', args);
    assert(plan.primary && !plan.conflicts.length);
    const installed = await service.request('install_content', args, { timeoutMs: 180000 });
    const graph = await service.request('get_project_artifact_graph', { provider: 'curseforge', projectId: '328085' });
    assert(graph.observations.some(row => row.current && row.source_match === 'verified'), 'Install automatically records verified artifact identity');
    const content = await service.request('list_instance_content', { instanceId: instance.id, kind: 'mods' });
    const files = [plan.primary, ...plan.dependencies].map(file => {
      const destination = path.resolve(instance.dir, 'mods', file.file_name);
      assert(destination.startsWith(path.resolve(instance.dir, 'mods') + path.sep));
      const bytes = fs.readFileSync(destination), sha1 = crypto.createHash('sha1').update(bytes).digest('hex');
      assert(file.sha1 && file.sha1.toLowerCase() === sha1, 'Installed bytes must match CurseForge hash');
      assert(bytes.subarray(0, 2).toString() === 'PK', 'Installed mod must be a real JAR archive');
      assert(content.some(item => item.file_name === file.file_name && item.source?.icon_url), 'Installed content retains source identity and icon');
      return { fileName: file.file_name, projectId: file.project_id, versionId: file.version_id, bytes: bytes.length, sha1, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), dependency: file.is_dependency };
    });
    const report = { checkedAt: new Date().toISOString(), status: 'passed', instanceId: instance.id, isolatedRoot: dataDir, minecraft: '1.21.1', loader: 'neoforge', loaderVersion: '21.1.250', installed: installed.length, files, runtimeMode: 'native installation; Minecraft was not launched' };
    fs.writeFileSync(path.join(out, 'install-live.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report));
  } finally { service.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
