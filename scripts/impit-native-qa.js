'use strict';
const assert=require('assert');
const http=require('http');
const impit=require('../src/impit-http3');

(async()=>{
  const st=impit.status();
  assert(st.available,`vendored impit transport unavailable: ${st.error}`);
  assert.strictEqual(st.browser,'chrome151','impit is not using the current Chrome 151 fingerprint');
  assert.strictEqual(st.http3,true,'impit HTTP/3 support is not enabled');
  let physicalRequests=0;
  const server=http.createServer((req,res)=>{
    physicalRequests++;
    res.writeHead(200,{'content-type':'text/html; charset=utf-8'});
    res.write('<!doctype html><html><head><title>impit native fixture</title></head><body>');
    // Deliberately split the CDN URL across chunks to exercise the rolling scanner.
    setTimeout(()=>res.write('<div>Gallery (1)</div><img src="https://media.forgecdn.net/attachments/thumbnails/77/88/310/172/'),10);
    setTimeout(()=>res.write('impit-live.jpg" alt="live">'+'m'.repeat(24000)),16);
    setTimeout(()=>res.end('z'.repeat(120000)+'</body></html>'),340);
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
  const url=`http://127.0.0.1:${server.address().port}/project`,started=process.hrtime.bigint();
  const ms=()=>Number(process.hrtime.bigint()-started)/1e6;
  try{
    const flows=Array.from({length:8},()=>impit.requestProgressiveText(url,{headMaxBytes:96*1024,mediaMaxBytes:96*1024,mediaMinBytes:128,prefixMaxBytes:128*1024,timeoutMs:1800,cacheTtlMs:1000}));
    const heads=await Promise.all(flows.map(x=>x.head));const headMs=ms();
    const medias=await Promise.all(flows.map(x=>x.media));const mediaMs=ms();
    assert.strictEqual(physicalRequests,1,'impit singleflight did not collapse identical concurrent consumers');
    assert(heads.every(x=>x.status===200&&x.text.includes('</head>')),'impit streamed head gate failed');
    assert(medias.every(x=>x.mediaMarker===true),'impit media marker gate failed');
    assert(medias.every(x=>/impit-live\.jpg/.test(x.firstMediaUrl||'')),'impit did not expose the complete trusted CDN URL');
    const full=await flows[0].full,fullMs=ms();
    assert(full.bytesRead>140000,'impit full enrichment was truncated');
    assert(mediaMs<fullMs-200,'impit first media waited for the full body');
    console.log(JSON.stringify({passed:true,engine:st.engine,browser:st.browser,binding:st.binding,http3Enabled:st.http3,concurrentConsumers:flows.length,physicalRequests,headMs:+headMs.toFixed(1),mediaMs:+mediaMs.toFixed(1),fullMs:+fullMs.toFixed(1),firstMediaUrl:medias[0].firstMediaUrl,fullBytes:full.bytesRead},null,2));
  }finally{await new Promise(r=>server.close(r));await impit.close()}
})().catch(err=>{console.error(err?.stack||err);process.exit(1)});
