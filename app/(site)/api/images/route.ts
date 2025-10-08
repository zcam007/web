import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const files = await fs.readdir(uploadsDir);
    const urls = files.map(file => `/uploads/${file}`).reverse();
    return NextResponse.json({ urls });
  } catch (e) {
    console.error('Get images error:', e);
    return new NextResponse('error', { status: 500 });
  }
}
