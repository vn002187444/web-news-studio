import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    // Workers via OpenNext hỗ trợ tối ưu ảnh; giữ remotePatterns
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: '*.vnecdn.net',
      },
      {
        protocol: 'https',
        hostname: 'cdn.i-scmp.com',
      },
      {
        protocol: 'https',
        hostname: '*.ctmedia.io',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    const security = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
          "style-src 'self' 'unsafe-inline' https:",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data: https:",
          "connect-src 'self' https: wss: https://api.binance.com wss://stream.binance.com",
          "media-src 'self' https: blob:",
          'frame-ancestors \'self\'',
        ].join('; '),
      },
    ];
    return [
      {
        source: '/:path*.mp4',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:path*.webm',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:path*.:ext(avif|webp|svg|png|jpg|jpeg)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:path*',
        headers: security,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
