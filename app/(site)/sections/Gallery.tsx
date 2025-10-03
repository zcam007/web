import { ScrollAnimation, ScrollStagger, StaggerItem, HoverScale } from '../components/AnimationWrappers';

export default function Gallery({ data }: { data: any }) {
  const images: string[] = data.images ?? [];
  return (
    <section className="container py-16 relative" id="gallery">
      {/* Decorative camera elements */}
      <div className="absolute top-0 left-10 text-4xl opacity-15">📸</div>
      <div className="absolute top-0 right-10 text-4xl opacity-15">🌸</div>
      <ScrollAnimation className="text-center">
        <div className="inline-block">
          <div className="text-5xl mb-2">🖼️</div>
          <h2 className="section-title">{data.heading}</h2>
        </div>
      </ScrollAnimation>
      <ScrollStagger staggerDelay={0.1} className="columns-2 md:columns-3 gap-4 mt-8 [column-fill:_balance]">
        {images.map((src, i) => (
          <StaggerItem key={i} className="mb-4 break-inside-avoid">
            <HoverScale scale={1.02}>
              <img src={src} alt="gallery" className="w-full rounded-xl shadow-sm" />
            </HoverScale>
          </StaggerItem>
        ))}
      </ScrollStagger>
    </section>
  );
}
