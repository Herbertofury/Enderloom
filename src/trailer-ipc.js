'use strict';
const { identity } = require('./trailer-discovery');
function registerTrailerIpc(ipcMain, getService, authorize) {
  for (const operation of ['settings', 'discover', 'cancel', 'choose', 'correct', 'claim', 'release']) {
    ipcMain.handle(`trailer:${operation}`, async (event, input = {}) => {
      authorize(event);
      const service = getService(); if (!service) throw Error('Media service is starting');
      service.watch(event.sender);
      if (operation === 'settings') return Object.keys(input || {}).length ? service.setSettings(input) : service.settings();
      if (operation === 'discover') return service.discovery.discover(input.project, { force: input.force === true });
      if (operation === 'cancel') { service.discovery.cancel(identity(input).key); return true; }
      if (operation === 'choose') return service.discovery.choose(input.project, input.choice || {});
      if (operation === 'correct') return service.discovery.correct(input.project, input.url);
      if (operation === 'claim') return service.claim(event.sender, input.context === 'detail' ? 'detail' : 'catalog', input.manual === true);
      service.release(event.sender); return true;
    });
  }
}
function identifyTrailerEmbeds(session, allowedWebContents) {
  session.webRequest.onBeforeSendHeaders({ urls: ['https://www.youtube.com/embed/*'] }, (details, callback) => {
    const headers = { ...details.requestHeaders };
    if (allowedWebContents(details.webContentsId)) headers.Referer = 'https://com.herbertofury.enderloom/';
    callback({ requestHeaders: headers });
  });
}
module.exports = { registerTrailerIpc, identifyTrailerEmbeds };
