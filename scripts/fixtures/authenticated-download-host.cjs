'use strict';
const {app,session,net,safeStorage,BrowserWindow}=require('electron');
const fs=require('fs'),path=require('path'),os=require('os'),https=require('https'),assert=require('assert/strict'),crypto=require('crypto');
const {createBrowserDownloads}=require('../../src/browser-downloads');
const {createSessionDownloadFetch}=require('../../src/session-download-fetch');
const root=path.resolve(__dirname,'../..'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-auth-runtime-'));
app.setPath('userData',path.join(dir,'profile'));
let server;
app.whenReady().then(async()=>{
  const tls=path.join(root,'output/auth-download-tls'),bytes=Buffer.from('PK\u0003\u0004Authenticated mod package fixture');let authRequests=0,blockedRequests=0;
  server=https.createServer({key:fs.readFileSync(path.join(tls,'key.pem')),cert:fs.readFileSync(path.join(tls,'cert.pem'))},(req,res)=>{
    if(req.url==='/sign-in'){res.writeHead(200,{'content-type':'text/html','set-cookie':'qa_session=owner-session; Secure; HttpOnly; SameSite=Lax; Path=/'});res.end('<h1>Signed in</h1>');return;}
    if(req.url.startsWith('/redirect')){res.writeHead(302,{location:'/private?token=hidden-link'});res.end();return;}
    if(!String(req.headers.cookie||'').includes('qa_session=owner-session')){blockedRequests++;res.writeHead(403);res.end('Sign in');return;}
    authRequests++;res.writeHead(200,{'content-type':'application/octet-stream','content-length':bytes.length});res.end(bytes);
  });
  await new Promise(r=>server.listen(0,r));const origin=`https://localhost:${server.address().port}`,live=session.fromPartition('persist:download-qa');
  // Trust this exact, ephemeral fixture certificate only in this isolated test session.
  const fingerprint=new crypto.X509Certificate(fs.readFileSync(path.join(tls,'cert.pem'))).fingerprint256;
  live.setCertificateVerifyProc((details,callback)=>callback(details.hostname==='localhost'&&new crypto.X509Certificate(details.certificate.data).fingerprint256===fingerprint?0:-3));
  const fetch=createSessionDownloadFetch(live,net);
  const events=[],pending=new Map();const owner=createBrowserDownloads({directory:dir,statePath:path.join(dir,'history.json'),safeStorage,fetch:(url,options)=>fetch(url,options).catch(e=>{console.error(e.message);throw e;}),publish:r=>{events.push(r);if(r.type==='done'){pending.get(r.id)?.(r);pending.delete(r.id);}}});
  const done=id=>new Promise(resolve=>pending.set(id,resolve));
  const first=await done(owner.start({url:origin+'/redirect',filename:'private.jar'}).id);assert.equal(first.state,'sign-in-required');assert(!fs.existsSync(first.savePath));
  const win=new BrowserWindow({show:false,webPreferences:{partition:'persist:download-qa',sandbox:true}});await win.loadURL(origin+'/sign-in');
  assert.equal(await win.webContents.executeJavaScript('document.cookie'),'', 'The credential must be HttpOnly, unavailable to page JavaScript');
  win.destroy();assert.equal(BrowserWindow.getAllWindows().length,0);
  const wait=done(first.id);owner.control(first.id,'retry');const completed=await wait;
  assert.equal(completed.state,'completed',completed.error);assert.equal(completed.sha256,crypto.createHash('sha256').update(bytes).digest('hex'));assert.deepEqual(fs.readFileSync(completed.savePath),bytes);
  assert(authRequests===1&&blockedRequests===1);assert(!JSON.stringify(events).includes('owner-session'));assert(!fs.readFileSync(path.join(dir,'history.json'),'utf8').includes('hidden-link'));
  const report={passed:true,realChromiumSession:true,httpOnlyCookieUsed:true,zeroWindowsDuringTransfer:true,redirects:true,authenticationRecovery:true,sha256:completed.sha256,credentialsNotExposed:true};fs.writeFileSync(path.join(root,'output/authenticated-download-runtime-qa.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));server.close();app.exit(0);
}).catch(e=>{console.error(e);server?.close();app.exit(1);});
app.on('window-all-closed',()=>{});
