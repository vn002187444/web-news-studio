import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Metadata } from 'next';
import { getPostsByTagUnified, getAllTagsUnified } from '@/lib/posts';
import { optimizeThumbnail } from '@/lib/image';

// Trang chủ đề theo tag: /vi/tag/kbo-league — gom mọi bài có tag đó (mọi chuyên mục).
// Giải quyết việc các "nhánh" như Esports / DeFi / AI chỉ là nhãn trang trí, không có trang lọc riêng.
export async function generateStaticParams() {
  try {
    const tags = await getAllTagsUnified();
    return ['vi', 'en'].flatMap((locale) => tags.map((t) => ({ locale, tag: t.slug })));
  } catch {
    return [{ locale: 'vi', tag: 'ai' }];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; tag: string }> }): Promise<Metadata> {
  const { locale, tag } = await params;
  const { tag: label, posts } = await getPostsByTagUnified(tag);
  const title = `Chủ đề ${label} — ${posts.length} bài viết`;
  const url = `/${locale}/tag/${tag}`;
  return {
    title,
    description: `Tổng hợp ${posts.length} bài viết về ${label} mới nhất.`,
    alternates: { canonical: url, languages: { vi: `/vi/tag/${tag}`, en: `/en/tag/${tag}` } },
    openGraph: { title, description: `Tổng hợp ${posts.length} bài viết về ${label}.`, url, type: 'website' },
  };
}

export const revalidate = 3600;

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const { tag: label, posts } = await getPostsByTagUnified(tag);
  if (!posts || posts.length === 0) notFound();

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-[1200px] mx-auto">
        <p className="font-mono text-xs uppercase tracking-widest opacity-60 mb-2">Chủ đề / Tag</p>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-2">#{label}</h1>
        <p className="opacity-70 mb-10">{posts.length} bài viết</p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} href={`/${post.meta.category}/${post.slug}`} className="group block border rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={optimizeThumbnail(post.meta.thumbnail, 800, 65)}
                  alt={post.meta.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-4">
                <p className="text-xs uppercase tracking-widest opacity-60 mb-1">{post.meta.category}</p>
                <h2 className="font-semibold leading-snug line-clamp-2">{post.meta.title}</h2>
                <p className="text-sm opacity-70 mt-1 line-clamp-2">{(post.meta.excerpt || '').slice(0, 140)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
