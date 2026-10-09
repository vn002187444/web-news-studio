'use client';

import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ParticleSystem } from './ParticleSystem';

export default function ParticleNetwork() {
  const [disabled, setDisabled] = useState(false);
  useEffect(() => {
    try {
      const conn = (navigator as any).connection;
      const saveData = conn?.saveData;
      const weakNet = conn && (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g');
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (saveData || weakNet || reduced) setDisabled(true);
    } catch { /* ignore */ }
  }, []);

  if (disabled) {
    return (
      <div className="absolute inset-0 w-full h-full -z-10 bg-black overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(0,255,200,0.15),transparent),radial-gradient(ellipse_at_70%_80%,rgba(140,0,255,0.2),transparent)]" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full -z-10 bg-black overflow-hidden" aria-hidden="true">
      <span className="sr-only">Interactive 3D particle network background</span>
      <Canvas camera={{ position: [0, 5, 20], fov: 60 }} dpr={[1, 1.5]} performance={{ min: 0.5 }}>
        <fog attach="fog" args={['#000000', 10, 40]} />
        <ParticleSystem />
      </Canvas>
    </div>
  );
}
