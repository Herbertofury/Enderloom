'use strict';
const path=require('path'),crypto=require('crypto');
const {DatabaseSync}=require('node:sqlite');
const {zip,write}=require('./workbench-fixtures');
function workshopBundle(version='4.0') {
 const quilt=zip({'quilt.mod.json':JSON.stringify({schema_version:1,quilt_loader:{id:'quilt_core',version:'1.3',group:'org.example',metadata:{name:'Quilt Core',license:{id:'LicenseRef-QuiltFixture',name:'Quilt fixture license',url:'https://example.org/quilt-license'},contact:{sources:'https://github.com/example/quilt-core'}},entrypoints:{init:['example.QuiltInit']},depends:[{id:'helper',versions:'>=2'}]}})});
 const fabric=zip({'fabric.mod.json':JSON.stringify({schemaVersion:1,id:'bundled_helper',name:'Bundled Helper',version,license:'CC0-1.0',depends:{identity_fixture:'>=2'},jars:[{file:'nested/quilt.jar'}]}),'nested/quilt.jar':quilt});
 const neo=zip({'META-INF/neoforge.mods.toml':'license="LGPL-3.0-only"\nissueTrackerURL="https://example.org/issues"\n[[mods]]\nmodId="neo_bundle"\nversion="3.1"\ndisplayName="Bundled Neo Library"\n[[dependencies.neo_bundle]]\nmodId="identity_fixture"\ntype="required"\nversionRange="[2,)"\nside="BOTH"\n'});
 const ghost=zip({'fabric.mod.json':'{"id":"unrelated_example","version":"1"}'});
 const primary={'fabric.mod.json':JSON.stringify({id:'identity_fixture',name:'Identity Workshop',version:'2.0',license:['MIT','Apache-2.0'],contact:{sources:'https://github.com/example/identity-workshop',issues:'javascript:alert(1)',homepage:'https://user:password@example.org/private'},entrypoints:{main:['example.Workshop',{adapter:'kotlin',value:'example.Workshop::init'}]},depends:{helper:'>=2',bundled_helper:'>=4'},jars:[{file:'META-INF/jars/helper.jar'},{file:'../escape.jar'},{file:'missing.jar'},{file:'broken.jar'}]}),
  'META-INF/jars/helper.jar':fabric,'META-INF/jarjar/neo.jar':neo,'examples/unlisted.jar':ghost,'broken.jar':'corrupt',
  'META-INF/jarjar/metadata.json':JSON.stringify({jars:[{identifier:{group:'org.example',artifact:'neo'},version:{range:'[3,)',artifactVersion:'3.1'},path:'META-INF/jarjar/neo.jar'},{path:'META-INF/jars/helper.jar'}]})};
 return {bytes:zip(primary),manifestSha256:crypto.createHash('sha256').update(primary['fabric.mod.json']).digest('hex'),sha256:crypto.createHash('sha256').update(fabric).digest('hex')};
}
async function seedBundledMods(service,first) {
 const bundle=workshopBundle();write(first.dir,'mods/first.jar',bundle.bytes);
 const legacy=zip({'mcmod.info':JSON.stringify({modList:[{modid:'legacy_addon',name:'Legacy Workshop Add-on',version:'1.2',requiredMods:['identity_fixture@[1,3)'],dependencies:['helper@2.0']}]})});
 write(first.dir,'mods/legacy-addon.jar',legacy);
 await service.close();const db=new DatabaseSync(path.join(service.dataDir,'basalt.db'));
 try {db.prepare("INSERT OR REPLACE INTO content_files(instance_id,kind,file_name,mod_id,mod_version,title) VALUES(?,'mods','legacy-addon.jar','legacy_addon','1.2','Legacy Workshop Add-on')").run(first.id);} finally{db.close();}
 return bundle;
}
module.exports={seedBundledMods,workshopBundle};
