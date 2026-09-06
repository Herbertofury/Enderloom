'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');

const root = path.resolve(__dirname,'..');
const sourcePath = path.join(root,'catalog','creator-vault','recommendation-sources','asianhalfsquat.history-batch33.json');
const closurePath = path.join(root,'catalog','creator-vault','project-sources','provider-closure-33a-asianhalfsquat.json');
const aliasPath = path.join(root,'catalog','creator-vault','project-sources','identity-alias-33a-asianhalfsquat.json');
const researchPath = path.join(root,'catalog','creator-vault','research','asianhalfsquat.chunk33-source.json');
const providerResearchPath = path.join(root,'catalog','creator-vault','research','asianhalfsquat.chunk33-provider-candidates.json');
const creatorsPath = path.join(root,'catalog','creator-vault','creators.json');
const diagnosticPath = path.join(__dirname,'creator-vault-ahs33-postmerge-diagnostic.js');
for (const file of [sourcePath,closurePath,aliasPath,researchPath,providerResearchPath,creatorsPath,diagnosticPath]) assert(fs.existsSync(file),`required Chunk 33 acceptance input missing: ${file}`);
const diagnostic = spawnSync(process.execPath,[diagnosticPath],{cwd:root,stdio:'inherit'});
assert.equal(diagnostic.status,0,'Chunk 33 post-merge diagnostic / recursive Chunk 32 acceptance failed');

const source = require(sourcePath);
const closure = require(closurePath);
const aliasOverlay = require(aliasPath);
const research = require(researchPath);
const providerResearch = require(providerResearchPath);
const creators = require(creatorsPath);
const vault = loadCreatorVault(root);
const expectedStats = {creators:14,indexedCreators:3,videos:62,recommendations:1005,uniqueProjects:676,verifiedProjects:674,unresolvedProjects:2,multiProviderProjects:445,providerDestinations:1252,verifiedHomes:674,importedCatalogs:1,nativeRecommendationSources:29,setupPacks:5};
for (const [field,value] of Object.entries(expectedStats)) assert.equal(vault.stats[field],value,`Chunk 33 runtime stat drift: ${field}`);
const unresolved = vault.projects.filter(project=>!project.providerLinks.length).map(project=>project.name).sort();
assert.deepStrictEqual(unresolved,['Better Book Recipe','Plank and Junk'],'Chunk 33 unresolved set drift');

const ahsCreator = creators.creators.find(creator=>creator.id==='youtube:asianhalfsquat');
assert(ahsCreator,'AsianHalfSquat creator ledger missing');
assert.equal(ahsCreator.coverage.indexedVideos,53,'AHS creator ledger indexedVideos drift');
assert.equal(ahsCreator.coverage.recommendationCount,746,'AHS creator ledger recommendationCount drift');
assert.equal(ahsCreator.coverage.verifiedProjectHomes,746,'AHS creator ledger verifiedProjectHomes drift');

assert.equal(source.videos.length,1,'Chunk 33 production source must contain exactly one video');
const video = vault.videos.find(item=>item.id==='youtube:hBpVYqfyeNM');
assert(video,'Chunk 33 Nov 29 video missing');
assert.equal(video.title,'Top 10 Minecraft Mods (1.20.2) - 2023','Nov 29 title drift');
assert.equal(video.publishedAt,'2023-11-29','Nov 29 date drift');
assert.equal(video.mods.length,10,'Nov 29 mention count drift');
const expectedNames = ['Regions Unexplored','Handcrafted',"LEAWIND's Third Person Perspective",'FallingTree','Mythic Charms','Better Clouds','Evasive Items',"YDM's Weapon Master","Pufferfish's Skills",'Physics Mod Pro'];
const expectedTimestamps = [13,35,57,93,109,130,158,175,198,208];
assert.deepStrictEqual(video.mods.map(mod=>mod.name),expectedNames,'Nov 29 creator list/order drift');
assert.deepStrictEqual(video.mods.map(mod=>mod.timestampSeconds),expectedTimestamps,'Nov 29 creator timestamp drift');
assert(video.mods.every(mod=>mod.providerLinks.length>0),'Chunk 33 contains providerless recommendation');
for (const shader of ['Nostalgia','Complementary Reimagined','Rethinking Voxels']) assert(!video.mods.some(mod=>mod.name===shader),`post-outro shader leaked into Chunk 33: ${shader}`);
const expectedMappings = new Map([
  ['Regions Unexplored','regions-unexplored'],['Handcrafted','handcrafted'],["LEAWIND's Third Person Perspective",'leawind-third-person'],['FallingTree','fallingtree'],['Mythic Charms','mythic-charms'],['Better Clouds','better-clouds'],['Evasive Items','evasive-items'],["YDM's Weapon Master",'ydm-s-weapon-master'],["Pufferfish's Skills",'pufferfish-s-skills'],['Physics Mod Pro','physics-mod']
]);
for (const mod of video.mods) assert.equal(mod.canonicalProjectId,expectedMappings.get(mod.name),`Chunk 33 canonical mapping drift for ${mod.name}`);
assert.equal(new Set(video.mods.map(mod=>mod.canonicalProjectId)).size,10,'Chunk 33 batch canonical identity count drift');

assert.equal(research.sourceMentions,10,'Chunk 33 frozen research count drift');
assert.equal(providerResearch.expected.candidateEntries,4,'Chunk 33 provider research candidate count drift');
assert.equal(providerResearch.expected.newCandidateFamilies,4,'Chunk 33 provider research new-family count drift');
assert.equal(providerResearch.expected.destinations,11,'Chunk 33 provider research destination count drift');
assert.equal((closure.entries||[]).length,4,'Chunk 33 production provider closure must contain exactly four new cards');
assert.equal((closure.entries||[]).reduce((sum,entry)=>sum+(entry[4]||[]).length,0),11,'Chunk 33 production provider closure destination count drift');
assert.equal((aliasOverlay.entries||[]).length,1,'Chunk 33 identity alias overlay must contain exactly one row');
assert.equal(aliasOverlay.entries[0][0],'leawind-third-person','Chunk 33 alias overlay canonical id drift');
assert((aliasOverlay.entries[0][3]||[]).includes("LEAWIND's Third Person Perspective"),'Chunk 33 LEAWIND historical alias missing from overlay');
assert.equal((aliasOverlay.entries[0][4]||[]).length,0,'Chunk 33 alias overlay must add zero provider destinations');

for (const [id,count] of [['fallingtree',3],['mythic-charms',3],['evasive-items',3],['ydm-s-weapon-master',2]]) {
  const project = vault.projects.find(item=>item.id===id);
  assert(project,`new Chunk 33 project missing: ${id}`);
  assert.equal(project.providerLinks.length,count,`provider destination drift for ${id}`);
}
const leawind = vault.projects.find(item=>item.id==='leawind-third-person');
assert(leawind && leawind.aliases.includes("LEAWIND's Third Person Perspective"),'merged LEAWIND creator alias missing');

const ahsVideos = vault.videos.filter(item=>item.creatorId==='youtube:asianhalfsquat');
const ahsMods = ahsVideos.flatMap(item=>item.mods);
const ahsLinked = ahsMods.filter(mod=>mod.providerLinks.length>0);
assert.equal(ahsVideos.length,53,'AHS video count drift');
assert.equal(ahsMods.length,746,'AHS mention count drift');
assert.equal(ahsLinked.length,746,'AHS linked mention count drift');
assert.equal(new Set(ahsMods.map(mod=>mod.canonicalProjectId)).size,468,'AHS canonical identity count drift');
assert.equal(new Set(ahsLinked.map(mod=>mod.canonicalProjectId)).size,468,'AHS linked canonical identity count drift');

console.log('Creator Vault AsianHalfSquat chunk 33 QA passed: 1005 mentions -> 676 canonical projects; 674 linked / 1252 destinations / 445 multi-provider / 2 unresolved. AHS=53/350 videos, 746/746 linked mentions across 468 canonical identities. Nov-29 batch=10 mentions / 6 global reuse / 4 new canonical projects / 11 new provider destinations; LEAWIND historical alias reuses leawind-third-person; post-outro shaders excluded; recursive Chunk 32 acceptance locked.');
