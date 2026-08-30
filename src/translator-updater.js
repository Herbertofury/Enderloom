'use strict';
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const {requestJson,requestBuffer}=require('./public-http');
const {readZip}=require('./zip-lite');
const {BASE_RECIPES,normalizeRecipes,ALLOWED_ENDPOINT_HOSTS}=require('./translator');

const OFFICIAL_REPO='FilipePS/Traduzir-paginas-web';
const RELEASE_API=`https://api.github.com/repos/${OFFICIAL_REPO}/releases/latest`;
const CHECK_INTERVAL_MS=6*60*60*1000;
function vparts(v=''){return String(v).replace(/^v/i,'').split('.').map(n=>parseInt(n,10)||0)}
function compare(a,b){const A=vparts(a),B=vparts(b);for(let i=0;i<Math.max(A.length,B.length);i++){const d=(A[i]||0)-(B[i]||0);if(d)return d>0?1:-1}return 0}
function sha256(b){return crypto.createHash('sha256').update(b).digest('hex')}
function safeName(v){return String(v||'').replace(/[^0-9A-Za-z._-]/g,'_')}
function locate(zip,suffix){return zip.names.find(n=>n.replace(/\\/g,'/').endsWith(suffix))||''}
function parseRecipes(source,version){
  const urls=[...String(source||'').matchAll(/https:\/\/[^\s"'`<>\\]+/g)].map(m=>m[0].replace(/[),;]+$/,''));
  const next=JSON.parse(JSON.stringify(BASE_RECIPES));next.upstreamVersion=String(version||BASE_RECIPES.upstreamVersion);
  for(const raw of urls){let u;try{u=new URL(raw)}catch{continue}if(!ALLOWED_ENDPOINT_HOSTS.has(u.hostname.toLowerCase()))continue;
    if(u.hostname==='edge.microsoft.com'&&u.pathname.includes('/translate/translatetext'))next.bing.url=u.toString();
    else if(u.hostname==='translate-pa.googleapis.com'&&u.pathname.includes('/v1/translateHtml'))next.google.url=u.toString();
    else if(u.hostname==='translate.googleapis.com'&&u.pathname.includes('/_/translate_http/'))next.google.authUrl=u.toString();
    else if(u.hostname==='translate.yandex.net'&&u.pathname.includes('/api/v1/tr.json/translate'))next.yandex.url=u.toString();
    else if(u.hostname==='translated.turbopages.org')next.yandex.sidUrl=u.toString();
    else if(u.hostname==='oneshot-free.www.deepl.com'&&u.pathname.includes('/storefront/translate'))next.deepl.url=u.toString();
  }
  return normalizeRecipes(next);
}
function createTranslatorUpdater({userDataDir,translator,testMode=false,onChange=()=>{}}){
  const root=path.join(userDataDir,'Translator','Upstream');fs.mkdirSync(root,{recursive:true});
  const state={name:'TWP upstream',repo:OFFICIAL_REPO,currentVersion:translator?.status()?.upstreamVersion||BASE_RECIPES.upstreamVersion,latestVersion:'',updateState:'idle',lastCheckedAt:'',message:`TWP upstream ${translator?.status()?.upstreamVersion||BASE_RECIPES.upstreamVersion}`};let timer=null;
  const emit=()=>{try{onChange({...state})}catch{}};
  async function installSourceArchive(buffer,version,release={}){
    const zip=readZip(buffer,{maxEntries:12000,maxEntryBytes:8*1024*1024,maxTotalBytes:96*1024*1024});
    const manifestName=locate(zip,'/src/chrome_manifest.json'),svcName=locate(zip,'/src/background/translationService.js'),pageName=locate(zip,'/src/contentScript/pageTranslator.js'),licenseName=locate(zip,'/LICENSE');
    if(!manifestName||!svcName||!pageName||!licenseName)throw new Error('TWP source archive missing required core files');
    const manifest=JSON.parse(zip.text(manifestName));if(manifest.name!=='TWP - Translate Web Pages')throw new Error('TWP manifest identity mismatch');
    if(compare(manifest.version,version)!==0)throw new Error(`TWP archive version mismatch ${manifest.version} != ${version}`);
    const license=zip.text(licenseName);if(!/Mozilla Public License Version 2\.0/i.test(license))throw new Error('TWP MPL-2.0 license missing');
    const serviceSource=zip.text(svcName),recipes=parseRecipes(serviceSource,version);
    const dir=path.join(root,safeName(version));fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
    const wanted={
      'LICENSE':license,
      'chrome_manifest.json':zip.text(manifestName),
      'background/translationService.js':serviceSource,
      'contentScript/pageTranslator.js':zip.text(pageName)
    };
    for(const suffix of ['/src/contentScript/showOriginal.js','/src/contentScript/showTranslated.js','/src/contentScript/translateSelected.js','/src/background/translationCache.js']){const n=locate(zip,suffix);if(n)wanted[suffix.split('/src/')[1]]=zip.text(n)}
    for(const [rel,text] of Object.entries(wanted)){const out=path.join(dir,...rel.split('/'));fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,text)}
    const digest=sha256(buffer);fs.writeFileSync(path.join(dir,'MCC-INTEGRATION.json'),JSON.stringify({repo:OFFICIAL_REPO,version,tag:release.tag_name||`v${version}`,archiveSha256:digest,downloadedAt:new Date().toISOString(),executionPolicy:'upstream source is retained for MPL provenance; MCC executes its audited Electron adapter and imports only allow-listed translator endpoint recipes',recipes},null,2));
    translator?.setRecipes(recipes);state.currentVersion=version;state.latestVersion=version;state.updateState='updated';state.message=`TWP ${version} source + translator recipes updated`;emit();return {version,digest,recipes,path:dir};
  }
  async function checkForUpdate({manual=false,force=false}={}){
    if(testMode&&!force)return {...state,updateState:'test-skip'};
    state.updateState='checking';state.message=manual?'Checking Translate Web Pages upstream…':state.message;emit();
    try{
      const release=await requestJson(RELEASE_API,{timeoutMs:8000,headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}});const version=String(release?.tag_name||'').replace(/^v/i,'');if(!version)throw new Error('TWP latest release did not expose a version');
      state.latestVersion=version;state.lastCheckedAt=new Date().toISOString();
      const currentReceipt=path.join(root,safeName(state.currentVersion),'MCC-INTEGRATION.json');
      const needsBaselineSnapshot=!fs.existsSync(currentReceipt);
      if(!force&&compare(version,state.currentVersion)<=0&&!needsBaselineSnapshot){state.updateState='current';state.message=`TWP ${state.currentVersion} · current`;emit();return {...state}}
      const url=release.zipball_url||`https://api.github.com/repos/${OFFICIAL_REPO}/zipball/${encodeURIComponent(release.tag_name)}`;
      state.updateState='downloading';state.message=needsBaselineSnapshot&&compare(version,state.currentVersion)<=0?`Syncing verified TWP ${version} upstream source…`:`Downloading TWP ${version} source…`;emit();
      const result=await requestBuffer(url,{timeoutMs:20000,redirects:7,headers:{Accept:'application/vnd.github+json'}});if(result.status<200||result.status>=300)throw new Error(`GitHub TWP source HTTP ${result.status}`);if(result.buffer.length<100000||result.buffer.length>40*1024*1024)throw new Error(`Unexpected TWP source size ${result.buffer.length}`);
      await installSourceArchive(result.buffer,version,release);return {...state};
    }catch(err){state.updateState='error';state.lastCheckedAt=new Date().toISOString();state.message=`TWP update failed: ${err?.message||err}`;emit();return {...state}}
  }
  function schedule(){if(testMode)return;clearTimeout(timer);timer=setTimeout(async function tick(){await checkForUpdate();timer=setTimeout(tick,CHECK_INTERVAL_MS);timer.unref?.()},18000);timer.unref?.()}
  function status(){return {...state}}
  function dispose(){clearTimeout(timer)}
  return {checkForUpdate,installSourceArchive,schedule,status,dispose,parseRecipes,root};
}
module.exports={createTranslatorUpdater,parseRecipes,compare,OFFICIAL_REPO,RELEASE_API};
