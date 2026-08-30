'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const {parseCurseForgeProjectHtml,parseCurseForgeAuthorProjectHtml,parseCurseForgeGalleryStreamSeed}=require('../src/provider-media');

const projectUrl='https://www.curseforge.com/minecraft/mc-mods/maid-useful-tasks';
const authorUrl='https://www.curseforge.com/members/xypp/projects';
const context={title:'Maid Useful Tasks',author:'xypp',authorUrl,primaryUrl:projectUrl};
const pubg='https://media.forgecdn.net/attachments/999/999/pubg-battlegrounds-ugc-contest.jpg';
const projectIconPreview='https://media.forgecdn.net/avatars/thumbnails/1250/606/256/256/638816218118878552.png';
const projectIcon='https://media.forgecdn.net/avatars/1250/606/638816218118878552.png';
const authorAvatar='https://media.forgecdn.net/avatars/1307/570/638850123048469351.png';
const descriptionImage='https://cdn.modrinth.com/data/maid-useful/images/logging-demo.png';
const unrelated='https://media.forgecdn.net/avatars/thumbnails/999/111/256/256/damage-number.png';
const tier='https://media.forgecdn.net/avatars/tier-frame.png';

const projectHtml=`<!doctype html><html><head><title>Maid Useful Tasks - Minecraft Mods - CurseForge</title></head><body>
<section class="global-promo"><img src="${pubg}" alt="PUBG BATTLEGROUNDS UGC CONTEST"></section>
<header class="project-header"><h1>Maid Useful Tasks</h1><img src="${projectIconPreview}" alt="Maid Useful Tasks project image"></header>
<nav><a href="${projectUrl}/gallery">Gallery</a></nav>
<main id="description"><h1>Maid Useful Tasks</h1><p>Logging demo</p><img src="${descriptionImage}" alt="Maid Useful Tasks logging feature screenshot"></main>
<section><h2>The Maid Useful Tasks Team</h2><img src="${tier}" alt="HighCrafter tier frame"><img src="${authorAvatar}" alt="profile avatar"><a href="${authorUrl}">xypp</a></section>
<section><h2>More from xypp</h2><img src="${unrelated}" alt="Damage Number project image"><a href="https://www.curseforge.com/minecraft/mc-mods/damage-number">Damage Number</a></section>
<footer>CurseForge</footer></body></html>`;

const parsed=parseCurseForgeProjectHtml(projectHtml,projectUrl,context);
assert(parsed,'CurseForge parser returned null');
assert.equal(parsed.icon?.url,projectIcon,'exact project icon was not role-bound to the matching project header');
assert.equal(parsed.icon?.role,'icon');
assert.equal(parsed.icon?.previewUrl,projectIconPreview,'project icon did not retain its small exact preview');
assert.equal(parsed.author?.url,authorAvatar,'exact author avatar was not role-bound to the matching member card');
assert.equal(parsed.author?.role,'author');
assert.equal(parsed.authorUrl,authorUrl);
assert(parsed.gallery.some(x=>x.url===descriptionImage),'legitimate exact-project description image missing from gallery');
for(const item of parsed.gallery){
  assert.equal(item.role,'gallery','gallery contains a non-gallery role');
  assert.notEqual(item.url,authorAvatar,'author avatar leaked into gallery');
  assert.notEqual(item.url,projectIcon,'project icon leaked into gallery');
  assert.notEqual(item.url,unrelated,'More-from sibling project leaked into gallery');
  assert.notEqual(item.url,pubg,'global CurseForge promotion leaked into gallery');
  assert.notEqual(item.url,tier,'creator tier decoration leaked into gallery');
}
assert.notEqual(parsed.icon?.url,parsed.author?.url,'project icon and author avatar were conflated');

const galleryHtml=`<!doctype html><html><head><title>Maid Useful Tasks - Gallery - Minecraft Mods - CurseForge</title></head><body>
<img src="${pubg}" alt="PUBG BATTLEGROUNDS UGC CONTEST"><h1>Maid Useful Tasks</h1><p>This mod has no gallery items available</p><footer>CurseForge</footer></body></html>`;
const galleryParsed=parseCurseForgeProjectHtml(galleryHtml,projectUrl+'/gallery',context);
assert.equal(galleryParsed.sourceGalleryAbsent,true,'provider-gallery negative state was not recognized');
assert.equal(galleryParsed.galleryAbsent,false,'provider-gallery negative incorrectly became a project-wide terminal state');
assert.equal(galleryParsed.gallery.length,0,'no-gallery route invented gallery media');
assert.equal(parseCurseForgeGalleryStreamSeed(galleryHtml,projectUrl+'/gallery',context),null,'negative gallery route produced a fake stream seed');

const authorHtml=`<!doctype html><html><head><title>xypp's Profile - Member List - CurseForge</title></head><body>
<img src="${tier}" alt="HighCrafter tier frame"><img src="${authorAvatar}" alt="profile avatar"><h1>xypp</h1><span>Author</span>
<section class="projects">
  <article><img src="${unrelated}" alt="Damage Number logo"><a href="https://www.curseforge.com/minecraft/mc-mods/damage-number">Damage Number</a></article>
  <article><img src="${projectIconPreview}" alt="Maid Useful Tasks logo"><a href="${projectUrl}">Maid Useful Tasks</a></article>
</section><footer>CurseForge</footer></body></html>`;
const authorParsed=parseCurseForgeAuthorProjectHtml(authorHtml,authorUrl,context);
assert.equal(authorParsed.author?.url,authorAvatar,'author profile parser selected a project/tier image instead of profile avatar');
assert.equal(authorParsed.author?.role,'author');
assert.equal(authorParsed.icon?.url,projectIcon,'author project index did not bind the exact project logo');
assert.equal(authorParsed.icon?.role,'icon');
assert.equal(authorParsed.icon?.previewUrl,projectIconPreview,'author project index did not retain the exact 256px preview');
assert.equal(authorParsed.projectUrl,projectUrl);
assert.notEqual(authorParsed.icon?.url,unrelated,'author project index selected sibling project logo');

const main=fs.readFileSync(path.resolve(__dirname,'../main.js'),'utf8');
const enhance=fs.readFileSync(path.resolve(__dirname,'../catalog/enhance.js'),'utf8');
assert(!main.includes("role:String(raw.role || role)"),'sanitizer still permits upstream role to override destination role');
assert(main.includes("raw.role&&raw.role!=='gallery'"),'merge path does not reject explicit non-gallery items from gallery');
assert(!/s\.icon\s*\|\|\s*s\.gallery\[0\]/.test(enhance),'renderer still promotes gallery media into project icon');
assert(!/s\.gallery\[0\]\s*\|\|\s*s\.icon/.test(enhance),'renderer still promotes project icon into gallery');
assert(enhance.includes('s.galleryAbsent'),'renderer lacks definitive no-gallery state');
assert(enhance.includes('s.sourceGalleryAbsent'),'renderer lacks provider-gallery scoped negative state');

console.log(JSON.stringify({passed:true,projectRoles:{icon:parsed.icon.url,author:parsed.author.url,gallery:parsed.gallery.map(x=>x.url)},negativeGallery:{sourceGalleryAbsent:galleryParsed.sourceGalleryAbsent,galleryAbsent:galleryParsed.galleryAbsent},authorIndex:{author:authorParsed.author.url,icon:authorParsed.icon.url},rejected:[pubg,unrelated,tier]},null,2));
