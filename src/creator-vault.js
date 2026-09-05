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
function normalizeProvider(value, url) {
  const raw = cleanText(value);
  const key = raw.toLowerCase();
  if (key === 'curseforge') return 'CurseForge';
  if (key === 'modrinth') return 'Modrinth';
  if (raw) return raw;
  const target = cleanText(url);
  if (/curseforge\.com/i.test(target)) return 'CurseForge';
  if (/modrinth\.com/i.test(target)) return 'Modrinth';
  return '';
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
  const url = cleanText(mod.url);
  return {
    ...mod,
    name: cleanText(mod.name),
    projectType: cleanText(mod.projectType || 'mod'),
    url,
    provider: normalizeProvider(mod.provider, url),
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
function normalizeImportedVideo(raw, entry) {
  const platform = cleanText(raw && raw.platform || 'youtube').toLowerCase() || 'youtube';
  const sourceId = cleanText(raw && raw.id);
  const mods = Array.isArray(raw && raw.mods) ? raw.mods : [];
  const sourceEvidenceKinds = unique(mods.flatMap(mod => Array.isArray(mod && mod.sourceKinds) ? mod.sourceKinds.map(cleanText) : []));
  return normalizeVideo({
    ...(raw || {}),
    id: sourceId ? `${platform}:${sourceId}` : '',
    creatorId: cleanText(entry.creatorId),
    platform,
    evidenceKinds: unique([...(Array.isArray(raw && raw.evidenceKinds) ? raw.evidenceKinds : []), ...sourceEvidenceKinds, 'legacy-catalog']),
    importId: cleanText(entry.id),
    importSourceSystem: cleanText(entry.sourceSystem),
    importSourceDriveFileId: cleanText(entry.sourceDriveFileId)
  });
}
function loadImportedVideos(dir, diagnostics) {
  const importsDoc = readJson(path.join(dir, 'imports.json'), { imports:[] }, diagnostics, 'imports.json');
  const videos = [];
  const imports = [];
  for (const rawEntry of Array.isArray(importsDoc.imports) ? importsDoc.imports : []) {
    const entry = rawEntry && typeof rawEntry === 'object' ? { ...rawEntry } : {};
    const importId = cleanText(entry.id);
    const creatorId = cleanText(entry.creatorId);
    const fileRows = Array.isArray(entry.files) && entry.files.length
      ? entry.files.map(row => typeof row === 'string' ? { file:row } : row)
      : (cleanText(entry.file) ? [{ file:entry.file }] : []);
    if (!importId || !creatorId || !fileRows.length) {
      diagnostics.push({ level:'warning', source:'imports.json', message:'Skipped creator import missing id, creatorId, or file(s).' });
      continue;
    }
    const imported = [];
    let failed = false;
    for (const fileRow of fileRows) {
      const relativeFile = cleanText(fileRow && fileRow.file);
      const absolute = path.resolve(dir, relativeFile);
      const safeRoot = path.resolve(dir) + path.sep;
      if (!relativeFile || !absolute.startsWith(safeRoot)) {
        diagnostics.push({ level:'error', source:'imports.json', message:`Rejected creator import outside Creator Vault directory: ${relativeFile}` });
        failed = true;
        continue;
      }
      if (!fs.existsSync(absolute)) {
        diagnostics.push({ level:'error', source:'imports.json', message:`Creator import file is missing: ${relativeFile}` });
        failed = true;
        continue;
      }
      const catalog = readJson(absolute, null, diagnostics, relativeFile);
      if (!catalog || !Array.isArray(catalog.videos)) { failed = true; continue; }
      imported.push(...catalog.videos.map(video => normalizeImportedVideo(video, entry)).filter(video => video.id));
    }
    if (failed) continue;
    videos.push(...imported);
    imports.push({
      id: importId,
      creatorId,
      files: fileRows.map(row => ({ file:cleanText(row.file), sha256:cleanText(row.sha256), videos:Number(row.videos)||0, recommendations:Number(row.recommendations)||0 })),
      sourceSystem: cleanText(entry.sourceSystem),
      sourceDriveFileId: cleanText(entry.sourceDriveFileId),
      sourceUpdatedAt: cleanText(entry.sourceUpdatedAt),
      sourceDriveSha256: cleanText(entry.sourceDriveSha256),
      sourceSnapshotSha256: cleanText(entry.sourceSnapshotSha256),
      expectedVideos: Number.isFinite(Number(entry.expectedVideos)) ? Number(entry.expectedVideos) : null,
      videos: imported.length,
      recommendations: imported.reduce((sum, video) => sum + video.mods.length, 0)
    });
  }
  return { videos, imports, updatedAt: cleanText(importsDoc.updatedAt) };
}
function expandRecommendationDocument(doc) {
  if (!doc || typeof doc !== 'object') return { videos:[], channelSetupPacks:[], queuedDiscoveries:[] };
  const defaults = doc.defaults && typeof doc.defaults === 'object' ? doc.defaults : {};
  const videos = (Array.isArray(doc.videos) ? doc.videos : []).map(rawVideo => {
    if (!Array.isArray(rawVideo && rawVideo.entries)) return rawVideo;
    const video = { ...rawVideo, creatorId:cleanText(rawVideo.creatorId || defaults.creatorId), platform:cleanText(rawVideo.platform || defaults.platform || 'youtube') };
    video.mods = rawVideo.entries.map(row => {
      const values = Array.isArray(row) ? row : [];
      return {
        name: cleanText(values[0]),
        timestamp: cleanText(values[1]),
        timestampSeconds: Number(values[2]),
        loader: Array.isArray(values[3]) ? values[3] : [],
        projectType: cleanText(defaults.projectType || 'mod'),
        evidence: cleanText(defaults.evidence),
        sourceKinds: Array.isArray(defaults.sourceKinds) ? defaults.sourceKinds : [],
        confidence: Number.isFinite(Number(defaults.confidence)) ? Number(defaults.confidence) : null
      };
    });
    delete video.entries;
    return video;
  });
  return { ...doc, videos };
}
function loadRecommendationDocuments(dir, diagnostics) {
  const docs = [];
  const primaryFile = path.join(dir, 'recommendations.json');
  docs.push({ source:'recommendations.json', doc:expandRecommendationDocument(readJson(primaryFile, { videos:[], channelSetupPacks:[], queuedDiscoveries:[] }, diagnostics, 'recommendations.json')) });
  const sourceDir = path.join(dir, 'recommendation-sources');
  if (fs.existsSync(sourceDir)) {
    for (const name of fs.readdirSync(sourceDir).filter(name => name.toLowerCase().endsWith('.json')).sort()) {
      const relative = path.join('recommendation-sources', name).replace(/\\/g, '/');
      docs.push({ source:relative, doc:expandRecommendationDocument(readJson(path.join(sourceDir, name), { videos:[], channelSetupPacks:[], queuedDiscoveries:[] }, diagnostics, relative)) });
    }
  }
  return {
    videos: docs.flatMap(({ doc }) => Array.isArray(doc.videos) ? doc.videos : []),
    channelSetupPacks: docs.flatMap(({ doc }) => Array.isArray(doc.channelSetupPacks) ? doc.channelSetupPacks : []),
    queuedDiscoveries: docs.flatMap(({ doc }) => Array.isArray(doc.queuedDiscoveries) ? doc.queuedDiscoveries : []),
    updatedAt: docs.map(({ doc }) => cleanText(doc.updatedAt)).filter(Boolean).sort().pop() || '',
    strategy: docs.map(({ doc }) => cleanText(doc.strategy)).find(Boolean) || '',
    sources: docs.map(({ source }) => source)
  };
}

function loadCreatorVault(rootDir) {
  const diagnostics = [];
  const dir = path.join(rootDir, 'catalog', 'creator-vault');
  const creatorsDoc = readJson(path.join(dir, 'creators.json'), { creators:[] }, diagnostics, 'creators.json');
  const recDoc = loadRecommendationDocuments(dir, diagnostics);
  const imported = loadImportedVideos(dir, diagnostics);
  const creators = dedupeById((Array.isArray(creatorsDoc.creators) ? creatorsDoc.creators : []).map(normalizeCreator), diagnostics, 'creators.json');
  const nativeVideos = (Array.isArray(recDoc.videos) ? recDoc.videos : []).map(normalizeVideo);
  const videos = dedupeById([...nativeVideos, ...imported.videos], diagnostics, 'creator-vault videos');
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
  const updatedAt = [cleanText(creatorsDoc.updatedAt), cleanText(recDoc.updatedAt), cleanText(imported.updatedAt)].filter(Boolean).sort().pop() || '';
  return {
    schemaVersion: SCHEMA_VERSION,
    updatedAt,
    strategy: cleanText(creatorsDoc.strategy || recDoc.strategy || 'full-history-first/incremental-after'),
    creators,
    videos,
    imports: imported.imports,
    channelSetupPacks,
    stats: {
      creators: creators.length,
      indexedCreators,
      videos: videos.length,
      recommendations: recommendationCount,
      verifiedHomes: videos.flatMap(video => video.mods).filter(mod => mod.url).length,
      importedCatalogs: imported.imports.length,
      nativeRecommendationSources: recDoc.sources.length,
      setupPacks: channelSetupPacks.length
    },
    diagnostics
  };
}

module.exports = { SCHEMA_VERSION, loadCreatorVault, loadRecommendationDocuments, expandRecommendationDocument, normalizeCreator, normalizeVideo, normalizeMod, normalizeProvider, normalizeImportedVideo, loadImportedVideos, timestampUrl };
