'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');
const { renderCatalog } = require('../src/catalog-renderer');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'catalog', 'creator-vault', 'recommendation-sources', 'asianhalfsquat.history-batch22.json');
const providerAPath = path.join(root, 'catalog', 'creator-vault', 'project-sources', 'provider-closure-22a-asianhalfsquat.json');
const providerBPath = path.join(root, 'catalog', 'creator-vault', 'project-sources', 'provider-closure-22b-asianhalfsquat.json');
const chunk22Paths = [sourcePath, providerAPath, providerBPath];
const creatorsPath = path.join(root, 'catalog', 'creator-vault', 'creators.json');
const chunk21CreatorsBaselinePath = path.join(root, 'catalog', 'creator-vault', 'research', 'creators.chunk21-baseline.json');

// Prove the exact prior checkpoint first. Hide only chunk 22 production data,
// swap only the chunk-21 creator ledger, run the byte-for-byte chunk-21 QA,
// then restore current state before enforcing the chunk-22 contract.
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-ahs22-qa-'));
const moved = [];
let currentCreatorsBackup = null;
try {
  for (const file of chunk22Paths) {
    assert(fs.existsSync(file), `AsianHalfSquat chunk 22 production file missing: ${path.relative(root, file)}`);
    const target = path.join(tempDir, path.basename(file));
    fs.renameSync(file, target);
    moved.push([file, target]);
  }
  assert(fs.existsSync(creatorsPath), 'current creators ledger must exist');
  assert(fs.existsSync(chunk21CreatorsBaselinePath), 'chunk 21 creators baseline must exist');
  currentCreatorsBackup = path.join(tempDir, 'creators.current.json');
  fs.renameSync(creatorsPath, currentCreatorsBackup);
  fs.copyFileSync(chunk21CreatorsBaselinePath, creatorsPath);
  const legacy = spawnSync(process.execPath, [path.join(__dirname, 'creator-vault-qa-chunk21.js')], { cwd: root, stdio: 'inherit' });
  assert.equal(legacy.status, 0, 'chunk 21 baseline regression suite must remain green byte-for-byte');
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
assert.equal(vault.videos.length, 49, '3 Kreksu + 40 AsianHalfSquat + 6 EnderVerse videos');
assert.equal(vault.stats.recommendations, 781, '750 prior mentions + 31 AsianHalfSquat history batch 22 mentions');
assert.equal(vault.stats.uniqueProjects, 572);
assert.equal(vault.projects.reduce((sum, project) => sum + project.mentionCount, 0), 781, 'every source mention survives canonicalization');
assert.equal(vault.stats.verifiedProjects, 570);
assert.equal(vault.stats.unresolvedProjects, 2);
assert.equal(vault.stats.multiProviderProjects, 387);
assert.equal(vault.stats.providerDestinations, 1063);
assert.equal(vault.stats.nativeRecommendationSources, 18);
assert.deepEqual(vault.projects.filter(project => !project.providerLinks.length).map(project => project.name).sort(), ['Better Book Recipe', 'Plank and Junk']);
assert.equal(vault.diagnostics.filter(item => item.level === 'error').length, 0);

const ahs = vault.creators.find(creator => creator.id === 'youtube:asianhalfsquat');
assert(ahs);
assert.equal(ahs.coverage.expectedVideos, 350);
assert.equal(ahs.coverage.indexedVideos, 40);
assert.equal(ahs.coverage.recommendationCount, 522);
assert.equal(ahs.coverage.verifiedProjectHomes, 522);
const ahsVideos = vault.videos.filter(video => video.creatorId === ahs.id);
const ahsMods = ahsVideos.flatMap(video => video.mods);
assert.equal(ahsVideos.length, 40);
assert.equal(ahsMods.length, 522);
const ahsLinkedMentions = ahsMods.filter(mod => mod.providerLinks.length > 0).length;
const ahsLinkedCanonical = new Set(ahsMods.filter(mod => mod.providerLinks.length > 0).map(mod => mod.canonicalProjectId)).size;
assert.equal(ahsLinkedMentions, 522);
assert.equal(ahsLinkedCanonical, 346);

const video = ahsVideos.find(item => item.id === 'youtube:xXaGrrwmLUg');
assert(video, 'chunk 22 source video must load');
assert.equal(video.publishedAt, '2024-10-05');
assert.equal(video.mods.length, 31);
assert.equal(new Set(video.mods.map(mod => mod.canonicalProjectId)).size, 31, 'all 31 source mentions are distinct canonical identities within this video');
const expected = new Map([
  ['NoCubes',['nocubes',96]],
  ['Foliage & Trees Realistic 3D HD NoCube',['vrrw-overworld-foliage-and-trees',96]],
  ['Kappa Shader',['kappa-shader',96]],
  ['Optifine',['optifine',96]],
  ['Physics Mod Pro',['physics-mod',150]],
  ['Pegasus Shader',['pegasus-shaders',150]],
  ['No Light - No Color',['no-light-no-color',186]],
  ['RyoamicLights',['ryoamiclights',186]],
  ['ImmersiveMC',['immersivemc',226]],
  ['Visual Overhaul',['visual-overhaul',226]],
  ['Easy Anvils',['easy-anvils',226]],
  ['Easy Magic',['easy-magic',226]],
  ["Os' Colorful Grasses",['os-colorful-grasses',273]],
  ["O's Colorful Leaves",['os-colorful-leaves',273]],
  ['Grass+',['grass-plus',273]],
  ["dronko's alternative Bushy Leaves",['dronkos-alternative-bushy-leaves',273]],
  ['Fancy Crops',['fancy-crops',273]],
  ['RetroVision',['retrovision',325]],
  ['CameraOverhaul',['cameraoverhaul',325]],
  ['Complementary Shaders',['complementary-shaders',351]],
  ['Bare Bones',['bare-bones',351]],
  ['Bliss Shaders',['bliss-shaders',388]],
  ['Nullscape',['nullscape',388]],
  ['AmbientSounds',['ambientsounds',388]],
  ['Fresh Animations',['fresh-animations',438]],
  ['Fresh Animations Extensions',['fresh-animations-extensions',438]],
  ['Fresh Skeleton Physics',['fresh-skeleton-physics',438]],
  ['Fresh Moves',['fresh-moves',438]],
  ['Circumnavigate',['circumnavigate',488]],
  ['BSL Shaders',['bsl-shaders',488]],
  ['Astrocraft',['astrocraft',488]]
]);
assert.equal(expected.size, 31);
assert.deepEqual([...new Set([...expected.values()].map(([,seconds]) => seconds))].sort((a,b)=>a-b), [96,150,186,226,273,325,351,388,438,488]);
for (const mod of video.mods) {
  const contract = expected.get(mod.name);
  assert(contract, `unexpected chunk-22 source label: ${mod.name}`);
  assert.equal(mod.canonicalProjectId, contract[0], `canonical identity: ${mod.name}`);
  assert.equal(mod.timestampSeconds, contract[1], `creator section timestamp: ${mod.name}`);
  assert.equal(mod.videoLink, `${video.url}&t=${contract[1]}s`, `creator section deep link: ${mod.name}`);
  assert(mod.providerLinks.length > 0, `verified direct project home required: ${mod.name}`);
}

const project = id => {
  const hit = vault.projects.find(item => item.id === id);
  assert(hit, `canonical project missing: ${id}`);
  return hit;
};
const links = id => project(id).providerLinks;
const providers = id => [...new Set(links(id).map(link => link.provider))].sort();
const hasUrl = (id, url) => links(id).some(link => link.url === url);
const expectProviders = (id, expectedProviders) => assert.deepEqual(providers(id), [...expectedProviders].sort(), `provider family: ${id}`);
for (const [id, family] of [
  ['vrrw-overworld-foliage-and-trees',['CurseForge','Modrinth']],
  ['kappa-shader',['CurseForge','Modrinth']],
  ['pegasus-shaders',['CurseForge','Modrinth']],
  ['no-light-no-color',['Modrinth']],
  ['immersivemc',['CurseForge','GitHub','Modrinth']],
  ['visual-overhaul',['CurseForge','GitHub','Modrinth']],
  ['easy-magic',['CurseForge','GitHub','Modrinth']],
  ['os-colorful-grasses',['CurseForge','Modrinth']],
  ['os-colorful-leaves',['Modrinth']],
  ['grass-plus',['Modrinth']],
  ['fancy-crops',['CurseForge','Modrinth']],
  ['retrovision',['CurseForge','Modrinth']],
  ['bare-bones',['CurseForge','Modrinth']],
  ['nullscape',['CurseForge','GitHub','Modrinth']],
  ['fresh-animations-extensions',['CurseForge','Modrinth']],
  ['fresh-skeleton-physics',['CurseForge','Modrinth']],
  ['fresh-moves',['CurseForge','GitHub','Modrinth']],
  ['circumnavigate',['CurseForge','GitHub','Modrinth']],
  ['astrocraft',['CurseForge','Modrinth']],
  ['physics-mod',['CurseForge','GitHub','Modrinth']],
  ['easy-anvils',['CurseForge','GitHub','Modrinth']]
]) expectProviders(id, family);
assert(hasUrl('vrrw-overworld-foliage-and-trees','https://modrinth.com/mod/foliage-and-trees'));
assert(hasUrl('vrrw-overworld-foliage-and-trees','https://www.curseforge.com/minecraft/mc-mods/foliage-hd-rtx'));
assert(hasUrl('physics-mod','https://github.com/haubna/PhysicsMod'));
assert(hasUrl('easy-anvils','https://github.com/Fuzss/easy-anvils'));
assert(hasUrl('visual-overhaul','https://github.com/TeamMidnightDust/VisualOverhaul'));
assert(hasUrl('immersivemc','https://github.com/hammy275/immersive-mc'));
assert(hasUrl('nullscape','https://github.com/Stardust-Labs-MC/Nullscape'));
assert(hasUrl('fresh-moves','https://github.com/IthanMendoza/Fresh-Moves'));
assert(hasUrl('circumnavigate','https://github.com/FamroFexl/Circumnavigate'));

// Alias/dedupe and anti-false-merge rules discovered by the provider-aware runtime.
assert.equal(project('os-colorful-grasses').name, "O's Colorful Grasses");
assert.equal(vault.projects.filter(item => item.id === 'os-colorful-grasses').length, 1, 'Colorful Grasses source spelling must rejoin the existing canonical card');
assert(project('vrrw-overworld-foliage-and-trees').aliases.includes('Foliage & Trees Realistic 3D HD NoCube'));
assert(project('pegasus-shaders').aliases.includes('Pegasus Shader'));
assert(project('no-light-no-color').aliases.includes('No Light - No Color'));
assert(project('os-colorful-leaves').aliases.includes("O's Colorful Leaves"));
assert(project('fancy-crops').aliases.includes('Fancy Crops'));
assert(project('fresh-animations-extensions').aliases.includes('Fresh Animations Extensions'));
assert(project('astrocraft').aliases.includes('Astrocraft'));
assert(project('fresh-moves').id !== project('trailer-player-animations').id, 'Fresh Moves must remain distinct from Trailer/Fresh Player Animations');
assert(!links('astrocraft').some(link => link.url.includes('/modpacks/')), 'Astrocraft must not absorb an unrelated modpack');
assert(!vault.projects.some(item => (item.providerLinks || []).some(link => link.url.includes('minecraft-bedrock/texture-packs/os-leaves'))), 'unrelated Bedrock Colorful Leaves copy must stay excluded');

const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const rawVideo = raw.videos.find(item => item.id === 'youtube:xXaGrrwmLUg');
assert(rawVideo && rawVideo.mods.length === 31);
assert.deepEqual(rawVideo.excludedEvidence.map(item => [item.sourceLabel,item.status]), [['Opera GX','sponsor-excluded'],['Music credits','non-project']]);
assert(!vault.projects.some(item => item.name === 'Opera GX'), 'sponsor must never become a canonical project');
for (const mod of rawVideo.mods) assert.equal(typeof mod.timestampSeconds, 'number', `raw creator timestamp required: ${mod.name}`);
const providerA = JSON.parse(fs.readFileSync(providerAPath, 'utf8'));
const providerB = JSON.parse(fs.readFileSync(providerBPath, 'utf8'));
assert.equal(providerA.entries.length, 11);
assert.equal(providerB.entries.length, 10);
assert.equal(providerA.entries.length + providerB.entries.length, 21);

const rendered = renderCatalog({ id:'creator-vault-qa-ahs22', name:'Creator Vault QA AsianHalfSquat 22', items:[], assets:{}, documents:[], sources:[] }, root);
for (const needle of [
  'youtube:xXaGrrwmLUg','Foliage &amp; Trees Realistic 3D HD NoCube','Kappa Shader','Pegasus Shader','ImmersiveMC','Visual Overhaul',
  'Fresh Animations Extensions','Fresh Skeleton Physics','Fresh Moves','Circumnavigate','Astrocraft',
  'https://modrinth.com/mod/foliage-and-trees','https://github.com/haubna/PhysicsMod','https://github.com/Fuzss/easy-anvils','Find in Enderloom'
]) assert(rendered.html.includes(needle) || rendered.html.includes(needle.replace('&amp;','&')), `rendered AsianHalfSquat chunk 22 output missing ${needle}`);

console.log(`Creator Vault AsianHalfSquat chunk 22 QA passed: ${vault.stats.recommendations} mentions -> ${vault.stats.uniqueProjects} canonical projects; ${vault.stats.verifiedProjects} linked / ${vault.stats.providerDestinations} destinations / ${vault.stats.multiProviderProjects} multi-provider / ${vault.stats.unresolvedProjects} unresolved. AHS linked mentions=${ahsLinkedMentions}/522 across ${ahsLinkedCanonical} canonical projects; all 31 creator-section timestamps/deep links, alias dedupe, sponsor exclusion, anti-false-merge rules, and bounded provider enrichments are locked.`);
