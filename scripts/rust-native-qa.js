'use strict';
const assert=require('assert');
const http=require('http');
const rust=require('../src/rust-http');

(async()=>{
  const st=rust.status();
  assert(st.available,`vendored Rust transport unavailable: ${st.error}`);
  assert(/^chrome_\d+$/.test(st.profile),`unexpected browser profile: ${st.profile}`);
  assert(st.pooled,'Rust transport is not pooled');
  assert(st.poolMaxSize>=192&&st.poolMaxIdlePerHost>=48,'Rust pool not widened');

  let physicalRequests=0;
  const server=http.createServer((req,res)=>{
    physicalRequests++;
    res.writeHead(200,{'content-type':'text/html; charset=utf-8'});
    res.write('<!doctype html><html><head><title>Rust progressive fixture</title></head><body>');
    setTimeout(()=>res.write('<div>Gallery (1)</div><img src="https://media.forgecdn.net/attachments/thumbnails/1/2/310/172/live.jpg" alt="live">'+'a'.repeat(220000)),18);
    setTimeout(()=>res.end('b'.repeat(260000)+'</body></html>'),520);
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
  const url=`http://127.0.0.1:${server.address().port}/project`;
  const started=Date.now();
  try{
    const [a,b,c]=[1,2,3].map(()=>rust.requestProgressiveText(url,{headMaxBytes:128*1024,mediaMaxBytes:128*1024,mediaMinBytes:256,prefixMaxBytes:192*1024,timeoutMs:2500,cacheTtlMs:1000}));
    const heads=await Promise.all([a.head,b.head,c.head]);
    const headMs=Date.now()-started;
    assert.strictEqual(physicalRequests,1,'Rust singleflight did not collapse identical concurrent requests');
    assert(heads.every(x=>x.status===200&&x.text.includes('</head>')),'Rust head did not expose streamed head');
    assert(headMs<250,`Rust progressive head waited too long: ${headMs}ms`);
    const media=await a.media;const mediaMs=Date.now()-started;
    assert(media.mediaMarker===true&&media.text.includes('media.forgecdn.net'),'Rust content-sensitive media gate missed the CDN image');
    assert(mediaMs<250,`Rust media gate waited too long: ${mediaMs}ms`);
    const full=await a.full;
    const fullMs=Date.now()-started;
    assert(full.complete,'Rust full body did not complete');
    assert(full.bytesRead>450000,'Rust full body was truncated');
    assert(fullMs>=450,`fixture full body completed before delayed tail: ${fullMs}ms`);
    console.log(JSON.stringify({passed:true,engine:st.engine,profile:st.profile,binding:st.binding,concurrentConsumers:3,physicalRequests,headMs,mediaMs,fullMs,headBytes:heads[0].bytesRead,mediaBytes:media.bytesRead,fullBytes:full.bytesRead,progressiveMediaBeforeFull:mediaMs<fullMs},null,2));
  }finally{
    await new Promise(r=>server.close(r));
    await rust.close();
  }
})().catch(err=>{console.error(err?.stack||err);process.exit(1)});
