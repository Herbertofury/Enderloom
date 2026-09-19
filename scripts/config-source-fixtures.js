'use strict';
const path=require('path');const {DatabaseSync}=require('node:sqlite');const {seedProjectContext}=require('./project-context-fixtures');const {write,zip}=require('./workbench-fixtures');
async function seedConfigSources(service,{quilt=false}={}){
 const fixtures=await seedProjectContext(service);await service.close();const db=new DatabaseSync(path.join(service.dataDir,'basalt.db'));
 try{
  const put=(key,body)=>db.prepare('INSERT OR REPLACE INTO api_cache(key,body,etag,fetched_at,ttl_secs) VALUES(?,?,NULL,?,86400)').run(key,typeof body==='string'?body:JSON.stringify(body),Math.floor(Date.now()/1000));
  const project=JSON.parse(db.prepare('SELECT body FROM api_cache WHERE key=?').get('mr:project:alpha').body);project.source_url='https://github.com/enderloom-qa/workshop';put('mr:project:alpha',project);
  const sha='1234567890abcdef1234567890abcdef12345678',tree='abcdef1234567890abcdef1234567890abcdef12';
  const manifest=quilt?'quilt.mod.json':'fabric.mod.json';
  const metadata=quilt?{schema_version:1,quilt_loader:{id:'identity_fixture',version:'2.0',group:'org.example',metadata:{name:'Identity Workshop'}}}:{id:'identity_fixture',version:'2.0'};
  if(quilt)write(fixtures.first.dir,'mods/first.jar',zip({[manifest]:JSON.stringify(metadata)}));
  const files={
   ['src/main/resources/'+manifest]:JSON.stringify(metadata),
   'src/main/java/workshop/Config.java':`// registerConfig(ModConfig.Type.CLIENT, SPEC, "comment.toml");
class Config {
 registerConfig(ModConfig.Type.CLIENT, SPEC, "rendering.toml");
 registerConfig(ModConfig.Type.SERVER, makeSpec(foo, bar), "dimension-settings.toml");
 ${quilt?'QuiltLoader':'FabricLoader'}.getInstance().getConfigDir().resolve("special.json");
 FMLPaths.CONFIGDIR.get().resolve("forge-options.toml");
 String example = "registerConfig(ModConfig.Type.CLIENT, SPEC, \\\"quoted.toml\\\");";
 Paths.get("somewhere").resolve("unrelated.json");
 registerConfig(ModConfig.Type.CLIENT, SPEC, "../escape.toml");
 registerConfig(ModConfig.Type.CLIENT, SPEC, "dynamic-" + loader + ".toml");
}`,
   'sibling/src/main/resources/fabric.mod.json':JSON.stringify({id:'sibling',version:'2.0'}),
   'sibling/src/main/java/sibling/Config.java':'registerConfig(ModConfig.Type.CLIENT, SPEC, "sibling.toml");',
   'src/test/java/TestConfig.java':'registerConfig(ModConfig.Type.CLIENT, SPEC, "test.toml");',
   'src/main/java/Example.java':'// not a config class',
   'wrongloader/src/main/resources/META-INF/mods.toml':'[[mods]]\nmodId="identity_fixture"\nversion="2.0"\n',
   'wrongloader/src/main/java/workshop/Config.java':'registerConfig(ModConfig.Type.CLIENT, SPEC, "wrong-loader.toml");',
  };
  const api='https://api.github.com/repos/enderloom-qa/workshop';
  put('config-source:http:'+api+'/commits/refs%2Ftags%2F2.0',{sha});
  put('config-source:http:'+api+`/git/trees/${sha}?recursive=1`,{sha:tree,truncated:false,tree:Object.keys(files).map(path=>({path,type:'blob',sha:'blob'}))});
  for(const [name,body]of Object.entries(files))put(`config-source:http:https://raw.githubusercontent.com/enderloom-qa/workshop/${sha}/${name}`,body);
  for(const file of ['config/rendering.toml','config/special.json','config/forge-options.toml','saves/Meadow/serverconfig/dimension-settings.toml','defaultconfigs/dimension-settings.toml','config/dimension-settings.toml','config/comment.toml','config/sibling.toml','config/test.toml','config/quoted.toml'])write(fixtures.first.dir,file,file.endsWith('.json')?'{}':'enabled=true\n');
 }finally{db.close()}
 return fixtures;
}
module.exports={seedConfigSources};
