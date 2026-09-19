'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert/strict');
const {spawnSync}=require('child_process');const {zip,write}=require('./workbench-fixtures');
function seedCodeSymbols(instance) {
  const folder=fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-code-fixture-'));
  fs.mkdirSync(path.join(folder,'fixture'));fs.mkdirSync(path.join(folder,'nested'));
  const source=`package fixture;
public class Example {
  public static final String TITLE = "Snowman \\u2603 \\uD83C\\uDF38 \\u0000";
  public static final long BIG = 9999999999L;
  public static final double PRECISE = 1.25;
  private int state = 4;
  public int render(int speed) { return state + speed; }
  public String render(String name) { return name + TITLE; }
  public Runnable action() { return () -> System.out.print(TITLE); }
  ${Array.from({length:65},(_,i)=>`public static class Item${i} { public int value() { return ${i}; } }`).join('\n')}
}`;
  fs.writeFileSync(path.join(folder,'fixture/Example.java'),source);
  fs.writeFileSync(path.join(folder,'nested/Helper.java'),'package nested; public class Helper { public int version(){return 42;} }');
  const compile=args=>{const r=spawnSync('javac',args,{cwd:folder,encoding:'utf8',windowsHide:true});assert.equal(r.status,0,r.stderr);};
  compile(['--release','17','-g','fixture/Example.java']);compile(['--release','17','-g:none','nested/Helper.java']);
  const entries={'fabric.mod.json':JSON.stringify({id:'identity_fixture',name:'Identity Workshop',version:'2.0',license:'MIT',jars:[{file:'META-INF/jars/helper.jar'}]})};
  for(const file of fs.readdirSync(path.join(folder,'fixture')))if(file.endsWith('.class'))entries['fixture/'+file]=fs.readFileSync(path.join(folder,'fixture',file));
  const nestedBytes=fs.readFileSync(path.join(folder,'nested/Helper.class'));
  entries['META-INF/jars/helper.jar']=zip({'fabric.mod.json':'{"id":"code_helper","version":"1","license":"CC0-1.0"}','nested/Helper.class':nestedBytes});
  entries['private.jar']=zip({'fabric.mod.json':'{"id":"unlisted","version":"1"}','nested/Helper.class':nestedBytes});
  entries['broken.class']=Buffer.from('not class bytes');entries['truncated.class']=entries['fixture/Example.class'].subarray(0,80);
  const bytes=zip(entries);write(instance.dir,'mods/first.jar',bytes);
  return {bytes,entries,nestedBytes,folder};
}
module.exports={seedCodeSymbols};
