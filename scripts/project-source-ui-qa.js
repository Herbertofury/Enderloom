'use strict';
const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const {_electron:electron}=require('playwright'); const root=path.resolve(__dirname,'..');let app;
(async()=>{
  const env={...process.env,ENDERLOOM_CURSEFORGE_API_KEY:'qa-offline-cache-only'};delete env.ELECTRON_RUN_AS_NODE;
  app=await electron.launch({executablePath:path.join(root,'node_modules/electron/dist/electron.exe'),args:[path.join(root,'scripts/fixtures/creative-ui-host.cjs')],env});
  const page=await app.firstWindow();page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.getByRole('button',{name:'Open Evergreen · creative workshop',exact:true}).waitFor();
  await app.evaluate(async({ipcMain})=>{
    const load=process.getBuiltinModule('module').createRequire(process.cwd()+'/package.json');
    await load('./scripts/project-source-fixtures').seedProjectSources(global.creativeQa.service);
    global.creativeQa.delayPreview=false;
    ipcMain.removeHandler('launcher:invoke');ipcMain.handle('launcher:invoke',async(_event,r)=>{
      if(r.command==='search_content')return {hits:[{id:'alpha',title:'Identity Workshop',description:'Isolated source identity fixture',icon_url:null,downloads:10,follows:1,author:'Fixture team',categories:[],game_versions:['1.20.1'],loaders:['forge'],updated:null,color:null}],total:1,offset:0,limit:40};
      if(r.command==='list_project_versions')return [];
      if(r.command==='preview_project_source_link'&&global.creativeQa.delayPreview)await new Promise(resolve=>global.creativeQa.releasePreview=resolve);
      return global.creativeQa.service.request(r.command,r.args);
    });
  });
  await page.getByRole('button',{name:'Discover',exact:true}).first().click();await page.getByRole('button',{name:'Identity Workshop',exact:true}).first().click();await page.getByText('Description alpha',{exact:true}).waitFor();
  const identity=page.locator('details').filter({has:page.getByText('Installed file identity',{exact:false})});await identity.locator('summary').first().click();await identity.getByText('first.jar',{exact:true}).waitFor();
  const sources=page.getByRole('region',{name:'Project sources'});
  await sources.getByRole('button',{name:'Link another source',exact:true}).click();await sources.getByLabel('Other project ID',{exact:true}).fill('989898');await sources.getByRole('button',{name:'Compare sources',exact:true}).click();
  await sources.getByText('1 matching verified file hash recorded.',{exact:false}).waitFor();
  const save=sources.getByRole('button',{name:'Link these sources',exact:true});assert(await save.isDisabled());
  await sources.getByLabel('Why these are the same project',{exact:true}).fill('Both pages are explicitly linked by the fixture author.');assert(await save.isDisabled());
  await sources.getByRole('checkbox').check();await save.click();await sources.getByText('Why are these linked?',{exact:true}).waitFor();await identity.getByText('second.jar',{exact:true}).waitFor();
  await sources.getByText('Why are these linked?',{exact:true}).click();await sources.getByText('Both pages are explicitly linked by the fixture author.',{exact:true}).waitFor();
  const persisted=await app.evaluate(()=>global.creativeQa.service.request('get_project_artifact_graph',{provider:'curseforge',projectId:'989898'}));assert.equal(persisted.project.aliases.length,2);assert.equal(persisted.source_links[0].confidence_class,'user_confirmed');
  await sources.scrollIntoViewIfNeeded();fs.mkdirSync(path.join(root,'output/playwright'),{recursive:true});await page.screenshot({path:path.join(root,'output/playwright/project-sources.png')});
  await sources.getByRole('button',{name:'Unlink Identity Workshop and Identity Workshop',exact:true}).click();await sources.getByText('Connect this mod’s other provider page',{exact:false}).waitFor();assert.equal(await identity.getByText('second.jar',{exact:true}).count(),0);await identity.getByText('first.jar',{exact:true}).waitFor();
  await sources.getByRole('button',{name:'Link another source',exact:true}).click();await sources.getByLabel('Other project ID',{exact:true}).fill('../../wrong');await sources.getByRole('button',{name:'Compare sources',exact:true}).click();await sources.getByRole('alert').waitFor();assert.equal(await sources.getByRole('button',{name:'Link these sources',exact:true}).count(),0);
  // An in-flight comparison must not resurrect its form after cancellation/navigation.
  await sources.getByLabel('Other project ID',{exact:true}).fill('989898');await app.evaluate(()=>global.creativeQa.delayPreview=true);await sources.getByRole('button',{name:'Compare sources',exact:true}).click();
  await page.getByRole('button',{name:'Home',exact:true}).first().click();await app.evaluate(()=>global.creativeQa.releasePreview());
  await page.getByRole('button',{name:'Discover',exact:true}).first().click();await page.getByRole('button',{name:'Identity Workshop',exact:true}).first().click();await page.getByText('Description alpha',{exact:true}).waitFor();
  if(await identity.getAttribute('open')===null)await identity.locator('summary').first().click();await identity.getByText('first.jar',{exact:true}).waitFor();assert.equal(await sources.getByRole('button',{name:'Link these sources',exact:true}).count(),0);
  assert.deepEqual(errors,[]);console.log('PASS real Electron source comparison, confirmation, native persistence, shared file history, Why, lossless unlink, invalid input and delayed navigation isolation.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>app?.close());
