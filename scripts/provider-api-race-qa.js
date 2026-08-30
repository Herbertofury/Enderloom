'use strict';
const assert=require('assert');
const http=require('http');
const {performance}=require('perf_hooks');
const {requestJsonShared,requestProgressiveTextShared,clearSharedCache}=require('../src/public-http');
const {apiSeedFromJson}=require('../src/provider-api-fastlane');

(async()=>{
  clearSharedCache();let apiRequests=0,pageRequests=0;
  const image='https://www.spigotmc.org/data/resource_icons/53/53036.jpg';
  const server=http.createServer((req,res)=>{
    if(req.url==='/api'){
      apiRequests++;res.setHeader('content-type','application/json');
      setTimeout(()=>res.end(JSON.stringify({name:'WorldEdit',icon:{url:'/data/resource_icons/53/53036.jpg'}})),7);return;
    }
    if(req.url==='/page'){
      pageRequests++;res.setHeader('content-type','text/html');
      res.write('<!doctype html><html><head><title>WorldEdit</title>');
      setTimeout(()=>res.write(`<meta property="og:image" content="${image}"></head><body><h1>WorldEdit</h1>`),70);
      setTimeout(()=>res.end('x'.repeat(320000)+'</body></html>'),230);return;
    }
    res.statusCode=404;res.end('no');
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base=`http://127.0.0.1:${server.address().port}`;const started=performance.now();
  const pageFlow=requestProgressiveTextShared(`${base}/page`,{timeoutMs:2500,mediaMinBytes:64,mediaMaxBytes:128*1024,prefixMaxBytes:512*1024});
  const apiPromise=requestJsonShared(`${base}/api`,{timeoutMs:2500,cacheTtlMs:0});
  const apiJson=await apiPromise;const apiMs=performance.now()-started;
  const desc={provider:'spigot',kind:'spiget-resource',sourceUrl:'https://www.spigotmc.org/resources/worldedit.53036/',apiUrl:'https://api.spiget.org/v2/resources/53036'};
  const seed=apiSeedFromJson(desc,apiJson,{title:'WorldEdit'});
  const media=await pageFlow.media;const pageMediaMs=performance.now()-started;
  const full=await pageFlow.full;const fullMs=performance.now()-started;
  server.close();
  assert.equal(seed?.icon?.url,image);assert.equal(apiRequests,1);assert.equal(pageRequests,1);
  assert(apiMs<pageMediaMs,`tiny public API seed did not beat streamed provider media (${apiMs} >= ${pageMediaMs})`);
  assert(pageMediaMs<fullMs,'streamed page media should still beat full response');
  const result={passed:true,apiSeedMs:Number(apiMs.toFixed(2)),canonicalPageMediaMs:Number(pageMediaMs.toFixed(2)),canonicalFullMs:Number(fullMs.toFixed(2)),firstIconSpeedupVsCanonicalMedia:Number((pageMediaMs/apiMs).toFixed(2)),apiRequests,pageRequests,fullBytes:full.text.length};
  console.log(JSON.stringify(result));
})().catch(err=>{console.error(err);process.exit(1)});
