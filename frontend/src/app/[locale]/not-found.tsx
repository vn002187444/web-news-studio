import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getAllPostsUnified } from '@/lib/posts';
import BentoGrid from '@/components/ui/BentoGrid';

export default async function NotFound() {
  // const t = await getTranslations('NotFound');

  // Lấy 5 bài viết nổi bật
  const allPosts = await getAllPostsUnified();
  const featuredPosts = allPosts.slice(0, 5).map(post => ({
    id: post.slug,
    slug: post.slug,
    title: post.meta.title,
    excerpt: post.meta.excerpt || '',
    category: post.meta.category as any,
    thumbnail: { url: post.meta.thumbnail || '/placeholder.jpg', alt: post.meta.title },
    tags: post.meta.tags || [],
    publishedAt: post.meta.publishedAt
  }));

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Không tìm thấy trang</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>

        {/* Thanh tìm kiếm giả/gợi ý */}
        <div className="max-w-md mx-auto mb-8 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex items-center border border-gray-200 dark:border-gray-700">
          <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-gray-500 text-sm">Nhấn <kbd className="bg-white dark:bg-gray-700 px-2 py-1 rounded shadow-sm mx-1">Cmd/Ctrl + K</kbd> để tìm kiếm</span>
        </div>

        <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full transition-colors">
          Về trang chủ
        </Link>
      </div>

      {featuredPosts.length > 0 && (
        <div className="mt-16">
          <h3 className="text-xl font-bold mb-6 border-b pb-2">Có thể bạn sẽ thích</h3>
          <BentoGrid articles={featuredPosts} />
        </div>
      )}
    </div>
  );
}
