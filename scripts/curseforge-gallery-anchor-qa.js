'use strict';
const assert=require('assert');
const {parseGenericProjectHtml,parseCurseForgeGalleryStreamSeed}=require('../src/provider-media');
const {curseForgeOwnedMediaPattern}=require('../src/curseforge-fastlane');

const source='https://www.curseforge.com/minecraft/mc-mods/boks-butterflies/gallery';
const title="Bok's Banging Butterflies";
const urls=[
  'https://media.forgecdn.net/attachments/774/987/bookstats.png',
  'https://media.forgecdn.net/attachments/749/989/pink.png',
  'https://media.forgecdn.net/attachments/749/997/chrysalis.png',
  'https://media.forgecdn.net/attachments/749/976/advancements.png',
  'https://media.forgecdn.net/attachments/749/982/caterpillars.png',
  'https://media.forgecdn.net/attachments/749/986/eggs.png',
  'https://media.forgecdn.net/attachments/749/977/bottles.png',
  'https://media.forgecdn.net/attachments/774/985/scrolls.png',
  'https://media.forgecdn.net/attachments/749/988/monarch.png',
  'https://media.forgecdn.net/attachments/774/986/bookbutterfly.png',
  'https://media.forgecdn.net/attachments/749/990/swarm.png'
];
const promo='https://media.forgecdn.net/attachments/9999/8888/pubg-battlegrounds-ugc-contest.jpg';
const placeholder='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const cards=urls.map((url,i)=>`<li><a class="gallery-card" href="${url}" aria-label="Gallery image ${i+1}"><img class="lazy-placeholder" src="${placeholder}" alt="Thumbnail gallery image ${i+1}"></a>${i===7?'<a href="/minecraft/mc-mods/boks-butterflies/gallery">Gallery</a>':''}</li>`).join('');
const html=`<body><header><img src="${promo}" alt="PUBG BATTLEGROUNDS UGC CONTEST"></header><main><h1>${title}</h1><nav><a href="/minecraft/mc-mods/boks-butterflies">Description</a><a href="/minecraft/mc-mods/boks-butterflies/comments">Comments</a><a href="/minecraft/mc-mods/boks-butterflies/files">Files</a><a href="/minecraft/mc-mods/boks-butterflies/gallery">Gallery (11)</a><a href="/minecraft/mc-mods/boks-butterflies/relations/dependencies">Relations</a></nav><ul>${cards}</ul><div>CurseForge - a world of endless gaming possibilities for modders and gamers alike.</div></main></body>`;

const parsed=parseGenericProjectHtml(html,source,{title,author:'DocBok'});
assert.equal(parsed.gallery.length,11,'all eleven direct attachment links must survive');
assert.deepEqual(new Set(parsed.gallery.map(x=>x.url)),new Set(urls),'gallery originals changed or were dropped');
assert(parsed.gallery.every(x=>x.source.endsWith('-attachment-link')),'placeholder fixture unexpectedly relied on nested images');
assert(!parsed.gallery.some(x=>x.url===promo),'global promo leaked into exact gallery');

const seed=parseCurseForgeGalleryStreamSeed(html,source,{title});
assert(seed?.gallery?.length===1&&urls.includes(seed.gallery[0].url),'progressive stream seed did not recover a direct attachment');
const gate=curseForgeOwnedMediaPattern({title},true);
assert(gate?.test(html),'progressive gallery media gate did not recognize direct attachment href');
assert(!gate?.test(`<h1>Different Project</h1><a href="${urls[0]}">Gallery</a>`),'gallery media gate lost exact-project identity binding');

const thumb='https://media.forgecdn.net/attachments/thumbnails/774/987/310/172/bookstats.png';
const thumbHtml=`<body><h1>${title}</h1><a href="/minecraft/mc-mods/boks-butterflies/gallery">Gallery (1)</a><a href="${thumb}" title="Book stats"><img src="${placeholder}"></a></body>`;
const thumbParsed=parseGenericProjectHtml(thumbHtml,source,{title});
assert.equal(thumbParsed.gallery[0]?.url,urls[0],'thumbnail href must canonicalize to full attachment');
assert.equal(thumbParsed.gallery[0]?.previewUrl,thumb,'thumbnail href must remain available as first-paint preview');

console.log(JSON.stringify({passed:true,fixture:'boks-butterflies-live-topology-description-before-gallery',galleryCount:parsed.gallery.length,streamSeed:seed.gallery[0].url,directAttachmentHref:true,descriptionBeforeGallery:true,relationsBeforeImages:true,repeatedGalleryBoundary:true,promoIsolation:true,thumbnailCanonicalization:true}));
