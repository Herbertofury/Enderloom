'use strict';
const path = require('path');
const assert = require('assert');
const { loadCreatorVault } = require('../src/creator-vault');
const research = require('../catalog/creator-vault/research/asianhalfsquat.chunk28-source.json');
const root = path.resolve(__dirname, '..');
const vault = loadCreatorVault(root);

const key = value => String(value || '')
  .trim()
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .replace(/\s+/g, ' ');

const urlKey = value => {
  if (!value) return '';
  try {
    const url = new URL(String(value).trim());
    url.hash = '';
    url.search = '';
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    url.pathname = url.pathname.replace(/\/+$/, '') || '/';
    return `${url.protocol.toLowerCase()}//${url.hostname}${url.pathname}`.toLowerCase();
  } catch {
    return String(value).trim().replace(/\/+$/, '').toLowerCase();
  }
};

const byName = new Map();
const urlOwners = new Map();
for (const project of vault.projects) {
  for (const label of [project.name, ...(project.aliases || [])]) {
    const k = key(label);
    if (k && !byName.has(k)) byName.set(k, project);
  }
  for (const link of project.providerLinks || []) {
    const k = urlKey(link.url);
    if (!k) continue;
    if (!urlOwners.has(k)) urlOwners.set(k, new Map());
    urlOwners.get(k).set(project.id, project);
  }
}

const rows = [];
for (const video of research.videos) {
  for (const rec of video.recommendations) {
    const nameHit = byName.get(key(rec.name)) || null;
    const urlMatches = rec.creatorUrl && urlOwners.has(urlKey(rec.creatorUrl))
      ? [...urlOwners.get(urlKey(rec.creatorUrl)).values()]
      : [];
    const urlHit = urlMatches.length === 1 ? urlMatches[0] : null;
    const hit = nameHit || urlHit || null;
    const existingUrls = hit ? new Set((hit.providerLinks || []).map(link => urlKey(link.url))) : new Set();
    rows.push({
      videoId: video.id,
      publishedAt: video.publishedAt,
      name: rec.name,
      projectType: rec.projectType,
      sectionLabel: rec.sectionLabel,
      timestampSeconds: rec.timestampSeconds,
      creatorUrl: rec.creatorUrl || null,
      matchKind: nameHit ? 'name-or-alias' : (urlHit ? 'creator-url' : null),
      canonicalProjectId: hit ? hit.id : null,
      canonicalName: hit ? hit.name : null,
      existingLinks: hit ? (hit.providerLinks || []).length : 0,
      existingProviders: hit ? [...new Set((hit.providerLinks || []).map(link => link.provider))] : [],
      creatorUrlAlreadyOwned: Boolean(hit && rec.creatorUrl && existingUrls.has(urlKey(rec.creatorUrl))),
      creatorUrlCollisionOwners: urlMatches.length > 1 ? urlMatches.map(project => project.id) : []
    });
  }
}

const matched = rows.filter(row => row.canonicalProjectId);
const unmatched = rows.filter(row => !row.canonicalProjectId);
const uniqueUnmatched = [...new Map(unmatched.map(row => [key(row.name), row])).values()];
const enrichmentCandidates = [...new Map(
  matched
    .filter(row => row.creatorUrl && !row.creatorUrlAlreadyOwned)
    .map(row => [`${row.canonicalProjectId}\n${urlKey(row.creatorUrl)}`, row])
).values()];
const urlCollisionRows = rows.filter(row => row.creatorUrlCollisionOwners.length > 1);

const expectedVideos = [
  ['youtube:IL804sqMbbE', 'Turning Minecraft Into Elden Ring With Mods 2.0', '2024-08-03', 43],
  ['youtube:o499NnspGIM', 'Minecraft Mod Combinations That Work Perfectly Together #7', '2024-07-09', 26],
  ['youtube:94j9prLG-Sc', 'I Made Minecraft As Immersive As Possible Using Mods', '2024-06-15', 32]
];
for (const [id, title, publishedAt, count] of expectedVideos) {
  const video = research.videos.find(item => item.id === id);
  assert(video, `missing frozen video ${id}`);
  assert.strictEqual(video.title, title, `${id} title drift`);
  assert.strictEqual(video.publishedAt, publishedAt, `${id} date drift`);
  assert.strictEqual(video.recommendations.length, count, `${id} recommendation count drift`);
}

const allowedSeconds = new Set([null, 32, 39, 85, 117, 130, 176, 244, 267, 297, 320, 334, 360, 376, 418, 454, 462, 490, 523, 528, 788]);
assert(rows.every(row => allowedSeconds.has(row.timestampSeconds)), 'unexpected section timestamp');
assert.strictEqual(rows.filter(row => row.timestampSeconds === null).length, 2, 'only Sodium + Iris may have null timestamps');
assert.strictEqual(research.videos.length, 3, 'Chunk 28 must stay a three-video batch');
assert.strictEqual(research.sourceMentions, 101, 'research sourceMentions drift');
assert.strictEqual(rows.length, 101, 'flattened source mention count drift');
assert.strictEqual(vault.stats.recommendations, 833, 'Chunk 27 mention baseline drift');
assert.strictEqual(vault.stats.uniqueProjects, 600, 'Chunk 27 canonical-project baseline drift');
assert(!rows.some(row => key(row.name) === key("YUNG's Better Mods")), 'June creator umbrella must remain related evidence only');
for (const removed of ['Campfire Spawn and Tweaks', 'Estus', 'Immersive FX', 'Optifine', 'Vanilla Vistas', 'Music Triggers', 'Mutant More']) {
  assert(!rows.some(row => key(row.name) === key(removed)), `removed August project leaked into recommendations: ${removed}`);
}

console.log(JSON.stringify({
  phase: 'chunk-28-canonical-probe',
  currentStats: vault.stats,
  videos: research.videos.length,
  sourceMentions: rows.length,
  matchedExistingMentions: matched.length,
  unmatchedMentions: unmatched.length,
  uniqueUnmatchedCandidates: uniqueUnmatched.length,
  creatorUrlEnrichmentCandidates: enrichmentCandidates.length,
  creatorUrlCollisionRows: urlCollisionRows.length,
  perVideo: expectedVideos.map(([id, title, publishedAt]) => ({
    id,
    title,
    publishedAt,
    sourceMentions: rows.filter(row => row.videoId === id).length,
    matched: rows.filter(row => row.videoId === id && row.canonicalProjectId).length,
    unmatched: rows.filter(row => row.videoId === id && !row.canonicalProjectId).length
  })),
  matched: matched.map(row => ({
    videoId: row.videoId,
    name: row.name,
    matchKind: row.matchKind,
    canonicalProjectId: row.canonicalProjectId,
    canonicalName: row.canonicalName,
    existingLinks: row.existingLinks,
    existingProviders: row.existingProviders,
    creatorUrl: row.creatorUrl,
    creatorUrlAlreadyOwned: row.creatorUrlAlreadyOwned
  })),
  uniqueUnmatched: uniqueUnmatched.map(row => ({
    videoId: row.videoId,
    name: row.name,
    projectType: row.projectType,
    creatorUrl: row.creatorUrl,
    timestampSeconds: row.timestampSeconds,
    sectionLabel: row.sectionLabel
  })),
  enrichmentCandidates: enrichmentCandidates.map(row => ({
    videoId: row.videoId,
    name: row.name,
    canonicalProjectId: row.canonicalProjectId,
    canonicalName: row.canonicalName,
    creatorUrl: row.creatorUrl,
    existingProviders: row.existingProviders
  })),
  urlCollisionRows,
  rows
}, null, 2));
