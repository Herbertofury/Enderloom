'use strict';
const assert=require('assert/strict'),fs=require('fs'),path=require('path');const {_electron:electron}=require('playwright');const root=path.resolve(__dirname,'..');let app;
(async()=>{
 const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
 app=await electron.launch({executablePath:path.join(root,'node_modules/electron/dist/electron.exe'),args:[path.join(root,'scripts/fixtures/creative-ui-host.cjs')],env});
 const page=await app.firstWindow();page.setDefaultTimeout(20000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.getByRole('button',{name:'Open Evergreen · creative workshop',exact:true}).waitFor();
 const fixture=await app.evaluate(async()=>{const load=process.getBuiltinModule('module').createRequire(process.cwd()+'/package.json');return load('./scripts/config-source-fixtures').seedConfigSources(global.creativeQa.service);});
 await page.reload();await page.getByRole('button',{name:'Config',exact:true}).first().click();await page.getByLabel('Config instance').selectOption(fixture.first.id);
 await page.getByLabel('Search configs and addons').fill('rendering.toml');await page.getByRole('button',{name:/rendering.toml/}).click();
 await page.getByRole('button',{name:/View source evidence/}).waitFor();await page.getByText(/Source release matches the installed mod version/).waitFor();
 assert.equal(await page.locator('.wb-mod-group').filter({hasText:'Identity Workshop'}).count(),1);
 await page.getByRole('button',{name:'All files',exact:true}).click();await page.locator('.wb-mod-group').waitFor({state:'detached'});
 await page.getByLabel('Config mod association').selectOption('helper');await page.getByText('Assigned by you.',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:/View source evidence/}).count(),0);
 await page.getByLabel('Config mod association').selectOption('auto');await page.getByRole('button',{name:/View source evidence/}).waitFor();await page.getByRole('button',{name:'By mod',exact:true}).click();
 fs.mkdirSync(path.join(root,'output/playwright'),{recursive:true});await page.screenshot({path:path.join(root,'output/playwright/config-source-evidence.png')});
 await page.getByRole('button',{name:'Addons',exact:true}).first().click();await page.getByLabel('Addons instance').waitFor();await page.getByRole('button',{name:'Config',exact:true}).first().click();await page.getByLabel('Config instance').selectOption(fixture.first.id);await page.getByLabel('Search configs and addons').fill('rendering.toml');await page.getByRole('button',{name:/rendering.toml/}).click();await page.getByRole('button',{name:/View source evidence/}).waitFor();
 assert.deepEqual(errors,[]);console.log('PASS Electron: background source evidence, mod grouping, flat view, manual override/automatic reset, navigation and cached evidence, no renderer errors.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>app?.close());
