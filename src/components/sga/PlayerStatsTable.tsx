import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useApiController from "../../API/controler";
import { TeamLogo } from "./TeamLogo";
import { unwrapList } from "@/lib/api";

const API_BASE = ((import.meta as any).env?.VITE_API_URL || "https://app.santos-games.com").replace(/\/$/, "");

type SortKey = "kda" | "hs" | "kills" | "deaths" | "assists" | "winRate";
type SortDir = "desc" | "asc";

export function PlayerStatsTable({ limit = 40, game }: { limit?: number; game?: string }) {
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [minGames, setMinGames] = useState<number>(1);
  const [sortKey, setSortKey] = useState<SortKey>("kda");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const apiTeams = useApiController("Teams");

  const { data: teamsRaw, isLoading: l1 } = useQuery({
    queryKey: ["teams"],
    queryFn: () => apiTeams.getAll({ includeAuth: false })
  });

  const { data: rankingRaw, isLoading: l2 } = useQuery({
    queryKey: ["ranking-player-per-game"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/Games/GetRankingPlayerPerGame`);
      return res.json();
    }
  });

  const allPlayers = useMemo(() => {
    const teamsMap = new Map<number, any>();
    for (const t of unwrapList(teamsRaw)) {
      teamsMap.set(Number(t.id), t);
    }
    const list = Array.isArray(rankingRaw?.result) ? rankingRaw.result : [];
    return list.map((p: any) => ({
      ...p,
      teamDetails: teamsMap.get(Number(p.teamRelation?.teamId)),
    }));
  }, [teamsRaw, rankingRaw]);

  const teamNames = useMemo(() => {
    const names = new Set<string>();
    for (const p of allPlayers) {
      const name = p.teamRelation?.teamName;
      if (name) names.add(name);
    }
    return Array.from(names).sort();
  }, [allPlayers]);

  const players = useMemo(() => {
    let list = allPlayers;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p: any) =>
        String(p.playerName ?? "").toLowerCase().includes(q)
      );
    }

    if (teamFilter !== "all") {
      list = list.filter((p: any) => p.teamRelation?.teamName === teamFilter);
    }

    list = list.filter((p: any) => (p.wins + p.losses) >= minGames);

    list = [...list].sort((a: any, b: any) => {
      let va = 0, vb = 0;
      if (sortKey === "kda") {
        va = Number(a.playerStats?.kda ?? 0);
        vb = Number(b.playerStats?.kda ?? 0);
      } else if (sortKey === "hs") {
        va = Number(a.playerStats?.totalHSPercentage ?? 0);
        vb = Number(b.playerStats?.totalHSPercentage ?? 0);
      } else if (sortKey === "kills") {
        va = Number(a.playerStats?.totalKills ?? 0);
        vb = Number(b.playerStats?.totalKills ?? 0);
      } else if (sortKey === "deaths") {
        va = Number(a.playerStats?.totalDeaths ?? 0);
        vb = Number(b.playerStats?.totalDeaths ?? 0);
      } else if (sortKey === "assists") {
        va = Number(a.playerStats?.totalAssists ?? 0);
        vb = Number(b.playerStats?.totalAssists ?? 0);
      } else if (sortKey === "winRate") {
        const totalA = a.wins + a.losses;
        const totalB = b.wins + b.losses;
        va = totalA > 0 ? a.wins / totalA : 0;
        vb = totalB > 0 ? b.wins / totalB : 0;
      }
      return sortDir === "desc" ? vb - va : va - vb;
    });

    return list.slice(0, limit);
  }, [allPlayers, search, teamFilter, minGames, sortKey, sortDir, limit]);

  if (l1 || l2) return <div className="p-8 text-center text-muted-foreground animate-pulse text-sm">Carregando jogadores...</div>;

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
          {players.map((p: any, i: number) => {
            const initials = String(p.playerName || "?")
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part: string) => part[0]?.toUpperCase() || "")
              .join("");
            const kda = Number(p.playerStats?.kda ?? 0).toFixed(2);
            const hs = Number(p.playerStats?.totalHSPercentage ?? 0).toFixed(1);
            return (
              <tr key={p.playerId} className="border-t border-white/[0.06] hover:bg-white/[0.03] transition">
                <td className="px-4 py-3 font-display text-base font-bold">
                  <span className={i < 3 ? "text-primary" : "text-muted-foreground"}>{i + 1}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full border border-primary/30 bg-primary/15 font-display text-xs font-bold text-primary">
                      {initials || "P"}
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-sm font-bold uppercase tracking-tight truncate">{p.playerName}</div>
                      <div className="text-xs text-muted-foreground font-medium">{p.wins}V {p.losses}D</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {p.teamDetails ? (
                    <div className="flex items-center gap-2">
                      <TeamLogo team={p.teamDetails} size={26} />
                      <span className="text-sm font-semibold">{p.teamRelation?.teamName}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">{p.teamRelation?.teamName || "Sem equipe"}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-display text-lg font-black text-primary">{kda}</td>
                <td className="px-4 py-3 text-right font-display text-base font-bold text-foreground">{hs}%</td>
                <td className="px-4 py-3 text-right font-display text-base font-bold">{p.playerStats?.totalKills ?? 0}</td>
                <td className="px-4 py-3 text-right font-display text-base font-bold">{p.playerStats?.totalDeaths ?? 0}</td>
                <td className="px-4 py-3 text-right font-display text-base font-bold">{p.playerStats?.totalAssists ?? 0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
