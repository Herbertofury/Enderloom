'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');

if (!process.versions.electron) {
  const { spawnSync } = require('node:child_process');
  const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
  const result = spawnSync(require('electron'), [__filename], { env, encoding: 'utf8', timeout: 60000, windowsHide: true });
  process.stdout.write(result.stdout || ''); process.stderr.write(result.stderr || '');
  process.exit(result.status ?? 1);
}

const { app, WebContentsView, session } = require('electron');
const { createMediaViewPool } = require('../src/media-view-pool');
const { createServer } = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-media-lifecycle-')));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function eventually(check, message) {
  const deadline = Date.now() + 1500;
  while (!check() && Date.now() < deadline) await sleep(10);
  assert(check(), message);
}
let server, pool;
app.whenReady().then(async () => {
  const warnings = [], views = [], visits = [];
  let hangingRequests = 0, abandonedRequests = 0;
  process.on('warning', warning => warnings.push(warning.message));
  server = createServer((req, res) => {
    visits.push(req.url);
    if (req.url.startsWith('/hang-image')) {
      hangingRequests++;
      res.on('close', () => abandonedRequests++);
      return;
    }
    res.setHeader('Content-Type', 'text/html');
    res.end(`<!doctype html><title>${req.url}</title><h1>${req.url}</h1>${req.url.startsWith('/slow') ? '<img src="/hang-image?' + req.url + '">' : ''}`);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  function makePool(options = {}) {
    return createMediaViewPool({ max: 3, foregroundReserve: 1, retain: 1, idleMs: 180,
      createView() {
        const view = new WebContentsView({ webPreferences: { session: session.fromPartition('lifecycle-qa'), sandbox: true, contextIsolation: true, nodeIntegration: false, backgroundThrottling: false } });
        views.push(view);
        return view;
      }, ...options });
  }
  pool = makePool();
  const started = Date.now();
  const first = await pool.extract(`${base}/slow-first`, '({title:document.title,state:document.readyState})', { timeoutMs: 2500 });
  const firstMs = Date.now() - started;
  assert.equal(first.title, '/slow-first');
  assert.equal(first.state, 'interactive', 'DOM metadata should arrive while a subresource is still loading');
  assert(firstMs < 2000, `First DOM extraction stalled on a subresource: ${firstMs}ms`);
  const firstView = views.at(-1).webContents;
  assert.equal(firstView.getURL(), 'about:blank', 'A successful lookup left its remote document alive');
  await sleep(30);
  assert.equal(firstView.navigationHistory.length(), 1, 'Hidden navigation history retained previous project pages');
  assert(firstView.isAudioMuted());
  const initialListeners = firstView.listenerCount('did-stop-loading');
  for (let i = 0; i < 24; i++) {
    const result = await pool.extract(`${base}/slow-${i}`, 'document.title');
    assert.equal(result, `/slow-${i}`, 'A lookup returned another project’s document');
    assert.equal(firstView.listenerCount('did-stop-loading'), initialListeners, 'Timed extraction leaked Electron deferred-script listeners');
  }
  await assert.rejects(pool.extract(`${base}/never`, 'new Promise(()=>{})', { timeoutMs: 700 }), /timed out/);
  await eventually(() => firstView.isDestroyed(), 'An unfinished extraction script survived a timeout');
  assert.equal(await pool.extract(`${base}/after-timeout`, 'document.title'), '/after-timeout');
  await assert.rejects(pool.extract(`${base}/navigate`, `(async()=>{setTimeout(()=>location.href='${base}/sibling',20);await new Promise(r=>setTimeout(r,300));return document.title})()`), /document changed|disposed|destroyed/);
  assert.equal(await pool.extract(`${base}/after-navigation`, 'document.title'), '/after-navigation');
  await assert.rejects(pool.extract(`${base}/throws`, '(()=>{throw new Error("fixture failure")})()'), /fixture failure/);
  assert.equal(await pool.extract(`${base}/after-error`, 'document.title'), '/after-error');
  const hold = '(async()=>{await new Promise(r=>setTimeout(r,600));return document.title})()';
  const background = [pool.extract(`${base}/background-1`, hold), pool.extract(`${base}/background-2`, hold)];
  const queued = pool.extract(`${base}/queued-background`, 'document.title');
  const priorityStarted = Date.now();
  const priority = await pool.extract(`${base}/foreground`, 'document.title', { foreground: true });
  const priorityMs = Date.now() - priorityStarted;
  assert.equal(priority, '/foreground');
  assert(!visits.includes('/queued-background'), 'Background work consumed the foreground reservation');
  await Promise.all([...background, queued]);
  await sleep(260);
  assert.equal(pool.stats().slots, 1, 'Idle extraction browsers were not reclaimed');
  assert.equal(pool.stats().busy, 0); assert.equal(pool.stats().queued, 0);
  assert.equal(hangingRequests, abandonedRequests, 'A completed DOM lookup left an image request in flight');
  pool.dispose();

  pool = makePool({ max: 1, foregroundReserve: 0 });
  const active = pool.extract(`${base}/shutdown-active`, 'new Promise(()=>{})');
  const waiting = pool.extract(`${base}/shutdown-queued`, 'document.title');
  const settled = Promise.allSettled([active, waiting]);
  await sleep(80); pool.dispose();
  assert((await settled).every(row => row.status === 'rejected'), 'Shutdown abandoned pending promises');
  await assert.rejects(pool.extract(`${base}/after-close`, 'document.title'), /stopped/);
  await eventually(() => views.every(view => !view.webContents || view.webContents.isDestroyed()), 'A discovery browser survived shutdown');
  assert.deepEqual(warnings, []);
  console.log(JSON.stringify({ passed: true, electron: process.versions.electron, firstDomMs: firstMs, foregroundMs: priorityMs, repeatedHungSubresources: 25, hangingRequests, abandonedRequests, noDeferredScriptListeners: true, timedOutViewDestroyed: true, navigationIsolation: true, idleReclaimed: true, pendingShutdownSettled: true }));
  server.closeAllConnections(); server.close(); app.exit(0);
}).catch(error => {
  console.error(error.stack); pool?.dispose(); server?.closeAllConnections(); server?.close(); app.exit(1);
});
