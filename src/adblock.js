'use strict';
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const {readZip}=require('./zip-lite');
const {requestJson,requestBuffer}=require('./public-http');
const {createNativeAdblock}=require('./native-adblock');

const OFFICIAL_REPO='gorhill/uBlock';
const RELEASE_API=`https://api.github.com/repos/${OFFICIAL_REPO}/releases/latest`;
const CHECK_INTERVAL_MS=6*60*60*1000;

function readJson(file){try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch{return null}}
function cleanVersion(v=''){return String(v).replace(/[^0-9.].*$/,'').split('.').map(x=>Number(x)||0)}
function compareVersions(a,b){const A=cleanVersion(a),B=cleanVersion(b),n=Math.max(A.length,B.length);for(let i=0;i<n;i++){const d=(A[i]||0)-(B[i]||0);if(d)return d>0?1:-1}return 0}
function ensureDir(dir){fs.mkdirSync(dir,{recursive:true})}
function removeDir(dir){try{fs.rmSync(dir,{recursive:true,force:true})}catch{}}
function verifyExtension(dir){
  const manifest=readJson(path.join(dir,'manifest.json'));
  if(!manifest||manifest.name!=='uBlock Origin')throw new Error('Downloaded extension is not uBlock Origin');
  if(Number(manifest.manifest_version)!==2)throw new Error(`Unsupported uBlock manifest v${manifest.manifest_version}`);
  const perms=new Set(manifest.permissions||[]);for(const p of ['webRequest','webRequestBlocking','storage'])if(!perms.has(p))throw new Error(`uBlock package missing ${p}`);
  if(!/^\d+(?:\.\d+){1,3}$/.test(String(manifest.version||'')))throw new Error('uBlock package has invalid version');
  return manifest;
}
function integrationShimPath(bundledDir){return path.join(bundledDir,'js','electron-compat.js')}
function patchElectronCompatibility(dir,bundledDir){
  const shim=integrationShimPath(bundledDir);if(!fs.existsSync(shim))throw new Error('Bundled Electron compatibility shim missing');
  ensureDir(path.join(dir,'js'));fs.copyFileSync(shim,path.join(dir,'js','electron-compat.js'));
  const bg=path.join(dir,'background.html');let html=fs.readFileSync(bg,'utf8');
  if(!html.includes('js/electron-compat.js')){
    const needle='<script src="lib/lz4/lz4-block-codec-any.js"></script>';
    if(!html.includes(needle))throw new Error('Unexpected uBlock background page layout');
    html=html.replace(needle,'<script src="js/electron-compat.js"></script>\n'+needle);fs.writeFileSync(bg,html);
  }
  const note=path.join(dir,'MCC-INTEGRATION.txt');
  if(!fs.existsSync(note))fs.writeFileSync(note,'Minecraft Catalog Companion Electron compatibility shim applied to official uBlock Origin Chromium build.\n');
}
function copyExtension(src,dst,bundledDir){removeDir(dst);ensureDir(path.dirname(dst));fs.cpSync(src,dst,{recursive:true});patchElectronCompatibility(dst,bundledDir);return verifyExtension(dst)}
function locateZipRoot(zip){
  const candidates=zip.names.filter(n=>/(^|\/)manifest\.json$/i.test(n));
  for(const name of candidates){try{const manifest=JSON.parse(zip.text(name));if(manifest?.name==='uBlock Origin')return {prefix:name.slice(0,-'manifest.json'.length),manifest}}catch{}}
  throw new Error('Official uBlock manifest not found in update archive');
}
function extractExtensionZip(buffer,dst,bundledDir){
  const zip=readZip(buffer,{maxEntries:30000,maxEntryBytes:64*1024*1024,maxTotalBytes:256*1024*1024});
  const {prefix}=locateZipRoot(zip);removeDir(dst);ensureDir(dst);
  for(const name of zip.names){if(prefix&&!name.startsWith(prefix))continue;const rel=name.slice(prefix.length).replace(/\\/g,'/');if(!rel||rel.endsWith('/'))continue;if(rel.startsWith('/')||rel.split('/').some(x=>x==='..'))throw new Error(`Unsafe extension ZIP path: ${rel}`);const data=zip.get(name);if(!data)continue;const out=path.join(dst,...rel.split('/'));ensureDir(path.dirname(out));fs.writeFileSync(out,data)}
  patchElectronCompatibility(dst,bundledDir);return verifyExtension(dst);
}
function sha256(buffer){return crypto.createHash('sha256').update(buffer).digest('hex')}
function makeStatus(){return {enabled:true,loaded:false,filteringVerified:false,nativeReady:false,nativeEnabled:false,name:'uBlock Origin',version:'',id:'',path:'',updateState:'idle',updateAvailable:'',lastCheckedAt:'',listsUpdatedAt:'',ruleCount:0,blocked:0,lastBlocked:'',message:'Starting ad blocker…'}}

function createAdblockManager({appRoot,userDataDir,liveSession,testMode=false,onChange=()=>{}}){
  const bundledDir=path.join(appRoot,'extensions','ublock-origin');
  const root=path.join(userDataDir,'Extensions','uBlockOrigin');const current=path.join(root,'current');const pending=path.join(root,'pending');
  const state=makeStatus();let updateTimer=null;let native=null;
  const emit=()=>{try{onChange({...state})}catch{}};
  const mergeNative=(n={})=>{
    state.nativeReady=!!n.nativeReady;state.nativeEnabled=!!n.nativeEnabled;state.filteringVerified=!!n.verified;
    state.ruleCount=Number(n.ruleCount)||0;state.blocked=Number(n.blocked)||0;state.lastBlocked=String(n.lastBlocked||'');state.listsUpdatedAt=String(n.listsUpdatedAt||'');
    if(state.filteringVerified){state.message=`uBlock Origin ${state.version||''} · filtering verified · ${state.ruleCount.toLocaleString()} network rules${state.loaded?' · extension loaded':' · native engine'}`}
    emit();
  };
  function prepare(){
    ensureDir(root);verifyExtension(bundledDir);
    if(fs.existsSync(pending)){try{const pm=verifyExtension(pending),cm=fs.existsSync(current)?verifyExtension(current):null;if(!cm||compareVersions(pm.version,cm.version)>0)copyExtension(pending,current,bundledDir);removeDir(pending)}catch{removeDir(pending)}}
    const bundled=verifyExtension(bundledDir);let installed=null;try{installed=verifyExtension(current)}catch{}
    if(!installed||compareVersions(bundled.version,installed.version)>0)installed=copyExtension(bundledDir,current,bundledDir);
    state.version=installed.version;state.path=current;state.message=`uBlock Origin ${installed.version} ready`;emit();return installed;
  }
  async function load(){
    const installed=prepare();
    let ext=null,extensionError='';
    try{ext=await liveSession.extensions.loadExtension(current);state.loaded=true;state.id=ext.id;state.version=ext.version||installed.version}
    catch(err){state.loaded=false;extensionError=String(err?.message||err)}
    try{
      native=createNativeAdblock({liveSession,extensionDir:current,userDataDir,testMode,onChange:mergeNative});
      native.enable();mergeNative(native.status());
    }catch(err){state.nativeReady=false;state.nativeEnabled=false;state.filteringVerified=false;state.message=`uBlock network filtering could not start: ${err?.message||err}`;emit()}
    if(state.filteringVerified){
      state.message=`uBlock Origin ${state.version} · filtering verified · ${state.ruleCount.toLocaleString()} network rules${state.loaded?'':' · extension UI unavailable'}`;
    }else if(extensionError){state.message=`uBlock Origin extension could not load: ${extensionError}`}
    else if(state.loaded){state.message=`uBlock Origin ${state.version} loaded, but filtering is not verified`}
    emit();return {...state};
  }
  async function checkPackageUpdate(){
    const release=await requestJson(RELEASE_API,{timeoutMs:7000,headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}});
    const assets=Array.isArray(release?.assets)?release.assets:[];
    const asset=assets.find(a=>/^uBlock0_[0-9.]+\.chromium\.zip$/i.test(String(a?.name||'')));
    if(!asset?.browser_download_url)return {state:'current',message:'Official uBlock Chromium release metadata unavailable'};
    const releaseVersion=(String(asset.name).match(/uBlock0_([0-9.]+)\.chromium/i)||[])[1]||String(release.tag_name||'').replace(/^v/,'');
    if(compareVersions(releaseVersion,state.version)<=0)return {state:'current',message:`uBlock Origin ${state.version} · current`};
    state.updateAvailable=releaseVersion;state.updateState='downloading';state.message=`Downloading uBlock Origin ${releaseVersion}…`;emit();
    const result=await requestBuffer(asset.browser_download_url,{timeoutMs:20000,redirects:7,headers:{Accept:'application/octet-stream'}});
    if(result.status<200||result.status>=300)throw new Error(`GitHub asset HTTP ${result.status}`);
    if(result.buffer.length<100000||result.buffer.length>40*1024*1024)throw new Error(`Unexpected uBlock update size: ${result.buffer.length}`);
    const digest=sha256(result.buffer);if(asset.digest&&String(asset.digest).startsWith('sha256:')&&asset.digest.slice(7).toLowerCase()!==digest)throw new Error('Official GitHub asset SHA-256 mismatch');
    const manifest=extractExtensionZip(result.buffer,pending,bundledDir);if(compareVersions(manifest.version,state.version)<=0){removeDir(pending);return {state:'current',message:`uBlock Origin ${state.version} · current`}}
    fs.writeFileSync(path.join(root,'update-state.json'),JSON.stringify({version:manifest.version,sha256:digest,asset:asset.name,source:asset.browser_download_url,stagedAt:new Date().toISOString()},null,2));
    return {state:'staged',message:`uBlock Origin ${manifest.version} downloaded · activates next restart`,version:manifest.version};
  }
  async function checkForUpdate({manual=false}={}){
    if(testMode)return {...state,updateState:'test-skip'};
    state.updateState='checking';state.message=manual?'Updating uBlock Origin + filter lists…':state.message;emit();
    try{
      const [pkg,lists]=await Promise.allSettled([checkPackageUpdate(),native?.refresh({manual})||Promise.resolve(null)]);
      state.lastCheckedAt=new Date().toISOString();
      if(lists.status==='fulfilled'&&lists.value)mergeNative(lists.value);
      if(pkg.status==='fulfilled'){
        state.updateState=pkg.value.state||'current';state.updateAvailable=pkg.value.version||'';
        state.message=`${pkg.value.message}${state.filteringVerified?` · ${state.ruleCount.toLocaleString()} live network rules`:''}`;
      }else{state.updateState='error';state.message=`uBlock update check failed: ${pkg.reason?.message||pkg.reason}`}
      if(lists.status==='rejected'){state.updateState=state.updateState==='error'?'error':'partial';state.message+=` · filter refresh failed: ${lists.reason?.message||lists.reason}`}
      emit();return {...state};
    }catch(err){state.updateState='error';state.message=`uBlock update check failed: ${err?.message||err}`;emit();return {...state}}
  }
  function schedule(){if(testMode)return;clearTimeout(updateTimer);updateTimer=setTimeout(async function tick(){await checkForUpdate();updateTimer=setTimeout(tick,CHECK_INTERVAL_MS);updateTimer.unref?.()},15000);updateTimer.unref?.()}
  function status(){if(native)mergeNative(native.status());return {...state}}
  function testDecision(url,details={}){return native?.testDecision(url,details)||{block:false,reason:'native-not-ready'}}
  function dispose(){if(updateTimer)clearTimeout(updateTimer);try{native?.dispose()}catch{}}
  return {load,checkForUpdate,schedule,status,testDecision,dispose,paths:{root,current,pending,bundledDir}};
}
module.exports={createAdblockManager,compareVersions,verifyExtension,extractExtensionZip,OFFICIAL_REPO,RELEASE_API};
