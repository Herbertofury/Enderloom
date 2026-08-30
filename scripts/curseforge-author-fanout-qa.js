'use strict';
const assert=require('assert');
const http=require('http');
const {performance}=require('perf_hooks');
const {requestProgressiveTextShared,clearSharedCache}=require('../src/public-http');
const {curseForgeAuthorMediaPattern}=require('../src/curseforge-fastlane');
const {parseCurseForgeAuthorProjectHtml}=require('../src/provider-media');

(async()=>{
  clearSharedCache();let hits=0;
  const names=['Damage Number','Quick Take','Maid Storage Manager','Ars Botania','Tour Guide','Maid Useful Tasks','Jump Efficiency','Maid Command','Battery Shield','Creative Sandbox','Better Carryon Maid','Lantern Courier'];
  const body=names.map((name,i)=>`<article><img src="https://media.forgecdn.net/avatars/thumbnails/${1200+i}/${600+i}/256/256/icon-${i}.png" alt="${name} logo"><a href="https://www.curseforge.com/minecraft/mc-mods/${name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}">${name}</a></article>`).join('');
  const server=http.createServer((req,res)=>{
    hits++;res.setHeader('content-type','text/html; charset=utf-8');
    res.write('<!doctype html><head><title>xypp\'s Profile - Member List - CurseForge</title></head><body><img src="https://media.forgecdn.net/avatars/1307/570/profile.png" alt="profile avatar"><h1>xypp</h1>');
    setTimeout(()=>res.write(body),18);setTimeout(()=>res.end('</body></html>'),70);
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}/author`;
  try{
    const t0=performance.now();
    const flows=names.map(name=>requestProgressiveTextShared(url,{timeoutMs:1000,cacheTtlMs:5000,headMaxBytes:64*1024,mediaMaxBytes:128*1024,prefixMaxBytes:256*1024,mediaMinBytes:128,mediaPattern:curseForgeAuthorMediaPattern({author:'xypp'})}));
    const prefixes=await Promise.all(flows.map(f=>f.prefix));
    const elapsed=performance.now()-t0;
    assert.equal(hits,1,`same creator page should single-flight for all cards; got ${hits} physical requests`);
    const parsed=prefixes.map((response,i)=>parseCurseForgeAuthorProjectHtml(response.text,'https://www.curseforge.com/members/xypp/projects',{title:names[i],author:'xypp'}));
    parsed.forEach((row,i)=>{assert(row.author?.url.endsWith('/profile.png'),`card ${i} missed exact shared author avatar`);assert(row.icon?.alt.toLowerCase().includes(names[i].toLowerCase()),`card ${i} did not bind its own exact project icon`);assert.equal(row.icon?.role,'icon')});
    const allIcons=new Set(parsed.map(x=>x.icon?.url));assert.equal(allIcons.size,names.length,'project-specific icon fanout collapsed different projects together');
    console.log(JSON.stringify({passed:true,cards:names.length,physicalAuthorPageRequests:hits,uniqueProjectIcons:allIcons.size,elapsedMs:Number(elapsed.toFixed(2)),sharedFanout:true},null,2));
  } finally {await new Promise(r=>server.close(r));}
})().catch(err=>{console.error(err);process.exit(1)});
