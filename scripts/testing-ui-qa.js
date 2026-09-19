'use strict';
const assert = require('assert/strict');
const path = require('path');
const fs = require('fs');
const { _electron: electron } = require('playwright');
const root = path.resolve(__dirname, '..');
let app;
(async () => {
  const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
  app = await electron.launch({ executablePath: path.join(root, 'node_modules/electron/dist/electron.exe'), args: [path.join(root, 'scripts/fixtures/creative-ui-host.cjs')], env });
  const page = await app.firstWindow(); page.setDefaultTimeout(15000);
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.getByRole('button', { name: 'Open Evergreen · creative workshop', exact: true }).waitFor();
  const ids = await app.evaluate(({ ipcMain }) => {
    const { fixtures, service } = global.creativeQa;
    const report = (id, instance, at) => ({ id, at, instance_id: instance.id, instance_name: instance.name, state: 'completed', minecraft: '1.20.1', loader: 'forge', loader_version: '47.3.0', record_video: false, max_seconds: 900, steps: [], artifacts: [], report_dir: fixtures.instance.dir, adapter: { name: 'Fixture adapter', release: 'pinned' }, probe_version: 'fixture', fps_note: '', loaded_mods: [], evidence: [{ kind: 'spark', platform: 'client', duration_ms: 1000, tps: 20, mspt_p95: 5, threads: [{ name: 'Server thread', mods: [{ name: 'Second measured mod', percent: 3 }, { name: 'First measured mod', percent: 7 }, { name: 'Unassigned / runtime', percent: 90 }] }] }] });
    global.creativeQa.reports = [report('new', fixtures.instance, 3000), report('old', fixtures.instance, 2000), report('other', fixtures.second, 1000)];
    ipcMain.removeHandler('launcher:invoke');
    ipcMain.handle('launcher:invoke', async (_event, r) => {
      if (r.command === 'get_testing_reports') return global.creativeQa.reports;
      if (r.command === 'get_testing_report') {
        const result = global.creativeQa.reports.find(report => report.id === r.args.testId);
        if (global.creativeQa.hold === r.args.testId) {
          global.creativeQa.held = r.args.testId;
          await new Promise(resolve => { global.creativeQa.release = resolve; });
        }
        global.creativeQa.lastDelivered = r.args.testId;
        return result;
      }
      return service.request(r.command, r.args);
    });
    return { first: fixtures.instance.id, second: fixtures.second.id };
  });
  await page.getByRole('button', { name: 'Performance', exact: true }).first().click();
  await page.getByLabel('Performance instance', { exact: true }).selectOption(ids.first);
  await page.getByRole('button', { name: 'Testing Lab', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('select[aria-label="Test report"]')?.value === 'new');
  assert.equal(await page.getByRole('checkbox', { name: /Record this test/ }).isChecked(), false);
  await page.getByText('Server thread · 3 attributed entries', { exact: true }).click();
  await page.getByText('3.000% samples', { exact: true }).waitFor();
  assert.deepEqual(await page.locator('.test-metrics .test-loaded-mods > div > span').allTextContents(), ['Unassigned / runtime', 'First measured mod', 'Second measured mod']);
  await app.evaluate(() => { global.creativeQa.hold = 'old'; });
  await page.getByLabel('Test report', { exact: true }).selectOption('old');
  for (let i = 0; i < 100; i++) {
    if (await app.evaluate(() => global.creativeQa.held === 'old')) break;
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  assert.equal(await app.evaluate(() => global.creativeQa.held), 'old');
  // The visible report stays usable while a selection loads. Choose the latest
  // again, then release the older response after the new request has settled.
  await page.getByLabel('Test report', { exact: true }).selectOption('new');
  await page.getByRole('button', { name: 'Refresh test reports', exact: true }).click();
  await app.evaluate(() => { global.creativeQa.hold = null; global.creativeQa.release(); });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.equal(await page.getByLabel('Test report', { exact: true }).inputValue(), 'new', 'A late old response must not replace the latest report');
  await page.getByLabel('Performance instance', { exact: true }).selectOption(ids.second);
  await page.waitForFunction(() => document.querySelector('select[aria-label="Test report"]')?.value === 'other');
  await page.getByRole('heading', { name: 'Evergreen · survival', exact: true }).waitFor();
  await app.evaluate(() => { global.creativeQa.reports.unshift({ ...global.creativeQa.reports.find(r => r.id === 'other'), id: 'external', at: 4000 }); });
  await page.getByRole('button', { name: 'Refresh test reports', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('select[aria-label="Test report"]')?.value === 'external');
  await page.setViewportSize({ width: 1080, height: 850 });
  assert(await page.locator('.test-setup').evaluate(el => el.scrollWidth <= el.clientWidth + 1), 'Testing controls must fit at compact desktop width');
  fs.mkdirSync(path.join(root, 'output/playwright'), { recursive: true });
  await page.screenshot({ path: path.join(root, 'output/playwright/testing-lab-race-qa.png') });
  assert.deepEqual(errors, []);
  console.log('PASS Electron Testing Lab: stale report selection rejected, instances isolated, external report refresh, all sampled mod shares, recording off, compact controls and no renderer errors.');
})().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => app?.close());
