'use strict';
const fs = require('fs');
const path = require('path');
const { loadCreatorVault } = require('../src/creator-vault');
const candidates = require('../catalog/creator-vault/research/asianhalfsquat.chunk32-provider-candidates.json');
const root = path.resolve(__dirname, '..');
const mode = process.argv[2] || 'all';
const fixedModes = new Set(['all','baseline','shape','urls']);
const identityMode = mode.startsWith('identity:') ? mode.slice('identity:'.length) : null;
if (!fixedModes.has(mode) && !identityMode) throw new Error(`Unknown diagnostic mode: ${mode}`);

const sourcePath = path.join(root,'catalog','creator-vault','recommendation-sources','asianhalfsquat.history-batch32.json');
const closurePath = path.join(root,'catalog','creator-vault','project-sources','provider-closure-32a-asianhalfsquat.json');
const productionFilesAbsent = !fs.existsSync(sourcePath) && !fs.existsSync(closurePath);
const vault = loadCreatorVault(root);
const baselineOk = vault.stats.recommendations === 996 && vault.stats.uniqueProjects === 672;
const normalize = value => String(value || '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const normalizeUrl = value => String(value || '').trim().replace(/\/$/, '').toLowerCase();
const byUrl = new Map();
const byId = new Map(vault.projects.map(project => [project.id, project]));
for (const project of vault.projects) for (const link of project.providerLinks || []) {
  const key = normalizeUrl(link.url); if (!key) continue;
  if (!byUrl.has(key)) byUrl.set(key, []); byUrl.get(key).push(project.id);
}
const collisions = []; const seenCandidate = new Map(); let destinations = 0; const zeroProviderProjects = [];
for (const entry of candidates.entries || []) {
  const [id,name,type,aliases,links] = entry;
  if (!(links || []).length) zeroProviderProjects.push(id);
  for (const link of links || []) {
    destinations += 1; const key = normalizeUrl(link[1]); const owners = byUrl.get(key) || [];
    for (const hit of owners) if (hit !== id) collisions.push({candidateId:id,name,url:link[1],existingProjectId:hit});
    const candidateHit = seenCandidate.get(key); if (candidateHit && candidateHit !== id) collisions.push({candidateId:id,name,url:link[1],candidateProjectId:candidateHit});
    if (key && !seenCandidate.has(key)) seenCandidate.set(key,id);
  }
}
const expected = candidates.expected || {};
const existingIds = (candidates.entries || []).map(entry => entry[0]).filter(id => byId.has(id)).sort();
const shapeOk = (candidates.entries || []).length === expected.candidateEntries && destinations === expected.destinations && zeroProviderProjects.length === 0;
const idsOk = existingIds.length === expected.existingCandidateFamilies && expected.newCandidateFamilies === 0;
const urlsOk = collisions.length === 0;
let identityOk = null; let identityEvidence = null;
if (identityMode) {
  const entry = (candidates.entries || []).find(item => item[0] === identityMode); const project = byId.get(identityMode);
  if (entry && project) {
    const [,candidateName,,candidateAliases,candidateLinks] = entry;
    const existingLabels = [project.name,...(project.aliases || [])].map(normalize); const candidateLabels = [candidateName,...(candidateAliases || [])].map(normalize);
    const labelOverlap = candidateLabels.filter(label => existingLabels.includes(label));
    const existingUrls = new Set((project.providerLinks || []).map(link => normalizeUrl(link.url))); const candidateUrls = (candidateLinks || []).map(link => normalizeUrl(link[1]));
    const urlOverlap = candidateUrls.filter(url => existingUrls.has(url));
    identityOk = Boolean(labelOverlap.length && urlOverlap.length && (project.providerLinks || []).length > 0);
    identityEvidence = {id:project.id,name:project.name,aliases:project.aliases || [],providers:[...new Set((project.providerLinks || []).map(link => link.provider))].sort(),providerLinks:[...existingUrls],labelOverlap,urlOverlap};
  }
}
console.log(JSON.stringify({phase:'chunk-32-pre-production',mode,productionFilesAbsent,baseline:{recommendations:vault.stats.recommendations,uniqueProjects:vault.stats.uniqueProjects,ok:baselineOk},candidateEntries:(candidates.entries||[]).length,existingCandidateIds:existingIds,expectedExistingCandidateFamilies:expected.existingCandidateFamilies,expectedNewCandidateFamilies:expected.newCandidateFamilies,destinations,zeroProviderProjects,collisions,identityId:identityMode,identityOk,identityEvidence,checks:{shapeOk,idsOk,urlsOk}},null,2));
const failed = identityMode ? !identityOk : mode === 'baseline' ? (!productionFilesAbsent || !baselineOk) : mode === 'shape' ? !shapeOk : mode === 'urls' ? !urlsOk : (!productionFilesAbsent || !baselineOk || !shapeOk || !idsOk || !urlsOk);
if (failed) process.exitCode = 2;
