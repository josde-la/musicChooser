import { NextResponse } from 'next/server';
import { skipFirst, getPlaylist, addSong } from '@/lib/playlist';
import { getRecommendedVideos } from '@/lib/youtube';

export async function POST() {
  const skippedSong = await skipFirst();
  const currentPlaylist = await getPlaylist();

  // If the playlist is empty, try to add related music for a continuous vibe
  if (currentPlaylist.length === 0 && skippedSong && skippedSong.youtubeUrl) {
    const match = skippedSong.youtubeUrl.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    const videoId = match ? match[1] : null;

    if (videoId) {
      const recommendations = await getRecommendedVideos(videoId, skippedSong.title);
      if (recommendations && recommendations.length > 0) {
        // Add one recommendation automatically
        const rec = recommendations[0];
        await addSong({
          title: rec.title,
          artist: rec.artist,
          requestedBy: 'DJ Auto-Mix',
          youtubeUrl: rec.youtubeUrl,
          thumbnail: rec.thumbnail,
          duration: rec.duration
        });
      }
    }
  }

  return NextResponse.json({ success: true });
}
