import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { timingSafeEqual } from 'node:crypto';

// Bật chế độ nháp cho admin: /api/draft?secret=...&redirect=/vi/tech/slug
export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret') || '';
  const expected = process.env.SANITY_PREVIEW_SECRET || process.env.CRON_SECRET || '';

  const secretBuffer = Buffer.from(secret);
  const expectedBuffer = Buffer.from(expected);

  if (!expected || expectedBuffer.length !== secretBuffer.length || !timingSafeEqual(secretBuffer, expectedBuffer)) {
    return new Response('Sai secret.', { status: 401 });
  }
  (await draftMode()).enable();
  redirect(url.searchParams.get('redirect') || '/vi');
}
