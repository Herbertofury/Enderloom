'use strict';
const path = require('path');
const assert = require('assert');
const { loadCreatorVault } = require('../src/creator-vault');
const research = require('../catalog/creator-vault/research/asianhalfsquat.chunk34-source.json');
const root = path.resolve(__dirname, '..');
const vault = loadCreatorVault(root);

const key = value => String(value || '').trim().toLowerCase().normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
const byName = new Map();
for (const project of vault.projects) for (const label of [project.name, ...(project.aliases || [])]) {
  const k = key(label); if (k && !byName.has(k)) byName.set(k, project);
}
assert.strictEqual(vault.stats.recommendations,1005,'Chunk 33 recommendation baseline drift');
assert.strictEqual(vault.stats.uniqueProjects,676,'Chunk 33 canonical-project baseline drift');
assert.strictEqual(research.baseline.ahsIndexedVideos,53,'Chunk 33 AHS video baseline drift');
assert.strictEqual(research.sourceMentions,10,'Chunk 34 research sourceMentions drift');
assert.strictEqual(research.videos.length,1,'Chunk 34 must contain exactly one recommendation-bearing research video');
const source = research.videos[0];
assert.strictEqual(source.id,'youtube:cLSGDPE8wFs','Sep 14 video ID drift');
assert.strictEqual(source.title,'Top 10 Minecraft Mods (1.20.1) - September 2023','Sep 14 title drift');
assert.strictEqual(source.publishedAt,'2023-09-14','Sep 14 date drift');
const expectedNames = ['BN Blood Particles','Block of Sky','FastQuit','Ecospherical Expansion','FastMove - Parkour Movement','Lost Features','No Hotbar Looping',"ChoiceTheorem's Overhauled Village",'Heartstone','Blockfront'];
const expectedTimestamps = [14,38,54,72,103,122,149,178,200,218];
assert.deepStrictEqual(source.recommendations.map(item=>item.name),expectedNames,'Sep 14 creator list/order drift');
assert.deepStrictEqual(source.recommendations.map(item=>item.timestampSeconds),expectedTimestamps,'Sep 14 timestamps drift');
assert(source.recommendations.every(item=>item.projectType==='mod' && item.sectionLabel==='MODS'),'non-MODS item leaked into Chunk 34 recommendations');

const baselineOverlap = vault.videos.find(video=>video.id===source.id) || null;
const rows = source.recommendations.map(rec => {
  const hit = byName.get(key(rec.name)) || null;
  return {name:rec.name,timestampSeconds:rec.timestampSeconds,canonicalProjectId:hit?hit.id:null,canonicalName:hit?hit.name:null,existingLinks:hit?(hit.providerLinks||[]).length:0,existingProviders:hit?[...new Set((hit.providerLinks||[]).map(link=>link.provider))].sort():[]};
});
const matched = rows.filter(row=>row.canonicalProjectId);
const unmatched = rows.filter(row=>!row.canonicalProjectId);
const uniqueUnmatched = [...new Map(unmatched.map(row=>[key(row.name),row])).values()];
console.log(JSON.stringify({
  phase:'chunk-34-canonical-probe',
  baseline:{recommendations:vault.stats.recommendations,uniqueProjects:vault.stats.uniqueProjects,ahsIndexedVideos:53},
  baselineVideoOverlap: baselineOverlap ? {id:baselineOverlap.id,title:baselineOverlap.title,publishedAt:baselineOverlap.publishedAt,mentions:(baselineOverlap.mods||[]).length,importId:baselineOverlap.importId||null,importSourceSystem:baselineOverlap.importSourceSystem||null,names:(baselineOverlap.mods||[]).map(mod=>mod.name)} : null,
  sourceMentions:rows.length,matchedExistingMentions:matched.length,unmatchedMentions:unmatched.length,uniqueUnmatchedCandidates:uniqueUnmatched.length,matched,uniqueUnmatched,rows
},null,2));
