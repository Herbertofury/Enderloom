#!/usr/bin/env python3
"""Enderloom's single requirements state, lossless source map and Wiki publisher input.

No network calls, model calls, content limits or third-party Python dependencies.
"""
from __future__ import annotations
import argparse, collections, hashlib, html, json, os, re, sys, tempfile
from pathlib import Path
from urllib.parse import quote, urlsplit, urlunsplit
import fidelity  # SOURCE-ACCEPTANCE-FIDELITY

ROOT=Path(__file__).resolve().parents[2]
K=ROOT/'docs/knowledge'
REPO='https://github.com/Herbertofury/Enderloom'
STATES={'unverified','in_progress','implemented','verified','blocked','reopened'}
NAV='[Home](Home.md) / [Checklist](Checklist.md) / [Architecture](Architecture.md) / [Ecosystem](Ecosystem.md) / [Source map](Source-Map.md)'

# Declarative routing, never removal or a semantic-equivalence assertion.
VOCAB={
'AOA':'advent ascension aoa novus',
'UX':'studio interface ui ux desktop screen window navigation layout toolbar viewport themes typography dragdrop accessibility polished',
'MAKE':'authoring create creation model texture animation molang reference concept geometry uv entity boss gameplay visual assets art',
'PORT':'convert conversion porting remap mappings bytecode jar decompile source legacy loader stonecutter mixin semantic java bedrock northpoint',
'DEP':'dependency dependencies transitive graph identity operation registry transactional transaction staging cancellation durable provisioning toolchain cache',
'FIX':'repair diagnostics diagnostic crash deadlock freeze forensics leak incident blackbox causal bisect reproducer',
'TEST':'test testing gametest scenario scenarios cli headless runtime proof benchmark sandbox assertions harness',
'PERF':'performance profiling profiler optimization optimize frame latency throughput jfr spark mspt tps fps rendering allocation',
'LIB':'catalog discovery provider favorites favourite favorite gallery media trailer sources browser content modrinth curseforge install pack interchange',
'PLAY':'launcher instance account authentication microsoft skin cape java launch processes process groups organization entitlement',
'CONFIG':'config configuration hotkey keybind keybindings progression softlock quest debugger function command script kubejs crafttweaker',
'WORLD':'world worlds server servers proxy protocol network migration nbt region dimension backup rcon eula',
'AI':'ai openai codex chatgpt agent agents brain intelligence quarantine prompt model provider approval evidence learning',
'KNOW':'wiki knowledge documentation compatibility contract ecosystem why installed extension refresh',
'SHIP':'release security supplychain licensing privacy preservation invariants principles acceptance completion quality continuity governance scope done guardrails',
}
# Existing Studio IDs remain aliases; no renumbering or second task state.
TMAP={}
def bind(nums,key):
 for n in nums: TMAP[f'T{n:03}']=key
for nums,key in [
([1],'SHIP-05'),([2,53,79],'DEP-05'),([3,5],'PORT-14'),([4],'KNOW-05'),([6,7,9,12,14,83],'PORT-05'),([8,44],'PORT-03'),([10,11,85,89],'PORT-06'),([13],'DEP-04'),([15,17],'TEST-06'),([16,18,19,21,29,31,87,88],'PORT-04'),([20],'TEST-04'),([22,23,24,25,26,27,32,41,42,43],'PORT-08'),([28,50,51,52],'PORT-12'),([30,37,38,39,40,64,80,81,82,90],'PORT-07'),([33,34,35,36,86],'PORT-05'),([45,46,47,84],'PORT-09'),([48,49,117],'DEP-01'),([54,58,116],'DEP-08'),([55,70],'DEP-04'),([56],'TEST-07'),([57,137],'UX-01'),([59,119],'FIX-08'),([60,61,62,63,65,66,67,68,111],'TEST-06'),([69,72,73,113,126],'PERF-09'),([71],'PERF-07'),([74,75,76,77,115],'SHIP-05'),([78,110,127],'SHIP-04'),([91,92,96,99],'PORT-10'),([93],'PORT-14'),([94,104],'PORT-11'),([95],'PORT-09'),([97],'MAKE-11'),([98,100],'MAKE-05'),([101],'PORT-03'),([102],'MAKE-07'),([103],'MAKE-08'),([105,106,107,108],'WORLD-04'),([109],'TEST-01'),([112,120],'PORT-13'),([114,118],'DEP-06'),([121],'UX-10'),([122],'TEST-05'),([123],'TEST-08'),([124],'SHIP-01'),([125],'UX-09'),([128],'AOA-01'),([129],'AOA-02'),([130],'AOA-03'),([131],'AOA-04'),([132],'AOA-05'),([133,134],'AOA-06'),([135,138],'UX-02'),([136],'UX-03')]: bind(nums,key)

for nums,key in [([139],'PORT-01'),([140,161],'PORT-03'),([141],'PORT-12'),([142,150],'FIX-01'),([143],'PERF-01'),([144],'MAKE-01'),([145],'MAKE-10'),([146],'MAKE-02'),([147],'MAKE-07'),([148],'DEP-01'),([149,153],'UX-06'),([151],'TEST-03'),([152],'PLAY-05'),([154],'DEP-07'),([155],'UX-04'),([156],'DEP-05'),([157],'PERF-07'),([158],'UX-08'),([159,160,162],'UX-10'),([163,164],'SHIP-04')]: bind(nums,key)

def read_state():
 d=json.loads((K/'requirements.json').read_text(encoding='utf-8'))
 return d

def digest(b:bytes)->str: return hashlib.sha256(b).hexdigest()
def norm(s:str)->str:
 s=re.sub(r'^\s*[-*]\s+\[[ xX]\]\s*','',s)
 s=re.sub(r'\*\*[TG]\d{3,}[^*]*\*\*\s*[\u00b7-]?\s*','',s)
 return re.sub(r'\s+',' ',s.replace('**','').replace('`','')).strip().casefold()
def terms(s:str)->set[str]: return set(re.findall(r'[a-z0-9]+',s.casefold()))
def safe_write(p:Path,txt:str):
 p.parent.mkdir(parents=True,exist_ok=True)
 if p.exists() and p.read_text(encoding='utf-8')==txt:return
 fd,tmp=tempfile.mkstemp(dir=p.parent,prefix='.'+p.name)
 with os.fdopen(fd,'w',encoding='utf-8',newline='\n') as f:f.write(txt)
 os.replace(tmp,p)
def load_sources():
 paths=sorted(p for p in (ROOT/'docs').rglob('*') if p.is_file() and p.suffix.lower() in {'.md','.txt','.json'} and K not in p.parents)
 # Do not ingest generated documentation or mutable README navigation into itself.
 return sorted(paths + [ROOT/'README.md'])

def classify(text,context,path,groups):
 known={i['id']:i for g in groups for i in g['items']}
 ids=re.findall(r'\*\*(T\d{3,})\b',text)
 if ids and ('STUDIO_EXECUTION' in path or 'CONVERSION_ECOSYSTEM' in path):
  if ids[0] in TMAP:return TMAP[ids[0]]
 hint=fidelity.owner_hint(text,context,path)
 if hint in known:return hint
 t=terms(text);c=terms(context)
 score={k:sum(2 if v in t else 0 for v in voc.split())+sum(1.2 if v in c else 0 for v in voc.split()) for k,voc in VOCAB.items()}
 # Strong explicit semantics prevent broad parent titles swallowing specialties.
 full=(text+' '+context).lower()
 for needle,key in [('hotkey','CONFIG'),('black box','FIX'),('softlock','CONFIG'),('favorite','LIB'),('advent of ascension','AOA'),('aoa','AOA'),('friend hosting','SHIP'),('voice/social','SHIP')]:
  if needle in full:score[key]+=12
 if 'source authority' in full or 'source lineage' in full:score['PORT']+=5
 key=max(score,key=score.get)
 g=next(g for g in groups if g['id']==key)
 best=max(g['items'],key=lambda i:len(t&terms(i['title']))*4+len(t&terms(i['acceptance']))+len(c&terms(i['title']))*3)
 return best['id']

def blocks(txt):
 lines=txt.splitlines();heads=[];buf=[];start=1;fenced=False
 def flushed(end):
  nonlocal buf
  if not buf:return None
  s='\n'.join(buf).strip();buf=[]
  return (start,end,' / '.join(heads),s) if s and not re.fullmatch(r'[-*_\s]+',s) else None
 for n,line in enumerate(lines,1):
  if line.lstrip().startswith(('```','~~~')):
   if not fenced:
    v=flushed(n-1)
    if v:yield v
    start=n;buf=[line];fenced=True
   else:
    buf.append(line);fenced=False;v=flushed(n)
    if v:yield v
   continue
  if fenced:buf.append(line);continue
  m=re.match(r'^(#{1,6})\s+(.+)',line)
  if m:
   v=flushed(n-1)
   if v:yield v
   level=len(m[1]);heads=heads[:level-1];heads.append(m[2]);start=n;buf=[line]
   # Preserve heading text as source context; subsequent body shares its location.
  elif not line.strip():
   v=flushed(n-1)
   if v:yield v
  elif re.match(r'^\s*[-*]\s+\[',line):
   v=flushed(n-1)
   if v:yield v
   start=n;buf=[line]
  else:
   if not buf:start=n
   buf.append(line)
 v=flushed(len(lines))
 if v:yield v

def scan(groups):
 sources=[];unique={};aliases=[];urls=set();checked=0;unchecked=0;total=0
 for p in load_sources():
  b=p.read_bytes();text=fidelity.source_text(p,b.decode('utf-8'));rel=p.relative_to(ROOT).as_posix();sid='S-'+digest(rel.encode())[:10]
  kind='specification'
  if any(x in p.name.lower() for x in ['archived','pre_selfref','_v5','_v6','checkpoint','release_evidence','changelog']):kind='lineage / reported evidence'
  if p.name=='ENDERLOOM_STUDIO_EXECUTION.md':kind='current studio and AoA execution authority'
  sources.append({'id':sid,'path':rel,'sha256':digest(b),'bytes':len(b),'lines':len(text.splitlines()),'kind':kind,'url':REPO+'/blob/main/'+quote(rel),'source_checked':len(re.findall(r'^\s*-\s+\[[xX]\]',text,re.M))})
  checked+=sources[-1]['source_checked'];unchecked+=len(re.findall(r'^\s*-\s+\[ \]',text,re.M))
  for u in re.findall(r'https?://[^\s<>`"\)\]\}]+',text):
   u=u.rstrip('.,;:')
   if not re.search(r'(token|secret|signature|sig|key)=',u,re.I):urls.add(u)
  for lo,hi,ctx,txt in blocks(text):
   total+=1;canonical=norm(txt)
   # Short clauses depend on context. No fuzzy dedup can discard qualifiers.
   identity=canonical if len(canonical)>=140 else norm(ctx)+'\n'+canonical
   cid='C-'+digest(identity.encode())[:16];owner=classify(txt,ctx,rel,groups)
   occurrence={'source':sid,'start':lo,'end':hi,'context':ctx,'owner':owner}
   if cid not in unique:unique[cid]={'id':cid,'owner':owner,'text_sha256':digest(canonical.encode()),'occurrences':[]}
   unique[cid]['occurrences'].append(occurrence)
   for task in re.findall(r'^\s*-\s+\[[ xX]\]\s+\*\*([TG]\d{3,})\b',txt,re.M):
    aliases.append({'source':sid,'task':task,'clause':cid,'owner':unique[cid]['owner']})
 return {'sources':sources,'clauses':list(unique.values()),'aliases':aliases,'urls':sorted(urls),'stats':{'source_files':len(sources),'source_bytes':sum(x['bytes'] for x in sources),'source_lines':sum(x['lines'] for x in sources),'source_blocks':total,'unique_blocks':len(unique),'exact_duplicate_occurrences':total-len(unique),'source_checked':checked,'source_unchecked':unchecked,'alias_occurrences':len(aliases)}}

def head(title,lead):return f'# {title}\n\n{NAV}\n\n> {lead}\n\n'
def link_id(ident):return f'[**{ident}**](Checklist.md#{ident.lower()})'

def render(state,corpus):
 groups=state['groups'];items=[i for g in groups for i in g['items']];byid={i['id']:i for i in items};bygroup={g['id']:g for g in groups}
 src={s['id']:s for s in corpus['sources']};owner_sources=collections.defaultdict(set);owner_blocks=collections.Counter();owner_alias=collections.defaultdict(set)
 for c in corpus['clauses']:
  owner_blocks[c['owner']]+=1
  for o in c['occurrences']:owner_sources[c['owner']].add(o['source'])
 for a in corpus['aliases']:owner_alias[a['owner']].add((a['source'],a['task']))
 stats=corpus['stats'];pages={}
 pages['Home']=head('Enderloom Studio','Create beautifully. Convert confidently. Repair intelligently. Lose nothing.')+'''<div align="center">

### One studio. Four clear beginnings. Two immediate outcomes.

**[Complete Advent of Ascension](Advent-of-Ascension.md) &nbsp; | &nbsp; [Ship the beautiful studio](Studio.md)**

</div>

```mermaid
flowchart LR
    Home["Enderloom Studio"] --> Create["Create a Mod"]
    Home --> Convert["Convert to Version"]
    Home --> Repair["Repair / Fix Issues"]
    Home --> Optimize["Improve Performance"]
    Create --> Project["One persistent project"]
    Convert --> Project
    Repair --> Project
    Optimize --> Project
    Project --> Verify["Play test and verify"]
    Verify --> Deliver["Working, preserved result"]
```

## Choose your destination

| Workstream | What you can find |
| :--- | :--- |
'''
 for g in groups:pages['Home']+=f"| **[{g['title']}]({g['page']}.md)** | {g['summary']} |\n"
 pages['Home']+=f'''
## A checklist that cannot hide the details

**{len(items)} canonical outcome owners** connect **{stats['source_files']} located source documents** and **{stats['unique_blocks']:,} distinct source blocks**. Exact repeated occurrences share a source record; related specifications point to the same outcome rather than creating another progress checkbox. All original detailed clauses stay available through the [Source map](Source-Map.md).

> [!NOTE]
> Older specifications contain **{stats['source_checked']:,} checked task occurrences**. These remain recorded as historical source claims, not freshly verified app functionality. Current evidence and checkmarks are maintained in [one requirements ledger](requirements.json); this documentation build does not certify AoA or the application.

## Fast at the loss of nothing

Optimize duplicate work through shared services, verified caching, incremental invalidation and bounded concurrency. Keep full datasets, original content, native fidelity and required verification. **A faster incomplete result is a failed result.**

Use approachable controls and contextual depth, not a text-wall interface or twenty engine-specific toolbars. Ordinary setup and recovery belong to the app; sensitive authorization and destructive choices remain under user control.

**[Start or continue implementation](Working-Agreement.md)** / **[All source references](Reference-Index.md)** / **[Repository]({REPO})** / **[Releases]({REPO}/releases)**
'''
 pages['Checklist']=head('Execution checklist','One checkbox owns each complete capability. Its acceptance and linked source clauses are binding together.')+'''**Edit progress:** use the [record command](Working-Agreement.md#record-progress) or the canonical `requirements.json` ledger. Do not independently tick the Wiki, edit generated pages, or check an outcome because its heading sounds implemented.

**Status key:** unverified = no fresh certification recorded here; in progress / implemented / blocked / reopened remain unchecked; verified requires artifact-bound evidence. Historical checked source claims are retained in the Source map and do not mean the product is starting from zero.

'''
 for g in groups:
  pages['Checklist']+=f"## {g['title']}\n\n[{g['summary']}]({g['page']}.md)\n\n"
  for i in g['items']:
   ident=i['id'];checked='x' if i['status']=='verified' else ' '
   pages['Checklist']+=f"<a id=\"{ident.lower()}\"></a>\n- [{checked}] **{ident} - {i['title']}**\n  - **Accept:** {i['acceptance']}\n  - **State:** {i['status'].replace('_',' ')}. **Details:** [{owner_blocks[ident]} source blocks](Sources-{g['id']}.md#{ident.lower()}); {len(owner_sources[ident])} source documents.\n"
   if i.get('next'):pages['Checklist']+=f"  - **Next:** {i['next']}\n"
   for e in i.get('evidence',[]):pages['Checklist']+=f"  - **Proof:** [{e['path']}]({REPO}/blob/main/{quote(e['path'])}) - artifact `{e['artifact_sha256']}`; source `{e['source_commit']}`.\n"
   pages['Checklist']+='\n'
 pages['Checklist']+='''## Combined release acceptance

Both immediate outcomes must pass alongside every applicable supporting capability: complete original AoA, the real beautiful studio, lossless measured performance, source-to-output parity, clean reproduction, actual packaged-runtime workflows, and verified distribution. A missing test, restricted candidate or incomplete adapter does not disappear because a high-level summary looks finished.
'''
 # Domain pages navigate to, rather than repeat, the single checklist owner.
 for g in groups:
  text=head(g['title'],g['summary'])
  for i in g['items']:text+=f"### {i['title']}\n\n{link_id(i['id'])} - {i['acceptance']}\n\n"
  text+=f"**[Every linked source clause](Sources-{g['id']}.md)** / **[Source manifest](Source-Map.md)**\n"
  pages[g['page']]=text
 pages['Studio']+=r'''
## The workspace, not a wall of text

| Region | What belongs here | What does not |
| :--- | :--- | :--- |
| Home | Four actions, import/drop, real recents, Continue | Raw checklists, logs, JSON or backend configuration forms |
| Left rail | Project content tree, outliner and contextual navigation | Separate disconnected studios for every file format |
| Center | Real model/texture/recipe/source/world editor and preview | Fake demo assets or generated runtime evidence |
| Right inspector | Selection properties, relationships and relevant actions | Global settings unrelated to the current work |
| Bottom tray | Jobs, errors, tests, timeline and expandable technical details | Persistent full-screen terminal output |

```mermaid
flowchart TD
    Home["Home: Create / Convert / Repair / Optimize"] --> Workspace["Project workspace"]
    Workspace --> Content["Content browser and outliner"]
    Workspace --> View["Large editor and real preview"]
    Workspace --> Inspect["Contextual inspector"]
    Workspace --> Jobs["Collapsible jobs and evidence"]
    Content <--> View
    View <--> Inspect
    Jobs --> Actions["Play Test / Build / Export / Undo"]
```

Keep **Favorites**, **Performance**, and the dedicated **Hotkeys** tab as first-class destinations. Preserve working Catalog, Source, Browser, Launcher and split/full views; connect them rather than cloning their state. Use deep graphite/plum, restrained amethyst, equally finished light/dark themes, readable controls, consistent spacing and short meaningful motion. Respect reduced motion; no decorative idle GPU loop.

**Acceptance budgets, not measured claims:** local click/cancel acknowledgement within 100 ms; warm local view within 200 ms; first indexed search result within 300 ms on the recorded baseline. Measure p95 with large real projects. Test all specified viewport sizes, both themes, keyboard-only use and high-DPI scaling. Screenshots show composition; actual interaction tests prove behavior.
'''
 pages['Architecture']=head('Architecture','One identity graph, one action registry, one job state, many proven engines.')+r'''
```mermaid
flowchart TD
    UI["Studio / Catalog / Launcher"] --> Actions["Typed action registry"]
    CLI["CLI / MCP / AI operator"] --> Actions
    Actions --> Jobs["Durable job and transaction core"]
    Jobs --> IDs["Identity and dependency graphs"]
    Jobs --> IR["Source authority and semantic project"]
    IR --> Engines["Version-aware conversion / creation / repair engines"]
    IDs --> Engines
    Engines --> Stage["Owned staging and build matrix"]
    Stage --> Proof["Static, native runtime and parity validation"]
    Proof --> Release["Verified artifacts and safe installation"]
    Proof --> Brain["Evidence Brain and regression fixtures"]
    Brain --> Engines
    Jobs --> Events["Structured progress, findings and recovery"]
    Events --> UI
    Events --> CLI
```

## The boundaries that keep it coherent

| Owner | Owns | Must not become |
| :--- | :--- | :--- |
| Identity graph | Projects, versions, sources, mods, instances and exact artifact identity | Filename-based guesses or duplicate provider records |
| Semantic project | Source lineage, behavior, content and target transformations | A disconnected copy per version or loader |
| Action registry | Shared typed GUI/CLI/MCP/agent operations | Bypass-only agent commands or decorative buttons |
| Job core | Staging, cancellation, retry, fingerprints and recovery | A fresh task after every restart or duplicate worker writes |
| Evidence graph | Inputs, artifacts, scenarios, observations and proof freshness | Model confidence or unchecked upstream assertions |
| Tool adapters | Pair-specific capabilities and tested library/CLI calls | The product's version ceiling or a user-facing tool maze |

## Honest state transitions

```mermaid
stateDiagram-v2
    [*] --> Planned
    Planned --> Preparing
    Preparing --> Running
    Running --> Verifying
    Running --> Repairing: causal failure
    Repairing --> Running: shared fix and regression
    Verifying --> Complete: current artifact and required proof pass
    Verifying --> Repairing: parity or runtime mismatch
    Running --> Cancelled: scoped cancellation
    Preparing --> NeedsAction: real external requirement
    NeedsAction --> Preparing: requirement satisfied
    Cancelled --> Preparing: resume valid stages
    Complete --> Stale: inputs or relevant implementation changed
    Stale --> Preparing: verify again
```

Cancellation, failed downloads and inaccessible hosts never mean success or absence. Partial and staged outputs stay separate from certified artifacts. A completed symbol mapping is not a completed semantic port.
'''
 pages['Dependencies-and-Recovery']+=r'''
## A download or build failure must not lose the job

```mermaid
sequenceDiagram
    actor User
    participant Studio
    participant Resolver
    participant Worker
    participant Proof
    User->>Studio: Convert selected project
    Studio->>Resolver: Resolve exact transitive target requirements
    Resolver-->>Studio: Reuse verified files or acquire missing requirements
    Studio->>Worker: Stage immutable inputs and execute
    Worker-->>Studio: Structured progress or causal failure
    Studio->>Worker: Apply reusable fix and resume valid stages
    Worker->>Proof: Exact candidate and source census
    Proof-->>Studio: Artifact-bound result
    Studio-->>User: Play Test, Install, View Changes or real next action
```

**QoL connections:** duplicate clicks attach to the same job; a lost connection preserves the selected dependency and continues after legitimate reconnect; changed source invalidates only dependent results; a crash leaves the original project and world untouched. These are connected scenarios for existing requirements, not new permission to bypass access controls or silently change intent.
'''
 pages['Performance']+=r'''
## Dual-success contract

```mermaid
flowchart LR
    Baseline["Versioned full baseline"] --> Profile["Measure and attribute"]
    Profile --> Fix["Repair actual hot path"]
    Fix --> Equivalent["Same workload and full fidelity"]
    Equivalent --> Speed{"Material repeatable gain?"}
    Speed -->|No| Profile
    Speed -->|Yes| Quality{"All protected results preserved?"}
    Quality -->|No| Fix
    Quality -->|Yes| Promote["Promote and retain rollback"]
```

Keep world/scenario, entity population, features, draw/simulation distances, shaders, geometry, texture detail, AI/animation cadence, test coverage and output completeness constant. Separate a quick static risk signal from measured causality, and low-overhead measurement from intrusive attribution. Show sample size, spread, cold/warm conditions and per-lane regressions. Do not hide a slower lane in an average or manufacture a speedup by shortening the test.

The selected mod/instance and Enderloom's own conversion pipeline are separate optimization targets. Both matter. A flat already-optimal test case may honestly show no gain, but required improvement fixtures cannot be waived.
'''
 pages['Advent-of-Ascension']+=r'''
## Delivery sequence

```mermaid
flowchart LR
    Source["Accepted original lineage"] --> Census["Complete content and behavior census"]
    Census --> Convert["Reusable shared transformations"]
    Convert --> Build["Requested target packages"]
    Build --> Native["Native gameplay and save proof"]
    Native --> Replay["Clean replay from original input"]
    Replay --> Ship["Advent of Ascension delivered"]
```

AoA is not just a regression fixture. Do not substitute a smaller branch, generic mob, missing dimension, disabled subsystem, renamed fork or manually repaired output tree. Each necessary fix improves the canonical Enderloom/Dev Kit owner and gains a triggering regression. Deliver validated AoA artifacts as soon as its own gates pass while independent studio work continues; the combined assignment remains open until both outcomes pass.
'''
 pages['Working-Agreement']=head('Working agreement','Implement first. Update one progress record. Keep the source details and proof connected.')+r'''
## Continue, do not restart

Read the current project instructions, active worktree/job and the [current Studio execution brief](../ENDERLOOM_STUDIO_EXECUTION.md). Preserve existing code, task identities, source hashes, accepted targets and verified fixes. This Wiki is a navigation and progress layer, not permission to replace the original detailed contracts. The latest explicit user direction controls conflicts; older independent requirements remain binding. The original Studio task IDs remain searchable aliases in the source map.

Keep documentation changes out of the way of implementation. Use `mutate -> changed-path test -> coherent checkpoint -> next ready task`; broader native/release tests happen at convergence and when invalidated. Two unchanged failed attempts require a causal strategy change. A rights or authentication requirement is not a task completion.

## Record progress

`docs/knowledge/requirements.json` is the **only editable progress owner**. The checklist, domain pages and native Wiki are generated views. Do not edit generated checkboxes separately.

```bash
python scripts/knowledge/knowledge.py record AOA-02 --state in_progress --next "Resolve the earliest failing target transform"
python scripts/knowledge/knowledge.py record AOA-02 --state verified --proof docs/evidence/aoa-port.json
python scripts/knowledge/knowledge.py build
python scripts/knowledge/knowledge.py check
```

Use a real proof file, not a dummy to satisfy validation. The proof JSON must contain `status: "passed"`, `requirement_id`, the tested `artifact_sha256`, `source_commit`, `commands`, and `observations`. Every referenced command must have actually run. For runtime-sensitive outcomes include exact native-run identity, relevant observations, parity and repeatable artifact evidence. The structural validator checks presence/identity, not the truth of a human assertion; reviewers and product acceptance still inspect actual evidence.

Mark `implemented` until required runtime/parity/performance proof exists. If later inputs or code invalidate proof, use `reopened` and give the exact next action. Preserve historical source checkmarks as claims, never automatically promote them to verified. No percentage here claims to measure how much of the real app currently works.

## Source coverage and deduplication

One canonical outcome owns each capability. Source blocks are preserved by exact file, line range, context and SHA-256. Literal repeated blocks can share an identity; short clauses keep heading context. Paraphrases and different qualifiers are not silently discarded as equivalent. Several detailed requirements can roll up to one outcome, whose box may be checked only when **all applicable linked details** and acceptance pass.

Automatic block routing is navigation, not a semantic proof or authority to waive a clause. Inspect linked context during implementation; fix a misplaced owner rather than dropping the requirement. Original specs retain their original checkboxes as historical/source detail, not competing current ledgers. The Source map reports every parsed block and original task alias so consolidation is auditable.

## Publication and maintenance

Commit the ledger, generator or source changes normally. The knowledge workflow validates and regenerates docs, preserves a complete artifact, updates the scoped README section and publishes the native Wiki with authorized credentials. It is event-driven, not scheduled app polling. Generated pages preserve manually maintained unrelated Wiki files. Wiki publication has its own explicit success/failure receipt; a repository documentation commit does not by itself prove native Wiki publication.

## Locked product boundaries

Preserve one Studio, dedicated Hotkeys, Favorites and Performance surfaces, the real browser/catalog/launcher, full CLI parity and both immediate product outcomes. Friend-hosting/P2P/reverse-tunnel services and a Voice/Social center were explicitly excluded. Optional image tools never replace real project previews or native proof. Reqsery's separate permission applies to MC Mod Porter, not unrelated restricted projects.
'''
 # Source map: exact locators, identities and aliases, no copied parallel specification text.
 pages['Source-Map']=head('Source map','Full original detail, one current progress owner, auditable consolidation.')+f'''## Coverage receipt

| Measure | Count |
| :--- | ---: |
| Located source documents | {stats['source_files']} |
| Source lines processed | {stats['source_lines']:,} |
| Non-empty source blocks accounted for | {stats['source_blocks']:,} |
| Distinct contextual/exact source blocks | {stats['unique_blocks']:,} |
| Exact repeated occurrences sharing an identity | {stats['exact_duplicate_occurrences']:,} |
| Original checked occurrences retained as source claims | {stats['source_checked']:,} |
| Original unchecked occurrences | {stats['source_unchecked']:,} |
| Namespaced original task aliases | {stats['alias_occurrences']:,} |
| Canonical outcome progress owners | {len(items)} |

All Markdown/text/JSON sources under `docs/`, excluding generated knowledge pages, are processed without a per-file or per-result cap. This corpus contains the located repository specs, current attached Studio brief and connected Drive lineage snapshots. It does not claim knowledge of files never uploaded, inaccessible private documents, or unpublished local edits. Source coverage is not product completion.

**Authority:** current explicit user goals and Studio brief determine the paired delivery and modern UI; Northpoint/Apex preserve exact conversion/content constraints; other specifications supply independent detailed obligations. Older conflicting directions and source-reported completion must be reconciled against current evidence, not silently copied as truth.

## Documents and fingerprints

'''
 for s in corpus['sources']:
  owners=collections.Counter(c['owner'] for c in corpus['clauses'] if any(o['source']==s['id'] for o in c['occurrences']))
  pages['Source-Map']+=f"<a id=\"{s['id'].lower()}\"></a>\n<details>\n<summary><strong>{html.escape(Path(s['path']).name)}</strong> - {s['lines']:,} lines</summary>\n\n[Open full source]({s['url']}) | {s['kind']}\n\nSHA-256: `{s['sha256']}`  \nBytes: {s['bytes']:,}. Historical checked occurrences: {s['source_checked']}.\n\n"
  pages['Source-Map']+='**Outcome owners:** '+', '.join(link_id(k) for k in sorted(owners))+'\n\n</details>\n\n'
 pages['Source-Map']+='**[Machine-readable block/alias map](source-map.json)** / **[Source inventory](source-inventory.json)**\n'
 for g in groups:
  pg=head('Source details / '+g['title'],'Exact source clauses remain binding. Related clauses share a single checklist owner, not duplicated progress.')
  for i in g['items']:
   ident=i['id'];pg+=f"<a id=\"{ident.lower()}\"></a>\n## {ident} - {i['title']}\n\n{link_id(ident)}\n\n<details>\n<summary>Source clauses and aliases ({owner_blocks[ident]} distinct blocks)</summary>\n\n"
   grouped=collections.defaultdict(list)
   for c in corpus['clauses']:
    if c['owner']!=ident:continue
    for o in c['occurrences']:
     grouped[(o['source'],o['context'])].append((o['start'],o['end'],c['id']))
   for (sid,ctx),rows in sorted(grouped.items()):
    ss=src[sid];lo=min(v[0] for v in rows);hi=max(v[1] for v in rows)
    label=ctx.replace('|',' / ').replace('[','').replace(']','') or Path(ss['path']).name
    pg+=f"- [{html.escape(label)}]({ss['url']}#L{lo}-L{hi}) - {Path(ss['path']).name}; {len(set(v[2] for v in rows))} distinct blocks.\n"
   if owner_alias[ident]:pg+='\n**Original aliases:** '+', '.join(f"`{Path(src[s]['path']).name}::{t}`" for s,t in sorted(owner_alias[ident]))+'\n'
   pg+='\n</details>\n\n'
  pages['Sources-'+g['id']]=pg
 # Catalogue derives repository identity from actual links in source material.
 projects=collections.defaultdict(set);other=[]
 for u in corpus['urls']:
  q=urlsplit(u);parts=q.path.strip('/').split('/')
  if q.netloc.lower()=='github.com' and len(parts)>=2 and parts[0] not in {'features','topics','orgs','marketplace','login','settings'}:
   name='/'.join(parts[:2]);projects[name].add(u)
  else:other.append(u)
 lead={
 'reqsery/mc-mod-porter':('Source integration','Full separate user permission; ingest useful corpus, harden rewrites, retain notices and exact provenance.'),
 'champmk/modforge':('Mapping truth','Descriptor-qualified/JAR-verified resolver and differential fixtures; not semantic parity by itself.'),
 'Bownlux/Retromod':('JAR transformations','Pair-specific managed backend; preserve nested inputs and truthfully separate modified JAR from native port.'),
 'Sinytra/Adapter':('Mixin adaptation','Focused dynamic Mixin repair corpus and tested adapters; prove injection semantics.'),
 'stonecutter-versioning/stonecutter':('Build matrix','Real shared multi-version workspaces beneath the canonical semantic project.'),
 'isXander/modstitch':('Build matrix','Unified modern loader workspace conventions, capability-probed per target.'),
 'isXander/modstitch-toolkit':('Build matrix','Access, metadata, repositories and source-set conventions, not hand-written duplicates.'),
 'FabricMC/mapping-io':('Mapping','Mapping format/tree/visitor primitives and differential parser coverage.'),
 'FabricMC/tiny-remapper':('Mapping','Bytecode remapping with exact classpath and mapping provenance.'),
 'neoforged/AutoRenamingTool':('Mapping','Forge-family inheritance/remap pipeline; compare overlap with canonical resolver.'),
 'neoforged/NeoFormRuntime':('Build/source','Official artifact/classpath/source execution and immutable cache.'),
 'neoforged/JavaSourceTransformer':('Source','Headless structured Java transformations; avoid global text replacement.'),
 'Vineflower/vineflower':('Source recovery','Primary authorized decompilation with bytecode/source/runtime reconciliation.'),
 'leibnitz27/cfr':('Source recovery','Differential recovery when source reconstruction is ambiguous.'),
 'badasintended/ravel':('Source','Java/Kotlin/Mixin/access mapping route; automate, not a manual IDE handoff.'),
 'unimined/Unimined':('Historical builds','Wide historical backend; preserve exact supported target constraints.'),
 'unimined/JvmDowngrader':('Backport','Classfile/API compatibility where source semantics are valid; native linkage still required.'),
 'GTNewHorizons/RetroFuturaGradle':('Historical builds','Purpose-built historical Forge workspace support.'),
 'GeyserMC/PackConverter':('Resources','Resource converter, not complete gameplay translation; harden missing paths.'),
 'GeyserMC/Rainbow':('Resources','Runtime/resource custom-content extraction; reconcile full census, not observed inventory alone.'),
 'Bedrock-OSS/regolith':('Bedrock build','Owned filter/build pipeline; isolate executable filters.'),
 'bridge-core/dash-compiler':('Bedrock build','Embedded/headless compiler, not an unrelated editor fork.'),
 'mcbeet/beet':('Packs/commands','Current Beet/Mecha source pipeline and command validation.'),
 'SpyglassMC/Spyglass':('Diagnostics','Structured data-pack language diagnostics linked to real runtime tests.'),
 'JannisX11/blockbench':('Visual codecs','Model/UV/animation round-trip reference and real assets.'),
 'unnamed/mocha':('Molang','Parser/evaluator/compiler comparisons with state/timing/thread correctness.'),
 'HiveGamesOSS/Chunker':('Worlds','Staged exact-pair world translation, full field reconciliation and rollback.'),
 'kbinani/je2be-core':('Worlds','Alternative/differential world backend; never a mod-code translator.'),
 'Amulet-Team/PyMCTranslate':('Rights constrained','Current-source reuse requires applicable grant; Reqsery permission does not apply.'),
 'PatchworkMC/patchwork-patcher':('Historical reference','Archived ideas/fixtures, not primary production dependency.'),
 'meza/Stonecraft':('Reference/licensing','Study useful conventions; exact license/distribution decision before source merge.'),
 'lucko/spark':('Performance','Real runtime profiling adapter; control measurement overhead.'),
 'tasgon/observable':('Performance','Relevant tick attribution; select compatible exact version.'),
 }
 pages['Ecosystem']=head('Ecosystem / projects to improve from','Integrate useful capability, not every dependency. Every selected tool needs exact provenance and proof.')+'''## Integration priorities

| Project | Role | Integration requirement |
| :--- | :--- | :--- |
'''
 for name,(role,why) in lead.items():
  if name in projects:pages['Ecosystem']+=f'| [{name}](https://github.com/{name}) | {role} | {why} |\n'
 pages['Ecosystem']+='''
## Integration rules

A library, managed CLI, vendored source, differential oracle or fixture-only role is chosen by demonstrated capability and rights. A registry entry is not a completed required integration. Select one primary backend per job and escalate only affected work to alternatives; do not run every engine unnecessarily.

Keep MC Mod Porter's separate user grant and attribution. Do not transfer it to EpikBoxxy's PortKit, PyMCTranslate, commercial assets or model weights. Distinguish anchapin/portkit from the unrelated AutoPort listing. Follow maintainer-declared moves such as Mecha and Fabric Class Tweaker. Preserve restricted candidates without ingesting their code and use lawful alternatives.

**Freshness:** these are source-derived integration candidates, not a new assertion of the latest release or current compatibility. At implementation, resolve exact source/version/license, run real fixtures and keep the evidence. No compatible badge can be inherited from another mod or target.

## Additional source-linked projects

'''
 for name in sorted(projects,key=str.casefold):
  if name in lead or name.casefold().startswith('herbertofury/'):continue
  pages['Ecosystem']+=f'- [{name}](https://github.com/{name}) - [specific cited locations](Reference-Index.md#{slug(name)}).\n'
 pages['Ecosystem']+='\n**[All original reference links](Reference-Index.md)** / **[Conversion requirements](Conversion.md)** / **[Adaptive mod contracts](Knowledge-and-Compatibility.md)**\n'
 pages['Reference-Index']=head('Reference index','Deduplicated source URLs retain specific cited locations; a link is not endorsement or permission.')
 for name,locs in sorted(projects.items(),key=lambda x:x[0].casefold()):
  pages['Reference-Index']+=f'<a id="{slug(name)}"></a>\n<details>\n<summary>{html.escape(name)} ({len(locs)} cited locations)</summary>\n\n'
  for u in sorted(locs):pages['Reference-Index']+=f'- [{html.escape(u)}]({u})\n'
  pages['Reference-Index']+='\n</details>\n\n'
 pages['Reference-Index']+='## Other documentation and providers\n\n'
 for u in other:pages['Reference-Index']+=f'- [{html.escape(u)}]({u})\n'
 pages['_Sidebar']='## Enderloom\n\n[Home](Home.md)\n\n[Execution checklist](Checklist.md)\n\n'
 for g in groups:pages['_Sidebar']+=f"- [{g['title']}]({g['page']}.md)\n"
 pages['_Sidebar']+='\n[Architecture](Architecture.md) / [Ecosystem](Ecosystem.md)\n\n[Source map](Source-Map.md) / [Working agreement](Working-Agreement.md)\n'
 pages['_Footer']='**Enderloom** - Fast at the loss of nothing. [Checklist](Checklist.md) / [Source map](Source-Map.md) / [Repository]('+REPO+')\n'
 fidelity.augment(ROOT,state,corpus,pages)
 for name,text in pages.items():safe_write(K/(name+'.md'),text)
 safe_write(K/'source-inventory.json',json.dumps({'sources':corpus['sources'],'stats':stats},indent=2)+'\n')
 safe_write(K/'source-map.json',json.dumps({'schema_version':1,'clauses':corpus['clauses'],'aliases':corpus['aliases']},separators=(',',':'))+'\n')
 # Wiki links are absolute because repository-relative Markdown paths are not Wiki URLs.
 wiki=ROOT/'build/knowledge/wiki';wiki.mkdir(parents=True,exist_ok=True)
 for name,text in pages.items():
  def rew(m):
   label,dst=m.group(1),m.group(2)
   if re.match(r'https?://',dst):return m.group(0)
   base,sep,anchor=dst.partition('#')
   if base.endswith('.md') and '/' not in base and base[:-3] in pages:
    target=REPO+'/wiki/'+quote(base[:-3])+('#'+anchor if sep else '')
   else:
    pp=(K/base).resolve()
    try:rel=pp.relative_to(ROOT).as_posix()
    except ValueError:raise ValueError('Escaping documentation link: '+dst)
    target=REPO+'/blob/main/'+quote(rel)+('#'+anchor if sep else '')
   return f'[{label}]({target})'
  safe_write(wiki/(name+'.md'),re.sub(r'\[([^\]\n]+)\]\(([^\s\)]+)\)',rew,text))
 # README stays intact outside this owned, bounded navigation block.
 rp=ROOT/'README.md';rd=rp.read_text(encoding='utf-8');marker='<!-- ENDERLOOM-KNOWLEDGE:START -->';end='<!-- ENDERLOOM-KNOWLEDGE:END -->'
 nav=f'''{marker}
## Enderloom Studio - product hub

**[Explore the Studio Wiki](https://github.com/Herbertofury/Enderloom/wiki)** | **[Track implementation](docs/knowledge/Checklist.md)** | **[Architecture](docs/knowledge/Architecture.md)** | **[Ecosystem](docs/knowledge/Ecosystem.md)**

Complete **Advent of Ascension** and ship a beautiful studio for **Create / Convert / Repair / Improve Performance**. One requirements ledger connects the full specifications, proof and practical workflows. **Fast at the loss of nothing.**

[Repository-backed hub](docs/knowledge/Home.md) / [Complete Studio execution](docs/ENDERLOOM_STUDIO_EXECUTION.md) / [Source coverage](docs/knowledge/Source-Map.md)
{end}'''
 if marker in rd:rd=re.sub(re.escape(marker)+r'.*?'+re.escape(end),lambda _:nav,rd,flags=re.S)
 else:
  first,sep,rest=rd.partition('\n');rd=first+'\n\n'+nav+'\n'+rest
 safe_write(rp,rd)
 safe_write(ROOT/'build/knowledge/receipt.json',json.dumps({'stats':stats,'outcome_owners':len(items),'pages':len(pages),'verified_outcomes':sum(i['status']=='verified' for i in items),'evidence_boundary':'Source coverage and documentation only; no fresh product certification.'},indent=2)+'\n')
 return pages

def slug(s):return re.sub(r'[^a-z0-9-]+','-',s.lower()).strip('-')
def proof_valid(item):
 if item['status'] not in STATES:raise ValueError('Unknown state '+item['id'])
 if item['status']!='verified':return
 if not item.get('evidence'):raise ValueError('Verified item has no proof: '+item['id'])
 for e in item['evidence']:
  if not re.fullmatch(r'[0-9a-f]{64}',e.get('artifact_sha256','')):raise ValueError('Missing artifact SHA-256')
  if not re.fullmatch(r'[0-9a-f]{40}',e.get('source_commit','')):raise ValueError('Missing source commit')
  p=(ROOT/e['path']).resolve()
  if ROOT not in p.parents or not p.is_file():raise ValueError('Missing/out-of-repository proof')
  data=json.loads(p.read_text())
  if e.get('proof_sha256') != digest(p.read_bytes()):raise ValueError('Proof changed after certification')
  if data.get('status')!='passed' or data.get('requirement_id')!=item['id']:raise ValueError('Wrong/failed proof')
  if data.get('artifact_sha256')!=e['artifact_sha256'] or data.get('source_commit')!=e['source_commit']:raise ValueError('Proof identity mismatch')
  if not data.get('commands') or not data.get('observations'):raise ValueError('Empty command/observation proof')

def check(state,corpus):
 fidelity.validate(ROOT,state,corpus)
 ids=[i['id'] for g in state['groups'] for i in g['items']]
 if len(ids)!=len(set(ids)):raise ValueError('Duplicate outcome ID')
 for g in state['groups']:
  for i in g['items']:proof_valid(i)
 if sum(len(c['occurrences']) for c in corpus['clauses'])!=corpus['stats']['source_blocks']:raise ValueError('Source coverage loss')
 if any(c['owner'] not in ids for c in corpus['clauses']):raise ValueError('Unowned source block')
 for a in corpus['aliases']:
  if a['owner'] not in ids:raise ValueError('Unowned original alias')
 # Verify every local link target and explicit/heading anchor.
 pages={p.name:p.read_text() for p in K.glob('*.md')}
 for name,text in pages.items():
  if text.count('```')%2:raise ValueError('Unbalanced fence '+name)
  for dst in re.findall(r'\[[^\]\n]+\]\(([^\s\)]+)\)',text):
   if dst.startswith(('http://','https://','mailto:')):continue
   path,_,anchor=dst.partition('#');target=(K/path).resolve()
   if not target.exists():raise ValueError('Broken link '+name+' -> '+dst)
   if anchor and target.suffix=='.md':
    body=target.read_text();anchors=set(re.findall(r'<a id="([^"]+)"',body))|{slug(m) for m in re.findall(r'^#+\s+(.+)',body,re.M)}
    if anchor not in anchors:raise ValueError('Broken anchor '+name+' -> '+dst)
 # No generated domain checklist duplication: canonical Markdown progress only in Checklist.
 for name,text in pages.items():
  if name!='Checklist.md' and not name.startswith('Acceptance-') and re.search(r'^- \[[ x]\]',text,re.M):raise ValueError('Parallel checkbox owner '+name)
 print(json.dumps({'status':'passed','checks':['unique outcome IDs','all source blocks accounted for','all aliases mapped','local links and anchors','one progress owner','evidence identity guards'],'stats':corpus['stats']},indent=2))

def main():
 ap=argparse.ArgumentParser(description=__doc__);sub=ap.add_subparsers(dest='cmd',required=True)
 for n in ['build','check']:sub.add_parser(n)
 rec=sub.add_parser('record');rec.add_argument('id');rec.add_argument('--state',required=True,choices=sorted(STATES));rec.add_argument('--next');rec.add_argument('--proof')
 args=ap.parse_args();state=read_state()
 if args.cmd=='record':
  item=next((i for g in state['groups'] for i in g['items'] if i['id']==args.id),None)
  if item is None:raise ValueError('Unknown ID '+args.id)
  item['status']=args.state
  if args.next:item['next']=args.next
  if args.proof:
   p=(ROOT/args.proof).resolve()
   if ROOT not in p.parents:raise ValueError('Out-of-repository proof path')
   data=json.loads(p.read_text())
   item['evidence']=[{'path':p.relative_to(ROOT).as_posix(),'artifact_sha256':data.get('artifact_sha256'),'source_commit':data.get('source_commit'),'proof_sha256':digest(p.read_bytes())}]
  fidelity.validate_outcome(ROOT,state,args.id,scan(state['groups']))
  proof_valid(item);safe_write(K/'requirements.json',json.dumps(state,indent=2)+'\n')
 corpus=scan(state['groups'])
 if args.cmd in {'build','record'}:render(state,corpus)
 check(state,corpus)

if __name__=='__main__':
 try:main()
 except (ValueError,OSError,json.JSONDecodeError) as exc:print('ERROR:',exc,file=sys.stderr);sys.exit(1)
