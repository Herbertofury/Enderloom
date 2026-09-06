'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');

const root = path.resolve(__dirname,'..');
const sourcePath = path.join(root,'catalog','creator-vault','recommendation-sources','asianhalfsquat.history-batch33.json');
const closurePath = path.join(root,'catalog','creator-vault','project-sources','provider-closure-33a-asianhalfsquat.json');
const aliasPath = path.join(root,'catalog','creator-vault','project-sources','identity-alias-33a-asianhalfsquat.json');
const researchPath = path.join(root,'catalog','creator-vault','research','asianhalfsquat.chunk33-source.json');
const providerResearchPath = path.join(root,'catalog','creator-vault','research','asianhalfsquat.chunk33-provider-candidates.json');
const priorDiagnosticPath = path.join(__dirname,'creator-vault-ahs32-postmerge-diagnostic.js');
for (const file of [sourcePath,closurePath,aliasPath,researchPath,providerResearchPath,priorDiagnosticPath]) assert(fs.existsSync(file),`required Chunk 33 diagnostic input missing: ${file}`);

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-ahs33-diagnostic-'));
const moves = [sourcePath,closurePath,aliasPath].map(file => [file,path.join(tempDir,path.basename(file))]);
let baseline;
try {
  for (const [from,to] of moves) fs.renameSync(from,to);
  baseline = loadCreatorVault(root);
  assert.equal(baseline.stats.recommendations,995,'frozen Chunk 32 recommendation baseline');
  assert.equal(baseline.stats.uniqueProjects,672,'frozen Chunk 32 canonical baseline');
  assert(!baseline.videos.some(v=>v.id==='youtube:hBpVYqfyeNM'),'Chunk 33 video must be absent from sealed Chunk 32 baseline');
  const prior = spawnSync(process.execPath,[priorDiagnosticPath],{cwd:root,stdio:'inherit'});
  assert.equal(prior.status,0,'recursive exact Chunk 32 acceptance failed with Chunk 33 hidden');
} finally {
  for (const [from,to] of moves.reverse()) if (fs.existsSync(to)) fs.renameSync(to,from);
  fs.rmSync(tempDir,{recursive:true,force:true});
}

const research = require(researchPath);
const providerResearch = require(providerResearchPath);
const vault = loadCreatorVault(root);
const video = vault.videos.find(v=>v.id==='youtube:hBpVYqfyeNM');
assert(video,'Chunk 33 Nov 29 source video missing');
assert.equal(video.title,'Top 10 Minecraft Mods (1.20.2) - 2023','Nov 29 title drift');
assert.equal(video.publishedAt,'2023-11-29','Nov 29 date drift');
assert.equal(video.mods.length,10,'Nov 29 mention count drift');
assert.deepStrictEqual(video.mods.map(mod=>mod.name),['Regions Unexplored','Handcrafted',"LEAWIND's Third Person Perspective",'FallingTree','Mythic Charms','Better Clouds','Evasive Items',"YDM's Weapon Master","Pufferfish's Skills",'Physics Mod Pro'],'Nov 29 source order drift');
assert.deepStrictEqual(video.mods.map(mod=>mod.timestampSeconds),[13,35,57,93,109,130,158,175,198,208],'Nov 29 creator timestamps drift');
assert(video.mods.every(mod=>mod.providerLinks.length>0),'Chunk 33 contains providerless recommendation');
for (const shader of ['Nostalgia','Complementary Reimagined','Rethinking Voxels']) assert(!video.mods.some(mod=>mod.name===shader),`post-outro shader leaked into recommendations: ${shader}`);

const expectedMappings = new Map([
  ['Regions Unexplored','regions-unexplored'],['Handcrafted','handcrafted'],["LEAWIND's Third Person Perspective",'leawind-third-person'],['FallingTree','fallingtree'],['Mythic Charms','mythic-charms'],['Better Clouds','better-clouds'],['Evasive Items','evasive-items'],["YDM's Weapon Master",'ydm-s-weapon-master'],["Pufferfish's Skills",'pufferfish-s-skills'],['Physics Mod Pro','physics-mod']
]);
for (const mod of video.mods) assert.equal(mod.canonicalProjectId,expectedMappings.get(mod.name),`Chunk 33 canonical mapping drift for ${mod.name}`);
assert.equal(new Set(video.mods.map(mod=>mod.canonicalProjectId)).size,10,'Chunk 33 batch canonical identity count drift');

assert.equal(research.sourceMentions,10,'Chunk 33 research mention count drift');
assert.equal(providerResearch.expected.candidateEntries,4,'Chunk 33 provider candidate count drift');
assert.equal(providerResearch.expected.newCandidateFamilies,4,'Chunk 33 new candidate count drift');
assert.equal(providerResearch.expected.destinations,11,'Chunk 33 researched destination count drift');

const expectedStats = {videos:62,recommendations:1005,uniqueProjects:676,verifiedProjects:674,unresolvedProjects:2,multiProviderProjects:445,providerDestinations:1252,nativeRecommendationSources:29};
for (const [field,value] of Object.entries(expectedStats)) assert.equal(vault.stats[field],value,`Chunk 33 runtime stat drift: ${field}`);
const unresolved = vault.projects.filter(project=>!project.providerLinks.length).map(project=>project.name).sort();
assert.deepStrictEqual(unresolved,['Better Book Recipe','Plank and Junk'],'Chunk 33 unresolved set drift');
for (const [id,count] of [['fallingtree',3],['mythic-charms',3],['evasive-items',3],['ydm-s-weapon-master',2]]) {
  const project = vault.projects.find(item=>item.id===id); assert(project,`new Chunk 33 project missing: ${id}`); assert.equal(project.providerLinks.length,count,`provider destination drift for ${id}`);
}
const leawind = vault.projects.find(item=>item.id==='leawind-third-person');
assert(leawind && leawind.aliases.includes("LEAWIND's Third Person Perspective"),'Leawind historical alias missing');
const ahsVideos = vault.videos.filter(v=>v.creatorId==='youtube:asianhalfsquat');
const ahsMods = ahsVideos.flatMap(v=>v.mods);
const ahsLinked = ahsMods.filter(mod=>mod.providerLinks.length>0);
assert.equal(ahsVideos.length,53,'AHS video count drift');
assert.equal(ahsMods.length,746,'AHS mention count drift');
assert.equal(ahsLinked.length,746,'AHS linked mention count drift');
assert.equal(new Set(ahsMods.map(mod=>mod.canonicalProjectId)).size,466,'AHS canonical identity count drift');
console.log(JSON.stringify({phase:'chunk-33-post-merge-diagnostic',stats:vault.stats,unresolved,asianHalfSquat:{videos:ahsVideos.length,mentions:ahsMods.length,linkedMentions:ahsLinked.length,canonicalProjects:new Set(ahsMods.map(mod=>mod.canonicalProjectId)).size},chunk33:{videoId:video.id,mentions:10,reuse:6,newCanonicalProjects:4,providerDestinationsAdded:11,mappings:video.mods.map(mod=>({name:mod.name,canonicalProjectId:mod.canonicalProjectId,providers:[...new Set(mod.providerLinks.map(link=>link.provider))].sort()}))}},null,2));
if (vault.diagnostics.some(item=>item.level==='error')) process.exitCode=2;
