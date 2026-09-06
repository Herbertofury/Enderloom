'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root,'catalog','creator-vault','recommendation-sources','asianhalfsquat.history-batch29.json');
const providerPath = path.join(root,'catalog','creator-vault','project-sources','provider-closure-29a-asianhalfsquat.json');
const creatorsPath = path.join(root,'catalog','creator-vault','creators.json');
const baselineCreatorsPath = path.join(root,'catalog','creator-vault','research','creators.chunk28-baseline.json');
const frozenQaPath = path.join(__dirname,'creator-vault-qa-chunk28.js');

for (const file of [sourcePath,providerPath,creatorsPath,baselineCreatorsPath,frozenQaPath]) {
  assert(fs.existsSync(file),`required diagnostic file missing: ${file}`);
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-ahs29-diagnostic-'));
const sourceBackup = path.join(tempDir,path.basename(sourcePath));
const providerBackup = path.join(tempDir,path.basename(providerPath));
const creatorsBackup = path.join(tempDir,'creators.current.json');
try {
  fs.renameSync(sourcePath,sourceBackup);
  fs.renameSync(providerPath,providerBackup);
  fs.copyFileSync(creatorsPath,creatorsBackup);
  fs.copyFileSync(baselineCreatorsPath,creatorsPath);
  const baseline = loadCreatorVault(root);
  assert.equal(baseline.stats.recommendations,934,'frozen chunk 28 recommendations');
  assert.equal(baseline.stats.uniqueProjects,650,'frozen chunk 28 canonical projects');
  const legacy = spawnSync(process.execPath,[frozenQaPath],{cwd:root,stdio:'inherit'});
  assert.equal(legacy.status,0,'exact frozen chunk 28 recursive acceptance must stay green with chunk 29 hidden');
} finally {
  if (fs.existsSync(creatorsBackup)) fs.copyFileSync(creatorsBackup,creatorsPath);
  if (fs.existsSync(providerBackup)) fs.renameSync(providerBackup,providerPath);
  if (fs.existsSync(sourceBackup)) fs.renameSync(sourceBackup,sourcePath);
  fs.rmSync(tempDir,{recursive:true,force:true});
}

const vault = loadCreatorVault(root);
const expectedVideos = [
  ['youtube:gBMEwunuEUI','The Best Minecraft Graphics Mod Is Available Now','2024-06-10',15],
  ['youtube:6LG88eiovYM','How to Turn Minecraft into an Overly Realistic Survival Game','2024-05-31',28]
];
const videos = expectedVideos.map(([id,title,publishedAt,count]) => {
  const video = vault.videos.find(v => v.id === id);
  assert(video,`chunk 29 source video missing: ${id}`);
  assert.equal(video.title,title,`${id} title drift`);
  assert.equal(video.publishedAt,publishedAt,`${id} date drift`);
  assert.equal(video.mods.length,count,`${id} mention count drift`);
  assert(video.mods.every(mod => mod.providerLinks.length > 0),`${id} contains providerless mention`);
  return video;
});
const chunkMods = videos.flatMap(video => video.mods);
assert.equal(chunkMods.length,43,'chunk 29 total mention count drift');
const june = videos[0];
const may = videos[1];
assert.equal(june.mods.filter(mod => mod.timestampSeconds == null).length,15,'all June 10 mentions must stay untimestamped');
assert(june.mods.every(mod => mod.timestampSeconds == null),'June 10 must use base-video links only');
assert.equal(may.mods.filter(mod => mod.timestampSeconds == null).length,0,'May 31 creator timestamps must all be retained');
const expectedMaySeconds = [18,33,50,67,93,113,130,160,171,180,198,213,225,243,268,275,285,298,306,319,340,350,373,386,394,406,431,457];
assert.deepStrictEqual(may.mods.map(mod => mod.timestampSeconds),expectedMaySeconds,'May 31 timestamp sequence drift');

const named = new Map(chunkMods.map(mod => [mod.name,mod]));
for (const [name,id] of [
  ['Noisium','noisium'],['Time Control','time-control'],['Stack Size Edit','stack-size-edit'],
  ['No Tree Punching','no-tree-punching'],['Unnecessary Overhaul','unnecessary-overhaul'],
  ['Body Health System','body-health-system'],['Spoiled','spoiled'],['Dehydration','dehydration'],
  ['True Darkness','true-darkness'],['Torch Burnout','torch-burnout'],['Neutral Animals','neutral-animals'],
  ['Mobs Attempt Parkour','mobs-attempt-parkour'],['Boids','boids'],['Danger Close','danger-close'],
  ['Fire arrows ignite fire','fire-arrows-ignite-fire'],['Realistic Fire Spread','realistic-fire-spread'],
  ['EnvironmentZ','environmentz']
]) {
  const mod = named.get(name);
  assert(mod,`missing source mention ${name}`);
  assert.equal(mod.canonicalProjectId,id,`canonical identity mismatch for ${name}`);
}
for (const [name,id] of [
  ['Distant Horizons','distant-horizons'],['C2ME','c2me'],['Bliss','bliss-shaders'],
  ['Bliss Shaders','bliss-shaders'],['Physics Mod Pro','physics-mod'],['Camera Overhaul','cameraoverhaul']
]) {
  const mod = named.get(name);
  assert(mod,`missing reuse mention ${name}`);
  assert.equal(mod.canonicalProjectId,id,`reuse identity mismatch for ${name}`);
}
for (const forbidden of ['body-health','body-health-system-forked','boids-reforged','true-darkness-reforged']) {
  assert(!vault.projects.some(project => project.id === forbidden),`false-merge/fork project leaked into registry: ${forbidden}`);
}

const ahsVideos = vault.videos.filter(v => v.creatorId === 'youtube:asianhalfsquat');
const ahsMods = ahsVideos.flatMap(v => v.mods);
const ahsLinked = ahsMods.filter(mod => mod.providerLinks.length > 0);
const report = {
  phase:'chunk-29-post-merge-diagnostic',
  stats:vault.stats,
  unresolved:vault.projects.filter(project => !project.providerLinks.length).map(project => project.name).sort(),
  asianHalfSquat:{
    videos:ahsVideos.length,
    mentions:ahsMods.length,
    linkedMentions:ahsLinked.length,
    canonicalProjects:new Set(ahsMods.map(mod => mod.canonicalProjectId)).size,
    linkedCanonicalProjects:new Set(ahsLinked.map(mod => mod.canonicalProjectId)).size
  },
  chunk29:{
    videos:videos.map(video => ({id:video.id,title:video.title,publishedAt:video.publishedAt,mentions:video.mods.length,canonicalProjects:new Set(video.mods.map(mod => mod.canonicalProjectId)).size,nullTimestamps:video.mods.filter(mod => mod.timestampSeconds == null).length})),
    mentions:chunkMods.length,
    canonicalProjects:new Set(chunkMods.map(mod => mod.canonicalProjectId)).size,
    mappings:chunkMods.map(mod => ({name:mod.name,canonicalProjectId:mod.canonicalProjectId,canonicalName:mod.canonicalName,timestampSeconds:mod.timestampSeconds,providers:[...new Set(mod.providerLinks.map(link => link.provider))].sort(),providerLinks:mod.providerLinks.map(link => link.url)}))
  }
};
console.log(JSON.stringify(report,null,2));
assert.deepStrictEqual(report.unresolved,['Better Book Recipe','Plank and Junk'],'global unresolved identity set drift');
if (vault.diagnostics.some(item => item.level === 'error')) process.exitCode = 2;
