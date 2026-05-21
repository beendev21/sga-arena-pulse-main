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
    const map = new Map<number, { kills: number; deaths: number; assists: number; hs: number; matches: number }>();
    for (const stat of unwrapList(statsRaw) as any[]) {
      const playerId = Number(stat?.playerId);
      if (!playerId) continue;
      const current = map.get(playerId) || { kills: 0, deaths: 0, assists: 0, hs: 0, matches: 0 };
      current.kills += Number(stat?.kills) || 0;
      current.deaths += Number(stat?.deaths) || 0;
      current.assists += Number(stat?.assists) || 0;
      current.hs += Number(stat?.hsPercentage ?? stat?.hs) || 0;
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
          const stats = aggregateStats.get(Number(entry.playerId)) || { kills: 0, deaths: 0, assists: 0, hs: 0, matches: 0 };
          const kda = (stats.kills + stats.assists) / Math.max(stats.deaths, 1);
          return {
            ...entry,
            stats,
            kda,
            hs: stats.matches ? stats.hs / stats.matches : 0,
          };
        })
        .sort((a: any, b: any) => b.kda - a.kda)
        .slice(0, limit),
    [pRaw, tRaw, tpRaw, rolesRaw, aggregateStats, limit],
  );

  if (l1 || l2 || l3 || l4 || l5) return <div className="p-8 text-center text-muted-foreground animate-pulse text-sm">Carregando jogadores...</div>;

  return (
    <div className="overflow-x-auto ds-card">
      <table className="w-full text-sm min-w-[760px]">
        <thead className="bg-[var(--surface-3)] text-xs uppercase tracking-wide font-bold text-muted-foreground">
          <tr>
            <th className="px-4 py-4 text-left w-12">#</th>
            <th className="px-4 py-4 text-left">Jogador</th>
            <th className="px-4 py-4 text-left">Time</th>
            <th className="px-4 py-4 text-right">KDA</th>
            <th className="px-4 py-4 text-right">HS%</th>
            <th className="px-4 py-4 text-right">Kills</th>
            <th className="px-4 py-4 text-right">Deaths</th>
            <th className="px-4 py-4 text-right">Assists</th>
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
              <tr key={entry.id} className="border-t border-white/[0.06] hover:bg-white/[0.03] transition">
                <td className="px-4 py-3 font-display text-base font-bold">
                  <span className={i < 3 ? "text-primary" : "text-muted-foreground"}>{i + 1}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full border border-primary/30 bg-primary/15 font-display text-xs font-bold text-primary">
                      {initials || "P"}
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-sm font-bold uppercase tracking-tight truncate">{entry.playerName}</div>
                      <div className="text-xs text-muted-foreground font-medium">ID {entry.playerId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {entry.team ? (
                    <div className="flex items-center gap-2">
                      <TeamLogo team={entry.team} size={26} />
                      <span className="text-sm font-semibold">{entry.teamName || entry.teamTag}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Sem equipe</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-display text-lg font-black text-primary">
                  {Number(entry.kda || 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-display text-base font-bold text-foreground">
                  {Number(entry.hs || 0).toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-right font-display text-base font-bold">
                  {Number(entry.stats?.kills || 0)}
                </td>
                <td className="px-4 py-3 text-right font-display text-base font-bold">
                  {Number(entry.stats?.deaths || 0)}
                </td>
                <td className="px-4 py-3 text-right font-display text-base font-bold">
                  {Number(entry.stats?.assists || 0)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
