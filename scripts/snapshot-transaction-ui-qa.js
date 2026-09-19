'use strict';
// QA inventory: native-backed review/loading gate, changed paths + pagination,
// stale-plan rejection, retry after a missing manifest, commit + history + safety,
// narrow-window fit, cancellation, no renderer errors. Every mutation is isolated.
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),{_electron:electron}=require('playwright');
const root=path.resolve(__dirname,'..');let app;
(async()=>{
  const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
  app=await electron.launch({executablePath:path.join(root,'node_modules/electron/dist/electron.exe'),args:[path.join(root,'scripts/fixtures/creative-ui-host.cjs')],env});
  const page=await app.firstWindow();page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.getByRole('button',{name:'Open Evergreen · creative workshop',exact:true}).waitFor();
  const fixture=await app.evaluate(async()=>{
    const load=process.getBuiltinModule('module').createRequire(process.cwd()+'/package.json'),fs=load('fs'),path=load('path');
    const {service,fixtures,temporary}=global.creativeQa,file=path.join(fixtures.instance.dir,'config/restore-check.json');
    fs.writeFileSync(file,'{"enabled":true}');
    const snapshot=await service.request('create_instance_snapshot',{instanceId:fixtures.instance.id,name:'Before config change',excluded:[]});
    fs.writeFileSync(file,'{"enabled":false}');
    const original=service.request.bind(service);let hold=true;
    service.request=async(command,args,options)=>{if(command==='plan_restore_instance_snapshot'&&hold){hold=false;await new Promise(resolve=>global.releaseRestorePlan=resolve);}return original(command,args,options);};
    return {id:fixtures.instance.id,file,snapshot,manifest:path.join(temporary,'data/snapshots/instances',fixtures.instance.id,snapshot.id+'.json')};
  });
  await page.getByRole('button',{name:'Open Evergreen · creative workshop',exact:true}).click();
  await page.getByRole('button',{name:'Instance actions',exact:true}).click();
  await page.getByText('Snapshots and restore (experimental)',{exact:true}).click();
  await page.getByText('Before config change',{exact:true}).waitFor();
  const point=()=>page.getByText('Before config change',{exact:true}).locator('..').locator('..');
  const review=()=>page.locator('[role=dialog]').last();
  await point().getByRole('button',{name:'Restore',exact:true}).click();
  await page.getByText('Checking current files…',{exact:true}).waitFor();assert(await review().getByRole('button',{name:'Restore',exact:true}).isDisabled());
  await app.evaluate(()=>global.releaseRestorePlan());
  await review().getByText('Files that will change',{exact:true}).click();await review().getByText('config/restore-check.json',{exact:true}).waitFor();
  assert(await review().getByRole('button',{name:'Restore',exact:true}).isEnabled());
  fs.mkdirSync(path.join(root,'output/playwright'),{recursive:true});await page.screenshot({path:path.join(root,'output/playwright/snapshot-restore-review.png')});
  fs.writeFileSync(fixture.file,'{"enabled":"external edit"}');
  await review().getByRole('button',{name:'Restore',exact:true}).click();await page.locator('[data-description]').filter({hasText:/changed since this restore was reviewed/}).waitFor();
  assert.equal(fs.readFileSync(fixture.file,'utf8'),'{"enabled":"external edit"}');
  const none=await app.evaluate((_,id)=>global.creativeQa.service.request('get_transactions',{targetKind:'instance',targetId:id}),fixture.id);assert.equal(none.length,0);
  await point().getByRole('button',{name:'Restore',exact:true}).click();await review().getByText('Files that will change',{exact:true}).waitFor();
  await review().getByRole('button',{name:'Restore',exact:true}).click();await page.getByText('Restored Before config change',{exact:true}).waitFor();
  assert.equal(fs.readFileSync(fixture.file,'utf8'),'{"enabled":true}');
  await page.getByText('Restore history · 1',{exact:true}).click();await page.getByText(/^committed ·/).click();
  await page.getByText('Temporary areas: cleaned up',{exact:true}).waitFor();await page.getByText('Before restoring Before config change',{exact:true}).waitFor();
  await page.screenshot({path:path.join(root,'output/playwright/snapshot-restore-history.png')});
  // Actual missing-file failure, then restore that fixture file and retry the same dialog.
  fs.renameSync(fixture.manifest,fixture.manifest+'.held');
  await point().getByRole('button',{name:'Restore',exact:true}).click();await review().getByRole('alert').waitFor();
  assert(await review().getByRole('button',{name:'Restore',exact:true}).isDisabled());
  fs.renameSync(fixture.manifest+'.held',fixture.manifest);
  for(let i=0;i<104;i++)fs.writeFileSync(path.join(path.dirname(fixture.file),`review-page-${String(i).padStart(3,'0')}.json`),'{}');
  await review().getByRole('button',{name:'Retry',exact:true}).click();await review().getByText('Files that will change',{exact:true}).click();
  await review().getByText('Page 1 of 2',{exact:true}).waitFor();await review().getByRole('button',{name:'Next',exact:true}).click();
  await review().getByText('config/review-page-103.json',{exact:true}).waitFor();assert(await review().getByRole('button',{name:'Next',exact:true}).isDisabled());
  await review().getByRole('button',{name:'Previous',exact:true}).click();await review().getByText('Page 1 of 2',{exact:true}).waitFor();
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setSize(860,700));
  const bounds=await review().evaluate(el=>({overflow:el.scrollWidth>el.clientWidth+1,rect:el.getBoundingClientRect().toJSON(),width:innerWidth,height:innerHeight}));
  assert(!bounds.overflow);assert(bounds.rect.x>=0&&bounds.rect.right<=bounds.width&&bounds.rect.bottom<=bounds.height+1);
  await page.screenshot({path:path.join(root,'output/playwright/snapshot-restore-narrow.png')});
  await review().getByRole('button',{name:'Cancel',exact:true}).click();assert(fs.existsSync(path.join(path.dirname(fixture.file),'review-page-103.json')));
  assert.deepEqual(errors,[]);
  const report={passed:true,loadingGate:true,nativeExactPaths:true,staleReviewRejected:true,nativeRestoreAndSafety:true,auditHistory:true,missingManifestRetry:true,uncappedPlanPagination:true,narrowWindowFit:true,cancelPreservesFiles:true,rendererErrors:errors};
  fs.writeFileSync(path.join(root,'output/snapshot-transaction-ui-qa.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>app?.close());
