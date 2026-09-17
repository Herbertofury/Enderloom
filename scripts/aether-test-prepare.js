"use strict";
// Real isolated acceptance source. Nothing is installed into an existing user instance.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {LauncherService}=require('../src/launcher-service');
if(!process.argv.includes('--live-account'))throw Error('Use --live-account for the authorized signed-in game test');
const root=path.resolve(__dirname,'..');
process.env.ENDERLOOM_SERVICE_PATH=path.join(root,'native/target/debug/enderloom-service.exe');
const service=new LauncherService({rootDir:root,dataDir:path.join(process.env.APPDATA,'Enderloom/launcher'),resourcesDir:root});
(async()=>{
  const out=path.join(root,'output/aether-acceptance');fs.mkdirSync(out,{recursive:true});
  const versions=await service.request('list_loader_versions',{loader:'neoforge',gameVersion:'1.21.1'});
  const loaderVersion=versions.find(v=>!v.includes('beta'))||versions[0];
  const instance=await service.request('create_instance',{name:'Aether · Testing Lab acceptance',versionId:'1.21.1',loader:'neoforge',loaderVersion});
  fs.writeFileSync(path.join(out,'source.json'),JSON.stringify(instance,null,2));
  await service.request('update_instance',{instanceId:instance.id,name:instance.name,versionId:'1.21.1',loader:'neoforge',loaderVersion,minMemoryMb:1024,maxMemoryMb:4096,javaPath:null,jvmArgs:null,jvmArgsMode:null,envVars:null,envVarsMode:null});
  console.log('Installing Minecraft 1.21.1 / NeoForge',loaderVersion,instance.id);
  await service.request('install_instance',{instanceId:instance.id},{timeoutMs:600000});
  const artifacts=[];
  for(const versionId of ['K5X5qMwG','NMCHU6DZ','v5qtqRQi']){
    const v=await(await fetch('https://api.modrinth.com/v2/version/'+versionId)).json();const file=v.files.find(f=>f.primary)||v.files[0];
    const response=await fetch(file.url);if(!response.ok)throw Error('Download '+response.status);const bytes=Buffer.from(await response.arrayBuffer());
    if(crypto.createHash('sha512').update(bytes).digest('hex')!==file.hashes.sha512)throw Error('Checksum failed: '+file.filename);
    fs.mkdirSync(path.join(instance.dir,'mods'),{recursive:true});fs.writeFileSync(path.join(instance.dir,'mods',file.filename),bytes);
    artifacts.push({project_id:v.project_id,version_id:v.id,version:v.version_number,file:file.filename,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),sha512:file.hashes.sha512,url:file.url});console.log('Verified',file.filename);
  }
  fs.writeFileSync(path.join(instance.dir,'options.txt'),'renderDistance:8\nsimulationDistance:6\nmaxFps:120\nenableVsync:false\npauseOnLostFocus:false\nfullscreen:false\n');
  fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({minecraft:'1.21.1',loader:'neoforge',loaderVersion,instanceId:instance.id,mods:artifacts},null,2));
  console.log('READY',instance.id);
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>service.close());
