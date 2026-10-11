'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleSystem = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  
  // Create 2000 particles
  const count = 2000;
  
  const [positions, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Sine wave topology initial positions (y will be driven by shader)
      const x = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 40;
      const y = 0;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      sizes[i] = Math.random() * 2.0;
    }
    return [positions, sizes];
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      // Base rotation + phản ứng vi mô với chuột (spec GĐ3)
      const px = state.pointer.x || 0;
      const py = state.pointer.y || 0;
      
      pointsRef.current.rotation.y = THREE.MathUtils.lerp(
        pointsRef.current.rotation.y,
        state.clock.elapsedTime * 0.05 + px * 0.2,
        0.06
      );
      pointsRef.current.rotation.x = THREE.MathUtils.lerp(
        pointsRef.current.rotation.x,
        py * 0.2,
        0.06
      );
    }
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      // Đổi màu mượt cyan -> tím theo X chuột
      const px = state.pointer.x || 0;
      matRef.current.uniforms.uShift.value = THREE.MathUtils.lerp(
        matRef.current.uniforms.uShift.value,
        (px + 1) / 2,
        0.06
      );
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent={true}
        uniforms={{ uShift: { value: 0.5 }, uTime: { value: 0.0 } }}
        vertexShader={`
          attribute float size;
          varying vec3 vPosition;
          uniform float uTime;
          void main() {
            vec3 pos = position;
            // Uốn sóng sin
            pos.y += sin(pos.x * 0.5 + uTime) * cos(pos.z * 0.5 + uTime) * 2.0;
            vPosition = pos;
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying vec3 vPosition;
          uniform float uShift;
          void main() {
            // Circle shape
            float distance = length(gl_PointCoord - vec2(0.5));
            if (distance > 0.5) discard;
            
            // Đổi màu mượt xanh điện tử <-> tím huỳnh quang theo chuột
            vec3 cyan = vec3(0.0, 0.9, 1.0);
            vec3 violet = vec3(0.65, 0.1, 1.0);
            vec3 teal = vec3(0.0, 1.0, 0.8);
            vec3 base = mix(cyan, violet, uShift);
            vec3 color = mix(teal, base, clamp(vPosition.y * 0.08 + 0.5, 0.0, 1.0));
            
            // Soft glow edge
            float alpha = 1.0 - (distance * 2.0);
            gl_FragColor = vec4(color, alpha * 0.85);
          }
        `}
      />
    </points>
  );
};

export default function ParticleNetwork() {
  const [disabled, setDisabled] = useState(false);
  useEffect(() => {
    try {
      const conn = navigator.connection;
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
