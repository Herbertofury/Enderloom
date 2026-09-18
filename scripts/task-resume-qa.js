'use strict';
const assert=require('assert/strict'),fs=require('fs'),os=require('os'),path=require('path'),crypto=require('crypto');
const {spawnSync,spawn}=require('child_process');const {DatabaseSync}=require('node:sqlite');
const {LauncherService}=require('../src/launcher-service');const {zip,write}=require('./workbench-fixtures');
const root=path.resolve(__dirname,'..'),temporary=fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-resume-qa-')),data=path.join(temporary,'data');
let service=new LauncherService({rootDir:root,dataDir:data});
const readDb=fn=>{const db=new DatabaseSync(path.join(data,'basalt.db'));try{return fn(db);}finally{db.close();}};
(async()=>{
  const instance=await service.request('create_instance',{name:'Resumable inspection',versionId:'1.20.1',loader:null,loaderVersion:null});
  for(let i=0;i<300;i++)write(instance.dir,`mods/mod-${String(i).padStart(3,'0')}.jar`,zip({'fabric.mod.json':JSON.stringify({id:`fixture_${i}`,version:'1.0'}),'fixture-data.bin':Buffer.alloc(65536,i%256)}));
  let interruptedId,cut=false;
  service.on('event',message=>{if(!cut&&message.event==='task:update'&&message.payload.kind==='performance_scan'&&message.payload.stage==='Inspecting mod-020.jar'){cut=true;interruptedId=message.payload.id;service.child.kill();}});
  await assert.rejects(service.request('scan_mod_insights',{instanceId:instance.id,history:true}));assert(cut&&interruptedId,'The real worker must be killed during its scan');
  await service.close();
  const savedCache=readDb(db=>db.prepare("SELECT key,body FROM creative_library WHERE key LIKE 'inspection:%'").all());assert(savedCache.length>0&&savedCache.length<300,'Partial verified per-artifact cache must survive');
  // Alter one already-inspected artifact. Resume must invalidate its old cached identity.
  const changed=path.join(instance.dir,'mods/mod-000.jar');fs.appendFileSync(changed,'changed');const changedHash=crypto.createHash('sha256').update(fs.readFileSync(changed)).digest('hex');
  service=new LauncherService({rootDir:root,dataDir:data});let tasks=await service.request('list_tasks');let task=tasks.find(t=>t.id===interruptedId);
  assert.equal(task.state,'interrupted');assert.equal(task.attempt,1);assert.equal(task.checkpoint.operation,'mod_inspection');assert.equal(task.checkpoint.instance_id,instance.id);assert.equal(task.checkpoint.history,true);
  await service.request('clear_finished_tasks');assert((await service.request('list_tasks')).some(t=>t.id===interruptedId),'Clear completed must preserve interrupted work');
  let resumed=false;service.on('event',m=>{if(m.event==='task:update'&&m.payload.id===interruptedId&&m.payload.state==='running')resumed=true;});
  const result=await new Promise((resolve,reject)=>{const child=spawn(path.join(root,'native/target/debug/enderloom.exe'),['--data-dir',data,'task','resume',interruptedId,'--json'],{windowsHide:true});let out='',err='';child.stdout.on('data',b=>out+=b);child.stderr.on('data',b=>err+=b);child.on('error',reject);child.on('close',code=>{if(code!==0)return reject(Error(err||out));try{resolve(JSON.parse(out).result);}catch(e){reject(e);}});child.stdin.end();});assert(resumed);assert.equal(result.files.length,300);assert.equal(result.files.find(f=>f.file_name==='mod-000.jar').inspection.sha256,changedHash);
  tasks=await service.request('list_tasks');task=tasks.find(t=>t.id===interruptedId);assert.equal(task.state,'succeeded');assert.equal(task.attempt,2);assert.equal(task.completed,300);assert.equal(tasks.filter(t=>t.id===interruptedId).length,1);
  await assert.rejects(service.request('resume_task',{taskId:interruptedId}),/already running or complete/);
  await service.close();
  readDb(db=>{for(const cached of savedCache)assert.equal(db.prepare('SELECT body FROM creative_library WHERE key=?').get(cached.key).body,cached.body,'Previously measured evidence must be reused without rewriting it');});
  service=new LauncherService({rootDir:root,dataDir:data});assert.equal((await service.request('list_tasks')).find(t=>t.id===interruptedId).state,'succeeded');
  // More than the former 50-task cutoff must survive both the active session and restart.
  const empty=await service.request('create_instance',{name:'Task history fixture',versionId:'1.20.1',loader:null,loaderVersion:null});
  for(let i=0;i<60;i++)await service.request('scan_mod_insights',{instanceId:empty.id,history:false});assert.equal((await service.request('list_tasks')).length,61);
  await service.close();
  readDb(db=>db.prepare('INSERT INTO task_history(id,state,body,started_at) VALUES(?,?,?,?)').run('unreadable-history','interrupted','{"older_format":true}',0));
  const cli=spawnSync(path.join(root,'native/target/debug/enderloom.exe'),['--data-dir',data,'task','show',interruptedId,'--json'],{encoding:'utf8',windowsHide:true,timeout:30000});assert.equal(cli.status,0,cli.stderr);assert.equal(JSON.parse(cli.stdout).result.attempt,2);
  service=new LauncherService({rootDir:root,dataDir:data});assert.equal((await service.request('list_tasks')).length,61);
  await service.request('clear_finished_tasks');await service.close();service=new LauncherService({rootDir:root,dataDir:data});assert.deepEqual(await service.request('list_tasks'),[]);
  assert.equal(readDb(db=>db.prepare('SELECT body FROM task_history WHERE id=?').get('unreadable-history').body),'{"older_format":true}');
  const report={passed:true,interruptedTaskId:interruptedId,resumedSameTask:true,attempts:2,files:result.files.length,cacheEntriesPreserved:savedCache.length,changedArtifactRevalidated:true,historyTasks:61,historySurvivesRestart:true,clearIsDurable:true,unreadableRecordIsolatedAndPreserved:true};fs.mkdirSync(path.join(root,'output'),{recursive:true});fs.writeFileSync(path.join(root,'output/task-resume-qa.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>service.close());
