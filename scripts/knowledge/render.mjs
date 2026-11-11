import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
const root=process.cwd();
const require=createRequire(path.join(root,'.knowledge-tools/package.json'));
const MarkdownIt=require('markdown-it');
const puppeteer=require('puppeteer');
const dir=path.join(root,'docs/knowledge'),out=path.join(root,'build/knowledge/visual');
fs.mkdirSync(out,{recursive:true});
const diagrams=new Map();
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.md'))){
 for(const m of fs.readFileSync(path.join(dir,f),'utf8').matchAll(/```mermaid\n([\s\S]*?)```/g)){
  if(!diagrams.has(m[1]))diagrams.set(m[1],diagrams.size+1);
 }
}
fs.writeFileSync(path.join(out,'diagrams.md'),[...diagrams.keys()].map(d=>'```mermaid\n'+d+'```').join('\n\n'));
const executable=['/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser'].find(p=>fs.existsSync(p));
if(!executable)throw new Error('A real Chrome/Chromium is required for diagram and layout proof');
const config=path.join(out,'puppeteer.json');
fs.writeFileSync(config,JSON.stringify({executablePath:executable,args:['--no-sandbox']}));
const cli=path.join(root,'.knowledge-tools/node_modules/.bin/mmdc');
const result=spawnSync(cli,['-i',path.join(out,'diagrams.md'),'-o',path.join(out,'diagrams-rendered.md'),'-p',config],{encoding:'utf8',timeout:180000});
fs.writeFileSync(path.join(out,'mermaid.log'),(result.stdout||'')+(result.stderr||''));
if(result.status!==0)throw new Error('Mermaid native render failed: '+result.stderr);
const generated=fs.readFileSync(path.join(out,'diagrams-rendered.md'),'utf8');
const svgPaths=[...generated.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map(m=>m[1]);
if(svgPaths.length!==diagrams.size)throw new Error('Incomplete Mermaid rendering');
const md=new MarkdownIt({html:true,linkify:false});
const original=md.renderer.rules.fence;
md.renderer.rules.fence=(tokens,idx,options,env,self)=>{
 const t=tokens[idx];
 if(t.info.trim()==='mermaid'){
  const n=diagrams.get(t.content);if(!n)throw new Error('Unmapped diagram');
  const svg=svgPaths[n-1];return '<figure><img class="diagram" alt="Mermaid workflow diagram" src="'+svg+'"></figure>';
 }
 return original(tokens,idx,options,env,self);
};
const css=`:root{color-scheme:light dark}*{box-sizing:border-box}body{margin:0;font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#0d1117;color:#e6edf3}main{max-width:1100px;margin:0 auto;padding:36px 48px 90px}a{color:#a7a0ff;text-decoration:none}h1{font-size:34px;line-height:1.2;border-bottom:1px solid #30363d;padding-bottom:18px}h2{font-size:23px;margin-top:32px;border-bottom:1px solid #30363d;padding-bottom:8px}h3{font-size:19px}blockquote{border-left:4px solid #8b77d9;padding:9px 18px;margin:18px 0;background:#151321}table{border-collapse:collapse;width:100%;margin:18px 0}th,td{border:1px solid #30363d;padding:10px 14px;text-align:left;vertical-align:top}th{background:#20222c}tr:nth-child(even){background:#121821}pre{white-space:pre-wrap;background:#161b22;padding:16px;border-radius:7px}code{font-size:13px;overflow-wrap:anywhere}details{border:1px solid #30363d;border-radius:7px;padding:12px 16px;margin:10px 0}summary{cursor:pointer}figure{margin:24px 0;padding:20px;border-radius:8px;background:white}.diagram{display:block;max-width:100%;height:auto;margin:auto}li{margin:6px 0}@media(prefers-color-scheme:light){body{background:#fff;color:#24292f}a{color:#6550a0}blockquote{background:#f6f3ff}th{background:#f3f0f8}th,td,details,h1,h2{border-color:#d8dee4}tr:nth-child(even){background:#f6f8fa}pre{background:#f6f8fa}}`;
const browser=await puppeteer.launch({executablePath:executable,args:['--no-sandbox'],headless:true});
const page=await browser.newPage();await page.setViewport({width:1360,height:1000,deviceScaleFactor:1});
const checked=[];
for(const name of ['Home','Checklist','Studio','Architecture','Ecosystem','Media-Integrity','Site-Adapters','Browser-and-Translation','Detailed-Acceptance','Acceptance-LIB']){
 const content=fs.readFileSync(path.join(dir,name+'.md'),'utf8');
 const html='<!doctype html><meta charset="utf-8"><title>'+name+'</title><style>'+css+'</style><main>'+md.render(content)+'</main>';
 const file=path.join(out,name+'.html');fs.writeFileSync(file,html);
 for(const theme of ['dark','light']){
  await page.emulateMediaFeatures([{name:'prefers-color-scheme',value:theme}]);
  await page.goto('file://'+file,{waitUntil:'load'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  const metrics=await page.evaluate(()=>({width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,images:[...document.images].map(i=>({loaded:i.complete&&i.naturalWidth>0,width:i.width,height:i.height})),h1:document.querySelector('h1')?.textContent}));
  if(metrics.scrollWidth>metrics.width)throw new Error('Horizontal overflow '+name);
  if(metrics.images.some(i=>!i.loaded))throw new Error('Broken diagram '+name);
  await page.screenshot({path:path.join(out,name+'-'+theme+'.png'),fullPage:name==='Home'});
  checked.push({page:name,theme,...metrics});
 }
}
await browser.close();
fs.writeFileSync(path.join(out,'visual-proof.json'),JSON.stringify({mermaidCli:'11.17.0',diagrams:diagrams.size,cases:checked},null,2));
console.log('Native Mermaid renders:',diagrams.size,'page/theme inspections:',checked.length);
