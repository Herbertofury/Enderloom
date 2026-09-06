'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'catalog', 'creator-vault', 'recommendation-sources', 'asianhalfsquat.history-batch28.json');
const closurePath = path.join(root, 'catalog', 'creator-vault', 'project-sources', 'provider-closure-28a-asianhalfsquat.json');
const candidatesPath = path.join(root, 'catalog', 'creator-vault', 'research', 'asianhalfsquat.chunk28-provider-candidates.json');
const creatorsPath = path.join(root, 'catalog', 'creator-vault', 'creators.json');
const baselineCreatorsPath = path.join(root, 'catalog', 'creator-vault', 'research', 'creators.chunk27-baseline.json');
const frozenQaPath = path.join(__dirname, 'creator-vault-qa-chunk27.js');

for (const target of [sourcePath, closurePath, candidatesPath, creatorsPath, baselineCreatorsPath, frozenQaPath]) {
  assert(fs.existsSync(target), `required Chunk 28 acceptance input missing: ${target}`);
}

const source = require(sourcePath);
const closure = require(closurePath);
const candidates = require(candidatesPath);
const currentCreators = require(creatorsPath);
const baselineCreators = require(baselineCreatorsPath);

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-ahs28-qa-'));
const sourceBackup = path.join(tempDir, path.basename(sourcePath));
const closureBackup = path.join(tempDir, path.basename(closurePath));
const creatorsBackup = path.join(tempDir, 'creators.current.json');
let baselineVault;
try {
  fs.renameSync(sourcePath, sourceBackup);
  fs.renameSync(closurePath, closureBackup);
  fs.copyFileSync(creatorsPath, creatorsBackup);
  fs.copyFileSync(baselineCreatorsPath, creatorsPath);

  baselineVault = loadCreatorVault(root);
  assert.equal(baselineVault.stats.recommendations, 833, 'frozen Chunk 27 recommendation baseline drift');
  assert.equal(baselineVault.stats.uniqueProjects, 600, 'frozen Chunk 27 canonical-project baseline drift');
  assert.equal(baselineVault.videos.filter(video => video.creatorId === 'youtube:asianhalfsquat').length, 45, 'frozen Chunk 27 AHS video baseline drift');

  const frozen = spawnSync(process.execPath, [frozenQaPath], { cwd: root, stdio: 'inherit' });
  assert.equal(frozen.status, 0, 'frozen Chunk 27 recursive acceptance failed with Chunk 28 hidden');
} finally {
  if (fs.existsSync(creatorsBackup)) fs.copyFileSync(creatorsBackup, creatorsPath);
  if (fs.existsSync(closureBackup)) fs.renameSync(closureBackup, closurePath);
  if (fs.existsSync(sourceBackup)) fs.renameSync(sourceBackup, sourcePath);
  fs.rmSync(tempDir, { recursive: true, force: true });
}

const vault = loadCreatorVault(root);
const expectedStats = {
  creators: 14,
  indexedCreators: 3,
  videos: 57,
  recommendations: 934,
  uniqueProjects: 650,
  verifiedProjects: 648,
  unresolvedProjects: 2,
  multiProviderProjects: 428,
  providerDestinations: 1203,
  verifiedHomes: 648,
  importedCatalogs: 1,
  nativeRecommendationSources: 24,
  setupPacks: 5
};
for (const [field, value] of Object.entries(expectedStats)) {
  assert.equal(vault.stats[field], value, `Chunk 28 runtime stat drift: ${field}`);
}

const unresolved = vault.projects.filter(project => !project.providerLinks.length).map(project => project.name).sort();
assert.deepEqual(unresolved, ['Better Book Recipe', 'Plank and Junk'], 'Chunk 28 unresolved set drift');

const ahsCreator = currentCreators.creators.find(creator => creator.id === 'youtube:asianhalfsquat');
assert(ahsCreator, 'AsianHalfSquat creator ledger missing');
assert.equal(ahsCreator.coverage.indexedVideos, 48, 'AHS creator ledger indexedVideos drift');
assert.equal(ahsCreator.coverage.recommendationCount, 675, 'AHS creator ledger recommendationCount drift');
assert.equal(ahsCreator.coverage.verifiedProjectHomes, 675, 'AHS creator ledger verifiedProjectHomes drift');

const expectedVideos = [
  ['youtube:IL804sqMbbE', 'Turning Minecraft Into Elden Ring With Mods 2.0', '2024-08-03', 43, [117, 320, 454, 528, 788]],
  ['youtube:o499NnspGIM', 'Minecraft Mod Combinations That Work Perfectly Together #7', '2024-07-09', 26, [32, 85, 130, 176, 244, 297, 334, 376, 418, 490]],
  ['youtube:94j9prLG-Sc', 'I Made Minecraft As Immersive As Possible Using Mods', '2024-06-15', 32, [null, 39, 267, 360, 462, 523]]
];
const chunkVideos = [];
for (const [id, title, publishedAt, count, legalTimes] of expectedVideos) {
  const video = vault.videos.find(item => item.id === id);
  assert(video, `Chunk 28 video missing: ${id}`);
  assert.equal(video.title, title, `${id} title drift`);
  assert.equal(video.publishedAt, publishedAt, `${id} publishedAt drift`);
  assert.equal(video.mods.length, count, `${id} mention count drift`);
  assert(video.mods.every(mod => mod.providerLinks.length > 0), `${id} contains providerless recommendation`);
  const allowed = new Set(legalTimes);
  assert(video.mods.every(mod => allowed.has(mod.timestampSeconds)), `${id} contains invented/non-creator timestamp`);
  chunkVideos.push(video);
}

const chunkMods = chunkVideos.flatMap(video => video.mods);
assert.equal(chunkMods.length, 101, 'Chunk 28 total mention count drift');
assert.equal(new Set(chunkMods.map(mod => mod.canonicalProjectId)).size, 93, 'Chunk 28 canonical-project count drift');
assert.equal(chunkMods.filter(mod => mod.providerLinks.length > 0).length, 101, 'Chunk 28 linked mention count drift');
const nullTimestampNames = chunkMods.filter(mod => mod.timestampSeconds == null).map(mod => mod.name).sort();
assert.deepEqual(nullTimestampNames, ['Iris', 'Sodium'], 'only Sodium and Iris may remain untimestamped');

const bySourceName = new Map();
for (const mod of chunkMods) {
  if (!bySourceName.has(mod.name)) bySourceName.set(mod.name, []);
  bySourceName.get(mod.name).push(mod);
}
for (const [sourceName, canonicalId] of [
  ['Fabric Sky Boxes', 'nuit'],
  ['FabricSkyBoxes', 'nuit'],
  ['Fabric SkyBoxes Interop', 'nuit-interop'],
  ['FabricSkyBoxes Interop', 'nuit-interop'],
  ['Farmers Delight', 'farmers-delight'],
  ['Terralith', 'terralith'],
  ['Extended Lantern', 'extended-illumina'],
  ['Entity Texture Features', 'entity-texture-features'],
  ['Conquest', 'conquest'],
  ['FastMove', 'fastmove'],
  ['Profundis', 'profundis'],
  ['Spice of Life Valheim Edition', 'spice-of-life-valheim-edition']
]) {
  const matches = bySourceName.get(sourceName) || [];
  assert(matches.length > 0, `required source label missing: ${sourceName}`);
  assert(matches.every(mod => mod.canonicalProjectId === canonicalId), `canonical identity drift for ${sourceName}`);
}

for (const forbiddenId of ['fabric-sky-boxes', 'fabricskyboxes', 'fabric-skyboxes-interop', 'fabricskyboxes-interop']) {
  assert(!vault.projects.some(project => project.id === forbiddenId), `historical FabricSkyBoxes alias leaked duplicate card: ${forbiddenId}`);
}

const providerMap = closure.providers || {};
assert.equal((closure.entries || []).length, 52, 'Chunk 28 provider closure card count drift');
assert.equal((candidates.entries || []).length, 52, 'Chunk 28 provider candidate card count drift');
assert.equal(candidates.expected.newCandidateFamilies, 50, 'Chunk 28 declared new-family count drift');
const destinationCount = (closure.entries || []).reduce((sum, entry) => sum + ((entry[4] || []).length), 0);
assert.equal(destinationCount, 66, 'Chunk 28 provider destination count drift');

const baselineIds = new Set(baselineVault.projects.map(project => project.id));
const closureIds = (closure.entries || []).map(entry => entry[0]);
const existingClosureIds = closureIds.filter(id => baselineIds.has(id)).sort();
assert.deepEqual(existingClosureIds, ['farmers-delight', 'terralith'], 'Chunk 28 existing-card enrichment set drift');
assert.equal(closureIds.filter(id => !baselineIds.has(id)).length, 50, 'Chunk 28 new canonical identity count drift');

const normalizeUrl = value => String(value || '').trim().replace(/\/$/, '').toLowerCase();
for (const entry of closure.entries || []) {
  const [id, , , , links] = entry;
  const project = vault.projects.find(item => item.id === id);
  assert(project, `Chunk 28 closure project missing from runtime: ${id}`);
  assert((links || []).length > 0, `Chunk 28 providerless closure entry: ${id}`);
  for (const link of links || []) {
    const provider = providerMap[link[0]] || link[0];
    const url = link[1];
    assert(project.providerLinks.some(item => item.provider === provider && normalizeUrl(item.url) === normalizeUrl(url)), `missing exact provider destination for ${id}: ${url}`);
    const owners = vault.projects.filter(item => (item.providerLinks || []).some(itemLink => normalizeUrl(itemLink.url) === normalizeUrl(url))).map(item => item.id);
    assert.deepEqual(owners, [id], `incoming Chunk 28 URL collision: ${url}`);
  }
}

assert.equal(source.videos.length, 3, 'Chunk 28 source must remain exactly three videos');
assert.equal(source.videos.reduce((sum, video) => sum + video.mods.length, 0), 101, 'Chunk 28 source recommendation count drift');
const august = source.videos.find(video => video.id === 'youtube:IL804sqMbbE');
for (const removed of ['Campfire Spawn and Tweaks', 'Estus', 'Immersive FX', 'Optifine', 'Vanilla Vistas', 'Music Triggers', 'Mutant More']) {
  assert(!august.mods.some(mod => mod.name === removed), `removed prior-video project leaked into August recommendations: ${removed}`);
}
const june = source.videos.find(video => video.id === 'youtube:94j9prLG-Sc');
assert(!june.mods.some(mod => mod.name === "YUNG's Better Mods"), 'generic June YUNG creator profile must remain related evidence only');

const ahsVideos = vault.videos.filter(video => video.creatorId === 'youtube:asianhalfsquat');
const ahsMods = ahsVideos.flatMap(video => video.mods);
const ahsLinked = ahsMods.filter(mod => mod.providerLinks.length > 0);
assert.equal(ahsVideos.length, 48, 'AHS video count drift');
assert.equal(ahsMods.length, 675, 'AHS mention count drift');
assert.equal(ahsLinked.length, 675, 'AHS linked mention count drift');
assert.equal(new Set(ahsMods.map(mod => mod.canonicalProjectId)).size, 437, 'AHS canonical-project count drift');
assert.equal(new Set(ahsLinked.map(mod => mod.canonicalProjectId)).size, 437, 'AHS linked canonical-project count drift');

console.log('Creator Vault AsianHalfSquat chunk 28 QA passed: 934 mentions -> 650 canonical projects; 648 linked / 1203 destinations / 428 multi-provider / 2 unresolved. AHS linked mentions=675/675 across 437 canonical projects; three-video batch=101 mentions / 93 canonical projects / 50 new global identities, with exact null timestamps for Sodium + Iris and recursive chunk-27 baseline locked.');
