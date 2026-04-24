import { NextResponse } from 'next/server';
import { skipFirst } from '@/lib/playlist';

export async function POST() {
  await skipFirst();
  return NextResponse.json({ success: true });
}
