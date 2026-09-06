import { spawnSync } from 'node:child_process';

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131 Safari/537.36';
const TARGET_DATES = ['2024-08-03', '2024-07-09', '2024-06-15'];
const SPEAKRJ = 'https://www.speakrj.com/audit/report/UC0E_vIe1e1lVeojYOgVg_5Q/youtube/media-stats';

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': UA,
        'accept-language': 'en-US,en;q=0.9',
        accept: 'text/html,application/json;q=0.9,*/*;q=0.8'
      }
    });
    const text = await response.text();
    console.log(`SpeakRJ status=${response.status} bytes=${text.length}`);
    return text;
  } finally {
    clearTimeout(timer);
  }
}

function decodeHtml(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function candidatesAroundDate(html, date) {
  const index = html.indexOf(date);
  if (index < 0) return { date, index, context: '', ids: [], titles: [] };
  const context = html.slice(Math.max(0, index - 6000), Math.min(html.length, index + 6000));
  const decoded = decodeHtml(context);
  const ids = [...new Set([
    ...[...decoded.matchAll(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/g)].map(m => m[1]),
    ...[...decoded.matchAll(/[?&]v=([A-Za-z0-9_-]{11})/g)].map(m => m[1])
  ])];
  const titles = [...new Set([
    ...[...decoded.matchAll(/data-original-title=["']([^"']{5,220})["']/gi)].map(m => m[1]),
    ...[...decoded.matchAll(/title=["']([^"']{5,220})["']/gi)].map(m => m[1])
  ])].filter(t => /minecraft|mod|shader|turning|made|best|top|immers/i.test(t));
  return { date, index, context: decoded.replace(/\s+/g, ' '), ids, titles };
}

function runYtDlp(id) {
  const url = `https://www.youtube.com/watch?v=${id}`;
  const result = spawnSync('yt-dlp', [
    '--skip-download',
    '--no-warnings',
    '--no-playlist',
    '--dump-single-json',
    url
  ], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout: 90000 });

  if (result.status !== 0) {
    console.log(`yt-dlp ${id} FAILED status=${result.status}`);
    console.log((result.stderr || result.stdout || '').slice(0, 5000));
    return null;
  }

  const data = JSON.parse(result.stdout);
  const out = {
    id: data.id,
    title: data.title,
    upload_date: data.upload_date,
    timestamp: data.timestamp,
    duration: data.duration,
    channel: data.channel,
    channel_id: data.channel_id,
    webpage_url: data.webpage_url,
    description: data.description
  };
  console.log(`\n=== yt-dlp ${id} ===`);
  console.log(JSON.stringify(out, null, 2));
  return out;
}

const html = await fetchText(SPEAKRJ);
const allIds = new Set();
for (const date of TARGET_DATES) {
  const row = candidatesAroundDate(html, date);
  console.log(`\n=== SpeakRJ target ${date} ===`);
  console.log(`index=${row.index}`);
  console.log(`candidateIds=${JSON.stringify(row.ids)}`);
  console.log(`candidateTitles=${JSON.stringify(row.titles)}`);
  console.log(row.context);
  for (const id of row.ids) allIds.add(id);
}

console.log(`\n=== yt-dlp candidate set (${allIds.size}) ===`);
for (const id of allIds) runYtDlp(id);

console.log('\n=== AHS chunk 28 source probe complete ===');
