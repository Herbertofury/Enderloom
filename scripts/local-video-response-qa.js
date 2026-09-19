'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), assert = require('assert/strict');
const { localVideoResponse } = require('../src/local-video-response');
const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-video-'));
const file = path.join(folder, 'video.mp4'), bytes = Buffer.from('0123456789'); fs.writeFileSync(file, bytes);
const get = (range, method = 'GET', target = file) => localVideoResponse(new Request('https://local/video', { method, headers: range ? { Range: range } : {} }), target);
(async () => {
  for (const [range, status, body, contentRange] of [[null, 200, '0123456789', null], ['bytes=0-2', 206, '012', 'bytes 0-2/10'], ['bytes=7-', 206, '789', 'bytes 7-9/10'], ['bytes=-3', 206, '789', 'bytes 7-9/10'], ['bytes=8-999', 206, '89', 'bytes 8-9/10']]) {
    const result = get(range); assert.equal(result.status, status); assert.equal(result.headers.get('Content-Range'), contentRange); assert.equal(result.headers.get('Content-Length'), String(body.length)); assert.equal(await result.text(), body);
  }
  for (const range of ['bytes=10-', 'bytes=3-2', 'bytes=-0', 'bytes=-', 'bytes=0-1,4-5', 'bytes=99999999999999999-']) { const r = get(range); assert.equal(r.status, 416, range); assert.equal(r.headers.get('Content-Range'), 'bytes */10'); }
  const head = get('bytes=0-2', 'HEAD'); assert.equal(head.status, 200); assert.equal(head.headers.get('Content-Length'), '10'); assert.equal(await head.text(), '');
  assert.equal(get(null, 'POST').status, 405);
  const empty = path.join(folder, 'empty.webm'); fs.writeFileSync(empty, ''); assert.equal(await get(null, 'GET', empty).text(), ''); assert.equal(get('bytes=0-', 'GET', empty).status, 416);
  const response = get(); await response.body.cancel();
  console.log('PASS local video: complete reads, explicit/open/suffix ranges, seeking boundaries, HEAD, empty files, unsupported requests and stream cancellation.');
})().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => fs.rmSync(folder, { recursive: true, force: true }));
