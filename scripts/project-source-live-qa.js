'use strict';
const assert=require('assert/strict'),fs=require('fs'),os=require('os'),path=require('path');
const {LauncherService}=require('../src/launcher-service');
const root=path.resolve(__dirname,'..'),service=new LauncherService({rootDir:root,dataDir:fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-source-live-'))});
(async()=>{
  const preview=await service.request('preview_project_source_link',{provider:'curseforge',projectId:'328085',otherProvider:'modrinth',otherProjectId:'create'});
  assert.equal(preview.left.project_id,'328085');assert.equal(preview.left.provider,'curseforge');assert.equal(preview.right.provider,'modrinth');assert(preview.left.title&&preview.right.title&&preview.right.project_id);
  assert.equal((await service.request('get_project_artifact_graph',{provider:'curseforge',projectId:'328085'})).project,null,'Live preview must not silently link projects');
  const report={passed:true,checkedAt:new Date().toISOString(),mode:'read-only official provider lookup',...preview};fs.mkdirSync(path.join(root,'output'),{recursive:true});fs.writeFileSync(path.join(root,'output/project-source-live-qa.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(()=>service.close());
