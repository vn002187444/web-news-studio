'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import RecommendedArticles from '@/components/ui/RecommendedArticles';
import MarkdownBody from '@/components/ui/MarkdownBody';
import PortableArticleBody from '@/components/ui/PortableArticleBody';
import { useTranslations } from 'next-intl';
import { UnifiedPost } from '@/lib/posts';

interface TocItem { id: string; text: string; level: number }

export default function SingleArticleClient({ content, body, meta, slug, allPosts }: { content: string, body?: any[], meta: any, slug: string, allPosts: UnifiedPost[] }) {
  const t = useTranslations('Common');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState('');
  const [copied, setCopied] = useState(false);

  // Parse h2/h3 trong bài → Sticky TOC
  useEffect(() => {
    const timer = setTimeout(() => {
      const root = document.getElementById('article-content');
      if (!root) return;
      const heads = Array.from(root.querySelectorAll('h2, h3')) as HTMLElement[];
      const items = heads.map((h, i) => {
        const id = h.id || `sec-${i}`;
        h.id = id;
        return { id, text: h.innerText, level: h.tagName === 'H2' ? 2 : 3 };
      });
      setToc(items);
      const obs = new IntersectionObserver(
        (es) => { es.forEach((e) => { if (e.isIntersecting) setActiveId(e.target.id); }); },
        { rootMargin: '-30% 0px -60% 0px' }
      );
      heads.forEach((h) => obs.observe(h));
      return () => obs.disconnect();
    }, 0);
    return () => clearTimeout(timer);
  }, [slug]);

  return (
    <div className="bg-[#FAF9F6] text-[#2C2A29] min-h-screen relative selection:bg-red-500 selection:text-white">
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-red-600 origin-left z-50"
        style={{ scaleX }}
      />

      <article className="pt-32 pb-32 max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Column: Sticky TOC & Socials */}
        <aside className="hidden lg:block col-span-3">
          <div className="sticky top-40">
            {toc.length > 0 && (
              <nav aria-label="Mục lục bài viết" className="mb-10 border-l border-gray-200 pl-4">
                <h4 className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-4">Mục lục</h4>
                <ul className="flex flex-col gap-2">
                  {toc.map((item) => (
                    <li key={item.id} className={item.level === 3 ? 'ml-3' : ''}>
                      <a
                        href={`#${item.id}`}
                        onClick={(e) => { e.preventDefault(); document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' }); }}
                        className={`text-sm leading-snug hover:text-red-600 transition-colors ${activeId === item.id ? 'text-red-600 font-semibold' : 'text-gray-600'}`}
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            <h4 className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-6">Chia sẻ</h4>
            <div className="mt-4">
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(meta.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                  aria-label="Chia sẻ qua X" 
                  className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                >
                  X
                </button>
                <button 
                  onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                  aria-label="Chia sẻ qua LinkedIn" 
                  className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                >
                  in
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  aria-label="Sao chép liên kết"
                  className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors relative"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  {copied && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded whitespace-nowrap">Đã sao chép!</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="col-span-1 lg:col-span-8">
          <header className="mb-12">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4 font-mono text-xs uppercase text-red-600">
                <Link href={`/${meta.category}`} className="hover:underline">{meta.category}</Link>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span className="text-gray-500">{new Date(meta.publishedAt).toLocaleDateString('vi-VN')}</span>
              </div>
              
              {/* AI Text to Speech Button */}
              <button
                onClick={() => {
                  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
                    alert('Trình duyệt của bạn không hỗ trợ tính năng đọc AI.');
                    return;
                  }
                  const synth = window.speechSynthesis;
                  const text = document.getElementById('article-content')?.innerText || meta.excerpt;

                  // Chọn giọng tiếng Việt theo thiết bị (Chrome/Android/iOS load voices bất đồng bộ)
                  const pickViVoice = (): SpeechSynthesisVoice | null => {
                    const voices = synth.getVoices();
                    if (!voices.length) return null;
                    return (
                      voices.find((v) => v.lang?.toLowerCase().startsWith('vi')) ||
                      voices.find((v) => /vietnami?/i.test(v.name)) ||
                      null
                    );
                  };
                  const speak = () => {
                    synth.cancel(); // Stop current playing
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = 'vi-VN';
                    utterance.rate = 1.1; // Hơi nhanh một chút cho giống MC
                    const viVoice = pickViVoice();
                    if (viVoice) utterance.voice = viVoice;
                    synth.speak(utterance);
                  };

                  if (synth.getVoices().length === 0) {
                    // Đợi voices load xong (tối đa ~1.5s) rồi đọc, tránh rơi vào giọng Anh mặc định
                    let done = false;
                    const finish = () => { if (!done) { done = true; speak(); } };
                    synth.onvoiceschanged = finish;
                    setTimeout(finish, 1500);
                    synth.getVoices();
                  } else {
                    speak();
                  }
                }}
                className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2 rounded-full font-mono text-xs uppercase hover:bg-red-600 transition-colors"
                data-cursor="LISTEN"
              >
                <span>▶</span> {t('listen')}
              </button>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight leading-[1.15] mb-8">
              {meta.title}
            </h1>
            
            <p className="text-lg md:text-xl font-serif italic text-gray-600 leading-relaxed">
              {meta.excerpt}
            </p>
          </header>

          <figure className="mb-16">
            <div className="w-full h-[500px] relative overflow-hidden rounded-lg">
<Image 
  src={meta.thumbnail || "https://images.unsplash.com/photo-1677442136019-21780ecad995"}
  alt={meta.title}
  fill
  sizes="(max-width: 768px) 100vw, 1200px"
  className="object-cover"
  priority
  fetchPriority="high"
  loading="eager"
/>
            </div>
          </figure>

          {/* Body — ưu tiên Portable Text (Sanity mới), fallback markdown */}
          <div id="article-content" className="prose prose-lg md:prose-xl prose-serif max-w-none prose-headings:font-serif prose-headings:tracking-tight prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline">
            {body && body.length > 0 ? <PortableArticleBody body={body} /> : <MarkdownBody content={content} />}
          </div>

          {/* Author Tag — hồ sơ tác giả từ Sanity (S3), fallback avatar mặc định */}
          <div className="mt-20 pt-10 border-t border-gray-200 flex items-center gap-6">
            <Image 
              src={meta.authorAvatar || "https://i.pravatar.cc/150?u=author"}
              alt={meta.author || "AI Author"}
              width={80}
              height={80}
              className="rounded-full grayscale"
            />
            <div>
              <h4 className="font-bold uppercase tracking-wider text-sm mb-1">{meta.author || "AI Biên Tập Viên"}</h4>
              <p className="font-mono text-xs text-gray-500 uppercase">{meta.authorRole || "Hệ thống Tự Động Hóa News Studio"}</p>
              {meta.authorBio && <p className="mt-2 text-sm text-gray-600 max-w-xl">{meta.authorBio}</p>}
            </div>
          </div>

          {/* AI Personalized Recommendations */}
          <RecommendedArticles 
            recentPosts={allPosts} 
            currentSlug={slug} 
            currentCategory={meta.category} 
          />
        </div>

      </article>
    </div>
  );
}
