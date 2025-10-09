'use client';
import { useEffect, useState } from 'react';
import Countdown from '../components/Countdown';
import { StaggerContainer, StaggerItem, TapScale } from '../components/AnimationWrappers';
<style>
@import url('https://fonts.googleapis.com/css2?family=Tangerine:wght@400;700&display=swap');
</style>
type HeroImageInput = string | { url?: string; focusX?: number; focusY?: number };
type HeroImage = { url: string; focusX: number; focusY: number };

function clamp01(value: number | undefined, fallback = 50) {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.min(100, Math.max(0, value));
}

function normalizeImages(list: HeroImageInput[] | undefined): HeroImage[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => {
      if (typeof item === 'string') {
        return { url: item, focusX: 50, focusY: 50 };
      }
      const url = item?.url ?? '';
      if (!url) return null;
      return {
        url,
        focusX: clamp01(item?.focusX),
        focusY: clamp01(item?.focusY)
      };
    })
    .filter((item): item is HeroImage => item !== null);
}

export default function Hero({ data }: { data: any }) {
  const images = normalizeImages(data.images);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (images.length === 0) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 4000);
    return () => clearInterval(t);
  }, [images.length]);

  // Smart positioning logic: move text away from faces/focus area
  // Mobile: Only vertical (top/bottom)
  // Desktop: Full 2D positioning (corners, sides)
  const getTextPosition = (img: HeroImage) => {
    const { focusX, focusY } = img;
    
    // MOBILE: Simple vertical positioning (top or bottom)
    let mobilePosition = '';
    if (focusY < 40) {
      // Faces at top -> text at bottom
      mobilePosition = 'justify-end pb-8 sm:pb-16';
    } else if (focusY > 60) {
      // Faces at bottom -> text at top  
      mobilePosition = 'justify-start pt-8 sm:pt-16';
    } else {
      // Faces in middle -> text at bottom (safer)
      mobilePosition = 'justify-end pb-8 sm:pb-16';
    }
    
    // DESKTOP: 2D positioning based on focus quadrant
    let desktopPosition = '';
    
    // Determine quadrant and position text in opposite area
    if (focusY < 33) {
      // Top third
      if (focusX < 33) {
        // Top-left -> text bottom-right
        desktopPosition = 'md:justify-end md:items-end md:pb-16 md:pr-16';
      } else if (focusX > 66) {
        // Top-right -> text bottom-left
        desktopPosition = 'md:justify-start md:items-end md:pb-16 md:pl-16';
      } else {
        // Top-center -> text bottom-center
        desktopPosition = 'md:justify-center md:items-end md:pb-16';
      }
    } else if (focusY > 66) {
      // Bottom third
      if (focusX < 33) {
        // Bottom-left -> text top-right
        desktopPosition = 'md:justify-end md:items-start md:pt-16 md:pr-16';
      } else if (focusX > 66) {
        // Bottom-right -> text top-left
        desktopPosition = 'md:justify-start md:items-start md:pt-16 md:pl-16';
      } else {
        // Bottom-center -> text top-center
        desktopPosition = 'md:justify-center md:items-start md:pt-16';
      }
    } else {
      // Middle third vertically
      if (focusX < 40) {
        // Middle-left -> text right
        desktopPosition = 'md:justify-end md:items-center md:pr-16';
      } else if (focusX > 60) {
        // Middle-right -> text left
        desktopPosition = 'md:justify-start md:items-center md:pl-16';
      } else {
        // Center -> text bottom (safest)
        desktopPosition = 'md:justify-center md:items-end md:pb-16';
      }
    }
    
    return `${mobilePosition} ${desktopPosition}`;
  };

  const currentImage = images[idx] || { url: '', focusX: 50, focusY: 50 };
  const textPosition = getTextPosition(currentImage);

  return (
    <section className={`relative h-[100svh] min-h-[600px] flex flex-col overflow-hidden ${textPosition}`} style={{ transition: 'all 700ms ease-in-out' }}>
      {images.map((img, i) => (
        <img
          key={img.url}
          src={img.url}
          alt="hero"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
          style={{ objectPosition: `${img.focusX}% ${img.focusY}%` }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
      <StaggerContainer className="relative z-10 text-center text-white px-4 sm:px-8 md:px-10 py-6 sm:py-8 w-[calc(100%-2rem)] max-w-full sm:max-w-2xl md:max-w-3xl mx-auto rounded-2xl sm:rounded-3xl bg-black/25" style={{ backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
        <StaggerItem>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display drop-shadow-2xl leading-tight playwrite-de-grund-guides-regular" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)' }}>
            {data.title}
          </h1>
        </StaggerItem>
        <StaggerItem>
          <p className="text-lg sm:text-xl md:text-2xl mt-3 sm:mt-4 opacity-95 drop-shadow-lg" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            {data.subtitle}
          </p>
        </StaggerItem>
        <StaggerItem>
          <Countdown target={data.date} />
        </StaggerItem>
        <StaggerItem>
          <TapScale>
            <a 
              href={data.ctaHref} 
              className="btn btn-primary mt-6 sm:mt-8 inline-block text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 min-h-[48px] min-w-[120px]"
            >
              {data.ctaText}
            </a>
          </TapScale>
        </StaggerItem>
      </StaggerContainer>
    </section>
  );
}
