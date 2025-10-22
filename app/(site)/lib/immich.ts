const IMMICH_BASE_URL = process.env.IMMICH_BASE_URL?.replace(/\/$/, '') || '';
const IMMICH_API_KEY = process.env.IMMICH_API_KEY || '';

export interface ImmichAlbumSummary {
  id: string;
  name: string;
  description?: string;
  assetCount: number;
  createdAt?: string;
  shareId?: string;
  shareKey?: string;
  albumId?: string;
}

export interface ImmichAsset {
  id: string;
  originalUrl: string;
  thumbUrl: string;
  fullUrl?: string;
}

class ImmichRequestError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string) {
    super(`Immich request failed (${status}): ${body}`);
    this.name = 'ImmichRequestError';
    this.status = status;
    this.body = body;
  }
}

function assertConfigured() {
  if (!IMMICH_BASE_URL || !IMMICH_API_KEY) {
    throw new Error('Immich integration not configured. Please set IMMICH_BASE_URL and IMMICH_API_KEY.');
  }
}

async function immichRequest(endpoint: string, init: RequestInit = {}): Promise<Response> {
  assertConfigured();
  const res = await fetch(`${IMMICH_BASE_URL}${endpoint}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-api-key': IMMICH_API_KEY,
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new ImmichRequestError(res.status, text);
  }

  return res;
}

async function immichFetch<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
  const res = await immichRequest(endpoint, init);
  return res.json() as Promise<T>;
}

// NOTE: Immich shared links endpoint returns objects where:
//  - id: the UUID of the shared link (we treat this as shareId)
//  - key: the public share key (string used in public URLs)
// Some earlier code overloaded "id" with key. We separate them cleanly now.
type SharedLinkDto = {
  id: string;            // shareId (UUID)
  key?: string;          // shareKey (public token)
  description: string | null;
  name: string | null;
  createdAt: string;
  type: string;          // expect 'ALBUM' for album shares
  assetCount?: number;   // MAY be 0 even when album has assets (lazy computation)
  albumId?: string | null; // references underlying album
  album?: {
    id: string;
    albumName?: string | null;
    description?: string | null;
    assetCount?: number;
  } | null;
};

type SharedLinkDetailDto = {
  id: string;
  key?: string;
  albumId?: string | null;
  assets?: { id: string }[];
  assetCount?: number;
};

async function fetchSharedLinkDetail(link: SharedLinkDto): Promise<number> {
  const albumId = link.album?.id ?? link.albumId;
  
  // Skip the shared link detail endpoint - it requires public key auth and gives 403 with API key
  // Go directly to the album assets endpoint since we have the albumId
  if (albumId) {
    try {
      // console.log('[Immich] Fetching album assets directly for albumId:', albumId);
      const { total } = await fetchAlbumAssets(albumId, 1);
      console.log('[Immich] Album assets total:', total);
      return total;
    } catch (err) {
      console.log('[Immich] Error fetching album assets:', err);
      return 0;
    }
  }
  
  // If no albumId, try the shared link detail endpoint (though it may 403)
  try {
    const query = link.key ? `?key=${encodeURIComponent(link.key)}` : '';
    // console.log('[Immich] Trying shared link detail for id:', link.id, 'key:', link.key);
    const detail = await immichFetch<SharedLinkDetailDto>(`/api/shared-links/${link.id}${query}`);
    // console.log('[Immich] Shared link detail response:', JSON.stringify(detail, null, 2));
    if (typeof detail.assetCount === 'number' && detail.assetCount > 0) {
      return detail.assetCount;
    }
    const derived = Array.isArray(detail.assets) ? detail.assets.length : 0;
    return derived;
  } catch (error) {
    console.log('[Immich] Error in fetchSharedLinkDetail (expected if using API key):', error instanceof ImmichRequestError ? `${error.status}` : error);
    if (error instanceof ImmichRequestError && error.status < 500) {
      return 0;
    }
    throw error;
  }
}

function parseAssetCountFromHeaders(res: Response, fallback: number): number {
  const candidates = [
    res.headers.get('x-total-count'),
    res.headers.get('x-total'),
    res.headers.get('x-immich-total'),
  ];
  const parsed = candidates
    .map((value) => (value ? Number.parseInt(value, 10) : Number.NaN))
    .find((value) => Number.isFinite(value) && value >= 0);
  return Number.isFinite(parsed) ? (parsed as number) : fallback;
}

type SharedLinkAssetDto = {
  asset: {
    id: string;
    originalFileName?: string;
  };
  previewImagePath?: string;
  originalPath?: string;
  webpPath?: string;
  resizePath?: string;
  thumbPath?: string;
  key?: string;
};

type AlbumAssetDto = {
  id: string;
  originalPath?: string;
  previewPath?: string;
  resizePath?: string;
  webpPath?: string;
  thumbPath?: string;
};

function mapToImmichAssets(payload: SharedLinkAssetDto[] | AlbumAssetDto[], opts: {
  type: 'shared' | 'album';
  identifier: string;
}): ImmichAsset[] {
  if (opts.type === 'shared') {
    return (payload as SharedLinkAssetDto[]).reduce<ImmichAsset[]>((acc, item) => {
      // Use proxy endpoints to avoid CORS and authentication issues in the browser
      const assetId = item.asset.id;
      const originalUrl = `/api/immich/assets/${assetId}/original`;
      // Use preview size for better quality (Immich converts to browser-compatible format)
      const thumbUrl = `/api/immich/assets/${assetId}/thumbnail?size=preview`;
      
      acc.push({
        id: assetId,
        originalUrl,
        thumbUrl,
        fullUrl: `${IMMICH_BASE_URL}/share/${item.key || opts.identifier}?assetId=${assetId}`,
      });
      return acc;
    }, []);
  }

  return (payload as AlbumAssetDto[]).reduce<ImmichAsset[]>((acc, item) => {
    // Use proxy endpoints to avoid CORS and authentication issues in the browser
    const assetId = item.id;
    const originalUrl = `/api/immich/assets/${assetId}/original`;
    // Use preview size for better quality (Immich converts to browser-compatible format)
    const thumbUrl = `/api/immich/assets/${assetId}/thumbnail?size=preview`;
    
    acc.push({
      id: assetId,
      originalUrl,
      thumbUrl,
      fullUrl: `${IMMICH_BASE_URL}/albums/${opts.identifier}?assetId=${assetId}`,
    });
    return acc;
  }, []);
}

async function fetchSharedLinkAssets(identifier: string, key: string | undefined, take: number) {
  const params = new URLSearchParams({ skip: '0', take: `${take}` });
  if (key) params.set('key', key);
  
  // Try the endpoint with the key parameter
  const endpoint = `/api/shared-links/${identifier}/assets?${params.toString()}`;
  console.log('[Immich] Fetching assets from:', endpoint);
  
  const response = await immichRequest(endpoint);
  const payload = (await response.json()) as SharedLinkAssetDto[];
  if (!payload.length) {
    console.log('[Immich] Shared link payload empty for identifier', identifier, 'key', key);
  }
  
  const assets = mapToImmichAssets(payload, { type: 'shared', identifier: key || identifier });
  if (!assets.length && payload.length) {
    console.log('[Immich] Mapping produced 0 assets; sample payload[0]=', payload[0]);
  }
  const total = parseAssetCountFromHeaders(response, assets.length);
  return { assets, total };
}

async function fetchAlbumAssets(albumId: string, take: number) {
  // Fetch the album directly - the response includes the assets array
  console.log('[Immich] Fetching album info for:', albumId);
  const response = await immichRequest(`/api/albums/${albumId}`);
  const albumData = await response.json();
  // console.log('[Immich] Album response:', JSON.stringify(albumData, null, 2));
  
  // Extract assets from the album response
  const payload = (albumData.assets || []) as AlbumAssetDto[];
  const total = typeof albumData.assetCount === 'number' ? albumData.assetCount : payload.length;
  
  // Slice to the requested take limit
  const slicedPayload = payload.slice(0, take);
  const assets = mapToImmichAssets(slicedPayload, { type: 'album', identifier: albumId });
  
  if (!assets.length && payload.length) {
    console.log('[Immich] Album mapping produced 0 assets; sample payload[0]=', payload[0]);
  }
  
  console.log('[Immich] Fetched', assets.length, 'assets out of', total, 'total');
  return { assets, total };
}

export async function listImmichSharedAlbums(): Promise<ImmichAlbumSummary[]> {
  const payload = await immichFetch<SharedLinkDto[]>(`/api/shared-links`);
  // console.log('[Immich] Raw shared-links response:', JSON.stringify(payload, null, 2));
  const albumLinks = payload.filter((link) => link.type === 'ALBUM');

  const counts = await Promise.all(
    albumLinks.map(async (link) => {
      console.log('[Immich] Processing album link:', JSON.stringify(link, null, 2));
      // Prefer explicit positive counts
      if (typeof link.assetCount === 'number' && link.assetCount > 0) return link.assetCount;
      if (typeof link.album?.assetCount === 'number' && link.album.assetCount > 0) return link.album.assetCount;
      return fetchSharedLinkDetail(link);
    })
  );

  return albumLinks.map((link, index) => ({
    id: link.id, // canonical internal id = shareId/UUID
    shareId: link.id,
    shareKey: link.key,
    albumId: link.album?.id ?? link.albumId ?? undefined,
    name: link.album?.albumName || link.name || 'Untitled Album',
    description: link.description || link.album?.description || undefined,
    assetCount: counts[index] ?? 0,
    createdAt: link.createdAt,
  }));
}

export async function fetchImmichAlbumAssetPage(
  reference: string | ImmichAlbumSummary,
  take = 60
): Promise<{ assets: ImmichAsset[]; total: number }> {
  if (!reference) return { assets: [], total: 0 };
  const limit = Math.max(1, Math.min(500, take));

  let summary: ImmichAlbumSummary | undefined;
  if (typeof reference === 'string') {
    // console.log('[Immich] Looking up album with reference:', reference);
    const albums = await listImmichSharedAlbums().catch(() => []);
    // console.log('[Immich] Available albums:', albums.map(a => ({ id: a.id, shareId: a.shareId, albumId: a.albumId, name: a.name })));
    summary = albums.find((album) => [album.id, album.shareId, album.shareKey, album.albumId].filter(Boolean).includes(reference));
    console.log('[Immich] Found summary:', summary ? summary.name : 'NOT FOUND');
    // If given a raw key, attempt using it directly (key only)
    if (!summary) {
      try {
        const { assets, total } = await fetchSharedLinkAssets(reference, reference, limit);
        if (assets.length || total) return { assets: assets.slice(0, limit), total };
      } catch (_) {
        // ignore
      }
    }
  } else {
    summary = reference;
  }

  if (summary) {
    // Primary attempt: albumId direct (most reliable with API key authentication)
    if (summary.albumId) {
      try {
        // console.log('[Immich] Fetching assets via albumId:', summary.albumId);
        const { assets, total } = await fetchAlbumAssets(summary.albumId, limit);
        if (assets.length || total) {
          return { assets: assets.slice(0, limit), total: total || assets.length };
        }
      } catch (err) {
        console.log('[Immich] Album assets fetch failed:', err);
      }
    }
    // Secondary attempt: shareId + shareKey (may fail with API key auth)
    if (summary.shareId) {
      try {
        // console.log('[Immich] Trying shared link assets via shareId:', summary.shareId);
        const { assets, total } = await fetchSharedLinkAssets(summary.shareId, summary.shareKey, limit);
        if (assets.length || total) {
          return { assets: assets.slice(0, limit), total: total || assets.length };
        }
      } catch (err) {
        console.log('[Immich] Shared link assets fetch failed:', err);
      }
    }
    // Fallback: try shareKey as id (some deployments might accept key path)
    if (summary.shareKey && summary.shareKey !== summary.shareId) {
      try {
        const { assets, total } = await fetchSharedLinkAssets(summary.shareKey, summary.shareKey, limit);
        if (assets.length || total) {
          return { assets: assets.slice(0, limit), total: total || assets.length };
        }
      } catch (_) {}
    }
  }

  return { assets: [], total: 0 };
}

export async function fetchImmichAlbumAssets(
  reference: string | ImmichAlbumSummary,
  take = 60
): Promise<ImmichAsset[]> {
  // console.log('[Immich] fetchImmichAlbumAssets called with reference:', typeof reference === 'string' ? reference : reference.name);
  const { assets } = await fetchImmichAlbumAssetPage(reference, take);
  // console.log('[Immich] fetchImmichAlbumAssets returning', assets.length, 'assets');
  if (assets.length > 0) {
    // console.log('[Immich] First asset:', JSON.stringify(assets[0], null, 2));
  }
  return assets;
}

export function getImmichConfigStatus() {
  return {
    configured: Boolean(IMMICH_BASE_URL && IMMICH_API_KEY),
    baseUrl: IMMICH_BASE_URL,
  };
}
