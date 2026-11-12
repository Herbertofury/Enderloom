'use strict';
const assert = require('node:assert/strict');
const { normalizeObjectRows, parseSourceBuffer } = require('../src/ingest');

const providers = [
  ['curseforge.com', 'CurseForge'], ['modrinth.com', 'Modrinth'],
  ['spigotmc.org', 'SpigotMC'], ['dev.bukkit.org', 'Bukkit'],
  ['builtbybit.com', 'BuiltByBit'], ['nexusmods.com', 'Nexus Mods'],
  ['moddb.com', 'ModDB'], ['polymart.org', 'Polymart'],
  ['planetminecraft.com', 'Planet Minecraft'], ['mcpedl.com', 'MCPEDL'],
  ['modbay.org', 'ModBay'], ['afdian.com', 'AFDIAN'], ['patreon.com', 'Patreon'],
  ['minecraft.net', 'Minecraft Marketplace'], ['booth.pm', 'BOOTH'],
  ['fourthwall.com', 'Fourthwall'], ['fourthwall.dev', 'Fourthwall'],
  ['ko-fi.com', 'Ko-fi'], ['itch.io', 'itch.io'], ['gumroad.com', 'Gumroad'],
  ['alltheysm.top', 'alltheysm'],
];
let checks = 0;
function item(url) { return normalizeObjectRows([{ Name: 'Fixture', URL: url }])[0]; }
function check(name, fn) { fn(); checks++; }
for (const [domain, label] of providers) {
  for (const host of [domain, `www.${domain}`, `creator.${domain}`, domain.toUpperCase(), `${domain}.`]) {
    check(`provider ${host}`, () => {
      const url = `https://${host}/project`;
      const row = item(url);
      assert.equal(row.sources[0].provider, label);
      assert.equal(row.sources[0].verified, false);
      assert.equal(row.primaryUrl, new URL(url).toString());
    });
  }
  for (const host of [`not${domain}`, `${domain}.example`, `x-${domain}`, `x${domain}.example`]) {
    check(`lookalike ${host}`, () => {
      const row = item(`https://${host}/project`);
      assert.equal(row.sources[0].provider, host);
      assert.equal(row.curseForgeUrl, '');
      assert.equal(row.modrinthUrl, '');
      assert.equal(row.githubUrl, '');
      assert.equal(row.sources.length, 1);
    });
  }
}
for (const [domain, label, field] of [['github.com', 'GitHub', 'githubUrl'], ['gitlab.com', 'GitLab', null], ['hangar.papermc.io', 'Hangar', null]]) {
  check(`exact host ${domain}`, () => assert.equal(item(`https://${domain}/a`).sources[0].provider, label));
  check(`www host ${domain}`, () => {
    const url = `https://www.${domain}/a`;
    assert.equal(item(url).sources[0].provider, label);
    if (field) assert.equal(item(url)[field], url);
  });
  check(`non-project subdomain ${domain}`, () => assert.equal(item(`https://unrelated.${domain}/a`).sources[0].provider, `unrelated.${domain}`));
}
check('provider-specific links ignore lookalikes and retain all sources', () => {
  const urls = ['https://curseforge.com.example/x', 'https://modrinth.com.example/x', 'https://www.curseforge.com/minecraft/mc-mods/real', 'https://www.modrinth.com/mod/real', 'https://www.github.com/org/repo'];
  const row = normalizeObjectRows([{ Name: 'Fixture', URL: urls.join(' ') }])[0];
  assert.equal(row.primaryUrl, urls[0]);
  assert.equal(row.otherUrl, urls[1]);
  assert.equal(row.curseForgeUrl, urls[2]);
  assert.equal(row.modrinthUrl, urls[3]);
  assert.equal(row.githubUrl, urls[4]);
  assert.deepEqual(row.sources.map(s => s.url), urls);
});
for (const [extension, text] of [
  ['csv', 'Name,URL\nFixture,https://notcurseforge.com/a\n'],
  ['tsv', 'Name\tURL\nFixture\thttps://notcurseforge.com/a\n'],
  ['json', JSON.stringify([{Name:'Fixture',URL:'https://notcurseforge.com/a'}])],
  ['md', '| Name | URL |\n| --- | --- |\n| Fixture | https://notcurseforge.com/a |\n'],
]) {
  check(`${extension} import boundary`, () => {
    const row = parseSourceBuffer(Buffer.from(text), {filePath:`fixture.${extension}`}).items[0];
    assert.equal(row.sources[0].provider, 'notcurseforge.com');
    assert.equal(row.curseForgeUrl, '');
    assert.equal(row.primaryUrl, 'https://notcurseforge.com/a');
  });
}
check('URL credentials and path cannot name the provider', () => {
  for (const url of ['https://curseforge.com@ordinary.example/a', 'https://ordinary.example/curseforge.com', 'https://ordinary.example/?url=https://modrinth.com']) {
    const row = item(url);
    assert.equal(row.sources[0].provider, 'ordinary.example');
    assert.equal(row.curseForgeUrl, '');
    assert.equal(row.modrinthUrl, '');
  }
});
console.log(JSON.stringify({passed:true, checks}, null, 2));
