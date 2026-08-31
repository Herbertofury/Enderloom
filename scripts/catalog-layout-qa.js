'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

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
