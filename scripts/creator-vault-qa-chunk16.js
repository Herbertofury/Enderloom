'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');
const { renderCatalog } = require('../src/catalog-renderer');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'catalog', 'creator-vault', 'recommendation-sources', 'asianhalfsquat.history-batch16.json');
const providerPaths = 'ab'.split('').map(suffix => path.join(root, 'catalog', 'creator-vault', 'project-sources', `provider-closure-16${suffix}-asianhalfsquat.json`));
const chunk16Paths = [sourcePath, ...providerPaths];
const creatorsPath = path.join(root, 'catalog', 'creator-vault', 'creators.json');
const chunk15CreatorsBaselinePath = path.join(root, 'catalog', 'creator-vault', 'research', 'creators.chunk15-baseline.json');

// Prove chunk 15 byte-for-byte first. Its wrapper recursively proves every
// older checkpoint. Hide only chunk 16, swap only the creator ledger, and
// restore every mutation in finally before asserting the current contract.
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-ahs16-qa-'));
const moved = [];
let currentCreatorsBackup = null;
try {
  for (const file of chunk16Paths) {
    assert(fs.existsSync(file), `AsianHalfSquat chunk 16 production file missing: ${path.relative(root, file)}`);
    const target = path.join(tempDir, path.basename(file));
    fs.renameSync(file, target);
    moved.push([file, target]);
  }
  assert(fs.existsSync(creatorsPath), 'current creators ledger must exist');
  assert(fs.existsSync(chunk15CreatorsBaselinePath), 'chunk 15 creators baseline must exist');
  currentCreatorsBackup = path.join(tempDir, 'creators.current.json');
  fs.renameSync(creatorsPath, currentCreatorsBackup);
  fs.copyFileSync(chunk15CreatorsBaselinePath, creatorsPath);
  const legacy = spawnSync(process.execPath, [path.join(__dirname, 'creator-vault-qa-chunk15.js')], { cwd: root, stdio: 'inherit' });
  assert.equal(legacy.status, 0, 'chunk 15 baseline regression suite must remain green byte-for-byte');
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
assert.equal(vault.videos.length, 38, '3 Kreksu + 29 AsianHalfSquat + 6 EnderVerse videos');
assert.equal(vault.stats.recommendations, 629, '611 prior mentions + 18 AsianHalfSquat history batch 16 mentions');
assert.equal(vault.stats.uniqueProjects, 507);
assert.equal(vault.projects.reduce((sum, project) => sum + project.mentionCount, 0), 629, 'every source mention survives canonicalization');
assert.equal(vault.stats.verifiedProjects, 505);
assert.equal(vault.stats.unresolvedProjects, 2);
assert.equal(vault.stats.multiProviderProjects, 322);
assert.equal(vault.stats.providerDestinations, 897);
assert.equal(vault.stats.nativeRecommendationSources, 12);
assert.deepEqual(vault.projects.filter(project => !project.providerLinks.length).map(project => project.name).sort(), ['Better Book Recipe', 'Plank and Junk']);
assert.equal(vault.diagnostics.filter(item => item.level === 'error').length, 0);

const ahs = vault.creators.find(creator => creator.id === 'youtube:asianhalfsquat');
assert(ahs);
assert.equal(ahs.coverage.expectedVideos, 350);
assert.equal(ahs.coverage.indexedVideos, 29);
assert.equal(ahs.coverage.recommendationCount, 370);
assert.equal(ahs.coverage.verifiedProjectHomes, 370);
const ahsVideos = vault.videos.filter(video => video.creatorId === ahs.id);
const ahsMods = ahsVideos.flatMap(video => video.mods);
assert.equal(ahsVideos.length, 29);
assert.equal(ahsMods.length, 370);
const ahsLinkedMentions = ahsMods.filter(mod => mod.providerLinks.length > 0).length;
const ahsLinkedCanonical = new Set(ahsMods.filter(mod => mod.providerLinks.length > 0).map(mod => mod.canonicalProjectId)).size;
assert.equal(ahsLinkedMentions, 370);
assert.equal(ahsLinkedCanonical, 273);

const may17 = ahsVideos.find(video => video.id === 'youtube:HtuPWLLol-k');
const may6 = ahsVideos.find(video => video.id === 'youtube:GvZCVqJtse0');
assert(may17 && may6, 'both chunk 16 videos must load');
assert.deepEqual([may17.publishedAt, may6.publishedAt], ['2025-05-17', '2025-05-06']);
assert.deepEqual([may17.mods.length, may6.mods.length], [10, 8]);
const freshMods = [...may17.mods, ...may6.mods];
assert.equal(freshMods.length, 18);
for (const mod of freshMods) {
  assert(mod.name && mod.canonicalProjectId, `canonical project required: ${mod.name}`);
  assert(mod.providerLinks.length > 0, `verified direct project home required: ${mod.name}`);
}

const may17Times = [20, 50, 70, 95, 115, 133, 152, 185, 216, 236];
assert.deepEqual(may17.mods.map(mod => mod.timestampSeconds), may17Times);
for (const mod of may17.mods) assert(mod.videoLink.includes(`t=${mod.timestampSeconds}s`), `timestamp deep link required: ${mod.name}`);
const loader = name => may17.mods.find(mod => mod.name === name).loader;
assert.deepEqual(loader('Mine Cells'), ['Fabric']);
assert.deepEqual(loader('Scout'), ['Fabric']);
assert.deepEqual(loader('Gliders'), ['Forge', 'Fabric']);
assert.deepEqual(loader('Stamina'), ['Forge']);
assert.deepEqual(loader("Archer's Paradox"), ['Forge']);
assert.deepEqual(loader("YUNG's Cave Biomes"), ['Forge', 'Fabric']);
assert.deepEqual(loader("Alex's Caves"), ['Forge']);
assert.deepEqual(loader('Tetra'), ['Forge']);
assert.deepEqual(loader('Speed Building'), ['Forge']);
assert.deepEqual(loader('Ribbits'), ['Forge', 'Fabric']);
for (const mod of may6.mods) {
  assert.equal(mod.timestampSeconds, null, `May 6 timestamp must remain absent: ${mod.name}`);
  assert.equal(mod.videoLink, may6.url, `untimestamped May 6 source must use base video URL: ${mod.name}`);
  assert(!mod.videoLink.includes('t=0s'), `fake zero-second deep link forbidden: ${mod.name}`);
}

const canonical = name => freshMods.find(mod => mod.name === name).canonicalProjectId;
const expectedCanonical = new Map([
  ['Mine Cells','minecells'], ['Scout','scout'], ['Gliders','gliders'], ['Stamina','stamina'], ["Archer's Paradox",'archers-paradox'],
  ["YUNG's Cave Biomes",'yung-s-cave-biomes'], ["Alex's Caves",'alexs-caves'], ['Tetra','tetra'], ['Speed Building','speed-building'], ['Ribbits','ribbits'],
  ['Conquest Reforged Modpack','conquest-reforged-modpack'], ['Ambient Sounds','ambientsounds'], ['Auto HUD','auto-hud'], ['Camera Utils','camera-utils'],
  ['Camera Overhaul','cameraoverhaul'], ['First-person Model','first-person-model'], ["Leawind's Third Person",'leawind-third-person'], ['Passable Foliage','passable-foliage']
]);
for (const [name, id] of expectedCanonical) assert.equal(canonical(name), id, `canonical identity: ${name}`);

const project = id => vault.projects.find(item => item.id === id);
const links = id => project(id).providerLinks;
const providers = id => new Set(links(id).map(link => link.provider));
const hasUrl = (id, url) => links(id).some(link => link.url === url);
for (const id of ['minecells','scout','gliders','alexs-caves','tetra','ribbits','cameraoverhaul']) {
  const p = providers(id);
  assert(p.has('Modrinth') && p.has('CurseForge') && p.has('GitHub'), `${id} must expose Modrinth + CurseForge + GitHub`);
}
assert.deepEqual([...providers('stamina')].sort(), ['CurseForge','GitHub']);
assert(providers('archers-paradox').has('Modrinth') && providers('archers-paradox').has('CurseForge'));
assert(hasUrl('speed-building', 'https://www.curseforge.com/minecraft/mc-mods/scaffolding-behavior'));
assert.equal(links('conquest-reforged-modpack').length, 4);
assert.equal(links('conquest-reforged-modpack').filter(link => link.provider === 'Modrinth').length, 2);
assert.equal(links('conquest-reforged-modpack').filter(link => link.provider === 'CurseForge').length, 2);
assert(hasUrl('conquest-reforged-modpack', 'https://modrinth.com/modpack/conquest-reforged-modpack'));
assert(hasUrl('conquest-reforged-modpack', 'https://modrinth.com/modpack/conquest-reforged-modpack-%28forge%29'));
assert(hasUrl('first-person-model', 'https://modrinth.com/mod/first-person-model'));
assert(hasUrl('first-person-model', 'https://github.com/tr7zw/FirstPersonModel'));
assert(hasUrl('yung-s-cave-biomes', 'https://www.curseforge.com/minecraft/mc-mods/yungs-cave-biomes-fabric'));
assert(hasUrl('alexs-caves', 'https://github.com/AlexModGuy/AlexsCaves'));
assert(!links('alexs-caves').some(link => /continued|unofficial|rad/i.test(link.url + ' ' + link.label)), 'Alexs Caves forks must not merge');
assert(!links('gliders').some(link => /\/mod\/gliding\/?$/i.test(link.url)), 'Gliding must not merge into Gliders');
assert(!links('cameraoverhaul').some(link => /camera-overhaul-forge/i.test(link.url)), 'old separate Camera Overhaul Forge port must not merge');

const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const related = raw.videos.flatMap(video => video.relatedLinkedEvidence || []);
assert.equal(related.length, 1);
assert.equal(related[0].sourceLabel, 'Custom Maps by RedRangerBuilds');
assert.equal(related[0].url, 'https://www.planetminecraft.com/member/redrangerbuilds/');
assert.equal(related[0].status, 'related-content-not-canonicalized');
assert.deepEqual(related[0].names, ['Miremouth','Ager Aureus','Elderglen','Silverbough Forest','Willowmarsh','Evervale']);

const rendered = renderCatalog({ id:'creator-vault-qa-ahs16', name:'Creator Vault QA AsianHalfSquat 16', items:[], assets:{}, documents:[], sources:[] }, root);
for (const needle of [
  'youtube:HtuPWLLol-k','Mine Cells','Scout','Gliders',"Archer's Paradox","Alex's Caves",'Tetra','Ribbits',
  'youtube:GvZCVqJtse0','Conquest Reforged Modpack','Camera Overhaul','First-person Model',
  'https://github.com/mim1q/MineCells','https://github.com/Cynosphere-mc/Scout','https://github.com/AlexModGuy/AlexsCaves',
  'https://github.com/yungnickyoung/Ribbits','https://www.curseforge.com/minecraft/mc-mods/yungs-cave-biomes-fabric',
  'https://modrinth.com/modpack/conquest-reforged-modpack','Find in Enderloom'
]) assert(rendered.html.includes(needle), `rendered AsianHalfSquat chunk 16 output missing ${needle}`);

console.log(`Creator Vault AsianHalfSquat chunk 16 QA passed: ${vault.stats.recommendations} mentions -> ${vault.stats.uniqueProjects} canonical projects; ${vault.stats.verifiedProjects} linked / ${vault.stats.providerDestinations} destinations / ${vault.stats.multiProviderProjects} multi-provider / ${vault.stats.unresolvedProjects} unresolved. AHS linked mentions=${ahsLinkedMentions}/370 across ${ahsLinkedCanonical} canonical projects; six RedRangerBuilds maps remain related source evidence only.`);
