#!/usr/bin/env python3
"""Source-derived acceptance detail for the existing Enderloom knowledge ledger.

install performs a guarded, idempotent migration of the existing generator.
record updates the same requirements.json ledger; it never edits source specs.
"""
from __future__ import annotations
import argparse, copy, hashlib, html, importlib.util, json, re, sys
from collections import defaultdict
from pathlib import Path
from urllib.parse import quote

MASTER = 'docs/ENDERLOOM_MASTER_REQUIREMENTS.md'
ASTRA = 'docs/ENDERLOOM_ASTRA_MASTER_EXECUTION_CHECKLIST.md'
REPO = 'https://github.com/Herbertofury/Enderloom'
CHECKBOX = re.compile(r'^\s*[-*]\s+\[([ xX])\]\s*(.*)', re.S)
TASK = re.compile(r'^\s*(?:\*\*)?((?:[A-Z][A-Z0-9]*-)+\d+[A-Za-z]?|[TG]\d{3,})\b')
PROVIDERS = ('CurseForge','Modrinth','GitHub','GitLab','Hangar','SpigotMC','Bukkit','BuiltByBit','Nexus Mods','ModDB','Polymart','Planet Minecraft','MCPEDL','ModBay','AFDIAN','Patreon','Minecraft Marketplace','BOOTH','Fourthwall','Ko-fi','itch.io','Gumroad','alltheysm')
RULE_VERSION = 1


def core():
    # Reuse the live module when invoked by knowledge.py rather than importing twice.
    for name in ('__main__', 'knowledge'):
        m = sys.modules.get(name)
        if m and hasattr(m, 'scan') and hasattr(m, 'safe_write'):
            return m
    spec = importlib.util.spec_from_file_location('knowledge', Path(__file__).with_name('knowledge.py'))
    m = importlib.util.module_from_spec(spec)
    sys.modules['knowledge'] = m
    spec.loader.exec_module(m)
    return m


def source_text(path, raw):
    """Exclude our generated README navigation, retaining exact source line numbers."""
    if path.name != 'README.md':
        return raw
    return re.sub(r'<!-- ENDERLOOM-KNOWLEDGE:START -->.*?<!-- ENDERLOOM-KNOWLEDGE:END -->',
                  lambda m: '\n' * m[0].count('\n'), raw, flags=re.S)


def owner_hint(text, context, path):
    """Narrow, source-backed overrides; general routing remains navigation only."""
    s = (text + ' ' + context).lower()
    if any(x in s for x in ('global promotions','commenter avatars','campaign art','creator avatar','project icon','gallery','post-media','post media','trailer','media-role','media role','promo leakage','image ownership','first-media','first-image','media frontier')):
        if not any(x in s for x in ('model geometry','native asset','texture atlas')):
            if '23-provider' in text.lower() or 'site-adapter registry' in text.lower():
                return 'LIB-01'
            return 'LIB-02'
    if any(x in s for x in ('site-adapter','site adapter','provider-specific adapter','provider universe','provider families')):
        return 'LIB-01'
    if any(x in s for x in ('ad/network filtering','ad blocking','ublock origin','twp translator','translation recipe','dynamic-page translation')):
        return 'LIB-03'
    return None


def clean_task(text):
    text = re.sub(r'^\s*[-*]\s+\[[ xX]\]\s*', '', text)
    # Remove only the explicit tracking label; retain every semantic qualifier.
    text = re.sub(r'^\*\*((?:[A-Z][A-Z0-9]*-)+\d+[A-Za-z]?|[TG]\d{3,})\b(?:\s*[.:\u00b7-])?\s*', '', text)
    text = re.sub(r'^((?:[A-Z][A-Z0-9]*-)+\d+[A-Za-z]?|[TG]\d{3,})\s*[:.\u00b7-]?\s*', '', text)
    return re.sub(r'\s+', ' ', text.replace('**', '').replace('`', '')).strip()


def kind_of(text, context, path):
    if text.lstrip().startswith(('```','~~~','#')):
        return None
    if CHECKBOX.match(text):
        return 'source task'
    if path == 'README.md' and re.match(r'^\s*[-*]\s+', text):
        # README claims are preservation contracts, not fresh implementation proof.
        return 'documented behavior to preserve'
    if path == MASTER and '4.2 Provider universe' in context:
        return 'provider contract'
    if re.search(r'\b(must|shall|never|do not|required|non-negotiable)\b', text, re.I):
        return 'binding source prose'
    return None


def details(root, state, corpus):
    k = core()
    owners = {i['id'] for g in state['groups'] for i in g['items']}
    progress = state.get('detail_progress', {})
    result = {}; occurrences = 0; checkbox_occurrences = 0
    source_counts = defaultdict(lambda: {'source_tasks': 0, 'tracked_occurrences': 0})
    for src in corpus['sources']:
        p = root / src['path']
        raw = p.read_text(encoding='utf-8')
        txt = source_text(p, raw)
        for lo, hi, ctx, text in k.blocks(txt):
            kind = kind_of(text, ctx, src['path'])
            if kind is None:
                continue
            raw_cb = CHECKBOX.match(text)
            if raw_cb:
                checkbox_occurrences += 1; source_counts[src['path']]['source_tasks'] += 1
            occurrences += 1; source_counts[src['path']]['tracked_occurrences'] += 1
            canonical = clean_task(text)
            # Short text needs its heading to distinguish, e.g., Reset skin vs Reset config.
            key = canonical.casefold()
            if len(key) < 140:
                key = k.norm(ctx) + '\n' + key
            ident = 'D-' + hashlib.sha256(key.encode()).hexdigest()[:20]
            owner = k.classify(text, ctx, src['path'], state['groups'])
            if owner not in owners:
                raise ValueError('Unknown detailed outcome owner: ' + owner)
            task = TASK.match(raw_cb[2]) if raw_cb else None
            occ = {'source': src['id'], 'path': src['path'], 'start': lo, 'end': hi,
                   'context': ctx, 'source_checked': bool(raw_cb and raw_cb[1].lower() == 'x'),
                   'original_id': task[1] if task else None,
                   'text_sha256': hashlib.sha256(text.encode()).hexdigest()}
            if ident not in result:
                result[ident] = {'id': ident, 'owner': owner, 'kind': kind,
                    'text': text, 'acceptance': canonical, 'occurrences': [],
                    'status': progress.get(ident, {}).get('status', 'unverified'),
                    'routing': 'source-specific' if owner_hint(text,ctx,src['path']) else 'navigation-only'}
            result[ident]['occurrences'].append(occ)
    # Each named family is independently visible, not one opaque 23-site checklist item.
    lines = (root / MASTER).read_text().splitlines()
    for provider in PROVIDERS:
        n = next((n for n, l in enumerate(lines,1) if l.strip() == '- ' + provider), None)
        if n is None:
            raise ValueError('Named provider missing from authoritative source: ' + provider)
        ident = 'SITE-' + re.sub(r'[^a-z0-9]+','-',provider.lower()).strip('-')
        result[ident] = {'id':ident,'owner':'LIB-01','kind':'named provider coverage',
             'text':provider,'acceptance':provider + ': preserve the provider family and prove the applicable exact-project, media-role, session and fallback contract in Master Requirements section 4.2.',
             'occurrences':[{'path':MASTER,'start':n,'end':n,'context':'4.2 Provider universe','source_checked':False,'original_id':None,
                             'text_sha256':hashlib.sha256(('- '+provider).encode()).hexdigest()}],
             'status':progress.get(ident,{}).get('status','unverified'),'routing':'source-specific'}
    return {'schema_version':RULE_VERSION,'items':list(result.values()),'stats':{
        'source_task_occurrences':checkbox_occurrences,'tracked_source_occurrences':occurrences,
        'unique_acceptance_details':len(result),'named_provider_families':len(PROVIDERS),
        'by_source':dict(sorted(source_counts.items()))},
        'boundary':'Exact tasks and binding prose plus documented README behavior. Context remains binding; routing and literal deduplication are not semantic-completeness certification.'}


def source_links(item):
    out=[]
    for o in item['occurrences']:
        name=Path(o['path']).name;alias=(' :: '+o['original_id']) if o.get('original_id') else ''
        u=REPO+'/blob/main/'+quote(o['path'])+f"#L{o['start']}-L{o['end']}"
        out.append(f"[{name}{alias} : {o['start']}-{o['end']}]({u})")
    return ' / '.join(dict.fromkeys(out))


def detail_link(item):
    return f"[{item['id']}](Acceptance-{item['owner'].split('-')[0]}.md#{item['id'].lower()})"


def reference_row(item):
    first=item['occurrences'][0]
    text=item['acceptance'].splitlines()[0]
    label=text[:170]+('...' if len(text)>170 else '')
    alias=next((o.get('original_id') for o in item['occurrences'] if o.get('original_id')),None)
    return f"- {detail_link(item)} - {html.escape(label)}"+(' ['+alias+']' if alias else '')+'\n'


def augment(root, state, corpus, pages):
    k = core(); registry=details(root,state,corpus)
    k.safe_write(root/'docs/knowledge/detailed-requirements.json',json.dumps(registry,ensure_ascii=False,separators=(',',':'))+'\n')
    grouped=defaultdict(list)
    for i in registry['items']:grouped[i['owner']].append(i)
    groups={g['id']:g for g in state['groups']}
    for gid,g in groups.items():
        page=k.head(g['title']+' - detailed source acceptance','Exact source requirements, independently checkable through the same ledger. Source checkmarks are historical claims, not current certification.')
        page+='**[Detail progress commands](Working-Agreement.md#detailed-source-progress)** / **[All-source acceptance index](Detailed-Acceptance.md)**\n\n'
        for owner in g['items']:
            subset=grouped[owner['id']]
            page+=f"<a id=\"{owner['id'].lower()}-details\"></a>\n## {owner['id']} - {owner['title']}\n\n[Outcome](Checklist.md#{owner['id'].lower()}) / {len(subset)} source-derived details.\n\n"
            byctx=defaultdict(list)
            for i in subset:
                o=i['occurrences'][0];byctx[(o['path'],o['context'])].append(i)
            for (path,ctx),rows in byctx.items():
                label=html.escape(Path(path).name+' / '+ctx)
                page+=f'<details>\n<summary>{label} ({len(rows)})</summary>\n\n'
                for i in rows:
                    mark='x' if i['status']=='verified' else ' '
                    # Escape HTML from source text: a source <script>/<img> is not live wiki markup.
                    body=html.escape(i['acceptance']);line=body[:180]+('...' if len(body)>180 else '')
                    page+=f"<a id=\"{i['id'].lower()}\"></a>\n- [{mark}] **{i['id']}** - {line}\n  - **State:** {i['status']}. **Kind:** {i['kind']}.\n"
                    if len(body)>180:page+='  - **Full requirement:** '+body+'\n'
                    contexts=list(dict.fromkeys(o['context'] for o in i['occurrences']))
                    page+='  - **Binding context:** '+html.escape(' / '.join(contexts))+'\n'
                    page+='  - **Original specification:** '+source_links(i)+'\n'
                    if any(o['source_checked'] for o in i['occurrences']):
                        page+='  - Historically checked in a source. Preserve the behavior and verify current evidence; do not assume newly completed.\n'
                    p=state.get('detail_progress',{}).get(i['id'],{})
                    if p.get('next'):page+='  - **Next:** '+html.escape(p['next'])+'\n'
                    page+='\n'
                page+='</details>\n\n'
        pages['Acceptance-'+gid]=page
        pages[g['page']]+='\n## Detailed acceptance from your specifications\n\nEvery source task and binding clause has its own tracked entry, rather than disappearing into the heading above.\n\n'
        for owner in g['items']:
            pages[g['page']]+=f"- [{owner['id']} - {owner['title']}](Acceptance-{gid}.md#{owner['id'].lower()}-details): {len(grouped[owner['id']])} source details.\n"
    # Main outcomes remain stable rollups; no existing progress record is removed.
    pages['Checklist']=pages['Checklist'].replace('One checkbox owns each complete capability. Its acceptance and linked source clauses are binding together.',
        'Stable outcome rollups plus independently tracked source requirements. A broad heading is not evidence that its details are finished.')
    pages['Checklist']=pages['Checklist'].replace('**Status key:**','**[Ad-free mod images](Media-Integrity.md) / [Site adapters](Site-Adapters.md) / [Browser and translation](Browser-and-Translation.md) / [Every detailed source requirement](Detailed-Acceptance.md)**\n\n**Status key:**')
    for ident,items in grouped.items():
        token=f'<a id="{ident.lower()}"></a>'
        # Link before the anchor avoids changing existing task text or source IDs.
        pages['Checklist']=pages['Checklist'].replace(token,f'**[Open {len(items)} detailed checks](Acceptance-{ident.split("-")[0]}.md#{ident.lower()}-details)**\n\n'+token)
    index=k.head('Detailed source acceptance','The actual tasks and binding clauses from the specifications, not just an index of headings.')
    s=registry['stats'];index+=f"**{s['source_task_occurrences']:,} source-task occurrences**, **{s['unique_acceptance_details']:,} unique detail records**, **{s['named_provider_families']} individually named provider families**. Exact duplicate occurrences share a record; short clauses retain context. No fuzzy merging removes qualifiers.\n\n"
    index+='| Workstream | Detailed requirements |\n| :--- | ---: |\n'
    for gid,g in groups.items():index+=f"| [{g['title']}](Acceptance-{gid}.md) | {sum(len(grouped[i['id']]) for i in g['items'])} |\n"
    index+='\n## Source accounting is not semantic certification\n\nThe original source text, heading context, file and line span remain visible on each detail. All explicit source checkboxes outside code examples are accounted for. Binding prose and README behavior are also tracked, but parsing cannot establish that every possible implied obligation has been interpreted correctly. General keyword routing is only navigation. Review original qualifiers and correct a misplaced owner without deleting its requirement.\n\nOlder conflicting or superseded instructions remain visible; resolving them requires the applicable user decision and evidence, not an automatic completed mark. Do not tick a stale historical source claim as fresh product proof.\n\n[Single progress ledger](requirements.json) / [Machine-readable detail registry](detailed-requirements.json) / [Source map](Source-Map.md) / [Record progress](Working-Agreement.md#detailed-source-progress)\n'
    pages['Detailed-Acceptance']=index
    media=k.head('Ad-free mod images and exact media identity','Advertisements are not mod images. Browser ad blocking and gallery ownership are separate requirements; both must work.')
    media+='**[Canonical outcome LIB-02](Checklist.md#lib-02)** / **[Full media acceptance](Acceptance-LIB.md#lib-02-details)**\n\n'
    media+='''## What must never enter a mod gallery

Reject global promotions, ads, campaign and contest art, sponsor media, tier frames, unrelated sibling submissions, commenter avatars and site chrome. Bind accepted project art to the exact project, creator avatars to the exact creator/profile, and gallery/post/video media to the correct owned content region. A plausible CDN hostname or the first image on the page is not ownership evidence.

Keep project icon, creator avatar, gallery image, post media, GIF/video and poster roles separate through extraction, caching, main-process merging and renderer merging. Quarantine ambiguous collisions rather than painting the same URL in incompatible roles. Retain legitimate full-resolution originals and all project-owned gallery entries; filtering must not become a gallery cap.

```mermaid
flowchart LR
    Page["Exact project or creator source"] --> Identity["Verify project and role ownership"]
    Identity --> Reject["Reject ads, promotions and unrelated media"]
    Identity --> Roles["Separate icon, avatar, gallery and video"]
    Roles --> Cache["Role-safe project-scoped cache and merges"]
    Cache --> UI["Correct card, gallery and full-original viewer"]
    Reject --> Audit["Preserve rejection and recovery evidence"]
```

## The hard cases are requirements, not optional polish

| Source-defined case | Required result |
| :--- | :--- |
| CurseForge Description / Comments / Files / Gallery / Relations navigation | Navigation must not cut the exact gallery before its attachment cards. |
| Lazy image placeholder wrapped by a real attachment link | Recover the authoritative full image, not the placeholder. |
| Empty Gallery tab | Record source-scoped absence and continue canonical Description/post discovery; do not declare the entire project media-free. |
| Icon and creator avatar cached, gallery unresolved | Continue gallery discovery; an icon is not a complete media result. |
| Real media arrives after a negative cache entry | Clear the stale absence and update the card. |
| Planet Minecraft creator/profile and More-by siblings | Keep the creator avatar separate; exclude comments, update-log pollution and sibling submissions. |
| AFDIAN vm-pic / img-pre and styled/structured post media | Preserve typed post media and original CDN resolution; keep transformed/watermarked previews distinct. |
| Several cards share one creator/index URL | Share physical requests without merging project identities or blocking first image on avatar enrichment. |
| Premium trailer preview | Exact-project legitimate media; one autoplay owner, muted start, viewport/focus/background cancellation, preferences and gallery fallback. |

These contracts come from the original specifications and documented behavior below. The documentation update does not assert that their application runtime tests have passed.

## Exact source requirements and regression history

'''
    media_keys=('global promotions','promotion/campaign','promo leakage','sourcegalleryabsent','galleryabsent','gallery terminal','lazy-placeholder','vm-pic','creator-avatar','site-adapter registry','cross-role','first-media','first-image','premium steam','pd-01','pd-020','pd-021','commenter avatars','role collisions','hover/lightbox')
    for i in registry['items']:
        if i['owner']=='LIB-02' and any(w in (i['text']+' '+i['occurrences'][0]['context']).lower() for w in media_keys):
            media+=reference_row(i)
    media+='\n[Browser ad-filtering requirements](Browser-and-Translation.md) / [All named site adapters](Site-Adapters.md)\n'
    pages['Media-Integrity']=media
    sites=k.head('Site adapters and source-owned extraction','Keep the entire specified provider universe. A generic scraper or a site name alone does not prove a working adapter.')
    sites+='**[Canonical outcome LIB-01](Checklist.md#lib-01)** / **[Source acceptance](Acceptance-LIB.md#lib-01-details)** / **[Media safety](Media-Integrity.md)**\n\n'
    sites+='''## Shared contract, provider-specific knowledge

Use provider-specific adapters where justified, retaining an identity-checked fallback for unknown exact project pages. Keep exact project/source identity, creator/profile knowledge, semantic media roles and legitimate persistent-session access connected. Preserve known full-HTML, streaming and Chromium DOM recovery paths without accepting unrelated page assets. Do not turn an access failure or incomplete scrape into an empty catalogue or successful extraction.

Each provider below is independently traceable and checkable. Its named-family requirement inherits the shared source contract; it does not invent a new API or certify every page type. The original full details remain attached.

| Specified provider family | Individual acceptance | Source |
| :--- | :--- | :--- |
'''
    for provider in PROVIDERS:
        ident='SITE-'+re.sub(r'[^a-z0-9]+','-',provider.lower()).strip('-');i=next(i for i in registry['items'] if i['id']==ident)
        sites+=f'| **{provider}** | {detail_link(i)} | {source_links(i)} |\n'
    sites+='''
## Recovery without losing content or speed

```mermaid
flowchart TD
    Source["Selected exact project source"] --> Adapter["Provider-specific identity and role rules"]
    Adapter --> Data["Structured or complete source response"]
    Data --> Ownership["Validate ownership and media roles"]
    Data --> Recover["Incomplete or login-sensitive source"]
    Recover --> Browser["Authorized persistent Chromium recovery"]
    Browser --> Ownership
    Ownership --> Result["Progressive valid result plus full enrichment"]
    Ownership --> Quarantine["Ambiguous or unrelated candidate"]
```

Preserve creator enrichment off the first-image critical path, full uncapped galleries, full-resolution originals, project-scoped cache identity, single-flight requests and source-aware negative-cache recovery. A speed improvement must not substitute ads, omit gallery items or collapse different projects sharing an index page.

## Detailed source clauses

'''
    for i in registry['items']:
        if i['owner']=='LIB-01' and i['kind']!='named provider coverage':sites+=reference_row(i)
    sites+='\n[Complete source acceptance](Detailed-Acceptance.md) / [Browser sessions and translation](Browser-and-Translation.md)\n'
    pages['Site-Adapters']=sites
    browser=k.head('Browser, ad filtering and translation','Preserve real Chromium behavior, verified network filtering and safe translation without weakening project-media identity.')
    browser+='**[Canonical outcome LIB-03](Checklist.md#lib-03)** / **[Every browser requirement](Acceptance-LIB.md#lib-03-details)**\n\n'
    browser+='Real persistent tabs and sessions, user-performed login, source/full/split layouts, verified ad/network rules, integrated translation, Original/Translated switching, selected text, dynamic pages and per-site preferences remain explicit requirements. Upstream translation recipes must be allow-listed rather than executing arbitrary privileged code. Login-sensitive providers use the legitimate user session; do not export credentials or bypass access controls.\n\n**An ad blocker is not a gallery filter.** Preserve and test both the network/DOM filtering path and the exact-project media extraction path.\n\n'
    for i in registry['items']:
        if i['owner']=='LIB-03':browser+=reference_row(i)
    pages['Browser-and-Translation']=browser
    nav='**[Ad-free mod images](Media-Integrity.md) / [Site adapters](Site-Adapters.md) / [Browser and translation](Browser-and-Translation.md) / [Detailed source checklist](Detailed-Acceptance.md)**\n\n'
    pages['Home']=pages['Home'].replace('## Choose your destination','## Preserve the catalogue and browser\n\n'+nav+'## Choose your destination')
    pages['Library-and-Discovery']=nav+pages['Library-and-Discovery']
    pages['_Sidebar']+='\n### Source fidelity\n\n- [Ad-free mod images](Media-Integrity.md)\n- [Site adapters](Site-Adapters.md)\n- [Browser and translation](Browser-and-Translation.md)\n- [Detailed source checklist](Detailed-Acceptance.md)\n'
    pages['Source-Map']+='\n## Requirement-level coverage\n\nSource-block accounting alone is not checklist coverage. The [detailed acceptance index](Detailed-Acceptance.md) exposes the actual source tasks and binding prose, including documented product behavior from README outside generated navigation. Each has exact locators and independent evidence-bound progress.\n'
    pages['Working-Agreement']+='''
## Detailed source progress

The broad outcomes are rollups, not a substitute for the original requirements. `requirements.json` also owns `detail_progress`; `detailed-requirements.json` and `Acceptance-*.md` are generated views, not another editable backlog. Exact duplicates share a detail ID and retain every occurrence. Never edit generated Wiki checkboxes independently.

```bash
python scripts/knowledge/fidelity.py record DETAIL_ID --state in_progress --next "Implement the exact source requirement"
python scripts/knowledge/fidelity.py record DETAIL_ID --state verified --proof docs/evidence/actual-proof.json
python scripts/knowledge/knowledge.py build
python scripts/knowledge/knowledge.py check
```

Replace DETAIL_ID with an actual D- or SITE- ID from the detailed checklist. A verification receipt uses that exact ID as `requirement_id`, and includes `acceptance_sha256` for the complete current detail, in addition to the existing artifact/source/commands/observations fields. The helper prints the acceptance fingerprint when queried with `show DETAIL_ID`. This is real evidence, not a dummy JSON file. Outcome verification rejects unresolved source details. Source modifications invalidate the detail fingerprint; source checkmarks never silently certify the current product.

Navigation-only routing cannot establish semantic equivalence. If a historical instruction conflicts with a newer explicit decision, preserve both and document the actual resolution in the proof; never silently delete a difficult criterion or certify all children with one generic receipt. Source prose and enclosing sections remain binding even when not written as checkboxes.
'''
    pages['Home']=pages['Home'].replace('Exact repeated occurrences share a source record;', 'Requirement-level checklists expose their full source details. Exact repeated occurrences share a source record;')
    return registry


def acceptance_hash(item):
    # New locations alone do not invalidate semantics, but changed text/context does.
    body={'acceptance':item['acceptance'],'contexts':sorted(set(o['context'] for o in item['occurrences']))}
    return hashlib.sha256(json.dumps(body,sort_keys=True,ensure_ascii=False).encode()).hexdigest()


def validate_detail(root, item, progress):
    k=core(); status=progress.get('status','unverified')
    if status not in k.STATES:raise ValueError('Unknown detail state: '+item['id'])
    if status!='verified':return
    k.proof_valid({'id':item['id'],'status':status,'evidence':progress.get('evidence',[])})
    for e in progress['evidence']:
        proof=json.loads((root/e['path']).read_text())
        if proof.get('acceptance_sha256')!=acceptance_hash(item):raise ValueError('Stale or missing acceptance fingerprint: '+item['id'])


def validate_outcome(root,state,ident,corpus):
    item=next(i for g in state['groups'] for i in g['items'] if i['id']==ident)
    if item['status']!='verified':return
    reg=details(root,state,corpus);pending=[]
    for d in reg['items']:
        if d['owner']!=ident:continue
        p=state.get('detail_progress',{}).get(d['id'],{})
        if p.get('status')!='verified':pending.append(d['id'])
        else:validate_detail(root,d,p)
    if pending:raise ValueError(f'{ident} has {len(pending)} unverified source requirements; first: {pending[0]}')


def validate(root,state,corpus):
    registry=details(root,state,corpus);ids={i['id'] for i in registry['items']}
    progress=state.get('detail_progress',{})
    for i in registry['items']:validate_detail(root,i,progress.get(i['id'],{}))
    for ident,p in progress.items():
        if ident not in ids and p.get('status')=='verified':raise ValueError('Certified detail disappeared from current sources: '+ident)
    for g in state['groups']:
        for i in g['items']:
            if i['status']=='verified':validate_outcome(root,state,i['id'],corpus)
    readme=next((s for s in corpus['sources'] if s['path']=='README.md'),None)
    if readme is None:raise ValueError('README product requirements missing')
    for phrase in ('Reject global promotions, ads, campaign art','Use provider-specific adapters when justified','Quarantine ambiguous media-role collisions'):
        if not any(phrase in i['text'] for i in registry['items']):raise ValueError('Named source obligation lost: '+phrase)
    if set(PROVIDERS)!={i['text'] for i in registry['items'] if i['kind']=='named provider coverage'}:raise ValueError('Provider registry incomplete')
    # This guards parsing conservation, not unprovable whole-product semantics.
    expected=0
    k=core()
    for s in corpus['sources']:
        p=root/s['path'];expected+=sum(bool(CHECKBOX.match(t)) for _,_,_,t in k.blocks(source_text(p,p.read_text())))
    if expected!=registry['stats']['source_task_occurrences']:raise ValueError('Source checkbox coverage mismatch')
    pages=root/'docs/knowledge'
    if (pages/'Detailed-Acceptance.md').exists():
        seen=[]
        for p in pages.glob('Acceptance-*.md'):seen+=re.findall(r'^- \[[ x]\] \*\*((?:D-|SITE-)[^*]+)\*\*',p.read_text(),re.M)
        if len(seen)!=len(ids) or set(seen)!=ids:raise ValueError('Duplicated or hidden detail checkbox projection')
    return registry['stats']


def install(root):
    """Guarded one-time integration; a mismatch is a conflict, not an overwrite."""
    p=root/'scripts/knowledge/knowledge.py';text=p.read_text()
    marker='# SOURCE-ACCEPTANCE-FIDELITY'
    if marker not in text:
        edits=[
          ('from urllib.parse import quote, urlsplit, urlunsplit\n','from urllib.parse import quote, urlsplit, urlunsplit\nimport fidelity  # SOURCE-ACCEPTANCE-FIDELITY\n'),
          (' return paths\n\ndef classify',' return sorted(paths + [ROOT/\'README.md\'])\n\ndef classify'),
          (" t=terms(text);c=terms(context)"," hint=fidelity.owner_hint(text,context,path)\n if hint in known:return hint\n t=terms(text);c=terms(context)"),
          ("b=p.read_bytes();text=b.decode('utf-8');rel=", "b=p.read_bytes();text=fidelity.source_text(p,b.decode('utf-8'));rel="),
          (" for name,text in pages.items():safe_write(K/(name+'.md'),text)", " fidelity.augment(ROOT,state,corpus,pages)\n for name,text in pages.items():safe_write(K/(name+'.md'),text)"),
          ("def check(state,corpus):\n", "def check(state,corpus):\n fidelity.validate(ROOT,state,corpus)\n"),
          ("if name!='Checklist.md' and re.search", "if name!='Checklist.md' and not name.startswith('Acceptance-') and re.search"),
          ("  proof_valid(item);safe_write(K/'requirements.json'", "  fidelity.validate_outcome(ROOT,state,args.id,scan(state['groups']))\n  proof_valid(item);safe_write(K/'requirements.json'"),
        ]
        for old,new in edits:
            if text.count(old)!=1:raise ValueError('Generator changed at migration anchor: '+old[:100])
            text=text.replace(old,new,1)
        p.write_text(text)
    tp=root/'scripts/knowledge/test_knowledge.py';text=tp.read_text()
    old="if p.name!='Checklist.md':self.assertIsNone"
    if old in text:tp.write_text(text.replace(old,"if p.name!='Checklist.md' and not p.name.startswith('Acceptance-'):self.assertIsNone"))
    # Ensure new pages are rendered, not just claimed to be visually checked.
    rp=root/'scripts/knowledge/render.mjs';s=rp.read_text();old="['Home','Checklist','Studio','Architecture','Ecosystem']"
    if old in s:rp.write_text(s.replace(old,"['Home','Checklist','Studio','Architecture','Ecosystem','Media-Integrity','Site-Adapters','Browser-and-Translation','Detailed-Acceptance','Acceptance-LIB']"))
    statepath=root/'docs/knowledge/requirements.json';state=json.loads(statepath.read_text())
    if 'detail_progress' not in state:
        state['detail_progress']={};statepath.write_text(json.dumps(state,indent=2)+'\n')
    print('Source acceptance hooks installed; existing outcomes and progress preserved.')


def self_test():
    import unittest
    k=core()
    class Tests(unittest.TestCase):
        @classmethod
        def setUpClass(cls):
            cls.s=k.read_state();cls.c=k.scan(cls.s['groups']);cls.r=details(k.ROOT,cls.s,cls.c)
        def test_readme_not_omitted(self):self.assertIn('README.md',{s['path'] for s in self.c['sources']})
        def test_generated_navigation_excluded(self):self.assertEqual(source_text(Path('README.md'),'a\n<!-- ENDERLOOM-KNOWLEDGE:START -->\nx\n<!-- ENDERLOOM-KNOWLEDGE:END -->\nb').count('\n'),4)
        def test_no_generated_nav_tasks(self):self.assertFalse(any('## Enderloom Studio - product hub' in i['text'] for i in self.r['items']))
        def test_original_outcome_ids_preserved(self):
            counts={'AOA':6,'UX':10,'MAKE':11,'PORT':14,'DEP':8,'FIX':8,'TEST':8,'PERF':9,'LIB':9,'PLAY':6,'CONFIG':6,'WORLD':6,'AI':7,'KNOW':5,'SHIP':5}
            expected={f'{g}-{n:02d}' for g,count in counts.items() for n in range(1,count+1)}
            self.assertTrue(expected<={i['id'] for g in self.s['groups'] for i in g['items']})
        def test_ads_explicit(self):self.assertTrue(any('Reject global promotions, ads, campaign art' in i['text'] and i['owner']=='LIB-02' for i in self.r['items']))
        def test_sites_explicit(self):self.assertEqual(sum(i['kind']=='named provider coverage' for i in self.r['items']),23)
        def test_source_provider_names(self):self.assertEqual(set(PROVIDERS),{i['text'] for i in self.r['items'] if i['kind']=='named provider coverage'})
        def test_cf_recovery_explicit(self):self.assertTrue(any('sourceGalleryAbsent' in i['text'] for i in self.r['items']))
        def test_afdia_post_media(self):self.assertTrue(any('vm-pic' in i['text'] and 'img-pre' in i['text'] for i in self.r['items']))
        def test_named_pd_alias_retained(self):self.assertTrue(any(o.get('original_id')=='PD-010' for i in self.r['items'] for o in i['occurrences']))
        def test_qualifiers_distinct(self):self.assertNotEqual(clean_task('- [ ] Preserve avatars.'),clean_task('- [ ] Preserve mod images.'))
        def test_examples_not_tasks(self):self.assertIsNone(kind_of('```\n- [ ] example\n```','',MASTER))
        def test_historical_not_auto_completed(self):
            self.assertTrue(any(o['source_checked'] for i in self.r['items'] for o in i['occurrences']))
            for i in self.r['items']:
                p=self.s.get('detail_progress',{}).get(i['id'],{})
                self.assertEqual(i['status'],p.get('status','unverified'))
                validate_detail(k.ROOT,i,p)
        def test_parent_cannot_hide_pending_details(self):
            s=copy.deepcopy(self.s);s['detail_progress']={};next(i for g in s['groups'] for i in g['items'] if i['id']=='LIB-02')['status']='verified'
            with self.assertRaises(ValueError):validate_outcome(k.ROOT,s,'LIB-02',self.c)
        def test_no_proof_no_detail_pass(self):
            with self.assertRaises(ValueError):validate_detail(k.ROOT,self.r['items'][0],{'status':'verified','evidence':[]})
        def test_current_detail_receipt_and_stale_rejection(self):
            import tempfile
            item=self.r['items'][0]
            with tempfile.TemporaryDirectory(dir=k.ROOT) as folder:
                path=Path(folder)/'test-proof.json'
                data={'status':'passed','requirement_id':item['id'],'artifact_sha256':'a'*64,'source_commit':'b'*40,'acceptance_sha256':acceptance_hash(item),'commands':['SYNTHETIC UNIT TEST ONLY'],'observations':['Not application proof']}
                path.write_text(json.dumps(data))
                p={'status':'verified','evidence':[{'path':path.relative_to(k.ROOT).as_posix(),'artifact_sha256':'a'*64,'source_commit':'b'*40,'proof_sha256':k.digest(path.read_bytes())}]}
                validate_detail(k.ROOT,item,p)
                changed=copy.deepcopy(item);changed['acceptance']+=' New required qualifier.'
                with self.assertRaises(ValueError):validate_detail(k.ROOT,changed,p)
        def test_editable_ledger_is_only_progress_owner(self):
            self.assertIn('detail_progress',self.s)
            self.assertTrue(all(i['status']==self.s.get('detail_progress',{}).get(i['id'],{}).get('status','unverified') for i in self.r['items']))
        def test_every_requirement_has_sources(self):self.assertTrue(all(i['occurrences'] for i in self.r['items']))
        def test_ids_unique(self):self.assertEqual(len(self.r['items']),len({i['id'] for i in self.r['items']}))
        def test_detail_projection_complete(self):validate(k.ROOT,self.s,self.c)
        def test_non_end_erloom_specs_not_imported(self):self.assertFalse(any('MO2R_' in s['path'] or 'FEATURE_FOUNDRY_' in s['path'] for s in self.c['sources']))
        def test_visible_navigation(self):
            home=(k.K/'Home.md').read_text()
            for n in ('Media-Integrity.md','Site-Adapters.md','Detailed-Acceptance.md'):self.assertIn(n,home)
    suite=unittest.defaultTestLoader.loadTestsFromTestCase(Tests)
    if not unittest.TextTestRunner(verbosity=2).run(suite).wasSuccessful():raise SystemExit(1)


def main():
    ap=argparse.ArgumentParser(description=__doc__);sub=ap.add_subparsers(dest='cmd',required=True)
    sub.add_parser('install');sub.add_parser('test')
    sh=sub.add_parser('show');sh.add_argument('id')
    r=sub.add_parser('record');r.add_argument('id');r.add_argument('--state',required=True,choices=['unverified','in_progress','implemented','verified','blocked','reopened']);r.add_argument('--next');r.add_argument('--proof')
    a=ap.parse_args();root=Path(__file__).resolve().parents[2]
    if a.cmd=='install':install(root);return
    if a.cmd=='test':self_test();return
    k=core();state=k.read_state();corpus=k.scan(state['groups']);reg=details(root,state,corpus)
    item=next((i for i in reg['items'] if i['id']==a.id),None)
    if item is None:raise ValueError('Unknown detail ID: '+a.id)
    if a.cmd=='show':print(json.dumps({**item,'acceptance_sha256':acceptance_hash(item)},indent=2));return
    p=copy.deepcopy(state.get('detail_progress',{}).get(a.id,{}));p['status']=a.state
    if a.next:p['next']=a.next
    if a.proof:
        path=(root/a.proof).resolve()
        if root not in path.parents:raise ValueError('Out-of-repository evidence path')
        data=json.loads(path.read_text());p['evidence']=[{'path':path.relative_to(root).as_posix(),'artifact_sha256':data.get('artifact_sha256'),'source_commit':data.get('source_commit'),'proof_sha256':k.digest(path.read_bytes())}]
    validate_detail(root,item,p)
    state.setdefault('detail_progress',{})[a.id]=p
    if a.state!='verified':
        parent=next(i for g in state['groups'] for i in g['items'] if i['id']==item['owner'])
        if parent['status']=='verified':parent['status']='reopened';parent['next']='Revalidate source detail '+a.id
    k.safe_write(k.K/'requirements.json',json.dumps(state,indent=2)+'\n')
    k.render(state,corpus);k.check(state,corpus)

if __name__=='__main__':
    try:main()
    except (ValueError,OSError,json.JSONDecodeError) as exc:print('ERROR:',exc,file=sys.stderr);sys.exit(1)
