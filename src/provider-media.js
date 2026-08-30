'use strict';

const {providerForUrl,isTrustedMediaUrl}=require('./provider-fastlane');
const {exactProjectIdentityFloor,authorPathMatch,authorLinkBonus,postMediaBonus,avatarBonus,mediaKind,providerFullAndPreview,VIDEO_EXT}=require('./site-adapters');

function decodeHtml(value='') {
  return String(value)
    .replace(/\\u0026/gi,'&').replace(/\\u003d/gi,'=').replace(/\\u002f/gi,'/')
    .replace(/\\\//g,'/')
    .replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&#x27;/gi,"'")
    .replace(/&#x2f;/gi,'/').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>');
}
function stripTags(value='') { return decodeHtml(String(value).replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim(); }
function normalizeIdentity(value='') {
  return stripTags(value).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
    .replace(/\bminecraft\b/g,' ').replace(/\b(?:mod|mods|addon|add-on|texture pack|resource pack|data pack|datapack|modpack|plugin|model|models)\b/g,' ')
    .replace(/\b(?:java|bedrock|edition|forge|fabric|neoforge|optifine)\b/g,' ')
    .replace(/\bv?\d+(?:\.\d+){0,3}\b/g,' ')
    .replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
}
function identityTokens(value='') { return new Set(normalizeIdentity(value).split(' ').filter(x=>x.length>1)); }
function titleSimilarity(expected='', actual='') {
  const a=normalizeIdentity(expected), b=normalizeIdentity(actual);
  if(!a||!b)return 0;
  if(a===b)return 1;
  if(a.length>=5 && (a.includes(b)||b.includes(a)))return .94;
  const A=identityTokens(a), B=identityTokens(b); if(!A.size||!B.size)return 0;
  let common=0; for(const t of A)if(B.has(t))common++;
  const j=common/new Set([...A,...B]).size;
  const containment=common/Math.max(1,Math.min(A.size,B.size));
  return Math.max(0,Math.min(1,j*.58+containment*.42));
}
function slugSimilarity(expected='', rawUrl='') {
  try {
    const u=new URL(rawUrl); const parts=u.pathname.split('/').filter(Boolean); let slug=parts.pop()||'';
    if(/^\d+$/.test(slug)&&parts.length)slug=parts.pop()||slug;
    slug=decodeURIComponent(slug).replace(/[-_]+/g,' '); return titleSimilarity(expected,slug);
  } catch { return 0; }
}
function canonicalUrl(raw='') {
  try{const u=new URL(raw);u.hash='';u.search='';let s=u.toString();return s.endsWith('/')?s:s+'/'}catch{return String(raw||'')}
}
function metaValue(html,key) {
  const escaped=String(key).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  for(const re of [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`,'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`,'i')
  ]){const m=re.exec(html);if(m?.[1])return decodeHtml(m[1])}
  return '';
}
function attrValue(tag,name) {
  const re=new RegExp(`\\b${String(name).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\s*=\\s*["']([^"']*)["']`,'i');
  return decodeHtml(re.exec(String(tag||''))?.[1]||'');
}
function htmlTitle(html='') {
  const h1=/<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1];
  if(h1)return stripTags(h1);
  const og=metaValue(html,'og:title')||metaValue(html,'twitter:title');if(og)return stripTags(og);
  return stripTags(/<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]||'');
}
function absolute(raw,base) { const value=String(raw??'').trim();if(!value)return '';try{const u=new URL(decodeHtml(value),base);return /^https?:$/.test(u.protocol)?u.toString():''}catch{return ''} }
function contextFingerprint(context={}) { return normalizeIdentity([context.projectId,context.title,context.author,context.authorUrl].filter(Boolean).join('|')); }
function pageIdentityConfidence({ expectedTitle='', actualTitle='', sourceUrl='' }={}) {
  if(!expectedTitle)return 62;
  const t=titleSimilarity(expectedTitle,actualTitle), s=slugSimilarity(expectedTitle,sourceUrl);
  const provider=providerForUrl(sourceUrl), floor=exactProjectIdentityFloor(provider,sourceUrl)/100;
  return Math.round(Math.max(t,s,floor)*100);
}
function mediaItem(url,{previewUrl='',posterUrl='',alt='',width=0,height=0,role='gallery',source='provider',provider='generic',confidence=60,identity=60,mediaType=''}={}) {
  const kind=mediaType||mediaKind(url);
  return {url,previewUrl:previewUrl&&previewUrl!==url?previewUrl:'',posterUrl:posterUrl&&posterUrl!==url?posterUrl:'',alt,width:Number(width)||0,height:Number(height)||0,role,mediaType:kind,source,provider,confidence:Math.round(confidence),identity:Math.round(identity)};
}
function linkedImageSeed(fragment='', sourceUrl='', provider='generic', identity=0, expected='') {
  const tags=[...String(fragment||'').matchAll(/<img\b[^>]*>/ig)].map(x=>x[0]), candidates=[];
  for(const tag of tags){
    const alt=attrValue(tag,'alt')||attrValue(tag,'title'), hay=`${tag} ${alt}`;
    if(/(?:avatar|profile|member|author|emoji|badge|favicon|site-logo|brand-logo|advert|sponsor|tracking|pixel)/i.test(hay))continue;
    const declaredW=Number(attrValue(tag,'width'))||0, declaredH=Number(attrValue(tag,'height'))||0, variants=[];
    const push=(raw,width=0,priority=0)=>{const url=absolute(raw,sourceUrl);if(url&&providerImageAllowed(provider,url))variants.push({url,width:Number(width)||0,priority})};
    push(attrValue(tag,'data-original'),declaredW,50);push(attrValue(tag,'data-lazy-src'),declaredW,40);push(attrValue(tag,'data-src'),declaredW,30);push(attrValue(tag,'src'),declaredW,20);
    const srcset=attrValue(tag,'srcset')||attrValue(tag,'data-srcset');if(srcset)for(const bit of srcset.split(',')){const parts=bit.trim().split(/\s+/),desc=parts[1]||'';let width=0;if(/\d+w$/i.test(desc))width=parseInt(desc,10)||0;else if(/[\d.]+x$/i.test(desc))width=Math.round((parseFloat(desc)||1)*Math.max(1,declaredW||600));push(parts[0],width,35)}
    if(!variants.length)continue;const uniq=[...new Map(variants.map(v=>[v.url,v])).values()], sized=uniq.filter(v=>v.width>0).sort((a,b)=>b.width-a.width);let full=[...uniq].sort((a,b)=>(b.priority-a.priority)||((b.width||0)-(a.width||0)))[0];if(sized[0]&&sized[0].width>(full.width||0))full=sized[0];
    const previewCandidates=uniq.filter(v=>v.width>=240).sort((a,b)=>Math.abs(a.width-640)-Math.abs(b.width-640)), preview=(previewCandidates[0]||uniq.find(v=>v.url!==full.url&&v.width>0)||uniq.find(v=>v.url!==full.url))?.url||'';
    const altSim=titleSimilarity(expected,alt);let confidence=74+Math.round(Number(identity||0)*.16);if(altSim>=.9)confidence+=10;else if(altSim>=.6)confidence+=5;
    const role=/(?:project|resource|mod)[ _-]?(?:icon|logo)|\blogo\b|\/data\/resource_icons\//i.test(`${hay} ${full.url}`)?'icon':'gallery';
    candidates.push(mediaItem(full.url,{previewUrl:preview,alt:alt||expected||'official project preview',width:full.width||declaredW,height:declaredH,role,source:`${provider}-exact-child-link-preview`,provider,confidence:Math.min(98,confidence),identity}));
  }
  return uniqueItems(candidates)[0]||null;
}
function canonicalMediaKey(raw='') {
  try {
    const u=new URL(raw);u.hash='';
    // Query strings on image CDNs are usually resize/cache transforms of the same asset.
    if(/(?:planetminecraft|mcpedl|fourthwall|pximg|forgecdn|modbay|afdian|patreon|ko-fi|itch|gumroad|minecraft|xbox|githubusercontent|gitlab|hangar|spigot|bukkit|builtbybit|nexusmods|moddb|polymart)/i.test(u.hostname))u.search='';
    return u.toString();
  } catch { return String(raw||''); }
}
function uniqueItems(items=[]) {
  const best=new Map();
  for(const x of items){if(!x?.url)continue;const key=canonicalMediaKey(x.url),prev=best.get(key);const score=v=>[Number(v?.confidence||0),Number(v?.width||0)*Number(v?.height||0),Number(v?.identity||0)];const a=score(x),b=score(prev);if(!prev||a[0]>b[0]||(a[0]===b[0]&&a[1]>b[1])||(a[0]===b[0]&&a[1]===b[1]&&a[2]>b[2]))best.set(key,{...x,previewUrl:x.previewUrl||prev?.previewUrl||''});else if(!prev.previewUrl&&x.previewUrl)best.set(key,{...prev,previewUrl:x.previewUrl});}
  return [...best.values()].sort((a,b)=>(b.confidence||0)-(a.confidence||0)||(b.width*b.height)-(a.width*a.height)||(b.identity||0)-(a.identity||0));
}
function isProviderChildUrl(provider, sourceUrl, candidateUrl) {
  let src,u;try{src=new URL(sourceUrl);u=new URL(candidateUrl,sourceUrl)}catch{return false}
  if(providerForUrl(u.toString())!==provider)return false;
  if(canonicalUrl(u.toString())===canonicalUrl(src.toString()))return false;
  const p=u.pathname;
  if(provider==='planetminecraft')return /^\/(?:texture-pack|project|mod|mob-skin|skin|data-pack|map|blog)\/[^/]+\/?$/i.test(p);
  if(provider==='afdian')return /^\/p\/[a-z0-9-]+\/?$/i.test(p);
  if(provider==='patreon')return /^\/posts\/(?:[^/]+-)?\d+\/?$/i.test(p)||/^\/(?:c\/[^/]+\/|[^/]+\/)?shop\/[^/]+-\d+\/?$/i.test(p);
  if(provider==='minecraft-marketplace')return /^\/(?:[a-z]{2}-[a-z]{2}\/)?marketplace\/pdp\/[0-9a-f-]{32,36}\/?$/i.test(p);
  if(provider==='kofi')return /^\/s\/[a-z0-9_-]+\/?$/i.test(p);
  if(provider==='itch')return u.hostname.toLowerCase()!=='itch.io'&&/^\/[^/]+\/?$/i.test(p);
  if(provider==='gumroad')return /^\/l\/[^/]+\/?$/i.test(p);
  if(provider==='fourthwall')return /^\/products\/[^/]+\/?$/i.test(p);
  if(provider==='booth')return /^\/(?:[a-z]{2}\/)?items\/\d+\/?$/i.test(p);
  if(provider==='hangar')return /^\/[^/]+\/[^/]+\/?$/i.test(p);
  if(provider==='spigot')return /^\/resources\/(?:[^/]*\.)?\d+\/?$/i.test(p);
  if(provider==='bukkit')return /^\/projects\/[^/]+\/?$/i.test(p);
  if(provider==='builtbybit')return /^\/resources\/(?:[^/]*\.)?\d+\/?$/i.test(p);
  if(provider==='nexusmods')return /^\/[^/]+\/mods\/\d+\/?$/i.test(p);
  if(provider==='moddb')return /^\/mods\/[^/]+\/?$/i.test(p);
  if(provider==='polymart')return /^\/(?:resource\/(?:[^/]*\.)?\d+|product\/\d+\/[^/]+)\/?$/i.test(p);
  if(provider==='gitlab'){const parts=p.split('/').filter(Boolean);return parts.length>=2&&!['users','groups','explore','dashboard','help'].includes((parts[0]||'').toLowerCase())&&!p.includes('/-/');}
  return false;
}
function isProviderCollectionUrl(raw='') {
  let u;try{u=new URL(raw)}catch{return false}const provider=providerForUrl(raw),p=u.pathname;
  if(provider==='planetminecraft')return /^\/collection\//i.test(p);
  if(provider==='afdian')return /^\/a\/[^/]+\/?$/i.test(p);
  if(provider==='patreon')return !/^\/posts\/(?:[^/]+-)?\d+\/?$/i.test(p)&&!/^\/(?:c\/[^/]+\/|[^/]+\/)?shop\/[^/]+-\d+\/?$/i.test(p);
  if(provider==='minecraft-marketplace')return /\/marketplace(?:\/|$)/i.test(p)&&!/\/marketplace\/pdp\/[0-9a-f-]{32,36}/i.test(p);
  if(provider==='kofi')return !/^\/s\/[a-z0-9_-]+\/?$/i.test(p);
  if(provider==='itch')return u.hostname.toLowerCase()!=='itch.io'&&/^\/?$/i.test(p);
  if(provider==='gumroad')return !/^\/l\/[^/]+\/?$/i.test(p);
  if(provider==='fourthwall')return /^\/collections\//i.test(p);
  if(provider==='booth')return !/\/items\/\d+/i.test(p);
  if(provider==='hangar')return !/^\/[^/]+\/[^/]+\/?$/i.test(p);
  if(provider==='spigot')return /^\/resources(?:\/|$)/i.test(p)&&!/^\/resources\/(?:[^/]*\.)?\d+\/?$/i.test(p);
  if(provider==='bukkit')return /^\/projects(?:\/|$)/i.test(p)&&!/^\/projects\/[^/]+\/?$/i.test(p);
  if(provider==='builtbybit')return /^\/resources(?:\/|$)/i.test(p)&&!/^\/resources\/(?:[^/]*\.)?\d+\/?$/i.test(p);
  if(provider==='nexusmods')return /\/mods(?:\/|$)/i.test(p)&&!/^\/[^/]+\/mods\/\d+\/?$/i.test(p);
  if(provider==='moddb')return /^(?:\/games\/[^/]+\/mods|\/mods)\/?$/i.test(p);
  if(provider==='polymart')return /^\/resources(?:\/|$)/i.test(p)||/^\/marketplace(?:\/|$)/i.test(p);
  if(provider==='gitlab')return /^\/(?:groups|users|explore)(?:\/|$)/i.test(p)||/\/-\/projects(?:\/|$)/i.test(p);
  return false;
}
function resolveProviderProjectLinks(html, sourceUrl, context={}) {
  html=String(html||'');const expected=String(context.title||'').trim();if(!expected)return [];
  const provider=providerForUrl(sourceUrl);if(!['planetminecraft','afdian','patreon','minecraft-marketplace','kofi','itch','gumroad','fourthwall','booth','hangar','spigot','bukkit','builtbybit','nexusmods','moddb','polymart','gitlab'].includes(provider))return [];
  const rows=[];const re=/<a\b([^>]*\bhref\s*=\s*["'][^"']+["'][^>]*)>([\s\S]*?)<\/a>/ig;let m;
  while((m=re.exec(html))){
    const tag=`<a ${m[1]}>`,href=attrValue(tag,'href'),url=absolute(href,sourceUrl);if(!url||!isProviderChildUrl(provider,sourceUrl,url))continue;
    const text=stripTags(m[2]),title=attrValue(tag,'title'),aria=attrValue(tag,'aria-label');
    const imageAlt=[...String(m[2]).matchAll(/<img\b[^>]*\balt\s*=\s*["']([^"']*)["'][^>]*>/ig)].map(x=>decodeHtml(x[1])).join(' ');
    const around=stripTags(html.slice(Math.max(0,m.index-550),Math.min(html.length,m.index+m[0].length+550)));
    const sims=[titleSimilarity(expected,text),titleSimilarity(expected,title),titleSimilarity(expected,aria),titleSimilarity(expected,imageAlt),slugSimilarity(expected,url)];
    const exactNorm=normalizeIdentity(expected),nearExact=exactNorm&&normalizeIdentity(around).includes(exactNorm);
    let sim=Math.max(...sims),confidence=Math.round(sim*100)+(nearExact?7:0);
    if(normalizeIdentity(text)===exactNorm||normalizeIdentity(title)===exactNorm||normalizeIdentity(imageAlt)===exactNorm)confidence=100;
    confidence=Math.min(100,confidence);
    if(confidence<68)continue;
    const identity=Math.round(sim*100), seedMedia=confidence>=88?linkedImageSeed(m[2],sourceUrl,provider,identity,expected):null;
    rows.push({url,title:text||title||imageAlt||url,provider,confidence,identity,seedMedia,source:`${provider}-collection-exact-title-match`});
  }
  const best=new Map();for(const row of rows){const key=canonicalUrl(row.url),prev=best.get(key);if(!prev||row.confidence>prev.confidence)best.set(key,{...row,seedMedia:row.seedMedia||prev?.seedMedia||null});else if(!prev.seedMedia&&row.seedMedia)best.set(key,{...prev,seedMedia:row.seedMedia})}
  return [...best.values()].sort((a,b)=>b.confidence-a.confidence||b.identity-a.identity);
}
function providerImageAllowed(provider, rawUrl) {
  let u;try{u=new URL(rawUrl)}catch{return false}const h=u.hostname.toLowerCase(),p=u.pathname.toLowerCase();
  if(/(?:gravatar|doubleclick|googlesyndication|google-analytics|facebook|tracking|pixel)/i.test(h+p))return false;
  const imagePath=/\.(?:avif|bmp|gif|jpe?g|png|webp)(?:$|[?#])/i.test(u.pathname+u.search);
  if(provider==='gitlab')return h==='gitlab.com'&&(imagePath||/\/api\/v4\/projects\/[^/]+\/avatar(?:$|[?#])/i.test(p)||/\/uploads\/-\/system\/project\/avatar\//i.test(p));
  if(provider==='hangar')return /(?:^|\.)hangarcdn\.papermc\.io$/.test(h)||(/(?:^|\.)hangar\.papermc\.io$/.test(h)&&(imagePath||/\/api\/v1\/projects\/[^/]+\/avatar/i.test(p)));
  if(provider==='spigot')return /(?:^|\.)spigotmc\.org$/.test(h)&&(imagePath||/\/data\/resource_icons\//i.test(p)||/\/attachments\//i.test(p));
  if(provider==='bukkit')return /(?:^|\.)dev\.bukkit\.org$/.test(h)||/(?:forgecdn|cursecdn)\.net$/.test(h);
  if(provider==='builtbybit')return /(?:^|\.)builtbybit\.com$/.test(h)&&(imagePath||/\/(?:attachments|data\/resource_icons|uploads)\//i.test(p));
  if(provider==='nexusmods')return /(?:^|\.)(?:staticdelivery|images)\.nexusmods\.com$/.test(h)||(/(?:^|\.)nexusmods\.com$/.test(h)&&imagePath);
  if(provider==='moddb')return /(?:^|\.)media\.moddb\.com$/.test(h)&&!/\/images\/global\//i.test(p)&&(imagePath||/\/images\//i.test(p));
  if(provider==='polymart')return /(?:^|\.)polymart\.org$/.test(h)&&imagePath;
  if(provider==='mcpedl')return /(?:^|\.)mcpedl\.com$/.test(h)||/forgecdn\.net$/.test(h);
  if(provider==='modbay')return /(?:^|\.)modbay\.org$/.test(h)||/forgecdn\.net$/.test(h);
  if(provider==='fourthwall')return /(?:^|\.)fourthwall\.(?:com|dev)$/.test(h)||/fourthwall/i.test(h);
  if(provider==='booth')return /(?:^|\.)booth\.pm$/.test(h)||/pximg\.net$/.test(h);
  if(provider==='afdian')return /(?:^|\.)afdian\.com$/.test(h)||/afdian(?:cdn)?\./i.test(h);
  if(provider==='patreon')return /(?:^|\.)patreonusercontent\.com$/.test(h)||(/(?:^|\.)patreon\.com$/.test(h)&&/\.(?:avif|gif|jpe?g|png|webp)(?:$|[?#])/i.test(p));
  if(provider==='minecraft-marketplace')return /(?:^|\.)minecraft\.net$/.test(h)||/(?:^|\.)xboxlive\.com$/.test(h)||/(?:^|\.)xboxservices\.com$/.test(h)||h==='store-images.s-microsoft.com'||h==='compass-ssl.xbox.com';
  if(provider==='kofi')return /(?:^|\.)ko-fi\.com$/.test(h)||/(?:^|\.)(?:storage|images)\.ko-fi\.com$/.test(h);
  if(provider==='itch')return /(?:^|\.)img\.itch\.zone$/.test(h)||/(?:^|\.)itch\.io$/.test(h);
  if(provider==='gumroad')return /(?:^|\.)gumroadusercontent\.com$/.test(h)||/(?:^|\.)gumroad\.com$/.test(h);
  if(provider==='alltheysm')return /(?:^|\.)alltheysm\.top$/.test(h);
  if(provider==='planetminecraft')return /(?:^|\.)static\.planetminecraft\.com$/.test(h);
  if(provider==='modrinth')return /(?:^|\.)cdn\.modrinth\.com$/.test(h)||/(?:^|\.)modrinth\.com$/.test(h);
  if(provider==='github')return /githubusercontent\.com$/.test(h)||/github\.com$/.test(h)||/githubassets\.com$/.test(h);
  if(provider==='curseforge')return /(?:^|\.)curseforge\.com$/.test(h)||/(?:forgecdn|cursecdn)\.net$/.test(h);
  return true;
}
function providerMediaAllowed(provider, rawUrl, kind='image') {
  kind=kind||mediaKind(rawUrl);
  if(kind==='image'||kind==='gif')return providerImageAllowed(provider,rawUrl);
  if(kind!=='video')return false;
  let u;try{u=new URL(rawUrl)}catch{return false}const h=u.hostname.toLowerCase(),whole=(u.pathname+u.search).toLowerCase();
  if(!VIDEO_EXT.test(whole)&&!/\b(?:video|stream|media)\b/i.test(whole))return false;
  if(provider==='afdian')return /(?:^|\.)afdian(?:cdn)?\.com$/.test(h);
  if(provider==='patreon')return /(?:^|\.)patreonusercontent\.com$/.test(h)||/(?:^|\.)patreon\.com$/.test(h);
  if(provider==='planetminecraft')return /(?:^|\.)static\.planetminecraft\.com$/.test(h);
  if(provider==='mcpedl')return /(?:^|\.)mcpedl\.com$/.test(h)||/(?:^|\.)r2\.mcpedl\.com$/.test(h);
  if(provider==='modbay')return /(?:^|\.)modbay\.org$/.test(h);
  if(provider==='fourthwall')return /(?:^|\.)fourthwall\.(?:com|dev)$/.test(h);
  if(provider==='booth')return /(?:^|\.)booth\.pm$/.test(h)||/(?:^|\.)pximg\.net$/.test(h);
  if(provider==='kofi')return /(?:^|\.)(?:storage|images)\.ko-fi\.com$/.test(h)||/(?:^|\.)ko-fi\.com$/.test(h);
  if(provider==='itch')return /(?:^|\.)itch(?:\.io|\.zone)$/.test(h)||/(?:^|\.)img\.itch\.zone$/.test(h);
  if(provider==='gumroad')return /(?:^|\.)gumroad(?:usercontent)?\.com$/.test(h);
  if(provider==='moddb')return /(?:^|\.)media\.moddb\.com$/.test(h);
  if(provider==='builtbybit')return /(?:^|\.)builtbybit\.com$/.test(h);
  return providerForUrl(rawUrl)===provider;
}
function projectMetaImageAllowed(provider, rawUrl) {
  if(!providerImageAllowed(provider,rawUrl))return false;
  const u=String(rawUrl||'');
  if(!/(?:logo|avatar|gravatar|badge|favicon|site-logo|brand-logo|advert|sponsor|tracking|pixel)/i.test(u))return true;
  // Several modding platforms deliberately store the project icon in an "avatar"
  // endpoint/path. These are project-scoped, not creator avatars.
  if(provider==='hangar'&&/\/api\/v1\/projects\/[^/]+\/avatar(?:$|[?#])/i.test(u))return true;
  if(provider==='gitlab'&&/(?:\/api\/v4\/projects\/[^/]+\/avatar|\/uploads\/-\/system\/project\/avatar\/)/i.test(u))return true;
  if(provider==='bukkit'&&/(?:forgecdn|cursecdn)\.net\/avatars?\//i.test(u))return true;
  return false;
}
function boundaryForProvider(provider) {
  const shared=['you may also like','related projects','related products','recommended','recommendations','similar projects','leave a reply','write a comment','comments','recent comments'];
  if(provider==='mcpedl')return ['you may also like','installation guides','pinned comment','leave a reply','comments'];
  if(provider==='modbay')return ['similar mods','related mods','comments','write a comment','you may also like'];
  if(provider==='fourthwall')return ['related products','you may also like','recommended products','customer reviews'];
  if(provider==='booth')return ['related items','other items from this shop','about this shop','reviews'];
  if(provider==='afdian')return ['评论','相关推荐','similar','related'];
  if(provider==='patreon')return ['more from this creator','recommended','comments'];
  if(provider==='minecraft-marketplace')return ['you may also like','related','more by'];
  if(provider==='kofi')return ['more from','related','support this creator'];
  if(provider==='itch')return ['more information','comments','related games'];
  if(provider==='gumroad')return ['more from','recommended','reviews'];
  if(provider==='spigot')return ['similar resources','recent reviews','discussion','version history'];
  if(provider==='bukkit')return ['recent files','members','comments','related projects'];
  if(provider==='builtbybit')return ['similar resources','reviews','discussion','more resources'];
  if(provider==='nexusmods')return ['files','posts','bugs','logs','stats','comments'];
  if(provider==='moddb')return ['related engines','related groups','comments','join the community'];
  if(provider==='polymart')return ['reviews','discussion','more resources','related'];
  if(provider==='hangar')return ['versions','dependencies','members'];
  if(provider==='gitlab')return ['footer'];
  if(provider==='github')return ['footer'];
  return shared;
}
function bestH1Index(html, expected='') {
  const rows=[];const re=/<h1\b[^>]*>([\s\S]*?)<\/h1>/ig;let m;while((m=re.exec(html)))rows.push({index:m.index,text:stripTags(m[1]),sim:titleSimilarity(expected,stripTags(m[1]))});
  if(!rows.length)return -1;rows.sort((a,b)=>b.sim-a.sim);return rows[0].index;
}
function scopedProviderRegion(html, provider, context={}) {
  const expected=context.title||'',h1=bestH1Index(html,expected),lower=html.toLowerCase();
  let start=0;
  const body=lower.indexOf('<body');if(body>=0){const gt=lower.indexOf('>',body);start=gt>=0?gt+1:body}
  if(h1>=0){const before=provider==='modbay'?3500:provider==='mcpedl'?10000:provider==='fourthwall'?16000:provider==='booth'?10000:provider==='afdian'?10000:7000;start=Math.max(start,h1-before)}
  let end=html.length,searchFrom=Math.max(start,h1>=0?h1:start);
  for(const marker of boundaryForProvider(provider)){const i=lower.indexOf(marker.toLowerCase(),searchFrom+1);if(i>=0&&i<end)end=i}
  return html.slice(start,end);
}
function curseForgeFullAndPreview(rawUrl) {
  let u;try{u=new URL(rawUrl)}catch{return {url:rawUrl,previewUrl:''}}
  const attachment=/^\/attachments\/thumbnails\/(\d+)\/(\d+)\/\d+\/\d+\/(.+)$/i.exec(u.pathname);
  const avatar=/^\/avatars\/thumbnails\/(\d+)\/(\d+)\/\d+\/\d+\/(.+)$/i.exec(u.pathname);
  const m=attachment||avatar;if(!m)return {url:u.toString(),previewUrl:''};
  const preview=u.toString();u.pathname=`/${attachment?'attachments':'avatars'}/${m[1]}/${m[2]}/${m[3]}`;u.search='';u.hash='';
  return {url:u.toString(),previewUrl:preview};
}
function extractCurseForgeRegionImages(region, sourceUrl, context, identity, source) {
  const expected=context.title||'',text=String(region||''),out=[];const reject=/(?:avatar|profile|author|badge|favicon|logo|advert|sponsor|tracking|pixel|battlegrounds|ugc[ _-]?contest|promotion|campaign)/i;
  // First keep the normal img/src/srcset path. CurseForge still uses this shape on
  // Description media and on some gallery layouts.
  const re=/<img\b[^>]*>/ig;let m;
  while((m=re.exec(text))){const tag=m[0],alt=attrValue(tag,'alt')||attrValue(tag,'title'),attrs=[attrValue(tag,'src'),attrValue(tag,'data-src'),attrValue(tag,'data-original'),attrValue(tag,'data-lazy-src')].filter(Boolean);const ss=attrValue(tag,'srcset')||attrValue(tag,'data-srcset');if(ss)for(const bit of ss.split(',')){const v=bit.trim().split(/\s+/)[0];if(v)attrs.push(v)}
    for(const raw of attrs){const candidate=absolute(raw,sourceUrl);if(!candidate||!providerImageAllowed('curseforge',candidate))continue;if(!/(?:forgecdn|cursecdn)\.net/i.test(candidate))continue;if(reject.test(`${candidate} ${alt} ${tag}`))continue;
      const pair=curseForgeFullAndPreview(candidate),altSim=titleSimilarity(expected,alt);let confidence=80+Math.round(identity*.12);if(altSim>=.55)confidence+=7;if(/attachments\/thumbnails/i.test(candidate))confidence+=6;if(/(?:gallery|screenshot|thumbnail)/i.test(`${tag} ${alt}`))confidence+=4;
      out.push(mediaItem(pair.url,{previewUrl:pair.previewUrl,alt:alt||expected||'official CurseForge project media',source,provider:'curseforge',confidence:Math.min(99,confidence),identity}));
    }
  }
  // Current CurseForge gallery SSR can expose the authoritative full attachment URL on
  // the wrapping <a href> while the nested <img> is a lazy placeholder. Treat only
  // exact ForgeCDN/CurseCDN attachment links inside the already identity-bounded
  // project/gallery region as media. This is generic provider behavior, not a
  // project-specific exception.
  const anchorRe=/<a\b[^>]*\bhref\s*=\s*["'][^"']+["'][^>]*>([\s\S]*?)<\/a>/ig;let am;
  while((am=anchorRe.exec(text))){const block=am[0],tag=/^<a\b[^>]*>/i.exec(block)?.[0]||'',href=absolute(attrValue(tag,'href'),sourceUrl);if(!href||!providerImageAllowed('curseforge',href))continue;let u;try{u=new URL(href)}catch{continue}const host=u.hostname.toLowerCase();if(!/(?:^|\.)(?:forgecdn|cursecdn)\.net$/.test(host))continue;if(!/^\/attachments\/(?:thumbnails\/)?\d+\/\d+\//i.test(u.pathname))continue;
    const inner=am[1]||'',nested=[...inner.matchAll(/<img\b[^>]*>/ig)].map(x=>x[0]),nestedAlt=nested.map(img=>attrValue(img,'alt')||attrValue(img,'title')).filter(Boolean).join(' '),label=attrValue(tag,'aria-label')||attrValue(tag,'title')||nestedAlt||stripTags(inner);if(reject.test(`${href} ${label} ${tag}`))continue;
    const pair=curseForgeFullAndPreview(href),altSim=titleSimilarity(expected,label);let confidence=90+Math.round(identity*.07);if(altSim>=.55)confidence+=2;if(/(?:gallery|screenshot|thumbnail|image)/i.test(`${tag} ${label} ${inner}`))confidence+=2;
    out.push(mediaItem(pair.url,{previewUrl:pair.previewUrl,alt:label||expected||'official CurseForge gallery image',source:`${source}-attachment-link`,provider:'curseforge',confidence:Math.min(100,confidence),identity}));
  }
  return uniqueItems(out);
}

function curseForgeExactAuthorCard(html, sourceUrl, context={}, identity=0) {
  const expected=String(context.author||'').trim();if(!expected)return {author:null,authorUrl:''};
  const expectedNorm=normalizeIdentity(expected),rows=[];const re=/<a\b([^>]*\bhref\s*=\s*["'][^"']+["'][^>]*)>([\s\S]*?)<\/a>/ig;let m;
  while((m=re.exec(String(html||'')))){
    const tag=`<a ${m[1]}>`,url=absolute(attrValue(tag,'href'),sourceUrl);if(!url)continue;
    let u;try{u=new URL(url)}catch{continue}
    if(!/(?:^|\.)curseforge\.com$/i.test(u.hostname)||!/^\/members\/[^/]+(?:\/projects)?\/?$/i.test(u.pathname))continue;
    const text=stripTags(m[2]),slug=decodeURIComponent(u.pathname.split('/').filter(Boolean)[1]||'');
    const sim=Math.max(titleSimilarity(expected,text),titleSimilarity(expected,slug));if(sim<.72)continue;
    const before=String(html||'').slice(Math.max(0,m.index-5200),m.index),after=String(html||'').slice(m.index,Math.min(String(html||'').length,m.index+m[0].length+1800));
    // The author card on CurseForge places the profile avatar immediately before the exact
    // member link. Search backwards so unrelated project cards in "More from" cannot win.
    const candidates=[];const imgRe=/<img\b[^>]*>/ig;let im;
    while((im=imgRe.exec(before))){const img=im[0],alt=attrValue(img,'alt')||attrValue(img,'title'),raw=attrValue(img,'src')||attrValue(img,'data-src')||attrValue(img,'data-original'),media=absolute(raw,sourceUrl);if(!media)continue;
      if(!providerImageAllowed('curseforge',media)&&!/avatars\.githubusercontent\.com$/i.test((()=>{try{return new URL(media).hostname}catch{return ''}})()))continue;
      const hay=`${img} ${alt} ${media}`;let score=Math.round(sim*55)+Math.round(identity*.15);
      if(/profile avatar|author avatar|user avatar|avatar/i.test(hay))score+=55;
      if(/tier frame|tier icon|badge|project image|advert|sponsor|battlegrounds|ugc[ -]?contest/i.test(hay))score-=90;
      const distance=before.length-im.index;score+=Math.max(0,25-Math.floor(distance/160));
      if(score>=75)candidates.push(mediaItem(media,{alt:`${expected} creator avatar`,role:'author',source:'curseforge-author-exact-member-card',provider:'curseforge',confidence:Math.min(100,score),identity:Math.round(sim*100)}));
    }
    // Some layouts place the image just after the author link.
    while((im=imgRe.exec(after))){const img=im[0],alt=attrValue(img,'alt')||attrValue(img,'title'),raw=attrValue(img,'src')||attrValue(img,'data-src')||attrValue(img,'data-original'),media=absolute(raw,sourceUrl);if(!media)continue;const hay=`${img} ${alt} ${media}`;let score=Math.round(sim*55)+Math.round(identity*.15);if(/profile avatar|author avatar|user avatar|avatar/i.test(hay))score+=45;if(/tier frame|tier icon|badge|project image|advert|sponsor/i.test(hay))score-=90;if(score>=75)candidates.push(mediaItem(media,{alt:`${expected} creator avatar`,role:'author',source:'curseforge-author-exact-member-card',provider:'curseforge',confidence:Math.min(100,score),identity:Math.round(sim*100)}));break}
    rows.push({url,sim,author:uniqueItems(candidates)[0]||null});
  }
  rows.sort((a,b)=>(Number(!!b.author)-Number(!!a.author))||b.sim-a.sim);const best=rows[0];return {author:best?.author||null,authorUrl:best?.url||''};
}
function curseForgeProjectIcon(html, sourceUrl, context={}, identity=0) {
  const expected=String(context.title||'').trim();if(!expected)return null;const text=String(html||''),h1=bestH1Index(text,expected);if(h1<0)return null;
  const start=Math.max(0,h1-12000),end=Math.min(text.length,h1+16000),region=text.slice(start,end),candidates=[];const re=/<img\b[^>]*>/ig;let m;
  while((m=re.exec(region))){const tag=m[0],alt=attrValue(tag,'alt')||attrValue(tag,'title'),raw=attrValue(tag,'src')||attrValue(tag,'data-src')||attrValue(tag,'data-original')||attrValue(tag,'data-lazy-src'),url=absolute(raw,sourceUrl);if(!url)continue;let host='';try{host=new URL(url).hostname.toLowerCase()}catch{}
    if(!/(?:forgecdn|cursecdn)\.net$/.test(host))continue;
    const sim=titleSimilarity(expected,alt);const hay=`${tag} ${alt} ${url}`;let score=46+Math.round(identity*.28)+Math.round(sim*42);
    if(/project image|project icon|mod icon|project-avatar|project_avatar/i.test(hay))score+=34;
    // CurseForge's project logo CDN path is called avatars; allow it only when it is
    // title-bound and near the exact project H1. Creator avatars are handled separately.
    if(/\/avatars(?:\/|$)/i.test(new URL(url).pathname))score+=sim>=.55?24:-35;
    if(/profile avatar|author avatar|user avatar|tier frame|tier icon|badge|advert|sponsor|battlegrounds|ugc[ -]?contest/i.test(hay))score-=100;
    if(sim<.42&&!/project image|project icon|mod icon/i.test(hay))continue;
    const distance=Math.abs((start+m.index)-h1);score+=Math.max(0,22-Math.floor(distance/500));
    if(score>=74){const pair=curseForgeFullAndPreview(url);candidates.push(mediaItem(pair.url,{previewUrl:pair.previewUrl,alt:alt||`${expected} project icon`,role:'icon',source:'curseforge-project-header-exact',provider:'curseforge',confidence:Math.min(100,score),identity}));}
  }
  return uniqueItems(candidates)[0]||null;
}
function curseForgeDescriptionImages(html, sourceUrl, context={}, identity=0) {
  const text=String(html||''),lower=text.toLowerCase(),expected=context.title||'';let start=-1;
  // Prefer the second project H1 (the description body) over the header H1.
  const h1s=[];const h1re=/<h1\b[^>]*>([\s\S]*?)<\/h1>/ig;let hm;while((hm=h1re.exec(text))){const sim=titleSimilarity(expected,stripTags(hm[1]));if(sim>=.52)h1s.push({index:hm.index,sim})}
  if(h1s.length>=2)start=h1s[1].index;else if(h1s.length)start=h1s[0].index;
  for(const marker of ['>description<','id="description"',"id='description'"]){const i=lower.indexOf(marker);if(i>=0&&i<text.length&&(start<0||i>start-4000))start=Math.max(start,i)}
  if(start<0)return [];
  let end=text.length;for(const marker of ['the '+normalizeIdentity(expected)+' team','project members','members of the project','more from ','related projects','you may also like','<footer']){const needle=marker.toLowerCase(),i=lower.indexOf(needle,start+8);if(i>=0&&i<end)end=i}
  const region=text.slice(start,end),out=[];const re=/<img\b[^>]*>/ig;let m;
  while((m=re.exec(region))){const tag=m[0],alt=attrValue(tag,'alt')||attrValue(tag,'title'),raws=[attrValue(tag,'data-original'),attrValue(tag,'data-lazy-src'),attrValue(tag,'data-src'),attrValue(tag,'src')].filter(Boolean);const ss=attrValue(tag,'srcset')||attrValue(tag,'data-srcset');if(ss)for(const bit of ss.split(',')){const raw=bit.trim().split(/\s+/)[0];if(raw)raws.push(raw)}
    for(const raw of raws){const url=absolute(raw,sourceUrl);if(!url||!isTrustedMediaUrl(url))continue;const hay=`${url} ${alt} ${tag}`;if(/(?:profile avatar|author avatar|user avatar|tier frame|tier icon|badge|favicon|site-logo|brand-logo|advert|sponsor|tracking|pixel|shields\.io|battlegrounds|ugc[ -]?contest)/i.test(hay))continue;
      let score=76+Math.round(identity*.16);if(titleSimilarity(expected,alt)>=.45)score+=8;if(/(?:gallery|screenshot|preview|feature|image)/i.test(hay))score+=5;out.push(mediaItem(url,{alt:alt||`${expected} project description image`,role:'gallery',source:'curseforge-project-description-exact',provider:'curseforge',confidence:Math.min(98,score),identity}));
    }
  }
  // Some CurseForge descriptions keep screenshots as ordinary repository links rather
  // than <img> elements. Recover only image-bearing GitHub/GitLab links from the exact,
  // identity-bounded Description region and canonicalize blob pages to their raw bytes.
  // This is deliberately link/extension scoped so repository navigation, badges, issues,
  // and unrelated project chrome cannot become gallery media.
  const linkedImageUrl=raw=>{
    let u;try{u=new URL(decodeHtml(raw),sourceUrl)}catch{return ''}
    if(!/^https?:$/.test(u.protocol))return '';
    const host=u.hostname.toLowerCase(),imageExt=/\.(?:png|jpe?g|webp|gif|avif)(?:$|[?#])/i;
    if(host==='github.com'){
      const parts=u.pathname.split('/').filter(Boolean),blob=parts.indexOf('blob');
      if(blob!==2||parts.length<5||!imageExt.test(parts.slice(blob+2).join('/')))return '';
      return `https://raw.githubusercontent.com/${encodeURIComponent(parts[0])}/${encodeURIComponent(parts[1])}/${parts.slice(blob+1).map(encodeURIComponent).join('/')}`;
    }
    if(host==='raw.githubusercontent.com')return imageExt.test(u.pathname)?u.toString():'';
    if(host==='gitlab.com'){
      if(!u.pathname.includes('/-/blob/')||!imageExt.test(u.pathname))return '';
      u.pathname=u.pathname.replace('/-/blob/','/-/raw/');u.hash='';return u.toString();
    }
    return '';
  };
  const linkRe=/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/ig;let lm;
  while((lm=linkRe.exec(region))){const url=linkedImageUrl(lm[1]);if(!url)continue;const label=stripTags(lm[2])||attrValue(lm[0],'title')||`${expected} project description image`;out.push(mediaItem(url,{alt:label,role:'gallery',source:'curseforge-project-description-linked-raw',provider:'curseforge',confidence:Math.min(98,84+Math.round(identity*.14)),identity}));}
  return uniqueItems(out);
}
function parseCurseForgeProjectHtml(html, sourceUrl, context={}) {
  const text=String(html||''),expected=context.title||'',actualTitle=htmlTitle(text),identity=pageIdentityConfidence({expectedTitle:expected,actualTitle,sourceUrl});
  if(expected&&identity<54)return {sourceUrl,title:actualTitle,gallery:[],images:[],icon:null,author:null,authorUrl:'',provider:'curseforge',identity,exclusive:false,error:`CurseForge identity mismatch (${identity}%)`};
  let isGallery=false;try{isGallery=/\/gallery\/?$/i.test(new URL(sourceUrl).pathname)}catch{}
  const sourceGalleryAbsent=isGallery&&/this mod has no gallery items available/i.test(stripTags(text));
  const icon=curseForgeProjectIcon(text,sourceUrl,context,identity);
  const auth=curseForgeExactAuthorCard(text,sourceUrl,context,identity);
  let gallery=[];
  if(!sourceGalleryAbsent)gallery=extractCurseForgeImages(text,sourceUrl,context,identity);
  if(!isGallery)gallery=uniqueItems([...gallery,...curseForgeDescriptionImages(text,sourceUrl,context,identity)]);
  return {sourceUrl,title:actualTitle,gallery,images:gallery,icon,author:auth.author,authorUrl:auth.authorUrl,provider:'curseforge',identity,exclusive:/<\/html\s*>/i.test(text),sourceGalleryAbsent,galleryAbsent:false,error:sourceGalleryAbsent?'CurseForge gallery route is empty; canonical project media may still exist.':(!gallery.length&&!icon?'CurseForge did not expose role-safe project media in this response.':'')};
}
function parseCurseForgeGalleryStreamSeed(html, sourceUrl, context={}) {
  const text=String(html||'');
  if(!text)return null;
  let u;try{u=new URL(sourceUrl)}catch{return null}
  if(providerForUrl(sourceUrl)!=='curseforge'||!/\/gallery\/?$/i.test(u.pathname))return null;
  const expected=context.title||'';
  const actualTitle=htmlTitle(text);
  const identity=pageIdentityConfidence({expectedTitle:expected,actualTitle,sourceUrl:sourceUrl.replace(/\/gallery\/?$/i,'')});
  // Never let global CurseForge promos, contests, navigation art, or ads become a
  // project-owned stream seed. The exact project H1 is the ownership boundary.
  const h1=bestH1Index(text,expected);
  if(h1<0||expected&&identity<54)return null;
  const lower=text.toLowerCase();
  let start=h1;
  // CurseForge's live /gallery page currently orders its project tabs as
  // Description -> Comments -> Files -> Gallery -> Relations. Therefore tab labels
  // are navigation, not content boundaries. Start at the first owned Gallery marker
  // after H1 and never stop at Description/Files/Relations on the exact gallery route.
  let galleryMarker=-1;
  for(const marker of ['gallery (','>gallery<','/gallery"',"/gallery'"]){
    const i=lower.indexOf(marker,h1);
    if(i>=h1&&(galleryMarker<0||i<galleryMarker))galleryMarker=i;
  }
  if(galleryMarker>=h1)start=galleryMarker;
  let end=text.length;
  for(const marker of ['curseforge - a world','<footer','the team','project members','members of the project','related projects','you may also like']){
    const i=lower.indexOf(marker,start+8);if(i>=0&&i<end)end=i;
  }
  const region=text.slice(start,end);
  const items=extractCurseForgeRegionImages(region,sourceUrl,context,identity,'curseforge-gallery-stream-owned')
    .filter(x=>!/(?:battlegrounds|ugc[ -]?contest|promotion|campaign|advert|sponsor)/i.test(`${x.url} ${x.alt||''}`));
  const media=items[0];if(!media)return null;
  return {sourceUrl:sourceUrl.replace(/\/gallery\/?$/i,''),title:actualTitle||expected,gallery:[media],images:[media],icon:null,author:null,authorUrl:'',provider:'curseforge',identity,exclusive:false,streamOwned:true,error:''};
}

function extractCurseForgeImages(html, sourceUrl, context, identity) {
  const text=String(html||''),lower=text.toLowerCase(),regions=[];
  let pathIsGallery=false;try{pathIsGallery=/\/gallery\/?$/i.test(new URL(sourceUrl).pathname)}catch{}
  let descriptionAt=text.length;
  for(const marker of ['>description<','>description:</','id="description"',"id='description'"]){const i=lower.indexOf(marker);if(i>=0&&i<descriptionAt)descriptionAt=i}
  const h1=bestH1Index(text,context.title||'');
  const searchStart=Math.max(0,h1>=0?h1:0),galleryMarkers=['gallery (','>gallery<','/gallery"',"/gallery'"];
  let galleryStart=-1;
  // The live CurseForge /gallery topology puts the Description tab BEFORE Gallery.
  // On an exact /gallery route, Description/Files/Relations are navigation labels and
  // must not fence off the gallery. On a canonical project page we retain the older
  // before-Description restriction so unrelated lower-page links cannot become media.
  for(const marker of galleryMarkers){
    const pos=lower.indexOf(marker,searchStart);
    if(pos>=0&&(pathIsGallery||pos<descriptionAt)&&(galleryStart<0||pos<galleryStart))galleryStart=pos;
  }
  if(galleryStart<0&&pathIsGallery)galleryStart=searchStart;
  if(galleryStart>=0){
    let end=pathIsGallery?text.length:descriptionAt;
    // Exact /gallery pages are bounded by global/project-end markers only. Tab labels
    // such as Relations occur before the actual eleven Bok attachment cards today.
    for(const marker of ['curseforge - a world','<footer','the team','project members','members of the project','related projects','you may also like']){
      const i=lower.indexOf(marker,galleryStart+8);if(i>=0&&i<end)end=i;
    }
    regions.push({text:text.slice(galleryStart,end),source:'curseforge-gallery-ssr'});
  }
  // "Description" on /gallery is just a navigation tab. Parse Description media only
  // on the canonical project surface where it is an actual content boundary.
  if(!pathIsGallery&&descriptionAt<text.length){
    let end=text.length;for(const marker of ['the team','recent files','project members','members of the project','related projects','you may also like','<footer']){const i=lower.indexOf(marker,descriptionAt+12);if(i>=0&&i<end)end=i}
    regions.push({text:text.slice(descriptionAt,end),source:'curseforge-description-media'});
  }
  return uniqueItems(regions.flatMap(r=>extractCurseForgeRegionImages(r.text,sourceUrl,context,identity,r.source)));
}
function extractProviderImages(html, sourceUrl, context, provider, identity) {
  if(provider==='curseforge')return extractCurseForgeImages(html,sourceUrl,context,identity);
  if(!['mcpedl','modbay','fourthwall','booth','afdian','patreon','minecraft-marketplace','kofi','itch','gumroad','alltheysm','github','gitlab','hangar','spigot','bukkit','builtbybit','nexusmods','moddb','polymart'].includes(provider))return [];
  const region=scopedProviderRegion(html,provider,context),expected=context.title||'',out=[];const imageTag=/<img\b[^>]*>/ig;let m;
  while((m=imageTag.exec(region))){
    const tag=m[0],alt=attrValue(tag,'alt')||attrValue(tag,'title'),cls=`${attrValue(tag,'class')} ${attrValue(tag,'id')}`;
    const declaredW=Number(attrValue(tag,'width'))||0,declaredH=Number(attrValue(tag,'height'))||0;
    const variants=[];
    const push=(raw,width=0,priority=0)=>{const u=absolute(raw,sourceUrl);if(u&&providerImageAllowed(provider,u))variants.push({url:u,width:Number(width)||0,priority})};
    push(attrValue(tag,'data-original'),declaredW,50);push(attrValue(tag,'data-lazy-src'),declaredW,40);push(attrValue(tag,'data-src'),declaredW,30);push(attrValue(tag,'src'),declaredW,20);
    const srcset=attrValue(tag,'srcset')||attrValue(tag,'data-srcset');if(srcset)for(const bit of srcset.split(',')){const parts=bit.trim().split(/\s+/),raw=parts[0],desc=parts[1]||'';let w=0;if(/\d+w$/i.test(desc))w=parseInt(desc,10)||0;else if(/[\d.]+x$/i.test(desc))w=Math.round((parseFloat(desc)||1)*Math.max(1,declaredW||600));push(raw,w,35)}
    if(!variants.length)continue;
    const uniq=[...new Map(variants.map(v=>[v.url,v])).values()];
    const full=[...uniq].sort((a,b)=>(b.priority-a.priority)||((b.width||0)-(a.width||0)))[0];
    // Prefer the largest explicit srcset candidate for full fidelity even when the
    // markup's src points at a thumbnail/lazy placeholder.
    const sized=uniq.filter(v=>v.width>0).sort((a,b)=>b.width-a.width);if(sized[0]&&sized[0].width>(full.width||0))Object.assign(full,sized[0]);
    const previewCandidates=uniq.filter(v=>v.width>=320).sort((a,b)=>Math.abs(a.width-640)-Math.abs(b.width-640));
    let preview=(previewCandidates[0]||uniq.find(v=>v.url!==full.url&&v.width>0)||uniq.find(v=>v.url!==full.url))?.url||'';
    const pair=providerFullAndPreview(provider,full.url);if(pair.previewUrl)preview=pair.previewUrl;const u=pair.url||full.url,kind=mediaKind(u),hay=`${u} ${alt} ${cls}`;
    if(/(?:avatar|profile|member|author|emoji|badge|favicon|site-logo|brand-logo|advert|sponsor|tracking|pixel)/i.test(hay))continue;
    const altSim=titleSimilarity(expected,alt),urlSim=slugSimilarity(expected,u);let score=44+Math.round(identity*.22);
    if(altSim>=.9)score+=34;else if(altSim>=.65)score+=24;else if(altSim>=.45)score+=14;
    if(urlSim>=.6)score+=9;
    if(/(?:gallery|screenshot|showcase|product[-_ ]?image|carousel|preview|media)/i.test(cls+' '+alt))score+=15;
    if(provider==='fourthwall'&&/imgproxy\.fourthwall\.dev/i.test(u)&&/product image/i.test(alt))score+=20;
    if(provider==='booth'&&/booth\.pximg\.net/i.test(u))score+=14;
    if(provider==='mcpedl'&&/(?:r2\.mcpedl\.com|media\.forgecdn\.net)/i.test(u))score+=10;
    if(provider==='modbay'&&/\/uploads\//i.test(new URL(u).pathname))score+=12;
    if(provider==='afdian'&&/\/p\//i.test(new URL(sourceUrl).pathname))score+=8;
    score+=postMediaBonus(provider,{url:u,alt,cls,parent:'',kind,tag:'img'});
    if(provider==='patreon'&&/patreonusercontent\.com/i.test(u))score+=18;
    if(provider==='minecraft-marketplace'&&/(?:minecraft\.net|xboxlive\.com|xboxservices\.com|store-images\.s-microsoft\.com)/i.test(u))score+=16;
    if(provider==='kofi'&&/(?:storage|images)\.ko-fi\.com/i.test(u))score+=16;
    if(provider==='itch'&&/img\.itch\.zone/i.test(u))score+=16;
    if(provider==='gumroad'&&/gumroadusercontent\.com/i.test(u))score+=16;
    if(provider==='gitlab'&&/gitlab\.com/i.test(u))score+=14;
    if(provider==='hangar'&&/(?:hangarcdn|hangar\.papermc)\.io/i.test(u))score+=18;
    if(provider==='spigot'&&/(?:resource_icons|attachments)/i.test(u))score+=18;
    if(provider==='bukkit'&&/(?:forgecdn|cursecdn|dev\.bukkit)/i.test(u))score+=16;
    if(provider==='builtbybit'&&/builtbybit\.com/i.test(u))score+=16;
    if(provider==='nexusmods'&&/(?:staticdelivery|images)\.nexusmods\.com/i.test(u))score+=20;
    if(provider==='moddb'&&/media\.moddb\.com/i.test(u)&&!/\/images\/global\//i.test(u))score+=18;
    if(provider==='polymart'&&/polymart\.org/i.test(u))score+=16;
    if(score<68)continue;
    out.push(mediaItem(u,{previewUrl:preview,alt:alt||expected||'official project media',width:full.width||declaredW,height:declaredH,mediaType:kind,source:`${provider}-scoped-project-media`,provider,confidence:Math.min(100,score),identity}));
  }
  // A common post pattern is a thumbnail nested in a link to the original image/GIF.
  // Bind the full link to the nested post image instead of painting the thumbnail forever.
  const linkedRe=/<a\b([^>]*\bhref\s*=\s*["'][^"']+["'][^>]*)>([\s\S]*?<img\b[^>]*>[\s\S]*?)<\/a>/ig;let lm;
  while((lm=linkedRe.exec(region))){const anchor=`<a ${lm[1]}>`,fullRaw=attrValue(anchor,'href'),fullUrl=absolute(fullRaw,sourceUrl);if(!fullUrl||!providerImageAllowed(provider,fullUrl))continue;const img=/<img\b[^>]*>/i.exec(lm[2])?.[0]||'',alt=attrValue(img,'alt')||attrValue(img,'title'),cls=`${attrValue(img,'class')} ${attrValue(img,'id')} ${attrValue(anchor,'class')}`,hay=`${fullUrl} ${alt} ${cls}`;if(/(?:avatar|profile|author|creator|member|badge|favicon|advert|sponsor|tracking|pixel)/i.test(hay))continue;const kind=mediaKind(fullUrl),bonus=postMediaBonus(provider,{url:fullUrl,alt,cls,parent:anchor,kind,tag:'a-img'});if(bonus<18&&!/(?:gallery|screenshot|showcase|post|article|content|preview|media)/i.test(hay))continue;const previewRaw=attrValue(img,'data-src')||attrValue(img,'src'),preview=absolute(previewRaw,sourceUrl);let score=68+Math.round(identity*.18)+bonus;if(titleSimilarity(expected,alt)>=.45)score+=8;if(score<72)continue;const pair=providerFullAndPreview(provider,fullUrl);out.push(mediaItem(pair.url||fullUrl,{previewUrl:pair.previewUrl||((preview&&preview!==fullUrl&&providerImageAllowed(provider,preview))?preview:''),alt:alt||expected||'official post media',role:'gallery',mediaType:kind,source:`${provider}-linked-original-post-media`,provider,confidence:Math.min(100,score),identity}));}
  // Some storefront/post renderers place real media on a styled container instead of an
  // <img>. Accept background-image only when the element itself carries post/gallery
  // semantics; generic decorative CSS remains excluded.
  const styleRe=/<[a-z][a-z0-9:-]*\b[^>]*\bstyle\s*=\s*["'][^"']*url\((?:["']?)([^)"']+)(?:["']?)\)[^"']*["'][^>]*>/ig;let bm;
  while((bm=styleRe.exec(region))){const tag=bm[0],url=absolute(bm[1],sourceUrl);if(!url||!providerImageAllowed(provider,url))continue;const cls=`${attrValue(tag,'class')} ${attrValue(tag,'id')}`,kind=mediaKind(url),bonus=postMediaBonus(provider,{url,alt:'',cls,parent:tag,kind,tag:'background'});if(bonus<24&&!/(?:gallery|screenshot|showcase|post|article|content|preview|media|carousel)/i.test(cls))continue;const pair=providerFullAndPreview(provider,url);out.push(mediaItem(pair.url||url,{previewUrl:pair.previewUrl,alt:expected||'official post media',role:'gallery',mediaType:kind,source:`${provider}-styled-post-media`,provider,confidence:Math.min(96,66+Math.round(identity*.18)+bonus),identity}));}
  // Direct post videos are first-class gallery media. Keep poster art as a preview but
  // preserve the actual video URL for the lightbox/player.
  const videoRe=/<video\b([^>]*)>([\s\S]*?)<\/video>|<video\b([^>]*)\/?\s*>/ig;let vm;
  while((vm=videoRe.exec(region))){
    const attrs=`<video ${vm[1]||vm[3]||''}>`,body=vm[2]||'',cls=`${attrValue(attrs,'class')} ${attrValue(attrs,'id')}`,posterRaw=attrValue(attrs,'poster'),poster=absolute(posterRaw,sourceUrl),sources=[];
    const direct=attrValue(attrs,'src');if(direct)sources.push(direct);const sourceRe=/<source\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/ig;let sm;while((sm=sourceRe.exec(body)))sources.push(sm[1]);
    for(const raw of sources){const u=absolute(raw,sourceUrl);if(!u||!providerMediaAllowed(provider,u,'video'))continue;let score=62+Math.round(identity*.18)+postMediaBonus(provider,{url:u,alt:expected,cls,parent:'post',kind:'video',tag:'video'});if(score<72)continue;const posterPair=poster&&providerImageAllowed(provider,poster)?providerFullAndPreview(provider,poster):{url:'',previewUrl:''};out.push(mediaItem(u,{posterUrl:posterPair.url||poster||'',previewUrl:posterPair.previewUrl||poster||'',alt:`${expected||'Project'} post video`,role:'gallery',mediaType:'video',source:`${provider}-scoped-post-video`,provider,confidence:Math.min(100,score),identity}));}
  }
  return uniqueItems(out);
}
function extractDirectPostVideos(region, sourceUrl, context={}, provider=providerForUrl(sourceUrl), identity=60) {
  const expected=context.title||'',out=[],videoRe=/<video\b([^>]*)>([\s\S]*?)<\/video>|<video\b([^>]*)\/?\s*>/ig;let vm;
  while((vm=videoRe.exec(String(region||'')))){const attrs=`<video ${vm[1]||vm[3]||''}>`,body=vm[2]||'',cls=`${attrValue(attrs,'class')} ${attrValue(attrs,'id')}`,posterRaw=attrValue(attrs,'poster'),poster=absolute(posterRaw,sourceUrl),sources=[];const direct=attrValue(attrs,'src');if(direct)sources.push(direct);const sourceRe=/<source\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/ig;let sm;while((sm=sourceRe.exec(body)))sources.push(sm[1]);for(const raw of sources){const u=absolute(raw,sourceUrl);if(!u||!providerMediaAllowed(provider,u,'video'))continue;let score=62+Math.round(identity*.18)+postMediaBonus(provider,{url:u,alt:expected,cls,parent:'post',kind:'video',tag:'video'});if(score<72)continue;const posterPair=poster&&providerImageAllowed(provider,poster)?providerFullAndPreview(provider,poster):{url:'',previewUrl:''};out.push(mediaItem(u,{posterUrl:posterPair.url||poster||'',previewUrl:posterPair.previewUrl||poster||'',alt:`${expected||'Project'} post video`,role:'gallery',mediaType:'video',source:`${provider}-scoped-post-video`,provider,confidence:Math.min(100,score),identity}));}}
  return uniqueItems(out);
}

function findProviderAuthorLink(html, sourceUrl, context={}, provider=providerForUrl(sourceUrl)) {
  const expected=normalizeIdentity(context.author||'');const rows=[];const re=/<a\b([^>]*\bhref\s*=\s*["'][^"']+["'][^>]*)>([\s\S]*?)<\/a>/ig;let m;
  while((m=re.exec(String(html||'')))){
    const tag=`<a ${m[1]}>`,url=absolute(attrValue(tag,'href'),sourceUrl);if(!url)continue;let u;try{u=new URL(url)}catch{continue}
    if(providerForUrl(url)!==provider)continue;
    const text=stripTags(m[2]),title=attrValue(tag,'title'),aria=attrValue(tag,'aria-label'),rel=attrValue(tag,'rel');
    const slug=decodeURIComponent(u.pathname.split('/').filter(Boolean).pop()||'').replace(/[-_]+/g,' ');
    const identity=Math.max(titleSimilarity(expected,text),titleSimilarity(expected,title),titleSimilarity(expected,aria),titleSimilarity(expected,slug));
    let score=Math.round(identity*100)+authorLinkBonus(provider,url,`${text} ${title} ${aria} ${rel} ${tag}`);
    if(/\bauthor\b/i.test(rel))score+=45;
    if(expected&&[text,title,aria,slug].some(x=>normalizeIdentity(x)===expected))score+=30;
    if(!expected&&authorPathMatch(provider,url)&&/(?:\bby\b|author|creator|member|profile)/i.test(`${text} ${title} ${aria} ${tag}`))score+=55;
    if((expected&&identity>=.58&&score>=82)||(!expected&&score>=82))rows.push({url,score,identity});
  }
  rows.sort((a,b)=>b.score-a.score||b.identity-a.identity);return rows[0]?.url||'';
}
function boundAuthorAvatar(html, sourceUrl, authorUrl, context={}, provider=providerForUrl(sourceUrl), identity=70) {
  if(!authorUrl)return null;const expected=String(context.author||'').trim(),canonicalAuthor=canonicalUrl(authorUrl),out=[];
  const re=/<a\b([^>]*\bhref\s*=\s*["'][^"']+["'][^>]*)>([\s\S]*?)<\/a>/ig;let m;
  while((m=re.exec(String(html||'')))){
    const tag=`<a ${m[1]}>`,href=absolute(attrValue(tag,'href'),sourceUrl);if(!href||canonicalUrl(href)!==canonicalAuthor)continue;
    const anchorText=stripTags(m[2]),anchorIdentity=expected?Math.max(titleSimilarity(expected,anchorText),slugSimilarity(expected,href)):1;
    if(expected&&anchorIdentity<.55)continue;
    const imgRe=/<img\b[^>]*>/ig;let im;while((im=imgRe.exec(m[2]))){const img=im[0],alt=attrValue(img,'alt')||attrValue(img,'title'),raw=attrValue(img,'data-original')||attrValue(img,'data-src')||attrValue(img,'src'),url=absolute(raw,sourceUrl);if(!url||!providerImageAllowed(provider,url))continue;const cls=`${attrValue(img,'class')} ${attrValue(img,'id')}`,kind=mediaKind(url),bonus=avatarBonus(provider,{url,alt,cls,parent:tag,boundToExactAuthor:true});let score=72+Math.round(anchorIdentity*18)+bonus;if(score<82)continue;out.push(mediaItem(url,{alt:alt||`${expected||anchorText||'Creator'} avatar`,role:'author',mediaType:kind,source:`${provider}-project-bound-author`,provider,confidence:Math.min(100,score),identity:Math.max(identity,Math.round(anchorIdentity*100))}));}
  }
  return uniqueItems(out)[0]||null;
}

function adjacentAuthorAvatar(html, sourceUrl, authorUrl, context={}, provider=providerForUrl(sourceUrl), identity=70) {
  if(!authorUrl)return null;const expected=String(context.author||'').trim(),canonicalAuthor=canonicalUrl(authorUrl),rows=[];const re=/<a\b([^>]*\bhref\s*=\s*["'][^"']+["'][^>]*)>([\s\S]*?)<\/a>/ig;let m;
  while((m=re.exec(String(html||'')))){
    const tag=`<a ${m[1]}>`,href=absolute(attrValue(tag,'href'),sourceUrl);if(!href||canonicalUrl(href)!==canonicalAuthor)continue;
    const text=stripTags(m[2]),title=attrValue(tag,'title'),aria=attrValue(tag,'aria-label'),authorIdentity=expected?Math.max(titleSimilarity(expected,text),titleSimilarity(expected,title),titleSimilarity(expected,aria),slugSimilarity(expected,href)):1;if(expected&&authorIdentity<.55)continue;
    const start=Math.max(0,m.index-1400),end=Math.min(String(html||'').length,m.index+m[0].length+1400),region=String(html||'').slice(start,end),imageRe=/<img\b[^>]*>/ig;let im;
    while((im=imageRe.exec(region))){const img=im[0],raw=attrValue(img,'data-original')||attrValue(img,'data-src')||attrValue(img,'data-lazy-src')||attrValue(img,'src'),url=absolute(raw,sourceUrl);if(!url||!providerImageAllowed(provider,url))continue;const alt=attrValue(img,'alt')||attrValue(img,'title'),cls=`${attrValue(img,'class')} ${attrValue(img,'id')}`,hay=`${img} ${alt} ${cls} ${url}`;if(/(?:project image|project icon|resource image|cover|banner|gallery|screenshot|showcase|badge|trophy|emoji|advert|sponsor|contest|prize pool)/i.test(hay))continue;
      const avatarish=/(?:avatar|profile|author|creator|member|portrait|headshot|face)/i.test(hay),altIdentity=expected?titleSimilarity(expected,alt):0;if(!avatarish&&altIdentity<.62)continue;
      const absoluteIndex=start+im.index,distance=Math.abs(absoluteIndex-m.index);let score=58+Math.round(authorIdentity*18)+avatarBonus(provider,{url,alt,cls,parent:tag,boundToExactAuthor:false})+Math.max(0,22-Math.floor(distance/55));if(altIdentity>=.72)score+=22;if(avatarish)score+=18;if(postMediaBonus(provider,{url,alt,cls,parent:'author-adjacent',kind:mediaKind(url),tag:'img'})>=40&&!avatarish)score-=60;if(score>=86)rows.push(mediaItem(url,{alt:alt||`${expected||text||'Creator'} avatar`,role:'author',source:`${provider}-project-adjacent-author`,provider,confidence:Math.min(100,score),identity:Math.max(identity,Math.round(authorIdentity*100))}));
    }
  }
  return uniqueItems(rows)[0]||null;
}
function jsonLdNodes(html='') {
  const nodes=[];const push=value=>{if(!value)return;if(Array.isArray(value)){for(const x of value)push(x);return}if(typeof value!=='object')return;nodes.push(value);if(Array.isArray(value['@graph']))for(const x of value['@graph'])push(x)};const re=/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/ig;let m;while((m=re.exec(String(html||'')))){try{push(JSON.parse(decodeHtml(m[1])))}catch{}}return nodes;
}
function structuredUrl(value, base='') {
  if(!value)return '';if(typeof value==='string')return absolute(value,base);if(typeof value==='object'){for(const key of ['url','contentUrl','@id']){const u=structuredUrl(value[key],base);if(u)return u}}return '';
}
function structuredProviderData(html, sourceUrl, context={}, provider=providerForUrl(sourceUrl), identity=0) {
  const expected=String(context.title||''),sourceKey=canonicalUrl(sourceUrl),gallery=[],icons=[],authors=[];let authorUrl='';
  const values=value=>Array.isArray(value)?value:(value==null?[]:[value]);
  const acceptAuthor=(obj,baseConfidence=88)=>{if(!obj)return;const a=typeof obj==='string'?{url:obj}:obj;if(typeof a!=='object')return;const candidateUrl=structuredUrl(a,sourceUrl);if(candidateUrl&&providerForUrl(candidateUrl)===provider&&(authorPathMatch(provider,candidateUrl)||canonicalUrl(candidateUrl)!==sourceKey))authorUrl=authorUrl||canonicalUrl(candidateUrl);for(const raw of values(a.image||a.thumbnailUrl||a.logo)){const u=structuredUrl(raw,sourceUrl);if(!u||!providerImageAllowed(provider,u))continue;const label=String(a.name||context.author||'Creator');if(/(?:badge|banner|cover|project|product|gallery|screenshot|advert|sponsor)/i.test(`${u} ${label}`))continue;authors.push(mediaItem(u,{alt:`${label} avatar`,role:'author',source:`${provider}-jsonld-author`,provider,confidence:baseConfidence,identity:Math.max(identity,80)}));}};
  const acceptVisual=(raw,kindHint='image',confidence=88,source='jsonld')=>{const u=structuredUrl(raw,sourceUrl);if(!u)return;const kind=kindHint==='video'?'video':mediaKind(u);if(kind==='video'){if(!providerMediaAllowed(provider,u,'video'))return;let poster='';if(raw&&typeof raw==='object')poster=structuredUrl(raw.thumbnailUrl||raw.image,sourceUrl);gallery.push(mediaItem(u,{posterUrl:poster&&providerImageAllowed(provider,poster)?poster:'',previewUrl:poster&&providerImageAllowed(provider,poster)?poster:'',alt:expected?`${expected} video`:'project video',role:'gallery',mediaType:'video',source:`${provider}-${source}`,provider,confidence,identity}));return}if(!providerImageAllowed(provider,u))return;gallery.push(mediaItem(u,{alt:expected||'official project media',role:'gallery',mediaType:kind,source:`${provider}-${source}`,provider,confidence,identity}));};
  for(const obj of jsonLdNodes(html)){const type=values(obj['@type']).join(' '),name=String(obj.name||obj.headline||obj.alternateName||''),objUrl=structuredUrl(obj.url||obj.mainEntityOfPage||obj['@id'],sourceUrl),exactUrl=objUrl&&canonicalUrl(objUrl)===sourceKey,titleSim=titleSimilarity(expected,name),pageType=/(?:Article|BlogPosting|SocialMediaPosting|CreativeWork|SoftwareApplication|Product|VideoObject|ImageObject)/i.test(type),owned=!!exactUrl||titleSim>=.58||(identity>=86&&pageType);if(!owned)continue;
    for(const a of [...values(obj.author),...values(obj.creator)])acceptAuthor(a,94);
    for(const raw of [...values(obj.image),...values(obj.thumbnailUrl),...values(obj.screenshot),...values(obj.associatedMedia)]){const hint=raw&&typeof raw==='object'&&/VideoObject/i.test(values(raw['@type']).join(' '))?'video':'image';acceptVisual(raw,hint,Math.min(99,82+Math.round(identity*.15)),'jsonld-owned');}
    for(const raw of values(obj.logo)){const u=structuredUrl(raw,sourceUrl);if(u&&providerImageAllowed(provider,u))icons.push(mediaItem(u,{alt:`${expected||name||'Project'} logo`,role:'icon',source:`${provider}-jsonld-logo`,provider,confidence:Math.min(99,84+Math.round(identity*.12)),identity}));}
    for(const raw of values(obj.video)){acceptVisual(raw,'video',Math.min(99,84+Math.round(identity*.14)),'jsonld-video');}
    if(/VideoObject/i.test(type))acceptVisual(obj,'video',Math.min(99,86+Math.round(identity*.12)),'jsonld-videoobject');
  }
  return {gallery:uniqueItems(gallery),icons:uniqueItems(icons),author:uniqueItems(authors)[0]||null,authorUrl};
}

function parsePlanetMinecraftHtml(html, sourceUrl, context={}) {
  html=String(html||'');const provider='planetminecraft';
  if(isProviderCollectionUrl(sourceUrl)){
    const candidates=resolveProviderProjectLinks(html,sourceUrl,context);
    return {sourceUrl,title:htmlTitle(html),gallery:[],images:[],icon:null,author:null,authorUrl:'',provider,identity:0,exclusive:false,needsProjectResolution:true,resolvedCandidates:candidates,error:candidates.length?'Collection requires exact project resolution.':'No exact project title found in Planet Minecraft collection.'};
  }
  const base=sourceUrl,expected=context.title||'',actualTitle=htmlTitle(html),identity=pageIdentityConfidence({expectedTitle:expected,actualTitle,sourceUrl});
  if(expected&&identity<52)return {sourceUrl,title:actualTitle,gallery:[],icon:null,author:null,authorUrl:'',provider,identity,error:`Planet Minecraft identity mismatch (${identity}%)`};
  const boundaries=['>More like this<','More like this','Have something to say?','Want to comment','Update Logs','Join Planet Minecraft!','More Content by','More Texture Packs by','More Projects by','More Mods by','More Skins by','More Mob Skins by','More Data Packs by','More Maps by'];
  const lowerHtml=html.toLowerCase();let cut=html.length;for(const marker of boundaries){const i=lowerHtml.indexOf(marker.toLowerCase());if(i>=0&&i<cut)cut=i}
  const moreBy=/<h[1-6]\b[^>]*>[\s\S]{0,140}?\bmore\s+[^<]{0,90}\s+by\s+/i.exec(html);if(moreBy&&moreBy.index<cut)cut=moreBy.index;
  const bodyAt=lowerHtml.indexOf('<body'),bodyStart=bodyAt>=0?(lowerHtml.indexOf('>',bodyAt)+1||bodyAt):0,main=html.slice(bodyStart,cut);
  const canonical=canonicalUrl(sourceUrl),expectedNorm=normalizeIdentity(expected),items=[];let m;
  const imageRe=/(?:https?:)?(?:\\\/|\/){2}static\.planetminecraft\.com\/(?:files\/(?:image\/minecraft\/|resource_media\/)|images\/)[^"'<>\s\[\]\)]+/gi;
  while((m=imageRe.exec(main))){const u=absolute(m[0].replace(/\\\//g,'/'),base);if(!u)continue;if(/(?:avatar|badge|emoji|logo|favicon|advert|banner-ad|tracking)/i.test(u))continue;
    const around=stripTags(main.slice(Math.max(0,m.index-900),Math.min(main.length,m.index+m[0].length+900))),nearCanonical=around.toLowerCase().includes(canonical.toLowerCase())||around.toLowerCase().includes(String(new URL(sourceUrl).pathname).toLowerCase()),nearTitle=expectedNorm&&normalizeIdentity(around).includes(expectedNorm),pathProject=/\/files\/(?:image\/minecraft\/(?:texture-pack|mob-skin|skin|mod|data-pack|map|project|blog)|resource_media)\//i.test(u);
    let confidence=70+(identity>=80?12:identity>=60?6:0)+(nearCanonical?12:0)+(nearTitle?8:0)+(pathProject?6:0);items.push(mediaItem(u,{alt:expected||actualTitle||'Planet Minecraft project image',source:'planetminecraft-exact-project',provider,confidence:Math.min(100,confidence),identity}));}
  const canonicalEsc=String(sourceUrl).replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\/$/,'\\/?');
  const embedRe=new RegExp(`(?:\\[url=${canonicalEsc}\\][\\s\\S]{0,700}?\\[img\\]|<a[^>]+href=["']${canonicalEsc}["'][\\s\\S]{0,700}?<img[^>]+src=["'])((?:https?:)?(?:\\\\/|/){2}static\\.planetminecraft\\.com/[^\\[\\]"'<>\\s]+)`,'ig');
  while((m=embedRe.exec(main))){const u=absolute(m[1].replace(/\\\//g,'/'),base);if(u)items.push(mediaItem(u,{alt:expected||actualTitle,source:'planetminecraft-canonical-embed',provider,confidence:100,identity}))}
  for(const item of extractDirectPostVideos(main,sourceUrl,context,provider,identity))items.push(item);
  let authorUrl='';if(context.authorUrl&&providerForUrl(context.authorUrl)==='planetminecraft'&&!/\/texture-pack|\/collection\//i.test(new URL(context.authorUrl).pathname))authorUrl=canonicalUrl(context.authorUrl);
  if(!authorUrl)authorUrl=findProviderAuthorLink(main,sourceUrl,context,provider);
  const structured=structuredProviderData(main,sourceUrl,context,provider,identity);if(!authorUrl&&structured.authorUrl)authorUrl=structured.authorUrl;
  const author=boundAuthorAvatar(main,sourceUrl,authorUrl,context,provider,identity)||adjacentAuthorAvatar(main,sourceUrl,authorUrl,context,provider,identity)||structured.author;
  for(const item of structured.gallery)items.push(item);
  const gallery=uniqueItems(items).filter(x=>(x.confidence||0)>=72).filter(x=>x.url!==author?.url);
  return {sourceUrl,title:actualTitle,gallery,images:gallery,icon:null,author,authorUrl,provider,identity,exclusive:true,error:gallery.length||author?'':'Planet Minecraft did not expose project-owned live media in the canonical content region.'};
}
function parsePlanetMinecraftAuthorHtml(html, authorUrl, context={}) {
  html=String(html||'');const actualTitle=htmlTitle(html),expected=context.author||'',identity=expected?Math.round(Math.max(titleSimilarity(expected,actualTitle),slugSimilarity(expected,authorUrl))*100):78;
  if(expected&&identity<48)return null;
  const lower=html.toLowerCase();let cut=html.length;for(const marker of ['content gallery','subscribers','subscriptions','diamonds','favorites','trophy case']){const i=lower.indexOf(marker);if(i>=0&&i<cut)cut=i}
  const h1=bestH1Index(html,expected),start=Math.max(0,h1>=0?h1-12000:0),head=html.slice(start,Math.min(cut,h1>=0?h1+18000:cut)),candidates=[];
  const selfBound=boundAuthorAvatar(head,authorUrl,authorUrl,context,'planetminecraft',identity);if(selfBound)candidates.push({...selfBound,source:'planetminecraft-author-self-bound',confidence:100});
  const imageTag=/<img\b[^>]*>/ig;let m;
  while((m=imageTag.exec(head))){const tag=m[0],raw=attrValue(tag,'data-original')||attrValue(tag,'data-src')||attrValue(tag,'src'),u=absolute(raw,authorUrl);if(!u||!providerImageAllowed('planetminecraft',u))continue;const alt=attrValue(tag,'alt')||attrValue(tag,'title'),cls=`${attrValue(tag,'class')} ${attrValue(tag,'id')}`,hay=`${tag} ${alt} ${cls} ${u}`;let score=Math.round(identity*.28)+avatarBonus('planetminecraft',{url:u,alt,cls,parent:'profile'});if(expected&&titleSimilarity(expected,alt)>=.55)score+=24;if(/(?:member|profile|avatar|portrait|face)/i.test(hay))score+=36;if(/(?:content|submission|project|resource_media|trophy|badge|banner|advert)/i.test(hay))score-=65;const distance=h1>=0?Math.abs((start+m.index)-h1):0;score+=Math.max(0,20-Math.floor(distance/420));if(score>=72)candidates.push(mediaItem(u,{alt:alt||`${expected||'Creator'} Planet Minecraft avatar`,role:'author',source:'planetminecraft-author-profile-exact',provider:'planetminecraft',confidence:Math.min(100,score),identity}));}
  // PMC commonly publishes a profile image as social metadata. It is only accepted as a
  // final fallback on an exact /member/<name>/ page with strong identity.
  if(identity>=82){for(const key of ['og:image','twitter:image']){const raw=metaValue(html,key),u=absolute(raw,authorUrl);if(u&&providerImageAllowed('planetminecraft',u)&&!/logo|banner|trophy|content/i.test(u))candidates.push(mediaItem(u,{alt:`${expected||'Creator'} Planet Minecraft profile image`,role:'author',source:'planetminecraft-author-social-exact',provider:'planetminecraft',confidence:76,identity}));}}
  return uniqueItems(candidates)[0]||null;
}

function parseCurseForgeAuthorProjectHtml(html, authorUrl, context={}) {
  html=String(html||'');
  const expectedAuthor=String(context.author||'').trim(),expectedTitle=String(context.title||'').trim();
  let u;try{u=new URL(authorUrl)}catch{return {author:null,authorUrl:'',icon:null,projectUrl:''}}
  const slug=decodeURIComponent(u.pathname.split('/').filter(Boolean)[1]||'');
  const actualTitle=htmlTitle(html),authorIdentity=expectedAuthor?Math.round(Math.max(titleSimilarity(expectedAuthor,actualTitle),titleSimilarity(expectedAuthor,slug))*100):75;
  if(expectedAuthor&&authorIdentity<62)return {author:null,authorUrl:'',icon:null,projectUrl:'',identity:authorIdentity,error:'CurseForge author identity mismatch'};

  // Profile avatar is a different semantic role from project logos.  CurseForge marks it
  // explicitly as "profile avatar" next to the creator H1; never guess from generic
  // avatars/ paths because project logos also live under /avatars/ on ForgeCDN.
  let author=null;const authorH1=bestH1Index(html,expectedAuthor||slug);const profileStart=Math.max(0,authorH1>=0?authorH1-9000:0),profileEnd=Math.min(html.length,authorH1>=0?authorH1+9000:18000),profileRegion=html.slice(profileStart,profileEnd);
  const imgRe=/<img\b[^>]*>/ig;let im;const authorCandidates=[];
  while((im=imgRe.exec(profileRegion))){const tag=im[0],alt=attrValue(tag,'alt')||attrValue(tag,'title'),raw=attrValue(tag,'src')||attrValue(tag,'data-src')||attrValue(tag,'data-original')||attrValue(tag,'data-lazy-src'),media=absolute(raw,authorUrl);if(!media)continue;
    const hay=`${tag} ${alt} ${media}`;if(!/profile\s+avatar/i.test(hay))continue;if(/tier\s+(?:frame|icon)|badge|project\s+(?:image|logo)|advert|sponsor/i.test(hay))continue;
    let host='';try{host=new URL(media).hostname.toLowerCase()}catch{};if(!/(?:forgecdn|cursecdn)\.net$/.test(host))continue;
    const distance=authorH1>=0?Math.abs((profileStart+im.index)-authorH1):0,score=98-Math.min(18,Math.floor(distance/450));
    authorCandidates.push(mediaItem(media,{alt:`${expectedAuthor||slug} creator avatar`,role:'author',source:'curseforge-author-profile-exact',provider:'curseforge',confidence:score,identity:authorIdentity}));
  }
  author=uniqueItems(authorCandidates)[0]||null;

  // The creator Projects page is also an authoritative, compact icon index.  Find the
  // exact project link/title and bind only the adjacent "<project> logo" image to it.
  // This lets one shared author-page request seed many cards without touching unrelated
  // "More from" artwork on each project page.
  let icon=null,projectUrl='';
  if(expectedTitle){const anchorRe=/<a\b([^>]*\bhref\s*=\s*["'][^"']+["'][^>]*)>([\s\S]*?)<\/a>/ig;let am;const rows=[];
    while((am=anchorRe.exec(html))){const tag=`<a ${am[1]}>`,href=absolute(attrValue(tag,'href'),authorUrl),label=stripTags(am[2]);if(!href)continue;let pu;try{pu=new URL(href)}catch{continue};if(!/(?:^|\.)curseforge\.com$/i.test(pu.hostname)||!/^\/minecraft\/(?:mc-mods|texture-packs|resource-packs|modpacks|bukkit-plugins|customization|worlds)\/[^/]+\/?$/i.test(pu.pathname))continue;
      const sim=titleSimilarity(expectedTitle,label);if(sim<.78)continue;rows.push({index:am.index,href,label,sim});
    }
    rows.sort((a,b)=>b.sim-a.sim);const row=rows[0];
    if(row){projectUrl=row.href;const regionStart=Math.max(0,row.index-5200),regionEnd=Math.min(html.length,row.index+3000),region=html.slice(regionStart,regionEnd),candidates=[];const re=/<img\b[^>]*>/ig;let m;
      while((m=re.exec(region))){const tag=m[0],alt=attrValue(tag,'alt')||attrValue(tag,'title'),raw=attrValue(tag,'src')||attrValue(tag,'data-src')||attrValue(tag,'data-original')||attrValue(tag,'data-lazy-src'),media=absolute(raw,authorUrl);if(!media)continue;let host='';try{host=new URL(media).hostname.toLowerCase()}catch{};if(!/(?:forgecdn|cursecdn)\.net$/.test(host))continue;
        const hay=`${tag} ${alt} ${media}`;if(/profile\s+avatar|tier\s+(?:frame|icon)|badge|advert|sponsor|battlegrounds|ugc[ -]?contest/i.test(hay))continue;const sim=titleSimilarity(expectedTitle,alt);if(sim<.68||!/(?:logo|project\s+image|project\s+icon)/i.test(hay))continue;
        const absoluteIndex=regionStart+m.index,distance=Math.abs(absoluteIndex-row.index);let score=82+Math.round(sim*12)+Math.max(0,6-Math.floor(distance/650));
        const pair=curseForgeFullAndPreview(media);candidates.push(mediaItem(pair.url,{previewUrl:pair.previewUrl,alt:alt||`${expectedTitle} project icon`,role:'icon',source:'curseforge-author-project-index-exact',provider:'curseforge',confidence:Math.min(100,score),identity:Math.round(row.sim*100)}));
      }
      icon=uniqueItems(candidates)[0]||null;
    }
  }
  return {author,authorUrl:canonicalUrl(authorUrl),icon,projectUrl,identity:authorIdentity,error:''};
}

function parseProviderAuthorHtml(html, authorUrl, context={}) {
  html=String(html||'');const provider=providerForUrl(authorUrl);if(provider==='planetminecraft')return parsePlanetMinecraftAuthorHtml(html,authorUrl,context);if(provider==='curseforge')return parseCurseForgeAuthorProjectHtml(html,authorUrl,context).author;
  const expected=context.author||'',actualTitle=htmlTitle(html),identity=expected?Math.round(Math.max(titleSimilarity(expected,actualTitle),slugSimilarity(expected,authorUrl))*100):72;if(expected&&identity<42)return null;
  const candidates=[];const h1=bestH1Index(html,expected),start=Math.max(0,h1>=0?h1-10000:0),region=(h1>=0?html.slice(start,Math.min(html.length,h1+18000)):scopedProviderRegion(html,provider,{title:expected}));
  const self=boundAuthorAvatar(region,authorUrl,authorUrl,context,provider,identity);if(self)candidates.push({...self,source:`${provider}-author-self-bound`,confidence:100});
  const adjacent=adjacentAuthorAvatar(region,authorUrl,authorUrl,context,provider,identity);if(adjacent)candidates.push({...adjacent,source:`${provider}-author-adjacent-bound`});
  // Schema.org Person/ProfilePage data is a cheap, role-safe creator lane on many sites.
  for(const obj of jsonLdNodes(html)){const type=[obj?.['@type']].flat().join(' '),name=String(obj?.name||obj?.headline||''),sim=expected?titleSimilarity(expected,name):.7;if(!/(?:Person|Organization|ProfilePage)/i.test(type)||expected&&sim<.55)continue;for(const raw of [obj.image,obj.thumbnailUrl,obj.logo].flat()){const u=structuredUrl(raw,authorUrl);if(!u||!providerImageAllowed(provider,u))continue;if(/(?:badge|banner|cover|product|project|gallery|screenshot|advert|sponsor)/i.test(`${u} ${name}`))continue;candidates.push(mediaItem(u,{alt:`${expected||name||'Creator'} avatar`,role:'author',source:`${provider}-author-jsonld-exact`,provider,confidence:Math.min(99,84+Math.round(sim*15)),identity:Math.max(identity,Math.round(sim*100))}));}}
  const re=/<img\b[^>]*>/ig;let m;while((m=re.exec(region))){const tag=m[0],raw=attrValue(tag,'data-original')||attrValue(tag,'data-src')||attrValue(tag,'src'),u=absolute(raw,authorUrl);if(!u||!providerImageAllowed(provider,u))continue;const alt=attrValue(tag,'alt')||attrValue(tag,'title'),cls=`${attrValue(tag,'class')} ${attrValue(tag,'id')}`,hay=`${tag} ${alt} ${u}`;let score=32+Math.round(identity*.25)+avatarBonus(provider,{url:u,alt,cls,parent:'profile'});if(expected&&titleSimilarity(expected,alt)>=.55)score+=26;if(/avatar|profile|author|creator|member|portrait|headshot/i.test(hay))score+=28;if(/badge|emoji|advert|product image|project image|cover|banner|gallery|screenshot/i.test(hay))score-=60;const distance=h1>=0?Math.abs((start+m.index)-h1):0;score+=Math.max(0,16-Math.floor(distance/500));if(score>=70)candidates.push(mediaItem(u,{alt:alt||`${expected||'Creator'} avatar`,role:'author',source:`${provider}-author-profile-exact`,provider,confidence:Math.min(100,score),identity}))}
  // Exact creator/profile pages frequently expose the avatar as social metadata. Accept
  // it only with strong creator identity and a provider-recognized author URL.
  if(identity>=82&&authorPathMatch(provider,authorUrl)){for(const key of ['og:image','twitter:image']){const u=absolute(metaValue(html,key),authorUrl);if(!u||!providerImageAllowed(provider,u)||/(?:logo|banner|cover|project|product|gallery|screenshot|badge|advert|sponsor)/i.test(u))continue;candidates.push(mediaItem(u,{alt:`${expected||'Creator'} profile image`,role:'author',source:`${provider}-author-social-exact`,provider,confidence:78,identity}));}}
  return uniqueItems(candidates)[0]||null;
}

function parseProviderHeadMedia(html, sourceUrl, context={}) {
  html=String(html||'');const provider=providerForUrl(sourceUrl);
  if(provider==='curseforge'){const parsed=parseCurseForgeProjectHtml(html,sourceUrl,context);return (parsed?.icon||parsed?.gallery?.length||parsed?.author)?{...parsed,headOnly:true}:null;}
  // Index/collection/profile pages cannot safely expose project media until the exact
  // child is resolved. Planet Minecraft is intentionally excluded from head-only
  // painting because some PMC pages expose non-canonical social imagery.
  if(isProviderCollectionUrl(sourceUrl)||provider==='planetminecraft')return null;
  const actualTitle=htmlTitle(html),identity=pageIdentityConfidence({expectedTitle:context.title||'',actualTitle,sourceUrl});
  if(context.title&&identity<58)return null;
  const gallery=[];
  for(const [key,bonus] of [['og:image',18],['twitter:image',12],['twitter:image:src',10]]){
    const raw=metaValue(html,key),u=absolute(raw,sourceUrl);if(!u||!projectMetaImageAllowed(provider,u))continue;
    gallery.push(mediaItem(u,{alt:context.title||actualTitle||'official project preview',source:`${provider}-head-meta`,provider,confidence:Math.min(97,identity+bonus),identity}));
  }
  const items=uniqueItems(gallery).filter(x=>(x.confidence||0)>=72);
  if(!items.length)return null;
  return {sourceUrl,title:actualTitle,gallery:items,images:items,icon:null,author:null,authorUrl:'',provider,identity,exclusive:false,headOnly:true,error:''};
}
function explicitProjectIconCandidate(item, provider='generic') {
  if(!item?.url)return false;const hay=`${item.url} ${item.alt||''} ${item.source||''}`;
  if(/profile|author|creator|member|user\s*avatar|tier|badge/i.test(hay))return false;
  let u;try{u=new URL(item.url)}catch{return false};const p=u.pathname.toLowerCase();
  if(/(?:project|resource|mod)[ _-]?(?:icon|logo)|\blogo\b/i.test(hay))return true;
  if(provider==='spigot'&&/\/data\/resource_icons\//i.test(p))return true;
  if(provider==='gitlab'&&/(?:\/avatar(?:$|[?#])|\/project\/avatar\/)/i.test(p))return true;
  if(provider==='hangar'&&/\/projects\/[^/]+\/avatar/i.test(p))return true;
  if(provider==='builtbybit'&&/\/data\/resource_icons\//i.test(p))return true;
  return false;
}
function parseGenericProjectHtml(html, sourceUrl, context={}) {
  html=String(html||'');const provider=providerForUrl(sourceUrl);if(provider==='curseforge')return parseCurseForgeProjectHtml(html,sourceUrl,context);const actualTitle=htmlTitle(html),identity=pageIdentityConfidence({expectedTitle:context.title||'',actualTitle,sourceUrl});
  if(context.title&&identity<46){const candidates=isProviderCollectionUrl(sourceUrl)?resolveProviderProjectLinks(html,sourceUrl,context):[];return {sourceUrl,title:actualTitle,gallery:[],images:[],icon:null,author:null,authorUrl:'',provider,identity,exclusive:false,needsProjectResolution:!!candidates.length,resolvedCandidates:candidates,error:candidates.length?'Provider page requires exact child-project resolution.':`Source identity mismatch (${identity}%)`};}
  const gallery=[],iconCandidates=[];
  for(const [key,bonus] of [['og:image',14],['twitter:image',10],['twitter:image:src',8]]){const raw=metaValue(html,key),u=absolute(raw,sourceUrl);if(u&&projectMetaImageAllowed(provider,u))gallery.push(mediaItem(u,{alt:context.title||actualTitle||'official project preview',role:'gallery',source:`${provider}-page-meta`,provider,confidence:Math.min(96,identity+bonus),identity}))}
  for(const item of extractProviderImages(html,sourceUrl,context,provider,identity)){if(explicitProjectIconCandidate(item,provider))iconCandidates.push({...item,role:'icon'});else gallery.push({...item,role:'gallery'})}
  const scriptRe=/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/ig;let sm;
  while((sm=scriptRe.exec(html))){try{const root=JSON.parse(decodeHtml(sm[1])),queue=Array.isArray(root)?[...root]:[root];for(const obj of queue){if(!obj||typeof obj!=='object')continue;const name=obj.name||obj.headline||obj.alternateName||'',objUrl=obj.url||obj.mainEntityOfPage||'',objIdentity=Math.max(titleSimilarity(context.title||'',name),canonicalUrl(objUrl)===canonicalUrl(sourceUrl)?1:0);if(context.title&&objIdentity<.5)continue;
        for(const raw of [obj.image,obj.thumbnailUrl].flat().map(x=>typeof x==='string'?x:x?.url).filter(Boolean)){const u=absolute(raw,sourceUrl);if(u&&providerImageAllowed(provider,u))gallery.push(mediaItem(u,{alt:context.title||name||actualTitle,role:'gallery',source:`${provider}-jsonld-exact`,provider,confidence:Math.min(98,70+Math.round(objIdentity*28)),identity:Math.round(objIdentity*100)}))}
        for(const raw of [obj.logo].flat().map(x=>typeof x==='string'?x:x?.url).filter(Boolean)){const u=absolute(raw,sourceUrl);if(u&&providerImageAllowed(provider,u))iconCandidates.push(mediaItem(u,{alt:`${context.title||name||actualTitle} project logo`,role:'icon',source:`${provider}-jsonld-logo-exact`,provider,confidence:Math.min(99,76+Math.round(objIdentity*23)),identity:Math.round(objIdentity*100)}))}
      }}catch{}}
  const structured=structuredProviderData(html,sourceUrl,context,provider,identity);for(const item of structured.gallery)gallery.push(item);for(const item of structured.icons)iconCandidates.push(item);
  let authorUrl=findProviderAuthorLink(html,sourceUrl,context,provider)||structured.authorUrl,author=null,u;author=boundAuthorAvatar(html,sourceUrl,authorUrl,context,provider,identity)||adjacentAuthorAvatar(html,sourceUrl,authorUrl,context,provider,identity)||structured.author;try{u=new URL(sourceUrl)}catch{}
  if(provider==='github'&&u){const parts=u.pathname.split('/').filter(Boolean);if(parts.length>=2){const owner=parts[0];authorUrl=`https://github.com/${encodeURIComponent(owner)}`;author=mediaItem(`https://github.com/${encodeURIComponent(owner)}.png?size=160`,{alt:`${owner} GitHub avatar`,role:'author',source:'github-owner-avatar',provider:'github',confidence:100,identity:100})}}
  const items=uniqueItems(gallery).filter(x=>(x.confidence||0)>=60&&x.url!==author?.url),icons=uniqueItems(iconCandidates).filter(x=>(x.confidence||0)>=68&&x.url!==author?.url),icon=icons[0]||null;
  const knownExclusive=['mcpedl','modbay','fourthwall','booth','afdian','patreon','minecraft-marketplace','kofi','itch','gumroad','hangar','spigot','bukkit','builtbybit','nexusmods','moddb','polymart','gitlab'].includes(provider)&&(items.length>0||!!icon);
  return {sourceUrl,title:actualTitle,gallery:items,images:items,icon,author,authorUrl,provider,identity,exclusive:knownExclusive,error:(items.length||icon)?'':'No project-owned page metadata passed identity checks.'};
}

module.exports={decodeHtml,stripTags,normalizeIdentity,titleSimilarity,slugSimilarity,providerForUrl,canonicalUrl,contextFingerprint,pageIdentityConfidence,parsePlanetMinecraftHtml,parsePlanetMinecraftAuthorHtml,parseCurseForgeAuthorProjectHtml,parseProviderAuthorHtml,parseGenericProjectHtml,parseProviderHeadMedia,parseCurseForgeProjectHtml,parseCurseForgeGalleryStreamSeed,resolveProviderProjectLinks,isProviderCollectionUrl,providerImageAllowed,providerMediaAllowed,extractDirectPostVideos,findProviderAuthorLink,boundAuthorAvatar,adjacentAuthorAvatar,structuredProviderData,jsonLdNodes,uniqueItems,curseForgeFullAndPreview};
