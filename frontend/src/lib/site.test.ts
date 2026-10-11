import test from 'node:test';
import assert from 'node:assert/strict';
import { absoluteUrl, SITE_URL } from './site';

test('absoluteUrl utility', async (t) => {
  await t.test('prepends SITE_URL to paths starting with /', () => {
    const path = '/about';
    const expected = `${SITE_URL}${path}`;
    const result = absoluteUrl(path);
    assert.strictEqual(result, expected);
  });

  await t.test('prepends SITE_URL and / to paths not starting with /', () => {
    const path = 'contact';
    const expected = `${SITE_URL}/${path}`;
    const result = absoluteUrl(path);
    assert.strictEqual(result, expected);
  });

  await t.test('handles empty path correctly', () => {
    const path = '';
    const expected = `${SITE_URL}/`;
    const result = absoluteUrl(path);
    assert.strictEqual(result, expected);
  });
});
