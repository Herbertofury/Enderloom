'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadCreatorVault } = require('../src/creator-vault');
const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'catalog', 'creator-vault', 'recommendation-sources', 'asianhalfsquat.history-batch23.json');
const providerPath = path.join(root, 'catalog', 'creator-vault', 'project-sources', 'provider-closure-23a-asianhalfsquat.json');
const creatorsPath = path.join(root, 'catalog', 'creator-vault', 'creators.json');
const baselineCreatorsPath = path.join(root, 'catalog', 'creator-vault', 'research', 'creators.chunk22-baseline.json');
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-ahs23-diagnostic-'));
const moved = [];
let currentCreatorsBackup = null;
try {
  for (const file of [sourcePath, providerPath]) {
    assert(fs.existsSync(file), `chunk 23 production file missing: ${path.relative(root,file)}`);
    const target = path.join(tempDir, path.basename(file));
    fs.renameSync(file, target);
    moved.push([file,target]);
  }
  currentCreatorsBackup = path.join(tempDir, 'creators.current.json');
  fs.renameSync(creatorsPath, currentCreatorsBackup);
  fs.copyFileSync(baselineCreatorsPath, creatorsPath);
  const legacy = spawnSync(process.execPath,[path.join(__dirname,'creator-vault-qa-chunk22.js')],{cwd:root,stdio:'inherit'});
  assert.equal(legacy.status,0,'chunk 22 baseline regression suite must remain green');
} finally {
  if (currentCreatorsBackup && fs.existsSync(currentCreatorsBackup)) {
    if (fs.existsSync(creatorsPath)) fs.rmSync(creatorsPath,{force:true});
    fs.renameSync(currentCreatorsBackup, creatorsPath);
  }
  for (const [file,target] of moved.reverse()) if (fs.existsSync(target)) fs.renameSync(target,file);
  fs.rmSync(tempDir,{recursive:true,force:true});
}
const vault = loadCreatorVault(root);
const ahs = vault.creators.find(c=>c.id==='youtube:asianhalfsquat');
const ahsVideos = vault.videos.filter(v=>v.creatorId===ahs.id);
const ahsMods = ahsVideos.flatMap(v=>v.mods);
const linked = ahsMods.filter(m=>m.providerLinks.length>0);
const video = ahsVideos.find(v=>v.id==='youtube:KaiDjB1w_OY');
assert(video && video.mods.length===8,'chunk 23 video must load with 8 mentions');
assert(video.mods.every(m=>m.timestampSeconds===null),'all chunk 23 timestamps must remain null');
assert(video.mods.every(m=>m.videoLink===video.url),'all chunk 23 links must remain base video URLs');
assert(video.mods.every(m=>m.providerLinks.length>0),'all chunk 23 mentions must be linked');
console.log(JSON.stringify({stats:vault.stats,ahs:{coverage:ahs.coverage,videos:ahsVideos.length,mentions:ahsMods.length,linkedMentions:linked.length,linkedCanonical:new Set(linked.map(m=>m.canonicalProjectId)).size},fresh:video.mods.map(m=>({name:m.name,canonicalProjectId:m.canonicalProjectId,providerLinks:m.providerLinks}))},null,2));
