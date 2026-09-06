'use strict';
const { loadCreatorVault } = require('../src/creator-vault');
const path = require('path');
const root = path.resolve(__dirname, '..');
const vault = loadCreatorVault(root);
const ids = ['youtube:IL804sqMbbE','youtube:o499NnspGIM','youtube:94j9prLG-Sc'];
const chunkVideos = ids.map(id => vault.videos.find(video => video.id === id));
if (chunkVideos.some(video => !video)) throw new Error('Chunk 28 video missing from runtime');
const ahsVideos = vault.videos.filter(video => video.creatorId === 'youtube:asianhalfsquat');
const ahsMods = ahsVideos.flatMap(video => video.mods);
const ahsLinked = ahsMods.filter(mod => mod.providerLinks.length > 0);
const chunkMods = chunkVideos.flatMap(video => video.mods);
console.log('CHUNK28_STATS ' + JSON.stringify({
  stats: vault.stats,
  unresolved: vault.projects.filter(project => !project.providerLinks.length).map(project => project.name).sort(),
  asianHalfSquat: {
    videos: ahsVideos.length,
    mentions: ahsMods.length,
    linkedMentions: ahsLinked.length,
    canonicalProjects: new Set(ahsMods.map(mod => mod.canonicalProjectId)).size,
    linkedCanonicalProjects: new Set(ahsLinked.map(mod => mod.canonicalProjectId)).size
  },
  chunk28: {
    videos: chunkVideos.map(video => ({id: video.id, mentions: video.mods.length, canonicalProjects: new Set(video.mods.map(mod => mod.canonicalProjectId)).size})),
    mentions: chunkMods.length,
    canonicalProjects: new Set(chunkMods.map(mod => mod.canonicalProjectId)).size,
    linkedMentions: chunkMods.filter(mod => mod.providerLinks.length > 0).length,
    nullTimestamps: chunkMods.filter(mod => mod.timestampSeconds == null).map(mod => mod.name)
  }
}));
