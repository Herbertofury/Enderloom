const { contextBridge, ipcRenderer } = require('electron');

const safe = value => typeof value === 'string' ? value : '';
contextBridge.exposeInMainWorld('mobCompanion', {
  openHere: url => ipcRenderer.send('catalog:open-here', safe(url)),
  openExternal: url => ipcRenderer.send('catalog:open-external', safe(url)),
  openMany: (urls, title) => ipcRenderer.send('catalog:open-many', { urls: Array.isArray(urls) ? urls : [], title: safe(title) }),
  copyUrl: url => ipcRenderer.send('catalog:copy-url', safe(url)),
  discoverGallery: url => ipcRenderer.invoke('catalog:discover-gallery', safe(url)),
  discoverHeadMedia: (url, context = {}) => ipcRenderer.invoke('catalog:discover-head-media', { url: safe(url), context: context && typeof context === 'object' ? context : {} }),
  discoverMedia: (url, force = false, deep = false, context = {}) => ipcRenderer.invoke('catalog:discover-media', { url: safe(url), force: !!force, deep: !!deep, context: context && typeof context === 'object' ? context : {} }),
  cachedMedia: (url, context = {}) => ipcRenderer.invoke('catalog:cached-media', { url: safe(url), context: context && typeof context === 'object' ? context : {} }),
  cachedMediaBatch: requests => ipcRenderer.invoke('catalog:cached-media-batch', (Array.isArray(requests)?requests:[]).map(req=>({ key:safe(req?.key), url:safe(req?.url), context:req?.context&&typeof req.context==='object'?req.context:{} }))),
  primeMedia: requests => ipcRenderer.send('catalog:prime-media', (Array.isArray(requests)?requests:[]).map(req=>({ key:safe(req?.key), urls:(Array.isArray(req?.urls)?req.urls:[]).map(safe).filter(Boolean), priority:Number(req?.priority)||0, context:req?.context&&typeof req.context==='object'?req.context:{} }))),
  reprioritizeMedia: (key, priority) => ipcRenderer.send('catalog:reprioritize-media', { key:safe(key), priority:Number(priority)||0 }),
  onMedia: cb => { const fn=(_e,payload)=>cb(payload);ipcRenderer.on('catalog:media-result',fn);return()=>ipcRenderer.removeListener('catalog:media-result',fn); },
  onResearch: cb => { const fn=(_e,payload)=>cb(payload);ipcRenderer.on('catalog:research',fn);return()=>ipcRenderer.removeListener('catalog:research',fn); },
  visited: id => ipcRenderer.send('catalog:visited', safe(id)),
  installToLauncher: project => ipcRenderer.invoke('catalog:install-to-launcher', {
    id: safe(project?.id).slice(0, 256),
    name: safe(project?.name).slice(0, 256),
    urls: (Array.isArray(project?.urls) ? project.urls : []).map(safe).filter(Boolean).slice(0, 16),
    edition: safe(project?.edition).slice(0, 80),
    type: safe(project?.type).slice(0, 80),
    loader: safe(project?.loader).slice(0, 160),
    minecraftVersions: safe(project?.minecraftVersions).slice(0, 256),
  })
});

window.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', event => {
    const a = event.target.closest?.('a[href]');
    if (!a) return;
    const href = a.href || '';
    if (!/^https?:\/\//i.test(href)) return;
    event.preventDefault();
    if (event.shiftKey) ipcRenderer.send('catalog:open-external', href);
    else ipcRenderer.send('catalog:open-here', href);
  }, true);
});
