"use strict";
const assert = require("assert/strict");
const path = require("path");
const { _electron: electron } = require("playwright");
const root = path.resolve(__dirname, "..");
let app;
(async () => {
  app = await electron.launch({
    executablePath: path.join(root, "node_modules/electron/dist/electron.exe"),
    args: [path.join(root, "scripts/fixtures/creative-ui-host.cjs")],
    timeout: 60000,
  });
  const page = await app.firstWindow();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page
    .getByRole("button", { name: "Open Evergreen · creative workshop", exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "Config", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: /visuals.json/ }).waitFor();
  await page.locator(".wb-mod-group").first().waitFor();
  await page.getByRole('button',{name:'Collapse all',exact:true}).click();
  assert.equal(await page.locator('.wb-file').count(),0);
  await page.getByRole('button',{name:'Expand all',exact:true}).click();
  await page.getByRole('button',{name:/visuals.json/}).waitFor();
  await page.getByRole("button", { name: "All files", exact: true }).click();
  await page.locator(".wb-mod-group").first().waitFor({ state: "detached" });
  await page.getByRole("button", { name: /visuals.json/ }).click();
  const select = page.getByLabel("Config mod association");
  const chosen = await select
    .locator("option")
    .evaluateAll(
      (options) =>
        options.find((o) => !["auto", "unassigned"].includes(o.value))?.value,
    );
  assert(chosen, "Fixture installed mod should be selectable");
  await select.selectOption(chosen);
  await page.getByText("Assigned by you.", { exact: true }).waitFor();
  await page.getByRole("button", { name: "By mod", exact: true }).click();
  await page.locator(".wb-mod-group").first().waitFor();
  await page.reload();
  await page
    .getByRole("button", { name: "Config", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: /visuals.json/ }).click();
  assert.equal(
    await page.getByLabel("Config mod association").inputValue(),
    chosen,
  );
  await app.evaluate(async () => {
    const service = global.creativeQa.service;
    for (const [id, url] of [
      [
        "visible-art",
        "data:image/svg+xml," +
          encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><circle cx="48" cy="48" r="20" fill="#38bdf8"/></svg>',
          ),
      ],
      ["broken-art", "data:image/png;base64,invalid"],
    ]) {
      await service.request("creative_library_action", {
        operation: "save",
        payload: {
          favorite: {
            provider: "local",
            project_id: id,
            title: id,
            kind: "mods",
            icon_url: url,
          },
        },
      });
    }
  });
  await page
    .getByRole("button", { name: "Favorites", exact: true })
    .first()
    .click();
  const loaded = page.getByRole("img", {
    name: "visible-art icon",
    exact: true,
  });
  await loaded.locator("img").waitFor();
  await page.waitForFunction(
    () =>
      document
        .querySelector('[aria-label="visible-art icon"]')
        ?.getAttribute("data-icon-state") === "loaded",
  );
  const fallback = page.getByRole("img", {
    name: "broken-art icon",
    exact: true,
  });
  await fallback.waitFor();
  await page.waitForFunction(()=>document.querySelector('[aria-label="broken-art icon"]')?.getAttribute('data-icon-state')==='fallback');
  assert.equal(await loaded.locator('[data-icon-fallback]').count(),0,'Transparent provider artwork must not overlay generated initials');
  assert.equal(await loaded.evaluate(element=>getComputedStyle(element).backgroundImage),'none','Real artwork must not have the generated color gradient underneath');
  assert.equal(await fallback.locator('[data-icon-fallback]').count(),1,'Missing artwork retains a single fallback');
  assert.equal(await fallback.getAttribute("data-icon-state"), "fallback");
  for (const icon of [loaded, fallback]) {
    const rect = await icon.boundingBox();
    assert(
      rect.width >= 40 && rect.height >= 40,
      "Artwork must reserve its size, including fallback",
    );
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS Config grouping, normal files view, persistent owner correction, real image loading and broken-image fallback; zero renderer errors.",
  );
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await app?.close();
  });
