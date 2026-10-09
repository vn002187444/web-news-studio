import { describe, it, expect } from 'vitest';
import { toSlug } from './site';

describe('toSlug', () => {
  it('should convert normal strings to lowercase with hyphens', () => {
    expect(toSlug('Hello World')).toBe('hello-world');
    expect(toSlug('Foo Bar Baz')).toBe('foo-bar-baz');
  });

  it('should remove diacritics and handle accented characters', () => {
    expect(toSlug('café')).toBe('cafe');
    expect(toSlug('Tiếng Việt')).toBe('tieng-viet');

    // Note: This tests the current implementation's behavior.
    // 'Đ' becomes 'đ' (lowercase). 'đ' is not a basic a-z character.
    // The current regex /[^a-z0-9]+/g replaces 'đ' with '-'.
    // So 'Đường' -> 'đường' -> 'uong' (đ becomes -, ường becomes uong, then -uong becomes uong after trim).
    expect(toSlug('Đường')).toBe('uong');
  });

  it('should replace special characters with hyphens', () => {
    expect(toSlug('hello @ world')).toBe('hello-world');
    expect(toSlug('what%is&this')).toBe('what-is-this');
  });

  it('should remove leading and trailing hyphens', () => {
    expect(toSlug('---hello-world---')).toBe('hello-world');
    expect(toSlug('  foo bar  ')).toBe('foo-bar');
  });

  it('should slice the result to a maximum of 80 characters', () => {
    const longString = 'a'.repeat(100);
    expect(toSlug(longString)).toBe('a'.repeat(80));
    expect(toSlug(longString).length).toBe(80);

    // Ensure that if truncation leaves a trailing hyphen, it should arguably be removed,
    // but the current implementation slices AFTER removing trailing hyphens,
    // so a hyphen at index 79 could theoretically remain. Let's test this behavior.
    const trickyString = 'a'.repeat(79) + '-' + 'b'.repeat(20);
    expect(toSlug(trickyString)).toBe('a'.repeat(79) + '-');
  });

  it('should handle complex mixed inputs', () => {
    expect(toSlug('  The Quick, Bờ Râu! Fox Cầm $100% Đi Bộ???  ')).toBe('the-quick-bo-rau-fox-cam-100-i-bo');
  });
});
