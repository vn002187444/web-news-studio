import { getAllPostsUnified } from '@/lib/posts';
import { SITE_URL } from '@/lib/site';
import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const posts = await getAllPostsUnified();

  // Filter posts from the last 48 hours
  const now = new Date();
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const recentPosts = posts.filter(post => {
    const pubDate = new Date(post.meta.publishedAt);
    return pubDate >= fortyEightHoursAgo;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${recentPosts
    .flatMap(post => ['vi', 'en'].map(locale => {
      const url = `${SITE_URL}/${locale}/${post.meta.category}/${post.slug}`;
      const pubDate = new Date(post.meta.publishedAt).toISOString();
      const language = locale;
      // Truncate title or escape properly if needed
      const title = post.meta.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

      return `
  <url>
    <loc>${url}</loc>
    <news:news>
      <news:publication>
        <news:name>News Studio</news:name>
        <news:language>${language}</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`;
    }))
    .join('')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
