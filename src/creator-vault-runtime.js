'use strict';

const {
  configureUserDataDir,
  readRuntimeState,
  loadMergedCreatorVault,
  runtimeStatus,
} = require('./creator-vault-auto/state');
const { setElectronApi } = require('./creator-vault-auto/browser');
const runtime = require('./creator-vault-auto/runtime');

let electron = null;
try {
  const candidate = require('electron');
  if (candidate && typeof candidate === 'object' && candidate.app && candidate.ipcMain) electron = candidate;
} catch {}

let ipcRegistered = false;
let launchScheduled = false;

function configureFromElectron() {
  if (!electron?.app?.isReady?.()) return false;
  configureUserDataDir(electron.app.getPath('userData'));
  setElectronApi(electron);
  return true;
}
function refreshOpenCatalogViews() {
  if (!electron?.webContents?.getAllWebContents) return 0;
  let reloaded = 0;
  for (const contents of electron.webContents.getAllWebContents()) {
    try {
      if (contents.isDestroyed()) continue;
      const url = decodeURIComponent(String(contents.getURL?.() || ''));
      if (!url.startsWith('file:') || !url.includes('/catalog-center/runtime/') || !/\.html(?:[?#].*)?$/i.test(url)) continue;
      contents.reloadIgnoringCache();
      reloaded++;
    } catch {}
  }
  return reloaded;
}
function assertCatalogSender(event) {
  const url = String(event?.sender?.getURL?.() || '');
  if (!url.startsWith('file:')) throw new Error('Creator Vault IPC is only available to Enderloom local catalog views');
}
function registerIpc() {
  if (ipcRegistered || !electron?.ipcMain) return false;
  ipcRegistered = true;
  setElectronApi(electron);
  electron.ipcMain.handle('catalog:creator-vault-status', event => {
    assertCatalogSender(event);
    configureFromElectron();
    return runtime.getStatus();
  });
  electron.ipcMain.handle('catalog:creator-vault-sync', async (event, options={}) => {
    assertCatalogSender(event);
    configureFromElectron();
    const sender = event.sender;
    const progress = payload => {
      try { if (!sender.isDestroyed()) sender.send('catalog:creator-vault-progress', payload); } catch {}
    };
    return runtime.runSync({
      creatorId:String(options?.creatorId || '').trim(),
      full:!!options?.full,
      trigger:'manual',
      maxVideosPerCreator:Number(options?.maxVideosPerCreator) || null,
    }, progress);
  });
  electron.ipcMain.handle('catalog:creator-vault-add', (event, raw={}) => {
    assertCatalogSender(event);
    configureFromElectron();
    return runtime.addCreator(raw);
  });
  electron.ipcMain.handle('catalog:creator-vault-settings', (event, patch={}) => {
    assertCatalogSender(event);
    configureFromElectron();
    return runtime.setSettings(patch);
  });
  electron.ipcMain.handle('catalog:creator-vault-review-ignore', (event, id) => {
    assertCatalogSender(event);
    configureFromElectron();
    return runtime.ignoreReview(String(id || '').trim());
  });
  return true;
}
function launchSyncDisabled() {
  return process.env.CI === 'true'
    || process.env.ENDERLOOM_DISABLE_CREATOR_AUTO_SYNC === '1'
    || process.argv.includes('--self-test')
    || process.argv.includes('--ui-acceptance');
}
function scheduleLaunchSync() {
  if (launchScheduled || !electron?.app || launchSyncDisabled()) return false;
  launchScheduled = true;
  electron.app.whenReady().then(() => {
    configureFromElectron();
    const timer = setTimeout(async () => {
      try {
        const state = readRuntimeState();
        if (!state.settings.autoSyncOnLaunch) return;
        const cooldown = Math.max(1, Number(state.settings.launchCooldownHours) || 12) * 60 * 60 * 1000;
        const last = Date.parse(state.sync.lastSuccessfulRunAt || '') || 0;
        if (Date.now() - last < cooldown) return;
        const result = await runtime.runSync({ full:false, trigger:'launch', maxVideosPerCreator:state.settings.maxIncrementalVideosPerCreator }, null);
        if (Number(result?.refresh?.patched || 0) > 0) refreshOpenCatalogViews();
      } catch (error) {
        console.warn('[Creator Vault] automatic launch sync failed:', String(error?.message || error));
      }
    }, 7500);
    timer.unref?.();
  }).catch(() => {});
  return true;
}
function ensureCreatorVaultRuntimeRegistered() {
  registerIpc();
  scheduleLaunchSync();
  if (electron?.app?.isReady?.()) configureFromElectron();
  else electron?.app?.whenReady?.().then(configureFromElectron).catch(() => {});
  return !!electron;
}

ensureCreatorVaultRuntimeRegistered();

module.exports = {
  loadMergedCreatorVault,
  runtimeStatus,
  ensureCreatorVaultRuntimeRegistered,
  refreshOpenCatalogViews,
  ...runtime,
};
