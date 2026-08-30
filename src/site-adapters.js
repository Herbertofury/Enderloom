'use strict';

// Provider-specific identity/media behavior lives here instead of being scattered across
// scraper branches.  Adapters only classify URLs/markup that the provider actually
// exposes; they never synthesize project media.
const ADAPTERS={
  planetminecraft:{exactProject:[/^\/(?:texture-pack|project|mod|mob-skin|skin|data-pack|map|blog)\/[^/]+\/?$/i],author:[/^\/member\/[^/]+\/?$/i],postHints:/(?:resource_media|files\/image\/minecraft|showcase|content-image|gallery|submission)/i,avatarHints:/(?:member|profile|avatar|portrait)/i},
  curseforge:{exactProject:[/^\/minecraft\/(?:mc-mods|texture-packs|resource-packs|modpacks|bukkit-plugins|customization|worlds)\/[^/]+\/?$/i],author:[/^\/members\/[^/]+(?:\/projects)?\/?$/i],postHints:/(?:gallery|screenshot|attachments\/)/i,avatarHints:/(?:profile\s*avatar|author\s*avatar|creator\s*avatar)/i},
  modrinth:{exactProject:[/^\/(?:mod|plugin|resourcepack|datapack|modpack|shader)\/[^/]+\/?$/i,/^\/project\/[^/]+\/?$/i],author:[/^\/(?:user|organization)\/[^/]+\/?$/i],postHints:/(?:gallery|cdn\.modrinth)/i,avatarHints:/(?:avatar|profile)/i},
  github:{exactProject:[/^\/[^/]+\/[^/]+\/?$/i],author:[/^\/[^/]+\/?$/i],postHints:/(?:user-images|raw\.githubusercontent|opengraph)/i,avatarHints:/(?:avatar|profile)/i},
  gitlab:{exactProject:[/^\/[^/]+\/[^/]+(?:\/.*)?$/i],author:[/^\/[^/]+\/?$/i,/^\/groups\/[^/]+\/?$/i],postHints:/(?:uploads|project\/avatar|artifacts)/i,avatarHints:/(?:avatar|profile|user)/i},
  hangar:{exactProject:[/^\/[^/]+\/[^/]+\/?$/i],author:[/^\/[^/]+\/?$/i],postHints:/(?:gallery|description|hangarcdn)/i,avatarHints:/(?:avatar|profile)/i},
  spigot:{exactProject:[/^\/resources\/(?:[^/]*\.)?\d+\/?$/i],author:[/^\/members\/(?:[^/]*\.)?\d+\/?$/i],postHints:/(?:attachments|resource_icons|bbcode)/i,avatarHints:/(?:avatar|member|profile)/i},
  bukkit:{exactProject:[/^\/projects\/[^/]+\/?$/i],author:[/^\/members\/[^/]+\/?$/i,/^\/users\/[^/]+\/?$/i],postHints:/(?:attachments|description|forgecdn)/i,avatarHints:/(?:avatar|member|profile)/i},
  builtbybit:{exactProject:[/^\/resources\/(?:[^/]*\.)?\d+\/?$/i],author:[/^\/members\/(?:[^/]*\.)?\d+\/?$/i],postHints:/(?:attachments|resource_icons|carousel|screenshots)/i,avatarHints:/(?:avatar|member|profile)/i},
  nexusmods:{exactProject:[/^\/[^/]+\/mods\/\d+\/?$/i],author:[/^\/users\/\d+\/?$/i,/^\/profile\/[^/]+\/?$/i],postHints:/(?:images|gallery|screenshots|staticdelivery)/i,avatarHints:/(?:avatar|profile|user)/i},
  moddb:{exactProject:[/^\/mods\/[^/]+\/?$/i],author:[/^\/members\/[^/]+\/?$/i],postHints:/(?:images|screenshots|media\.moddb)/i,avatarHints:/(?:avatar|member|profile)/i},
  polymart:{exactProject:[/^\/(?:resource\/(?:[^/]*\.)?\d+|product\/\d+\/[^/]+)\/?$/i],author:[/^\/(?:user|profile)\/[^/]+\/?$/i],postHints:/(?:gallery|screenshots|resource)/i,avatarHints:/(?:avatar|profile|user)/i},
  mcpedl:{exactProject:[/^\/[^/]+\/?$/i],author:[/^\/(?:user|author|members?)\/[^/]+\/?$/i],postHints:/(?:r2\.mcpedl|gallery|screenshots|wp-content\/uploads)/i,avatarHints:/(?:avatar|author|profile)/i},
  modbay:{exactProject:[/^\/(?:mods|textures|maps|addons)\/[^/]+\/?$/i,/^\/[^/]+\/?$/i],author:[/^\/(?:user|author|members?)\/[^/]+\/?$/i],postHints:/(?:uploads|gallery|screenshots)/i,avatarHints:/(?:avatar|author|profile)/i},
  afdian:{exactProject:[/^\/p\/[a-z0-9-]+\/?$/i],author:[/^\/a\/[^/]+\/?$/i],postHints:/(?:vm-pic|img-pre|post|article|content|afdiancdn)/i,avatarHints:/(?:avatar|head|portrait|user|creator)/i,opaqueProjectIdentity:92},
  patreon:{exactProject:[/^\/posts\/(?:[^/]+-)?\d+\/?$/i,/^\/(?:c\/[^/]+\/|[^/]+\/)?shop\/[^/]+-\d+\/?$/i],author:[/^\/c\/[^/]+\/?$/i,/^\/[^/]+\/?$/i],postHints:/(?:post|media|image|video|patreonusercontent)/i,avatarHints:/(?:avatar|profile|creator)/i,opaqueProjectIdentity:90},
  'minecraft-marketplace':{exactProject:[/^\/(?:[a-z]{2}-[a-z]{2}\/)?marketplace\/pdp\/[0-9a-f-]{32,36}\/?$/i],author:[],postHints:/(?:marketplace|screenshot|carousel|hero)/i,avatarHints:/(?:creator|profile|avatar)/i,opaqueProjectIdentity:94},
  booth:{exactProject:[/^\/(?:[a-z]{2}\/)?items\/\d+\/?$/i],author:[/^\/?$/i],postHints:/(?:item|product|pximg|gallery)/i,avatarHints:/(?:shop|avatar|profile)/i,opaqueProjectIdentity:90},
  fourthwall:{exactProject:[/^\/products\/[^/]+\/?$/i],author:[/^\/?$/i],postHints:/(?:product|carousel|gallery|imgproxy)/i,avatarHints:/(?:avatar|creator|profile)/i},
  kofi:{exactProject:[/^\/s\/[a-z0-9_-]+\/?$/i],author:[/^\/[^/]+\/?$/i],postHints:/(?:shop|gallery|image|storage\.ko-fi)/i,avatarHints:/(?:avatar|profile|creator)/i,opaqueProjectIdentity:88},
  itch:{exactProject:[/^\/[^/]+\/?$/i],author:[/^\/?$/i],postHints:/(?:screenshot|gallery|img\.itch\.zone|game_cell)/i,avatarHints:/(?:avatar|profile|user)/i},
  gumroad:{exactProject:[/^\/l\/[^/]+\/?$/i],author:[/^\/[^/]+\/?$/i,/^\/?$/i],postHints:/(?:product|gallery|gumroadusercontent)/i,avatarHints:/(?:avatar|profile|creator)/i,opaqueProjectIdentity:88},
  alltheysm:{exactProject:[/.+/],author:[/^\/[^/]+\/?$/i],postHints:/(?:post|gallery|media|image)/i,avatarHints:/(?:avatar|profile|creator)/i}
};
const REJECT_MEDIA=/(?:badge|emoji|favicon|site[-_ ]?logo|brand[-_ ]?logo|advert|advertisement|sponsor|tracking|pixel|navbar|menu|footer|recommend|related|similar|prize\s*pool|contest)/i;
const VIDEO_EXT=/\.(?:mp4|webm|ogv|mov|m4v|m3u8)(?:$|[?#])/i;
const GIF_EXT=/\.gif(?:$|[?#])/i;

function adapterFor(provider='generic'){return ADAPTERS[String(provider||'generic')]||{exactProject:[],author:[],postHints:/(?:gallery|screenshot|media|post|content)/i,avatarHints:/(?:avatar|profile|author|creator|member|portrait)/i}}
function pathMatches(list=[],pathname=''){return list.some(re=>re.test(String(pathname||'')))}
function exactProjectIdentityFloor(provider, rawUrl=''){
  let u;try{u=new URL(rawUrl)}catch{return 0}const a=adapterFor(provider);if(!pathMatches(a.exactProject,u.pathname))return 0;return Number(a.opaqueProjectIdentity||0)
}
function authorPathMatch(provider, rawUrl=''){
  let u;try{u=new URL(rawUrl)}catch{return false}return pathMatches(adapterFor(provider).author,u.pathname)
}
function mediaKind(raw='',tag=''){
  if(String(tag).toLowerCase()==='video'||VIDEO_EXT.test(String(raw)))return 'video';
  if(GIF_EXT.test(String(raw)))return 'gif';
  return 'image';
}
function authorLinkBonus(provider, rawUrl='', text=''){
  const a=adapterFor(provider);let bonus=authorPathMatch(provider,rawUrl)?32:0;
  if(/\b(?:by|author|creator|owner|developer|member|profile)\b/i.test(String(text||'')))bonus+=20;
  if(a.avatarHints.test(String(text||'')))bonus+=8;
  return bonus;
}
function postMediaBonus(provider, meta={}){
  const a=adapterFor(provider),hay=`${meta.url||''} ${meta.alt||''} ${meta.cls||''} ${meta.parent||''} ${meta.tag||''}`;let score=0;
  if(a.postHints.test(hay))score+=28;
  if(meta.kind==='video')score+=34;
  if(meta.kind==='gif')score+=12;
  if(provider==='afdian'&&/(?:\bvm-pic\b|\bimg-pre\b)/i.test(hay))score+=48;
  if(provider==='afdian'&&/afdiancdn\.com/i.test(String(meta.url||'')))score+=22;
  if(provider==='planetminecraft'&&/(?:resource_media|files\/image\/minecraft)/i.test(String(meta.url||'')))score+=24;
  if(REJECT_MEDIA.test(hay))score-=90;
  return score;
}
function avatarBonus(provider, meta={}){
  const a=adapterFor(provider),hay=`${meta.url||''} ${meta.alt||''} ${meta.cls||''} ${meta.parent||''}`;let score=0;
  if(a.avatarHints.test(hay))score+=42;
  if(meta.boundToExactAuthor)score+=58;
  if(REJECT_MEDIA.test(hay)||/(?:project[-_ ]?(?:image|icon)|cover|banner|product[-_ ]?image)/i.test(hay))score-=90;
  return score;
}
function providerFullAndPreview(provider, rawUrl=''){
  let u;try{u=new URL(rawUrl)}catch{return {url:rawUrl,previewUrl:''}}
  if(provider==='afdian'&&/(?:imageView2|watermark|imageMogr2)/i.test(u.search)){
    const preview=u.toString();u.search='';u.hash='';return {url:u.toString(),previewUrl:preview};
  }
  return {url:u.toString(),previewUrl:''};
}

function ownedMediaMarker(provider, text='', sourceUrl=''){
  const input=String(text||'');
  if(provider==='afdian'){
    let exact=false;try{exact=/^\/p\/[a-z0-9-]+\/?$/i.test(new URL(sourceUrl).pathname)}catch{}
    if(!exact)return false;
    return /<img\b[^>]*(?:class=["'][^"']*(?:vm-pic|img-pre)[^"']*["'][^>]*src=["']https?:\/\/[^"']*afdiancdn\.com\/[^"']+|src=["']https?:\/\/[^"']*afdiancdn\.com\/[^"']+["'][^>]*class=["'][^"']*(?:vm-pic|img-pre))/i.test(input)
      || /<video\b[^>]*(?:src|poster)=["']https?:\/\/[^"']*afdian(?:cdn)?\.com\/[^"']+/i.test(input)
      || /<source\b[^>]*src=["']https?:\/\/[^"']*afdian(?:cdn)?\.com\/[^"']+\.(?:mp4|webm|m3u8)/i.test(input);
  }
  if(provider==='planetminecraft')return /static\.planetminecraft\.com\/(?:files\/image\/minecraft\/|resource_media\/)/i.test(input);
  if(provider==='patreon')return /patreonusercontent\.com\/[^"'<>\s]+/i.test(input);
  return false;
}
function supportedProviders(){return Object.keys(ADAPTERS)}

module.exports={ADAPTERS,adapterFor,exactProjectIdentityFloor,authorPathMatch,authorLinkBonus,postMediaBonus,avatarBonus,mediaKind,providerFullAndPreview,ownedMediaMarker,supportedProviders,REJECT_MEDIA,VIDEO_EXT,GIF_EXT};
