'use client';

import dynamic from 'next/dynamic';
import React, { ReactNode } from 'react';

// Defer heavy client-only interactive components with ssr: false inside a Client Component wrapper
const HomepagePreloader = dynamic(
  () => import('@/components/ui/HomepagePreloader'),
  { ssr: false }
);

const CustomCursor = dynamic(
  () => import('@/components/ui/CustomCursor'),
  { ssr: false }
);

const SmoothScrollProvider = dynamic(
  () => import('@/components/ui/SmoothScrollProvider'),
  { ssr: false, loading: () => null }
);

export default function ClientDecorations({ children }: { children: ReactNode }) {
  return (
    <>
      <HomepagePreloader />
      <CustomCursor />
      <SmoothScrollProvider>{children}</SmoothScrollProvider>
    </>
  );
}
