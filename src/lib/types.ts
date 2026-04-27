export interface PartySettings {
  onlyMusic: boolean;
  regionCode: string;
  forbiddenKeywords: string[];
  allowedGenres: string[];
  disallowedGenres: string[];
  blockExplicit: boolean;
  maxSongDuration: number;
}

export const DEFAULT_SETTINGS: PartySettings = {
  onlyMusic: true,
  regionCode: 'ES',
  forbiddenKeywords: [],
  allowedGenres: [],
  disallowedGenres: [],
  blockExplicit: true,
  maxSongDuration: 600,
};

export const AVAILABLE_GENRES = [
  { id: 'reggaeton', label: 'Reggaetón', emoji: '🔥' },
  { id: 'trap', label: 'Trap', emoji: '💀' },
  { id: 'pop', label: 'Pop', emoji: '🎤' },
  { id: 'rock', label: 'Rock', emoji: '🎸' },
  { id: 'jazz', label: 'Jazz', emoji: '🎷' },
  { id: 'electronic', label: 'EDM', emoji: '🎧' },
  { id: 'hiphop', label: 'Hip Hop', emoji: '🎙️' },
  { id: 'metal', label: 'Metal', emoji: '🤘' },
  { id: 'classical', label: 'Clásica', emoji: '🎻' },
  { id: 'flamenco', label: 'Flamenco', emoji: '💃' },
  { id: 'cumbia', label: 'Cumbia', emoji: '🪘' },
  { id: 'salsa', label: 'Salsa', emoji: '💃' },
  { id: 'country', label: 'Country', emoji: '🤠' },
  { id: 'rnb', label: 'R&B', emoji: '🎵' },
  { id: 'kpop', label: 'K-Pop', emoji: '🇰🇷' },
  { id: 'indie', label: 'Indie', emoji: '🌿' },
] as const;