import yts from 'yt-search';

/**
 * Searches for a song on YouTube.
 * If only a song title is provided, it returns the best match.
 */
export async function searchSong(query: string) {
  try {
    // Check if we have an API key (optional but recommended for 100% reliability)
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (apiKey) {
      const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        return {
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          youtubeUrl: `https://youtube.com/watch?v=${item.id.videoId}`,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
          duration: '3:00', // API search doesn't give duration in the same call
        };
      }
    }

    // Fallback to yt-search (scraping)
    const searchFn = (yts as any).default || yts;
    const r = await searchFn(query);

    if (!r || !r.videos || r.videos.length === 0) return null;

    const video = r.videos[0];
    return {
      title: video.title,
      artist: video.author.name,
      youtubeUrl: video.url,
      thumbnail: video.thumbnail,
      duration: video.timestamp,
    };
  } catch (error) {
    console.error('YouTube search error:', error);
    return null;
  }
}

/**
 * Gets recommended/similar videos based on a video ID.
 */
export async function getRecommendedVideos(videoId: string) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (apiKey) {
      const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&relatedToVideoId=${videoId}&type=video&key=${apiKey}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        return data.items.map((item: any) => ({
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          youtubeUrl: `https://youtube.com/watch?v=${item.id.videoId}`,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
          duration: '3:00',
        }));
      }
    }

    // Scraper fallback doesn't easily support "related" but we can search for the video title
    // to get similar results
    return [];
  } catch (error) {
    console.error('Recommended videos error:', error);
    return [];
  }
}
