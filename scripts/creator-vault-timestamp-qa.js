'use strict';
const assert = require('assert');
const { normalizeMod } = require('../src/creator-vault');

const video = { url: 'https://www.youtube.com/watch?v=timestamp-qa' };
const registry = { byName: new Map() };
const row = normalizeMod({
  name: 'Timestamp Omitted QA',
  projectType: 'mod',
  evidence: 'Ordered-source fixture with no surviving chapter timestamp.',
  sourceKinds: ['published-order']
}, video, registry);

assert.strictEqual(row.timestampSeconds, null, 'omitted timestampSeconds must remain null');
assert.strictEqual(row.timestamp, '', 'omitted timestamp label must remain empty');
assert.strictEqual(row.videoLink, video.url, 'omitted timestamp must use the base video URL, never a fabricated 0:00 deep link');
assert(!/[?&]t=0s(?:&|$)/.test(row.videoLink), 'missing timestamp must never become t=0s');

console.log('Creator Vault timestamp QA passed: omitted timestamp stays null and uses the base video URL.');
