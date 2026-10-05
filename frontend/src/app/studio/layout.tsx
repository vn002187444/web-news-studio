import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Sanity Studio — Quản trị nội dung',
  description: 'Giao diện quản trị bài viết nhúng trên website.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
