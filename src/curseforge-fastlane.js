'use strict';
function escapedHtmlNeedle(value=''){return String(value||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function curseForgeOwnedMediaPattern(context={},gallery=false){
  const title=String(context?.title||'').trim();if(!title)return null;
  const escaped=escapedHtmlNeedle(title).replace(/\s+/g,'\\s+');
  if(gallery){
    // Current CurseForge can place the real gallery image on an attachment <a href>
    // while the child <img> remains a placeholder. Once the exact project H1 is in
    // the stream, accept a bounded Gallery section followed by a canonical CDN
    // attachment link (or the provider's explicit no-gallery message).
    return new RegExp(`(?:<h1\\b[^>]*>[\\s\\S]{0,900}?${escaped}[\\s\\S]{0,900}?<\\/h1>[\\s\\S]{0,98304}?(?:(?:gallery|screenshot)[\\s\\S]{0,32768}?(?:(?:href\\s*=\\s*['\"]https?:\\/\\/(?:media\\.)?(?:forgecdn|cursecdn)\\.net\\/attachments\\/)|(?:forgecdn|cursecdn)\\.net\\/attachments\\/))|this\\s+mod\\s+has\\s+no\\s+gallery\\s+items\\s+available)`,'i');
  }
  return new RegExp(`<h1\\b[^>]*>[\\s\\S]{0,900}?${escaped}[\\s\\S]{0,900}?<\\/h1>[\\s\\S]{0,32768}?(?:(?:project[ _-]?(?:image|icon)|mod[ _-]?icon|alt=["'][^"']*${escaped}[^"']*["'])[^>]{0,2048}?(?:forgecdn|cursecdn)\\.net|(?:forgecdn|cursecdn)\\.net[^>]{0,2048}?(?:project[ _-]?(?:image|icon)|mod[ _-]?icon|alt=["'][^"']*${escaped}[^"']*["']))`,'i');
}
function curseForgeAuthorMediaPattern(context={}){
  const author=String(context?.author||'').trim();if(!author)return /profile\s+avatar/i;
  const escaped=escapedHtmlNeedle(author).replace(/\s+/g,'\\s+');
  return new RegExp(`(?:profile\\s+avatar[\\s\\S]{0,16000}?<h1\\b[^>]*>[\\s\\S]{0,600}?${escaped}[\\s\\S]{0,600}?<\\/h1>|<h1\\b[^>]*>[\\s\\S]{0,600}?${escaped}[\\s\\S]{0,600}?<\\/h1>[\\s\\S]{0,16000}?profile\\s+avatar)`,'i');
}
module.exports={escapedHtmlNeedle,curseForgeOwnedMediaPattern,curseForgeAuthorMediaPattern};
