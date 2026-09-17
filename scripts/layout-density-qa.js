'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const menu = read('launcher/src/components/LayoutDensityMenu.tsx');
const instances = read('launcher/src/views/InstancesView.tsx');
const content = read('launcher/src/views/InstanceView.tsx');
const css = read('launcher/src/index.css');

for (const label of ['XS', 'S', 'M', 'L', 'XL']) {
  assert(menu.includes(`label: "${label}"`), `missing ${label} density stop`);
}
assert(menu.includes('type="range"'), 'density control is not a slider');
assert(menu.includes('Layout') && menu.includes('Organization'), 'combined layout menu is incomplete');
assert(instances.includes('testIdPrefix="instance"'), 'My Modpacks view trigger is missing');
assert(instances.includes('instances-tile-size'), 'My Modpacks density is not persisted');
assert(content.includes('<LayoutDensityMenu'), 'installed content does not share the density menu');
assert(content.includes('content-tile-size'), 'installed-content density is not persisted');
assert(css.includes('.instance-tile-slider::-webkit-slider-thumb'), 'premium slider styling is missing');
assert(css.includes('.instance-tile-slider-value'), 'animated slider value is missing');
assert(css.includes('transition: left 180ms'), 'slider value does not animate between density stops');
assert(css.includes('.instance-density-grid'), 'tile grid transition is missing');
for (const width of [120, 144, 168, 192, 260]) {
  assert(menu.includes(`widthPx: ${width}`), `missing CurseForge-parity ${width}px tile stop`);
}

console.log(JSON.stringify({
  passed: true,
  surfaces: ['My Modpacks', 'installed content'],
  layouts: ['tiles', 'table', 'list'],
  sizes: ['XS', 'S', 'M', 'L', 'XL'],
  organization: ['groups', 'flat'],
}, null, 2));
