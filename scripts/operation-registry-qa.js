'use strict';
const assert=require('assert/strict'),fs=require('fs'),os=require('os'),path=require('path'),{spawnSync}=require('child_process');
const {LauncherService}=require('../src/launcher-service');
const root=path.resolve(__dirname,'..'),data=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-registry-')),'data');
const source=JSON.parse(fs.readFileSync(path.join(root,'native/src/capabilities.json')));
const cli=args=>{const r=spawnSync(path.join(root,'native/target/debug/enderloom.exe'),['--data-dir',data,...args,'--json'],{encoding:'utf8',windowsHide:true,timeout:15000});assert.ifError(r.error);return {code:r.status,...JSON.parse(r.stdout)};};
const service=new LauncherService({rootDir:root,dataDir:data});
(async()=>{
  const full=cli(['capabilities']);assert.equal(full.code,0);assert.deepEqual(full.result,source);
  const ids=new Set(),domains=[...new Set(source.map(e=>e.domain))];
  for(const entry of source){assert.match(entry.id,/^[a-z][a-z0-9_]*$/);assert(!ids.has(entry.id));ids.add(entry.id);assert.match(entry.domain,/^[a-z][a-z0-9_]*$/);assert(['read','write','destructive'].includes(entry.classification));}
  for(const domain of domains){const filtered=cli(['capabilities','--domain',domain]);assert.equal(filtered.code,0);assert.deepEqual(filtered.result,source.filter(e=>e.domain===domain));}
  for(const classification of ['read','write','destructive']){const filtered=cli(['capabilities','--classification',classification]);assert.equal(filtered.code,0);assert.deepEqual(filtered.result,source.filter(e=>e.classification===classification));}
  const both=cli(['capabilities','--domain','snapshots','--classification','destructive']);assert.equal(both.code,0);assert(both.result.some(e=>e.id==='restore_instance_snapshot'));assert(both.result.every(e=>e.domain==='snapshots'&&e.classification==='destructive'));
  const description=cli(['operation','describe','restore_instance_snapshot']);assert.equal(description.command,'operation describe');assert.deepEqual(description.result,source.find(e=>e.id==='restore_instance_snapshot'));assert.equal(description.result.plan_command,'plan_restore_instance_snapshot');
  assert.equal(cli(['capabilities','--domain','made_up']).code,2);assert.equal(cli(['capabilities','--classification','safe']).code,2);
  assert.equal(cli(['operation','describe','made_up']).code,3);assert.equal(cli(['operation','describe','restore_instance_snapshot','--plan']).code,2);
  assert(!fs.existsSync(data),'Discovery opened user data');
  assert.deepEqual(await service.request('get_capabilities'),source);
  assert.deepEqual(await service.request('get_capabilities',{domain:'snapshots',classification:'destructive'}),both.result);
  await assert.rejects(service.request('get_capabilities',{domain:'made_up'}),/unknown variant/);
  const report={passed:true,operations:source.length,domains:domains.length,typedDomainAndClassification:true,filteredDiscovery:true,offlineDescribe:true,noDiscoveryDataAccess:true,sharedServiceParity:true,unknownValuesRejected:true};
  fs.writeFileSync(path.join(root,'output/operation-registry-qa.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>service.close());
