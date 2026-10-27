import fs from 'fs';
import path from 'path';

const templatesDir = path.join(process.cwd(), 'frontend/src/app/[locale]/(site)/[category]/_templates');

// 1. TechTemplate.tsx
const techPath = path.join(templatesDir, 'TechTemplate.tsx');
if (fs.existsSync(techPath)) {
  let content = fs.readFileSync(techPath, 'utf8');
  content = content.replace(/import Image from 'next\/image';/g, "import AdaptiveImage from '@/components/ui/AdaptiveImage';");
  content = content.replace(/import AdaptiveImage from '@\/components\/ui\/AdaptiveImage';[\s\S]*?import AdaptiveImage/g, "import AdaptiveImage");
  content = content.replace(
    /<Image\s+src=\{article\.thumbnail\?\.url\}[\s\S]*?\/>/g,
    `<AdaptiveImage
                    src={article.thumbnail}
                    alt={article.title}
                    category="tech"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />`
  );
  fs.writeFileSync(techPath, content, 'utf8');
  console.log('✅ Updated TechTemplate.tsx');
}

// 2. EducationTemplate.tsx
const eduPath = path.join(templatesDir, 'EducationTemplate.tsx');
if (fs.existsSync(eduPath)) {
  let content = fs.readFileSync(eduPath, 'utf8');
  content = content.replace(/import Image from 'next\/image';/g, "import AdaptiveImage from '@/components/ui/AdaptiveImage';");
  content = content.replace(
    /\{article\.thumbnail\?\.url \? \([\s\S]*?<Image[\s\S]*?\/>[\s\S]*?\) : \([\s\S]*?<div className="w-full h-full bg-gray-100" \/>[\s\S]*?\)\}/g,
    `<AdaptiveImage
                            src={article.thumbnail}
                            alt={article.title}
                            category="education"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />`
  );
  fs.writeFileSync(eduPath, content, 'utf8');
  console.log('✅ Updated EducationTemplate.tsx');
}

// 3. FinanceTemplate.tsx
const finPath = path.join(templatesDir, 'FinanceTemplate.tsx');
if (fs.existsSync(finPath)) {
  let content = fs.readFileSync(finPath, 'utf8');
  content = content.replace(/import Image from 'next\/image';/g, "import AdaptiveImage from '@/components/ui/AdaptiveImage';");
  content = content.replace(
    /<Image\s+src=\{article\?\.thumbnail\?\.url\}[\s\S]*?\/>/g,
    `<AdaptiveImage
                      src={article?.thumbnail}
                      alt={article?.title}
                      category="finance"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />`
  );
  fs.writeFileSync(finPath, content, 'utf8');
  console.log('✅ Updated FinanceTemplate.tsx');
}

// 4. LifestyleTemplate.tsx
const lifePath = path.join(templatesDir, 'LifestyleTemplate.tsx');
if (fs.existsSync(lifePath)) {
  let content = fs.readFileSync(lifePath, 'utf8');
  content = content.replace(/import Image from 'next\/image';/g, "import AdaptiveImage from '@/components/ui/AdaptiveImage';");
  // Featured First Article
  content = content.replace(
    /\{filteredArticles\[0\]\.thumbnail\?\.url && \([\s\S]*?<Image[\s\S]*?filteredArticles\[0\]\.thumbnail\.url[\s\S]*?\/>[\s\S]*?\)\}/g,
    `<AdaptiveImage
                          src={filteredArticles[0].thumbnail}
                          alt={filteredArticles[0].title}
                          category="lifestyle"
                          fill
                          priority
                          sizes="(max-width: 1024px) 100vw, 75vw"
                          className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                        />`
  );
  // Curated showcase
  content = content.replace(
    /\{item\.thumbnail\?\.url && \([\s\S]*?<Image[\s\S]*?item\.thumbnail\.url[\s\S]*?sizes="\(max-width: 768px\) 75vw, 30vw"[\s\S]*?\/>[\s\S]*?\)\}/g,
    `<AdaptiveImage
                                        src={item.thumbnail}
                                        alt={item.title || 'Lifestyle Article'}
                                        category="lifestyle"
                                        fill
                                        sizes="(max-width: 768px) 75vw, 30vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                      />`
  );
  // Grid
  content = content.replace(
    /\{item\.thumbnail\?\.url && \([\s\S]*?<Image[\s\S]*?item\.thumbnail\.url[\s\S]*?grayscale[\s\S]*?\/>[\s\S]*?\)\}/g,
    `<AdaptiveImage
                                        src={item.thumbnail}
                                        alt={item.title || 'Lifestyle Article'}
                                        category="lifestyle"
                                        fill
                                        sizes="(max-width: 768px) 100vw, 35vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                                      />`
  );
  fs.writeFileSync(lifePath, content, 'utf8');
  console.log('✅ Updated LifestyleTemplate.tsx');
}

// 5. ScienceTemplate.tsx
const sciPath = path.join(templatesDir, 'ScienceTemplate.tsx');
if (fs.existsSync(sciPath)) {
  let content = fs.readFileSync(sciPath, 'utf8');
  content = content.replace(/import Image from 'next\/image';/g, "import AdaptiveImage from '@/components/ui/AdaptiveImage';");
  content = content.replace(
    /<Image\s+src=\{article\.thumbnail\?\.url\}\s+alt=\{article\.thumbnail\?\.alt \|\| article\.title\}\s+fill\s+sizes="\(max-width: 768px\) 100vw, 66vw"[\s\S]*?\/>/g,
    `<AdaptiveImage
                    src={article.thumbnail}
                    alt={article.title}
                    category="science"
                    fill
                    sizes="(max-width: 768px) 100vw, 66vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />`
  );
  content = content.replace(
    /<Image\s+src=\{article\.thumbnail\?\.url\}\s+alt=\{article\.thumbnail\?\.alt \|\| article\.title\}\s+fill\s+sizes="\(max-width: 768px\) 100vw, 33vw"[\s\S]*?\/>/g,
    `<AdaptiveImage
                    src={article.thumbnail}
                    alt={article.title}
                    category="science"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />`
  );
  fs.writeFileSync(sciPath, content, 'utf8');
  console.log('✅ Updated ScienceTemplate.tsx');
}

// 6. SportsTemplate.tsx
const sportsPath = path.join(templatesDir, 'SportsTemplate.tsx');
if (fs.existsSync(sportsPath)) {
  let content = fs.readFileSync(sportsPath, 'utf8');
  content = content.replace(/import Image from 'next\/image';/g, "import AdaptiveImage from '@/components/ui/AdaptiveImage';");
  // Hero spotlight
  content = content.replace(
    /\{filteredArticles\[0\]\.thumbnail\?\.url && \([\s\S]*?<Image[\s\S]*?filteredArticles\[0\]\.thumbnail\.url[\s\S]*?\/>[\s\S]*?\)\}/g,
    `<AdaptiveImage
                            src={filteredArticles[0].thumbnail}
                            alt={filteredArticles[0].title}
                            category="sports"
                            fill
                            sizes="(max-width: 1024px) 100vw, 75vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                          />`
  );
  // Bento grid
  content = content.replace(
    /\{article\.thumbnail\?\.url \? \([\s\S]*?<Image[\s\S]*?article\.thumbnail\.url[\s\S]*?\/>[\s\S]*?\) : \([\s\S]*?<div className="w-full h-full bg-white\/5" \/>[\s\S]*?\)\}/g,
    `<AdaptiveImage
                                      src={article.thumbnail}
                                      alt={article.title}
                                      category="sports"
                                      fill
                                      sizes="(max-width: 768px) 100vw, 35vw"
                                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />`
  );
  fs.writeFileSync(sportsPath, content, 'utf8');
  console.log('✅ Updated SportsTemplate.tsx');
}

// 7. WorldTemplate.tsx
const worldPath = path.join(templatesDir, 'WorldTemplate.tsx');
if (fs.existsSync(worldPath)) {
  let content = fs.readFileSync(worldPath, 'utf8');
  content = content.replace(/import Image from 'next\/image';/g, "import AdaptiveImage from '@/components/ui/AdaptiveImage';");
  content = content.replace(
    /<Image\s+src=\{article\.thumbnail\?\.url\}\s+alt=\{article\.thumbnail\?\.alt \|\| article\.title\}\s+fill\s+sizes="\(max-width: 1024px\) 100vw, 66vw"[\s\S]*?\/>/g,
    `<AdaptiveImage
                        src={article.thumbnail}
                        alt={article.title}
                        category="world"
                        fill
                        sizes="(max-width: 1024px) 100vw, 66vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        priority
                      />`
  );
  content = content.replace(
    /<Image\s+src=\{article\.thumbnail\?\.url\}\s+alt=\{article\.thumbnail\?\.alt \|\| article\.title\}\s+fill\s+sizes="\(max-width: 768px\) 100vw, 33vw"[\s\S]*?\/>/g,
    `<AdaptiveImage
                          src={article.thumbnail}
                          alt={article.title}
                          category="world"
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />`
  );
  fs.writeFileSync(worldPath, content, 'utf8');
  console.log('✅ Updated WorldTemplate.tsx');
}

// 8. EntertainmentTemplate.tsx
const entPath = path.join(templatesDir, 'EntertainmentTemplate.tsx');
if (fs.existsSync(entPath)) {
  let content = fs.readFileSync(entPath, 'utf8');
  content = content.replace(/import Image from 'next\/image';/g, "import AdaptiveImage from '@/components/ui/AdaptiveImage';");
  content = content.replace(
    /<Image\s+src=\{article\.thumbnail\?\.url \|\| 'https:\/\/images\.unsplash\.com\/photo-1598899134739-24c46f58b8c0\?auto=format&fit=crop&w=800&q=80'\}[\s\S]*?\/>/g,
    `<AdaptiveImage 
                src={article.thumbnail} 
                alt={article.title}
                category="entertainment"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />`
  );
  fs.writeFileSync(entPath, content, 'utf8');
  console.log('✅ Updated EntertainmentTemplate.tsx');
}

// 9. BlockchainTemplate.tsx
const bcPath = path.join(templatesDir, 'BlockchainTemplate.tsx');
if (fs.existsSync(bcPath)) {
  let content = fs.readFileSync(bcPath, 'utf8');
  if (!content.includes('AdaptiveImage')) {
    content = "import AdaptiveImage from '@/components/ui/AdaptiveImage';\n" + content;
  }
  content = content.replace(
    /<div \s*className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-500"\s*style=\{\{\s*backgroundImage: `url\(\$\{article\.thumbnail\.url\}\)`,\s*transform: "translateZ\(20px\) scale\(1\.1\)"\s*\}\}\s*\/>/g,
    `<div 
        className="absolute inset-0 overflow-hidden"
        style={{ transform: "translateZ(20px) scale(1.1)" }}
      >
        <AdaptiveImage
          src={article.thumbnail}
          alt={article.title}
          category="blockchain"
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500"
        />
      </div>`
  );
  fs.writeFileSync(bcPath, content, 'utf8');
  console.log('✅ Updated BlockchainTemplate.tsx');
}

// 10. GameTemplate.tsx
const gamePath = path.join(templatesDir, 'GameTemplate.tsx');
if (fs.existsSync(gamePath)) {
  let content = fs.readFileSync(gamePath, 'utf8');
  if (!content.includes('AdaptiveImage')) {
    content = "import AdaptiveImage from '@/components/ui/AdaptiveImage';\n" + content;
  }
  content = content.replace(
    /<Image\s+src=\{optimizeThumbnail\(featured\.thumbnail\?\.url \|\| featured\.thumbnail,\s*1200,\s*65\)\}[\s\S]*?\/>/g,
    `<AdaptiveImage
                  src={featured.thumbnail}
                  alt={featured.title}
                  category="game"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />`
  );
  content = content.replace(
    /<Image\s+src=\{optimizeThumbnail\(article\.thumbnail\?\.url \|\| article\.thumbnail,\s*800,\s*65\)\}[\s\S]*?\/>/g,
    `<AdaptiveImage
                        src={article.thumbnail}
                        alt={article.title}
                        category="game"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />`
  );
  fs.writeFileSync(gamePath, content, 'utf8');
  console.log('✅ Updated GameTemplate.tsx');
}
