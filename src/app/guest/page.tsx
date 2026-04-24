"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Music, User, CheckCircle2 } from 'lucide-react';

interface SongRequest {
  id: string;
  title: string;
  artist: string;
  requestedBy: string;
  thumbnail?: string;
}

export default function GuestPage() {
  const [playlist, setPlaylist] = useState<SongRequest[]>([]);
  const [songName, setSongName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchPlaylist();
    const interval = setInterval(fetchPlaylist, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPlaylist = async () => {
    const res = await fetch('/api/requests');
    const data = await res.json();
    setPlaylist(data);
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songName || !artistName) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: songName,
          artist: artistName,
          requestedBy: guestName || 'Anónimo',
        }),
      });

      if (res.ok) {
        setSongName("");
        setArtistName("");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        fetchPlaylist();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden">
      {/* Decorative gradient for guest */}
      <div className="absolute top-0 right-0 w-[50%] h-[30%] bg-accent/10 rounded-full blur-[100px]" />

      <div className="max-w-md mx-auto relative z-10 pt-10 pb-20">
        <header className="text-center mb-12">
          <div className="p-3 bg-accent/20 rounded-2xl border border-accent/30 glass inline-block mb-4">
            <Music className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-black">Añade tu tema</h1>
          <p className="text-white/50 text-sm">¿Qué quieres escuchar hoy?</p>
        </header>

        <section className="mb-12">
          <form onSubmit={handleRequest} className="space-y-4">
            <div className="glass p-6 rounded-[2rem] border-accent/20">
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                    <Music className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Nombre de la canción..."
                    value={songName}
                    onChange={(e) => setSongName(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-accent/50 transition-colors placeholder:text-white/20"
                  />
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Artista..."
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-accent/50 transition-colors placeholder:text-white/20"
                  />
                </div>

                <div className="h-px bg-white/5 my-4" />

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tu nombre (opcional)"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-transparent border-none text-sm text-white/50 focus:outline-none placeholder:text-white/20"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 bg-accent hover:bg-accent/80 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5" /> Pedir canción
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            Lo que viene <div className="h-1 flex-1 bg-white/5 rounded-full" />
          </h2>

          <div className="space-y-3">
            {playlist.length > 0 ? (
              playlist.slice(0, 5).map((song, i) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`glass p-4 rounded-2xl flex items-center gap-4 ${i === 0 ? 'border-primary/40' : 'border-white/5'}`}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-white/5 relative shrink-0">
                    {song.thumbnail ? (
                      <img src={song.thumbnail} alt="thumb" className="w-full h-full object-cover" />
                    ) : (
                      i === 0 ? <Music className="w-5 h-5 text-primary" /> : <span className="text-sm font-bold text-white/20">{i + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold truncate ${i === 0 ? 'text-primary' : ''}`}>{song.title}</h4>
                    <p className="text-white/40 text-xs truncate">{song.artist}</p>
                  </div>
                  {i === 0 && (
                    <div className="ml-auto">
                      <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded-full font-black animate-pulse">SONANDO</span>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <p className="text-center text-white/20 py-10 italic">Aún no hay canciones...</p>
            )}
            {playlist.length > 5 && (
              <p className="text-center text-white/30 text-xs py-2">+ {playlist.length - 5} más en la cola</p>
            )}
          </div>
        </section>
      </div>

      {/* Success notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 glass bg-green-500/10 border-green-500/50 px-6 py-4 rounded-3xl flex items-center gap-3 shadow-2xl backdrop-blur-md"
          >
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <span className="font-bold text-green-500">¡Canción añadida!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
