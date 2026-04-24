import { NextResponse } from 'next/server';
import { removeSong } from '@/lib/playlist';

export async function DELETE(
  { params }: { params: { id: string } }
) {
  const { id } = params;
  await removeSong(id);
  return NextResponse.json({ success: true });
}
