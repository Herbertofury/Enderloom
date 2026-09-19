(() => {
  'use strict';
  if (window.EnderloomVideoControls) return;
  const attached = new WeakMap(), players = new Set();
  const time = value => { const n = Math.max(0, Math.floor(Number(value) || 0)); return n >= 3600 ? `${Math.floor(n/3600)}:${String(Math.floor(n/60)%60).padStart(2,'0')}:${String(n%60).padStart(2,'0')}` : `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`; };
  function attach(video, options = {}) {
    if (attached.has(video)) return attached.get(video);
    const container = options.container || document.createElement('div'), wrapped = !options.container;
    if (wrapped) { video.before(container); container.append(video); }
    container.classList.add('el-video-shell'); container.tabIndex = 0;
    container.setAttribute('aria-label', options.title || video.getAttribute('aria-label') || 'Video player');
    const originalControls = video.controls; video.controls = false; video.playsInline = true;
    let dead = false, preview = null, hoverTimer, previewTime = 0, previewGeneration = 0, loadedSource = '', seeking = false;
    const remove = [], ui = document.createElement('div'); ui.className = 'el-video-controls';
    const range = document.createElement('input'); range.type='range';range.min='0';range.max='0';range.step='.1';range.value='0';range.className='el-video-timeline';range.setAttribute('aria-label','Video timeline');
    const bubble = document.createElement('div'); bubble.className='el-video-hover';bubble.hidden=true;
    const canvas=document.createElement('canvas');canvas.width=192;canvas.height=108;canvas.hidden=true;
    const stamp=document.createElement('span');bubble.append(canvas,stamp);
    const tools=document.createElement('div');tools.className='el-video-tools';
    const message=document.createElement('span');message.className='el-video-message';message.setAttribute('role','status');
    function on(target,event,handler,options) {target.addEventListener(event,handler,options);remove.push(()=>target.removeEventListener(event,handler,options));}
    function button(label,text,action) {const b=document.createElement('button');b.type='button';b.textContent=text;b.title=label;b.setAttribute('aria-label',label);on(b,'click',e=>{e.stopPropagation();void action();});tools.append(b);return b;}
    const play=button('Play video (K)','▶',()=>video.paused?video.play().catch(()=>message.textContent='Playback is unavailable.'):video.pause());
    button('Back 10 seconds (J)','↶ 10',()=>seek(video.currentTime-10));
    button('Forward 10 seconds (L)','10 ↷',()=>seek(video.currentTime+10));
    const mute=button('Mute video (M)','♪',()=>{video.muted=!video.muted;});
    const volume=document.createElement('input');volume.type='range';volume.min='0';volume.max='1';volume.step='.05';volume.value=String(video.volume);volume.className='el-video-volume';volume.setAttribute('aria-label','Video volume');tools.append(volume);on(volume,'input',()=>{video.volume=Number(volume.value);video.muted=video.volume===0;});
    const clock=document.createElement('span');clock.className='el-video-clock';tools.append(clock);
    const speed=document.createElement('select');speed.setAttribute('aria-label','Playback speed');for(const rate of [.25,.5,.75,1,1.25,1.5,1.75,2]){const option=document.createElement('option');option.value=String(rate);option.textContent=`${rate}×`;speed.append(option);}speed.value=String(video.playbackRate);tools.append(speed);on(speed,'change',()=>{video.playbackRate=Number(speed.value);});
    const captions=document.createElement('select');captions.setAttribute('aria-label','Video captions');captions.hidden=true;tools.append(captions);
    function tracks(){captions.replaceChildren();const off=document.createElement('option');off.value='-1';off.textContent='Captions off';captions.append(off);Array.from(video.textTracks).forEach((track,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=track.label||track.language||`Track ${i+1}`;captions.append(option);if(track.mode==='showing')captions.value=String(i);});captions.hidden=!video.textTracks.length;}
    on(captions,'change',()=>Array.from(video.textTracks).forEach((track,i)=>track.mode=i===Number(captions.value)?'showing':'disabled'));on(video.textTracks,'addtrack',tracks);
    const pip=button('Pop out video','▣',async()=>{try{if(document.pictureInPictureElement===video)await document.exitPictureInPicture();else await video.requestPictureInPicture();message.textContent='';}catch{message.textContent='Pop-out is unavailable for this video.';}});pip.hidden=!document.pictureInPictureEnabled || typeof video.requestPictureInPicture!=='function';
    button('Fullscreen video (F)','⛶',async()=>{try{if(document.fullscreenElement===container)await document.exitFullscreen();else await container.requestFullscreen();}catch{message.textContent='Fullscreen is unavailable.';}});
    ui.append(bubble,range,tools,message);container.append(ui);
    function seek(value){if(Number.isFinite(video.duration)&&video.duration>0)video.currentTime=Math.max(0,Math.min(video.duration,value));update();}
    function update(){if(dead)return;const duration=Number.isFinite(video.duration)?video.duration:0;range.max=String(duration);range.disabled=!duration;range.value=String(video.currentTime||0);range.setAttribute('aria-valuetext',`${time(video.currentTime)} of ${time(duration)}`);range.style.setProperty('--played',`${duration?video.currentTime/duration*100:0}%`);clock.textContent=`${time(video.currentTime)} / ${time(duration)}`;play.textContent=video.paused?'▶':'Ⅱ';play.setAttribute('aria-label',video.paused?'Play video (K)':'Pause video (K)');mute.textContent=video.muted||video.volume===0?'♩':'♪';mute.setAttribute('aria-label',video.muted?'Unmute video (M)':'Mute video (M)');volume.value=String(video.muted?0:video.volume);speed.value=String(video.playbackRate);pip.disabled=video.readyState<1;container.hidden=video.hidden;}
    on(range,'input',()=>seek(Number(range.value)));
    for(const event of ['loadedmetadata','durationchange','timeupdate','play','pause','volumechange','ratechange','ended','emptied'])on(video,event,update);
    on(video,'play',()=>{for(const other of players)if(other!==video)other.pause();window.dispatchEvent(new CustomEvent('enderloom:media-play',{detail:video}));message.textContent='';});
    on(video,'error',()=>{message.textContent='This video could not be loaded.';releasePreview();});
    const limited=()=>options.previewFrames===false||navigator.connection?.saveData||/(^|-)2g$/.test(navigator.connection?.effectiveType||'')||matchMedia('(prefers-reduced-motion: reduce)').matches;
    function releasePreview(){clearTimeout(hoverTimer);previewGeneration++;bubble.hidden=true;canvas.hidden=true;seeking=false;if(preview){preview.pause();preview.removeAttribute('src');preview.load();preview=null;}loadedSource='';}
    function draw(){if(!preview||dead||bubble.hidden||preview.seeking||preview.readyState<2)return;const ctx=canvas.getContext('2d');if(!ctx)return;try{ctx.fillStyle='#08090d';ctx.fillRect(0,0,canvas.width,canvas.height);const ratio=Math.min(canvas.width/preview.videoWidth,canvas.height/preview.videoHeight),w=preview.videoWidth*ratio,h=preview.videoHeight*ratio;ctx.drawImage(preview,(canvas.width-w)/2,(canvas.height-h)/2,w,h);canvas.hidden=false;}catch{canvas.hidden=true;}}
    function loadPreview(){
      if(dead||bubble.hidden||limited()||!Number.isFinite(video.duration)||video.duration<=0)return;
      const src=video.currentSrc||video.src;if(!src)return;
      const generation=++previewGeneration;
      if(!preview){preview=document.createElement('video');preview.muted=true;preview.playsInline=true;preview.preload='metadata';preview.onloadedmetadata=()=>{if(preview&&!bubble.hidden)preview.currentTime=Math.min(previewTime,Math.max(0,preview.duration-.04));};preview.onseeked=()=>{seeking=false;if(preview&&!bubble.hidden&&Math.abs(preview.currentTime-previewTime)<.2)draw();else if(preview&&!bubble.hidden)loadPreview();};preview.onerror=()=>{if(generation<=previewGeneration)canvas.hidden=true;};}
      if(loadedSource!==src){loadedSource=src;preview.src=src;preview.load();}
      else if(preview.readyState>=1){if(Math.abs(preview.currentTime-previewTime)<.05&&!preview.seeking)draw();else if(!seeking){seeking=true;preview.currentTime=previewTime;}}
    }
    on(range,'pointermove',event=>{const duration=Number.isFinite(video.duration)?video.duration:0;if(!duration)return;const r=range.getBoundingClientRect(),fraction=Math.max(0,Math.min(1,(event.clientX-r.left)/r.width));previewTime=Math.min(Math.max(0,duration-.04),fraction*duration);stamp.textContent=time(previewTime);bubble.hidden=false;canvas.hidden=true;const host=container.getBoundingClientRect();bubble.style.left=`${Math.max(4,Math.min(host.width-200,event.clientX-host.left-96))}px`;clearTimeout(hoverTimer);hoverTimer=setTimeout(loadPreview,150);});
    on(range,'pointerleave',releasePreview);on(range,'blur',releasePreview);
    on(container,'keydown',e=>{if(e.target.matches('input,select,textarea,button')||e.ctrlKey||e.altKey||e.metaKey)return;const key=e.key.toLowerCase();if([' ','k','j','l','arrowleft','arrowright','m','f','i'].includes(key))e.preventDefault();if(key===' '||key==='k')play.click();else if(key==='j'||key==='arrowleft')seek(video.currentTime-(key==='j'?10:5));else if(key==='l'||key==='arrowright')seek(video.currentTime+(key==='l'?10:5));else if(key==='m')mute.click();else if(key==='i')pip.click();else if(key==='f')tools.querySelector('[aria-label="Fullscreen video (F)"]').click();});
    const suspend=()=>{releasePreview();if(document.pictureInPictureElement!==video)video.pause();};
    on(document,'visibilitychange',()=>{if(document.hidden)suspend();});on(window,'pagehide',suspend);
    on(window,'keydown',event=>{if(event.key==='Escape'&&document.fullscreenElement===container){event.preventDefault();void document.exitFullscreen().catch(()=>{});}});
    const intersection=new IntersectionObserver(entries=>{if(!entries[0]?.isIntersecting)suspend();});intersection.observe(container);
    const sourceObserver=new MutationObserver(records=>{update();if(records.some(r=>r.attributeName==='src'))releasePreview();if(video.hidden)suspend();});sourceObserver.observe(video,{attributes:true,attributeFilter:['src','hidden']});
    const control={destroy(){if(dead)return;dead=true;releasePreview();video.pause();if(document.pictureInPictureElement===video)void document.exitPictureInPicture().catch(()=>{});intersection.disconnect();sourceObserver.disconnect();for(const off of remove)off();ui.remove();players.delete(video);attached.delete(video);video.controls=originalControls;container.classList.remove('el-video-shell');if(wrapped){container.before(video);container.remove();}}};
    attached.set(video,control);players.add(video);tracks();update();return control;
  }
  window.EnderloomVideoControls={attach};
})();
