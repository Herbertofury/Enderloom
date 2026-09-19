'use strict';
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('../launcher/node_modules/typescript');
const source=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../launcher/src/lib/config-sources.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const exported={};let active=0,peak=0,calls=0,respond;
const api={discoverModConfigSources:async(...args)=>{calls++;active++;peak=Math.max(peak,active);try{return await respond(...args)}finally{active--}}};vm.runInNewContext(source,{exports:exported,require:()=>({api})});
const mods=Array.from({length:137},(_,i)=>({file_name:`${i}.jar`,source:{provider:'modrinth',project_id:String(i)}}));
(async()=>{
 let updates=[],found=0;respond=async()=>{await new Promise(r=>setImmediate(r));return {status:'checked',evidence:[{}]}};
 await exported.discoverConfigSources('profile',mods,new AbortController().signal,v=>updates.push(v),()=>found++);assert.equal(calls,137);assert.equal(peak,3);assert.equal(found,137);assert.equal(updates.at(-1).active,false);
 calls=0;const controller=new AbortController();respond=async()=>{await new Promise(r=>setImmediate(r));controller.abort();return {status:'checked',evidence:[{}]}};
 updates=[];await exported.discoverConfigSources('profile',mods,controller.signal,v=>updates.push(v),()=>{throw Error('Unmounted callback')});assert.equal(calls,3);assert.equal(updates.length,1);
 calls=0;respond=async()=>({status:'deferred',evidence:[],retry_at:123456});updates=[];await exported.discoverConfigSources('profile',mods,new AbortController().signal,v=>updates.push(v),()=>{});assert(calls<=3);assert.equal(updates.at(-1).deferred,true);assert.equal(updates.at(-1).retryAt,123456);
 calls=0;respond=async()=>{throw Error('offline')};updates=[];await exported.discoverConfigSources('profile',mods,new AbortController().signal,v=>updates.push(v),()=>{});assert.equal(calls,137);assert.equal(updates.at(-1).errors,137);
 console.log('PASS source discovery queue: three concurrent requests, no inventory cap, navigation cancellation, rate-limit stop/retry metadata, isolated failures.');
})().catch(e=>{console.error(e);process.exitCode=1});
