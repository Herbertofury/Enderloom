'use strict';
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const root = path.resolve(__dirname,'..');
const args = process.argv.slice(2);
const gui = !args.length || args[0]==='gui';
const name = process.platform==='win32'?'enderloom.exe':'enderloom';
const builds = ['debug','release'].map(profile=>path.join(root,'native','target',profile,name))
  .filter(file=>fs.existsSync(file)).sort((a,b)=>fs.statSync(b).mtimeMs-fs.statSync(a).mtimeMs);
const binary = [process.env.ENDERLOOM_CLI_PATH,path.join(root,'native',name),...builds]
  .filter(Boolean).find(file=>fs.existsSync(file));
if(!gui && !binary) {
  process.stderr.write('Build the Enderloom CLI with npm run build:cli.\n');
  process.exit(3);
}
const child = spawn(gui?process.execPath:binary,gui?[path.join(__dirname,'run.js'),...args.slice(args[0]==='gui'?1:0)]:args,{cwd:root,stdio:'inherit',windowsHide:true});
child.once('error',error=>{process.stderr.write(`${error.message}\n`);process.exitCode=3;});
child.once('exit',code=>{process.exitCode=code??3;});
