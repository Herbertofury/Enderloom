'use strict';
const assert=require('assert/strict'),fs=require('fs'),os=require('os'),path=require('path'),crypto=require('crypto');
const {spawn}=require('child_process'),{DatabaseSync}=require('node:sqlite'),{LauncherService}=require('../src/launcher-service');
const root=path.resolve(__dirname,'..'),temporary=fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-restore-')),data=path.join(temporary,'data');
let service=new LauncherService({rootDir:root,dataDir:data});
function owned(p){const resolved=path.resolve(p);assert(resolved.startsWith(path.resolve(data)+path.sep),'Fixture operation escaped its data root');return resolved;}
function write(p,bytes){fs.mkdirSync(path.dirname(owned(p)),{recursive:true});fs.writeFileSync(p,bytes);}
const cliPlan=args=>new Promise((resolve,reject)=>{const p=spawn(path.join(root,'native/target/debug/enderloom.exe'),['--data-dir',data,'operation','run','restore_instance_snapshot','--plan','--json'],{windowsHide:true});let out='',err='';p.stdout.on('data',b=>out+=b);p.stderr.on('data',b=>err+=b);p.on('error',reject);p.on('close',code=>{try{assert.equal(code,0,err||out);resolve(JSON.parse(out).result);}catch(e){reject(e);}});p.stdin.end(JSON.stringify(args));});
const receipts=id=>service.request('get_transactions',{targetKind:'instance',targetId:id});
async function restart(){await service.close();service=new LauncherService({rootDir:root,dataDir:data});await service.start();}
(async()=>{
  const instance=await service.request('create_instance',{name:'Restore transactions',versionId:'1.20.1',loader:null,loaderVersion:null});
  const a=path.join(instance.dir,'config/a.json'),b=path.join(instance.dir,'config/b.json'),added=path.join(instance.dir,'config/new.json'),log=path.join(instance.dir,'logs/latest.log');
  write(a,'{"v":1}');write(b,'{}');write(log,'original log');
  const snapshot=await service.request('create_instance_snapshot',{instanceId:instance.id,name:'Original state',excluded:[]});
  write(a,'{"v":2}');fs.unlinkSync(owned(b));write(added,'{}');write(log,'keep current log');
  const beforeTasks=(await service.request('list_tasks')).length;
  const plan=await cliPlan({instanceId:instance.id,snapshotId:snapshot.id});
  assert.equal((await service.request('list_tasks')).length,beforeTasks);assert.deepEqual(await receipts(instance.id),[]);
  for(const [name,action] of [['config/a.json','replace'],['config/b.json','add'],['config/new.json','remove']])assert(plan.changes.some(c=>c.path===name&&c.action===action));
  assert(!plan.changes.some(c=>c.path.startsWith('logs/')));assert.equal(fs.readFileSync(a,'utf8'),'{"v":2}');
  write(a,'{"v":3}');await assert.rejects(service.request('restore_instance_snapshot',{instanceId:instance.id,snapshotId:snapshot.id,expectedPlanId:plan.id}),/changed since.*reviewed/i);
  assert.equal(fs.readFileSync(a,'utf8'),'{"v":3}');assert.deepEqual(await receipts(instance.id),[]);
  const fresh=await service.request('plan_restore_instance_snapshot',{instanceId:instance.id,snapshotId:snapshot.id});
  await service.request('restore_instance_snapshot',{instanceId:instance.id,snapshotId:snapshot.id,expectedPlanId:fresh.id});
  assert.equal(fs.readFileSync(a,'utf8'),'{"v":1}');assert(fs.existsSync(b));assert(!fs.existsSync(added));assert.equal(fs.readFileSync(log,'utf8'),'keep current log');
  let receipt=(await receipts(instance.id))[0];assert.equal(receipt.state,'committed');assert(receipt.pre_change_snapshot);assert(receipt.owned_areas.every(r=>r.removed&&!fs.existsSync(r.path)));
  assert(receipt.audit.some(e=>e.state==='staging'));assert(receipt.audit.some(e=>e.state==='applying'));
  const task=(await service.request('get_task_detail',{taskId:receipt.task_id})).task;assert(task.details.run_ids.includes(receipt.id));assert(task.details.cleanup.every(r=>r.state==='removed'));
  for(let i=0;i<4;i++){write(a,JSON.stringify({v:i+4}));await service.request('restore_instance_snapshot',{instanceId:instance.id,snapshotId:snapshot.id});}
  assert((await service.request('list_instance_snapshots',{instanceId:instance.id})).filter(s=>s.kind==='automatic').length>=5,'Safety history was silently capped');
  const manifest=JSON.parse(fs.readFileSync(path.join(data,'snapshots/instances',instance.id,snapshot.id+'.json'))),sha=manifest.files.find(f=>f.path.replaceAll('\\','/')==='config/a.json').sha256;
  const blob=path.join(data,'snapshots/blobs',sha.slice(0,2),sha+'.zst'),originalBlob=fs.readFileSync(blob);write(a,'{"v":8}');write(blob,'corrupt archive');
  await assert.rejects(service.request('restore_instance_snapshot',{instanceId:instance.id,snapshotId:snapshot.id}));assert.equal(fs.readFileSync(a,'utf8'),'{"v":8}');assert.equal((await receipts(instance.id))[0].state,'rolled_back');write(blob,originalBlob);
  // A real worker interruption before activation leaves the original and a durable receipt.
  for(let i=0;i<120;i++)write(path.join(instance.dir,`config/payload-${i}.bin`),crypto.randomBytes(128*1024));
  const large=await service.request('create_instance_snapshot',{instanceId:instance.id,name:'Large stage',excluded:[]});write(a,'{"v":9}');
  let killed=false;const kill=m=>{if(!killed&&m.event==='task:update'&&m.payload.kind==='snapshot_restore'&&m.payload.stage==='verifying-and-staging'){killed=true;service.child.kill();}};
  service.on('event',kill);await assert.rejects(service.request('restore_instance_snapshot',{instanceId:instance.id,snapshotId:large.id}));assert(killed);
  const unowned=path.join(data,'instances/.restore-user-notes/keep.txt');write(unowned,'not owned by a restore');
  await restart();receipt=(await receipts(instance.id))[0];assert.equal(receipt.state,'rolled_back');assert(receipt.error.includes('before activation'));assert(receipt.owned_areas.every(a=>a.removed));
  assert.equal(fs.readFileSync(a,'utf8'),'{"v":9}');assert.equal(fs.readFileSync(unowned,'utf8'),'not owned by a restore');
  // Simulate the on-disk commit boundary: live was renamed away, so journal recovery restores the owned backup.
  const safety=await service.request('create_instance_snapshot',{instanceId:instance.id,name:'Recovery safety',excluded:[]});
  const recoveryPlan=await service.request('plan_restore_instance_snapshot',{instanceId:instance.id,snapshotId:large.id});
  await service.close();
  const nonce=crypto.randomUUID(),staging=owned(path.join(data,`instances/.restore-${instance.id}-${nonce}`)),backup=owned(path.join(data,`instances/.restore-backup-${instance.id}-${nonce}`));
  fs.renameSync(owned(instance.dir),backup);write(path.join(staging,'pending.txt'),'staged fixture');
  const audit={schema_version:1,id:nonce,task_id:null,plan:recoveryPlan,state:'applying',pre_change_snapshot:safety.id,owned_areas:[{role:'staging',path:staging,removed:false},{role:'backup',path:backup,removed:false}],audit:[{at:Date.now(),state:'applying',note:'Interrupted activation fixture'}],error:null};
  const db=new DatabaseSync(path.join(data,'basalt.db'));db.prepare('INSERT INTO creative_library(key,body) VALUES(?,?)').run('transaction:'+nonce,JSON.stringify(audit));db.close();
  write(path.join(data,'snapshots/restore-journals',instance.id+'.json'),JSON.stringify({schema_version:1,instance_id:instance.id,target_snapshot_id:large.id,safety_snapshot_id:safety.id,nonce,transaction_id:nonce}));
  service=new LauncherService({rootDir:root,dataDir:data});await service.start();
  assert.equal(fs.readFileSync(a,'utf8'),'{"v":9}');assert(!fs.existsSync(staging)&&!fs.existsSync(backup));
  assert.equal((await receipts(instance.id)).find(r=>r.id===nonce).state,'rolled_back');
  // A changed live target must retain its backup, while another instance can still recover.
  const independent=await service.request('create_instance',{name:'Independent recovery',versionId:'1.20.1',loader:null,loaderVersion:null});
  const independentPoint=await service.request('create_instance_snapshot',{instanceId:independent.id,name:'Independent original',excluded:[]});
  const independentPlan=await service.request('plan_restore_instance_snapshot',{instanceId:independent.id,snapshotId:independentPoint.id});
  await service.request('update_instance',{instanceId:instance.id,name:'User changed name after commit',versionId:'1.20.1',maxMemoryMb:3072});
  await service.close();
  const alteredNonce=crypto.randomUUID(),orphanNonce=crypto.randomUUID();
  const alteredBackup=owned(path.join(data,`instances/.restore-backup-${instance.id}-${alteredNonce}`)),alteredStaging=owned(path.join(data,`instances/.restore-${instance.id}-${alteredNonce}`));
  fs.cpSync(owned(instance.dir),alteredBackup,{recursive:true});write(a,'{"v":10}');
  const alteredReceipt={...audit,id:alteredNonce,owned_areas:[{role:'staging',path:alteredStaging,removed:false},{role:'backup',path:alteredBackup,removed:false}]};
  const orphanStaging=owned(path.join(data,`instances/.restore-${independent.id}-${orphanNonce}`)),orphanBackup=owned(path.join(data,`instances/.restore-backup-${independent.id}-${orphanNonce}`));
  write(path.join(orphanStaging,'pending.txt'),'owned independent staging');
  const orphanReceipt={...audit,id:orphanNonce,state:'staging',plan:independentPlan,pre_change_snapshot:independentPoint.id,owned_areas:[{role:'staging',path:orphanStaging,removed:false},{role:'backup',path:orphanBackup,removed:false}]};
  const recoverDb=new DatabaseSync(path.join(data,'basalt.db'));
  for(const r of [alteredReceipt,orphanReceipt])recoverDb.prepare('INSERT INTO creative_library(key,body) VALUES(?,?)').run('transaction:'+r.id,JSON.stringify(r));
  recoverDb.close();
  write(path.join(data,'snapshots/restore-journals',instance.id+'.json'),JSON.stringify({schema_version:1,instance_id:instance.id,target_snapshot_id:large.id,safety_snapshot_id:safety.id,nonce:alteredNonce,transaction_id:alteredNonce}));
  service=new LauncherService({rootDir:root,dataDir:data});await service.start();
  const blockedReceipt=(await receipts(instance.id)).find(r=>r.id===alteredNonce);
  assert.equal(blockedReceipt.state,'recovery_required');assert.match(blockedReceipt.error,/differ from.*target/i);
  assert.equal(fs.readFileSync(a,'utf8'),'{"v":10}');assert(fs.existsSync(alteredBackup));
  assert.equal((await receipts(independent.id))[0].state,'rolled_back');assert(!fs.existsSync(orphanStaging));
  // A durable committed checkpoint only needs cleanup: never overwrite subsequent user changes.
  await service.close();
  const committed={...blockedReceipt,state:'committed',audit:[...blockedReceipt.audit,{at:Date.now(),state:'committed',note:'Commit-boundary fixture'}]};
  const commitDb=new DatabaseSync(path.join(data,'basalt.db'));commitDb.prepare('UPDATE creative_library SET body=? WHERE key=?').run(JSON.stringify(committed),'transaction:'+committed.id);commitDb.close();
  service=new LauncherService({rootDir:root,dataDir:data});await service.start();
  assert.equal(fs.readFileSync(a,'utf8'),'{"v":10}');assert(!fs.existsSync(alteredBackup));
  assert.equal((await service.request('list_instances')).find(i=>i.id===instance.id).name,'User changed name after commit');
  assert.equal((await service.request('list_instances')).find(i=>i.id===instance.id).max_memory_mb,3072);
  assert.equal((await receipts(instance.id)).find(r=>r.id===alteredNonce).state,'committed');
  // Crash after either filesystem outcome but before metadata/receipt finalization.
  for(const [bytes,expectedState] of [['{"v":9}','rolled_back'],['{"v":8}','committed']]){
    await service.close();write(a,bytes);
    const boundaryNonce=crypto.randomUUID(),boundary={...audit,id:boundaryNonce,owned_areas:[{role:'staging',path:owned(path.join(data,`instances/.restore-${instance.id}-${boundaryNonce}`)),removed:false},{role:'backup',path:owned(path.join(data,`instances/.restore-backup-${instance.id}-${boundaryNonce}`)),removed:false}]};
    const boundaryDb=new DatabaseSync(path.join(data,'basalt.db'));boundaryDb.prepare('INSERT INTO creative_library(key,body) VALUES(?,?)').run('transaction:'+boundaryNonce,JSON.stringify(boundary));boundaryDb.close();
    write(path.join(data,'snapshots/restore-journals',instance.id+'.json'),JSON.stringify({schema_version:1,instance_id:instance.id,target_snapshot_id:large.id,safety_snapshot_id:safety.id,nonce:boundaryNonce,transaction_id:boundaryNonce}));
    service=new LauncherService({rootDir:root,dataDir:data});await service.start();
    assert.equal((await receipts(instance.id)).find(r=>r.id===boundaryNonce).state,expectedState);
    assert.equal(fs.readFileSync(a,'utf8'),bytes);
    const recoveredInstance=(await service.request('list_instances')).find(i=>i.id===instance.id);
    assert.equal(recoveredInstance.name,'User changed name after commit');
    assert.equal(recoveredInstance.max_memory_mb,instance.max_memory_mb);
  }
  await restart();assert((await receipts(instance.id)).length>=8);
  const report={passed:true,readOnlyExactPlan:true,cliDryRunParity:true,stalePlanRejected:true,commitAndSafetyReceipt:true,volatileFilesPreserved:true,noSafetyHistoryCap:true,corruptBlobRollback:true,realWorkerInterruption:true,ownedOnlyRecovery:true,activationJournalRollback:true,changedTargetPreserved:true,independentRecoveryAfterBlocker:true,committedCleanupPreservesLaterEdits:true,verifiedRollForwardAndRollback:true,restart:true,data};
  fs.writeFileSync(path.join(root,'output/snapshot-transaction-qa.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>service.close());
