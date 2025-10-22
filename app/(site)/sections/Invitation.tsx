import { ScrollAnimation, FadeIn } from '../components/AnimationWrappers';

type ImageWithFocus = string | { url: string; focusX?: number; focusY?: number; zoom?: number };

function normalizeImage(item: ImageWithFocus): { url: string; focusX: number; focusY: number; zoom: number } {
  if (!item) return { url: '', focusX: 50, focusY: 50, zoom: 1 };
  if (typeof item === 'string') {
    return { url: item, focusX: 50, focusY: 50, zoom: 1 };
  }
  return {
    url: item.url || '',
    focusX: typeof item.focusX === 'number' ? Math.min(100, Math.max(0, item.focusX)) : 50,
    focusY: typeof item.focusY === 'number' ? Math.min(100, Math.max(0, item.focusY)) : 50,
    zoom: typeof item.zoom === 'number' ? Math.min(3, Math.max(0.5, item.zoom)) : 1,
  };
}

export default function Invitation({ data }: { data: any }) {
  const image = normalizeImage(data.image);
  
  return (
    <section className="relative py-32 overflow-hidden" id="invitation">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: image.url ? `url(${image.url})` : 'linear-gradient(135deg, rgba(199, 154, 109, 0.3), rgba(156, 106, 67, 0.3))',
          backgroundPosition: `${image.focusX}% ${image.focusY}%`,
          backgroundSize: image.zoom !== 1 ? `${image.zoom * 100}%` : 'cover',
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Decorative floating elements */}
      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-pulse text-white">💕</div>
      <div className="absolute bottom-10 right-10 text-6xl opacity-20 animate-pulse text-white" style={{animationDelay: '0.5s'}}>💐</div>
      <div className="absolute top-20 right-20 text-5xl opacity-15 animate-bounce text-white">✨</div>
      <div className="absolute bottom-20 left-20 text-5xl opacity-15 animate-bounce text-white" style={{animationDelay: '0.7s'}}>🎊</div>

      {/* Content */}
      <div className="container relative z-10">
        <ScrollAnimation className="text-center text-white max-w-3xl mx-auto">
          {data.hashtag && (
            <FadeIn delay={0.2}>
              <div className="text-5xl md:text-6xl font-display font-bold mb-6 drop-shadow-lg">
                {data.hashtag}
              </div>
            </FadeIn>
          )}
          
          {data.heading && (
            <FadeIn delay={0.4}>
              <h2 className="text-3xl md:text-5xl font-semibold mb-6 text-white drop-shadow-lg">
                {data.heading}
              </h2>
            </FadeIn>
          )}
          
          {data.message && (
            <FadeIn delay={0.6}>
              <p className="text-xl md:text-2xl leading-relaxed mb-8 drop-shadow-md">
                {data.message}
              </p>
            </FadeIn>
          )}

          {data.dates && (
            <FadeIn delay={0.8}>
              <div className="inline-block px-8 py-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-xl">
                <p className="text-2xl font-semibold">
                  {data.dates}
                </p>
              </div>
            </FadeIn>
          )}

          {data.ctaText && data.ctaHref && (
            <FadeIn delay={1}>
              <a 
                href={data.ctaHref}
                className="inline-block mt-8 px-8 py-4 bg-white text-accent rounded-full font-semibold text-lg shadow-2xl hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                {data.ctaText}
              </a>
            </FadeIn>
          )}

          {data.note && (
            <FadeIn delay={1.2}>
              <p className="text-lg mt-8 opacity-90 drop-shadow-md italic">
                {data.note}
              </p>
            </FadeIn>
          )}
        </ScrollAnimation>
      </div>
    </section>
  );
}
