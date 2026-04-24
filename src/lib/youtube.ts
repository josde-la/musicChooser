import yts from 'yt-search';

export async function searchSong(query: string) {
  const r = await yts(query);
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
  return null;
}
