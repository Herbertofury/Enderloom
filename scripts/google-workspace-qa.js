'use strict';
const assert=require('assert');
const fs=require('fs');
const os=require('os');
const path=require('path');
const {GoogleWorkspace,SHEET_TAB,parseDesktopClient,googleTarget,safeCell,sheetValues,docChunks}=require('../src/google-workspace');

(async()=>{
  assert.equal(parseDesktopClient({installed:{client_id:'desktop.apps.googleusercontent.com',client_secret:'fixture',auth_uri:'https://accounts.google.com/o/oauth2/auth',token_uri:'https://oauth2.googleapis.com/token'}}).clientId,'desktop.apps.googleusercontent.com');
  assert.throws(()=>parseDesktopClient({web:{client_id:'wrong-type'}}),/Desktop app/);
  assert.deepEqual(googleTarget('https://docs.google.com/spreadsheets/d/sheet-123/edit?gid=4','sheet'),{kind:'sheet',id:'sheet-123',url:'https://docs.google.com/spreadsheets/d/sheet-123/edit'});
  assert.equal(googleTarget('https://docs.google.com/document/d/doc-123/edit','sheet'),null);
  assert.equal(safeCell('=IMPORTXML("https://evil.test")').startsWith("'="),true,'formula-leading cell was not neutralized');
  const canceled=new GoogleWorkspace({userDataDir:fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-google-cancel-')),safeStorage:{isEncryptionAvailable:()=>false},pickCredentials:async()=>''});
  await assert.rejects(()=>canceled.configure(),/canceled/,'credential-picker cancellation is not surfaced cleanly');
  const rows=[{Name:'GitHub project','Primary URL':'https://github.com/example/project','Gallery URLs':'https://opengraph.githubassets.com/mcc-live/example/project','Author Image URL':'https://github.com/example.png?size=160',Notes:'=unsafe'}];
  const values=sheetValues(rows);
  assert.equal(values.values[1][values.columns.indexOf('Notes')],"'=unsafe");
  const chunks=docChunks(rows,'Fixture',10_000);
  assert(chunks[0].text.includes('opengraph.githubassets.com'));
  assert(chunks[0].links.some(link=>link.url==='https://github.com/example/project'));

  const calls=[];
  const request=async(url,options={})=>{
    calls.push({url,options});
    if(url.includes('/spreadsheets/sheet-123?fields='))return{sheets:[{properties:{sheetId:77,title:'Other'}}]};
    if(url.endsWith('/spreadsheets/sheet-123:batchUpdate')&&options.body?.requests?.[0]?.addSheet)return{replies:[{addSheet:{properties:{sheetId:88,title:SHEET_TAB}}}]};
    if(url.includes('/documents/doc-123')&&!url.endsWith(':batchUpdate'))return{body:{content:[{endIndex:42}]}};
    return{};
  };
  const secure={isEncryptionAvailable:()=>true,encryptString:value=>Buffer.from(value),decryptString:value=>value.toString('utf8')};
  const workspace=new GoogleWorkspace({userDataDir:fs.mkdtempSync(path.join(os.tmpdir(),'enderloom-google-qa-')),safeStorage:secure,request});
  workspace.persisted.client={clientId:'desktop.apps.googleusercontent.com',clientSecret:'fixture',tokenUri:'https://oauth2.googleapis.com/token',authUri:'https://accounts.google.com/o/oauth2/auth'};
  workspace.persisted.refreshToken='refresh-fixture';workspace.accessToken='access-fixture';workspace.accessTokenExpiresAt=Date.now()+600_000;workspace.state='connected';

  const sheet=await workspace.exportCatalog({kind:'sheet',rows,title:'Fixture',targetUrl:'https://docs.google.com/spreadsheets/d/sheet-123/edit'});
  assert.equal(sheet.target,SHEET_TAB);assert.equal(sheet.created,false);
  const clear=calls.find(call=>call.url.includes(':clear'));assert(clear&&decodeURIComponent(clear.url).includes(`'${SHEET_TAB}'!A:CB`),'dedicated Sheet tab was not cleared precisely');
  const update=calls.find(call=>call.options.method==='PUT');assert(update&&update.url.includes('valueInputOption=RAW'),'Sheet values are not written as non-executable RAW cells');
  assert(!calls.some(call=>JSON.stringify(call.options.body||{}).includes('deleteSheet')),'writeback can delete an existing Sheet tab');

  calls.length=0;
  const doc=await workspace.exportCatalog({kind:'doc',rows,title:'Fixture',targetUrl:'https://docs.google.com/document/d/doc-123/edit'});
  assert.equal(doc.created,false);assert.equal(doc.target,'Appended Enderloom enriched catalog section');
  const inserted=calls.flatMap(call=>call.options.body?.requests||[]).find(requestRow=>requestRow.insertText);
  assert.equal(inserted.insertText.location.index,41,'Doc writeback did not append at the existing document end');
  assert(inserted.insertText.text.includes('Author Image URL'));
  const links=calls.flatMap(call=>call.options.body?.requests||[]).filter(requestRow=>requestRow.updateTextStyle?.textStyle?.link?.url);
  assert(links.some(requestRow=>requestRow.updateTextStyle.textStyle.link.url==='https://github.com/example/project'),'Doc URL was not made clickable');
  assert(!calls.some(call=>JSON.stringify(call.options.body||{}).includes('deleteContentRange')),'Doc writeback can replace existing content');

  console.log(JSON.stringify({passed:true,nativeSheet:true,nativeDoc:true,dedicatedSheetTab:SHEET_TAB,appendOnlyDoc:true,formulaInjectionBlocked:true,clickableLinks:links.length},null,2));
})().catch(error=>{console.error(error.stack||error);process.exit(1)});
