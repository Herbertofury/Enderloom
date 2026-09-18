'use strict';
const assert=require('assert/strict'),fs=require('fs'),os=require('os'),path=require('path'),crypto=require('crypto');
const {DatabaseSync}=require('node:sqlite');
const {LauncherService}=require('../src/launcher-service'); const {zip,write}=require('./workbench-fixtures');
const root=path.resolve(__dirname,'..'),temporary=fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-graph-regression-'));
const service=new LauncherService({rootDir:root,dataDir:path.join(temporary,'data'),resourcesDir:root});
async function editDatabase(edit){await service.close();const db=new DatabaseSync(path.join(temporary,'data/basalt.db'));try{return edit(db);}finally{db.close();}}
(async()=>{
  const instance=await service.request('create_instance',{name:'Identity fixture',versionId:'1.20.1',loader:null,loaderVersion:null});
  const second=await service.request('create_instance',{name:'Alias fixture',versionId:'1.20.1',loader:null,loaderVersion:null});
  const bytes=zip({'fabric.mod.json':'{"id":"graph_fixture","version":"1.0"}'}),sha1=crypto.createHash('sha1').update(bytes).digest('hex'),sha256=crypto.createHash('sha256').update(bytes).digest('hex');
  for(const item of [instance,second])write(item.dir,'mods/same-name.jar',bytes);
  await editDatabase(db=>db.prepare("INSERT INTO content_files(instance_id,kind,file_name,sha1,provider,project_id,title) VALUES(?,'mods','same-name.jar',?,'curseforge','alpha','Identity fixture')").run(instance.id,sha1));
  const verify=(provider='curseforge',projectId='alpha')=>service.request('verify_project_artifacts',{provider,projectId});
  const get=(provider='curseforge',projectId='alpha')=>service.request('get_project_artifact_graph',{provider,projectId});
  let graph=await verify();assert.equal(graph.observations.length,1);assert.equal(graph.observations[0].release_id,null);assert.equal(graph.releases.length,0);assert.equal(graph.observations[0].artifact.sha256,sha256);
  await editDatabase(db=>db.prepare("UPDATE content_files SET project_id='beta' WHERE instance_id=?").run(instance.id));
  await verify('curseforge','beta');assert.equal((await get()).observations[0].current,false);assert.equal((await get('curseforge','beta')).observations[0].current,true);
  await editDatabase(db=>db.prepare("UPDATE content_files SET project_id='alpha',version_id='same-version' WHERE instance_id=?").run(instance.id));
  graph=await verify();const projectId=graph.project.id;
  await editDatabase(db=>{
    db.prepare("INSERT INTO graph_project_aliases VALUES('modrinth','paired',?)").run(projectId);
    db.prepare("INSERT INTO content_files(instance_id,kind,file_name,sha1,provider,project_id,version_id,title) VALUES(?,'mods','same-name.jar',?,'modrinth','paired','same-version','Identity fixture')").run(second.id,sha1);
  });
  graph=await verify('modrinth','paired');assert.equal(graph.project.id,projectId);assert.equal(graph.releases.length,2);assert.notEqual(graph.releases[0].id,graph.releases[1].id);assert(graph.releases.every(r=>r.artifacts.length===1&&r.artifacts[0].sha256===sha256));
  await editDatabase(db=>db.prepare('UPDATE graph_artifacts SET size=size+1 WHERE sha256=?').run(sha256));
  await assert.rejects(verify(),/Conflicting measurements for an immutable artifact/);
  await editDatabase(db=>db.prepare('UPDATE graph_artifacts SET size=? WHERE sha256=?').run(bytes.length,sha256));
  graph=await verify();const linked=graph.observations.filter(o=>o.release_id).length;
  await editDatabase(db=>{db.exec('DROP TABLE graph_project_observations; PRAGMA user_version=21;');});
  graph=await get();assert.equal(graph.observations.length,linked,'Schema 21 release-linked observations are recovered');assert.equal(graph.releases.length,2);
  await service.close();graph=await get();assert.equal(graph.observations.length,linked,'Migration is idempotent across restarts');
  const version=await editDatabase(db=>db.prepare('PRAGMA user_version').get().user_version);assert.equal(version,23);
  assert(fs.readFileSync(path.join(instance.dir,'mods/same-name.jar')).equals(bytes));
  const result={passed:true,schema:version,checks:['versionless project remains visible','project claims isolated without a release','alias reuses canonical project','provider version IDs cannot collide','immutable metadata conflict rejected','schema 21 migration','restart idempotence','source bytes preserved']};
  fs.mkdirSync(path.join(root,'output'),{recursive:true});fs.writeFileSync(path.join(root,'output/graph-regression-qa.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>service.close());
