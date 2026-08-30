'use strict';
const assert=require('assert');
const {PROVIDERS,providerForUrl,isTrustedMediaUrl,firstTrustedMediaUrl,mediaMarkerMatched,providerOriginHints,allProviderOriginHints,transportPolicy}=require('../src/provider-fastlane');
const {isProviderCollectionUrl,resolveProviderProjectLinks}=require('../src/provider-media');

const cases=[
  ['curseforge','https://www.curseforge.com/minecraft/mc-mods/example','https://media.forgecdn.net/attachments/1/2/example.png'],
  ['modrinth','https://modrinth.com/mod/example','https://cdn.modrinth.com/data/abc/images/example.webp'],
  ['github','https://github.com/example/project','https://raw.githubusercontent.com/example/project/main/icon.png'],
  ['gitlab','https://gitlab.com/example/project','https://gitlab.com/uploads/-/system/project/avatar/123/example.png'],
  ['hangar','https://hangar.papermc.io/ViaVersion/ViaVersion','https://hangar.papermc.io/api/v1/projects/ViaVersion/avatar'],
  ['spigot','https://www.spigotmc.org/resources/worldedit.53036/','https://www.spigotmc.org/data/resource_icons/53/53036.jpg'],
  ['bukkit','https://dev.bukkit.org/projects/worldedit','https://media.forgecdn.net/avatars/thumbnails/105/105/64/64/worldedit.png'],
  ['builtbybit','https://builtbybit.com/resources/example.1234/','https://builtbybit.com/attachments/example-png.1234/'],
  ['nexusmods','https://www.nexusmods.com/minecraft/mods/123','https://staticdelivery.nexusmods.com/mods/4000/images/123/123-1700000000.jpg'],
  ['moddb','https://www.moddb.com/mods/example','https://media.moddb.com/images/mods/1/99/98000/example.jpg'],
  ['polymart','https://polymart.org/resource/polymart-plugin.323','https://polymart.org/resourceImages/323.png'],
  ['planetminecraft','https://www.planetminecraft.com/texture-pack/example/','https://static.planetminecraft.com/files/image/minecraft/texture-pack/2026/1/example.jpg'],
  ['mcpedl','https://mcpedl.com/example-addon/','https://r2.mcpedl.com/submissions/123/example.webp'],
  ['modbay','https://modbay.org/mods/123-example.html','https://modbay.org/uploads/posts/2026-08/example.webp'],
  ['afdian','https://afdian.com/p/abc123','https://pic1.afdiancdn.com/user/abc/example.webp'],
  ['patreon','https://www.patreon.com/posts/example-123456','https://c10.patreonusercontent.com/4/patreon-media/p/post/123456/example.jpg'],
  ['minecraft-marketplace','https://www.minecraft.net/en-us/marketplace/pdp/0fa7866f-8338-47b5-a324-4e0d0d21a07b','https://www.minecraft.net/content/dam/minecraftnet/example.jpg'],
  ['booth','https://example.booth.pm/items/12345','https://booth.pximg.net/c/620x620/example.jpg'],
  ['fourthwall','https://creator.fourthwall.com/products/example','https://imgproxy.fourthwall.dev/a/example.webp'],
  ['kofi','https://ko-fi.com/s/ABC123','https://storage.ko-fi.com/cdn/useruploads/example.png'],
  ['itch','https://creator.itch.io/example','https://img.itch.zone/aW1n/example.png'],
  ['gumroad','https://creator.gumroad.com/l/example','https://public-files.gumroad.com/example.jpg'],
  ['alltheysm','https://alltheysm.top/example','https://alltheysm.top/uploads/example.webp']
];
for(const [provider,page,image] of cases){
  assert.equal(providerForUrl(page),provider,`provider detection failed for ${page}`);
  assert(isTrustedMediaUrl(image),`trusted media host missing for ${provider}: ${image}`);
  const html=`<meta property="og:image" content="${image}">`;
  assert.equal(firstTrustedMediaUrl(html),image,`stream URL extraction failed for ${provider}`);
  assert(mediaMarkerMatched(html),`stream marker failed for ${provider}`);
  assert(providerOriginHints(provider).length>0,`no preconnect origin hints for ${provider}`);
}
assert(!isTrustedMediaUrl('https://www.patreon.com/posts/example-123456'),'project page must never be mistaken for image bytes');
assert(!isTrustedMediaUrl('https://media.moddb.com/images/global/moddb.png'),'ModDB global provider logo must never terminate a project probe');
assert(!mediaMarkerMatched('<meta property="og:image" content="https://ads.example.net/banner.jpg">'),'untrusted social image must not terminate a probe');
const origins=allProviderOriginHints();assert.equal(origins.length,new Set(origins).size,'provider preconnect hints must be unique');
assert(origins.some(x=>x.includes('patreonusercontent.com'))&&origins.some(x=>x.includes('minecraft.net'))&&origins.some(x=>x.includes('ko-fi.com')),'major provider CDN hints missing');

const patreonProfile='https://www.patreon.com/c/creator';
assert(isProviderCollectionUrl(patreonProfile));
assert.equal(resolveProviderProjectLinks('<a href="/posts/cute-mobs-123456" title="Cute Mobs">Cute Mobs</a>',patreonProfile,{title:'Cute Mobs'})[0]?.url,'https://www.patreon.com/posts/cute-mobs-123456');
const marketIndex='https://www.minecraft.net/en-us/marketplace';
assert(isProviderCollectionUrl(marketIndex));
assert(resolveProviderProjectLinks('<a href="/en-us/marketplace/pdp/0fa7866f-8338-47b5-a324-4e0d0d21a07b">Cute Pets</a>',marketIndex,{title:'Cute Pets'})[0]?.url.includes('/marketplace/pdp/'));

const cfPolicy=transportPolicy('curseforge');
assert(cfPolicy.full.has('chromium')&&cfPolicy.full.has('wreq')&&cfPolicy.probe.has('node')&&cfPolicy.disabled.has('impit'));
const patreonPolicy=transportPolicy('patreon');
assert(patreonPolicy.full.has('chromium')&&patreonPolicy.probe.has('node')&&patreonPolicy.disabled.has('wreq')&&patreonPolicy.disabled.has('impit'));
const staticPolicy=transportPolicy('planetminecraft');
assert(staticPolicy.full.has('node')&&staticPolicy.probe.has('chromium')&&staticPolicy.disabled.has('wreq')&&staticPolicy.disabled.has('impit'));
const builtbybitPolicy=transportPolicy('builtbybit');
assert(builtbybitPolicy.browserOnly&&builtbybitPolicy.browserNavigationOnly&&builtbybitPolicy.disabled.has('node')&&builtbybitPolicy.disabled.has('chromium')&&builtbybitPolicy.disabled.has('wreq')&&builtbybitPolicy.disabled.has('impit'),'BuiltByBit must remain browser-only without an authenticated official API token');
assert.equal(PROVIDERS.length,23,'universal provider registry count drifted');
console.log(JSON.stringify({passed:true,providers:PROVIDERS.length,trustedCases:cases.length,originHints:origins.length}));
