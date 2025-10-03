import { ScrollAnimation, ScrollStagger, StaggerItem, HoverScale } from '../components/AnimationWrappers';

export default function Events({ data }: { data: any }) {
  // Separate wedding events (Nov 24-26) from reception
  const weddingEvents = data.items?.filter((e: any) => 
    e.name !== 'Reception' && e.name !== 'reception'
  ) || [];
  
  const receptionEvent = data.items?.find((e: any) => 
    e.name === 'Reception' || e.name === 'reception'
  );

  return (
    <section className="container py-16 relative" id="events">
      {/* Decorative celebration elements */}
      <div className="absolute top-5 left-5 text-4xl opacity-20 animate-pulse">🎊</div>
      <div className="absolute top-5 right-5 text-4xl opacity-20 animate-pulse" style={{animationDelay: '0.5s'}}>🎉</div>
      
      <ScrollAnimation className="text-center mb-12">
        <div className="inline-block">
          <div className="text-5xl mb-2">🎪</div>
          <h2 className="section-title">{data.heading}</h2>
        </div>
      </ScrollAnimation>

      <div className="grid lg:grid-cols-2 gap-12 mt-12">
        {/* LEFT SIDE - Wedding Timeline (3 Days) */}
        <ScrollStagger staggerDelay={0.1} className="space-y-1">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-display font-bold text-gray-800 mb-2">Wedding Ceremonies</h3>
            <p className="text-lg text-gray-600">24th - 26th November, 2025</p>
            <p className="text-md text-gray-500 mt-1">SRINIDHI Joy 'n' Joy Clubs & Resorts, Ghatkesar</p>
          </div>

          {/* Timeline */}
          <div className="relative pl-8 space-y-8">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-300 via-purple-300 to-blue-300"></div>
            
            {weddingEvents.map((e: any, i: number) => {
              const icons = ['🪔', '🎵', '💛', '🎨', '💒'];
              const colors = ['from-pink-400 to-pink-600', 'from-purple-400 to-purple-600', 'from-yellow-400 to-yellow-600', 'from-orange-400 to-orange-600', 'from-red-400 to-red-600'];
              
              return (
                <StaggerItem key={i}>
                  <div className="relative">
                    {/* Timeline dot */}
                    <div className={`absolute -left-6 w-8 h-8 rounded-full bg-gradient-to-br ${colors[i] || 'from-pink-400 to-pink-600'} flex items-center justify-center shadow-lg ring-4 ring-white`}>
                      <span className="text-sm">{icons[i] || '🎉'}</span>
                    </div>
                    
                    {/* Event card */}
                    <HoverScale scale={1.02}>
                      <div className="card ml-6 bg-white hover:shadow-xl transition-all duration-300">
                        <div className="flex items-start gap-4">
                          {e.image && (
                            <div className="w-20 h-20 rounded-lg overflow-hidden shadow-md flex-shrink-0">
                              <img src={e.image} alt={e.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-800 mb-1">{e.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <span>🕐</span>
                              <span>{e.time}</span>
                            </div>
                            {e.description && (
                              <p className="text-sm text-gray-600 italic">{e.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </HoverScale>
                  </div>
                </StaggerItem>
              );
            })}
          </div>
        </ScrollStagger>

        {/* RIGHT SIDE - Reception */}
        {receptionEvent && (
          <ScrollAnimation delay={0.3}>
            <div className="sticky top-24">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-display font-bold text-gray-800 mb-2">Reception</h3>
                <p className="text-lg text-gray-600">30th November, 2025</p>
              </div>

              <HoverScale scale={1.02}>
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  {/* Reception Image */}
                  {receptionEvent.image ? (
                    <div className="relative h-[500px]">
                      <img 
                        src={receptionEvent.image} 
                        alt="Reception" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    </div>
                  ) : (
                    <div className="relative h-[500px] bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center">
                      <span className="text-9xl opacity-30">🥂</span>
                    </div>
                  )}
                  
                  {/* Reception Details Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <div className="text-6xl mb-4">🥂</div>
                    <h4 className="text-3xl font-bold mb-3">{receptionEvent.name}</h4>
                    <div className="space-y-2 text-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🕐</span>
                        <span>{receptionEvent.time}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">📍</span>
                        <span>{receptionEvent.place}</span>
                      </div>
                    </div>
                    {receptionEvent.description && (
                      <p className="text-lg mt-4 italic border-l-4 border-white/50 pl-4">
                        {receptionEvent.description}
                      </p>
                    )}
                  </div>
                </div>
              </HoverScale>
            </div>
          </ScrollAnimation>
        )}
      </div>
    </section>
  );
}
