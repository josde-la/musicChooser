import { NextResponse } from 'next/server';
import { importPlaylist, searchSong } from '@/lib/youtube';
import { addSong } from '@/lib/playlist';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    const tracks = await importPlaylist(url);
    if (!tracks || tracks.length === 0) {
      return NextResponse.json({ error: 'No tracks found or platform not supported' }, { status: 404 });
    }

    // Add tracks to playlist
    // For Spotify/Apple, we might need a search to find the YouTube URL
    for (const track of tracks) {
      let finalTrack = track;
      if (!track.youtubeUrl) {
        // Search on YouTube if it's from Spotify/Apple
        const match = await searchSong(`${track.title} ${track.artist}`);
        if (match) {
          finalTrack = { ...track, ...match };
        }
      }

      await addSong({
        title: finalTrack.title,
        artist: finalTrack.artist,
        requestedBy: 'PLAYLIST_IMPORT',
        youtubeUrl: finalTrack.youtubeUrl,
        thumbnail: finalTrack.thumbnail,
        duration: finalTrack.duration,
        sourceType: 'playlist'
      });
    }

    return NextResponse.json({ success: true, count: tracks.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
