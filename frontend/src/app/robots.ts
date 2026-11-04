import { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/og'],
        disallow: ['/api/', '/admin/', '/studio/'],
      },
      {
        userAgent: [
          'Reflectionbot',
          'Bytespider',
          'CCBot',
          'Amazonbot',
          'ClaudeBot',
          'GPTBot',
          'DataForSeoBot',
        ],
        disallow: ['/'],
      },
    ],
    sitemap: [absoluteUrl('/sitemap.xml'), absoluteUrl('/sitemap-news.xml')],
  };
}
