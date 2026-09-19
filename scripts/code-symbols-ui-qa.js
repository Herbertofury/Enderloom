'use strict';
const assert=require('assert/strict'),fs=require('fs'),path=require('path');const {_electron:electron}=require('playwright');
const root=path.resolve(__dirname,'..');let app;
(async()=>{
 const env={...process.env,ENDERLOOM_CURSEFORGE_API_KEY:'qa-offline-cache-only'};delete env.ELECTRON_RUN_AS_NODE;
 app=await electron.launch({executablePath:path.join(root,'node_modules/electron/dist/electron.exe'),args:[path.join(root,'scripts/fixtures/creative-ui-host.cjs')],env});
 const page=await app.firstWindow();page.setDefaultTimeout(10000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.getByRole('button',{name:'Open Evergreen · creative workshop',exact:true}).waitFor();
 await app.evaluate(async({ipcMain})=>{
   const load=process.getBuiltinModule('module').createRequire(process.cwd()+'/package.json');const fixture=await load('./scripts/project-context-fixtures').seedProjectContext(global.creativeQa.service);load('./scripts/code-symbol-fixtures').seedCodeSymbols(fixture.first);
   ipcMain.removeHandler('launcher:invoke');ipcMain.handle('launcher:invoke',async(_e,r)=>{
    if(r.command==='search_content')return {hits:[{id:'alpha',title:'Identity Workshop',description:'Project code fixture',icon_url:null,downloads:10,follows:1,author:'Fixture team',categories:[],game_versions:['1.20.1'],loaders:['forge'],updated:null,color:null}],total:1,offset:0,limit:40};
    if(r.command==='list_project_versions')return [];
    const result=await global.creativeQa.service.request(r.command,r.args);
    if(r.command==='get_content_code_symbols'&&r.args.classPath&&r.args.classPath===global.creativeQa.holdClass){global.creativeQa.classHeld=true;await new Promise(resolve=>{global.creativeQa.releaseClass=resolve;});}
    return result;
   });
 });
 await page.reload();await page.getByRole('button',{name:'Discover',exact:true}).first().click();await page.getByRole('button',{name:'Identity Workshop',exact:true}).first().click();await page.getByText('Description alpha',{exact:true}).waitFor();
 const usage=page.locator('details').filter({has:page.locator('summary').filter({hasText:'Used in your library'})});await usage.locator('summary').first().click();
 const target=page.getByRole('region',{name:'Used in Source identity A',exact:true});await target.getByText('Source & licenses',{exact:true}).click();
 const rootSection=target.getByRole('region',{name:'Source metadata identity_fixture',exact:true});await rootSection.getByText('Explore installed code',{exact:true}).click();
 const explorer=rootSection.getByRole('region',{name:'Code explorer first.jar',exact:true});await explorer.getByText('68 of 68 classes',{exact:true}).waitFor();
 await explorer.getByRole('button',{name:'Next classes',exact:true}).click();await explorer.getByText('2/2',{exact:true}).waitFor();
 await explorer.getByLabel('Search installed classes',{exact:true}).fill('Example.class');await explorer.getByRole('button',{name:'fixture.Example',exact:true}).click();
 const detail=explorer.getByRole('region',{name:'Selected class symbols',exact:true});await detail.getByText('Example.java · class format 61.0',{exact:true}).waitFor();await detail.getByText('method · source lines 7–7',{exact:true}).waitFor();
 await detail.getByText('Exact code fingerprints',{exact:true}).click();await detail.getByText(/Class SHA-256 · [a-f0-9]{64}/).waitFor();
 await explorer.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(root,'output/playwright/code-symbols.png')});
 await explorer.getByLabel('Search installed classes',{exact:true}).fill('broken');await explorer.getByRole('button',{name:'broken',exact:true}).click();await explorer.getByRole('alert').filter({hasText:'not a Java class file'}).waitFor();
 await app.evaluate(()=>{global.creativeQa.holdClass='fixture/Example.class';});await explorer.getByLabel('Search installed classes',{exact:true}).fill('Example.class');await explorer.getByRole('button',{name:'fixture.Example',exact:true}).click();
 for(let i=0;i<100&&!await app.evaluate(()=>global.creativeQa.classHeld);i++)await new Promise(r=>setTimeout(r,25));assert(await app.evaluate(()=>global.creativeQa.classHeld));
 await explorer.getByLabel('Search installed classes',{exact:true}).fill('truncated');await explorer.getByRole('button',{name:'truncated',exact:true}).click();await explorer.getByRole('alert').filter({hasText:'Truncated class file'}).waitFor();await app.evaluate(()=>global.creativeQa.releaseClass());
 await page.waitForFunction(()=>!document.querySelector('[aria-label="Code explorer first.jar"] [role="status"]'));assert.equal(await detail.getByText('Example.java · class format 61.0',{exact:true}).count(),0,'A late selection response replaced the current class');
 const nested=target.getByRole('region',{name:'Source metadata code_helper',exact:true});await nested.getByText('Explore installed code',{exact:true}).click();await nested.getByRole('button',{name:'nested.Helper',exact:true}).click();await nested.getByText('Source filename not recorded · class format 61.0',{exact:true}).waitFor();
 assert.deepEqual(errors,[]);console.log('PASS Electron installed-code explorer: lazy inspection, all-class pagination, search, overloads/source lines, exact hashes, corrupt-entry recovery, bundled symbols and stale-response isolation.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>app?.close());
