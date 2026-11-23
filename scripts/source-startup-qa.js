'use strict';
// Probe the source runner and run the Windows batch entrypoint with an inert npm
// fixture. No network, game/profile mutation, or dependency installation.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

// Use copies of the runner's own executable as inert app-entry probes, not
// shell wrappers or Electron. This exercises actual argv and executable paths
// on Windows and POSIX without requiring another binary.
function testSelectedSourceRuntime() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'Enderloom selected runtime '));
  try {
    const app = path.join(root, 'source application');
    const script = path.join(app, 'scripts', 'run.js');
    const cwd = path.join(root, 'portable folder');
    const search = path.join(root, 'search path');
    for (const directory of [path.dirname(script), cwd, search]) {
      fs.mkdirSync(directory, { recursive: true });
    }
    const basename = process.platform === 'win32' ? 'owned runtime.exe' : 'owned runtime';
    const selected = path.join(cwd, basename);
    const alternate = path.join(search, basename);
    fs.copyFileSync(process.execPath, selected, fs.constants.COPYFILE_EXCL);
    fs.copyFileSync(process.execPath, alternate, fs.constants.COPYFILE_EXCL);
    fs.copyFileSync(path.join(__dirname, 'run.js'), script);
    fs.writeFileSync(path.join(app, 'package.json'), JSON.stringify({ main: 'probe.js' }));
    fs.writeFileSync(path.join(app, 'probe.js'), [
      "const fs = require('node:fs');",
      "console.log(JSON.stringify({ executable: fs.realpathSync.native(process.execPath),",
      "  cwd: fs.realpathSync.native(process.cwd()), args: process.argv.slice(2) }));",
      "process.exitCode = 7;",
    ].join('\n'));

    const env = Object.fromEntries(Object.entries(process.env).filter(([key]) =>
      !['PATH', 'NODE_PATH', 'NODE_OPTIONS', 'ELECTRON_PATH'].includes(key.toUpperCase())));
    env.PATH = search;
    env.ELECTRON_PATH = basename;
    const args = ['--shortcut=Ctrl+Shift+P', 'renamed folder', 'literal "quotes" & $1', 'résumé'];
    const result = spawnSync(process.execPath, [script, ...args], {
      cwd, env, encoding: 'utf8', timeout: 12000,
    });
    assert.ifError(result.error);
    assert.equal(result.signal, null);
    assert.equal(result.status, 7, `source runtime: ${result.stdout}\n${result.stderr}`);
    assert.deepEqual(JSON.parse(result.stdout), {
      executable: fs.realpathSync.native(selected),
      cwd: fs.realpathSync.native(cwd),
      args,
    }, 'the actual selected executable must run, not the same basename on PATH');
    console.log('PASS: selected source executable, literal arguments, working directory and exit status');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

testSelectedSourceRuntime();

if (process.platform !== 'win32') {
  console.log('SKIP: Windows batch startup requires Windows; run the source-startup CI job.');
  process.exit(0);
}
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'Enderloom clean start '));
const entry = fs.readFileSync(path.join(__dirname, '..', 'START_ENDERLOOM.cmd'));
const all = ['ci', '--prefix launcher ci', 'run build:launcher', 'run build:launcher-service', 'start'];
const cases = [
  { name: 'clean checkout', expected: all },
  { name: 'foreign working directory', foreign: true, expected: all },
  { name: 'shell install fails', fail: 'ci', expected: ['ci'], code: 1 },
  { name: 'launcher install fails', fail: '--prefix launcher ci', expected: all.slice(0, 2), code: 1 },
  { name: 'frontend build fails', fail: 'run build:launcher', expected: all.slice(0, 3), code: 1 },
  { name: 'native build fails', fail: 'run build:launcher-service', expected: all.slice(0, 4), code: 1 },
  { name: 'application exit preserved', fail: 'start', expected: all, code: 7 },
];
try {
  for (const test of cases) {
    const cwd = path.join(fixture, test.name);
    fs.mkdirSync(cwd);
    fs.writeFileSync(path.join(cwd, 'START_ENDERLOOM.cmd'), entry);
    const touch = relative => { const file = path.join(cwd, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, 'fixture'); };
    fs.mkdirSync(path.join(cwd, 'scripts'));
    fs.copyFileSync(path.join(__dirname, 'prepare-source.js'), path.join(cwd, 'scripts/prepare-source.js'));
    if (test.shell) touch('node_modules/electron/dist/electron.exe');
    if (test.frontend) touch('launcher/dist/index.html');
    if (test.service) touch('native/target/debug/enderloom-service.exe');
    fs.writeFileSync(path.join(cwd, 'npm.cmd'), '@echo off\r\n"' + process.execPath + '" "%~dp0fake-npm.js" %*\r\nexit /b %errorlevel%\r\n');
    fs.writeFileSync(path.join(cwd, 'fake-npm.js'), `
      const fs = require('node:fs');
      const command = process.argv.slice(2).join(' ');
      fs.appendFileSync('commands.log', command + '\\n');
      if (command === 'start' && process.env.ENDERLOOM_SERVICE_PATH !== require('node:path').join(process.cwd(), 'native', 'target', 'debug', 'enderloom-service.exe')) throw new Error('startup did not select the prepared service');
      if (command === process.env.STARTUP_TEST_FAIL) process.exit(7);
      if (command === 'run build:launcher' && !fs.existsSync('launcher-dependencies.ready')) {
        console.error('launcher dependencies missing'); process.exit(9);
      }
      function touch(name) { const path = require('node:path'); fs.mkdirSync(path.dirname(name), { recursive: true }); fs.writeFileSync(name, 'fixture'); }
      if (command === 'ci') touch('node_modules/electron/dist/electron.exe');
      if (command === 'run build:launcher') touch('launcher/dist/index.html');
      if (command === 'run build:launcher-service') touch('native/target/debug/enderloom-service.exe');
      if (command === '--prefix launcher ci') fs.writeFileSync('launcher-dependencies.ready', 'ok');
    `);
    const result = spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/c', 'call "' + path.join(cwd, 'START_ENDERLOOM.cmd') + '"'], {
      windowsVerbatimArguments: true,
      cwd: test.foreign ? fixture : cwd, env: { ...process.env, STARTUP_TEST_FAIL: test.fail || '' }, input: '\r\n', encoding: 'utf8', timeout: 20000,
    });
    assert.ifError(result.error);
    assert.equal(result.status, test.code || 0, `${test.name}: ${result.stdout}\n${result.stderr}`);
    assert.deepEqual(fs.readFileSync(path.join(cwd, 'commands.log'), 'utf8').trim().split('\n'), test.expected, test.name);
    console.log(`PASS: ${test.name}`);
  }
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}
console.log(`PASS: ${cases.length} real Windows entrypoint scenarios`);
