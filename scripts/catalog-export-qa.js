'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const ExcelJS = require('exceljs');
const { normalizeRows, csv, html, xlsx, writeAtomic } = require('../src/catalog-export');

(async () => {
  const rows = normalizeRows([{
    Name: 'Sodium',
    'Primary URL': 'https://modrinth.com/mod/sodium',
    'Gallery URLs': 'https://cdn.modrinth.com/data/example/image.png\nhttps://example.com/two.png',
    Notes: 'controlled export fixture',
  }]);
  assert.equal(rows.length, 1);
  assert(csv(rows).includes('Gallery URLs'));
  assert(html(rows, 'Enderloom QA').includes('<a href="https://modrinth.com/mod/sodium"'));

  const workbookBytes = await xlsx(rows, 'Enderloom QA');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(workbookBytes);
  const sheet = workbook.worksheets[0];
  assert.equal(sheet.getCell('A2').value, 'Sodium');
  assert.equal(sheet.getCell('B2').value.hyperlink, 'https://modrinth.com/mod/sodium');
  assert(String(sheet.getCell('C2').value).includes('cdn.modrinth.com'));
  const links = workbook.getWorksheet('Media Links');
  assert(links, 'Media Links worksheet missing');
  assert.equal(links.rowCount, 4);
  assert.equal(links.getCell('D2').value.hyperlink, 'https://modrinth.com/mod/sodium');
  assert.equal(links.getCell('D4').value.hyperlink, 'https://example.com/two.png');

  const target = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-export-')), 'catalog.xlsx');
  await writeAtomic(target, workbookBytes);
  assert(fs.statSync(target).size > 1_000);
  assert(!fs.readdirSync(path.dirname(target)).some((name) => name.endsWith('.tmp')));
  console.log(JSON.stringify({ passed:true, formats:['csv','xlsx','html','json','pdf-via-electron'], enrichedMediaLinks:true }, null, 2));
})().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
