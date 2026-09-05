'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root,'catalog','creator-vault','recommendation-sources','asianhalfsquat.history-batch26.json');
const providerPath = path.join(root,'catalog','creator-vault','project-sources','provider-closure-26a-asianhalfsquat.json');
const creatorsPath = path.join(root,'catalog','creator-vault','creators.json');
const baselinePath = path.join(root,'catalog','creator-vault','research','creators.chunk25-baseline.json');
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-ahs26-preprod-'));
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
  const collision = spawnSync(process.execPath,[path.join(__dirname,'creator-vault-ahs26-provider-collision.js')],{cwd:root,stdio:'inherit'});
  assert.equal(collision.status,0,'corrected chunk26 provider candidates must be collision-free against untouched chunk25 baseline');
} finally {
  if (creatorsBackup && fs.existsSync(creatorsBackup)) {
    if (fs.existsSync(creatorsPath)) fs.rmSync(creatorsPath,{force:true});
    fs.renameSync(creatorsBackup,creatorsPath);
  }
  if (providerBackup && fs.existsSync(providerBackup)) fs.renameSync(providerBackup,providerPath);
  if (sourceBackup && fs.existsSync(sourceBackup)) fs.renameSync(sourceBackup,sourcePath);
  fs.rmSync(tempDir,{recursive:true,force:true});
}
