'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');
const { renderCatalog } = require('../src/catalog-renderer');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'catalog', 'creator-vault', 'recommendation-sources', 'asianhalfsquat.history-batch23.json');
const providerPath = path.join(root, 'catalog', 'creator-vault', 'project-sources', 'provider-closure-23a-asianhalfsquat.json');
const chunk23Paths = [sourcePath, providerPath];
const creatorsPath = path.join(root, 'catalog', 'creator-vault', 'creators.json');
const chunk22CreatorsBaselinePath = path.join(root, 'catalog', 'creator-vault', 'research', 'creators.chunk22-baseline.json');

// Prove chunk 22 byte-for-byte first. Hide only chunk 23 production,
// swap only the chunk-22 creator ledger, run the frozen chunk-22 wrapper,
// then restore the current state before enforcing chunk 23.
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-ahs23-qa-'));
const moved = [];
let currentCreatorsBackup = null;
try {
  for (const file of chunk23Paths) {
    assert(fs.existsSync(file), `AsianHalfSquat chunk 23 production file missing: ${path.relative(root, file)}`);
    const target = path.join(tempDir, path.basename(file));
    fs.renameSync(file, target);
    moved.push([file, target]);
  }
  assert(fs.existsSync(creatorsPath), 'current creators ledger must exist');
  assert(fs.existsSync(chunk22CreatorsBaselinePath), 'chunk 22 creators baseline must exist');
  currentCreatorsBackup = path.join(tempDir, 'creators.current.json');
  fs.renameSync(creatorsPath, currentCreatorsBackup);
  fs.copyFileSync(chunk22CreatorsBaselinePath, creatorsPath);
  const legacy = spawnSync(process.execPath, [path.join(__dirname, 'creator-vault-qa-chunk22.js')], { cwd: root, stdio: 'inherit' });
  assert.equal(legacy.status, 0, 'chunk 22 baseline regression suite must remain green byte-for-byte');
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
assert.equal(vault.videos.length, 50, '3 Kreksu + 41 AsianHalfSquat + 6 EnderVerse videos');
assert.equal(vault.stats.recommendations, 789, '781 prior mentions + 8 AsianHalfSquat history batch 23 mentions');
assert.equal(vault.stats.uniqueProjects, 573);
assert.equal(vault.projects.reduce((sum, project) => sum + project.mentionCount, 0), 789, 'every source mention survives canonicalization');
assert.equal(vault.stats.verifiedProjects, 571);
assert.equal(vault.stats.unresolvedProjects, 2);
assert.equal(vault.stats.multiProviderProjects, 389);
assert.equal(vault.stats.providerDestinations, 1068);
assert.equal(vault.stats.nativeRecommendationSources, 19);
assert.deepEqual(vault.projects.filter(project => !project.providerLinks.length).map(project => project.name).sort(), ['Better Book Recipe', 'Plank and Junk']);
assert.equal(vault.diagnostics.filter(item => item.level === 'error').length, 0);

const ahs = vault.creators.find(creator => creator.id === 'youtube:asianhalfsquat');
assert(ahs);
assert.equal(ahs.coverage.expectedVideos, 350);
assert.equal(ahs.coverage.indexedVideos, 41);
assert.equal(ahs.coverage.recommendationCount, 530);
assert.equal(ahs.coverage.verifiedProjectHomes, 530);
const ahsVideos = vault.videos.filter(video => video.creatorId === ahs.id);
const ahsMods = ahsVideos.flatMap(video => video.mods);
assert.equal(ahsVideos.length, 41);
assert.equal(ahsMods.length, 530);
const ahsLinkedMentions = ahsMods.filter(mod => mod.providerLinks.length > 0).length;
const ahsLinkedCanonical = new Set(ahsMods.filter(mod => mod.providerLinks.length > 0).map(mod => mod.canonicalProjectId)).size;
assert.equal(ahsLinkedMentions, 530);
assert.equal(ahsLinkedCanonical, 347);

const video = ahsVideos.find(item => item.id === 'youtube:KaiDjB1w_OY');
assert(video, 'chunk 23 source video must load');
assert.equal(video.publishedAt, '2024-10-02');
assert.equal(video.title, 'The Most Overkill Minecraft Terrain Generation Mod Available');
assert.equal(video.mods.length, 8);
const expected = new Map([
  ['JJThunder To The Max','jjthunder-to-the-max'],
  ['Distant Horizons','distant-horizons'],
  ['Big Globe','big-globe'],
  ['Terralith','terralith'],
  ['Tectonic','tectonic'],
  ['Chunky','chunky'],
  ['StepUpAgain','stepupagain'],
  ['Bliss Shaders','bliss-shaders']
]);
for (const mod of video.mods) {
  const canonicalId = expected.get(mod.name);
  assert(canonicalId, `unexpected chunk-23 source label: ${mod.name}`);
  assert.equal(mod.canonicalProjectId, canonicalId, `canonical identity: ${mod.name}`);
  assert.equal(mod.timestampSeconds, null, `missing creator timestamp must stay null: ${mod.name}`);
  assert.equal(mod.videoLink, video.url, `missing creator timestamp must use base video URL: ${mod.name}`);
  assert(!mod.videoLink.includes('t=0s'), `must never fabricate t=0s: ${mod.name}`);
  assert(mod.providerLinks.length > 0, `verified direct project home required: ${mod.name}`);
}
assert.equal(new Set(video.mods.map(mod => mod.canonicalProjectId)).size, 8);

const project = id => {
  const hit = vault.projects.find(item => item.id === id);
  assert(hit, `canonical project missing: ${id}`);
  return hit;
};
const links = id => project(id).providerLinks;
const providers = id => [...new Set(links(id).map(link => link.provider))].sort();
const hasUrl = (id, url) => links(id).some(link => link.url === url);
assert.deepEqual(providers('stepupagain'), ['GitHub','Modrinth']);
assert(hasUrl('stepupagain','https://modrinth.com/mod/stepupagain'));
assert(hasUrl('stepupagain','https://github.com/derrod/StepUp'));
assert.equal(vault.projects.filter(item => item.id === 'stepupagain').length, 1);
assert(!links('stepupagain').some(link => link.url.includes('stepupagain2')), 'later StepUpAgain2 project must not merge into StepUpAgain');
assert.deepEqual(providers('chunky'), ['CurseForge','GitHub','Modrinth']);
assert(hasUrl('chunky','https://modrinth.com/plugin/chunky'));
assert(hasUrl('chunky','https://www.curseforge.com/minecraft/mc-mods/chunky-pregenerator'));
assert(hasUrl('chunky','https://www.curseforge.com/minecraft/mc-mods/chunky-pregenerator-forge'));
assert(hasUrl('chunky','https://github.com/pop4959/Chunky'));

const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const rawVideo = raw.videos.find(item => item.id === 'youtube:KaiDjB1w_OY');
assert(rawVideo && rawVideo.mods.length === 8);
assert.deepEqual(rawVideo.excludedEvidence.map(item => [item.sourceLabel,item.status]), [['Music - Limitless','non-project']]);
for (const mod of rawVideo.mods) assert(!Object.prototype.hasOwnProperty.call(mod, 'timestampSeconds'), `raw timestamp must be omitted when creator provides none: ${mod.name}`);
const provider = JSON.parse(fs.readFileSync(providerPath, 'utf8'));
assert.equal(provider.entries.length, 2);
assert.deepEqual(provider.entries.map(entry => entry[0]).sort(), ['chunky','stepupagain']);

const rendered = renderCatalog({ id:'creator-vault-qa-ahs23', name:'Creator Vault QA AsianHalfSquat 23', items:[], assets:{}, documents:[], sources:[] }, root);
for (const needle of [
  'youtube:KaiDjB1w_OY','StepUpAgain','Chunky','https://modrinth.com/mod/stepupagain','https://github.com/derrod/StepUp',
  'https://www.curseforge.com/minecraft/mc-mods/chunky-pregenerator','https://www.curseforge.com/minecraft/mc-mods/chunky-pregenerator-forge','https://github.com/pop4959/Chunky','Find in Enderloom'
]) assert(rendered.html.includes(needle), `rendered AsianHalfSquat chunk 23 output missing ${needle}`);

console.log(`Creator Vault AsianHalfSquat chunk 23 QA passed: ${vault.stats.recommendations} mentions -> ${vault.stats.uniqueProjects} canonical projects; ${vault.stats.verifiedProjects} linked / ${vault.stats.providerDestinations} destinations / ${vault.stats.multiProviderProjects} multi-provider / ${vault.stats.unresolvedProjects} unresolved. AHS linked mentions=${ahsLinkedMentions}/530 across ${ahsLinkedCanonical} canonical projects; all 8 null timestamps/base links, StepUpAgain identity isolation, Chunky loader-specific provider enrichment, and recursive chunk-22 baseline are locked.`);
