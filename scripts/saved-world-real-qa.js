'use strict';
// Exercise the canonical project projection with an actual unmodified save's
// level.dat. Only the temporary project's mod/provider association is a fixture.
const assert = require('assert/strict'), fs = require('fs'), os = require('os'), path = require('path'), crypto = require('crypto');
const { LauncherService } = require('../src/launcher-service');
const { seedProjectContext } = require('./project-context-fixtures');
const { write, zip } = require('./workbench-fixtures');
const [file, modId, version] = process.argv.slice(2);
if (!file || !modId || !version) throw new Error('Usage: node scripts/saved-world-real-qa.js <level.dat> <mod ID> <saved version>');
const root = path.resolve(__dirname, '..'), temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-real-save-'));
const service = new LauncherService({ rootDir: root, dataDir: path.join(temporary, 'data') });
(async () => {
  const bytes = fs.readFileSync(file), hash = value => crypto.createHash('sha256').update(value).digest('hex');
  const { first } = await seedProjectContext(service);
  write(first.dir, 'saves/Actual metadata/level.dat', bytes);
  write(first.dir, 'mods/first.jar', zip({ 'fabric.mod.json': JSON.stringify({ id: modId, version, name: 'Save metadata identity fixture' }) }));
  const context = await service.request('get_project_context', { provider: 'modrinth', projectId: 'alpha' });
  const world = context.targets.find(t => t.id === first.id).worlds.find(w => w.folder === 'Actual metadata');
  assert(world, 'Real save must produce a project relationship');
  const evidence = world.evidence.find(e => e.kind === 'saved_mod' && e.mod_id === modId);
  assert.equal(evidence.saved_version, version);
  assert.equal(evidence.comparison, 'version_matches');
  assert.equal(hash(bytes), hash(fs.readFileSync(file)), 'Original save bytes must remain unchanged');
  assert.equal(hash(bytes), hash(fs.readFileSync(path.join(first.dir, 'saves/Actual metadata/level.dat'))));
  const proof = { passed: true, scope: 'Actual unchanged save metadata, temporary fixture mod/provider association', source_sha256: hash(bytes), world };
  fs.writeFileSync(path.join(root, 'output/saved-world-real-proof.json'), JSON.stringify(proof, null, 2));
  console.log(JSON.stringify(proof, null, 2));
})().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => service.close());
