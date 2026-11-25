'use strict';
const assert=require('assert'),fs=require('fs'),os=require('os'),path=require('path');
const {CatalogStore}=require('../src/catalog-store');
(async()=>{const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-missing-source-'));let first,store;const timers=new Map();let id=0;const set=global.setInterval,clear=global.clearInterval;
global.setInterval=fn=>{const key={id:++id,unref(){}};timers.set(key,fn);return key};global.clearInterval=key=>timers.delete(key);
try{const root=path.resolve(__dirname,'..'),file=path.join(tmp,'source.csv');const write=n=>fs.writeFileSync(file,`Name,Primary URL\n${n},https://example.test/mod\n`);
write('Original');first=new CatalogStore({rootDir:root,userDataDir:tmp,testMode:true});await first.init();await first.addLocalFiles([file]);const catalogId=first.entry().id,sourceId=first.entry().sources[0].id;first.dispose();fs.unlinkSync(file);
store=new CatalogStore({rootDir:root,userDataDir:tmp,testMode:true});await store.init();assert.equal(timers.size,1);const tick=[...timers.values()][0];
for(let i=0;i<50;i++)await tick();assert.equal(store.loadSnapshot(catalogId).items[0].name,'Original');assert.equal(store.entry().sources[0].autoRefresh,true);
write('Returned');await tick();assert.equal(store.loadSnapshot(catalogId).items[0].name,'Returned');
// A file disappearing after startup must preserve data and stop retrying at its budget.
fs.unlinkSync(file);let attempts=0;const originalRefresh=store.refreshSource.bind(store);store.refreshSource=async(...args)=>{attempts++;return originalRefresh(...args)};
for(let i=0;i<600;i++)await tick();assert.equal(attempts,11);assert.equal(store.loadSnapshot(catalogId).items[0].name,'Returned');
write('ReturnedAgain');await tick();assert.equal(store.loadSnapshot(catalogId).items[0].name,'ReturnedAgain');assert.equal(attempts,12);
await store.toggleSource(catalogId,sourceId,false);fs.unlinkSync(file);await store.toggleSource(catalogId,sourceId,true);assert.equal(timers.size,1);const tick2=[...timers.values()][0];write('Reenabled');await tick2();assert.equal(store.loadSnapshot(catalogId).items[0].name,'Reenabled');
await store.toggleSource(catalogId,sourceId,false);write('Disabled');await tick2();assert.equal(store.loadSnapshot(catalogId).items[0].name,'Reenabled');assert.equal(timers.size,0);
fs.unlinkSync(file);await store.toggleSource(catalogId,sourceId,true);const tick3=[...timers.values()][0];await store.removeSource(catalogId,sourceId);write('Removed');await tick3();assert.equal(timers.size,0);assert.equal(store.loadSnapshot(catalogId).items[0].name,'Reenabled');
console.log(JSON.stringify({passed:true,scenarios:['missing-at-startup','absent-source-retains-last-good','later-disappearance-bounded-retries','return-resets-exhausted-budget','return-refreshes','enable-while-missing','disabled-callback-inert','removed-callback-inert']}));
}finally{first?.dispose();store?.dispose();global.setInterval=set;global.clearInterval=clear;fs.rmSync(tmp,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1});
