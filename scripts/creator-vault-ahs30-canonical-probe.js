'use strict';
const path = require('path');
const assert = require('assert');
const { loadCreatorVault } = require('../src/creator-vault');
const research = require('../catalog/creator-vault/research/asianhalfsquat.chunk30-source.json');
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

assert.strictEqual(vault.stats.recommendations, 977, 'Chunk 29 mention baseline drift');
assert.strictEqual(vault.stats.uniqueProjects, 667, 'Chunk 29 canonical-project baseline drift');
assert.strictEqual(research.sourceMentions, 10, 'research sourceMentions drift');
assert.strictEqual(research.videos.length, 1, 'Chunk 30 must contain exactly one recommendation-bearing video');
assert.strictEqual(research.chronologyEvidence.length, 1, 'May 28 chronology record missing');
const chronology = research.chronologyEvidence[0];
assert.strictEqual(chronology.publishedAt, '2024-05-28', 'May 28 chronology date drift');
assert.strictEqual(chronology.title, 'Soaring Through The Clouds', 'May 28 chronology title drift');
assert.strictEqual(chronology.durationSeconds, 24, 'May 28 duration drift');
assert.strictEqual(chronology.videoId, null, 'May 28 ID must remain explicit recovery debt');
assert.strictEqual(chronology.recommendationCount, 0, 'May 28 must not contribute inferred recommendations');

const video = research.videos[0];
assert.strictEqual(video.id, 'youtube:XO51AADPLDg', 'May 24 video ID drift');
assert.strictEqual(video.title, 'Top 10 Minecraft Mods (1.20.6) - 2024', 'May 24 title drift');
assert.strictEqual(video.publishedAt, '2024-05-24', 'May 24 date drift');
assert.strictEqual(video.recommendations.length, 10, 'May 24 recommendation count drift');
const expectedSeconds = [24,46,64,78,102,118,140,175,214,236];
assert.deepStrictEqual(video.recommendations.map(item => item.timestampSeconds), expectedSeconds, 'May 24 timestamp drift');

const rows = video.recommendations.map(rec => {
  const hit = byName.get(key(rec.name)) || null;
  return {
    videoId: video.id,
    publishedAt: video.publishedAt,
    name: rec.name,
    projectType: rec.projectType,
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
for (const excluded of ['Fabric / Forge setup links', 'Minecraft Volume Beta - Taswell']) {
  assert(!rows.some(row => key(row.name) === key(excluded)), `excluded evidence leaked into recommendations: ${excluded}`);
}

console.log(JSON.stringify({
  phase: 'chunk-30-canonical-probe',
  baseline: {recommendations:vault.stats.recommendations,uniqueProjects:vault.stats.uniqueProjects},
  chronologyEvidence: chronology,
  recommendationVideos: research.videos.length,
  sourceMentions: rows.length,
  matchedExistingMentions: matched.length,
  unmatchedMentions: unmatched.length,
  uniqueUnmatchedCandidates: uniqueUnmatched.length,
  matched,
  uniqueUnmatched,
  rows
}, null, 2));
