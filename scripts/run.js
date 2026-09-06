'use strict';
const fs=require('fs');const path=require('path');const {spawn}=require('child_process');
const root=path.resolve(__dirname,'..');
const candidates=[process.env.ELECTRON_PATH,path.join(root,'node_modules','electron','dist',process.platform==='win32'?'electron.exe':'electron')].filter(Boolean);
const exe=candidates.find(p=>fs.existsSync(p));
if(!exe){console.error('Electron runtime not found. Use the packaged Enderloom build, install Electron 44, or set ELECTRON_PATH to the Electron executable.');process.exit(2)}
const args=process.argv.slice(2);
if(args.includes('--self-test')){
  const launcherEntry=path.join(root,'launcher','dist','index.html');
  const serviceName=process.platform==='win32'?'enderloom-service.exe':'enderloom-service';
  const serviceCandidates=[
    process.env.ENDERLOOM_SERVICE_PATH,
    path.join(root,'native','target','release',serviceName),
    path.join(root,'native','target','debug',serviceName),
  ].filter(Boolean);
  const service=serviceCandidates.find(p=>fs.existsSync(p));
  const missing=[];
  if(!fs.existsSync(launcherEntry))missing.push('launcher/dist/index.html');
  if(!service)missing.push(`native launcher service (${serviceName})`);
  if(missing.length){
    console.error(`Enderloom Electron self-test requires a current integration build. Missing: ${missing.join(', ')}. Run npm ci --prefix launcher && npm run build:integration first.`);
    process.exit(3);
  }
}
const child=spawn(exe,[root,...args],{stdio:'inherit'});child.on('exit',code=>process.exit(code??1));
