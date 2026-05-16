import { useState, useMemo, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import useApiController from "@/API/controler";
import { TeamCard } from "@/components/sga/TeamCard";

export const Route = createFileRoute("/teams")({
  head: () => ({ meta: [{ title: "Times — SGA" }, { name: "description", content: "Conheça os times da SGA: estatísticas, ELO, vitórias e troféus." }] }),
  component: TeamsList,
});

function TeamsList() {
  const [game, setGame] = useState<"COUNTER-STRIKE 2" | "VALORANT" | "LEAGUE OF LEGENDS">("COUNTER-STRIKE 2");
  const apiTeams = useApiController("Teams");

  const { data: tRaw, isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: () => apiTeams.getAll()
  });

  const parse = useCallback((r: any) => {
    if (!r) return [];
    return Array.isArray(r) ? r : (r?.data || r?.$values || []);
  }, []);

  const teams = useMemo(() => parse(tRaw), [tRaw, parse]);
  
  const filteredTeams = useMemo(() => {
    return teams.filter(t => (t as any).game?.toUpperCase() === game.toUpperCase());
  }, [teams, game]);

  if (isLoading) return <div className="p-20 text-center font-display uppercase animate-pulse italic">Escaneando frequenze da Arena...</div>;

  return (
    <div className="relative min-h-screen bg-[#06070a] overflow-hidden">
      {/* Background Layers */}
      <div className="absolute inset-0 grid-bg opacity-[0.05] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,70,85,0.06),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Massive Background Text */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 font-display text-[15rem] md:text-[25rem] font-black italic text-white/[0.01] select-none pointer-events-none tracking-tighter uppercase z-0">
        Squads
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
            TEAM_HUB_v2.0
          </div>
          
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl uppercase leading-[0.95] font-black italic tracking-tight text-white">
            Conheça os <span className="text-primary">Times</span> <br />
            da <span className="text-white/30">Arena</span>.
          </h1>
          <p className="text-muted-foreground mt-4 text-base md:text-lg max-w-xl leading-relaxed font-medium">
            Os melhores esquadrões da região em busca do topo. Estatísticas e ELO atualizados com base no desempenho competitivo.
          </p>
        </motion.div>

        {/* Game Tabs Navigation */}
        <div className="flex gap-4 sm:gap-10 mb-12 border-b border-white/5 pb-4 overflow-x-auto scrollbar-none items-center">
          <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] hidden sm:block italic mr-2">
            Module_Select_
          </span>
          {[
            { id: "COUNTER-STRIKE 2" as const, label: "CS2", color: "text-cs2" },
            { id: "VALORANT" as const, label: "VALORANT", color: "text-valorant" },
            { id: "LEAGUE OF LEGENDS" as const, label: "LoL", color: "text-lol" },
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
                  layoutId="teamGameTab" 
                  className="absolute bottom-0 left-0 right-0 h-[3px] bg-current shadow-[0_0_10px_currentColor]" 
                />
              )}
            </button>
          ))}
        </div>

        {/* Teams Grid Container */}
        <div className="relative">
          {/* HUD Accents */}
          <div className="absolute -top-4 -left-4 w-10 h-10 border-t border-l border-white/10" />
          <div className="absolute -bottom-4 -right-4 w-10 h-10 border-b border-r border-white/10" />

          <AnimatePresence mode="wait">
            <motion.div 
              key={game}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {filteredTeams.map((t, i) => (
                <TeamCard key={t.id} team={t} rank={i + 1} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
