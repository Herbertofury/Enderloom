'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');
const { renderCatalog } = require('../src/catalog-renderer');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'catalog', 'creator-vault', 'recommendation-sources', 'asianhalfsquat.history-batch25.json');
const providerPath = path.join(root, 'catalog', 'creator-vault', 'project-sources', 'provider-closure-25a-asianhalfsquat.json');
const creatorsPath = path.join(root, 'catalog', 'creator-vault', 'creators.json');
const chunk24CreatorsBaselinePath = path.join(root, 'catalog', 'creator-vault', 'research', 'creators.chunk24-baseline.json');
const candidatesPath = path.join(root, 'catalog', 'creator-vault', 'research', 'asianhalfsquat.chunk25-provider-candidates.json');

// Prove chunk 24 byte-for-byte first. Hide only chunk 25 production files,
// swap only the frozen creator ledger, execute the exact chunk-24 wrapper,
// and restore current state in finally before enforcing chunk 25.
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-ahs25-qa-'));
let sourceBackup = null;
let providerBackup = null;
let currentCreatorsBackup = null;
try {
  assert(fs.existsSync(sourcePath), 'AsianHalfSquat chunk 25 production source file missing');
  assert(fs.existsSync(providerPath), 'AsianHalfSquat chunk 25 provider overlay missing');
  assert(fs.existsSync(creatorsPath), 'current creators ledger must exist');
  assert(fs.existsSync(chunk24CreatorsBaselinePath), 'chunk 24 creators baseline must exist');
  sourceBackup = path.join(tempDir, path.basename(sourcePath));
  providerBackup = path.join(tempDir, path.basename(providerPath));
  currentCreatorsBackup = path.join(tempDir, 'creators.current.json');
  fs.renameSync(sourcePath, sourceBackup);
  fs.renameSync(providerPath, providerBackup);
  fs.renameSync(creatorsPath, currentCreatorsBackup);
  fs.copyFileSync(chunk24CreatorsBaselinePath, creatorsPath);
  const legacy = spawnSync(process.execPath, [path.join(__dirname, 'creator-vault-qa-chunk24.js')], { cwd: root, stdio: 'inherit' });
  assert.equal(legacy.status, 0, 'chunk 24 baseline regression suite must remain green byte-for-byte');
} finally {
  if (currentCreatorsBackup && fs.existsSync(currentCreatorsBackup)) {
    if (fs.existsSync(creatorsPath)) fs.rmSync(creatorsPath, { force: true });
    fs.renameSync(currentCreatorsBackup, creatorsPath);
  }
  if (providerBackup && fs.existsSync(providerBackup)) fs.renameSync(providerBackup, providerPath);
  if (sourceBackup && fs.existsSync(sourceBackup)) fs.renameSync(sourceBackup, sourcePath);
  fs.rmSync(tempDir, { recursive: true, force: true });
}

const vault = loadCreatorVault(root);
assert.equal(vault.schemaVersion, 1);
assert.equal(vault.videos.length, 52, '3 Kreksu + 43 AsianHalfSquat + 6 EnderVerse videos');
assert.equal(vault.stats.recommendations, 804, '794 prior mentions + 10 AsianHalfSquat history batch 25 mentions');
assert.equal(vault.stats.uniqueProjects, 580, 'chunk 25 adds exactly seven globally new canonical projects');
assert.equal(vault.projects.reduce((sum, project) => sum + project.mentionCount, 0), 804, 'every source mention survives canonicalization');
assert.equal(vault.stats.verifiedProjects, 578);
assert.equal(vault.stats.unresolvedProjects, 2);
assert.equal(vault.stats.multiProviderProjects, 394);
assert.equal(vault.stats.providerDestinations, 1082);
assert.equal(vault.stats.nativeRecommendationSources, 21);
assert.deepEqual(vault.projects.filter(project => !project.providerLinks.length).map(project => project.name).sort(), ['Better Book Recipe', 'Plank and Junk']);
assert.equal(vault.diagnostics.filter(item => item.level === 'error').length, 0);

const ahs = vault.creators.find(creator => creator.id === 'youtube:asianhalfsquat');
assert(ahs);
assert.equal(ahs.coverage.expectedVideos, 350);
assert.equal(ahs.coverage.indexedVideos, 43);
assert.equal(ahs.coverage.recommendationCount, 545);
assert.equal(ahs.coverage.verifiedProjectHomes, 545);
const ahsVideos = vault.videos.filter(video => video.creatorId === ahs.id);
const ahsMods = ahsVideos.flatMap(video => video.mods);
assert.equal(ahsVideos.length, 43);
assert.equal(ahsMods.length, 545);
const ahsLinkedMentions = ahsMods.filter(mod => mod.providerLinks.length > 0).length;
const ahsLinkedCanonical = new Set(ahsMods.filter(mod => mod.providerLinks.length > 0).map(mod => mod.canonicalProjectId)).size;
assert.equal(ahsLinkedMentions, 545);
assert.equal(ahsLinkedCanonical, 355, 'seven globally new projects plus globally-existing Rolling Down in The Deep newly enter AHS history');

const video = ahsVideos.find(item => item.id === 'youtube:pw52tfw26Wg');
assert(video, 'chunk 25 source video must load');
assert.equal(video.publishedAt, '2024-09-24');
assert.equal(video.title, "10 Awesome Minecraft Mods You've Probably Never Heard Of #25");
assert.equal(video.mods.length, 10);
const expected = new Map([
  ["Vouniern's Turrets",'vounierns-turrets'],
  ['Splinecart','splinecart'],
  ['Astrocraft','astrocraft'],
  ['Rolling Down in The Deep','rolling-down-in-the-deep'],
  ['Beautiful Enchanted Books','beautiful-enchanted-books'],
  ['Tide','tide'],
  ['Cosmic Horizons','cosmic-horizons'],
  ['Cardiac','cardiac'],
  ['Circumnavigate','circumnavigate'],
  ['Valarian Conquest','valarian-conquest']
]);
for (const mod of video.mods) {
  const canonicalId = expected.get(mod.name);
  assert(canonicalId, `unexpected chunk-25 source label: ${mod.name}`);
  assert.equal(mod.canonicalProjectId, canonicalId, `canonical identity: ${mod.name}`);
  assert.equal(mod.timestampSeconds, null, `missing creator timestamp must stay null: ${mod.name}`);
  assert.equal(mod.videoLink, video.url, `missing creator timestamp must use base video URL: ${mod.name}`);
  assert(!mod.videoLink.includes('t=0s'), `must never fabricate t=0s: ${mod.name}`);
  assert(mod.providerLinks.length > 0, `verified direct project home required: ${mod.name}`);
}
assert.equal(new Set(video.mods.map(mod => mod.canonicalProjectId)).size, 10);

const project = id => {
  const hit = vault.projects.find(item => item.id === id);
  assert(hit, `canonical project missing: ${id}`);
  return hit;
};
const links = id => project(id).providerLinks;
const providers = id => [...new Set(links(id).map(link => link.provider))].sort();
const hasUrl = (id, url) => links(id).some(link => link.url === url);
assert.deepEqual(providers('vounierns-turrets'), ['CurseForge']);
assert.deepEqual(providers('splinecart'), ['GitHub','Modrinth']);
assert.deepEqual(providers('beautiful-enchanted-books'), ['CurseForge','Modrinth']);
assert.deepEqual(providers('tide'), ['CurseForge','GitHub','Modrinth']);
assert.deepEqual(providers('cosmic-horizons'), ['CurseForge']);
assert.deepEqual(providers('cardiac'), ['CurseForge','GitHub','Modrinth']);
assert.deepEqual(providers('valarian-conquest'), ['CurseForge','Modrinth']);
assert.deepEqual(providers('astrocraft'), ['CurseForge','Modrinth']);
assert.deepEqual(providers('rolling-down-in-the-deep'), ['CurseForge','Modrinth']);
assert.deepEqual(providers('circumnavigate'), ['CurseForge','GitHub','Modrinth']);
assert(hasUrl('vounierns-turrets','https://www.curseforge.com/minecraft/mc-mods/vounierns-turrets'));
assert(hasUrl('splinecart','https://modrinth.com/mod/splinecart'));
assert(hasUrl('splinecart','https://github.com/FoundationGames/Splinecart'));
assert(hasUrl('beautiful-enchanted-books','https://modrinth.com/resourcepack/beautiful-enchanted-books'));
assert(hasUrl('beautiful-enchanted-books','https://www.curseforge.com/minecraft/texture-packs/beautiful-enchanted-books'));
assert(hasUrl('tide','https://modrinth.com/mod/tide'));
assert(hasUrl('tide','https://www.curseforge.com/minecraft/mc-mods/tide'));
assert(hasUrl('tide','https://github.com/Lightning-64/Tide-2'));
assert(hasUrl('cosmic-horizons','https://www.curseforge.com/minecraft/mc-mods/cosmic-horizons'));
assert(hasUrl('cardiac','https://modrinth.com/mod/cardiac'));
assert(hasUrl('cardiac','https://www.curseforge.com/minecraft/mc-mods/cardiac'));
assert(hasUrl('cardiac','https://github.com/Octo-Studios/cardiac'));
assert(hasUrl('valarian-conquest','https://modrinth.com/mod/valarian-conquest'));
assert(hasUrl('valarian-conquest','https://www.curseforge.com/minecraft/mc-mods/valarian-conquest'));

// Anti-false-merge guards.
assert(!links('splinecart').some(link => link.url.includes('peterwolfs-splinecart')), 'later Splinecart fork must stay separate');
assert(!links('beautiful-enchanted-books').some(link => link.url.includes('/mc-mods/beautiful-enchanted-books') || link.url.includes('/mod/beautiful-enchanted-books-mod-edition')), 'Beautiful Enchanted Books mod edition must stay separate from original resource pack');
assert.equal(links('cosmic-horizons').length, 1, 'old same-name Cosmic Horizons modpack must not merge onto current mod');

const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const rawVideo = raw.videos.find(item => item.id === 'youtube:pw52tfw26Wg');
assert(rawVideo && rawVideo.mods.length === 10);
assert.deepEqual(rawVideo.excludedEvidence.map(item => [item.sourceLabel,item.status]), [
  ['Minecraft Forge','platform-link-not-project'],
  ['Fabric','platform-link-not-project'],
  ['Music - Minecraft - Aria Math - C418','non-project']
]);
for (const mod of rawVideo.mods) assert(!Object.prototype.hasOwnProperty.call(mod, 'timestampSeconds'), `raw timestamp must be omitted when creator provides none: ${mod.name}`);

const providerRaw = JSON.parse(fs.readFileSync(providerPath, 'utf8'));
assert.equal(providerRaw.entries.length, 7);
assert.equal(providerRaw.entries.reduce((sum, entry) => sum + entry[4].length, 0), 14);
assert.deepEqual(providerRaw.entries.map(entry => entry[0]).sort(), ['beautiful-enchanted-books','cardiac','cosmic-horizons','splinecart','tide','valarian-conquest','vounierns-turrets']);
assert.deepEqual(providerRaw.entries.find(entry => entry[0] === 'beautiful-enchanted-books').slice(2,4), ['resourcepack',[]]);
assert(providerRaw.entries.find(entry => entry[0] === 'tide')[3].includes('Tide 2'));

const candidates = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'));
assert.equal(candidates.entries.length, 7);
assert.equal(candidates.entries.reduce((sum, entry) => sum + entry[4].length, 0), 14);

const rendered = renderCatalog({ id:'creator-vault-qa-ahs25', name:'Creator Vault QA AsianHalfSquat 25', items:[], assets:{}, documents:[], sources:[] }, root);
for (const needle of [
  'youtube:pw52tfw26Wg',"Vouniern's Turrets",'Splinecart','Beautiful Enchanted Books','Tide','Cosmic Horizons','Cardiac','Valarian Conquest',
  'https://www.curseforge.com/minecraft/mc-mods/vounierns-turrets','https://github.com/FoundationGames/Splinecart','https://modrinth.com/resourcepack/beautiful-enchanted-books','https://github.com/Lightning-64/Tide-2','https://www.curseforge.com/minecraft/mc-mods/cosmic-horizons','https://github.com/Octo-Studios/cardiac','https://modrinth.com/mod/valarian-conquest','Find in Enderloom'
]) assert(rendered.html.includes(needle), `rendered AsianHalfSquat chunk 25 output missing ${needle}`);

console.log(`Creator Vault AsianHalfSquat chunk 25 QA passed: ${vault.stats.recommendations} mentions -> ${vault.stats.uniqueProjects} canonical projects; ${vault.stats.verifiedProjects} linked / ${vault.stats.providerDestinations} destinations / ${vault.stats.multiProviderProjects} multi-provider / ${vault.stats.unresolvedProjects} unresolved. AHS linked mentions=${ahsLinkedMentions}/545 across ${ahsLinkedCanonical} canonical projects; all 10 null timestamps/base links, 7-new/3-reuse canonicalization, provider anti-false-merge rules, exclusions, and recursive chunk-24 baseline are locked.`);
