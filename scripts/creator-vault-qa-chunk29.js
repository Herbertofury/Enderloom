'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root,'catalog','creator-vault','recommendation-sources','asianhalfsquat.history-batch29.json');
const closurePath = path.join(root,'catalog','creator-vault','project-sources','provider-closure-29a-asianhalfsquat.json');
const candidatesPath = path.join(root,'catalog','creator-vault','research','asianhalfsquat.chunk29-provider-candidates.json');
const creatorsPath = path.join(root,'catalog','creator-vault','creators.json');
const baselineCreatorsPath = path.join(root,'catalog','creator-vault','research','creators.chunk28-baseline.json');
const frozenQaPath = path.join(__dirname,'creator-vault-qa-chunk28.js');

for (const target of [sourcePath,closurePath,candidatesPath,creatorsPath,baselineCreatorsPath,frozenQaPath]) {
  assert(fs.existsSync(target),`required Chunk 29 acceptance input missing: ${target}`);
}
const source = require(sourcePath);
const closure = require(closurePath);
const candidates = require(candidatesPath);
const currentCreators = require(creatorsPath);

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-ahs29-qa-'));
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
  assert.equal(baselineVault.stats.recommendations,934,'frozen Chunk 28 recommendation baseline drift');
  assert.equal(baselineVault.stats.uniqueProjects,650,'frozen Chunk 28 canonical-project baseline drift');
  assert.equal(baselineVault.videos.filter(video => video.creatorId === 'youtube:asianhalfsquat').length,48,'frozen Chunk 28 AHS video baseline drift');
  const frozen = spawnSync(process.execPath,[frozenQaPath],{cwd:root,stdio:'inherit'});
  assert.equal(frozen.status,0,'frozen Chunk 28 recursive acceptance failed with Chunk 29 hidden');
} finally {
  if (fs.existsSync(creatorsBackup)) fs.copyFileSync(creatorsBackup,creatorsPath);
  if (fs.existsSync(closureBackup)) fs.renameSync(closureBackup,closurePath);
  if (fs.existsSync(sourceBackup)) fs.renameSync(sourceBackup,sourcePath);
  fs.rmSync(tempDir,{recursive:true,force:true});
}

const vault = loadCreatorVault(root);
const expectedStats = {creators:14,indexedCreators:3,videos:59,recommendations:977,uniqueProjects:667,verifiedProjects:665,unresolvedProjects:2,multiProviderProjects:437,providerDestinations:1231,verifiedHomes:665,importedCatalogs:1,nativeRecommendationSources:25,setupPacks:5};
for (const [field,value] of Object.entries(expectedStats)) assert.equal(vault.stats[field],value,`Chunk 29 runtime stat drift: ${field}`);
const unresolved = vault.projects.filter(project => !project.providerLinks.length).map(project => project.name).sort();
assert.deepEqual(unresolved,['Better Book Recipe','Plank and Junk'],'Chunk 29 unresolved set drift');

const ahsCreator = currentCreators.creators.find(creator => creator.id === 'youtube:asianhalfsquat');
assert(ahsCreator,'AsianHalfSquat creator ledger missing');
assert.equal(ahsCreator.coverage.indexedVideos,50,'AHS creator ledger indexedVideos drift');
assert.equal(ahsCreator.coverage.recommendationCount,718,'AHS creator ledger recommendationCount drift');
assert.equal(ahsCreator.coverage.verifiedProjectHomes,718,'AHS creator ledger verifiedProjectHomes drift');

const expectedVideos = [
  ['youtube:gBMEwunuEUI','The Best Minecraft Graphics Mod Is Available Now','2024-06-10',15,[null]],
  ['youtube:6LG88eiovYM','How to Turn Minecraft into an Overly Realistic Survival Game','2024-05-31',28,[18,33,50,67,93,113,130,160,171,180,198,213,225,243,268,275,285,298,306,319,340,350,373,386,394,406,431,457]]
];
const chunkVideos = [];
for (const [id,title,publishedAt,count,legalTimes] of expectedVideos) {
  const video = vault.videos.find(item => item.id === id);
  assert(video,`Chunk 29 video missing: ${id}`);
  assert.equal(video.title,title,`${id} title drift`);
  assert.equal(video.publishedAt,publishedAt,`${id} publishedAt drift`);
  assert.equal(video.mods.length,count,`${id} mention count drift`);
  assert(video.mods.every(mod => mod.providerLinks.length > 0),`${id} contains providerless recommendation`);
  const allowed = new Set(legalTimes);
  assert(video.mods.every(mod => allowed.has(mod.timestampSeconds)),`${id} contains invented/non-creator timestamp`);
  chunkVideos.push(video);
}
const chunkMods = chunkVideos.flatMap(video => video.mods);
assert.equal(chunkMods.length,43,'Chunk 29 total mention count drift');
assert.equal(new Set(chunkMods.map(mod => mod.canonicalProjectId)).size,42,'Chunk 29 canonical-project count drift');
assert.equal(chunkMods.filter(mod => mod.providerLinks.length > 0).length,43,'Chunk 29 linked mention count drift');
assert.equal(chunkVideos[0].mods.filter(mod => mod.timestampSeconds == null).length,15,'June 10 must keep exactly 15 null timestamps');
assert.equal(chunkVideos[1].mods.filter(mod => mod.timestampSeconds == null).length,0,'May 31 may not lose creator timestamps');
assert.deepStrictEqual(chunkVideos[1].mods.map(mod => mod.timestampSeconds),[18,33,50,67,93,113,130,160,171,180,198,213,225,243,268,275,285,298,306,319,340,350,373,386,394,406,431,457],'May 31 timestamp sequence drift');

const bySourceName = new Map();
for (const mod of chunkMods) {
  if (!bySourceName.has(mod.name)) bySourceName.set(mod.name,[]);
  bySourceName.get(mod.name).push(mod);
}
for (const [sourceName,canonicalId] of [
  ['Noisium','noisium'],['Time Control','time-control'],['Stack Size Edit','stack-size-edit'],['No Tree Punching','no-tree-punching'],['Unnecessary Overhaul','unnecessary-overhaul'],['Body Health System','body-health-system'],['Spoiled','spoiled'],['Dehydration','dehydration'],['True Darkness','true-darkness'],['Torch Burnout','torch-burnout'],['Neutral Animals','neutral-animals'],['Mobs Attempt Parkour','mobs-attempt-parkour'],['Boids','boids'],['Danger Close','danger-close'],['Fire arrows ignite fire','fire-arrows-ignite-fire'],['Realistic Fire Spread','realistic-fire-spread'],['EnvironmentZ','environmentz'],
  ['Distant Horizons','distant-horizons'],['C2ME','c2me'],['Bliss','bliss-shaders'],['Bliss Shaders','bliss-shaders'],['Physics Mod Pro','physics-mod'],['Camera Overhaul','cameraoverhaul']
]) {
  const matches = bySourceName.get(sourceName) || [];
  assert(matches.length > 0,`required source label missing: ${sourceName}`);
  assert(matches.every(mod => mod.canonicalProjectId === canonicalId),`canonical identity drift for ${sourceName}`);
}
for (const forbiddenId of ['body-health','body-health-system-forked','boids-reforged','true-darkness-reforged']) {
  assert(!vault.projects.some(project => project.id === forbiddenId),`false-merge/fork project leaked into registry: ${forbiddenId}`);
}

assert.equal(source.videos.length,2,'Chunk 29 source must remain exactly two videos');
assert.equal(source.videos.reduce((sum,video) => sum + video.mods.length,0),43,'Chunk 29 source recommendation count drift');
for (const forbidden of ['Timelapse','A few Ideas','Fabric','Your Suggestions - Unicorn Heads']) {
  assert(!source.videos.some(video => video.mods.some(mod => mod.name === forbidden)),`excluded evidence leaked into recommendations: ${forbidden}`);
}
assert(!source.videos.some(video => video.id === 'youtube:2024-05-28'),'May 28 short-form chronology item must not be guessed into Chunk 29');

assert.equal((closure.entries || []).length,17,'Chunk 29 provider closure card count drift');
assert.equal((candidates.entries || []).length,17,'Chunk 29 provider candidate card count drift');
assert.equal(candidates.expected.newCandidateFamilies,17,'Chunk 29 declared new-family count drift');
const destinationCount = (closure.entries || []).reduce((sum,entry) => sum + ((entry[4] || []).length),0);
assert.equal(destinationCount,28,'Chunk 29 provider destination count drift');
const baselineIds = new Set(baselineVault.projects.map(project => project.id));
const closureIds = (closure.entries || []).map(entry => entry[0]);
assert.equal(closureIds.filter(id => baselineIds.has(id)).length,0,'Chunk 29 closure unexpectedly reuses a pre-existing canonical ID');
assert.equal(closureIds.filter(id => !baselineIds.has(id)).length,17,'Chunk 29 new canonical identity count drift');
const normalizeUrl = value => String(value || '').trim().replace(/\/$/,'').toLowerCase();
const providerMap = closure.providers || {};
for (const entry of closure.entries || []) {
  const [id,,,,links] = entry;
  const project = vault.projects.find(item => item.id === id);
  assert(project,`Chunk 29 closure project missing from runtime: ${id}`);
  assert((links || []).length > 0,`Chunk 29 providerless closure entry: ${id}`);
  for (const link of links || []) {
    const provider = providerMap[link[0]] || link[0];
    const url = link[1];
    assert(project.providerLinks.some(item => item.provider === provider && normalizeUrl(item.url) === normalizeUrl(url)),`missing exact provider destination for ${id}: ${url}`);
    const owners = vault.projects.filter(item => (item.providerLinks || []).some(itemLink => normalizeUrl(itemLink.url) === normalizeUrl(url))).map(item => item.id);
    assert.deepEqual(owners,[id],`incoming Chunk 29 URL collision: ${url}`);
  }
}

const ahsVideos = vault.videos.filter(video => video.creatorId === 'youtube:asianhalfsquat');
const ahsMods = ahsVideos.flatMap(video => video.mods);
const ahsLinked = ahsMods.filter(mod => mod.providerLinks.length > 0);
assert.equal(ahsVideos.length,50,'AHS video count drift');
assert.equal(ahsMods.length,718,'AHS mention count drift');
assert.equal(ahsLinked.length,718,'AHS linked mention count drift');
assert.equal(new Set(ahsMods.map(mod => mod.canonicalProjectId)).size,457,'AHS canonical-project count drift');
assert.equal(new Set(ahsLinked.map(mod => mod.canonicalProjectId)).size,457,'AHS linked canonical-project count drift');

console.log('Creator Vault AsianHalfSquat chunk 29 QA passed: 977 mentions -> 667 canonical projects; 665 linked / 1231 destinations / 437 multi-provider / 2 unresolved. AHS linked mentions=718/718 across 457 canonical projects; two-video batch=43 mentions / 42 canonical projects / 17 new global identities, with 15 exact null timestamps on June 10 and all 28 creator timestamps preserved on May 31; recursive chunk-28 baseline locked.');
