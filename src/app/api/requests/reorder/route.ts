import { NextResponse } from 'next/server';
import { reorderPlaylist, updatePlaylistOrder } from '@/lib/playlist';

export async function PUT(request: Request) {
  const body = await request.json();
  const { startIndex, endIndex, newOrder } = body;

  if (newOrder && Array.isArray(newOrder)) {
    await updatePlaylistOrder(newOrder);
    return NextResponse.json({ success: true });
  }

  if (startIndex === undefined || endIndex === undefined) {
    return NextResponse.json({ error: 'Indices or newOrder are required' }, { status: 400 });
  }

  await reorderPlaylist(startIndex, endIndex);
  return NextResponse.json({ success: true });
}
