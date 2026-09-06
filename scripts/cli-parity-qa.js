'use strict';
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const { serviceCommands, apiCommands } = require('./lib/command-surface');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root,file),'utf8');
function audit(serviceSource, apiSource, registry, cliSource) {
  const service = serviceCommands(serviceSource), api = apiCommands(apiSource);
  const ids = registry.map(r=>r.id);
  assert.equal(new Set(ids).size,ids.length,'Duplicate capability IDs');
  for (const id of new Set([...service,...api])) {
    const entry = registry.find(r=>r.id===id);
    assert(entry,`Missing capability descriptor: ${id}`);
    assert(['read','write','destructive'].includes(entry.classification),`Unreviewed classification: ${id}`);
    assert.equal(entry.schema_version,1,`Unsupported machine schema: ${id}`);
    assert(entry.cli_route || entry.visual_only_reason,`No CLI route or reviewed visual exception: ${id}`);
    if (entry.service_command) assert(service.includes(entry.service_command),`Missing shared service route: ${id}`);
    else if (!entry.visual_only_reason) assert(cliSource.includes(`id == "${id}"`),`Missing explicit orchestration route: ${id}`);
    if (entry.cli_route) assert.equal(entry.cli_route,`operation run ${id}`,`Unknown operation route: ${id}`);
    if(entry.plan_command)assert(service.includes(entry.plan_command),`Missing plan operation: ${id}`);
    if(entry.cancellation_command)assert(service.includes(entry.cancellation_command),`Missing cancellation operation: ${id}`);
    assert.equal(entry.gui_routes.length>0,api.includes(id),`GUI exposure drift: ${id}`);
  }
  for(const id of ids) assert(service.includes(id)||api.includes(id),`Stale capability descriptor: ${id}`);
  assert(cliSource.includes('service::dispatch(state, command, &args).await'),'CLI no longer calls shared service dispatch');
  assert(!/launch::launch_instance|content::add|Db::open|FileManager::new/.test(cliSource),'CLI duplicated domain/bootstrap implementation');
  return {service:service.length,api:api.length,capabilities:registry.length,visualOnly:registry.filter(r=>r.visual_only_reason).map(r=>r.id)};
}
const service=read('native/src/service.rs'), api=read('launcher/src/lib/api.ts'), cli=read('native/src/cli_headless.rs');
const registry=JSON.parse(read('native/src/capabilities.json'));
const report=audit(service,api,registry,cli);
assert(!serviceCommands(service).includes('running'),'Nested match value incorrectly exposed as a domain operation');
assert.throws(()=>audit(service.replace('match command {','match command {\n        "new_unmapped_domain_operation" => Ok(Value::Null),'),api,registry,cli),/Missing capability descriptor/);
assert.throws(()=>audit(service,api,registry.map(r=>r.id==='create_instance'?{...r,cli_route:null}:r),cli),/No CLI route/);
assert.throws(()=>audit(service,api,registry,cli.replace('service::dispatch(state, command, &args).await','duplicated_launcher(state, command, &args).await')),/shared service dispatch/);
console.log(JSON.stringify({passed:true,...report,unmappedOperationChallenge:true,missingRouteChallenge:true,sharedDomainChallenge:true,fullTypedCliParity:false},null,2));
