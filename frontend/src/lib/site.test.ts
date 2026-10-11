import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { absoluteUrl, SITE_URL, escapeJsonLd, toSlug } from './site';

describe('absoluteUrl utility', () => {
  test('prepends SITE_URL to paths starting with /', () => {
    const path = '/about';
    const expected = `${SITE_URL}${path}`;
    const result = absoluteUrl(path);
    assert.strictEqual(result, expected);
  });

  test('prepends SITE_URL and / to paths not starting with /', () => {
    const path = 'contact';
    const expected = `${SITE_URL}/${path}`;
    const result = absoluteUrl(path);
    assert.strictEqual(result, expected);
  });

  test('handles empty path correctly', () => {
    const path = '';
    const expected = `${SITE_URL}/`;
    const result = absoluteUrl(path);
    assert.strictEqual(result, expected);
  });
});

describe('escapeJsonLd', () => {
  test('returns the same string if there are no special characters', () => {
    const input = '{"name": "John Doe", "job": "Software Engineer"}';
    assert.strictEqual(escapeJsonLd(input), input);
  });

  test('handles empty strings', () => {
    assert.strictEqual(escapeJsonLd(''), '');
  });

  test('escapes <, >, and & characters properly', () => {
    const input = '<script>alert("XSS") & "eval"</script>';
    const expected = '\\u003cscript\\u003ealert("XSS") \\u0026 "eval"\\u003c/script\\u003e';
    assert.strictEqual(escapeJsonLd(input), expected);
  });

  test('handles multiple consecutive special characters', () => {
    const input = '<<>>&&';
    const expected = '\\u003c\\u003c\\u003e\\u003e\\u0026\\u0026';
    assert.strictEqual(escapeJsonLd(input), expected);
  });

  test('safely escapes realistic JSON-LD payload containing malicious sequences', () => {
    const jsonLdPayload = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Safe Title <!-- <script>alert(1)</script> -->",
      "description": "A description containing & special > characters <."
    });
    const expected = jsonLdPayload
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026');

    assert.strictEqual(escapeJsonLd(jsonLdPayload), expected);
  });
});

describe('toSlug', () => {
  test('should convert normal strings to lowercase with hyphens', () => {
    assert.strictEqual(toSlug('Hello World'), 'hello-world');
    assert.strictEqual(toSlug('Foo Bar Baz'), 'foo-bar-baz');
  });

  test('should remove diacritics and handle accented characters', () => {
    assert.strictEqual(toSlug('café'), 'cafe');
    assert.strictEqual(toSlug('Tiếng Việt'), 'tieng-viet');

    // Note: This tests the current implementation's behavior.
    assert.strictEqual(toSlug('Đường'), 'uong');
  });

  test('should replace special characters with hyphens', () => {
    assert.strictEqual(toSlug('hello @ world'), 'hello-world');
    assert.strictEqual(toSlug('what%is&this'), 'what-is-this');
  });

  test('should remove leading and trailing hyphens', () => {
    assert.strictEqual(toSlug('---hello-world---'), 'hello-world');
    assert.strictEqual(toSlug('  foo bar  '), 'foo-bar');
  });

  test('should slice the result to a maximum of 80 characters', () => {
    const longString = 'a'.repeat(100);
    assert.strictEqual(toSlug(longString), 'a'.repeat(80));
    assert.strictEqual(toSlug(longString).length, 80);

    const trickyString = 'a'.repeat(79) + '-' + 'b'.repeat(20);
    assert.strictEqual(toSlug(trickyString), 'a'.repeat(79) + '-');
  });

  test('should handle complex mixed inputs', () => {
    assert.strictEqual(toSlug('  The Quick, Bờ Râu! Fox Cầm $100% Đi Bộ???  '), 'the-quick-bo-rau-fox-cam-100-i-bo');
  });
});
