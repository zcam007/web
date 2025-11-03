import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function DELETE(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadsDir, filename);

    // Check if file exists
    await fs.access(filePath);

    // Delete the file
    await fs.unlink(filePath);

    // Now, update the site.json file
    const siteJsonPath = path.join(process.cwd(), 'data', 'site.json');
    const siteJsonContent = await fs.readFile(siteJsonPath, 'utf-8');
    const siteData = JSON.parse(siteJsonContent);

    const imageUrl = `/uploads/${filename}`;

    // Recursively remove the image url from the site.json
    function removeImage(obj: any) {
      for (const key in obj) {
        if (typeof obj[key] === 'string' && obj[key] === imageUrl) {
          obj[key] = ''; // Or delete obj[key];
        } else if (Array.isArray(obj[key])) {
          obj[key] = obj[key].filter((item: any) => item !== imageUrl);
          obj[key].forEach((item: any) => removeImage(item));
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          removeImage(obj[key]);
        }
      }
    }

    removeImage(siteData);

    await fs.writeFile(siteJsonPath, JSON.stringify(siteData, null, 2));

    return new NextResponse(null, { status: 204 });
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
      return new NextResponse('File not found', { status: 404 });
    }
    console.error('Delete image error:', e);
    return new NextResponse('error', { status: 500 });
  }
}
