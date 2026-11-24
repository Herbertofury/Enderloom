'use strict';

// Tiny public metadata endpoints that can expose a trustworthy project icon before a
// full marketplace/resource page finishes. These are seeds only: the canonical source
// page still runs and performs uncapped gallery enrichment. No authenticated API or
// credential is used here.

function safeHttp(raw, base='') {
  try {
    const u=base?new URL(String(raw||''),base):new URL(String(raw||''));
    return /^https?:$/.test(u.protocol)&&!u.username&&!u.password?u.toString():'';
  } catch { return ''; }
}
function spigotResourceId(raw='') {
  try {
    const u=new URL(raw);if(!/(^|\.)spigotmc\.org$/i.test(u.hostname)||u.port||u.username||u.password)return '';
    const m=/^\/resources\/(?:[^/]*\.)?(\d+)(?:\/|$)/i.exec(u.pathname);return m?.[1]||'';
  } catch { return ''; }
}
function hangarProjectSlug(raw='') {
  try {
    const u=new URL(raw);if(u.hostname.toLowerCase()!=='hangar.papermc.io'||u.port||u.username||u.password)return '';
    const parts=u.pathname.split('/').filter(Boolean);
    if(parts.length<2||['api','auth','paper','velocity','waterfall'].includes(parts[0].toLowerCase())||!parts.slice(0,2).every(p=>/^[a-z0-9_-]+$/i.test(p)))return '';
    return parts[1];
  } catch { return ''; }
}
function gitlabProjectPath(raw='') {
  try {
    const u=new URL(raw);if(u.hostname.toLowerCase()!=='gitlab.com'||u.port||u.username||u.password)return '';
    const parts=u.pathname.split('/').filter(Boolean);const dash=parts.indexOf('-');const project=parts.slice(0,dash>=0?dash:parts.length);
    if(project.length<2||['users','groups','explore','dashboard','help','api','search','admin','public'].includes(project[0].toLowerCase())||!project.every(p=>/^[a-z0-9_.-]+$/i.test(p)&&p!=='.'&&p!=='..'))return '';
    return project.join('/').replace(/\.git$/i,'');
  } catch { return ''; }
}
function apiDescriptorForUrl(raw='') {
  const sourceUrl=safeHttp(raw);if(!sourceUrl)return null;
  const spigotId=spigotResourceId(sourceUrl);
  if(spigotId)return {provider:'spigot',kind:'spiget-resource',sourceUrl,apiUrl:`https://api.spiget.org/v2/resources/${encodeURIComponent(spigotId)}`,id:spigotId};
  const hangarSlug=hangarProjectSlug(sourceUrl);
  if(hangarSlug)return {provider:'hangar',kind:'hangar-project',sourceUrl,apiUrl:`https://hangar.papermc.io/api/v1/projects/${encodeURIComponent(hangarSlug)}`,slug:hangarSlug,owner:new URL(sourceUrl).pathname.split('/').filter(Boolean)[0]};
  const gitlabPath=gitlabProjectPath(sourceUrl);
  if(gitlabPath)return {provider:'gitlab',kind:'gitlab-project',sourceUrl,apiUrl:`https://gitlab.com/api/v4/projects/${encodeURIComponent(gitlabPath)}`,projectPath:gitlabPath};
  return null;
}
function media(url, alt, source, provider, identity=100) {
  const clean=safeHttp(url);if(!clean)return null;
  return {url:clean,alt:String(alt||''),role:'icon',source:String(source||''),provider:String(provider||''),confidence:100,identity};
}
function apiSeedFromJson(desc, data, context={}) {
  if(!desc||!data||typeof data!=='object'||Array.isArray(data))return null;
  // Exact provider identity, never a matching display name alone. A failed seed
  // leaves the existing complete page route running.
  const same=(a,b)=>typeof a==='string'&&typeof b==='string'&&a.toLowerCase()===b.toLowerCase();
  const expected=String(context?.title||'').trim();let title='',iconUrl='',source='';
  if(desc.kind==='spiget-resource'){
    if(!Number.isSafeInteger(data.id)||data.id<=0||String(data.id)!==desc.id)return null;
    title=String(data.name||'');iconUrl=safeHttp(data?.icon?.url,'https://www.spigotmc.org/');source='spiget-public-resource-api';
  } else if(desc.kind==='hangar-project'){
    if(!same(data.namespace?.slug,desc.slug)||!same(data.namespace?.owner,desc.owner))return null;
    title=String(data.name||data.namespace?.slug||desc.slug||'');iconUrl=safeHttp(data.avatarUrl||data.avatar_url||'','https://hangar.papermc.io/');source='hangar-public-project-api';
  } else if(desc.kind==='gitlab-project'){
    if(!Number.isSafeInteger(data.id)||data.id<=0||!same(data.path_with_namespace,desc.projectPath))return null;
    title=String(data.name||data.path||'');iconUrl=safeHttp(data.avatar_url||data.avatarUrl||'','https://gitlab.com/');source='gitlab-public-project-api';
  } else return null;
  const icon=media(iconUrl,`${title||expected||'Project'} project icon`,source,desc.provider,100);
  if(!icon)return null;
  return {sourceUrl:desc.sourceUrl,title:title||expected,gallery:[],images:[],icon:{...icon,role:'icon'},author:null,authorUrl:'',provider:desc.provider,identity:100,exclusive:false,apiSeed:true};
}

module.exports={safeHttp,spigotResourceId,hangarProjectSlug,gitlabProjectPath,apiDescriptorForUrl,apiSeedFromJson};
