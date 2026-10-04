import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  const secret = process.env.SANITY_WEBHOOK_SECRET || '';
  // Chỉ nhận qua header, không nhận query param để tránh lộ log
  const got = request.headers.get('x-sanity-secret') || request.headers.get('authorization')?.replace('Bearer ', '') || '';
  if (!secret || got !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  revalidatePath('/', 'layout');

  try {
    const body = await request.json();
    if (body.category) {
      revalidatePath(`/vi/${body.category}`, 'page');
      revalidatePath(`/en/${body.category}`, 'page');
    }
  } catch (err) {
    // Body is optional, if parsing fails just proceed
  }

  return NextResponse.json({ ok: true, revalidated: true });
}
