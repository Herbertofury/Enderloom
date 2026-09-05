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
assert.equal(vault.schemaVersion, 1);
assert.equal(vault.creators.length, 14, 'all tracked creators must remain present');
assert.equal(new Set(vault.creators.map(c => c.id)).size, 14, 'creator ids must be unique');
assert.equal(vault.stats.indexedCreators, 3);
assert.equal(vault.videos.length, 22, '3 Kreksu + 16 AsianHalfSquat + 3 EnderVerse videos');
assert.equal(vault.stats.recommendations, 351, '311 prior mentions + 40 EnderVerse episode 1 mentions');
assert.equal(vault.stats.uniqueProjects, 300, '351 mentions must merge to 300 canonical projects');
assert.equal(vault.projects.reduce((sum,p)=>sum+p.mentionCount,0),351,'all source mentions survive canonicalization');
assert.equal(vault.stats.verifiedProjects, 299, 'all canonical projects except Plank and Junk have a verified public destination');
assert.equal(vault.stats.unresolvedProjects, 1);
assert.equal(vault.stats.multiProviderProjects, 134);
assert.equal(vault.stats.providerDestinations, 440);
assert.deepEqual(vault.projects.filter(p=>!p.providerLinks.length).map(p=>p.name),['Plank and Junk']);
assert.equal(vault.stats.importedCatalogs,1);
assert.equal(vault.stats.nativeRecommendationSources,3,'primary + EnderVerse chunk5 + EnderVerse episode1 chunk7');
assert.equal(vault.channelSetupPacks.length,5);
assert.equal(vault.diagnostics.filter(x=>x.level==='error').length,0);

const canonicalIds=new Set(vault.projects.map(p=>p.id));
assert.equal(canonicalIds.size,vault.projects.length);
for(const p of vault.projects){
 assert(p.name && p.mentionCount>0,`valid canonical project ${p.id}`);
 const urls=p.providerLinks.map(x=>x.url);
 assert.equal(new Set(urls).size,urls.length,`provider URLs unique: ${p.id}`);
 for(const link of p.providerLinks){assert(/^https:\/\//.test(link.url),`absolute HTTPS ${p.id}`);assert(!/\/search(?:[/?#]|$)/i.test(link.url),`no generic search page ${p.id}`);assert(link.provider,`provider label ${p.id}`);}
}
for(const v of vault.videos) for(const m of v.mods){assert(m.canonicalProjectId && canonicalIds.has(m.canonicalProjectId),`canonical identity ${m.name}`);}

// Chunk 6 canonical merge contracts remain regression locked.
const solas=vault.projects.find(p=>p.id==='solas-shader'); assert(solas&&solas.mentionCount===7&&solas.aliases.includes('Solas')&&solas.aliases.includes('Solas Shaders'));
const complementary=vault.projects.find(p=>p.id==='complementary-shaders'); assert(complementary&&complementary.mentionCount===5);
const physics=vault.projects.find(p=>p.id==='physics-mod'); assert(physics&&physics.mentionCount===3&&physics.aliases.includes('Physics Mod Pro'));
const eating=vault.projects.find(p=>p.id==='eating-animation'); assert(eating&&eating.providerLinks.length===4); assert(eating.providerLinks.some(x=>x.provider==='Modrinth'&&x.label==='Fabric')); assert(eating.providerLinks.some(x=>x.provider==='CurseForge'&&x.label==='Forge/NeoForge'));
const connectible=vault.projects.find(p=>p.id==='connectible-chains'); assert(connectible&&connectible.providerLinks.filter(x=>x.provider==='CurseForge').length===2);
const valley=vault.projects.find(p=>p.id==='valley-and-sky'); assert(valley&&valley.providerLinks.some(x=>/patreon\.com\/cw\/ValleyandSky/.test(x.url)));

// Kreksu source contracts and original direct homes.
const kreksu=vault.creators.find(c=>c.id==='youtube:kreksuminecraft'); assert(kreksu&&kreksu.coverage.indexedVideos===3&&kreksu.coverage.recommendationCount===30);
const kreksuVideos=vault.videos.filter(v=>v.creatorId===kreksu.id); assert.equal(kreksuVideos.length,3); assert.equal(kreksuVideos.reduce((s,v)=>s+v.mods.length,0),30);
const expectedKreksuHomes={
'Apocalyptic Bosses':'https://www.curseforge.com/minecraft/mc-mods/apocalypticbosses',"Chris's Additions":'https://modrinth.com/mod/chris_s_additions','Envelope':'https://modrinth.com/mod/envelope','Cascades':'https://modrinth.com/datapack/hybrid-beta','Curiosities!':'https://modrinth.com/mod/curiosities-syndicate','Starcatcher':'https://modrinth.com/mod/starcatcher','[BUB] Gender':'https://modrinth.com/mod/genderbub','Simply Bows':'https://modrinth.com/mod/simply-bows','Shutter Up!':'https://modrinth.com/mod/shutter-up','ShellBound for AirShip':'https://modrinth.com/mod/shellbound-for-airship','Legionary':'https://www.curseforge.com/minecraft/mc-mods/legionary','Draconic Spells':'https://www.curseforge.com/minecraft/mc-mods/draconicspells','Threateningly Mobs':'https://www.curseforge.com/minecraft/mc-mods/threateningly-mobs','Wings Of Fire!':'https://www.curseforge.com/minecraft/mc-mods/the-wings-of-fire','ByteBuddies':'https://www.curseforge.com/minecraft/mc-mods/bytebuddies','Better Fishtanks':'https://www.curseforge.com/minecraft/mc-mods/better-fishtanks','Feastful':'https://www.curseforge.com/minecraft/mc-mods/feastful','ReCased':'https://www.curseforge.com/minecraft/mc-mods/recased','Bountiful Fares':'https://modrinth.com/mod/bountiful-fares','Even Better Nether':'https://www.curseforge.com/minecraft/mc-mods/even-better-nether','Craftics - Grid Based Tactical RPG':'https://www.curseforge.com/minecraft/mc-mods/craftics','Gateway to Doom':'https://modrinth.com/mod/gateway-to-doom','Boundless & Endless':'https://www.curseforge.com/minecraft/mc-mods/boundless-endless',"Iden's Decor":'https://modrinth.com/mod/idens-decor',"Nimbu's: Pocket Dimensions":'https://modrinth.com/mod/nimbus-pocket-dimensions','Better Horse/Mount Steering':'https://www.curseforge.com/minecraft/mc-mods/better-mount-steering','Keybind Atlas':'https://modrinth.com/mod/keybind-atlas','Lazy Tools':'https://www.curseforge.com/minecraft/mc-mods/lazy-tools','Happy Ghast Inventory':'https://www.curseforge.com/minecraft/mc-mods/happy-ghast-inventory','Jaki Versatile Structures: Sails & Sea':'https://www.curseforge.com/minecraft/mc-mods/jaki-versatile-structures-sails-sea'};
for(const v of kreksuVideos){assert(v.evidenceKinds.includes('youtube-description'));const s=v.mods.map(m=>m.timestampSeconds);assert(s.every(Number.isFinite)&&s.every((n,i)=>i===0||n>s[i-1]));for(const m of v.mods){assert.equal(m.url,expectedKreksuHomes[m.name]);assert(m.providerLinks.some(x=>x.url===expectedKreksuHomes[m.name]));}}
assert.equal(kreksuVideos.flatMap(v=>v.mods).find(m=>m.name==='Cascades').projectType,'datapack');

// AsianHalfSquat pinned lineage remains exact.
const asian=vault.creators.find(c=>c.id==='youtube:asianhalfsquat'); assert(asian&&asian.coverage.expectedVideos===349&&asian.coverage.indexedVideos===16&&asian.coverage.recommendationCount===216); assert.equal(asian.coverage.sourceDriveFileId,'1tHH5-Ucfo9RaeH3hfnwtUa0431h6EOsh');
const imp=vault.imports.find(x=>x.creatorId===asian.id); assert(imp); assert.equal(imp.videos,16); assert.equal(imp.recommendations,216); assert.equal(imp.sourceDriveSha256,'6e49a5154e1a757df75c4ab7371f91632250b551f9e1e3b00781db035b43a9e1'); assert.equal(imp.sourceSnapshotSha256,'4e45e92fed3171175fcf50b37d9dcfd91b88217582fe9a924f405397eea649e8');
const shardCounts=[[4,26],[4,49],[4,64],[2,26],[1,20],[1,31]]; assert.equal(imp.files.length,6); imp.files.forEach((row,i)=>{const p=path.join(root,'catalog','creator-vault',row.file);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),row.sha256);assert.deepEqual([row.videos,row.recommendations],shardCounts[i]);});
const asianMods=vault.videos.filter(v=>v.creatorId===asian.id).flatMap(v=>v.mods); assert.equal(asianMods.length,216); assert(asianMods.every(m=>m.name&&m.evidence&&m.sourceKinds.includes('catalog')&&m.canonicalProjectId)); const satisfaction=asianMods.find(m=>m.name==='Satisfaction Guaranteed'); assert(satisfaction&&satisfaction.projectId==='1490741'&&satisfaction.url==='https://www.curseforge.com/minecraft/modpacks/satisfaction-guaranteed');

// EnderVerse exact source evidence, including Vanilla+ Episode 1 chunk 7.
const ender=vault.creators.find(c=>c.id==='youtube:enderversemc'); assert(ender&&ender.coverage.legacyRecovery==='no-public-corpus-prepopulated'); assert.equal(ender.coverage.indexedVideos,3); assert.equal(ender.coverage.recommendationCount,105); assert.equal(ender.coverage.verifiedProjectHomes,104);
const enderVideos=vault.videos.filter(v=>v.creatorId===ender.id); assert.equal(enderVideos.length,3); assert.equal(enderVideos.reduce((s,v)=>s+v.mods.length,0),105);
const y2025=enderVideos.find(v=>v.id==='youtube:JF6FITETMLM'); assert(y2025&&y2025.mods.length===25&&y2025.mods[0].name==='Etherology'&&y2025.mods.at(-1).name==='Wonderous Sea - An Endless Ocean Adventure');
const ep4=enderVideos.find(v=>v.id==='youtube:kxXz-FbvhAA'); assert(ep4&&ep4.mods.length===40&&ep4.mods[0].name==='MoreVanillaArmor'&&ep4.mods.at(-1).name==='Reacharound');
const ep1=enderVideos.find(v=>v.id==='youtube:vniY9L4EbgM'); assert(ep1,'Vanilla+ Episode 1 must load'); assert.equal(ep1.title,'TOP 200 Vanilla+ Minecraft Mods For 1.20.4 / 1.20 | Ep. 1 (2024) [Forge/Fabric]'); assert.equal(ep1.publishedAt,'2024-01-16'); assert.equal(ep1.mods.length,40); assert.equal(ep1.mods[0].name,"Leawind's Third Person"); assert.equal(ep1.mods.at(-1).name,"Yung's Better Jungle Temples");
for(const v of enderVideos){assert(v.evidenceKinds.includes('youtube-description')&&v.evidenceKinds.includes('chapters'));const s=v.mods.map(m=>m.timestampSeconds);assert(s.every(Number.isFinite)&&s.every((n,i)=>i===0||n>s[i-1]));for(const m of v.mods){assert(m.name&&m.evidence&&m.canonicalProjectId);assert(m.sourceKinds.includes('description')&&m.sourceKinds.includes('chapter'));assert(m.videoLink.includes(`t=${m.timestampSeconds}s`));}}
assert.deepEqual(y2025.mods.find(m=>m.name==='harpy express').loader,['Quilt','Fabric']); assert.deepEqual(ep4.mods.find(m=>m.name==='EXP Counter').loader,['Fabric','Forge','NeoForge']);
assert.deepEqual(ep1.mods.find(m=>m.name==='Spawn Animations').loader,['All Loaders']); assert.deepEqual(ep1.mods.find(m=>m.name==='Basic Weapons').loader,['All Mod Loaders']); assert.deepEqual(ep1.mods.find(m=>m.name==='Inspecio').loader,['Quilt']); assert.deepEqual(ep1.mods.find(m=>m.name==='Nvidium').loader,['Quilt','Fabric']);
assert(ep1.mods.every(m=>m.providerLinks.length>0),'all Episode 1 recommendations must have a verified direct destination');
assert.equal(ep1.mods.find(m=>m.name==='Geophilics').canonicalProjectId,'geophilic'); assert.equal(ep1.mods.find(m=>m.name==="Yung's Better Jungle Temples").canonicalProjectId,'yung-s-better-jungle-temples'); assert.equal(ep1.mods.find(m=>m.name==='Explosive Enhancements').canonicalProjectId,'explosive-enhancement'); assert.equal(ep1.mods.find(m=>m.name==="Moog's End Structures").canonicalProjectId,'moog-s-end-structures');
const fof=vault.projects.find(p=>p.id==='friends-and-foes'); assert(fof&&fof.providerLinks.length===4); assert(fof.providerLinks.some(x=>x.provider==='Modrinth'&&x.label==='Fabric/Quilt')); assert(fof.providerLinks.some(x=>x.provider==='CurseForge'&&x.label==='Forge/NeoForge'));
const itemBorders=vault.projects.find(p=>p.id==='item-borders'); assert(itemBorders&&itemBorders.providerLinks.length===3); assert(itemBorders.providerLinks.some(x=>x.provider==='CurseForge'&&x.label==='Fabric')); assert(itemBorders.providerLinks.some(x=>x.provider==='CurseForge'&&x.label==='Forge/NeoForge'));
const merchant=vault.projects.find(p=>p.id==='merchant-markers'); assert(merchant&&merchant.providerLinks.length===3);
assert.deepEqual(vault.projects.find(p=>p.id==='voxelmap').providerLinks.map(x=>x.provider),['CurseForge']); assert.deepEqual(vault.projects.find(p=>p.id==='nvidium').providerLinks.map(x=>x.provider),['Modrinth']);

// UI / renderer regression gate.
const addonJs=fs.readFileSync(path.join(root,'catalog','creator-vault','creator-vault.js'),'utf8'); new vm.Script(addonJs,{filename:'creator-vault.js'}); const css=fs.readFileSync(path.join(root,'catalog','creator-vault','creator-vault.css'),'utf8'); assert(addonJs.includes('Duplicate-free search')&&addonJs.includes('Every source mention')&&addonJs.includes('providerActions(project,project.name)')&&addonJs.includes('link.label?')); assert(css.includes('.cv-merged-card')&&css.includes('.cv-project-grid'));
const rendered=renderCatalog({id:'creator-vault-qa',name:'Creator Vault QA',items:[],assets:{},documents:[],sources:[]},root); for(const needle of ['youtube:kreksuminecraft','youtube:asianhalfsquat','youtube:enderversemc','Snowy Spirit',"Pufferfish's Skills",'https://modrinth.com/mod/friends-and-foes-forge','https://www.curseforge.com/minecraft/mc-mods/item-borders-fabric','Find in Enderloom']) assert(rendered.html.includes(needle),`rendered output missing ${needle}`);
console.log(`Creator Vault QA passed: ${vault.stats.recommendations} mentions -> ${vault.stats.uniqueProjects} canonical projects; ${vault.stats.verifiedProjects} linked / ${vault.stats.providerDestinations} destinations / ${vault.stats.multiProviderProjects} multi-provider / ${vault.stats.unresolvedProjects} unresolved.`);
