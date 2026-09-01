'use strict';

const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

function cleanName(value) {
  return String(value || 'Catalog').replace(/[<>:"/\\|?*\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120) || 'Catalog';
}

function normalizeRows(input) {
  const rows = Array.isArray(input) ? input.slice(0, 20_000) : [];
  return rows.map((row) => {
    const out = {};
    for (const [key, value] of Object.entries(row && typeof row === 'object' ? row : {}).slice(0, 80)) {
      const label = String(key).replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 120);
      if (!label) continue;
      out[label] = String(value ?? '').replace(/\u0000/g, '').slice(0, 65_000);
    }
    return out;
  });
}

function columnsFor(rows) {
  const columns = [];
  const seen = new Set();
  for (const row of rows) for (const key of Object.keys(row)) if (!seen.has(key)) {
    seen.add(key);
    columns.push(key);
  }
  return columns;
}

function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function csv(rows) {
  const columns = columnsFor(rows);
  return '\uFEFF' + [columns.map(csvCell).join(','), ...rows.map((row) => columns.map((key) => csvCell(row[key])).join(','))].join('\r\n');
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[character]);
}

function linkedHtml(value) {
  const escaped = escapeHtml(value);
  return escaped.replace(/https?:\/\/[^\s<]+/g, (url) => `<a href="${url}" target="_blank" rel="noreferrer">${url}</a>`).replace(/\n/g, '<br>');
}

function html(rows, title) {
  const columns = columnsFor(rows);
  const head = columns.map((key) => `<th>${escapeHtml(key)}</th>`).join('');
  const body = rows.map((row) => `<tr>${columns.map((key) => `<td>${linkedHtml(row[key])}</td>`).join('')}</tr>`).join('\n');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{font:12px system-ui,sans-serif;color:#17171d;margin:24px}h1{font-size:22px}p{color:#5b5b68}table{border-collapse:collapse;width:100%;table-layout:auto}th,td{border:1px solid #d9d9e1;padding:6px 8px;text-align:left;vertical-align:top;overflow-wrap:anywhere}th{background:#eeeef5;position:sticky;top:0}tr:nth-child(even){background:#fafafe}a{color:#5d35d5}@page{size:landscape;margin:10mm}@media print{body{margin:0;font-size:8px}th{position:static}}</style></head><body><h1>${escapeHtml(title)}</h1><p>Enderloom media-enriched catalog export · ${rows.length.toLocaleString()} entries</p><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`;
}

async function xlsx(rows, title) {
  const columns = columnsFor(rows);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Enderloom';
  workbook.created = new Date();
  const sheet = workbook.addWorksheet(cleanName(title).slice(0, 31), { views: [{ state: 'frozen', ySplit: 1 }] });
  sheet.columns = columns.map((header) => ({ header, key: header, width: Math.min(60, Math.max(12, header.length + 2)) }));
  for (const row of rows) sheet.addRow(row);
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4C1D95' } };
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: Math.max(1, sheet.rowCount), column: Math.max(1, columns.length) } };
  sheet.eachRow((row, rowNumber) => {
    row.alignment = { vertical: 'top', wrapText: true };
    if (rowNumber > 1) row.height = 42;
  });
  for (let columnIndex = 1; columnIndex <= columns.length; columnIndex += 1) {
    const header = columns[columnIndex - 1];
    if (!/url|link|media|gallery/i.test(header)) continue;
    sheet.getColumn(columnIndex).eachCell((cell, rowNumber) => {
      if (rowNumber === 1) return;
      const value = String(cell.value ?? '').trim();
      if (/^https?:\/\/\S+$/.test(value)) {
        cell.value = { text: value, hyperlink: value };
        cell.font = { color: { argb: 'FF2563EB' }, underline: true };
      }
    });
  }
  const linkRows = [];
  rows.forEach((row, index) => {
    for (const [field, value] of Object.entries(row)) {
      if (!/url|link|media|gallery/i.test(field)) continue;
      const urls = String(value ?? '').match(/https?:\/\/[^\s]+/g) || [];
      for (const url of new Set(urls)) {
        linkRows.push({ row:index + 2, name:String(row.Name || row.name || ''), field, url });
        if (linkRows.length >= 200_000) break;
      }
      if (linkRows.length >= 200_000) break;
    }
  });
  if (linkRows.length) {
    const links = workbook.addWorksheet('Media Links', { views: [{ state:'frozen', ySplit:1 }] });
    links.columns = [
      { header:'Catalog row', key:'row', width:14 },
      { header:'Project', key:'name', width:36 },
      { header:'Source field', key:'field', width:24 },
      { header:'Clickable URL', key:'url', width:70 },
    ];
    for (const row of linkRows) {
      const added = links.addRow(row);
      const cell = added.getCell(4);
      cell.value = { text:row.url, hyperlink:row.url };
      cell.font = { color:{ argb:'FF2563EB' }, underline:true };
    }
    links.getRow(1).font = { bold:true, color:{ argb:'FFFFFFFF' } };
    links.getRow(1).fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF4C1D95' } };
    links.autoFilter = { from:{ row:1, column:1 }, to:{ row:links.rowCount, column:4 } };
  }
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

async function bytesFor(format, rows, title) {
  switch (format) {
    case 'xlsx': return xlsx(rows, title);
    case 'json': return Buffer.from(JSON.stringify({ title, exportedAt: new Date().toISOString(), rows }, null, 2));
    case 'html': return Buffer.from(html(rows, title));
    case 'csv': return Buffer.from(csv(rows));
    default: throw new Error(`Unsupported catalog export format: ${format}`);
  }
}

async function writeAtomic(destination, bytes) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const temporary = `${destination}.${process.pid}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(temporary, bytes);
    fs.renameSync(temporary, destination);
  } catch (error) {
    try { fs.rmSync(temporary, { force: true }); } catch {}
    throw error;
  }
}

module.exports = { cleanName, normalizeRows, columnsFor, csv, html, xlsx, bytesFor, writeAtomic };
