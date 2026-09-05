'use strict';
const path = require('path');
const { loadCreatorVault } = require('../src/creator-vault');
const root = path.resolve(__dirname, '..');
const vault = loadCreatorVault(root);
const ahs = vault.creators.find(creator => creator.id === 'youtube:asianhalfsquat');
const ahsVideos = vault.videos.filter(video => video.creatorId === 'youtube:asianhalfsquat');
const ahsMods = ahsVideos.flatMap(video => video.mods || []);
const ids = new Set(['youtube:OKEqrNvouOc','youtube:H1d_6_OIQzc']);
const freshVideos = ahsVideos.filter(video => ids.has(video.id));
const freshMods = freshVideos.flatMap(video => video.mods || []);
const unresolved = vault.projects.filter(project => !(project.providerLinks || []).length).map(project => project.name).sort();
const rows = freshMods.map(mod => ({name:mod.name,canonicalProjectId:mod.canonicalProjectId,canonicalName:mod.canonicalName,projectType:mod.canonicalProjectType,links:(mod.providerLinks||[]).map(link => ({provider:link.provider,url:link.url})),timestampSeconds:mod.timestampSeconds,videoLink:mod.videoLink}));
const source = require('../catalog/creator-vault/recommendation-sources/asianhalfsquat.history-batch19.json');
const output = {
  stats:vault.stats,
  ahs:{ledger:ahs && ahs.coverage,videos:ahsVideos.length,mentions:ahsMods.length,linkedMentions:ahsMods.filter(mod => (mod.providerLinks||[]).length).length,linkedCanonical:new Set(ahsMods.filter(mod => (mod.providerLinks||[]).length).map(mod => mod.canonicalProjectId)).size},
  fresh:{videos:freshVideos.length,mentions:freshMods.length,linkedMentions:freshMods.filter(mod => (mod.providerLinks||[]).length).length,canonicalProjects:new Set(freshMods.map(mod => mod.canonicalProjectId)).size,rows},
  relatedLinkedEvidence:source.videos.flatMap(video => video.relatedLinkedEvidence || []),
  unresolved
};
console.log(JSON.stringify(output,null,2));
if (freshVideos.length !== 2 || freshMods.length !== 31 || freshMods.some(mod => !(mod.providerLinks||[]).length)) process.exitCode = 2;
