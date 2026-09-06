'use strict';
const fs = require('fs');
const path = require('path');
const { loadCreatorVault } = require('../src/creator-vault');
const candidates = require('../catalog/creator-vault/research/asianhalfsquat.chunk31-provider-candidates.json');
const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root,'catalog','creator-vault','recommendation-sources','asianhalfsquat.history-batch31.json');
const closurePath = path.join(root,'catalog','creator-vault','project-sources','provider-closure-31a-asianhalfsquat.json');
if (fs.existsSync(sourcePath) || fs.existsSync(closurePath)) {
  console.error(JSON.stringify({error:'chunk31 pre-production collision gate requires batch31 production files to remain absent'},null,2));
  process.exit(2);
}
const vault = loadCreatorVault(root);
if (vault.stats.recommendations !== 987 || vault.stats.uniqueProjects !== 672) {
  console.error(JSON.stringify({error:'chunk31 pre-production collision gate requires untouched chunk30 baseline',actual:{recommendations:vault.stats.recommendations,uniqueProjects:vault.stats.uniqueProjects}},null,2));
  process.exit(2);
}
const normalizeUrl = value => String(value || '').trim().replace(/\/$/, '').toLowerCase();
const byUrl = new Map();
const byId = new Map(vault.projects.map(project => [project.id, project]));
for (const project of vault.projects) {
  for (const link of project.providerLinks || []) {
    const key = normalizeUrl(link.url);
    if (!key) continue;
    if (!byUrl.has(key)) byUrl.set(key, []);
    byUrl.get(key).push(project.id);
  }
}
const collisions = [];
const seenCandidate = new Map();
const existingIds = [];
let destinations = 0;
const zeroProviderProjects = [];
for (const entry of candidates.entries || []) {
  const [id, name, type, aliases, links] = entry;
  if (byId.has(id)) existingIds.push(id);
  if (!(links || []).length) zeroProviderProjects.push(id);
  for (const link of links || []) {
    destinations += 1;
    const key = normalizeUrl(link[1]);
    const owners = byUrl.get(key) || [];
    for (const hit of owners) {
      if (hit !== id) collisions.push({candidateId:id,name,url:link[1],existingProjectId:hit});
    }
    const candidateHit = seenCandidate.get(key);
    if (candidateHit && candidateHit !== id) collisions.push({candidateId:id,name,url:link[1],candidateProjectId:candidateHit});
    if (key && !seenCandidate.has(key)) seenCandidate.set(key,id);
  }
}
const expected = candidates.expected || {};
const uniqueExistingIds = [...new Set(existingIds)].sort();
const result = {
  phase:'chunk-31-pre-production',
  baseline:{recommendations:vault.stats.recommendations,uniqueProjects:vault.stats.uniqueProjects},
  candidateEntries:(candidates.entries||[]).length,
  declaredNewCandidateFamilies:expected.newCandidateFamilies,
  existingCandidateIds:uniqueExistingIds,
  measuredNewIds:(candidates.entries||[]).length - uniqueExistingIds.length,
  destinations,
  zeroProviderProjects,
  collisions
};
console.log(JSON.stringify(result,null,2));
if ((candidates.entries||[]).length !== expected.candidateEntries ||
    destinations !== expected.destinations ||
    uniqueExistingIds.length !== 0 ||
    result.measuredNewIds !== expected.newCandidateFamilies ||
    zeroProviderProjects.length ||
    collisions.length) process.exitCode = 2;
