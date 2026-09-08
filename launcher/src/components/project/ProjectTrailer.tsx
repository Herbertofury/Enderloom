import type { ProjectDetails, SearchProvider } from '../../lib/types';
import '../../../../catalog/trailers.js';
import '../../../../catalog/trailers.css';

export function ProjectTrailer({ details, provider }: { details: ProjectDetails; provider: SearchProvider }) {
  const url = details.website_url || (provider === 'modrinth' ? `https://modrinth.com/project/${details.id}` : null);
  const poster = details.gallery.find(image => image.featured)?.url || details.gallery[0]?.url;
  if (!url) return null;
  return <section className="relative mx-6 mb-5 overflow-hidden rounded-xl border border-border-soft" aria-label={`${details.title} media`} key={url}>
    <div className="flex items-center justify-between bg-surface-2 px-4 py-2 text-xs text-content-muted"><span>Project media</span><button type="button" data-trailer-settings className="hover:text-content">Trailer preferences</button></div>
    <div className="detail-gallery" data-trailer-context="detail" data-project-url={url} data-project-title={details.title}>
      {poster ? <img className="live-media-image h-full w-full object-cover" src={poster} alt={`${details.title} project screenshot`} loading="lazy" /> : <p className="p-8 text-sm text-content-muted">Check this project’s verified trailers and media.</p>}
    </div>
  </section>;
}
