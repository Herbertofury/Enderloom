'use strict';
const fs=require('fs');const path=require('path');const {spawn}=require('child_process');
const root=path.resolve(__dirname,'..');
let moduleElectron='';
try {
  const resolved=require('electron');
  if(typeof resolved==='string')moduleElectron=resolved;
}catch{}
const candidates = [
  process.env.ELECTRON_PATH,
  moduleElectron,
  path.join(root, 'node_modules', 'electron', 'dist', process.platform === 'win32' ? 'electron.exe' : 'electron'),
].filter(Boolean);
let exe;
for (const candidate of candidates) {
  try {
    const absolute = fs.realpathSync.native(candidate);
    if (fs.statSync(absolute).isFile()) {
      exe = absolute;
      break;
    }
  } catch {}
}
if (!exe) {
  console.error('Electron runtime not found. Install the project Electron dependency, use the packaged Enderloom build, or set ELECTRON_PATH to the Electron executable.');
  process.exit(2);
}
// Launch the exact path checked above. A bare name would be resolved against
// PATH by spawn(), even when it was found in the caller's working directory.
const child = spawn(exe, [root, ...process.argv.slice(2)], { stdio: 'inherit' });
child.once('error', (error) => {
  console.error(`Could not start the Enderloom Electron runtime at "${exe}": ${error.code || error.message}.`);
  process.exitCode = 1;
});
child.once('exit', (code) => { process.exitCode = code ?? 1; });
