'use strict';
const path = require('path');
const { loadCreatorVault } = require('../src/creator-vault');
const research = require('../catalog/creator-vault/research/asianhalfsquat.chunk21-source.json');
const root = path.resolve(__dirname, '..');
const vault = loadCreatorVault(root);
const key = value => String(value || '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
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
    rows.push({videoId:video.id,name:rec.name,canonicalProjectId:hit?hit.id:null,canonicalName:hit?hit.name:null,existingLinks:hit?(hit.providerLinks||[]).length:0,existingProviders:hit?[...new Set((hit.providerLinks||[]).map(link=>link.provider))]:[],timestampSeconds:Object.prototype.hasOwnProperty.call(rec,'timestampSeconds')?rec.timestampSeconds:null});
  }
}
const matched = rows.filter(r=>r.canonicalProjectId);
const unmatched = rows.filter(r=>!r.canonicalProjectId);
console.log(JSON.stringify({currentStats:vault.stats,videos:research.videos.length,sourceMentions:rows.length,matchedExisting:matched.length,newCandidates:unmatched.length,matchedNames:matched.map(r=>r.name),unmatched:unmatched.map(r=>r.name),rows},null,2));
if (vault.stats.uniqueProjects !== 551 || vault.stats.recommendations !== 739 || research.videos.length !== 2 || rows.length !== 11) process.exitCode = 2;
