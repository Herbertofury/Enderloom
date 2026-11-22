'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { LauncherService } = require('../src/launcher-service');

// A real child process speaks the local line protocol. This does not launch Minecraft or the Rust backend.
const fixture = `#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const dir = process.argv[3];
const mode = process.env.ENDERLOOM_HANDSHAKE_QA_MODE;
if (process.argv[2] !== '--data-dir' || !dir) process.exit(2);
fs.writeFileSync(path.join(dir, 'started-' + process.pid), '');
const ready = (protocol) => ({protocol, event: 'service:ready', payload: {version: 'fixture', pid: process.pid}});
const send = (...messages) => process.stdout.write(messages.map(message => JSON.stringify(message) + '\\n').join(''));
if (mode === 'boot-mismatch') send(ready(2), ready(1));
else if (mode !== 'boot-silent') send(ready(1));
const input = readline.createInterface({input: process.stdin});
if (mode === 'boot-silent') setInterval(() => {}, 10000); // Intentionally ignores EOF.
input.on('line', (line) => {
  const {id, command} = JSON.parse(line);
  if (mode === 'request-mismatch') send({protocol: 2, id, ok: true}, {protocol: 1, id, ok: true});
  else send({protocol: 1, id, ok: true, result: {command, marker: fs.readFileSync(path.join(dir, 'original.txt'), 'utf8'), pid: process.pid}});
});
`;

function pidAlive(pid) {
  try { process.kill(pid, 0); return true; } catch (error) {
    if (error.code === 'ESRCH') return false;
    throw error;
  }
}

function createFixture(t, mode) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-handshake-'));
  const dataDir = path.join(rootDir, 'moved portable data');
  fs.mkdirSync(dataDir);
  fs.writeFileSync(path.join(dataDir, 'original.txt'), 'same portable data');
  const executable = path.join(rootDir, 'service fixture');
  fs.writeFileSync(executable, fixture, { mode: 0o700 });
  const previousExecutable = process.env.ENDERLOOM_SERVICE_PATH;
  process.env.ENDERLOOM_SERVICE_PATH = executable;
  const service = new LauncherService({ rootDir, dataDir, env: { ENDERLOOM_HANDSHAKE_QA_MODE: mode } });
  const started = () => fs.readdirSync(dataDir).filter(name => name.startsWith('started-'))
    .map(name => Number(name.slice('started-'.length)));
  t.after(async () => {
    try { await service.close(); } finally {
      for (const pid of started()) if (pidAlive(pid)) process.kill(pid, 'SIGKILL');
      fs.rmSync(rootDir, { recursive: true, force: true });
      if (previousExecutable === undefined) delete process.env.ENDERLOOM_SERVICE_PATH;
      else process.env.ENDERLOOM_SERVICE_PATH = previousExecutable;
    }
  });
  return { service, started };
}

async function retry(service, oldPid, started) {
  assert.equal(pidAlive(oldPid), false, 'old launcher backend remained alive on retry');
  assert.equal(service.snapshot().state, 'failed');
  service.env.ENDERLOOM_HANDSHAKE_QA_MODE = 'normal';
  const next = await service.request('get_app_info');
  assert.equal(next.command, 'get_app_info');
  assert.equal(next.marker, 'same portable data');
  assert.notEqual(next.pid, oldPid);
  assert.equal(started().length, 2);
  await service.close();
  assert.equal(pidAlive(next.pid), false);
}

const skip = process.platform === 'win32' && 'The owned POSIX executable fixture requires a shebang.';
test('rejects a bad startup version, ignores late ready, and reaps before retry', { skip, timeout: 5500 }, async t => {
  const { service, started } = createFixture(t, 'boot-mismatch');
  const readyEvents = [];
  service.on('event', event => { if (event.event === 'service:ready') readyEvents.push(event); });
  const results = await Promise.allSettled([service.start(), service.start()]);
  for (const result of results) {
    assert.equal(result.status, 'rejected');
    assert.match(result.reason.message, /protocol mismatch/);
  }
  assert.equal(started().length, 1);
  assert.equal(readyEvents.length, 0);
  await retry(service, started()[0], started);
});

test('rejects a bad response from a running service before replacing it', { skip, timeout: 5500 }, async t => {
  const { service, started } = createFixture(t, 'request-mismatch');
  const { pid } = await service.start();
  await assert.rejects(service.request('get_app_info'), /protocol mismatch/);
  await retry(service, pid, started);
});

test('a silent child that ignores EOF is reaped after the actual handshake deadline', { skip, timeout: 22000 }, async t => {
  const { service, started } = createFixture(t, 'boot-silent');
  await assert.rejects(service.start(), /handshake timed out/);
  assert.equal(started().length, 1);
  await retry(service, started()[0], started);
});
