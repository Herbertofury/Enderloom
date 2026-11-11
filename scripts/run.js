'use strict';
const fs=require('fs');const path=require('path');const {spawn}=require('child_process');
const root=path.resolve(__dirname,'..');
let moduleElectron='';
try {
  const resolved=require('electron');
  if(typeof resolved==='string')moduleElectron=resolved;
}catch{}
const candidates=[
  process.env.ELECTRON_PATH,
  moduleElectron,
  path.join(root,'node_modules','electron','dist',process.platform==='win32'?'electron.exe':'electron')
].filter(Boolean);
const exe=candidates.find(p=>fs.existsSync(p));
if(!exe){console.error('Electron runtime not found. Install the project Electron dependency, use the packaged Enderloom build, or set ELECTRON_PATH to the Electron executable.');process.exit(2)}
const child=spawn(exe,[root,...process.argv.slice(2)],{stdio:'inherit'});child.on('exit',code=>process.exit(code??1));
