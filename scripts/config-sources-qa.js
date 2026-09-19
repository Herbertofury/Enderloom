'use strict';
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),os=require('os');const {DatabaseSync}=require('node:sqlite');const {LauncherService}=require('../src/launcher-service');const {seedConfigSources}=require('./config-source-fixtures');
const root=path.resolve(__dirname,'..'),temporary=fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-config-sources-'));const service=new LauncherService({rootDir:root,dataDir:path.join(temporary,'data')});
(async()=>{
 const {first}=await seedConfigSources(service);
 const before=await service.request('scan_instance_workbench',{instanceId:first.id,includeMods:false,quick:true});assert.equal(before.entries.find(e=>e.path==='config/rendering.toml').owner.id,'unassigned');
 const discover=()=>service.request('discover_mod_config_sources',{instanceId:first.id,fileName:'first.jar'});
 const reports=await Promise.all([discover(),discover(),discover()]);assert.deepEqual(reports[0],reports[1]);assert.deepEqual(reports[0],reports[2]);const report=reports[0];assert.equal(report.status,'checked',JSON.stringify(report));assert.equal(report.evidence.length,4);assert(report.evidence.every(e=>e.version_match));assert(report.evidence.every(e=>e.source_url.includes('/blob/1234567890abcdef1234567890abcdef12345678/')));
 const paths=before.entries.map(e=>e.path),owners=await service.request('resolve_config_owners',{instanceId:first.id,paths});
 for(const p of ['config/rendering.toml','config/special.json','config/forge-options.toml','saves/Meadow/serverconfig/dimension-settings.toml','defaultconfigs/dimension-settings.toml'])assert.equal(owners[p].owner.id,'identity_fixture',p);
 for(const p of ['config/comment.toml','config/sibling.toml','config/test.toml','config/quoted.toml','config/dimension-settings.toml'])assert(!owners[p].owner.evidence,p+' must not receive source evidence');
 await service.request('creative_library_action',{operation:'preferences',payload:{['config-owner:'+first.id+':config/rendering.toml']:'helper'}});
 const manual=await service.request('resolve_config_owners',{instanceId:first.id,paths});assert.equal(manual['config/rendering.toml'].owner.confidence,'manual');assert.equal(manual['config/rendering.toml'].owner.id,'helper');assert(manual['config/rendering.toml'].automatic_owner.evidence);
 await service.close();assert.deepEqual(await discover(),report,'Source evidence must survive restart without a network request');
 const scan=await service.request('scan_instance_workbench',{instanceId:first.id,includeMods:false});assert.equal(scan.entries.find(e=>e.path==='config/special.json').owner.id,'identity_fixture');
 await service.close();const db=new DatabaseSync(path.join(service.dataDir,'basalt.db'));
 try{
  const existing=db.prepare("SELECT key,body FROM api_cache WHERE key LIKE 'config-source:v1:%'").get();const evidence=JSON.parse(existing.body);evidence.evidence.forEach(e=>e.version_match=false);db.prepare('UPDATE api_cache SET body=? WHERE key=?').run(JSON.stringify(evidence),existing.key);
 }finally{db.close()}
 const suggested=await service.request('resolve_config_owners',{instanceId:first.id,paths});assert.equal(suggested['config/special.json'].owner.confidence,'suggested');
 await service.close();const changed=new DatabaseSync(path.join(service.dataDir,'basalt.db'));try{changed.prepare('UPDATE content_files SET project_id=? WHERE instance_id=? AND file_name=?').run('sibling',first.id,'first.jar');}finally{changed.close()}
 const detached=await service.request('resolve_config_owners',{instanceId:first.id,paths});assert(!detached['config/special.json'].owner.evidence,'Changing the provider binding must invalidate old source ownership');
 const quiltService=new LauncherService({rootDir:root,dataDir:path.join(temporary,'quilt-data')});
 try {
  const quilt=await seedConfigSources(quiltService,{quilt:true});const quiltReport=await quiltService.request('discover_mod_config_sources',{instanceId:quilt.first.id,fileName:'first.jar'});
  assert.equal(quiltReport.status,'checked',JSON.stringify(quiltReport));assert.equal(quiltReport.evidence.length,4);assert(quiltReport.evidence.every(e=>e.version_match));assert(!quiltReport.evidence.some(e=>e.path==='wrong-loader.toml'));
  const quiltOwners=await quiltService.request('resolve_config_owners',{instanceId:quilt.first.id,paths:['config/special.json']});assert.equal(quiltOwners['config/special.json'].owner.id,'identity_fixture');assert(quiltOwners['config/special.json'].owner.evidence);
 } finally {await quiltService.close();}
 console.log(JSON.stringify({passed:true,registrations:report.evidence.length,verified:['repository and production manifest identity','Quilt production identity and config paths','different loader branch rejected','immutable commit provenance','parallel deduplication','scope-specific exact paths','comments and examples rejected','sibling modules rejected','manual corrections preserved','restart cache','unverified versions labeled','provider changes invalidate evidence']},null,2));
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>service.close());
