'use strict';
const assert=require('assert');
const http=require('http');
const {performance}=require('perf_hooks');
const {requestProgressiveTextShared,clearSharedCache}=require('../src/public-http');
const {curseForgeOwnedMediaPattern,curseForgeAuthorMediaPattern}=require('../src/curseforge-fastlane');

const promo='https://media.forgecdn.net/attachments/999/999/pubg-battlegrounds-ugc-contest.jpg';
const icon='https://media.forgecdn.net/avatars/thumbnails/1250/606/256/256/638816218118878552.png';
const avatar='https://media.forgecdn.net/avatars/1307/570/638850123048469351.png';
const context={title:'Maid Useful Tasks',author:'xypp'};
const runs=[];

(async()=>{
  let hits=0;
  const server=http.createServer((req,res)=>{
    hits++;res.setHeader('Content-Type','text/html; charset=utf-8');
    if(req.url.startsWith('/project')){
      res.write(`<!doctype html><head><title>Maid Useful Tasks - Minecraft Mods - CurseForge</title></head><body><img src="${promo}" alt="PUBG BATTLEGROUNDS UGC CONTEST">`);
      setTimeout(()=>res.write(`<h1>Maid Useful Tasks</h1><div class="project"><img src="${icon}" alt="Maid Useful Tasks project image"></div>`),28);
      setTimeout(()=>res.end('<div>'+('tail '.repeat(10000))+'</div></body></html>'),185);return;
    }
    if(req.url.startsWith('/gallery')){
      res.write(`<!doctype html><head><title>Maid Useful Tasks - Gallery - Minecraft Mods - CurseForge</title></head><body><img src="${promo}" alt="PUBG BATTLEGROUNDS UGC CONTEST"><h1>Maid Useful Tasks</h1>`);
      setTimeout(()=>res.write('<p>This mod has no gallery items available</p>'),22);
      setTimeout(()=>res.end('</body></html>'),155);return;
    }
    if(req.url.startsWith('/author')){
      res.write(`<!doctype html><head><title>xypp's Profile - Member List - CurseForge</title></head><body><img src="${promo}" alt="promotion"><img src="${icon}" alt="Maid Useful Tasks logo">`);
      setTimeout(()=>res.write(`<img src="${avatar}" alt="profile avatar"><h1>xypp</h1>`),25);
      setTimeout(()=>res.end('</body></html>'),160);return;
    }
    res.statusCode=404;res.end('no');
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const port=server.address().port;
  try{
    for(let i=0;i<5;i++){
      clearSharedCache();
      const t0=performance.now();
      const flow=requestProgressiveTextShared(`http://127.0.0.1:${port}/project?i=${i}`,{timeoutMs:1000,cacheTtlMs:0,mediaMinBytes:128,mediaMaxBytes:256*1024,prefixMaxBytes:384*1024,mediaPattern:curseForgeOwnedMediaPattern(context,false)});
      const media=await flow.media,mediaMs=performance.now()-t0;
      assert(media.mediaMarker,'project identity media gate did not match exact project-owned image');
      assert(mediaMs>=15,`global promotion incorrectly opened project media gate at ${mediaMs.toFixed(2)}ms`);
      assert.match(media.text,/<h1>Maid Useful Tasks<\/h1>/,'project media gate opened before exact H1 ownership');
      assert(media.text.includes(icon),'project media gate opened without exact project icon');
      const full=await flow.full,fullMs=performance.now()-t0;
      assert(media.bytesRead<full.bytesRead,'first-role gate consumed the full response instead of resolving from the owned prefix');
      runs.push({mediaMs,fullMs});
    }

    clearSharedCache();const g0=performance.now();
    const galleryFlow=requestProgressiveTextShared(`http://127.0.0.1:${port}/gallery`,{timeoutMs:1000,cacheTtlMs:0,mediaMinBytes:128,mediaMaxBytes:256*1024,mediaPattern:curseForgeOwnedMediaPattern(context,true)});
    const galleryMedia=await galleryFlow.media,galleryMs=performance.now()-g0;
    assert(galleryMedia.mediaMarker,'definitive no-gallery marker did not open gallery-state gate');
    assert.match(galleryMedia.text,/This mod has no gallery items available/i);
    assert(galleryMs<100,`definitive no-gallery state took too long: ${galleryMs.toFixed(2)}ms`);
    await galleryFlow.full;

    clearSharedCache();const a0=performance.now();
    const authorFlow=requestProgressiveTextShared(`http://127.0.0.1:${port}/author`,{timeoutMs:1000,cacheTtlMs:0,mediaMinBytes:128,mediaMaxBytes:256*1024,mediaPattern:curseForgeAuthorMediaPattern(context)});
    const authorMedia=await authorFlow.media,authorMs=performance.now()-a0;
    assert(authorMedia.mediaMarker,'exact author profile gate did not match');
    assert(authorMs>=12,`unrelated project/promo imagery incorrectly opened author gate at ${authorMs.toFixed(2)}ms`);
    assert(authorMedia.text.includes('profile avatar')&&authorMedia.text.includes('<h1>xypp</h1>'),'author gate opened before exact profile ownership');
    await authorFlow.full;

    const sorted=runs.map(x=>x.mediaMs).sort((a,b)=>a-b),fullSorted=runs.map(x=>x.fullMs).sort((a,b)=>a-b);
    const median=sorted[Math.floor(sorted.length/2)],fullMedian=fullSorted[Math.floor(fullSorted.length/2)];
    console.log(JSON.stringify({passed:true,runs:runs.length,projectOwnedMediaMedianMs:Number(median.toFixed(2)),fullResponseMedianMs:Number(fullMedian.toFixed(2)),speedupVsFull:Number((fullMedian/median).toFixed(2)),negativeGalleryMs:Number(galleryMs.toFixed(2)),authorOwnershipMs:Number(authorMs.toFixed(2)),physicalRequests:hits},null,2));
  }finally{await new Promise(r=>server.close(r))}
})().catch(err=>{console.error(err);process.exit(1)});
