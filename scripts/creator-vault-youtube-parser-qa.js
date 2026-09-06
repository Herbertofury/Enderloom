'use strict';

const assert = require('assert');
const { parseYouTubeWatchHtml } = require('../src/creator-vault-auto/parser');

const payload = {
  videoDetails:{
    videoId:'AbCdEfGhI12',
    title:'10 Minecraft Mods You Need',
    shortDescription:'MODS:\nSodium https://modrinth.com/mod/sodium\nLithium https://modrinth.com/mod/lithium\nModernFix https://www.curseforge.com/minecraft/mc-mods/modernfix',
  },
  microformat:{ playerMicroformatRenderer:{ publishDate:'2026-09-01' } },
};

const bare = `<script>window.__PLAYER_CACHE__=${JSON.stringify(payload)}</script>`;
const bareParsed = parseYouTubeWatchHtml(bare);
assert.strictEqual(bareParsed.id, 'AbCdEfGhI12');
assert.strictEqual(bareParsed.title, '10 Minecraft Mods You Need');
assert(bareParsed.description.includes('Sodium'));
assert.strictEqual(bareParsed.publishedAt, '2026-09-01');
assert(bareParsed.links.some(link => /modrinth\.com\/mod\/sodium/.test(link.href)));

const embedded = `<script>ytcfg.set(${JSON.stringify({ PLAYER_VARS:{ playerResponse:JSON.stringify(payload) } })})</script>`;
const embeddedParsed = parseYouTubeWatchHtml(embedded, 'fallback000');
assert.strictEqual(embeddedParsed.id, 'AbCdEfGhI12');
assert.strictEqual(embeddedParsed.title, '10 Minecraft Mods You Need');
assert(embeddedParsed.description.includes('Lithium'));
assert.strictEqual(embeddedParsed.publishedAt, '2026-09-01');

const doublyEscaped = `<script>window.cache=${JSON.stringify(JSON.stringify({ videoDetails:payload.videoDetails, microformat:payload.microformat }))}</script>`;
const escapedParsed = parseYouTubeWatchHtml(doublyEscaped, 'AbCdEfGhI12');
assert(escapedParsed.description.includes('ModernFix'));
assert(escapedParsed.links.some(link => /curseforge\.com\/minecraft\/mc-mods\/modernfix/.test(link.href)));

console.log(JSON.stringify({ passed:true, cases:['bare-player-object','embedded-playerResponse','escaped-player-json'] }, null, 2));
