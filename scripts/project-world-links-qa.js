'use strict';
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto');const {LauncherService}=require('../src/launcher-service');const {seedProjectContext,seedProjectServer,seedProjectWorlds}=require('./project-context-fixtures');
const root=path.resolve(__dirname,'..'),temporary=fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-world-links-')),service=new LauncherService({rootDir:root,dataDir:path.join(temporary,'data')});
(async()=>{
 const {first}=await seedProjectContext(service),server=await seedProjectServer(service);seedProjectWorlds(first,server);
 const hash=()=>crypto.createHash('sha256').update(fs.readFileSync(path.join(first.dir,'saves/Meadow/level.dat'))).update(fs.readFileSync(path.join(first.dir,'saves/Sky/dimensions/identity_fixture/islands/region/r.0.0.mca'))).digest('hex');const before=hash();
 const get=()=>service.request('get_project_context',{provider:'modrinth',projectId:'alpha'});let context=await get(),worlds=context.targets.find(t=>t.id===first.id).worlds;
 assert.deepEqual(worlds.map(w=>w.folder),['Archive','Meadow','Sky']);assert.equal(worlds[0].status,'recovered');assert(worlds[0].warning.includes('level.dat could not be read'));assert.equal(worlds[0].evidence[0].path,'level.dat_old/Data/DataPacks');assert(worlds[1].evidence.some(e=>e.kind==='enabled_datapack'));assert(worlds[1].evidence.some(e=>e.kind==='disabled_datapack'));assert(worlds[2].evidence.some(e=>e.kind==='dimension_storage'&&e.path==='dimensions/identity_fixture/islands/region'));
 assert.equal(context.targets.find(t=>t.id===server.id).worlds[0].name,'Dedicated Meadow');assert.equal(hash(),before);
 const outside=path.join(temporary,'outside');fs.mkdirSync(outside);fs.symlinkSync(path.join(first.dir,'saves/Sky'),path.join(first.dir,'saves/linked-world'),'junction');
 const after=await get();assert.equal(after.targets.find(t=>t.id===first.id).worlds.length,3,'World junctions must not be traversed');
 fs.writeFileSync(path.join(server.dir,'server.properties'),'level-name=../escape\n');context=await get();assert.equal(context.targets.find(t=>t.id===server.id).worlds.length,0);assert(context.targets.find(t=>t.id===server.id).warnings.some(w=>w.includes('unsafe')));
 console.log('PASS project world links: saved pack IDs, disabled packs, dimension storage, sibling/name rejection, recovered metadata provenance, dedicated server, junction/path protection and unchanged world bytes.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>service.close());
