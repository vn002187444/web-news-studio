import { NextResponse } from 'next/server';
import { searchPostsUnified } from '@/lib/posts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const results = await searchPostsUnified(query);
  return NextResponse.json(results);
}
