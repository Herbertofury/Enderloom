'use strict';
const assert=require('assert');
const fs=require('fs');
const os=require('os');
const path=require('path');
const {CatalogStore}=require('../src/catalog-store');

// Drive the real watch callback deterministically, not the wall clock. Imports,
// snapshot persistence and HTML rendering still run through the real implementation.
async function run(){
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-watch-'));
 const store=new CatalogStore({rootDir:path.resolve(__dirname,'..'),userDataDir:tmp,testMode:true});
 const intervals=new Map();let next=0;
 const originalSet=global.setInterval,originalClear=global.clearInterval;
 global.setInterval=fn=>{const id={id:++next,unref(){}};intervals.set(id,fn);return id};
 global.clearInterval=id=>intervals.delete(id);
 let calls=0;
 try{
  await store.init();
  const file=path.join(tmp,'watch.csv');
  const write=name=>{fs.writeFileSync(file,'Name,Primary URL\n'+name+',https://example.com/item\n');const date=new Date(Date.now()+next*5000+name.length*1000);fs.utimesSync(file,date,date)};
  write('Original');await store.addLocalFiles([file]);
  const entry=store.entry(),src=entry.sources[0],tick=[...intervals.values()][0];
  const render=store.renderActive.bind(store);
  let fail=true;
  store.renderActive=async()=>{calls++;if(fail)throw Error('transient render fault');return render()};
  const good=fs.readFileSync(store.runtimePath(),'utf8');
  write('Updated');
  await tick();
  assert.equal(entry.renderPending,true);
  assert.equal(fs.readFileSync(store.runtimePath(),'utf8'),good);
  assert.equal(store.loadSnapshot().items[0].name,'Updated');
  const first=calls;await tick();assert.equal(calls,first,'backoff must not spin');
  fail=false;await tick();
  assert(!entry.renderPending);assert(fs.readFileSync(store.runtimePath(),'utf8').includes('Updated'));
  assert.equal(src.status,'current');
  write('Permanent fault');fail=true;const before=calls;
  for(let i=0;i<500;i++)await tick();
  assert.equal(calls-before,11,'initial attempt plus ten retries');
  assert.equal(entry.renderPending,true);
  const capped=calls;for(let i=0;i<100;i++)await tick();assert.equal(calls,capped);
  write('New version resets budget');fail=false;await tick();
  assert.equal(calls,capped+1);assert(!entry.renderPending);
  // A competing refresh must not swallow the changed file.
  write('Locked version');const lock=entry.id+':'+src.id;
  store.refreshing.add(lock);await tick();store.refreshing.delete(lock);
  await tick();assert(store.loadSnapshot().items[0].name==='Locked version');
  // Disabling/removing/disposal stops even already queued interval callbacks.
  write('Disabled version');await store.toggleSource(entry.id,src.id,false);
  const stopped=calls;await tick();assert.equal(calls,stopped);assert.equal(intervals.size,0);
  await store.toggleSource(entry.id,src.id,true);
  const removeTick=[...intervals.values()][0];
  await store.removeSource(entry.id,src.id);await removeTick();assert.equal(intervals.size,0);
  // Startup watcher recognizes persisted render debt without a fresh file edit.
  entry.sources.push(src);entry.renderPending=true;store.startLocalWatch(entry,src);
  const restartTick=[...intervals.values()][0];await restartTick();assert(!entry.renderPending);
  store.dispose();await restartTick();assert.equal(intervals.size,0);
  return {passed:true,checks:8,renderAttempts:calls};
 }finally{
  store.dispose();global.setInterval=originalSet;global.clearInterval=originalClear;
  fs.rmSync(tmp,{recursive:true,force:true});
 }
}
module.exports=run;
if(require.main===module)run().then(x=>console.log(JSON.stringify(x))).catch(e=>{console.error(e);process.exitCode=1});
