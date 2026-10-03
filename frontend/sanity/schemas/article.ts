export default {
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: (R: any) => R.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: (R: any) => R.required() },
    { name: 'excerpt', title: 'Excerpt', type: 'text' },
    { name: 'content', title: 'Content (Markdown)', type: 'text' },
    {
      name: 'category', title: 'Category', type: 'string',
      options: { list: ['tech', 'blockchain', 'game', 'finance', 'lifestyle', 'sports', 'entertainment', 'education', 'science'] },
      validation: (R: any) => R.required(),
    },
    { name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }] },
    { name: 'thumbnail', title: 'Thumbnail URL', type: 'url' },
    { name: 'author', title: 'Author', type: 'string', initialValue: 'AI Autobot' },
    { name: 'publishedAt', title: 'Published At', type: 'datetime', validation: (R: any) => R.required() },
    { name: 'views', title: 'Views', type: 'number', initialValue: 0 },
  ],
  preview: { select: { title: 'title', subtitle: 'category' } },
};
