import { memo, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useApiController from "../../API/controler";
import { TeamLogo } from "./TeamLogo";
import { unwrapList } from "@/lib/api";

const API_BASE = ((import.meta as any).env?.VITE_API_URL).replace(/\/$/, "");

type SortKey = "kd" | "kda" | "hs" | "kills" | "deaths" | "assists";
type SortDir = "desc" | "asc";

const defaultSortDir: Record<SortKey, SortDir> = {
  kd: "desc",
  kda: "desc",
  hs: "desc",
  kills: "desc",
  assists: "desc",
  deaths: "asc",
};

export const PlayerStatsTable = memo(function PlayerStatsTable({ limit = 40, game }: { limit?: number; game?: string }) {
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [minGames, setMinGames] = useState<number>(1);
  const [sortKey, setSortKey] = useState<SortKey>("kd");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDir(defaultSortDir[key]);
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
        String(p.playerName ?? "").toLowerCase().includes(q) ||
        String(p.playerNickname ?? "").toLowerCase().includes(q)
      );
    }

    if (teamFilter !== "all") {
      list = list.filter((p: any) => p.teamRelation?.teamName === teamFilter);
    }

    list = list.filter((p: any) => (p.wins + p.losses) >= minGames);

    list = [...list].sort((a: any, b: any) => {
      let va = 0, vb = 0;
      if (sortKey === "kd") {
        const aK = Number(a.playerStats?.totalKills ?? 0);
        const aD = Number(a.playerStats?.totalDeaths ?? 0);
        const bK = Number(b.playerStats?.totalKills ?? 0);
        const bD = Number(b.playerStats?.totalDeaths ?? 0);
        va = aD > 0 ? aK / aD : aK;
        vb = bD > 0 ? bK / bD : bK;
      } else if (sortKey === "kda") {
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
      }
      return sortDir === "desc" ? vb - va : va - vb;
    });

    return list.slice(0, limit);
  }, [allPlayers, search, teamFilter, minGames, sortKey, sortDir, limit]);

  if (l1 || l2) return <div className="p-8 text-center text-muted-foreground animate-pulse text-sm">Carregando jogadores...</div>;

  const sortArrow = (key: SortKey) => {
    if (sortKey !== key) return <span className="opacity-20 ml-1">↕</span>;
    return <span className="ml-1 text-primary">{sortDir === "desc" ? "↓" : "↑"}</span>;
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Barra de controles */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 px-1">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar jogador..."
          aria-label="Buscar jogador"
          className="w-full sm:flex-1 sm:min-w-[180px] rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
        <div className="flex gap-2">
          <select
            value={teamFilter}
            onChange={e => setTeamFilter(e.target.value)}
            aria-label="Filtrar por time"
            className="flex-1 rounded-md border border-white/10 bg-[#13131c] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            <option value="all" className="bg-[#13131c] text-foreground">Todos os times</option>
            {teamNames.map(name => (
              <option key={name} value={name} className="bg-[#13131c] text-foreground">{name}</option>
            ))}
          </select>

          <select
            value={minGames}
            onChange={e => setMinGames(Number(e.target.value))}
            aria-label="Mínimo de jogos"
            className="rounded-md border border-white/10 bg-[#13131c] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            <option value={1} className="bg-[#13131c] text-foreground">Mín. 1</option>
            <option value={3} className="bg-[#13131c] text-foreground">Mín. 3</option>
            <option value={5} className="bg-[#13131c] text-foreground">Mín. 5</option>
            <option value={10} className="bg-[#13131c] text-foreground">Mín. 10</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto ds-card">
        <table className="w-full text-sm min-w-[320px]">
          <thead className="bg-[var(--surface-3)] text-xs uppercase tracking-wide font-bold text-muted-foreground">
            <tr>
              <th className="px-3 sm:px-4 py-3 sm:py-4 text-left w-8 sm:w-12">#</th>
              <th className="px-3 sm:px-4 py-3 sm:py-4 text-left">Jogador</th>
              <th className="px-3 sm:px-4 py-3 sm:py-4 text-left hidden sm:table-cell">Time</th>
              <th
                className="px-3 sm:px-4 py-3 sm:py-4 text-right cursor-pointer select-none hover:text-foreground transition-colors"
                onClick={() => handleSort("kda")}
              >
                KDA{sortArrow("kda")}
              </th>
              <th
                className="px-3 sm:px-4 py-3 sm:py-4 text-right cursor-pointer select-none hover:text-foreground transition-colors hidden sm:table-cell"
                onClick={() => handleSort("kd")}
              >
                K/D{sortArrow("kd")}
              </th>
              <th
                className="px-3 sm:px-4 py-3 sm:py-4 text-right cursor-pointer select-none hover:text-foreground transition-colors hidden md:table-cell"
                onClick={() => handleSort("hs")}
              >
                HS%{sortArrow("hs")}
              </th>
              <th
                className="px-3 sm:px-4 py-3 sm:py-4 text-right cursor-pointer select-none hover:text-foreground transition-colors hidden md:table-cell"
                onClick={() => handleSort("kills")}
              >
                Kills{sortArrow("kills")}
              </th>
              <th
                className="px-3 sm:px-4 py-3 sm:py-4 text-right cursor-pointer select-none hover:text-foreground transition-colors hidden md:table-cell"
                onClick={() => handleSort("deaths")}
              >
                Deaths{sortArrow("deaths")}
              </th>
              <th
                className="px-3 sm:px-4 py-3 sm:py-4 text-right cursor-pointer select-none hover:text-foreground transition-colors hidden md:table-cell"
                onClick={() => handleSort("assists")}
              >
                Assists{sortArrow("assists")}
              </th>
            </tr>
          </thead>
          <tbody>
            {players.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  Nenhum jogador encontrado.
                </td>
              </tr>
            )}
            {players.map((p: any, i: number) => {
              const displayName = String(p.playerNickname || p.playerName || "?");
              const initials = displayName
                .split(/[\s#]/)
                .filter(Boolean)
                .slice(0, 2)
                .map((part: string) => part[0]?.toUpperCase() || "")
                .join("");
              const kills = Number(p.playerStats?.totalKills ?? 0);
              const deaths = Number(p.playerStats?.totalDeaths ?? 0);
              const kd = (deaths > 0 ? kills / deaths : kills).toFixed(2);
              const kda = Number(p.playerStats?.kda ?? 0).toFixed(2);
              const hs = Number(p.playerStats?.totalHSPercentage ?? 0).toFixed(1);
              return (
                <tr key={p.playerId} className="border-t border-white/[0.06] hover:bg-white/[0.03] transition">
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-display text-sm sm:text-base font-bold">
                    <span className={i < 3 ? "text-primary" : "text-muted-foreground"}>{i + 1}</span>
                  </td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                    <div className="flex items-center gap-2">
                      <div className="grid h-7 w-7 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/15 font-display text-xs font-bold text-primary">
                        {initials || "P"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-display text-xs sm:text-sm font-bold uppercase tracking-tight truncate">{displayName}</div>
                        {p.playerNickname && (
                          <div className="text-[10px] text-muted-foreground font-medium truncate hidden sm:block">{p.playerName}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 hidden sm:table-cell">
                    {p.teamDetails ? (
                      <div className="flex items-center gap-2">
                        <TeamLogo team={p.teamDetails} size={22} />
                        <span className="text-xs font-semibold truncate max-w-[100px]">{p.teamRelation?.teamName}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">{p.teamRelation?.teamName || "Sem equipe"}</span>
                    )}
                  </td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right font-display text-base sm:text-lg font-black text-primary">{kda}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right font-display text-sm sm:text-base font-bold text-foreground/70 hidden sm:table-cell">{kd}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right font-display text-sm sm:text-base font-bold text-foreground hidden md:table-cell">{hs}%</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right font-display text-sm sm:text-base font-bold hidden md:table-cell">{kills}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right font-display text-sm sm:text-base font-bold hidden md:table-cell">{deaths}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right font-display text-sm sm:text-base font-bold hidden md:table-cell">{p.playerStats?.totalAssists ?? 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});
