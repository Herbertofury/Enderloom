'use strict';
// Read-only evidence helper. No dependency install, Electron launch or app-state access.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const assert = require('node:assert/strict');

function snapshot(root) {
  root = fs.realpathSync.native(root);
  function owned(relative, isDirectory = false) {
    const target = path.resolve(root, relative);
    assert.equal(fs.realpathSync.native(target).toLowerCase(), target.toLowerCase(), 'Redirected output: ' + relative);
    const info = fs.lstatSync(target);
    assert.ok(isDirectory ? info.isDirectory() : info.isFile(), 'Wrong output type: ' + relative);
    return target;
  }
  function readJSON(relative) {
    return JSON.parse(fs.readFileSync(owned(relative), 'utf8'));
  }
  function hash(relative) {
    const hash = createHash('sha256');
    const fd = fs.openSync(owned(relative), 'r');
    try {
      const block = Buffer.allocUnsafe(1024 * 1024);
      let size;
      while ((size = fs.readSync(fd, block)) > 0) hash.update(block.subarray(0, size));
      return hash.digest('hex');
    } finally { fs.closeSync(fd); }
  }
  function assertAmd64(relative) {
    const fd = fs.openSync(owned(relative), 'r');
    try {
      const dos = Buffer.alloc(64);
      assert.equal(fs.readSync(fd, dos, 0, 64, 0), 64, relative);
      assert.equal(dos.subarray(0, 2).toString('ascii'), 'MZ', relative);
      const pe = Buffer.alloc(26);
      assert.equal(fs.readSync(fd, pe, 0, pe.length, dos.readUInt32LE(60)), pe.length, relative);
      assert.equal(pe.readUInt32LE(0), 0x4550, relative);
      assert.equal(pe.readUInt16LE(4), 0x8664, relative);
      assert.equal(pe.readUInt16LE(24), 0x20b, relative);
    } finally { fs.closeSync(fd); }
  }
  const shell = 'node_modules/electron/dist';
  const launcher = 'launcher/dist';
  const native = 'native/target/debug/enderloom-service.exe';
  const receiptPath = '.enderloom-runtime/source-build.json';
  assert.equal(fs.existsSync(path.join(root, '.enderloom-runtime/source-build.lock')), false, 'Preparation is not complete');
  const receipt = readJSON(receiptPath);
  assert.deepEqual(Object.keys(receipt).sort(), ['launcher', 'native', 'shell']);
  const { digest } = require(owned('scripts/prepare-source.js'));
  for (const [name, relative] of Object.entries({ shell, launcher, native })) {
    owned(relative, name !== 'native');
    assert.match(receipt[name].input, /^[0-9a-f]{64}$/);
    assert.equal(receipt[name].output, digest(root, [relative]), 'Build receipt output no longer matches: ' + name);
  }
  const electron = shell + '/electron.exe';
  const pinnedVersion = readJSON('package-lock.json').packages['node_modules/electron'].version;
  assert.equal(readJSON('node_modules/electron/package.json').version, pinnedVersion);
  assertAmd64(electron);
  assertAmd64(native);
  return {
    pinnedVersion,
    receiptSha256: hash(receiptPath),
    receiptMtimeNs: fs.statSync(owned(receiptPath), { bigint: true }).mtimeNs.toString(),
    electronSha256: hash(electron),
    serviceSha256: hash(native),
    launcherEntrySha256: hash(launcher + '/index.html'),
    fullShellDigest: receipt.shell.output,
    fullLauncherDigest: receipt.launcher.output,
    nativeDigest: receipt.native.output,
  };
}

if (require.main === module) console.log(JSON.stringify(snapshot(process.argv[2])));
module.exports = { snapshot };
