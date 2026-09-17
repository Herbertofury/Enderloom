'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function createBrowserDownloads({ directory, statePath, publish }) {
  const records = new Map(), items = new Map();
  try {
    for (const record of JSON.parse(fs.readFileSync(statePath, 'utf8'))) {
      if (record.id && typeof record.savePath === 'string' && path.dirname(record.savePath) === directory)
        records.set(record.id, { ...record, state: ['progressing', 'paused'].includes(record.state) ? 'interrupted' : record.state });
    }
  } catch (error) {
    if (error.code !== 'ENOENT' && fs.existsSync(statePath)) fs.copyFileSync(statePath, `${statePath}.unreadable-${Date.now()}`);
  }
  const list = () => [...records.values()];
  function save() {
    fs.mkdirSync(path.dirname(statePath), { recursive: true });
    const temporary = `${statePath}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(list())); fs.renameSync(temporary, statePath);
  }
  function reserve(filename) {
    let name = path.basename(filename).replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').replace(/[. ]+$/, '') || 'Download';
    if (/^(con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(name)) name = '_' + name;
    const ext = path.extname(name), stem = name.slice(0, name.length - ext.length);
    fs.mkdirSync(directory, { recursive: true });
    for (let index = 0; ; index++) {
      const candidate = path.join(directory, index ? `${stem} (${index})${ext}` : name);
      try { fs.closeSync(fs.openSync(candidate, 'wx')); return candidate; }
      catch (error) { if (error.code !== 'EEXIST') throw error; }
    }
  }
  function receive(item) {
    const id = crypto.randomUUID(), savePath = reserve(item.getFilename());
    item.setSavePath(savePath);
    const record = { id, filename: path.basename(savePath), savePath, state: 'progressing', received: 0, total: item.getTotalBytes(), startedAt: Date.now() };
    records.set(id, record); items.set(id, item); save(); publish({ type: 'created', ...record });
    item.on('updated', (_event, state) => {
      record.state = item.isPaused() ? 'paused' : state;
      record.received = item.getReceivedBytes(); record.total = item.getTotalBytes();
      publish({ type: 'updated', ...record });
    });
    item.once('done', (_event, state) => {
      record.state = state; record.received = item.getReceivedBytes(); record.total = item.getTotalBytes(); record.finishedAt = Date.now();
      items.delete(id); save(); publish({ type: 'done', ...record });
    });
    return record;
  }
  function control(id, action) {
    const item = items.get(id), record = records.get(id);
    if (!item) throw Error('This download is no longer active.');
    if (action === 'cancel') item.cancel();
    else if (action === 'pause') item.pause();
    else if (action === 'resume' && item.canResume()) item.resume();
    else throw Error('This download cannot resume. Start it again from its project page.');
    if (action !== 'cancel') { record.state = item.isPaused() ? 'paused' : 'progressing'; publish({ type: 'updated', ...record }); }
  }
  return { list, receive, control, get: id => records.get(id) };
}
module.exports = { createBrowserDownloads };
