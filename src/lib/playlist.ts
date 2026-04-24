import fs from 'fs';
import path from 'path';
import { getStore } from '@netlify/blobs';

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

const FILE_PATH = path.join(process.cwd(), 'playlist.json');
const STORE_NAME = 'party-playlist';
const BLOB_KEY = 'current-queue';

// Helper to get playlist from either Blobs or Local File
export async function getPlaylist(): Promise<SongRequest[]> {
  // If in Netlify environment with Blobs available
  if (process.env.NETLIFY || process.env.NETLIFY_PURPOSE === 'build') {
    try {
      const store = getStore(STORE_NAME);
      const data = await store.getJSON(BLOB_KEY);
      return (data as SongRequest[]) || [];
    } catch (e) {
      console.error('Blob read error, falling back to empty:', e);
      return [];
    }
  }

  // Local fallback
  if (!fs.existsSync(FILE_PATH)) return [];
  try {
    const data = fs.readFileSync(FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function savePlaylist(playlist: SongRequest[]) {
  if (process.env.NETLIFY || process.env.NETLIFY_PURPOSE === 'build') {
    try {
      const store = getStore(STORE_NAME);
      await store.setJSON(BLOB_KEY, playlist);
      return;
    } catch (e) {
      console.error('Blob write error:', e);
    }
  }

  // Local fallback
  fs.writeFileSync(FILE_PATH, JSON.stringify(playlist, null, 2));
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
