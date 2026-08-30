'use strict';
const assert=require('assert');
const http=require('http');
const {performance}=require('perf_hooks');
const publicHttp=require('../src/public-http');
const rust=require('../src/rust-http');

function pct(values,p){const a=[...values].sort((x,y)=>x-y);return a[Math.min(a.length-1,Math.max(0,Math.ceil(a.length*p)-1))]}
(async()=>{
  publicHttp.clearSharedCache();
  const native=rust.status();assert(native.available,`Rust unavailable: ${native.error}`);
  const total=96;let active=0,maxActive=0,physical=0;
  const server=http.createServer((req,res)=>{
    physical++;active++;maxActive=Math.max(maxActive,active);
    const id=encodeURIComponent(req.url.replace(/^\//,''));
    res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
    res.write(`<!doctype html><html><head><title>Stress ${id}</title></head><body><h1>Stress ${id}</h1>`);
    setTimeout(()=>res.write(`<div>Gallery (1)</div><img src="https://media.forgecdn.net/attachments/thumbnails/999/888/310/172/${id}.jpg" alt="Stress ${id}">${'m'.repeat(1400)}`),15+(physical%7)*3);
    setTimeout(()=>{res.end(`${'z'.repeat(8000)}</body></html>`);active--},235+(physical%5)*4);
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
  const base=`http://127.0.0.1:${server.address().port}`;
  try{
    const start=performance.now();
    const jobs=[];
    for(let i=0;i<total;i++){
      const node=publicHttp.requestProgressiveTextShared(`${base}/n-${i}-${Date.now()}`,{timeoutMs:3500,cacheTtlMs:0,mediaMinBytes:256,mediaMaxBytes:64*1024,headMaxBytes:64*1024,prefixMaxBytes:128*1024});
      const rustFlow=rust.requestProgressiveText(`${base}/r-${i}-${Date.now()}`,{timeoutMs:3500,cacheTtlMs:0,mediaMinBytes:256,mediaMaxBytes:64*1024,headMaxBytes:64*1024,prefixMaxBytes:128*1024});
      jobs.push({name:`node-${i}`,flow:node},{name:`rust-${i}`,flow:rustFlow});
    }
    const mediaRows=await Promise.all(jobs.map(async j=>{const r=await j.flow.media;return {name:j.name,ms:performance.now()-start,ok:r.mediaMarker===true,bytes:r.bytesRead}}));
    const mediaDone=performance.now()-start;
    const fullRows=await Promise.all(jobs.map(async j=>{const r=await j.flow.full;return {name:j.name,bytes:r.bytesRead}}));
    const fullDone=performance.now()-start;
    const times=mediaRows.map(x=>x.ms),nodeTimes=mediaRows.filter(x=>x.name.startsWith('node-')).map(x=>x.ms),rustTimes=mediaRows.filter(x=>x.name.startsWith('rust-')).map(x=>x.ms);
    assert(mediaRows.every(x=>x.ok),'at least one parallel transport missed the media marker');
    assert.strictEqual(physical,total*2,'unexpected request count: single physical request per flow was not preserved');
    assert(maxActive>=Math.floor(total*1.5),`transport burst serialized too aggressively: maxActive=${maxActive}`);
    assert(mediaDone<fullDone-120,`first-media frontier did not materially beat full tails: ${mediaDone}/${fullDone}`);
    assert(fullRows.every(x=>x.bytes>8000),'full enrichment lost response bytes');
    console.log(JSON.stringify({passed:true,fixture:'192 real localhost HTTP streams',cards:total,flows:jobs.length,physicalRequests:physical,maxConcurrentServerRequests:maxActive,mediaAllMs:Math.round(mediaDone*10)/10,fullAllMs:Math.round(fullDone*10)/10,all:{p50:Math.round(pct(times,.5)*10)/10,p95:Math.round(pct(times,.95)*10)/10,max:Math.round(Math.max(...times)*10)/10},node:{p50:Math.round(pct(nodeTimes,.5)*10)/10,p95:Math.round(pct(nodeTimes,.95)*10)/10},rust:{p50:Math.round(pct(rustTimes,.5)*10)/10,p95:Math.round(pct(rustTimes,.95)*10)/10},rustPool:{maxSize:native.poolMaxSize,maxIdlePerHost:native.poolMaxIdlePerHost}},null,2));
  }finally{await new Promise(r=>server.close(r));await rust.close()}
})().catch(err=>{console.error(err?.stack||err);process.exit(1)});
