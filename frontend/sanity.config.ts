import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { articleType } from './sanity/schemas/article';
import { portableBlocks } from './sanity/schemas/blocks';
import { authorType, categoryDocType } from './sanity/schemas/taxonomy';
import { aiWriterPlugin } from './sanity/plugins/aiWriter';

// Studio nhúng tại /studio — dùng env public để browser đọc được.
// Điền NEXT_PUBLIC_SANITY_PROJECT_ID trong .env.local (hiện đã có).
export default defineConfig({
  name: 'web-news-embedded',
  title: 'Web News Studio',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'cb3cdnq7',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  basePath: '/studio',

  plugins: [structureTool(), aiWriterPlugin()],

  schema: {
    types: [articleType, authorType, categoryDocType, ...portableBlocks],
  },
});
