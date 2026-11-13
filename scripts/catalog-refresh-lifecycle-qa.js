'use strict';
// Deferred transport controls race timing; parsing, snapshots, registry and HTML
// rendering use the actual implementation and disposable filesystem data.
const assert = require('assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { CatalogStore } = require('../src/catalog-store');
const rootDir = path.resolve(__dirname, '..');
const deferred = () => { let resolve, reject; const promise = new Promise((a,b)=>{resolve=a;reject=b}); return {promise,resolve,reject}; };
const response = name => ({status:200,headers:{'content-type':'text/csv'},buffer:Buffer.from(`Name,Primary URL\n${name},https://example.com/item\n`)});
let checks = 0;
async function scenario(name, run) {
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-lifecycle-'));
 const requests=[];
 const store=new CatalogStore({rootDir,userDataDir:tmp,testMode:true,liveSession:{cookies:{get:async()=>[]}},googleRequest:()=>{const d=deferred();requests.push(d);return d.promise}});
 try {
  await store.init();
  const entry=await store.createFromParsed({title:'Lifecycle',items:[{name:'Last good',primaryUrl:'https://example.com/item'}]},'Lifecycle');
  const src={id:'lifecycle-source',label:'Source',location:'google',format:'csv',role:'primary',exportUrl:'https://docs.google.com/test',autoRefresh:true,status:'current'};
  entry.sources.push(src);store.saveRegistry();await store.renderActive();
  const bytes=()=>[store.registryFile,entry.snapshotFile,store.runtimePath(entry.id)].map(f=>fs.readFileSync(f,'utf8'));
  const events=[];for(const event of ['active-updated','active-changed','catalogs-changed','source-health'])store.on(event,data=>events.push([event,data]));
  await run({store,entry,src,requests,bytes,events,tmp});
  checks++; console.log(`PASS ${name}`);
 } finally {store.dispose();fs.rmSync(tmp,{recursive:true,force:true});}
}
async function main(){
 for(const outcome of ['success','failure','unauthorized','not-modified'])await scenario(`removed source ignores late ${outcome}`,async({store,entry,src,requests,bytes,events})=>{
  const pending=store.refreshSource(entry.id,src.id);await store.removeSource(entry.id,src.id);events.length=0;const before=bytes();
  if(outcome==='failure')requests[0].reject(Error('late transport error'));else requests[0].resolve(outcome==='success'?response('Stale'): {status:outcome==='unauthorized'?403:304,headers:{}});
  assert.equal((await pending).reason,'superseded');assert.deepEqual(bytes(),before);assert.deepEqual(events,[]);
 });
 await scenario('replacement source starts immediately; old completion cannot unlock it',async({store,entry,src,requests})=>{
  const old=store.refreshSource(entry.id,src.id);const replacement={...src,label:'Replacement'};entry.sources=[replacement];
  const fresh=store.refreshSource(entry.id,src.id);assert.equal(requests.length,2);
  requests[0].resolve(response('Stale'));assert.equal((await old).reason,'superseded');
  assert.equal((await store.refreshSource(entry.id,src.id)).reason,'already-refreshing');
  requests[1].resolve(response('Fresh'));assert.equal((await fresh).changed,true);assert.equal(store.loadSnapshot(entry.id).items[0].name,'Fresh');
  assert(fs.readFileSync(store.runtimePath(entry.id),'utf8').includes('Fresh'));assert.equal(store.refreshJobs.size,0);
 });
 await scenario('dispose and reinit release old locks without late writes',async({store,entry,src,requests,bytes,events})=>{
  const old=store.refreshSource(entry.id,src.id);store.dispose();assert.equal((await store.refreshSource(entry.id,src.id)).reason,'disposed');await store.init();events.length=0;
  const fresh=store.refreshSource(entry.id,src.id);assert.equal(requests.length,2);const before=bytes();
  requests[0].reject(Error('old lifecycle'));assert.equal((await old).reason,'superseded');assert.deepEqual(bytes(),before);assert.deepEqual(events,[]);
  assert.equal((await store.refreshSource(entry.id,src.id)).reason,'already-refreshing');requests[1].resolve(response('Restarted'));await fresh;
  assert.equal(store.loadSnapshot(entry.id).items[0].name,'Restarted');
 });
 await scenario('disabling cancels pending refresh while manual refresh still works',async({store,entry,src,requests,bytes,events})=>{
  const old=store.refreshSource(entry.id,src.id,{reason:'interval'});await store.toggleSource(entry.id,src.id,false);const before=bytes();events.length=0;
  requests[0].resolve(response('Disabled stale'));assert.equal((await old).reason,'superseded');assert.deepEqual(bytes(),before);assert.deepEqual(events,[]);
  const manual=store.refreshSource(entry.id,src.id);requests[1].resolve(response('Manual'));await manual;assert.equal(store.loadSnapshot().items[0].name,'Manual');
 });
 await scenario('local worker completion after removal cannot write',async({store,entry,src,bytes,events,tmp})=>{
  src.location='local';src.path=path.join(tmp,'local.csv');fs.writeFileSync(src.path,'Name,Primary URL\nStale local,https://example.com/local\n');
  const pending=store.refreshSource(entry.id,src.id);await store.removeSource(entry.id,src.id);const before=bytes();events.length=0;
  assert.equal((await pending).reason,'superseded');assert.deepEqual(bytes(),before);assert.deepEqual(events,[]);
 });
 await scenario('late render completion emits no stale active notification',async({store,entry,src,requests,events})=>{
  const entered=deferred(),gate=deferred();const render=store.renderActive.bind(store);
  store.renderActive=async()=>{await render();entered.resolve();await gate.promise};
  const pending=store.refreshSource(entry.id,src.id);requests[0].resolve(response('Rendered'));await entered.promise;
  await store.removeSource(entry.id,src.id);events.length=0;gate.resolve();assert.equal((await pending).reason,'superseded');assert.deepEqual(events,[]);
 });
 await scenario('real failure preserves last-good snapshot and is retryable',async({store,entry,src,requests})=>{
  const before=fs.readFileSync(entry.snapshotFile,'utf8');const bad=store.refreshSource(entry.id,src.id);requests[0].reject(Error('temporary failure'));await assert.rejects(bad,/temporary failure/);
  assert.equal(src.status,'error');assert.equal(fs.readFileSync(entry.snapshotFile,'utf8'),before);
  const good=store.refreshSource(entry.id,src.id);requests[1].resolve(response('Recovered'));await good;assert.equal(src.status,'current');assert.equal(store.loadSnapshot().items[0].name,'Recovered');
 });
 await scenario('conditional render recovery suppresses stale notifications',async({store,entry,src,requests,events})=>{
  entry.renderPending=true;store.saveRegistry();const entered=deferred(),gate=deferred();const render=store.renderActive.bind(store);
  store.renderActive=async()=>{await render();entered.resolve();await gate.promise};
  const pending=store.refreshSource(entry.id,src.id);requests[0].resolve({status:304,headers:{}});await entered.promise;
  store.dispose();events.length=0;gate.resolve();assert.equal((await pending).reason,'superseded');assert.deepEqual(events,[]);
 });
 await scenario('add-google continuation cannot render after source removal',async({store,entry,requests,events,bytes})=>{
  const pending=store.addGoogleSource('https://docs.google.com/spreadsheets/d/lifecycle-fixture/edit');const added=entry.sources.at(-1);
  await store.removeSource(entry.id,added.id);const before=bytes();events.length=0;requests[0].resolve({status:403,headers:{}});
  assert.equal((await pending).reason,'superseded');assert.deepEqual(bytes(),before);assert.deepEqual(events,[]);
 });
 for(const action of ['remove','dispose'])await scenario(`add-google second render ignores ${action}`,async({store,entry,requests,events})=>{
  const entered=deferred(),gate=deferred();const render=store.renderActive.bind(store);let calls=0;
  store.renderActive=async()=>{await render();if(++calls===2){entered.resolve();await gate.promise}};
  const pending=store.addGoogleSource('https://docs.google.com/spreadsheets/d/lifecycle-fixture/edit');const added=entry.sources.at(-1);added.format='csv';
  requests[0].resolve(response('Added'));await entered.promise;
  if(action==='remove')await store.removeSource(entry.id,added.id);else store.dispose();events.length=0;gate.resolve();
  assert.equal((await pending).reason,'superseded');assert.deepEqual(events,[]);
 });
 console.log(`${checks} lifecycle scenarios passed with real persistence, parsing and HTML rendering`);
}
main().catch(err=>{console.error(err);process.exitCode=1});
