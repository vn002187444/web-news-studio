import { MetadataRoute } from 'next';
import { getAllPostsUnified, getAllTagsUnified } from '@/lib/posts';
import { SITE_URL } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  // Chỉ xuất bản các URL tiếng Việt (vi) vì nội dung bài viết và chuyên mục bằng tiếng Việt
  // Điều này triệt tiêu hoàn toàn 684 lỗi "Excluded by 'noindex' tag" trên Google Search Console
  const indexableLocales = ['vi'];

  let posts: Awaited<ReturnType<typeof getAllPostsUnified>> = [];
  try {
    posts = await getAllPostsUnified();
  } catch {
    posts = [];
  }

  const categories = ['world', 'tech', 'blockchain', 'game', 'finance', 'lifestyle', 'sports', 'entertainment', 'education', 'science'];
  
  const categoryRoutes: MetadataRoute.Sitemap = categories.flatMap((cat) => {
    const catPosts = posts.filter(p => p.meta.category.toLowerCase() === cat);
    const lastPost = catPosts.length > 0 ? catPosts[0] : null;
    const lastModified = lastPost ? new Date(lastPost.meta.publishedAt) : new Date();

    return indexableLocales.map((locale) => ({
      url: `${baseUrl}/${locale}/${cat}`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));
  });

  const articleRoutes: MetadataRoute.Sitemap = posts.flatMap((article) =>
    indexableLocales.map((locale) => ({
      url: `${baseUrl}/${locale}/${article.meta.category}/${article.slug}`,
      lastModified: new Date(article.meta.publishedAt),
      changeFrequency: 'never' as const,
      priority: 0.6,
    }))
  );

  let tags: Awaited<ReturnType<typeof getAllTagsUnified>> = [];
  try {
    tags = await getAllTagsUnified();
  } catch {
    tags = [];
  }

  const tagRoutes: MetadataRoute.Sitemap = tags.flatMap((tagObj) =>
    indexableLocales.map((locale) => ({
      url: `${baseUrl}/${locale}/tag/${tagObj.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }))
  );

  const homeRoutes: MetadataRoute.Sitemap = indexableLocales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'always' as const,
    priority: 1,
  }));

  return [...homeRoutes, ...categoryRoutes, ...tagRoutes, ...articleRoutes];
}
