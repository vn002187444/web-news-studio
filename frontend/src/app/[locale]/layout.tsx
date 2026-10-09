import SmoothScrollProvider from "@/components/ui/SmoothScrollProvider";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import CustomCursor from "@/components/ui/CustomCursor";
import CommandPalette from "@/components/ui/CommandPalette";
import MobileBottomNav from "@/components/ui/MobileBottomNav";
import type { Metadata } from "next";
import { Inter, Playfair_Display, Space_Mono } from "next/font/google";
import "../globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin", "vietnamese"],
  style: ['normal', 'italic']
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"]
});

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { draftMode } from 'next/headers';
import { VisualEditing } from 'next-sanity/visual-editing';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const other = locale === 'vi' ? 'en' : 'vi';
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: 'News Studio | Nền Tảng Báo Chí Kỷ Nguyên Mới',
      template: '%s | News Studio',
    },
    description: 'Trải nghiệm tin tức đột phá với giao diện 3D và nội dung phân tích chuyên sâu được vận hành bởi AI.',
    icons: {
      icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
      apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        vi: '/vi',
        en: '/en',
        'x-default': '/vi',
      },
    },
    openGraph: {
      siteName: SITE_NAME,
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      alternateLocale: [other === 'vi' ? 'vi_VN' : 'en_US'],
      type: 'website',
    },
    robots: { index: true, follow: true },
  };
}

// Prerender tĩnh locale cho Cloudflare Pages (không fs ở runtime)
export function generateStaticParams() {
  return [{ locale: 'vi' }, { locale: 'en' }];
}

export default async function RootLayout({ children, params }: Readonly<{ children: React.ReactNode, params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  setRequestLocale(locale);
 
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  const isDraft = (await draftMode()).isEnabled;

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${playfair.variable} ${spaceMono.variable} font-sans h-full antialiased selection:bg-black selection:text-white`}
    >
      <body className="min-h-full flex flex-col bg-[#F4F4F0] text-[#111111]">
        <NextIntlClientProvider messages={messages}>
          <CustomCursor />
          <SmoothScrollProvider>
            <Header />
            <CommandPalette />
            <main className="flex-grow mb-16 md:mb-0">
              {children}
            </main>
            <Footer />
            <MobileBottomNav />
          </SmoothScrollProvider>
          {isDraft && (
            <>
              <a
                href="/api/disable-draft"
                className="fixed bottom-20 right-4 z-[100] bg-red-600 text-white font-mono text-xs uppercase px-4 py-2 rounded-full shadow-lg"
              >
                ✎ Draft — Thoát
              </a>
              <VisualEditing />
            </>
          )}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
