'use strict';

// For a user-authorized local CurseForge installation. Never print or save the key in a file.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const https = require('node:https');
const {LauncherService} = require('../src/launcher-service');

async function main() {
  const mode = process.argv[2];
  if (!['--verify', '--restore'].includes(mode) || process.platform !== 'win32') {
    throw new Error('On Windows, run with --verify or --restore.');
  }
  const file = path.join(process.env.LOCALAPPDATA, 'Programs', 'CurseForge Windows', 'resources', 'app.asar');
  const asar = fs.readFileSync(file);
  const headerLength = asar.readUInt32LE(4);
  const jsonLength = asar.readUInt32LE(12);
  const header = JSON.parse(asar.subarray(16, 16 + jsonLength));
  const entry = header.files.dist.files.background.files['background.js'];
  const start = 8 + headerLength + Number(entry.offset);
  const source = asar.subarray(start, start + entry.size).toString();
  const anchor = source.indexOf('let lo=()=>({');
  const assignment = anchor < 0 ? -1 : source.lastIndexOf('let rO=', anchor);
  const match = assignment < 0 ? null : /^let rO=("(?:\\.|[^"\\])*")/.exec(source.slice(assignment));
  if (!match) throw new Error('This CurseForge version is not recognized; use the approved key in Settings instead.');
  const key = JSON.parse(match[1]);
  const hits = await new Promise((resolve, reject) => {
    const req = https.get('https://api.curseforge.com/v1/mods/search?gameId=432&searchFilter=Create&pageSize=5', {headers:{'x-api-key':key}}, res => {
      let body=''; res.setEncoding('utf8'); res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) return reject(new Error(`CurseForge did not accept the candidate (HTTP ${res.statusCode}).`));
        try { const data=JSON.parse(body).data; if (!Array.isArray(data) || !data.length) throw new Error(); resolve(data.length); }
        catch { reject(new Error('CurseForge did not return valid search results.')); }
      });
    });
    req.setTimeout(15000, () => req.destroy());
    req.on('error', () => reject(new Error('Could not validate the credential with CurseForge.')));
  });
  if (mode === '--verify') return console.log(`Credential verified with CurseForge (${hits} search results); nothing changed.`);

  const rootDir=path.resolve(__dirname, '..');
  const dataDir=fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-credential-recovery-'));
  const service=new LauncherService({rootDir, resourcesDir:null, dataDir});
  try {
    await service.start();
    const settings=await service.request('get_settings');
    if (settings.curseforge_api_key) return console.log('A saved credential already exists; it was left unchanged.');
    settings.curseforge_api_key=key;
    await service.request('update_settings', {settings});
    const saved=await service.request('get_settings');
    if (!saved.curseforge_api_key) throw new Error('Windows did not confirm the saved credential.');
    console.log('Credential verified and saved in Windows Credential Manager. Restart Enderloom.');
  } finally { await service.close(); }
}
main().catch(() => { console.error('Credential recovery failed; check the installed CurseForge version and use an approved key in Settings if needed.'); process.exitCode=1; });
