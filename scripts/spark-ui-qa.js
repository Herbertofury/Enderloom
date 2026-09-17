"use strict";
const assert = require("assert/strict"),
  path = require("path"),
  fs = require("fs");
const { _electron: electron } = require("playwright");
const { fixture } = require("./spark-evidence-qa");
const root = path.resolve(__dirname, "..");
let app;
(async () => {
  app = await electron.launch({
    executablePath: path.join(root, "node_modules/electron/dist/electron.exe"),
    args: [path.join(root, "scripts/fixtures/creative-ui-host.cjs")],
    timeout: 60000,
  });
  const page = await app.firstWindow(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page
    .getByRole("button", { name: "Manage instance", exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "Performance", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Spark & logs", exact: true }).click();
  await page
    .locator('input[type="file"]')
    .setInputFiles({
      name: "measured-fixture.sparkprofile",
      mimeType: "application/octet-stream",
      buffer: fixture(),
    });
  await page
    .getByRole("heading", { name: "Mod share · exclusive samples" })
    .waitFor();
  await page.getByText("60.00%", { exact: true }).first().waitFor();
  assert(await page.getByText("40.00%", { exact: true }).isVisible());
  await page.screenshot({
    path: path.join(root, "output/playwright/enderloom-spark.png"),
  });
  await page
    .locator('input[type="file"]')
    .setInputFiles({
      name: "latest.log",
      mimeType: "text/plain",
      buffer: Buffer.from(
        "[Server thread/WARN]: Can't keep up! Running 2100ms or 42 ticks behind\n[GC(1)] Pause Young 22.5ms\nhttps://spark.lucko.me/Abc123\n[Render thread/ERROR]: OpenGL error",
      ),
    });
  await page.getByText("Server falling behind · 1", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Open Spark", exact: true }).waitFor();
  await page.screenshot({
    path: path.join(root, "output/playwright/enderloom-log-intelligence.png"),
  });
  const saved = await app.evaluate(async () => {
    const { service, fixtures } = global.creativeQa;
    return service.request("get_performance_evidence", {
      instanceId: fixtures.instance.id,
    });
  });
  assert.equal(saved.length, 2);
  assert(saved.some((r) => r.threads?.[0].mods.some((m) => m.percent === 60)));
  await page.reload();
  await page
    .getByRole("button", { name: "Performance", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Spark & logs", exact: true }).click();
  await page.getByText("Server falling behind · 1", { exact: true }).waitFor();
  assert.deepEqual(errors, []);
  console.log(
    "PASS real native Spark/log persistence, worker profile import, percentages, symptoms, Spark viewer actions and restored reports; zero renderer errors.",
  );
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await app?.close();
  });
