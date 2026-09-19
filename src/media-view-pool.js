'use strict';
const vm = require('node:vm');

// Only extraction-owned WebContents enter this pool. User tabs are never reset or
// closed here. A slot stays busy until its previous document has been discarded.
function createMediaViewPool({ createView, max, foregroundReserve = 2, idleMs = 15000, retain = 2 }) {
  const slots = new Set(), waiters = [];
  const normalLimit = Math.max(1, max - foregroundReserve);
  let closed = false;

  function remove(slot) {
    clearTimeout(slot.idleTimer);
    slots.delete(slot);
    try { if (!slot.view.webContents.isDestroyed()) slot.view.webContents.close({ waitForBeforeUnload: false }); } catch {}
  }
  function idle(slot) {
    slot.busy = false;
    slot.idleTimer = setTimeout(() => {
      if (!slot.busy && slots.size > retain) remove(slot);
    }, idleMs);
    slot.idleTimer.unref?.();
  }
  function create() {
    const slot = { view: createView(), busy: false, foreground: false, idleTimer: null };
    slot.view.webContents.setAudioMuted(true);
    slots.add(slot);
    return slot;
  }
  function pump() {
    if (closed) return;
    for (const slot of slots) if (slot.view.webContents.isDestroyed()) remove(slot);
    while (waiters.length) {
      const foregroundIndex = waiters.findIndex(w => w.foreground);
      const index = foregroundIndex < 0 ? 0 : foregroundIndex;
      const waiter = waiters[index];
      const backgroundBusy = [...slots].filter(s => s.busy && !s.foreground).length;
      if (!waiter.foreground && backgroundBusy >= normalLimit) return;
      let slot = [...slots].find(s => !s.busy);
      if (!slot && slots.size >= max) return;
      waiters.splice(index, 1);
      try { slot ||= create(); } catch (error) { waiter.reject(error); continue; }
      clearTimeout(slot.idleTimer);
      slot.busy = true;
      slot.foreground = waiter.foreground;
      waiter.resolve(slot);
    }
  }
  function acquire(foreground) {
    if (closed) return Promise.reject(new Error('Media discovery stopped'));
    return new Promise((resolve, reject) => { waiters.push({ foreground, resolve, reject }); pump(); });
  }
  async function release(slot, reusable, navigation) {
    if (!slots.has(slot)) return;
    const wc = slot.view.webContents;
    let timer;
    try {
      if (closed || !reusable || wc.isDestroyed()) { remove(slot); return; }
      wc.stop();
      // stop() alone leaves page timers, scripts and videos alive. Await the blank
      // document before lending this slot to another project.
      await Promise.race([
        (async () => {
          // Drain the old load's abort event before starting another loadURL;
          // otherwise Electron can reject the blank navigation with the old URL.
          await navigation?.catch(() => {});
          await wc.loadURL('about:blank');
        })(),
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Media page reset timed out')), 1000); }),
      ]);
      wc.navigationHistory.clear();
      idle(slot);
    } catch { remove(slot); }
    finally { clearTimeout(timer); pump(); }
  }

  async function extract(url, script, { timeoutMs = 3300, foreground = false, readyEvent = 'dom-ready' } = {}) {
    const guarded = `(async()=>{try{return {ok:true,value:await (${script})}}catch(error){return {ok:false,error:String(error?.stack||error)}}})()`;
    try { new vm.Script(guarded, { filename: 'enderloom-live-dom-extraction.js' }); }
    catch (error) { throw new Error(`Live DOM extraction script is invalid: ${error.message}`); }
    const slot = await acquire(foreground), wc = slot.view.webContents;
    let frame, navigation, reusable = false, timer, rejectFailure;
    const failed = new Promise((_, reject) => { rejectFailure = reject; });
    const fail = error => rejectFailure(error);
    const onFail = (_event, code, description, _url, isMainFrame) => {
      if (isMainFrame !== false && code !== -3) fail(new Error(`Live DOM load failed ${code}: ${description || 'navigation error'}`));
    };
    const onGone = () => fail(new Error('Live DOM renderer stopped'));
    const onNavigate = (_event, _url, isInPlace, isMainFrame) => {
      if (frame && isMainFrame && !isInPlace) fail(new Error('Live DOM document changed during extraction'));
    };
    let onReady;
    const ready = new Promise(resolve => {
      onReady = () => {
        try { frame = wc.mainFrame; resolve(frame); } catch (error) { fail(error); }
      };
      wc.once(readyEvent, onReady);
    });
    wc.on('did-fail-load', onFail);
    wc.on('render-process-gone', onGone);
    wc.on('destroyed', onGone);
    wc.on('did-start-navigation', onNavigate);
    timer = setTimeout(() => fail(new Error('Live DOM extraction timed out')), Math.max(700, Number(timeoutMs) || 3300));
    try {
      // Do not await loadURL. A DOM-ready frame is usable even while an ad, image
      // or analytics request hangs. WebContents.executeJavaScript waits for full
      // load and leaves an internal did-stop-loading listener behind on timeout.
      navigation = wc.loadURL(url);
      navigation.catch(fail);
      await Promise.race([ready, failed]);
      if (wc.isDestroyed() || frame.isDestroyed()) throw new Error('Live DOM frame was disposed');
      const result = await Promise.race([frame.executeJavaScript(guarded, false), failed]);
      if (!result?.ok) throw new Error(`Live DOM extraction failed: ${result?.error || 'unknown renderer error'}`);
      reusable = true;
      return result.value;
    } finally {
      clearTimeout(timer);
      wc.removeListener(readyEvent, onReady);
      wc.removeListener('did-fail-load', onFail);
      wc.removeListener('render-process-gone', onGone);
      wc.removeListener('destroyed', onGone);
      wc.removeListener('did-start-navigation', onNavigate);
      // A failed/unfinished script cannot be cancelled safely inside a reused
      // document. Destroy that extraction view; successful views reset to blank.
      await release(slot, reusable, navigation);
    }
  }
  function warm(count) {
    if (closed) return 0;
    while (slots.size < Math.min(max, Math.max(0, count))) idle(create());
    return slots.size;
  }
  function dispose() {
    if (closed) return;
    closed = true;
    for (const waiter of waiters.splice(0)) waiter.reject(new Error('Media discovery stopped'));
    for (const slot of slots) remove(slot);
  }
  function stats() {
    return { slots: slots.size, busy: [...slots].filter(s => s.busy).length, queued: waiters.length, closed };
  }
  return { extract, warm, dispose, stats };
}

module.exports = { createMediaViewPool };
