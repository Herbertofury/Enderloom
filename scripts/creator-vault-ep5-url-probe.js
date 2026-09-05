'use strict';
const path = require('path');
const { loadCreatorVault } = require('../src/creator-vault');
const recovery = require('../catalog/creator-vault/research/enderversemc.vanilla-plus-ep5.recovery.json');
const root = path.resolve(__dirname, '..');
const vault = loadCreatorVault(root);
const normalizeUrl = value => String(value || '').trim().replace(/\/$/, '').toLowerCase();
const byUrl = new Map();
for (const project of vault.projects) {
  for (const link of project.providerLinks || []) {
    const key = normalizeUrl(link.url);
    if (key) byUrl.set(key, project);
  }
}
const hits = [];
for (const [sourceName, urls] of Object.entries(recovery.draftProviderHomes || {})) {
  for (const url of urls || []) {
    const project = byUrl.get(normalizeUrl(url));
    if (project) hits.push({ sourceName, url, canonicalProjectId: project.id, canonicalName: project.name });
  }
}
const particleUrls = [
  'https://modrinth.com/mod/particle-rain',
  'https://www.curseforge.com/minecraft/mc-mods/particle-rain',
  'https://github.com/PigCart/particle-rain'
];
for (const url of particleUrls) {
  const project = byUrl.get(normalizeUrl(url));
  if (project) hits.push({ sourceName: 'Rain Particle', url, canonicalProjectId: project.id, canonicalName: project.name });
}
console.log(JSON.stringify({ currentProjects: vault.projects.length, urlCollisionHits: hits.length, hits }, null, 2));
