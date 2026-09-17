"use strict";
const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const { _electron: electron } = require("playwright");
const { zip, write } = require("./workbench-fixtures");
const root = path.resolve(__dirname, "..");
const output = path.join(root, "output/playwright");
fs.mkdirSync(output, { recursive: true });
let app;
let page;
(async () => {
  app = await electron.launch({
    executablePath: path.join(root, "node_modules/electron/dist/electron.exe"),
    args: [path.join(root, "scripts/fixtures/workbench-ui-host.cjs")],
    timeout: 60000,
  });
  page = await app.firstWindow({ timeout: 60000 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page
    .getByRole("button", { name: "Open Evergreen · creative workshop", exact: true })
    .waitFor({ timeout: 60000 });
  await page
    .getByRole("button", { name: "Open Evergreen · creative workshop", exact: true })
    .click();
  await page.getByRole("navigation", { name: "Minecraft workspace" }).getByRole("button", { name: "Config", exact: true }).click();
  await page
    .getByRole("button", { name: /visuals.json/ })
    .waitFor({ timeout: 60000 });
  await page.screenshot({
    path: path.join(output, "enderloom-config.png"),
    fullPage: true,
  });
  assert(
    await page
      .getByText("Your configuration library", { exact: true })
      .isVisible(),
  );
  await page.getByRole("button", { name: /visuals.json/ }).click();
  await page.getByRole("button", { name: "Edit config", exact: true }).click();
  await page.getByRole("switch", { name: "ambient_particles" }).waitFor();
  await page.getByRole("switch", { name: "ambient_particles" }).click();
  await page
    .getByLabel("Revision note", { exact: true })
    .fill("UI acceptance: particles off");
  await page.getByRole("button", { name: "Save config", exact: true }).click();
  await page.getByText("No unsaved changes", { exact: true }).waitFor();
  await page.screenshot({
    path: path.join(output, "enderloom-config-editor.png"),
  });
  const fixtures = await app.evaluate(() => global.workbenchQa.fixtures);
  const bytes = fs.readFileSync(
    path.join(fixtures.instance.dir, "config/visuals.json"),
    "utf8",
  );
  assert.equal(JSON.parse(bytes).ambient_particles, false);
  assert.deepEqual(JSON.parse(bytes).advanced, { preserve: true });
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .last()
    .click();
  await page.getByRole("button", { name: "Save as global preset" }).click();
  await page
    .locator(".wb-stats button")
    .nth(2)
    .getByText("1", { exact: true })
    .waitFor();
  await page.getByRole("navigation", { name: "Minecraft workspace" }).getByRole("button", { name: "Addons", exact: true }).click();
  await page.getByRole("button", { name: /Helldivers · Escalation/ }).waitFor();
  await page.screenshot({
    path: path.join(output, "enderloom-addons.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: /GUIDED INSTALL.*TaCZ/ }).click();
  await page.getByText("A place for every extra.", { exact: true }).waitFor();
  assert(
    await page
      .getByText("Timeless and Classics Zero", { exact: true })
      .isVisible(),
  );
  await page.screenshot({
    path: path.join(output, "enderloom-addon-install.png"),
  });
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("button", { name: /Mod lineage/, exact: false }).click();
  await page
    .getByRole("button", { name: /Workshop · AI-assisted patch/ })
    .click();
  await page.getByText("Linked upstream original", { exact: true }).waitFor();
  await page
    .getByRole("button", { name: "Edit tracking", exact: true })
    .click();
  await page
    .getByLabel("Patch notes / AI tool / original version")
    .fill(
      "UI verified AI-assisted balancing patch; actual upstream original attached.",
    );
  await page
    .getByRole("button", { name: "Save tracking", exact: true })
    .click();
  await page
    .getByText(
      "UI verified AI-assisted balancing patch; actual upstream original attached.",
      { exact: true },
    )
    .waitFor();
  await page.screenshot({
    path: path.join(output, "enderloom-mod-lineage.png"),
    fullPage: true,
  });
  await page
    .locator(".wb-timeline > div")
    .filter({ hasText: "Linked upstream original" })
    .getByRole("button", { name: "Restore this revision" })
    .click();
  await page
    .locator(".wb-inspector > .wb-badge")
    .getByText("On disk", { exact: true })
    .waitFor();
  assert(
    fs.readFileSync(fixtures.mod).equals(fs.readFileSync(fixtures.original)),
    "UI restores the actual upstream original",
  );
  console.log(
    "PROOF: mod lineage inspector and upstream-original restoration passed",
  );
  // Complete a real import through the production dialog, with byte-for-byte verification.
  const temporary = await app.evaluate(() => global.workbenchQa.temporary);
  const pack = write(
    temporary,
    "downloads/UI-custom-pack.zip",
    zip({ "pack.json": '{"name":"UI custom content"}' }),
  );
  await page.getByRole("navigation", { name: "Minecraft workspace" }).getByRole("button", { name: "Addons", exact: true }).click();
  await page
    .locator(".wb-rail")
    .getByRole("button", { name: /All addons/ })
    .click();
  await page.getByRole("button", { name: /GUIDED INSTALL.*TaCZ/ }).click();
  await app.evaluate((_electron, p) => {
    global.workbenchQa.dialogPath = p;
  }, pack);
  await page.getByRole("button", { name: /Choose a file to install/ }).click();
  await page.getByRole("button", { name: /UI-custom-pack.zip/ }).waitFor();
  await page
    .getByLabel("Display name", { exact: true })
    .fill("UI custom TaCZ pack");
  await page
    .getByRole("button", { name: "Install & track", exact: true })
    .click();
  await page
    .locator(".wb-inspector h3")
    .getByText("UI custom TaCZ pack", { exact: true })
    .waitFor();
  assert(
    fs
      .readFileSync(path.join(fixtures.instance.dir, "tacz/UI-custom-pack.zip"))
      .equals(fs.readFileSync(pack)),
  );
  console.log(
    "PROOF: guided TaCZ installation from a local ZIP through the real Electron dialog passed",
  );
  // Global application and invalid-save feedback, in addition to the settings edit above.
  await page.getByRole("navigation", { name: "Minecraft workspace" }).getByRole("button", { name: "Config", exact: true }).click();
  await page.getByRole("button", { name: /visuals.json/ }).click();
  await page.getByRole("button", { name: "Edit config", exact: true }).click();
  await page.getByRole("button", { name: "Source view", exact: true }).click();
  await page.getByRole("textbox", { name: "Config source" }).fill("{broken");
  await page.getByRole("button", { name: "Save config", exact: true }).click();
  await page.getByRole("alert").filter({ hasText: "Line 1" }).waitFor();
  assert.equal(
    fs.readFileSync(
      path.join(fixtures.instance.dir, "config/visuals.json"),
      "utf8",
    ),
    bytes,
  );
  await page.getByRole("textbox", { name: "Config source" }).fill(bytes);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .last()
    .click();
  await page
    .locator(".wb-rail")
    .getByRole("button", { name: /Global presets/ })
    .click();
  await page.getByRole("button", { name: "Apply to instances" }).click();
  await page.getByRole("checkbox", { name: /Evergreen · survival/ }).check();
  await page.getByRole("button", { name: "Apply to 2 instances" }).click();
  await page
    .getByText("Applied · previous file preserved", { exact: true })
    .nth(1)
    .waitFor();
  assert.equal(
    fs.readFileSync(
      path.join(fixtures.second.dir, "config/visuals.json"),
      "utf8",
    ),
    bytes,
  );
  await page.screenshot({
    path: path.join(output, "enderloom-global-config.png"),
  });
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .last()
    .click();
  await page.evaluate(async (i) => {
    await window.enderloomLauncher.invoke("update_instance", {
      instanceId: i.id,
      name: i.name,
      minMemoryMb: null,
      maxMemoryMb: null,
      javaPath: null,
      loader: i.loader,
      loaderVersion: "47.3.1",
      versionId: i.version_id,
    });
  }, fixtures.instance);
  await page
    .locator(".wb-rail")
    .getByRole("button", { name: /All configs/ })
    .click();
  await page.getByRole("button", { name: "Rescan files", exact: true }).click();
  await page.getByRole("button", { name: /visuals.json/ }).click();
  await page
    .getByRole("button", { name: "Mark compatibility reviewed", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Mark compatibility reviewed", exact: true })
    .waitFor({ state: "hidden" });
  console.log(
    "PROOF: invalid config rejection and preset application to a second real instance passed",
  );
  // Addon enable/disable, replacement, and explicit update-provider outcomes.
  await page.getByRole("navigation", { name: "Minecraft workspace" }).getByRole("button", { name: "Addons", exact: true }).click();
  await page.getByRole("button", { name: /UI custom TaCZ pack/ }).click();
  await page.getByRole("button", { name: "Disable", exact: true }).click();
  await page.getByRole("button", { name: "Enable", exact: true }).waitFor();
  assert(
    fs.existsSync(
      path.join(fixtures.instance.dir, "tacz/UI-custom-pack.zip.disabled"),
    ),
  );
  await page.getByRole("button", { name: "Enable", exact: true }).click();
  await page.getByRole("button", { name: "Disable", exact: true }).waitFor();
  const replacement = write(
    temporary,
    "downloads/replacement.zip",
    zip({ "pack.json": '{"name":"UI custom content v2"}' }),
  );
  await app.evaluate((_electron, p) => {
    global.workbenchQa.dialogPath = p;
  }, replacement);
  await page.getByRole("button", { name: "Replace file", exact: true }).click();
  await page.getByText("Replaced with a local file", { exact: true }).waitFor();
  assert(
    fs
      .readFileSync(path.join(fixtures.instance.dir, "tacz/UI-custom-pack.zip"))
      .equals(fs.readFileSync(replacement)),
  );
  await page
    .getByRole("button", { name: "Check updates", exact: true })
    .click();
  await page
    .locator(".wb-detail-notice")
    .filter({
      hasText:
        /Update check failed|Version comparison unverified|Update available|Current stable release|No compatible release/,
    })
    .waitFor({ timeout: 60000 });
  await page.screenshot({
    path: path.join(output, "enderloom-addon-updates.png"),
  });
  console.log(
    "PROOF: Addon enable/disable, replacement history and provider update-check feedback passed",
  );
  await app.evaluate(({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0];
    win.setSize(1050, 850);
    win.showInactive();
  });
  await page.getByRole("navigation", { name: "Minecraft workspace" }).getByRole("button", { name: "Config", exact: true }).click();
  await page.getByText("Your configuration library", { exact: true }).waitFor();
  const overflow = await page
    .locator(".wb")
    .evaluate((element) => ({
      width: element.clientWidth,
      scroll: element.scrollWidth,
    }));
  assert(
    overflow.scroll <= overflow.width + 2,
    `Config overflows at narrow width: ${JSON.stringify(overflow)}`,
  );
  await page.screenshot({
    path: path.join(output, "enderloom-config-compact.png"),
  });
  assert.equal(errors.length, 0, errors.join("\n"));
  console.log(
    JSON.stringify(
      {
        passed: true,
        screenshotDirectory: output,
        realConfigEdit: true,
        nestedSettingsPreserved: true,
        globalPresetSaved: true,
        guidedInstallVisible: true,
        originalHistoryVisible: true,
        responsiveLayout: true,
        rendererErrors: errors,
      },
      null,
      2,
    ),
  );
})()
  .catch(async (error) => {
    console.error(error);
    if (page) {
      try {
        console.error(
          (await page.locator("body").innerText({ timeout: 3000 })).slice(
            -14000,
          ),
        );
        await page.screenshot({
          path: path.join(output, "enderloom-workbench-failure.png"),
          timeout: 3000,
        });
      } catch {}
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    if (app) await app.close();
  });
