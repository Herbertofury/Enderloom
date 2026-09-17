'use strict';
const assert = require('assert/strict');
const { createAppUpdateMonitor } = require('../src/app-update-monitor');
const { allowGoogleStorage } = require('../src/site-permissions');

(async () => {
  let scheduled, cancelled = false, calls = [], enabled = true, fail = false;
  let status = { phase: 'idle', last_checked_at: null };
  const now = 10 * 60 * 60 * 1000;
  const monitor = createAppUpdateMonitor({
    currentVersion: '2.9.6', packaged: false, now: () => now,
    schedule: (callback, delay) => { scheduled = { callback, delay }; return 1; },
    cancel: () => { cancelled = true; },
    request: async (command, args) => {
      calls.push({ command, args });
      if (fail) throw Error('offline');
      if (command === 'get_settings') return { auto_update_checks: enabled };
      if (command === 'get_app_update_status') return status;
      if (command === 'check_for_updates') return {};
      throw Error('Unexpected command ' + command);
    },
  });
  monitor.start(); monitor.start();
  assert.equal(scheduled.delay, 45000, 'Startup remains responsive');
  await scheduled.callback();
  assert.deepEqual(calls.at(-1), {command:'check_for_updates',args:{currentVersion:'2.9.6',packaged:false}});
  assert.equal(scheduled.delay, 4 * 60 * 60 * 1000);
  calls = []; enabled = false; await scheduled.callback();
  assert.deepEqual(calls.map(c=>c.command), ['get_settings'], 'Preference suppresses network checks');
  assert.equal(scheduled.delay, 15 * 60 * 1000);
  enabled = true; calls = []; status.last_checked_at = (now - 60000) / 1000;
  await scheduled.callback();
  assert(!calls.some(c=>c.command==='check_for_updates'), 'Manual/recent check is shared with the monitor');
  assert.equal(scheduled.delay, 4 * 60 * 60 * 1000 - 60000);
  calls = []; status = {phase:'ready',last_checked_at:null}; await scheduled.callback();
  assert(!calls.some(c=>c.command==='check_for_updates'), 'Ready updates are not superseded');
  fail = true; await scheduled.callback(); assert.equal(scheduled.delay, 15 * 60 * 1000);
  await scheduled.callback(); assert.equal(scheduled.delay, 30 * 60 * 1000);
  monitor.dispose(); assert(cancelled); calls = []; await scheduled.callback(); assert.deepEqual(calls, []);
  assert(allowGoogleStorage('storage-access','https://www.google.com/'));
  assert(allowGoogleStorage('top-level-storage-access','https://accounts.google.com/'));
  for (const origin of ['https://evilgoogle.com','https://google.com.evil.test','http://www.google.com','invalid']) assert(!allowGoogleStorage('storage-access',origin));
  assert(!allowGoogleStorage('geolocation','https://www.google.com'));
  console.log('PASS Electron automatic update scheduling, shared last-check time, disabled preference, retry backoff, cleanup, and scoped Google storage access.');
})().catch(error=>{console.error(error);process.exitCode=1;});
