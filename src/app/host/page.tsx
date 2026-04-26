"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Music, SkipForward, Trash2, GripVertical, QrCode, X, BarChart3, Volume2, Play, Pause, FastForward, Search, Plus, Loader2, Library } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import YouTube from 'react-youtube';
import debounce from 'lodash/debounce';

const MusicVisualizer = ({ isPlaying }: { isPlaying: boolean }) => (
  <div className="flex items-end gap-1 h-8">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className={`w-1 bg-primary rounded-full ${isPlaying ? '' : 'h-[20%]'}`}
        animate={isPlaying ? {
          height: ["20%", "100%", "40%", "80%", "20%"]
        } : {}}
        transition={{
          duration: 0.8 + Math.random() * 0.5,
          repeat: Infinity,
          delay: i * 0.1
        }}
      />
    ))}
  </div>
);

interface SongRequest {
  id: string;
  title: string;
  artist: string;
  requestedBy: string;
  youtubeUrl?: string;
  thumbnail?: string;
}

export default function HostDashboard() {
  const [playlist, setPlaylist] = useState<SongRequest[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [joinUrl, setJoinUrl] = useState("");
  const [hasMounted, setHasMounted] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<any>(null);
  const [isFading, setIsFading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showPlaylistImport, setShowPlaylistImport] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const wakeLockRef = useRef<any>(null);

  // Wake Lock Logic
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log('Wake Lock active');
      }
    } catch (err) {
      console.error('Wake Lock failed:', err);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      requestWakeLock();
    } else {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    setHasMounted(true);
    setJoinUrl(`${window.location.host}/guest`);
    fetchPlaylist();
    const interval = setInterval(fetchPlaylist, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleImportPlaylist = async () => {
    if (!playlistUrl) return;
    setIsImporting(true);
    try {
      const res = await fetch('/api/requests/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: playlistUrl }),
      });
      if (!res.ok) throw new Error('Falló la importación');
      setPlaylistUrl('');
      setShowPlaylistImport(false);
      fetchPlaylist();
    } catch (e) {
      console.error("Import error:", e);
      alert("No se pudo importar la lista. Verifica el link.");
    } finally {
      setIsImporting(false);
    }
  };

  const searchSongs = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data || []);
    } catch (e) {
      console.error("Search error:", e);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useRef(
    debounce((query: string) => searchSongs(query), 500)
  ).current;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleAddSong = async (song: any) => {
    try {
      await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: song.title,
          artist: song.artist,
          requestedBy: 'HOST'
        }),
      });
      setSearchQuery('');
      setSearchResults([]);
      fetchPlaylist();
    } catch (e) {
      console.error("Add error:", e);
    }
  };

  // Update Media Session for background control
  useEffect(() => {
    if (playlist.length > 0 && 'mediaSession' in navigator) {
      const current = playlist[0];
      navigator.mediaSession.metadata = new MediaMetadata({
        title: current.title,
        artist: current.artist,
        artwork: [
          { src: current.thumbnail || '', sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => togglePlay());
      navigator.mediaSession.setActionHandler('nexttrack', () => handleSkip());
    }
  }, [playlist[0]?.id]);

  // Track progress
  useEffect(() => {
    let timer: any;
    if (isPlaying && playerRef.current) {
      timer = setInterval(() => {
        const currentTime = playerRef.current.getCurrentTime();
        const totalTime = playerRef.current.getDuration();
        setProgress(currentTime);
        setDuration(totalTime);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isFading]);

  const fetchPlaylist = async () => {
    const res = await fetch('/api/requests');
    const data = await res.json();
    setPlaylist(data);
  };

  const handleSkip = async () => {
    await fetch('/api/requests/skip', { method: 'POST' });
    fetchPlaylist();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/requests/${id}`, { method: 'DELETE' });
    fetchPlaylist();
  };

  const onReorder = async (newOrder: SongRequest[]) => {
    setPlaylist(newOrder);
    await fetch('/api/requests/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newOrder: newOrder.map(s => s.id) }),
    });
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
      setProgress(time);
    }
  };

  const currentVideoId = useMemo(() => {
    if (!playlist.length || !playlist[0].youtubeUrl) return null;
    const url = playlist[0].youtubeUrl;
    const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }, [playlist]);

  const youtubeOpts = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
    },
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!hasMounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className={`absolute top-0 left-0 w-full h-full bg-primary/5 transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-0'}`} />

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-4xl font-black neon-text text-primary">DJ Dashboard</h1>
            <p className="text-white/40">Magic Auto-Mix Enabled ✨</p>
          </div>

          <div className="flex-1 max-w-md relative group">
            <div className="relative glass rounded-2xl border-white/10 overflow-hidden focus-within:border-primary/50 transition-all">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Añadir canción rápidamente..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full bg-white/5 py-4 pl-12 pr-12 focus:outline-none placeholder:text-white/20 font-medium"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                   <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              )}
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 w-full mt-2 bg-[#121212]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar"
                >
                  {searchResults.map((song, i) => (
                    <button
                      key={i}
                      onClick={() => handleAddSong(song)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-none"
                    >
                      <img src={song.thumbnail} alt="thumb" className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{song.title}</p>
                        <p className="text-xs text-white/40 truncate">{song.artist}</p>
                      </div>
                      <Plus className="w-4 h-4 text-primary" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPlaylistImport(true)}
              className="flex items-center gap-2 glass px-6 py-3 rounded-2xl border-white/10 text-white font-bold shrink-0"
            >
              <Library className="w-5 h-5 text-accent" />
              Importar Lista
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowQR(true)}
              className="flex items-center gap-2 glass px-6 py-3 rounded-2xl border-primary/20 text-primary font-bold shrink-0"
            >
              <QrCode className="w-5 h-5" />
              Invitación
            </motion.button>
          </div>
        </header>

        {/* Playlist Import Modal */}
        <AnimatePresence>
          {showPlaylistImport && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="glass p-8 rounded-[3rem] border-white/10 max-w-lg w-full relative"
              >
                <button
                  onClick={() => setShowPlaylistImport(false)}
                  className="absolute top-6 right-6 p-4 glass rounded-full text-white/40 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="mb-8">
                  <div className="bg-accent/20 w-16 h-16 rounded-3xl flex items-center justify-center mb-6">
                    <Library className="w-8 h-8 text-accent" />
                  </div>
                  <h2 className="text-3xl font-black mb-2">Importar Playlist</h2>
                  <p className="text-white/40 font-medium">Pega el link de YouTube, Spotify o Apple Music. Las canciones se añadirán al final de la cola.</p>
                </div>

                <div className="space-y-6">
                  <div className="glass rounded-2xl border-white/10 overflow-hidden">
                    <input
                      type="text"
                      placeholder="https://open.spotify.com/playlist/..."
                      value={playlistUrl}
                      onChange={(e) => setPlaylistUrl(e.target.value)}
                      className="w-full bg-white/5 py-5 px-6 focus:outline-none placeholder:text-white/10"
                    />
                  </div>

                  <button
                    onClick={handleImportPlaylist}
                    disabled={isImporting || !playlistUrl}
                    className="w-full py-5 bg-accent rounded-[2rem] font-black text-lg shadow-xl shadow-accent/20 hover:brightness-110 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        IMPORTANDO CANCIONES...
                      </>
                    ) : (
                      <>
                        <Plus className="w-6 h-6" />
                        AÑADIR A LA COLA
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="mb-12">
          <div className="glass p-8 rounded-[2.5rem] border-primary/20 relative overflow-hidden shadow-2xl">
             {/* Player Thumbnail Background */}
             <div className="absolute inset-0 opacity-10 blur-3xl pointer-events-none">
              {playlist.length > 0 && playlist[0].thumbnail && (
                <img src={playlist[0].thumbnail} alt="bg" className="w-full h-full object-cover" />
              )}
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8 text-white/40 uppercase tracking-widest text-xs font-black">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-primary ${isPlaying ? 'animate-ping' : ''}`} />
                  <h2>Reproduciendo ahora</h2>
                </div>
                <div className="flex items-center gap-4">
                  <MusicVisualizer isPlaying={isPlaying} />
                </div>
              </div>

              {playlist.length > 0 ? (
                <div className="space-y-8">
                  <div className="flex items-center gap-8">
                    <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-2xl border border-white/10 shrink-0">
                      {playlist[0].thumbnail ? (
                        <img src={playlist[0].thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                          <Music className="w-12 h-12 text-primary opacity-20 animate-pulse" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-4xl font-black mb-2 truncate leading-tight">{playlist[0].title}</h3>
                      <p className="text-2xl text-primary font-medium truncate mb-4 opacity-80">{playlist[0].artist}</p>
                      <div className="flex items-center gap-2 text-sm text-white/30 italic">
                        <BarChart3 className="w-4 h-4" />
                        Pedido por: <span className="text-white/60 font-bold not-italic">{playlist[0].requestedBy}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar & Controls */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 group">
                      <span className="text-xs font-mono text-white/40 w-10">{formatTime(progress)}</span>
                      <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={progress}
                        onChange={handleSeek}
                        className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary hover:bg-white/20 transition-all"
                      />
                      <span className="text-xs font-mono text-white/40 w-10">{formatTime(duration)}</span>
                    </div>

                    <div className="flex items-center justify-center gap-6">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={togglePlay}
                        className="p-6 bg-white text-black rounded-full shadow-xl hover:bg-primary hover:text-white transition-colors"
                      >
                        {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1, x: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleSkip}
                        className="p-4 bg-white/5 rounded-full border border-white/10 text-white hover:bg-white/10 transition-colors"
                      >
                        <FastForward className="w-6 h-6 fill-white" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                  <Music className="w-20 h-20 mb-6 animate-bounce" />
                  <p className="text-3xl font-black italic tracking-tighter">No hay temas en la cola...</p>
                </div>
              )}
            </div>

            {/* Hidden Player */}
            <div className="fixed left-[-1000px] top-0 opacity-0 pointer-events-none">
              {isStarted && currentVideoId && (
                <YouTube
                  videoId={currentVideoId}
                  opts={youtubeOpts}
                  onReady={(e) => {
                    playerRef.current = e.target;
                    playerRef.current.setVolume(100);
                  }}
                  onEnd={handleSkip}
                  onStateChange={(e) => {
                    setIsPlaying(e.data === 1);
                    if (e.data === 1) {
                       setDuration(e.target.getDuration());
                       // Reset volume if it was faded
                       e.target.setVolume(100);
                    }
                  }}
                  onError={(e) => {
                    console.error("YT Error:", e);
                    handleSkip();
                  }}
                />
              )}
            </div>
          </div>
        </section>

        {!isStarted && playlist.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-x-6 bottom-12 z-40 lg:inset-x-auto lg:right-12 lg:w-96"
          >
            <div className="glass p-6 rounded-3xl border-primary/50 bg-primary/10 backdrop-blur-2xl shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse" />
              <h3 className="text-xl font-bold mb-2">¡La fiesta está lista!</h3>
              <p className="text-white/60 text-sm mb-4">Haz clic para activar el reproductor y empezar a escuchar los temas.</p>
              <button
                onClick={() => setIsStarted(true)}
                className="w-full bg-primary text-white font-bold py-3 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
              >
                EMPEZAR FIESTA 🚀
              </button>
            </div>
          </motion.div>
        )}

        <section>
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-2xl font-black">Próximas canciones</h2>
            <div className="flex items-center gap-3">
               <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-black border border-primary/20">
                {Math.max(0, playlist.length - 1)} EN COLA
              </span>
            </div>
          </div>

          <Reorder.Group axis="y" values={playlist.slice(1)} onReorder={(vals) => onReorder([playlist[0], ...vals])} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {playlist.slice(1).map((song) => (
                <Reorder.Item
                  key={song.id}
                  value={song}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  layout
                  className="glass p-4 rounded-3xl flex items-center gap-4 hover:border-white/20 transition-all group"
                >
                  <div className="cursor-grab active:cursor-grabbing text-white/10 group-hover:text-white/30 transition-colors">
                    <GripVertical className="w-6 h-6" />
                  </div>
                  {song.thumbnail && (
                    <img src={song.thumbnail} alt="thumb" className="w-16 h-16 rounded-2xl object-cover shadow-lg" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{song.title}</h4>
                    <p className="text-white/40 text-sm truncate">{song.artist}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(song.id)}
                    className="p-3 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all lg:opacity-0 lg:group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </section>
      </div>

      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setShowQR(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass p-10 rounded-[3rem] max-w-sm w-full text-center relative border-primary/30"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowQR(false)}
                className="absolute top-8 right-8 text-white/40 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-3xl font-black mb-8 leading-tight">Invita a la<br/>Cabina</h2>
              <div className="bg-white p-6 rounded-[2.5rem] mb-8 inline-block shadow-[0_0_50px_rgba(139,92,246,0.3)]">
                <QRCodeSVG value={joinUrl} size={220} />
              </div>
              <p className="text-white/60 mb-4 font-medium px-4 text-sm">Escanea para pedir tu tema favorito</p>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                 <p className="text-primary font-mono text-xs break-all">{joinUrl}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #8b5cf6;
          border-radius: 50%;
          cursor: pointer;
          border: 3px solid #fff;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
}
