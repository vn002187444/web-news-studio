/**
 * Web News Daily Comprehensive Maintenance & Worker Audit
 * Targets: Cloudflare Workers (news-studio.vn002187444.workers.dev)
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';

const WEB_BASE = 'https://news-studio.vn002187444.workers.dev';
const STUDIO_BASE = `${WEB_BASE}/studio`;

async function auditWorkers() {
  console.log('\n--- 1. AUDITING CLOUDFLARE WORKERS & HEALTH ---');
  const results = {};

  // Check Web Reader Edge Worker
  try {
    const t0 = Date.now();
    const res = await fetch(WEB_BASE, { signal: AbortSignal.timeout(10000) });
    const latency = Date.now() - t0;
    results.webReader = { status: res.status, latencyMs: latency, ok: res.ok };
    console.log(`✅ [WORKER: WEB READER] Homepage -> Status: ${res.status}, Latency: ${latency}ms`);
  } catch (err) {
    results.webReader = { ok: false, error: err.message };
    console.log(`❌ [WORKER: WEB READER] Failed -> ${err.message}`);
  }

  // Check Sanity Studio CMS
  try {
    const res = await fetch(STUDIO_BASE, { signal: AbortSignal.timeout(10000) });
    results.studioStatus = { status: res.status, ok: res.status < 400 };
    console.log(`✅ [WORKER: STUDIO CMS] /studio -> Status: ${res.status}`);
  } catch (err) {
    results.studioStatus = { ok: false, error: err.message };
    console.log(`❌ [WORKER: STUDIO CMS] Failed -> ${err.message}`);
  }

  // Check Feed API
  try {
    const res = await fetch(`${WEB_BASE}/api/feed`, { signal: AbortSignal.timeout(8000) });
    results.feedApi = { status: res.status, ok: res.ok };
    console.log(`✅ [API: FEED] /api/feed -> Status: ${res.status}`);
  } catch (err) {
    results.feedApi = { ok: false, error: err.message };
    console.log(`❌ [API: FEED] Failed -> ${err.message}`);
  }

  return results;
}

async function auditArticles() {
  console.log('\n--- 2. AUDITING ARTICLES STATS (LAST 3 DAYS) ---');
  try {
    const manifestPath = './frontend/src/data/posts-manifest.json';
    if (fs.existsSync(manifestPath)) {
      const posts = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const now = new Date();
      const msInDay = 24 * 60 * 60 * 1000;

      console.log(`📊 Total Local Posts in Manifest: ${posts.length}`);

      const dailyStats = [];
      let totalLast3Days = 0;

      for (let i = 0; i < 3; i++) {
        const targetDate = new Date(now.getTime() - i * msInDay);
        const dateStr = targetDate.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        const label = i === 0 ? `Hôm nay (${dateStr})` : i === 1 ? `Hôm qua (${dateStr})` : `2 ngày trước (${dateStr})`;

        const parts = dateStr.split('/');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const startOfDay = new Date(Date.UTC(year, month, day, -7, 0, 0, 0));
        const endOfDay = new Date(Date.UTC(year, month, day, 16, 59, 59, 999));

        const dayPosts = posts.filter(p => {
          const d = new Date(p.meta.publishedAt || p.meta.date);
          return d >= startOfDay && d <= endOfDay;
        });

        dailyStats.push({ label, dateStr, count: dayPosts.length });
        totalLast3Days += dayPosts.length;
        console.log(`  📅 [${label}]: ${dayPosts.length} bài viết`);
      }

      console.log(`📈 Tổng số bài đã tạo/đăng thành công 3 ngày gần nhất: ${totalLast3Days} bài`);
      if (posts.length > 0) {
        console.log(`📰 Latest Article: "${posts[0].meta.title}" (${posts[0].meta.publishedAt || posts[0].meta.date})`);
      }

      return {
        total: posts.length,
        totalLast3Days,
        dailyStats,
        latest: posts[0] ? { title: posts[0].meta.title, slug: posts[0].slug } : null
      };
    }
  } catch (err) {
    console.log(`❌ Articles Audit Failed -> ${err.message}`);
    return { error: err.message };
  }
}

async function runLighthouseAudit() {
  console.log('\n--- 3. AUDITING LIGHTHOUSE & CORE WEB VITALS ---');
  try {
    const reportPath = './lighthouse-daily-report.json';
    execSync(
      `npx lighthouse ${WEB_BASE}/vi --chrome-flags="--headless=new --no-sandbox" --output=json --output-path=${reportPath} --quiet`,
      { cwd: process.cwd(), encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 60000 }
    );
    if (fs.existsSync(reportPath)) {
      const r = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      const scores = {
        performance: Math.round(r.categories.performance?.score * 100 || 0),
        accessibility: Math.round(r.categories.accessibility?.score * 100 || 0),
        bestPractices: Math.round(r.categories['best-practices']?.score * 100 || 0),
        seo: Math.round(r.categories.seo?.score * 100 || 0),
        fcp: r.audits['first-contentful-paint']?.displayValue,
        lcp: r.audits['largest-contentful-paint']?.displayValue,
        tbt: r.audits['total-blocking-time']?.displayValue,
        cls: r.audits['cumulative-layout-shift']?.displayValue,
        ttfb: r.audits['server-response-time']?.displayValue
      };
      console.log(`⭐ Performance: ${scores.performance}/100 | Accessibility: ${scores.accessibility}/100 | SEO: ${scores.seo}/100`);
      console.log(`⚡ Core Web Vitals: FCP=${scores.fcp}, LCP=${scores.lcp}, TBT=${scores.tbt}, CLS=${scores.cls}, TTFB=${scores.ttfb}`);
      return scores;
    }
  } catch (err) {
    console.log(`⚠️ Lighthouse run skipped or encountered warning: ${err.message.split('\n')[0]}`);
  }
  return null;
}

async function main() {
  console.log('=================================================');
  console.log('🚀 WEB NEWS DAILY COMPREHENSIVE MAINTENANCE AUDIT');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('=================================================');

  const workerStatus = await auditWorkers();
  const articleStats = await auditArticles();
  const lighthouseStats = await runLighthouseAudit();

  console.log('\n=================================================');
  console.log('📋 DAILY AUDIT SUMMARY COMPLETE');
  console.log('=================================================');
}

main().catch(err => {
  console.error('Fatal Audit Error:', err);
  process.exit(1);
});
