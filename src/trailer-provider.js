'use strict';
const { canonical } = require('./trailer-discovery');

// Reuse the native provider operations and their authenticated cache. No API
// credential or provider request headers cross into the renderer/media graph.
function nativeTrailerProject(service) {
  return async (project, { signal } = {}) => {
    if (project.provider !== 'curseforge.com') return null;
    const parts = new URL(project.url).pathname.split('/').filter(Boolean);
    const kind = { 'mc-mods': 'mods', modpacks: 'modpacks', 'texture-packs': 'resourcepacks', shaders: 'shaderpacks', 'data-packs': 'datapacks' }[parts[1]];
    if (!kind) return null;
    signal?.throwIfAborted();
    const page = await service.request('search_content', { provider: 'curseforge', kind, query: { query: project.title, sort: 'relevance', limit: 50 } });
    signal?.throwIfAborted();
    const match = page.hits.find(hit => hit.slug === parts[2]);
    if (!match) throw Error('CurseForge search did not resolve the exact project slug');
    const detail = await service.request('get_project_details', { provider: 'curseforge', projectId: match.id });
    signal?.throwIfAborted();
    const samePage = url => canonical(url).replace('://www.curseforge.com/', '://curseforge.com/');
    if (detail.id !== match.id || samePage(detail.website_url) !== samePage(project.url)) throw Error('CurseForge returned a different project page');
    return { id: detail.id, title: detail.title, body: detail.body, gallery: detail.gallery };
  };
}
module.exports = { nativeTrailerProject };
