import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { secureCompare, safeRedirectPath } from '@/lib/security';

// Bật chế độ nháp cho admin: /api/draft?secret=...&redirect=/vi/tech/slug
export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret') || '';
  const expected = process.env.SANITY_PREVIEW_SECRET || process.env.CRON_SECRET || '';
  if (!expected || !secureCompare(secret, expected)) {
    return new Response('Sai secret.', { status: 401 });
  }
  (await draftMode()).enable();
  redirect(safeRedirectPath(url.searchParams.get('redirect')));
}
