import { NextResponse } from 'next/server';
import { getPlaylist, addSong } from '@/lib/playlist';
import { searchSong } from '@/lib/youtube';

export async function GET() {
  try {
    const playlist = await getPlaylist();
    return NextResponse.json(playlist);
  } catch (error: any) {
    console.error('GET requests error:', error);
    return NextResponse.json({ error: error.message || 'Error fetching playlist' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, artist, requestedBy } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
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
  } catch (error: any) {
    console.error('POST requests error:', error);
    return NextResponse.json({ error: error.message || 'Error processing request' }, { status: 500 });
  }
}
