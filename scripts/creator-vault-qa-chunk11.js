'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');
const { renderCatalog } = require('../src/catalog-renderer');

const root = path.resolve(__dirname, '..');
const chunk11Paths = [
  path.join(root, 'catalog', 'creator-vault', 'recommendation-sources', 'asianhalfsquat.rss-batch11.json'),
  ...'abc'.split('').map(suffix => path.join(root, 'catalog', 'creator-vault', 'project-sources', `provider-closure-11${suffix}-asianhalfsquat.json`))
];
const creatorsPath = path.join(root, 'catalog', 'creator-vault', 'creators.json');
const episode5CreatorsBaselinePath = path.join(root, 'catalog', 'creator-vault', 'research', 'creators.episode5-baseline.json');

// Prove the exact Episode-5 checkpoint before testing chunk 11. Only the four
// chunk-11 production shards and the current creator ledger are hidden here.
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-ahs11-qa-'));
const moved = [];
let currentCreatorsBackup = null;
try {
  for (const file of chunk11Paths) {
    assert(fs.existsSync(file), `AsianHalfSquat chunk 11 production file missing: ${path.relative(root, file)}`);
    const target = path.join(tempDir, path.basename(file));
    fs.renameSync(file, target);
    moved.push([file, target]);
  }
  assert(fs.existsSync(creatorsPath), 'current creators ledger must exist');
  assert(fs.existsSync(episode5CreatorsBaselinePath), 'Episode 5 creators baseline must exist');
  currentCreatorsBackup = path.join(tempDir, 'creators.current.json');
  fs.renameSync(creatorsPath, currentCreatorsBackup);
  fs.copyFileSync(episode5CreatorsBaselinePath, creatorsPath);

  const legacy = spawnSync(process.execPath, [path.join(__dirname, 'creator-vault-qa-episode5.js')], { cwd: root, stdio: 'inherit' });
  assert.equal(legacy.status, 0, 'Episode 5 baseline regression suite must remain green byte-for-byte');
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
assert.equal(vault.videos.length, 28, '3 Kreksu + 19 AsianHalfSquat + 6 EnderVerse videos');
assert.equal(vault.stats.recommendations, 507, '475 prior mentions + 32 AsianHalfSquat RSS batch 11 mentions');
assert.equal(vault.stats.uniqueProjects, 435, '507 mentions must merge to exactly 435 canonical projects');
assert.equal(vault.projects.reduce((sum, project) => sum + project.mentionCount, 0), 507, 'every source mention survives canonicalization');
assert.equal(vault.stats.verifiedProjects, 433);
assert.equal(vault.stats.unresolvedProjects, 2);
assert.equal(vault.stats.multiProviderProjects, 250);
assert.equal(vault.stats.providerDestinations, 721);
assert.equal(vault.stats.nativeRecommendationSources, 7);
assert.deepEqual(vault.projects.filter(project => !project.providerLinks.length).map(project => project.name).sort(), ['Better Book Recipe', 'Plank and Junk']);
assert.equal(vault.diagnostics.filter(item => item.level === 'error').length, 0);

const ender = vault.creators.find(creator => creator.id === 'youtube:enderversemc');
assert(ender);
assert.equal(ender.coverage.indexedVideos, 6);
assert.equal(ender.coverage.recommendationCount, 229);
assert.equal(ender.coverage.verifiedProjectHomes, 227);

const ahs = vault.creators.find(creator => creator.id === 'youtube:asianhalfsquat');
assert(ahs);
assert.equal(ahs.coverage.expectedVideos, 350, 'official channel evidence advances the stale 349-video target to 350');
assert.equal(ahs.coverage.indexedVideos, 19);
assert.equal(ahs.coverage.recommendationCount, 248);
assert.equal(ahs.coverage.verifiedProjectHomes, 248, 'all currently indexed AsianHalfSquat mentions have verified direct project homes');
const ahsVideos = vault.videos.filter(video => video.creatorId === ahs.id);
assert.equal(ahsVideos.length, 19);
const ahsMods = ahsVideos.flatMap(video => video.mods);
assert.equal(ahsMods.length, 248);
const ahsLinkedMentions = ahsMods.filter(mod => mod.providerLinks.length > 0).length;
const ahsLinkedCanonical = new Set(ahsMods.filter(mod => mod.providerLinks.length > 0).map(mod => mod.canonicalProjectId)).size;
assert.equal(ahsLinkedMentions, 248, 'all 248 indexed AsianHalfSquat mentions must resolve to a verified project home');
assert.equal(ahsLinkedCanonical, 192, 'AsianHalfSquat linked mentions must collapse to exactly 192 canonical projects');

const freshIds = ['youtube:suH-0zIiLU4', 'youtube:VW9z8XZaOqU', 'youtube:_zcMnVEWhfQ'];
const fresh = freshIds.map(id => ahsVideos.find(video => video.id === id));
assert(fresh.every(Boolean), 'all three RSS batch 11 videos must load');
assert.deepEqual(fresh.map(video => video.mods.length), [10, 13, 9]);
assert.deepEqual(fresh.map(video => video.publishedAt), ['2026-08-28', '2026-01-16', '2026-01-09']);
const freshMods = fresh.flatMap(video => video.mods);
assert.equal(freshMods.length, 32);
for (const mod of freshMods) {
  assert(mod.name && mod.canonicalProjectId, `canonical project required: ${mod.name}`);
  assert(mod.providerLinks.length > 0, `verified direct project home required: ${mod.name}`);
}

const jan16 = fresh[1];
assert(jan16.mods.every(mod => mod.timestampSeconds === null), 'January 16 feature-list projects must preserve genuinely absent timestamps');
assert(jan16.mods.every(mod => mod.videoLink === jan16.url), 'untimestamped January 16 projects must use the base video URL');
for (const video of [fresh[0], fresh[2]]) {
  const timestamps = video.mods.map(mod => mod.timestampSeconds);
  assert(timestamps.every(Number.isFinite), `${video.id} chapter timestamps must remain numeric`);
  assert(timestamps.every((value, index) => index === 0 || value >= timestamps[index - 1]), `${video.id} chapter timestamps must be nondecreasing`);
  assert(video.mods.every(mod => mod.videoLink.includes(`t=${mod.timestampSeconds}s`)), `${video.id} timestamp deep links must be preserved`);
}

const existingIds = new Set(['voxy', 'distant-horizons', 'sodium', 'iris', 'chunky', 'tectonic', 'terralith', 'fps-overlay', 'shoulder-surfing-reloaded', 'presence-footsteps']);
const expectedNewIds = new Set([
  'streams-reflowing', 'grassier-grass', 'spider-overhaul', 'fancy-world-animations', 'advanced-hook-launchers',
  'epic-structures-villages', 'irissearch', 'enchanted-fishing-line', 'advanced-chimneys', 'ji-afk-cinematic',
  'william-wythers-overhauled-overworld', 'ambientsounds', 'do-a-barrel-roll', 'undermod', 'pillager-caravans',
  'fractal-forests', 'enchanting-system-overhaul', 'pomkots-mechs', 'aleki-s-nifty-ships',
  'countered-s-accurate-hitboxes', 'destroying-mc', 'vanilla-skygrid'
]);
assert.equal(new Set(freshMods.filter(mod => existingIds.has(mod.canonicalProjectId)).map(mod => mod.canonicalProjectId)).size, 10, 'exactly ten batch-11 mentions reuse existing canonical cards');
assert.deepEqual(new Set(freshMods.filter(mod => !existingIds.has(mod.canonicalProjectId)).map(mod => mod.canonicalProjectId)), expectedNewIds, 'the remaining 22 batch-11 projects must be genuinely new canonical identities');

for (const id of ['distant-horizons', 'tectonic', 'fps-overlay', 'presence-footsteps']) {
  const project = vault.projects.find(item => item.id === id);
  assert(project && project.providerLinks.some(link => link.provider === 'Modrinth'), `${id} must gain its creator-linked Modrinth home`);
}
assert.deepEqual(vault.projects.find(project => project.id === 'grassier-grass').providerLinks.map(link => link.provider), ['Modrinth']);
assert.deepEqual(vault.projects.find(project => project.id === 'ji-afk-cinematic').providerLinks.map(link => link.provider), ['Modrinth']);
assert.deepEqual(vault.projects.find(project => project.id === 'vanilla-skygrid').providerLinks.map(link => link.provider), ['Modrinth']);
const fwa = vault.projects.find(project => project.id === 'fancy-world-animations');
assert(fwa && ['CurseForge', 'GitHub', 'Modrinth'].every(provider => fwa.providerLinks.some(link => link.provider === provider)));
const wwoo = vault.projects.find(project => project.id === 'william-wythers-overhauled-overworld');
assert(wwoo && ['CurseForge', 'GitHub', 'Modrinth'].every(provider => wwoo.providerLinks.some(link => link.provider === provider)));
const barrel = vault.projects.find(project => project.id === 'do-a-barrel-roll');
assert(barrel && ['CurseForge', 'GitHub', 'Modrinth', 'Official'].every(provider => barrel.providerLinks.some(link => link.provider === provider)));

const rendered = renderCatalog({ id: 'creator-vault-qa-ahs11', name: 'Creator Vault QA AsianHalfSquat 11', items: [], assets: {}, documents: [], sources: [] }, root);
for (const needle of [
  'youtube:suH-0zIiLU4', 'Streams Reflowing', 'Grassier Grass', 'youtube:VW9z8XZaOqU',
  "William Wythers' Overhauled Overworld", 'youtube:_zcMnVEWhfQ', 'Vanilla SkyGrid',
  'https://modrinth.com/mod/grassier-grass', 'https://github.com/maDU59/FancyWorldAnimations',
  'https://codeberg.org/enjarai/do-a-barrel-roll', 'Find in Enderloom'
]) assert(rendered.html.includes(needle), `rendered AsianHalfSquat batch 11 output missing ${needle}`);

console.log(`Creator Vault AsianHalfSquat chunk 11 QA passed: ${vault.stats.recommendations} mentions -> ${vault.stats.uniqueProjects} canonical projects; ${vault.stats.verifiedProjects} linked / ${vault.stats.providerDestinations} destinations / ${vault.stats.multiProviderProjects} multi-provider / ${vault.stats.unresolvedProjects} unresolved. AHS linked mentions=${ahsLinkedMentions}/248 across ${ahsLinkedCanonical} canonical projects.`);
