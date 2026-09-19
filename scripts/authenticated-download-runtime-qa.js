'use strict';
const fs=require('fs'),path=require('path'),{spawn,execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..'),tls=path.join(root,'output/auth-download-tls');fs.mkdirSync(tls,{recursive:true});
const openssl=process.platform==='win32'&&fs.existsSync('C:/Program Files/Git/usr/bin/openssl.exe')?'C:/Program Files/Git/usr/bin/openssl.exe':'openssl';
execFileSync(openssl,['req','-x509','-newkey','rsa:2048','-nodes','-keyout',path.join(tls,'key.pem'),'-out',path.join(tls,'cert.pem'),'-days','1','-subj','/CN=localhost','-addext','subjectAltName=DNS:localhost'],{stdio:'ignore',env:{...process.env,MSYS_NO_PATHCONV:'1'}});
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
const child=spawn(path.join(root,'node_modules/electron/dist',process.platform==='win32'?'electron.exe':'electron'),[path.join(root,'scripts/fixtures/authenticated-download-host.cjs')],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});child.stdout.pipe(process.stdout);child.stderr.pipe(process.stderr);child.on('error',e=>{console.error(e);process.exitCode=1;});child.on('exit',code=>process.exitCode=code||0);
