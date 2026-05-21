import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerStatsTable } from "@/components/sga/PlayerStatsTable";

export const Route = createFileRoute("/players")({
  head: () => ({ meta: [{ title: "Top 40 Jogadores — SGA" }, { name: "description", content: "Ranking individual: KDA, kills, defuse, plant e rating dos top 40 jogadores." }] }),
  component: P,
});

function P() {
  return (
    <div className="relative min-h-screen bg-[#06070a] overflow-hidden">
      {/* Background Layers */}
      <div className="absolute inset-0 grid-bg opacity-[0.05] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,163,255,0.06),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Massive Background Text */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 font-display text-[15rem] md:text-[25rem] font-black italic text-white/[0.01] select-none pointer-events-none tracking-tighter uppercase z-0">
        Stats
      </div>

      <div className="relative z-10 mx-auto max-w-[1500px] px-4 py-16 md:py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 border-l-4 border-primary pl-6 md:pl-10 relative"
        >
          <div className="absolute -left-1 top-0 h-full w-full bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
          
         
          
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl uppercase leading-[0.95] font-black italic tracking-tight text-white">
            Top 40 <span className="text-primary">Jogadores</span> <br />
            da <span className="text-white/30">Arena</span>.
          </h1>
          <p className="text-muted-foreground mt-4 text-base md:text-lg max-w-xl leading-relaxed font-medium">
            O ranking definitivo baseado em estatísticas avançadas de KDA, ADR e Rating. Dados verificados de todas as competições oficiais.
          </p>

          <Link 
            to="/login" 
            className="mt-8 inline-flex items-center justify-center rounded-md bg-neon px-8 py-3 font-display text-lg font-bold uppercase italic text-primary-foreground shadow-neon transition-all hover:scale-105 active:scale-95"
          >
            Participar Agora
          </Link>
        </motion.div>

        <div className="relative group">
          <div className="absolute -top-4 -left-4 w-8 h-8 border-t border-l border-white/10 group-hover:border-primary/40 transition-colors" />
          <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b border-r border-white/10 group-hover:border-primary/40 transition-colors" />

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="rounded-none border border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md shadow-2xl p-1 overflow-hidden mt-8"
          >
            <PlayerStatsTable limit={40} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
