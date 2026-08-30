'use strict';
const assert=require('assert');
const fs=require('fs');
const os=require('os');
const path=require('path');
const {performance}=require('perf_hooks');
const {createTranslator}=require('../src/translator');
const {parseRecipes}=require('../src/translator-updater');

(async()=>{
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'mcc-translator-'));
  let calls=0,active=0,maxActive=0;
  const liveSession={fetch:async(url,init={})=>{
    calls++;active++;maxActive=Math.max(maxActive,active);await new Promise(r=>setTimeout(r,28));active--;
    if(String(url).startsWith('https://edge.microsoft.com/translate/translatetext')){
      const texts=JSON.parse(init.body||'[]');return new Response(JSON.stringify(texts.map(t=>({detectedLanguage:{language:'ja'},translations:[{text:`EN:${t}`}] }))),{status:200,headers:{'content-type':'application/json'}});
    }
    throw new Error(`Unexpected mock translator URL ${url}`);
  }};
  const tr=createTranslator({liveSession,userDataDir:tmp,testMode:true});
  const texts=Array.from({length:100},(_,i)=>`segment-${i}`);
  const start=performance.now();const rows=await tr.translateTexts({service:'bing',sourceLanguage:'auto',targetLanguage:'en',texts});const elapsed=performance.now()-start;
  assert.equal(rows.length,texts.length);assert.equal(rows[57].text,'EN:segment-57');assert.equal(calls,4,'100 Bing segments should batch into 4 requests');assert(maxActive>=4,'translation batches did not execute concurrently');assert(elapsed<90,`parallel translation batching too slow: ${elapsed.toFixed(1)} ms`);
  const before=calls;const cached=await tr.translateTexts({service:'bing',sourceLanguage:'auto',targetLanguage:'en',texts});assert.equal(calls,before,'translation cache should avoid repeated network calls');assert.equal(cached[0].text,'EN:segment-0');
  const upstreamSource=`const a="https://edge.microsoft.com/translate/translatetext?isEnterpriseClient=false";const b="https://translate-pa.googleapis.com/v1/translateHtml";const c="https://translate.googleapis.com/_/translate_http/_/js/k=future/m=el_main";const d="https://translate.yandex.net/api/v1/tr.json/translate?";const e="https://translated.turbopages.org/proxy_u/en-es.en/https/example.com/";const f="https://oneshot-free.www.deepl.com/v1/storefront/translate";const evil="https://evil.example/steal";`;
  const recipes=parseRecipes(upstreamSource,'99.1.2.3');assert.equal(recipes.upstreamVersion,'99.1.2.3');assert.equal(new URL(recipes.bing.url).hostname,'edge.microsoft.com');assert(!JSON.stringify(recipes).includes('evil.example'),'upstream recipe parser accepted an untrusted host');
  tr.dispose();fs.rmSync(tmp,{recursive:true,force:true});
  console.log(JSON.stringify({passed:true,segments:100,networkRequests:calls,maxParallelRequests:maxActive,parallelElapsedMs:+elapsed.toFixed(2),cacheHitVerified:true,upstreamRecipeAllowlist:true}));
})().catch(e=>{console.error(e);process.exit(1)});
