'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Render markdown bằng react-markdown (unified -> hast -> React, không eval/new Function).
 * An toàn trên Cloudflare Workers, thay thế next-mdx-remote (biên dịch runtime bằng eval).
 * Nội dung autoblog chỉ dùng markdown chuẩn (headings, lists, bold, links, tables).
 */
export default function MarkdownBody({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node, ...props }) => (
          // Link ngoài mở tab mới; link nội bộ giữ SPA
          <a {...props} target={props.href?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
