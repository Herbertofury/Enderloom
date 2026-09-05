'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');
const { renderCatalog } = require('../src/catalog-renderer');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'catalog', 'creator-vault', 'recommendation-sources', 'asianhalfsquat.history-batch15.json');
const providerPaths = 'ab'.split('').map(suffix => path.join(root, 'catalog', 'creator-vault', 'project-sources', `provider-closure-15${suffix}-asianhalfsquat.json`));
const chunk15Paths = [sourcePath, ...providerPaths];
const creatorsPath = path.join(root, 'catalog', 'creator-vault', 'creators.json');
const chunk14CreatorsBaselinePath = path.join(root, 'catalog', 'creator-vault', 'research', 'creators.chunk14-baseline.json');

// Prove chunk 14 exactly before testing chunk 15. The frozen chunk-14 wrapper
// recursively proves every older checkpoint. Hide only chunk 15 and swap only
// the creator ledger, then restore every mutation in finally.
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-ahs15-qa-'));
const moved = [];
let currentCreatorsBackup = null;
try {
  for (const file of chunk15Paths) {
    assert(fs.existsSync(file), `AsianHalfSquat chunk 15 production file missing: ${path.relative(root, file)}`);
    const target = path.join(tempDir, path.basename(file));
    fs.renameSync(file, target);
    moved.push([file, target]);
  }
  assert(fs.existsSync(creatorsPath), 'current creators ledger must exist');
  assert(fs.existsSync(chunk14CreatorsBaselinePath), 'chunk 14 creators baseline must exist');
  currentCreatorsBackup = path.join(tempDir, 'creators.current.json');
  fs.renameSync(creatorsPath, currentCreatorsBackup);
  fs.copyFileSync(chunk14CreatorsBaselinePath, creatorsPath);

  const legacy = spawnSync(process.execPath, [path.join(__dirname, 'creator-vault-qa-chunk14.js')], { cwd: root, stdio: 'inherit' });
  assert.equal(legacy.status, 0, 'chunk 14 baseline regression suite must remain green byte-for-byte');
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
assert.equal(vault.videos.length, 36, '3 Kreksu + 27 AsianHalfSquat + 6 EnderVerse videos');
assert.equal(vault.stats.recommendations, 611, '584 prior mentions + 27 AsianHalfSquat history batch 15 mentions');
assert.equal(vault.stats.uniqueProjects, 497, '611 mentions must merge to exactly 497 canonical projects');
assert.equal(vault.projects.reduce((sum, project) => sum + project.mentionCount, 0), 611, 'every source mention survives canonicalization');
assert.equal(vault.stats.verifiedProjects, 495);
assert.equal(vault.stats.unresolvedProjects, 2);
assert.equal(vault.stats.multiProviderProjects, 312);
assert.equal(vault.stats.providerDestinations, 866);
assert.equal(vault.stats.nativeRecommendationSources, 11);
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
assert.equal(ahs.coverage.indexedVideos, 27);
assert.equal(ahs.coverage.recommendationCount, 352);
assert.equal(ahs.coverage.verifiedProjectHomes, 352);
const ahsVideos = vault.videos.filter(video => video.creatorId === ahs.id);
assert.equal(ahsVideos.length, 27);
const ahsMods = ahsVideos.flatMap(video => video.mods);
assert.equal(ahsMods.length, 352);
const ahsLinkedMentions = ahsMods.filter(mod => mod.providerLinks.length > 0).length;
const ahsLinkedCanonical = new Set(ahsMods.filter(mod => mod.providerLinks.length > 0).map(mod => mod.canonicalProjectId)).size;
assert.equal(ahsLinkedMentions, 352);
assert.equal(ahsLinkedCanonical, 262);

const terrain = ahsVideos.find(video => video.id === 'youtube:GtPvX62bO30');
const july = ahsVideos.find(video => video.id === 'youtube:l9VYc8La5mg');
assert(terrain && july, 'both chunk 15 videos must load');
assert.equal(terrain.publishedAt, '2025-07-25');
assert.equal(july.publishedAt, '2025-07-18');
assert.equal(terrain.mods.length, 17);
assert.equal(july.mods.length, 10);
const freshMods = [...terrain.mods, ...july.mods];
assert.equal(freshMods.length, 27);
for (const mod of freshMods) {
  assert(mod.name && mod.canonicalProjectId, `canonical project required: ${mod.name}`);
  assert(mod.providerLinks.length > 0, `verified direct project home required: ${mod.name}`);
}
for (const mod of terrain.mods) {
  assert.equal(mod.timestampSeconds, null, `terrain feature timestamp must remain absent: ${mod.name}`);
  assert.equal(mod.videoLink, terrain.url, `untimestamped terrain source must use base video URL: ${mod.name}`);
  assert(!mod.videoLink.includes('t=0s'), `fake zero-second deep link forbidden: ${mod.name}`);
}
const julyTimes = [16, 37, 81, 102, 125, 153, 178, 188, 215, 252];
assert.deepEqual(july.mods.map(mod => mod.timestampSeconds), julyTimes);
for (const mod of july.mods) assert(mod.videoLink.includes(`t=${mod.timestampSeconds}s`), `timestamp deep link required: ${mod.name}`);
const loader = name => july.mods.find(mod => mod.name === name).loader;
assert.deepEqual(loader('Arsenal (RPG Series)'), ['Fabric']);
assert.deepEqual(loader('Cool Rain'), ['Forge', 'Fabric']);
assert.deepEqual(loader('Hopo Better Mineshaft'), ['Forge', 'Fabric']);
assert.deepEqual(loader("yyz's backpack"), ['Forge', 'Fabric']);
assert.deepEqual(loader('Storage Racks'), ['Forge']);
assert.deepEqual(loader('Underlay'), ['Forge', 'Fabric']);
assert.deepEqual(loader('Particle Effects'), ['Fabric']);
assert.deepEqual(loader('Keep Some Inventory'), ['Forge', 'Fabric']);
assert.deepEqual(loader('Euphoria Patches'), ['Forge', 'Fabric']);
assert.deepEqual(loader('Automobility'), ['Forge', 'Fabric']);

const canonical = name => freshMods.find(mod => mod.name === name).canonicalProjectId;
assert.equal(canonical('Still Life'), 'still-life');
assert.equal(canonical('Lithosphere'), 'lithosphere');
assert.equal(canonical('Ambient Sounds'), 'ambientsounds');
assert.equal(canonical('Auto HUD'), 'auto-hud');
assert.equal(canonical('Better Third Person'), 'better-third-person');
assert.equal(canonical('Better Days'), 'better-days');
assert.equal(canonical('Camera Utils'), 'camera-utils');
assert.equal(canonical('Euphoria Patches'), 'euphoria-patches');
assert.equal(canonical('Distant Horizons'), 'distant-horizons');
assert.equal(canonical('Not Enough Animations'), 'not-enough-animations');
assert.equal(canonical('Passable Foliage'), 'passable-foliage');
assert.equal(canonical('Towns & Towers'), 'towns-and-towers');
assert.equal(canonical('Bliss Shaders'), 'bliss-shaders');
assert.equal(canonical('Complementary Shaders'), 'complementary-shaders');
assert.equal(canonical('Fresh Animations'), 'fresh-animations');
assert.equal(canonical('Fresh Player Animations'), 'trailer-player-animations');
assert.equal(canonical('Vanilla Mashup'), 'vanilla-mashup-pbr');
assert.equal(canonical('Arsenal (RPG Series)'), 'arsenal-rpg-series');
assert.equal(canonical('Cool Rain'), 'cool-rain');
assert.equal(canonical('Hopo Better Mineshaft'), 'hopo-better-mineshaft');
assert.equal(canonical("yyz's backpack"), 'yyzs-backpack');
assert.equal(canonical('Storage Racks'), 'storage-racks');
assert.equal(canonical('Underlay'), 'underlay');
assert.equal(canonical('Particle Effects'), 'particle-effects');
assert.equal(canonical('Keep Some Inventory'), 'keep-some-inventory');
assert.equal(canonical('Automobility'), 'automobility');

const links = id => vault.projects.find(project => project.id === id).providerLinks;
const providerSet = id => new Set(links(id).map(link => link.provider));
assert.deepEqual(links('still-life').map(link => link.provider), ['Modrinth']);
assert.deepEqual(links('lithosphere').map(link => link.provider), ['Modrinth']);
assert.deepEqual(links('vanilla-mashup-pbr').map(link => link.provider), ['Modrinth']);
assert.deepEqual(links('yyzs-backpack').map(link => link.provider), ['Modrinth']);
assert.deepEqual(links('storage-racks').map(link => link.provider), ['CurseForge']);
for (const id of ['towns-and-towers', 'arsenal-rpg-series', 'hopo-better-mineshaft', 'underlay', 'automobility']) {
  const names = providerSet(id);
  assert(names.has('Modrinth') && names.has('CurseForge'), `${id} must expose Modrinth + CurseForge`);
}
for (const id of ['better-days', 'particle-effects']) {
  const names = providerSet(id);
  assert(names.has('Modrinth') && names.has('CurseForge') && names.has('GitHub'), `${id} must expose Modrinth + CurseForge + GitHub`);
}
assert.equal(links('passable-foliage').length, 3);
assert.equal(links('passable-foliage').filter(link => link.provider === 'CurseForge').length, 2);
assert(providerSet('passable-foliage').has('Modrinth'));
assert.deepEqual([...providerSet('auto-hud')].sort(), ['CurseForge', 'Modrinth']);
assert.deepEqual([...providerSet('not-enough-animations')].sort(), ['CurseForge', 'GitHub', 'Modrinth']);
assert.deepEqual([...providerSet('fresh-animations')].sort(), ['CurseForge', 'Modrinth']);
const towns = vault.projects.find(project => project.id === 'towns-and-towers');
const vanillaMashup = vault.projects.find(project => project.id === 'vanilla-mashup-pbr');
assert(towns.aliases.includes('Towns and Towers'));
assert(vanillaMashup.aliases.includes('Vanilla Mashup'));

const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const sourcePending = raw.videos.flatMap(video => video.unresolvedLinkedEvidence || []);
assert.equal(sourcePending.length, 1);
assert.equal(sourcePending[0].sourceLabel, 'Minecraft Datapack Map');
assert.equal(sourcePending[0].linkedDestinationCount, 1);
assert.equal(sourcePending[0].status, 'identity-pending');

const rendered = renderCatalog({ id: 'creator-vault-qa-ahs15', name: 'Creator Vault QA AsianHalfSquat 15', items: [], assets: {}, documents: [], sources: [] }, root);
for (const needle of [
  'youtube:GtPvX62bO30', 'Still Life', 'Lithosphere', 'Vanilla Mashup',
  'youtube:l9VYc8La5mg', 'Arsenal (RPG Series)', 'Hopo Better Mineshaft', "yyz's backpack", 'Particle Effects',
  'https://modrinth.com/datapack/still-life',
  'https://github.com/wendall911/BetterDays',
  'https://www.curseforge.com/minecraft/mc-mods/passable-foliage-fabric',
  'https://modrinth.com/resourcepack/vanilla-mashup-pbr',
  'https://github.com/LopyMine/Particle-Effects',
  'https://github.com/tr7zw/NotEnoughAnimations',
  'Find in Enderloom'
]) assert(rendered.html.includes(needle), `rendered AsianHalfSquat chunk 15 output missing ${needle}`);

console.log(`Creator Vault AsianHalfSquat chunk 15 QA passed: ${vault.stats.recommendations} mentions -> ${vault.stats.uniqueProjects} canonical projects; ${vault.stats.verifiedProjects} linked / ${vault.stats.providerDestinations} destinations / ${vault.stats.multiProviderProjects} multi-provider / ${vault.stats.unresolvedProjects} unresolved. AHS linked mentions=${ahsLinkedMentions}/352 across ${ahsLinkedCanonical} canonical projects; source-level Minecraft Datapack Map links=1 identity-pending.`);
