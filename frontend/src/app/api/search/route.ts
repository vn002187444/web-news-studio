import { NextResponse } from 'next/server';
import { searchPostsUnified } from '@/lib/posts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || '').slice(0, 100);
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10', 10) || 10, 1), 20);
  const results = await searchPostsUnified(query, limit);
  return NextResponse.json(results, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  });
}
