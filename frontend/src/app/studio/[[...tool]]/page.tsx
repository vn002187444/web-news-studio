'use client';

import dynamic from 'next/dynamic';

const Studio = dynamic(() => import('./Studio'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#101112', color: '#fff', fontFamily: 'sans-serif' }}>
      Đang tải Sanity Studio...
    </div>
  ),
});

export default function StudioPage() {
  return <Studio />;
}

