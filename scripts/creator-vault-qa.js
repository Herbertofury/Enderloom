'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');
const { renderCatalog } = require('../src/catalog-renderer');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'catalog', 'creator-vault', 'recommendation-sources', 'asianhalfsquat.history-batch18.json');
const providerPaths = [path.join(root, 'catalog', 'creator-vault', 'project-sources', 'provider-closure-18a-asianhalfsquat.json')];
const chunk18Paths = [sourcePath, ...providerPaths];
const creatorsPath = path.join(root, 'catalog', 'creator-vault', 'creators.json');
const chunk17CreatorsBaselinePath = path.join(root, 'catalog', 'creator-vault', 'research', 'creators.chunk17-baseline.json');

// Freeze every older acceptance checkpoint: hide only chunk 18, swap only the
// chunk-17 creator ledger, run the exact frozen chunk-17 wrapper, then restore.
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-ahs18-qa-'));
const moved = [];
let currentCreatorsBackup = null;
try {
  for (const file of chunk18Paths) {
    assert(fs.existsSync(file), `AsianHalfSquat chunk 18 production file missing: ${path.relative(root, file)}`);
    const target = path.join(tempDir, path.basename(file));
    fs.renameSync(file, target);
    moved.push([file, target]);
  }
  assert(fs.existsSync(creatorsPath), 'current creators ledger must exist');
  assert(fs.existsSync(chunk17CreatorsBaselinePath), 'chunk 17 creators baseline must exist');
  currentCreatorsBackup = path.join(tempDir, 'creators.current.json');
  fs.renameSync(creatorsPath, currentCreatorsBackup);
  fs.copyFileSync(chunk17CreatorsBaselinePath, creatorsPath);
  const legacy = spawnSync(process.execPath, [path.join(__dirname, 'creator-vault-qa-chunk17.js')], { cwd: root, stdio: 'inherit' });
  assert.equal(legacy.status, 0, 'chunk 17 baseline regression suite must remain green byte-for-byte');
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
assert.equal(vault.videos.length, 42, '3 Kreksu + 33 AsianHalfSquat + 6 EnderVerse videos');
assert.equal(vault.stats.recommendations, 689, '674 prior mentions + 15 AsianHalfSquat history batch 18 mentions');
assert.equal(vault.stats.uniqueProjects, 527);
assert.equal(vault.projects.reduce((sum, project) => sum + project.mentionCount, 0), 689, 'every source mention survives canonicalization');
assert.equal(vault.stats.verifiedProjects, 525);
assert.equal(vault.stats.unresolvedProjects, 2);
assert.equal(vault.stats.multiProviderProjects, 344);
assert.equal(vault.stats.providerDestinations, 948);
assert.equal(vault.stats.nativeRecommendationSources, 14);
assert.deepEqual(vault.projects.filter(project => !project.providerLinks.length).map(project => project.name).sort(), ['Better Book Recipe', 'Plank and Junk']);
assert.equal(vault.diagnostics.filter(item => item.level === 'error').length, 0);

const ahs = vault.creators.find(creator => creator.id === 'youtube:asianhalfsquat');
assert(ahs);
assert.equal(ahs.coverage.expectedVideos, 350);
assert.equal(ahs.coverage.indexedVideos, 33);
assert.equal(ahs.coverage.recommendationCount, 430);
assert.equal(ahs.coverage.verifiedProjectHomes, 430);
const ahsVideos = vault.videos.filter(video => video.creatorId === ahs.id);
const ahsMods = ahsVideos.flatMap(video => video.mods);
assert.equal(ahsVideos.length, 33);
assert.equal(ahsMods.length, 430);
const ahsLinkedMentions = ahsMods.filter(mod => mod.providerLinks.length > 0).length;
const ahsLinkedCanonical = new Set(ahsMods.filter(mod => mod.providerLinks.length > 0).map(mod => mod.canonicalProjectId)).size;
assert.equal(ahsLinkedMentions, 430);
assert.equal(ahsLinkedCanonical, 296);

const top10 = ahsVideos.find(video => video.id === 'youtube:cjD9jYsfNj8');
const terraMathVideo = ahsVideos.find(video => video.id === 'youtube:OMnbxkBp_0c');
assert(top10 && terraMathVideo, 'both chunk 18 videos must load');
assert.deepEqual([top10.publishedAt, terraMathVideo.publishedAt], ['2025-03-22', '2025-02-03']);
assert.deepEqual([top10.mods.length, terraMathVideo.mods.length], [10, 5]);
const freshMods = [...top10.mods, ...terraMathVideo.mods];
assert.equal(freshMods.length, 15);
for (const mod of freshMods) {
  assert(mod.name && mod.canonicalProjectId, `canonical project required: ${mod.name}`);
  assert(mod.providerLinks.length > 0, `verified direct project home required: ${mod.name}`);
}

const top10Contract = new Map([
  ['Origen', [14, ['Fabric']]],
  ['Resourcify', [37, ['Forge','Fabric']]],
  ['Shared Inventory', [69, ['Fabric']]],
  ['Hold My Items', [100, ['Fabric']]],
  ['Omnidirectional Movement', [121, ['Forge','Fabric']]],
  ['Butchery', [148, ['Forge']]],
  ['Fishing Overhaul', [179, ['Forge']]],
  ['Hearty Meals', [204, ['Fabric']]],
  ['Particle Interactions', [230, ['Forge','Fabric']]],
  ['Flowing Fluids', [248, ['Forge','Fabric']]]
]);
for (const [name, [seconds, loaders]] of top10Contract) {
  const mod = top10.mods.find(item => item.name === name);
  assert(mod, `Top 10 source missing ${name}`);
  assert.equal(mod.timestampSeconds, seconds, `Top 10 timestamp: ${name}`);
  assert(mod.videoLink.includes(`t=${seconds}s`), `Top 10 deep link: ${name}`);
  assert.deepEqual([...mod.loader].sort(), [...loaders].sort(), `creator-stated loader labels: ${name}`);
}

for (const name of ['TerraMath','Complementary Shaders','Distant Horizons','Fresh Player Animations',"Leawind's Third Person"]) {
  const mod = terraMathVideo.mods.find(item => item.name === name);
  assert(mod, `TerraMath feature source missing ${name}`);
  assert.equal(mod.timestampSeconds, null, `TerraMath feature timestamp must remain absent: ${name}`);
  assert.equal(mod.videoLink, terraMathVideo.url, `untimestamped TerraMath feature mention must use base video URL: ${name}`);
  assert(!mod.videoLink.includes('t=0s'));
}

const canonical = name => freshMods.find(mod => mod.name === name).canonicalProjectId;
const requiredMappings = new Map([
  ['Origen', 'origen'],
  ['Resourcify', 'resourcify'],
  ['Shared Inventory', 'shared-inventory'],
  ['Hold My Items', 'hold-my-items'],
  ['Omnidirectional Movement', 'omnidirectional-movement'],
  ['Butchery', 'butchery'],
  ['Fishing Overhaul', 'fishing-overhaul'],
  ['Hearty Meals', 'hearty-meals'],
  ['Particle Interactions', 'particle-interactions'],
  ['Flowing Fluids', 'flowing-fluids'],
  ['TerraMath', 'terramath'],
  ['Complementary Shaders', 'complementary-shaders'],
  ['Distant Horizons', 'distant-horizons'],
  ['Fresh Player Animations', 'trailer-player-animations'],
  ["Leawind's Third Person", 'leawind-third-person']
]);
for (const [name, id] of requiredMappings) assert.equal(canonical(name), id, `canonical identity: ${name}`);

const project = id => vault.projects.find(item => item.id === id);
const links = id => project(id).providerLinks;
const providers = id => new Set(links(id).map(link => link.provider));
const hasUrl = (id, url) => links(id).some(link => link.url === url);
assert(project('origen'), 'Origen canonical project must exist');
assert(project('origen').projectTypes.includes('configpack'), 'Origen must be modeled as a Terra configuration pack');
assert.deepEqual([...providers('origen')], ['GitHub']);
assert(hasUrl('origen', 'https://github.com/Rearth/Origen'));
assert(!links('origen').some(link => /modrinth\.com\/plugin\/terra/i.test(link.url)), 'Terra dependency must not become an Origen provider link');
assert.equal(vault.projects.filter(item => item.id === 'origen').length, 1);
assert(project('terra') && project('terra').id !== project('origen').id, 'Origen must remain distinct from Terra');
for (const id of ['resourcify','fishing-overhaul','hearty-meals','terramath']) {
  const p = providers(id);
  assert(p.has('Modrinth') && p.has('CurseForge') && p.has('GitHub'), `${id} must expose Modrinth + CurseForge + GitHub`);
}
assert.deepEqual([...providers('shared-inventory')].sort(), ['GitHub','Modrinth']);
assert(!links('shared-inventory').some(link => link.provider === 'CurseForge'), 'unrelated same-name CurseForge Shared Inventory projects must not be merged');
assert.deepEqual([...providers('butchery')].sort(), ['CurseForge','Modrinth']);
assert(providers('flowing-fluids').has('CurseForge') && providers('flowing-fluids').has('Modrinth'), 'Flowing Fluids must expose verified CurseForge + Modrinth homes');
assert(hasUrl('resourcify', 'https://github.com/DeDiamondPro/Resourcify'));
assert(hasUrl('fishing-overhaul', 'https://github.com/pitbox46/FishingOverhaul'));
assert(hasUrl('hearty-meals', 'https://github.com/MoriyaShiine/hearty-meals'));
assert(hasUrl('terramath', 'https://github.com/addavriance/TerraMath'));
assert(hasUrl('flowing-fluids', 'https://modrinth.com/mod/flowing-fluids'));

const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const related = raw.videos.flatMap(video => video.relatedLinkedEvidence || []);
assert.equal(related.length, 1);
assert.equal(related[0].sourceLabel, 'Terrain generation formulas');
assert.equal(related[0].status, 'configuration-not-projects');
assert(!vault.projects.some(item => item.name === 'Terrain generation formulas'), 'TerraMath formulas must never become a project card');

const rendered = renderCatalog({ id:'creator-vault-qa-ahs18', name:'Creator Vault QA AsianHalfSquat 18', items:[], assets:{}, documents:[], sources:[] }, root);
for (const needle of [
  'youtube:cjD9jYsfNj8','Origen','Resourcify','Shared Inventory','Butchery','Fishing Overhaul','Hearty Meals','Flowing Fluids',
  'youtube:OMnbxkBp_0c','TerraMath',"Leawind's Third Person",'https://github.com/Rearth/Origen','https://github.com/addavriance/TerraMath','Find in Enderloom'
]) assert(rendered.html.includes(needle), `rendered AsianHalfSquat chunk 18 output missing ${needle}`);

console.log(`Creator Vault AsianHalfSquat chunk 18 QA passed: ${vault.stats.recommendations} mentions -> ${vault.stats.uniqueProjects} canonical projects; ${vault.stats.verifiedProjects} linked / ${vault.stats.providerDestinations} destinations / ${vault.stats.multiProviderProjects} multi-provider / ${vault.stats.unresolvedProjects} unresolved. AHS linked mentions=${ahsLinkedMentions}/430 across ${ahsLinkedCanonical} canonical projects; Origen remains a distinct Terra config pack and TerraMath formulas remain configuration-only evidence.`);
