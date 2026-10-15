'use client';

import Image from 'next/image';
import { Link } from '@/i18n/routing';

interface SectionArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  thumbnail: { url: string; alt: string };
  publishedAt: string;
}

const CATEGORY_ORDER = [
  'world',
  'tech',
  'finance',
  'blockchain',
  'game',
  'sports',
  'entertainment',
  'education',
  'science',
  'lifestyle',
];

const CATEGORY_NAMES: Record<string, string> = {
  world: 'Thời Sự',
  tech: 'Công Nghệ',
  blockchain: 'Blockchain',
  game: 'Game & Esports',
  finance: 'Tài Chính',
  lifestyle: 'Đời Sống',
  sports: 'Thể Thao',
  entertainment: 'Giải Trí',
  education: 'Giáo Dục',
  science: 'Khoa Học',
};

export default function CategorySections({ articles }: { articles: SectionArticle[] }) {
  const groups = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    posts: (articles || []).filter((a) => a.category === cat).slice(0, 4),
  })).filter((g) => g.posts.length > 0);

  if (groups.length === 0) return null;

  return (
    <div className="bg-[#F4F4F0]">
      <div className="max-w-[1600px] mx-auto px-6 py-16 space-y-16">
        {groups.map(({ category, posts }) => (
          <section key={category} aria-label={CATEGORY_NAMES[category] || category}>
            <div className="flex items-end justify-between border-b-2 border-black pb-3 mb-8">
              <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-tight">
                {CATEGORY_NAMES[category] || category}
              </h2>
              <Link
                href={`/${category}`}
                className="font-mono text-xs uppercase tracking-widest hover:underline underline-offset-4"
                data-cursor="MORE"
              >
                Xem tất cả →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/${post.category}/${post.slug}`}
                  className="group bg-white border border-black/10 hover:border-black/30 transition-colors overflow-hidden flex flex-col"
                  data-cursor="READ"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                    <Image
                      src={post.thumbnail.url}
                      alt={post.thumbnail.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-serif text-lg font-bold leading-snug line-clamp-3 group-hover:underline underline-offset-4">
                      {post.title}
                    </h3>
                    <p className="mt-2 font-sans text-sm text-gray-600 line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
