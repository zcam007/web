import { ScrollAnimation, SlideInLeft, SlideInRight, HoverScale } from '../components/AnimationWrappers';

type ImageWithFocus = string | { url: string; focusX?: number; focusY?: number; zoom?: number };

function normalizeImage(item: ImageWithFocus): { url: string; focusX: number; focusY: number; zoom: number } {
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

export default function Couple({ data }: { data: any }) {
  const image = normalizeImage(data.image);
  return (
    <section className="container py-16 relative" id="couple">
      {/* Decorative hearts */}
      <div className="absolute top-0 left-0 text-4xl opacity-20">💝</div>
      <div className="absolute top-10 right-10 text-3xl opacity-15">💗</div>
      <ScrollAnimation className="text-center">
        <div className="inline-block">
          <div className="text-5xl mb-2">💑</div>
          <h2 className="section-title">{data.heading}</h2>
        </div>
      </ScrollAnimation>
      <div className="grid md:grid-cols-2 gap-8 items-center mt-8">
        <SlideInLeft delay={0.2}>
          <HoverScale>
            <img 
              src={image.url} 
              alt="couple" 
              className="rounded-2xl shadow-md w-full object-cover max-h-[450px]" 
              style={{ 
                objectPosition: `${image.focusX}% ${image.focusY}%`,
                transform: `scale(${image.zoom})`
              }}
            />
          </HoverScale>
        </SlideInLeft>
        <SlideInRight delay={0.4} className="space-y-6">
          <ScrollAnimation delay={0.6} className="card">
            <h3 className="text-2xl font-semibold">{data.bride?.name}</h3>
            <p className="opacity-80">{data.bride?.bio}</p>
          </ScrollAnimation>
          <ScrollAnimation delay={0.8} className="card">
            <h3 className="text-2xl font-semibold">{data.groom?.name}</h3>
            <p className="opacity-80">{data.groom?.bio}</p>
          </ScrollAnimation>
        </SlideInRight>
      </div>
    </section>
  );
}
