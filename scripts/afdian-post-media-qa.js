'use strict';
const assert=require('assert');
const {parseGenericProjectHtml}=require('../src/provider-media');
const {ownedMediaMarker}=require('../src/site-adapters');

const source='https://afdian.com/p/5900810e484a11f18e785254001e7c00';
const thumb='https://pic1.afdiancdn.com/user/d00e5900ff1d11eaa2c852540025c377/common/2141bfe07b43702596fadd8668265a68_w2333_h2333_s3846.png?imageView2/3/w/320/h/320%7Cwatermark/2/text/demo';
const full='https://pic1.afdiancdn.com/user/d00e5900ff1d11eaa2c852540025c377/common/2141bfe07b43702596fadd8668265a68_w2333_h2333_s3846.png';
const video='https://pic1.afdiancdn.com/user/d00e5900ff1d11eaa2c852540025c377/common/post-demo.mp4';
const html=`<!doctype html><html><head><title>爱发电 · 连接创作者与粉丝的会员制平台</title></head><body>
  <a class="creator-card" href="/a/omomomomomomo"><img class="creator-avatar" alt="omomomomomomo avatar" src="https://pic1.afdiancdn.com/user/d00e5900ff1d11eaa2c852540025c377/avatar.png">omomomomomomo</a>
  <main class="post article-content"><div class="post-body">
    <img data-v-c86dd8fa data-v-bccd1214 src="${thumb}" alt="" class="vm-pic img-pre">
    <video class="post-media vm-video" poster="${thumb}"><source src="${video}" type="video/mp4"></video>
  </div></main><div>评论</div></body></html>`;
const context={title:'Monster girl resource post',author:'omomomomomomo'};
assert(ownedMediaMarker('afdian',html,source),'AFDIAN owned-media stream marker should recognize vm-pic/img-pre post media');
const parsed=parseGenericProjectHtml(html,source,context);
assert(parsed.identity>=90,`opaque exact AFDIAN post should retain strong URL identity, got ${parsed.identity}`);
assert.strictEqual(parsed.authorUrl.replace(/\/$/,''),'https://afdian.com/a/omomomomomomo');
assert(parsed.author&&/avatar\.png/.test(parsed.author.url),'exact creator-bound avatar should be separated from gallery');
const image=parsed.gallery.find(x=>x.url===full);
assert(image,'AFDIAN post image should resolve to the original untransformed CDN asset');
assert.strictEqual(image.previewUrl,thumb,'transformed 320px/watermarked URL should remain the fast preview');
assert.strictEqual(image.mediaType,'image');
const clip=parsed.gallery.find(x=>x.url===video);
assert(clip,'direct post video should be retained as gallery media');
assert.strictEqual(clip.mediaType,'video');
assert(clip.posterUrl===full||clip.posterUrl===thumb,'video poster should be retained');
assert(!parsed.gallery.some(x=>x.url===parsed.author.url),'creator avatar must never leak into post gallery');
console.log(JSON.stringify({passed:true,identity:parsed.identity,author:parsed.author.url,image:{url:image.url,preview:image.previewUrl},video:{url:clip.url,poster:clip.posterUrl},galleryCount:parsed.gallery.length},null,2));
