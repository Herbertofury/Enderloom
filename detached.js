'use strict';
const $=id=>document.getElementById(id);
const command=(action,payload)=>window.enderloomDetached.command(action,payload).catch(()=>{});
function render(state){
  if(!state)return;
  $('title').textContent=state.title||'Enderloom workspace';document.title=`${state.title||'Workspace'} — Enderloom`;
  $('group').hidden=!state.group;$('group').textContent=state.group||'';$('groupSelect').value=state.group||'';
  $('maximize').textContent=state.maximized?'❐':'□';$('fullscreen').classList.toggle('active',!!state.fullscreen);
  $('closeTab').hidden=!state.closable;
}
$('reattach').onclick=()=>command('reattach');$('minimize').onclick=()=>command('minimize');$('maximize').onclick=()=>command('maximize');$('fullscreen').onclick=()=>command('fullscreen');$('close').onclick=()=>command('reattach');$('closeTab').onclick=()=>command('close-tab');$('groupSelect').onchange=event=>command('group',{group:event.target.value});
window.enderloomDetached.onState(render);
