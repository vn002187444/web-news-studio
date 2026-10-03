import { notFound } from 'next/navigation';
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

import { getPostsByCategoryUnified } from '@/lib/posts';

const CATEGORIES = ['tech', 'blockchain', 'game', 'finance', 'lifestyle', 'sports', 'entertainment', 'education', 'science'];

// Prerender tĩnh mọi combo locale×category cho Cloudflare Pages
export function generateStaticParams() {
  return ['vi', 'en'].flatMap((locale) => CATEGORIES.map((category) => ({ locale, category })));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  
  // Validate category
  const validCategories = ['tech', 'blockchain', 'game', 'finance', 'lifestyle', 'sports', 'entertainment', 'education', 'science'];
  if (!validCategories.includes(category)) {
    notFound();
  }

  // Fetch real articles — Sanity-first, MDX fallback
  const rawPosts = await getPostsByCategoryUnified(category);
  const articles = rawPosts.map(post => ({
    id: post.slug,
    slug: post.slug,
    title: post.meta.title,
    excerpt: post.meta.excerpt,
    category: post.meta.category,
    thumbnail: { url: post.meta.thumbnail || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', alt: post.meta.title },
    tags: post.meta.tags || [],
    publishedAt: post.meta.publishedAt
  }));

  // Render specific template based on category
  switch (category) {
    case 'tech':
      return <TechTemplate articles={articles} />;
    case 'blockchain':
      return <BlockchainTemplate articles={articles} />;
    case 'game':
      return <GameTemplate articles={articles} />;
    case 'finance':
      return <FinanceTemplate articles={articles} />;
    case 'lifestyle':
      return <LifestyleTemplate articles={articles} />;
    case 'sports':
      return <SportsTemplate articles={articles} />;
    case 'entertainment':
      return <EntertainmentTemplate articles={articles} />;
    case 'education':
      return <EducationTemplate articles={articles} />;
    case 'science':
      return <ScienceTemplate articles={articles} />;
    default:
      return <DefaultTemplate category={category} articles={articles} />;
  }
}
