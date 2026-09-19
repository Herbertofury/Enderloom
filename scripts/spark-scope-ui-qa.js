'use strict';
const assert=require('assert/strict'),path=require('path');const {_electron:electron}=require('playwright');const root=path.resolve(__dirname,'..');let app;
(async()=>{
  app=await electron.launch({executablePath:path.join(root,'node_modules/electron/dist/electron.exe'),args:[path.join(root,'scripts/fixtures/creative-ui-host.cjs')]});const page=await app.firstWindow();page.setDefaultTimeout(12000);
  await page.getByRole('button',{name:'Open Evergreen · creative workshop',exact:true}).waitFor();
  const ids=await app.evaluate(async({ipcMain})=>{
    const {service,fixtures}=global.creativeQa;for(let i=0;i<65;i++)await service.request('save_performance_evidence',{instanceId:fixtures.instance.id,report:{kind:'log',title:`Saved evidence ${i}`,warnings:[],findings:[],line_count:1}});
    await service.request('save_performance_evidence',{instanceId:fixtures.second.id,report:{kind:'log',title:'Survival evidence',warnings:[],findings:[],line_count:1}});
    global.creativeQa.delayLog=true;global.creativeQa.waiting=false;global.creativeQa.gate=new Promise((resolve,reject)=>{global.creativeQa.finishLog=resolve;global.creativeQa.failLog=reject;});
    ipcMain.removeHandler('launcher:invoke');ipcMain.handle('launcher:invoke',(_event,r)=>{if(r.command==='redact_instance_log'&&global.creativeQa.delayLog){global.creativeQa.waiting=true;return global.creativeQa.gate;}return service.request(r.command,r.args);});
    return {first:fixtures.instance.id,second:fixtures.second.id,count:(await service.request('get_performance_evidence',{instanceId:fixtures.instance.id})).length};
  });assert.equal(ids.count,65,'Evidence history must not silently truncate at 30 reports');
  await page.getByRole('button',{name:'Performance',exact:true}).first().click();await page.getByLabel('Performance instance').selectOption(ids.first);await page.getByRole('button',{name:'Spark & logs',exact:true}).click();
  await page.getByLabel('Spark report URL').fill('https://spark.lucko.me/Original123');
  await page.getByRole('button',{name:'Analyze latest.log',exact:true}).click();await app.evaluate(()=>{if(!global.creativeQa.waiting)throw Error('Analysis did not start');});
  await page.getByLabel('Performance instance').selectOption(ids.second);await page.getByRole('heading',{name:'Survival evidence',exact:true}).waitFor();assert.equal(await page.getByLabel('Spark report URL').inputValue(),'');assert(await page.getByRole('button',{name:'Analyze latest.log',exact:true}).isEnabled());
  await app.evaluate(()=>global.creativeQa.finishLog("[Server thread/WARN]: Can't keep up! Running 9999ms or 200 ticks behind"));
  await page.waitForTimeout(250);assert.equal(await page.getByText('Server falling behind · 1',{exact:true}).count(),0);await page.getByRole('heading',{name:'Survival evidence',exact:true}).waitFor();
  const saved=await app.evaluate(async()=>{const{service,fixtures}=global.creativeQa;return {first:await service.request('get_performance_evidence',{instanceId:fixtures.instance.id}),second:await service.request('get_performance_evidence',{instanceId:fixtures.second.id})};});assert.equal(saved.first.length,66);assert.equal(saved.second.length,1);assert(saved.first.some(r=>r.title==='latest.log'));
  await app.evaluate(()=>{global.creativeQa.gate=new Promise((resolve,reject)=>{global.creativeQa.finishLog=resolve;global.creativeQa.failLog=reject;});});
  await page.getByRole('button',{name:'Analyze latest.log',exact:true}).click();await page.getByLabel('Performance instance').selectOption(ids.first);await page.getByText('Server falling behind · 1',{exact:true}).waitFor();await app.evaluate(()=>global.creativeQa.failLog(Error('Late failure from survival')));await page.waitForTimeout(250);assert.equal(await page.getByText(/Late failure from survival/).count(),0);assert(await page.getByRole('button',{name:'Analyze latest.log',exact:true}).isEnabled());
  console.log(JSON.stringify({passed:true,evidenceReports:66,noHistoryCutoff:true,saveStaysWithOriginalInstance:true,lateResultCannotReplaceNewInstance:true,lateErrorCannotReplaceNewInstance:true,filtersAndBusyReset:true},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>app?.close());
