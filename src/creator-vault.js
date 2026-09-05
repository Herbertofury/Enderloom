'use strict';
const fs = require('fs');
const path = require('path');

const SCHEMA_VERSION = 1;
const cleanText = value => String(value == null ? '' : value).trim();
const unique = values => [...new Set((values || []).filter(Boolean))];
function readJson(file, fallback, diagnostics, label) {
  try {
    if (!fs.existsSync(file)) return fallback;
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch (error) {
    diagnostics.push({ level:'error', source:label, message:String(error && error.message || error) });
    return fallback;
  }
}
function timestampUrl(videoUrl, seconds) {
  const url = cleanText(videoUrl), n = Number(seconds);
  if (!url || !Number.isFinite(n) || n < 0) return url;
  try { const parsed = new URL(url); parsed.searchParams.set('t', `${Math.floor(n)}s`); return parsed.toString(); }
  catch { return url; }
}
function normalizeProvider(value, url) {
  const raw=cleanText(value), key=raw.toLowerCase(), target=cleanText(url);
  if (key==='curseforge') return 'CurseForge';
  if (key==='modrinth') return 'Modrinth';
  if (key==='github') return 'GitHub';
  if (key==='official') return 'Official';
  if (raw) return raw;
  if (/curseforge\.com/i.test(target)) return 'CurseForge';
  if (/modrinth\.com/i.test(target)) return 'Modrinth';
  if (/github\.com/i.test(target)) return 'GitHub';
  return target ? 'Official' : '';
}
function projectNameKey(value) {
  return cleanText(value).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
}
function projectSlug(value) {
  return projectNameKey(value).replace(/\band\b/g,'and').replace(/\s+/g,'-') || 'project';
}
function normalizeProviderLink(raw) {
  const row=raw && typeof raw==='object' ? raw : {};
  const url=cleanText(row.url);
  if (!url) return null;
  return { provider:normalizeProvider(row.provider,url), url, label:cleanText(row.label), verified:row.verified!==false };
}
function mergeProviderLinks(...groups) {
  const map=new Map();
  for (const raw of groups.flat()) {
    const link=normalizeProviderLink(raw); if(!link) continue;
    if(!/^https:\/\//i.test(link.url)) continue;
    const key=link.url.replace(/\/$/,'');
    if(!map.has(key)) map.set(key,link);
    else {
      const old=map.get(key);
      map.set(key,{...old,...link,label:link.label||old.label,verified:old.verified||link.verified});
    }
  }
  return [...map.values()].sort((a,b)=>String(a.provider).localeCompare(String(b.provider))||String(a.label).localeCompare(String(b.label))||String(a.url).localeCompare(String(b.url)));
}
function loadProjectRegistry(dir, diagnostics) {
  const docs=[];
  const primary=path.join(dir,'projects.json');
  if(fs.existsSync(primary)) docs.push(readJson(primary,{projects:[]},diagnostics,'projects.json'));
  const sourceDir=path.join(dir,'project-sources');
  if(fs.existsSync(sourceDir)) for(const name of fs.readdirSync(sourceDir).filter(name=>name.toLowerCase().endsWith('.json')).sort()) docs.push(readJson(path.join(sourceDir,name),{projects:[]},diagnostics,`project-sources/${name}`));
  const allRows=docs.flatMap(doc=>{if(Array.isArray(doc.projects))return doc.projects;if(Array.isArray(doc.entries)){const providers=doc.providers&&typeof doc.providers==='object'?doc.providers:{};return doc.entries.map(row=>({id:cleanText(row[0]),name:cleanText(row[1]),projectType:cleanText(row[2]||'mod'),aliases:Array.isArray(row[3])?row[3]:[],links:(Array.isArray(row[4])?row[4]:[]).map(link=>({provider:providers[link[0]]||link[0],url:link[1],label:link[2]||'',verified:true}))}));}return[];});
  const projects=[]; const byId=new Map(), byName=new Map();
  for(const raw of allRows) {
    const name=cleanText(raw && raw.name); const id=cleanText(raw && raw.id)||projectSlug(name);
    if(!id||!name){diagnostics.push({level:'warning',source:'projects.json',message:'Skipped canonical project missing id or name.'});continue;}
    const row={...raw,id,name,aliases:unique((Array.isArray(raw.aliases)?raw.aliases:[]).map(cleanText)),projectType:cleanText(raw.projectType||'mod'),links:mergeProviderLinks(Array.isArray(raw.links)?raw.links:[])};
    let target=byId.get(id);
    if(target){
      if(projectNameKey(target.name)!==projectNameKey(row.name)) target.aliases=unique([...target.aliases,row.name]);
      target.aliases=unique([...target.aliases,...row.aliases]);
      target.links=mergeProviderLinks(target.links,row.links);
      if(!target.projectType&&row.projectType) target.projectType=row.projectType;
    }else{
      target=row; byId.set(id,target); projects.push(target);
    }
    for(const alias of [target.name,...target.aliases]){const key=projectNameKey(alias); if(key && !byName.has(key)) byName.set(key,target); else if(key && byName.get(key)!==target) diagnostics.push({level:'warning',source:'projects.json',message:`Ambiguous canonical project alias: ${alias}`});}
  }
  return {schemaVersion:1,updatedAt:docs.map(doc=>cleanText(doc.updatedAt)).filter(Boolean).sort().pop()||'',strategy:docs.map(doc=>cleanText(doc.strategy)).find(Boolean)||'',projects,byId,byName};
}
function resolveProject(name, projectType, registry) {
  const key=projectNameKey(name), known=registry && registry.byName ? registry.byName.get(key) : null;
  if(known) return known;
  return {id:projectSlug(name),name:cleanText(name),aliases:[],projectType:cleanText(projectType||'mod'),links:[]};
}
function normalizeCreator(raw) {
  const creator=raw&&typeof raw==='object'?raw:{};
  return {...creator,id:cleanText(creator.id),title:cleanText(creator.title||creator.handle||creator.id),platform:cleanText(creator.platform).toLowerCase(),handle:cleanText(creator.handle),url:cleanText(creator.url),role:cleanText(creator.role||'recommended'),required:creator.required===true,status:cleanText(creator.status||'queued'),wikiStatus:cleanText(creator.wikiStatus||'tracked'),coverage:creator.coverage&&typeof creator.coverage==='object'?{...creator.coverage}:{complete:false,state:'queued'}};
}
function normalizeMod(raw, video, registry) {
  const mod=raw&&typeof raw==='object'?raw:{}, seconds=Number(mod.timestampSeconds), rawUrl=cleanText(mod.url);
  const project=resolveProject(mod.canonicalName||mod.name,mod.projectType,registry);
  const nativeLink=rawUrl?{provider:normalizeProvider(mod.provider,rawUrl),url:rawUrl,verified:true}:null;
  const providerLinks=mergeProviderLinks(project.links,nativeLink?[nativeLink]:[],Array.isArray(mod.providerLinks)?mod.providerLinks:[]);
  const preferred=nativeLink||providerLinks[0]||null;
  return {...mod,name:cleanText(mod.name),projectType:cleanText(mod.projectType||project.projectType||'mod'),canonicalProjectId:project.id,canonicalName:project.name,canonicalProjectType:project.projectType||cleanText(mod.projectType||'mod'),providerLinks,url:preferred?preferred.url:'',provider:preferred?preferred.provider:'',loader:unique(Array.isArray(mod.loader)?mod.loader.map(cleanText):[]),timestamp:cleanText(mod.timestamp),timestampSeconds:Number.isFinite(seconds)&&seconds>=0?seconds:null,videoLink:cleanText(mod.videoLink)||timestampUrl(video.url,seconds),evidence:cleanText(mod.evidence),sourceKinds:unique(Array.isArray(mod.sourceKinds)?mod.sourceKinds.map(cleanText):[]),confidence:Number.isFinite(Number(mod.confidence))?Number(mod.confidence):null};
}
function normalizeVideo(raw, registry) {
  const video=raw&&typeof raw==='object'?raw:{};
  const out={...video,id:cleanText(video.id),creatorId:cleanText(video.creatorId),platform:cleanText(video.platform||'youtube').toLowerCase(),url:cleanText(video.url),title:cleanText(video.title),publishedAt:cleanText(video.publishedAt),evidenceKinds:unique(Array.isArray(video.evidenceKinds)?video.evidenceKinds.map(cleanText):[]),mods:[]};
  out.mods=(Array.isArray(video.mods)?video.mods:[]).map(mod=>normalizeMod(mod,out,registry)).filter(mod=>mod.name);
  return out;
}
function dedupeById(rows, diagnostics, source) {
  const seen=new Set(),out=[];
  for(const row of rows||[]){const id=cleanText(row&&row.id);if(!id){diagnostics.push({level:'warning',source,message:'Skipped record without an id.'});continue;}if(seen.has(id)){diagnostics.push({level:'warning',source,message:`Skipped duplicate id: ${id}`});continue;}seen.add(id);out.push(row);}
  return out;
}
function normalizeImportedVideo(raw, entry, registry) {
  const platform=cleanText(raw&&raw.platform||'youtube').toLowerCase()||'youtube', sourceId=cleanText(raw&&raw.id), mods=Array.isArray(raw&&raw.mods)?raw.mods:[];
  const sourceEvidenceKinds=unique(mods.flatMap(mod=>Array.isArray(mod&&mod.sourceKinds)?mod.sourceKinds.map(cleanText):[]));
  return normalizeVideo({...raw,id:sourceId?`${platform}:${sourceId}`:'',creatorId:cleanText(entry.creatorId),platform,evidenceKinds:unique([...(Array.isArray(raw&&raw.evidenceKinds)?raw.evidenceKinds:[]),...sourceEvidenceKinds,'legacy-catalog']),importId:cleanText(entry.id),importSourceSystem:cleanText(entry.sourceSystem),importSourceDriveFileId:cleanText(entry.sourceDriveFileId)},registry);
}
function loadImportedVideos(dir, diagnostics, registry) {
  const importsDoc=readJson(path.join(dir,'imports.json'),{imports:[]},diagnostics,'imports.json'),videos=[],imports=[];
  for(const rawEntry of Array.isArray(importsDoc.imports)?importsDoc.imports:[]){const entry=rawEntry&&typeof rawEntry==='object'?{...rawEntry}:{};const importId=cleanText(entry.id),creatorId=cleanText(entry.creatorId);const fileRows=Array.isArray(entry.files)&&entry.files.length?entry.files.map(row=>typeof row==='string'?{file:row}:row):(cleanText(entry.file)?[{file:entry.file}]:[]);if(!importId||!creatorId||!fileRows.length){diagnostics.push({level:'warning',source:'imports.json',message:'Skipped creator import missing id, creatorId, or file(s).'});continue;}const imported=[];let failed=false;for(const fileRow of fileRows){const relativeFile=cleanText(fileRow&&fileRow.file),absolute=path.resolve(dir,relativeFile),safeRoot=path.resolve(dir)+path.sep;if(!relativeFile||!absolute.startsWith(safeRoot)){diagnostics.push({level:'error',source:'imports.json',message:`Rejected creator import outside Creator Vault directory: ${relativeFile}`});failed=true;continue;}if(!fs.existsSync(absolute)){diagnostics.push({level:'error',source:'imports.json',message:`Creator import file is missing: ${relativeFile}`});failed=true;continue;}const catalog=readJson(absolute,null,diagnostics,relativeFile);if(!catalog||!Array.isArray(catalog.videos)){failed=true;continue;}imported.push(...catalog.videos.map(video=>normalizeImportedVideo(video,entry,registry)).filter(video=>video.id));}if(failed)continue;videos.push(...imported);imports.push({id:importId,creatorId,files:fileRows.map(row=>({file:cleanText(row.file),sha256:cleanText(row.sha256),videos:Number(row.videos)||0,recommendations:Number(row.recommendations)||0})),sourceSystem:cleanText(entry.sourceSystem),sourceDriveFileId:cleanText(entry.sourceDriveFileId),sourceUpdatedAt:cleanText(entry.sourceUpdatedAt),sourceDriveSha256:cleanText(entry.sourceDriveSha256),sourceSnapshotSha256:cleanText(entry.sourceSnapshotSha256),expectedVideos:Number.isFinite(Number(entry.expectedVideos))?Number(entry.expectedVideos):null,videos:imported.length,recommendations:imported.reduce((sum,video)=>sum+video.mods.length,0)});}
  return {videos,imports,updatedAt:cleanText(importsDoc.updatedAt)};
}
function expandRecommendationDocument(doc) {
  if(!doc||typeof doc!=='object')return{videos:[],channelSetupPacks:[],queuedDiscoveries:[]};const defaults=doc.defaults&&typeof doc.defaults==='object'?doc.defaults:{};const videos=(Array.isArray(doc.videos)?doc.videos:[]).map(rawVideo=>{if(!Array.isArray(rawVideo&&rawVideo.entries))return rawVideo;const video={...rawVideo,creatorId:cleanText(rawVideo.creatorId||defaults.creatorId),platform:cleanText(rawVideo.platform||defaults.platform||'youtube')};video.mods=rawVideo.entries.map(row=>{const values=Array.isArray(row)?row:[];return{name:cleanText(values[0]),timestamp:cleanText(values[1]),timestampSeconds:Number(values[2]),loader:Array.isArray(values[3])?values[3]:[],projectType:cleanText(defaults.projectType||'mod'),evidence:cleanText(defaults.evidence),sourceKinds:Array.isArray(defaults.sourceKinds)?defaults.sourceKinds:[],confidence:Number.isFinite(Number(defaults.confidence))?Number(defaults.confidence):null};});delete video.entries;return video;});return{...doc,videos};
}
function loadRecommendationDocuments(dir, diagnostics) {
  const docs=[],primaryFile=path.join(dir,'recommendations.json');docs.push({source:'recommendations.json',doc:expandRecommendationDocument(readJson(primaryFile,{videos:[],channelSetupPacks:[],queuedDiscoveries:[]},diagnostics,'recommendations.json'))});const sourceDir=path.join(dir,'recommendation-sources');if(fs.existsSync(sourceDir)){for(const name of fs.readdirSync(sourceDir).filter(name=>name.toLowerCase().endsWith('.json')).sort()){const relative=path.join('recommendation-sources',name).replace(/\\/g,'/');docs.push({source:relative,doc:expandRecommendationDocument(readJson(path.join(sourceDir,name),{videos:[],channelSetupPacks:[],queuedDiscoveries:[]},diagnostics,relative))});}}return{videos:docs.flatMap(({doc})=>Array.isArray(doc.videos)?doc.videos:[]),channelSetupPacks:docs.flatMap(({doc})=>Array.isArray(doc.channelSetupPacks)?doc.channelSetupPacks:[]),queuedDiscoveries:docs.flatMap(({doc})=>Array.isArray(doc.queuedDiscoveries)?doc.queuedDiscoveries:[]),updatedAt:docs.map(({doc})=>cleanText(doc.updatedAt)).filter(Boolean).sort().pop()||'',strategy:docs.map(({doc})=>cleanText(doc.strategy)).find(Boolean)||'',sources:docs.map(({source})=>source)};
}
function normalizeSetupPack(pack, registry) {
  const row=pack&&typeof pack==='object'?pack:{},project=resolveProject(row.canonicalName||row.name,row.projectType||'resourcepack',registry);const providerLinks=mergeProviderLinks(project.links,Array.isArray(row.providerLinks)?row.providerLinks:[],row.url?[{provider:row.provider,url:row.url,verified:true}]:[]);
  return {...row,name:cleanText(row.name),canonicalProjectId:project.id,canonicalName:project.name,projectType:cleanText(row.projectType||project.projectType||'resourcepack'),creatorId:cleanText(row.creatorId),evidence:cleanText(row.evidence),sourceVideoIds:unique(Array.isArray(row.sourceVideoIds)?row.sourceVideoIds.map(cleanText):[]),providerLinks,url:providerLinks[0]?.url||'',provider:providerLinks[0]?.provider||''};
}
function buildProjectIndex(videos, registry) {
  const map=new Map();
  for(const video of videos){for(const mod of video.mods||[]){const id=mod.canonicalProjectId||projectSlug(mod.name),reg=registry.byId.get(id);let p=map.get(id);if(!p){p={id,name:mod.canonicalName||reg?.name||mod.name,aliases:unique([...(reg?.aliases||[]),mod.name!==mod.canonicalName?mod.name:'']),projectTypes:[],providerLinks:mergeProviderLinks(reg?.links||[],mod.providerLinks||[]),mentions:[],creatorIds:[],videoIds:[]};map.set(id,p);}p.aliases=unique([...p.aliases,...(reg?.aliases||[]),mod.name!==p.name?mod.name:'']);p.projectTypes=unique([...p.projectTypes,mod.projectType||reg?.projectType||'mod']);p.providerLinks=mergeProviderLinks(p.providerLinks,mod.providerLinks||[]);p.creatorIds=unique([...p.creatorIds,video.creatorId]);p.videoIds=unique([...p.videoIds,video.id]);p.mentions.push({creatorId:video.creatorId,videoId:video.id,videoTitle:video.title,publishedAt:video.publishedAt,name:mod.name,canonicalName:p.name,projectType:mod.projectType,loader:mod.loader||[],timestamp:mod.timestamp,timestampSeconds:mod.timestampSeconds,videoLink:mod.videoLink||video.url,evidence:mod.evidence,sourceKinds:mod.sourceKinds||[]});}}
  for(const p of map.values()){p.projectType=p.projectTypes[0]||'mod';p.mentionCount=p.mentions.length;p.aliases=unique(p.aliases.filter(x=>x&&projectNameKey(x)!==projectNameKey(p.name)));}
  return [...map.values()].sort((a,b)=>String(a.name).localeCompare(String(b.name)));
}
function loadCreatorVault(rootDir) {
  const diagnostics=[],dir=path.join(rootDir,'catalog','creator-vault'),creatorsDoc=readJson(path.join(dir,'creators.json'),{creators:[]},diagnostics,'creators.json'),registry=loadProjectRegistry(dir,diagnostics),recDoc=loadRecommendationDocuments(dir,diagnostics),imported=loadImportedVideos(dir,diagnostics,registry),creators=dedupeById((Array.isArray(creatorsDoc.creators)?creatorsDoc.creators:[]).map(normalizeCreator),diagnostics,'creators.json');
  const nativeVideos=(Array.isArray(recDoc.videos)?recDoc.videos:[]).map(video=>normalizeVideo(video,registry)),videos=dedupeById([...nativeVideos,...imported.videos],diagnostics,'creator-vault videos'),creatorIds=new Set(creators.map(x=>x.id));for(const video of videos)if(video.creatorId&&!creatorIds.has(video.creatorId))diagnostics.push({level:'warning',source:'recommendations.json',message:`Video ${video.id} references unknown creator ${video.creatorId}.`});
  const channelSetupPacks=(Array.isArray(recDoc.channelSetupPacks)?recDoc.channelSetupPacks:[]).map(pack=>normalizeSetupPack(pack,registry)).filter(pack=>pack.name),projects=buildProjectIndex(videos,registry),recommendationCount=videos.reduce((sum,video)=>sum+video.mods.length,0),indexedCreators=new Set(videos.map(video=>video.creatorId).filter(Boolean)).size,verifiedProjects=projects.filter(p=>p.providerLinks.length).length,multiProviderProjects=projects.filter(p=>new Set(p.providerLinks.map(l=>l.provider)).size>1).length,providerDestinations=projects.reduce((sum,p)=>sum+p.providerLinks.length,0),updatedAt=[cleanText(creatorsDoc.updatedAt),cleanText(recDoc.updatedAt),cleanText(imported.updatedAt),cleanText(registry.updatedAt)].filter(Boolean).sort().pop()||'';
  return{schemaVersion:SCHEMA_VERSION,updatedAt,strategy:cleanText(creatorsDoc.strategy||recDoc.strategy||'full-history-first/incremental-after'),creators,videos,projects,imports:imported.imports,channelSetupPacks,stats:{creators:creators.length,indexedCreators,videos:videos.length,recommendations:recommendationCount,uniqueProjects:projects.length,verifiedProjects,unresolvedProjects:projects.length-verifiedProjects,multiProviderProjects,providerDestinations,verifiedHomes:verifiedProjects,importedCatalogs:imported.imports.length,nativeRecommendationSources:recDoc.sources.length,setupPacks:channelSetupPacks.length},diagnostics};
}
module.exports={SCHEMA_VERSION,loadCreatorVault,loadRecommendationDocuments,expandRecommendationDocument,normalizeCreator,normalizeVideo,normalizeMod,normalizeProvider,normalizeImportedVideo,loadImportedVideos,loadProjectRegistry,resolveProject,buildProjectIndex,normalizeProviderLink,mergeProviderLinks,projectNameKey,projectSlug,timestampUrl};
