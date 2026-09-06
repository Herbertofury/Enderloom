'use strict';

const TARGET = 'Soaring Through The Clouds';
const MEDIA = 'https://www.speakrj.com/audit/report/UC0E_vIe1e1lVeojYOgVg_5Q/youtube/media-stats';

async function get(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/152 Safari/537.36',
      'accept-language': 'en-US,en;q=0.9'
    }
  });
  const text = await response.text();
  console.log(JSON.stringify({url,status:response.status,length:text.length}));
  if (!response.ok) throw new Error(`${url} -> ${response.status}`);
  return text;
}

function decodeJsonString(raw) {
  try { return JSON.parse('"' + raw.replace(/"/g, '\\"') + '"'); } catch { return raw; }
}

(async () => {
  const html = await get(MEDIA);
  const idx = html.toLowerCase().indexOf(TARGET.toLowerCase());
  if (idx < 0) throw new Error(`target title not present in SpeakRJ HTML: ${TARGET}`);
  const window = html.slice(Math.max(0, idx - 5000), idx + 7000);
  console.log('---SPEAKRJ TARGET WINDOW---');
  console.log(window.replace(/\s+/g, ' ').slice(0, 12000));
  console.log('---END WINDOW---');

  const ids = new Set();
  for (const re of [
    /(?:watch\?v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{11})/g,
    /["']videoId["']\s*[:=]\s*["']([A-Za-z0-9_-]{11})["']/g,
    /[?&]v=([A-Za-z0-9_-]{11})/g
  ]) {
    for (const match of window.matchAll(re)) ids.add(match[1]);
  }
  console.log('CANDIDATE_VIDEO_IDS=' + JSON.stringify([...ids]));
  if (!ids.size) throw new Error('no YouTube candidate ID found near target row');

  let matched = null;
  for (const id of ids) {
    const yt = await get(`https://www.youtube.com/watch?v=${id}&hl=en&gl=US`);
    const titleMatch = yt.match(/<title>([^<]+)<\/title>/i);
    const shortDescription = yt.match(/"shortDescription":"((?:\\.|[^"\\])*)"/);
    const publishDate = yt.match(/"publishDate":"([^"]+)"/);
    const uploadDate = yt.match(/"uploadDate":"([^"]+)"/);
    const owner = yt.match(/"ownerChannelName":"([^"]+)"/);
    const title = titleMatch ? titleMatch[1].replace(/ - YouTube\s*$/,'').trim() : null;
    const description = shortDescription ? decodeJsonString(shortDescription[1]) : null;
    const record = {id,title,owner:owner&&owner[1],publishDate:publishDate&&publishDate[1],uploadDate:uploadDate&&uploadDate[1],description};
    console.log('YOUTUBE_CANDIDATE=' + JSON.stringify(record));
    if (title && title.toLowerCase().includes('soaring through the clouds')) matched = record;
  }
  if (!matched) throw new Error('candidate IDs found but target YouTube title did not validate');
  console.log('AHS30_IDENTITY=' + JSON.stringify(matched));
})();
