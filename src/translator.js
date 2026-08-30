'use strict';
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');

const BASE_RECIPES={
  upstreamVersion:'10.2.1.0',
  bing:{url:'https://edge.microsoft.com/translate/translatetext?isEnterpriseClient=false'},
  google:{url:'https://translate-pa.googleapis.com/v1/translateHtml',authUrl:'https://translate.googleapis.com/_/translate_http/_/js/k=translate_http.tr.en_US.YusFYy3P_ro.O/am=AAg/d=1/exm=el_conf/ed=1/rs=AN8SPfq1Hb8iJRleQqQc8zhdzXmF9E56eQ/m=el_main'},
  yandex:{url:'https://translate.yandex.net/api/v1/tr.json/translate?',sidUrl:'https://translated.turbopages.org/proxy_u/en-es.en/https/example.com/'},
  deepl:{url:'https://oneshot-free.www.deepl.com/v1/storefront/translate'}
};
const ALLOWED_ENDPOINT_HOSTS=new Set(['edge.microsoft.com','translate-pa.googleapis.com','translate.googleapis.com','translate.yandex.net','translated.turbopages.org','oneshot-free.www.deepl.com']);
function safeEndpoint(raw){try{const u=new URL(raw);return u.protocol==='https:'&&ALLOWED_ENDPOINT_HOSTS.has(u.hostname.toLowerCase())?u.toString():''}catch{return ''}}
function hash(s){return crypto.createHash('sha256').update(String(s)).digest('hex')}
function cleanText(v){return String(v??'')}
function normalizeRecipes(raw={}){
  const out=JSON.parse(JSON.stringify(BASE_RECIPES));out.upstreamVersion=String(raw.upstreamVersion||out.upstreamVersion);
  for(const [name,keys] of Object.entries({bing:['url'],google:['url','authUrl'],yandex:['url','sidUrl'],deepl:['url']}))for(const key of keys){const v=safeEndpoint(raw?.[name]?.[key]);if(v)out[name][key]=v}
  return out;
}
function createTranslator({liveSession,userDataDir,testMode=false,onChange=()=>{}}){
  const root=path.join(userDataDir,'Translator');fs.mkdirSync(root,{recursive:true});
  const cacheFile=path.join(root,'cache.json'),prefsFile=path.join(root,'preferences.json'),recipesFile=path.join(root,'recipes.json');
  let recipes=normalizeRecipes((()=>{try{return JSON.parse(fs.readFileSync(recipesFile,'utf8'))}catch{return {}}})());
  let cache=new Map(),cacheDirty=false,cacheTimer=null;
  try{const raw=JSON.parse(fs.readFileSync(cacheFile,'utf8'));for(const row of raw?.entries||[])if(Array.isArray(row)&&row.length===2)cache.set(row[0],row[1])}catch{}
  let prefs={service:'bing',targetLanguage:'en',autoSites:{}};try{prefs={...prefs,...JSON.parse(fs.readFileSync(prefsFile,'utf8'))}}catch{}
  const inflight=new Map();let googleKey='',googleKeyAt=0,yandexSid='',yandexSidAt=0;
  const state={name:'TWP Engine',enabled:true,upstream:'FilipePS/Traduzir-paginas-web',upstreamVersion:recipes.upstreamVersion,service:prefs.service,targetLanguage:prefs.targetLanguage,cacheEntries:cache.size,lastError:'',message:`TWP Engine ${recipes.upstreamVersion} ready`};
  const emit=()=>{state.cacheEntries=cache.size;state.service=prefs.service;state.targetLanguage=prefs.targetLanguage;try{onChange({...state})}catch{}};
  const savePrefs=()=>{try{fs.writeFileSync(prefsFile,JSON.stringify(prefs,null,2))}catch{}};
  const saveCacheSoon=()=>{cacheDirty=true;clearTimeout(cacheTimer);cacheTimer=setTimeout(()=>{if(!cacheDirty||testMode)return;cacheDirty=false;try{const entries=[...cache.entries()];if(entries.length>30000)entries.splice(0,entries.length-30000);fs.writeFileSync(cacheFile,JSON.stringify({version:1,entries},null,0))}catch{}},150);cacheTimer.unref?.()};
  async function fetchTimeout(url,init={},timeoutMs=10000){const c=new AbortController(),tm=setTimeout(()=>c.abort(),timeoutMs);try{return await liveSession.fetch(url,{...init,signal:c.signal})}finally{clearTimeout(tm)}}
  async function textResponse(res){const text=await res.text();if(!res.ok)throw new Error(`HTTP ${res.status}: ${text.slice(0,120)}`);return text}
  function cacheKey(service,source,target,text){return hash(`${service}\0${source}\0${target}\0${text}`)}
  function cacheGet(service,source,target,text){return cache.get(cacheKey(service,source,target,text))||null}
  function cacheSet(service,source,target,text,value,schedule=true){cache.set(cacheKey(service,source,target,text),{text:value.text,detectedLanguage:value.detectedLanguage||'und',at:Date.now()});if(schedule)saveCacheSoon()}
  async function googleAuth(){if(googleKey&&Date.now()-googleKeyAt<20*60*1000)return googleKey;const res=await fetchTimeout(recipes.google.authUrl,{headers:{Accept:'text/javascript,*/*;q=.1'}},8000);const body=await textResponse(res);const m=body.match(/["']x-goog-api-key["']\s*:\s*["']([\w-]{30,60})["']/i);if(!m)throw new Error('Google Translate auth key not exposed');googleKey=m[1];googleKeyAt=Date.now();return googleKey}
  async function yandexAuth(){if(yandexSid&&Date.now()-yandexSidAt<20*60*1000)return yandexSid;const res=await fetchTimeout(recipes.yandex.sidUrl,{headers:{Accept:'text/html,*/*;q=.1'}},8000);const body=await textResponse(res);const m=body.match(/sid\s*:\s*['"]([0-9a-f.]+)/i);if(!m)throw new Error('Yandex translator SID not exposed');yandexSid=m[1];yandexSidAt=Date.now();return yandexSid}
  function mapTarget(service,lang){lang=String(lang||'en');if(service==='bing')return ({'zh-CN':'zh-Hans','zh-TW':'zh-Hant',tl:'fil',no:'nb'}[lang]||lang);if(service==='deepl')return ({en:'en-US','es-MX':'es-419',no:'nb',pt:'pt-BR','zh-CN':'zh-Hans','zh-TW':'zh-Hant'}[lang]||lang);if(service==='yandex')return ({'zh-CN':'zh','zh-TW':'zh',pt:'pt-BR','pt-PT':'pt','es-MX':'es','fr-CA':'fr'}[lang]||lang);if(service==='google')return ({'es-MX':'es'}[lang]||lang);return lang}
  async function requestBing(source,target,texts){const to=mapTarget('bing',target),from=source&&source!=='auto'?`&from=${encodeURIComponent(mapTarget('bing',source))}`:'';const res=await fetchTimeout(`${recipes.bing.url}${from}&to=${encodeURIComponent(to)}`,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(texts)},10000);const json=await res.json();if(!res.ok)throw new Error(`Bing HTTP ${res.status}`);return json.map((r,i)=>({text:r?.translations?.[0]?.text??texts[i],detectedLanguage:r?.detectedLanguage?.language||'und'}))}
  async function requestGoogle(source,target,texts){const key=await googleAuth(),to=mapTarget('google',target),sl=source&&source!=='auto'?mapTarget('google',source):'auto';const res=await fetchTimeout(recipes.google.url,{method:'POST',headers:{'Content-Type':'application/json+protobuf','X-goog-api-key':key,'Accept':'application/json'},body:JSON.stringify([[texts,sl,to],'te'])},10000);const json=await res.json();if(!res.ok)throw new Error(`Google HTTP ${res.status}`);const vals=Array.isArray(json?.[0])?json[0]:[];return texts.map((t,i)=>({text:vals[i]??t,detectedLanguage:json?.[1]?.[i]||'und'}))}
  async function requestYandex(source,target,texts){const sid=await yandexAuth(),to=mapTarget('yandex',target),sl=source&&source!=='auto'?`${mapTarget('yandex',source)}-`:'';const q=texts.map(t=>`&text=${encodeURIComponent(t)}`).join('');const url=`${recipes.yandex.url}&srv=tr-url-widget&id=${encodeURIComponent(sid)}-0-0&format=html&lang=${encodeURIComponent(sl+to)}${q}`;const res=await fetchTimeout(url,{headers:{Accept:'application/json'}},10000);const json=await res.json();if(!res.ok)throw new Error(`Yandex HTTP ${res.status}`);const detected=String(json?.lang||'').split('-')[0]||'und';return texts.map((t,i)=>({text:json?.text?.[i]??t,detectedLanguage:detected}))}
  async function requestDeepL(source,target,texts){const to=mapTarget('deepl',target),sl=source&&source!=='auto'?mapTarget('deepl',source):'auto';const res=await fetchTimeout(recipes.deepl.url,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({language_model:'next-gen',source_lang:sl,target_lang:to,usage_type:'Translate',text:texts})},12000);const json=await res.json();if(!res.ok)throw new Error(`DeepL HTTP ${res.status}`);const rows=Array.isArray(json?.translations)?json.translations:[];return texts.map((t,i)=>({text:rows[i]?.text??t,detectedLanguage:rows[i]?.detected_source_language||'und'}))}
  async function request(service,source,target,texts){if(service==='google')return requestGoogle(source,target,texts);if(service==='yandex')return requestYandex(source,target,texts);if(service==='deepl')return requestDeepL(source,target,texts);return requestBing(source,target,texts)}
  async function translateTexts({service=prefs.service,sourceLanguage='auto',targetLanguage=prefs.targetLanguage,texts=[],onChunk=null}={}){
    service=['bing','google','yandex','deepl'].includes(service)?service:'bing';const input=texts.map(cleanText);if(!input.length)return [];
    const output=new Array(input.length),miss=[];for(let i=0;i<input.length;i++){const hit=cacheGet(service,sourceLanguage,targetLanguage,input[i]);if(hit)output[i]=hit;else miss.push(i)}
    const chunkSize=service==='yandex'?12:service==='deepl'?24:32;const chunks=[];for(let p=0;p<miss.length;p+=chunkSize)chunks.push(miss.slice(p,p+chunkSize));
    let cursor=0;const workers=Math.min(6,chunks.length);const run=async()=>{while(true){const idx=cursor++;if(idx>=chunks.length)return;const indexes=chunks[idx],vals=indexes.map(i=>input[i]),key=hash(`${service}\0${sourceLanguage}\0${targetLanguage}\0${vals.join('\u241e')}`);let promise=inflight.get(key);if(!promise){promise=request(service,sourceLanguage,targetLanguage,vals);inflight.set(key,promise);promise.finally(()=>inflight.delete(key))}const rows=await promise;for(let j=0;j<indexes.length;j++){const row=rows[j]||{text:vals[j],detectedLanguage:'und'};output[indexes[j]]=row;cacheSet(service,sourceLanguage,targetLanguage,vals[j],row,false)}if(typeof onChunk==='function')await onChunk(indexes,indexes.map(i=>output[i]))}};
    try{await Promise.all(Array.from({length:workers},run));if(miss.length)saveCacheSoon();state.lastError='';state.message=`${service} · ${input.length} text segment${input.length===1?'':'s'} translated`;emit();return output}
    catch(err){state.lastError=String(err?.message||err);state.message=`Translator error: ${state.lastError}`;emit();throw err}
  }
  function configure({service,targetLanguage}={}){if(['bing','google','yandex','deepl'].includes(service))prefs.service=service;if(targetLanguage)prefs.targetLanguage=String(targetLanguage);savePrefs();emit();return status()}
  function siteKey(raw){try{return new URL(raw).origin}catch{return ''}}
  function setAutoSite(raw,enabled){const key=siteKey(raw);if(!key)return false;if(enabled)prefs.autoSites[key]=true;else delete prefs.autoSites[key];savePrefs();return !!prefs.autoSites[key]}
  function autoSite(raw){return !!prefs.autoSites[siteKey(raw)]}
  function setRecipes(next){recipes=normalizeRecipes(next);state.upstreamVersion=recipes.upstreamVersion;try{fs.writeFileSync(recipesFile,JSON.stringify(recipes,null,2))}catch{};emit();return status()}
  function status(){return {...state,service:prefs.service,targetLanguage:prefs.targetLanguage,autoSites:Object.keys(prefs.autoSites||{}).length}}
  function dispose(){clearTimeout(cacheTimer);if(cacheDirty&&!testMode){try{fs.writeFileSync(cacheFile,JSON.stringify({version:1,entries:[...cache.entries()].slice(-30000)}))}catch{}}}
  return {translateTexts,configure,setAutoSite,autoSite,setRecipes,status,dispose,recipes:()=>JSON.parse(JSON.stringify(recipes)),root};
}
module.exports={createTranslator,BASE_RECIPES,normalizeRecipes,ALLOWED_ENDPOINT_HOSTS};
