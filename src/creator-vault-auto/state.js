'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {
  loadCreatorVault,
  projectNameKey,
  projectSlug,
  mergeProviderLinks,
} = require('../creator-vault');
const { DEFAULT_SETTINGS, now, clean, unique, safeUrl, providerForUrl, urlKey, clampInt } = require('./common');

let configuredUserDataDir = '';

function configureUserDataDir(value) {
  configuredUserDataDir = value ? path.resolve(String(value)) : '';
}

function runtimeDir() {
  if (process.env.ENDERLOOM_CREATOR_VAULT_RUNTIME_DIR) return path.resolve(process.env.ENDERLOOM_CREATOR_VAULT_RUNTIME_DIR);
  return configuredUserDataDir ? path.join(configuredUserDataDir, 'creator-vault-auto') : '';
}
function runtimeFile() {
  const dir = runtimeDir();
  return dir ? path.join(dir, 'state.json') : '';
}
function emptyRuntimeState() {
  return {
    schemaVersion:2,
    updatedAt:'',
    settings:{ ...DEFAULT_SETTINGS },
    creators:[],
    videos:[],
    projects:[],
    review:[],
    resolverCache:{},
    sync:{ state:'idle', lastRunAt:'', lastSuccessfulRunAt:'', trigger:'', creatorId:'', error:'', creators:{} },
  };
}
function normalizeSettings(settings={}) {
  return {
    autoSyncOnLaunch: settings.autoSyncOnLaunch !== false,
    launchCooldownHours: clampInt(settings.launchCooldownHours, DEFAULT_SETTINGS.launchCooldownHours, 1, 168),
    maxIncrementalVideosPerCreator: clampInt(settings.maxIncrementalVideosPerCreator, DEFAULT_SETTINGS.maxIncrementalVideosPerCreator, 1, 100),
    browserHistoryScrollPasses: clampInt(settings.browserHistoryScrollPasses, DEFAULT_SETTINGS.browserHistoryScrollPasses, 12, 240),
    browserPoolSize: clampInt(settings.browserPoolSize, DEFAULT_SETTINGS.browserPoolSize, 1, 6),
    videoConcurrency: clampInt(settings.videoConcurrency, DEFAULT_SETTINGS.videoConcurrency, 1, 10),
    creatorConcurrency: clampInt(settings.creatorConcurrency, DEFAULT_SETTINGS.creatorConcurrency, 1, 4),
    resolverCacheDays: clampInt(settings.resolverCacheDays, DEFAULT_SETTINGS.resolverCacheDays, 1, 90),
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
      settings:normalizeSettings(raw.settings || {}),
      creators:Array.isArray(raw.creators) ? raw.creators : [],
      videos:Array.isArray(raw.videos) ? raw.videos : [],
      projects:Array.isArray(raw.projects) ? raw.projects : [],
      review:Array.isArray(raw.review) ? raw.review : [],
      resolverCache:raw.resolverCache && typeof raw.resolverCache === 'object' ? raw.resolverCache : {},
      sync:{ ...emptyRuntimeState().sync, ...(raw.sync || {}), creators:{...(raw.sync?.creators || {})} },
    };
  } catch {
    return emptyRuntimeState();
  }
}
function writeRuntimeState(state) {
  const file = runtimeFile();
  if (!file) return false;
  fs.mkdirSync(path.dirname(file), { recursive:true });
  const next = {
    ...state,
    schemaVersion:2,
    updatedAt:now(),
    settings:normalizeSettings(state.settings || {}),
  };
  const temp = `${file}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(next, null, 2));
  fs.renameSync(temp, file);
  return true;
}
function mergeCreator(base, override) {
  return {
    ...(base || {}),
    ...(override || {}),
    coverage:{ ...((base || {}).coverage || {}), ...((override || {}).coverage || {}) },
  };
}
function cloneProject(project={}) {
  return {
    ...project,
    id:clean(project.id) || projectSlug(project.name),
    name:clean(project.name),
    aliases:unique(project.aliases || []),
    projectTypes:unique([...(project.projectTypes || []), project.projectType].filter(Boolean)),
    providerLinks:mergeProviderLinks(project.providerLinks || [], project.links || []),
    mentions:[],
    creatorIds:[],
    videoIds:[],
  };
}
function mergeProject(target, row={}) {
  target.aliases = unique([...(target.aliases || []), ...(row.aliases || []), row.name && row.name !== target.name ? row.name : '']);
  target.projectTypes = unique([...(target.projectTypes || []), ...(row.projectTypes || []), row.projectType].filter(Boolean));
  target.providerLinks = mergeProviderLinks(target.providerLinks || [], row.providerLinks || [], row.links || []);
  if (!target.name && row.name) target.name = clean(row.name);
  return target;
}
function projectByName(projectMap, value) {
  const key = projectNameKey(value);
  if (!key) return null;
  for (const project of projectMap.values()) {
    if ([project.name, ...(project.aliases || [])].some(label => projectNameKey(label) === key)) return project;
  }
  return null;
}
function normalizeRuntimeVideo(video, projectMap) {
  const out = {
    ...(video || {}),
    id:clean(video?.id),
    creatorId:clean(video?.creatorId),
    platform:clean(video?.platform || 'youtube').toLowerCase(),
    url:safeUrl(video?.url),
    title:clean(video?.title),
    publishedAt:clean(video?.publishedAt),
    evidenceKinds:unique(video?.evidenceKinds || []),
  };
  out.mods = (Array.isArray(video?.mods) ? video.mods : []).map(raw => {
    const name = clean(raw?.name || raw?.canonicalName);
    let project = projectMap.get(clean(raw?.canonicalProjectId));
    if (!project) project = projectByName(projectMap, raw?.canonicalName || name);
    const canonicalProjectId = project?.id || clean(raw?.canonicalProjectId) || projectSlug(raw?.canonicalName || name);
    const canonicalName = project?.name || clean(raw?.canonicalName) || name;
    const providerLinks = mergeProviderLinks(
      project?.providerLinks || [],
      raw?.providerLinks || [],
      raw?.url ? [{ provider:raw.provider || providerForUrl(raw.url), url:raw.url, verified:true }] : []
    );
    const seconds = Number(raw?.timestampSeconds);
    let videoLink = safeUrl(raw?.videoLink);
    if (!videoLink && out.url) {
      try {
        const url = new URL(out.url);
        if (Number.isFinite(seconds) && seconds >= 0) url.searchParams.set('t', `${Math.floor(seconds)}s`);
        videoLink = url.toString();
      } catch { videoLink = out.url; }
    }
    return {
      ...(raw || {}),
      name,
      canonicalProjectId,
      canonicalName,
      projectType:clean(raw?.projectType || project?.projectTypes?.[0] || 'mod'),
      providerLinks,
      url:providerLinks[0]?.url || '',
      provider:providerLinks[0]?.provider || '',
      loader:unique(raw?.loader || []),
      timestamp:clean(raw?.timestamp),
      timestampSeconds:Number.isFinite(seconds) && seconds >= 0 ? seconds : null,
      videoLink,
      sourceKinds:unique(raw?.sourceKinds || []),
    };
  }).filter(mod => mod.name);
  return out;
}
function loadMergedCreatorVault(rootDir) {
  const base = loadCreatorVault(rootDir);
  const state = readRuntimeState();
  const creatorMap = new Map((base.creators || []).map(creator => [creator.id, { ...creator, coverage:{...(creator.coverage || {})} }]));
  for (const override of state.creators) {
    if (override?.id) creatorMap.set(override.id, mergeCreator(creatorMap.get(override.id), override));
  }

  const projectMap = new Map();
  for (const project of base.projects || []) projectMap.set(project.id, cloneProject(project));
  for (const row of state.projects || []) {
    const id = clean(row?.id) || projectSlug(row?.name);
    if (!id || !clean(row?.name)) continue;
    if (projectMap.has(id)) mergeProject(projectMap.get(id), { ...row, id });
    else projectMap.set(id, cloneProject({ ...row, id }));
  }

  const videoMap = new Map();
  for (const video of base.videos || []) if (video?.id) videoMap.set(video.id, normalizeRuntimeVideo(video, projectMap));
  for (const video of state.videos || []) if (video?.id) videoMap.set(video.id, normalizeRuntimeVideo(video, projectMap));
  const videos = [...videoMap.values()];

  for (const project of projectMap.values()) {
    project.mentions = [];
    project.creatorIds = [];
    project.videoIds = [];
  }
  for (const video of videos) {
    for (const mod of video.mods || []) {
      let project = projectMap.get(mod.canonicalProjectId) || projectByName(projectMap, mod.canonicalName || mod.name);
      if (!project) {
        project = cloneProject({
          id:mod.canonicalProjectId || projectSlug(mod.canonicalName || mod.name),
          name:mod.canonicalName || mod.name,
          aliases:mod.name && mod.name !== mod.canonicalName ? [mod.name] : [],
          projectTypes:[mod.projectType || 'mod'],
          providerLinks:mod.providerLinks || [],
        });
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
        creatorId:video.creatorId,
        videoId:video.id,
        videoTitle:video.title,
        publishedAt:video.publishedAt,
        name:mod.name,
        canonicalName:project.name,
        projectType:mod.projectType,
        timestamp:mod.timestamp || '',
        timestampSeconds:mod.timestampSeconds,
        videoLink:mod.videoLink || video.url,
        evidence:mod.evidence || '',
        loader:mod.loader || [],
        sourceKinds:mod.sourceKinds || [],
      });
    }
  }

  const projects = [...projectMap.values()]
    .filter(project => project.mentions.length)
    .sort((a,b) => String(a.name).localeCompare(String(b.name)));
  const recommendations = videos.reduce((sum, video) => sum + (video.mods || []).length, 0);
  const verifiedProjects = projects.filter(project => (project.providerLinks || []).length).length;
  const multiProviderProjects = projects.filter(project => new Set((project.providerLinks || []).map(link => link.provider)).size > 1).length;
  const providerDestinations = projects.reduce((sum, project) => sum + (project.providerLinks || []).length, 0);
  const creators = [...creatorMap.values()];
  return {
    ...base,
    updatedAt:[base.updatedAt, state.updatedAt].filter(Boolean).sort().pop() || '',
    creators,
    videos,
    projects,
    stats:{
      ...(base.stats || {}),
      creators:creators.length,
      indexedCreators:new Set(videos.map(video => video.creatorId).filter(Boolean)).size,
      videos:videos.length,
      recommendations,
      uniqueProjects:projects.length,
      verifiedProjects,
      unresolvedProjects:projects.length - verifiedProjects,
      multiProviderProjects,
      providerDestinations,
      verifiedHomes:verifiedProjects,
    },
    runtime:{
      ...state.sync,
      reviewCount:state.review.filter(row => row.status !== 'ignored').length,
      settings:state.settings,
      review:state.review.filter(row => row.status !== 'ignored').slice(-100).reverse(),
    },
  };
}
function upsertCreator(state, row) {
  if (!row?.id) return;
  const index = state.creators.findIndex(item => item.id === row.id);
  if (index >= 0) state.creators[index] = mergeCreator(state.creators[index], row);
  else state.creators.push(row);
}
function upsertProject(state, row) {
  const id = clean(row?.id) || projectSlug(row?.name);
  if (!id || !clean(row?.name)) return;
  const normalized = { ...row, id };
  const index = state.projects.findIndex(item => item.id === id);
  if (index >= 0) {
    const old = state.projects[index];
    state.projects[index] = {
      ...old,
      ...normalized,
      aliases:unique([...(old.aliases || []), ...(normalized.aliases || [])]),
      projectTypes:unique([...(old.projectTypes || []), ...(normalized.projectTypes || []), normalized.projectType].filter(Boolean)),
      providerLinks:mergeProviderLinks(old.providerLinks || [], normalized.providerLinks || []),
    };
  } else {
    state.projects.push(normalized);
  }
}
function upsertVideo(state, row) {
  if (!row?.id) return;
  const index = state.videos.findIndex(item => item.id === row.id);
  if (index >= 0) state.videos[index] = row;
  else state.videos.push(row);
}
function upsertReview(state, row) {
  if (!row?.id) return;
  const index = state.review.findIndex(item => item.id === row.id);
  if (index >= 0) state.review[index] = { ...state.review[index], ...row };
  else state.review.push(row);
  if (state.review.length > 1200) state.review = state.review.slice(-1200);
}
function pruneResolverCache(state) {
  const ttl = Math.max(1, Number(state.settings?.resolverCacheDays) || DEFAULT_SETTINGS.resolverCacheDays) * 86400000;
  const cutoff = Date.now() - ttl;
  for (const [key, row] of Object.entries(state.resolverCache || {})) {
    if (!row || (Date.parse(row.at || '') || 0) < cutoff) delete state.resolverCache[key];
  }
}
function safeJsonForScript(value) {
  return JSON.stringify(value).replace(/<\//g, '<\\/').replace(/<!--/g, '<\\!--');
}
function patchRenderedCatalogs(vault) {
  if (!configuredUserDataDir) return { scanned:0, patched:0 };
  const dir = path.join(configuredUserDataDir, 'catalog-center', 'runtime');
  if (!fs.existsSync(dir)) return { scanned:0, patched:0 };
  let scanned = 0;
  let patched = 0;
  const assignment = `window.ENDERLOOM_CREATOR_VAULT=${safeJsonForScript(vault)};\n`;
  for (const name of fs.readdirSync(dir).filter(file => file.toLowerCase().endsWith('.html'))) {
    scanned++;
    const file = path.join(dir, name);
    let html;
    try { html = fs.readFileSync(file, 'utf8'); } catch { continue; }
    if (!html.includes('window.ENDERLOOM_CREATOR_VAULT=')) continue;
    const next = html.replace(/window\.ENDERLOOM_CREATOR_VAULT=.*?;\n/, assignment);
    if (next === html) continue;
    const temp = `${file}.${process.pid}.${crypto.randomBytes(3).toString('hex')}.tmp`;
    fs.writeFileSync(temp, next);
    fs.renameSync(temp, file);
    patched++;
  }
  return { scanned, patched };
}
function runtimeStatus(rootDir) {
  const state = readRuntimeState();
  const vault = loadMergedCreatorVault(rootDir);
  return {
    schemaVersion:2,
    sync:state.sync,
    settings:state.settings,
    reviewCount:state.review.filter(row => row.status !== 'ignored').length,
    review:state.review.filter(row => row.status !== 'ignored').slice(-100).reverse(),
    runtimeCounts:{ videos:state.videos.length, projects:state.projects.length, creators:state.creators.length },
    stats:vault.stats,
  };
}
function projectUrlIndex(vault) {
  const map = new Map();
  for (const project of vault.projects || []) {
    for (const link of project.providerLinks || []) map.set(urlKey(link.url), project);
  }
  return map;
}

module.exports = {
  configureUserDataDir, runtimeDir, runtimeFile, emptyRuntimeState, normalizeSettings,
  readRuntimeState, writeRuntimeState, loadMergedCreatorVault,
  upsertCreator, upsertProject, upsertVideo, upsertReview, pruneResolverCache,
  patchRenderedCatalogs, runtimeStatus, projectUrlIndex, projectByName,
};
