'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert/strict');
const { NorthpointJobBridge } = require('./northpoint-job-bridge');

const toolkit = process.env.ENDERLOOM_MINECRAFT_DEV_KIT;
if (!toolkit) throw new Error('ENDERLOOM_MINECRAFT_DEV_KIT is required');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'northpoint-job-bridge-qa-'));
const project = path.join(root, 'project');
function write(rel, text) { const p=path.join(project, rel); fs.mkdirSync(path.dirname(p), {recursive:true}); fs.writeFileSync(p,text); }
write('src/common/java/example/HelloMod.java', 'package example; public class HelloMod { public static void main(String[] a){ System.out.print(Version.NAME+"|"+Platform.NAME+"|"+Flavor.NAME); } }\n');
write('src/common/java/example/Flavor.java', 'package example; public class Flavor { public static final String NAME="common"; }\n');
for (const loader of ['fabric','forge','neoforge']) {
  write(`src/loader/${loader}/java/example/Platform.java`, `package example; public class Platform { public static final String NAME="${loader}"; }\n`);
  write(`src/loader/${loader}/java/example/Flavor.java`, `package example; public class Flavor { public static final String NAME="${loader}"; }\n`);
}
for (const mc of ['1.20.1','1.21.1']) write(`src/version/${mc}/java/example/Version.java`, `package example; public class Version { public static final String NAME="${mc}"; }\n`);
write('src/cell/mc-1.21.1-fabric/java/example/Flavor.java', 'package example; public class Flavor { public static final String NAME="fabric-cell"; }\n');

(async()=>{
  const bridge = new NorthpointJobBridge({ toolkitRoot: toolkit, dataDir: path.join(root,'data') });
  const cells = [
    {id:'mc-1.21.1-fabric',minecraft:'1.21.1',loader:'fabric',java:21,support_state:'stable'},
    {id:'mc-1.21.1-neoforge',minecraft:'1.21.1',loader:'neoforge',java:21,support_state:'stable'},
    {id:'mc-1.20.1-fabric',minecraft:'1.20.1',loader:'fabric',java:17,support_state:'stable'},
    {id:'mc-1.20.1-forge',minecraft:'1.20.1',loader:'forge',java:17,support_state:'stable'},
  ];
  const first = await bridge.runSession({sessionId:'qa-session-0001',sourceRoot:project,primaryCell:'mc-1.21.1-fabric',cells,driverScript:'northpoint_fixture_driver.py',maxWorkers:4});
  assert.equal(first.ok,true, JSON.stringify(first));
  assert.equal(first.receipt.run.built.length,4);
  const second = await bridge.runSession({sessionId:'qa-session-0001',sourceRoot:project,primaryCell:'mc-1.21.1-fabric',cells,driverScript:'northpoint_fixture_driver.py',maxWorkers:4});
  assert.equal(second.ok,true, JSON.stringify(second));
  assert.equal(second.receipt.run.built.length,0);
  assert.equal(second.receipt.run.reused.length,4);
  console.log(JSON.stringify({status:'PASS',first:first.receipt.run,second:second.receipt.run},null,2));
})().catch((e)=>{console.error(e.stack||e);process.exitCode=1;});