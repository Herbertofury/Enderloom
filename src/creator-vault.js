'use strict';
const fs = require('fs');
const path = require('path');

const SCHEMA_VERSION = 1;

function cleanText(value) { return String(value == null ? '' : value).trim(); }
function unique(values) { return [...new Set((values || []).filter(Boolean))]; }
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
  const url = cleanText(videoUrl);
  const n = Number(seconds);
  if (!url || !Number.isFinite(n) || n < 0) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('t', `${Math.floor(n)}s`);
    return parsed.toString();
  } catch { return url; }
}
function normalizeCreator(raw) {
  const creator = raw && typeof raw === 'object' ? raw : {};
  return {
    ...creator,
    id: cleanText(creator.id),
    title: cleanText(creator.title || creator.handle || creator.id),
    platform: cleanText(creator.platform).toLowerCase(),
    handle: cleanText(creator.handle),
    url: cleanText(creator.url),
    role: cleanText(creator.role || 'recommended'),
    required: creator.required === true,
    status: cleanText(creator.status || 'queued'),
    wikiStatus: cleanText(creator.wikiStatus || 'tracked'),
    coverage: creator.coverage && typeof creator.coverage === 'object' ? { ...creator.coverage } : { complete:false, state:'queued' }
  };
}
function normalizeMod(raw, video) {
  const mod = raw && typeof raw === 'object' ? raw : {};
  const seconds = Number(mod.timestampSeconds);
  return {
    ...mod,
    name: cleanText(mod.name),
    projectType: cleanText(mod.projectType || 'mod'),
    url: cleanText(mod.url),
    loader: unique(Array.isArray(mod.loader) ? mod.loader.map(cleanText) : []),
    timestamp: cleanText(mod.timestamp),
    timestampSeconds: Number.isFinite(seconds) && seconds >= 0 ? seconds : null,
    videoLink: cleanText(mod.videoLink) || timestampUrl(video.url, seconds),
    evidence: cleanText(mod.evidence),
    sourceKinds: unique(Array.isArray(mod.sourceKinds) ? mod.sourceKinds.map(cleanText) : []),
    confidence: Number.isFinite(Number(mod.confidence)) ? Number(mod.confidence) : null
  };
}
function normalizeVideo(raw) {
  const video = raw && typeof raw === 'object' ? raw : {};
  const out = {
    ...video,
    id: cleanText(video.id),
    creatorId: cleanText(video.creatorId),
    platform: cleanText(video.platform || 'youtube').toLowerCase(),
    url: cleanText(video.url),
    title: cleanText(video.title),
    publishedAt: cleanText(video.publishedAt),
    evidenceKinds: unique(Array.isArray(video.evidenceKinds) ? video.evidenceKinds.map(cleanText) : []),
    mods: []
  };
  out.mods = (Array.isArray(video.mods) ? video.mods : []).map(mod => normalizeMod(mod, out)).filter(mod => mod.name);
  return out;
}
function dedupeById(rows, diagnostics, source) {
  const seen = new Set();
  const out = [];
  for (const row of rows || []) {
    const id = cleanText(row && row.id);
    if (!id) {
      diagnostics.push({ level:'warning', source, message:'Skipped record without an id.' });
      continue;
    }
    if (seen.has(id)) {
      diagnostics.push({ level:'warning', source, message:`Skipped duplicate id: ${id}` });
      continue;
    }
    seen.add(id);
    out.push(row);
  }
  return out;
}
function loadCreatorVault(rootDir) {
  const diagnostics = [];
  const dir = path.join(rootDir, 'catalog', 'creator-vault');
  const creatorsDoc = readJson(path.join(dir, 'creators.json'), { creators:[] }, diagnostics, 'creators.json');
  const recDoc = readJson(path.join(dir, 'recommendations.json'), { videos:[], channelSetupPacks:[] }, diagnostics, 'recommendations.json');
  const creators = dedupeById((Array.isArray(creatorsDoc.creators) ? creatorsDoc.creators : []).map(normalizeCreator), diagnostics, 'creators.json');
  const videos = dedupeById((Array.isArray(recDoc.videos) ? recDoc.videos : []).map(normalizeVideo), diagnostics, 'recommendations.json');
  const creatorIds = new Set(creators.map(x => x.id));
  for (const video of videos) if (video.creatorId && !creatorIds.has(video.creatorId)) diagnostics.push({ level:'warning', source:'recommendations.json', message:`Video ${video.id} references unknown creator ${video.creatorId}.` });
  const channelSetupPacks = (Array.isArray(recDoc.channelSetupPacks) ? recDoc.channelSetupPacks : []).map(pack => ({
    ...pack,
    name: cleanText(pack && pack.name),
    projectType: cleanText(pack && pack.projectType || 'resourcepack'),
    creatorId: cleanText(pack && pack.creatorId),
    evidence: cleanText(pack && pack.evidence),
    sourceVideoIds: unique(Array.isArray(pack && pack.sourceVideoIds) ? pack.sourceVideoIds.map(cleanText) : [])
  })).filter(pack => pack.name);
  const recommendationCount = videos.reduce((sum, video) => sum + video.mods.length, 0);
  const indexedCreators = new Set(videos.map(video => video.creatorId).filter(Boolean)).size;
  const updatedAt = [cleanText(creatorsDoc.updatedAt), cleanText(recDoc.updatedAt)].filter(Boolean).sort().pop() || '';
  return {
    schemaVersion: SCHEMA_VERSION,
    updatedAt,
    strategy: cleanText(creatorsDoc.strategy || recDoc.strategy || 'full-history-first/incremental-after'),
    creators,
    videos,
    channelSetupPacks,
    stats: {
      creators: creators.length,
      indexedCreators,
      videos: videos.length,
      recommendations: recommendationCount,
      setupPacks: channelSetupPacks.length
    },
    diagnostics
  };
}

module.exports = { SCHEMA_VERSION, loadCreatorVault, normalizeCreator, normalizeVideo, normalizeMod, timestampUrl };
