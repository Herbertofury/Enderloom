'use strict';
const {app,BrowserWindow}=require('electron'),http=require('http'),fs=require('fs'),path=require('path'),os=require('os'),{Readable}=require('stream');
const {localVideoResponse}=require('../../src/local-video-response');
const root=path.resolve(__dirname,'../..'),recording=process.env.ENDERLOOM_QA_VIDEO;
if(!recording||!fs.existsSync(recording))throw Error('Set ENDERLOOM_QA_VIDEO to a real MP4 test recording.');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-video-controls-')));let server;
app.whenReady().then(async()=>{
  const script=fs.readFileSync(path.join(root,'catalog/video-controls.js'),'utf8'),css=fs.readFileSync(path.join(root,'catalog/video-controls.css'),'utf8');
  const html=`<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:28px;background:#101117;color:#eee;font:14px system-ui}main{max-width:1000px;margin:auto}h1{font-size:24px;margin:0 0 8px}p{color:#aaadbb;margin:0 0 20px}.secondary{max-width:380px;margin-top:20px}button{margin:3px}${css}</style><main><h1>Aether · recorded test</h1><p>Minecraft 1.21.1 · NeoForge 21.1.250 · exact captured footage</p><video id="first" controls preload="metadata" aria-label="Aether recording" src="/video.mp4"></video><div class="secondary"><video id="second" controls preload="metadata" aria-label="Second recording" src="/video.mp4"></video></div><button id="close">Close first recording</button><button id="change">Load missing recording</button></main><script>${script}</script><script>const first=document.querySelector('#first'),second=document.querySelector('#second');const a=EnderloomVideoControls.attach(first),b=EnderloomVideoControls.attach(second);document.querySelector('#close').onclick=()=>{a.destroy();first.pause();first.removeAttribute('src');first.load();first.remove();};document.querySelector('#change').onclick=()=>{second.src='/missing.mp4';};</script>`;
  server=http.createServer(async(req,res)=>{
    if(req.url==='/'){res.writeHead(200,{'content-type':'text/html'});res.end(html);return;}
    if(req.url!=='/video.mp4'){res.writeHead(404);res.end();return;}
    const response=localVideoResponse(new Request('http://localhost/video.mp4',{method:req.method,headers:req.headers}),recording);res.writeHead(response.status,Object.fromEntries(response.headers));if(!response.body){res.end();return;}
    const stream=Readable.fromWeb(response.body);stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
  });await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const win=new BrowserWindow({width:1260,height:1000,show:false,webPreferences:{sandbox:true,contextIsolation:true}});await win.loadURL(`http://127.0.0.1:${server.address().port}/`);win.showInactive();
});app.on('window-all-closed',()=>{server?.close();app.quit();});
