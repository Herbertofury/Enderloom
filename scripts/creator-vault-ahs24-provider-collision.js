'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { loadCreatorVault } = require('../src/creator-vault');
const candidates = require('../catalog/creator-vault/research/asianhalfsquat.chunk24-provider-candidates.json');
const source = require('../catalog/creator-vault/research/asianhalfsquat.chunk24-source.json');
const root = path.resolve(__dirname, '..');
const productionSourcePath = path.join(root, 'catalog', 'creator-vault', 'recommendation-sources', 'asianhalfsquat.history-batch24.json');
const productionPromoted = fs.existsSync(productionSourcePath);
const vault = loadCreatorVault(root);
assert.equal(vault.stats.recommendations, productionPromoted ? 794 : 789, productionPromoted ? 'chunk 24 post-source recommendation state' : 'chunk 23 pre-production recommendation baseline');
assert.equal(vault.stats.uniqueProjects, 573, 'chunk 24 adds no canonical project identities');
assert.equal(source.sourceMentions, 5);
assert.equal(candidates.canonicalProbe.matchedExisting, 5);
assert.equal(candidates.canonicalProbe.newCandidates, 0);
assert.equal(candidates.entries.length, 0, 'chunk 24 intentionally requires no provider overlays');
const existingByUrl = new Map();
for (const project of vault.projects) for (const link of project.providerLinks || []) {
  if (!existingByUrl.has(link.url)) existingByUrl.set(link.url, new Set());
  existingByUrl.get(link.url).add(project.id);
}
const candidateUrls = [];
for (const entry of candidates.entries) for (const link of entry.providerLinks || []) candidateUrls.push({projectId:entry.id,url:link.url});
const collisions = candidateUrls.filter(item => existingByUrl.has(item.url) && !existingByUrl.get(item.url).has(item.projectId));
console.log(JSON.stringify({phase:productionPromoted?'post-source':'pre-production',candidateProjects:candidates.entries.length,destinations:candidateUrls.length,collisions},null,2));
assert.equal(candidateUrls.length, 0);
assert.deepEqual(collisions, []);
