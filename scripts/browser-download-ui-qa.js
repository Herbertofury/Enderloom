'use strict';
const assert = require('assert/strict'), fs = require('fs'), path = require('path'), http = require('http'), crypto = require('crypto');
const { _electron: electron } = require('playwright');
const root = path.resolve(__dirname, '..'), name = `Enderloom-download-QA-${crypto.randomUUID()}.txt`;
const bytes = Buffer.alloc(256 * 1024, 'Enderloom download verification\n');
const owned = [];
let app;
const server = http.createServer((req, res) => {
  if (req.url !== '/file') { res.setHeader('Content-Type','text/html'); res.end('<title>Download acceptance</title><a href="/file">Download test file</a>'); return; }
  res.writeHead(200, {'Content-Type':'application/octet-stream','Content-Length':bytes.length,'Content-Disposition':`attachment; filename="${name}"`});
  let sent=0; const timer=setInterval(()=>{const next=Math.min(sent+8192,bytes.length);res.write(bytes.subarray(sent,next));sent=next;if(sent===bytes.length){clearInterval(timer);res.end();}},60);
  res.on('close',()=>clearInterval(timer));
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url=`http://127.0.0.1:${server.address().port}`;
  app=await electron.launch({executablePath:path.join(root,'node_modules/electron/dist/electron.exe'),args:[root,'--ui-acceptance'],timeout:60000});
  let chrome;
  for(let i=0;i<200&&!chrome;i++){chrome=app.windows().find(p=>p.url().includes('shell.html?chrome=1'));if(!chrome)await new Promise(r=>setTimeout(r,100));}
  if(!chrome)throw Error('Native browser chrome did not open');
  await chrome.getByLabel('Address and search').fill(url);
  await chrome.getByLabel('Address and search').press('Enter');
  let page;
  for(let i=0;i<100&&!page;i++){page=app.windows().find(p=>p.url().startsWith(url));if(!page)await new Promise(r=>setTimeout(r,100));}
  assert(page,'Local download page loaded in Enderloom');
  const directory=await app.evaluate(({app})=>app.getPath('downloads'));
  const original=path.join(directory,name);fs.writeFileSync(original,'Original must remain unchanged');owned.push(original);
  await page.getByRole('link',{name:'Download test file'}).click();
  await chrome.locator('#downloadsToggle').click();
  const row=chrome.locator('.download-row').filter({hasText:name.replace('.txt',' (1).txt')});
  await row.getByRole('button',{name:/Pause/}).click();
  await row.getByRole('button',{name:/Resume/}).waitFor();
  assert.match(await row.innerText(),/paused/);
  await row.getByRole('button',{name:/Resume/}).click();
  await row.getByRole('button',{name:/Open /}).waitFor({timeout:20000});
  const records=await chrome.evaluate(()=>window.companion.command('list-downloads'));
  const done=records.find(r=>r.filename===name.replace('.txt',' (1).txt'));assert(done?.state==='completed');owned.push(done.savePath);
  assert.equal(fs.readFileSync(original,'utf8'),'Original must remain unchanged');assert.deepEqual(fs.readFileSync(done.savePath),bytes);
  await chrome.reload();await chrome.locator('#downloadsToggle').click();
  await chrome.locator('.download-row').filter({hasText:done.filename}).getByRole('button',{name:/Open /}).waitFor();
  await chrome.locator('#downloadsClose').click();assert.equal(await chrome.locator('#downloadsBar').isVisible(),false);
  const userData=await app.evaluate(({app})=>app.getPath('userData'));
  const state=fs.readFileSync(path.join(userData,'browser-downloads.json'),'utf8');
  assert(JSON.parse(state).some(r=>r.id===done.id&&r.state==='completed'));
  console.log('PASS real Electron browser download: collision protection, pause/resume, exact bytes, persistent history, close/reopen');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(app)await app.close();server.close();for(const file of owned){if(path.basename(file).startsWith(name.replace('.txt','')))fs.rmSync(file,{force:true});}});
