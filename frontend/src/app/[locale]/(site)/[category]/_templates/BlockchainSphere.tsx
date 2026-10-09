'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

// Quả cầu wireframe Three.js xoay + Bloom — tách riêng để dynamic import (ssr:false),
// tránh nhồi three.js (~600KB) vào bundle trang Blockchain.
function WireframeSphere() {
  const meshRef = useRef<any>(null);
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
      meshRef.current.rotation.x += delta * 0.1;
    }
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2.5, 16, 16]} />
      <meshBasicMaterial color="#4ade80" wireframe transparent opacity={0.3} />
    </mesh>
  );
}

export default function BlockchainSphere() {
  return (
    <div aria-hidden="true" className="hidden md:block relative w-[300px] h-[300px] shrink-0">
      <Suspense fallback={<div className="w-full h-full rounded-full border border-green-500/20 animate-pulse" />}>
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 1.5]} performance={{ min: 0.5 }}>
          <WireframeSphere />
          <EffectComposer>
            <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} intensity={1.5} />
          </EffectComposer>
        </Canvas>
      </Suspense>
    </div>
  );
}
