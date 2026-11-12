'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const ExcelJS = require('exceljs');
const { normalizeRows, csv, html, xlsx, bytesFor, writeAtomic } = require('../src/catalog-export');

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

  // Exercise actual workbook round trips for user titles, not only a helper.
  for (const title of ['Media Links', 'media links', 'History', "'Favorites'", "['Favorites']", '[Forge]/Mods:*?', "'", 'A'.repeat(30) + '🎮', '🎮'.repeat(20)]) {
    const bytes = await xlsx(rows, title);
    const roundTrip = new ExcelJS.Workbook();
    await roundTrip.xlsx.load(bytes);
    const catalog = roundTrip.worksheets[0];
    assert(catalog.name.length <= 31, `${title}: worksheet name too long`);
    assert(!/[\[\]:*?\\/]/.test(catalog.name), `${title}: invalid worksheet character`);
    assert(!/^'|'$/.test(catalog.name), `${title}: edge apostrophe`);
    assert.notEqual(catalog.name.toLowerCase(), 'history');
    assert.notEqual(catalog.name.toLowerCase(), 'media links');
    assert.equal(catalog.getCell('A2').value, 'Sodium');
    assert.equal(catalog.getCell('B2').value.hyperlink, rows[0]['Primary URL']);
    assert.equal(roundTrip.getWorksheet('Media Links').rowCount, 4);
    assert.equal(roundTrip.getWorksheet('Media Links').getCell('D4').value.hyperlink, 'https://example.com/two.png');
    assert(!/[\uD800-\uDBFF]$/.test(catalog.name), `${title}: split surrogate`);
  }

  // Imported headers must remain ordinary data, not prototype lookups. Cover
  // both normalized IPC input and public format helpers with plain JSON rows.
  const specialHeaders = ['__proto__', 'constructor', 'toString', 'hasOwnProperty', 'valueOf', '__defineGetter__'];
  const rawSpecial = [JSON.parse(JSON.stringify(Object.fromEntries([
    ['Name', 'First'], ...specialHeaders.map((key) => [key, `preserved ${key}`]),
  ]))), { Name: 'Second' }];
  for (const specialRows of [rawSpecial, normalizeRows(rawSpecial)]) {
    const csvText = csv(specialRows);
    const htmlText = html(specialRows, 'Custom fields');
    assert(!csvText.includes('[native code]'));
    assert(!htmlText.includes('[native code]'));
    assert(csvText.endsWith('"Second",' + specialHeaders.map(() => '""').join(',')));
    assert(htmlText.includes('<td>Second</td>' + specialHeaders.map(() => '<td></td>').join('')));
    const jsonRows = JSON.parse(await bytesFor('json', specialRows, 'Custom fields')).rows;
    const specialBook = new ExcelJS.Workbook();
    await specialBook.xlsx.load(await xlsx(specialRows, 'Custom fields'));
    const specialSheet = specialBook.worksheets[0];
    for (const [index, key] of specialHeaders.entries()) {
      assert(Object.hasOwn(specialRows[0], key), `${key}: lost during normalization`);
      assert.equal(jsonRows[0][key], `preserved ${key}`);
      assert(csvText.includes(`"preserved ${key}"`));
      assert(htmlText.includes(`<td>preserved ${key}</td>`));
      assert.equal(specialSheet.getCell(1, index + 2).value, key);
      assert.equal(specialSheet.getCell(2, index + 2).value, `preserved ${key}`);
      assert.equal(specialSheet.getCell(3, index + 2).value || '', '');
    }
  }
  assert.equal(Object.prototype.polluted, undefined);

  const target = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-export-')), 'catalog.xlsx');
  await writeAtomic(target, workbookBytes);
  assert(fs.statSync(target).size > 1_000);
  assert(!fs.readdirSync(path.dirname(target)).some((name) => name.endsWith('.tmp')));
  console.log(JSON.stringify({ passed:true, formats:['csv','xlsx','html','json','pdf-via-electron'], enrichedMediaLinks:true }, null, 2));
})().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});

