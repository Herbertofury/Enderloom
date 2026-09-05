'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');
const { renderCatalog } = require('../src/catalog-renderer');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'catalog', 'creator-vault', 'recommendation-sources', 'asianhalfsquat.history-batch24.json');
const creatorsPath = path.join(root, 'catalog', 'creator-vault', 'creators.json');
const chunk23CreatorsBaselinePath = path.join(root, 'catalog', 'creator-vault', 'research', 'creators.chunk23-baseline.json');
const candidatesPath = path.join(root, 'catalog', 'creator-vault', 'research', 'asianhalfsquat.chunk24-provider-candidates.json');
const forbiddenProviderPath = path.join(root, 'catalog', 'creator-vault', 'project-sources', 'provider-closure-24a-asianhalfsquat.json');

// Prove chunk 23 byte-for-byte first. Chunk 24 intentionally has only one
// production source file and NO provider overlay. Hide only that source,
// swap only the chunk-23 creator ledger, run the frozen chunk-23 wrapper,
// then restore the current state before enforcing chunk 24.
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-ahs24-qa-'));
let sourceBackup = null;
let currentCreatorsBackup = null;
try {
  assert(fs.existsSync(sourcePath), 'AsianHalfSquat chunk 24 production source file missing');
  assert(!fs.existsSync(forbiddenProviderPath), 'chunk 24 must not invent a provider overlay');
  assert(fs.existsSync(creatorsPath), 'current creators ledger must exist');
  assert(fs.existsSync(chunk23CreatorsBaselinePath), 'chunk 23 creators baseline must exist');
  sourceBackup = path.join(tempDir, path.basename(sourcePath));
  fs.renameSync(sourcePath, sourceBackup);
  currentCreatorsBackup = path.join(tempDir, 'creators.current.json');
  fs.renameSync(creatorsPath, currentCreatorsBackup);
  fs.copyFileSync(chunk23CreatorsBaselinePath, creatorsPath);
  const legacy = spawnSync(process.execPath, [path.join(__dirname, 'creator-vault-qa-chunk23.js')], { cwd: root, stdio: 'inherit' });
  assert.equal(legacy.status, 0, 'chunk 23 baseline regression suite must remain green byte-for-byte');
} finally {
  if (currentCreatorsBackup && fs.existsSync(currentCreatorsBackup)) {
    if (fs.existsSync(creatorsPath)) fs.rmSync(creatorsPath, { force: true });
    fs.renameSync(currentCreatorsBackup, creatorsPath);
  }
  if (sourceBackup && fs.existsSync(sourceBackup)) fs.renameSync(sourceBackup, sourcePath);
  fs.rmSync(tempDir, { recursive: true, force: true });
}

const vault = loadCreatorVault(root);
assert.equal(vault.schemaVersion, 1);
assert.equal(vault.videos.length, 51, '3 Kreksu + 42 AsianHalfSquat + 6 EnderVerse videos');
assert.equal(vault.stats.recommendations, 794, '789 prior mentions + 5 AsianHalfSquat history batch 24 mentions');
assert.equal(vault.stats.uniqueProjects, 573, 'chunk 24 reuses five existing canonical identities');
assert.equal(vault.projects.reduce((sum, project) => sum + project.mentionCount, 0), 794, 'every source mention survives canonicalization');
assert.equal(vault.stats.verifiedProjects, 571);
assert.equal(vault.stats.unresolvedProjects, 2);
assert.equal(vault.stats.multiProviderProjects, 389);
assert.equal(vault.stats.providerDestinations, 1068);
assert.equal(vault.stats.nativeRecommendationSources, 20);
assert.deepEqual(vault.projects.filter(project => !project.providerLinks.length).map(project => project.name).sort(), ['Better Book Recipe', 'Plank and Junk']);
assert.equal(vault.diagnostics.filter(item => item.level === 'error').length, 0);
assert(!fs.existsSync(forbiddenProviderPath), 'no chunk-24 production provider overlay may exist');

const ahs = vault.creators.find(creator => creator.id === 'youtube:asianhalfsquat');
assert(ahs);
assert.equal(ahs.coverage.expectedVideos, 350);
assert.equal(ahs.coverage.indexedVideos, 42);
assert.equal(ahs.coverage.recommendationCount, 535);
assert.equal(ahs.coverage.verifiedProjectHomes, 535);
const ahsVideos = vault.videos.filter(video => video.creatorId === ahs.id);
const ahsMods = ahsVideos.flatMap(video => video.mods);
assert.equal(ahsVideos.length, 42);
assert.equal(ahsMods.length, 535);
const ahsLinkedMentions = ahsMods.filter(mod => mod.providerLinks.length > 0).length;
const ahsLinkedCanonical = new Set(ahsMods.filter(mod => mod.providerLinks.length > 0).map(mod => mod.canonicalProjectId)).size;
assert.equal(ahsLinkedMentions, 535);
assert.equal(ahsLinkedCanonical, 347);

const video = ahsVideos.find(item => item.id === 'youtube:0Qormp_C7mg');
assert(video, 'chunk 24 source video must load');
assert.equal(video.publishedAt, '2024-09-26');
assert.equal(video.title, 'This Unknown Minecraft Terrain Generation Mod Is Incredible');
assert.equal(video.mods.length, 5);
const expected = new Map([
  ['Big Globe','big-globe'],
  ['Distant Horizons','distant-horizons'],
  ['Bliss Shaders','bliss-shaders'],
  ['Complementary Shaders','complementary-shaders'],
  ['BSL Shaders','bsl-shaders']
]);
assert.equal(expected.size, 5);
for (const mod of video.mods) {
  const canonicalId = expected.get(mod.name);
  assert(canonicalId, `unexpected chunk-24 source label: ${mod.name}`);
  assert.equal(mod.canonicalProjectId, canonicalId, `canonical identity: ${mod.name}`);
  assert.equal(mod.timestampSeconds, null, `missing creator timestamp must stay null: ${mod.name}`);
  assert.equal(mod.videoLink, video.url, `missing creator timestamp must use base video URL: ${mod.name}`);
  assert(!mod.videoLink.includes('t=0s'), `must never fabricate t=0s: ${mod.name}`);
  assert(mod.providerLinks.length > 0, `existing verified direct project home required: ${mod.name}`);
}
assert.equal(new Set(video.mods.map(mod => mod.canonicalProjectId)).size, 5);

const project = id => {
  const hit = vault.projects.find(item => item.id === id);
  assert(hit, `canonical project missing: ${id}`);
  return hit;
};
const links = id => project(id).providerLinks;
const providers = id => [...new Set(links(id).map(link => link.provider))].sort();
const hasUrl = (id, url) => links(id).some(link => link.url === url);
assert.deepEqual(providers('big-globe'), ['GitHub','Modrinth']);
assert.deepEqual(providers('distant-horizons'), ['CurseForge','Modrinth','Official']);
assert.deepEqual(providers('bliss-shaders'), ['CurseForge','GitHub','Modrinth']);
assert.deepEqual(providers('complementary-shaders'), ['CurseForge','Modrinth']);
assert.deepEqual(providers('bsl-shaders'), ['CurseForge','Modrinth','Official']);
assert(hasUrl('big-globe','https://github.com/Builderb0y/BigGlobe'));
assert(hasUrl('big-globe','https://modrinth.com/mod/big-globe'));
assert(hasUrl('distant-horizons','https://gitlab.com/distant-horizons-team/distant-horizons'));
assert(hasUrl('bliss-shaders','https://github.com/X0nk/Bliss-Shader'));
assert(hasUrl('complementary-shaders','https://www.curseforge.com/minecraft/shaders/complementary-unbound'));
assert(hasUrl('bsl-shaders','https://capttatsu.com/bslshaders/'));

const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const rawVideo = raw.videos.find(item => item.id === 'youtube:0Qormp_C7mg');
assert(rawVideo && rawVideo.mods.length === 5);
assert.deepEqual(rawVideo.excludedEvidence.map(item => [item.sourceLabel,item.status]), [
  ['Full list of Distant Horizons compatible shaders!','reference-list-not-project'],
  ['Music - Timelapse, Escape','non-project']
]);
for (const mod of rawVideo.mods) assert(!Object.prototype.hasOwnProperty.call(mod, 'timestampSeconds'), `raw timestamp must be omitted when creator provides none: ${mod.name}`);

const candidates = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'));
assert.equal(candidates.entries.length, 0, 'zero-provider-mutation decision must stay empty');
assert.equal(candidates.settledExisting.length, 5);
assert.equal(candidates.canonicalProbe.matchedExisting, 5);
assert.equal(candidates.canonicalProbe.newCandidates, 0);
assert.deepEqual(candidates.settledExisting.map(item => item.id).sort(), ['big-globe','bliss-shaders','bsl-shaders','complementary-shaders','distant-horizons']);

const rendered = renderCatalog({ id:'creator-vault-qa-ahs24', name:'Creator Vault QA AsianHalfSquat 24', items:[], assets:{}, documents:[], sources:[] }, root);
for (const needle of [
  'youtube:0Qormp_C7mg','Big Globe','Distant Horizons','Bliss Shaders','Complementary Shaders','BSL Shaders',
  'https://github.com/Builderb0y/BigGlobe','https://gitlab.com/distant-horizons-team/distant-horizons','https://github.com/X0nk/Bliss-Shader','https://capttatsu.com/bslshaders/','Find in Enderloom'
]) assert(rendered.html.includes(needle), `rendered AsianHalfSquat chunk 24 output missing ${needle}`);

console.log(`Creator Vault AsianHalfSquat chunk 24 QA passed: ${vault.stats.recommendations} mentions -> ${vault.stats.uniqueProjects} canonical projects; ${vault.stats.verifiedProjects} linked / ${vault.stats.providerDestinations} destinations / ${vault.stats.multiProviderProjects} multi-provider / ${vault.stats.unresolvedProjects} unresolved. AHS linked mentions=${ahsLinkedMentions}/535 across ${ahsLinkedCanonical} canonical projects; all 5 null timestamps/base links, zero-provider-mutation reuse, reference-list/music exclusions, and recursive chunk-23 baseline are locked.`);
