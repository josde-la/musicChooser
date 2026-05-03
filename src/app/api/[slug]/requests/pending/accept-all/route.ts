import { NextResponse } from 'next/server';
import { getLocalBySlug, updateAllPendientesToAceptada } from '@/lib/db';

export async function PUT(request: Request, context: any) {
  try {
    const params = await context.params;
    const slug = params.slug;
    const local = await getLocalBySlug(slug);

    if (!local) return NextResponse.json({ error: 'Local no encontrado' }, { status: 404 });

    await updateAllPendientesToAceptada(local.id);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[ACCEPT ALL] ERROR:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
