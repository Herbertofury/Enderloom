'use strict';
const {spawnSync}=require('child_process');
const path=require('path');
const scripts=[
  'catalog-qa.js','catalog-layout-qa.js','shell-contract-qa.js','launcher-command-coverage-qa.js','workspace-tabs-qa.js','provider-launcher-handoff-qa.js','modrinth-project-media-qa.js','drag-overlay-qa.js','native-chrome-qa.js','media-transport-qa.js','splitter-qa.js','provider-media-qa.js','curseforge-gallery-anchor-qa.js','curseforge-gallery-dom-rescue-qa.js','curseforge-scoped-negative-qa.js','curseforge-description-link-media-qa.js','site-adapter-registry-qa.js','site-adapter-author-qa.js','afdian-post-media-qa.js','structured-post-media-qa.js','parallel-author-lane-qa.js','post-media-render-qa.js','media-role-identity-qa.js','media-identity-gate-qa.js','curseforge-author-fanout-qa.js','parser-pool-qa.js','translator-qa.js','translator-updater-qa.js','provider-universe-qa.js','provider-api-fastlane-qa.js','provider-api-race-qa.js','catalog-provider-coverage-qa.js','hedged-bandwidth-qa.js','media-performance-qa.js','frontier-priority-qa.js','instant-frontier-qa.js','parallel-race-qa.js','rust-native-qa.js','impit-native-qa.js','native-network-race-qa.js','progressive-media-qa.js','media-stress-qa.js','multi-transport-race-qa.js','adblock-qa.js','gallery-hit-qa.js'
];
const results=[];
for(const script of scripts){
  const full=path.join(__dirname,script);const run=spawnSync(process.execPath,[full],{encoding:'utf8'});
  const stdout=String(run.stdout||'').trim(),stderr=String(run.stderr||'').trim();
  results.push({script,ok:run.status===0,stdout:stdout.slice(-5000),stderr:stderr.slice(-2000)});
  if(run.status!==0){console.error(JSON.stringify({passed:false,failed:script,results},null,2));process.exit(run.status||1)}
}
console.log(JSON.stringify({passed:true,suites:results.map(x=>x.script)},null,2));
