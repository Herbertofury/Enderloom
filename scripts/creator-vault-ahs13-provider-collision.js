'use strict';
const path = require('path');
const { loadCreatorVault } = require('../src/creator-vault');
const candidates = require('../catalog/creator-vault/research/asianhalfsquat.chunk13-provider-candidates.json');
const root = path.resolve(__dirname, '..');
const vault = loadCreatorVault(root);
const normalizeUrl = value => String(value || '').trim().replace(/\/$/, '').toLowerCase();
const byUrl = new Map();
for (const project of vault.projects) {
  for (const link of project.providerLinks || []) {
    const key = normalizeUrl(link.url);
    if (key && !byUrl.has(key)) byUrl.set(key, project.id);
  }
}
const collisions = [];
let destinations = 0;
for (const entry of candidates.entries || []) {
  const [id, name, type, aliases, links] = entry;
  for (const link of links || []) {
    destinations += 1;
    const hit = byUrl.get(normalizeUrl(link[1]));
    if (hit && hit !== id) collisions.push({candidateId:id,name,url:link[1],existingProjectId:hit});
  }
}
console.log(JSON.stringify({candidateProjects:(candidates.entries||[]).length,destinations,collisions}, null, 2));
if (collisions.length) process.exitCode = 2;
