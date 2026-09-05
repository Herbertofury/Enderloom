'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');
const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root,'catalog','creator-vault','recommendation-sources','asianhalfsquat.history-batch25.json');
const providerPath = path.join(root,'catalog','creator-vault','project-sources','provider-closure-25a-asianhalfsquat.json');
const creatorsPath = path.join(root,'catalog','creator-vault','creators.json');
const baselinePath = path.join(root,'catalog','creator-vault','research','creators.chunk24-baseline.json');
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-ahs25-probe-'));
let sourceBackup, providerBackup, creatorsBackup;
try {
  assert(fs.existsSync(sourcePath));
  assert(fs.existsSync(providerPath));
  assert(fs.existsSync(baselinePath));
  sourceBackup = path.join(tempDir,path.basename(sourcePath));
  providerBackup = path.join(tempDir,path.basename(providerPath));
  creatorsBackup = path.join(tempDir,'creators.current.json');
  fs.renameSync(sourcePath,sourceBackup);
  fs.renameSync(providerPath,providerBackup);
  fs.renameSync(creatorsPath,creatorsBackup);
  fs.copyFileSync(baselinePath,creatorsPath);
  const legacy = spawnSync(process.execPath,[path.join(__dirname,'creator-vault-qa-chunk24.js')],{cwd:root,stdio:'inherit'});
  assert.equal(legacy.status,0,'chunk24 frozen acceptance must remain green');
} finally {
  if (creatorsBackup && fs.existsSync(creatorsBackup)) {
    if (fs.existsSync(creatorsPath)) fs.rmSync(creatorsPath,{force:true});
    fs.renameSync(creatorsBackup,creatorsPath);
  }
  if (providerBackup && fs.existsSync(providerBackup)) fs.renameSync(providerBackup,providerPath);
  if (sourceBackup && fs.existsSync(sourceBackup)) fs.renameSync(sourceBackup,sourcePath);
  fs.rmSync(tempDir,{recursive:true,force:true});
}
const vault = loadCreatorVault(root);
const ahs = vault.creators.find(c=>c.id==='youtube:asianhalfsquat');
const videos = vault.videos.filter(v=>v.creatorId===ahs.id);
const mods = videos.flatMap(v=>v.mods);
const video = videos.find(v=>v.id==='youtube:pw52tfw26Wg');
assert(video,'chunk25 video must load');
const fresh = video.mods.map(mod=>({name:mod.name,canonicalProjectId:mod.canonicalProjectId,timestampSeconds:mod.timestampSeconds,videoLink:mod.videoLink,providerLinks:mod.providerLinks}));
console.log(JSON.stringify({stats:vault.stats,ahs:{coverage:ahs.coverage,videos:videos.length,mentions:mods.length,linkedMentions:mods.filter(m=>m.providerLinks.length>0).length,linkedCanonical:new Set(mods.filter(m=>m.providerLinks.length>0).map(m=>m.canonicalProjectId)).size},fresh},null,2));
