'use strict';
// Source builds are reusable only when inputs AND outputs still match. A failed
// build must never bless a stale/partial binary as current on the next launch.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
function digest(root, paths) {
  const hash = crypto.createHash('sha256');
  const buffer = Buffer.allocUnsafe(1024 * 1024);
  function visit(relative) {
    const file = path.join(root, relative);
    if (!fs.existsSync(file)) { hash.update(relative + '\0missing\0'); return; }
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink()) throw new Error(`Refusing symbolic build input: ${relative}`);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(file).sort()) visit(path.join(relative, name));
    } else {
      hash.update(relative + '\0');
      const fd = fs.openSync(file, 'r');
      try {
        let count;
        while ((count = fs.readSync(fd, buffer, 0, buffer.length, null)) > 0) hash.update(buffer.subarray(0, count));
      } finally { fs.closeSync(fd); }
      hash.update('\0');
    }
  }
  paths.forEach(visit);
  return hash.digest('hex');
}
function prepare(root, run = args => {
  const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, {
    cwd: root, stdio: 'inherit', shell: process.platform === 'win32',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`npm ${args.join(' ')} failed (${result.status})`);
}, env = process.env) {
  const stateDir = path.join(root, '.enderloom-runtime');
  fs.mkdirSync(stateDir, { recursive: true });
  // Prevent two launches from racing npm ci, compilation, and receipt writes.
  const lock = path.join(stateDir, 'source-build.lock');
  let fd;
  try { fd = fs.openSync(lock, 'wx'); }
  catch (error) { if (error.code === 'EEXIST') throw new Error('Source preparation is already running. If a previous run crashed, remove .enderloom-runtime/source-build.lock after confirming it has stopped.'); throw error; }
  try {
    const receiptPath = path.join(stateDir, 'source-build.json');
    let receipt = {};
    try { receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8')); } catch {}
    if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) receipt = {};
    const runtime = `${process.platform}/${process.arch}/${process.versions.node}`;
    const stages = [
      { id: 'shell', input: ['package.json', 'package-lock.json'], output: ['node_modules/electron/dist'], required: `node_modules/electron/dist/${process.platform === 'win32' ? 'electron.exe' : 'electron'}`, commands: [['ci']] },
      { id: 'launcher', input: ['package.json', 'launcher/src', 'launcher/public', 'launcher/index.html', 'launcher/package.json', 'launcher/package-lock.json', 'launcher/tsconfig.json', 'launcher/tsconfig.node.json', 'launcher/vite.config.ts', 'launcher/.env', 'launcher/.env.local', 'launcher/.env.production', 'launcher/.env.production.local'], output: ['launcher/dist'], required: 'launcher/dist/index.html', commands: [['--prefix', 'launcher', 'ci'], ['run', 'build:launcher']] },
      { id: 'native', input: ['package.json', '.cargo', 'native/.cargo', 'rust-toolchain', 'rust-toolchain.toml', 'native/rust-toolchain', 'native/rust-toolchain.toml', 'native/src', 'native/Cargo.toml', 'native/Cargo.lock', 'native/build.rs', 'native/capabilities', 'native/icons', 'native/tauri.conf.json', 'native/tauri.linux.conf.json', 'native/tauri.updater.conf.json'], output: [`native/target/debug/enderloom-service${process.platform === 'win32' ? '.exe' : ''}`], required: `native/target/debug/enderloom-service${process.platform === 'win32' ? '.exe' : ''}`, commands: [['run', 'build:launcher-service']] },
    ];
    const completedInputs = [];
    for (const stage of stages) {
      const buildEnv = stage.id === 'native' ? Object.keys(env).filter(k => /^(BASALT_|CARGO_|RUST|GITHUB_RUN_)/.test(k)).sort().map(k => [k, env[k]]) : stage.id === 'launcher' ? Object.keys(env).filter(k => /^(VITE_|TAURI_)/.test(k)).sort().map(k => [k, env[k]]) : [];
      const input = crypto.createHash('sha256').update(JSON.stringify([runtime, buildEnv, digest(root, stage.input)])).digest('hex');
      const sourceDigest = digest(root, stage.input);
      completedInputs.push([stage.input, sourceDigest]);
      const previous = receipt[stage.id];
      if (previous?.input === input && fs.existsSync(path.join(root, stage.required)) && previous.output === digest(root, stage.output)) continue;
      // Invalidate BEFORE running any mutating command, even when old output exists.
      delete receipt[stage.id];
      fs.writeFileSync(receiptPath, JSON.stringify(receipt));
      for (const command of stage.commands) run(command);
      if (!fs.existsSync(path.join(root, stage.required))) throw new Error(`${stage.id} build did not produce ${stage.required}`);
      if (digest(root, stage.input) !== sourceDigest) throw new Error('Source changed during build; retry preparation.');
      receipt[stage.id] = { input, output: digest(root, stage.output) };
      fs.writeFileSync(receiptPath, JSON.stringify(receipt));
    }
    for (const [paths, expected] of completedInputs) {
      if (digest(root, paths) !== expected) throw new Error('Source changed during preparation; retry before launching.');
    }
  } finally { fs.closeSync(fd); fs.unlinkSync(lock); }
}
if (require.main === module) {
  try {
    if (Number(process.versions.node.split('.')[0]) < 22) throw new Error('Enderloom source startup requires Node.js 22 or newer.');
    prepare(path.resolve(__dirname, '..'));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { prepare, digest };
