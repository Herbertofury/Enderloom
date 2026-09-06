'use strict';
const assert=require('assert/strict'),fs=require('fs'),os=require('os'),path=require('path'),net=require('net');
const {spawn,spawnSync}=require('child_process');
const {LauncherService}=require('../src/launcher-service');
const root=path.resolve(__dirname,'..'),temporary=fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-cli-shared-'));
const data=path.join(temporary,'data'),binary=path.join(root,'native/target/debug',process.platform==='win32'?'enderloom.exe':'enderloom');
const env={ENDERLOOM_QA_MODE:'1',ENDERLOOM_QA_NODE:process.execPath,ENDERLOOM_QA_PROCESS_SCRIPT:path.join(root,'scripts/launcher-process-probe.js')};
const makeService=()=>new LauncherService({rootDir:root,dataDir:data,resourcesDir:root,env});
let service=makeService(),follower,run;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function cli(args,input={}){
  const child=spawnSync(binary,['--data-dir',data,...args,'--json'],{input:JSON.stringify(input),encoding:'utf8',timeout:15000,windowsHide:true});
  assert.equal(child.status,0,child.stderr+'\n'+child.stdout);
  return JSON.parse(child.stdout).result;
}
(async()=>{
  await service.start();
  const owner=service.snapshot().pid;
  const instance=await service.request('create_instance',{name:'Shared service fixture',versionId:'1.20.1',loader:null,loaderVersion:null});
  assert.equal(cli(['instance','show',instance.id]).id,instance.id);
  cli(['operation','run','set_instance_notes'],{instanceId:instance.id,notes:'Written by CLI through the current owner'});
  assert((await service.request('list_instances')).some(i=>i.id===instance.id&&i.notes==='Written by CLI through the current owner'));
  // The CLI sees and cancels the GUI owner's actual in-memory task registry.
  const installing=service.request('install_instance',{instanceId:instance.id}).then(()=>null,error=>error);
  for(let attempt=0;attempt<100;attempt++){
    if((await service.request('list_tasks')).some(t=>t.instance_id===instance.id&&t.state==='running'))break;
    await delay(20);
  }
  const tasks=cli(['task','list']);
  const install=tasks.find(t=>t.instance_id===instance.id&&t.state==='running');
  assert(install,`CLI missed the existing service install task: ${JSON.stringify({cli:tasks,gui:await service.request('list_tasks')})}`);
  assert.equal(cli(['task','show',install.id]).id,install.id);
  assert.equal(cli(['task','cancel',install.id]).cancellation_requested,true);
  assert.match(String(await installing),/cancel/i);
  for(let attempt=0;attempt<100;attempt++){
    const task=(await service.request('list_tasks')).find(t=>t.id===install.id);
    if(task?.state==='cancelled')break;
    if(attempt===99)assert.fail('Cancellation did not reach the owning service');
    await delay(50);
  }
  const endpoint=JSON.parse(fs.readFileSync(path.join(data,'.enderloom-control.json'),'utf8'));
  assert.equal(endpoint.pid,owner);
  await new Promise((resolve,reject)=>{
    const socket=net.createConnection({host:'127.0.0.1',port:endpoint.port});
    const timer=setTimeout(()=>{socket.destroy();reject(Error('Unauthenticated connection was not closed'));},3000);
    socket.once('connect',()=>socket.write(JSON.stringify({protocol:1,token:'invalid'})+'\n'));
    socket.on('data',()=>reject(Error('Unauthenticated endpoint returned data')));
    socket.once('close',()=>{clearTimeout(timer);resolve();});
    socket.on('error',()=>{});
  });
  run=await service.request('qa_process_contract',{instanceId:instance.id});
  await service.close();
  // Now a long-lived CLI owns the shared runtime; the Electron adapter attaches to it.
  follower=spawn(binary,['--data-dir',data,'process','logs',run,'--follow','--jsonl','--timeout','20s'],{encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe']});
  let stdout='',stderr='';follower.stdout.on('data',chunk=>stdout+=chunk);follower.stderr.on('data',chunk=>stderr+=chunk);
  const finished=new Promise(resolve=>follower.once('exit',code=>resolve(code)));
  for(let attempt=0;attempt<100;attempt++){
    try{if(JSON.parse(fs.readFileSync(path.join(data,'.enderloom-control.json'),'utf8')).pid===follower.pid)break;}catch{}
    if(attempt===99)assert.fail('CLI did not publish its own shared endpoint');
    await delay(50);
  }
  service=makeService();await service.start();
  assert.equal(service.snapshot().pid,follower.pid);
  assert.equal(service.child,null,'Electron adapter started a second service owner');
  assert((await service.request('list_running')).some(r=>r.running_id===run&&r.state==='running'));
  await delay(400);
  await service.request('kill_instance',{runningId:run});
  assert.equal(await finished,0,stderr+'\n'+stdout);
  const lines=stdout.trim().split(/\r?\n/).map(line=>JSON.parse(line));
  assert(lines.some(e=>e.type==='event'&&e.event==='process:log'));
  const result=lines.findLast(e=>e.type==='result');assert(result?.ok);
  assert(result.result.some(l=>/enderloom-ipc-stdout/.test(l.line)));
  run=null;
  console.log(JSON.stringify({passed:true,cliAttachedToGuiOwner:true,guiAdapterAttachedToCliOwner:true,sharedTaskCancellation:true,authenticationEnforced:true,jsonlLogs:true,ownedProcessOnly:true,realMinecraftBenchmark:false},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{
  if(run){try{await service.request('kill_instance',{runningId:run});}catch{}}
  if(follower?.exitCode===null)follower.kill();
  await service.close().catch(()=>{});
  const resolved=path.resolve(temporary);
  if(resolved.startsWith(path.resolve(os.tmpdir())+path.sep)&&path.basename(resolved).startsWith('enderloom-cli-shared-'))fs.rmSync(resolved,{recursive:true,force:true});
});
