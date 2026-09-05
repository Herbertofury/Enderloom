'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');
const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root,'catalog','creator-vault','recommendation-sources','asianhalfsquat.history-batch26.json');
const providerPath = path.join(root,'catalog','creator-vault','project-sources','provider-closure-26a-asianhalfsquat.json');
const creatorsPath = path.join(root,'catalog','creator-vault','creators.json');
const baselinePath = path.join(root,'catalog','creator-vault','research','creators.chunk25-baseline.json');
const researchPath = path.join(root,'catalog','creator-vault','research','asianhalfsquat.chunk26-source.json');
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-ahs26-probe-'));
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
  const legacy = spawnSync(process.execPath,[path.join(__dirname,'creator-vault-qa-chunk25.js')],{cwd:root,stdio:'inherit'});
  assert.equal(legacy.status,0,'chunk25 frozen acceptance must remain green');
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
assert(ahs,'AsianHalfSquat creator missing');
const videos = vault.videos.filter(v=>v.creatorId===ahs.id);
const mods = videos.flatMap(v=>v.mods);
const video = videos.find(v=>v.id==='youtube:bd83XKp65jw');
assert(video,'chunk26 September 4 video must load');
assert.equal(video.mods.length,10);
const research = JSON.parse(fs.readFileSync(researchPath,'utf8'));
const gap = (research.unresolvedChronology||[]).find(item=>item.publishedAt==='2024-09-06');
assert(gap && gap.status==='source-identity-pending','September 6 chronology gap must remain explicit');
const fresh = video.mods.map(mod=>({name:mod.name,canonicalProjectId:mod.canonicalProjectId,projectType:mod.canonicalProjectType,timestamp:mod.timestamp,timestampSeconds:mod.timestampSeconds,loader:mod.loader,videoLink:mod.videoLink,providerLinks:mod.providerLinks}));
console.log(JSON.stringify({stats:vault.stats,unresolved:vault.projects.filter(project=>!project.providerLinks.length).map(project=>project.name).sort(),ahs:{coverage:ahs.coverage,videos:videos.length,mentions:mods.length,linkedMentions:mods.filter(m=>m.providerLinks.length>0).length,linkedCanonical:new Set(mods.filter(m=>m.providerLinks.length>0).map(m=>m.canonicalProjectId)).size,allCanonical:new Set(mods.map(m=>m.canonicalProjectId)).size},chronologyGap:gap,fresh},null,2));
