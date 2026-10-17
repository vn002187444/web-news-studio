/**
 * Web News Comprehensive Remote QC & QA Test Suite
 * Targets: Cloudflare Workers Edge Web Reader (news-studio.vn002187444.workers.dev)
 */

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

async function testFetch(path) {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "WebNews-QA-Auditor/1.0" },
      signal: AbortSignal.timeout(10000)
    });
    const timeMs = Date.now() - t0;
    const text = await res.text();
    return { status: res.status, ok: res.ok, timeMs, text, url };
  } catch (err) {
    return { status: 0, ok: false, timeMs: Date.now() - t0, error: err.message, text: "", url };
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
  }

  console.log('\n--- 2. AUDITING CMS & STUDIO ACCESS ---');
  const studioRes = await testFetch("/studio");
  recordTest("routes", "Route /studio (Sanity Studio)", studioRes.ok || studioRes.status === 302 || studioRes.status === 307, `Status: ${studioRes.status}`);

  console.log('\n--- 3. AUDITING SEO & CANONICAL TAGS ---');
  const homeRes = await testFetch("/vi");
  if (homeRes.ok) {
    const hasCanonical = homeRes.text.includes('rel="canonical"');
    recordTest("seo", "Homepage Canonical Tag", hasCanonical, hasCanonical ? "Present" : "Missing");
    const hasLang = homeRes.text.includes('lang="vi"') || homeRes.text.includes('lang=\'vi\'');
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
