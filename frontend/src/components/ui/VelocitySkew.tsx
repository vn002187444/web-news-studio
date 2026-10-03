'use client';

import { useRef } from 'react';
import { motion, useScroll, useVelocity, useSpring, useTransform } from 'framer-motion';

export default function VelocitySkew({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });

  // Map velocity to a skew degree (e.g. max 10 degrees)
  const skew = useTransform(smoothVelocity, [-1000, 1000], [5, -5]);

  return (
    <motion.div ref={containerRef} style={{ skewY: skew }} className="origin-center w-full">
      {children}
    </motion.div>
  );
}
