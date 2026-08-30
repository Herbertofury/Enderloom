'use strict';

function hasMedia(value) {
  return !!(value && (((value.gallery || value.images || []).length) || value.icon || value.author));
}

/**
 * Start every lane immediately. `first` resolves with the first value accepted by
 * `accept`; `settled` resolves only after every lane has completed. The caller can
 * paint from `first` without serialising behind slow enrichment lanes.
 */
function startParallelRace(lanes, options={}) {
  const accept=typeof options.accept==='function'?options.accept:hasMedia;
  const onValue=typeof options.onValue==='function'?options.onValue:()=>{};
  const entries=(Array.isArray(lanes)?lanes:[]).filter(x=>x&&typeof x.run==='function');
  let resolveFirst,firstDone=false;
  const first=new Promise(resolve=>{resolveFirst=resolve});
  if(!entries.length){firstDone=true;resolveFirst(null)}
  const tasks=entries.map(lane=>Promise.resolve().then(()=>lane.run()).then(async value=>{
    if(value!=null){try{await onValue(value,lane.name||'lane')}catch{}}
    if(!firstDone&&accept(value,lane.name||'lane')){firstDone=true;resolveFirst({name:lane.name||'lane',value})}
    return {name:lane.name||'lane',value,error:null};
  },error=>({name:lane.name||'lane',value:null,error})));
  const settled=Promise.all(tasks).then(rows=>{if(!firstDone){firstDone=true;resolveFirst(null)}return rows});
  return {first,settled,tasks};
}

module.exports={hasMedia,startParallelRace};
