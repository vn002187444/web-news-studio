import { Article } from '@/types';

export const mockArticles: Article[] = [
  {
    id: '1',
    slug: 'the-future-of-ai-agents',
    title: 'The Future of AI Agents in Software Engineering',
    excerpt: 'How autonomous AI agents are reshaping the way we build, test, and deploy software.',
    content: '<p>AI agents are no longer just a concept. They are actively writing code, reviewing PRs, and maintaining complex systems...</p>',
    author: {
      name: 'Alice Turing',
      avatar: 'https://i.pravatar.cc/150?u=alice',
      role: 'Senior Tech Editor',
    },
    category: 'tech',
    tags: ['AI', 'Software Engineering', 'Future'],
    thumbnail: {
      url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
      alt: 'AI Agent visualizing code',
    },
    publishedAt: '2026-10-02T10:00:00Z',
    readingTime: 5,
  },
  {
    id: '2',
    slug: 'ethereum-2-point-0-rollups',
    title: 'Ethereum Rollups: The Endgame for Scalability?',
    excerpt: 'A deep dive into ZK-Rollups and Optimistic Rollups and their impact on transaction fees.',
    content: '<p>With the rise of Layer 2 solutions, the blockchain trilemma is finally being addressed...</p>',
    author: {
      name: 'Bob Nakamoto',
      avatar: 'https://i.pravatar.cc/150?u=bob',
      role: 'Crypto Analyst',
    },
    category: 'blockchain',
    tags: ['Ethereum', 'Layer 2', 'ZK-Rollups'],
    thumbnail: {
      url: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80',
      alt: 'Ethereum physical coin',
    },
    publishedAt: '2026-10-01T14:30:00Z',
    readingTime: 8,
  },
  {
    id: '3',
    slug: 'next-gen-console-wars',
    title: 'The Next-Gen Console Wars: Cloud Gaming vs Hardware',
    excerpt: 'Will traditional consoles survive the rise of seamless cloud gaming platforms?',
    content: '<p>As internet speeds increase globally, companies are pushing for hardware-less gaming...</p>',
    author: {
      name: 'Charlie Player',
      avatar: 'https://i.pravatar.cc/150?u=charlie',
      role: 'Gaming Reviewer',
    },
    category: 'game',
    tags: ['Esport', 'Console', 'Cloud Gaming'],
    thumbnail: {
      url: 'https://images.unsplash.com/photo-1593118247619-e2d6f056869e?auto=format&fit=crop&w=1200&q=80',
      alt: 'Game controller in neon light',
    },
    publishedAt: '2026-09-30T09:15:00Z',
    readingTime: 6,
  }
];
