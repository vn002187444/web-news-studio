import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

// Chỉ chặn các bot càn quét quá khích (Abusive / Hyper-aggressive Scrapers) gây cạn kiệt CPU Worker
// Tuyệt đối CHO PHÉP các AI bot chính thống giúp tăng view, trích dẫn nguồn và index SEO (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Googlebot...)
const AGGRESSIVE_ABUSIVE_BOT_REGEX = /Reflectionbot|Bytespider/i;

export default function middleware(request: NextRequest) {
  const ua = request.headers.get('user-agent') || '';

  // 1. Chặn đứng bot càn quét quá khích ngốn hàng nghìn request/ngày (như Reflectionbot - 4,963 reqs/ngày)
  // Trả về 403 Forbidden ngay tại tầng Edge trong 0.01ms, triệt tiêu 100% tài nguyên CPU lãng phí
  if (AGGRESSIVE_ABUSIVE_BOT_REGEX.test(ua)) {
    return new NextResponse('Access Denied: Abusive Scraper Bot Restricted.', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  }

  // 2. Xử lý subrequests từ Cloudflare Early Hints ('nginx-ssl early hints')
  // Cloudflare Early Hints gửi probe nội bộ. Nếu trả về 204 ngay lập tức, Worker sẽ không chạy SSR đầy đủ,
  // loại bỏ hoàn toàn lỗi 504 exceededResources (394-522 lỗi trên dashboard).
  if (ua.includes('early hints') || ua.includes('early-hints')) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  const { pathname, search } = request.nextUrl;

  // 3. Chống lỗi 404 do nhân đôi locale (/vi/vi/..., /en/vi/..., /vi/en/...)
  const doubleLocaleMatch = pathname.match(/^\/(vi|en)\/(vi|en)(\/.*)?$/);
  if (doubleLocaleMatch) {
    const primaryLocale = doubleLocaleMatch[1];
    const rest = doubleLocaleMatch[3] || '';
    const redirectUrl = new URL(`/${primaryLocale}${rest}${search}`, request.url);
    return NextResponse.redirect(redirectUrl, 301);
  }

  // 4. Xử lý i18n chuẩn qua next-intl
  const response = handleI18nRouting(request);

  // 5. Chuẩn hóa mã chuyển hướng sang 301 Permanent Redirect (thay vì 307) cho SEO Googlebot
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
