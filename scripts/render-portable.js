'use strict';
const fs=require('fs');const path=require('path');const {writeCatalog}=require('../src/catalog-renderer');
const root=path.resolve(__dirname,'..'),seedDir=path.join(root,'catalog','catalogs'),out=path.join(root,'dist','portable');fs.mkdirSync(out,{recursive:true});
const names={'mob-variety':'Minecraft Mob Variety - Explorer.html','mob-girl':'Minecraft Mob Girl & Female Mob Vault - Explorer.html'};
for(const file of fs.readdirSync(seedDir).filter(x=>x.endsWith('.json'))){const snap=JSON.parse(fs.readFileSync(path.join(seedDir,file),'utf8'));const target=path.join(out,names[snap.id]||`${snap.name||snap.id} - Explorer.html`);const normalized=writeCatalog(snap,target,root);console.log(`${normalized.id}: ${normalized.items.length} entries -> ${target}`)}
