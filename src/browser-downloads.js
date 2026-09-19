'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Readable, Transform } = require('stream');
const { pipeline } = require('stream/promises');

function downloadTarget(raw) {
  const url = new URL(String(raw || ''));
  if (url.protocol !== 'https:' || url.username || url.password) throw Error('Use an HTTPS file link without embedded credentials.');
  let sourcePage = url.origin + url.pathname;
  if (url.hostname === 'drive.google.com') {
    const id = url.pathname.match(/^\/file\/d\/([\w-]+)/)?.[1] || url.searchParams.get('id');
    if (!id || !/^[\w-]+$/.test(id)) throw Error('Use a Google Drive file link, not a folder link.');
    sourcePage = `https://drive.google.com/file/d/${id}/view`;
    return { url: `https://drive.usercontent.google.com/download?id=${id}&export=download`, sourcePage };
  }
  url.hash = '';
  return { url: url.href, sourcePage };
}

function createBrowserDownloads({ directory, statePath, publish, fetch: sessionFetch, safeStorage }) {
  const records = new Map(), items = new Map(), requests = new Map(), transfers = new Map(), queue = [];
  let active = 0;
  try {
    for (const record of JSON.parse(fs.readFileSync(statePath, 'utf8'))) {
      if (record.id && typeof record.savePath === 'string' && path.dirname(record.savePath) === directory)
        records.set(record.id, { ...record, state: ['progressing', 'paused', 'queued', 'verifying'].includes(record.state) ? 'interrupted' : record.state });
    }
  } catch (error) {
    if (error.code !== 'ENOENT' && fs.existsSync(statePath)) fs.copyFileSync(statePath, `${statePath}.unreadable-${Date.now()}`);
  }
  try { if (safeStorage?.isEncryptionAvailable()) for (const [id, value] of JSON.parse(safeStorage.decryptString(fs.readFileSync(`${statePath}.requests`)))) if (records.has(id)) requests.set(id, value); } catch {}
  const list = () => [...records.values()];
  function save() {
    fs.mkdirSync(path.dirname(statePath), { recursive: true });
    const temporary = `${statePath}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(list())); fs.renameSync(temporary, statePath);
    // Signed links can contain bearer tokens. They are never included in public
    // download records, renderer events, CLI receipts or plain JSON on disk.
    if (safeStorage?.isEncryptionAvailable()) {
      const secretTemp = `${statePath}.requests.tmp`;
      fs.writeFileSync(secretTemp, safeStorage.encryptString(JSON.stringify([...requests])));
      fs.renameSync(secretTemp, `${statePath}.requests`);
    }
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
    if (records.get(id)?.background) {
      const record = records.get(id);
      if (action === 'cancel' && ['progressing','queued'].includes(record.state)) { record.state = 'cancelled'; transfers.get(id)?.abort(); save(); publish({type:'updated',...record}); return; }
      if (action === 'retry' && !transfers.has(id) && !['progressing','queued','completed'].includes(record.state)) {
        if (!requests.has(id)) throw Error('Paste the file link again to restart this download.');
        record.savePath=reserve(record.filename);record.filename=path.basename(record.savePath);
        record.state='queued'; record.error=''; record.received=0; save(); publish({type:'updated',...record}); queue.push(id); pump(); return;
      }
      throw Error('This background transfer supports Cancel and Retry.');
    }
    const item = items.get(id), record = records.get(id);
    if (!item) throw Error('This download is no longer active.');
    if (action === 'cancel') item.cancel();
    else if (action === 'pause') item.pause();
    else if (action === 'resume' && item.canResume()) item.resume();
    else throw Error('This download cannot resume. Start it again from its project page.');
    if (action !== 'cancel') { record.state = item.isPaused() ? 'paused' : 'progressing'; publish({ type: 'updated', ...record }); }
  }
  function start(options) {
    if (!sessionFetch) throw Error('The browser download session is unavailable.');
    const target = downloadTarget(options?.url);
    const expected = String(options?.sha256 || '').trim().toLowerCase();
    if (expected && !/^[a-f\d]{64}$/.test(expected)) throw Error('Expected SHA-256 must contain 64 hexadecimal characters.');
    const id = crypto.randomUUID();
    const filename = String(options?.filename || new URL(target.sourcePage).pathname.split('/').pop() || 'Download');
    const savePath = reserve(filename === 'view' ? 'Drive download' : filename);
    const record = { id, filename:path.basename(savePath), savePath, sourcePage:target.sourcePage, background:true, state:'queued', received:0, total:0, startedAt:Date.now() };
    requests.set(id,{url:target.url,expected,allowNameFromServer:!options?.filename}); records.set(id,record); save(); publish({type:'created',...record}); queue.push(id); pump(); return { ...record };
  }
  function pump() {
    while (active < 3 && queue.length) {
      const id=queue.shift(); if (records.get(id)?.state !== 'queued') continue;
      active++; void transfer(id).finally(()=>{active--;pump();});
    }
  }
  async function transfer(id) {
    const record=records.get(id), request=requests.get(id), controller=new AbortController();
    transfers.set(id,controller); record.state='progressing'; record.error='';
    let failure='Transfer failed. Check your connection and retry.', timeout;
    const touch=()=>{clearTimeout(timeout);timeout=setTimeout(()=>{failure='The server stopped responding. Retry the download.';controller.abort();},180000);timeout.unref?.();};
    if(record.partialPath && path.dirname(record.partialPath)===directory && record.partialPath.endsWith(`.${id}.part`)) { try { fs.unlinkSync(record.partialPath); } catch {} }
    const partial=`${record.savePath}.${id}.part`; record.partialPath=partial;
    try {
      save(); publish({type:'updated',...record});touch();
      let url=request.url, response; const visited=new Set();
      for (;;) {
        if(visited.has(url)||visited.size>=20){failure='The server returned a redirect loop. Open the source page.';throw Error();} visited.add(url);
        response=await sessionFetch(url,{credentials:'include',redirect:'manual',signal:controller.signal});touch();
        if (![301,302,303,307,308].includes(response.status)) break;
        const location=response.headers.get('location');await response.body?.cancel();
        if(!location)throw Error();url=new URL(location,url).href;
        const next=new URL(url);if(next.protocol!=='https:'||next.username||next.password){failure='The server redirected outside HTTPS. Open the source page.';throw Error();}
      }
      if ([401,403].includes(response.status)) { record.state='sign-in-required'; failure='Open the source page, sign in or confirm access, then retry.';await response.body?.cancel();throw Error(); }
      if (!response.ok) { failure=`Server returned HTTP ${response.status}. Open the source page or retry.`;await response.body?.cancel();throw Error(); }
      if (/text\/html|application\/xhtml/i.test(response.headers.get('content-type')||'')) {record.state='sign-in-required';failure='This link returned a web page. Open it to sign in or confirm the download.';await response.body?.cancel();throw Error();}
      if(!response.body)throw Error();
      const disposition=response.headers.get('content-disposition')||'';
      let supplied=disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
      try { supplied=supplied?decodeURIComponent(supplied):disposition.match(/filename="([^"]+)"|filename=([^;]+)/i)?.slice(1).find(Boolean); } catch { supplied=''; }
      if (supplied && request.allowNameFromServer) {
        const renamed=reserve(supplied); if(fs.statSync(record.savePath).size===0)fs.unlinkSync(record.savePath); record.savePath=renamed;record.filename=path.basename(renamed);
      }
      record.total=Number(response.headers.get('content-length'))||0;
      const hash=crypto.createHash('sha256'); let last=0, prefix=Buffer.alloc(0), checked=false;
      const inspect=new Transform({transform(chunk,_encoding,callback){
        touch();if(!checked){prefix=Buffer.concat([prefix,chunk.subarray(0,512-prefix.length)]);if(prefix.length>=32){checked=true;if(/^\s*(<!doctype\s+html|<html\b)/i.test(prefix.toString('utf8'))){record.state='sign-in-required';failure='The server sent a sign-in page instead of the file.';callback(Error());return;}}}
        hash.update(chunk);record.received+=chunk.length;if(Date.now()-last>120){last=Date.now();publish({type:'updated',...record});}callback(null,chunk);
      }});
      await pipeline(Readable.fromWeb(response.body),inspect,fs.createWriteStream(partial,{flags:'wx'}),{signal:controller.signal});
      if(/^\s*(<!doctype\s+html|<html\b)/i.test(prefix.toString('utf8'))){record.state='sign-in-required';failure='The server sent a sign-in page instead of the file.';throw Error();}
      const digest=hash.digest('hex');
      if(request.expected&&digest!==request.expected){failure=`SHA-256 mismatch. Expected ${request.expected}; received ${digest}. The file was not promoted.`;throw Error();}
      // A cancelled request can finish reading at the same instant as Cancel.
      if(controller.signal.aborted||record.state==='cancelled')throw Error();
      if(fs.statSync(record.savePath).size!==0){failure='The destination was changed during the download. Retry to save a separate copy.';throw Error();}
      fs.renameSync(partial,record.savePath);record.sha256=digest;record.hashVerified=!!request.expected;record.state='completed';
      requests.delete(id);
    } catch {
      if(record.state!=='cancelled'&&record.state!=='sign-in-required')record.state='interrupted';
      record.error=record.state==='cancelled'?'Download cancelled.':failure;
      try { fs.unlinkSync(partial); } catch {}
      try { if(fs.statSync(record.savePath).size===0)fs.unlinkSync(record.savePath); } catch {}
    } finally {
      clearTimeout(timeout);transfers.delete(id);delete record.partialPath;record.finishedAt=Date.now();save();publish({type:'done',...record});
    }
  }
  return { list, receive, start, control, get: id => records.get(id) };
}
module.exports = { createBrowserDownloads, downloadTarget };
