import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { optimizeThumbnail } from './image';

describe('optimizeThumbnail', () => {
  test('should return fallback image for falsy inputs', () => {
    assert.strictEqual(optimizeThumbnail(null), '/images/placeholders/fallback.webp');
    assert.strictEqual(optimizeThumbnail(undefined), '/images/placeholders/fallback.webp');
    assert.strictEqual(optimizeThumbnail(''), '/images/placeholders/fallback.webp');
  });

  test('should avoid double-encoding for Cloudinary URLs', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/v1544170366/dog.jpg';
    assert.strictEqual(optimizeThumbnail(url), url);
  });

  test('should avoid double-encoding for Sanity URLs', () => {
    const url = 'https://cdn.sanity.io/images/project/dataset/image.jpg?w=800';
    assert.strictEqual(optimizeThumbnail(url), url);
  });

  test('should use Next.js Image Optimization API for internal URLs', () => {
    const url = '/images/local-image.jpg';
    const result = optimizeThumbnail(url);
    assert.strictEqual(result, `/_next/image?url=${encodeURIComponent(url)}&w=1200&q=65`);
  });

  test('should allow custom width and quality for internal URLs', () => {
    const url = '/images/local-image.jpg';
    const result = optimizeThumbnail(url, 800, 80);
    assert.strictEqual(result, `/_next/image?url=${encodeURIComponent(url)}&w=800&q=80`);
  });

  test('should return original URL for other external URLs', () => {
    const url = 'https://example.com/image.jpg';
    assert.strictEqual(optimizeThumbnail(url), url);
  });
});
