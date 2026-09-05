#!/usr/bin/env python3
import json
import re
import urllib.request

URL='https://www.youtube.com/watch?v=cjD9jYsfNj8&hl=en'
req=urllib.request.Request(URL,headers={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/152 Safari/537.36','Accept-Language':'en-US,en;q=0.9'})
raw=urllib.request.urlopen(req,timeout=30).read().decode('utf-8','replace')
print(f'AHS18_ORIGEN_HTTP_OK bytes={len(raw)}')
needle='Origen (Fabric)'
positions=[]
start=0
while True:
    at=raw.find(needle,start)
    if at < 0: break
    positions.append(at); start=at+1
print(f'AHS18_ORIGEN_OCCURRENCES={len(positions)}')
for n,at in enumerate(positions[:8]):
    lo=max(0,at-1200); hi=min(len(raw),at+5000)
    window=raw[lo:hi]
    urls=[]
    for match in re.finditer(r'https?(?:\\u0026|\\/|[^"\\\s<>])+',window):
        value=match.group(0).replace('\\u0026','&').replace('\\/','/')
        if value not in urls: urls.append(value)
    print(f'AHS18_ORIGEN_WINDOW_{n}_BEGIN')
    print(window[:6500])
    print(f'AHS18_ORIGEN_WINDOW_{n}_URLS='+json.dumps(urls[:30]))
    print(f'AHS18_ORIGEN_WINDOW_{n}_END')
