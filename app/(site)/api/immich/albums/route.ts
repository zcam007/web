import { NextResponse } from 'next/server';
import { getImmichConfigStatus, listImmichSharedAlbums } from '../../../lib/immich';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = getImmichConfigStatus();
  if (!status.configured) {
    return NextResponse.json({ configured: false, albums: [] });
  }

  try {
    const albums = await listImmichSharedAlbums();
    return NextResponse.json({ configured: true, albums });
  } catch (error) {
    console.error('Immich albums error:', error);
    return NextResponse.json(
      { configured: true, error: (error as Error).message, albums: [] },
      { status: 502 }
    );
  }
}
