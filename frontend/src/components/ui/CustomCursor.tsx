'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [cursorText, setCursorText] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [enabled, setEnabled] = useState(false);

  // Smooth springs for cursor movement
  const cursorX = useSpring(0, { stiffness: 500, damping: 28 });
  const cursorY = useSpring(0, { stiffness: 500, damping: 28 });

  useEffect(() => {
    // Chỉ bật trên desktop có chuột mịn, tôn trọng reduced-motion
    try {
      const fine = window.matchMedia('(pointer: fine)').matches;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (!fine || reduced || (touch && !fine)) return;
    } catch { /* ignore */ }
    setEnabled(true);
    // Không ép cursor:none toàn body qua JS để tránh kẹt trên mobile;
    // CSS sẽ ẩn cursor khi có custom cursor.
    document.documentElement.classList.add('has-custom-cursor');

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      // Check if hovering over an element with data-cursor
      const target = e.target as HTMLElement;
      const cursorElem = target.closest('[data-cursor]');
      
      if (cursorElem) {
        setIsHovered(true);
        setCursorText(cursorElem.getAttribute('data-cursor') || "");
      } else {
        setIsHovered(false);
        setCursorText("");
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, [cursorX, cursorY]);

  if (!enabled) return null;

  return (
    <>
      {/* Main Cursor Dot */}
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 bg-red-600 rounded-full pointer-events-none z-[1000] mix-blend-difference origin-center"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isHovered ? 4 : 1,
          opacity: isHovered ? 0.8 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {isHovered && (
          <span className="absolute inset-0 flex items-center justify-center text-[4px] font-mono font-bold text-white uppercase tracking-widest scale-50">
            {cursorText}
          </span>
        )}
      </motion.div>
    </>
  );
}
