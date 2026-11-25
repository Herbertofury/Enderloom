'use strict';
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const { createHash } = require('node:crypto');
const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const count = Number(process.argv[3] || 24000);
if (!Number.isSafeInteger(count) || count < 1) throw new Error('Expected a positive complete workload count');
const { createProviderParserPool } = require(path.join(root, 'src/provider-parser-pool.js'));

(async () => {
  const pool = createProviderParserPool({ workers: 4 });
  const fixture = i => ({
    mode: 'head',
    html: `<html><head><meta property="og:title" content="Project ${i}"><meta property="og:image" content="https://cdn.modrinth.com/data/fixture${i}/icon.png"></head><body>Project ${i}</body></html>`,
    url: `https://modrinth.com/mod/fixture-${i}`,
    context: { title: `Project ${i}` }
  });
  try {
    await Promise.all(Array.from({ length: 40 }, (_, i) => pool.parse(fixture(i))));
    const start = performance.now();
    const cpuStart = process.cpuUsage();
    const rows = await Promise.all(Array.from({ length: count }, (_, i) => pool.parse(fixture(i))));
    const elapsedMs = performance.now() - start;
    const cpu = process.cpuUsage(cpuStart);
    if (rows.length !== count || rows.some(r => r === null || typeof r !== 'object')) throw new Error('Incomplete parse workload');
    const outputSha256 = createHash('sha256').update(JSON.stringify(rows)).digest('hex');
    console.log(JSON.stringify({ count, workers: 4, elapsedMs, cpuMs: (cpu.user + cpu.system) / 1000, maxRssKb: process.resourceUsage().maxRSS, outputSha256 }));
  } finally { await pool.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
