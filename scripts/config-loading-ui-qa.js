'use strict';
const assert=require('assert/strict'),path=require('path');
const {_electron:electron}=require('playwright');
const root=path.resolve(__dirname,'..'); let app;
(async()=>{
  app=await electron.launch({executablePath:path.join(root,'node_modules/electron/dist/electron.exe'),args:[path.join(root,'scripts/fixtures/creative-ui-host.cjs')]});
  const page=await app.firstWindow(); page.setDefaultTimeout(10000); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.getByRole('button',{name:'Open Evergreen · creative workshop',exact:true}).waitFor();
  await app.evaluate(({ipcMain})=>{
    global.creativeQa.scanCalls=[];
    global.creativeQa.gate=new Promise(resolve=>global.creativeQa.releaseScan=resolve);
    ipcMain.removeHandler('launcher:invoke');
    ipcMain.handle('launcher:invoke',async(_event,r)=>{
      if(r.command==='scan_instance_workbench'){
        global.creativeQa.scanCalls.push(r.args);
        if(!r.args.quick) await global.creativeQa.gate;
      }
      return global.creativeQa.service.request(r.command,r.args);
    });
  });
  const nav=name=>page.getByRole('button',{name,exact:true}).first().click();
  await nav('Config'); await page.getByRole('button',{name:/visuals.json/}).click();
  await page.getByText('Checking for changes in the background. You can browse and edit your configs.',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Edit config',exact:true}).click();
  await page.getByRole('switch',{name:'ambient_particles'}).waitFor();
  await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).last().click();
  await nav('Addons'); await nav('Config');
  await page.getByRole('button',{name:/visuals.json/}).waitFor();
  assert.equal(await page.getByText('Getting to know your instance…',{exact:true}).count(),0,'Warm tabs never return to the empty loading screen');
  const calls=await app.evaluate(()=>global.creativeQa.scanCalls);
  assert.equal(calls.filter(c=>c.quick).length,1); assert.equal(calls.filter(c=>!c.quick).length,1,'Config and Addons share their in-flight validation');
  await app.evaluate(()=>global.creativeQa.releaseScan());
  await page.getByText('Checking for changes in the background. You can browse and edit your configs.',{exact:true}).waitFor({state:'detached'});
  assert.deepEqual(errors,[]);
  console.log('PASS real Electron: config editor works before full validation, Config/Addons reuse inventory and one background scan, no loading-screen flash, zero renderer errors.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>app?.close());
