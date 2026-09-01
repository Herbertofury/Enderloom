'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { _electron: electron } = require('playwright');

const root = path.resolve(__dirname, '..');
const executablePath = path.join(root, 'node_modules', 'electron', 'dist', process.platform === 'win32' ? 'electron.exe' : 'electron');
let electronApp;
let userDataDir = '';

async function pause(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function inspectCatalog() {
  return electronApp.evaluate(async ({ webContents }) => {
    const deadline = Date.now() + 30000;
    let catalog;
    while (Date.now() < deadline) {
      for (const wc of webContents.getAllWebContents()) {
        if (wc.isDestroyed()) continue;
        try {
          const ready = await wc.executeJavaScript("Boolean(document.getElementById('galleryViewButton') && document.getElementById('results'))", true);
          if (ready) { catalog = wc; break; }
        } catch {}
      }
      if (catalog) break;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (!catalog) throw new Error('Catalog WebContentsView did not become ready');
    return catalog.executeJavaScript(`(async()=>{
      const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
      const inspect=view=>{
        document.getElementById(view==='cards'?'cardViewButton':view==='table'?'tableViewButton':'galleryViewButton').click();
        const results=document.getElementById('results'),panel=document.querySelector('.results-panel'),shell=document.querySelector('main.shell');
        return {view:document.documentElement.dataset.catalogView,resultsClass:results.className,items:results.querySelectorAll('.project-card,.project-table tbody tr,.visual-tile').length,panelWidth:panel.getBoundingClientRect().width,shellWidth:shell.getBoundingClientRect().width,viewport:innerWidth};
      };
      const cards=inspect('cards');await wait(80);
      const table=inspect('table');await wait(80);
      const gallery=inspect('gallery');await wait(180);
      const visual=document.querySelector('.visual-gallery'),hover=document.querySelector('.mv-media-hover'),title=document.querySelector('h1'),tiles=[...document.querySelectorAll('.visual-tile')].slice(0,30).map(x=>x.getBoundingClientRect());
      const output={cards,table,gallery,gridDisplay:getComputedStyle(visual).display,gridColumns:getComputedStyle(visual).gridTemplateColumns,legacyColumns:getComputedStyle(visual).columnCount,hoverVisible:getComputedStyle(hover).visibility,hoverOpacity:getComputedStyle(hover).opacity,titlePx:parseFloat(getComputedStyle(title).fontSize),overflowingTiles:tiles.filter(r=>r.left<0||r.right>innerWidth+1).length,selfTest:window.__mobExplorerTest?.()};
      document.getElementById('cardViewButton').click();
      return output;
    })()`, true);
  });
}

async function inspectCatalogExports() {
  const exportDir = path.join(userDataDir, 'ui-export-acceptance');
  fs.mkdirSync(exportDir, { recursive:true });
  await electronApp.evaluate(({ dialog }, folder) => {
    dialog.showSaveDialog = async (_parent, options) => {
      const extension = options?.filters?.[0]?.extensions?.[0] || 'bin';
      return { canceled:false, filePath:`${folder}\\catalog.${extension}` };
    };
  }, exportDir);
  const results = await electronApp.evaluate(async ({ webContents }) => {
    let catalog;
    for (const wc of webContents.getAllWebContents()) {
      if (wc.isDestroyed()) continue;
      try {
        if (await wc.executeJavaScript("typeof window.mobCompanion?.exportCatalog === 'function'", true)) {
          catalog = wc;
          break;
        }
      } catch {}
    }
    if (!catalog) throw new Error('Catalog export bridge was not found');
    return catalog.executeJavaScript(`(async()=>{
      const rows=[{
        Name:'Enderloom export acceptance',
        'Primary URL':'https://modrinth.com/mod/sodium',
        'Icon URL':'https://cdn.modrinth.com/data/AANobbMI/icon.png',
        'Gallery URLs':'https://cdn.modrinth.com/data/AANobbMI/images/example.png',
        Notes:'renderer-to-main export contract'
      }];
      const output={};
      for(const format of ['xlsx','csv','html','json','pdf']) output[format]=await window.mobCompanion.exportCatalog({name:'Enderloom acceptance',format,rows});
      return output;
    })()`, true);
  });
  const files = Object.fromEntries(['xlsx','csv','html','json','pdf'].map((format) => {
    const file = path.join(exportDir, `catalog.${format}`);
    assert(fs.existsSync(file), `${format} export was not written`);
    const bytes = fs.readFileSync(file);
    assert(bytes.length > (format === 'xlsx' || format === 'pdf' ? 500 : 40), `${format} export was unexpectedly small`);
    return [format, { bytes:bytes.length, prefix:bytes.subarray(0, 4).toString(format === 'pdf' ? 'ascii' : 'hex') }];
  }));
  assert.equal(files.xlsx.prefix, '504b0304', 'XLSX export is not an OOXML ZIP');
  assert.equal(files.pdf.prefix, '%PDF', 'PDF export signature is invalid');
  assert(fs.readFileSync(path.join(exportDir, 'catalog.html'), 'utf8').includes('https://modrinth.com/mod/sodium'));
  return { results, files };
}

async function inspectDetachedWorkspace() {
  return electronApp.evaluate(async ({ BrowserWindow }) => {
    const shell = BrowserWindow.getAllWindows().find(w => !w.isDestroyed() && /shell\.html/i.test(w.webContents.getURL()) && !/detached\.html/i.test(w.webContents.getURL()));
    if (!shell) throw new Error('Enderloom shell BrowserWindow not found');
    await shell.webContents.executeJavaScript("window.companion.command('detach-tab',{id:'launcher'})", true);
    const deadline = Date.now() + 15000;
    let child;
    while (Date.now() < deadline) {
      child = BrowserWindow.getAllWindows().find(w => !w.isDestroyed() && /detached\.html/i.test(w.webContents.getURL()));
      if (child) break;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (!child) throw new Error('Detached Mod Manager window was not created');
    const details = { resizable:child.isResizable(), maximizable:child.isMaximizable(), visible:child.isVisible(), title:child.getTitle() };
    await shell.webContents.executeJavaScript("window.companion.command('reattach-tab',{id:'launcher'})", true);
    return details;
  });
}

(async () => {
  assert(fs.existsSync(executablePath), 'Electron runtime is not installed');
  electronApp = await electron.launch({ executablePath, args:[root, '--ui-acceptance'], timeout:45000 });
  userDataDir = await electronApp.evaluate(({ app }) => app.getPath('userData'));
  await pause(1000);
  const catalog = await inspectCatalog();
  assert.equal(catalog.cards.view, 'cards');
  assert.equal(catalog.table.view, 'table');
  assert.equal(catalog.gallery.view, 'gallery');
  assert(catalog.cards.items > 0 && catalog.table.items > 0 && catalog.gallery.items > 0, 'one or more Catalog views rendered no entries');
  assert.equal(catalog.gridDisplay, 'grid', 'visual gallery is not using the stable grid renderer');
  assert.notEqual(catalog.legacyColumns, '4', 'legacy multi-column compositor path is still active');
  assert.equal(catalog.hoverVisible, 'hidden', 'media hover survived a Catalog view change');
  assert(Number(catalog.hoverOpacity) === 0, 'media hover opacity survived a Catalog view change');
  assert(catalog.gallery.shellWidth >= catalog.gallery.viewport * 0.93, 'Catalog does not use the available horizontal workspace');
  assert(catalog.gallery.panelWidth >= catalog.gallery.viewport * 0.68, 'results panel is still unnecessarily narrow');
  assert(catalog.titlePx <= 44, 'Catalog title remains oversized');
  assert.equal(catalog.overflowingTiles, 0, 'gallery tiles overflow the viewport');
  assert.equal(catalog.selfTest?.passed, true, JSON.stringify(catalog.selfTest));
  const exports = await inspectCatalogExports();
  const detached = await inspectDetachedWorkspace();
  assert(detached.resizable && detached.maximizable && detached.visible, 'detached Mod Manager is not a normal production-grade window');
  console.log(JSON.stringify({ passed:true, catalog, exports, detached }, null, 2));
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
