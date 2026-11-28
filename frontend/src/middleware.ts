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

  // 1. Chặn đứng các bot / scanner thăm dò file nhạy cảm và lỗ hổng (.env, .git, .aws, .php, wp-admin...)
  // Trả về 404 Not Found ngay tại tầng Edge trong 0.01ms, ngăn next-intl gọi headers() gây lỗi HTTP 500
  if (
    /^\/(\.env|\.git|\.aws|\.svn|\.config|wp-admin|wp-login|xmlrpc)/i.test(pathname) ||
    /\.(env|git|yml|yaml|ini|sql|bak|config|php|asp|aspx)$/i.test(pathname)
  ) {
    return new NextResponse('Not Found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  }

  // 2. Chống lỗi 404 do nhân đôi locale (/vi/vi/..., /en/vi/..., /vi/en/...)
  const doubleLocaleMatch = pathname.match(/^\/(vi|en)\/(vi|en)(\/.*)?$/);
  if (doubleLocaleMatch) {
    const primaryLocale = doubleLocaleMatch[1];
    const rest = doubleLocaleMatch[3] || '';
    const redirectUrl = new URL(`/${primaryLocale}${rest}${search}`, request.url);
    return NextResponse.redirect(redirectUrl, 301);
  }

  // 3. Xử lý i18n chuẩn qua next-intl
  const response = handleI18nRouting(request);

  // 4. Chuẩn hóa mã chuyển hướng sang 301 Permanent Redirect (thay vì 307) cho SEO Googlebot
  if (response.status === 307 || response.status === 308) {
    const location = response.headers.get('location');
    if (location) {
      const redirectRes = NextResponse.redirect(new URL(location, request.url), 301);
      redirectRes.headers.set(
        'Cache-Control',
        'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'
      );
      return redirectRes;
    }
  }

  // 5. Tối ưu Cache Edge Cloudflare:
  // Xóa Set-Cookie dư thừa nếu người dùng đã có cookie NEXT_LOCALE trùng khớp,
  // tránh Cloudflare Edge bypass cache (CF-Cache-Status: BYPASS) trên trang công khai.
  const existingLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const setCookie = response.headers.get('set-cookie');
  if (existingLocale && setCookie && setCookie.includes(`NEXT_LOCALE=${existingLocale}`)) {
    response.headers.delete('set-cookie');
  }

  // Gắn Cache-Control edge-ready cho các trang đọc tin công khai
  if (request.method === 'GET' && !pathname.startsWith('/studio') && !pathname.startsWith('/api')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400'
    );
  }

  return response;
}

export const config = {
  // Bỏ qua api/studio/_next/static để middleware i18n không chặn sitemap, robots, assets, CMS
  // Bổ sung pattern để bắt probe files (.env, .git, wp-*, .php) chặn sớm 404
  matcher: [
    '/',
    '/(vi|en)/:path*',
    '/((?!api|studio|_next|_vercel|.*\\..*).*)',
    '/(\\.env.*|\\.git.*|\\.aws.*|wp-.*|.*\\.php)'
  ]
};
