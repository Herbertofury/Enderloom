'use strict';
const assert = require('assert/strict'), path = require('path'), fs = require('fs');
const { LauncherService } = require('../src/launcher-service');
// Uses the existing credential vault. Never reads or prints a raw credential.
(async () => {
  const rootDir = path.resolve(__dirname, '..');
  const service = new LauncherService({ rootDir, dataDir: path.join(process.env.APPDATA, 'Enderloom', 'launcher') });
  try {
    const start = Date.now();
    const search = await service.request('search_content', { provider: 'curseforge', kind: 'mods', query: { query: 'Create', sort: 'relevance', limit: 20 } });
    const exact = search.hits.find(project => project.id === '328085');
    assert(exact, 'Search must resolve the exact Create project');
    const [detail, versions, taxonomy] = await Promise.all([
      service.request('get_project_details', { provider: 'curseforge', projectId: exact.id }),
      service.request('list_project_versions', { provider: 'curseforge', projectId: exact.id, kind: 'mods', gameVersion: '1.21.1', loader: 'neoforge' }),
      service.request('get_filter_taxonomy', { provider: 'curseforge', kind: 'mods' }),
    ]);
    assert(detail.icon_url && detail.body && Array.isArray(detail.gallery), 'Project artwork and description must load; empty provider galleries remain honest');
    assert(versions.some(version => version.compatible && version.files.some(file => file.url && file.size > 0)), 'Compatible downloadable files must load');
    assert(taxonomy.categories.length && taxonomy.loaders.length, 'Provider filters must load');
    assert(search.hits.every(project => project.icon_url), 'Every returned project must retain its real icon');
    const report = { checkedAt: new Date().toISOString(), elapsedMs: Date.now() - start,
      searchTotal: search.total, hits: search.hits.map(project => ({ id: project.id, title: project.title, icon: !!project.icon_url })),
      detail: { id: detail.id, title: detail.title, gallery: detail.gallery.length, description: !!detail.body },
      versions: versions.map(version => ({ id: version.id, name: version.name, compatible: version.compatible, files: version.files.map(file => ({ fileName: file.file_name, downloadAvailable: !!file.url, size: file.size })) })),
      taxonomy: { categories: taxonomy.categories.length, versions: taxonomy.game_versions.length, loaders: taxonomy.loaders.length } };
    fs.mkdirSync(path.join(rootDir, 'output/curseforge'), { recursive: true });
    fs.writeFileSync(path.join(rootDir, 'output/curseforge/live-api.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ status: 'PASS', elapsedMs: report.elapsedMs, search: search.hits.length, exactProject: detail.title, gallery: detail.gallery.length, compatibleVersions: versions.filter(v => v.compatible).length, categories: taxonomy.categories.length }));
  } finally { service.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
