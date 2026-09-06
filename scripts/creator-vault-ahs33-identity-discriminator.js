'use strict';
const assert = require('assert');
const path = require('path');
const { loadCreatorVault } = require('../src/creator-vault');
const root = path.resolve(__dirname,'..');
const vault = loadCreatorVault(root);
assert.equal(vault.stats.recommendations,995,'Chunk 32 recommendation baseline drift');
assert.equal(vault.stats.uniqueProjects,672,'Chunk 32 canonical baseline drift');
const byId = new Map(vault.projects.map(project => [project.id,project]));
const cases = {
  leawind: {sourceName:"LEAWIND's Third Person Perspective", ids:['leawinds-third-person','leawinds-third-person-perspective','leawind-third-person-perspective','leawind-third-person']},
  fallingtree: {sourceName:'FallingTree', ids:['fallingtree','falling-tree']},
  mythiccharms: {sourceName:'Mythic Charms', ids:['mythic-charms']},
  evasiveitems: {sourceName:'Evasive Items', ids:['evasive-items']},
  ydm: {sourceName:"YDM's Weapon Master", ids:['ydms-weapon-master','ydm-s-weapon-master','weapon-master','weaponmaster']}
};
const key = process.argv[2];
if (!cases[key]) throw new Error(`unknown identity discriminator ${key}`);
const cfg = cases[key];
const hits = cfg.ids.map(id => byId.get(id)).filter(Boolean).map(project => ({
  id:project.id,
  name:project.name,
  aliases:project.aliases || [],
  providers:[...new Set((project.providerLinks || []).map(link => link.provider))].sort(),
  providerLinks:(project.providerLinks || []).map(link => link.url)
}));
console.log(JSON.stringify({phase:'chunk-33-runtime-identity-discriminator',key,sourceName:cfg.sourceName,candidateIds:cfg.ids,hits},null,2));
if (!hits.length) process.exitCode = 2;
