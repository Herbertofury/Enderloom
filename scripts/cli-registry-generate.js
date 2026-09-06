'use strict';
// Initial registry builder. Review descriptors before committing. Existing
// metadata is retained; new commands stay unreviewed until explicitly classified.
const fs = require('fs');
const path = require('path');
const { serviceCommands, apiCommands } = require('./lib/command-surface');
const root = path.resolve(__dirname, '..');
const registryPath = path.join(root, 'native/src/capabilities.json');
const service = serviceCommands(fs.readFileSync(path.join(root, 'native/src/service.rs'), 'utf8'));
const api = apiCommands(fs.readFileSync(path.join(root, 'launcher/src/lib/api.ts'), 'utf8'));
const previous = fs.existsSync(registryPath) ? JSON.parse(fs.readFileSync(registryPath, 'utf8')) : [];
const existing = new Map(previous.map((row) => [row.id, row]));
const rows = [...new Set([...service, ...api])].sort().map((id) => existing.get(id) || {
  id,
  service_command: service.includes(id) ? id : null,
  cli_route: null,
  aliases: [],
  gui_routes: api.includes(id) ? [`launcher.api:${id}`] : [],
  classification: 'unreviewed',
  state: 'launcher-data',
  schema_version: 1,
  plan_command: null,
  progress: false,
  cancellation_command: null,
  visual_only_reason: null,
});
fs.writeFileSync(registryPath, JSON.stringify(rows, null, 2) + '\n');
console.log(`Derived ${rows.length} operation descriptors; new entries require review.`);
