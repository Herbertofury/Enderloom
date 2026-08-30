'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { EventEmitter } = require('events');
const { requestBuffer, isByteString } = require('./public-http');
const { Worker } = require('worker_threads');
const { acceptedPath, detectFormat, safeUrl } = require('./ingest');
const { normalizeSnapshot, writeCatalog, catalogSemanticHash } = require('./catalog-renderer');

const GOOGLE_REFRESH_MS = 2 * 60 * 1000;
const GOOGLE_INITIAL_REFRESH_MS = 3500;
const LOCAL_WATCH_MS = 1600;
const STRUCTURED = new Set(['xlsx','xlsm','csv','tsv','json','catalog','html','htm','zip']);

function idSlug(value) {
  return String(value || 'catalog').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,56) || 'catalog';
}
function uniqueId(base, taken) {
  let id = idSlug(base), n = 2;
  while (taken.has(id)) id = `${idSlug(base)}-${n++}`;
  return id;
}
function sourceId() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }
function atomicJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive:true });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}
function readJson(file, fallback) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } }
function formatFromName(name, buffer) { return detectFormat(name || '', buffer); }
function sourceRole(format) { return STRUCTURED.has(format) ? 'primary' : format === 'pdf' ? 'fixed' : 'narrative'; }
function mapLegacyCatalogId(id) { return id === 'mob-girls' ? 'mob-girl' : String(id || ''); }
function legacyRole(role, format) { if (role === 'structured') return 'primary'; if (role === 'guide') return 'narrative'; if (role === 'publication') return 'fixed'; return role || sourceRole(format); }
function googleFileId(url) {
  const s = String(url || '');
  return s.match(/\/(?:spreadsheets|document|presentation)\/d\/([A-Za-z0-9_-]+)/)?.[1] || s.match(/\/file\/d\/([A-Za-z0-9_-]+)/)?.[1] || '';
}
function inferGoogle(url) {
  const s = String(url || ''); const id = googleFileId(s);
  if (!id) return null;
  if (/docs\.google\.com\/spreadsheets\/d\//i.test(s)) return { id, format:'xlsx', kind:'sheet', role:'primary', exportUrl:`https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx` };
  if (/docs\.google\.com\/document\/d\//i.test(s)) return { id, format:'docx', kind:'doc', role:'narrative', exportUrl:`https://docs.google.com/document/d/${id}/export?format=docx` };
  if (/drive\.google\.com\/file\/d\//i.test(s)) return { id, format:/\.pdf(?:[?#]|$)/i.test(s)?'pdf':'pdf', kind:'drive-file', role:'fixed', exportUrl:`https://drive.google.com/uc?export=download&id=${id}` };
  return null;
}
function ingestAsync(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, 'ingest-worker.js'));
    const cleanup = () => worker.terminate().catch(()=>{});
    worker.once('message', msg => { cleanup(); msg.ok ? resolve(msg) : reject(new Error(msg.error)); });
    worker.once('error', err => { cleanup(); reject(err); });
    worker.postMessage({ buffer, options });
  });
}
function parsedSemantic(parsed) {
  return catalogSemanticHash({ items:parsed.items || [], assets:parsed.assets || {}, documents:parsed.documents || [] });
}
function mergeItems(oldItems, newItems) {
  const oldBy = new Map((oldItems || []).map(x => [x.primaryUrl || String(x.name||'').toLowerCase(), x]));
  return (newItems || []).map(item => {
    const old = oldBy.get(item.primaryUrl || String(item.name||'').toLowerCase());
    if (!old) return item;
    const next = { ...item };
    for (const key of ['authorUrl','iconAsset','authorAsset','galleryAsset']) if (!next[key] && old[key]) next[key] = old[key];
    if ((!next.sources || !next.sources.length) && old.sources) next.sources = old.sources;
    return next;
  });
}

class CatalogStore extends EventEmitter {
  constructor({ rootDir, userDataDir, liveSession = null, googleRequest = null, testMode = false }) {
    super(); this.rootDir=rootDir; this.userDataDir=userDataDir; this.liveSession=liveSession; this.googleRequest=googleRequest||requestBuffer; this.testMode=testMode;
    this.dir=path.join(userDataDir,'catalog-center'); this.registryFile=path.join(this.dir,'registry.json'); this.snapDir=path.join(this.dir,'snapshots'); this.runtimeDir=path.join(this.dir,'runtime');
    this.legacyDir=path.join(userDataDir,'catalog-workspace'); this.legacyRegistryFile=path.join(this.legacyDir,'registry.json');
    this.registry=null; this.cache=new Map(); this.watchers=new Map(); this.refreshTimer=null; this.initialRefreshTimer=null; this.refreshing=new Set();
  }
  async init() {
    fs.mkdirSync(this.snapDir,{recursive:true}); fs.mkdirSync(this.runtimeDir,{recursive:true});
    const defaultsDir=path.join(this.rootDir,'catalog','catalogs'); const defaultFiles=fs.existsSync(defaultsDir)?fs.readdirSync(defaultsDir).filter(x=>x.endsWith('.json')):[];
    const bundled=[];
    for (const f of defaultFiles) { const snap=normalizeSnapshot(readJson(path.join(defaultsDir,f),{})); if(snap.id&&snap.items.length) bundled.push(snap); }
    this.registry=readJson(this.registryFile,null);
    if (!this.registry || !Array.isArray(this.registry.catalogs)) this.registry={version:2,activeCatalogId:bundled[0]?.id||'',catalogs:[],migrations:[]};
    if (!Array.isArray(this.registry.migrations)) this.registry.migrations=[];
    const existing=new Map(this.registry.catalogs.map(x=>[x.id,x]));
    for (const snap of bundled) {
      const target=path.join(this.snapDir,`${snap.id}.json`);
      if (!fs.existsSync(target)) atomicJson(target,snap);
      if (!existing.has(snap.id)) {
        const entry={id:snap.id,name:snap.name,bundled:true,createdAt:snap.createdAt||now(),updatedAt:snap.updatedAt||now(),snapshotFile:target,sources:snap.sources||[]};
        this.registry.catalogs.push(entry); existing.set(snap.id,entry);
      }
    }
    this.migrateLegacyWorkspace();
    if (!this.registry.catalogs.some(x=>x.id===this.registry.activeCatalogId)) this.registry.activeCatalogId=bundled[0]?.id||this.registry.catalogs[0]?.id||'';
    this.saveRegistry();
    for (const entry of this.registry.catalogs) this.startLocalWatches(entry);
    if (!this.testMode) {
      this.initialRefreshTimer=setTimeout(()=>this.refreshGoogleSources().catch(()=>{}),GOOGLE_INITIAL_REFRESH_MS);
      this.initialRefreshTimer.unref?.();
      this.refreshTimer=setInterval(()=>this.refreshGoogleSources().catch(()=>{}),GOOGLE_REFRESH_MS);
    }
    await this.renderActive();
    return this.summary();
  }
  migrateLegacyWorkspace() {
    const marker='catalog-workspace-v1.2';
    if(this.registry.migrations.includes(marker)||!fs.existsSync(this.legacyRegistryFile))return false;
    const legacy=readJson(this.legacyRegistryFile,[]);
    if(!Array.isArray(legacy)){this.registry.migrations.push(marker);return false}
    const taken=new Set(this.registry.catalogs.map(x=>x.id));
    const sourceKey=src=>src.googleFileId?`g:${src.googleFileId}`:src.path?`l:${path.resolve(src.path)}`:`i:${src.id||''}`;
    const convertSource=src=>{
      const format=String(src.export||src.format||detectFormat(src.localPath||src.name||'')).toLowerCase()||'bin';
      const info=inferGoogle(src.url||'');
      const googleId=String(src.googleId||info?.id||'');
      let exportUrl=info?.exportUrl||'';
      if(googleId&&!exportUrl){if(src.kind==='google-sheet'||format==='xlsx'||format==='xlsm')exportUrl=`https://docs.google.com/spreadsheets/d/${googleId}/export?format=xlsx`;else if(src.kind==='google-doc'||format==='docx')exportUrl=`https://docs.google.com/document/d/${googleId}/export?format=docx`;else exportUrl=`https://drive.google.com/uc?export=download&id=${googleId}`}
      return {id:String(src.id||sourceId()),label:String(src.name||src.label||path.basename(src.localPath||'Source')),location:src.localPath?'local':googleId?'google':src.location||'local',provider:googleId?'Google Drive':src.provider||'',kind:src.kind||'file',role:legacyRole(src.role,format),format,path:src.localPath||src.path||'',url:safeUrl(src.url)||String(src.url||''),googleFileId:googleId,exportUrl,autoRefresh:src.autoRefresh!==false,status:src.error?'error':'pending',error:String(src.error||''),lastChecked:src.lastSync||src.lastChecked||'',lastByteHash:src.hash||src.lastByteHash||'',etag:src.etag||'',lastModified:src.lastModified||''};
    };
    for(const old of legacy){
      if(!old||!old.id)continue;
      const mapped=mapLegacyCatalogId(old.id);let entry=this.registry.catalogs.find(x=>x.id===mapped);
      if(!entry){
        const id=taken.has(mapped)?uniqueId(mapped,taken):mapped;taken.add(id);
        const oldFile=old.dataFile||path.join(this.legacyDir,'data',`${old.id}.json`);
        const raw=readJson(oldFile,{id,name:old.title||old.shortTitle||id,items:[],assets:{},documents:[]});
        const snap=normalizeSnapshot({...raw,id,name:old.title||raw.name||raw.title||id});
        const snapshotFile=path.join(this.snapDir,`${id}.json`);atomicJson(snapshotFile,snap);this.cache.set(id,snap);
        entry={id,name:snap.name,bundled:false,createdAt:old.createdAt||now(),updatedAt:old.lastSync||snap.updatedAt||now(),snapshotFile,sources:[]};this.registry.catalogs.push(entry);
      }
      const seen=new Set((entry.sources||[]).map(sourceKey));
      for(const oldSrc of old.sources||[]){const src=convertSource(oldSrc),key=sourceKey(src);if(!seen.has(key)){entry.sources.push(src);seen.add(key)}}
      const snap=this.loadSnapshot(entry.id);if(snap){snap.sources=entry.sources;atomicJson(entry.snapshotFile,normalizeSnapshot(snap));this.cache.delete(entry.id)}
    }
    const oldSession=readJson(path.join(this.userDataDir,'session.json'),{}),active=mapLegacyCatalogId(oldSession.currentCatalogId||'');
    if(active&&this.registry.catalogs.some(x=>x.id===active))this.registry.activeCatalogId=active;
    this.registry.migrations.push(marker);return true;
  }
  dispose() { if(this.initialRefreshTimer)clearTimeout(this.initialRefreshTimer);if(this.refreshTimer)clearInterval(this.refreshTimer);for(const stop of this.watchers.values())stop();this.watchers.clear(); }
  saveRegistry(){atomicJson(this.registryFile,this.registry)}
  entry(id=this.registry.activeCatalogId){return this.registry.catalogs.find(x=>x.id===id)||null}
  loadSnapshot(id=this.registry.activeCatalogId){if(this.cache.has(id))return this.cache.get(id);const e=this.entry(id);if(!e)return null;const snap=normalizeSnapshot(readJson(e.snapshotFile,{}));this.cache.set(id,snap);return snap}
  saveSnapshot(id,snapshot){const e=this.entry(id);if(!e)throw new Error('Catalog not found');const snap=normalizeSnapshot({...snapshot,id,name:e.name,sources:e.sources,updatedAt:now()});atomicJson(e.snapshotFile,snap);this.cache.set(id,snap);e.updatedAt=snap.updatedAt;this.saveRegistry();return snap}
  runtimePath(id=this.registry.activeCatalogId){return path.join(this.runtimeDir,`${id}.html`)}
  async renderActive(){const snap=this.loadSnapshot();if(!snap)return '';const e=this.entry();const view={...snap,sources:e.sources,sync:this.catalogSync(e)};const normalized=writeCatalog(view,this.runtimePath(),this.rootDir);this.cache.set(e.id,normalized);return this.runtimePath()}
  catalogSync(entry){const sources=entry?.sources||[];if(!sources.length)return{state:'snapshot',label:'Offline snapshot'};if(sources.some(x=>x.status==='error'||x.status==='sign-in-required'))return{state:'error',label:'Source attention needed'};if(sources.some(x=>x.location==='local'&&x.autoRefresh!==false)||sources.some(x=>x.location==='google'&&x.autoRefresh!==false))return{state:'watching',label:'Auto-refresh watching'};return{state:'fresh',label:'Sources current'}}
  summary(){return{activeCatalogId:this.registry.activeCatalogId,catalogs:this.registry.catalogs.map(e=>{const s=this.loadSnapshot(e.id),items=s?.items||[],liveMediaCapable=items.filter(x=>/^https?:\/\//i.test(String(x.primaryUrl||''))).length;return{id:e.id,name:e.name,entries:items.length,assets:liveMediaCapable,liveMediaCapable,collections:new Set(items.flatMap(x=>x.collections||[])).size,updatedAt:e.updatedAt,sync:this.catalogSync(e),sources:(e.sources||[]).map(x=>({...x}))}})}}
  async activate(id){if(!this.entry(id))throw new Error('Catalog not found');this.registry.activeCatalogId=id;this.saveRegistry();const runtime=await this.renderActive();this.emit('active-changed',{id,runtime});return this.summary()}
  async addLocalFiles(paths,{mode='smart'}={}){
    const files=(paths||[]).filter(p=>fs.existsSync(p)&&fs.statSync(p).isFile()&&acceptedPath(p));
    if(!files.length)throw new Error('No supported catalog files selected');
    const parsedFiles=[];
    for(const filePath of files){
      const buffer=fs.readFileSync(filePath);
      const parsed=(await ingestAsync(buffer,{filePath,title:path.basename(filePath)})).parsed;
      const format=parsed.format||formatFromName(filePath,buffer),role=parsed.items?.length?'primary':format==='pdf'?'fixed':'narrative';
      parsedFiles.push({filePath,parsed,format,role});
    }
    let target=this.entry();
    const primary=parsedFiles.find(x=>x.role==='primary');
    const allAlreadyKnown=parsedFiles.every(x=>this.findSourceByPath(x.filePath,target?.id));
    const shouldCreate=mode==='new'||(mode==='smart'&&!!primary&&!allAlreadyKnown);
    if(shouldCreate){
      const seed=primary||parsedFiles[0];
      target=await this.createFromParsed(seed.parsed,path.basename(seed.filePath,path.extname(seed.filePath)));
    }
    const results=[];
    for(const row of parsedFiles){
      const {filePath,parsed,format,role}=row;
      const existing=this.findSourceByPath(filePath,target?.id);let src=existing;
      if(!src){
        src={id:sourceId(),label:path.basename(filePath),location:'local',kind:'file',role,format,path:filePath,url:'',autoRefresh:true,status:'current',lastChecked:now()};
        target.sources.push(src);this.saveRegistry();this.startLocalWatch(target,src);
      }
      await this.applyParsed(target,src,parsed);
      results.push({catalogId:target.id,sourceId:src.id,format,role,items:parsed.items?.length||0});
    }
    await this.renderActive();this.emit('active-changed',{id:target.id,runtime:this.runtimePath(target.id),reason:'local-import'});this.emit('catalogs-changed',this.summary());
    return{summary:this.summary(),results};
  }
  async createFromParsed(parsed,name){const taken=new Set(this.registry.catalogs.map(x=>x.id));const id=uniqueId(name||parsed.title||'catalog',taken);const entry={id,name:name||parsed.title||id,bundled:false,createdAt:now(),updatedAt:now(),snapshotFile:path.join(this.snapDir,`${id}.json`),sources:[]};this.registry.catalogs.push(entry);this.registry.activeCatalogId=id;this.saveRegistry();const snap=normalizeSnapshot({id,name:entry.name,description:`Hot-ingested research catalog from ${parsed.title||entry.name}.`,items:parsed.items||[],assets:parsed.assets||{},documents:parsed.documents||[],sources:[],createdAt:now(),updatedAt:now()});atomicJson(entry.snapshotFile,snap);this.cache.set(id,snap);return entry}
  findSourceByPath(filePath,catalogId){const scan=catalogId?[this.entry(catalogId)]:this.registry.catalogs;for(const e of scan.filter(Boolean)){const s=(e.sources||[]).find(x=>x.location==='local'&&path.resolve(x.path||'')===path.resolve(filePath));if(s)return s}return null}
  startLocalWatches(entry){for(const src of entry.sources||[])this.startLocalWatch(entry,src)}
  startLocalWatch(entry,src){if(src.location!=='local'||src.autoRefresh===false||!src.path||this.watchers.has(src.id)||!fs.existsSync(src.path))return;let last=0;try{last=fs.statSync(src.path).mtimeMs}catch{}
    const timer=setInterval(async()=>{try{const st=fs.statSync(src.path);if(st.mtimeMs===last)return;last=st.mtimeMs;await this.refreshSource(entry.id,src.id,{reason:'local-watch'})}catch(err){src.status='error';src.error=String(err.message||err);this.saveRegistry();this.emit('source-health',this.summary())}},LOCAL_WATCH_MS);timer.unref?.();this.watchers.set(src.id,()=>clearInterval(timer));}
  async addGoogleSource(url,{catalogId=this.registry.activeCatalogId,role,mode='attach',name}={}){
    const info=inferGoogle(url);if(!info)throw new Error('Use a Google Sheets, Docs, or Drive file URL');
    let e=this.entry(catalogId);if(!e)throw new Error('Catalog not found');
    if(mode==='new')e=await this.createFromParsed({title:name||'Google catalog',items:[],assets:{},documents:[]},name||`Google ${info.kind==='sheet'?'Sheet':info.kind==='doc'?'Doc':'Catalog'}`);
    const existing=e.sources.find(x=>x.googleFileId===info.id);if(existing)return this.refreshSource(e.id,existing.id,{reason:'manual'});
    const src={id:sourceId(),label:info.kind==='sheet'?'Google Sheet':info.kind==='doc'?'Google Doc':'Google Drive file',location:'google',provider:'Google Drive',kind:info.kind,role:role||info.role,format:info.format,url:safeUrl(url)||String(url),googleFileId:info.id,exportUrl:info.exportUrl,autoRefresh:true,status:'pending',lastChecked:''};
    e.sources.push(src);this.saveRegistry();const result=await this.refreshSource(e.id,src.id,{reason:'add-google'});
    if(e.id===this.registry.activeCatalogId){await this.renderActive();this.emit('active-changed',{id:e.id,runtime:this.runtimePath(e.id),reason:'add-google'})}
    this.emit('catalogs-changed',this.summary());return{...result,catalogId:e.id,summary:this.summary()}
  }
  async refreshGoogleSources(){for(const e of this.registry.catalogs)for(const src of e.sources||[])if(src.location==='google'&&src.autoRefresh!==false)await this.refreshSource(e.id,src.id,{reason:'interval'}).catch(()=>{});}
  async refreshAll(catalogId=this.registry.activeCatalogId){const e=this.entry(catalogId);if(!e)return;for(const src of e.sources||[])await this.refreshSource(e.id,src.id,{reason:'manual'}).catch(()=>{});return this.summary()}
  async refreshAllCatalogs(){for(const e of this.registry.catalogs)await this.refreshAll(e.id);return this.summary()}
  async refreshSource(catalogId,sourceIdValue,{reason='manual'}={}){const e=this.entry(catalogId);const src=e?.sources?.find(x=>x.id===sourceIdValue);if(!e||!src)throw new Error('Source not found');const lock=`${catalogId}:${sourceIdValue}`;if(this.refreshing.has(lock))return{skipped:true,reason:'already-refreshing'};this.refreshing.add(lock);
    try{let buffer;if(src.location==='local'){buffer=fs.readFileSync(src.path)}else if(src.location==='google'){if(!this.liveSession)throw new Error('Live browser session unavailable');const headers={'Cache-Control':'no-cache','Pragma':'no-cache','Accept':'application/octet-stream,*/*;q=0.8'};if(src.etag&&isByteString(src.etag))headers['If-None-Match']=src.etag;if(src.lastModified&&isByteString(src.lastModified))headers['If-Modified-Since']=src.lastModified;const response=await this.googleRequest(src.exportUrl,{headers,timeoutMs:15000,redirects:8,headersForUrl:async currentUrl=>{const cookies=await this.liveSession.cookies.get({url:currentUrl});if(!cookies?.length)return{};return{Cookie:cookies.map(c=>`${c.name}=${c.value}`).join('; ')}}});if(response.status===304){src.status='current';src.error='';src.lastChecked=now();this.saveRegistry();this.emit('source-health',this.summary());return{changed:false,status:'current',conditional:true}}const type=String(response.headers?.['content-type']||'');if(response.status<200||response.status>=300)throw new Error(`Google source returned HTTP ${response.status}`);src.etag=String(response.headers?.etag||src.etag||'');src.lastModified=String(response.headers?.['last-modified']||src.lastModified||'');buffer=Buffer.from(response.buffer||[]);if(/text\/html/i.test(type)||/^\s*</.test(buffer.subarray(0,120).toString('utf8'))){src.status='sign-in-required';src.error='Sign into Google in an in-app browser tab, then refresh this source.';src.lastChecked=now();this.saveRegistry();this.emit('source-health',this.summary());return{changed:false,status:src.status}}}else throw new Error('Unsupported source location');
      const parsedResult=await ingestAsync(buffer,{filePath:src.path||`${src.label}.${src.format}`,format:src.format,title:src.label,sourceKey:src.id});const parsed=parsedResult.parsed,semantic=parsedSemantic(parsed);src.lastChecked=now();src.lastByteHash=parsedResult.hash;src.status='current';src.error='';if(src.lastSemanticHash===semantic){this.saveRegistry();this.emit('source-health',this.summary());return{changed:false,status:'current'}}src.lastSemanticHash=semantic;await this.applyParsed(e,src,parsed);if(e.id===this.registry.activeCatalogId){await this.renderActive();this.emit('active-updated',{id:e.id,runtime:this.runtimePath(),reason})}this.emit('catalogs-changed',this.summary());return{changed:true,status:'current',items:parsed.items?.length||0};
    }catch(err){src.status='error';src.error=String(err.message||err);src.lastChecked=now();this.saveRegistry();this.emit('source-health',this.summary());throw err}finally{this.refreshing.delete(lock)}}
  async applyParsed(entry,src,parsed){let snap=this.loadSnapshot(entry.id)||normalizeSnapshot({id:entry.id,name:entry.name,items:[],assets:{},documents:[]});if(src.role==='primary'&&parsed.items?.length){snap.items=mergeItems(snap.items,parsed.items);snap.assets=parsed.assets||{};snap.sourceMeta={...(snap.sourceMeta||{}),[src.id]:parsed.meta||{}}}else{snap.documents=(snap.documents||[]).filter(d=>d.sourceId!==src.id);for(const doc of parsed.documents||[])snap.documents.push({...doc,sourceId:src.id,extraction:parsed.meta||{}});snap.sourceMeta={...(snap.sourceMeta||{}),[src.id]:parsed.meta||{}}}snap.sources=entry.sources;snap.updatedAt=now();this.saveSnapshot(entry.id,snap);src.lastSemanticHash=parsedSemantic(parsed);src.status='current';src.lastChecked=now();entry.updatedAt=now();this.saveRegistry();return snap}
  async toggleSource(catalogId,sourceIdValue,enabled){const e=this.entry(catalogId),src=e?.sources?.find(x=>x.id===sourceIdValue);if(!src)throw new Error('Source not found');src.autoRefresh=!!enabled;const stop=this.watchers.get(src.id);if(stop&&!enabled){stop();this.watchers.delete(src.id)}else if(enabled)this.startLocalWatch(e,src);this.saveRegistry();this.emit('source-health',this.summary());return this.summary()}
  async removeSource(catalogId,sourceIdValue){const e=this.entry(catalogId);if(!e)throw new Error('Catalog not found');const idx=e.sources.findIndex(x=>x.id===sourceIdValue);if(idx<0)throw new Error('Source not found');const [src]=e.sources.splice(idx,1);const stop=this.watchers.get(src.id);if(stop){stop();this.watchers.delete(src.id)}this.saveRegistry();this.emit('catalogs-changed',this.summary());return this.summary()}
}
module.exports={CatalogStore,ingestAsync,inferGoogle,googleFileId,parsedSemantic,GOOGLE_REFRESH_MS,GOOGLE_INITIAL_REFRESH_MS,LOCAL_WATCH_MS};
