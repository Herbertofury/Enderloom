'use strict';
const fs = require('fs');
const path = require('path');
const { loadCreatorVault } = require('../src/creator-vault');
const candidates = require('../catalog/creator-vault/research/asianhalfsquat.chunk27-provider-candidates.json');
const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root,'catalog','creator-vault','recommendation-sources','asianhalfsquat.history-batch27.json');
if (fs.existsSync(sourcePath)) {
  console.error(JSON.stringify({error:'chunk27 pre-production collision gate requires batch27 production source to remain absent'},null,2));
  process.exit(2);
}
const vault = loadCreatorVault(root);
if (vault.stats.recommendations !== 814 || vault.stats.uniqueProjects !== 585) {
  console.error(JSON.stringify({error:'chunk27 pre-production collision gate requires untouched chunk26 baseline',actual:{recommendations:vault.stats.recommendations,uniqueProjects:vault.stats.uniqueProjects}},null,2));
  process.exit(2);
}
const normalizeUrl = value => String(value || '').trim().replace(/\/$/, '').toLowerCase();
const byUrl = new Map();
for (const project of vault.projects) {
  for (const link of project.providerLinks || []) {
    const key = normalizeUrl(link.url);
    if (key && !byUrl.has(key)) byUrl.set(key, project.id);
  }
}
const collisions = [];
const seenCandidate = new Map();
let destinations = 0;
const zeroProviderProjects = [];
for (const entry of candidates.entries || []) {
  const [id, name, type, aliases, links] = entry;
  if (!(links || []).length) zeroProviderProjects.push(id);
  for (const link of links || []) {
    destinations += 1;
    const key = normalizeUrl(link[1]);
    const hit = byUrl.get(key);
    if (hit && hit !== id) collisions.push({candidateId:id,name,url:link[1],existingProjectId:hit});
    const candidateHit = seenCandidate.get(key);
    if (candidateHit && candidateHit !== id) collisions.push({candidateId:id,name,url:link[1],candidateProjectId:candidateHit});
    if (key && !seenCandidate.has(key)) seenCandidate.set(key,id);
  }
}
console.log(JSON.stringify({phase:'pre-production',baseline:{recommendations:vault.stats.recommendations,uniqueProjects:vault.stats.uniqueProjects},candidateProjects:(candidates.entries||[]).length,destinations,zeroProviderProjects,collisions},null,2));
if ((candidates.entries||[]).length !== 16 || destinations !== 40 || zeroProviderProjects.length || collisions.length) process.exitCode = 2;
