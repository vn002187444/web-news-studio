import { NextResponse } from 'next/server';
import { toSlug } from '@/lib/site';
import { markdownToBlocks } from '@/lib/sanity';

// Cron Sanity-only (Vercel cron gọi mỗi 30' theo vercel.json).
// Không ghi file (serverless read-only) — chỉ RSS -> Gemini -> Sanity.
// GitHub Actions (.github/workflows/autoblog.yml) vẫn là pipeline chính (ghi MDX + Sanity).
export const dynamic = 'force-dynamic';

const FEEDS = [
  { url: 'https://vnexpress.net/rss/so-hoa.rss', category: 'tech' },
  { url: 'https://vnexpress.net/rss/kinh-doanh.rss', category: 'finance' },
  { url: 'https://vnexpress.net/rss/the-thao.rss', category: 'sports' },
  { url: 'https://vnexpress.net/rss/doi-song.rss', category: 'lifestyle' },
  { url: 'https://gamek.vn/rss/home.rss', category: 'game' },
  { url: 'https://vnexpress.net/rss/giai-tri.rss', category: 'entertainment' },
  { url: 'https://vnexpress.net/rss/giao-duc.rss', category: 'education' },
  { url: 'https://vnexpress.net/rss/khoa-hoc.rss', category: 'science' },
  { url: 'https://cointelegraph.com/rss', category: 'blockchain' },
];

function validRewrite(j: any): { title: string; excerpt: string; content: string; tags: string[] } | null {
  if (!j || typeof j !== 'object') return null;
  const title = typeof j.title === 'string' ? j.title.slice(0, 200).trim() : '';
  const excerpt = typeof j.excerpt === 'string' ? j.excerpt.slice(0, 500).trim() : '';
  const content = typeof j.content === 'string' ? j.content.slice(0, 20000).trim() : '';
  if (!title || !content) return null;
  const tags = Array.isArray(j.tags) ? j.tags.map(String).slice(0, 6) : ['AI', 'AutoBlogger'];
  return { title, excerpt, content, tags };
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
    if (published >= 3) break; // mỗi lượt cron tối đa 3 bài để phủ dần 9 chuyên mục
    try {
      const data = await parser.parseURL(feed.url);
      // Duyệt 3 tin mới nhất, lấy tin đầu tiên chưa đăng
      let item: any = null;
      let slug = '';
      for (const candidate of ((data.items || []) as any[]).slice(0, 3)) {
        if (!candidate?.title) continue;
        const s = toSlug(candidate.title);
        const exists = await sanity.fetch(`*[_type == "article" && slug.current == $slug][0]._id`, { slug: s });
        if (exists) continue;
        item = candidate;
        slug = s;
        break;
      }
      if (!item) continue;

      const FALLBACK: Record<string, string> = {
        tech: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        finance: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
        sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
        lifestyle: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
        game: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=1200&q=80',
        entertainment: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=800&q=80',
        education: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
        science: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
        blockchain: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
      };
      let thumbnail = FALLBACK[feed.category] || FALLBACK.tech;
      if (item.enclosure?.url) thumbnail = item.enclosure.url;
      else if (item['media:content']?.url) thumbnail = item['media:content'].url;
      else if (item['media:thumbnail']?.url) thumbnail = item['media:thumbnail'].url;
      else {
        const m = `${item.content || ''} ${item['content:encoded'] || ''}`.match(/<img[^>]+src=["']([^"'\s>]+)["']/i);
        if (m?.[1]) thumbnail = m[1];
      }

      let title = item.title.slice(0, 200), excerpt = (item.contentSnippet || '').slice(0, 500), content = `## Tóm tắt\n\n${(item.contentSnippet || item.title).slice(0, 2000)}`;
      let aiTags = ['AI', 'AutoBlogger'];
      if (geminiKey) {
        try {
          const { GoogleGenerativeAI } = await import('@google/generative-ai');
          const model = new GoogleGenerativeAI(geminiKey).getGenerativeModel({ model: geminiModel });
          const r = await model.generateContent(`Viết lại tin sau sang tiếng Việt chuẩn SEO/GEO/AEO, chỉ trả JSON thuần {"title","slug","excerpt","tags":[3-5 tag],"takeaways":[3-5 điểm chính],"faq":[{"q","a"} x3],"content"} — content markdown 800-1500 từ BẮT BUỘC mở đầu bằng đúng dòng "## Những điểm chính (Key Takeaways)" + bullet copy nguyên văn takeaways, rồi thân bài có internal link, mục ## Câu hỏi thường gặp, cuối bài ghi nguồn tin. Tin gốc: ${item.title} — ${item.contentSnippet || ''}`);
          const parsed = JSON.parse(r.response.text().replace(/```json|```/g, '').trim());
          const v = validRewrite(parsed);
          if (v) { title = v.title; excerpt = v.excerpt || excerpt; content = v.content; aiTags = v.tags; }
        } catch { /* giữ bản RSS gốc */ }
      }

      await sanity.create({
        _type: 'article',
        title, excerpt, content,
        body: markdownToBlocks(content),
        slug: { _type: 'slug', current: toSlug(title) || slug },
        category: feed.category,
        categoryRef: { _type: 'reference', _ref: `category-${feed.category}` },
        tags: aiTags,
        thumbnail,
        author: 'AI Autobot',
        authorRef: { _type: 'reference', _ref: `author-${feed.category}` },
        publishedAt: new Date().toISOString(),
        views: 0,
      });
      published += 1;
    } catch { /* feed lỗi — bỏ qua */ }
  }

  return NextResponse.json({ ok: true, published });
}
