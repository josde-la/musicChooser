import yts from 'yt-search';

/**
 * Gets enriched metadata for a list of video IDs.
 */
export async function getVideosDetails(videoIds: string[]) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey || videoIds.length === 0) return {};

    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,topicDetails,contentDetails,contentRating,status&id=${videoIds.join(',')}&key=${apiKey}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    const details: Record<string, any> = {};
    if (data.items) {
      data.items.forEach((item: any) => {
        const tags = item.snippet.tags || [];
        const topics = (item.topicDetails?.topicCategories || []).map((url: string) =>
          url.split('/').pop()?.toLowerCase()
        );

        // YouTube's content rating - could be "safe" or "restricted"
        const ratings = item.contentRating || {};
        const ytRating = ratings.ytRating || 'safe';
        const isAgeRestricted = ratings.yt3dModule || ratings.ypcContentRating || null;

        details[item.id] = {
          tags,
          topics,
          description: item.snippet.description || '',
          duration: item.contentDetails?.duration,
          ytRating,
          isAgeRestricted: !!isAgeRestricted || ytRating === 'restricted'
        };
      });
    }
    return details;
  } catch (error) {
    console.error('Error fetching video details:', error);
    return {};
  }
}

/**
 * Searches for songs on YouTube.
 */
export async function searchSongs(query: string, maxResults: number = 5, regionCode: string = 'ES') {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (apiKey) {
      const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&regionCode=${regionCode}&key=${apiKey}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const results = data.items.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          youtubeUrl: `https://youtube.com/watch?v=${item.id.videoId}`,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
          duration: '3:00',
        }));

        // Fetch extra details for filtering
        const details = await getVideosDetails(results.map((r: any) => r.id));
        return results.map((r: any) => ({
          ...r,
          ...details[r.id]
        }));
      }
    }

    // Fallback to yt-search
    const searchFn = (yts as any).default || yts;
    const r = await searchFn(query);

    if (!r || !r.videos || r.videos.length === 0) return [];

    return r.videos.slice(0, maxResults).map((video: any) => ({
      id: video.videoId,
      title: video.title,
      artist: video.author.name,
      youtubeUrl: video.url,
      thumbnail: video.thumbnail,
      duration: video.timestamp,
    }));
  } catch (error) {
    console.error('YouTube search error:', error);
    return [];
  }
}

/**
 * Searches for a single best match.
 */
export async function searchSong(query: string) {
  const results = await searchSongs(query, 1);
  return results.length > 0 ? results[0] : null;
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

    // Spotify Playlist (Scraper)
    if (url.includes('spotify.com/playlist')) {
      const playlistId = url.match(/playlist\/([a-zA-Z0-9]+)/)?.[1];
      if (!playlistId) throw new Error('Invalid Spotify playlist link');

      const res = await fetch(`https://open.spotify.com/embed/playlist/${playlistId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const html = await res.text();

      // The data is in a script tag with id="__NEXT_DATA__"
      const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
      if (match) {
        const data = JSON.parse(match[1]);
        const trackList = data.props.pageProps.state.data.entity.trackList;

        if (trackList && trackList.length > 0) {
          return trackList.map((t: any) => ({
            title: t.title,
            artist: t.subtitle, // Artist name is in subtitle in the embed data
            sourceType: 'playlist'
          }));
        }
      }
    }

    // Apple Music Playlist (Page Scraper)
    if (url.includes('music.apple.com')) {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const html = await res.text();

      const tracks: any[] = [];
      const regex = /"trackName":"([^"]+)","artistName":"([^"]+)"/g;
      let m;
      while ((m = regex.exec(html)) !== null) {
        tracks.push({
          title: m[1],
          artist: m[2],
          sourceType: 'playlist'
        });
      }

      if (tracks.length > 0) return tracks;
    }

    return [];
  } catch (error) {
    console.error('Playlist import error:', error);
    return [];
  }
}
