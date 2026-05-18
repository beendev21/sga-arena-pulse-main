import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import useApiController from "@/API/controler";
import { MatchCard } from "@/components/sga/MatchCard";

interface Match {
  id: string;
  status: "Ao vivo" | "Agendada" | "Encerrada";
  teamA: { name: string; tag: string; logo?: string };
  teamB: { name: string; tag: string; logo?: string };
  scoreA: number;
  scoreB: number;
  map: string;
  startsAt: string;
  tournamentName: string;
}

export const Route = createFileRoute("/matches")({
  head: () => ({ meta: [{ title: "Partidas — SGA" }, { name: "description", content: "Partidas ao vivo, agendadas e encerradas na SGA." }] }),
  component: MatchesPage,
});

const tabs: Match["status"][] = ["Ao vivo", "Agendada", "Encerrada"];

function MatchesPage() {
  
  return (
    <div className="relative min-h-screen bg-[#06070a] overflow-hidden">
      {/* Background Layers */}
      <div className="absolute inset-0 grid-bg opacity-[0.05] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(248,109,131,0.06),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Massive Background Text */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 font-display text-[15rem] md:text-[25rem] font-black italic text-white/[0.01] select-none pointer-events-none tracking-tighter uppercase z-0">
        Schedule
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
            MATCH_MONITOR_v2.0
          </div>
          
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl uppercase leading-[0.95] font-black italic tracking-tight text-white">
            Calendário de <span className="text-primary">Confrontos</span>.
          </h1>
          <p className="text-muted-foreground mt-4 text-base md:text-lg max-w-xl leading-relaxed font-medium">
            Acompanhe em tempo real as transmissões, agendamentos e resultados históricos da Santos Games Arena.
          </p>
        </motion.div>

        {/* Tactical Status Tabs */}
        <div className="flex gap-4 sm:gap-10 mb-12 border-b border-white/5 pb-4 overflow-x-auto scrollbar-none items-center">
          <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] hidden sm:block italic mr-2">
            Status_Filter_
          </span>
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`font-display text-lg sm:text-2xl italic font-bold uppercase transition-all relative py-2 whitespace-nowrap px-1 tracking-tight ${
                tab === t ? "text-primary opacity-100" : "text-muted-foreground opacity-30 hover:opacity-60"
              }`}
            >
              {t}
              {tab === t && (
                <motion.div 
                  layoutId="matchTab" 
                  className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary shadow-[0_0:10px_var(--primary)]" 
                />
              )}
            </button>
          ))}
        </div>

        {/* Matches Grid Container */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div 
              key={tab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="grid md:grid-cols-2 gap-6"
            >
              {list.length ? list.map((m) => <MatchCard key={m.id} m={m} />) :
                <div className="col-span-2 h-64 flex items-center justify-center border border-dashed border-white/10 text-muted-foreground text-[10px] uppercase tracking-[0.4em] italic">Nenhum sinal detectado nesta categoria_</div>}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
