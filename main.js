'use strict';
const { app, BrowserWindow, WebContentsView, ipcMain, shell, clipboard, nativeImage, session, Menu, dialog, protocol, net } = require('electron');
const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const os = require('os');
const vm = require('vm');
const v8 = require('v8');
const { pathToFileURL } = require('url');
const { LauncherService } = require('./src/launcher-service');
const { CatalogStore } = require('./src/catalog-store');
const { requestText: publicRequestText, requestJson: publicRequestJson, requestHeadTextShared: publicRequestHeadTextShared, requestProgressiveTextShared: publicRequestProgressiveTextShared, requestTextShared: publicRequestTextShared, requestJsonShared: publicRequestJsonShared } = require('./src/public-http');
const { providerForUrl, contextFingerprint, pageIdentityConfidence, titleSimilarity, parsePlanetMinecraftHtml, parsePlanetMinecraftAuthorHtml, parseCurseForgeAuthorProjectHtml, parseProviderAuthorHtml, parseGenericProjectHtml, parseProviderHeadMedia, parseCurseForgeGalleryStreamSeed, resolveProviderProjectLinks, isProviderCollectionUrl, curseForgeFullAndPreview } = require('./src/provider-media');
const { firstTrustedMediaUrl:streamFirstTrustedMediaUrl, mediaMarkerMatched:streamMediaMarkerMatched, providerOriginHints, allProviderOriginHints, transportPolicy } = require('./src/provider-fastlane');
const { curseForgeOwnedMediaPattern, curseForgeAuthorMediaPattern } = require('./src/curseforge-fastlane');
const { mediaKind, ownedMediaMarker } = require('./src/site-adapters');
const { apiDescriptorForUrl, apiSeedFromJson } = require('./src/provider-api-fastlane');
const { createAdblockManager } = require('./src/adblock');
const { createProviderParserPool } = require('./src/provider-parser-pool');
const { createTranslator } = require('./src/translator');
const { createTranslatorUpdater } = require('./src/translator-updater');
const pageTranslator = require('./src/page-translator-agent');
const { modrinthSlugFromUrl, chunkSlugsByUrlLength, indexProjects } = require('./src/modrinth-batch');
const rustHttp = require('./src/rust-http');
const impitHttp3 = require('./src/impit-http3');
const { hasMedia:startRaceHasMedia, startParallelRace } = require('./src/parallel-media-race');
function startRaceHasUsefulState(value){ return !!(startRaceHasMedia(value) || value?.galleryAbsent === true || value?.sourceGalleryAbsent === true); }

const APP_TITLE = 'Enderloom';
const ROOT = __dirname;
const APP_ICON = path.join(ROOT, 'launcher', 'public', 'logo.png');
const PARTITION = 'persist:minecraft-catalog-live';
const LAUNCHER_PARTITION = 'persist:enderloom-launcher-ui';
const CATALOG_ID = 'catalog';
const LAUNCHER_ID = 'launcher';
const BASE_TOP = 94;
const CHROME_OVERLAY_MAX = 430;
const STATUS_H = 28;
const STATUS_COLLAPSED_H = 10;
const DIVIDER_W = 18;
const MIN_SPLIT_PANE = 260;
let win = null;
let chromeView = null;
let statusView = null;
let splitterView = null;
let sourceCenterWin = null;
let chromeOverlayHeight = BASE_TOP;
let statusBarCollapsed = false;
let catalogView = null;
let launcherView = null;
let tabs = [];
let activeId = CATALOG_ID;
let splitMode = false;
let splitRatio = 0.46;
let splitSide = 'catalog-left';
let splitWorkspaceId = CATALOG_ID;
let utilityHeight = 0;
const galleryCache = new Map();
const mediaCache = new Map();
const MEDIA_VIEW_POOL_MAX = Math.max(8, Math.min(14, Math.ceil((os.cpus()?.length || 12) / 3)));
const chromiumProgressiveInflight = new Map();
const chromiumTextCache = new Map();
const CHROMIUM_TEXT_CACHE_MAX_BYTES = 64 * 1024 * 1024;
let chromiumTextCacheBytes = 0;
const mediaPreconnectAt = new Map();
const mediaImageWarmAt = new Map();
const mediaImageWarmInflight = new Map();
const HEDGED_DEEP_PROVIDERS = new Set(['curseforge','planetminecraft','afdian','patreon','minecraft-marketplace','mcpedl','modbay','fourthwall','booth','kofi','itch','gumroad','hangar','spigot','bukkit','nexusmods','moddb','gitlab','polymart','builtbybit']);
const mediaViewPool = [];
const mediaViewWaiters = [];
const MEDIA_VIEW_FOREGROUND_RESERVE = 2;
const mediaPrimeQueue = [];
const mediaPrimeJobs = new Map();
const MEDIA_PRIME_MAX = Math.max(48, Math.min(128, Math.ceil((os.cpus()?.length || 12) * 3.0)));
const MEDIA_PRIME_MIN = Math.min(24, MEDIA_PRIME_MAX);
// Provider discovery is overwhelmingly network-wait bound. Start with a wider frontier
// than CPU count, then retain the existing latency feedback loop to back off when a
// provider or network is slow. This is a concurrency budget, never a media/result cap.
const MEDIA_PRIME_HEAP_CAP = Math.max(4, Math.min(MEDIA_PRIME_MAX, Math.floor((v8.getHeapStatistics().heap_size_limit / (1024 * 1024)) / 1024)));
const MEDIA_PRIME_ACTIVE_MIN = Math.min(MEDIA_PRIME_MIN, MEDIA_PRIME_HEAP_CAP);
const requestedMediaPrimeTarget = Math.max(MEDIA_PRIME_MIN, Math.min(MEDIA_PRIME_MAX, Math.ceil((os.cpus()?.length || 12) * 3.0)));
let mediaPrimeTarget = Math.min(MEDIA_PRIME_HEAP_CAP, requestedMediaPrimeTarget);
let mediaPrimeFastStreak = 0;
let activeMediaPrimeJobs = 0;
const authorMediaCache = new Map();
const independentAuthorInflight = new Map();
const modrinthProjectCache = new Map();
const MODRINTH_PROJECT_CACHE_MS = 60 * 1000;
let mediaCacheSaveTimer = null;
let closedTabs = [];
let downloads = new Map();
let permissionPromptChain = Promise.resolve();
const sessionPermissions = new Map();
let catalogStore = null;
let adblockManager = null;
let providerParserPool = null;
let translator = null;
let translatorUpdater = null;
let translatorStatus = {name:'TWP Engine',enabled:true,upstreamVersion:'10.2.1.0',service:'bing',targetLanguage:'en',message:'Starting translator…'};
let translatorUpdateStatus = {updateState:'idle',message:'TWP updater idle'};
let adblockStatus = { enabled:true, loaded:false, name:'uBlock Origin', version:'', updateState:'idle', message:'Starting ad blocker…' };
let nextTab = 1;
let saveTimer = null;
let testMode = process.argv.includes('--self-test');
if (testMode) app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'minecraft-catalog-companion-test-')));
const launcherService = new LauncherService({
  rootDir: ROOT,
  dataDir: path.join(app.getPath('userData'), 'launcher'),
});

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'enderloom-asset',
    privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: false },
  },
]);

function safeHttpUrl(value) {
  try {
    const u = new URL(String(value));
    return (u.protocol === 'http:' || u.protocol === 'https:') ? u.toString() : null;
  } catch { return null; }
}
function normalizeAddress(value) {
  const s = String(value || '').trim();
  if (!s) return 'https://www.google.com/';
  if (/^https?:\/\//i.test(s)) return safeHttpUrl(s);
  if (/^[\w.-]+\.[a-z]{2,}(?:[/:?#]|$)/i.test(s)) return safeHttpUrl('https://' + s);
  return 'https://www.google.com/search?q=' + encodeURIComponent(s);
}
function sessionPath() { return path.join(app.getPath('userData'), 'session.json'); }
function readSavedSession() {
  try {
    const data = JSON.parse(fs.readFileSync(sessionPath(), 'utf8'));
    return data && Array.isArray(data.tabs) ? data : { tabs: [] };
  } catch { return { tabs: [] }; }
}
function scheduleSave() {
  if (testMode) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const payload = {
        activeUrl: activeId === CATALOG_ID || activeId === LAUNCHER_ID ? null : getTab(activeId)?.url || null,
        activeWorkspace: activeId === LAUNCHER_ID ? LAUNCHER_ID : activeId === CATALOG_ID ? CATALOG_ID : splitWorkspaceId,
        splitMode,
        splitRatio,
        splitSide,
        splitWorkspaceId,
        statusBarCollapsed,
        tabs: tabs.slice(0, 16).map(t => ({ url: t.url, title: t.title }))
      };
      fs.writeFileSync(sessionPath(), JSON.stringify(payload, null, 2));
    } catch {}
  }, 250);
}
function getTab(id) { return tabs.find(t => t.id === id); }
function navCanBack(wc) { return wc?.navigationHistory?.canGoBack?.() ?? wc?.canGoBack?.() ?? false; }
function navCanForward(wc) { return wc?.navigationHistory?.canGoForward?.() ?? wc?.canGoForward?.() ?? false; }
function navBack(wc) { if (wc?.navigationHistory?.canGoBack?.()) return wc.navigationHistory.goBack(); if (wc?.canGoBack?.()) return wc.goBack(); }
function navForward(wc) { if (wc?.navigationHistory?.canGoForward?.()) return wc.navigationHistory.goForward(); if (wc?.canGoForward?.()) return wc.goForward(); }
function splitGeometry() {
  if (!win || win.isDestroyed()) return { left: 0, available: 0, ratio: splitRatio };
  const [w] = win.getContentSize();
  const available = Math.max(1, w - DIVIDER_W);
  const minPane = Math.min(MIN_SPLIT_PANE, Math.max(160, Math.floor(available * .42)));
  const minRatio = Math.min(.46, minPane / available);
  const maxRatio = Math.max(.54, 1 - minRatio);
  splitRatio = Math.max(minRatio, Math.min(maxRatio, Number(splitRatio) || .46));
  const left = Math.max(minPane, Math.min(available - minPane, Math.round(available * splitRatio)));
  return { left, available, ratio: left / available, width: w };
}
function activeTab() {
  return activeId === CATALOG_ID || activeId === LAUNCHER_ID ? null : getTab(activeId);
}
function catalogCenterSummary() { return catalogStore?.summary?.() || { activeCatalogId:'', catalogs:[] }; }
function activeCatalogSummary() {
  const center = catalogCenterSummary();
  return center.catalogs.find(c => c.id === center.activeCatalogId) || center.catalogs[0] || { id:'catalog', name:'Catalog', entries:0, assets:0, collections:0, sync:{state:'snapshot',label:'Offline snapshot'}, sources:[] };
}
function catalogPseudoUrl() { return `catalog://${activeCatalogSummary().id || 'catalog'}`; }
function currentUrl() {
  if (activeId === CATALOG_ID) return catalogPseudoUrl();
  if (activeId === LAUNCHER_ID) return 'enderloom://launcher';
  return activeTab()?.view.webContents.getURL() || activeTab()?.url || '';
}
function send(channel, payload) {
  if (win && !win.isDestroyed()) win.webContents.send(channel, payload);
  if (chromeView && !chromeView.webContents.isDestroyed()) chromeView.webContents.send(channel, payload);
  if (statusView && !statusView.webContents.isDestroyed()) statusView.webContents.send(channel, payload);
  if (splitterView && !splitterView.webContents.isDestroyed()) splitterView.webContents.send(channel, payload);
  if (sourceCenterWin && !sourceCenterWin.isDestroyed()) sourceCenterWin.webContents.send(channel, payload);
}
function sendChrome(channel, payload) {
  if (chromeView && !chromeView.webContents.isDestroyed()) chromeView.webContents.send(channel, payload);
  if (statusView && !statusView.webContents.isDestroyed()) statusView.webContents.send(channel, payload);
}

function stateSnapshot() {
  const active = activeTab();
  const center = catalogCenterSummary();
  const catalog = activeCatalogSummary();
  const catalogUrl = catalogPseudoUrl();
  const catalogTab = { id: CATALOG_ID, title: catalog.name || 'Catalog', url: catalogUrl, catalog: true, loading: false };
  const launcherTab = {
    id: LAUNCHER_ID,
    title: 'Mod Manager',
    url: 'enderloom://launcher',
    launcher: true,
    workspace: true,
    loading: launcherService.snapshot().state === 'starting',
  };
  const workspaceId = splitMode ? splitWorkspaceId : activeId === LAUNCHER_ID ? LAUNCHER_ID : CATALOG_ID;
  const activeWorkspace = workspaceId === LAUNCHER_ID ? launcherTab : catalogTab;
  return {
    activeId,
    splitMode,
    splitRatio: splitGeometry().ratio,
    splitSide,
    splitWorkspaceId: workspaceId,
    splitDividerX: splitGeometry().left,
    splitDividerWidth: DIVIDER_W,
    splitAvailableWidth: splitGeometry().available,
    statusBarCollapsed,
    statusBarHeight: statusBarCollapsed ? STATUS_COLLAPSED_H : STATUS_H,
    tabs: [
      catalogTab,
      launcherTab,
      ...tabs.map(t => ({
        id: t.id,
        title: t.title || 'New tab',
        url: t.view.webContents.getURL() || t.url,
        loading: t.loading,
        canBack: navCanBack(t.view.webContents),
        canForward: navCanForward(t.view.webContents),
        favicon: t.favicon || ''
      }))
    ],
    active: active ? {
      id: active.id,
      title: active.title,
      url: active.view.webContents.getURL() || active.url,
      loading: active.loading,
      canBack: navCanBack(active.view.webContents),
      canForward: navCanForward(active.view.webContents),
      zoom: active.view.webContents.getZoomFactor()
    } : { ...activeWorkspace, canBack:false, canForward:false, zoom:1 },
    catalog: { ...catalog, projects: catalog.entries || 0 },
    catalogs: center.catalogs,
    activeCatalogId: center.activeCatalogId,
    adblock: { ...adblockStatus },
    translator: { ...translatorStatus, update:{...translatorUpdateStatus}, autoForActive:active?!!translator?.autoSite?.(active.view.webContents.getURL()||active.url):false },
    launcherService: launcherService.snapshot(),
    runtime: `Electron ${process.versions.electron} · Chromium ${process.versions.chrome} · Rust ${launcherService.snapshot().state}`
  };
}
function publishState() { send('state', stateSnapshot()); }
launcherService.on('event', message => {
  if (launcherView && !launcherView.webContents.isDestroyed()) {
    launcherView.webContents.send('launcher:event', message);
  }
  publishState();
});
launcherService.on('exit', () => publishState());
launcherService.on('diagnostic', message => {
  const line = String(message || '').trim();
  if (line) console.error('[enderloom-rust]', line);
});
function isAttached(view) {
  if (!view || !win || win.isDestroyed()) return false;
  try { return !!win.contentView.children?.includes?.(view); } catch { return false; }
}
function attach(view) {
  if (!view || !win || win.isDestroyed()) return;
  try { if (!isAttached(view)) win.contentView.addChildView(view); } catch {}
}
function detach(view) {
  if (!view || !win || win.isDestroyed()) return;
  try { win.contentView.removeChildView(view); } catch {}
}
function setViewVisible(view, visible) {
  if (!view) return;
  try { view.setVisible(!!visible); } catch {}
}
function layoutChromeOverlay() {
  if (!chromeView || !win || win.isDestroyed()) return;
  const [w,h] = win.getContentSize();
  const height = Math.max(BASE_TOP, Math.min(h, CHROME_OVERLAY_MAX, Number(chromeOverlayHeight) || BASE_TOP));
  try { chromeView.setBounds({ x:0, y:0, width:w, height }); } catch {}
  setViewVisible(chromeView, true);
}
function raiseProtectedOverlays() {
  if (!win || win.isDestroyed()) return;
  try {
    const ordered=[];
    if (splitterView && splitMode && activeTab()) ordered.push(splitterView);
    if (statusView) ordered.push(statusView);
    if (chromeView) ordered.push(chromeView);
    const children=win.contentView.children||[];
    const tail=children.slice(-ordered.length);
    if (ordered.length && tail.every((view,index)=>view===ordered[index])) return;
    for (const view of ordered) if (isAttached(view)) win.contentView.removeChildView(view);
    for (const view of ordered) win.contentView.addChildView(view);
  } catch {}
}
function raiseChromeOverlay() {
  if (!chromeView || !win || win.isDestroyed()) return;
  layoutChromeOverlay();
  raiseProtectedOverlays();
}
function setupChromeOverlay() {
  chromeView = new WebContentsView({
    webPreferences: {
      preload: path.join(ROOT, 'preload.js'), nodeIntegration:false, contextIsolation:true, sandbox:true, webSecurity:true, backgroundThrottling:false
    }
  });
  try { chromeView.setBackgroundColor('#00000000'); } catch { try { chromeView.setBackgroundColor('#090a12'); } catch {} }
  setViewVisible(chromeView, false);
  try { chromeView.setBounds({ x:0, y:0, width:1, height:BASE_TOP }); } catch {}
  try { chromeView.webContents.setBackgroundThrottling(false); } catch {}
  chromeView.webContents.setWindowOpenHandler(() => ({ action:'deny' }));
  chromeView.webContents.on('render-process-gone', () => {
    if (!win || win.isDestroyed()) return;
    try { detach(chromeView); } catch {}
    chromeView = null;
    setupChromeOverlay();
  });
  chromeView.webContents.loadFile(path.join(ROOT, 'shell.html'), { query:{ chrome:'1' } }).catch(()=>{});
  chromeView.webContents.once('did-finish-load', () => { raiseChromeOverlay(); publishState(); });
  attach(chromeView);
}
function statusBarHeight() { return statusBarCollapsed ? STATUS_COLLAPSED_H : STATUS_H; }
function layoutStatusOverlay() {
  if (!statusView || !win || win.isDestroyed()) return;
  const [w,h] = win.getContentSize();
  const height = Math.max(1, Math.min(h, statusBarHeight()));
  try { statusView.setBounds({ x:0, y:Math.max(0,h-height), width:w, height }); } catch {}
  setViewVisible(statusView, true);
}
function raiseStatusOverlay() {
  if (!statusView || !win || win.isDestroyed()) return;
  layoutStatusOverlay();
  raiseProtectedOverlays();
}
function setupStatusOverlay() {
  statusView = new WebContentsView({
    webPreferences: {
      preload: path.join(ROOT, 'preload.js'), nodeIntegration:false, contextIsolation:true, sandbox:true, webSecurity:true, backgroundThrottling:false
    }
  });
  try { statusView.setBackgroundColor('#10121d'); } catch {}
  setViewVisible(statusView, false);
  try { statusView.setBounds({ x:0, y:0, width:1, height:STATUS_H }); } catch {}
  try { statusView.webContents.setBackgroundThrottling(false); } catch {}
  statusView.webContents.setWindowOpenHandler(() => ({ action:'deny' }));
  statusView.webContents.on('render-process-gone', () => {
    if (!win || win.isDestroyed()) return;
    try { detach(statusView); } catch {}
    statusView = null;
    setupStatusOverlay();
  });
  statusView.webContents.loadFile(path.join(ROOT, 'status.html')).catch(()=>{});
  statusView.webContents.once('did-finish-load', () => { raiseStatusOverlay(); raiseChromeOverlay(); publishState(); });
  attach(statusView);
}
function layoutSplitterOverlay() {
  if (!splitterView || !win || win.isDestroyed()) return;
  if (!splitMode || !activeTab()) {
    setViewVisible(splitterView,false);
    return;
  }
  const [,h]=win.getContentSize();
  const top=BASE_TOP+utilityHeight;
  const bottom=statusBarHeight();
  const g=splitGeometry();
  const height=Math.max(32,h-top-bottom);
  try { splitterView.setBounds({x:g.left,y:top,width:DIVIDER_W,height}); } catch {}
  setViewVisible(splitterView,true);
}
function raiseSplitterOverlay() {
  layoutSplitterOverlay();
  raiseProtectedOverlays();
}
function setupSplitterOverlay() {
  splitterView = new WebContentsView({
    webPreferences:{preload:path.join(ROOT,'preload.js'),nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,backgroundThrottling:false}
  });
  try { splitterView.setBackgroundColor('#00000000'); } catch {}
  setViewVisible(splitterView,false);
  try { splitterView.setBounds({x:0,y:BASE_TOP,width:DIVIDER_W,height:1}); } catch {}
  try { splitterView.webContents.setBackgroundThrottling(false); } catch {}
  splitterView.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  splitterView.webContents.on('render-process-gone',()=>{
    if(!win||win.isDestroyed())return;
    try{detach(splitterView)}catch{}
    splitterView=null;
    setupSplitterOverlay();
  });
  splitterView.webContents.loadFile(path.join(ROOT,'splitter.html')).catch(()=>{});
  splitterView.webContents.once('did-finish-load',()=>{raiseSplitterOverlay();publishState()});
  attach(splitterView);
}
function showView(view, bounds) {
  if (!view) return;
  // First attachment still happens hidden -> bounded -> attached -> revealed so a
  // fresh Windows child view can never be born with a full-window hit region.
  // IMPORTANT: once a view is attached, never hide/re-show it just to update bounds.
  // Toggling visibility while a page owns focus blurs the active DOM input.
  const attached = isAttached(view);
  if (!attached) {
    setViewVisible(view, false);
    try { view.setBounds(bounds); } catch {}
    attach(view);
    setViewVisible(view, true);
    return;
  }
  try { view.setBounds(bounds); } catch {}
  try { if (!view.getVisible()) setViewVisible(view, true); } catch { setViewVisible(view, true); }
}
function refreshShellChrome() {
  const wc = win?.webContents;
  if (!wc || wc.isDestroyed()) return;
  // A focused WebContentsView can cause the BrowserWindow renderer to be treated
  // as backgrounded on Windows. Keep the shell composited and request a repaint
  // without stealing focus from the web page.
  try { wc.setBackgroundThrottling(false); } catch {}
  try { wc.invalidate(); } catch {}
}
function scheduleChromeGuard() {
  // Paint-only guard. Never run layoutViews() from a remote focus event: layout used
  // to hide/re-show the active WebContentsView and immediately blur login/search fields.
  for (const delay of [0, 80, 300]) {
    setTimeout(() => {
      if (!win || win.isDestroyed()) return;
      refreshShellChrome();
    }, delay);
  }
}
function layoutViews() {
  if (!win || win.isDestroyed()) return;
  const [w, h] = win.getContentSize();
  const top = BASE_TOP + utilityHeight;
  // The bottom status bar is a protected native sibling, just like the top browser
  // chrome. Reserve its exact height for every catalog/browser/split layout so a site
  // WebContentsView can never paint or hit-test over it.
  const bottomInset = statusBarHeight();
  const height = Math.max(120, h - top - bottomInset);
  const visible = new Set();
  const place = (view, bounds) => { if (!view) return; visible.add(view); showView(view, bounds); };

  if (splitMode && activeId !== CATALOG_ID && activeTab()) {
    const g = splitGeometry();
    const leftWidth = g.left;
    const rightX = leftWidth + DIVIDER_W;
    const rightWidth = Math.max(1, w - rightX);
    const t = activeTab();
    const workspaceView = splitWorkspaceId === LAUNCHER_ID ? launcherView : catalogView;
    if (splitSide === 'web-left') {
      place(t.view, { x: 0, y: top, width: leftWidth, height });
      place(workspaceView, { x: rightX, y: top, width: rightWidth, height });
    } else {
      place(workspaceView, { x: 0, y: top, width: leftWidth, height });
      place(t.view, { x: rightX, y: top, width: rightWidth, height });
    }
  } else if (activeId === CATALOG_ID) {
    place(catalogView, { x: 0, y: top, width: w, height });
  } else if (activeId === LAUNCHER_ID) {
    place(launcherView, { x: 0, y: top, width: w, height });
  } else if (activeTab()) {
    place(activeTab().view, { x: 0, y: top, width: w, height });
  }

  // Hide only views that are genuinely inactive. Never hide the active view first and
  // reveal it again; that was the input-focus regression in 2.0.4.
  for (const t of tabs) if (!visible.has(t.view)) setViewVisible(t.view, false);
  if (catalogView && !visible.has(catalogView)) setViewVisible(catalogView, false);
  if (launcherView && !visible.has(launcherView)) setViewVisible(launcherView, false);
  layoutSplitterOverlay();
  layoutStatusOverlay();
  layoutChromeOverlay();
  raiseProtectedOverlays();
  refreshShellChrome();
}

function stopTabTranslatorTimer(t){if(!t)return;clearTimeout(t.translatorTimer);t.translatorTimer=null;}
function scheduleTabTranslator(t,{immediate=true}={}){
  stopTabTranslatorTimer(t);if(!t||!translator)return;
  const url=t.view?.webContents?.getURL?.()||t.url;if(!translator.autoSite(url))return;
  const tick=async()=>{if(!tabs.includes(t)||t.view.webContents.isDestroyed())return;try{if(!t.translationPromise)t.translationPromise=pageTranslator.translatePage(t.view.webContents,translator,{service:translator.status().service,targetLanguage:translator.status().targetLanguage}).finally(()=>{t.translationPromise=null}) ;await t.translationPromise}catch{}finally{if(tabs.includes(t)&&translator.autoSite(t.view.webContents.getURL()||t.url)){t.translatorTimer=setTimeout(tick,1100);t.translatorTimer.unref?.()}}};
  t.translatorTimer=setTimeout(tick,immediate?40:1100);t.translatorTimer.unref?.();
}
async function translateTabPage(t,payload={}){
  if(!t||!translator)throw new Error('Open a live browser tab to translate it');
  translator.configure({service:payload.service,targetLanguage:payload.targetLanguage});translatorStatus=translator.status();publishState();
  if(t.translationPromise)return await t.translationPromise;
  send('status',`Translating ${t.title||'page'} with ${translatorStatus.service}…`);
  t.translationPromise=pageTranslator.translatePage(t.view.webContents,translator,{service:translatorStatus.service,targetLanguage:translatorStatus.targetLanguage,sourceLanguage:payload.sourceLanguage||'auto'}).finally(()=>{t.translationPromise=null});
  const result=await t.translationPromise;translatorStatus=translator.status();send('status',`Translated ${result.translated} text segment${result.translated===1?'':'s'} · ${translatorStatus.service}`);publishState();return {...result,status:translatorStatus};
}
async function translateTabSelection(t,payload={}){
  if(!t||!translator)throw new Error('Open a live browser tab to translate a selection');
  translator.configure({service:payload.service,targetLanguage:payload.targetLanguage});translatorStatus=translator.status();
  return await pageTranslator.translateSelection(t.view.webContents,translator,{service:translatorStatus.service,targetLanguage:translatorStatus.targetLanguage,sourceLanguage:payload.sourceLanguage||'auto'});
}
async function showTranslatedSelectionDialog(t){
  try{const r=await translateTabSelection(t,{});if(!r.source)return;await dialog.showMessageBox(win,{type:'info',title:'TWP Engine · translated selection',message:r.translated,detail:`Original: ${r.source}`,buttons:['Copy translation','Close'],defaultId:0,cancelId:1,noLink:true}).then(x=>{if(x.response===0)clipboard.writeText(r.translated)})}catch(err){send('status',`Translation failed: ${err?.message||err}`)}
}

function setupContextMenu(t) {
  t.view.webContents.on('context-menu', (_event, params) => {
    const items = [];
    if (params.linkURL && safeHttpUrl(params.linkURL)) {
      items.push({ label: 'Open link in new tab', click: () => createBrowserTab(params.linkURL, true) });
      items.push({ label: 'Open link in your browser', click: () => shell.openExternal(params.linkURL) });
      items.push({ label: 'Copy link address', click: () => clipboard.writeText(params.linkURL) });
      items.push({ type: 'separator' });
    }
    items.push({ label: 'Back', enabled: navCanBack(t.view.webContents), click: () => navBack(t.view.webContents) });
    items.push({ label: 'Forward', enabled: navCanForward(t.view.webContents), click: () => navForward(t.view.webContents) });
    items.push({ label: 'Reload', click: () => t.view.webContents.reload() });
    items.push({ type: 'separator' });
    items.push({ label: 'Open this page in your browser', click: () => shell.openExternal(t.view.webContents.getURL()) });
    items.push({ label: 'Copy page URL', click: () => clipboard.writeText(t.view.webContents.getURL()) });
    if (params.selectionText?.trim()) { items.push({ type:'separator' }, { label:'Translate selected text', click:()=>showTranslatedSelectionDialog(t) }); }
    if (params.isEditable) {
      items.push({ type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' });
    }
    items.push({ type: 'separator' }, { label: 'Inspect', click: () => t.view.webContents.inspectElement(params.x, params.y) });
    Menu.buildFromTemplate(items).popup({ window: win });
  });
}
function createBrowserTab(rawUrl, activate = true) {
  const url = normalizeAddress(rawUrl);
  const id = `web-${Date.now().toString(36)}-${nextTab++}`;
  const liveSession = session.fromPartition(PARTITION);
  const view = new WebContentsView({
    webPreferences: {
      session: liveSession,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      spellcheck: true,
      backgroundThrottling: false
    }
  });
  view.setBackgroundColor('#0b0d15');
  setViewVisible(view, false);
  try { view.setBounds({ x: 0, y: BASE_TOP, width: 1, height: 1 }); } catch {}
  const t = { id, url, title: 'Loading…', loading: true, favicon: '', view };
  tabs.push(t);
  view.webContents.setWindowOpenHandler(details => {
    const target = safeHttpUrl(details.url);
    if (target) createBrowserTab(target, true);
    return { action: 'deny' };
  });
  view.webContents.on('will-navigate', (event, targetUrl) => {
    if (!safeHttpUrl(targetUrl)) event.preventDefault();
  });
  view.webContents.on('page-title-updated', (_e, title) => { t.title = title || new URL(view.webContents.getURL()).hostname; publishState(); scheduleSave(); });
  view.webContents.on('page-favicon-updated', (_e, favicons) => { t.favicon = favicons?.[0] || ''; publishState(); });
  view.webContents.on('did-start-loading', () => { t.loading = true; publishState(); refreshShellChrome(); send('status', `Loading ${t.title || url}`); });
  view.webContents.on('did-stop-loading', () => { t.loading = false; t.url = view.webContents.getURL() || url; publishState(); scheduleSave(); scheduleChromeGuard(); scheduleTabTranslator(t,{immediate:true}); send('status', `Ready · ${t.title || t.url}`); });
  view.webContents.on('focus', refreshShellChrome);
  view.webContents.on('dom-ready', () => scheduleChromeGuard());
  view.webContents.on('did-navigate', (_e, u) => { t.url = u; publishState(); scheduleSave(); });
  view.webContents.on('did-navigate-in-page', (_e, u) => { t.url = u; publishState(); scheduleSave(); });
  view.webContents.on('did-fail-load', (_e, code, desc, validatedURL, isMainFrame) => {
    if (!isMainFrame || code === -3) return;
    send('page-error', { url: validatedURL || t.url, code, description: desc });
  });
  view.webContents.on('found-in-page', (_e, result) => send('find-result', result));
  setupContextMenu(t);
  if (activate) activeId = id;
  // Mount the native view at its final clipped bounds before remote content can
  // focus it. This avoids the Windows stale hit-test/compositor state that could
  // blank and block the 94px shell chrome when opening a fresh tab.
  layoutViews(); publishState(); scheduleSave(); refreshShellChrome();
  view.webContents.loadURL(url).catch(() => {});
  scheduleChromeGuard();
  return t;
}
function closeTab(id) {
  const i = tabs.findIndex(t => t.id === id);
  if (i < 0) return;
  const [t] = tabs.splice(i, 1);
  stopTabTranslatorTimer(t);
  closedTabs.unshift({ url: t.view.webContents.getURL() || t.url, title: t.title });
  closedTabs = closedTabs.slice(0, 20);
  detach(t.view);
  try { t.view.webContents.close(); } catch {}
  if (activeId === id) activeId = tabs[Math.max(0, i - 1)]?.id || splitWorkspaceId;
  if (!tabs.length) splitMode = false;
  layoutViews(); publishState(); scheduleSave();
}
function activateTab(id) {
  if (id !== CATALOG_ID && id !== LAUNCHER_ID && !getTab(id)) return;
  if ((id === CATALOG_ID || id === LAUNCHER_ID) && splitMode && activeTab()) {
    splitWorkspaceId = id;
    layoutViews(); publishState(); scheduleSave();
    return;
  }
  activeId = id;
  if (id === CATALOG_ID || id === LAUNCHER_ID) {
    splitMode = false;
    splitWorkspaceId = id;
  }
  layoutViews(); publishState(); scheduleSave();
}
async function loadCatalogRuntime(runtimePath) {
  if (!catalogView || catalogView.webContents.isDestroyed() || !catalogStore) return;
  const target = runtimePath || catalogStore.runtimePath();
  if (target && fs.existsSync(target)) await catalogView.webContents.loadFile(target);
}
function setupCatalog() {
  catalogView = new WebContentsView({
    webPreferences: {
      // Share Chromium's live network partition with provider discovery. This makes the
      // catalog's <img> requests reuse the DNS/TLS/H2/H3 connections and HTTP cache that
      // preconnect/session.fetch warmed instead of paying a second cold network stack.
      session: session.fromPartition(PARTITION),
      preload: path.join(ROOT, 'catalog-preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      backgroundThrottling: false,
      additionalArguments: testMode ? ['--enderloom-self-test=1'] : [],
    }
  });
  catalogView.setBackgroundColor('#0b0d15');
  setViewVisible(catalogView, false);
  try { catalogView.setBounds({ x: 0, y: BASE_TOP, width: 1, height: 1 }); } catch {}
  catalogView.webContents.setWindowOpenHandler(details => {
    const target = safeHttpUrl(details.url);
    if (target) createBrowserTab(target, true);
    return { action: 'deny' };
  });
  catalogView.webContents.on('will-navigate', (event, u) => {
    if (/^file:/i.test(u)) return;
    const target = safeHttpUrl(u);
    event.preventDefault();
    if (target) createBrowserTab(target, true);
  });
  loadCatalogRuntime().catch(err => send('status', `Catalog load failed: ${err.message}`));
}
function setupLauncher() {
  launcherView = new WebContentsView({
    webPreferences: {
      session: session.fromPartition(LAUNCHER_PARTITION),
      preload: path.join(ROOT, 'launcher-preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      backgroundThrottling: false,
      additionalArguments: testMode ? ['--enderloom-self-test=1'] : [],
    }
  });
  launcherView.setBackgroundColor('#08090d');
  setViewVisible(launcherView, false);
  try { launcherView.setBounds({ x: 0, y: BASE_TOP, width: 1, height: 1 }); } catch {}
  launcherView.webContents.setWindowOpenHandler(details => {
    const target = safeHttpUrl(details.url);
    if (target) createBrowserTab(target, true);
    return { action: 'deny' };
  });
  launcherView.webContents.on('will-navigate', (event, targetUrl) => {
    if (/^file:/i.test(targetUrl)) return;
    event.preventDefault();
    const target = safeHttpUrl(targetUrl);
    if (target) createBrowserTab(target, true);
  });
  launcherView.webContents.on('focus', refreshShellChrome);
  launcherView.webContents.on('render-process-gone', () => {
    if (!win || win.isDestroyed()) return;
    try { detach(launcherView); } catch {}
    launcherView = null;
    setupLauncher();
    layoutViews();
  });
  const entry = path.join(ROOT, 'launcher', 'dist', 'index.html');
  if (fs.existsSync(entry)) {
    launcherView.webContents.loadFile(entry).catch(error => {
      send('status', `Mod Manager load failed: ${error.message}`);
    });
  } else {
    send('status', 'Mod Manager frontend is not built. Run npm run build:launcher.');
  }
  launcherView.webContents.once('did-finish-load', () => {
    publishState();
    void launcherService.start().then(() => publishState()).catch(error => {
      send('status', `Rust launcher service failed: ${error.message}`);
      publishState();
    });
  });
}
function bindCatalogStoreEvents() {
  if (!catalogStore) return;
  const reloadActive = payload => {
    const runtime = payload?.runtime || catalogStore.runtimePath();
    loadCatalogRuntime(runtime).then(() => { layoutViews(); publishState(); }).catch(err => send('status', `Catalog refresh failed: ${err.message}`));
  };
  catalogStore.on('active-changed', reloadActive);
  catalogStore.on('active-updated', reloadActive);
  catalogStore.on('catalogs-changed', () => publishState());
  catalogStore.on('source-health', () => publishState());
}
function focusWebContentsSoon(wc) {
  setTimeout(() => { try { if (wc && !wc.isDestroyed()) wc.focus(); } catch {} }, 80);
}
async function promptSitePermission({ wc, permission, callback, url, key }) {
  let settled = false;
  const finish = (allow, remember = false) => {
    if (settled) return;
    settled = true;
    if (remember) sessionPermissions.set(key, true);
    try { callback(!!allow); } catch {}
    focusWebContentsSoon(wc);
  };
  try {
    if (sessionPermissions.get(key) === true) { finish(true); return; }
    if (!win || win.isDestroyed()) { finish(false); return; }
    let host = url;
    try { host = new URL(url).hostname; } catch {}
    const result = await dialog.showMessageBox(win, {
      type: 'question',
      title: 'Site permission',
      message: `Allow ${permission}?`,
      detail: `${host || url} is requesting ${permission}. Allow this session remembers only this origin + permission until the app exits or live-site data is cleared.`,
      buttons: ['Block', 'Allow once', 'Allow this session'],
      defaultId: 0,
      cancelId: 0,
      noLink: true,
      normalizeAccessKeys: true
    });
    finish(result.response === 1 || result.response === 2, result.response === 2);
  } catch { finish(false); }
}
function queueSitePermission(request) {
  permissionPromptChain = permissionPromptChain.then(
    () => promptSitePermission(request),
    () => promptSitePermission(request)
  );
}
function openSourceCenterWindow() {
  if (!win || win.isDestroyed()) return;
  if (sourceCenterWin && !sourceCenterWin.isDestroyed()) { sourceCenterWin.show(); sourceCenterWin.focus(); return; }
  sourceCenterWin = new BrowserWindow({
    parent: win,
    width: 1040, height: 760, minWidth: 760, minHeight: 560,
    show: false, modal: false, autoHideMenuBar: true,
    title: `${APP_TITLE} - Catalog Center`, backgroundColor: '#10131f', icon: APP_ICON,
    webPreferences: {
      preload: path.join(ROOT, 'preload.js'), nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true, backgroundThrottling: false
    }
  });
  try { sourceCenterWin.webContents.setBackgroundThrottling(false); } catch {}
  sourceCenterWin.webContents.setWindowOpenHandler(() => ({ action:'deny' }));
  sourceCenterWin.loadFile(path.join(ROOT, 'source-center.html')).catch(() => {});
  sourceCenterWin.once('ready-to-show', () => { if (sourceCenterWin && !sourceCenterWin.isDestroyed()) sourceCenterWin.show(); });
  sourceCenterWin.on('closed', () => { sourceCenterWin = null; focusWebContentsSoon(activeTab()?.view?.webContents || catalogView?.webContents); });
}
async function confirmAndClearLiveData() {
  if (!win || win.isDestroyed()) return false;
  const result = await dialog.showMessageBox(win, {
    type: 'warning', title: 'Clear live-site data?',
    message: 'Clear live-site cookies and storage?',
    detail: 'This signs you out of sites opened inside the companion and clears their cookies/storage and session permission grants. Catalog favorites, notes, snapshots, and source definitions are kept.',
    buttons: ['Cancel', 'Clear browser data'], defaultId: 0, cancelId: 0, noLink: true
  });
  if (result.response !== 1) return false;
  await session.fromPartition(PARTITION).clearStorageData();
  sessionPermissions.clear();
  send('status', 'Live-site cookies, storage, and session permissions cleared.');
  return true;
}
function configureLiveSession() {
  const live = session.fromPartition(PARTITION);
  live.setPermissionRequestHandler((wc, permission, callback, details) => {
    const url = details?.requestingUrl || wc.getURL();
    let origin = url;
    try { origin = new URL(url).origin; } catch {}
    const key = `${origin}|${permission}`;
    if (sessionPermissions.get(key) === true) { callback(true); return; }
    queueSitePermission({ wc, permission, callback, url, key });
  });
  live.on('will-download', (_event, item) => {
    const id = crypto.randomUUID();
    const filename = item.getFilename();
    const savePath = path.join(app.getPath('downloads'), filename.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_'));
    try { item.setSavePath(savePath); } catch {}
    const rec = { id, filename, savePath, state: 'progressing', received: 0, total: item.getTotalBytes(), url: item.getURL() };
    downloads.set(id, rec); send('download', { type: 'created', ...rec });
    item.on('updated', (_e, state) => {
      rec.state = state; rec.received = item.getReceivedBytes(); rec.total = item.getTotalBytes();
      send('download', { type: 'updated', ...rec });
    });
    item.once('done', (_e, state) => {
      rec.state = state; rec.received = item.getReceivedBytes(); rec.total = item.getTotalBytes();
      send('download', { type: 'done', ...rec });
    });
  });
  return live;
}
function createWindow({ show = true } = {}) {
  win = new BrowserWindow({
    width: 1520, height: 940, minWidth: 980, minHeight: 640,
    show, frame: false, thickFrame: true, movable: true, resizable: true, minimizable: true, maximizable: true, title: APP_TITLE, backgroundColor: '#090a12', icon: APP_ICON,
    webPreferences: {
      preload: path.join(ROOT, 'preload.js'), nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true, backgroundThrottling: false
    }
  });
  try { win.webContents.setBackgroundThrottling(false); } catch {}
  win.loadFile(path.join(ROOT, 'shell.html'));
  win.on('resize', () => { layoutViews(); publishState(); refreshShellChrome(); });
  win.on('focus', refreshShellChrome);
  win.webContents.on('blur', refreshShellChrome);
  win.webContents.on('focus', refreshShellChrome);
  win.on('maximize', publishState);
  win.on('unmaximize', publishState);
  win.on('closed', () => { try { if (sourceCenterWin && !sourceCenterWin.isDestroyed()) sourceCenterWin.destroy(); } catch {} sourceCenterWin = null; chromeView = null; statusView = null; splitterView = null; catalogView = null; launcherView = null; win = null; });
  setupCatalog();
  setupLauncher();
  setupSplitterOverlay();
  setupChromeOverlay();
  setupStatusOverlay();
  win.webContents.once('did-finish-load', () => { layoutViews(); publishState(); refreshShellChrome(); });
}
function restoreSession() {
  const saved = readSavedSession();
  const unique = [];
  for (const entry of saved.tabs || []) {
    const u = safeHttpUrl(entry.url);
    if (u && !unique.includes(u)) unique.push(u);
    if (unique.length >= 12) break;
  }
  for (const u of unique) createBrowserTab(u, false);
  if (saved.activeUrl) {
    const found = tabs.find(t => t.url === saved.activeUrl);
    if (found) activeId = found.id;
  } else if (saved.activeWorkspace === LAUNCHER_ID) {
    activeId = LAUNCHER_ID;
  }
  splitWorkspaceId = saved.splitWorkspaceId === LAUNCHER_ID || saved.activeWorkspace === LAUNCHER_ID
    ? LAUNCHER_ID
    : CATALOG_ID;
  splitMode = !!saved.splitMode && !!activeTab();
  splitRatio = Number.isFinite(Number(saved.splitRatio)) ? Number(saved.splitRatio) : .46;
  splitSide = saved.splitSide === 'web-left' ? 'web-left' : 'catalog-left';
  statusBarCollapsed = !!saved.statusBarCollapsed;
  layoutViews(); publishState();
}
async function command(name, payload) {
  const t = activeTab();
  switch (name) {
    case 'activate': activateTab(payload?.id); break;
    case 'new-tab': createBrowserTab(payload?.url || 'https://www.google.com/', true); break;
    case 'close-tab': closeTab(payload?.id || activeId); break;
    case 'reopen-tab': { const x = closedTabs.shift(); if (x) createBrowserTab(x.url, true); break; }
    case 'catalog': activateTab(CATALOG_ID); break;
    case 'launcher': activateTab(LAUNCHER_ID); break;
    case 'navigate': if (t) t.view.webContents.loadURL(normalizeAddress(payload?.value)); else createBrowserTab(payload?.value, true); break;
    case 'back': if (t) navBack(t.view.webContents); break;
    case 'forward': if (t) navForward(t.view.webContents); break;
    case 'reload': if (t) t.loading ? t.view.webContents.stop() : t.view.webContents.reload(); else if (activeId === LAUNCHER_ID) launcherView?.webContents.reload(); else catalogView.webContents.reload(); break;
    case 'split': {
      if (t) {
        splitMode = !splitMode;
      } else if (tabs.length > 0) {
        splitWorkspaceId = activeId === LAUNCHER_ID ? LAUNCHER_ID : CATALOG_ID;
        activeId = tabs[tabs.length - 1].id;
        splitMode = true;
      }
      layoutViews(); publishState(); scheduleSave();
      break;
    }
    case 'split-resize': if (t && splitMode) { splitRatio = Number(payload?.ratio); layoutViews(); publishState(); scheduleSave(); } break;
    case 'split-reset': if (t && splitMode) { splitRatio = .5; layoutViews(); publishState(); scheduleSave(); } break;
    case 'split-swap': if (t && splitMode) { splitSide = splitSide === 'catalog-left' ? 'web-left' : 'catalog-left'; layoutViews(); publishState(); scheduleSave(); } break;
    case 'external': { const u = safeHttpUrl(payload?.url || currentUrl()); if (u) await shell.openExternal(u); break; }
    case 'copy-url': { const value = payload?.url || currentUrl(); if (/^https?:/i.test(value)) clipboard.writeText(value); break; }
    case 'find': if (t) { if (payload?.text) t.view.webContents.findInPage(payload.text, { forward: payload.forward !== false, findNext: !!payload.findNext }); else t.view.webContents.stopFindInPage('clearSelection'); } break;
    case 'zoom': if (t) { const current = t.view.webContents.getZoomFactor(); const next = payload?.mode === 'in' ? Math.min(2.5, current + .1) : payload?.mode === 'out' ? Math.max(.5, current - .1) : 1; t.view.webContents.setZoomFactor(next); publishState(); } break;
    case 'devtools': if (t) t.view.webContents.openDevTools({ mode: 'detach' }); else if (activeId === LAUNCHER_ID) launcherView?.webContents.openDevTools({ mode: 'detach' }); else catalogView.webContents.openDevTools({ mode: 'detach' }); break;
    case 'downloads-folder': await shell.openPath(app.getPath('downloads')); break;
    case 'open-download': if (payload?.path) await shell.openPath(payload.path); break;
    case 'clear-data': await session.fromPartition(PARTITION).clearStorageData(); sessionPermissions.clear(); send('status', 'Live-site cookies, storage, and session permissions cleared.'); break;
    case 'clear-data-confirm': return { cleared: await confirmAndClearLiveData() };
    case 'source-center': openSourceCenterWindow(); break;
    case 'source-center-close': { const target=sourceCenterWin; setTimeout(()=>{ try { if(target&&!target.isDestroyed()) target.close(); } catch {} },0); return { closing:true }; }
    case 'utility-height': utilityHeight = Math.max(0, Math.min(260, Number(payload?.height) || 0)); layoutViews(); break;
    case 'chrome-overlay-height': { const [,h]=win.getContentSize(); chromeOverlayHeight = Math.max(BASE_TOP, Math.min(h, CHROME_OVERLAY_MAX, Number(payload?.height) || BASE_TOP)); layoutChromeOverlay(); break; }
    case 'statusbar-toggle': { statusBarCollapsed = typeof payload?.collapsed === 'boolean' ? payload.collapsed : !statusBarCollapsed; layoutViews(); publishState(); scheduleSave(); break; }
    case 'adblock-update': return adblockManager ? adblockManager.checkForUpdate({ manual:true }) : { ...adblockStatus };
    case 'adblock-status': return { ...adblockStatus };
    case 'translator-status': return { ...translatorStatus, update:{...translatorUpdateStatus}, autoForActive:!!t&&!!translator?.autoSite(t.view.webContents.getURL()||t.url) };
    case 'translator-config': { if(!translator)return translatorStatus;translatorStatus=translator.configure(payload||{});publishState();return {...translatorStatus}; }
    case 'translator-page': return await translateTabPage(t,payload||{});
    case 'translator-original': { if(!t)throw new Error('Open a live browser tab first');const changed=await pageTranslator.showOriginal(t.view.webContents);send('status',`Original page restored · ${changed} segments`);return {changed,mode:'original'}; }
    case 'translator-translated': { if(!t)throw new Error('Open a live browser tab first');const changed=await pageTranslator.showTranslated(t.view.webContents);send('status',`Translated page shown · ${changed} segments`);return {changed,mode:'translated'}; }
    case 'translator-selection': return await translateTabSelection(t,payload||{});
    case 'translator-auto-site': { if(!t||!translator)throw new Error('Open a live browser tab first');const u=t.view.webContents.getURL()||t.url;const enabled=translator.setAutoSite(u,!!payload?.enabled);if(enabled)scheduleTabTranslator(t,{immediate:true});else stopTabTranslatorTimer(t);translatorStatus=translator.status();publishState();return {enabled,url:u,status:translatorStatus}; }
    case 'translator-update': { if(!translatorUpdater)return {...translatorUpdateStatus};translatorUpdateStatus=await translatorUpdater.checkForUpdate({manual:true});translatorStatus=translator.status();publishState();return {...translatorUpdateStatus}; }

    case 'focus-active-content': { const target=activeTab()?.view?.webContents || (activeId===CATALOG_ID ? catalogView?.webContents : activeId===LAUNCHER_ID ? launcherView?.webContents : null); setTimeout(()=>{ try { if(target&&!target.isDestroyed()) target.focus(); } catch {} }, 40); break; }
    case 'window-minimize': win.minimize(); break;
    case 'window-maximize': win.isMaximized() ? win.unmaximize() : win.maximize(); break;
    case 'window-close': win.close(); break;
    case 'catalog-list': return catalogCenterSummary();
    case 'catalog-switch':
    case 'catalog-activate': {
      await catalogStore.activate(payload?.id);
      activeId = CATALOG_ID; splitMode = false; layoutViews(); publishState();
      break;
    }
    case 'catalog-refresh': await catalogStore.refreshAll(payload?.catalogId || catalogStore.registry.activeCatalogId); break;
    case 'catalog-refresh-all': await catalogStore.refreshAllCatalogs(); break;
    case 'catalog-reveal': await shell.openPath(catalogStore.dir); break;
    case 'catalog-source-refresh': await catalogStore.refreshSource(payload?.catalogId || catalogStore.registry.activeCatalogId, payload?.sourceId, { reason:'manual' }); break;
    case 'catalog-import-dialog': {
      const picked = await dialog.showOpenDialog(sourceCenterWin && !sourceCenterWin.isDestroyed() ? sourceCenterWin : win, { properties:['openFile','multiSelections'], filters:[{name:'Catalog sources',extensions:['xlsx','xlsm','csv','tsv','json','docx','pdf','md','markdown','txt','html','htm','zip']},{name:'All files',extensions:['*']}] });
      if (!picked.canceled && picked.filePaths.length) await catalogStore.addLocalFiles(picked.filePaths,{mode:payload?.mode || 'smart'});
      break;
    }
    case 'catalog-import-paths': await catalogStore.addLocalFiles(payload?.paths || [], { mode:payload?.mode || 'smart' }); break;
    case 'catalog-add-google': await catalogStore.addGoogleSource(payload?.url, { catalogId:payload?.catalogId || catalogStore.registry.activeCatalogId, role:payload?.role, mode:payload?.mode || 'attach', name:payload?.name }); break;
    case 'catalog-toggle-source': await catalogStore.toggleSource(payload?.catalogId || catalogStore.registry.activeCatalogId, payload?.sourceId, payload?.enabled); break;
    case 'catalog-remove-source': await catalogStore.removeSource(payload?.catalogId || catalogStore.registry.activeCatalogId, payload?.sourceId); break;
    case 'catalog-google-signin': createBrowserTab('https://accounts.google.com/', true); break;
    case 'manifest': return JSON.parse(fs.readFileSync(path.join(ROOT, 'source-manifest.json'), 'utf8'));
    case 'get-state': return stateSnapshot();
    default: break;
  }
  return stateSnapshot();
}

const MEDIA_DISCOVERY_FRESH_MS = 24 * 60 * 60 * 1000;
const MEDIA_CACHE_MAX_MS = 30 * 24 * 60 * 60 * 1000;
function mediaCachePath() { return path.join(app.getPath('userData'), 'project-media-cache.json'); }
function mediaStorageKey(rawUrl, contextOrKey = '') {
  const url=safeHttpUrl(rawUrl)||String(rawUrl||'');
  const key=typeof contextOrKey==='string'?contextOrKey:contextFingerprint(mediaContext(contextOrKey));
  return key?`${url}\u241f${key}`:url;
}
function sanitizeMediaItem(raw, role = 'gallery') {
  if (!raw) return null;
  const url = safeHttpUrl(typeof raw === 'string' ? raw : raw.url);
  if (!url) return null;
  const width = Number(raw.width) || 0, height = Number(raw.height) || 0;
  const previewUrl=safeHttpUrl(raw.previewUrl)||'',posterUrl=safeHttpUrl(raw.posterUrl)||'';
  const mediaType=String(raw.mediaType||mediaKind(url)||'image');
  return { url, previewUrl:previewUrl&&previewUrl!==url?previewUrl:'', posterUrl:posterUrl&&posterUrl!==url?posterUrl:'', alt:String(raw.alt || ''), width, height, role:String(role || raw.role || 'gallery'), mediaType, source:String(raw.source || 'live-source'), provider:String(raw.provider || providerForUrl(url) || 'generic'), confidence:Math.max(0,Math.min(100,raw.confidence==null?55:Number(raw.confidence)||0)), identity:Math.max(0,Math.min(100,raw.identity==null?50:Number(raw.identity)||0)) };
}
function sanitizeMediaRecord(raw, sourceUrl = '') {
  if (!raw || typeof raw !== 'object') return null;
  const gallery = [];
  const seen = new Set();
  for (const item of Array.isArray(raw.gallery) ? raw.gallery : Array.isArray(raw.images) ? raw.images : []) {
    const clean = sanitizeMediaItem(item, 'gallery');
    if (clean && !seen.has(clean.url)) { seen.add(clean.url); gallery.push(clean); }
  }
  let icon = sanitizeMediaItem(raw.icon, 'icon');
  let author = sanitizeMediaItem(raw.author, 'author');
  // A URL may never occupy multiple semantic roles. This is a last-line quarantine for
  // conflicting provider/DOM lanes: an author avatar cannot leak into the gallery and a
  // project logo cannot become the creator avatar merely because another transport saw it first.
  const roleSpecificity=(item,role)=>{const hay=`${item?.source||''} ${item?.alt||''}`.toLowerCase();if(role==='author')return /(?:author|profile|creator|member|avatar)/.test(hay)?2:0;if(role==='icon')return /(?:project|icon|logo)/.test(hay)?2:0;return 0};
  if(icon&&author&&icon.url===author.url){const ai=roleSpecificity(author,'author'),ii=roleSpecificity(icon,'icon');if(ai>ii)icon=null;else if(ii>ai)author=null;else if((author.confidence||0)>(icon.confidence||0))icon=null;else author=null;}
  const occupied=new Set([icon?.url,author?.url].filter(Boolean));
  for(let i=gallery.length-1;i>=0;i--)if(occupied.has(gallery[i].url))gallery.splice(i,1);
  const authorUrl = safeHttpUrl(raw.authorUrl) || '';
  const normalizedSource = safeHttpUrl(raw.sourceUrl) || safeHttpUrl(sourceUrl) || '';
  if (!normalizedSource) return null;
  return {
    sourceUrl:normalizedSource,
    title:String(raw.title || ''),
    gallery,
    images:gallery,
    icon,
    author,
    authorUrl,
    discoveredAt:String(raw.discoveredAt || new Date().toISOString()),
    cachedAt:Number(raw.cachedAt) || Date.now(),
    error:String(raw.error || ''),
    provider:String(raw.provider || providerForUrl(normalizedSource) || 'generic'),
    identity:Math.max(0,Math.min(100,Number(raw.identity)||0)),
    contextKey:String(raw.contextKey || ''),
    exclusive:!!raw.exclusive,
    resolvedProjectUrl:safeHttpUrl(raw.resolvedProjectUrl)||'',
    resolutionConfidence:Math.max(0,Math.min(100,Number(raw.resolutionConfidence)||0)),
    galleryAbsent:!!raw.galleryAbsent,
    sourceGalleryAbsent:!!raw.sourceGalleryAbsent,
    liveOnly:true
  };
}
function loadMediaCache() {
  try {
    const raw = JSON.parse(fs.readFileSync(mediaCachePath(), 'utf8'));
    if (Number(raw?.version || 0) < 14) return;
    for (const [storedKey, value] of Object.entries(raw?.entries || {})) {
      const clean = sanitizeMediaRecord(value, value?.sourceUrl || String(storedKey).split('\u241f')[0]);
      if (!clean) continue;
      const key=storedKey;
      mediaCache.set(key, clean);
    }
  } catch {}
}
function saveMediaCacheSoon() {
  if (testMode) return;
  clearTimeout(mediaCacheSaveTimer);
  mediaCacheSaveTimer = setTimeout(() => {
    try {
      const entries = Object.fromEntries([...mediaCache.entries()].map(([key, value]) => [key, sanitizeMediaRecord(value, value?.sourceUrl || String(key).split('\u241f')[0])]).filter(([, value]) => value));
      fs.writeFileSync(mediaCachePath(), JSON.stringify({ version:14, policy:'adapter-role-bound-provider-owned-post-media-author-parallel-curseforge-gallery-live-order-full-html-dom-rescue-live-http-urls-only', updatedAt:new Date().toISOString(), entries }, null, 2));
    } catch {}
  }, 120);
}
function cachedProjectMedia(rawUrl, maxAgeMs = MEDIA_CACHE_MAX_MS, context = {}) {
  const url = safeHttpUrl(rawUrl); if (!url) return null;
  const wanted=contextFingerprint(mediaContext(context));
  const key=mediaStorageKey(url,wanted);
  let clean = sanitizeMediaRecord(mediaCache.get(key), url);
  // Read-only migration fallback for pre-v7 in-memory entries.
  if(!clean){const legacy=sanitizeMediaRecord(mediaCache.get(url),url);if(legacy&&(!wanted||legacy.contextKey===wanted))clean=legacy;}
  if (!clean) return null;
  if (wanted && clean.contextKey !== wanted) return null;
  const age = Math.max(0, Date.now() - Number(clean.cachedAt || 0));
  if (age > maxAgeMs) return null;
  return { ...clean, cacheHit:true, cacheAgeMs:age, stale:age > MEDIA_DISCOVERY_FRESH_MS };
}

const PROJECT_MEDIA_EXTRACT_SCRIPT = '(' + function () {
  const root = location.href;
  const host = location.hostname.toLowerCase();
  const ctx = window.__MCC_MEDIA_CONTEXT || {};
  const normText = value => String(value||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/\bminecraft\b/g,' ').replace(/\b(?:mod|mods|addon|texture pack|resource pack|data pack|datapack|modpack|plugin)\b/g,' ').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
  const tokenScore = (a,b) => { const A=[...new Set(normText(a).split(' ').filter(x=>x.length>1))],B=new Set(normText(b).split(' ').filter(x=>x.length>1));if(!A.length||!B.size)return 0;let common=0;for(const t of A)if(B.has(t))common++;return common/Math.max(1,A.length); };
  const pageTitle = document.querySelector('h1')?.textContent || document.title || '';
  const isCurseForgePage = host.endsWith('curseforge.com') || (()=>{ try { return new URL(ctx.primaryUrl||'').hostname.toLowerCase().endsWith('curseforge.com'); } catch { return false; } })();
  const isExactCurseForgeGallery=isCurseForgePage&&/\/gallery\/?$/i.test(location.pathname);
  const projectHeading = document.querySelector('h1');
  const afterProjectHeading=el=>!isExactCurseForgeGallery||!projectHeading||!!(projectHeading.compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING);
  const opaqueEntityIdentity = (host.endsWith('afdian.com')&&/^\/p\/[a-z0-9-]+\/?$/i.test(location.pathname))?.92:(host.endsWith('patreon.com')&&/^\/posts\/(?:[^/]+-)?\d+\/?$/i.test(location.pathname))?.90:(host.endsWith('minecraft.net')&&/\/marketplace\/pdp\/[0-9a-f-]{32,36}/i.test(location.pathname))?.94:(host.endsWith('ko-fi.com')&&/^\/s\/[a-z0-9_-]+\/?$/i.test(location.pathname))?.88:(host.endsWith('booth.pm')&&/\/items\/\d+/i.test(location.pathname))?.90:(host.endsWith('gumroad.com')&&/^\/l\/[^/]+/i.test(location.pathname))?.88:0;
  const pageIdentity = ctx.title ? Math.max(tokenScore(ctx.title,pageTitle),tokenScore(ctx.title,location.pathname.replace(/[-_/]+/g,' ')),opaqueEntityIdentity) : 1;
  if (ctx.title && pageIdentity < .42) return { title:pageTitle, gallery:[], icon:null, author:null, authorUrl:'', mediaPageUrls:[], identity:Math.round(pageIdentity*100), error:'Project identity mismatch' };
  const normalize = raw => { try { const u = new URL(raw, root); return /^https?:$/.test(u.protocol) ? u.href : null; } catch { return null; } };
  const profileScore = (href, anchor) => {
    const url = normalize(href); if (!url) return -1000;
    let score = 0;
    const path = new URL(url).pathname;
    const text = `${anchor?.textContent || ''} ${anchor?.getAttribute?.('aria-label') || ''} ${anchor?.className || ''} ${anchor?.parentElement?.className || ''}`;
    if (anchor?.rel?.includes?.('author') || anchor?.getAttribute?.('rel') === 'author') score += 80;
    if (/(?:author|creator|owner|profile|developer|member|by\s)/i.test(text)) score += 25;
    if (/curseforge\.com$/i.test(host) && /^\/members\/[^/]+(?:\/projects)?\/?$/i.test(path)) score += 120;
    if (/modrinth\.com$/i.test(host) && /^\/(?:user|organization)\/[^/]+\/?$/i.test(path)) score += 120;
    if (/planetminecraft\.com$/i.test(host) && /^\/member\/[^/]+/i.test(path)) score += 120;
    if (/github\.com$/i.test(host) && /^\/[^/]+\/?$/i.test(path)) score += 55;
    if (/afdian\.com$/i.test(host) && /^\/a\/[^/]+/i.test(path)) score += 90;
    if (/patreon\.com$/i.test(host) && /^\/(?:c\/)?[^/]+\/?$/i.test(path)) score += 75;
    if (/spigotmc\.org$/i.test(host) && /^\/members\/(?:[^/]*\.)?\d+\/?$/i.test(path)) score += 90;
    if (/builtbybit\.com$/i.test(host) && /^\/members\/(?:[^/]*\.)?\d+\/?$/i.test(path)) score += 90;
    if (/moddb\.com$/i.test(host) && /^\/members\/[^/]+\/?$/i.test(path)) score += 85;
    if (/gitlab\.com$/i.test(host) && /^\/[^/]+\/?$/i.test(path)) score += 70;
    if (/hangar\.papermc\.io$/i.test(host) && /^\/[^/]+\/?$/i.test(path)) score += 70;
    if (/ko-fi\.com$/i.test(host) && /^\/[^/]+\/?$/i.test(path) && !/^\/s\//i.test(path)) score += 75;
    if (/dev\.bukkit\.org$/i.test(host) && /^\/(?:members|users)\/[^/]+\/?$/i.test(path)) score += 85;
    if (/nexusmods\.com$/i.test(host) && /^\/(?:users\/\d+|profile\/[^/]+)\/?$/i.test(path)) score += 88;
    if (/polymart\.org$/i.test(host) && /^\/(?:user|profile)\/[^/]+\/?$/i.test(path)) score += 84;
    if (/mcpedl\.com$/i.test(host) && /^\/(?:user|author|members?)\/[^/]+\/?$/i.test(path)) score += 86;
    if (/modbay\.org$/i.test(host) && /^\/(?:user|author|members?)\/[^/]+\/?$/i.test(path)) score += 86;
    if (/gumroad\.com$/i.test(host) && /^\/[^/]+\/?$/i.test(path) && !/^\/l\//i.test(path)) score += 76;
    if (/itch\.io$/i.test(host) && /^\/?$/i.test(path)) score += 82;
    if (/booth\.pm$/i.test(new URL(url).hostname) && /^\/?$/i.test(path)) score += 82;
    if (/fourthwall\.com$/i.test(host) && /^\/?$/i.test(path)) score += 75;
    if (/\/(?:user|users|member|members|author|authors|profile|creator|creators)\//i.test(path)) score += 45;
    if (url === root || /\/(?:minecraft|mc-mods|mods|projects?)\//i.test(path)) score -= 80;
    return score;
  };
  const authorLinks = [];
  document.querySelectorAll('a[href]').forEach(a => {
    const url = normalize(a.getAttribute('href') || a.href); if (!url) return;
    const score = profileScore(url, a);
    if (score > 0) authorLinks.push({ url, score, text:String(a.textContent || '').trim().slice(0,120) });
  });
  try {
    const u = new URL(root); const parts = u.pathname.split('/').filter(Boolean);
    if (host === 'github.com' && parts.length >= 2) authorLinks.push({ url:`https://github.com/${parts[0]}`, score:140, text:parts[0] });
    if (host.endsWith('afdian.com') && parts[0] === 'a' && parts[1]) authorLinks.push({ url:`${u.origin}/a/${parts[1]}`, score:140, text:parts[1] });
  } catch {}
  authorLinks.sort((a,b)=>b.score-a.score);
  const authorUrl = authorLinks[0]?.url || '';
  const all = new Map();
  const add = (raw, meta={}) => {
    const url = normalize(raw); if (!url || /^(?:data|blob):/i.test(String(raw)) || /(?:scorecardresearch|doubleclick|google-analytics|pixel|tracking|gravatar\.com\/avatar\/0)/i.test(url)) return;
    const alt = String(meta.alt||''), cls = String(meta.cls||''), parent = String(meta.parent||''), anchor = String(meta.anchor||'');
    const mediaType=String(meta.mediaType||(/\.gif(?:$|[?#])/i.test(url)?'gif':(/\.(?:mp4|webm|ogv|mov|m4v|m3u8)(?:$|[?#])/i.test(url)||String(meta.tag||'').toLowerCase()==='video'?'video':'image')));
    const posterUrl=normalize(meta.poster||'')||'';
    const hay = `${url} ${alt} ${cls} ${parent} ${anchor}`;
    const w = Number(meta.w)||0, h = Number(meta.h)||0;
    const nearAuthor = !!meta.nearAuthor || (authorUrl && anchor === authorUrl) || /(?:author|creator|owner|profile|avatar|member)/i.test(`${cls} ${parent}`);
    let galleryScore = 0, iconScore = 0, authorScore = 0;
    if (meta.forceGallery && isExactCurseForgeGallery) galleryScore += 88;
    if (/(?:gallery|screenshot|screenshots|media|carousel|slide|showcase|preview|project-images|image-gallery|post-media|post-image)/i.test(hay)) galleryScore += 24;
    if(host.endsWith('afdian.com')&&/(?:\bvm-pic\b|\bimg-pre\b)/i.test(`${cls} ${parent}`))galleryScore+=52;
    if(host.endsWith('afdian.com')&&/afdiancdn\.com/i.test(url))galleryScore+=20;
    if(mediaType==='video')galleryScore+=42;else if(mediaType==='gif')galleryScore+=10;
    if (/(?:project[-_ ]?image|project[-_ ]?icon|mod[-_ ]?icon|logo|cover|thumbnail|project-avatar)/i.test(hay)) iconScore += 18;
    if (nearAuthor || /(?:profile[-_ ]?avatar|author[-_ ]?avatar|user[-_ ]?avatar|avatar|profile image|creator image)/i.test(hay)) authorScore += 28;
    if (/(?:tier frame|tier icon|badge|emoji|favicon|advert|sponsor|navbar|menu|header-logo|footer-logo|brand-logo)/i.test(hay)) { galleryScore -= 28; iconScore -= 18; authorScore -= 12; }
    if (/forgecdn|cursecdn|modrinth|githubusercontent|planetminecraft|pmc|cloudfront|usercontent|cdn|media\.forgecdn/i.test(url)) { galleryScore += 3; iconScore += 3; authorScore += 3; }
    if (w >= 360 && h >= 180) galleryScore += 8;
    if (w >= 700 && h >= 350) galleryScore += 6;
    if (w && h && w/h >= 1.15 && w/h <= 2.8) galleryScore += 5;
    if (w >= 96 && h >= 96 && Math.abs(w-h) <= Math.max(w,h)*.25) iconScore += 8;
    if (w >= 32 && h >= 32 && w <= 768 && h <= 768 && Math.abs(w-h) <= Math.max(w,h)*.3) authorScore += 8;
    if (nearAuthor) galleryScore -= 20;
    if ((w && w < 180) || (h && h < 100)) galleryScore -= 10;
    if (/\.(?:png|jpe?g|webp|avif|gif)(?:\?|#|$)/i.test(url)) { galleryScore += 3; iconScore += 3; authorScore += 3; }
    const prev = all.get(url);
    const rec = { url, posterUrl, mediaType, alt, width:w, height:h, galleryScore, iconScore, authorScore, nearAuthor };
    if (!prev || Math.max(galleryScore,iconScore,authorScore) > Math.max(prev.galleryScore,prev.iconScore,prev.authorScore)) all.set(url, rec);
  };
  document.querySelectorAll('img').forEach(img => {
    if (!afterProjectHeading(img)) return;
    if (img.closest('nav,aside,footer,[class*="comment" i],[id*="comment" i],[class*="related" i],[class*="recommend" i],[class*="similar" i],[class*="suggest" i],[class*="sidebar" i],[class*="advert" i],[class*="sponsor" i]')) return;
    const srcs = [img.currentSrc, img.src, img.getAttribute('data-src'), img.getAttribute('data-original'), img.getAttribute('data-lazy-src')].filter(Boolean);
    const ss = img.getAttribute('srcset') || img.getAttribute('data-srcset') || '';
    for (const bit of ss.split(',')) { const u = bit.trim().split(/\s+/)[0]; if (u) srcs.push(u); }
    const parent = img.closest('[class],[data-testid],[aria-label]');
    const anchor = img.closest('a[href]');
    const anchorUrl = normalize(anchor?.getAttribute('href') || anchor?.href || '');
    const meta = { alt:img.alt||'', cls:typeof img.className==='string'?img.className:'', parent:parent?.className || parent?.getAttribute?.('data-testid') || parent?.getAttribute?.('aria-label') || '', anchor:anchorUrl || '', nearAuthor:!!(anchorUrl && authorUrl && anchorUrl===authorUrl), w:img.naturalWidth || Number(img.getAttribute('width')) || 0, h:img.naturalHeight || Number(img.getAttribute('height')) || 0 };
    srcs.forEach(src => add(src, meta));
  });
  document.querySelectorAll('video').forEach(video=>{if(!afterProjectHeading(video))return;if(video.closest('nav,aside,footer,[class*="comment" i],[class*="related" i],[class*="recommend" i],[class*="advert" i],[class*="sponsor" i]'))return;const parent=video.closest('[class],[data-testid],[aria-label]');const poster=video.poster||video.getAttribute('poster')||'';const meta={alt:video.getAttribute('aria-label')||video.title||ctx.title||'project post video',cls:typeof video.className==='string'?video.className:'',parent:parent?.className||parent?.getAttribute?.('data-testid')||'',w:video.videoWidth||Number(video.getAttribute('width'))||0,h:video.videoHeight||Number(video.getAttribute('height'))||0,mediaType:'video',tag:'video',poster};[video.currentSrc,video.src,...[...video.querySelectorAll('source[src]')].map(x=>x.src)].filter(Boolean).forEach(src=>add(src,meta));});
  document.querySelectorAll('[style*="background" i]').forEach(el=>{if(!afterProjectHeading(el))return;if(el.closest('nav,aside,footer,[class*="comment" i],[class*="related" i],[class*="recommend" i],[class*="sidebar" i],[class*="advert" i],[class*="sponsor" i]'))return;const cls=typeof el.className==='string'?el.className:'',parent=el.parentElement?.className||'',semantic=/(?:gallery|screenshot|showcase|post|article|content|preview|media|carousel|slide)/i.test(`${cls} ${parent}`);if(!semantic)return;const style=el.getAttribute('style')||'';for(const m of style.matchAll(/url\((?:["']?)([^)"']+)(?:["']?)\)/ig))add(m[1],{alt:ctx.title||'project post media',cls,parent,w:el.clientWidth||0,h:el.clientHeight||0});});
  if(!isExactCurseForgeGallery)document.querySelectorAll('meta[property="og:image"],meta[name="twitter:image"],meta[name="twitter:image:src"]').forEach(m => add(m.content,{alt:'official project social preview',cls:'project preview cover',w:1200,h:630}));
  document.querySelectorAll('a[href]').forEach(a => {
    const h=a.href||'';let directCurseForgeGallery=false;
    if(isExactCurseForgeGallery){
      try{
        const u=new URL(h,root),afterHeading=!projectHeading||!!(projectHeading.compareDocumentPosition(a)&Node.DOCUMENT_POSITION_FOLLOWING);
        const label=`${a.getAttribute('aria-label')||''} ${a.getAttribute('title')||''} ${a.textContent||''} ${[...a.querySelectorAll('img[alt]')].map(x=>x.alt).join(' ')}`;
        directCurseForgeGallery=afterHeading&&/(?:^|\.)(?:forgecdn|cursecdn)\.net$/i.test(u.hostname)&&/^\/attachments\/(?:thumbnails\/)?\d+\/\d+\//i.test(u.pathname)&&!/(?:battlegrounds|ugc[ _-]?contest|promotion|campaign|advert|sponsor)/i.test(`${h} ${label} ${a.className||''} ${a.parentElement?.className||''}`);
      }catch{}
    }
    if(!directCurseForgeGallery&&a.closest('nav,aside,footer,[class*="comment" i],[class*="related" i],[class*="recommend" i],[class*="similar" i],[class*="sidebar" i]'))return;
    if (directCurseForgeGallery||(!isExactCurseForgeGallery&&/\.(?:png|jpe?g|gif|webp|avif)(?:\?|#|$)/i.test(h))){
      const childAlt=[...a.querySelectorAll('img[alt]')].map(x=>x.alt).filter(Boolean).join(' ');
      add(h,{alt:a.getAttribute('aria-label')||a.getAttribute('title')||childAlt||a.textContent||'',cls:`${a.className||''}${directCurseForgeGallery?' curseforge-gallery direct-attachment':''}`,parent:a.parentElement?.className||'',anchor:normalize(a.href)||'',forceGallery:directCurseForgeGallery});
    }
  });
  if(!isExactCurseForgeGallery)document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
    try {
      const data=JSON.parse(script.textContent||'{}'); const rows=Array.isArray(data)?data:[data];
      for(const row of rows){ const structuredName=row?.name||row?.headline||row?.alternateName||''; if(ctx.title&&structuredName&&tokenScore(ctx.title,structuredName)<.5)continue; const imgs=[row?.image,row?.thumbnailUrl,row?.logo].flat().filter(Boolean); imgs.forEach(x=>add(typeof x==='string'?x:x?.url,{alt:structuredName||'structured project image',cls:'project structured media',w:1200,h:630})); }
    } catch {}
  });
  const vals=[...all.values()];
  const sort=(key)=>vals.filter(x=>x[key]>0).sort((a,b)=>b[key]-a[key] || (b.width*b.height)-(a.width*a.height));
  const identity=Math.round(pageIdentity*100), decorate=(x,role,key)=>x?{...x,role,provider:host,source:'identity-checked-live-dom',identity,confidence:Math.min(96,Math.max(58,55+Number(x[key]||0)+Math.round(pageIdentity*14)))}:null;
  let gallery=sort('galleryScore').filter(x=>x.galleryScore>=10 && !x.nearAuthor && x.authorScore < x.galleryScore + 12).map(x=>decorate(x,'gallery','galleryScore'));
  let icon=decorate(sort('iconScore').find(x=>x.iconScore>=8&&!x.nearAuthor&&!/(profile avatar|author avatar|user avatar)/i.test(`${x.alt} ${x.url}`)) || null,'icon','iconScore');
  let author=decorate(sort('authorScore').find(x=>x.authorScore>=18&&x.nearAuthor) || null,'author','authorScore');
  if(icon&&author&&icon.url===author.url){if((author.confidence||0)>=(icon.confidence||0))icon=null;else author=null}
  const occupied=new Set([icon?.url,author?.url].filter(Boolean));gallery=gallery.filter(x=>!occupied.has(x.url));
  const mediaPageUrls=[...document.querySelectorAll('a[href]')].filter(a=>{
    const target=normalize(a.getAttribute('href')||a.href);if(!target)return false;
    if(isCurseForgePage){try{const here=new URL(root),there=new URL(target),base=here.pathname.replace(/\/gallery\/?$/i,'').replace(/\/$/,'');if(there.origin===here.origin&&there.pathname.replace(/\/$/,'')===`${base}/gallery`)return true}catch{}}
    return !a.closest('nav,aside,footer,[class*="related" i],[class*="recommend" i],[class*="similar" i],[class*="sidebar" i]');
  }).map(a=>({url:normalize(a.getAttribute('href')||a.href),text:String(a.textContent||'').trim(),cls:String(a.className||'')})).filter(x=>x.url&&(/(?:gallery|screenshots?|media)/i.test(`${x.text} ${x.cls}`)||/\/(?:gallery|screenshots?|media)\/?(?:[?#].*)?$/i.test(new URL(x.url).pathname))).map(x=>x.url).filter((u,i,a)=>a.indexOf(u)===i);
  const sourceGalleryAbsent=isExactCurseForgeGallery&&/this\s+mod\s+has\s+no\s+gallery\s+items\s+available/i.test(document.body?.innerText||'');
  return { title:pageTitle, gallery, icon, author, authorUrl, mediaPageUrls, identity, sourceGalleryAbsent, galleryAbsent:false };
}.toString() + ')()';

const PROVIDER_LINK_RESOLVE_SCRIPT = '(' + function () {
  const ctx=window.__MCC_MEDIA_CONTEXT||{},expected=String(ctx.title||'');
  const norm=value=>String(value||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/\bminecraft\b/g,' ').replace(/\b(?:mod|mods|addon|add-on|texture pack|resource pack|data pack|datapack|modpack|plugin|model|models)\b/g,' ').replace(/\bv?\d+(?:\.\d+){0,3}\b/g,' ').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
  const similarity=(a,b)=>{a=norm(a);b=norm(b);if(!a||!b)return 0;if(a===b)return 1;if(a.length>=5&&(a.includes(b)||b.includes(a)))return .94;const A=new Set(a.split(' ').filter(x=>x.length>1)),B=new Set(b.split(' ').filter(x=>x.length>1));if(!A.size||!B.size)return 0;let common=0;for(const t of A)if(B.has(t))common++;const union=new Set([...A,...B]).size,contain=common/Math.max(1,Math.min(A.size,B.size));return Math.max(common/Math.max(1,union)*.58+contain*.42,0)};
  const host=location.hostname.toLowerCase().replace(/^www\./,''),provider=host.endsWith('planetminecraft.com')?'planetminecraft':host.endsWith('afdian.com')?'afdian':host.endsWith('fourthwall.com')?'fourthwall':host.endsWith('booth.pm')?'booth':host.endsWith('spigotmc.org')?'spigot':host==='hangar.papermc.io'?'hangar':host.endsWith('dev.bukkit.org')?'bukkit':host.endsWith('builtbybit.com')?'builtbybit':host.endsWith('nexusmods.com')?'nexusmods':host.endsWith('moddb.com')?'moddb':host.endsWith('polymart.org')?'polymart':host==='gitlab.com'?'gitlab':'generic';
  const allowed=u=>{const p=u.pathname;if(provider==='planetminecraft')return /^\/(?:texture-pack|project|mod|mob-skin|skin|data-pack|map|blog)\/[^/]+\/?$/i.test(p);if(provider==='afdian')return /^\/p\/[a-z0-9-]+\/?$/i.test(p);if(provider==='fourthwall')return /^\/products\/[^/]+\/?$/i.test(p);if(provider==='booth')return /^\/(?:[a-z]{2}\/)?items\/\d+\/?$/i.test(p);if(provider==='spigot')return /^\/resources\/(?:[^/]*\.)?\d+\/?$/i.test(p);if(provider==='hangar')return /^\/[^/]+\/[^/]+\/?$/i.test(p);if(provider==='bukkit')return /^\/projects\/[^/]+\/?$/i.test(p);if(provider==='builtbybit')return /^\/resources\/(?:[^/]*\.)?\d+\/?$/i.test(p);if(provider==='nexusmods')return /^\/[^/]+\/mods\/\d+\/?$/i.test(p);if(provider==='moddb')return /^\/mods\/[^/]+\/?$/i.test(p);if(provider==='polymart')return /^\/(?:resource\/(?:[^/]*\.)?\d+|product\/\d+\/[^/]+)\/?$/i.test(p);if(provider==='gitlab'){const parts=p.split('/').filter(Boolean);return parts.length>=2&&!['users','groups','explore','dashboard','help'].includes((parts[0]||'').toLowerCase())&&!p.includes('/-/');}return false};
  const out=[];
  document.querySelectorAll('a[href]').forEach(a=>{let u;try{u=new URL(a.href,location.href)}catch{return}if(u.origin!==location.origin||!allowed(u))return;const text=String(a.textContent||'').trim(),title=a.getAttribute('title')||'',aria=a.getAttribute('aria-label')||'',alt=[...a.querySelectorAll('img[alt]')].map(x=>x.alt).join(' '),slug=decodeURIComponent(u.pathname.split('/').filter(Boolean).pop()||'').replace(/[-_]+/g,' ');const sims=[similarity(expected,text),similarity(expected,title),similarity(expected,aria),similarity(expected,alt),similarity(expected,slug)];let score=Math.max(...sims);const e=norm(expected);if(e&&[text,title,aria,alt].some(x=>norm(x)===e))score=1;if(score>=.68)out.push({url:u.href,title:text||title||alt||slug,confidence:Math.round(score*100),identity:Math.round(score*100),provider})});
  const best=new Map();for(const row of out){const key=row.url.replace(/[?#].*$/,'').replace(/\/$/,'');const prev=best.get(key);if(!prev||row.confidence>prev.confidence)best.set(key,row)}return [...best.values()].sort((a,b)=>b.confidence-a.confidence||b.identity-a.identity);
}.toString() + ')()';

const AUTHOR_MEDIA_EXTRACT_SCRIPT = '(' + function () {
  const root=location.href,ctx=window.__MCC_MEDIA_CONTEXT||{},expected=String(ctx.author||'');
  const norm=v=>String(v||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
  const sim=(a,b)=>{a=norm(a);b=norm(b);if(!a||!b)return 0;if(a===b)return 1;if(a.length>=3&&(a.includes(b)||b.includes(a)))return .94;const A=new Set(a.split(' ')),B=new Set(b.split(' '));let c=0;for(const x of A)if(B.has(x))c++;return c/Math.max(1,Math.min(A.size,B.size))};
  const slug=decodeURIComponent(location.pathname.split('/').filter(Boolean).filter(x=>!['members','projects','user','users','member','profile'].includes(x.toLowerCase())).pop()||'').replace(/[-_]+/g,' ');
  const pageTitle=document.querySelector('h1')?.textContent||document.title||'';const identity=expected?Math.max(sim(expected,pageTitle),sim(expected,slug)):0.7;
  if(expected&&identity<.5)return null;
  const normalize=raw=>{try{const u=new URL(raw,root);return /^https?:$/.test(u.protocol)?u.href:null}catch{return null}};
  const all=[];const add=(raw,meta={})=>{const url=normalize(raw);if(!url)return;const w=Number(meta.w)||0,h=Number(meta.h)||0,alt=String(meta.alt||''),hay=`${url} ${alt} ${meta.cls||''} ${meta.parent||''}`;let score=Math.round(identity*35);
    if(meta.boundSelf)score+=72;
    if(/(?:profile[-_ ]?avatar|author[-_ ]?avatar|user[-_ ]?avatar|member[-_ ]?avatar|profile image|portrait)/i.test(hay))score+=58;
    else if(/(?:avatar|profile|portrait)/i.test(hay))score+=34;
    if(expected&&sim(expected,alt)>=.72)score+=28;
    if(w>=48&&h>=48&&Math.abs(w-h)<=Math.max(w,h)*.3)score+=16;
    if(/(?:project image|project icon|mod icon|cover|banner|tier frame|tier icon|badge|emoji|favicon|site-logo|brand-logo|advert|sponsor|battlegrounds|ugc[ -]?contest)/i.test(hay))score-=100;
    if(score>=72)all.push({url,alt:alt||`${expected||'Creator'} avatar`,width:w,height:h,role:'author',source:'exact-author-profile-dom',provider:location.hostname,confidence:Math.min(100,score),identity:Math.round(identity*100),score});};
  document.querySelectorAll('img').forEach(img=>{if(img.closest('nav,aside,footer,[class*="comment" i],[class*="related" i],[class*="recommend" i],[class*="sidebar" i],[class*="advert" i],[class*="sponsor" i]'))return;const parent=img.closest('[class],[data-testid],[aria-label]'),anchor=img.closest('a[href]');let boundSelf=false;try{const a=new URL(anchor?.href||'',root),r=new URL(root);boundSelf=a.origin===r.origin&&a.pathname.replace(/\/$/,'')===r.pathname.replace(/\/$/,'')}catch{}const meta={alt:img.alt||'',cls:typeof img.className==='string'?img.className:'',parent:parent?.className||parent?.getAttribute?.('data-testid')||parent?.getAttribute?.('aria-label')||'',w:img.naturalWidth||Number(img.getAttribute('width'))||0,h:img.naturalHeight||Number(img.getAttribute('height'))||0,boundSelf};[img.currentSrc,img.src,img.getAttribute('data-src'),img.getAttribute('data-original')].filter(Boolean).forEach(x=>add(x,meta));});
  if(identity>=.8)document.querySelectorAll('meta[property="og:image"],meta[name="twitter:image"]').forEach(m=>add(m.content,{alt:expected?`${expected} profile image`:'profile image',cls:'profile social image',w:512,h:512}));
  all.sort((a,b)=>b.score-a.score||(b.width*b.height)-(a.width*a.height));return all[0]||null;
}.toString() + ')()';

function newMediaView() {
  const view = new WebContentsView({ webPreferences:{ session:session.fromPartition(PARTITION), nodeIntegration:false, contextIsolation:true, sandbox:true, webSecurity:true, allowRunningInsecureContent:false, backgroundThrottling:false } });
  view.setBounds({ x:0, y:0, width:1280, height:900 });
  view.webContents.setWindowOpenHandler(() => ({ action:'deny' }));
  view.webContents.on('will-navigate', (e,target) => { if (!safeHttpUrl(target)) e.preventDefault(); });
  return view;
}
function acquireMediaView({ foreground=false } = {}) {
  const normalLimit=Math.max(1,MEDIA_VIEW_POOL_MAX-MEDIA_VIEW_FOREGROUND_RESERVE);
  const idle=mediaViewPool.find(x=>!x.busy&&(foreground||!x.foregroundOnly)&&x.view&&!x.view.webContents.isDestroyed());
  if(idle){idle.busy=true;return Promise.resolve(idle.view)}
  const limit=foreground?MEDIA_VIEW_POOL_MAX:normalLimit;
  if(mediaViewPool.length<limit){const view=newMediaView();mediaViewPool.push({view,busy:true,foregroundOnly:foreground&&mediaViewPool.length>=normalLimit});return Promise.resolve(view)}
  return new Promise(resolve=>{const waiter={resolve,foreground};foreground?mediaViewWaiters.unshift(waiter):mediaViewWaiters.push(waiter)});
}
function releaseMediaView(view) {
  let slot=mediaViewPool.find(x=>x.view===view);
  if(!slot)return;
  if(!view||view.webContents.isDestroyed()){mediaViewPool.splice(mediaViewPool.indexOf(slot),1);slot=null;}
  const waiterIndex=slot?.foregroundOnly?mediaViewWaiters.findIndex(waiter=>waiter.foreground):(mediaViewWaiters.length?0:-1);
  const waiter=waiterIndex>=0?mediaViewWaiters.splice(waiterIndex,1)[0]:null;
  if(waiter){if(!slot)acquireMediaView({foreground:waiter.foreground}).then(waiter.resolve);else{slot.busy=true;waiter.resolve(slot.view)}}
  else if(slot)slot.busy=false;
}
function warmMediaViewPool(count=Math.min(4,MEDIA_VIEW_POOL_MAX)) {
  const target=Math.max(0,Math.min(MEDIA_VIEW_POOL_MAX,Number(count)||0));
  while(mediaViewPool.length<target){
    const view=newMediaView();
    mediaViewPool.push({view,busy:false,warmedAt:Date.now()});
  }
  return mediaViewPool.length;
}
function liveNetworkSession() { return session.fromPartition(PARTITION); }
function rememberChromiumText(cacheKey,value) {
  const prior=chromiumTextCache.get(cacheKey);if(prior)chromiumTextCacheBytes-=prior.bytes||0;
  chromiumTextCache.delete(cacheKey);
  const bytes=Buffer.byteLength(String(value?.text||''),'utf8');
  chromiumTextCache.set(cacheKey,{at:Date.now(),value,bytes});chromiumTextCacheBytes+=bytes;
  while(chromiumTextCacheBytes>CHROMIUM_TEXT_CACHE_MAX_BYTES&&chromiumTextCache.size>1){const oldestKey=chromiumTextCache.keys().next().value,oldest=chromiumTextCache.get(oldestKey);chromiumTextCache.delete(oldestKey);chromiumTextCacheBytes-=oldest?.bytes||0;}
}
function responseHeadersObject(headers) {
  const out={};try{for(const [k,v] of headers||[])out[String(k).toLowerCase()]=String(v)}catch{}return out;
}
function preconnectMediaOrigins(urls=[]) {
  const ses=liveNetworkSession(),now=Date.now(),origins=new Set();
  for(const raw of urls){try{const u=new URL(raw);if(/^https?:$/.test(u.protocol))origins.add(u.origin)}catch{}}
  for(const origin of origins){
    const last=mediaPreconnectAt.get(origin)||0;if(now-last<30_000)continue;mediaPreconnectAt.set(origin,now);
    let numSockets=3;try{const provider=providerForUrl(origin);if(HEDGED_DEEP_PROVIDERS.has(provider))numSockets=6}catch{}
    try{ses.preconnect({url:origin+'/',numSockets})}catch{}
  }
}
function warmImageInLiveSession(rawUrl) {
  const url=safeHttpUrl(rawUrl);if(!url)return Promise.resolve(false);
  const now=Date.now(),last=mediaImageWarmAt.get(url)||0;if(now-last<60_000)return mediaImageWarmInflight.get(url)||Promise.resolve(true);
  const existing=mediaImageWarmInflight.get(url);if(existing)return existing;
  mediaImageWarmAt.set(url,now);
  const task=(async()=>{
    try{
      const response=await liveNetworkSession().fetch(url,{method:'GET',redirect:'follow',cache:'default',headers:{Accept:'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'}});
      if(!response?.ok)return false;
      if(response.body?.getReader){const reader=response.body.getReader();while(true){const part=await reader.read();if(part.done)break}}
      else await response.arrayBuffer();
      return true;
    }catch{return false}finally{mediaImageWarmInflight.delete(url)}
  })();
  mediaImageWarmInflight.set(url,task);return task;
}
function warmDiscoveredImages(candidate,priority=0) {
  const p=Number(priority)||0,count=p>=900000?8:p>=250000?4:0;if(!count)return;
  const rows=[candidate?.icon,...(candidate?.gallery||[]),...(candidate?.images||[])].filter(Boolean),seen=new Set(),urls=[];
  for(const item of rows){const u=item?.mediaType==='video'?(safeHttpUrl(item?.posterUrl)||safeHttpUrl(item?.previewUrl)):(safeHttpUrl(item?.previewUrl)||safeHttpUrl(item?.url));if(!u||seen.has(u))continue;seen.add(u);urls.push(u);if(urls.length>=count)break}
  for(const url of urls)warmImageInLiveSession(url).catch(()=>{});
}
function preconnectCachedMediaOrigins() {
  // Metadata is already persisted locally. Turn it into connection setup work before the
  // renderer asks for its first card so DNS/TLS/H2/H3 negotiation can overlap catalog boot.
  // This walks every cached record; only duplicate origins are collapsed by preconnectMediaOrigins.
  const urls=[
    'https://www.curseforge.com/',
    'https://modrinth.com/',
    'https://github.com/',
    'https://www.planetminecraft.com/',
    'https://mcpedl.com/',
    'https://modbay.org/',
    'https://afdian.com/',
    'https://www.patreon.com/',
    'https://www.minecraft.net/',
    'https://booth.pm/',
    'https://ko-fi.com/',
    ...allProviderOriginHints()
  ];
  for(const media of mediaCache.values()){
    if(!media)continue;
    urls.push(media.sourceUrl,media.authorUrl,media.resolvedProjectUrl);
    if(media.icon)urls.push(media.icon.previewUrl,media.icon.url);
    if(media.author)urls.push(media.author.previewUrl,media.author.url);
    for(const item of media.gallery||media.images||[])urls.push(item?.posterUrl,item?.previewUrl,item?.url);
  }
  preconnectMediaOrigins(urls.filter(Boolean));
}
function chromiumTextSnapshot(chunks, limit) {
  const buffer=Buffer.concat(chunks);return (buffer.length>limit?buffer.subarray(0,limit):buffer).toString('utf8');
}
function curseForgeGalleryUrl(rawUrl='') {
  try{
    const u=new URL(rawUrl);if(!/(?:^|\.)curseforge\.com$/i.test(u.hostname))return '';
    const parts=u.pathname.split('/').filter(Boolean);if(parts.length<3||parts[0].toLowerCase()!=='minecraft')return '';
    u.pathname=`/${parts[0]}/${parts[1]}/${parts[2]}/gallery`;u.search='';u.hash='';return u.toString();
  }catch{return ''}
}

// Browser-grade SSR fetch without constructing a DOM. This runs on Electron/Chromium's
// native network stack (same cookies, proxy, TLS/H2 pool and cache as live tabs) and
// exposes head/media/prefix/full readiness from one physical request. The media gate
// is content-sensitive: it resolves on a complete provider CDN image marker instead of
// waiting for an arbitrary 512-768 KiB prefix.
function chromiumProgressiveTextShared(rawUrl, options={}) {
  const url=safeHttpUrl(rawUrl);if(!url){const fail=Promise.reject(new Error('Invalid Chromium fetch URL'));fail.catch(()=>{});return {head:fail,media:fail,prefix:fail,full:fail,cacheHit:false}}
  const stopAfterMedia=!!options.stopAfterMedia,stopAfterPrefix=!!options.stopAfterPrefix;
  const ttl=Math.max(0,Number(options.cacheTtlMs??120_000)),bypass=!!options.bypassCache||!!options.force||stopAfterMedia||stopAfterPrefix;
  const headMax=Math.max(64*1024,Number(options.headMaxBytes)||384*1024),mediaMax=Math.max(32*1024,Number(options.mediaMaxBytes)||320*1024),mediaMin=Math.max(128,Number(options.mediaMinBytes)||512),prefixMax=Math.max(headMax,Number(options.prefixMaxBytes)||768*1024),mediaPattern=options.mediaPattern||null;
  const cacheKey=`chromium:${url}`;
  if(!bypass){const hit=chromiumTextCache.get(cacheKey);if(hit&&Date.now()-hit.at<=ttl){const full={...hit.value,memoryCacheHit:true,memoryCacheAgeMs:Date.now()-hit.at};const text=String(full.text||''),m=/<\/head\s*>/i.exec(text),headText=m?text.slice(0,text.indexOf('>',m.index)+1):text.slice(0,headMax),mediaText=text.slice(0,mediaMax),prefixText=text.slice(0,prefixMax);return {head:Promise.resolve({...full,text:headText,truncated:headText.length<text.length}),media:Promise.resolve({...full,text:mediaText,truncated:mediaText.length<text.length,mediaMarker:streamMediaMarkerMatched(mediaText,mediaPattern),firstMediaUrl:streamFirstTrustedMediaUrl(mediaText)}),prefix:Promise.resolve({...full,text:prefixText,truncated:prefixText.length<text.length}),full:Promise.resolve(full),cacheHit:true}}
    const inflight=chromiumProgressiveInflight.get(cacheKey);if(inflight)return inflight;
  }
  let resolveHead,rejectHead,resolveMedia,rejectMedia,resolvePrefix,rejectPrefix,resolveFull,rejectFull,headDone=false,mediaDone=false,prefixDone=false;
  const head=new Promise((r,j)=>{resolveHead=r;rejectHead=j}),media=new Promise((r,j)=>{resolveMedia=r;rejectMedia=j}),prefix=new Promise((r,j)=>{resolvePrefix=r;rejectPrefix=j}),full=new Promise((r,j)=>{resolveFull=r;rejectFull=j});
  head.catch(()=>{});media.catch(()=>{});prefix.catch(()=>{});full.catch(()=>{});
  const flow={head,media,prefix,full,cacheHit:false};if(!bypass)chromiumProgressiveInflight.set(cacheKey,flow);
  (async()=>{
    const controller=new AbortController(),timeoutMs=Math.max(700,Number(options.timeoutMs)||4800),timer=setTimeout(()=>controller.abort(),timeoutMs);
    try{
      const response=await liveNetworkSession().fetch(url,{method:'GET',redirect:'follow',signal:controller.signal,headers:options.headers||{Accept:'text/html,application/xhtml+xml;q=0.9,*/*;q=0.2'},cache:options.force?'no-store':'default'});
      const status=Number(response.status)||0,headers=responseHeadersObject(response.headers),chunks=[];let bytes=0,headTail='',mediaTail='',stopRequested=false,stopReason='';
      const emitHead=(truncated=false)=>{if(headDone)return;headDone=true;let text=chromiumTextSnapshot(chunks,headMax);const m=/<\/head\s*>/i.exec(text);if(m){const close=text.indexOf('>',m.index);if(close>=0)text=text.slice(0,close+1)}resolveHead({url,status,headers,text,bytesRead:Math.min(bytes,headMax),truncated:truncated||!m,transport:'chromium-session-fetch'})};
      const emitMedia=(truncated=false,allowStop=true)=>{if(mediaDone)return;mediaDone=true;const text=chromiumTextSnapshot(chunks,mediaMax),firstMediaUrl=streamFirstTrustedMediaUrl(text),mediaMarker=streamMediaMarkerMatched(text,mediaPattern);resolveMedia({url,status,headers,text,bytesRead:Math.min(bytes,mediaMax),truncated,mediaMarker,firstMediaUrl,transport:'chromium-session-fetch'});if(allowStop&&stopAfterMedia&&mediaMarker&&firstMediaUrl){stopRequested=true;stopReason='media'}};
      const emitPrefix=(truncated=false,allowStop=true)=>{if(prefixDone)return;prefixDone=true;resolvePrefix({url,status,headers,text:chromiumTextSnapshot(chunks,prefixMax),bytesRead:Math.min(bytes,prefixMax),truncated,transport:'chromium-session-fetch'});if(allowStop&&stopAfterPrefix){stopRequested=true;stopReason='prefix'}};
      if(!response.body||typeof response.body.getReader!=='function'){
        const text=await response.text(),b=Buffer.from(text);chunks.push(b);bytes=b.length;emitHead(false);emitMedia(false);emitPrefix(false);return {url,status,headers,text,bytesRead:bytes,transport:'chromium-session-fetch'};
      }
      const reader=response.body.getReader();
      while(true){
        const {done,value}=await reader.read();if(done)break;const b=Buffer.from(value);chunks.push(b);bytes+=b.length;
        const chunkText=b.toString('latin1');
        if(!headDone){const probe=headTail+chunkText;if(/<\/head\s*>/i.test(probe)||bytes>=headMax)emitHead(bytes>=headMax);headTail=probe.slice(-64)}
        if(!mediaDone){const probe=mediaTail+chunkText;if(bytes>=mediaMin&&streamMediaMarkerMatched(probe,mediaPattern))emitMedia(false,true);else if(bytes>=mediaMax)emitMedia(true,false);mediaTail=probe.slice(-8192)}
        if(!prefixDone&&bytes>=prefixMax)emitPrefix(true,true);
        if(stopRequested){try{await reader.cancel()}catch{}break}
      }
      if(!headDone)emitHead(!!stopRequested);if(!mediaDone)emitMedia(!!stopRequested,false);if(!prefixDone)emitPrefix(!!stopRequested,false);
      return {url,status,headers,text:Buffer.concat(chunks).toString('utf8'),bytesRead:bytes,complete:!stopRequested,abortedAfterMedia:stopReason==='media',abortedAfterPrefix:stopReason==='prefix',transport:'chromium-session-fetch'};
    } finally {clearTimeout(timer)}
  })().then(value=>{if(!bypass&&ttl>0)rememberChromiumText(cacheKey,value);if(chromiumProgressiveInflight.get(cacheKey)===flow)chromiumProgressiveInflight.delete(cacheKey);resolveFull(value)},err=>{if(chromiumProgressiveInflight.get(cacheKey)===flow)chromiumProgressiveInflight.delete(cacheKey);if(!headDone)rejectHead(err);if(!mediaDone)rejectMedia(err);if(!prefixDone)rejectPrefix(err);rejectFull(err)});
  return flow;
}

async function extractLivePageMediaQuick(url, script, { timeoutMs=3300, foreground=false } = {}) {
  const view=await acquireMediaView({foreground}),wc=view.webContents;
  const started=Date.now(),limit=Math.max(700,Number(timeoutMs)||3300);
  let timer=null,onReady=null,onFail=null;
  try {
    const ready=new Promise((resolve,reject)=>{
      onReady=()=>resolve(true);
      onFail=(_event,code,description,_validatedURL,isMainFrame)=>{if(isMainFrame!==false)reject(new Error(`Live DOM hedge failed ${code}: ${description||'navigation error'}`))};
      wc.once('dom-ready',onReady);wc.on('did-fail-load',onFail);
      timer=setTimeout(()=>reject(new Error('Live DOM hedge timed out')),limit);
    });
    // Do not await loadURL: dom-ready is deliberately the gate. Waiting for load would
    // serialize first imagery behind remote fonts, analytics, ads and image subresources.
    wc.loadURL(url).catch(()=>{});
    await ready;
    if(timer){clearTimeout(timer);timer=null;}
    const remaining=Math.max(250,limit-(Date.now()-started));
    const guardedScript=`(async()=>{try{return {ok:true,value:await (${script})}}catch(error){return {ok:false,error:String(error?.stack||error)}}})()`;
    try{new vm.Script(guardedScript,{filename:'enderloom-live-dom-extraction.js'})}catch(error){throw new Error(`Live DOM extraction script is invalid: ${error.stack||error}`)}
    const guarded=await Promise.race([
      wc.executeJavaScript(guardedScript,true),
      new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Live DOM extraction timed out')),remaining)}),
    ]);
    if(!guarded?.ok)throw new Error(`Live DOM extraction failed: ${guarded?.error||'unknown renderer error'}`);
    const result=guarded.value;
    try{wc.stop()}catch{}
    return result;
  } finally {
    if(timer)clearTimeout(timer);if(onReady)wc.removeListener('dom-ready',onReady);if(onFail)wc.removeListener('did-fail-load',onFail);
    releaseMediaView(view);
  }
}


async function extractCurseForgeGalleryDomQuick(url, context={}, { timeoutMs=5200, foreground=false } = {}) {
  const target=safeHttpUrl(url);if(!target)return null;const targetProvider=providerForUrl(target),contextProvider=providerForUrl(context?.primaryUrl||'');if((targetProvider!=='curseforge'&&!(testMode&&contextProvider==='curseforge'))||!/\/gallery\/?$/i.test(new URL(target).pathname))return null;
  const waitMs=Math.max(900,Math.min(4600,Number(timeoutMs)||5200)-450);
  const script=String.raw`(async()=>{const deadline=Date.now()+${waitMs};let last=-1,stable=0;while(Date.now()<deadline){const body=document.body?.innerText||'';if(/this\s+mod\s+has\s+no\s+gallery\s+items\s+available/i.test(body))break;const expected=Number((body.match(/Gallery\s*\((\d+)\)/i)||[])[1]||0);const anchors=[...document.querySelectorAll('a[href]')].filter(a=>{try{const u=new URL(a.href,location.href);return /(?:^|\.)(?:forgecdn|cursecdn)\.net$/i.test(u.hostname)&&/^\/attachments\/(?:thumbnails\/)?\d+\/\d+\//i.test(u.pathname)}catch{return false}});const count=anchors.length;if(expected>0&&count>=expected)break;if(count>0&&count===last){stable++;if(stable>=3)break}else stable=0;last=count;await new Promise(r=>setTimeout(r,90));}window.__MCC_MEDIA_CONTEXT=${JSON.stringify(mediaContext(context))};return ${PROJECT_MEDIA_EXTRACT_SCRIPT};})()`;
  return extractLivePageMediaQuick(target,script,{timeoutMs:Math.max(1200,Number(timeoutMs)||5200),foreground});
}

async function extractCurseForgeGalleryHtmlFull(url, context={}, { timeoutMs=7200, bypassCache=false } = {}) {
  const target=safeHttpUrl(url);if(!target)return null;
  const targetProvider=providerForUrl(target),contextProvider=providerForUrl(context?.primaryUrl||'');
  if((targetProvider!=='curseforge'&&!(testMode&&contextProvider==='curseforge'))||!/\/gallery\/?$/i.test(new URL(target).pathname))return null;
  const flow=chromiumProgressiveTextShared(target,{timeoutMs:Math.max(1800,Number(timeoutMs)||7200),cacheTtlMs:120000,bypassCache:!!bypassCache,stopAfterMedia:false,stopAfterPrefix:false,headMaxBytes:256*1024,mediaMaxBytes:512*1024,prefixMaxBytes:1024*1024,headers:{Accept:'text/html,application/xhtml+xml;q=0.9,*/*;q=0.2'}});
  const response=await flow.full;
  if(!response||response.status<200||response.status>=300)return null;
  const type=String(response.headers?.['content-type']||response.headers?.['Content-Type']||'');if(type&&!/html|xhtml/i.test(type))return null;
  const html=String(response.text||'');if(!html)return null;
  const cleanContext=mediaContext(context),canonicalGallery=curseForgeGalleryUrl(cleanContext.primaryUrl)||target;
  const parsed=parseGenericProjectHtml(html,canonicalGallery,cleanContext);
  if(!parsed)return null;
  parsed.transport='chromium-gallery-full-html';
  return parsed;
}

async function extractLivePageMedia(url, script, { scroll=true, timeoutMs=18000, foreground=false } = {}) {
  const view=await acquireMediaView({foreground});
  try {
    const loadPromise=view.webContents.loadURL(url);
    await Promise.race([loadPromise,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Live media discovery timed out')),timeoutMs))]);
    if (scroll) {
      try { await view.webContents.executeJavaScript(`(async()=>{let last=-1,stable=0;for(let i=0;i<14;i++){const h=Math.max(document.body?.scrollHeight||0,document.documentElement?.scrollHeight||0);window.scrollTo(0,h);await new Promise(r=>setTimeout(r,180));const next=Math.max(document.body?.scrollHeight||0,document.documentElement?.scrollHeight||0);if(next===last||next===h)stable++;else stable=0;last=next;if(stable>=2)break}return true})()`, true); } catch {}
      await new Promise(r=>setTimeout(r,120));
    } else await new Promise(r=>setTimeout(r,80));
    return await view.webContents.executeJavaScript(script,true);
  } catch(err) {
    if(view?.webContents&&!view.webContents.isDestroyed()){try{view.webContents.stop()}catch{}}
    throw err;
  } finally { releaseMediaView(view); }
}

async function resolveProviderChildLive(url, context={}, timeoutMs=12000) {
  if(!isProviderCollectionUrl(url))return [];
  const script=`(()=>{window.__MCC_MEDIA_CONTEXT=${JSON.stringify(mediaContext(context))};return ${PROVIDER_LINK_RESOLVE_SCRIPT};})()`;
  try { const rows=await extractLivePageMedia(url,script,{scroll:true,timeoutMs});return Array.isArray(rows)?rows.map(x=>({...x,url:safeHttpUrl(x?.url)||''})).filter(x=>x.url):[]; } catch { return []; }
}

async function fetchJsonLive(url, timeoutMs=5500) {
  return publicRequestJsonShared(url,{timeoutMs,cacheTtlMs:60000,headers:{'Accept':'application/json'}});
}
async function discoverProviderApiSeed(rawUrl, context={}) {
  const desc=apiDescriptorForUrl(rawUrl);if(!desc)return null;
  try {
    const json=await fetchJsonLive(desc.apiUrl,2600);
    return apiSeedFromJson(desc,json,mediaContext(context));
  } catch { return null; }
}
function decodeHtmlAttr(value='') {
  return String(value).replace(/&amp;/gi,'&').replace(/&#39;/g,"'").replace(/&quot;/gi,'"').replace(/&#x2F;/gi,'/');
}
function htmlMetaValue(html, key) {
  const escaped=String(key).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const patterns=[
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`,'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`,'i')
  ];
  for(const re of patterns){const m=re.exec(html);if(m?.[1])return decodeHtmlAttr(m[1])}
  return '';
}
function mediaContext(raw={}) {
  return {
    projectId:String(raw?.projectId||'').slice(0,200),
    title:String(raw?.title||'').slice(0,300),
    author:String(raw?.author||'').slice(0,200),
    authorUrl:safeHttpUrl(raw?.authorUrl)||'',
    primaryUrl:safeHttpUrl(raw?.primaryUrl)||''
  };
}
async function discoverProviderAuthor(authorUrl, context={}, timeoutMs=4200, bypassCache=false) {
  const target=safeHttpUrl(authorUrl);if(!target)return null;
  const key=`${target}|${String(context.author||'').trim().toLowerCase()}`;const cached=authorMediaCache.get(key);if(!bypassCache&&cached)return cached instanceof Promise?cached:cached.value;
  const promise=(async()=>{try{
    const response=await publicRequestTextShared(target,{timeoutMs,cacheTtlMs:120000,bypassCache,headers:{Accept:'text/html,application/xhtml+xml;q=0.9,*/*;q=0.2'}});
    if(response.status<200||response.status>=300)return null;
    const provider=providerForUrl(response.url||target);
    return provider==='planetminecraft' ? parsePlanetMinecraftAuthorHtml(response.text||'',response.url||target,context) : parseProviderAuthorHtml(response.text||'',response.url||target,context);
  }catch{return null}})();
  authorMediaCache.set(key,promise);const value=await promise;authorMediaCache.set(key,{value,at:Date.now()});return value;
}
function parseProviderProjectHtml(html, resolved, context={}) {
  const provider=providerForUrl(resolved);
  return provider==='planetminecraft' ? parsePlanetMinecraftHtml(html,resolved,context) : parseGenericProjectHtml(html,resolved,context);
}
async function mapLimit(items, limit, worker) {
  const out=new Array(items.length);let cursor=0;
  const runners=Array.from({length:Math.min(Math.max(1,limit),items.length)},async()=>{while(true){const i=cursor++;if(i>=items.length)return;out[i]=await worker(items[i],i)}});
  await Promise.all(runners);return out;
}
async function resolveExactProviderProject(html, resolved, originalUrl, context={}, timeoutMs=4200, bypassCache=false) {
  const candidates=resolveProviderProjectLinks(html,resolved,context);
  if(!candidates.length)return null;
  const attempt=async candidate=>{try{
    const response=await publicRequestTextShared(candidate.url,{timeoutMs,cacheTtlMs:120000,bypassCache,headers:{Accept:'text/html,application/xhtml+xml;q=0.9,*/*;q=0.2'}});
    if(response.status<200||response.status>=300)return null;
    const type=String(response.headers['content-type']||'');if(type&&!/html|xhtml/i.test(type))return null;
    const body=response.text||'';
    const exactUrl=response.url||candidate.url,parsed=parseProviderProjectHtml(body,exactUrl,context);
    if(!parsed||parsed.needsProjectResolution)return null;
    const galleryCount=(parsed.gallery||parsed.images||[]).length,identity=Number(parsed.identity)||0;
    if(!galleryCount&&!parsed.icon)return null;
    return {...parsed,sourceUrl:originalUrl,resolvedProjectUrl:exactUrl,resolutionConfidence:candidate.confidence,provider:providerForUrl(exactUrl),exclusive:true,_resolutionScore:(candidate.confidence*2)+identity+(galleryCount?20:0)};
  }catch{return null}};
  // Try the strongest exact identity match first; preserve every fallback, but only fan
  // out when that candidate fails validation instead of downloading sibling projects.
  const first=await attempt(candidates[0]);
  if(first && (Number(candidates[0]?.confidence)||0)>=90 && (Number(first.identity)||0)>=55)return first;
  const attempts=first?[first]:[];
  if(candidates.length>1)attempts.push(...(await mapLimit(candidates.slice(1),4,attempt)).filter(Boolean));
  return attempts.sort((a,b)=>(b._resolutionScore||0)-(a._resolutionScore||0))[0]||null;
}

async function fetchAndParseProviderHtml(transportUrl, sourceUrl, context={}, timeoutMs=4200, bypassCache=false) {
  const response=await publicRequestTextShared(transportUrl,{timeoutMs,cacheTtlMs:120000,bypassCache,headers:{Accept:'text/html,application/xhtml+xml;q=0.9,*/*;q=0.2'}});
  if(response.status<200||response.status>=300)throw new Error(`HTTP ${response.status} for ${response.url||transportUrl}`);
  const type=String(response.headers['content-type']||'');if(type&&!/html|xhtml/i.test(type))return null;
  const html=response.text||'',resolved=response.url||transportUrl;
  let result=parseProviderProjectHtml(html,resolved,context);
  const candidates=result?.resolvedCandidates?.length?result.resolvedCandidates:resolveProviderProjectLinks(html,resolved,context);
  if((result?.needsProjectResolution||isProviderCollectionUrl(resolved))&&candidates.length){
    const exact=await resolveExactProviderProject(html,resolved,sourceUrl,context,timeoutMs,bypassCache);if(exact)result=exact;
  }
  // Author-profile discovery is deliberately NOT on the first-image critical path.
  // The exact author URL is preserved now; visible-card rich/deep enrichment resolves
  // the avatar later without delaying the hero/icon paint.
  const out={...(result||{}),_transportUrl:resolved};delete out.resolvedCandidates;delete out.needsProjectResolution;delete out._resolutionScore;
  return out;
}

async function discoverFastHtmlMedia(url, context={}, timeoutMs=4200, bypassCache=false) {
  const provider=providerForUrl(url);
  let parsed=null,transport='node-core-http';
  if(provider==='curseforge'){
    const legacy=curseForgeLegacyUrl(url);
    const primary=fetchAndParseProviderHtml(url,url,context,timeoutMs,bypassCache);
    const legacyTask=legacy?new Promise(r=>setTimeout(r,140)).then(()=>fetchAndParseProviderHtml(legacy,url,context,timeoutMs,bypassCache)):null;
    const useful=promise=>promise.then(value=>{if((value?.gallery||value?.images||[]).length||value?.icon||value?.author)return value;throw new Error('No useful CurseForge media in response')});
    try{parsed=await Promise.any([useful(primary),...(legacyTask?[useful(legacyTask)]:[])]);transport=String(parsed?._transportUrl||'').includes('legacy.curseforge.com')?'node-core-http-legacy-hedge':'node-core-http';}
    catch{try{parsed=await primary}catch{if(legacyTask)parsed=await legacyTask;else throw new Error('CurseForge HTML discovery failed')}}
  } else parsed=await fetchAndParseProviderHtml(url,url,context,timeoutMs,bypassCache);
  const out={...(parsed||{})};delete out._transportUrl;
  return { ...out, sourceUrl:url, discoveredAt:new Date().toISOString(), cachedAt:Date.now(), liveOnly:true, fast:true, transport };
}

function canonicalUrlSafe(raw='') { try { const u=new URL(raw);u.hash='';u.search='';return u.toString().replace(/\/$/,''); } catch { return String(raw||'').replace(/\/$/,''); } }

function discoverGithubSeedMedia(url, context={}) {
  let u;try{u=new URL(url)}catch{return null}
  if(!/(^|\.)github\.com$/i.test(u.hostname))return null;
  const parts=u.pathname.split('/').filter(Boolean);if(parts.length<2)return null;
  const owner=parts[0],repo=parts[1].replace(/\.git$/i,'');
  if(!owner||!repo||['issues','pull','releases','actions','wiki'].includes(repo.toLowerCase()))return null;
  const identity=pageIdentityConfidence({expectedTitle:context.title||'',actualTitle:repo.replace(/[-_]+/g,' '),sourceUrl:url});
  if(context.title&&identity<35)return null;
  const projectUrl=`https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const preview=`https://opengraph.githubassets.com/mcc-live/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const authorUrl=`https://github.com/${encodeURIComponent(owner)}`;
  const gallery=[sanitizeMediaItem({url:preview,alt:`${owner}/${repo} live GitHub repository preview`,source:'github-live-opengraph',provider:'github',confidence:94,identity},'gallery')].filter(Boolean);
  const author=sanitizeMediaItem({url:`https://github.com/${encodeURIComponent(owner)}.png?size=160`,alt:`${owner} GitHub avatar`,source:'github-owner-avatar',provider:'github',confidence:100,identity:100},'author');
  return {sourceUrl:url,resolvedProjectUrl:projectUrl,title:repo,gallery,images:gallery,icon:null,author,authorUrl,provider:'github',identity,exclusive:false,discoveredAt:new Date().toISOString(),cachedAt:Date.now(),error:'',liveOnly:true,seed:true};
}

function cachedModrinthProject(slug='') {
  const key=String(slug||'').toLowerCase(),entry=modrinthProjectCache.get(key);if(!entry)return null;
  if(Date.now()-Number(entry.at||0)>MODRINTH_PROJECT_CACHE_MS){modrinthProjectCache.delete(key);return null}
  return entry.promise||Promise.resolve(entry.value||null);
}
function rememberModrinthProject(keys, promise) {
  const at=Date.now();for(const raw of keys){const key=String(raw||'').toLowerCase();if(key)modrinthProjectCache.set(key,{at,promise});}
  promise.then(project=>{if(!project)return;const value={at:Date.now(),value:project};for(const raw of [project.id,project.slug,...keys]){const key=String(raw||'').toLowerCase();if(key)modrinthProjectCache.set(key,value)}}).catch(()=>{for(const raw of keys){const key=String(raw||'').toLowerCase();const entry=modrinthProjectCache.get(key);if(entry?.promise===promise)modrinthProjectCache.delete(key)}});
  return promise;
}
async function getModrinthProject(slug='') {
  const existing=cachedModrinthProject(slug);if(existing)return existing;
  const promise=fetchJsonLive(`https://api.modrinth.com/v2/project/${encodeURIComponent(slug)}`);
  return rememberModrinthProject([slug],promise);
}
function warmModrinthProjectBatches(requests=[]) {
  const slugs=[];
  for(const req of Array.isArray(requests)?requests:[])for(const rawUrl of Array.isArray(req?.urls)?req.urls:[]){const slug=modrinthSlugFromUrl(rawUrl);if(slug&&!cachedModrinthProject(slug))slugs.push(slug)}
  for(const chunk of chunkSlugsByUrlLength(slugs)){
    const batchPromise=fetchJsonLive(`https://api.modrinth.com/v2/projects?ids=${encodeURIComponent(JSON.stringify(chunk))}`).then(rows=>indexProjects(rows));
    for(const slug of chunk){
      const projectPromise=batchPromise.then(index=>index.get(String(slug).toLowerCase())||null);
      rememberModrinthProject([slug],projectPromise);
    }
  }
}

async function discoverModrinthMedia(url, context={}, includeAuthor=false) {
  let u;try{u=new URL(url)}catch{return null} if(!/(^|\.)modrinth\.com$/i.test(u.hostname))return null;
  const parts=u.pathname.split('/').filter(Boolean); if(parts.length<2||!['mod','plugin','datapack','shader','resourcepack','modpack'].includes(parts[0]))return null;
  const slug=parts[1]; const project=await getModrinthProject(slug);if(!project)return null;
  const identity=pageIdentityConfidence({expectedTitle:context.title||'',actualTitle:project?.title||'',sourceUrl:url});if(context.title&&identity<48)return null;
  const gallery=(Array.isArray(project?.gallery)?project.gallery:[]).map(x=>sanitizeMediaItem({url:x?.url,alt:x?.title||x?.description||project?.title||slug,width:0,height:0,source:'modrinth-api',provider:'modrinth',confidence:100,identity},'gallery')).filter(Boolean);
  const icon=sanitizeMediaItem({url:project?.icon_url,alt:`${project?.title||slug} project icon`,source:'modrinth-api',provider:'modrinth',confidence:100,identity},'icon');
  let author=null,authorUrl='';
  if(includeAuthor&&project?.team){try{const team=await fetchJsonLive(`https://api.modrinth.com/v2/team/${encodeURIComponent(project.team)}`);const members=Array.isArray(team)?team:[];const owner=members.find(x=>String(x?.role||'').toLowerCase()==='owner')||members.find(x=>x?.accepted!==false)||members[0];const user=owner?.user;if(user?.username)authorUrl=`https://modrinth.com/user/${encodeURIComponent(user.username)}`;author=sanitizeMediaItem({url:user?.avatar_url,alt:user?.username?`${user.username} profile avatar`:'Modrinth creator avatar',source:'modrinth-api',provider:'modrinth',confidence:100,identity},'author')}catch{}}
  return {sourceUrl:url,title:String(project?.title||''),gallery,images:gallery,icon,author,authorUrl,provider:'modrinth',identity,exclusive:true,discoveredAt:new Date().toISOString(),cachedAt:Date.now(),error:'',liveOnly:true};
}
function mergeDiscoveredMedia(target, extra) {
  if(!target||!extra)return target; const seen=new Set((target.gallery||[]).map(x=>x.url));
  for(const raw of extra.gallery||extra.images||[]){if(raw&&typeof raw==='object'&&raw.role&&raw.role!=='gallery')continue;const item=sanitizeMediaItem(raw,'gallery');if(item&&!seen.has(item.url)){seen.add(item.url);target.gallery.push(item)}}
  target.gallery.sort((a,b)=>(b.confidence||0)-(a.confidence||0)||(b.identity||0)-(a.identity||0));
  const icon=extra.icon&&(!extra.icon.role||extra.icon.role==='icon')?sanitizeMediaItem(extra.icon,'icon'):null, author=extra.author&&(!extra.author.role||extra.author.role==='author')?sanitizeMediaItem(extra.author,'author'):null;
  if(icon&&(!target.icon||(icon.confidence||0)>(target.icon.confidence||0)))target.icon=icon;
  if(author&&(!target.author||(author.confidence||0)>(target.author.confidence||0)))target.author=author;
  // Cross-transport role quarantine. Strict parsers should already be clean, but merging a
  // fast generic seed with a later exact provider result must never leave the same asset in
  // gallery/icon/author simultaneously.
  if(target.icon&&target.author&&target.icon.url===target.author.url){const aExact=/(?:author|profile|creator|member)/i.test(`${target.author.source||''} ${target.author.alt||''}`),iExact=/(?:project|icon|logo)/i.test(`${target.icon.source||''} ${target.icon.alt||''}`);if(aExact&&!iExact)target.icon=null;else if(iExact&&!aExact)target.author=null;else if((target.author.confidence||0)>(target.icon.confidence||0))target.icon=null;else target.author=null;}
  const reserved=new Set([target.icon?.url,target.author?.url].filter(Boolean));target.gallery=(target.gallery||[]).filter(x=>!reserved.has(x.url));
  if(!target.authorUrl)target.authorUrl=safeHttpUrl(extra.authorUrl)||''; if(!target.title)target.title=String(extra.title||'');
  if((Number(extra.identity)||0)>(Number(target.identity)||0))target.identity=Number(extra.identity)||0;if(extra.provider)target.provider=String(extra.provider);if(extra.exclusive)target.exclusive=true;
  const resolvedProjectUrl=safeHttpUrl(extra.resolvedProjectUrl);
  if(resolvedProjectUrl)target.resolvedProjectUrl=resolvedProjectUrl;
  if((Number(extra.resolutionConfidence)||0)>(Number(target.resolutionConfidence)||0))target.resolutionConfidence=Number(extra.resolutionConfidence)||0;
  // A provider-specific empty gallery route is evidence about that route only. It must
  // not suppress a canonical project/Description lane (DivineRPG is a real example).
  // Conversely, any real project-owned gallery media is stronger evidence than an older
  // negative and clears both terminal and source-scoped negative state.
  if(extra.sourceGalleryAbsent===true&&!target.gallery.length)target.sourceGalleryAbsent=true;
  if(extra.galleryAbsent===true&&!target.gallery.length)target.galleryAbsent=true;
  if(target.gallery.length){target.galleryAbsent=false;target.sourceGalleryAbsent=false;}
  target.images=target.gallery; return target;
}

async function discoverProjectMedia(rawUrl, { force=false, deep=false, context={} } = {}) {
  const url = safeHttpUrl(rawUrl);
  if (!url) return { sourceUrl:'', images:[], gallery:[], icon:null, author:null, authorUrl:'', error:'Invalid URL', liveOnly:true };
  context=mediaContext(context);const contextKey=contextFingerprint(context);const provider=providerForUrl(url);
  const cached = cachedProjectMedia(url,MEDIA_CACHE_MAX_MS,context);
  const cacheIsRich = !!(cached && cached.icon && (cached.author||!context.author) && (cached.gallery?.length >= 2 || cached.galleryAbsent));
  if (!force && cached && (!deep || (!cached.stale && cacheIsRich))) return cached;
  const cacheKey=`${url}|${contextKey}|${deep?'deep':'quick'}|${force?'force':'normal'}`;
  const inMemory = galleryCache.get(cacheKey);
  if (inMemory?.promise) return inMemory.promise;
  const promise = (async () => {
    const result = { sourceUrl:url, title:'', images:[], gallery:[], icon:null, author:null, authorUrl:'', provider, identity:0, contextKey, discoveredAt:new Date().toISOString(), cachedAt:Date.now(), error:'', liveOnly:true };
    if(cached)mergeDiscoveredMedia(result,cached);
    try {
      // Fast path first: provider APIs + live HTML metadata run in parallel and are
      // enough to paint most cards without spinning up an offscreen Chromium page.
      const contextScript=`(()=>{window.__MCC_MEDIA_CONTEXT=${JSON.stringify(context)};return ${PROJECT_MEDIA_EXTRACT_SCRIPT};})()`;
      // Hedged browser discovery: providers known to protect/delay their public HTML get
      // a Chromium attempt at the same time as the lightweight HTTP parser, but only
      // for deep/foreground discovery. This removes the old 4-5s HTTP-timeout tax.
      const hedgedDeep=((deep||force)&&!isProviderCollectionUrl(url)&&HEDGED_DEEP_PROVIDERS.has(provider))
        ? extractLivePageMedia(url,contextScript,{scroll:true,timeoutMs:11000,foreground:!!force}).catch(()=>null) : null;
      const seedMedia=provider==='github'?discoverGithubSeedMedia(url,context):null;
      if(seedMedia)mergeDiscoveredMedia(result,seedMedia);
      const providerTask=provider==='modrinth'?discoverModrinthMedia(url,context,deep||force).catch(()=>null):Promise.resolve(null);
      // GitHub has a deterministic, exact live repository preview + owner avatar. Paint
      // that immediately on quick discovery, then let deep discovery enrich it from DOM.
      // This avoids holding the card behind a full github.com HTML round trip.
      const htmlTask=(provider==='builtbybit'||provider==='modrinth'||(provider==='github'&&!deep&&!force&&seedMedia))?Promise.resolve(null):discoverFastHtmlMedia(url,context,4200,force).catch(()=>null);
      const [providerMedia,fastHtml]=await Promise.all([providerTask,htmlTask]);
      if(providerMedia)mergeDiscoveredMedia(result,providerMedia);
      if(fastHtml)mergeDiscoveredMedia(result,fastHtml);

      if((deep || force) && !result.exclusive) {
        let deepUrl=safeHttpUrl(result.resolvedProjectUrl)||url;
        if(isProviderCollectionUrl(url)&&!result.resolvedProjectUrl){
          const liveCandidates=await resolveProviderChildLive(url,context,12000);
          if(liveCandidates.length){
            const exactCandidate=liveCandidates[0];
            // Once the provider index resolves an exact child, keep that identity even if
            // the fast HTTP pass is blocked. The Chromium fallback may then render the
            // exact child page, but it must never fall back to scraping the collection.
            result.resolvedProjectUrl=exactCandidate.url;
            result.resolutionConfidence=exactCandidate.confidence||0;
            deepUrl=exactCandidate.url;
            const exactFast=provider==='builtbybit'?null:await discoverFastHtmlMedia(exactCandidate.url,context,5200,force).catch(()=>null);
            if(exactFast){ exactFast.resolvedProjectUrl=exactCandidate.url;exactFast.resolutionConfidence=exactCandidate.confidence||0;exactFast.exclusive=true;mergeDiscoveredMedia(result,exactFast); }
          }
          if(!result.resolvedProjectUrl && !result.exclusive){
            result.error=result.error||'No exact child project could be resolved from this provider collection/profile page.';
          }
        }
        if(isProviderCollectionUrl(url)&&result.resolvedProjectUrl&&!result.exclusive){
          deepUrl=result.resolvedProjectUrl;
          const exactFast=provider==='builtbybit'?null:await discoverFastHtmlMedia(deepUrl,context,5200,force).catch(()=>null);
          if(exactFast){exactFast.resolvedProjectUrl=deepUrl;exactFast.resolutionConfidence=result.resolutionConfidence||90;mergeDiscoveredMedia(result,exactFast)}
        }
        if(!isProviderCollectionUrl(url) || result.resolvedProjectUrl || result.exclusive){
        const canUseHedge=!!hedgedDeep&&canonicalUrlSafe(deepUrl)===canonicalUrlSafe(url);
        const media = canUseHedge ? await hedgedDeep : await extractLivePageMedia(deepUrl, contextScript, { scroll:true, timeoutMs:11000,foreground:!!force });
        if(media)mergeDiscoveredMedia(result,{title:media?.title,gallery:media?.gallery,icon:media?.icon,author:media?.author,authorUrl:media?.authorUrl});
        let mediaPages=(Array.isArray(media?.mediaPageUrls)?media.mediaPageUrls:[]).map(safeHttpUrl).filter(Boolean).filter(x=>x!==url);
        if(provider==='curseforge'){const exactGallery=curseForgeGalleryUrl(deepUrl);if(exactGallery&&!mediaPages.some(x=>canonicalUrlSafe(x)===canonicalUrlSafe(exactGallery)))mediaPages=[exactGallery,...mediaPages]}
        const tasks=[];
        for(const mediaUrl of mediaPages){
          if(providerForUrl(mediaUrl)==='curseforge'&&/\/gallery\/?$/i.test(new URL(mediaUrl).pathname)){
            // The exact CurseForge gallery has a complete SSR representation even when
            // the hidden DOM lane is delayed/blocked. Race both paths and merge either;
            // never make DOM hydration the only way an uncapped gallery can arrive.
            tasks.push(extractCurseForgeGalleryHtmlFull(mediaUrl,context,{timeoutMs:7600,bypassCache:force}).then(page=>({kind:'media',page})).catch(()=>null));
            tasks.push(discoverFastHtmlMedia(mediaUrl,context,7600,force).then(page=>({kind:'media',page})).catch(()=>null));
            tasks.push(extractCurseForgeGalleryDomQuick(mediaUrl,context,{timeoutMs:6500,foreground:!!force}).then(page=>({kind:'media',page})).catch(()=>null));
          }else{
            tasks.push(extractLivePageMedia(mediaUrl,contextScript,{scroll:true,timeoutMs:9000,foreground:!!force}).then(page=>({kind:'media',page})).catch(()=>null));
          }
        }
        if (result.authorUrl && result.authorUrl !== url && (!result.author || result.author.url === result.icon?.url)) {
          tasks.push(extractLivePageMedia(result.authorUrl,`(()=>{window.__MCC_MEDIA_CONTEXT=${JSON.stringify(context)};return ${AUTHOR_MEDIA_EXTRACT_SCRIPT};})()`, { scroll:false, timeoutMs:8000, foreground:!!force }).then(page=>({kind:'author',page})).catch(()=>null));
        }
        for(const extra of (await Promise.all(tasks)).filter(Boolean)){
          if(extra.kind==='author'){const profileImage=sanitizeMediaItem(extra.page,'author');if(profileImage)result.author=profileImage}
          else mergeDiscoveredMedia(result,{gallery:extra.page?.gallery,icon:extra.page?.icon});
        }
        }
      }
      result.images = result.gallery;
      result.contextKey=contextKey;result.provider=result.provider||provider;
      result.cachedAt=Date.now(); result.discoveredAt=new Date().toISOString();
      if (!result.gallery.length && !result.icon) result.error = 'No live project imagery was exposed by the source page.';
    } catch (err) { result.error=String(err?.message||err); }
    const clean=sanitizeMediaRecord(result,url);
    if (clean && (clean.gallery.length || clean.icon || clean.author)) {
      mediaCache.set(mediaStorageKey(url,contextKey),clean); saveMediaCacheSoon(); return clean;
    }
    if (cached) return { ...cached, stale:true, error:result.error || cached.error || 'Live refresh failed; showing cached source URLs.' };
    return clean || result;
  })();
  galleryCache.set(cacheKey,{promise});
  try { return await promise; } finally { galleryCache.delete(cacheKey); }
}

async function discoverGallery(rawUrl, options={}) {
  const media = await discoverProjectMedia(rawUrl, { ...options, deep:true });
  return { sourceUrl:media.sourceUrl, images:media.gallery||media.images||[], discoveredAt:media.discoveredAt, error:media.error||'', cacheHit:!!media.cacheHit };
}

function mediaPrimeJobId(sender, key) { return `${sender?.id||0}:${String(key||'')}`; }
function sendPrimeResult(sender, payload) {
  try { if(sender&&!sender.isDestroyed())sender.send('catalog:media-result',payload); } catch {}
}
function mediaPrimeUrlScore(raw='') {
  try {
    const u=new URL(raw),h=u.hostname.toLowerCase(),p=u.pathname.replace(/\/+$/,'');let score=100;
    // Exact, deterministic sources belong on the first-image frontier. This score only
    // changes execution order; it never drops a source or caps gallery results.
    if(/(?:^|\.)github\.com$/.test(h))score+=100;
    else if(/(?:^|\.)modrinth\.com$/.test(h))score+=95;
    else if(h==='hangar.papermc.io')score+=92;
    else if(h==='gitlab.com')score+=90;
    else if(/(?:^|\.)spigotmc\.org$/.test(h))score+=88;
    else if(/(?:^|\.)curseforge\.com$/.test(h))score+=60;
    else if(/(?:^|\.)planetminecraft\.com$/.test(h))score+=52;
    else if(/(?:^|\.)dev\.bukkit\.org$/.test(h))score+=52;
    else if(/(?:^|\.)mcpedl\.com$/.test(h)||/(?:^|\.)modbay\.org$/.test(h)||/(?:^|\.)moddb\.com$/.test(h))score+=50;
    else if(/(?:^|\.)patreon\.com$/.test(h)||/(?:^|\.)nexusmods\.com$/.test(h))score+=48;
    else if(/(?:^|\.)afdian\.com$/.test(h))score+=46;
    else if(/(?:^|\.)minecraft\.net$/.test(h)&&/\/marketplace/i.test(p))score+=46;
    else if(/(?:^|\.)builtbybit\.com$/.test(h))score+=46;
    else if(/(?:^|\.)(?:booth\.pm|fourthwall\.(?:com|dev)|ko-fi\.com|polymart\.org)$/.test(h))score+=44;
    else if(/(?:^|\.)itch\.io$/.test(h)||/(?:^|\.)gumroad\.com$/.test(h))score+=42;
    if(isProviderCollectionUrl(raw))score-=36;
    if(/\/(?:files|download|relations|dependencies|changelog|issues|releases|wiki)(?:\/|$)/i.test(p))score-=72;
    return score;
  } catch { return 0; }
}
function orderMediaPrimeUrls(urls=[]) {
  return [...urls].sort((a,b)=>mediaPrimeUrlScore(b)-mediaPrimeUrlScore(a));
}
function enqueueMediaPrime(sender, raw={}, deferPump=false) {
  if(!sender||sender.isDestroyed())return;
  const key=String(raw?.key||'').slice(0,300);if(!key)return;
  const urls=orderMediaPrimeUrls([...new Set((Array.isArray(raw?.urls)?raw.urls:[]).map(safeHttpUrl).filter(Boolean))]);if(!urls.length)return;
  const context=mediaContext(raw?.context||{}),priority=Number(raw?.priority)||0;
  const id=mediaPrimeJobId(sender,key),existing=mediaPrimeJobs.get(id);
  if(existing){existing.priority=Math.max(existing.priority,priority);existing.urls=orderMediaPrimeUrls([...new Set([...urls,...existing.urls])]);return;}
  const job={id,key,urls,context,priority,sender,queuedAt:Date.now(),active:false};mediaPrimeJobs.set(id,job);mediaPrimeQueue.push(job);if(!deferPump)pumpMediaPrime();
}
function nextMediaPrimeJob() {
  if(!mediaPrimeQueue.length)return null;
  // Visible/near-visible jobs win, then FIFO within the same priority. Sorting only the
  // pending metadata queue is cheap and avoids provider-specific starvation.
  mediaPrimeQueue.sort((a,b)=>b.priority-a.priority||a.queuedAt-b.queuedAt);
  return mediaPrimeQueue.shift()||null;
}
function primeMediaCandidate(raw, url, context, transport='live', stage='fast') {
  if(!raw||!startRaceHasUsefulState(raw))return null;
  const contextKey=contextFingerprint(mediaContext(context));
  const candidate={...raw,sourceUrl:safeHttpUrl(raw.sourceUrl)||url,contextKey,discoveredAt:new Date().toISOString(),cachedAt:Date.now(),liveOnly:true,fast:true,transport,stage};
  const existing=cachedProjectMedia(url,MEDIA_CACHE_MAX_MS,context);
  const merged={sourceUrl:url,title:'',gallery:[],images:[],icon:null,author:null,authorUrl:'',provider:providerForUrl(url),identity:0,contextKey,discoveredAt:candidate.discoveredAt,cachedAt:Date.now(),liveOnly:true};
  if(existing)mergeDiscoveredMedia(merged,existing);mergeDiscoveredMedia(merged,candidate);
  const clean=sanitizeMediaRecord(merged,url);
  if(clean&&startRaceHasUsefulState(clean)){mediaCache.set(mediaStorageKey(url,contextKey),clean);saveMediaCacheSoon()}
  return candidate;
}
function trustedGalleryStreamSeed(response,url,context,transport) {
  const responseUrl=safeHttpUrl(response?.url)||'';
  if(!responseUrl||!response?.text)return null;
  const owned=parseCurseForgeGalleryStreamSeed(response.text,responseUrl,context||{});
  if(!owned||!startRaceHasMedia(owned))return null;
  return primeMediaCandidate({...owned,sourceUrl:url,resolvedProjectUrl:responseUrl.replace(/\/gallery\/?$/i,''),resolutionConfidence:100,indexSeed:false},url,context,transport,'stream-owned-seed');
}
function parsePrimeHtmlResponse(response, url, context, stage='head', transport='live-http') {
  if(!response||response.status<200||response.status>=300)return null;
  const type=String(response.headers?.['content-type']||response.headers?.['Content-Type']||'');if(type&&!/html|xhtml/i.test(type))return null;
  const html=String(response.text||'');if(!html)return null;
  let parsed=stage==='head'?parseProviderHeadMedia(html,response.url||url,context):parseGenericProjectHtml(html,response.url||url,context);
  if(!parsed||parsed.needsProjectResolution||!startRaceHasUsefulState(parsed))return null;
  return primeMediaCandidate(parsed,url,context,transport,stage);
}
async function parseFullPrimeHtmlResponse(response, url, context, transport='live-http') {
  if(!response||response.status<200||response.status>=300)return null;
  const type=String(response.headers?.['content-type']||response.headers?.['Content-Type']||'');if(type&&!/html|xhtml/i.test(type))return null;
  const html=String(response.text||'');if(!html)return null;
  let parsed;
  if(providerParserPool?.shouldOffload(html)) parsed=await providerParserPool.parse({mode:'full',html,url:response.url||url,context});
  else parsed=parseGenericProjectHtml(html,response.url||url,context);
  if(!parsed||parsed.needsProjectResolution||!startRaceHasUsefulState(parsed))return null;
  return primeMediaCandidate(parsed,url,context,transport,'full');
}
function independentAuthorKey(authorUrl, context={}) {
  return `${safeHttpUrl(authorUrl)||''}|${String(context.author||'').trim().toLowerCase()}`;
}
function discoverIndependentAuthor(authorUrl, context={}, priority=0) {
  const target=safeHttpUrl(authorUrl);if(!target)return Promise.resolve(null);
  const key=independentAuthorKey(target,context),existing=independentAuthorInflight.get(key);if(existing)return existing;
  const provider=providerForUrl(target),policy=transportPolicy(provider);
  const promise=(async()=>{
    preconnectMediaOrigins([target,...providerOriginHints(provider)]);
    const lanes=[];
    lanes.push(Promise.resolve(discoverProviderAuthor(target,context,4200,false)).then(x=>x||Promise.reject(new Error('no-node-author'))));
    // Author discovery has its own lane and starts only after the project has already
    // produced a useful media state. It therefore cannot hold up the gallery/icon paint.
    // Visible cards and session-heavy sites also use the real Chromium profile DOM in
    // parallel, while duplicate author URLs collapse through this shared promise.
    if(policy.dom||Number(priority)>=250000){
      const script=`(()=>{window.__MCC_MEDIA_CONTEXT=${JSON.stringify(context)};return ${AUTHOR_MEDIA_EXTRACT_SCRIPT};})()`;
      lanes.push(extractLivePageMediaQuick(target,script,{timeoutMs:3200}).then(x=>x||Promise.reject(new Error('no-dom-author'))));
    }
    try{return await Promise.any(lanes)}catch{return null}
  })().finally(()=>setTimeout(()=>{if(independentAuthorInflight.get(key)===promise)independentAuthorInflight.delete(key)},180000));
  independentAuthorInflight.set(key,promise);return promise;
}
function scheduleIndependentAuthorPrime(job,state,sourceUrl,candidate) {
  const authorUrl=safeHttpUrl(candidate?.authorUrl)||safeHttpUrl(job.context?.authorUrl)||'';
  if(!authorUrl||candidate?.author||job.sender.isDestroyed())return;
  queueMicrotask(()=>{
    discoverIndependentAuthor(authorUrl,job.context,job.priority).then(author=>{
      if(!author||job.sender.isDestroyed())return;
      deliverPrimeCandidate(job,state,sourceUrl,{sourceUrl,title:candidate?.title||job.context?.title||'',gallery:[],images:[],icon:null,author,authorUrl,provider:providerForUrl(sourceUrl),identity:Number(candidate?.identity)||80,exclusive:false},'author-parallel-independent','author-parallel-independent');
    }).catch(()=>{});
  });
}
function deliverPrimeCandidate(job, state, url, media, phase, transport='') {
  const candidate=primeMediaCandidate(media,url,job.context,transport||media?.transport||'live',phase);
  if(!candidate)return false;
  // As soon as SSR discovery exposes a real CDN image, warm that CDN while the IPC
  // payload is crossing to the renderer. This overlaps image DNS/TLS with card update.
  const hotMedia=[candidate.icon,candidate.author,...(candidate.gallery||[]).slice(0,4),...(candidate.images||[]).slice(0,2)].filter(Boolean).flatMap(x=>[x.previewUrl,x.url]).filter(Boolean);
  preconnectMediaOrigins(hotMedia);
  // Visible/near-visible cards begin the actual preview-byte fetch before IPC paint.
  // The catalog shares this same Chromium session, so its <img> load can coalesce with
  // or hit the warmed HTTP cache instead of opening a second connection.
  warmDiscoveredImages(candidate,job.priority);
  if(startRaceHasMedia(candidate)) state.delivered=true;
  if((candidate.gallery||candidate.images||[]).length)state.galleryKnown=true;
  if(candidate.galleryAbsent===true||candidate.sourceGalleryAbsent===true){state.galleryKnown=true;state.deliveredState=true;}
  sendPrimeResult(job.sender,{key:job.key,url,media:candidate,done:false,phase,transport:candidate.transport||transport||''});
  scheduleIndependentAuthorPrime(job,state,url,candidate);
  return true;
}
function startBackgroundPrimeEnrichment(job,state,url,flow,name) {
  if(!flow?.full)return;
  Promise.resolve(flow.full).then(response=>parseFullPrimeHtmlResponse(response,url,job.context,name)).then(media=>{
    if(media&&!job.sender.isDestroyed())deliverPrimeCandidate(job,state,url,media,'full-background',name);
  }).catch(()=>{});
}
async function primeExactHtmlSource(job, state, url, provider) {
  const acceptHeaders={Accept:'text/html,application/xhtml+xml;q=0.9,*/*;q=0.2'};
  const galleryUrl=provider==='curseforge'?curseForgeGalleryUrl(url):'';
  const policy=transportPolicy(provider);
  const exactAuthorUrl=provider==='curseforge'&&providerForUrl(job.context?.authorUrl)==='curseforge'?safeHttpUrl(job.context.authorUrl):'';
  preconnectMediaOrigins([url,galleryUrl,exactAuthorUrl,...providerOriginHints(provider)]);

  // 2.5 cold-start rule: keep the minimum complete response(s) needed for uncapped
  // enrichment, while every redundant hedge becomes a true first-media probe. A probe
  // physically cancels its response body as soon as a trusted provider/CDN image URL is
  // complete, freeing bandwidth and sockets for the actual image bytes and other cards.
  const ownedMediaPattern=provider==='curseforge'?curseForgeOwnedMediaPattern(job.context,false):(['afdian','planetminecraft','patreon'].includes(provider)?(text=>ownedMediaMarker(provider,text,url)):null);
  const galleryMediaPattern=provider==='curseforge'?curseForgeOwnedMediaPattern(job.context,true):null;
  const progressiveOptions={timeoutMs:4800,cacheTtlMs:120000,headMaxBytes:256*1024,mediaMaxBytes:320*1024,mediaMinBytes:128,prefixMaxBytes:640*1024,headers:acceptHeaders,mediaPattern:ownedMediaPattern};
  const optsFor=(name,extra={})=>{
    const probe=policy.probe.has(name);
    return {...progressiveOptions,...extra,stopAfterMedia:probe,bypassCache:probe};
  };
  const apiDesc=apiDescriptorForUrl(url);
  const apiSeedPromise=apiDesc?discoverProviderApiSeed(url,job.context).catch(()=>null):null;
  const nodeFlow=policy.disabled?.has('node')?null:publicRequestProgressiveTextShared(url,optsFor('node',{timeoutMs:5000}));
  const chromiumFlow=policy.disabled?.has('chromium')?null:chromiumProgressiveTextShared(url,optsFor('chromium',{timeoutMs:4400}));
  const rustState=rustHttp.status(),impitState=impitHttp3.status();
  const rustFlow=rustState.available&&!policy.disabled?.has('wreq')?rustHttp.requestProgressiveText(url,optsFor('wreq',{timeoutMs:4400,headMaxBytes:160*1024,mediaMaxBytes:256*1024,prefixMaxBytes:448*1024})):null;
  const impitFlow=impitState.available&&!policy.disabled?.has('impit')?impitHttp3.requestProgressiveText(url,optsFor('impit',{timeoutMs:4300,headMaxBytes:128*1024,mediaMaxBytes:224*1024,prefixMaxBytes:384*1024})):null;
  // CurseForge creator pages are compact authoritative role indexes: one shared request
  // can yield the exact creator avatar and exact project logo for many cards by the same
  // author.  Start it at t=0 and let public-http single-flight collapse duplicate author
  // pages across the whole visible frontier.
  const authorIndexOptions={timeoutMs:4400,cacheTtlMs:180000,headMaxBytes:96*1024,mediaMaxBytes:224*1024,mediaMinBytes:128,prefixMaxBytes:640*1024,headers:acceptHeaders,mediaPattern:curseForgeAuthorMediaPattern(job.context)};
  const authorIndexFlow=exactAuthorUrl?publicRequestProgressiveTextShared(exactAuthorUrl,authorIndexOptions):null;
  const chromiumAuthorIndexFlow=exactAuthorUrl?chromiumProgressiveTextShared(exactAuthorUrl,{...authorIndexOptions,timeoutMs:4000}):null;
  const rustAuthorIndexFlow=exactAuthorUrl&&rustState.available&&Number(job.priority)>=250000?rustHttp.requestProgressiveText(exactAuthorUrl,{...authorIndexOptions,timeoutMs:3900,headMaxBytes:96*1024,mediaMaxBytes:192*1024,prefixMaxBytes:576*1024}):null;

  // Exact /gallery routes are fast discovery probes. Complete project enrichment stays
  // on the policy keeper(s), so a catalog of hundreds of CurseForge rows no longer has
  // several engines all draining the same large page tail.
  const probeOptions={...progressiveOptions,bypassCache:true,stopAfterMedia:true,mediaPattern:galleryMediaPattern};
  const nodeGalleryFlow=galleryUrl?publicRequestProgressiveTextShared(galleryUrl,{...probeOptions,timeoutMs:4200,headMaxBytes:128*1024,mediaMaxBytes:256*1024,prefixMaxBytes:448*1024}):null;
  const nodeGalleryFullFlow=galleryUrl&&Number(job.priority)>=250000?publicRequestProgressiveTextShared(galleryUrl,{...progressiveOptions,timeoutMs:7200,cacheTtlMs:120000,bypassCache:false,stopAfterMedia:false,stopAfterPrefix:false,mediaPattern:galleryMediaPattern,headMaxBytes:192*1024,mediaMaxBytes:512*1024,prefixMaxBytes:1024*1024}):null;
  // Native wreq/impit body cancellation was measured against real sockets: both stop
  // JS parsing quickly but their pooled clients can keep draining the response for reuse.
  // Do not launch them as redundant all-catalog probes. Rust remains a real CurseForge
  // full keeper and HTTP/3 remains an opt-in visible-card hedge where latency can justify it.
  const rustGalleryFlow=null;
  const impitGalleryFlow=null;
  const impitH3GalleryFlow=galleryUrl&&impitState.available&&Number(job.priority)>=900000?impitHttp3.requestProgressiveText(galleryUrl,{...probeOptions,timeoutMs:2600,headMaxBytes:96*1024,mediaMaxBytes:192*1024,prefixMaxBytes:256*1024,forceHttp3:true}):null;
  const chromiumGalleryFlow=galleryUrl&&Number(job.priority)>=250000?chromiumProgressiveTextShared(galleryUrl,{...progressiveOptions,timeoutMs:7200,cacheTtlMs:120000,bypassCache:false,stopAfterMedia:false,stopAfterPrefix:false,mediaPattern:galleryMediaPattern,headMaxBytes:192*1024,mediaMaxBytes:512*1024,prefixMaxBytes:1024*1024}):null;
  const impitH3Flow=!galleryUrl&&policy.h3&&impitState.available&&Number(job.priority)>=900000?impitHttp3.requestProgressiveText(url,{...probeOptions,timeoutMs:2600,headMaxBytes:96*1024,mediaMaxBytes:192*1024,prefixMaxBytes:256*1024,forceHttp3:true}):null;

  if(nodeFlow&&policy.full.has('node'))startBackgroundPrimeEnrichment(job,state,url,nodeFlow,'node-core-full');
  if(chromiumFlow&&policy.full.has('chromium'))startBackgroundPrimeEnrichment(job,state,url,chromiumFlow,'chromium-session-full');
  if(rustFlow&&policy.full.has('wreq'))startBackgroundPrimeEnrichment(job,state,url,rustFlow,'wreq-js-rust-native-full');
  if(impitFlow&&policy.full.has('impit'))startBackgroundPrimeEnrichment(job,state,url,impitFlow,'impit-rust-http3-full');
  if(chromiumGalleryFlow)startBackgroundPrimeEnrichment(job,state,url,chromiumGalleryFlow,'chromium-gallery-full-html');
  if(nodeGalleryFullFlow)startBackgroundPrimeEnrichment(job,state,url,nodeGalleryFullFlow,'node-gallery-full-html');

  const lanes=[];
  if(apiSeedPromise)lanes.push({name:'provider-api-seed',run:async()=>{
    const seed=await apiSeedPromise;if(!seed)return null;
    return primeMediaCandidate(seed,url,job.context,apiDesc?.kind||'provider-public-api','api-seed');
  }});
  if(authorIndexFlow){
    lanes.push({name:'curseforge-author-node-media',run:async()=>parseCurseForgeAuthorIndexResponse(await authorIndexFlow.media,url,job.context,'author-node-media')});
    lanes.push({name:'curseforge-author-node-prefix',run:async()=>parseCurseForgeAuthorIndexResponse(await authorIndexFlow.prefix,url,job.context,'author-node-prefix')});
    lanes.push({name:'curseforge-author-node-full',run:async()=>parseCurseForgeAuthorIndexResponse(await authorIndexFlow.full,url,job.context,'author-node-full')});
  }
  if(chromiumAuthorIndexFlow){
    lanes.push({name:'curseforge-author-chromium-media',run:async()=>parseCurseForgeAuthorIndexResponse(await chromiumAuthorIndexFlow.media,url,job.context,'author-chromium-media')});
    lanes.push({name:'curseforge-author-chromium-prefix',run:async()=>parseCurseForgeAuthorIndexResponse(await chromiumAuthorIndexFlow.prefix,url,job.context,'author-chromium-prefix')});
  }
  if(rustAuthorIndexFlow){
    lanes.push({name:'curseforge-author-rust-media',run:async()=>parseCurseForgeAuthorIndexResponse(await rustAuthorIndexFlow.media,url,job.context,'author-rust-media')});
    lanes.push({name:'curseforge-author-rust-prefix',run:async()=>parseCurseForgeAuthorIndexResponse(await rustAuthorIndexFlow.prefix,url,job.context,'author-rust-prefix')});
  }
  if(chromiumFlow){
    lanes.push({name:'chromium-head',run:async()=>parsePrimeHtmlResponse(await chromiumFlow.head,url,job.context,'head','chromium-session-fetch')});
    lanes.push({name:'chromium-media',run:async()=>parsePrimeHtmlResponse(await chromiumFlow.media,url,job.context,'media','chromium-session-fetch')});
    lanes.push({name:'chromium-prefix',run:async()=>parsePrimeHtmlResponse(await chromiumFlow.prefix,url,job.context,'prefix','chromium-session-fetch')});
  }
  if(nodeFlow){
    lanes.push({name:'node-head',run:async()=>parsePrimeHtmlResponse(await nodeFlow.head,url,job.context,'head','node-core-progressive')});
    lanes.push({name:'node-media',run:async()=>parsePrimeHtmlResponse(await nodeFlow.media,url,job.context,'media','node-core-progressive')});
    lanes.push({name:'node-prefix',run:async()=>parsePrimeHtmlResponse(await nodeFlow.prefix,url,job.context,'prefix','node-core-progressive')});
  }
  if(rustFlow){
    lanes.push({name:'rust-head',run:async()=>parsePrimeHtmlResponse(await rustFlow.head,url,job.context,'head','wreq-js-rust-native')});
    lanes.push({name:'rust-media',run:async()=>parsePrimeHtmlResponse(await rustFlow.media,url,job.context,'media','wreq-js-rust-native')});
    lanes.push({name:'rust-prefix',run:async()=>parsePrimeHtmlResponse(await rustFlow.prefix,url,job.context,'prefix','wreq-js-rust-native')});
  }
  if(impitFlow){
    lanes.push({name:'impit-head',run:async()=>parsePrimeHtmlResponse(await impitFlow.head,url,job.context,'head','impit-rust-http3')});
    lanes.push({name:'impit-media',run:async()=>parsePrimeHtmlResponse(await impitFlow.media,url,job.context,'media','impit-rust-http3')});
  }
  if(nodeGalleryFlow){
    lanes.push({name:'node-gallery-head',run:async()=>parsePrimeHtmlResponse(await nodeGalleryFlow.head,url,job.context,'head','node-core-gallery')});
    lanes.push({name:'node-gallery-media',run:async()=>{const response=await nodeGalleryFlow.media;return trustedGalleryStreamSeed(response,url,job.context,'node-core-gallery')||parsePrimeHtmlResponse(response,url,job.context,'media','node-core-gallery')}});
  }
  if(rustGalleryFlow){
    lanes.push({name:'rust-gallery-head',run:async()=>parsePrimeHtmlResponse(await rustGalleryFlow.head,url,job.context,'head','wreq-js-rust-gallery')});
    lanes.push({name:'rust-gallery-media',run:async()=>{const response=await rustGalleryFlow.media;return trustedGalleryStreamSeed(response,url,job.context,'wreq-js-rust-gallery')||parsePrimeHtmlResponse(response,url,job.context,'media','wreq-js-rust-gallery')}});
  }
  if(impitGalleryFlow)lanes.push({name:'impit-gallery-media',run:async()=>{const response=await impitGalleryFlow.media;return trustedGalleryStreamSeed(response,url,job.context,'impit-rust-http3-gallery')||parsePrimeHtmlResponse(response,url,job.context,'media','impit-rust-http3-gallery')}});
  if(impitH3GalleryFlow)lanes.push({name:'impit-h3-gallery-media',run:async()=>{const response=await impitH3GalleryFlow.media;return trustedGalleryStreamSeed(response,url,job.context,'impit-rust-http3-forced-gallery')||parsePrimeHtmlResponse(response,url,job.context,'media','impit-rust-http3-forced-gallery')}});
  if(chromiumGalleryFlow)lanes.push({name:'chromium-gallery-media',run:async()=>{const response=await chromiumGalleryFlow.media;return trustedGalleryStreamSeed(response,url,job.context,'chromium-gallery-session')||parsePrimeHtmlResponse(response,url,job.context,'media','chromium-gallery-session')}});
  if(impitH3Flow)lanes.push({name:'impit-h3-media',run:async()=>parsePrimeHtmlResponse(await impitH3Flow.media,url,job.context,'media','impit-rust-http3-forced')});

  // Exact CurseForge gallery DOM rescue. Public/streaming HTML can place the owned
  // attachment region beyond the bounded first-media probe or behind hydration. For
  // visible/near-visible cards, load the exact same-project /gallery route in the
  // persistent Chromium session, wait only until attachment anchors stabilize, and
  // extract those authoritative links directly. This is generic provider behavior and
  // does not hard-code project media.
  if(galleryUrl&&Number(job.priority)>=250000){
    lanes.push({name:'chromium-gallery-dom-owned',run:async()=>{
      const page=await extractCurseForgeGalleryDomQuick(galleryUrl,job.context,{timeoutMs:Number(job.priority)>=900000?4600:5200}).catch(()=>null);
      if(!page||!startRaceHasUsefulState(page))return null;
      return primeMediaCandidate({title:page.title,gallery:page.gallery,images:page.gallery,icon:null,author:null,authorUrl:'',sourceGalleryAbsent:page.sourceGalleryAbsent===true,galleryAbsent:false,provider:'curseforge',sourceUrl:url,resolvedProjectUrl:url},url,job.context,'chromium-gallery-dom-owned','gallery-dom');
    }});
  }

  // Session-heavy or browser-only providers (Patreon/Afdian/Marketplace/Ko-fi/BuiltByBit) get a DOM hedge from
  // the same persistent Chromium partition immediately for visible cards. That preserves
  // normal login/cookie behavior without exporting credentials into native scrapers.
  const shouldDom=policy.dom||Number(job.priority)>=900000;
  if(shouldDom){
    const domHedgeMs=Number(job.priority)>=900000?0:Number(job.priority)>=250000?25:90;
    lanes.push({name:'chromium-dom-hedge',run:async()=>{
      if(domHedgeMs>0)await new Promise(r=>setTimeout(r,domHedgeMs));if(job.sender.isDestroyed())return null;
      const contextScript=`(()=>{window.__MCC_MEDIA_CONTEXT=${JSON.stringify(job.context)};return ${PROJECT_MEDIA_EXTRACT_SCRIPT};})()`;
      const page=await extractLivePageMediaQuick(url,contextScript,{timeoutMs:3000}).catch(()=>null);
      if(!page||!startRaceHasMedia(page))return null;
      return primeMediaCandidate({title:page?.title,gallery:page?.gallery,icon:page?.icon,author:page?.author,authorUrl:page?.authorUrl,provider},url,job.context,'chromium-dom-hedge','dom');
    }});
  }

  const race=startParallelRace(lanes,{accept:startRaceHasUsefulState,onValue:async(value,name)=>{
    if(value&&!job.sender.isDestroyed())deliverPrimeCandidate(job,state,url,value,name,name);
  }});
  await Promise.race([race.first,new Promise(resolve=>setTimeout(()=>resolve(null),1500))]);
  // Do not declare a visible CurseForge card finished merely because its icon/author
  // arrived first. The exact /gallery DOM lane is still doing real work. Keep the prime
  // job open until gallery ownership is known or the bounded rescue window expires.
  if(provider==='curseforge'&&galleryUrl&&Number(job.priority)>=250000&&!state.galleryKnown){
    await Promise.race([race.settled,new Promise(resolve=>setTimeout(resolve,5200))]);
  }
  race.settled.catch(()=>{});
}


async function primeCollectionSource(job,state,url,provider) {
  preconnectMediaOrigins([url,...providerOriginHints(provider)]);
  // Collection/profile pages are identity resolvers, not media payloads. Both HTTP
  // engines stop after the bounded exact-link prefix; if that prefix misses, the normal
  // authenticated Chromium DOM resolver takes over. This removes another large tail from
  // Afdian/Patreon/Booth/PMC creator pages without weakening exact-child identity checks.
  const dynamic=['afdian','patreon','kofi','booth','fourthwall','builtbybit','nexusmods'].includes(provider);
  const prefixMax=dynamic?768*1024:448*1024;
  const options={timeoutMs:5600,cacheTtlMs:120000,headMaxBytes:128*1024,prefixMaxBytes:prefixMax,stopAfterPrefix:true,bypassCache:true,headers:{Accept:'text/html,application/xhtml+xml;q=0.9,*/*;q=0.2'}};
  const policy=transportPolicy(provider);
  const nodeFlow=policy.disabled?.has('node')?null:publicRequestProgressiveTextShared(url,options),chromiumFlow=policy.disabled?.has('chromium')?null:chromiumProgressiveTextShared(url,options);
  const candidateLane=async(flow,transport)=>{
    const response=await flow.prefix;if(!response||response.status<200||response.status>=300)return null;
    const candidates=resolveProviderProjectLinks(response.text||'',response.url||url,job.context);const candidate=candidates.find(x=>Number(x?.confidence)>=88)||candidates[0];if(!candidate?.url)return null;
    if(candidate.seedMedia){
      const seedRole=candidate.seedMedia.role==='icon'?'icon':'gallery';
      return primeMediaCandidate({sourceUrl:url,resolvedProjectUrl:candidate.url,resolutionConfidence:Number(candidate.confidence)||0,title:candidate.title||job.context.title||'',gallery:seedRole==='gallery'?[{...candidate.seedMedia,role:'gallery'}]:[],images:seedRole==='gallery'?[{...candidate.seedMedia,role:'gallery'}]:[],icon:seedRole==='icon'?{...candidate.seedMedia,role:'icon'}:null,author:null,authorUrl:'',provider:candidate.provider||provider,identity:Number(candidate.identity)||0,exclusive:false,indexSeed:true},url,job.context,transport,'index-prefix');
    }
    const childState={delivered:false};await primeExactHtmlSource(job,childState,candidate.url,providerForUrl(candidate.url));state.delivered=state.delivered||childState.delivered;return null;
  };
  const collectionLanes=[];
  if(chromiumFlow)collectionLanes.push({name:'chromium-index-prefix',run:()=>candidateLane(chromiumFlow,'chromium-session-index-prefix')});
  if(nodeFlow)collectionLanes.push({name:'node-index-prefix',run:()=>candidateLane(nodeFlow,'node-core-index-prefix')});
  const race=startParallelRace(collectionLanes,{accept:startRaceHasMedia,onValue:async(value,name)=>{if(value&&!job.sender.isDestroyed())deliverPrimeCandidate(job,state,url,value,name,name)}});
  const first=await Promise.race([race.first,new Promise(resolve=>setTimeout(()=>resolve(null),2200))]);
  race.settled.catch(()=>{});
  if(first||state.delivered||job.sender.isDestroyed())return;
  const liveCandidates=await resolveProviderChildLive(url,job.context,5000).catch(()=>[]);
  const candidate=liveCandidates.find(x=>Number(x?.confidence)>=88)||liveCandidates[0];
  if(candidate?.url){
    const childState={delivered:false};await primeExactHtmlSource(job,childState,candidate.url,providerForUrl(candidate.url));state.delivered=state.delivered||childState.delivered;
  }
}


async function runMediaPrime(job) {
  job.active=true;const state={delivered:false,deliveredState:false,galleryKnown:false},errors=[],started=Date.now();
  try {
    // True parallel execution: every canonical source starts in the same turn. Provider
    // ordering is retained only as metadata; it no longer delays lower-ranked sources.
    const orderedUrls=orderMediaPrimeUrls(job.urls);preconnectMediaOrigins([...orderedUrls,...orderedUrls.flatMap(u=>providerOriginHints(providerForUrl(u)))]);
    const tasks=orderedUrls.map(url=>(async()=>{
      if(job.sender.isDestroyed())return null;
      try{
        const provider=providerForUrl(url);
        if(isProviderCollectionUrl(url)){await primeCollectionSource(job,state,url,provider);return null}
        if(provider==='modrinth'||provider==='github'){
          const media=await discoverProjectMedia(url,{force:false,deep:false,context:job.context});
          if(media)deliverPrimeCandidate(job,state,url,media,'provider-api',media.transport||provider);return media;
        }
        await primeExactHtmlSource(job,state,url,provider);return null;
      }catch(err){errors.push(String(err?.message||err));return null}
    })());
    await Promise.all(tasks);
  } finally {
    const elapsed=Date.now()-started;
    if(state.delivered&&elapsed<900){if(++mediaPrimeFastStreak>=3){mediaPrimeFastStreak=0;mediaPrimeTarget=Math.min(MEDIA_PRIME_HEAP_CAP,MEDIA_PRIME_MAX,mediaPrimeTarget+2)}}
    else if(elapsed>4500){mediaPrimeFastStreak=0;mediaPrimeTarget=Math.max(MEDIA_PRIME_ACTIVE_MIN,mediaPrimeTarget-1)}
    sendPrimeResult(job.sender,{key:job.key,done:true,delivered:state.delivered||state.deliveredState,error:!state.delivered&&!state.deliveredState&&errors.length?errors[0]:'',elapsedMs:elapsed,rustTransport:rustHttp.status(),impitTransport:impitHttp3.status()});
    mediaPrimeJobs.delete(job.id);
  }
}

function pumpMediaPrime() {
  while(activeMediaPrimeJobs<mediaPrimeTarget&&mediaPrimeQueue.length){
    const job=nextMediaPrimeJob();if(!job)break;activeMediaPrimeJobs++;
    runMediaPrime(job).finally(()=>{activeMediaPrimeJobs--;pumpMediaPrime();});
  }
}
function reprioritizeMediaPrime(sender, key, priority=0) {
  const job=mediaPrimeJobs.get(mediaPrimeJobId(sender,key));if(job&&!job.active)job.priority=Math.max(job.priority,Number(priority)||0);
}

function launcherSender(event) {
  if (!launcherView || launcherView.webContents.isDestroyed() || event.sender !== launcherView.webContents) {
    throw new Error('Launcher IPC is only available to the Enderloom Mod Manager');
  }
}
function catalogSender(event) {
  if (!catalogView || catalogView.webContents.isDestroyed() || event.sender !== catalogView.webContents) {
    throw new Error('Catalog integration is only available to the Enderloom Catalog');
  }
}
function catalogLauncherProject(raw) {
  const modrinthKinds = new Map([
    ['mod', 'mods'],
    ['modpack', 'modpacks'],
    ['resourcepack', 'resourcepacks'],
    ['shader', 'shaderpacks'],
    ['datapack', 'datapacks'],
  ]);
  const curseforgeKinds = new Map([
    ['mc-mods', 'mods'],
    ['modpacks', 'modpacks'],
    ['texture-packs', 'resourcepacks'],
    ['shaders', 'shaderpacks'],
    ['data-packs', 'datapacks'],
  ]);
  const urls = (Array.isArray(raw?.urls) ? raw.urls : []).map(safeHttpUrl).filter(Boolean).slice(0, 16);
  const ranked = [...urls].sort((a, b) => Number(/modrinth\.com/i.test(b)) - Number(/modrinth\.com/i.test(a)));
  for (const sourceUrl of ranked) {
    let parsed;
    try { parsed = new URL(sourceUrl); } catch { continue; }
    const parts = parsed.pathname.split('/').filter(Boolean).map(part => decodeURIComponent(part));
    let provider;
    let kind;
    let projectId;
    if (/(^|\.)modrinth\.com$/i.test(parsed.hostname)) {
      provider = 'modrinth';
      kind = modrinthKinds.get(String(parts[0] || '').toLowerCase());
      projectId = String(parts[1] || '');
    } else if (/(^|\.)curseforge\.com$/i.test(parsed.hostname) && String(parts[0] || '').toLowerCase() === 'minecraft') {
      provider = 'curseforge';
      kind = curseforgeKinds.get(String(parts[1] || '').toLowerCase());
      projectId = String(parts[2] || '');
    }
    if (!kind || !/^[a-z0-9_-]{1,128}$/i.test(projectId)) continue;
    return {
      provider,
      projectId,
      kind,
      title: String(raw?.name || projectId).trim().slice(0, 256) || projectId,
      catalogId: String(raw?.id || '').slice(0, 256),
      sourceUrl,
      catalogContext: {
        edition: String(raw?.edition || '').slice(0, 80),
        type: String(raw?.type || '').slice(0, 80),
        loader: String(raw?.loader || '').slice(0, 160),
        minecraftVersions: String(raw?.minecraftVersions || '').slice(0, 256),
      },
    };
  }
  return null;
}
function normalizedProjectName(value) {
  return String(value || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}
function catalogProviderProjectUrl(provider, kind, slug) {
  if (!/^[a-z0-9_-]{1,128}$/i.test(String(slug || ''))) return '';
  if (provider === 'modrinth') {
    const route = { mods:'mod', modpacks:'modpack', resourcepacks:'resourcepack', shaderpacks:'shader', datapacks:'datapack' }[kind];
    return route ? `https://modrinth.com/${route}/${encodeURIComponent(slug)}` : '';
  }
  if (provider === 'curseforge') {
    const route = { mods:'mc-mods', modpacks:'modpacks', resourcepacks:'texture-packs', shaderpacks:'shaders', datapacks:'data-packs' }[kind];
    return route ? `https://www.curseforge.com/minecraft/${route}/${encodeURIComponent(slug)}` : '';
  }
  return '';
}
function githubProjectHome(value) {
  const url = safeHttpUrl(value); if (!url) return '';
  try {
    const parsed = new URL(url);
    if (!/(^|\.)github\.com$/i.test(parsed.hostname)) return '';
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2 || ['features','marketplace','topics','collections','orgs','users'].includes(parts[0].toLowerCase())) return '';
    return `https://github.com/${encodeURIComponent(decodeURIComponent(parts[0]))}/${encodeURIComponent(decodeURIComponent(parts[1]).replace(/\.git$/i,''))}`;
  } catch { return ''; }
}
function exactCatalogSearchHit(page, expected, slug = '') {
  const name = normalizedProjectName(expected), wantedSlug = String(slug || '').toLowerCase();
  const hits = Array.isArray(page?.hits) ? page.hits : [];
  return hits.find(hit => wantedSlug && String(hit?.slug || '').toLowerCase() === wantedSlug)
    || hits.find(hit => normalizedProjectName(hit?.title) === name)
    || hits.find(hit => name.length >= 5 && titleSimilarity(expected, hit?.title || '') >= .985)
    || null;
}
async function searchCatalogProvider(provider, kind, title, slug = '') {
  const page = await launcherService.request('search_content', {
    provider, kind,
    query: {
      query: title,
      game_versions: [], loaders: [], categories: [], environment: null,
      open_source_only: false, sort: 'relevance', offset: 0, limit: 40,
    },
  });
  return exactCatalogSearchHit(page, title, slug);
}
async function resolveCatalogProviderDetails(request) {
  let projectId = request.projectId;
  if (request.provider === 'curseforge' && !/^\d+$/.test(projectId)) {
    const hit = await searchCatalogProvider('curseforge', request.kind, request.title, projectId);
    if (!hit) throw new Error('Exact CurseForge project was not found');
    projectId = String(hit.id || '');
  }
  const details = await launcherService.request('get_project_details', {
    provider: request.provider,
    projectId,
  });
  const slug = String(details?.slug || request.projectId || projectId);
  const projectUrl = safeHttpUrl(details?.website_url)
    || catalogProviderProjectUrl(request.provider, request.kind, slug);
  return { provider:request.provider, kind:request.kind, projectId, slug, projectUrl, details };
}
function officialCatalogLinks(resolved) {
  const rows = [];
  const add = (url, label, source) => {
    const clean = safeHttpUrl(url); if (!clean) return;
    rows.push({ url: githubProjectHome(clean) || clean, label:String(label || 'Official link').slice(0,80), source });
  };
  add(resolved.projectUrl, resolved.provider === 'modrinth' ? 'Modrinth' : 'CurseForge', `${resolved.provider}-project`);
  for (const link of resolved.details?.links || []) add(link?.url, link?.label, `${resolved.provider}-metadata`);
  add(resolved.details?.website_url, 'Website', `${resolved.provider}-metadata`);
  const body = String(resolved.details?.body || '');
  for (const match of body.match(/https?:\/\/[^\s<>"')\]]+/gi) || []) {
    const clean = match.replace(/[.,;:!?]+$/, '');
    if (githubProjectHome(clean) || catalogLauncherProject({ urls:[clean] })) add(clean, 'Official project link', `${resolved.provider}-description`);
  }
  const unique = new Map();
  for (const row of rows) if (!unique.has(row.url)) unique.set(row.url, row);
  return [...unique.values()];
}
async function enrichCatalogProjectLinks(raw) {
  const project = {
    id:String(raw?.id || '').slice(0,256),
    name:String(raw?.name || '').trim().slice(0,256),
    urls:(Array.isArray(raw?.urls) ? raw.urls : []).map(safeHttpUrl).filter(Boolean).slice(0,16),
    edition:String(raw?.edition || '').slice(0,80), type:String(raw?.type || '').slice(0,80),
    loader:String(raw?.loader || '').slice(0,160), minecraftVersions:String(raw?.minecraftVersions || '').slice(0,256),
  };
  const known = new Map();
  for (const url of project.urls) {
    const request = catalogLauncherProject({ ...project, urls:[url] });
    if (request && !known.has(request.provider)) known.set(request.provider, request);
  }
  if (!known.size) return { links:project.urls.map(url => ({url,label:'Source',source:'catalog'})), providers:[] };
  const resolved = [];
  for (const request of known.values()) {
    try { resolved.push(await resolveCatalogProviderDetails(request)); } catch {}
  }
  const kind = resolved[0]?.kind || known.values().next().value?.kind;
  const canonicalTitle = resolved[0]?.details?.title || project.name;
  for (const provider of ['modrinth','curseforge']) {
    if (known.has(provider) || !kind) continue;
    try {
      const hit = await searchCatalogProvider(provider, kind, canonicalTitle);
      if (!hit) continue;
      const slug = String(hit.slug || hit.id || '');
      const request = { provider, kind, projectId:slug, title:canonicalTitle };
      known.set(provider, request);
      resolved.push(await resolveCatalogProviderDetails(request));
    } catch {}
  }
  const links = project.urls.map(url => ({url:githubProjectHome(url)||url,label:'Catalog source',source:'catalog'}));
  for (const item of resolved) links.push(...officialCatalogLinks(item));
  const unique = new Map();
  for (const row of links) if (row?.url && !unique.has(row.url)) unique.set(row.url, row);
  return { links:[...unique.values()].slice(0,40), providers:[...known.keys()] };
}
function launcherDialogOptions(raw = {}, save = false) {
  const options = {
    title: typeof raw.title === 'string' ? raw.title.slice(0, 160) : undefined,
    defaultPath: typeof raw.defaultPath === 'string' ? raw.defaultPath : undefined,
    filters: Array.isArray(raw.filters) ? raw.filters.slice(0, 12).map(filter => ({
      name: String(filter?.name || 'Files').slice(0, 80),
      extensions: Array.isArray(filter?.extensions)
        ? filter.extensions.map(value => String(value).replace(/^\./, '')).filter(value => /^[a-z0-9*]+$/i.test(value)).slice(0, 32)
        : ['*'],
    })) : undefined,
  };
  if (!save) {
    options.properties = [
      raw.directory ? 'openDirectory' : 'openFile',
      ...(raw.multiple ? ['multiSelections'] : []),
    ];
  }
  return options;
}
function isWithinPath(root, target) {
  const prefix = path.resolve(root).toLocaleLowerCase();
  const value = path.resolve(target).toLocaleLowerCase();
  return value === prefix || value.startsWith(prefix + path.sep);
}
function launcherAssetRoots() {
  const roots = [
    ROOT,
    path.join(app.getPath('userData'), 'launcher'),
    path.join(process.env.APPDATA || '', 'ModrinthApp'),
    path.join(process.env.USERPROFILE || '', 'curseforge', 'minecraft'),
  ];
  if (process.platform === 'win32') {
    for (let code = 67; code <= 90; code++) {
      roots.push(`${String.fromCharCode(code)}:\\Minecraft\\Curseforge`);
    }
  }
  return [...new Set(roots.filter(root => root && fs.existsSync(root)).map(root => path.resolve(root)))];
}
function setupLauncherAssetProtocol() {
  const allowedExtensions = new Set(['.png','.jpg','.jpeg','.webp','.gif','.bmp','.ico']);
  const handler = request => {
    try {
      const encoded = new URL(request.url).pathname.replace(/^\/+/, '');
      if (encoded === 'app-icon') return net.fetch(pathToFileURL(APP_ICON).toString());
      const decoded = Buffer.from(encoded, 'base64url').toString('utf8');
      if (!path.isAbsolute(decoded) || !allowedExtensions.has(path.extname(decoded).toLowerCase())) {
        return new Response('Forbidden', { status: 403 });
      }
      const target = path.resolve(decoded);
      const root = launcherAssetRoots().find(candidate => isWithinPath(candidate, target));
      if (!root) {
        return new Response('Forbidden', { status: 403 });
      }
      // Keep the lexical allow-list usable under Windows packaged-app file
      // virtualization, where realpath(file) can jump into LocalCache while
      // realpath(parent) does not. Reject explicit symlink/reparse escapes on
      // the way to the file before serving the original trusted path.
      let cursor = root;
      for (const part of path.relative(root, target).split(path.sep).filter(Boolean)) {
        cursor = path.join(cursor, part);
        const stat = fs.lstatSync(cursor);
        if (stat.isSymbolicLink()) return new Response('Forbidden', { status: 403 });
      }
      if (!fs.statSync(target).isFile()) return new Response('Not found', { status: 404 });
      return net.fetch(pathToFileURL(target).toString());
    } catch {
      return new Response('Not found', { status: 404 });
    }
  };
  // Protocol handlers are session-scoped. Register with every Enderloom UI
  // partition so uploaded logos/banners work in the sandboxed launcher and
  // catalog instead of falling through to ERR_UNKNOWN_URL_SCHEME.
  protocol.handle('enderloom-asset', handler);
  session.fromPartition(PARTITION).protocol.handle('enderloom-asset', handler);
  session.fromPartition(LAUNCHER_PARTITION).protocol.handle('enderloom-asset', handler);
}

ipcMain.handle('launcher:invoke', async (event, request) => {
  launcherSender(event);
  const command = String(request?.command || '');
  if (!/^[a-z][a-z0-9_]{0,95}$/.test(command)) throw new Error('Invalid launcher command');
  if (launcherResetInProgress) throw new Error('Enderloom is already preparing a recoverable reset');
  const launcherArgs = { ...(request?.args && typeof request.args === 'object' ? request.args : {}) };
  if (command === 'reset_launcher') {
    if (testMode) throw new Error('Reset is disabled during the Electron self-test');
    launcherResetInProgress = true;
    try {
      const deep = launcherArgs.deep === true;
      await launcherService.request('prepare_reset', { deep });
      const report = await launcherService.applyReset(deep);
      app.relaunch();
      setImmediate(() => { void shutdownApplication(0); });
      return report;
    } catch (error) {
      launcherResetInProgress = false;
      throw error;
    }
  }
  if (command === 'check_for_updates') {
    launcherArgs.currentVersion = app.getVersion();
    launcherArgs.packaged = app.isPackaged;
  }
  if (
    command === 'find_curseforge_download' ||
    command === 'apply_content_update' ||
    command === 'install_server_pack' ||
    command === 'plan_modpack_install' ||
    command === 'install_modpack' ||
    command === 'link_modpack' ||
    command === 'plan_modpack_upgrade' ||
    command === 'upgrade_modpack'
  ) {
    launcherArgs.downloadsDir = app.getPath('downloads');
  }
  if (command === 'open_folder' || command === 'open_file') {
    const target = String(launcherArgs.path || '').trim();
    if (!target || !path.isAbsolute(target)) throw new Error('An absolute local path is required');
    if (command === 'open_folder') {
      fs.mkdirSync(target, { recursive: true });
      if (!fs.statSync(target).isDirectory()) throw new Error('That path is not a folder');
    } else if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
      throw new Error('That file no longer exists');
    }
    const openError = await shell.openPath(target);
    if (openError) throw new Error(openError);
    return null;
  }
  if (command === 'copy_screenshot') {
    const resolved = await launcherService.request(command, launcherArgs);
    if (typeof resolved !== 'string' || !path.isAbsolute(resolved)) {
      throw new Error('The screenshot path returned by the Rust core is invalid');
    }
    let target;
    try { target = fs.realpathSync.native(resolved); } catch { throw new Error('That screenshot no longer exists'); }
    if (!launcherAssetRoots().some(root => isWithinPath(root, target))) {
      throw new Error('The screenshot is outside Enderloom launcher storage');
    }
    const image = nativeImage.createFromPath(target);
    if (image.isEmpty()) throw new Error('The screenshot could not be decoded');
    clipboard.writeImage(image);
    return null;
  }
  return await launcherService.request(command, launcherArgs);
});
ipcMain.handle('launcher:open-dialog', async (event, options) => {
  launcherSender(event);
  const result = await dialog.showOpenDialog(win, launcherDialogOptions(options));
  if (result.canceled) return null;
  return options?.multiple ? result.filePaths : result.filePaths[0] || null;
});
ipcMain.handle('launcher:save-dialog', async (event, options) => {
  launcherSender(event);
  const result = await dialog.showSaveDialog(win, launcherDialogOptions(options, true));
  return result.canceled ? null : result.filePath || null;
});
ipcMain.handle('launcher:open-external', async (event, rawUrl) => {
  launcherSender(event);
  const url = safeHttpUrl(rawUrl);
  if (!url) throw new Error('Only HTTPS/HTTP links can be opened');
  await shell.openExternal(url);
});
ipcMain.handle('launcher:open-catalog-research', async (event, raw) => {
  launcherSender(event);
  const query = String(raw?.query || '').trim().replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 256);
  if (!query) throw new Error('A project title or file name is required for Catalog research');
  const request = {
    query,
    provider: /^(modrinth|curseforge)$/i.test(String(raw?.provider || ''))
      ? String(raw.provider).toLowerCase()
      : '',
    projectId: /^[a-z0-9_-]{1,128}$/i.test(String(raw?.projectId || ''))
      ? String(raw.projectId)
      : '',
    kind: /^(mods|modpacks|resourcepacks|shaderpacks|datapacks|schematics)$/i.test(String(raw?.kind || ''))
      ? String(raw.kind).toLowerCase()
      : '',
  };
  activateTab(CATALOG_ID);
  if (!catalogView || catalogView.webContents.isDestroyed()) throw new Error('The Catalog is unavailable');
  catalogView.webContents.send('catalog:research', request);
  return { opened: true, query };
});
ipcMain.handle('launcher:reveal', async (event, rawPath) => {
  launcherSender(event);
  const target = path.resolve(String(rawPath || ''));
  if (!fs.existsSync(target)) throw new Error('That file no longer exists');
  shell.showItemInFolder(target);
});
ipcMain.handle('launcher:window-command', async (event, request) => {
  launcherSender(event);
  switch (request?.command) {
    case 'minimize': win.minimize(); return true;
    case 'restore': win.restore(); return true;
    case 'focus': win.focus(); return true;
    case 'toggle-maximize': win.isMaximized() ? win.unmaximize() : win.maximize(); return true;
    case 'is-maximized': return win.isMaximized();
    case 'close': win.close(); return true;
    default: return false;
  }
});

ipcMain.handle('command', (_e, req) => command(req?.name, req?.payload));
ipcMain.handle('catalog:enrich-project-links', async (event, project) => {
  catalogSender(event);
  return enrichCatalogProjectLinks(project);
});
ipcMain.handle('catalog:install-to-launcher', async (event, project) => {
  catalogSender(event);
  const request = catalogLauncherProject(project);
  if (!request) throw new Error('This Catalog entry does not have a supported Modrinth or CurseForge project home yet');
  activateTab(LAUNCHER_ID);
  if (!launcherView || launcherView.webContents.isDestroyed()) throw new Error('The Mod Manager is unavailable');
  launcherView.webContents.send('launcher:event', { event: 'catalog:project', payload: request });
  return { opened: true, provider: request.provider, projectId: request.projectId, kind: request.kind };
});
ipcMain.handle('catalog:open-provider-launcher', async (event, project) => {
  catalogSender(event);
  const request = catalogLauncherProject(project);
  if (!request) throw new Error('That provider project URL is not supported');
  if (request.provider === 'modrinth') {
    const route = request.kind === 'modpacks' ? 'modpack' : 'mod';
    await shell.openExternal(`modrinth://${route}/${encodeURIComponent(request.projectId)}`);
    return { opened: true, provider: request.provider };
  }

  let addonId = /^\d+$/.test(request.projectId) ? request.projectId : '';
  if (!addonId) {
    const query = {
      query: request.projectId.replace(/[-_]+/g, ' '),
      game_versions: [],
      loaders: [],
      categories: [],
      environment: null,
      open_source_only: false,
      sort: 'relevance',
      offset: 0,
      limit: 50,
    };
    try {
      const page = await launcherService.request('search_content', {
        provider: 'curseforge',
        kind: request.kind,
        query,
      });
      const exact = (page?.hits || []).find(hit =>
        String(hit?.slug || '').toLowerCase() === request.projectId.toLowerCase()
        || String(hit?.title || '').toLowerCase() === request.title.toLowerCase()
      );
      addonId = /^\d+$/.test(String(exact?.id || '')) ? String(exact.id) : '';
    } catch {}
  }
  if (addonId) {
    await shell.openExternal(`curseforge://install?addonId=${encodeURIComponent(addonId)}`);
  } else {
    await shell.openExternal(request.sourceUrl);
  }
  return { opened: true, provider: request.provider };
});
ipcMain.on('catalog:open-here', (_e, u) => { const target = safeHttpUrl(u); if (target) createBrowserTab(target, true); });
ipcMain.on('catalog:open-external', (_e, u) => { const target = safeHttpUrl(u); if (target) shell.openExternal(target); });
ipcMain.on('catalog:open-many', (_e, data) => { (data?.urls || []).map(safeHttpUrl).filter(Boolean).slice(0, 8).forEach((u, i) => createBrowserTab(u, i === 0)); });
ipcMain.on('catalog:copy-url', (_e, u) => { const target = safeHttpUrl(u); if (target) clipboard.writeText(target); });
ipcMain.handle('catalog:discover-gallery', (_e, u) => discoverGallery(u));
ipcMain.handle('catalog:discover-head-media', (_e, req) => discoverHeadMedia(req?.url, mediaContext(req?.context), 2200));
ipcMain.handle('catalog:discover-media', (_e, req) => discoverProjectMedia(req?.url, { force:!!req?.force, deep:!!req?.deep, context:mediaContext(req?.context) }));
ipcMain.handle('catalog:cached-media', (_e, req) => cachedProjectMedia(typeof req==='string'?req:req?.url, 3650 * 24 * 60 * 60 * 1000, mediaContext(typeof req==='string'?{}:req?.context)));
ipcMain.handle('catalog:cached-media-batch', (_e, requests) => (Array.isArray(requests)?requests:[]).map(req=>({ key:String(req?.key||''), url:safeHttpUrl(req?.url)||'', media:cachedProjectMedia(req?.url,3650*24*60*60*1000,mediaContext(req?.context||{})) })));
ipcMain.on('catalog:prime-media', (event, requests) => {
  const rows=Array.isArray(requests)?requests:[];
  warmModrinthProjectBatches(rows);
  // Atomic batch admission is critical: enqueue the whole frontier first, then pick the
  // globally highest-priority jobs. Older builds pumped after each row, allowing the first
  // N registration-order cards to occupy every worker before visible priorities existed.
  for(const req of rows)enqueueMediaPrime(event.sender,req,true);
  pumpMediaPrime();
});
ipcMain.on('catalog:reprioritize-media', (event, req) => reprioritizeMediaPrime(event.sender,req?.key,req?.priority));
ipcMain.on('catalog:visited', () => {});

async function waitForMainFrame(wc, timeoutMs = 15000) {
  if (!wc || wc.isDestroyed() || !wc.isLoadingMainFrame()) return;
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => finish(new Error('renderer load timed out')), timeoutMs);
    timer.unref?.();
    const finish = error => {
      clearTimeout(timer);
      wc.removeListener('did-finish-load', loaded);
      wc.removeListener('did-fail-load', failed);
      if (error) reject(error); else resolve();
    };
    const loaded = () => finish();
    const failed = (_event, code, description, url, mainFrame) => {
      if (mainFrame !== false) finish(new Error(`renderer load failed (${code}): ${description} · ${url}`));
    };
    wc.once('did-finish-load', loaded);
    wc.on('did-fail-load', failed);
  });
}

async function runSelfTest() {
  const failures = [];
  const check = (name, ok, detail='') => { if (!ok) failures.push(`${name}: ${detail}`); };
  const stage = name => {const memory=process.memoryUsage();console.log(`ENDERLOOM_SELF_TEST_STAGE ${name} heap=${Math.round(memory.heapUsed/(1024*1024))}MiB external=${Math.round(memory.external/(1024*1024))}MiB activePrime=${activeMediaPrimeJobs}/${mediaPrimeTarget}`)};
  const tinyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZK9sAAAAASUVORK5CYII=', 'base64');
  const server = http.createServer((req, res) => {
    if (req.url === '/two') res.end('<!doctype html><title>Page Two</title><h1>two</h1>');
    else if (req.url === '/author') res.end('<!doctype html><title>Fixture Creator</title><main class="creator-profile"><img width="128" height="128" class="profile-avatar creator-avatar" alt="Fixture Creator avatar" src="/avatar.png"></main>');
    else if (req.url === '/gallery') res.end('<!doctype html><title>Fixture Gallery</title><section class="project-gallery screenshots"><img width="900" height="500" class="gallery screenshot" src="/shot1.png"><img width="800" height="450" class="gallery screenshot" src="/shot2.png"></section>');
    else if (req.url === '/minecraft/mc-mods/boks-butterflies/gallery') {
      const urls=['774/987/bookstats.png','749/989/pink.png','749/997/chrysalis.png','749/976/advancements.png','749/982/caterpillars.png','749/986/eggs.png','749/977/bottles.png','774/985/scrolls.png','749/988/monarch.png','774/986/bookbutterfly.png','749/990/swarm.png'];
      const cards=urls.map((x,i)=>`<li><a href="https://media.forgecdn.net/attachments/${x}"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="Bok gallery ${i+1}"></a></li>`).join('');
      res.end(`<!doctype html><title>Bok's Banging Butterflies - Gallery</title><header><a href="https://media.forgecdn.net/attachments/9999/8888/pubg-battlegrounds-ugc-contest.jpg"><img width="1200" height="630" src="https://media.forgecdn.net/attachments/9999/8888/pubg-battlegrounds-ugc-contest.jpg" alt="PUBG BATTLEGROUNDS UGC CONTEST"></a></header><main><h1>Bok's Banging Butterflies</h1><nav><a href="/minecraft/mc-mods/boks-butterflies">Description</a><a href="/minecraft/mc-mods/boks-butterflies/comments">Comments</a><a href="/minecraft/mc-mods/boks-butterflies/files">Files</a><a href="/minecraft/mc-mods/boks-butterflies/gallery">Gallery (11)</a><a href="/minecraft/mc-mods/boks-butterflies/relations/dependencies">Relations</a></nav><ul>${cards}</ul></main>`);
    }
    else if (req.url === '/shot1.png' || req.url === '/shot2.png' || req.url === '/icon.png' || req.url === '/avatar.png') { res.setHeader('Content-Type','image/png'); res.end(tinyPng); }
    else res.end('<!doctype html><title>Fixture One</title><input id="focusField" placeholder="type here"><a id="blank" href="/two" target="_blank">new</a><a id="same" href="/two">two</a><a rel="author" class="project-author" href="/author">Fixture Creator</a><a class="gallery-link" href="/gallery">Gallery</a><meta property="og:image" content="/icon.png"><section class="project-gallery screenshots"><img width="900" height="500" class="gallery screenshot" src="/shot1.png"></section>');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  createWindow({ show: false });
  await Promise.all([
    waitForMainFrame(win.webContents),
    waitForMainFrame(launcherView?.webContents),
  ]);
  await new Promise(resolve => setTimeout(resolve, 220));
  stage('window-ready');
  const chromeChildren = win.contentView.children || [];
  const chromeBounds = chromeView?.getBounds?.() || {};
  const statusBounds = statusView?.getBounds?.() || {};
  check('native chrome overlay attached', !!chromeView && chromeChildren.includes(chromeView), JSON.stringify({children:chromeChildren.length}));
  check('native status overlay attached', !!statusView && chromeChildren.includes(statusView), JSON.stringify({children:chromeChildren.length}));
  check('native chrome overlay stacked above site views', !!chromeView && chromeChildren[chromeChildren.length - 1] === chromeView, JSON.stringify({children:chromeChildren.length}));
  check('native status overlay stacked above site views', !!statusView && chromeChildren[chromeChildren.length - 2] === statusView, JSON.stringify({children:chromeChildren.length}));
  check('native chrome overlay protects top controls', chromeBounds.x===0 && chromeBounds.y===0 && chromeBounds.height>=BASE_TOP, JSON.stringify(chromeBounds));
  check('native status overlay protects bottom controls', statusBounds.x===0 && statusBounds.height===STATUS_H && statusBounds.y+statusBounds.height===win.getContentSize()[1], JSON.stringify(statusBounds));
  const overlayChrome = chromeView ? await chromeView.webContents.executeJavaScript(`(() => {
    const ids=['newTab','catalogButton','address','back','reload','translatorToggle','moreToggle'];
    const visible=id=>{const el=document.getElementById(id);if(!el)return false;const r=el.getBoundingClientRect(),st=getComputedStyle(el);return r.width>0&&r.height>0&&st.display!=='none'&&st.visibility!=='hidden'&&Number(st.opacity||1)>0};
    return {overlay:new URLSearchParams(location.search).get('chrome'),visible:Object.fromEntries(ids.map(id=>[id,visible(id)]))};
  })()`, true) : null;
  check('native chrome overlay renderer has interactive controls', overlayChrome?.overlay==='1' && Object.values(overlayChrome?.visible||{}).every(Boolean), JSON.stringify(overlayChrome));
  const statusUi = statusView ? await statusView.webContents.executeJavaScript(`(() => {
    const bar=document.getElementById('statusbar'),toggle=document.getElementById('statusToggle');
    const ok=el=>{if(!el)return false;const r=el.getBoundingClientRect(),st=getComputedStyle(el);return r.width>0&&r.height>0&&st.display!=='none'&&st.visibility!=='hidden'};
    return {bar:ok(bar),toggle:ok(toggle),collapsed:document.body.classList.contains('collapsed')};
  })()`, true) : null;
  check('native bottom status renderer is interactive', statusUi?.bar===true && statusUi?.toggle===true && statusUi?.collapsed===false, JSON.stringify(statusUi));
  const launcherPreferences = launcherView?.webContents?.getLastWebPreferences?.() || {};
  check('launcher workspace is sandboxed', launcherPreferences.sandbox===true && launcherPreferences.nodeIntegration===false && launcherPreferences.contextIsolation===true, JSON.stringify(launcherPreferences));
  const launcherUi = launcherView ? await launcherView.webContents.executeJavaScript(`(() => ({
    bridge: typeof window.enderloomLauncher?.invoke === 'function',
    rootChildren: document.getElementById('root')?.childElementCount || 0,
    title: document.title
  }))()`, true) : null;
  check('Enderloom React workspace boots through the Electron preload', launcherUi?.bridge===true && launcherUi?.rootChildren>0 && /Enderloom/i.test(launcherUi?.title||''), JSON.stringify(launcherUi));
  const launcherCoreInfo = await launcherService.request('get_app_info');
  const launcherCoreInstances = await launcherService.request('list_instances');
  check('Electron invokes the real Rust launcher core', !!launcherCoreInfo?.version && Array.isArray(launcherCoreInstances), JSON.stringify({version:launcherCoreInfo?.version,instances:launcherCoreInstances?.length}));
  await command('launcher');
  const launcherBounds = launcherView?.getBounds?.() || {};
  const [launcherW,launcherH] = win.getContentSize();
  check('top-level Mod Manager workspace activates in place', activeId===LAUNCHER_ID && launcherView?.getVisible?.()===true && catalogView?.getVisible?.()===false, JSON.stringify({activeId,launcherVisible:launcherView?.getVisible?.(),catalogVisible:catalogView?.getVisible?.()}));
  check('launcher workspace stays below protected chrome and above status', launcherBounds.y>=BASE_TOP && launcherBounds.x===0 && launcherBounds.width===launcherW && launcherBounds.y+launcherBounds.height===launcherH-STATUS_H, JSON.stringify({launcherBounds,launcherW,launcherH}));
  await command('catalog');
  stage('launcher-boundary');
  check('uBlock Origin extension package loaded', adblockStatus.loaded===true && adblockStatus.name==='uBlock Origin' && /^\d+(?:\.\d+)+$/.test(String(adblockStatus.version||'')), JSON.stringify(adblockStatus));
  const adTest=adblockManager?.testDecision('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',{resourceType:'script',referrer:'https://www.planetminecraft.com/'});
  check('uBlock network filtering verified', adblockStatus.filteringVerified===true && Number(adblockStatus.ruleCount)>50000 && adTest?.block===true, JSON.stringify({status:adblockStatus,test:adTest}));
  const rustNativeStatus=rustHttp.status(),impitNativeStatus=impitHttp3.status();
  check('vendored Rust live-media transport loads', rustNativeStatus.available===true && /wreq-js 3\.2\.0/.test(String(rustNativeStatus.engine||'')) && /^chrome_\d+$/.test(String(rustNativeStatus.profile||'')), JSON.stringify(rustNativeStatus));
  check('vendored impit HTTP3 transport loads', impitNativeStatus.available===true && /impit 0\.14\.4/.test(String(impitNativeStatus.engine||'')) && impitNativeStatus.browser==='chrome151' && impitNativeStatus.http3===true, JSON.stringify(impitNativeStatus));
  const hangarApi=apiDescriptorForUrl('https://hangar.papermc.io/ViaVersion/ViaVersion'),spigotApi=apiDescriptorForUrl('https://www.spigotmc.org/resources/worldedit.53036/'),builtPolicy=transportPolicy('builtbybit');
  check('universal provider fast lane registry', allProviderOriginHints().length>=30 && providerForUrl('https://www.nexusmods.com/minecraft/mods/123')==='nexusmods' && providerForUrl('https://www.moddb.com/mods/example')==='moddb', JSON.stringify({origins:allProviderOriginHints().length}));
  check('public metadata API seed routes', /hangar\.papermc\.io\/api\/v1\/projects\/ViaVersion/.test(hangarApi?.apiUrl||'') && /api\.spiget\.org\/v2\/resources\/53036/.test(spigotApi?.apiUrl||''), JSON.stringify({hangarApi,spigotApi}));
  check('browser-only marketplace policy', builtPolicy?.browserOnly===true && builtPolicy.browserNavigationOnly===true && builtPolicy.disabled.has('node') && builtPolicy.disabled.has('chromium') && builtPolicy.disabled.has('wreq') && builtPolicy.disabled.has('impit'), JSON.stringify({browserOnly:builtPolicy?.browserOnly}));
  check('catalog and live discovery share Chromium session', catalogView?.webContents?.session===liveNetworkSession(), 'catalog image cache/preconnect partition mismatch');
  stage('catalog-preflight');
  const dragUi = await win.webContents.executeJavaScript(`(() => {
    const overlay=document.getElementById('dropOverlay'), form=document.getElementById('addressForm'), address=document.getElementById('address');
    if(!overlay||!form||!address)return {present:false};
    overlay.hidden=false; address.value=''; form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    const style=getComputedStyle(overlay), toolbar=getComputedStyle(document.querySelector('.toolbar'));
    return {present:true,hiddenAfterDirectSubmit:overlay.hidden,dropBackdrop:style.backdropFilter||style.webkitBackdropFilter||'',dropBottom:style.bottom,toolbarBackdrop:toolbar.backdropFilter||toolbar.webkitBackdropFilter||''};
  })()`, true);
  check('direct navigation clears stale drag overlay', dragUi?.present===true && dragUi?.hiddenAfterDirectSubmit===true, JSON.stringify(dragUi));
  check('drop indicator cannot blur browser chrome', /none|^$/i.test(dragUi?.dropBackdrop||''), JSON.stringify(dragUi));
  stage('catalog-shell-checks');
  let center = catalogStore.summary();
  check('catalog registry seeds', center.catalogs.length >= 2, JSON.stringify(center.catalogs.map(x=>[x.id,x.entries])));
  const variety = center.catalogs.find(x=>x.id==='mob-variety');
  check('Mob Variety seed', variety?.entries===293 && variety?.assets===293 && variety?.collections===19, JSON.stringify(variety));
  await catalogStore.activate('mob-girl');
  await new Promise(resolve => setTimeout(resolve, 180));
  stage('catalog-switched');
  center = catalogStore.summary();
  const girl = center.catalogs.find(x=>x.id==='mob-girl');
  check('Mob Girl hot switch', center.activeCatalogId==='mob-girl' && girl?.entries===312, JSON.stringify(girl));
  const catalogTest = await catalogView.webContents.executeJavaScript(`(() => {
    try { return window.__mobExplorerTest ? window.__mobExplorerTest() : ({passed:false,tests:[{name:'missing self test',ok:false}]}); }
    catch (error) { return {passed:false,error:String(error),stack:String(error?.stack||'')}; }
  })()`, true);
  check('active catalog renderer self-test', catalogTest?.passed===true, JSON.stringify(catalogTest));
  const catalogProjectReceived = launcherView.webContents.executeJavaScript(`new Promise(resolve => {
    let settled=false;
    window.enderloomLauncher.listen('catalog:project', payload => { if(!settled){settled=true;resolve(payload)} });
    setTimeout(() => { if(!settled){settled=true;resolve(null)} }, 2500);
  })`, true);
  const catalogLauncherHandoff = await catalogView.webContents.executeJavaScript(`window.mobCompanion.installToLauncher({
    id:'self-test-sodium',name:'Sodium',urls:['https://modrinth.com/mod/sodium'],
    edition:'Java',type:'mod',loader:'Fabric',minecraftVersions:'1.20.1'
  })`, true);
  const launcherProjectEvent = await catalogProjectReceived;
  check('Catalog project handoff resolves a real Modrinth project', catalogLauncherHandoff?.opened===true && catalogLauncherHandoff?.provider==='modrinth' && catalogLauncherHandoff?.projectId==='sodium' && catalogLauncherHandoff?.kind==='mods', JSON.stringify(catalogLauncherHandoff));
  check('Catalog handoff activates the in-app Mod Manager project workflow', activeId===LAUNCHER_ID && launcherProjectEvent?.projectId==='sodium' && launcherProjectEvent?.title==='Sodium', JSON.stringify({activeId,launcherProjectEvent}));
  await new Promise(resolve => setTimeout(resolve, 180));
  const catalogInstallUi = await launcherView.webContents.executeJavaScript(`({
    dialogTitle:document.querySelector('[role="dialog"] #catalog-install-title')?.textContent?.trim()||'',
    hasInstanceSearch:!![...document.querySelectorAll('input')].find(input=>input.placeholder==='Search instances'),
    bodyText:document.body.innerText
  })`, true);
  check(
    'Catalog handoff renders the multi-instance compatibility picker',
    catalogInstallUi?.dialogTitle==='Install project' && catalogInstallUi?.hasInstanceSearch===true && /compatible instance|Checking every instance/i.test(catalogInstallUi?.bodyText||''),
    JSON.stringify({dialogTitle:catalogInstallUi?.dialogTitle,hasInstanceSearch:catalogInstallUi?.hasInstanceSearch}),
  );
  const catalogResearchReceived = catalogView.webContents.executeJavaScript(`new Promise(resolve => {
    let settled=false;
    const off=window.mobCompanion.onResearch(payload => { if(!settled){settled=true;off();resolve(payload)} });
    setTimeout(() => { if(!settled){settled=true;off();resolve(null)} }, 2500);
  })`, true);
  const catalogResearchOpened = await launcherView.webContents.executeJavaScript(`window.enderloomLauncher.openCatalogResearch({
    query:'Sodium',provider:'modrinth',projectId:'sodium',kind:'mods'
  })`, true);
  const catalogResearchEvent = await catalogResearchReceived;
  const catalogResearchUi = await catalogView.webContents.executeJavaScript(`({query:document.getElementById('searchInput')?.value||'',visible:document.getElementById('results')?.hidden===false})`, true);
  check('installed content can open focused Catalog research', catalogResearchOpened?.opened===true && catalogResearchEvent?.query==='Sodium' && catalogResearchUi?.query==='Sodium' && activeId===CATALOG_ID, JSON.stringify({catalogResearchOpened,catalogResearchEvent,catalogResearchUi,activeId}));
  const galleryEnhancerTest = await catalogView.webContents.executeJavaScript('window.__mobGalleryEnhancerTest ? window.__mobGalleryEnhancerTest() : ({passed:false})', true);
  check('streaming media enhancer bridge', galleryEnhancerTest?.passed===true && galleryEnhancerTest?.primePipelineAvailable===true && galleryEnhancerTest?.cacheBatchAvailable===true, JSON.stringify(galleryEnhancerTest));
  stage('catalog-renderer');
  const primeRuntime = await catalogView.webContents.executeJavaScript(`new Promise(resolve=>{const key='self-prime-'+Date.now();let first=null;const off=window.mobCompanion.onMedia(p=>{if(p?.key!==key)return;if(p.media&&!first)first=p.media;if(p.done){off();resolve({done:true,first,delivered:p.delivered,elapsedMs:p.elapsedMs})}});window.mobCompanion.primeMedia([{key,urls:['http://127.0.0.1:${port}/'],priority:2000000,context:{projectId:key,title:'Fixture One',author:'Fixture Creator'}}]);setTimeout(()=>{try{off()}catch{}resolve({done:false,first})},3500)})`, true);
  check('main-process streaming media prime runtime', primeRuntime?.done===true && primeRuntime?.first?.gallery?.length>=1, JSON.stringify(primeRuntime));
  stage('media-prime');
  const bokContext={projectId:'bok-self-test',title:"Bok's Banging Butterflies",author:'DocBok',primaryUrl:'https://www.curseforge.com/minecraft/mc-mods/boks-butterflies'};
  const bokLocalGallery=`http://127.0.0.1:${port}/minecraft/mc-mods/boks-butterflies/gallery`;
  const bokDom=await extractCurseForgeGalleryDomQuick(bokLocalGallery,bokContext,{timeoutMs:3600,foreground:true});
  check('CurseForge exact gallery DOM anchor rescue', bokDom?.gallery?.length===11 && bokDom.gallery.every(x=>/media\.forgecdn\.net\/attachments\//.test(x.url)) && !bokDom.gallery.some(x=>/pubg-battlegrounds|ugc-contest/i.test(x.url)), JSON.stringify({count:bokDom?.gallery?.length,urls:bokDom?.gallery?.map(x=>x.url)}));
  stage('gallery-dom');
  const bokFull=await extractCurseForgeGalleryHtmlFull(bokLocalGallery,bokContext,{timeoutMs:3600,bypassCache:true});
  check('CurseForge exact gallery full-HTML live-order rescue', bokFull?.gallery?.length===11 && bokFull.gallery.every(x=>/media\.forgecdn\.net\/attachments\//.test(x.url)) && !bokFull.gallery.some(x=>/pubg-battlegrounds|ugc-contest/i.test(x.url)), JSON.stringify({count:bokFull?.gallery?.length,urls:bokFull?.gallery?.map(x=>x.url)}));
  stage('live-media-fixtures');
  await catalogStore.activate('mob-variety');
  await new Promise(resolve => setTimeout(resolve, 120));
  const t = createBrowserTab(`http://127.0.0.1:${port}/`, true);
  await new Promise(resolve => t.view.webContents.once('did-finish-load', resolve));
  const prefs = t.view.webContents.getLastWebPreferences();
  check('sandboxed remote tab', prefs.sandbox === true, JSON.stringify(prefs));
  check('node integration disabled', prefs.nodeIntegration === false, JSON.stringify(prefs));
  check('context isolation', prefs.contextIsolation === true, JSON.stringify(prefs));
  check('TWP translator manager ready', translatorStatus.name==='TWP Engine' && /^10\.2\.1\.0|\d+(?:\.\d+){3}$/.test(String(translatorStatus.upstreamVersion||'')), JSON.stringify(translatorStatus));
  const translatedNodes=await pageTranslator.collect(t.view.webContents);const linkNode=translatedNodes.find(x=>String(x.text).trim()==='new');
  check('TWP isolated-world page collector', translatedNodes.length>=3 && !!linkNode, JSON.stringify({count:translatedNodes.length,linkNode}));
  if(linkNode){await pageTranslator.apply(t.view.webContents,[{id:linkNode.id,text:'translated-new'}]);const painted=await t.view.webContents.executeJavaScript(`document.getElementById('blank')?.textContent||''`,true);check('TWP translated text paint',painted==='translated-new',painted);await pageTranslator.showOriginal(t.view.webContents);const original=await t.view.webContents.executeJavaScript(`document.getElementById('blank')?.textContent||''`,true);check('TWP restore original',original==='new',original);await pageTranslator.showTranslated(t.view.webContents);const restored=await t.view.webContents.executeJavaScript(`document.getElementById('blank')?.textContent||''`,true);check('TWP show translated',restored==='translated-new',restored);}
  check('shell compositor stays active', win.webContents.getBackgroundThrottling() === false, String(win.webContents.getBackgroundThrottling()));
  check('remote tab compositor stays active', t.view.webContents.getBackgroundThrottling() === false, String(t.view.webContents.getBackgroundThrottling()));
  const freshBounds = t.view.getBounds();
  const [selfW,selfH] = win.getContentSize();
  check('fresh tab excludes shell chrome', freshBounds.y >= BASE_TOP && freshBounds.x >= 0 && freshBounds.width <= selfW && freshBounds.height <= selfH - BASE_TOP, JSON.stringify(freshBounds));
  check('fresh tab visible after bounded attach', t.view.getVisible() === true, String(t.view.getVisible()));
  check('inactive catalog native view hidden', catalogView.getVisible() === false, String(catalogView.getVisible()));
  await t.view.webContents.executeJavaScript(`document.getElementById('focusField').focus(); true`, true);
  layoutViews(); scheduleChromeGuard(); await new Promise(resolve => setTimeout(resolve, 360));
  const focusStillOwned = await t.view.webContents.executeJavaScript(`document.activeElement?.id || ''`, true);
  check('browser input survives layout/chrome guard', focusStillOwned === 'focusField', focusStillOwned);
  const fullBrowserBounds=t.view.getBounds();
  check('browser page reserves protected bottom status bar', fullBrowserBounds.y + fullBrowserBounds.height === selfH - STATUS_H, JSON.stringify({bounds:fullBrowserBounds,selfH,status:STATUS_H}));
  await command('statusbar-toggle',{collapsed:true});
  const collapsedBounds=t.view.getBounds(), collapsedStatus=statusView.getBounds();
  check('status bar collapses to slim native rail', statusBarCollapsed===true && collapsedStatus.height===STATUS_COLLAPSED_H && collapsedBounds.y+collapsedBounds.height===selfH-STATUS_COLLAPSED_H, JSON.stringify({collapsedBounds,collapsedStatus}));
  await t.view.webContents.executeJavaScript(`document.getElementById('focusField').focus(); true`, true);
  await command('statusbar-toggle',{collapsed:false});
  const focusAfterStatusToggle=await t.view.webContents.executeJavaScript(`document.activeElement?.id || ''`, true);
  check('status bar toggle does not steal browser input focus', focusAfterStatusToggle==='focusField', focusAfterStatusToggle);
  t.view.webContents.focus();
  await new Promise(resolve => setTimeout(resolve, 80));
  refreshShellChrome();
  const shellChrome = await win.webContents.executeJavaScript(`(() => {
    const title=document.querySelector('.titlebar'), toolbar=document.querySelector('.toolbar'), newTab=document.getElementById('newTab'), address=document.getElementById('address');
    const ok=el=>{if(!el)return false;const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)>0&&r.width>0&&r.height>0};
    return {title:ok(title),toolbar:ok(toolbar),newTab:ok(newTab),address:ok(address),newTabRect:newTab?.getBoundingClientRect()?.toJSON?.()||null};
  })()`, true);
  check('shell chrome remains rendered after remote focus', shellChrome?.title && shellChrome?.toolbar && shellChrome?.newTab && shellChrome?.address, JSON.stringify(shellChrome));
  const focusTab = createBrowserTab(`http://127.0.0.1:${port}/two`, true);
  await new Promise(resolve => focusTab.view.webContents.once('did-finish-load', resolve));
  focusTab.view.webContents.focus();
  await new Promise(resolve => setTimeout(resolve, 180));
  const focusBounds = focusTab.view.getBounds();
  check('second new tab keeps safe native bounds', focusBounds.y >= BASE_TOP && focusBounds.width <= selfW, JSON.stringify(focusBounds));
  check('previous remote tab hidden without reparent churn', t.view.getVisible() === false && focusTab.view.getVisible() === true, JSON.stringify({old:t.view.getVisible(),fresh:focusTab.view.getVisible()}));
  const afterNewTabChildren = win.contentView.children || [];
  check('new tab cannot overtake native chrome overlay', afterNewTabChildren[afterNewTabChildren.length - 1] === chromeView, JSON.stringify({children:afterNewTabChildren.length}));
  check('new tab cannot overtake native bottom status overlay', afterNewTabChildren[afterNewTabChildren.length - 2] === statusView, JSON.stringify({children:afterNewTabChildren.length}));
  const overlayAfterFocus = await chromeView.webContents.executeJavaScript(`(() => {
    const el=document.getElementById('newTab'),r=el?.getBoundingClientRect(),st=el?getComputedStyle(el):null;
    return {visible:!!el&&r.width>0&&r.height>0&&st.display!=='none'&&st.visibility!=='hidden',disabled:!!el?.disabled};
  })()`, true);
  check('new-tab focus leaves overlay controls enabled', overlayAfterFocus?.visible===true && overlayAfterFocus?.disabled===false, JSON.stringify(overlayAfterFocus));
  stage('browser-focus');
  activateTab(t.id);
  await t.view.webContents.loadURL(`http://127.0.0.1:${port}/two`);
  stage('browser-navigation');
  check('navigation', /\/two$/.test(t.view.webContents.getURL()), t.view.webContents.getURL());
  check('back history', navCanBack(t.view.webContents), 'no back history');
  const backNavigation = new Promise(resolve => {
    let timer;
    const complete = () => {
      clearTimeout(timer);
      resolve();
    };
    t.view.webContents.once('did-finish-load', complete);
    timer = setTimeout(complete, 1800);
  });
  navBack(t.view.webContents);
  await backNavigation;
  stage('browser-history');
  check('back works', /\/$/.test(t.view.webContents.getURL()), t.view.webContents.getURL());
  splitMode = true; splitRatio = .61; splitSide = 'catalog-left'; layoutViews();
  check('split mode enabled', splitMode === true);
  const splitG = splitGeometry();
  check('split resize ratio', Math.abs(splitG.ratio - .61) < .03, String(splitG.ratio));
  const splitterBounds=splitterView?.getBounds?.()||{};
  const splitChildren=win.contentView.children||[];
  check('native split rail visible at divider', splitterView?.getVisible?.()===true && splitterBounds.x===splitG.left && splitterBounds.width===DIVIDER_W && splitterBounds.height>100, JSON.stringify(splitterBounds));
  check('native split rail stays above both panes', splitChildren[splitChildren.length-3]===splitterView && splitChildren[splitChildren.length-2]===statusView && splitChildren[splitChildren.length-1]===chromeView, JSON.stringify({children:splitChildren.length}));
  await command('split-resize',{ratio:.64});
  check('native split resize command moves rail continuously', Math.abs(splitGeometry().ratio-.64)<.03 && splitterView.getBounds().x===splitGeometry().left, JSON.stringify({ratio:splitGeometry().ratio,bounds:splitterView.getBounds()}));
  splitRatio=.61;layoutViews();
  splitSide = 'web-left'; layoutViews();
  check('split side swap', splitSide === 'web-left');
  splitSide = 'catalog-left';
  splitWorkspaceId = LAUNCHER_ID; layoutViews();
  const managerSplitBounds = launcherView?.getBounds?.() || {};
  check(
    'Mod Manager and web share the native split workspace',
    launcherView?.getVisible?.() === true && catalogView?.getVisible?.() === false &&
      t.view.getVisible() === true && managerSplitBounds.width === splitGeometry().left,
    JSON.stringify({ managerSplitBounds, webBounds: t.view.getBounds(), splitWorkspaceId }),
  );
  splitWorkspaceId = CATALOG_ID; layoutViews();
  stage('split-layout');
  const quickStarted=Date.now(); const quickMedia=await discoverProjectMedia(`http://127.0.0.1:${port}/`, { force:true, deep:false }); const quickElapsed=Date.now()-quickStarted;
  check('quick live media path', quickMedia.gallery.length >= 1 && quickElapsed < 3000, JSON.stringify({quickElapsed,quickMedia}));
  stage('quick-discovery');
  const media = await discoverProjectMedia(`http://127.0.0.1:${port}/`, { force:true, deep:true });
  check('live gallery discovery', media.gallery.length >= 2, JSON.stringify(media));
  check('live media URLs only', [...media.gallery,media.icon,media.author].filter(Boolean).every(x=>/^https?:\/\//i.test(x.url)) && !JSON.stringify(media).includes('data:image/'), JSON.stringify(media));
  check('live author avatar discovery', /\/author$/.test(media.authorUrl||'') && /\/avatar\.png$/.test(media.author?.url||''), JSON.stringify({authorUrl:media.authorUrl,author:media.author}));
  stage('split-and-discovery');
  const before = tabs.length;
  await t.view.webContents.executeJavaScript(`window.open('http://127.0.0.1:${port}/two','_blank')`);
  await new Promise(resolve => setTimeout(resolve, 220));
  check('target blank becomes tab', tabs.length === before + 1, `${tabs.length}/${before + 1}`);
  const result = { passed: failures.length === 0, failures, electron: process.versions.electron, chromium: process.versions.chrome, tabs: tabs.length };
  console.log('CATALOG_COMPANION_SELF_TEST ' + JSON.stringify(result));
  server.close();
  setTimeout(() => { void shutdownApplication(result.passed ? 0 : 1); }, 50);
}

app.setAppUserModelId('com.herbertofury.enderloom');
app.whenReady().then(async () => {
  setupLauncherAssetProtocol();
  providerParserPool = createProviderParserPool();
  loadMediaCache();
  const live = configureLiveSession();
  // Begin provider/CDN connection establishment from persisted source-grounded metadata
  // before catalog IPC/DOM work starts. The renderer uses this exact persistent session.
  preconnectCachedMediaOrigins();
  // Pre-create a small DOM hedge pool while the catalog is booting so the first visible
  // card never pays WebContentsView construction on its critical path.
  warmMediaViewPool(Math.min(8,MEDIA_VIEW_POOL_MAX));
  translator = createTranslator({liveSession:live,userDataDir:app.getPath('userData'),testMode,onChange:status=>{translatorStatus={...status};if(win&&!win.isDestroyed())publishState();}});
  translatorStatus=translator.status();
  translatorUpdater = createTranslatorUpdater({userDataDir:app.getPath('userData'),translator,testMode,onChange:status=>{translatorUpdateStatus={...status};if(win&&!win.isDestroyed())publishState();}});
  translatorUpdateStatus=translatorUpdater.status();translatorUpdater.schedule();
  adblockManager = createAdblockManager({
    appRoot:ROOT,
    userDataDir:app.getPath('userData'),
    liveSession:live,
    testMode,
    onChange:status => { adblockStatus={...status}; if(win&&!win.isDestroyed())publishState(); }
  });
  adblockStatus = await adblockManager.load();
  adblockManager.schedule();
  catalogStore = new CatalogStore({ rootDir:ROOT, userDataDir:app.getPath('userData'), liveSession:live, testMode });
  await catalogStore.init();
  bindCatalogStoreEvents();
  if (testMode) runSelfTest().catch(err => { console.error(err); void shutdownApplication(1); });
  else { createWindow({ show: true }); restoreSession(); }
}).catch(err => { console.error(err); void shutdownApplication(1); });

let shutdownPromise=null;
let launcherResetInProgress=false;
function shutdownApplication(code=0){
  if(shutdownPromise)return shutdownPromise;
  shutdownPromise=(async()=>{
    mediaPrimeQueue.length=0;
    try { catalogStore?.dispose(); } catch {}
    try { adblockManager?.dispose(); } catch {}
    try { translatorUpdater?.dispose(); } catch {}
    try { translator?.dispose(); } catch {}
    for(const slot of mediaViewPool.splice(0)){try{slot.view?.webContents?.close()}catch{}}
    mediaViewWaiters.length=0;
    await Promise.allSettled([
      launcherService.close(),
      rustHttp.close(),
      impitHttp3.close(),
      providerParserPool?.close(),
    ]);
    app.exit(code);
  })();
  return shutdownPromise;
}
app.on('before-quit', event => { if(!shutdownPromise){event.preventDefault();void shutdownApplication(0);} });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (!win && !testMode) { createWindow({ show: true }); restoreSession(); } });
