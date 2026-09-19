'use strict';
const { Readable } = require('stream');

// Electron net.fetch currently rejects manual redirects before returning a
// Response. ClientRequest lets us validate each redirect while Chromium itself
// applies the destination's cookies; headers/tokens are never copied by us.
function createSessionDownloadFetch(session, net) {
  return (url, { signal } = {}) => new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(Error('Aborted')); return; }
    const request = net.request({ url, session, credentials:'include', redirect:'manual' });
    const seen = new Set([url]);
    const abort=()=>{request.abort();reject(Error('Aborted'));};
    signal?.addEventListener('abort',abort,{once:true});
    request.on('redirect', (_status,_method,nextUrl) => {
      let next;try{next=new URL(nextUrl);}catch{abort();return;}
      if(next.protocol!=='https:'||next.username||next.password||seen.has(nextUrl)||seen.size>=20){abort();return;}
      seen.add(nextUrl);request.followRedirect();
    });
    request.on('error',reject);
    request.on('close',()=>signal?.removeEventListener('abort',abort));
    request.on('response',response=>{
      const headers=new Headers();
      for(const [key,value] of Object.entries(response.headers)) if(value!=null) headers.set(key,Array.isArray(value)?value.join(', '):String(value));
      resolve({status:response.statusCode,ok:response.statusCode>=200&&response.statusCode<300,headers,body:Readable.toWeb(response)});
    });
    request.end();
  });
}
module.exports={createSessionDownloadFetch};
