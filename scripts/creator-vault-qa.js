'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');
const { renderCatalog } = require('../src/catalog-renderer');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'catalog', 'creator-vault', 'recommendation-sources', 'asianhalfsquat.history-batch17.json');
const providerPaths = 'abc'.split('').map(suffix => path.join(root, 'catalog', 'creator-vault', 'project-sources', `provider-closure-17${suffix}-asianhalfsquat.json`));
const chunk17Paths = [sourcePath, ...providerPaths];
const creatorsPath = path.join(root, 'catalog', 'creator-vault', 'creators.json');
const chunk16CreatorsBaselinePath = path.join(root, 'catalog', 'creator-vault', 'research', 'creators.chunk16-baseline.json');

// Freeze every older acceptance checkpoint: hide only chunk 17, swap only the
// chunk-16 creator ledger, run the exact frozen chunk-16 wrapper, then restore.
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-ahs17-qa-'));
const moved = [];
let currentCreatorsBackup = null;
try {
  for (const file of chunk17Paths) {
    assert(fs.existsSync(file), `AsianHalfSquat chunk 17 production file missing: ${path.relative(root, file)}`);
    const target = path.join(tempDir, path.basename(file));
    fs.renameSync(file, target);
    moved.push([file, target]);
  }
  assert(fs.existsSync(creatorsPath), 'current creators ledger must exist');
  assert(fs.existsSync(chunk16CreatorsBaselinePath), 'chunk 16 creators baseline must exist');
  currentCreatorsBackup = path.join(tempDir, 'creators.current.json');
  fs.renameSync(creatorsPath, currentCreatorsBackup);
  fs.copyFileSync(chunk16CreatorsBaselinePath, creatorsPath);
  const legacy = spawnSync(process.execPath, [path.join(__dirname, 'creator-vault-qa-chunk16.js')], { cwd: root, stdio: 'inherit' });
  assert.equal(legacy.status, 0, 'chunk 16 baseline regression suite must remain green byte-for-byte');
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
assert.equal(vault.videos.length, 40, '3 Kreksu + 31 AsianHalfSquat + 6 EnderVerse videos');
assert.equal(vault.stats.recommendations, 674, '629 prior mentions + 45 AsianHalfSquat history batch 17 mentions');
assert.equal(vault.stats.uniqueProjects, 520);
assert.equal(vault.projects.reduce((sum, project) => sum + project.mentionCount, 0), 674, 'every source mention survives canonicalization');
assert.equal(vault.stats.verifiedProjects, 518);
assert.equal(vault.stats.unresolvedProjects, 2);
assert.equal(vault.stats.multiProviderProjects, 337);
assert.equal(vault.stats.providerDestinations, 930);
assert.equal(vault.stats.nativeRecommendationSources, 13);
assert.deepEqual(vault.projects.filter(project => !project.providerLinks.length).map(project => project.name).sort(), ['Better Book Recipe', 'Plank and Junk']);
assert.equal(vault.diagnostics.filter(item => item.level === 'error').length, 0);

const ahs = vault.creators.find(creator => creator.id === 'youtube:asianhalfsquat');
assert(ahs);
assert.equal(ahs.coverage.expectedVideos, 350);
assert.equal(ahs.coverage.indexedVideos, 31);
assert.equal(ahs.coverage.recommendationCount, 415);
assert.equal(ahs.coverage.verifiedProjectHomes, 415);
const ahsVideos = vault.videos.filter(video => video.creatorId === ahs.id);
const ahsMods = ahsVideos.flatMap(video => video.mods);
assert.equal(ahsVideos.length, 31);
assert.equal(ahsMods.length, 415);
const ahsLinkedMentions = ahsMods.filter(mod => mod.providerLinks.length > 0).length;
const ahsLinkedCanonical = new Set(ahsMods.filter(mod => mod.providerLinks.length > 0).map(mod => mod.canonicalProjectId)).size;
assert.equal(ahsLinkedMentions, 415);
assert.equal(ahsLinkedCanonical, 289);

const cinematic = ahsVideos.find(video => video.id === 'youtube:kxfhfZ0lMEA');
const terrain = ahsVideos.find(video => video.id === 'youtube:hLPMBnmi324');
assert(cinematic && terrain, 'both chunk 17 videos must load');
assert.deepEqual([cinematic.publishedAt, terrain.publishedAt], ['2025-04-27', '2025-04-09']);
assert.deepEqual([cinematic.mods.length, terrain.mods.length], [26, 19]);
const freshMods = [...cinematic.mods, ...terrain.mods];
assert.equal(freshMods.length, 45);
for (const mod of freshMods) {
  assert(mod.name && mod.canonicalProjectId, `canonical project required: ${mod.name}`);
  assert(mod.providerLinks.length > 0, `verified direct project home required: ${mod.name}`);
}

// The cinematic source gives no MODS timestamp for Sodium/Iris; all other
// cinematic recommendations inherit only their creator-authored section time.
assert.equal(cinematic.mods.find(mod => mod.name === 'Sodium').timestampSeconds, null);
assert.equal(cinematic.mods.find(mod => mod.name === 'Iris').timestampSeconds, null);
for (const name of ['Sodium', 'Iris']) {
  const mod = cinematic.mods.find(item => item.name === name);
  assert.equal(mod.videoLink, cinematic.url);
  assert(!mod.videoLink.includes('t=0s'));
}
const cinematicGroups = new Map([
  [96, ['Tectonic','Larion World Generation',"William Wyther's Overhauled Overworld","Countered's Terrain Slabs"]],
  [164, ['Distant Horizons']],
  [194, ['Complementary Shaders','Photon','BSL']],
  [273, ['Vanilla Mashup','SPBR',"dronko's alternative Bushy Leaves",'Cubic Leaves','Fresh Animations']],
  [401, ['Camera Overhaul','Camera Utils','AutoHUD','Hold My Items']],
  [520, ['AmbientSounds','Presence Footsteps']],
  [550, ['Particle Rain','Unobtrusive Weather','Gentler Weather Sounds']],
  [606, ['Falling Leaves','Particle Interactions']]
]);
for (const [seconds, names] of cinematicGroups) for (const name of names) {
  const mod = cinematic.mods.find(item => item.name === name);
  assert(mod, `cinematic source missing ${name}`);
  assert.equal(mod.timestampSeconds, seconds, `cinematic section timestamp: ${name}`);
  assert(mod.videoLink.includes(`t=${seconds}s`), `cinematic deep link: ${name}`);
}

const terrainGroups = new Map([
  [49, ['Geophilic','Blooming Biosphere',"William Wyther's Overhauled Overworld"]],
  [141, ['Cascades','Tectonic','Larion','Terralith','Terra']],
  [313, ["Nature's Spirit","Biomes O' Plenty",'Regions Unexplored',"Oh The Biomes We've Gone"]]
]);
for (const [seconds, names] of terrainGroups) for (const name of names) {
  const mod = terrain.mods.find(item => item.name === name);
  assert(mod, `terrain source missing ${name}`);
  assert.equal(mod.timestampSeconds, seconds, `terrain section timestamp: ${name}`);
  assert(mod.videoLink.includes(`t=${seconds}s`), `terrain deep link: ${name}`);
}
for (const name of ['Better Clouds','Distant Horizons','Fresh Player Animations','MakeUp - Ultra Fast','Particle Rain',"Sildur's Enhanced Default Shaders",'SimplyWalk']) {
  const mod = terrain.mods.find(item => item.name === name);
  assert(mod, `terrain support source missing ${name}`);
  assert.equal(mod.timestampSeconds, null, `terrain support timestamp must remain absent: ${name}`);
  assert.equal(mod.videoLink, terrain.url, `untimestamped terrain support must use base video URL: ${name}`);
  assert(!mod.videoLink.includes('t=0s'));
}

const canonical = name => freshMods.find(mod => mod.name === name).canonicalProjectId;
const requiredMappings = new Map([
  ["William Wyther's Overhauled Overworld", 'william-wythers-overhauled-overworld'],
  ['Larion', 'larion-world-generation'],
  ['Larion World Generation', 'larion-world-generation'],
  ["Countered's Terrain Slabs", 'countereds-terrain-slabs'],
  ["dronko's alternative Bushy Leaves", 'dronkos-alternative-bushy-leaves'],
  ['Cubic Leaves', 'cubic-leaves'],
  ['Unobtrusive Weather', 'unobtrusive-weather'],
  ['Falling Leaves', 'fallingleaves'],
  ['Particle Interactions', 'particle-interactions'],
  ['Blooming Biosphere', 'blooming-biosphere'],
  ["Nature's Spirit", 'natures-spirit'],
  ["Biomes O' Plenty", 'biomes-o-plenty'],
  ['Regions Unexplored', 'regions-unexplored'],
  ["Oh The Biomes We've Gone", 'oh-the-biomes-weve-gone'],
  ["Sildur's Enhanced Default Shaders", 'sildurs-enhanced-default-shaders'],
  ['SimplyWalk', 'simplywalk'],
  ['Photon', 'photon-shader'],
  ['BSL', 'bsl-shaders'],
  ['Vanilla Mashup', 'vanilla-mashup-pbr'],
  ['AutoHUD', 'auto-hud'],
  ['Fresh Player Animations', 'trailer-player-animations'],
  ['MakeUp - Ultra Fast', 'makeup-ultra-fast'],
  ['Terra', 'terra'],
  ['SPBR', 'spbr']
]);
for (const [name, id] of requiredMappings) assert.equal(canonical(name), id, `canonical identity: ${name}`);

const project = id => vault.projects.find(item => item.id === id);
const links = id => project(id).providerLinks;
const providers = id => new Set(links(id).map(link => link.provider));
const hasUrl = (id, url) => links(id).some(link => link.url === url);
for (const id of ['countereds-terrain-slabs','biomes-o-plenty','oh-the-biomes-weve-gone']) {
  const p = providers(id);
  assert(p.has('Modrinth') && p.has('CurseForge') && p.has('GitHub'), `${id} must expose Modrinth + CurseForge + GitHub`);
}
for (const id of ['dronkos-alternative-bushy-leaves','cubic-leaves','particle-interactions','blooming-biosphere','natures-spirit','regions-unexplored','sildurs-enhanced-default-shaders','simplywalk']) {
  const p = providers(id);
  assert(p.has('Modrinth') && p.has('CurseForge'), `${id} must expose Modrinth + CurseForge`);
}
assert.deepEqual([...providers('unobtrusive-weather')], ['Modrinth']);
assert.deepEqual([...providers('fallingleaves')].sort(), ['CurseForge','GitHub','Modrinth']);
assert(hasUrl('fallingleaves', 'https://www.curseforge.com/minecraft/mc-mods/falling-leaves-forge'));
assert(hasUrl('makeup-ultra-fast', 'https://modrinth.com/shader/makeup-ultra-fast-shaders'));
assert(hasUrl('makeup-ultra-fast', 'https://github.com/javiergcim/MakeUpUltraFast'));
assert(hasUrl('terra', 'https://github.com/PolyhedralDev/Terra'));
assert(hasUrl('spbr', 'https://github.com/ShulkerSakura/SPBR'));
assert(hasUrl('william-wythers-overhauled-overworld', 'https://modrinth.com/mod/wwoo'));
assert(hasUrl('larion-world-generation', 'https://github.com/ViciousBadger/larion-world-generation'));
assert(!vault.projects.some(item => item.name === 'Aspect Ratio'), 'Aspect Ratio setup must never become a project card');
assert.equal(vault.projects.filter(item => item.id === 'william-wythers-overhauled-overworld').length, 1);
assert.equal(vault.projects.filter(item => item.id === 'larion-world-generation').length, 1);

const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const related = raw.videos.flatMap(video => video.relatedLinkedEvidence || []);
assert.equal(related.length, 1);
assert.equal(related[0].sourceLabel, 'Aspect Ratio');
assert.equal(related[0].timestampSeconds, 16);
assert.equal(related[0].status, 'non-project-setting');

const rendered = renderCatalog({ id:'creator-vault-qa-ahs17', name:'Creator Vault QA AsianHalfSquat 17', items:[], assets:{}, documents:[], sources:[] }, root);
for (const needle of [
  'youtube:kxfhfZ0lMEA',"Countered's Terrain Slabs",'Unobtrusive Weather','Particle Interactions',
  'youtube:hLPMBnmi324','Blooming Biosphere',"Nature's Spirit","Biomes O' Plenty",'Regions Unexplored',"Oh The Biomes We've Gone",'SimplyWalk',
  'https://github.com/Coun7ered/terrain_slabs_multiloader','https://github.com/Glitchfiend/BiomesOPlenty','https://github.com/Potion-Studios/Oh-The-Biomes-Weve-Gone',
  'https://github.com/javiergcim/MakeUpUltraFast','https://github.com/PolyhedralDev/Terra','https://github.com/ShulkerSakura/SPBR','Find in Enderloom'
]) assert(rendered.html.includes(needle), `rendered AsianHalfSquat chunk 17 output missing ${needle}`);

console.log(`Creator Vault AsianHalfSquat chunk 17 QA passed: ${vault.stats.recommendations} mentions -> ${vault.stats.uniqueProjects} canonical projects; ${vault.stats.verifiedProjects} linked / ${vault.stats.providerDestinations} destinations / ${vault.stats.multiProviderProjects} multi-provider / ${vault.stats.unresolvedProjects} unresolved. AHS linked mentions=${ahsLinkedMentions}/415 across ${ahsLinkedCanonical} canonical projects; Aspect Ratio remains non-project setup evidence only.`);
