import { NextResponse } from 'next/server';
import { getLocalBySlug, getPeticiones, addPeticion } from '@/lib/db';
import { searchSongs } from '@/lib/youtube';
import { getSettings } from '@/lib/settings';
import { validateSong, ALL_PROFANITY } from '@/lib/filters';
import { Peticion } from '@/lib/db';

export async function GET(request: Request, context: any) {
  const params = await context.params;
  const slug = params.slug;
  const local = await getLocalBySlug(slug);

  if (!local) return NextResponse.json({ error: 'Local no encontrado' }, { status: 404 });

  // For the host queue, we want state 'aceptada'.
  // We can also fetch 'pendiente' in a separate endpoint or by query params,
  // but let's default to accepted for the main queue.
  const url = new URL(request.url);
  const estado = url.searchParams.get('estado') as Peticion['estado'] || 'aceptada';

  const playlist = await getPeticiones(local.id, estado);

  // Map back to expected format
  const mapped = playlist.map(s => ({
    id: s.id,
    title: s.cancion,
    artist: s.artista,
    requestedBy: s.requested_by,
    youtubeUrl: s.youtube_url,
    thumbnail: s.caratula,
    duration: s.duration
  }));

  return NextResponse.json(mapped);
}

export async function POST(request: Request, context: any) {
  try {
    const params = await context.params;
    const slug = params.slug;
    const local = await getLocalBySlug(slug);

    if (!local) return NextResponse.json({ error: 'Local no encontrado' }, { status: 404 });

    const body = await request.json();
    const { title, artist, requestedBy } = body;

    if (!title) {
      return NextResponse.json({ error: 'Song title is required' }, { status: 400 });
    }

    const settings = await getSettings(); // You could migrate this to local.settings!

    if (settings.blockExplicit) {
      const queryLower = (title + ' ' + artist).toLowerCase();
      if (ALL_PROFANITY.some(word => queryLower.includes(word.toLowerCase()))) {
        return NextResponse.json({ error: 'Contenido explícito no permitido' }, { status: 403 });
      }
    }

    const query = artist ? `${title} ${artist}` : title;
    const results = await searchSongs(query, 3, settings.regionCode);

    if (!results || results.length === 0) {
      return NextResponse.json({ error: 'No se encontró la canción en YouTube' }, { status: 404 });
    }

    let youtubeData = null;
    let rejectionReason = '';

    for (const result of results) {
      const validation = validateSong(result, settings);
      if (validation.allowed) {
        youtubeData = result;
        break;
      } else {
        rejectionReason = validation.reason || 'Contenido no permitido';
      }
    }

    if (!youtubeData) {
      return NextResponse.json({ error: rejectionReason || 'Esta canción no está permitida en esta sala' }, { status: 403 });
    }

    // Determine state based on Mode B vs Mode A
    const estado = local.auto_aceptar ? 'aceptada' : 'pendiente';

    const newDbSong = await addPeticion({
      local_id: local.id,
      cancion: youtubeData.title,
      artista: youtubeData.artist,
      caratula: youtubeData.thumbnail,
      youtube_url: youtubeData.youtubeUrl,
      duration: youtubeData.duration,
      requested_by: requestedBy || 'Guest',
      estado
    });

    if (!newDbSong) return NextResponse.json({ error: 'Database error' }, { status: 500 });

    const mapped = {
      id: newDbSong.id,
      title: newDbSong.cancion,
      artist: newDbSong.artista,
      requestedBy: newDbSong.requested_by,
      youtubeUrl: newDbSong.youtube_url,
      thumbnail: newDbSong.caratula,
      duration: newDbSong.duration
    };

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json({ error: 'Error processing your request' }, { status: 500 });
  }
}
