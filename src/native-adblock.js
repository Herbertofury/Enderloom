'use strict';
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const {requestText}=require('./public-http');

const TYPE_MAP={
  mainFrame:'document',subFrame:'subdocument',stylesheet:'stylesheet',script:'script',image:'image',font:'font',object:'object',xhr:'xmlhttprequest',ping:'ping',cspReport:'csp_report',media:'media',webSocket:'websocket',other:'other'
};
const TYPE_OPTIONS=new Set(['document','subdocument','stylesheet','script','image','font','object','xmlhttprequest','ping','media','websocket','other']);
const UNSUPPORTED_MODIFIERS=['redirect','redirect-rule','removeparam','csp','permissions','replace','urlskip','uritransform','ipaddress','header','method'];
const DEFAULT_SOURCES=[
  ['ublock-filters','https://ublockorigin.github.io/uAssets/filters/filters.txt','assets/ublock/filters.min.txt'],
  ['ublock-privacy','https://ublockorigin.github.io/uAssets/filters/privacy.txt','assets/ublock/privacy.min.txt'],
  ['ublock-unbreak','https://ublockorigin.github.io/uAssets/filters/unbreak.txt','assets/ublock/unbreak.min.txt'],
  ['ublock-quick-fixes','https://ublockorigin.github.io/uAssets/filters/quick-fixes.txt','assets/ublock/quick-fixes.min.txt'],
  ['easylist','https://ublockorigin.github.io/uAssets/thirdparties/easylist.txt','assets/thirdparties/easylist/easylist.txt'],
  ['easyprivacy','https://ublockorigin.github.io/uAssets/thirdparties/easyprivacy.txt','assets/thirdparties/easylist/easyprivacy.txt']
].map(([id,url,fallback])=>({id,url,fallback}));
const UPDATE_AFTER_MS=6*60*60*1000;

function ensureDir(dir){fs.mkdirSync(dir,{recursive:true})}
function readJson(file){try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch{return null}}
function writeJson(file,data){try{ensureDir(path.dirname(file));fs.writeFileSync(file,JSON.stringify(data,null,2))}catch{}}
function normalizeHost(host=''){return String(host||'').toLowerCase().replace(/^\.+|\.+$/g,'')}
function hostMatches(host,domain){host=normalizeHost(host);domain=normalizeHost(domain);return !!domain&&(host===domain||host.endsWith('.'+domain))}
function approxSite(host=''){
  host=normalizeHost(host);if(!host)return'';if(/^\d+(?:\.\d+){3}$/.test(host)||host.includes(':'))return host;
  const parts=host.split('.');if(parts.length<=2)return host;
  const cc2=new Set(['co.uk','org.uk','ac.uk','gov.uk','com.au','net.au','org.au','co.nz','com.br','com.mx','co.jp','co.kr','com.cn','com.tw','co.in','com.sg','com.tr','com.ar','com.pl','com.ua']);
  const tail2=parts.slice(-2).join('.');return cc2.has(tail2)&&parts.length>=3?parts.slice(-3).join('.'):tail2;
}
function isThirdParty(requestHost,initiatorHost){const a=approxSite(requestHost),b=approxSite(initiatorHost);return !!a&&!!b&&a!==b}
function initiatorHost(details={}){
  const candidates=[details.referrer,details.initiator,details.origin];
  for(const raw of candidates){try{if(raw)return normalizeHost(new URL(raw).hostname)}catch{}}
  try{const u=details.webContents?.getURL?.();if(u)return normalizeHost(new URL(u).hostname)}catch{}
  return'';
}
function splitRuleOptions(raw){
  let pattern=raw,options='';let idx=-1,escaped=false;
  for(let i=raw.length-1;i>=0;i--){const c=raw[i];if(c==='$'&&!escaped){idx=i;break}escaped=c==='\\'&&!escaped}
  if(idx>0){pattern=raw.slice(0,idx);options=raw.slice(idx+1)}return{pattern,options};
}
function parseOptions(raw=''){
  const out={includeTypes:new Set(),excludeTypes:new Set(),thirdParty:null,includeDomains:[],excludeDomains:[],matchCase:false,popup:false,important:false,unsupported:false};
  for(const token0 of String(raw||'').split(',').map(x=>x.trim()).filter(Boolean)){
    const neg=token0.startsWith('~'),token=neg?token0.slice(1):token0;const low=token.toLowerCase();
    if(TYPE_OPTIONS.has(low)){(neg?out.excludeTypes:out.includeTypes).add(low);continue}
    if(low==='frame'){(neg?out.excludeTypes:out.includeTypes).add('subdocument');continue}
    if(low==='xhr'){(neg?out.excludeTypes:out.includeTypes).add('xmlhttprequest');continue}
    if(low==='third-party'||low==='3p'){out.thirdParty=!neg;continue}
    if(low==='first-party'||low==='1p'){out.thirdParty=neg;continue}
    if(low==='match-case'){out.matchCase=!neg;continue}
    if(low==='important'){out.important=true;continue}
    if(low==='popup'||low==='popunder'){out.popup=true;continue}
    if(low.startsWith('domain=')){
      const values=token.slice(token.indexOf('=')+1).split('|').filter(Boolean);for(const v0 of values){const ex=v0.startsWith('~'),v=normalizeHost(ex?v0.slice(1):v0);if(v)(ex?out.excludeDomains:out.includeDomains).push(v)}continue;
    }
    if(UNSUPPORTED_MODIFIERS.some(x=>low===x||low.startsWith(x+'='))){out.unsupported=true;continue}
    if(['badfilter','elemhide','generichide','specifichide','genericblock','document','all'].includes(low))continue;
  }
  return out;
}
function escapeRegex(s){return s.replace(/[.*+?${}()|[\]\\]/g,'\\$&')}
function abpPatternToRegex(pattern,matchCase=false){
  let p=String(pattern||'');let start=false,end=false,domainAnchor=false;
  if(p.startsWith('||')){domainAnchor=true;p=p.slice(2)}else if(p.startsWith('|')){start=true;p=p.slice(1)}
  if(p.endsWith('|')){end=true;p=p.slice(0,-1)}
  let out='';for(let i=0;i<p.length;i++){
    const c=p[i];if(c==='*')out+='.*';else if(c==='^')out+='(?:[^A-Za-z0-9_.%-]|$)';else out+=escapeRegex(c);
  }
  if(domainAnchor)out='^[a-z][a-z0-9+.-]*:\\/\\/(?:[^\\/?#]*\\.)?'+out;
  else if(start)out='^'+out;
  if(end)out+='$';
  try{return new RegExp(out,matchCase?'':'i')}catch{return null}
}
function longestToken(pattern=''){
  const cleaned=String(pattern).replace(/^\|\|?/,'').replace(/\|$/,'');const chunks=cleaned.split(/[\*\^|]/).map(s=>s.replace(/\\./g,'')).filter(Boolean);chunks.sort((a,b)=>b.length-a.length);const token=(chunks[0]||'').toLowerCase();return token.length>=3?token:'';
}
function extractDomainAnchor(pattern=''){
  if(!pattern.startsWith('||'))return'';const rest=pattern.slice(2);const m=/^([a-z0-9.-]+)(?:\^|\/|\*|\?|$)/i.exec(rest);return normalizeHost(m?.[1]||'')
}
function parseRule(line,id){
  let raw=String(line||'').trim();if(!raw||raw.startsWith('!')||raw.startsWith('['))return null;
  if(/##|#@#|#\?#|#\$#|#%#/.test(raw))return null;
  let exception=false;if(raw.startsWith('@@')){exception=true;raw=raw.slice(2)}
  if(/^\/.*\/$/.test(raw))return null;
  if(/^127\.0\.0\.1\s+|^0\.0\.0\.0\s+/.test(raw)){const h=normalizeHost(raw.split(/\s+/)[1]);if(!h)return null;raw='||'+h+'^'}
  const {pattern,options}=splitRuleOptions(raw);const opts=parseOptions(options);if(!pattern||opts.unsupported)return null;
  const domainAnchor=extractDomainAnchor(pattern);const simpleDomain=!!domainAnchor&&pattern.toLowerCase()===`||${domainAnchor}^`;
  const regex=simpleDomain?null:abpPatternToRegex(pattern,opts.matchCase);if(!simpleDomain&&!regex)return null;
  const token=longestToken(pattern);
  return{id,raw:line,exception,pattern,regex,domainAnchor,simpleDomain,token,opts};
}
function ruleApplies(rule,ctx){
  const o=rule.opts,type=ctx.type;
  if(o.popup)return false;
  if(o.includeTypes.size&&!o.includeTypes.has(type))return false;
  if(o.excludeTypes.has(type))return false;
  if(o.thirdParty!==null&&o.thirdParty!==ctx.thirdParty)return false;
  if(o.includeDomains.length&&!o.includeDomains.some(d=>hostMatches(ctx.initiator,d)))return false;
  if(o.excludeDomains.some(d=>hostMatches(ctx.initiator,d)))return false;
  return rule.simpleDomain?hostMatches(ctx.host,rule.domainAnchor):rule.regex.test(ctx.url);
}
class AhoIndex{
  constructor(){this.next=[new Map()];this.fail=[0];this.out=[[]];this.built=false}
  add(token,id){let s=0;for(const ch of token){let n=this.next[s].get(ch);if(n==null){n=this.next.length;this.next[s].set(ch,n);this.next.push(new Map());this.fail.push(0);this.out.push([])}s=n}this.out[s].push(id)}
  build(){const q=[];for(const n of this.next[0].values()){q.push(n);this.fail[n]=0}for(let qi=0;qi<q.length;qi++){const r=q[qi];for(const [ch,s] of this.next[r]){q.push(s);let f=this.fail[r];while(f&&this.next[f].has(ch)===false)f=this.fail[f];if(this.next[f].has(ch))f=this.next[f].get(ch);this.fail[s]=f;if(this.out[f].length)this.out[s]=this.out[s].concat(this.out[f])}}this.built=true}
  scan(text){if(!this.built)this.build();const found=new Set();let s=0;for(const ch of text){while(s&&this.next[s].has(ch)===false)s=this.fail[s];if(this.next[s].has(ch))s=this.next[s].get(ch);for(const id of this.out[s])found.add(id)}return found}
}
class NativeFilterEngine{
  constructor(){this.rules=[];this.domainRules=new Map();this.genericIndex=new AhoIndex();this.stats={parsed:0,domain:0,generic:0,exceptions:0,skipped:0}}
  addRule(line){const rule=parseRule(line,this.rules.length);if(!rule){this.stats.skipped++;return}const id=this.rules.length;rule.id=id;this.rules.push(rule);this.stats.parsed++;if(rule.exception)this.stats.exceptions++;
    if(rule.domainAnchor){if(!this.domainRules.has(rule.domainAnchor))this.domainRules.set(rule.domainAnchor,[]);this.domainRules.get(rule.domainAnchor).push(id);this.stats.domain++}
    else if(rule.token){this.genericIndex.add(rule.token,id);this.stats.generic++}
  }
  finalize(){this.genericIndex.build();return this}
  decision(url,details={}){
    let u;try{u=new URL(String(url))}catch{return{block:false,reason:'invalid-url'}};if(!/^https?:$/.test(u.protocol))return{block:false,reason:'protocol'};
    const host=normalizeHost(u.hostname),initiator=initiatorHost(details),type=TYPE_MAP[details.resourceType]||String(details.resourceType||'other').toLowerCase();
    const ctx={url:u.toString(),host,initiator,type,thirdParty:isThirdParty(host,initiator)};const candidates=new Set();
    const parts=host.split('.');for(let i=0;i<parts.length-1;i++){const key=parts.slice(i).join('.');for(const id of this.domainRules.get(key)||[])candidates.add(id)}
    for(const id of this.genericIndex.scan(ctx.url.toLowerCase()))candidates.add(id);
    let block=null;for(const id of candidates){const r=this.rules[id];if(r.exception&&ruleApplies(r,ctx))return{block:false,reason:'exception',rule:r.raw}}
    for(const id of candidates){const r=this.rules[id];if(!r.exception&&ruleApplies(r,ctx)){if(!block||r.opts.important)block=r;if(r.opts.important)break}}
    return block?{block:true,reason:'filter',rule:block.raw}:{block:false,reason:'no-match'};
  }
}
function sourceCachePath(cacheDir,id){return path.join(cacheDir,id+'.txt')}
function bundledSourcePath(extensionDir,src){return path.join(extensionDir,...src.fallback.split('/'))}
function validList(text){return typeof text==='string'&&text.length>1000&&(/\|\||##|EasyList|uBlock/i.test(text))}
function listFingerprint(items){const h=crypto.createHash('sha256');for(const [id,text] of items){h.update(id);h.update('\0');h.update(text);h.update('\0')}return h.digest('hex')}
async function concurrentMap(items,limit,fn){const out=new Array(items.length);let next=0;const workers=Array.from({length:Math.min(limit,items.length)},async()=>{while(true){const i=next++;if(i>=items.length)return;try{out[i]=await fn(items[i],i)}catch(err){out[i]={error:err,item:items[i]}}}});await Promise.all(workers);return out}

function createNativeAdblock({liveSession,extensionDir,userDataDir,testMode=false,onChange=()=>{}}){
  const cacheDir=path.join(userDataDir,'AdblockLists');const metaPath=path.join(cacheDir,'metadata.json');let meta=readJson(metaPath)||{};let engine=null;let enabled=false;let blocked=0;let lastBlocked='';let lastRule='';let fingerprint='';let sourceStates=[];let refreshPromise=null;
  const emit=()=>{try{onChange(status())}catch{}};
  function loadTexts(){ensureDir(cacheDir);const items=[];sourceStates=[];for(const src of DEFAULT_SOURCES){let text='';let origin='bundled';const cached=sourceCachePath(cacheDir,src.id);try{if(fs.existsSync(cached)){const t=fs.readFileSync(cached,'utf8');if(validList(t)){text=t;origin='cached'}}}catch{}if(!text){try{text=fs.readFileSync(bundledSourcePath(extensionDir,src),'utf8')}catch{text=''}}if(validList(text)){items.push([src.id,text]);sourceStates.push({id:src.id,origin,bytes:Buffer.byteLength(text)})}}return items}
  function rebuild(){const items=loadTexts();const next=new NativeFilterEngine();if(testMode)next.addRule('||mcc-adblock-test.invalid^');for(const [,text] of items){for(const line of text.split(/\r?\n/))next.addRule(line)}next.finalize();engine=next;fingerprint=listFingerprint(items);emit();return next}
  function listener(details,callback){let result={block:false};try{result=engine?engine.decision(details.url,details):result}catch{}if(result.block){blocked++;lastBlocked=details.url;lastRule=result.rule||'';if(blocked<10||blocked%25===0)emit();callback({cancel:true});return}callback({})}
  function enable(){if(enabled)return;rebuild();liveSession.webRequest.onBeforeRequest({urls:['*://*/*']},listener);enabled=true;emit()}
  function disable(){if(!enabled)return;try{liveSession.webRequest.onBeforeRequest(null)}catch{}enabled=false;emit()}
  function status(){return{nativeReady:!!engine,nativeEnabled:enabled,verified:!!engine&&enabled,ruleCount:engine?.stats?.parsed||0,domainRuleCount:engine?.stats?.domain||0,genericRuleCount:engine?.stats?.generic||0,blocked,lastBlocked,lastRule,listFingerprint:fingerprint,lists:sourceStates,listsUpdatedAt:meta.updatedAt||'',lastRefreshAt:meta.lastCheckedAt||''}}
  function testDecision(url,details={}){return engine?engine.decision(url,details):{block:false,reason:'not-ready'}}
  async function refresh({manual=false}={}){
    if(testMode)return status();if(refreshPromise)return refreshPromise;
    refreshPromise=(async()=>{ensureDir(cacheDir);const now=Date.now();if(!manual&&meta.lastCheckedAt&&now-Date.parse(meta.lastCheckedAt)<UPDATE_AFTER_MS)return status();const results=await concurrentMap(DEFAULT_SOURCES,3,async src=>{
      const prev=meta[src.id]||{};const headers={};if(prev.etag)headers['If-None-Match']=prev.etag;if(prev.lastModified)headers['If-Modified-Since']=prev.lastModified;
      const r=await requestText(src.url,{timeoutMs:9000,redirects:5,headers});if(r.status===304)return{id:src.id,unchanged:true};if(r.status<200||r.status>=300||!validList(r.text))throw new Error(`${src.id} HTTP ${r.status}`);
      fs.writeFileSync(sourceCachePath(cacheDir,src.id),r.text);return{id:src.id,updated:true,etag:String(r.headers.etag||''),lastModified:String(r.headers['last-modified']||''),bytes:Buffer.byteLength(r.text)};
    });
      let changed=false;for(const result of results){if(!result)continue;if(result.error){const key=result.item?.id||'error';meta[key]={...(meta[key]||{}),error:String(result.error?.message||result.error),checkedAt:new Date().toISOString()};continue}if(result.updated){changed=true;meta[result.id]={etag:result.etag,lastModified:result.lastModified,bytes:result.bytes,updatedAt:new Date().toISOString()}}}
      meta.lastCheckedAt=new Date().toISOString();if(changed)meta.updatedAt=meta.lastCheckedAt;writeJson(metaPath,meta);if(changed)rebuild();else emit();return status();
    })().finally(()=>{refreshPromise=null});return refreshPromise;
  }
  return{enable,disable,rebuild,refresh,status,testDecision,dispose:disable};
}
module.exports={createNativeAdblock,NativeFilterEngine,parseRule,abpPatternToRegex,DEFAULT_SOURCES};
