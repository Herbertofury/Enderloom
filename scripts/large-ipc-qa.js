'use strict';
const assert = require('assert/strict'), fs = require('fs'), os = require('os'), path = require('path'), crypto = require('crypto');
const { LauncherService } = require('../src/launcher-service');
(async () => {
  const rootDir = path.resolve(__dirname, '..'), dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-large-ipc-'));
  const owner = new LauncherService({ rootDir, dataDir }), client = new LauncherService({ rootDir, dataDir });
  try {
    const instance = await owner.request('create_instance', { name: 'Large transport acceptance', versionId: '1.21.1', loader: null, loaderVersion: null });
    const notes = 'complete-inventory-0123456789\n'.repeat(400000), digest = value => crypto.createHash('sha256').update(value).digest('hex');
    assert(Buffer.byteLength(notes) > 8 * 1024 * 1024);
    await owner.request('set_instance_notes', { instanceId: instance.id, notes });
    const direct = (await owner.request('list_instances')).find(row => row.id === instance.id);
    assert.equal(digest(direct.notes), digest(notes));
    await client.request('set_instance_notes', { instanceId: instance.id, notes: notes + 'shared endpoint' });
    const shared = (await client.request('list_instances')).find(row => row.id === instance.id);
    assert.equal(digest(shared.notes), digest(notes + 'shared endpoint'));
    const report = { passed: true, requestBytes: Buffer.byteLength(notes), directResponse: 'complete', authenticatedSharedResponse: 'complete' };
    fs.writeFileSync(path.join(rootDir, 'output/large-ipc.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report));
  } finally {
    await client.close(); await owner.close();
    const resolved = path.resolve(dataDir);
    if (resolved.startsWith(path.resolve(os.tmpdir()) + path.sep) && path.basename(resolved).startsWith('enderloom-large-ipc-')) fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 8, retryDelay: 150 });
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
