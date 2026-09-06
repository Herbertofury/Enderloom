'use strict';

const { requestText, requestJson } = require('../public-http');
const { sleep, safeUrl, unique, clampInt, mapConcurrent } = require('./common');
const { parseYouTubeWatchHtml, collectTikTokItemsFromHtml, extractUrls } = require('./parser');

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
      broken = /destroyed|closed|render process gone|frame was disposed|script failed to execute|script execution timed out/i.test(String(error?.message || error));
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

function webContentsLoading(wc) {
  try {
    if (typeof wc?.isLoadingMainFrame === 'function') return !!wc.isLoadingMainFrame();
    if (typeof wc?.isLoading === 'function') return !!wc.isLoading();
  } catch {}
  return false;
}

async function waitForWebContentsSettled(win, quietMs=100, timeoutMs=3500) {
  const wc = win?.webContents;
  const started = Date.now();
  while (true) {
    if (!win || win.isDestroyed() || !wc || wc.isDestroyed()) throw new Error('Creator browser window was destroyed');
    if (!webContentsLoading(wc)) {
      await sleep(quietMs);
      if (!webContentsLoading(wc)) return;
    }
    if (Date.now() - started >= timeoutMs) return;
    await sleep(80);
  }
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
  await waitForWebContentsSettled(win, 120, 2500);
}

async function executeJavaScriptStable(win, source, { retries=3, delayMs=250, timeoutMs=5000 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (win.isDestroyed() || win.webContents.isDestroyed()) throw new Error('Creator browser window was destroyed');
      await waitForWebContentsSettled(win, 80, 1800);
      let timer;
      try {
        return await Promise.race([
          win.webContents.executeJavaScript(source, true),
          new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error(`Creator browser script execution timed out after ${timeoutMs}ms`)), timeoutMs);
          }),
        ]);
      } finally {
        clearTimeout(timer);
      }
    } catch (error) {
      lastError = error;
      const message = String(error?.message || error);
      if (attempt >= retries || !/script failed to execute|context|navigation|frame|destroyed|disposed|timed out/i.test(message)) break;
      try { win.webContents.stop(); } catch {}
      await sleep(delayMs * (attempt + 1));
    }
  }
  throw lastError;
}

function creatorDomSnapshotScript(platform) {
  return `(()=>{
    const platform=${JSON.stringify(platform)};
    const links=[];
    const seen=new Set();
    for(const a of document.querySelectorAll('a[href]')){
      let href='';try{href=new URL(a.href,location.href).toString()}catch{}
      if(!href||seen.has(href))continue;
      let id='';
      if(platform==='youtube'){
        try{const u=new URL(href);id=u.searchParams.get('v')||u.pathname.match(/\\/shorts\\/([A-Za-z0-9_-]{11})/)?.[1]||'';}catch{}
      }else if(platform==='tiktok')id=href.match(/\\/video\\/(\\d{8,})/)?.[1]||'';
      else if(/video|watch/i.test(href))id=href;
      if(!id)continue;
      seen.add(href);
      links.push({id,href,text:String(a.getAttribute('title')||a.textContent||'').trim().slice(0,300)});
      if(links.length>=1500)break;
    }
    const hydration=[];
    if(platform==='tiktok'){
      for(const id of ['__UNIVERSAL_DATA_FOR_REHYDRATION__','SIGI_STATE']){
        const node=document.getElementById(id);if(!node)continue;
        hydration.push({id,text:String(node.textContent||'').slice(0,900000)});
      }
    }
    return {
      url:location.href,
      title:String(document.title||'').slice(0,500),
      text:String(document.body?.innerText||'').slice(0,platform==='tiktok'?120000:240000),
      links,
      hydration,
      height:Math.max(document.documentElement?.scrollHeight||0,document.body?.scrollHeight||0),
      y:window.scrollY||0
    };
  })()`;
}

function mergeDomSnapshot(rows, snapshot, platform, known) {
  let knownHit = false;
  for (const link of snapshot?.links || []) {
    const id = String(link?.id || '').trim();
    const href = safeUrl(link?.href);
    if (!id || !href) continue;
    const prior = rows.get(id);
    rows.set(id, {
      id,
      href,
      text:String(prior?.text || link.text || '').trim(),
    });
    if (known.has(id)) knownHit = true;
  }
  if (platform === 'tiktok') {
    for (const script of snapshot?.hydration || []) {
      const id = String(script?.id || '').replace(/[^A-Za-z0-9_]/g,'');
      if (!id || !script?.text) continue;
      const html = `<script id="${id}" type="application/json">${script.text}</script>`;
      for (const item of collectTikTokItemsFromHtml(html)) {
        if (!item?.id) continue;
        const prior = rows.get(item.id);
        rows.set(item.id, {
          id:item.id,
          href:item.url,
          text:prior?.text || item.desc || '',
        });
        if (known.has(item.id)) knownHit = true;
      }
    }
  }
  return knownHit;
}

async function browserSnapshot(url, { platform='generic', full=false, knownIds=[], maxPasses=120, maxItems=0 } = {}) {
  if (!electronApi?.BrowserWindow || !electronApi?.app?.isReady?.()) throw new Error('Browser-backed creator discovery is unavailable');
  return pool().withWindow(async win => {
    await loadUrlWithTimeout(win, url, platform === 'tiktok' ? 18000 : 14000);
    const rows = new Map();
    const known = new Set(knownIds || []);
    const passes = clampInt(maxPasses, 120, 1, 240);
    const limit = Math.max(0, Number(maxItems) || 0);
    let lastSize = -1;
    let stable = 0;
    let finalSnapshot = null;
    for (let pass = 0; pass < passes; pass++) {
      const snapshot = await executeJavaScriptStable(win, creatorDomSnapshotScript(platform), {
        retries:3,
        delayMs:260,
        timeoutMs:4500,
      });
      finalSnapshot = snapshot || finalSnapshot;
      const knownHit = mergeDomSnapshot(rows, snapshot, platform, known);
      if (limit && rows.size >= limit) break;
      if (!full && known.size && knownHit && pass >= 1) break;
      stable = rows.size === lastSize ? stable + 1 : 0;
      lastSize = rows.size;
      if (stable >= 4) break;
      await executeJavaScriptStable(win, `(()=>{window.scrollTo(0,Math.max(document.documentElement?.scrollHeight||0,document.body?.scrollHeight||0));return true})()`, {
        retries:2,
        delayMs:180,
        timeoutMs:2200,
      });
      await sleep(platform === 'tiktok' ? 450 : 280);
    }
    return {
      url:finalSnapshot?.url || url,
      title:finalSnapshot?.title || '',
      text:finalSnapshot?.text || '',
      html:'',
      links:[...rows.values()],
    };
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
function xmlDecode(value) {
  return String(value || '').replace(/^<!\[CDATA\[/,'').replace(/\]\]>$/,'')
    .replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'")
    .replace(/&lt;/g,'<').replace(/&gt;/g,'>');
}
function xmlValue(block, tag) {
  const match = String(block || '').match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,'i'));
  return match ? xmlDecode(match[1]).trim() : '';
}
function youtubeChannelIdFromHtml(html) {
  const text = String(html || '');
  const patterns = [
    /<meta[^>]+itemprop=["']channelId["'][^>]+content=["'](UC[A-Za-z0-9_-]+)["']/i,
    /["']channelId["']\s*:\s*["'](UC[A-Za-z0-9_-]+)["']/,
    /["']externalId["']\s*:\s*["'](UC[A-Za-z0-9_-]+)["']/,
    /["']browseId["']\s*:\s*["'](UC[A-Za-z0-9_-]+)["']/,
    /\\"browseId\\"\s*:\s*\\"(UC[A-Za-z0-9_-]+)\\"/,
    /youtube\.com\/channel\/(UC[A-Za-z0-9_-]+)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1];
  }
  return '';
}
function parseYouTubeFeedXml(xml) {
  const rows = [];
  for (const match of String(xml || '').matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)) {
    const block = match[1];
    const id = xmlValue(block,'yt:videoId');
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) continue;
    rows.push({
      id,
      url:`https://www.youtube.com/watch?v=${id}`,
      title:xmlValue(block,'title'),
      description:xmlValue(block,'media:description'),
      publishedAt:xmlValue(block,'published'),
      sourceTab:'feed',
    });
  }
  return rows;
}
async function youtubeFeedRefs(root) {
  let channelId = '';
  try { channelId = new URL(root).pathname.match(/^\/channel\/(UC[A-Za-z0-9_-]+)/i)?.[1] || ''; } catch {}
  if (!channelId) {
    for (const page of [root, `${root}/videos`, `${root}/shorts`]) {
      try {
        const response = await requestText(page, { timeoutMs:6000, headers:{'Accept-Language':'en-US,en;q=0.9'} });
        channelId = youtubeChannelIdFromHtml(response.text);
        if (channelId) break;
      } catch {}
    }
  }
  if (!channelId) return [];
  try {
    const response = await requestText(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`, {
      timeoutMs:6000,
      headers:{ Accept:'application/atom+xml,application/xml,text/xml,*/*;q=0.8' },
    });
    return parseYouTubeFeedXml(response.text);
  } catch { return []; }
}
function parseTikTokRefsFromHtml(text, creatorUrl='') {
  const rows = new Map();
  for (const item of collectTikTokItemsFromHtml(text || '')) {
    if (!item?.id) continue;
    rows.set(item.id, { id:item.id, url:item.url, title:item.desc || '', sourceTab:'profile-http' });
  }
  let defaultAuthor = '';
  try { defaultAuthor = new URL(creatorUrl).pathname.match(/^\/@([^/]+)/)?.[1] || ''; } catch {}
  const source = String(text || '').replace(/\\u002F/gi,'/').replace(/\\\//g,'/');
  for (const match of source.matchAll(/\/@([^/"'?\\]+)\/video\/(\d{8,})/g)) {
    const author = match[1] || defaultAuthor;
    const id = match[2];
    if (!rows.has(id)) rows.set(id, { id, url:`https://www.tiktok.com/@${author}/video/${id}`, title:'', sourceTab:'profile-http' });
  }
  return [...rows.values()];
}

async function enumerateYouTube(creator, knownIds, full, settings) {
  const root = youtubeChannelRoot(creator.url);
  if (!root) throw new Error(`Creator ${creator.id} has an invalid YouTube URL`);
  const tabs = ['videos','shorts', ...(full ? ['streams'] : [])];
  const known = new Set(knownIds || []);
  const feedPromise = full ? Promise.resolve([]) : youtubeFeedRefs(root);
  const incrementalLimit = Math.max(1, Number(settings.maxIncrementalVideosPerCreator) || 16);
  const scanTab = async tab => {
    const page = `${root}/${tab}`;
    let httpLinks = [];
    if (!full) {
      try {
        const response = await requestText(page, { timeoutMs:6000, headers:{'Accept-Language':'en-US,en;q=0.9'} });
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
        const response = await requestText(page, { timeoutMs:8000, headers:{'Accept-Language':'en-US,en;q=0.9'} });
        const ids = parseYoutubeIdsFromHtml(response.text);
        if (ids.length) return ids.map(id => ({
          id,
          href:tab === 'shorts' ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`,
          text:'',
        }));
      } catch {}
      throw browserError;
    }
  };
  const [feedRows, tabRows] = await Promise.all([
    feedPromise,
    mapConcurrent(tabs, Math.min(tabs.length, Math.max(1, Number(settings.browserPoolSize) || 3)), scanTab),
  ]);
  const rows = new Map((feedRows || []).map(ref => [ref.id, ref]));
  for (let tabIndex = 0; tabIndex < tabs.length; tabIndex++) {
    const tab = tabs[tabIndex];
    for (const link of tabRows[tabIndex] || []) {
      const id = link.id || youtubeIdFromHref(link.href);
      if (!id) continue;
      const prior = rows.get(id);
      rows.set(id, {
        id,
        url:tab === 'shorts' ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`,
        title:prior?.title || link.text || '',
        description:prior?.description || '',
        publishedAt:prior?.publishedAt || '',
        sourceTab:prior?.sourceTab === 'feed' ? `feed+${tab}` : tab,
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
  let httpRefs = [];
  try {
    const response = await requestText(url, { timeoutMs:7000, headers:{'Accept-Language':'en-US,en;q=0.9'} });
    httpRefs = parseTikTokRefsFromHtml(response.text || '', url);
    const touchesKnown = httpRefs.some(item => known.has(item.id));
    if (!full && httpRefs.length >= Math.min(incrementalLimit, 8) && (!known.size || touchesKnown)) return httpRefs;
  } catch {}
  try {
    const snap = await browserSnapshot(url, {
      platform:'tiktok',
      full,
      knownIds,
      maxPasses:settings.browserHistoryScrollPasses,
      maxItems:full ? 0 : Math.max(24, incrementalLimit * 3),
    });
    const rows = new Map(httpRefs.map(item => [item.id,item]));
    for (const link of snap.links || []) if (link.id) rows.set(link.id, {
      id:link.id,
      url:link.href,
      title:link.text || rows.get(link.id)?.title || '',
      sourceTab:'profile-browser',
    });
    return [...rows.values()];
  } catch (browserError) {
    if (httpRefs.length) return httpRefs.map(item => ({ ...item, sourceTab:'profile-http-fallback' }));
    throw browserError;
  }
}

async function enumerateCreatorVideos(creator, knownIds, full, settings) {
  const platform = String(creator.platform || '').toLowerCase();
  if (platform === 'youtube') return enumerateYouTube(creator, knownIds, full, settings);
  if (platform === 'tiktok') return enumerateTikTok(creator, knownIds, full, settings);
  const snap = await browserSnapshot(creator.url, { platform:'generic', full, knownIds, maxPasses:24, maxItems:full ? 0 : 40 });
  return (snap.links || []).filter(link => /video|watch/i.test(link.href)).map(link => ({
    id:link.id || Buffer.from(link.href).toString('base64url').slice(0,24),
    url:link.href,
    title:link.text || '',
  }));
}

function videoDomSnapshotScript(platform) {
  return `(()=>{
    const platform=${JSON.stringify(platform)};
    if(platform==='youtube'){
      const player=window.ytInitialPlayerResponse||{};
      const root=document.querySelector('#description-inline-expander,#description,ytd-watch-metadata')||document;
      const description=String(
        player?.videoDetails?.shortDescription||
        document.querySelector('#description-inline-expander #description')?.innerText||
        document.querySelector('#description yt-formatted-string')?.innerText||
        document.querySelector('meta[itemprop="description"]')?.content||
        document.querySelector('meta[name="description"]')?.content||
        document.querySelector('meta[property="og:description"]')?.content||''
      ).trim();
      return {
        url:location.href,
        title:String(player?.videoDetails?.title||document.querySelector('h1 yt-formatted-string,h1')?.textContent||document.querySelector('meta[property="og:title"]')?.content||document.title||'').trim().slice(0,500),
        description:description.slice(0,500000),
        publishedAt:String(player?.microformat?.playerMicroformatRenderer?.publishDate||document.querySelector('#info-strings yt-formatted-string')?.textContent||'').trim().slice(0,100),
        links:[...root.querySelectorAll('a[href]')].slice(0,700).map(a=>({href:a.href,text:String(a.textContent||'').trim().slice(0,300)})),
        hydration:[]
      };
    }
    const hydration=[];
    if(platform==='tiktok'){
      for(const id of ['__UNIVERSAL_DATA_FOR_REHYDRATION__','SIGI_STATE']){
        const node=document.getElementById(id);if(node)hydration.push({id,text:String(node.textContent||'').slice(0,900000)});
      }
    }
    return {
      url:location.href,
      title:String(document.querySelector('meta[property="og:title"]')?.content||document.title||'').trim().slice(0,500),
      description:String(document.querySelector('[data-e2e="browse-video-desc"],[data-e2e="video-desc"]')?.textContent||document.querySelector('meta[name="description"]')?.content||document.querySelector('meta[property="og:description"]')?.content||'').trim().slice(0,500000),
      publishedAt:'',
      links:[...document.querySelectorAll('a[href]')].slice(0,700).map(a=>({href:a.href,text:String(a.textContent||'').trim().slice(0,300)})),
      hydration
    };
  })()`;
}

function hydrateTikTokVideo(row, targetId) {
  let description = String(row?.description || '').trim();
  for (const script of row?.hydration || []) {
    const id = String(script?.id || '').replace(/[^A-Za-z0-9_]/g,'');
    if (!id || !script?.text) continue;
    const html = `<script id="${id}" type="application/json">${script.text}</script>`;
    const items = collectTikTokItemsFromHtml(html);
    const hit = items.find(item => item.id === targetId) || items.find(item => item.desc);
    if (hit?.desc) {
      description = hit.desc;
      break;
    }
  }
  return description;
}

async function browserVideoDetails(url, platform) {
  return pool().withWindow(async win => {
    await loadUrlWithTimeout(win, url, platform === 'tiktok' ? 18000 : 14000);
    let row = await executeJavaScriptStable(win, videoDomSnapshotScript(platform), {
      retries:3,
      delayMs:260,
      timeoutMs:4500,
    });
    if (platform === 'youtube' && String(row?.description || '').trim().length < 24) {
      await executeJavaScriptStable(win, `(()=>{for(const el of document.querySelectorAll('#expand,tp-yt-paper-button#expand,ytd-text-inline-expander #expand')){try{el.click()}catch{}}return true})()`, {
        retries:2,
        delayMs:180,
        timeoutMs:2200,
      }).catch(()=>null);
      await sleep(350);
      row = await executeJavaScriptStable(win, videoDomSnapshotScript(platform), {
        retries:3,
        delayMs:260,
        timeoutMs:4500,
      });
    }
    if (platform === 'tiktok') {
      let targetId = '';
      try { targetId = new URL(url).pathname.match(/\/video\/(\d{8,})/)?.[1] || ''; } catch {}
      row = { ...row, description:hydrateTikTokVideo(row, targetId) };
    }
    return row || { url, title:'', description:'', publishedAt:'', links:[] };
  });
}

async function readYouTube(ref) {
  if (String(ref?.description || '').trim()) {
    return {
      id:ref.id,
      title:String(ref.title || ''),
      description:String(ref.description || ''),
      publishedAt:String(ref.publishedAt || ''),
      url:ref.url,
      links:extractUrls(ref.description).map(href => ({ href, text:'' })),
      source:'youtube-feed',
    };
  }
  let parsed = null;
  try {
    const response = await requestText(ref.url, { timeoutMs:7000, headers:{'Accept-Language':'en-US,en;q=0.9'} });
    if (response.status >= 200 && response.status < 400) {
      parsed = parseYouTubeWatchHtml(response.text, ref.id);
      if (String(parsed.description || '').trim().length >= 24) return { ...parsed, source:'youtube-http' };
    }
  } catch {}
  try {
    const row = await browserVideoDetails(ref.url, 'youtube');
    return {
      id:ref.id,
      title:String(row.title || parsed?.title || ref.title || ''),
      description:String(row.description || parsed?.description || ''),
      publishedAt:String(row.publishedAt || parsed?.publishedAt || ''),
      url:ref.url,
      links:(row.links?.length ? row.links : parsed?.links) || [],
      source:'youtube-browser',
    };
  } catch (browserError) {
    if (parsed?.title || parsed?.description) return { ...parsed, source:'youtube-http-partial' };
    throw browserError;
  }
}

async function readTikTok(ref) {
  let embed = null;
  let pageItems = [];
  const [embedResult, pageResult] = await Promise.allSettled([
    requestJson(`https://www.tiktok.com/oembed?url=${encodeURIComponent(ref.url)}`, { timeoutMs:5000 }),
    requestText(ref.url, { timeoutMs:6500, headers:{'Accept-Language':'en-US,en;q=0.9'} }),
  ]);
  if (embedResult.status === 'fulfilled') embed = embedResult.value;
  if (pageResult.status === 'fulfilled') pageItems = collectTikTokItemsFromHtml(pageResult.value.text || '');
  const direct = pageItems.find(item => item.id === ref.id);
  if (direct?.desc) return { id:ref.id, title:String(embed?.title || ref.title || direct.desc), description:direct.desc, publishedAt:'', url:ref.url, links:[], source:'tiktok-http' };
  if (embed?.title && String(embed.title).length > 8) return { id:ref.id, title:String(embed.title), description:String(embed.title), publishedAt:'', url:ref.url, links:[], source:'tiktok-oembed' };
  const row = await browserVideoDetails(ref.url, 'tiktok');
  return { id:ref.id, title:String(row.title || ref.title || ''), description:String(row.description || ''), publishedAt:'', url:ref.url, links:row.links || [], source:'tiktok-browser' };
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
  youtubeChannelIdFromHtml, parseYouTubeFeedXml, youtubeFeedRefs,
  enumerateCreatorVideos, readCreatorVideo,
};
