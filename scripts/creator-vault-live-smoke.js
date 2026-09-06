'use strict';

process.env.ENDERLOOM_DISABLE_CREATOR_AUTO_SYNC = '1';
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const electron = require('electron');
const { app } = electron;
const { DEFAULT_SETTINGS } = require('../src/creator-vault-auto/common');
const { parseCreatorDescription } = require('../src/creator-vault-auto/parser');
const { setElectronApi, beginBrowserPool, endBrowserPool, enumerateCreatorVideos, readCreatorVideo } = require('../src/creator-vault-auto/browser');
const { searchModrinth } = require('../src/creator-vault-auto/resolver');

const results = [];
async function probe(name, fn, required=true) {
  const started = Date.now();
  try {
    const detail = await fn();
    results.push({ name, ok:true, required, ms:Date.now()-started, detail });
  } catch (error) {
    results.push({ name, ok:false, required, ms:Date.now()-started, error:String(error?.stack || error) });
  }
}

app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-live-smoke-')));
app.commandLine.appendSwitch('disable-gpu');
app.whenReady().then(async () => {
  setElectronApi(electron);
  beginBrowserPool(2);
  const settings = { ...DEFAULT_SETTINGS, browserHistoryScrollPasses:18, browserPoolSize:2, maxIncrementalVideosPerCreator:4 };
  const youtube = { id:'youtube:asianhalfsquat', title:'AsianHalfSquat', platform:'youtube', url:'https://www.youtube.com/@AsianHalfSquat' };
  const tiktok = { id:'tiktok:kizamiringo', title:'Kizamiringo', platform:'tiktok', url:'https://www.tiktok.com/@kizamiringo' };

  await probe('YouTube incremental enumeration', async () => {
    const refs = await enumerateCreatorVideos(youtube, [], false, settings);
    assert(refs.length > 0, 'no YouTube uploads discovered');
    assert(refs.some(ref => /^[A-Za-z0-9_-]{11}$/.test(ref.id)), 'no valid YouTube video IDs discovered');
    return { discovered:refs.length, first:refs[0]?.id, tabs:[...new Set(refs.map(ref=>ref.sourceTab).filter(Boolean))] };
  });

  await probe('YouTube real recommendation extraction', async () => {
    const ref = { id:'hBpVYqfyeNM', url:'https://www.youtube.com/watch?v=hBpVYqfyeNM', title:'Top 10 Minecraft Mods' };
    const details = await readCreatorVideo(youtube, ref);
    assert(details.title || details.description, 'YouTube video metadata was empty');
    const projects = parseCreatorDescription({ title:details.title, text:details.description, platform:'youtube', links:details.links });
    assert(projects.length >= 5, `expected recommendation list, extracted ${projects.length}`);
    return { title:details.title, projects:projects.length, firstProjects:projects.slice(0,3).map(project=>project.name) };
  });

  await probe('Modrinth exact resolver', async () => {
    const hit = await searchModrinth({ name:'Sodium', projectType:'mod' });
    assert(hit?.links?.some(link => /modrinth\.com\/mod\/sodium/i.test(link.url)), 'Sodium canonical Modrinth project was not resolved');
    return { score:hit.score, url:hit.links[0].url };
  });

  await probe('TikTok tracked creator enumeration', async () => {
    const refs = await enumerateCreatorVideos(tiktok, [], false, settings);
    assert(refs.length > 0, 'no TikTok videos discovered');
    assert(refs.some(ref => /^\d{8,}$/.test(ref.id)), 'no valid TikTok video IDs discovered');
    const first = refs[0];
    const details = await readCreatorVideo(tiktok, first);
    assert(details.title || details.description, 'TikTok video metadata was empty');
    return { discovered:refs.length, first:first.id, sample:String(details.description || details.title).slice(0,120) };
  });

  endBrowserPool();
  const requiredFailures = results.filter(result => result.required && !result.ok);
  console.log('CREATOR_VAULT_LIVE_SMOKE ' + JSON.stringify({ passed:requiredFailures.length===0, results }));
  try { fs.rmSync(app.getPath('userData'), { recursive:true, force:true }); } catch {}
  app.exit(requiredFailures.length ? 1 : 0);
}).catch(error => {
  console.error(error);
  try { endBrowserPool(); } catch {}
  app.exit(1);
});
