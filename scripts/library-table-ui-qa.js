'use strict';
const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const {_electron:electron}=require('playwright'); const root=path.resolve(__dirname,'..'); let app;
(async()=>{
  app=await electron.launch({executablePath:path.join(root,'node_modules/electron/dist/electron.exe'),args:[path.join(root,'scripts/fixtures/creative-ui-host.cjs')]});
  const page=await app.firstWindow(); page.setDefaultTimeout(10000); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.getByRole('button',{name:'Open Evergreen · creative workshop',exact:true}).waitFor();
  await app.evaluate(({ipcMain})=>{
    const project={id:'layout-fixture',slug:'layout-fixture',title:'Layout fixture',description:'Isolated UI test project',icon_url:null,downloads:12000,follows:40,author:'QA fixture',categories:[],game_versions:['1.20.1'],loaders:['forge'],updated:null,color:null};
    ipcMain.removeHandler('launcher:invoke');
    ipcMain.handle('launcher:invoke',(_event,r)=>{
      if(r.command==='search_content') return {hits:[project],total:1,offset:0,limit:40};
      if(r.command==='get_project_details') return {...project,body:'Fixture project description.',body_format:'markdown',gallery:[],links:[],license:null,published:null,website_url:null};
      if(r.command==='list_project_versions') return [];
      return global.creativeQa.service.request(r.command,r.args);
    });
  });
  await page.getByTestId('home-view-trigger').click(); await page.getByRole('button',{name:'Table',exact:true}).click(); await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Discover',exact:true}).first().click();
  const table=page.getByRole('table',{name:'Discover projects',exact:true}); await table.waitFor();
  assert.equal(await table.getByRole('columnheader',{name:'Author',exact:true}).count(),1);
  assert.equal(await page.getByTestId('discover-view-trigger').innerText(),'Table','Discover inherits Home’s view');
  await table.getByRole('button',{name:'Favorite Layout fixture',exact:true}).click();
  await table.getByRole('button',{name:'Unfavorite Layout fixture',exact:true}).waitFor();
  await table.getByRole('button',{name:'Open Layout fixture',exact:true}).press('Enter');
  await page.getByText('Fixture project description.',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Discover',exact:true}).first().click(); await table.waitFor();
  await page.getByTestId('discover-view-trigger').click(); await page.getByRole('button',{name:'Tiles',exact:true}).click(); await page.getByRole('button',{name:'Use XL tiles',exact:true}).click(); await page.keyboard.press('Escape');
  await page.locator('.library-project-tile').waitFor();
  await page.getByRole('button',{name:'Home',exact:true}).first().click();
  assert((await page.getByTestId('home-view-trigger').innerText()).includes('XL'),'Home follows density changes in Discover');
  fs.mkdirSync(path.join(root,'output/playwright'),{recursive:true});
  await page.getByTestId('home-view-trigger').click(); await page.getByRole('button',{name:'Table',exact:true}).click(); await page.keyboard.press('Escape');
  await page.screenshot({path:path.join(root,'output/playwright/home-table.png')});
  assert.deepEqual(errors,[]); console.log('PASS real Electron Home/Discover table and density synchronization, keyboard project navigation and independent favorite action.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>app?.close());
