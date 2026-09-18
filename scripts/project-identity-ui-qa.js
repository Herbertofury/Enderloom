'use strict';
const assert=require('assert/strict'),path=require('path');
const {_electron:electron}=require('playwright'); const root=path.resolve(__dirname,'..');let app;
(async()=>{
  app=await electron.launch({executablePath:path.join(root,'node_modules/electron/dist/electron.exe'),args:[path.join(root,'scripts/fixtures/creative-ui-host.cjs')]});
  const page=await app.firstWindow();page.setDefaultTimeout(10000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.getByRole('button',{name:'Open Evergreen · creative workshop',exact:true}).waitFor();
  await app.evaluate(({ipcMain})=>{
    const summary=id=>({id,slug:id,title:`Identity ${id}`,description:'Isolated identity UI fixture',icon_url:null,downloads:10,follows:1,author:'QA fixture',categories:[],game_versions:['1.20.1'],loaders:['forge'],updated:null,color:null});
    const graph=id=>({schema_version:1,project:{id,title:`Identity ${id}`,aliases:[{provider:'modrinth',project_id:id}]},releases:[],observations:[{observation_id:id==='alpha'?1:2,target_kind:'instance',target_id:'qa',content_kind:'mods',file_name:`${id}.jar`,artifact:{sha256:(id==='alpha'?'a':'b').repeat(64),size:10,evidence_class:'measured',hashes:[]},release_id:null,provider_version_id:null,source_match:'verified',observed_at:Date.now(),current:true,previous_sha256:null}]});
    global.creativeQa.verifyGate=new Promise(resolve=>global.creativeQa.releaseVerification=resolve);
    ipcMain.removeHandler('launcher:invoke');ipcMain.handle('launcher:invoke',async(_event,r)=>{
      const id=r.args?.projectId;
      if(r.command==='search_content') return {hits:['alpha','beta'].map(summary),total:2,offset:0,limit:40};
      if(r.command==='get_project_details') return {...summary(id),body:`Description ${id}`,body_format:'markdown',gallery:[],links:[],license:null,published:null,website_url:null};
      if(r.command==='list_project_versions') return [];
      if(r.command==='get_project_artifact_graph') return graph(id);
      if(r.command==='verify_project_artifacts'){await global.creativeQa.verifyGate;return graph(id);}
      return global.creativeQa.service.request(r.command,r.args);
    });
  });
  const open=async id=>{await page.getByRole('button',{name:'Discover',exact:true}).first().click();await page.getByRole('button',{name:`Identity ${id}`,exact:true}).first().click();await page.getByText(`Description ${id}`,{exact:true}).waitFor();const details=page.locator('details').filter({has:page.getByText('Installed file identity',{exact:false})});if(!await details.getAttribute('open').then(v=>v!==null))await details.locator('summary').click();return details;};
  let details=await open('alpha');await details.getByText('alpha.jar',{exact:true}).waitFor();
  await details.getByRole('button',{name:'Verify installed files',exact:true}).click();await details.getByRole('button',{name:'Verifying files…',exact:true}).waitFor();
  details=await open('beta');await details.getByText('beta.jar',{exact:true}).waitFor();
  await app.evaluate(()=>global.creativeQa.releaseVerification());
  await details.getByText('Matches recorded source hash',{exact:true}).waitFor();
  assert.equal(await details.getByText('alpha.jar',{exact:true}).count(),0,'Late previous-project verification cannot replace the current identity');
  assert.equal(await details.getByText('Matches recorded release',{exact:true}).count(),0,'A source hash without a version is not labeled a verified release');
  assert.deepEqual(errors,[]);console.log('PASS real Electron project identity navigation, stale verification isolation and version-unknown source-hash labeling.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>app?.close());
