'use client';

import { useState } from 'react';
import { definePlugin, useClient } from 'sanity';
import { Box, Button, Card, Flex, Select, Spinner, Text, TextArea } from '@sanity/ui';

const CATS = ['tech', 'finance', 'blockchain', 'game', 'sports', 'entertainment', 'education', 'science', 'lifestyle'];

function AIWriterTool() {
  const client = useClient({ apiVersion: '2026-01-01' });
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('tech');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [savedId, setSavedId] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setSavedId('');
    try {
      const r = await fetch('/api/studio-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, category }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.reason || 'AI lỗi không rõ');
      setResult(j.article);
    } catch (e: any) {
      setError(e.message || 'Lỗi không rõ');
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async () => {
    if (!result) return;
    setLoading(true);
    try {
      const doc = await client.create({
        _type: 'article',
        title: result.title,
        slug: { _type: 'slug', current: result.slug },
        excerpt: result.excerpt,
        content: result.content,
        body: result.body,
        category,
        tags: result.tags,
        thumbnail: '',
        author: 'AI Autobot',
        authorRef: { _type: 'reference', _ref: `author-${category}` },
        categoryRef: { _type: 'reference', _ref: `category-${category}` },
        publishedAt: new Date().toISOString(),
        views: 0,
      });
      setSavedId(doc._id);
    } catch (e: any) {
      setError(e.message || 'Lưu nháp thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box padding={4} style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'grid', gap: 16 }}>
        <Text size={3} weight="bold">✨ AI Viết bài (Gemini)</Text>
        <Text size={1} muted>Dán link tin hoặc gõ vài ý chính → AI điền tiêu đề, tóm tắt, tags, takeaways, FAQ và nội dung đầy đủ cấu trúc. Yêu cầu: đã bật Draft Mode trên web (/api/draft?secret=...).</Text>
        <TextArea
          rows={5}
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder="VD: https://vnexpress.net/... hoặc: Apple ra mắt chip M5 cho kính AR..."
        />
        <Flex gap={3} align="flex-end">
          <Box flex={1}>
            <Text size={1} muted style={{ marginBottom: 4 }}>Chuyên mục</Text>
            <Select value={category} onChange={(e) => setCategory(e.currentTarget.value)}>
              {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Box>
          <Button text="Viết bài" tone="primary" onClick={generate} disabled={loading || !input.trim()} />
        </Flex>
        {loading && <Flex align="center" gap={2}><Spinner /><Text size={1}>Đang viết...</Text></Flex>}
        {error && <Card tone="critical" padding={3}><Text size={1}>{error}</Text></Card>}
        {result && (
          <Card padding={4} tone="positive">
            <div style={{ display: 'grid', gap: 12 }}>
              <Text size={2} weight="bold">{result.title}</Text>
              <Text size={1} muted>{result.excerpt}</Text>
              <Text size={1}>Tags: {(result.tags || []).join(', ')}</Text>
              <Text size={1}>Takeaways: {(result.takeaways || []).length} • FAQ: {(result.faq || []).length} • Blocks: {(result.body || []).length}</Text>
              <Button text={savedId ? `Đã lưu: ${savedId}` : 'Lưu bản nháp vào Sanity'} tone="primary" onClick={saveDraft} disabled={loading || !!savedId} />
            </div>
          </Card>
        )}
      </div>
    </Box>
  );
}

export const aiWriterPlugin = definePlugin({
  name: 'ai-writer',
  tools: [{ name: 'ai-writer', title: '✨ AI Viết bài', component: AIWriterTool }],
});
