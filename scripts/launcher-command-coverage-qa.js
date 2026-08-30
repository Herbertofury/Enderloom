'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const apiPath = path.join(root, 'launcher', 'src', 'lib', 'api.ts');
const servicePath = path.join(root, 'native', 'src', 'service.rs');
const processPath = path.join(root, 'native', 'src', 'launch', 'process.rs');
const mainPath = path.join(root, 'main.js');

const apiSource = fs.readFileSync(apiPath, 'utf8');
const serviceSource = fs.readFileSync(servicePath, 'utf8');
const processSource = fs.readFileSync(processPath, 'utf8');
const mainSource = fs.readFileSync(mainPath, 'utf8');

const apiCommands = [...apiSource.matchAll(/call(?:<[^;()]*?>)?\(\s*["']([a-z][a-z0-9_]*)["']/g)]
  .map((match) => match[1]);
const dispatchSource = serviceSource.slice(
  serviceSource.indexOf('match command {'),
  serviceSource.indexOf('fn data_dir_from_args'),
);
const serviceCommands = [...dispatchSource.matchAll(/"([a-z][a-z0-9_]*)"\s*(?:\||=>)/g)]
  .map((match) => match[1]);
const electronCommands = [...mainSource.matchAll(/command\s*===\s*["']([a-z][a-z0-9_]*)["']/g)]
  .map((match) => match[1]);

const uniqueSorted = (values) => [...new Set(values)].sort();
const frontend = uniqueSorted(apiCommands);
const rust = uniqueSorted(serviceCommands);
const electron = uniqueSorted(electronCommands);
const implemented = uniqueSorted([...rust, ...electron]);
const implementedSet = new Set(implemented);
const missing = frontend.filter((command) => !implementedSet.has(command));

const requiredMilestone = [
  'create_instance',
  'get_app_info',
  'get_instance_launch_command',
  'get_instance_organization',
  'get_java_status',
  'list_accounts',
  'list_instances',
  'list_installed_versions',
  'list_javas',
  'list_loader_versions',
  'list_versions',
  'remove_account',
  'set_active_account',
];

assert(frontend.length >= 190, `expected the full Basalt API surface, found only ${frontend.length}`);
assert.equal(apiCommands.length, frontend.length, 'duplicate frontend IPC command names found');
for (const command of requiredMilestone) {
  assert(implementedSet.has(command), `initial launcher milestone command is missing: ${command}`);
}
for (const command of ['launch_instance', 'kill_instance', 'list_running', 'get_logs', 'close_running']) {
  assert(implementedSet.has(command), `process supervision command is missing: ${command}`);
}
assert(
  /launch_instance_ipc\(event_sink, state, &instance\)\.await/.test(serviceSource),
  'launch_instance is not routed through the real Rust launch pipeline',
);
assert(
  /recover_processes_ipc\(/.test(serviceSource) && /ProcessEvents::ipc/.test(processSource),
  'Electron IPC process recovery/event delivery is missing',
);
assert(
  /if kill\.is_ok\(\)/.test(processSource),
  'process supervision must distinguish an explicit kill from service-channel shutdown',
);
assert(
  /command === 'copy_screenshot'/.test(mainSource) &&
    /nativeImage\.createFromPath\(target\)/.test(mainSource) &&
    /clipboard\.writeImage\(image\)/.test(mainSource),
  'screenshot copy must cross the Rust validation boundary before Electron writes the clipboard',
);

console.log(JSON.stringify({
  passed: true,
  frontendCommands: frontend.length,
  implementedCommands: frontend.filter((command) => implementedSet.has(command)).length,
  rustCommands: rust.length,
  electronGlueCommands: electron,
  missingCommands: missing.length,
  missing,
}, null, 2));
