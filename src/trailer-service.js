'use strict';
const { TrailerDiscovery, publicUrl } = require('./trailer-discovery');

async function fetchTrailerText(raw, { signal, timeoutMs = 12000, maxBytes = 4 * 1024 * 1024 } = {}) {
  const timeout = AbortSignal.timeout(timeoutMs), combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
  let url = raw;
  for (let redirects = 0; redirects < 4; redirects++) {
    if (!publicUrl(url)) throw Error('Unsupported or private media source');
    const response = await fetch(url, { signal: combined, redirect: 'manual', headers: { 'User-Agent': 'Enderloom/2.9.6 (https://github.com/Herbertofury/Enderloom)', Accept: 'application/json,text/html,application/xml;q=0.9' } });
    if (response.status >= 300 && response.status < 400) { await response.body?.cancel(); url = new URL(response.headers.get('location'), url).href; continue; }
    if (!response.ok) { await response.body?.cancel(); throw Error(`Source returned HTTP ${response.status}; access restrictions are respected`); }
    const chunks = []; let size = 0;
    for await (const chunk of response.body) { size += chunk.length; if (size > maxBytes) throw Error('Source document exceeds metadata budget'); chunks.push(Buffer.from(chunk)); }
    return Buffer.concat(chunks).toString('utf8');
  }
  throw Error('Too many source redirects');
}

// Playback is part of Enderloom. Preferences control when media plays.
const defaultEntitlement = () => ({ autoplay: true, mode: 'available', label: '' });
const defaults = { enabled: false, catalog: false, detail: true, reducedData: false, captions: true };
function createTrailerService({ store, entitlement = defaultEntitlement, fetchText = fetchTrailerText, cachedProject = () => null, resolveProject }) {
  const discovery = new TrailerDiscovery({ fetchText: async (url, options) => {
    const match = url.match(/^https:\/\/api\.modrinth\.com\/v2\/project\/([^/?]+)$/);
    const cached = match && cachedProject(decodeURIComponent(match[1]));
    if (cached) { const data = await cached; if (data) return JSON.stringify(data); }
    return fetchText(url, options);
  },
    resolveProject,
    read: () => store.registry.projectMedia || { schemaVersion: 1, entries: {} },
    write: value => { store.registry.projectMedia = value; store.saveRegistry(); },
    reputableChannels: ['https://www.youtube.com/channel/UC0E_vIe1e1lVeojYOgVg_5Q'],
  });
  let owner = null;
  const consumers = new Set();
  const settings = () => ({ ...defaults, ...store.registry.mediaPreferences, entitlement: entitlement() });
  function stop(reason = 'stopped') { const old = owner; owner = null; if (old && !old.isDestroyed()) old.send('trailer:stop', { reason }); }
  return { discovery, settings, stop,
    watch(sender) { if (consumers.has(sender)) return; consumers.add(sender); sender.once?.('destroyed', () => { consumers.delete(sender); if (owner === sender) stop('Renderer closed'); }); sender.on?.('render-process-gone', () => { if (owner === sender) stop('Renderer stopped'); }); },
    setSettings(input) { const next = settings(); for (const key of Object.keys(defaults)) if (typeof input[key] === 'boolean') next[key] = input[key]; delete next.entitlement; store.registry.mediaPreferences = next; store.saveRegistry(); stop('preferences changed'); for (const sender of consumers) if (!sender.isDestroyed()) sender.send('trailer:stop', { reason: 'preferences changed' }); return settings(); },
    claim(sender, context, manual) { const prefs = settings(); if (!manual && (!prefs.entitlement.autoplay || !prefs.enabled || !prefs[context] || prefs.reducedData)) return false; stop('another preview'); owner = sender; return true; },
    release(sender) { if (owner === sender) stop(); },
  };
}
module.exports = { createTrailerService, fetchTrailerText, defaults };
