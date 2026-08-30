'use strict';
const assert=require('assert');
const {parsePlanetMinecraftHtml,parseGenericProjectHtml,parseCurseForgeGalleryStreamSeed,resolveProviderProjectLinks,titleSimilarity,providerForUrl,curseForgeFullAndPreview,providerImageAllowed,isProviderCollectionUrl}=require('../src/provider-media');
const {curseForgeOwnedMediaPattern}=require('../src/curseforge-fastlane');

const source='https://www.planetminecraft.com/texture-pack/female-villagers/';
const good='https://static.planetminecraft.com/files/image/minecraft/texture-pack/2023/735/17359590-o_l.jpg';
const wrong='https://static.planetminecraft.com/files/image/minecraft/texture-pack/2025/111/99999999-wrong.jpg';
const avatar='https://static.planetminecraft.com/files/avatar/123.png';
const html=`<!doctype html><head><meta property="og:title" content="Female Villagers Minecraft Texture Pack"><meta property="og:image" content="${wrong}"></head><body><h1>Female Villagers</h1><section class="project"><div>PMCBBCode[url=${source}][img]${good}[/img] Female Villagers[/url] by [mn=3123040]BoBkiNN[/mn]</div><div>HTML<a href="${source}" title="Female Villagers Minecraft Texture Pack"><img src="${good}" alt="Female Villagers">Female Villagers</a> by <a href="https://www.planetminecraft.com/member/bobkinn/">BoBkiNN</a></div></section><h2>More like this</h2><article><img src="${wrong}"><a>Totally Different Pack</a></article><section class="comments"><img src="${avatar}"></section></body>`;
const pmc=parsePlanetMinecraftHtml(html,source,{title:'Female Villagers',author:'BoBkiNN',authorUrl:'https://www.planetminecraft.com/member/bobkinn/'});
assert.equal(providerForUrl(source),'planetminecraft');
assert(titleSimilarity('Female Villagers','Female Villagers Minecraft Texture Pack')>.8);
assert.deepEqual(pmc.gallery.map(x=>x.url),[good],'PMC must dedupe canonical embed and page image to one exact asset');
assert(!pmc.gallery.some(x=>x.url===wrong),'More-like-this image leaked into gallery');
assert(!pmc.gallery.some(x=>x.url===avatar),'comment avatar leaked into gallery');
assert.equal(pmc.authorUrl,'https://www.planetminecraft.com/member/bobkinn/');
assert(pmc.gallery[0].confidence>=95,'canonical embed should be highest confidence');
const mismatch=parsePlanetMinecraftHtml(html,source,{title:'Completely Different Mod',author:'Nobody'});
assert.equal(mismatch.gallery.length,0,'identity mismatch should reject project media');

// Critical audit case: many catalog rows point to a Planet Minecraft collection rather
// than the exact child project. Never show the collection hero/neighbor images. Resolve
// the exact title link first, then fetch that child project in the main-process resolver.
const collection='https://www.planetminecraft.com/collection/306925/none-of-you-are-free-of-sin/';
const target='https://www.planetminecraft.com/texture-pack/creeper-woman-6145815/';
const collectionHtml=`<body><h1>None of you are free of sin</h1>
<a href="/texture-pack/random-neighbor/"><img alt="Random Neighbor">Random Neighbor</a>
<a href="/texture-pack/creeper-woman-6145815/" title="Creeper Woman"><img alt="Creeper Woman" src="https://static.planetminecraft.com/files/image/minecraft/texture-pack/2024/100/creeper-320.jpg" srcset="https://static.planetminecraft.com/files/image/minecraft/texture-pack/2024/100/creeper-320.jpg 320w, https://static.planetminecraft.com/files/image/minecraft/texture-pack/2024/100/creeper-1280.jpg 1280w">Creeper Woman</a>
<a href="/texture-pack/other-girl/">Other Girl</a></body>`;
const collectionParsed=parsePlanetMinecraftHtml(collectionHtml,collection,{title:'Creeper Woman'});
assert.equal(collectionParsed.gallery.length,0,'collection page media must never become project media');
assert.equal(collectionParsed.resolvedCandidates?.[0]?.url,target,'exact PMC collection child must rank first');
assert(collectionParsed.resolvedCandidates[0].confidence>=95,'exact collection title match should be high confidence');
assert(/1280/.test(collectionParsed.resolvedCandidates[0].seedMedia?.url||''),'exact child link should retain its largest live provider image as an immediate seed');
assert(/320/.test(collectionParsed.resolvedCandidates[0].seedMedia?.previewUrl||''),'exact child link should retain its smaller live provider preview for fast cards');
assert.equal(resolveProviderProjectLinks(collectionHtml,collection,{title:'Creeper Woman'})[0].url,target);

const generic=parseGenericProjectHtml(`<!doctype html><head><meta property="og:title" content="Hostile Mobs and Girls - Mod"><meta property="og:image" content="https://cdn.example.org/hmag.jpg"></head>`, 'https://example.org/hostile-mobs-and-girls/', {title:'HMaG — Hostile Mobs and Girls'});
assert.equal(generic.gallery[0]?.url,'https://cdn.example.org/hmag.jpg');
const genericWrong=parseGenericProjectHtml(`<!doctype html><head><meta property="og:title" content="Recommended Other Mod"><meta property="og:image" content="https://cdn.example.org/wrong.jpg"></head>`, 'https://example.org/something/', {title:'HMaG — Hostile Mobs and Girls'});
assert.equal(genericWrong.gallery.length,0,'wrong generic page should be rejected');

// MCPEDL: project media is above the recommendations/comments; comment avatars and
// recommendation cards must never enter the gallery.
const mc='https://mcpedl.com/anime-waifus/';
const mcGood='https://r2.mcpedl.com/submissions/123/anime-waifus-project.jpg';
const mcComment='https://r2.mcpedl.com/users/comment-avatar.jpg';
const mcRelated='https://r2.mcpedl.com/submissions/999/other-addon.jpg';
const mcHtml=`<head><meta property="og:title" content="Anime Waifus | Minecraft PE Addons"><meta property="og:image" content="${mcGood}"></head><body><h1>Anime Waifus</h1><img src="${mcGood}" alt="Anime Waifus showcase"><p>By <a href="/user/virtualblack8/">Virtualblack8</a></p><h4>You may also like</h4><img src="${mcRelated}" alt="Other Addon"><h4>Pinned comment</h4><img src="${mcComment}" alt="avatar"></body>`;
const mcp=parseGenericProjectHtml(mcHtml,mc,{title:'Anime Waifus',author:'Virtualblack8'});
assert(mcp.gallery.some(x=>x.url===mcGood),'MCPEDL exact project image missing');
assert(!mcp.gallery.some(x=>x.url===mcRelated),'MCPEDL recommendation leaked');
assert(!mcp.gallery.some(x=>x.url===mcComment),'MCPEDL comment avatar leaked');
assert(/virtualblack8/i.test(mcp.authorUrl),'MCPEDL exact author link missing');

// ModBay often renders unrelated feed/comments before the project H1. The parser must
// anchor to the matching H1 and the project body, not the first images on the page.
const mb='https://modbay.org/mods/259-mocreatures.html';
const mbGood='https://modbay.org/uploads/posts/2024-04/mocreatures-bunny.webp';
const mbWrong='https://modbay.org/uploads/posts/2026-08/trending-unrelated.webp';
const mbHtml=`<body><div><img src="${mbWrong}" alt="Trending Unrelated">${'x'.repeat(5000)}</div><h1>Mo' Creatures Add-on (1.0.3)</h1><img src="${mbGood}" alt="Mo Creatures Bunny"><h2>Comments</h2><img src="${mbWrong}" alt="comment"></body>`;
const modbay=parseGenericProjectHtml(mbHtml,mb,{title:"Mo' Creatures Add-on"});
assert(modbay.gallery.some(x=>x.url===mbGood),'ModBay project image missing');
assert(!modbay.gallery.some(x=>x.url===mbWrong),'ModBay feed/comment image leaked');

// Fourthwall product imagery uses a dedicated CDN and descriptive product-image alts.
const fw='https://minto-shop.fourthwall.com/products/cat-maid-yes-steve-model';
const fwGood='https://imgproxy.fourthwall.dev/a/cat-maid-1.webp';
const fwRelated='https://imgproxy.fourthwall.dev/a/other-model.webp';
const fwHtml=`<body><img src="${fwGood}" alt="Cat Maid | Yes Steve Model product image (1)"><h1>Cat Maid | Yes Steve Model</h1><h2>Related products</h2><img src="${fwRelated}" alt="Red Fox product image"></body>`;
const fourthwall=parseGenericProjectHtml(fwHtml,fw,{title:'Cat Maid | Yes Steve Model',author:'Minto-Shop'});
assert(fourthwall.gallery.some(x=>x.url===fwGood),'Fourthwall exact product image missing');
assert(!fourthwall.gallery.some(x=>x.url===fwRelated),'Fourthwall related product leaked');
assert.equal(fourthwall.exclusive,true,'known provider exact media should suppress generic Chromium scrape');

// AFDIAN creator/shop pages are resolvers, not galleries, when a catalog item names a
// specific product. Resolve the exact /p/ child instead of borrowing another product.
const afd='https://afdian.com/a/FliegeSA';
const afdTarget='https://afdian.com/p/abc123';
const afdHtml=`<body><h1>Feather_aya</h1><a href="/p/not-this"><span>Other Model</span></a><a href="/p/abc123" title="Wolf Girl Sahmet - Standard">Wolf Girl Sahmet - Standard</a></body>`;
const afdLinks=resolveProviderProjectLinks(afdHtml,afd,{title:'Wolf Girl Sahmet - Standard'});
assert.equal(afdLinks[0]?.url,afdTarget,'AFDIAN exact product child should resolve from creator shop');

// CurseForge: use the fast live 310x172 CDN thumbnail for card paint while preserving
// the corresponding full-resolution attachment for hover/lightbox. Only Description
// imagery is accepted; team/recommendation/avatar images remain excluded.
const cf='https://www.curseforge.com/minecraft/mc-mods/contract-blade';
const cfThumb='https://media.forgecdn.net/attachments/thumbnails/123/456/310/172/contract-blade.png';
const cfFull='https://media.forgecdn.net/attachments/123/456/contract-blade.png';
const cfWrong='https://media.forgecdn.net/attachments/thumbnails/999/888/310/172/other-mod.png';
const cfHtml=`<head><meta property="og:title" content="Contract Blade - Minecraft Mods"></head><body><h1>Contract Blade</h1><h2>Description</h2><p>Bound maid weapon.</p><img src="${cfThumb}" alt="Contract Blade battle preview"><h2>The Contract Blade Team</h2><img src="${cfWrong}" alt="profile avatar"></body>`;
const cfParsed=parseGenericProjectHtml(cfHtml,cf,{title:'Contract Blade',author:'Contract Blade team'});
assert.equal(cfParsed.gallery[0]?.url,cfFull,'CurseForge card thumbnail must preserve the full-resolution attachment as the canonical gallery URL');
assert.equal(cfParsed.gallery[0]?.previewUrl,cfThumb,'CurseForge live thumbnail should be used for fast card paint');
assert(!cfParsed.gallery.some(x=>x.url.includes('other-mod')),'CurseForge team/recommendation image leaked into gallery');
assert.deepEqual(curseForgeFullAndPreview(cfThumb),{url:cfFull,previewUrl:cfThumb});

// 2.6 regression: CurseForge currently places global UGC/contest advertising before
// the project H1.  Stream seeds must wait for the project ownership boundary and never
// paint the first globally trusted ForgeCDN image just because it arrived first.
const cfGallery='https://www.curseforge.com/minecraft/mc-mods/maid-useful-tasks/gallery';
const cfPromo='https://media.forgecdn.net/attachments/9999/8888/pubg-battlegrounds-ugc-contest.jpg';
const cfOwnedThumb='https://media.forgecdn.net/attachments/thumbnails/777/666/310/172/maid-useful-tasks-preview.png';
const cfOwnedFull='https://media.forgecdn.net/attachments/777/666/maid-useful-tasks-preview.png';
const cfGalleryHtml=`<body><header class="global-promo"><img src="${cfPromo}" alt="PUBG BATTLEGROUNDS UGC CONTEST"></header><main><h1>Maid Useful Tasks</h1><a href="/minecraft/mc-mods/maid-useful-tasks/gallery">Gallery (4)</a><img class="gallery-thumbnail" src="${cfOwnedThumb}" alt="Maid Useful Tasks screenshot"><h2>Description</h2></main></body>`;
const cfStream=parseCurseForgeGalleryStreamSeed(cfGalleryHtml,cfGallery,{title:'Maid Useful Tasks'});
assert.equal(cfStream?.gallery?.[0]?.url,cfOwnedFull,'CurseForge stream seed must use the project-owned gallery image after the matching H1');
assert(!cfStream?.gallery?.some(x=>x.url===cfPromo),'global CurseForge promo image leaked into project stream seed');
assert.equal(parseCurseForgeGalleryStreamSeed(`<body><img src="${cfPromo}" alt="PUBG BATTLEGROUNDS UGC CONTEST">`,cfGallery,{title:'Maid Useful Tasks'}),null,'stream seed must wait for project identity instead of guessing before H1 arrives');


// 2.9.3 production regression: Bok's Banging Butterflies currently exposes eleven
// real gallery originals as direct media.forgecdn.net attachment links. The nested
// <img> may still be a lazy placeholder, so href extraction must be first-class after
// the exact project H1 + Gallery boundary. A repeated /gallery link later in the SSR
// must not move the start boundary forward and discard earlier images.
const boksGallery='https://www.curseforge.com/minecraft/mc-mods/boks-butterflies/gallery';
const boksUrls=[
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
const boksLabels=[
  'Collect all the butterflies to learn more about them.',
  'I just liked this screenshot with the rainbow butterflies.',
  'Caterpillars will make chrysalises before crawling out as butterflies.',
  'Many advancements to help you explore the mod.',
  'Caterpillars will hatch onto trees and leaves.',
  'Butterflies will lay eggs that eventually hatch into caterpillars.',
  'Catch butterflies and bottle them so you can decorate your home.',
  'Create scrolls to put your butterflies on display.',
  'One of the 16 different varieties of butterflies.',
  'Add scrolls as pages to a book.',
  '16 different species to find among various biomes.'
];
const boksCards=boksUrls.map((url,i)=>`<li><a class="gallery-card" href="${url}" title="${boksLabels[i]}"><img class="lazy-placeholder" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="Thumbnail ${boksLabels[i]}"></a><p>${boksLabels[i]}</p>${i===7?'<a href="/minecraft/mc-mods/boks-butterflies/gallery">Gallery</a>':''}</li>`).join('');
const boksHtml=`<body><header><img src="${cfPromo}" alt="PUBG BATTLEGROUNDS UGC CONTEST"></header><main><h1>Bok's Banging Butterflies</h1><nav><a href="/minecraft/mc-mods/boks-butterflies/gallery">Gallery (11)</a></nav><ul>${boksCards}</ul><div>CurseForge - a world of endless gaming possibilities for modders and gamers alike.</div></main></body>`;
const boksParsed=parseGenericProjectHtml(boksHtml,boksGallery,{title:"Bok's Banging Butterflies",author:'DocBok'});
assert.deepEqual(new Set(boksParsed.gallery.map(x=>x.url)),new Set(boksUrls),'CurseForge direct attachment href recovery must retain all 11 project-owned gallery originals');
assert.equal(boksParsed.gallery.length,11,'Bok production-shaped fixture must expose all eleven gallery items without duplicates');
assert(!boksParsed.gallery.some(x=>x.url===cfPromo),'global CurseForge promo must not leak through direct-link recovery');
assert(boksParsed.gallery.every(x=>/attachment-link$/.test(x.source)),'placeholder-only Bok fixture must be recovered from authoritative attachment links');
const boksSeed=parseCurseForgeGalleryStreamSeed(boksHtml,boksGallery,{title:"Bok's Banging Butterflies"});
assert(boksUrls.includes(boksSeed?.gallery?.[0]?.url),'progressive Bok stream seed must recover a canonical gallery attachment URL');
const boksGate=curseForgeOwnedMediaPattern({title:"Bok's Banging Butterflies"},true);
assert(boksGate?.test(boksHtml),'CurseForge progressive media gate must recognize exact-H1 direct gallery attachment markup');
assert(!boksGate?.test(`<body><img src="${cfPromo}"><h1>Different Project</h1><a href="${boksUrls[0]}">Gallery</a></body>`),'CurseForge progressive media gate must remain bound to the exact project H1');

console.log(JSON.stringify({passed:true,pmcGallery:pmc.gallery.length,pmcCollectionResolved:collectionParsed.resolvedCandidates[0].url,mcpedlGallery:mcp.gallery.length,modbayGallery:modbay.gallery.length,fourthwallGallery:fourthwall.gallery.length,genericIdentity:generic.identity,curseforgePreview:true}));

// Multi-platform exact media: 2.5 treats creator/support/Bedrock storefronts as
// first-class project sources rather than CurseForge fallbacks.
const patreonPost='https://www.patreon.com/posts/cat-maid-pack-123456';
const patreonImg='https://c10.patreonusercontent.com/4/patreon-media/p/post/123456/preview.jpg';
const patreon=parseGenericProjectHtml(`<head><meta property="og:title" content="Cat Maid Pack"><meta property="og:image" content="${patreonImg}"></head><body><h1>Cat Maid Pack</h1></body>`,patreonPost,{title:'Cat Maid Pack',author:'Creator'});
assert.equal(providerForUrl(patreonPost),'patreon');
assert.equal(patreon.gallery[0]?.url,patreonImg,'Patreon public exact post image missing');
const patreonProfile='https://www.patreon.com/c/catcreator';
const patreonLinks=resolveProviderProjectLinks(`<a href="/posts/cat-maid-pack-123456" title="Cat Maid Pack"><img src="${patreonImg}" alt="Cat Maid Pack">Cat Maid Pack</a>`,patreonProfile,{title:'Cat Maid Pack'});
assert.equal(patreonLinks[0]?.url,patreonPost,'Patreon creator page must resolve exact post child');

const afdExact='https://afdian.com/p/abc123';
const afdImg='https://pic1.afdiancdn.com/user/abc123/wolf-girl.webp';
const afdExactParsed=parseGenericProjectHtml(`<head><meta property="og:title" content="Wolf Girl Sahmet - Standard"><meta property="og:image" content="${afdImg}"></head><body><h1>Wolf Girl Sahmet - Standard</h1><img src="${afdImg}" alt="Wolf Girl Sahmet Standard preview"></body>`,afdExact,{title:'Wolf Girl Sahmet - Standard'});
assert.equal(afdExactParsed.gallery[0]?.url,afdImg,'AFDIAN exact public product image missing');

const marketplace='https://www.minecraft.net/en-us/marketplace/pdp/0fa7866f-8338-47b5-a324-4e0d0d21a07b';
const marketplaceImg='https://www.minecraft.net/content/dam/minecraftnet/games/minecraft/marketplace/cute-pets.jpg';
const marketplaceParsed=parseGenericProjectHtml(`<head><meta property="og:title" content="Cute Pets"><meta property="og:image" content="${marketplaceImg}"></head><body><h1>Cute Pets</h1></body>`,marketplace,{title:'Cute Pets'});
assert.equal(providerForUrl(marketplace),'minecraft-marketplace');
assert.equal(marketplaceParsed.gallery[0]?.url,marketplaceImg,'Minecraft Marketplace PDP image missing');
const marketplaceIndex='https://www.minecraft.net/en-us/marketplace';
assert.equal(resolveProviderProjectLinks(`<a href="/en-us/marketplace/pdp/0fa7866f-8338-47b5-a324-4e0d0d21a07b" title="Cute Pets"><img src="${marketplaceImg}" alt="Cute Pets">Cute Pets</a>`,marketplaceIndex,{title:'Cute Pets'})[0]?.url,marketplace,'Marketplace index must resolve exact PDP');

const kofi='https://ko-fi.com/s/ABC123';
const kofiImg='https://storage.ko-fi.com/cdn/useruploads/display/ABC123_catgirl.png';
const kofiParsed=parseGenericProjectHtml(`<head><meta property="og:title" content="Catgirl Model"><meta property="og:image" content="${kofiImg}"></head><body><h1>Catgirl Model</h1></body>`,kofi,{title:'Catgirl Model'});
assert.equal(kofiParsed.gallery[0]?.url,kofiImg,'Ko-fi shop item image missing');
assert.equal(resolveProviderProjectLinks(`<a href="/s/ABC123" title="Catgirl Model"><img src="${kofiImg}" alt="Catgirl Model">Catgirl Model</a>`,'https://ko-fi.com/catcreator',{title:'Catgirl Model'})[0]?.url,kofi,'Ko-fi creator page must resolve exact shop item');

const itch='https://catcreator.itch.io/cute-mobs';
const itchImg='https://img.itch.zone/aW1nLzEyMzQ1NjcucG5n/original/cute-mobs.png';
const itchParsed=parseGenericProjectHtml(`<head><meta property="og:title" content="Cute Mobs"><meta property="og:image" content="${itchImg}"></head><body><h1>Cute Mobs</h1></body>`,itch,{title:'Cute Mobs'});
assert.equal(itchParsed.gallery[0]?.url,itchImg,'itch.io exact project image missing');
assert.equal(resolveProviderProjectLinks(`<a href="/cute-mobs" title="Cute Mobs"><img src="${itchImg}" alt="Cute Mobs">Cute Mobs</a>`,'https://catcreator.itch.io/',{title:'Cute Mobs'})[0]?.url,itch,'itch.io creator page must resolve exact project');


// 2.5 universal resource/provider fixtures.
const hangar='https://hangar.papermc.io/ViaVersion/ViaVersion';
const hangarImg='https://hangar.papermc.io/api/v1/projects/ViaVersion/avatar';
assert.equal(providerForUrl(hangar),'hangar');
assert(providerImageAllowed('hangar',hangarImg));
const hangarParsed=parseGenericProjectHtml(`<head><meta property="og:title" content="ViaVersion"><meta property="og:image" content="${hangarImg}"></head><body><h1>ViaVersion</h1></body>`,hangar,{title:'ViaVersion'});
assert.equal(hangarParsed.gallery[0]?.url,hangarImg,'Hangar exact project avatar missing');
const hangarOwner='https://hangar.papermc.io/ViaVersion';
assert(isProviderCollectionUrl(hangarOwner));
assert.equal(resolveProviderProjectLinks(`<a href="/ViaVersion/ViaVersion" title="ViaVersion"><img src="${hangarImg}" alt="ViaVersion">ViaVersion</a>`,hangarOwner,{title:'ViaVersion'})[0]?.url,hangar);

const spigot='https://www.spigotmc.org/resources/worldedit.53036/';
const spigotImg='https://www.spigotmc.org/data/resource_icons/53/53036.jpg';
assert.equal(providerForUrl(spigot),'spigot');assert(providerImageAllowed('spigot',spigotImg));
assert.equal(parseGenericProjectHtml(`<head><meta property="og:title" content="WorldEdit"><meta property="og:image" content="${spigotImg}"></head><body><h1>WorldEdit</h1></body>`,spigot,{title:'WorldEdit'}).gallery[0]?.url,spigotImg);
assert.equal(resolveProviderProjectLinks(`<a href="/resources/worldedit.53036/" title="WorldEdit"><img src="${spigotImg}" alt="WorldEdit">WorldEdit</a>`,'https://www.spigotmc.org/resources/categories/admin-tools.1/',{title:'WorldEdit'})[0]?.url,spigot);

const bukkit='https://dev.bukkit.org/projects/worldedit';
const bukkitImg='https://media.forgecdn.net/avatars/thumbnails/105/105/64/64/worldedit.png';
assert.equal(providerForUrl(bukkit),'bukkit');assert(providerImageAllowed('bukkit',bukkitImg));
assert.equal(parseGenericProjectHtml(`<head><meta property="og:title" content="WorldEdit"><meta property="og:image" content="${bukkitImg}"></head><body><h1>WorldEdit</h1></body>`,bukkit,{title:'WorldEdit'}).gallery[0]?.url,bukkitImg);

const bbb='https://builtbybit.com/resources/example-resource.1234/';
const bbbImg='https://builtbybit.com/attachments/example-png.1234/';
assert.equal(providerForUrl(bbb),'builtbybit');assert(providerImageAllowed('builtbybit',bbbImg));
assert.equal(parseGenericProjectHtml(`<head><meta property="og:title" content="Example Resource"><meta property="og:image" content="${bbbImg}"></head><body><h1>Example Resource</h1></body>`,bbb,{title:'Example Resource'}).gallery[0]?.url,bbbImg);

const nexus='https://www.nexusmods.com/minecraft/mods/123';
const nexusImg='https://staticdelivery.nexusmods.com/mods/4000/images/123/123-1700000000.jpg';
assert.equal(providerForUrl(nexus),'nexusmods');assert(providerImageAllowed('nexusmods',nexusImg));
assert.equal(parseGenericProjectHtml(`<head><meta property="og:title" content="Pretty Mobs"><meta property="og:image" content="${nexusImg}"></head><body><h1>Pretty Mobs</h1></body>`,nexus,{title:'Pretty Mobs'}).gallery[0]?.url,nexusImg);

const moddb='https://www.moddb.com/mods/example-minecraft-mod';
const moddbImg='https://media.moddb.com/images/mods/1/99/98000/example.jpg';
assert.equal(providerForUrl(moddb),'moddb');assert(providerImageAllowed('moddb',moddbImg));
assert(!providerImageAllowed('moddb','https://media.moddb.com/images/global/moddb.png'),'ModDB global logo must be rejected');
assert.equal(parseGenericProjectHtml(`<head><meta property="og:title" content="Example Minecraft Mod"><meta property="og:image" content="${moddbImg}"></head><body><h1>Example Minecraft Mod</h1></body>`,moddb,{title:'Example Minecraft Mod'}).gallery[0]?.url,moddbImg);

const polymart='https://polymart.org/resource/polymart-plugin.323';
const polymartImg='https://polymart.org/resourceImages/323.png';
assert.equal(providerForUrl(polymart),'polymart');assert(providerImageAllowed('polymart',polymartImg));
assert.equal(parseGenericProjectHtml(`<head><meta property="og:title" content="Polymart Plugin"><meta property="og:image" content="${polymartImg}"></head><body><h1>Polymart Plugin</h1></body>`,polymart,{title:'Polymart Plugin'}).gallery[0]?.url,polymartImg);

const gitlab='https://gitlab.com/example-group/example-project';
const gitlabImg='https://gitlab.com/uploads/-/system/project/avatar/123/example.png';
assert.equal(providerForUrl(gitlab),'gitlab');assert(providerImageAllowed('gitlab',gitlabImg));
assert.equal(parseGenericProjectHtml(`<head><meta property="og:title" content="Example Project"><meta property="og:image" content="${gitlabImg}"></head><body><h1>Example Project</h1></body>`,gitlab,{title:'Example Project'}).gallery[0]?.url,gitlabImg);
console.log(JSON.stringify({passed:true,universalProviderFixtures:8}));
