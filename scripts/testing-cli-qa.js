"use strict";
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto'),zlib=require('zlib');
const {spawnSync}=require('child_process');
const {DatabaseSync}=require('node:sqlite');
const {fixture,load}=require('./spark-evidence-qa');
const root=path.resolve(__dirname,'..'),data=fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-test-cli-qa-'));
const cli=path.join(root,'native/target/debug/enderloom.exe');
function run(args,code=0){const p=spawnSync(cli,['--data-dir',data,'--json',...args],{encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024});assert.equal(p.status,code,p.stderr||p.stdout);return JSON.parse(p.stdout);}
run(['test','list']);
const db=new DatabaseSync(path.join(data,'basalt.db'));
const testId=crypto.randomUUID(),folder=path.join(data,'testing-reports',testId);fs.mkdirSync(folder,{recursive:true});
const samples={current:fixture(),legacy:fixture({legacy:true}),gzip:zlib.gzipSync(fixture()),unowned:fixture({ownership:false}),cyclic:fixture({cycle:true}),truncated:fixture().subarray(0,25)};
const artifacts=Object.entries(samples).map(([name,bytes])=>{const filename=name+'.sparkprofile';fs.writeFileSync(path.join(folder,filename),bytes);return{kind:'spark',name:filename,label:name,path:path.join(folder,filename)}});
db.prepare('INSERT INTO creative_library(key,body) VALUES (?,?)').run('test:'+testId,JSON.stringify({id:testId,at:1,instance_id:'fixture',state:'completed',finished_at:2,minecraft:'1.21.1',loader:'neoforge',loader_version:'fixture',steps:[],artifacts}));
for(let i=0;i<205;i++){const id=crypto.randomUUID();db.prepare('INSERT INTO creative_library(key,body) VALUES (?,?)').run('test:'+id,JSON.stringify({id,at:i+3,instance_id:'fixture',state:'completed',finished_at:i+4,steps:[],artifacts:[]}));}db.close();
const history=run(['test','list']).result;assert.equal(history.length,206,'Testing history must not silently hide older reports');assert(history.some(r=>r.id===testId),'Oldest report must remain available');
const report=run(['test','analyze',testId]).result;
assert.equal(report.evidence.length,4);assert.equal(report.analysis_errors.length,2);
for(const title of ['current','legacy','gzip']){const e=report.evidence.find(e=>e.title===title);assert.equal(e.threads[0].mods.find(m=>m.name==='Example Mod').percent,60);assert.equal(e.tps,19.5);assert.equal(e.mspt_p95,55);assert.equal(e.duration_ms,1000);assert.equal(e.threads[0].mods.find(m=>m.name==='Unassigned / runtime').percent,40)}
assert.equal(report.evidence.find(e=>e.title==='unowned').threads[0].mods[0].percent,100);
assert.equal(run(['test','artifact',testId,'../basalt.db'],3).ok,false);
assert.equal(run(['test','command',testId,'gui'],3).ok,false);
const again=run(['test','analyze',testId]).result;assert.deepEqual(again.evidence.map(e=>e.id),report.evidence.map(e=>e.id),'Analysis must be idempotent, without duplicate saved evidence');
const realPath=path.join(root,'output/aether-acceptance/acceptance-finished.json');
if(fs.existsSync(realPath)){const real=JSON.parse(fs.readFileSync(realPath)).result;const lib=load();for(const a of real.artifacts.filter(a=>a.kind==='spark')){const bytes=fs.readFileSync(a.path);const js=lib.analyzeSpark(bytes,a.label);const rust=real.evidence.find(e=>e.kind==='spark');for(const thread of js.threads){const native=rust.threads.find(t=>t.name===thread.name);assert(native);assert.equal(native.total,thread.total);for(const m of thread.mods){assert.equal(native.mods.find(n=>n.name===m.name)?.percent,m.percent)}}}}
console.log('PASS native CLI Spark current/legacy/gzip, corrupt/cyclic rejection, unassigned ownership, real Aether profile parity, persistent reports, artifact isolation and idempotent analysis.');
console.log('Isolated test data:',data);
