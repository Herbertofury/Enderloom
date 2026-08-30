'use strict';

// Tiny public metadata endpoints that can expose a trustworthy project icon before a
// full marketplace/resource page finishes. These are seeds only: the canonical source
// page still runs and performs uncapped gallery enrichment. No authenticated API or
// credential is used here.

function safeHttp(raw, base='') {
  try {
    const u=base?new URL(String(raw||''),base):new URL(String(raw||''));
    return /^https?:$/.test(u.protocol)?u.toString():'';
  } catch { return ''; }
}
function spigotResourceId(raw='') {
  try {
    const u=new URL(raw);if(!/(^|\.)spigotmc\.org$/i.test(u.hostname))return '';
    const m=/\/resources\/(?:[^/]*\.)?(\d+)(?:\/|$)/i.exec(u.pathname);return m?.[1]||'';
  } catch { return ''; }
}
function hangarProjectSlug(raw='') {
  try {
    const u=new URL(raw);if(u.hostname.toLowerCase()!=='hangar.papermc.io')return '';
    const parts=u.pathname.split('/').filter(Boolean);
    if(parts.length<2||['api','auth','paper','velocity','waterfall'].includes(parts[0].toLowerCase()))return '';
    if(parts[2]&&['versions','pages'].includes(parts[2].toLowerCase()))return parts[1];
    return parts.length===2?parts[1]:parts[1];
  } catch { return ''; }
}
function gitlabProjectPath(raw='') {
  try {
    const u=new URL(raw);if(u.hostname.toLowerCase()!=='gitlab.com')return '';
    const parts=u.pathname.split('/').filter(Boolean);const dash=parts.indexOf('-');const project=parts.slice(0,dash>=0?dash:parts.length);
    if(project.length<2||['users','groups','explore','dashboard','help'].includes(project[0].toLowerCase()))return '';
    return project.join('/');
  } catch { return ''; }
}
function apiDescriptorForUrl(raw='') {
  const sourceUrl=safeHttp(raw);if(!sourceUrl)return null;
  const spigotId=spigotResourceId(sourceUrl);
  if(spigotId)return {provider:'spigot',kind:'spiget-resource',sourceUrl,apiUrl:`https://api.spiget.org/v2/resources/${encodeURIComponent(spigotId)}`,id:spigotId};
  const hangarSlug=hangarProjectSlug(sourceUrl);
  if(hangarSlug)return {provider:'hangar',kind:'hangar-project',sourceUrl,apiUrl:`https://hangar.papermc.io/api/v1/projects/${encodeURIComponent(hangarSlug)}`,slug:hangarSlug};
  const gitlabPath=gitlabProjectPath(sourceUrl);
  if(gitlabPath)return {provider:'gitlab',kind:'gitlab-project',sourceUrl,apiUrl:`https://gitlab.com/api/v4/projects/${encodeURIComponent(gitlabPath)}`,projectPath:gitlabPath};
  return null;
}
function media(url, alt, source, provider, identity=100) {
  const clean=safeHttp(url);if(!clean)return null;
  return {url:clean,alt:String(alt||''),role:'icon',source:String(source||''),provider:String(provider||''),confidence:100,identity};
}
function apiSeedFromJson(desc, data, context={}) {
  if(!desc||!data||typeof data!=='object')return null;
  const expected=String(context?.title||'').trim();let title='',iconUrl='',source='';
  if(desc.kind==='spiget-resource'){
    title=String(data.name||'');iconUrl=safeHttp(data?.icon?.url,'https://www.spigotmc.org/');source='spiget-public-resource-api';
  } else if(desc.kind==='hangar-project'){
    title=String(data.name||data.namespace?.slug||desc.slug||'');iconUrl=safeHttp(data.avatarUrl||data.avatar_url||'','https://hangar.papermc.io/');source='hangar-public-project-api';
  } else if(desc.kind==='gitlab-project'){
    title=String(data.name||data.path||'');iconUrl=safeHttp(data.avatar_url||data.avatarUrl||'','https://gitlab.com/');source='gitlab-public-project-api';
  }
  const icon=media(iconUrl,`${title||expected||'Project'} project icon`,source,desc.provider,100);
  if(!icon)return null;
  return {sourceUrl:desc.sourceUrl,title:title||expected,gallery:[],images:[],icon:{...icon,role:'icon'},author:null,authorUrl:'',provider:desc.provider,identity:100,exclusive:false,apiSeed:true};
}

module.exports={safeHttp,spigotResourceId,hangarProjectSlug,gitlabProjectPath,apiDescriptorForUrl,apiSeedFromJson};
