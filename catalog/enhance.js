(() => {
  'use strict';
  const states = new Map();
  const preconnectedOrigins = new Set();
  const quickQueue = [];
  const deepQueue = [];
  const queued = new Set();
  const deepTimers = new Map();
  const MAX_QUICK_JOBS = Math.max(24, Math.min(48, (Number(navigator.hardwareConcurrency)||12) * 2));
  const MAX_DEEP_JOBS = Math.max(6, Math.min(10, Math.ceil((Number(navigator.hardwareConcurrency)||12) / 4)));
  const cacheBatchPending = new Map();
  let cacheBatchScheduled = false;
  let activeQuickJobs = 0;
  let activeDeepJobs = 0;
  let current = null;
  let hoverTimer = 0;
  let visibilityObserver = null;
  let primeScheduled = false;
  const primePendingIds = new Set();
  let primeUnsubscribe = null;
  const primeAvailable = () => typeof window.mobCompanion?.primeMedia==='function' && typeof window.mobCompanion?.onMedia==='function';
  const isHttp = value => { try { const u=new URL(value); return u.protocol==='http:'||u.protocol==='https:'; } catch { return false; } };
  const mediaSourceScore = raw => { try {
    const u=new URL(raw),p=u.pathname.replace(/\/+$/,''),h=u.hostname.toLowerCase();let score=100;
    // Frontier-first ranking: deterministic/API-backed providers return trustworthy media
    // with the least HTML work, followed by exact project homes. Slow collection/profile
    // pages and auxiliary routes remain available for uncapped deep enrichment.
    if(/(?:^|\.)github\.com$/.test(h))score+=95;
    else if(/(?:^|\.)modrinth\.com$/.test(h))score+=90;
    else if(h==='hangar.papermc.io')score+=88;
    else if(h==='gitlab.com')score+=86;
    else if(/(?:^|\.)spigotmc\.org$/.test(h))score+=84;
    else if(/(?:^|\.)curseforge\.com$/.test(h))score+=58;
    else if(/(?:^|\.)planetminecraft\.com$/.test(h)||/(?:^|\.)dev\.bukkit\.org$/.test(h))score+=50;
    else if(/(?:^|\.)mcpedl\.com$/.test(h)||/(?:^|\.)modbay\.org$/.test(h)||/(?:^|\.)moddb\.com$/.test(h))score+=48;
    else if(/(?:^|\.)patreon\.com$/.test(h)||/(?:^|\.)nexusmods\.com$/.test(h))score+=46;
    else if(/(?:^|\.)afdian\.com$/.test(h))score+=44;
    else if(/(?:^|\.)minecraft\.net$/.test(h)&&/\/marketplace/i.test(p))score+=44;
    else if(/(?:^|\.)builtbybit\.com$/.test(h))score+=44;
    else if(/(?:^|\.)(?:booth\.pm|fourthwall\.(?:com|dev)|ko-fi\.com|polymart\.org)$/.test(h))score+=42;
    else if(/(?:^|\.)itch\.io$/.test(h)||/(?:^|\.)gumroad\.com$/.test(h))score+=40;
    if(/\/(?:files|download|relations|dependencies|changelog|issues|releases|wiki)(?:\/|$)/i.test(p))score-=70;
    if(/\/(?:gallery|screenshots?|media)(?:\/|$)/i.test(p))score+=8;
    if(/\/(?:collection|collections|members?|profile|user)(?:\/|$)/i.test(p))score-=28;
    return score;
  } catch { return 0; } };
  const quickUrlsFor = s => [...(s.urls||[])].filter(isHttp).sort((a,b)=>mediaSourceScore(b)-mediaSourceScore(a));
  const toast = message => { const el=document.getElementById('toast'); if(!el)return; el.textContent=message; el.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove('show'),1800); };
  const css = `
  .live-media-slot{position:relative;overflow:hidden}.live-media-slot .live-media-image,.live-media-slot .live-media-video{display:block;width:100%;height:100%;object-fit:cover}.live-media-slot .live-media-image[hidden],.live-media-slot .live-media-video[hidden]{display:none!important}
  .live-media-loading{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:8px;color:var(--muted);font-size:.66rem;font-weight:800;letter-spacing:.03em;background:linear-gradient(110deg,rgba(169,139,255,.09),rgba(114,216,208,.13),rgba(169,139,255,.09));background-size:240% 100%;animation:liveMediaSweep 1.7s linear infinite}
  .project-icon.live-media-slot,.detail-icon.live-media-slot,.author-avatar.live-media-slot{display:block;background:var(--panel2)}.project-icon.live-media-slot .live-media-loading,.detail-icon.live-media-slot .live-media-loading,.author-avatar.live-media-slot .live-media-loading{font-size:0}.project-icon.live-media-slot .live-media-loading:after,.detail-icon.live-media-slot .live-media-loading:after,.author-avatar.live-media-slot .live-media-loading:after{content:'↻';font-size:.8rem;color:var(--accent2)}
  .author-avatar.live-media-slot{flex:0 0 24px}.detail-icon.live-media-slot{width:84px;height:84px;border-radius:19px}.gallery-banner.live-gallery-slot,.visual-image-button.live-gallery-slot,.detail-gallery.live-gallery-slot{background:linear-gradient(135deg,rgba(169,139,255,.14),rgba(114,216,208,.09))}
  .detail-gallery.live-gallery-slot{position:relative;height:260px;max-height:260px;margin-bottom:16px;border-radius:16px;border:1px solid var(--line);overflow:hidden}.detail-gallery.live-gallery-slot .live-media-image{object-fit:cover}
  @keyframes liveMediaSweep{to{background-position:-240% 0}}@media(prefers-reduced-motion:reduce){.live-media-loading{animation:none}}
  .mv-gallery-ui{position:absolute;inset:0;z-index:3;pointer-events:none}.mv-gallery-nav,.mv-gallery-badge{pointer-events:auto}.mv-gallery-open{position:absolute;inset:0;border:0;background:transparent;color:transparent;cursor:zoom-in;pointer-events:none}.mv-gallery-open:focus-visible{outline:2px solid var(--accent2);outline-offset:-3px}.project-card .card-actions{z-index:6!important;pointer-events:auto!important}.project-card .card-actions button{pointer-events:auto!important}
  .mv-gallery-nav{position:absolute;top:50%;transform:translateY(-50%);width:30px;height:43px;border:1px solid rgba(255,255,255,.2);border-radius:10px;background:rgba(8,10,18,.78);color:#fff;font-size:1.35rem;display:grid;place-items:center;opacity:.15;transition:.14s;cursor:pointer}.live-gallery-slot:hover .mv-gallery-nav,.live-gallery-slot:focus-within .mv-gallery-nav{opacity:.96}.mv-gallery-nav:disabled{opacity:.12;cursor:default}.mv-gallery-prev{left:7px}.mv-gallery-next{right:7px}
  .mv-gallery-badge{position:absolute;left:8px;bottom:7px;border:1px solid rgba(125,227,215,.38);border-radius:999px;background:rgba(8,10,18,.78);color:#9ef4e6;font-size:.64rem;font-weight:850;padding:4px 7px;cursor:pointer}.mv-gallery-badge.loading{color:#ffd98d;border-color:rgba(255,217,141,.38)}
  .mv-media-hover{position:fixed;z-index:140;pointer-events:none;opacity:0;transform:translateY(5px) scale(.98);transition:.11s opacity,.11s transform;padding:7px;border:1px solid rgba(183,162,255,.48);border-radius:15px;background:var(--solid);box-shadow:0 24px 70px rgba(0,0,0,.52);max-width:min(560px,56vw)}.mv-media-hover.show{opacity:1;transform:none}.mv-media-hover img{display:block;max-width:min(540px,54vw);max-height:min(420px,54vh);object-fit:contain;border-radius:10px}.mv-media-hover span{display:block;padding:6px 4px 1px;color:var(--muted);font-size:.7rem;font-weight:750;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .mv-gallery-lightbox{position:fixed;inset:0;z-index:160;background:rgba(2,3,8,.94);display:grid;grid-template-rows:auto minmax(0,1fr) auto;gap:10px;padding:16px;color:#fff}.mv-gallery-lightbox[hidden]{display:none!important}.mv-gallery-head{display:flex;align-items:center;gap:10px;justify-content:space-between;max-width:1500px;width:100%;margin:auto}.mv-gallery-title{min-width:0;display:flex;flex-direction:column}.mv-gallery-title strong{font-size:1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mv-gallery-title small{color:#b7b9d1;margin-top:2px}.mv-gallery-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.mv-gallery-actions button,.mv-gallery-close{border:1px solid rgba(255,255,255,.16);background:rgba(24,27,49,.9);color:#fff;border-radius:10px;padding:8px 10px;cursor:pointer}.mv-gallery-close{width:38px;height:38px;padding:0;font-size:1.35rem}
  .mv-gallery-stage{position:relative;min-height:0;display:grid;place-items:center}.mv-gallery-stage img,.mv-gallery-stage video{max-width:min(1500px,92vw);max-height:calc(100vh - 190px);object-fit:contain;border-radius:15px;box-shadow:0 28px 90px rgba(0,0,0,.62)}.mv-stage-nav{position:absolute;top:50%;transform:translateY(-50%);width:52px;height:72px;border:1px solid rgba(255,255,255,.16);background:rgba(15,17,30,.68);color:#fff;border-radius:14px;font-size:2rem;cursor:pointer}.mv-stage-prev{left:10px}.mv-stage-next{right:10px}.mv-stage-nav:disabled{opacity:.18;cursor:default}
  .mv-gallery-bottom{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;max-width:1500px;width:100%;margin:auto}.mv-gallery-thumbs{display:flex;gap:7px;overflow-x:auto;padding:5px 2px}.mv-gallery-thumb{flex:0 0 auto;width:78px;height:52px;padding:0;border:2px solid transparent;border-radius:9px;background:#111;overflow:hidden;cursor:pointer}.mv-gallery-thumb.active{border-color:#7de3d7}.mv-gallery-thumb img{width:100%;height:100%;object-fit:cover}.mv-gallery-thumb.video-thumb{display:grid;place-items:center;color:#fff;font-size:1.25rem;background:#15182b}.mv-gallery-count{min-width:110px;text-align:right;color:#cfd0df;font-size:.8rem}.mv-gallery-loading{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);padding:7px 10px;border-radius:999px;background:rgba(15,17,30,.85);border:1px solid rgba(255,255,255,.12);font-size:.72rem;color:#ffd98d}
  .media-zoomable{cursor:zoom-in}@media(max-width:720px){.mv-gallery-lightbox{padding:9px}.mv-stage-nav{width:42px;height:58px}.mv-gallery-bottom{grid-template-columns:1fr}.mv-gallery-count{text-align:left}.mv-gallery-stage img{max-height:calc(100vh - 230px)}}`;
  const style=document.createElement('style'); style.textContent=css; document.head.appendChild(style);

  const hover=document.createElement('div'); hover.className='mv-media-hover'; hover.innerHTML='<img alt=""><span></span>'; document.body.appendChild(hover);
  const lightbox=document.createElement('section'); lightbox.className='mv-gallery-lightbox'; lightbox.hidden=true; lightbox.setAttribute('role','dialog'); lightbox.setAttribute('aria-modal','true'); lightbox.innerHTML=`<div class="mv-gallery-head"><div class="mv-gallery-title"><strong id="mvGalleryTitle">Live project gallery</strong><small id="mvGalleryStatus">Live off-site media</small></div><div class="mv-gallery-actions"><button id="mvGalleryHere">Open project here</button><button id="mvGalleryExternal">Open project in your browser ↗</button><button id="mvImageExternal">Open media ↗</button><button id="mvGalleryReload">Refresh live media</button><button id="mvGalleryClose" class="mv-gallery-close" aria-label="Close gallery">×</button></div></div><div class="mv-gallery-stage"><button class="mv-stage-nav mv-stage-prev" id="mvGalleryPrev" aria-label="Previous image">‹</button><img id="mvGalleryImage" alt=""><video id="mvGalleryVideo" controls playsinline preload="metadata" hidden></video><button class="mv-stage-nav mv-stage-next" id="mvGalleryNext" aria-label="Next image">›</button><span id="mvGalleryLoading" class="mv-gallery-loading" hidden>Refreshing live project media…</span></div><div class="mv-gallery-bottom"><div id="mvGalleryThumbs" class="mv-gallery-thumbs"></div><div id="mvGalleryCount" class="mv-gallery-count"></div></div>`;
  document.body.appendChild(lightbox);
  const lb=id=>document.getElementById(id);

  function cleanItem(raw){if(!raw||!isHttp(raw.url))return null;const previewUrl=isHttp(raw.previewUrl)?raw.previewUrl:'',posterUrl=isHttp(raw.posterUrl)?raw.posterUrl:'';const mediaType=String(raw.mediaType||(/\.gif(?:$|[?#])/i.test(raw.url)?'gif':/\.(?:mp4|webm|ogv|mov|m4v|m3u8)(?:$|[?#])/i.test(raw.url)?'video':'image'));return{url:raw.url,previewUrl:previewUrl&&previewUrl!==raw.url?previewUrl:'',posterUrl:posterUrl&&posterUrl!==raw.url?posterUrl:'',mediaType,alt:String(raw.alt||''),width:Number(raw.width)||0,height:Number(raw.height)||0,role:String(raw.role||''),source:String(raw.source||''),provider:String(raw.provider||''),confidence:Number(raw.confidence)||0,identity:Number(raw.identity)||0}}
  function readUrls(node,host){
    const raw=node?.dataset?.projectUrls||host?.dataset?.projectUrls||node?.closest?.('[data-project-urls]')?.dataset?.projectUrls||'';
    let urls=[];try{const parsed=JSON.parse(raw);if(Array.isArray(parsed))urls=parsed.filter(isHttp)}catch{}
    const direct=node?.dataset?.projectUrl||host?.dataset?.projectUrl||host?.querySelector?.('.card-title a[href],.visual-tile-title a[href],a.provider[href],a[href^="http"]')?.href||'';
    if(isHttp(direct)&&!urls.includes(direct))urls.unshift(direct);
    return [...new Set(urls)];
  }
  function infoFor(node){
    const host=node?.closest?.('.project-card,.visual-tile,#projectModal')||node;
    const id=node?.dataset?.projectId||host?.dataset?.id||node?.closest?.('[data-project-id]')?.dataset?.projectId||'detail-'+(document.getElementById('modalTitle')?.textContent||'project');
    const urls=readUrls(node,host),url=urls[0]||'';
    const title=node?.dataset?.projectTitle||host?.dataset?.projectTitle||node?.closest?.('[data-project-title]')?.dataset?.projectTitle||host?.querySelector?.('.card-title a,.visual-tile-title a')?.textContent?.trim()||document.getElementById('modalTitle')?.textContent?.trim()||'Project';
    const author=node?.dataset?.projectAuthor||host?.dataset?.projectAuthor||node?.closest?.('[data-project-author]')?.dataset?.projectAuthor||host?.querySelector?.('.live-author-link,.live-author-name')?.textContent?.trim()||'';
    const authorUrl=host?.dataset?.authorUrl||host?.querySelector?.('.live-author-link')?.href||'';
    return {id,title,author,url,urls,authorUrl};
  }
  function stateFor(info){
    if(!info||!info.id)return null;let s=states.get(info.id);
    if(!s){s={id:info.id,title:info.title,authorName:info.author||'',url:info.url,urls:info.urls||[],authorUrl:info.authorUrl,gallery:[],icon:null,author:null,galleryAbsent:false,sourceGalleryAbsent:false,index:0,loading:false,loadingQuick:false,loadingDeep:false,quickLoaded:false,deepLoaded:false,loaded:false,visible:false,priority:0,primarySlot:null,error:'',cacheAgeMs:null,cacheStale:false,forceRefresh:false,badUrls:new Set(),cachePromise:null};states.set(info.id,s)}
    s.title=info.title||s.title;s.authorName=info.author||s.authorName;s.urls=[...new Set([...(info.urls||[]),...(s.urls||[])].filter(isHttp))];s.url=s.urls[0]||info.url||s.url;s.authorUrl=info.authorUrl||s.authorUrl;return s;
  }
  function mergeMedia(s,media){
    if(!s||!media)return;
    const seen=new Set((s.gallery||[]).map(x=>x.url));const gallery=[...(s.gallery||[])];for(const x of media.gallery||media.images||[]){const c=cleanItem(x);if(c&&!s.badUrls.has(c.url)&&!seen.has(c.url)){seen.add(c.url);gallery.push(c)}}
    const icon=cleanItem(media.icon);const author=cleanItem(media.author);
    s.gallery=gallery.sort((a,b)=>(b.confidence||0)-(a.confidence||0)||(b.identity||0)-(a.identity||0));if(icon&&!s.badUrls.has(icon.url)&&(!s.icon||(icon.confidence||0)>(s.icon.confidence||0)))s.icon=icon;if(author&&!s.badUrls.has(author.url)&&(!s.author||(author.confidence||0)>(s.author.confidence||0)))s.author=author;
    // Renderer repeats the semantic-role quarantine so a stale IPC/cache payload cannot
    // repaint an avatar as gallery art or a project icon as an author portrait.
    if(s.icon&&s.author&&s.icon.url===s.author.url){const aExact=/(?:author|profile|creator|member)/i.test(`${s.author.source||''} ${s.author.alt||''}`),iExact=/(?:project|icon|logo)/i.test(`${s.icon.source||''} ${s.icon.alt||''}`);if(aExact&&!iExact)s.icon=null;else if(iExact&&!aExact)s.author=null;else if((s.author.confidence||0)>(s.icon.confidence||0))s.icon=null;else s.author=null;}
    const reserved=new Set([s.icon?.url,s.author?.url].filter(Boolean));s.gallery=s.gallery.filter(x=>!reserved.has(x.url));if(isHttp(media.authorUrl))s.authorUrl=media.authorUrl;if(media.sourceGalleryAbsent===true&&!s.gallery.length)s.sourceGalleryAbsent=true;if(media.galleryAbsent===true&&!s.gallery.length)s.galleryAbsent=true;if(s.gallery.length){s.galleryAbsent=false;s.sourceGalleryAbsent=false;}
    if(isHttp(media.resolvedProjectUrl)&&Number(media.resolutionConfidence||0)>=88){s.resolvedProjectUrl=media.resolvedProjectUrl;s.url=media.resolvedProjectUrl;if(!s.urls.includes(media.resolvedProjectUrl))s.urls.unshift(media.resolvedProjectUrl)}
    s.cacheAgeMs=Number.isFinite(Number(media.cacheAgeMs))?Number(media.cacheAgeMs):s.cacheAgeMs;if(media.cacheHit)s.cacheStale=s.cacheStale||!!media.stale;else if(media.discoveredAt)s.cacheStale=false;if(media.error)s.error=String(media.error||'');
  }
  const decodeWarm=new Map();
  function predecode(url,priority){
    if(!isHttp(url)||Number(priority||0)<250000)return;const now=Date.now(),old=decodeWarm.get(url);if(old&&now-old.at<30000)return;
    try{const warm=new Image();warm.decoding='async';warm.loading='eager';warm.fetchPriority=Number(priority)>=750000?'high':'auto';warm.src=url;const promise=typeof warm.decode==='function'?warm.decode().catch(()=>{}):Promise.resolve();decodeWarm.set(url,{at:now,warm,promise});setTimeout(()=>{const row=decodeWarm.get(url);if(row&&row.warm===warm)decodeWarm.delete(url)},30000)}catch{}
  }
  function preconnect(url){try{const u=new URL(url),origin=u.origin;if(preconnectedOrigins.has(origin))return;preconnectedOrigins.add(origin);const dns=document.createElement('link');dns.rel='dns-prefetch';dns.href=`//${u.host}`;document.head.appendChild(dns);const link=document.createElement('link');link.rel='preconnect';link.href=origin;document.head.appendChild(link)}catch{}}
  // Start TLS/DNS while catalog data is painting, before discovery even knows the exact
  // image path. These are only connection hints; every displayed byte still comes live
  // from the real provider/CDN and no image is bundled or substituted.
  ['https://media.forgecdn.net/','https://edge.forgecdn.net/','https://static.planetminecraft.com/','https://cdn.modrinth.com/','https://avatars.githubusercontent.com/','https://opengraph.githubassets.com/','https://gitlab.com/','https://hangar.papermc.io/','https://api.spiget.org/','https://www.spigotmc.org/','https://dev.bukkit.org/','https://builtbybit.com/','https://www.nexusmods.com/','https://staticdelivery.nexusmods.com/','https://www.moddb.com/','https://media.moddb.com/','https://polymart.org/','https://r2.mcpedl.com/','https://modbay.org/','https://pic1.afdiancdn.com/','https://c10.patreonusercontent.com/','https://www.minecraft.net/','https://store-images.s-microsoft.com/','https://booth.pximg.net/','https://imgproxy.fourthwall.dev/','https://storage.ko-fi.com/','https://img.itch.zone/'].forEach(preconnect);
  function setImage(slot,item,label,s){
    if(!slot)return;const img=slot.querySelector('.live-media-image')||slot.matches('img')&&slot;const loading=slot.querySelector?.('.live-media-loading');
    if(!img)return;
    const oldVideo=slot.querySelector?.('.live-media-video');
    if(!item?.url){img.hidden=true;if(oldVideo){oldVideo.pause?.();oldVideo.hidden=true}if(loading){const curseForgePending=slot?.dataset?.liveMediaRole==='gallery'&&!s?.deepLoaded&&!s?.galleryAbsent&&!s?.sourceGalleryAbsent&&(s?.urls||[]).some(u=>/curseforge\.com/i.test(String(u||'')));loading.hidden=false;loading.textContent=(slot?.dataset?.liveMediaRole==='gallery'&&s?.galleryAbsent)?'Live source has no gallery':(slot?.dataset?.liveMediaRole==='gallery'&&s?.sourceGalleryAbsent)?'Gallery tab empty — checking project post…':curseForgePending?'Checking exact CurseForge gallery…':s?.loaded?'Live source did not expose this media yet':'Loading live media…'}return}
    const isVideo=item.mediaType==='video';
    if(isVideo){
      img.hidden=true;let video=oldVideo;
      if(!video){video=document.createElement('video');video.className='live-media-video';video.muted=true;video.playsInline=true;video.preload='metadata';video.controls=false;slot.appendChild(video)}
      const poster=isHttp(item.posterUrl)?item.posterUrl:isHttp(item.previewUrl)?item.previewUrl:'';if(poster){preconnect(poster);video.poster=poster}
      if(video.dataset.liveSrc!==item.url){preconnect(item.url);video.hidden=true;video.dataset.liveSrc=item.url;video.setAttribute('aria-label',item.alt||label||'Live project video');video.onloadedmetadata=()=>{video.hidden=false;if(loading)loading.hidden=true};video.onerror=()=>{video.hidden=true;if(s){s.badUrls.add(item.url);s.gallery=s.gallery.filter(x=>x.url!==item.url)}if(loading){loading.hidden=false;loading.textContent='Refreshing from another live source…'};if(s&&!s.forceRefresh){s.forceRefresh=true;enqueue(s,true,true,true)}};video.src=item.url;video.load()}else if(video.readyState>=1){video.hidden=false;if(loading)loading.hidden=true}
      return;
    }
    if(oldVideo){oldVideo.pause?.();oldVideo.hidden=true}
    const original=item.url,display=isHttp(item.previewUrl)?item.previewUrl:original;
    const priority=s?(Number(s.priority)||statePriority(s)):0,aboveFold=priority>=750_000,nearViewport=priority>0;
    if(img.dataset.liveSrc!==display){preconnect(display);preconnect(original);predecode(display,priority);img.hidden=true;img.decoding='async';img.loading=priority>1?'eager':'lazy';img.fetchPriority=aboveFold?'high':nearViewport?'auto':'low';img.dataset.liveSrc=display;img.dataset.liveOriginal=original;img.alt=item.alt||label||'';img.onload=()=>{img.hidden=false;if(loading)loading.hidden=true;img.classList.add('media-zoomable')};img.onerror=()=>{if(display!==original){item.previewUrl='';img.dataset.liveSrc='';setImage(slot,item,label,s);return}img.hidden=true;if(s){s.badUrls.add(original);s.gallery=s.gallery.filter(x=>x.url!==original);if(s.icon?.url===original)s.icon=null;if(s.author?.url===original)s.author=null;}if(loading){loading.hidden=false;loading.textContent='Refreshing from another live source…'};if(s&&!s.forceRefresh){s.forceRefresh=true;enqueue(s,true,true,true)}};img.src=display}else if(img.complete&&img.naturalWidth){img.hidden=false;if(loading)loading.hidden=true}
  }

  function applyState(s){
    if(!s)return;
    const nodes=[...document.querySelectorAll(`[data-project-id="${CSS.escape(s.id)}"][data-live-media-role]`)];
    const galleryItem=s.gallery[s.index]||s.gallery[0]||null;
    for(const slot of nodes){const role=slot.dataset.liveMediaRole;if(role==='gallery')setImage(slot,galleryItem,`${s.title} live project image`,s);else if(role==='icon')setImage(slot,s.icon,`${s.title} live project icon`,s);else if(role==='author')setImage(slot,s.author,`${s.title} creator avatar`,s)}
    document.querySelectorAll(`[data-id="${CSS.escape(s.id)}"] .live-author-link`).forEach(a=>{if(isHttp(s.authorUrl))a.href=s.authorUrl});
    document.querySelectorAll(`[data-id="${CSS.escape(s.id)}"] .live-gallery-slot`).forEach(root=>{const badge=root.querySelector('.mv-gallery-badge');if(badge){const curseForgePending=!s.deepLoaded&&!s.galleryAbsent&&!s.sourceGalleryAbsent&&!s.gallery.length&&(s.urls||[]).some(u=>/curseforge\.com/i.test(String(u||'')));badge.classList.toggle('loading',s.loading||curseForgePending);badge.textContent=s.galleryAbsent&&!s.gallery.length?'∅ No source gallery':s.sourceGalleryAbsent&&!s.gallery.length?'◌ Checking project post':curseForgePending?'◌ Checking gallery':s.loading?'◌ Refreshing':s.gallery.length>1?`▣ ${s.index+1} / ${s.gallery.length}`:'▣ Live source';}root.querySelectorAll('.mv-gallery-nav').forEach(b=>b.disabled=s.loading||s.gallery.length<2)});
    if(current===s)renderLightbox();
  }
  async function flushCachedBatch(){
    cacheBatchScheduled=false;const jobs=[...cacheBatchPending.values()];cacheBatchPending.clear();if(!jobs.length)return;
    const finish=job=>{const s=job.s;if((s.gallery.length||s.icon||s.galleryAbsent)&&!s.cacheStale)s.quickLoaded=true;if((s.gallery.length>=2||s.galleryAbsent)&&s.icon&&s.author&&!s.cacheStale)s.deepLoaded=true;applyState(s);job.resolve(s)};
    if(typeof window.mobCompanion?.cachedMediaBatch==='function'){
      const requests=[],owners=new Map();for(const job of jobs){const s=job.s,context={projectId:s.id,title:s.title,author:s.authorName,authorUrl:s.authorUrl,primaryUrl:s.url};for(const url of (s.urls||[]).filter(isHttp)){const key=`${s.id}␟${url}`;owners.set(key,s);requests.push({key,url,context})}}
      try{const rows=await window.mobCompanion.cachedMediaBatch(requests);for(const row of rows||[]){const owner=owners.get(row?.key);if(owner&&row?.media){mergeMedia(owner,row.media);applyState(owner)}}}catch{}
      jobs.forEach(finish);return;
    }
    await Promise.all(jobs.map(async job=>{const s=job.s,context={projectId:s.id,title:s.title,author:s.authorName,authorUrl:s.authorUrl,primaryUrl:s.url};await Promise.allSettled((s.urls||[]).filter(isHttp).map(async url=>{const media=await window.mobCompanion.cachedMedia(url,context);if(media){mergeMedia(s,media);applyState(s)}}));finish(job)}));
  }
  async function loadCached(s){
    if(!s||!window.mobCompanion?.cachedMedia)return s;if(s.cachePromise)return s.cachePromise;
    s.cachePromise=new Promise(resolve=>{cacheBatchPending.set(s.id,{s,resolve});if(!cacheBatchScheduled){cacheBatchScheduled=true;queueMicrotask(flushCachedBatch)}});return s.cachePromise;
  }
  function statePriority(s){
    let node=s?.primarySlot;
    if(!node?.isConnected){node=document.querySelector(`[data-project-id="${CSS.escape(s.id)}"][data-live-media-role="gallery"]`)||document.querySelector(`[data-project-id="${CSS.escape(s.id)}"]`)||document.querySelector(`[data-id="${CSS.escape(s.id)}"]`);if(s)s.primarySlot=node||null}
    if(!node)return 0;const r=node.getBoundingClientRect(),vh=window.innerHeight||900;let priority;
    if(r.bottom>=0&&r.top<=vh)priority=1_000_000-Math.max(0,r.top);
    else{const distance=r.top>vh?r.top-vh:-r.bottom;priority=Math.max(1,250_000-Math.max(0,distance))}
    if(s)s.priority=priority;return priority;
  }
  async function primeAll(){
    primeScheduled=false;if(!primeAvailable())return false;
    const all=[...states.values()].filter(s=>(s.urls||[]).some(isHttp));
    // Critical-path rule: cache lookup and live discovery begin in the same turn. 2.6
    // waited for the *entire* catalog cache IPC batch before the first network request,
    // which could turn a fast provider response into a visible startup stall. Cached
    // source-grounded media can still win the paint race, but it no longer gates live I/O.
    const cacheSettled=Promise.allSettled(all.map(loadCached));
    const requests=[];
    for(const s of all){
      // A cached icon/author pair is not a completed project-media result. Older
      // builds treated it as sufficient and skipped prime entirely, which could pin a
      // CurseForge card in a permanent gallery-less state after one failed run. Only a
      // real gallery (or an explicit terminal galleryAbsent) may suppress live prime.
      if((s.gallery.length||s.galleryAbsent)&&s.quickLoaded&&!s.cacheStale&&(s.author||!s.authorName))continue;
      // 2.5 primes every canonical source home in parallel. Redundant transports now
      // self-cancel after first trusted media, so there is no need to drop a Patreon,
      // Afdian, Marketplace, PMC, Bedrock or other provider merely to protect bandwidth.
      const urls=quickUrlsFor(s);
      if(!urls.length)continue;
      const priority=statePriority(s);s.loadingQuick=true;s.loading=true;applyState(s);
      requests.push({key:s.id,urls,priority,context:{projectId:s.id,title:s.title,author:s.authorName,authorUrl:s.authorUrl,primaryUrl:s.url}});
    }
    if(requests.length){
      // Ship one already-prioritized frontier batch. Main receives the complete batch before
      // starting work, so a late visible card can never be trapped behind earlier off-screen
      // rows simply because it was registered later.
      requests.sort((a,b)=>(Number(b.priority)||0)-(Number(a.priority)||0));
      for(const req of requests)primePendingIds.add(req.key);
      window.mobCompanion.primeMedia(requests);
    }
    // Let cache hydration finish independently; mergeMedia is monotonic and role-bound,
    // so whichever source-grounded result arrives first paints first without blocking the other.
    cacheSettled.catch(()=>{});
    return true;
  }
  function schedulePrime(){if(!primeAvailable()||primeScheduled)return;primeScheduled=true;queueMicrotask(primeAll)}
  function onPrimeResult(payload){
    const s=states.get(String(payload?.key||''));if(!s)return;
    if(payload?.media){mergeMedia(s,payload.media);applyState(s)}
    if(payload?.done){primePendingIds.delete(s.id);s.loadingQuick=false;s.loading=s.loadingDeep;s.quickLoaded=true;s.loaded=true;if(payload?.error&&!s.gallery.length&&!s.icon&&!s.author)s.error=String(payload.error);applyState(s);if(s.visible&&(s.cacheStale||!s.author||(!s.galleryAbsent&&s.gallery.length<2)))scheduleRichDeep(s,!s.galleryAbsent&&!s.gallery.length&&!s.icon)}
  }
  function scheduleRichDeep(s,urgent=false){
    if(!s||s.deepLoaded||s.loadingDeep)return;
    const old=deepTimers.get(s.id);if(old)clearTimeout(old);
    // Empty visible cards get the browser fallback quickly. Once a correct live image is
    // already painted, rich gallery/avatar enrichment yields to the first-image frontier.
    const frontier=primePendingIds.size+quickQueue.length;
    const delay=urgent?40:Math.max(700,Math.min(3600,520+frontier*10));
    const timer=setTimeout(()=>{deepTimers.delete(s.id);if(!s.deepLoaded&&!s.loadingDeep&&(urgent||s.visible||current===s))enqueue(s,false,urgent,true)},delay);
    deepTimers.set(s.id,timer);
  }
  function enqueue(s,force=false,front=false,deep=false){
    if(!s||(s.urls||[]).every(u=>!isHttp(u)))return;
    if(force)s.forceRefresh=true;
    if(!force&&((deep&&s.deepLoaded)||(!deep&&s.quickLoaded)))return;
    const key=`${s.id}:${deep?'deep':'quick'}:${force?'force':'normal'}`;if(queued.has(key))return;
    queued.add(key);const job={s,force,deep,key};const q=deep?deepQueue:quickQueue;front?q.unshift(job):q.push(job);pump();
  }
  function pump(){
    // Never let Chromium-rich work jump ahead of missing first images. Quick HTTP/API
    // work is cheap and paints cards; deep work enriches only after quick pressure falls.
    while(activeQuickJobs<MAX_QUICK_JOBS&&quickQueue.length){const job=quickQueue.shift();queued.delete(job.key);activeQuickJobs++;discover(job.s,job.force,false).finally(()=>{activeQuickJobs--;pump()})}
    if(!quickQueue.length){while(activeDeepJobs<MAX_DEEP_JOBS&&deepQueue.length){const job=deepQueue.shift();queued.delete(job.key);activeDeepJobs++;discover(job.s,job.force,true).finally(()=>{activeDeepJobs--;pump()})}}
  }
  async function discover(s,force=false,deep=false){
    if(!s||!window.mobCompanion?.discoverMedia)return s;
    if(!force&&((deep&&s.deepLoaded)||(!deep&&s.quickLoaded)))return s;
    if(deep)s.loadingDeep=true;else s.loadingQuick=true;s.loading=s.loadingQuick||s.loadingDeep;s.error='';applyState(s);const errors=[];
    try{
      const urls=deep?(s.urls||[]).filter(isHttp):quickUrlsFor(s),context={projectId:s.id,title:s.title,author:s.authorName,authorUrl:s.authorUrl,primaryUrl:s.url};
      // Progressive hedged discovery: every exact provider source may run concurrently,
      // but the first useful result paints immediately instead of waiting for the
      // slowest/blocked alternate URL to settle.
      await Promise.allSettled(urls.map(async url=>{try{const media=await window.mobCompanion.discoverMedia(url,!!force,!!deep,context);if(media){mergeMedia(s,media);applyState(s)}return media}catch(err){errors.push(String(err?.message||err));throw err}}));
      if(deep)s.deepLoaded=true;else s.quickLoaded=true;s.loaded=s.quickLoaded||s.deepLoaded;s.forceRefresh=false;if(!s.gallery.length&&!s.icon&&!s.author&&errors.length)s.error=errors[0];
    } finally {
      if(deep)s.loadingDeep=false;else s.loadingQuick=false;s.loading=s.loadingQuick||s.loadingDeep;applyState(s);
      if(!deep&&s.visible&&(s.cacheStale||!s.author||(!s.galleryAbsent&&s.gallery.length<2)))scheduleRichDeep(s,!s.galleryAbsent&&!s.gallery.length&&!s.icon);
    }
    return s;
  }
  function step(s,dir){if(!s)return;if(!s.gallery.length){enqueue(s,false,true,true);return}s.index=(s.index+dir+s.gallery.length)%s.gallery.length;applyState(s)}
  function ensureGalleryUI(root){if(root.dataset.mvGalleryUpgraded)return;root.dataset.mvGalleryUpgraded='1';const ui=document.createElement('div');ui.className='mv-gallery-ui';ui.innerHTML='<button class="mv-gallery-open" data-mv-gallery-open aria-label="Open full live project gallery">Open gallery</button><button class="mv-gallery-nav mv-gallery-prev" data-mv-gallery-step="-1" aria-label="Previous live image">‹</button><button class="mv-gallery-nav mv-gallery-next" data-mv-gallery-step="1" aria-label="Next live image">›</button><button class="mv-gallery-badge" data-mv-gallery-open>▣ Live source</button>';root.appendChild(ui)}
  function upgradeAll(scope=document){
    const liveBridge=typeof window.mobCompanion?.discoverMedia==='function';
    scope.querySelectorAll?.('[data-live-media-role]').forEach(slot=>{const s=stateFor(infoFor(slot));if(!s)return;if(slot.dataset.liveMediaRole==='gallery'||!s.primarySlot)s.primarySlot=slot;const loading=slot.querySelector?.('.live-media-loading');if(!liveBridge){if(loading){loading.hidden=false;loading.textContent=slot.dataset.liveMediaRole==='gallery'?'Open in the desktop companion for live source media':'Live media';}return}if(slot.dataset.liveMediaRole==='gallery')ensureGalleryUI(slot);const img=slot.querySelector?.('.live-media-image');if(img)img.classList.add('media-zoomable');loadCached(s);visibilityObserver?.observe(slot)});
    schedulePrime();
  }
  function renderLightbox(){
    const s=current;if(!s)return;const item=s.gallery[s.index]||s.gallery[0]||null,isVideo=item?.mediaType==='video';
    lb('mvGalleryTitle').textContent=s.title;lb('mvGalleryStatus').textContent=s.loading?'Refreshing from the live project page…':s.error&&!item?`Live source did not expose media: ${s.error}`:s.cacheAgeMs!==null?`Live off-site media · discovery metadata cached ${Math.max(0,Math.round(s.cacheAgeMs/60000))} min ago`:'Live off-site media from the project source';lb('mvGalleryLoading').hidden=!s.loading;
    const image=lb('mvGalleryImage'),video=lb('mvGalleryVideo');
    if(isVideo){image.hidden=true;image.src='';video.hidden=false;video.poster=item?.posterUrl||item?.previewUrl||'';if(video.src!==item?.url)video.src=item?.url||'';video.setAttribute('aria-label',item?.alt||`${s.title} video`)}else{if(!video.hidden){video.pause();video.hidden=true}video.removeAttribute('src');image.hidden=false;image.src=item?.url||'';image.fetchPriority='high';image.alt=item?.alt||s.title}
    lb('mvGalleryPrev').disabled=s.gallery.length<2||s.loading;lb('mvGalleryNext').disabled=s.gallery.length<2||s.loading;lb('mvGalleryCount').textContent=s.gallery.length?`${s.index+1} / ${s.gallery.length} · live${isVideo?' video':''}`:(s.galleryAbsent?'Source reports no gallery':s.sourceGalleryAbsent?'Gallery tab empty · checking project post':(item?'1 / 1 · live':'No live media'));
    const thumbs=lb('mvGalleryThumbs');thumbs.innerHTML='';s.gallery.forEach((x,i)=>{const b=document.createElement('button');b.className='mv-gallery-thumb'+(i===s.index?' active':'')+(x.mediaType==='video'?' video-thumb':'');b.dataset.index=i;const thumb=x.posterUrl||x.previewUrl||(x.mediaType==='video'?'':x.url);if(thumb){const im=document.createElement('img');im.loading='lazy';im.decoding='async';im.src=thumb;im.alt=x.alt||`${s.title} live media ${i+1}`;b.appendChild(im)}else if(x.mediaType==='video')b.textContent='▶';b.title=x.mediaType==='video'?'Video':'Image';thumbs.appendChild(b)});
  }

  function openGallery(root){const s=stateFor(infoFor(root));if(!s)return;current=s;lightbox.hidden=false;document.body.style.overflow='hidden';renderLightbox();enqueue(s,false,true,true)}
  function closeGallery(){try{lb('mvGalleryVideo')?.pause?.()}catch{}lightbox.hidden=true;current=null;document.body.style.overflow=''}

  document.addEventListener('click',e=>{const stepBtn=e.target.closest?.('[data-mv-gallery-step]');if(stepBtn){e.preventDefault();e.stopImmediatePropagation();const root=stepBtn.closest('.live-gallery-slot');step(stateFor(infoFor(root)),Number(stepBtn.dataset.mvGalleryStep)||1);return}const open=e.target.closest?.('[data-mv-gallery-open]');if(open){e.preventDefault();e.stopImmediatePropagation();openGallery(open.closest('.live-gallery-slot'));return}const root=e.target.closest?.('.live-gallery-slot');if(root&&!e.target.closest?.('button,a,input,select,textarea,[role="button"],.card-actions,[data-action]')){e.preventDefault();e.stopImmediatePropagation();openGallery(root)}},true);
  document.addEventListener('pointerover',e=>{const img=e.target.closest?.('.live-media-image.media-zoomable');if(!img||img.hidden||!isHttp(img.src))return;clearTimeout(hoverTimer);hoverTimer=setTimeout(()=>{hover.querySelector('img').src=img.dataset.liveOriginal||img.src;hover.querySelector('span').textContent=img.alt||'Live source image';hover.classList.add('show')},75)},true);
  document.addEventListener('pointermove',e=>{if(!hover.classList.contains('show'))return;const pad=18,w=Math.min(560,window.innerWidth*.56),h=Math.min(440,window.innerHeight*.56);let x=e.clientX+18,y=e.clientY+18;if(x+w>window.innerWidth-pad)x=e.clientX-w-18;if(y+h>window.innerHeight-pad)y=e.clientY-h-18;hover.style.left=`${Math.max(pad,x)}px`;hover.style.top=`${Math.max(pad,y)}px`},true);
  document.addEventListener('pointerout',e=>{if(e.target.closest?.('.live-media-image')){clearTimeout(hoverTimer);hover.classList.remove('show')}},true);
  document.addEventListener('pointerenter',e=>{const root=e.target.closest?.('[data-live-media-role]');if(root){const s=stateFor(infoFor(root));if(s){s.visible=true;quickUrlsFor(s).forEach(preconnect);window.mobCompanion?.reprioritizeMedia?.(s.id,1_500_000);loadCached(s).finally(()=>enqueue(s,false,true,true))}}},true);

  lb('mvGalleryClose').onclick=closeGallery;lb('mvGalleryPrev').onclick=()=>step(current,-1);lb('mvGalleryNext').onclick=()=>step(current,1);lb('mvGalleryThumbs').onclick=e=>{const b=e.target.closest('.mv-gallery-thumb');if(!b||!current)return;current.index=Number(b.dataset.index)||0;applyState(current)};lb('mvGalleryHere').onclick=()=>{if(current?.url)window.mobCompanion?.openHere?.(current.url)};lb('mvGalleryExternal').onclick=()=>{if(current?.url)window.mobCompanion?.openExternal?.(current.url)};lb('mvImageExternal').onclick=()=>{const u=current?.gallery[current.index]?.url||current?.icon?.url;if(isHttp(u))window.mobCompanion?.openExternal?.(u)};lb('mvGalleryReload').onclick=()=>{if(current)enqueue(current,true,true,true)};lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeGallery()});document.addEventListener('keydown',e=>{if(lightbox.hidden)return;if(e.key==='Escape'){e.preventDefault();closeGallery()}else if(e.key==='ArrowLeft'){e.preventDefault();step(current,-1)}else if(e.key==='ArrowRight'){e.preventDefault();step(current,1)}},true);

  visibilityObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;const s=stateFor(infoFor(entry.target));if(!s)continue;s.visible=true;const priority=statePriority(s);quickUrlsFor(s).forEach(preconnect);window.mobCompanion?.reprioritizeMedia?.(s.id,Math.max(1_250_000,priority));loadCached(s).finally(()=>{if(!primeAvailable()){enqueue(s,false,true,false);if(!s.galleryAbsent&&!s.gallery.length&&!s.icon)scheduleRichDeep(s,true)}})}},{rootMargin:'2600px 0px',threshold:.01});
  if(primeAvailable())primeUnsubscribe=window.mobCompanion.onMedia(onPrimeResult);
  const observer=new MutationObserver(records=>{let changed=false;for(const r of records)for(const n of r.addedNodes)if(n.nodeType===1){upgradeAll(n);changed=true}if(changed)schedulePrime()});observer.observe(document.body,{childList:true,subtree:true});upgradeAll();
  function backgroundWarm(){if(primeAvailable()){schedulePrime();return}const pending=[...states.values()].filter(s=>!s.quickLoaded&&!s.loadingQuick);const wave=pending.slice(0,Math.max(24,MAX_QUICK_JOBS));wave.forEach(s=>loadCached(s).finally(()=>enqueue(s,false,false,false)));if(pending.length>wave.length)setTimeout(backgroundWarm,90)}
  // Do not add an artificial 90 ms floor before live discovery. States already exist after
  // upgradeAll(), so start prime/cache work at the next microtask while first paint continues.
  queueMicrotask(backgroundWarm);
  window.addEventListener('beforeunload',()=>{try{primeUnsubscribe?.()}catch{}},{once:true});
  window.__mobGalleryEnhancerTest=()=>({passed:!!document.querySelector('.mv-gallery-lightbox')&&!!document.querySelector('.mv-media-hover')&&document.querySelectorAll('[data-live-media-role="gallery"]').length>0,liveSlots:document.querySelectorAll('[data-live-media-role]').length,authorSlots:document.querySelectorAll('[data-live-media-role="author"]').length,liveDiscoveryAvailable:typeof window.mobCompanion?.discoverMedia==='function',cacheBatchAvailable:typeof window.mobCompanion?.cachedMediaBatch==='function',primePipelineAvailable:primeAvailable(),quickConcurrency:MAX_QUICK_JOBS,deepConcurrency:MAX_DEEP_JOBS,embeddedDataImages:[...document.images].filter(img=>String(img.src||'').startsWith('data:')).length});
})();
