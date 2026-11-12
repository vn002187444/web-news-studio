/**
 * Web News Comprehensive Remote QC & QA Test Suite
 * Targets: Cloudflare Workers Edge Web Reader (news-studio.vn002187444.workers.dev)
 */

import https from 'node:https';
import http from 'node:http';
import { URL } from 'node:url';

const BASE_URL = "https://news-studio.vn002187444.workers.dev";

const results = {
  routes: [],
  seo: [],
  summary: { total: 0, passed: 0, failed: 0 }
};

function recordTest(category, name, passed, details = "") {
  results.summary.total++;
  if (passed) {
    results.summary.passed++;
  } else {
    results.summary.failed++;
  }
  console.log(`${passed ? "✅ [PASS]" : "❌ [FAIL]"} [${category.toUpperCase()}] ${name}${details ? ` -> ${details}` : ""}`);
}

function fetchV4(targetUrl, timeoutMs = 15000) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    try {
      const parsed = new URL(targetUrl);
      const mod = parsed.protocol === "https:" ? https : http;
      const req = mod.request(parsed, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        family: 4,
        timeout: timeoutMs
      }, (res) => {
        let text = "";
        res.on("data", chunk => text += chunk);
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            ok: (res.statusCode >= 200 && res.statusCode < 400),
            timeMs: Date.now() - t0,
            text,
            url: targetUrl
          });
        });
      });
      req.on("timeout", () => {
        req.destroy();
        resolve({ status: 0, ok: false, timeMs: Date.now() - t0, error: "Timeout", text: "", url: targetUrl });
      });
      req.on("error", (err) => {
        resolve({ status: 0, ok: false, timeMs: Date.now() - t0, error: err.message, text: "", url: targetUrl });
      });
      req.end();
    } catch (err) {
      resolve({ status: 0, ok: false, timeMs: Date.now() - t0, error: err.message, text: "", url: targetUrl });
    }
  });
}

async function testFetch(path, retries = 2) {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetchV4(url, 12000);
    if (res.status >= 500 && attempt < retries) {
      await new Promise(r => setTimeout(r, (attempt + 1) * 1000));
      continue;
    }
    return res;
  }
}

async function runQA() {
  console.log('=================================================');
  console.log('🚀 WEB NEWS COMPREHENSIVE REMOTE QC & QA AUDIT');
  console.log(`Target: ${BASE_URL}`);
  console.log('=================================================\n');

  console.log('--- 1. AUDITING CORE ROUTES & CATEGORIES ---');
  const routes = [
    { path: "/", name: "Homepage Root" },
    { path: "/vi", name: "Homepage (Vietnamese)" },
    { path: "/vi/tech", name: "Chuyên mục Công nghệ" },
    { path: "/vi/finance", name: "Chuyên mục Tài chính" },
    { path: "/vi/sports", name: "Chuyên mục Thể thao" },
    { path: "/vi/lifestyle", name: "Chuyên mục Đời sống" },
    { path: "/vi/game", name: "Chuyên mục Game" },
    { path: "/vi/entertainment", name: "Chuyên mục Giải trí" },
    { path: "/vi/education", name: "Chuyên mục Giáo dục" },
    { path: "/vi/science", name: "Chuyên mục Khoa học" },
    { path: "/vi/blockchain", name: "Chuyên mục Blockchain" },
    { path: "/vi/world", name: "Chuyên mục Thế giới" },
    { path: "/robots.txt", name: "Robots.txt" },
    { path: "/sitemap.xml", name: "Sitemap Index" },
    { path: "/sitemap-news.xml", name: "News Sitemap" },
    { path: "/api/feed", name: "RSS Feed API" }
  ];

  for (const r of routes) {
    const res = await testFetch(r.path);
    recordTest("routes", `Route ${r.path} (${r.name})`, res.ok, `Status: ${res.status}, Time: ${res.timeMs}ms`);
    await new Promise(r => setTimeout(r, 400));
  }

  console.log('\n--- 2. AUDITING CMS & STUDIO ACCESS ---');
  const studioRes = await testFetch("/studio");
  recordTest("routes", "Route /studio (Sanity Studio)", studioRes.ok || studioRes.status === 302 || studioRes.status === 307, `Status: ${studioRes.status}`);

  console.log('\n--- 3. AUDITING SEO & CANONICAL TAGS ---');
  const homeRes = await testFetch("/vi");
  if (homeRes.ok) {
    const hasCanonical = homeRes.text.includes('rel="canonical"') || homeRes.text.includes('canonical');
    recordTest("seo", "Homepage Canonical Tag", hasCanonical, hasCanonical ? "Present" : "Missing");
    const hasLang = homeRes.text.includes('lang="vi"') || homeRes.text.includes("lang='vi'");
    recordTest("seo", "HTML lang='vi' attribute", hasLang, hasLang ? "Present" : "Missing");
  }

  console.log('\n=================================================');
  console.log('📊 WEB NEWS QC & QA AUDIT SUMMARY REPORT');
  console.log(`TOTAL CHECKS: ${results.summary.total}`);
  console.log(`✅ PASSED:    ${results.summary.passed}`);
  console.log(`❌ FAILED:    ${results.summary.failed}`);
  const passRate = Math.round((results.summary.passed / results.summary.total) * 100);
  console.log(`PASS RATE:    ${passRate}%`);
  console.log('=================================================');
}

runQA().catch(err => {
  console.error('QA Suite Failed:', err);
  process.exit(1);
});
