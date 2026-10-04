import { NextResponse } from 'next/server';
import { toSlug } from '@/lib/site';

// Cron Sanity-only (Vercel cron gọi mỗi 30' theo vercel.json).
// Không ghi file (serverless read-only) — chỉ RSS -> Gemini -> Sanity.
// GitHub Actions (.github/workflows/autoblog.yml) vẫn là pipeline chính (ghi MDX + Sanity).
export const dynamic = 'force-dynamic';

const FEEDS = [
  { url: 'https://vnexpress.net/rss/so-hoa.rss', category: 'tech' },
  { url: 'https://vnexpress.net/rss/the-thao.rss', category: 'sports' },
  { url: 'https://vnexpress.net/rss/giai-tri.rss', category: 'entertainment' },
  { url: 'https://vnexpress.net/rss/giao-duc.rss', category: 'education' },
  { url: 'https://vnexpress.net/rss/khoa-hoc.rss', category: 'science' },
  { url: 'https://cointelegraph.com/rss', category: 'blockchain' },
];

function validRewrite(j: any): { title: string; excerpt: string; content: string } | null {
  if (!j || typeof j !== 'object') return null;
  const title = typeof j.title === 'string' ? j.title.slice(0, 200).trim() : '';
  const excerpt = typeof j.excerpt === 'string' ? j.excerpt.slice(0, 500).trim() : '';
  const content = typeof j.content === 'string' ? j.content.slice(0, 20000).trim() : '';
  if (!title || !content) return null;
  return { title, excerpt, content };
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET || '';
  const got = request.headers.get('authorization')?.replace('Bearer ', '') || '';
  // Fail-closed: thiếu CRON_SECRET thì từ chối luôn, không cho trigger mở
  if (!cronSecret || got !== cronSecret) return NextResponse.json({ ok: false }, { status: 401 });

  const geminiKey = process.env.GEMINI_API_KEY || '';
  const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
  const { getSanityClient } = await import('@/lib/sanity');
  const sanity = getSanityClient(true);
  if (!sanity) return NextResponse.json({ ok: false, reason: 'sanity-not-configured' }, { status: 501 });

  const Parser = (await import('rss-parser')).default;
  const parser = new Parser();
  let published = 0;

  for (const feed of FEEDS) {
    if (published >= 2) break; // mỗi lượt cron tối đa 2 bài
    try {
      const data = await parser.parseURL(feed.url);
      const item = data.items[0];
      if (!item?.title) continue;
      const slug = toSlug(item.title);
      const exists = await sanity.fetch(`*[_type == "article" && slug.current == $slug][0]._id`, { slug });
      if (exists) continue;

      let title = item.title.slice(0, 200), excerpt = (item.contentSnippet || '').slice(0, 500), content = `## Tóm tắt\n\n${(item.contentSnippet || item.title).slice(0, 2000)}`;
      if (geminiKey) {
        try {
          const { GoogleGenerativeAI } = await import('@google/generative-ai');
          const model = new GoogleGenerativeAI(geminiKey).getGenerativeModel({ model: geminiModel });
          const r = await model.generateContent(`Viết lại tin sau sang tiếng Việt chuẩn SEO, trả JSON {"title","slug","excerpt","content"} (content markdown, có mục Key Takeaways). Tin gốc: ${item.title} — ${item.contentSnippet || ''}`);
          const parsed = JSON.parse(r.response.text().replace(/```json|```/g, '').trim());
          const v = validRewrite(parsed);
          if (v) { title = v.title; excerpt = v.excerpt || excerpt; content = v.content; }
        } catch { /* giữ bản RSS gốc */ }
      }

      await sanity.create({
        _type: 'article',
        title, excerpt, content,
        slug: { _type: 'slug', current: toSlug(title) || slug },
        category: feed.category,
        tags: ['AI', 'AutoBlogger'],
        thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        author: 'AI Autobot',
        publishedAt: new Date().toISOString(),
        views: 0,
      });
      published += 1;
    } catch { /* feed lỗi — bỏ qua */ }
  }

  return NextResponse.json({ ok: true, published });
}
