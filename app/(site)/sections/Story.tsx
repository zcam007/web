import { ScrollAnimation, ScrollStagger, StaggerItem } from '../components/AnimationWrappers';

export default function Story({ data }: { data: any }) {
  return (
    <section className="container py-16 bg-white/70 rounded-2xl my-10 relative overflow-hidden">
      {/* Background decorative pattern */}
      <div className="absolute top-0 right-0 text-9xl opacity-5">💕</div>
      <div className="absolute bottom-0 left-0 text-9xl opacity-5">💐</div>
      <ScrollAnimation className="text-center">
        <div className="inline-block">
          <div className="text-5xl mb-2">📖</div>
          <h2 className="section-title">{data.heading}</h2>
        </div>
      </ScrollAnimation>
      <ScrollStagger staggerDelay={0.2} className="mt-8 grid md:grid-cols-2 gap-6">
        {data.items?.map((it: any, i: number) => (
          <StaggerItem key={i} className="card">
            <div className="text-sm uppercase opacity-70">{it.year}</div>
            <div className="text-xl font-semibold mt-1">{it.title}</div>
            <p className="opacity-80 mt-2">{it.desc}</p>
          </StaggerItem>
        ))}
      </ScrollStagger>
    </section>
  );
}
