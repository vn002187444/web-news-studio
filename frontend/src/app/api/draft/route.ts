import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

// Hàm so sánh an toàn để chống timing attack
function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Bật chế độ nháp cho admin: /api/draft?secret=...&redirect=/vi/tech/slug
export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret') || '';
  const expected = process.env.SANITY_PREVIEW_SECRET || process.env.CRON_SECRET || '';

  if (!expected || !secureCompare(secret, expected)) {
    return new Response('Sai secret.', { status: 401 });
  }
  (await draftMode()).enable();
  redirect(url.searchParams.get('redirect') || '/vi');
}
