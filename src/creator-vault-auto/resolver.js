'use strict';

const { requestText, requestJson } = require('../public-http');
const { projectNameKey, projectSlug, mergeProviderLinks } = require('../creator-vault');
const { clean, unique, projectLink, providerForUrl, urlKey } = require('./common');

function tokenSet(value) {
  return new Set(projectNameKey(value).split(' ').filter(Boolean));
}
function nameScore(a, b) {
  const left = projectNameKey(a);
  const right = projectNameKey(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.replace(/\s+/g,'') === right.replace(/\s+/g,'')) return 0.995;
  const A = tokenSet(left), B = tokenSet(right);
  const intersection = [...A].filter(token => B.has(token)).length;
  const union = new Set([...A, ...B]).size || 1;
  const jaccard = intersection / union;
  if (left.includes(right) || right.includes(left)) return Math.max(0.88, jaccard);
  return jaccard;
}
function typeCompatible(requested, candidate) {
  const want = String(requested || 'mod').toLowerCase();
  const got = String(candidate || 'mod').toLowerCase();
  if (want === got) return true;
  if (want === 'datapack' && got === 'mod') return true;
  if (want === 'plugin' && got === 'mod') return true;
  return false;
}
function modrinthKind(value) {
  const type = String(value || 'mod').toLowerCase();
  if (type === 'resourcepack') return 'resourcepack';
  if (type === 'shader') return 'shader';
  if (type === 'modpack') return 'modpack';
  if (type === 'plugin') return 'plugin';
  return 'mod';
}

async function searchModrinth(candidate) {
  try {
    const url = new URL('https://api.modrinth.com/v2/search');
    url.searchParams.set('query', candidate.name);
    url.searchParams.set('limit', '12');
    const data = await requestJson(url.toString(), { timeoutMs:4800, headers:{ Accept:'application/json' } });
    let best = null;
    let bestScore = 0;
    for (const hit of data?.hits || []) {
      if (!typeCompatible(candidate.projectType, hit.project_type)) continue;
      const score = Math.max(nameScore(candidate.name, hit.title), nameScore(candidate.name, hit.slug));
      if (score > bestScore) { best = hit; bestScore = score; }
    }
    if (!best || bestScore < 0.92) return null;
    const kind = best.project_type === 'resourcepack' ? 'resourcepack'
      : best.project_type === 'shader' ? 'shader'
      : best.project_type === 'modpack' ? 'modpack'
      : best.project_type === 'plugin' ? 'plugin'
      : 'mod';
    return {
      score:bestScore,
      name:clean(best.title),
      links:[{ provider:'Modrinth', url:`https://modrinth.com/${kind}/${best.slug}`, label:'Automatic exact-match discovery', verified:true }],
    };
  } catch {
    return null;
  }
}

function curseForgePathAllowed(projectType, path) {
  const value = String(path || '').toLowerCase();
  const type = String(projectType || 'mod').toLowerCase();
  if (type === 'resourcepack') return value.includes('/texture-packs/');
  if (type === 'shader') return value.includes('/shaders/');
  if (type === 'modpack') return value.includes('/modpacks/');
  if (type === 'datapack') return value.includes('/data-packs/');
  return value.includes('/mc-mods/');
}
async function searchCurseForge(candidate) {
  try {
    const url = `https://www.curseforge.com/minecraft/search?page=1&pageSize=20&sortBy=relevancy&search=${encodeURIComponent(candidate.name)}`;
    const response = await requestText(url, { timeoutMs:5600 });
    const html = String(response.text || '');
    const regex = /<a[^>]+href=["'](\/minecraft\/(?:mc-mods|modpacks|texture-packs|shaders|data-packs)\/[^"'?/#]+)["'][^>]*>([\s\S]{0,1800}?)<\/a>/gi;
    let match;
    let best = null;
    let bestScore = 0;
    while ((match = regex.exec(html))) {
      if (!curseForgePathAllowed(candidate.projectType, match[1])) continue;
      const text = clean(match[2].replace(/<[^>]+>/g, ' '));
      const slug = match[1].split('/').filter(Boolean).pop() || '';
      const score = Math.max(nameScore(candidate.name, text), nameScore(candidate.name, slug));
      if (score > bestScore) { best = { path:match[1], text, slug }; bestScore = score; }
    }
    if (!best || bestScore < 0.94) return null;
    return {
      score:bestScore,
      name:best.text || candidate.name,
      links:[{ provider:'CurseForge', url:`https://www.curseforge.com${best.path}`, label:'Automatic exact-match discovery', verified:true }],
    };
  } catch {
    return null;
  }
}

function buildProjectIndex(vault) {
  const byId = new Map();
  const byName = new Map();
  const byUrl = new Map();
  for (const project of vault.projects || []) {
    byId.set(project.id, project);
    for (const label of [project.name, ...(project.aliases || [])]) {
      const key = projectNameKey(label);
      if (key && !byName.has(key)) byName.set(key, project);
    }
    for (const link of project.providerLinks || []) {
      const key = urlKey(link.url);
      if (key && !byUrl.has(key)) byUrl.set(key, project);
    }
  }
  return { byId, byName, byUrl };
}
function addProjectToIndex(index, project) {
  index.byId.set(project.id, project);
  for (const label of [project.name, ...(project.aliases || [])]) {
    const key = projectNameKey(label);
    if (key && !index.byName.has(key)) index.byName.set(key, project);
  }
  for (const link of project.providerLinks || []) {
    const key = urlKey(link.url);
    if (key && !index.byUrl.has(key)) index.byUrl.set(key, project);
  }
}
function findExistingProject(index, candidate) {
  for (const url of candidate.urls || []) {
    const hit = index.byUrl.get(urlKey(url));
    if (hit) return hit;
  }
  return index.byName.get(projectNameKey(candidate.name)) || null;
}
function cacheKey(candidate) {
  return `${String(candidate.projectType || 'mod').toLowerCase()}:${projectNameKey(candidate.name)}`;
}
function cacheResult(state, candidate, result) {
  state.resolverCache[cacheKey(candidate)] = { at:new Date().toISOString(), result };
}
function cachedResult(state, candidate) {
  const row = state.resolverCache?.[cacheKey(candidate)];
  return row?.result || null;
}

function createResolver({ state, vault }) {
  const index = buildProjectIndex(vault);
  const inflight = new Map();

  async function resolve(candidate) {
    const existing = findExistingProject(index, candidate);
    const direct = mergeProviderLinks((candidate.urls || [])
      .filter(projectLink)
      .map(url => ({ provider:providerForUrl(url), url, label:'Creator-linked project home', verified:true })));
    if (existing) {
      if (!direct.length) return { project:existing, reused:true, source:'catalog' };
      const enriched = {
        ...existing,
        aliases:unique([...(existing.aliases || []), candidate.name !== existing.name ? candidate.name : '']),
        providerLinks:mergeProviderLinks(existing.providerLinks || [], direct),
      };
      addProjectToIndex(index, enriched);
      return { project:enriched, reused:true, source:'catalog+creator-link' };
    }

    if (direct.length) {
      const project = {
        id:projectSlug(candidate.name),
        name:candidate.name,
        aliases:[],
        projectType:candidate.projectType || 'mod',
        projectTypes:[candidate.projectType || 'mod'],
        providerLinks:direct,
      };
      addProjectToIndex(index, project);
      return { project, reused:false, source:'creator-link' };
    }

    const cached = cachedResult(state, candidate);
    if (cached?.links?.length) {
      const project = {
        id:projectSlug(candidate.name),
        name:clean(cached.name || candidate.name),
        aliases:cached.name && projectNameKey(cached.name) !== projectNameKey(candidate.name) ? [candidate.name] : [],
        projectType:candidate.projectType || 'mod',
        projectTypes:[candidate.projectType || 'mod'],
        providerLinks:mergeProviderLinks(cached.links),
      };
      addProjectToIndex(index, project);
      return { project, reused:false, source:'resolver-cache' };
    }

    const key = cacheKey(candidate);
    if (!inflight.has(key)) {
      inflight.set(key, (async () => {
        const [modrinth, curseforge] = await Promise.all([searchModrinth(candidate), searchCurseForge(candidate)]);
        const links = mergeProviderLinks(modrinth?.links || [], curseforge?.links || []);
        const best = [modrinth, curseforge].filter(Boolean).sort((a,b)=>(b.score||0)-(a.score||0))[0] || null;
        const result = { name:best?.name || candidate.name, links, score:best?.score || 0 };
        cacheResult(state, candidate, result);
        return result;
      })().finally(() => inflight.delete(key)));
    }
    const discovered = await inflight.get(key);
    const project = {
      id:projectSlug(candidate.name),
      name:clean(discovered.name || candidate.name),
      aliases:discovered.name && projectNameKey(discovered.name) !== projectNameKey(candidate.name) ? [candidate.name] : [],
      projectType:candidate.projectType || 'mod',
      projectTypes:[candidate.projectType || 'mod'],
      providerLinks:mergeProviderLinks(discovered.links || []),
    };
    addProjectToIndex(index, project);
    return { project, reused:false, source:project.providerLinks.length ? 'provider-search' : 'unresolved' };
  }

  return { resolve, index };
}

module.exports = {
  nameScore, searchModrinth, searchCurseForge,
  buildProjectIndex, addProjectToIndex, findExistingProject, createResolver,
};
