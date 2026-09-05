'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');
const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'catalog', 'creator-vault', 'recommendation-sources', 'asianhalfsquat.history-batch24.json');
const creatorsPath = path.join(root, 'catalog', 'creator-vault', 'creators.json');
const baselineCreatorsPath = path.join(root, 'catalog', 'creator-vault', 'research', 'creators.chunk23-baseline.json');
const forbiddenProviderPath = path.join(root, 'catalog', 'creator-vault', 'project-sources', 'provider-closure-24a-asianhalfsquat.json');
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-ahs24-diagnostic-'));
let sourceBackup = null;
let currentCreatorsBackup = null;
try {
  assert(fs.existsSync(sourcePath), 'chunk 24 production source file must exist');
  assert(!fs.existsSync(forbiddenProviderPath), 'chunk 24 must not invent a provider overlay when all five projects are already sufficiently linked');
  sourceBackup = path.join(tempDir, path.basename(sourcePath));
  fs.renameSync(sourcePath, sourceBackup);
  currentCreatorsBackup = path.join(tempDir, 'creators.current.json');
  fs.renameSync(creatorsPath, currentCreatorsBackup);
  fs.copyFileSync(baselineCreatorsPath, creatorsPath);
  const legacy = spawnSync(process.execPath,[path.join(__dirname,'creator-vault-qa-chunk23.js')],{cwd:root,stdio:'inherit'});
  assert.equal(legacy.status,0,'chunk 23 baseline regression suite must remain green');
} finally {
  if (currentCreatorsBackup && fs.existsSync(currentCreatorsBackup)) {
    if (fs.existsSync(creatorsPath)) fs.rmSync(creatorsPath,{force:true});
    fs.renameSync(currentCreatorsBackup, creatorsPath);
  }
  if (sourceBackup && fs.existsSync(sourceBackup)) fs.renameSync(sourceBackup, sourcePath);
  fs.rmSync(tempDir,{recursive:true,force:true});
}
const vault = loadCreatorVault(root);
const ahs = vault.creators.find(c=>c.id==='youtube:asianhalfsquat');
const ahsVideos = vault.videos.filter(v=>v.creatorId===ahs.id);
const ahsMods = ahsVideos.flatMap(v=>v.mods);
const linked = ahsMods.filter(m=>m.providerLinks.length>0);
const video = ahsVideos.find(v=>v.id==='youtube:0Qormp_C7mg');
assert(video && video.mods.length===5,'chunk 24 video must load with 5 mentions');
assert(video.mods.every(m=>m.timestampSeconds===null),'all chunk 24 timestamps must remain null');
assert(video.mods.every(m=>m.videoLink===video.url),'all chunk 24 links must remain base video URLs');
assert(video.mods.every(m=>m.providerLinks.length>0),'all chunk 24 mentions must be linked through existing canonical homes');
console.log(JSON.stringify({stats:vault.stats,ahs:{coverage:ahs.coverage,videos:ahsVideos.length,mentions:ahsMods.length,linkedMentions:linked.length,linkedCanonical:new Set(linked.map(m=>m.canonicalProjectId)).size},fresh:video.mods.map(m=>({name:m.name,canonicalProjectId:m.canonicalProjectId,providerLinks:m.providerLinks}))},null,2));
