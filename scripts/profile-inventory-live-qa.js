'use strict';
const assert = require('assert/strict'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const { LauncherService } = require('../src/launcher-service');
const rootsDigest = directory => {
  const rows = fs.existsSync(directory) ? fs.readdirSync(directory).sort().map(name => { const stat = fs.statSync(path.join(directory, name)); return [name,stat.size,stat.mtimeMs]; }) : [];
  return crypto.createHash('sha256').update(JSON.stringify(rows)).digest('hex');
};
(async () => {
  const rootDir = path.resolve(__dirname, '..');
  const service = new LauncherService({ rootDir, dataDir: path.join(process.env.APPDATA, 'Enderloom', 'launcher') });
  try {
    const instances = (await service.request('list_instances')).filter(instance => /nox|viola|dream/i.test(instance.name)), results = [];
    for (const instance of instances) {
      const directory = path.join(instance.dir, 'mods'), before = rootsDigest(directory);
      const disk = fs.existsSync(directory) ? fs.readdirSync(directory).filter(name => /\.jar(?:\.disabled)?$/i.test(name)) : [];
      const start = performance.now();
      const first = await service.request('list_instance_content', { instanceId: instance.id, kind: 'mods', reconcile: false });
      const coldMs = Math.round(performance.now() - start), next = performance.now();
      const bundle = await service.request('list_instance_content_bundle', { instanceId: instance.id, kinds: ['mods','resourcepacks','shaderpacks'], reconcile: false });
      assert.equal(first.filter(item => item.file_name.endsWith('.jar')).length, disk.length, instance.name);
      assert.equal(bundle.mods.length, first.length, 'Bundled inventory must retain every mod');
      assert.equal(rootsDigest(directory), before, 'Reading inventory must preserve files');
      const icons = first.filter(item => item.source?.icon_url), local = icons.filter(item => item.source.icon_url.startsWith('enderloom-asset://local/'));
      for (const item of local) {
        const file = Buffer.from(item.source.icon_url.split('/local/')[1], 'base64url').toString();
        assert(fs.existsSync(file), 'Original icon asset must be available');
      }
      const result = { name: instance.name, diskMods: disk.length, listed: first.length, icons: icons.length, localAssets: local.length, responseBytes: Buffer.byteLength(JSON.stringify(bundle)), coldMs, warmMs: Math.round(performance.now()-next), filesUnchanged: true };
      results.push(result); console.log(JSON.stringify(result));
    }
    fs.writeFileSync(path.join(rootDir, 'output/profile-inventory-live.json'), JSON.stringify({ passed: true, results }, null, 2));
  } finally { await service.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
