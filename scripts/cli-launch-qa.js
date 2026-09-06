'use strict';
// Explicit live-account acceptance. Creates only a new vanilla instance and
// removes that instance through the domain API after preserving launch evidence.
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const {spawn}=require('child_process');
const {LauncherService}=require('../src/launcher-service');
if(!process.argv.includes('--live-account'))throw Error('Use --live-account to test with the signed-in Minecraft account');
const root=path.resolve(__dirname,'..'),data=process.env.ENDERLOOM_DATA_DIR||path.join(process.env.APPDATA,'Enderloom','launcher');
const binary=path.join(root,'native/target/debug/enderloom.exe');
const output=path.join(root,'output/playwright/cli-live-launch');fs.mkdirSync(output,{recursive:true});
const service=new LauncherService({rootDir:root,dataDir:data,resourcesDir:root});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let instance,detached,waiting;
function cli(args){
  const child=spawn(binary,['--data-dir',data,...args,'--jsonl'],{windowsHide:true,stdio:['ignore','pipe','pipe']});
  let stdout='',stderr='';child.stdout.on('data',chunk=>stdout+=chunk);child.stderr.on('data',chunk=>stderr+=chunk);
  const finished=new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',code=>resolve({code,stdout,stderr,rows:stdout.trim().split(/\r?\n/).filter(Boolean).map(line=>JSON.parse(line))}));});
  return {child,finished};
}
async function stopped(run){
  for(let i=0;i<100;i++){
    if(!(await service.request('list_running')).some(r=>r.running_id===run&&['running','stopping'].includes(r.state)))return;
    await delay(100);
  }
  assert.fail('Owned process did not stop');
}
(async()=>{
  await service.start();
  assert((await service.request('list_accounts')).some(a=>a.active),'No active Minecraft account');
  const before=await service.request('list_instances');
  const settings=await service.request('get_settings');
  instance=await service.request('create_instance',{name:`CLI live acceptance ${Date.now()}`,versionId:'1.20.1',loader:null,loaderVersion:null});
  console.log('Created disposable vanilla instance; installing Minecraft through the shared domain.');
  await service.request('update_instance',{instanceId:instance.id,name:instance.name,versionId:'1.20.1',minMemoryMb:512,maxMemoryMb:2048,loader:null,loaderVersion:null,javaPath:null,jvmArgs:null,jvmArgsMode:null,envVars:null,envVarsMode:null});
  await service.request('install_instance',{instanceId:instance.id},{timeoutMs:600000});
  const java=await service.request('get_java_status',{instanceId:instance.id});
  fs.writeFileSync(path.join(output,'java.json'),JSON.stringify(java,null,2));
  // The normal launch resolver verifies the exact runtime; install a managed
  // Java 17 for this fixture if the host has no compatible one.
  if(!java.ok) {
    await service.request('install_java_runtime',{major:17,instanceId:instance.id},{timeoutMs:600000});
  }
  const start=await cli(['launch',instance.id,'--detach','--timeout','120s']).finished;
  fs.writeFileSync(path.join(output,'detach.jsonl'),start.stdout);
  const startResult=start.rows.findLast(r=>r.type==='result');
  assert.equal(start.code,0,startResult?.error?.message||start.stderr);
  detached=startResult.result.running_id;
  console.log('Detached CLI returned; waiting for the actual Minecraft renderer log.');
  let log=[];
  for(let attempt=0;attempt<180;attempt++){
    log=await service.request('get_logs',{runningId:detached});
    if(log.some(l=>/OpenAL initialized|Created:.*atlas|Reloading ResourceManager/.test(l.line)))break;
    const run=(await service.request('list_running')).find(r=>r.running_id===detached);
    assert.equal(run?.state,'running',`Minecraft exited before rendering: ${JSON.stringify(log.slice(-12))}`);
    await delay(500);
  }
  assert(log.some(l=>/OpenAL initialized|Created:.*atlas|Reloading ResourceManager/.test(l.line)),'No actual client initialization evidence');
  const logs=await cli(['process','logs',detached,'--follow','--timeout','1s']).finished;
  assert.equal(logs.code,6);
  assert((await service.request('list_running')).some(r=>r.running_id===detached&&r.state==='running'),'A log-follow timeout killed a pre-existing run');
  fs.writeFileSync(path.join(output,'follow-timeout.jsonl'),logs.stdout);
  await service.request('kill_instance',{runningId:detached});await stopped(detached);detached=null;
  // A waiting launch owns its newly started run, so timeout must clean just it.
  console.log('Testing wait timeout and ownership-scoped cleanup with the real client.');
  waiting=cli(['launch',instance.id,'--wait','--timeout','15s']);
  const wait=await waiting.finished;waiting=null;
  fs.writeFileSync(path.join(output,'wait-timeout.jsonl'),wait.stdout);
  assert.equal(wait.code,6,wait.stdout+'\n'+wait.stderr);
  const owned=wait.rows.find(r=>r.event==='launch:started')?.payload?.running_id;
  assert(owned,'Waiting launch never started a process');await stopped(owned);
  assert(wait.rows.some(r=>r.event==='launch:cleanup'&&r.payload.stopped),'No cleanup evidence');
  // Deliberately invalid JVM flag exercises a genuine unsuccessful game exit.
  await service.request('update_instance',{instanceId:instance.id,name:instance.name,versionId:'1.20.1',minMemoryMb:512,maxMemoryMb:2048,loader:null,loaderVersion:null,javaPath:null,jvmArgs:'-XX:EnderloomDeliberateInvalidOption',jvmArgsMode:'append',envVars:null,envVarsMode:null});
  const failed=await cli(['launch',instance.id,'--wait','--timeout','30s']).finished;
  fs.writeFileSync(path.join(output,'failed-exit.jsonl'),failed.stdout);
  assert.equal(failed.code,5,failed.stdout+'\n'+failed.stderr);
  const failure=failed.rows.findLast(r=>r.type==='result');assert.equal(failure.ok,false);assert.notEqual(failure.result.exit_code,0);
  await service.request('delete_instance',{instanceId:instance.id});instance=null;
  assert.deepEqual(await service.request('list_instances'),before,'An existing profile changed');
  assert.deepEqual(await service.request('get_settings'),settings,'Global settings changed');
  const report={passed:true,realMinecraft:'1.20.1',detachedClientInitialized:true,logTimeoutPreservedPreexistingRun:true,waitTimeoutStoppedOwnedRun:true,unsuccessfulExitCode:5,existingProfilesUnchanged:true,globalSettingsUnchanged:true,disposableInstanceRemoved:true,binarySha256:crypto.createHash('sha256').update(fs.readFileSync(binary)).digest('hex'),performanceBenchmark:false};
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{
  if(waiting?.child.exitCode===null)waiting.child.kill();
  if(instance){
    try{for(const run of await service.request('list_running'))if(run.instance_id===instance.id&&run.state==='running'){await service.request('kill_instance',{runningId:run.running_id});await stopped(run.running_id);}}catch{}
    try{await service.request('delete_instance',{instanceId:instance.id});}catch(error){console.error('Fixture cleanup needs attention:',instance.id,error.message);}
  }
  await service.close().catch(()=>{});
});
