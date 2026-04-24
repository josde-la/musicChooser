import yts from 'yt-search';

export async function searchSong(query: string) {
  try {
    // Add a timeout to prevent hanging on serverless environments
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Search timeout')), 8000)
    );

    const searchPromise = yts(query);

    const r: any = await Promise.race([searchPromise, timeoutPromise]);

    if (!r || !r.videos) return null;

    const videos = r.videos.slice(0, 1);
    if (videos.length > 0) {
      const video = videos[0];
      return {
        title: video.title,
        artist: video.author.name,
        youtubeUrl: video.url,
        thumbnail: video.thumbnail,
        duration: video.timestamp,
      };
    }
  } catch (error) {
    console.error('YouTube search error:', error);
    return null;
  }
  return null;
}
