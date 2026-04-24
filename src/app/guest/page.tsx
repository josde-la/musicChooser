"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Music, User, CheckCircle2, PlayCircle, Sparkles } from 'lucide-react';

interface SongRequest {
  id: string;
  title: string;
  artist: string;
  requestedBy: string;
  thumbnail?: string;
}

interface YouTubeResult {
  title: string;
  artist: string;
  youtubeUrl: string;
  thumbnail: string;
  duration: string;
}

export default function GuestPage() {
  const [playlist, setPlaylist] = useState<SongRequest[]>([]);
  const [songName, setSongName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<YouTubeResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchPlaylist();
    const interval = setInterval(fetchPlaylist, 5000);
    return () => clearInterval(interval);
  }, []);

  // Debounced search for preview
  useEffect(() => {
    const timer = setTimeout(() => {
      if (songName.trim().length > 2) {
        handleSearch();
      } else {
        setPreview(null);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [songName, artistName]);

  const fetchPlaylist = async () => {
    const res = await fetch('/api/requests');
    if (res.ok) {
      const data = await res.json();
      setPlaylist(data);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const query = artistName ? `${songName} ${artistName}` : songName;
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const results = await res.json();
        if (results.length > 0) {
          setPreview(results[0]);
        } else {
          setPreview(null);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRequest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!songName) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: songName,
          artist: artistName || '', // Artist is now optional
          requestedBy: guestName || 'Anónimo',
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSongName("");
        setArtistName("");
        setPreview(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        fetchPlaylist();
      } else {
        setError(data.error || 'Error al añadir la canción');
      }
    } catch (error) {
      console.error('Request error:', error);
      setError('Error de conexión con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />

      <div className="max-w-md mx-auto relative z-10 pt-10 pb-20">
        <header className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 bg-gradient-to-br from-accent/30 to-primary/30 rounded-3xl border border-white/10 glass inline-block mb-6 shadow-2xl"
          >
            <Music className="w-10 h-10 text-white animate-float" />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">
            Party DJ
          </h1>
          <p className="text-white/40 text-sm font-medium">Pide tu canción y que siga el mambo</p>
        </header>

        <section className="mb-12">
          <form onSubmit={handleRequest} className="space-y-4">
            <div className="glass p-6 rounded-[2.5rem] border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

              <div className="space-y-5">
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-accent transition-colors">
                    <Search className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Busca una canción..."
                    value={songName}
                    onChange={(e) => setSongName(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all placeholder:text-white/20 text-lg font-medium"
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Artista (opcional)"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                  />
                </div>

                <AnimatePresence>
                  {preview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10">
                          <img src={preview.thumbnail} alt="preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Sparkles className="w-3 h-3 text-accent" />
                            <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Top Match</span>
                          </div>
                          <h4 className="text-sm font-bold truncate leading-tight">{preview.title}</h4>
                          <p className="text-white/40 text-xs truncate">{preview.artist}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-400 text-xs font-bold px-2 py-1 bg-red-400/10 rounded-lg border border-red-400/20"
                    >
                      ⚠️ {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="h-px bg-white/5 my-2" />

                <div className="relative flex items-center px-2">
                  <input
                    type="text"
                    placeholder="Tu nombre para saludarte"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-transparent border-none text-sm text-white/40 focus:outline-none placeholder:text-white/10 font-medium"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(236, 72, 153, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || !songName}
                className="w-full mt-8 bg-gradient-to-r from-accent to-primary text-white font-black py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5 stroke-[3px]" /> PEDIR CANCIÓN
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xl font-black flex items-center gap-2">
              Próximamente
            </h2>
            <div className="h-1 flex-1 mx-4 bg-white/5 rounded-full" />
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{playlist.length} TEMAS</span>
          </div>

          <div className="space-y-3">
            {playlist.length > 0 ? (
              playlist.slice(0, 5).map((song, i) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`glass p-4 rounded-2xl flex items-center gap-4 ${i === 0 ? 'border-accent/40 bg-accent/5' : 'border-white/5'}`}
                >
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden bg-white/5 relative shrink-0 border border-white/10">
                    {song.thumbnail ? (
                      <img src={song.thumbnail} alt="thumb" className="w-full h-full object-cover" />
                    ) : (
                      i === 0 ? <PlayCircle className="w-6 h-6 text-accent" /> : <span className="text-lg font-black text-white/10">{i + 1}</span>
                    )}
                    {i === 0 && <div className="absolute inset-0 bg-accent/10 animate-pulse" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold truncate ${i === 0 ? 'text-accent text-lg' : 'text-base'}`}>{song.title}</h4>
                    <p className="text-white/40 text-xs truncate flex items-center gap-1.5">
                      <User className="w-3 h-3" /> {song.artist}
                    </p>
                  </div>
                  {i === 0 && (
                    <div className="ml-auto shrink-0">
                      <span className="text-[8px] bg-accent/20 text-accent px-2 py-1 rounded-md font-black tracking-tighter animate-pulse border border-accent/20">SONANDO</span>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="glass rounded-[2rem] border-dashed border-white/10 p-12 text-center">
                <Music className="w-10 h-10 text-white/10 mx-auto mb-4" />
                <p className="text-white/20 font-medium italic">Nadie ha pedido nada aún... <br/>¡Sé el primero!</p>
              </div>
            )}
            {playlist.length > 5 && (
              <div className="text-center py-2">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">+ {playlist.length - 5} temas más en cola</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Success notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-10 left-6 right-6 z-50 glass bg-white/10 border-white/20 p-5 rounded-[2rem] flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
          >
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-black text-white leading-tight">¡Añadida a la cola!</p>
              <p className="text-white/40 text-xs">Aparecerá en unos segundos.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
