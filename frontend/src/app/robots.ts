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
        // Chỉ chặn các bot càn quét quá khích (Reflectionbot spam hàng nghìn req/ngày, Bytespider)
        // Cho phép các bot AI tìm kiếm (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot) crawl để tăng view & thứ hạng SEO
        userAgent: [
          'Reflectionbot',
          'Bytespider',
        ],
        disallow: ['/'],
      },
    ],
    sitemap: [absoluteUrl('/sitemap.xml'), absoluteUrl('/sitemap-news.xml')],
  };
}
