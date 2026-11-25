/**
 * Prepares lightweight metadata index (src/data/posts-index.json) and
 * per-article static JSON assets (public/data/posts/<slug>.json) so
 * Cloudflare Workers runtime never bundles the 7.6MB full-content manifest
 * into JS and instead loads single-article bodies via env.ASSETS on demand.
 */
import fs from 'node:fs';
import path from 'node:path';

const FRONTEND_DIR = path.resolve(import.meta.dirname, '..');
const MANIFEST_FILE = path.join(FRONTEND_DIR, 'src/data/posts-manifest.json');
const INDEX_FILE = path.join(FRONTEND_DIR, 'src/data/posts-index.json');
const ASSETS_DIR = path.join(FRONTEND_DIR, 'public/data/posts');

function main() {
  if (!fs.existsSync(MANIFEST_FILE)) {
    console.warn('[prepare-worker-assets] posts-manifest.json not found, skipping');
    return;
  }

  const posts = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
  if (!Array.isArray(posts)) {
    throw new Error('posts-manifest.json must be an array');
  }

  // 1. Write minified metadata-only index (~743KB vs 7.62MB)
  const index = posts.map((p) => ({
    slug: p.slug,
    meta: p.meta,
  }));
  const indexJson = JSON.stringify(index);
  const existingIndex = fs.existsSync(INDEX_FILE) ? fs.readFileSync(INDEX_FILE, 'utf8') : '';
  if (existingIndex !== indexJson) {
    fs.writeFileSync(INDEX_FILE, indexJson, 'utf8');
  }

  // 2. Write per-slug JSON payloads into public/data/posts/ for Workers ASSETS
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
  const expectedFiles = new Set();

  for (const p of posts) {
    if (!p?.slug) continue;
    const safeSlug = String(p.slug).replace(/[^a-zA-Z0-9._-]/g, '');
    if (!safeSlug) continue;
    const fileName = `${safeSlug}.json`;
    expectedFiles.add(fileName);
    const outPath = path.join(ASSETS_DIR, fileName);
    const payload = JSON.stringify({
      slug: p.slug,
      meta: p.meta,
      content: p.content || '',
    });
    if (!fs.existsSync(outPath) || fs.readFileSync(outPath, 'utf8') !== payload) {
      fs.writeFileSync(outPath, payload, 'utf8');
    }
  }

  // Clean up any stale asset files
  for (const existing of fs.readdirSync(ASSETS_DIR)) {
    if (!expectedFiles.has(existing)) {
      fs.unlinkSync(path.join(ASSETS_DIR, existing));
    }
  }

  console.log(
    `[prepare-worker-assets] ready: ${index.length} index entries (${(indexJson.length / 1024).toFixed(1)} KB) + ${expectedFiles.size} static post assets`
  );
}

main();
