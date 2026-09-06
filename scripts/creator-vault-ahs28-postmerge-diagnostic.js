'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root,'catalog','creator-vault','recommendation-sources','asianhalfsquat.history-batch28.json');
const providerPath = path.join(root,'catalog','creator-vault','project-sources','provider-closure-28a-asianhalfsquat.json');
const currentQaPath = path.join(__dirname,'creator-vault-qa.js');

assert(fs.existsSync(sourcePath), 'chunk 28 production source must exist for diagnostic');
assert(fs.existsSync(providerPath), 'chunk 28 provider closure must exist for diagnostic');
assert(fs.existsSync(currentQaPath), 'current chunk 27 QA missing');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-ahs28-diagnostic-'));
const sourceBackup = path.join(tempDir,path.basename(sourcePath));
const providerBackup = path.join(tempDir,path.basename(providerPath));
try {
  fs.renameSync(sourcePath,sourceBackup);
  fs.renameSync(providerPath,providerBackup);
  const baseline = loadCreatorVault(root);
  assert.equal(baseline.stats.recommendations,833,'frozen chunk 27 recommendations');
  assert.equal(baseline.stats.uniqueProjects,600,'frozen chunk 27 canonical projects');
  const legacy = spawnSync(process.execPath,[currentQaPath],{cwd:root,stdio:'inherit'});
  assert.equal(legacy.status,0,'chunk 27 recursive acceptance must stay green with chunk 28 hidden');
} finally {
  if (fs.existsSync(providerBackup)) fs.renameSync(providerBackup,providerPath);
  if (fs.existsSync(sourceBackup)) fs.renameSync(sourceBackup,sourcePath);
  fs.rmSync(tempDir,{recursive:true,force:true});
}

const vault = loadCreatorVault(root);
const expectedVideos = [
  ['youtube:IL804sqMbbE','Turning Minecraft Into Elden Ring With Mods 2.0','2024-08-03',43],
  ['youtube:o499NnspGIM','Minecraft Mod Combinations That Work Perfectly Together #7','2024-07-09',26],
  ['youtube:94j9prLG-Sc','I Made Minecraft As Immersive As Possible Using Mods','2024-06-15',32]
];
const videos = expectedVideos.map(([id,title,publishedAt,count]) => {
  const video = vault.videos.find(v => v.id === id);
  assert(video,`chunk 28 source video missing: ${id}`);
  assert.equal(video.title,title,`${id} title drift`);
  assert.equal(video.publishedAt,publishedAt,`${id} date drift`);
  assert.equal(video.mods.length,count,`${id} mention count drift`);
  assert(video.mods.every(mod => mod.providerLinks.length > 0),`${id} contains providerless mention`);
  return video;
});
const chunkMods = videos.flatMap(video => video.mods);
assert.equal(chunkMods.length,101,'chunk 28 total mention count drift');
assert.equal(chunkMods.filter(mod => mod.timestampSeconds == null).length,2,'only Sodium and Iris may keep null timestamps');
for (const mod of chunkMods.filter(mod => mod.timestampSeconds == null)) {
  assert(['Sodium','Iris'].includes(mod.name),`unexpected null timestamp ${mod.name}`);
}
const named = new Map(chunkMods.map(mod => [mod.name,mod]));
for (const [name,id] of [
  ['Fabric Sky Boxes','nuit'],
  ['FabricSkyBoxes','nuit'],
  ['Fabric SkyBoxes Interop','nuit-interop'],
  ['FabricSkyBoxes Interop','nuit-interop'],
  ['Farmers Delight','farmers-delight'],
  ['Terralith','terralith'],
  ['Extended Lantern','extended-illumina'],
  ['Entity Texture Features','entity-texture-features'],
  ['Conquest','conquest'],
  ['FastMove','fastmove'],
  ['Profundis','profundis'],
  ['Spice of Life Valheim Edition','spice-of-life-valheim-edition']
]) {
  const mod = named.get(name);
  assert(mod,`missing source mention ${name}`);
  assert.equal(mod.canonicalProjectId,id,`canonical identity mismatch for ${name}`);
}
assert(!vault.projects.some(project => project.id === 'fabric-sky-boxes'),'Fabric Sky Boxes must not create duplicate card');
assert(!vault.projects.some(project => project.id === 'fabricskyboxes'),'FabricSkyBoxes must not create duplicate card');
assert(!vault.projects.some(project => project.id === 'fabric-skyboxes-interop'),'Fabric SkyBoxes Interop must not create duplicate card');
assert(!vault.projects.some(project => project.id === 'farmers-delight-2'),'Farmers Delight must reuse existing card');

const ahsVideos = vault.videos.filter(v => v.creatorId === 'youtube:asianhalfsquat');
const ahsMods = ahsVideos.flatMap(v => v.mods);
const ahsLinked = ahsMods.filter(mod => mod.providerLinks.length > 0);
const report = {
  phase:'post-merge-diagnostic',
  stats:vault.stats,
  unresolved:vault.projects.filter(project => !project.providerLinks.length).map(project => project.name).sort(),
  asianHalfSquat:{
    videos:ahsVideos.length,
    mentions:ahsMods.length,
    linkedMentions:ahsLinked.length,
    canonicalProjects:new Set(ahsMods.map(mod => mod.canonicalProjectId)).size,
    linkedCanonicalProjects:new Set(ahsLinked.map(mod => mod.canonicalProjectId)).size
  },
  chunk28:{
    videos:videos.map(video => ({
      id:video.id,
      title:video.title,
      publishedAt:video.publishedAt,
      mentions:video.mods.length,
      canonicalProjects:new Set(video.mods.map(mod => mod.canonicalProjectId)).size
    })),
    mentions:chunkMods.length,
    canonicalProjects:new Set(chunkMods.map(mod => mod.canonicalProjectId)).size,
    mappings:chunkMods.map(mod => ({
      name:mod.name,
      canonicalProjectId:mod.canonicalProjectId,
      canonicalName:mod.canonicalName,
      timestampSeconds:mod.timestampSeconds,
      providers:[...new Set(mod.providerLinks.map(link => link.provider))].sort(),
      providerLinks:mod.providerLinks.map(link => link.url)
    }))
  }
};
console.log(JSON.stringify(report,null,2));
if (vault.diagnostics.some(item => item.level === 'error')) process.exitCode = 2;
