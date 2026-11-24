'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const batch=require('../src/modrinth-batch');
const A='AbCdEf12', B='abcdEf12';
const rowA={id:A,slug:'primary-renderer',title:'Research Alpha',gallery:[],body:''};
const rowB={id:B,slug:'secondary-renderer',title:'Research Beta',gallery:[],body:''};
const canonical=q=>'https://modrinth.com/mod/'+q;
function harness(respond){
 const root=fs.readFileSync(path.join(__dirname,'../main.js'),'utf8');
 const start=root.indexOf('function cachedModrinthProject('),end=root.indexOf('function mergeDiscoveredMedia(',start);
 assert.ok(start>0&&end>start);
 const calls=[];
 const sandbox=vm.createContext({...batch,URL,modrinthProjectCache:new Map(),MODRINTH_PROJECT_CACHE_MS:360000,
   fetchJsonLive:async raw=>{const url=new URL(raw);calls.push(url);return respond(url)},
   pageIdentityConfidence:()=>90,sanitizeMediaItem:(value,role)=>value?.url?{...value,role}:null});
 vm.runInContext(root.slice(start,end),sandbox);
 return {cache:sandbox, calls, discover:sandbox.discoverModrinthMedia, warm:arrays=>sandbox.warmModrinthProjectBatches(arrays.map(urls=>({urls})))};
}
test('mixed-case Base62 projects keep distinct warmed batches and correct actual cards',async()=>{
 const h=harness(url=>{assert.equal(url.pathname,'/v2/projects');return [rowB,rowA]});
 h.warm([[canonical(A),canonical(B),canonical(A)]]);
 const [a,b]=await Promise.all([h.discover(canonical(A)),h.discover(canonical(B))]);
 assert.equal(a?.title,rowA.title);assert.equal(b?.title,rowB.title);
 assert.deepEqual(h.calls.map(u=>JSON.parse(u.searchParams.get('ids'))),[[A,B]]);
});
test('batch misses can be retried through one exact request without cross-project propagation',async()=>{
 const h=harness(url=>url.pathname==='/v2/projects'?[rowB]:decodeURIComponent(url.pathname.split('/').at(-1))===A?rowA:rowB);
 h.warm([[canonical(A),canonical(B)]]);
 const [a,aAgain,b]=await Promise.all([h.discover(canonical(A)),h.discover(canonical(A)),h.discover(canonical(B))]);
 assert.equal(a?.title,rowA.title);assert.equal(aAgain?.title,rowA.title);assert.equal(b?.title,rowB.title);
 assert.deepEqual(h.calls.map(u=>u.pathname),['/v2/projects','/v2/project/'+A]);
});
test('unrelated single-project row is not accepted or cached on that ref',async()=>{
 let loads=0;
 const h=harness(()=>++loads===1?rowB:rowA);
 assert.equal(await h.discover(canonical(A)),null);
 assert.equal((await h.discover(canonical(A)))?.title,rowA.title);
 assert.equal(h.calls.length,2);
});
test('malformed or non-project path does not abort a valid warm request',async()=>{
 const h=harness(()=>[rowA]);
 assert.doesNotThrow(()=>h.warm([[canonical('%ZZ'),canonical(A)]]));
 assert.equal(await h.discover(canonical('%2Fa')),null);
 assert.equal(await h.discover('https://notmodrinth.example/mod/'+A),null);
 assert.equal((await h.discover(canonical(A)))?.title,rowA.title);
 assert.equal(h.calls.length,1);
});
test('duplicate batch rows are deterministic, but shared ambiguous namespaces use direct resolver',async()=>{
 const alias={id:'QwErTy12',slug:A.toLowerCase(),title:'Slug record'};
 const h=harness(url=>url.pathname==='/v2/projects'?[rowA,{...rowA},alias]:rowA);
 h.warm([[canonical(A)]]);
 assert.equal((await h.discover(canonical(A)))?.title,rowA.title);
 assert.deepEqual(h.calls.map(u=>u.pathname),['/v2/projects','/v2/project/'+A]);
 const good=harness(()=>[rowA,{...rowA}]);
 good.warm([[canonical(rowA.slug)]]);
 assert.equal((await good.discover(canonical(rowA.slug)))?.title,rowA.title);
 assert.equal(good.calls.length,1);
});
test('media variants retain distinct files unless exact source URL or explicit preview alias proves duplication',()=>{
 const base='https://cdn.modrinth.com/data/AbCdEf12/images/';
 const original=base+'scene.png', preview=base+'scene_400.webp', distinct=base+'scene_1.png', other=base+'scene_2.png', caseVariant=base+'Scene.png';
 const rows=batch.modrinthProjectMedia({title:'Fixture',gallery:[{raw_url:original,url:preview},{url:distinct},{url:other},{url:caseVariant}],body:'![same preview]('+preview+') ![same original]('+original+') ![unique]('+base+'scene.webp)'});
 assert.deepEqual(rows.map(x=>x.url),[original,distinct,other,caseVariant,base+'scene.webp']);
 assert.equal(rows[0].previewUrl,preview);
});
