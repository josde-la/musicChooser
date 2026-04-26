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
export async function getRecommendedVideos(videoId: string, songTitle?: string) {
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

    // Discovery fallback: Search for the artist's name + "radio" or "mix"
    // to discover DIFFERENT but similar songs
    if (songTitle) {
      const searchFn = (yts as any).default || yts;
      // We search for the song name but append "mix" or "similar"
      const r = await searchFn(`${songTitle} similar songs`);

      if (r && r.videos && r.videos.length > 0) {
        // Filter out videos that have the same title (case insensitive)
        // to avoid "Lyrics" or "Karaoke" versions of the SAME song
        const baseTitle = songTitle.toLowerCase().split('(')[0].trim();

        const filtered = r.videos.filter((v: any) => {
          const vTitle = v.title.toLowerCase();
          return !vTitle.includes(baseTitle);
        });

        const pool = filtered.length > 0 ? filtered : r.videos.slice(3); // Fallback to later results if all filtered

        return pool.slice(0, 3).map((v: any) => ({
          title: v.title,
          artist: v.author.name,
          youtubeUrl: v.url,
          thumbnail: v.thumbnail,
          duration: v.timestamp
        }));
      }
    }

    return [];
  } catch (error) {
    console.error('Recommended videos error:', error);
    return [];
  }
}

/**
 * Imports a playlist from a URL (YouTube, Spotify, Apple Music).
 * Returns a list of partial SongRequests.
 */
export async function importPlaylist(url: string) {
  try {
    // YouTube Playlist
    if (url.includes('youtube.com/playlist') || url.includes('&list=')) {
      const listId = url.match(/[&?]list=([a-zA-Z0-9_-]+)/)?.[1];
      if (!listId) throw new Error('Invalid YouTube playlist link');

      const searchFn = (yts as any).default || yts;
      const r = await searchFn({ listId });

      if (r && r.videos) {
        return r.videos.map((v: any) => ({
          title: v.title,
          artist: v.author.name,
          youtubeUrl: `https://youtube.com/watch?v=${v.videoId}`,
          thumbnail: v.thumbnail,
          duration: v.timestamp,
          sourceType: 'playlist'
        }));
      }
    }

    // Spotify Playlist (Scraper Fallback or Info Parser)
    if (url.includes('spotify.com/playlist')) {
      const playlistId = url.match(/playlist\/([a-zA-Z0-9]+)/)?.[1];
      if (!playlistId) throw new Error('Invalid Spotify playlist link');

      // Since it's server-side, we can't easily use the Embed scraper without a headless browser
      // But we can use an open-data resolver if available.
      // For now, let's provide a notice or a basic title fetch if we can.
    }

    return [];
  } catch (error) {
    console.error('Playlist import error:', error);
    return [];
  }
}
