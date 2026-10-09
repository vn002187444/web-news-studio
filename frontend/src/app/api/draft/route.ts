import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

// Bật chế độ nháp cho admin: /api/draft?secret=...&redirect=/vi/tech/slug
export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret') || '';
  const expected = process.env.SANITY_PREVIEW_SECRET || process.env.CRON_SECRET || '';
  if (!expected || secret !== expected) {
    return new Response('Sai secret.', { status: 401 });
  }
  (await draftMode()).enable();

  let redirectTo = url.searchParams.get('redirect');
  if (!redirectTo || !redirectTo.startsWith('/') || redirectTo.startsWith('//')) {
    redirectTo = '/vi';
  }

  redirect(redirectTo);
}
