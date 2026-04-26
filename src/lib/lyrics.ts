/**
 * Lyrics fetching utility with multiple fallbacks for maximum redundancy.
 */

interface LyricsResponse {
  lyrics: string | null;
  source: string;
}

export async function fetchLyrics(title: string, artist: string): Promise<LyricsResponse | null> {
  const providers = [
    {
      name: 'LRCLib',
      fetch: async (t: string, a: string) => {
        const res = await fetch(`https://lrclib.net/api/search?track_name=${encodeURIComponent(t)}&artist_name=${encodeURIComponent(a)}`);
        const data = await res.json();
        if (data && data.length > 0) {
          return data[0].plainLyrics || data[0].syncedLyrics;
        }
        return null;
      }
    },
    {
      name: 'Lyrics.ovh',
      fetch: async (t: string, a: string) => {
        const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(a)}/${encodeURIComponent(t)}`);
        const data = await res.json();
        return data.lyrics || null;
      }
    },
    {
      name: 'Lyrist',
      fetch: async (t: string, a: string) => {
        const res = await fetch(`https://lyrist.vercel.app/api/${encodeURIComponent(a)}/${encodeURIComponent(t)}`);
        const data = await res.json();
        return data.lyrics || null;
      }
    }
  ];

  for (const provider of providers) {
    try {
      console.log(`Trying lyrics provider: ${provider.name}`);
      const lyrics = await provider.fetch(title, artist);
      if (lyrics && lyrics.trim().length > 50) { // Simple check to ensure we got actual lyrics
        return { lyrics, source: provider.name };
      }
    } catch (e) {
      console.warn(`Provider ${provider.name} failed:`, e);
    }
  }

  // Final fallback: try LRCLib but only with title (fuzzy match)
  try {
    const res = await fetch(`https://lrclib.net/api/search?track_name=${encodeURIComponent(title)}`);
    const data = await res.json();
    if (data && data.length > 0) {
      return { lyrics: data[0].plainLyrics || data[0].syncedLyrics, source: 'LRCLib (Fuzzy)' };
    }
  } catch (e) {
    console.error('Fuzzy search failed:', e);
  }

  return null;
}
