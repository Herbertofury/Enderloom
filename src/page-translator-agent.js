'use strict';
const WORLD_ID=1107;

function isolated(wc,code,userGesture=false){
  if(!wc||wc.isDestroyed())return Promise.reject(new Error('No active live page'));
  return wc.executeJavaScriptInIsolatedWorld(WORLD_ID,[{code:String(code)}],!!userGesture);
}
const BOOT=`(()=>{
  const KEY='__MCC_TWP_AGENT__';
  const blocked=new Set(['SCRIPT','STYLE','NOSCRIPT','CODE','PRE','TEXTAREA','INPUT','SELECT','OPTION','SVG','CANVAS']);
  const eligible=node=>{const p=node?.parentElement;if(!p||blocked.has(p.tagName)||p.closest('[contenteditable="true"],script,style,noscript,code,pre,textarea,input,select,option,svg,canvas'))return false;const t=node.nodeValue||'';return /\\S/.test(t)};
  let s=globalThis[KEY];
  if(!s||s.href!==location.href){
    s=globalThis[KEY]={href:location.href,next:1,nodes:new Map(),ids:new WeakMap(),pending:new Set(),original:new Map(),translated:new Map(),applying:false,mode:'original'};
    const add=node=>{if(!eligible(node))return;let id=s.ids.get(node);if(!id){id=s.next++;s.ids.set(node,id);s.nodes.set(id,node);s.original.set(id,node.nodeValue);s.pending.add(id)}return id};
    const scan=root=>{if(!root)return;if(root.nodeType===Node.TEXT_NODE){add(root);return}const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode())add(n)};
    scan(document.body||document.documentElement);
    s.add=add;s.scan=scan;
    s.observer=new MutationObserver(ms=>{if(s.applying)return;for(const m of ms){if(m.type==='characterData'){const n=m.target;if(!eligible(n))continue;let id=s.ids.get(n);if(!id)id=add(n);else{s.original.set(id,n.nodeValue);s.translated.delete(id);s.pending.add(id)}}else for(const n of m.addedNodes)scan(n)}});
    s.observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
  }
  return true;
})()`;
async function boot(wc){return isolated(wc,BOOT)}
async function collect(wc){await boot(wc);return isolated(wc,`(()=>{const s=globalThis.__MCC_TWP_AGENT__;const out=[];for(const id of [...s.pending]){const n=s.nodes.get(id);if(!n||!n.isConnected){s.pending.delete(id);continue}const text=n.nodeValue||'';if(!/\\S/.test(text)){s.pending.delete(id);continue}out.push({id,text});}return out})()`)}
async function apply(wc,rows){if(!rows?.length)return 0;await boot(wc);const payload=JSON.stringify(rows.map(x=>({id:Number(x.id),text:String(x.text??'')})));return isolated(wc,`(()=>{const s=globalThis.__MCC_TWP_AGENT__,rows=${payload};let n=0;s.applying=true;try{for(const r of rows){const node=s.nodes.get(r.id);if(!node||!node.isConnected)continue;s.translated.set(r.id,r.text);node.nodeValue=r.text;s.pending.delete(r.id);n++}s.mode='translated';s.observer?.takeRecords?.()}finally{s.applying=false}return n})()`)}
async function showOriginal(wc){await boot(wc);return isolated(wc,`(()=>{const s=globalThis.__MCC_TWP_AGENT__;let n=0;s.applying=true;try{for(const [id,node] of s.nodes){if(!node?.isConnected)continue;const v=s.original.get(id);if(v!=null){node.nodeValue=v;n++}}s.mode='original';s.observer?.takeRecords?.()}finally{s.applying=false}return n})()`)}
async function showTranslated(wc){await boot(wc);return isolated(wc,`(()=>{const s=globalThis.__MCC_TWP_AGENT__;let n=0;s.applying=true;try{for(const [id,node] of s.nodes){if(!node?.isConnected)continue;if(s.translated.has(id)){node.nodeValue=s.translated.get(id);n++}}s.mode='translated';s.observer?.takeRecords?.()}finally{s.applying=false}return n})()`)}
async function selection(wc){return isolated(wc,`(()=>String(globalThis.getSelection?.()?.toString?.()||''))()`,true)}
async function status(wc){try{await boot(wc);return await isolated(wc,`(()=>{const s=globalThis.__MCC_TWP_AGENT__;return {mode:s.mode,total:s.nodes.size,translated:s.translated.size,pending:s.pending.size}})()`)}catch{return {mode:'unavailable',total:0,translated:0,pending:0}}}
async function translatePage(wc,translator,{service,targetLanguage,sourceLanguage='auto'}={}){
  const entries=await collect(wc);if(!entries.length){await showTranslated(wc);return {translated:0,total:(await status(wc)).total,service,targetLanguage,cachedOnly:true}}
  const texts=entries.map(x=>x.text);let painted=0;
  const rows=await translator.translateTexts({service,sourceLanguage,targetLanguage,texts,onChunk:async(indexes,chunk)=>{const payload=indexes.map((sourceIndex,i)=>({id:entries[sourceIndex].id,text:chunk[i]?.text??texts[sourceIndex]}));painted+=await apply(wc,payload)}});
  // A cache-only call has no network chunks; apply those results here.
  if(painted<entries.length){const payload=entries.map((e,i)=>({id:e.id,text:rows[i]?.text??e.text}));painted=await apply(wc,payload)}
  const st=await status(wc);return {translated:painted,total:st.total,pending:st.pending,service,targetLanguage,mode:st.mode};
}
async function translateSelection(wc,translator,opts={}){const source=await selection(wc);if(!source.trim())return {source:'',translated:''};const [row]=await translator.translateTexts({...opts,texts:[source]});return {source,translated:row?.text||source,detectedLanguage:row?.detectedLanguage||'und'};}
module.exports={WORLD_ID,boot,collect,apply,showOriginal,showTranslated,selection,status,translatePage,translateSelection};
