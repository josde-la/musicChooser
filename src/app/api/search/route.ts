import { NextResponse } from 'next/server';
import { searchSong } from '@/lib/youtube';
import yts from 'yt-search';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json([]);
  }

  try {
    const searchFn = (yts as any).default || yts;
    const r = await searchFn(q);

    if (!r || !r.videos) return NextResponse.json([]);

    const videos = r.videos.slice(0, 5).map((video: any) => ({
      title: video.title,
      artist: video.author.name,
      youtubeUrl: video.url,
      thumbnail: video.thumbnail,
      duration: video.timestamp,
    }));
    return NextResponse.json(videos);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json([]);
  }
}
