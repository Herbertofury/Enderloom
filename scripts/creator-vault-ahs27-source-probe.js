const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131 Safari/537.36';

async function fetchText(label, url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
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
    console.log(`\n=== ${label} ===`);
    console.log(`status=${response.status} final=${response.url} bytes=${text.length}`);
    return text;
  } catch (error) {
    console.log(`\n=== ${label} ===`);
    console.log(`ERROR ${error?.name || 'Error'}: ${error?.message || error}`);
    return '';
  } finally {
    clearTimeout(timer);
  }
}

function printNeedleContext(label, text, needles, radius = 2200) {
  let printed = 0;
  for (const needle of needles) {
    let start = 0;
    while (true) {
      const index = text.toLowerCase().indexOf(needle.toLowerCase(), start);
      if (index === -1) break;
      const left = Math.max(0, index - radius);
      const right = Math.min(text.length, index + needle.length + radius);
      const context = text.slice(left, right).replace(/\s+/g, ' ');
      console.log(`\n--- ${label}: ${needle} @ ${index} ---`);
      console.log(context);
      printed += 1;
      start = index + needle.length;
      if (printed >= 20) return;
    }
  }
  if (!printed) console.log(`\n--- ${label}: no target contexts ---`);
}

function printAsianHalfSquatClips(label, text) {
  const needle = 'AsianHalfSquat';
  let index = 0;
  let printed = 0;
  while ((index = text.indexOf(needle, index)) !== -1) {
    const left = Math.max(0, index - 5000);
    const right = Math.min(text.length, index + 2500);
    const context = text.slice(left, right);
    if (/2024|243[., ]?1|The Best Minecraft Mods|Sep|Eyl|eyl|September/i.test(context)) {
      console.log(`\n--- ${label}: AHS clip context @ ${index} ---`);
      console.log(context.replace(/\s+/g, ' '));
      printed += 1;
    }
    index += needle.length;
    if (printed >= 30) break;
  }
  if (!printed) console.log(`\n--- ${label}: no 2024 AHS clip contexts ---`);
}

const speak = await fetchText(
  'SpeakRJ media stats',
  'https://www.speakrj.com/audit/report/UC0E_vIe1e1lVeojYOgVg_5Q/youtube/media-stats'
);
printNeedleContext('SpeakRJ', speak, ['2024-09-06', 'The Best Minecraft Mods T', '243,130', '10811', '10,811']);

for (const [label, url] of [
  ['Yandex AHS channel query', 'https://www.m.yandex.com/video/search?text=AsianHalfSquat&q_source=channel'],
  ['Yandex exact prefix query', 'https://www.m.yandex.com/video/search?text=AsianHalfSquat%20The%20Best%20Minecraft%20Mods'],
  ['Yandex Sept 2024 query', 'https://www.m.yandex.com/video/search?text=AsianHalfSquat%20September%202024%20Minecraft%20Mods'],
  ['Yandex broad MOD query', 'https://www.m.yandex.com/video/search?text=MOD']
]) {
  const body = await fetchText(label, url);
  printNeedleContext(label, body, ['The Best Minecraft Mods', 'bd83XKp65jw', '2024-09-06', '6 Sep 2024', '6 Eyl 2024']);
  printAsianHalfSquatClips(label, body);
}

for (const [label, url] of [
  ['Wayback @ handle CDX', 'https://web.archive.org/cdx/search/cdx?url=www.youtube.com/%40AsianHalfSquat/videos&from=20240901&to=20240910&output=json&fl=timestamp,original,statuscode,digest&filter=statuscode:200&collapse=digest'],
  ['Wayback custom channel CDX', 'https://web.archive.org/cdx/search/cdx?url=www.youtube.com/c/AsianHalfSquat/videos&from=20240901&to=20240910&output=json&fl=timestamp,original,statuscode,digest&filter=statuscode:200&collapse=digest'],
  ['Wayback user channel CDX', 'https://web.archive.org/cdx/search/cdx?url=www.youtube.com/user/asianhalfsquat/videos&from=20240901&to=20240910&output=json&fl=timestamp,original,statuscode,digest&filter=statuscode:200&collapse=digest']
]) {
  const body = await fetchText(label, url);
  console.log(body.slice(0, 20000));
}

console.log('\n=== probe complete ===');
