'use strict';

const { requestText, requestJson } = require('../public-http');
const { sleep, safeUrl, unique, clampInt, mapConcurrent } = require('./common');
const { parseYouTubeWatchHtml, collectTikTokItemsFromHtml } = require('./parser');

const PARTITION = 'persist:minecraft-catalog-live';
let electronApi = null;
let activePool = null;

function setElectronApi(value) {
  electronApi = value && typeof value === 'object' ? value : null;
}

class BrowserPool {
  constructor(size=3) {
    if (!electronApi?.BrowserWindow) throw new Error('Electron BrowserWindow is unavailable');
    this.max = clampInt(size, 3, 1, 6);
    this.idle = [];
    this.all = new Set();
    this.waiters = [];
    this.closed = false;
  }
  createWindow() {
    const win = new electronApi.BrowserWindow({
      show:false,
      width:1000,
      height:760,
      webPreferences:{
        partition:PARTITION,
        contextIsolation:true,
        nodeIntegration:false,
        sandbox:true,
        backgroundThrottling:false,
        images:false,
      },
    });
    win.webContents.setAudioMuted(true);
    this.all.add(win);
    win.once('closed', () => {
      this.all.delete(win);
      const index = this.idle.indexOf(win);
      if (index >= 0) this.idle.splice(index,1);
    });
    return win;
  }
  async acquire() {
    if (this.closed) throw new Error('Creator browser pool is closed');
    while (this.idle.length) {
      const win = this.idle.pop();
      if (win && !win.isDestroyed()) return win;
    }
    if (this.all.size < this.max) return this.createWindow();
    return new Promise((resolve, reject) => this.waiters.push({ resolve, reject }));
  }
  release(win, broken=false) {
    if (!win) return;
    if (broken || this.closed || win.isDestroyed()) {
      try { if (!win.isDestroyed()) win.destroy(); } catch {}
      if (!this.closed && this.waiters.length && this.all.size < this.max) {
        const waiter = this.waiters.shift();
        try { waiter.resolve(this.createWindow()); } catch (error) { waiter.reject(error); }
      }
      return;
    }
    const waiter = this.waiters.shift();
    if (waiter) waiter.resolve(win);
    else this.idle.push(win);
  }
  async withWindow(fn) {
    const win = await this.acquire();
    let broken = false;
    try {
      return await fn(win);
    } catch (error) {
      broken = /destroyed|closed|render process gone/i.test(String(error?.message || error));
      throw error;
    } finally {
      this.release(win, broken);
    }
  }
  close() {
    this.closed = true;
    for (const waiter of this.waiters.splice(0)) waiter.reject(new Error('Creator browser pool closed'));
    for (const win of this.all) { try { if (!win.isDestroyed()) win.destroy(); } catch {} }
    this.idle.length = 0;
    this.all.clear();
  }
}

function beginBrowserPool(size=3) {
  if (activePool) activePool.close();
  activePool = new BrowserPool(size);
  return activePool;
}
function endBrowserPool() {
  if (activePool) activePool.close();
  activePool = null;
}
function pool() {
  if (!activePool) activePool = new BrowserPool(3);
  return activePool;
}

async function loadUrlWithTimeout(win, url, timeoutMs=12000) {
  let timer;
  try {
    await Promise.race([
      win.loadURL(url),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          try { win.webContents.stop(); } catch {}
          reject(new Error(`Creator page load timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function browserSnapshot(url, { platform='generic', full=false, knownIds=[], maxPasses=120, maxItems=0 } = {}) {
  if (!electronApi?.BrowserWindow || !electronApi?.app?.isReady?.()) throw new Error('Browser-backed creator discovery is unavailable');
  return pool().withWindow(async win => {
    await loadUrlWithTimeout(win, url, platform === 'tiktok' ? 15000 : 12000);
    await sleep(platform === 'tiktok' ? 650 : 350);
    const result = await win.webContents.executeJavaScript(`(async()=>{
      const platform=${JSON.stringify(platform)};
      const full=${JSON.stringify(!!full)};
      const known=new Set(${JSON.stringify((knownIds || []).slice(0,5000))});
      const passes=${JSON.stringify(clampInt(maxPasses,120,4,240))};
      const maxItems=${JSON.stringify(Math.max(0, Number(maxItems)||0))};
      const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
      const rows=new Map();
      let stable=0,lastSize=0,knownHits=0;
      const collect=()=>{
        for(const a of document.querySelectorAll('a[href]')){
          let href='';try{href=new URL(a.href,location.href).toString()}catch{}
          if(!href)continue;
          let id='';
          if(platform==='youtube'){
            try{const u=new URL(href);id=u.searchParams.get('v')||u.pathname.match(/\/shorts\/([A-Za-z0-9_-]{11})/)?.[1]||'';}catch{}
          }else if(platform==='tiktok')id=href.match(/\/video\/(\d+)/)?.[1]||'';
          if(!id)continue;
          if(!rows.has(id))rows.set(id,{id,href,text:(a.getAttribute('title')||a.textContent||'').trim()});
          if(known.has(id))knownHits++;
        }
      };
      collect();
      for(let index=0;index<passes;index++){
        if(maxItems&&rows.size>=maxItems)break;
        if(!full&&known.size&&knownHits>0&&index>=1)break;
        window.scrollTo(0,document.documentElement.scrollHeight);
        await wait(platform==='tiktok'?430:260);
        collect();
        stable=rows.size===lastSize?stable+1:0;
        lastSize=rows.size;
        if(stable>=5)break;
      }
      return {url:location.href,title:document.title||'',text:document.body?.innerText||'',html:document.documentElement?.outerHTML||'',links:[...rows.values()]};
    })()`, true);
    return result || { url, title:'', text:'', html:'', links:[] };
  });
}

function youtubeChannelRoot(value) {
  const safe = safeUrl(value);
  if (!safe) return '';
  const url = new URL(safe);
  url.search = '';
  url.hash = '';
  url.pathname = url.pathname.replace(/\/(videos|shorts|streams)\/?$/i,'').replace(/\/$/,'');
  return url.toString().replace(/\/$/,'');
}
function youtubeIdFromHref(href) {
  try {
    const url = new URL(href);
    return url.searchParams.get('v') || url.pathname.match(/\/shorts\/([A-Za-z0-9_-]{11})/)?.[1] || '';
  } catch { return ''; }
}
function parseYoutubeIdsFromHtml(text) {
  return unique([
    ...[...String(text || '').matchAll(/(?:watch\?v=|"videoId":")([A-Za-z0-9_-]{11})/g)].map(match => match[1]),
    ...[...String(text || '').matchAll(/\/shorts\/([A-Za-z0-9_-]{11})/g)].map(match => match[1]),
  ]);
}

async function enumerateYouTube(creator, knownIds, full, settings) {
  const root = youtubeChannelRoot(creator.url);
  if (!root) throw new Error(`Creator ${creator.id} has an invalid YouTube URL`);
  const tabs = ['videos','shorts', ...(full ? ['streams'] : [])];
  const known = new Set(knownIds || []);
  const incrementalLimit = Math.max(1, Number(settings.maxIncrementalVideosPerCreator) || 16);
  const scanTab = async tab => {
    const page = `${root}/${tab}`;
    let httpLinks = [];
    if (!full) {
      try {
        const response = await requestText(page, { timeoutMs:5200, headers:{'Accept-Language':'en-US,en;q=0.9'} });
        httpLinks = parseYoutubeIdsFromHtml(response.text).map(id => ({
          id,
          href:tab === 'shorts' ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`,
          text:'',
        }));
        if (httpLinks.length && (!known.size || httpLinks.some(link => known.has(link.id)))) return httpLinks;
      } catch {}
    }
    try {
      const snap = await browserSnapshot(page, {
        platform:'youtube',
        full,
        knownIds,
        maxPasses:settings.browserHistoryScrollPasses,
        maxItems:full ? 0 : Math.max(24, incrementalLimit * 3),
      });
      const links = snap.links || [];
      return links.length ? links : httpLinks;
    } catch (browserError) {
      if (httpLinks.length) return httpLinks;
      try {
        const response = await requestText(page, { timeoutMs:7000, headers:{'Accept-Language':'en-US,en;q=0.9'} });
        const ids = parseYoutubeIdsFromHtml(response.text);
        if (ids.length) return ids.map(id => ({ id, href:tab === 'shorts' ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`, text:'' }));
      } catch {}
      throw browserError;
    }
  };
  const tabRows = await mapConcurrent(tabs, Math.min(tabs.length, Math.max(1, Number(settings.browserPoolSize) || 3)), scanTab);
  const rows = new Map();
  for (let tabIndex = 0; tabIndex < tabs.length; tabIndex++) {
    const tab = tabs[tabIndex];
    for (const link of tabRows[tabIndex] || []) {
      const id = link.id || youtubeIdFromHref(link.href);
      if (!id || rows.has(id)) continue;
      rows.set(id, {
        id,
        url:tab === 'shorts' ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`,
        title:link.text || '',
        sourceTab:tab,
      });
    }
  }
  return [...rows.values()];
}
async function enumerateTikTok(creator, knownIds, full, settings) {
  const url = safeUrl(creator.url);
  if (!url) throw new Error(`Creator ${creator.id} has an invalid TikTok URL`);
  const known = new Set(knownIds || []);
  const incrementalLimit = Math.max(1, Number(settings.maxIncrementalVideosPerCreator) || 16);
  let initial = [];
  try {
    const response = await requestText(url, { timeoutMs:6500 });
    initial = collectTikTokItemsFromHtml(response.text || '');
    const touchesKnown = initial.some(item => known.has(item.id));
    if (!full && initial.length >= Math.min(incrementalLimit, 8) && (!known.size || touchesKnown)) {
      return initial.map(item => ({ id:item.id, url:item.url, title:item.desc || '', sourceTab:'profile-http' }));
    }
  } catch {}
  let snap;
  try {
    snap = await browserSnapshot(url, {
      platform:'tiktok',
      full,
      knownIds,
      maxPasses:settings.browserHistoryScrollPasses,
      maxItems:full ? 0 : Math.max(24, incrementalLimit * 3),
    });
  } catch (browserError) {
    if (initial.length) return initial.map(item => ({ id:item.id, url:item.url, title:item.desc || '', sourceTab:'profile-http-fallback' }));
    throw browserError;
  }
  const rows = new Map(initial.map(item => [item.id,{id:item.id,url:item.url,title:item.desc||'',sourceTab:'profile-http'}]));
  for (const link of snap.links || []) if (link.id) rows.set(link.id, { id:link.id, url:link.href, title:link.text || '', sourceTab:'profile-browser' });
  for (const item of collectTikTokItemsFromHtml(snap.html || '')) if (!rows.has(item.id)) rows.set(item.id, { id:item.id, url:item.url, title:item.desc || '', sourceTab:'profile-browser' });
  return [...rows.values()];
}

async function enumerateCreatorVideos(creator, knownIds, full, settings) {
  const platform = String(creator.platform || '').toLowerCase();
  if (platform === 'youtube') return enumerateYouTube(creator, knownIds, full, settings);
  if (platform === 'tiktok') return enumerateTikTok(creator, knownIds, full, settings);
  const snap = await browserSnapshot(creator.url, { platform:'generic', full, knownIds, maxPasses:24, maxItems:full ? 0 : 40 });
  return (snap.links || []).filter(link => /video|watch/i.test(link.href)).map(link => ({ id:link.id || Buffer.from(link.href).toString('base64url').slice(0,24), url:link.href, title:link.text || '' }));
}

async function browserVideoDetails(url, platform) {
  return pool().withWindow(async win => {
    await loadUrlWithTimeout(win, url, platform === 'tiktok' ? 15000 : 12000);
    await sleep(platform === 'tiktok' ? 650 : 300);
    return win.webContents.executeJavaScript(`(async()=>{
      const platform=${JSON.stringify(platform)};
      const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
      if(platform==='youtube'){
        for(const el of document.querySelectorAll('#expand,tp-yt-paper-button#expand,ytd-text-inline-expander #expand')){try{el.click()}catch{}}
        await wait(100);
        const root=document.querySelector('#description-inline-expander,#description,ytd-watch-metadata')||document;
        const description=(document.querySelector('#description-inline-expander #description,#description yt-formatted-string')?.innerText||root.innerText||document.querySelector('meta[name="description"]')?.content||'').trim();
        return {url:location.href,title:(document.querySelector('h1 yt-formatted-string,h1')?.textContent||document.querySelector('meta[property="og:title"]')?.content||document.title||'').trim(),description,publishedAt:(document.querySelector('#info-strings yt-formatted-string')?.textContent||'').trim(),links:[...root.querySelectorAll('a[href]')].map(a=>({href:a.href,text:(a.textContent||'').trim()}))};
      }
      const description=document.querySelector('[data-e2e="browse-video-desc"],[data-e2e="video-desc"]')?.textContent||document.querySelector('meta[name="description"]')?.content||document.querySelector('meta[property="og:description"]')?.content||'';
      return {url:location.href,title:document.querySelector('meta[property="og:title"]')?.content||document.title||'',description:String(description).trim(),publishedAt:'',links:[...document.querySelectorAll('a[href]')].map(a=>({href:a.href,text:(a.textContent||'').trim()}))};
    })()`, true);
  });
}

async function readYouTube(ref) {
  try {
    const response = await requestText(ref.url, { timeoutMs:6500, headers:{'Accept-Language':'en-US,en;q=0.9'} });
    if (response.status >= 200 && response.status < 400) {
      const parsed = parseYouTubeWatchHtml(response.text, ref.id);
      if (parsed.description || parsed.title) return parsed;
    }
  } catch {}
  const row = await browserVideoDetails(ref.url, 'youtube');
  return { id:ref.id, title:String(row.title || ref.title || ''), description:String(row.description || ''), publishedAt:String(row.publishedAt || ''), url:ref.url, links:row.links || [] };
}
async function readTikTok(ref) {
  const [embedResult, pageResult] = await Promise.allSettled([
    requestJson(`https://www.tiktok.com/oembed?url=${encodeURIComponent(ref.url)}`, { timeoutMs:4500 }),
    requestText(ref.url, { timeoutMs:5500 }),
  ]);
  const embed = embedResult.status === 'fulfilled' ? embedResult.value : null;
  const pageItems = pageResult.status === 'fulfilled' ? collectTikTokItemsFromHtml(pageResult.value.text || '') : [];
  const direct = pageItems.find(item => item.id === ref.id);
  if (direct?.desc) return { id:ref.id, title:String(embed?.title || ref.title || direct.desc), description:direct.desc, publishedAt:'', url:ref.url, links:[] };
  if (embed?.title && String(embed.title).length > 8) return { id:ref.id, title:String(embed.title), description:String(embed.title), publishedAt:'', url:ref.url, links:[] };
  const row = await browserVideoDetails(ref.url, 'tiktok');
  return { id:ref.id, title:String(row.title || ref.title || ''), description:String(row.description || ''), publishedAt:'', url:ref.url, links:row.links || [] };
}

async function readCreatorVideo(creator, ref) {
  const platform = String(creator.platform || '').toLowerCase();
  if (platform === 'youtube') return readYouTube(ref);
  if (platform === 'tiktok') return readTikTok(ref);
  const row = await browserVideoDetails(ref.url, 'generic');
  return { id:ref.id, title:String(row.title || ref.title || ''), description:String(row.description || ''), publishedAt:String(row.publishedAt || ''), url:ref.url, links:row.links || [] };
}

module.exports = {
  setElectronApi, BrowserPool, beginBrowserPool, endBrowserPool,
  browserSnapshot, browserVideoDetails, youtubeChannelRoot,
  enumerateCreatorVideos, readCreatorVideo,
};
