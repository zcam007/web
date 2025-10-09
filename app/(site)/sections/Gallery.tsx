import { ScrollAnimation, ScrollStagger, StaggerItem, HoverScale } from '../components/AnimationWrappers';
import { fetchImmichAlbumAssets, getImmichConfigStatus } from '../lib/immich';

type GalleryMode = 'local' | 'immich' | 'hybrid';

type GalleryData = {
  heading: string;
  images?: string[];
  mode?: GalleryMode;
  immich?: {
    albums?: string[];
    limit?: number;
    randomize?: boolean;
    hiddenAssets?: string[];
  };
};

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default async function Gallery({ data }: { data: GalleryData }) {
  const mode: GalleryMode = data.mode ?? (data.immich?.albums?.length ? 'hybrid' : 'local');
  const localImages = Array.isArray(data.images) ? data.images : [];

  let immichImages: string[] = [];
  const immichConfig = getImmichConfigStatus();

  if (mode !== 'local' && immichConfig.configured && data.immich?.albums?.length) {
    const albums = data.immich.albums.filter(Boolean);
    const limit = Math.max(1, Math.min(200, data.immich.limit ?? 60));
    const perAlbum = Math.max(1, Math.ceil(limit / albums.length));
    const hiddenAssets = Array.isArray(data.immich.hiddenAssets) ? data.immich.hiddenAssets : [];

    const albumResults = await Promise.allSettled(
      albums.map((albumId) => fetchImmichAlbumAssets(albumId, perAlbum))
    );

    const combined = albumResults.flatMap((result) =>
      result.status === 'fulfilled'
        ? result.value
            .filter((asset) => !hiddenAssets.includes(asset.id)) // Filter out hidden assets
            .map((asset) => asset.thumbUrl || asset.originalUrl)
        : []
    );

    const uniqueRemote = Array.from(new Set(combined));
    immichImages = data.immich.randomize === false
      ? uniqueRemote.slice(0, limit)
      : shuffle(uniqueRemote).slice(0, limit);
  }

  let merged: string[] = [];
  if (mode === 'immich') {
    merged = immichImages;
  } else if (mode === 'local') {
    merged = localImages;
  } else {
    merged = [...immichImages, ...localImages];
  }

  if (data.immich?.randomize !== false && mode === 'hybrid') {
    merged = shuffle(merged);
  }

  const displayImages = merged.length > 0 ? merged : localImages;

  return (
    <section className="relative py-12 sm:py-20 lg:py-24" id="gallery">
      <div className="container mx-auto px-4">
        <div className="glass-panel p-6 sm:p-10 lg:p-14">
          <div className="relative">
            <ScrollAnimation className="text-center">
              <div className="inline-flex flex-col items-center gap-1">
                <div className="text-4xl sm:text-5xl mb-2">🖼️</div>
                <h2 className="section-title">{data.heading}</h2>
                {mode !== 'local' && immichConfig.configured && (
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-60">
                    Synced with Immich
                  </p>
                )}
              </div>
            </ScrollAnimation>

            {displayImages.length > 0 ? (
              <ScrollStagger
                staggerDelay={0.08}
                className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-2 sm:gap-4 lg:gap-5 mt-8 sm:mt-10 [column-fill:_balance]"
              >
                {displayImages.map((src, i) => (
                  <StaggerItem key={`${src}-${i}`} className="mb-2 sm:mb-4 break-inside-avoid">
                    <HoverScale scale={1.025}>
                      <div className="relative overflow-hidden rounded-lg sm:rounded-2xl bg-white/40 backdrop-blur border border-white/30 shadow-lg">
                        <img
                          src={src}
                          alt={`gallery ${i + 1}`}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.05]"
                          loading="lazy"
                        />
                      </div>
                    </HoverScale>
                  </StaggerItem>
                ))}
              </ScrollStagger>
            ) : (
              <div className="mt-8 sm:mt-10 text-center text-sm opacity-70 px-4">
                No photos yet. Add uploads or connect an Immich shared album from the admin panel.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
