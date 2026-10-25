'use client';

import { useMemo, useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import AdaptiveImage from './AdaptiveImage';
import { useArticleTracker } from '@/hooks/useArticleTracker';
import { useTranslations } from 'next-intl';
import { UnifiedPost } from '@/lib/posts';

export default function RecommendedArticles({ recentPosts, currentSlug, currentCategory }: { recentPosts: UnifiedPost[], currentSlug: string, currentCategory: string }) {
  const t = useTranslations('Common');
  // Kích hoạt Tracker: Ghi nhận bài đang đọc vào não bộ (LocalStorage)
  const profile = useArticleTracker(currentCategory, currentSlug);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Thuật toán Recommendation Engine
  const recommendedPosts = useMemo(() => {
    if (!profile || !mounted) return [];

    // 1. Lọc bỏ bài hiện tại và bài đã đọc
    const unreadPosts = recentPosts.filter(
      post => post.slug !== currentSlug && !profile.history.includes(post.slug)
    );

    // 2. Chấm điểm từng bài viết dựa trên sở thích (Category Scores)
    const scoredPosts = unreadPosts.map(post => {
      let score = 0;
      // Cộng điểm nếu thuộc chuyên mục user hay đọc
      const categoryScore = profile.categoryScores[post.meta?.category] || 0;
      score += categoryScore * 2; // Nhân hệ số 2 cho chuyên mục
      
      // Nếu bài cùng chuyên mục với bài hiện tại, cộng thêm điểm context
      if (post.meta?.category === currentCategory) {
        score += 1;
      }
      
      return { ...post, score };
    });

    // 3. Sắp xếp theo điểm số giảm dần
    scoredPosts.sort((a, b) => b.score - a.score);

    // 4. Trả về top 3 bài
    return scoredPosts.slice(0, 3);
  }, [profile, recentPosts, currentSlug, currentCategory, mounted]);

  if (!mounted || recommendedPosts.length === 0) return null;

  return (
    <div className="mt-24 pt-16 border-t border-gray-200">
      <div className="flex items-center gap-4 mb-8">
        <h3 className="font-serif text-3xl font-bold">{t('for_you')}</h3>
        <span className="font-mono text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-full uppercase tracking-widest">
          {t('ai_suggested')}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {recommendedPosts.map((post) => (
          <Link href={`/${post.meta.category}/${post.slug}`} key={post.slug} className="group block cursor-pointer" data-cursor="READ">
            <div className="relative w-full h-48 mb-4 overflow-hidden rounded-xl bg-gray-100">
              <AdaptiveImage 
                src={post.meta.thumbnail || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'}
                alt={post.meta.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="font-mono text-xs uppercase text-red-600 mb-2">
              {post.meta.category}
            </div>
            <h4 className="font-serif text-xl font-bold leading-tight group-hover:underline decoration-red-500 underline-offset-4">
              {post.meta.title}
            </h4>
          </Link>
        ))}
      </div>
    </div>
  );
}
