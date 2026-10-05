'use client';

import { useRef } from 'react';
import { motion, useScroll, useVelocity, useSpring, useTransform } from 'framer-motion';

export default function VelocitySkew({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  // Mượt kiểu Antigravity: lò xo mềm + damping cao để triệt rung trackpad
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 30,
    stiffness: 120,
    mass: 0.8,
  });

  // Map velocity to a skew degree — kẹp nhẹ ±2° để không rung layout
  const skew = useTransform(smoothVelocity, [-2000, 2000], [2, -2]);

  return (
    <motion.div ref={containerRef} style={{ skewY: skew }} className="origin-center w-full">
      {children}
    </motion.div>
  );
}
