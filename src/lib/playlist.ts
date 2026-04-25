import fs from 'fs';
import path from 'path';

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

// Helper to get playlist from Local File
export async function getPlaylist(): Promise<SongRequest[]> {
  try {
    if (!fs.existsSync(FILE_PATH)) {
      // Create it if it doesn't exist
      fs.writeFileSync(FILE_PATH, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading playlist:', error);
    return [];
  }
}

export async function savePlaylist(playlist: SongRequest[]) {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(playlist, null, 2));
  } catch (error) {
    console.error('Error saving playlist:', error);
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

export async function updatePlaylistOrder(orderedIds: string[]) {
  const playlist = await getPlaylist();
  const ordered = orderedIds
    .map((id) => playlist.find((s) => s.id === id))
    .filter((s): s is SongRequest => !!s);
  await savePlaylist(ordered);
}

export async function skipFirst() {
  const playlist = await getPlaylist();
  if (playlist.length > 0) {
    const skipped = playlist.shift();
    await savePlaylist(playlist);
    return skipped;
  }
  return null;
}
