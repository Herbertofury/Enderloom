'use strict';
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),https=require('https'),crypto=require('crypto');
const {_electron:electron}=require('playwright');const root=path.resolve(__dirname,'..'),name=`enderloom-auth-ui-${Date.now()}.jar`,bytes=Buffer.from('PK\u0003\u0004authenticated download UI fixture'),owned=[];let app,server;
(async()=>{
  const cert=fs.readFileSync(path.join(root,'output/auth-download-tls/cert.pem'),'utf8');
  server=https.createServer({key:fs.readFileSync(path.join(root,'output/auth-download-tls/key.pem')),cert},(req,res)=>{
    if(req.url==='/login'){res.writeHead(200,{'content-type':'text/html','set-cookie':'qa_session=yes; Secure; HttpOnly; Path=/'});res.end('<h1>Fixture signed in</h1>');return;}
    if(req.url==='/file'&&String(req.headers.cookie||'').includes('qa_session=yes')){res.writeHead(200,{'content-type':'application/java-archive','content-length':bytes.length,'content-disposition':`attachment; filename="${name}"`});res.end(bytes);return;}
    res.writeHead(403);res.end('Sign in');
  });await new Promise(r=>server.listen(0,r));const origin=`https://localhost:${server.address().port}`;
  app=await electron.launch({executablePath:path.join(root,'node_modules/electron/dist/electron.exe'),args:[root,'--ui-acceptance'],timeout:60000});
  await app.evaluate(({session},cert)=>session.fromPartition('persist:minecraft-catalog-live').setCertificateVerifyProc((details,cb)=>cb(details.hostname==='localhost'&&details.certificate.data.trim()===cert.trim()?0:-3)),cert);
  let chrome;for(let i=0;i<200&&!chrome;i++){chrome=app.windows().find(p=>p.url().includes('shell.html?chrome=1'));if(!chrome)await new Promise(r=>setTimeout(r,100));}assert(chrome);chrome.setDefaultTimeout(15000);
  await chrome.locator('#downloadsToggle').click();await chrome.getByLabel('Background download URL').fill(origin+'/file');await chrome.getByLabel('Expected download SHA-256').fill(crypto.createHash('sha256').update(bytes).digest('hex'));await chrome.locator('#backgroundDownloadForm button').click();
  let row=chrome.locator('.download-row').filter({hasText:'file'});await row.getByRole('button',{name:/Retry/}).waitFor();assert.match(await row.innerText(),/sign in/i);const id=await row.getAttribute('data-id');row=chrome.locator(`.download-row[data-id="${id}"]`);
  await row.getByRole('button',{name:/Open source/}).click();
  let source;for(let i=0;i<100&&!source;i++){source=app.windows().find(p=>p.url()===origin+'/file');if(!source)await new Promise(r=>setTimeout(r,100));}assert(source,'Source page should open');await source.waitForLoadState('domcontentloaded');
  await chrome.getByLabel('Address and search').fill(origin+'/login');await chrome.getByLabel('Address and search').press('Enter');
  let login;for(let i=0;i<100&&!login;i++){login=app.windows().find(p=>p.url()===origin+'/login');if(!login)await new Promise(r=>setTimeout(r,100));}assert(login);await login.getByText('Fixture signed in').waitFor();
  // Reopen if navigation collapsed the panel; the existing transfer survives.
  if(!await chrome.locator('#downloadsBar').isVisible())await chrome.locator('#downloadsToggle').click();
  await row.getByRole('button',{name:/Retry/}).click();await row.getByRole('button',{name:`Open ${name}`,exact:true}).waitFor();
  const records=await chrome.evaluate(()=>window.companion.command('list-downloads')),record=records.find(r=>r.background&&r.sourcePage===origin+'/file');assert.equal(record.state,'completed',record.error);owned.push(record.savePath);assert.deepEqual(fs.readFileSync(record.savePath),bytes);assert(record.hashVerified);
  await chrome.screenshot({path:path.join(root,'output/playwright/authenticated-download-ui.png')});
  console.log('PASS real Electron download UI: add link, login recovery, retry, shared HttpOnly session and expected SHA-256');
})().catch(async e=>{console.error(e);if(app)console.error('QA page states:',app.windows().map(p=>p.url()));process.exitCode=1;}).finally(async()=>{await app?.close();server?.close();for(const file of owned)if(path.basename(file)===name)fs.unlinkSync(file);});
