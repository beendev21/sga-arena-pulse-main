import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useApiController from "@/API/controler";
import { motion, AnimatePresence } from "framer-motion";
import { Bracket } from "@/components/sga/Bracket";

export const Route = createFileRoute("/bracket")({
  head: () => ({ meta: [{ title: "Chaveamento — SGA" }, { name: "description", content: "Chaveamento do campeonato em formato profissional." }] }),
  component: BracketPage,
});

function BracketPage() {
  const [game, setGame] = useState<"COUNTER-STRIKE 2" | "VALORANT" | "LEAGUE OF LEGENDS">("COUNTER-STRIKE 2");
  const { getAll: getTournaments } = useApiController("Tournaments");
  const { getAll: getMatches } = useApiController("Matches");

  const { result: tRaw = [] } = useQuery({ queryKey: ["tournaments"], queryFn: () => getTournaments() });
  const { result: mRaw = [] } = useQuery({ queryKey: ["matches"], queryFn: () => getMatches() });

  const tournamentsData = Array.isArray(tRaw) ? tRaw : tRaw?.result || [];
  const matchesData = Array.isArray(mRaw) ? mRaw : mRaw?.result || [];
  
  const filteredTournaments = useMemo(() => {
    return tournamentsData.filter((t: any) => t.game?.toUpperCase() === game.toUpperCase());
  }, [game, tournamentsData]);

  const [selectedTourneyId, setSelectedTourneyId] = useState<string>(filteredTournaments[0]?.id || "");
  const selectedMatches = useMemo(() => matchesData.filter((m: any) => m.tournamentId === selectedTourneyId), [matchesData, selectedTourneyId]);

  return (
    <div className="relative min-h-screen bg-[#06070a] overflow-hidden">
      {/* Background Layers */}
      <div className="absolute inset-0 grid-bg opacity-[0.05] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(248,109,131,0.06),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Massive Background Text */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 font-display text-[15rem] md:text-[25rem] font-black italic text-white/[0.01] select-none pointer-events-none tracking-tighter uppercase z-0">
        Bracket
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
            TOURNAMENT_FLOW_v2.0
          </div>
          
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl uppercase leading-[0.95] font-black italic tracking-tight text-white">
            Chaveamento de <span className="text-primary">Playoffs</span>.
          </h1>
          <p className="text-muted-foreground mt-4 text-base md:text-lg max-w-xl leading-relaxed font-medium">
            Acompanhe o caminho rumo ao título. Confrontos eliminatórios definidos com base na performance oficial.
          </p>
        </motion.div>

        {/* Game Tabs Navigation */}
        <div className="flex gap-4 sm:gap-10 mb-10 border-b border-white/5 pb-4 overflow-x-auto scrollbar-none items-center">
          <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] hidden sm:block italic mr-2">
            Select_Title_
          </span>
          {[
            { id: "COUNTER-STRIKE 2" as const, label: "CS2", color: "text-cs2" },
            { id: "VALORANT" as const, label: "VALORANT", color: "text-valorant" },
            { id: "LEAGUE OF LEGENDS" as const, label: "LoL", color: "text-lol" },
          ].map((g) => (
            <button
              key={g.id}
              onClick={() => {
                setGame(g.id);
              }}
              className={`font-display text-lg sm:text-2xl italic font-bold uppercase transition-all relative py-2 whitespace-nowrap px-1 tracking-tight ${
                game === g.id ? `${g.color} opacity-100` : "text-muted-foreground opacity-30 hover:opacity-60"
              }`}
            >
              {g.label}
              {game === g.id && (
                <motion.div 
                  layoutId="bracketGameTab" 
                  className="absolute bottom-0 left-0 right-0 h-[3px] bg-current shadow-[0_0_10px_currentColor]" 
                />
              )}
            </button>
          ))}
        </div>

        {/* Tournament Selector (Sub-navigation) */}
        <div className="flex flex-wrap gap-3 mb-12">
          {filteredTournaments.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTourneyId(t.id)}
              className={`px-4 py-2 border text-[10px] font-black uppercase italic tracking-widest transition-all ${
                selectedTourneyId === t.id
                  ? "bg-primary border-primary text-white shadow-[0_0_15px_rgba(248,109,131,0.3)]"
                  : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Bracket Container with HUD Accents */}
        <div className="relative group">
          <div className="absolute -top-4 -left-4 w-8 h-8 border-t border-l border-white/10 group-hover:border-primary/40 transition-colors" />
          <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b border-r border-white/10 group-hover:border-primary/40 transition-colors" />
          
          <div className="absolute top-0 right-0 p-4 text-[8px] font-black text-white/5 uppercase tracking-[0.4em] pointer-events-none">
            Live Bracket Sync // System Active
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedTourneyId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="rounded-none border border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md shadow-2xl p-4 md:p-8 overflow-x-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
            >
              <Bracket matches={selectedMatches} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
