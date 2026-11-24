'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync, execFileSync } = require('node:child_process');

const RELEASE_MARKER = 'CATALOG_COMPANION_SELF_TEST ';
const STAGE_MARKER = 'ENDERLOOM_SELF_TEST_STAGE ';
const STAGES = [
  'window-ready', 'launcher-boundary', 'catalog-preflight', 'catalog-shell-checks',
  'catalog-switched', 'provider-surface', 'catalog-renderer', 'browse-seeded-paint',
  'media-prime', 'gallery-dom', 'live-media-fixtures', 'browser-focus', 'browser-navigation',
  'browser-history', 'split-layout', 'quick-discovery', 'split-and-discovery',
];
const ELECTRON = 'node_modules/electron/dist/electron.exe';
const SERVICE = 'native/target/debug/enderloom-service.exe';
const POSIX_ENTRY = name => name.split(path.sep).join('/');

function smokeEvidence(child, lockedElectron) {
  assert.ok(!child.error, 'Existing Electron source self-test did not finish normally');
  assert.ok(child.signal === null && child.status === 0, 'Existing Electron source self-test returned failure');
  const lines = String(child.stdout || '').split(/\r?\n/);
  const records = lines.filter(line => line.startsWith(RELEASE_MARKER));
  assert.equal(records.length, 1, 'Expected exactly one terminal Electron self-test receipt');
  const stages = lines.filter(line => line.startsWith(STAGE_MARKER))
    .map(line => line.slice(STAGE_MARKER.length).split(' ')[0]);
  assert.deepEqual(stages, STAGES, 'Existing Electron self-test did not complete its original stages');
  assert.ok(lines.indexOf(records[0]) > lines.findIndex(line => line.startsWith(STAGE_MARKER + STAGES.at(-1) + ' ')),
    'Terminal receipt preceded last expected self-test stage');
  const { passed, failures, electron, chromium, tabs } = JSON.parse(records[0].slice(RELEASE_MARKER.length));
  assert.equal(passed, true);
  assert.deepEqual(failures, []);
  assert.equal(electron, lockedElectron, 'Self-test used a different runtime than the repo lock');
  assert.match(chromium, /^\d+(?:\.\d+){3}$/);
  assert.ok(Number.isSafeInteger(tabs) && tabs > 0);
  return { passed, electron, chromium, tabs, stages };
}

function ownedPath(root, relative, regular) {
  const name = path.resolve(root, relative);
  assert.ok(!fs.lstatSync(name).isSymbolicLink(), 'Expected a nonlinked build artifact: ' + relative);
  const resolved = fs.realpathSync.native(name);
  assert.equal(path.relative(root, resolved), relative, 'Build artifact did not resolve to the owned path: ' + relative);
  const stat = fs.statSync(resolved);
  assert.ok(regular ? stat.isFile() && stat.size > 0 : stat.isDirectory(), 'Wrong build artifact type: ' + relative);
  return resolved;
}

function resolveStockElectron(root, lockedVersion) {
  const packagePath = ownedPath(root, path.normalize('node_modules/electron'), false);
  const installed = JSON.parse(fs.readFileSync(path.join(packagePath, 'package.json'), 'utf8'));
  assert.equal(installed.version, lockedVersion, 'Installed Electron package differs from the repository lock');
  // Electron 44 installs its version-pinned binary at its first API lookup, not npm ci.
  // Use the same upstream resolver as scripts/run.js before recording any build bytes.
  const returned = require(packagePath);
  const expected = ownedPath(root, path.normalize(ELECTRON), true);
  assert.ok(typeof returned === 'string' && path.isAbsolute(returned), 'Electron did not return an absolute runtime path');
  assert.equal(fs.realpathSync.native(returned), expected, 'Electron returned a different runtime than the owned build');
  return expected;
}

function assertWindowsX64(file) {
  const fd = fs.openSync(file, 'r');
  try {
    const min = Buffer.alloc(64);
    assert.equal(fs.readSync(fd, min, 0, min.length, 0), min.length, 'Missing DOS header');
    assert.equal(min.toString('ascii', 0, 2), 'MZ', 'Not a Windows PE executable');
    const peOffset = min.readUInt32LE(0x3c);
    const signature = Buffer.alloc(6);
    assert.ok(peOffset >= 64 && peOffset <= fs.fstatSync(fd).size - signature.length, 'Invalid PE offset');
    assert.equal(fs.readSync(fd, signature, 0, signature.length, peOffset), signature.length, 'Missing PE header');
    assert.equal(signature.readUInt32LE(0), 0x00004550, 'Invalid PE signature');
    assert.equal(signature.readUInt16LE(4), 0x8664, 'Not an x64 PE executable');
  } finally {
    fs.closeSync(fd);
  }
}

function digest(file) {
  const fd = fs.openSync(file, 'r');
  try {
    const buf = Buffer.allocUnsafe(1024 * 1024);
    const hash = crypto.createHash('sha256');
    let read, bytes = 0;
    while ((read = fs.readSync(fd, buf, 0, buf.length, null)) !== 0) {
      bytes += read;
      hash.update(buf.subarray(0, read));
    }
    return { bytes, sha256: hash.digest('hex') };
  } finally {
    fs.closeSync(fd);
  }
}

function buildReceipt(root) {
  function file(relative, executable = false) {
    const resolved = ownedPath(root, path.normalize(relative), true);
    if (executable) assertWindowsX64(resolved);
    return { path: POSIX_ENTRY(relative), ...digest(resolved) };
  }
  const frontend = [];
  function visit(relative) {
    const dir = ownedPath(root, relative, false);
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
      const next = path.join(relative, entry.name);
      if (entry.isDirectory()) visit(next);
      else frontend.push(file(next));
    }
  }
  visit(path.join('launcher', 'dist'));
  assert.ok(frontend.some(entry => entry.path === 'launcher/dist/index.html'));
  assert.ok(frontend.some(entry => /^launcher\/dist\/assets\/.*\.js$/.test(entry.path)), 'Missing built React bundle');
  return {
    executables: [file(ELECTRON, true), file(SERVICE, true)],
    locks: ['package-lock.json', 'launcher/package-lock.json', 'native/Cargo.lock'].map(relative => file(relative)),
    frontend,
  };
}

function run() {
  assert.equal(process.platform, 'win32');
  assert.equal(process.arch, 'x64');
  assert.ok(!process.env.ELECTRON_RUN_AS_NODE && !process.env.ELECTRON_DISABLE_SANDBOX &&
    !process.env.ELECTRON_OVERRIDE_DIST_PATH, 'Unexpected Electron environment');
  const root = fs.realpathSync.native(path.resolve(__dirname, '..'));
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  const commit = process.env.ENDERLOOM_EVIDENCE_COMMIT;
  assert.match(commit || '', /^[0-9a-f]{40}$/);
  assert.equal(git('rev-parse', 'HEAD'), commit);
  assert.equal(git('status', '--porcelain', '--untracked-files=no'), '', 'Tracked source changed before self-test');
  const sourceTree = git('rev-parse', 'HEAD^{tree}');
  const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  const expectElectron = lock.packages['node_modules/electron'].version;
  const report = path.join(process.env.RUNNER_TEMP, 'enderloom-windows-source-evidence.json');
  assert.ok(!fs.existsSync(report), 'Refusing to reuse an existing evidence file');

  const electron = resolveStockElectron(root, expectElectron);
  const inputsBefore = buildReceipt(root);
  // Same entry point and only flag as npm run electron-self-test. Pin the two
  // exact observed build outputs, like the regular source launcher does for the service.
  const result = smokeEvidence(spawnSync(process.execPath, ['scripts/run.js', '--self-test'], {
    cwd: root,
    env: { ...process.env, ELECTRON_PATH: electron, ENDERLOOM_SERVICE_PATH: path.join(root, SERVICE) },
    encoding: 'utf8',
    timeout: 180000,
    maxBuffer: 4 * 1024 * 1024,
  }), expectElectron);

  assert.deepEqual(buildReceipt(root), inputsBefore, 'Build bytes changed during self-test');
  assert.equal(git('rev-parse', 'HEAD'), commit);
  assert.equal(git('status', '--porcelain', '--untracked-files=no'), '', 'Tracked source changed during self-test');
  const rustc = execFileSync('rustc', ['+1.100.0-x86_64-pc-windows-msvc', '--version'], { cwd: root, encoding: 'utf8' }).trim();
  assert.match(rustc, /^rustc 1\.100\.0 /);
  const receipt = {
    schema: 1, kind: 'windows-integrated-source-self-test',
    notInstaller: true, portableDataNotTested: true,
    commit, sourceTree, runtime: { node: process.versions.node, rustc, os: process.platform, arch: process.arch },
    inputs: inputsBefore, result,
  };
  fs.writeFileSync(report, JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' });
  console.log('Passing Windows integrated source evidence for ' + commit + ' (not an installer)');
}

module.exports = { smokeEvidence, buildReceipt, assertWindowsX64, resolveStockElectron, STAGES };
if (require.main === module) run();
