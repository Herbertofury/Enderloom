#!/usr/bin/env python3
import html
import json
import re
import urllib.request

PLAYLIST = 'https://www.youtube.com/playlist?list=UU0E_vIe1e1lVeojYOgVg_5Q&hl=en'
ANCHOR = 'l9VYc8La5mg'

req = urllib.request.Request(
    PLAYLIST,
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/152 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    },
)
raw = urllib.request.urlopen(req, timeout=30).read().decode('utf-8', 'replace')
print(f'AHS16_PLAYLIST_HTTP_OK bytes={len(raw)}')

pattern = re.compile(
    r'"playlistVideoRenderer":\{"videoId":"([^"]+)".*?'
    r'"title":\{"runs":\[\{"text":"((?:\\.|[^"\\])*)"',
    re.S,
)
rows = []
seen = set()
for video_id, encoded_title in pattern.findall(raw):
    if video_id in seen:
        continue
    seen.add(video_id)
    try:
        title = json.loads('"' + encoded_title + '"')
    except Exception:
        title = html.unescape(encoded_title)
    rows.append((video_id, title))

print(f'AHS16_PLAYLIST_ROWS={len(rows)}')
anchor_index = next((i for i, row in enumerate(rows) if row[0] == ANCHOR), None)
print(f'AHS16_ANCHOR_INDEX={anchor_index}')
if anchor_index is None:
    print('AHS16_ANCHOR_NOT_FOUND')
else:
    start = max(0, anchor_index - 2)
    end = min(len(rows), anchor_index + 7)
    for i in range(start, end):
        video_id, title = rows[i]
        marker = 'ANCHOR' if i == anchor_index else ('OLDER' if i > anchor_index else 'NEWER')
        print(f'AHS16_PLAYLIST_{marker} index={i} id={video_id} title={title}')
