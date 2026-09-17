'use strict';
// Runs in Electron so shortcut properties and icon scaling use Windows/Electron APIs.
const { app, nativeImage, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
app.whenReady().then(() => {
  const install = process.argv[2];
  if (!install || !path.isAbsolute(install)) throw new Error('Expected an absolute install directory');
  const original = nativeImage.createFromPath(path.join(root, 'launcher/public/logo.png'));
  if (original.isEmpty()) throw new Error('Enderloom logo could not be read');
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const images = sizes.map(size => original.resize({ width: size, height: size, quality: 'best' }).toPNG());
  const header = Buffer.alloc(6 + 16 * sizes.length);
  header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  sizes.forEach((size, i) => {
    const entry = 6 + i * 16;
    header[entry] = header[entry + 1] = size === 256 ? 0 : size;
    header.writeUInt16LE(1, entry + 4); header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(images[i].length, entry + 8); header.writeUInt32LE(offset, entry + 12);
    offset += images[i].length;
  });
  const ico = Buffer.concat([header, ...images]);
  const icon = path.join(install, 'Enderloom.ico');
  fs.writeFileSync(icon, ico);
  fs.writeFileSync(path.join(root, 'launcher/public/enderloom.ico'), ico);
  const target = path.join(install, 'Enderloom.exe');
  const details = { target, args: '--launcher', cwd: root, icon, iconIndex: 0,
    appUserModelId: 'com.herbertofury.enderloom', description: 'Enderloom — Minecraft mod manager and research workspace' };
  const shortcuts = [path.join(app.getPath('desktop'), 'Enderloom.lnk'),
    path.join(app.getPath('appData'), 'Microsoft/Windows/Start Menu/Programs/Enderloom.lnk')];
  for (const shortcut of shortcuts) {
    fs.mkdirSync(path.dirname(shortcut), { recursive: true });
    if (!shell.writeShortcutLink(shortcut, 'create', details)) throw new Error(`Could not create ${shortcut}`);
    const actual = shell.readShortcutLink(shortcut);
    if (actual.target !== target || actual.appUserModelId !== details.appUserModelId) throw new Error('Shortcut identity did not persist');
  }
  fs.writeFileSync(path.join(install, 'shortcuts.json'), JSON.stringify({ shortcuts, ...details }, null, 2));
  app.exit(0);
}).catch(error => { console.error(error); app.exit(1); });
