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

const primaryLink = 'https://www.curseforge.com/minecraft/mc-mods/sample';
const fileLink = primaryLink + '/files/1200?edition=java&version=1.21#file';
const issuesLink = 'https://github.com/sample/project/issues';
const alternateLink = 'https://github.com/sample/project/releases';
const legacyNotes = {'previous-a':'First retained note','previous-b':'Second retained note'};
const root = path.join(__dirname, '..');
const {html: generatedCatalog} = require('../src/catalog-renderer').renderCatalog({
  id: 'mob-variety',
  name: 'Catalog runtime fixture',
  legacyIdMap: {'previous-a':'current', 'previous-b':'current'},
  items: [{
    id: 'current', name: 'Fixture mod', primaryUrl: primaryLink,
    sources: [{url:primaryLink}, {url:fileLink}, {url:issuesLink}, {url:alternateLink}],
  },{
    id: 'next', name: 'Z Second fixture', primaryUrl: 'https://modrinth.com/mod/another',
    sources:[{url:'https://modrinth.com/mod/another'}],
  }],
}, root);

const catalogHtml = generatedCatalog.replace('<head>',`<head><script>
window.sourceChecks = [];
window.finishSource = {};
window.mobCompanion = {enrichProjectLinks(input) {
  window.sourceChecks.push(input);
  return new Promise(resolve => { window.finishSource[input.id] = resolve; });
}};
</script>`);

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
  } else if (request.url === '/catalog') {
    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; form-action 'none'",
    });
    response.end(catalogHtml);
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
  await run(`localStorage.setItem('mob-variety-explorer:notes:v1', ${JSON.stringify(JSON.stringify(legacyNotes))})`);
  await window.loadURL('http://127.0.0.1:' + server.address().port + '/catalog');
  const card = await run(`(() => {
    const project = document.querySelector('article.project-card');
    if (!project) return null;
    const details = project.querySelector('.source-more');
    const menu = details.querySelector('.source-more-menu');
    const closed = !details.open && getComputedStyle(menu).display === 'none';
    details.querySelector('summary').click();
    return {
      closed, visible: details.open && getComputedStyle(menu).display !== 'none',
      links: [...menu.querySelectorAll('a')].map(a => ({
        href: a.getAttribute('href'), text: a.textContent, rel: a.rel
      })),
      shortcut: project.querySelector('button.curseforge-shortcut')?.dataset.providerLauncher,
      migration: JSON.parse(localStorage.getItem('catalog:mob-variety:notes:v2')),
      original: JSON.parse(localStorage.getItem('mob-variety-explorer:notes:v1')),
    };
  })()`);
  assert(card, 'the complete generated Catalog did not render a card');
  assert(card.closed && card.visible, 'the actual More control did not reveal its link menu');
  assert.deepEqual(card.links.map(x => x.href), [fileLink, alternateLink]);
  assert(card.links.every(x => x.rel === 'noreferrer' && x.text.includes(' · ')));
  assert.equal(card.shortcut, primaryLink, 'the exact alternate file may not take over the launcher shortcut');
  assert.match(card.migration.current, /First retained note/);
  assert.match(card.migration.current, /Second retained note/);
  assert.deepEqual(card.original, legacyNotes);
  assert.equal(await run('sourceChecks.length'), 0, 'catalog launch requested off-screen discovery');
  const initial = await run(`(() => {
    document.querySelector('[data-action="details"][data-id="current"]').click();
    const note = document.querySelector('#projectNotes');
    note.value = 'Still editing';
    note.focus();
    note.dispatchEvent(new Event('input', {bubbles:true}));
    window.editingNote = note;
    return {calls:sourceChecks.map(row=>row.id),status:document.querySelector('#projectLinkStatus').textContent};
  })()`);
  assert.deepEqual(initial.calls, ['current']);
  assert.match(initial.status, /Checking links for this project/);
  const refreshed = await run(`(async () => {
    finishSource.current({links:[{url:'https://modrinth.com/mod/confirmed-fixture'}]});
    await new Promise(resolve => setTimeout(resolve, 0));
    const note = document.querySelector('#projectNotes');
    return {same:note===editingNote,focused:document.activeElement===note,text:note.value,
      status:document.querySelector('#projectLinkStatus').textContent,
      link:document.querySelector('#projectModal a[href="https://modrinth.com/mod/confirmed-fixture"]')?.href,
      stored:JSON.parse(localStorage.getItem('catalog:mob-variety:notes:v2')).current};
  })()`);
  assert.deepEqual(refreshed,{same:true,focused:true,text:'Still editing',status:'Source links refreshed.',
    link:'https://modrinth.com/mod/confirmed-fixture',stored:'Still editing'});
  const bulk = await run(`(() => {
    document.querySelector('#projectModal [data-close]').click();
    const button = document.querySelector('#refreshSourceLinks');
    button.click();button.click();
    return {calls:sourceChecks.map(row=>row.id),disabled:button.disabled};
  })()`);
  assert.deepEqual(bulk,{calls:['current','next'],disabled:true});
  const completed = await run(`(async () => {
    finishSource.next({links:[]});
    await new Promise(resolve => setTimeout(resolve,0));
    return {calls:sourceChecks.map(row=>row.id),enabled:!document.querySelector('#refreshSourceLinks').disabled};
  })()`);
  assert.deepEqual(completed,{calls:['current','next'],enabled:true});

  console.log(JSON.stringify({pass: true, electron: process.versions.electron,
    chrome: process.versions.chrome, staleDecodeRemainedHidden: true,
    currentDecodePainted: true, actualCatalogMoreLinks: true, retainedLegacyAliasNotes: true, exactShortcutPreserved: true, startupLinkDiscoveryIdle: true, openedRowOnlyAndNotesPreserved: true, explicitBulkRefresh: true, fixtureOnly: true}));
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
