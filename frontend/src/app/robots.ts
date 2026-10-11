import { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/api/og'],
      disallow: ['/api/', '/admin/', '/studio/'],
    },
    sitemap: [absoluteUrl('/sitemap.xml'), absoluteUrl('/sitemap-news.xml')],
  };
}
