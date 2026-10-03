'use client';

import { useState, useEffect } from 'react';

interface SeoProps {
  title: string;
  content: string;
  focusKeyword: string;
}

export default function SeoAnalyzer({ title, content, focusKeyword }: SeoProps) {
  const [score, setScore] = useState(0);
  const [checks, setChecks] = useState([
    { id: 'keyword_title', text: 'Từ khóa chính nằm trong Tiêu đề (H1)', passed: false },
    { id: 'keyword_length', text: 'Nội dung dài hơn 300 từ', passed: false },
    { id: 'keyword_density', text: 'Mật độ từ khóa tốt (1% - 2.5%)', passed: false },
    { id: 'keyword_intro', text: 'Từ khóa xuất hiện trong đoạn mở đầu', passed: false },
    { id: 'has_links', text: 'Có chứa liên kết nội bộ (Internal Links)', passed: false },
  ]);

  useEffect(() => {
    if (!focusKeyword) return;

    const lowerContent = content.toLowerCase();
    const lowerTitle = title.toLowerCase();
    const lowerKeyword = focusKeyword.toLowerCase();
    
    let passedCount = 0;
    const newChecks = [...checks];

    // 1. Keyword in title
    const titlePassed = lowerTitle.includes(lowerKeyword);
    newChecks[0].passed = titlePassed;
    if (titlePassed) passedCount++;

    // 2. Content length > 300 words
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    const lengthPassed = wordCount >= 300;
    newChecks[1].passed = lengthPassed;
    if (lengthPassed) passedCount++;

    // 3. Keyword density
    const keywordCount = (lowerContent.match(new RegExp(lowerKeyword, 'g')) || []).length;
    const density = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;
    const densityPassed = density >= 1 && density <= 2.5;
    newChecks[2].passed = densityPassed;
    if (densityPassed) passedCount++;

    // 4. Keyword in first 100 characters
    const introPassed = lowerContent.substring(0, 150).includes(lowerKeyword);
    newChecks[3].passed = introPassed;
    if (introPassed) passedCount++;

    // 5. Has links (basic check for markdown or HTML links)
    const linksPassed = /<a href=|\[.*?\]\(.*?\)/.test(content);
    newChecks[4].passed = linksPassed;
    if (linksPassed) passedCount++;

    setChecks(newChecks);
    setScore(Math.round((passedCount / 5) * 100));
  }, [title, content, focusKeyword]);

  return (
    <div className="bg-white text-black p-6 rounded-xl border border-gray-200 shadow-sm font-sans w-full max-w-sm">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <span className="text-xl">📈</span> SEO Auditor
        </h3>
        <div className={`text-2xl font-black ${score >= 80 ? 'text-green-600' : score >= 50 ? 'text-orange-500' : 'text-red-600'}`}>
          {score}/100
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {checks.map((check) => (
          <div key={check.id} className="flex items-start gap-3 text-sm">
            <span className="mt-0.5">
              {check.passed ? (
                <span className="text-green-500 font-bold">✓</span>
              ) : (
                <span className="text-red-500 font-bold">✗</span>
              )}
            </span>
            <span className={check.passed ? 'text-gray-700' : 'text-gray-500'}>
              {check.text}
            </span>
          </div>
        ))}
      </div>

      <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md">
        ✨ Auto-Fix with Gemini AI
      </button>
      <p className="text-center text-[10px] text-gray-400 mt-3 uppercase tracking-widest">
        AI will rewrite missing elements
      </p>
    </div>
  );
}
