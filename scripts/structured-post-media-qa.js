'use strict';
const assert=require('assert');
const {parseGenericProjectHtml,structuredProviderData}=require('../src/provider-media');
const source='https://afdian.com/p/5900810e484a11f18e785254001e7c00';
const avatar='https://pic1.afdiancdn.com/user/creator/avatar.png';
const image='https://pic1.afdiancdn.com/user/creator/common/full.png';
const gif='https://pic1.afdiancdn.com/user/creator/common/animated.gif';
const video='https://pic1.afdiancdn.com/user/creator/common/clip.mp4';
const html=`<html><head><title>爱发电 · 连接创作者与粉丝的会员制平台</title><script type="application/ld+json">${JSON.stringify({
  '@context':'https://schema.org','@type':'BlogPosting',url:source,headline:'Monster Girl Post',
  author:{'@type':'Person',name:'creator',url:'https://afdian.com/a/creator',image:avatar},
  image:[image,gif],video:{'@type':'VideoObject',contentUrl:video,thumbnailUrl:image}
})}</script></head><body><main class="post"><h1>Monster Girl Post</h1></main></body></html>`;
const data=structuredProviderData(html,source,{title:'Monster Girl Post',author:'creator'},'afdian',92);
assert.strictEqual(data.authorUrl.replace(/\/$/,''),'https://afdian.com/a/creator');
assert(data.author&&data.author.url===avatar,'JSON-LD author image should remain an author role');
assert(data.gallery.some(x=>x.url===image&&x.mediaType==='image'));
assert(data.gallery.some(x=>x.url===gif&&x.mediaType==='gif'));
assert(data.gallery.some(x=>x.url===video&&x.mediaType==='video'&&x.posterUrl===image));
assert(!data.gallery.some(x=>x.url===avatar),'structured author image must not leak into gallery');
const parsed=parseGenericProjectHtml(html,source,{title:'Monster Girl Post',author:'creator'});
assert(parsed.gallery.some(x=>x.url===video&&x.mediaType==='video'),'generic parser should merge structured video into gallery');
assert(parsed.author&&parsed.author.url===avatar,'generic parser should merge structured author avatar separately');
console.log(JSON.stringify({passed:true,author:data.author,gallery:data.gallery.map(x=>({url:x.url,type:x.mediaType,poster:x.posterUrl||''}))},null,2));
