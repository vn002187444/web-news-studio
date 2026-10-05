import NewsTicker from "@/components/ui/NewsTicker";
import HeroSection from "@/components/ui/HeroSection";
import BentoGrid from "@/components/ui/BentoGrid";
import TrendingWidget from "@/components/ui/TrendingWidget";
import { getAllPostsUnified } from "@/lib/posts";
import { SITE_URL, SITE_NAME, escapeJsonLd } from "@/lib/site";
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: {
      canonical: `/${locale}`,
      languages: { vi: '/vi', en: '/en' },
    },
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const posts = await getAllPostsUnified();
  
  // Map MDX meta to the format expected by UI components
  const articles = posts.map(post => ({
    id: post.slug,
    slug: post.slug,
    title: post.meta.title,
    excerpt: post.meta.excerpt,
    category: post.meta.category,
    thumbnail: { url: post.meta.thumbnail || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', alt: post.meta.title },
    publishedAt: post.meta.publishedAt
  }));

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: `${SITE_URL}/${locale}`,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/${locale}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'NewsMediaOrganization',
        name: SITE_NAME,
        url: `${SITE_URL}/${locale}`,
        logo: `${SITE_URL}/icon-512x512.png`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: escapeJsonLd(JSON.stringify(homeJsonLd)) }}
      />
      <div className="pt-24 bg-[#F4F4F0]">
        <NewsTicker articles={articles.map((a) => ({ title: a.title, slug: a.slug, category: a.category }))} />
      </div>
      <HeroSection />
      <div className="bg-white">
        <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-9 min-w-0">
            <BentoGrid articles={articles} />
          </div>
          <div className="lg:col-span-3 py-20">
            <TrendingWidget articles={articles} />
          </div>
        </div>
      </div>
    </>
  );
}
