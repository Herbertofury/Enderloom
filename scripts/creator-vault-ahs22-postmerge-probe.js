'use strict';
const assert = require('assert');
const path = require('path');
const { loadCreatorVault } = require('../src/creator-vault');
const root = path.resolve(__dirname, '..');
const vault = loadCreatorVault(root);
const video = vault.videos.find(item => item.id === 'youtube:xXaGrrwmLUg');
assert(video, 'chunk 22 video must load');
assert.equal(video.mods.length, 31, 'chunk 22 must preserve 31 source mentions');
const allowedTimes = new Set([96,150,186,226,273,325,351,388,438,488]);
for (const mod of video.mods) {
  assert(mod.providerLinks.length > 0, `verified direct project home required: ${mod.name}`);
  assert(allowedTimes.has(mod.timestampSeconds), `creator section timestamp required: ${mod.name}`);
  assert(mod.videoLink.includes(`t=${mod.timestampSeconds}s`), `timestamp deep link required: ${mod.name}`);
}
const ahs = vault.creators.find(item => item.id === 'youtube:asianhalfsquat');
const ahsVideos = vault.videos.filter(item => item.creatorId === 'youtube:asianhalfsquat');
const ahsMods = ahsVideos.flatMap(item => item.mods);
const ahsLinked = ahsMods.filter(mod => mod.providerLinks.length > 0);
const freshRows = video.mods.map(mod => ({name:mod.name,canonicalProjectId:mod.canonicalProjectId,canonicalName:mod.canonicalName,projectType:mod.projectType,timestampSeconds:mod.timestampSeconds,videoLink:mod.videoLink,links:mod.providerLinks}));
console.log(JSON.stringify({stats:vault.stats,ahs:{ledger:ahs.coverage,videos:ahsVideos.length,mentions:ahsMods.length,linkedMentions:ahsLinked.length,linkedCanonical:new Set(ahsLinked.map(mod=>mod.canonicalProjectId)).size},fresh:{videos:1,mentions:video.mods.length,linkedMentions:video.mods.filter(mod=>mod.providerLinks.length>0).length,canonicalProjects:new Set(video.mods.map(mod=>mod.canonicalProjectId)).size,rows:freshRows},unresolved:vault.projects.filter(project=>!project.providerLinks.length).map(project=>project.name).sort()},null,2));
