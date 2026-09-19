# Shared video controls — 2026-09-18

Test recordings, direct-file trailers and Catalog gallery videos now use one shared native-video control implementation. YouTube/Vimeo embeds retain their provider controls and restrictions.

Included: stable timeline-hover frame decoding from the actual video, seek/time readout, keyboard controls, skip controls, volume/mute, playback speed, available text tracks, fullscreen with Escape exit, and Chromium picture-in-picture. Hover decoding is lazy, uses a single auxiliary decoder, and is released on pointer exit, source changes, errors, hidden views and destruction. Reduced-motion/data users retain timestamp previews without starting that decoder. Only one controlled native video plays per renderer. Explicit picture-in-picture can continue offscreen; closed/unmounted players pause and exit picture-in-picture.

`scripts/video-controls-ui-qa.js` passed in real Electron against Aether test `cfbe854f-5b91-4e1b-97d1-dc332c28614d` (`playback.mp4`, 107 seconds): decoded nonblank hover frame at 1:15, late-file seek, skip, keyboard play/pause, speed/mute, real picture-in-picture enter/exit, fullscreen enter/Escape exit, single active video, reduced-motion fallback, teardown and missing-file error. Visual evidence: `output/playwright/aether-video-hover.png`.

The real YouTube trailer runtime suite still passed with muted playback and clean teardown. Catalog QA and frontend build passed. These changes do not fabricate provider thumbnails, bypass iframe restrictions, or certify every third-party codec/provider.
