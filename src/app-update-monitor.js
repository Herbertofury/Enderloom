'use strict';

// Use the same native release checker and persisted preferences as Settings.
// This monitor only checks metadata; installation is controlled by the updater.
function createAppUpdateMonitor({ request, currentVersion, packaged, now = Date.now, schedule = setTimeout, cancel = clearTimeout, onError = () => {} }) {
  const interval = 4 * 60 * 60 * 1000;
  let timer, stopped = true, checking = false, failures = 0;
  function later(delay) {
    if (stopped) return;
    timer = schedule(tick, delay);
    timer?.unref?.();
  }
  async function tick() {
    if (stopped || checking) return;
    checking = true;
    let delay = interval;
    try {
      const settings = await request('get_settings');
      if (stopped) return;
      if (settings.auto_update_checks === false) { delay = 15 * 60 * 1000; return; }
      const status = await request('get_app_update_status');
      if (stopped || ['downloading', 'ready'].includes(status.phase)) return;
      const age = status.last_checked_at == null ? interval : Math.max(0, now() - status.last_checked_at * 1000);
      if (age < interval) { delay = interval - age; return; }
      await request('check_for_updates', { currentVersion, packaged });
      failures = 0;
    } catch (error) {
      failures++;
      delay = Math.min(2 * 60 * 60 * 1000, 15 * 60 * 1000 * 2 ** Math.min(failures - 1, 3));
      onError(error);
    } finally {
      checking = false;
      later(delay);
    }
  }
  return {
    start() { if (!stopped) return; stopped = false; later(45000); },
    dispose() { stopped = true; cancel(timer); },
  };
}

module.exports = { createAppUpdateMonitor };
