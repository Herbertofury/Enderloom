'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const {app, BrowserWindow} = require('electron');

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-media-qa-'));
app.setPath('userData', profile);
const renderer = fs.readFileSync(path.join(__dirname, '../catalog/enhance.js'), 'utf8');
const owned = renderer.indexOf('  const slotLoads = new WeakMap();');
const start = owned < 0 ? renderer.indexOf('  function setImage(') : owned;
const end = renderer.indexOf('  function applyState(', start);
assert(start >= 0 && end > start);

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/X6kAAAAASUVORK5CYII=', 'base64');
const queued = new Map();
const live = new Set();
const server = http.createServer((request, response) => {
  if (request.url === '/') {
    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': "default-src 'none'; img-src 'self'",
    });
    response.end('<!doctype html><title>Enderloom media QA</title><div id="slot" data-live-media-role="gallery"><img class="live-media-image" alt="" hidden><span class="live-media-loading">Loading</span></div>');
  } else if (request.url === '/slow.png' || request.url === '/new.png') {
    queued.set(request.url, response);
  } else {
    response.writeHead(404).end();
  }
});
server.on('connection', socket => {
  live.add(socket);
  socket.once('close', () => live.delete(socket));
});

async function waitForRequest(uri) {
  const deadline = Date.now() + 6000;
  while (!queued.has(uri)) {
    assert(Date.now() < deadline, 'No genuine renderer request for ' + uri);
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}

function sendPng(uri) {
  const response = queued.get(uri);
  assert(response);
  queued.delete(uri);
  response.writeHead(200, {'Content-Type': 'image/png', 'Cache-Control': 'no-store'});
  response.end(png);
}

let window;
const watchdog = setTimeout(() => {
  process.stderr.write('Electron Catalog media QA timed out\n');
  app.exit(1);
}, 25_000);

(async () => {
  await app.whenReady();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  window = new BrowserWindow({show: false, webPreferences: {
    sandbox: true, contextIsolation: true, nodeIntegration: false, backgroundThrottling: false,
  }});
  await window.loadURL('http://127.0.0.1:' + server.address().port + '/');
  const run = script => window.webContents.executeJavaScript(script);
  await run(`(() => {
    const isHttp = value => typeof value === 'string' && value.startsWith(location.origin + '/');
    const preconnect = () => {};
    const predecode = () => {};
    const statePriority = () => 500000;
    const enqueue = () => { window.refreshCount++; };
    ${renderer.slice(start, end)}
    const slot = document.querySelector('#slot');
    const image = slot.querySelector('img');
    const hint = slot.querySelector('span');
    const state = {gallery: [], badUrls: new Set(), loaded: true};
    window.refreshCount = 0;
    window.choose = uri => setImage(slot, uri ? {url: location.origin + uri} : null, '', state);
    window.media = () => ({hidden: image.hidden, hintHidden: hint.hidden, decoded: image.naturalWidth,
      current: image.currentSrc, bad: state.badUrls.size, refreshes: window.refreshCount});
    window.decoded = () => new Promise((resolve, reject) => {
      image.addEventListener('load', () => setTimeout(() => resolve(media()), 0), {once: true});
      image.addEventListener('error', () => reject(Error('Fixture PNG did not decode')), {once: true});
    });
    choose('/slow.png');
    window.firstDecode = decoded();
  })()`);

  await waitForRequest('/slow.png');
  await run('choose(null)');
  sendPng('/slow.png');
  const stale = await run('firstDecode');
  assert.equal(stale.decoded, 1, 'the old request should have genuinely decoded');
  assert.equal(stale.hidden, true, 'late decode made the cleared slot visible');
  assert.equal(stale.hintHidden, false);
  assert.equal(stale.refreshes, 0);
  assert.equal(stale.bad, 0);

  await run("window.nextDecode = decoded(); choose('/new.png')");
  await waitForRequest('/new.png');
  sendPng('/new.png');
  const active = await run('nextDecode');
  assert.equal(active.decoded, 1);
  assert.equal(active.hidden, false, 'new selected media did not paint');
  assert.equal(active.hintHidden, true);
  assert(active.current.endsWith('/new.png'));
  assert.equal(active.refreshes, 0);
  console.log(JSON.stringify({pass: true, electron: process.versions.electron,
    chrome: process.versions.chrome, staleDecodeRemainedHidden: true,
    currentDecodePainted: true, fixtureOnly: true}));
})().then(() => finish(0), error => {
  console.error(error);
  finish(1);
});

function finish(status) {
  clearTimeout(watchdog);
  window?.destroy();
  for (const socket of live) socket.destroy();
  server.close();
  try { fs.rmSync(profile, {recursive: true, force: true}); } catch {}
  app.exit(status);
}
