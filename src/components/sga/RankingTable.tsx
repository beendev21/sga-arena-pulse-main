import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import useApiController from "../../API/controler";
import { TeamLogo } from "./TeamLogo";
import { Link } from "@tanstack/react-router";
import { normalizeGame, type GameLabel } from "@/lib/game";
import { unwrapList } from "@/lib/api";

const API_BASE = ((import.meta as any).env?.VITE_API_URL || "https://app.santos-games.com").replace(/\/$/, "");

export function RankingTable({ game }: { game: string }) {
  const api = useApiController("Teams");

  const { data: teamsRaw, isLoading: loading } = useQuery({
    queryKey: ["teams"],
    queryFn: () => api.getAll({ includeAuth: false })
  });

  const { data: rankingRaw } = useQuery({
    queryKey: ["ranking-team-per-game"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/Games/GetRankingTeamPerGame`);
      return res.json();
    }
  });

  const teams = useMemo(() => {
    const teamsMap = new Map<number, any>();
    for (const t of unwrapList(teamsRaw)) {
      teamsMap.set(Number(t.id), t);
    }

    const rankingData = Array.isArray(rankingRaw?.result) ? rankingRaw.result : [];
    const gameEntry = rankingData.find((g: any) => normalizeGame(g.gameName) === (game as GameLabel));

    if (!gameEntry || !gameEntry.teamRankings?.length) return [];

    return gameEntry.teamRankings.map((r: any) => ({
      ...teamsMap.get(Number(r.teamId)),
      id: r.teamId,
      name: r.teamName,
      wins: r.wins,
      losses: r.losses,
      winRate: r.winRate,
    }));
  }, [teamsRaw, rankingRaw, game]);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Buscando ranking...</div>;

  if (!teams.length) return <div className="p-8 text-center text-muted-foreground text-sm">Nenhum time encontrado para este jogo.</div>;

  return (
    <div className="overflow-x-auto ds-card">
      <table className="w-full text-sm min-w-[600px]">
        <thead className="bg-[var(--surface-3)] text-xs uppercase tracking-wide font-bold text-muted-foreground">
          <tr>
            <th className="px-4 py-4 text-left w-12">#</th>
            <th className="px-4 py-4 text-left">Time</th>
            <th className="px-4 py-4 text-right">V</th>
            <th className="px-4 py-4 text-right">D</th>
            <th className="px-4 py-4 text-right">Saldo</th>
            <th className="px-4 py-4 text-right">Winrate</th>
            <th className="px-4 py-4 text-right">ELO</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t, i) => {
            const wr = Math.round((t.winRate ?? 0) * 100);
            const saldo = (t.wins ?? 0) - (t.losses ?? 0);
            return (
              <tr key={t.id} className="border-t border-white/[0.06] hover:bg-white/[0.03] transition">
                <td className="px-4 py-4 font-display text-lg font-black">
                  <span className={i < 3 ? "text-primary" : "text-muted-foreground"}>{i + 1}</span>
                </td>
                <td className="px-4 py-4">
                  <Link to="/teams/$teamId" params={{ teamId: String(t.id) } as any} className="flex items-center gap-3 hover:text-primary transition-colors">
                    <TeamLogo team={t} size={36} />
                    <span className="font-display text-base font-bold uppercase tracking-tight">{t.name}</span>
                  </Link>
                </td>
                <td className="px-4 py-4 text-right text-success font-bold">{t.wins ?? 0}</td>
                <td className="px-4 py-4 text-right text-destructive font-bold">{t.losses ?? 0}</td>
                <td className="px-4 py-4 text-right font-semibold">{saldo > 0 ? "+" : ""}{saldo}</td>
                <td className="px-4 py-4 text-right font-semibold">{wr}%</td>
                <td className="px-4 py-4 text-right font-display text-lg font-black text-primary">{t.elo ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
