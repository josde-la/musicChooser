"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Search, Send, CheckCircle2, AlertCircle, Loader2, ListMusic, Mic2, X, Plus } from 'lucide-react';
import debounce from 'lodash/debounce';
import { fetchLyrics } from '@/lib/lyrics';

interface SongPreview {
  title: string;
  artist: string;
  youtubeUrl: string;
  thumbnail: string;
  duration: string;
}

interface PlaylistSong {
  id: string;
  title: string;
  artist: string;
  requestedBy: string;
}

export default function GuestPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [requestedBy, setRequestedBy] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [preview, setPreview] = useState<SongPreview | null>(null);
  const [searchResults, setSearchResults] = useState<SongPreview[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [playlist, setPlaylist] = useState<PlaylistSong[]>([]);
  const [showQueue, setShowQueue] = useState(false);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  // Fetch current playlist
  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!slug) return;
      try {
        const res = await fetch(`/api/${slug}/requests`);
        const data = await res.json();
        setPlaylist(data);
      } catch (e) {
        console.error("Playlist fetch error:", e);
      }
    };
    fetchPlaylist();
    const interval = setInterval(fetchPlaylist, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch lyrics for current song with redundancy
  useEffect(() => {
    const getLyrics = async () => {
      if (playlist.length > 0 && showLyrics) {
        setIsLoadingLyrics(true);
        const result = await fetchLyrics(playlist[0].title, playlist[0].artist);
        if (result && result.lyrics) {
          setLyrics(result.lyrics);
        } else {
          setLyrics("No se encontraron letras para este tema 🎵");
        }
        setIsLoadingLyrics(false);
      }
    };
    getLyrics();
  }, [playlist[0]?.id, showLyrics]);

  const searchSong = async (query: string) => {
    if (!query) {
      setPreview(null);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/${slug}/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setSearchResults(data);
        setPreview(data[0]);
        // Update artist field if it's empty
        if (!artist) setArtist(data[0].artist);
      } else {
        setSearchResults([]);
        setPreview(null);
      }
    } catch (e) {
      console.error("Search error:", e);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((nextValue) => searchSong(nextValue), 600),
    [artist]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    debouncedSearch(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch(`/api/${slug}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, artist, requestedBy }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit request');
      }

      setStatus('success');
      setTitle('');
      setArtist('');
      setPreview(null);
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      console.error('Error submitting song:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Error al conectar con el servidor. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white p-4 font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px]" />

      <div className="max-w-md mx-auto relative z-10 pt-8 pb-32">
        <header className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block p-4 rounded-3xl glass mb-4"
          >
            <Music className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">
             Party<span className="text-primary italic">Mixer</span>
          </h1>
          <p className="text-white/40 font-medium text-sm">Toma el control de la fiesta</p>
        </header>

        {playlist.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass p-5 rounded-[2rem] border-primary/20 mb-8 flex items-center gap-4 relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="bg-primary/20 p-3 rounded-2xl relative z-10">
              <Music className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <div className="flex-1 min-w-0 relative z-10">
              <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">Ahora mismo</p>
              <h3 className="font-bold truncate text-sm">{playlist[0].title}</h3>
              <p className="text-xs text-white/40 truncate">{playlist[0].artist}</p>
            </div>
            <button
               onClick={() => setShowLyrics(true)}
               className="p-3 glass rounded-2xl text-primary bg-primary/10 hover:bg-primary/20 transition-all active:scale-95 z-10"
            >
              <Mic2 className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        <div className="glass p-8 rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.5)] border-white/5 relative bg-white/[0.02]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <div className="relative group">
                <Music className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="¿Qué quieres escuchar?"
                  value={title}
                  onChange={handleTitleChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-white/20 font-bold"
                />
              </div>

              {/* Pretty Glass Dropdown */}
              <AnimatePresence>
                {(isSearching || searchResults.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 w-full mt-2 bg-[#121212]/95 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                  >
                    {isSearching ? (
                      <div className="p-8 flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-xs font-black text-white/20 uppercase tracking-widest">Buscando ritmo...</p>
                      </div>
                    ) : (
                      <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                        {searchResults.map((song, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setTitle(song.title);
                              setArtist(song.artist);
                              setPreview(song);
                              setSearchResults([]);
                            }}
                            className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-all text-left border-b border-white/5 last:border-none group/item"
                          >
                            <div className="relative shrink-0">
                               <img src={song.thumbnail} alt="thumb" className="w-12 h-12 rounded-xl object-cover shadow-lg border border-white/5" />
                               <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/item:opacity-100 transition-opacity rounded-xl" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm truncate group-hover/item:text-primary transition-colors">{song.title}</h4>
                              <p className="text-white/40 text-[11px] truncate uppercase font-bold tracking-tight">{song.artist}</p>
                            </div>
                            <div className="p-2 opacity-0 group-hover/item:opacity-100 transition-opacity bg-primary/20 rounded-xl">
                               <Plus className="w-4 h-4 text-primary" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              disabled={status === 'loading' || !title}
              className={`w-full py-5 rounded-[2rem] font-black text-lg shadow-xl transition-all active:scale-95 disabled:opacity-30 ${
                status === 'success'
                ? 'bg-green-500 shadow-green-500/20'
                : 'bg-primary shadow-primary/20 hover:brightness-110'
              }`}
            >
              {status === 'loading' ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              ) : status === 'success' ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle2 className="w-6 h-6" />
                  ¡ENVIADO!
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 tracking-tighter">
                  <Send className="w-6 h-6" />
                  AÑADIR A LA COLA
                </div>
              )}
            </button>
          </form>

          <AnimatePresence>
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-bold leading-relaxed">{errorMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xs px-4">
           <div className="glass p-2 rounded-full flex gap-2 border border-white/10 shadow-2xl">
              <button
                onClick={() => setShowQueue(!showQueue)}
                className={`flex-1 py-4 rounded-full flex items-center justify-center gap-2 text-sm font-black transition-all ${
                  showQueue ? 'bg-primary text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <ListMusic className="w-5 h-5" />
                COLA ({playlist.length})
              </button>
           </div>
        </div>

        <AnimatePresence>
          {showQueue && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl p-6"
            >
               <div className="max-w-md mx-auto h-full flex flex-col pt-12">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h2 className="text-4xl font-black">Próximos</h2>
                      <p className="text-primary font-bold">{playlist.length - 1} temas esperando</p>
                    </div>
                    <button onClick={() => setShowQueue(false)} className="p-4 glass rounded-full text-white/60 hover:text-white transition-colors">
                      <X className="w-7 h-7" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {playlist.length > 1 ? playlist.slice(1).map((song, i) => (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={song.id}
                        className="glass p-5 rounded-3xl flex items-center gap-5 border-white/5"
                      >
                        <div className="text-primary font-black text-2xl w-8 text-center italic">{i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-base truncate">{song.title}</h4>
                          <p className="text-white/40 text-[11px] font-bold uppercase tracking-wider truncate">{song.artist} • Por {song.requestedBy}</p>
                        </div>
                      </motion.div>
                    )) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-12 pt-10">
                        <Music className="w-24 h-24 mb-6 animate-pulse" />
                        <p className="text-2xl italic font-black">¡La pista está vacía! Pide algo ahora mismo.</p>
                      </div>
                    )}
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showLyrics && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-0 z-[60] bg-[#050505] flex flex-col"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent animate-shimmer" />
              <div className="p-10 flex items-center justify-between">
                <div className="min-w-0">
                   <p className="text-primary font-black uppercase tracking-widest text-xs mb-1">Letra de la canción</p>
                   <h2 className="text-3xl font-black truncate text-white leading-tight">{playlist[0]?.title}</h2>
                   <p className="text-white/40 font-bold">{playlist[0]?.artist}</p>
                </div>
                <button onClick={() => setShowLyrics(false)} className="p-5 glass rounded-full text-white/50 hover:text-white transition-all active:scale-90">
                  <X className="w-8 h-8" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-10 pb-20 text-center custom-scrollbar">
                {isLoadingLyrics ? (
                  <div className="h-full flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                      <Loader2 className="w-16 h-16 animate-spin text-primary opacity-50" />
                      <Music className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
                    </div>
                    <p className="font-black text-xl text-white/20 uppercase tracking-tighter">Sintonizando el ritmo...</p>
                  </div>
                ) : (
                  <div className="text-3xl font-black text-white leading-[1.6] whitespace-pre-wrap max-w-xl mx-auto selection:bg-primary selection:text-white italic tracking-tight">
                    {lyrics}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.1); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.2); }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-shimmer { animation: shimmer 2s infinite linear; }
      `}</style>
    </div>
  );
}
