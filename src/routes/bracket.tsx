import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useApiController from "@/API/controler";
import { motion, AnimatePresence } from "framer-motion";
import { Bracket } from "@/components/sga/Bracket";
import { buildPublicMatches } from "@/lib/publicApi";
import { unwrapList } from "@/lib/api";

type TournamentListItem = {
  id: string | number;
  game?: string;
  bracketType?: string;
  format?: string;
  name?: string;
};

export const Route = createFileRoute("/bracket")({
  head: () => ({
    meta: [
      { title: "Chaveamento — SGA" },
      { name: "description", content: "Chaveamento do campeonato em formato profissional." },
    ],
  }),
  component: BracketPage,
});

function BracketPage() {
  const { getAll: getTournaments } = useApiController("Tournaments");
  const { getAll: getMatches } = useApiController("Matches");
  const { getAll: getMatchTeams } = useApiController("Matchteams");
  const { getAll: getTeams } = useApiController("Teams");
  const { getAll: getStatus } = useApiController("Status");
  const { getAll: getStages } = useApiController("Stages");

  const { data: tRaw = [] } = useQuery({
    queryKey: ["tournaments"],
    queryFn: () => getTournaments({ includeAuth: false }),
  });
  const { data: mRaw = [] } = useQuery({
    queryKey: ["matches"],
    queryFn: () => getMatches({ includeAuth: false }),
  });
  const { data: mtRaw = [] } = useQuery({
    queryKey: ["matchteams"],
    queryFn: () => getMatchTeams({ includeAuth: false }),
  });
  const { data: teamsRaw = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: () => getTeams({ includeAuth: false }),
  });
  const { data: statusRaw = [] } = useQuery({
    queryKey: ["status"],
    queryFn: () => getStatus({ includeAuth: false }),
  });
  const { data: stagesRaw = [] } = useQuery({
    queryKey: ["stages"],
    queryFn: () => getStages({ includeAuth: false }),
  });

  const tournamentsData = useMemo(
    () => unwrapList<TournamentListItem>(tRaw),
    [tRaw],
  );
  const matchesData = useMemo(
    () =>
      buildPublicMatches({
        matchesRaw: mRaw,
        matchTeamsRaw: mtRaw,
        teamsRaw,
        tournamentsRaw: tRaw,
        statusRaw,
        stagesRaw,
      }),
    [mRaw, mtRaw, teamsRaw, tRaw, statusRaw, stagesRaw],
  );

  const filteredTournaments = tournamentsData;

  const [selectedTourneyId, setSelectedTourneyId] = useState<string>(
    String(filteredTournaments[0]?.id || ""),
  );
  const selectedTournament = useMemo(
    () => filteredTournaments.find((t: any) => String(t.id) === String(selectedTourneyId)),
    [filteredTournaments, selectedTourneyId],
  );
  const selectedMatches = useMemo(
    () => matchesData.filter((m: any) => String(m.tournamentId) === String(selectedTourneyId)) as any[],
    [matchesData, selectedTourneyId],
  );
  useEffect(() => {
    if (filteredTournaments.length === 0) return;
    if (
      !selectedTourneyId ||
      !filteredTournaments.some((t) => String(t.id) === String(selectedTourneyId))
    ) {
      setSelectedTourneyId(String(filteredTournaments[0]?.id || ""));
    }
  }, [filteredTournaments, selectedTourneyId]);

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

        

          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl uppercase leading-[0.95] font-black italic tracking-tight text-white">
            Chaveamento de <span className="text-primary">Playoffs</span>.
          </h1>
          <p className="text-muted-foreground mt-4 text-base md:text-lg max-w-xl leading-relaxed font-medium">
            Acompanhe o caminho rumo ao título. Confrontos eliminatórios definidos com base na
            performance oficial.
          </p>
        </motion.div>

        {/* Tournament Selector (Sub-navigation) */}
        <div className="flex flex-wrap gap-3 mb-12">
          {filteredTournaments.map((t) => (
            <button
              key={String(t.id)}
              onClick={() => setSelectedTourneyId(String(t.id))}
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
            Live Bracket Sync // Public API
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
              {selectedTournament ? (
                <Bracket matches={selectedMatches} bracketType={selectedTournament.bracketType || selectedTournament.format} />
              ) : (
                <div className="p-8 text-center text-muted-foreground">Selecione um campeonato.</div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
