'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { Readable } = require('node:stream');

// The caller validates the allowed root, extension and absence of symlink escapes.
// Explicit ranges are essential for Chromium to seek without buffering a whole test.
function localVideoResponse(request, target) {
  const size = fs.statSync(target).size;
  const headers = new Headers({ 'Content-Type': path.extname(target).toLowerCase() === '.webm' ? 'video/webm' : 'video/mp4', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' });
  const method = request.method || 'GET';
  if (!['GET', 'HEAD'].includes(method)) return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
  let start = 0, end = size - 1, status = 200;
  const range = method === 'GET' ? request.headers.get('range') : null;
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    let valid = !!match && !!(match[1] || match[2]) && size > 0;
    if (valid) {
      if (!match[1]) { const suffix = Number(match[2]); valid = Number.isSafeInteger(suffix) && suffix > 0; start = Math.max(0, size - suffix); }
      else { start = Number(match[1]); end = match[2] ? Number(match[2]) : end; valid = Number.isSafeInteger(start) && Number.isSafeInteger(end) && start <= end && start < size; end = Math.min(end, size - 1); }
    }
    if (!valid) { headers.set('Content-Range', `bytes */${size}`); return new Response(null, { status: 416, headers }); }
    status = 206; headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  }
  headers.set('Content-Length', String(Math.max(0, end - start + 1)));
  if (method === 'HEAD' || size === 0) return new Response(null, { status, headers });
  const stream = fs.createReadStream(target, { start, end });
  const abort = () => stream.destroy();
  if (request.signal?.aborted) abort();
  else request.signal?.addEventListener('abort', abort, { once: true });
  stream.once('close', () => request.signal?.removeEventListener('abort', abort));
  return new Response(Readable.toWeb(stream), { status, headers });
}
module.exports = { localVideoResponse };
