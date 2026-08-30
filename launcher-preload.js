'use strict';

const { contextBridge, ipcRenderer, webUtils } = require('electron');

const listeners = new Map();
let nextListener = 1;
function subscribe(event, callback) {
  const id = nextListener++;
  const wrapped = (_ipcEvent, message) => {
    if (message?.event === event) callback(message.payload);
  };
  listeners.set(id, wrapped);
  ipcRenderer.on('launcher:event', wrapped);
  return () => {
    const current = listeners.get(id);
    if (current) ipcRenderer.removeListener('launcher:event', current);
    listeners.delete(id);
  };
}

const dropListeners = new Map();
let nextDropListener = 1;
function sendDrop(payload) {
  for (const callback of dropListeners.values()) callback(payload);
}
window.addEventListener('dragover', (event) => {
  if (!event.dataTransfer?.types?.includes('Files')) return;
  event.preventDefault();
  sendDrop({ type: 'over', paths: [] });
});
window.addEventListener('dragleave', (event) => {
  if (!event.dataTransfer?.types?.includes('Files')) return;
  sendDrop({ type: 'leave', paths: [] });
});
window.addEventListener('drop', (event) => {
  if (!event.dataTransfer?.types?.includes('Files')) return;
  event.preventDefault();
  const paths = [...event.dataTransfer.files]
    .map((file) => webUtils.getPathForFile(file))
    .filter(Boolean);
  sendDrop({ type: 'drop', paths });
});

contextBridge.exposeInMainWorld('enderloomLauncher', {
  embedded: true,
  invoke: (command, args) => ipcRenderer.invoke('launcher:invoke', { command, args }),
  listen: async (event, callback) => subscribe(String(event), callback),
  openDialog: (options) => ipcRenderer.invoke('launcher:open-dialog', options),
  saveDialog: (options) => ipcRenderer.invoke('launcher:save-dialog', options),
  openExternal: (url) => ipcRenderer.invoke('launcher:open-external', url),
  openCatalogResearch: (request) => ipcRenderer.invoke('launcher:open-catalog-research', {
    query: String(request?.query || '').slice(0, 256),
    provider: String(request?.provider || '').slice(0, 32),
    projectId: String(request?.projectId || '').slice(0, 128),
    kind: String(request?.kind || '').slice(0, 32),
  }),
  revealInFolder: (filePath) => ipcRenderer.invoke('launcher:reveal', filePath),
  assetUrl: (filePath) =>
    `enderloom-asset://local/${Buffer.from(String(filePath), 'utf8').toString('base64url')}`,
  windowCommand: (command, payload) =>
    ipcRenderer.invoke('launcher:window-command', { command, payload }),
  onDragDrop: async (callback) => {
    const id = nextDropListener++;
    dropListeners.set(id, callback);
    return () => dropListeners.delete(id);
  },
});
