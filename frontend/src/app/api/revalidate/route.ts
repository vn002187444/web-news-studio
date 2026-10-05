import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Sanity Webhook → POST /api/revalidate?secret=... {slug, category}
// Cấu hình trong Sanity Manage → API → Webhooks (on create/update/delete article).
export async function POST(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret') || request.headers.get('x-webhook-secret') || '';
  if (!process.env.SANITY_WEBHOOK_SECRET || secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let slug = '';
  let category = '';
  try {
    const body = await request.json();
    slug = body?.slug?.current || body?.slug || '';
    category = body?.category || '';
  } catch { /* payload rỗng — revalidate homepage */ }

  try {
    revalidatePath('/vi');
    revalidatePath('/en');
    if (category) {
      revalidatePath(`/vi/${category}`);
      revalidatePath(`/en/${category}`);
    }
    if (slug && category) {
      revalidatePath(`/vi/${category}/${slug}`);
      revalidatePath(`/en/${category}/${slug}`);
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
  return NextResponse.json({ ok: true, revalidated: { slug, category } });
}
