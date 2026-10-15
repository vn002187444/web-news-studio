import { getAllPostsUnified } from '@/lib/posts';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { NextResponse } from 'next/server';

export const revalidate = 1800; // Cache 30 phút trên edge

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryFilter = searchParams.get('category')?.toLowerCase();
  const format = searchParams.get('format')?.toLowerCase();

  const allPosts = await getAllPostsUnified();

  const filtered = categoryFilter
    ? allPosts.filter((p) => p.meta.category.toLowerCase() === categoryFilter)
    : allPosts;

  const recent = filtered.slice(0, 30);

  // 1. Phục vụ định dạng JSON Feed v1.1
  if (format === 'json') {
    const jsonFeed = {
      version: 'https://jsonfeed.org/version/1.1',
      title: categoryFilter ? `${SITE_NAME} - ${categoryFilter.toUpperCase()}` : SITE_NAME,
      home_page_url: SITE_URL,
      feed_url: `${SITE_URL}/api/feed${categoryFilter ? `?category=${categoryFilter}` : ''}`,
      description: 'Nền tảng báo chí kỹ nguyên mới với nội dung chuyên sâu được vận hành bởi AI.',
      items: recent.map((p) => ({
        id: p.slug,
        url: `${SITE_URL}/vi/${p.meta.category}/${p.slug}`,
        title: p.meta.title,
        summary: p.meta.excerpt,
        content_text: p.meta.excerpt,
        date_published: new Date(p.meta.publishedAt).toISOString(),
        image: p.meta.thumbnail,
        tags: p.meta.tags,
      })),
    };

    return new NextResponse(JSON.stringify(jsonFeed, null, 2), {
      headers: {
        'Content-Type': 'application/feed+json; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, stale-while-revalidate=86400',
      },
    });
  }

  // 2. Mặc định: Phục vụ chuẩn RSS 2.0 XML
  const channelTitle = categoryFilter ? `${SITE_NAME} | ${categoryFilter.toUpperCase()}` : SITE_NAME;
  const channelLink = categoryFilter ? `${SITE_URL}/vi/${categoryFilter}` : `${SITE_URL}/vi`;

  const itemsXml = recent
    .map((p) => {
      const url = `${SITE_URL}/vi/${p.meta.category}/${p.slug}`;
      const pubDate = new Date(p.meta.publishedAt).toUTCString();
      const safeTitle = escapeXml(p.meta.title);
      const safeDesc = escapeXml(p.meta.excerpt);
      const thumb = p.meta.thumbnail;

      const enclosure = thumb ? `<enclosure url="${escapeXml(thumb)}" type="image/jpeg" length="0" />` : '';

      return `
    <item>
      <title>${safeTitle}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${safeDesc}</description>
      <category>${escapeXml(p.meta.category)}</category>
      ${enclosure}
    </item>`;
    })
    .join('');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${channelLink}</link>
    <description>Nền tảng báo chí kỷ nguyên mới được vận hành bởi AI</description>
    <language>vi</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/api/feed" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, stale-while-revalidate=86400',
    },
  });
}

function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
