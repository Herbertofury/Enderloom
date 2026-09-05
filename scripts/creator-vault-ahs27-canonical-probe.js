'use strict';
const path = require('path');
const { loadCreatorVault } = require('../src/creator-vault');
const research = require('../catalog/creator-vault/research/asianhalfsquat.chunk27-source.json');
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
      name: rec.name,
      sectionLabel: rec.sectionLabel,
      timestampSeconds: rec.timestampSeconds,
      canonicalProjectId: hit ? hit.id : null,
      canonicalName: hit ? hit.name : null,
      existingLinks: hit ? (hit.providerLinks || []).length : 0,
      existingProviders: hit ? [...new Set((hit.providerLinks || []).map(link => link.provider))] : []
    });
  }
}

const matched = rows.filter(row => row.canonicalProjectId);
const unmatched = rows.filter(row => !row.canonicalProjectId);
const resolution = (research.resolvedChronology || []).find(item => item.publishedAt === '2024-09-06');

console.log(JSON.stringify({
  currentStats: vault.stats,
  videos: research.videos.length,
  sourceMentions: rows.length,
  matchedExisting: matched.length,
  newCandidates: unmatched.length,
  matched: matched.map(row => ({name: row.name, canonicalProjectId: row.canonicalProjectId, canonicalName: row.canonicalName, existingLinks: row.existingLinks, existingProviders: row.existingProviders})),
  unmatched: unmatched.map(row => row.name),
  resolvedChronology: research.resolvedChronology || [],
  rows
}, null, 2));

if (vault.stats.uniqueProjects !== 585 || vault.stats.recommendations !== 814) process.exitCode = 2;
if (research.videos.length !== 1 || rows.length !== 19) process.exitCode = 3;
if (!resolution || resolution.resolvedVideoId !== '4QMpIDcPaJI' || resolution.resolvedTitle !== 'The Best Minecraft Mods That Completely Enhance Combat') process.exitCode = 4;
if (!rows.every(row => [113, 267, 458].includes(row.timestampSeconds))) process.exitCode = 5;
