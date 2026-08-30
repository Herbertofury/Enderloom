'use strict';

// Fourth independent live-source transport: Apify impit 0.14.4 native Rust.
// impit is compiled with browser impersonation and HTTP/3 support. We load the
// official N-API binding directly so release builds do not depend on npm install.
const path=require('path');
const {firstTrustedMediaUrl,mediaMarkerMatched:providerMediaMarkerMatched}=require('./provider-fastlane');

let native=null;
let client=null;
let h3Client=null;
let loadTried=false;
let loadError='';
const inflight=new Map();
const activeFlows=new Set();
const cache=new Map();
let closing=false;
const CACHE_MAX=192;
const CACHE_MAX_BYTES=64*1024*1024;
let cacheBytes=0;
const VERSION='0.14.4';
const BROWSER='chrome151';
function detectLibc(){
  if(process.platform!=='linux')return '';
  try{return process.report?.getReport?.()?.header?.glibcVersionRuntime?'gnu':'musl'}catch{return 'gnu'}
}
function bindingName(){
  if(process.platform==='win32'&&process.arch==='x64')return 'impit-node.win32-x64-msvc.node';
  if(process.platform==='linux'&&process.arch==='x64'&&detectLibc()==='gnu')return 'impit-node.linux-x64-gnu.node';
  return '';
}
function loadNative(){
  if(loadTried)return native;
  loadTried=true;
  const name=bindingName();
  if(!name){loadError=`No vendored impit binding for ${process.platform}-${process.arch}${detectLibc()?`-${detectLibc()}`:''}`;return null}
  try{
    native=require(path.join(__dirname,'..','vendor','impit',name));
    client=new native.Impit({browser:BROWSER,timeout:6500,followRedirects:true,maxRedirects:8});
    h3Client=new native.Impit({browser:BROWSER,http3:true,timeout:3000,followRedirects:true,maxRedirects:8});
  }catch(err){loadError=String(err?.message||err);native=null;client=null;h3Client=null}
  return native;
}
function status(){
  const n=loadNative();
  return {available:!!n,error:n?'':loadError,engine:n?`impit ${VERSION} native Rust browser transport + HTTP/3`:'unavailable',browser:n?BROWSER:'',binding:n?bindingName():'',http3:!!n};
}
function headersObject(headers){
  const out={};
  try{
    if(headers&&typeof headers.entries==='function'){
      for(const [k,v] of headers.entries()){const key=String(k).toLowerCase();out[key]=out[key]?`${out[key]}, ${v}`:String(v)}
    }else for(const pair of headers||[]){if(!Array.isArray(pair)||pair.length<2)continue;const key=String(pair[0]).toLowerCase(),v=String(pair[1]);out[key]=out[key]?`${out[key]}, ${v}`:v}
  }catch{}
  return out;
}
function decodeText(buffer,headers={}){
  const type=String(headers['content-type']||'');
  let charset=/charset\s*=\s*([^;\s]+)/i.exec(type)?.[1]?.replace(/["']/g,'').toLowerCase()||'utf-8';
  if(!['utf-8','utf8','us-ascii','ascii','latin1','iso-8859-1'].includes(charset))charset='utf-8';
  const enc=/latin1|iso-8859-1/.test(charset)?'latin1':/ascii/.test(charset)?'ascii':'utf8';
  return buffer.toString(enc);
}
function markerMatched(text,pattern=null){
  if(pattern){try{if(typeof pattern==='function')return !!pattern(String(text||''));if(pattern instanceof RegExp){pattern.lastIndex=0;return pattern.test(String(text||''))}return new RegExp(String(pattern),'i').test(String(text||''))}catch{}}
  return providerMediaMarkerMatched(String(text||''));
}
function makeDeferred(){let resolve,reject;const promise=new Promise((r,j)=>{resolve=r;reject=j});return {promise,resolve,reject,done:false}}
function settle(d,value,error){if(d.done)return;d.done=true;if(error)d.reject(error);else d.resolve(value)}
function cacheResponseBytes(response){return Buffer.byteLength(String(response?.text||''),'utf8')}
function deleteCacheKey(key){const entry=cache.get(key);if(entry)cacheBytes-=entry.bytes||0;cache.delete(key)}
function trimCache(){while((cache.size>CACHE_MAX||cacheBytes>CACHE_MAX_BYTES)&&cache.size>1)deleteCacheKey(cache.keys().next().value)}
function rememberCache(key,response){deleteCacheKey(key);const bytes=cacheResponseBytes(response);cache.set(key,{at:Date.now(),response,bytes});cacheBytes+=bytes;trimCache()}
function cacheKey(url,options){return `${url}\n${options?.forceHttp3?'h3':'auto'}\n${String(options?.headers?.Accept||options?.headers?.accept||'')}`}
function headClip(text,limit){text=String(text||'');if(Buffer.byteLength(text)>limit)text=Buffer.from(text).subarray(0,limit).toString('utf8');const m=/<\/head\s*>/i.exec(text);if(!m)return text;const close=text.indexOf('>',m.index);return close>=0?text.slice(0,close+1):text}
function cachedFlow(key,ttl,options){
  const hit=cache.get(key);if(!hit||Date.now()-hit.at>ttl){if(hit)deleteCacheKey(key);return null}
  const full={...hit.value,transport:'impit-rust-http3-cache'};
  const headMax=Math.max(1024,Number(options.headMaxBytes)||160*1024),mediaMax=Math.max(4096,Number(options.mediaMaxBytes)||256*1024),prefixMax=Math.max(headMax,Number(options.prefixMaxBytes)||448*1024);
  const headText=headClip(full.text,headMax),mediaText=Buffer.from(full.text).subarray(0,mediaMax).toString('utf8'),prefixText=Buffer.from(full.text).subarray(0,prefixMax).toString('utf8'),firstMediaUrl=firstTrustedMediaUrl(mediaText);
  return {head:Promise.resolve({...full,text:headText,bytesRead:Buffer.byteLength(headText),complete:false}),media:Promise.resolve({...full,text:mediaText,bytesRead:Buffer.byteLength(mediaText),complete:false,mediaMarker:markerMatched(mediaText,options.mediaPattern),firstMediaUrl}),prefix:Promise.resolve({...full,text:prefixText,bytesRead:Buffer.byteLength(prefixText),complete:false}),full:Promise.resolve(full),transport:'impit-rust-http3-cache',cached:true};
}

function requestProgressiveText(rawUrl,options={}){
  if(closing){const err=Promise.reject(new Error('impit transport is shutting down'));err.catch(()=>{});return {head:err,media:err,prefix:err,full:err,transport:'impit-rust-http3-closing'}}
  if(!loadNative()){
    const err=Promise.reject(new Error(loadError||'impit native transport unavailable'));err.catch(()=>{});
    return {head:err,media:err,prefix:err,full:err,transport:'impit-rust-http3-unavailable'};
  }
  const url=String(rawUrl||''),ttl=Math.max(0,Number(options.cacheTtlMs)||120000),key=cacheKey(url,options);
  const stopAfterMedia=!!options.stopAfterMedia,bypass=!!options.bypassCache||!!options.force||stopAfterMedia,shareable=!bypass;
  if(!bypass){const hit=cachedFlow(key,ttl,options);if(hit)return hit;const shared=inflight.get(key);if(shared)return shared;}
  const headMax=Math.max(1024,Number(options.headMaxBytes)||160*1024),mediaMax=Math.max(4096,Number(options.mediaMaxBytes)||256*1024),mediaMin=Math.max(128,Number(options.mediaMinBytes)||384),prefixMax=Math.max(headMax,Number(options.prefixMaxBytes)||448*1024),timeoutMs=Math.max(700,Number(options.timeoutMs)||4400),mediaPattern=options.mediaPattern||null;
  const headD=makeDeferred(),mediaD=makeDeferred(),prefixD=makeDeferred(),fullD=makeDeferred();
  headD.promise.catch(()=>{});mediaD.promise.catch(()=>{});prefixD.promise.catch(()=>{});fullD.promise.catch(()=>{});
  const flow={head:headD.promise,media:mediaD.promise,prefix:prefixD.promise,full:fullD.promise,transport:'impit-rust-http3',cached:false};if(shareable)inflight.set(key,flow);
  let response=null,reader=null,headers={},bytes=0,timer=null,timedOut=false,stopRequested=false,finished=false,completeActive;const buffers=[];let headTail='',mediaTail='';
  const activeDone=new Promise(resolve=>{completeActive=resolve});
  const activeFlow={done:activeDone,cancel:()=>{stopRequested=true;try{response?.abort?.()}catch{}try{void reader?.cancel?.()}catch{}}};activeFlows.add(activeFlow);
  const snapshot=(limit=Infinity,extra={})=>{const all=Buffer.concat(buffers,bytes),slice=Number.isFinite(limit)&&all.length>limit?all.subarray(0,limit):all;return {url:String(response?.url||url),status:Number(response?.status)||0,headers,text:decodeText(slice,headers),bytesRead:slice.length,complete:false,transport:'impit-rust-http3',http3Enabled:true,forceHttp3:!!options.forceHttp3,...extra}};
  const publishChunk=(b)=>{
    if(!headD.done){const probe=headTail+b.toString('latin1');if(/<\/head\s*>/i.test(probe)||bytes>=headMax){let v=snapshot(headMax);v.text=headClip(v.text,headMax);v.bytesRead=Buffer.byteLength(v.text);settle(headD,v)}headTail=probe.slice(-64)}
    if(!mediaD.done){const probe=mediaTail+b.toString('latin1');const marker=bytes>=mediaMin&&markerMatched(probe,mediaPattern),trusted=firstTrustedMediaUrl(probe);if(marker||trusted){const value=snapshot(mediaMax,{mediaMarker:true,firstMediaUrl:trusted||firstTrustedMediaUrl(snapshot(mediaMax).text)});settle(mediaD,value);if(stopAfterMedia&&value.firstMediaUrl){stopRequested=true;try{response?.abort?.()}catch{}}}else if(bytes>=mediaMax){settle(mediaD,snapshot(mediaMax,{mediaMarker:false,truncated:true}))}mediaTail=probe.slice(-8192)}
    if(!prefixD.done&&bytes>=prefixMax)settle(prefixD,snapshot(prefixMax,{truncated:true}));
  };
  const finish=(error=null)=>{
    if(finished)return;
    finished=true;
    if(timer)clearTimeout(timer);
    const probeAbort=stopRequested&&!timedOut;
    const all=response?Buffer.concat(buffers,bytes):Buffer.alloc(0),value=response?{url:String(response.url||url),status:Number(response.status)||0,headers,text:decodeText(all,headers),bytesRead:all.length,complete:!error&&!timedOut&&!probeAbort,abortedAfterMedia:probeAbort,transport:'impit-rust-http3',http3Enabled:true,forceHttp3:!!options.forceHttp3}:null;
    if(error&&!response){settle(headD,null,error);settle(mediaD,null,error);settle(prefixD,null,error);settle(fullD,null,error)}else{
      if(!headD.done){let h=value?{...value,text:headClip(value.text,headMax),complete:false}:snapshot(headMax);h.bytesRead=Buffer.byteLength(h.text);settle(headD,h)}
      if(!mediaD.done){let m=value?{...value,text:Buffer.from(value.text).subarray(0,mediaMax).toString('utf8'),complete:false}:snapshot(mediaMax);m.bytesRead=Buffer.byteLength(m.text);m.mediaMarker=markerMatched(m.text,mediaPattern);m.firstMediaUrl=firstTrustedMediaUrl(m.text);settle(mediaD,m)}
      if(!prefixD.done){let p=value?{...value,text:Buffer.from(value.text).subarray(0,prefixMax).toString('utf8'),complete:false}:snapshot(prefixMax);p.bytesRead=Buffer.byteLength(p.text);settle(prefixD,p)}
      settle(fullD,value,error&&bytes===0&&!probeAbort?error:null);if(value&&!error&&!probeAbort&&!bypass)rememberCache(key,value)
    }
    if(shareable)inflight.delete(key);
    activeFlows.delete(activeFlow);completeActive?.();
  };
  (async()=>{
    timer=setTimeout(()=>{timedOut=true;try{response?.abort?.()}catch{}},timeoutMs);
    try{
      // The native N-API fetch receives the browser-profile defaults directly. Request
      // header normalization/AbortSignal support lives in impit's JS wrapper; avoiding that
      // wrapper here removes another JS hop and lets the native timeout/body-abort path own I/O.
      const activeClient=options.forceHttp3?h3Client:client;
      response=await activeClient.fetch(url,options.forceHttp3?{method:'GET',forceHttp3:true}:{method:'GET'});
      headers=headersObject(response.headers);
      if(!response.body||typeof response.body.getReader!=='function'){
        const b=Buffer.from(await response.bytes());buffers.push(b);bytes+=b.length;publishChunk(b);finish();return;
      }
      reader=response.body.getReader();
      while(!timedOut&&!stopRequested){const part=await reader.read();if(part.done)break;const b=Buffer.from(part.value);if(!b.length)continue;buffers.push(b);bytes+=b.length;publishChunk(b)}
      finish(timedOut?new Error(`impit body timed out after ${timeoutMs}ms`):null);
    }catch(err){if(stopRequested&&!timedOut)finish();else finish(err instanceof Error?err:new Error(String(err)))}
  })();
  return flow;
}
async function requestText(url,options={}){return requestProgressiveText(url,options).full}
async function close(){closing=true;try{for(const flow of inflight.values())flow.full.catch(()=>{})}catch{}const jobs=[...activeFlows];for(const job of jobs){try{job.cancel()}catch{}}if(jobs.length)await Promise.race([Promise.allSettled(jobs.map(job=>job.done)),new Promise(resolve=>setTimeout(resolve,7000))]);inflight.clear();activeFlows.clear();cache.clear();cacheBytes=0;client=null;h3Client=null;native=null;loadTried=false;loadError='';closing=false}
module.exports={status,requestProgressiveText,requestText,close,firstTrustedMediaUrl};
