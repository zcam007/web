import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';

const rsvpPath = path.join(process.cwd(), 'data', 'rsvps.json');

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const entry = {
    name: String(form.get('name')||''),
    email: String(form.get('email')||''),
    attending: String(form.get('attending')||''),
    message: String(form.get('message')||''),
    ts: new Date().toISOString()
  };
  try {
    let list: any[] = [];
    try { list = JSON.parse(await fs.readFile(rsvpPath, 'utf-8')); } catch {}
    list.push(entry);
    await fs.writeFile(rsvpPath, JSON.stringify(list, null, 2));
    return NextResponse.json({ ok: true });
  } catch {
    return new NextResponse('error', { status: 500 });
  }
}
