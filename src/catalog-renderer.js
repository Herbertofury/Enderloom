'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function htmlEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[ch]));
}
function jsonForScript(value) {
  return JSON.stringify(value).replace(/<\//g, '<\\/').replace(/<!--/g, '<\\!--');
}
function countAssets(items) {
  const counts = { icon:0, author:0, gallery:0 };
  for (const item of items || []) {
    if (item.iconAsset) counts.icon++;
    if (item.authorAsset) counts.author++;
    if (item.galleryAsset) counts.gallery++;
  }
  return counts;
}
function catalogSemanticHash(snapshot) {
  const slim = {
    items: (snapshot.items || []).map(item => {
      const out = { ...item };
      delete out._search; delete out._sourceCount; delete out._key;
      return out;
    }),
    assetKeys: Object.keys(snapshot.assets || {}).sort(),
    documents: (snapshot.documents || []).map(d => ({ title:d.title, format:d.format, text:d.text, links:d.links, pageCount:d.pageCount, sourceId:d.sourceId }))
  };
  return crypto.createHash('sha256').update(JSON.stringify(slim)).digest('hex');
}
function normalizeSnapshot(snapshot) {
  const out = { ...snapshot };
  out.schemaVersion = 2;
  out.id = String(out.id || 'catalog');
  out.name = String(out.name || out.title || 'Research Catalog');
  out.title = out.name;
  out.description = String(out.description || 'A searchable source-grounded research catalog.');
  out.items = Array.isArray(out.items) ? out.items : [];
  out.assets = out.assets && typeof out.assets === 'object' ? out.assets : {};
  out.documents = Array.isArray(out.documents) ? out.documents : [];
  out.sources = Array.isArray(out.sources) ? out.sources : [];
  const assetCounts = countAssets(out.items);
  const collections = [...new Set(out.items.flatMap(x => x.collections || []).filter(Boolean))];
  const scores = out.items.filter(x => x.overallScore !== null && x.overallScore !== undefined && x.overallScore !== '' && Number.isFinite(Number(x.overallScore)));
  out.build = {
    ...(out.build || {}),
    catalogId: out.id,
    name: out.name,
    title: out.name,
    expectedProjects: out.items.length,
    generatedAt: out.updatedAt || out.build?.generatedAt || new Date().toISOString(),
    assetCounts,
    uniqueEmbeddedAssets: Object.keys(out.assets).length,
    collections: collections.length,
    hasScores: scores.length > 0,
    sources: {
      sheet: out.sources.find(x => x.role === 'primary' && /sheet|xlsx|xlsm|csv|tsv/i.test(`${x.kind||''} ${x.format||''}`))?.url || out.build?.sources?.sheet || '',
      doc: out.sources.find(x => x.role === 'narrative')?.url || out.build?.sources?.doc || '',
      pdf: out.sources.find(x => x.format === 'pdf' || x.role === 'fixed')?.url || out.build?.sources?.pdf || '',
      history: out.build?.sources?.history || ''
    },
    sync: out.sync || out.build?.sync || { state:'snapshot' },
    sourceSummary: out.sourceSummary || `${out.sources.length} tracked source${out.sources.length === 1 ? '' : 's'}; canonical provenance preserved`,
    legacyIdMap: out.legacyIdMap || out.build?.legacyIdMap || {}
  };
  out.semanticHash = catalogSemanticHash(out);
  return out;
}
function brandFor(name) {
  const words = String(name || '').split(/\s+/).filter(Boolean).filter(w => !/^(minecraft|the|and|female|master|vault)$/i.test(w));
  return (words.slice(0,2).map(w => w[0]).join('') || 'RC').toUpperCase();
}
function renderCatalog(snapshot, rootDir) {
  const catalogDir = path.join(rootDir, 'catalog');
  const template = fs.readFileSync(path.join(catalogDir, 'template.html'), 'utf8');
  const styles = fs.readFileSync(path.join(catalogDir, 'styles.css'), 'utf8');
  const appJs = fs.readFileSync(path.join(catalogDir, 'app.js'), 'utf8');
  const enhanceJs = fs.readFileSync(path.join(catalogDir, 'enhance.js'), 'utf8');
  const data = normalizeSnapshot(snapshot);
  let html = template
    .replaceAll('__TITLE__', htmlEscape(`${data.name} - Explorer`))
    .replaceAll('__BRAND__', htmlEscape(data.brand || brandFor(data.name)))
    .replaceAll('__HEADING__', htmlEscape(data.name))
    .replaceAll('__LEDE__', htmlEscape(data.description))
    .replace('__STYLES__', styles)
    .replace('__BUILD_JSON__', jsonForScript(data.build))
    .replace('__ASSETS_JSON__', jsonForScript(data.assets))
    .replace('__DATA_JSON__', jsonForScript(data.items))
    .replace('__APP_JS__', appJs)
    .replace('__ENHANCE_JS__', enhanceJs);
  return { html, snapshot:data };
}
function writeCatalog(snapshot, outputPath, rootDir) {
  const rendered = renderCatalog(snapshot, rootDir);
  fs.mkdirSync(path.dirname(outputPath), { recursive:true });
  fs.writeFileSync(outputPath, rendered.html);
  return rendered.snapshot;
}
module.exports = { renderCatalog, writeCatalog, normalizeSnapshot, catalogSemanticHash, countAssets, brandFor };
