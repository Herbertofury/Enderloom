'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const {canonicalCurseForgeProjectUrl,parseCurseForgeProjectId,exactCurseForgeSearchId,registryProtocolCommand,executableFromCommand,curseForgeInstallation}=require('../src/provider-launcher-handoff');

const install='https://www.curseforge.com/minecraft/mc-mods/lovely-robot-reboot/install?utm_source=enderloom';
assert.equal(canonicalCurseForgeProjectUrl(install),'https://www.curseforge.com/minecraft/mc-mods/lovely-robot-reboot');
assert.equal(parseCurseForgeProjectId('<span>Project ID</span><strong>1620292</strong>'),'1620292');
assert.equal(parseCurseForgeProjectId('{"projectId":1620292,"name":"Lovely Robot"}'),'1620292');
const command='"C:\\Users\\Owner\\AppData\\Local\\Programs\\CurseForge Windows\\CurseForge.exe" "%1"';
const run=(_file,args)=>({status:args[1].startsWith('HKCU')?0:1,stdout:`    (Default)    REG_SZ    ${command}\r\n`,stderr:''});
assert.equal(registryProtocolCommand('curseforge',{platform:'win32',run}),command);
assert.equal(executableFromCommand(command),'C:\\Users\\Owner\\AppData\\Local\\Programs\\CurseForge Windows\\CurseForge.exe');
assert.equal(curseForgeInstallation({platform:'win32',localAppData:'',run}).installed,true,'registered CurseForge protocol was not treated as an installed app');
const main=fs.readFileSync(path.resolve(__dirname,'../main.js'),'utf8');
assert(main.includes('resolveCurseForgeAddonId(request.sourceUrl'),'native CurseForge handoff does not resolve public project IDs');
assert(main.includes('curseforge://install?addonId='),'verified CurseForge install protocol contract is missing');
assert(!/else\s*\{\s*await shell\.openExternal\(request\.sourceUrl\);\s*\}/.test(main),'old misleading /install website fallback remains');
console.log(JSON.stringify({passed:true,protocol:'curseforge',canonical:true,publicProjectId:true,registeredAppDetection:true}));

const vm=require('vm');
const extract=(start,end)=>{
  const a=main.indexOf(start),b=main.indexOf(end,a+1);
  assert(a>=0&&b>a);return main.slice(a,b);
};
const safeHttpUrl=raw=>{
  try{const u=new URL(raw);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:'';}
  catch{return '';}
};
async function route({slug='right-project',title='Same name',hits=[],page='',installed=false,provider='curseforge'}={}){
  const opened=[],internal=[],fallback=[],requests=[];
  const ctx={
    ipcMain:{handle(name,fn){ctx.invoke=fn;assert.equal(name,'catalog:open-provider-launcher');}},
    URL,safeHttpUrl,catalogSender(){},canonicalCurseForgeProjectUrl,
    exactCurseForgeSearchId,
    curseForgeInstallation:()=>({installed}),
    launcherService:{request:async(command,args)=>{requests.push({command,args});return {hits};}},
    resolveCurseForgeAddonId:async url=>{fallback.push(canonicalCurseForgeProjectUrl(url));return page;},
    shell:{openExternal:async url=>opened.push(url)},createBrowserTab:url=>internal.push(url),send(){},
  };
  vm.runInNewContext(extract('function catalogLauncherProject(raw) {','\nfunction ')+extract("ipcMain.handle('catalog:open-provider-launcher',","\nipcMain.on('catalog:open-here',"),ctx);
  const url=provider==='curseforge'?`https://www.curseforge.com/minecraft/mc-mods/${slug}/install?ignored=1`:`https://modrinth.com/modpack/${slug}`;
  const result=await ctx.invoke({},{name:title,urls:[url]});
  return {result,opened,internal,fallback,requests};
}
async function regressions(){
 const exact={id:'300002',slug:'right-project',title:'Correct source title'}, decoy={id:'100123',slug:'unrelated',title:'Same name'};
 const left=await route({hits:[decoy,exact]});
 assert.deepEqual(left.opened,['curseforge://install?addonId=300002'],'same title must not win over exact provider slug');
 assert.equal(left.requests.length,1);assert.equal(left.requests[0].args.kind,'mods');assert.deepEqual(left.fallback,[]);
 const duplicate=await route({hits:[{...exact,slug:'RIGHT-PROJECT'},exact]});
 assert.deepEqual(duplicate.opened,['curseforge://install?addonId=300002'],'duplicate evidence for the same exact ID is unambiguous');
 const ambiguous=await route({hits:[exact,{...exact,id:'500005'}],installed:true});
 assert.deepEqual(ambiguous.opened,['curseforge://']);assert.deepEqual(ambiguous.internal,['https://www.curseforge.com/minecraft/mc-mods/right-project']);
 assert.deepEqual(ambiguous.fallback,['https://www.curseforge.com/minecraft/mc-mods/right-project']);
 const titleOnly=await route({hits:[decoy]});
 assert.equal(titleOnly.result.addonId,'');assert.deepEqual(titleOnly.opened,['https://www.curseforge.com/minecraft/mc-mods/right-project']);
 const page=await route({hits:[decoy],page:'300002'});
 assert.deepEqual(page.opened,['curseforge://install?addonId=300002'],'original canonical-page evidence remains usable');
 const numeric=await route({slug:'654321',hits:[{id:'300002',slug:'654321',title:'Digit slug'}]});
 assert.deepEqual(numeric.opened,['curseforge://install?addonId=300002'],'digits in a website path identify its slug, not its addon ID');
 const numericUnknown=await route({slug:'654321'});
 assert.equal(numericUnknown.result.addonId,'');
 assert.deepEqual(numericUnknown.opened,['https://www.curseforge.com/minecraft/mc-mods/654321']);
 const malformed=await route({hits:[{...exact,id:'0'},exact]});
 assert.equal(malformed.result.addonId,'');assert.equal(malformed.fallback.length,1);
 const unchanged=await route({provider:'modrinth'});
 assert.deepEqual(unchanged.opened,['modrinth://modpack/right-project']);assert.equal(unchanged.requests.length,0);
 const resolverCtx={
  canonicalCurseForgeProjectUrl,parseCurseForgeProjectId,
  chromiumProgressiveTextShared:()=>({full:Promise.resolve({text:'<span>Project ID</span><strong>300002</strong>'})}),
  publicRequestTextShared:async()=>({text:'<span>Project ID</span><strong>300002</strong>'}),
  extractLivePageMediaQuick(){throw new Error('Not used for valid deterministic evidence');},
 };
 const resolver=vm.runInNewContext(extract('async function resolveCurseForgeAddonId(', '\nasync function extractCurseForgeGalleryDomQuick')+';resolveCurseForgeAddonId',resolverCtx);
 assert.equal(await resolver('https://www.curseforge.com/minecraft/mc-mods/654321','654321'),'300002','canonical fallback cannot accept raw digit slug as proof');
 console.log('10 real host-routing scenarios passed with launcher/search/provider doubles.');
}
regressions().catch(error=>{console.error(error);process.exitCode=1;});
