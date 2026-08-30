'use strict';
const { parentPort } = require('worker_threads');
const { parseSourceBuffer, sha256 } = require('./ingest');
parentPort.on('message', msg => {
  try {
    const buffer = Buffer.from(msg.buffer);
    const parsed = parseSourceBuffer(buffer, msg.options || {});
    parentPort.postMessage({ ok:true, parsed, hash:sha256(buffer) });
  } catch (error) {
    parentPort.postMessage({ ok:false, error:String(error?.stack || error) });
  }
});
