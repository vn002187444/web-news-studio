const fs = require('fs');

console.log('--- Applying Prefetch and Preconnect Optimizations ---');

// 1. layout.tsx: fix image preconnects (remove crossOrigin="anonymous" for <img>)
const layoutPath = 'frontend/src/app/[locale]/layout.tsx';
let layoutContent = fs.readFileSync(layoutPath, 'utf8');
layoutContent = layoutContent.replace(/<link rel="preconnect" href="https:\/\/images\.unsplash\.com"[^>]*\/>/g, '<link rel="preconnect" href="https://images.unsplash.com" />\n        <link rel="dns-prefetch" href="https://images.unsplash.com" />');
layoutContent = layoutContent.replace(/<link rel="preconnect" href="https:\/\/cdn\.sanity\.io"[^>]*\/>/g, '<link rel="preconnect" href="https://cdn.sanity.io" />\n        <link rel="dns-prefetch" href="https://cdn.sanity.io" />');
layoutContent = layoutContent.replace(/crossOrigin="anonymous"/g, (match, offset) => {
  // Keep crossOrigin="anonymous" only for webmanifest and fonts
  const before = layoutContent.slice(Math.max(0, offset - 100), offset);
  if (before.includes('manifest.webmanifest')) return match;
  return '';
});
fs.writeFileSync(layoutPath, layoutContent);
console.log('✅ 1. layout.tsx: Image preconnect headers corrected (non-CORS socket reuse enabled)');

// 2. HeroSection.tsx: prefetch={false}
const heroPath = 'frontend/src/components/ui/HeroSection.tsx';
let heroContent = fs.readFileSync(heroPath, 'utf8');
heroContent = heroContent.replace(/<Link\s+href=/g, '<Link prefetch={false} href=');
fs.writeFileSync(heroPath, heroContent);
console.log('✅ 2. HeroSection.tsx: Links set to prefetch={false}');

// 3. BentoGrid.tsx: prefetch={false} & priority={false}
const bentoPath = 'frontend/src/components/ui/BentoGrid.tsx';
let bentoContent = fs.readFileSync(bentoPath, 'utf8');
bentoContent = bentoContent.replace(/<Link href=/g, '<Link prefetch={false} href=');
bentoContent = bentoContent.replace('priority={i === 0}', 'priority={false}');
fs.writeFileSync(bentoPath, bentoContent);
console.log('✅ 3. BentoGrid.tsx: Links set to prefetch={false}, only Hero gets priority');

// 4. TrendingWidget.tsx: prefetch={false}
const trendPath = 'frontend/src/components/ui/TrendingWidget.tsx';
let trendContent = fs.readFileSync(trendPath, 'utf8');
trendContent = trendContent.replace(/<Link\s+href=/g, '<Link prefetch={false} href=');
fs.writeFileSync(trendPath, trendContent);
console.log('✅ 4. TrendingWidget.tsx: Links set to prefetch={false}');

// 5. CategorySections.tsx: prefetch={false}
const catPath = 'frontend/src/components/ui/CategorySections.tsx';
let catContent = fs.readFileSync(catPath, 'utf8');
catContent = catContent.replace(/<Link\s+href=/g, '<Link prefetch={false} href=');
fs.writeFileSync(catPath, catContent);
console.log('✅ 5. CategorySections.tsx: Links set to prefetch={false}');

console.log('--- Done Applying Prefetch & Preconnect Optimizations ---');
