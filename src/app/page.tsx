"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Music, Play, UserPlus } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#050505]">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-pulse-slow"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center px-4"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 glass neon-glow">
            <Music className="w-12 h-12 text-primary" />
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-x">
          PartyQueue
        </h1>
        <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-lg mx-auto font-light">
          La música de tu fiesta, elegida por todos en tiempo real.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
          <Link href="/host" className="group">
            <motion.div
              whileHover={{ scale: 1.05, translateY: -5 }}
              whileTap={{ scale: 0.95 }}
              className="glass p-8 rounded-3xl border-white/10 hover:border-primary/50 transition-all duration-300 h-full flex flex-col items-center justify-center text-center gap-4 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <Play className="w-8 h-8 text-primary fill-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Soy el Host</h2>
                <p className="text-white/50 text-sm">Gestiona la lista, salta canciones y pon el ritmo.</p>
              </div>
            </motion.div>
          </Link>

          <Link href="/guest" className="group">
            <motion.div
              whileHover={{ scale: 1.05, translateY: -5 }}
              whileTap={{ scale: 0.95 }}
              className="glass p-8 rounded-3xl border-white/10 hover:border-accent/50 transition-all duration-300 h-full flex flex-col items-center justify-center text-center gap-4 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                <UserPlus className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Unirme</h2>
                <p className="text-white/50 text-sm">Busca tus canciones favoritas y añádelas a la cola.</p>
              </div>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Floating particles or something */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/10 rounded-full"
          initial={{
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%",
            opacity: Math.random() * 0.5
          }}
          animate={{
            y: [null, "-100%"],
            opacity: [0, 0.5, 0]
          }}
          transition={{
            duration: Math.random() * 10 + 5,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5
          }}
        />
      ))}
    </main>
  );
}
