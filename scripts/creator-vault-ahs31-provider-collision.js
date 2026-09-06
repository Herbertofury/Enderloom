'use strict';
const fs = require('fs');
const path = require('path');
const { loadCreatorVault } = require('../src/creator-vault');
const candidates = require('../catalog/creator-vault/research/asianhalfsquat.chunk31-provider-candidates.json');
const root = path.resolve(__dirname, '..');
const mode = process.argv[2] || 'all';
const fixedModes = new Set(['all','baseline','shape','ids','urls']);
const idMode = mode.startsWith('id:') ? mode.slice(3) : null;
const identityMode = mode.startsWith('identity:') ? mode.slice('identity:'.length) : null;
if (!fixedModes.has(mode) && !idMode && !identityMode) throw new Error(`Unknown diagnostic mode: ${mode}`);

const sourcePath = path.join(root,'catalog','creator-vault','recommendation-sources','asianhalfsquat.history-batch31.json');
const closurePath = path.join(root,'catalog','creator-vault','project-sources','provider-closure-31a-asianhalfsquat.json');
const productionFilesAbsent = !fs.existsSync(sourcePath) && !fs.existsSync(closurePath);
const vault = loadCreatorVault(root);
const baselineOk = vault.stats.recommendations === 987 && vault.stats.uniqueProjects === 672;

const normalize = value => String(value || '').trim().toLowerCase().normalize('NFKD')
  .replace(/[\u0300-\u036f]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
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
const measuredNewIds = (candidates.entries || []).length - uniqueExistingIds.length;
const shapeOk = (candidates.entries || []).length === expected.candidateEntries &&
  destinations === expected.destinations && zeroProviderProjects.length === 0;
const idsOk = uniqueExistingIds.length === 0 && measuredNewIds === expected.newCandidateFamilies;
const urlsOk = collisions.length === 0;
const selectedCandidate = idMode ? (candidates.entries || []).find(entry => entry[0] === idMode) : null;
const selectedIdFresh = idMode ? Boolean(selectedCandidate && !byId.has(idMode)) : null;

const identityContracts = {
  iris: {labels:['iris','iris shaders'], urlTokens:['iris','irisshaders']},
  c2me: {labels:['c2me','concurrent chunk management engine','c 2 m engine'], urlTokens:['c2me','c2m']},
  terra: {labels:['terra'], urlTokens:['terra','polyhedral']},
  terralith: {labels:['terralith'], urlTokens:['terralith','stardust']}
};
let identityOk = null;
let identityEvidence = null;
if (identityMode) {
  const project = byId.get(identityMode);
  const contract = identityContracts[identityMode];
  const labels = project ? [project.name, ...(project.aliases || [])].map(normalize) : [];
  const urls = project ? (project.providerLinks || []).map(link => normalizeUrl(link.url)) : [];
  const labelOk = Boolean(contract && contract.labels.some(label => labels.includes(normalize(label))));
  const lineageOk = Boolean(contract && urls.length && contract.urlTokens.some(token => urls.some(url => url.includes(token))));
  identityOk = Boolean(project && labelOk && lineageOk);
  identityEvidence = project ? {id:project.id,name:project.name,aliases:project.aliases||[],providers:[...new Set((project.providerLinks||[]).map(link=>link.provider))],providerLinks:urls,labelOk,lineageOk} : null;
}

const result = {
  phase:'chunk-31-pre-production', mode,
  productionFilesAbsent,
  baseline:{recommendations:vault.stats.recommendations,uniqueProjects:vault.stats.uniqueProjects,ok:baselineOk},
  candidateEntries:(candidates.entries||[]).length,
  declaredNewCandidateFamilies:expected.newCandidateFamilies,
  existingCandidateIds:uniqueExistingIds,
  measuredNewIds,
  destinations,
  zeroProviderProjects,
  collisions,
  selectedCandidateId:idMode,
  selectedIdFresh,
  identityId:identityMode,
  identityOk,
  identityEvidence,
  checks:{shapeOk,idsOk,urlsOk}
};
console.log(JSON.stringify(result,null,2));

const failed = identityMode ? !identityOk : idMode ? !selectedIdFresh :
  mode === 'baseline' ? (!productionFilesAbsent || !baselineOk) :
  mode === 'shape' ? !shapeOk :
  mode === 'ids' ? !idsOk :
  mode === 'urls' ? !urlsOk :
  (!productionFilesAbsent || !baselineOk || !shapeOk || !idsOk || !urlsOk);
if (failed) process.exitCode = 2;
