'use strict';
const assert=require('assert');
const http=require('http');
const crypto=require('crypto');
const {performance}=require('perf_hooks');
const publicHttp=require('../src/public-http');
const rust=require('../src/rust-http');
const impit=require('../src/impit-http3');
function pct(values,p){const a=[...values].sort((x,y)=>x-y);return a[Math.min(a.length-1,Math.max(0,Math.ceil(a.length*p)-1))]}
function jitter(key){const n=crypto.createHash('sha1').update(key).digest().readUInt16BE(0);return 8+(n%92)}
(async()=>{
  publicHttp.clearSharedCache();
  assert(rust.status().available,'wreq Rust unavailable');assert(impit.status().available,'impit unavailable');
  const cards=48;let active=0,maxActive=0,physical=0;
  const server=http.createServer((req,res)=>{
    physical++;active++;maxActive=Math.max(maxActive,active);
    const key=req.url.slice(1),delay=jitter(key);
    res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
    res.write(`<!doctype html><html><head><title>${key}</title></head><body>`);
    setTimeout(()=>res.write(`<div>Gallery (1)</div><img src="https://media.forgecdn.net/attachments/thumbnails/1/2/310/172/${encodeURIComponent(key)}.jpg">${'m'.repeat(1000)}`),delay);
    setTimeout(()=>{res.end('q'.repeat(7000)+'</body></html>');active--},260+delay);
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
  const base=`http://127.0.0.1:${server.address().port}`;
  try{
    const start=performance.now(),rows=[];
    for(let i=0;i<cards;i++){
      const nonce=`${Date.now()}-${i}`;
      rows.push({i,engine:'node',flow:publicHttp.requestProgressiveTextShared(`${base}/node-${nonce}`,{timeoutMs:1800,cacheTtlMs:0,mediaMinBytes:128,mediaMaxBytes:48*1024,headMaxBytes:48*1024,prefixMaxBytes:96*1024})});
      rows.push({i,engine:'wreq',flow:rust.requestProgressiveText(`${base}/wreq-${nonce}`,{timeoutMs:1800,cacheTtlMs:0,mediaMinBytes:128,mediaMaxBytes:48*1024,headMaxBytes:48*1024,prefixMaxBytes:96*1024})});
      rows.push({i,engine:'impit',flow:impit.requestProgressiveText(`${base}/impit-${nonce}`,{timeoutMs:1800,cacheTtlMs:0,mediaMinBytes:128,mediaMaxBytes:48*1024,headMaxBytes:48*1024,prefixMaxBytes:96*1024})});
    }
    const media=await Promise.all(rows.map(async r=>{const v=await r.flow.media;return {...r,ms:performance.now()-start,ok:v.mediaMarker===true}}));
    const pairRaced=[],raced=[];for(let i=0;i<cards;i++){const card=media.filter(x=>x.i===i);pairRaced.push(Math.min(...card.filter(x=>x.engine!=='impit').map(x=>x.ms)));raced.push(Math.min(...card.map(x=>x.ms)))}
    const by={};for(const e of ['node','wreq','impit'])by[e]=media.filter(x=>x.engine===e).map(x=>x.ms);
    const full=await Promise.all(rows.map(r=>r.flow.full));const fullMs=performance.now()-start;
    const p95={node:pct(by.node,.95),wreq:pct(by.wreq,.95),impit:pct(by.impit,.95),pair230:pct(pairRaced,.95),race240:pct(raced,.95)};
    assert(media.every(x=>x.ok),'a transport missed its media marker');
    assert.strictEqual(physical,cards*3,'expected exactly one physical request per independent transport');
    assert(maxActive>=120,`parallel frontier unexpectedly serialized: ${maxActive}`);
    assert(full.every(x=>x.bytesRead>7000),'full enrichment lost bytes');
    assert(p95.race240<=p95.pair230,`impit fourth-transport hedge did not beat the Node+wreq pair: ${JSON.stringify(p95)}`);
    console.log(JSON.stringify({passed:true,fixture:`${cards*3} simultaneous real localhost HTTP streams`,cards,physicalRequests:physical,maxConcurrentServerRequests:maxActive,fullAllMs:+fullMs.toFixed(1),p95Ms:Object.fromEntries(Object.entries(p95).map(([k,v])=>[k,+v.toFixed(1)])),pairRaceP50Ms:+pct(pairRaced,.5).toFixed(1),raceP50Ms:+pct(raced,.5).toFixed(1),p95ImprovementPct:+((1-p95.race240/p95.pair230)*100).toFixed(1),raceMaxMs:+Math.max(...raced).toFixed(1)},null,2));
  }finally{await new Promise(r=>server.close(r));await rust.close();await impit.close()}
})().catch(err=>{console.error(err?.stack||err);process.exit(1)});
