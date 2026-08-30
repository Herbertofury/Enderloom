'use strict';
const path=require('path');
const os=require('os');
const { Worker }=require('worker_threads');

function createProviderParserPool({workers=Math.max(2,Math.min(8,Math.ceil((os.cpus()?.length||8)/4))),minWorkerBytes=48*1024}={}){
  const slots=[];const queue=[];let nextId=1,closed=false;
  const workerFile=path.join(__dirname,'provider-parser-worker.js');
  const spawn=()=>{
    const worker=new Worker(workerFile);const slot={worker,busy:false,current:null};
    worker.on('message',msg=>{const job=slot.current;slot.busy=false;slot.current=null;if(job){if(msg?.error)job.reject(new Error(msg.error));else job.resolve(msg?.result||null)}pump()});
    worker.on('error',err=>{const job=slot.current;slot.busy=false;slot.current=null;if(job)job.reject(err);if(!closed){try{worker.terminate()}catch{};const i=slots.indexOf(slot);if(i>=0)slots.splice(i,1);slots.push(spawn());pump()}});
    return slot;
  };
  for(let i=0;i<workers;i++)slots.push(spawn());
  function pump(){if(closed)return;for(const slot of slots){if(slot.busy||!queue.length)continue;const job=queue.shift();slot.busy=true;slot.current=job;slot.worker.postMessage({id:job.id,mode:job.mode,html:job.html,url:job.url,context:job.context})}}
  function parse({mode='full',html='',url='',context={}}={}){
    if(closed)return Promise.reject(new Error('Provider parser pool closed'));
    return new Promise((resolve,reject)=>{queue.push({id:nextId++,mode,html:String(html||''),url,context,resolve,reject});pump()});
  }
  function shouldOffload(html=''){return Buffer.byteLength(String(html||''),'utf8')>=minWorkerBytes}
  async function close(){closed=true;while(queue.length)queue.shift().reject(new Error('Provider parser pool closed'));await Promise.allSettled(slots.map(s=>s.worker.terminate()))}
  return {parse,shouldOffload,close,stats:()=>({workers:slots.length,busy:slots.filter(s=>s.busy).length,queued:queue.length,minWorkerBytes})};
}
module.exports={createProviderParserPool};
