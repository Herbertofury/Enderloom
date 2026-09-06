'use strict';
const assert=require('assert/strict'),fs=require('fs'),os=require('os'),path=require('path');
const {spawn,spawnSync}=require('child_process');
const {zip}=require('./workbench-fixtures');
const {LauncherService}=require('../src/launcher-service');
const root=path.resolve(__dirname,'..'),binary=path.join(root,'native/target/debug',process.platform==='win32'?'enderloom.exe':'enderloom');
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-cli-ownership-')),data=path.join(temporary,'data');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let running;
let service;
function cli(args,input={},expected=0){
  const run=spawnSync(binary,['--data-dir',data,...args,'--json'],{input:JSON.stringify(input),encoding:'utf8',timeout:30000,windowsHide:true});
  assert.ifError(run.error);assert.equal(run.status,expected,run.stdout+'\n'+run.stderr);return JSON.parse(run.stdout).result;
}
function start(args,input={}){
  const child=spawn(binary,['--data-dir',data,...args,'--jsonl'],{windowsHide:true,stdio:['pipe','pipe','pipe']});
  let stdout='',stderr='';child.stdout.on('data',chunk=>stdout+=chunk);child.stderr.on('data',chunk=>stderr+=chunk);child.stdin.end(JSON.stringify(input));
  const finished=new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',code=>resolve({code,stdout,stderr,rows:stdout.trim().split(/\r?\n/).filter(Boolean).map(line=>JSON.parse(line))}));});
  return {child,finished,get stdout(){return stdout;}};
}
(async()=>{
  const instance=cli(['instance','create','Ownership fixture','--version','1.20.1']);
  const timed=await start(['instance','install',instance.id,'--timeout','1s']).finished;
  assert.equal(timed.code,6,timed.stdout+'\n'+timed.stderr);
  assert(timed.rows.some(r=>r.event==='task:update'&&r.payload.state==='cancelled'),'Native cancellation was not acknowledged');
  assert(timed.rows.some(r=>r.event==='task:cleanup'&&r.payload.settled),'CLI did not wait for rollback');
  assert(!timed.rows.at(-1).error.message.includes('needs attention'),'Rollback exceeded its grace period');
  fs.mkdirSync(path.join(instance.dir,'config'),{recursive:true});fs.writeFileSync(path.join(instance.dir,'config','proof.json'),'{}');
  const duplicate=await start(['instance','duplicate',instance.id]).finished;
  assert.equal(duplicate.code,0,duplicate.stdout+'\n'+duplicate.stderr);
  const copied=duplicate.rows.at(-1).result;assert.equal(fs.readFileSync(path.join(copied.dir,'config/proof.json'),'utf8'),'{}');
  assert(duplicate.rows.some(r=>r.event==='task:update'&&r.payload.state==='succeeded'&&r.payload.request_scope));
  service=new LauncherService({rootDir:root,dataDir:data,resourcesDir:root});await service.start();
  const other=await service.request('create_instance',{name:'Independent GUI task',versionId:'1.20.4',loader:null,loaderVersion:null});
  const otherInstall=service.request('install_instance',{instanceId:other.id}).then(()=>null,error=>error);
  let otherTask;
  for(let attempt=0;attempt<100;attempt++){
    otherTask=(await service.request('list_tasks')).find(t=>t.instance_id===other.id&&t.state==='running');
    if(otherTask)break;await delay(20);
  }
  assert(otherTask,'GUI task did not begin');
  const remoteTimeout=await start(['instance','install',instance.id,'--timeout','1s']).finished;
  assert.equal(remoteTimeout.code,6,remoteTimeout.stdout+'\n'+remoteTimeout.stderr);
  assert(remoteTimeout.rows.some(r=>r.event==='task:cleanup'&&r.payload.settled));
  const untouched=(await service.request('list_tasks')).find(t=>t.id===otherTask.id);
  assert(['running','succeeded'].includes(untouched?.state),'CLI cancellation affected an unrelated GUI task');
  if(untouched.state==='running')await service.request('cancel_task',{taskId:otherTask.id});
  await otherInstall;await service.close();service=null;
  const pack=path.join(temporary,'owned-import.mrpack');
  fs.writeFileSync(pack,zip({'modrinth.index.json':JSON.stringify({formatVersion:1,game:'minecraft',versionId:'1.0.0',name:'Owned background import',files:[],dependencies:{minecraft:'1.20.1'}})}));
  running=start(['operation','run','import_pack_file','--timeout','60s'],{path:pack,name:'Owned background import'});
  let task;
  for(let attempt=0;attempt<100;attempt++){
    assert.equal(running.child.exitCode,null,'Background import exited before task cancellation could be observed');
    const lines=running.stdout.split(/\r?\n/).filter(Boolean).flatMap(line=>{try{return[JSON.parse(line)];}catch{return[];}});
    task=lines.find(r=>r.event==='task:update'&&r.payload.state==='running')?.payload;
    if(task)break;await delay(30);
  }
  assert(task?.request_scope,'Background import did not retain its owning request');
  const observed=cli(['task','show',task.id]);assert.equal(observed.request_scope,task.request_scope);
  assert.equal(cli(['task','cancel',task.id]).cancellation_requested,true);
  const cancelled=await running.finished;running=null;
  assert.equal(cancelled.code,10,cancelled.stdout+'\n'+cancelled.stderr);
  assert(cancelled.rows.some(r=>r.event==='task:update'&&r.payload.state==='cancelled'));
  assert(!cli(['instance','list']).some(i=>i.name==='Owned background import'),'Cancelled import left a ghost instance');
  console.log(JSON.stringify({passed:true,localTimeoutWaitedForRollback:true,remoteTimeoutWaitedForRollback:true,unrelatedGuiTaskPreserved:true,taskRequestScope:true,duplicateFilesCompleteBeforeSuccess:true,backgroundImportWaited:true,backgroundCancellationExit:10,importRollbackRemovedGhost:true},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{
  if(running?.child.exitCode===null){try{for(const t of cli(['task','list']))if(t.request_scope&&t.state==='running')cli(['task','cancel',t.id]);await Promise.race([running.finished,delay(3000)]);}catch{}if(running.child.exitCode===null)running.child.kill();}
  await service?.close().catch(()=>{});
  const resolved=path.resolve(temporary);if(resolved.startsWith(path.resolve(os.tmpdir())+path.sep)&&path.basename(resolved).startsWith('enderloom-cli-ownership-'))fs.rmSync(resolved,{recursive:true,force:true});
});
