'use client';

import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

/**
 * Render markdown bằng react-markdown (unified -> hast -> React, không eval/new Function).
 * An toàn trên Cloudflare Workers, thay thế next-mdx-remote (biên dịch runtime bằng eval).
 * Nội dung autoblog chỉ dùng markdown chuẩn (headings, lists, bold, links, tables) và HTML an toàn.
 */
export default function MarkdownBody({ content }: { content: string }) {
  // Chuẩn hóa className -> class cho raw HTML để Tailwind CSS nhận diện chính xác
  const normalizedContent = useMemo(() => {
    if (!content) return '';
    return content.replace(/\bclassName\s*=/g, 'class=');
  }, [content]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        a: ({ node, ...props }) => (
          // Link ngoài mở tab mới; link nội bộ giữ SPA
          <a {...props} target={props.href?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" />
        ),
      }}
    >
      {normalizedContent}
    </ReactMarkdown>
  );
}
