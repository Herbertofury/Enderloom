"use strict";
const assert = require("assert/strict"),
  fs = require("fs"),
  path = require("path"),
  zlib = require("zlib");
const ts = require("../launcher/node_modules/typescript");
function load() {
  const exports = {};
  new Function(
    "exports",
    ts.transpileModule(
      fs.readFileSync(
        path.join(__dirname, "../launcher/src/lib/performance-evidence.ts"),
        "utf8",
      ),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      },
    ).outputText,
  )(exports);
  return exports;
}
const vi = (n) => {
  const bytes = [];
  do {
    const low = n % 128;
    n = Math.floor(n / 128);
    bytes.push(low | (n ? 128 : 0));
  } while (n);
  return Buffer.from(bytes);
};
const scalar = (id, n) => Buffer.concat([vi(id * 8), vi(n)]);
const blob = (id, bytes) =>
  Buffer.concat([vi(id * 8 + 2), vi(bytes.length), bytes]);
const str = (id, text) => blob(id, Buffer.from(text));
const msg = (id, ...fields) => blob(id, Buffer.concat(fields));
const double = (id, n) => {
  const b = Buffer.alloc(8);
  b.writeDoubleLE(n);
  return Buffer.concat([vi(id * 8 + 1), b]);
};
const packed = (id, values, doubles = false) =>
  blob(
    id,
    Buffer.concat(
      values.map((n) => (doubles ? double(1, n).subarray(1) : vi(n))),
    ),
  );
const platform = msg(7, str(2, "Fabric"), str(4, "1.20.1"));
const stats = msg(
  8,
  msg(4, double(1, 19.5)),
  msg(5, msg(1, double(1, 28), double(2, 90), double(5, 55))),
);
function fixture({ legacy = false, cycle = false, ownership = true } = {}) {
  const metadata = msg(1, scalar(2, 1000), scalar(11, 2000), platform, stats);
  const child = legacy
    ? msg(2, scalar(1, 60), str(3, "example.Mod"), str(4, "tick"))
    : msg(
        3,
        str(3, "example.Mod"),
        str(4, "tick"),
        packed(8, [60], true),
        ...(cycle ? [packed(9, [0])] : []),
      );
  const parent = legacy
    ? msg(3, scalar(1, 100), str(3, "java.Thread"), str(4, "run"), child)
    : msg(
        3,
        str(3, "java.Thread"),
        str(4, "run"),
        packed(8, [100], true),
        packed(9, [1]),
      );
  const thread = legacy
    ? msg(2, str(1, "Server thread"), scalar(2, 100), parent)
    : msg(
        2,
        str(1, "Server thread"),
        parent,
        child,
        packed(4, [100], true),
        packed(5, [0]),
      );
  return Buffer.concat([
    metadata,
    thread,
    ...(ownership
      ? [msg(3, str(1, "example.Mod"), str(2, "Example Mod"))]
      : []),
  ]);
}
async function run() {
  const lib = load();
  for (const legacy of [false, true]) {
    const report = lib.analyzeSpark(fixture({ legacy }), "fixture");
    assert.equal(
      report.threads[0].mods.find((m) => m.name === "Example Mod").percent,
      60,
    );
    assert.equal(
      report.threads[0].mods.find((m) => m.name === "Unassigned / runtime")
        .percent,
      40,
    );
    assert.equal(report.threads[0].frames[0].percent, 100);
    assert.equal(report.tps, 19.5);
    assert.equal(report.mspt_p95, 55);
    assert.equal(report.duration_ms, 1000);
  }
  assert.throws(
    () => lib.analyzeSpark(fixture({ cycle: true }), "cycle"),
    /cyclic/,
  );
  assert.throws(
    () => lib.analyzeSpark(fixture().subarray(0, 25), "truncated"),
    /Truncated/,
  );
  const dag = Buffer.concat([
    msg(1, scalar(2, 1000), platform),
    msg(
      2,
      str(1, "Server thread"),
      msg(
        3,
        str(3, "RootA"),
        str(4, "run"),
        packed(8, [50], true),
        packed(9, [2]),
      ),
      msg(
        3,
        str(3, "RootB"),
        str(4, "run"),
        packed(8, [50], true),
        packed(9, [2]),
      ),
      msg(3, str(3, "example.Mod"), str(4, "tick"), packed(8, [20], true)),
      packed(4, [100], true),
      packed(5, [0, 1]),
    ),
    msg(3, str(1, "example.Mod"), str(2, "Example Mod")),
  ]);
  assert.equal(
    lib
      .analyzeSpark(dag, "shared node")
      .threads[0].mods.find((m) => m.name === "Example Mod").percent,
    40,
  );
  const unmapped = lib.analyzeSpark(fixture({ ownership: false }), "unmapped");
  assert.equal(unmapped.threads[0].mods[0].name, "Unassigned / runtime");
  const meta = msg(
    1,
    msg(2, str(2, "Fabric")),
    msg(3, msg(4, double(1, 20))),
    msg(7, str(1, "mod"), msg(2, str(1, "Mod"))),
  );
  const heap = lib.analyzeSpark(
    Buffer.concat([
      meta,
      msg(2, scalar(2, 3), scalar(3, 500), str(4, "example.Type")),
    ]),
    "heap",
  );
  assert.equal(heap.mode, "Heap snapshot");
  assert.equal(heap.heap[0].percent, 100);
  const health = lib.analyzeSpark(meta, "health");
  assert.equal(health.mode, "Health snapshot");
  assert.equal(health.tps, 20);
  const inflated = await lib.unpackEvidence(zlib.gzipSync(fixture()));
  assert.deepEqual(Buffer.from(inflated), fixture());
  const log = lib.analyzeLog(
    "[Server thread/WARN]: Can't keep up! Running 2020ms or 40 ticks behind\n[GC(1)] Pause Young 31.4ms\nhttps://spark.lucko.me/Abc123\n[Render thread/ERROR]: OpenGL error",
    "latest.log",
  );
  assert.equal(log.findings.length, 3);
  assert.equal(
    log.findings.find((f) => f.category === "GC pauses").max_ms,
    31.4,
  );
  assert.equal(log.spark_urls[0], "https://spark.lucko.me/Abc123");
  assert.throws(
    () => lib.sparkUrl("https://spark.lucko.me.evil.test/Abc123"),
    /Use a report/,
  );
  assert.throws(
    () => lib.sparkUrl("https://spark.lucko.me/../docs"),
    /Use a report/,
  );
  fs.mkdirSync(path.join(__dirname, "../output/playwright"), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(__dirname, "../output/playwright/spark-fixture.sparkprofile"),
    fixture(),
  );
  console.log(
    "PASS Spark current/legacy protobuf, exclusive attribution, inclusive frames, TPS/MSPT, heap, health, gzip, missing ownership, corrupt/cyclic input, log symptoms and URL validation.",
  );
}
module.exports = { fixture, load };
if (require.main === module)
  run().catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
