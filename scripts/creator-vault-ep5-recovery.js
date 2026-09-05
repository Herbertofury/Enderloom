'use strict';
const path = require('path');
const { loadCreatorVault } = require('../src/creator-vault');
const recovery = require('../catalog/creator-vault/research/enderversemc.vanilla-plus-ep5.recovery.json');
const root = path.resolve(__dirname, '..');
const vault = loadCreatorVault(root);
const key = value => String(value || '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const byName = new Map();
for (const project of vault.projects) {
  for (const label of [project.name, ...(project.aliases || [])]) {
    const k = key(label);
    if (k && !byName.has(k)) byName.set(k, project);
  }
}
const candidateLabels = [
  ...recovery.publishedMirrorOrder.filter(name => !Object.prototype.hasOwnProperty.call(recovery.groupedPublishedLabels, name)),
  ...Object.values(recovery.groupedPublishedLabels).flat()
];
const rows = candidateLabels.map(name => {
  const project = byName.get(key(name));
  return {
    name,
    canonicalProjectId: project ? project.id : null,
    canonicalName: project ? project.name : null,
    existingLinks: project ? (project.providerLinks || []).length : 0,
    existingProviders: project ? [...new Set((project.providerLinks || []).map(link => link.provider))] : []
  };
});
console.log(JSON.stringify({
  currentStats: vault.stats,
  publishedTopLevelLabels: recovery.publishedMirrorOrder.length,
  expandedCandidateLabels: rows.length,
  matchedExistingCanonicalProjects: rows.filter(row => row.canonicalProjectId).length,
  unmatched: rows.filter(row => !row.canonicalProjectId).map(row => row.name),
  rows
}, null, 2));
