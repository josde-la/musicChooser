import { NextResponse } from 'next/server';
import { searchSongs } from '@/lib/youtube';
import { getSettings } from '@/lib/settings';
import { validateSong, ALL_PROFANITY } from '@/lib/filters';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json([]);
  }

  try {
    const settings = await getSettings();

    // Block search queries that are explicit
    if (settings.blockExplicit) {
      const queryLower = q.toLowerCase();
      if (ALL_PROFANITY.some(word => queryLower.includes(word.toLowerCase()))) {
        return NextResponse.json({ error: 'Búsqueda no permitida' }, { status: 403 });
      }
    }

    const results = await searchSongs(q, 10, settings.regionCode);

    if (!results) return NextResponse.json([]);

    const filtered = results.filter((song: any) => validateSong(song, settings).allowed);

    return NextResponse.json(filtered.slice(0, 5));
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json([]);
  }
}
