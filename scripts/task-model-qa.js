'use strict';
const assert=require('assert/strict'),fs=require('fs'),os=require('os'),path=require('path'),crypto=require('crypto');
const {spawn}=require('child_process'),{DatabaseSync}=require('node:sqlite');
const {LauncherService}=require('../src/launcher-service'),{zip,write}=require('./workbench-fixtures');
const root=path.resolve(__dirname,'..'),temporary=fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-task-model-')),data=path.join(temporary,'data');
let service=new LauncherService({rootDir:root,dataDir:data});
const cli=id=>new Promise((resolve,reject)=>{const p=spawn(path.join(root,'native/target/debug/enderloom.exe'),['--data-dir',data,'task','show',id,'--json'],{windowsHide:true});let out='',err='';p.stdout.on('data',b=>out+=b);p.stderr.on('data',b=>err+=b);p.on('error',reject);p.on('close',code=>{try{assert.equal(code,0,err||out);resolve(JSON.parse(out).result);}catch(e){reject(e);}});p.stdin.end();});
(async()=>{
  const file=path.join(temporary,'recoverable.jar');
  const request={project_id:'task-model',title:'Task history fixture',minecraft:'1.20.1',loader:'forge',loader_version:'47.4.23',java:17,checkpoint:'Exact recovery fixture',inputs:[{path:file,label:'Original',role:'authority'}]};
  await assert.rejects(service.request('start_conversion_intake',request));
  let failed=(await service.request('list_tasks')).find(t=>t.kind==='conversion_intake');assert.equal(failed.state,'failed');
  assert.equal(failed.details.operation,'start_conversion_intake');assert.equal(failed.details.target.kind,'project');assert.equal(failed.details.attempts.length,1);
  assert(failed.details.blocker.reason);assert.match(failed.details.checkpoint_id,/^sha256:[0-9a-f]{64}$/);
  const original=failed.details.attempts[0];fs.writeFileSync(file,zip({'assets/example/model.json':'{}'}));
  const snapshot=await service.request('resume_task',{taskId:failed.id});
  let detail=await service.request('get_task_detail',{taskId:failed.id});
  assert.equal(detail.task.attempt,2);assert.deepEqual(detail.task.details.attempts[0],original);assert.equal(detail.task.details.attempts[1].state,'succeeded');
  assert.equal(detail.task.details.blocker,null);assert.deepEqual(detail.task.details.run_ids,[snapshot.id]);
  const evidence=detail.task.details.produced_evidence[0];assert(evidence.startsWith('conversion:'));
  const proof=await service.request('get_evidence_artifact',{evidenceId:evidence});assert.equal(proof.run_id,failed.id);
  assert.deepEqual((await cli(failed.id)).details,detail.task.details);
  // Clearing the activity list must not destroy the evidence's durable task or attempts.
  await service.request('clear_finished_tasks');assert(!(await service.request('list_tasks')).some(t=>t.id===failed.id));
  assert.equal((await cli(failed.id)).details.archived,true);

  // Cancel a real parent comparison while its child inventories the input. No Java is started.
  const instance=await service.request('create_instance',{name:'Parent cancellation fixture',versionId:'1.20.1',loader:null,loaderVersion:null});
  for(let i=0;i<250;i++)write(instance.dir,`mods/task-${String(i).padStart(3,'0')}.jar`,zip({'fabric.mod.json':JSON.stringify({id:`task_${i}`,version:'1.0'}),'sample.bin':Buffer.alloc(65536,i%256)}));
  let cancellation,parentId,childId;
  const watch=m=>{
    if(m.event!=='task:update')return;
    const t=m.payload;if(t.kind==='performance_comparison')parentId=t.id;
    if(!cancellation&&t.details?.parent_task_id===parentId&&t.stage==='Inspecting task-020.jar'){
      childId=t.id;cancellation=service.request('cancel_task',{taskId:parentId});
    }
  };
  service.on('event',watch);
  const comparison=await service.request('compare_mod_startup',{instanceId:instance.id,fileName:'task-000.jar',seconds:15,repeats:1});
  service.removeListener('event',watch);assert(childId&&cancellation,'Child scan was not observed');assert.equal(await cancellation,true);assert.equal(comparison.state,'cancelled');
  const graph=await service.request('get_task_detail',{taskId:parentId});assert.equal(graph.task.state,'cancelled');assert.equal(graph.children.length,1);assert.equal(graph.children[0].id,childId);assert.equal(graph.children[0].state,'cancelled');
  assert(graph.task.details.cancellation_requested_at);assert(graph.children[0].details.cancellation_requested_at);
  const child=await service.request('get_task_detail',{taskId:childId});assert.equal(child.parent.id,parentId);assert.equal(child.task.details.cleanup[0].state,'removed');assert(!fs.existsSync(child.task.details.cleanup[0].path));
  assert(fs.existsSync(path.join(instance.dir,'mods/task-000.jar')),'Parent cancellation changed source instance');
  await service.close();
  // A legacy multi-attempt row must preserve uncertainty, not invent prior attempts or timings.
  const db=new DatabaseSync(path.join(data,'basalt.db'));const legacy={...failed,id:crypto.randomUUID(),attempt:3,started_at:100,finished_at:200};delete legacy.details;
  db.prepare('INSERT INTO task_history(id,state,body,started_at) VALUES(?,?,?,?)').run(legacy.id,legacy.state,JSON.stringify(legacy),100);
  const ownedFile=path.join(temporary,'owned-recovery-marker.txt');fs.writeFileSync(ownedFile,'preserve for ownership review');
  const owned={...persistedTask(detail.task),id:crypto.randomUUID(),state:'succeeded'};
  owned.details.cleanup=[{kind:'instance_sandbox',id:'unverified-recovery-resource',path:ownedFile,attempt:2,state:'owned',reason:'Fixture interruption after successful preparation',updated_at:1}];
  owned.details.processes=[{run_id:'old-process',pid:process.pid,role:'minecraft',attempt:2,observed_at:1,stopped_at:null}];
  db.prepare('INSERT INTO task_history(id,state,body,started_at) VALUES(?,?,?,?)').run(owned.id,owned.state,JSON.stringify(owned),101);db.close();
  service=new LauncherService({rootDir:root,dataDir:data});
  const migrated=(await service.request('get_task_detail',{taskId:legacy.id})).task;
  assert.equal(migrated.details.attempts.length,1);assert.equal(migrated.details.attempts[0].number,3);assert.equal(migrated.details.attempts[0].started_at,null);assert(migrated.details.history_note.includes('not been inferred'));
  const persisted=(await service.request('get_task_detail',{taskId:failed.id})).task;assert.equal(persisted.details.archived,true);assert.equal(persisted.details.attempts.length,2);
  assert.equal((await service.request('get_task_detail',{taskId:parentId})).children[0].id,childId);
  const recovery=(await service.request('get_task_detail',{taskId:owned.id})).task;assert.equal(recovery.details.cleanup[0].state,'needs_review');assert.equal(recovery.details.processes[0].stopped_at,null);
  assert.equal(fs.readFileSync(ownedFile,'utf8'),'preserve for ownership review');
  await service.request('clear_finished_tasks');assert((await service.request('list_tasks')).some(t=>t.id===owned.id),'Clearing tasks hid unresolved owned resources');
  const report={passed:true,attemptsPreserved:true,checkpointIdentity:true,canonicalEvidenceLinked:true,cliParity:true,archivedEvidenceHistoryAvailable:true,parentChildCancellation:true,sourceUntouched:true,ownedCleanupVerified:true,unresolvedOwnershipVisible:true,noPidBasedRecoveryKill:true,migrationPreservesUnknownHistory:true,restart:true,data};
  fs.writeFileSync(path.join(root,'output/task-model-qa.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>service.close());
function persistedTask(task){return JSON.parse(JSON.stringify(task));}
