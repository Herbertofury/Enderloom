'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');
const { renderCatalog } = require('../src/catalog-renderer');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'catalog', 'creator-vault', 'recommendation-sources', 'asianhalfsquat.history-batch14.json');
const providerPaths = 'ab'.split('').map(suffix => path.join(root, 'catalog', 'creator-vault', 'project-sources', `provider-closure-14${suffix}-asianhalfsquat.json`));
const chunk14Paths = [sourcePath, ...providerPaths];
const creatorsPath = path.join(root, 'catalog', 'creator-vault', 'creators.json');
const chunk13CreatorsBaselinePath = path.join(root, 'catalog', 'creator-vault', 'research', 'creators.chunk13-baseline.json');

// Prove chunk 13 exactly before testing chunk 14. The frozen chunk-13 wrapper
// recursively proves all older checkpoints. Hide only chunk 14 and swap only
// the creator ledger, then restore every mutation in finally.
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-ahs14-qa-'));
const moved = [];
let currentCreatorsBackup = null;
try {
  for (const file of chunk14Paths) {
    assert(fs.existsSync(file), `AsianHalfSquat chunk 14 production file missing: ${path.relative(root, file)}`);
    const target = path.join(tempDir, path.basename(file));
    fs.renameSync(file, target);
    moved.push([file, target]);
  }
  assert(fs.existsSync(creatorsPath), 'current creators ledger must exist');
  assert(fs.existsSync(chunk13CreatorsBaselinePath), 'chunk 13 creators baseline must exist');
  currentCreatorsBackup = path.join(tempDir, 'creators.current.json');
  fs.renameSync(creatorsPath, currentCreatorsBackup);
  fs.copyFileSync(chunk13CreatorsBaselinePath, creatorsPath);

  const legacy = spawnSync(process.execPath, [path.join(__dirname, 'creator-vault-qa-chunk13.js')], { cwd: root, stdio: 'inherit' });
  assert.equal(legacy.status, 0, 'chunk 13 baseline regression suite must remain green byte-for-byte');
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
assert.equal(vault.videos.length, 34, '3 Kreksu + 25 AsianHalfSquat + 6 EnderVerse videos');
assert.equal(vault.stats.recommendations, 584, '569 prior mentions + 15 AsianHalfSquat history batch 14 mentions');
assert.equal(vault.stats.uniqueProjects, 484, '584 mentions must merge to exactly 484 canonical projects');
assert.equal(vault.projects.reduce((sum, project) => sum + project.mentionCount, 0), 584, 'every source mention survives canonicalization');
assert.equal(vault.stats.verifiedProjects, 482);
assert.equal(vault.stats.unresolvedProjects, 2);
assert.equal(vault.stats.multiProviderProjects, 301);
assert.equal(vault.stats.providerDestinations, 838);
assert.equal(vault.stats.nativeRecommendationSources, 10);
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
assert.equal(ahs.coverage.indexedVideos, 25);
assert.equal(ahs.coverage.recommendationCount, 325);
assert.equal(ahs.coverage.verifiedProjectHomes, 325);
const ahsVideos = vault.videos.filter(video => video.creatorId === ahs.id);
assert.equal(ahsVideos.length, 25);
const ahsMods = ahsVideos.flatMap(video => video.mods);
assert.equal(ahsMods.length, 325);
const ahsLinkedMentions = ahsMods.filter(mod => mod.providerLinks.length > 0).length;
const ahsLinkedCanonical = new Set(ahsMods.filter(mod => mod.providerLinks.length > 0).map(mod => mod.canonicalProjectId)).size;
assert.equal(ahsLinkedMentions, 325);
assert.equal(ahsLinkedCanonical, 248);

const freshIds = ['youtube:muOwi6IUWdc', 'youtube:krWFchiDWHs'];
const fresh = freshIds.map(id => ahsVideos.find(video => video.id === id));
assert(fresh.every(Boolean), 'both chunk 14 videos must load');
assert.deepEqual(fresh.map(video => video.mods.length), [5, 10]);
assert.deepEqual(fresh.map(video => video.publishedAt), ['2025-08-22', '2025-08-07']);
const freshMods = fresh.flatMap(video => video.mods);
assert.equal(freshMods.length, 15);
for (const video of fresh) {
  for (const mod of video.mods) {
    assert(mod.name && mod.canonicalProjectId, `canonical project required: ${mod.name}`);
    assert(mod.providerLinks.length > 0, `verified direct project home required: ${mod.name}`);
    assert.equal(mod.timestampSeconds, null, `timestamp must remain absent: ${mod.name}`);
    assert.equal(mod.videoLink, video.url, `untimestamped source must use base video URL: ${mod.name}`);
    assert(!mod.videoLink.includes('t=0s'), `fake zero-second deep link forbidden: ${mod.name}`);
  }
}

const canonical = name => freshMods.find(mod => mod.name === name).canonicalProjectId;
assert.equal(canonical('Physics Mod Pro'), 'physics-mod');
assert.equal(canonical('AstraLex Shaders'), 'astralex-shaders');
assert.equal(canonical('BSL Shaders'), 'bsl-shaders');
assert.equal(canonical('Solas Shader'), 'solas-shader');
assert.equal(canonical('Dynamic Surroundings'), 'dynamic-surroundings');
assert.equal(canonical('JJThunder To The Max'), 'jjthunder-to-the-max');
assert.equal(canonical('Better Third Person'), 'better-third-person');
assert.equal(canonical('Camera Utils'), 'camera-utils');
assert.equal(canonical('Distant Horizons'), 'distant-horizons');
assert.equal(canonical('Do a Barrel Roll'), 'do-a-barrel-roll');
assert.equal(canonical('Fresh Player Animations'), 'trailer-player-animations');
assert.equal(canonical('Bliss Shaders'), 'bliss-shaders');
assert.equal(canonical('Complementary Shaders'), 'complementary-shaders');
assert.equal(canonical('Euphoria Patches'), 'euphoria-patches');
assert.equal(canonical('Photon Shaders'), 'photon-shader');

const providers = id => vault.projects.find(project => project.id === id).providerLinks;
for (const id of ['astralex-shaders', 'jjthunder-to-the-max', 'trailer-player-animations']) {
  const names = new Set(providers(id).map(link => link.provider));
  assert(names.has('Modrinth') && names.has('CurseForge'), `${id} must expose Modrinth + CurseForge`);
}
assert.deepEqual(providers('bsl-shaders').map(link => link.provider).sort(), ['CurseForge', 'Modrinth', 'Official']);
assert.deepEqual(providers('dynamic-surroundings').map(link => link.provider).sort(), ['CurseForge', 'GitHub', 'Modrinth']);
assert.deepEqual(providers('better-third-person').map(link => link.provider).sort(), ['CurseForge', 'Modrinth']);
assert.deepEqual(providers('camera-utils').map(link => link.provider).sort(), ['CurseForge', 'GitHub', 'Modrinth']);
assert.deepEqual(providers('bliss-shaders').map(link => link.provider).sort(), ['CurseForge', 'GitHub', 'Modrinth']);
const trailer = vault.projects.find(project => project.id === 'trailer-player-animations');
assert(trailer.aliases.includes('Fresh Player Animations'));

const rendered = renderCatalog({ id: 'creator-vault-qa-ahs14', name: 'Creator Vault QA AsianHalfSquat 14', items: [], assets: {}, documents: [], sources: [] }, root);
for (const needle of [
  'youtube:muOwi6IUWdc', 'AstraLex Shaders', 'Dynamic Surroundings',
  'youtube:krWFchiDWHs', 'JJThunder To The Max', 'Fresh Player Animations', 'Trailer Player Animations',
  'https://modrinth.com/datapack/jjthunder-to-the-max',
  'https://www.curseforge.com/minecraft/texture-packs/fresh-player-animations',
  'https://capttatsu.com/bslshaders/',
  'https://github.com/OreCruncher/DynamicSurroundingsFabric',
  'https://github.com/henkelmax/camera-utils',
  'https://github.com/X0nk/Bliss-Shader',
  'Find in Enderloom'
]) assert(rendered.html.includes(needle), `rendered AsianHalfSquat chunk 14 output missing ${needle}`);

console.log(`Creator Vault AsianHalfSquat chunk 14 QA passed: ${vault.stats.recommendations} mentions -> ${vault.stats.uniqueProjects} canonical projects; ${vault.stats.verifiedProjects} linked / ${vault.stats.providerDestinations} destinations / ${vault.stats.multiProviderProjects} multi-provider / ${vault.stats.unresolvedProjects} unresolved. AHS linked mentions=${ahsLinkedMentions}/325 across ${ahsLinkedCanonical} canonical projects.`);
