'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');
const { renderCatalog } = require('../src/catalog-renderer');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'catalog', 'creator-vault', 'recommendation-sources', 'asianhalfsquat.history-batch13.json');
const providerPaths = 'abcd'.split('').map(suffix => path.join(root, 'catalog', 'creator-vault', 'project-sources', `provider-closure-13${suffix}-asianhalfsquat.json`));
const chunk13Paths = [sourcePath, ...providerPaths];
const creatorsPath = path.join(root, 'catalog', 'creator-vault', 'creators.json');
const chunk12CreatorsBaselinePath = path.join(root, 'catalog', 'creator-vault', 'research', 'creators.chunk12-baseline.json');

// Prove chunk 12 exactly before testing chunk 13. The frozen chunk-12 wrapper
// recursively proves chunk 11, Episode 5 and Episode 3. Hide only chunk 13 and
// swap only the creator ledger, then restore every mutation in finally.
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-ahs13-qa-'));
const moved = [];
let currentCreatorsBackup = null;
try {
  for (const file of chunk13Paths) {
    assert(fs.existsSync(file), `AsianHalfSquat chunk 13 production file missing: ${path.relative(root, file)}`);
    const target = path.join(tempDir, path.basename(file));
    fs.renameSync(file, target);
    moved.push([file, target]);
  }
  assert(fs.existsSync(creatorsPath), 'current creators ledger must exist');
  assert(fs.existsSync(chunk12CreatorsBaselinePath), 'chunk 12 creators baseline must exist');
  currentCreatorsBackup = path.join(tempDir, 'creators.current.json');
  fs.renameSync(creatorsPath, currentCreatorsBackup);
  fs.copyFileSync(chunk12CreatorsBaselinePath, creatorsPath);

  const legacy = spawnSync(process.execPath, [path.join(__dirname, 'creator-vault-qa-chunk12.js')], { cwd: root, stdio: 'inherit' });
  assert.equal(legacy.status, 0, 'chunk 12 baseline regression suite must remain green byte-for-byte');
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
assert.equal(vault.videos.length, 32, '3 Kreksu + 23 AsianHalfSquat + 6 EnderVerse videos');
assert.equal(vault.stats.recommendations, 569, '526 prior mentions + 43 AsianHalfSquat history batch 13 mentions');
assert.equal(vault.stats.uniqueProjects, 481, '569 mentions must merge to exactly 481 canonical projects');
assert.equal(vault.projects.reduce((sum, project) => sum + project.mentionCount, 0), 569, 'every source mention survives canonicalization');
assert.equal(vault.stats.verifiedProjects, 479);
assert.equal(vault.stats.unresolvedProjects, 2);
assert.equal(vault.stats.multiProviderProjects, 293);
assert.equal(vault.stats.providerDestinations, 823);
assert.equal(vault.stats.nativeRecommendationSources, 9);
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
assert.equal(ahs.coverage.indexedVideos, 23);
assert.equal(ahs.coverage.recommendationCount, 310);
assert.equal(ahs.coverage.verifiedProjectHomes, 310);
const ahsVideos = vault.videos.filter(video => video.creatorId === ahs.id);
assert.equal(ahsVideos.length, 23);
const ahsMods = ahsVideos.flatMap(video => video.mods);
assert.equal(ahsMods.length, 310);
const ahsLinkedMentions = ahsMods.filter(mod => mod.providerLinks.length > 0).length;
const ahsLinkedCanonical = new Set(ahsMods.filter(mod => mod.providerLinks.length > 0).map(mod => mod.canonicalProjectId)).size;
assert.equal(ahsLinkedMentions, 310, 'all indexed AsianHalfSquat mentions must have a verified direct project home');
assert.equal(ahsLinkedCanonical, 245, 'AsianHalfSquat linked mentions must collapse to exactly 245 canonical projects');

const freshIds = ['youtube:8fwC4CzRDmE', 'youtube:o9V0iP7rik4'];
const fresh = freshIds.map(id => ahsVideos.find(video => video.id === id));
assert(fresh.every(Boolean), 'both chunk 13 videos must load');
assert.deepEqual(fresh.map(video => video.mods.length), [33, 10]);
assert.deepEqual(fresh.map(video => video.publishedAt), ['2025-09-24', '2025-09-04']);
const freshMods = fresh.flatMap(video => video.mods);
assert.equal(freshMods.length, 43);
assert(!freshMods.some(mod => mod.name === 'Structure Mods'), 'generic Structure Mods label must never become a fake project card');
for (const mod of freshMods) {
  assert(mod.name && mod.canonicalProjectId, `canonical project required: ${mod.name}`);
  assert(mod.providerLinks.length > 0, `verified direct project home required: ${mod.name}`);
  assert(Number.isFinite(mod.timestampSeconds), `creator chapter timestamp required: ${mod.name}`);
  assert(mod.videoLink.includes(`t=${mod.timestampSeconds}s`), `timestamp deep link required: ${mod.name}`);
}
assert.equal(new Set(fresh[0].mods.map(mod => mod.timestampSeconds)).size, 10, 'combo video must preserve exactly ten grouped chapter timestamps');
assert.equal(new Set(fresh[1].mods.map(mod => mod.timestampSeconds)).size, 10, 'September Top 10 must preserve ten unique chapter timestamps');
for (const video of fresh) {
  const timestamps = video.mods.map(mod => mod.timestampSeconds);
  assert(timestamps.every((value, index) => index === 0 || value >= timestamps[index - 1]), `${video.id} chapter timestamps must be nondecreasing`);
}

const source = require(sourcePath);
assert.equal(source.unresolvedSourceEvidence.videoId, 'youtube:8fwC4CzRDmE');
assert.equal(source.unresolvedSourceEvidence.timestampSeconds, 393);
assert.equal(source.unresolvedSourceEvidence.sourceLabel, 'Structure Mods');
assert.equal(source.unresolvedSourceEvidence.linkedDestinationCount, 2);
assert.equal(source.unresolvedSourceEvidence.status, 'identity-pending');
const comboSource = source.videos.find(video => video.id === 'youtube:8fwC4CzRDmE');
assert(comboSource);
assert.equal(comboSource.unresolvedLinkedEvidence.length, 1);
assert.equal(comboSource.unresolvedLinkedEvidence[0].linkedDestinationCount, 2);

const canonical = name => freshMods.find(mod => mod.name === name).canonicalProjectId;
const expected = {
  "Angel's Weather": 'angels-weather', 'Particle Rain': 'particle-rain', 'Immersive UI': 'immersive-ui', "HT's TreeChop": 'treechop',
  'Physics Mod': 'physics-mod', 'Fresh Animations': 'fresh-animations', 'Complementary Shaders': 'complementary-shaders', 'Photon': 'photon-shader',
  'Presence Footsteps': 'presence-footsteps', 'Distant Horizons': 'distant-horizons', 'Amendments': 'amendments', 'More Critters': 'more-critters',
  'Cool Rain': 'cool-rain', 'Gentler Weather Sounds': 'gentler-weather-sounds', 'Fabric Seasons': 'fabric-seasons', 'Immersive Snow': 'immersive-snow',
  'Snow! Real Magic!': 'snow-real-magic', 'Inventory Particles': 'inventory-particles', 'Physical Falling Trees': 'physical-falling-trees', 'Cave Spelunking': 'cave-spelunking',
  'Simple Block Physics': 'simple-block-physics', 'Vein Miner': 'veinminer', 'RoadArchitect': 'roadarchitect', 'Entity Pin Cushions': 'entity-pin-cushions',
  'Blood N Particles': 'blood-n-particles', 'BN Blood Particles': 'bn-blood-particles', 'RyoamicLights': 'ryoamiclights', 'Torch hit!': 'torch-hit',
  "Soul Fire'd": 'soul-fire-d', 'Flimsy Torches': 'flimsy-torches', 'Euphoria Patches': 'euphoria-patches', "O's Colorful Grasses": 'os-colorful-grasses',
  'Lushness': 'lushness', 'Simple Clouds': 'simple-clouds', 'Larion World Generation': 'larion-world-generation', 'ATi Structures': 'ati-structures',
  'Entity Detectors': 'entity-detectors', 'Trackwork': 'trackwork', 'Mugging Villagers': 'mugging-villagers', 'Legendary Survival Overhaul': 'legendary-survival-overhaul',
  'Better Combat Extension': 'bettercombat-extension', 'Legendary Creatures': 'legendary-creatures', 'Desert Behemoths: Sandworms!': 'desert-behemoths-sandworms'
};
for (const [name, id] of Object.entries(expected)) assert.equal(canonical(name), id, `canonical identity: ${name}`);

const providers = id => vault.projects.find(project => project.id === id).providerLinks;
assert.deepEqual(providers('physical-falling-trees').map(link => link.provider).sort(), ['Modrinth', 'Planet Minecraft']);
assert(!providers('physical-falling-trees').some(link => link.provider === 'CurseForge'), 'unverified/creator-disclaimed Physical Falling Trees CurseForge mirror must stay excluded');
assert.deepEqual(providers('cave-spelunking').map(link => link.provider), ['CurseForge']);
for (const id of ['snow-real-magic', 'veinminer', 'larion-world-generation']) {
  const names = new Set(providers(id).map(link => link.provider));
  assert(names.has('Modrinth') && names.has('CurseForge') && names.has('GitHub'), `${id} must expose Modrinth + CurseForge + source`);
}
assert.deepEqual(providers('euphoria-patches').map(link => link.provider).sort(), ['CurseForge', 'Modrinth', 'Official']);
assert(!providers('roadarchitect').some(link => /roadarchitect-encounters/i.test(link.url)), 'RoadArchitect Encounters must remain a separate project');
assert(!providers('ati-structures').some(link => /vanilla-edition/i.test(link.url)), 'ATi Structures Vanilla Edition must not merge into main ATi Structures');
assert(!providers('larion-world-generation').some(link => /unofficial|forge-port/i.test(link.url)), 'Larion unofficial Forge port must remain excluded');

const rendered = renderCatalog({ id: 'creator-vault-qa-ahs13', name: 'Creator Vault QA AsianHalfSquat 13', items: [], assets: {}, documents: [], sources: [] }, root);
for (const needle of [
  'youtube:8fwC4CzRDmE', 'Physical Falling Trees', 'Cave Spelunking', 'Euphoria Patches', 'Larion World Generation',
  'youtube:o9V0iP7rik4', 'ATi Structures', 'Better Combat Extension', 'Desert Behemoths: Sandworms!',
  'https://www.planetminecraft.com/data-pack/physical-falling-trees/',
  'https://www.curseforge.com/minecraft/mc-mods/caveore',
  'https://www.euphoriapatches.com/download/',
  'https://github.com/ViciousBadger/larion-world-generation',
  'Find in Enderloom'
]) assert(rendered.html.includes(needle), `rendered AsianHalfSquat chunk 13 output missing ${needle}`);

console.log(`Creator Vault AsianHalfSquat chunk 13 QA passed: ${vault.stats.recommendations} mentions -> ${vault.stats.uniqueProjects} canonical projects; ${vault.stats.verifiedProjects} linked / ${vault.stats.providerDestinations} destinations / ${vault.stats.multiProviderProjects} multi-provider / ${vault.stats.unresolvedProjects} unresolved. AHS linked mentions=${ahsLinkedMentions}/310 across ${ahsLinkedCanonical} canonical projects; source-level Structure Mods links=2 identity-pending.`);
