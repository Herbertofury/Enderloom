const { contextBridge, ipcRenderer, webUtils } = require('electron');

const listeners = new Map();
function on(channel, cb) {
  const wrapped = (_event, payload) => cb(payload);
  ipcRenderer.on(channel, wrapped);
  if (!listeners.has(cb)) listeners.set(cb, []);
  listeners.get(cb).push([channel, wrapped]);
  return () => ipcRenderer.removeListener(channel, wrapped);
}

contextBridge.exposeInMainWorld('companion', {
  command: (name, payload) => ipcRenderer.invoke('command', { name, payload }),
  onState: cb => on('state', cb),
  onDownload: cb => on('download', cb),
  onPermission: cb => on('permission', cb),
  onFind: cb => on('find-result', cb),
  onStatus: cb => on('status', cb),
  onError: cb => on('page-error', cb),
  answerPermission: payload => ipcRenderer.send('permission:answer', payload),
  filePath: file => webUtils.getPathForFile(file),
  platform: process.platform
});
