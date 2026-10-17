import { getAllPostsUnified } from '@/lib/posts';
import { SITE_URL, SITE_NAME } from '@/lib/site';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  let posts: Awaited<ReturnType<typeof getAllPostsUnified>> = [];
  try {
    posts = await getAllPostsUnified();
  } catch (error) {
    console.error('Error fetching posts for llms.txt:', error);
    posts = [];
  }

  const categories = [
    'world', 'tech', 'blockchain', 'game', 'finance', 
    'lifestyle', 'sports', 'entertainment', 'education', 'science'
  ];

  let markdown = `# ${SITE_NAME}\n\n`;
  markdown += `> ${SITE_NAME} is a bilingual (vi/en) news platform covering multi-category news, tech, finance, world analysis, and more.\n\n`;

  markdown += `## Sections\n\n`;
  for (const category of categories) {
    const Capitalized = category.charAt(0).toUpperCase() + category.slice(1);
    markdown += `- [${Capitalized}](${SITE_URL}/vi/${category}): Latest news in ${Capitalized}\n`;
  }
  markdown += '\n';

  markdown += `## Latest Articles\n\n`;
  const latestPosts = posts.slice(0, 30);
  for (const post of latestPosts) {
    const { title, excerpt, category, publishedAt } = post.meta;
    const url = `${SITE_URL}/vi/${category}/${post.slug}`;
    const date = publishedAt ? new Date(publishedAt).toISOString().split('T')[0] : 'Unknown';
    
    markdown += `- [${title}](${url})\n`;
    markdown += `  - Category: ${category}\n`;
    markdown += `  - Date: ${date}\n`;
    if (excerpt) {
      markdown += `  - Excerpt: ${excerpt}\n`;
    }
  }
  if (latestPosts.length === 0) {
    markdown += `No articles available at the moment.\n`;
  }
  markdown += '\n';

  markdown += `## Feeds & Sitemaps\n\n`;
  markdown += `- [Sitemap](${SITE_URL}/sitemap.xml)\n`;
  markdown += `- [News Sitemap](${SITE_URL}/sitemap-news.xml)\n`;
  markdown += `- [RSS Feed](${SITE_URL}/api/feed)\n`;

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
