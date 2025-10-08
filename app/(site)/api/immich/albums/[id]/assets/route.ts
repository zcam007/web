import { NextResponse } from 'next/server';
import { fetchImmichAlbumAssetPage, getImmichConfigStatus } from '../../../../../lib/immich';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const status = getImmichConfigStatus();
  if (!status.configured) {
    return NextResponse.json({ configured: false, assets: [] });
  }

  const { searchParams } = new URL(request.url);
  const take = Number(searchParams.get('take') ?? '60');

  try {
  const { assets, total } = await fetchImmichAlbumAssetPage(params.id, take);
  return NextResponse.json({ configured: true, assets, total });
  } catch (error) {
    console.error('Immich assets error:', error);
    return NextResponse.json(
      { configured: true, error: (error as Error).message, assets: [] },
      { status: 502 }
    );
  }
}
