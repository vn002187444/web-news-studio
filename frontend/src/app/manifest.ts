import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'News Studio',
    short_name: 'NewsStudio',
    description: 'Next-Gen AI Journalism Platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#F4F4F0',
    theme_color: '#111111',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
