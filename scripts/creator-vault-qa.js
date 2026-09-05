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
assert.equal(vault.schemaVersion, 1, 'creator vault schema version');
assert.equal(vault.creators.length, 14, 'all tracked creators must be present');
assert.equal(new Set(vault.creators.map(c => c.id)).size, vault.creators.length, 'creator ids must be unique');
assert.equal(vault.stats.indexedCreators, 2, 'Kreksu and AsianHalfSquat should be natively indexed');
assert.equal(vault.videos.length, 19, '3 Kreksu + 16 AsianHalfSquat exact videos');
assert.equal(vault.stats.recommendations, 246, '30 Kreksu + 216 AsianHalfSquat recommendations');
assert.equal(vault.stats.verifiedHomes, 31, '30 Kreksu homes + AsianHalfSquat Satisfaction Guaranteed');
assert.equal(vault.stats.importedCatalogs, 1, 'one reconciled legacy creator catalog should be imported');
assert.equal(vault.channelSetupPacks.length, 5, 'Kreksu recurring channel setup packs stay separate');
assert.equal(vault.diagnostics.filter(x => x.level === 'error').length, 0, 'vault should load without errors');

const kreksu = vault.creators.find(c => c.id === 'youtube:kreksuminecraft');
assert(kreksu, 'Kreksu creator must be registered');
assert.equal(kreksu.url, 'https://www.youtube.com/@KreksuMinecraft');
assert.equal(kreksu.coverage.indexedVideos, 3, 'Kreksu video count remains unchanged');
assert.equal(kreksu.coverage.recommendationCount, 30, 'Kreksu recommendation count remains unchanged');
const kreksuVideos = vault.videos.filter(v => v.creatorId === kreksu.id);
assert.equal(kreksuVideos.length, 3, 'three fully sourced Kreksu videos');
assert.equal(kreksuVideos.reduce((sum, v) => sum + v.mods.length, 0), 30, 'thirty Kreksu recommendations');

const expectedProviderHomes = {
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
  assert(video.evidenceKinds.includes('youtube-description'), `Kreksu description evidence required: ${video.id}`);
  assert(video.evidenceKinds.includes('provider-projects'), `Kreksu provider enrichment provenance required: ${video.id}`);
  const seconds = video.mods.map(m => m.timestampSeconds);
  assert(seconds.every(Number.isFinite), `Kreksu timestamps must be numeric: ${video.id}`);
  assert(seconds.every((n, i) => i === 0 || n > seconds[i - 1]), `Kreksu timestamps must be strictly ordered: ${video.id}`);
  for (const mod of video.mods) {
    assert(mod.sourceKinds.includes('description') && mod.sourceKinds.includes('chapter') && mod.sourceKinds.includes('provider-project'), `Kreksu provenance required for ${mod.name}`);
    assert(mod.videoLink.includes(`t=${mod.timestampSeconds}s`), `Kreksu deep video link required for ${mod.name}`);
    assert.equal(mod.url, expectedProviderHomes[mod.name], `exact Kreksu provider URL mismatch for ${mod.name}`);
  }
}
const cascades = kreksuVideos.flatMap(v => v.mods).find(m => m.name === 'Cascades');
assert.equal(cascades.projectType, 'datapack', 'Cascades provider type must stay truthful');

const asian = vault.creators.find(c => c.id === 'youtube:asianhalfsquat');
assert(asian, 'AsianHalfSquat must remain in the creator ledger');
assert.equal(asian.url, 'https://www.youtube.com/@AsianHalfSquat');
assert.equal(asian.coverage.expectedVideos, 349, 'verified AsianHalfSquat channel target must be preserved');
assert.equal(asian.coverage.indexedVideos, 16, 'reconciled AsianHalfSquat exact-video count');
assert.equal(asian.coverage.recommendationCount, 216, 'reconciled AsianHalfSquat recommendation count');
assert.equal(asian.coverage.sourceDriveFileId, '1tHH5-Ucfo9RaeH3hfnwtUa0431h6EOsh', 'canonical Drive source identity must be pinned');
const asianImport = vault.imports.find(x => x.creatorId === asian.id);
assert(asianImport, 'AsianHalfSquat legacy catalog import must be active');
assert.equal(asianImport.id, 'minecraft-mod-vault:asianhalfsquat:p0.5-reconciled');
assert.equal(asianImport.videos, 16);
assert.equal(asianImport.recommendations, 216);
assert.equal(asianImport.sourceDriveFileId, '1tHH5-Ucfo9RaeH3hfnwtUa0431h6EOsh');
assert.equal(asianImport.sourceDriveSha256, '6e49a5154e1a757df75c4ab7371f91632250b551f9e1e3b00781db035b43a9e1', 'original Drive snapshot hash must stay pinned');
assert.equal(asianImport.sourceSnapshotSha256, '4e45e92fed3171175fcf50b37d9dcfd91b88217582fe9a924f405397eea649e8', 'full compact snapshot hash must stay pinned');
assert.equal(asianImport.files.length, 6, 'reconciled snapshot must remain six deterministic shards');
const expectedShardCounts = [[4,26],[4,49],[4,64],[2,26],[1,20],[1,31]];
asianImport.files.forEach((row, index) => {
  const sourcePath = path.join(root, 'catalog', 'creator-vault', row.file);
  const sourceHash = crypto.createHash('sha256').update(fs.readFileSync(sourcePath)).digest('hex');
  assert.equal(sourceHash, row.sha256, `AsianHalfSquat shard ${index + 1} must match its pinned hash`);
  assert.deepEqual([row.videos,row.recommendations], expectedShardCounts[index], `AsianHalfSquat shard ${index + 1} count contract`);
});
const asianVideos = vault.videos.filter(v => v.creatorId === asian.id);
assert.equal(asianVideos.length, 16, 'all 16 exact AsianHalfSquat videos must load');
assert.equal(new Set(asianVideos.map(v => v.id)).size, 16, 'AsianHalfSquat video ids must be unique after platform namespacing');
assert(asianVideos.every(v => v.id.startsWith('youtube:')), 'imported video ids must be collision-safe platform ids');
assert(asianVideos.every(v => v.evidenceKinds.includes('legacy-catalog')), 'imported video provenance must remain visible');
const asianMods = asianVideos.flatMap(v => v.mods);
assert.equal(asianMods.length, 216, 'all AsianHalfSquat recommendation mentions must load');
assert(asianMods.every(m => m.name && m.evidence), 'every imported recommendation must retain name and evidence');
assert(asianMods.every(m => m.sourceKinds.includes('catalog')), 'every imported recommendation must retain catalog provenance');
assert.equal(asianMods.filter(m => m.url).length, 1, 'unverified AsianHalfSquat provider URLs must remain unresolved');
const satisfaction = asianMods.find(m => m.name === 'Satisfaction Guaranteed');
assert(satisfaction, 'verified AsianHalfSquat-owned modpack must be imported');
assert.equal(satisfaction.projectType, 'modpack');
assert.equal(satisfaction.provider, 'CurseForge');
assert.equal(satisfaction.projectId, '1490741');
assert.equal(satisfaction.url, 'https://www.curseforge.com/minecraft/modpacks/satisfaction-guaranteed');
assert.equal(asianMods.filter(m => !m.url).length, 215, 'no plausible provider URLs may be manufactured during legacy import');

const addonJs = fs.readFileSync(path.join(root, 'catalog', 'creator-vault', 'creator-vault.js'), 'utf8');
new vm.Script(addonJs, { filename:'creator-vault.js' });
const addonCss = fs.readFileSync(path.join(root, 'catalog', 'creator-vault', 'creator-vault.css'), 'utf8');
assert(addonCss.includes('.creator-vault-modal'), 'creator vault modal styles missing');
assert(addonCss.includes('.cv-mod-grid'), 'recommendation grid styles missing');
const rendered = renderCatalog({ id:'creator-vault-qa', name:'Creator Vault QA', items:[], assets:{}, documents:[], sources:[] }, root);
assert(rendered.html.includes('window.ENDERLOOM_CREATOR_VAULT='), 'renderer must embed creator vault data');
assert(rendered.html.includes('youtube:kreksuminecraft'), 'renderer must embed Kreksu identity');
assert(rendered.html.includes('youtube:asianhalfsquat'), 'renderer must embed AsianHalfSquat identity');
assert(rendered.html.includes('Satisfaction Guaranteed'), 'renderer must embed imported AsianHalfSquat recommendations');
assert(rendered.html.includes('https://www.curseforge.com/minecraft/modpacks/satisfaction-guaranteed'), 'renderer must embed the one verified AsianHalfSquat provider home');
assert(rendered.html.includes('https://www.curseforge.com/minecraft/mc-mods/legionary'), 'renderer must retain verified Kreksu provider homes');
assert(rendered.html.includes('creator-vault-modal'), 'renderer must embed creator vault UI/CSS');
assert(rendered.html.includes('Find in Enderloom'), 'renderer must retain unresolved-provider handoff for the 215 unresolved AsianHalfSquat recommendations and future records');
console.log(`Creator Vault QA passed: ${vault.stats.creators} creators, ${vault.stats.indexedCreators} indexed creators, ${vault.stats.videos} videos, ${vault.stats.recommendations} recommendations, ${vault.stats.verifiedHomes} verified homes, ${vault.stats.importedCatalogs} imported catalog, ${vault.stats.setupPacks} setup packs.`);
