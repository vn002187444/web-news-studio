'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';

export default function HeroSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section ref={containerRef} className="relative pt-32 pb-20 px-6 min-h-[90vh] flex flex-col justify-center overflow-hidden">
      <div className="max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left: Typography */}
        <div className="lg:col-span-7 z-10">
          <motion.h1 
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[105px] xl:text-[120px] leading-[1.08] font-serif tracking-normal uppercase mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            Tương Lai <br className="hidden sm:inline" />
            <span className="italic font-light">Đã</span> Bắt Đầu
          </motion.h1>
          
          <motion.p 
            className="font-mono text-sm uppercase max-w-md mt-8 border-l-2 border-[#111111] pl-4 text-gray-800 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Khám phá những điểm giao thoa giữa Công nghệ, Blockchain và Phong cách sống thế hệ mới.
          </motion.p>
        </div>

        {/* Right: Parallax Image */}
        <div className="lg:col-span-5 h-[500px] lg:h-[700px] w-full relative overflow-hidden bg-gray-200">
          <motion.div style={{ y }} className="w-full h-[120%] -top-[10%] relative">
            <Image 
              src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80"
              alt="Retro Tech Setup"
              fill
              className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
