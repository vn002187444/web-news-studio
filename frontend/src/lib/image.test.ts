import { describe, it, expect } from 'vitest';
import { optimizeThumbnail } from './image';

describe('optimizeThumbnail', () => {
  it('should return fallback image for falsy inputs', () => {
    expect(optimizeThumbnail(null)).toBe('/images/placeholders/fallback.webp');
    expect(optimizeThumbnail(undefined)).toBe('/images/placeholders/fallback.webp');
    expect(optimizeThumbnail('')).toBe('/images/placeholders/fallback.webp');
  });

  it('should avoid double-encoding for Cloudinary URLs', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/v1544170366/dog.jpg';
    expect(optimizeThumbnail(url)).toBe(url);
  });

  it('should avoid double-encoding for Sanity URLs', () => {
    const url = 'https://cdn.sanity.io/images/project/dataset/image.jpg?w=800';
    expect(optimizeThumbnail(url)).toBe(url);
  });

  it('should use Next.js Image Optimization API for internal URLs', () => {
    const url = '/images/local-image.jpg';
    const result = optimizeThumbnail(url);
    expect(result).toBe(`/_next/image?url=${encodeURIComponent(url)}&w=1200&q=65`);
  });

  it('should allow custom width and quality for internal URLs', () => {
    const url = '/images/local-image.jpg';
    const result = optimizeThumbnail(url, 800, 80);
    expect(result).toBe(`/_next/image?url=${encodeURIComponent(url)}&w=800&q=80`);
  });

  it('should return original URL for other external URLs', () => {
    const url = 'https://example.com/image.jpg';
    expect(optimizeThumbnail(url)).toBe(url);
  });
});
