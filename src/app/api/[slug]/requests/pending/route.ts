import { NextResponse } from 'next/server';
import { getLocalBySlug, deleteAllPendientes } from '@/lib/db';

export async function DELETE(request: Request, context: any) {
  try {
    const params = await context.params;
    const slug = params.slug;
    const local = await getLocalBySlug(slug);

    if (!local) return NextResponse.json({ error: 'Local no encontrado' }, { status: 404 });

    await deleteAllPendientes(local.id);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[DELETE ALL PENDING] ERROR:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
