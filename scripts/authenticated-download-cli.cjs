'use strict';
// Run with the Electron runtime, not node: this deliberately uses the SAME
// persistent Chromium cookie jar as Enderloom. No cookie export or token bridge.
const { app, session, safeStorage, net } = require('electron');
const path = require('path');
const fs = require('fs');
const { createBrowserDownloads } = require('../src/browser-downloads');
app.setName('Enderloom');
app.setPath('userData',path.join(app.getPath('appData'),'Enderloom'));
app.setAppUserModelId('com.herbertofury.enderloom');
if (!app.requestSingleInstanceLock()) { console.error('Enderloom is open. Use its Downloads panel, or close it before running the background download CLI.'); app.exit(2); }
else app.whenReady().then(async () => {
  const requestFile=process.argv.find(value=>value.startsWith('--request='))?.slice('--request='.length);
  let input=requestFile?fs.readFileSync(requestFile,'utf8'):'';if(!requestFile)for await(const chunk of process.stdin)input+=chunk;
  let request;try{request=JSON.parse(input);}catch{throw Error('Pass --request=<JSON file> containing url, optional sha256 and filename. JSON stdin is also supported where the runtime provides it.');}
  const live=session.fromPartition('persist:minecraft-catalog-live');
  const downloads=createBrowserDownloads({directory:app.getPath('downloads'),statePath:path.join(app.getPath('userData'),'browser-downloads.json'),safeStorage,fetch:require('../src/session-download-fetch').createSessionDownloadFetch(live,net),publish:record=>{
    process.stdout.write(JSON.stringify(record)+'\n');
    if(record.type==='done') app.exit(record.state==='completed'?0:2);
  }});
  downloads.start(request);
}).catch(error=>{console.error(error.message);app.exit(2);});
