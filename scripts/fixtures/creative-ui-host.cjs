"use strict";
const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs"),
  os = require("os"),
  path = require("path");
const { LauncherService } = require("../../src/launcher-service");
const { seed } = require("../workbench-fixtures");
const { seedCreative } = require("../creative-fixtures");
const rootDir = path.resolve(__dirname, "../.."),
  temporary = fs.mkdtempSync(path.join(os.tmpdir(), "enderloom-creative-ui-"));
process.env.ENDERLOOM_SERVICE_PATH = path.join(
  rootDir,
  "native/target/debug/enderloom-service.exe",
);
app.setPath("userData", path.join(temporary, "electron"));
const service = new LauncherService({
  rootDir,
  dataDir: path.join(temporary, "data"),
  resourcesDir: rootDir,
});
global.creativeQa = { service, temporary };
app
  .whenReady()
  .then(async () => {
    const fixtures = await seed(service, temporary);
    global.creativeQa.fixtures = fixtures;
    await seedCreative(service, fixtures);
    ipcMain.handle("launcher:invoke", (_e, r) =>
      service.request(r.command, r.args, { timeoutMs: 120000 }),
    );
    ipcMain.handle("launcher:window-command", () => false);
    ipcMain.handle("launcher:open-dialog", () => null);
    ipcMain.handle("launcher:save-dialog", () => null);
    ipcMain.handle("launcher:open-external", () => null);
    const win = new BrowserWindow({
      width: 1540,
      height: 1080,
      show: false,
      webPreferences: {
        preload: path.join(rootDir, "launcher-preload.js"),
        contextIsolation: true,
        sandbox: true,
        backgroundThrottling: false,
        additionalArguments: ["--enderloom-self-test=1"],
      },
    });
    service.on("event", (m) => {
      if (!win.isDestroyed()) win.webContents.send("launcher:event", m);
    });
    win.showInactive();
    await win.loadFile(path.join(rootDir, "launcher/dist/index.html"));
  })
  .catch((e) => {
    console.error(e);
    app.exit(1);
  });
let exiting = false;
app.on("before-quit", (e) => {
  if (exiting) return;
  e.preventDefault();
  exiting = true;
  service.close().finally(() => app.exit(0));
});
