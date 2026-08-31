'use strict';
const assert=require('assert');
const http=require('http');
const fs=require('fs');
const path=require('path');
const {requestHeadTextShared,requestProgressiveTextShared,requestTextShared,sharedStats,clearSharedCache}=require('../src/public-http');
const {parseProviderHeadMedia}=require('../src/provider-media');
const {modrinthSlugFromUrl,chunkSlugsByUrlLength}=require('../src/modrinth-batch');

(async()=>{
  clearSharedCache();
  let fullHits=0,headHits=0,progressiveHits=0,prefixHits=0,slowBodyBytes=0;
  const big='x'.repeat(2*1024*1024);
  const server=http.createServer((req,res)=>{
    if(req.url==='/singleflight'){
      fullHits++;res.setHeader('Content-Type','text/html; charset=utf-8');
      setTimeout(()=>res.end('<!doctype html><head><title>Single Flight</title></head><body>ok</body>'),80);return;
    }
    if(req.url==='/headfast'){
      headHits++;res.setHeader('Content-Type','text/html; charset=utf-8');
      res.write('<!doctype html><head><title>Contract Blade - Minecraft Mod</title><meta property="og:image" content="https://media.forgecdn.net/attachments/project/contract-blade.png"></head><body>');
      let sent=0;const timer=setInterval(()=>{if(res.destroyed){clearInterval(timer);return}if(sent>=big.length){clearInterval(timer);res.end('</body>');return}const bit=big.slice(sent,sent+64*1024);sent+=bit.length;slowBodyBytes+=bit.length;res.write(bit)},25);return;
    }
    if(req.url==='/progressive'){
      progressiveHits++;res.setHeader('Content-Type','text/html; charset=utf-8');
      res.write('<!doctype html><head><title>Progressive Project</title><meta property="og:image" content="https://cdn.example.org/progressive.png"></head><body>');
      setTimeout(()=>res.end('<main>'+('gallery '.repeat(2000))+'</main></body>'),180);return;
    }
    if(req.url==='/prefixindex'){
      prefixHits++;res.setHeader('Content-Type','text/html; charset=utf-8');
      res.write('<!doctype html><head><title>PMC Collection</title></head><body><a href="/texture-pack/creeper-woman-6145815/" title="Creeper Woman"><img src="https://static.planetminecraft.com/files/image/minecraft/texture-pack/2024/1/creeper.png" alt="Creeper Woman">Creeper Woman</a>');
      res.write('x'.repeat(600*1024));
      setTimeout(()=>res.end('y'.repeat(700*1024)+'</body>'),220);return;
    }
    res.statusCode=404;res.end('no');
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const port=server.address().port;
  try{
    const sf=`http://127.0.0.1:${port}/singleflight`;
    const rows=await Promise.all(Array.from({length:32},()=>requestTextShared(sf,{cacheTtlMs:5000,timeoutMs:2000})));
    assert.equal(rows.length,32);assert.equal(fullHits,1,'32 identical requests must collapse into one network request');
    const before=sharedStats();await requestTextShared(sf,{cacheTtlMs:5000,timeoutMs:2000});const after=sharedStats();
    assert.equal(fullHits,1,'memory-cache hit unexpectedly performed another network request');assert(after.hits>before.hits,'shared HTTP cache did not register a hit');

    const hf=`http://127.0.0.1:${port}/headfast`;
    const t0=Date.now();const head=await requestHeadTextShared(hf,{cacheTtlMs:5000,timeoutMs:1800,maxBytes:512*1024});const elapsed=Date.now()-t0;
    assert.match(head.text,/<\/head>/i);assert(elapsed<700,`head streaming should finish before delayed 2MiB body; took ${elapsed}ms`);
    assert(head.bytesRead<256*1024,`head streaming consumed too much body: ${head.bytesRead}`);
    const parsed=parseProviderHeadMedia(head.text,'https://www.curseforge.com/minecraft/mc-mods/contract-blade',{title:'Contract Blade'});
    assert.equal(parsed,null,'CurseForge head-only metadata must not paint before exact project H1 ownership is present');

    const progressiveUrl=`http://127.0.0.1:${port}/progressive`;
    const p0=Date.now(),flow=requestProgressiveTextShared(progressiveUrl,{cacheTtlMs:5000,timeoutMs:1800});
    const progressiveHead=await flow.head,headElapsed=Date.now()-p0;
    assert(headElapsed<120,`progressive head gate was not early: ${headElapsed}ms`);
    assert.match(progressiveHead.text,/<\/head>/i);
    // A normal full-text consumer arriving while the progressive response is still in
    // flight must piggyback on it rather than opening another socket/GET.
    const piggyback=requestTextShared(progressiveUrl,{cacheTtlMs:5000,timeoutMs:1800});
    const [progressiveFull,piggybackFull]=await Promise.all([flow.full,piggyback]);
    assert.match(progressiveFull.text,/gallery gallery/);assert.equal(piggybackFull.text,progressiveFull.text);
    assert.equal(progressiveHits,1,'progressive head + concurrent full consumer unexpectedly required multiple network requests');
    await requestTextShared(progressiveUrl,{cacheTtlMs:5000,timeoutMs:1800});
    assert.equal(progressiveHits,1,'full response from progressive stream was not reused by normal shared text cache');

    const prefixUrl=`http://127.0.0.1:${port}/prefixindex`,x0=Date.now(),indexFlow=requestProgressiveTextShared(prefixUrl,{cacheTtlMs:5000,timeoutMs:1800,headMaxBytes:64*1024,prefixMaxBytes:512*1024});
    const prefix=await indexFlow.prefix,prefixElapsed=Date.now()-x0;
    assert(prefixElapsed<150,`early index prefix gate missed the first-paint window: ${prefixElapsed}ms`);
    assert.match(prefix.text,/Creeper Woman/,'index prefix did not contain the exact child project');
    const indexFull=await indexFlow.full,fullElapsed=Date.now()-x0;
    assert(fullElapsed>=180,`full index unexpectedly completed before delayed tail: ${fullElapsed}ms`);
    assert(prefixElapsed<fullElapsed,'prefix gate did not beat full collection download');
    assert.equal(prefixHits,1,'index prefix + full gates must share one physical GET');

    const bulkSlugs=Array.from({length:400},(_,i)=>`project-${i}-${'x'.repeat(i%17)}`);
    const bulkChunks=chunkSlugsByUrlLength(bulkSlugs,1800);
    assert.deepEqual(bulkChunks.flat(),bulkSlugs,'Modrinth transport chunking dropped/reordered a project');
    assert(bulkChunks.length>1,'Modrinth batch QA did not exercise transport chunking');
    assert.equal(modrinthSlugFromUrl('https://modrinth.com/mod/sodium'),'sodium');

    const main=fs.readFileSync(path.resolve(__dirname,'../main.js'),'utf8');
    const enhance=fs.readFileSync(path.resolve(__dirname,'../catalog/enhance.js'),'utf8');
    const preload=fs.readFileSync(path.resolve(__dirname,'../catalog-preload.js'),'utf8');
    assert(main.includes("name:'chromium-head'")&&main.includes("name:'chromium-media'")&&main.includes("name:'node-media'")&&main.includes("name:'rust-media'")&&main.includes("name:'chromium-index-prefix'")&&main.includes('publicRequestProgressiveTextShared')&&main.includes('chromiumProgressiveTextShared'),'prime pipeline does not race content-sensitive direct media and collection-prefix media across native transports');
    assert(main.includes('mediaStorageKey(url,contextKey)')&&main.includes('version:15')&&main.includes('version || 0) < 15'),'persistent media cache is not project-context-aware or v15 promotion-quarantine invalidation regressed');
    assert(main.includes("ipcMain.handle('catalog:cached-media-batch'")&&preload.includes('cachedMediaBatch'),'cache lookup still uses per-card IPC');
    assert(main.includes("ipcMain.on('catalog:prime-media'")&&preload.includes('primeMedia'),'catalog-wide priority media scheduler missing');
    assert(main.includes('async function fetchAndParseProviderHtml('),'fast provider parser helper missing from packaged main process');
    assert(main.includes('discoverModrinthMedia(url,context,deep||force||!!context.author)'),'Modrinth project/author API enrichment route regressed');
    assert(main.includes('warmModrinthProjectBatches(rows)')&&main.includes('/v2/projects?ids='),'Modrinth projects are not bulk-primed through the provider-native endpoint');
    assert(main.includes('Author-profile discovery is deliberately NOT on the first-image critical path'),'author enrichment regressed onto the first-image critical path');
    assert(enhance.includes("if((s.gallery.length||s.icon||s.galleryAbsent)&&!s.cacheStale)s.quickLoaded=true"),'definitive no-gallery cache is not recognized');
    assert(enhance.includes('mergeMedia(s,media);applyState(s)'),'per-source media is not progressively painted');
    assert(enhance.includes("rootMargin:'2600px 0px'"),'near-viewport priority prefetch regressed');
    assert(enhance.includes('scheduleRichDeep(s,!s.galleryAbsent&&!s.gallery.length&&!s.icon)'),'rich Chromium discovery ignores definitive no-gallery state');
    assert(enhance.includes("if(!primeAvailable()){enqueue(s,false,true,false);if(!s.galleryAbsent&&!s.gallery.length&&!s.icon)scheduleRichDeep(s,true)}"),'viewport fallback ignores definitive no-gallery state');
    assert(enhance.includes("img.fetchPriority=aboveFold?'high':nearViewport?'auto':'low'"),'image-byte priority is not viewport-aware');
    assert(main.includes('Math.min(128, Math.ceil((os.cpus()?.length || 12) * 3.0))')&&main.includes('Math.min(MEDIA_PRIME_MAX, Math.ceil((os.cpus()?.length || 12) * 3.0))'),'main first-image frontier did not receive the 2.7 true-parallel concurrency budget');
    const pumpBody=/function pump\(\)\{([\s\S]*?)\n  \}/.exec(enhance)?.[1]||'';
    assert(pumpBody.indexOf('quickQueue.length')>=0&&pumpBody.indexOf('quickQueue.length')<pumpBody.indexOf('deepQueue.length'),'deep queue is being serviced before quick first-image work');
    assert(!/mediaCache\.entries\(\)\]\.slice\(/.test(main),'persistent media cache has an arbitrary entry-count truncation');
    // No gallery/result truncation is allowed. These patterns previously caused quality loss.
    assert(!/gallery\s*=\s*gallery\.slice\(/.test(main+enhance),'gallery content cap detected');
    assert(!/\.slice\(0\s*,\s*24\)/.test(main+enhance),'legacy 24-image cap returned');

    console.log(JSON.stringify({passed:true,singleFlight:{concurrent:32,networkRequests:fullHits},streamedHead:{elapsedMs:elapsed,bytesRead:head.bytesRead,serverBodyBytesBeforeAbort:slowBodyBytes,networkRequests:headHits},progressiveOneRequest:{headElapsedMs:headElapsed,networkRequests:progressiveHits,fullBytes:Buffer.byteLength(progressiveFull.text,'utf8')},collectionPrefix:{prefixElapsedMs:prefixElapsed,fullElapsedMs:fullElapsed,networkRequests:prefixHits},shared:sharedStats(),contextAwareCache:true,progressivePaint:true,modrinthBulk:{projects:bulkSlugs.length,chunks:bulkChunks.length,lossless:bulkChunks.flat().length===bulkSlugs.length},noGalleryCaps:true},null,2));
  }finally{await new Promise(r=>server.close(r))}
})().catch(err=>{console.error(err);process.exit(1)});
