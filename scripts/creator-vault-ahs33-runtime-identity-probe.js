'use strict';
const assert = require('assert');
const path = require('path');
const { loadCreatorVault } = require('../src/creator-vault');
const root = path.resolve(__dirname,'..');
const vault = loadCreatorVault(root);
assert.equal(vault.stats.recommendations,995,'Chunk 32 recommendation baseline drift');
assert.equal(vault.stats.uniqueProjects,672,'Chunk 32 canonical baseline drift');
const byId = new Map(vault.projects.map(project => [project.id,project]));
const probes = [
  {sourceName:"LEAWIND's Third Person Perspective",ids:['leawinds-third-person','leawinds-third-person-perspective','leawind-third-person-perspective']},
  {sourceName:'FallingTree',ids:['fallingtree','falling-tree']},
  {sourceName:'Mythic Charms',ids:['mythic-charms']},
  {sourceName:'Evasive Items',ids:['evasive-items']},
  {sourceName:"YDM's Weapon Master",ids:['ydms-weapon-master','ydm-s-weapon-master','weapon-master']},
  {sourceName:"Pufferfish's Skills",ids:['pufferfish-s-skills','pufferfishs-skills']}
];
const rows = probes.map(probe => ({
  sourceName:probe.sourceName,
  candidates:probe.ids.map(id => {
    const project = byId.get(id);
    return project ? {
      id:project.id,
      name:project.name,
      aliases:project.aliases || [],
      providers:[...new Set((project.providerLinks || []).map(link => link.provider))].sort(),
      providerLinks:(project.providerLinks || []).map(link => link.url)
    } : {id,missing:true};
  })
}));
console.log(JSON.stringify({phase:'chunk-33-runtime-identity-probe',baseline:{recommendations:vault.stats.recommendations,uniqueProjects:vault.stats.uniqueProjects},rows},null,2));
