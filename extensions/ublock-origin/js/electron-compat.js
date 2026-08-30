/* Minecraft Catalog Companion Electron compatibility layer for the official uBlock Origin Chromium MV2 build.
 * Only fills APIs Electron does not expose. Native supported APIs are never replaced. */
(() => {
  'use strict';
  const c = self.chrome = self.chrome || {};
  const noop = () => {};
  const callback = (args, value) => { const cb=args[args.length-1]; if(typeof cb==='function') queueMicrotask(()=>cb(value)); };
  const makeEvent = () => {
    const listeners=new Set();
    return { addListener(fn){if(typeof fn==='function')listeners.add(fn)}, removeListener(fn){listeners.delete(fn)}, hasListener(fn){return listeners.has(fn)}, hasListeners(){return listeners.size>0}, _emit(...args){for(const fn of [...listeners]){try{fn(...args)}catch{}}} };
  };

  if(!(c.alarms instanceof Object)){
    const alarms=new Map(), onAlarm=makeEvent();
    const cancel=name=>{const a=alarms.get(name);if(!a)return false;clearTimeout(a.timer);alarms.delete(name);return true};
    const schedule=(name,info={})=>{
      cancel(name); const now=Date.now(); const period=Number(info.periodInMinutes)>0?Number(info.periodInMinutes)*60000:0;
      const first=Number(info.when)>0?Math.max(0,Number(info.when)-now):Math.max(0,Number(info.delayInMinutes||0)*60000);
      const rec={name,scheduledTime:now+first,periodInMinutes:period?period/60000:undefined,timer:null};
      const fire=()=>{rec.scheduledTime=Date.now();onAlarm._emit({name:rec.name,scheduledTime:rec.scheduledTime,periodInMinutes:rec.periodInMinutes});if(period){rec.scheduledTime=Date.now()+period;rec.timer=setTimeout(fire,period)}else alarms.delete(name)};
      rec.timer=setTimeout(fire,first); alarms.set(name,rec); return rec;
    };
    c.alarms={
      onAlarm,
      create(name,info,cb){ if(typeof name==='object'){cb=info;info=name;name=''} schedule(String(name||''),info||{}); if(typeof cb==='function')queueMicrotask(cb); },
      clear(name,cb){const ok=cancel(String(name||''));if(typeof cb==='function')queueMicrotask(()=>cb(ok));},
      clearAll(cb){for(const name of [...alarms.keys()])cancel(name);if(typeof cb==='function')queueMicrotask(()=>cb(true));},
      get(name,cb){const a=alarms.get(String(name||''));callback([cb],a?{name:a.name,scheduledTime:a.scheduledTime,periodInMinutes:a.periodInMinutes}:undefined);},
      getAll(cb){callback([cb],[...alarms.values()].map(a=>({name:a.name,scheduledTime:a.scheduledTime,periodInMinutes:a.periodInMinutes})));}
    };
  }
  if(!(c.browserAction instanceof Object)) c.browserAction={};
  for(const k of ['setBadgeBackgroundColor','setBadgeText','setIcon','setTitle'])if(typeof c.browserAction[k]!=='function')c.browserAction[k]=function(...args){callback(args)};
  if(!(c.contextMenus instanceof Object))c.contextMenus={};
  c.contextMenus.onClicked=c.contextMenus.onClicked||makeEvent();
  if(typeof c.contextMenus.create!=='function')c.contextMenus.create=function(...args){callback(args);return args[0]?.id||String(Math.random()).slice(2)};
  for(const k of ['remove','removeAll'])if(typeof c.contextMenus[k]!=='function')c.contextMenus[k]=function(...args){callback(args,true)};
  if(!(c.webNavigation instanceof Object))c.webNavigation={};
  if(typeof c.webNavigation.getFrame!=='function')c.webNavigation.getFrame=function(...args){callback(args,null)};
  if(typeof c.webNavigation.getAllFrames!=='function')c.webNavigation.getAllFrames=function(...args){callback(args,[])};
  if(!(c.windows instanceof Object))c.windows={};
  if(typeof c.windows.get!=='function')c.windows.get=function(...args){callback(args,null)};
  if(typeof c.windows.create!=='function')c.windows.create=function(...args){callback(args,null)};
  if(typeof c.windows.update!=='function')c.windows.update=function(...args){callback(args,null)};
  if(!(c.privacy instanceof Object))c.privacy={};
  const makeSetting=()=>({clear(...args){callback(args)},get(...args){callback(args,{value:undefined,levelOfControl:'not_controllable'})},set(...args){callback(args)}});
  for(const category of ['network','websites']){c.privacy[category]=c.privacy[category]||{};}
  c.privacy.network.networkPredictionEnabled=c.privacy.network.networkPredictionEnabled||makeSetting();
  c.privacy.network.webRTCIPHandlingPolicy=c.privacy.network.webRTCIPHandlingPolicy||makeSetting();
  c.privacy.websites.hyperlinkAuditingEnabled=c.privacy.websites.hyperlinkAuditingEnabled||makeSetting();
  if(c.tabs instanceof Object){
    for(const k of ['get','insertCSS','removeCSS','remove'])if(typeof c.tabs[k]!=='function')c.tabs[k]=function(...args){callback(args,k==='get'?null:undefined)};
  }
  if(c.storage?.local && typeof c.storage.local.getBytesInUse!=='function')c.storage.local.getBytesInUse=function(...args){callback(args,0)};
})();
