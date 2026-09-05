'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');
const { renderCatalog } = require('../src/catalog-renderer');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'catalog', 'creator-vault', 'recommendation-sources', 'asianhalfsquat.history-batch20.json');
const providerPath = path.join(root, 'catalog', 'creator-vault', 'project-sources', 'provider-closure-20a-asianhalfsquat.json');
const chunk20Paths = [sourcePath, providerPath];
const creatorsPath = path.join(root, 'catalog', 'creator-vault', 'creators.json');
const chunk19CreatorsBaselinePath = path.join(root, 'catalog', 'creator-vault', 'research', 'creators.chunk19-baseline.json');

// Freeze every older acceptance checkpoint: hide only chunk 20, swap only the
// chunk-19 creator ledger, run the exact frozen chunk-19 wrapper, then restore.
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-ahs20-qa-'));
const moved = [];
let currentCreatorsBackup = null;
try {
  for (const file of chunk20Paths) {
    assert(fs.existsSync(file), `AsianHalfSquat chunk 20 production file missing: ${path.relative(root, file)}`);
    const target = path.join(tempDir, path.basename(file));
    fs.renameSync(file, target);
    moved.push([file, target]);
  }
  assert(fs.existsSync(creatorsPath), 'current creators ledger must exist');
  assert(fs.existsSync(chunk19CreatorsBaselinePath), 'chunk 19 creators baseline must exist');
  currentCreatorsBackup = path.join(tempDir, 'creators.current.json');
  fs.renameSync(creatorsPath, currentCreatorsBackup);
  fs.copyFileSync(chunk19CreatorsBaselinePath, creatorsPath);
  const legacy = spawnSync(process.execPath, [path.join(__dirname, 'creator-vault-qa-chunk19.js')], { cwd: root, stdio: 'inherit' });
  assert.equal(legacy.status, 0, 'chunk 19 baseline regression suite must remain green byte-for-byte');
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
assert.equal(vault.videos.length, 46, '3 Kreksu + 37 AsianHalfSquat + 6 EnderVerse videos');
assert.equal(vault.stats.recommendations, 739, '720 prior mentions + 19 AsianHalfSquat history batch 20 mentions');
assert.equal(vault.stats.uniqueProjects, 551);
assert.equal(vault.projects.reduce((sum, project) => sum + project.mentionCount, 0), 739, 'every source mention survives canonicalization');
assert.equal(vault.stats.verifiedProjects, 549);
assert.equal(vault.stats.unresolvedProjects, 2);
assert.equal(vault.stats.multiProviderProjects, 369);
assert.equal(vault.stats.providerDestinations, 1014);
assert.equal(vault.stats.nativeRecommendationSources, 16);
assert.deepEqual(vault.projects.filter(project => !project.providerLinks.length).map(project => project.name).sort(), ['Better Book Recipe', 'Plank and Junk']);
assert.equal(vault.diagnostics.filter(item => item.level === 'error').length, 0);

const ahs = vault.creators.find(creator => creator.id === 'youtube:asianhalfsquat');
assert(ahs);
assert.equal(ahs.coverage.expectedVideos, 350);
assert.equal(ahs.coverage.indexedVideos, 37);
assert.equal(ahs.coverage.recommendationCount, 480);
assert.equal(ahs.coverage.verifiedProjectHomes, 480);
const ahsVideos = vault.videos.filter(video => video.creatorId === ahs.id);
const ahsMods = ahsVideos.flatMap(video => video.mods);
assert.equal(ahsVideos.length, 37);
assert.equal(ahsMods.length, 480);
const ahsLinkedMentions = ahsMods.filter(mod => mod.providerLinks.length > 0).length;
const ahsLinkedCanonical = new Set(ahsMods.filter(mod => mod.providerLinks.length > 0).map(mod => mod.canonicalProjectId)).size;
assert.equal(ahsLinkedMentions, 480);
assert.equal(ahsLinkedCanonical, 323);

const top10 = ahsVideos.find(video => video.id === 'youtube:eJy6KJj8_m0');
const terrain = ahsVideos.find(video => video.id === 'youtube:W_Q6Vg-HtMM');
assert(top10 && terrain, 'both chunk 20 videos must load');
assert.deepEqual([top10.publishedAt, terrain.publishedAt], ['2024-12-22', '2024-12-17']);
assert.deepEqual([top10.mods.length, terrain.mods.length], [10, 9]);
const freshMods = [...top10.mods, ...terrain.mods];
assert.equal(freshMods.length, 19);
assert.equal(new Set(freshMods.map(mod => mod.canonicalProjectId)).size, 19);
for (const mod of freshMods) {
  assert(mod.name && mod.canonicalProjectId, `canonical project required: ${mod.name}`);
  assert(mod.providerLinks.length > 0, `verified direct project home required: ${mod.name}`);
  assert.equal(mod.timestampSeconds, null, `chunk 20 timestamp must remain absent: ${mod.name}`);
  const sourceVideo = top10.mods.includes(mod) ? top10 : terrain;
  assert.equal(mod.videoLink, sourceVideo.url, `untimestamped mention must use base video URL: ${mod.name}`);
  assert(!mod.videoLink.includes('t=0s'), `must never fabricate zero timestamp: ${mod.name}`);
}

const canonical = name => freshMods.find(mod => mod.name === name).canonicalProjectId;
const requiredMappings = new Map([
  ['Catenary','catenary'], ['Underground Bunkers','underground-bunkers'], ['Physics Toys','physics-toys'], ['Perception','perception'],
  ["Oh The Biomes We've Gone",'oh-the-biomes-weve-gone'], ['Flow','flow'], ["Countered's Terrain Slabs",'countereds-terrain-slabs'],
  ['Random Mob Sizes','random-mob-sizes'], ['Epic Terrain','epic-terrain'], ['Auroras','auroras'], ['AmpXtreme','ampxtreme'],
  ['Big Globe','big-globe'], ['Bliss Shader','bliss-shaders'], ['Complementary Shaders','complementary-shaders'],
  ['Distant Horizons','distant-horizons'], ['Do a Barrel Roll','do-a-barrel-roll'], ['Iris','iris'],
  ['JJThunder To The Max','jjthunder-to-the-max'], ['Natures Spirit','natures-spirit']
]);
assert.equal(requiredMappings.size, 19);
for (const [name, id] of requiredMappings) assert.equal(canonical(name), id, `canonical identity: ${name}`);

const project = id => vault.projects.find(item => item.id === id);
const links = id => project(id).providerLinks;
const providers = id => [...new Set(links(id).map(link => link.provider))].sort();
const hasUrl = (id, url) => links(id).some(link => link.url === url);
const expectProviders = (id, expected) => assert.deepEqual(providers(id), [...expected].sort(), `provider family: ${id}`);
expectProviders('catenary',['GitHub','Modrinth']);
expectProviders('underground-bunkers',['CurseForge','Modrinth']);
expectProviders('physics-toys',['GitHub','Modrinth']);
expectProviders('perception',['CurseForge','GitHub','Modrinth']);
expectProviders('oh-the-biomes-weve-gone',['CurseForge','GitHub','Modrinth']);
expectProviders('flow',['GitHub','Modrinth']);
expectProviders('countereds-terrain-slabs',['CurseForge','GitHub','Modrinth']);
expectProviders('random-mob-sizes',['GitHub','Modrinth']);
expectProviders('epic-terrain',['GitHub','Modrinth']);
expectProviders('auroras',['CurseForge','Modrinth']);
expectProviders('ampxtreme',['Modrinth']);
expectProviders('big-globe',['GitHub','Modrinth']);
expectProviders('bliss-shaders',['CurseForge','GitHub','Modrinth']);
expectProviders('complementary-shaders',['CurseForge','Modrinth']);
expectProviders('distant-horizons',['CurseForge','Modrinth','Official']);
expectProviders('do-a-barrel-roll',['CurseForge','GitHub','Modrinth','Official']);
expectProviders('iris',['CurseForge','GitHub','Modrinth']);
expectProviders('jjthunder-to-the-max',['CurseForge','Modrinth']);
expectProviders('natures-spirit',['CurseForge','GitHub','Modrinth']);
assert(hasUrl('physics-toys','https://github.com/Patbox/PhysicsToys'));
assert(hasUrl('big-globe','https://github.com/Builderb0y/BigGlobe'));
assert(hasUrl('bliss-shaders','https://modrinth.com/shader/bliss-shader'));
assert(hasUrl('bliss-shaders','https://github.com/X0nk/Bliss-Shader'));
assert(hasUrl('iris','https://github.com/IrisShaders/Iris'));
assert(hasUrl('distant-horizons','https://gitlab.com/distant-horizons-team/distant-horizons'));
assert(!links('distant-horizons').some(link => link.provider === 'GitHub'), 'Distant Horizons must use its real GitLab upstream, not a GitHub fork');
assert(hasUrl('natures-spirit','https://github.com/Team-Hibiscus/NaturesSpirit'));
assert.equal(vault.projects.filter(item => item.id === 'natures-spirit').length, 1, 'Nature\'s Spirit must remain one canonical card');
assert.equal(vault.projects.filter(item => item.id === 'bliss-shaders').length, 1, 'Bliss Shader must remain one canonical shader card');
assert.equal(project('natures-spirit').name, "Nature's Spirit");
assert.equal(project('bliss-shaders').name, 'Bliss Shaders');

const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const top10Raw = raw.videos.find(video => video.id === 'youtube:eJy6KJj8_m0');
assert(top10Raw);
const expectedVersions = new Map([
  ['Catenary','1.21.4'], ['Underground Bunkers','1.21.1'], ['Physics Toys','1.21.4'], ['Perception','1.21.1'],
  ["Oh The Biomes We've Gone",'1.21.1'], ['Flow','1.21.1'], ["Countered's Terrain Slabs",'1.21.3'],
  ['Random Mob Sizes','1.21.4'], ['Epic Terrain','1.21.3'], ['Auroras','1.21.3']
]);
for (const [name, version] of expectedVersions) {
  const mod = top10Raw.mods.find(item => item.name === name);
  assert(mod, `raw Top 10 source missing ${name}`);
  assert.equal(mod.versionLabel, version, `creator-stated version label: ${name}`);
  assert(!Object.prototype.hasOwnProperty.call(mod, 'timestampSeconds'), `raw Top 10 timestamp must stay omitted: ${name}`);
}
const providerRaw = JSON.parse(fs.readFileSync(providerPath, 'utf8'));
assert.equal(providerRaw.entries.length, 12);
const overlayIds = new Set(providerRaw.entries.map(entry => entry[0]));
for (const unchanged of ['ampxtreme','complementary-shaders','jjthunder-to-the-max']) assert(!overlayIds.has(unchanged), `${unchanged} must remain unchanged by chunk 20 overlay`);
const dhOverlay = providerRaw.entries.find(entry => entry[0] === 'distant-horizons');
assert(dhOverlay && dhOverlay[4].length === 1 && dhOverlay[4][0][0] === 'O', 'Distant Horizons overlay must add only the verified Official GitLab upstream');
assert.equal(dhOverlay[4][0][1], 'https://gitlab.com/distant-horizons-team/distant-horizons');

const rendered = renderCatalog({ id:'creator-vault-qa-ahs20', name:'Creator Vault QA AsianHalfSquat 20', items:[], assets:{}, documents:[], sources:[] }, root);
for (const needle of [
  'youtube:eJy6KJj8_m0','Catenary','Underground Bunkers','Random Mob Sizes','Epic Terrain','Auroras',
  'youtube:W_Q6Vg-HtMM','Big Globe','Bliss Shaders','Distant Horizons','Iris',"Nature's Spirit",
  'https://github.com/Builderb0y/BigGlobe','https://gitlab.com/distant-horizons-team/distant-horizons','https://github.com/Team-Hibiscus/NaturesSpirit','Find in Enderloom'
]) assert(rendered.html.includes(needle), `rendered AsianHalfSquat chunk 20 output missing ${needle}`);

console.log(`Creator Vault AsianHalfSquat chunk 20 QA passed: ${vault.stats.recommendations} mentions -> ${vault.stats.uniqueProjects} canonical projects; ${vault.stats.verifiedProjects} linked / ${vault.stats.providerDestinations} destinations / ${vault.stats.multiProviderProjects} multi-provider / ${vault.stats.unresolvedProjects} unresolved. AHS linked mentions=${ahsLinkedMentions}/480 across ${ahsLinkedCanonical} canonical projects; all 19 null timestamps, version-label fidelity, alias dedupe, and bounded provider enrichments are locked.`);
