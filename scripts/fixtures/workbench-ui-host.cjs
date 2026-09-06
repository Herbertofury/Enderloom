// Isolated Electron host: the production preload, production UI and real native service.
"use strict";
const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { LauncherService } = require("../../src/launcher-service");
const { seed } = require("../workbench-fixtures");
const rootDir = path.resolve(__dirname, "../..");
const temporary = fs.mkdtempSync(
  path.join(os.tmpdir(), "enderloom-workbench-ui-"),
);
app.setPath("userData", path.join(temporary, "electron"));
const service = new LauncherService({
  rootDir,
  dataDir: path.join(temporary, "data"),
  resourcesDir: rootDir,
});
let win, fixtures;
global.workbenchQa = {
  temporary,
  get fixtures() {
    return fixtures;
  },
  dialogPath: null,
};
app
  .whenReady()
  .then(async () => {
    fixtures = await seed(service, temporary);
    ipcMain.handle("launcher:invoke", (_event, request) =>
      service.request(request.command, request.args),
    );
    ipcMain.handle("launcher:window-command", () => false);
    ipcMain.handle("launcher:open-dialog", () => global.workbenchQa.dialogPath);
    ipcMain.handle("launcher:open-external", (_event, url) => {
      global.workbenchQa.lastExternal = url;
    });
    ipcMain.handle("launcher:save-dialog", () => null);
    win = new BrowserWindow({
      width: 1540,
      height: 1120,
      show: false,
      webPreferences: {
        preload: path.join(rootDir, "launcher-preload.js"),
        contextIsolation: true,
        sandbox: true,
        backgroundThrottling: false,
        additionalArguments: ["--enderloom-self-test=1"],
      },
    });
    service.on("event", (message) => {
      if (win && !win.isDestroyed())
        win.webContents.send("launcher:event", message);
    });
    win.showInactive();
    await win.loadFile(path.join(rootDir, "launcher/dist/index.html"));
  })
  .catch((e) => {
    console.error(e);
    app.exit(1);
  });
let quitting = false;
app.on("before-quit", (event) => {
  if (quitting) return;
  event.preventDefault();
  quitting = true;
  service.close().finally(() => {
    const resolved = path.resolve(temporary);
    // Electron still owns its cache handles until exit; leave only this isolated QA folder.
    console.log(`QA data: ${resolved}`);
    app.exit(0);
  });
});
