import { ScrollAnimation, FadeIn } from '../components/AnimationWrappers';

export default function Map({ data }: { data: any }) {
  return (
    <section className="container py-16 relative" id="venue">
      {/* Decorative location elements */}
      <div className="absolute top-5 left-10 text-4xl opacity-15">🏛️</div>
      <div className="absolute top-5 right-10 text-4xl opacity-15">🗺️</div>
      <ScrollAnimation className="text-center">
        <div className="inline-block">
          <div className="text-5xl mb-2">📍</div>
          <h2 className="section-title">{data.heading}</h2>
        </div>
      </ScrollAnimation>
      <FadeIn delay={0.3} className="mt-6 rounded-2xl overflow-hidden shadow-sm">
        <iframe src={data.embed} className="w-full h-[400px]" loading="lazy"></iframe>
      </FadeIn>
    </section>
  );
}
