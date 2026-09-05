#!/usr/bin/env python3
import json
import urllib.request

PLAYLIST = 'https://www.youtube.com/playlist?list=UU0E_vIe1e1lVeojYOgVg_5Q&hl=en'
ANCHOR = 'GvZCVqJtse0'

req = urllib.request.Request(
    PLAYLIST,
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/152 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    },
)
raw = urllib.request.urlopen(req, timeout=30).read().decode('utf-8', 'replace')
print(f'AHS17_PLAYLIST_HTTP_OK bytes={len(raw)}')

markers = ['var ytInitialData = ', 'window["ytInitialData"] = ', 'ytInitialData = ']
data = None
for marker in markers:
    at = raw.find(marker)
    if at < 0:
        continue
    brace = raw.find('{', at + len(marker))
    if brace < 0:
        continue
    try:
        data, _ = json.JSONDecoder().raw_decode(raw[brace:])
        print(f'AHS17_INITIAL_DATA_MARKER={marker.strip()}')
        break
    except Exception:
        pass
if data is None:
    print('AHS17_INITIAL_DATA_NOT_FOUND')
    raise SystemExit(2)

rows = []
seen = set()
def text_of(value):
    if not isinstance(value, dict):
        return ''
    if isinstance(value.get('simpleText'), str):
        return value['simpleText']
    runs = value.get('runs')
    if isinstance(runs, list):
        return ''.join(str(run.get('text', '')) for run in runs if isinstance(run, dict))
    return ''

def walk(node):
    if isinstance(node, dict):
        for key in ('playlistVideoRenderer', 'videoRenderer', 'gridVideoRenderer'):
            renderer = node.get(key)
            if isinstance(renderer, dict):
                vid = renderer.get('videoId')
                title = text_of(renderer.get('title'))
                if vid and vid not in seen:
                    seen.add(vid)
                    rows.append((vid, title))
        for value in node.values():
            walk(value)
    elif isinstance(node, list):
        for value in node:
            walk(value)
walk(data)

print(f'AHS17_PLAYLIST_ROWS={len(rows)}')
anchor_index = next((i for i, row in enumerate(rows) if row[0] == ANCHOR), None)
print(f'AHS17_ANCHOR_INDEX={anchor_index}')
if anchor_index is None:
    print('AHS17_ANCHOR_NOT_FOUND')
    for i, (vid, title) in enumerate(rows[:12]):
        print(f'AHS17_HEAD index={i} id={vid} title={title}')
    raise SystemExit(3)

start = max(0, anchor_index - 2)
end = min(len(rows), anchor_index + 8)
for i in range(start, end):
    vid, title = rows[i]
    marker = 'ANCHOR' if i == anchor_index else ('OLDER' if i > anchor_index else 'NEWER')
    print(f'AHS17_PLAYLIST_{marker} index={i} id={vid} title={title}')
