'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const runtimeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-creator-auto-qa-'));
process.env.ENDERLOOM_CREATOR_VAULT_RUNTIME_DIR = runtimeDir;
process.env.ENDERLOOM_DISABLE_CREATOR_AUTO_SYNC = '1';

const parser = require('../src/creator-vault-auto/parser');
const common = require('../src/creator-vault-auto/common');
const resolver = require('../src/creator-vault-auto/resolver');
const state = require('../src/creator-vault-auto/state');
const runtime = require('../src/creator-vault-auto/runtime');

const tests = [];
function check(name, fn) {
  try {
    const detail = fn();
    tests.push({ name, ok:true, detail:detail == null ? '' : String(detail) });
  } catch (error) {
    tests.push({ name, ok:false, detail:String(error?.stack || error) });
  }
}

check('structured creator descriptions extract only project sections', () => {
  const rows = parser.parseCreatorDescription({
    platform:'youtube',
    title:'10 Minecraft Mods You Need',
    text:[
      'MODS:',
      '00:20 Sodium https://modrinth.com/mod/sodium',
      '01:03 [Lithium](https://modrinth.com/mod/lithium)',
      'MUSIC:',
      '02:00 Not A Mod',
      'OUTRO',
      '03:00 Also Not A Mod',
    ].join('\n'),
  });
  assert.deepStrictEqual(rows.map(row => row.name), ['Sodium','Lithium']);
  assert.strictEqual(rows[0].timestampSeconds, 20);
  assert(rows[0].urls[0].includes('modrinth.com/mod/sodium'));
  return `${rows.length} projects`;
});

check('creator mod-download headings are treated as project sections', () => {
  const rows = parser.parseCreatorDescription({
    title:'Top 10 Minecraft Mods You Need',
    platform:'youtube',
    text:'MOD DOWNLOADS:\nSodium - https://modrinth.com/mod/sodium\nLithium - https://modrinth.com/mod/lithium',
  });
  assert.deepStrictEqual(rows.map(row=>row.name), ['Sodium','Lithium']);
  const generic = parser.parseCreatorDescription({
    title:'My Favorite Minecraft Mods',
    platform:'youtube',
    text:'Downloads:\nModernFix https://www.curseforge.com/minecraft/mc-mods/modernfix',
  });
  assert.strictEqual(generic.length,1);
  assert.strictEqual(generic[0].name,'ModernFix');
});

check('timestamp chapters are inferred only for project-list titles', () => {
  const positive = parser.parseCreatorDescription({ title:'My 5 Favorite Minecraft Mods', text:'00:10 FerriteCore\n01:20 ModernFix' });
  const negative = parser.parseCreatorDescription({ title:'Minecraft Survival Episode 8', text:'00:10 Village\n01:20 Mining' });
  assert.strictEqual(positive.length, 2);
  assert.strictEqual(negative.length, 0);
});

check('YouTube initial player response parser preserves source description', () => {
  const payload = { videoDetails:{ videoId:'AbCdEfGhI12', title:'Fast Mods', shortDescription:'MODS:\nSodium https://modrinth.com/mod/sodium' }, microformat:{playerMicroformatRenderer:{publishDate:'2026-09-01'}} };
  const html = `<script>var ytInitialPlayerResponse = ${JSON.stringify(payload)};</script>`;
  const parsed = parser.parseYouTubeWatchHtml(html);
  assert.strictEqual(parsed.id, 'AbCdEfGhI12');
  assert.strictEqual(parsed.publishedAt, '2026-09-01');
  assert(parsed.description.includes('Sodium'));
});

check('TikTok hydration parser discovers creator video records', () => {
  const data = { __DEFAULT_SCOPE__:{ 'webapp.video-detail':{ itemInfo:{ itemStruct:{ id:'7412345678901234567', desc:'Mods: Sodium, Lithium', author:{uniqueId:'tester'} } } } } };
  const html = `<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">${JSON.stringify(data)}</script>`;
  const rows = parser.collectTikTokItemsFromHtml(html);
  assert.strictEqual(rows.length, 1);
  assert.strictEqual(rows[0].author, 'tester');
});

check('TikTok raw profile video paths are usable without hydration JSON', () => {
  const rows = parser.collectTikTokItemsFromHtml('<a href="/@tester/video/7412345678901234567">video</a>');
  assert.strictEqual(rows.length,1);
  assert.strictEqual(rows[0].id,'7412345678901234567');
  assert(rows[0].url.includes('@tester/video/7412345678901234567'));
});

check('provider URL classifier rejects social noise', () => {
  assert(common.projectLink('https://modrinth.com/mod/sodium'));
  assert(common.projectLink('https://www.curseforge.com/minecraft/mc-mods/modernfix'));
  assert(!common.projectLink('https://www.youtube.com/watch?v=AbCdEfGhI12'));
  assert(!common.projectLink('https://discord.gg/example'));
});

check('canonical matcher strongly prefers exact project identity', () => {
  assert(resolver.nameScore('FerriteCore', 'Ferrite Core') > 0.98);
  assert(resolver.nameScore('ModernFix', 'ModernFix') === 1);
  assert(resolver.nameScore('ModernFix', 'Completely Different Mod') < 0.5);
});

check('runtime state is atomic and runtime records override exact video IDs', () => {
  const seed = state.emptyRuntimeState();
  seed.creators.push({ id:'qa:creator', title:'QA Creator', platform:'youtube', url:'https://www.youtube.com/@qa-creator', coverage:{state:'current'} });
  seed.projects.push({ id:'qa-project', name:'QA Project', aliases:[], projectTypes:['mod'], providerLinks:[{provider:'Modrinth',url:'https://modrinth.com/mod/sodium',verified:true}] });
  seed.videos.push({ id:'youtube:qa-video', creatorId:'qa:creator', platform:'youtube', url:'https://www.youtube.com/watch?v=AbCdEfGhI12', title:'QA Mods', publishedAt:'2026-09-01', evidenceKinds:['qa'], mods:[{name:'QA Project',canonicalProjectId:'qa-project',canonicalName:'QA Project',projectType:'mod',providerLinks:[],timestamp:'00:10',timestampSeconds:10}] });
  assert(state.writeRuntimeState(seed));
  const file = state.runtimeFile();
  assert(fs.existsSync(file));
  assert(!fs.readdirSync(path.dirname(file)).some(name => name.endsWith('.tmp')));
  const merged = state.loadMergedCreatorVault(ROOT);
  const video = merged.videos.find(row => row.id === 'youtube:qa-video');
  assert(video);
  assert.strictEqual(video.mods[0].canonicalProjectId, 'qa-project');
  assert(merged.projects.some(project => project.id === 'qa-project'));
});

check('add creator normalizes YouTube/TikTok identities without network access', () => {
  const added = runtime.addCreator({ url:'https://www.youtube.com/@SpeedyMods', title:'Speedy Mods' });
  assert.strictEqual(added.creator.platform, 'youtube');
  assert.strictEqual(added.creator.handle, '@SpeedyMods');
  assert(added.creator.id.startsWith('youtube:'));
});

check('scanned non-project videos are classified to avoid repeated downloads', () => {
  assert(runtime.potentialRecommendation('20 Minecraft Mods You Need',''));
  assert(!runtime.potentialRecommendation('Survival Episode 14','Mining and building today'));
});

check('YouTube crawler covers uploads and Shorts, and full history adds Streams', () => {
  const source = fs.readFileSync(path.join(ROOT,'src','creator-vault-auto','browser.js'),'utf8');
  assert(source.includes("const tabs = ['videos','shorts', ...(full ? ['streams'] : [])]"));
  assert(source.includes('knownHits>0') || source.includes('knownHits > 0'));
});

check('preload exposes automatic Creator Vault IPC bridge', () => {
  const source = fs.readFileSync(path.join(ROOT,'catalog-preload.js'),'utf8');
  for (const name of ['creatorVaultStatus','creatorVaultSync','creatorVaultAdd','creatorVaultSettings','creatorVaultIgnoreReview','onCreatorVaultProgress']) assert(source.includes(name), name);
});

check('catalog compositor embeds merged runtime data and automatic controls', () => {
  const { renderCatalog } = require('../src/catalog-renderer');
  const rendered = renderCatalog({ id:'qa-catalog', name:'QA Catalog', items:[], assets:{}, documents:[], sources:[] }, ROOT);
  assert(rendered.html.includes('window.ENDERLOOM_CREATOR_VAULT='));
  assert(rendered.html.includes('Automatic Creator Catalog'));
  assert(rendered.html.includes('Sync new uploads'));
  assert(rendered.html.includes('qa-project'));
});

check('rendered runtime catalogs can be atomically refreshed after sync', () => {
  const userData = fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-creator-render-qa-'));
  state.configureUserDataDir(userData);
  const dir = path.join(userData,'catalog-center','runtime');
  fs.mkdirSync(dir,{recursive:true});
  const file = path.join(dir,'qa.html');
  fs.writeFileSync(file,'<script>window.ENDERLOOM_CREATOR_VAULT={"old":true};\nconsole.log("loaded")</script>');
  const result = state.patchRenderedCatalogs({fresh:true,stats:{videos:1}});
  assert.strictEqual(result.patched,1);
  const next = fs.readFileSync(file,'utf8');
  assert(next.includes('"fresh":true'));
  assert(!next.includes('"old":true'));
});

check('TikTok metadata requests are parallel and launch sync refreshes open catalog views', () => {
  const browserSource = fs.readFileSync(path.join(ROOT,'src','creator-vault-auto','browser.js'),'utf8');
  const facadeSource = fs.readFileSync(path.join(ROOT,'src','creator-vault-runtime.js'),'utf8');
  assert(browserSource.includes('Promise.allSettled'));
  assert(browserSource.includes('profile-http-fallback'));
  assert(facadeSource.includes('refreshOpenCatalogViews'));
  assert(facadeSource.includes('reloadIgnoringCache'));
});

check('parser stress stays comfortably interactive', () => {
  const sample='MODS:\n00:10 Sodium https://modrinth.com/mod/sodium\n00:20 Lithium https://modrinth.com/mod/lithium\nMUSIC:\n01:00 Song';
  const started=Date.now();
  let count=0;
  for(let index=0;index<750;index++)count+=parser.parseCreatorDescription({title:'Best Minecraft Mods',text:sample}).length;
  const elapsed=Date.now()-started;
  assert.strictEqual(count,1500);
  assert(elapsed<2500,`parser stress took ${elapsed}ms`);
  return `${elapsed}ms`;
});

try { fs.rmSync(runtimeDir,{recursive:true,force:true}); } catch {}
const failed = tests.filter(test => !test.ok);
console.log(JSON.stringify({ passed:failed.length===0, tests }, null, 2));
if (failed.length) process.exit(1);
