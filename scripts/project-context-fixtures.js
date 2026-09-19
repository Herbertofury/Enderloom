'use strict';
const path=require('path'),crypto=require('crypto');const {DatabaseSync}=require('node:sqlite');const {zip,write}=require('./workbench-fixtures');
const {seedProjectSources}=require('./project-source-fixtures');
async function seedProjectContext(service){
  const fixture=await seedProjectSources(service),{first,second}=fixture;
  const mods=[['first','identity_fixture','Identity Workshop',{'depends':{'helper':'>=2','minecraft':'~1.20.1'},'breaks':{'broken_mod':'*'}}],['helper','helper','Helpful Library',{}],['addon','addon','Workshop Add-on',{'depends':{'identity_fixture':'>=1.0'}}],['sibling','identity_fixture_plus','Identity Workshop Plus',{}],['foo','foo','Shared Title',{}],['bar','bar','Shared Title',{}]];
  for(const [file,id,title,extra]of mods)write(first.dir,`mods/${file}.jar`,zip({'fabric.mod.json':JSON.stringify({id,name:title,version:'2.0',...extra})}));
  write(first.dir,'mods/older.jar.disabled',zip({'fabric.mod.json':'{"id":"identity_fixture","name":"Identity Workshop","version":"1.0"}'}));
  write(first.dir,'mods/forge-addon.jar',zip({'META-INF/mods.toml':'[[mods]]\nmodId="forge_addon"\nversion="1"\ndisplayName="Forge Add-on"\n[[dependencies.forge_addon]]\nmodId="identity_fixture"\nmandatory=false\nversionRange="[1,3)"\nside="CLIENT"\n'}));
  write(first.dir,'mods/quilt-addon.jar',zip({'quilt.mod.json':JSON.stringify({schema_version:1,quilt_loader:{id:'quilt_addon',group:'org.example',version:'1.0.0',metadata:{name:'Quilt Workshop Add-on'},depends:[{id:'identity_fixture',versions:{all:['>=1.0','<3']},optional:true,unless:{id:'replacement',versions:'*'}},['other_mod',{id:'org.example:identity_fixture',versions:['2.0','2.1'],environment:'client'}]],breaks:[{id:'broken_mod',versions:'*'}]},minecraft:{environment:'client'}})}));
  for(const file of ['config/identity_fixture-client.toml','config/identity_fixture_plus-client.toml','config/shared-title.json','config/custom.json','saves/identity_fixture/serverconfig/helper-server.toml','saves/Meadow/serverconfig/identity_fixture-server.toml'])write(first.dir,file,file.endsWith('.json')?'{}':'enabled=true\n');
  write(second.dir,'config/identity_fixture-client.toml','enabled=true\n');
  await service.close();const db=new DatabaseSync(path.join(service.dataDir,'basalt.db'));
  try{
    const insert=db.prepare("INSERT OR REPLACE INTO content_files(instance_id,kind,file_name,mod_id,mod_version,title,provider,project_id)VALUES(?,'mods',?,?,?,?,?,?)");
    for(const [file,id,title]of mods)insert.run(first.id,`${file}.jar`,id,'2.0',title,file==='first'?'modrinth':null,file==='first'?'alpha':null);
    insert.run(first.id,'older.jar','identity_fixture','1.0','Identity Workshop',null,null);
    insert.run(first.id,'forge-addon.jar','forge_addon','1.0','Forge Add-on',null,null);
    insert.run(first.id,'quilt-addon.jar','quilt_addon','1.0.0','Quilt Workshop Add-on',null,null);
    db.prepare('UPDATE content_files SET mod_id=? WHERE instance_id=?').run('identity_fixture',second.id);
  }finally{db.close();}
  return fixture;
}
module.exports={seedProjectContext};
async function seedProjectServer(service){
 const id=crypto.randomUUID(),dir=path.join(service.dataDir,'servers',id),name='Workshop dedicated server';
 write(dir,'mods/workshop.jar',zip({'fabric.mod.json':'{"id":"identity_fixture","name":"Identity Workshop","version":"2.0"}'}));
 write(dir,'config/identity_fixture-client.toml','enabled=true\n');write(dir,'server.properties','level-name=Meadow\n');write(dir,'Meadow/serverconfig/identity_fixture-server.toml','enabled=true\n');
 await service.close();const db=new DatabaseSync(path.join(service.dataDir,'basalt.db'));
 try{
  db.prepare('INSERT INTO servers(id,name,flavor,version_id,created_at,managed)VALUES(?,?,?,?,?,1)').run(id,name,'forge','1.20.1',new Date().toISOString());
  db.prepare("INSERT INTO server_content_files(server_id,kind,file_name,mod_id,mod_version,title,provider,project_id)VALUES(?,'mods','workshop.jar','identity_fixture','2.0','Identity Workshop','modrinth','alpha')").run(id);
 }finally{db.close();}
 await service.start();return {id,dir,name};
}
module.exports.seedProjectServer=seedProjectServer;

function worldNbt(name,enabled=[],disabled=[]){
 const string=value=>{const b=Buffer.from(value);const n=Buffer.alloc(2);n.writeUInt16BE(b.length);return Buffer.concat([n,b])};
 const tag=(type,name,payload)=>Buffer.concat([Buffer.from([type]),string(name),payload]);
 const list=items=>{const length=Buffer.alloc(4);length.writeInt32BE(items.length);return Buffer.concat([Buffer.from([8]),length,...items.map(string)])};
 const data=Buffer.concat([tag(8,'LevelName',string(name)),tag(10,'DataPacks',Buffer.concat([tag(9,'Enabled',list(enabled)),tag(9,'Disabled',list(disabled)),Buffer.from([0])])),Buffer.from([0])]);
 return require('zlib').gzipSync(tag(10,'',Buffer.concat([tag(10,'Data',data),Buffer.from([0])])));
}
function seedProjectWorlds(first,server){
 write(first.dir,'saves/Meadow/level.dat',worldNbt('Meadow',['vanilla','mod:identity_fixture'],['identity_fixture:legacy']));
 write(first.dir,'saves/identity_fixture/level.dat',worldNbt('Misleading mod name',['mod:identity_fixture_plus']));
 write(first.dir,'saves/Sky/level.dat',worldNbt('Sky Islands'));
 write(first.dir,'saves/Sky/dimensions/identity_fixture/islands/region/r.0.0.mca',Buffer.alloc(8192,1));
 write(first.dir,'saves/Archive/level.dat','corrupt');write(first.dir,'saves/Archive/level.dat_old',worldNbt('Recovered Archive',['mod:identity_fixture']));
 if(server)write(server.dir,'Meadow/level.dat',worldNbt('Dedicated Meadow',['mod:identity_fixture']));
}
module.exports.seedProjectWorlds=seedProjectWorlds;
