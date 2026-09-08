'use strict';

// One discovery operation for every surface. Documents/metadata only: media bytes
// remain on the provider and are requested exclusively by the active player.
const crypto = require('crypto');
const VERSION = 1;
const DAY = 86400000;
const norm = value => String(value || '').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const decode = value => String(value || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\\u0026/g, '&').replace(/\\\//g, '/');
function publicUrl(raw, base) {
  try {
    const u = new URL(decode(raw), base);
    if (u.protocol !== 'https:' || u.username || u.password || u.port || !u.hostname.includes('.') || /^(?:localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(u.hostname) || u.hostname.includes(':')) return null;
    return u;
  } catch { return null; }
}
function canonical(raw) { const u = publicUrl(raw); if (!u) return ''; u.hash = ''; u.search = ''; return u.href.replace(/\/$/, ''); }
function identity(raw) {
  const u = publicUrl(raw?.url);
  if (!u) throw Error('A public HTTPS project page is required');
  const title = String(raw.title || '').trim().slice(0, 160);
  if (!title) throw Error('The exact project title is required');
  let provider = u.hostname.replace(/^www\./, ''), projectId = u.pathname.replace(/\/$/, '');
  if (provider === 'modrinth.com') { const m = u.pathname.match(/^\/(?:project|mod|plugin|datapack|shader|resourcepack|modpack)\/([^/]+)\/?$/); if (!m) throw Error('Select an exact Modrinth project'); projectId = m[1]; }
  if (provider === 'curseforge.com' && !/^\/minecraft\/(?:mc-mods|customization|texture-packs|shaders|modpacks|worlds|data-packs)\/[^/]+\/?$/.test(u.pathname)) throw Error('Select an exact CurseForge project');
  return { url: canonical(u.href), provider, projectId, title, key: `${provider}:${projectId}`, revision: crypto.createHash('sha256').update(JSON.stringify([canonical(u.href), title])).digest('hex') };
}
function video(raw) {
  const u = publicUrl(raw); if (!u) return null;
  const host = u.hostname.replace(/^www\./, ''); let id;
  if (host === 'youtu.be') id = u.pathname.slice(1);
  if (['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host)) id = u.searchParams.get('v') || u.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1];
  if (id && /^[\w-]{11}$/.test(id)) return { kind: 'youtube', id, url: `https://www.youtube.com/watch?v=${id}`, poster: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` };
  if (['vimeo.com', 'player.vimeo.com'].includes(host) && (id = u.pathname.match(/(?:video\/)?(\d+)$/)?.[1])) return { kind: 'vimeo', id, url: `https://vimeo.com/${id}` };
  if (/\.(mp4|webm)$/i.test(u.pathname)) return { kind: 'file', id: crypto.createHash('sha256').update(u.href).digest('hex').slice(0, 24), url: u.href };
  return null;
}
function urls(text, base) {
  return [...new Set((decode(text).match(/https?:\/\/[^\s<>"'\\\])]+/g) || []).map(x => publicUrl(x.replace(/[.,;]+$/, ''), base)?.href).filter(Boolean))];
}
function mentions(title, expected) {
  const text = ` ${norm(title)} `, name = norm(expected);
  if (!name || !text.includes(` ${name} `)) return false;
  const suffix = text.split(` ${name} `)[1]?.trim() || '';
  // Do not accidentally recommend Aether II / Aether Redux for The Aether.
  return !/^(?:ii|iii|2|3|redux|reborn|rebirth|remastered|reimagined|legacy|unofficial|addon|add on|plus|steam n rails|stuff additions)\b/.test(suffix);
}
function extractJson(html, variable) {
  const marker = new RegExp(`(?:var\\s+)?${variable}\\s*=\\s*`), match = marker.exec(html);
  if (!match) return null;
  const start = html.indexOf('{', match.index + match[0].length); if (start < 0) return null;
  let depth = 0, quoted = false, escape = false;
  for (let i = start; i < html.length; i++) {
    const c = html[i]; if (quoted) { if (escape) escape = false; else if (c === '\\') escape = true; else if (c === '"') quoted = false; }
    else if (c === '"') quoted = true; else if (c === '{') depth++; else if (c === '}' && --depth === 0) { try { return JSON.parse(html.slice(start, i + 1)); } catch { return null; } }
  }
  return null;
}
function searchVideos(html, expectedTitle = '') {
  const root = extractJson(html, 'ytInitialData'), rows = [], seen = new Set();
  function walk(value, depth = 0) {
    if (!value || typeof value !== 'object' || depth > 35 || rows.length >= 12) return;
    if (value.videoRenderer?.videoId) { const v = value.videoRenderer; const title = v.title?.simpleText || (v.title?.runs || []).map(r => r.text).join(''); if (!seen.has(v.videoId) && (!expectedTitle || mentions(title, expectedTitle))) { seen.add(v.videoId); rows.push({ url: `https://www.youtube.com/watch?v=${v.videoId}`, title }); } }
    for (const v of Object.values(value)) walk(v, depth + 1);
  }
  walk(root); return rows.sort((a,b) => formatPriority(a.title) - formatPriority(b.title)).map(row => row.url);
}
function formatPriority(title) { return /\btrailer\b/i.test(title) ? 0 : /\bshowcase\b/i.test(title) ? 1 : /\breview\b/i.test(title) ? 2 : 3; }
function chapter(description, title) {
  const rows = String(description || '').split('\n').map(line => {
    const m = line.match(/^\s*(\d{1,2}:\d{2}(?::\d{2})?)\s+(.+)$/);
    return m ? { seconds: m[1].split(':').reduce((n, v) => n * 60 + Number(v), 0), title: m[2] } : null;
  }).filter(Boolean);
  const index = rows.findIndex(row => norm(row.title.replace(/\s*[-–—|]\s*https?:.*/, '')) === norm(title));
  if (index < 0 || !rows[index + 1] || rows[index + 1].seconds <= rows[index].seconds) return null;
  return { start: rows[index].seconds, end: rows[index + 1].seconds };
}
function rankCandidate(project, candidate, metadata, verifiedChannels = []) {
  const exactName = mentions(metadata.title, project.title);
  const backlinks = urls(metadata.description || '').some(u => canonical(u) === project.url);
  const verifiedChannel = verifiedChannels.includes(canonical(metadata.authorUrl));
  const roundup = /\b(?:top\s+\d+|\d+\s+(?:best|new|amazing|minecraft)\s+mods|mods\s+(?:you|of the|for))\b/i.test(metadata.title || '');
  const segment = roundup ? chapter(metadata.description, project.title) : null;
  const projectBound = ['project-page', 'provider-media'].includes(candidate.source);
  const reputable = metadata.reputable === true;
  if (roundup && (!reputable || !backlinks || !segment)) return { rejected: 'Roundup lacks an exact project backlink and bounded, exact-title chapter from a vetted channel' };
  if (!roundup && !exactName) return { rejected: 'Video title does not identify this exact project (or names a sibling)' };
  if (!projectBound && !verifiedChannel && !(reputable && backlinks)) return { rejected: 'No verified author channel or vetted showcase with an exact project backlink' };
  const tier = candidate.source === 'project-page' ? 1 : verifiedChannel ? 2 : candidate.source === 'provider-media' ? 3 : roundup ? 5 : 4;
  return { ...candidate, title: metadata.title, author: metadata.author, authorUrl: metadata.authorUrl, poster: metadata.poster || candidate.poster,
    tier, confidence: projectBound ? 98 : verifiedChannel ? 96 : roundup ? 87 : 91,
    evidenceClass: 'externally-reported', provenance: { projectUrl: project.url, foundOn: candidate.foundOn, source: candidate.source, authorUrl: metadata.authorUrl, exactName, exactBacklink: backlinks, verifiedChannel, checkedAt: Date.now(), reason: projectBound ? 'Linked by this exact project; video title matches its identity' : verifiedChannel ? 'Project-linked author channel; video title matches this project' : roundup ? 'Vetted reviewer, exact project link, and verified chapter boundaries' : 'Vetted dedicated showcase with an exact project link and matching title' },
    start: segment?.start || 0, end: segment?.end || null, rights: 'Provider embed/stream only; no download or redistribution',
  };
}

class TrailerDiscovery {
  constructor({ fetchText, read = () => ({}), write = () => {}, reputableChannels = [], resolveProject = async () => null }) {
    this.fetchText = fetchText; this.read = read; this.write = write; this.reputableChannels = reputableChannels.map(canonical);
    this.resolveProject = resolveProject;
    this.jobs = new Map(); this.waiting = []; this.active = 0;
  }
  async slot(signal) {
    if (this.active >= 2) await new Promise((resolve, reject) => {
      const row = { resolve, reject }; this.waiting.push(row);
      signal.addEventListener('abort', () => { const i = this.waiting.indexOf(row); if (i >= 0) { this.waiting.splice(i, 1); reject(Error('Discovery cancelled')); } }, { once: true });
    });
    if (signal.aborted) throw Error('Discovery cancelled'); this.active++;
  }
  cancel(key) { this.jobs.get(key)?.controller.abort(); }
  async discover(raw, { force = false } = {}) {
    const project = identity(raw), store = this.read(), old = store.entries?.[store.aliases?.[project.key] || project.key];
    const requestKey = project.key;
    if (!force && old?.revision === project.revision && old.expiresAt > Date.now()) return { ...old, cached: true };
    if (this.jobs.has(project.key)) return this.jobs.get(project.key).promise;
    const controller = new AbortController();
    const promise = (async () => {
      await this.slot(controller.signal);
      try { const result = await this.collect(project, controller.signal, old); if (controller.signal.aborted) throw Error('Discovery cancelled');
        const next = this.read(); next.entries ||= {}; next.aliases ||= {}; next.aliases[requestKey] = result.project.key; next.entries[result.project.key] = result;
        if (requestKey !== result.project.key) delete next.entries[requestKey];
        const keys = Object.keys(next.entries).sort((a,b) => next.entries[b].checkedAt - next.entries[a].checkedAt);
        for (const key of keys.slice(1000)) if (!next.entries[key].selection) delete next.entries[key];
        this.write(next); return result;
      } finally { this.active--; this.waiting.shift()?.resolve(); }
    })().finally(() => this.jobs.delete(requestKey));
    this.jobs.set(requestKey, { controller, promise }); return promise;
  }
  async collect(project, signal, old) {
    let requests = 0;
    const failures = [], rejected = [], candidates = [], seen = new Set();
    const read = async url => { if (signal.aborted) throw Error('Discovery cancelled'); if (++requests > 24) throw Error('Discovery request budget reached'); return this.fetchText(url, { signal, maxBytes: 4 * 1024 * 1024, timeoutMs: 12000 }); };
    const json = async url => JSON.parse(await read(url));
    let body = '', gallery = [], channels = [], links = [], teamId = null;
    try {
      if (project.provider === 'modrinth.com') {
        const data = await json(`https://api.modrinth.com/v2/project/${encodeURIComponent(project.projectId)}`);
        if (data.slug !== project.projectId && data.id !== project.projectId) throw Error('Provider returned a different project');
        project.projectId = data.id; project.providerTitle = data.title;
        project.key = `${project.provider}:${data.id}`;
        // The provider title is authoritative; catalog labels cannot redefine it.
        project.title = data.title;
        teamId = data.team;
        body = data.body || ''; gallery = (data.gallery || []).map(x => ({ url: x.url, title: x.title, source: project.url })).filter(x => publicUrl(x.url));
        links = urls(body, project.url);
      } else {
        let nativeProject;
        try { nativeProject = await this.resolveProject(project, { signal }); }
        catch (e) { if (signal.aborted) throw e; failures.push({ stage: 'provider-api', message: e.message }); }
        if (nativeProject) {
          project.projectId = nativeProject.id; project.key = `${project.provider}:${nativeProject.id}`; project.title = nativeProject.title; project.providerTitle = nativeProject.title;
          body = nativeProject.body || ''; links = urls(body, project.url);
          gallery = (nativeProject.gallery || []).map(image => ({ url: image.url, title: image.title, source: project.url })).filter(image => publicUrl(image.url));
        } else {
        const html = await read(project.url);
        const pageTitle = decode(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || '');
        if (!mentions(pageTitle, project.title)) throw Error('Project page identity could not be verified');
        // Restrict video discovery to the main project article, never headers or recommendations.
        body = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] || html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '';
        if (!body) throw Error('No independently scoped project description found');
        links = urls(body, project.url);
        gallery = [...body.matchAll(/<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi)].map(m => ({ url: publicUrl(m[1], project.url)?.href, source: project.url })).filter(x => x.url).slice(0, 24);
        }
      }
    } catch (e) { failures.push({ stage: 'project-page', message: e.message }); }
    const channelLinks = values => values.filter(u => /^https:\/\/(?:www\.)?youtube\.com\/(?:@[^/]+|channel\/[^/]+)(?:\/(?:videos|playlists|featured))?\/?$/.test(u)).map(u => canonical(u).replace(/\/(videos|playlists|featured)$/, ''));
    channels = [...new Set(channelLinks(links))].slice(0, 2);
    const inspect = async (raw, source, foundOn) => {
      const asset = video(raw); if (!asset || seen.has(asset.id)) return; seen.add(asset.id);
      try {
        let metadata;
        if (asset.kind === 'youtube') {
          const needsDescription = !['project-page', 'provider-media'].includes(source);
          const [data, page] = await Promise.all([json(`https://www.youtube.com/oembed?url=${encodeURIComponent(asset.url)}&format=json`), needsDescription ? read(asset.url) : Promise.resolve(null)]);
          metadata = { title: data.title, author: data.author_name, authorUrl: canonical(data.author_url), poster: data.thumbnail_url, description: '' };
          if (needsDescription) {
            const player = extractJson(page, 'ytInitialPlayerResponse');
            if (!player?.videoDetails || player.videoDetails.videoId !== asset.id) throw Error('Video identity/description unavailable');
            metadata.description = player.videoDetails.shortDescription || '';
            metadata.authorUrl = `https://www.youtube.com/channel/${player.videoDetails.channelId}`;
            metadata.reputable = this.reputableChannels.includes(canonical(metadata.authorUrl));
          }
        } else if (asset.kind === 'vimeo') {
          const data = await json(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(asset.url)}`);
          metadata = { title: data.title, author: data.author_name, authorUrl: data.author_url, poster: data.thumbnail_url };
        } else {
          // A direct file requires an explicitly labelled project video element/link.
          const line = body.split('\n').find(line => line.includes(raw)) || '';
          const label = line.match(/(?:title|aria-label)=["']([^"']+)["']/i)?.[1];
          metadata = { title: decode(label || line.replace(/<[^>]+>/g, ' ')), author: '', authorUrl: project.url };
        }
        const ranked = rankCandidate(project, { ...asset, source, foundOn }, metadata, channels);
        if (ranked.rejected) rejected.push({ url: asset.url, reason: ranked.rejected }); else candidates.push(ranked);
      } catch (e) { failures.push({ stage: source, url: asset.url, message: e.message }); }
    };
    for (const raw of links.filter(u => video(u)?.kind !== 'file' && video(u)).slice(0, 5)) await inspect(raw, 'project-page', project.url);
    if (!candidates.length && !channels.length && teamId) {
      try {
        const members = await json(`https://api.modrinth.com/v2/team/${encodeURIComponent(teamId)}/members`);
        // Only accepted project members supply author-channel provenance.
        for (const member of (Array.isArray(members) ? members : []).filter(m => m.accepted !== false).slice(0, 2)) {
          if (member.user?.id) { const user = await json(`https://api.modrinth.com/v2/user/${encodeURIComponent(member.user.id)}`); channels.push(...channelLinks(urls(user.bio || ''))); }
        }
        channels = [...new Set(channels)].slice(0, 2);
      } catch (e) { failures.push({ stage: 'project-team', message: e.message }); }
    }
    if (!candidates.length) for (const channel of [...channels]) {
      try {
        const page = await read(channel), channelId = page.match(/"(?:externalId|channelId)":"(UC[\w-]+)"/)?.[1];
        if (!channelId) throw Error('Channel identity is unavailable');
        const verified = `https://www.youtube.com/channel/${channelId}`; channels.push(verified);
        const search = await read(`${verified}/search?query=${encodeURIComponent(project.title)}`);
        for (const raw of searchVideos(search, project.title).slice(0, 2)) await inspect(raw, 'verified-author', channel);
      } catch (e) { failures.push({ stage: 'verified-author', url: channel, message: e.message }); }
      if (candidates.length) break;
    }
    if (!candidates.length) for (const raw of links.filter(u => video(u)?.kind === 'file').slice(0, 3)) await inspect(raw, 'provider-media', project.url);
    if (!candidates.length && this.reputableChannels.length) {
      try {
        // Search within vetted reviewers first so unrelated popular channels do
        // not consume the entire validation budget. Backlinks remain mandatory.
        for (const reviewer of this.reputableChannels.slice(0, 2)) {
          const source = `${reviewer}/search?query=${encodeURIComponent(project.title)}`;
          const search = await read(source);
          for (const raw of searchVideos(search).slice(0, 4)) await inspect(raw, 'review-search', source);
          if (candidates.some(c => c.tier < 5)) break;
        }
      } catch (e) { failures.push({ stage: 'review-search', message: e.message }); }
    }
    candidates.sort((a,b) => a.tier - b.tier || formatPriority(a.title) - formatPriority(b.title) || b.confidence - a.confidence || a.id.localeCompare(b.id));
    const checkedAt = Date.now(), result = { schemaVersion: VERSION, project, revision: project.revision, checkedAt, expiresAt: checkedAt + (candidates.length ? 7 * DAY : failures.length ? 30 * 60000 : DAY), candidates, gallery, rejected, failures, requestCount: requests, selection: old?.selection || null };
    if (result.selection?.candidate && !candidates.some(c => c.id === result.selection.candidate.id)) candidates.push(result.selection.candidate);
    result.selected = result.selection?.disabled ? null : candidates.find(c => c.id === result.selection?.id) || candidates[0] || null;
    return result;
  }
  choose(raw, choice) {
    const project = identity(raw), store = this.read(), entry = store.entries?.[store.aliases?.[project.key] || project.key];
    if (!entry) throw Error('Find trailers for this project first');
    if (choice.reset) entry.selection = null;
    else if (choice.disabled) entry.selection = { disabled: true, at: Date.now() };
    else { const found = entry.candidates.find(c => c.id === choice.id); if (!found) throw Error('Choose a discovered, validated candidate'); entry.selection = { id: found.id, candidate: found, at: Date.now(), evidenceClass: 'user-selected' }; }
    entry.selected = entry.selection?.disabled ? null : entry.candidates.find(c => c.id === entry.selection?.id) || entry.candidates[0] || null;
    this.write(store); return entry;
  }
  async correct(raw, url) {
    const project = identity(raw), asset = video(url); if (!asset) throw Error('Use a YouTube, Vimeo or direct MP4/WebM URL');
    if (asset.kind === 'file') throw Error('Direct-file corrections must be linked by the project; choose a provider video URL');
    const endpoint = asset.kind === 'youtube' ? `https://www.youtube.com/oembed?url=${encodeURIComponent(asset.url)}&format=json` : `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(asset.url)}`;
    const meta = JSON.parse(await this.fetchText(endpoint, { maxBytes: 100000, timeoutMs: 10000 }));
    const store = this.read(), entry = store.entries?.[store.aliases?.[project.key] || project.key]; if (!entry) throw Error('Find trailers for this project first');
    if (!mentions(meta.title, entry.project.title)) throw Error('That video title does not identify this exact mod; sibling and unrelated videos are rejected');
    const candidate = { ...asset, title: meta.title, author: meta.author_name, authorUrl: meta.author_url, poster: meta.thumbnail_url, tier: 0, confidence: null, start: 0, end: null, evidenceClass: 'user-selected', provenance: { projectUrl: project.url, foundOn: url, source: 'user-correction', checkedAt: Date.now(), reason: 'Selected by you; title checked against this mod. Author endorsement is not inferred.' }, rights: 'Provider embed only' };
    entry.candidates = entry.candidates.filter(c => c.id !== candidate.id); entry.candidates.unshift(candidate); entry.selection = { id: candidate.id, candidate, at: Date.now() }; entry.selected = candidate; this.write(store); return entry;
  }
}
module.exports = { TrailerDiscovery, identity, video, mentions, rankCandidate, chapter, searchVideos, publicUrl, canonical };
