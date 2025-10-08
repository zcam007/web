import { NextResponse } from 'next/server';

const IMMICH_BASE_URL = process.env.IMMICH_BASE_URL?.replace(/\/$/, '') || '';
const IMMICH_API_KEY = process.env.IMMICH_API_KEY || '';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string; type: string } }
) {
  const { id, type } = params;

  if (!IMMICH_BASE_URL || !IMMICH_API_KEY) {
    return new NextResponse('Immich not configured', { status: 503 });
  }

  // Validate type (thumbnail or original)
  if (!['thumbnail', 'original'].includes(type)) {
    return new NextResponse('Invalid type', { status: 400 });
  }

  try {
    // Build endpoint with query parameters for better quality
    const url = new URL(`${IMMICH_BASE_URL}/api/assets/${id}/${type}`);
    
    // For thumbnails, request a larger size for better quality
    // Immich supports size parameter for thumbnails
    if (type === 'thumbnail') {
      const { searchParams } = new URL(request.url);
      const size = searchParams.get('size') || 'preview'; // preview, thumbnail (default is small)
      url.searchParams.set('size', size);
    }
    
    const response = await fetch(url.toString(), {
      headers: {
        'x-api-key': IMMICH_API_KEY,
      },
    });

    if (!response.ok) {
      console.error(`[Immich Proxy] Failed to fetch ${type} for asset ${id}:`, response.status);
      return new NextResponse('Failed to fetch image', { status: response.status });
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('[Immich Proxy] Error:', error);
    return new NextResponse('Error fetching image', { status: 500 });
  }
}
