'use strict';
// Execute the real Windows entrypoint with a deterministic npm stand-in. No network,
// real game/profile mutation, or dependency installation is performed by this suite.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
if (process.platform !== 'win32') {
  console.log('SKIP: Windows batch startup requires Windows; run the source-startup CI job.');
  process.exit(0);
}
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'Enderloom clean start '));
const entry = fs.readFileSync(path.join(__dirname, '..', 'START_ENDERLOOM.cmd'));
const cases = [
  { name: 'clean checkout', expected: ['ci', '--prefix launcher ci', 'run build:launcher', 'run build:launcher-service', 'start'] },
  { name: 'shell installed, launcher missing', shell: true, expected: ['--prefix launcher ci', 'run build:launcher', 'run build:launcher-service', 'start'] },
  { name: 'prebuilt checkout', shell: true, frontend: true, service: true, expected: ['start'] },
  { name: 'shell install fails', fail: 'ci', expected: ['ci'], code: 1 },
  { name: 'launcher install fails', fail: '--prefix launcher ci', expected: ['ci', '--prefix launcher ci'], code: 1 },
  { name: 'frontend build fails', fail: 'run build:launcher', expected: ['ci', '--prefix launcher ci', 'run build:launcher'], code: 1 },
  { name: 'native build fails', fail: 'run build:launcher-service', expected: ['ci', '--prefix launcher ci', 'run build:launcher', 'run build:launcher-service'], code: 1 },
  { name: 'application exit preserved', shell: true, frontend: true, service: true, fail: 'start', expected: ['start'], code: 7 },
];
try {
  for (const test of cases) {
    const cwd = path.join(fixture, test.name);
    fs.mkdirSync(cwd);
    fs.writeFileSync(path.join(cwd, 'START_ENDERLOOM.cmd'), entry);
    const touch = relative => { const file = path.join(cwd, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, 'fixture'); };
    if (test.shell) touch('node_modules/electron/dist/electron.exe');
    if (test.frontend) touch('launcher/dist/index.html');
    if (test.service) touch('native/target/debug/enderloom-service.exe');
    fs.writeFileSync(path.join(cwd, 'npm.cmd'), '@echo off\r\n"' + process.execPath + '" "%~dp0fake-npm.js" %*\r\nexit /b %errorlevel%\r\n');
    fs.writeFileSync(path.join(cwd, 'fake-npm.js'), `
      const fs = require('node:fs');
      const command = process.argv.slice(2).join(' ');
      fs.appendFileSync('commands.log', command + '\\n');
      if (command === process.env.STARTUP_TEST_FAIL) process.exit(7);
      if (command === 'run build:launcher' && !fs.existsSync('launcher-dependencies.ready')) {
        console.error('launcher dependencies missing'); process.exit(9);
      }
      if (command === '--prefix launcher ci') fs.writeFileSync('launcher-dependencies.ready', 'ok');
    `);
    const result = spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/c', 'START_ENDERLOOM.cmd'], {
      cwd, env: { ...process.env, STARTUP_TEST_FAIL: test.fail || '' }, input: '\r\n', encoding: 'utf8', timeout: 20000,
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
