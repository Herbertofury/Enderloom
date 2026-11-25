'use strict';
const path=require('path');
const os=require('os');
const { Worker }=require('worker_threads');

function createProviderParserPool({workers=Math.max(2,Math.min(8,Math.ceil((os.cpus()?.length||8)/4))),minWorkerBytes=48*1024}={}){
  if(!Number.isInteger(workers)||workers<1)throw new RangeError('Provider parser workers must be a positive integer');
  const slots=[];const queue=[];let nextId=1,closed=false,closing=null;
  const workerFile=path.join(__dirname,'provider-parser-worker.js');
  const spawn=()=>{
    const worker=new Worker(workerFile);const slot={worker,busy:false,current:null,retired:false};
    worker.on('message',msg=>{
      const job=slot.current;if(slot.retired||!job||msg?.id!==job.id)return;
      slot.busy=false;slot.current=null;
      if(msg.error)job.reject(new Error(msg.error));else job.resolve(msg.result||null);
      pump();
    });
    const retire=err=>{
      if(slot.retired)return;slot.retired=true;
      const job=slot.current;slot.busy=false;slot.current=null;if(job)job.reject(err);
      void worker.terminate().catch(()=>{});
      if(!closed){const i=slots.indexOf(slot);if(i>=0)slots.splice(i,1);slots.push(spawn());pump()}
    };
    worker.on('error',retire);
    worker.on('exit',code=>retire(new Error(`Provider parser worker exited (${code})`)));
    return slot;
  };
  for(let i=0;i<workers;i++)slots.push(spawn());
  function pump(){
    if(closed)return;
    for(const slot of slots){
      while(!slot.busy&&!slot.retired&&queue.length){
        const job=queue.shift();slot.busy=true;slot.current=job;
        try{slot.worker.postMessage({id:job.id,mode:job.mode,html:job.html,url:job.url,context:job.context})}
        catch(err){slot.busy=false;slot.current=null;job.reject(err)}
      }
    }
  }
  function parse({mode='full',html='',url='',context={}}={}){
    if(closed)return Promise.reject(new Error('Provider parser pool closed'));
    return new Promise((resolve,reject)=>{queue.push({id:nextId++,mode,html:String(html||''),url,context,resolve,reject});pump()});
  }
  function shouldOffload(html=''){return Buffer.byteLength(String(html||''),'utf8')>=minWorkerBytes}
  function close(){
    if(closing)return closing;
    closed=true;const error=new Error('Provider parser pool closed');
    while(queue.length)queue.shift().reject(error);
    for(const slot of slots){slot.retired=true;slot.current?.reject(error);slot.current=null;slot.busy=false}
    closing=Promise.allSettled(slots.map(s=>s.worker.terminate())).then(()=>{});
    return closing;
  }
  return {parse,shouldOffload,close,stats:()=>({workers:slots.length,busy:slots.filter(s=>s.busy).length,queued:queue.length,minWorkerBytes})};
}
module.exports={createProviderParserPool};
