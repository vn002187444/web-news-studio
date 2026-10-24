'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUSES = [
  '[01/03] INITIALIZING NEWSROOM ENGINE...',
  '[02/03] CALIBRATING 3D NEURAL FEEDS...',
  '[03/03] NEWS STUDIO BROADCAST READY'
];

export default function HomepagePreloader() {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if reduced motion is preferred
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    // Quick exit if already preloaded in this session or prefers reduced motion
    if (sessionStorage.getItem('ns_preloaded') || mediaQuery.matches) {
      setIsVisible(false);
      return;
    }

    // Simulate preload progress
    const duration = 1200; // Reduced from 2500ms to 1200ms for faster perceived load
    const intervalTime = 50;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const currentProgress = Math.min(Math.round((currentStep / steps) * 100), 100);
      setProgress(currentProgress);

      if (currentProgress < 33) setStatusIndex(0);
      else if (currentProgress < 85) setStatusIndex(1);
      else setStatusIndex(2);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsVisible(false);
          sessionStorage.setItem('ns_preloaded', 'true');
        }, 200); // Reduced hold from 500ms to 200ms
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999999] bg-[#0c0c0c] text-white flex flex-col items-center justify-center font-mono overflow-hidden"
        style={{ pointerEvents: 'none' }} // Allow LCP image discovery below while preloader animates
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, y: '-100%' }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      >
        <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6">
          <motion.div 
            className="text-4xl sm:text-6xl font-bold tracking-tighter tabular-nums mb-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {progress}%
          </motion.div>
          
          <div className="w-full h-[2px] bg-neutral-800 relative mb-4 overflow-hidden rounded-full">
            <motion.div 
              className="absolute top-0 left-0 bottom-0 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.1 }}
            />
          </div>

          <motion.div 
            className="text-[10px] sm:text-xs text-red-500 tracking-widest text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={statusIndex}
          >
            {STATUSES[statusIndex]}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
