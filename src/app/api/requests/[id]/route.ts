import { NextResponse, NextRequest } from 'next/server';
import { removeSong } from '@/lib/playlist';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await removeSong(id);
  return NextResponse.json({ success: true });
}
