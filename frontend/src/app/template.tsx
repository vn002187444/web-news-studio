'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export default function Template({ children }: { children: ReactNode }) {
  return (
    <>
      <motion.div
        className="fixed inset-0 z-[100] bg-[#0c0c0c]/80 backdrop-blur-xl pointer-events-none flex items-center justify-center"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        exit={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div 
          className="flex flex-col items-center justify-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Geometric Red Emblem */}
          <div className="w-16 h-16 relative mb-6">
            <div className="absolute inset-0 border-2 border-red-600 rounded-sm transform rotate-45 animate-pulse" />
            <div className="absolute inset-2 bg-red-600 rounded-sm" />
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-white/80 animate-pulse">
            Tải Bài Viết / Loading Content...
          </p>
        </motion.div>
      </motion.div>
      {children}
    </>
  );
}
