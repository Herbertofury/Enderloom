'use strict';
const assert=require('assert');
const http=require('http');
const {performance}=require('perf_hooks');
const publicHttp=require('../src/public-http');
const rust=require('../src/rust-http');
const {parseGenericProjectHtml}=require('../src/provider-media');

function nowMs(start){return Math.round((performance.now()-start)*10)/10}
function fixtureHead(){
  return '<!doctype html><html><head><title>Monster Girl - Minecraft Mods - CurseForge</title><meta name="description" content="fixture"></head><body><main><h1>Monster Girl</h1><div class="project-meta">Live source</div>';
}
function fixtureGallery(){
  const thumb='https://media.forgecdn.net/attachments/thumbnails/1234/5678/310/172/monster-girl.jpg';
  return `<section class="gallery"><a href="/minecraft/mc-mods/monster-girl/gallery">Gallery (1)</a><img class="gallery-thumbnail" src="${thumb}" alt="Monster Girl screenshot"></section>${'g'.repeat(1600)}`;
}
function fixtureTail(){return `<section id="description"><h2>Description</h2>${'x'.repeat(12000)}</section></main></body></html>`}

(async()=>{
  publicHttp.clearSharedCache();
  const native=rust.status();
  assert(native.available,`native Rust transport unavailable: ${native.error}`);
  const requests=[];
  const server=http.createServer((req,res)=>{
    requests.push(req.url);
    res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
    res.write(fixtureHead());
    setTimeout(()=>res.write(fixtureGallery()),25);
    setTimeout(()=>res.end(fixtureTail()),425);
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
  const base=`http://127.0.0.1:${server.address().port}`;
  const context={title:'Monster Girl',author:'MingYue'};
  const sourceUrl='https://www.curseforge.com/minecraft/mc-mods/monster-girl';
  const rows=[];
  try{
    for(const [name,make] of [
      ['node',url=>publicHttp.requestProgressiveTextShared(url,{timeoutMs:2200,cacheTtlMs:0,headMaxBytes:128*1024,mediaMaxBytes:128*1024,mediaMinBytes:256,prefixMaxBytes:256*1024})],
      ['rust',url=>rust.requestProgressiveText(url,{timeoutMs:2200,cacheTtlMs:0,headMaxBytes:128*1024,mediaMaxBytes:128*1024,mediaMinBytes:256,prefixMaxBytes:256*1024})]
    ]){
      const start=performance.now();
      const flow=make(`${base}/${name}-${Date.now()}`);
      const head=await flow.head;const headMs=nowMs(start);
      const media=await flow.media;const mediaMs=nowMs(start);
      const parsed=parseGenericProjectHtml(media.text,sourceUrl,context);
      const full=await flow.full;const fullMs=nowMs(start);
      assert(head.text.includes('</head>'),`${name} head phase did not stop on </head>`);
      assert(media.mediaMarker===true,`${name} media phase did not detect strong CDN marker`);
      assert(parsed?.gallery?.length>=1,`${name} streamed media phase did not parse CurseForge SSR gallery`);
      assert(/\/attachments\/1234\/5678\/monster-girl\.jpg/.test(parsed.gallery[0].url),`${name} did not upgrade ForgeCDN thumbnail to full image`);
      assert(/\/attachments\/thumbnails\/1234\/5678\/310\/172\/monster-girl\.jpg/.test(parsed.gallery[0].previewUrl||''),`${name} did not retain ForgeCDN preview URL`);
      assert(fullMs>=360,`${name} fixture full tail unexpectedly completed in ${fullMs}ms`);
      assert(headMs<fullMs-220,`${name} head phase did not beat slow tail: ${headMs}/${fullMs}`);
      assert(mediaMs<fullMs-220,`${name} media phase did not beat slow tail: ${mediaMs}/${fullMs}`);
      rows.push({name,headMs,mediaMs,fullMs,headBytes:head.bytesRead,mediaBytes:media.bytesRead,fullBytes:full.bytesRead,gallery:parsed.gallery.length,transport:media.transport||''});
    }
    assert.strictEqual(requests.length,2,'expected one physical request per transport test');
    console.log(JSON.stringify({passed:true,fixture:'real localhost streamed HTTP sockets',native:{engine:native.engine,profile:native.profile,poolMaxSize:native.poolMaxSize,poolMaxIdlePerHost:native.poolMaxIdlePerHost},physicalRequests:requests.length,results:rows},null,2));
  }finally{
    await new Promise(r=>server.close(r));
    await rust.close();
  }
})().catch(err=>{console.error(err?.stack||err);process.exit(1)});
