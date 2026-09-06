'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root,'catalog','creator-vault','recommendation-sources','asianhalfsquat.history-batch32.json');
const researchPath = path.join(root,'catalog','creator-vault','research','asianhalfsquat.chunk32-source.json');
const providerResearchPath = path.join(root,'catalog','creator-vault','research','asianhalfsquat.chunk32-provider-candidates.json');
const creatorsPath = path.join(root,'catalog','creator-vault','creators.json');
const diagnosticPath = path.join(__dirname,'creator-vault-ahs32-postmerge-diagnostic.js');
for (const target of [sourcePath,researchPath,providerResearchPath,creatorsPath,diagnosticPath]) assert(fs.existsSync(target),`required Chunk 32 acceptance input missing: ${target}`);
const forbiddenClosure = path.join(root,'catalog','creator-vault','project-sources','provider-closure-32a-asianhalfsquat.json');
assert(!fs.existsSync(forbiddenClosure),'Chunk 32 may not create a redundant provider closure');

const diagnostic = spawnSync(process.execPath,[diagnosticPath],{cwd:root,stdio:'inherit'});
assert.equal(diagnostic.status,0,'Chunk 32 post-merge reconciliation diagnostic / recursive Chunk 31 acceptance failed');

const source = require(sourcePath);
const research = require(researchPath);
const providerResearch = require(providerResearchPath);
const creators = require(creatorsPath);
const vault = loadCreatorVault(root);
const expectedStats = {creators:14,indexedCreators:3,videos:61,recommendations:995,uniqueProjects:672,verifiedProjects:670,unresolvedProjects:2,multiProviderProjects:441,providerDestinations:1241,verifiedHomes:670,importedCatalogs:1,nativeRecommendationSources:28,setupPacks:5};
for (const [field,value] of Object.entries(expectedStats)) assert.equal(vault.stats[field],value,`Chunk 32 runtime stat drift: ${field}`);
const unresolved = vault.projects.filter(project => !project.providerLinks.length).map(project => project.name).sort();
assert.deepEqual(unresolved,['Better Book Recipe','Plank and Junk'],'Chunk 32 unresolved set drift');

const ahsCreator = creators.creators.find(creator => creator.id === 'youtube:asianhalfsquat');
assert(ahsCreator,'AsianHalfSquat creator ledger missing');
assert.equal(ahsCreator.coverage.indexedVideos,52,'AHS creator ledger indexedVideos drift');
assert.equal(ahsCreator.coverage.recommendationCount,736,'AHS creator ledger recommendationCount drift');
assert.equal(ahsCreator.coverage.verifiedProjectHomes,736,'AHS creator ledger verifiedProjectHomes drift');

assert.equal(source.videos.length,1,'Chunk 32 production source must contain exactly one recommendation-bearing video');
const video = vault.videos.find(item => item.id === 'youtube:Z50_ryPNNAc');
assert(video,'Chunk 32 Feb 23 video missing');
assert.equal(video.title,'Top 10 Minecraft Mods (1.20) - 2024','Feb 23 title drift');
assert.equal(video.publishedAt,'2024-02-23','Feb 23 date drift');
assert.equal(video.importId || null,null,'native Feb 23 source must replace legacy import record');
assert.equal(video.mods.length,10,'Feb 23 native mention count drift');
assert(video.mods.every(mod => mod.providerLinks.length > 0),'Feb 23 contains providerless recommendation');
assert.deepStrictEqual(video.mods.map(mod => mod.name),['Infinity Cave','Dynamic Surroundings','Chunk By Chunk','Multi Mine','Thin Air','Horse Combat Controls','Grappling Hook Mod','Atmospheric Phenomena','BetterEnd','Exposure'],'Feb 23 creator-list/source-order drift');
assert.deepStrictEqual(video.mods.map(mod => mod.timestampSeconds),[22,52,81,108,129,170,142,232,253,278],'Feb 23 literal creator timestamp/order drift');
assert(!video.mods.some(mod => mod.name === 'Complementary Reimagined'),'post-outro shader must not survive as an inferred Top-10 recommendation');
assert.equal(new Set(video.mods.map(mod => mod.canonicalProjectId)).size,10,'Chunk 32 batch canonical-project count drift');

const bySourceName = new Map(video.mods.map(mod => [mod.name,mod]));
for (const [sourceName,canonicalId] of [
  ['Infinity Cave','infinity-cave'],['Dynamic Surroundings','dynamic-surroundings'],['Chunk By Chunk','chunk-by-chunk'],['Multi Mine','multi-mine'],['Thin Air','thin-air'],['Horse Combat Controls','horse-combat-controls'],['Grappling Hook Mod','grappling-hook-mod'],['Atmospheric Phenomena','atmospheric-phenomena'],['BetterEnd','betterend'],['Exposure','exposure']
]) {
  const mod = bySourceName.get(sourceName);
  assert(mod,`required source label missing: ${sourceName}`);
  assert.equal(mod.canonicalProjectId,canonicalId,`canonical identity drift for ${sourceName}`);
}

assert.equal(research.sourceMentions,10,'Chunk 32 research mention count drift');
assert.equal(research.videos.length,1,'Chunk 32 research video count drift');
assert.equal(providerResearch.expected.candidateEntries,5,'Chunk 32 semantic provider-research identity count drift');
assert.equal(providerResearch.expected.existingCandidateFamilies,5,'Chunk 32 existing semantic-family count drift');
assert.equal(providerResearch.expected.newCandidateFamilies,0,'Chunk 32 may not add canonical families');
assert.equal(providerResearch.expected.destinations,17,'Chunk 32 researched upstream destination count drift');
assert.equal((providerResearch.entries || []).length,5,'Chunk 32 provider-research entry count drift');

const ahsVideos = vault.videos.filter(item => item.creatorId === 'youtube:asianhalfsquat');
const ahsMods = ahsVideos.flatMap(item => item.mods);
const ahsLinked = ahsMods.filter(mod => mod.providerLinks.length > 0);
assert.equal(ahsVideos.length,52,'AHS video count drift');
assert.equal(ahsMods.length,736,'AHS mention count drift');
assert.equal(ahsLinked.length,736,'AHS linked mention count drift');
assert.equal(new Set(ahsMods.map(mod => mod.canonicalProjectId)).size,462,'AHS canonical-project count drift');
assert.equal(new Set(ahsLinked.map(mod => mod.canonicalProjectId)).size,462,'AHS linked canonical-project count drift');

console.log('Creator Vault AsianHalfSquat chunk 32 QA passed: native Feb-23 source replaces the 11-mention legacy copy with exactly 10 creator MODS entries, removing only post-outro Complementary Reimagined; runtime 995 mentions -> 672 canonical projects; 670 linked / 1241 destinations / 441 multi-provider / 2 unresolved. AHS linked mentions=736/736 across 462 canonical projects; batch=10 reused canonical projects / 0 new identities, exact non-monotonic creator timestamp order preserved, no redundant provider closure; recursive Chunk 31 acceptance locked.');
