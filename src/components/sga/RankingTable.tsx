import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import useApiController from "../../API/controler";
import { TeamLogo } from "./TeamLogo";
import { Link } from "@tanstack/react-router";
import { matchesGame, type GameLabel } from "@/lib/game";
import { unwrapList } from "@/lib/api";

export function RankingTable({ game }: { game: string }) {
  const api = useApiController("Teams");

  const { data: raw, isLoading: loading } = useQuery({
    queryKey: ["teams"],
    queryFn: () => api.getAll({ includeAuth: false })
  });

  const parse = useCallback((r: any) => unwrapList(r), []);

  const teams = useMemo(() => {
    const list = parse(raw);
    const filtered = list.filter((t: any) => 
      !game || matchesGame(t.game, game as GameLabel)
    );
    if (filtered.length === 0) return [...list].sort((a: any, b: any) => (b.elo || 0) - (a.elo || 0));
    // Ordena por ELO para garantir que o ranking reflita a realidade competitiva
    return [...filtered].sort((a: any, b: any) => (b.elo || 0) - (a.elo || 0));
  }, [raw, game, parse]);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Buscando ranking...</div>;

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
            const wins = Number(t.wins) || 0;
            const losses = Number(t.losses) || 0;
            const wr = Math.round((wins / Math.max(wins + losses, 1)) * 100);
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
                <td className="px-4 py-4 text-right text-success font-bold">{wins}</td>
                <td className="px-4 py-4 text-right text-destructive font-bold">{losses}</td>
                <td className="px-4 py-4 text-right font-semibold">{t.rounds_diff > 0 ? "+" : ""}{t.rounds_diff}</td>
                <td className="px-4 py-4 text-right font-semibold">{wr}%</td>
                <td className="px-4 py-4 text-right font-display text-lg font-black text-primary">{t.elo}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
