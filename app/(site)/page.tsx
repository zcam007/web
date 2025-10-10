import { readConfig } from './lib/config';
import Hero from './sections/Hero';
import Couple from './sections/Couple';
import Story from './sections/Story';
import Events from './sections/Events';
import Gallery from './sections/Gallery';
import RSVP from './sections/RSVP';
import Map from './sections/Map';
import Invitation from './sections/Invitation';
import InvitationHero from './sections/InvitationHero';
import Script from 'next/script'

export default async function Page() {
  const cfg = await readConfig();
  return (
    <main>
            <Script src="https://metrics.chandu.dev/script.js" data-website-id="9f5dcb8e-3ba6-4a8d-a9bb-e160448f64a3" />

      <Hero data={cfg.hero} />
      {cfg.sections.map((sec: any, i: number) => {
        // Skip hidden sections
        if (sec.visible === false) return null;
        
        if (sec.type === 'couple') return <Couple key={i} data={sec} />;
        if (sec.type === 'story') return <Story key={i} data={sec} />;
        if (sec.type === 'events') return <Events key={i} data={sec} />;
        if (sec.type === 'gallery') return <Gallery key={i} data={sec} />;
        if (sec.type === 'rsvp') return <RSVP key={i} data={sec} />;
        if (sec.type === 'map') return <Map key={i} data={sec} />;
        if (sec.type === 'invitation') return <Invitation key={i} data={sec} />;
        if (sec.type === 'invitation-hero') return <InvitationHero key={i} data={sec} />;
        return null;
      })}
      <footer className="container py-10 text-center relative">
        <div className="flex justify-center gap-3 text-3xl mb-4 opacity-60">
          <span className="animate-pulse">💕</span>
          <span className="animate-bounce" style={{animationDelay: '0.2s'}}>💍</span>
          <span className="animate-pulse" style={{animationDelay: '0.4s'}}>💐</span>
          <span className="animate-bounce" style={{animationDelay: '0.6s'}}>🎊</span>
          <span className="animate-pulse" style={{animationDelay: '0.8s'}}>💕</span>
        </div>
        <p className="opacity-70">{cfg.footer.text}</p>
      </footer>
    </main>
  );
}
