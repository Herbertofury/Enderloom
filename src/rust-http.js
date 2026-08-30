'use strict';

// Native Rust/BoringSSL transport powered by the official wreq-js 3.2.0 N-API
// binding. The binary is vendored so this lane is genuinely present in release
// builds rather than being a hypothetical optional dependency.
const path=require('path');
const crypto=require('crypto');
const {firstTrustedMediaUrl,mediaMarkerMatched:providerMediaMarkerMatched}=require('./provider-fastlane');

let native=null;
let loadTried=false;
let loadError='';
let transportId='';
let sessionId='';
let profile='';
let nextRequestId=1;
const inflight=new Map();
const activeRequests=new Map();
const cache=new Map();
let closing=false;
const CACHE_MAX=192;
const CACHE_MAX_BYTES=64*1024*1024;
let cacheBytes=0;
const DEFAULT_MEDIA_MARKER_RE=/(?:https?:)?\/\/(?:media\.forgecdn\.net|edge\.forgecdn\.net|cdn\.modrinth\.com|raw\.githubusercontent\.com|user-images\.githubusercontent\.com|opengraph\.githubassets\.com|static\.planetminecraft\.com)\/[^\s"'<>]+(?:["'])|<(?:meta|img|source)\b[^>]*(?:og:image|twitter:image|src|srcset)\s*=\s*["'][^"']+(?:forgecdn|modrinth|githubusercontent|githubassets|planetminecraft)[^"']*["']/i;

function detectLibc(){
  if(process.platform!=='linux')return '';
  try{return process.report?.getReport?.()?.header?.glibcVersionRuntime?'gnu':'musl'}catch{return 'gnu'}
}
function bindingName(){
  if(process.platform==='win32'&&process.arch==='x64')return 'wreq-js.win32-x64-msvc.node';
  if(process.platform==='linux'&&process.arch==='x64'&&detectLibc()==='gnu')return 'wreq-js.linux-x64-gnu.node';
  return '';
}
function loadNative(){
  if(loadTried)return native;
  loadTried=true;
  const name=bindingName();
  if(!name){loadError=`No vendored wreq-js binding for ${process.platform}-${process.arch}${detectLibc()?`-${detectLibc()}`:''}`;return null}
  try{native=require(path.join(__dirname,'..','vendor','wreq',name));}
  catch(err){loadError=String(err?.message||err);native=null}
  if(native){
    try{
      const profiles=Array.from(native.getProfiles?.()||[]);
      profile=profiles.filter(x=>/^chrome_\d+$/.test(String(x))).sort((a,b)=>Number(String(b).split('_')[1])-Number(String(a).split('_')[1]))[0]||'chrome_149';
      // This lane is network-wait bound. A wide pooled H2-capable transport lets dozens
      // of catalog cards share already-warm origins without serial connection setup.
      transportId=native.createTransport({browser:profile,os:'windows',trustStore:'combined',poolIdleTimeout:120000,poolMaxIdlePerHost:48,poolMaxSize:192,connectTimeout:2200,readTimeout:9000,captureDiagnostics:true});
      sessionId=`mcc-${crypto.randomUUID()}`;
      native.createSession({sessionId});
    }catch(err){loadError=String(err?.message||err);try{if(transportId)native.dropTransport(transportId)}catch{}native=null;transportId='';sessionId=''}
  }
  return native;
}
function status(){
  const n=loadNative();
  return {available:!!n,error:n?'':loadError,engine:n?'wreq-js 3.2.0 native Rust wreq + BoringSSL (vendored)':'unavailable',profile:n?profile:'',binding:n?bindingName():'',pooled:!!n,poolMaxSize:n?192:0,poolMaxIdlePerHost:n?48:0};
}
function headersObject(headers){
  const out={};
  try{for(const pair of headers||[]){if(!Array.isArray(pair)||pair.length<2)continue;const k=String(pair[0]).toLowerCase(),v=String(pair[1]);out[k]=out[k]?`${out[k]}, ${v}`:v}}catch{}
  return out;
}
function responseFrom(nativeResponse,text,bytesRead,complete=true,extra={}){
  return {url:String(nativeResponse?.url||''),status:Number(nativeResponse?.status)||0,headers:headersObject(nativeResponse?.headers),text:String(text||''),bytesRead:Number(bytesRead)||0,complete,transport:'wreq-js-rust-native',diagnostics:nativeResponse?.diagnostics||null,...extra};
}
function cacheKey(rawUrl,options){return `${String(rawUrl)}\n${String(options?.headers?.Accept||options?.headers?.accept||'')}`}
function cacheResponseBytes(response){return Buffer.byteLength(String(response?.text||''),'utf8')}
function deleteCacheKey(key){const entry=cache.get(key);if(entry)cacheBytes-=entry.bytes||0;cache.delete(key)}
function trimCache(){while((cache.size>CACHE_MAX||cacheBytes>CACHE_MAX_BYTES)&&cache.size>1)deleteCacheKey(cache.keys().next().value)}
function rememberCache(key,response){deleteCacheKey(key);const bytes=cacheResponseBytes(response);cache.set(key,{at:Date.now(),response,bytes});cacheBytes+=bytes;trimCache()}
function clipText(text,limit){const b=Buffer.from(String(text||''));return (b.length>limit?b.subarray(0,limit):b).toString('utf8')}
function headClip(text,limit){const clipped=clipText(text,limit);const m=/<\/head\s*>/i.exec(clipped);if(!m)return clipped;const close=clipped.indexOf('>',m.index);return close>=0?clipped.slice(0,close+1):clipped}
function mediaMarkerMatched(text,pattern=null){
  if(pattern){try{if(typeof pattern==='function')return !!pattern(String(text||''));if(pattern instanceof RegExp){pattern.lastIndex=0;return pattern.test(String(text||''))}return new RegExp(String(pattern),'i').test(String(text||''))}catch{}}
  return providerMediaMarkerMatched(String(text||''));
}
function cachedFlow(key,ttl,options={}){
  const hit=cache.get(key);if(!hit||Date.now()-hit.at>ttl){if(hit)deleteCacheKey(key);return null}
  const response={...hit.response,transport:'wreq-js-rust-native-cache'};
  const headLimit=Math.max(1024,Number(options.headMaxBytes)||192*1024),mediaLimit=Math.max(4096,Number(options.mediaMaxBytes)||256*1024),prefixLimit=Math.max(headLimit,Number(options.prefixMaxBytes)||512*1024);
  const headText=headClip(response.text,headLimit),mediaText=clipText(response.text,mediaLimit),prefixText=clipText(response.text,prefixLimit);
  return {
    head:Promise.resolve({...response,text:headText,bytesRead:Buffer.byteLength(headText),complete:false}),
    media:Promise.resolve({...response,text:mediaText,bytesRead:Buffer.byteLength(mediaText),complete:false,mediaMarker:mediaMarkerMatched(mediaText,options.mediaPattern),firstMediaUrl:firstTrustedMediaUrl(mediaText)}),
    prefix:Promise.resolve({...response,text:prefixText,bytesRead:Buffer.byteLength(prefixText),complete:false}),
    full:Promise.resolve(response),transport:'wreq-js-rust-native-cache',cached:true
  };
}
function makeDeferred(){let resolve,reject;const promise=new Promise((r,j)=>{resolve=r;reject=j});return {promise,resolve,reject,done:false}}
function settleDeferred(d,value,error){if(d.done)return;d.done=true;if(error)d.reject(error);else d.resolve(value)}

function requestProgressiveText(rawUrl,options={}){
  if(closing){const err=Promise.reject(new Error('wreq-js transport is shutting down'));err.catch(()=>{});return {head:err,media:err,prefix:err,full:err,transport:'wreq-js-rust-native-closing'}}
  const n=loadNative();
  if(!n){const err=Promise.reject(new Error(loadError||'wreq-js native transport unavailable'));err.catch(()=>{});return {head:err,media:err,prefix:err,full:err,transport:'wreq-js-rust-native-unavailable'}}
  const url=String(rawUrl||'');
  const ttl=Math.max(0,Number(options.cacheTtlMs)||120000);
  const stopAfterMedia=!!options.stopAfterMedia,bypass=!!options.bypassCache||!!options.force||stopAfterMedia,shareable=!bypass;
  const key=cacheKey(url,options);
  if(!bypass){const hit=cachedFlow(key,ttl,options);if(hit)return hit;const shared=inflight.get(key);if(shared)return shared;}

  const headLimit=Math.max(1024,Number(options.headMaxBytes)||192*1024);
  const mediaLimit=Math.max(4096,Number(options.mediaMaxBytes)||256*1024);
  const mediaMin=Math.max(128,Number(options.mediaMinBytes)||512);
  const prefixLimit=Math.max(headLimit,Number(options.prefixMaxBytes)||512*1024);
  const mediaPattern=options.mediaPattern||null;
  const timeoutMs=Math.max(700,Number(options.timeoutMs)||4600);
  const headD=makeDeferred(),mediaD=makeDeferred(),prefixD=makeDeferred(),fullD=makeDeferred();
  const flow={head:headD.promise,media:mediaD.promise,prefix:prefixD.promise,full:fullD.promise,transport:'wreq-js-rust-native',cached:false};
  // Avoid unhandled-rejection noise for callers that only consume one phase.
  headD.promise.catch(()=>{});mediaD.promise.catch(()=>{});prefixD.promise.catch(()=>{});fullD.promise.catch(()=>{});
  if(shareable)inflight.set(key,flow);

  const requestId=nextRequestId++;
  if(nextRequestId>0x7fffffff)nextRequestId=1;
  let bodyHandle=null,timer=null,timedOut=false,stopRequested=false,finished=false,completeActive;
  const activeDone=new Promise(resolve=>{completeActive=resolve});
  activeRequests.set(requestId,{done:activeDone,cancel:()=>{stopRequested=true;try{n.cancelRequest(requestId)}catch{}try{if(bodyHandle!==null&&bodyHandle!==undefined)n.cancelBody(bodyHandle)}catch{}}});
  const started=Date.now();
  const buffers=[];
  let bytes=0;
  let nativeResponse=null;
  // Rolling scanners avoid re-concatenating/re-scanning the entire response on every
  // native body chunk. Snapshots are allocated only when a readiness gate actually fires.
  let headTail='',mediaTail='';

  const snapshot=(complete=false,limit=Infinity,extra={})=>{
    const all=Buffer.concat(buffers,bytes),slice=Number.isFinite(limit)&&all.length>limit?all.subarray(0,limit):all;
    return responseFrom(nativeResponse,slice.toString('utf8'),slice.length,complete,extra);
  };
  const publishThresholds=(chunk)=>{
    const text=Buffer.from(chunk||'').toString('latin1');
    if(!headD.done){
      const probe=headTail+text;
      if(/<\/head\s*>/i.test(probe)||bytes>=headLimit){
        let value=snapshot(false,headLimit);value.text=headClip(value.text,headLimit);value.bytesRead=Buffer.byteLength(value.text);settleDeferred(headD,value);
      }
      headTail=probe.slice(-64);
    }
    if(!mediaD.done){
      const probe=mediaTail+text;
      if(bytes>=mediaMin&&mediaMarkerMatched(probe,mediaPattern)){const value=snapshot(false,mediaLimit,{mediaMarker:true});value.firstMediaUrl=firstTrustedMediaUrl(value.text);settleDeferred(mediaD,value);if(stopAfterMedia&&value.firstMediaUrl){stopRequested=true;try{n.cancelRequest(requestId)}catch{}try{if(bodyHandle!==null&&bodyHandle!==undefined)n.cancelBody(bodyHandle)}catch{}}}
      else if(bytes>=mediaLimit)settleDeferred(mediaD,snapshot(false,mediaLimit,{mediaMarker:false,truncated:true}));
      mediaTail=probe.slice(-8192);
    }
    if(!prefixD.done&&bytes>=prefixLimit)settleDeferred(prefixD,snapshot(false,prefixLimit,{truncated:true}));
  };
  const finish=(error=null)=>{
    if(finished)return;
    finished=true;
    if(timer)clearTimeout(timer);
    const probeAbort=stopRequested&&!timedOut;
    const value=nativeResponse?snapshot(!error&&!timedOut&&!probeAbort,Infinity,{abortedAfterMedia:probeAbort}):null;
    if(error&&!nativeResponse){settleDeferred(headD,null,error);settleDeferred(mediaD,null,error);settleDeferred(prefixD,null,error);settleDeferred(fullD,null,error)}
    else{
      if(!headD.done){let h=value||responseFrom(nativeResponse,'',0,!error);h={...h,text:headClip(h.text,headLimit),complete:false};h.bytesRead=Buffer.byteLength(h.text);settleDeferred(headD,h)}
      if(!mediaD.done){const m=value?{...value,text:clipText(value.text,mediaLimit),complete:false}:responseFrom(nativeResponse,'',0,!error);m.bytesRead=Buffer.byteLength(m.text);m.mediaMarker=mediaMarkerMatched(m.text,mediaPattern);m.firstMediaUrl=firstTrustedMediaUrl(m.text);settleDeferred(mediaD,m)}
      if(!prefixD.done){const p=value?{...value,text:clipText(value.text,prefixLimit),complete:false}:responseFrom(nativeResponse,'',0,!error);p.bytesRead=Buffer.byteLength(p.text);settleDeferred(prefixD,p)}
      settleDeferred(fullD,value,error&&bytes===0?error:null);
      if(value&&!error&&!probeAbort&&!bypass)rememberCache(key,value)
    }
    if(shareable)inflight.delete(key);
    activeRequests.delete(requestId);
    completeActive?.();
  };

  (async()=>{
    try{
      timer=setTimeout(()=>{
        timedOut=true;
        try{n.cancelRequest(requestId)}catch{}
        try{if(bodyHandle!==null)n.cancelBody(bodyHandle)}catch{}
      },timeoutMs);
      nativeResponse=await n.request({
        url,method:'GET',headers:Object.entries(options.headers||{Accept:'text/html,application/xhtml+xml;q=0.9,*/*;q=0.2'}).map(([k,v])=>[String(k),String(v)]),
        sessionId,ephemeral:false,redirect:'follow',disableDefaultHeaders:false,insecure:false,trustStore:'combined',transportId,compress:true,captureDiagnostics:true
      },requestId,true);
      if(nativeResponse?.bodyBytes){
        const b=Buffer.from(nativeResponse.bodyBytes);buffers.push(b);bytes+=b.length;publishThresholds(b);finish();return;
      }
      bodyHandle=nativeResponse?.bodyHandle;
      if(bodyHandle===null||bodyHandle===undefined){finish();return}
      while(!timedOut&&!stopRequested){
        const chunk=await n.readBodyChunk(bodyHandle);
        if(chunk===null)break;
        const b=Buffer.from(chunk);if(b.length){buffers.push(b);bytes+=b.length;publishThresholds(b)}
      }
      finish(timedOut?new Error(`wreq-js body timed out after ${Date.now()-started}ms`):null);
    }catch(err){if(stopRequested&&!timedOut)finish();else finish(err instanceof Error?err:new Error(String(err)))}
  })();
  return flow;
}

async function requestText(rawUrl,options={}){return requestProgressiveText(rawUrl,options).full}

async function close(){
  closing=true;
  const n=native;if(!n){closing=false;return}
  const jobs=[...activeRequests.values()];
  for(const job of jobs){try{job.cancel()}catch{}}
  if(jobs.length){
    await Promise.race([
      Promise.allSettled(jobs.map(job=>job.done)),
      new Promise(resolve=>setTimeout(resolve,5000)),
    ]);
  }
  try{if(transportId)n.dropTransport(transportId)}catch{}
  try{if(sessionId)n.dropSession(sessionId)}catch{}
  transportId='';sessionId='';native=null;loadTried=false;inflight.clear();activeRequests.clear();cache.clear();cacheBytes=0;closing=false;
}

module.exports={status,requestText,requestProgressiveText,close};
