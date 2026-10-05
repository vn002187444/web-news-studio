import { defineField, defineType } from 'sanity';

// Mirror của studio-new-studio/schemaTypes/articleType.ts
// Giữ khớp 100% với GROQ trong src/lib/sanity.ts
export const articleType = defineType({
  name: 'article',
  title: 'Article (Bài viết)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tiêu đề',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Đường dẫn (Slug)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Tóm tắt / Meta Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'content',
      title: 'Nội dung (Markdown - cũ, giữ để tương thích)',
      type: 'text',
      rows: 15,
    }),
    defineField({
      name: 'body',
      title: 'Nội dung (Portable Text - mới)',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'keyTakeaways' },
        { type: 'expertQuote' },
        { type: 'ctaBanner' },
        { type: 'chartEmbed' },
        { type: 'videoEmbed' },
      ],
    }),
    defineField({
      name: 'category',
      title: 'Chuyên mục',
      type: 'string',
      options: {
        list: [
          { title: 'Công nghệ (Tech)', value: 'tech' },
          { title: 'Tài chính (Finance)', value: 'finance' },
          { title: 'Blockchain / Crypto', value: 'blockchain' },
          { title: 'Game', value: 'game' },
          { title: 'Thể thao (Sports)', value: 'sports' },
          { title: 'Giải trí (Entertainment)', value: 'entertainment' },
          { title: 'Giáo dục (Education)', value: 'education' },
          { title: 'Khoa học (Science)', value: 'science' },
          { title: 'Đời sống (Lifestyle)', value: 'lifestyle' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'thumbnail',
      title: 'Ảnh đại diện (Thumbnail URL)',
      type: 'url',
    }),
    defineField({
      name: 'author',
      title: 'Tác giả (chuỗi - cũ, giữ để tương thích)',
      type: 'string',
      initialValue: 'AI Autobot',
    }),
    defineField({
      name: 'authorRef',
      title: 'Tác giả (liên kết hồ sơ - mới)',
      type: 'reference',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'categoryRef',
      title: 'Danh mục (liên kết - mới)',
      type: 'reference',
      to: [{ type: 'categoryDoc' }],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Ngày xuất bản',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'views',
      title: 'Lượt xem',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
    },
  },
});
