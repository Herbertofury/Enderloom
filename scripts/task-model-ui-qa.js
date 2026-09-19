'use strict';
const assert=require('assert/strict'),path=require('path'),fs=require('fs'),{_electron:electron}=require('playwright');
const root=path.resolve(__dirname,'..');let app;
(async()=>{
  const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
  app=await electron.launch({executablePath:path.join(root,'node_modules/electron/dist/electron.exe'),args:[path.join(root,'scripts/fixtures/creative-ui-host.cjs')],env});
  const page=await app.firstWindow();page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.getByRole('button',{name:'Open Evergreen · creative workshop',exact:true}).waitFor();
  const id=await app.evaluate(async()=>{
    const load=process.getBuiltinModule('module').createRequire(process.cwd()+'/package.json'),{zip}=load('./scripts/workbench-fixtures'),fs=load('fs'),path=load('path');
    const {service,temporary}=global.creativeQa,file=path.join(temporary,'restore-input.jar');
    await service.request('start_conversion_intake',{project_id:'recovery-ui',title:'Source checkpoint recovery',minecraft:'1.20.1',loader:'forge',loader_version:'47.4.23',java:17,checkpoint:'Recovery fixture',inputs:[{path:file,label:'Original resources',role:'authority'}]}).catch(()=>{});
    const task=(await service.request('list_tasks')).find(t=>t.kind==='conversion_intake');if(!task)throw Error('No failed intake task');
    fs.writeFileSync(file,zip({'assets/example/models/model.json':'{}'}));return task.id;
  });
  await page.reload();await page.getByRole('button',{name:'Config',exact:true}).first().click();await page.locator('.wb-workspace').waitFor();
  await page.getByRole('button',{name:'Downloads',exact:true}).first().click();
  let row=page.locator(`[data-task-id="${id}"]`);await row.getByText('Task history & evidence',{exact:true}).click();
  await row.getByText('Attempt 1 · failed',{exact:true}).waitFor();await row.getByText('start_conversion_intake',{exact:true}).waitFor();
  await row.getByText('Resume checkpoint',{exact:true}).click();await row.getByText(/^sha256:[a-f0-9]{64}$/).waitFor();
  await row.getByRole('button',{name:'Resume Inspect conversion inputs',exact:true}).click();
  await page.locator(`[data-task-id="${id}"][data-task-state="succeeded"]`).waitFor();
  // A task may move from Active to Recent and remount when its attempt settles.
  if(await row.getByTestId('task-details').count()===0)await row.getByText('Task history & evidence',{exact:true}).click();
  await row.getByText('Attempt 2 · succeeded',{exact:true}).waitFor();await row.getByText('Attempt 1 · failed',{exact:true}).waitFor();
  await row.getByText('Produced evidence 1',{exact:true}).click();await row.getByRole('button',{name:'Verify source',exact:true}).click();await row.getByText('Source: verified · Analysis: verified',{exact:true}).waitFor();
  const overflow=await row.getByTestId('task-details').evaluate(el=>el.scrollWidth>el.clientWidth+1);assert.equal(overflow,false,'IDs or source paths overflow task panel');
  await row.getByRole('button',{name:'Refresh task details',exact:true}).click();await row.getByText('Attempt 2 · succeeded',{exact:true}).waitFor();
  fs.mkdirSync(path.join(root,'output/playwright'),{recursive:true});await page.screenshot({path:path.join(root,'output/playwright/task-history-evidence.png')});
  await page.getByRole('button',{name:'Clear finished',exact:true}).click();await page.locator(`[data-task-id="${id}"]`).waitFor({state:'detached'});
  const archived=await app.evaluate((_,taskId)=>global.creativeQa.service.request('get_task_detail',{taskId}),id);assert.equal(archived.task.details.archived,true);assert.equal(archived.task.details.attempts.length,2);
  assert.deepEqual(errors,[]);console.log('PASS real Electron task history: failure, checkpoint identity, native resume, both attempts, source verification, refresh, overflow and archive preservation.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>app?.close());
