'use strict';

function modrinthSlugFromUrl(rawUrl='') {
  let u;try{u=new URL(String(rawUrl))}catch{return ''}
  if(!/(^|\.)modrinth\.com$/i.test(u.hostname))return '';
  const parts=u.pathname.split('/').filter(Boolean);
  if(parts.length<2||!['mod','plugin','datapack','shader','resourcepack','modpack'].includes(parts[0].toLowerCase()))return '';
  return decodeURIComponent(parts[1]);
}
function uniqueSlugs(values=[]) {
  const out=[],seen=new Set();
  for(const raw of values){const slug=String(raw||'').trim();if(!slug)continue;const key=slug.toLowerCase();if(seen.has(key))continue;seen.add(key);out.push(slug)}
  return out;
}
// The Modrinth route uses a JSON array in one query parameter. Split only when the
// encoded URL would become uncomfortably large; this is a transport chunk, never a
// result/content cap. Every input slug appears in exactly one output chunk.
function chunkSlugsByUrlLength(values=[], maxUrlChars=6800) {
  const slugs=uniqueSlugs(values),chunks=[];let chunk=[];
  const size=rows=>`https://api.modrinth.com/v2/projects?ids=${encodeURIComponent(JSON.stringify(rows))}`.length;
  for(const slug of slugs){
    if(chunk.length&&size([...chunk,slug])>Math.max(1200,Number(maxUrlChars)||6800)){chunks.push(chunk);chunk=[]}
    chunk.push(slug);
  }
  if(chunk.length)chunks.push(chunk);
  return chunks;
}
function indexProjects(rows=[]) {
  const map=new Map();
  for(const project of Array.isArray(rows)?rows:[]){
    if(!project||typeof project!=='object')continue;
    for(const key of [project.id,project.slug].filter(Boolean))map.set(String(key).toLowerCase(),project);
  }
  return map;
}

function safeHttp(raw='') {
  try {
    const url=new URL(String(raw));
    return url.protocol==='https:'||url.protocol==='http:'?url.toString():'';
  } catch { return ''; }
}

function modrinthImageKey(raw='') {
  const url=safeHttp(raw);if(!url)return '';
  try {
    const parsed=new URL(url);
    return `${parsed.hostname.toLowerCase()}${decodeURIComponent(parsed.pathname)}`
      .replace(/_\d+(?=\.(?:webp|png|jpe?g|gif|avif)$)/i,'')
      .replace(/\.(?:webp|png|jpe?g|gif|avif)$/i,'')
      .toLowerCase();
  } catch { return url.toLowerCase(); }
}

function descriptionImages(markdown='') {
  const text=String(markdown||''),rows=[];
  const add=(raw,alt='')=>{const url=safeHttp(String(raw||'').replace(/&amp;/g,'&'));if(!url)return;let host='';try{host=new URL(url).hostname.toLowerCase()}catch{};if(host!=='cdn.modrinth.com')return;rows.push({url,previewUrl:'',alt:String(alt||'').trim(),source:'modrinth-description'});};
  for(const match of text.matchAll(/!\[([^\]]*)\]\(\s*(https?:\/\/[^\s)]+)(?:\s+["'][^"']*["'])?\s*\)/ig))add(match[2],match[1]);
  for(const match of text.matchAll(/<img\b[^>]*\bsrc\s*=\s*["'](https?:\/\/[^"']+)["'][^>]*>/ig)){
    const alt=(match[0].match(/\balt\s*=\s*["']([^"']*)["']/i)||[])[1]||'';add(match[1],alt);
  }
  // Some descriptions contain a bare CDN URL instead of Markdown/HTML. Keep it only
  // when it is hosted by Modrinth's own media CDN.
  for(const match of text.matchAll(/https?:\/\/cdn\.modrinth\.com\/[^\s<>)"']+/ig))add(match[0],'');
  return rows;
}

// A Modrinth project's visual story is split between the formal gallery and images
// embedded in its Markdown description. Return both, in source order, without a cap.
function modrinthProjectMedia(project={}) {
  const out=[],seen=new Set(),fallback=String(project.title||project.slug||'Modrinth project');
  const add=(row)=>{
    const url=safeHttp(row?.url),previewUrl=safeHttp(row?.previewUrl),key=modrinthImageKey(url);
    if(!url||!key||seen.has(key))return;seen.add(key);
    out.push({url,previewUrl:previewUrl&&previewUrl!==url?previewUrl:'',alt:String(row?.alt||fallback),source:String(row?.source||'modrinth-api')});
  };
  for(const row of Array.isArray(project.gallery)?project.gallery:[]){
    add({url:row?.raw_url||row?.url,previewUrl:row?.raw_url&&row?.url?row.url:'',alt:row?.title||row?.description||fallback,source:'modrinth-gallery-api'});
  }
  for(const row of descriptionImages(project.body))add({...row,alt:row.alt||fallback});
  return out;
}

module.exports={modrinthSlugFromUrl,uniqueSlugs,chunkSlugsByUrlLength,indexProjects,descriptionImages,modrinthProjectMedia};
