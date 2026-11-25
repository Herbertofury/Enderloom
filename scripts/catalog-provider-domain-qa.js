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
// Execute the exact standalone Catalog renderer code around source initialization and enqueue.
async function catalogLinkScope() {
  const vm = require('node:vm');
  const fs = require('node:fs');
  const path = require('node:path');
  const root=path.join(__dirname,'..');
  const app=fs.readFileSync(path.join(root,'catalog/app.js'),'utf8');
  const {renderCatalog}=require('../src/catalog-renderer');
  const {html}=renderCatalog({id:'scope-fixture',name:'Scope fixture',items:[]},root);
  assert.ok(html.includes(app),'generated Catalog HTML retains the exact tested renderer');
  const part = (start,end) => {
    const i = app.indexOf(start), j = app.indexOf(end,i+start.length);
    assert.ok(i>=0 && j>i, `renderer section ${start}`);
    return app.slice(i,j);
  };
  const code = [
    part('DATA.forEach(p=>','const byId='),
    part('function itemUrls','function mediaItemUrls'),
    part('function providerProjectUrls','function launcherButton'),
    part('async function enrichProviderLinks','window.__mobExplorerTest'),
    '({launcherProjectUrl,itemUrls,enrichProviderLinks})',
  ].join('\n');
  const corrected='https://modrinth.com/mod/corrected', former='https://modrinth.com/mod/former', cross='https://www.curseforge.com/minecraft/mc-mods/confirmed';
  const project={id:'same-stable-row',name:'Catalog example',edition:'Java',type:'Mod',loader:'Fabric',minecraftVersions:'1.21.1',primaryUrl:corrected};
  const response=[{url:corrected,label:'Catalog source'},{url:cross,label:'Cross-published project'}];
  let renders=0;
  function mount(current,cache) {
    const requests=[];
    const DATA=[{...current}];
    const API=vm.runInNewContext(code,{DATA,linkCache:cache,norm:v=>String(v),uniq:values=>[...new Set(values.filter(Boolean))],
      render:()=>renders++,safeStorage:{set(){}},STORE:{links:'test-scope'},
      setTimeout:fn=>fn(),window:{mobCompanion:{async enrichProjectLinks(input){requests.push(input);return {links:response}}}}});
    return {requestList:requests,item:DATA[0],...API};
  }
  const old={ [project.id]:{at:Date.now(),links:[{url:former}] } };
  let x=mount(project,old);
  assert.equal(x.launcherProjectUrl(x.item),corrected,'an unproven legacy cache must not steer a corrected launcher');
  assert.equal(x.item._sourceCount,1,'old project URL is not listed for the corrected row');
  assert.ok(!x.itemUrls(x.item).includes(former));
  await x.enrichProviderLinks();assert.equal(x.requestList.length,1);
  assert.equal(JSON.stringify(x.requestList[0].urls),JSON.stringify([corrected]));
  assert.equal(x.item._sourceCount,2);
  assert.ok(x.itemUrls(x.item).includes(cross));
  assert.ok(renders>0);
  const cached=mount(project,old);await cached.enrichProviderLinks();
  assert.equal(cached.requestList.length,0,'matching 14-day cache must still skip redundant lookups');
  assert.ok(cached.itemUrls(cached.item).includes(cross));
  for(const change of [{primaryUrl:'https://modrinth.com/mod/replacement'},{name:'Renamed project'},{loader:'Forge'},{minecraftVersions:'1.20.1'}]){
    const changed=mount({...project,...change},old);
    assert.ok(!changed.itemUrls(changed.item).includes(cross),'corrected input must not take persisted discovered URLs');
  }
  const valid={...old,[project.id]:{...old[project.id],links:[{url:former},{url:cross}]}};
  x=mount(project,valid);
  assert.equal(x.launcherProjectUrl(x.item),corrected,'declared project identity precedes any discovered provider matches');
  assert.ok(x.itemUrls(x.item).includes(cross),'derived source links remain visible when provenance matches');
  for(const at of [Date.now()-15*86400000,Date.now()+3600000]){
    const expired={...old,[project.id]:{...old[project.id],at}};
    const aged=mount(project,expired);await aged.enrichProviderLinks();
    assert.deepEqual(JSON.parse(JSON.stringify(aged.requestList[0].urls)),[corrected]);
  }
  const unrelated={...project,primaryUrl:'https://example.test/demo'};
  const weak=mount(unrelated,old);await weak.enrichProviderLinks();
  assert.equal(weak.requestList.length,0,'cached paths cannot create a new provider identity from an unrelated catalog row');
  console.log('PASS Catalog launcher identity: cache seeds, declared-source priority, and unpolluted refresh inputs');
}
catalogLinkScope().then(()=>console.log(JSON.stringify({passed:true, checks},null,2)))
  .catch(error=>{console.error(error);process.exitCode=1;});
