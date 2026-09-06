'use strict';

const { projectNameKey } = require('../creator-vault');
const { clean, unique, safeUrl, projectLink } = require('./common');

function htmlDecode(value) {
  return String(value || '')
    .replace(/&amp;/g,'&')
    .replace(/&quot;/g,'"')
    .replace(/&#39;/g,"'")
    .replace(/&lt;/g,'<')
    .replace(/&gt;/g,'>');
}

function unwrapYouTubeRedirect(value) {
  const safe = safeUrl(value);
  if (!safe) return '';
  try {
    const url = new URL(safe);
    if (/(?:^|\.)youtube\.com$/i.test(url.hostname) && /\/redirect$/i.test(url.pathname)) {
      return safeUrl(url.searchParams.get('q') || url.searchParams.get('url')) || safe;
    }
  } catch {}
  return safe;
}

function extractUrls(text) {
  return unique((String(text || '').match(/https?:\/\/[^\s<>"')\]]+/gi) || [])
    .map(value => value.replace(/[.,;:!?]+$/,'')))
    .map(unwrapYouTubeRedirect)
    .filter(Boolean);
}

function parseTimestamp(line) {
  const match = String(line || '').match(/(?:^|\s|[-–—|[(])((?:\d{1,2}:)?\d{1,2}:\d{2})(?=\s|$|[-–—|)\]])/);
  if (!match) return { timestamp:'', seconds:null };
  const parts = match[1].split(':').map(Number);
  const seconds = parts.length === 3
    ? parts[0] * 3600 + parts[1] * 60 + parts[2]
    : parts[0] * 60 + parts[1];
  return { timestamp:match[1], seconds:Number.isFinite(seconds) ? seconds : null };
}

function headingInfo(line, videoTitle='') {
  const raw = clean(line).replace(/^#+\s*/, '').replace(/[:：]\s*$/, '').trim();
  if (!raw || raw.length > 100) return null;
  const inline = raw.match(/^(mods?|addons?|add ons?|resource ?packs?|texture ?packs?|shaders?|shader ?packs?|data ?packs?|datapacks?|plugins?)\s*[:：-]\s*(.+)$/i);
  if (inline) {
    const label = inline[1].toLowerCase();
    const type = /resource|texture/.test(label) ? 'resourcepack'
      : /shader/.test(label) ? 'shader'
      : /data/.test(label) ? 'datapack'
      : /plugin/.test(label) ? 'plugin'
      : 'mod';
    return { kind:'inline', type, items:inline[2] };
  }
  const key = raw.toLowerCase().replace(/[^a-z0-9+ ]+/g,' ').replace(/\s+/g,' ').trim();
  const include = [
    [/^(mods?|mod list|mods used|recommended mods|minecraft mods|favorite mods)$/,'mod'],
    [/^(addons?|add ons?|addon list)$/,'mod'],
    [/^(resource ?packs?|texture ?packs?|resource pack list)$/,'resourcepack'],
    [/^(shaders?|shader ?packs?|shader list)$/,'shader'],
    [/^(data ?packs?|datapacks?|datapack list)$/,'datapack'],
    [/^(plugins?|plugin list)$/,'plugin'],
  ];
  for (const [pattern, type] of include) if (pattern.test(key)) return { kind:'include', type };
  const titleText = String(videoTitle || '').toLowerCase();
  const typeFromContext = /resource|texture/.test(`${key} ${titleText}`) ? 'resourcepack'
    : /shader/.test(`${key} ${titleText}`) ? 'shader'
    : /data ?pack/.test(`${key} ${titleText}`) ? 'datapack'
    : /plugin/.test(`${key} ${titleText}`) ? 'plugin'
    : 'mod';
  if (/\b(mods?|addons?|resource ?packs?|texture ?packs?|shaders?|data ?packs?|datapacks?|plugins?)\b/.test(key)
      && /\b(links?|downloads?|list|used|order)\b/.test(key)) return { kind:'include', type:typeFromContext };
  if (/^(downloads?|download links?)$/.test(key)
      && /\b(mods?|addons?|resource ?packs?|texture ?packs?|shaders?|data ?packs?|datapacks?|plugins?)\b/.test(titleText)) return { kind:'include', type:typeFromContext };
  if (/^(music|songs?|socials?|social media|sponsors?|sponsored|credits?|setup|links?|other links?|support|contact|gear|pc specs?|hardware|chapters?)$/.test(key)) return { kind:'exclude' };
  if (/^(intro|outro)$/.test(key) || /\boutro\b/.test(key)) return { kind:'outro' };
  return null;
}

function cleanCandidateName(line, urls, timestamp) {
  let value = htmlDecode(String(line || ''));
  if (timestamp) value = value.replace(timestamp, ' ');
  value = value.replace(/\[([^\]]{2,140})\]\(https?:\/\/[^)]+\)/g, '$1');
  for (const url of urls || []) value = value.split(url).join(' ');
  value = value
    .replace(/^[\s•*#|>\-–—.:)\]]+/, '')
    .replace(/[\s|\-–—.:(\[]+$/, '')
    .replace(/\s+/g,' ')
    .trim();
  value = value.replace(/^(?:mod|addon|resource pack|texture pack|shader|datapack|plugin)\s*\d*\s*[:.)-]\s*/i,'').trim();
  if (/^(intro|outro|minecraft forge|forge|fabric|neoforge|quilt|music|song|sponsor|sponsored|chapters?)$/i.test(value)) return '';
  if (value.length < 2 || value.length > 140) return '';
  return value;
}

function parseMarkdownProject(line, projectType, platform, timestamp) {
  const match = String(line || '').match(/\[([^\]]{2,140})\]\((https?:\/\/[^)]+)\)/);
  if (!match) return null;
  const url = unwrapYouTubeRedirect(match[2]);
  if (!projectLink(url)) return null;
  return {
    name:clean(match[1]),
    projectType,
    timestamp:timestamp.timestamp,
    timestampSeconds:timestamp.seconds,
    urls:[url],
    confidence:0.995,
    evidence:'Creator-authored linked project entry',
    sourceKinds:[platform,'description','direct-link'],
  };
}

function directProjectNameFromUrl(value) {
  const safe = safeUrl(value);
  if (!safe) return '';
  try {
    const url = new URL(safe);
    const host = url.hostname.toLowerCase();
    let slug = '';
    if (host === 'modrinth.com' || host.endsWith('.modrinth.com')) {
      slug = url.pathname.match(/^\/(?:mod|modpack|resourcepack|shader|plugin|datapack)\/([^/]+)/i)?.[1] || '';
    } else if (host === 'curseforge.com' || host.endsWith('.curseforge.com')) {
      slug = url.pathname.match(/^\/minecraft\/(?:mc-mods|modpacks|texture-packs|shaders|data-packs)\/([^/]+)/i)?.[1] || '';
    } else if (host === 'github.com' || host.endsWith('.github.com')) {
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length >= 2 && !['orgs','topics','search','marketplace','features'].includes(parts[0].toLowerCase())) slug = parts[1];
    }
    return slug ? clean(decodeURIComponent(slug).replace(/[-_]+/g,' ')) : '';
  } catch { return ''; }
}

function parseCreatorDescription({ text='', title='', platform='youtube', links=[] } = {}) {
  const lines = String(text || '').replace(/\r/g,'').split('\n').map(value => htmlDecode(value).trim()).filter(Boolean);
  const candidates = [];
  const titleSuggestsProjects = /\b(mods?|addons?|resource\s*packs?|texture\s*packs?|shaders?|datapacks?|plugins?)\b/i.test(String(title || ''));
  let active = false;
  let sectionType = 'mod';
  let afterOutro = false;
  let sawProjectSection = false;
  let last = null;

  const push = row => {
    const key = projectNameKey(row?.name);
    if (!key) return null;
    const existing = candidates.find(candidate => projectNameKey(candidate.name) === key);
    if (existing) {
      existing.urls = unique([...(existing.urls || []), ...(row.urls || [])]);
      if (existing.timestampSeconds == null && row.timestampSeconds != null) {
        existing.timestamp = row.timestamp;
        existing.timestampSeconds = row.timestampSeconds;
      }
      existing.confidence = Math.max(existing.confidence || 0, row.confidence || 0);
      existing.sourceKinds = unique([...(existing.sourceKinds || []), ...(row.sourceKinds || [])]);
      return existing;
    }
    candidates.push(row);
    last = row;
    return row;
  };

  for (const line of lines) {
    const timestamp = parseTimestamp(line);
    const markdown = parseMarkdownProject(line, sectionType, platform, timestamp);
    if (markdown && (active || titleSuggestsProjects)) {
      push(markdown);
      continue;
    }

    const withoutTimestamp = timestamp.timestamp
      ? line.replace(timestamp.timestamp,' ').replace(/^[\s\-–—|:.)]+/,'').trim()
      : line;
    const heading = headingInfo(withoutTimestamp, title);
    if (heading?.kind === 'outro' || (/\boutro\b/i.test(withoutTimestamp) && timestamp.seconds != null)) {
      afterOutro = true;
      active = false;
      continue;
    }
    if (heading?.kind === 'exclude') {
      active = false;
      continue;
    }
    if (heading?.kind === 'include') {
      sawProjectSection = true;
      active = !afterOutro;
      sectionType = heading.type;
      continue;
    }
    if (heading?.kind === 'inline') {
      sawProjectSection = true;
      active = !afterOutro;
      sectionType = heading.type;
      for (const item of heading.items.split(/\s*(?:,|;|\||\s\+\s)\s*/).map(clean).filter(Boolean)) {
        const urls = extractUrls(item);
        const name = cleanCandidateName(item, urls, '');
        if (!name) continue;
        push({
          name,
          projectType:sectionType,
          timestamp:'',
          timestampSeconds:null,
          urls:urls.filter(projectLink),
          confidence:urls.some(projectLink) ? 0.94 : 0.84,
          evidence:'Creator-authored inline project list',
          sourceKinds:[platform,'description'],
        });
      }
      continue;
    }

    const urls = extractUrls(line);
    const providerUrls = urls.filter(projectLink);
    const nonUrlText = withoutTimestamp.replace(/https?:\/\/\S+/g,'').trim();
    if (urls.length && !nonUrlText && last && active) {
      last.urls = unique([...(last.urls || []), ...providerUrls]);
      if (providerUrls.length) {
        last.confidence = Math.max(last.confidence || 0, 0.96);
        last.sourceKinds = unique([...(last.sourceKinds || []), 'direct-link']);
      }
      continue;
    }

    const inferredChapterList = !sawProjectSection && titleSuggestsProjects && timestamp.seconds != null && !afterOutro;
    if (!(active || inferredChapterList)) {
      if (titleSuggestsProjects && providerUrls.length && !afterOutro) {
        const directName = cleanCandidateName(line, urls, timestamp.timestamp) || directProjectNameFromUrl(providerUrls[0]);
        if (directName) push({
          name:directName,
          projectType:sectionType,
          timestamp:timestamp.timestamp,
          timestampSeconds:timestamp.seconds,
          urls:providerUrls,
          confidence:0.97,
          evidence:'Creator-authored direct project link',
          sourceKinds:unique([platform,'description','direct-link']),
        });
      }
      continue;
    }
    const name = cleanCandidateName(line, urls, timestamp.timestamp);
    if (!name) continue;
    const confidence = providerUrls.length && timestamp.seconds != null ? 0.99
      : timestamp.seconds != null ? 0.95
      : providerUrls.length ? 0.93
      : active ? 0.84
      : 0.72;
    if (confidence < 0.8) continue;
    push({
      name,
      projectType:sectionType,
      timestamp:timestamp.timestamp,
      timestampSeconds:timestamp.seconds,
      urls:providerUrls,
      confidence,
      evidence:'Creator-authored description/caption project list',
      sourceKinds:unique([platform,'description',providerUrls.length ? 'direct-link' : '']),
    });
  }

  for (const link of Array.isArray(links) ? links : []) {
    const href = unwrapYouTubeRedirect(typeof link === 'string' ? link : link?.href);
    const label = clean(typeof link === 'string' ? '' : link?.text);
    if (!href || !projectLink(href) || !label) continue;
    const hit = candidates.find(row => projectNameKey(row.name) === projectNameKey(label));
    if (hit) {
      hit.urls = unique([...(hit.urls || []), href]);
      hit.confidence = Math.max(hit.confidence || 0, 0.98);
      hit.sourceKinds = unique([...(hit.sourceKinds || []), 'direct-link']);
    }
  }
  return candidates;
}

function extractBalancedJson(text, marker) {
  const source = String(text || '');
  let from = source.indexOf(marker);
  if (from < 0) return null;
  from = source.indexOf('{', from + marker.length);
  if (from < 0) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let index = from; index < source.length; index++) {
    const char = source[index];
    if (inString) {
      if (escape) escape = false;
      else if (char === '\\') escape = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') { inString = true; continue; }
    if (char === '{') depth++;
    else if (char === '}') {
      depth--;
      if (depth === 0) {
        try { return JSON.parse(source.slice(from, index + 1)); }
        catch { return null; }
      }
    }
  }
  return null;
}

function youtubeJsonVariants(html) {
  const base = htmlDecode(String(html || ''));
  const rows = [base];
  let value = base;
  for (let pass = 0; pass < 2; pass++) {
    const next = value.replace(/\\"/g,'"').replace(/\\\//g,'/');
    if (next === value) break;
    rows.push(next);
    value = next;
  }
  return rows;
}

function extractJsonStringProperty(text, key) {
  const escapedKey = String(key || '').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const pattern = new RegExp(`"${escapedKey}"\\s*:\\s*("(?:\\\\.|[^"\\\\])*")`);
  for (const source of youtubeJsonVariants(text)) {
    const match = source.match(pattern);
    if (!match) continue;
    try {
      let value = JSON.parse(match[1]);
      if (typeof value !== 'string') continue;
      if (!/[\r\n]/.test(value) && /\\[rnt]/.test(value)) {
        value = value.replace(/\\r\\n/g,'\n').replace(/\\n/g,'\n').replace(/\\r/g,'\n').replace(/\\t/g,'\t');
      }
      return value.replace(/\\\//g,'/');
    } catch {}
  }
  return '';
}

function extractYouTubeEmbeddedPlayerResponse(html) {
  for (const key of ['playerResponse','player_response']) {
    const value = extractJsonStringProperty(html, key);
    if (!value || value[0] !== '{') continue;
    try {
      const parsed = JSON.parse(value);
      if (parsed?.videoDetails || parsed?.microformat) return parsed;
    } catch {}
  }
  return null;
}

function extractYouTubeInitialPlayerResponse(html) {
  for (const source of youtubeJsonVariants(html)) {
    for (const marker of ['ytInitialPlayerResponse =','var ytInitialPlayerResponse =','window["ytInitialPlayerResponse"] =']) {
      const value = extractBalancedJson(source, marker);
      if (value) return value;
    }
  }
  return extractYouTubeEmbeddedPlayerResponse(html);
}

function extractMetaContent(html, key) {
  const source = String(html || '');
  const escaped = String(key || '').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const patterns = [
    new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']*)["']`,'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${escaped}["']`,'i'),
  ];
  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match?.[1]) return htmlDecode(match[1]);
  }
  return '';
}

function parseYouTubeWatchHtml(html, fallbackId='') {
  const player = extractYouTubeInitialPlayerResponse(html) || {};
  let details = player.videoDetails || null;
  let micro = player.microformat?.playerMicroformatRenderer || null;
  if (!details) {
    for (const source of youtubeJsonVariants(html)) {
      details = extractBalancedJson(source, '"videoDetails"');
      if (details?.videoId || details?.shortDescription || details?.title) break;
      details = null;
    }
  }
  if (!micro) {
    for (const source of youtubeJsonVariants(html)) {
      micro = extractBalancedJson(source, '"playerMicroformatRenderer"');
      if (micro?.publishDate || micro?.uploadDate) break;
      micro = null;
    }
  }
  details = details || {};
  micro = micro || {};
  const detailsSource = (() => {
    for (const source of youtubeJsonVariants(html)) {
      const marker = source.indexOf('"videoDetails"');
      if (marker >= 0) return source.slice(marker, marker + 900000);
    }
    return String(html || '');
  })();
  const id = clean(details.videoId || extractJsonStringProperty(detailsSource,'videoId') || fallbackId);
  const title = clean(details.title || extractJsonStringProperty(detailsSource,'title') || extractMetaContent(html,'og:title'));
  const description = String(details.shortDescription || extractJsonStringProperty(detailsSource,'shortDescription') || extractMetaContent(html,'description') || '');
  const publishedAt = clean(micro.publishDate || micro.uploadDate || extractJsonStringProperty(html,'publishDate') || extractJsonStringProperty(html,'uploadDate') || '');
  return {
    id,
    title,
    description,
    publishedAt,
    url:id ? `https://www.youtube.com/watch?v=${id}` : '',
    links:extractUrls(description).map(href => ({ href, text:'' })),
  };
}

function collectTikTokItemsFromHtml(html) {
  const source = String(html || '');
  const items = new Map();
  const scripts = [];
  for (const id of ['__UNIVERSAL_DATA_FOR_REHYDRATION__','SIGI_STATE']) {
    const pattern = new RegExp(`<script[^>]+id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/script>`, 'i');
    const match = source.match(pattern);
    if (!match) continue;
    try { scripts.push(JSON.parse(htmlDecode(match[1]))); } catch {}
  }
  const visit = value => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) {
      for (const row of value) visit(row);
      return;
    }
    const id = clean(value.id || value.itemId || value.aweme_id);
    const description = clean(value.desc || value.description || value.title);
    const author = clean(value.author?.uniqueId || value.author?.unique_id || value.authorName || '');
    if (/^\d{8,}$/.test(id) && description) {
      items.set(id, {
        id,
        desc:description,
        author,
        createTime:value.createTime || value.create_time || '',
        url:author ? `https://www.tiktok.com/@${author}/video/${id}` : `https://www.tiktok.com/video/${id}`,
      });
    }
    for (const row of Object.values(value)) visit(row);
  };
  for (const script of scripts) visit(script);
  const normalizedSource = source.replace(/\\u002[fF]/g,'/').replace(/\\\//g,'/');
  for (const match of normalizedSource.matchAll(/\/@([A-Za-z0-9._-]+)\/video\/(\d{8,})/g)) {
    const author = clean(match[1]);
    const id = clean(match[2]);
    if (!items.has(id)) items.set(id,{id,desc:'',author,createTime:'',url:`https://www.tiktok.com/@${author}/video/${id}`});
  }
  return [...items.values()];
}

module.exports = {
  htmlDecode, extractUrls, unwrapYouTubeRedirect, parseTimestamp, headingInfo,
  cleanCandidateName, directProjectNameFromUrl, parseCreatorDescription, extractBalancedJson,
  youtubeJsonVariants, extractJsonStringProperty, extractYouTubeEmbeddedPlayerResponse,
  extractYouTubeInitialPlayerResponse, parseYouTubeWatchHtml, collectTikTokItemsFromHtml,
};
