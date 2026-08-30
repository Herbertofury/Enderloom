'use strict';

const zlib = require('zlib');

function findEocd(buffer) {
  const sig = 0x06054b50;
  const min = Math.max(0, buffer.length - 0xffff - 22);
  for (let i = buffer.length - 22; i >= min; i--) {
    if (buffer.readUInt32LE(i) === sig) return i;
  }
  throw new Error('ZIP end-of-central-directory record not found');
}

function normalizeName(name) {
  return String(name || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function readZip(buffer, options = {}) {
  if (!Buffer.isBuffer(buffer)) buffer = Buffer.from(buffer);
  const maxEntries = Number(options.maxEntries || 20000);
  const maxEntryBytes = Number(options.maxEntryBytes || 128 * 1024 * 1024);
  const maxTotalBytes = Number(options.maxTotalBytes || 512 * 1024 * 1024);
  const eocd = findEocd(buffer);
  const entryCount = buffer.readUInt16LE(eocd + 10);
  const centralOffset = buffer.readUInt32LE(eocd + 16);
  if (entryCount > maxEntries) throw new Error(`ZIP has too many entries: ${entryCount}`);
  let cursor = centralOffset;
  let inflatedTotal = 0;
  const metadata = new Map();
  for (let i = 0; i < entryCount; i++) {
    if (cursor + 46 > buffer.length || buffer.readUInt32LE(cursor) !== 0x02014b50) {
      throw new Error(`Invalid ZIP central directory at entry ${i}`);
    }
    const flags = buffer.readUInt16LE(cursor + 8);
    const method = buffer.readUInt16LE(cursor + 10);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const uncompressedSize = buffer.readUInt32LE(cursor + 24);
    const nameLen = buffer.readUInt16LE(cursor + 28);
    const extraLen = buffer.readUInt16LE(cursor + 30);
    const commentLen = buffer.readUInt16LE(cursor + 32);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    const utf8 = !!(flags & 0x0800);
    const rawName = buffer.subarray(cursor + 46, cursor + 46 + nameLen);
    const name = normalizeName(rawName.toString(utf8 ? 'utf8' : 'latin1'));
    metadata.set(name, { name, method, compressedSize, uncompressedSize, localOffset, flags });
    cursor += 46 + nameLen + extraLen + commentLen;
  }

  const cache = new Map();
  function get(name) {
    name = normalizeName(name);
    if (cache.has(name)) return cache.get(name);
    const meta = metadata.get(name);
    if (!meta) return null;
    if (meta.uncompressedSize > maxEntryBytes) throw new Error(`ZIP entry too large: ${name}`);
    const off = meta.localOffset;
    if (off + 30 > buffer.length || buffer.readUInt32LE(off) !== 0x04034b50) {
      throw new Error(`Invalid ZIP local header: ${name}`);
    }
    const localNameLen = buffer.readUInt16LE(off + 26);
    const localExtraLen = buffer.readUInt16LE(off + 28);
    const start = off + 30 + localNameLen + localExtraLen;
    const end = start + meta.compressedSize;
    if (end > buffer.length) throw new Error(`Truncated ZIP entry: ${name}`);
    const compressed = buffer.subarray(start, end);
    let out;
    if (meta.method === 0) out = Buffer.from(compressed);
    else if (meta.method === 8) out = zlib.inflateRawSync(compressed, { maxOutputLength: maxEntryBytes });
    else throw new Error(`Unsupported ZIP compression method ${meta.method}: ${name}`);
    inflatedTotal += out.length;
    if (inflatedTotal > maxTotalBytes) throw new Error('ZIP expanded data exceeds safety limit');
    cache.set(name, out);
    return out;
  }

  function text(name, encoding = 'utf8') {
    const b = get(name);
    return b ? b.toString(encoding) : null;
  }

  return {
    names: [...metadata.keys()],
    has: name => metadata.has(normalizeName(name)),
    meta: name => metadata.get(normalizeName(name)) || null,
    get,
    text
  };
}

module.exports = { readZip, normalizeName };
