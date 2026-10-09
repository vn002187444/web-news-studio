'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [cursorText, setCursorText] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isDown, setIsDown] = useState(false);
  const [enabled, setEnabled] = useState(false);

  // Chấm đi nhanh bám sát chuột, vòng ngoài trễ hơn tạo vệt (trail)
  const dotX = useSpring(0, { stiffness: 900, damping: 45, mass: 0.3 });
  const dotY = useSpring(0, { stiffness: 900, damping: 45, mass: 0.3 });
  const ringX = useSpring(0, { stiffness: 220, damping: 22, mass: 0.6 });
  const ringY = useSpring(0, { stiffness: 220, damping: 22, mass: 0.6 });

  useEffect(() => {
    // Chỉ bật trên desktop có chuột mịn, tôn trọng reduced-motion
    try {
      const fine = window.matchMedia('(pointer: fine)').matches;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (!fine || reduced || (touch && !fine)) return;
    } catch { /* ignore */ }
    setEnabled(true);
    document.documentElement.classList.add('has-custom-cursor');

    const handleMouseMove = (e: MouseEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      ringX.set(e.clientX);
      ringY.set(e.clientY);

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
    const handleDown = () => setIsDown(true);
    const handleUp = () => setIsDown(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, [dotX, dotY, ringX, ringY]);

  if (!enabled) return null;

  return (
    <>
      {/* Vòng trail ngoài — viền đỏ dày, dễ thấy trên cả nền sáng/tối */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[999] rounded-full border-2 border-red-600 origin-center flex items-center justify-center"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: isHovered ? 76 : 36,
          height: isHovered ? 76 : 36,
          scale: isDown ? 0.85 : 1,
          backgroundColor: isHovered ? 'rgba(220, 38, 38, 0.92)' : 'rgba(220, 38, 38, 0)',
          borderColor: isHovered ? 'rgba(220, 38, 38, 1)' : 'rgba(220, 38, 38, 0.75)',
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 24 }}
      >
        {isHovered && (
          <span className="font-mono text-[10px] font-bold text-white uppercase tracking-widest px-1 text-center leading-tight">
            {cursorText}
          </span>
        )}
      </motion.div>
      {/* Chấm tâm đặc — luôn nhìn thấy vị trí chính xác */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-red-600 rounded-full pointer-events-none z-[1000] origin-center ring-2 ring-white/80"
        style={{ x: dotX, y: dotY, translateX: '-50%', translateY: '-50%' }}
        animate={{ scale: isDown ? 0.6 : 1 }}
      />
    </>
  );
}
