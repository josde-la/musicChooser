export interface SongRequest {
  id: string;
  title: string;
  artist: string;
  requestedBy: string;
  timestamp: number;
  youtubeUrl?: string;
  thumbnail?: string;
  duration?: string;
}

const STORE_NAME = 'party-playlist';
const BLOB_KEY = 'current-queue';

async function getFs() {
  try {
    return await import('fs');
  } catch (e) {
    return null;
  }
}

async function getPath() {
  try {
    return await import('path');
  } catch (e) {
    return null;
  }
}

async function getFilePath() {
  const path = await getPath();
  if (!path) return 'playlist.json';
  return path.join(process.cwd(), 'playlist.json');
}

// Helper to get playlist from either Blobs or Local File
export async function getPlaylist(): Promise<SongRequest[]> {
  const isNetlify = process.env.NETLIFY === 'true' || !!process.env.NETLIFY_PURPOSE || !!process.env.SITE_ID;

  // If in Netlify environment with Blobs available
  if (isNetlify) {
    try {
      console.log('Attempting to read from Netlify Blobs...');
      const { getStore } = await import('@netlify/blobs');
      const store = getStore(STORE_NAME);
      if (!store) throw new Error('Could not initialize Blob store');

      const data = await store.get(BLOB_KEY, { type: 'json' });
      return (data as SongRequest[]) || [];
    } catch (e) {
      console.error('Blob read error:', e);
      // Fallback to local only if we're somehow running in a way that allows it
    }
  }

  // Local fallback (development)
  try {
    const fs = await getFs();
    const filePath = await getFilePath();
    if (!fs || !fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Local read error:', e);
    return [];
  }
}

export async function savePlaylist(playlist: SongRequest[]) {
  const isNetlify = process.env.NETLIFY === 'true' || !!process.env.NETLIFY_PURPOSE || !!process.env.SITE_ID;

  if (isNetlify) {
    try {
      console.log('Attempting to save to Netlify Blobs...');
      const { getStore } = await import('@netlify/blobs');
      const store = getStore(STORE_NAME);
      if (store) {
        await store.setJSON(BLOB_KEY, playlist);
        return;
      }
    } catch (e) {
      console.error('Blob write error:', e);
    }
  }

  // Local fallback (development)
  try {
    const fs = await getFs();
    const filePath = await getFilePath();
    if (fs) {
      fs.writeFileSync(filePath, JSON.stringify(playlist, null, 2));
    }
  } catch (e) {
    console.error('Local write error:', e);
  }
}

export async function addSong(song: Omit<SongRequest, 'id' | 'timestamp'>) {
  const playlist = await getPlaylist();
  const newSong: SongRequest = {
    ...song,
    id: Math.random().toString(36).substring(2, 9),
    timestamp: Date.now(),
  };
  playlist.push(newSong);
  await savePlaylist(playlist);
  return newSong;
}

export async function removeSong(id: string) {
  const playlist = await getPlaylist();
  const filtered = playlist.filter((s) => s.id !== id);
  await savePlaylist(filtered);
}

export async function reorderPlaylist(startIndex: number, endIndex: number) {
  const playlist = await getPlaylist();
  const [removed] = playlist.splice(startIndex, 1);
  playlist.splice(endIndex, 0, removed);
  await savePlaylist(playlist);
}

export async function skipFirst() {
  const playlist = await getPlaylist();
  if (playlist.length > 0) {
    playlist.shift();
    await savePlaylist(playlist);
  }
}
