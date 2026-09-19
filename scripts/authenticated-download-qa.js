'use strict';
const assert=require('assert/strict'),fs=require('fs'),os=require('os'),path=require('path'),crypto=require('crypto');
const {createBrowserDownloads,downloadTarget}=require('../src/browser-downloads');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-auth-download-')),statePath=path.join(dir,'history.json');
// Fake encryption in the unit harness only. Runtime coverage separately uses
// Chromium's HttpOnly cookies and Windows safeStorage in real Electron.
const key=crypto.randomBytes(32);
const safeStorage={isEncryptionAvailable:()=>true,encryptString:s=>{const iv=crypto.randomBytes(12),c=crypto.createCipheriv('aes-256-gcm',key,iv);const b=Buffer.concat([c.update(s),c.final()]);return Buffer.concat([iv,c.getAuthTag(),b]);},decryptString:b=>{const d=crypto.createDecipheriv('aes-256-gcm',key,b.subarray(0,12));d.setAuthTag(b.subarray(12,28));return Buffer.concat([d.update(b.subarray(28)),d.final()]).toString();}};
const waiters=new Map();let rows=[];
const publish=r=>{rows.push(r);if(r.type==='done'){waiters.get(r.id)?.(r);waiters.delete(r.id);}};
const done=id=>new Promise(resolve=>{const r=rows.findLast(r=>r.id===id&&r.type==='done');if(r)resolve(r);else waiters.set(id,resolve);});
let signedIn=false,peak=0,active=0;
const bytes=Buffer.from('PK\u0003\u0004fixture file bytes');
const hash=crypto.createHash('sha256').update(bytes).digest('hex');
const fetch=async(url,options)=>{
  assert.equal(options.credentials,'include');assert.equal(options.redirect,'manual');assert.deepEqual(Object.keys(options).sort(),['credentials','redirect','signal']);
  const u=new URL(url);if(u.pathname==='/login')return new Response('<html>Sign in</html>',{headers:{'content-type':'text/html'}});
  if(u.pathname==='/tiny-login')return new Response('<html>x</html>',{headers:{'content-type':'application/octet-stream'}});
  if(u.pathname==='/redirect')return new Response(null,{status:302,headers:{location:'https://files.example/private?token=secret-bearer'}});
  if(u.pathname==='/insecure')return new Response(null,{status:302,headers:{location:'http://files.example/file'}});
  if(!signedIn)return new Response('Sign in',{status:403});
  active++;peak=Math.max(peak,active);
  return new Response(new ReadableStream({async start(controller){await new Promise(r=>setTimeout(r,20));controller.enqueue(bytes);controller.close();active--;}}),{headers:{'content-type':'application/octet-stream','content-length':String(bytes.length)}});
};
let owner=createBrowserDownloads({directory:dir,statePath,publish,fetch,safeStorage});
(async()=>{
  assert.equal(downloadTarget('https://drive.google.com/file/d/abc_123/view').url,'https://drive.usercontent.google.com/download?id=abc_123&export=download');
  assert.throws(()=>downloadTarget('file:///secret'));assert.throws(()=>downloadTarget('https://user:pass@github.com/file'));assert.throws(()=>downloadTarget('https://drive.google.com/drive/folders/abc'));
  let r=owner.start({url:'https://files.example/redirect?token=do-not-store',filename:'private.jar',sha256:hash});r=await done(r.id);assert.equal(r.state,'sign-in-required');
  assert(!fs.readFileSync(statePath,'utf8').includes('do-not-store'));assert(!fs.readFileSync(statePath+'.requests').includes('do-not-store'));
  signedIn=true;owner=createBrowserDownloads({directory:dir,statePath,publish,fetch,safeStorage});rows=[];owner.control(r.id,'retry');r=await done(r.id);assert.equal(r.state,'completed');assert.equal(r.sha256,hash);assert.equal(r.hashVerified,true);assert.deepEqual(fs.readFileSync(r.savePath),bytes);
  for(const endpoint of ['login','tiny-login']) {const result=await done(owner.start({url:`https://files.example/${endpoint}`,filename:'bad.jar'}).id);assert.equal(result.state,'sign-in-required');assert.equal(fs.existsSync(result.savePath),false);}
  const bad=await done(owner.start({url:'https://files.example/private',filename:'wrong.jar',sha256:'0'.repeat(64)}).id);assert.equal(bad.state,'interrupted');assert.match(bad.error,/SHA-256 mismatch/);assert.equal(fs.existsSync(bad.savePath),false);
  const redirect=await done(owner.start({url:'https://files.example/insecure'}).id);assert.equal(redirect.state,'interrupted');
  const jobs=Array.from({length:9},()=>owner.start({url:'https://files.example/private',filename:'private.jar'}));await Promise.all(jobs.map(r=>done(r.id)));assert(peak<=3);assert.equal(new Set(jobs.map(r=>r.savePath)).size,9);
  assert(!JSON.stringify(rows).includes('secret-bearer'));assert(!JSON.stringify(rows).includes('do-not-store'));assert.equal(fs.readdirSync(dir).filter(f=>f.endsWith('.part')).length,0);
  console.log(JSON.stringify({passed:true,protectedLinks:true,sessionCredentials:true,loginPageRejected:true,hashMismatchRejected:true,encryptedRetrySurvivesRestart:true,concurrency:peak,unboundedQueue:9,collisionProtection:true},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
