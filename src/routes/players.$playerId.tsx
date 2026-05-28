import { createFileRoute, Link } from "@tanstack/react-router";
import { ogMeta } from "@/lib/og";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import useApiController from "@/API/controler";
import { TeamLogo } from "@/components/sga/TeamLogo";
import { MatchCard } from "@/components/sga/MatchCard";
import { StatsCard } from "@/components/sga/StatsCard";
import { Trophy, Target, Crosshair, Zap, ChevronLeft, Star, Activity, History } from "lucide-react";
import { buildPublicMatches, buildPublicRoster } from "@/lib/publicApi";
import { unwrapList } from "@/lib/api";

export const Route = createFileRoute("/players/$playerId")({
  head: () => ({ meta: ogMeta({ title: "Perfil do Jogador — SGA", description: "Estatísticas individuais, KDA, K/D e histórico de partidas na Santos Games Arena.", path: "/players" }) }),
  component: PlayerProfilePage,
});

function PlayerProfilePage() {
  const { playerId } = Route.useParams();
  const apiPlayers = useApiController("Players");
  const apiTeams = useApiController("Teams");
  const apiMatches = useApiController("Matches");
  const apiMatchTeams = useApiController("Matchteams");
  const apiParticipants = useApiController("TeamParticipants");
  const apiRoles = useApiController("Roles");
  const apiPlayerMatchStats = useApiController("PlayerMatchStats");
  const apiGameAccounts = useApiController("GameAccounts");
  const apiTournaments = useApiController("Tournaments");
  const apiStatus = useApiController("Status");
  const apiStages = useApiController("Stages");

  const { data: playerRaw, isLoading: l1 } = useQuery({
    queryKey: ["player", playerId],
    queryFn: () => apiPlayers.getById(playerId, { includeAuth: false }),
  });

  const { data: playersListRaw, isLoading: l1b } = useQuery({
    queryKey: ["players"],
    queryFn: () => apiPlayers.getAll({ includeAuth: false }),
  });

  const { data: teamsRaw, isLoading: l2 } = useQuery({
    queryKey: ["teams"],
    queryFn: () => apiTeams.getAll({ includeAuth: false }),
  });

  const { data: matchesRaw, isLoading: l3 } = useQuery({
    queryKey: ["matches"],
    queryFn: () => apiMatches.getAll({ includeAuth: false }),
  });

  const { data: participantsRaw, isLoading: l4 } = useQuery({
    queryKey: ["team-participants"],
    queryFn: () => apiParticipants.getAll({ includeAuth: false }),
  });

  const { data: rolesRaw, isLoading: l5 } = useQuery({
    queryKey: ["roles"],
    queryFn: () => apiRoles.getAll({ includeAuth: false }),
  });

  const { data: matchStatsRaw, isLoading: l6 } = useQuery({
    queryKey: ["player-match-stats"],
    queryFn: () => apiPlayerMatchStats.getAll({ includeAuth: false }),
  });

  const { data: gameAccountsRaw } = useQuery({
    queryKey: ["game-accounts"],
    queryFn: () => apiGameAccounts.getAll({ includeAuth: false }),
  });

  const { data: tournamentsRaw } = useQuery({
    queryKey: ["tournaments"],
    queryFn: () => apiTournaments.getAll({ includeAuth: false }),
  });

  const { data: matchTeamsRaw } = useQuery({
    queryKey: ["matchteams"],
    queryFn: () => apiMatchTeams.getAll({ includeAuth: false }),
  });

  const { data: statusRaw } = useQuery({
    queryKey: ["status"],
    queryFn: () => apiStatus.getAll({ includeAuth: false }),
  });

  const { data: stagesRaw } = useQuery({
    queryKey: ["stages"],
    queryFn: () => apiStages.getAll({ includeAuth: false }),
  });

  const player = useMemo(() => {
    if (!playerRaw) return null;
    if (Array.isArray(playerRaw)) return playerRaw[0] ?? null;
    if (Array.isArray(playerRaw?.result)) return playerRaw.result[0] ?? null;
    if (Array.isArray(playerRaw?.data)) return playerRaw.data[0] ?? null;
    return playerRaw?.result ?? playerRaw?.data ?? playerRaw ?? null;
  }, [playerRaw]);

  const roster = useMemo(
    () =>
      buildPublicRoster({
        playersRaw: playersListRaw,
        teamsRaw,
        participantsRaw,
        rolesRaw,
      }),
    [playersListRaw, teamsRaw, participantsRaw, rolesRaw],
  );

  const playerEntry = useMemo(
    () =>
      roster.find(
        (entry: any) =>
          String(entry.playerId) === String(playerId) ||
          String(entry.player?.id) === String(playerId) ||
          String(entry.player?.userId) === String(playerId),
      ) || null,
    [roster, playerId],
  );

  const playerTeam = playerEntry?.team || null;
  const playerName = String(player?.name || playerEntry?.playerName || `Player #${playerId}`);
  const playerAccount = useMemo(
    () => unwrapList(gameAccountsRaw).find((account: any) => String(account.playerId) === String(playerId)),
    [gameAccountsRaw, playerId],
  );

  const playerStats = useMemo(() => {
    const list = unwrapList(matchStatsRaw).filter((entry: any) => String(entry.playerId) === String(playerId));
    const totals = list.reduce(
      (acc: any, stat: any) => {
        acc.kills += Number(stat.kills) || 0;
        acc.deaths += Number(stat.deaths) || 0;
        acc.assists += Number(stat.assists) || 0;
        acc.adr += Number(stat.adr) || 0;
        acc.hs += Number(stat.hsPercentage ?? stat.hs) || 0;
        acc.firstKills += Number(stat.firstKills) || 0;
        acc.kast += Number(stat.kast) || 0;
        acc.acs += Number(stat.acs) || 0;
        acc.count += 1;
        return acc;
      },
      { kills: 0, deaths: 0, assists: 0, adr: 0, hs: 0, firstKills: 0, kast: 0, acs: 0, count: 0 },
    );

    const avg = (value: number) => (totals.count ? value / totals.count : 0);
    return {
      matches: totals.count,
      kills: totals.kills,
      deaths: totals.deaths,
      assists: totals.assists,
      kda: (totals.kills + totals.assists) / Math.max(totals.deaths, 1),
      adr: avg(totals.adr),
      hs: avg(totals.hs),
      firstKills: totals.firstKills,
      kast: avg(totals.kast),
      acs: avg(totals.acs),
    };
  }, [matchStatsRaw, playerId]);

  const recentMatches = useMemo(() => {
    if (!playerTeam) return [];
    return buildPublicMatches({
      matchesRaw,
      matchTeamsRaw,
      teamsRaw,
      tournamentsRaw,
      statusRaw,
      stagesRaw,
    })
      .filter(
        (match: any) =>
          String(match.teamA?.id) === String(playerTeam.id) || String(match.teamB?.id) === String(playerTeam.id),
      )
      .slice(0, 5);
  }, [matchesRaw, matchTeamsRaw, teamsRaw, tournamentsRaw, statusRaw, stagesRaw, playerTeam]);

  if (l1 || l1b || l2 || l3 || l4 || l5 || l6) {
    return <div className="p-20 text-center font-display uppercase animate-pulse">Sincronizando dossiê do agente...</div>;
  }

  if (!player) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#06070a]">
        <h1 className="font-display text-4xl font-black italic text-white uppercase">Identidade não encontrada</h1>
        <Link to="/players" className="mt-6 text-primary hover:underline uppercase tracking-widest text-xs">
          ← Voltar para a base de dados
        </Link>
      </div>
    );
  }

  const initials = String(playerName || "P")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase() || "")
    .join("");

  return (
    <div className="relative min-h-screen bg-[#06070a] overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-[0.05] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(248,109,131,0.06),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="absolute top-20 left-1/2 -translate-x-1/2 font-display text-[15rem] md:text-[25rem] font-black italic text-white/[0.01] select-none pointer-events-none tracking-tighter uppercase z-0">
        Profile
      </div>

      <div className="relative z-10 mx-auto max-w-[1500px] px-4 py-12 md:py-20">
        <Link to="/players" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-colors mb-12 italic group">
          <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back_to_Database
        </Link>

        <div className="grid lg:grid-cols-[450px_1fr] gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="relative p-8 border border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 text-[8px] font-black text-white/10 uppercase tracking-[0.4em]">
                ID_ENCRYPTED // VERIFIED
              </div>

              <div className="relative flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative w-48 h-48 border-2 border-white/5 group-hover:border-primary transition-colors duration-500 overflow-hidden">
                    <div className="w-full h-full grid place-items-center bg-card-grad">
                      <span className="font-display text-5xl text-primary">{initials || "P"}</span>
                    </div>
                  </div>
                </div>

                <h1 className="font-display text-5xl font-black italic text-white uppercase tracking-tighter">
                  {playerEntry?.playerName || playerName}
                </h1>
                {playerTeam && (
                  <Link
                    to="/teams/$teamId"
                    params={{ teamId: String(playerTeam.id) } as any}
                    className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-all mb-8"
                  >
                    <TeamLogo team={playerTeam} size={24} />
                    <span className="text-[10px] font-black text-white uppercase italic tracking-widest">
                      {playerTeam.name || playerTeam.tag || "Sem equipe"}
                    </span>
                  </Link>
                )}
                {!playerTeam && (
                  <div className="mb-8 text-[10px] font-black uppercase italic tracking-widest text-white/40">
                    Sem equipe vinculada
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Nome Civil</span>
                  <span className="text-xs font-bold text-white uppercase italic text-right">{playerName}</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Conta de Jogo</span>
                  <span className="text-xs font-bold text-white uppercase italic text-right">{playerAccount?.externalAccountId || playerAccount?.nickname || "Sem conta vinculada"}</span>
                </div>
              </div>

              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/40" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary/40" />
            </div>

            <div className="p-6 border border-white/5 bg-primary/5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 text-primary">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-[8px] font-black text-primary uppercase tracking-widest">KDA</div>
                  <div className="text-[10px] font-bold text-white uppercase italic">
                    {(playerStats.kda || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard label="Kills" value={playerStats.kills} icon={Crosshair} accent />
              <StatsCard label="Deaths" value={playerStats.deaths} icon={Target} />
              <StatsCard label="Assists" value={playerStats.assists} icon={Zap} />
              <StatsCard label="Partidas" value={playerStats.matches} icon={Star} />
            </div>

            <div className="space-y-8">
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <History className="text-primary w-5 h-5" />
                  <h3 className="font-display text-2xl uppercase italic font-black text-white leading-none">
                    Histórico de <span className="text-primary">Missões</span>
                  </h3>
                </div>
                <div className="grid gap-4">
                  {recentMatches.map((m) => (
                    <MatchCard key={m.id} m={m} />
                  ))}
                  {recentMatches.length === 0 && (
                    <div className="h-32 flex items-center justify-center border border-dashed border-white/5 text-[10px] text-white/20 uppercase tracking-[0.4em] italic">
                      Nenhum registro de combate encontrado_
                    </div>
                  )}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <Trophy className="text-primary w-5 h-5" />
                  <h3 className="font-display text-2xl uppercase italic font-black text-white leading-none">
                    Service <span className="text-primary">Record</span>
                  </h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { event: "HS%", result: `${playerStats.hs.toFixed(1)}%`, date: "PÚBLICO", icon: ShieldCheck, color: "text-primary" },
                    { event: "ADR", result: playerStats.adr.toFixed(1), date: "PÚBLICO", icon: Trophy, color: "text-warning" },
                  ].map((award, i) => (
                    <div key={i} className="p-5 bg-white/[0.02] border border-white/5 flex items-center gap-5 group/award hover:border-primary/20 transition-all">
                      <div className={`p-3 bg-white/5 ${award.color} group-hover/award:scale-110 transition-transform`}>
                        <award.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-white uppercase italic tracking-widest">{award.event}</div>
                        <div className="text-[9px] text-muted-foreground uppercase">{award.result} - {award.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
