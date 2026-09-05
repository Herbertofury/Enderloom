'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');
const { renderCatalog } = require('../src/catalog-renderer');

const root = path.resolve(__dirname, '..');
const chunk12Paths = [
  path.join(root, 'catalog', 'creator-vault', 'recommendation-sources', 'asianhalfsquat.history-batch12.json'),
  ...'abc'.split('').map(suffix => path.join(root, 'catalog', 'creator-vault', 'project-sources', `provider-closure-12${suffix}-asianhalfsquat.json`))
];
const creatorsPath = path.join(root, 'catalog', 'creator-vault', 'creators.json');
const chunk11CreatorsBaselinePath = path.join(root, 'catalog', 'creator-vault', 'research', 'creators.chunk11-baseline.json');

// Prove chunk 11 exactly before testing chunk 12. The frozen chunk-11 wrapper
// already proves Episode 5, which itself proves Episode 3. Hide only chunk 12
// and swap only the creator ledger, then restore everything in finally.
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-ahs12-qa-'));
const moved = [];
let currentCreatorsBackup = null;
try {
  for (const file of chunk12Paths) {
    assert(fs.existsSync(file), `AsianHalfSquat chunk 12 production file missing: ${path.relative(root, file)}`);
    const target = path.join(tempDir, path.basename(file));
    fs.renameSync(file, target);
    moved.push([file, target]);
  }
  assert(fs.existsSync(creatorsPath), 'current creators ledger must exist');
  assert(fs.existsSync(chunk11CreatorsBaselinePath), 'chunk 11 creators baseline must exist');
  currentCreatorsBackup = path.join(tempDir, 'creators.current.json');
  fs.renameSync(creatorsPath, currentCreatorsBackup);
  fs.copyFileSync(chunk11CreatorsBaselinePath, creatorsPath);

  const legacy = spawnSync(process.execPath, [path.join(__dirname, 'creator-vault-qa-chunk11.js')], { cwd: root, stdio: 'inherit' });
  assert.equal(legacy.status, 0, 'chunk 11 baseline regression suite must remain green byte-for-byte');
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
assert.equal(vault.videos.length, 30, '3 Kreksu + 21 AsianHalfSquat + 6 EnderVerse videos');
assert.equal(vault.stats.recommendations, 526, '507 prior mentions + 19 AsianHalfSquat history batch 12 mentions');
assert.equal(vault.stats.uniqueProjects, 450, '526 mentions must merge to exactly 450 canonical projects');
assert.equal(vault.projects.reduce((sum, project) => sum + project.mentionCount, 0), 526, 'every source mention survives canonicalization');
assert.equal(vault.stats.verifiedProjects, 448);
assert.equal(vault.stats.unresolvedProjects, 2);
assert.equal(vault.stats.multiProviderProjects, 263);
assert.equal(vault.stats.providerDestinations, 757);
assert.equal(vault.stats.nativeRecommendationSources, 8);
assert.deepEqual(vault.projects.filter(project => !project.providerLinks.length).map(project => project.name).sort(), ['Better Book Recipe', 'Plank and Junk']);
assert.equal(vault.diagnostics.filter(item => item.level === 'error').length, 0);

const ender = vault.creators.find(creator => creator.id === 'youtube:enderversemc');
assert(ender);
assert.equal(ender.coverage.indexedVideos, 6);
assert.equal(ender.coverage.recommendationCount, 229);
assert.equal(ender.coverage.verifiedProjectHomes, 227);

const ahs = vault.creators.find(creator => creator.id === 'youtube:asianhalfsquat');
assert(ahs);
assert.equal(ahs.coverage.expectedVideos, 350);
assert.equal(ahs.coverage.indexedVideos, 21);
assert.equal(ahs.coverage.recommendationCount, 267);
assert.equal(ahs.coverage.verifiedProjectHomes, 267);
const ahsVideos = vault.videos.filter(video => video.creatorId === ahs.id);
assert.equal(ahsVideos.length, 21);
const ahsMods = ahsVideos.flatMap(video => video.mods);
assert.equal(ahsMods.length, 267);
const ahsLinkedMentions = ahsMods.filter(mod => mod.providerLinks.length > 0).length;
const ahsLinkedCanonical = new Set(ahsMods.filter(mod => mod.providerLinks.length > 0).map(mod => mod.canonicalProjectId)).size;
assert.equal(ahsLinkedMentions, 267, 'all indexed AsianHalfSquat mentions must have a verified direct project home');
assert.equal(ahsLinkedCanonical, 209, 'AsianHalfSquat linked mentions must collapse to exactly 209 canonical projects');

const freshIds = ['youtube:6lZny5TJBV4', 'youtube:Z-k0lZfl5vI'];
const fresh = freshIds.map(id => ahsVideos.find(video => video.id === id));
assert(fresh.every(Boolean), 'both chunk 12 videos must load');
assert.deepEqual(fresh.map(video => video.mods.length), [10, 9]);
assert.deepEqual(fresh.map(video => video.publishedAt), ['2025-10-18', '2025-09-29']);
const freshMods = fresh.flatMap(video => video.mods);
assert.equal(freshMods.length, 19);
for (const mod of freshMods) {
  assert(mod.name && mod.canonicalProjectId, `canonical project required: ${mod.name}`);
  assert(mod.providerLinks.length > 0, `verified direct project home required: ${mod.name}`);
  assert(Number.isFinite(mod.timestampSeconds), `creator chapter timestamp required: ${mod.name}`);
  assert(mod.videoLink.includes(`t=${mod.timestampSeconds}s`), `timestamp deep link required: ${mod.name}`);
}
for (const video of fresh) {
  const timestamps = video.mods.map(mod => mod.timestampSeconds);
  assert(timestamps.every((value, index) => index === 0 || value >= timestamps[index - 1]), `${video.id} chapter timestamps must be nondecreasing`);
}

const canonical = name => freshMods.find(mod => mod.name === name).canonicalProjectId;
assert.equal(canonical('Arcane Lanterns'), 'arcane-lanterns');
assert.equal(canonical('Stellarity'), 'stellarity');
assert.equal(canonical("ProtoManly's Weather"), 'protomanly-s-weather');
assert.equal(canonical('Falling Sand'), 'falling-sand');
assert.equal(canonical('Kobolds'), 'kobolds');
assert.equal(canonical('Inferno'), 'inferno');
assert.equal(canonical('Classic Pipes'), 'classic-pipes');
assert.equal(canonical("Moog's Voyager Structures"), 'moogs-voyager-structures');
assert.equal(canonical('Call Your Horse'), 'call-your-horse');
assert.equal(canonical('Tetris MC'), 'tetris-mc');
assert.equal(canonical('Cliff under a Tree'), 'clifftree');
assert.equal(canonical('Solar Apocalypse'), 'solar-apocalypse');
assert.equal(canonical('Wandrous'), 'wandrous');
assert.equal(canonical('Clavis'), 'clavis');
assert.equal(canonical('Sound Physics Perfected'), 'sound-physics-perfected');
assert.equal(canonical('2D Minecraft'), '2d-minecraft');
assert.equal(canonical('Outer Wilds Gravity Tech'), 'outer-wilds-gravity-tech');
assert.equal(canonical('Velthoric'), 'velthoric');
assert.equal(canonical('BetterWeather'), 'betterweather-beta-1-7-3');

const providers = id => vault.projects.find(project => project.id === id).providerLinks;
for (const id of ['kobolds', 'inferno', 'classic-pipes', 'call-your-horse', 'solar-apocalypse', 'wandrous', 'velthoric']) {
  const names = new Set(providers(id).map(link => link.provider));
  assert(names.has('Modrinth') && names.has('CurseForge') && names.has('GitHub'), `${id} must expose Modrinth + CurseForge + source`);
}
const clifftree = providers('clifftree');
assert.equal(clifftree.length, 3);
assert(clifftree.some(link => link.provider === 'CurseForge' && link.label === 'Datapack'));
assert(clifftree.some(link => link.provider === 'CurseForge' && link.label === 'Mod'));
assert.deepEqual(providers('2d-minecraft').map(link => link.provider), ['Modrinth']);
assert.deepEqual(providers('outer-wilds-gravity-tech').map(link => link.provider), ['Modrinth']);
assert.deepEqual(providers('betterweather-beta-1-7-3').map(link => link.provider).sort(), ['GitHub', 'Modrinth']);
assert(!providers('betterweather-beta-1-7-3').some(link => /betterweatherbios79|better-weather-reborn/i.test(link.url)), '2026 same-name BetterWeather projects must remain excluded');

const rendered = renderCatalog({ id: 'creator-vault-qa-ahs12', name: 'Creator Vault QA AsianHalfSquat 12', items: [], assets: {}, documents: [], sources: [] }, root);
for (const needle of [
  'youtube:6lZny5TJBV4', 'Kobolds', "Moog's Voyager Structures", 'Call Your Horse', 'CliffTree',
  'youtube:Z-k0lZfl5vI', 'Wandrous', 'Sound Physics Perfected', 'Outer Wilds Gravity Tech', 'BetterWeather',
  'https://www.curseforge.com/minecraft/data-packs/clifftree',
  'https://github.com/jodeks-datapacks/Call-Your-Horse',
  'https://github.com/paulevsGitch/BetterWeather',
  'Find in Enderloom'
]) assert(rendered.html.includes(needle), `rendered AsianHalfSquat chunk 12 output missing ${needle}`);

console.log(`Creator Vault AsianHalfSquat chunk 12 QA passed: ${vault.stats.recommendations} mentions -> ${vault.stats.uniqueProjects} canonical projects; ${vault.stats.verifiedProjects} linked / ${vault.stats.providerDestinations} destinations / ${vault.stats.multiProviderProjects} multi-provider / ${vault.stats.unresolvedProjects} unresolved. AHS linked mentions=${ahsLinkedMentions}/267 across ${ahsLinkedCanonical} canonical projects.`);
