'use strict';
const path = require('path');
const assert = require('assert');
const { loadCreatorVault } = require('../src/creator-vault');
const research = require('../catalog/creator-vault/research/asianhalfsquat.chunk33-source.json');
const root = path.resolve(__dirname, '..');
const vault = loadCreatorVault(root);

const key = value => String(value || '').trim().toLowerCase().normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
const byName = new Map();
for (const project of vault.projects) for (const label of [project.name, ...(project.aliases || [])]) {
  const k = key(label); if (k && !byName.has(k)) byName.set(k, project);
}
assert.strictEqual(vault.stats.recommendations,995,'Chunk 32 recommendation baseline drift');
assert.strictEqual(vault.stats.uniqueProjects,672,'Chunk 32 canonical-project baseline drift');
assert.strictEqual(research.baseline.ahsIndexedVideos,52,'Chunk 32 AHS video baseline drift');
assert.strictEqual(research.sourceMentions,10,'Chunk 33 research sourceMentions drift');
assert.strictEqual(research.videos.length,1,'Chunk 33 must contain exactly one recommendation-bearing research video');
const source = research.videos[0];
assert.strictEqual(source.id,'youtube:hBpVYqfyeNM','Nov 29 video ID drift');
assert.strictEqual(source.title,'Top 10 Minecraft Mods (1.20.2) - 2023','Nov 29 title drift');
assert.strictEqual(source.publishedAt,'2023-11-29','Nov 29 date drift');
const expectedNames = ['Regions Unexplored','Handcrafted',"LEAWIND's Third Person Perspective",'FallingTree','Mythic Charms','Better Clouds','Evasive Items',"YDM's Weapon Master","Pufferfish's Skills",'Physics Mod Pro'];
const expectedTimestamps = [13,35,57,93,109,130,158,175,198,208];
assert.deepStrictEqual(source.recommendations.map(item=>item.name),expectedNames,'Nov 29 creator list/order drift');
assert.deepStrictEqual(source.recommendations.map(item=>item.timestampSeconds),expectedTimestamps,'Nov 29 timestamps drift');
assert(source.recommendations.every(item=>item.projectType==='mod' && item.sectionLabel==='MODS'),'non-MODS item leaked into Chunk 33 recommendations');
assert(!source.recommendations.some(item=>['Nostalgia','Complementary Reimagined','Rethinking Voxels'].includes(item.name)),'post-outro shader leaked into Top-10 recommendations');

const baselineOverlap = vault.videos.find(video=>video.id===source.id) || null;
const rows = source.recommendations.map(rec => {
  const hit = byName.get(key(rec.name)) || null;
  return {name:rec.name,timestampSeconds:rec.timestampSeconds,canonicalProjectId:hit?hit.id:null,canonicalName:hit?hit.name:null,existingLinks:hit?(hit.providerLinks||[]).length:0,existingProviders:hit?[...new Set((hit.providerLinks||[]).map(link=>link.provider))].sort():[]};
});
const matched = rows.filter(row=>row.canonicalProjectId);
const unmatched = rows.filter(row=>!row.canonicalProjectId);
const uniqueUnmatched = [...new Map(unmatched.map(row=>[key(row.name),row])).values()];
console.log(JSON.stringify({
  phase:'chunk-33-canonical-probe',
  baseline:{recommendations:vault.stats.recommendations,uniqueProjects:vault.stats.uniqueProjects,ahsIndexedVideos:52},
  baselineVideoOverlap: baselineOverlap ? {id:baselineOverlap.id,title:baselineOverlap.title,publishedAt:baselineOverlap.publishedAt,mentions:(baselineOverlap.mods||[]).length,importId:baselineOverlap.importId||null,importSourceSystem:baselineOverlap.importSourceSystem||null,names:(baselineOverlap.mods||[]).map(mod=>mod.name)} : null,
  sourceMentions:rows.length,matchedExistingMentions:matched.length,unmatchedMentions:unmatched.length,uniqueUnmatchedCandidates:uniqueUnmatched.length,matched,uniqueUnmatched,rows
},null,2));
