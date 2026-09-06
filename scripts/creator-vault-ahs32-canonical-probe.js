'use strict';
const path = require('path');
const assert = require('assert');
const { loadCreatorVault } = require('../src/creator-vault');
const research = require('../catalog/creator-vault/research/asianhalfsquat.chunk32-source.json');
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

assert.strictEqual(vault.stats.recommendations, 996, 'Chunk 31 mention baseline drift');
assert.strictEqual(vault.stats.uniqueProjects, 672, 'Chunk 31 canonical-project baseline drift');
assert.strictEqual(research.baseline.ahsIndexedVideos, 52, 'Chunk 31 AHS baseline drift');
assert.strictEqual(research.sourceMentions, 10, 'research sourceMentions drift');
assert.strictEqual(research.videos.length, 1, 'Chunk 32 must contain exactly one recommendation-bearing research video');
assert.strictEqual(research.chronologyEvidence.length, 0, 'Chunk 32 should not add chronology-only records');

const video = research.videos[0];
assert.strictEqual(video.id, 'youtube:Z50_ryPNNAc', 'Feb 23 video ID drift');
assert.strictEqual(video.title, 'Top 10 Minecraft Mods (1.20) - 2024', 'Feb 23 title drift');
assert.strictEqual(video.publishedAt, '2024-02-23', 'Feb 23 date drift');
assert.strictEqual(video.recommendations.length, 10, 'Feb 23 recommendation count drift');
const expectedNames = ['Infinity Cave','Dynamic Surroundings','Chunk By Chunk','Multi Mine','Thin Air','Horse Combat Controls','Grappling Hook Mod','Atmospheric Phenomena','BetterEnd','Exposure'];
const expectedTimestamps = [22,52,81,108,129,170,142,232,253,278];
assert.deepStrictEqual(video.recommendations.map(item => item.name), expectedNames, 'Feb 23 creator list/order drift');
assert.deepStrictEqual(video.recommendations.map(item => item.timestampSeconds), expectedTimestamps, 'Feb 23 creator timestamp/order drift');
assert(video.recommendations.every(item => item.projectType === 'mod' && item.sectionLabel === 'MODS'), 'non-MODS item leaked into recommendation set');
const excludedLabels = video.excludedEvidence.map(item => item.sourceLabel);
assert(excludedLabels.includes('Complementary Reimagined'), 'post-outro shader evidence must remain explicit');
assert(!video.recommendations.some(item => item.name === 'Complementary Reimagined'), 'post-outro shader leaked into Top-10 recommendations');

const rows = video.recommendations.map(rec => {
  const hit = byName.get(key(rec.name)) || null;
  return {
    videoId: video.id,
    publishedAt: video.publishedAt,
    name: rec.name,
    timestampSeconds: rec.timestampSeconds,
    canonicalProjectId: hit ? hit.id : null,
    canonicalName: hit ? hit.name : null,
    existingLinks: hit ? (hit.providerLinks || []).length : 0,
    existingProviders: hit ? [...new Set((hit.providerLinks || []).map(link => link.provider))] : []
  };
});
const matched = rows.filter(row => row.canonicalProjectId);
const unmatched = rows.filter(row => !row.canonicalProjectId);
const uniqueUnmatched = [...new Map(unmatched.map(row => [key(row.name), row])).values()];
console.log(JSON.stringify({
  phase: 'chunk-32-canonical-probe',
  baseline: {recommendations:vault.stats.recommendations,uniqueProjects:vault.stats.uniqueProjects,ahsIndexedVideos:52},
  recommendationVideos: research.videos.length,
  sourceMentions: rows.length,
  matchedExistingMentions: matched.length,
  unmatchedMentions: unmatched.length,
  uniqueUnmatchedCandidates: uniqueUnmatched.length,
  matched,
  uniqueUnmatched,
  rows
}, null, 2));
