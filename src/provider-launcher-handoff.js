'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function safeHttp(raw='') {
  try {
    const url = new URL(String(raw));
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
  } catch { return null; }
}

function canonicalCurseForgeProjectUrl(raw='') {
  const url=safeHttp(raw);if(!url||!/(^|\.)curseforge\.com$/i.test(url.hostname))return '';
  const parts=url.pathname.split('/').filter(Boolean);
  if(String(parts[0]||'').toLowerCase()!=='minecraft'||parts.length<3)return '';
  url.pathname=`/${parts.slice(0,3).map(encodeURIComponent).join('/')}`;
  url.search='';url.hash='';
  return url.toString();
}

function parseCurseForgeProjectId(raw='') {
  const text=String(raw||'');
  const patterns=[
    /\bProject\s*ID\b(?:\s|&nbsp;|<[^>]*>)*[:#-]?(?:\s|&nbsp;|<[^>]*>)*(\d{4,12})\b/i,
    /["']projectId["']\s*:\s*["']?(\d{4,12})\b/i,
    /["']project_id["']\s*:\s*["']?(\d{4,12})\b/i,
    /\bprojectId%22%3A(?:%22)?(\d{4,12})\b/i,
  ];
  for(const pattern of patterns){const id=pattern.exec(text)?.[1];if(id)return id}
  return '';
}

function registryProtocolCommand(scheme='curseforge', {platform=process.platform, run=spawnSync}={}) {
  if(platform!=='win32'||!/^[a-z][a-z0-9+.-]{1,30}$/i.test(scheme))return '';
  for(const hive of ['HKCU','HKLM']){
    try{
      const result=run('reg.exe',['query',`${hive}\\Software\\Classes\\${scheme}\\shell\\open\\command`,'/ve'],{encoding:'utf8',windowsHide:true,timeout:1800});
      if(result?.status===0){const line=String(result.stdout||'').split(/\r?\n/).find(row=>/\bREG_(?:EXPAND_)?SZ\b/i.test(row));const value=String(line||'').replace(/^.*?\bREG_(?:EXPAND_)?SZ\b\s*/i,'').trim();if(value)return value}
    }catch{}
  }
  return '';
}

function executableFromCommand(command='') {
  const text=String(command||'').trim();if(!text)return '';
  const quoted=/^"([^"]+\.exe)"/i.exec(text)?.[1];
  const plain=/^([^\s]+\.exe)\b/i.exec(text)?.[1];
  return quoted||plain||'';
}

function curseForgeInstallation({platform=process.platform,localAppData=process.env.LOCALAPPDATA||'',run=spawnSync}={}) {
  const command=registryProtocolCommand('curseforge',{platform,run});
  const registeredExecutable=executableFromCommand(command);
  const known=[
    registeredExecutable,
    localAppData&&path.join(localAppData,'Programs','CurseForge Windows','CurseForge.exe'),
    localAppData&&path.join(localAppData,'Overwolf','OverwolfLauncher.exe'),
  ].filter(Boolean);
  const executable=known.find(candidate=>{try{return fs.statSync(candidate).isFile()}catch{return false}})||registeredExecutable||'';
  return {installed:!!(command||executable),registered:!!command,command,executable};
}

module.exports={canonicalCurseForgeProjectUrl,parseCurseForgeProjectId,registryProtocolCommand,executableFromCommand,curseForgeInstallation};
