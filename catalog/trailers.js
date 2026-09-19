(() => {
  'use strict';
  const bridge = window.mobCompanion || (window.enderloomLauncher && { trailers: window.enderloomLauncher.trailers, openHere: url => window.enderloomLauncher.openExternal(url) });
  if (!bridge?.trailers || window.__enderloomTrailersBound) return;
  window.__enderloomTrailersBound = true;
  let prefs, active = null, timer = null, serial = 0, appVisible = true, warmed = 0;
  const bindings = new Map(), motion = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const reducedData = () => prefs?.reducedData || connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '');
  const visible = element => { const r = element.getBoundingClientRect(); return element.isConnected && r.width >= 32 && r.height >= 32 && Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) * Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0)) > r.width * r.height * .55 && !element.closest('[hidden]'); };
  const allowed = (binding, manual) => appVisible && !document.hidden && visible(binding.slot) && (manual || (prefs?.entitlement.autoplay && prefs.enabled && prefs[binding.context] && !motion.matches && !reducedData()));
  function warm(binding) {
    if (binding.pending || binding.result?.expiresAt > Date.now() || !allowed(binding, false)) return;
    binding.pending = bridge.trailers.discover(binding.project).then(result => { binding.result = result; return result; }).finally(() => { binding.pending = null; });
    binding.pending.catch(() => {});
  }
  function button(text, action, label = text) { const el = document.createElement('button'); el.type = 'button'; el.textContent = text; el.setAttribute('aria-label', label); el.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); action(); }); return el; }
  function stop(reason = '') {
    clearTimeout(timer); timer = null; serial++;
    const old = active; active = null;
    if (!old) return;
    old.controls?.destroy();
    bridge.trailers.cancel(old.binding.project).catch(() => {});
    if (old.player?.tagName === 'VIDEO') { old.player.pause(); old.player.removeAttribute('src'); old.player.load(); }
    if (old.player?.tagName === 'IFRAME') old.player.src = 'about:blank';
    old.player?.remove(); clearTimeout(old.timeout); clearInterval(old.handshake);
    old.binding.popup?.remove(); old.binding.popup = null; old.binding.popupSlot = null;
    old.binding.slot.classList.remove('trailer-playing'); old.binding.play.textContent = '▶ Play';
    if (reason) old.binding.status.textContent = reason;
    bridge.trailers.release().catch(() => {});
  }
  function suspend(reason = '') {
    stop(reason);
    for (const binding of bindings.values()) if (binding.pending) bridge.trailers.cancel(binding.project).catch(() => {});
  }
  function playerCommand(method, args = []) {
    if (!active?.player) return;
    if (active.candidate.kind === 'youtube') active.player.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: method, args }), 'https://www.youtube.com');
    else if (active.candidate.kind === 'vimeo') active.player.contentWindow?.postMessage({ method: method === 'pauseVideo' ? 'pause' : method === 'playVideo' ? 'play' : method, value: args[0] }, 'https://player.vimeo.com');
  }
  function toggle(binding) {
    if (active?.binding !== binding) { void start(binding, true); return; }
    if (!active.player) { stop('Playback cancelled'); return; }
    const paused = active.player.tagName === 'VIDEO' ? active.player.paused : active.paused;
    if (active.player.tagName === 'VIDEO') { if (paused) active.player.play().catch(() => stop('Playback unavailable')); else active.player.pause(); }
    else playerCommand(paused ? 'playVideo' : 'pauseVideo');
    active.paused = !paused; binding.play.textContent = paused ? 'Ⅱ Pause' : '▶ Resume';
  }
  function popout(binding) {
    if (binding.context !== 'catalog') return binding.slot;
    const popup = document.createElement('section'); popup.className = 'trailer-popout';
    popup.setAttribute('role', 'dialog'); popup.setAttribute('aria-label', `${binding.project.title} trailer`);
    const heading = document.createElement('header'), title = document.createElement('strong'); title.textContent = binding.project.title;
    heading.append(title, button('×', () => stop(), 'Close trailer'));
    const slot = document.createElement('div'); slot.className = 'trailer-popout-media';
    const sourceImage = binding.slot.querySelector('img');
    const img = document.createElement('img'); img.className = 'live-media-image';
    // Only copy an actual project screenshot. A project icon is never treated as gallery media.
    if (sourceImage?.classList.contains('live-media-image') && sourceImage.src) { img.src = sourceImage.src; img.alt = sourceImage.alt; } else img.hidden = true;
    slot.append(img);
    const controls = document.createElement('div'); controls.className = 'trailer-popout-controls';
    controls.append(button('Play / pause', () => toggle(binding)), button('Why this trailer?', () => explain(binding)));
    popup.append(heading, slot, controls); document.body.append(popup);
    const rect = binding.target.getBoundingClientRect(), bounds = popup.getBoundingClientRect();
    const right = rect.right + 12, left = rect.left - bounds.width - 12;
    popup.style.left = `${Math.max(8, Math.min(innerWidth - bounds.width - 8, right + bounds.width < innerWidth ? right : left >= 8 ? left : (binding.pointer?.x || rect.left) + 18))}px`;
    popup.style.top = `${Math.max(8, Math.min(innerHeight - bounds.height - 8, (binding.pointer?.y || rect.top) - 32))}px`;
    popup.addEventListener('pointerenter', () => clearTimeout(binding.leaveTimer));
    popup.addEventListener('pointerleave', event => { if (!binding.target.contains(event.relatedTarget)) stop(); });
    popup.addEventListener('focusout', event => { if (!popup.contains(event.relatedTarget) && !binding.target.contains(event.relatedTarget)) stop(); });
    binding.popup = popup; binding.popupSlot = slot;
    return slot;
  }
  async function start(binding, manual = false) {
    stop();
    if (!allowed(binding, manual)) return;
    const ticket = serial;
    active = { binding, manual };
    const playbackSlot = popout(binding);
    binding.status.textContent = 'Finding a verified trailer…';
    try {
      if (!await bridge.trailers.claim(binding.context, manual)) { if (ticket === serial) stop('Autoplay is unavailable'); return; }
      const result = binding.pending ? await binding.pending : await bridge.trailers.discover(binding.project);
      binding.result = result;
      if (ticket !== serial || !allowed(binding, manual)) return;
      const galleryImage = playbackSlot.querySelector('.live-media-image');
      if (galleryImage && (galleryImage.hidden || !galleryImage.getAttribute('src')) && result.gallery?.[0]?.url) {
        galleryImage.src = result.gallery[0].url; galleryImage.alt = `${binding.project.title} · project screenshot`; galleryImage.onload = () => { galleryImage.hidden = false; };
      }
      const candidate = result.selected;
      if (!candidate) {
        const message = result.failures.length ? 'Source unavailable · showing project gallery' : 'No verified trailer · showing project gallery';
        if (binding.popup) { const note = document.createElement('p'); note.className = 'trailer-gallery-note'; note.textContent = message; binding.popup.append(note); }
        else stop(message);
        return;
      }
      active.candidate = candidate;
      binding.status.textContent = `${candidate.author || 'Project media'} · ${candidate.provenance.source.replace(/-/g, ' ')}`;
      const player = document.createElement(candidate.kind === 'file' ? 'video' : 'iframe');
      active.player = player; player.className = 'trailer-player'; player.title = candidate.title; player.setAttribute('aria-label', candidate.title);
      if (candidate.kind === 'file') {
        player.muted = true; player.controls = true; player.playsInline = true; player.preload = 'none'; player.src = candidate.url; player.poster = candidate.poster || '';
        player.onplaying = () => { if (active?.player === player) { binding.play.textContent = 'Ⅱ Pause'; clearTimeout(active.timeout); } };
        player.onerror = () => { if (active?.player === player) stop('Trailer unavailable · showing project gallery'); };
        player.onended = () => stop('Playback ended');
      } else {
        player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; player.allowFullscreen = true; player.referrerPolicy = 'strict-origin-when-cross-origin';
        const url = new URL(candidate.kind === 'youtube' ? `https://www.youtube.com/embed/${candidate.id}` : `https://player.vimeo.com/video/${candidate.id}`);
        const params = candidate.kind === 'youtube' ? { autoplay: 1, mute: 1, controls: 1, playsinline: 1, enablejsapi: 1, cc_load_policy: prefs.captions ? 1 : 0, start: candidate.start || 0 } : { autoplay: 1, muted: 1, controls: 1, dnt: 1 };
        if (candidate.end && candidate.kind === 'youtube') params.end = candidate.end;
        for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
        player.src = url.href;
        player.onload = () => {
          if (active?.player !== player) return;
          if (candidate.kind === 'youtube') active.handshake = setInterval(() => { if (active?.player === player) player.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: candidate.id }), 'https://www.youtube.com'); }, 600);
          else for (const event of ['play','pause','ended','error']) player.contentWindow?.postMessage({ method: 'addEventListener', value: event }, 'https://player.vimeo.com');
        };
      }
      // Controls live below the player. Never cover provider controls or branding.
      playbackSlot.appendChild(player); playbackSlot.classList.add('trailer-playing'); binding.play.textContent = 'Ⅱ Pause';
      if (candidate.kind === 'file') active.controls = window.EnderloomVideoControls?.attach(player, { title: candidate.title, previewFrames: !reducedData() });
      active.timeout = setTimeout(() => { if (active?.player === player) stop('Provider did not start playback · open the source or try another trailer'); }, 18000);
      if (candidate.kind === 'file') await player.play();
    } catch (error) { if (ticket === serial) stop(`Playback unavailable · ${error.message || error}`); }
  }
  function schedule(binding) {
    if (active?.binding === binding || !allowed(binding, false)) return;
    stop(); warm(binding); const ticket = serial;
    timer = setTimeout(() => { if (ticket === serial) void start(binding); }, binding.context === 'detail' ? 450 : 350);
  }
  window.addEventListener('enderloom:media-play', event => { if (active?.player && active.player !== event.detail) stop('Another video started'); });
  window.addEventListener('message', event => {
    if (!active?.player || event.source !== active.player.contentWindow || !['https://www.youtube.com', 'https://player.vimeo.com'].includes(event.origin)) return;
    let data = event.data; try { if (typeof data === 'string') data = JSON.parse(data); } catch { return; }
    if (data.event === 'onError' || data.event === 'error') { stop('Provider restricted this video · open its source or choose another trailer'); return; }
    if (data.event === 'pause') { active.paused = true; active.binding.play.textContent = '▶ Resume'; }
    if (data.event === 'ended') { stop('Playback ended'); return; }
    if (data.event === 'onReady') { playerCommand('mute'); playerCommand('playVideo'); }
    if (data.event === 'onStateChange' || data.info?.playerState !== undefined || data.event === 'play') {
      const state = data.info?.playerState ?? data.info;
      if (state === 1 || data.event === 'play') { clearTimeout(active.timeout); active.paused = false; active.binding.play.textContent = 'Ⅱ Pause'; }
      if (state === 2) { active.paused = true; active.binding.play.textContent = '▶ Resume'; }
      if (state === 0) stop('Playback ended');
    }
  });
  async function explain(binding) {
    stop();
    const dialog = document.createElement('dialog'); dialog.className = 'trailer-dialog';
    const title = document.createElement('h2'); title.textContent = `Trailers · ${binding.project.title}`; dialog.append(title);
    const close = button('Close', () => { dialog.close(); dialog.remove(); }); dialog.append(close);
    const content = document.createElement('div'); content.textContent = 'Checking the exact project and its video sources…'; dialog.append(content); document.body.append(dialog); dialog.showModal();
    dialog.addEventListener('close', () => { bridge.trailers.cancel(binding.project).catch(() => {}); dialog.remove(); }, { once: true });
    async function render(force = false) {
      try {
        const result = await bridge.trailers.discover(binding.project, force); binding.result = result; content.replaceChildren();
        const explanation = document.createElement('p'); explanation.textContent = 'Project-linked trailers rank first, then verified author channels and vetted coverage. Corrections are remembered for this project.'; content.append(explanation);
        for (const candidate of result.candidates) {
          const row = document.createElement('section'), heading = document.createElement('h3'), why = document.createElement('p'), source = button('Open source ↗', () => bridge.openHere(candidate.url));
          heading.textContent = candidate.title; why.textContent = `${candidate.provenance.reason}. ${candidate.confidence == null ? 'Chosen by you' : `Match confidence ${candidate.confidence}/100 (heuristic)`}. ${candidate.author || ''}`;
          row.append(heading, why, source, button(result.selected?.id === candidate.id ? '✓ Selected' : 'Use this trailer', async () => { await bridge.trailers.choose(binding.project, { id: candidate.id }); await render(); }));
          const provenance = document.createElement('p'); provenance.className = 'trailer-provenance'; provenance.textContent = `Found on ${candidate.provenance.foundOn} · checked ${new Date(candidate.provenance.checkedAt).toLocaleString()}${candidate.end ? ` · verified segment ${candidate.start}–${candidate.end}s` : ''}`; row.append(provenance); content.append(row);
        }
        if (!result.candidates.length) { const p = document.createElement('p'); p.textContent = 'No trustworthy trailer found. The real project gallery stays in place.'; content.append(p); }
        if (result.failures.length || result.rejected.length) { const details = document.createElement('details'), summary = document.createElement('summary'); summary.textContent = 'Sources checked & rejected matches'; details.append(summary); for (const f of [...result.failures, ...result.rejected]) { const p = document.createElement('p'); p.textContent = `${f.stage || f.url}: ${f.message || f.reason}`; details.append(p); } content.append(details); }
        const input = document.createElement('input'); input.type = 'url'; input.placeholder = 'YouTube or Vimeo URL'; input.setAttribute('aria-label', 'Correct trailer URL');
        const error = document.createElement('p'); error.setAttribute('role', 'status');
        content.append(input, button('Use my trailer', async () => { try { await bridge.trailers.correct(binding.project, input.value); await render(); } catch (e) { error.textContent = e.message || String(e); } }), error,
          button('Gallery only for this mod', async () => { await bridge.trailers.choose(binding.project, { disabled: true }); dialog.close(); }),
          button('Reset my choice', async () => { await bridge.trailers.choose(binding.project, { reset: true }); await render(); }), button('Refresh sources', () => render(true)));
      } catch (e) { content.textContent = `Discovery unavailable: ${e.message || e}`; }
    }
    void render();
  }
  const observer = new IntersectionObserver(entries => { for (const entry of entries) { const binding = bindings.get(entry.target); if (!binding) continue; if (entry.intersectionRatio < .55) { if (active?.binding === binding) stop(); else if (binding.pending) bridge.trailers.cancel(binding.project).catch(() => {}); } else { if (warmed < 2 && allowed(binding, false)) { warmed++; warm(binding); } if (binding.context === 'detail') schedule(binding); } } }, { threshold: [.0, .55, 1] });
  function bind() {
    for (const [slot, binding] of bindings) if (!slot.isConnected) { if (active?.binding === binding) stop(); if (binding.pending) bridge.trailers.cancel(binding.project).catch(() => {}); observer.unobserve(slot); binding.bar.remove(); bindings.delete(slot); }
    document.querySelectorAll('.gallery-banner[data-project-url],.detail-gallery[data-project-url],.visual-tile [data-live-media-role="gallery"],[data-trailer-context]').forEach(slot => {
      if (bindings.has(slot) || !slot.dataset.projectUrl) return;
      const context = slot.dataset.trailerContext || (slot.classList.contains('detail-gallery') ? 'detail' : 'catalog');
      const binding = { slot, context, project: { url: slot.dataset.projectUrl, title: slot.dataset.projectTitle }, result: null };
      const bar = document.createElement('div'); bar.className = 'trailer-bar';
      const play = button('▶ Play', () => toggle(binding), `Play trailer for ${binding.project.title}`);
      const status = document.createElement('span'); status.className = 'trailer-status'; status.setAttribute('role', 'status'); status.textContent = 'Real project media';
      bar.append(play, status, button('Why this trailer?', () => explain(binding)));
      if (context === 'detail') slot.classList.add('trailer-slot');
      slot.after(bar); Object.assign(binding, { bar, play, status }); bindings.set(slot, binding); observer.observe(slot);
      const target = context === 'detail' ? slot.parentElement : slot.closest('.project-card,.visual-tile,.library-project-tile,.library-result-row') || slot;
      binding.target = target;
      target.addEventListener('pointerenter', event => { clearTimeout(binding.leaveTimer); binding.pointer = {x:event.clientX,y:event.clientY}; schedule(binding); });
      target.addEventListener('pointerleave', event => {
        if (binding.popup?.contains(event.relatedTarget)) return;
        binding.leaveTimer = setTimeout(() => { if (active?.binding === binding || timer) stop(); if (binding.pending) bridge.trailers.cancel(binding.project).catch(() => {}); }, binding.popup ? 140 : 0);
      });
      target.addEventListener('focusin', e => { if (!e.target.closest('.trailer-bar')) requestAnimationFrame(() => { if (target.contains(document.activeElement)) schedule(binding); }); });
      target.addEventListener('focusout', e => { if (!target.contains(e.relatedTarget) && !binding.popup?.contains(e.relatedTarget)) stop(); });
    });
  }
  async function preferences() {
    const dialog = document.createElement('dialog'); dialog.className = 'trailer-dialog';
    const h = document.createElement('h2'); h.textContent = 'Trailer playback'; dialog.append(h);
    for (const [key, label] of [['enabled', 'Enable trailer autoplay'], ['catalog', 'Play on Catalog hover or keyboard focus'], ['detail', 'Autoplay the project detail hero'], ['reducedData', 'Save data · manual playback only'], ['captions', 'Show captions when available']]) {
      const row = document.createElement('label'), input = document.createElement('input'); input.type = 'checkbox'; input.checked = prefs[key]; input.disabled = key === 'enabled' && !prefs.entitlement.autoplay;
      input.onchange = async () => { prefs = await bridge.trailers.settings({ [key]: input.checked }); stop(); }; row.append(input, document.createTextNode(label)); dialog.append(row);
    }
    const note = document.createElement('p'); note.textContent = 'Autoplay always begins muted. Reduced motion and slow/data-saving connections disable automatic playback. Provider players may use their own cookies and captions.'; dialog.append(note, button('Done', () => dialog.close())); document.body.append(dialog); dialog.addEventListener('close', () => dialog.remove(), { once: true }); dialog.showModal();
  }
  document.addEventListener('scroll', () => stop(), true);
  window.addEventListener('resize', () => stop());
  document.addEventListener('keydown', event => { if (event.key === 'Escape') stop(); });
  document.addEventListener('click', event => { if (event.target.closest('[data-trailer-settings]') && prefs) { event.preventDefault(); void preferences(); } });
  document.addEventListener('catalog:view-changing', () => { suspend(); warmed = 0; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) suspend(); });
  window.addEventListener('pagehide', () => suspend());
  window.addEventListener('blur', () => { if (document.activeElement !== active?.player) suspend(); });
  motion.addEventListener('change', () => suspend()); connection?.addEventListener('change', () => suspend());
  bridge.trailers.onStop(({ reason }) => { suspend(reason); if (reason === 'preferences changed') bridge.trailers.settings().then(value => { prefs = value; }); });
  bridge.trailers.onVisibility(value => { appVisible = value; if (!value) suspend(); });
  let bindFrame = 0;
  const mutations = new MutationObserver(() => { if (active && (!active.binding.slot.isConnected || active.binding.slot.closest('[hidden]'))) stop(); if (!bindFrame) bindFrame = requestAnimationFrame(() => { bindFrame = 0; bind(); }); });
  mutations.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
  bridge.trailers.settings().then(value => { prefs = value; const control = button('Trailer playback', preferences); control.className = 'button ghost'; document.querySelector('.toolbar-actions')?.append(control); bind(); }).catch(() => { window.__enderloomTrailersBound = false; });
})();
