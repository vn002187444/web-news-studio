import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Bỏ qua api/studio/_next/static để middleware i18n không chặn sitemap, robots, assets, CMS
  matcher: ['/', '/(vi|en)/:path*', '/((?!api|studio|_next|_vercel|.*\\..*).*)']
};
