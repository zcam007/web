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
    <section className="container py-12 sm:py-16 relative" id="events">
      {/* Decorative celebration elements - hidden on mobile */}
      <div className="hidden sm:block absolute top-5 left-5 text-4xl opacity-20 animate-pulse">🎊</div>
      <div className="hidden sm:block absolute top-5 right-5 text-4xl opacity-20 animate-pulse" style={{animationDelay: '0.5s'}}>🎉</div>
      
      <ScrollAnimation className="text-center mb-8 sm:mb-12">
        <div className="inline-block">
          <div className="text-4xl sm:text-5xl mb-2">🎪</div>
          <h2 className="section-title">{data.heading}</h2>
        </div>
      </ScrollAnimation>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-8 sm:mt-12">
        {/* Wedding Timeline (3 Days) */}
        <ScrollStagger staggerDelay={0.1} className="space-y-1 lg:col-span-1">
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-2">Wedding Ceremonies</h3>
            <p className="text-base sm:text-lg text-gray-600">24th - 26th November, 2025</p>
            <p className="text-sm sm:text-md text-gray-500 mt-1 px-4">SRINIDHI Joy 'n' Joy Clubs & Resorts, Ghatkesar</p>
          </div>

          {/* Timeline - 2 columns on mobile */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-y-8">
            
            {weddingEvents.map((e: any, i: number) => {
              const icons = ['🪤', '🎵', '💛', '🎨', '💒'];
              const colors = ['from-pink-400 to-pink-600', 'from-purple-400 to-purple-600', 'from-yellow-400 to-yellow-600', 'from-orange-400 to-orange-600', 'from-red-400 to-red-600'];
              // Wedding Ceremony spans full width on mobile
              const isWeddingCeremony = e.name?.toLowerCase().includes('wedding');
              const colSpan = isWeddingCeremony ? 'col-span-2' : '';
              
              return (
                <StaggerItem key={i} className={`relative ${colSpan}`}>
                  <div className="relative h-full">
                    
                    {/* Event card */}
                    <HoverScale scale={1.02}>
                      <div className={`card bg-white hover:shadow-xl transition-all duration-300 h-full ${
                        isWeddingCeremony ? 'flex items-center gap-3 sm:gap-4' : ''
                      }`}>
                        {/* Icon badge */}
                        <div className={`flex justify-center ${isWeddingCeremony ? 'mb-0' : 'mb-3'} flex-shrink-0`}>
                          <div className={`${isWeddingCeremony ? 'w-14 h-14 sm:w-16 sm:h-16' : 'w-12 h-12'} rounded-full bg-gradient-to-br ${colors[i] || 'from-pink-400 to-pink-600'} flex items-center justify-center shadow-lg ring-4 ring-white/50`}>
                            <span className={`${isWeddingCeremony ? 'text-xl sm:text-2xl' : 'text-lg'}`}>{icons[i] || '🎉'}</span>
                          </div>
                        </div>
                        {e.image && !isWeddingCeremony && (
                          <div className="w-full h-28 sm:h-32 rounded-lg overflow-hidden shadow-md mb-3">
                            <img src={e.image} alt={e.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        {isWeddingCeremony && e.image && (
                          <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-lg overflow-hidden shadow-md flex-shrink-0">
                            <img src={e.image} alt={e.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className={`${isWeddingCeremony ? 'text-left flex-1 min-w-0' : 'text-center'}`}>
                          <h4 className={`${isWeddingCeremony ? 'text-base sm:text-lg md:text-xl' : 'text-base sm:text-lg'} font-bold text-gray-800 mb-1 sm:mb-2`}>
                            {e.name}
                          </h4>
                          <div className={`flex items-center ${isWeddingCeremony ? 'justify-start' : 'justify-center'} gap-1 text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2`}>
                            <span>🕐</span>
                            <span className="leading-relaxed">{e.time}</span>
                          </div>
                          {e.place && isWeddingCeremony && (
                            <div className="flex items-start justify-start gap-1 text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                              <span className="flex-shrink-0">📍</span>
                              <span className="leading-relaxed">{e.place}</span>
                            </div>
                          )}
                          {e.description && (
                            <p className={`text-xs sm:text-sm text-gray-600 italic leading-relaxed ${
                              isWeddingCeremony ? 'line-clamp-2 sm:line-clamp-none' : 'hidden sm:block'
                            }`}>
                              {e.description}
                            </p>
                          )}
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
            <div className="lg:sticky lg:top-24">
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-2">Reception</h3>
                <p className="text-base sm:text-lg text-gray-600">30th November, 2025</p>
              </div>

              <HoverScale scale={1.02}>
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  {/* Reception Image */}
                  {receptionEvent.image ? (
                    <div className="relative h-[400px] sm:h-[500px]">
                      <img 
                        src={receptionEvent.image} 
                        alt="Reception" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    </div>
                  ) : (
                    <div className="relative h-[400px] sm:h-[500px] bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center">
                      <span className="text-7xl sm:text-9xl opacity-30">🥂</span>
                    </div>
                  )}
                  
                  {/* Reception Details Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 text-white">
                    <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🥂</div>
                    <h4 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">{receptionEvent.name}</h4>
                    <div className="space-y-2 text-base sm:text-lg">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xl sm:text-2xl">🕐</span>
                        <span className="leading-relaxed">{receptionEvent.time}</span>
                      </div>
                      <div className="flex items-start gap-2 sm:gap-3">
                        <span className="text-xl sm:text-2xl flex-shrink-0">📍</span>
                        <span className="leading-relaxed">{receptionEvent.place}</span>
                      </div>
                    </div>
                    {receptionEvent.description && (
                      <p className="text-sm sm:text-lg mt-3 sm:mt-4 italic border-l-4 border-white/50 pl-3 sm:pl-4 leading-relaxed">
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