'use strict';

// Provider capability registry for cold-start live-media discovery.  This module is
// intentionally dependency-free because it runs in every network transport (Node,
// Chromium orchestration, wreq and impit).  It describes identity/routing and trusted
// media CDNs only; it never fabricates media URLs.
const PROVIDERS=[
  {id:'planetminecraft',hosts:['planetminecraft.com']},
  {id:'modrinth',hosts:['modrinth.com']},
  {id:'curseforge',hosts:['curseforge.com']},
  {id:'github',hosts:['github.com']},
  {id:'gitlab',hosts:['gitlab.com']},
  {id:'hangar',hosts:['hangar.papermc.io']},
  {id:'spigot',hosts:['spigotmc.org']},
  {id:'bukkit',hosts:['dev.bukkit.org']},
  {id:'builtbybit',hosts:['builtbybit.com']},
  {id:'nexusmods',hosts:['nexusmods.com']},
  {id:'moddb',hosts:['moddb.com']},
  {id:'polymart',hosts:['polymart.org']},
  {id:'mcpedl',hosts:['mcpedl.com']},
  {id:'modbay',hosts:['modbay.org']},
  {id:'afdian',hosts:['afdian.com']},
  {id:'patreon',hosts:['patreon.com']},
  {id:'minecraft-marketplace',hosts:['minecraft.net']},
  {id:'booth',hosts:['booth.pm']},
  {id:'fourthwall',hosts:['fourthwall.com','fourthwall.dev']},
  {id:'kofi',hosts:['ko-fi.com']},
  {id:'itch',hosts:['itch.io']},
  {id:'gumroad',hosts:['gumroad.com']},
  {id:'alltheysm',hosts:['alltheysm.top']}
];

function hostMatches(host,root){return host===root||host.endsWith(`.${root}`)}
function providerForUrl(raw=''){
  let host='';try{host=new URL(raw).hostname.toLowerCase().replace(/^www\./,'')}catch{return 'generic'}
  for(const row of PROVIDERS)if(row.hosts.some(root=>hostMatches(host,root)))return row.id;
  return 'generic';
}

const TRUSTED_MEDIA_HOSTS=[
  /(?:^|\.)media(?:filez)?\.forgecdn\.net$/i,
  /(?:^|\.)edge\.forgecdn\.net$/i,
  /(?:^|\.)media\.cursecdn\.com$/i,
  /(?:^|\.)cdn\.modrinth\.com$/i,
  /(?:^|\.)raw\.githubusercontent\.com$/i,
  /(?:^|\.)user-images\.githubusercontent\.com$/i,
  /(?:^|\.)avatars\.githubusercontent\.com$/i,
  /(?:^|\.)opengraph\.githubassets\.com$/i,
  /(?:^|\.)gitlab\.com$/i,
  /(?:^|\.)hangar\.papermc\.io$/i,
  /(?:^|\.)hangarcdn\.papermc\.io$/i,
  /(?:^|\.)spigotmc\.org$/i,
  /(?:^|\.)dev\.bukkit\.org$/i,
  /(?:^|\.)builtbybit\.com$/i,
  /(?:^|\.)staticdelivery\.nexusmods\.com$/i,
  /(?:^|\.)images\.nexusmods\.com$/i,
  /(?:^|\.)media\.moddb\.com$/i,
  /(?:^|\.)polymart\.org$/i,
  /(?:^|\.)static\.planetminecraft\.com$/i,
  /(?:^|\.)r2\.mcpedl\.com$/i,
  /(?:^|\.)mcpedl\.com$/i,
  /(?:^|\.)modbay\.org$/i,
  /(?:^|\.)afdiancdn\.com$/i,
  /(?:^|\.)afdian\.com$/i,
  /(?:^|\.)pximg\.net$/i,
  /(?:^|\.)booth\.pm$/i,
  /(?:^|\.)imgproxy\.fourthwall\.dev$/i,
  /(?:^|\.)fourthwall\.(?:com|dev)$/i,
  /(?:^|\.)patreonusercontent\.com$/i,
  /(?:^|\.)patreon\.com$/i,
  /(?:^|\.)storage\.ko-fi\.com$/i,
  /(?:^|\.)images\.ko-fi\.com$/i,
  /(?:^|\.)ko-fi\.com$/i,
  /(?:^|\.)img\.itch\.zone$/i,
  /(?:^|\.)itch\.zone$/i,
  /(?:^|\.)itch\.io$/i,
  /(?:^|\.)gumroadusercontent\.com$/i,
  /(?:^|\.)gumroad\.com$/i,
  /(?:^|\.)minecraft\.net$/i,
  /(?:^|\.)xboxlive\.com$/i,
  /(?:^|\.)xboxservices\.com$/i,
  /(?:^|\.)store-images\.s-microsoft\.com$/i,
  /(?:^|\.)compass-ssl\.xbox\.com$/i,
  /(?:^|\.)assets\.xboxservices\.com$/i,
  /(?:^|\.)alltheysm\.top$/i
];
const IMAGE_PATH_RE=/\.(?:avif|bmp|gif|jpe?g|png|webp)(?:$|[?#])/i;
const KNOWN_MEDIA_PATH_RE=/(?:\/attachments\/|\/files\/image\/minecraft\/|\/resource_media\/|\/uploads\/posts\/|\/patreon-media\/|\/image\/upload\/|\/imgproxy\/|\/submissions\/|\/data\/resource_icons\/|\/api\/v4\/projects\/[^/]+\/avatar(?:$|[?#])|\/api\/v1\/projects\/[^/]+\/avatar(?:$|[?#])|\/uploads\/-\/system\/project\/avatar\/)/i;
const URL_CANDIDATE_RE=/https?:\/\/[^\s"'<>\\]+(?=[\s"'<>])/ig;

function isTrustedMediaUrl(raw=''){
  let u;try{u=new URL(String(raw).replace(/\\\//g,'/'))}catch{return false}
  if(!/^https?:$/.test(u.protocol))return false;
  const host=u.hostname.toLowerCase(),whole=`${u.pathname}${u.search}`;
  if(/(?:doubleclick|googlesyndication|google-analytics|facebook|tracking|pixel)/i.test(host+whole))return false;
  if(/(?:^|\.)media\.moddb\.com$/i.test(host)&&/\/images\/global\//i.test(whole))return false;
  if(!TRUSTED_MEDIA_HOSTS.some(re=>re.test(host)))return false;
  // Known media CDNs can use opaque paths without an extension, but same-site provider
  // pages must still look image-like so a project URL is never mistaken for an image.
  const opaqueCdn=/(?:forgecdn|cursecdn|modrinth|githubusercontent|githubassets|planetminecraft|afdiancdn|pximg|imgproxy\.fourthwall|patreonusercontent|storage\.ko-fi|images\.ko-fi|img\.itch\.zone|gumroadusercontent|xboxlive|xboxservices|staticdelivery\.nexusmods|images\.nexusmods|hangarcdn\.papermc)/i.test(host);
  return opaqueCdn||IMAGE_PATH_RE.test(whole)||KNOWN_MEDIA_PATH_RE.test(whole);
}
function firstTrustedMediaUrl(text=''){
  URL_CANDIDATE_RE.lastIndex=0;let m;const input=String(text||'');
  while((m=URL_CANDIDATE_RE.exec(input))){const raw=m[0].replace(/&amp;/gi,'&').replace(/\\\//g,'/');if(isTrustedMediaUrl(raw))return raw;}
  return '';
}
function mediaMarkerMatched(text=''){
  const input=String(text||'');
  if(firstTrustedMediaUrl(input))return true;
  for(const re of [
    /<meta\b[^>]+(?:property|name)=["'](?:og:image|twitter:image|twitter:image:src)["'][^>]+content=["']([^"']+)["']/ig,
    /<meta\b[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image|twitter:image:src)["']/ig
  ]){let m;while((m=re.exec(input))){const raw=String(m[1]||'').replace(/&amp;/gi,'&').replace(/\\\//g,'/');if(isTrustedMediaUrl(raw))return true;}}
  return false;
}

const ORIGIN_HINTS={
  curseforge:['https://media.forgecdn.net','https://edge.forgecdn.net'],
  modrinth:['https://cdn.modrinth.com'],
  github:['https://avatars.githubusercontent.com','https://opengraph.githubassets.com','https://raw.githubusercontent.com'],
  gitlab:['https://gitlab.com'],
  hangar:['https://hangar.papermc.io'],
  spigot:['https://www.spigotmc.org','https://api.spiget.org'],
  bukkit:['https://dev.bukkit.org','https://media.forgecdn.net'],
  builtbybit:['https://builtbybit.com'],
  nexusmods:['https://www.nexusmods.com','https://staticdelivery.nexusmods.com'],
  moddb:['https://www.moddb.com','https://media.moddb.com'],
  polymart:['https://polymart.org'],
  planetminecraft:['https://static.planetminecraft.com'],
  mcpedl:['https://r2.mcpedl.com'],
  modbay:['https://modbay.org'],
  afdian:['https://afdian.com','https://pic1.afdiancdn.com'],
  patreon:['https://c10.patreonusercontent.com'],
  'minecraft-marketplace':['https://www.minecraft.net','https://store-images.s-microsoft.com','https://images-eds-ssl.xboxlive.com'],
  booth:['https://booth.pximg.net'],
  fourthwall:['https://imgproxy.fourthwall.dev'],
  kofi:['https://storage.ko-fi.com'],
  itch:['https://img.itch.zone'],
  gumroad:['https://gumroad.com'],
  alltheysm:['https://alltheysm.top']
};
function providerOriginHints(provider){return [...(ORIGIN_HINTS[String(provider||'')]||[])]}
function allProviderOriginHints(){return [...new Set(Object.values(ORIGIN_HINTS).flat())]}

function transportPolicy(provider){
  provider=String(provider||'generic');
  // Keep one complete response for uncapped enrichment; other native lanes may end
  // immediately after first trusted media.  Login/session-sensitive providers keep the
  // Chromium response; WAF-heavy CurseForge keeps Chromium+wreq; static SSR sites keep
  // Node plus Chromium only when necessary.  This is bandwidth control, not content capping.
  if(provider==='curseforge')return {full:new Set(['chromium','wreq']),probe:new Set(['node']),disabled:new Set(['impit']),dom:true,h3:true};
  if(provider==='builtbybit')return {full:new Set(),probe:new Set(),disabled:new Set(['node','chromium','wreq','impit']),dom:true,h3:false,browserOnly:true,browserNavigationOnly:true};
  if(['patreon','afdian','minecraft-marketplace','kofi','nexusmods'].includes(provider))return {full:new Set(['chromium']),probe:new Set(['node']),disabled:new Set(['wreq','impit']),dom:true,h3:true};
  if(['planetminecraft','mcpedl','modbay','booth','fourthwall','itch','gumroad','alltheysm','hangar','spigot','bukkit','moddb','gitlab','polymart'].includes(provider))return {full:new Set(['node']),probe:new Set(['chromium']),disabled:new Set(['wreq','impit']),dom:false,h3:false};
  return {full:new Set(['chromium']),probe:new Set(['node']),disabled:new Set(['wreq','impit']),dom:false,h3:false};
}

module.exports={PROVIDERS,providerForUrl,isTrustedMediaUrl,firstTrustedMediaUrl,mediaMarkerMatched,providerOriginHints,allProviderOriginHints,transportPolicy};
