'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const crypto = require('crypto');

const GOOGLE_AUTH = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN = 'https://oauth2.googleapis.com/token';
const GOOGLE_REVOKE = 'https://oauth2.googleapis.com/revoke';
const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/drive.file',
];
const SHEET_TAB = 'Enderloom Enriched';

function base64url(bytes) {
  return Buffer.from(bytes).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function jsonRequest(url, { method = 'GET', headers = {}, body = null, timeoutMs = 30_000 } = {}) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const bytes = body == null ? null : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
    const request = https.request(target, {
      method,
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'identity',
        'User-Agent': 'Enderloom/2.9.6 GoogleWorkspace',
        ...(bytes ? { 'Content-Length': String(bytes.length) } : {}),
        ...headers,
      },
    }, (response) => {
      const chunks = [];
      let size = 0;
      response.on('data', (chunk) => {
        size += chunk.length;
        if (size > 32 * 1024 * 1024) {
          request.destroy(new Error('Google response exceeded the 32 MB safety limit'));
          return;
        }
        chunks.push(chunk);
      });
      response.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let parsed = null;
        try { parsed = text ? JSON.parse(text) : {}; } catch { parsed = { raw:text }; }
        if ((response.statusCode || 0) < 200 || (response.statusCode || 0) >= 300) {
          const detail = parsed?.error_description || parsed?.error?.message || parsed?.error || text || `HTTP ${response.statusCode}`;
          const error = new Error(`Google API: ${String(detail).slice(0, 600)}`);
          error.statusCode = response.statusCode;
          error.response = parsed;
          reject(error);
          return;
        }
        resolve(parsed || {});
      });
    });
    request.setTimeout(timeoutMs, () => request.destroy(new Error('Google request timed out')));
    request.on('error', reject);
    if (bytes) request.write(bytes);
    request.end();
  });
}

function parseDesktopClient(raw) {
  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const installed = parsed?.installed;
  if (!installed?.client_id) throw new Error('Choose a Google OAuth client JSON whose application type is Desktop app');
  if (!/^https:\/\/accounts\.google\.com\//.test(String(installed.auth_uri || GOOGLE_AUTH))) throw new Error('The OAuth client has an unexpected authorization endpoint');
  if (!/^https:\/\/oauth2\.googleapis\.com\//.test(String(installed.token_uri || GOOGLE_TOKEN))) throw new Error('The OAuth client has an unexpected token endpoint');
  return {
    clientId:String(installed.client_id),
    clientSecret:String(installed.client_secret || ''),
    authUri:String(installed.auth_uri || GOOGLE_AUTH),
    tokenUri:String(installed.token_uri || GOOGLE_TOKEN),
  };
}

function googleTarget(rawUrl, expectedKind = '') {
  let url;
  try { url = new URL(String(rawUrl || '')); } catch { return null; }
  const parts = url.pathname.split('/').filter(Boolean);
  if (url.hostname === 'docs.google.com' && parts[0] === 'spreadsheets' && parts[1] === 'd' && parts[2]) {
    return expectedKind && expectedKind !== 'sheet' ? null : { kind:'sheet', id:parts[2], url:`https://docs.google.com/spreadsheets/d/${encodeURIComponent(parts[2])}/edit` };
  }
  if (url.hostname === 'docs.google.com' && parts[0] === 'document' && parts[1] === 'd' && parts[2]) {
    return expectedKind && expectedKind !== 'doc' ? null : { kind:'doc', id:parts[2], url:`https://docs.google.com/document/d/${encodeURIComponent(parts[2])}/edit` };
  }
  return null;
}

function columnsFor(rows) {
  const columns = [];
  const seen = new Set();
  for (const row of rows || []) for (const key of Object.keys(row || {})) if (!seen.has(key)) {
    seen.add(key);
    columns.push(String(key));
  }
  return columns;
}

function safeCell(value) {
  const text = String(value ?? '').replace(/\u0000/g, '');
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function columnName(index) {
  let value = Math.max(1, Number(index) || 1), out = '';
  while (value > 0) { value -= 1; out = String.fromCharCode(65 + (value % 26)) + out; value = Math.floor(value / 26); }
  return out;
}

function sheetValues(rows) {
  const columns = columnsFor(rows);
  return { columns, values:[columns, ...rows.map((row) => columns.map((key) => safeCell(row[key])))] };
}

function docChunks(rows, title, maxChars = 140_000) {
  const chunks = [];
  let text = '', links = [], headingLength = 0;
  const flush = () => {
    if (!text) return;
    chunks.push({ text, links, headingLength });
    text = ''; links = []; headingLength = 0;
  };
  const append = (value) => {
    const segment = String(value ?? '');
    const start = text.length;
    text += segment;
    for (const match of segment.matchAll(/https?:\/\/[^\s<>]+/g)) {
      const url = match[0].replace(/[),.;:!?]+$/, '');
      if (!url) continue;
      const from = start + (match.index || 0);
      links.push({ start:from, end:from + url.length, url });
    }
  };
  const stamped = `Enderloom enriched catalog — ${new Date().toISOString()}\n`;
  append(stamped); headingLength = stamped.length;
  rows.forEach((row, index) => {
    const name = String(row?.Name || row?.name || `Entry ${index + 1}`);
    const fields = Object.entries(row || {}).filter(([, value]) => String(value ?? '').trim());
    const block = `${index + 1}. ${name}\n${fields.map(([key, value]) => `${key}: ${String(value)}`).join('\n')}\n\n`;
    if (text.length > headingLength && text.length + block.length > maxChars) flush();
    append(block);
  });
  flush();
  return chunks;
}

class GoogleWorkspace {
  constructor({ userDataDir, safeStorage, pickCredentials, openLogin, onChange, request = jsonRequest, now = () => Date.now() } = {}) {
    this.dir = path.join(userDataDir, 'google-workspace');
    this.file = path.join(this.dir, 'oauth.bin');
    this.safeStorage = safeStorage;
    this.pickCredentials = pickCredentials;
    this.openLogin = openLogin;
    this.onChange = onChange;
    this.request = request;
    this.now = now;
    this.persisted = { client:null, refreshToken:'', email:'', scope:'' };
    this.accessToken = '';
    this.accessTokenExpiresAt = 0;
    this.connecting = null;
    this.state = 'disconnected';
    this.message = 'First connection asks for your Google Desktop OAuth client JSON, then opens secure browser consent.';
    this.load();
  }

  encryptionAvailable() {
    try { return !!this.safeStorage?.isEncryptionAvailable?.(); } catch { return false; }
  }

  load() {
    try {
      if (!this.encryptionAvailable() || !fs.existsSync(this.file)) return;
      const decrypted = this.safeStorage.decryptString(fs.readFileSync(this.file));
      const parsed = JSON.parse(decrypted);
      if (parsed?.client?.clientId) this.persisted = {
        client:parsed.client,
        refreshToken:String(parsed.refreshToken || ''),
        email:String(parsed.email || ''),
        scope:String(parsed.scope || ''),
      };
      if (this.persisted.refreshToken) {
        this.state = 'connected';
        this.message = `Google Workspace connected${this.persisted.email ? ` as ${this.persisted.email}` : ''}.`;
      } else if (this.persisted.client) {
        this.state = 'ready';
        this.message = 'Google OAuth client ready; sign in to continue.';
      }
    } catch {
      this.persisted = { client:null, refreshToken:'', email:'', scope:'' };
    }
  }

  save() {
    if (!this.encryptionAvailable()) return false;
    fs.mkdirSync(this.dir, { recursive:true });
    const bytes = this.safeStorage.encryptString(JSON.stringify(this.persisted));
    const temporary = `${this.file}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(temporary, bytes, { mode:0o600 });
    fs.renameSync(temporary, this.file);
    return true;
  }

  emit() { try { this.onChange?.(this.status()); } catch {} }

  status() {
    return {
      state:this.state,
      connected:this.state === 'connected' || (!!this.persisted.refreshToken && this.state !== 'connecting'),
      connecting:this.state === 'connecting',
      configured:!!this.persisted.client,
      email:this.persisted.email,
      encrypted:this.encryptionAvailable(),
      message:this.message,
      scopes:[...GOOGLE_SCOPES],
    };
  }

  async configure() {
    if (this.persisted.client) return this.persisted.client;
    const filePath = await this.pickCredentials?.();
    if (!filePath) throw new Error('Google OAuth setup was canceled');
    const client = parseDesktopClient(fs.readFileSync(filePath, 'utf8'));
    this.persisted.client = client;
    this.state = 'ready';
    this.message = 'Desktop OAuth client accepted. Continue in the Google sign-in tab.';
    this.save(); this.emit();
    return client;
  }

  async connect() {
    if (this.connecting) return this.connecting;
    this.connecting = this.authorize().finally(() => { this.connecting = null; });
    return this.connecting;
  }

  async authorize() {
    const client = await this.configure();
    this.state = 'connecting';
    this.message = 'Waiting for Google sign-in and consent in your secure default browser…';
    this.emit();
    const verifier = base64url(crypto.randomBytes(48));
    const challenge = base64url(crypto.createHash('sha256').update(verifier).digest());
    const state = base64url(crypto.randomBytes(24));
    let callbackResolve, callbackReject, loginHandle;
    const callback = new Promise((resolve, reject) => { callbackResolve = resolve; callbackReject = reject; });
    const server = http.createServer((request, response) => {
      let incoming;
      try { incoming = new URL(request.url || '/', `http://${request.headers.host || '127.0.0.1'}`); } catch { incoming = null; }
      if (!incoming || incoming.pathname !== '/oauth2/callback') { response.writeHead(404).end('Not found'); return; }
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.setHeader('Cache-Control', 'no-store');
      if (incoming.searchParams.get('state') !== state) {
        response.writeHead(400).end('<h1>Enderloom could not verify this OAuth response.</h1><p>Return to Enderloom and try again.</p>');
        callbackReject(new Error('Google OAuth state verification failed'));
        return;
      }
      const denied = incoming.searchParams.get('error');
      if (denied) {
        response.writeHead(400).end('<h1>Google sign-in was canceled.</h1><p>You can close this tab and return to Enderloom.</p>');
        callbackReject(new Error(`Google OAuth was not completed: ${denied}`));
        return;
      }
      const code = incoming.searchParams.get('code');
      if (!code) {
        response.writeHead(400).end('<h1>Google did not return an authorization code.</h1>');
        callbackReject(new Error('Google OAuth did not return an authorization code'));
        return;
      }
      response.writeHead(200).end('<!doctype html><meta charset="utf-8"><title>Enderloom connected</title><style>body{font:16px system-ui;background:#0b0d15;color:#f4f1ff;display:grid;place-items:center;min-height:90vh}main{max-width:560px;padding:32px;border:1px solid #34354d;border-radius:18px;background:#141624}h1{color:#86eadb}</style><main><h1>Google Workspace connected</h1><p>Enderloom is finishing the requested save. You can close this tab and return to Enderloom.</p></main>');
      callbackResolve(code);
    });
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
    const port = server.address().port;
    const redirectUri = `http://127.0.0.1:${port}/oauth2/callback`;
    const auth = new URL(client.authUri || GOOGLE_AUTH);
    for (const [key, value] of Object.entries({
      client_id:client.clientId,
      redirect_uri:redirectUri,
      response_type:'code',
      scope:GOOGLE_SCOPES.join(' '),
      code_challenge:challenge,
      code_challenge_method:'S256',
      state,
      access_type:'offline',
      include_granted_scopes:'true',
      prompt:'consent select_account',
    })) auth.searchParams.set(key, value);
    const timeout = setTimeout(() => callbackReject(new Error('Google sign-in timed out after 10 minutes')), 10 * 60 * 1000);
    const monitor = setInterval(() => {
      try { if (loginHandle?.isOpen && !loginHandle.isOpen()) callbackReject(new Error('Google sign-in tab was closed')); } catch {}
    }, 500);
    try {
      loginHandle = await this.openLogin?.(auth.toString());
      const code = await callback;
      const form = new URLSearchParams({
        code,
        client_id:client.clientId,
        redirect_uri:redirectUri,
        grant_type:'authorization_code',
        code_verifier:verifier,
      });
      if (client.clientSecret) form.set('client_secret', client.clientSecret);
      const token = await this.request(client.tokenUri || GOOGLE_TOKEN, {
        method:'POST',
        headers:{ 'Content-Type':'application/x-www-form-urlencoded' },
        body:form.toString(),
      });
      if (!token?.access_token) throw new Error('Google OAuth did not return an access token');
      this.accessToken = String(token.access_token);
      this.accessTokenExpiresAt = this.now() + Math.max(60, Number(token.expires_in) || 3600) * 1000 - 60_000;
      if (token.refresh_token) this.persisted.refreshToken = String(token.refresh_token);
      this.persisted.scope = String(token.scope || GOOGLE_SCOPES.join(' '));
      try {
        const user = await this.request('https://openidconnect.googleapis.com/v1/userinfo', { headers:{ Authorization:`Bearer ${this.accessToken}` } });
        this.persisted.email = String(user?.email || '');
      } catch {}
      if (!this.persisted.refreshToken) throw new Error('Google did not issue an offline refresh token; reconnect and allow access');
      this.save();
      this.state = 'connected';
      this.message = `Google Workspace connected${this.persisted.email ? ` as ${this.persisted.email}` : ''}.`;
      this.emit();
      return this.status();
    } catch (error) {
      this.state = this.persisted.refreshToken ? 'connected' : (this.persisted.client ? 'ready' : 'disconnected');
      this.message = String(error?.message || error);
      this.emit();
      throw error;
    } finally {
      clearTimeout(timeout); clearInterval(monitor);
      try { server.close(); } catch {}
    }
  }

  async token() {
    if (this.accessToken && this.accessTokenExpiresAt > this.now()) return this.accessToken;
    if (!this.persisted.refreshToken) { await this.connect(); return this.accessToken; }
    const client = await this.configure();
    const form = new URLSearchParams({
      client_id:client.clientId,
      refresh_token:this.persisted.refreshToken,
      grant_type:'refresh_token',
    });
    if (client.clientSecret) form.set('client_secret', client.clientSecret);
    try {
      const refreshed = await this.request(client.tokenUri || GOOGLE_TOKEN, {
        method:'POST', headers:{ 'Content-Type':'application/x-www-form-urlencoded' }, body:form.toString(),
      });
      this.accessToken = String(refreshed.access_token || '');
      if (!this.accessToken) throw new Error('Google token refresh returned no access token');
      this.accessTokenExpiresAt = this.now() + Math.max(60, Number(refreshed.expires_in) || 3600) * 1000 - 60_000;
      this.state = 'connected'; this.message = `Google Workspace connected${this.persisted.email ? ` as ${this.persisted.email}` : ''}.`; this.emit();
      return this.accessToken;
    } catch (error) {
      if (Number(error?.statusCode) === 400) {
        this.persisted.refreshToken = ''; this.accessToken = ''; this.accessTokenExpiresAt = 0; this.save();
        return (await this.connect(), this.accessToken);
      }
      throw error;
    }
  }

  async api(url, options = {}) {
    const token = await this.token();
    return this.request(url, { ...options, headers:{ ...(options.headers || {}), Authorization:`Bearer ${token}`, ...(options.body && typeof options.body !== 'string' ? { 'Content-Type':'application/json' } : {}) } });
  }

  async disconnect() {
    const token = this.persisted.refreshToken || this.accessToken;
    this.persisted.refreshToken = ''; this.persisted.email = ''; this.persisted.scope = '';
    this.accessToken = ''; this.accessTokenExpiresAt = 0;
    try { if (token) await this.request(`${GOOGLE_REVOKE}?token=${encodeURIComponent(token)}`, { method:'POST' }); } catch {}
    this.state = this.persisted.client ? 'ready' : 'disconnected';
    this.message = this.persisted.client ? 'Google disconnected. Sign in again when you want to save.' : 'First connection asks for your Google Desktop OAuth client JSON, then opens secure browser consent.';
    this.save(); this.emit();
    return this.status();
  }

  async ensureSheet(target, title) {
    if (target?.kind === 'sheet') return target;
    const created = await this.api('https://sheets.googleapis.com/v4/spreadsheets', { method:'POST', body:{ properties:{ title:`${title} - Enderloom enriched` } } });
    return { kind:'sheet', id:String(created.spreadsheetId), url:String(created.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${created.spreadsheetId}/edit`), created:true };
  }

  async writeSheet(rows, title, rawTargetUrl = '') {
    const target = await this.ensureSheet(googleTarget(rawTargetUrl, 'sheet'), title);
    const metadata = await this.api(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(target.id)}?fields=sheets.properties`);
    let sheet = (metadata.sheets || []).find((entry) => entry?.properties?.title === SHEET_TAB)?.properties;
    if (!sheet) {
      const added = await this.api(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(target.id)}:batchUpdate`, { method:'POST', body:{ requests:[{ addSheet:{ properties:{ title:SHEET_TAB, gridProperties:{ frozenRowCount:1 } } } }] } });
      sheet = added?.replies?.[0]?.addSheet?.properties;
    }
    if (!sheet?.sheetId && sheet?.sheetId !== 0) throw new Error('Google Sheets did not return the Enderloom tab identifier');
    const data = sheetValues(rows);
    if (!data.columns.length) throw new Error('There are no catalog columns to write');
    const endColumn = columnName(data.columns.length);
    const range = `'${SHEET_TAB.replace(/'/g, "''")}'!A1:${endColumn}${Math.max(1, data.values.length)}`;
    const broadRange = `'${SHEET_TAB.replace(/'/g, "''")}'!A:CB`;
    await this.api(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(target.id)}/values/${encodeURIComponent(broadRange)}:clear`, { method:'POST', body:{} });
    await this.api(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(target.id)}/values/${encodeURIComponent(range)}?valueInputOption=RAW`, { method:'PUT', body:{ range, majorDimension:'ROWS', values:data.values } });
    await this.api(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(target.id)}:batchUpdate`, { method:'POST', body:{ requests:[
      { updateSheetProperties:{ properties:{ sheetId:sheet.sheetId, gridProperties:{ frozenRowCount:1 } }, fields:'gridProperties.frozenRowCount' } },
      { repeatCell:{ range:{ sheetId:sheet.sheetId, startRowIndex:0, endRowIndex:1, startColumnIndex:0, endColumnIndex:data.columns.length }, cell:{ userEnteredFormat:{ backgroundColor:{ red:.22, green:.08, blue:.52 }, textFormat:{ bold:true, foregroundColor:{ red:1, green:1, blue:1 } }, wrapStrategy:'WRAP' } }, fields:'userEnteredFormat' } },
      { repeatCell:{ range:{ sheetId:sheet.sheetId, startRowIndex:1, endRowIndex:data.values.length, startColumnIndex:0, endColumnIndex:data.columns.length }, cell:{ userEnteredFormat:{ verticalAlignment:'TOP', wrapStrategy:'WRAP' } }, fields:'userEnteredFormat.verticalAlignment,userEnteredFormat.wrapStrategy' } },
      { setBasicFilter:{ filter:{ range:{ sheetId:sheet.sheetId, startRowIndex:0, endRowIndex:data.values.length, startColumnIndex:0, endColumnIndex:data.columns.length } } } },
      { autoResizeDimensions:{ dimensions:{ sheetId:sheet.sheetId, dimension:'COLUMNS', startIndex:0, endIndex:data.columns.length } } },
    ] } });
    return { saved:true, kind:'sheet', id:target.id, url:target.url, created:!!target.created, rows:rows.length, target:SHEET_TAB };
  }

  async ensureDoc(target, title) {
    if (target?.kind === 'doc') return target;
    const created = await this.api('https://docs.googleapis.com/v1/documents', { method:'POST', body:{ title:`${title} - Enderloom enriched` } });
    return { kind:'doc', id:String(created.documentId), url:`https://docs.google.com/document/d/${created.documentId}/edit`, created:true };
  }

  async writeDoc(rows, title, rawTargetUrl = '') {
    const target = await this.ensureDoc(googleTarget(rawTargetUrl, 'doc'), title);
    const document = await this.api(`https://docs.googleapis.com/v1/documents/${encodeURIComponent(target.id)}`);
    let index = Math.max(1, Number(document?.body?.content?.at(-1)?.endIndex || 2) - 1);
    const chunks = docChunks(rows, title);
    for (const chunk of chunks) {
      const insertionIndex = index;
      await this.api(`https://docs.googleapis.com/v1/documents/${encodeURIComponent(target.id)}:batchUpdate`, { method:'POST', body:{ requests:[{ insertText:{ location:{ index:insertionIndex }, text:chunk.text } }] } });
      const styleRequests = [];
      if (chunk.headingLength) styleRequests.push({ updateParagraphStyle:{ range:{ startIndex:insertionIndex, endIndex:insertionIndex + chunk.headingLength }, paragraphStyle:{ namedStyleType:'HEADING_1', spaceAbove:{ magnitude:18, unit:'PT' }, spaceBelow:{ magnitude:8, unit:'PT' } }, fields:'namedStyleType,spaceAbove,spaceBelow' } });
      for (const link of chunk.links) styleRequests.push({ updateTextStyle:{ range:{ startIndex:insertionIndex + link.start, endIndex:insertionIndex + link.end }, textStyle:{ link:{ url:link.url }, foregroundColor:{ color:{ rgbColor:{ red:.25, green:.35, blue:.9 } } }, underline:true }, fields:'link,foregroundColor,underline' } });
      for (let offset = 0; offset < styleRequests.length; offset += 400) {
        await this.api(`https://docs.googleapis.com/v1/documents/${encodeURIComponent(target.id)}:batchUpdate`, { method:'POST', body:{ requests:styleRequests.slice(offset, offset + 400) } });
      }
      index += chunk.text.length;
    }
    return { saved:true, kind:'doc', id:target.id, url:target.url, created:!!target.created, rows:rows.length, target:'Appended Enderloom enriched catalog section' };
  }

  async exportCatalog({ kind, rows, title, targetUrl = '' } = {}) {
    if (!Array.isArray(rows) || !rows.length) throw new Error('There are no catalog rows to save to Google');
    const safeTitle = String(title || 'Catalog').trim().slice(0, 120) || 'Catalog';
    if (kind === 'sheet') return this.writeSheet(rows, safeTitle, targetUrl);
    if (kind === 'doc') return this.writeDoc(rows, safeTitle, targetUrl);
    throw new Error('Choose Google Sheet or Google Doc');
  }

  dispose() {}
}

module.exports = {
  GoogleWorkspace,
  GOOGLE_SCOPES,
  SHEET_TAB,
  parseDesktopClient,
  googleTarget,
  columnsFor,
  safeCell,
  sheetValues,
  docChunks,
  jsonRequest,
};
