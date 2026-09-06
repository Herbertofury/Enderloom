'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root,'catalog','creator-vault','recommendation-sources','asianhalfsquat.history-batch31.json');
const researchPath = path.join(root,'catalog','creator-vault','research','asianhalfsquat.chunk31-source.json');
const providerResearchPath = path.join(root,'catalog','creator-vault','research','asianhalfsquat.chunk31-provider-candidates.json');
const priorDiagnosticPath = path.join(__dirname,'creator-vault-ahs30-postmerge-diagnostic.js');
for (const file of [sourcePath,researchPath,providerResearchPath,priorDiagnosticPath]) assert(fs.existsSync(file),`required diagnostic file missing: ${file}`);

const forbiddenClosure = path.join(root,'catalog','creator-vault','project-sources','provider-closure-31a-asianhalfsquat.json');
assert(!fs.existsSync(forbiddenClosure),'Chunk 31 must not create a redundant provider closure for already-canonical projects');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-ahs31-diagnostic-'));
const sourceBackup = path.join(tempDir,path.basename(sourcePath));
try {
  fs.renameSync(sourcePath,sourceBackup);
  const baseline = loadCreatorVault(root);
  assert.equal(baseline.stats.recommendations,987,'frozen chunk 30 recommendations');
  assert.equal(baseline.stats.uniqueProjects,672,'frozen chunk 30 canonical projects');
  const prior = spawnSync(process.execPath,[priorDiagnosticPath],{cwd:root,stdio:'inherit'});
  assert.equal(prior.status,0,'exact chunk 30 recursive/post-merge acceptance must stay green with chunk 31 hidden');
} finally {
  if (fs.existsSync(sourceBackup)) fs.renameSync(sourceBackup,sourcePath);
  fs.rmSync(tempDir,{recursive:true,force:true});
}

const research = require(researchPath);
const providerResearch = require(providerResearchPath);
const vault = loadCreatorVault(root);
const video = vault.videos.find(v => v.id === 'youtube:7NruFXLqOi8');
assert(video,'chunk 31 March 5 source video missing');
assert.equal(video.title,'Minecraft Has Never Looked This Good','March 5 title drift');
assert.equal(video.publishedAt,'2024-03-05','March 5 date drift');
assert.equal(video.mods.length,9,'March 5 mention count drift');
assert(video.mods.every(mod => mod.providerLinks.length > 0),'March 5 contains providerless mention');
assert(video.mods.every(mod => mod.timestampSeconds == null),'March 5 untimestamped source gained a fabricated timestamp');
assert.equal(research.sourceMentions,9,'Chunk 31 frozen research count drift');
assert.equal(research.videos.length,1,'Chunk 31 research video count drift');
assert.equal(providerResearch.expected.existingCandidateFamilies,4,'Chunk 31 corrected existing-family count drift');
assert.equal(providerResearch.expected.newCandidateFamilies,0,'Chunk 31 must add zero canonical families');

const expectedNames = ['Distant Horizons','Iris','Sodium','C2ME','Bliss Shaders','Tectonic','Terra','Terralith','Exposure'];
assert.deepStrictEqual(video.mods.map(mod => mod.name),expectedNames,'March 5 creator list drift');
const named = new Map(video.mods.map(mod => [mod.name,mod]));
for (const [name,id] of [
  ['Distant Horizons','distant-horizons'],
  ['Iris','iris'],
  ['Sodium','sodium'],
  ['C2ME','c2me'],
  ['Bliss Shaders','bliss-shaders'],
  ['Tectonic','tectonic'],
  ['Terra','terra'],
  ['Terralith','terralith'],
  ['Exposure','exposure']
]) {
  const mod = named.get(name);
  assert(mod,`missing source mention ${name}`);
  assert.equal(mod.canonicalProjectId,id,`canonical identity mismatch for ${name}`);
}

assert.equal(vault.stats.recommendations,996,'Chunk 31 recommendation total drift');
assert.equal(vault.stats.uniqueProjects,672,'Chunk 31 must not add canonical projects');
const unresolved = vault.projects.filter(project => !project.providerLinks.length).map(project => project.name).sort();
assert.deepStrictEqual(unresolved,['Better Book Recipe','Plank and Junk'],'global unresolved identity set drift');
const ahsVideos = vault.videos.filter(v => v.creatorId === 'youtube:asianhalfsquat');
const ahsMods = ahsVideos.flatMap(v => v.mods);
const ahsLinked = ahsMods.filter(mod => mod.providerLinks.length > 0);
assert.equal(ahsVideos.length,52,'AHS recommendation-bearing video count drift');
assert.equal(ahsMods.length,737,'AHS mention count drift');
assert.equal(ahsLinked.length,737,'AHS linked mention count drift');
const report = {
  phase:'chunk-31-post-merge-diagnostic',
  stats:vault.stats,
  unresolved,
  asianHalfSquat:{videos:ahsVideos.length,mentions:ahsMods.length,linkedMentions:ahsLinked.length,canonicalProjects:new Set(ahsMods.map(mod => mod.canonicalProjectId)).size,linkedCanonicalProjects:new Set(ahsLinked.map(mod => mod.canonicalProjectId)).size},
  chunk31:{video:{id:video.id,title:video.title,publishedAt:video.publishedAt,mentions:video.mods.length,canonicalProjects:new Set(video.mods.map(mod => mod.canonicalProjectId)).size,nullTimestamps:video.mods.filter(mod => mod.timestampSeconds == null).length},reuse:9,newCanonicalProjects:0,mappings:video.mods.map(mod => ({name:mod.name,canonicalProjectId:mod.canonicalProjectId,canonicalName:mod.canonicalName,providers:[...new Set(mod.providerLinks.map(link => link.provider))].sort(),providerLinks:mod.providerLinks.map(link => link.url)}))}
};
console.log(JSON.stringify(report,null,2));
if (vault.diagnostics.some(item => item.level === 'error')) process.exitCode = 2;
