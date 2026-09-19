'use strict';
const assert=require('assert/strict'),fs=require('fs'),path=require('path');const {_electron:electron}=require('playwright');
const root=path.resolve(__dirname,'..');let app;
(async()=>{
 const env={...process.env,ENDERLOOM_CURSEFORGE_API_KEY:'qa-offline-cache-only'};delete env.ELECTRON_RUN_AS_NODE;
 app=await electron.launch({executablePath:path.join(root,'node_modules/electron/dist/electron.exe'),args:[path.join(root,'scripts/fixtures/creative-ui-host.cjs')],env});
 const page=await app.firstWindow();page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.getByRole('button',{name:'Open Evergreen · creative workshop',exact:true}).waitFor();
 const fixture=await app.evaluate(async({ipcMain})=>{
   const load=process.getBuiltinModule('module').createRequire(process.cwd()+'/package.json');const fixture=await load('./scripts/project-context-fixtures').seedProjectContext(global.creativeQa.service);const server=await load('./scripts/project-context-fixtures').seedProjectServer(global.creativeQa.service);load('./scripts/project-context-fixtures').seedProjectWorlds(fixture.first,server);
   ipcMain.removeHandler('launcher:invoke');ipcMain.handle('launcher:invoke',async(_e,r)=>{
    if(r.command==='open_folder'){global.creativeQa.openedWorldFolder=r.args.path;return null;}
    if(r.command==='search_content')return {hits:[{id:'alpha',title:'Identity Workshop',description:'Project relationship fixture',icon_url:null,downloads:10,follows:1,author:'Fixture team',categories:[],game_versions:['1.20.1'],loaders:['forge'],updated:null,color:null}],total:1,offset:0,limit:40};
    if(r.command==='list_project_versions')return [];
    return global.creativeQa.service.request(r.command,r.args);
   });return {first:fixture.first,second:fixture.second,server};
 });
 await page.reload();await page.getByRole('button',{name:'Discover',exact:true}).first().click();await page.getByRole('button',{name:'Identity Workshop',exact:true}).first().click();await page.getByText('Description alpha',{exact:true}).waitFor();
 const usage=page.locator('details').filter({has:page.locator('summary').filter({hasText:'Used in your library'})});await usage.locator('summary').first().click();
 const target=page.getByRole('region',{name:'Used in Source identity A',exact:true});await target.waitFor();await target.getByText('first.jar',{exact:true}).waitFor();
 assert.equal(await target.getByText('config/identity_fixture_plus-client.toml',{exact:true}).count(),0);
 await target.getByText('Dependencies & dependents',{exact:false}).click();await target.getByText('addon.jar · fabric.mod.json',{exact:true}).waitFor();
 await target.getByText(/one of alternatives/).waitFor();await target.getByText(/Unless:.*replacement/).waitFor();
 await target.getByText('World connections',{exact:false}).click();await target.getByRole('region',{name:'World connection Meadow',exact:true}).waitFor();await target.getByRole('region',{name:'World connection Sky Islands',exact:true}).getByText('Dimension storage',{exact:true}).waitFor();
 await target.getByRole('region',{name:'World connection Meadow',exact:true}).getByRole('button',{name:'Open world folder',exact:true}).click();assert.equal(await app.evaluate(()=>global.creativeQa.openedWorldFolder),path.join(fixture.first.dir,'saves/Meadow'));
 await target.scrollIntoViewIfNeeded();await page.waitForFunction(()=>Array.from(document.getAnimations()).filter(a=>a.effect?.getComputedTiming().iterations!==Infinity).every(a=>a.playState==='finished'));
 fs.mkdirSync(path.join(root,'output/playwright'),{recursive:true});await page.screenshot({path:path.join(root,'output/playwright/project-context.png')});
 await target.getByRole('button',{name:'config/identity_fixture-client.toml',exact:false}).click();await page.locator('.wb-workspace').waitFor();assert.equal(await page.getByLabel('Config instance').inputValue(),fixture.first.id);await page.getByLabel('Config mod association').waitFor();
 await page.getByLabel('Config mod association').selectOption('helper');await page.getByText('Assigned by you.',{exact:true}).waitFor();
 const context=await app.evaluate(()=>global.creativeQa.service.request('get_project_context',{provider:'modrinth',projectId:'alpha'}));assert(!context.targets[0].configs.some(c=>c.path==='config/identity_fixture-client.toml'),'Project context must follow correction made in Config');
 await page.getByRole('button',{name:'Discover',exact:true}).first().click();await page.getByRole('button',{name:'Identity Workshop',exact:true}).first().click();await page.getByText('Description alpha',{exact:true}).waitFor();await usage.locator('summary').first().click();await target.waitFor();await target.getByRole('button',{name:'Open instance',exact:false}).click();await page.getByText('Source identity A',{exact:true}).first().waitFor();
 await page.getByRole('button',{name:'Discover',exact:true}).first().click();await page.getByRole('button',{name:'Identity Workshop',exact:true}).first().click();await page.getByText('Description alpha',{exact:true}).waitFor();await usage.locator('summary').first().click();
 const server=page.getByRole('region',{name:'Used in Workshop dedicated server',exact:true});await server.waitFor();await server.getByRole('button',{name:'Meadow/serverconfig/identity_fixture-server.toml',exact:false}).click();await page.getByText('identity_fixture-server.toml',{exact:false}).first().waitFor();assert.equal(await page.getByRole('textbox',{name:'Edit Meadow/serverconfig/identity_fixture-server.toml',exact:true}).inputValue(),'enabled=true\n');
 assert.deepEqual(errors,[]);console.log('PASS Electron project relationships, declared dependencies, direct instance/server Config navigation, shared owner correction, and opening the instance.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>app?.close());
