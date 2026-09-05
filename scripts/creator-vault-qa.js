'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');
const { renderCatalog } = require('../src/catalog-renderer');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'catalog', 'creator-vault', 'recommendation-sources', 'asianhalfsquat.history-batch21.json');
const providerPath = path.join(root, 'catalog', 'creator-vault', 'project-sources', 'provider-closure-21a-asianhalfsquat.json');
const chunk21Paths = [sourcePath, providerPath];
const creatorsPath = path.join(root, 'catalog', 'creator-vault', 'creators.json');
const chunk20CreatorsBaselinePath = path.join(root, 'catalog', 'creator-vault', 'research', 'creators.chunk20-baseline.json');

// Freeze every older acceptance checkpoint: hide only chunk 21, swap only the
// chunk-20 creator ledger, run the exact frozen chunk-20 wrapper, then restore.
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-ahs21-qa-'));
const moved = [];
let currentCreatorsBackup = null;
try {
  for (const file of chunk21Paths) {
    assert(fs.existsSync(file), `AsianHalfSquat chunk 21 production file missing: ${path.relative(root, file)}`);
    const target = path.join(tempDir, path.basename(file));
    fs.renameSync(file, target);
    moved.push([file, target]);
  }
  assert(fs.existsSync(creatorsPath), 'current creators ledger must exist');
  assert(fs.existsSync(chunk20CreatorsBaselinePath), 'chunk 20 creators baseline must exist');
  currentCreatorsBackup = path.join(tempDir, 'creators.current.json');
  fs.renameSync(creatorsPath, currentCreatorsBackup);
  fs.copyFileSync(chunk20CreatorsBaselinePath, creatorsPath);
  const legacy = spawnSync(process.execPath, [path.join(__dirname, 'creator-vault-qa-chunk20.js')], { cwd: root, stdio: 'inherit' });
  assert.equal(legacy.status, 0, 'chunk 20 baseline regression suite must remain green byte-for-byte');
} finally {
  if (currentCreatorsBackup && fs.existsSync(currentCreatorsBackup)) {
    if (fs.existsSync(creatorsPath)) fs.rmSync(creatorsPath, { force: true });
    fs.renameSync(currentCreatorsBackup, creatorsPath);
  }
  for (const [file, target] of moved.reverse()) if (fs.existsSync(target)) fs.renameSync(target, file);
  fs.rmSync(tempDir, { recursive: true, force: true });
}

const vault = loadCreatorVault(root);
assert.equal(vault.schemaVersion, 1);
assert.equal(vault.videos.length, 48, '3 Kreksu + 39 AsianHalfSquat + 6 EnderVerse videos');
assert.equal(vault.stats.recommendations, 750, '739 prior mentions + 11 AsianHalfSquat history batch 21 mentions');
assert.equal(vault.stats.uniqueProjects, 554);
assert.equal(vault.projects.reduce((sum, project) => sum + project.mentionCount, 0), 750, 'every source mention survives canonicalization');
assert.equal(vault.stats.verifiedProjects, 552);
assert.equal(vault.stats.unresolvedProjects, 2);
assert.equal(vault.stats.multiProviderProjects, 372);
assert.equal(vault.stats.providerDestinations, 1022);
assert.equal(vault.stats.nativeRecommendationSources, 17);
assert.deepEqual(vault.projects.filter(project => !project.providerLinks.length).map(project => project.name).sort(), ['Better Book Recipe', 'Plank and Junk']);
assert.equal(vault.diagnostics.filter(item => item.level === 'error').length, 0);

const ahs = vault.creators.find(creator => creator.id === 'youtube:asianhalfsquat');
assert(ahs);
assert.equal(ahs.coverage.expectedVideos, 350);
assert.equal(ahs.coverage.indexedVideos, 39);
assert.equal(ahs.coverage.recommendationCount, 491);
assert.equal(ahs.coverage.verifiedProjectHomes, 491);
const ahsVideos = vault.videos.filter(video => video.creatorId === ahs.id);
const ahsMods = ahsVideos.flatMap(video => video.mods);
assert.equal(ahsVideos.length, 39);
assert.equal(ahsMods.length, 491);
const ahsLinkedMentions = ahsMods.filter(mod => mod.providerLinks.length > 0).length;
const ahsLinkedCanonical = new Set(ahsMods.filter(mod => mod.providerLinks.length > 0).map(mod => mod.canonicalProjectId)).size;
assert.equal(ahsLinkedMentions, 491);
assert.equal(ahsLinkedCanonical, 327);

const clouds = ahsVideos.find(video => video.id === 'youtube:7Yr4KIjdWcE');
const photonics = ahsVideos.find(video => video.id === 'youtube:rYXEREsiGrE');
assert(clouds && photonics, 'both chunk 21 videos must load');
assert.deepEqual([clouds.publishedAt, photonics.publishedAt], ['2024-11-26', '2024-10-26']);
assert.deepEqual([clouds.mods.length, photonics.mods.length], [2, 9]);
const freshMods = [...clouds.mods, ...photonics.mods];
assert.equal(freshMods.length, 11);
assert.equal(new Set(freshMods.map(mod => mod.canonicalProjectId)).size, 10, 'Distant Horizons is intentionally mentioned in both chunk-21 videos');
for (const mod of freshMods) {
  assert(mod.name && mod.canonicalProjectId, `canonical project required: ${mod.name}`);
  assert(mod.providerLinks.length > 0, `verified direct project home required: ${mod.name}`);
  assert.equal(mod.timestampSeconds, null, `chunk 21 timestamp must remain absent: ${mod.name}`);
  const sourceVideo = clouds.mods.includes(mod) ? clouds : photonics;
  assert.equal(mod.videoLink, sourceVideo.url, `untimestamped mention must use base video URL: ${mod.name}`);
  assert(!mod.videoLink.includes('t=0s'), `must never fabricate zero timestamp: ${mod.name}`);
}

const mappingRows = new Map(freshMods.map(mod => [`${mod.name}|${mod.videoId || mod.videoLink}`, mod.canonicalProjectId]));
const canonicalInVideo = (video, name) => {
  const mod = video.mods.find(item => item.name === name);
  assert(mod, `source mention missing ${name} in ${video.id}`);
  return mod.canonicalProjectId;
};
assert.equal(canonicalInVideo(clouds, 'Distant Horizons'), 'distant-horizons');
assert.equal(canonicalInVideo(clouds, 'Shoulder Surfing Reloaded'), 'shoulder-surfing-reloaded');
assert.equal(canonicalInVideo(photonics, 'Photonics'), 'photonics');
assert.equal(canonicalInVideo(photonics, 'Sodium'), 'sodium');
assert.equal(canonicalInVideo(photonics, 'Iris'), 'iris');
assert.equal(canonicalInVideo(photonics, 'BSL 8.2.09'), 'bsl-shaders');
assert.equal(canonicalInVideo(photonics, 'Chisels & Bits'), 'chisels-and-bits');
assert.equal(canonicalInVideo(photonics, 'NostalgiaVX'), 'nostalgiavx');
assert.equal(canonicalInVideo(photonics, 'Alacrity'), 'alacrity');
assert.equal(canonicalInVideo(photonics, 'Terralith'), 'terralith');
assert.equal(canonicalInVideo(photonics, 'Distant Horizons'), 'distant-horizons');

const project = id => {
  const hit = vault.projects.find(item => item.id === id);
  assert(hit, `canonical project missing: ${id}`);
  return hit;
};
const links = id => project(id).providerLinks;
const providers = id => [...new Set(links(id).map(link => link.provider))].sort();
const hasUrl = (id, url) => links(id).some(link => link.url === url);
const expectProviders = (id, expected) => assert.deepEqual(providers(id), [...expected].sort(), `provider family: ${id}`);
expectProviders('distant-horizons',['CurseForge','Modrinth','Official']);
expectProviders('shoulder-surfing-reloaded',['CurseForge','GitHub','Modrinth']);
expectProviders('photonics',['Modrinth']);
expectProviders('sodium',['CurseForge','GitHub','Modrinth']);
expectProviders('iris',['CurseForge','GitHub','Modrinth']);
expectProviders('bsl-shaders',['CurseForge','Modrinth','Official']);
expectProviders('chisels-and-bits',['CurseForge','GitHub']);
expectProviders('nostalgiavx',['Official']);
expectProviders('alacrity',['CurseForge','Modrinth']);
expectProviders('terralith',['CurseForge','Modrinth']);
assert(hasUrl('photonics','https://modrinth.com/mod/photonics'));
assert(hasUrl('nostalgiavx','https://rre36.com/nostalgiavx'));
assert(hasUrl('alacrity','https://modrinth.com/resourcepack/alacrity'));
assert(hasUrl('alacrity','https://www.curseforge.com/minecraft/texture-packs/alacrity-resource-pack'));
assert(hasUrl('sodium','https://www.curseforge.com/minecraft/mc-mods/sodium'));
assert(hasUrl('sodium','https://github.com/CaffeineMC/sodium'));
assert(hasUrl('chisels-and-bits','https://github.com/ChiselsAndBits/Chisels-and-Bits'));
assert(hasUrl('shoulder-surfing-reloaded','https://github.com/Exopandora/ShoulderSurfing'));
assert(project('bsl-shaders').aliases.includes('BSL 8.2.09'), 'creator version label BSL 8.2.09 must remain searchable as a BSL Shaders alias');
assert.equal(project('photonics').providerLinks.length, 1, 'Photonics must remain Modrinth-only until another exact home is proven');
assert.equal(project('nostalgiavx').providerLinks.length, 1, 'NostalgiaVX must remain on the exact creator-owned project page only');

const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const rawClouds = raw.videos.find(video => video.id === 'youtube:7Yr4KIjdWcE');
const rawPhotonics = raw.videos.find(video => video.id === 'youtube:rYXEREsiGrE');
assert(rawClouds && rawPhotonics);
assert.equal(rawClouds.mods.length, 2);
assert.equal(rawPhotonics.mods.length, 9);
for (const video of [rawClouds, rawPhotonics]) {
  for (const mod of video.mods) assert(!Object.prototype.hasOwnProperty.call(mod, 'timestampSeconds'), `raw chunk-21 timestamp must stay omitted: ${mod.name}`);
}
assert.equal(rawClouds.relatedLinkedEvidence.length, 1);
assert.equal(rawClouds.relatedLinkedEvidence[0].sourceLabel, 'Featured cloud/weather project');
assert.equal(rawClouds.relatedLinkedEvidence[0].status, 'identity-pending');
assert(!vault.projects.some(item => item.name === 'Featured cloud/weather project'), 'hidden cloud/weather creator link must not become a guessed canonical project');

const providerRaw = JSON.parse(fs.readFileSync(providerPath, 'utf8'));
assert.equal(providerRaw.entries.length, 7);
const overlayIds = new Set(providerRaw.entries.map(entry => entry[0]));
assert.deepEqual([...overlayIds].sort(), ['alacrity','bsl-shaders','chisels-and-bits','nostalgiavx','photonics','shoulder-surfing-reloaded','sodium'].sort());
const bslOverlay = providerRaw.entries.find(entry => entry[0] === 'bsl-shaders');
assert(bslOverlay && bslOverlay[3].includes('BSL 8.2.09') && bslOverlay[4].length === 0, 'BSL version label must be alias-only');
const chiselsOverlay = providerRaw.entries.find(entry => entry[0] === 'chisels-and-bits');
assert(chiselsOverlay && chiselsOverlay[4].some(link => link[1] === 'https://github.com/ChiselsAndBits/Chisels-and-Bits'), 'Chisels & Bits overlay must target the live canonical id');

const rendered = renderCatalog({ id:'creator-vault-qa-ahs21', name:'Creator Vault QA AsianHalfSquat 21', items:[], assets:{}, documents:[], sources:[] }, root);
for (const needle of [
  'youtube:7Yr4KIjdWcE','Distant Horizons','Shoulder Surfing Reloaded',
  'youtube:rYXEREsiGrE','Photonics','BSL 8.2.09','Chisels & Bits','NostalgiaVX','Alacrity','Terralith',
  'https://modrinth.com/mod/photonics','https://rre36.com/nostalgiavx','https://github.com/ChiselsAndBits/Chisels-and-Bits','Find in Enderloom'
]) assert(rendered.html.includes(needle), `rendered AsianHalfSquat chunk 21 output missing ${needle}`);

console.log(`Creator Vault AsianHalfSquat chunk 21 QA passed: ${vault.stats.recommendations} mentions -> ${vault.stats.uniqueProjects} canonical projects; ${vault.stats.verifiedProjects} linked / ${vault.stats.providerDestinations} destinations / ${vault.stats.multiProviderProjects} multi-provider / ${vault.stats.unresolvedProjects} unresolved. AHS linked mentions=${ahsLinkedMentions}/491 across ${ahsLinkedCanonical} canonical projects; all 11 null timestamps, BSL version aliasing, hidden-cloud identity isolation, and bounded provider enrichments are locked.`);
