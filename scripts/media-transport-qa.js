'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path');
const net=require('net');
const {requestText,isByteString,sanitizeRequestHeaders}=require('../src/public-http');
(async()=>{
  assert.equal(isByteString('ascii-header'),true);
  assert.equal(isByteString('bad — header'),false);
  const clean=sanitizeRequestHeaders({'If-None-Match':'ok','X-Bad':'bad — header'});
  assert.equal(clean['If-None-Match'],'ok');
  assert.equal(Object.hasOwn(clean,'X-Bad'),false);
  let sawCookie=false;
  const server=net.createServer(sock=>{
    sock.once('data',request=>{
      sawCookie=/\r\nCookie: SID=fixture\r\n/i.test(request.toString('latin1'));
      const head=Buffer.from('HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nX-Weird: preview ');
      const weird=Buffer.from('—','utf8'),body=Buffer.from('<title>x</title>');
      const tail=Buffer.concat([Buffer.from(`\r\nContent-Length: ${body.length}\r\nConnection: close\r\n\r\n`),body]);
      sock.end(Buffer.concat([head,weird,tail]));
    });
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  try{
    const port=server.address().port;
    const r=await requestText(`http://127.0.0.1:${port}/`,{timeoutMs:2500,headersForUrl:async()=>({Cookie:'SID=fixture'})});
    assert.equal(r.status,200);assert.match(r.text,/<title>x<\/title>/);assert.ok(String(r.headers['x-weird']||'').length>0);assert.equal(sawCookie,true);
  }finally{await new Promise(r=>server.close(r))}
  const store=fs.readFileSync(path.resolve(__dirname,'../src/catalog-store.js'),'utf8');
  assert(!store.includes('this.liveSession.fetch('),'authenticated Google refresh still uses Electron session.fetch/Undici');
  assert(store.includes('this.liveSession.cookies.get')&&store.includes('this.googleRequest'),'Chromium cookie jar is not bridged to Node HTTP');
  console.log(JSON.stringify({passed:true,byteStringSafe:true,nodeCoreTransport:true,malformedUtf8HeaderSurvives:true,dynamicCookieBridge:true,electronFetchEliminatedForGoogle:true},null,2));
})().catch(err=>{console.error(err);process.exit(1)});
