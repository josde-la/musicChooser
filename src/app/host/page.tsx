"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Music, SkipForward, Trash2, GripVertical, QrCode, X, BarChart3, Volume2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import YouTube from 'react-youtube';

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

  useEffect(() => {
    setHasMounted(true);
    setJoinUrl(`${window.location.origin}/guest`);
    fetchPlaylist();
    const interval = setInterval(fetchPlaylist, 3000);
    return () => clearInterval(interval);
  }, []);

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
  };

  const currentVideoId = useMemo(() => {
    if (!playlist.length || !playlist[0].youtubeUrl) return null;
    const url = playlist[0].youtubeUrl;
    const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }, [playlist]);

  const youtubeOpts = {
    height: '180',
    width: '320',
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
    },
  };

  if (!hasMounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black neon-text text-primary">DJ Dashboard</h1>
            <p className="text-white/40">Gestionando la cola de reproducción</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowQR(true)}
            className="flex items-center gap-2 glass px-6 py-3 rounded-2xl border-primary/20 text-primary font-bold"
          >
            <QrCode className="w-5 h-5" />
            Invitación
          </motion.button>
        </header>

        <section className="mb-12">
          <div className="glass p-8 rounded-[2rem] neon-border-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              {playlist.length > 0 && playlist[0].thumbnail ? (
                <img src={playlist[0].thumbnail} alt="Thumbnail" className="w-24 h-24 object-cover rounded-xl opacity-40" />
              ) : (
                <Music className="w-12 h-12 text-primary opacity-20 animate-pulse" />
              )}
            </div>

            <div className="flex items-center justify-between mb-4 text-white/40 uppercase tracking-widest text-sm font-bold">
              <h2>Reproduciendo ahora</h2>
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-primary" />
                <MusicVisualizer isPlaying={isPlaying} />
              </div>
            </div>

            {playlist.length > 0 ? (
              <div className="flex items-center justify-between gap-8">
                <div className="flex-1 min-w-0">
                  <h3 className="text-3xl font-bold mb-1 truncate">{playlist[0].title}</h3>
                  <p className="text-xl text-primary/80 truncate">{playlist[0].artist}</p>
                  <p className="text-xs text-white/30 mt-2 italic">Pedido por: {playlist[0].requestedBy}</p>
                </div>

                <div className="fixed left-[-1000px] top-0 opacity-0 pointer-events-none">
                  {isStarted && currentVideoId && (
                    <YouTube
                      videoId={currentVideoId}
                      opts={youtubeOpts}
                      onEnd={handleSkip}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onError={(e) => console.error("YT Error:", e)}
                    />
                  )}
                </div>

                <div className="flex flex-col items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      if (!isStarted) {
                        setIsStarted(true);
                      } else {
                        handleSkip();
                      }
                    }}
                    className="p-5 bg-primary/20 rounded-full border border-primary/40 text-primary hover:bg-primary/30 transition-colors shrink-0"
                  >
                    <SkipForward className="w-8 h-8 fill-primary" />
                  </motion.button>
                  <p className="text-[10px] text-primary/40 font-bold uppercase tracking-widest">Siguiente</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 opacity-20">
                <Music className="w-16 h-16 mb-4 animate-bounce" />
                <p className="text-2xl italic">No hay nada en la cola...</p>
              </div>
            )}
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Próximas canciones</h2>
            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-mono text-white/50">
              {Math.max(0, playlist.length - 1)} EN COLA
            </span>
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
                  className="glass p-3 rounded-2xl flex items-center gap-4 hover:border-white/20 transition-all group"
                >
                  <div className="cursor-grab active:cursor-grabbing text-white/20 hover:text-white/40">
                    <GripVertical className="w-6 h-6" />
                  </div>
                  {song.thumbnail && (
                    <img src={song.thumbnail} alt="thumb" className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-base truncate">{song.title}</h4>
                    <p className="text-white/50 text-xs truncate">{song.artist}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(song.id)}
                    className="p-2 text-white/20 hover:text-accent transition-colors lg:opacity-0 lg:group-hover:opacity-100"
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
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowQR(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass p-8 rounded-[3rem] max-w-sm w-full text-center relative border-primary/30"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowQR(false)}
                className="absolute top-6 right-6 text-white/40 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold mb-6">Comparte la Cola</h2>
              <div className="bg-white p-4 rounded-3xl mb-6 inline-block">
                <QRCodeSVG value={joinUrl} size={200} />
              </div>
              <p className="text-white/60 mb-2">Escanea el código QR para unirte a la fiesta</p>
              <p className="text-primary font-mono text-xs break-all">{joinUrl}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
