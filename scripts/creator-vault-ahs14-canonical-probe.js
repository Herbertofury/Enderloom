'use strict';
const path = require('path');
const { loadCreatorVault } = require('../src/creator-vault');
const research = require('../catalog/creator-vault/research/asianhalfsquat.chunk14-source.json');
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
    rows.push({videoId:video.id,name:rec.name,canonicalProjectId:hit?hit.id:null,canonicalName:hit?hit.name:null,existingLinks:hit?(hit.providerLinks||[]).length:0,existingProviders:hit?[...new Set((hit.providerLinks||[]).map(link=>link.provider))]:[]});
  }
}
console.log(JSON.stringify({currentStats:vault.stats,videos:research.videos.length,sourceMentions:rows.length,matchedExisting:rows.filter(r=>r.canonicalProjectId).length,newCandidates:rows.filter(r=>!r.canonicalProjectId).length,unmatched:rows.filter(r=>!r.canonicalProjectId).map(r=>r.name),rows},null,2));
