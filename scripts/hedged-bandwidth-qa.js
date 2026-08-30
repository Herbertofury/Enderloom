'use strict';
const assert=require('assert');
const http=require('http');
const {performance}=require('perf_hooks');
const publicHttp=require('../src/public-http');
const rust=require('../src/rust-http');
const impit=require('../src/impit-http3');
const {transportPolicy}=require('../src/provider-fastlane');

const EARLY='<html><head><meta property="og:title" content="Live Provider Project"><meta property="og:image" content="https://c10.patreonusercontent.com/4/patreon-media/p/post/123456/preview.jpg"></head><body>';
const TAIL_CHUNK=Buffer.alloc(16*1024,120),TAIL_COUNT=64,TAIL_BYTES=TAIL_CHUNK.length*TAIL_COUNT;
const records=new Map();
const timers=new Set();
let nextId=1;
const server=http.createServer((req,res)=>{
  const id=nextId++,key=new URL(req.url,'http://local').searchParams.get('lane')||String(id);
  const row={key,written:0,chunks:0,closed:false,finished:false};records.set(key,row);
  res.on('close',()=>{row.closed=true});res.on('finish',()=>{row.finished=true});
  res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
  if(!res.destroyed){res.write(EARLY);row.written+=Buffer.byteLength(EARLY);row.chunks++}
  let sent=0;
  const timer=setInterval(()=>{
    if(res.destroyed||sent>=TAIL_COUNT){clearInterval(timer);timers.delete(timer);if(!res.destroyed){const end='</body></html>';res.end(end);row.written+=Buffer.byteLength(end)}return}
    res.write(TAIL_CHUNK);row.written+=TAIL_CHUNK.length;row.chunks++;sent++;
  },4);timers.add(timer);
});
function p95(rows){const a=[...rows].sort((a,b)=>a-b);return a[Math.max(0,Math.ceil(a.length*.95)-1)]||0}
async function timedMedia(flow){const at=performance.now();const media=await flow.media;return {ms:performance.now()-at,media}}
async function run(){
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
  const base=`http://127.0.0.1:${server.address().port}/page`;
  assert(rust.status().available,'wreq native binding unavailable');assert(impit.status().available,'impit native binding unavailable');

  // 2.4-style audit: all native hedges receive the complete slow response tail.
  const baselineFlows=[
    publicHttp.requestProgressiveTextShared(`${base}?lane=baseline-node`,{bypassCache:true,force:true,mediaMinBytes:1,timeoutMs:5000}),
    rust.requestProgressiveText(`${base}?lane=baseline-rust`,{bypassCache:true,force:true,mediaMinBytes:1,timeoutMs:5000}),
    impit.requestProgressiveText(`${base}?lane=baseline-impit`,{bypassCache:true,force:true,mediaMinBytes:1,timeoutMs:5000})
  ];
  const baselineMedia=await Promise.all(baselineFlows.map(timedMedia));
  await Promise.all(baselineFlows.map(x=>x.full));

  // 2.5 bandwidth-first fast lane: one complete keeper plus a physically cancellable
  // Node first-media probe. Chromium uses the same body-cancel model in the real app;
  // the Node fixture is deterministic evidence that we stop paying for redundant tails.
  const optimizedFlows=[
    publicHttp.requestProgressiveTextShared(`${base}?lane=optimized-keeper`,{bypassCache:true,force:true,mediaMinBytes:1,timeoutMs:5000}),
    publicHttp.requestProgressiveTextShared(`${base}?lane=optimized-probe`,{bypassCache:true,stopAfterMedia:true,mediaMinBytes:1,timeoutMs:5000})
  ];
  const optimizedMedia=await Promise.all(optimizedFlows.map(timedMedia));
  const optimizedFull=await Promise.all(optimizedFlows.map(x=>x.full));
  await new Promise(r=>setTimeout(r,80));
  assert.equal(optimizedFull[1].abortedAfterMedia,true,'physical probe did not terminate after trusted media');
  const probe=records.get('optimized-probe');assert(probe.closed,'probe socket did not close');assert(probe.written<TAIL_BYTES*.2,`probe consumed too much tail: ${probe.written}`);

  const sum=prefix=>[...records.values()].filter(x=>x.key.startsWith(prefix)).reduce((n,x)=>n+x.written,0);
  const baselineBytes=sum('baseline-'),optimizedBytes=sum('optimized-');
  assert(optimizedBytes<baselineBytes*.45,`2.5 policy did not cut enough transferred bytes: ${optimizedBytes}/${baselineBytes}`);
  const baselineP95=p95(baselineMedia.map(x=>x.ms)),optimizedP95=p95(optimizedMedia.map(x=>x.ms));
  assert(optimizedP95<=baselineP95*1.8+20,`bandwidth policy regressed first-media latency: ${optimizedP95} vs ${baselineP95}`);

  // Real native audit that drove the policy: both Rust clients expose logical body abort,
  // but their pooled networking may continue draining for connection reuse. Therefore 2.5
  // does NOT fire them as redundant probes across Patreon/Afdian/Marketplace/static sites.
  const rustProbe=rust.requestProgressiveText(`${base}?lane=audit-rust-probe`,{bypassCache:true,stopAfterMedia:true,mediaMinBytes:1,timeoutMs:5000});
  const impitProbe=impit.requestProgressiveText(`${base}?lane=audit-impit-probe`,{bypassCache:true,stopAfterMedia:true,mediaMinBytes:1,timeoutMs:5000});
  const nativeMedia=await Promise.all([timedMedia(rustProbe),timedMedia(impitProbe)]);const nativeFull=await Promise.all([rustProbe.full,impitProbe.full]);
  assert(nativeFull.every(x=>x?.abortedAfterMedia===true),'native logical first-media abort contract failed');
  assert(nativeMedia.every(x=>/patreonusercontent\.com/.test(x.media.firstMediaUrl||'')),'native probes missed trusted provider media');
  const policy=transportPolicy('patreon');assert(policy.disabled.has('wreq')&&policy.disabled.has('impit'),'native drain audit must disable redundant Patreon native probes');

  console.log(JSON.stringify({passed:true,tailBytesPerFull:TAIL_BYTES,baselineBytes,optimizedBytes,byteReductionPct:Number(((1-optimizedBytes/baselineBytes)*100).toFixed(1)),baselineFirstMediaP95Ms:Number(baselineP95.toFixed(2)),optimizedFirstMediaP95Ms:Number(optimizedP95.toFixed(2)),probeBytes:probe.written,nativeAudit:'wreq+impit logical abort measured; redundant pooled probes disabled'}));
}
run().finally(async()=>{for(const t of timers)clearInterval(t);try{server.closeAllConnections?.()}catch{}await new Promise(r=>server.close(()=>r()));await rust.close();await impit.close()}).catch(err=>{console.error(err);process.exitCode=1});
