'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('node:vm');
const { renderCatalog } = require('../src/catalog-renderer');

const root = path.resolve(__dirname, '..');
const modern = fs.readFileSync(path.join(root, 'catalog', 'modern.css'), 'utf8');
const app = fs.readFileSync(path.join(root, 'catalog', 'app.js'), 'utf8');
const enhance = fs.readFileSync(path.join(root, 'catalog', 'enhance.js'), 'utf8');
const renderer = fs.readFileSync(path.join(root, 'src', 'catalog-renderer.js'), 'utf8');
const template = fs.readFileSync(path.join(root, 'catalog', 'template.html'), 'utf8');

const checks = [];
function check(name, fn) {
  try {
    fn();
    checks.push({ name, ok:true });
  } catch (error) {
    checks.push({ name, ok:false, error:error.message });
    throw error;
  }
}

try {
  check('modern Catalog skin is included in every generated snapshot', () => {
    assert.match(renderer, /modern\.css/);
    assert(renderer.includes("].join('\\n');"));
  });
  check('standalone catalog preserves imported literal text and trusted template slots', () => {
    const items = [{ id:'fixture-one', name:'Stone $$ & Friends',
      primaryUrl:'https://mods.example.com/projects/stone?label=$&mode=read',
      caution:'Literal tokens $& __APP_JS__ __DATA_JSON__', notes:'Keep <draft> & the closing </section> label.' }];
    const assets = { 'source-image':'https://mods.example.com/gallery/example.png?label=$&mode=read' };
    const { html, snapshot } = renderCatalog({
      id:'portable-fixture', name:'Craft $$ & Company', brand:'C&D', description:'Literal $& __HEADING__ <draft>',
      updatedAt:'2026-01-01T00:00:00.000Z', items, assets
    }, root);
    assert(html.includes('<title>Craft $$ &amp; Company - Explorer</title>'));
    assert(html.includes('<h1>Craft $$ &amp; Company <span>Explorer</span></h1>'));
    assert(html.includes('<p class="lede">Literal $&amp; __HEADING__ &lt;draft&gt;</p>'));
    assert(html.includes('class="brand-mark" aria-hidden="true">C&amp;D</div>'));
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
    assert.equal(scripts.length, 3);
    assert.equal(scripts[1], app);
    assert.equal(scripts[2], enhance);
    assert(scripts[0].includes('closing <\\/section> label'));
    const scope = { window:{} };
    vm.runInNewContext(scripts[0], scope, { timeout:1000 });
    const roundTrip = value => JSON.parse(JSON.stringify(value));
    assert.deepStrictEqual(roundTrip(scope.window.MOB_VARIETY_DATA), items);
    assert.deepStrictEqual(roundTrip(scope.window.MOB_VARIETY_ASSETS), assets);
    assert.deepStrictEqual(roundTrip(scope.window.MOB_VARIETY_BUILD), snapshot.build);
  });
  check('wide shell uses available horizontal workspace', () => {
    assert.match(modern, /--shell:\s*min\(1920px,\s*calc\(100vw - 20px\)\)/);
  });
  check('visual gallery uses stable grid rather than Chromium multi-column masonry', () => {
    assert.match(modern, /\.visual-gallery\s*\{[^}]*display:\s*grid/s);
    assert.match(modern, /columns:\s*auto/);
    assert.match(modern, /grid-template-columns:\s*repeat\(auto-fill/);
  });
  check('results compositor blur is disabled', () => {
    assert.match(modern, /\.filters-panel,\s*\.results-panel\s*\{[^}]*backdrop-filter:\s*none/s);
  });
  check('view controls expose accessible state', () => {
    assert.match(template, /aria-label="Catalog view"/);
    assert.match(template, /aria-pressed="true"/);
    assert.match(app, /setAttribute\('aria-pressed'/);
  });
  check('all three views count as rendered data in self-test', () => {
    assert.match(app, /querySelectorAll\('\.visual-tile'\)\.length>0/);
  });
  check('invalid persisted view falls back safely to cards', () => {
    assert.match(app, /\['cards','table','gallery'\]\.includes\(state\.view\)/);
  });
  check('media hover is torn down across all navigation boundaries', () => {
    for (const boundary of ['pointerdown', 'scroll', 'catalog:view-changing', 'visibilitychange', 'blur']) {
      assert(enhance.includes(boundary), boundary);
    }
    assert.match(enhance, /visibility:hidden/);
    assert.match(enhance, /removedHoveredMedia/);
  });
  console.log(JSON.stringify({ passed:true, checks }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ passed:false, checks, error:error.stack }, null, 2));
  process.exit(1);
}
