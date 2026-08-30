'use strict';
const assert=require('assert');
const {parseCurseForgeProjectHtml}=require('../src/provider-media');

const project='https://www.curseforge.com/minecraft/mc-mods/divinerpg';
const githubBlob='https://github.com/DivineRPG/DivineRPG/blob/1.21/images/dimensions.png';
const githubRaw='https://raw.githubusercontent.com/DivineRPG/DivineRPG/1.21/images/dimensions.png';
const gitlabBlob='https://gitlab.com/example/divine-media/-/blob/main/screens/bosses.jpg?ref_type=heads';
const gitlabRaw='https://gitlab.com/example/divine-media/-/raw/main/screens/bosses.jpg?ref_type=heads';
const html=`<html><head><meta property="og:title" content="DivineRPG - Minecraft Mods"></head><body>
<header><a href="https://github.com/DivineRPG/DivineRPG">repository navigation</a></header>
<h1>DivineRPG</h1><h2>Description</h2>
<p><a href="${githubBlob}">Dimensions</a></p>
<p><a href="${gitlabBlob}">Boss showcase</a></p>
<p><a href="https://github.com/DivineRPG/DivineRPG/issues/123">Not an image</a></p>
<p><a href="https://github.com/DivineRPG/DivineRPG/blob/1.21/README.md">Documentation</a></p>
<h2>The DivineRPG Team</h2>
<a href="https://github.com/unrelated/project/blob/main/leak.png">Unrelated team media</a>
</body></html>`;
const parsed=parseCurseForgeProjectHtml(html,project,{title:'DivineRPG',author:'DivineRPG Team'});
const urls=parsed.gallery.map(x=>x.url);
assert(urls.includes(githubRaw),'GitHub blob image inside exact CurseForge Description must canonicalize to raw.githubusercontent.com');
assert(urls.includes(gitlabRaw),'GitLab blob image inside exact CurseForge Description must canonicalize to /-/raw/');
assert(!urls.some(x=>/issues\/123|README\.md|unrelated\/project/i.test(x)),'non-image navigation or media beyond the Description ownership boundary leaked');
assert(parsed.gallery.filter(x=>x.source==='curseforge-project-description-linked-raw').length===2,'only the two bounded image-bearing repository links should enter the linked-media lane');
console.log(JSON.stringify({passed:true,fixture:'curseforge-description-linked-raw-media',urls},null,2));
