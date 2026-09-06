'use strict';
const path = require('path');
const assert = require('assert');
const { loadCreatorVault } = require('../src/creator-vault');
const research = require('../catalog/creator-vault/research/asianhalfsquat.chunk31-source.json');
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

assert.strictEqual(vault.stats.recommendations, 987, 'Chunk 30 mention baseline drift');
assert.strictEqual(vault.stats.uniqueProjects, 672, 'Chunk 30 canonical-project baseline drift');
assert.strictEqual(research.sourceMentions, 9, 'research sourceMentions drift');
assert.strictEqual(research.videos.length, 1, 'Chunk 31 must contain exactly one recommendation-bearing video');
assert.strictEqual(research.chronologyEvidence.length, 0, 'Chunk 31 should not add chronology-only records');

const video = research.videos[0];
assert.strictEqual(video.id, 'youtube:7NruFXLqOi8', 'March 5 video ID drift');
assert.strictEqual(video.title, 'Minecraft Has Never Looked This Good', 'March 5 title drift');
assert.strictEqual(video.publishedAt, '2024-03-05', 'March 5 date drift');
assert.strictEqual(video.recommendations.length, 9, 'March 5 recommendation count drift');
const expectedNames = ['Distant Horizons','Iris','Sodium','C2ME','Bliss Shaders','Tectonic','Terra','Terralith','Exposure'];
assert.deepStrictEqual(video.recommendations.map(item => item.name), expectedNames, 'March 5 creator list drift');
assert(video.recommendations.every(item => item.timestampSeconds == null), 'untimestamped source must not gain fabricated timestamps');
assert.strictEqual(video.recommendations.find(item => item.name === 'Bliss Shaders').projectType, 'shader', 'Bliss Shaders type drift');

const rows = video.recommendations.map(rec => {
  const hit = byName.get(key(rec.name)) || null;
  return {
    videoId: video.id,
    publishedAt: video.publishedAt,
    name: rec.name,
    projectType: rec.projectType,
    canonicalProjectId: hit ? hit.id : null,
    canonicalName: hit ? hit.name : null,
    existingLinks: hit ? (hit.providerLinks || []).length : 0,
    existingProviders: hit ? [...new Set((hit.providerLinks || []).map(link => link.provider))] : []
  };
});
const matched = rows.filter(row => row.canonicalProjectId);
const unmatched = rows.filter(row => !row.canonicalProjectId);
const uniqueUnmatched = [...new Map(unmatched.map(row => [key(row.name), row])).values()];

assert(!rows.some(row => key(row.name).includes('discord')), 'excluded version-access evidence leaked into recommendations');

console.log(JSON.stringify({
  phase: 'chunk-31-canonical-probe',
  baseline: {recommendations:vault.stats.recommendations,uniqueProjects:vault.stats.uniqueProjects},
  recommendationVideos: research.videos.length,
  sourceMentions: rows.length,
  matchedExistingMentions: matched.length,
  unmatchedMentions: unmatched.length,
  uniqueUnmatchedCandidates: uniqueUnmatched.length,
  matched,
  uniqueUnmatched,
  rows
}, null, 2));
