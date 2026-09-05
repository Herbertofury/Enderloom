'use strict';
const assert = require('assert');
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
const kreksu = vault.creators.find(c => c.id === 'youtube:kreksuminecraft');
assert(kreksu, 'Kreksu creator must be registered');
assert.equal(kreksu.url, 'https://www.youtube.com/@KreksuMinecraft');
assert.equal(kreksu.coverage.indexedVideos, 3, 'Kreksu chunk 3 video count');
assert.equal(kreksu.coverage.recommendationCount, 30, 'Kreksu chunk 3 recommendation count');
assert.equal(vault.videos.length, 3, 'three fully sourced Kreksu videos through chunk 3');
assert.equal(vault.stats.recommendations, 30, 'thirty fully sourced recommendations');
assert.equal(vault.channelSetupPacks.length, 5, 'recurring channel setup packs are tracked separately');
assert.equal(vault.diagnostics.filter(x => x.level === 'error').length, 0, 'vault should load without errors');

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
assert.equal(Object.keys(expectedProviderHomes).length, 30, 'provider-home truth table should cover every recommendation');

const april5 = vault.videos.find(v => v.id === 'youtube:Hg1_20vRrZM');
assert(april5, 'April 5 Kreksu video must be indexed');
assert.equal(april5.mods.length, 10, 'April 5 video must retain all ten chapter recommendations');
assert.equal(april5.mods[0].name, 'Apocalyptic Bosses');
assert.equal(april5.mods.at(-1).name, 'ShellBound for AirShip');
const cascades = april5.mods.find(m => m.name === 'Cascades');
assert.equal(cascades.projectType, 'datapack', 'Cascades provider type must stay truthful');

for (const video of vault.videos) {
  assert.equal(video.creatorId, kreksu.id, `unexpected creator for ${video.id}`);
  assert(/^https:\/\/www\.youtube\.com\/watch\?v=/.test(video.url), `video URL must be canonical: ${video.id}`);
  assert(video.evidenceKinds.includes('youtube-description'), `direct description evidence required: ${video.id}`);
  assert(video.evidenceKinds.includes('provider-projects'), `provider enrichment provenance required: ${video.id}`);
  const seconds = video.mods.map(m => m.timestampSeconds);
  assert(seconds.every(Number.isFinite), `all timestamps must be numeric: ${video.id}`);
  assert(seconds.every((n, i) => i === 0 || n > seconds[i - 1]), `timestamps must be strictly ordered: ${video.id}`);
  for (const mod of video.mods) {
    assert(mod.name, `recommendation name required in ${video.id}`);
    assert(mod.evidence, `recommendation evidence required for ${mod.name}`);
    assert(mod.sourceKinds.includes('description') && mod.sourceKinds.includes('chapter'), `chapter provenance required for ${mod.name}`);
    assert(mod.sourceKinds.includes('provider-project'), `provider-project provenance required for ${mod.name}`);
    assert(mod.videoLink.includes(`t=${mod.timestampSeconds}s`), `deep video link required for ${mod.name}`);
    assert.equal(mod.url, expectedProviderHomes[mod.name], `exact provider URL mismatch for ${mod.name}`);
    assert(['CurseForge','Modrinth'].includes(mod.provider), `provider identity required for ${mod.name}`);
  }
}
const verified = vault.videos.flatMap(v => v.mods).filter(m => m.url);
assert.equal(verified.length, 30, 'all thirty indexed recommendations should have verified direct provider homes');
const keybind = verified.find(m => m.name === 'Keybind Atlas');
assert(keybind && keybind.url === 'https://modrinth.com/mod/keybind-atlas', 'verified Keybind Atlas provider URL should be preserved');

const addonJs = fs.readFileSync(path.join(root, 'catalog', 'creator-vault', 'creator-vault.js'), 'utf8');
new vm.Script(addonJs, { filename:'creator-vault.js' });
const addonCss = fs.readFileSync(path.join(root, 'catalog', 'creator-vault', 'creator-vault.css'), 'utf8');
assert(addonCss.includes('.creator-vault-modal'), 'creator vault modal styles missing');
assert(addonCss.includes('.cv-mod-grid'), 'recommendation grid styles missing');
const rendered = renderCatalog({ id:'creator-vault-qa', name:'Creator Vault QA', items:[], assets:{}, documents:[], sources:[] }, root);
assert(rendered.html.includes('window.ENDERLOOM_CREATOR_VAULT='), 'renderer must embed creator vault data');
assert(rendered.html.includes('youtube:kreksuminecraft'), 'renderer must embed Kreksu identity');
assert(rendered.html.includes('https://modrinth.com/mod/shellbound-for-airship'), 'renderer must embed verified April provider homes');
assert(rendered.html.includes('https://www.curseforge.com/minecraft/mc-mods/legionary'), 'renderer must embed verified April 9 provider homes');
assert(rendered.html.includes('https://www.curseforge.com/minecraft/mc-mods/jaki-versatile-structures-sails-sea'), 'renderer must embed verified May provider homes');
assert(rendered.html.includes('creator-vault-modal'), 'renderer must embed creator vault UI/CSS');
assert(rendered.html.includes('Find in Enderloom'), 'renderer must retain unresolved-provider handoff capability for future records');
console.log(`Creator Vault QA passed: ${vault.stats.creators} creators, ${vault.stats.videos} videos, ${vault.stats.recommendations} recommendations, ${verified.length} verified provider homes, ${vault.stats.setupPacks} setup packs.`);
