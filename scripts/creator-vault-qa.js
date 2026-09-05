'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');
const { renderCatalog } = require('../src/catalog-renderer');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'catalog', 'creator-vault', 'recommendation-sources', 'asianhalfsquat.history-batch19.json');
const providerPaths = [path.join(root, 'catalog', 'creator-vault', 'project-sources', 'provider-closure-19a-asianhalfsquat.json')];
const chunk19Paths = [sourcePath, ...providerPaths];
const creatorsPath = path.join(root, 'catalog', 'creator-vault', 'creators.json');
const chunk18CreatorsBaselinePath = path.join(root, 'catalog', 'creator-vault', 'research', 'creators.chunk18-baseline.json');

// Freeze every older acceptance checkpoint: hide only chunk 19, swap only the
// chunk-18 creator ledger, run the exact frozen chunk-18 wrapper, then restore.
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-ahs19-qa-'));
const moved = [];
let currentCreatorsBackup = null;
try {
  for (const file of chunk19Paths) {
    assert(fs.existsSync(file), `AsianHalfSquat chunk 19 production file missing: ${path.relative(root, file)}`);
    const target = path.join(tempDir, path.basename(file));
    fs.renameSync(file, target);
    moved.push([file, target]);
  }
  assert(fs.existsSync(creatorsPath), 'current creators ledger must exist');
  assert(fs.existsSync(chunk18CreatorsBaselinePath), 'chunk 18 creators baseline must exist');
  currentCreatorsBackup = path.join(tempDir, 'creators.current.json');
  fs.renameSync(creatorsPath, currentCreatorsBackup);
  fs.copyFileSync(chunk18CreatorsBaselinePath, creatorsPath);
  const legacy = spawnSync(process.execPath, [path.join(__dirname, 'creator-vault-qa-chunk18.js')], { cwd: root, stdio: 'inherit' });
  assert.equal(legacy.status, 0, 'chunk 18 baseline regression suite must remain green byte-for-byte');
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
assert.equal(vault.videos.length, 44, '3 Kreksu + 35 AsianHalfSquat + 6 EnderVerse videos');
assert.equal(vault.stats.recommendations, 720, '689 prior mentions + 31 AsianHalfSquat history batch 19 mentions');
assert.equal(vault.stats.uniqueProjects, 544);
assert.equal(vault.projects.reduce((sum, project) => sum + project.mentionCount, 0), 720, 'every source mention survives canonicalization');
assert.equal(vault.stats.verifiedProjects, 542);
assert.equal(vault.stats.unresolvedProjects, 2);
assert.equal(vault.stats.multiProviderProjects, 361);
assert.equal(vault.stats.providerDestinations, 996);
assert.equal(vault.stats.nativeRecommendationSources, 15);
assert.deepEqual(vault.projects.filter(project => !project.providerLinks.length).map(project => project.name).sort(), ['Better Book Recipe', 'Plank and Junk']);
assert.equal(vault.diagnostics.filter(item => item.level === 'error').length, 0);

const ahs = vault.creators.find(creator => creator.id === 'youtube:asianhalfsquat');
assert(ahs);
assert.equal(ahs.coverage.expectedVideos, 350);
assert.equal(ahs.coverage.indexedVideos, 35);
assert.equal(ahs.coverage.recommendationCount, 461);
assert.equal(ahs.coverage.verifiedProjectHomes, 461);
const ahsVideos = vault.videos.filter(video => video.creatorId === ahs.id);
const ahsMods = ahsVideos.flatMap(video => video.mods);
assert.equal(ahsVideos.length, 35);
assert.equal(ahsMods.length, 461);
const ahsLinkedMentions = ahsMods.filter(mod => mod.providerLinks.length > 0).length;
const ahsLinkedCanonical = new Set(ahsMods.filter(mod => mod.providerLinks.length > 0).map(mod => mod.canonicalProjectId)).size;
assert.equal(ahsLinkedMentions, 461);
assert.equal(ahsLinkedCanonical, 316);

const january = ahsVideos.find(video => video.id === 'youtube:OKEqrNvouOc');
const december = ahsVideos.find(video => video.id === 'youtube:H1d_6_OIQzc');
assert(january && december, 'both chunk 19 videos must load');
assert.deepEqual([january.publishedAt, december.publishedAt], ['2025-01-17', '2024-12-30']);
assert.deepEqual([january.mods.length, december.mods.length], [6, 25]);
const freshMods = [...january.mods, ...december.mods];
assert.equal(freshMods.length, 31);
assert.equal(new Set(freshMods.map(mod => mod.canonicalProjectId)).size, 30, 'Physics Mod Pro + Physics Mod must share one canonical identity');
for (const mod of freshMods) {
  assert(mod.name && mod.canonicalProjectId, `canonical project required: ${mod.name}`);
  assert(mod.providerLinks.length > 0, `verified direct project home required: ${mod.name}`);
}

for (const name of ['Curvy Pipes','Pretty Pipes','Flatter Entities','NoCubes','Complementary Shaders','Shoulder Surfing Reloaded']) {
  const mod = january.mods.find(item => item.name === name);
  assert(mod, `January feature source missing ${name}`);
  assert.equal(mod.timestampSeconds, null, `January timestamp must remain absent: ${name}`);
  assert.equal(mod.videoLink, january.url, `untimestamped January mention must use base video URL: ${name}`);
  assert(!mod.videoLink.includes('t=0s'));
}

const decemberContract = new Map([
  ['Blooming Biosphere',16], ["Countered's Terrain Slabs",16],
  ['Physics Mod Pro',82], ['Eureka! Ships! for Valkyrien Skies',82], ['Valkyrien Pirates',82],
  ['Explosive Enhancement',173], ['Perception',173],
  ['Smooth Particles',219], ['Sounds',219], ['A Good Place',219],
  ['Particle Rain',280], ['Fog',280],
  ["Toni's Immersive Lanterns",427], ['Shrimple',427], ['First-Person Model',427],
  ["Countered's Settlement Roads",486], ['Via Romana',486],
  ['AmpXtreme',550], ['Glide Away!',550], ['Immersive Aircraft',550],
  ['Dynamic Surroundings',609], ['Particular',609], ['Subtle Effects',609],
  ['Artillery Support',689], ['Physics Mod',689]
]);
assert.equal(decemberContract.size, 25);
for (const [name, seconds] of decemberContract) {
  const mod = december.mods.find(item => item.name === name);
  assert(mod, `December combination source missing ${name}`);
  assert.equal(mod.timestampSeconds, seconds, `December timestamp: ${name}`);
  assert(mod.videoLink.includes(`t=${seconds}s`), `December deep link: ${name}`);
}

const canonical = name => freshMods.find(mod => mod.name === name).canonicalProjectId;
const requiredMappings = new Map([
  ['Curvy Pipes','curvy-pipes'], ['Pretty Pipes','pretty-pipes'], ['Flatter Entities','flatter-entities'], ['NoCubes','nocubes'],
  ['Complementary Shaders','complementary-shaders'], ['Shoulder Surfing Reloaded','shoulder-surfing-reloaded'],
  ['Blooming Biosphere','blooming-biosphere'], ["Countered's Terrain Slabs",'countereds-terrain-slabs'],
  ['Physics Mod Pro','physics-mod'], ['Eureka! Ships! for Valkyrien Skies','eureka'], ['Valkyrien Pirates','valkyrien-pirates'],
  ['Explosive Enhancement','explosive-enhancement'], ['Perception','perception'], ['Smooth Particles','smooth-particles'], ['Sounds','sounds'], ['A Good Place','a-good-place'],
  ['Particle Rain','particle-rain'], ['Fog','fog'], ["Toni's Immersive Lanterns",'immersive-lanterns'], ['Shrimple','shrimple'], ['First-Person Model','first-person-model'],
  ["Countered's Settlement Roads",'countereds-settlement-roads'], ['Via Romana','via-romana'], ['AmpXtreme','ampxtreme'], ['Glide Away!','glide-away'],
  ['Immersive Aircraft','immersive-aircraft'], ['Dynamic Surroundings','dynamic-surroundings'], ['Particular','particular'], ['Subtle Effects','subtle-effects'],
  ['Artillery Support','artillery-support'], ['Physics Mod','physics-mod']
]);
assert.equal(requiredMappings.size, 31);
for (const [name, id] of requiredMappings) assert.equal(canonical(name), id, `canonical identity: ${name}`);
assert.equal(canonical('Physics Mod Pro'), canonical('Physics Mod'), 'Pro label must reuse Physics Mod instead of duplicating it');

const project = id => vault.projects.find(item => item.id === id);
const links = id => project(id).providerLinks;
const providers = id => [...new Set(links(id).map(link => link.provider))].sort();
const hasUrl = (id, url) => links(id).some(link => link.url === url);
const expectProviders = (id, expected) => assert.deepEqual(providers(id), [...expected].sort(), `provider family: ${id}`);
expectProviders('curvy-pipes',['CurseForge','Modrinth']);
for (const id of ['pretty-pipes','flatter-entities','nocubes','eureka','valkyrien-pirates','perception','smooth-particles','sounds','a-good-place','fog','immersive-lanterns','countereds-settlement-roads','glide-away','shrimple']) {
  expectProviders(id,['CurseForge','GitHub','Modrinth']);
}
expectProviders('ampxtreme',['Modrinth']);
expectProviders('particular',['GitHub','Modrinth']);
expectProviders('artillery-support',['CurseForge','Modrinth']);
assert(hasUrl('eureka','https://github.com/ValkyrienSkies/Eureka'));
assert(hasUrl('valkyrien-pirates','https://github.com/JSJBDEV/pirates'));
assert(hasUrl('immersive-lanterns','https://github.com/txnimc/ImmersiveLanterns'));
assert(hasUrl('countereds-settlement-roads','https://github.com/Coun7ered/settlement-roads-new'));
assert(hasUrl('ampxtreme','https://modrinth.com/datapack/ampxtreme'));
assert(hasUrl('particular','https://github.com/Chailotl/particular'));
assert(hasUrl('particular','https://modrinth.com/mod/particular'));
assert(!links('particular').some(link => /reforged|curseforge/i.test(link.url)), 'Particular Reforged / unrelated CurseForge pages must not be merged into original Particular');
assert(hasUrl('shrimple','https://www.curseforge.com/minecraft/shaders/shrimple'));
assert(hasUrl('shrimple','https://modrinth.com/shader/shrimple'));
assert(hasUrl('shrimple','https://github.com/Null-MC/Shrimple'));

const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const related = raw.videos.flatMap(video => video.relatedLinkedEvidence || []);
assert.equal(related.length, 1);
assert.equal(related[0].sourceLabel, 'War Thunder');
assert.equal(related[0].status, 'sponsor-excluded');
assert.equal(related[0].timestampSeconds, 350);
assert(!vault.projects.some(item => item.name === 'War Thunder'), 'War Thunder sponsor must never become a Minecraft project card');

const rendered = renderCatalog({ id:'creator-vault-qa-ahs19', name:'Creator Vault QA AsianHalfSquat 19', items:[], assets:{}, documents:[], sources:[] }, root);
for (const needle of [
  'youtube:OKEqrNvouOc','Curvy Pipes','Pretty Pipes','NoCubes',
  'youtube:H1d_6_OIQzc','Eureka! Ships! for Valkyrien Skies','Valkyrien Pirates','Toni\'s Immersive Lanterns','AmpXtreme','Particular','Artillery Support',
  'https://github.com/Chailotl/particular','https://modrinth.com/shader/shrimple','Find in Enderloom'
]) assert(rendered.html.includes(needle), `rendered AsianHalfSquat chunk 19 output missing ${needle}`);

console.log(`Creator Vault AsianHalfSquat chunk 19 QA passed: ${vault.stats.recommendations} mentions -> ${vault.stats.uniqueProjects} canonical projects; ${vault.stats.verifiedProjects} linked / ${vault.stats.providerDestinations} destinations / ${vault.stats.multiProviderProjects} multi-provider / ${vault.stats.unresolvedProjects} unresolved. AHS linked mentions=${ahsLinkedMentions}/461 across ${ahsLinkedCanonical} canonical projects; January null timestamps, December section timestamps, sponsor exclusion, Particular identity isolation, and Shrimple provider enrichment are locked.`);
