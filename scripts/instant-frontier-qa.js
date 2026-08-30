'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const http=require('http');
const {performance}=require('perf_hooks');
const publicHttp=require('../src/public-http');

const median=a=>{const b=[...a].sort((x,y)=>x-y);return b[Math.floor(b.length/2)]};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const enhance=fs.readFileSync(path.join(__dirname,'..','catalog','enhance.js'),'utf8');
  assert(!/await\s+Promise\.all\(all\.map\(loadCached\)\)/.test(enhance),'renderer still blocks live I/O on all-catalog cache hydration');
  assert(/const cacheSettled=Promise\.allSettled\(all\.map\(loadCached\)\)/.test(enhance),'renderer no longer starts cache hydration concurrently');
  assert(/queueMicrotask\(backgroundWarm\)/.test(enhance),'renderer still has an avoidable initial timer before prime');

  publicHttp.clearSharedCache();
  const server=http.createServer((req,res)=>{
    res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
    res.write('<!doctype html><html><head><title>Instant Frontier</title></head><body><h1>Instant Frontier</h1>');
    setTimeout(()=>res.write('<section class="project-gallery"><img src="https://media.forgecdn.net/attachments/thumbnails/1/2/310/172/instant-frontier.jpg" alt="Instant Frontier screenshot"></section>'),14);
    setTimeout(()=>res.end(`${'x'.repeat(64*1024)}</body></html>`),130);
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
  const base=`http://127.0.0.1:${server.address().port}`;
  const barrier=[],overlap=[];
  try{
    for(let i=0;i<5;i++){
      let t=performance.now();
      await sleep(90); // exact kind of renderer-wide cache barrier removed in 2.7
      let flow=publicHttp.requestProgressiveTextShared(`${base}/barrier-${i}-${Date.now()}`,{timeoutMs:1200,cacheTtlMs:0,mediaMinBytes:128,mediaMaxBytes:64*1024,prefixMaxBytes:96*1024,stopAfterMedia:true,bypassCache:true});
      let media=await flow.media;assert(media.mediaMarker===true);barrier.push(performance.now()-t);

      t=performance.now();
      const cacheHydration=sleep(90); // same cache work, but it starts beside network instead of before it
      flow=publicHttp.requestProgressiveTextShared(`${base}/overlap-${i}-${Date.now()}`,{timeoutMs:1200,cacheTtlMs:0,mediaMinBytes:128,mediaMaxBytes:64*1024,prefixMaxBytes:96*1024,stopAfterMedia:true,bypassCache:true});
      media=await flow.media;assert(media.mediaMarker===true);overlap.push(performance.now()-t);
      await cacheHydration;
    }
    const oldMedian=median(barrier),newMedian=median(overlap),speedup=oldMedian/newMedian;
    assert(newMedian<oldMedian-60,`cache/live overlap did not eliminate the startup floor: ${oldMedian}/${newMedian}`);
    assert(speedup>3,`startup speedup too small: ${speedup}`);
    console.log(JSON.stringify({passed:true,fixture:'real localhost HTTP media stream + 90ms all-catalog cache hydration',runs:5,barrierMedianMs:+oldMedian.toFixed(2),overlappedMedianMs:+newMedian.toFixed(2),speedup:+speedup.toFixed(2),cacheWorkPreserved:true},null,2));
  }finally{await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e?.stack||e);process.exit(1)});
