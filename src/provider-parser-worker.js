'use strict';
const { parentPort } = require('worker_threads');
const { parseGenericProjectHtml, parseProviderHeadMedia, parseCurseForgeGalleryStreamSeed } = require('./provider-media');
parentPort.on('message', msg => {
  const { id, mode, html, url, context } = msg || {};
  try {
    let result = null;
    if (mode === 'head') result = parseProviderHeadMedia(String(html || ''), url, context || {});
    else if (mode === 'curseforge-stream') result = parseCurseForgeGalleryStreamSeed(String(html || ''), url, context || {});
    else result = parseGenericProjectHtml(String(html || ''), url, context || {});
    parentPort.postMessage({ id, result });
  } catch (error) {
    parentPort.postMessage({ id, error: String(error?.stack || error?.message || error) });
  }
});
