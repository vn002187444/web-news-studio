import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Chống lỗi 404 do nhân đôi locale (/vi/vi/..., /en/vi/..., /vi/en/...)
  const doubleLocaleMatch = pathname.match(/^\/(vi|en)\/(vi|en)(\/.*)?$/);
  if (doubleLocaleMatch) {
    const primaryLocale = doubleLocaleMatch[1];
    const rest = doubleLocaleMatch[3] || '';
    const redirectUrl = new URL(`/${primaryLocale}${rest}${search}`, request.url);
    return NextResponse.redirect(redirectUrl, 301);
  }

  // 2. Xử lý i18n chuẩn qua next-intl
  const response = handleI18nRouting(request);

  // 3. Chuẩn hóa mã chuyển hướng sang 301 Permanent Redirect (thay vì 307) cho SEO Googlebot
  if (response.status === 307 || response.status === 308) {
    const location = response.headers.get('location');
    if (location) {
      return NextResponse.redirect(new URL(location, request.url), 301);
    }
  }

  return response;
}

export const config = {
  // Bỏ qua api/studio/_next/static để middleware i18n không chặn sitemap, robots, assets, CMS
  matcher: ['/', '/(vi|en)/:path*', '/((?!api|studio|_next|_vercel|.*\\..*).*)']
};
