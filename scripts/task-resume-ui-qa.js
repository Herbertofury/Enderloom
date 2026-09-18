'use strict';
const assert=require('assert/strict'),path=require('path'),fs=require('fs');const {_electron:electron}=require('playwright');
const root=path.resolve(__dirname,'..');let app;
(async()=>{
  const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
  app=await electron.launch({executablePath:path.join(root,'node_modules/electron/dist/electron.exe'),args:[path.join(root,'scripts/fixtures/creative-ui-host.cjs')],env});
  const page=await app.firstWindow();page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.getByRole('button',{name:'Open Evergreen · creative workshop',exact:true}).waitFor();
  const id=await app.evaluate(async()=>{
    const load=process.getBuiltinModule('module').createRequire(process.cwd()+'/package.json'),{zip,write}=load('./scripts/workbench-fixtures');
    const service=global.creativeQa.service,instance=await service.request('create_instance',{name:'Recover this inspection',versionId:'1.20.1',loader:null,loaderVersion:null});
    for(let i=0;i<300;i++)write(instance.dir,`mods/resume-${String(i).padStart(3,'0')}.jar`,zip({'fabric.mod.json':JSON.stringify({id:`resume_${i}`,version:'1.0'}),'fixture.bin':Buffer.alloc(32768,i%256)}));
    let taskId;const kill=message=>{if(!taskId&&message.event==='task:update'&&message.payload.stage==='Inspecting resume-020.jar'){taskId=message.payload.id;service.child.kill();}};service.on('event',kill);
    await service.request('scan_mod_insights',{instanceId:instance.id,history:false}).catch(()=>{});service.removeListener('event',kill);await service.close();if(!taskId)throw Error('No interrupted task was captured');await service.start();return taskId;
  });
  await page.reload();await page.getByRole('button',{name:'Open Evergreen · creative workshop',exact:true}).waitFor();await page.getByRole('button',{name:'Config',exact:true}).first().click();await page.locator('.wb-workspace').waitFor();await page.getByRole('button',{name:'Downloads',exact:true}).first().click();
  const resume=page.getByRole('button',{name:'Resume Inspect mods',exact:true});await resume.waitFor();await page.getByText('Enderloom closed before this operation finished.',{exact:true}).waitFor();
  await page.getByRole('dialog',{name:'Downloads',exact:true}).getByText('Recover this inspection',{exact:true}).waitFor();
  await page.waitForFunction(()=>Array.from(document.getAnimations()).filter(a=>a.effect?.getComputedTiming().iterations!==Infinity).every(a=>a.playState==='finished'));
  fs.mkdirSync(path.join(root,'output/playwright'),{recursive:true});await page.screenshot({path:path.join(root,'output/playwright/task-resume.png')});
  await page.getByRole('button',{name:'Clear finished',exact:true}).click();await resume.waitFor();await resume.click();
  await page.locator(`[data-task-id="${id}"][data-task-state="succeeded"]`).waitFor({timeout:30000});
  await page.getByRole('dialog',{name:'Downloads',exact:true}).getByText('Attempt 2',{exact:false}).waitFor();
  const tasks=await app.evaluate(()=>global.creativeQa.service.request('list_tasks'));const task=tasks.find(t=>t.id===id);assert.equal(task.state,'succeeded');assert.equal(task.attempt,2);assert.equal(tasks.filter(t=>t.id===id).length,1);
  assert.equal(await page.getByRole('button',{name:'Resume Inspect mods',exact:true}).count(),0);
  await app.evaluate(({BrowserWindow},completed)=>{BrowserWindow.getAllWindows()[0].webContents.send('launcher:event',{event:'task:update',payload:{...completed,state:'running',stage:'Old progress',revision:completed.revision-1}});},task);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  assert.equal(await page.locator(`[data-task-id="${id}"]`).getAttribute('data-task-state'),'succeeded','Delayed progress must not undo completion');
  await page.getByRole('button',{name:'Downloads',exact:true}).first().click();
  for(const [label,selector] of [['Config','.wb-workspace'],['Performance','.performance-workspace'],['Favorites','.favorites-workspace']]){await page.getByRole('button',{name:label,exact:true}).first().click();await page.locator(selector).waitFor();assert(!/premium\s*(?:preview|testing)?/i.test(await page.locator(selector).innerText()),`${label} still displays a feature-tier label`);}
  assert.deepEqual(errors,[]);console.log('PASS real Electron interrupted-task history, preserved checkpoint, native Resume action, same task ID and feature-label cleanup.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>app?.close());
