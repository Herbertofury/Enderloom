'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert/strict');
const { NorthpointJobBridge } = require('../src/northpoint-job-bridge');

const toolkit = process.env.ENDERLOOM_MINECRAFT_DEV_KIT || path.join(__dirname, '..', 'tools', 'minecraft-dev-kit');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'northpoint-job-bridge-v62-'));
const project = path.join(root, 'project');
function write(rel, text) { const p = path.join(project, rel); fs.mkdirSync(path.dirname(p), {recursive:true}); fs.writeFileSync(p, text); }
const cfg = {
  schema_version:1, mod_id:'stoneproof',
  build:{mode:'javac',source_roots:['src/main/java'],compile_only_source_roots:['qa-api/java'],resource_roots:['src/main/resources']},
  linkage:{target_classes:'__compile_only__',prefixes:['net/fabricmc/']},
  runtime:{required:true,command:['java','-cp','{artifact}{pathsep}{compile_only}','example.Smoke'],stdout_contains:'RUNTIME:'}
};
write('northpoint.project.json', JSON.stringify(cfg,null,2)+'\n');
write('overlays/common/qa-api/java/net/fabricmc/api/ModInitializer.java','package net.fabricmc.api; public interface ModInitializer { void onInitialize(); }\n');
write('overlays/common/src/main/java/example/ProofMod.java','package example; import net.fabricmc.api.ModInitializer; public final class ProofMod implements ModInitializer { public static boolean initialized; public void onInitialize(){initialized=true;} }\n');
write('overlays/common/src/main/java/example/Smoke.java','package example; public final class Smoke { public static void main(String[] a){ new ProofMod().onInitialize(); if(!ProofMod.initialized) throw new IllegalStateException(); System.out.print("RUNTIME:"+Version.MC); } }\n');
write('overlays/common/src/main/resources/fabric.mod.json',JSON.stringify({schemaVersion:1,id:'stoneproof',version:'1.0.0',name:'Stoneproof',environment:'*',entrypoints:{main:['example.ProofMod']},depends:{fabricloader:'>=0.15.0'}},null,2)+'\n');
write('overlays/common/src/main/resources/assets/stoneproof/lang/en_us.json',JSON.stringify({'item.stoneproof.proof':'Proof Item'})+'\n');
write('overlays/common/src/main/resources/data/stoneproof/tags/items/proof.json',JSON.stringify({replace:false,values:['minecraft:stone']})+'\n');
for (const mc of ['1.21.1','26.3']) write(`overlays/version/${mc}/src/main/java/example/Version.java`,`package example; public final class Version { public static final String MC="${mc}"; }\n`);

(async()=>{
  const bridge = new NorthpointJobBridge({toolkitRoot:toolkit,dataDir:path.join(root,'data')});
  const cells = [
    {id:'mc-1.21.1-fabric',minecraft:'1.21.1',loader:'fabric',java:21,support_state:'stable'},
    {id:'mc-26.3-fabric',minecraft:'26.3',loader:'fabric',java:25,support_state:'stable'},
  ];
  await assert.rejects(
    () => bridge.runSession({sessionId:'qa-session-v62',sourceRoot:project,primaryCell:'mc-1.21.1-fabric',cells,driverProfile:'fixture'}),
    /QA conversion drivers are disabled/
  );
  const first = await bridge.runSession({sessionId:'qa-session-v62',sourceRoot:project,primaryCell:'mc-1.21.1-fabric',cells,driverProfile:'production',maxWorkers:2,timeout:90});
  // Both targets configure a real javac/JVM smoke command, so neither is
  // runtime-unverified merely because it targets Minecraft 26.3.
  assert.equal(first.ok,true,JSON.stringify(first));
  assert.equal(first.partial,false,JSON.stringify(first));
  assert.equal(first.receipt.status,'PASS');
  assert.match(first.python.version,/Python 3/);
  assert.deepEqual(first.receipt.run.built,['mc-1.21.1-fabric','mc-26.3-fabric']);
  assert.deepEqual(first.receipt.run.blocked,[]);
  assert.deepEqual(first.receipt.run.failed,[]);
  assert.ok(first.matrix.cells.every(row => row.state === 'passed'),JSON.stringify(first.matrix));
  const second = await bridge.runSession({sessionId:'qa-session-v62',sourceRoot:project,primaryCell:'mc-1.21.1-fabric',cells,driverProfile:'production',maxWorkers:2,timeout:90});
  assert.equal(second.ok,true,JSON.stringify(second));
  assert.equal(second.partial,false,JSON.stringify(second));
  assert.equal(second.receipt.status,'PASS');
  assert.deepEqual(second.receipt.run.failed,[]);
  assert.deepEqual(second.receipt.run.blocked,[]);
  assert.deepEqual(second.receipt.run.built,[]);
  assert.deepEqual(second.receipt.run.reused,['mc-1.21.1-fabric','mc-26.3-fabric']);
  // Keep genuine partial-failure coverage: make only the secondary target's
  // JVM smoke fail, then repair it without invalidating the primary target.
  const failingSmoke = 'overlays/version/26.3/src/main/java/example/Smoke.java';
  write(failingSmoke,'package example; public final class Smoke { public static void main(String[] a){ throw new IllegalStateException("EXPECTED_SECONDARY_RUNTIME_FAILURE"); } }\n');
  const failed = await bridge.runSession({sessionId:'qa-session-v62',sourceRoot:project,primaryCell:'mc-1.21.1-fabric',cells,driverProfile:'production',maxWorkers:2,timeout:90});
  assert.equal(failed.ok,false,JSON.stringify(failed));
  assert.equal(failed.partial,true,JSON.stringify(failed));
  assert.equal(failed.receipt.status,'PARTIAL');
  assert.deepEqual(failed.receipt.run.built,['mc-26.3-fabric']);
  assert.deepEqual(failed.receipt.run.reused,['mc-1.21.1-fabric']);
  assert.deepEqual(failed.receipt.run.failed,['mc-26.3-fabric']);
  assert.deepEqual(failed.receipt.run.blocked,[]);
  const failedRow = failed.matrix.cells.find(row => row.cell_id === 'mc-26.3-fabric');
  assert.equal(failedRow.state,'failed',JSON.stringify(failedRow));
  assert.match(failedRow.reason,/EXPECTED_SECONDARY_RUNTIME_FAILURE/);
  // The matrix retains the last artifact for diagnosis; only passed cells
  // may appear in the releasable checksum list.
  const failedSums = fs.readFileSync(path.join(failed.state_dir,'release','SHA256SUMS.txt'),'utf8');
  assert.match(failedSums,/mc-1\.21\.1-fabric\.jar/);
  assert.doesNotMatch(failedSums,/mc-26\.3-fabric\.jar/);
  assert.equal(failed.matrix.cells.find(row => row.cell_id === 'mc-1.21.1-fabric').artifact.sha256,
    first.matrix.cells.find(row => row.cell_id === 'mc-1.21.1-fabric').artifact.sha256);

  fs.unlinkSync(path.join(project,failingSmoke));
  const recovered = await bridge.runSession({sessionId:'qa-session-v62',sourceRoot:project,primaryCell:'mc-1.21.1-fabric',cells,driverProfile:'production',maxWorkers:2,timeout:90});
  assert.equal(recovered.ok,true,JSON.stringify(recovered));
  assert.equal(recovered.partial,false,JSON.stringify(recovered));
  assert.equal(recovered.receipt.status,'PASS');
  assert.deepEqual(recovered.receipt.run.built,['mc-26.3-fabric']);
  assert.deepEqual(recovered.receipt.run.reused,['mc-1.21.1-fabric']);
  assert.deepEqual(recovered.receipt.run.failed,[]);
  assert.deepEqual(recovered.receipt.run.blocked,[]);
  assert.ok(recovered.matrix.cells.every(row => row.state === 'passed'),JSON.stringify(recovered.matrix));
  console.log(JSON.stringify({status:'PASS',first:first.receipt.run,second:second.receipt.run,
    failed:failed.receipt.run,recovered:recovered.receipt.run,driver:first.driver_profile,
    runtime_scope:'REAL-JAVAC-AND-JVM-FIXTURE-ONLY; MINECRAFT-NOT-RUN'},null,2));
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});