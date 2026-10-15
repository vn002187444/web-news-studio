import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.join(process.cwd(), 'src/data/posts');

function processMarkdown(content: string) {
  let newContent = content;

  // 1. Process FAQ items: convert markdown list items into semantic accessible details/summary cards
  const faqRegex = /- \*\*q\*\*: (.*?)\r?\n\s*(?:-\s*)?\*\*a\*\*: ([\s\S]*?)(?=\r?\n\s*- \*\*q\*\*|\r?\n\r?\n##|\r?\n\r?\n\*\*\*|\r?\n\r?\n\*Nguồn|\r?\n---|\s*$)/g;
  
  newContent = newContent.replace(faqRegex, (_match, q, a) => {
    const cleanQ = q.trim();
    const cleanA = a.trim();
    return `<details className="group rounded-xl border border-gray-200 bg-gray-50/50 p-4 mb-4">
  <summary className="flex cursor-pointer items-center justify-between font-medium text-gray-900">
    <div className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">Q</span>${cleanQ}</div>
  </summary>
  <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4 text-gray-600">
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600">A</span>
    <p>${cleanA}</p>
  </div>
</details>\n`;
  });

  // 2. Process Attribution (*Nguồn tin: ...*)
  const attributionRegex = /\*Nguồn tin:\s*(.*?)\*/g;
  newContent = newContent.replace(attributionRegex, (_match, sourceRaw) => {
    let cleanSource = sourceRaw.replace(/^Theo\s+|^Tổng hợp từ\s+/i, '').replace(/\.$/, '').trim();
    if (!cleanSource) cleanSource = sourceRaw.trim();
    return `<div className="mt-8 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
  <div className="flex items-center gap-3">
    <span className="text-2xl">📰</span>
    <div><p className="text-sm font-medium text-gray-900">Nguồn tin: ${cleanSource}</p></div>
  </div>
</div>`;
  });

  // 3. Process Disclaimer (*Lưu ý: ...*)
  const disclaimerRegex = /\*Lưu ý:\s*(.*?)\*/g;
  newContent = newContent.replace(disclaimerRegex, (_match, disclaimerText) => {
    return `<div className="mt-4 rounded-xl border border-amber-200/60 bg-amber-50/50 p-4 text-sm text-amber-900/80">
  <div className="flex items-start gap-3">
    <span className="text-xl">🛡️</span>
    <p><strong>Lưu ý biên tập:</strong> ${disclaimerText.trim()}</p>
  </div>
</div>`;
  });

  return newContent;
}

function processFrontmatter(content: string) {
  return content.replace(/author:\s*"AI Autobot"/g, 'author: "Ban Biên Tập News Studio"');
}

function runMigration() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error(`Directory not found: ${POSTS_DIR}`);
    return;
  }

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.mdx'));
  let total = files.length;
  let modifiedCount = 0;

  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    let updated = processMarkdown(content);
    updated = processFrontmatter(updated);

    if (updated !== content) {
      fs.writeFileSync(filePath, updated, 'utf8');
      modifiedCount++;
    }
  }

  console.log(`Migration complete: ${modifiedCount}/${total} articles updated with redesigned FAQ, attribution, and author.`);
}

runMigration();
