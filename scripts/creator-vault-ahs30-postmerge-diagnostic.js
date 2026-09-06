'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root,'catalog','creator-vault','recommendation-sources','asianhalfsquat.history-batch30.json');
const providerPath = path.join(root,'catalog','creator-vault','project-sources','provider-closure-30a-asianhalfsquat.json');
const researchPath = path.join(root,'catalog','creator-vault','research','asianhalfsquat.chunk30-source.json');
const creatorsPath = path.join(root,'catalog','creator-vault','creators.json');
const baselineCreatorsPath = path.join(root,'catalog','creator-vault','research','creators.chunk29-baseline.json');
const frozenQaPath = path.join(__dirname,'creator-vault-qa-chunk29.js');
for (const file of [sourcePath,providerPath,researchPath,creatorsPath,baselineCreatorsPath,frozenQaPath]) assert(fs.existsSync(file),`required diagnostic file missing: ${file}`);

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-ahs30-diagnostic-'));
const sourceBackup = path.join(tempDir,path.basename(sourcePath));
const providerBackup = path.join(tempDir,path.basename(providerPath));
const creatorsBackup = path.join(tempDir,'creators.current.json');
try {
  fs.renameSync(sourcePath,sourceBackup);
  fs.renameSync(providerPath,providerBackup);
  fs.copyFileSync(creatorsPath,creatorsBackup);
  fs.copyFileSync(baselineCreatorsPath,creatorsPath);
  const baseline = loadCreatorVault(root);
  assert.equal(baseline.stats.recommendations,977,'frozen chunk 29 recommendations');
  assert.equal(baseline.stats.uniqueProjects,667,'frozen chunk 29 canonical projects');
  const legacy = spawnSync(process.execPath,[frozenQaPath],{cwd:root,stdio:'inherit'});
  assert.equal(legacy.status,0,'exact frozen chunk 29 recursive acceptance must stay green with chunk 30 hidden');
} finally {
  if (fs.existsSync(creatorsBackup)) fs.copyFileSync(creatorsBackup,creatorsPath);
  if (fs.existsSync(providerBackup)) fs.renameSync(providerBackup,providerPath);
  if (fs.existsSync(sourceBackup)) fs.renameSync(sourceBackup,sourcePath);
  fs.rmSync(tempDir,{recursive:true,force:true});
}

const research = require(researchPath);
const vault = loadCreatorVault(root);
const video = vault.videos.find(v => v.id === 'youtube:XO51AADPLDg');
assert(video,'chunk 30 May 24 source video missing');
assert.equal(video.title,'Top 10 Minecraft Mods (1.20.6) - 2024','May 24 title drift');
assert.equal(video.publishedAt,'2024-05-24','May 24 date drift');
assert.equal(video.mods.length,10,'May 24 mention count drift');
assert(video.mods.every(mod => mod.providerLinks.length > 0),'May 24 contains providerless mention');
assert.deepStrictEqual(video.mods.map(mod => mod.timestampSeconds),[24,46,64,78,102,118,140,175,214,236],'May 24 timestamp sequence drift');
assert.equal(research.chronologyEvidence.length,1,'May 28 chronology record missing');
assert.equal(research.chronologyEvidence[0].title,'Soaring Through The Clouds','May 28 chronology title drift');
assert.equal(research.chronologyEvidence[0].videoId,null,'May 28 ID must stay explicit recovery debt');
assert.equal(research.chronologyEvidence[0].recommendationCount,0,'May 28 may not contribute inferred recommendations');
assert(!vault.videos.some(v => v.title === 'Soaring Through The Clouds'),'May 28 chronology-only record leaked into runtime videos');

const named = new Map(video.mods.map(mod => [mod.name,mod]));
for (const [name,id] of [
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
  const mod = named.get(name);
  assert(mod,`missing source mention ${name}`);
  assert.equal(mod.canonicalProjectId,id,`canonical identity mismatch for ${name}`);
}
for (const forbidden of ['ipla','item-highlighter-fabric','item-highlighter-forge','lukis-grand-capitals-datapack','nether-weather-datapack']) {
  assert(!vault.projects.some(project => project.id === forbidden),`successor/distribution duplicate leaked into registry: ${forbidden}`);
}

const ahsVideos = vault.videos.filter(v => v.creatorId === 'youtube:asianhalfsquat');
const ahsMods = ahsVideos.flatMap(v => v.mods);
const ahsLinked = ahsMods.filter(mod => mod.providerLinks.length > 0);
const report = {
  phase:'chunk-30-post-merge-diagnostic',
  stats:vault.stats,
  unresolved:vault.projects.filter(project => !project.providerLinks.length).map(project => project.name).sort(),
  asianHalfSquat:{videos:ahsVideos.length,mentions:ahsMods.length,linkedMentions:ahsLinked.length,canonicalProjects:new Set(ahsMods.map(mod => mod.canonicalProjectId)).size,linkedCanonicalProjects:new Set(ahsLinked.map(mod => mod.canonicalProjectId)).size},
  chunk30:{video:{id:video.id,title:video.title,publishedAt:video.publishedAt,mentions:video.mods.length,canonicalProjects:new Set(video.mods.map(mod => mod.canonicalProjectId)).size,nullTimestamps:video.mods.filter(mod => mod.timestampSeconds == null).length},chronologyOnly:research.chronologyEvidence[0],mentions:video.mods.length,canonicalProjects:new Set(video.mods.map(mod => mod.canonicalProjectId)).size,mappings:video.mods.map(mod => ({name:mod.name,canonicalProjectId:mod.canonicalProjectId,canonicalName:mod.canonicalName,timestampSeconds:mod.timestampSeconds,providers:[...new Set(mod.providerLinks.map(link => link.provider))].sort(),providerLinks:mod.providerLinks.map(link => link.url)}))}
};
console.log(JSON.stringify(report,null,2));
assert.deepStrictEqual(report.unresolved,['Better Book Recipe','Plank and Junk'],'global unresolved identity set drift');
if (vault.diagnostics.some(item => item.level === 'error')) process.exitCode = 2;
