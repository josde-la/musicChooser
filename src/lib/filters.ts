import { PartySettings } from './types';

export interface SongMetadata {
  title: string;
  artist: string;
  tags?: string[];
  topics?: string[];
  description?: string;
  duration?: string;
  ytRating?: string;
  isAgeRestricted?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// PROFANITY WORDLIST (Spanish + English)
// When "blockExplicit" is ON, any song containing these in title/tags/description is blocked.
// ═══════════════════════════════════════════════════════════════
const PROFANITY_ES = [
  'verga', 'polla', 'puta', 'puto', 'coño', 'joder', 'mierda', 'culo',
  'follame', 'follar', 'chingar', 'chingada', 'pendejo', 'pendeja',
  'cabron', 'cabrón', 'cabrona', 'maricón', 'maricon', 'zorra',
  'mamada', 'cogeme', 'cógeme', 'culiar', 'culear', 'culeo',
  'nalgas', 'tetas', 'orgasmo', 'sexo oral', 'masturb',
  'prostitut', 'droga', 'cocaína', 'cocaina', 'mdma', 'éxtasis',
  'porr', 'hierba', 'crack', 'heroína', 'heroina',
  'narco', 'sicario', 'matare', 'mataré', 'suicid', 'violar',
  'gemidos', 'gemido', 'moan', 'moaning', 'porn', 'porno', 'xxx',
  'twerk', 'twerking', 'booty', 'assshake', 'whipping',
];

const PROFANITY_EN = [
  'fuck', 'shit', 'bitch', 'ass ', 'asshole', 'dick', 'cock',
  'pussy', 'nigga', 'nigger', 'whore', 'slut', 'damn',
  'motherfuck', 'bullshit', 'bastard', 'cunt', 'orgasm',
  'sex tape', 'leaked', 'nude', 'nsfw', '18+', 'adult',
];

const ALL_PROFANITY = [...PROFANITY_ES, ...PROFANITY_EN];
export { ALL_PROFANITY };

// ═══════════════════════════════════════════════════════════════
// GENRE DATABASE
// Maps genre IDs to a comprehensive set of:
//   - keywords (found in titles, tags, topics, descriptions)
//   - artists (channel names / artist names strongly associated)
// ═══════════════════════════════════════════════════════════════
export const AVAILABLE_GENRES = [
  { id: 'reggaeton', label: 'Reggaetón', emoji: '🔥' },
  { id: 'trap', label: 'Trap / Latin Trap', emoji: '💀' },
  { id: 'pop', label: 'Pop', emoji: '🎤' },
  { id: 'rock', label: 'Rock', emoji: '🎸' },
  { id: 'jazz', label: 'Jazz', emoji: '🎷' },
  { id: 'electronic', label: 'Electrónica / EDM', emoji: '🎧' },
  { id: 'hiphop', label: 'Hip Hop / Rap', emoji: '🎙️' },
  { id: 'metal', label: 'Metal / Heavy', emoji: '🤘' },
  { id: 'classical', label: 'Clásica', emoji: '🎻' },
  { id: 'flamenco', label: 'Flamenco', emoji: '💃' },
  { id: 'cumbia', label: 'Cumbia', emoji: '🪘' },
  { id: 'salsa', label: 'Salsa / Bachata', emoji: '💃' },
  { id: 'country', label: 'Country', emoji: '🤠' },
  { id: 'rnb', label: 'R&B / Soul', emoji: '🎵' },
  { id: 'kpop', label: 'K-Pop', emoji: '🇰🇷' },
  { id: 'indie', label: 'Indie / Alternativo', emoji: '🌿' },
] as const;

export type GenreId = typeof AVAILABLE_GENRES[number]['id'];

const GENRE_DATA: Record<string, { keywords: string[]; artists: string[] }> = {
  reggaeton: {
    keywords: [
      'reggaeton', 'reggaetón', 'reguetón', 'regueton',
      'urbano', 'perreo', 'dembow', 'latin urban',
      'reggae_music', 'latin_music',
    ],
    artists: [
      'bad bunny', 'j balvin', 'karol g', 'ozuna', 'anuel',
      'daddy yankee', 'don omar', 'nicky jam', 'maluma',
      'farruko', 'sech', 'lunay', 'myke towers', 'jhay cortez',
      'rauw alejandro', 'feid', 'mora', 'blessd', 'ryan castro',
      'yandel', 'wisin', 'plan b', 'zion', 'lennox',
      'de la ghetto', 'arcangel', 'bryant myers', 'lenny tavarez',
      'manuel turizo', 'sebastián yatra', 'becky g', 'anitta',
      'rosalía', 'rosalia', 'chencho corleone', 'el alfa',
      'tokischa', 'ivy queen', 'tego calderon', 'cosculluela',
      'ñengo flow', 'nengo flow', 'dalex', 'kevvo', 'brray',
      'jowell', 'randy', 'yng lvcas', 'peso pluma',
      'young miko', 'villano antillano', 'eladio carrión',
    ],
  },
  trap: {
    keywords: [
      'trap', 'latin trap', 'trap latino', 'hip_hop_music',
      'drill', 'phonk',
    ],
    artists: [
      'anuel', 'bad bunny', 'bryant myers', 'noriel',
      'almighty', 'lil pump', 'xxxtentacion', 'juice wrld',
      'travis scott', 'future', 'young thug', 'gunna',
      'lil baby', 'lil uzi vert', 'playboi carti',
      'migos', 'quavo', 'offset', 'takeoff',
      'eladio carrión', 'ñengo flow', 'nengo flow',
      'ele a el dominio', 'darkiel', 'luar la l',
      'young miko',
    ],
  },
  pop: {
    keywords: [
      'pop', 'pop_music', 'dance-pop', 'electropop',
      'synth-pop', 'synthpop', 'bubblegum', 'teen pop',
    ],
    artists: [
      'taylor swift', 'ariana grande', 'dua lipa', 'billie eilish',
      'harry styles', 'the weeknd', 'ed sheeran', 'adele',
      'justin bieber', 'selena gomez', 'shakira', 'miley cyrus',
      'olivia rodrigo', 'sabrina carpenter', 'chappell roan',
      'lady gaga', 'bruno mars', 'katy perry', 'rihanna',
      'doja cat', 'sza', 'lana del rey', 'charli xcx',
      'aitana', 'c. tangana', 'c tangana', 'quevedo',
    ],
  },
  rock: {
    keywords: [
      'rock', 'rock_music', 'indie rock', 'punk', 'punk rock',
      'alternative', 'grunge', 'garage rock',
    ],
    artists: [
      'foo fighters', 'nirvana', 'red hot chili peppers',
      'arctic monkeys', 'the strokes', 'green day', 'blink-182',
      'muse', 'radiohead', 'oasis', 'coldplay', 'u2',
      'the killers', 'imagine dragons', 'linkin park',
      'queens of the stone age', 'pearl jam', 'audioslave',
    ],
  },
  jazz: {
    keywords: [
      'jazz', 'jazz_music', 'smooth jazz', 'free jazz',
      'bebop', 'swing', 'bossa nova', 'latin jazz',
    ],
    artists: [
      'miles davis', 'john coltrane', 'bill evans', 'charlie parker',
      'herbie hancock', 'thelonious monk', 'duke ellington',
      'louis armstrong', 'ella fitzgerald', 'nina simone',
      'kamasi washington', 'robert glasper', 'norah jones',
    ],
  },
  electronic: {
    keywords: [
      'electronic', 'edm', 'house', 'techno', 'trance',
      'dubstep', 'drum and bass', 'dnb', 'ambient',
      'deep house', 'progressive house', 'future bass',
      'hardstyle', 'psytrance', 'electronica',
      'electronic_music',
    ],
    artists: [
      'david guetta', 'calvin harris', 'marshmello', 'martin garrix',
      'avicii', 'deadmau5', 'skrillex', 'tiësto', 'tiesto',
      'armin van buuren', 'zedd', 'kygo', 'flume',
      'daft punk', 'disclosure', 'fisher', 'fred again',
    ],
  },
  hiphop: {
    keywords: [
      'hip hop', 'hip-hop', 'hip_hop_music', 'rap',
      'gangsta', 'boom bap', 'conscious rap',
    ],
    artists: [
      'drake', 'kendrick lamar', 'kanye west', 'ye',
      'jay-z', 'eminem', 'nas', 'j. cole', 'j cole',
      '21 savage', 'metro boomin', 'post malone',
      'tyler the creator', 'a$ap rocky', 'mac miller',
      'cardi b', 'megan thee stallion', 'nicki minaj',
      'residente', 'calle 13', 'nach', 'kase.o',
    ],
  },
  metal: {
    keywords: [
      'metal', 'metal_music', 'heavy metal', 'death metal',
      'black metal', 'thrash metal', 'power metal',
      'metalcore', 'deathcore', 'nu metal', 'doom metal',
    ],
    artists: [
      'metallica', 'slayer', 'megadeth', 'iron maiden',
      'judas priest', 'black sabbath', 'pantera',
      'slipknot', 'avenged sevenfold', 'system of a down',
      'rammstein', 'tool', 'gojira', 'lamb of god',
      'bring me the horizon', 'trivium',
    ],
  },
  classical: {
    keywords: [
      'classical', 'classical_music', 'symphony', 'concerto',
      'sonata', 'orchestra', 'chamber music', 'opera',
    ],
    artists: [
      'beethoven', 'mozart', 'bach', 'chopin', 'vivaldi',
      'tchaikovsky', 'debussy', 'liszt', 'brahms',
      'berliner philharmoniker', 'london symphony',
    ],
  },
  flamenco: {
    keywords: [
      'flamenco', 'rumba', 'bulerías', 'bulerias',
      'sevillanas', 'fandango', 'soleá', 'solea',
    ],
    artists: [
      'camarón', 'camaron', 'paco de lucía', 'paco de lucia',
      'ketama', 'rosalía', 'rosalia', 'niña pastori',
      'estrella morente', 'diego el cigala',
    ],
  },
  cumbia: {
    keywords: ['cumbia', 'cumbia villera', 'cumbia pop'],
    artists: [
      'los angeles azules', 'los palmeras', 'grupo cañaveral',
      'celso piña',
    ],
  },
  salsa: {
    keywords: [
      'salsa', 'bachata', 'merengue', 'son cubano',
    ],
    artists: [
      'marc anthony', 'romeo santos', 'prince royce',
      'celia cruz', 'hector lavoe', 'juan luis guerra',
      'aventura', 'romeo santos',
    ],
  },
  country: {
    keywords: ['country', 'country_music', 'bluegrass', 'americana'],
    artists: [
      'luke combs', 'morgan wallen', 'chris stapleton',
      'zach bryan', 'johnny cash', 'dolly parton',
    ],
  },
  rnb: {
    keywords: ['r&b', 'rnb', 'soul', 'soul_music', 'neo soul'],
    artists: [
      'sza', 'frank ocean', 'the weeknd', 'daniel caesar',
      'summer walker', 'h.e.r.', 'khalid', 'brent faiyaz',
      'usher', 'beyoncé', 'beyonce', 'alicia keys',
    ],
  },
  kpop: {
    keywords: ['k-pop', 'kpop', 'korean pop'],
    artists: [
      'bts', 'blackpink', 'stray kids', 'seventeen',
      'twice', 'aespa', 'newjeans', 'ive', 'le sserafim',
      'txt', 'nct', 'red velvet', 'exo',
    ],
  },
  indie: {
    keywords: ['indie', 'alternative', 'lo-fi', 'lofi', 'shoegaze'],
    artists: [
      'tame impala', 'mac demarco', 'the 1975',
      'phoebe bridgers', 'bon iver', 'fleet foxes',
      'vetusta morla', 'izal', 'lori meyers',
      'love of lesbian', 'la oreja de van gogh',
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// MAIN VALIDATION FUNCTION
// ═══════════════════════════════════════════════════════════════
export function validateSong(song: SongMetadata, settings: PartySettings): { allowed: boolean; reason?: string } {
  const title = song.title.toLowerCase();
  const artist = song.artist.toLowerCase();
  const tags = (song.tags || []).map(t => t.toLowerCase());
  const topics = (song.topics || []).map(t => t.toLowerCase());
  const description = (song.description || '').toLowerCase();
  const fullContent = `${title} ${artist} ${tags.join(' ')} ${topics.join(' ')} ${description}`;

  // ── 0. YouTube Content Rating Check ──
  if (settings.blockExplicit && (song.isAgeRestricted || song.ytRating === 'restricted')) {
    return { allowed: false, reason: 'Contenido no apropiado (restringido por YouTube)' };
  }

  // ── 1. Profanity / Explicit Check ──
  if (settings.blockExplicit) {
    const hasProfanity = ALL_PROFANITY.some(word => {
      const lowerWord = word.toLowerCase();
      const escapedWord = lowerWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(escapedWord, 'i').test(fullContent);
    });
    if (hasProfanity) {
      return { allowed: false, reason: 'Contenido explícito detectado' };
    }
    if (/\[explicit\]|\(explicit\)|explicit version|autoclean/i.test(fullContent)) {
      return { allowed: false, reason: 'No se permite contenido explícito' };
    }
  }

  // ── 2. Custom Forbidden Keywords ──
  if (settings.forbiddenKeywords.some(word => fullContent.includes(word.toLowerCase()))) {
    return { allowed: false, reason: 'Contenido no permitido por palabras prohibidas' };
  }

  // ── 3. Genre Detection & Filtering ──
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim();
  };

  const detectGenres = (): string[] => {
    const detected: string[] = [];
    const normalizedTitle = normalizeText(title);
    const normalizedArtist = normalizeText(artist);
    const normalizedFull = normalizeText(fullContent);

    for (const [genreId, data] of Object.entries(GENRE_DATA)) {
      const keywordMatch = data.keywords.some(kw => normalizedFull.includes(normalizeText(kw)));

      const artistMatch = data.artists.some(a => {
        const normalizedA = normalizeText(a);
        return normalizedArtist.includes(normalizedA) || normalizedTitle.includes(normalizedA);
      });

      if (keywordMatch || artistMatch) {
        detected.push(genreId);
      }
    }
    return detected;
  };

  const detectedGenres = detectGenres();

  // Whitelist: only allow if song matches at least one allowed genre
  if (settings.allowedGenres && settings.allowedGenres.length > 0) {
    const hasAllowed = detectedGenres.some(g => settings.allowedGenres.includes(g));
    if (!hasAllowed) {
      return { allowed: false, reason: 'El género de esta canción no está en la lista permitida' };
    }
  }

  // Blacklist: block if song matches any disallowed genre
  if (settings.disallowedGenres && settings.disallowedGenres.length > 0) {
    const hasDisallowed = detectedGenres.some(g => settings.disallowedGenres.includes(g));
    if (hasDisallowed) {
      return { allowed: false, reason: 'Este género está bloqueado en esta sala' };
    }
  }

  // ── 4. Duration Check ──
  if (settings.maxSongDuration > 0 && typeof song.duration === 'string') {
    let totalSeconds = 0;
    if (song.duration.includes(':')) {
      const parts = song.duration.split(':').map(Number);
      if (parts.length === 3) {
        totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else {
        totalSeconds = (parts[0] || 0) * 60 + (parts[1] || 0);
      }
    } else if (song.duration.startsWith('PT')) {
      const matches = song.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (matches) {
        totalSeconds = (parseInt(matches[1] || '0') * 3600) + (parseInt(matches[2] || '0') * 60) + parseInt(matches[3] || '0');
      }
    }
    if (totalSeconds > settings.maxSongDuration) {
      return { allowed: false, reason: `Demasiado larga (máx ${Math.floor(settings.maxSongDuration / 60)}m)` };
    }
  }

  return { allowed: true };
}
