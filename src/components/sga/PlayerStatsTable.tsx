import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import useApiController from "../../API/controler";
import { TeamLogo } from "./TeamLogo";
import { buildPublicRoster } from "@/lib/publicApi";
import { unwrapList } from "@/lib/api";

export function PlayerStatsTable({ limit = 40, game }: { limit?: number; game?: string }) {
  const apiPlayers = useApiController("Players");
  const apiTeams = useApiController("Teams");
  const apiParticipants = useApiController("TeamParticipants");
  const apiRoles = useApiController("Roles");
  const apiPlayerMatchStats = useApiController("PlayerMatchStats");

  const { data: pRaw, isLoading: l1 } = useQuery({
    queryKey: ["players"],
    queryFn: () => apiPlayers.getAll({ includeAuth: false })
  });

  const { data: tRaw, isLoading: l2 } = useQuery({
    queryKey: ["teams"],
    queryFn: () => apiTeams.getAll({ includeAuth: false })
  });

  const { data: tpRaw, isLoading: l3 } = useQuery({
    queryKey: ["team-participants"],
    queryFn: () => apiParticipants.getAll({ includeAuth: false })
  });

  const { data: rolesRaw, isLoading: l4 } = useQuery({
    queryKey: ["roles"],
    queryFn: () => apiRoles.getAll({ includeAuth: false })
  });
  const { data: statsRaw, isLoading: l5 } = useQuery({
    queryKey: ["player-match-stats"],
    queryFn: () => apiPlayerMatchStats.getAll({ includeAuth: false })
  });

  const aggregateStats = useMemo(() => {
    const map = new Map<number, { kills: number; deaths: number; assists: number; matches: number }>();
    for (const stat of unwrapList(statsRaw) as any[]) {
      const playerId = Number(stat?.playerId);
      if (!playerId) continue;
      const current = map.get(playerId) || { kills: 0, deaths: 0, assists: 0, matches: 0 };
      current.kills += Number(stat?.kills) || 0;
      current.deaths += Number(stat?.deaths) || 0;
      current.assists += Number(stat?.assists) || 0;
      current.matches += 1;
      map.set(playerId, current);
    }
    return map;
  }, [statsRaw]);

  const roster = useMemo(
    () =>
      buildPublicRoster({
        playersRaw: pRaw,
        teamsRaw: tRaw,
        participantsRaw: tpRaw,
        rolesRaw,
      })
        .map((entry: any) => {
          const stats = aggregateStats.get(Number(entry.playerId)) || { kills: 0, deaths: 0, assists: 0, matches: 0 };
          const kda = (stats.kills + stats.assists) / Math.max(stats.deaths, 1);
          return {
            ...entry,
            stats,
            kda,
          };
        })
        .sort((a: any, b: any) => b.kda - a.kda)
        .slice(0, limit),
    [pRaw, tRaw, tpRaw, rolesRaw, aggregateStats, limit],
  );

  if (l1 || l2 || l3 || l4 || l5) return <div className="p-8 text-center text-muted-foreground animate-pulse font-display uppercase tracking-widest italic">Acessando Dossiê de Atletas...</div>;

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60 bg-card-grad">
      <table className="w-full text-sm min-w-[760px]">
        <thead className="bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground">
          <tr>
            <th className="px-3 py-3 text-left">#</th>
            <th className="px-3 py-3 text-left">Jogador</th>
            <th className="px-3 py-3 text-left">Time</th>
            <th className="px-3 py-3 text-left">KDA</th>
          </tr>
        </thead>
        <tbody>
          {roster.map((entry, i) => {
            const initials = String(entry.playerName || "?")
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part: string) => part[0]?.toUpperCase() || "")
              .join("");
            return (
              <tr key={entry.id} className="border-t border-border/40 hover:bg-muted/30 transition">
                <td className="px-3 py-2 font-display text-muted-foreground">{i + 1}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-full border border-primary/20 bg-primary/10 font-display text-[10px] text-primary">
                      {initials || "P"}
                    </div>
                    <div>
                      <div className="font-display">{entry.playerName}</div>
                      <div className="text-[10px] text-muted-foreground">ID {entry.playerId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  {entry.team ? (
                    <div className="flex items-center gap-2">
                      <TeamLogo team={entry.team} size={24} />
                      <span className="text-xs">{entry.teamName || entry.teamTag}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground italic">Sem equipe</span>
                  )}
                </td>
                <td className="px-3 py-2 font-display text-primary">
                  {Number(entry.kda || 0).toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
