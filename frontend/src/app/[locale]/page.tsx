import NewsTicker from "@/components/ui/NewsTicker";
import HeroSection from "@/components/ui/HeroSection";
import BentoGrid from "@/components/ui/BentoGrid";
import TrendingWidget from "@/components/ui/TrendingWidget";
import CategorySections from "@/components/ui/CategorySections";
import { getAllPostsUnified } from "@/lib/posts";
import { optimizeThumbnail } from "@/lib/image";
import { allocateHomepageContent } from "@/lib/content-allocator";
import type { Metadata } from 'next';
import { Article } from "@/types";

// ISR 1h: bài mới từ autoblog hiện trong ≤1h mà không cần rebuild;
// các hit còn lại phục vụ từ cache, giảm CPU/SSR trên Workers Free.
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: {
      canonical: `/${locale}`,
      languages: { vi: '/vi', en: '/en' },
    },
  };
}

export default async function Home() {
  const posts = await getAllPostsUnified();
  
  // Map MDX meta sang format chuẩn cho UI components.
  // Excerpt cắt 140 ký tự (card CSS line-clamp) → giảm ~60KB HTML.
  const articles = posts.map(post => ({
    id: post.slug,
    slug: post.slug,
    title: post.meta.title,
    excerpt: (post.meta.excerpt || '').slice(0, 140),
    category: post.meta.category as Article['category'],
    thumbnail: { url: optimizeThumbnail(post.meta.thumbnail || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', 1200, 65), alt: post.meta.title },
    publishedAt: post.meta.publishedAt
  }));

  // Phân bổ nội dung thông minh: Tính điểm biên tập, đa dạng chuyên mục trong Bento, cân bằng Hero
  const allocated = allocateHomepageContent(articles);

  return (
    <>
      <div className="pt-24 bg-[#F4F4F0]">
        <NewsTicker articles={allocated.ticker} />
      </div>
      <HeroSection article={allocated.hero as unknown as Article} />
      <div className="bg-white">
        <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-9 min-w-0">
            <BentoGrid articles={allocated.bento as unknown as Article[]} />
          </div>
          <div className="lg:col-span-3 py-20">
            <TrendingWidget articles={allocated.trending as unknown as Article[]} />
          </div>
        </div>
      </div>
      <CategorySections articles={articles} />
    </>
  );
}
