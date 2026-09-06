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
    if (!(active || inferredChapterList)) continue;
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

function extractYouTubeInitialPlayerResponse(html) {
  for (const marker of ['ytInitialPlayerResponse =','var ytInitialPlayerResponse =','window["ytInitialPlayerResponse"] =']) {
    const value = extractBalancedJson(html, marker);
    if (value) return value;
  }
  return null;
}

function parseYouTubeWatchHtml(html, fallbackId='') {
  const player = extractYouTubeInitialPlayerResponse(html) || {};
  const details = player.videoDetails || {};
  const micro = player.microformat?.playerMicroformatRenderer || {};
  const id = clean(details.videoId || fallbackId);
  const title = clean(details.title);
  const description = String(details.shortDescription || '');
  const publishedAt = clean(micro.publishDate || micro.uploadDate || '');
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
    const author = clean(match[1]), id = clean(match[2]);
    if (!items.has(id)) items.set(id,{id,desc:'',author,createTime:'',url:`https://www.tiktok.com/@${author}/video/${id}`});
  }
  return [...items.values()];
}

module.exports = {
  htmlDecode, extractUrls, unwrapYouTubeRedirect, parseTimestamp, headingInfo,
  cleanCandidateName, parseCreatorDescription, extractBalancedJson,
  extractYouTubeInitialPlayerResponse, parseYouTubeWatchHtml, collectTikTokItemsFromHtml,
};
