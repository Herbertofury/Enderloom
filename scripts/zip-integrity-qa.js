'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { readZip } = require('../src/zip-lite');
const { parseSourceBuffer } = require('../src/ingest');
let count = 0;
function check(name, run) { run(); console.log(`PASS ${name}`); count++; }
function archive(rows) {
  let offset = 0;
  const locals = [], central = [];
  for (const row of rows) {
    const name = Buffer.from(row.name), data = Buffer.from(row.data), method = row.method ?? 8;
    const packed = method === 8 ? zlib.deflateRawSync(data) : data;
    const crc = row.crc ?? zlib.crc32(data), size = row.size ?? data.length, flags = 0x800 | (row.flags || 0);
    const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50); local.writeUInt16LE(20, 4);
    local.writeUInt16LE(flags, 6); local.writeUInt16LE(method, 8); local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(packed.length, 18); local.writeUInt32LE(size, 22); local.writeUInt16LE(name.length, 26);
    const entry = Buffer.alloc(46); entry.writeUInt32LE(0x02014b50); entry.writeUInt16LE(20, 4); entry.writeUInt16LE(20, 6);
    entry.writeUInt16LE(flags, 8); entry.writeUInt16LE(method, 10); entry.writeUInt32LE(crc, 16);
    entry.writeUInt32LE(packed.length, 20); entry.writeUInt32LE(size, 24); entry.writeUInt16LE(name.length, 28); entry.writeUInt32LE(offset, 42);
    const descriptor = Buffer.alloc(flags & 8 ? 16 : 0);
    if (flags & 8) { local.fill(0,14,26); descriptor.writeUInt32LE(0x08074b50); descriptor.writeUInt32LE(crc,4); descriptor.writeUInt32LE(packed.length,8); descriptor.writeUInt32LE(size,12); }
    locals.push(local, name, packed, descriptor); central.push(entry, name); offset += 30 + name.length + packed.length + descriptor.length;
  }
  const directory = Buffer.concat(central), end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50);
  end.writeUInt16LE(rows.length, 8); end.writeUInt16LE(rows.length, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}
for (const method of [0, 8]) {
  check(`method ${method}: binary/unicode exact bytes and cache`, () => {
    const data = Buffer.concat([Buffer.from('雪🌟\0'), Buffer.from(Array.from({length:256}, (_,i)=>i))]);
    const zip = readZip(archive([{name:'雪.bin',data,method}]));
    assert.deepEqual(zip.get('雪.bin'), data); assert.strictEqual(zip.get('雪.bin'), zip.get('雪.bin'));
  });
  check(`method ${method}: empty entry`, () => assert.equal(readZip(archive([{name:'empty',data:'',method}])).get('empty').length, 0));
  check(`method ${method}: bad CRC rejected repeatedly`, () => {
    const zip = readZip(archive([{name:'bad',data:'wrong',method,crc:0}]));
    for (let i=0;i<2;i++) assert.throws(()=>zip.get('bad'), /checksum mismatch/);
  });
  for (const size of [0, 2, 10]) check(`method ${method}: false size ${size} rejected`, () => {
    const zip=readZip(archive([{name:'bad',data:'12345',method,size}]));
    assert.throws(()=>zip.get('bad'));
  });
  check(`method ${method}: declared entry budget`, () => assert.throws(()=>readZip(archive([{name:'x',data:'12345',method}]),{maxEntryBytes:4}).get('x'), /entry too large/));
  check(`method ${method}: total budget and cache`, () => {
    const zip=readZip(archive([{name:'a',data:'123',method},{name:'b',data:'456',method}]),{maxTotalBytes:5});
    assert.equal(zip.text('a'),'123'); assert.equal(zip.text('a'),'123'); assert.throws(()=>zip.get('b'), /safety limit/);
  });
  check(`method ${method}: failed checksum does not consume budget`, () => {
    const zip=readZip(archive([{name:'bad',data:'123',method,crc:0},{name:'good',data:'456',method}]),{maxTotalBytes:3});
    assert.throws(()=>zip.get('bad'), /checksum mismatch/); assert.equal(zip.text('good'),'456');
  });
  check(`method ${method}: encrypted payload rejected`, () => assert.throws(()=>readZip(archive([{name:'x',data:'123',method,flags:1}])).get('x'), /Encrypted/));
  check(`method ${method}: descriptor flag central integrity`, () => assert.equal(readZip(archive([{name:'x',data:'123',method,flags:8}])).text('x'),'123'));
}
check('stored payload mutation rejected',()=>{
 const bytes=archive([{name:'x',data:'123',method:0}]); bytes[31]^=1;
 assert.throws(()=>readZip(bytes).get('x'), /checksum mismatch/);
});
for (const name of ['tiny-catalog.xlsx','tiny-guide.docx','tiny-bundle.zip','twp-update-fixture.zip']) check(`existing fixture ${name}: every entry`,()=>{
 const zip=readZip(fs.readFileSync(path.join(__dirname,'fixtures',name)));
 assert(zip.names.length); for (const entry of zip.names) assert(Buffer.isBuffer(zip.get(entry)));
});
check('missing entry remains null',()=>assert.equal(readZip(archive([])).get('absent'),null));
for (const name of ['tiny-catalog.xlsx','tiny-guide.docx','tiny-bundle.zip']) check(`ingest valid ${name}`,()=>{
 const bytes=fs.readFileSync(path.join(__dirname,'fixtures',name)); const parsed=parseSourceBuffer(bytes,{filePath:name});
 assert((parsed.items?.length || parsed.documents?.length)>0);
});
check('corrupt catalog bundle rejected by ingestion',()=>{
 const bytes=archive([{name:'catalog.json',data:'{"items":[{"name":"Kept"}]}',crc:0}]);
 assert.throws(()=>parseSourceBuffer(bytes,{filePath:'test.zip'}));
});
check('corrupt DOCX content rejected by ingestion',()=>{
 const bytes=archive([{name:'word/document.xml',data:'<w:document><w:t>Text</w:t></w:document>',crc:0}]);
 assert.throws(()=>parseSourceBuffer(bytes,{filePath:'test.docx'}), /checksum mismatch/);
});
console.log(`${count} ZIP integrity checks passed`);
