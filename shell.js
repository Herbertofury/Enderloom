'use strict';
const $ = id => document.getElementById(id);
const nativeChromeOverlay = new URLSearchParams(location.search).get('chrome') === '1';
if (nativeChromeOverlay) document.documentElement.classList.add('native-chrome-overlay');
document.documentElement.classList.add('native-status-managed');
document.documentElement.classList.add('native-splitter-managed');
let appState = null;
let downloadItems = new Map();
let toastTimer = null;
let findActive = false;
let menuOpen = false;
let downloadsOpen = false;
let translatorOpen = false;
let errorOpen = false;
let dragDepth = 0;
let dragOverlayTimer = null;
let draggingTabId = '';
let tabDropHandled = false;

function toast(message) {
  const el = $('toast'); el.textContent = message; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}
function cmd(name, payload={}) { return window.companion.command(name, payload); }
async function action(name, payload={}, success='') {
  try { const result=await cmd(name,payload); if(success)toast(success); return result; }
  catch(err){ toast(err?.message || String(err)); throw err; }
}
function visibleUtilityHeight() {
  if (translatorOpen) return Math.min(190, $('translatorBar').offsetHeight || 190);
  if (downloadsOpen) return Math.min(230, $('downloadsBar').offsetHeight || 230);
  if (findActive || errorOpen) return 42;
  return 0;
}
function syncOverlayExtent(){
  if(!nativeChromeOverlay)return;
  let height=94;
  if(menuOpen)height=430;
  else if(translatorOpen)height=94+Math.min(190,$('translatorBar')?.offsetHeight||190);
  else if(downloadsOpen)height=94+Math.min(230,$('downloadsBar')?.offsetHeight||230);
  else if(findActive||errorOpen)height=136;
  cmd('chrome-overlay-height',{height}).catch(()=>{});
}
function syncInsets() { const h=visibleUtilityHeight(); document.documentElement.style.setProperty('--utility-height', `${h}px`); cmd('utility-height', { height: h }).catch(()=>{}); syncOverlayExtent(); }
function active() { return appState?.active || { id:'catalog', url:'catalog://catalog', title:'Catalog', workspace:true }; }
function activeCatalog(){return appState?.catalog||{id:'catalog',name:'Catalog',entries:0,assets:0,collections:0,sync:{state:'snapshot',label:'Offline snapshot'},sources:[]}}
function safeHost(url) { try { return new URL(url).hostname; } catch { return ''; } }
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function catalogMark(name){const words=String(name||'Catalog').replace(/[^A-Za-z0-9 ]+/g,' ').trim().split(/\s+/).filter(Boolean);return (words.length>1?words.slice(0,2).map(x=>x[0]).join(''):words[0]?.slice(0,2)||'C').toUpperCase()}
function formatWhen(value){if(!value)return 'Not checked yet';const d=new Date(value);return Number.isNaN(d.valueOf())?String(value):d.toLocaleString()}

function renderTabs() {
  const el = $('tabs'); el.innerHTML = '';
  let lastGroup = null;
  for (const tab of appState?.tabs || []) {
    const group=tab.group||'';
    if(group&&group!==lastGroup){const label=document.createElement('span');label.className='tab-group-label';label.textContent=group;label.title=`${group} tab group`;el.appendChild(label)}
    lastGroup=group||null;
    const b = document.createElement('button');
    const splitCompanion = !!appState.splitMode && tab.id === appState.splitWorkspaceId;
    b.className = 'tab' + (tab.id === appState.activeId ? ' active' : '') + (splitCompanion ? ' split-companion' : '') + (tab.catalog ? ' catalog-tab' : '') + (tab.launcher ? ' launcher-tab' : '') + (tab.detached?' detached':'');
    b.dataset.id = tab.id; b.setAttribute('role','tab'); b.setAttribute('aria-selected', tab.id === appState.activeId ? 'true':'false');
    b.draggable=true;b.title=tab.detached?`${tab.title} · in its own window · right-click for options`:`${tab.title} · drag to reorder or pull out · right-click for groups`;
    const icon = document.createElement('span'); icon.className='tab-icon';
    if (tab.favicon && !tab.catalog) { const img=document.createElement('img'); img.src=tab.favicon; img.alt=''; icon.appendChild(img); }
    else icon.textContent = tab.catalog ? '✦' : tab.launcher ? '◈' : '◆';
    const title = document.createElement('span'); title.className='tab-title'; title.textContent=tab.title || (tab.catalog?'Catalog':'New tab');
    b.append(icon,title);
    if(tab.detached){const pop=document.createElement('span');pop.className='tab-popout';pop.textContent='↗';b.appendChild(pop)}
    if (!tab.catalog && !tab.launcher) { const x=document.createElement('span'); x.className='tab-close'; x.textContent='×'; x.title='Close tab'; b.appendChild(x); }
    el.appendChild(b);
  }
}
function clearTabDropMarks(){$('tabs').querySelectorAll('.drop-before').forEach(tab=>tab.classList.remove('drop-before'))}
function bindTabDragging(){
  const el=$('tabs');
  el.addEventListener('dragstart',event=>{const tab=event.target.closest('.tab');if(!tab)return;draggingTabId=tab.dataset.id||'';tabDropHandled=false;tab.classList.add('dragging');event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('application/x-enderloom-tab',draggingTabId);event.dataTransfer.setData('text/plain',draggingTabId)});
  el.addEventListener('dragover',event=>{if(!draggingTabId)return;event.preventDefault();event.dataTransfer.dropEffect='move';clearTabDropMarks();const target=event.target.closest('.tab');if(target&&target.dataset.id!==draggingTabId)target.classList.add('drop-before')});
  el.addEventListener('drop',event=>{if(!draggingTabId)return;event.preventDefault();tabDropHandled=true;const target=event.target.closest('.tab');cmd('reorder-tab',{id:draggingTabId,beforeId:target?.dataset.id||''}).catch(()=>{});clearTabDropMarks()});
  el.addEventListener('dragend',event=>{const id=draggingTabId;draggingTabId='';event.target.closest('.tab')?.classList.remove('dragging');clearTabDropMarks();const bounds=el.getBoundingClientRect(),inside=event.clientX>=bounds.left&&event.clientX<=bounds.right&&event.clientY>=bounds.top&&event.clientY<=bounds.bottom;if(id&&!tabDropHandled&&!inside)cmd('detach-tab',{id}).catch(()=>{});tabDropHandled=false});
}
function renderCatalogPicker(){
  const select=$('catalogSelect'); const before=select.value;
  select.innerHTML='';
  for(const c of appState?.catalogs||[]){const o=document.createElement('option');o.value=c.id;o.textContent=`${c.name} (${c.entries})`;select.appendChild(o)}
  select.value=appState?.activeCatalogId||activeCatalog().id||before;
  const c=activeCatalog(), launcher=appState?.activeId==='launcher'||(appState?.splitMode&&appState?.splitWorkspaceId==='launcher');
  $('brandName').textContent=launcher?'Enderloom':c.name||'Catalog';
  $('brandMark').textContent=launcher?'EL':catalogMark(c.name);
  select.disabled=launcher;
  $('catalogRefresh').disabled=launcher;
}
function renderState(state) {
  clearDropOverlay();
  appState = state;
  renderTabs(); renderCatalogPicker();
  const a = active(); const c=activeCatalog(); const catalog = a.id === 'catalog'; const launcher=a.id==='launcher'; const workspace=catalog||launcher;
  $('address').value = workspace ? '' : a.url || '';
  $('address').placeholder = launcher ? 'Mod Manager · instances, content, accounts, servers and diagnostics' : catalog ? `Search ${c.name||'the catalog'} with / or Ctrl+K` : 'Search the web or enter an address';
  $('back').disabled = workspace || !a.canBack; $('forward').disabled = workspace || !a.canForward;
  $('reload').textContent = a.loading ? '×' : '↻'; $('reload').title = a.loading ? 'Stop' : 'Reload · Ctrl+R';
  const browserTabs=(state.tabs||[]).filter(tab=>!tab.catalog&&!tab.launcher);
  $('external').disabled = workspace; $('copyUrl').disabled = workspace; $('findToggle').disabled = workspace; $('translatorToggle').disabled=workspace; $('split').disabled = workspace && browserTabs.length===0;
  $('securityMark').textContent = catalog ? '✦' : launcher ? '◈' : (String(a.url).startsWith('https:') ? '◆' : '◇');
  $('securityMark').className = 'security-mark ' + (workspace ? 'local' : String(a.url).startsWith('https:') ? 'secure' : 'plain');
  $('statusText').textContent = launcher ? `Mod Manager · Rust ${state.launcherService?.state||'starting'}` : catalog ? `${c.name||'Catalog'} · ${c.sync?.label||'snapshot ready'}` : (a.loading ? `Loading ${safeHost(a.url)}…` : `${safeHost(a.url)} · ready`);
  $('statusDot').className='status-dot '+(c.sync?.state==='error'?'attention':c.sync?.state==='watching'?'watching':'');
  const splitPct=Math.round((state.splitRatio||.46)*100);
  const splitWorkspace=state.splitWorkspaceId==='launcher'?'Mod Manager':'Catalog';
  $('splitStatus').textContent = state.splitMode ? `${state.splitSide==='web-left'?'Web':splitWorkspace} ${splitPct}% · ${state.splitSide==='web-left'?splitWorkspace:'Web'} ${100-splitPct}%` : 'Full view';
  const divider=$('splitDivider'); divider.hidden=!state.splitMode;
  if(state.splitMode){divider.style.left=`${Math.round(state.splitDividerX||window.innerWidth*(state.splitRatio||.46))}px`;divider.setAttribute('aria-valuenow',String(splitPct));divider.setAttribute('aria-valuetext',`${splitPct}% left pane`);divider.dataset.side=state.splitSide||'catalog-left';}
  $('splitSwap').disabled=!state.splitMode; $('splitReset').disabled=!state.splitMode;
  $('runtimeStatus').textContent = state.runtime || 'Chromium';
  $('statusBarToggle').textContent = state.statusBarCollapsed ? 'Expand bottom status bar' : 'Collapse bottom status bar';
  $('catalogStatus').textContent = (launcher||state.splitWorkspaceId==='launcher'&&state.splitMode) ? `Enderloom core ${state.launcherService?.version||'1.0.0'} · ${state.launcherService?.state||'starting'}` : `${c.entries||0} entries · ${c.assets||0} live-media projects · ${c.sync?.label||'snapshot'}`;
  document.body.classList.toggle('split-active', !!state.splitMode); $('zoomReset').textContent = `${Math.round((a.zoom||1)*100)}%`;
  const tr=state.translator||{}; $('translatorService').value=tr.service||'bing'; $('translatorTarget').value=tr.targetLanguage||'en'; $('translatorAuto').checked=!!tr.autoForActive; $('translatorVersion').textContent=`upstream ${tr.upstreamVersion||'10.2.1.0'} · ${tr.update?.updateState||'idle'}`; document.body.classList.toggle('translator-active',!!tr.autoForActive);

}
function showMore(force) { menuOpen = force ?? !menuOpen; $('moreMenu').hidden=!menuOpen; if (menuOpen) { downloadsOpen=false; $('downloadsBar').hidden=true; translatorOpen=false; $('translatorBar').hidden=true; } syncInsets(); }
function showDownloads(force) { downloadsOpen = force ?? !downloadsOpen; $('downloadsBar').hidden=!downloadsOpen; if(downloadsOpen){menuOpen=false;$('moreMenu').hidden=true;translatorOpen=false;$('translatorBar').hidden=true;} syncInsets(); }
function showTranslator(force) { translatorOpen = force ?? !translatorOpen; $('translatorBar').hidden=!translatorOpen; if(translatorOpen){menuOpen=false;$('moreMenu').hidden=true;downloadsOpen=false;$('downloadsBar').hidden=true;findActive=false;$('findBar').hidden=true;} syncInsets(); }
function showFind(force) { const next=force ?? !findActive; if(next && translatorOpen) showTranslator(false); findActive=next; $('findBar').hidden=!findActive; if(findActive){$('findInput').focus();$('findInput').select();} else cmd('find',{text:''}).catch(()=>{}); syncInsets(); }
function showError(payload) { errorOpen=true; $('errorBar').hidden=false; $('errorText').textContent=`${payload.description||'Navigation error'} (${payload.code||''})`; $('errorBar').dataset.url=payload.url||''; syncInsets(); }
function hideError(){errorOpen=false;$('errorBar').hidden=true;syncInsets();}
function renderDownloads() {
  const list=$('downloadList'); const items=[...downloadItems.values()].reverse();
  if(!items.length){list.innerHTML='<div class="empty-utility">Downloads from live project pages appear here.</div>';return;}
  list.innerHTML='';
  for(const d of items){
    const row=document.createElement('button'); row.className='download-row'; row.dataset.path=d.savePath||'';
    const total=d.total||0, rec=d.received||0, pct=total?Math.min(100,Math.round(rec/total*100)):0;
    row.innerHTML=`<span class="download-icon">${d.state==='completed'?'✓':d.state==='cancelled'||d.state==='interrupted'?'!':'⇩'}</span><span class="download-copy"><strong></strong><small></small><i style="--progress:${pct}%"></i></span>`;
    row.querySelector('strong').textContent=d.filename||'Download'; row.querySelector('small').textContent=d.state==='progressing'?`${pct}% · ${formatBytes(rec)} / ${formatBytes(total)}`:d.state;
    list.appendChild(row);
  }
}
function formatBytes(n){if(!n)return '0 B';const u=['B','KB','MB','GB'];let i=0,v=n;while(v>=1024&&i<u.length-1){v/=1024;i++}return `${v.toFixed(i?1:0)} ${u[i]}`}


function bindSplitter(){
  const divider=$('splitDivider'); let dragging=false, raf=0, pendingRatio=.46;
  const sendRatio=()=>{raf=0;cmd('split-resize',{ratio:pendingRatio}).catch(()=>{})};
  const update=e=>{if(!dragging)return;const usable=Math.max(1,window.innerWidth-(appState?.splitDividerWidth||10));pendingRatio=Math.max(.08,Math.min(.92,e.clientX/usable));divider.style.left=`${Math.round(e.clientX)}px`;if(!raf)raf=requestAnimationFrame(sendRatio)};
  divider.addEventListener('pointerdown',e=>{if(e.button!==0)return;dragging=true;divider.classList.add('dragging');document.body.classList.add('split-dragging');divider.setPointerCapture?.(e.pointerId);e.preventDefault()});
  divider.addEventListener('pointermove',update);
  const finish=e=>{if(!dragging)return;dragging=false;divider.classList.remove('dragging');document.body.classList.remove('split-dragging');try{divider.releasePointerCapture?.(e.pointerId)}catch{};if(raf){cancelAnimationFrame(raf);raf=0;cmd('split-resize',{ratio:pendingRatio}).catch(()=>{})}};
  divider.addEventListener('pointerup',finish);divider.addEventListener('pointercancel',finish);
  divider.addEventListener('dblclick',e=>{e.preventDefault();cmd('split-reset').catch(()=>{});toast('Split reset to 50 / 50')});
  divider.addEventListener('contextmenu',e=>{e.preventDefault();cmd('split-swap').catch(()=>{});toast('Split sides swapped')});
  divider.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const step=e.shiftKey?.08:.025;const ratio=(appState?.splitRatio||.5)+(e.key==='ArrowRight'?step:-step);cmd('split-resize',{ratio}).catch(()=>{})}else if(e.key==='Home'){e.preventDefault();cmd('split-resize',{ratio:.25}).catch(()=>{})}else if(e.key==='End'){e.preventDefault();cmd('split-resize',{ratio:.75}).catch(()=>{})}else if(e.key==='Enter'){e.preventDefault();cmd('split-swap').catch(()=>{})}});
}
function clearDropOverlay(){
  dragDepth=0;
  clearTimeout(dragOverlayTimer); dragOverlayTimer=null;
  const overlay=$('dropOverlay'); if(overlay) overlay.hidden=true;
  document.documentElement.classList.remove('file-drag-active');
}
function keepDropOverlayAlive(){
  clearTimeout(dragOverlayTimer);
  dragOverlayTimer=setTimeout(clearDropOverlay,450);
}
function bindDrop(){
  const overlay=$('dropOverlay');
  const hasFiles=e=>Array.from(e.dataTransfer?.types||[]).includes('Files');
  window.addEventListener('dragenter',e=>{if(!hasFiles(e))return;e.preventDefault();dragDepth++;overlay.hidden=false;document.documentElement.classList.add('file-drag-active');keepDropOverlayAlive()});
  window.addEventListener('dragover',e=>{if(!hasFiles(e))return;e.preventDefault();e.dataTransfer.dropEffect='copy';overlay.hidden=false;keepDropOverlayAlive()});
  window.addEventListener('dragleave',e=>{if(!hasFiles(e))return;dragDepth=Math.max(0,dragDepth-1);if(!dragDepth)clearDropOverlay();else keepDropOverlayAlive()});
  window.addEventListener('drop',async e=>{if(!hasFiles(e))return;e.preventDefault();clearDropOverlay();const paths=[...e.dataTransfer.files].map(f=>window.companion.filePath(f)).filter(Boolean);if(!paths.length)return;try{await action('catalog-import-paths',{paths,mode:'smart'},`Ingested ${paths.length} source${paths.length===1?'':'s'}`)}catch{}});
  window.addEventListener('dragend',clearDropOverlay,true);
  window.addEventListener('blur',()=>setTimeout(clearDropOverlay,0));
  window.addEventListener('pageshow',clearDropOverlay);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible')clearDropOverlay()});
  document.addEventListener('pointerdown',clearDropOverlay,true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')clearDropOverlay()},true);
}

function bind(){
  $('tabs').onclick=e=>{const close=e.target.closest('.tab-close'),tab=e.target.closest('.tab');if(!tab)return;if(close){e.stopPropagation();cmd('close-tab',{id:tab.dataset.id}).catch(()=>{})}else cmd('activate',{id:tab.dataset.id}).catch(()=>{})};
  $('tabs').oncontextmenu=e=>{const tab=e.target.closest('.tab');if(!tab)return;e.preventDefault();cmd('tab-menu',{id:tab.dataset.id,x:e.clientX,y:e.clientY}).catch(()=>{})};
  bindTabDragging();
  $('newTab').onclick=()=>cmd('new-tab').catch(()=>{}); $('reopenTab').onclick=()=>cmd('reopen-tab').catch(()=>{}); $('catalogButton').onclick=()=>cmd('catalog').catch(()=>{}); $('launcherButton').onclick=()=>cmd('launcher').catch(()=>{});
  $('catalogSelect').onchange=e=>action('catalog-activate',{id:e.target.value},`Switched to ${e.target.selectedOptions[0]?.textContent||'catalog'}`).catch(()=>{});
  $('catalogRefresh').onclick=async()=>{const b=$('catalogRefresh');b.disabled=true;try{await action('catalog-refresh',{},'Catalog sources checked')}finally{b.disabled=false}};
  $('back').onclick=()=>cmd('back').catch(()=>{}); $('forward').onclick=()=>cmd('forward').catch(()=>{}); $('reload').onclick=()=>{hideError();cmd('reload').catch(()=>{})};
  $('addressForm').onsubmit=e=>{e.preventDefault();clearDropOverlay();const v=$('address').value.trim();if(v)cmd('navigate',{value:v}).catch(()=>{})}; $('address').onfocus=e=>e.target.select();
  $('split').onclick=()=>cmd('split').catch(()=>{}); $('popout').onclick=()=>cmd('detach-tab',{id:active().id}).catch(()=>{}); $('translatorToggle').onclick=()=>showTranslator(); $('external').onclick=()=>cmd('external').catch(()=>{}); $('copyUrl').onclick=async()=>{await cmd('copy-url');toast('URL copied')};
  $('findToggle').onclick=()=>showFind(); $('findClose').onclick=()=>showFind(false); $('findInput').oninput=e=>cmd('find',{text:e.target.value,forward:true,findNext:false}).catch(()=>{});
  $('findNext').onclick=()=>cmd('find',{text:$('findInput').value,forward:true,findNext:true}).catch(()=>{}); $('findPrev').onclick=()=>cmd('find',{text:$('findInput').value,forward:false,findNext:true}).catch(()=>{});
  $('translatorService').onchange=()=>cmd('translator-config',{service:$('translatorService').value,targetLanguage:$('translatorTarget').value}).catch(()=>{}); $('translatorTarget').onchange=()=>cmd('translator-config',{service:$('translatorService').value,targetLanguage:$('translatorTarget').value}).catch(()=>{});
  $('translatorPage').onclick=async()=>{const b=$('translatorPage');b.disabled=true;try{const r=await cmd('translator-page',{service:$('translatorService').value,targetLanguage:$('translatorTarget').value});toast(`Translated ${r?.translated||0} page segments`)}catch(e){toast(e?.message||String(e))}finally{b.disabled=false}};
  $('translatorOriginal').onclick=()=>cmd('translator-original').catch(e=>toast(e?.message||String(e))); $('translatorTranslated').onclick=()=>cmd('translator-translated').catch(e=>toast(e?.message||String(e)));
  $('translatorSelection').onclick=async()=>{try{const r=await cmd('translator-selection',{service:$('translatorService').value,targetLanguage:$('translatorTarget').value});if(r?.translated){await navigator.clipboard.writeText(r.translated);toast('Selection translated and copied')}}catch(e){toast(e?.message||String(e))}};
  $('translatorAuto').onchange=async e=>{try{const r=await cmd('translator-auto-site',{enabled:e.target.checked});toast(r?.enabled?'Auto-translate enabled for this site':'Auto-translate disabled')}catch(err){e.target.checked=!e.target.checked;toast(err?.message||String(err))}};
  const updateTranslator=async()=>{try{const r=await cmd('translator-update');toast(r?.message||'Translator update check complete')}catch(e){toast(e?.message||String(e))}}; $('translatorUpdate').onclick=updateTranslator;
  $('downloadsToggle').onclick=()=>showDownloads(); $('downloadsFolder').onclick=()=>cmd('downloads-folder').catch(()=>{}); $('downloadList').onclick=e=>{const r=e.target.closest('.download-row');if(r?.dataset.path)cmd('open-download',{path:r.dataset.path}).catch(()=>{})};
  $('moreToggle').onclick=()=>showMore(); $('zoomIn').onclick=()=>cmd('zoom',{mode:'in'}).catch(()=>{}); $('zoomOut').onclick=()=>cmd('zoom',{mode:'out'}).catch(()=>{}); $('zoomReset').onclick=()=>cmd('zoom',{mode:'reset'}).catch(()=>{});
  $('popoutMenu').onclick=()=>{showMore(false);cmd('detach-tab',{id:active().id}).catch(()=>{})};$('workspaceFullscreen').onclick=()=>{showMore(false);cmd('window-fullscreen').catch(()=>{})};
  $('importCurrentCatalog').onclick=async()=>{showMore(false);try{await cmd('catalog-import-current-page',{mode:'new'});toast('Imported the current Google source as a live catalog')}catch(err){toast(err?.message||String(err))}}; $('sourceCenter').onclick=()=>{showMore(false);cmd('source-center').catch(err=>toast(err?.message||String(err)))}; $('splitSwap').onclick=()=>{showMore(false);cmd('split-swap').catch(()=>{})}; $('splitReset').onclick=()=>{showMore(false);cmd('split-reset').catch(()=>{})}; $('devtools').onclick=()=>{showMore(false);cmd('devtools').catch(()=>{})};
  $('adblockUpdate').onclick=async()=>{showMore(false);try{const r=await cmd('adblock-update');toast(r?.message||'uBlock Origin update check complete')}catch(err){toast(err?.message||String(err))}};
  $('translatorUpdateMenu').onclick=async()=>{showMore(false);try{const r=await cmd('translator-update');toast(r?.message||'Translate Web Pages update check complete')}catch(err){toast(err?.message||String(err))}};
  $('statusBarToggle').onclick=()=>{showMore(false);cmd('statusbar-toggle').catch(()=>{})};
  $('themeToggle').onclick=()=>{const light=document.documentElement.dataset.theme==='light';document.documentElement.dataset.theme=light?'dark':'light';localStorage.setItem('cc-shell-theme',light?'dark':'light');$('themeToggle').textContent=light?'Light theme':'Dark theme';showMore(false)};
  $('clearData').onclick=async()=>{showMore(false);try{const result=await cmd('clear-data-confirm');if(result?.cleared)toast('Live-site data cleared')}catch(err){toast(err?.message||String(err))}};
  $('errorRetry').onclick=()=>{hideError();cmd('reload').catch(()=>{})}; $('errorCopy').onclick=()=>{cmd('copy-url',{url:$('errorBar').dataset.url}).catch(()=>{});toast('URL copied')}; $('errorExternal').onclick=()=>cmd('external',{url:$('errorBar').dataset.url}).catch(()=>{});
  $('minimize').onclick=()=>cmd('window-minimize').catch(()=>{}); $('maximize').onclick=()=>cmd('window-maximize').catch(()=>{}); $('close').onclick=()=>cmd('window-close').catch(()=>{});
  document.addEventListener('click',e=>{if(menuOpen&&!e.target.closest('#moreMenu')&&!e.target.closest('#moreToggle'))showMore(false)});
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='l'){e.preventDefault();$('address').focus();$('address').select()}
    else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='t'){e.preventDefault();cmd('new-tab').catch(()=>{})}
    else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='w'&&active().id!=='catalog'){e.preventDefault();cmd('close-tab',{id:active().id}).catch(()=>{})}
    else if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='t'){e.preventDefault();cmd('reopen-tab').catch(()=>{})}
    else if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='c'){e.preventDefault();cmd('catalog').catch(()=>{})}
    else if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='m'){e.preventDefault();cmd('launcher').catch(()=>{})}
    else if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='o'){e.preventDefault();cmd('source-center').catch(()=>{})}
    else if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='b'){e.preventDefault();cmd('statusbar-toggle').catch(()=>{})}
    else if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='f'){e.preventDefault();cmd('window-fullscreen').catch(()=>{})}
    else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='f'){e.preventDefault();showFind(true)}
    else if((e.ctrlKey||e.metaKey)&&e.key==='\\'){e.preventDefault();cmd('split').catch(()=>{})}
    else if(e.altKey&&e.key.toLowerCase()==='t'){e.preventDefault();if(active().id!=='catalog')cmd('translator-page',{service:$('translatorService').value,targetLanguage:$('translatorTarget').value}).catch(err=>toast(err?.message||String(err)))}
    else if(e.altKey&&e.key==='ArrowLeft'){e.preventDefault();cmd('back').catch(()=>{})}
    else if(e.altKey&&e.key==='ArrowRight'){e.preventDefault();cmd('forward').catch(()=>{})}
    else if((e.ctrlKey||e.metaKey)&&(e.key==='+'||e.key==='=')){e.preventDefault();cmd('zoom',{mode:'in'}).catch(()=>{})}
    else if((e.ctrlKey||e.metaKey)&&e.key==='-'){e.preventDefault();cmd('zoom',{mode:'out'}).catch(()=>{})}
    else if((e.ctrlKey||e.metaKey)&&e.key==='0'){e.preventDefault();cmd('zoom',{mode:'reset'}).catch(()=>{})}
    else if(e.key==='Escape'){if(findActive)showFind(false);if(downloadsOpen)showDownloads(false);if(menuOpen)showMore(false);if(translatorOpen)showTranslator(false)}
  });
}

window.companion.onState(renderState);
window.companion.onDownload(d=>{downloadItems.set(d.id,d);renderDownloads();$('downloadBadge').hidden=false;$('downloadBadge').textContent=[...downloadItems.values()].filter(x=>x.state==='progressing').length||'✓';if(d.type==='done')toast(`${d.filename}: ${d.state}`)});
window.companion.onFind(r=>{$('findCount').textContent=r?.matches?`${r.activeMatchOrdinal||0}/${r.matches}`:'0/0'});
window.companion.onStatus(s=>{$('statusText').textContent=s}); window.companion.onError(showError);

const savedTheme=localStorage.getItem('cc-shell-theme')||localStorage.getItem('mv-shell-theme'); if(savedTheme)document.documentElement.dataset.theme=savedTheme;
bind(); if(!nativeChromeOverlay){bindSplitter();bindDrop()} cmd('get-state').then(renderState).catch(err=>toast(err?.message||String(err))); syncInsets();
