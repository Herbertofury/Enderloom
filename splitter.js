'use strict';
const lane=document.getElementById('splitLane');
let state=null,dragging=false,pointerId=null,startScreenX=0,startDividerX=0,pendingRatio=.5,raf=0;
const cmd=(name,payload={})=>window.companion.command(name,payload);
function clampRatio(r){return Math.max(.02,Math.min(.98,Number(r)||.5))}
function render(next){state=next||state||{};const pct=Math.round((state.splitRatio||.5)*100);lane.setAttribute('aria-valuenow',String(pct));lane.setAttribute('aria-valuetext',`${pct}% left pane`);lane.dataset.side=state.splitSide||'catalog-left'}
function send(){raf=0;cmd('split-resize',{ratio:pendingRatio}).catch(()=>{})}
function queueRatio(r){pendingRatio=clampRatio(r);if(!raf)raf=requestAnimationFrame(send)}
function ratioFromScreen(screenX){const available=Math.max(1,Number(state?.splitAvailableWidth)||1);return clampRatio((startDividerX+(Number(screenX)-startScreenX))/available)}
lane.addEventListener('pointerdown',e=>{if(e.button!==0)return;dragging=true;pointerId=e.pointerId;startScreenX=Number(e.screenX);startDividerX=Number(state?.splitDividerX)||0;lane.classList.add('dragging');try{lane.setPointerCapture(e.pointerId)}catch{}e.preventDefault()});
lane.addEventListener('pointermove',e=>{if(!dragging||e.pointerId!==pointerId)return;queueRatio(ratioFromScreen(e.screenX));e.preventDefault()});
function finish(e){if(!dragging)return;dragging=false;lane.classList.remove('dragging');if(e&&Number.isFinite(Number(e.screenX)))pendingRatio=ratioFromScreen(e.screenX);try{if(pointerId!==null)lane.releasePointerCapture(pointerId)}catch{}pointerId=null;if(raf){cancelAnimationFrame(raf);raf=0}cmd('split-resize',{ratio:pendingRatio}).catch(()=>{});cmd('focus-active-content').catch(()=>{})}
lane.addEventListener('pointerup',finish);lane.addEventListener('pointercancel',finish);lane.addEventListener('lostpointercapture',e=>{if(dragging)finish(e)});
lane.addEventListener('dblclick',e=>{e.preventDefault();cmd('split-reset').catch(()=>{})});
lane.addEventListener('contextmenu',e=>{e.preventDefault();cmd('split-swap').catch(()=>{})});
lane.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const step=e.shiftKey?.08:.02;cmd('split-resize',{ratio:(state?.splitRatio||.5)+(e.key==='ArrowRight'?step:-step)}).catch(()=>{})}else if(e.key==='Home'){e.preventDefault();cmd('split-resize',{ratio:.25}).catch(()=>{})}else if(e.key==='End'){e.preventDefault();cmd('split-resize',{ratio:.75}).catch(()=>{})}else if(e.key==='Enter'){e.preventDefault();cmd('split-swap').catch(()=>{})}});
window.companion.onState(render);cmd('get-state').then(render).catch(()=>{});
