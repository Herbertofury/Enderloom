'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {
  loadCreatorVault,
  projectNameKey,
  projectSlug,
  mergeProviderLinks,
  normalizeProvider,
} = require('./creator-vault');
const { requestText, requestJson } = require('./public-http');

let electron = null;
try {
  const candidate = require('electron');
  if (candidate && typeof candidate === 'object' && candidate.ipcMain && candidate.app) electron = candidate;
} catch {}

const SCHEMA_VERSION = 1;
const ROOT_DIR = path.resolve(__dirname, '..');
const PARTITION = 'persist:minecraft-catalog-live';
const DEFAULT_SETTINGS = Object.freeze({
  autoSyncOnLaunch: true,
  launchCooldownHours: 12,
  maxIncrementalVideosPerCreator: 12,
  browserHistoryScrollPasses: 140,
});
const PROJECT_HOST = /(?:^|\.)(?:modrinth\.com|curseforge\.com|github\.com|gitlab\.com|planetminecraft\.com|mcpedl\.com|modbay\.org|spigotmc\.org|hangar\.papermc\.io|moddb\.com|nexusmods\.com)$/i;
const SOCIAL_HOST = /(?:^|\.)(?:youtube\.com|youtu\.be|tiktok\.com|discord\.gg|discord\.com|twitter\.com|x\.com|instagram\.com|facebook\.com|patreon\.com|ko-fi\.com)$/i;
const PROVIDER_PATH = /\/(?:mod|modpack|resourcepack|shader|datapack|plugin|minecraft\/mc-mods|minecraft\/modpacks|minecraft\/texture-packs|minecraft\/shaders|minecraft\/data-packs)\//i;

let ipcRegistered = false;
let launchScheduled = false;
let syncFlight = null;

const now = () => new Date().toISOString();
const clean = value => String(value == null ? '' : value).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
const unique = values => [...new Set((values || []).filter(Boolean))];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
function safeUrl(value) {
  try {
    const u = new URL(String(value || '').trim());
    return /^https?:$/.test(u.protocol) ? u.toString() : '';
  } catch { return ''; }
}
function urlKey(value) {
  try {
    const u = new URL(String(value || ''));
    u.hash = '';
    for (const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','ref','source']) u.searchParams.delete(key);
    return u.toString().replace(/\/$/, '').toLowerCase();
  } catch { return String(value || '').trim().replace(/\/$/, '').toLowerCase(); }
}
function providerForUrl(value) {
  const url = safeUrl(value);
  if (!url) return '';
  const host = new URL(url).hostname.toLowerCase();
  if (host === 'modrinth.com' || host.endsWith('.modrinth.com')) return 'Modrinth';
  if (host === 'curseforge.com' || host.endsWith('.curseforge.com')) return 'CurseForge';
  if (host === 'github.com' || host.endsWith('.github.com')) return 'GitHub';
  if (host === 'gitlab.com' || host.endsWith('.gitlab.com')) return 'GitLab';
  return 'Official';
}
function runtimeDir() {
  if (process.env.ENDERLOOM_CREATOR_VAULT_RUNTIME_DIR) return path.resolve(process.env.ENDERLOOM_CREATOR_VAULT_RUNTIME_DIR);
  if (electron?.app && electron.app.isReady?.()) return path.join(electron.app.getPath('userData'), 'creator-vault-auto');
  return '';
}
function runtimeFile() { const dir = runtimeDir(); return dir ? path.join(dir, 'state.json') : ''; }
function emptyRuntimeState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    updatedAt: '',
    settings: { ...DEFAULT_SETTINGS },
    creators: [],
    videos: [],
    projects: [],
    review: [],
    sync: { state:'idle', lastRunAt:'', lastSuccessfulRunAt:'', trigger:'', creatorId:'', error:'', creators:{} },
  };
}
function readRuntimeState() {
  const file = runtimeFile();
  if (!file || !fs.existsSync(file)) return emptyRuntimeState();
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8')) || {};
    return {
      ...emptyRuntimeState(),
      ...raw,
      settings: { ...DEFAULT_SETTINGS, ...(raw.settings || {}) },
      sync: { ...emptyRuntimeState().sync, ...(raw.sync || {}), creators:{...(raw.sync?.creators || {})} },
      creators: Array.isArray(raw.creators) ? raw.creators : [],
      videos: Array.isArray(raw.videos) ? raw.videos : [],
      projects: Array.isArray(raw.projects) ? raw.projects : [],
      review: Array.isArray(raw.review) ? raw.review : [],
    };
  } catch {
    return emptyRuntimeState();
  }
}
function writeRuntimeState(state) {
  const file = runtimeFile();
  if (!file) return false;
  fs.mkdirSync(path.dirname(file), { recursive:true });
  const next = { ...state, schemaVersion:SCHEMA_VERSION, updatedAt:now() };
  const tmp = `${file}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(next, null, 2));
  fs.renameSync(tmp, file);
  return true;
}
function mergeCreator(base, override) {
  return {
    ...(base || {}),
    ...(override || {}),
    coverage: { ...((base || {}).coverage || {}), ...((override || {}).coverage || {}) },
  };
}
function cloneProject(project) {
  return {
    ...project,
    aliases: unique([...(project.aliases || [])]),
    projectTypes: unique([...(project.projectTypes || []), project.projectType].filter(Boolean)),
    providerLinks: mergeProviderLinks(project.providerLinks || [], project.links || []),
    mentions: [],
    creatorIds: [],
    videoIds: [],
  };
}
function mergeProject(target, row) {
  target.aliases = unique([...(target.aliases || []), ...(row.aliases || []), row.name && row.name !== target.name ? row.name : '']);
  target.projectTypes = unique([...(target.projectTypes || []), ...(row.projectTypes || []), row.projectType].filter(Boolean));
  target.providerLinks = mergeProviderLinks(target.providerLinks || [], row.providerLinks || [], row.links || []);
  if (!target.name && row.name) target.name = row.name;
  return target;
}
function normalizeRuntimeVideo(video, projectMap) {
  const out = { ...video, id:clean(video.id), creatorId:clean(video.creatorId), platform:clean(video.platform || 'youtube').toLowerCase(), url:safeUrl(video.url), title:clean(video.title), publishedAt:clean(video.publishedAt), evidenceKinds:unique(video.evidenceKinds || []) };
  out.mods = (Array.isArray(video.mods) ? video.mods : []).map(raw => {
    const name = clean(raw.name || raw.canonicalName);
    let project = projectMap.get(clean(raw.canonicalProjectId));
    if (!project) {
      const key = projectNameKey(raw.canonicalName || name);
      project = [...projectMap.values()].find(p => [p.name, ...(p.aliases || [])].some(label => projectNameKey(label) === key));
    }
    const canonicalProjectId = project?.id || clean(raw.canonicalProjectId) || projectSlug(raw.canonicalName || name);
    const canonicalName = project?.name || clean(raw.canonicalName) || name;
    const providerLinks = mergeProviderLinks(project?.providerLinks || [], raw.providerLinks || [], raw.url ? [{provider:raw.provider || providerForUrl(raw.url), url:raw.url, verified:true}] : []);
    const seconds = Number(raw.timestampSeconds);
    const videoLink = safeUrl(raw.videoLink) || (() => { try { const u=new URL(out.url); if(Number.isFinite(seconds)&&seconds>=0)u.searchParams.set('t',`${Math.floor(seconds)}s`); return u.toString(); } catch { return out.url; } })();
    return { ...raw, name, canonicalProjectId, canonicalName, projectType:clean(raw.projectType || project?.projectTypes?.[0] || 'mod'), providerLinks, url:providerLinks[0]?.url || '', provider:providerLinks[0]?.provider || '', timestampSeconds:Number.isFinite(seconds)&&seconds>=0?seconds:null, videoLink };
  }).filter(mod => mod.name);
  return out;
}
function loadMergedCreatorVault(rootDir = ROOT_DIR) {
  const base = loadCreatorVault(rootDir);
  const state = readRuntimeState();
  if (!state.videos.length && !state.projects.length && !state.creators.length) return { ...base, runtime:{...state.sync, reviewCount:state.review.filter(x=>x.status!=='ignored').length, settings:state.settings} };

  const creatorMap = new Map((base.creators || []).map(c => [c.id, { ...c, coverage:{...(c.coverage || {})} }]));
  for (const row of state.creators) {
    if (!row?.id) continue;
    creatorMap.set(row.id, mergeCreator(creatorMap.get(row.id), row));
  }

  const projectMap = new Map();
  for (const row of base.projects || []) projectMap.set(row.id, cloneProject(row));
  for (const row of state.projects || []) {
    const id = clean(row.id) || projectSlug(row.name);
    if (!id || !clean(row.name)) continue;
    if (projectMap.has(id)) mergeProject(projectMap.get(id), { ...row, id });
    else projectMap.set(id, cloneProject({ ...row, id }));
  }

  const videoMap = new Map((base.videos || []).map(video => [video.id, normalizeRuntimeVideo(video, projectMap)]));
  for (const video of state.videos || []) if (video?.id) videoMap.set(video.id, normalizeRuntimeVideo(video, projectMap));
  const videos = [...videoMap.values()];

  for (const project of projectMap.values()) { project.mentions=[]; project.creatorIds=[]; project.videoIds=[]; }
  for (const video of videos) {
    for (const mod of video.mods || []) {
      let project = projectMap.get(mod.canonicalProjectId);
      if (!project) {
        project = cloneProject({ id:mod.canonicalProjectId || projectSlug(mod.canonicalName || mod.name), name:mod.canonicalName || mod.name, aliases:mod.name && mod.name !== mod.canonicalName ? [mod.name] : [], projectTypes:[mod.projectType || 'mod'], providerLinks:mod.providerLinks || [] });
        projectMap.set(project.id, project);
      }
      mod.canonicalProjectId = project.id;
      mod.canonicalName = project.name;
      mod.providerLinks = mergeProviderLinks(project.providerLinks || [], mod.providerLinks || []);
      project.aliases = unique([...(project.aliases || []), mod.name !== project.name ? mod.name : '']);
      project.projectTypes = unique([...(project.projectTypes || []), mod.projectType || 'mod']);
      project.providerLinks = mergeProviderLinks(project.providerLinks || [], mod.providerLinks || []);
      project.creatorIds = unique([...(project.creatorIds || []), video.creatorId]);
      project.videoIds = unique([...(project.videoIds || []), video.id]);
      project.mentions.push({
        creatorId:video.creatorId, videoId:video.id, videoTitle:video.title, publishedAt:video.publishedAt,
        name:mod.name, canonicalName:project.name, projectType:mod.projectType, timestamp:mod.timestamp || '', timestampSeconds:mod.timestampSeconds,
        videoLink:mod.videoLink || video.url, evidence:mod.evidence || '', loader:mod.loader || [], sourceKinds:mod.sourceKinds || [],
      });
    }
  }
  const projects = [...projectMap.values()].filter(p => p.mentions.length).sort((a,b)=>String(a.name).localeCompare(String(b.name)));
  const recommendationCount = videos.reduce((n,v)=>n+(v.mods||[]).length,0);
  const verifiedProjects = projects.filter(p=>(p.providerLinks||[]).length).length;
  const providerDestinations = projects.reduce((n,p)=>n+(p.providerLinks||[]).length,0);
  const multiProviderProjects = projects.filter(p=>new Set((p.providerLinks||[]).map(l=>l.provider)).size>1).length;
  const creators = [...creatorMap.values()];
  return {
    ...base,
    updatedAt: [base.updatedAt, state.updatedAt].filter(Boolean).sort().pop() || '',
    creators,
    videos,
    projects,
    stats: {
      ...base.stats,
      creators:creators.length,
      indexedCreators:new Set(videos.map(v=>v.creatorId).filter(Boolean)).size,
      videos:videos.length,
      recommendations:recommendationCount,
      uniqueProjects:projects.length,
      verifiedProjects,
      unresolvedProjects:projects.length-verifiedProjects,
      multiProviderProjects,
      providerDestinations,
      verifiedHomes:verifiedProjects,
    },
    runtime:{...state.sync, reviewCount:state.review.filter(x=>x.status!=='ignored').length, settings:state.settings, review:state.review.filter(x=>x.status!=='ignored').slice(-100).reverse()},
  };
}

function htmlDecode(value) {
  return String(value || '')
    .replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
}
function extractUrls(text) {
  return unique((String(text || '').match(/https?:\/\/[^\s<>"')\]]+/gi) || []).map(value=>value.replace(/[.,;:!?]+$/,''))).map(unwrapYouTubeRedirect).filter(Boolean);
}
function unwrapYouTubeRedirect(value) {
  const url = safeUrl(value);
  if (!url) return '';
  try {
    const u = new URL(url);
    if (/youtube\.com$/i.test(u.hostname) && /\/redirect$/i.test(u.pathname)) return safeUrl(u.searchParams.get('q') || u.searchParams.get('url')) || url;
  } catch {}
  return url;
}
function projectLink(url) {
  try {
    const u = new URL(url);
    if (SOCIAL_HOST.test(u.hostname)) return false;
    return PROJECT_HOST.test(u.hostname) || PROVIDER_PATH.test(u.pathname);
  } catch { return false; }
}
function parseTimestamp(line) {
  const match = String(line || '').match(/(?:^|\s|[-–—|[(])((?:\d{1,2}:)?\d{1,2}:\d{2})(?=\s|$|[-–—|)\]])/);
  if (!match) return { timestamp:'', seconds:null };
  const parts = match[1].split(':').map(Number);
  const seconds = parts.length===3 ? parts[0]*3600+parts[1]*60+parts[2] : parts[0]*60+parts[1];
  return { timestamp:match[1], seconds:Number.isFinite(seconds)?seconds:null };
}
function headingInfo(line, videoTitle='') {
  const raw = clean(line).replace(/^#+\s*/, '').replace(/[:：]\s*$/, '').trim();
  if (!raw || raw.length > 70) return null;
  const key = raw.toLowerCase().replace(/[^a-z0-9+ ]+/g,' ').replace(/\s+/g,' ').trim();
  const map = [
    [/^(mods?|mod list|mods used|recommended mods|minecraft mods)$/,'mod'],
    [/^(addons?|add ons?)$/,'mod'],
    [/^(resource ?packs?|texture ?packs?)$/,'resourcepack'],
    [/^(shaders?|shader ?packs?)$/,'shader'],
    [/^(data ?packs?|datapacks?)$/,'datapack'],
    [/^(plugins?)$/,'plugin'],
  ];
  for (const [pattern,type] of map) if (pattern.test(key)) return { kind:'include', type, key };
  if (/^(music|songs?|socials?|social media|sponsors?|sponsored|credits?|setup|links?|other links?|support|contact|gear|pc specs?)$/.test(key)) return {kind:'exclude',type:'',key};
  if (/^(intro|outro)$/.test(key) || /\boutro\b/.test(key)) return {kind:'outro',type:'',key};
  const inline = raw.match(/^(mods?|addons?|resource ?packs?|texture ?packs?|shaders?|data ?packs?|datapacks?|plugins?)\s*[:：-]\s*(.+)$/i);
  if (inline) {
    const label = inline[1].toLowerCase();
    const type = /resource|texture/.test(label)?'resourcepack':/shader/.test(label)?'shader':/data/.test(label)?'datapack':/plugin/.test(label)?'plugin':'mod';
    return {kind:'inline',type,items:inline[2],key:label};
  }
  return null;
}
function cleanCandidateName(line, urls, timestamp) {
  let value = htmlDecode(String(line || ''));
  if (timestamp) value = value.replace(timestamp, ' ');
  for (const url of urls || []) value = value.split(url).join(' ');
  value = value.replace(/^[\s•*#|>\-–—.:]+/, '').replace(/[\s|\-–—.:]+$/, '').replace(/\s+/g,' ').trim();
  value = value.replace(/^(?:mod|addon|resource pack|shader|datapack|plugin)\s*\d*\s*[:.)-]\s*/i,'').trim();
  if (/^(intro|outro|minecraft forge|forge|fabric|neoforge|quilt|music|song|sponsor|sponsored)$/i.test(value)) return '';
  if (value.length < 2 || value.length > 140) return '';
  return value;
}
function parseCreatorDescription({text='', title='', platform='youtube', links=[]} = {}) {
  const rawLines = String(text || '').replace(/\r/g,'').split('\n').map(x=>htmlDecode(x).trim()).filter(Boolean);
  const candidates=[];
  let active=false, sectionType='mod', afterOutro=false, sawProjectSection=false, last=null;
  const push = row => {
    const key = projectNameKey(row.name);
    if (!key) return;
    const existing = candidates.find(x=>projectNameKey(x.name)===key);
    if (existing) {
      existing.urls = unique([...(existing.urls||[]), ...(row.urls||[])]);
      if (existing.timestampSeconds==null && row.timestampSeconds!=null) { existing.timestamp=row.timestamp; existing.timestampSeconds=row.timestampSeconds; }
      existing.confidence=Math.max(existing.confidence||0,row.confidence||0);
      return existing;
    }
    candidates.push(row); last=row; return row;
  };
  for (let index=0; index<rawLines.length; index++) {
    const line=rawLines[index];
    const ts=parseTimestamp(line);
    const withoutTs = ts.timestamp ? line.replace(ts.timestamp,' ').replace(/^[\s\-–—|:.)]+/,'').trim() : line;
    const heading=headingInfo(withoutTs,title);
    if (heading?.kind==='outro' || (/\boutro\b/i.test(withoutTs) && ts.seconds!=null)) { afterOutro=true; active=false; continue; }
    if (heading?.kind==='exclude') { active=false; continue; }
    if (heading?.kind==='include') {
      sawProjectSection=true;
      const titleWants=heading.type==='shader'?/shader/i.test(title):heading.type==='resourcepack'?/resource|texture/i.test(title):true;
      active=!afterOutro || titleWants;
      sectionType=heading.type;
      continue;
    }
    if (heading?.kind==='inline') {
      sawProjectSection=true; active=!afterOutro; sectionType=heading.type;
      for (const item of heading.items.split(/\s*(?:,|;|\||\s\+\s)\s*/).map(clean).filter(Boolean)) {
        const urls=extractUrls(item), name=cleanCandidateName(item,urls,'');
        if(name)push({name,projectType:sectionType,timestamp:'',timestampSeconds:null,urls:urls.filter(projectLink),confidence:urls.some(projectLink)?0.9:0.82,evidence:'Creator-authored inline project list',sourceKinds:[platform,'description']});
      }
      continue;
    }
    const urls=extractUrls(line), providerUrls=urls.filter(projectLink);
    if (urls.length && !withoutTs.replace(/https?:\/\/\S+/g,'').trim() && last && active) {
      last.urls=unique([...(last.urls||[]),...providerUrls]);
      if(providerUrls.length)last.confidence=Math.max(last.confidence||0,0.94);
      continue;
    }
    const inProjectContext = active || (!sawProjectSection && ts.seconds!=null);
    if (!inProjectContext) continue;
    const name=cleanCandidateName(line,urls,ts.timestamp);
    if (!name) continue;
    const confidence = providerUrls.length && ts.seconds!=null ? 0.99 : ts.seconds!=null ? 0.96 : providerUrls.length ? 0.92 : active ? 0.8 : 0.65;
    if (confidence < 0.78) continue;
    push({name,projectType:sectionType,timestamp:ts.timestamp,timestampSeconds:ts.seconds,urls:providerUrls,confidence,evidence:'Creator-authored description/caption project list',sourceKinds:[platform,'description']});
  }
  for (const link of Array.isArray(links)?links:[]) {
    const href=unwrapYouTubeRedirect(typeof link==='string'?link:link?.href), label=clean(typeof link==='string'?'':link?.text);
    if(!href||!projectLink(href)||!label)continue;
    const hit=candidates.find(row=>projectNameKey(row.name)===projectNameKey(label));
    if(hit){hit.urls=unique([...(hit.urls||[]),href]);hit.confidence=Math.max(hit.confidence||0,0.96);}
  }
  return candidates;
}
function extractBalancedJson(text, marker) {
  const source=String(text||'');let from=source.indexOf(marker);if(from<0)return null;from=source.indexOf('{',from+marker.length);if(from<0)return null;
  let depth=0,inString=false,escape=false;
  for(let i=from;i<source.length;i++){
    const ch=source[i];if(inString){if(escape)escape=false;else if(ch==='\\')escape=true;else if(ch==='"')inString=false;continue;}if(ch==='"'){inString=true;continue}if(ch==='{')depth++;else if(ch==='}'){depth--;if(depth===0){try{return JSON.parse(source.slice(from,i+1))}catch{return null}}}
  }
  return null;
}
function extractYouTubeInitialPlayerResponse(html) {
  for(const marker of ['ytInitialPlayerResponse =','var ytInitialPlayerResponse =','window["ytInitialPlayerResponse"] =']){const value=extractBalancedJson(html,marker);if(value)return value;}
  return null;
}
function parseYouTubeWatchHtml(html, fallbackId='') {
  const player=extractYouTubeInitialPlayerResponse(html)||{};
  const details=player.videoDetails||{},micro=player.microformat?.playerMicroformatRenderer||{};
  const id=clean(details.videoId||fallbackId),title=clean(details.title),description=String(details.shortDescription||''),publishedAt=clean(micro.publishDate||micro.uploadDate||'');
  return {id,title,description,publishedAt,url:id?`https://www.youtube.com/watch?v=${id}`:'',links:extractUrls(description).map(href=>({href,text:''}))};
}
function collectTikTokItemsFromHtml(html) {
  const source=String(html||''),items=new Map();
  const scripts=[];
  for(const id of ['__UNIVERSAL_DATA_FOR_REHYDRATION__','SIGI_STATE']){
    const re=new RegExp(`<script[^>]+id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/script>`,'i'),match=source.match(re);if(match){try{scripts.push(JSON.parse(htmlDecode(match[1])))}catch{}}
  }
  const visit=value=>{if(!value||typeof value!=='object')return;if(Array.isArray(value)){for(const row of value)visit(row);return}const id=clean(value.id||value.itemId||value.aweme_id),desc=clean(value.desc||value.description||value.title),author=clean(value.author?.uniqueId||value.author?.unique_id||value.authorName||'');if(/^\d{8,}$/.test(id)&&desc){items.set(id,{id,desc,author,createTime:value.createTime||value.create_time||'',url:author?`https://www.tiktok.com/@${author}/video/${id}`:`https://www.tiktok.com/video/${id}`});}for(const row of Object.values(value))visit(row)};
  for(const script of scripts)visit(script);
  return [...items.values()];
}

async function browserSnapshot(url,{platform='generic',full=false,knownIds=[],maxPasses=null}={}) {
  if (!electron?.BrowserWindow || !electron?.app?.isReady?.()) throw new Error('Browser-backed creator discovery is unavailable outside the Enderloom desktop app');
  const win = new electron.BrowserWindow({show:false,width:1100,height:850,webPreferences:{partition:PARTITION,contextIsolation:true,nodeIntegration:false,sandbox:true,backgroundThrottling:false}});
  win.webContents.setAudioMuted(true);
  try {
    await win.loadURL(url);
    await sleep(900);
    const passes=Math.max(1,Math.min(220,Number(maxPasses)||Number(readRuntimeState().settings.browserHistoryScrollPasses)||140));
    const result=await win.webContents.executeJavaScript(`(async()=>{
      const platform=${JSON.stringify(platform)},full=${JSON.stringify(!!full)},known=new Set(${JSON.stringify(knownIds.slice(0,3000))}),passes=${JSON.stringify(passes)};
      const wait=ms=>new Promise(r=>setTimeout(r,ms));
      const out=new Map();let stable=0,last=0,knownHits=0;
      const collect=()=>{for(const a of document.querySelectorAll('a[href]')){let href='';try{href=new URL(a.href,location.href).toString()}catch{}if(!href)continue;let id='';if(platform==='youtube'){try{id=new URL(href).searchParams.get('v')||''}catch{}}else if(platform==='tiktok'){id=href.match(/\\/video\\/(\\d+)/)?.[1]||''}if(!id)continue;if(!out.has(id))out.set(id,{id,href,text:(a.textContent||a.getAttribute('title')||'').trim()});if(known.has(id))knownHits++;}};
      collect();
      for(let i=0;i<passes;i++){window.scrollTo(0,document.documentElement.scrollHeight);await wait(platform==='tiktok'?500:330);collect();if(out.size===last)stable++;else stable=0;last=out.size;if(stable>=5)break;if(!full&&known.size===0&&i>=3)break;if(!full&&knownHits>=3&&i>=2)break;}
      return {url:location.href,title:document.title,text:(document.body?.innerText||''),html:document.documentElement?.outerHTML||'',links:[...out.values()]};
    })()`,true);
    return result||{url,title:'',text:'',html:'',links:[]};
  } finally { try{win.destroy()}catch{} }
}
async function browserVideoDetails(url, platform) {
  if (!electron?.BrowserWindow || !electron?.app?.isReady?.()) throw new Error('Browser-backed video reading is unavailable');
  const win=new electron.BrowserWindow({show:false,width:1100,height:850,webPreferences:{partition:PARTITION,contextIsolation:true,nodeIntegration:false,sandbox:true,backgroundThrottling:false}});win.webContents.setAudioMuted(true);
  try{
    await win.loadURL(url);await sleep(platform==='tiktok'?1100:800);
    return await win.webContents.executeJavaScript(`(async()=>{const wait=ms=>new Promise(r=>setTimeout(r,ms));const platform=${JSON.stringify(platform)};if(platform==='youtube'){for(const el of document.querySelectorAll('#expand,tp-yt-paper-button#expand')){try{el.click()}catch{}}await wait(120);const root=document.querySelector('#description-inline-expander,#description')||document;const links=[...root.querySelectorAll('a[href]')].map(a=>({href:a.href,text:(a.textContent||'').trim()}));return{url:location.href,title:(document.querySelector('h1 yt-formatted-string,h1')?.textContent||document.title||'').trim(),description:(root.innerText||'').trim(),publishedAt:(document.querySelector('#info-strings yt-formatted-string')?.textContent||'').trim(),links};}const desc=document.querySelector('[data-e2e="browse-video-desc"],[data-e2e="video-desc"],meta[name="description"]');const description=desc?.content||desc?.textContent||document.querySelector('meta[property="og:description"]')?.content||'';return{url:location.href,title:document.querySelector('meta[property="og:title"]')?.content||document.title||'',description:String(description).trim(),publishedAt:'',links:[...document.querySelectorAll('a[href]')].map(a=>({href:a.href,text:(a.textContent||'').trim()}))};})()`,true);
  }finally{try{win.destroy()}catch{}}
}
async function enumerateCreatorVideos(creator, knownIds, full) {
  const platform=String(creator.platform||'').toLowerCase(),base=safeUrl(creator.url);
  if(!base)throw new Error(`Creator ${creator.id} does not have a valid public URL`);
  if(platform==='youtube'){
    const page=base.replace(/\/$/,'')+(base.includes('/videos')?'':'/videos');
    try{const snap=await browserSnapshot(page,{platform:'youtube',full,knownIds});return unique((snap.links||[]).map(x=>x.id)).map(id=>({id,url:`https://www.youtube.com/watch?v=${id}`,title:(snap.links||[]).find(x=>x.id===id)?.text||''}));}catch(error){
      const res=await requestText(page,{timeoutMs:7000});const ids=unique([...String(res.text||'').matchAll(/(?:watch\?v=|"videoId":")([A-Za-z0-9_-]{11})/g)].map(m=>m[1]));if(!ids.length)throw error;return ids.map(id=>({id,url:`https://www.youtube.com/watch?v=${id}`,title:''}));
    }
  }
  if(platform==='tiktok'){
    try{const snap=await browserSnapshot(base,{platform:'tiktok',full,knownIds});const rows=new Map();for(const link of snap.links||[]){if(link.id)rows.set(link.id,{id:link.id,url:link.href,title:link.text||''});}for(const item of collectTikTokItemsFromHtml(snap.html||''))if(!rows.has(item.id))rows.set(item.id,{id:item.id,url:item.url,title:item.desc});return [...rows.values()];}catch(error){const res=await requestText(base,{timeoutMs:7000});const items=collectTikTokItemsFromHtml(res.text||'');if(!items.length)throw error;return items.map(item=>({id:item.id,url:item.url,title:item.desc}));}
  }
  const snap=await browserSnapshot(base,{platform:'generic',full,knownIds,maxPasses:20});return (snap.links||[]).filter(x=>/video|watch/i.test(x.href)).map(x=>({id:crypto.createHash('sha1').update(x.href).digest('hex').slice(0,16),url:x.href,title:x.text||''}));
}
async function readCreatorVideo(creator, ref) {
  const platform=String(creator.platform||'').toLowerCase();
  if(platform==='youtube'){
    try{const response=await requestText(ref.url,{timeoutMs:7500,headers:{'Accept-Language':'en-US,en;q=0.9'}});if(response.status>=200&&response.status<400){const parsed=parseYouTubeWatchHtml(response.text,ref.id);if(parsed.description||parsed.title)return parsed;}}catch{}
    const row=await browserVideoDetails(ref.url,'youtube');return{id:ref.id,title:clean(row.title||ref.title),description:String(row.description||''),publishedAt:clean(row.publishedAt),url:ref.url,links:row.links||[]};
  }
  if(platform==='tiktok'){
    try{const embed=await requestJson(`https://www.tiktok.com/oembed?url=${encodeURIComponent(ref.url)}`,{timeoutMs:5000});const browser=await browserVideoDetails(ref.url,'tiktok').catch(()=>null);return{id:ref.id,title:clean(embed?.title||ref.title),description:String(browser?.description||embed?.title||''),publishedAt:'',url:ref.url,links:browser?.links||[]};}catch{const row=await browserVideoDetails(ref.url,'tiktok');return{id:ref.id,title:clean(row.title||ref.title),description:String(row.description||''),publishedAt:'',url:ref.url,links:row.links||[]};
  }
  const row=await browserVideoDetails(ref.url,'generic');return{id:ref.id,title:clean(row.title||ref.title),description:String(row.description||''),publishedAt:clean(row.publishedAt),url:ref.url,links:row.links||[]};
}
function findExistingProject(vault,candidate){
  const urls=(candidate.urls||[]).map(urlKey).filter(Boolean),key=projectNameKey(candidate.name);
  const byUrl=new Map();for(const project of vault.projects||[])for(const link of project.providerLinks||[])byUrl.set(urlKey(link.url),project);
  for(const url of urls)if(byUrl.has(url))return byUrl.get(url);
  return (vault.projects||[]).find(project=>[project.name,...(project.aliases||[])].some(label=>projectNameKey(label)===key))||null;
}
function modrinthProjectTypes(type){return type==='resourcepack'?['resourcepack']:type==='shader'?['shader']:type==='modpack'?['modpack']:type==='plugin'?['mod','plugin']:type==='datapack'?['mod','datapack']:['mod'];}
async function searchModrinth(candidate){
  try{
    const query=new URL('https://api.modrinth.com/v2/search');query.searchParams.set('query',candidate.name);query.searchParams.set('limit','10');
    const data=await requestJson(query.toString(),{timeoutMs:5000,headers:{Accept:'application/json'}}),wanted=projectNameKey(candidate.name),types=new Set(modrinthProjectTypes(candidate.projectType));
    let best=null,bestScore=0;for(const hit of data?.hits||[]){if(hit.project_type&&!types.has(hit.project_type)&&!(candidate.projectType==='datapack'&&hit.project_type==='mod'))continue;const titleKey=projectNameKey(hit.title),slugKey=projectNameKey(hit.slug);let score=titleKey===wanted?1:slugKey===wanted?0.99:titleKey.includes(wanted)||wanted.includes(titleKey)?0.88:0;if(score>bestScore){best=hit;bestScore=score}}
    if(!best||bestScore<0.88)return null;const kind=best.project_type==='resourcepack'?'resourcepack':best.project_type==='shader'?'shader':best.project_type==='modpack'?'modpack':best.project_type==='plugin'?'plugin':'mod';return{score:bestScore,name:clean(best.title),links:[{provider:'Modrinth',url:`https://modrinth.com/${kind}/${best.slug}`,label:'Automatic exact-match discovery',verified:true}]};
  }catch{return null}
}
async function searchCurseForge(candidate){
  try{
    const kind=candidate.projectType==='resourcepack'?'texture-packs':candidate.projectType==='shader'?'shaders':candidate.projectType==='modpack'?'modpacks':candidate.projectType==='datapack'?'data-packs':'mc-mods';
    const url=`https://www.curseforge.com/minecraft/search?page=1&pageSize=20&sortBy=relevancy&class=${encodeURIComponent(kind)}&search=${encodeURIComponent(candidate.name)}`;const res=await requestText(url,{timeoutMs:6000}),wanted=projectNameKey(candidate.name),re=/<a[^>]+href=["'](\/minecraft\/(?:mc-mods|modpacks|texture-packs|shaders|data-packs)\/[^"'?]+)["'][^>]*>([\s\S]{0,1200}?)<\/a>/gi;let match;
    while((match=re.exec(res.text||''))){const text=clean(match[2].replace(/<[^>]+>/g,' ')),slug=match[1].split('/').pop(),score=projectNameKey(text)===wanted||projectNameKey(slug)===wanted?1:(projectNameKey(text).includes(wanted)?0.9:0);if(score>=0.9)return{score,name:text||candidate.name,links:[{provider:'CurseForge',url:`https://www.curseforge.com${match[1]}`,label:'Automatic exact-match discovery',verified:true}]};}
  }catch{}
  return null;
}
async function resolveCandidate(candidate,vault,state,context){
  const existing=findExistingProject(vault,candidate);if(existing)return{project:existing,reused:true,review:null};
  const direct=mergeProviderLinks((candidate.urls||[]).filter(projectLink).map(url=>({provider:providerForUrl(url),url,label:'Creator-linked project home',verified:true})));
  const [modrinth,curseforge]=await Promise.all([searchModrinth(candidate),searchCurseForge(candidate)]);
  const links=mergeProviderLinks(direct,modrinth?.links||[],curseforge?.links||[]),id=projectSlug(candidate.name),project={id,name:candidate.name,aliases:[],projectTypes:[candidate.projectType||'mod'],projectType:candidate.projectType||'mod',providerLinks:links};
  const review=!links.length?makeReview('provider-unresolved',context,candidate,`No high-confidence direct project home could be resolved automatically for ${candidate.name}.`):null;
  return{project,reused:false,review};
}
function makeReview(kind,context,candidate,message){const seed=[kind,context.creatorId,context.videoId,candidate?.name||'',message].join('|'),id=crypto.createHash('sha1').update(seed).digest('hex').slice(0,16);return{id,kind,status:'open',createdAt:now(),creatorId:context.creatorId,videoId:context.videoId,videoUrl:context.videoUrl||'',name:candidate?.name||'',message,raw:candidate||null};}
function upsertReview(state,row){if(!row)return;const index=state.review.findIndex(x=>x.id===row.id);if(index>=0)state.review[index]={...state.review[index],...row};else state.review.push(row);if(state.review.length>1000)state.review=state.review.slice(-1000);}
function upsertProject(state,row){const index=state.projects.findIndex(x=>x.id===row.id);if(index>=0){const old=state.projects[index];state.projects[index]={...old,...row,aliases:unique([...(old.aliases||[]),...(row.aliases||[])]),projectTypes:unique([...(old.projectTypes||[]),...(row.projectTypes||[])]),providerLinks:mergeProviderLinks(old.providerLinks||[],row.providerLinks||[])};}else state.projects.push(row);}
function upsertVideo(state,row){const index=state.videos.findIndex(x=>x.id===row.id);if(index>=0)state.videos[index]=row;else state.videos.push(row);}
function upsertCreatorOverride(state,row){const index=state.creators.findIndex(x=>x.id===row.id);if(index>=0)state.creators[index]=mergeCreator(state.creators[index],row);else state.creators.push(row);}
async function mapConcurrent(rows,limit,mapper){const out=new Array(rows.length);let next=0;async function worker(){while(true){const index=next++;if(index>=rows.length)return;out[index]=await mapper(rows[index],index)}}await Promise.all(Array.from({length:Math.max(1,Math.min(limit,rows.length||1))},()=>worker()));return out;}
function emitProgress(callback,payload){try{callback?.({at:now(),...payload})}catch{}}
async function syncOneCreator(creator,{full=false,maxVideos=null}={},progress){
  const state=readRuntimeState(),before=loadMergedCreatorVault(ROOT_DIR),knownIds=new Set((before.videos||[]).filter(v=>v.creatorId===creator.id).map(v=>String(v.id).split(':').pop())),syncInfo=state.sync.creators[creator.id]||{};
  emitProgress(progress,{phase:'discover',creatorId:creator.id,message:`Discovering ${creator.title||creator.handle||creator.id} ${full?'full history':'new uploads'}…`});
  let refs=await enumerateCreatorVideos(creator,[...knownIds],full);const seen=new Set();refs=refs.filter(ref=>ref.id&&!seen.has(ref.id)&&seen.add(ref.id));const newRefs=refs.filter(ref=>!knownIds.has(ref.id));
  const limit=full?newRefs.length:Math.max(1,Number(maxVideos)||Number(state.settings.maxIncrementalVideosPerCreator)||12),work=newRefs.slice(0,limit);
  let processed=0,mentions=0,failed=0;
  await mapConcurrent(work,Math.min(4,work.length||1),async(ref,index)=>{
    try{
      emitProgress(progress,{phase:'video',creatorId:creator.id,current:index+1,total:work.length,videoId:ref.id,message:`Reading ${creator.title||creator.handle}: ${index+1}/${work.length}`});
      const details=await readCreatorVideo(creator,ref),candidates=parseCreatorDescription({text:details.description,title:details.title||ref.title,platform:creator.platform,links:details.links});
      if(!candidates.length){upsertReview(state,makeReview('no-structured-project-list',{creatorId:creator.id,videoId:`${creator.platform}:${ref.id}`,videoUrl:ref.url},{name:''},`No structured project list could be extracted from ${details.title||ref.title||ref.id}; source is preserved for review.`));return;}
      const currentVault=loadMergedCreatorVault(ROOT_DIR),mods=[];
      for(const candidate of candidates){const resolved=await resolveCandidate(candidate,currentVault,state,{creatorId:creator.id,videoId:`${creator.platform}:${ref.id}`,videoUrl:ref.url});if(resolved.review)upsertReview(state,resolved.review);if(!resolved.reused)upsertProject(state,resolved.project);else if(projectNameKey(candidate.name)!==projectNameKey(resolved.project.name))upsertProject(state,{id:resolved.project.id,name:resolved.project.name,aliases:[candidate.name],projectTypes:resolved.project.projectTypes||[candidate.projectType],providerLinks:[]});const project=resolved.project,providerLinks=mergeProviderLinks(project.providerLinks||[],candidate.urls.filter(projectLink).map(url=>({provider:providerForUrl(url),url,label:'Creator-linked project home',verified:true})));mods.push({name:candidate.name,canonicalProjectId:project.id,canonicalName:project.name,projectType:candidate.projectType||'mod',providerLinks,timestamp:candidate.timestamp||'',timestampSeconds:candidate.timestampSeconds,videoLink:candidate.timestampSeconds!=null?`${ref.url}${ref.url.includes('?')?'&':'?'}t=${candidate.timestampSeconds}s`:ref.url,evidence:candidate.evidence,sourceKinds:candidate.sourceKinds,confidence:candidate.confidence});}
      const publishedAt=details.publishedAt||'';upsertVideo(state,{id:`${creator.platform}:${ref.id}`,creatorId:creator.id,platform:creator.platform,url:ref.url,title:details.title||ref.title||ref.id,publishedAt,evidenceKinds:[creator.platform,'creator-page','description'],autoIngested:true,autoIngestedAt:now(),mods});processed++;mentions+=mods.length;
    }catch(error){failed++;upsertReview(state,makeReview('video-read-failed',{creatorId:creator.id,videoId:`${creator.platform}:${ref.id}`,videoUrl:ref.url},{name:ref.title||''},String(error?.message||error)));}
  });
  writeRuntimeState(state);
  const mergedAfter=loadMergedCreatorVault(ROOT_DIR),creatorVideos=(mergedAfter.videos||[]).filter(v=>v.creatorId===creator.id),creatorMentions=creatorVideos.reduce((n,v)=>n+(v.mods||[]).length,0);
  upsertCreatorOverride(state,{id:creator.id,status:failed?'indexing':'current',coverage:{complete:full&&newRefs.length===work.length,state:failed?'attention':full?'history-synced':'incremental-current',indexedVideos:creatorVideos.length,recommendationCount:creatorMentions,verifiedProjectHomes:creatorVideos.flatMap(v=>v.mods||[]).filter(m=>(m.providerLinks||[]).length).length,lastAutoSyncAt:now(),autoCataloged:true}});
  state.sync.creators[creator.id]={...syncInfo,lastSyncAt:now(),state:failed?'attention':'current',discovered:refs.length,newVideos:newRefs.length,processed,mentions,failed,full:!!full};writeRuntimeState(state);
  emitProgress(progress,{phase:'creator-complete',creatorId:creator.id,message:`${creator.title||creator.handle}: ${processed} new video${processed===1?'':'s'}, ${mentions} project mention${mentions===1?'':'s'}.`,processed,mentions,failed});
  return{creatorId:creator.id,discovered:refs.length,newVideos:newRefs.length,processed,mentions,failed};
}
async function runSync({creatorId='',full=false,trigger='manual',maxVideosPerCreator=null}={},progress){
  if(syncFlight)return syncFlight;
  syncFlight=(async()=>{
    let state=readRuntimeState();state.sync={...state.sync,state:'running',lastRunAt:now(),trigger,creatorId,error:''};writeRuntimeState(state);emitProgress(progress,{phase:'start',creatorId,message:full?'Starting full-history creator sync…':'Checking creators for new recommendations…'});
    try{
      const merged=loadMergedCreatorVault(ROOT_DIR),targets=(merged.creators||[]).filter(c=>!creatorId||c.id===creatorId).filter(c=>['youtube','tiktok'].includes(String(c.platform||'').toLowerCase())||safeUrl(c.url));if(!targets.length)throw new Error(creatorId?'Creator not found':'No tracked creators have a supported source URL');
      const results=[];for(const creator of targets){try{results.push(await syncOneCreator(creator,{full,maxVideos:maxVideosPerCreator},progress))}catch(error){state=readRuntimeState();state.sync.creators[creator.id]={...(state.sync.creators[creator.id]||{}),lastSyncAt:now(),state:'error',error:String(error?.message||error)};upsertReview(state,makeReview('creator-sync-failed',{creatorId:creator.id,videoId:'',videoUrl:creator.url},{name:creator.title||creator.handle},String(error?.message||error)));writeRuntimeState(state);results.push({creatorId:creator.id,error:String(error?.message||error)})}}
      state=readRuntimeState();state.sync={...state.sync,state:'idle',lastSuccessfulRunAt:now(),trigger,creatorId,error:''};writeRuntimeState(state);const vault=loadMergedCreatorVault(ROOT_DIR);emitProgress(progress,{phase:'complete',message:`Creator sync complete: ${results.reduce((n,r)=>n+(r.processed||0),0)} new videos, ${results.reduce((n,r)=>n+(r.mentions||0),0)} project mentions.`,stats:vault.stats});return{ok:true,results,status:runtimeStatus(),vault};
    }catch(error){state=readRuntimeState();state.sync={...state.sync,state:'error',error:String(error?.message||error),trigger,creatorId};writeRuntimeState(state);emitProgress(progress,{phase:'error',message:String(error?.message||error)});throw error;}
    finally{syncFlight=null;}
  })();return syncFlight;
}
function runtimeStatus(){const state=readRuntimeState(),vault=loadMergedCreatorVault(ROOT_DIR);return{schemaVersion:SCHEMA_VERSION,sync:state.sync,settings:state.settings,reviewCount:state.review.filter(x=>x.status!=='ignored').length,review:state.review.filter(x=>x.status!=='ignored').slice(-100).reverse(),runtimeCounts:{videos:state.videos.length,projects:state.projects.length,creators:state.creators.length},stats:vault.stats};}
function addCreator(raw){const state=readRuntimeState(),url=safeUrl(raw?.url);if(!url)throw new Error('A valid HTTP/HTTPS creator URL is required');const host=new URL(url).hostname.toLowerCase();let platform=clean(raw?.platform).toLowerCase();if(!platform)platform=/youtube\.com$/.test(host)?'youtube':/tiktok\.com$/.test(host)?'tiktok':'web';let handle=clean(raw?.handle);if(!handle){if(platform==='youtube')handle=new URL(url).pathname.match(/\/@([^/]+)/)?.[1]||'';else if(platform==='tiktok')handle=new URL(url).pathname.match(/\/@([^/]+)/)?.[1]||'';}const id=clean(raw?.id)||`${platform}:${(handle||projectSlug(raw?.title||new URL(url).hostname)).replace(/^@/,'')}`,title=clean(raw?.title)||handle||id;const creator={id,title,platform,handle:handle?(handle.startsWith('@')?handle:`@${handle}`):'',url,role:'recommended',required:false,status:'queued',wikiStatus:'tracked',coverage:{complete:false,state:'queued',autoCataloged:true}};upsertCreatorOverride(state,creator);writeRuntimeState(state);return{creator,status:runtimeStatus(),vault:loadMergedCreatorVault(ROOT_DIR)};}
function setSettings(patch){const state=readRuntimeState(),allowed=['autoSyncOnLaunch','launchCooldownHours','maxIncrementalVideosPerCreator','browserHistoryScrollPasses'];for(const key of allowed)if(Object.prototype.hasOwnProperty.call(patch||{},key))state.settings[key]=key==='autoSyncOnLaunch'?!!patch[key]:Math.max(1,Number(patch[key])||DEFAULT_SETTINGS[key]);writeRuntimeState(state);return runtimeStatus();}
function ignoreReview(id){const state=readRuntimeState(),row=state.review.find(x=>x.id===id);if(row){row.status='ignored';row.resolvedAt=now();writeRuntimeState(state);}return runtimeStatus();}
function assertCatalogSender(event){const url=String(event?.sender?.getURL?.()||'');if(!url.startsWith('file:'))throw new Error('Creator Vault IPC is only available to Enderloom local catalog views');}
function ensureCreatorVaultRuntimeRegistered(){
  if(ipcRegistered||!electron?.ipcMain)return false;ipcRegistered=true;
  electron.ipcMain.handle('catalog:creator-vault-status',(event)=>{assertCatalogSender(event);return runtimeStatus()});
  electron.ipcMain.handle('catalog:creator-vault-sync',async(event,options)=>{assertCatalogSender(event);const sender=event.sender,progress=payload=>{try{if(!sender.isDestroyed())sender.send('catalog:creator-vault-progress',payload)}catch{}};return runSync({creatorId:clean(options?.creatorId),full:!!options?.full,trigger:'manual',maxVideosPerCreator:Number(options?.maxVideosPerCreator)||null},progress)});
  electron.ipcMain.handle('catalog:creator-vault-add',(event,raw)=>{assertCatalogSender(event);return addCreator(raw||{})});
  electron.ipcMain.handle('catalog:creator-vault-settings',(event,patch)=>{assertCatalogSender(event);return setSettings(patch||{})});
  electron.ipcMain.handle('catalog:creator-vault-review-ignore',(event,id)=>{assertCatalogSender(event);return ignoreReview(clean(id))});
  scheduleLaunchSync();return true;
}
function scheduleLaunchSync(){
  if(launchScheduled||!electron?.app)return;launchScheduled=true;
  electron.app.whenReady().then(()=>{const timer=setTimeout(async()=>{try{const state=readRuntimeState();if(!state.settings.autoSyncOnLaunch)return;const cooldown=Math.max(1,Number(state.settings.launchCooldownHours)||12)*60*60*1000,last=Date.parse(state.sync.lastSuccessfulRunAt||'')||0;if(Date.now()-last<cooldown)return;await runSync({full:false,trigger:'launch',maxVideosPerCreator:state.settings.maxIncrementalVideosPerCreator},null);}catch{}},6500);timer.unref?.();}).catch(()=>{});
}
ensureCreatorVaultRuntimeRegistered();
module.exports={SCHEMA_VERSION,DEFAULT_SETTINGS,readRuntimeState,writeRuntimeState,loadMergedCreatorVault,parseCreatorDescription,extractYouTubeInitialPlayerResponse,parseYouTubeWatchHtml,collectTikTokItemsFromHtml,findExistingProject,searchModrinth,searchCurseForge,enumerateCreatorVideos,readCreatorVideo,runSync,runtimeStatus,addCreator,setSettings,ignoreReview,ensureCreatorVaultRuntimeRegistered,projectLink,providerForUrl,urlKey};
