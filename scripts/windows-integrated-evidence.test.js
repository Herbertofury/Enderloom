'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { smokeEvidence, buildReceipt, assertWindowsX64, resolveStockElectron, STAGES } = require('./windows-integrated-evidence');

const lock = require('../package-lock.json').packages['node_modules/electron'].version;
const stdout = (changes = {}, stages = STAGES) => [
  ...stages.map(stage => 'ENDERLOOM_SELF_TEST_STAGE ' + stage + ' heap=0MiB'),
  'CATALOG_COMPANION_SELF_TEST ' + JSON.stringify({
    passed: true, failures: [], electron: lock, chromium: '149.0.12.1', tabs: 2, ...changes,
  }),
].join('\r\n');
const child = (changes = {}) => ({ status: 0, signal: null, stdout: stdout(), ...changes });

test('evidence covers the exact original self-test stages and no substitute product', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../main.js'), 'utf8');
  const selfTest = source.slice(source.indexOf('async function runSelfTest()'), source.indexOf('app.setAppUserModelId('));
  assert.deepEqual(Array.from(selfTest.matchAll(/stage\('([^']+)'\)/g), result => result[1]), STAGES);
  assert.match(selfTest, /Electron invokes the real Rust launcher core/);
  assert.match(selfTest, /Enderloom React workspace boots through the Electron preload/);
  assert.match(selfTest, /launcher workspace is sandboxed/);
  assert.equal(require('../package.json').scripts['electron-self-test'], 'node scripts/run.js --self-test');
  assert.equal(smokeEvidence(child(), lock).passed, true);
});

test('a success-looking receipt never masks killed, timed-out, failed, incomplete, duplicate or wrong-runtime runs', () => {
  const marker = stdout().split('\r\n').at(-1);
  for (const value of [
    child({ error: new Error('timeout') }),
    child({ signal: 'SIGTERM', status: null }),
    child({ status: 1 }),
    child({ stdout: stdout({ passed: false, failures: ['real server did not start'] }) }),
    child({ stdout: stdout({ passed: true, failures: ['fake success'] }) }),
    child({ stdout: stdout({ electron: '0.0.0' }) }),
    child({ stdout: stdout({ chromium: 'unknown' }) }),
    child({ stdout: stdout({ tabs: 0 }) }),
    child({ stdout: marker }),
    child({ stdout: stdout({}, STAGES.filter(stage => stage !== 'launcher-boundary')) }),
    child({ stdout: stdout({}, STAGES.slice().reverse()) }),
    child({ stdout: stdout() + '\n' + marker }),
    child({ stdout: marker + '\n' + stdout().split('\r\n').slice(0, -1).join('\n') }),
    child({ stdout: stdout().replace(marker, 'CATALOG_COMPANION_SELF_TEST invalid-json') }),
  ]) assert.throws(() => smokeEvidence(value, lock));
});

function pe(machine = 0x8664) {
  const bytes = Buffer.alloc(256);
  bytes.write('MZ', 0);
  bytes.writeUInt32LE(128, 0x3c);
  bytes.writeUInt32LE(0x00004550, 128);
  bytes.writeUInt16LE(machine, 132);
  return bytes;
}
function temp(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-evidence fixture '));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return fs.realpathSync.native(dir);
}
function put(root, name, value) {
  const file = path.resolve(root, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
  return file;
}

test('Windows format/architecture claims require an actual x64 PE header', t => {
  const root = temp(t);
  assert.doesNotThrow(() => assertWindowsX64(put(root, 'x64.exe', pe())));
  assert.throws(() => assertWindowsX64(put(root, 'x86.exe', pe(0x014c))), /x64/);
  assert.throws(() => assertWindowsX64(put(root, 'arm.exe', pe(0xaa64))), /x64/);
  assert.throws(() => assertWindowsX64(put(root, 'elf.exe', Buffer.concat([Buffer.from('\x7fELF'), Buffer.alloc(200)]))), /Windows PE/);
  const broken = pe();
  broken.writeUInt32LE(60000, 0x3c);
  assert.throws(() => assertWindowsX64(put(root, 'broken.exe', broken)), /offset/);
});

test('startup evidence binds both binaries, all frontend assets and the exact lock bytes, never a hot-swapped output', t => {
  const root = temp(t);
  put(root, 'launcher/dist/index.html', 'html');
  const asset = put(root, 'launcher/dist/assets/index.js', 'bundle');
  put(root, 'launcher/dist/assets/secondary.css', 'secondary');
  put(root, 'launcher/dist/permissions/fixture.json', '{}');
  put(root, 'node_modules/electron/dist/electron.exe', pe());
  const service = put(root, 'native/target/debug/enderloom-service.exe', pe());
  for (const name of ['package-lock.json', 'launcher/package-lock.json', 'native/Cargo.lock']) put(root, name, 'lock evidence');

  const before = buildReceipt(root);
  assert.equal(before.executables.length, 2);
  assert.equal(before.locks.length, 3);
  assert.deepEqual(before.frontend.map(entry => entry.path), [
    'launcher/dist/assets/index.js', 'launcher/dist/assets/secondary.css',
    'launcher/dist/index.html', 'launcher/dist/permissions/fixture.json',
  ]);
  assert.ok(before.frontend.every(item => /^\w{64}$/.test(item.sha256)));
  assert.deepEqual(buildReceipt(root), before);

  fs.writeFileSync(asset, 'after!');
  assert.throws(() => assert.deepEqual(buildReceipt(root), before));
  fs.rmSync(asset);
  assert.throws(() => buildReceipt(root), /React bundle/);
  put(root, 'launcher/dist/assets/index.js', 'bundle');
  fs.rmSync(service);
  fs.mkdirSync(service);
  assert.throws(() => buildReceipt(root), /type/);
});


test('a lock-installed lazy Electron shim resolves before the first byte receipt', t => {
  const root = temp(t);
  const relative = 'node_modules/electron/dist/electron.exe';
  const original = path.join(root, relative);
  put(root, 'node_modules/electron/package.json', JSON.stringify({ main: 'index.js', version: lock }));
  put(root, 'node_modules/electron/index.js', `
    const fs = require('node:fs');
    const path = require('node:path');
    const binary = path.join(__dirname, 'dist', 'electron.exe');
    fs.mkdirSync(path.dirname(binary), { recursive: true });
    fs.writeFileSync(binary, Buffer.from(${JSON.stringify(pe().toString('hex'))}, 'hex'));
    module.exports = binary;
  `);
  put(root, 'native/target/debug/enderloom-service.exe', pe());
  put(root, 'launcher/dist/index.html', 'html');
  put(root, 'launcher/dist/assets/index.js', 'bundle');
  for (const name of ['package-lock.json', 'launcher/package-lock.json', 'native/Cargo.lock']) put(root, name, 'lock');

  assert.equal(fs.existsSync(original), false);
  assert.throws(() => buildReceipt(root), { code: 'ENOENT' }); // original evidence order
  const resolved = resolveStockElectron(root, lock);
  assert.equal(resolved, fs.realpathSync.native(original));
  assert.equal(buildReceipt(root).executables[0].path, relative);
  fs.writeFileSync(original, 'not a PE');
  assert.throws(() => buildReceipt(root), /DOS header/); // unchanged executable gate
});

test('stock Electron resolution refuses package-version changes and alternate runtime paths', t => {
  const root = temp(t);
  put(root, 'node_modules/electron/package.json', JSON.stringify({ main: 'index.js', version: lock }));
  put(root, 'node_modules/electron/dist/electron.exe', pe());
  const alternate = put(root, 'not-the-locked-dist/electron.exe', pe());
  put(root, 'node_modules/electron/index.js', 'module.exports = ' + JSON.stringify(alternate));
  assert.throws(() => resolveStockElectron(root, '0.0.0'), /differs from the repository lock/);
  assert.throws(() => resolveStockElectron(root, lock), /different runtime than the owned build/);
});
