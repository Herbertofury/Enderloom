'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');
const { renderCatalog } = require('../src/catalog-renderer');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'catalog', 'creator-vault', 'recommendation-sources', 'enderversemc.vanilla-plus-ep5.chunk10.json');
const providerPaths = 'abcdef'.split('').map(suffix => path.join(root, 'catalog', 'creator-vault', 'project-sources', `provider-closure-10${suffix}-enderverse-ep5.json`));
const episode5Paths = [sourcePath, ...providerPaths];
const creatorsPath = path.join(root, 'catalog', 'creator-vault', 'creators.json');
const episode3CreatorsBaselinePath = path.join(root, 'catalog', 'creator-vault', 'research', 'creators.episode3-baseline.json');

// Preserve every Episode-3-and-earlier assertion byte-for-byte. Run that exact suite
// against the exact baseline by temporarily hiding only Episode 5 production shards.
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-ep5-qa-'));
const moved = [];
let currentCreatorsBackup = null;
try {
  for (const file of episode5Paths) {
    assert(fs.existsSync(file), `Episode 5 production file missing: ${path.relative(root, file)}`);
    const target = path.join(tempDir, path.basename(file));
    fs.renameSync(file, target);
    moved.push([file, target]);
  }
  assert(fs.existsSync(creatorsPath), 'current creators ledger must exist');
  assert(fs.existsSync(episode3CreatorsBaselinePath), 'Episode 3 creators baseline must exist');
  currentCreatorsBackup = path.join(tempDir, 'creators.current.json');
  fs.renameSync(creatorsPath, currentCreatorsBackup);
  fs.copyFileSync(episode3CreatorsBaselinePath, creatorsPath);

  const legacy = spawnSync(process.execPath, [path.join(__dirname, 'creator-vault-qa-episode3.js')], { cwd: root, stdio: 'inherit' });
  assert.equal(legacy.status, 0, 'Episode 3 baseline regression suite must remain green byte-for-byte');
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
assert.equal(vault.videos.length, 25, '3 Kreksu + 16 AsianHalfSquat + 6 EnderVerse videos');
assert.equal(vault.stats.recommendations, 475, '431 prior mentions + 44 Episode 5 project mentions');
assert.equal(vault.stats.uniqueProjects, 413, '475 mentions must merge to exactly 413 canonical projects');
assert.equal(vault.projects.reduce((sum, project) => sum + project.mentionCount, 0), 475, 'every source mention survives canonicalization');
assert.equal(vault.stats.verifiedProjects, 411);
assert.equal(vault.stats.unresolvedProjects, 2);
assert.equal(vault.stats.multiProviderProjects, 227);
assert.equal(vault.stats.providerDestinations, 665);
assert.equal(vault.stats.nativeRecommendationSources, 6);
assert.deepEqual(vault.projects.filter(project => !project.providerLinks.length).map(project => project.name).sort(), ['Better Book Recipe', 'Plank and Junk']);
assert.equal(vault.diagnostics.filter(item => item.level === 'error').length, 0);

const ender = vault.creators.find(creator => creator.id === 'youtube:enderversemc');
assert(ender);
assert.equal(ender.coverage.indexedVideos, 6);
assert.equal(ender.coverage.recommendationCount, 229);
assert.equal(ender.coverage.verifiedProjectHomes, 227);

const enderVideos = vault.videos.filter(video => video.creatorId === ender.id);
assert.equal(enderVideos.length, 6);
assert.equal(enderVideos.reduce((sum, video) => sum + video.mods.length, 0), 229);

const ep5 = enderVideos.find(video => video.id === 'youtube:GYz4LQcNZ7s');
assert(ep5, 'Vanilla+ Episode 5 finale must load');
assert.equal(ep5.title, 'TOP 200 Vanilla+ Minecraft Mods Ep. 5 (Finale) | Forge/Fabric');
assert.equal(ep5.publishedAt, '2025-01-11');
assert.equal(ep5.mods.length, 44, '40 recommendation chapters expand to 44 project mentions through two grouped chapters');
assert.equal(ep5.mods[0].name, 'Global Wind');
assert.equal(ep5.mods.at(-1).name, 'Rain Particle');
assert(!ep5.mods.some(mod => mod.name === 'Tripo3D'), 'Tripo3D sponsor must never become a Minecraft project recommendation');

const timestamps = ep5.mods.map(mod => mod.timestampSeconds);
assert(timestamps.every(Number.isFinite), 'every Episode 5 project mention must preserve a real chapter timestamp');
assert(timestamps.every((value, index) => index === 0 || value >= timestamps[index - 1]), 'Episode 5 timestamps must be nondecreasing; grouped project mentions may share a chapter timestamp');
assert.equal(new Set(timestamps).size, 40, '44 project mentions must preserve exactly 40 recommendation chapter timestamps');
for (const mod of ep5.mods) {
  assert(mod.name && mod.evidence && mod.canonicalProjectId, `complete Episode 5 evidence: ${mod.name}`);
  assert(mod.sourceKinds.includes('description') && mod.sourceKinds.includes('chapter') && mod.sourceKinds.includes('creator-download-sheet'), `source kinds preserved: ${mod.name}`);
  assert(mod.videoLink.includes(`t=${mod.timestampSeconds}s`), `timestamp deep link preserved: ${mod.name}`);
  assert(mod.providerLinks.length > 0, `verified direct project home required: ${mod.name}`);
}

assert.deepEqual(ep5.mods.filter(mod => mod.timestampSeconds === 637).map(mod => mod.name), ['Nether Delight', 'Ocean Delight', 'Ender Delight', "Farmer's structures"]);
assert.deepEqual(ep5.mods.filter(mod => mod.timestampSeconds === 1120).map(mod => mod.name), ['Break Free', 'Multi Mine']);

const canonical = name => ep5.mods.find(mod => mod.name === name).canonicalProjectId;
assert.equal(canonical('Hold My Items'), 'hold-my-items');
assert.equal(canonical('Multi Mine'), 'multi-mine');
assert.equal(canonical('V-Tweaks'), 'v-tweaks');
assert.equal(canonical('Dynamic Surroundings Resource Pack'), 'dynamic-surroundings-reworked');
assert.equal(canonical('qraftyfied: STRUCTURES'), 'qraftyfied');
assert.equal(canonical('Nether Delight'), 'nethers-delight');
assert.equal(canonical('Ocean Delight'), 'oceans-delight');
assert.equal(canonical('Ender Delight'), 'enders-delight');
assert.equal(canonical('Farmer\'s structures'), 'farmers-structures');
assert.equal(canonical('Rain Particle'), 'particle-rain');

const equipment = vault.projects.find(project => project.id === 'equipment-compare');
assert(equipment && equipment.providerLinks.length === 3);
assert(equipment.providerLinks.some(link => link.provider === 'CurseForge' && link.label === 'Forge/NeoForge'));
assert(equipment.providerLinks.some(link => link.provider === 'CurseForge' && link.label === 'Fabric'));
const villagers = vault.projects.find(project => project.id === 'villagersplus');
assert(villagers && villagers.providerLinks.length === 3);
assert(villagers.providerLinks.some(link => link.provider === 'CurseForge' && link.label === 'Fabric/NeoForge'));
assert(villagers.providerLinks.some(link => link.provider === 'CurseForge' && link.label === 'Forge'));
const particleRain = vault.projects.find(project => project.id === 'particle-rain');
assert(particleRain && particleRain.providerLinks.length === 3);
assert.deepEqual([...new Set(particleRain.providerLinks.map(link => link.provider))].sort(), ['CurseForge', 'GitHub', 'Modrinth']);
assert.deepEqual(vault.projects.find(project => project.id === 'multi-mine').providerLinks.map(link => link.provider), ['CurseForge']);
assert.deepEqual(vault.projects.find(project => project.id === 'dynamic-surroundings-reworked').providerLinks.map(link => link.provider), ['CurseForge']);
assert.deepEqual(vault.projects.find(project => project.id === 'keep-some-inventory').providerLinks.map(link => link.provider), ['Modrinth']);

const rendered = renderCatalog({ id: 'creator-vault-qa-ep5', name: 'Creator Vault QA Episode 5', items: [], assets: {}, documents: [], sources: [] }, root);
for (const needle of [
  'youtube:GYz4LQcNZ7s',
  'Global Wind',
  'Infinity Buttons',
  'Alex\'s Mobs - Naturalist Compat',
  'Particle Rain',
  'https://www.curseforge.com/minecraft/mc-mods/equipment-compare-fabric',
  'https://www.curseforge.com/minecraft/mc-mods/villagersplus-forge',
  'https://github.com/PigCart/particle-rain',
  'Find in Enderloom'
]) assert(rendered.html.includes(needle), `rendered Episode 5 output missing ${needle}`);

console.log(`Creator Vault Episode 5 QA passed: ${vault.stats.recommendations} mentions -> ${vault.stats.uniqueProjects} canonical projects; ${vault.stats.verifiedProjects} linked / ${vault.stats.providerDestinations} destinations / ${vault.stats.multiProviderProjects} multi-provider / ${vault.stats.unresolvedProjects} unresolved.`);
