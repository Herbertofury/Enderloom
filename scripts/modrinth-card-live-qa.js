'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { _electron: electron } = require('playwright');

const root = path.resolve(__dirname, '..');
const executablePath = path.join(root, 'node_modules', 'electron', 'dist', process.platform === 'win32' ? 'electron.exe' : 'electron');
const projectId = 'epicfight-touhoulittlemaid-c57e997d';
const projectUrl = 'https://modrinth.com/mod/epicfight_touhoulittlemaid';
const galleryUrl = `${projectUrl}/gallery`;
const artifact = path.join(root, 'qa-artifacts', 'epicfight-touhoulittlemaid-card.png');
let electronApp;
let userDataDir = '';

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

async function catalogPage() {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    for (const page of electronApp.context().pages()) {
      if (/catalog-center\/runtime\/.*\.html/i.test(page.url()) && await page.locator('#searchInput').count()) return page;
    }
    await pause(100);
  }
  throw new Error('Catalog WebContentsView did not become ready');
}

(async () => {
  assert(fs.existsSync(executablePath), 'Electron runtime is not installed');
  electronApp = await electron.launch({ executablePath, args:[root, '--ui-acceptance'], timeout:45000 });
  userDataDir = await electronApp.evaluate(({ app }) => app.getPath('userData'));
  const page = await catalogPage();

  // Exercise the same input path a user does instead of mutating Catalog state from JS.
  const search = page.locator('#searchInput');
  await search.click();
  await search.fill('EpicFight TouhouLittleMaid');
  const card = page.locator(`.project-card[data-id="${projectId}"]`);
  await card.waitFor({ state:'visible', timeout:15000 });

  const sourceUrls = await card.locator('[data-live-media-role="gallery"]').getAttribute('data-project-urls').then(JSON.parse);
  assert.equal(sourceUrls[0], projectUrl, 'authorUrl/project-home overlap removed the authoritative Modrinth URL');
  assert(sourceUrls.includes(projectUrl), 'the authoritative catalog project URL is absent from media discovery');

  const galleryImage = card.locator('[data-live-media-role="gallery"] .live-media-image');
  const iconImage = card.locator('[data-live-media-role="icon"] .live-media-image');
  const authorImage = card.locator('[data-live-media-role="author"] .live-media-image');
  await page.waitForFunction(id => {
    const card = document.querySelector(`.project-card[data-id="${id}"]`);
    if (!card) return false;
    return [...card.querySelectorAll('[data-live-media-role] .live-media-image')]
      .every(image => !image.hidden && image.complete && image.naturalWidth > 0);
  }, projectId, { timeout:20000 });

  const rendered = await Promise.all([galleryImage, iconImage, authorImage].map(async image => ({
    src:await image.getAttribute('src'),
    width:await image.evaluate(node => node.naturalWidth),
    height:await image.evaluate(node => node.naturalHeight),
    hidden:await image.evaluate(node => node.hidden),
  })));
  for (const image of rendered) {
    assert.equal(image.hidden, false, 'a live Modrinth image remains hidden');
    assert(image.width > 0 && image.height > 0, 'a live Modrinth image did not decode');
    assert(/^https:\/\/cdn\.modrinth\.com\//i.test(image.src), `unexpected live image source: ${image.src}`);
  }

  const badge = card.locator('.mv-gallery-badge');
  await page.waitForFunction(id => /1\s*\/\s*3/.test(document.querySelector(`.project-card[data-id="${id}"] .mv-gallery-badge`)?.textContent || ''), projectId, { timeout:15000 });
  const firstSrc = await galleryImage.getAttribute('src');
  await card.locator('[data-mv-gallery-step="1"]').click();
  await page.waitForFunction(({ id, before }) => {
    const image = document.querySelector(`.project-card[data-id="${id}"] [data-live-media-role="gallery"] .live-media-image`);
    return image && !image.hidden && image.complete && image.naturalWidth > 0 && image.src !== before;
  }, { id:projectId, before:firstSrc }, { timeout:10000 });
  const secondSrc = await galleryImage.getAttribute('src');
  assert.notEqual(secondSrc, firstSrc, 'next-gallery control did not advance to a second source image');

  const direct = await page.evaluate(async ({ url, id }) => {
    const context = { projectId:id, title:'EpicFight: TouhouLittleMaid', author:'EpicFight TLM Team', authorUrl:url.replace(/\/gallery$/, ''), primaryUrl:url.replace(/\/gallery$/, '') };
    const media = await window.mobCompanion.discoverMedia(url, true, false, context);
    const decode = async item => {
      const image = new Image(); image.src = item.previewUrl || item.url;
      try { await image.decode(); return image.naturalWidth > 0; } catch { return false; }
    };
    return { count:media.gallery.length, urls:media.gallery.map(item => item.url), decoded:await Promise.all(media.gallery.map(decode)), authorUrl:media.authorUrl };
  }, { url:galleryUrl, id:projectId });
  assert.equal(direct.count, 3, 'direct Modrinth /gallery discovery did not merge gallery and post images');
  assert(direct.urls.every(url => /^https:\/\/cdn\.modrinth\.com\//i.test(url)), 'non-Modrinth media entered the project gallery');
  assert(direct.decoded.every(Boolean), 'one or more direct Modrinth gallery images failed to decode');
  assert(/\/user\//i.test(direct.authorUrl), 'Modrinth team owner did not resolve to a user profile');

  fs.mkdirSync(path.dirname(artifact), { recursive:true });
  await card.screenshot({ path:artifact });
  console.log(JSON.stringify({ passed:true, project:projectId, sourceUrls, badge:await badge.textContent(), rendered, galleryUrls:direct.urls, cycled:[firstSrc,secondSrc], artifact }, null, 2));
})().catch(error => {
  console.error(JSON.stringify({ passed:false, error:error.stack }, null, 2));
  process.exitCode = 1;
}).finally(async () => {
  if (electronApp) await electronApp.close().catch(() => {});
  if (userDataDir && /minecraft-catalog-companion-test-/i.test(userDataDir)) {
    for (let attempt = 0; attempt < 5; attempt++) {
      try { fs.rmSync(userDataDir, { recursive:true, force:true }); break; } catch { await pause(200); }
    }
  }
});
