import { NextRequest, NextResponse } from 'next/server';
import { readConfig, writeConfig } from '../../lib/config';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me-strong';

export async function GET(req: NextRequest) {
  const pass =
    req.headers.get('x-admin-pass') ||
    req.nextUrl.searchParams.get('auth') ||
    '';
  if (pass !== ADMIN_PASSWORD) {
    return new NextResponse('unauthorized', { status: 401 });
  }
  return NextResponse.json(await readConfig());
}

export async function PUT(req: NextRequest) {
  const pass = req.headers.get('x-admin-pass') || '';
  if (pass !== ADMIN_PASSWORD) {
    return new NextResponse('unauthorized', { status: 401 });
  }
  const body = await req.json();
  await writeConfig(body);
  return NextResponse.json({ ok: true });
}
