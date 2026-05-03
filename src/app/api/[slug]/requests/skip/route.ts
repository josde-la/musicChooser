import { NextResponse } from 'next/server';
import { getPeticiones, deletePeticion, getLocalBySlug, addPeticion } from '@/lib/db';
import { getRecommendedVideos } from '@/lib/youtube';

export async function POST(request: Request, context: any) {
  const params = await context.params;
  const slug = params.slug;
  const local = await getLocalBySlug(slug);
  
  if (!local) return NextResponse.json({ error: 'Local not found' }, { status: 404 });

  const currentPlaylist = await getPeticiones(local.id, 'aceptada');
  let skippedSong = null;

  if (currentPlaylist.length > 0) {
    skippedSong = currentPlaylist[0];
    await deletePeticion(skippedSong.id);
  }

  // Reload playlist after delete
  const newPlaylist = await getPeticiones(local.id, 'aceptada');

  // DJ Auto-Mix
  if (newPlaylist.length === 0 && skippedSong && skippedSong.youtube_url) {
    const match = skippedSong.youtube_url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    const videoId = match ? match[1] : null;

    if (videoId) {
      const recommendations = await getRecommendedVideos(videoId, skippedSong.cancion);
      if (recommendations && recommendations.length > 0) {
        const rec = recommendations[Math.floor(Math.random() * Math.min(3, recommendations.length))];
        await addPeticion({
          local_id: local.id,
          cancion: rec.title,
          artista: rec.artist,
          requested_by: 'DJ Auto-Mix',
          youtube_url: rec.youtubeUrl,
          caratula: rec.thumbnail,
          duration: rec.duration,
          estado: 'aceptada'
        });
      }
    }
  }

  return NextResponse.json({ success: true });
}
