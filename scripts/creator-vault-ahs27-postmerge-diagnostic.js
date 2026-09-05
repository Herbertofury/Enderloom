'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root,'catalog','creator-vault','recommendation-sources','asianhalfsquat.history-batch27.json');
const providerPath = path.join(root,'catalog','creator-vault','project-sources','provider-closure-27a-asianhalfsquat.json');
const creatorsPath = path.join(root,'catalog','creator-vault','creators.json');
const baselineCreatorsPath = path.join(root,'catalog','creator-vault','research','creators.chunk26-baseline.json');
const frozenQaPath = path.join(__dirname,'creator-vault-qa-chunk26.js');

assert(fs.existsSync(sourcePath), 'chunk 27 production source must exist for diagnostic');
assert(fs.existsSync(providerPath), 'chunk 27 provider closure must exist for diagnostic');
assert(fs.existsSync(baselineCreatorsPath), 'frozen chunk 26 creator ledger missing');
assert(fs.existsSync(frozenQaPath), 'frozen chunk 26 QA missing');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-ahs27-diagnostic-'));
const sourceBackup = path.join(tempDir,path.basename(sourcePath));
const providerBackup = path.join(tempDir,path.basename(providerPath));
const creatorsBackup = path.join(tempDir,'creators.current.json');
try {
  fs.renameSync(sourcePath,sourceBackup);
  fs.renameSync(providerPath,providerBackup);
  fs.renameSync(creatorsPath,creatorsBackup);
  fs.copyFileSync(baselineCreatorsPath,creatorsPath);
  const baseline = loadCreatorVault(root);
  assert.equal(baseline.stats.recommendations,814,'frozen chunk 26 recommendations');
  assert.equal(baseline.stats.uniqueProjects,585,'frozen chunk 26 canonical projects');
  const legacy = spawnSync(process.execPath,[frozenQaPath],{cwd:root,stdio:'inherit'});
  assert.equal(legacy.status,0,'frozen chunk 26 recursive acceptance must stay green');
} finally {
  if (fs.existsSync(creatorsBackup)) {
    if (fs.existsSync(creatorsPath)) fs.rmSync(creatorsPath,{force:true});
    fs.renameSync(creatorsBackup,creatorsPath);
  }
  if (fs.existsSync(providerBackup)) fs.renameSync(providerBackup,providerPath);
  if (fs.existsSync(sourceBackup)) fs.renameSync(sourceBackup,sourcePath);
  fs.rmSync(tempDir,{recursive:true,force:true});
}

const vault = loadCreatorVault(root);
const video = vault.videos.find(v => v.id === 'youtube:4QMpIDcPaJI');
assert(video,'chunk 27 source video missing after restore');
assert.equal(video.title,'The Best Minecraft Mods That Completely Enhance Combat');
assert.equal(video.publishedAt,'2024-09-06');
assert.equal(video.mods.length,19);
assert(video.mods.every(mod => mod.providerLinks.length > 0),'every chunk 27 mention must resolve to a direct provider home');
assert(video.mods.every(mod => [113,267,458].includes(mod.timestampSeconds)),'only creator section timestamps are legal');
assert.equal(new Set(video.mods.map(mod => mod.canonicalProjectId)).size,19,'chunk 27 source mentions must resolve to 19 distinct canonical identities');
const expectedIds = new Map([
  ['Sword Parry','sword-parry'],
  ['Immersive Combat','immersive-combat'],
  ['ModularWarfare - Guns and More','modularwarfare'],
  ['Timeless and Classics Zero','timeless-and-classics-zero'],
  ['Blockfront','blockfront'],
  ['Arcanus Continuum','arcanus'],
  ['Mahau Tsukai','mahou-tsukai']
]);
for (const [name,id] of expectedIds) {
  const mod = video.mods.find(item => item.name === name);
  assert(mod,`missing source mention ${name}`);
  assert.equal(mod.canonicalProjectId,id,`canonical identity mismatch for ${name}`);
}
assert(!vault.projects.some(project => project.id === 'mahau-tsukai'),'creator typo must not create Mahau duplicate');
assert(!vault.projects.some(project => project.id === 'arcanus-continuum'),'historical Arcanus Continuum label must not create duplicate card');

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
  chunk27:{
    videoId:video.id,
    title:video.title,
    publishedAt:video.publishedAt,
    mentions:video.mods.length,
    mappings:video.mods.map(mod => ({name:mod.name,canonicalProjectId:mod.canonicalProjectId,canonicalName:mod.canonicalName,timestampSeconds:mod.timestampSeconds,providers:[...new Set(mod.providerLinks.map(link => link.provider))].sort(),providerLinks:mod.providerLinks.map(link => link.url)}))
  }
};
console.log(JSON.stringify(report,null,2));
if (vault.diagnostics.some(item => item.level === 'error')) process.exitCode = 2;
