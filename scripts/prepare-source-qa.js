'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { prepare } = require('./prepare-source');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'Enderloom source freshness '));
const write = (name, text = 'fixture') => { const file = path.join(root, name); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); };
let commands = [], fail = '', mutate = false, lateMutate = false;
const exe = process.platform === 'win32' ? '.exe' : '';
function run(args) {
  const command = args.join(' '); commands.push(command);
  if (command === fail) throw new Error('injected failure');
  if (command === 'ci') write(`node_modules/electron/dist/electron${exe}`);
  if (command === 'run build:launcher') { write('launcher/dist/index.html'); if (mutate) write('launcher/src/app.ts', 'changed during build'); }
  if (command === 'run build:launcher-service') { write(`native/target/debug/enderloom-service${exe}`); if (lateMutate) write('launcher/src/app.ts', 'late edit'); }
}
function check(expected) { commands = []; prepare(root, run, {}); assert.deepEqual(commands, expected); }
try {
  write('package-lock.json'); write('launcher/src/app.ts'); write('native/src/main.rs');
  const shell = ['ci'], frontend = ['--prefix launcher ci', 'run build:launcher'], native = ['run build:launcher-service'];
  check([...shell, ...frontend, ...native]); check([]);
  write('launcher/src/app.ts', 'updated'); check(frontend); check([]);
  write('native/src/main.rs', 'updated'); check(native);
  write('package-lock.json', 'updated'); check(shell);
  write('launcher/dist/index.html', 'corrupt'); check(frontend);
  fs.unlinkSync(path.join(root, 'launcher/src/app.ts')); check(frontend);
  write('launcher/src/app.ts', 'retry'); fail = 'run build:launcher';
  assert.throws(() => prepare(root, run, {}), /injected failure/); fail = ''; check(frontend); check([]);
  write('launcher/src/app.ts', 'before'); mutate = true;
  assert.throws(() => prepare(root, run, {}), /Source changed/); mutate = false; check(frontend);
  fs.writeFileSync(path.join(root, '.enderloom-runtime/source-build.json'), 'broken json'); check([...shell, ...frontend, ...native]);
  for (const invalid of ['null', '[]', 'true', '42']) { write('.enderloom-runtime/source-build.json', invalid); check([...shell, ...frontend, ...native]); }
  write('native/.cargo/config.toml'); check(native);
  write('package.json', 'changed build commands'); check([...shell, ...frontend, ...native]);
  write('native/src/main.rs', 'late build'); lateMutate = true;
  assert.throws(() => prepare(root, run, {}), /Source changed during preparation/); lateMutate = false; check(frontend);
  write('.enderloom-runtime/source-build.lock'); assert.throws(() => prepare(root, run, {}), /already running/);
  console.log('PASS: clean, unchanged, source updates/deletion, dependency update, corrupt output, failed-build retry, mid-build edit, corrupt receipt and concurrent-launch protection');
} finally { fs.rmSync(root, { recursive: true, force: true }); }
