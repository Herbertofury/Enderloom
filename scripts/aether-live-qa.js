"use strict";
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const {spawn,spawnSync}=require('child_process');
if(!process.argv.includes('--live-account'))throw Error('Pass --live-account to play the isolated acceptance world');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/aether-acceptance'),source=JSON.parse(fs.readFileSync(path.join(out,'source.json')));
const cli=path.join(root,'native/target/debug/enderloom.exe'),record=process.argv.includes('--record'),prefix=record?'recorded':'release';
function fingerprint(folder){const rows=[];const walk=p=>{for(const d of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,d.name);if(d.isSymbolicLink())throw Error('Linked source');if(d.isDirectory())walk(f);else rows.push([path.relative(folder,f),crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')])}};walk(folder);return crypto.createHash('sha256').update(JSON.stringify(rows.sort())).digest('hex')}
function run(args){return new Promise((resolve,reject)=>{const child=spawn(cli,['--json','--timeout','10m',...args],{cwd:root,windowsHide:true});let out='',err='';child.stdout.on('data',b=>out+=b);child.stderr.on('data',b=>err+=b);child.on('error',reject);child.on('exit',code=>{try{const value=JSON.parse(out);if(code!==0){const e=Error(err||value.error?.message||'CLI failure');e.result=value.result;reject(e)}else resolve(value.result)}catch(e){reject(e)}})})}
let test;
(async()=>{
  const before=fingerprint(source.dir);
  const start=await run(['test','start',source.id,'--world','Enderloom Aether Acceptance','--max-seconds','600',...(record?['--record-video']:[])]);test=start.id;
  assert.equal(start.state,'running',start.error);assert.equal(start.record_video,record);console.log('Running actual Aether scenario:',test);
  assert(start.world_ready_at>=start.adapter_ready_at&&start.ready_at>=start.world_ready_at,'The scenario must wait for the actual world');
  assert(start.ready_observation.at>=start.launched_at&&start.ready_observation.dimension&&start.ready_observation.position?.length===3,'Readiness requires a fresh player observation, not an adapter startup line');
  fs.writeFileSync(path.join(out,prefix+'-start.json'),JSON.stringify(start,null,2));
  const report=await run(['test','run',test,'--input',path.join(root,'tools/minecraft-testing/scenarios/aether-smoke.json')]);
  fs.writeFileSync(path.join(out,prefix+'-report.json'),JSON.stringify(report,null,2));
  assert.equal(report.scenario_state,'passed',report.scenario_error);assert.equal(report.state,'completed');assert.equal(report.cleaned_up,true,report.cleanup_error);
  assert.equal(fingerprint(source.dir),before,'The source world, config or mods changed');
  assert(report.loaded_mods.some(m=>m.id==='aether'&&m.version==='1.5.10'));
  assert(report.loaded_mods.some(m=>m.id==='spark'&&m.version==='1.10.124'));
  assert(report.frame_times['aether:the_aether'].frames>100);
  assert(report.steps.some(s=>s.command==='@attack'&&s.status==='passed'));
  assert(report.steps.some(s=>s.command.includes('DAMAGE_CONFIRMED')&&s.status==='passed'));
  assert.equal(report.artifacts.filter(a=>a.kind==='image').length,5);
  const spark=report.evidence.find(e=>e.kind==='spark');assert(spark&&spark.tps>0);assert(spark.threads.some(t=>t.mods.some(m=>m.name==='aether')));
  assert.deepEqual(report.analysis_errors,[]);
  const videos=report.artifacts.filter(a=>a.kind==='video');assert.equal(videos.length,record?1:0);
  if(record){assert.equal(report.recording_target.method,'window_handle');assert(report.recording_target.hwnd>0);assert.equal(report.recording_target.audio,false);assert(!report.video_error,report.video_error);assert.equal(report.video_finalized,true,report.video_finalization_error);assert.equal(videos[0].name,'playback.mp4');const result=spawnSync('ffprobe',['-v','error','-show_entries','format=duration','-show_entries','stream=codec_name,width,height','-of','json',videos[0].path],{encoding:'utf8',windowsHide:true});assert.equal(result.status,0,result.stderr);const video=JSON.parse(result.stdout);assert(Number(video.format.duration)>90);assert(video.streams.some(s=>s.codec_name==='h264'));}
  console.log('PASS real Minecraft CLI: copied-world isolation, automatic scenario finish, physical input isolation, Aether transitions, sword damage, 5 screenshots, Spark attribution, frame pacing, loaded versions and '+(record?'validated video recording.':'recording off.'));
  console.log('Report:',path.join(report.report_dir,'report.json'));
})().catch(async e=>{console.error(e.message);if(e.result)fs.writeFileSync(path.join(out,prefix+'-failure.json'),JSON.stringify(e.result,null,2));if(test)try{await run(['test','finish',test])}catch{}process.exitCode=1});
