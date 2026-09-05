'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');
const { renderCatalog } = require('../src/catalog-renderer');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root,'catalog','creator-vault','recommendation-sources','asianhalfsquat.history-batch27.json');
const providerPath = path.join(root,'catalog','creator-vault','project-sources','provider-closure-27a-asianhalfsquat.json');
const creatorsPath = path.join(root,'catalog','creator-vault','creators.json');
const chunk26CreatorsBaselinePath = path.join(root,'catalog','creator-vault','research','creators.chunk26-baseline.json');
const candidatesPath = path.join(root,'catalog','creator-vault','research','asianhalfsquat.chunk27-provider-candidates.json');
const researchPath = path.join(root,'catalog','creator-vault','research','asianhalfsquat.chunk27-source.json');
const frozenQaPath = path.join(__dirname,'creator-vault-qa-chunk26.js');

// Prove chunk 26 byte-for-byte first. Hide only chunk 27 production files,
// swap only the frozen creator ledger, execute the exact chunk-26 wrapper,
// then restore current state before enforcing chunk 27.
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-ahs27-qa-'));
let sourceBackup = null;
let providerBackup = null;
let currentCreatorsBackup = null;
try {
  assert(fs.existsSync(sourcePath),'AsianHalfSquat chunk 27 production source file missing');
  assert(fs.existsSync(providerPath),'AsianHalfSquat chunk 27 provider overlay missing');
  assert(fs.existsSync(creatorsPath),'current creators ledger must exist');
  assert(fs.existsSync(chunk26CreatorsBaselinePath),'chunk 26 creators baseline must exist');
  assert(fs.existsSync(frozenQaPath),'frozen chunk 26 QA must exist');
  sourceBackup = path.join(tempDir,path.basename(sourcePath));
  providerBackup = path.join(tempDir,path.basename(providerPath));
  currentCreatorsBackup = path.join(tempDir,'creators.current.json');
  fs.renameSync(sourcePath,sourceBackup);
  fs.renameSync(providerPath,providerBackup);
  fs.renameSync(creatorsPath,currentCreatorsBackup);
  fs.copyFileSync(chunk26CreatorsBaselinePath,creatorsPath);
  const baseline = loadCreatorVault(root);
  assert.equal(baseline.stats.recommendations,814);
  assert.equal(baseline.stats.uniqueProjects,585);
  assert.equal(baseline.stats.providerDestinations,1099);
  const legacy = spawnSync(process.execPath,[frozenQaPath],{cwd:root,stdio:'inherit'});
  assert.equal(legacy.status,0,'chunk 26 baseline regression suite must remain green byte-for-byte');
} finally {
  if (currentCreatorsBackup && fs.existsSync(currentCreatorsBackup)) {
    if (fs.existsSync(creatorsPath)) fs.rmSync(creatorsPath,{force:true});
    fs.renameSync(currentCreatorsBackup,creatorsPath);
  }
  if (providerBackup && fs.existsSync(providerBackup)) fs.renameSync(providerBackup,providerPath);
  if (sourceBackup && fs.existsSync(sourceBackup)) fs.renameSync(sourceBackup,sourcePath);
  fs.rmSync(tempDir,{recursive:true,force:true});
}

const vault = loadCreatorVault(root);
assert.equal(vault.schemaVersion,1);
assert.equal(vault.videos.length,54,'3 Kreksu + 45 AsianHalfSquat + 6 EnderVerse videos');
assert.equal(vault.stats.recommendations,833,'814 prior mentions + 19 AsianHalfSquat history batch 27 mentions');
assert.equal(vault.stats.uniqueProjects,600,'chunk 27 adds fifteen globally new canonical projects');
assert.equal(vault.projects.reduce((sum,project)=>sum+project.mentionCount,0),833,'every source mention survives canonicalization');
assert.equal(vault.stats.verifiedProjects,598);
assert.equal(vault.stats.unresolvedProjects,2);
assert.equal(vault.stats.multiProviderProjects,416);
assert.equal(vault.stats.providerDestinations,1139);
assert.equal(vault.stats.nativeRecommendationSources,23);
assert.deepEqual(vault.projects.filter(project=>!project.providerLinks.length).map(project=>project.name).sort(),['Better Book Recipe','Plank and Junk']);
assert.equal(vault.diagnostics.filter(item=>item.level==='error').length,0);

const ahs = vault.creators.find(creator=>creator.id==='youtube:asianhalfsquat');
assert(ahs);
assert.equal(ahs.coverage.expectedVideos,350);
assert.equal(ahs.coverage.indexedVideos,45);
assert.equal(ahs.coverage.recommendationCount,574);
assert.equal(ahs.coverage.verifiedProjectHomes,574);
const ahsVideos = vault.videos.filter(video=>video.creatorId===ahs.id);
const ahsMods = ahsVideos.flatMap(video=>video.mods);
assert.equal(ahsVideos.length,45);
assert.equal(ahsMods.length,574);
const ahsLinked = ahsMods.filter(mod=>mod.providerLinks.length>0);
assert.equal(ahsLinked.length,574);
assert.equal(new Set(ahsMods.map(mod=>mod.canonicalProjectId)).size,378);
assert.equal(new Set(ahsLinked.map(mod=>mod.canonicalProjectId)).size,378);

const video = ahsVideos.find(item=>item.id==='youtube:4QMpIDcPaJI');
assert(video,'chunk 27 September 6 source video must load');
assert.equal(video.publishedAt,'2024-09-06');
assert.equal(video.title,'The Best Minecraft Mods That Completely Enhance Combat');
assert.equal(video.mods.length,19);
const expected = new Map([
  ['Old Combat Mod',{id:'old-combat-mod',seconds:113}],
  ['Sword Parry',{id:'sword-parry',seconds:113}],
  ['Better Combat',{id:'better-combat',seconds:113}],
  ['Simply Swords',{id:'simply-swords',seconds:113}],
  ['Immersive Combat',{id:'immersive-combat',seconds:113}],
  ["Mo' Bends",{id:'mo-bends',seconds:113}],
  ['Epic Fight',{id:'epic-fight',seconds:113}],
  ['Guns Without Roses',{id:'guns-without-roses',seconds:267}],
  ["MrCrayfish's Gun Mod",{id:'mrcrayfishs-gun-mod',seconds:267}],
  ['ModularWarfare - Guns and More',{id:'modularwarfare',seconds:267}],
  ['ModularMovements',{id:'modularmovements',seconds:267}],
  ['Timeless and Classics Zero',{id:'timeless-and-classics-zero',seconds:267}],
  ['Body Camera Shader',{id:'body-camera-shader',seconds:267}],
  ['Blockfront',{id:'blockfront',seconds:267}],
  ["Electroblob's Wizardry",{id:'electroblobs-wizardry',seconds:458}],
  ['Wizards (RPG Series)',{id:'wizards',seconds:458}],
  ['Arcanus Continuum',{id:'arcanus',seconds:458}],
  ["Iron's Spells 'n Spellbooks",{id:'irons-spells-n-spellbooks',seconds:458}],
  ['Mahau Tsukai',{id:'mahou-tsukai',seconds:458}]
]);
for (const mod of video.mods) {
  const row = expected.get(mod.name);
  assert(row,`unexpected chunk-27 source label: ${mod.name}`);
  assert.equal(mod.canonicalProjectId,row.id,`canonical identity: ${mod.name}`);
  assert.equal(mod.timestampSeconds,row.seconds,`creator section timestamp: ${mod.name}`);
  assert.equal(mod.videoLink,`${video.url}&t=${row.seconds}s`,`exact creator section deep link: ${mod.name}`);
  assert(mod.providerLinks.length>0,`direct provider home required: ${mod.name}`);
}
assert.equal(new Set(video.mods.map(mod=>mod.canonicalProjectId)).size,19);

const project = id => {
  const hit = vault.projects.find(item=>item.id===id);
  assert(hit,`canonical project missing: ${id}`);
  return hit;
};
const links = id => project(id).providerLinks;
const hasUrl = (id,url) => links(id).some(link=>link.url===url);
const providers = id => [...new Set(links(id).map(link=>link.provider))].sort();
assert.deepEqual(providers('old-combat-mod'),['CurseForge','GitHub','Modrinth']);
assert.deepEqual(providers('sword-parry'),['CurseForge','GitHub','Modrinth']);
assert.deepEqual(providers('immersive-combat'),['CurseForge','GitHub']);
assert.deepEqual(providers('mo-bends'),['CurseForge','GitHub']);
assert.deepEqual(providers('guns-without-roses'),['CurseForge','GitHub','Modrinth']);
assert.deepEqual(providers('timeless-and-classics-zero'),['CurseForge','GitHub','Modrinth']);
assert.deepEqual(providers('blockfront'),['CurseForge','Modrinth','Official']);
assert.deepEqual(providers('wizards'),['CurseForge','GitHub','Modrinth']);
assert.deepEqual(providers('arcanus'),['CurseForge','GitHub','Modrinth']);
assert.deepEqual(providers('irons-spells-n-spellbooks'),['CurseForge','GitHub','Modrinth']);
assert.deepEqual(providers('mahou-tsukai'),['CurseForge','Modrinth']);
assert.deepEqual(providers('simply-swords'),['CurseForge','GitHub','Modrinth']);
assert(hasUrl('sword-parry','https://github.com/Xires87/SwordParry'));
assert(hasUrl('immersive-combat','https://github.com/bglandolt/bettercombat'));
assert(hasUrl('timeless-and-classics-zero','https://github.com/MCModderAnchor/TACZ'));
assert(hasUrl('blockfront','https://www.blockfrontmc.com/'));
assert(hasUrl('arcanus','https://github.com/CammiesCorner/Arcanus'));
assert(hasUrl('simply-swords','https://github.com/Sweenus/SimplySwords'));
assert(project('sword-parry').aliases.includes('Sword Parry'));
assert(project('arcanus').aliases.includes('Arcanus Continuum'));
assert(project('mahou-tsukai').aliases.includes('Mahau Tsukai'));
assert(!vault.projects.some(item=>item.id==='mahau-tsukai'),'creator typo must not create duplicate Mahau Tsukai card');
assert(!vault.projects.some(item=>item.id==='arcanus-continuum'),'historical Arcanus Continuum label must not create duplicate card');

const raw = JSON.parse(fs.readFileSync(sourcePath,'utf8'));
assert.equal(raw.videos.length,1);
const rawVideo = raw.videos[0];
assert.equal(rawVideo.id,'youtube:4QMpIDcPaJI');
assert.equal(rawVideo.mods.length,19);
assert.deepEqual(rawVideo.excludedEvidence.map(item=>[item.sourceLabel,item.status]),[
  ['War Thunder','sponsor-excluded'],
  ['Ovani Sound - Rockslides / Industrial Chugga / To The Wall','non-project']
]);
for (const mod of rawVideo.mods) {
  const row = expected.get(mod.name);
  assert(row);
  assert.equal(mod.timestampSeconds,row.seconds);
  assert(['Melee Mods','Ranged Weapons','Magic'].includes(mod.sectionLabel));
}

const research = JSON.parse(fs.readFileSync(researchPath,'utf8'));
assert.equal(research.videos.length,1);
assert.equal(research.sourceMentions,19);
const resolved = (research.resolvedChronology||[]).find(item=>item.publishedAt==='2024-09-06');
assert(resolved,'September 6 chronology resolution must be permanent');
assert.equal(resolved.resolvedVideoId,'4QMpIDcPaJI');
assert.equal(resolved.resolvedTitle,'The Best Minecraft Mods That Completely Enhance Combat');
assert.equal(research.videos[0].sourceIdentityEvidence.analyticsViews,243130);
assert.equal(research.videos[0].sourceIdentityEvidence.analyticsLikes,10811);
assert.equal(research.videos[0].sourceIdentityEvidence.analyticsComments,391);

const providerRaw = JSON.parse(fs.readFileSync(providerPath,'utf8'));
assert.equal(providerRaw.entries.length,16);
assert.equal(providerRaw.entries.reduce((sum,entry)=>sum+entry[4].length,0),40);
assert.deepEqual(providerRaw.entries.filter(entry=>entry[4].length===0),[]);
const candidates = JSON.parse(fs.readFileSync(candidatesPath,'utf8'));
assert.equal(candidates.entries.length,16);
assert.equal(candidates.entries.reduce((sum,entry)=>sum+entry[4].length,0),40);
assert.deepEqual(candidates.entries.filter(entry=>entry[4].length===0),[]);

// Permanent collision proof is intentionally scoped to the 40 incoming Chunk 27 URLs.
// Historical registry aliases can legitimately share a URL and are outside this chunk's mutation scope.
const ownersByUrl = new Map();
for (const item of vault.projects) {
  for (const link of item.providerLinks) {
    const key = link.url.replace(/\/$/,'').toLowerCase();
    if (!ownersByUrl.has(key)) ownersByUrl.set(key,new Set());
    ownersByUrl.get(key).add(item.id);
  }
}
for (const [id,,, ,candidateLinks] of providerRaw.entries) {
  for (const [,url] of candidateLinks) {
    const key = url.replace(/\/$/,'').toLowerCase();
    const owners = [...(ownersByUrl.get(key) || new Set())].sort();
    assert.deepEqual(owners,[id],`chunk 27 provider URL owner mismatch: ${url}`);
  }
}

const rendered = renderCatalog({id:'creator-vault-qa-ahs27',name:'Creator Vault QA AsianHalfSquat 27',items:[],assets:{},documents:[],sources:[]},root);
for (const needle of [
  'youtube:4QMpIDcPaJI','Old Combat Mod','Sword Parry','Better Combat','Simply Swords','Immersive Combat',"Mo' Bends",'Epic Fight','Guns Without Roses',"MrCrayfish's Gun Mod",'ModularWarfare - Guns and More','ModularMovements','Timeless and Classics Zero','Body Camera Shader','Blockfront',"Electroblob's Wizardry",'Wizards (RPG Series)','Arcanus Continuum',"Iron's Spells 'n Spellbooks",'Mahau Tsukai','Mahou Tsukai','https://github.com/MCModderAnchor/TACZ','https://github.com/CammiesCorner/Arcanus','Find in Enderloom'
]) assert(rendered.html.includes(needle),`rendered AsianHalfSquat chunk 27 output missing ${needle}`);

console.log(`Creator Vault AsianHalfSquat chunk 27 QA passed: ${vault.stats.recommendations} mentions -> ${vault.stats.uniqueProjects} canonical projects; ${vault.stats.verifiedProjects} linked / ${vault.stats.providerDestinations} destinations / ${vault.stats.multiProviderProjects} multi-provider / ${vault.stats.unresolvedProjects} unresolved. AHS linked mentions=${ahsLinked.length}/${ahsMods.length} across ${new Set(ahsMods.map(mod=>mod.canonicalProjectId)).size} canonical projects; Sep-6 identity recovery, all 19 section timestamps/deep links, 15-new/4-reuse canonicalization, 16-card/40-destination provider closure, alias/anti-false-merge rules, exclusions, and recursive chunk-26 baseline are locked.`);
