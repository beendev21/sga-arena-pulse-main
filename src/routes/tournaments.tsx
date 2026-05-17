import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { RankingTable } from "@/components/sga/RankingTable";
import { normalizeGame, type GameLabel } from "@/lib/game";

export const Route = createFileRoute("/tournaments")({
  head: () => ({ meta: [{ title: "Ranking de Equipes — SGA" }, { name: "description", content: "Ranking oficial das melhores equipes da Santos Games Arena." }] }),
  component: RankingPage,
});

function RankingPage() {
  const [game, setGame] = useState<GameLabel>("COUNTER-STRIKE 2");

  return (
    <div className="relative min-h-screen bg-[#06070a] overflow-hidden">
      {/* Background Layers */}
      <div className="absolute inset-0 grid-bg opacity-[0.05] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(248,109,131,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Big Background Text */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 font-display text-[15rem] md:text-[25rem] font-black italic text-white/[0.01] select-none pointer-events-none tracking-tighter uppercase z-0">
        Leaderboard
      </div>

      <div className="relative z-10 mx-auto max-w-[1500px] px-4 py-16 md:py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 border-l-4 border-primary pl-6 md:pl-10 relative"
        >
          <div className="absolute -left-1 top-0 h-full w-full bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
          
          <div className="bg-primary text-primary-foreground text-[9px] font-black px-2 py-0.5 italic mb-4 inline-block tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
            RANK_MODULE_v2.0
          </div>
          
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl uppercase leading-[0.95] font-black italic tracking-tight text-white">
            O <span className="text-primary">Ranking</span> <br />
            <span className="text-white/30">oficial</span> da Arena.
          </h1>
          <p className="text-muted-foreground mt-4 text-base md:text-lg max-w-xl leading-relaxed font-medium">
            A hierarquia definitiva das melhores equipes da região. Estatísticas atualizadas em tempo real com base em desempenho competitivo oficial.
          </p>
        </motion.div>

        {/* Game Tabs Navigation */}
        <div className="flex gap-4 sm:gap-10 mb-10 border-b border-white/5 pb-4 overflow-x-auto scrollbar-none items-center">
          <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] hidden sm:block italic mr-2">
            Filtrar por título_
          </span>
          {[
            { id: normalizeGame("CS2") as GameLabel, label: "CS2", color: "text-cs2" },
            { id: normalizeGame("VALORANT") as GameLabel, label: "VALORANT", color: "text-valorant" },
            { id: normalizeGame("LEAGUE OF LEGENDS") as GameLabel, label: "LoL", color: "text-lol" },
          ].map((g) => (
            <button
              key={g.id}
              onClick={() => setGame(g.id)}
              className={`font-display text-lg sm:text-2xl italic font-bold uppercase transition-all relative py-2 whitespace-nowrap px-1 tracking-tight ${
                game === g.id ? `${g.color} opacity-100` : "text-muted-foreground opacity-30 hover:opacity-60"
              }`}
            >
              {g.label}
              {game === g.id && (
                <motion.div 
                  layoutId="rankingGameTab" 
                  className="absolute bottom-0 left-0 right-0 h-[3px] bg-current shadow-[0_0_10px_currentColor]" 
                />
              )}
            </button>
          ))}
        </div>

        {/* Table Container */}
        <div className="relative group">
          {/* HUD Accents */}
          <div className="absolute -top-4 -left-4 w-8 h-8 border-t border-l border-white/10 group-hover:border-primary/40 transition-colors" />
          <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b border-r border-white/10 group-hover:border-primary/40 transition-colors" />

          <AnimatePresence mode="wait">
            <motion.div 
              key={game}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="rounded-none border border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md shadow-2xl p-1 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 text-[8px] font-black text-white/5 uppercase tracking-[0.4em] pointer-events-none">
                System Check // Verified Data
              </div>
              <RankingTable game={game} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
