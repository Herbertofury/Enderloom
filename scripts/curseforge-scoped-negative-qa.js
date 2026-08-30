'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const {parseCurseForgeProjectHtml}=require('../src/provider-media');

const project='https://www.curseforge.com/minecraft/mc-mods/divinerpg';
const gallery=`${project}/gallery`;
const empty=`<html><head><meta property="og:title" content="DivineRPG - Minecraft Mods"></head><body><h1>DivineRPG</h1><a href="/minecraft/mc-mods/divinerpg/gallery">Gallery</a><main>This mod has no gallery items available</main></body></html>`;
const parsedEmpty=parseCurseForgeProjectHtml(empty,gallery,{title:'DivineRPG',author:'DivineRPG Team'});
assert.equal(parsedEmpty.sourceGalleryAbsent,true,'empty CurseForge /gallery must be source-scoped evidence');
assert.equal(parsedEmpty.galleryAbsent,false,'empty CurseForge /gallery must not become a project-wide terminal negative');
assert.equal(parsedEmpty.gallery.length,0);

const image='https://raw.githubusercontent.com/DivineRPG/DivineRPG/1.21/images/dimensions.png';
const canonical=`<html><head><meta property="og:title" content="DivineRPG - Minecraft Mods"></head><body><h1>DivineRPG</h1><h2>Description</h2><p>Explore the dimensions.</p><img src="${image}" alt="DivineRPG dimensions"><h2>The DivineRPG Team</h2></body></html>`;
const parsedCanonical=parseCurseForgeProjectHtml(canonical,project,{title:'DivineRPG',author:'DivineRPG Team'});
assert(parsedCanonical.gallery.some(x=>x.url===image),'canonical project Description media must remain discoverable after an empty /gallery route');
assert.equal(parsedCanonical.sourceGalleryAbsent,false);

const main=fs.readFileSync(path.join(__dirname,'..','main.js'),'utf8');
const enhance=fs.readFileSync(path.join(__dirname,'..','catalog','enhance.js'),'utf8');
assert(main.includes('value?.sourceGalleryAbsent === true'),'prime race must carry source-scoped gallery-empty evidence without treating it as failure');
assert(main.includes('if(extra.sourceGalleryAbsent===true&&!target.gallery.length)target.sourceGalleryAbsent=true'),'main merge must preserve route-scoped negative evidence only while no real gallery exists');
assert(main.includes('if(target.gallery.length){target.galleryAbsent=false;target.sourceGalleryAbsent=false;}'),'real gallery media must clear stale negative state');
assert(enhance.includes('Gallery tab empty — checking project post…'),'renderer must explain the fallback instead of claiming the whole project has no media');
assert(enhance.includes('if(s.gallery.length){s.galleryAbsent=false;s.sourceGalleryAbsent=false;}'),'renderer must clear stale negative state when real project media arrives');
assert(enhance.includes('(!s.galleryAbsent&&s.gallery.length<2)'),'source-scoped gallery absence must not suppress rich canonical project discovery');

console.log(JSON.stringify({passed:true,fixture:'divinerpg-empty-gallery-canonical-description',sourceGalleryAbsent:parsedEmpty.sourceGalleryAbsent,canonicalGallery:parsedCanonical.gallery.map(x=>x.url),uiFallback:'Gallery tab empty — checking project post…'},null,2));
