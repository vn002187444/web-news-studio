import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  const secret = process.env.SANITY_WEBHOOK_SECRET || '';
  const got = request.headers.get('x-sanity-secret') || new URL(request.url).searchParams.get('secret') || '';
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
