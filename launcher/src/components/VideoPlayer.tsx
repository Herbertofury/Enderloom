import { useEffect, useRef } from 'react';
import '../../../catalog/video-controls.js';
import '../../../catalog/video-controls.css';

declare global {
  interface Window { EnderloomVideoControls: { attach(video: HTMLVideoElement, options?: { container?: HTMLElement; title?: string; previewFrames?: boolean }): { destroy(): void } } }
}

export function VideoPlayer({ src, title, poster }: { src: string; title: string; poster?: string }) {
  const video = useRef<HTMLVideoElement>(null), host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = video.current!, container = host.current!;
    media.src = src;
    const controls = window.EnderloomVideoControls.attach(media, { container, title });
    return () => { controls.destroy(); media.removeAttribute('src'); media.load(); };
  }, [src, title]);
  return <div ref={host}><video ref={video} controls preload="metadata" src={src} poster={poster} aria-label={title} /></div>;
}
