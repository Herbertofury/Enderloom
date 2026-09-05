'use strict';
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { loadCreatorVault } = require('../src/creator-vault');
const { renderCatalog } = require('../src/catalog-renderer');

const root = path.resolve(__dirname, '..');
const vault = loadCreatorVault(root);

// Core corpus invariants.
assert.equal(vault.schemaVersion, 1, 'creator vault schema version');
assert.equal(vault.creators.length, 14, 'all tracked creators must remain present');
assert.equal(new Set(vault.creators.map(c => c.id)).size, 14, 'creator ids must be unique');
assert.equal(vault.stats.indexedCreators, 3, 'Kreksu, AsianHalfSquat and EnderVerse must be indexed');
assert.equal(vault.videos.length, 21, '3 Kreksu + 16 AsianHalfSquat + 2 EnderVerse videos');
assert.equal(vault.stats.recommendations, 311, 'all creator recommendation mentions must survive canonicalization');
assert.equal(vault.stats.uniqueProjects, 264, '311 mentions must merge to the established 264 canonical projects');
assert.equal(vault.projects.reduce((sum, project) => sum + project.mentionCount, 0), 311, 'canonical project index must preserve every mention');
assert.equal(vault.stats.verifiedProjects, 263, 'all public-project identities except the single no-public-page record must have direct homes');
assert.equal(vault.stats.unresolvedProjects, 1, 'exactly one source label has no discoverable public project page');
assert.equal(vault.stats.multiProviderProjects, 100, 'multi-provider coverage contract');
assert.equal(vault.stats.providerDestinations, 366, 'all verified direct destinations must be counted');
assert.deepEqual(vault.projects.filter(project => !project.providerLinks.length).map(project => project.name), ['Plank and Junk'], 'Plank and Junk is the sole explicit no-public-project-page exception');
assert.equal(vault.stats.importedCatalogs, 1, 'AsianHalfSquat pinned legacy import remains active');
assert.equal(vault.stats.nativeRecommendationSources, 2, 'primary recommendations + EnderVerse native source shard');
assert.equal(vault.channelSetupPacks.length, 5, 'Kreksu recurring setup packs remain separate');
assert.equal(vault.diagnostics.filter(row => row.level === 'error').length, 0, 'vault must load without errors');

// Canonical project and direct-link contract.
const canonicalIds = new Set(vault.projects.map(project => project.id));
assert.equal(canonicalIds.size, vault.projects.length, 'canonical project ids must be unique');
for (const project of vault.projects) {
  assert(project.name, `canonical project name required: ${project.id}`);
  assert(project.mentionCount > 0, `canonical project must retain source mentions: ${project.id}`);
  const urls = project.providerLinks.map(link => link.url);
  assert.equal(new Set(urls).size, urls.length, `provider URLs must not repeat inside ${project.id}`);
  for (const link of project.providerLinks) {
    assert(/^https:\/\//.test(link.url), `provider URL must be absolute HTTPS: ${project.id}`);
    assert(!/\/search(?:[/?#]|$)/i.test(link.url), `generic search pages are forbidden as direct homes: ${project.id}`);
    assert(link.provider, `provider label required: ${project.id}`);
  }
}
for (const video of vault.videos) {
  for (const mod of video.mods) {
    assert(mod.canonicalProjectId, `canonical identity required for ${mod.name}`);
    assert(canonicalIds.has(mod.canonicalProjectId), `mention must resolve to an indexed canonical project: ${mod.name}`);
  }
}

const solas = vault.projects.find(project => project.id === 'solas-shader');
assert(solas && solas.mentionCount === 7, 'Solas / Solas Shader / Solas Shaders must merge to one seven-mention card');
assert(solas.aliases.includes('Solas') && solas.aliases.includes('Solas Shaders'), 'Solas aliases must stay searchable');
const complementary = vault.projects.find(project => project.id === 'complementary-shaders');
assert(complementary && complementary.mentionCount === 5, 'Complementary aliases must merge to one five-mention card');
const leawind = vault.projects.find(project => project.id === 'leawind-third-person');
assert(leawind && leawind.mentionCount === 3, 'Leawind aliases must merge to one three-mention card');
assert.deepEqual(new Set(leawind.providerLinks.map(link => link.provider)), new Set(['Modrinth','CurseForge']), 'Leawind must expose both provider homes');
const physics = vault.projects.find(project => project.id === 'physics-mod');
assert(physics && physics.mentionCount === 3, 'Physics Mod and Physics Mod Pro must merge to one three-mention project');
assert(physics.aliases.includes('Physics Mod Pro'), 'Physics Mod Pro remains searchable as an alias');
const eating = vault.projects.find(project => project.id === 'eating-animation');
assert(eating && eating.providerLinks.length === 4, 'Eating Animation must keep all four loader/provider destinations');
assert(eating.providerLinks.some(link => link.provider === 'Modrinth' && link.label === 'Fabric'), 'Eating Animation Modrinth Fabric link');
assert(eating.providerLinks.some(link => link.provider === 'CurseForge' && link.label === 'Fabric'), 'Eating Animation CurseForge Fabric link');
assert(eating.providerLinks.some(link => link.provider === 'Modrinth' && link.label === 'Forge/NeoForge'), 'Eating Animation Modrinth Forge/NeoForge link');
assert(eating.providerLinks.some(link => link.provider === 'CurseForge' && link.label === 'Forge/NeoForge'), 'Eating Animation CurseForge Forge/NeoForge link');
const connectible = vault.projects.find(project => project.id === 'connectible-chains');
assert(connectible && connectible.providerLinks.filter(link => link.provider === 'CurseForge').length === 2, 'Connectible Chains loader-specific CurseForge homes must both survive');
const valleySky = vault.projects.find(project => project.id === 'valley-and-sky');
assert(valleySky && valleySky.providerLinks.some(link => link.provider === 'Official' && /patreon\.com\/cw\/ValleyandSky/.test(link.url)), 'Valley & Sky WIP must link its real official project page rather than inventing a provider build');
const caztoon = vault.projects.find(project => project.id === 'caztoon');
assert(caztoon && caztoon.providerLinks.some(link => /cazfps\.com\/caztoon-info/.test(link.url)), 'CazToon must expose its creator-controlled project page');

// Kreksu source contracts and the original 30 direct homes remain intact.
const kreksu = vault.creators.find(c => c.id === 'youtube:kreksuminecraft');
assert(kreksu && kreksu.coverage.indexedVideos === 3 && kreksu.coverage.recommendationCount === 30, 'Kreksu 3/30 coverage');
const kreksuVideos = vault.videos.filter(v => v.creatorId === kreksu.id);
assert.equal(kreksuVideos.length, 3);
assert.equal(kreksuVideos.reduce((sum, v) => sum + v.mods.length, 0), 30);
const expectedKreksuHomes = {
  'Apocalyptic Bosses':'https://www.curseforge.com/minecraft/mc-mods/apocalypticbosses',
  "Chris's Additions":'https://modrinth.com/mod/chris_s_additions',
  'Envelope':'https://modrinth.com/mod/envelope',
  'Cascades':'https://modrinth.com/datapack/hybrid-beta',
  'Curiosities!':'https://modrinth.com/mod/curiosities-syndicate',
  'Starcatcher':'https://modrinth.com/mod/starcatcher',
  '[BUB] Gender':'https://modrinth.com/mod/genderbub',
  'Simply Bows':'https://modrinth.com/mod/simply-bows',
  'Shutter Up!':'https://modrinth.com/mod/shutter-up',
  'ShellBound for AirShip':'https://modrinth.com/mod/shellbound-for-airship',
  'Legionary':'https://www.curseforge.com/minecraft/mc-mods/legionary',
  'Draconic Spells':'https://www.curseforge.com/minecraft/mc-mods/draconicspells',
  'Threateningly Mobs':'https://www.curseforge.com/minecraft/mc-mods/threateningly-mobs',
  'Wings Of Fire!':'https://www.curseforge.com/minecraft/mc-mods/the-wings-of-fire',
  'ByteBuddies':'https://www.curseforge.com/minecraft/mc-mods/bytebuddies',
  'Better Fishtanks':'https://www.curseforge.com/minecraft/mc-mods/better-fishtanks',
  'Feastful':'https://www.curseforge.com/minecraft/mc-mods/feastful',
  'ReCased':'https://www.curseforge.com/minecraft/mc-mods/recased',
  'Bountiful Fares':'https://modrinth.com/mod/bountiful-fares',
  'Even Better Nether':'https://www.curseforge.com/minecraft/mc-mods/even-better-nether',
  'Craftics - Grid Based Tactical RPG':'https://www.curseforge.com/minecraft/mc-mods/craftics',
  'Gateway to Doom':'https://modrinth.com/mod/gateway-to-doom',
  'Boundless & Endless':'https://www.curseforge.com/minecraft/mc-mods/boundless-endless',
  "Iden's Decor":'https://modrinth.com/mod/idens-decor',
  "Nimbu's: Pocket Dimensions":'https://modrinth.com/mod/nimbus-pocket-dimensions',
  'Better Horse/Mount Steering':'https://www.curseforge.com/minecraft/mc-mods/better-mount-steering',
  'Keybind Atlas':'https://modrinth.com/mod/keybind-atlas',
  'Lazy Tools':'https://www.curseforge.com/minecraft/mc-mods/lazy-tools',
  'Happy Ghast Inventory':'https://www.curseforge.com/minecraft/mc-mods/happy-ghast-inventory',
  'Jaki Versatile Structures: Sails & Sea':'https://www.curseforge.com/minecraft/mc-mods/jaki-versatile-structures-sails-sea'
};
for (const video of kreksuVideos) {
  assert(video.evidenceKinds.includes('youtube-description'), `Kreksu description evidence: ${video.id}`);
  assert(video.evidenceKinds.includes('provider-projects'), `Kreksu provider evidence: ${video.id}`);
  const seconds = video.mods.map(mod => mod.timestampSeconds);
  assert(seconds.every(Number.isFinite), `Kreksu numeric timestamps: ${video.id}`);
  assert(seconds.every((n, i) => i === 0 || n > seconds[i - 1]), `Kreksu ordered timestamps: ${video.id}`);
  for (const mod of video.mods) {
    assert.equal(mod.url, expectedKreksuHomes[mod.name], `original Kreksu primary URL must not move: ${mod.name}`);
    assert(mod.providerLinks.some(link => link.url === expectedKreksuHomes[mod.name]), `Kreksu canonical links retain original home: ${mod.name}`);
  }
}
assert.equal(kreksuVideos.flatMap(v => v.mods).find(m => m.name === 'Cascades').projectType, 'datapack', 'Cascades remains a data pack');

// AsianHalfSquat pinned import provenance remains unchanged while registry links enrich canonical projects.
const asian = vault.creators.find(c => c.id === 'youtube:asianhalfsquat');
assert(asian && asian.coverage.expectedVideos === 349, 'AsianHalfSquat target 349');
assert.equal(asian.coverage.indexedVideos, 16);
assert.equal(asian.coverage.recommendationCount, 216);
assert.equal(asian.coverage.sourceDriveFileId, '1tHH5-Ucfo9RaeH3hfnwtUa0431h6EOsh');
const asianImport = vault.imports.find(row => row.creatorId === asian.id);
assert(asianImport, 'AsianHalfSquat import must remain active');
assert.equal(asianImport.videos, 16);
assert.equal(asianImport.recommendations, 216);
assert.equal(asianImport.sourceDriveSha256, '6e49a5154e1a757df75c4ab7371f91632250b551f9e1e3b00781db035b43a9e1');
assert.equal(asianImport.sourceSnapshotSha256, '4e45e92fed3171175fcf50b37d9dcfd91b88217582fe9a924f405397eea649e8');
const expectedShardCounts = [[4,26],[4,49],[4,64],[2,26],[1,20],[1,31]];
assert.equal(asianImport.files.length, expectedShardCounts.length);
asianImport.files.forEach((row, index) => {
  const sourcePath = path.join(root, 'catalog', 'creator-vault', row.file);
  const hash = crypto.createHash('sha256').update(fs.readFileSync(sourcePath)).digest('hex');
  assert.equal(hash, row.sha256, `AsianHalfSquat shard ${index + 1} hash`);
  assert.deepEqual([row.videos,row.recommendations], expectedShardCounts[index], `AsianHalfSquat shard ${index + 1} counts`);
});
const asianVideos = vault.videos.filter(v => v.creatorId === asian.id);
assert.equal(asianVideos.length, 16);
const asianMods = asianVideos.flatMap(v => v.mods);
assert.equal(asianMods.length, 216);
assert(asianMods.every(mod => mod.name && mod.evidence && mod.sourceKinds.includes('catalog') && mod.canonicalProjectId), 'AsianHalfSquat mentions preserve evidence and canonical identity');
const satisfaction = asianMods.find(mod => mod.name === 'Satisfaction Guaranteed');
assert(satisfaction && satisfaction.projectType === 'modpack');
assert.equal(satisfaction.url, 'https://www.curseforge.com/minecraft/modpacks/satisfaction-guaranteed');
assert.equal(satisfaction.projectId, '1490741');

// EnderVerse source evidence stays exact; provider enrichment is independent from recommendation evidence.
const ender = vault.creators.find(c => c.id === 'youtube:enderversemc');
assert(ender && ender.coverage.legacyRecovery === 'no-public-corpus-prepopulated', 'EnderVerse legacy recovery truth');
const enderVideos = vault.videos.filter(v => v.creatorId === ender.id);
assert.equal(enderVideos.length, 2);
assert.equal(enderVideos.reduce((sum, v) => sum + v.mods.length, 0), 65);
const ender2025 = enderVideos.find(v => v.id === 'youtube:JF6FITETMLM');
const ender2024 = enderVideos.find(v => v.id === 'youtube:kxXz-FbvhAA');
assert(ender2025 && ender2025.mods.length === 25 && ender2025.mods[0].name === 'Etherology' && ender2025.mods.at(-1).name === 'Wonderous Sea - An Endless Ocean Adventure');
assert(ender2024 && ender2024.mods.length === 40 && ender2024.mods[0].name === 'MoreVanillaArmor' && ender2024.mods.at(-1).name === 'Reacharound');
for (const video of enderVideos) {
  assert(video.evidenceKinds.includes('youtube-description') && video.evidenceKinds.includes('chapters'));
  const seconds = video.mods.map(mod => mod.timestampSeconds);
  assert(seconds.every(Number.isFinite));
  assert(seconds.every((n, i) => i === 0 || n > seconds[i - 1]));
  for (const mod of video.mods) {
    assert(mod.name && mod.evidence && mod.canonicalProjectId);
    assert(mod.sourceKinds.includes('description') && mod.sourceKinds.includes('chapter'));
    assert(mod.videoLink.includes(`t=${mod.timestampSeconds}s`));
  }
}
assert.deepEqual(ender2025.mods.find(m => m.name === 'harpy express').loader, ['Quilt','Fabric']);
assert.deepEqual(ender2024.mods.find(m => m.name === 'EXP Counter').loader, ['Fabric','Forge','NeoForge']);

// UI and renderer regression gate.
const addonJs = fs.readFileSync(path.join(root, 'catalog', 'creator-vault', 'creator-vault.js'), 'utf8');
new vm.Script(addonJs, { filename:'creator-vault.js' });
const addonCss = fs.readFileSync(path.join(root, 'catalog', 'creator-vault', 'creator-vault.css'), 'utf8');
assert(addonJs.includes('Duplicate-free search'), 'search must explicitly merge duplicate mentions');
assert(addonJs.includes('Every source mention'), 'merged cards must retain provenance');
assert(addonJs.includes('providerActions(project,project.name)'), 'merged cards must render all direct destinations');
assert(addonJs.includes('link.label?'), 'loader-specific provider destinations must remain labeled');
assert(addonCss.includes('.cv-merged-card'), 'merged project card styling');
assert(addonCss.includes('.cv-project-grid'), 'merged project grid styling');
const rendered = renderCatalog({ id:'creator-vault-qa', name:'Creator Vault QA', items:[], assets:{}, documents:[], sources:[] }, root);
assert(rendered.html.includes('window.ENDERLOOM_CREATOR_VAULT='));
assert(rendered.html.includes('youtube:kreksuminecraft'));
assert(rendered.html.includes('youtube:asianhalfsquat'));
assert(rendered.html.includes('youtube:enderversemc'));
assert(rendered.html.includes('Solas Shader'));
assert(rendered.html.includes('Physics Mod Pro'));
assert(rendered.html.includes('https://modrinth.com/mod/eating-animation'));
assert(rendered.html.includes('https://www.curseforge.com/minecraft/mc-mods/eating-animation-forge'));
assert(rendered.html.includes('https://www.patreon.com/cw/ValleyandSky'));
assert(rendered.html.includes('Find in Enderloom'), 'sole unresolved project must retain safe fallback');

console.log(`Creator Vault QA passed: ${vault.stats.recommendations} mentions -> ${vault.stats.uniqueProjects} canonical projects; ${vault.stats.verifiedProjects} linked projects / ${vault.stats.providerDestinations} direct destinations / ${vault.stats.multiProviderProjects} multi-provider / ${vault.stats.unresolvedProjects} unresolved.`);
