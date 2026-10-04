import { NextResponse } from 'next/server';

// In-memory view store (reset khi restart; đủ cho trending realtime).
// Production scale lớn: thay bằng KV/Redis, giữ nguyên contract API.
const views = new Map<string, { count: number; lastAt: number }>();
const MAX_KEYS = 5000;
const rate = new Map<string, { count: number; resetAt: number }>();

const BOT_RE = /bot|crawl|spider|slurp|mediapartners|baidu|yandex/i;
const SLUG_RE = /^[a-z0-9-]{1,120}$/i;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const cur = rate.get(ip);
  if (!cur || now > cur.resetAt) {
    rate.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  cur.count += 1;
  return cur.count > 30; // 30 view-post/phút/IP
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const top = Math.min(parseInt(searchParams.get('top') || '5', 10) || 5, 20);
  const ranked = [...views.entries()]
    .map(([slug, v]) => ({ slug, count: v.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, top);
  return NextResponse.json(ranked);
}

export async function POST(request: Request) {
  const ua = request.headers.get('user-agent') || '';
  if (BOT_RE.test(ua)) return NextResponse.json({ ok: false, reason: 'bot' });
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) return NextResponse.json({ ok: false, reason: 'rate-limited' }, { status: 429 });
  try {
    const { slug } = await request.json();
    if (!slug || typeof slug !== 'string' || !SLUG_RE.test(slug)) return NextResponse.json({ ok: false }, { status: 400 });
    // Chống phình Map vô hạn
    if (!views.has(slug) && views.size >= MAX_KEYS) {
      const oldest = views.keys().next().value;
      if (oldest) views.delete(oldest);
    }
    const cur = views.get(slug) || { count: 0, lastAt: 0 };
    cur.count += 1;
    cur.lastAt = Date.now();
    views.set(slug, cur);
    // Best-effort: cộng dồn views lên Sanity khi đã cấu hình (không chặn response)
    try {
      const { getSanityClient } = await import('@/lib/sanity');
      const c = getSanityClient(true);
      if (c) {
        const id = await c.fetch(`*[_type == "article" && slug.current == $slug][0]._id`, { slug });
        if (id) c.patch(id).inc({ views: 1 }).commit().catch(() => {});
      }
    } catch { /* chưa cấu hình Sanity — giữ in-memory */ }
    return NextResponse.json({ ok: true, count: cur.count });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
