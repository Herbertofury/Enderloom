'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root,'catalog','creator-vault','recommendation-sources','asianhalfsquat.history-batch30.json');
const closurePath = path.join(root,'catalog','creator-vault','project-sources','provider-closure-30a-asianhalfsquat.json');
const candidatesPath = path.join(root,'catalog','creator-vault','research','asianhalfsquat.chunk30-provider-candidates.json');
const researchPath = path.join(root,'catalog','creator-vault','research','asianhalfsquat.chunk30-source.json');
const creatorsPath = path.join(root,'catalog','creator-vault','creators.json');
const baselineCreatorsPath = path.join(root,'catalog','creator-vault','research','creators.chunk29-baseline.json');
const frozenQaPath = path.join(__dirname,'creator-vault-qa-chunk29.js');
for (const target of [sourcePath,closurePath,candidatesPath,researchPath,creatorsPath,baselineCreatorsPath,frozenQaPath]) assert(fs.existsSync(target),`required Chunk 30 acceptance input missing: ${target}`);

const source = require(sourcePath);
const closure = require(closurePath);
const candidates = require(candidatesPath);
const research = require(researchPath);
const currentCreators = require(creatorsPath);

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-ahs30-qa-'));
const sourceBackup = path.join(tempDir,path.basename(sourcePath));
const closureBackup = path.join(tempDir,path.basename(closurePath));
const creatorsBackup = path.join(tempDir,'creators.current.json');
let baselineVault;
try {
  fs.renameSync(sourcePath,sourceBackup);
  fs.renameSync(closurePath,closureBackup);
  fs.copyFileSync(creatorsPath,creatorsBackup);
  fs.copyFileSync(baselineCreatorsPath,creatorsPath);
  baselineVault = loadCreatorVault(root);
  assert.equal(baselineVault.stats.recommendations,977,'frozen Chunk 29 recommendation baseline drift');
  assert.equal(baselineVault.stats.uniqueProjects,667,'frozen Chunk 29 canonical-project baseline drift');
  assert.equal(baselineVault.videos.filter(video => video.creatorId === 'youtube:asianhalfsquat').length,50,'frozen Chunk 29 AHS video baseline drift');
  const frozen = spawnSync(process.execPath,[frozenQaPath],{cwd:root,stdio:'inherit'});
  assert.equal(frozen.status,0,'frozen Chunk 29 recursive acceptance failed with Chunk 30 hidden');
} finally {
  if (fs.existsSync(creatorsBackup)) fs.copyFileSync(creatorsBackup,creatorsPath);
  if (fs.existsSync(closureBackup)) fs.renameSync(closureBackup,closurePath);
  if (fs.existsSync(sourceBackup)) fs.renameSync(sourceBackup,sourcePath);
  fs.rmSync(tempDir,{recursive:true,force:true});
}

const vault = loadCreatorVault(root);
const expectedStats = {creators:14,indexedCreators:3,videos:60,recommendations:987,uniqueProjects:672,verifiedProjects:670,unresolvedProjects:2,multiProviderProjects:441,providerDestinations:1241,verifiedHomes:670,importedCatalogs:1,nativeRecommendationSources:26,setupPacks:5};
for (const [field,value] of Object.entries(expectedStats)) assert.equal(vault.stats[field],value,`Chunk 30 runtime stat drift: ${field}`);
const unresolved = vault.projects.filter(project => !project.providerLinks.length).map(project => project.name).sort();
assert.deepEqual(unresolved,['Better Book Recipe','Plank and Junk'],'Chunk 30 unresolved set drift');

const ahsCreator = currentCreators.creators.find(creator => creator.id === 'youtube:asianhalfsquat');
assert(ahsCreator,'AsianHalfSquat creator ledger missing');
assert.equal(ahsCreator.coverage.indexedVideos,51,'AHS creator ledger indexedVideos drift');
assert.equal(ahsCreator.coverage.recommendationCount,728,'AHS creator ledger recommendationCount drift');
assert.equal(ahsCreator.coverage.verifiedProjectHomes,728,'AHS creator ledger verifiedProjectHomes drift');

assert.equal(source.videos.length,1,'Chunk 30 production source must contain exactly one recommendation-bearing video');
const video = vault.videos.find(item => item.id === 'youtube:XO51AADPLDg');
assert(video,'Chunk 30 May 24 video missing');
assert.equal(video.title,'Top 10 Minecraft Mods (1.20.6) - 2024','May 24 title drift');
assert.equal(video.publishedAt,'2024-05-24','May 24 date drift');
assert.equal(video.mods.length,10,'May 24 mention count drift');
assert(video.mods.every(mod => mod.providerLinks.length > 0),'May 24 contains providerless recommendation');
assert.deepStrictEqual(video.mods.map(mod => mod.timestampSeconds),[24,46,64,78,102,118,140,175,214,236],'May 24 creator timestamp sequence drift');
assert.equal(video.mods.filter(mod => mod.timestampSeconds == null).length,0,'May 24 may not lose creator timestamps');
assert.equal(new Set(video.mods.map(mod => mod.canonicalProjectId)).size,10,'Chunk 30 batch canonical-project count drift');

const bySourceName = new Map(video.mods.map(mod => [mod.name,mod]));
for (const [sourceName,canonicalId] of [
  ['BN Blood Particles','bn-blood-particles'],
  ['Item Placer','item-placer'],
  ["Luki's Grand Capitals",'lukis-grand-capitals'],
  ['Nether Weather','nether-weather'],
  ['Item Highlighter','item-highlighter'],
  ['RpgZ','rpgz'],
  ['Shoulder Surfing Reloaded','shoulder-surfing-reloaded'],
  ['First-person Model','first-person-model'],
  ["Nature's Spirit",'natures-spirit'],
  ['Do a Barrel Roll','do-a-barrel-roll']
]) {
  const mod = bySourceName.get(sourceName);
  assert(mod,`required source label missing: ${sourceName}`);
  assert.equal(mod.canonicalProjectId,canonicalId,`canonical identity drift for ${sourceName}`);
}
for (const forbiddenId of ['ipla','item-highlighter-fabric','item-highlighter-forge','lukis-grand-capitals-datapack','nether-weather-datapack']) assert(!vault.projects.some(project => project.id === forbiddenId),`successor/distribution duplicate leaked into registry: ${forbiddenId}`);

assert.equal(research.chronologyEvidence.length,1,'May 28 chronology-only record count drift');
const chronology = research.chronologyEvidence[0];
assert.equal(chronology.publishedAt,'2024-05-28','May 28 chronology date drift');
assert.equal(chronology.title,'Soaring Through The Clouds','May 28 chronology title drift');
assert.equal(chronology.durationSeconds,24,'May 28 chronology duration drift');
assert.equal(chronology.videoId,null,'May 28 exact ID must remain explicit recovery debt');
assert.equal(chronology.recommendationCount,0,'May 28 must contribute zero inferred recommendations');
assert(!vault.videos.some(item => item.title === 'Soaring Through The Clouds'),'May 28 chronology-only record leaked into runtime videos');
assert.equal(research.sourceMentions,10,'Chunk 30 research mention count drift');
for (const forbidden of ['Fabric / Forge setup links','Minecraft Volume Beta - Taswell']) assert(!source.videos.some(item => item.mods.some(mod => mod.name === forbidden)),`excluded evidence leaked into recommendations: ${forbidden}`);

assert.equal((closure.entries || []).length,5,'Chunk 30 provider closure card count drift');
assert.equal((candidates.entries || []).length,5,'Chunk 30 provider candidate card count drift');
assert.equal(candidates.expected.newCandidateFamilies,5,'Chunk 30 declared new-family count drift');
const destinationCount = (closure.entries || []).reduce((sum,entry) => sum + ((entry[4] || []).length),0);
assert.equal(destinationCount,10,'Chunk 30 provider destination count drift');
const baselineIds = new Set(baselineVault.projects.map(project => project.id));
const closureIds = (closure.entries || []).map(entry => entry[0]);
assert.deepEqual(closureIds.slice().sort(),['item-highlighter','item-placer','lukis-grand-capitals','nether-weather','rpgz'],'Chunk 30 closure ID set drift');
assert.equal(closureIds.filter(id => baselineIds.has(id)).length,0,'Chunk 30 closure unexpectedly reuses a pre-existing canonical ID');
assert.equal(closureIds.filter(id => !baselineIds.has(id)).length,5,'Chunk 30 new canonical identity count drift');
const normalizeUrl = value => String(value || '').trim().replace(/\/$/,'').toLowerCase();
const providerMap = closure.providers || {};
for (const entry of closure.entries || []) {
  const [id,,,,links] = entry;
  const project = vault.projects.find(item => item.id === id);
  assert(project,`Chunk 30 closure project missing from runtime: ${id}`);
  assert((links || []).length > 0,`Chunk 30 providerless closure entry: ${id}`);
  for (const link of links || []) {
    const provider = providerMap[link[0]] || link[0];
    const url = link[1];
    assert(project.providerLinks.some(item => item.provider === provider && normalizeUrl(item.url) === normalizeUrl(url)),`missing exact provider destination for ${id}: ${url}`);
    const owners = vault.projects.filter(item => (item.providerLinks || []).some(itemLink => normalizeUrl(itemLink.url) === normalizeUrl(url))).map(item => item.id);
    assert.deepEqual(owners,[id],`incoming Chunk 30 URL collision: ${url}`);
  }
}

const ahsVideos = vault.videos.filter(item => item.creatorId === 'youtube:asianhalfsquat');
const ahsMods = ahsVideos.flatMap(item => item.mods);
const ahsLinked = ahsMods.filter(mod => mod.providerLinks.length > 0);
assert.equal(ahsVideos.length,51,'AHS video count drift');
assert.equal(ahsMods.length,728,'AHS mention count drift');
assert.equal(ahsLinked.length,728,'AHS linked mention count drift');
assert.equal(new Set(ahsMods.map(mod => mod.canonicalProjectId)).size,462,'AHS canonical-project count drift');
assert.equal(new Set(ahsLinked.map(mod => mod.canonicalProjectId)).size,462,'AHS linked canonical-project count drift');

console.log('Creator Vault AsianHalfSquat chunk 30 QA passed: 987 mentions -> 672 canonical projects; 670 linked / 1241 destinations / 441 multi-provider / 2 unresolved. AHS linked mentions=728/728 across 462 canonical projects; May-24 batch=10 mentions / 10 canonical projects / 5 new global identities, all 10 creator timestamps preserved; May-28 Soaring Through The Clouds remains chronology-only recovery debt with zero inferred recommendations; recursive chunk-29 baseline locked.');
