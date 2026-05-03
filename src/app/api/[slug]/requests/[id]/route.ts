import { NextResponse, NextRequest } from 'next/server';
import { deletePeticion, getLocalBySlug } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  context: any
) {
  const params = await context.params;
  const { id } = params;
  
  const local = await getLocalBySlug(params.slug);
  if (!local) return NextResponse.json({ error: 'Local no encontrado' }, { status: 404 });
  
  await deletePeticion(id);
  
  return NextResponse.json({ success: true });
}