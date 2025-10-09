import { ScrollAnimation, FadeIn, ScaleIn } from '../components/AnimationWrappers';

export default function InvitationHero({ data }: { data: any }) {
  return (
    <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden" id="invitation-hero">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-pink-50/30 to-white"></div>
      
      <div className="container relative z-10">
        {/* Heading */}
        <ScrollAnimation className="text-center mb-12 sm:mb-16 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-light tracking-wide flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <span className="text-red-400">Inviting You With Love</span>
            <span className="hidden sm:inline text-gray-400">—</span>
            <span className="text-red-400 font-semibold">{data.hashtag || '#MoCHA'}</span>
          </h2>
        </ScrollAnimation>

        {/* Circular Images */}
        <div className="grid md:grid-cols-2 gap-16 sm:gap-20 md:gap-12 max-w-5xl mx-auto items-center justify-items-center px-4">
          {/* Left Circle - Groom */}
          <FadeIn delay={0.3}>
            <ScaleIn delay={0.4}>
              <div className="relative group w-full flex justify-center">
                <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden shadow-2xl border-4 sm:border-8 border-white ring-2 sm:ring-4 ring-blue-100 transition-all duration-500 group-hover:scale-105 group-hover:ring-blue-200">
                  {data.groomImage ? (
                    <img 
                      src={data.groomImage} 
                      alt={data.groomName || "Groom"} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-200 to-indigo-200 flex items-center justify-center">
                      <span className="text-8xl">🤵</span>
                    </div>
                  )}
                </div>
                {data.groomName && (
                  <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <div className="bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg border-2 border-blue-100">
                      <p className="text-lg sm:text-xl md:text-2xl font-display font-semibold text-gray-800">{data.groomName}</p>
                    </div>
                  </div>
                )}
              </div>
            </ScaleIn>
          </FadeIn>

          {/* Right Circle - Bride */}
          <FadeIn delay={0.5}>
            <ScaleIn delay={0.6}>
              <div className="relative group w-full flex justify-center">
                <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden shadow-2xl border-4 sm:border-8 border-white ring-2 sm:ring-4 ring-pink-100 transition-all duration-500 group-hover:scale-105 group-hover:ring-pink-200">
                  {data.brideImage ? (
                    <img 
                      src={data.brideImage} 
                      alt={data.brideName || "Bride"} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-200 to-red-200 flex items-center justify-center">
                      <span className="text-8xl">👰</span>
                    </div>
                  )}
                </div>
                {data.brideName && (
                  <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <div className="bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg border-2 border-pink-100">
                      <p className="text-lg sm:text-xl md:text-2xl font-display font-semibold text-gray-800">{data.brideName}</p>
                    </div>
                  </div>
                )}
              </div>
            </ScaleIn>
          </FadeIn>
        </div>

        {/* Optional Message Below */}
        {data.message && (
          <FadeIn delay={0.8} className="text-center mt-16 sm:mt-20 md:mt-24 px-4">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {data.message}
            </p>
          </FadeIn>
        )}

        {/* Optional Date Info */}
        {data.date && (
          <FadeIn delay={1} className="text-center mt-6 sm:mt-8 px-4">
            <div className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-pink-50 to-blue-50 rounded-full shadow-md">
              <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-700">
                {data.date}
              </p>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
