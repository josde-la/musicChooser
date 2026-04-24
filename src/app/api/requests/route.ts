import { NextResponse } from 'next/server';
import { getPlaylist, addSong } from '@/lib/playlist';
import { searchSong } from '@/lib/youtube';

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

    const query = artist ? `${title} ${artist}` : title;
    const youtubeData = await searchSong(query);

    if (!youtubeData) {
      return NextResponse.json({ error: 'No se encontró la canción en YouTube' }, { status: 404 });
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
