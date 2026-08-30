'use strict';
const fs=require('fs'),path=require('path');
const {parseSourceBuffer}=require('../src/ingest');
const {normalizeSnapshot}=require('../src/catalog-renderer');
function args(argv){const out={inputs:[]};for(let i=0;i<argv.length;i++){const a=argv[i];if(a==='--input'||a==='-i')out.inputs.push(argv[++i]);else if(a==='--output'||a==='-o')out.output=argv[++i];else if(a==='--id')out.id=argv[++i];else if(a==='--name')out.name=argv[++i];else if(!a.startsWith('-'))out.inputs.push(a)}return out}
const opt=args(process.argv.slice(2));if(!opt.inputs.length||!opt.output){console.error('Usage: node scripts/ingest-catalog.js --input <source> [--input <source> ...] --output <catalog.json> [--id id] [--name name]');process.exit(2)}
const parsed=opt.inputs.map(file=>{const buffer=fs.readFileSync(file);return{file,parsed:parseSourceBuffer(buffer,{filePath:file,title:path.basename(file)})}});
const primary=parsed.find(x=>x.parsed.items?.length)||parsed[0];const docs=[];for(const row of parsed)for(const d of row.parsed.documents||[])docs.push({...d,sourceFile:path.basename(row.file)});
const base=primary.parsed;const snap=normalizeSnapshot({id:opt.id||path.basename(opt.output,path.extname(opt.output)),name:opt.name||base.title||path.basename(primary.file,path.extname(primary.file)),description:`Ingested from ${parsed.length} local source${parsed.length===1?'':'s'}.`,items:base.items||[],assets:base.assets||{},documents:docs,sources:parsed.map((x,i)=>({id:`local-${i+1}`,label:path.basename(x.file),location:'local',role:x===primary?'primary':'narrative',format:x.parsed.format,path:path.resolve(x.file),autoRefresh:true,status:'snapshot'}))});
fs.mkdirSync(path.dirname(path.resolve(opt.output)),{recursive:true});fs.writeFileSync(opt.output,JSON.stringify(snap,null,2));console.log(JSON.stringify({output:path.resolve(opt.output),id:snap.id,items:snap.items.length,assets:Object.keys(snap.assets||{}).length,documents:snap.documents.length},null,2));
