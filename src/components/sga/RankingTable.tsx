import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import useApiController from "../../API/controler";
import { TeamLogo } from "./TeamLogo";
import { Link } from "@tanstack/react-router";

export function RankingTable({ game }: { game: string }) {
  const api = useApiController("Teams");

  const { data: raw, isLoading: loading } = useQuery({
    queryKey: ["teams"],
    queryFn: () => api.getAll()
  });

  const parse = useCallback((r: any) => {
    if (!r) return [];
    return Array.isArray(r) ? r : (r?.data || r?.$values || []);
  }, []);

  const teams = useMemo(() => {
    const list = parse(raw);
    const filtered = list.filter((t: any) => 
      !game || t.game?.toUpperCase() === game.toUpperCase()
    );
    // Ordena por ELO para garantir que o ranking reflita a realidade competitiva
    return [...filtered].sort((a: any, b: any) => (b.elo || 0) - (a.elo || 0));
  }, [raw, game, parse]);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Buscando ranking...</div>;

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60 bg-card-grad">
      <table className="w-full text-sm min-w-[600px]">
        <thead className="bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left">#</th>
            <th className="px-4 py-3 text-left">Time</th>
            <th className="px-4 py-3 text-right">V</th>
            <th className="px-4 py-3 text-right">D</th>
            <th className="px-4 py-3 text-right">Saldo</th>
            <th className="px-4 py-3 text-right">Winrate</th>
            <th className="px-4 py-3 text-right">ELO</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t, i) => {
            const wr = Math.round((t.wins / Math.max(t.wins + t.losses, 1)) * 100);
            return (
              <tr key={t.id} className="border-t border-border/40 hover:bg-muted/30 transition">
                <td className="px-4 py-3 font-display">
                  <span className={i < 3 ? "text-primary" : "text-muted-foreground"}>{i + 1}</span>
                </td>
                <td className="px-4 py-3">
                  <Link to="/teams/$teamId" params={{ teamId: String(t.id) } as any} className="flex items-center gap-3 hover:text-primary">
                    <TeamLogo team={t} size={32} />
                    <span className="font-display">{t.name}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-right text-success">{t.wins}</td>
                <td className="px-4 py-3 text-right text-destructive">{t.losses}</td>
                <td className="px-4 py-3 text-right">{t.rounds_diff > 0 ? "+" : ""}{t.rounds_diff}</td>
                <td className="px-4 py-3 text-right">{wr}%</td>
                <td className="px-4 py-3 text-right font-display text-primary">{t.elo}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
