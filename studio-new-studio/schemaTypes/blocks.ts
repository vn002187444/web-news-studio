import { defineField, defineType } from 'sanity';

// Các khối nội dung tùy chỉnh chèn giữa bài (GEO/AEO + widget tài chính/video)
export const keyTakeawaysBlock = defineType({
  name: 'keyTakeaways',
  title: 'Điểm chính (Key Takeaways)',
  type: 'object',
  fields: [
    defineField({ name: 'items', title: 'Các điểm chính', type: 'array', of: [{ type: 'string' }], validation: (r) => r.required().min(2).max(6) }),
  ],
  preview: { select: { items: 'items' }, prepare: ({ items }) => ({ title: `Takeaways (${(items || []).length})`, subtitle: (items || []).slice(0, 2).join(' • ') }) },
});

export const expertQuoteBlock = defineType({
  name: 'expertQuote',
  title: 'Trích dẫn chuyên gia',
  type: 'object',
  fields: [
    defineField({ name: 'quote', title: 'Nội dung trích dẫn', type: 'text', rows: 3, validation: (r) => r.required() }),
    defineField({ name: 'author', title: 'Tên chuyên gia', type: 'string' }),
    defineField({ name: 'role', title: 'Chức danh / Tổ chức', type: 'string' }),
  ],
  preview: { select: { title: 'quote', subtitle: 'author' } },
});

export const ctaBannerBlock = defineType({
  name: 'ctaBanner',
  title: 'Kêu gọi hành động (CTA)',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Tiêu đề', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'description', title: 'Mô tả ngắn', type: 'string' }),
    defineField({ name: 'buttonText', title: 'Chữ nút bấm', type: 'string', initialValue: 'Xem thêm' }),
    defineField({ name: 'buttonUrl', title: 'Đường dẫn nút bấm', type: 'string', validation: (r) => r.required() }),
  ],
  preview: { select: { title: 'title', subtitle: 'buttonUrl' } },
});

export const chartEmbedBlock = defineType({
  name: 'chartEmbed',
  title: 'Nhúng biểu đồ (TradingView)',
  type: 'object',
  fields: [
    defineField({ name: 'symbol', title: 'Mã (VD: BTCUSD, VNINDEX)', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'caption', title: 'Chú thích', type: 'string' }),
  ],
  preview: { select: { title: 'symbol', subtitle: 'caption' } },
});

export const videoEmbedBlock = defineType({
  name: 'videoEmbed',
  title: 'Nhúng video (YouTube)',
  type: 'object',
  fields: [
    defineField({ name: 'url', title: 'URL YouTube', type: 'url', validation: (r) => r.required() }),
    defineField({ name: 'caption', title: 'Chú thích', type: 'string' }),
  ],
  preview: { select: { title: 'url', subtitle: 'caption' } },
});

export const portableBlocks = [keyTakeawaysBlock, expertQuoteBlock, ctaBannerBlock, chartEmbedBlock, videoEmbedBlock];
