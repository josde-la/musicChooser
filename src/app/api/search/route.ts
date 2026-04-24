import { NextResponse } from 'next/server';
import yts from 'yt-search';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json([]);
  }

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Search timeout')), 8000)
    );

    const searchPromise = yts(q);

    const r: any = await Promise.race([searchPromise, timeoutPromise]);

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
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Error searching YouTube (possible timeout)' }, { status: 500 });
  }
}
