'use strict';
const http = require('http');
const https = require('https');
const zlib = require('zlib');
const dns = require('dns');
const APP_VERSION = require('../package.json').version;
const {firstTrustedMediaUrl,mediaMarkerMatched:providerMediaMarkerMatched}=require('./provider-fastlane');

// Discovery is I/O bound. Keep enough warm sockets for provider bursts, but let the
// renderer/main-process schedulers decide how much work exists; these are transport
// capacity limits, not content/result caps.
const httpAgent = new http.Agent({ keepAlive:true, maxSockets:128, maxFreeSockets:48, scheduling:'lifo', timeout:30_000, lookup:cachedLookup });
const httpsAgent = new https.Agent({ keepAlive:true, maxSockets:128, maxFreeSockets:48, scheduling:'lifo', timeout:30_000, lookup:cachedLookup });

// Spider/Crawlee-style cache-first + single-flight layer for raw provider documents.
// This is intentionally short-lived and memory-only: it collapses duplicate requests
// such as dozens of catalog rows backed by one PMC collection page without turning
// the live provider into a static snapshot.
const sharedResponseCache = new Map();
const sharedInflight = new Map();
const progressiveInflight = new Map();
const SHARED_CACHE_MAX_BYTES = 64 * 1024 * 1024;
let sharedCacheBytes = 0;
let sharedHits = 0;
let sharedCoalesced = 0;
let sharedNetwork = 0;
const dnsCache = new Map();
const dnsInflight = new Map();
const DNS_CACHE_MS = 60_000;

function cachedLookup(hostname, options, callback) {
  if(typeof options==='function'){callback=options;options={};}
  if(typeof options==='number')options={family:options};
  const opts=options||{},family=Number(opts.family)||0,all=!!opts.all,key=`${hostname}|${family}|${all?'all':'one'}`,now=Date.now();
  const hit=dnsCache.get(key);if(hit&&now-hit.at<DNS_CACHE_MS){queueMicrotask(()=>{if(all)callback(null,hit.rows);else callback(null,hit.rows[0].address,hit.rows[0].family)});return;}
  const waiting=dnsInflight.get(key);if(waiting){waiting.push(callback);return;}dnsInflight.set(key,[callback]);
  dns.lookup(hostname,{family,all:true,verbatim:false},(err,rows)=>{const waiters=dnsInflight.get(key)||[];dnsInflight.delete(key);const list=Array.isArray(rows)?rows:rows?[rows]:[];if(!err&&list.length){dnsCache.set(key,{at:Date.now(),rows:list});while(dnsCache.size>512)dnsCache.delete(dnsCache.keys().next().value)}for(const cb of waiters){if(err||!list.length)cb(err||new Error(`DNS lookup returned no addresses for ${hostname}`));else if(all)cb(null,list);else cb(null,list[0].address,list[0].family)}});
}

function isByteString(value) {
  const s = String(value ?? '');
  for (let i = 0; i < s.length; i++) if (s.charCodeAt(i) > 255) return false;
  return true;
}
function sanitizeRequestHeaders(headers = {}) {
  const out = {};
  for (const [name, raw] of Object.entries(headers || {})) {
    const key = String(name || '').trim();
    if (!key) continue;
    const values = Array.isArray(raw) ? raw : [raw];
    const safe = values.map(v => String(v ?? '')).filter(isByteString);
    if (!safe.length) continue;
    out[key] = Array.isArray(raw) ? safe : safe[0];
  }
  return out;
}
function decodeStream(res) {
  const encoding = String(res.headers['content-encoding'] || '').toLowerCase();
  if (encoding.includes('br') && zlib.createBrotliDecompress) return res.pipe(zlib.createBrotliDecompress());
  if (encoding.includes('gzip')) return res.pipe(zlib.createGunzip());
  if (encoding.includes('deflate')) return res.pipe(zlib.createInflate());
  return res;
}
function defaultHeaders() {
  const chrome = String(process.versions.chrome || '152.0.0.0').split('.').slice(0,4).join('.');
  return {
    'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chrome} Safari/537.36 MinecraftCatalogCompanion/${APP_VERSION}`,
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive'
  };
}
function sharedKey(rawUrl, variant='buffer') {
  try { const u=new URL(String(rawUrl));u.hash='';return `${variant}:${u.toString()}`; } catch { return `${variant}:${String(rawUrl||'')}`; }
}
function estimatedSharedBytes(value) {
  if(!value)return 0;if(Buffer.isBuffer(value.buffer))return value.buffer.length;
  if(typeof value.text==='string')return Buffer.byteLength(value.text,'utf8');
  try{return Buffer.byteLength(JSON.stringify(value),'utf8')}catch{return 0}
}
function rememberShared(key, value) {
  const prior=sharedResponseCache.get(key);if(prior)sharedCacheBytes-=prior.bytes||0;
  sharedResponseCache.delete(key);
  const bytes=estimatedSharedBytes(value);sharedResponseCache.set(key,{value,at:Date.now(),bytes});sharedCacheBytes+=bytes;
  while(sharedCacheBytes>SHARED_CACHE_MAX_BYTES&&sharedResponseCache.size>1){const oldestKey=sharedResponseCache.keys().next().value,old=sharedResponseCache.get(oldestKey);sharedResponseCache.delete(oldestKey);sharedCacheBytes-=old?.bytes||0;}
}
function sharedStats() {
  return { cacheEntries:sharedResponseCache.size, cacheBytes:Math.max(0,sharedCacheBytes), inflight:sharedInflight.size+progressiveInflight.size, progressiveInflight:progressiveInflight.size, dnsEntries:dnsCache.size, hits:sharedHits, coalesced:sharedCoalesced, network:sharedNetwork };
}
function clearSharedCache() { sharedResponseCache.clear(); sharedInflight.clear(); progressiveInflight.clear(); sharedCacheBytes=0;dnsCache.clear();dnsInflight.clear();sharedHits=sharedCoalesced=sharedNetwork=0; }

async function requestBuffer(rawUrl, { headers = {}, timeoutMs = 6500, redirects = 7, headersForUrl = null } = {}) {
  const initial = new URL(String(rawUrl));
  if (!/^https?:$/.test(initial.protocol)) throw new Error(`Unsupported protocol: ${initial.protocol}`);
  const visit = async (url, remaining) => {
    const u = url instanceof URL ? url : new URL(url);
    let dynamicHeaders = {};
    if (typeof headersForUrl === 'function') {
      try { dynamicHeaders = await headersForUrl(u.toString()) || {}; } catch { dynamicHeaders = {}; }
    }
    return new Promise((resolve, reject) => {
      const client = u.protocol === 'https:' ? https : http;
      const options = {
        protocol:u.protocol, hostname:u.hostname, port:u.port || undefined,
        method:'GET', path:`${u.pathname}${u.search}`,
        agent:u.protocol === 'https:' ? httpsAgent : httpAgent,
        headers:sanitizeRequestHeaders({ ...defaultHeaders(), ...headers, ...dynamicHeaders }),
        // Happy-Eyeballs-style family racing is available in current Node and avoids
        // slow broken IPv6 routes. Old runtimes simply ignore these options.
        autoSelectFamily:true,
        autoSelectFamilyAttemptTimeout:180,
        lookup:cachedLookup
      };
      const req = client.request(options, res => {
        const status = Number(res.statusCode || 0);
        if (status >= 300 && status < 400 && res.headers.location && remaining > 0) {
          let next;
          try { next = new URL(String(res.headers.location), u); } catch (err) { res.resume(); reject(err); return; }
          res.resume();
          visit(next, remaining - 1).then(resolve, reject);
          return;
        }
        const chunks = [];
        const stream = decodeStream(res);
        stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
        stream.once('error', reject);
        stream.once('end', () => resolve({
          url:u.toString(), status, headers:res.headers, rawHeaders:res.rawHeaders || [], buffer:Buffer.concat(chunks)
        }));
      });
      req.setTimeout(Math.max(500, Number(timeoutMs) || 6500), () => req.destroy(new Error(`HTTP timeout after ${timeoutMs}ms: ${u}`)));
      req.once('error', reject);
      req.end();
    });
  };
  return visit(initial, Math.max(0, Number(redirects) || 0));
}
async function requestHeadText(rawUrl, { headers = {}, timeoutMs = 2600, redirects = 7, headersForUrl = null, maxBytes = 512 * 1024 } = {}) {
  const initial=new URL(String(rawUrl));
  if(!/^https?:$/.test(initial.protocol))throw new Error(`Unsupported protocol: ${initial.protocol}`);
  const byteLimit=Math.max(64*1024,Number(maxBytes)||512*1024);
  const visit=async(url,remaining)=>{
    const u=url instanceof URL?url:new URL(url);let dynamicHeaders={};
    if(typeof headersForUrl==='function'){try{dynamicHeaders=await headersForUrl(u.toString())||{}}catch{dynamicHeaders={}}}
    return new Promise((resolve,reject)=>{
      const client=u.protocol==='https:'?https:http;
      const req=client.request({protocol:u.protocol,hostname:u.hostname,port:u.port||undefined,method:'GET',path:`${u.pathname}${u.search}`,agent:u.protocol==='https:'?httpsAgent:httpAgent,headers:sanitizeRequestHeaders({...defaultHeaders(),...headers,...dynamicHeaders}),autoSelectFamily:true,autoSelectFamilyAttemptTimeout:180,lookup:cachedLookup},res=>{
        const status=Number(res.statusCode||0);
        if(status>=300&&status<400&&res.headers.location&&remaining>0){let next;try{next=new URL(String(res.headers.location),u)}catch(err){res.resume();reject(err);return}res.resume();visit(next,remaining-1).then(resolve,reject);return}
        const stream=decodeStream(res);const chunks=[];let bytes=0,settled=false,headProbe='';
        const finish=(truncated=false)=>{if(settled)return;settled=true;const buffer=Buffer.concat(chunks);const type=String(res.headers['content-type']||'');let charset=/charset\s*=\s*([^;\s]+)/i.exec(type)?.[1]?.replace(/["']/g,'').toLowerCase()||'utf-8';if(!['utf-8','utf8','us-ascii','ascii','latin1','iso-8859-1'].includes(charset))charset='utf-8';const encoding=/latin1|iso-8859-1/.test(charset)?'latin1':/ascii/.test(charset)?'ascii':'utf8';resolve({url:u.toString(),status,headers:res.headers,rawHeaders:res.rawHeaders||[],text:buffer.toString(encoding),bytesRead:bytes,truncated});try{stream.removeAllListeners('data');stream.removeAllListeners('end');stream.removeAllListeners('error');res.destroy()}catch{}};
        stream.on('data',chunk=>{if(settled)return;const b=Buffer.from(chunk);chunks.push(b);bytes+=b.length;if(headProbe.length<byteLimit+256)headProbe+=b.toString('latin1');if(/<\/head\s*>/i.test(headProbe)||bytes>=byteLimit)finish(bytes>=byteLimit)});
        stream.once('end',()=>finish(false));stream.once('error',err=>{if(!settled){settled=true;reject(err)}});
      });
      req.setTimeout(Math.max(500,Number(timeoutMs)||2600),()=>req.destroy(new Error(`HTTP head-metadata timeout after ${timeoutMs}ms: ${u}`)));req.once('error',reject);req.end();
    });
  };
  return visit(initial,Math.max(0,Number(redirects)||0));
}

function decodeTextBuffer(buffer, headers={}) {
  const type=String(headers['content-type']||'');
  let charset=/charset\s*=\s*([^;\s]+)/i.exec(type)?.[1]?.replace(/["']/g,'').toLowerCase()||'utf-8';
  if(!['utf-8','utf8','us-ascii','ascii','latin1','iso-8859-1'].includes(charset))charset='utf-8';
  const encoding=/latin1|iso-8859-1/.test(charset)?'latin1':/ascii/.test(charset)?'ascii':'utf8';
  return buffer.toString(encoding);
}

// One physical request, four readiness gates. `media` is content-sensitive rather
// than byte-count-sensitive: it resolves as soon as a streamed response exposes a
// trustworthy project-media marker. This avoids waiting for an arbitrary 512-1024 KiB
// prefix when the useful ForgeCDN/Modrinth/GitHub image URL arrived in the first body
// chunk and the server keeps streaming a slow tail.
function mediaMarkerMatched(text, pattern=null){
  if(pattern){
    try{
      if(typeof pattern==='function')return !!pattern(String(text||''));
      if(pattern instanceof RegExp){pattern.lastIndex=0;return pattern.test(String(text||''));}
      return new RegExp(String(pattern),'i').test(String(text||''));
    }catch{}
  }
  return providerMediaMarkerMatched(String(text||''));
}
function requestProgressiveTextShared(rawUrl, options={}) {
  const opts={...(options||{})};
  const ttl=Math.max(0,Number(opts.cacheTtlMs??120_000));
  const bypass=!!opts.bypassCache||!!opts.force;
  const headMax=Math.max(64*1024,Number(opts.headMaxBytes)||512*1024);
  const mediaMax=Math.max(32*1024,Number(opts.mediaMaxBytes)||384*1024);
  const mediaMin=Math.max(128,Number(opts.mediaMinBytes)||4096);
  const prefixMax=Math.max(headMax,Number(opts.prefixMaxBytes)||1024*1024);
  const mediaPattern=opts.mediaPattern||null;
  const stopAfterMedia=!!opts.stopAfterMedia,stopAfterPrefix=!!opts.stopAfterPrefix;
  delete opts.cacheTtlMs;delete opts.bypassCache;delete opts.force;delete opts.headMaxBytes;delete opts.mediaMaxBytes;delete opts.mediaMinBytes;delete opts.mediaPattern;delete opts.prefixMaxBytes;delete opts.stopAfterMedia;delete opts.stopAfterPrefix;
  const cacheable=!opts.headersForUrl&&!stopAfterMedia&&!stopAfterPrefix;
  const textKey=sharedKey(rawUrl,'text'),flowKey=sharedKey(rawUrl,'progressive-text');
  if(cacheable&&!bypass){
    const hit=sharedResponseCache.get(textKey);
    if(hit&&Date.now()-hit.at<=ttl){
      sharedHits++;
      const full={...hit.value,memoryCacheHit:true,memoryCacheAgeMs:Date.now()-hit.at};
      const text=String(full.text||''),end=text.search(/<\/head\s*>/i),headText=end>=0?text.slice(0,end+text.slice(end).indexOf('>')+1):text.slice(0,headMax),mediaText=text.slice(0,mediaMax),prefixText=text.slice(0,prefixMax);
      return {
        head:Promise.resolve({...full,text:headText,bytesRead:Buffer.byteLength(headText,'utf8'),truncated:headText.length<text.length}),
        media:Promise.resolve({...full,text:mediaText,bytesRead:Buffer.byteLength(mediaText,'utf8'),truncated:mediaText.length<text.length,mediaMarker:mediaMarkerMatched(mediaText,mediaPattern),firstMediaUrl:firstTrustedMediaUrl(mediaText)}),
        prefix:Promise.resolve({...full,text:prefixText,bytesRead:Buffer.byteLength(prefixText,'utf8'),truncated:prefixText.length<text.length}),
        full:Promise.resolve(full),cacheHit:true
      };
    }
    const existing=progressiveInflight.get(flowKey);if(existing){sharedCoalesced++;return existing;}
  }
  let resolveHead,rejectHead,resolveMedia,rejectMedia,resolvePrefix,rejectPrefix,resolveFull,rejectFull;
  const head=new Promise((resolve,reject)=>{resolveHead=resolve;rejectHead=reject});
  const media=new Promise((resolve,reject)=>{resolveMedia=resolve;rejectMedia=reject});
  const prefix=new Promise((resolve,reject)=>{resolvePrefix=resolve;rejectPrefix=reject});
  const full=new Promise((resolve,reject)=>{resolveFull=resolve;rejectFull=reject});
  head.catch(()=>{});media.catch(()=>{});prefix.catch(()=>{});full.catch(()=>{});
  const flow={head,media,prefix,full,cacheHit:false};if(cacheable)progressiveInflight.set(flowKey,flow);
  sharedNetwork++;
  (async()=>{
    const initial=new URL(String(rawUrl));if(!/^https?:$/.test(initial.protocol))throw new Error(`Unsupported protocol: ${initial.protocol}`);
    const visit=async(url,remaining)=>{
      const u=url instanceof URL?url:new URL(url);let dynamicHeaders={};
      if(typeof opts.headersForUrl==='function'){try{dynamicHeaders=await opts.headersForUrl(u.toString())||{}}catch{dynamicHeaders={}}}
      return new Promise((resolve,reject)=>{
        const client=u.protocol==='https:'?https:http;
        const req=client.request({protocol:u.protocol,hostname:u.hostname,port:u.port||undefined,method:'GET',path:`${u.pathname}${u.search}`,agent:u.protocol==='https:'?httpsAgent:httpAgent,headers:sanitizeRequestHeaders({...defaultHeaders(),...(opts.headers||{}),...dynamicHeaders}),autoSelectFamily:true,autoSelectFamilyAttemptTimeout:120,lookup:cachedLookup},res=>{
          const status=Number(res.statusCode||0);
          if(status>=300&&status<400&&res.headers.location&&remaining>0){let next;try{next=new URL(String(res.headers.location),u)}catch(err){res.resume();reject(err);return}res.resume();visit(next,remaining-1).then(resolve,reject);return}
          const stream=decodeStream(res),chunks=[];let bytes=0,headDone=false,mediaDone=false,prefixDone=false,headTail='',mediaTail='',settled=false,probeStopped=false;
          const snapshot=(limit)=>{const buffer=Buffer.concat(chunks);return decodeTextBuffer(buffer.length>limit?buffer.subarray(0,limit):buffer,res.headers)};
          const base=(text,limit,truncated=false)=>({url:u.toString(),status,headers:res.headers,rawHeaders:res.rawHeaders||[],text,bytesRead:Math.min(bytes,limit),truncated});
          const emitHead=(truncated=false)=>{if(headDone)return;headDone=true;let text=snapshot(headMax);const match=/<\/head\s*>/i.exec(text);if(match){const close=text.indexOf('>',match.index);if(close>=0)text=text.slice(0,close+1)}resolveHead(base(text,headMax,truncated||!match));};
          const finishResponse=(reason='')=>{if(settled)return;settled=true;probeStopped=!!reason;if(!headDone)emitHead(!!reason);if(!mediaDone)emitMedia(!!reason,false);if(!prefixDone)emitPrefix(!!reason,false);const buffer=Buffer.concat(chunks);resolve({url:u.toString(),status,headers:res.headers,rawHeaders:res.rawHeaders||[],text:decodeTextBuffer(buffer,res.headers),bytesRead:bytes,bufferLength:buffer.length,complete:!reason,abortedAfterMedia:reason==='media',abortedAfterPrefix:reason==='prefix'});if(reason){try{stream.destroy()}catch{}try{res.destroy()}catch{}}};
          const emitMedia=(truncated=false,allowStop=true)=>{if(mediaDone)return;mediaDone=true;const text=snapshot(mediaMax),firstMedia=firstTrustedMediaUrl(text),matched=mediaMarkerMatched(text,mediaPattern);resolveMedia({...base(text,mediaMax,truncated||bytes>=mediaMax),mediaMarker:matched,firstMediaUrl:firstMedia});if(allowStop&&stopAfterMedia&&matched&&firstMedia)queueMicrotask(()=>finishResponse('media'));};
          const emitPrefix=(truncated=false,allowStop=true)=>{if(prefixDone)return;prefixDone=true;const text=snapshot(prefixMax);resolvePrefix(base(text,prefixMax,truncated||bytes>=prefixMax));if(allowStop&&stopAfterPrefix)queueMicrotask(()=>finishResponse('prefix'));};
          stream.on('data',chunk=>{
            if(settled)return;const b=Buffer.from(chunk);chunks.push(b);bytes+=b.length;
            const chunkText=b.toString('latin1');
            if(!headDone){const probe=headTail+chunkText;if(/<\/head\s*>/i.test(probe)||bytes>=headMax)emitHead(bytes>=headMax);headTail=probe.slice(-64)}
            if(!mediaDone){const probe=mediaTail+chunkText;if(bytes>=mediaMin&&mediaMarkerMatched(probe,mediaPattern))emitMedia(false,true);else if(bytes>=mediaMax)emitMedia(true,false);mediaTail=probe.slice(-8192)}
            if(!prefixDone&&bytes>=prefixMax)emitPrefix(true,true);
          });
          stream.once('error',err=>{if(!settled&&!probeStopped){settled=true;reject(err)}});
          stream.once('end',()=>finishResponse(''));
        });
        req.setTimeout(Math.max(500,Number(opts.timeoutMs)||6500),()=>req.destroy(new Error(`HTTP timeout after ${opts.timeoutMs||6500}ms: ${u}`)));req.once('error',reject);req.end();
      });
    };
    return visit(initial,Math.max(0,Number(opts.redirects)||7));
  })().then(value=>{if(cacheable&&ttl>0)rememberShared(textKey,value);if(cacheable&&progressiveInflight.get(flowKey)===flow)progressiveInflight.delete(flowKey);resolveFull(value);},err=>{if(cacheable&&progressiveInflight.get(flowKey)===flow)progressiveInflight.delete(flowKey);rejectHead(err);rejectMedia(err);rejectPrefix(err);rejectFull(err);});
  return flow;
}

async function requestText(url, options = {}) {
  const result = await requestBuffer(url, options);
  const type = String(result.headers['content-type'] || '');
  let charset = /charset\s*=\s*([^;\s]+)/i.exec(type)?.[1]?.replace(/["']/g,'').toLowerCase() || 'utf-8';
  if (!['utf-8','utf8','us-ascii','ascii','latin1','iso-8859-1'].includes(charset)) charset = 'utf-8';
  const encoding = /latin1|iso-8859-1/.test(charset) ? 'latin1' : /ascii/.test(charset) ? 'ascii' : 'utf8';
  return { ...result, text:result.buffer.toString(encoding) };
}
async function requestJson(url, options = {}) {
  const result = await requestText(url, options);
  if (result.status < 200 || result.status >= 300) throw new Error(`HTTP ${result.status} for ${result.url}`);
  return JSON.parse(result.text);
}

async function sharedRequest(kind, url, options, worker) {
  const opts={...(options||{})};
  const ttl=Math.max(0,Number(opts.cacheTtlMs ?? 90_000));
  const bypass=!!opts.bypassCache || !!opts.force;
  delete opts.cacheTtlMs;delete opts.bypassCache;delete opts.force;
  // Dynamic per-URL auth/cookies must never be globally cached because the result can
  // depend on the active account. Shared discovery calls do not use headersForUrl.
  const cacheable=!opts.headersForUrl;
  const key=sharedKey(url,kind);
  if(cacheable&&!bypass){
    const hit=sharedResponseCache.get(key);
    if(hit&&Date.now()-hit.at<=ttl){sharedHits++;return {...hit.value,memoryCacheHit:true,memoryCacheAgeMs:Date.now()-hit.at};}
    const flight=sharedInflight.get(key);
    if(flight){sharedCoalesced++;return flight;}
  }
  const promise=(async()=>{sharedNetwork++;const value=await worker(url,opts);if(cacheable&&ttl>0)rememberShared(key,value);return value;})();
  if(cacheable)sharedInflight.set(key,promise);
  try{return await promise;}finally{if(cacheable&&sharedInflight.get(key)===promise)sharedInflight.delete(key);}
}
function requestBufferShared(url, options={}) { return sharedRequest('buffer',url,options,requestBuffer); }
function requestHeadTextShared(url, options={}) {
  if(!options?.bypassCache&&!options?.force){const flow=progressiveInflight.get(sharedKey(url,'progressive-text'));if(flow){sharedCoalesced++;return flow.head;}}
  return sharedRequest('headtext',url,options,requestHeadText);
}
function requestTextShared(url, options={}) {
  // If a progressive first-paint request already owns this URL, reuse its eventual
  // full body instead of racing a duplicate GET from an interactive/background path.
  if(!options?.bypassCache&&!options?.force){const flow=progressiveInflight.get(sharedKey(url,'progressive-text'));if(flow){sharedCoalesced++;return flow.full;}}
  return sharedRequest('text',url,options,async(u,o)=>{const r=await requestText(u,o);const {buffer,...light}=r;return light;});
}
async function requestJsonShared(url, options={}) {
  const result=await requestTextShared(url,options);
  if(result.status<200||result.status>=300)throw new Error(`HTTP ${result.status} for ${result.url}`);
  return JSON.parse(result.text);
}

module.exports = {
  requestBuffer,requestHeadText,requestText,requestJson,
  requestBufferShared,requestHeadTextShared,requestProgressiveTextShared,requestTextShared,requestJsonShared,
  sharedStats,clearSharedCache,
  isByteString,sanitizeRequestHeaders
};
