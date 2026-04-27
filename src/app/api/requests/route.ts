import { NextResponse } from 'next/server';
import { getPlaylist, addSong } from '@/lib/playlist';
import { searchSongs } from '@/lib/youtube';
import { getSettings } from '@/lib/settings';
import { validateSong, ALL_PROFANITY } from '@/lib/filters';

export async function GET() {
  const playlist = await getPlaylist();
  return NextResponse.json(playlist);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, artist, requestedBy } = body;

    if (!title) {
      return NextResponse.json({ error: 'Song title is required' }, { status: 400 });
    }

    const settings = await getSettings();

    // Block search queries that are explicit
    if (settings.blockExplicit) {
      const queryLower = (title + ' ' + artist).toLowerCase();
      if (ALL_PROFANITY.some(word => queryLower.includes(word.toLowerCase()))) {
        return NextResponse.json({ error: 'Contenido explícito no permitido' }, { status: 403 });
      }
    }

    const query = artist ? `${title} ${artist}` : title;

    // Use searchSongs (with metadata) instead of searchSong for richer filtering
    const results = await searchSongs(query, 3, settings.regionCode);

    if (!results || results.length === 0) {
      return NextResponse.json({ error: 'No se encontró la canción en YouTube' }, { status: 404 });
    }

    // Find the first result that passes validation
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

    const newSong = await addSong({
      title: youtubeData.title,
      artist: youtubeData.artist,
      requestedBy: requestedBy || 'Guest',
      youtubeUrl: youtubeData.youtubeUrl,
      thumbnail: youtubeData.thumbnail,
      duration: youtubeData.duration
    });

    return NextResponse.json(newSong);
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json({ error: 'Error processing your request' }, { status: 500 });
  }
}
