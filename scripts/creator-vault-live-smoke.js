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
let youtubeRefs = [];
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
    youtubeRefs = await enumerateCreatorVideos(youtube, [], false, settings);
    assert(youtubeRefs.length > 0, 'no YouTube uploads discovered');
    assert(youtubeRefs.some(ref => /^[A-Za-z0-9_-]{11}$/.test(ref.id)), 'no valid YouTube video IDs discovered');
    return {
      discovered:youtubeRefs.length,
      first:youtubeRefs[0]?.id,
      paths:[...new Set(youtubeRefs.map(ref=>ref.sourceTab).filter(Boolean))],
      feedRecords:youtubeRefs.filter(ref=>/^feed(?:\+|$)/.test(ref.sourceTab || '') || ref.description).length,
    };
  });

  await probe('YouTube live recommendation extraction', async () => {
    assert(youtubeRefs.length > 0, 'YouTube enumeration did not supply candidates');
    const pattern = /\b(mods?|addons?|resource\s*packs?|texture\s*packs?|shaders?|datapacks?|plugins?)\b/i;
    const preferred = youtubeRefs.filter(ref => pattern.test(String(ref.title || '')));
    const fallback = { id:'hBpVYqfyeNM', url:'https://www.youtube.com/watch?v=hBpVYqfyeNM', title:'Top 10 Minecraft Mods' };
    const seen = new Set();
    const ordered = [...preferred, ...youtubeRefs, fallback].filter(ref => {
      if (!ref?.id || seen.has(ref.id)) return false;
      seen.add(ref.id);
      return true;
    });
    const attempts = [];
    for (const ref of ordered.slice(0,16)) {
      try {
        const details = await readCreatorVideo(youtube, ref);
        const projects = parseCreatorDescription({ title:details.title || ref.title, text:details.description, platform:'youtube', links:details.links });
        attempts.push({ id:ref.id, title:details.title || ref.title || '', projects:projects.length, source:details.source || ref.sourceTab || '' });
        if (projects.length >= 3) {
          return {
            id:ref.id,
            title:details.title || ref.title || '',
            source:details.source || ref.sourceTab || '',
            projects:projects.length,
            firstProjects:projects.slice(0,3).map(project => project.name),
            attempts:attempts.length,
          };
        }
      } catch (error) {
        attempts.push({ id:ref.id, title:ref.title || '', error:String(error?.message || error) });
      }
    }
    throw new Error(`no live AsianHalfSquat recommendation yielded >=3 projects: ${JSON.stringify(attempts)}`);
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
    const first = refs.find(ref => ref.title) || refs[0];
    const details = await readCreatorVideo(tiktok, first);
    assert(details.title || details.description, 'TikTok video metadata was empty');
    return { discovered:refs.length, first:first.id, path:first.sourceTab || '', source:details.source || '', sample:String(details.description || details.title).slice(0,120) };
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
