'use strict';
const assert=require('assert');
const {performance}=require('perf_hooks');
const {startParallelRace,hasMedia}=require('../src/parallel-media-race');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const starts=[];const t0=performance.now();
  const race=startParallelRace([
    {name:'node',run:async()=>{starts.push(['node',performance.now()-t0]);await sleep(650);return {gallery:[{url:'node'}]}}},
    {name:'chromium',run:async()=>{starts.push(['chromium',performance.now()-t0]);await sleep(24);return {gallery:[{url:'chromium'}]}}},
    {name:'rust',run:async()=>{starts.push(['rust',performance.now()-t0]);await sleep(45);return {gallery:[{url:'rust'}]}}}
  ],{accept:hasMedia});
  const first=await race.first;const firstMs=performance.now()-t0;
  assert.strictEqual(first.name,'chromium');assert(firstMs<120,`first paint waited ${firstMs}ms`);
  await sleep(8);
  assert.strictEqual(starts.length,3,'all transport lanes must start immediately, not after another lane finishes');
  assert(Math.max(...starts.map(x=>x[1]))<15,`lane starts were serialized: ${JSON.stringify(starts)}`);
  const settled=await race.settled;assert.strictEqual(settled.length,3);

  const invalid=startParallelRace([
    {name:'invalid-fast',run:async()=>{await sleep(4);return {gallery:[]}}},
    {name:'valid',run:async()=>{await sleep(20);return {icon:{url:'ok'}}}}
  ],{accept:hasMedia});
  const validFirst=await invalid.first;assert.strictEqual(validFirst.name,'valid','empty fast response must not win');

  console.log(JSON.stringify({passed:true,firstMs:Math.round(firstMs),laneStartSpreadMs:Math.round(Math.max(...starts.map(x=>x[1]))-Math.min(...starts.map(x=>x[1]))),settled:settled.map(x=>x.name)},null,2));
})().catch(err=>{console.error(err);process.exit(1)});
