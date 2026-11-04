'use client';

import { ReactLenis } from 'lenis/react';
import { ReactNode, useEffect, useState } from 'react';

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [enableLenis, setEnableLenis] = useState(false);

  useEffect(() => {
    try {
      // Chỉ kích hoạt Lenis trên desktop có chuột (pointer: fine), tránh block main thread trên mobile
      const fine = window.matchMedia('(pointer: fine)').matches;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (fine && !reduced) {
        setEnableLenis(true);
      }
    } catch { /* ignore */ }
  }, []);

  if (!enableLenis) return <>{children}</>;

  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
