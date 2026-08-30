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
module.exports={modrinthSlugFromUrl,uniqueSlugs,chunkSlugsByUrlLength,indexProjects};
