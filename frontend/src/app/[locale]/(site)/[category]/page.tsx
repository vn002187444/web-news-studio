import { notFound } from 'next/navigation';
import WorldTemplate from './_templates/WorldTemplate';
import TechTemplate from './_templates/TechTemplate';
import BlockchainTemplate from './_templates/BlockchainTemplate';
import GameTemplate from './_templates/GameTemplate';
import FinanceTemplate from './_templates/FinanceTemplate';
import LifestyleTemplate from './_templates/LifestyleTemplate';
import SportsTemplate from './_templates/SportsTemplate';
import EntertainmentTemplate from './_templates/EntertainmentTemplate';
import EducationTemplate from './_templates/EducationTemplate';
import ScienceTemplate from './_templates/ScienceTemplate';
import DefaultTemplate from './_templates/DefaultTemplate';

import { Metadata } from 'next';
import { getPostsByCategoryUnified } from '@/lib/posts';
import { optimizeThumbnail } from '@/lib/image';

const CATEGORIES = ['world', 'tech', 'blockchain', 'game', 'finance', 'lifestyle', 'sports', 'entertainment', 'education', 'science'];

const CATEGORY_META: Record<string, { title: string; description: string }> = {
  world: { title: 'Thời Sự & Thế Giới — Tin Tức Quốc Tế, Chính Trị', description: 'Tin thời sự quốc tế, chính trị, địa chính trị và toàn cầu mới nhất.' },
  tech: { title: 'Công Nghệ — AI, Smartphone, Startup', description: 'Tin công nghệ, AI, smartphone và startup mới nhất.' },
  blockchain: { title: 'Blockchain — Web3, Bitcoin, DeFi', description: 'Giá Bitcoin, Web3, NFT và DeFi cập nhật.' },
  game: { title: 'Game — Esports, PC, Mobile', description: 'Esports, review game PC/Console và mobile.' },
  finance: { title: 'Tài Chính — Chứng khoán, Vĩ mô', description: 'Chứng khoán, bất động sản và kinh tế vĩ mô.' },
  lifestyle: { title: 'Lifestyle — Sống, Du lịch, Sức khỏe', description: 'Phong cách sống, du lịch và xu hướng Gen Z.' },
  sports: { title: 'Thể Thao', description: 'Bóng đá, giải đấu và tin thể thao.' },
  entertainment: { title: 'Giải Trí', description: 'Điện ảnh, âm nhạc và văn hóa đại chúng.' },
  education: { title: 'Giáo Dục', description: 'Tri thức số và kỹ năng tương lai.' },
  science: { title: 'Khoa Học', description: 'Vũ trụ, phát minh và công nghệ sinh học.' },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string }> }): Promise<Metadata> {
  const { locale, category } = await params;
  const meta = CATEGORY_META[category] || { title: category, description: `Tin ${category} mới nhất.` };
  const url = `/${locale}/${category}`;
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: url,
      languages: { vi: `/vi/${category}`, en: `/en/${category}` },
    },
    openGraph: { title: meta.title, description: meta.description, url, type: 'website' },
  };
}

// ISR 1h: giảm SSR lặp lại trên Workers Free (CPU 10ms/invocation).
export const revalidate = 3600;

// Prerender tĩnh mọi combo locale×category cho Cloudflare Pages
export function generateStaticParams() {
  return ['vi', 'en'].flatMap((locale) => CATEGORIES.map((category) => ({ locale, category })));
}

import Pagination from '@/components/ui/Pagination';

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category } = await params;
  const searchParamsValue = await searchParams;
  
  // Validate category
  const validCategories = ['world', 'tech', 'blockchain', 'game', 'finance', 'lifestyle', 'sports', 'entertainment', 'education', 'science'];
  if (!validCategories.includes(category)) {
    notFound();
  }

  // Xử lý phân trang
  const pageStr = searchParamsValue?.page;
  const currentPage = typeof pageStr === 'string' ? parseInt(pageStr, 10) || 1 : 1;
  const itemsPerPage = 12;

  // Fetch real articles — Sanity-first, MDX fallback.
  // Excerpt cắt 140 ký tự (card line-clamp, không đổi giao diện) → nhẹ HTML/RSC payload.
  const rawPosts = await getPostsByCategoryUnified(category);
  const totalItems = rawPosts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPosts = rawPosts.slice(startIndex, startIndex + itemsPerPage);

  const articles = paginatedPosts.map(post => ({
    id: post.slug,
    slug: post.slug,
    title: post.meta.title,
    excerpt: (post.meta.excerpt || '').slice(0, 140),
    category: post.meta.category,
    thumbnail: { url: optimizeThumbnail(post.meta.thumbnail || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', 1200, 65), alt: post.meta.title },
    tags: post.meta.tags || [],
    publishedAt: post.meta.publishedAt
  }));

  // Render specific template based on category
  let TemplateComponent = null;
  switch (category) {
    case 'world':
      TemplateComponent = <WorldTemplate articles={articles} />;
      break;
    case 'tech':
      TemplateComponent = <TechTemplate articles={articles} />;
      break;
    case 'blockchain':
      TemplateComponent = <BlockchainTemplate articles={articles} />;
      break;
    case 'game':
      TemplateComponent = <GameTemplate articles={articles} />;
      break;
    case 'finance':
      TemplateComponent = <FinanceTemplate articles={articles} />;
      break;
    case 'lifestyle':
      TemplateComponent = <LifestyleTemplate articles={articles} />;
      break;
    case 'sports':
      TemplateComponent = <SportsTemplate articles={articles} />;
      break;
    case 'entertainment':
      TemplateComponent = <EntertainmentTemplate articles={articles} />;
      break;
    case 'education':
      TemplateComponent = <EducationTemplate articles={articles} />;
      break;
    case 'science':
      TemplateComponent = <ScienceTemplate articles={articles} />;
      break;
    default:
      TemplateComponent = <DefaultTemplate category={category} articles={articles} />;
  }

  return (
    <>
      {TemplateComponent}
      <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl={`/${category}`} />
    </>
  );
}
