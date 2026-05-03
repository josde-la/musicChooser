import { NextResponse } from 'next/server';
import { getLocalBySlug, updatePeticionEstado } from '@/lib/db';

export async function PUT(request: Request, context: any) {
  try {
    const params = await context.params;
    const slug = params.slug;
    const id = params.id;
    
    console.log('[APPROVE] slug:', slug, 'id:', id);

    const local = await getLocalBySlug(slug);
    console.log('[APPROVE] local:', local);

    if (!local) return NextResponse.json({ error: 'Local no encontrado' }, { status: 404 });

    const body = await request.json();
    console.log('[APPROVE] body:', body);
    
    const { action } = body;

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const nuevoEstado = action === 'approve' ? 'aceptada' : 'reproducida';
    console.log('[APPROVE] updating id:', id, 'to:', nuevoEstado);
    
    const success = await updatePeticionEstado(id, nuevoEstado);
    console.log('[APPROVE] success:', success);

    if (!success) return NextResponse.json({ error: 'Error updating request' }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[APPROVE] ERROR:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
