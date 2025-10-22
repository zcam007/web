'use client';
import { ScrollAnimation, FadeIn } from '../components/AnimationWrappers';

type LiveLink = {
  label: string;
  url: string;
  icon?: string;
};

// Helper function to ensure URLs are embed-friendly
function ensureEmbedUrl(url: string): string {
  if (!url) return url;
  
  // YouTube conversions
  const youtubeWatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (youtubeWatch && youtubeWatch[1]) {
    return `https://www.youtube.com/embed/${youtubeWatch[1]}`;
  }
  
  const youtubeLive = url.match(/youtube\.com\/live\/([^&\s]+)/);
  if (youtubeLive && youtubeLive[1]) {
    return `https://www.youtube.com/embed/${youtubeLive[1]}`;
  }
  
  // Facebook conversions
  const fbVideo = url.match(/facebook\.com\/.*\/videos\/(\d+)/);
  if (fbVideo && fbVideo[1]) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}`;
  }
  
  return url;
}

export default function WeddingLive({ data }: { data: any }) {
  const mode = data.mode || 'links'; // 'links' or 'iframe'
  const links: LiveLink[] = data.links || [];
  const iframeUrl = ensureEmbedUrl(data.iframeUrl || '');
  const heading = data.heading || 'Watch Live';
  const description = data.description || '';

  return (
    <section className="container py-16 relative" id="wedding-live">
      {/* Decorative elements */}
      <div className="absolute top-5 left-10 text-4xl opacity-15">📹</div>
      <div className="absolute top-5 right-10 text-4xl opacity-15">🎥</div>
      
      <ScrollAnimation className="text-center">
        <div className="inline-block">
          <div className="text-5xl mb-2">🎬</div>
          <h2 className="section-title">{heading}</h2>
          {description && (
            <p className="text-lg opacity-80 mt-3 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
      </ScrollAnimation>

      {mode === 'iframe' && iframeUrl ? (
        <FadeIn delay={0.3} className="mt-8">
          <div className="rounded-2xl overflow-hidden shadow-lg bg-black max-w-4xl mx-auto">
            <div className="relative" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={iframeUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                loading="lazy"
                title="Wedding Live Stream"
              />
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              Having trouble viewing? <a href={iframeUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Open in new tab</a>
            </p>
          </div>
        </FadeIn>
      ) : mode === 'iframe' ? (
        <FadeIn delay={0.3} className="mt-8">
          <div className="text-center text-gray-500 py-8">
            <p className="text-lg">Stream embed URL not configured yet. Check back soon! ✨</p>
          </div>
        </FadeIn>
      ) : (
        <FadeIn delay={0.3} className="mt-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {links.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-[2px] hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="bg-white rounded-xl p-6 h-full flex flex-col items-center justify-center text-center space-y-3 group-hover:bg-opacity-95 transition-all">
                  {link.icon && (
                    <div className="text-4xl group-hover:scale-110 transition-transform">
                      {link.icon}
                    </div>
                  )}
                  <div className="font-semibold text-lg bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {link.label}
                  </div>
                  <div className="text-sm text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to watch →
                  </div>
                </div>
              </a>
            ))}
          </div>
          {links.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p className="text-lg">No live links available yet. Check back soon! ✨</p>
            </div>
          )}
        </FadeIn>
      )}

      {/* Additional info */}
      {mode === 'links' && links.length > 0 && (
        <FadeIn delay={0.5} className="text-center mt-6">
          <p className="text-sm text-gray-600 opacity-70">
            💝 Choose your preferred platform to join the celebration
          </p>
        </FadeIn>
      )}
    </section>
  );
}
