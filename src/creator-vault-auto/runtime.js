'use strict';

const path = require('path');
const crypto = require('crypto');
const { mergeProviderLinks } = require('../creator-vault');
const { now, clean, unique, safeUrl, providerForUrl, projectLink, mapConcurrent, clampInt } = require('./common');
const {
  readRuntimeState, writeRuntimeState, loadMergedCreatorVault,
  upsertCreator, upsertProject, upsertVideo, upsertReview, pruneResolverCache,
  patchRenderedCatalogs, runtimeStatus,
} = require('./state');
const { parseCreatorDescription } = require('./parser');
const { beginBrowserPool, endBrowserPool, enumerateCreatorVideos, readCreatorVideo } = require('./browser');
const { createResolver } = require('./resolver');

const ROOT_DIR = path.resolve(__dirname, '../..');
let syncFlight = null;

function sourceVideoId(video) {
  const id = String(video?.id || '');
  const colon = id.indexOf(':');
  return colon >= 0 ? id.slice(colon + 1) : id;
}
function makeReview(kind, context, candidate, message) {
  const seed = [kind, context.creatorId, context.videoId, candidate?.name || '', message].join('|');
  return {
    id:crypto.createHash('sha1').update(seed).digest('hex').slice(0,18),
    kind,
    status:'open',
    createdAt:now(),
    creatorId:context.creatorId,
    videoId:context.videoId,
    videoUrl:context.videoUrl || '',
    name:candidate?.name || '',
    message,
    raw:candidate || null,
  };
}
function emitProgress(callback, payload) {
  try { callback?.({ at:now(), ...payload }); } catch {}
}
function potentialRecommendation(title, description) {
  const text = `${title || ''}\n${description || ''}`;
  return /\b(mods?|addons?|resource\s*packs?|texture\s*packs?|shaders?|datapacks?|plugins?)\b/i.test(text);
}
function dedupeRefs(rows) {
  const seen = new Set();
  const out = [];
  for (const row of rows || []) {
    const id = clean(row?.id);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push({ ...row, id, url:safeUrl(row.url) });
  }
  return out;
}
function preferredVideoLink(videoUrl, seconds) {
  const safe = safeUrl(videoUrl);
  if (!safe) return '';
  if (!Number.isFinite(Number(seconds)) || Number(seconds) < 0) return safe;
  try {
    const url = new URL(safe);
    url.searchParams.set('t', `${Math.floor(Number(seconds))}s`);
    return url.toString();
  } catch { return safe; }
}
function checkpointFactory(state) {
  let completedSinceWrite = 0;
  let lastWriteAt = Date.now();
  return function checkpoint(force=false) {
    completedSinceWrite++;
    if (!force && completedSinceWrite < 4 && Date.now() - lastWriteAt < 1800) return false;
    completedSinceWrite = 0;
    lastWriteAt = Date.now();
    return writeRuntimeState(state);
  };
}

async function syncOneCreator(creator, context) {
  const { state, vault, resolver, settings, full, maxVideosPerCreator, progress, checkpoint } = context;
  const platform = String(creator.platform || '').toLowerCase();
  const knownIds = new Set((vault.videos || [])
    .filter(video => video.creatorId === creator.id && String(video.platform || '').toLowerCase() === platform)
    .map(sourceVideoId)
    .filter(Boolean));

  emitProgress(progress, { phase:'discover', creatorId:creator.id, message:`Discovering ${creator.title || creator.handle || creator.id} ${full ? 'full history' : 'new uploads'}…` });
  const refs = dedupeRefs(await enumerateCreatorVideos(creator, [...knownIds], full, settings));
  const newRefs = refs.filter(ref => !knownIds.has(ref.id));
  const limit = full
    ? newRefs.length
    : clampInt(maxVideosPerCreator, settings.maxIncrementalVideosPerCreator, 1, 100);
  const work = newRefs.slice(0, limit);
  const counters = { processed:0, mentions:0, failed:0, scanned:0, skipped:0 };

  await mapConcurrent(work, settings.videoConcurrency, async (ref, index) => {
    const normalizedVideoId = `${platform}:${ref.id}`;
    try {
      emitProgress(progress, {
        phase:'video', creatorId:creator.id, videoId:normalizedVideoId,
        current:index + 1, total:work.length,
        message:`Reading ${creator.title || creator.handle || creator.id}: ${index + 1}/${work.length}`,
      });
      const details = await readCreatorVideo(creator, ref);
      const candidates = parseCreatorDescription({
        text:details.description,
        title:details.title || ref.title,
        platform,
        links:details.links,
      });
      const mods = [];
      for (const candidate of candidates) {
        const resolved = await resolver.resolve(candidate);
        const project = resolved.project;
        if (!project?.id || !project?.name) continue;
        const candidateLinks = mergeProviderLinks((candidate.urls || [])
          .filter(projectLink)
          .map(url => ({ provider:providerForUrl(url), url, label:'Creator-linked project home', verified:true })));
        const providerLinks = mergeProviderLinks(project.providerLinks || [], candidateLinks);
        upsertProject(state, {
          id:project.id,
          name:project.name,
          aliases:unique([...(project.aliases || []), candidate.name !== project.name ? candidate.name : '']),
          projectType:candidate.projectType || project.projectType || 'mod',
          projectTypes:unique([...(project.projectTypes || []), candidate.projectType || project.projectType || 'mod']),
          providerLinks,
        });
        if (!providerLinks.length) {
          upsertReview(state, makeReview(
            'provider-unresolved',
            { creatorId:creator.id, videoId:normalizedVideoId, videoUrl:ref.url },
            candidate,
            `No high-confidence direct project home could be resolved automatically for ${candidate.name}.`
          ));
        }
        mods.push({
          name:candidate.name,
          canonicalProjectId:project.id,
          canonicalName:project.name,
          projectType:candidate.projectType || project.projectType || 'mod',
          providerLinks,
          timestamp:candidate.timestamp || '',
          timestampSeconds:candidate.timestampSeconds,
          videoLink:preferredVideoLink(ref.url, candidate.timestampSeconds),
          evidence:candidate.evidence || 'Creator-authored project recommendation',
          sourceKinds:unique([...(candidate.sourceKinds || []), 'auto-ingested']),
          confidence:Number.isFinite(Number(candidate.confidence)) ? Number(candidate.confidence) : null,
        });
      }

      if (!mods.length && potentialRecommendation(details.title || ref.title, details.description)) {
        upsertReview(state, makeReview(
          'structured-list-not-found',
          { creatorId:creator.id, videoId:normalizedVideoId, videoUrl:ref.url },
          { name:details.title || ref.title || ref.id },
          'This looks like recommendation content, but no high-confidence structured project list was extracted. The video is recorded so it will not be re-downloaded every launch.'
        ));
      }
      upsertVideo(state, {
        id:normalizedVideoId,
        creatorId:creator.id,
        platform,
        url:ref.url,
        title:clean(details.title || ref.title || ref.id),
        publishedAt:clean(details.publishedAt),
        evidenceKinds:unique([platform,'creator-page','description','auto-ingested']),
        autoIngested:true,
        autoIngestedAt:now(),
        sourceTab:ref.sourceTab || '',
        scannedNoProjects:mods.length === 0,
        mods,
      });
      counters.scanned++;
      counters.processed++;
      counters.mentions += mods.length;
      checkpoint(false);
    } catch (error) {
      counters.failed++;
      upsertReview(state, makeReview(
        'video-read-failed',
        { creatorId:creator.id, videoId:normalizedVideoId, videoUrl:ref.url },
        { name:ref.title || ref.id },
        String(error?.message || error)
      ));
      checkpoint(false);
    }
  });

  const creatorVideos = [
    ...(vault.videos || []).filter(video => video.creatorId === creator.id),
    ...state.videos.filter(video => video.creatorId === creator.id),
  ];
  const uniqueVideos = new Map(creatorVideos.map(video => [video.id, video]));
  const recommendationCount = [...uniqueVideos.values()].reduce((sum, video) => sum + (video.mods || []).length, 0);
  upsertCreator(state, {
    id:creator.id,
    status:counters.failed ? 'attention' : 'current',
    coverage:{
      ...(creator.coverage || {}),
      complete:full && newRefs.length <= work.length,
      state:counters.failed ? 'attention' : full ? 'history-synced' : 'incremental-current',
      indexedVideos:uniqueVideos.size,
      recommendationCount,
      lastAutoSyncAt:now(),
      autoCataloged:true,
    },
  });
  state.sync.creators[creator.id] = {
    ...(state.sync.creators[creator.id] || {}),
    lastSyncAt:now(),
    state:counters.failed ? 'attention' : 'current',
    discovered:refs.length,
    newVideos:newRefs.length,
    processed:counters.processed,
    mentions:counters.mentions,
    failed:counters.failed,
    full:!!full,
  };
  checkpoint(true);
  emitProgress(progress, {
    phase:'creator-complete', creatorId:creator.id,
    message:`${creator.title || creator.handle || creator.id}: ${counters.processed} new video${counters.processed === 1 ? '' : 's'}, ${counters.mentions} project mention${counters.mentions === 1 ? '' : 's'}.`,
    ...counters,
  });
  return {
    creatorId:creator.id,
    discovered:refs.length,
    newVideos:newRefs.length,
    ...counters,
  };
}

async function runSync({ creatorId='', full=false, trigger='manual', maxVideosPerCreator=null } = {}, progress) {
  if (syncFlight) return syncFlight;
  syncFlight = (async () => {
    const state = readRuntimeState();
    pruneResolverCache(state);
    const settings = state.settings;
    state.sync = { ...state.sync, state:'running', lastRunAt:now(), trigger, creatorId:clean(creatorId), error:'' };
    writeRuntimeState(state);
    emitProgress(progress, { phase:'start', creatorId:clean(creatorId), message:full ? 'Starting full-history creator sync…' : 'Checking creators for new recommendations…' });
    beginBrowserPool(settings.browserPoolSize);
    try {
      const vault = loadMergedCreatorVault(ROOT_DIR);
      const targets = (vault.creators || [])
        .filter(creator => !creatorId || creator.id === creatorId)
        .filter(creator => safeUrl(creator.url));
      if (!targets.length) throw new Error(creatorId ? 'Creator not found' : 'No tracked creators have a supported source URL');
      const resolver = createResolver({ state, vault });
      const checkpoint = checkpointFactory(state);
      const results = await mapConcurrent(targets, settings.creatorConcurrency, async creator => {
        try {
          return await syncOneCreator(creator, {
            state, vault, resolver, settings, full,
            maxVideosPerCreator:maxVideosPerCreator || settings.maxIncrementalVideosPerCreator,
            progress, checkpoint,
          });
        } catch (error) {
          const message = String(error?.message || error);
          state.sync.creators[creator.id] = { ...(state.sync.creators[creator.id] || {}), lastSyncAt:now(), state:'error', error:message };
          upsertReview(state, makeReview('creator-sync-failed', { creatorId:creator.id, videoId:'', videoUrl:creator.url }, { name:creator.title || creator.handle || creator.id }, message));
          checkpoint(true);
          return { creatorId:creator.id, error:message, failed:1, processed:0, mentions:0 };
        }
      });
      state.sync = { ...state.sync, state:'idle', lastSuccessfulRunAt:now(), trigger, creatorId:clean(creatorId), error:'' };
      writeRuntimeState(state);
      const merged = loadMergedCreatorVault(ROOT_DIR);
      const refresh = patchRenderedCatalogs(merged);
      const processed = results.reduce((sum, row) => sum + (row.processed || 0), 0);
      const mentions = results.reduce((sum, row) => sum + (row.mentions || 0), 0);
      const failed = results.reduce((sum, row) => sum + (row.failed || 0), 0);
      emitProgress(progress, {
        phase:'complete',
        message:`Creator sync complete: ${processed} new videos, ${mentions} project mentions${failed ? `, ${failed} item${failed === 1 ? '' : 's'} need attention` : ''}.`,
        stats:merged.stats,
        refresh,
      });
      return { ok:true, results, status:runtimeStatus(ROOT_DIR), vault:merged, refresh };
    } catch (error) {
      state.sync = { ...state.sync, state:'error', error:String(error?.message || error), trigger, creatorId:clean(creatorId) };
      writeRuntimeState(state);
      emitProgress(progress, { phase:'error', message:String(error?.message || error) });
      throw error;
    } finally {
      endBrowserPool();
      syncFlight = null;
    }
  })();
  return syncFlight;
}

function addCreator(raw={}) {
  const state = readRuntimeState();
  const url = safeUrl(raw.url);
  if (!url) throw new Error('A valid HTTP/HTTPS creator URL is required');
  const parsed = new URL(url);
  let platform = clean(raw.platform).toLowerCase();
  if (!platform) {
    if (/(?:^|\.)youtube\.com$/i.test(parsed.hostname)) platform = 'youtube';
    else if (/(?:^|\.)tiktok\.com$/i.test(parsed.hostname)) platform = 'tiktok';
    else platform = 'web';
  }
  let handle = clean(raw.handle);
  if (!handle) handle = parsed.pathname.match(/\/@([^/]+)/)?.[1] || '';
  const slug = (handle || clean(raw.title) || parsed.hostname).replace(/^@/,'').toLowerCase().replace(/[^a-z0-9_-]+/g,'-').replace(/^-|-$/g,'');
  const id = clean(raw.id) || `${platform}:${slug || crypto.randomBytes(5).toString('hex')}`;
  const creator = {
    id,
    title:clean(raw.title) || handle || id,
    platform,
    handle:handle ? (handle.startsWith('@') ? handle : `@${handle}`) : '',
    url,
    role:'recommended',
    required:false,
    status:'queued',
    wikiStatus:'tracked',
    coverage:{ complete:false, state:'queued', autoCataloged:true },
  };
  upsertCreator(state, creator);
  writeRuntimeState(state);
  return { creator, status:runtimeStatus(ROOT_DIR), vault:loadMergedCreatorVault(ROOT_DIR) };
}
function setSettings(patch={}) {
  const state = readRuntimeState();
  if (Object.prototype.hasOwnProperty.call(patch, 'autoSyncOnLaunch')) state.settings.autoSyncOnLaunch = !!patch.autoSyncOnLaunch;
  for (const key of ['launchCooldownHours','maxIncrementalVideosPerCreator','browserHistoryScrollPasses','browserPoolSize','videoConcurrency','creatorConcurrency','resolverCacheDays']) {
    if (Object.prototype.hasOwnProperty.call(patch, key)) state.settings[key] = Number(patch[key]);
  }
  writeRuntimeState(state);
  return runtimeStatus(ROOT_DIR);
}
function ignoreReview(id) {
  const state = readRuntimeState();
  const row = state.review.find(item => item.id === id);
  if (row) {
    row.status = 'ignored';
    row.resolvedAt = now();
    writeRuntimeState(state);
  }
  return runtimeStatus(ROOT_DIR);
}
function getStatus() {
  return runtimeStatus(ROOT_DIR);
}
function mergedVault() {
  return loadMergedCreatorVault(ROOT_DIR);
}

module.exports = {
  ROOT_DIR, sourceVideoId, makeReview, potentialRecommendation, dedupeRefs,
  runSync, addCreator, setSettings, ignoreReview, getStatus, mergedVault,
};
