'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root,'catalog','creator-vault','recommendation-sources','asianhalfsquat.history-batch32.json');
const researchPath = path.join(root,'catalog','creator-vault','research','asianhalfsquat.chunk32-source.json');
const providerResearchPath = path.join(root,'catalog','creator-vault','research','asianhalfsquat.chunk32-provider-candidates.json');
const priorDiagnosticPath = path.join(__dirname,'creator-vault-ahs31-postmerge-diagnostic.js');
for (const file of [sourcePath,researchPath,providerResearchPath,priorDiagnosticPath]) assert(fs.existsSync(file),`required diagnostic file missing: ${file}`);
const forbiddenClosure = path.join(root,'catalog','creator-vault','project-sources','provider-closure-32a-asianhalfsquat.json');
assert(!fs.existsSync(forbiddenClosure),'Chunk 32 must not create a redundant provider closure for already-canonical projects');

const snapshotVideo = video => video ? {
  id: video.id,
  title: video.title,
  publishedAt: video.publishedAt,
  creatorId: video.creatorId,
  importId: video.importId || null,
  importSourceSystem: video.importSourceSystem || null,
  evidenceKinds: video.evidenceKinds || [],
  mentionCount: (video.mods || []).length,
  mods: (video.mods || []).map(mod => ({
    name: mod.name,
    timestampSeconds: mod.timestampSeconds,
    canonicalProjectId: mod.canonicalProjectId,
    canonicalName: mod.canonicalName,
    providers: [...new Set((mod.providerLinks || []).map(link => link.provider))].sort()
  }))
} : null;

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-ahs32-diagnostic-'));
const sourceBackup = path.join(tempDir,path.basename(sourcePath));
let baseline;
let legacyVideo;
try {
  fs.renameSync(sourcePath,sourceBackup);
  baseline = loadCreatorVault(root);
  assert.equal(baseline.stats.recommendations,996,'frozen Chunk 31 recommendations');
  assert.equal(baseline.stats.uniqueProjects,672,'frozen Chunk 31 canonical projects');
  legacyVideo = baseline.videos.find(v => v.id === 'youtube:Z50_ryPNNAc');
  assert(legacyVideo,'sealed Chunk 31 baseline must contain the overlapping legacy Feb 23 video');
  const prior = spawnSync(process.execPath,[priorDiagnosticPath],{cwd:root,stdio:'inherit'});
  assert.equal(prior.status,0,'exact Chunk 31 recursive/post-merge acceptance must stay green with Chunk 32 hidden');
} finally {
  if (fs.existsSync(sourceBackup)) fs.renameSync(sourceBackup,sourcePath);
  fs.rmSync(tempDir,{recursive:true,force:true});
}

const research = require(researchPath);
const providerResearch = require(providerResearchPath);
const vault = loadCreatorVault(root);
const video = vault.videos.find(v => v.id === 'youtube:Z50_ryPNNAc');
assert(video,'Chunk 32 Feb 23 source video missing');
assert.equal(video.title,'Top 10 Minecraft Mods (1.20) - 2024','Feb 23 title drift');
assert.equal(video.publishedAt,'2024-02-23','Feb 23 date drift');
assert.equal(video.mods.length,10,'Feb 23 native mention count drift');
assert(video.mods.every(mod => mod.providerLinks.length > 0),'Feb 23 contains providerless mention');
assert.deepStrictEqual(video.mods.map(mod => mod.timestampSeconds),[22,52,81,108,129,170,142,232,253,278],'Feb 23 literal source timestamp/order drift');
assert.equal(research.sourceMentions,10,'Chunk 32 frozen research count drift');
assert.equal(research.videos.length,1,'Chunk 32 research video count drift');
assert.equal(providerResearch.expected.existingCandidateFamilies,5,'Chunk 32 existing-family count drift');
assert.equal(providerResearch.expected.newCandidateFamilies,0,'Chunk 32 must add zero canonical families');
assert.equal(providerResearch.expected.destinations,17,'Chunk 32 researched destination count drift');

const expectedNames = ['Infinity Cave','Dynamic Surroundings','Chunk By Chunk','Multi Mine','Thin Air','Horse Combat Controls','Grappling Hook Mod','Atmospheric Phenomena','BetterEnd','Exposure'];
assert.deepStrictEqual(video.mods.map(mod => mod.name),expectedNames,'Feb 23 creator list/order drift');
const named = new Map(video.mods.map(mod => [mod.name,mod]));
for (const [name,id] of [
  ['Infinity Cave','infinity-cave'],['Dynamic Surroundings','dynamic-surroundings'],['Chunk By Chunk','chunk-by-chunk'],['Multi Mine','multi-mine'],['Thin Air','thin-air'],['Horse Combat Controls','horse-combat-controls'],['Grappling Hook Mod','grappling-hook-mod'],['Atmospheric Phenomena','atmospheric-phenomena'],['BetterEnd','betterend'],['Exposure','exposure']
]) {
  const mod = named.get(name); assert(mod,`missing source mention ${name}`); assert.equal(mod.canonicalProjectId,id,`canonical identity mismatch for ${name}`);
}

const legacyNames = legacyVideo.mods.map(mod => mod.name);
const nativeNames = video.mods.map(mod => mod.name);
const removedLegacyNames = legacyNames.filter(name => !nativeNames.includes(name));
const addedNativeNames = nativeNames.filter(name => !legacyNames.includes(name));
const expectedRecommendationTotal = baseline.stats.recommendations - legacyVideo.mods.length + video.mods.length;
assert.equal(vault.stats.recommendations,expectedRecommendationTotal,'Chunk 32 native-over-legacy recommendation reconciliation drift');
assert.equal(vault.stats.videos,baseline.stats.videos,'native-over-legacy promotion must replace the existing video rather than create a duplicate');
assert.equal(video.importId || null,null,'native source should win reconciliation over legacy import metadata');
assert.equal(video.importSourceSystem || null,null,'native source should win reconciliation over legacy import source metadata');
assert.equal(vault.stats.providerDestinations,baseline.stats.providerDestinations,'Chunk 32 source-only reuse must not mutate provider destinations');
assert.equal(vault.stats.multiProviderProjects,baseline.stats.multiProviderProjects,'Chunk 32 source-only reuse must not mutate multi-provider count');
assert.equal(vault.stats.uniqueProjects,baseline.stats.uniqueProjects,'Chunk 32 source-only reuse must not add canonical projects');
assert.equal(vault.stats.verifiedProjects,baseline.stats.verifiedProjects,'Chunk 32 source-only reuse must not change linked canonical-project count');

const unresolved = vault.projects.filter(project => !project.providerLinks.length).map(project => project.name).sort();
assert.deepStrictEqual(unresolved,['Better Book Recipe','Plank and Junk'],'global unresolved identity set drift');
const ahsVideos = vault.videos.filter(v => v.creatorId === 'youtube:asianhalfsquat');
const ahsMods = ahsVideos.flatMap(v => v.mods);
const ahsLinked = ahsMods.filter(mod => mod.providerLinks.length > 0);
assert.equal(ahsVideos.length,baseline.videos.filter(v => v.creatorId === 'youtube:asianhalfsquat').length,'Chunk 32 native-over-legacy promotion must not increase AHS video count');
assert.equal(ahsLinked.length,ahsMods.length,'all AHS mentions must remain linked after reconciliation');

const report = {
  phase:'chunk-32-post-merge-diagnostic',
  reconciliation:{
    baselineStats:baseline.stats,
    legacyVideo:snapshotVideo(legacyVideo),
    nativeVideo:snapshotVideo(video),
    removedLegacyNames,
    addedNativeNames,
    recommendationDelta:video.mods.length - legacyVideo.mods.length,
    expectedRecommendationTotal
  },
  stats:vault.stats,
  unresolved,
  asianHalfSquat:{
    videos:ahsVideos.length,
    mentions:ahsMods.length,
    linkedMentions:ahsLinked.length,
    canonicalProjects:new Set(ahsMods.map(mod => mod.canonicalProjectId)).size,
    linkedCanonicalProjects:new Set(ahsLinked.map(mod => mod.canonicalProjectId)).size
  },
  chunk32:{
    video:{id:video.id,title:video.title,publishedAt:video.publishedAt,mentions:video.mods.length,canonicalProjects:new Set(video.mods.map(mod => mod.canonicalProjectId)).size,timestamps:video.mods.map(mod => mod.timestampSeconds)},
    reuse:10,
    newCanonicalProjects:0,
    mappings:video.mods.map(mod => ({name:mod.name,canonicalProjectId:mod.canonicalProjectId,canonicalName:mod.canonicalName,providers:[...new Set(mod.providerLinks.map(link => link.provider))].sort(),providerLinks:mod.providerLinks.map(link => link.url)}))
  }
};
console.log(JSON.stringify(report,null,2));
if (vault.diagnostics.some(item => item.level === 'error')) process.exitCode = 2;
