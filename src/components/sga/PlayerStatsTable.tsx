import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import useApiController from "../../API/controler";
import { TeamLogo } from "./TeamLogo";

export function PlayerStatsTable({ limit = 40, game }: { limit?: number; game?: string }) {
  const getPlayers = useApiController("Players");
  const getTeams = useApiController("Teams");

  const { data: pRaw, isLoading: l1 } = useQuery({
    queryKey: ["players"],
    queryFn: () => getPlayers.getAll({ includeAuth: false })
  });

  const { data: tRaw, isLoading: l2 } = useQuery({
    queryKey: ["teams"],
    queryFn: () => getTeams.getAll()
  });

  const parse = useCallback((r: any) => {
    if (!r) return [];
    return Array.isArray(r) ? r : (r?.result || []);
  }, []);

  const players = useMemo(() => parse(pRaw), [pRaw, parse]);
  const teams = useMemo(() => parse(tRaw), [tRaw, parse]);

  const filteredData = useMemo(() => {
    return players.filter((p: any) => {
      if (!game) return true;
      const targetGame = game.toUpperCase();
      if (p.game?.toUpperCase() === targetGame) return true;
      
      const team = teams.find((t: any) => String(t.id) === String(p.teamId));
      if (team && team.game?.toUpperCase() === targetGame) return true;
      
      return !p.game;
    }).slice(0, limit);
  }, [players, teams, game, limit]);

  if (l1 || l2) return <div className="p-8 text-center text-muted-foreground animate-pulse font-display uppercase tracking-widest italic">Acessando Dossiê de Atletas...</div>;

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60 bg-card-grad">
      <table className="w-full text-sm min-w-[820px]">
        <thead className="bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground">
          <tr>
            <th className="px-3 py-3 text-left">#</th>
            <th className="px-3 py-3 text-left">Jogador</th>
            <th className="px-3 py-3 text-left">Time</th>
            <th className="px-3 py-3 text-right">K</th>
            <th className="px-3 py-3 text-right">D</th>
            <th className="px-3 py-3 text-right">A</th>
            <th className="px-3 py-3 text-right">KDA</th>
            <th className="px-3 py-3 text-right">Defuse</th>
            <th className="px-3 py-3 text-right">Plant</th>
            <th className="px-3 py-3 text-right">HS%</th>
            <th className="px-3 py-3 text-right">Rating</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((p, i) => {
            const team = teams.find(t => String(t.id) === String(p.teamId));
            
            const kills = p.kills || 0;
            const assists = p.assists || 0;
            const deaths = p.deaths || 0;
            const kda = ((kills + assists) / Math.max(deaths, 1)).toFixed(2);
            return (
              <tr key={p.id} className="border-t border-border/40 hover:bg-muted/30 transition">
                <td className="px-3 py-2 font-display text-muted-foreground">{i + 1}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <img src={p.avatar} alt={p.nick} className="h-8 w-8 rounded-full ring-1 ring-primary/40" />
                    <div>
                      <div className="font-display">{p.nick}</div>
                      <div className="text-[10px] text-muted-foreground">{p.role}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  {team ? (
                    <div className="flex items-center gap-2">
                      <TeamLogo team={team} size={24} />
                      <span className="text-xs">{team.tag}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground italic">Sem Equipe</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">{kills}</td>
                <td className="px-3 py-2 text-right">{deaths}</td>
                <td className="px-3 py-2 text-right">{assists}</td>
                <td className="px-3 py-2 text-right">{kda}</td>
                <td className="px-3 py-2 text-right">{p.defuses || 0}</td>
                <td className="px-3 py-2 text-right">{p.plants || 0}</td>
                <td className="px-3 py-2 text-right">{p.hs || 0}%</td>
                <td className="px-3 py-2 text-right font-display text-primary">{(p.rating || 0).toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
