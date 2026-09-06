'use strict';
const path = require('path');
const assert = require('assert');
const { loadCreatorVault } = require('../src/creator-vault');
const research = require('../catalog/creator-vault/research/asianhalfsquat.chunk29-source.json');
const root = path.resolve(__dirname, '..');
const vault = loadCreatorVault(root);

const key = value => String(value || '')
  .trim().toLowerCase().normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim().replace(/\s+/g, ' ');

const byName = new Map();
for (const project of vault.projects) {
  for (const label of [project.name, ...(project.aliases || [])]) {
    const k = key(label);
    if (k && !byName.has(k)) byName.set(k, project);
  }
}

const rows = [];
for (const video of research.videos) {
  for (const rec of video.recommendations) {
    const hit = byName.get(key(rec.name)) || null;
    rows.push({
      videoId: video.id,
      publishedAt: video.publishedAt,
      name: rec.name,
      projectType: rec.projectType,
      timestampSeconds: rec.timestampSeconds,
      sectionLabel: rec.sectionLabel,
      canonicalProjectId: hit ? hit.id : null,
      canonicalName: hit ? hit.name : null,
      existingLinks: hit ? (hit.providerLinks || []).length : 0,
      existingProviders: hit ? [...new Set((hit.providerLinks || []).map(link => link.provider))] : []
    });
  }
}

const matched = rows.filter(row => row.canonicalProjectId);
const unmatched = rows.filter(row => !row.canonicalProjectId);
const uniqueUnmatched = [...new Map(unmatched.map(row => [key(row.name), row])).values()];
const expectedVideos = [
  ['youtube:gBMEwunuEUI', 'The Best Minecraft Graphics Mod Is Available Now', '2024-06-10', 15],
  ['youtube:6LG88eiovYM', 'How to Turn Minecraft into an Overly Realistic Survival Game', '2024-05-31', 28]
];
for (const [id, title, publishedAt, count] of expectedVideos) {
  const video = research.videos.find(item => item.id === id);
  assert(video, `missing frozen video ${id}`);
  assert.strictEqual(video.title, title, `${id} title drift`);
  assert.strictEqual(video.publishedAt, publishedAt, `${id} date drift`);
  assert.strictEqual(video.recommendations.length, count, `${id} recommendation count drift`);
}

const allowedSeconds = new Set([null,18,33,50,67,93,113,130,160,171,180,198,213,225,243,268,275,285,298,306,319,340,350,373,386,394,406,431,457]);
assert(rows.every(row => allowedSeconds.has(row.timestampSeconds)), 'unexpected source timestamp');
assert.strictEqual(rows.filter(row => row.timestampSeconds === null).length, 15, 'June 10 should have exactly 15 untimestamped mentions');
assert.strictEqual(research.videos.length, 2, 'Chunk 29 must stay a two-video batch');
assert.strictEqual(research.sourceMentions, 43, 'research sourceMentions drift');
assert.strictEqual(rows.length, 43, 'flattened source mention count drift');
assert.strictEqual(vault.stats.recommendations, 934, 'Chunk 28 mention baseline drift');
assert.strictEqual(vault.stats.uniqueProjects, 650, 'Chunk 28 canonical-project baseline drift');
for (const excluded of ['Fabric', 'A few Ideas', 'Timelapse', 'Your Suggestions - Unicorn Heads']) {
  assert(!rows.some(row => key(row.name) === key(excluded)), `excluded evidence leaked into recommendations: ${excluded}`);
}

console.log(JSON.stringify({
  phase: 'chunk-29-canonical-probe',
  currentStats: vault.stats,
  videos: research.videos.length,
  sourceMentions: rows.length,
  matchedExistingMentions: matched.length,
  unmatchedMentions: unmatched.length,
  uniqueUnmatchedCandidates: uniqueUnmatched.length,
  perVideo: expectedVideos.map(([id, title, publishedAt]) => ({
    id, title, publishedAt,
    sourceMentions: rows.filter(row => row.videoId === id).length,
    matched: rows.filter(row => row.videoId === id && row.canonicalProjectId).length,
    unmatched: rows.filter(row => row.videoId === id && !row.canonicalProjectId).length
  })),
  matched: matched.map(row => ({
    videoId: row.videoId,
    name: row.name,
    canonicalProjectId: row.canonicalProjectId,
    canonicalName: row.canonicalName,
    existingLinks: row.existingLinks,
    existingProviders: row.existingProviders
  })),
  uniqueUnmatched: uniqueUnmatched.map(row => ({
    videoId: row.videoId,
    name: row.name,
    projectType: row.projectType,
    timestampSeconds: row.timestampSeconds,
    sectionLabel: row.sectionLabel
  })),
  rows
}, null, 2));
