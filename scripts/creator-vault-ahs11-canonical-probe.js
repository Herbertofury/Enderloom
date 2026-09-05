'use strict';
const path = require('path');
const { loadCreatorVault } = require('../src/creator-vault');
const research = require('../catalog/creator-vault/research/asianhalfsquat.rss-batch11.json');
const root = path.resolve(__dirname, '..');
const vault = loadCreatorVault(root);
const key = value => String(value || '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const normalizeUrl = value => String(value || '').trim().replace(/\/$/, '').toLowerCase();
const byName = new Map();
const byUrl = new Map();
for (const project of vault.projects) {
  for (const label of [project.name, ...(project.aliases || [])]) {
    const k = key(label);
    if (k && !byName.has(k)) byName.set(k, project);
  }
  for (const link of project.providerLinks || []) {
    const u = normalizeUrl(link.url);
    if (u && !byUrl.has(u)) byUrl.set(u, project);
  }
}
const rows = [];
const conflicts = [];
for (const video of research.videos) {
  for (const rec of video.recommendations) {
    const nameHit = byName.get(key(rec.name)) || null;
    const urlHit = byUrl.get(normalizeUrl(rec.url)) || null;
    if (nameHit && urlHit && nameHit.id !== urlHit.id) conflicts.push({videoId:video.id,name:rec.name,url:rec.url,nameHit:nameHit.id,urlHit:urlHit.id});
    const hit = urlHit || nameHit;
    rows.push({
      videoId: video.id,
      name: rec.name,
      sourceUrl: rec.url,
      nameHit: nameHit ? nameHit.id : null,
      urlHit: urlHit ? urlHit.id : null,
      canonicalProjectId: hit ? hit.id : null,
      canonicalName: hit ? hit.name : null,
      existingLinks: hit ? (hit.providerLinks || []).length : 0,
      existingProviders: hit ? [...new Set((hit.providerLinks || []).map(link => link.provider))] : []
    });
  }
}
console.log(JSON.stringify({
  currentStats: vault.stats,
  videos: research.videos.length,
  sourceMentions: rows.length,
  matchedExisting: rows.filter(row => row.canonicalProjectId).length,
  newCandidates: rows.filter(row => !row.canonicalProjectId).length,
  conflicts,
  unmatched: rows.filter(row => !row.canonicalProjectId).map(row => row.name),
  rows
}, null, 2));
if (conflicts.length) process.exitCode = 2;
