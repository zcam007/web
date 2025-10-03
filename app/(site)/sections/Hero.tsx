'use client';
import { useEffect, useState } from 'react';
import Countdown from '../components/Countdown';
import { FadeIn, StaggerContainer, StaggerItem, TapScale } from '../components/AnimationWrappers';

export default function Hero({ data }: { data: any }) {
  const images: string[] = data.images ?? [];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i+1) % images.length), 4000);
    return () => clearInterval(t);
  }, [images.length]);
  return (
    <section className="relative h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt="hero"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i===idx?'opacity-100':'opacity-0'}`}
        />
      ))}
      <div className="absolute inset-0 bg-black/40" />
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-6xl animate-bounce opacity-60">💐</div>
      <div className="absolute top-20 right-16 text-5xl animate-pulse opacity-50">💕</div>
      <div className="absolute bottom-20 left-20 text-4xl animate-bounce opacity-40" style={{animationDelay: '0.5s'}}>🎀</div>
      <div className="absolute bottom-32 right-12 text-5xl animate-pulse opacity-50" style={{animationDelay: '1s'}}>✨</div>
      <StaggerContainer className="relative z-10 text-center text-white">
        <StaggerItem>
          <h1 className="text-5xl md:text-7xl font-display drop-shadow">{data.title}</h1>
        </StaggerItem>
        <StaggerItem>
          <p className="subtext mt-2">{data.subtitle}</p>
        </StaggerItem>
        <StaggerItem>
          <Countdown target={data.date} />
        </StaggerItem>
        <StaggerItem>
          <TapScale>
            <a href={data.ctaHref} className="btn btn-primary mt-6 inline-block">{data.ctaText}</a>
          </TapScale>
        </StaggerItem>
      </StaggerContainer>
    </section>
  );
}
