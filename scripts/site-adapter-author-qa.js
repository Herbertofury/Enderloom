'use strict';
const assert=require('assert');
const {parsePlanetMinecraftHtml,parsePlanetMinecraftAuthorHtml,parseGenericProjectHtml,parseProviderAuthorHtml,findProviderAuthorLink}=require('../src/provider-media');

const pmcProject='https://www.planetminecraft.com/texture-pack/enderwoman-6180577/';
const pmcAuthor='https://www.planetminecraft.com/member/redstonae/';
const pmcAvatar='https://static.planetminecraft.com/files/avatar/3480338_19.png';
const pmcHero='https://static.planetminecraft.com/files/image/minecraft/texture-pack/2025/577/19224697-enderwoman_l.jpg';
const pmcShow='https://static.planetminecraft.com/files/resource_media/screenshot-showcase.png';
const pmc=`<html><head><title>enderwomen+ [ java n' bedrock ] Minecraft Texture Pack</title></head><body>
<h1>enderwomen+ [ java n' bedrock ]</h1>
<a href="${pmcProject}" title="enderwomen+ [ java n' bedrock ] Minecraft Texture Pack"><img src="${pmcHero}" alt="enderwomen+ [ java n' bedrock ]"></a>
by <a href="${pmcAuthor}" title="redstonae Profile">redstonae</a>
<a class="member-card" href="${pmcAuthor}"><img class="member_avatar" src="${pmcAvatar}" alt="redstonae avatar"></a>
<div class="submission-description"><img src="${pmcShow}" alt="showcase"></div>
<h2>Update Logs</h2><div class="comment"><img src="https://static.planetminecraft.com/files/avatar/999999_1.png" alt="random commenter avatar"></div>
<h2>More Texture Packs by redstonae</h2><img src="https://static.planetminecraft.com/files/image/minecraft/texture-pack/other-project.jpg" alt="other project">
</body></html>`;
const parsed=parsePlanetMinecraftHtml(pmc,pmcProject,{title:"enderwomen+ [ java n' bedrock ]",author:'redstonae'});
assert.strictEqual(parsed.authorUrl.replace(/\/$/,''),pmcAuthor.replace(/\/$/,''),'PMC exact member link should be discovered from the project page');
assert(parsed.author&&parsed.author.url===pmcAvatar,'PMC project page should bind the exact creator avatar without confusing the project hero');
assert(parsed.gallery.some(x=>x.url===pmcHero),'PMC project hero should remain project media');
assert(!parsed.gallery.some(x=>x.url===pmcAvatar),'PMC author avatar must never enter the gallery');
assert(!parsed.gallery.some(x=>/other-project|999999/.test(x.url)),'PMC related/commenter media must not leak into the gallery');

const profile=`<html><head><title>redstonae | Planet Minecraft</title><meta property="og:image" content="${pmcAvatar}"></head><body><main><h1>redstonae</h1><a href="${pmcAuthor}" class="profile identity"><img class="profile_avatar member-avatar" alt="redstonae profile avatar" src="${pmcAvatar}"></a><section>Content Gallery</section><img src="${pmcShow}" alt="redstonae project screenshot"></main></body></html>`;
const profileAvatar=parsePlanetMinecraftAuthorHtml(profile,pmcAuthor,{author:'redstonae'});
assert(profileAvatar&&profileAvatar.url===pmcAvatar,'PMC exact author profile should resolve the creator avatar, not content gallery media');

const authorCases=[
  ['afdian','https://afdian.com/p/abc123','https://afdian.com/a/creator','creator'],
  ['patreon','https://www.patreon.com/posts/demo-123','https://www.patreon.com/c/creator','creator'],
  ['spigot','https://www.spigotmc.org/resources/demo.123/','https://www.spigotmc.org/members/creator.456/','creator'],
  ['builtbybit','https://builtbybit.com/resources/demo.123/','https://builtbybit.com/members/creator.456/','creator'],
  ['moddb','https://www.moddb.com/mods/demo','https://www.moddb.com/members/creator','creator'],
  ['mcpedl','https://mcpedl.com/demo-addon/','https://mcpedl.com/author/creator/','creator'],
  ['modbay','https://modbay.org/mods/demo/','https://modbay.org/author/creator/','creator'],
  ['gitlab','https://gitlab.com/creator/demo','https://gitlab.com/creator','creator'],
  ['hangar','https://hangar.papermc.io/creator/demo','https://hangar.papermc.io/creator','creator'],
  ['kofi','https://ko-fi.com/s/demo','https://ko-fi.com/creator','creator']
];
for(const [provider,source,author,name] of authorCases){
  const html=`<main><h1>Demo Project</h1><div class="byline">by <a rel="author" href="${author}" title="${name} profile">${name}</a></div></main>`;
  const got=findProviderAuthorLink(html,source,{title:'Demo Project',author:name},provider);
  assert(got,`${provider} should discover an exact creator profile URL`);
  assert.strictEqual(got.replace(/\/$/,''),author.replace(/\/$/,''),`${provider} author URL mismatch`);
}

const afdianAuthorUrl='https://afdian.com/a/omomomomomomo';
const afdianAvatar='https://pic1.afdiancdn.com/user/d00e5900ff1d11eaa2c852540025c377/avatar.png';
const afdianProfile=`<html><head><title>omomomomomomo - 爱发电</title></head><body><h1>omomomomomomo</h1><a href="${afdianAuthorUrl}" class="creator-profile"><img src="${afdianAvatar}" class="creator-avatar" alt="omomomomomomo avatar"></a><img src="https://pic1.afdiancdn.com/user/x/common/project-cover.png" class="post image" alt="project cover"></body></html>`;
const genericAvatar=parseProviderAuthorHtml(afdianProfile,afdianAuthorUrl,{author:'omomomomomomo'});
assert(genericAvatar&&genericAvatar.url===afdianAvatar,'generic provider author parser should keep creator avatar separate from post media');

console.log(JSON.stringify({passed:true,planetMinecraft:{authorUrl:parsed.authorUrl,avatar:parsed.author.url,gallery:parsed.gallery.map(x=>x.url)},providerAuthorCases:authorCases.length,afdianAvatar:genericAvatar.url},null,2));
