import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;

    if (!file || typeof file === 'string') {
      return new NextResponse('No file', { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const type = (file as any).type as string | undefined; // e.g. "image/jpeg"
    const name = (file as any).name as string | undefined;

    // Choose an extension
    const extFromType = (type && type.includes('/')) ? `.${type.split('/')[1]}` : '';
    const safeExt =
      (name?.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif|avif)$/)?.[0]) ||
      extFromType ||
      '.jpg';

    const outName = `${Date.now()}-${Math.random().toString(36).slice(2)}${safeExt}`;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    const outPath = path.join(uploadsDir, outName);

    // Try to optimize with sharp; if it fails (unsupported type), just write raw bytes
    try {
      const img = sharp(bytes).rotate();
      const meta = await img.metadata();

      if ((meta.width || 0) > 2000 || (meta.height || 0) > 2000) {
        await img.resize(2000, 2000, { fit: 'inside' }).toFile(outPath);
      } else {
        await img.toFile(outPath);
      }
    } catch {
      // Fallback: write original file bytes
      await fs.writeFile(outPath, bytes);
    }

    const url = `/uploads/${outName}`;
    return NextResponse.json({ url });
  } catch (e) {
    console.error('Upload error:', e);
    return new NextResponse('error', { status: 500 });
  }
}
