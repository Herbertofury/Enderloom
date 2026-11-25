'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const renderer = fs.readFileSync(path.join(__dirname, '../catalog/enhance.js'), 'utf8');
const contract = renderer.indexOf('  const slotLoads = new WeakMap();');
const start = contract < 0 ? renderer.indexOf('  function setImage(') : contract;
const end = renderer.indexOf('  function applyState(', start);
assert(start >= 0 && end > start, 'Catalog renderer must expose its real slot code in this section');
const render = vm.runInNewContext(renderer.slice(start, end) + '\nsetImage', {
  WeakMap,
  isHttp: url => /^https?:\/\//.test(url),
  preconnect() {},
  predecode() {},
  statePriority() { return 0; },
  enqueue(state) { state.refreshes += 1; },
  document: {createElement: () => newVideo()},
});

function newVideo() {
  return {
    hidden: true, dataset: {}, readyState: 0,
    pause() {}, load() {}, setAttribute() {},
  };
}

function fixture() {
  const image = {hidden: true, dataset: {}, classList: {add() {}}};
  const loading = {hidden: false, textContent: ''};
  let video;
  const slot = {
    dataset: {liveMediaRole: 'gallery'},
    querySelector(selector) {
      return {'.live-media-image': image, '.live-media-loading': loading, '.live-media-video': video}[selector];
    },
    appendChild(element) { video = element; },
  };
  const state = {badUrls: new Set(), gallery: [], refreshes: 0, loaded: true};
  return {image, loading, slot, state, video: () => video};
}

const oldImage = {url: 'https://example.test/old.png'};
const newImage = {url: 'https://example.test/new.png'};
const oldVideo = {url: 'https://example.test/old.mp4', mediaType: 'video'};

{
  const {image, loading, slot, state} = fixture();
  render(slot, oldImage, '', state);
  const oldLoad = image.onload;
  const oldError = image.onerror;
  render(slot, null, '', state);
  oldLoad();
  assert(image.hidden && !loading.hidden, 'cleared slot must ignore old image success');
  oldError();
  assert.equal(state.badUrls.size, 0, 'clearing a slot must not blacklist old media');
  assert.equal(state.refreshes, 0, 'clearing a slot must not schedule a refresh');
  render(slot, oldImage, '', state);
  image.onload();
  assert.equal(image.hidden, false, 'the same chosen image can load again after clearing');
}
{
  const {image, loading, slot, state, video} = fixture();
  render(slot, oldVideo, '', state);
  const oldMetadata = video().onloadedmetadata;
  const oldError = video().onerror;
  render(slot, newImage, '', state);
  oldMetadata();
  oldError();
  assert(video().hidden && !loading.hidden, 'inactive video callbacks must not replace pending image');
  assert.equal(state.badUrls.size, 0);
  assert.equal(state.refreshes, 0);
  image.onload();
  assert(!image.hidden && loading.hidden, 'active image still paints');
}
{
  const {image, loading, slot, state, video} = fixture();
  render(slot, oldImage, '', state);
  const oldLoad = image.onload;
  const oldError = image.onerror;
  render(slot, oldVideo, '', state);
  oldLoad();
  oldError();
  assert(image.hidden && !loading.hidden, 'inactive image callbacks must not replace pending video');
  assert.equal(state.badUrls.size, 0);
  video().onloadedmetadata();
  assert(!video().hidden && loading.hidden, 'active video still paints');
}
{
  const {image, slot, state} = fixture();
  const item = {...oldImage, previewUrl: 'https://example.test/preview.png'};
  render(slot, item, '', state);
  image.onerror();
  assert.equal(image.src, oldImage.url, 'current failed preview still falls back to the original');
  image.onerror();
  assert(state.badUrls.has(oldImage.url));
  assert.equal(state.refreshes, 1);
}
{
  const {image, slot, state} = fixture();
  const peer = fixture();
  const preview = 'https://example.test/shared-preview.png';
  render(slot, {...oldImage, previewUrl: preview}, '', state);
  const oldError = image.onerror;
  render(peer.slot, oldImage, '', peer.state);
  render(slot, {...newImage, previewUrl: preview}, '', state);
  assert.notEqual(image.onerror, oldError, 'a shared thumbnail must not keep the old original binding');
  oldError();
  assert.equal(image.src, preview, 'stale thumbnail error must not switch back to old original');
  image.onerror();
  assert.equal(image.src, newImage.url, 'active thumbnail error picks the new original');
  peer.image.onload();
  assert.equal(peer.image.hidden, false, 'independent media slot remains bound');
}
console.log('5 Catalog slot cases passed: clear/reuse, video→image, image→video, original fallback, shared preview.');
