import { MetadataRoute } from 'next';
import { getAllPostsUnified } from '@/lib/posts';
import { SITE_URL } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const locales = ['vi', 'en'];

  const categoryRoutes = ['tech', 'blockchain', 'game', 'finance', 'lifestyle', 'sports', 'entertainment', 'education', 'science'].flatMap((cat) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/${cat}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))
  );

  // Dùng posts thật — Sanity-first, MDX fallback
  let articleRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await getAllPostsUnified();
    articleRoutes = posts.flatMap((article) =>
      locales.map((locale) => ({
        url: `${baseUrl}/${locale}/${article.meta.category}/${article.slug}`,
        lastModified: new Date(article.meta.publishedAt),
        changeFrequency: 'never' as const,
        priority: 0.6,
      }))
    );
  } catch {
    articleRoutes = [];
  }

  const homeRoutes: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'always' as const,
    priority: 1,
  }));

  return [...homeRoutes, ...categoryRoutes, ...articleRoutes];
}
