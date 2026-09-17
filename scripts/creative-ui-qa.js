"use strict";
const assert = require("assert/strict"),
  fs = require("fs"),
  path = require("path");
const { _electron: electron } = require("playwright");
const root = path.resolve(__dirname, ".."),
  output = path.join(root, "output/playwright");
fs.mkdirSync(output, { recursive: true });
let app, page;
const errors = [];
(async () => {
  app = await electron.launch({
    executablePath: path.join(root, "node_modules/electron/dist/electron.exe"),
    args: [path.join(root, "scripts/fixtures/creative-ui-host.cjs")],
    timeout: 60000,
  });
  page = await app.firstWindow({ timeout: 60000 });
  page.on("pageerror", (e) => errors.push(e.message));
  await page
    .getByRole("button", { name: "Open Evergreen · creative workshop", exact: true })
    .waitFor({ timeout: 60000 });
  await page
    .getByRole("button", { name: "Favorites", exact: true })
    .first()
    .click();
  await page.getByRole("heading", { name: "Keep the good stuff." }).waitFor();
  await page
    .getByRole("checkbox", { name: "Select Sodium", exact: true })
    .waitFor();
  await page.screenshot({ path: path.join(output, "enderloom-favorites.png") });
  await page
    .getByRole("button", { name: "New collection", exact: true })
    .click();
  await page.getByLabel("Collection name").fill("UI verified collection");
  await page
    .getByRole("button", { name: "Save collection", exact: true })
    .click();
  await page.getByRole("button", { name: /UI verified collection/ }).waitFor();
  await page
    .getByRole("checkbox", { name: "Select Sodium", exact: true })
    .check();
  const collectionId = await app.evaluate(async () => {
    const l = await global.creativeQa.service.request("get_creative_library");
    return Object.values(l.collections).find(
      (c) => c.name === "UI verified collection",
    ).id;
  });
  await page
    .getByLabel("Add selected to collection")
    .selectOption(collectionId);
  await page.getByRole("button", { name: "Clear favorite selection" }).click();
  await page.locator(".cr-card-title").filter({ hasText: "Sodium" }).click();
  await page
    .getByLabel("Favorite notes")
    .fill("Saved through the production Favorites UI");
  await page.getByLabel("Favorite tags").fill("regression, performance");
  await page.getByRole("button", { name: "Save details", exact: true }).click();
  await page.getByTestId("favorites-view-trigger").click(); await page.getByRole("button", { name: "Table", exact: true }).click();
  await page.locator(".cr-favorites.cr-table").waitFor();
  await page.screenshot({
    path: path.join(output, "enderloom-favorites-table.png"),
  });
  await page.reload();
  await page
    .getByRole("button", { name: "Favorites", exact: true })
    .first()
    .click();
  await page.locator(".cr-favorites.cr-table").waitFor({ timeout: 60000 });
  const saved = await app.evaluate(() =>
    global.creativeQa.service.request("get_creative_library"),
  );
  assert.equal(
    saved.favorites["modrinth:AANobbMI"].notes,
    "Saved through the production Favorites UI",
  );
  await page.getByTestId("favorites-view-trigger").click(); await page.getByRole("button", { name: "Tiles", exact: true }).click();
  await app.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0].setSize(1050, 900),
  );
  await page.screenshot({
    path: path.join(output, "enderloom-favorites-compact.png"),
  });
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    "Page-level overflow",
  );
  await app.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0].setSize(1540, 1080),
  );
  await page
    .getByRole("button", { name: "Performance", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Quick Scan", exact: true }).click();
  await page
    .getByText("Reproducible context", { exact: true })
    .waitFor({ timeout: 60000 });
  await page.screenshot({
    path: path.join(output, "enderloom-performance.png"),
  });
  await page.getByRole("button", { name: /Inspected files/ }).click();
  await page.getByLabel("Inspection filter").selectOption("mcreator");
  await page
    .getByRole("button", {
      name: "Generator evidence for Verdant Machinery",
      exact: true,
    })
    .click();
  await page
    .getByText("The evidence behind the label", { exact: true })
    .waitFor();
  await page.screenshot({
    path: path.join(output, "enderloom-mcreator-evidence.png"),
  });
  await page
    .getByLabel("Correction note")
    .fill("Reviewed by the UI acceptance test");
  await page.getByLabel("Generator override").selectOption("not_mcreator");
  await page
    .getByRole("heading", { name: "Other tool · marked by you", exact: true })
    .waitFor();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Startup & JFR", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start isolated capture", exact: true })
    .click();
  await page.getByRole("dialog").waitFor({ timeout: 60000 });
  assert(
    await page
      .getByText(
        "The isolated test instance was removed. Your source instance was preserved.",
        { exact: true },
      )
      .isVisible(),
  );
  await page.screenshot({
    path: path.join(output, "enderloom-startup-capture.png"),
  });
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    path.join(output, "creative-ui-proof.json"),
    JSON.stringify(
      {
        passed: true,
        rendererErrors: errors,
        favoritesPersisted: true,
        collectionAssignment: true,
        layouts: true,
        generatorOverride: true,
        failedCaptureCleanup: true,
      },
      null,
      2,
    ),
  );
  console.log(
    "PASS production Favorites, collections, persistence, layouts, Performance scan, MCreator correction and startup failure cleanup; zero renderer errors.",
  );
})()
  .catch(async (e) => {
    console.error(e);
    if (page)
      await page
        .screenshot({ path: path.join(output, "creative-ui-failure.png") })
        .catch(() => {});
    process.exitCode = 1;
  })
  .finally(async () => {
    if (app) await app.close();
  });
