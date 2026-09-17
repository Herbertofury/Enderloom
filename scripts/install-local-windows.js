'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

async function install() {
  if (process.platform !== 'win32') throw new Error('This launcher installer is for Windows');
  const root = path.resolve(__dirname, '..');
  const runtime = path.join(root, 'node_modules/electron/dist');
  const installDir = path.join(process.env.LOCALAPPDATA, 'Programs/Enderloom');
  const marker = path.join(installDir, 'enderloom-local-install.json');
  if (fs.existsSync(installDir) && !fs.existsSync(marker)) throw new Error('Existing unrecognized Enderloom installation; refusing to overwrite it');
  for (const file of ['main.js', 'launcher/dist/index.html', 'native/target/debug/enderloom-service.exe']) {
    if (!fs.existsSync(path.join(root, file))) throw new Error(`Build Enderloom first: missing ${file}`);
  }
  fs.mkdirSync(installDir, { recursive: true });
  fs.writeFileSync(marker, JSON.stringify({ kind: 'enderloom-local-workspace', workspace: root, version: require('../package.json').version }, null, 2));
  // Keep a stable branded executable path while the workspace continues to improve.
  // User data stays in the existing AppData/enderloom profile, outside this runtime.
  fs.cpSync(runtime, installDir, { recursive: true, filter: source => !source.endsWith('default_app.asar') && !source.endsWith('electron.exe') });
  const executable = path.join(installDir, 'Enderloom.exe');
  fs.copyFileSync(path.join(runtime, 'electron.exe'), executable);
  const appDir = path.join(installDir, 'resources/app');
  fs.mkdirSync(appDir, { recursive: true });
  fs.writeFileSync(path.join(appDir, 'package.json'), JSON.stringify({ name: 'enderloom', productName: 'Enderloom', version: require('../package.json').version, main: 'index.cjs' }));
  fs.writeFileSync(path.join(appDir, 'index.cjs'), `'use strict';\nconst {app,dialog}=require('electron');\nconst root=${JSON.stringify(root)};\nif(!require('node:fs').existsSync(require('node:path').join(root,'main.js'))){app.whenReady().then(()=>{dialog.showErrorBox('Enderloom workspace unavailable','The Enderloom workspace has moved. Run the Windows launcher installer from its new location.');app.exit(1)});}else{require(require('node:path').join(root,'main.js'));}\n`);
  const electronEnv = { ...process.env }; delete electronEnv.ELECTRON_RUN_AS_NODE;
  const helper = spawnSync(path.join(runtime, 'electron.exe'), [path.join(__dirname, 'windows-shortcuts.cjs'), installDir], { stdio: 'inherit', windowsHide: true, env: electronEnv });
  if (helper.status !== 0) throw new Error('Windows shortcut creation failed');
  const { rcedit } = await import('rcedit');
  await rcedit(executable, { icon: path.join(installDir, 'Enderloom.ico'),
    'file-version': require('../package.json').version, 'product-version': require('../package.json').version,
    'version-string': { ProductName: 'Enderloom', FileDescription: 'Enderloom', CompanyName: 'Herbertofury', OriginalFilename: 'Enderloom.exe', InternalName: 'Enderloom' } });
  console.log(JSON.stringify({ installed: true, executable, workspace: root, ...JSON.parse(fs.readFileSync(path.join(installDir, 'shortcuts.json'), 'utf8')) }, null, 2));
}
install().catch(error => { console.error(error.message); process.exitCode = 1; });
