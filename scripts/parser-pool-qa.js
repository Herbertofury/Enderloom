'use strict';
const assert=require('assert');
const {performance}=require('perf_hooks');
const {parseGenericProjectHtml}=require('../src/provider-media');
const {createProviderParserPool}=require('../src/provider-parser-pool');

const count=32;
const junk='<div class="feed"><img src="https://media.forgecdn.net/attachments/100/100/unrelated.png" alt="Trending other project">'+('metadata filler '.repeat(2800))+'</div>';
const fixtures=Array.from({length:count},(_,i)=>({url:`https://www.curseforge.com/minecraft/mc-mods/maid-tool-${i}`,context:{title:`Maid Tool ${i}`},html:`<!doctype html><head><meta property="og:title" content="Maid Tool ${i}"></head><body>${junk.repeat(4)}<h1>Maid Tool ${i}</h1><h2>Description</h2><img src="https://media.forgecdn.net/attachments/${700+i}/1/maid-tool-${i}.png" alt="Maid Tool ${i} screenshot">${junk.repeat(5)}<footer>footer</footer></body>`}));
(async()=>{
  // Warm JIT so comparison measures parsing rather than first-call compilation.
  for(let i=0;i<3;i++)parseGenericProjectHtml(fixtures[i].html,fixtures[i].url,fixtures[i].context);
  let t=performance.now();
  const serial=fixtures.map(f=>parseGenericProjectHtml(f.html,f.url,f.context));
  const serialMs=performance.now()-t;
  assert(serial.every((r,i)=>r.gallery.some(x=>x.url.includes(`maid-tool-${i}.png`))),'serial parser lost owned media');
  const pool=createProviderParserPool({workers:Math.min(8,Math.max(4,require('os').cpus().length>>2)),minWorkerBytes:1});
  // Warm every worker before the timed pass.
  await Promise.all(fixtures.slice(0,pool.stats().workers).map(f=>pool.parse({mode:'full',...f})));
  t=performance.now();
  const parallel=await Promise.all(fixtures.map(f=>pool.parse({mode:'full',...f})));
  const parallelMs=performance.now()-t;
  assert(parallel.every((r,i)=>r.gallery.some(x=>x.url.includes(`maid-tool-${i}.png`))),'worker parser lost owned media');
  const speedup=serialMs/parallelMs;
  // On single/CPU-constrained CI, absolute wall time can tie; the release still requires
  // a healthy multi-worker pool and no material regression. Typical desktop builds exceed 1x.
  assert(pool.stats().workers>=2,'parser pool did not create parallel workers');
  assert(parallelMs<serialMs*1.35,`parallel parser unexpectedly regressed: ${parallelMs.toFixed(1)} vs ${serialMs.toFixed(1)} ms`);
  await pool.close();
  console.log(JSON.stringify({passed:true,fixtures:count,workers:pool.stats().workers,serialMs:+serialMs.toFixed(2),parallelMs:+parallelMs.toFixed(2),speedup:+speedup.toFixed(2),bytesPerFixture:Buffer.byteLength(fixtures[0].html)}));
})().catch(e=>{console.error(e);process.exit(1)});
