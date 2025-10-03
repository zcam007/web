import { ScrollAnimation, ScrollStagger, StaggerItem, HoverScale } from '../components/AnimationWrappers';

export default function Events({ data }: { data: any }) {
  return (
    <section className="container py-16 relative" id="events">
      {/* Decorative celebration elements */}
      <div className="absolute top-5 left-5 text-4xl opacity-20 animate-pulse">🎊</div>
      <div className="absolute top-5 right-5 text-4xl opacity-20 animate-pulse" style={{animationDelay: '0.5s'}}>🎉</div>
      <ScrollAnimation className="text-center">
        <div className="inline-block">
          <div className="text-5xl mb-2">🎪</div>
          <h2 className="section-title">{data.heading}</h2>
        </div>
      </ScrollAnimation>
      <ScrollStagger staggerDelay={0.2} className="mt-12 space-y-16">
        {data.items?.map((e: any, i: number) => {
          const isEven = i % 2 === 0;
          const icons = ['🪔', '�', '💛', '�🎨', '💒', '🥂'];
          return (
            <StaggerItem key={i}>
              <div className={`grid md:grid-cols-2 gap-8 items-center ${!isEven ? 'md:flex-row-reverse' : ''}`}>
                {/* Image Column */}
                <div className={`${!isEven ? 'md:order-2' : ''}`}>
                  <HoverScale scale={1.03}>
                    <div className="relative rounded-2xl overflow-hidden shadow-xl">
                      {e.image ? (
                        <img 
                          src={e.image} 
                          alt={e.name} 
                          className="w-full h-[400px] object-cover"
                        />
                      ) : (
                        <div className="w-full h-[400px] bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <span className="text-8xl opacity-30">{icons[i] || '🎉'}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="text-5xl mb-2">{icons[i] || '🎉'}</div>
                      </div>
                    </div>
                  </HoverScale>
                </div>
                
                {/* Content Column */}
                <div className={`${!isEven ? 'md:order-1' : ''}`}>
                  <div className="card">
                    <div className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 text-accent font-semibold text-sm mb-4">
                      Event {i + 1}
                    </div>
                    <h3 className="text-4xl font-display font-bold mb-4 text-gray-800">
                      {e.name}
                    </h3>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-3 text-lg">
                        <span className="text-2xl">🕐</span>
                        <span className="font-medium">{e.time}</span>
                      </div>
                      <div className="flex items-start gap-3 text-lg">
                        <span className="text-2xl">📍</span>
                        <span className="opacity-80">{e.place}</span>
                      </div>
                    </div>
                    {e.description && (
                      <p className="text-lg opacity-80 leading-relaxed mt-4 border-l-4 border-primary/30 pl-4 italic">
                        {e.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </ScrollStagger>
    </section>
  );
}
