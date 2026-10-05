import { defineField, defineType } from 'sanity';

// Hồ sơ tác giả — chuẩn E-E-A-T (có trang hồ sơ, avatar, bio)
export const authorType = defineType({
  name: 'author',
  title: 'Tác giả',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Tên hiển thị', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name', maxLength: 96 }, validation: (r) => r.required() }),
    defineField({ name: 'role', title: 'Chức danh', type: 'string' }),
    defineField({ name: 'bio', title: 'Tiểu sử', type: 'text', rows: 3 }),
    defineField({ name: 'avatar', title: 'Ảnh đại diện (URL)', type: 'url' }),
    defineField({ name: 'beats', title: 'Chuyên mục phụ trách', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'twitter', title: 'X / Twitter', type: 'url' }),
    defineField({ name: 'facebook', title: 'Facebook', type: 'url' }),
  ],
  preview: { select: { title: 'name', subtitle: 'role', media: 'avatar' } },
});

// Danh mục — icon, màu, mô tả SEO riêng từng mục
export const categoryDocType = defineType({
  name: 'categoryDoc',
  title: 'Danh mục',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Tên hiển thị', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'value', title: 'Mã (khớp category bài viết)', type: 'string',
      options: {
        list: ['tech', 'finance', 'blockchain', 'game', 'sports', 'entertainment', 'education', 'science', 'lifestyle'],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'description', title: 'Mô tả SEO', type: 'text', rows: 2 }),
    defineField({ name: 'icon', title: 'Icon (emoji / ký tự)', type: 'string' }),
    defineField({ name: 'color', title: 'Màu đại diện (hex)', type: 'string' }),
  ],
  preview: { select: { title: 'title', subtitle: 'value' } },
});
