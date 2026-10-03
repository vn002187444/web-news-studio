'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link } from '@/i18n/routing';

export default function LifestyleTemplate({ articles }: { articles: any[] }) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Calculate the horizontal shift based on scroll progress
  const rawX = useTransform(scrollYProgress, [0, 1], ["0%", "-66.66%"]);
  const x = useSpring(rawX, { stiffness: 90, damping: 22 });
  // Progress line + parallax Y cho ảnh ("trượt nhẹ trong khung")
  const progressScale = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });
  const imgY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);

  const safeArticles = articles && articles.length > 0 ? articles : [];
  // Không demo cứng — empty-state khi thiếu bài
  const lifestyleArticles = safeArticles.slice(0, 3);

  return (
    <div className="bg-[#FAF9F6] text-[#2C2A29] min-h-screen pt-32">
      <div className="max-w-[1600px] mx-auto px-6 mb-20">
        <h1 className="text-6xl md:text-8xl font-serif font-light tracking-tighter uppercase italic">
          PHONG CÁCH SỐNG <br /> <span className="font-sans font-bold not-italic">ĐƯƠNG ĐẠI</span>
        </h1>
      </div>

      {/* Horizontal Scroll Section */}
      <section ref={targetRef} className="relative h-[300vh]">
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          {/* Progress line mảnh trượt theo scroll */}
          <motion.div aria-hidden="true" style={{ scaleX: progressScale }} className="absolute top-24 left-6 right-6 h-px bg-[#2C2A29]/70 origin-left" />
          {lifestyleArticles.length === 0 ? (
            <p className="mx-auto font-mono text-xs uppercase tracking-widest text-gray-500 border border-dashed p-8">Chưa có bài Đời Sống — hệ thống sẽ tự động cập nhật bài viết mới.</p>
          ) : (
          <motion.div style={{ x }} className="flex gap-12 px-6 pb-20 w-[300vw]">
            {lifestyleArticles.map((item, i) => (
              <motion.div
                key={item.slug || i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.6 }}
                transition={{ duration: 0.7, delay: 0.08 }}
              >
              <Link href={`/lifestyle/${item.slug}`} className="w-[80vw] md:w-[60vw] lg:w-[45vw] h-[60vh] flex flex-col shrink-0 group cursor-pointer">
                <div className="w-full h-full relative overflow-hidden mb-6">
                  {/* Ken Burns auto 5%/10s + parallax Y theo scroll */}
                  <motion.div style={{ y: imgY }} className="absolute -inset-[6%]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnail?.url}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover animate-kenburns-slow"
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-700" />
                </div>
                <h2 className="font-serif text-3xl md:text-5xl font-bold uppercase tracking-tighter line-clamp-2">
                  {item.title}
                </h2>
                <div className="mt-4 font-mono text-sm uppercase tracking-widest text-gray-500 flex items-center gap-4">
                  <span>Kỳ {i + 1}</span>
                  <span className="w-12 h-[1px] bg-gray-300" />
                  <span>Khám phá</span>
                </div>
              </Link>
              </motion.div>
            ))}
          </motion.div>
          )}
        </div>
      </section>

      {/* Standard grid below the scroll */}
      <div className="max-w-[1600px] mx-auto px-6 py-32 border-t border-gray-200">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="font-serif text-4xl mb-6">Chuẩn Mực Sống Mới</h3>
              <p className="font-sans text-lg text-gray-600 leading-relaxed max-w-md">
                Khám phá những giao điểm giữa thẩm mỹ tinh tế, công nghệ thông minh và phong cách sống bền vững. Định hình phong cách sống tương lai.
              </p>
            </div>
         </div>
      </div>
    </div>
  );
}
