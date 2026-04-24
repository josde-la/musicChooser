import { NextResponse } from 'next/server';
import { reorderPlaylist } from '@/lib/playlist';

export async function PUT(request: Request) {
  const body = await request.json();
  const { startIndex, endIndex } = body;

  if (startIndex === undefined || endIndex === undefined) {
    return NextResponse.json({ error: 'Indices are required' }, { status: 400 });
  }

  await reorderPlaylist(startIndex, endIndex);
  return NextResponse.json({ success: true });
}
