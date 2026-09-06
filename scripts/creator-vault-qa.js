'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root,'catalog','creator-vault','recommendation-sources','asianhalfsquat.history-batch31.json');
const researchPath = path.join(root,'catalog','creator-vault','research','asianhalfsquat.chunk31-source.json');
const providerResearchPath = path.join(root,'catalog','creator-vault','research','asianhalfsquat.chunk31-provider-candidates.json');
const creatorsPath = path.join(root,'catalog','creator-vault','creators.json');
const priorDiagnosticPath = path.join(__dirname,'creator-vault-ahs31-postmerge-diagnostic.js');
for (const target of [sourcePath,researchPath,providerResearchPath,creatorsPath,priorDiagnosticPath]) assert(fs.existsSync(target),`required Chunk 31 acceptance input missing: ${target}`);
const forbiddenClosure = path.join(root,'catalog','creator-vault','project-sources','provider-closure-31a-asianhalfsquat.json');
assert(!fs.existsSync(forbiddenClosure),'Chunk 31 may not create a redundant provider closure');

const prior = spawnSync(process.execPath,[priorDiagnosticPath],{cwd:root,stdio:'inherit'});
assert.equal(prior.status,0,'Chunk 31 post-merge diagnostic / recursive Chunk 30 acceptance failed');

const source = require(sourcePath);
const research = require(researchPath);
const providerResearch = require(providerResearchPath);
const creators = require(creatorsPath);
const vault = loadCreatorVault(root);
const expectedStats = {creators:14,indexedCreators:3,videos:61,recommendations:996,uniqueProjects:672,verifiedProjects:670,unresolvedProjects:2,multiProviderProjects:441,providerDestinations:1241,verifiedHomes:670,importedCatalogs:1,nativeRecommendationSources:27,setupPacks:5};
for (const [field,value] of Object.entries(expectedStats)) assert.equal(vault.stats[field],value,`Chunk 31 runtime stat drift: ${field}`);
const unresolved = vault.projects.filter(project => !project.providerLinks.length).map(project => project.name).sort();
assert.deepEqual(unresolved,['Better Book Recipe','Plank and Junk'],'Chunk 31 unresolved set drift');

const ahsCreator = creators.creators.find(creator => creator.id === 'youtube:asianhalfsquat');
assert(ahsCreator,'AsianHalfSquat creator ledger missing');
assert.equal(ahsCreator.coverage.indexedVideos,52,'AHS creator ledger indexedVideos drift');
assert.equal(ahsCreator.coverage.recommendationCount,737,'AHS creator ledger recommendationCount drift');
assert.equal(ahsCreator.coverage.verifiedProjectHomes,737,'AHS creator ledger verifiedProjectHomes drift');

assert.equal(source.videos.length,1,'Chunk 31 production source must contain exactly one recommendation-bearing video');
const video = vault.videos.find(item => item.id === 'youtube:7NruFXLqOi8');
assert(video,'Chunk 31 March 5 video missing');
assert.equal(video.title,'Minecraft Has Never Looked This Good','March 5 title drift');
assert.equal(video.publishedAt,'2024-03-05','March 5 date drift');
assert.equal(video.mods.length,9,'March 5 mention count drift');
assert(video.mods.every(mod => mod.providerLinks.length > 0),'March 5 contains providerless recommendation');
assert.equal(video.mods.filter(mod => mod.timestampSeconds == null).length,9,'March 5 must remain entirely untimestamped because the source provides no per-project timestamps');
assert.equal(new Set(video.mods.map(mod => mod.canonicalProjectId)).size,9,'Chunk 31 batch canonical-project count drift');
assert.deepStrictEqual(video.mods.map(mod => mod.name),['Distant Horizons','Iris','Sodium','C2ME','Bliss Shaders','Tectonic','Terra','Terralith','Exposure'],'March 5 creator-list drift');

const bySourceName = new Map(video.mods.map(mod => [mod.name,mod]));
for (const [sourceName,canonicalId] of [
  ['Distant Horizons','distant-horizons'],['Iris','iris'],['Sodium','sodium'],['C2ME','c2me'],['Bliss Shaders','bliss-shaders'],['Tectonic','tectonic'],['Terra','terra'],['Terralith','terralith'],['Exposure','exposure']
]) {
  const mod = bySourceName.get(sourceName);
  assert(mod,`required source label missing: ${sourceName}`);
  assert.equal(mod.canonicalProjectId,canonicalId,`canonical identity drift for ${sourceName}`);
}

assert.equal(research.sourceMentions,9,'Chunk 31 research mention count drift');
assert.equal(research.videos.length,1,'Chunk 31 research video count drift');
assert.equal(providerResearch.expected.candidateEntries,4,'Chunk 31 semantic provider-research identity count drift');
assert.equal(providerResearch.expected.existingCandidateFamilies,4,'Chunk 31 existing semantic-family count drift');
assert.equal(providerResearch.expected.newCandidateFamilies,0,'Chunk 31 may not add canonical families');
assert.equal(providerResearch.expected.destinations,14,'Chunk 31 researched upstream destination count drift');
assert.equal((providerResearch.entries || []).length,4,'Chunk 31 provider-research entry count drift');

const ahsVideos = vault.videos.filter(item => item.creatorId === 'youtube:asianhalfsquat');
const ahsMods = ahsVideos.flatMap(item => item.mods);
const ahsLinked = ahsMods.filter(mod => mod.providerLinks.length > 0);
assert.equal(ahsVideos.length,52,'AHS video count drift');
assert.equal(ahsMods.length,737,'AHS mention count drift');
assert.equal(ahsLinked.length,737,'AHS linked mention count drift');
assert.equal(new Set(ahsMods.map(mod => mod.canonicalProjectId)).size,462,'AHS canonical-project count drift');
assert.equal(new Set(ahsLinked.map(mod => mod.canonicalProjectId)).size,462,'AHS linked canonical-project count drift');

console.log('Creator Vault AsianHalfSquat chunk 31 QA passed: 996 mentions -> 672 canonical projects; 670 linked / 1241 destinations / 441 multi-provider / 2 unresolved. AHS linked mentions=737/737 across 462 canonical projects; March-5 batch=9 mentions / 9 reused canonical projects / 0 new global identities, intentionally no fabricated timestamps and no redundant provider closure; recursive Chunk 30 acceptance locked.');
