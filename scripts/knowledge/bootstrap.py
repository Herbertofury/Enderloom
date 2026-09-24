#!/usr/bin/env python3
"""Restore the owner's public documentation seed with hash and path verification."""
import hashlib, io, json, os, pathlib, stat, urllib.request, urllib.error, urllib.parse, zipfile
seed=pathlib.Path('.github/enderloom-knowledge-seed.json')
if seed.exists():
    d=json.loads(seed.read_text()); data=None
    routes=[d['url']]
    if d.get('drive_id'):
        routes.append('https://drive.google.com/uc?export=download&id='+urllib.parse.quote(d['drive_id']))
    for number,url in enumerate(routes,1):
        host=urllib.parse.urlsplit(url).hostname or ''
        if not (host.endswith('.oaiusercontent.com') or host=='drive.google.com'):raise SystemExit('Unexpected seed host')
        try:
            req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 Enderloom-Documentation-Publisher','Accept':'*/*'})
            with urllib.request.urlopen(req,timeout=60) as r:candidate=r.read()
            if hashlib.sha256(candidate).hexdigest()!=d['sha256']:
                print('Transport',number,'did not return the requested archive; no data applied.')
                continue
            data=candidate;break
        except urllib.error.HTTPError as e:
            body=e.read().decode('utf-8',errors='replace')
            # Response diagnostics, not signed request URLs or credentials.
            print('Transport',number,'HTTP',e.code,'response:',body[:1500])
        except OSError as e:print('Transport',number,'network failure:',type(e).__name__)
    if data is None:raise SystemExit('No authorized seed route returned the checksum-verified public archive')
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        manifest=json.loads(z.read('seed-manifest.json'));allowed={v['path']:v for v in manifest['files']}
        if len(allowed)!=len(manifest['files']) or set(z.namelist())!=set(allowed)|{'seed-manifest.json'}:raise SystemExit('Unexpected seed members')
        staged=[]
        for name,meta in allowed.items():
            p=pathlib.Path(name)
            if p.is_absolute() or '..' in p.parts or not (name.startswith('scripts/knowledge/') or name.startswith('docs/specifications/') or name in ('docs/ENDERLOOM_STUDIO_EXECUTION.md','docs/knowledge/requirements.json')):raise SystemExit('Seed path outside documentation scope')
            if stat.S_ISLNK(z.getinfo(name).external_attr>>16):raise SystemExit('Seed symlink rejected')
            content=z.read(name)
            if len(content)!=meta['bytes'] or hashlib.sha256(content).hexdigest()!=meta['sha256']:raise SystemExit('Seed file integrity mismatch')
            if p.exists() and p.read_bytes()!=content:raise SystemExit('Concurrent authored file: '+name)
            staged.append((p,content))
        for p,content in staged:p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(content)
    seed.unlink()
ready=pathlib.Path('scripts/knowledge/knowledge.py').is_file()
with open(os.environ['GITHUB_OUTPUT'],'a') as f:f.write('ready='+str(ready).lower()+'\n')
if not ready:print('Publisher installed; authored payload pending. No publication claimed.')
