'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const {providerForUrl}=require('../src/provider-fastlane');
const root=path.join(__dirname,'..','catalog','catalogs');
const files=['mob-variety.json','mob-girl.json'];
const counts=new Map(),generic=[];let urls=0,items=0;
for(const file of files){const data=JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));for(const item of data.items||[]){items++;for(const source of item.sources||[]){const url=String(source.url||'');if(!/^https?:/i.test(url))continue;urls++;const provider=providerForUrl(url);counts.set(provider,(counts.get(provider)||0)+1);if(provider==='generic')generic.push({file,id:item.id,name:item.name,url})}}}
assert.equal(generic.length,0,`current catalog has ${generic.length} unclassified provider URLs: ${generic.slice(0,5).map(x=>x.url).join(', ')}`);
for(const required of ['curseforge','modrinth','github','planetminecraft','mcpedl','modbay','afdian','booth','fourthwall','alltheysm'])assert(counts.has(required),`expected current catalog provider not represented: ${required}`);
console.log(JSON.stringify({passed:true,items,urls,providers:Object.fromEntries([...counts.entries()].sort((a,b)=>b[1]-a[1]))}));
