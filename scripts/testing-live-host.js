"use strict";
const fs=require('fs'),path=require('path');
const {LauncherService}=require('../src/launcher-service');
if(!process.argv.includes('--live-account'))throw Error('Pass --live-account');
const root=path.resolve(__dirname,'..');process.env.ENDERLOOM_SERVICE_PATH=path.join(root,'native/target/debug/enderloom-service.exe');
const service=new LauncherService({rootDir:root,resourcesDir:root,dataDir:path.join(process.env.APPDATA,'Enderloom/launcher')});
(async()=>{
  const source=JSON.parse(fs.readFileSync(path.join(root,'output/aether-acceptance/source.json')));
  const result=await service.request('start_testing_session',{instanceId:source.id,recordVideo:process.argv.includes('--record'),maxSeconds:1800},{timeoutMs:600000});
  fs.writeFileSync(path.join(root,'output/aether-acceptance/session.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify({testId:result.id,state:result.state,error:result.error,report_dir:result.report_dir}));
  if(result.state!=='running') {await service.close();return;}
  const timer=setInterval(async()=>{try {const r=await service.request('get_testing_report',{testId:result.id});if(r.finished_at){clearInterval(timer);console.log('Test finished:',r.state);await service.close();}}catch(e){console.error(e)}},5000);
})().catch(async e=>{console.error(e);await service.close();process.exitCode=1});
