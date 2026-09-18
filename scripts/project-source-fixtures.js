'use strict';
const path=require('path'),crypto=require('crypto');
const {DatabaseSync}=require('node:sqlite');
const {zip,write}=require('./workbench-fixtures');
async function seedProjectSources(service) {
  const first=await service.request('create_instance',{name:'Source identity A',versionId:'1.20.1',loader:null,loaderVersion:null});
  const second=await service.request('create_instance',{name:'Source identity B',versionId:'1.20.1',loader:null,loaderVersion:null});
  const bytes=zip({'fabric.mod.json':'{"id":"identity_fixture","version":"1.0"}'}),sha1=crypto.createHash('sha1').update(bytes).digest('hex');
  write(first.dir,'mods/first.jar',bytes);write(second.dir,'mods/second.jar',bytes);
  await service.close();
  const db=new DatabaseSync(path.join(service.dataDir,'basalt.db'));
  try {
    const cache=db.prepare('INSERT OR REPLACE INTO api_cache(key,body,etag,fetched_at,ttl_secs) VALUES(?,?,NULL,?,3600)');
    const put=(key,body)=>cache.run(key,JSON.stringify(body),Math.floor(Date.now()/1000));
    const icon='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect x="8" y="8" width="32" height="32" rx="8" fill="#62c6ac"/></svg>');
    for(const id of ['alpha','third','sibling']) {
      put(`mr:project:${id}`,{id,slug:id,title:id==='sibling'?'Identity Workshop Add-on':'Identity Workshop',icon_url:icon,body:`Description ${id}`});
      put(`mr:members:${id}`,[{role:'owner',user:{username:id==='sibling'?'Different author':'Fixture team'}}]);
    }
    put('mr:project:workshop-slug',{id:'alpha',slug:'alpha',title:'Identity Workshop',icon_url:icon});
    put('mr:members:workshop-slug',[{role:'owner',user:{username:'Fixture team'}}]);
    put('cf:project:989898',{data:{id:989898,name:'Identity Workshop',slug:'identity-workshop',authors:[{name:'Fixture team'}],logo:{url:icon},links:{websiteUrl:'https://www.curseforge.com/minecraft/mc-mods/identity-workshop'}}});
    put('cf:body:989898',{data:'Description beta'});
    put('cf:project:979797',{data:{id:979797,name:'Bad source',links:{websiteUrl:'https://curseforge.com.unrelated.example/fake'}}});
    put('cf:body:979797',{data:''});
    const content=db.prepare("INSERT INTO content_files(instance_id,kind,file_name,sha1,provider,project_id,version_id,title) VALUES(?,'mods',?,?,?,?,'same-version','Identity Workshop')");
    content.run(first.id,'first.jar',sha1,'modrinth','alpha');content.run(second.id,'second.jar',sha1,'curseforge','989898');
  } finally { db.close(); }
  await service.request('verify_project_artifacts',{provider:'modrinth',projectId:'alpha'});
  await service.request('verify_project_artifacts',{provider:'curseforge',projectId:'989898'});
  return {first,second,bytes};
}
module.exports={seedProjectSources};
