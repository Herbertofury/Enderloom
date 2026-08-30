'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const { readZip, normalizeName } = require('./zip-lite');

const ACCEPTED_EXTENSIONS = new Set([
  '.xlsx', '.xlsm', '.csv', '.tsv', '.json', '.md', '.markdown', '.txt',
  '.docx', '.pdf', '.html', '.htm', '.zip', '.catalog'
]);

function sha256(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
function sha1(value) { return crypto.createHash('sha1').update(String(value)).digest('hex'); }
function xmlDecode(value) {
  return String(value || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}
function stripXml(value) { return xmlDecode(String(value || '').replace(/<[^>]+>/g, '')); }
function normHeader(value) {
  return String(value || '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function normText(value) {
  return String(value || '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
}
function first(...values) { return values.find(v => v !== undefined && v !== null && String(v).trim() !== '') ?? ''; }
function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : null;
}
function splitTags(value) {
  if (Array.isArray(value)) return [...new Set(value.map(v => String(v).trim()).filter(Boolean))];
  return [...new Set(String(value || '').split(/[,;|]/).map(v => v.trim()).filter(Boolean))];
}
function safeUrl(value) {
  try {
    const u = new URL(String(value || '').trim());
    return (u.protocol === 'http:' || u.protocol === 'https:') ? u.toString() : '';
  } catch { return ''; }
}
function urlsFromText(value) {
  const out = [];
  const re = /https?:\/\/[^\s<>{}\[\]"']+/gi;
  let m;
  while ((m = re.exec(String(value || '')))) {
    const u = safeUrl(m[0].replace(/[),.;]+$/, ''));
    if (u && !out.includes(u)) out.push(u);
  }
  return out;
}
function providerLabel(url) {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
    if (host.includes('curseforge.com')) return 'CurseForge';
    if (host.includes('modrinth.com')) return 'Modrinth';
    if (host === 'github.com') return 'GitHub';
    if (host === 'gitlab.com') return 'GitLab';
    if (host === 'hangar.papermc.io') return 'Hangar';
    if (host.includes('spigotmc.org')) return 'SpigotMC';
    if (host.includes('dev.bukkit.org')) return 'Bukkit';
    if (host.includes('builtbybit.com')) return 'BuiltByBit';
    if (host.includes('nexusmods.com')) return 'Nexus Mods';
    if (host.includes('moddb.com')) return 'ModDB';
    if (host.includes('polymart.org')) return 'Polymart';
    if (host.includes('planetminecraft.com')) return 'Planet Minecraft';
    if (host.includes('mcpedl.com')) return 'MCPEDL';
    if (host.includes('modbay.org')) return 'ModBay';
    if (host.includes('afdian.com')) return 'AFDIAN';
    if (host.includes('patreon.com')) return 'Patreon';
    if (host.includes('minecraft.net')) return 'Minecraft Marketplace';
    if (host.includes('booth.pm')) return 'BOOTH';
    if (host.includes('fourthwall.com') || host.includes('fourthwall.dev')) return 'Fourthwall';
    if (host.includes('ko-fi.com')) return 'Ko-fi';
    if (host.includes('itch.io')) return 'itch.io';
    if (host.includes('gumroad.com')) return 'Gumroad';
    if (host.includes('alltheysm.top')) return 'alltheysm';
    return host;
  } catch { return 'Source'; }
}
function providerFields(urls) {
  const result = { primaryUrl: '', curseForgeUrl: '', modrinthUrl: '', githubUrl: '', otherUrl: '', sources: [] };
  const clean = [...new Set(urls.map(safeUrl).filter(Boolean))];
  result.primaryUrl = clean[0] || '';
  result.sources = clean.map((url, index) => ({ provider: providerLabel(url), label: providerLabel(url), url, kind: index === 0 ? 'primary' : 'project', verified: false }));
  for (const u of clean) {
    let host = '';
    try { host = new URL(u).hostname.toLowerCase(); } catch {}
    if (!result.curseForgeUrl && host.includes('curseforge.com')) result.curseForgeUrl = u;
    else if (!result.modrinthUrl && host.includes('modrinth.com')) result.modrinthUrl = u;
    else if (!result.githubUrl && host === 'github.com') result.githubUrl = u;
    else if (!result.otherUrl && u !== result.primaryUrl) result.otherUrl = u;
  }
  return result;
}
function mimeForImage(name, buffer) {
  const ext = path.extname(name || '').toLowerCase();
  if (ext === '.png' || buffer?.subarray(1, 4).toString('ascii') === 'PNG') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg' || buffer?.subarray(0, 2).toString('hex') === 'ffd8') return 'image/jpeg';
  if (ext === '.webp' || buffer?.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  if (ext === '.gif' || buffer?.subarray(0, 3).toString('ascii') === 'GIF') return 'image/gif';
  if (ext === '.svg') return 'image/svg+xml';
  return 'application/octet-stream';
}
function dataAsset(name, buffer, assets) {
  if (!buffer || !buffer.length) return '';
  const hash = sha256(buffer);
  const id = `asset-${hash.slice(0, 16)}`;
  if (!assets[id]) assets[id] = `data:${mimeForImage(name, buffer)};base64,${buffer.toString('base64')}`;
  return id;
}
function attrMap(text) {
  const out = {};
  const re = /([A-Za-z_:][\w:.-]*)\s*=\s*(["'])(.*?)\2/g;
  let m;
  while ((m = re.exec(String(text || '')))) out[m[1]] = xmlDecode(m[3]);
  return out;
}
function parseRelationships(xml) {
  const out = new Map();
  const re = /<Relationship\b([^>]*?)\/?>(?:<\/Relationship>)?/gi;
  let m;
  while ((m = re.exec(String(xml || '')))) {
    const a = attrMap(m[1]);
    if (a.Id && a.Target) out.set(a.Id, { target: a.Target, type: a.Type || '', mode: a.TargetMode || '' });
  }
  return out;
}
function resolvePart(basePart, target) {
  target = String(target || '').replace(/^\//, '');
  if (!target) return '';
  if (/^[a-z]+:/i.test(target)) return target;
  return normalizeName(path.posix.normalize(path.posix.join(path.posix.dirname(basePart), target)));
}
function parseSharedStrings(xml) {
  const out = [];
  const re = /<si\b[^>]*>([\s\S]*?)<\/si>/gi;
  let m;
  while ((m = re.exec(String(xml || '')))) {
    const parts = [];
    const tr = /<t\b[^>]*>([\s\S]*?)<\/t>/gi;
    let t;
    while ((t = tr.exec(m[1]))) parts.push(xmlDecode(t[1]));
    out.push(parts.join(''));
  }
  return out;
}
function parseHyperlinkFormula(formula) {
  const s = String(formula || '').replace(/^=/, '').trim();
  const m = s.match(/^HYPERLINK\s*\(\s*"((?:[^"]|"")*)"\s*[,;]\s*"((?:[^"]|"")*)"\s*\)$/i);
  if (!m) return null;
  return { url: m[1].replace(/""/g, '"'), label: m[2].replace(/""/g, '"') };
}
function colNumber(ref) {
  const m = String(ref || '').match(/^([A-Z]+)\d+$/i);
  if (!m) return 0;
  let n = 0;
  for (const ch of m[1].toUpperCase()) n = n * 26 + ch.charCodeAt(0) - 64;
  return n;
}
function rowNumber(ref) {
  const m = String(ref || '').match(/(\d+)$/);
  return m ? Number(m[1]) : 0;
}
function parseWorksheet(zip, sheetPath, sharedStrings) {
  const xml = zip.text(sheetPath) || '';
  const relPath = normalizeName(path.posix.join(path.posix.dirname(sheetPath), '_rels', path.posix.basename(sheetPath) + '.rels'));
  const rels = parseRelationships(zip.text(relPath) || '');
  const hyperlinkTargets = new Map();
  const hrefRe = /<hyperlink\b([^>]*?)\/?>(?:<\/hyperlink>)?/gi;
  let hm;
  while ((hm = hrefRe.exec(xml))) {
    const a = attrMap(hm[1]);
    const rid = a['r:id'];
    const rel = rid && rels.get(rid);
    if (a.ref && rel?.target) hyperlinkTargets.set(a.ref, rel.target);
  }
  const rows = new Map();
  const cellRe = /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/gi;
  let cm;
  while ((cm = cellRe.exec(xml))) {
    const a = attrMap(cm[1]);
    const ref = a.r || '';
    const r = rowNumber(ref), c = colNumber(ref);
    if (!r || !c) continue;
    const body = cm[2] || '';
    if (!body) continue;
    const formulaM = body.match(/<f\b[^>]*>([\s\S]*?)<\/f>/i);
    const valueM = body.match(/<v\b[^>]*>([\s\S]*?)<\/v>/i);
    const inline = [...body.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/gi)].map(x => xmlDecode(x[1])).join('');
    const formula = formulaM ? xmlDecode(formulaM[1]) : '';
    let value = valueM ? xmlDecode(valueM[1]) : inline;
    if (a.t === 's') value = sharedStrings[Number(value)] ?? '';
    else if (a.t === 'b') value = value === '1' ? 'TRUE' : 'FALSE';
    const hf = parseHyperlinkFormula(formula);
    if (hf?.label) value = hf.label;
    const link = safeUrl(hf?.url || hyperlinkTargets.get(ref) || '');
    if (!rows.has(r)) rows.set(r, new Map());
    rows.get(r).set(c, { ref, row: r, col: c, value, formula, url: link, type: a.t || '' });
  }
  return { path: sheetPath, xml, rels, rows };
}
function parseWorkbook(zip) {
  const workbookXml = zip.text('xl/workbook.xml');
  if (!workbookXml) throw new Error('Invalid XLSX: xl/workbook.xml is missing');
  const rels = parseRelationships(zip.text('xl/_rels/workbook.xml.rels') || '');
  const shared = parseSharedStrings(zip.text('xl/sharedStrings.xml') || '');
  const sheets = [];
  const re = /<sheet\b([^>]*?)\/?>(?:<\/sheet>)?/gi;
  let m;
  while ((m = re.exec(workbookXml))) {
    const a = attrMap(m[1]);
    const rel = rels.get(a['r:id']);
    if (!a.name || !rel?.target) continue;
    const sheetPath = resolvePart('xl/workbook.xml', rel.target);
    sheets.push({ name: a.name, path: sheetPath, parsed: parseWorksheet(zip, sheetPath, shared) });
  }
  return sheets;
}
function parseDrawingImages(zip, sheetPath) {
  const result = new Map();
  const sheetRelPath = normalizeName(path.posix.join(path.posix.dirname(sheetPath), '_rels', path.posix.basename(sheetPath) + '.rels'));
  const sheetRels = parseRelationships(zip.text(sheetRelPath) || '');
  for (const rel of sheetRels.values()) {
    if (!/\/drawing$/i.test(rel.type) && !rel.type.includes('/drawing')) continue;
    const drawingPath = resolvePart(sheetPath, rel.target);
    const drawingXml = zip.text(drawingPath);
    if (!drawingXml) continue;
    const drawingRelPath = normalizeName(path.posix.join(path.posix.dirname(drawingPath), '_rels', path.posix.basename(drawingPath) + '.rels'));
    const drawingRels = parseRelationships(zip.text(drawingRelPath) || '');
    const anchorRe = /<xdr:(oneCellAnchor|twoCellAnchor)\b[^>]*>([\s\S]*?)<\/xdr:\1>/gi;
    let am;
    while ((am = anchorRe.exec(drawingXml))) {
      const block = am[2];
      const from = block.match(/<xdr:from>([\s\S]*?)<\/xdr:from>/i)?.[1] || '';
      const row = Number(from.match(/<xdr:row>(\d+)<\/xdr:row>/i)?.[1]);
      const col = Number(from.match(/<xdr:col>(\d+)<\/xdr:col>/i)?.[1]);
      const rid = block.match(/<a:blip\b[^>]*r:embed="([^"]+)"/i)?.[1];
      const imgRel = rid && drawingRels.get(rid);
      if (!Number.isFinite(row) || !Number.isFinite(col) || !imgRel?.target) continue;
      const imagePath = resolvePart(drawingPath, imgRel.target);
      const buffer = zip.get(imagePath);
      if (buffer) result.set(`${row}:${col}`, { path: imagePath, buffer });
    }
  }
  return result;
}

const HEADER_GROUPS = {
  name: ['name', 'project', 'title', 'mod', 'addon', 'add on'],
  category: ['primary category', 'category', 'class', 'role archetype', 'role'],
  edition: ['edition', 'platform'],
  type: ['type', 'project type'],
  versions: ['minecraft versions', 'minecraft version s', 'minecraft version', 'versions', 'version'],
  loader: ['loader channel', 'loader', 'channel'],
  status: ['status', 'maintenance'],
  tags: ['tags', 'tag'],
  why: ['why it matters', 'why it earned a spot', 'summary', 'reason', 'description'],
  caution: ['caution', 'remove update safety', 'safety', 'world save impact'],
  variety: ['variety'], depth: ['depth'], polish: ['polish'], freshness: ['freshness'],
  score: ['overall score', 'score'], rank: ['rank 1 best', 'rank'],
  primaryUrl: ['primary url', 'project url', 'url', 'source'],
  curseforge: ['curseforge url', 'curse forge url'], modrinth: ['modrinth url'], github: ['github url'], other: ['other url'],
  evidence: ['evidence', 'notes', 'last checked'], author: ['author', 'creator'],
  direct: ['direct version download', 'direct download', 'download'],
  recommendation: ['recommendation'], gameplayVisual: ['gameplay or visual'], disposition: ['disposition'],
  worldImpact: ['world save impact'], removeSafety: ['remove update safety'], class: ['class'], role: ['role archetype'],
  notes: ['notes'], lastChecked: ['last checked']
};
function aliasMatch(header, aliases) {
  const h = normHeader(header);
  return aliases.some(a => h === a || (a.length > 7 && h.includes(a)));
}
function detectHeaderRow(sheet) {
  let best = { row: 0, score: -1 };
  for (const [r, cells] of [...sheet.parsed.rows.entries()].slice(0, 40)) {
    const headers = [...cells.values()].map(c => normHeader(c.value)).filter(Boolean);
    let score = 0;
    for (const aliases of Object.values(HEADER_GROUPS)) if (headers.some(h => aliasMatch(h, aliases))) score++;
    if (headers.some(h => aliasMatch(h, HEADER_GROUPS.name))) score += 6;
    if (score > best.score) best = { row: r, score };
  }
  return best.score >= 7 ? best.row : 0;
}
function headerIndex(sheet, headerRow) {
  const map = new Map();
  const cells = sheet.parsed.rows.get(headerRow) || new Map();
  for (const [col, cell] of cells) map.set(col, normHeader(cell.value));
  return map;
}
function findCol(headers, aliases) {
  for (const [col, h] of headers) if (aliasMatch(h, aliases)) return col;
  return 0;
}
function cellAt(row, col) { return col ? row.get(col) || { value: '', url: '', formula: '' } : { value: '', url: '', formula: '' }; }
function genericRowsFromSheet(sheet, sourceKey, assets, workbookSheets) {
  const headerRow = detectHeaderRow(sheet);
  if (!headerRow) return { items: [], headerRow: 0, imageCount: 0 };
  const headers = headerIndex(sheet, headerRow);
  const cols = {};
  for (const [key, aliases] of Object.entries(HEADER_GROUPS)) cols[key] = findCol(headers, aliases);
  if (!cols.name) return { items: [], headerRow, imageCount: 0 };
  const images = parseDrawingImages(workbookSheets.zip, sheet.path);
  const memberships = workbookSheets.memberships || new Map();
  const scourMembership = workbookSheets.scourMembership || new Map();
  const items = [];
  const usedIds = new Set();
  for (const [r, row] of sheet.parsed.rows) {
    if (r <= headerRow) continue;
    const nameCell = cellAt(row, cols.name);
    const name = String(nameCell.value || '').trim();
    if (!name || aliasMatch(name, HEADER_GROUPS.name)) continue;
    const urlsFor = col => { const c = cellAt(row, col); return [...new Set([c.url, ...urlsFromText(c.value)].map(safeUrl).filter(Boolean))]; };
    const explicit = {
      primary: urlsFor(cols.primaryUrl), curseforge: urlsFor(cols.curseforge), modrinth: urlsFor(cols.modrinth),
      github: urlsFor(cols.github), other: urlsFor(cols.other), direct: urlsFor(cols.direct)
    };
    const rowUrls = [...explicit.primary, ...explicit.curseforge, ...explicit.modrinth, ...explicit.github, ...explicit.other, ...explicit.direct];
    if (nameCell.url) rowUrls.unshift(nameCell.url);
    if (!rowUrls.length) {
      for (const [col, cell] of row.entries()) {
        if (col === cols.author) continue;
        if (cell.url) rowUrls.push(cell.url);
        rowUrls.push(...urlsFromText(cell.value));
      }
    }
    const providers = providerFields(rowUrls);
    providers.primaryUrl = first(explicit.primary[0], safeUrl(nameCell.url), explicit.direct[0], providers.primaryUrl);
    providers.curseForgeUrl = first(explicit.curseforge[0], providers.curseForgeUrl);
    providers.modrinthUrl = first(explicit.modrinth[0], providers.modrinthUrl);
    providers.githubUrl = first(explicit.github[0], providers.githubUrl);
    providers.otherUrl = explicit.other.length ? explicit.other.join(' ; ') : providers.otherUrl;
    const sourceUrls = [...new Set([providers.primaryUrl, ...rowUrls].map(safeUrl).filter(Boolean))];
    providers.sources = sourceUrls.map((url, index) => ({ provider: providerLabel(url), label: providerLabel(url), url, kind: index === 0 ? 'primary' : 'project', verified: false }));
    const authorCell = cellAt(row, cols.author);
    const author = String(authorCell.value || '').trim();
    const role = String(cellAt(row, cols.role).value || '').trim();
    const klass = String(cellAt(row, cols.class).value || '').trim();
    const category = String(first(cellAt(row, cols.category).value, klass, role, 'Uncategorized')).trim();
    const maintenance = String(cellAt(row, cols.status).value || '').trim();
    const worldImpact = String(cellAt(row, cols.worldImpact).value || '').trim();
    const removeSafety = String(cellAt(row, cols.removeSafety).value || '').trim();
    const baseCaution = String(cellAt(row, cols.caution).value || '').trim();
    const caution = [...new Set([baseCaution, worldImpact, removeSafety].filter(Boolean))].join(' | ');
    const recommendation = String(cellAt(row, cols.recommendation).value || '').trim();
    const gameplayVisual = String(cellAt(row, cols.gameplayVisual).value || '').trim();
    const disposition = String(cellAt(row, cols.disposition).value || '').trim();
    const rawTags = splitTags(cellAt(row, cols.tags).value);
    const tags = [...new Set([...rawTags, klass, role, recommendation, gameplayVisual, disposition].filter(Boolean))];
    const key = normText(name);
    const sheetCollections = memberships.get(key) || [];
    const collections = [...new Set((memberships.size ? sheetCollections : [category]).filter(Boolean))];
    const scour = first(scourMembership.get(key), String(cellAt(row, findCol(headers, ['scour'])).value || ''));
    const item = {
      id: '', name, primaryCategory: category,
      edition: String(cellAt(row, cols.edition).value || ''),
      type: String(cellAt(row, cols.type).value || ''),
      minecraftVersions: String(cellAt(row, cols.versions).value || ''),
      loader: String(cellAt(row, cols.loader).value || ''),
      varietyCount: String(first(role, recommendation, cellAt(row, findCol(headers, ['variety count'])).value, '')),
      status: maintenance,
      tags,
      whyItMatters: String(cellAt(row, cols.why).value || ''),
      caution,
      variety: toNumber(cellAt(row, cols.variety).value),
      depth: toNumber(cellAt(row, cols.depth).value),
      polish: toNumber(cellAt(row, cols.polish).value),
      freshness: toNumber(cellAt(row, cols.freshness).value),
      overallScore: toNumber(cellAt(row, cols.score).value),
      ...providers,
      evidence: [String(cellAt(row, cols.evidence).value || ''), String(cellAt(row, cols.lastChecked).value || ''), String(cellAt(row, cols.notes).value || '')].filter(Boolean).join(' | '),
      rank: toNumber(cellAt(row, cols.rank).value),
      author,
      authorUrl: safeUrl(authorCell.url),
      scour: String(scour || ''),
      collections,
      iconAsset: '', authorAsset: '', galleryAsset: '',
      provenance: [`${sheet.name}!row ${r}`],
      sourceKey,
      extra: {}
    };
    for (const [col, h] of headers) {
      const c = cellAt(row, col);
      if (c.value !== '' && c.value !== null && c.value !== undefined) item.extra[h || `col${col}`] = c.value;
    }
    for (const [roleName, aliases] of [['iconAsset', ['mod icon', 'project icon', 'icon']], ['authorAsset', ['author', 'creator']], ['galleryAsset', ['gallery preview', 'gallery', 'preview']]]) {
      const imageCol = findCol(headers, aliases);
      const rec = imageCol ? images.get(`${r - 1}:${imageCol - 1}`) : null;
      if (rec) item[roleName] = dataAsset(rec.path, rec.buffer, assets);
    }
    const identity = `${providers.primaryUrl || ''}|${normText(name)}`;
    let id = `${normText(name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'item'}-${sha1(identity).slice(0, 8)}`;
    if (usedIds.has(id)) id += `-${r}`;
    usedIds.add(id); item.id = id;
    items.push(item);
  }
  return { items, headerRow, imageCount: images.size, headers: Object.fromEntries(headers) };
}
function deriveSheetMemberships(sheets) {
  const memberships = new Map();
  const scourMembership = new Map();
  const excluded = /^(dashboard|master index|visual atlas|read me)$/i;
  for (const sheet of sheets) {
    if (excluded.test(sheet.name)) continue;
    const headerRow = detectHeaderRow(sheet);
    if (!headerRow) continue;
    const headers = headerIndex(sheet, headerRow);
    const nameCol = findCol(headers, HEADER_GROUPS.name);
    if (!nameCol) continue;
    const isScour = /scour.*addition/i.test(sheet.name);
    let scourName = '';
    if (/second/i.test(sheet.name)) scourName = 'Second Scour';
    else if (/third/i.test(sheet.name)) scourName = 'Third Scour';
    else if (/fourth/i.test(sheet.name)) scourName = 'Fourth Scour';
    for (const [r, row] of sheet.parsed.rows) {
      if (r <= headerRow) continue;
      const name = String(cellAt(row, nameCol).value || '').trim();
      if (!name) continue;
      const key = normText(name);
      if (isScour && scourName) scourMembership.set(key, scourName);
      else {
        if (!memberships.has(key)) memberships.set(key, []);
        memberships.get(key).push(sheet.name);
      }
    }
  }
  return { memberships, scourMembership };
}
function parseXlsx(buffer, options = {}) {
  const zip = readZip(buffer);
  const sheets = parseWorkbook(zip);
  const primary = sheets.find(s => /^master index$/i.test(s.name)) || sheets.find(s => detectHeaderRow(s)) || sheets[0];
  if (!primary) throw new Error('Workbook has no readable worksheets');
  const derived = deriveSheetMemberships(sheets);
  const assets = {};
  const ctx = { zip, memberships: derived.memberships, scourMembership: derived.scourMembership };
  const out = genericRowsFromSheet(primary, options.sourceKey || 'xlsx', assets, ctx);
  for (const item of out.items) if (!item.scour && /^master index$/i.test(primary.name) && sheets.some(s => /scour.*addition/i.test(s.name))) item.scour = 'Foundation / First Pass';
  return {
    kind: 'structured', format: 'xlsx', title: options.title || primary.name,
    items: out.items, assets, documents: [],
    meta: { sheetCount: sheets.length, primarySheet: primary.name, headerRow: out.headerRow, sourceMediaCount: out.imageCount, sheetNames: sheets.map(s => s.name), headers: out.headers, collections: [...new Set(out.items.flatMap(x => x.collections || []))], mediaCount: out.items.reduce((n,x)=>n+(x.iconAsset?1:0)+(x.authorAsset?1:0)+(x.galleryAsset?1:0),0) }
  };
}

function parseDelimited(text, delimiter) {
  const rows = []; let row = [], field = '', quoted = false;
  for (let i = 0; i <= text.length; i++) {
    const ch = text[i] ?? '\n';
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delimiter) { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some(v => String(v).trim() !== '')) rows.push(row);
      row = [];
    } else field += ch;
  }
  return rows;
}
function normalizeObjectRows(objects, options = {}) {
  if (!Array.isArray(objects) || !objects.length) return [];
  const headers = [...new Set(objects.flatMap(o => Object.keys(o || {})))];
  const findKey = aliases => headers.find(h => aliasMatch(h, aliases));
  const k = {}; for (const [name, aliases] of Object.entries(HEADER_GROUPS)) k[name] = findKey(aliases);
  if (!k.name) k.name = headers[0];
  const used = new Set();
  return objects.map((o, index) => {
    const name = String(o?.[k.name] ?? '').trim(); if (!name) return null;
    const urls = [];
    for (const value of Object.values(o || {})) urls.push(...urlsFromText(value));
    const providers = providerFields(urls);
    const category = String(first(o?.[k.category], o?.[k.class], o?.[k.role], 'Uncategorized'));
    const tags = [...new Set([...splitTags(o?.[k.tags]), o?.[k.class], o?.[k.role], o?.[k.recommendation], o?.[k.gameplayVisual], o?.[k.disposition]].filter(Boolean).map(String))];
    const author = String(o?.[k.author] || '');
    let id = `${normText(name).replace(/[^a-z0-9]+/g, '-').slice(0, 48) || 'item'}-${sha1(`${providers.primaryUrl}|${normText(name)}`).slice(0, 8)}`;
    if (used.has(id)) id += `-${index + 1}`; used.add(id);
    return { id, name, primaryCategory: category, edition: String(o?.[k.edition] || ''), type: String(o?.[k.type] || ''), minecraftVersions: String(o?.[k.versions] || ''), loader: String(o?.[k.loader] || ''), varietyCount: String(first(o?.[k.role], o?.[k.recommendation], '')), status: String(o?.[k.status] || ''), tags, whyItMatters: String(o?.[k.why] || ''), caution: [o?.[k.caution], o?.[k.worldImpact], o?.[k.removeSafety]].filter(Boolean).join(' | '), variety: toNumber(o?.[k.variety]), depth: toNumber(o?.[k.depth]), polish: toNumber(o?.[k.polish]), freshness: toNumber(o?.[k.freshness]), overallScore: toNumber(o?.[k.score]), ...providers, evidence: [o?.[k.evidence], o?.[k.lastChecked], o?.[k.notes]].filter(Boolean).join(' | '), rank: toNumber(o?.[k.rank]), author, authorUrl: '', scour: String(o?.scour || ''), collections: [...new Set([category, o?.[k.class], o?.[k.gameplayVisual]].filter(Boolean).map(String))], iconAsset: '', authorAsset: '', galleryAsset: '', provenance: [`${options.title || 'data'} row ${index + 2}`], sourceKey: options.sourceKey || 'data', extra: { ...o } };
  }).filter(Boolean);
}
function parseCsvLike(buffer, options, delimiter) {
  const text = buffer.toString('utf8').replace(/^\ufeff/, '');
  const rows = parseDelimited(text, delimiter);
  if (!rows.length) return { kind: 'structured', format: delimiter === '\t' ? 'tsv' : 'csv', title: options.title || 'Table', items: [], assets: {}, documents: [], meta: {} };
  const headers = rows[0].map(String);
  const objects = rows.slice(1).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ''])));
  return { kind: 'structured', format: delimiter === '\t' ? 'tsv' : 'csv', title: options.title || 'Table', items: normalizeObjectRows(objects, options), assets: {}, documents: [], meta: { rowCount: objects.length, headers } };
}
function parseJson(buffer, options = {}) {
  const data = JSON.parse(buffer.toString('utf8').replace(/^\ufeff/, ''));
  if (data && Array.isArray(data.items)) {
    return { kind: 'bundle', format: 'json', title: data.meta?.name || data.title || options.title || 'Catalog', items: data.items, assets: data.assets || {}, documents: data.documents || [], meta: data.meta || data.build || {} };
  }
  const rows = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [data];
  return { kind: 'structured', format: 'json', title: options.title || 'JSON Catalog', items: normalizeObjectRows(rows, options), assets: {}, documents: [], meta: { rowCount: rows.length } };
}
function markdownTable(text) {
  const lines = String(text).split(/\r?\n/);
  for (let i = 0; i < lines.length - 2; i++) {
    if (!lines[i].includes('|') || !/^\s*\|?\s*:?-{3,}/.test(lines[i + 1])) continue;
    const split = line => line.trim().replace(/^\||\|$/g, '').split('|').map(v => v.trim());
    const headers = split(lines[i]); const rows = [];
    for (let j = i + 2; j < lines.length && lines[j].includes('|') && lines[j].trim(); j++) {
      const vals = split(lines[j]); rows.push(Object.fromEntries(headers.map((h, k) => [h, vals[k] || ''])));
    }
    if (rows.length) return rows;
  }
  return [];
}
function parseTextNarrative(buffer, options = {}, format = 'txt') {
  const text = buffer.toString('utf8').replace(/^\ufeff/, '');
  const table = format === 'md' ? markdownTable(text) : [];
  const items = table.length ? normalizeObjectRows(table, options) : [];
  return { kind: items.length ? 'mixed' : 'narrative', format, title: options.title || 'Document', items, assets: {}, documents: [{ title: options.title || 'Document', text, links: urlsFromText(text), format }], meta: { characters: text.length } };
}
function docxTextFromBlock(block) {
  const parts = [];
  const re = /<w:t\b[^>]*>([\s\S]*?)<\/w:t>/gi; let m;
  while ((m = re.exec(block))) parts.push(xmlDecode(m[1]));
  return parts.join('');
}
function parseDocx(buffer, options = {}) {
  const zip = readZip(buffer);
  const xml = zip.text('word/document.xml') || '';
  const rels = parseRelationships(zip.text('word/_rels/document.xml.rels') || '');
  const paragraphs = [];
  const pr = /<w:p\b[^>]*>([\s\S]*?)<\/w:p>/gi; let pm;
  while ((pm = pr.exec(xml))) { const t = docxTextFromBlock(pm[1]); if (t.trim()) paragraphs.push(t); }
  const links = [];
  const hr = /<w:hyperlink\b([^>]*)>([\s\S]*?)<\/w:hyperlink>/gi; let hm;
  while ((hm = hr.exec(xml))) { const a = attrMap(hm[1]); const rel = rels.get(a['r:id']); const u = safeUrl(rel?.target); if (u) links.push({ url: u, text: docxTextFromBlock(hm[2]) }); }
  const tables = [];
  const tr = /<w:tbl\b[^>]*>([\s\S]*?)<\/w:tbl>/gi; let tm;
  while ((tm = tr.exec(xml))) {
    const rows = []; const rr = /<w:tr\b[^>]*>([\s\S]*?)<\/w:tr>/gi; let rm;
    while ((rm = rr.exec(tm[1]))) {
      const cells = []; const cr = /<w:tc\b[^>]*>([\s\S]*?)<\/w:tc>/gi; let cm;
      while ((cm = cr.exec(rm[1]))) cells.push(docxTextFromBlock(cm[1]).trim());
      if (cells.some(Boolean)) rows.push(cells);
    }
    if (rows.length >= 2) tables.push(rows);
  }
  let items = [];
  for (const table of tables) {
    const headers = table[0];
    const objects = table.slice(1).map(r => Object.fromEntries(headers.map((h, i) => [h || `Column ${i + 1}`, r[i] || ''])));
    const candidate = normalizeObjectRows(objects, options);
    if (candidate.length > items.length) items = candidate;
  }
  const text = paragraphs.join('\n');
  return { kind: items.length ? 'mixed' : 'narrative', format: 'docx', title: options.title || paragraphs[0] || 'Word Document', items, assets: {}, documents: [{ title: options.title || paragraphs[0] || 'Word Document', text, links: [...new Set([...links.map(x => x.url), ...urlsFromText(text)])], format: 'docx' }], meta: { paragraphs: paragraphs.length, tables: tables.length, links: links.length } };
}

function pdfObjectMap(buffer) {
  const text = buffer.toString('latin1');
  const map = new Map();
  const re = /(?:^|[\r\n])(\d+)\s+(\d+)\s+obj\b/g; let m;
  while ((m = re.exec(text))) {
    const id = Number(m[1]); const start = re.lastIndex; const end = text.indexOf('endobj', start);
    if (end < 0) break;
    map.set(id, buffer.subarray(start, end)); re.lastIndex = end + 6;
  }
  return map;
}
function pdfStream(body) {
  const s = body.toString('latin1');
  const marker = s.match(/stream\r?\n/); if (!marker) return null;
  const start = marker.index + marker[0].length; let end = s.indexOf('endstream', start); if (end < 0) return null;
  while (end > start && (body[end - 1] === 10 || body[end - 1] === 13)) end--;
  let data = body.subarray(start, end);
  const dict = s.slice(0, marker.index);
  try { if (/\/FlateDecode\b/.test(dict)) data = zlib.inflateSync(data); } catch { return null; }
  return data;
}
function utf16be(hex) {
  const b = Buffer.from(String(hex).replace(/\s+/g, ''), 'hex');
  if (!b.length) return '';
  let out = '';
  for (let i = 0; i + 1 < b.length; i += 2) out += String.fromCharCode((b[i] << 8) | b[i + 1]);
  return out;
}
function parseCmap(text) {
  const map = new Map(); let codeBytes = 2;
  const cs = text.match(/begincodespacerange[\s\S]*?<([0-9A-Fa-f]+)>/i); if (cs) codeBytes = Math.max(1, cs[1].length / 2);
  const charRe = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g; let m;
  while ((m = charRe.exec(text))) {
    const before = text.slice(Math.max(0, m.index - 32), m.index);
    if (/beginbfchar|beginbfrange|\n/i.test(before)) map.set(parseInt(m[1], 16), utf16be(m[2]));
  }
  const rangeRe = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g;
  while ((m = rangeRe.exec(text))) {
    const a = parseInt(m[1], 16), b = parseInt(m[2], 16), dest = parseInt(m[3], 16);
    if (b >= a && b - a < 4096) for (let n = a; n <= b; n++) map.set(n, String.fromCodePoint(dest + (n - a)));
  }
  const arrayRange = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*\[([^\]]+)\]/g;
  while ((m = arrayRange.exec(text))) {
    const a = parseInt(m[1], 16), vals = [...m[3].matchAll(/<([0-9A-Fa-f]+)>/g)].map(x => utf16be(x[1]));
    vals.forEach((v, i) => map.set(a + i, v));
  }
  return { map, codeBytes };
}
function decodePdfHex(hex, cmap) {
  const clean = String(hex || '').replace(/\s+/g, ''); const bytes = cmap?.codeBytes || 2; let out = '';
  for (let i = 0; i < clean.length; i += bytes * 2) {
    const part = clean.slice(i, i + bytes * 2); if (!part) continue;
    const code = parseInt(part, 16); const mapped = cmap?.map?.get(code);
    if (mapped !== undefined) out += mapped;
    else if (bytes === 1) out += String.fromCharCode(code);
    else if (code) out += String.fromCodePoint(code <= 0x10ffff ? code : 0xfffd);
  }
  return out;
}
function decodePdfLiteral(value) {
  return String(value || '').replace(/\\([nrtbf()\\])/g, (_, c) => ({n:'\n',r:'\r',t:'\t',b:'\b',f:'\f','(':'(',')':')','\\':'\\'}[c] || c)).replace(/\\([0-7]{1,3})/g, (_, o) => String.fromCharCode(parseInt(o, 8)));
}
function extractPdfText(buffer) {
  if (buffer.includes(Buffer.from('/Encrypt'))) return { text: '', links: [], pageCount: 0, limited: true, reason: 'encrypted' };
  const objects = pdfObjectMap(buffer);
  const cmaps = new Map(); const fontCmapByObject = new Map();
  for (const [id, body] of objects) {
    const s = body.toString('latin1'); const ref = s.match(/\/ToUnicode\s+(\d+)\s+\d+\s+R/);
    if (ref) fontCmapByObject.set(id, Number(ref[1]));
  }
  for (const cmapId of new Set(fontCmapByObject.values())) {
    const stream = pdfStream(objects.get(cmapId)); if (stream) cmaps.set(cmapId, parseCmap(stream.toString('latin1')));
  }
  const pages = [];
  for (const [id, body] of objects) {
    const s = body.toString('latin1'); if (!/\/Type\s*\/Page\b/.test(s) || /\/Type\s*\/Pages\b/.test(s)) continue;
    const fonts = new Map(); const fm = s.match(/\/Font\s*<<([\s\S]*?)>>/);
    if (fm) { const fr = /\/([A-Za-z0-9_.+-]+)\s+(\d+)\s+\d+\s+R/g; let m; while ((m = fr.exec(fm[1]))) fonts.set(m[1], Number(m[2])); }
    const contentRefs = []; const arr = s.match(/\/Contents\s*\[([^\]]+)\]/);
    if (arr) for (const m of arr[1].matchAll(/(\d+)\s+\d+\s+R/g)) contentRefs.push(Number(m[1]));
    else { const one = s.match(/\/Contents\s+(\d+)\s+\d+\s+R/); if (one) contentRefs.push(Number(one[1])); }
    pages.push({ id, fonts, contentRefs });
  }
  const chunks = [];
  for (const page of pages) {
    let activeFont = '';
    const fontMap = name => { const obj = page.fonts.get(name); const cmapId = obj && fontCmapByObject.get(obj); return cmapId && cmaps.get(cmapId); };
    for (const ref of page.contentRefs) {
      const stream = pdfStream(objects.get(ref)); if (!stream) continue;
      const s = stream.toString('latin1');
      const tokenRe = /\/([A-Za-z0-9_.+-]+)\s+[-+]?\d*\.?\d+\s+Tf|<([0-9A-Fa-f\s]+)>\s*Tj|\(((?:\\.|[^\\)])*)\)\s*Tj|\[((?:\\.|[^\]])*)\]\s*TJ|\bET\b/g;
      let m;
      while ((m = tokenRe.exec(s))) {
        if (m[1]) { activeFont = m[1]; continue; }
        if (m[2]) chunks.push(decodePdfHex(m[2], fontMap(activeFont)));
        else if (m[3] !== undefined) chunks.push(decodePdfLiteral(m[3]));
        else if (m[4] !== undefined) {
          const inner = m[4]; const ar = /<([0-9A-Fa-f\s]+)>|\(((?:\\.|[^\\)])*)\)/g; let x;
          while ((x = ar.exec(inner))) chunks.push(x[1] ? decodePdfHex(x[1], fontMap(activeFont)) : decodePdfLiteral(x[2]));
        } else chunks.push('\n');
      }
    }
    chunks.push('\n');
  }
  let text = chunks.join('').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').replace(/[ \t]{2,}/g, ' ').trim();
  const latin = buffer.toString('latin1'); const links = [];
  const uriRe = /\/URI\s*\(([^)]*)\)/g; let um;
  while ((um = uriRe.exec(latin))) { const u = safeUrl(decodePdfLiteral(um[1])); if (u && !links.includes(u)) links.push(u); }
  links.push(...urlsFromText(text).filter(u => !links.includes(u)));
  return { text, links, pageCount: pages.length, limited: !text };
}
function parsePdf(buffer, options = {}) {
  const info = extractPdfText(buffer);
  const titleHex = buffer.toString('latin1').match(/\/Title\s*<FEFF([0-9A-Fa-f]+)>/i)?.[1];
  const title = titleHex ? utf16be(titleHex) : options.title || 'PDF Document';
  const chars = [...info.text]; const printable = chars.filter(c => c === '\n' || c === '\t' || (c >= ' ' && c <= '~')).length; const replacement = chars.filter(c => c === '\uFFFD').length; const asciiRatio = chars.length ? printable / chars.length : 0; const textQuality = info.limited ? 'limited' : (replacement > 0 || asciiRatio < 0.88 ? 'degraded' : 'good'); return { kind: 'narrative', format: 'pdf', title, items: [], assets: {}, documents: [{ title, text: info.text, links: info.links, format: 'pdf', pageCount: info.pageCount }], meta: { pageCount: info.pageCount, textCharacters: info.text.length, limitedTextExtraction: info.limited, limitedReason: info.reason || '', textExtractionMode: 'lightweight-best-effort', textQuality, asciiRatio: Number(asciiRatio.toFixed(4)), replacementCharacters: replacement } };
}
function extractCatalogFromHtml(buffer, options = {}) {
  const text = buffer.toString('utf8');
  const m = text.match(/window\.MOB_VARIETY_BUILD=([\s\S]*?);window\.MOB_VARIETY_ASSETS=([\s\S]*?);window\.MOB_VARIETY_DATA=([\s\S]*?);<\/script>/i);
  if (m) return { kind: 'bundle', format: 'html', title: options.title || 'Catalog Snapshot', items: JSON.parse(m[3]), assets: JSON.parse(m[2]), documents: [], meta: JSON.parse(m[1]) };
  const script = text.match(/<script[^>]+type=["']application\/json["'][^>]*data-catalog[^>]*>([\s\S]*?)<\/script>/i);
  if (script) return parseJson(Buffer.from(script[1]), options);
  return parseTextNarrative(Buffer.from(text.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ')), options, 'html');
}
function parseZipBundle(buffer, options = {}) {
  const zip = readZip(buffer);
  for (const name of ['catalog.json', 'catalog/catalog.json', 'data/catalog.json']) if (zip.has(name)) return parseJson(zip.get(name), { ...options, title: options.title || path.basename(name) });
  for (const name of zip.names.filter(n => /explorer\.html$/i.test(n))) {
    const parsed = extractCatalogFromHtml(zip.get(name), options); if (parsed.items?.length) return parsed;
  }
  throw new Error('ZIP is not a recognized catalog bundle');
}
function detectFormat(filePath, buffer) {
  const ext = path.extname(filePath || '').toLowerCase();
  if (ACCEPTED_EXTENSIONS.has(ext)) return ext.slice(1);
  if (buffer?.subarray(0, 2).toString('ascii') === 'PK') return 'zip';
  if (buffer?.subarray(0, 5).toString('ascii') === '%PDF-') return 'pdf';
  const sample = buffer?.subarray(0, 256).toString('utf8').trim() || '';
  if (sample.startsWith('{') || sample.startsWith('[')) return 'json';
  return 'txt';
}
function parseSourceBuffer(buffer, options = {}) {
  if (!Buffer.isBuffer(buffer)) buffer = Buffer.from(buffer);
  const format = String(options.format || detectFormat(options.filePath || options.title || '', buffer)).toLowerCase();
  const common = { ...options, sourceKey: options.sourceKey || sha256(buffer).slice(0, 16) };
  if (format === 'xlsx' || format === 'xlsm') return parseXlsx(buffer, common);
  if (format === 'csv') return parseCsvLike(buffer, common, ',');
  if (format === 'tsv') return parseCsvLike(buffer, common, '\t');
  if (format === 'json' || format === 'catalog') return parseJson(buffer, common);
  if (format === 'docx') return parseDocx(buffer, common);
  if (format === 'pdf') return parsePdf(buffer, common);
  if (format === 'md' || format === 'markdown') return parseTextNarrative(buffer, common, 'md');
  if (format === 'html' || format === 'htm') return extractCatalogFromHtml(buffer, common);
  if (format === 'zip') {
    try { return parseZipBundle(buffer, common); } catch {
      const zip = readZip(buffer);
      if (zip.has('xl/workbook.xml')) return parseXlsx(buffer, common);
      if (zip.has('word/document.xml')) return parseDocx(buffer, common);
      throw new Error('Unsupported ZIP contents');
    }
  }
  return parseTextNarrative(buffer, common, 'txt');
}
function acceptedPath(filePath) { return ACCEPTED_EXTENSIONS.has(path.extname(String(filePath || '')).toLowerCase()); }
function readAndParse(filePath, options = {}) {
  const buffer = fs.readFileSync(filePath);
  return { buffer, hash: sha256(buffer), parsed: parseSourceBuffer(buffer, { ...options, filePath, title: options.title || path.basename(filePath) }) };
}

module.exports = {
  ACCEPTED_EXTENSIONS, acceptedPath, sha256, safeUrl, urlsFromText, detectFormat,
  parseSourceBuffer, readAndParse, parseXlsx, parseDocx, parsePdf, parseJson, parseCsvLike,
  extractCatalogFromHtml, normalizeObjectRows
};
