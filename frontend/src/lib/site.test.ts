import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { escapeJsonLd } from './site';

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
    const expected = '\\\\u003cscript\\\\u003ealert("XSS") \\\\u0026 "eval"\\\\u003c/script\\\\u003e';
    assert.strictEqual(escapeJsonLd(input), expected);
  });

  test('handles multiple consecutive special characters', () => {
    const input = '<<>>&&';
    const expected = '\\\\u003c\\\\u003c\\\\u003e\\\\u003e\\\\u0026\\\\u0026';
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
      .replace(/</g, '\\\\u003c')
      .replace(/>/g, '\\\\u003e')
      .replace(/&/g, '\\\\u0026');

    assert.strictEqual(escapeJsonLd(jsonLdPayload), expected);
  });
});
