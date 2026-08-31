'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('enderloomDetached',{
  command:(action,payload={})=>ipcRenderer.invoke('detached:command',{action,...payload}),
  onState:callback=>{const handler=(_event,state)=>callback(state);ipcRenderer.on('detached:state',handler);return()=>ipcRenderer.removeListener('detached:state',handler)}
});
