'use strict';
const path = require('path');
const { loadCreatorVault } = require('../src/creator-vault');
const candidates = require('../catalog/creator-vault/research/asianhalfsquat.chunk25-provider-candidates.json');
const root = path.resolve(__dirname, '..');
const vault = loadCreatorVault(root);
const normalizeUrl = value => String(value || '').trim().replace(/\/$/, '').toLowerCase();
if (vault.stats.recommendations !== 794 || vault.stats.uniqueProjects !== 573) {
  console.error(JSON.stringify({error:'chunk25 collision gate must run against untouched chunk24 production baseline',actual:{recommendations:vault.stats.recommendations,uniqueProjects:vault.stats.uniqueProjects}},null,2));
  process.exit(2);
}
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
for (const entry of candidates.entries || []) {
  const [id, name, type, aliases, links] = entry;
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
console.log(JSON.stringify({candidateProjects:(candidates.entries||[]).length,destinations,collisions},null,2));
if ((candidates.entries||[]).length !== 7 || destinations !== 14 || collisions.length) process.exitCode = 2;
