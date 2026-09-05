'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');
const { renderCatalog } = require('../src/catalog-renderer');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'catalog', 'creator-vault', 'recommendation-sources', 'asianhalfsquat.history-batch26.json');
const providerPath = path.join(root, 'catalog', 'creator-vault', 'project-sources', 'provider-closure-26a-asianhalfsquat.json');
const creatorsPath = path.join(root, 'catalog', 'creator-vault', 'creators.json');
const chunk25CreatorsBaselinePath = path.join(root, 'catalog', 'creator-vault', 'research', 'creators.chunk25-baseline.json');
const candidatesPath = path.join(root, 'catalog', 'creator-vault', 'research', 'asianhalfsquat.chunk26-provider-candidates.json');
const researchPath = path.join(root, 'catalog', 'creator-vault', 'research', 'asianhalfsquat.chunk26-source.json');

// Prove chunk 25 byte-for-byte first. Hide only chunk 26 production files,
// swap only the frozen creator ledger, execute the exact chunk-25 wrapper,
// and restore current state in finally before enforcing chunk 26.
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-ahs26-qa-'));
let sourceBackup = null;
let providerBackup = null;
let currentCreatorsBackup = null;
let chunk25Runtime = null;
try {
  assert(fs.existsSync(sourcePath), 'AsianHalfSquat chunk 26 production source file missing');
  assert(fs.existsSync(providerPath), 'AsianHalfSquat chunk 26 provider overlay missing');
  assert(fs.existsSync(creatorsPath), 'current creators ledger must exist');
  assert(fs.existsSync(chunk25CreatorsBaselinePath), 'chunk 25 creators baseline must exist');
  sourceBackup = path.join(tempDir, path.basename(sourcePath));
  providerBackup = path.join(tempDir, path.basename(providerPath));
  currentCreatorsBackup = path.join(tempDir, 'creators.current.json');
  fs.renameSync(sourcePath, sourceBackup);
  fs.renameSync(providerPath, providerBackup);
  fs.renameSync(creatorsPath, currentCreatorsBackup);
  fs.copyFileSync(chunk25CreatorsBaselinePath, creatorsPath);
  chunk25Runtime = loadCreatorVault(root);
  assert.equal(chunk25Runtime.stats.recommendations, 804);
  assert.equal(chunk25Runtime.stats.uniqueProjects, 580);
  const preexistingRrls = chunk25Runtime.projects.find(project => project.id === 'remove-reloading-screen');
  assert(preexistingRrls, 'Remove Reloading Screen must already exist in frozen chunk-25 canonical registry');
  assert(preexistingRrls.providerLinks.some(link => link.url === 'https://modrinth.com/mod/rrls'));
  const legacy = spawnSync(process.execPath, [path.join(__dirname, 'creator-vault-qa-chunk25.js')], { cwd: root, stdio: 'inherit' });
  assert.equal(legacy.status, 0, 'chunk 25 baseline regression suite must remain green byte-for-byte');
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
assert.equal(vault.videos.length, 53, '3 Kreksu + 44 AsianHalfSquat + 6 EnderVerse videos');
assert.equal(vault.stats.recommendations, 814, '804 prior mentions + 10 AsianHalfSquat history batch 26 mentions');
assert.equal(vault.stats.uniqueProjects, 585, 'chunk 26 adds five globally new projects; Remove Loading Screen reuses existing RRLS');
assert.equal(vault.projects.reduce((sum, project) => sum + project.mentionCount, 0), 814, 'every source mention survives canonicalization');
assert.equal(vault.stats.verifiedProjects, 583);
assert.equal(vault.stats.unresolvedProjects, 2);
assert.equal(vault.stats.multiProviderProjects, 400);
assert.equal(vault.stats.providerDestinations, 1099);
assert.equal(vault.stats.nativeRecommendationSources, 22);
assert.deepEqual(vault.projects.filter(project => !project.providerLinks.length).map(project => project.name).sort(), ['Better Book Recipe', 'Plank and Junk']);
assert.equal(vault.diagnostics.filter(item => item.level === 'error').length, 0);

const ahs = vault.creators.find(creator => creator.id === 'youtube:asianhalfsquat');
assert(ahs);
assert.equal(ahs.coverage.expectedVideos, 350);
assert.equal(ahs.coverage.indexedVideos, 44);
assert.equal(ahs.coverage.recommendationCount, 555);
assert.equal(ahs.coverage.verifiedProjectHomes, 555);
const ahsVideos = vault.videos.filter(video => video.creatorId === ahs.id);
const ahsMods = ahsVideos.flatMap(video => video.mods);
assert.equal(ahsVideos.length, 44);
assert.equal(ahsMods.length, 555);
const ahsLinkedMentions = ahsMods.filter(mod => mod.providerLinks.length > 0).length;
const ahsLinkedCanonical = new Set(ahsMods.filter(mod => mod.providerLinks.length > 0).map(mod => mod.canonicalProjectId)).size;
const ahsAllCanonical = new Set(ahsMods.map(mod => mod.canonicalProjectId)).size;
assert.equal(ahsLinkedMentions, 555);
assert.equal(ahsLinkedCanonical, 363);
assert.equal(ahsAllCanonical, 363);

const video = ahsVideos.find(item => item.id === 'youtube:bd83XKp65jw');
assert(video, 'chunk 26 September 4 source video must load');
assert.equal(video.publishedAt, '2024-09-04');
assert.equal(video.title, 'Top 10 Minecraft Mods (1.21.1) - 2024');
assert.equal(video.mods.length, 10);
const expected = new Map([
  ['Dungeons and Taverns', { id:'dungeons-and-taverns', seconds:14, loaders:['NeoForge','Fabric'] }],
  ['Relics', { id:'relics', seconds:38, loaders:['NeoForge'] }],
  ['Cascades', { id:'cascades', seconds:69, loaders:['NeoForge','Fabric'] }],
  ['Remove Loading Screen', { id:'remove-reloading-screen', seconds:91, loaders:['NeoForge','Fabric'] }],
  ['Chalk', { id:'chalk', seconds:118, loaders:['NeoForge'] }],
  ['Laser Bridges & Doors', { id:'laser-bridges-and-doors', seconds:140, loaders:['NeoForge','Fabric'] }],
  ['Solar Cooker', { id:'solar-cooker', seconds:161, loaders:['NeoForge','Fabric'] }],
  ['Antique Atlas 4', { id:'antique-atlas-4', seconds:187, loaders:['NeoForge','Fabric'] }],
  ['Particular', { id:'particular', seconds:224, loaders:['Fabric'] }],
  ['The Undergarden', { id:'the-undergarden', seconds:249, loaders:['NeoForge'] }]
]);
for (const mod of video.mods) {
  const row = expected.get(mod.name);
  assert(row, `unexpected chunk-26 source label: ${mod.name}`);
  assert.equal(mod.canonicalProjectId, row.id, `canonical identity: ${mod.name}`);
  assert.equal(mod.timestampSeconds, row.seconds, `creator timestamp: ${mod.name}`);
  assert.deepEqual(mod.loader, row.loaders, `creator-stated loader labels: ${mod.name}`);
  assert.equal(mod.videoLink, `${video.url}&t=${row.seconds}s`, `exact creator deep link: ${mod.name}`);
}
assert.equal(new Set(video.mods.map(mod => mod.canonicalProjectId)).size, 10);
assert.equal(video.mods.find(mod => mod.name === 'Dungeons and Taverns').canonicalProjectType, 'datapack');
assert.equal(video.mods.find(mod => mod.name === 'Cascades').canonicalProjectType, 'datapack');

const project = id => {
  const hit = vault.projects.find(item => item.id === id);
  assert(hit, `canonical project missing: ${id}`);
  return hit;
};
const links = id => project(id).providerLinks;
const providers = id => [...new Set(links(id).map(link => link.provider))].sort();
const hasUrl = (id, url) => links(id).some(link => link.url === url);
assert.deepEqual(providers('dungeons-and-taverns'), ['CurseForge','Modrinth']);
assert.deepEqual(providers('relics'), ['CurseForge','GitHub','Modrinth']);
assert.deepEqual(providers('cascades'), ['GitHub','Modrinth']);
assert.deepEqual(providers('remove-reloading-screen'), ['CurseForge','GitHub','Modrinth']);
assert.deepEqual(providers('chalk'), ['CurseForge','Modrinth']);
assert.deepEqual(providers('laser-bridges-and-doors'), ['CurseForge','GitHub','Modrinth']);
assert.deepEqual(providers('solar-cooker'), ['CurseForge','GitHub','Modrinth']);
assert.deepEqual(providers('antique-atlas-4'), ['CurseForge','GitHub','Modrinth']);
assert.deepEqual(providers('particular'), ['GitHub','Modrinth']);
assert.deepEqual(providers('the-undergarden'), ['CurseForge','GitHub','Modrinth']);
assert(hasUrl('relics','https://modrinth.com/mod/relics-mod'));
assert(hasUrl('relics','https://www.curseforge.com/minecraft/mc-mods/relics-mod'));
assert(hasUrl('relics','https://github.com/Octo-Studios/relics'));
assert(hasUrl('cascades','https://modrinth.com/datapack/hybrid-beta'));
assert(hasUrl('cascades','https://github.com/Crystalis7/Hybrid-Beta'));
assert(hasUrl('remove-reloading-screen','https://modrinth.com/mod/rrls'));
assert(hasUrl('remove-reloading-screen','https://www.curseforge.com/minecraft/mc-mods/rrls'));
assert(hasUrl('remove-reloading-screen','https://github.com/dima-dencep/rrls'));
assert(project('remove-reloading-screen').aliases.includes('Remove Loading Screen'), 'creator historical wording must remain an RRLS alias');
assert(hasUrl('laser-bridges-and-doors','https://modrinth.com/mod/laser-bridges-and-doors'));
assert(hasUrl('laser-bridges-and-doors','https://www.curseforge.com/minecraft/mc-mods/laser-bridges-doors'));
assert(hasUrl('laser-bridges-and-doors','https://github.com/Mars-The-Planet/Laser-Bridges-And-Doors'));
assert(hasUrl('solar-cooker','https://modrinth.com/mod/solar-cooker'));
assert(hasUrl('solar-cooker','https://www.curseforge.com/minecraft/mc-mods/solar-cooker'));
assert(hasUrl('solar-cooker','https://github.com/cech12/SolarCooker'));
assert(hasUrl('antique-atlas-4','https://modrinth.com/mod/antique-atlas-4'));
assert(hasUrl('antique-atlas-4','https://www.curseforge.com/minecraft/mc-mods/antique-atlas-4'));
assert(hasUrl('antique-atlas-4','https://github.com/sleepingdragoninn/antique-atlas'));
assert(hasUrl('the-undergarden','https://modrinth.com/mod/the-undergarden'));
assert(hasUrl('the-undergarden','https://www.curseforge.com/minecraft/mc-mods/the-undergarden'));
assert(hasUrl('the-undergarden','https://github.com/quek04/undergarden'));

// Anti-false-merge guards.
assert(!vault.projects.some(item => item.id === 'remove-loading-screen'), 'historical source wording must not create a duplicate Remove Loading Screen canonical card');
assert(!links('remove-reloading-screen').some(link => /forcecloseworldloadingscreen|force-close-loading-screen|no-loading-screen/i.test(link.url)), 'same-purpose loading-screen projects must not be merged into RRLS');
assert(!links('cascades').some(link => /curseforge\.com\/minecraft\/mc-mods\/hybrid-terrain/i.test(link.url)), 'later Cascades CF Reupload must remain excluded');
assert(hasUrl('antique-atlas-4','https://github.com/sleepingdragoninn/antique-atlas'), 'Antique Atlas 4 source lineage must be pinned exactly');

const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const rawVideo = raw.videos.find(item => item.id === 'youtube:bd83XKp65jw');
assert(rawVideo && rawVideo.mods.length === 10);
assert.deepEqual(rawVideo.excludedEvidence.map(item => [item.sourceLabel,item.status]), [
  ['Bliss Shaders','supporting-project-not-top10'],
  ['Minecraft Forge','platform-link-not-project'],
  ['Fabric','platform-link-not-project'],
  ['Minecraft Volume Beta - Aria Math','non-project']
]);
for (const mod of rawVideo.mods) {
  const row = expected.get(mod.name);
  assert(row);
  assert.equal(mod.timestampSeconds, row.seconds);
  assert.deepEqual(mod.loader, row.loaders);
}

const research = JSON.parse(fs.readFileSync(researchPath, 'utf8'));
assert.equal(research.videos.length, 1);
assert.equal(research.sourceMentions, 10);
const gap = (research.unresolvedChronology || []).find(item => item.publishedAt === '2024-09-06');
assert(gap, 'September 6 chronology gap must remain explicit');
assert.equal(gap.analyticsTitleFragment, 'The Best Minecraft Mods T..');
assert.equal(gap.status, 'source-identity-pending');
assert.deepEqual(gap.observedStats, { views:243130, likes:10811, comments:391 });

const providerRaw = JSON.parse(fs.readFileSync(providerPath, 'utf8'));
assert.equal(providerRaw.entries.length, 7);
assert.equal(providerRaw.entries.reduce((sum, entry) => sum + entry[4].length, 0), 19);
assert.deepEqual(providerRaw.entries.filter(entry => entry[4].length === 0), []);
assert.deepEqual(providerRaw.entries.map(entry => entry[0]).sort(), ['antique-atlas-4','cascades','laser-bridges-and-doors','relics','remove-reloading-screen','solar-cooker','the-undergarden']);
const candidates = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'));
assert.equal(candidates.entries.length, 7);
assert.equal(candidates.entries.reduce((sum, entry) => sum + entry[4].length, 0), 19);
assert.deepEqual(candidates.entries.filter(entry => entry[4].length === 0), []);
assert.deepEqual(candidates.entries.map(entry => entry[0]).sort(), ['antique-atlas-4','cascades','laser-bridges-and-doors','relics','remove-reloading-screen','solar-cooker','the-undergarden']);

const rendered = renderCatalog({ id:'creator-vault-qa-ahs26', name:'Creator Vault QA AsianHalfSquat 26', items:[], assets:{}, documents:[], sources:[] }, root);
for (const needle of [
  'youtube:bd83XKp65jw','Dungeons and Taverns','Relics','Cascades','Remove Loading Screen','Remove Reloading Screen','Chalk','Laser Bridges & Doors','Solar Cooker','Antique Atlas 4','Particular','The Undergarden',
  'https://github.com/Octo-Studios/relics','https://github.com/Crystalis7/Hybrid-Beta','https://github.com/dima-dencep/rrls','https://github.com/Mars-The-Planet/Laser-Bridges-And-Doors','https://github.com/cech12/SolarCooker','https://github.com/sleepingdragoninn/antique-atlas','https://github.com/quek04/undergarden','Find in Enderloom'
]) assert(rendered.html.includes(needle), `rendered AsianHalfSquat chunk 26 output missing ${needle}`);

console.log(`Creator Vault AsianHalfSquat chunk 26 QA passed: ${vault.stats.recommendations} mentions -> ${vault.stats.uniqueProjects} canonical projects; ${vault.stats.verifiedProjects} linked / ${vault.stats.providerDestinations} destinations / ${vault.stats.multiProviderProjects} multi-provider / ${vault.stats.unresolvedProjects} unresolved. AHS linked mentions=${ahsLinkedMentions}/555 across ${ahsLinkedCanonical} canonical projects; all 10 creator chapter timestamps/deep links, 5-new/5-reuse canonicalization with Remove Loading Screen -> existing RRLS, Sep-6 chronology gap, 7-card/19-destination provider closure, and recursive chunk-25 baseline are locked.`);
